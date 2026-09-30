import { afterAll, it } from "vitest"
import { cleanupWorkspaces } from "./harness"

afterAll(cleanupWorkspaces)

/**
 * `scenario("S01", "title", { fails: "D2" }, fn)`.
 *
 * A scenario whose expectation the CLI does not meet today is registered with
 * `it.fails` and its defect id: the suite stays green now, and turns RED the
 * moment the CLI dev fixes the defect — at which point the `fails` mark must
 * be removed (never the assertion weakened). Ids match notes/cli-test-plan.md.
 */
export function scenario(
  id: string,
  title: string,
  opts: { fails?: string } | (() => Promise<void>),
  fn?: () => Promise<void>
) {
  const body = typeof opts === "function" ? opts : fn!
  // SCENARIOS_SHOW_FAILURES=1 runs known failures as plain tests, so the real
  // assertion output (the defect report) is visible instead of "expected fail".
  const fails =
    typeof opts === "function" || process.env.SCENARIOS_SHOW_FAILURES
      ? undefined
      : opts.fails
  const known = typeof opts === "function" ? undefined : opts.fails
  const name = `${id} ${title}${known ? ` [known failure: ${known}]` : ""}`
  return fails ? it.fails(name, body) : it(name, body)
}
