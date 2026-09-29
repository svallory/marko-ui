/**
 * Guard for #87: no module may be emitted into two client chunks of the same
 * build. Splitting the zag stack per machine must not duplicate shared code
 * (`@zag-js/core`, `dom-query`, ...) — two copies would be two instances of
 * module state (machine registries, id counters) and dead bytes.
 *
 * The docs output holds TWO independent client builds in one assets dir
 * (the main site and the chrome-free /bare/* pages), so the same module
 * legitimately appears once in each. Chunks are attributed to a build by
 * reachability from that build's HTML entries, and the check runs per build.
 * The marker is each chunk's sourcemap `sources` list (chunks without a map
 * are skipped and counted).
 *
 * Usage: bun scripts/ci/check-no-duplicate-modules.ts [publicDir]
 */
import { findDuplicates } from "./lib/duplicate-modules.ts";

const publicDir = process.argv[2] ?? "apps/docs/dist/public";
const result = findDuplicates(publicDir);
for (const b of result.builds) {
  console.log(`build ${b.name}: ${b.chunks} chunks, ${b.withoutMap} without a sourcemap, ${b.duplicates.length} duplicated modules`);
  for (const d of b.duplicates.slice(0, 20)) console.error(`  ${d.source}\n    in: ${d.chunks.join(", ")}`);
}
if (result.builds.every((b) => b.chunks === 0)) {
  console.error("check-no-duplicate-modules: no chunks found — build missing, or the HTML entry format changed.");
  process.exit(1);
}
if (result.builds.some((b) => b.duplicates.length > 0)) {
  console.error("A module is emitted into more than one client chunk. Check codeSplitting groups in apps/docs/vite.config.ts (apps/docs/vendor-chunks.ts).");
  process.exit(1);
}
