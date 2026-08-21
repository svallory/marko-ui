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
 * This is a periodic-human-review tool, not a pass/fail CI gate: it always
 * exits 0 on a clean run (drift found is the expected steady state — the
 * report is for a human to triage) and exits non-zero only on a genuine
 * tooling failure (crash, missing upstream clone, etc).
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { REPO_ROOT, runCheck } from "./fs-utils.ts"
import { runCoverageDetector } from "./parity/coverage.ts"
import { runVisualDetector } from "./parity/visual.ts"
import { renderReport } from "./parity/report.ts"

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

  writeFileSync(join(outDir, "report.json"), JSON.stringify({ coverage, visual }, null, 2))
  renderReport(coverage, visual, join(outDir, "index.html"))
  console.log(`[check-parity] wrote ${join(outDir, "index.html")} and report.json`)

  return 0
}

runCheck("check-parity", main)
