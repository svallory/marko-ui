import path from "path"
import { initOptionsSchema } from "@/src/commands/init"
import * as ERRORS from "@/src/utils/errors"
import { highlighter } from "@/src/utils/highlighter"
import { CommandError } from "@/src/utils/handle-error"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import fs from "fs-extra"
import { z } from "zod"

export async function preFlightInit(
  options: z.infer<typeof initOptionsSchema>
) {
  const errors: Record<string, boolean> = {}

  // Ensure target directory exists.
  // Check for empty project. We assume if no package.json exists, the project is empty.
  if (
    !fs.existsSync(options.cwd) ||
    !fs.existsSync(path.resolve(options.cwd, "package.json"))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true
    return {
      errors,
    }
  }

  const projectSpinner = spinner(`Preflight checks.`, {
    silent: options.silent,
  }).start()

  if (
    fs.existsSync(path.resolve(options.cwd, "components.json")) &&
    !options.force
  ) {
    projectSpinner?.fail()
    throw new CommandError(
      `A ${highlighter.info(
        "components.json"
      )} file already exists at ${highlighter.info(
        options.cwd
      )}.\nTo start over, remove the ${highlighter.info(
        "components.json"
      )} file and run ${highlighter.info("init")} again.`
    )
  }

  projectSpinner?.succeed()

  return {
    errors,
  }
}
