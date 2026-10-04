import { existsSync } from "fs"
import path from "path"
import { MARKO_UI_URL, REGISTRY_URL } from "@/src/registry/constants"
import { RegistryErrorCode } from "@/src/registry/errors"
import { getConfig } from "@/src/utils/get-config"
import {
  formatMonorepoMessage,
  getMonorepoTargets,
  isMonorepoRoot,
} from "@/src/utils/get-monorepo-info"
import {
  getProjectComponents,
  getProjectInfo,
  type ProjectInfo,
} from "@/src/utils/get-project-info"
import { CommandError, handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { printEnvelope } from "@/src/utils/json-output"
import { logger } from "@/src/utils/logger"
import { setJsonMode } from "@/src/utils/output-mode"
import { Command } from "commander"

export const info = new Command()
  .name("status")
  .alias("info")
  .description("get information about your project")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--json", "output as JSON.", false)
  .action(async (opts) => {
    try {
      setJsonMode(Boolean(opts.json))

      const cwd = path.resolve(opts.cwd)

      // Check if we're in a monorepo root.
      if (
        !existsSync(path.resolve(cwd, "components.json")) &&
        (await isMonorepoRoot(cwd))
      ) {
        const targets = await getMonorepoTargets(cwd)
        if (targets.length > 0) {
          // One shape for every failure: handleError renders the human form
          // on stderr, or the marko-ui/error envelope on stdout under --json.
          // This used to print an ad-hoc {error, message, targets} object that
          // shared no field, version or `$type` with anything else the CLI
          // emits, so a caller had to special-case it.
          if (!opts.json) {
            formatMonorepoMessage("status", targets)
          }
          throw new CommandError(
            "You are running status from a monorepo root. Use the -c flag to specify a workspace.",
            {
              code: RegistryErrorCode.MONOREPO_ROOT,
              formatted: !opts.json,
              suggestion: `Run status with -c <workspace>, e.g. marko-ui status -c ${targets[0].name}.`,
              details: { cwd, targets: targets.map((target) => target.name) },
            }
          )
        }
      }

      const projectInfo = await getProjectInfo(cwd)
      const config = await getConfig(cwd)
      const components = await getProjectComponents(cwd)
      const data = await collectInfo(projectInfo, config, components)

      if (opts.json) {
        // One envelope for every `--json` payload, printed by the one helper
        // that owns JSON output (see json-output.ts).
        printEnvelope("marko-ui/status", data)
        return
      }

      printInfo(data)
    } catch (error) {
      handleError(error)
    }
  })

function getRegistries(
  registries: Record<string, string | { url: string }> | undefined
) {
  if (!registries) {
    return {}
  }

  const result: Record<string, string> = {}
  for (const [name, value] of Object.entries(registries)) {
    result[name] = typeof value === "string" ? value : value.url
  }
  return result
}

/**
 * A resolved path, expressed relative to the cwd `resolvedPaths.cwd` already
 * states. A path outside the cwd (a hoisted monorepo package) keeps its
 * absolute form — a `../../..` chain is harder to act on than the path itself,
 * and silently wrong-looking.
 */
function relativizePath(value: string | undefined, cwd: string) {
  if (!value) return null
  const relative = path.relative(cwd, value)
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    return value
  }
  return relative
}

