/**
 * Whether the current invocation asked for machine-readable output.
 *
 * Only commands that declare `--json` need to record it, and they do so as
 * the first thing in their action (before any work that could fail), so
 * `handleError` can emit the JSON error envelope instead of prose no matter
 * how early the failure happened.
 *
 * When no command has recorded a value, the fallback is a scan of `argv`. It
 * covers the window before an action runs at all, and it is why a program can
 * pass `--json` through without every command remembering to call
 * `setJsonMode`.
 */
let recorded: boolean | undefined

export function setJsonMode(value: boolean) {
  recorded = value
}

/** Test/teardown helper: forget any recorded mode. */
export function resetJsonMode() {
  recorded = undefined
}

/**
 * The recorded mode, or FALSE when nothing was recorded.
 *
 * Deliberately no argv fallback here. There was one, to cover the window
 * before a command's action runs, and it misfired: `registry add -- --json`
 * — a command with no `--json` flag, where `--json` is a POSITIONAL — was
 * treated as JSON mode, answered with a JSON error envelope and had its
 * `logger.info` output swallowed. Every command that takes the flag records
 * it as its first statement; a command that does not take it must not go
 * looking for it in argv. Use {@link isJsonModeForErrors} where the pre-action
 * window genuinely has to be covered.
 */
export function isJsonMode(): boolean {
  return recorded === true
}

/**
 * For `handleError` only, which can run before any action has recorded a mode
 * (commander's own option parsing rejects `--json` before the action fires).
 *
 * Narrow on purpose: it inspects the option TOKENS, so a `--json` that comes
 * after `--` — i.e. is a positional — is not counted.
 */
export function isJsonModeForErrors(argv: string[] = process.argv): boolean {
  const separator = argv.indexOf("--")
  const tokens = separator === -1 ? argv : argv.slice(0, separator)
  return tokens.includes("--json")
}