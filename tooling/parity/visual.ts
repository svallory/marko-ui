/**
 * visual.ts — visual parity-drift detector #2 (v2: isolated per-demo
 * render harnesses, not live-site scraping).
 *
 * Both sides render exactly ONE demo per page, on a blank/chrome-free
 * route, with no shared layout to confuse the screenshot target:
 *
 *   - upstream: tooling/parity/harness-react, a Vite+React app that
 *     renders any of the upstream shadcn clone's registry examples at
 *     `/demo/<name>` (see that dir's own comments for how it aliases
 *     straight into the clone's node_modules). Booted here via
 *     `bun run build && bun run preview` (port 4174 by default) — a
 *     built+previewed app, not `dev`, so there's no HMR/websocket
 *     nondeterminism between screenshots.
 *   - ours: apps/docs's own `/parity/<name>` route
 *     (apps/docs/src/routes/parity/$demo/+page.marko), which resolves
 *     `<name>` against the demos-manifest and renders it via
 *     demo-renderer.marko. Booted here too (dev server) unless
 *     DOCS_BASE_URL is set, in which case an already-running docs server
 *     is reused (handy for interactive debugging — start `bun run dev`
 *     yourself and point DOCS_BASE_URL at it).
 *
 * Both routes stamp the same `data-parity-demo="<name>"` attribute on a
 * wrapper div — that's the screenshot target on both sides.
 *
 * Pairing: a demo is "paired" when its name is a key in some component's
 * `demos: {}` object in our demos-manifest.ts AND matches (after
 * normalizeName) an upstream `<ComponentPreview name="...">` ref for the
 * SAME component's MDX doc — i.e. exactly the per-component demo diff
 * coverage.ts already computes (`ourDemos`/`upstreamDemos` per
 * ComponentCoverageResult). This reuses that detector rather than
 * re-deriving pairing logic, so "paired" here means the same thing it
 * means in the coverage report.
 *
 * Interactions: tooling/parity/interactions.json (see INTERACTIONS.md)
 * gives some demo names a list of pre-screenshot steps (currently just
 * `{action:"click", role, name}`), applied identically on both sides via
 * Playwright's role+name locator, plus a settle wait for animations. Demos
 * with no entry are screenshotted at rest — a legitimate snapshot on both
 * sides, not a placeholder.
 *
 * Diff: odiff (root devDependency, `odiff-bin` — confirmed working on this
 * machine, binary at node_modules/.bin/odiff; pixelmatch is NOT used as a
 * fallback here because odiff ran cleanly — see HANDOFF/report for the
 * verification). Diffing happens over the UNION bounding box of the two
 * screenshots (not the whole canvas, not the min/cropped box like v1) —
 * each screenshot is padded with transparent pixels up to the union size
 * before odiff runs, so a demo that's taller/wider on one side counts that
 * extra area as mismatch instead of silently cropping it away.
 *
 * Retries: navigation/timeout failures get 2 retries with linear backoff
 * (1s, 2s) before the demo is recorded as errored.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { createRequire } from "node:module"
import { spawn, type ChildProcess } from "node:child_process"
import { PNG } from "pngjs"
import { REPO_ROOT } from "../fs-utils.ts"
import { runCoverageDetector, normalizeName } from "./coverage.ts"

const requireFromHere = createRequire(import.meta.url)

const GLOBAL_INSTALL_PREFIXES = [
  "/opt/homebrew/lib/node_modules",
  "/usr/local/lib/node_modules",
  "/usr/lib/node_modules",
  "/opt/homebrew/lib/node_modules/npm/node_modules",
]

function playwrightCandidates(): string[] {
  const candidates: string[] = []
  if (process.env.PLAYWRIGHT_MODULE_PATH) candidates.push(process.env.PLAYWRIGHT_MODULE_PATH)
  candidates.push("playwright")
  for (const prefix of GLOBAL_INSTALL_PREFIXES) candidates.push(join(prefix, "playwright"))
  for (const envPrefix of [process.env.BUN_INSTALL, process.env.npm_config_prefix]) {
    if (envPrefix) candidates.push(join(envPrefix, "lib", "node_modules", "playwright"))
  }
  return candidates
}

function loadPlaywright(): typeof import("playwright") {
  const failures: string[] = []
  for (const candidate of playwrightCandidates()) {
    try {
      return requireFromHere(candidate) as typeof import("playwright")
    } catch (error) {
      failures.push(`  ${candidate}: ${(error as Error).message}`)
    }
  }
  throw new Error(
    "visual.ts: unable to resolve the playwright module.\n" +
      "Set PLAYWRIGHT_MODULE_PATH to an installed playwright package, or install " +
      "playwright so normal node resolution finds it.\n" +
      `Tried:\n${failures.join("\n")}`
  )
}

const HARNESS_REACT_DIR = join(REPO_ROOT, "tooling", "parity", "harness-react")
const HARNESS_REACT_URL = process.env.HARNESS_REACT_URL ?? "http://localhost:4174"
const DOCS_DIR = join(REPO_ROOT, "apps", "docs")
export const DOCS_BASE_URL = process.env.DOCS_BASE_URL ?? null

const ODIFF_BIN = join(REPO_ROOT, "node_modules", ".bin", "odiff")

interface InteractionStep {
  action: "click"
  role: string
  name: string
  css?: string
}

interface InteractionEntry {
  steps: InteractionStep[]
  settleMs?: number
}

function loadInteractions(): Record<string, InteractionEntry> {
  const path = join(REPO_ROOT, "tooling", "parity", "interactions.json")
  if (!existsSync(path)) return {}
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, InteractionEntry>
}

/** Wait for a URL to start responding (any HTTP status), polling. */
async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok || response.status < 500) return
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`visual.ts: timed out waiting for ${url} to respond within ${timeoutMs}ms`)
}

