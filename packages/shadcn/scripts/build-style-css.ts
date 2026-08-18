/**
 * Precompile step for `@marko-ui/core`'s CSS distribution (spike-3a verdict,
 * see `notes/plans/spike-3a-verdict.md`).
 *
 *   bun packages/registry/scripts/build-style-css.ts [--style <name>] [--out <dir>]
 *
 * For each `styles-src/style-<name>.css` this compiles:
 *
 *   @reference "<abs path to default/styles/globals.css>";
 *   @import "<abs path to styles-src/style-<name>.css>";
 *
 * through the Tailwind v4 CLI (`@tailwindcss/cli`, a devDependency of this
 * package, invoked via its local `node_modules/.bin` binary). `@reference`
 * resolves
 * every `@apply` in the style source against the consumer theme WITHOUT
 * emitting `@theme`/preflight/utilities, so the output is plain, self-
 * contained CSS that still carries `var(--...)` references — consumer themes
 * keep working after the fact. This is what makes it safe to ship a single
 * precompiled file instead of requiring consumers to run Tailwind at all.
 *
 * Output: `styles-gen/css/style-<name>.css` (styles-gen/ is gitignored, same
 * as build-styles.ts's per-style component trees — this is the CSS sibling
 * of that generator, kept as a separate script because it shells out to a
 * different toolchain instead of doing an in-process AST transform).
 *
 * The `@reference` input files are synthesized into a scratch tmp dir
 * (`styles-gen/.tmp/`) and removed after the run (best-effort; `--keep-tmp`
 * skips cleanup for debugging).
 *
 * Each output is verified before being accepted:
 *   - larger than 100KB (a truncated/empty compile would be tiny)
 *   - contains `.style-<name> ` selectors (anchor classes made it through)
 *   - contains `var(--radius` (theme vars survived, not baked)
 *   - does NOT contain `@layer theme` or `--color-red-50` (theme leakage —
 *     would mean `@reference` didn't take effect and the full theme got
 *     emitted into the output)
 */
import { spawnSync } from "node:child_process"
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"

const REGISTRY_ROOT = new URL("../", import.meta.url).pathname
const STYLES_SRC = path.join(REGISTRY_ROOT, "styles-src")
const DEFAULT_OUT = path.join(REGISTRY_ROOT, "styles-gen", "css")
const GLOBALS_CSS = path.join(REGISTRY_ROOT, "default", "styles", "globals.css")
const TMP_DIR = path.join(REGISTRY_ROOT, "styles-gen", ".tmp")

interface CliOptions {
  styles: string[] | null
  out: string
  keepTmp: boolean
}

