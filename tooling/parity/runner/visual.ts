/**
 * visual.ts — visual parity-drift detector (protocol-first: harness.json
 * driven, not hardcoded per-harness paths/ports/routes).
 *
 * Both harnesses render exactly ONE demo per page, on a blank/chrome-free
 * route, with no shared layout to confuse the screenshot target — see
 * PROTOCOL.md's "GET /demo/<name>" contract. This runner is harness-
 * agnostic: it reads each harness's harness.json (name/start/port/
 * demoPath) from config/parity.config.ts's `upstream`/`ours` entries,
 * boots each server with its own `start` command, and navigates to
 * `${demoPath}${name}` on each. Both routes stamp the same
 * `data-parity-demo="<name>"` attribute on a wrapper div — that's the
 * screenshot target on both sides.
 *
 * Pairing: a demo is "paired" when its name is in the `ours` harness's
 * ComponentFacts.demoNames AND matches (after normalizeName) an entry in
 * the `upstream` harness's ComponentFacts.demoNames for the SAME
 * component — i.e. exactly the per-component demo diff coverage.ts
 * already computes (`ourDemos`/`upstreamDemos` per ComponentCoverageResult).
 * This reuses that detector rather than re-deriving pairing logic, so
 * "paired" here means the same thing it means in the coverage report.
 *
 * Interactions: config/interactions.json (see config/INTERACTIONS.md)
 * gives some demo names a list of pre-screenshot steps (currently just
 * `{action:"click", role, name}`), applied identically on both sides via
 * Playwright's role+name locator, plus a settle wait for animations. Demos
 * with no entry are screenshotted at rest — a legitimate snapshot on both
 * sides, not a placeholder.
 *
 * Diff: odiff (root devDependency, `odiff-bin`). Diffing happens over the
 * UNION bounding box of the two screenshots — each screenshot is padded
 * with transparent pixels up to the union size before odiff runs, so a
 * demo that's taller/wider on one side counts that extra area as mismatch
 * instead of silently cropping it away.
 *
 * Retries: navigation/timeout failures get 2 retries with linear backoff
 * (1s, 2s) before the demo is recorded as errored.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { createRequire } from "node:module"
import { spawn, type ChildProcess } from "node:child_process"
import { PNG } from "pngjs"
import { REPO_ROOT } from "../../fs-utils.ts"
import defaultConfig from "../config/parity.config.ts"
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

const HARNESSES_ROOT = join(REPO_ROOT, "tooling", "parity", "harnesses")

interface HarnessManifest {
  name: string
  start: string
  port: number
  demoPath: string
}

function loadHarnessManifest(dirName: string): { dir: string; manifest: HarnessManifest } {
  const dir = join(HARNESSES_ROOT, dirName)
  const path = join(dir, "harness.json")
  if (!existsSync(path)) {
    throw new Error(`visual.ts: missing ${path} — every harness must have a harness.json (see PROTOCOL.md).`)
  }
  return { dir, manifest: JSON.parse(readFileSync(path, "utf8")) as HarnessManifest }
}

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
  const path = join(REPO_ROOT, "tooling", "parity", "config", "interactions.json")
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
  demoPath: string
  label: string
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
 * Boots a harness's demo server per its harness.json `start` command,
 * unless something is already answering on its port (e.g. left running
 * from a prior manual run) — the returned ManagedServer's `process` is
 * null in that case, so stopServer() correctly leaves someone else's
 * server alone. `DOCS_BASE_URL`-style env overrides are intentionally NOT
 * hardcoded per-harness anymore (that was shadcn/ours-specific); a
 * harness that needs to be pointed at an already-running dev server
 * simply has that server already answering on harness.json's `port`
 * before this runs.
 */
