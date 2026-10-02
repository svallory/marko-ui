/**
 * The vitest shape: one test per scenario, grouped by kind.
 *
 * `run/<kind>.test.ts` is a two-line file that calls `describeKind("<kind>")`;
 * everything else — which scenarios are selected, whether this machine can run
 * one, how long it may take — is decided here, from the same document the
 * validator checks. A failure therefore names the scenario id, the step index,
 * the command and the expectation that did not hold, without opening the YAML.
 *
 * The scenarios of one kind are `describe.each`-ed rather than hand-written, so
 * adding a scenario to scenarios.yaml adds a test with no code change, and a
 * scenario nobody runs cannot hide (it is either selected, or reported as
 * filtered out, or reported as skipped with a reason).
 */
import { describe, it } from "vitest"
import { loadScenarioDoc, type Scenario, type ScenariosDoc } from "./scenario-doc.ts"
import {
  expandSteps,
  resolveSetup,
  runScenario,
} from "./run-scenario.ts"
import {
  filterSpecFromEnv,
  selectScenarios,
  skipReason,
  targetConfig,
} from "./selection.ts"
import { ptyAvailable } from "./pty.ts"

/** Setup (scaffold + install + the CLI) gets its own budget on top of the steps. */
const SETUP_BUDGET_MS = 15 * 60_000
/** No single scenario is allowed more than this, however many steps it has. */
const MAX_SCENARIO_MS = 45 * 60_000

export function scenarioTimeout(
  scenario: Scenario,
  doc: ScenariosDoc,
  defaultStepSeconds: number
): number {
  const steps = expandSteps(scenario.steps, doc)
  const total =
    SETUP_BUDGET_MS +
    steps.reduce(
      (sum, step) => sum + (step.timeoutSeconds ?? defaultStepSeconds) * 1000,
      0
    )
  return Math.min(total, MAX_SCENARIO_MS)
}

export function describeKind(kind: string): void {
  const doc = loadScenarioDoc()
  const target = targetConfig(doc)
  const selected = selectScenarios(doc, filterSpecFromEnv()).filter(
    (scenario) => scenario.kind === kind
  )

  describe(`acceptance · ${kind}`, () => {
    for (const scenario of selected) {
      const reason = skipReason(scenario, { target })
      const ptySteps = expandSteps(scenario.steps, doc).some(
        (step) => step.stdin === "pty"
      )
      const blocked =
        reason ??
        (ptySteps && !ptyAvailable()
          ? "requires the `expect` binary, which drives the pty steps"
          : null)

      if (blocked) {
        // Printed, not silent: a skipped scenario is how coverage quietly
        // disappears, and the reason is what makes it actionable.
        console.log(`  SKIP ${scenario.id} — ${blocked}`)
      }

      it.skipIf(blocked !== null)(
        scenario.id,
        async () => {
          await runScenario({
            doc,
            scenario,
            target,
            log: (message) => console.log(message),
          })
        },
        scenarioTimeout(scenario, doc, target.timeoutSeconds)
      )
    }
  })
}

/** Every scenario's setup and steps must resolve, whether or not it is selected. */
export function staticProblems(scenario: Scenario, doc: ScenariosDoc): string[] {
  const problems: string[] = []
  try {
    const setup = resolveSetup(doc, scenario)
    if (!setup.noScaffold && !setup.scaffold) {
      problems.push("setup has neither a fixture scaffold nor noScaffold")
    }
    expandSteps(scenario.steps, doc)
  } catch (error) {
    problems.push((error as Error).message)
  }
  return problems
}
