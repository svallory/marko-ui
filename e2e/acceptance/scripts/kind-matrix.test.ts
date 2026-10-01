import { describe, expect, it } from "vitest"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { loadScenarioDoc } from "../lib/scenario-doc.ts"
import type { Scenario, ScenariosDoc } from "../lib/scenario-doc.ts"
import {
  MAX_TIMEOUT_MIN,
  MIN_TIMEOUT_MIN,
  SHARD_OVERHEAD_MIN,
  WORST_CASE_MIN,
  kindMatrix,
} from "./kind-matrix.ts"

const SCRIPT = fileURLToPath(new URL("./kind-matrix.ts", import.meta.url))

function doc(scenarios: Array<Partial<Scenario> & { kind: string }>): ScenariosDoc {
  return {
    scenarios: scenarios.map((s, i) => ({ id: `x.${i}`, tags: [], ...s })),
  } as unknown as ScenariosDoc
}

describe("kindMatrix", () => {
  it("emits one shard per distinct kind, sorted, with scenario counts", () => {
    const { include } = kindMatrix(
      doc([{ kind: "skills" }, { kind: "core" }, { kind: "skills" }])
    )
    expect(include.map((s) => [s.kind, s.scenarios])).toEqual([
      ["core", 1],
      ["skills", 2],
    ])
  })

  it("picks up a brand-new kind with no other change", () => {
    const { include } = kindMatrix(doc([{ kind: "core" }, { kind: "brand-new" }]))
    expect(include.map((s) => s.kind)).toContain("brand-new")
  })

  it("budgets the sum of per-speed worst cases plus overhead", () => {
    const { include } = kindMatrix(
      doc([
        { kind: "k", tags: ["speed:slow"] },
        { kind: "k", tags: ["speed:fast"] },
        { kind: "k", speed: "medium" },
        { kind: "k" }, // unlabelled counts as medium
      ])
    )
    const worst = WORST_CASE_MIN.slow + WORST_CASE_MIN.fast + 2 * WORST_CASE_MIN.medium
    expect(include[0]?.timeout).toBe(Math.max(MIN_TIMEOUT_MIN, worst + SHARD_OVERHEAD_MIN))
  })

  it("never goes below the floor or above GitHub's ceiling", () => {
    const small = kindMatrix(doc([{ kind: "a", tags: ["speed:fast"] }])).include[0]
    expect(small?.timeout).toBe(MIN_TIMEOUT_MIN)
    const huge = kindMatrix(
      doc(Array.from({ length: 200 }, () => ({ kind: "b", tags: ["speed:slow"] })))
    ).include[0]
    expect(huge?.timeout).toBe(MAX_TIMEOUT_MIN)
  })

  it("covers every scenario of the real scenarios.yaml exactly once", () => {
    const real = loadScenarioDoc()
    const { include } = kindMatrix(real)
    expect(include.reduce((n, s) => n + s.scenarios, 0)).toBe(real.scenarios.length)
    expect(new Set(include.map((s) => s.kind)).size).toBe(include.length)
  })
})

describe("kind-matrix CLI", () => {
  it("prints bare JSON, or matrix=<json> with --github", () => {
    const bare = execFileSync("bun", [SCRIPT], { encoding: "utf8" }).trim()
    const parsed = JSON.parse(bare) as { include: unknown[] }
    expect(parsed.include.length).toBeGreaterThan(0)
    const gh = execFileSync("bun", [SCRIPT, "--github"], { encoding: "utf8" }).trim()
    expect(gh).toBe(`matrix=${bare}`)
  })
})
