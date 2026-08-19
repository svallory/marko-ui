import path from "path"
import { runInit } from "@/src/commands/init"
import { preFlightAdd } from "@/src/preflights/preflight-add"
import { getRegistryItems, getShadcnRegistryIndex } from "@/src/registry/api"
import { clearRegistryContext } from "@/src/registry/context"
import { registryItemTypeSchema } from "@/src/registry/schema"
import { isUniversalRegistryItem } from "@/src/registry/utils"
import { addComponents } from "@/src/utils/add-components"
import { dryRunComponents } from "@/src/utils/dry-run"
import { formatDryRunResult } from "@/src/utils/dry-run-formatter"
import { loadEnvFiles } from "@/src/utils/env-loader"
import * as ERRORS from "@/src/utils/errors"
import { createConfig, getConfig } from "@/src/utils/get-config"
import {
  CleanExit,
  CommandError,
  handleError,
} from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { ensureRegistriesInConfig } from "@/src/utils/registries"
import { confirm, exitIfEmptySelection, multiselect } from "@/src/utils/clack"
import { spinner } from "@/src/utils/spinner"
import { writeProjectTaglib } from "@/src/utils/taglib"
import { Command } from "commander"
import { z } from "zod"

export const addOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  overwrite: z.boolean(),
  cwd: z.string(),
  all: z.boolean(),
  path: z.string().optional(),
  silent: z.boolean(),
  dryRun: z.boolean(),
})

export const add = new Command()
  .name("add")
  .description("add a component to your project")
  .argument("[components...]", "item addresses to add")
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option("-o, --overwrite", "overwrite existing files.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-a, --all", "add all available components", false)
  .option("-p, --path <path>", "the path to add the component to.")
  .option("-s, --silent", "mute output.", false)
  .option("--dry-run", "preview changes without writing files.", false)
  .action(async (components, opts) => {
    try {
      const options = addOptionsSchema.parse({
        components,
        ...opts,
        cwd: path.resolve(opts.cwd),
      })

      await loadEnvFiles(options.cwd)

      // Design principle: `add` stays pure — use the standalone `diff` and
      // `show` commands for inspection.
      const isDryRun = options.dryRun

      let initialConfig = await getConfig(options.cwd)
      const hasExistingConfig = !!initialConfig
      if (!initialConfig) {
        initialConfig = createConfig({
          style: "default",
          resolvedPaths: {
            cwd: options.cwd,
          },
        })
      }

      let hasNewRegistries = false
      if (components.length > 0) {
        const { config: updatedConfig, newRegistries } =
          await ensureRegistriesInConfig(components, initialConfig, {
            silent: options.silent,
            writeFile: false,
          })
        initialConfig = updatedConfig
        hasNewRegistries = newRegistries.length > 0
      }

      let itemType: z.infer<typeof registryItemTypeSchema> | undefined
      let shouldInstallStyleIndex = true
      const shouldResolveInitialItem = components.length > 0

      if (shouldResolveInitialItem) {
        const [registryItem] = await getRegistryItems([components[0]], {
          config: initialConfig,
        })
        itemType = registryItem?.type
        shouldInstallStyleIndex =
          itemType !== "registry:theme" &&
          itemType !== "registry:style" &&
          itemType !== "registry:base"

        if (isUniversalRegistryItem(registryItem) && !isDryRun) {
          await addComponents(components, initialConfig, options)
          return
        }
        if (
          !options.yes &&
          !isDryRun &&
          (itemType === "registry:style" || itemType === "registry:theme")
        ) {
          logger.break()
          const proceed = await confirm(
            highlighter.warn(
              `You are about to install a new ${itemType.replace(
                "registry:",
                ""
              )}. \nExisting CSS variables and components will be overwritten. Continue?`
            )
          )
          if (!proceed) {
            logger.break()
            logger.log(`Installation cancelled.`)
            logger.break()
            // User declined. Message already printed; exit 1 is the
            // pre-existing contract for a cancelled install.
            throw new CleanExit(1)
          }
        }
      }

      if (!options.components?.length) {
        options.components = await promptForRegistryComponents(options)
      }

      let { errors, config } = await preFlightAdd(options)

      // No components.json file. Prompt the user to run init.
      let initHasRun = false
      if (errors[ERRORS.MISSING_CONFIG]) {
        const proceed = await confirm(
          `You need to create a ${highlighter.info(
            "components.json"
          )} file to add components. Proceed?`
        )

        if (!proceed) {
          // User declined to create components.json — nothing to add.
          throw new CleanExit(1)
        }

        config = await runInit({
          cwd: options.cwd,
          yes: true,
          force: true,
          defaults: false,
          skipPreflight: false,
          silent: options.silent && !hasNewRegistries,
          cssVariables: true,
          components: options.components ?? [],
        })
        initHasRun = true
      }

      if (errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
        throw new CommandError(
          `No project found at ${highlighter.info(
            options.cwd
          )}. Create a Marko app first (e.g. ${highlighter.info(
            "bun create marko@latest"
          )}), then run ${highlighter.info("marko-ui init")}.`
        )
      }

      if (!config) {
        throw new Error(
          `Failed to read config at ${highlighter.info(options.cwd)}.`
        )
      }

      const { config: updatedConfig } = await ensureRegistriesInConfig(
        options.components,
        config,
        {
          silent: options.silent || hasNewRegistries,
          writeFile: !isDryRun,
        }
      )
      config = updatedConfig

      // Dry-run mode: preview changes without writing files.
      if (isDryRun) {
        const dryRunSpinner = spinner("Resolving items.", {
          silent: options.silent,
        }).start()
        const dryRunResult = await dryRunComponents(
          options.components,
          config,
          {
            overwrite: options.overwrite,
          }
        )
        dryRunSpinner.stop()

        logger.log(formatDryRunResult(dryRunResult, options.components, {}))
        return
      }

      if (!initHasRun) {
        await addComponents(options.components, config, options)
        // Keep the project taglib (zero-import <Badge>/<badge> tags) in
        // sync with what is installed. No-op unless marko.json is ours.
        await writeProjectTaglib(config)
      }

    } catch (error) {
      logger.break()
      handleError(error)
    } finally {
      clearRegistryContext()
    }
  })

async function promptForRegistryComponents(
  options: z.infer<typeof addOptionsSchema>
) {
  const registryIndex = await getShadcnRegistryIndex()
  if (!registryIndex) {
    logger.break()
    handleError(new Error("Failed to fetch registry index."))
    return []
  }

  if (options.all) {
    return registryIndex.map((entry) => entry.name)
  }

  if (options.components?.length) {
    return options.components
  }

  const components = await multiselect(
    "Which components would you like to add?",
    registryIndex
      .filter((entry) => entry.type === "registry:ui")
      .map((entry) => ({
        value: entry.name,
        label: entry.name,
      })),
    {
      initialValues: options.components,
    }
  )

  exitIfEmptySelection(components, "No components selected. Exiting.")

  return components
}



