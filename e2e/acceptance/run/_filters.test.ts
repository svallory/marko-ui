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
import {
  loadScenarioDoc,
  type Scenario,
  type ScenariosDoc,
} from "../lib/scenario-doc.ts"
import {
  currentOs,
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
    // failure, and it is never silent. What is asserted is the shape of the
    // decision, computed below and by name.
    expect(skipped.every((entry) => entry.reason !== null)).toBe(true)
  })

  // The review's finding, taken: the assertion above could not fail. These pin
  // the actual skip DECISION, with a real scenario from the document and a real
  // reason, so breaking skipReason — or the comparison it rests on — fails here
  // instead of turning a skip into a silent pass or a spurious failure.
  describe("the skip decision itself", () => {
    // Computed inside each test, not at collection time: the document is
    // loaded in `beforeAll`, and a describe body runs before any hook.
    const find = (id: string): Scenario => {
      const found = doc.scenarios.find((scenario) => scenario.id === id)
      if (!found) throw new Error(`no scenario called ${id} — the test moved`)
      return found
    }

    it("returns no reason for a scenario this machine can run", () => {
      const target = targetConfig(doc)
      expect(skipReason(find("core.init-defaults-copy"), { target })).toBeNull()
    })

    it("skips with a reason naming the OS a scenario needs and this one does not have", () => {
      // Every scenario in the suite lists os:linux, os:macos and/or
      // os:windows; a Windows-only requirement is a decision this host has to
      // reach, and the reason has to name what was required.
      const target = targetConfig(doc)
      const windowsOnly = {
        ...find("core.init-defaults-copy"),
        requires: { os: ["windows" as const] },
      }
      const reason = skipReason(windowsOnly, { target })
      expect(reason).toBe(
        `requires os windows; this machine is ${currentOs()}`
      )
    })

    it("skips with a reason naming a tool that is not installed", () => {
      const target = targetConfig(doc)
      const reason = skipReason(
        { ...find("core.init-defaults-copy"), requires: { tools: ["definitely-not-a-real-binary"] } },
        { target }
      )
      expect(reason).toBe(
        "requires the `definitely-not-a-real-binary` binary on PATH"
      )
    })

    it("skips a known-bug scenario with its bug text, and never fails it", () => {
      const target = targetConfig(doc)
      const reason = skipReason(
        {
          ...find("core.init-defaults-copy"),
          status: "known-bug",
          bug: "marko-ui-9ce.7",
        },
        { target }
      )
      expect(reason).toBe("status: known-bug — marko-ui-9ce.7")
    })

    it("lets a granted gate run, and skips it when the gate is not granted", () => {
      const target = targetConfig(doc)
      const gated = {
        ...find("core.init-defaults-copy"),
        status: "needs-cli-guards" as const,
        tags: [...find("core.init-defaults-copy").tags, "needs:cli-guards"],
      }
      expect(skipReason(gated, { target })).toMatch(/needs:cli-guards/)
      expect(
        skipReason(gated, { target, granted: ["cli-guards"] })
      ).toBeNull()
    })
  })
})
