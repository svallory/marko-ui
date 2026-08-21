/**
 * visual.ts — visual parity-drift detector #2.
 *
 * For every demo that exists on BOTH sides (per the coverage detector's
 * name-matched demo lists), screenshots the demo's preview container on
 * upstream (https://ui.shadcn.com/docs/components/base/<slug>) and on our
 * local docs app (DOCS_BASE_URL, default http://localhost:3000), then
 * pixel-diffs the two images with pixelmatch after normalizing size.
 *
 * Selector: both sides render `<div data-slot="component-preview">…
 * <div data-slot="preview">…</div></div>` (verified by hand against a
 * fetched ui.shadcn.com/docs/components/base/drawer page and our own
 * /docs/components/drawer route — same shadcn-v4-derived markup
 * convention). Neither side stamps an id/name on the container tying it
 * to a specific demo, so correlation is POSITIONAL: the Nth
 * `<ComponentPreview>` in the upstream MDX (source order) is the Nth
 * `[data-slot="component-preview"]` in the rendered DOM, and likewise the
 * Nth example in our docs.ts is the Nth `[data-slot="component-preview"]`
 * on our page (hero preview, if present, is example 0's own preview
 * re-rendered — see +page.marko — so the two indexings line up by
 * example, not by an independent "hero + sections" count).
 *
 * Interactive demos: v1 takes the RESTING state only (no click-to-open).
 * Verified against upstream's drawer/dialog demos: the resting DOM is
 * just the trigger button, so a resting-state screenshot is a legitimate,
 * comparable snapshot on both sides — not a placeholder. Every demo
 * screenshotted this way is listed in `restingStateOnly` in the report.
 *
 * Cross-framework rendering never pixel-matches exactly (font hinting,
 * anti-aliasing, subpixel layout). We report a mismatch RATIO
 * (differing pixels / total pixels of the common cropped box) and only
 * flag components above `threshold` (default 0.15) as drifted.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { createRequire } from "node:module"
import { PNG } from "pngjs"
import pixelmatch from "pixelmatch"
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

export const DOCS_BASE_URL = process.env.DOCS_BASE_URL ?? "http://localhost:3000"
const UPSTREAM_BASE_URL = "https://ui.shadcn.com/docs/components/base"

export interface DemoVisualResult {
  component: string
  demoName: string
  mismatchRatio: number | null
  flagged: boolean
  restingStateOnly: boolean
  upstreamImagePath: string | null
  ourImagePath: string | null
  error: string | null
  timingMs: number
}

export interface VisualReport {
  generatedAt: string
  threshold: number
  results: DemoVisualResult[]
  restingStateOnly: string[]
}

export interface VisualOptions {
  component?: string
  threshold?: number
  outDir?: string
}

/** Demos interaction is known to be required for (drawer/dialog family opens on click). */
const INTERACTIVE_DEMO_HINTS = [
  "drawer",
  "dialog",
  "sheet",
  "popover",
  "dropdown",
  "menu",
  "tooltip",
  "hover-card",
  "context-menu",
  "combobox",
  "select",
  "command",
  "collapsible",
  "accordion",
]

function looksInteractive(componentName: string): boolean {
  return INTERACTIVE_DEMO_HINTS.some((hint) => componentName.includes(hint))
}

/** Crop/resize two PNGs to their common (min width, min height) box. */
function normalizeToCommonBox(a: PNG, b: PNG): { a: PNG; b: PNG; width: number; height: number } {
  const width = Math.min(a.width, b.width)
  const height = Math.min(a.height, b.height)

  const cropA = new PNG({ width, height })
  PNG.bitblt(a, cropA, 0, 0, width, height, 0, 0)
  const cropB = new PNG({ width, height })
  PNG.bitblt(b, cropB, 0, 0, width, height, 0, 0)

  return { a: cropA, b: cropB, width, height }
}

