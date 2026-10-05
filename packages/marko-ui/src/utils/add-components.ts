import path from "path"
import { getRegistryItems } from "@/src/registry/api"
import { configWithDefaults } from "@/src/registry/config"
import {
  resolveRegistryTree,
  type ResolvedDocsFailure,
} from "@/src/registry/resolver"
import {
  configSchema,
  registryItemFileSchema,
  registryItemSchema,
  workspaceConfigSchema,
} from "@/src/schema"
import {
  findCommonRoot,
  findPackageRoot,
  getWorkspaceConfig,
  type Config,
} from "@/src/utils/get-config"
import { getProjectTailwindVersionFromConfig } from "@/src/utils/get-project-info"
import { isInteractive } from "@/src/utils/interactive"
import { isSafeTarget } from "@/src/utils/is-safe-target"
import { RegistryError, RegistryErrorCode } from "@/src/registry/errors"
import { CommandError } from "@/src/utils/handle-error"
import { rootsFor } from "@/src/utils/path-guard"
import { highlighter } from "@/src/utils/highlighter"
import { green, yellow } from "kleur/colors"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import {
  getTargetAliasKey,
  type TargetAliasKey,
} from "@/src/utils/target-aliases"
import type {
  CommandWarning,
  DependencyChange,
  FileChange,
} from "@/src/utils/command-result"
import { WarningCode, toFileChanges } from "@/src/utils/command-result"
import { assertCssWritable, updateCss } from "@/src/utils/updaters/update-css"
import { updateDependencies } from "@/src/utils/updaters/update-dependencies"
import { updateEnvVars } from "@/src/utils/updaters/update-env-vars"
import { assertFilesWritable, updateFiles } from "@/src/utils/updaters/update-files"
import { writeDocsCacheEntries } from "@/src/utils/docs-cache"
import { z } from "zod"

export interface AddComponentsOptions {
  overwrite?: boolean
  overwriteCssVars?: boolean
  silent?: boolean
  /**
   * Whether a prompt may be shown at all. Left unset, it resolves to "a
   * person could answer" ({@link isInteractive}) — never to `true` outright,
   * because a prompt nobody can answer is a hang, not a question. Callers that
   * have an explicit `--yes` (or a silent mandate) pass `false` themselves;
   * that decision belongs to the command, not here.
   */
  interactive?: boolean
  resolvedTree?: NonNullable<Awaited<ReturnType<typeof resolveRegistryTree>>>
  skipFonts?: boolean
  registryHeaders?: Record<string, Record<string, string>>
  path?: string
}

type AddWorkspaceComponentsOptions = AddComponentsOptions

/**
 * What an `add` (or `eject`, which reuses this engine) actually did.
 *
 * Returned rather than only printed: the caller is either a human (the
 * existing spinner + list output, unchanged) or a program reading
 * `--json`, and the two must never be computed from different sources.
 */
export type AddResult = {
  /** cwd-relative, status-tagged, sorted. */
  files: FileChange[]
  dependencies: DependencyChange[]
  warnings: CommandWarning[]
  /**
   * Every item the run ACTUALLY wrote files for, in the order they resolved:
   * the requested ones plus whatever they pulled in. `items.resolved` used to
   * be a copy of `requested`, which made `add button dialog` (which also
   * installs `icon`) report that it installed two components when it
   * installed three.
   */
  resolved: string[]
  /**
   * Items that were NOT named on the command line — the registry
   * dependencies, by name. Empty for an item with no `registryDependencies`.
   */
  registryDependencies: string[]
}

/**
 * Runs the fetch-and-write pipeline, and on a MID-WAY failure re-throws with
 * the files that were already written attached to the error.
 *
 * An add that wrote four component files and then failed on the stylesheet has
 * left the project in a state the caller must know about: a bare error saying
 * "could not update CSS" invites a "just run it again", which is not obviously
 * wrong, while a silent partial write is. `details.written` (cwd-relative, the
 * same shape as a successful result's `files`) says what actually happened
 * without the caller having to diff the filesystem.
 */
