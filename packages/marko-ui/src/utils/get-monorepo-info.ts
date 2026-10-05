import { existsSync, readFileSync, realpathSync } from "fs"
import path from "path"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import fg from "fast-glob"
import fs from "fs-extra"

const FRAMEWORK_CONFIG_FILES = [
  "next.config.*",
  "vite.config.*",
  "astro.config.*",
  "remix.config.*",
  "nuxt.config.*",
  "svelte.config.*",
  "gatsby-config.*",
  "angular.json",
]

// Checks for workspace signals at the given directory.
export async function isMonorepoRoot(cwd: string) {
  // pnpm workspaces.
  if (fs.existsSync(path.resolve(cwd, "pnpm-workspace.yaml"))) {
    return true
  }

  // npm/yarn workspaces.
  const packageJsonPath = path.resolve(cwd, "package.json")
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = await fs.readJson(packageJsonPath)
      if (packageJson.workspaces) {
        return true
      }
    } catch {
      // Ignore parse errors.
    }
  }

  // Lerna.
  if (fs.existsSync(path.resolve(cwd, "lerna.json"))) {
    return true
  }

  // Nx.
  if (fs.existsSync(path.resolve(cwd, "nx.json"))) {
    return true
  }

  return false
}

// Finds app directories in a monorepo that contain framework configs or components.json.
export async function getMonorepoTargets(cwd: string) {
  const patterns = await getWorkspacePatterns(cwd)

  if (!patterns.length) {
    return []
  }

  // Resolve patterns to directories.
  const dirs = await fg(patterns, {
    cwd,
    onlyDirectories: true,
    ignore: ["**/node_modules/**"],
    suppressErrors: true,
  })

  const targets: { name: string; hasConfig: boolean }[] = []

  for (const dir of dirs) {
    const fullPath = path.resolve(cwd, dir)

    // Check if it has a package.json (it's an actual workspace).
    if (!fs.existsSync(path.resolve(fullPath, "package.json"))) {
      continue
    }

    const hasComponentsJson = fs.existsSync(
      path.resolve(fullPath, "components.json")
    )

    // Check for framework config files.
    const hasFrameworkConfig = FRAMEWORK_CONFIG_FILES.some((pattern) => {
      const matches = fg.sync(pattern, {
        cwd: fullPath,
        dot: true,
      })
      return matches.length > 0
    })

    if (hasComponentsJson || hasFrameworkConfig) {
      targets.push({
        name: dir,
        hasConfig: hasComponentsJson,
      })
    }
  }

  return targets
}

// Formats and logs the monorepo detection message.
/**
 * Formats and logs the monorepo detection message.
 *
 * Written to stderr: this is a diagnostic about a command that cannot run,
 * not the command's result. It used to go through logger.log, which put a
 * multi-line human error block on stdout — the one place a program reading
 * the CLI must never find text.
 */
export function formatMonorepoMessage(
  command: string,
  targets: { name: string; hasConfig: boolean }[],
  options?: {
    cwdFlag?: string
  }
) {
  const cwdFlag = options?.cwdFlag ?? "-c"

  logger.errorBreak()
  logger.error(
    `It looks like you are running ${highlighter.info(
      command
    )} from a monorepo root.`
  )
  logger.error(
    `To use marko-ui in a specific workspace, use the ${highlighter.info(
      cwdFlag
    )} flag:`
  )
  logger.errorBreak()

  for (const target of targets) {
    logger.error(`  marko-ui ${command} ${cwdFlag} ${target.name}`)
  }

  logger.errorBreak()
}

export async function getWorkspacePatterns(cwd: string) {
  const patterns: string[] = []

  // Read pnpm-workspace.yaml.
  const pnpmWorkspacePath = path.resolve(cwd, "pnpm-workspace.yaml")
  if (fs.existsSync(pnpmWorkspacePath)) {
    const content = await fs.readFile(pnpmWorkspacePath, "utf8")
    patterns.push(...parsePnpmWorkspacePackages(content))
  }

  // Read package.json workspaces.
  const packageJsonPath = path.resolve(cwd, "package.json")
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = await fs.readJson(packageJsonPath)
      const workspaces = Array.isArray(packageJson.workspaces)
        ? packageJson.workspaces
        : packageJson.workspaces?.packages
      if (Array.isArray(workspaces)) {
        // Filter out negation patterns.
        patterns.push(...workspaces.filter((w: string) => !w.startsWith("!")))
      }
    } catch {
      // Ignore parse errors.
    }
  }

  return Array.from(new Set(patterns))
}

