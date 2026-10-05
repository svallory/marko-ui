import path from "path"
import { buildDefaultConfig, runInit } from "@/src/commands/init"
import { preFlightAdd } from "@/src/preflights/preflight-add"
import { getRegistryItems, getShadcnRegistryIndex } from "@/src/registry/api"
import { clearRegistryContext } from "@/src/registry/context"
import { RegistryErrorCode } from "@/src/registry/errors"
import { registryItemTypeSchema } from "@/src/registry/schema"
import { isUniversalRegistryItem } from "@/src/registry/utils"
import { addComponents, type AddResult } from "@/src/utils/add-components"
import { dryRunComponents, type DryRunResult } from "@/src/utils/dry-run"
import { formatDryRunResult } from "@/src/utils/dry-run-formatter"
import { loadEnvFiles } from "@/src/utils/env-loader"
import * as ERRORS from "@/src/utils/errors"
import { createConfig, getConfig, type Config } from "@/src/utils/get-config"
import {
  CleanExit,
  CommandError,
  handleError,
} from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { isInteractive } from "@/src/utils/interactive"
import { logger } from "@/src/utils/logger"
import {
  type CommandWarning,
  nextSteps,
  plannedToFileChanges,
  WarningCode,
} from "@/src/utils/command-result"
import { printEnvelope } from "@/src/utils/json-output"
import { setJsonMode } from "@/src/utils/output-mode"
import { ensureRegistriesInConfig } from "@/src/utils/registries"
import { confirm, exitIfEmptySelection, multiselect } from "@/src/utils/clack"
import { spinner } from "@/src/utils/spinner"
import { writeProjectTaglib } from "@/src/utils/taglib"
import { Command } from "commander"
import { getPackageInfo } from "@/src/utils/get-package-info"
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
  json: z.boolean(),
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
  .option("--json", "output as JSON (what was written, and any warnings).", false)
  .action(async (components, opts) => {
    try {
      // Recorded first so a failure takes the JSON error path, and so the
      // spinner and the human lists go quiet for the whole run — stdout must
      // end up carrying exactly one document.
      setJsonMode(Boolean(opts.json))
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

      if (hasExistingConfig && initialConfig.distribution === "import") {
        assertAddableDistribution(
          initialConfig,
          components,
          await getUiComponentNames()
        )
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
          const universal = await addComponents(components, initialConfig, {
            ...options,
            interactive: shouldPrompt(options),
          })
          if (options.json) {
            printAddResult(options.cwd, components, universal, [])
          }
          return
        }
        if (
          shouldConfirmStyleInstall(options, itemType, isDryRun)
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

      assertHasComponents(options)
      if (!options.components?.length) {
        options.components = await promptForRegistryComponents(options)
      }

      let { errors, config } = await preFlightAdd(options)

      // No components.json file. Prompt the user to run init.
      let initHasRun = false
      if (errors[ERRORS.MISSING_CONFIG] && isDryRun) {
        // A preview must not initialize anything: resolve against the config
        // init would write and say so.
        if (!options.components?.length) {
          throw new CommandError("Name a component to preview.")
        }
        const defaults = await buildDefaultConfig(options.cwd)
        const previewConfig = (
          await ensureRegistriesInConfig(options.components, defaults, {
            silent: true,
            writeFile: false,
          })
        ).config
        logger.info(
          `This project is not initialized: add would run ${highlighter.info(
            "init"
          )} with the defaults (base color ${highlighter.info(
            defaults.tailwind.baseColor ?? "neutral"
          )}, distribution ${highlighter.info(
            defaults.distribution ?? "copy"
          )}, visual style ${highlighter.info(
            defaults.visualStyle ?? "vega"
          )}), then add ${options.components
            .map((name) => highlighter.info(name))
            .join(", ")}. Nothing was written.`
        )
        const previewSpinner = spinner("Resolving items.", {
          silent: options.silent,
        }).start()
        const previewResult = await dryRunComponents(
          options.components,
          previewConfig,
          { overwrite: options.overwrite }
        )
        previewSpinner.stop()
        if (options.json) {
          // N7: the prose that used to announce "add would run init first" is
          // silenced under --json, and nothing replaced it — so the document
          // described a plan against a project that does not exist yet. Both
          // surfaces now say it.
          printDryRunResult(options.cwd, options.components, previewResult, {
            wouldInitialize: true,
          })
          return
        }
        logger.log(formatDryRunResult(previewResult, options.components, {}))
        return
      }

      if (errors[ERRORS.MISSING_CONFIG]) {
        // Only a person at a terminal gets asked. `-y` and non-interactive
        // callers (agent, CI, no TTY) go straight to init with the defaults;
        // a confirm there has nobody to answer it and the run used to end
        // "successfully" having added nothing.
        if (shouldConfirmAutoInit(options)) {
          const proceed = await confirm(
            `You need to create a ${highlighter.info(
              "components.json"
            )} file to add components. Proceed?`
          )

          if (!proceed) {
            // User declined to create components.json — nothing to add.
            throw new CleanExit(1)
          }
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
          )}), then run ${highlighter.info("marko-ui init")}.`,
          {
            code: RegistryErrorCode.PROJECT_NOT_FOUND,
            details: { cwd: options.cwd },
          }
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

        if (options.json) {
          printDryRunResult(options.cwd, options.components, dryRunResult)
          return
        }

        logger.log(formatDryRunResult(dryRunResult, options.components, {}))
        return
      }

      if (!initHasRun) {
        const added = await addComponents(options.components, config, {
          ...options,
          // Threaded, not defaulted: the file writer asks before overwriting a
          // file that differs, and `-y` means "don't ask me anything".
          interactive: shouldPrompt(options),
        })

        if (options.json) {
          printAddResult(options.cwd, options.components, added, [], {
            initialized: initHasRun,
          })
          return
        }

        // Keep the project taglib (zero-import <Badge>/<badge> tags) in
        // sync with what is installed. No-op unless marko.json is ours.
        await writeProjectTaglib(config)
      }

    } catch (error) {
      // No break here: handleError frames its own block, on stderr. A break
      // before it put a bare newline on stdout for every `add` failure.
      handleError(error)
    } finally {
      clearRegistryContext()
    }
  })

/**
 * The `marko-ui/add` payload.
 *
 * `ok` stays TRUE even when the install could not finish cleanly: the files
 * were written, and the unmet part is reported as a `warnings` entry with its
 * own code and fix. A command that changed the project and could not install
 * one npm package did not fail — it succeeded with something left to do, and
 * saying otherwise would make `add --json` useless for the exact case it
 * exists to report.
 */
function printAddResult(
  cwd: string,
  requested: string[],
  result: AddResult,
  warnings: CommandWarning[],
  options: { initialized?: boolean } = {}
) {
  const next = nextSteps([
    // The single most useful thing an agent can do next: read what it just
    // installed. Free of context cost to name, expensive to forget.
    requested.length === 1
      ? `marko-ui docs ${requested[0]}`
      : "marko-ui docs --list",
    result.dependencies.some((dep) => dep.status === "failed")
      ? "bun add"
      : "",
  ])

  printEnvelope("marko-ui/add", {
    cwd,
    dryRun: false,
    // `resolved` is what the CLI actually installed, NOT a copy of
    // `requested`: `add button dialog` also installs `icon`, and a caller told
    // two components landed when three did is worse than no report.
    items: { requested, resolved: result.resolved },
    files: result.files,
    dependencies: result.dependencies,
    registryDependencies: result.registryDependencies,
    warnings: [...warnings, ...result.warnings],
    next,
    ...(options.initialized ? { initialized: true } : {}),
  })
}

/**
 * Whether a dry run would actually install this package, read from the
 * project's own package.json — the same declared set `updateDependencies`
 * skips. A package already declared is reported `present`, NOT
 * "installed": re-resolving a bare name would rewrite its range, so the
 * install would never have happened.
 */
function plannedDependency(
  name: string,
  cwd: string
): { name: string; status: "present" | "would-install" } {
  return {
    name,
    status: isDeclaredInPackageJson(cwd, name) ? "present" : "would-install",
  }
}

/**
 * The `marko-ui/add` payload for a dry run: the SAME shape as a real add,
 * plus `dryRun: true`, and the planned statuses instead of observed ones.
 *
 * "Would be created" and "was created" are different claims, and mixing them
 * is how an agent ends up telling a user a file is on disk when nothing ran.
 * The flag is on the document, not inferred from the statuses.
 */
function printDryRunResult(
  cwd: string,
  requested: string[],
  result: DryRunResult,
  options: { wouldInitialize?: boolean } = {}
) {
  printEnvelope("marko-ui/add", {
    cwd,
    dryRun: true,
    items: { requested, resolved: requested },
    files: [
      ...plannedToFileChanges(result.files),
      ...(result.css
        ? [
            {
              path: result.css.path,
              status:
                result.css.action === "create" ? ("created" as const) : ("updated" as const),
            },
          ]
        : []),
    ].sort((a, b) => a.path.localeCompare(b.path)),
    // F7: the dry run never installs anything, so "installed" was a lie for
    // every package already in package.json — including on a project where
    // the real run reports them all `present`. The same `declared` check the
    // real installer uses decides `present` vs `would-install` here.
    dependencies: [
      ...result.dependencies.map((name) => plannedDependency(name, cwd)),
      ...result.devDependencies.map((name) => plannedDependency(name, cwd)),
    ],
    registryDependencies: [],
    warnings: [
      ...(options.wouldInitialize
        ? [
            {
              code: WarningCode.PROJECT_NOT_INITIALIZED,
              message:
                "This project has no components.json. A real run would run marko-ui init with the defaults first, then add the requested items. Nothing was written.",
              fix: "marko-ui init",
            },
          ]
        : []),
      ...(result.removals?.length
        ? [
            {
              code: WarningCode.STALE_FILES_REMOVED,
              message: `Would remove ${result.removals.length} stale icon map(s): ${result.removals.join(", ")}.`,
              fix: "marko-ui add <name> --overwrite",
            },
          ]
        : []),
    ],
    next: options.wouldInitialize ? ["marko-ui init"] : [],
  })
}

/**
 * Whether `add` should ask before overwriting CSS with a style/theme item.
 * `-y`, a dry run and a caller with no terminal never get asked: the confirm
 * is taken as yes, which is what `-y` has always meant.
 */
export function shouldConfirmStyleInstall(
  options: Pick<z.infer<typeof addOptionsSchema>, "yes">,
  itemType: string | undefined,
  isDryRun: boolean,
  interactive: boolean = isInteractive()
): boolean {
  return (
    !options.yes &&
    !isDryRun &&
    interactive &&
    (itemType === "registry:style" || itemType === "registry:theme")
  )
}

/**
 * `add` with no names opens a multiselect, which nothing can answer without a
 * terminal (and `-y` says not to ask). Fail with a usage error (exit 2)
 * naming the syntax instead of hanging or exiting 0 having done nothing.
 */
export function assertHasComponents(
  options: Pick<z.infer<typeof addOptionsSchema>, "yes" | "all" | "components">,
  interactive: boolean = isInteractive()
) {
  if (options.components?.length || options.all) {
    return
  }
  if (interactive && !options.yes) {
    return
  }
  throw new CommandError(
    `Name the components to add: ${highlighter.info(
      "marko-ui add <name...>"
    )} (or ${highlighter.info("marko-ui add --all")}). Run ${highlighter.info(
      "marko-ui search"
    )} to list what is available.`,
    { exitCode: 2 }
  )
}

/**
 * Whether `add` should ask before creating a missing components.json.
 * Exported with `interactive` injectable so it is testable without a pty.
 */
export function shouldConfirmAutoInit(
  options: Pick<z.infer<typeof addOptionsSchema>, "yes">,
  interactive: boolean = isInteractive()
): boolean {
  return !options.yes && interactive
}

/**
 * Whether `add` may prompt the user at all — the file writer's overwrite
 * question included. `-y` is explicit intent ("do not ask"), and a session
 * with no terminal cannot answer, so both suppress every prompt. The file
 * writer then keeps the existing file and reports it as skipped.
 *
 * Exported with `interactive` injectable so it is testable without a pty.
 */
export function shouldPrompt(
  options: Pick<z.infer<typeof addOptionsSchema>, "yes">,
  interactive: boolean = isInteractive()
): boolean {
  return !options.yes && interactive
}

/**
 * The import distribution ships no component source: components are imported
 * from `@marko-ui/shadcn`. `add` would copy files nobody asked for and the
 * project would then carry two copies of each component, so it refuses and
 * shows the import path instead. Nothing has been written at this point.
 *
 * `uiComponents` is the set of names that really are ui components; the import
 * path is only printed for those (an invented path is worse than none). When
 * it is unknown (registry unreachable) the generic form is shown.
 */
export function assertAddableDistribution(
  config: Pick<Config, "distribution">,
  components: string[] = [],
  uiComponents?: ReadonlySet<string>
) {
  if (config.distribution !== "import") {
    return
  }

  const examples = uiComponents
    ? components
        .filter((name) => uiComponents.has(name))
        .map(
          (name) =>
            `  ${highlighter.info(`@marko-ui/shadcn/ui/${name}/${name}.marko`)}`
        )
    : []

  throw new CommandError(
    `This project uses the ${highlighter.info(
      "import"
    )} distribution, so there is nothing to add: components are imported from ${highlighter.info(
      "@marko-ui/shadcn"
    )}, not copied into the project. Items from other registries and URLs are refused too.\n` +
      (examples.length
        ? `Import them like this:\n${examples.join("\n")}\n`
        : `Import a component as ${highlighter.info(
            "@marko-ui/shadcn/ui/<name>/<name>.marko"
          )}.\n`) +
      `To copy component source into the project instead, run ${highlighter.info(
        "marko-ui eject"
      )}.`
  )
}

/** Names of the registry's ui components, or undefined when the index is unreachable. */
async function getUiComponentNames(): Promise<ReadonlySet<string> | undefined> {
  try {
    const index = await getShadcnRegistryIndex()
    return new Set(
      (index ?? [])
        .filter((entry) => entry.type === "registry:ui")
        .map((entry) => entry.name)
    )
  } catch {
    return undefined
  }
}

async function promptForRegistryComponents(
  options: z.infer<typeof addOptionsSchema>
) {
  const registryIndex = await getShadcnRegistryIndex()
  if (!registryIndex) {
    logger.errorBreak()
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




/**
 * Is `name` already declared in the project's package.json (any of
 * dependencies / devDependencies / optional / peer)? The same set
 * `normalizeDependencyRequests` skips, read the same way, so the dry run and
 * the real run cannot disagree about whether a package is already there.
 */
export function isDeclaredInPackageJson(cwd: string, name: string): boolean {
  const packageInfo = getPackageInfo(cwd, false)
  return [
    ...Object.keys(packageInfo?.dependencies ?? {}),
    ...Object.keys(packageInfo?.devDependencies ?? {}),
    ...Object.keys(packageInfo?.optionalDependencies ?? {}),
    ...Object.keys(packageInfo?.peerDependencies ?? {}),
  ].includes(name)
}
