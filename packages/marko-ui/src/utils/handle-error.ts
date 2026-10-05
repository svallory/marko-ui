import { RegistryError } from "@/src/registry/errors"
import {
  asNetworkError,
  asTlsError,
  buildErrorEnvelope,
  type CliErrorEnvelope,
  jsonSafe,
  looksLikeNetworkFailure,
  looksLikeTlsFailure,
  NETWORK_ERROR_CODES,
  type NormalizedCliError,
  RegistryErrorCode,
  sanitizeDetails,
} from "@/src/utils/error-contract"
import { highlighter } from "@/src/utils/highlighter"
import { isDebugEnabled, logger } from "@/src/utils/logger"
import { printJson } from "@/src/utils/json-output"
import { isJsonMode } from "@/src/utils/output-mode"
import { z } from "zod"

/**
 * Exit-code contract (also exposed by `marko-ui manifest`):
 * 0 success · 1 operational failure · 2 usage error (commander, see
 * index.ts) · 3 doctor/validate/agents-check found problems · 4 network
 * or registry unreachable.
 *
 * Error *shape* contract (see error-contract.ts): human-readable failures go
 * to stderr, and with `--json` a failure is one JSON envelope on stdout.
 */

/**
 * A failure whose message is already written for the user and whose exit
 * code is part of the CLI's documented contract (see the table above).
 *
 * Command handlers used to `logger.error(...)` and then call
 * `process.exit(n)` inline, bypassing handleError entirely. Throwing this
 * instead routes every failure through the single `catch (error) →
 * handleError(error)` site each command already has, so the exit-code table
 * above is applied in exactly one place and the message formatting cannot
 * drift per command.
 *
 * `code`/`suggestion`/`details` are the machine-readable half: they become
 * the JSON envelope's `error` object verbatim, and the code is printed in the
 * human form too. Leave `code` off only when no code in RegistryErrorCode
 * fits — it then defaults to USAGE_ERROR, which is what most of the
 * caller's messages actually are (a bad invocation, not a broken registry).
 *
 * What this does NOT change: `finally` blocks still do not run. `handleError`
 * calls `process.exit()` from inside the `catch`, and `process.exit()`
 * terminates immediately — a pending `finally` in the same try statement is
 * skipped just as it was with an inline exit. Command `finally` blocks here
 * only call `clearRegistryContext()`, which is in-process state teardown that
 * does not need to run when the process is about to die; nothing flushed to
 * disk or to a socket depends on it. Do not add cleanup that must run on exit
 * to those `finally` blocks — it will not run. Use an explicit
 * `process.on("exit")` handler or do the cleanup before throwing.
 *
 * `formatted: true` means the caller already printed a multi-line,
 * highlighter-formatted human error, so there is nothing left to say. It is
 * honored ONLY on the human path: in `--json` mode the prose the caller
 * printed is not a machine result, so the envelope is emitted anyway (this is
 * why a command must never print its JSON to stdout itself — see info.ts).
 */
export class CommandError extends Error {
  exitCode: number
  formatted: boolean
  code: RegistryErrorCode
  suggestion?: string
  details?: Record<string, unknown>

  constructor(
    message: string,
    options: {
      exitCode?: number
      formatted?: boolean
      code?: RegistryErrorCode
      suggestion?: string
      details?: Record<string, unknown>
    } = {}
  ) {
    super(message)
    this.name = "CommandError"
    this.exitCode = options.exitCode ?? 1
    this.formatted = options.formatted ?? false
    this.code = options.code ?? RegistryErrorCode.USAGE_ERROR
    this.suggestion = options.suggestion
    this.details = options.details
  }
}

/**
 * A deliberate, successful early return from a command — the user declined
 * a confirmation prompt, there was nothing to do, or the command finished
 * after printing JSON. Not a failure: nothing is printed and the process
 * exits with `exitCode` (0 unless stated otherwise).
 *
 * Same motivation as CommandError: thrown rather than exited inline so every
 * exit goes through the one `catch → handleError` site. It does NOT make the
 * command's `finally` cleanup run — handleError calls process.exit() from the
 * catch, which skips any pending finally. See CommandError above.
 */
export class CleanExit extends Error {
  exitCode: number

  constructor(exitCode = 0) {
    super(`Clean exit (${exitCode}).`)
    this.name = "CleanExit"
    this.exitCode = exitCode
  }
}

