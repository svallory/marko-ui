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

export function isJsonMode(): boolean {
  if (recorded !== undefined) return recorded
  return process.argv.includes("--json")
}