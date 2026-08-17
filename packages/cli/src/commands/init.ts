import { promises as fs } from "fs"
import path from "path"
import { runAgentsSync } from "@/src/commands/agents"
import { writeProjectTaglib } from "@/src/utils/taglib"
import { preFlightInit } from "@/src/preflights/preflight-init"
import {
  BASE_COLORS,
  BUILTIN_REGISTRIES,
  MARKO_UI_URL,
} from "@/src/registry/constants"
import { clearRegistryContext } from "@/src/registry/context"
import { rawConfigSchema } from "@/src/schema"
import { addComponents } from "@/src/utils/add-components"
import { getInitAliasDefaults } from "@/src/utils/alias"
import { loadEnvFiles } from "@/src/utils/env-loader"
import * as ERRORS from "@/src/utils/errors"
import {
  DEFAULT_COMPONENTS,
  DEFAULT_TAILWIND_CSS,
  getConfig,
  resolveConfigPaths,
  type Config,
} from "@/src/utils/get-config"
import { getProjectConfig, getProjectInfo } from "@/src/utils/get-project-info"
import { handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { ensureRegistriesInConfig } from "@/src/utils/registries"
import { confirm, select } from "@/src/utils/clack"
import { spinner } from "@/src/utils/spinner"
import { Command } from "commander"
import { z } from "zod"

export const initOptionsSchema = z.object({
  cwd: z.string(),
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  defaults: z.boolean(),
  force: z.boolean(),
  silent: z.boolean(),
  isNewProject: z.boolean().default(false),
  cssVariables: z.boolean().default(true),
  baseColor: z.string().optional(),
  skipPreflight: z.boolean().optional(),
  agents: z.boolean().optional(),
})

export const init = new Command()
  .name("init")
  .description("initialize your project and install dependencies")
  .argument("[components...]", "names, url or local path to component")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-y, --yes", "skip confirmation prompt.", true)
  .option("-d, --defaults", "use default configuration.", false)
  .option("-f, --force", "force overwrite of existing configuration.", false)
  .option("-s, --silent", "mute output.", false)
  .option("-b, --base-color <name>", "the base color to use.")
  .option("--css-variables", "use css variables for theming.", true)
  .option("--no-css-variables", "do not use css variables for theming.")
  .option("--agents", "generate AGENTS.md and the marko-ui Claude skill.", false)
  .action(async (components, opts) => {
    try {
      const options = initOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        isNewProject: false,
        components,
        baseColor: opts.baseColor,
        ...opts,
      })

      await loadEnvFiles(options.cwd)

      await runInit(options)

      logger.log(
        `${highlighter.success(
          "Success!"
        )} Project initialization completed.\nYou may now add components with ${highlighter.info(
          "marko-ui add"
        )}.`
      )
      logger.break()
    } catch (error) {
      logger.break()
      handleError(error)
    } finally {
      clearRegistryContext()
    }
  })

export async function runInit(
  options: z.infer<typeof initOptionsSchema>
): Promise<Config> {
  if (!options.skipPreflight) {
    const preflight = await preFlightInit(options)
    if (preflight.errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
      logger.break()
      logger.error(
        `No project found at ${highlighter.info(
          options.cwd
        )}. Create a Marko app first (e.g. ${highlighter.info(
          "bun create marko@latest"
        )}), then run ${highlighter.info("marko-ui init")} inside it.`
      )
      logger.break()
      process.exit(1)
    }
  }

  const config = await promptForConfig(options)

  if (!options.yes && !options.silent) {
    const proceed = await confirm(
      `Write configuration to ${highlighter.info(
        "components.json"
      )}. Proceed?`
    )

    if (!proceed) {
      process.exit(0)
    }
  }

  // Write components.json.
  const componentSpinner = spinner(`Writing components.json.`, {
    silent: options.silent,
  }).start()
  const targetPath = path.resolve(options.cwd, "components.json")
  await fs.writeFile(targetPath, JSON.stringify(config, null, 2) + "\n", "utf8")
  componentSpinner.succeed()

  let fullConfig = await resolveConfigPaths(options.cwd, config)

  // Resolve any namespaced registries referenced by the requested components.
  if (options.components?.length) {
    const { config: configWithRegistries } = await ensureRegistriesInConfig(
      options.components,
      fullConfig,
      { silent: options.silent }
    )
    fullConfig = configWithRegistries
  }

  // Install the theme matching the chosen base color (the registry
  // publishes one style item per base color: style, style-zinc, ...)
  // plus the requested components.
  const styleItem =
    !config.tailwind.baseColor || config.tailwind.baseColor === "neutral"
      ? "style"
      : `style-${config.tailwind.baseColor}`
  const components = Array.from(
    new Set([styleItem, ...(options.components ?? [])])
  )
  await addComponents(components, fullConfig, {
    overwrite: true,
    silent: options.silent,
    isNewProject: options.isNewProject,
  })

  // Zero-import tags for installed components (<Badge>, <badge>, ...).
  await writeProjectTaglib(fullConfig)

  if (options.agents) {
    await runAgentsSync(options.cwd, { silent: options.silent })
  }

  return fullConfig
}

// The built-in @marko-ui registry must never be written to components.json —
// getConfig rejects configs that try to (re)define it.
function filterBuiltinRegistries(
  registries: Record<string, unknown> | undefined
) {
  if (!registries) {
    return undefined
  }

  const filtered = Object.fromEntries(
    Object.entries(registries).filter(
      ([key]) => !Object.keys(BUILTIN_REGISTRIES).includes(key)
    )
  )

  return Object.keys(filtered).length ? filtered : undefined
}

async function promptForConfig(
  options: z.infer<typeof initOptionsSchema>
): Promise<z.infer<typeof rawConfigSchema>> {
  const [existingConfig, projectConfig, projectInfo] = await Promise.all([
    getConfig(options.cwd).catch(() => null),
    getProjectConfig(options.cwd).catch(() => null),
    getProjectInfo(options.cwd),
  ])

  // Derived config from the project (aliases, css file) when available.
  const detected = projectConfig ?? existingConfig

  let baseColor = options.baseColor
  if (!baseColor && !options.defaults && !options.silent) {
    baseColor = await select(
      `Which color would you like to use as the ${highlighter.info(
        "base color"
      )}?`,
      BASE_COLORS.map((item) => ({
        value: item.name as string,
        label: item.label,
      }))
    )
  }
  baseColor = baseColor ?? "neutral"

  if (!BASE_COLORS.some((item) => item.name === baseColor)) {
    logger.break()
    logger.error(
      `Invalid base color ${highlighter.info(
        baseColor
      )}. Expected one of: ${BASE_COLORS.map((item) => item.name).join(", ")}.`
    )
    process.exit(1)
  }

  const componentsAlias = detected?.aliases?.components ?? DEFAULT_COMPONENTS
  const aliasDefaults = getInitAliasDefaults(
    componentsAlias,
    detected?.aliases
  )

  const tailwindCss =
    detected?.tailwind?.css ??
    projectInfo?.tailwindCssFile ??
    DEFAULT_TAILWIND_CSS

  return rawConfigSchema.parse({
    // components.json is wire-compatible with shadcn; its schema authority
    // is shadcn's published one (we do not serve a schema.json).
    $schema: "https://ui.shadcn.com/schema.json",
    style: "default",
    tailwind: {
      config: "",
      css: tailwindCss,
      baseColor,
      cssVariables: options.cssVariables,
      prefix: "",
    },
    rsc: false,
    tsx: true,
    aliases: {
      components: componentsAlias,
      ...aliasDefaults,
    },
    registries: filterBuiltinRegistries(detected?.registries),
  })
}