export async function addComponents(
  components: string[],
  config: Config,
  options: AddComponentsOptions
): Promise<AddResult> {
  const alreadyWritten: FileChange[] = []
  try {
    return await addComponentsInner(components, config, options, alreadyWritten)
  } catch (error) {
    if (alreadyWritten.length) {
      // The original class's code is preserved when it is one we know:
      // a partial write is still the failure it was (NETWORK_ERROR exit 4
      // stays exit 4). A raw filesystem error is NOT left to the handler as
      // UNKNOWN_ERROR with a bare `ENOTDIR` — that told the caller nothing
      // they could act on and carried no advice at all.
      const known = error instanceof RegistryError
      throw new CommandError(
        error instanceof Error ? error.message : String(error),
        {
          code: known
            ? error.code
            : isFileWriteFailure(error)
              ? RegistryErrorCode.LOCAL_FILE_ERROR
              : undefined,
          exitCode: error instanceof CommandError ? error.exitCode : undefined,
          suggestion: isFileWriteFailure(error)
            ? isPathCollision(error)
              ? "Check that the path is a directory, not a file, and that you can write to it. Files listed in details.written are already on disk and are correct; remove the blocking file or directory by hand, then re-run."
              : "Check that you can write to the project, and that the disk has space. Files listed in details.written are already on disk; re-run to finish the rest."
            : undefined,
          details: { written: dedupeFiles(alreadyWritten) },
        }
      )
    }
    // Nothing was written, so there is no partial state to report — but the
    // same classification applies.
    if (isFileWriteFailure(error)) {
      throw new CommandError(
        error instanceof Error ? error.message : String(error),
        {
          code: RegistryErrorCode.LOCAL_FILE_ERROR,
          suggestion:
            "Check that the path is a directory, not a file, and that you can write to it.",
          // Accepted nit: `written` is present and EMPTY rather than absent.
          // A caller reading `details.written.length` should not have to
          // distinguish "wrote nothing" from "an older CLI that never
          // reported it".
          details: { written: [] },
        }
      )
    }
    throw error
  }
}

/**
 * `filesRemoved` entries the per-file accumulation could not have seen: a
 * stale icon map is deleted by a separate step, not by the main write loop.
 */
function removalsNotYetReported(
  groups: { filesRemoved?: string[] },
  already: FileChange[]
): FileChange[] {
  const seen = new Set(already.map((file) => file.path))
  return (groups.filesRemoved ?? [])
    .filter((file) => !seen.has(file))
    .map((file) => ({ path: file, status: "removed" as const }))
}

/** Last write wins per path, so a path is never listed twice. */
function dedupeFiles(files: FileChange[]): FileChange[] {
  const byPath = new Map<string, FileChange>()
  for (const file of files) {
    byPath.set(file.path, file)
  }
  return Array.from(byPath.values()).sort((a, b) =>
    a.path.localeCompare(b.path)
  )
}

async function addComponentsInner(
  components: string[],
  config: Config,
  options: AddComponentsOptions,
  /** Accumulates file changes as they are written, for the partial-write report. */
  alreadyWritten: FileChange[]
): Promise<AddResult> {
  options = {
    overwrite: false,
    silent: false,
    // Was hardcoded `true`, which made `add -y` ask "already exists, overwrite?"
    // anyway: `add` passed its raw commander options (a `yes` but no
    // `interactive`), so the file writer saw an interactive session no matter
    // what the user asked for. Defaulting to what can actually be answered,
    // with each command threading its own `-y` through, is the fix.
    interactive: isInteractive(),
    ...options,
  }

  const workspaceConfig = await getWorkspaceConfig(config)
  if (
    workspaceConfig &&
    workspaceConfig.ui &&
    workspaceConfig.ui.resolvedPaths.cwd !== config.resolvedPaths.cwd
  ) {
    return await addWorkspaceComponents(
      components,
      config,
      workspaceConfig,
      { ...options },
      alreadyWritten
    )
  }

  return await addProjectComponents(
    components,
    config,
    { ...options, skipFonts: options.skipFonts },
    alreadyWritten
  )
}

