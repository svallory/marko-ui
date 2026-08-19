import * as clack from "@clack/prompts"
import { CleanExit } from "@/src/utils/handle-error"
import { logger } from "@/src/utils/logger"

/**
 * Thin wrappers over @clack/prompts with uniform cancel handling:
 * Ctrl-C or Escape exits with code 1 instead of continuing with
 * undefined values (the classic `prompts` footgun).
 */

function handleCancel<T>(value: T | symbol): T {
  if (clack.isCancel(value)) {
    clack.cancel("Cancelled.")
    // Thrown, not exited inline: prompts run deep inside command bodies, and
    // throwing unwinds to the command's single `catch → handleError` site so
    // the exit happens in one place instead of at every prompt call. It does
    // NOT make `finally` blocks run — handleError calls process.exit() from
    // the catch, which skips any pending finally exactly as an inline exit
    // would. clack already printed "Cancelled."; exit 1 is the pre-existing
    // code for a user-cancelled prompt.
    throw new CleanExit(1)
  }
  return value
}

export async function confirm(message: string, initial = true) {
  return handleCancel(await clack.confirm({ message, initialValue: initial }))
}

export async function select(
  message: string,
  options: { value: string; label: string; hint?: string }[]
) {
  return handleCancel(await clack.select<string>({ message, options }))
}

export async function multiselect(
  message: string,
  options: { value: string; label: string; hint?: string }[],
  opts: { required?: boolean; initialValues?: string[] } = {}
) {
  return handleCancel(
    await clack.multiselect<string>({
      message,
      options,
      required: opts.required ?? false,
      initialValues: opts.initialValues,
    })
  )
}

export function exitIfEmptySelection<T>(
  values: T[] | undefined,
  message: string
): asserts values is T[] {
  if (!values?.length) {
    logger.warn(message)
    logger.info("")
    throw new CleanExit(1)
  }
}
