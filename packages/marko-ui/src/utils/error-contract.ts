import { RegistryError, RegistryErrorCode } from "@/src/registry/errors"
import path from "node:path"

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
      // The message reaches BOTH the human stderr block and stdout, so it is
      // scrubbed here — at the one choke point — rather than trusted to have
      // been cleaned by each caller.
      message: scrubUrlsInText(input.message),
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
  /**
   * The original thrown value, kept so the debug path can print a real stack.
   * Never serialized into the envelope: `details` is a field that gets logged
   * and pasted into issues, and a stack is a wall of absolute build paths.
   */
  raw?: unknown
}

/** Registry codes that mean "the network or the registry host failed". */
export const NETWORK_ERROR_CODES: readonly string[] = [
  RegistryErrorCode.NETWORK_ERROR,
  RegistryErrorCode.FETCH_ERROR,
]

/**
 * True when `error` is a connection failure rather than a bug.
 *
 * Native `fetch` reports "cannot reach the host" as a generic `TypeError:
 * fetch failed` with the real reason (ECONNREFUSED, ENOTFOUND, ETIMEDOUT,
 * an AggregateError of per-address failures) buried in `cause`. Without this,
 * an unreachable registry reached a path that only knew `error instanceof
 * Error` and was classified UNKNOWN_ERROR with the "open an issue on GitHub"
 * boilerplate — telling the user to file a bug about their own network.
 *
 * Deliberately narrow: a TypeError that is not fetch's, and a message with no
 * network marker in it, are left alone so a genuine bug is still reported as
 * one.
 */
export function looksLikeNetworkFailure(error: unknown, depth = 0): boolean {
  if (depth > 5) return false

  if (error instanceof TypeError) {
    // undici/Node's two wordings for the same condition.
    if (/fetch failed|failed to fetch|network|socket|connection/i.test(error.message)) {
      return true
    }
    return looksLikeNetworkFailure(
      (error as TypeError & { cause?: unknown }).cause,
      depth + 1
    )
  }

  if (error instanceof AggregateError) {
    return error.errors.some((entry) => looksLikeNetworkFailure(entry, depth + 1))
  }

  if (error instanceof Error) {
    const code = (error as Error & { code?: unknown }).code
    if (typeof code === "string" && NETWORK_SYSCALL_CODES.has(code)) return true
    if (/ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|EHOSTUNREACH|ENETUNREACH|EAI_AGAIN|UND_ERR_SOCKET/i.test(error.message)) {
      return true
    }
    if ("errors" in error) {
      const nested = (error as Error & { errors?: unknown }).errors
      if (Array.isArray(nested)) {
        return nested.some((entry) => looksLikeNetworkFailure(entry, depth + 1))
      }
    }
    return looksLikeNetworkFailure(
      (error as Error & { cause?: unknown }).cause,
      depth + 1
    )
  }

  return false
}

const NETWORK_SYSCALL_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ETIMEDOUT",
  "EPIPE",
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
])

/**
 * Build a NETWORK_ERROR `RegistryError` from a raw fetch/proxy failure.
 *
 * The message names the URL so the user knows WHICH registry is unreachable,
 * and the syscall reason goes in `cause` (surfaced as `details.cause`), which
 * is what tells them whether to retry or fix DNS.
 */
export function asNetworkError(
  error: unknown,
  options: { url?: string; context?: Record<string, unknown> } = {}
): RegistryError {
  const reason = networkFailureReason(error)
  const url = options.url
  const message = url
    ? `Could not reach the registry at ${redactUrl(url)}${reason ? ` (${reason})` : ""}.`
    : `Could not reach the network${reason ? `: ${reason}` : "."}`

  return new RegistryError(message, {
    code: RegistryErrorCode.NETWORK_ERROR,
    cause: error,
    context: {
      ...options.context,
      ...(url ? { url: redactUrl(url) } : {}),
      ...(reason ? { reason } : {}),
    },
    suggestion:
      "Check the registry URL in components.json, your network connection, and any proxy or firewall in between, then retry.",
  })
}