async function addProjectComponents(
  components: string[],
  config: z.infer<typeof configSchema>,
  options: AddComponentsOptions,
  alreadyWritten: FileChange[]
): Promise<AddResult> {
  if (!components.length) {
    return emptyAddResult()
  }

  let tree = await resolveAndValidateRegistryTree(components, config, options)

  const tailwindVersion = await getProjectTailwindVersionFromConfig(config)

  // Every write target is judged BEFORE the first side effect. The per-file
  // guard in updateFiles would still refuse, but only after the dependencies
  // below were installed: a refused add must leave package.json and the
  // lockfile as it found them.
  await assertFilesWritable(tree.files, config, { path: options.path })
  assertCssWritable(tree.css, config, { cssVars: tree.cssVars })

  const dependencies =
    (await updateDependencies(tree.dependencies, tree.devDependencies, config, {
      silent: options.silent,
      interactive: options.interactive,
    })) ?? []

  await updateEnvVars(tree.envVars, config, {
    silent: options.silent,
  })

  const writtenGroups =
    (await updateFiles(tree.files, config, {
      overwrite: options.overwrite,
      silent: options.silent,
      interactive: options.interactive,
      path: options.path,
      // Reported file-by-file, so a write failing INSIDE the loop still tells
      // the caller what already landed (B2).
      written: alreadyWritten,
    })) ?? {
      filesCreated: [],
      filesUpdated: [],
      filesSkipped: [],
      filesUnchanged: [],
      filesRemoved: [],
    }

  // `written: alreadyWritten` above already accumulated these; this covers the
  // files the writer reports but did not write one-by-one (the icon-map
  // removals), so the partial-write list matches the real one.
  alreadyWritten.push(...removalsNotYetReported(writtenGroups, alreadyWritten))

  // Write CSS last so the file watcher triggers a rebuild
  // after all component files and dependencies are in place.
  const overwriteCssVars = await resolveOverwriteCssVars(
    tree,
    components,
    config,
    options.overwriteCssVars
  )
  const cssPath = await updateCss(tree.css, config, {
    silent: options.silent,
    cssVars: tree.cssVars,
    overwriteCssVars,
    tailwindVersion,
    tailwindConfig: tree.tailwind?.config,
  })

  if (tree.docs) {
    logger.info(tree.docs)
  }

  // Each installed ui item's docs model, kept locally so `docs` describes the
  // version on disk without the network (see docs-cache.ts). Best-effort.
  await writeDocsCacheEntries(config, tree.itemDocs ?? [])

  const names = resolvedItemNames(tree)
  return {
    files: withCssFile(toFileChanges(writtenGroups), cssPath, config.resolvedPaths.cwd),
    dependencies,
    warnings: collectWarnings(dependencies, tree.docs, tree.docsFailures),
    resolved: names.resolved,
    registryDependencies: names.registryDependencies,
  }
}

/**
 * What a resolved tree actually contains: every item it fetched, and which of
 * those were pulled in rather than asked for.
 *
 * `items` and `dependencyItems` are exactly that split — `resolveRegistryTree`
 * resolves the requested addresses first and recurses into
 * `registryDependencies` into a second list. Reading the split off the tree
 * is the point: reconstructing it from the requested names would report what
 * the caller asked for, not what the CLI installed.
 */
export function resolvedItemNames(
  tree: NonNullable<Awaited<ReturnType<typeof resolveRegistryTree>>>
): { resolved: string[]; registryDependencies: string[] } {
  // `items`/`dependencyItems` are NAME strings, attached by the resolver.
  const resolved = uniqueNames([
    ...(tree.items ?? []),
    ...(tree.dependencyItems ?? []),
  ])
  const pulledIn = uniqueNames(tree.dependencyItems ?? [])
  return { resolved, registryDependencies: pulledIn }
}

