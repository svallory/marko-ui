import { highlighter } from "@/src/utils/highlighter"

/**
 * Diagnostic output.
 *
 * **Stream routing is part of the CLI's contract** (see error-contract.ts):
 * stdout carries the command's result and nothing else; stderr carries
 * everything a human reads about a problem. Concretely:
 *
 * - `log` / `info` / `success` / `debug` -> stdout. They are results.
 * - `error` / `warn` -> stderr. They are diagnostics about the run.
 * - `break` -> stderr. A blank line is spacing, never payload; putting it on
 *   stdout meant a redirected `marko-ui doctor > out.txt` carried blank
 *   lines that no parser asked for, and — worse — meant the blank lines that
 *   surround an error block landed on stdout even when the error itself was
 *   the JSON envelope.
 *
 * Nothing writes to both streams for one message: `logger.error` in a command
 * whose failure is also rendered by `handleError` is a bug (the error path
 * prints exactly once, from `handleError`). Use `logger.warn` for a
 * non-fatal note the user should see but that does not end the run.
 */

/**
 * Diagnostic output for failures the CLI deliberately continues past (stale
 * backup files, best-effort cleanup). Off unless MARKO_UI_DEBUG is set, so
 * normal runs stay quiet, but the trail exists when someone goes looking —
 * previously these were swallowed with no record at all.
 */
function isDebugEnabled() {
  const value = process.env.MARKO_UI_DEBUG
  return Boolean(value) && value !== "0" && value !== "false"
}

export const logger = {
  debug(...args: unknown[]) {
    if (isDebugEnabled()) {
      console.error(highlighter.info(`[debug] ${args.join(" ")}`))
    }
  },
  error(...args: unknown[]) {
    console.error(highlighter.error(args.join(" ")))
  },
  warn(...args: unknown[]) {
    console.error(highlighter.warn(args.join(" ")))
  },
  info(...args: unknown[]) {
    console.log(highlighter.info(args.join(" ")))
  },
  success(...args: unknown[]) {
    console.log(highlighter.success(args.join(" ")))
  },
  log(...args: unknown[]) {
    console.log(args.join(" "))
  },
  break() {
    console.error("")
  },
}