import { z } from "zod"

/**
 * The result objects the mutating commands report.
 *
 * `add`, `init`, `eject`, `diff` and `agents sync` all change or inspect a
 * project, and all of them used to tell a program nothing structured about
 * what happened: `add` printed a bare indented list of file paths with the
 * created/skipped distinction on stderr, so a re-run that skipped everything
 * was indistinguishable from a fresh install using stdout alone, and
 * `init` answered "is my CSS imported anywhere?" with prose an agent had to
 * parse.
 *
 * Every `--json` payload is the shared envelope (`json-output.ts`), so this
 * module owns only the `data` half. Three rules hold for all of them:
 *
 * 1. **Paths are relative to the cwd the command was given**, stated once as
 *    `cwd`. An absolute path repeated per file costs tokens and puts the
 *    user's home directory into every log the output is pasted into.
 * 2. **Status is a closed vocabulary**, not prose. A caller branches on
 *    `status === "created"`, never on a substring.
 * 3. **A warning is `{code, message, fix?}`**, and the human path prints the
 *    SAME `message` and `fix` text. One fact, two renderings — so what a
 *    human reads and what a program parses cannot drift apart.
 */

/**
 * Stable codes for the warnings these commands can raise. Listed in
 * `marko-ui manifest` next to `errorCodes`, so this is the discovery point
 * for a program that has to branch on one.
 *
 * A WARNING is not an error: the command did what it was asked, and something
 * about the result needs attention. That is why `ok` stays true — see
 * `init`, which completes with warnings routinely and must not be reported as
 * a failure.
 */
export const WarningCode = {
  /** `init`: the CSS entry is written but no layout imports it. */
  CSS_NOT_IMPORTED: "CSS_NOT_IMPORTED",
  /** `init`: `tsconfig.json` cannot set `allowImportingTsExtensions`. */
  TS_ALLOW_IMPORTING_EXTENSIONS: "TS_ALLOW_IMPORTING_EXTENSIONS",
  /** `init`: the `+layout.marko` that would import the CSS entry was not found. */
  LAYOUT_NOT_FOUND: "LAYOUT_NOT_FOUND",
  /** Any command: dependencies could not be installed; files were still written. */
  DEPENDENCY_INSTALL_FAILED: "DEPENDENCY_INSTALL_FAILED",
  /** `add`: a registry item carries docs the caller should read. */
  ITEM_HAS_DOCS: "ITEM_HAS_DOCS",
  /** `agents sync`: the agent skills could not be installed. */
  SKILL_INSTALL_FAILED: "SKILL_INSTALL_FAILED",
  /** `eject`: manual steps remain that the CLI deliberately does not do. */
  MANUAL_STEPS_REMAIN: "MANUAL_STEPS_REMAIN",
} as const

export type WarningCode = (typeof WarningCode)[keyof typeof WarningCode]

/** One thing worth telling the caller about, in both renderings. */
export type CommandWarning = {
  code: WarningCode
  message: string
  /** The concrete command (or one-line action) that resolves it. */
  fix?: string
}

export const commandWarningSchema = z.object({
  code: z.enum([
    ...(Object.values(WarningCode) as WarningCode[]),
  ] as [WarningCode, ...WarningCode[]]),
  message: z.string(),
  fix: z.string().optional(),
})

/**
 * What happened to one file.
 *
 * `created` / `updated` / `skipped` / `unchanged` are `add`'s four (plus
 * `removed`, for stale icon maps it deletes). `modified` / `missing` /
 * `added` are `diff`'s three — a DIFFERENT question ("does the project still
 * match the registry?"), and reusing `add`'s words would make the two
 * indistinguishable in a log.
 *
 * `skipped` vs `unchanged` is the distinction the whole task turns on:
 * `skipped` means the file exists and differs but was left alone (`--overwrite`
 * would have replaced it); `unchanged` means it already matched.
 */
export const FILE_CHANGE_STATUSES = [
  "created",
  "updated",
  "skipped",
  "unchanged",
  "removed",
  "modified",
  "missing",
  "added",
] as const

export type FileChangeStatus = (typeof FILE_CHANGE_STATUSES)[number]

export type FileChange = {
  /** Relative to the command's `cwd`. */
  path: string
  status: FileChangeStatus
}

export const fileChangeSchema = z.object({
  path: z.string(),
  status: z.enum([
    ...FILE_CHANGE_STATUSES,
  ] as unknown as [FileChangeStatus, ...FileChangeStatus[]]),
})

/** One npm dependency the registry asked for, and what became of it. */
export type DependencyChange = {
  name: string
  /**
   * `installed` — the package manager was asked to add it.
   * `present` — already declared in package.json, left exactly as it was
   *   (re-resolving a bare name would rewrite its range).
   * `failed` — the install did not succeed; the files were still written.
   */
  status: "installed" | "present" | "failed"
}

export const dependencyChangeSchema = z.object({
  name: z.string(),
  status: z.enum(["installed", "present", "failed"]),
})

/**
 * The shared `cwd` + change-list header every command's `data` carries, so a
 * caller can resolve every relative path without guessing the base.
 */
export type ChangeResult = {
  cwd: string
  files: FileChange[]
  warnings: CommandWarning[]
}

/** Turn the grouped arrays `updateFiles` returns into flat, sorted entries. */
export function toFileChanges(groups: {
  filesCreated?: string[]
  filesUpdated?: string[]
  filesSkipped?: string[]
  filesRemoved?: string[]
}): FileChange[] {
  const entries: FileChange[] = []
  for (const file of groups.filesCreated ?? []) {
    entries.push({ path: file, status: "created" })
  }
  for (const file of groups.filesUpdated ?? []) {
    entries.push({ path: file, status: "updated" })
  }
  for (const file of groups.filesSkipped ?? []) {
    entries.push({ path: file, status: "skipped" })
  }
  for (const file of groups.filesRemoved ?? []) {
    entries.push({ path: file, status: "removed" })
  }
  return entries.sort((a, b) => a.path.localeCompare(b.path))
}

/** Turn a dry run's planned actions into the same vocabulary. */
export function plannedToFileChanges(
  files: { path: string; action: "create" | "overwrite" | "skip" }[]
): FileChange[] {
  return files
    .map((file): FileChange => {
      if (file.action === "create") {
        return { path: file.path, status: "created" }
      }
      if (file.action === "overwrite") {
        // A dry run cannot know whether the write would have been a new file
        // or a replaced one, so `updated` is the honest word.
        return { path: file.path, status: "updated" }
      }
      return { path: file.path, status: "unchanged" }
    })
    .sort((a, b) => a.path.localeCompare(b.path))
}

/** `data.next` — the commands worth running next, as literal strings. */
export function nextSteps(commands: string[]): string[] {
  return Array.from(new Set(commands.filter(Boolean)))
}