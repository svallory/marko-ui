/**
 * Whether the CLI may block on a TTY prompt.
 *
 * A prompt that nothing can answer is worse than a default: the process hangs
 * until the caller times out, having already printed half its output. That is
 * what `init` used to do under `bunx` in an agent session — bun prints its own
 * "Detected an AI agent environment" notice, and the CLI then blocked on
 * `@clack/prompts` anyway.
 *
 * Non-interactive is the union of three independent signals, because each one
 * alone has false negatives:
 *
 * - stdin is not a TTY — piped, redirected from /dev/null, or spawned by a
 *   parent that never attached one. This is the ground truth for "no human can
 *   type an answer", and the one clack itself cannot recover from.
 * - CI — conventional, set by every major CI provider.
 * - An agent/editor harness that runs commands non-interactively.
 *
 * `--yes`/`--defaults` are handled by the caller, not here: they are explicit
 * user intent rather than an environment property.
 */

/** Env vars that mark an automated, non-human caller. */
const NON_INTERACTIVE_ENV_VARS = [
  // Generic CI convention.
  "CI",
  // Claude Code.
  "CLAUDECODE",
  // Common agent/editor harnesses that spawn commands without a TTY.
  "CURSOR_AGENT",
  "REPL_ID",
]

function hasTruthyEnv(env: NodeJS.ProcessEnv, name: string) {
  const value = env[name]
  return Boolean(value) && value !== "0" && value !== "false"
}

/**
 * True when an interactive prompt could actually be answered by a human.
 *
 * `stdin` is passed in (rather than read off `process` directly) so tests can
 * exercise both branches without mutating global state.
 */
export function isInteractive(
  {
    env = process.env,
    stdin = process.stdin,
  }: {
    env?: NodeJS.ProcessEnv
    stdin?: { isTTY?: boolean }
  } = {}
): boolean {
  if (NON_INTERACTIVE_ENV_VARS.some((name) => hasTruthyEnv(env, name))) {
    return false
  }

  return Boolean(stdin?.isTTY)
}

/** Inverse of {@link isInteractive}, for call sites that read better negated. */
export function isNonInteractive(
  options: {
    env?: NodeJS.ProcessEnv
    stdin?: { isTTY?: boolean }
  } = {}
): boolean {
  return !isInteractive(options)
}
