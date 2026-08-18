/**
 * Phase 4a assembler: syncs the single authored source into `@marko-ui/core`,
 * the import-distribution package (see `notes/plans/dual-distribution-plan.md`
 * §1/§4a and `notes/plans/spike-3a-verdict.md`).
 *
 *   bun packages/registry/scripts/build-core.ts [--clean]
 *
 * `@marko-ui/core`'s `exports` map in `packages/core/package.json` MUST
 * resolve to paths *inside* `packages/core/` — Node/npm silently ignore any
 * `exports` target that escapes the package directory (verified: a target of
 * `"../registry/default/lib/*"` resolves to nothing, no error). Symlinks
 * inside the package don't survive `npm pack`/`file:` installs either
 * (verified: `bun pm pack` emits 0 files for a symlinked directory, even
 * when listed in `"files"`). So this script does a real byte copy —
 * `packages/core/{ui,lib,styles}` are GENERATED, gitignored output, exactly
 * like `styles-gen/` is for the copy path. There is still only one authored
 * source (`default/**`); this is the sync step that makes it reachable from
 * a real npm package boundary.
 *
 * Copies, verbatim (no per-style transform — `@marko-ui/core` ships the
 * hook-class source, not a flattened style):
 *   - `default/ui/**`                    → `packages/core/ui/**`
 *   - `default/lib/**`                   → `packages/core/lib/**`
 *   - `default/styles/globals*.css`      → `packages/core/styles/*`
 *   - `default/styles/marko-accordion.css` → `packages/core/styles/*`
 *   - `styles-gen/css/style-*.css`       → `packages/core/styles/*`
 *     (precompiled by `build-style-css.ts` — run that first, or this script
 *     will fail loudly rather than ship a stale/missing layer)
 *
 * Idempotent: files are only (re)written when bytes differ.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"

const REGISTRY_ROOT = new URL("../", import.meta.url).pathname
const CORE_ROOT = path.join(REGISTRY_ROOT, "..", "core")

const SRC_UI = path.join(REGISTRY_ROOT, "default", "ui")
const SRC_LIB = path.join(REGISTRY_ROOT, "default", "lib")
const SRC_STYLES_DIR = path.join(REGISTRY_ROOT, "default", "styles")
const SRC_STYLE_CSS_DIR = path.join(REGISTRY_ROOT, "styles-gen", "css")

const OUT_UI = path.join(CORE_ROOT, "ui")
const OUT_LIB = path.join(CORE_ROOT, "lib")
const OUT_STYLES = path.join(CORE_ROOT, "styles")

interface CliOptions {
  clean: boolean
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { clean: false }
  for (const arg of argv) {
    if (arg === "--clean") opts.clean = true
    else throw new Error(`Unknown argument: ${arg}`)
  }
  return opts
}

let filesWritten = 0
let filesUnchanged = 0

/** Copies a single file, skipping the write if bytes are unchanged. */
function copyFileIfChanged(src: string, dest: string): void {
  mkdirSync(path.dirname(dest), { recursive: true })
  const newBytes = readFileSync(src)
  if (existsSync(dest)) {
    const oldBytes = readFileSync(dest)
    if (oldBytes.equals(newBytes)) {
      filesUnchanged++
      return
    }
  }
  writeFileSync(dest, newBytes)
  filesWritten++
}

/** Recursively copies a directory tree, file by file, preserving structure. */
function copyTree(srcDir: string, destDir: string): void {
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      copyTree(srcPath, destPath)
    } else if (entry.isFile()) {
      copyFileIfChanged(srcPath, destPath)
    }
  }
}

function main() {
  const started = performance.now()
  const opts = parseArgs(process.argv.slice(2))

  if (!existsSync(SRC_STYLE_CSS_DIR)) {
    throw new Error(
      `${SRC_STYLE_CSS_DIR} does not exist. Run "bun run build:styles:css" first — ` +
        `@marko-ui/core ships the precompiled style layers, not raw styles-src/.`
    )
  }
  const styleCssFiles = readdirSync(SRC_STYLE_CSS_DIR).filter((f) => f.endsWith(".css"))
  if (styleCssFiles.length === 0) {
    throw new Error(
      `${SRC_STYLE_CSS_DIR} has no .css files. Run "bun run build:styles:css" first.`
    )
  }

  if (opts.clean) {
    for (const dir of [OUT_UI, OUT_LIB, OUT_STYLES]) {
      rmSync(dir, { recursive: true, force: true })
    }
  }

  copyTree(SRC_UI, OUT_UI)
  copyTree(SRC_LIB, OUT_LIB)

  // default/styles/*.css (globals*.css, marko-accordion.css) — copy every
  // .css file verbatim; anything else under default/styles/ is not part of
  // the core distribution's public surface.
  for (const entry of readdirSync(SRC_STYLES_DIR, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".css")) {
      copyFileIfChanged(path.join(SRC_STYLES_DIR, entry.name), path.join(OUT_STYLES, entry.name))
    }
  }

  // precompiled per-style layers
  for (const file of styleCssFiles) {
    copyFileIfChanged(path.join(SRC_STYLE_CSS_DIR, file), path.join(OUT_STYLES, file))
  }

  const elapsed = ((performance.now() - started) / 1000).toFixed(2)
  console.log(
    `@marko-ui/core: ${filesWritten} file(s) written, ${filesUnchanged} unchanged → ${CORE_ROOT} in ${elapsed}s`
  )
}

main()
