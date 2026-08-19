import { existsSync } from "fs"
import path from "path"
import { clearRegistryContext } from "@/src/registry/context"
import { dryRunComponents } from "@/src/utils/dry-run"
import { getConfig } from "@/src/utils/get-config"
import {
  formatMonorepoMessage,
  getMonorepoTargets,
  isMonorepoRoot,
} from "@/src/utils/get-monorepo-info"
import { getProjectComponents } from "@/src/utils/get-project-info"
import {
  CleanExit,
  CommandError,
  handleError,
} from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import { Command } from "commander"
import { diffLines, type Change } from "diff"
import { z } from "zod"

const diffOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  cwd: z.string(),
  nameOnly: z.boolean(),
})

/**
 * Compares installed files against their registry versions. Built on the
 * same resolution engine as `add --dry-run` (dryRunComponents), so it
 * handles registry:file items with explicit targets — the shape every
 * marko-ui item uses. (Upstream shadcn's diff was legacy fetchTree-based
 * and could not see those files.)
 */
export const diff = new Command()
  .name("diff")
  .description("show diffs between local files and their registry versions")
  .argument("[components...]", "component names (defaults to all installed)")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--name-only", "only list files that differ.", false)
  .action(async (components: string[], opts) => {
    try {
      const options = diffOptionsSchema.parse({
        components,
        cwd: path.resolve(opts.cwd),
        nameOnly: opts.nameOnly,
      })

      if (!existsSync(options.cwd)) {
        throw new CommandError(
          `The path ${options.cwd} does not exist. Please try again.`
        )
      }

      const config = await getConfig(options.cwd)
      if (!config) {
        if (await isMonorepoRoot(options.cwd)) {
          const targets = await getMonorepoTargets(options.cwd)
          if (targets.length > 0) {
            formatMonorepoMessage("diff [component]", targets)
            throw new CommandError("Run diff from a workspace, not the monorepo root.", {
              formatted: true,
            })
          }
        }

        throw new CommandError(
          `Configuration is missing. Please run ${highlighter.success(
            `init`
          )} to create a components.json file.`
        )
      }

      let targets = options.components ?? []
      if (!targets.length) {
        targets = await getProjectComponents(options.cwd)
        if (!targets.length) {
          logger.info("No installed components found.")
          // Nothing to diff is a success, not a failure.
          throw new CleanExit(0)
        }
      }

      const resolveSpinner = spinner("Resolving registry items.").start()
      const result = await dryRunComponents(targets, config, {
        overwrite: true,
      })
      resolveSpinner.stop()

      const changed = result.files.filter(
        (file) => file.action === "overwrite" && file.existingContent
      )

      if (!changed.length) {
        logger.info("No updates found.")
        throw new CleanExit(0)
      }

      for (const file of changed) {
        logger.info(`- ${file.path}`)
        if (!options.nameOnly) {
          // Same polarity as `add --diff` (dry-run-formatter): old = local
          // file, new = registry version, so incoming changes read as
          // additions.
          printDiff(diffLines(file.existingContent!, file.content))
          logger.info("")
        }
      }
    } catch (error) {
      handleError(error)
    } finally {
      clearRegistryContext()
    }
  })

function printDiff(diff: Change[]) {
  diff.forEach((part) => {
    if (part) {
      if (part.added) {
        return process.stdout.write(highlighter.success(part.value))
      }
      if (part.removed) {
        return process.stdout.write(highlighter.error(part.value))
      }

      return process.stdout.write(part.value)
    }
  })
}
