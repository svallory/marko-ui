/**
 * Real package managers, and the scaffolders they run.
 *
 * Nothing here is stubbed: `bun`, `npm`, `pnpm`, `yarn` are the real binaries,
 * the scaffolders are the real `create-*` packages fetched by the pm's own dlx
 * runner, and installs really hit the registry. The only concession to speed is
 * that a scaffold is built once per (tool, args, pm) and copied per scenario
 * (see `scaffoldProject`) — the copy is of a real scaffold, and every scenario
 * still runs its own real install against the shared pm cache.
 */
import { existsSync } from "node:fs"
import { cp, mkdir, readFile, rm, stat } from "node:fs/promises"
import { createHash } from "node:crypto"
import { join } from "node:path"
import { acceptanceDir, type Pm, type ScaffoldSpec } from "./scenario-doc.ts"
import { run, type RunResult } from "./proc.ts"

export const REPO_ROOT = join(acceptanceDir(), "..", "..")

export interface PmDriver {
  name: Pm
  /** The binary itself. */
  bin: string
  /** Install the project's own dependencies, creating the lockfile that tells the CLI which pm this is. */
  install(cwd: string, timeoutMs: number): RunResult
  /** Add dev dependencies (the CLI under test, and anything a pre-step needs). */
  add(cwd: string, specs: string[], timeoutMs: number): RunResult
  /** argv prefix that runs a package binary, e.g. `["bunx"]` or `["npx", "-y"]`. */
  dlx(tool: string): string[]
  /** A cached-scaffold key prefix, since a yarn.lock app is not a bun.lock app. */
  cacheKey(): string
}

const DRIVERS: Record<Pm, PmDriver> = {
  bun: {
    name: "bun",
    bin: "bun",
    install: (cwd, timeoutMs) => run("bun", ["install"], { cwd, timeoutMs }),
    add: (cwd, specs, timeoutMs) =>
      run("bun", ["add", "-d", ...specs], { cwd, timeoutMs }),
    dlx: (tool) => ["bunx", tool],
    cacheKey: () => "bun",
  },
  npm: {
    name: "npm",
    bin: "npm",
    install: (cwd, timeoutMs) => run("npm", ["install"], { cwd, timeoutMs }),
    add: (cwd, specs, timeoutMs) =>
      run("npm", ["install", "-D", ...specs], { cwd, timeoutMs }),
    // `npm exec --yes` is npx; kept as the npx spelling because that is what
    // the CLI itself falls back to and what the YAML's `runner: npx` means.
    dlx: (tool) => ["npx", "--yes", tool],
    cacheKey: () => "npm",
  },
  pnpm: {
    name: "pnpm",
    bin: "pnpm",
    install: (cwd, timeoutMs) => run("pnpm", ["install"], { cwd, timeoutMs }),
    add: (cwd, specs, timeoutMs) =>
      run("pnpm", ["add", "-D", ...specs], { cwd, timeoutMs }),
    dlx: (tool) => ["pnpm", "dlx", tool],
    cacheKey: () => "pnpm",
  },
  "yarn-classic": {
    name: "yarn-classic",
    bin: "yarn",
    install: (cwd, timeoutMs) => run("yarn", ["install"], { cwd, timeoutMs }),
    add: (cwd, specs, timeoutMs) =>
      run("yarn", ["add", "-D", ...specs], { cwd, timeoutMs }),
    // Yarn 1 has no `yarn dlx`. The CLI makes the same choice
    // (getPackageRunnerCommand: only pnpm and bun get their own runner,
    // everything else falls back to npx), so a classic scenario is a real test
    // of the CLI's npx fallback rather than a runner fiction.
    dlx: (tool) => ["npx", "--yes", tool],
    cacheKey: () => "yarn1",
  },
  "yarn-berry": {
    name: "yarn-berry",
    bin: "yarn",
    install: (cwd, timeoutMs) => run("yarn", ["install"], { cwd, timeoutMs }),
    add: (cwd, specs, timeoutMs) =>
      run("yarn", ["add", "-D", ...specs], { cwd, timeoutMs }),
    dlx: (tool) => ["yarn", "dlx", tool],
    cacheKey: () => "yarn-berry",
  },
}

export function driverFor(pm: Pm): PmDriver {
  return DRIVERS[pm]
}

// ---------------------------------------------------------------------------
// Scaffold cache
// ---------------------------------------------------------------------------

export function scaffoldCacheRoot(): string {
  if (process.env.ACCEPTANCE_SCAFFOLD_CACHE_DIR) {
    return process.env.ACCEPTANCE_SCAFFOLD_CACHE_DIR
  }
  if (process.env.ACCEPTANCE_SCAFFOLD_CACHE === "0") {
    return join(REPO_ROOT, "node_modules", ".cache", "marko-ui-acceptance")
  }
  return join(REPO_ROOT, ".cache", "acceptance", "scaffolds")
}

/** Bumped when the shape of a cached scaffold changes, to invalidate old copies. */
const SCAFFOLD_CACHE_EPOCH = "1"

function scaffoldCacheKey(
  scaffold: ScaffoldSpec,
  pm: Pm,
  install: boolean
): string {
  const material = JSON.stringify({
    epoch: SCAFFOLD_CACHE_EPOCH,
    tool: scaffold.tool,
    args: scaffold.args,
    pm: driverFor(pm).cacheKey(),
    install,
  })
  return createHash("sha256").update(material).digest("hex").slice(0, 16)
}

