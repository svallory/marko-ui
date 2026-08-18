import { existsSync, promises as fs } from "fs"
import path from "path"
import { getShadcnRegistryIndex } from "@/src/registry/api"
import { clearRegistryContext } from "@/src/registry/context"
import { confirm } from "@/src/utils/clack"
import { addComponents } from "@/src/utils/add-components"
import { getConfig } from "@/src/utils/get-config"
import { handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import { writeProjectTaglib } from "@/src/utils/taglib"
import { Command } from "commander"
import { z } from "zod"

const ejectOptionsSchema = z.object({
  cwd: z.string(),
  yes: z.boolean(),
  silent: z.boolean(),
})

/**
 * Switches a project from the `import` distribution to `copy` (see
 * notes/plans/dual-distribution-plan.md §4c). This is a first-class
 * supported transition, not an escape hatch: `import` consumers depend on
 * `@marko-ui/core` (mu-* hook-class components + precompiled style CSS
 * layers) and never have local component files; `eject` gives them real,
 * editable source in their own project — "the code is mine now" — using
 * the exact same fetch-and-write path `marko-ui add` uses, so the result is
 * indistinguishable from having run `add` for every installed component.
 *
 * What it does NOT do: touch @marko-ui/core's node_modules install (the
 * user removes the npm dependency once satisfied) or delete the CSS block
 * `init --distribution import` wrote (styles still work identically until
 * the user removes it, since the copy path's generated components style
 * themselves independently — see the printed follow-up steps).
 */
export const eject = new Command()
  .name("eject")
  .description(
    "switch this project from the import distribution (@marko-ui/core) to copy: fetch and write local component source for everything currently installed"
  )
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option("-s, --silent", "mute output.", false)
  .action(async (opts) => {
    try {
      const options = ejectOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        yes: opts.yes,
        silent: opts.silent,
      })

      const config = await getConfig(options.cwd)
      if (!config) {
        logger.error(
          `No ${highlighter.info(
            "components.json"
          )} found. Run ${highlighter.info("marko-ui init")} first.`
        )
        process.exit(1)
      }

      if (config.distribution !== "import") {
        logger.error(
          `This project is already on the ${highlighter.info(
            "copy"
          )} distribution (or predates the ${highlighter.info(
            "distribution"
          )} field, which defaults to ${highlighter.info(
            "copy"
          )}). Nothing to eject — ${highlighter.info(
            "eject"
          )} only switches ${highlighter.info("import")} projects to ${highlighter.info(
            "copy"
          )}.`
        )
        process.exit(1)
      }

      const installedComponents = await findImportedComponents(options.cwd)
      if (!installedComponents.length) {
        logger.error(
          `No installed components found under ${highlighter.info(
            "node_modules/@marko-ui/core/ui"
          )}. Is ${highlighter.info("@marko-ui/core")} installed?`
        )
        process.exit(1)
      }

      if (!options.yes) {
        const proceed = await confirm(
          `Eject ${highlighter.info(
            String(installedComponents.length)
          )} component(s) into ${highlighter.info(
            path.relative(options.cwd, config.resolvedPaths.ui) || "."
          )}? This fetches and writes local source for each, overwriting any existing files with the same names.`
        )
        if (!proceed) {
          process.exit(0)
        }
      }

      const ejectSpinner = spinner(
        `Ejecting ${installedComponents.length} component(s).`,
        { silent: options.silent }
      ).start()

      // Reuse `add`'s exact fetch-and-write engine so the result is
      // identical to what `marko-ui add <every installed component>` would
      // produce on the copy path — no separate copy logic to keep in sync.
      await addComponents(installedComponents, config, {
        overwrite: true,
        silent: true,
        interactive: false,
      })

      const taglib = await writeProjectTaglib(config)

      // Flip the config so `add`/`doctor`/future `eject` calls see copy mode.
      await setDistribution(options.cwd, "copy")

      ejectSpinner.succeed()

      if (!options.silent) {
        logger.log(
          `Ejected ${highlighter.info(
            String(installedComponents.length)
          )} component(s) (${taglib?.tags ?? 0} tags registered in marko.json).`
        )
        logger.log(
          `components.json now has ${highlighter.info(
            '"distribution": "copy"'
          )}.`
        )
        logger.log(`Remaining manual steps:`)
        logger.log(
          `  1. Remove the dependency: ${highlighter.info(
            "bun remove @marko-ui/core"
          )}`
        )
        logger.log(
          `  2. Remove the marko-ui:import-distribution block ${highlighter.info(
            config.resolvedPaths.tailwindCss
              ? path.relative(options.cwd, config.resolvedPaths.tailwindCss)
              : "from your CSS entry"
          )} added and restore your own theme/style CSS (${highlighter.info(
            "marko-ui add style"
          )} writes the copy-path theme).`
        )
        if (taglib === null) {
          logger.warn(
            "marko.json exists and is not marko-ui-generated — tags were NOT registered. Merge manually or delete it and re-run."
          )
        }
      }
    } catch (error) {
      handleError(error)
    } finally {
      clearRegistryContext()
    }
  })

/**
 * The import distribution has no local component files to scan (that's the
 * point) — it lists what's "installed" by reading the directory names under
 * the @marko-ui/core package's ui/ tree in node_modules, cross-checked
 * against the registry index so only real component names are eject
 * targets (skips anything unexpected there).
 */
export async function findImportedComponents(cwd: string): Promise<string[]> {
  const coreUiDir = path.join(cwd, "node_modules", "@marko-ui", "core", "ui")
  if (!existsSync(coreUiDir)) {
    return []
  }

  const entries = await fs.readdir(coreUiDir, { withFileTypes: true })
  const names = entries.filter((e) => e.isDirectory()).map((e) => e.name)

  const registryIndex = await getShadcnRegistryIndex().catch(() => null)
  if (!registryIndex) {
    // Registry unreachable — fall back to the raw directory listing rather
    // than failing outright; addComponents will surface a clear per-item
    // error for anything that doesn't actually resolve.
    return names
  }

  const registryNames = new Set(registryIndex.map((item) => item.name))
  return names.filter((name) => registryNames.has(name))
}

export async function setDistribution(
  cwd: string,
  distribution: "copy" | "import"
) {
  const componentsJsonPath = path.join(cwd, "components.json")
  if (!existsSync(componentsJsonPath)) {
    return
  }
  const raw = JSON.parse(await fs.readFile(componentsJsonPath, "utf8"))
  raw.distribution = distribution
  await fs.writeFile(
    componentsJsonPath,
    JSON.stringify(raw, null, 2) + "\n",
    "utf8"
  )
}
