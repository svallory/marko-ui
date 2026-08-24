/**
 * check-parity.ts — orchestrates the two parity-drift detectors and emits
 * parity-report/{report.json,index.html}.
 *
 * Usage:
 *   bun tooling/check-parity.ts [--static-only] [--component <slug>] [--strict]
 *
 * --static-only skips the Playwright visual detector entirely (for CI
 * without a running docs dev server, or a quick coverage-only check).
 * --component restricts both detectors to one shared component slug.
 * --strict switches the coverage detector's presence check to
 * post-migration mode (canonical bucket names only — see coverage.ts's
 * `isTargetPresent` and SCHEMA.md's "Transition mode"). Off by default:
 * our docs pages aren't migrated to the canonical hierarchy yet, so the
 * default (transition) mode accepts either the canonical bucket name or
 * the section's original upstream heading as "present."
 *
 * Exit-code contract (matches the repo's doctor/validate convention, see
 * `marko-ui doctor --json`): 0 = green, no drift found. 3 = drift found —
 * at least one non-ignored coverage mismatch (missing demo/extra demo,
 * missing mapped target, or API prop) or at least one visual result over
 * threshold. UNCLASSIFIED sections never contribute to drift/exit 3 — see
 * coverage.ts's classification pipeline and SCHEMA.md: they're a to-map
 * queue, not drift. 2 = tooling crash (thrown from `main`, handled by
 * `runCheck`). The report is always written on a successful run
 * (coverage.json/index.html), regardless of exit code — 3 means "look at
 * the report," not "the run failed."
 * tooling/parity/runner/SCHEMA.md documents the report JSON shape this
 * reads. See tooling/parity/PROTOCOL.md for the harness protocol (how
 * parity-facts.json is produced) that the coverage detector now consumes
 * instead of parsing MDX/manifests directly.
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { REPO_ROOT, runCheck } from "./fs-utils.ts"
import { runCoverageDetector, normalizeName, loadIgnoreList, type CoverageReport } from "./parity/runner/coverage.ts"
import { runStructureDetector, type StructureReport } from "./parity/runner/structure.ts"
import { runVisualDetector, type VisualReport } from "./parity/runner/visual.ts"
import { renderReport } from "./parity/runner/report.ts"

/** One component's entry in report.json's stable `summary` array — see SCHEMA.md. */
export interface ComponentSummary {
  component: string
  status: "green" | "drift"
  pairedDemos: string[]
  missingDemos: string[]
  extraDemos: string[]
  missingMappedTargets: string[]
  unclassifiedCount: number
  maxDiffPct: number | null
  ignored: string[]
  /** True if ANY paired demo for this component has structural differences (see structure.ts) — element/role counts, text content, or nesting depth. Flags regardless of pixel score, since a structural miss (missing icon, missing row) can score near-zero on a diluted or even correctly tight-boxed pixel diff if it happens to be visually subtle. */
  structuralDrift: boolean
}

/**
 * Builds the stable, documented `summary` array (tooling/parity/SCHEMA.md)
 * from the two detectors' raw output. This is the shape external
 * consumers should read — `coverage`/`visual` in the same report.json are
 * the detectors' full internal shapes, kept for the HTML report and for
 * debugging, but not contractually stable.
 */
function buildSummary(
  coverage: CoverageReport,
  structure: StructureReport | null,
  visual: VisualReport | null
): ComponentSummary[] {
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

    const structureResults = structure?.results.filter((result) => result.component === component.component) ?? []
    const structuralDrift = structureResults.some((result) => result.flagged)

    // Unclassified sections are NEVER drift (a to-map queue, not a defect)
    // — see coverage.ts's classification pipeline and SCHEMA.md.
    const hasCoverageDrift =
      component.missingMappedTargets.length > 0 ||
      component.missingDemos.length > 0 ||
      component.extraDemos.length > 0 ||
      component.missingApiProps.length > 0 ||
      component.extraApiProps.length > 0
    const hasVisualDrift = visualResults.some((result) => result.flagged)

    return {
      component: component.component,
      status: hasCoverageDrift || structuralDrift || hasVisualDrift ? "drift" : "green",
      pairedDemos: component.ourDemos.filter((name) =>
        component.upstreamDemos.some((upstreamName) => normalizeName(upstreamName) === normalizeName(name))
      ),
      missingDemos: component.missingDemos,
      extraDemos: component.extraDemos,
      missingMappedTargets: component.missingMappedTargets.map((entry) => entry.heading),
      unclassifiedCount: component.unclassifiedCount,
      maxDiffPct,
      ignored: ignoredNames,
      structuralDrift,
    }
  })
}