/**
 * Copies a directory as fast as the platform allows: `cp -c` is APFS
 * clonefile, which is effectively free, and the recursive fs.cp fallback is the
 * same copy without the shortcut. A copy (never a move) — the cache must
 * survive the scenario that used it.
 */
async function copyTree(from: string, to: string): Promise<void> {
  const clone = run("cp", ["-Rc", from, to], { cwd: REPO_ROOT, timeoutMs: 300_000 })
  if (clone.exitCode === 0) return
  await rm(to, { recursive: true, force: true })
  await cp(from, to, { recursive: true, verbatimSymlinks: true })
}

/** Each package manager's lockfile, in the CLI's own detection order. */
const LOCKFILES: Record<string, string[]> = {
  bun: ["bun.lock", "bun.lockb"],
  npm: ["package-lock.json"],
  pnpm: ["pnpm-lock.yaml"],
  "yarn-classic": ["yarn.lock"],
  "yarn-berry": ["yarn.lock"],
}

/**
 * A scaffolder installs with whatever it likes (create-marko uses bun), so a
 * `pm: yarn-classic` project can arrive carrying a `bun.lock` as well as the
 * `yarn.lock` its own install just wrote. The CLI detects the package manager
 * from the first lockfile it finds (get-package-manager.ts's LOCKFILES, bun
 * first), so a project with two is a bun project wearing a yarn.lock — and the
 * skills relay then names `bunx` where the scenario is asserting the npx
 * fallback. Removing the other managers' lockfiles makes `setup.pm` mean what
 * it says. It is a copy per scenario, so the cached scaffold is untouched.
 */
async function pruneForeignLockfiles(appDir: string, pm: Pm): Promise<void> {
  const mine = new Set(LOCKFILES[pm])
  for (const [owner, files] of Object.entries(LOCKFILES)) {
    if (owner === pm) continue
    for (const file of files) {
      if (mine.has(file)) continue
      await rm(join(appDir, file), { force: true })
    }
  }
}

export interface ScaffoldResult {
  /** Absolute, realpath'd path of the scaffolded app inside the workspace. */
  appDir: string
  cached: boolean
}

/**
 * Runs a real scaffolder once per (tool, args, pm, install) and hands each
 * scenario a copy. The alternative — scaffolding 77 times — is the single
 * biggest cost in the suite, and the copy is byte-identical to what the
 * scaffolder produced.
 */
export async function scaffoldProject(options: {
  scaffold: ScaffoldSpec
  pm: Pm
  install: boolean
  workspace: string
  /** The dir the app occupies inside the workspace (fixture `scaffold.dir`). */
  dir: string
  env?: NodeJS.ProcessEnv
}): Promise<ScaffoldResult> {
  const { scaffold, pm, install, workspace, dir } = options
  const key = scaffoldCacheKey(scaffold, pm, install)
  const cacheDir = join(scaffoldCacheRoot(), key)
  const cachedApp = join(cacheDir, "app")
  const useCache = process.env.ACCEPTANCE_SCAFFOLD_CACHE !== "0"

  if (useCache && existsSync(join(cachedApp, "package.json"))) {
    await copyTree(cachedApp, join(workspace, dir))
    return { appDir: join(workspace, dir), cached: true }
  }

  const driver = driverFor(pm)
  const dlxArgv = driver.dlx(scaffold.tool)
  const bin = dlxArgv[0]
  if (!bin) {
    throw new Error(`${driver.name} produced no dlx runner for ${scaffold.tool}`)
  }
  const scaffolded = run(bin, [...dlxArgv.slice(1), ...scaffold.args], {
    cwd: workspace,
    timeoutMs: (scaffold.timeoutSeconds ?? 300) * 1000,
    env: options.env,
  })
  if (scaffolded.exitCode !== 0) {
    throw new Error(
      `${bin} ${[...dlxArgv.slice(1), ...scaffold.args].join(" ")} failed (exit ${scaffolded.exitCode})\n${scaffolded.stdout}\n${scaffolded.stderr}`,
    )
  }

  if (install) {
    const installed = driver.install(join(workspace, dir), 600_000)
    if (installed.exitCode !== 0) {
      throw new Error(
        `${driver.bin} install failed in the scaffold (exit ${installed.exitCode})\n${installed.stdout}\n${installed.stderr}`,
      )
    }
    await pruneForeignLockfiles(join(workspace, dir), pm)
  }

  if (useCache) {
    // Only cache a scaffold that produced something; a half-written cache
    // entry would be copied into every later scenario.
    if (existsSync(join(workspace, dir, "package.json"))) {
      await rm(cacheDir, { recursive: true, force: true })
      await mkdir(cacheDir, { recursive: true })
      await copyTree(join(workspace, dir), cachedApp)
    }
  }

  return { appDir: join(workspace, dir), cached: false }
}

/** True when a directory looks like a scaffolded project. */
export async function isProjectDir(dir: string): Promise<boolean> {
  try {
    await stat(join(dir, "package.json"))
    return true
  } catch {
    return false
  }
}

export async function readJsonFile(path: string): Promise<Record<string, string>> {
  const raw = await readFile(path, "utf8")
  try {
    return JSON.parse(raw) as Record<string, string>
  } catch (error) {
    throw new Error(`${path} is not valid JSON: ${(error as Error).message}`)
  }
}
