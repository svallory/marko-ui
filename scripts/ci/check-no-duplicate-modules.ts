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
 * are counted, and the check FAILS if more than a small ceiling are unmapped or any is larger than a few KB, so disappearing sourcemaps cannot make it pass vacuously).
 *
 * Usage: bun scripts/ci/check-no-duplicate-modules.ts [publicDir]
 */
import { coverageProblems, findDuplicates } from "./lib/duplicate-modules.ts";

const publicDir = process.argv[2] ?? "apps/docs/dist/public";
const result = findDuplicates(publicDir);
for (const b of result.builds) {
  console.log(`build ${b.name}: ${b.chunks} chunks, ${b.withoutMap} without a sourcemap, ${b.duplicates.length} duplicated modules`);
  for (const d of b.duplicates.slice(0, 20)) console.error(`  ${d.source}\n    in: ${d.chunks.join(", ")}`);
}
// EACH expected build must have chunks: a build that emitted nothing (or whose
// HTML entries no longer match the entry format) must fail the check on its
// own — passing only because the OTHER build still has chunks is vacuous.
for (const b of result.builds) {
  if (b.chunks === 0) {
    console.error(`check-no-duplicate-modules: build ${b.name}: no chunks found — build missing, or the HTML entry format changed.`);
    process.exit(1);
  }
}
const coverage = result.builds.flatMap(coverageProblems);
if (coverage.length > 0) {
  for (const c of coverage) console.error(c);
  console.error("Too few chunks have a sourcemap for the duplicate check to be meaningful (build.sourcemap off?). Restore sourcemaps, or raise the ceilings in scripts/ci/lib/duplicate-modules.ts with a reason.");
  process.exit(1);
}
if (result.builds.some((b) => b.duplicates.length > 0)) {
  console.error("A module is emitted into more than one client chunk. Check codeSplitting groups in apps/docs/vite.config.ts (apps/docs/vendor-chunks.ts).");
  process.exit(1);
}
