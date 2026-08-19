import { highlighter } from "@/src/utils/highlighter"

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
      console.log(highlighter.info(`[debug] ${args.join(" ")}`))
    }
  },
  error(...args: unknown[]) {
    console.log(highlighter.error(args.join(" ")))
  },
  warn(...args: unknown[]) {
    console.log(highlighter.warn(args.join(" ")))
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
}
