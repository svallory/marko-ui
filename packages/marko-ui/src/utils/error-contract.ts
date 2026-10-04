import { RegistryError, RegistryErrorCode } from "@/src/registry/errors"

/**
 * The CLI's error contract.
 *
 * Two rules, one shape:
 *
 * 1. **stdout carries the result, stderr carries everything else.** A program
 *    reading the CLI captures stdout and gets the command's payload — JSON,
 *    markdown, a file list — and never a log line, a spinner frame, a warning
 *    or a failure message. Anything a human reads about a problem goes to
 *    stderr.
 * 2. **A machine never has to parse prose.** When the command was invoked
 *    with `--json`, a failure prints exactly one JSON object on stdout, in
 *    this envelope, and nothing else:
 *
 *    ```json
 *    {
 *      "$type": "marko-ui/error",
 *      "version": 1,
 *      "ok": false,
 *      "error": {
 *        "code": "NOT_FOUND",
 *        "message": "...",
 *        "suggestion": "...",       // optional
 *        "details": { ... }          // optional
 *      }
 *    }
 *    ```
 *
 *    The success envelopes (`marko-ui/doctor`, `marko-ui/search`, ...)
 *    already use `$type`/`version`/`ok`/`data`; this one drops `data` and
 *    carries `error` instead, so `ok:false` plus `$type` is the only thing a
 *    caller has to test.
 *
 * `code` is always one of {@link RegistryErrorCode}'s values — the same set
 * `marko-ui manifest` advertises under `errorCodes` — so the manifest stays
 * the single place to discover the vocabulary.
 */

/** Version of the JSON error envelope. Bump on any breaking field change. */
export const ERROR_ENVELOPE_VERSION = 1

/** `$type` discriminator of the JSON error envelope. */
export const ERROR_ENVELOPE_TYPE = "marko-ui/error"

export type CliErrorEnvelope = {
  $type: typeof ERROR_ENVELOPE_TYPE
  version: typeof ERROR_ENVELOPE_VERSION
  ok: false
  error: {
    code: string
    message: string
    suggestion?: string
    details?: Record<string, unknown>
  }
}

export type CliErrorInput = {
  code: string
  message: string
  suggestion?: string
  details?: Record<string, unknown>
}

/**
 * Build the JSON envelope. `suggestion` and `details` are omitted entirely
 * when absent rather than emitted as null/undefined, so a consumer can test
 * presence with `in`.
 */
export function buildErrorEnvelope(input: CliErrorInput): CliErrorEnvelope {
  const envelope: CliErrorEnvelope = {
    $type: ERROR_ENVELOPE_TYPE,
    version: ERROR_ENVELOPE_VERSION,
    ok: false,
    error: {
      code: input.code,
      message: input.message,
    },
  }
  if (input.suggestion) {
    envelope.error.suggestion = input.suggestion
  }
  if (input.details && Object.keys(input.details).length > 0) {
    envelope.error.details = input.details
  }
  return envelope
}

/**
 * Anything thrown into the error path normalizes to this: the machine shape,
 * the exit code, and whether it is a *deliberate* failure (a known condition
 * the CLI can describe) or an *unexpected* one (a bug). Only unexpected
 * failures get the "open an issue on GitHub" boilerplate — telling someone to
 * file a bug because they typed a component name wrong is worse than useless.
 */
export type NormalizedCliError = {
  envelope: CliErrorEnvelope
  exitCode: number
  unexpected: boolean
}

/** Registry codes that mean "the network or the registry host failed". */
export const NETWORK_ERROR_CODES: readonly string[] = [
  RegistryErrorCode.NETWORK_ERROR,
  RegistryErrorCode.FETCH_ERROR,
]

/**
 * Reduce an unknown thrown value to `{ code, message, details }`. Registry
 * errors carry their own `context` (url, itemName, ...); everything else gets
 * an empty object.
 */
function fromRegistryError(error: RegistryError): CliErrorInput {
  return {
    code: error.code,
    message: error.message,
    suggestion: error.suggestion,
    details: {
      ...error.context,
      // The server-supplied detail string is the one piece of `cause` that
      // reaches a user, and losing it is how "why did this 404?" became
      // unanswerable. A non-string cause (an Error, an object) is reduced to
      // its message; anything else is dropped rather than stringified into
      // something meaningless.
      ...(error.cause !== undefined && error.cause !== null
        ? { cause: stringifyCause(error.cause) }
        : {}),
    },
  }
}

function stringifyCause(cause: unknown): string | undefined {
  if (typeof cause === "string") return cause
  if (cause instanceof Error) return cause.message
  return undefined
}

/**
 * Serialize whatever the process is about to exit with into a value that is
 * guaranteed to survive `JSON.stringify`: drops functions, symbols and
 * cycles, and drops `undefined` values that would otherwise silently
 * disappear mid-object.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export function jsonSafe(
  value: unknown,
  seen: WeakSet<object> = new WeakSet()
): JsonValue | undefined {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value
  }
  if (typeof value === "bigint") return value.toString()
  if (value === undefined || typeof value === "function" || typeof value === "symbol") {
    return undefined
  }
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Error) {
    return { name: value.name, message: value.message }
  }
  if (typeof value === "object") {
    if (seen.has(value)) return "[circular]"
    seen.add(value)
    if (Array.isArray(value)) {
      return value.map((entry) => jsonSafe(entry, seen) ?? null)
    }
    const out: { [key: string]: JsonValue } = {}
    for (const [key, entry] of Object.entries(value)) {
      const safe = jsonSafe(entry, seen)
      if (safe !== undefined) out[key] = safe
    }
    return out
  }
  return undefined
}

export { RegistryErrorCode }