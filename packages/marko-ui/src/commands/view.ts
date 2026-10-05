import path from "path"
import { getRegistryItems } from "@/src/registry/api"
import { configWithDefaults } from "@/src/registry/config"
import { clearRegistryContext } from "@/src/registry/context"
import { validateRegistryConfigForItems } from "@/src/registry/validator"
import { loadEnvFiles } from "@/src/utils/env-loader"
import {
  getConfig,
  readPartialComponentsJson,
} from "@/src/utils/get-config"
import { CleanExit, CommandError, handleError } from "@/src/utils/handle-error"
import { printEnvelope } from "@/src/utils/json-output"
import { setJsonMode } from "@/src/utils/output-mode"
import { ensureRegistriesInConfig } from "@/src/utils/registries"
import { Command } from "commander"
import fsExtra from "fs-extra"
import { z } from "zod"

const viewOptionsSchema = z.object({
  cwd: z.string(),
  files: z.boolean(),
  deps: z.boolean(),
})

export const view = new Command()
  .name("show")
  .alias("view")
  .description("show items from the registry (files, dependencies, source)")
  .argument("<items...>", "item addresses to view")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--files", "only list file paths.", false)
  .option("--deps", "only list npm and registry dependencies.", false)
  // Accepted for symmetry with every other command that prints JSON. `show` has
  // no human format — it is always JSON — so the flag changes nothing; before
  // it, `marko-ui show x --json` was a usage error (exit 2) even though that is
  // exactly what an agent typed to ask for machine output.
  .option("--json", "no-op: show always prints JSON.", false)
  .action(async (items: string[], opts) => {
    try {
      // Recorded first, because `show` is ALWAYS machine output: a failure
      // takes the JSON error path whether or not --json was passed.
      setJsonMode(true)
      const options = viewOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        files: opts.files,
        deps: opts.deps,
      })

      await loadEnvFiles(options.cwd)

      // Start with a shadow config to support partial components.json.
      let shadowConfig = configWithDefaults({})

      // Check if there's a components.json file (partial or complete).
      const componentsJsonPath = path.resolve(options.cwd, "components.json")
      if (fsExtra.existsSync(componentsJsonPath)) {
        // Read and validated through the shared classifier, NOT inline: a
        // hand-edited broken file used to throw fs-extra's SyntaxError from
        // here — absolute project path and all — which the error handler could
        // only report as UNKNOWN_ERROR plus the GitHub boilerplate.
        shadowConfig = configWithDefaults(
          await readPartialComponentsJson(options.cwd)
        )
      }

      // Try to get the full config, but fall back to shadow config if it fails.
      let config = shadowConfig
      try {
        const fullConfig = await getConfig(options.cwd)
        if (fullConfig) {
          config = configWithDefaults(fullConfig)
        }
      } catch (error) {
        // A refusal (React components.json) is not a "partial config" — it
        // must reach the user, not be shadowed over.
        if (error instanceof CommandError) throw error
        // Use shadow config if getConfig fails (partial components.json).
      }

      const { config: updatedConfig, newRegistries } =
        await ensureRegistriesInConfig(items, config, {
          silent: true,
          writeFile: false,
        })
      if (newRegistries.length > 0) {
        config.registries = updatedConfig.registries
      }

      // Validate registries early for better error messages.
      validateRegistryConfigForItems(items, config)

      const payload = await getRegistryItems(items, { config })

      if (options.files) {
        printEnvelope(
          "marko-ui/show",
          payload.map((item) => ({
            name: item?.name,
            files: item?.files?.map((file) => file.target || file.path),
          }))
        )
        throw new CleanExit(0)
      }

      if (options.deps) {
        printEnvelope(
          "marko-ui/show",
          payload.map((item) => ({
            name: item?.name,
            dependencies: item?.dependencies ?? [],
            devDependencies: item?.devDependencies ?? [],
            registryDependencies: item?.registryDependencies ?? [],
          }))
        )
        throw new CleanExit(0)
      }

      // The item is printed as fetched: its docs are a `componentDocsRef`
      // (a URL), not the model, so this stays the size of the files and
      // dependencies it describes. `marko-ui docs` follows the reference.
      printEnvelope("marko-ui/show", payload)
      throw new CleanExit(0)
    } catch (error) {
      handleError(error)
    } finally {
      clearRegistryContext()
    }
  })
