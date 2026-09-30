import path from "path"
import { initOptionsSchema, mayPromptForInit } from "@/src/commands/init"
import { select } from "@/src/utils/clack"
import { isMonorepoRoot } from "@/src/utils/get-monorepo-info"
import { getPackageInfo } from "@/src/utils/get-package-info"
import { getPackageManager } from "@/src/utils/get-package-manager"
import {
  formatInstallCommand,
  installWithPackageManager,
} from "@/src/utils/updaters/update-dependencies"
import * as ERRORS from "@/src/utils/errors"
import { hasMarkoDependency } from "@/src/utils/get-project-info"
import { isInteractive } from "@/src/utils/interactive"
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

export type MarkoInstallChoice = "run" | "vite"

/** What each offered choice installs. `vite` is only added when absent. */
export const MARKO_INSTALL_PACKAGES: Record<
  MarkoInstallChoice,
  { dependencies: string[]; devDependencies: string[] }
> = {
  run: { dependencies: ["marko", "@marko/run"], devDependencies: [] },
  vite: { dependencies: ["marko", "@marko/vite"], devDependencies: ["vite"] },
}

/**
 * Whether `init` may offer to install Marko into a project that has none.
 * Needs someone to answer (see `mayPromptForInit`), no `--force`, and a
 * project that is not a workspace root: a root needs `--cwd <app>`, and
 * installing Marko into it would be wrong.
 */
export function shouldOfferMarkoInstall(
  options: Pick<
    z.infer<typeof initOptionsSchema>,
    "defaults" | "yes" | "silent" | "force"
  >,
  { interactive, workspaceRoot }: { interactive: boolean; workspaceRoot: boolean }
): boolean {
  return (
    !options.force &&
    !workspaceRoot &&
    mayPromptForInit(options, interactive)
  )
}

/**
 * Installs the packages for `choice` through the project's package manager.
 * `vite` is skipped when package.json already declares it. Throws a
 * CommandError carrying the manual command when the install fails.
 */
export async function installMarko(
  cwd: string,
  choice: MarkoInstallChoice,
  { silent }: { silent?: boolean } = {}
) {
  const { dependencies, devDependencies } = MARKO_INSTALL_PACKAGES[choice]
  const info = getPackageInfo(cwd, false)
  const declared = new Set([
    ...Object.keys(info?.dependencies ?? {}),
    ...Object.keys(info?.devDependencies ?? {}),
  ])
  const dev = devDependencies.filter((name) => !declared.has(name))
  const packageManager = await getPackageManager(cwd)

  const installSpinner = spinner(
    `Installing ${[...dependencies, ...dev].join(", ")}.`,
    { silent }
  )?.start()
  try {
    await installWithPackageManager(packageManager, dependencies, dev, cwd)
    installSpinner?.succeed()
  } catch (error) {
    installSpinner?.fail()
    const manual = [
      formatInstallCommand(packageManager, dependencies),
      dev.length ? formatInstallCommand(packageManager, dev, true) : null,
    ]
      .filter(Boolean)
      .map((command) => `  ${command}`)
      .join("\n")
    throw new CommandError(
      `Could not install Marko (${
        error instanceof Error ? error.message.split("\n")[0] : String(error)
      }).\nInstall it manually, then run ${highlighter.info(
        "marko-ui init"
      )} again:\n${manual}`
    )
  }
}

export async function preFlightInit(
  options: z.infer<typeof initOptionsSchema>
) {
  const errors: Record<string, boolean> = {}
  let offerDeclined = false

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
    // Offered before anything is written, so "No" leaves the project
    // untouched and the components.json rollback is not involved.
    if (
      shouldOfferMarkoInstall(options, {
        interactive: isInteractive(),
        workspaceRoot: await isMonorepoRoot(options.cwd),
      })
    ) {
      projectSpinner?.stop()
      const choice = await select(
        "This project does not depend on Marko. Install it?",
        [
          {
            value: "run",
            label: "@marko/run app",
            hint: "installs marko + @marko/run (recommended)",
          },
          {
            value: "vite",
            label: "Marko with Vite",
            hint: "installs marko + @marko/vite",
          },
          { value: "no", label: "No" },
        ],
        { initialValue: "run" }
      )
      if (choice === "no") {
        errors[ERRORS.NOT_A_MARKO_PROJECT] = true
        return { errors, offerDeclined: true }
      }
      await installMarko(options.cwd, choice as MarkoInstallChoice, {
        silent: options.silent,
      })
    } else {
      projectSpinner?.fail()
      errors[ERRORS.NOT_A_MARKO_PROJECT] = true
      return {
        errors,
        offerDeclined,
      }
    }
  }

  projectSpinner?.succeed()

  return {
    errors,
    offerDeclined,
  }
}
