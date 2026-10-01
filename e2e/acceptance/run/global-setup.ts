/**
 * Per-run setup, in the vitest MAIN process.
 *
 * The local registry mirror is the one suite resource that is not per-scenario:
 * it is built once, served on a port shared with the CLI scenario suite, and
 * used by whichever scenarios ask for it with `$ACCEPTANCE_MIRROR_PORT`. So it
 * is started here — once, before any test file loads — rather than lazily inside
 * a worker, and stopped at teardown ONLY if this run is the one that started it
 * (see lib/registry.ts for the health check and the lock rules; in particular,
 * this never takes /tmp/marko-ui-heavy.lock, because a caller may already hold
 * it and that would be a self-deadlock).
 *
 * A run whose selection needs no mirror starts nothing and builds nothing.
 */
import { loadScenarioDoc } from "../lib/scenario-doc.ts"
import { filterSpecFromEnv, selectScenarios } from "../lib/selection.ts"
import { scenarioNeedsMirror } from "../lib/run-scenario.ts"
import { sharedLocalRegistry, stopSharedLocalRegistry } from "../lib/registry.ts"

export async function setup(): Promise<void> {
  let doc
  try {
    doc = loadScenarioDoc()
  } catch {
    // A broken document is _filters.test.ts's failure to report, with a better
    // message than anything setup() could add. Starting a mirror for a
    // document nobody can read would be worse than not starting one.
    return
  }

  const selected = selectScenarios(doc, filterSpecFromEnv())
  if (!selected.some((scenario) => scenarioNeedsMirror(doc, scenario))) return

  const registry = await sharedLocalRegistry()
  console.log(
    `  registry mirror: ${registry.url} (${registry.startedHere ? "started by this run" : "already serving — reused"})`
  )
}

export async function teardown(): Promise<void> {
  await stopSharedLocalRegistry()
}
