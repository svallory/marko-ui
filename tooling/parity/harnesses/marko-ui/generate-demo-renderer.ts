/**
 * generate-demo-renderer.ts — mirrors apps/docs/src/tags/docs/demo-renderer.marko
 * into this harness's own src/tags/ directory, with its relative demo
 * imports rewritten to the new depth.
 *
 * WHY a copy, not a cross-tree import: apps/docs/src/routes/demo/$name/
 * +page.marko originally imported demo-renderer.marko directly across
 * package boundaries (`import "../../../.../apps/docs/src/tags/docs/
 * demo-renderer.marko"`). That compiles fine for plain module imports, but
 * Marko's relative-custom-tag resolution (the mechanism that lets a bare
 * `import "x.marko"` register `<x>` as a usable tag) does not register
 * tags reached through a path that crosses outside this Vite project's
 * own root — the import resolves as a module, but `<demo-renderer>`
 * fails at compile time with "Unable to find entry point for custom tag".
 * Copying the generated file into this harness's own src/ tree (as this
 * repo already does for apps/docs itself — demo-renderer.marko there is
 * ALSO a generated, not hand-authored, file — see
 * apps/docs/scripts/build-demos-manifest.ts's header) keeps the tag
 * resolvable while still never hand-duplicating the actual demo content:
 * only this thin dispatch file is copied, and its own import lines still
 * point at the real demos under apps/docs/src/demos/**, just from a
 * different relative depth.
 *
 * Run this whenever apps/docs/src/tags/docs/demo-renderer.marko is
 * regenerated (i.e. after `bun run build:demos`).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const HARNESS_ROOT = dirname(fileURLToPath(import.meta.url))
const SOURCE = join(HARNESS_ROOT, "..", "..", "..", "..", "apps", "docs", "src", "tags", "docs", "demo-renderer.marko")
const DEST = join(HARNESS_ROOT, "src", "tags", "demo-renderer.marko")

export function generate(): void {
  const source = readFileSync(SOURCE, "utf8")
  // Source's own import lines are relative to apps/docs/src/tags/docs/,
  // e.g. "../../demos/accordion/accordion-basic.marko" (-> apps/docs/src/demos/...).
  // From this harness's src/tags/, the same target is four levels further
  // up: "../../../../apps/docs/src/demos/accordion/accordion-basic.marko".
  const rewritten = source.replace(
    /from "\.\.\/\.\.\/demos\//g,
    'from "../../../../../../apps/docs/src/demos/'
  )
  mkdirSync(dirname(DEST), { recursive: true })
  writeFileSync(DEST, rewritten)
}

if (import.meta.main) {
  generate()
  console.log(`[marko-ui harness] generated ${DEST}`)
}
