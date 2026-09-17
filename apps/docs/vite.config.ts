import { defineConfig } from "vite";
import marko from "@marko/run/vite";
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
function staticUrls(): string[] {
  const urls: string[] = [];

  for (const name of COMPONENTS) {
    // The docs page itself...
    urls.push(`/docs/components/${name}`);
    // ...and its two markdown twins. `<name>.md` is the canonical one
    // (docs/components/$name/+handler.ts matches the suffix inside the param);
    // `/md` is the older alias (docs/components/$name/md/+handler.ts).
    //
    // Only the `.md` form survives the crawler on its own: a non-HTML 200 is
    // written verbatim ONLY when the path carries a file extension, and is
    // otherwise dropped. The extensionless `/md` twin is listed anyway so the
    // crawl reports it, and is materialized by scripts/prerender-handlers.ts.
    urls.push(`/docs/components/${name}.md`);
    urls.push(`/docs/components/${name}/md`);
  }

  for (const category of BLOCK_CATEGORIES) {
    // The list includes an empty slug for the "all blocks" landing page, which
    // is already covered by the parameterless /blocks route.
    if (category.slug) urls.push(`/blocks/${category.slug}`);
  }

  for (const type of CHART_TYPES) urls.push(`/charts/${type.slug}`);

  for (const name of Object.keys(FIXTURES)) urls.push(`/typeset/preview/${name}`);

  // The showcase pages the /create customizer drives through its iframe.
  // /create/preview picks its whole body from `?item=` at RENDER time, so each
  // item needs its own prerendered document; the Worker maps the query string
  // onto these paths at request time (see worker/index.ts). Without this the
  // three items would collapse onto one file and the gallery visual guard
  // would silently screenshot preview-page-1 three times.
  for (const item of PREVIEW_ITEMS) urls.push(`/create/preview/${item}`);

  // Extensionless handler; materialized by scripts/prerender-handlers.ts for
  // the same reason as the `/md` twins above.
  urls.push("/typeset/css");

  return urls;
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    marko({
      adapter: staticAdapter({ urls: staticUrls }),
    }),
  ],
});