interface CliOptions {
  staticOnly: boolean
  component?: string
  strict: boolean
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { staticOnly: false, strict: false }
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === "--static-only") options.staticOnly = true
    else if (arg === "--component") options.component = argv[++index]
    else if (arg === "--strict") options.strict = true
    else throw new Error(`check-parity: unrecognized argument "${arg}"`)
  }
  return options
}

/**
 * Runs both harnesses' extract steps (tooling/parity/PROTOCOL.md, "The
 * extraction step contract") so a fresh parity-facts.json backs every
 * check-parity run — mirrors the old coverage.ts's behavior of parsing
 * MDX/manifests live on every invocation, now done by each harness's own
 * extract script instead of inline here.
 */
async function extractFacts(): Promise<void> {
  const shadcnExtract = join(REPO_ROOT, "tooling", "parity", "harnesses", "shadcn", "extract", "index.ts")
  const markoUiExtract = join(REPO_ROOT, "tooling", "parity", "harnesses", "marko-ui", "extract", "index.ts")
  const { extract: extractShadcn } = (await import(shadcnExtract)) as { extract: () => Promise<unknown> }
  const { extract: extractMarkoUi } = (await import(markoUiExtract)) as { extract: () => Promise<unknown> }

  const { writeFileSync: write } = await import("node:fs")
  const shadcnFacts = await extractShadcn()
  write(
    join(REPO_ROOT, "tooling", "parity", "harnesses", "shadcn", "parity-facts.json"),
    JSON.stringify(shadcnFacts, null, 2)
  )
  const markoUiFacts = await extractMarkoUi()
  write(
    join(REPO_ROOT, "tooling", "parity", "harnesses", "marko-ui", "parity-facts.json"),
    JSON.stringify(markoUiFacts, null, 2)
  )
}

async function main(): Promise<number> {
  const options = parseArgs(process.argv.slice(2))
  const outDir = join(REPO_ROOT, "parity-report")
  mkdirSync(outDir, { recursive: true })

  console.log("[check-parity] extracting parity-facts.json for both harnesses…")
  await extractFacts()

  console.log(`[check-parity] running coverage detector… (strict: ${options.strict})`)
  const coverageStart = Date.now()
  const coverage = await runCoverageDetector({ component: options.component, strict: options.strict })
  console.log(
    `[check-parity] coverage: ${coverage.components.length} shared components analyzed in ${Date.now() - coverageStart}ms — ${coverage.unclassifiedTotal} unclassified section(s), see parity-report/unclassified.json`
  )

  let structure: StructureReport | null = null
  let visual = null
  if (!options.staticOnly) {
    // Structure runs BEFORE pixels — cheap (Playwright evaluate + plain
    // diffing, no odiff round-trip) and catches anything expressible as
    // element/role counts or text content, so visual only has to catch
    // what's left: spacing, color, layout shape. See PROTOCOL.md's
    // "Three-tier detection: coverage -> structure -> pixels".
    console.log("[check-parity] running structural detector (Playwright, pre-pixel)…")
    const structureStart = Date.now()
    structure = await runStructureDetector(options.component ? { component: options.component } : {})
    const structuralFlags = structure.results.filter((result) => result.flagged).length
    console.log(
      `[check-parity] structure: ${structure.results.length} demo comparisons in ${Date.now() - structureStart}ms — ${structuralFlags} flagged`
    )

    console.log("[check-parity] running visual detector (Playwright)…")
    const visualStart = Date.now()
    visual = await runVisualDetector(options.component ? { component: options.component } : {})
    console.log(
      `[check-parity] visual: ${visual.results.length} demo comparisons in ${Date.now() - visualStart}ms`
    )
  } else {
    console.log("[check-parity] --static-only: skipping structural + visual detectors")
  }

  const summary = buildSummary(coverage, structure, visual)

  writeFileSync(join(outDir, "report.json"), JSON.stringify({ summary, coverage, structure, visual }, null, 2))
  renderReport(coverage, structure, visual, join(outDir, "index.html"))
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
