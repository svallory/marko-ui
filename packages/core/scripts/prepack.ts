/**
 * `prepack` guard for `@marko-ui/core`.
 *
 * `ui/`, `lib/`, `styles/` are GENERATED, gitignored output (byte-copied by
 * `build-core.ts` from `packages/registry/default/` + the precompiled style
 * CSS — see that script's header comment and `notes/plans/
 * dual-distribution-plan.md` §4a). A clean checkout has none of them. Without
 * this guard, `bun pm pack` / `bun publish` / `npm publish` run from a clean
 * checkout would silently ship an EMPTY package (verified: 1 file,
 * package.json only).
 *
 * `prepack` (not `prepublishOnly`) because it is the one lifecycle hook both
 * npm and bun honor for both `pack` and `publish` — verified empirically
 * that `bun pm pack` runs `prepack`.
 *
 * Runs the full generator chain from the repo root, then fails loudly if the
 * output is still missing or empty (defense in depth against a chain that
 * exits 0 without actually producing files).
 */
import { existsSync, readdirSync } from "node:fs"
import { spawnSync } from "node:child_process"
import path from "node:path"

const CORE_ROOT = new URL("../", import.meta.url).pathname
const REPO_ROOT = path.join(CORE_ROOT, "..", "..")

const CHAIN: Array<{ label: string; args: string[] }> = [
  { label: "build:styles", args: ["run", "build:styles"] },
  { label: "build:styles:css", args: ["run", "build:styles:css"] },
  { label: "build:core", args: ["run", "build:core"] },
]

function run(label: string, args: string[]): void {
  console.log(`[prepack] ${label}`)
  const result = spawnSync("bun", args, {
    cwd: REPO_ROOT,
    stdio: "inherit",
  })
  if (result.status !== 0) {
    console.error(`[prepack] "${label}" failed (exit ${result.status}). Aborting pack/publish.`)
    process.exit(result.status ?? 1)
  }
}

function assertNonEmpty(dirName: string): void {
  const dir = path.join(CORE_ROOT, dirName)
  if (!existsSync(dir) || readdirSync(dir).length === 0) {
    console.error(
      `[prepack] packages/core/${dirName} is missing or empty after the build chain ran. ` +
        `Refusing to pack/publish an incomplete @marko-ui/core.`
    )
    process.exit(1)
  }
}

function main() {
  for (const step of CHAIN) run(step.label, step.args)
  for (const dir of ["ui", "lib", "styles"]) assertNonEmpty(dir)
  console.log("[prepack] @marko-ui/core build chain OK — ui/, lib/, styles/ populated.")
}

main()