function uniqueNames(names: string[]): string[] {
  return Array.from(new Set(names))
}

/** An `add` that changed nothing, in the same shape as one that changed a lot. */
export function emptyAddResult(): AddResult {
  return {
    files: [],
    dependencies: [],
    warnings: [],
    resolved: [],
    registryDependencies: [],
  }
}

/**
 * The CSS entry is a file the command touched like any other, so it belongs
 * in `files` — it used to be invisible to a program entirely, which made
 * "did `add` write my stylesheet?" unanswerable without reading stderr.
 */
function withCssFile(
  files: FileChange[],
  cssPath: string | undefined,
  cwd: string
): FileChange[] {
  if (!cssPath) return files
  const relative = path.relative(cwd, cssPath)
  if (files.some((file) => file.path === relative)) return files
  const added: FileChange = { path: relative, status: "updated" }
  return [...files, added].sort((a, b) => a.path.localeCompare(b.path))
}

/**
 * Warnings, in the one shape both renderings use: a stable `code`, the human
 * `message`, and the command that fixes it. The text here is the SAME text
 * the human path prints, so what a person reads and what a program parses
 * cannot drift.
 */
function collectWarnings(
  dependencies: DependencyChange[],
  docs: string | null | undefined,
  docsFailures: ResolvedDocsFailure[] = []
): CommandWarning[] {
  const warnings: CommandWarning[] = []
  const failed = dependencies.filter((dep) => dep.status === "failed")
  if (failed.length) {
    warnings.push({
      code: WarningCode.DEPENDENCY_INSTALL_FAILED,
      message: `Could not install ${failed.map((dep) => dep.name).join(", ")}. Component files were still written.`,
      fix: `Install them with your package manager, e.g. bun add ${failed.map((dep) => dep.name).join(" ")}`,
    })
  }
  if (docsFailures.length) {
    warnings.push({
      code: WarningCode.DOCS_CACHE_FAILED,
      message: `Could not fetch the docs for ${docsFailures.map((failure) => failure.name).join(", ")} (${docsFailures[0]!.message}). The components were installed; \`docs\` will read the registry instead.`,
      fix: `marko-ui docs ${docsFailures[0]!.name}`,
    })
  }
  if (docs) {
    warnings.push({
      code: WarningCode.ITEM_HAS_DOCS,
      message: docs,
      fix: "marko-ui docs <name>",
    })
  }
  return warnings
}

