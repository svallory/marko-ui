import path from "path"
import { BUILTIN_REGISTRIES } from "@/src/registry/constants"
import { handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import { Command } from "commander"
import fs from "fs-extra"
import { z } from "zod"

const removeOptionsSchema = z.object({
  cwd: z.string(),
  silent: z.boolean(),
})

export const remove = new Command()
  .name("remove")
  .description("remove registries from your project")
  .argument("<registries...>", "registry namespaces to remove (e.g. @acme)")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-s, --silent", "mute output.", false)
  .action(async (registries: string[], opts) => {
    try {
      const options = removeOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        silent: opts.silent,
      })

      await removeRegistriesFromConfig(registries, options.cwd, {
        silent: options.silent,
      })
    } catch (error) {
      logger.break()
      handleError(error)
    }
  })

export async function removeRegistriesFromConfig(
  namespaces: string[],
  cwd: string,
  options: { silent?: boolean }
) {
  const configPath = path.resolve(cwd, "components.json")
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `No ${highlighter.info("components.json")} found at ${highlighter.info(
        cwd
      )}.`
    )
  }

  const config = await fs.readJson(configPath)
  const existing: Record<string, unknown> = config.registries ?? {}
  const removed: string[] = []
  const missing: string[] = []

  for (const namespace of namespaces) {
    if (namespace in BUILTIN_REGISTRIES) {
      logger.warn(
        `${highlighter.info(
          namespace
        )} is a built-in registry and cannot be removed.`
      )
      continue
    }

    if (namespace in existing) {
      delete existing[namespace]
      removed.push(namespace)
    } else {
      missing.push(namespace)
    }
  }

  if (removed.length) {
    const updated = { ...config }
    if (Object.keys(existing).length) {
      updated.registries = existing
    } else {
      delete updated.registries
    }
    const writeSpinner = spinner(`Updating components.json.`, {
      silent: options.silent,
    }).start()
    await fs.writeJson(configPath, updated, { spaces: 2 })
    writeSpinner.succeed()
  }

  if (!options.silent) {
    for (const name of removed) {
      logger.log(`  - removed ${name}`)
    }
    for (const name of missing) {
      logger.warn(`  - ${name} was not configured`)
    }
    if (!removed.length && !missing.length) {
      logger.info("Nothing to remove.")
    }
  }

  return { removed, missing }
}