/**
 * Build an INVALID_CONFIG `RegistryError` for a registry URL that cannot be
 * turned into a request at all.
 *
 * `entry` names the offending registry so the suggestion points at the one
 * line to edit rather than making the user audit every configured URL.
 */
export function asConfigError(
  error: unknown,
  options: { url?: string; entry?: string } = {}
): RegistryError {
  const url = options.url ? redactUrl(options.url) : undefined
  const subject = options.entry
    ? `Registry "${options.entry}"`
    : url
      ? `The registry at ${url}`
      : "The registry"
  // undici's own message quotes the offending URL verbatim — credentials
  // included. Scrubbed here so the thrown error never HOLDS the secret, not
  // merely so the renderer happens to hide it.
  const reason = scrubUrlsInText(
    error instanceof Error ? error.message : String(error)
  )
  const message = `${subject} could not be turned into a request: ${reason}`

  return new RegistryError(message, {
    code: RegistryErrorCode.INVALID_CONFIG,
    cause: error,
    context: { ...(url ? { url } : {}), ...(options.entry ? { entry: options.entry } : {}) },
    suggestion: `Check the "${
      options.entry ?? "registries"
    }" entry in components.json: the URL must be an absolute http(s) URL, and credentials belong in headers, not in the URL.`,
  })
}

/** The syscall-level reason behind a fetch failure, e.g. `ECONNREFUSED`. */
export function networkFailureReason(error: unknown, depth = 0): string | undefined {
  if (depth > 5 || !(error instanceof Error)) return undefined
  const code = (error as Error & { code?: unknown }).code
  if (typeof code === "string") return code
  const match = /\b(E[A-Z]{3,})\b/.exec(error.message)
  if (match) return match[1]
  const nested = (error as Error & { errors?: unknown }).errors
  if (Array.isArray(nested) && nested.length) {
    return networkFailureReason(nested[0], depth + 1)
  }
  return networkFailureReason(
    (error as Error & { cause?: unknown }).cause,
    depth + 1
  )
}

/**
 * Strip credentials and the query string from a URL before it reaches
 * `details`.
 *
 * A registry is configured as `https://user:pass@host/r?token=${TOKEN}`, and
 * `registry/builder.ts` expands env vars into the real URL. That value is
 * fine in a human message the user is already looking at, but `details` is a
 * field built for logs: putting a live token in it is how a CI log page
 * becomes a credential leak. The host and path — what actually identifies
 * which registry failed — survive; only the secrets go.
 */
export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.username = ""
    parsed.password = ""
    parsed.search = ""
    parsed.hash = ""
    return parsed.toString()
  } catch {
    // Not a parseable URL: strip anything after a '?' and drop userinfo
    // textually rather than passing it through unexamined.
    return url.replace(/\/\/[^/@]*@/, "//").replace(/\?.*$/, "")
  }
}

/**
 * Redact credentials from URLs embedded in free text.
 *
 * `redactUrl` only catches a value that IS a URL. But the strings that carry
 * a secret most often quote one inside a sentence: undici's
 * "Request cannot be constructed from a URL that includes credentials:
 * https://user:pass@host/r?token=..." is `details.cause`, and the proxy's own
 * message names the URL. Without this pass, redacting `details.url` while
 * leaving `details.cause` and the human message would have moved the token
 * rather than removed it.
 *
 * Stops at whitespace and at the closing punctuation that ends a sentence,
 * so the surrounding prose survives intact.
 */