interface ManagedServer {
  process: ChildProcess | null
  baseUrl: string
}

/** True if something is already answering HTTP requests at `url`. */
async function isServerUp(url: string): Promise<boolean> {
  try {
    await fetch(url)
    return true
  } catch {
    return false
  }
}

/**
 * Boot the upstream harness-react app: build once, then `vite preview`.
 * If HARNESS_REACT_URL is already serving (e.g. left running from a prior
 * manual run), reuses it instead of failing on vite's strictPort bind
 * error — the returned ManagedServer's `process` is null in that case, so
 * stopServer() correctly leaves someone else's server alone.
 */
async function startHarnessReact(): Promise<ManagedServer> {
  if (await isServerUp(HARNESS_REACT_URL)) {
    console.log(`[visual] reusing already-running harness-react at ${HARNESS_REACT_URL}`)
    return { process: null, baseUrl: HARNESS_REACT_URL }
  }

  console.log("[visual] building harness-react…")
  await new Promise<void>((resolve, reject) => {
    const build = spawn("bun", ["run", "build"], { cwd: HARNESS_REACT_DIR, stdio: "inherit" })
    build.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`harness-react build failed (exit ${code})`))))
    build.on("error", reject)
  })

  console.log("[visual] starting harness-react preview server…")
  const preview = spawn("bun", ["run", "preview"], { cwd: HARNESS_REACT_DIR, stdio: "inherit" })
  await waitForServer(HARNESS_REACT_URL, 30_000)
  return { process: preview, baseUrl: HARNESS_REACT_URL }
}

