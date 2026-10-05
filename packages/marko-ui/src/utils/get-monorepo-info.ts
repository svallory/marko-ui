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
 * The workspace root that CONTAINS `cwd`, or null when `cwd` is its own root.
 *
 * This is the root the CLI already detects for lockfile and workspace lookup
 * (`getPackageManager` walks up to the nearest lockfile, ending at the first
 * `isWorkspaceRoot`). It is exported rather than re-implemented so the write
 * guard and the package manager can never disagree about where "the project"
 * ends — the alternative was a second, subtly different detector.
 *
 * Walks up from the real path of `cwd` (a cwd reached through a symlink must
 * not make the walk escape into the symlink's own parents) and returns the
 * OUTERMOST directory that is still a workspace root, so nested workspaces
 * resolve to the repo the user means.
 */
export function findWorkspaceRoot(cwd: string): string | null {
  let dir: string
  try {
    dir = realpathSync(cwd)
  } catch {
    dir = path.resolve(cwd)
  }

  const stopAt = () => existsSync(path.join(dir, "pnpm-workspace.yaml"))
  const isRoot = () => {
    if (stopAt()) return true
    try {
      const pkg = JSON.parse(
        readFileSync(path.join(dir, "package.json"), "utf8")
      )
      return Boolean(pkg?.workspaces)
    } catch {
      return false
    }
  }

  if (!isRoot()) {
    return null
  }

  // Climb while the parent is itself a workspace root (nested workspaces).
  let outer = dir
  for (;;) {
    const parent = path.dirname(dir)
    if (parent === dir) break
    let candidate = parent
    try {
      candidate = realpathSync(parent)
    } catch {
      // Keep the literal path if it cannot be resolved.
    }
    const previous = dir
    dir = candidate
    if (!isRoot()) {
      dir = previous
      break
    }
    outer = candidate
  }

  return outer
}