/** A zod failure turned into one line per offending field. */
function fromZodError(error: z.ZodError): {
  message: string
  details: Record<string, unknown>
} {
  const fields = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([key, messages]) => [
      key,
      messages ?? [],
    ])
  )
  const flat = error.issues.map(
    (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`
  )
  return {
    message: `Validation failed: ${flat.join("; ")}`,
    details: { fields },
  }
}

/**
 * Normalize anything thrown into the error contract. Kept separate from
 * `handleError` so the shape is testable without stubbing `process.exit`.
 */
export function normalizeError(error: unknown): NormalizedCliError {
  if (error instanceof CommandError) {
    return {
      envelope: buildErrorEnvelope({
        code: error.code,
        message: error.message,
        suggestion: error.suggestion,
        details: sanitizeDetails(error.details ?? {}),
      }),
      exitCode: error.exitCode,
      unexpected: false,
    }
  }

  if (error instanceof RegistryError) {
    return {
      envelope: buildErrorEnvelope({
        code: error.code,
        message: error.message,
        suggestion: error.suggestion,
        details: sanitizeDetails({
          ...error.context,
          ...(error.cause !== undefined && error.cause !== null
            ? { cause: serializeCause(error.cause) }
            : {}),
        }),
      }),
      exitCode: NETWORK_ERROR_CODES.includes(error.code) ? 4 : 1,
      unexpected: false,
    }
  }

  if (error instanceof z.ZodError) {
    const { message, details } = fromZodError(error)
    return {
      envelope: buildErrorEnvelope({
        code: RegistryErrorCode.VALIDATION_ERROR,
        message,
        details: sanitizeDetails(details),
      }),
      exitCode: 1,
      unexpected: false,
    }
  }

  // A bad certificate is checked BEFORE the generic network classification,
  // because undici reports it as a connection failure like any other: it is
  // the user's configuration, not their network, and exit 4 would tell an
  // agent to retry something retrying cannot fix.
  if (looksLikeTlsFailure(error)) {
    const tls = asTlsError(error)
    return {
      envelope: buildErrorEnvelope({
        code: tls.code,
        message: tls.message,
        suggestion: tls.suggestion,
      }),
      exitCode: 1,
      unexpected: false,
    }
  }

  // An unreachable registry is an expected, actionable condition, not a bug
  // in the CLI. Classify it here as the backstop for any path that reaches
  // the error handler with a raw fetch failure (the proxy wraps one, but a
  // hand-rolled `fetch` anywhere else would not), so it is NETWORK_ERROR /
  // exit 4 with no "open an issue" boilerplate.
  if (looksLikeNetworkFailure(error)) {
    const network = asNetworkError(error)
    // `fetch failed` is the message Node prints for every connection
    // failure; the syscall reason (ECONNREFUSED, ENOTFOUND, ETIMEDOUT) is
    // what tells the user whether to retry or go fix DNS, so that is what
    // `details.cause` carries.
    const reason =
      network.context?.reason ?? serializeCause(network.cause)
    return {
      envelope: buildErrorEnvelope({
        code: network.code,
        message: network.message,
        suggestion: network.suggestion,
        details: sanitizeDetails({
          ...(network.context ?? {}),
          ...(reason !== undefined ? { cause: reason } : {}),
        }),
      }),
      exitCode: 4,
      unexpected: false,
    }
  }

  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : String(error)

  return {
    envelope: buildErrorEnvelope({
      code: RegistryErrorCode.UNKNOWN_ERROR,
      message,
      // No stack: `details` is routinely logged, and a stack is a wall of
      // absolute build paths (including the user's home directory) that adds
      // nothing a reader of a log can act on. MARKO_UI_DEBUG puts it on
      // stderr instead, where it stays opt-in.
      details: undefined,
    }),
    exitCode: 1,
    // Anything that is not one of the deliberate error types is a bug in the
    // CLI, not a condition the user can fix. This is the ONLY path that
    // prints the "open an issue on GitHub" boilerplate.
    unexpected: true,
    raw: error,
  }
}

function serializeCause(cause: unknown): string | undefined {
  if (typeof cause === "string") return cause
  if (cause instanceof Error) return cause.message
  return undefined
}

/**
 * Render a failure for a human, on stderr.
 *
 * Deliberately NOT the old three-part block ("Something went wrong" /
 * "Message:" / "Suggestion:"). A not-found name, an unconfigured registry or
 * an unreachable host is an expected outcome the caller can act on, and
 * wrapping it in "please open an issue on GitHub" told users to file bugs
 * about their own typos. The compact form is one line per fact:
 *
 * ```
 * Error [NOT_FOUND]: Registry item "buton" was not found. Did you mean "button"?
 * Suggestion: Did you mean "button"?
 * ```
 */
export function renderHumanError(
  envelope: CliErrorEnvelope,
  {
    unexpected = false,
    raw,
  }: { unexpected?: boolean; raw?: unknown } = {}
) {
  if (unexpected) {
    logger.errorBreak()
    logger.error(
      `Something went wrong. Please check the error below for more details.`
    )
    logger.error(`If the problem persists, please open an issue on GitHub.`)
    logger.errorBreak()
  }

  const { code, message, suggestion } = envelope.error
  logger.errorBreak()
  logger.error(`${highlighter.error("Error")} [${code}]: ${message}`)

  // The candidates live in `suggestion` and `details.suggestions`. They were
  // also printed as their own "Similar registry items" line, which made
  // `show buton` say "button" three times; the suggestion line already names
  // them, so only print this when the suggestion is NOT the did-you-mean one
  // (a caller that supplied its own advice still gets the list).
  if (suggestion && !/^Did you mean\b/.test(suggestion)) {
    const suggestions = envelope.error.details?.suggestions
    if (Array.isArray(suggestions) && suggestions.length > 0) {
      logger.error(
        `Similar registry items: ${suggestions
          .map((name) => `"${String(name)}"`)
          .join(", ")}`
      )
    }
  }

  if (suggestion) {
    logger.error(`${highlighter.info("Suggestion:")} ${suggestion}`)
  }
  logger.errorBreak()

  // The stack is the one thing an unexpected failure needs that the envelope
  // deliberately cannot carry. It was removed from `details` because a stack
  // is a wall of absolute build paths that gets logged and pasted into
  // issues, which is exactly where a home directory must not appear — so
  // without this path, "please open an issue" had nothing to attach to it.
  //
  // stderr only, always: under --json stdout must stay exactly one document,
  // and this runs on the human path only, where stdout carries no result.
  if (unexpected && raw instanceof Error && raw.stack) {
    if (isDebugEnabled()) {
      logger.error(raw.stack)
    } else {
      logger.error(
        `${highlighter.info("hint:")} re-run with ${highlighter.info(
          "MARKO_UI_DEBUG=1"
        )} to print the stack trace.`
      )
    }
  }
}

/**
 * The single failure path. Every command's `catch (error) → handleError(error)`
 * lands here, which is what makes the stream/shape/exit-code contract hold
 * everywhere instead of per command.
 */
export function handleError(error: unknown) {
  if (error instanceof CleanExit) {
    process.exit(error.exitCode)
  }

  const normalized = normalizeError(error)

  // A `formatted` CommandError's caller already printed its own bespoke
  // human block. In `--json` mode that prose is not a result, so the
  // envelope still goes out. On the human path we still print the one line
  // the bespoke block cannot know: the code. Without it a monorepo-root or
  // search failure was prose with nothing a program could branch on, which
  // is exactly what criterion 3 exists to prevent.
  // `isJsonMode()` (the RECORDED mode), not the argv fallback: by this point
  // an action has run, or never will.
  if (error instanceof CommandError && error.formatted && !isJsonMode()) {
    logger.error(
      `${highlighter.error("Error")} [${normalized.envelope.error.code}]: ${error.message}`
    )
    process.exit(error.exitCode)
  }

  // `isJsonMode()` — the RECORDED mode. handleError is reached from a
  // command's own catch, i.e. AFTER its action recorded the flag it parsed, so
  // the recorded value is authoritative and argv is a stale guess. The argv
  // fallback belongs to the ONE caller that runs before any action exists:
  // `index.ts`'s commander hook (isJsonModeForErrors there). Reading argv
  // here instead made a `--json` failure print prose on stderr while the
  // success path printed JSON.
  if (isJsonMode()) {
    // One helper owns JSON output (see json-output.ts): minified when stdout
    // is a pipe, pretty when a human is watching. An error envelope is JSON
    // like any other document the CLI prints.
    printJson(jsonSafe(normalized.envelope))
  } else {
    renderHumanError(normalized.envelope, {
      unexpected: normalized.unexpected,
      raw: normalized.raw,
    })
  }

  process.exit(normalized.exitCode)
}