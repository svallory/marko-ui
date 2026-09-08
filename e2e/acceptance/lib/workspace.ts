import { mkdtemp, realpath, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

// Journeys run outside the repo (brief §1) so they exercise the published
// artifacts, not the workspace's own node_modules / linked packages.
//
// realpath is required, not cosmetic: on macOS, os.tmpdir() returns a
// /var/folders/... path, and /var is itself a symlink to /private/var. The
// published CLI's own entrypoint guard (packages/marko-ui/src/index.ts)
// compares `import.meta.url` — which Node resolves through that symlink —
// against `pathToFileURL(process.argv[1])`, which does NOT resolve it. Spawn
// the CLI with an unresolved --cwd/argv path and that comparison silently
// fails: `main()` never runs, the process exits 0, and nothing is written or
// printed. See report-acceptance.md for the full writeup; this is a real
// defect worth fixing upstream, but every acceptance journey works around it
// here by only ever handing the CLI already-canonical paths.
export async function makeTempWorkspace(prefix: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), `marko-ui-acceptance-${prefix}-`))
  return realpath(dir)
}

export async function cleanupTempWorkspace(dir: string): Promise<void> {
  if (process.env.ACCEPTANCE_KEEP_TEMP === "1") return
  await rm(dir, { recursive: true, force: true })
}
