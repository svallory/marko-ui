import { existsSync, readFileSync } from "fs"
import { dirname, join } from "path"

export type PackageManager = "yarn" | "pnpm" | "bun" | "npm" | "deno"

export async function getPackageManager(
  targetDir: string,
  { withFallback }: { withFallback?: boolean } = {
    withFallback: false,
  }
): Promise<PackageManager> {
  const packageManager = detectFromLockfile(targetDir)

  if (packageManager || !withFallback) {
    return packageManager ?? "npm"
  }

  // Fallback to user agent if not detected.
  return getPackageManagerFromUserAgent() ?? "npm"
}

const LOCKFILES: [string, PackageManager][] = [
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["deno.lock", "deno"],
  ["package-lock.json", "npm"],
]

// Lockfile-based detection (upstream used @antfu/ni's detect). Walks up from
// targetDir to the nearest lockfile so an app inside a monorepo follows the
// workspace root. The walk ends at the first workspace root (a package.json
// with `workspaces`, or pnpm-workspace.yaml) or the filesystem root.
function detectFromLockfile(targetDir: string): PackageManager | null {
  let dir = targetDir

  for (;;) {
    for (const [file, pm] of LOCKFILES) {
      if (existsSync(join(dir, file))) {
        return pm
      }
    }

    if (isWorkspaceRoot(dir)) {
      return null
    }

    const parent = dirname(dir)
    if (parent === dir) {
      return null
    }
    dir = parent
  }
}

function isWorkspaceRoot(dir: string) {
  if (existsSync(join(dir, "pnpm-workspace.yaml"))) {
    return true
  }

  try {
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))
    return Boolean(pkg?.workspaces)
  } catch {
    return false
  }
}

export function getPackageManagerFromUserAgent(
  userAgent = process.env.npm_config_user_agent || ""
): PackageManager | null {
  if (userAgent.startsWith("yarn")) {
    return "yarn"
  }

  if (userAgent.startsWith("pnpm")) {
    return "pnpm"
  }

  if (userAgent.startsWith("bun")) {
    return "bun"
  }

  if (userAgent.startsWith("deno")) {
    return "deno"
  }

  if (userAgent.startsWith("npm")) {
    return "npm"
  }

  return null
}

export function getPackageRunnerCommand(packageManager: PackageManager | null) {
  if (packageManager === "pnpm") return "pnpm dlx"

  if (packageManager === "bun") return "bunx"

  return "npx"
}

export async function getPackageRunner(cwd: string) {
  const packageManager = await getPackageManager(cwd)

  return getPackageRunnerCommand(packageManager)
}
