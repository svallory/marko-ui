/**
 * Derives the CI shard matrix from scenarios.yaml, so a new `kind` becomes a
 * new shard without anybody editing a workflow.
 *
 *   bun e2e/acceptance/scripts/kind-matrix.ts          # prints the matrix JSON
 *   bun e2e/acceptance/scripts/kind-matrix.ts --github # same, as `matrix=<json>` for $GITHUB_OUTPUT
 *
 * Each shard is `{ kind, scenarios, timeout }`; the workflow runs it with
 * `ACCEPTANCE_TAGS=kind:<kind>` (selection.ts matches a `kind:<x>` selector
 * against the scenario's own `kind` field, so every scenario is reachable).
 *
 * The timeout is a derived upper bound, not a guess per kind: scenarios run
 * one at a time (vitest `fileParallelism: false`), so a shard's worst case is
 * the SUM of its scenarios' worst cases. Per-scenario worst cases are the top
 * of the README §Timing ranges — fast 2 min, medium 6, slow 12 — which are
 * estimates until a real CI run replaces them. `SHARD_OVERHEAD_MIN` covers
 * what is not a scenario: checkout, bun install, tool setup, artifact download.
 * The registry build is NOT in it — that is its own job, built once.
 */
import { loadScenarioDoc } from "../lib/scenario-doc.ts"
import type { Scenario, ScenariosDoc } from "../lib/scenario-doc.ts"

export const WORST_CASE_MIN = { fast: 2, medium: 6, slow: 12 } as const
export const SHARD_OVERHEAD_MIN = 15
export const MIN_TIMEOUT_MIN = 30
/** GitHub's hard ceiling is 360; stay under it so a runaway shard is ours to kill. */
export const MAX_TIMEOUT_MIN = 350

export interface Shard {
  kind: string
  scenarios: number
  timeout: number
}

function speedOf(scenario: Scenario): keyof typeof WORST_CASE_MIN {
  const tag = scenario.tags.find((entry) => entry.startsWith("speed:"))
  const speed = (scenario.speed ?? tag?.slice("speed:".length)) as string | undefined
  // An unlabelled scenario is budgeted as medium, the common case, rather than
  // as free.
  return speed === "fast" || speed === "slow" ? speed : "medium"
}

export function kindMatrix(doc: ScenariosDoc): { include: Shard[] } {
  const byKind = new Map<string, Scenario[]>()
  for (const scenario of doc.scenarios) {
    const list = byKind.get(scenario.kind) ?? []
    list.push(scenario)
    byKind.set(scenario.kind, list)
  }
  const include = [...byKind.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([kind, scenarios]) => {
      const worst = scenarios.reduce((sum, s) => sum + WORST_CASE_MIN[speedOf(s)], 0)
      const timeout = Math.min(
        MAX_TIMEOUT_MIN,
        Math.max(MIN_TIMEOUT_MIN, worst + SHARD_OVERHEAD_MIN)
      )
      return { kind, scenarios: scenarios.length, timeout }
    })
  return { include }
}

if (import.meta.main) {
  const matrix = JSON.stringify(kindMatrix(loadScenarioDoc()))
  console.log(process.argv.includes("--github") ? `matrix=${matrix}` : matrix)
}
