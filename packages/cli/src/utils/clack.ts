import * as clack from "@clack/prompts"
import { logger } from "@/src/utils/logger"

/**
 * Thin wrappers over @clack/prompts with uniform cancel handling:
 * Ctrl-C or Escape exits with code 1 instead of continuing with
 * undefined values (the classic `prompts` footgun).
 */

function handleCancel<T>(value: T | symbol): T {
  if (clack.isCancel(value)) {
    clack.cancel("Cancelled.")
    process.exit(1)
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
    process.exit(1)
  }
}
