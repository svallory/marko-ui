/**
 * Guard for issue #81: Vite's `\0vite/preload-helper.js` runtime must never
 * live in a chunk that also carries shiki (or is otherwise big).
 *
 * Any dynamic `import()` reachable from a route's client graph pulls the
 * helper. If Rolldown co-locates it with the ~770 KB shiki bundle, every such
 * route silently downloads shiki (+270 KB gzip measured). `apps/docs/
 * vite.config.ts` pins the helper to its own tiny chunk; this script checks the
 * BUILT output so a config or Rolldown change that regresses it fails CI.
 *
 * Usage: bun scripts/ci/check-preload-helper.ts [assetsDir]
 * (default apps/docs/dist/public/assets — run after the docs build)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MAX_HELPER_CHUNK_BYTES = 50 * 1024;
const dir = process.argv[2] ?? "apps/docs/dist/public/assets";

// The helper is the only code that feature-detects `relList.supports("modulepreload")`.
const isHelperChunk = (src: string) => src.includes("modulepreload") && src.includes("relList");
// shiki's core bundle carries this sentinel string.
const hasShiki = (src: string) => src.includes("__shiki_resolved") || src.includes("shiki:decorations");

const helperChunks: { file: string; bytes: number; shiki: boolean }[] = [];
for (const file of readdirSync(dir)) {
  if (!file.endsWith(".js")) continue;
  const path = join(dir, file);
  const src = readFileSync(path, "utf8");
  if (isHelperChunk(src)) helperChunks.push({ file, bytes: statSync(path).size, shiki: hasShiki(src) });
}

if (helperChunks.length === 0) {
  console.error(`check-preload-helper: no chunk in ${dir} contains the preload helper — build missing, or the detection marker changed.`);
  process.exit(1);
}

const bad = helperChunks.filter((c) => c.shiki || c.bytes > MAX_HELPER_CHUNK_BYTES);
for (const c of helperChunks) {
  console.log(`preload helper in ${c.file}: ${c.bytes} B${c.shiki ? " + shiki" : ""}${bad.includes(c) ? "  <-- BAD" : ""}`);
}
if (bad.length > 0) {
  console.error("Preload helper is co-located with shiki or a large chunk (see #81). Check the advancedChunks/codeSplitting groups in apps/docs/vite.config.ts.");
  process.exit(1);
}
