/**
 * The one place JSON leaves the CLI.
 *
 * Two rules, one function:
 *
 * 1. **Compact for programs, pretty for humans.** Pretty-printed JSON costs
 *    28-43% more tokens than minified for the same data, and the readers of
 *    this output are mostly AI agents where every token is paid for. A TTY is
 *    the honest proxy for "a human is reading this": that is the case
 *    indentation exists for. So stdout indented by 2 when it is a terminal,
 *    and a single line when it is not. There is deliberately no `--pretty`
 *    flag — the machine case is the default case, and a flag that only exists
 *    to undo the default is a flag an agent has to know about.
 * 2. **One envelope for success.** Every `--json` payload is
 *    `{ $type, version, ok, data }`, so a caller can branch on `$type` before
 *    it knows which command produced the document. Failures use the sibling
 *    `marko-ui/error` envelope (see error-contract.ts).
 *
 * No command calls `JSON.stringify` for output itself: a direct call is how
 * the pretty/compact split drifts per command, and how `search` ended up
 * outside the envelope while `doctor` was inside it.
 */

/** Indent width used when a human is reading the terminal. */
export const JSON_INDENT = 2

/** Version of every JSON document the CLI prints. Bump on a breaking change. */
export const ENVELOPE_VERSION = 1

/**
 * Indentation for `stream`: pretty for a terminal, minified for a pipe.
 * `stream` is injectable so both branches are testable without a real TTY.
 */
export function jsonIndent(stream: { isTTY?: boolean } = process.stdout): number {
  return stream.isTTY ? JSON_INDENT : 0
}

/** Serialize `value` the way {@link printJson} would write it. */
export function formatJson(
  value: unknown,
  options: { stream?: { isTTY?: boolean } } = {}
): string {
  return JSON.stringify(value, null, jsonIndent(options.stream ?? process.stdout))
}

/**
 * Print one JSON document to stdout, followed by a newline. The ONLY way a
 * command prints JSON.
 */
export function printJson(
  value: unknown,
  options: { stream?: { isTTY?: boolean } } = {}
): void {
  process.stdout.write(`${formatJson(value, options)}\n`)
}

export type SuccessEnvelope<T = unknown> = {
  $type: string
  version: typeof ENVELOPE_VERSION
  /**
   * `false` is reserved for a command whose RESULT is a report rather than an
   * answer — `doctor` finds problems without the doctor itself failing. A
   * caller must not use it to report an error: an error is `ok: false` on a
   * `marko-ui/error` envelope (see error-contract.ts), which is the only
   * document that carries an `error` field.
   */
  ok: boolean
  data: T
}

export type EnvelopeOptions = {
  stream?: { isTTY?: boolean }
  ok?: boolean
}

/** Wrap `data` in the shared success envelope. */
export function buildSuccessEnvelope<T>(
  $type: string,
  data: T,
  options: EnvelopeOptions = {}
): SuccessEnvelope<T> {
  return {
    $type,
    version: ENVELOPE_VERSION,
    ok: options.ok ?? true,
    data,
  }
}

/**
 * Print `data` in the shared success envelope. Returns the printed envelope so
 * a caller can assert on it in a test without capturing stdout twice.
 */
export function printEnvelope<T>(
  $type: string,
  data: T,
  options: EnvelopeOptions = {}
): SuccessEnvelope<T> {
  const envelope = buildSuccessEnvelope($type, data, options)
  printJson(envelope, { stream: options.stream })
  return envelope
}