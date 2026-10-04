import { RegistryError } from "@/src/registry/errors"
import {
  buildErrorEnvelope,
  type CliErrorEnvelope,
  jsonSafe,
  NETWORK_ERROR_CODES,
  type NormalizedCliError,
  RegistryErrorCode,
} from "@/src/utils/error-contract"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
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
        details: error.details,
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
        details: {
          ...error.context,
          ...(error.cause !== undefined && error.cause !== null
            ? { cause: serializeCause(error.cause) }
            : {}),
        },
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
        details,
      }),
      exitCode: 1,
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
      details:
        error instanceof Error && error.stack
          ? { stack: error.stack }
          : undefined,
    }),
    exitCode: 1,
    // Anything that is not one of the deliberate error types is a bug in the
    // CLI, not a condition the user can fix. This is the ONLY path that
    // prints the "open an issue on GitHub" boilerplate.
    unexpected: true,
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
  { unexpected = false }: { unexpected?: boolean } = {}
) {
  if (unexpected) {
    logger.break()
    logger.error(
      `Something went wrong. Please check the error below for more details.`
    )
    logger.error(`If the problem persists, please open an issue on GitHub.`)
    logger.break()
  }

  const { code, message, suggestion, details } = envelope.error
  logger.break()
  logger.error(`${highlighter.error("Error")} [${code}]: ${message}`)

  const suggestions = details?.suggestions
  if (Array.isArray(suggestions) && suggestions.length > 0) {
    logger.error(
      `Similar registry items: ${suggestions.map((name) => `"${String(name)}"`).join(", ")}`
    )
  }

  if (suggestion) {
    logger.error(`${highlighter.info("Suggestion:")} ${suggestion}`)
  }
  logger.break()
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

  // The caller printed its own multi-line human block and says so. In
  // `--json` mode that prose is not a result, so the envelope still goes out.
  if (error instanceof CommandError && error.formatted && !isJsonMode()) {
    process.exit(error.exitCode)
  }

  const normalized = normalizeError(error)

  if (isJsonMode()) {
    const payload = jsonSafe(normalized.envelope)
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`)
  } else {
    renderHumanError(normalized.envelope, {
      unexpected: normalized.unexpected,
    })
  }

  process.exit(normalized.exitCode)
}