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
 * - `break` -> stdout. Spacing belongs to the stream of the text it spaces:
 *   the blank lines between `status`'s sections or `doctor`'s check list are
 *   part of that output, and moving them to stderr meant a plain
 *   `marko-ui status > out.txt` produced one run-together block on stdout plus
 *   a column of stray newlines on stderr.
 * - `errorBreak` -> stderr, for the same reason in reverse: the blank lines
 *   framing an error block belong with the error, not with the result. This
 *   is what keeps `--json` output free of leading/trailing blank lines.
 *
 * Nothing writes to both streams for one message: `logger.error` in a command
 * whose failure is also rendered by `handleError` is a bug (the error path
 * prints exactly once, from `handleError`). Use `logger.warn` for a
 * non-fatal note the user should see but that does not end the run.
 */

/**
 * CLI environment variables, and what each one is for.
 *
 * - `MARKO_UI_DEBUG` — set to any non-empty value other than `0`/`false` to
 *   get the detail the normal output deliberately omits. Today that is the
 *   stack trace of an UNEXPECTED exception: a stack is never in the JSON
 *   envelope and never in `details`, because those get logged and pasted into
 *   issues, so with debug off an unexpected failure shows only its message.
 *   The human form says how to turn this on when it matters.
 * - `CI`, `CLAUDECODE`, `AI_AGENT`, `CURSOR_AGENT`, `REPL_ID` — non-interactive
 *   detection, see interactive.ts (they suppress prompts, they do not affect
 *   diagnostics).
 * - `REGISTRY_URL`, `REGISTRY_BASE_URL`, `MARKO_UI_URL` — endpoint overrides,
 *   see registry/constants.ts.
 * - `NO_COLOR` — honoured by kueler, not by us; see CLAUDE.md.
 */
export function isDebugEnabled() {
  const value = process.env.MARKO_UI_DEBUG
  return Boolean(value) && value !== "0" && value !== "false"
}

export const logger = {
  debug(...args: unknown[]) {
    if (isDebugEnabled()) {
      // stderr, not stdout: a debug trail is a diagnostic, and a `--json`
      // run's stdout must stay exactly one document.
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
    console.log("")
  },
  /** A blank line on stderr, for spacing around error output. */
  errorBreak() {
    console.error("")
  },
}