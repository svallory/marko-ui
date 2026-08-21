/**
 * upstream-shadcn.ts — locates (and, if necessary, clones) the shadcn/ui
 * source tree that style-map.test.ts and check-anchors.ts diff our port
 * against.
 *
 * Resolution order (see `resolveShadcnClone`):
 *   (a) `SHADCN_UI_DIR` env var, if set and it exists.
 *   (b) the maintainer's "hyperspace" sibling clone at
 *       `<repo>/../../data/shadcn-ui` (zero cloning if you already have it).
 *   (c) a repo-local clone at `<repo>/.upstream/shadcn-ui`.
 *
 * `ensureShadcnClone` additionally clones into (c) when none of the three
 * exist, so a fresh checkout — including CI — works with no manual setup.
 *
 * Kept dependency-free (node:child_process / node:fs only) since it is
 * loaded by a check script that itself has zero runtime dependencies.
 */
import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const HYPERSPACE_DIR = join(REPO_ROOT, "..", "..", "data", "shadcn-ui")
const LOCAL_DIR = join(REPO_ROOT, ".upstream", "shadcn-ui")
const UPSTREAM_URL = "https://github.com/shadcn-ui/ui.git"

/** A directory "counts" as a valid clone once it has this marker file. */
function looksLikeShadcnClone(dir: string): boolean {
  return existsSync(join(dir, "apps", "v4", "registry"))
}

/**
 * Resolves the upstream shadcn/ui clone without cloning anything. Returns
 * the first candidate directory that already exists:
 *
 *   (a) SHADCN_UI_DIR env var, if set and it exists
 *   (b) the hyperspace sibling clone at <repo>/../../data/shadcn-ui
 *       (set SHADCN_UI_NO_HYPERSPACE=1 to skip this candidate, e.g. for
 *       testing the repo-local clone path on a machine that has both)
 *   (c) the repo-local clone at <repo>/.upstream/shadcn-ui
 *
 * Returns `null` when none of the three exist yet — callers that need a
 * guaranteed clone should use `ensureShadcnClone` instead.
 */
export function resolveShadcnClone(): string | null {
  const envDir = process.env.SHADCN_UI_DIR
  if (envDir && existsSync(envDir)) return envDir

  if (!process.env.SHADCN_UI_NO_HYPERSPACE && existsSync(HYPERSPACE_DIR)) {
    return HYPERSPACE_DIR
  }

  if (existsSync(LOCAL_DIR)) return LOCAL_DIR

  return null
}

/**
 * Resolves the upstream shadcn/ui clone, cloning it into
 * `<repo>/.upstream/shadcn-ui` if none of the resolution candidates exist
 * yet. Safe under concurrent invocation (e.g. two vitest workers racing to
 * clone): each caller clones into its own temp directory and atomically
 * `rename()`s it into place, so only one winner's directory survives and
 * the loser's partial clone is discarded — no lockfile needed.
 *
 * Throws if the clone attempt itself fails (network down, GitHub
 * unreachable, etc.) — callers on offline machines should catch this and
 * skip gracefully rather than letting it fail the whole run.
 */
export async function ensureShadcnClone(): Promise<string> {
  const existing = resolveShadcnClone()
  if (existing) return existing

  // Another worker may finish cloning between our resolve() miss above and
  // now; check once more right before doing the work, and again after our
  // own clone lands (the rename step below already handles that race).
  mkdirSync(dirname(LOCAL_DIR), { recursive: true })

  const tmpDir = `${LOCAL_DIR}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`

  const result = spawnSync(
    "git",
    ["clone", "--depth", "1", "--filter=blob:none", UPSTREAM_URL, tmpDir],
    { stdio: ["ignore", "pipe", "pipe"] }
  )

  if (result.status !== 0 || !looksLikeShadcnClone(tmpDir)) {
    rmSync(tmpDir, { recursive: true, force: true })
    const stderr = result.stderr?.toString().trim()
    throw new Error(
      `ensureShadcnClone: failed to clone ${UPSTREAM_URL} into ${tmpDir}` +
        (stderr ? `\n${stderr}` : "")
    )
  }

  // Another worker may have won the race and already created LOCAL_DIR
  // while we were cloning. If so, discard our clone and use theirs — both
  // are equivalent (same shallow HEAD of the same upstream repo).
  if (existsSync(LOCAL_DIR)) {
    rmSync(tmpDir, { recursive: true, force: true })
    return LOCAL_DIR
  }

  try {
    renameSync(tmpDir, LOCAL_DIR)
  } catch {
    // Lost the rename race to another worker; their directory wins.
    rmSync(tmpDir, { recursive: true, force: true })
  }

  return LOCAL_DIR
}
