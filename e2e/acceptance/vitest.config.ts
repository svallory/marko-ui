import { defineConfig } from "vitest/config"
import { loadScenarioDoc } from "./lib/scenario-doc.ts"
import { filterSpecFromEnv, selectScenarios } from "./lib/selection.ts"

/** The files that are always in a run: the gates and the hermetic unit tests. */
const GATE_FILES = [
  "run/_filters.test.ts",
  "run/_runner-internals.test.ts",
  "run/_mirror-lifecycle.test.ts",
  // The CI shard derivation (cheap, pure): a broken matrix must fail every shard.
  "scripts/kind-matrix.test.ts",
]

// The document is loaded HERE as well as in each test file, because this config
// decides which files exist for this run: a filter that selects three scenarios
// must not load the other ten kind files, and a filter that selects nothing
// must fail loudly rather than report a green run with no tests. The load is
// the same code the suite uses (lib/scenario-doc.ts), so the two can never
// disagree about what the file says.
const filter = filterSpecFromEnv()
const filtered =
  filter.scenarios.length > 0 ||
  filter.tags.length > 0 ||
  filter.excludeTags.length > 0

let kinds: string[] | null = null
try {
  const doc = loadScenarioDoc()
  kinds = [...new Set(selectScenarios(doc, filter).map((scenario) => scenario.kind))]
} catch (error) {
  // Printed here and again by run/_filters.test.ts, which fails on it: the
  // point is that a broken scenarios.yaml can never produce a passing run.
  console.error(`\n✗ ${(error as Error).message}\n`)
  kinds = null
}

const include =
  kinds === null
    ? [...GATE_FILES, "lib/pm.test.ts"]
    : [
        ...GATE_FILES,
        // Pure argv tests from sweep-b, no pnpm/yarn/network: cheap enough to run
        // in EVERY invocation, filtered or not, so a driver's flag cannot go
        // missing between full-suite runs.
        "lib/pm.test.ts",
        ...kinds.map((kind) => `run/${kind}.test.ts`),
        // The pre-runner acceptance files (the copy path, the import path,
        // add/doctor/diff, registry health) are folded into scenarios.yaml and
        // deleted when the scenarios that replace them are green. Until then
        // they still run — but only unfiltered, since they know nothing about
        // ACCEPTANCE_SCENARIOS/ACCEPTANCE_TAGS.
        ...(filtered ? [] : ["*.test.ts"]),
      ]

// Separate config from the root/CLI vitest configs (see AGENTS.md): these
// tests shell out to real `bun`/`node`/`npm`/`pnpm`/`yarn` processes, scaffold
// real projects and hit the network, so they are slow and network-dependent —
// never bundled into `bun run test`.
export default defineConfig({
  test: {
    root: import.meta.dirname,
    include,
    // Per-RUN setup, in this process: starts the local registry mirror once if
    // any selected scenario needs it, and stops it at teardown only if this run
    // started it. See run/global-setup.ts and lib/registry.ts.
    globalSetup: ["./run/global-setup.ts"],
    // A per-test timeout is passed explicitly (a scenario's own budget is
    // derived from its steps); this is only the fallback.
    testTimeout: 5 * 60_000,
    hookTimeout: 5 * 60_000,
    // Each journey spawns several real installs; run them one at a time so they
    // don't stampede the same global package-manager cache/lockfile work.
    fileParallelism: false,
    reporters: process.env.CI ? ["default", "json"] : ["default"],
    outputFile: process.env.CI ? { json: "results.json" } : undefined,
  },
})
