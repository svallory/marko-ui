/**
 * check-parity.ts — orchestrates the two parity-drift detectors and emits
 * parity-report/{report.json,index.html}.
 *
 * Usage:
 *   bun tooling/check-parity.ts [--static-only] [--component <slug>]
 *
 * --static-only skips the Playwright visual detector entirely (for CI
 * without a running docs dev server, or a quick coverage-only check).
 * --component restricts both detectors to one shared component slug.
 *
 * Exit-code contract (matches the repo's doctor/validate convention, see
 * `marko-ui doctor --json`): 0 = green, no drift found. 3 = drift found —
 * at least one non-ignored coverage mismatch (missing/extra section, demo,
 * or API prop) or at least one visual result over threshold. 2 = tooling
 * crash (thrown from `main`, handled by `runCheck`). The report is always
 * written on a successful run (coverage.json/index.html), regardless of
 * exit code — 3 means "look at the report," not "the run failed."
 * tooling/parity/SCHEMA.md documents the report JSON shape this reads.
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { REPO_ROOT, runCheck } from "./fs-utils.ts"
import { runCoverageDetector, normalizeName, loadIgnoreList, type CoverageReport } from "./parity/coverage.ts"
import { runVisualDetector, type VisualReport } from "./parity/visual.ts"
import { renderReport } from "./parity/report.ts"

/** One component's entry in report.json's stable `summary` array — see SCHEMA.md. */
export interface ComponentSummary {
  component: string
  status: "green" | "drift"
  pairedDemos: string[]
  missingDemos: string[]
  extraDemos: string[]
  missingSections: string[]
  maxDiffPct: number | null
  ignored: string[]
}

/**
 * Builds the stable, documented `summary` array (tooling/parity/SCHEMA.md)
 * from the two detectors' raw output. This is the shape external
 * consumers should read — `coverage`/`visual` in the same report.json are
 * the detectors' full internal shapes, kept for the HTML report and for
 * debugging, but not contractually stable.
 */
function buildSummary(coverage: CoverageReport, visual: VisualReport | null): ComponentSummary[] {
  const ignoreList = loadIgnoreList()
  return coverage.components.map((component) => {
    const ignoredNames = ignoreList
      .filter((entry) => entry.component === component.component || entry.component === "*")
      .map((entry) => entry.name)
    const visualResults = visual?.results.filter((result) => result.component === component.component) ?? []
    const diffRatios = visualResults
      .map((result) => result.mismatchRatio)
      .filter((ratio): ratio is number => ratio !== null)
    const maxDiffPct = diffRatios.length === 0 ? null : Math.max(...diffRatios) * 100

    const hasCoverageDrift =
      component.missingSections.length > 0 ||
      component.extraSections.length > 0 ||
      component.missingDemos.length > 0 ||
      component.extraDemos.length > 0 ||
      component.missingApiProps.length > 0 ||
      component.extraApiProps.length > 0
    const hasVisualDrift = visualResults.some((result) => result.flagged)

    return {
      component: component.component,
      status: hasCoverageDrift || hasVisualDrift ? "drift" : "green",
      pairedDemos: component.ourDemos.filter((name) =>
        component.upstreamDemos.some((upstreamName) => normalizeName(upstreamName) === normalizeName(name))
      ),
      missingDemos: component.missingDemos,
      extraDemos: component.extraDemos,
      missingSections: component.missingSections,
      maxDiffPct,
      ignored: ignoredNames,
    }
  })
}

interface CliOptions {
  staticOnly: boolean
  component?: string
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { staticOnly: false }
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === "--static-only") options.staticOnly = true
    else if (arg === "--component") options.component = argv[++index]
    else throw new Error(`check-parity: unrecognized argument "${arg}"`)
  }
  return options
}

async function main(): Promise<number> {
  const options = parseArgs(process.argv.slice(2))
  const outDir = join(REPO_ROOT, "parity-report")
  mkdirSync(outDir, { recursive: true })

  console.log("[check-parity] running coverage detector…")
  const coverageStart = Date.now()
  const coverage = await runCoverageDetector(options.component ? { component: options.component } : {})
  console.log(
    `[check-parity] coverage: ${coverage.components.length} shared components analyzed in ${Date.now() - coverageStart}ms`
  )

  let visual = null
  if (!options.staticOnly) {
    console.log("[check-parity] running visual detector (Playwright)…")
    const visualStart = Date.now()
    visual = await runVisualDetector(options.component ? { component: options.component } : {})
    console.log(
      `[check-parity] visual: ${visual.results.length} demo comparisons in ${Date.now() - visualStart}ms`
    )
  } else {
    console.log("[check-parity] --static-only: skipping visual detector")
  }

  const summary = buildSummary(coverage, visual)

  writeFileSync(join(outDir, "report.json"), JSON.stringify({ summary, coverage, visual }, null, 2))
  renderReport(coverage, visual, join(outDir, "index.html"))
  console.log(`[check-parity] wrote ${join(outDir, "index.html")} and report.json`)

  const drifted = summary.filter((entry) => entry.status === "drift")
  if (drifted.length > 0) {
    console.log(
      `[check-parity] drift found in ${drifted.length}/${summary.length} components (${drifted
        .map((entry) => entry.component)
        .join(", ")}) — see ${join(outDir, "index.html")}`
    )
    return 3
  }

  return 0
}

runCheck("check-parity", main)