async function addWorkspaceComponents(
  components: string[],
  config: z.infer<typeof configSchema>,
  workspaceConfig: z.infer<typeof workspaceConfigSchema>,
  options: AddWorkspaceComponentsOptions,
  alreadyWritten: FileChange[]
): Promise<AddResult> {
  if (!components.length) {
    return emptyAddResult()
  }

  let tree = await resolveAndValidateRegistryTree(components, config, options)

  const filesCreated: string[] = []
  const filesUpdated: string[] = []
  const filesSkipped: string[] = []
  const filesUnchanged: string[] = []

  const rootSpinner = spinner(`Installing components.`)?.start()

  // The allowed roots are the INVOKING project's, never the target package's:
  // a target that is a member of some workspace would otherwise widen the
  // guard to that whole workspace for a project that is not a member of it.
  // For a project inside the workspace (the standard layout) both are the same
  // root, so a sibling `packages/ui` stays a legal destination.
  const roots = rootsFor(config.resolvedPaths.cwd)

  // Process global updates for the main target.
  // These should typically go to the UI package in a workspace.
  const mainTargetConfig = workspaceConfig.ui
  const tailwindVersion =
    await getProjectTailwindVersionFromConfig(mainTargetConfig)
  const workspaceRoot = findCommonRoot(
    config.resolvedPaths.cwd,
    mainTargetConfig.resolvedPaths.ui
  )

  // Group files by their target config first: every target is judged BEFORE
  // the first side effect (see the preflight below), and the grouping is what
  // says which package each file lands in.
  const filesByTarget = new Map<TargetAliasKey, typeof tree.files>()
  const FILE_TYPE_TO_CONFIG_KEY: Record<string, TargetAliasKey> = {
    "registry:ui": "ui",
    "registry:hook": "hooks",
    "registry:lib": "lib",
  }
  const getTargetConfigKeyForFile = (
    file: z.infer<typeof registryItemFileSchema>
  ) => {
    return (
      getTargetAliasKey(file.target) ??
      FILE_TYPE_TO_CONFIG_KEY[file.type || "registry:ui"] ??
      "components"
    )
  }
  const getTargetConfigForKey = (configKey: TargetAliasKey) => {
    return configKey && workspaceConfig[configKey]
      ? workspaceConfig[configKey]
      : config
  }

  for (const file of tree.files ?? []) {
    const targetKey = getTargetConfigKeyForFile(file)
    if (!filesByTarget.has(targetKey)) {
      filesByTarget.set(targetKey, [])
    }
    filesByTarget.get(targetKey)!.push(file)
  }

  // Pre-flight: refuse an unsafe target before dependencies are installed, so
  // a refused add leaves package.json and the lockfile untouched. Each group
  // is judged against the roots of the package it lands in.
  for (const targetKey of Array.from(filesByTarget.keys())) {
    const targetConfig = getTargetConfigForKey(targetKey)
    const targetFiles = filesByTarget.get(targetKey)!
    await assertFilesWritable(targetFiles, targetConfig, {
      path: options.path,
      roots,
    })
  }
  assertCssWritable(tree.css, mainTargetConfig, { cssVars: tree.cssVars, roots })

  // 1. Update dependencies.
  const workspaceDependencies =
    (await updateDependencies(
      tree.dependencies,
      tree.devDependencies,
      mainTargetConfig,
      {
        silent: true,
        interactive: options.interactive,
      }
    )) ?? []

  // 3. Update environment variables.
  if (tree.envVars) {
    await updateEnvVars(tree.envVars, mainTargetConfig, {
      silent: true,
    })
  }

  // Process each target config with its appropriate workspace config.
  for (const targetKey of Array.from(filesByTarget.keys())) {
    const targetFiles = filesByTarget.get(targetKey)!
    const targetConfig = getTargetConfigForKey(targetKey)
    const plannedFiles = (tree.files ?? []).filter((file) => {
      const fileTargetConfig = getTargetConfigForKey(
        getTargetConfigKeyForFile(file)
      )

      return (
        fileTargetConfig.resolvedPaths.cwd === targetConfig.resolvedPaths.cwd
      )
    })

    const typeWorkspaceRoot = findCommonRoot(
      config.resolvedPaths.cwd,
      targetConfig.resolvedPaths.ui || targetConfig.resolvedPaths.cwd
    )
    const packageRoot =
      (await findPackageRoot(
        typeWorkspaceRoot,
        targetConfig.resolvedPaths.cwd
      )) ?? targetConfig.resolvedPaths.cwd

    // Update files for this target config.
    const files =
      (await updateFiles(targetFiles, targetConfig, {
        overwrite: options.overwrite,
        silent: true,
        interactive: options.interactive,
      rootSpinner,
        isWorkspace: true,
        path: options.path,
        plannedFiles,
        // B2, workspace path: same per-file accumulation.
        written: alreadyWritten,
        // The invoking project's roots: its workspace root is what makes a
        // sibling `packages/ui` a legal destination (B1).
        roots,
      })) ?? {
      filesCreated: [],
      filesUpdated: [],
      filesSkipped: [],
      filesUnchanged: [],
      filesRemoved: [],
    }

    filesCreated.push(
      ...files.filesCreated.map((file) =>
        path.relative(typeWorkspaceRoot, path.join(packageRoot, file))
      )
    )
    filesUpdated.push(
      ...files.filesUpdated.map((file) =>
        path.relative(typeWorkspaceRoot, path.join(packageRoot, file))
      )
    )
    filesSkipped.push(
      ...files.filesSkipped.map((file) =>
        path.relative(typeWorkspaceRoot, path.join(packageRoot, file))
      )
    )
    filesUnchanged.push(
      ...(files.filesUnchanged ?? []).map((file) =>
        path.relative(typeWorkspaceRoot, path.join(packageRoot, file))
      )
    )
  }

  // 6. Write CSS last so the file watcher triggers a rebuild
  // after all component files and dependencies are in place.
  const overwriteCssVars = await resolveOverwriteCssVars(
    tree,
    components,
    config,
    options.overwriteCssVars
  )
  await updateCss(tree.css, mainTargetConfig, {
    roots,
    silent: true,
    cssVars: tree.cssVars,
    overwriteCssVars,
    tailwindVersion,
    tailwindConfig: tree.tailwind?.config,
  })
  if (tree.cssVars || tree.css) {
    filesUpdated.push(
      path.relative(workspaceRoot, mainTargetConfig.resolvedPaths.tailwindCss)
    )
  }

  rootSpinner?.succeed()

  // Deduplicate and sort files.
  const dedupedCreated = Array.from(new Set(filesCreated)).sort()
  const dedupedUpdated = Array.from(
    new Set(filesUpdated.filter((file) => !filesCreated.includes(file)))
  ).sort()
  const dedupedSkipped = Array.from(new Set(filesSkipped)).sort()

  // Collected BEFORE the human printing below, and from the same arrays, so
  // the two renderings cannot disagree about what happened.
  const resultFiles = toFileChanges({
    filesCreated: dedupedCreated,
    filesUpdated: dedupedUpdated,
    filesSkipped: dedupedSkipped,
    filesUnchanged: Array.from(new Set(filesUnchanged)).sort(),
  })

  const hasUpdatedFiles = dedupedCreated.length || dedupedUpdated.length
  if (!hasUpdatedFiles && !dedupedSkipped.length) {
    spinner(`No files updated.`, {
      silent: options.silent,
    })?.info()
  }

  // The file list on stdout carries its status PER LINE, not just in the
  // spinner headers on stderr. That is the whole point: stdout alone used to
  // be a bare list of paths, so a fresh install and a re-run that skipped
  // everything printed the same thing, and only stderr (a spinner frame) said
  // which happened.
  if (dedupedCreated.length) {
    spinner(
      `Created ${dedupedCreated.length} ${
        dedupedCreated.length === 1 ? "file" : "files"
      }:`,
      {
        silent: options.silent,
      }
    )?.succeed()
    for (const file of dedupedCreated) {
      logger.log(`  ${green("created")} ${file}`)
    }
  }

  if (dedupedUpdated.length) {
    spinner(
      `Updated ${dedupedUpdated.length} ${
        dedupedUpdated.length === 1 ? "file" : "files"
      }:`,
      {
        silent: options.silent,
      }
    )?.info()
    for (const file of dedupedUpdated) {
      logger.log(`  ${yellow("updated")} ${file}`)
    }
  }

  if (dedupedSkipped.length) {
    spinner(
      `Skipped ${dedupedSkipped.length} ${
        dedupedSkipped.length === 1 ? "file" : "files"
      }: (use --overwrite to overwrite)`,
      {
        silent: options.silent,
      }
    )?.info()
    for (const file of dedupedSkipped) {
      logger.log(`  ${yellow("skipped")} ${file}`)
    }
  }

  if (tree.docs) {
    logger.info(tree.docs)
  }

  // Cached against the project `docs` runs in (where components.json is),
  // whichever workspace package the files landed in.
  await writeDocsCacheEntries(config, tree.itemDocs ?? [])

  const names = resolvedItemNames(tree)
  return {
    files: resultFiles,
    dependencies: workspaceDependencies,
    warnings: collectWarnings(workspaceDependencies, tree.docs, tree.docsFailures),
    resolved: names.resolved,
    registryDependencies: names.registryDependencies,
  }
}

