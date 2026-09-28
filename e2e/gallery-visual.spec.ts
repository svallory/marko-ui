/**
 * Gallery visual-regression guard — one full-page screenshot per visual
 * style × theme, covering every style the registry ships.
 *
 * WHY THIS SHAPE
 * --------------
 * There is no `/gallery/<style>` route in this app, and there deliberately
 * isn't one: the per-style `/verify/<style>/<component>` tree that used to
 * serve this purpose was removed in 858cf016 (#23) precisely because it was
 * a generated per-style copy of every demo. This guard therefore builds its
 * gallery *virtually*, with no new app surface:
 *
 *   1. Navigate to `/create/preview`, the chrome-free showcase route the
 *      /create customizer drives through an iframe. Each of its three
 *      `item` pages is a dashboard-style composition of real registry
 *      components (see apps/docs/src/routes/create/preview/+page.marko).
 *   2. Swap the `style-*` class on <body>. Applying a style is nothing but
 *      a class on an ancestor — all 8 style layers are imported site-wide
 *      in app.css, and home-showcase.marko:36 already nests `style-rhea`
 *      inside the `style-nova` body in production. The class swap here is
 *      the same mechanism the real customizer uses (applyParams() in
 *      create/preview/+page.marko), just driven from the test instead of
 *      from a postMessage.
 *   3. Screenshot the whole page.
 *
 * The style list is imported from the CLI's registry constants — the single
 * source of truth for which styles ship (currently 8). Adding a style there
 * adds its baselines here automatically, and the count assertion below
 * fails loudly if this file ever drifts from the registry.
 *
 * DETERMINISM
 * -----------
 * Baselines are generated and compared on the CI runner only (Linux), never
 * locally: macOS and Linux disagree on font rasterisation and antialiasing,
 * so a macOS-recorded baseline can never match a Linux run. `snapshotPathTemplate`
 * in playwright.config.ts keeps the `{platform}` suffix for THIS spec's
 * snapshots (unlike the DOM-text snapshots the old matrix used), so a stray
 * darwin baseline can never be silently compared against a linux run.
 *
 * Everything nondeterministic is frozen rather than masked where possible —
 * see freezeForScreenshot() below. Never regenerate these with a local
 * `--update-snapshots`; see AGENTS.md "Gallery visual guard" for the
 * CI-side update path.
 */
import { expect, test, type Page } from "@playwright/test";
import { VISUAL_STYLES } from "../packages/marko-ui/src/registry/constants";
import {
  applyStyle,
  applyTheme,
  freezeForScreenshot,
  waitForHydration,
  waitForLayoutSettled,
} from "./visual-helpers";

/**
 * The showcase pages of /create/preview. Each renders a different
 * composition of real components, so together they cover far more of the
 * registry's surface than any single page would.
 */
const PREVIEW_ITEMS = ["preview-page-1", "preview-page-2", "preview-page-3"] as const;

const THEMES = ["light", "dark"] as const;

/**
 * `new-york` IS now guarded (issue #75, 2026-09-28) via chrome-visual.spec.ts,
 * not this file: it is still not offered in /create's own style picker
 * (registry-config.ts's STYLES list, ported from upstream's
 * apps/v4/registry/styles.tsx, which doesn't list new-york-v4 either), so
 * `/create/preview` — the page this spec screenshots — genuinely cannot
 * render a `.style-new-york` body class; applying one here would assert a
 * combination no real user-facing surface produces. new-york IS applied for
 * real on the docs site chrome, /blocks and /charts (site-header.marko,
 * site-footer.marko, blocks-gallery.marko, charts-gallery.marko all set
 * `class="style-new-york"` directly), which is what chrome-visual.spec.ts
 * covers instead. Any future style added to VISUAL_STYLES that IS offered in
 * /create must be added here too, on purpose (see the array-equality guard
 * below).
 */
const GUARDED_STYLES = VISUAL_STYLES.filter((style) => style.name !== "new-york");

/**
 * Guard against this spec silently losing coverage if VISUAL_STYLES is
 * edited. The registry ships 8 /create-offered styles (+ new-york, excluded
 * above); a change to that set is a deliberate act that should also be a
 * deliberate baseline change, not a quiet drop.
 */
test("the style list this guard covers matches the registry", () => {
  expect(GUARDED_STYLES.map((style) => style.name)).toEqual([
    "rhea",
    "nova",
    "vega",
    "lyra",
    "maia",
    "mira",
    "luma",
    "sera",
  ]);
});

/**
 * Regions that cannot be frozen with CSS because JavaScript writes their
 * geometry directly on every animation frame. Masking (a flat overlay) is
 * the only option for these; everything else on the page is frozen instead,
 * so the masked area stays as small as possible.
 *
 * - "Audio Frequency Visualizer" (preview-page-3's bar-visualizer card)
 *   computes each bar's height from `Math.sin(Date.now()/1000) +
 *   Math.random()` inside a requestAnimationFrame loop and writes it as an
 *   inline style. Measured: before this mask, 5 of preview-page-3's 16
 *   screenshots differed between two runs of the same commit.
 * - The marquee translates on a CSS animation. The freeze CSS already pauses
 *   it, but it is masked too because the pause can land on a subpixel
 *   offset depending on when the style tag is applied.
 * - The "Seats Held" card's `timer` runs an autoStart countdown that rewrites
 *   a `--value` custom property once a second (measured: 37 -> 36 over a
 *   900ms sample). Only the timer element is masked, not its card, so the
 *   card's own chrome still participates.
 *
 * All three still assert their surrounding card chrome (border, radius,
 * padding, header) — which is what the style layers actually change — so
 * masking these costs the guard nothing it was built to catch.
 */
function masksFor(page: Page) {
  return [
    page.locator('[data-slot="card"]').filter({ hasText: "Audio Frequency Visualizer" }),
    page.locator('[data-slot="marquee"]'),
    page.locator('[data-slot="timer"]'),
  ];
}

for (const item of PREVIEW_ITEMS) {
  for (const style of GUARDED_STYLES) {
    for (const theme of THEMES) {
      test(`gallery ${item} — ${style.name} ${theme}`, async ({ page }) => {
        await page.goto(`/create/preview?item=${item}`, { waitUntil: "load" });
        await waitForHydration(page);

        await applyStyle(page, style.name);
        await applyTheme(page, theme);
        await freezeForScreenshot(page);

        await waitForLayoutSettled(page);

        await expect(page).toHaveScreenshot(`${item}-${style.name}-${theme}.png`, {
          fullPage: true,
          animations: "disabled",
          caret: "hide",
          mask: masksFor(page),
          // Playwright re-shoots until two consecutive captures match before
          // it compares anything. These pages are tall (~1800px full-page)
          // and the default 5s budget for that settling is not enough on a
          // loaded runner — the failure reads "Failed to take two
          // consecutive stable screenshots", which is a capture timeout, not
          // a pixel mismatch. Measured: with the masks above, two captures
          // of page-3 are already byte-identical (0 differing pixels), so
          // the extra budget only buys time, never tolerance.
          timeout: 30_000,
          // Pixel-exact. If a future CI change makes this genuinely
          // impossible, raise it with a measurement from 3 consecutive runs
          // in the PR — do not bump it to silence one red run.
          maxDiffPixels: 0,
        });
      });
    }
  }
}
