/**
 * structure.ts — structural parity-drift detector. Middle tier between
 * coverage (presence-only, static source) and visual (pixel diff,
 * expensive/last-resort) — see PROTOCOL.md's "Three-tier detection" for
 * the rule this file exists to enforce: "pixels are the detector of last
 * resort — anything expressible as structure must be caught by structure."
 *
 * What it catches that coverage can't and visual shouldn't have to:
 * coverage only checks demo NAMES and section presence, never a demo's
 * actual markup — it has no way to notice a demo silently missing an
 * icon, a list row, or a button once both sides declare the same demo
 * name. Pixel diffing WOULD catch that, but pixels are noisy (anti-
 * aliasing, font hinting, animation timing) and expensive (needs a real
 * browser round-trip through odiff on every run) for something as
 * mechanical as "upstream has 3 <li> items, ours has 2." Structure
 * catches the mechanical, countable, textual case cheaply — element
 * kind/role counts and normalized text — leaving pixels to catch only
 * what genuinely can't be expressed as structure (spacing, color,
 * layout shape).
 *
 * Design: for each paired demo (same pairing coverage.ts/visual.ts
 * already compute — a demo name present in both harnesses'
 * ComponentFacts.demoNames for the same component), navigate both
 * harnesses' `${demoPath}${name}` route and run ONE Playwright
 * `page.evaluate()` per side against the `[data-parity-demo]` element.
 * That evaluate call walks the DOM and returns a plain, JSON-serializable
 * DemoStructure — no DOM handles cross the evaluate boundary, so this
 * file has zero dependency on any DOM/browser types beyond Playwright's
 * own Page, and zero non-Playwright dependencies (dependency-free per the
 * task's own requirement — plain diffing, no diff library).
 *
 * Deliberately NOT included in the structure comparison: exact pixel
 * geometry (that's visual.ts's job), inline style/class values (a
 * legitimate design-system difference, not drift), and anything requiring
 * semantic understanding of prose (coverage.ts's section-map already
 * owns "is this content present," not this file).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { REPO_ROOT } from "../../fs-utils.ts"
import defaultConfig from "../config/parity.config.ts"
import { runCoverageDetector, normalizeName } from "./coverage.ts"

const HARNESSES_ROOT = join(REPO_ROOT, "tooling", "parity", "harnesses")

interface HarnessManifest {
  name: string
  start: string
  port: number
  demoPath: string
}

function loadHarnessManifest(dirName: string): HarnessManifest {
  const path = join(HARNESSES_ROOT, dirName, "harness.json")
  if (!existsSync(path)) {
    throw new Error(`structure.ts: missing ${path} — every harness must have a harness.json (see PROTOCOL.md).`)
  }
  return JSON.parse(readFileSync(path, "utf8")) as HarnessManifest
}

// ---------------------------------------------------------------------------
// Structure extraction (runs inside the page via page.evaluate)
// ---------------------------------------------------------------------------

/**
 * Kinds we count. Deliberately a small, named vocabulary rather than
 * "every tag" — an arbitrary <div> count is noise (wrapper depth differs
 * legitimately between a React tree and a Marko tree for the same visual
 * result), but these specific kinds are meaningful content signals a
 * faithful port should reproduce 1:1.
 */
const STRUCTURE_KIND_SELECTORS: Record<string, string> = {
  button: 'button, [role="button"]',
  link: "a[href]",
  svgIcon: "svg",
  image: "img",
  input: "input, textarea, select",
  heading: "h1, h2, h3, h4, h5, h6",
  listItem: 'li, [role="listitem"]',
  checkbox: '[role="checkbox"], input[type="checkbox"]',
  radio: '[role="radio"], input[type="radio"]',
  avatar: '[data-slot="avatar"]',
  badge: '[data-slot="badge"]',
}

export interface DemoStructure {
  /** kind -> count, per STRUCTURE_KIND_SELECTORS. */
  counts: Record<string, number>
  /** Normalized (whitespace-collapsed, trimmed) full text content of the demo root. */
  text: string
  /** Max DOM nesting depth under the demo root, as a coarse layout-shape signal. */
  maxDepth: number
  /** Total element count under the demo root (excluding the root itself). */
  totalElements: number
}

/**
 * Runs inside the browser via page.evaluate — see PROTOCOL.md's
 * "GET /demo/<name>" contract for why `[data-parity-demo="<name>"]` is
 * always the right selector on both harnesses.
 */
function extractStructureInPage(args: { demoName: string; kindSelectors: Record<string, string> }): DemoStructure {
  const { demoName, kindSelectors } = args
  const root = document.querySelector(`[data-parity-demo="${demoName}"]`)
  if (!root) throw new Error(`extractStructureInPage: no [data-parity-demo="${demoName}"] element found`)

  const counts: Record<string, number> = {}
  for (const [kind, selector] of Object.entries(kindSelectors)) {
    counts[kind] = root.querySelectorAll(selector).length
  }

  const text = (root.textContent ?? "").replace(/\s+/g, " ").trim()

  let maxDepth = 0
  let totalElements = 0
  const walk = (node: Element, depth: number): void => {
    totalElements += 1
    maxDepth = Math.max(maxDepth, depth)
    for (const child of Array.from(node.children)) walk(child, depth + 1)
  }
  for (const child of Array.from(root.children)) walk(child, 1)

  return { counts, text, maxDepth, totalElements }
}