async function resolveAndValidateRegistryTree(
  components: string[],
  config: z.infer<typeof configSchema>,
  options: AddComponentsOptions
) {
  const registrySpinner = spinner(`Checking registry.`, {
    silent: options.silent,
  })?.start()
  const tree =
    options.resolvedTree ??
    (await resolveRegistryTree(components, configWithDefaults(config), {
      fetchDocs: true,
    }))

  if (!tree) {
    registrySpinner?.fail()
    throw new Error("Failed to fetch components from registry.")
  }

  try {
    validateFilesTarget(tree.files ?? [], config.resolvedPaths.cwd)
  } catch (error) {
    registrySpinner?.fail()
    throw error
  }

  registrySpinner?.succeed()

  return tree
}

async function resolveOverwriteCssVars(
  tree: NonNullable<Awaited<ReturnType<typeof resolveRegistryTree>>>,
  components: z.infer<typeof registryItemSchema>["name"][],
  config: z.infer<typeof configSchema>,
  overwriteCssVars?: boolean
) {
  if (!tree.cssVars || Object.keys(tree.cssVars).length === 0) {
    return undefined
  }

  return overwriteCssVars ?? shouldOverwriteCssVars(components, config)
}

async function shouldOverwriteCssVars(
  components: z.infer<typeof registryItemSchema>["name"][],
  config: z.infer<typeof configSchema>
) {
  const result = await getRegistryItems(components, { config })
  const payload = z.array(registryItemSchema).parse(result)

  return payload.some(
    (component) =>
      component.type === "registry:theme" ||
      component.type === "registry:style" ||
      component.type === "registry:font" ||
      component.type === "registry:base"
  )
}