interface StyleResult {
  style: string
  bytes: number
  varCount: number
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { styles: null, out: DEFAULT_OUT, keepTmp: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (arg === "--style") {
      const name = argv[++i]
      if (!name) throw new Error("--style requires a value")
      ;(opts.styles ??= []).push(name)
    } else if (arg === "--out") {
      const dir = argv[++i]
      if (!dir) throw new Error("--out requires a value")
      opts.out = path.resolve(dir)
    } else if (arg === "--keep-tmp") {
      opts.keepTmp = true
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

/** Compiles a single style through the Tailwind v4 CLI via `bunx`. */
function compileStyle(style: string, outDir: string): void {
  const referenceInput = path.join(TMP_DIR, `style-${style}.reference.css`)
  const outFile = path.join(outDir, `style-${style}.css`)

  const inputCss =
    `@reference "${GLOBALS_CSS}";\n` +
    `@import "${path.join(STYLES_SRC, `style-${style}.css`)}";\n`
  writeFileSync(referenceInput, inputCss)

  // Invoke the locally-installed binary directly. `bunx @tailwindcss/cli`
  // resolves through a shared temp cache that can be corrupted by unrelated
  // installs (seen: "Cannot find package 'mri'"), and would also require
  // network access on a fresh clone.
  const proc = spawnSync(
    path.join(REGISTRY_ROOT, "node_modules/.bin/tailwindcss"),
    ["-i", referenceInput, "-o", outFile],
    { encoding: "utf8" }
  )
  if (proc.status !== 0) {
    throw new Error(
      `tailwindcss CLI failed for style "${style}" (exit ${proc.status}):\n` +
        (proc.stderr ?? "")
    )
  }
}

/** Verifies one compiled output against the spike-3a assertions. Throws on failure. */
function verifyStyle(style: string, outFile: string): number {
  const bytes = statSync(outFile).size
  if (bytes <= 100_000) {
    throw new Error(
      `style-${style}.css is only ${bytes} bytes (expected >100KB) — compile likely truncated or empty`
    )
  }

  const content = readFileSync(outFile, "utf8")

  if (!content.includes(`.style-${style} `)) {
    throw new Error(
      `style-${style}.css is missing ".style-${style} " selectors — anchor classes did not survive the compile`
    )
  }
  // `var(--radius` is the spike's canonical "theme vars survived the
  // compile" check for style-vega specifically, but not every style source
  // reads that var (style-lyra is the sharp-corners style and never uses a
  // radius utility at all; style-sera *sets* `[--radius:0]` rather than
  // reading it). Assert the var(--radius) reference for styles whose source
  // actually reads it, and fall back to a generic var()-presence check for
  // everything else — either way we still catch the real failure mode
  // (baked values / theme leakage), just without a style-specific false
  // positive.
  const sourceCss = readFileSync(path.join(STYLES_SRC, `style-${style}.css`), "utf8")
  const sourceReadsRadiusVar = /var\(--radius/.test(sourceCss)
  if (sourceReadsRadiusVar && !content.includes("var(--radius")) {
    throw new Error(
      `style-${style}.css has no "var(--radius" references — theme vars were baked instead of preserved`
    )
  }
  if (!/var\(--/.test(content)) {
    throw new Error(
      `style-${style}.css has no "var(--...)" references at all — theme vars were baked instead of preserved`
    )
  }
  if (content.includes("@layer theme")) {
    throw new Error(
      `style-${style}.css contains "@layer theme" — @reference did not suppress theme emission (theme leakage)`
    )
  }
  if (content.includes("--color-red-50")) {
    throw new Error(
      `style-${style}.css contains "--color-red-50" — full Tailwind theme leaked into the output`
    )
  }

  const varMatches = content.match(/var\(--/g)
  return varMatches ? varMatches.length : 0
}

function main() {
  const started = performance.now()
  const opts = parseArgs(process.argv.slice(2))

  const available = discoverStyles()
  const styles = opts.styles ?? available
  for (const style of styles) {
    if (!available.includes(style)) {
      console.error(`Unknown style "${style}". Available: ${available.join(", ")}`)
      process.exit(1)
    }
  }

  mkdirSync(opts.out, { recursive: true })
  mkdirSync(TMP_DIR, { recursive: true })

  const results: StyleResult[] = []
  try {
    for (const style of styles) {
      const outFile = path.join(opts.out, `style-${style}.css`)
      compileStyle(style, opts.out)
      const varCount = verifyStyle(style, outFile)
      const bytes = statSync(outFile).size
      results.push({ style, bytes, varCount })
      console.log(
        `${style.padEnd(5)} compiled ${(bytes / 1024).toFixed(1)}KB, ${varCount} var() refs — OK`
      )
    }
  } finally {
    if (!opts.keepTmp) {
      rmSync(TMP_DIR, { recursive: true, force: true })
    }
  }

  const elapsed = ((performance.now() - started) / 1000).toFixed(2)

  console.log("\nSummary:")
  console.log("style".padEnd(6) + "bytes".padStart(10) + "  var() count")
  for (const r of results) {
    console.log(r.style.padEnd(6) + String(r.bytes).padStart(10) + `  ${r.varCount}`)
  }

  console.log(
    `\n${results.length} style${results.length === 1 ? "" : "s"} → ${opts.out} in ${elapsed}s`
  )
}

main()
