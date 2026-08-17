import { existsSync, promises as fs } from "fs"
import path from "path"
import { confirm } from "@/src/utils/clack"
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
 * Moves from package mode (@marko-ui/<style> installed from npm) to
 * source-copy mode: copies the package's component source into the
 * project's configured directories and regenerates the project taglib so
 * every `<Badge>`/`<badge>` in application code keeps working unchanged.
 */
export const eject = new Command()
  .name("eject")
  .description(
    "copy the installed @marko-ui style package's components into your project"
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

      const stylePackage = await findInstalledStylePackage(options.cwd)
      if (!stylePackage) {
        logger.error(
          `No installed ${highlighter.info(
            "@marko-ui/<style>"
          )} package found in node_modules. Nothing to eject.`
        )
        process.exit(1)
      }

      if (!options.yes) {
        const proceed = await confirm(
          `Eject ${highlighter.info(
            stylePackage.name
          )} into ${highlighter.info(
            path.relative(options.cwd, config.resolvedPaths.ui) || "."
          )}? Existing files with the same names will be overwritten.`
        )
        if (!proceed) {
          process.exit(0)
        }
      }

      const ejectSpinner = spinner(`Ejecting ${stylePackage.name}.`, {
        silent: options.silent,
      }).start()

      // Components -> aliases.ui dir; lib -> aliases.lib dir.
      await fs.mkdir(config.resolvedPaths.ui, { recursive: true })
      await fs.cp(path.join(stylePackage.dir, "ui"), config.resolvedPaths.ui, {
        recursive: true,
      })
      const libSrc = path.join(stylePackage.dir, "lib")
      if (existsSync(libSrc)) {
        await fs.mkdir(config.resolvedPaths.lib, { recursive: true })
        await fs.cp(libSrc, config.resolvedPaths.lib, { recursive: true })
      }

      // Ejected files import "#lib/*" (package-internal subpath). Point the
      // project's package.json imports at the lib dir so they keep resolving.
      await ensureLibSubpathImport(options.cwd, config.resolvedPaths.lib)

      const taglib = await writeProjectTaglib(config)
      ejectSpinner.succeed()

      if (!options.silent) {
        logger.log(
          `Ejected ${highlighter.info(stylePackage.name)} (${
            taglib?.tags ?? 0
          } tags registered in marko.json).`
        )
        logger.log(
          `Remove the package when ready: ${highlighter.info(
            `bun remove ${stylePackage.name}`
          )} — its dependencies (marko-zag, @zag-js/*) must stay.`
        )
        if (taglib === null) {
          logger.warn(
            "marko.json exists and is not marko-ui-generated — tags were NOT registered. Merge manually or delete it and re-run."
          )
        }
      }
    } catch (error) {
      handleError(error)
    }
  })

export async function findInstalledStylePackage(cwd: string) {
  const scopeDir = path.join(cwd, "node_modules", "@marko-ui")
  if (!existsSync(scopeDir)) {
    return null
  }

  for (const entry of (await fs.readdir(scopeDir)).sort()) {
    const dir = path.join(scopeDir, entry)
    // A style package is identified by its taglib + ui tree (the CLI
    // package and future non-style packages have neither).
    if (
      existsSync(path.join(dir, "marko.json")) &&
      existsSync(path.join(dir, "ui"))
    ) {
      return { name: `@marko-ui/${entry}`, dir }
    }
  }

  return null
}

async function ensureLibSubpathImport(cwd: string, libDir: string) {
  const packageJsonPath = path.join(cwd, "package.json")
  if (!existsSync(packageJsonPath)) {
    return
  }
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"))
  const relativeLib = `./${path
    .relative(cwd, libDir)
    .split(path.sep)
    .join("/")}/*`
  packageJson.imports = {
    ...(packageJson.imports ?? {}),
    "#lib/*": relativeLib,
  }
  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n"
  )
}
