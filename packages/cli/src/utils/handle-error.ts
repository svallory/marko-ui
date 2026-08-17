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

export function handleError(error: unknown) {
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
