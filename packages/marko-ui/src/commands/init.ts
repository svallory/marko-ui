import { promises as fs } from "fs"
import path from "path"
import { runAgentsSync } from "@/src/commands/agents"
import { writeProjectTaglib } from "@/src/utils/taglib"
import { preFlightInit } from "@/src/preflights/preflight-init"
import {
  BASE_COLORS,
  BUILTIN_REGISTRIES,
  DEFAULT_VISUAL_STYLE,
  MARKO_UI_URL,
  VISUAL_STYLES,
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
  writeComponentsJson,
  type Config,
} from "@/src/utils/get-config"
import { getProjectConfig, getProjectInfo } from "@/src/utils/get-project-info"
import {
  CleanExit,
  CommandError,
  handleError,
} from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { ensureRegistriesInConfig } from "@/src/utils/registries"
import { confirm, select } from "@/src/utils/clack"
import { isInteractive } from "@/src/utils/interactive"
import { spinner } from "@/src/utils/spinner"
import { updateDependencies } from "@/src/utils/updaters/update-dependencies"
import { scaffoldImportDistributionCss } from "@/src/utils/updaters/update-css-import-distribution"
import { Command } from "commander"
import { z } from "zod"

export const initOptionsSchema = z.object({
  cwd: z.string(),
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  defaults: z.boolean(),
  force: z.boolean(),
  silent: z.boolean(),
  cssVariables: z.boolean().default(true),
  baseColor: z.string().optional(),
  skipPreflight: z.boolean().optional(),
  agents: z.boolean().optional(),
  distribution: z.enum(["copy", "import"]).optional(),
  visualStyle: z.string().optional(),
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
  .option(
    "-D, --distribution <mode>",
    "how components are shipped: copy (flat generated source, default) or import (@marko-ui/shadcn hook-class components + CSS layers)."
  )
  .option(
    "--visual-style <name>",
    // NOT "ignored for copy", as this said until now: the copy path fetches
    // per-style registry items at styles/<visualStyle>/<item>.json (see
    // registry/resolver.ts's fetchBareRegistryItem), so the style decides
    // which generated source is copied in. init prompts for it under either
    // distribution, and the old wording contradicted both that prompt and
    // the resolver.
    `the visual style to use (${VISUAL_STYLES.map((s) => s.name).join(", ")}). selects the generated source for copy, and the precompiled CSS layer for import.`
  )
  .action(async (components, opts) => {
    try {
      const options = initOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
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

/**
 * The stylesheet a Marko project gets when nothing is configured or detected,
 * relative to the project's source root (`src/` is prepended when the project
 * has one).
 *
 * Exported so tests assert against this rather than hardcoding the literal:
 * the value is expected to change (to `app.css`) with the in-flight CLI DX
 * work, and a test that repeats the string would have to be edited in
 * lockstep for no benefit.
 */
export const MARKO_DEFAULT_CSS = "styles/globals.css"

/**
 * Decide which stylesheet path `components.json` should record.
 *
 * Order: an explicitly configured path, then a detected one, then a
 * framework-appropriate default, and only then shadcn's inherited Next.js
 * default.
 *
 * The framework step exists because `getTailwindCssFile` only recognizes a
 * stylesheet that ALREADY contains `@import "tailwindcss"` / `@tailwind
 * base`. A freshly scaffolded app has no such file yet, so detection returns
 * null and the final fallback decides — and DEFAULT_TAILWIND_CSS is Next.js's
 * `app/globals.css`. In a Marko project that path does not exist and never
 * will, so `init` wrote a components.json pointing at it and then died on a
 * plain `bun create marko` app following the documented install commands:
 *
 *     - Updating app/globals.css
 *     ENOENT: no such file or directory, open '<cwd>/app/globals.css'
 *
 * Note this is precisely the case detection CANNOT cover: the file init is
 * about to create is the one whose absence makes detection fail.
 */
export function resolveTailwindCssPath({
  configuredCss,
  detectedCss,
  frameworkName,
  isSrcDir,
}: {
  configuredCss?: string | null
  detectedCss?: string | null
  frameworkName?: string | null
  isSrcDir?: boolean
}): string {
  if (configuredCss) return configuredCss
  if (detectedCss) return detectedCss

  if (frameworkName === "marko-run" || frameworkName === "marko-vite") {
    return isSrcDir ? `src/${MARKO_DEFAULT_CSS}` : MARKO_DEFAULT_CSS
  }

  return DEFAULT_TAILWIND_CSS
}

export async function runInit(
  options: z.infer<typeof initOptionsSchema>
): Promise<Config> {
  if (!options.skipPreflight) {
    const preflight = await preFlightInit(options)
    if (preflight.errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
      throw new CommandError(
        `No project found at ${highlighter.info(
          options.cwd
        )}. Create a Marko app first (e.g. ${highlighter.info(
          "bun create marko@latest"
        )}), then run ${highlighter.info("marko-ui init")} inside it.`
      )
    }
  }

  const { config, distribution, visualStyle } = await promptForConfig(options)

  if (!options.yes && !options.silent) {
    const proceed = await confirm(
      `Write configuration to ${highlighter.info(
        "components.json"
      )}. Proceed?`
    )

    if (!proceed) {
      // User declined — a successful no-op, not a failure.
      throw new CleanExit(0)
    }
  }

  // Write components.json.
  const componentSpinner = spinner(`Writing components.json.`, {
    silent: options.silent,
  }).start()
  const targetPath = path.resolve(options.cwd, "components.json")
  await writeComponentsJson(targetPath, config)
  componentSpinner.succeed()

  let fullConfig = await resolveConfigPaths(options.cwd, config)

  // The CSS entry point must exist before any theme or component tries to
  // patch it. A `create-marko` scaffold ships no stylesheet at all, which is
  // what made `init` die with ENOENT on the (previously Next.js-shaped)
  // default path.
  await ensureCssEntry(fullConfig, { silent: options.silent })

  // Resolve any namespaced registries referenced by the requested components.
  if (options.components?.length) {
    const { config: configWithRegistries } = await ensureRegistriesInConfig(
      options.components,
      fullConfig,
      { silent: options.silent }
    )
    fullConfig = configWithRegistries
  }

  if (distribution === "import") {
    // Import path: no files are copied. `@marko-ui/shadcn` ships the mu-*
    // hook-class components + precompiled style CSS layers; scaffold the
    // dependency and the CSS entry that consumes them (see
    // notes/plans/dual-distribution-plan.md §1/§4c).
    await updateDependencies(["@marko-ui/shadcn"], [], fullConfig, {
      silent: options.silent,
    })
    await scaffoldImportDistributionCss(fullConfig, {
      baseColor: config.tailwind.baseColor ?? "neutral",
      visualStyle,
      silent: options.silent,
    })

    if (!options.silent) {
      logger.info(
        `Import distribution: components come from ${highlighter.info(
          "@marko-ui/shadcn"
        )} (no local component files). Use ${highlighter.info(
          `class="style-${visualStyle}"`
        )} on an ancestor element to activate the ${highlighter.info(
          visualStyle
        )} style.`
      )
    }
  } else {
    // Copy path: install the theme matching the chosen base color (the
    // registry publishes one style item per base color: style, style-zinc,
    // ...) plus the requested components as flat generated source.
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
    })

    // Zero-import tags for installed components (<Badge>, <badge>, ...).
    await writeProjectTaglib(fullConfig)
  }

  if (options.agents) {
    await runAgentsSync(options.cwd, { silent: options.silent })
  }

  return fullConfig
}

/**
 * Creates the project's CSS entry point when it does not exist yet.
 *
 * `create-marko` scaffolds no stylesheet, so the file the theme is about to be
 * merged into has to be brought into existence first — previously `init`
 * assumed it was already there and crashed with ENOENT. Only the bare
 * `@import "tailwindcss"` is written; the theme tokens arrive through the
 * registry's style item, which is merged into this same file. Writing just the
 * import (rather than a full theme) is what keeps a second `init` run a no-op
 * instead of appending a duplicate token set.
 */
async function ensureCssEntry(
  config: Config,
  options: { silent?: boolean } = {}
) {
  const cssPath = config.resolvedPaths.tailwindCss
  if (!cssPath) {
    return
  }

  try {
    await fs.access(cssPath)
    // Already present — leave whatever the project has alone.
    return
  } catch {
    // Falls through to creation.
  }

  await fs.mkdir(path.dirname(cssPath), { recursive: true })
  await fs.writeFile(cssPath, `@import "tailwindcss";\n`, "utf8")

  if (!options.silent) {
    const relative = path.relative(config.resolvedPaths.cwd, cssPath)
    logger.info(`Created ${highlighter.info(relative)} (CSS entry point).`)
  }
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

async function promptForConfig(options: z.infer<typeof initOptionsSchema>): Promise<{
  config: z.infer<typeof rawConfigSchema>
  distribution: "copy" | "import"
  visualStyle: string
}> {
  const [existingConfig, projectConfig, projectInfo] = await Promise.all([
    getConfig(options.cwd).catch(() => null),
    getProjectConfig(options.cwd).catch(() => null),
    getProjectInfo(options.cwd),
  ])

  // Derived config from the project (aliases, css file) when available.
  const detected = projectConfig ?? existingConfig

  // Whether this run may block on a TTY prompt at all. `--defaults`/`--yes`
  // are explicit intent to skip prompting; a non-TTY stdin, CI, or an agent
  // harness means nothing could answer one. Previously only the two flags
  // were consulted, so an agent/piped invocation hung forever on the first
  // prompt (the base-color select) instead of taking the documented default.
  const mayPrompt =
    !options.defaults &&
    !options.yes &&
    !options.silent &&
    isInteractive()

  // Defaults applied because prompting was skipped, reported in one line at
  // the end so a non-interactive run still says what it chose.
  const appliedDefaults: string[] = []

  let baseColor = options.baseColor
  if (!baseColor && mayPrompt) {
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
  if (!baseColor) {
    baseColor = "neutral"
    appliedDefaults.push(`base color ${highlighter.info(baseColor)}`)
  }

  if (!BASE_COLORS.some((item) => item.name === baseColor)) {
    throw new CommandError(
      `Invalid base color ${highlighter.info(
        baseColor
      )}. Expected one of: ${BASE_COLORS.map((item) => item.name).join(", ")}.`
    )
  }

  let distribution = options.distribution
  if (!distribution && mayPrompt) {
    distribution = (await select(
      `Which ${highlighter.info(
        "distribution"
      )} do you want — copy generated source into your project, or import ${highlighter.info(
        "@marko-ui/shadcn"
      )}?`,
      [
        { value: "copy", label: "copy", hint: "the code is yours — shadcn's model" },
        {
          value: "import",
          label: "import",
          hint: "npm dependency, theme/switch styles from your own CSS",
        },
      ]
    )) as "copy" | "import"
  }
  if (!distribution) {
    distribution = "copy"
    appliedDefaults.push(`distribution ${highlighter.info(distribution)}`)
  }

  if (distribution !== "copy" && distribution !== "import") {
    throw new CommandError(
      `Invalid distribution ${highlighter.info(
        distribution
      )}. Expected one of: copy, import.`
    )
  }

  // Visual style is a real dimension for BOTH distributions: "copy" uses it
  // to pick which per-style registry tree `add` fetches from
  // (`<REGISTRY_URL>/styles/<visualStyle>/<name>.json`), "import" uses it to pick
  // which `style-<visualStyle>` class activates @marko-ui/shadcn's precompiled
  // layer. It must be persisted either way — prompting for it in "import"
  // only (the pre-dual-distribution-blocker-fix behavior) left "copy"
  // projects with no way to record which style `add` should keep fetching.
  let visualStyle = options.visualStyle
  if (!visualStyle && mayPrompt) {
    visualStyle = await select(
      `Which ${highlighter.info("visual style")} would you like to use?`,
      VISUAL_STYLES.map((item) => ({
        value: item.name as string,
        label: item.label,
      }))
    )
  }
  if (!visualStyle) {
    visualStyle = DEFAULT_VISUAL_STYLE
    appliedDefaults.push(`visual style ${highlighter.info(visualStyle)}`)
  }

  if (!VISUAL_STYLES.some((item) => item.name === visualStyle)) {
    throw new CommandError(
      `Invalid visual style ${highlighter.info(
        visualStyle
      )}. Expected one of: ${VISUAL_STYLES.map((item) => item.name).join(", ")}.`
    )
  }

  const componentsAlias = detected?.aliases?.components ?? DEFAULT_COMPONENTS
  const aliasDefaults = getInitAliasDefaults(
    componentsAlias,
    detected?.aliases
  )

  const tailwindCss = resolveTailwindCssPath({
    configuredCss: detected?.tailwind?.css,
    detectedCss: projectInfo?.tailwindCssFile,
    frameworkName: projectInfo?.framework?.name,
    isSrcDir: projectInfo?.isSrcDir,
  })

  // A non-interactive run must still say what it decided on the user's
  // behalf, so the result is reviewable without re-deriving the defaults.
  if (appliedDefaults.length && !options.silent) {
    logger.info(
      `Non-interactive run — using ${appliedDefaults.join(", ")}.`
    )
  }

  const config = rawConfigSchema.parse({
    // components.json is wire-compatible with shadcn; its schema authority
    // is shadcn's published one (we do not serve a schema.json).
    $schema: "https://ui.shadcn.com/schema.json",
    style: "default",
    distribution,
    visualStyle,
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

  return { config, distribution, visualStyle }
}
