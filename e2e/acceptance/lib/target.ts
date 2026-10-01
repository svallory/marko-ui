/**
 * The CLI under test: a published npm version, or a tarball packed from this
 * repo.
 *
 * `published` (the default) is what a user gets: `marko-ui@<version>` installed
 * into the scenario's own project with the scenario's own package manager, and
 * invoked as `node node_modules/marko-ui/dist/index.js`.
 *
 * `tarball` is the same thing with the artifact built from the working tree
 * instead of from npm, so a change can be proven before it is published — that
 * is what the release gate uses, and it is why the tarball path is exercised
 * here rather than assumed.
 *
 * `bun pm pack`, not `npm pack`: this repo is bun-only (AGENTS.md), `bun pm
 * pack` honours the same `files`/prepare wiring the real publish goes through
 * (so a tarball that installs is a tarball npm would have accepted), it needs
 * no npm binary on the machine, and it can write to an explicit destination so
 * nothing lands in the worktree. The output is a standard .tgz, installable by
 * bun, npm, pnpm and yarn alike, which is what the non-bun scenarios need.
 */
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs"
import { mkdtemp, readdir, rm, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { run } from "./proc"
import { acceptanceDir } from "./scenario-doc"

export const REPO_ROOT = join(acceptanceDir(), "..", "..")
export const CLI_PACKAGE_DIR = join(REPO_ROOT, "packages", "marko-ui")
export const SHADCN_PACKAGE_DIR = join(REPO_ROOT, "packages", "shadcn")

/** Where packed targets live. Outside the repo: a build artifact, not source. */
export function tarballDir(): string {
  return (
    process.env.ACCEPTANCE_TARBALL_DIR ||
    join(tmpdir(), "marko-ui-acceptance-tarballs")
  )
}

export interface PackedTarget {
  cli: string
  shadcn: string
  builtAt: Date
}

async function newestMtime(dir: string): Promise<number> {
  let newest = 0
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue
      newest = Math.max(newest, await newestMtime(full))
      continue
    }
    newest = Math.max(newest, (await stat(full)).mtimeMs)
  }
  return newest
}

function pack(pkgDir: string, destination: string, filename: string): string {
  const result = run(
    "bun",
    ["pm", "pack", "--destination", destination, "--filename", filename],
    { cwd: pkgDir, timeoutMs: 300_000 }
  )
  if (result.exitCode !== 0) {
    throw new Error(
      `bun pm pack failed in ${pkgDir} (exit ${result.exitCode})\n${result.stdout}\n${result.stderr}`,
    )
  }
  const tarball = join(destination, filename)
  if (!existsSync(tarball)) {
    throw new Error(
      `bun pm pack reported success but ${tarball} does not exist\n${result.stdout}`,
    )
  }
  return tarball
}

/**
 * Packs `marko-ui` (and `@marko-ui/shadcn`, which the import distribution
 * installs) from the working tree, rebuilding the CLI first because the
 * tarball ships `dist/`.
 *
 * Cached on disk across the scenarios of a run, and re-packed whenever the
 * package's sources are newer than the tarball — so editing the CLI and
 * re-running picks the change up, and running the whole suite twice does not
 * pay for two builds.
 */
export async function ensurePackedTarget(): Promise<PackedTarget> {
  const version = readVersion(CLI_PACKAGE_DIR)
  const dir = join(tarballDir(), `marko-ui-${version}`)
  const cli = join(dir, "marko-ui.tgz")
  const shadcn = join(dir, "marko-ui-shadcn.tgz")

  const sourceMtime = Math.max(
    await newestMtime(join(CLI_PACKAGE_DIR, "src")),
    statSync(join(CLI_PACKAGE_DIR, "package.json")).mtimeMs,
  )
  if (existsSync(cli) && existsSync(shadcn) && statSync(cli).mtimeMs > sourceMtime) {
    return { cli, shadcn, builtAt: statSync(cli).mtime }
  }

  await rm(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })

  // The tarball ships dist/; without this the packed CLI is whatever the last
  // build left behind, which is the classic "acceptance passed against a stale
  // artifact" trap. The build is the repo's own script, under the heavy lock.
  const build = run("bun", ["run", "--filter", "marko-ui", "build"], {
    cwd: REPO_ROOT,
    timeoutMs: 600_000,
    env: {
      ...process.env,
      // The proto shim's NDJSON banner lands on stdout inside captured output
      // and is not a build error; see the root AGENTS.md.
      AI_AGENT: "",
    },
  })
  if (build.exitCode !== 0) {
    throw new Error(
      `marko-ui build failed (exit ${build.exitCode}) — the packed target would be stale\n${build.stdout}\n${build.stderr}`,
    )
  }

  const packedCli = pack(CLI_PACKAGE_DIR, dir, "marko-ui.tgz")
  const packedShadcn = pack(SHADCN_PACKAGE_DIR, dir, "marko-ui-shadcn.tgz")
  return { cli: packedCli, shadcn: packedShadcn, builtAt: new Date() }
}

function readVersion(pkgDir: string): string {
  let raw: string
  try {
    raw = readFileSync(join(pkgDir, "package.json"), "utf8")
  } catch (error) {
    throw new Error(`cannot read ${join(pkgDir, "package.json")}: ${String(error)}`)
  }
  let parsed: { version?: string }
  try {
    parsed = JSON.parse(raw) as { version?: string }
  } catch (error) {
    throw new Error(
      `${join(pkgDir, "package.json")} is not valid JSON: ${(error as Error).message}`,
    )
  }
  return parsed.version ?? "0.0.0"
}

/** A scratch dir for a run of the suite, outside the repo. */
export async function makeRunScratch(prefix: string): Promise<string> {
  return mkdtemp(join(tmpdir(), `marko-ui-${prefix}-`))
}
