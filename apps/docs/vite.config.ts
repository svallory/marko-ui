import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import type { Route } from "@marko/run/vite";
import staticAdapter from "@marko/run-adapter-static";
import tailwindcss from "@tailwindcss/vite";

import { BLOCK_CATEGORIES } from "./src/lib/blocks-list.ts";
import { CHART_TYPES } from "./src/lib/charts-list.ts";
import { COMPONENTS } from "./src/lib/components-list.ts";
import { PREVIEW_ITEMS } from "./src/lib/preview-items.ts";
import { FIXTURES } from "./src/tags/typeset/lib/fixtures/index.ts";

/**
 * Every URL the static crawler must visit that it cannot discover on its own.
 *
 * The adapter seeds only PARAMETERLESS routes and then follows anchor links.
 * Anything behind a dynamic segment ($name, $category, $type) is therefore
 * invisible to it unless listed here, and relying on the anchor crawl for
 * those would make the deployed site's completeness depend on whether some
 * page happens to link to every value — a silent-gap risk we don't want.
 * Enumerating them from the same modules the pages themselves read keeps the
 * two in lockstep: add a component to COMPONENTS and it is prerendered.
 */
export function staticUrls(routes: Route[]): string[] {
  // The adapter's own crawl() does not dedupe its seed paths: it builds
  // `pathsToVisit` from every parameterless route PLUS whatever this function
  // returns, then maps the whole (possibly duplicated) list straight into
  // concurrent visits with no dedup pass. Two visits of the same path both
  // open `fs.createWriteStream` on the same file at once, and whichever
  // finishes second wins — the loser's shorter/incomplete write can still
  // leave its tail bytes behind, corrupting the file (observed as a
  // duplicated `</script></body></html>` tail on chart.html, the largest
  // page and so the one most likely to lose the race). Most components here
  // already have their own generated parameterless route
  // (src/routes/docs/components/<name>/+page.marko), so pushing
  // `/docs/components/<name>` again is a guaranteed duplicate for those.
  // Building the set from `routes` (which the adapter hands us for exactly
  // this purpose) and filtering it out is what actually prevents the race,
  // not just relying on `seen` — `seen` is populated from these paths too
  // late to stop the initial concurrent batch.
  const parameterlessPaths = new Set(
    routes
      .filter((route) => !route.path.params || !Object.keys(route.path.params).length)
      .map((route) => route.path.path),
  );

  const urls = new Set<string>();

  for (const name of COMPONENTS) {
    // The docs page itself, but only when it isn't already one of the
    // adapter's own parameterless routes (see comment above).
    const componentPath = `/docs/components/${name}`;
    if (!parameterlessPaths.has(componentPath)) urls.add(componentPath);
    // ...and its two markdown twins. `<name>.md` is the canonical one
    // (docs/components/$name/+handler.ts matches the suffix inside the param);
    // `/md` is the older alias (docs/components/$name/md/+handler.ts).
    //
    // Only the `.md` form survives the crawler on its own: a non-HTML 200 is
    // written verbatim ONLY when the path carries a file extension, and is
    // otherwise dropped. The extensionless `/md` twin is listed anyway so the
    // crawl reports it, and is materialized by scripts/prerender-handlers.ts.
    urls.add(`/docs/components/${name}.md`);
    urls.add(`/docs/components/${name}/md`);
  }

  for (const category of BLOCK_CATEGORIES) {
    // The list includes an empty slug for the "all blocks" landing page, which
    // is already covered by the parameterless /blocks route.
    if (category.slug) urls.add(`/blocks/${category.slug}`);
  }

  for (const type of CHART_TYPES) urls.add(`/charts/${type.slug}`);

  for (const name of Object.keys(FIXTURES)) urls.add(`/typeset/preview/${name}`);

  // The showcase pages the /create customizer drives through its iframe.
  // /create/preview picks its whole body from `?item=` at RENDER time, so each
  // item needs its own prerendered document; the Worker maps the query string
  // onto these paths at request time (see worker/index.ts). Without this the
  // three items would collapse onto one file and the gallery visual guard
  // would silently screenshot preview-page-1 three times.
  for (const item of PREVIEW_ITEMS) urls.add(`/create/preview/${item}`);

  // Extensionless handler; materialized by scripts/prerender-handlers.ts for
  // the same reason as the `/md` twins above.
  urls.add("/typeset/css");

  return [...urls];
}

/**
 * Long-term-cache vendor chunks for the CLIENT bundle only.
 *
 * Each /docs/components/<name> page is a generated static route whose client
 * graph contains only that component's demos (plus shared chunks) — but every
 * page still shares the same vendor graph: the ~48 @zag-js machines, d3,
 * shiki, @tanstack/table-core and the icon packs all roll into common chunks
 * reused across pages. Without a policy, Rolldown's default shared-chunk
 * names are content hashes that change with any edit to any demo, so repeat
 * visitors re-download the whole vendor graph on every deploy. Pinning those
 * modules to stable chunk names lets them be cached long-term across deploys.
 *
 * Client-only: the SSR/prerender bundle must stay exactly as Rolldown lays it
 * out — forcing chunks there risks split-instance/circular-chunk hazards in
 * the server graph for zero user benefit (the server bundle is never cached).
 */
const VENDOR_CHUNK_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  // marko runtime first: it is the leaf-most dependency of every page.
  [/node_modules[\\/]marko[\\/]/, "vendor-marko"],
  // marko-zag's compiled tags sit next to the machines they wrap.
  [/node_modules[\\/]marko-zag[\\/]/, "vendor-zag"],
  [/node_modules[\\/]@zag-js[\\/]/, "vendor-zag"],
  [/node_modules[\\/]d3(-[a-z0-9-]+)?[\\/]/, "vendor-d3"],
  [/node_modules[\\/]shiki[\\/]/, "vendor-shiki"],
  [/node_modules[\\/]@tanstack[\\/]table-core[\\/]/, "vendor-table-core"],
  [/node_modules[\\/]@hugeicons[\\/]/, "vendor-icons"],
];

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    tailwindcss(),
    marko({
      adapter: staticAdapter({ urls: staticUrls }),
    }),
  ],
  build: isSsrBuild
    ? undefined
    : {
        // @marko/run's vite plugin merges `build.rolldownOptions.output` (the
        // native Vite 8 option — `rollupOptions` is a deprecated alias it does
        // not read), so the chunk policy must live here to survive the merge.
        rolldownOptions: {
          output: {
            // Rolldown `codeSplitting` groups (formerly `advancedChunks`), replacing
            // the old `manualChunks` function. `manualChunks` could not separate
            // Vite's `\0vite/preload-helper.js` from the shiki bundle it was
            // first grouped with (#81), so any lazy `import()` in a shared
            // component dragged ~270 KB gzip of shiki into every route. The
            // helper gets its own group with the highest priority; the
            // scripts/ci/check-preload-helper.ts guard checks the built output.
            codeSplitting: {
              groups: [
                { name: "preload-helper", test: /vite[\\/]preload-helper/, priority: 100 },
                ...VENDOR_CHUNK_PATTERNS.map(([test, name]) => ({ name, test })),
              ],
            },
          },
        },
      },
}));
