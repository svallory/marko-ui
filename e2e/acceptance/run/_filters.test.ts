/**
 * The load gate, and the filter gate.
 *
 * Two things must never be able to produce a green run:
 *
 * - a `scenarios.yaml` that does not satisfy its own schema, or whose flows,
 *   fixtures or bodies do not resolve. The document is loaded and validated in
 *   `beforeAll` here — the same code path `bun run check:acceptance` and the
 *   vitest config use — so a scenario added and run locally fails exactly the
 *   way it fails CI, before any real install is started.
 * - a filter that selects nothing. That is a typo, not a pass: it fails with
 *   the filter that was asked for and the ids/tags that do exist.
 */
import { beforeAll, describe, expect, it } from "vitest"
import { loadScenarioDoc, type ScenariosDoc } from "../lib/scenario-doc.ts"
import {
  filterSpecFromEnv,
  jobNetwork,
  selectScenarios,
  skipReason,
  targetConfig,
} from "../lib/selection.ts"
import { staticProblems } from "../lib/kind-suite.ts"

let doc: ScenariosDoc

beforeAll(() => {
  // Throws ScenarioDocError with every problem, not just the first.
  doc = loadScenarioDoc()
})

describe("acceptance · the document", () => {
  it("loads and validates against the schema", () => {
    expect(doc.scenarios.length).toBeGreaterThan(0)
    expect(doc.version).toBe(1)
  })

  it("has no unresolvable setup or flow in any selected scenario", () => {
    const problems = selectScenarios(doc, filterSpecFromEnv()).flatMap(
      (scenario) =>
        staticProblems(scenario, doc).map((problem) => `${scenario.id}: ${problem}`)
    )
    expect(problems).toEqual([])
  })
})

describe("acceptance · the selection", () => {
  it("selects at least one scenario (an empty selection is a failure, not a pass)", () => {
    const filter = filterSpecFromEnv()
    const selected = selectScenarios(doc, filter)
    if (selected.length === 0) {
      const wanted = [
        filter.scenarios.length ? `ACCEPTANCE_SCENARIOS=${filter.scenarios.join(",")}` : "",
        filter.tags.length ? `ACCEPTANCE_TAGS=${filter.tags.join(",")}` : "",
        filter.excludeTags.length ? `ACCEPTANCE_EXCLUDE_TAGS=${filter.excludeTags.join(",")}` : "",
      ]
        .filter(Boolean)
        .join(" ")
      throw new Error(
        [
          `the filter selected 0 of ${doc.scenarios.length} scenarios: ${wanted || "(no filter)"}`,
          `scenario ids: ${doc.scenarios.map((scenario) => scenario.id).join(", ")}`,
          `tags in use: ${[...new Set(doc.scenarios.flatMap((scenario) => scenario.tags))].sort().join(", ")}`,
        ].join("\n"),
      )
    }
    expect(selected.length).toBeGreaterThan(0)
  })

  it("reports, in the log, every selected scenario this machine cannot run", () => {
    const target = targetConfig(doc)
    const skipped = selectScenarios(doc, filterSpecFromEnv())
      .map((scenario) => ({ scenario, reason: skipReason(scenario, { target }) }))
      .filter((entry) => entry.reason !== null)
    for (const entry of skipped) {
      console.log(
        `  SKIP ${entry.scenario.id} — ${entry.reason} (job network: ${jobNetwork()})`
      )
    }
    // A skip is legitimate (a missing tool, a different OS); it is never a
    // failure, and it is never silent.
    expect(Array.isArray(skipped)).toBe(true)
  })
})