/** Boot our docs app (dev server) unless DOCS_BASE_URL already points at a running one. */
async function startDocs(): Promise<ManagedServer> {
  if (DOCS_BASE_URL) {
    await waitForServer(DOCS_BASE_URL, 10_000)
    return { process: null, baseUrl: DOCS_BASE_URL }
  }

  const port = 3910
  const baseUrl = `http://localhost:${port}`
  if (await isServerUp(baseUrl)) {
    console.log(`[visual] reusing already-running docs server at ${baseUrl}`)
    return { process: null, baseUrl }
  }

  console.log("[visual] starting docs dev server…")
  const dev = spawn("bun", ["run", "dev", "--port", String(port)], { cwd: DOCS_DIR, stdio: "inherit" })
  // 180s, not 60s: a cold `bun run dev` here runs predev's build-registry.ts
  // first, then marko-run's own Vite dep-optimization pass — measured at
  // 45s-215s+ on a machine under heavy concurrent-agent CPU contention
  // during this feature's development. Prefer DOCS_BASE_URL pointed at an
  // already-running `bun run dev`/`bun run preview` for repeat local runs;
  // this cold-boot path exists so `check:parity` works standalone.
  await waitForServer(baseUrl, 180_000)
  return { process: dev, baseUrl }
}

function stopServer(server: ManagedServer): void {
  if (server.process && !server.process.killed) {
    server.process.kill("SIGTERM")
  }
}

export interface DemoVisualResult {
  component: string
  demoName: string
  mismatchRatio: number | null
  flagged: boolean
  interacted: boolean
  upstreamImagePath: string | null
  ourImagePath: string | null
  diffImagePath: string | null
  error: string | null
  timingMs: number
}

export interface VisualReport {
  generatedAt: string
  threshold: number
  differ: "odiff" | "pixelmatch"
  results: DemoVisualResult[]
  interactedDemos: string[]
}

export interface VisualOptions {
  component?: string
  threshold?: number
  outDir?: string
  /** Skip booting servers — assume HARNESS_REACT_URL / DOCS_BASE_URL are already up. */
  reuseServers?: boolean
}

/** Read a PNG's dimensions without decoding pixel data (cheap, for bbox union). */
function pngDimensions(buffer: Buffer): { width: number; height: number } {
  const png = PNG.sync.read(buffer)
  return { width: png.width, height: png.height }
}

/** Pad a PNG buffer to (width, height), anchored top-left, with transparent fill. */
function padToSize(buffer: Buffer, width: number, height: number): Buffer {
  const src = PNG.sync.read(buffer)
  if (src.width === width && src.height === height) return buffer
  const padded = new PNG({ width, height })
  PNG.bitblt(src, padded, 0, 0, src.width, src.height, 0, 0)
  return PNG.sync.write(padded)
}

interface OdiffResult {
  mismatchRatio: number
  diffPixels: number
}

/**
 * Run odiff on two same-size PNG files, write the diff image, return the
 * mismatch ratio. odiff's exit codes (confirmed against the installed
 * odiff-bin@4.5.0 binary, `odiff --help`): 0 = images match (stdout: "0"
 * with --parsable-stdout), 21 = layout difference (only with
 * --fail-on-layout, not used here since both images are pre-padded to the
 * same union size), 22 = pixel differences found (stdout:
 * "<diffPixelCount>;<diffPercentage>" with --parsable-stdout). Any other
 * exit code is a genuine tooling failure and is rethrown.
 */
async function runOdiff(
  aPath: string,
  bPath: string,
  diffPath: string,
  width: number,
  height: number
): Promise<OdiffResult> {
  const { execFile } = await import("node:child_process")
  const { promisify } = await import("node:util")
  const execFileAsync = promisify(execFile)

  try {
    const { stdout } = await execFileAsync(ODIFF_BIN, [aPath, bPath, diffPath, "--parsable-stdout", "--threshold", "0.1"])
    if (stdout.trim() !== "0") {
      throw new Error(`visual.ts: odiff exited 0 (match) but printed non-zero stdout: ${JSON.stringify(stdout)}`)
    }
    return { mismatchRatio: 0, diffPixels: 0 }
  } catch (error) {
    const execError = error as { code?: number; stdout?: string }
    if (execError.code !== 22) throw error
    const stdout = execError.stdout ?? ""
    const match = /^(\d+);([\d.]+)/.exec(stdout.trim())
    if (!match) throw new Error(`visual.ts: unrecognized odiff --parsable-stdout output: ${JSON.stringify(stdout)}`)
    const diffPixels = Number(match[1])
    return { mismatchRatio: diffPixels / (width * height), diffPixels }
  }
}

