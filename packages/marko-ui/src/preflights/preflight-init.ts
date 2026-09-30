import path from "path"
import { initOptionsSchema } from "@/src/commands/init"
import * as ERRORS from "@/src/utils/errors"
import { hasMarkoDependency } from "@/src/utils/get-project-info"
import { highlighter } from "@/src/utils/highlighter"
import { CommandError } from "@/src/utils/handle-error"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import fs from "fs-extra"
import { z } from "zod"

/**
 * Whether the package.json at `cwd` declares Marko (`marko`, `@marko/run` or
 * `@marko/vite`, in dependencies, devDependencies or peerDependencies).
 */
export function isMarkoProject(cwd: string): boolean {
  try {
    return hasMarkoDependency(
      fs.readJsonSync(path.resolve(cwd, "package.json"))
    )
  } catch {
    // An unreadable package.json is not proof of anything; let later steps
    // report it rather than claiming the project is not Marko.
    return true
  }
}

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
      )} — this project is already initialized.\nTo add components, run ${highlighter.info(
        "marko-ui add <name>"
      )}. To set up AI agents, run ${highlighter.info(
        "marko-ui agents sync"
      )}.\nTo start over, run ${highlighter.info("marko-ui init --force")}.`
    )
  }

  // `--force` skips the check: it is the escape hatch for a project this
  // detector does not recognise.
  if (!options.force && !isMarkoProject(options.cwd)) {
    projectSpinner?.fail()
    errors[ERRORS.NOT_A_MARKO_PROJECT] = true
    return {
      errors,
    }
  }

  projectSpinner?.succeed()

  return {
    errors,
  }
}
