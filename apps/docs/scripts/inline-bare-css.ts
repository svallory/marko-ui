/**
 * Inline the bare pages' render-blocking stylesheet for Lighthouse.
 *
 * The `/bare/<component>` pages are chrome-free performance fixtures (see
 * vite.bare.config.ts), and on mobile emulation their first paint is
 * dominated by the one blocking request for the compiled Tailwind sheet
 * (~165 kB over a throttled connection), not by anything the component
 * does — measured FCP ~1.8 s with TBT 0 and CLS 0. Inlining the CSS into
 * each prerendered page removes the round trip entirely; the sheet is
 * shared by every bare page, so the bytes are identical in each copy.
 *
 * Runs as the last step of the bare build (after vite.bare.config.ts's
 * adapter has written dist/public/bare/*.html, before prerender-handlers
 * and the worker build). Only `<link rel="stylesheet" href="/assets/*.css">`
 * tags inside bare pages are rewritten; modulepreload/script links stay
 * untouched (they do not block first paint).
 */
import * as fs from "node:fs";
import * as path from "node:path";

const BARE_DIR = "dist/public/bare";
const ASSETS_DIR = "dist/public";

const pages = fs.readdirSync(BARE_DIR).filter((f) => f.endsWith(".html"));
let inlined = 0;

for (const page of pages) {
  const file = path.join(BARE_DIR, page);
  const html = fs.readFileSync(file, "utf8");
  const next = html.replace(
    /<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/g,
    (_match, href: string) => {
      const css = fs.readFileSync(path.join(ASSETS_DIR, href), "utf8");
      inlined++;
      return `<style>\n${css}\n</style>`;
    },
  );
  if (next !== html) fs.writeFileSync(file, next);
}

console.log(`inline-bare-css: inlined ${inlined} stylesheet link(s) across ${pages.length} bare pages`);

// A fresh bare build always emits stylesheet links — zero inlines means the
// adapter's markup drifted from the regex above (attribute order/quotes) and
// the pages would silently lose the inlining this script exists for. Fail
// loud. (A second run over an already-inlined dist is not a supported use.)
if (inlined === 0) {
  console.error("inline-bare-css: no stylesheet links found in any bare page — markup drift? nothing inlined.");
  process.exit(1);
}