async function startHarness(dirName: string): Promise<ManagedServer> {
  const { dir, manifest } = loadHarnessManifest(dirName)
  const baseUrl = `http://localhost:${manifest.port}`

  if (await isServerUp(baseUrl)) {
    console.log(`[visual] reusing already-running ${manifest.name} harness at ${baseUrl}`)
    return { process: null, baseUrl, demoPath: manifest.demoPath, label: manifest.name }
  }

  console.log(`[visual] starting ${manifest.name} harness (${manifest.start})…`)
  const child = spawn(manifest.start, { cwd: dir, stdio: "inherit", shell: true })
  await waitForServer(baseUrl, 180_000)
  return { process: child, baseUrl, demoPath: manifest.demoPath, label: manifest.name }
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
  /** Skip booting servers — assume both harnesses are already up on their harness.json ports. */
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

/** Apply this demo's interaction steps (if any) on `page`, then wait `settleMs`.
 *
 * Each click is bounded by Playwright's own `timeout` option (10s) — without
 * an explicit timeout, `locator.click()` uses Playwright's actionability
 * polling which can, in pathological cases (element present but never
 * satisfies hit-testing/stability), poll far longer than expected. This
 * alone doesn't fully bound applyInteractions (see screenshotDemo's
 * PER_DEMO_TIMEOUT_MS wrapper for the hard outer deadline), but it turns a
 * silent multi-minute hang into a clear, attributable per-step error.
 */
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
    await locator.first().click({ timeout: 10_000 })
  }
  await page.waitForTimeout(entry.settleMs ?? 300)
}

// Hard outer deadline for one screenshotDemo() call (goto + waitFor +
// interactions + screenshot combined). Individual steps inside already carry
// their own Playwright timeouts (goto: 30s, waitFor: 8s, click: 10s), but
// nothing previously bounded the SUM, and a hang inside Playwright's
// actionability/auto-wait machinery doesn't reject, it just hangs — which
// escapes withRetries entirely, since withRetries only re-tries on
// rejection. 45s comfortably covers the sum of the inner timeouts while
// still failing fast enough that one wedged demo costs at most
// 45s x (retries+1), not unbounded wall-clock time.
const PER_DEMO_TIMEOUT_MS = 45_000

async function screenshotDemo(
  page: import("playwright").Page,
  baseUrl: string,
  demoPath: string,
  demoName: string,
  interaction: InteractionEntry | undefined,
  attempt: number
): Promise<Buffer> {
  const run = async (): Promise<Buffer> => {
    await page.goto(`${baseUrl}${demoPath}${demoName}`, { waitUntil: "networkidle", timeout: 30_000 })
    const target = page.locator(`[data-parity-demo="${demoName}"]`)
    // 8s, not 30s: a demo name that's paired by coverage.ts but has no
    // matching demo file on this harness's side never grows a
    // [data-parity-demo] wrapper (its not-found branch omits the
    // attribute entirely) — so this wait is guaranteed to time out for
    // that case, and each of up to 3 attempts (withRetries below) should
    // fail fast rather than burn 15s+ each on something that will never
    // appear.
    await target.waitFor({ state: "visible", timeout: 8_000 })
    await applyInteractions(page, interaction)
    return target.screenshot()
  }
  return Promise.race([
    run(),
    new Promise<Buffer>((_, reject) =>
      setTimeout(
        () => reject(new Error(`visual.ts: screenshotDemo(${demoName}) exceeded ${PER_DEMO_TIMEOUT_MS}ms hard deadline (attempt ${attempt})`)),
        PER_DEMO_TIMEOUT_MS
      )
    ),
  ])
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
  let upstreamServer: ManagedServer
  let ourServer: ManagedServer

  if (!options.reuseServers) {
    upstreamServer = await startHarness(defaultConfig.upstream.dir)
    servers.push(upstreamServer)
    ourServer = await startHarness(defaultConfig.ours.dir)
    servers.push(ourServer)
  } else {
    const upstreamManifest = loadHarnessManifest(defaultConfig.upstream.dir).manifest
    const ourManifest = loadHarnessManifest(defaultConfig.ours.dir).manifest
    upstreamServer = {
      process: null,
      baseUrl: `http://localhost:${upstreamManifest.port}`,
      demoPath: upstreamManifest.demoPath,
      label: upstreamManifest.name,
    }
    ourServer = {
      process: null,
      baseUrl: `http://localhost:${ourManifest.port}`,
      demoPath: ourManifest.demoPath,
      label: ourManifest.name,
    }
    await waitForServer(upstreamServer.baseUrl, 10_000)
    await waitForServer(ourServer.baseUrl, 10_000)
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
              () => screenshotDemo(upstreamPage, upstreamServer.baseUrl, upstreamServer.demoPath, demoName, interactionEntry, 0),
              2
            )
            const ourBuffer = await withRetries(
              () => screenshotDemo(ourPage, ourServer.baseUrl, ourServer.demoPath, ourDemoName, interactionEntry, 0),
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
