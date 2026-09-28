/**
 * Docs chrome + new-york surface visual-regression guard (issue #75).
 *
 * WHY THIS FILE, SEPARATE FROM gallery-visual.spec.ts
 * ----------------------------------------------------
 * gallery-visual.spec.ts screenshots `/create/preview` under every
 * /create-offered style, and new-york is deliberately excluded there — see
 * that file's GUARDED_STYLES comment: `/create/preview` cannot render
 * `.style-new-york` at all, because new-york isn't in /create's own style
 * picker. new-york IS applied for real, but only on specific site surfaces
 * that set `class="style-new-york"` directly rather than going through the
 * /create customizer: site-header.marko, site-footer.marko,
 * blocks-gallery.marko, charts-gallery.marko. Those surfaces have no
 * `?item=`-style axis to swap through — each is a fixed page — so this file
 * screenshots them as themselves rather than building a virtual gallery.
 *
 * SCOPE
 * -----
 * Three pages, each screenshotted light+dark at desktop (1440) and mobile
 * (390) widths — 12 screenshots total:
 *
 *   - /docs/components/button: a "docs page" per issue #75 — this route
 *     "owns its own frame" (see routes/docs/+layout.marko's ownsItsFrame
 *     branch), rendering site-header + components-sidebar (left rail) +
 *     the component doc body + a right-hand TOC + site-footer. Covers the
 *     header/sidebar/footer chrome the issue asks for in one page.
 *   - /blocks: blocks-gallery.marko wraps its entire body (PageHeader +
 *     PageNav + block list) in a single `style-new-york` div.
 *   - /charts: charts-gallery.marko does the same for the chart type grid.
 *
 * Together with gallery-visual.spec.ts's 48 baselines, new-york now has
 * real screenshot coverage — not virtual — on every surface it actually
 * ships on.
 *
 * DETERMINISM
 * -----------
 * Reuses gallery-visual.spec.ts's freeze/settle helpers (visual-helpers.ts)
 * verbatim rather than re-deriving them — see AGENTS.md "Gallery visual
 * guard" for the full history of each trap those helpers close (animation
 * mid-transition, the accordion ResizeObserver feedback loop, the
 * waitForTimeout settling race). Docs chrome has no /create-style axis to
 * swap, so applyStyle()/GUARDED_STYLES don't apply here — only
 * freezeForScreenshot/waitForHydration/waitForLayoutSettled/applyTheme are
 * imported.
 *
 * Same rules as the gallery guard: Linux-only baselines, generated on the
 * CI runner via the update-baselines job, never locally with
 * --update-snapshots. maxDiffPixels stays 0 — do not raise it to silence a
 * red run; see AGENTS.md.
 */
import { expect, test, type Page } from "@playwright/test";
import {
  applyTheme,
  freezeForScreenshot,
  waitForHydration,
  waitForLayoutSettled,
} from "./visual-helpers";

const THEMES = ["light", "dark"] as const;

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

const PAGES = [
  { name: "docs-button", path: "/docs/components/button" },
  { name: "blocks", path: "/blocks" },
  { name: "charts", path: "/charts" },
] as const;

/**
 * `[data-slot="scroll-area-scrollbar"]` (and its thumb) is masked because
 * blocks-nav.marko's horizontal ScrollArea (the "Featured/Sidebar/Login/
 * Signup" category rail on /blocks) measures its scrollbar geometry via
 * @zag-js/scroll-area's ResizeObserver + setTimeout (see
 * packages/shadcn/ui/scroll-area/scroll-area.marko's own comment on why the
 * scrollbar/thumb are always DOM-present and only CSS-hidden) — the exact
 * same class of runtime-measured, capture-can-land-on-either-side
 * nondeterminism gallery-visual.spec.ts already documents for the
 * accordion's ResizeObserver. Measured locally: 2 runs of
 * `chrome blocks — light mobile` differed by 2,228 pixels, localized to a
 * ~6px-tall, ~320px-wide band immediately below the nav row (y 384-390,
 * x 42-361 on a 390-wide capture) — the scrollbar thumb's width/position
 * settling on one side or the other of the capture. No other page/theme/
 * viewport combination in this spec showed any diff across 2 local runs
 * (11 of 12 byte-identical), and docs-button/charts use no horizontal
 * ScrollArea, so the mask is scoped to blocks-nav's own scrollbar rather
 * than applied file-wide.
 */
function masksFor(page: Page) {
  return [page.locator('[data-slot="scroll-area-scrollbar"]')];
}

for (const pageDef of PAGES) {
  for (const theme of THEMES) {
    for (const viewport of VIEWPORTS) {
      test(`chrome ${pageDef.name} — ${theme} ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(pageDef.path, { waitUntil: "load" });
        await waitForHydration(page);

        await applyTheme(page, theme);
        await freezeForScreenshot(page);

        await waitForLayoutSettled(page);

        await expect(page).toHaveScreenshot(
          `${pageDef.name}-${theme}-${viewport.name}.png`,
          {
            fullPage: true,
            animations: "disabled",
            caret: "hide",
            mask: masksFor(page),
            // Same rationale as gallery-visual.spec.ts: these pages are
            // tall full-page captures, the default 5s stable-screenshot
            // budget is not enough on a loaded runner.
            timeout: 30_000,
            // Pixel-exact, matching gallery-visual.spec.ts. Do not raise
            // to silence a red run — see AGENTS.md "Gallery visual guard".
            maxDiffPixels: 0,
          }
        );
      });
    }
  }
}