// ---------------------------------------------------------------------------
// Diffing (plain, dependency-free)
// ---------------------------------------------------------------------------

export interface StructureDifference {
  kind: "count" | "text" | "depth"
  /** Human-readable, e.g. "3×svg icon" or "text differs". */
  label: string
  upstream: string
  ours: string
}

export interface DemoStructureResult {
  component: string
  demoName: string
  ourDemoName: string
  flagged: boolean
  differences: StructureDifference[]
  error: string | null
}

const KIND_LABELS: Record<string, string> = {
  button: "button",
  link: "link",
  svgIcon: "svg icon",
  image: "image",
  input: "input",
  heading: "heading",
  listItem: "list item",
  checkbox: "checkbox",
  radio: "radio",
  avatar: "avatar",
  badge: "badge",
}

/**
 * Text similarity tolerance: normalized text must match losslessly on
 * whitespace but NOT on exact byte content being ignored — the task is
 * explicit that demo text should match since these are ports, not
 * paraphrases ("text should match — compare text too, normalized
 * whitespace"). So this is exact-match after whitespace normalization,
 * no fuzzy/similarity threshold.
 */
function diffStructures(upstream: DemoStructure, ours: DemoStructure): StructureDifference[] {
  const differences: StructureDifference[] = []

  for (const kind of Object.keys(STRUCTURE_KIND_SELECTORS)) {
    const upstreamCount = upstream.counts[kind] ?? 0
    const ourCount = ours.counts[kind] ?? 0
    if (upstreamCount === ourCount) continue
    const label = KIND_LABELS[kind] ?? kind
    const delta = upstreamCount - ourCount
    differences.push({
      kind: "count",
      label: delta > 0 ? `ours missing: ${delta}×${label}` : `ours has extra: ${-delta}×${label}`,
      upstream: String(upstreamCount),
      ours: String(ourCount),
    })
  }

  if (upstream.text !== ours.text) {
    differences.push({
      kind: "text",
      label: `text differs: ${JSON.stringify(truncate(upstream.text, 80))} vs ${JSON.stringify(truncate(ours.text, 80))}`,
      upstream: upstream.text,
      ours: ours.text,
    })
  }

  // Depth is a coarse signal only — flagged as informational when it
  // diverges by more than 1 level (a single extra wrapper div is normal
  // cross-framework noise; a whole missing/extra subtree is not).
  if (Math.abs(upstream.maxDepth - ours.maxDepth) > 1) {
    differences.push({
      kind: "depth",
      label: `nesting depth differs: upstream ${upstream.maxDepth} vs ours ${ours.maxDepth}`,
      upstream: String(upstream.maxDepth),
      ours: String(ours.maxDepth),
    })
  }

  return differences
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

export interface StructureReport {
  generatedAt: string
  results: DemoStructureResult[]
}

export interface StructureOptions {
  component?: string
  /** Skip booting servers — assume both harnesses are already up on their harness.json ports (mirrors visual.ts's option). */
  reuseServers?: boolean
}

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
  throw new Error(`structure.ts: timed out waiting for ${url} to respond within ${timeoutMs}ms`)
}

async function isServerUp(url: string): Promise<boolean> {
  try {
    await fetch(url)
    return true
  } catch {
    return false
  }
}

interface ManagedServer {
  process: import("node:child_process").ChildProcess | null
  baseUrl: string
  demoPath: string
}

async function startHarness(dirName: string): Promise<ManagedServer> {
  const manifest = loadHarnessManifest(dirName)
  const baseUrl = `http://localhost:${manifest.port}`
  if (await isServerUp(baseUrl)) {
    console.log(`[structure] reusing already-running ${manifest.name} harness at ${baseUrl}`)
    return { process: null, baseUrl, demoPath: manifest.demoPath }
  }
  console.log(`[structure] starting ${manifest.name} harness (${manifest.start})…`)
  const { spawn } = await import("node:child_process")
  const dir = join(HARNESSES_ROOT, dirName)
  const child = spawn(manifest.start, { cwd: dir, stdio: "inherit", shell: true })
  await waitForServer(baseUrl, 180_000)
  return { process: child, baseUrl, demoPath: manifest.demoPath }
}

function stopServer(server: ManagedServer): void {
  if (server.process && !server.process.killed) server.process.kill("SIGTERM")
}

