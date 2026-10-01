/**
 * Named helpers: the documented programs a scenario runs instead of an inline
 * `node -e` blob.
 *
 * A helper is a `description` (the contract a reviewer reads), a `language`
 * (`node` or `posix-shell`) and a `source`. The runner writes the source to a
 * real file in a scratch directory OUTSIDE the workspace and executes it, so:
 *
 * - the program is a file, not an argv string, so quoting cannot corrupt it;
 * - `process.argv.slice(2)` / `$1` are the step's `args`, exactly as the
 *   contracts in scenarios.yaml describe them;
 * - the workspace stays clean — a helper leaves no runner artifact in the tree
 *   a scenario is asserting on.
 *
 * There is no third language and no build step, deliberately: the helpers exist
 * because a dozen near-identical inline programs were unreadable, not to
 * introduce a toolchain.
 */
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { run } from "./proc"
import type { Helper } from "./scenario-doc"

export interface HelperResult {
  stdout: string
  stderr: string
  exitCode: number
  /** The argv the helper actually ran with, for a failure message. */
  command: string
}

export function resolveHelper(
  helpers: Record<string, Helper> | undefined,
  name: string
): Helper {
  const helper = helpers?.[name]
  if (!helper) {
    throw new Error(
      `unknown helper "${name}" (declared: ${Object.keys(helpers ?? {}).join(", ") || "none"})`,
    )
  }
  return helper
}

let scratch: string | undefined

function scratchDir(): string {
  scratch ??= mkdtempSync(join(tmpdir(), "marko-ui-helpers-"))
  return scratch
}

/**
 * Runs a helper from `cwd` with `args` as its argv. `node` helpers are written
 * as `.cjs` so `require` is available exactly as the sources are written (the
 * contracts use `require("node:fs")`); `posix-shell` helpers go through `sh`.
 */
export function runHelper(options: {
  helper: Helper
  name: string
  cwd: string
  args: string[]
  env?: Record<string, string | undefined>
  timeoutMs: number
}): HelperResult {
  const { helper, name, cwd, args } = options
  const dir = scratchDir()
  const isNode = helper.language === "node"
  const file = join(dir, `${name}.${isNode ? "cjs" : "sh"}`)
  writeFileSync(file, helper.source)

  const [command, ...prefix] = isNode
    ? ["node", file]
    : ["sh", file]

  const result = run(command, [...prefix, ...args], {
    cwd,
    env: options.env,
    timeoutMs: options.timeoutMs,
  })

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
    command: `${command === "node" ? "node <helper>" : "sh <helper>"} ${name} ${args.join(" ")}`.trim(),
  }
}