export function validateFilesTarget(
  files: z.infer<typeof registryItemFileSchema>[],
  cwd: string
) {
  for (const file of files) {
    // `target` decides the write location when present; otherwise the path is
    // derived from `file.path` (see resolveFilePath in update-files.ts). Both
    // are registry-controlled, so validate whichever one is used.
    const locationField = file?.target ?? file?.path
    if (!locationField) {
      continue
    }

    if (!isSafeTarget(locationField, cwd)) {
      throw new Error(
        `We found an unsafe file path "${locationField}" in the registry item. Installation aborted.`
      )
    }
  }
}


/**
 * A failure to write a file, as opposed to anything else that can go wrong in
 * an add.
 *
 * The errno is the tell: ENOTDIR (a path component is a regular file),
 * EACCES/EPERM (no permission), ENOSPC (disk full), EROFS (read-only mount).
 * These used to reach the error handler as `UNKNOWN_ERROR` with the bare errno
 * as the message — the one class of failure where the CLI genuinely CAN tell
 * the user what to do, reported as if it could not.
 */
export function isFileWriteFailure(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  const code = (error as { code?: unknown }).code
  return (
    typeof code === "string" &&
    ["ENOTDIR", "EACCES", "EPERM", "ENOSPC", "EROFS", "EISDIR", "EMFILE"].includes(
      code
    )
  )
}


/**
 * ENOTDIR/EISDIR specifically: a path COMPONENT is a file where a directory
 * must go. `--overwrite` cannot help — it only replaces file CONTENT, and the
 * failure happens before any file is opened — so offering it was advice that
 * could not work. Permission and space failures get the re-run advice instead,
 * which can.
 */
export function isPathCollision(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code
  return code === "ENOTDIR" || code === "EISDIR"
}
