import ora, { type Options } from "ora"
import { isJsonMode } from "@/src/utils/output-mode"

/**
 * ora redraws by moving the cursor over the lines it printed, and works out
 * how many lines that is from the stream's `columns` (ora draws to stderr). On a 0x0 pty (or any
 * stream that reports no width) that maths never terminates, so the spinner
 * is turned off there.
 */
export function canRenderSpinner(stream: { columns?: number } = process.stderr) {
  return Boolean(stream.columns && stream.columns > 0)
}

type SpinnerStream = {
  isTTY?: boolean
  columns?: number
  write: (chunk: string) => unknown
}

/**
 * A spinner for a stream nobody is watching.
 *
 * ora with `isEnabled: false` still writes the "- text" line when the spinner
 * STARTS and the "✔ text" line when it SUCCEEDS, so every step of `add` was
 * printed twice on a non-TTY stderr — once as work in progress that has
 * already finished by the time anyone reads the log, and once as the result.
 *
 * This writes exactly one line per step, at the end, carrying the final state:
 * the thing that happened, not the fact that something was about to happen.
 * Animation frames are the other half of the problem — a log full of carriage
 * returns is unreadable and larger than the command's real output.
 *
 * Under `--json` there is a stronger requirement than "compact": stdout must
 * carry exactly one JSON document and stderr must not narrate anything, so
 * {@link spinner} returns {@link SilentSpinner} instead of this.
 */
class LineSpinner {
  text: string
  #stream: SpinnerStream
  #done = false

  constructor(stream: SpinnerStream, text: string) {
    this.#stream = stream
    this.text = text
  }

  start() {
    return this
  }

  #persist(symbol: string, text: string) {
    if (this.#done) return
    this.#done = true
    this.#stream.write(`${symbol} ${text}\n`)
  }

  succeed(text?: string) {
    this.#persist("✔", text ?? this.text)
    return this
  }

  fail(text?: string) {
    this.#persist("✖", text ?? this.text)
    return this
  }

  warn(text?: string) {
    this.#persist("⚠", text ?? this.text)
    return this
  }

  info(text?: string) {
    this.#persist("ℹ", text ?? this.text)
    return this
  }

  stop() {
    this.#persist("-", this.text)
    return this
  }

  clear() {
    return this
  }
}

/** The no-output spinner: every method exists, nothing is ever written. */
class SilentSpinner {
  text = ""
  start() {
    return this
  }
  succeed(_text?: string) {
    return this
  }
  fail(_text?: string) {
    return this
  }
  warn(_text?: string) {
    return this
  }
  info(_text?: string) {
    return this
  }
  stop() {
    return this
  }
  clear() {
    return this
  }
}

/**
 * The one spinner factory. Returns the same ora-shaped object on every
 * branch, so no call site has to know which mode it is running in.
 *
 * Three branches, in order:
 * 1. `--json` or `--silent`: nothing is written at all. A JSON caller reads
 *    stdout and must not have to filter progress out of stderr, and `--silent`
 *    means what it says.
 * 2. A stream that can be animated (a TTY with a width): real ora.
 * 3. Everything else — a pipe, a log file, a 0x0 pty: {@link LineSpinner},
 *    one line per step, no frames.
 */
export function spinner(
  text: Options["text"],
  options?: {
    silent?: boolean
    /** Test seam; defaults to stderr, which is where ora draws. */
    stream?: SpinnerStream
  }
) {
  const stream = options?.stream ?? process.stderr

  if (options?.silent || isJsonMode()) {
    return new SilentSpinner()
  }

  if (stream.isTTY && canRenderSpinner(stream)) {
    return ora({ text, isSilent: options?.silent })
  }

  return new LineSpinner(stream, String(text))
}