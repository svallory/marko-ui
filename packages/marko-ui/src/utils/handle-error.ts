import { RegistryError, RegistryErrorCode } from "@/src/registry/errors"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { z } from "zod"

/**
 * Exit-code contract (also exposed by `marko-ui manifest`):
 * 0 success · 1 operational failure · 2 usage error (commander, see
 * index.ts) · 3 doctor/validate/agents-check found problems · 4 network
 * or registry unreachable.
 */
export const NETWORK_ERROR_CODES: readonly string[] = [
  RegistryErrorCode.NETWORK_ERROR,
  RegistryErrorCode.FETCH_ERROR,
]

/**
 * A failure whose message is already written for the user and whose exit
 * code is part of the CLI's documented contract (see the table above).
 *
 * Command handlers used to `logger.error(...)` and then call
 * `process.exit(n)` inline, bypassing handleError entirely. Throwing this
 * instead routes every failure through the single `catch (error) →
 * handleError(error)` site each command already has, so the exit-code table
 * above is applied in exactly one place and the message formatting
 * (`formatted`, the CleanExit/CommandError split) cannot drift per command.
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
 * `handleError` prints the message verbatim — no "Something went wrong"
 * preamble — because the caller already phrased it for the user. Pass
 * `formatted: true` when the message was already printed by the caller
 * (multi-line, highlighter-formatted output) so nothing is printed twice.
 */
export class CommandError extends Error {
  exitCode: number
  formatted: boolean

  constructor(
    message: string,
    options: { exitCode?: number; formatted?: boolean } = {}
  ) {
    super(message)
    this.name = "CommandError"
    this.exitCode = options.exitCode ?? 1
    this.formatted = options.formatted ?? false
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

export function handleError(error: unknown) {
  if (error instanceof CleanExit) {
    process.exit(error.exitCode)
  }

  if (error instanceof CommandError) {
    if (!error.formatted) {
      logger.break()
      logger.error(error.message)
      logger.break()
    }
    process.exit(error.exitCode)
  }

  logger.break()
  logger.error(
    `Something went wrong. Please check the error below for more details.`
  )
  logger.error(`If the problem persists, please open an issue on GitHub.`)
  logger.error("")

  if (typeof error === "string") {
    logger.error(error)
    process.exit(1)
  }

  if (error instanceof RegistryError) {
    if (error.message) {
      logger.error(error.cause ? "Error:" : "Message:")
      logger.error(error.message)
    }

    if (error.cause) {
      logger.error("\nMessage:")
      logger.error(error.cause)
    }

    if (error.suggestion) {
      logger.error("\nSuggestion:")
      logger.error(error.suggestion)
    }

    process.exit(NETWORK_ERROR_CODES.includes(error.code) ? 4 : 1)
  }

  if (error instanceof z.ZodError) {
    logger.error("Validation failed:")
    for (const [key, value] of Object.entries(error.flatten().fieldErrors)) {
      logger.error(`- ${highlighter.info(key)}: ${value}`)
    }
    process.exit(1)
  }

  if (error instanceof Error) {
    logger.error(error.message)
    process.exit(1)
  }

  process.exit(1)
}