/** Apply this demo's interaction steps (if any) on `page`, then wait `settleMs`. */
async function applyInteractions(
  page: import("playwright").Page,
  entry: InteractionEntry | undefined
): Promise<void> {
  if (!entry) return
  for (const step of entry.steps) {
    if (step.action !== "click") continue
    let locator = page.getByRole(step.role as Parameters<typeof page.getByRole>[0], { name: step.name })
    if ((await locator.count()) === 0 && step.css) {
      locator = page.locator(step.css) as typeof locator
    }
    await locator.first().click()
  }
  await page.waitForTimeout(entry.settleMs ?? 300)
}

async function screenshotDemo(
  page: import("playwright").Page,
  baseUrl: string,
  routePrefix: string,
  demoName: string,
  interaction: InteractionEntry | undefined,
  attempt: number
): Promise<Buffer> {
  await page.goto(`${baseUrl}${routePrefix}${demoName}`, { waitUntil: "networkidle", timeout: 30_000 })
  const target = page.locator(`[data-parity-demo="${demoName}"]`)
  // 8s, not 30s: a demo name that's paired by coverage.ts (an MDX
  // <ComponentPreview name="..."> ref) but has no matching .tsx file in
  // the upstream registry's examples/ dir (this happens — upstream's own
  // docs occasionally reference examples that were since removed/renamed)
  // never grows a [data-parity-demo] wrapper on the harness-react side
  // (its NotFound branch omits the attribute entirely, see App.tsx) — so
  // this wait is guaranteed to time out for that case, and each of up to
  // 3 attempts (withRetries below) should fail fast rather than burn 15s+
  // each on something that will never appear.
  await target.waitFor({ state: "visible", timeout: 8_000 })
  await applyInteractions(page, interaction)
  return target.screenshot()
}

async function withRetries<T>(fn: (attempt: number) => Promise<T>, retries: number): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt)
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }
  throw lastError
}