export async function collectInfo(
  projectInfo: ProjectInfo | null,
  config: Awaited<ReturnType<typeof getConfig>>,
  components: string[],
) {

  return {
    project: projectInfo
      ? {
          framework: projectInfo.framework.label,
          frameworkName: projectInfo.framework.name,
          frameworkVersion: projectInfo.frameworkVersion ?? null,
          srcDirectory: projectInfo.isSrcDir,
          typescript: projectInfo.isTsx,
          tailwindVersion: projectInfo.tailwindVersion ?? null,
          tailwindConfig: projectInfo.tailwindConfigFile ?? null,
          tailwindCss: projectInfo.tailwindCssFile ?? null,
          importAlias: projectInfo.aliasPrefix ?? null,
        }
      : null,
    config: config
      ? {
          // The three knobs that decide WHAT gets installed, and that were
          // simply absent from this report: `distribution` chooses the copy vs
          // import path, `visualStyle` the per-style registry tree, and
          // `iconLibrary` which icon package `add` writes. Reporting a
          // `style` that is always the vestigial "default" while omitting all
          // three was reporting a constant and hiding the variables.
          distribution: config.distribution,
          visualStyle: config.visualStyle,
          iconLibrary: config.iconLibrary,
          typescript: config.tsx,
          aliases: {
            components: config.aliases.components,
            utils: config.aliases.utils,
            ui: config.aliases.ui ?? null,
            lib: config.aliases.lib ?? null,
            hooks: config.aliases.hooks ?? null,
          },
          // `cwd` once, absolute; everything else RELATIVE to it. The seven
          // paths all share the same prefix, so repeating it seven times spent
          // more tokens on the answer than on the question, and put the user's
          // home directory into every log this output was pasted into.
          resolvedPaths: {
            cwd: config.resolvedPaths.cwd,
            tailwindConfig: relativizePath(
              config.resolvedPaths.tailwindConfig,
              config.resolvedPaths.cwd
            ),
            tailwindCss: relativizePath(
              config.resolvedPaths.tailwindCss,
              config.resolvedPaths.cwd
            ),
            utils: relativizePath(
              config.resolvedPaths.utils,
              config.resolvedPaths.cwd
            ),
            components: relativizePath(
              config.resolvedPaths.components,
              config.resolvedPaths.cwd
            ),
            lib: relativizePath(config.resolvedPaths.lib, config.resolvedPaths.cwd),
            hooks: relativizePath(
              config.resolvedPaths.hooks,
              config.resolvedPaths.cwd
            ),
            ui: relativizePath(config.resolvedPaths.ui, config.resolvedPaths.cwd),
          },
          registries: getRegistries(config.registries),
        }
      : null,
    components,
    links: {
      docs: `${MARKO_UI_URL}/docs`,
      components: `${MARKO_UI_URL}/docs/components/[component].md`,
      registryItem: `${REGISTRY_URL}/[component].json`,
      registryIndex: `${REGISTRY_URL}/registry.json`,
    },
  }
}

export function printInfo(data: Awaited<ReturnType<typeof collectInfo>>) {
  // Project.
  logger.log(highlighter.info("Project"))
  if (data.project) {
    printEntries({
      framework: `${data.project.framework} (${data.project.frameworkName})`,
      frameworkVersion: data.project.frameworkVersion ?? "-",
      srcDirectory: data.project.srcDirectory ? "Yes" : "No",
      typescript: data.project.typescript ? "Yes" : "No",
      tailwindVersion: data.project.tailwindVersion ?? "-",
      tailwindConfig: data.project.tailwindConfig ?? "-",
      tailwindCss: data.project.tailwindCss ?? "-",
      importAlias: data.project.importAlias ?? "-",
    })
  } else {
    logger.log("  No project info detected.")
  }

  // Config.
  logger.break()
  logger.log(highlighter.info("Configuration"))
  if (data.config) {
    printEntries({
      distribution: data.config.distribution ?? "-",
      visualStyle: data.config.visualStyle ?? "-",
      iconLibrary: data.config.iconLibrary ?? "-",
      typescript: data.config.typescript ? "Yes" : "No",
    })

    logger.break()

    // Aliases.
    logger.break()
    logger.log(highlighter.info("Aliases"))
    printEntries({
      components: data.config.aliases.components,
      utils: data.config.aliases.utils,
      ui: data.config.aliases.ui ?? "-",
      lib: data.config.aliases.lib ?? "-",
      hooks: data.config.aliases.hooks ?? "-",
    })

    // Resolved paths. `cwd` is the base every other path here is relative to,
    // so it is shown first and labelled as such rather than being repeated
    // inside all seven entries.
    logger.break()
    logger.log(highlighter.info("Resolved Paths"))
    printEntries({ cwd: data.config.resolvedPaths.cwd })
    printEntries({
      tailwindConfig: data.config.resolvedPaths.tailwindConfig ?? "-",
      tailwindCss: data.config.resolvedPaths.tailwindCss ?? "-",
      utils: data.config.resolvedPaths.utils ?? "-",
      components: data.config.resolvedPaths.components ?? "-",
      lib: data.config.resolvedPaths.lib ?? "-",
      hooks: data.config.resolvedPaths.hooks ?? "-",
      ui: data.config.resolvedPaths.ui ?? "-",
    })

    // Registries.
    if (Object.keys(data.config.registries).length > 0) {
      logger.break()
      logger.log("registries:")
      printEntries(data.config.registries)
    }
  } else {
    logger.log("  No components.json found.")
  }

  // Installed components.
  logger.break()
  logger.log(highlighter.info("Installed Components"))
  if (data.components.length > 0) {
    logger.log(`  ${data.components.join(", ")}`)
  } else {
    logger.log("  No components installed.")
  }

  // Links.
  logger.break()
  logger.log(highlighter.info("Links"))
  printEntries(data.links)

  logger.break()
}


function printEntries(entries: Record<string, string>) {
  const maxKeyLength = Math.max(
    ...Object.keys(entries).map((key) => key.length)
  )
  for (const [key, value] of Object.entries(entries)) {
    logger.log(`  ${key.padEnd(maxKeyLength + 2)}${value}`)
  }
}