const requireFromHereForPlaywright = (): typeof import("playwright") => {
  const { createRequire } = require("node:module") as typeof import("node:module")
  const requireFromHere = createRequire(import.meta.url)
  const candidates: string[] = []
  if (process.env.PLAYWRIGHT_MODULE_PATH) candidates.push(process.env.PLAYWRIGHT_MODULE_PATH)
  candidates.push("playwright")
  for (const prefix of [
    "/opt/homebrew/lib/node_modules",
    "/usr/local/lib/node_modules",
    "/usr/lib/node_modules",
    "/opt/homebrew/lib/node_modules/npm/node_modules",
  ]) {
    candidates.push(join(prefix, "playwright"))
  }
  for (const envPrefix of [process.env.BUN_INSTALL, process.env.npm_config_prefix]) {
    if (envPrefix) candidates.push(join(envPrefix, "lib", "node_modules", "playwright"))
  }
  const failures: string[] = []
  for (const candidate of candidates) {
    try {
      return requireFromHere(candidate) as typeof import("playwright")
    } catch (error) {
      failures.push(`  ${candidate}: ${(error as Error).message}`)
    }
  }
  throw new Error(`structure.ts: unable to resolve playwright.\nTried:\n${failures.join("\n")}`)
}

const PER_DEMO_TIMEOUT_MS = 20_000

async function extractOnPage(
  page: import("playwright").Page,
  baseUrl: string,
  demoPath: string,
  demoName: string
): Promise<DemoStructure> {
  const run = async (): Promise<DemoStructure> => {
    await page.goto(`${baseUrl}${demoPath}${demoName}`, { waitUntil: "networkidle", timeout: 30_000 })
    await page.locator(`[data-parity-demo="${demoName}"]`).waitFor({ state: "visible", timeout: 8_000 })
    return page.evaluate(extractStructureInPage, { demoName, kindSelectors: STRUCTURE_KIND_SELECTORS })
  }
  return Promise.race([
    run(),
    new Promise<DemoStructure>((_, reject) =>
      setTimeout(
        () => reject(new Error(`structure.ts: extractOnPage(${demoName}) exceeded ${PER_DEMO_TIMEOUT_MS}ms`)),
        PER_DEMO_TIMEOUT_MS
      )
    ),
  ])
}

export async function runStructureDetector(options: StructureOptions = {}): Promise<StructureReport> {
  const playwright = requireFromHereForPlaywright()
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
    const upstreamManifest = loadHarnessManifest(defaultConfig.upstream.dir)
    const ourManifest = loadHarnessManifest(defaultConfig.ours.dir)
    upstreamServer = { process: null, baseUrl: `http://localhost:${upstreamManifest.port}`, demoPath: upstreamManifest.demoPath }
    ourServer = { process: null, baseUrl: `http://localhost:${ourManifest.port}`, demoPath: ourManifest.demoPath }
    await waitForServer(upstreamServer.baseUrl, 10_000)
    await waitForServer(ourServer.baseUrl, 10_000)
  }

  const browser = await playwright.chromium.launch({ headless: true })
  const results: DemoStructureResult[] = []

  try {
    for (const componentResult of coverage.components) {
      const componentName = componentResult.component
      const ourNormalized = new Set(componentResult.ourDemos.map(normalizeName))
      const sharedUpstreamDemos = componentResult.upstreamDemos.filter((name) => ourNormalized.has(normalizeName(name)))
      if (sharedUpstreamDemos.length === 0) continue

      let upstreamContext, ourContext
      try {
        upstreamContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" })
        ourContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" })
        const upstreamPage = await upstreamContext.newPage()
        const ourPage = await ourContext.newPage()

        for (const demoName of sharedUpstreamDemos) {
          const ourDemoName = componentResult.ourDemos.find((name) => normalizeName(name) === normalizeName(demoName)) ?? demoName
          try {
            const upstreamStructure = await extractOnPage(upstreamPage, upstreamServer.baseUrl, upstreamServer.demoPath, demoName)
            const ourStructure = await extractOnPage(ourPage, ourServer.baseUrl, ourServer.demoPath, ourDemoName)
            const differences = diffStructures(upstreamStructure, ourStructure)
            results.push({
              component: componentName,
              demoName,
              ourDemoName,
              flagged: differences.length > 0,
              differences,
              error: null,
            })
          } catch (demoError) {
            results.push({
              component: componentName,
              demoName,
              ourDemoName,
              flagged: false,
              differences: [],
              error: demoError instanceof Error ? demoError.message : String(demoError),
            })
          }
        }
      } finally {
        await upstreamContext?.close()
        await ourContext?.close()
      }
    }
  } finally {
    await browser.close()
    for (const server of servers) stopServer(server)
  }

  return { generatedAt: new Date().toISOString(), results }
}

if (import.meta.main) {
  const args = process.argv.slice(2)
  const reuseServers = args.includes("--reuse-servers")
  const componentArg = args.find((arg) => !arg.startsWith("--"))
  const outDir = join(REPO_ROOT, "parity-report")
  mkdirSync(outDir, { recursive: true })
  const report = await runStructureDetector({
    ...(componentArg ? { component: componentArg } : {}),
    reuseServers,
  })
  console.log(JSON.stringify(report, null, 2))
}