export async function runVisualDetector(options: VisualOptions = {}): Promise<VisualReport> {
  const playwright = loadPlaywright()
  const threshold = options.threshold ?? 0.15
  const outDir = options.outDir ?? join(REPO_ROOT, "parity-report", "images")
  mkdirSync(outDir, { recursive: true })

  const interactions = loadInteractions()
  const coverage = await runCoverageDetector(options.component ? { component: options.component } : {})

  const servers: ManagedServer[] = []
  let harnessBaseUrl = HARNESS_REACT_URL
  let docsBaseUrl = DOCS_BASE_URL ?? "http://localhost:3910"

  if (!options.reuseServers) {
    const harnessServer = await startHarnessReact()
    servers.push(harnessServer)
    harnessBaseUrl = harnessServer.baseUrl

    const docsServer = await startDocs()
    servers.push(docsServer)
    docsBaseUrl = docsServer.baseUrl
  } else {
    await waitForServer(harnessBaseUrl, 10_000)
    await waitForServer(docsBaseUrl, 10_000)
  }

  const browser = await playwright.chromium.launch({ headless: true })
  const results: DemoVisualResult[] = []
  const interactedDemos: string[] = []

  try {
    for (const componentResult of coverage.components) {
      const componentName = componentResult.component

      const ourNormalized = new Set(componentResult.ourDemos.map(normalizeName))
      const sharedUpstreamDemos = componentResult.upstreamDemos.filter((name) =>
        ourNormalized.has(normalizeName(name))
      )
      if (sharedUpstreamDemos.length === 0) continue

      let upstreamContext, ourContext
      try {
        upstreamContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" })
        ourContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" })
        const upstreamPage = await upstreamContext.newPage()
        const ourPage = await ourContext.newPage()

        for (const demoName of sharedUpstreamDemos) {
          const ourDemoName =
            componentResult.ourDemos.find((name) => normalizeName(name) === normalizeName(demoName)) ?? demoName
          // Both harness routes are keyed by the upstream demo name (see
          // route header comments) — the docs /parity/<name> route
          // resolves `name` by scanning demos-manifest.ts, so pass the
          // OUR-side key (post-normalization) there, and the upstream
          // harness's own filename there.
          const interactionEntry = interactions[demoName] ?? interactions[ourDemoName]
          if (interactionEntry) interactedDemos.push(`${componentName}/${demoName}`)

          const demoStart = Date.now()
          let mismatchRatio: number | null = null
          let error: string | null = null
          let upstreamImagePath: string | null = null
          let ourImagePath: string | null = null
          let diffImagePath: string | null = null

          try {
            const upstreamBuffer = await withRetries(
              () => screenshotDemo(upstreamPage, harnessBaseUrl, "/demo/", demoName, interactionEntry, 0),
              2
            )
            const ourBuffer = await withRetries(
              () => screenshotDemo(ourPage, docsBaseUrl, "/parity/", ourDemoName, interactionEntry, 0),
              2
            )

            const safeDemoName = demoName.replace(/[^a-z0-9-]/gi, "_")
            upstreamImagePath = join(outDir, `${componentName}__${safeDemoName}__upstream.png`)
            ourImagePath = join(outDir, `${componentName}__${safeDemoName}__ours.png`)

            const upstreamDims = pngDimensions(upstreamBuffer)
            const ourDims = pngDimensions(ourBuffer)
            const unionWidth = Math.max(upstreamDims.width, ourDims.width)
            const unionHeight = Math.max(upstreamDims.height, ourDims.height)

            const upstreamPadded = padToSize(upstreamBuffer, unionWidth, unionHeight)
            const ourPadded = padToSize(ourBuffer, unionWidth, unionHeight)
            writeFileSync(upstreamImagePath, upstreamPadded)
            writeFileSync(ourImagePath, ourPadded)

            diffImagePath = join(outDir, `${componentName}__${safeDemoName}__diff.png`)
            const odiffResult = await runOdiff(
              upstreamImagePath,
              ourImagePath,
              diffImagePath,
              unionWidth,
              unionHeight
            )
            mismatchRatio = odiffResult.mismatchRatio
          } catch (demoError) {
            error = demoError instanceof Error ? demoError.message : String(demoError)
          }

          results.push({
            component: componentName,
            demoName,
            mismatchRatio,
            flagged: mismatchRatio !== null && mismatchRatio > threshold,
            interacted: Boolean(interactionEntry),
            upstreamImagePath,
            ourImagePath,
            diffImagePath,
            error,
            timingMs: Date.now() - demoStart,
          })
        }
      } catch (componentError) {
        results.push({
          component: componentName,
          demoName: "(component-level failure)",
          mismatchRatio: null,
          flagged: false,
          interacted: false,
          upstreamImagePath: null,
          ourImagePath: null,
          diffImagePath: null,
          error: componentError instanceof Error ? componentError.message : String(componentError),
          timingMs: 0,
        })
      } finally {
        await upstreamContext?.close()
        await ourContext?.close()
      }
    }
  } finally {
    await browser.close()
    for (const server of servers) stopServer(server)
  }

  return {
    generatedAt: new Date().toISOString(),
    threshold,
    differ: "odiff",
    results,
    interactedDemos,
  }
}

if (import.meta.main) {
  const args = process.argv.slice(2)
  const reuseServers = args.includes("--reuse-servers")
  const componentArg = args.find((arg) => !arg.startsWith("--"))
  const report = await runVisualDetector({
    ...(componentArg ? { component: componentArg } : {}),
    reuseServers,
  })
  console.log(JSON.stringify(report, null, 2))
}