export function scrubUrlsInText(value: string): string {
  return value.replace(
    /[a-z][a-z0-9+.-]*:\/\/[^\s"'<>)\]}]+/gi,
    (match) => redactUrl(match)
  )
}

/**
 * Make a `details` object safe to log: no absolute paths under the user's
 * home directory, no credential-bearing URLs.
 *
 * `details` is machine-read, not machine-trusted: it is routinely piped into
 * a log file or pasted into an issue. A path like `/Users/someone/...` names
 * the person whose machine produced it, so paths are rewritten relative to
 * the cwd when they are inside it and replaced with just the basename
 * otherwise.
 */
export function sanitizeDetails(
  details: Record<string, unknown>,
  cwd: string = process.cwd()
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(details)) {
    if (key === "stack") continue // never: see renderHumanError's debug path
    out[key] = sanitizeValue(value, cwd)
  }
  return out
}

const HOME = (() => {
  const home = process.env.HOME ?? process.env.USERPROFILE
  return home && home.length > 1 ? home.replace(/\/+$/, "") : undefined
})()

/**
 * True when the request could never be SENT because of how it was built, as
 * opposed to the host being unreachable.
 *
 * undici refuses up front to construct a request from a URL carrying
 * credentials, and rejects an unsupported scheme, before any socket is
 * opened. Both surface as a plain `TypeError`, so the only way to tell them
 * from a connection failure is the message. Misclassifying them as network
 * failures is not cosmetic: the exit code is 4, so an agent told
 * "NETWORK_ERROR, retry" retries a misconfiguration forever.
 */
export function looksLikeConfigFailure(error: unknown, depth = 0): boolean {
  if (depth > 3 || !(error instanceof Error)) return false

  if (
    /includes credentials|invalid url|failed to parse url|unsupported protocol|unsupported scheme|protocol.*not supported|only http|only https|must be an absolute url|scheme must be/i.test(
      error.message
    )
  ) {
    return true
  }

  if (error.cause !== undefined && error.cause !== null) {
    return looksLikeConfigFailure(error.cause, depth + 1)
  }
  const nested = (error as Error & { errors?: unknown }).errors
  if (Array.isArray(nested)) {
    return nested.some((entry) => looksLikeConfigFailure(entry, depth + 1))
  }
  return false
}

/** A `details` value that is safe to log: JSON-shaped, paths and URLs redacted. */
export type Sanitizable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | Error
  | Sanitizable[]
  | { [key: string]: Sanitizable }

function sanitizeValue(value: unknown, cwd: string): Sanitizable {
  if (typeof value === "string") {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return redactUrl(value)
    return sanitizePath(scrubUrlsInText(value), cwd)
  }
  if (typeof value === "number" || typeof value === "boolean") return value
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry, cwd))
  }
  // Only a PLAIN object is a container we should recurse into. A Date, an
  // Error or a class instance carries no path or URL to redact, and walking
  // it as a record would flatten a Date to `{}` — jsonSafe already knows how
  // to serialize each of these, so hand them over untouched.
  if (isPlainObject(value)) {
    return sanitizeDetails(value as Record<string, unknown>, cwd) as {
      [key: string]: Sanitizable
    }
  }
  if (value instanceof Date || value instanceof Error) return value
  // A function, symbol or bigint is not loggable: a function's SOURCE can
  // embed absolute paths, and JSON.stringify would drop it anyway. Return
  // undefined so the key disappears from the serialized details.
  if (typeof value === "function" || typeof value === "symbol") return undefined
  if (typeof value === "bigint") return value.toString()
  return String(value)
}

function isPlainObject(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function sanitizePath(value: string, cwd: string): string {
  if (!value.startsWith("/")) return value

  const relative = path.isAbsolute(value) ? path.relative(cwd, value) : value
  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
    return relative === "" ? "." : relative
  }
  // Outside the cwd: keep only the last segment, and never a home path.
  if (HOME && value.startsWith(`${HOME}/`)) {
    return `~/${path.basename(value)}`
  }
  return path.basename(value)
}

/**
 * Reduce an unknown thrown value to `{ code, message, details }`. Registry
 * errors carry their own `context` (url, itemName, ...); everything else gets
 * an empty object.
 */

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