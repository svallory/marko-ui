import ora, { type Options } from "ora"

/**
 * ora redraws by moving the cursor over the lines it printed, and works out
 * how many lines that is from the stream's `columns` (ora draws to stderr). On a 0x0 pty (or any
 * stream that reports no width) that maths never terminates, so the spinner
 * is turned off there.
 */
export function canRenderSpinner(stream: { columns?: number } = process.stderr) {
  return Boolean(stream.columns && stream.columns > 0)
}

export function spinner(
  text: Options["text"],
  options?: {
    silent?: boolean
  }
) {
  return ora({
    text,
    isSilent: options?.silent,
    // Only forced off, never forced on: ora's own TTY detection still applies.
    ...(canRenderSpinner() ? {} : { isEnabled: false }),
  })
}