export function parsePnpmWorkspacePackages(content: string) {
  const patterns: string[] = []
  let inPackages = false
  let packagesIndent = 0

  for (const line of content.split("\n")) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const keyMatch = line.match(/^(\s*)([A-Za-z0-9_-]+)\s*:/)
    if (keyMatch) {
      packagesIndent = keyMatch[1].length
      inPackages = keyMatch[2] === "packages"
      continue
    }

    if (!inPackages) {
      continue
    }

    const itemMatch = line.match(/^(\s*)-\s*(.+?)\s*(?:#.*)?$/)
    if (!itemMatch || itemMatch[1].length <= packagesIndent) {
      continue
    }

    patterns.push(itemMatch[2].trim().replace(/^["']|["']$/g, ""))
  }

  return patterns
}


/**
 * A workspace root's declared member globs, split into the ones that include
 * packages and the negated ones (`!apps/legacy`) that remove them.
 *
 * Reads the same two sources as {@link getWorkspacePatterns} — `package.json`
 * `workspaces` (array form or `{ packages }` object form) and
 * `pnpm-workspace.yaml` `packages` — but keeps the negations, because
 * "is this directory a member" cannot be answered without them. Synchronous:
 * the write guard is.
 *
 * A `workspaces` key that is not a list (`true`, an object without `packages`)
 * declares no members.
 */
export function readWorkspaceGlobs(root: string): {
  include: string[]
  exclude: string[]
} {
  const all: string[] = []

  try {
    const yaml = readFileSync(path.join(root, "pnpm-workspace.yaml"), "utf8")
    all.push(...parsePnpmWorkspacePackages(yaml))
  } catch {
    // No pnpm-workspace.yaml (or unreadable): not a pnpm root.
  }

  try {
    const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"))
    const workspaces = Array.isArray(pkg?.workspaces)
      ? pkg.workspaces
      : pkg?.workspaces?.packages
    if (Array.isArray(workspaces)) {
      all.push(...workspaces.filter((w: unknown): w is string => typeof w === "string"))
    }
  } catch {
    // No package.json, or not valid JSON: contributes nothing.
  }

  const normalize = (glob: string) =>
    glob.replace(/^\.\//, "").replace(/\/+$/, "")
  const include: string[] = []
  const exclude: string[] = []
  for (const glob of all) {
    if (glob.startsWith("!")) exclude.push(normalize(glob.slice(1)))
    else include.push(normalize(glob))
  }
  return { include, exclude }
}

/**
 * True when `dir` is `root` itself or a workspace member of `root`, i.e. its
 * path relative to `root` — or one of that path's ancestors, so a directory
 * deep inside a member counts — matches the root's include globs and no
 * negated glob.
 */
export function isWorkspaceMember(root: string, dir: string): boolean {
  const relative = path.relative(root, dir)
  if (relative === "") return true
  if (relative.startsWith("..") || path.isAbsolute(relative)) return false

  const { include, exclude } = readWorkspaceGlobs(root)
  if (!include.length) return false

  const members = new Set(
    fg
      .sync(include, {
        cwd: root,
        onlyDirectories: true,
        ignore: ["**/node_modules/**", ...exclude],
        suppressErrors: true,
      })
      .map((member) => path.normalize(member))
  )

  // The member may be `dir` or any directory between it and `root`.
  const segments = relative.split(path.sep)
  for (let length = segments.length; length > 0; length--) {
    if (members.has(segments.slice(0, length).join(path.sep))) return true
  }
  return false
}

/**
 * The workspace root that CONTAINS `cwd` (or IS `cwd`), or null when `cwd` is
 * not a member of any workspace.
 *
 * This is the root the write guard allows, so it is the NEAREST ancestor whose
 * workspace globs actually include `cwd` (see {@link isWorkspaceMember}) — not
 * merely the nearest or outermost ancestor that declares workspaces. An
 * ancestor that declares workspaces without including the project grants
 * nothing: an unrelated `package.json` with `workspaces` above a non-member
 * project used to widen the allowed roots to everything under it, which let an
 * alias reaching into a sibling checkout write there.
 *
 * Climbs from the real path of `cwd` (a cwd reached through a symlink must not
 * make the walk escape into the symlink's own parents). `apps/web` inside a
 * monorepo whose globs include `apps/*` returns the monorepo root even though
 * `apps/web` is not itself a root: that is what lets `add` write into a
 * sibling `packages/ui`. Nested workspaces resolve to the nearest including
 * root.
 */
export function findWorkspaceRoot(cwd: string): string | null {
  let start: string
  try {
    start = realpathSync(cwd)
  } catch {
    start = path.resolve(cwd)
  }

  let dir = start
  for (;;) {
    // A root must declare member globs at all; one that declares none (a plain
    // package.json) is skipped before the glob expansion.
    if (readWorkspaceGlobs(dir).include.length && isWorkspaceMember(dir, start)) {
      return dir
    }
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}
