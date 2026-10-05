import { existsSync } from "fs"
import path from "path"
import { clearRegistryContext } from "@/src/registry/context"
import { RegistryErrorCode } from "@/src/registry/errors"
import { dryRunComponents } from "@/src/utils/dry-run"
import {
  type CommandWarning,
  type FileChange,
  nextSteps,
  WarningCode,
} from "@/src/utils/command-result"
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
import { printEnvelope } from "@/src/utils/json-output"
import { setJsonMode } from "@/src/utils/output-mode"
import { spinner } from "@/src/utils/spinner"
import { Command } from "commander"
import {
  createTwoFilesPatch,
  diffLines,
  type Change,
} from "diff"
import { z } from "zod"

const diffOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  cwd: z.string(),
  nameOnly: z.boolean(),
  json: z.boolean(),
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
  .option(
    "--json",
    "output as JSON (per file status, and diffs for changed ones).",
    false
  )
  .action(async (components: string[], opts) => {
    try {
      setJsonMode(Boolean(opts.json))
      const options = diffOptionsSchema.parse({
        components,
        cwd: path.resolve(opts.cwd),
        nameOnly: opts.nameOnly,
        json: Boolean(opts.json),
      })

      if (!existsSync(options.cwd)) {
        throw new CommandError(
          `The path ${options.cwd} does not exist. Please try again.`,
          { code: RegistryErrorCode.USAGE_ERROR, details: { cwd: options.cwd } }
        )
      }

      const config = await getConfig(options.cwd)
      if (!config) {
        if (await isMonorepoRoot(options.cwd)) {
          const targets = await getMonorepoTargets(options.cwd)
          if (targets.length > 0) {
            formatMonorepoMessage("diff [component]", targets)
            throw new CommandError(
              "You are running diff from a monorepo root. Use the -c flag to specify a workspace.",
              {
                code: RegistryErrorCode.MONOREPO_ROOT,
                formatted: true,
                suggestion: `Run diff with -c <workspace>, e.g. marko-ui diff -c ${targets[0].name}.`,
                details: {
                  cwd: options.cwd,
                  targets: targets.map((target) => target.name),
                },
              }
            )
          }
        }

        throw new CommandError(
          `Configuration is missing. Please run ${highlighter.success(
            `init`
          )} to create a components.json file.`,
          {
            code: RegistryErrorCode.NOT_CONFIGURED,
            details: { cwd: options.cwd },
          }
        )
      }

      let targets = options.components ?? []
      if (!targets.length) {
        targets = await getProjectComponents(options.cwd)
        if (!targets.length) {
          if (options.json) {
            printDiffResult(options.cwd, [], [])
            return
          }
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

      // Every file, not just the changed ones. "unchanged" and "missing" are
      // answers too: a program asking whether its project still matches the
      // registry wants to see what it MATCHED and what is ABSENT, not infer
      // either from the list of what changed.
      const files: FileChange[] = result.files
        .map((file) => ({
          path: file.path,
          status:
            file.action === "create"
              ? ("missing" as const)
              : file.action === "overwrite"
                ? ("modified" as const)
                : ("unchanged" as const),
          ...(file.action === "overwrite" && file.existingContent
            ? { diff: unifiedDiffText(file.existingContent, file.content) }
            : {}),
        }))
        .sort((a, b) => a.path.localeCompare(b.path))

      if (options.json) {
        printDiffResult(options.cwd, files, targets)
        return
      }

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

function printDiff(
  diff: Change[],
  colorize: boolean = true
) {
  diff.forEach((part) => {
    if (part) {
      if (part.added) {
        return process.stdout.write(
          colorize ? highlighter.success(part.value) : part.value
        )
      }
      if (part.removed) {
        return process.stdout.write(
          colorize ? highlighter.error(part.value) : part.value
        )
      }

      return process.stdout.write(part.value)
    }
  })
}

/**
 * The unified diff of a file, as PLAIN text.
 *
 * No ANSI. `diff --json` is read by programs and logged, and an escape
 * sequence in a JSON string is noise at best; the human path keeps its colors
 * because a terminal can render them and a diff is exactly the thing a person
 * reads line by line.
 *
 * Same polarity as the human path: old = local file, new = registry version,
 * so an incoming change reads as an addition.
 */
export function unifiedDiffText(
  existingContent: string,
  registryContent: string
): string {
  return createTwoFilesPatch(
    "local",
    "registry",
    existingContent,
    registryContent,
    "",
    "",
    { context: 3 }
  )
}

/**
 * The `marko-ui/diff` payload.
 *
 * The exit code is unchanged from today (0 whether or not anything differs) —
 * `diff` reports, it does not judge. `ok` likewise stays true: a modified
 * file is the correct answer to "does my project match the registry?", not a
 * failure of the command.
 */
function printDiffResult(
  cwd: string,
  files: FileChange[],
  items: string[]
) {
  const changed = files.filter(
    (file) => file.status === "modified" || file.status === "missing"
  )
  printEnvelope("marko-ui/diff", {
    cwd,
    // N9: `changedFiles`, not `changed` — the sibling key held FILE PATHS, not
    // items, and `items.changed` implied items. The count is `changed`.
    items: { requested: items },
    changedFiles: changed.map((file) => file.path),
    files,
    changed: changed.length,
    // F6: NO warning. "N files differ" is the ANSWER to the question diff was
    // asked, not something that needs attention — and it was filed under
    // ITEM_HAS_DOCS, a code documented as "a registry item carries docs", so a
    // caller branching on that stable code got the wrong meaning. `files`,
    // `changed` and `next` already carry it, all three truthfully.
    warnings: [],
    next: changed.length ? ["marko-ui add <name> --overwrite"] : [],
  })
}
