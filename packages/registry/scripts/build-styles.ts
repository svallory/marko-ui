/**
 * Phase 2c generator: emits per-style component trees from the single
 * authored source (`default/ui/**`).
 *
 *   bun packages/registry/scripts/build-styles.ts [--style <name>] [--clean] [--out <dir>]
 *
 * For each style CSS in `styles-src/style-*.css` a StyleMap is built
 * (`./style-map.ts`) and applied to every component under `default/ui/`:
 *
 *   - `*.marko`     → `transformMarkoSource` (class-context strings only)
 *   - `variants.ts` → `transformVariantsSource` (ts-morph string literals)
 *   - anything else → copied verbatim (controllers, lib/*.ts,
 *                     registry.meta.json, .css, .json)
 *
 * File-set policy mirrors the hand-ported `styles/<style>/` trees: ONLY the
 * `ui/` tree is emitted — `default/lib` and `default/styles` are not copied
 * per style (the hand-ported trees don't contain them; imports of
 * `#lib/utils.ts` resolve package-wide via the package.json `imports` map
 * `"#lib/*": "./default/lib/*"`, so verbatim copies keep working from any
 * subtree). No generated-file header is added — the hand-ported trees carry
 * none, and phase-3 diffing wants minimal noise.
 *
 * Output is deterministic (sorted walk, pure transforms) and idempotent:
 * files are only written when their bytes differ, so a second run is a no-op.
 *
 * Output root defaults to `styles-gen/` (gitignored) — the hand-ported
 * `styles/` trees are NOT overwritten until phase-3 verification passes.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"

import { createStyleMap, type StyleMap } from "./style-map"
import { transformMarkoSource } from "./transform-marko"
import { transformVariantsSource } from "./transform-variants"

const REGISTRY_ROOT = new URL("../", import.meta.url).pathname
const STYLES_SRC = path.join(REGISTRY_ROOT, "styles-src")
const SOURCE_UI = path.join(REGISTRY_ROOT, "default", "ui")
const DEFAULT_OUT = path.join(REGISTRY_ROOT, "styles-gen")

interface CliOptions {
  styles: string[] | null
  clean: boolean
  out: string
}

interface StyleSummary {
  style: string
  emitted: number
  written: number
  markoTransformed: number
  markoTotal: number
  variantsTransformed: number
  variantsTotal: number
  verbatim: number
  pruned: number
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { styles: null, clean: false, out: DEFAULT_OUT }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (arg === "--style") {
      const name = argv[++i]
      if (!name) throw new Error("--style requires a value")
      ;(opts.styles ??= []).push(name)
    } else if (arg === "--clean") {
      opts.clean = true
    } else if (arg === "--out") {
      const dir = argv[++i]
      if (!dir) throw new Error("--out requires a value")
      opts.out = path.resolve(dir)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return opts
}

function discoverStyles(): string[] {
  return readdirSync(STYLES_SRC)
    .filter((f) => /^style-[\w-]+\.css$/.test(f))
    .map((f) => f.replace(/^style-/, "").replace(/\.css$/, ""))
    .sort()
}

/** Recursively lists files under `dir`, as sorted paths relative to `dir`. */
function walk(dir: string, base = dir): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walk(full, base))
    } else if (entry.isFile()) {
      out.push(path.relative(base, full))
    }
  }
  return out.sort()
}

/** Like `walk`, but yields nothing when `dir` does not exist yet. */
function safeWalk(dir: string): string[] {
  try {
    return walk(dir)
  } catch {
    return []
  }
}

/** Removes directories left empty by pruning, bottom-up (never removes `root`). */
function pruneEmptyDirs(root: string): void {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const full = path.join(root, entry.name)
    pruneEmptyDirs(full)
    if (readdirSync(full).length === 0) {
      rmSync(full, { recursive: true, force: true })
    }
  }
}

/** Writes only when content differs; returns true if the file was written. */
function writeIfChanged(filePath: string, content: string | Buffer): boolean {
  try {
    const existing = readFileSync(filePath)
    if (
      typeof content === "string"
        ? existing.toString("utf8") === content
        : existing.equals(content)
    ) {
      return false
    }
  } catch {
    // Missing file — fall through to write.
  }
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, content)
  return true
}

function buildStyle(
  style: string,
  styleMap: StyleMap,
  files: string[],
  outRoot: string,
  clean: boolean
): StyleSummary {
  const styleOut = path.join(outRoot, style)
  if (clean) {
    rmSync(styleOut, { recursive: true, force: true })
  }
  const uiOut = path.join(styleOut, "ui")

  const summary: StyleSummary = {
    style,
    emitted: 0,
    written: 0,
    markoTransformed: 0,
    markoTotal: 0,
    variantsTransformed: 0,
    variantsTotal: 0,
    verbatim: 0,
    pruned: 0,
  }

  for (const rel of files) {
    const srcPath = path.join(SOURCE_UI, rel)
    const destPath = path.join(uiOut, rel)
    const base = path.basename(rel)

    let content: string | Buffer
    if (base.endsWith(".marko")) {
      const source = readFileSync(srcPath, "utf8")
      content = transformMarkoSource(source, styleMap)
      summary.markoTotal++
      if (content !== source) summary.markoTransformed++
    } else if (base === "variants.ts") {
      const source = readFileSync(srcPath, "utf8")
      content = transformVariantsSource(source, styleMap)
      summary.variantsTotal++
      if (content !== source) summary.variantsTransformed++
    } else {
      content = readFileSync(srcPath)
      summary.verbatim++
    }

    summary.emitted++
    if (writeIfChanged(destPath, content)) summary.written++
  }

  // Prune outputs whose source file no longer exists, so an incremental run
  // stays an exact mirror of `default/ui` (a deleted/renamed component would
  // otherwise linger and get picked up by tsc, Tailwind @source globs, etc).
  const expected = new Set(files)
  for (const rel of safeWalk(uiOut)) {
    if (!expected.has(rel)) {
      rmSync(path.join(uiOut, rel), { force: true })
      summary.pruned++
    }
  }
  if (summary.pruned > 0) {
    pruneEmptyDirs(uiOut)
  }

  return summary
}

function main() {
  const started = performance.now()
  const opts = parseArgs(process.argv.slice(2))

  const available = discoverStyles()
  const styles = opts.styles ?? available
  for (const style of styles) {
    if (!available.includes(style)) {
      console.error(
        `Unknown style "${style}". Available: ${available.join(", ")}`
      )
      process.exit(1)
    }
  }

  const files = walk(SOURCE_UI)

  for (const style of styles) {
    const css = readFileSync(
      path.join(STYLES_SRC, `style-${style}.css`),
      "utf8"
    )
    const styleMap = createStyleMap(css)
    const s = buildStyle(style, styleMap, files, opts.out, opts.clean)
    console.log(
      `${s.style.padEnd(5)} emitted ${s.emitted} files ` +
        `(${s.written} written) — ` +
        `.marko transformed ${s.markoTransformed}/${s.markoTotal}, ` +
        `variants transformed ${s.variantsTransformed}/${s.variantsTotal}, ` +
        `verbatim ${s.verbatim}` +
        (s.pruned > 0 ? `, pruned ${s.pruned}` : "")
    )
  }

  const elapsed = ((performance.now() - started) / 1000).toFixed(2)
  console.log(
    `\n${styles.length} style${styles.length === 1 ? "" : "s"} → ${opts.out} in ${elapsed}s`
  )
}

main()
