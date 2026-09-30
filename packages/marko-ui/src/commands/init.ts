import { existsSync, promises as fs } from "fs"
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
import { isMonorepoRoot } from "@/src/utils/get-monorepo-info"
import { getProjectConfig, getProjectInfo } from "@/src/utils/get-project-info"
import { CommandError, handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { ensureRegistriesInConfig } from "@/src/utils/registries"
import { select } from "@/src/utils/clack"
import { isInteractive } from "@/src/utils/interactive"
import { spinner } from "@/src/utils/spinner"
import { updateDependencies } from "@/src/utils/updaters/update-dependencies"
import { updateTsConfig } from "@/src/utils/updaters/update-tsconfig"
import {
  ensureVitePlugin,
  wireCssImport,
} from "@/src/utils/updaters/update-css-entry-wiring"
import { scaffoldImportDistributionCss } from "@/src/utils/updaters/update-css-import-distribution"
import { Command } from "commander"
import { z } from "zod"

// The non-interactive defaults. The prompts start on the same values, so
// pressing Enter through all three equals `--defaults`.
const DEFAULT_BASE_COLOR = "neutral"
const DEFAULT_DISTRIBUTION = "copy"

export const initOptionsSchema = z.object({
  cwd: z.string(),
  components: z.array(z.string()).optional(),
  yes: z.boolean().default(false),
  defaults: z.boolean().default(false),
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
  // No default here: this used to be `true`, which made every run look like
  // an explicit `--yes` and so switched the interactive questions off in a
  // real terminal. The flag is now only ever set by the caller.
  .option(
    "-y, --yes",
    "do not prompt; use the default for every choice not given by flag (base color, distribution, visual style)."
  )
  .option(
    "-d, --defaults",
    "do not prompt; use the default for every choice not given by flag. same as --yes."
  )
  .option("-f, --force", "force overwrite of existing configuration.", false)
  .option("-s, --silent", "mute output. also disables prompts (defaults are used).", false)
  .option("-b, --base-color <name>", "the base color to use.")
  .option("--css-variables", "use css variables for theming.", true)
  .option("--no-css-variables", "do not use css variables for theming.")
  .option(
    "--agents",
    "also write the marko-ui section of AGENTS.md and install the agent skills. safe to run on an already-initialized project.",
    false
  )
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

      // `init --agents` is the one command the docs hand to a coding agent,
      // and an agent is usually pointed at a project that is ALREADY set up.
      // Failing the preflight there ("components.json already exists") left
      // the agent with neither AGENTS.md nor the skill and no hint that
      // `agents sync` was the command it wanted. The project setup is done,
      // so do the part that is not.
      if (
        options.agents &&
        !options.force &&
        existsSync(path.resolve(options.cwd, "components.json"))
      ) {
        if (!options.silent) {
          logger.info(
            `${highlighter.info(
              "components.json"
            )} already exists — skipping project setup and syncing the agent docs.`
          )
        }
        await runAgentsSync(options.cwd, { silent: options.silent })
        logger.log(
          `${highlighter.success("Success!")} Agent setup completed.`
        )
        logger.break()
        return
      }

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
 * Exported so tests assert against this rather than hardcoding the literal.
 *
 * `styles/globals.css` is settled, not provisional: it is what the docs
 * document (docs/components-json, docs/theming, docs/dark-mode) and what the
 * registry's theme item targets. An earlier draft of the CLI DX work moved it
 * to `app.css`; that was reversed precisely because nothing documented that
 * path.
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

    if (preflight.errors[ERRORS.NOT_A_MARKO_PROJECT]) {
      const workspaceRoot = await isMonorepoRoot(options.cwd)
      throw new CommandError(
        `${highlighter.info(
          options.cwd
        )} does not look like a Marko project (no ${highlighter.info(
          "marko"
        )}, ${highlighter.info("@marko/run")} or ${highlighter.info(
          "@marko/vite"
        )} dependency in package.json). ` +
          (workspaceRoot
            ? `This looks like a workspace root: run ${highlighter.info(
                "marko-ui init"
              )} from the app directory or pass ${highlighter.info(
                "--cwd <app>"
              )}.`
            : `Create one first (e.g. ${highlighter.info(
                "bun create marko@latest"
              )}), then run ${highlighter.info(
                "marko-ui init"
              )} inside it. If it is a Marko project, pass ${highlighter.info(
                "--force"
              )}.`)
      )
    }
  }

  const { config, distribution, visualStyle } = await promptForConfig(options)

  // Write components.json.
  const componentSpinner = spinner(`Writing components.json.`, {
    silent: options.silent,
  }).start()
  const targetPath = path.resolve(options.cwd, "components.json")
  const previousComponentsJson = existsSync(targetPath)
    ? await fs.readFile(targetPath, "utf8")
    : null
  await writeComponentsJson(targetPath, config)
  componentSpinner.succeed()

  // components.json is what makes a project "initialized": a later `init`
  // refuses to run over it. Every other step below (tsconfig option,
  // stylesheet, Vite wiring, dependencies, theme) skips what is already done,
  // so it is safe to repeat. So if anything after this point fails — the
  // registry being unreachable is the usual reason — put components.json back
  // as it was (or remove it) and let the error through, rather than leave a
  // project that cannot be re-initialized and has no theme.
  let fullConfig: Config
  try {
    fullConfig = await resolveConfigPaths(options.cwd, config)

    // Registry components import siblings with explicit `.ts` extensions, which
    // a stock `create-marko` tsconfig rejects (TS5097). `init` already writes
    // components.json and patches CSS, so the compiler option belongs here too —
    // otherwise scaffold -> init -> add lands on a project that cannot typecheck.
    await updateTsConfig(fullConfig, { silent: options.silent })

    // The CSS entry point must exist before any theme or component tries to
    // patch it. A `create-marko` scaffold ships no stylesheet at all, which is
    // what made `init` die with ENOENT on the (previously Next.js-shaped)
    // default path.
    await ensureCssEntry(fullConfig, { silent: options.silent })

    // Creating the stylesheet is not enough — it has to actually load. A
    // `create-marko` scaffold imports no CSS anywhere (its layout uses an inline
    // `<style>`) and has no Vite config, so without this the theme and every
    // component utility are silently absent from the build output.
    await wireCssEntry(fullConfig, { silent: options.silent })

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

    // (`--agents` runs after the try, below.)
  } catch (error) {
    await rollbackComponentsJson(targetPath, previousComponentsJson, options)
    throw error
  }

  // Outside the rollback scope on purpose: the project is fully initialized by
  // now, so a skills-install failure exits 1 with its own message and keeps
  // the project instead of undoing it.
  if (options.agents) {
    await runAgentsSync(options.cwd, { silent: options.silent })
  }

  return fullConfig
}

/**
 * Puts components.json back as it was (removes it, or restores the previous
 * one under `--force`) after a failed init.
 *
 * The restore must never mask the failure that caused it: if it fails too, say
 * which file is left behind and return, so the caller rethrows the ORIGINAL
 * error.
 */
export async function rollbackComponentsJson(
  targetPath: string,
  previous: string | null,
  options: { silent?: boolean } = {}
) {
  try {
    if (previous === null) {
      await fs.rm(targetPath, { force: true })
    } else {
      await fs.writeFile(targetPath, previous, "utf8")
    }
  } catch (restoreError) {
    logger.warn(
      `Could not ${
        previous === null ? "remove" : "restore"
      } ${highlighter.info(targetPath)} after the failed init (${
        restoreError instanceof Error ? restoreError.message : restoreError
      }). It is left behind: fix or delete it by hand before running ${highlighter.info(
        "marko-ui init"
      )} again.`
    )
    return
  }

  if (!options.silent) {
    logger.info(
      `Init failed. ${highlighter.info(
        "components.json"
      )} was rolled back; anything already done stays in place (tsconfig option, stylesheet, layout import, Vite config, installed dependencies). Running ${highlighter.info(
        "marko-ui init"
      )} again is safe.`
    )
  }
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

/**
 * Makes the CSS entry point live: imported by the layout, and processed by
 * Tailwind's Vite plugin.
 *
 * Split from `ensureCssEntry` because creating the file and loading it are
 * different failures. A project can legitimately already do either (its own
 * import, its own Vite config), so each step is skipped independently and a
 * step that cannot be done safely is reported as a manual one rather than
 * guessed at.
 */
async function wireCssEntry(
  config: Config,
  options: { silent?: boolean } = {}
) {
  const imported = await wireCssImport(config, options)
  const plugin = await ensureVitePlugin(config, options)

  // The generated config imports @tailwindcss/vite, so it has to be installed
  // or the next `bun run build` fails on an unresolved import.
  if (plugin === "created") {
    await updateDependencies([], ["@tailwindcss/vite"], config, {
      silent: options.silent,
    })
  }

  if (options.silent) {
    return
  }

  if (imported === "no-layout") {
    const cssPath = config.resolvedPaths.tailwindCss
    const relative = cssPath
      ? path.relative(config.resolvedPaths.cwd, cssPath)
      : "your stylesheet"
    logger.warn(
      `Could not find src/routes/+layout.marko to import ${highlighter.info(
        relative
      )}. Import it from your root layout, or the theme and component styles will not load.`
    )
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

/**
 * Whether this run may ask questions at all.
 *
 * `--defaults`/`--yes` (and `--silent`) are explicit intent to skip prompting;
 * a non-TTY stdin, CI, or an agent harness means nothing could answer one.
 * Both are needed: consulting only the flags made an agent/piped invocation
 * hang on the first prompt, and (the inverse) `--yes` defaulting to `true` made
 * a real terminal never prompt, silently taking defaults.
 *
 * Exported with `interactive` injectable so the decision is unit-testable
 * without a pty.
 */
export function mayPromptForInit(
  options: Pick<
    z.infer<typeof initOptionsSchema>,
    "defaults" | "yes" | "silent"
  >,
  interactive: boolean = isInteractive()
): boolean {
  return !options.defaults && !options.yes && !options.silent && interactive
}

/**
 * What the project already decides for `init`: aliases, stylesheet path and
 * extra registries, derived from an existing config or detected project files.
 * Shared by `promptForConfig` and `buildDefaultConfig` so the `add --dry-run`
 * preview resolves exactly the paths auto-init would write.
 */
async function deriveProjectDefaults(cwd: string) {
  const [existingConfig, projectConfig, projectInfo] = await Promise.all([
    getConfig(cwd).catch(() => null),
    getProjectConfig(cwd).catch(() => null),
    getProjectInfo(cwd),
  ])

  // Derived config from the project (aliases, css file) when available.
  const detected = projectConfig ?? existingConfig

  const componentsAlias = detected?.aliases?.components ?? DEFAULT_COMPONENTS
  const aliasDefaults = getInitAliasDefaults(componentsAlias, detected?.aliases)

  const tailwindCss = resolveTailwindCssPath({
    configuredCss: detected?.tailwind?.css,
    detectedCss: projectInfo?.tailwindCssFile,
    frameworkName: projectInfo?.framework?.name,
    isSrcDir: projectInfo?.isSrcDir,
  })

  return {
    componentsAlias,
    aliasDefaults,
    tailwindCss,
    registries: filterBuiltinRegistries(detected?.registries),
  }
}

/**
 * The config a non-interactive `init` would write, resolved against `cwd`
 * without writing anything. `add --dry-run` uses it to preview an
 * uninitialized project.
 */
export async function buildDefaultConfig(cwd: string): Promise<Config> {
  const { componentsAlias, aliasDefaults, tailwindCss, registries } =
    await deriveProjectDefaults(cwd)
  const raw = rawConfigSchema.parse({
    $schema: "https://ui.shadcn.com/schema.json",
    style: "default",
    distribution: "copy",
    visualStyle: DEFAULT_VISUAL_STYLE,
    tailwind: {
      config: "",
      css: tailwindCss,
      baseColor: "neutral",
      cssVariables: true,
      prefix: "",
    },
    rsc: false,
    tsx: true,
    aliases: { components: componentsAlias, ...aliasDefaults },
    registries,
  })
  return resolveConfigPaths(cwd, raw)
}

async function promptForConfig(options: z.infer<typeof initOptionsSchema>): Promise<{
  config: z.infer<typeof rawConfigSchema>
  distribution: "copy" | "import"
  visualStyle: string
}> {
  const { componentsAlias, aliasDefaults, tailwindCss, registries } =
    await deriveProjectDefaults(options.cwd)

  const mayPrompt = mayPromptForInit(options)

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
      })),
      { initialValue: DEFAULT_BASE_COLOR }
    )
  }
  if (!baseColor) {
    baseColor = DEFAULT_BASE_COLOR
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
      ],
      { initialValue: DEFAULT_DISTRIBUTION }
    )) as "copy" | "import"
  }
  if (!distribution) {
    distribution = DEFAULT_DISTRIBUTION
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
      })),
      { initialValue: DEFAULT_VISUAL_STYLE }
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
    registries,
  })

  return { config, distribution, visualStyle }
}