export async function runVisualDetector(options: VisualOptions = {}): Promise<VisualReport> {
  const playwright = loadPlaywright()
  const threshold = options.threshold ?? 0.15
  const outDir = options.outDir ?? join(REPO_ROOT, "parity-report", "images")
  mkdirSync(outDir, { recursive: true })

  const coverage = await runCoverageDetector(options.component ? { component: options.component } : {})

  const browser = await playwright.chromium.launch({ headless: true })
  const results: DemoVisualResult[] = []
  const restingStateOnly: string[] = []

  try {
    for (const componentResult of coverage.components) {
      const componentName = componentResult.component

      // Shared demos = upstream demo names that also appear (normalized)
      // in our demo names, in UPSTREAM source order (that order is what
      // maps positionally to the upstream DOM containers).
      const ourNormalized = new Set(componentResult.ourDemos.map(normalizeName))
      const sharedUpstreamDemos = componentResult.upstreamDemos.filter((name) =>
        ourNormalized.has(normalizeName(name))
      )
      if (sharedUpstreamDemos.length === 0) continue

      const isInteractive = looksInteractive(componentName)
      if (isInteractive) restingStateOnly.push(componentName)

      const start = Date.now()
      let upstreamContext, ourContext
      try {
        upstreamContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" })
        ourContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" })
        const upstreamPage = await upstreamContext.newPage()
        const ourPage = await ourContext.newPage()

        const upstreamUrl = `${UPSTREAM_BASE_URL}/${componentName}`
        const ourUrl = `${DOCS_BASE_URL}/docs/components/${componentName}`

        await upstreamPage.goto(upstreamUrl, { waitUntil: "networkidle", timeout: 30_000 })
        await ourPage.goto(ourUrl, { waitUntil: "networkidle", timeout: 30_000 })

        const upstreamPreviews = upstreamPage.locator('[data-slot="component-preview"] [data-slot="preview"]')
        const ourPreviews = ourPage.locator('[data-slot="component-preview"] [data-slot="preview"]')

        for (let index = 0; index < sharedUpstreamDemos.length; index++) {
          const demoName = sharedUpstreamDemos[index]
          if (demoName === undefined) continue
          const upstreamIndex = componentResult.upstreamDemos.indexOf(demoName)
          const ourDemoName = componentResult.ourDemos.find(
            (name) => normalizeName(name) === normalizeName(demoName)
          )
          const ourIndex = ourDemoName ? componentResult.ourDemos.indexOf(ourDemoName) : -1

          const demoStart = Date.now()
          let mismatchRatio: number | null = null
          let error: string | null = null
          let upstreamImagePath: string | null = null
          let ourImagePath: string | null = null

          try {
            const upstreamCount = await upstreamPreviews.count()
            const ourCount = await ourPreviews.count()
            if (upstreamIndex < 0 || upstreamIndex >= upstreamCount) {
              throw new Error(
                `upstream preview index ${upstreamIndex} out of range (found ${upstreamCount} preview containers)`
              )
            }
            if (ourIndex < 0 || ourIndex >= ourCount) {
              throw new Error(
                `our preview index ${ourIndex} out of range (found ${ourCount} preview containers)`
              )
            }

            const upstreamBuffer = await upstreamPreviews.nth(upstreamIndex).screenshot()
            const ourBuffer = await ourPreviews.nth(ourIndex).screenshot()

            const safeDemoName = demoName.replace(/[^a-z0-9-]/gi, "_")
            upstreamImagePath = join(outDir, `${componentName}__${safeDemoName}__upstream.png`)
            ourImagePath = join(outDir, `${componentName}__${safeDemoName}__ours.png`)
            writeFileSync(upstreamImagePath, upstreamBuffer)
            writeFileSync(ourImagePath, ourBuffer)

            const upstreamPng = PNG.sync.read(upstreamBuffer)
            const ourPng = PNG.sync.read(ourBuffer)
            const { a, b, width, height } = normalizeToCommonBox(upstreamPng, ourPng)

            const diffPng = new PNG({ width, height })
            const diffPixels = pixelmatch(a.data, b.data, diffPng.data, width, height, {
              threshold: 0.1,
            })
            mismatchRatio = width * height === 0 ? null : diffPixels / (width * height)

            const diffPath = join(outDir, `${componentName}__${safeDemoName}__diff.png`)
            writeFileSync(diffPath, PNG.sync.write(diffPng))
          } catch (demoError) {
            error = demoError instanceof Error ? demoError.message : String(demoError)
          }

          results.push({
            component: componentName,
            demoName,
            mismatchRatio,
            flagged: mismatchRatio !== null && mismatchRatio > threshold,
            restingStateOnly: isInteractive,
            upstreamImagePath,
            ourImagePath,
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
          restingStateOnly: isInteractive,
          upstreamImagePath: null,
          ourImagePath: null,
          error: componentError instanceof Error ? componentError.message : String(componentError),
          timingMs: Date.now() - start,
        })
      } finally {
        await upstreamContext?.close()
        await ourContext?.close()
      }

      console.log(`[visual] ${componentName}: ${Date.now() - start}ms`)
    }
  } finally {
    await browser.close()
  }

  return {
    generatedAt: new Date().toISOString(),
    threshold,
    results,
    restingStateOnly,
  }
}

if (import.meta.main) {
  const componentArg = process.argv[2]
  const report = await runVisualDetector(componentArg ? { component: componentArg } : {})
  console.log(JSON.stringify(report, null, 2))
}
