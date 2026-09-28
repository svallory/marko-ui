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
import { BASE_COLORS as REGISTRY_BASE_COLORS } from "../apps/docs/src/tags/create/lib/registry-config";
import {
  applyBaseColor,
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

/**
 * OVERLAYS-OPEN GUARD (AGENTS.md "Gallery visual guard" follow-up #1)
 * -------------------------------------------------------------------
 * preview-page-4 (apps/docs/src/tags/create/preview-blocks/preview-page-4)
 * renders one instance each of 6 non-modal overlay/portal components
 * (popover, hover-card, command, context-menu, menubar, navigation-menu —
 * command is always-open by construction, no trigger needed) plus 4 modal
 * ones (dialog, alert-dialog, sheet, drawer). Every one is opened here via
 * real user interaction on its trigger — never a demo "start open" prop —
 * per AGENTS.md's determinism rules.
 *
 * EVERY overlay is captured as an isolated per-component element screenshot
 * (open alone, screenshot just its content slot, close before the next
 * opens) — NOT the "open several at once, one full-page shot" shape the
 * other 3 pages use. That shape was tried first and measured broken:
 * clicking Menubar's trigger is a real click elsewhere on the page, which
 * Popover/HoverCard/ContextMenu's outside-click-to-close detection reacts
 * to — verified with an isolated debug run: after clicking Menubar's "File"
 * trigger, Popover/HoverCard/ContextMenu's content-slot count all dropped to
 * 0, and Navigation-menu's click then closed Menubar the same way. Several
 * non-modal overlays sharing one page is exactly the collision risk AGENTS.md
 * calls out; per-component isolation is the fix, same principle the 4 modal
 * captures already use for a stronger reason (their backdrops cover the
 * whole viewport).
 *
 * Popover keeps the full 8-style x light/dark treatment (the highest-risk
 * case for a style-layer regression: @zag-js/popper positioning plus the
 * content's own spacing/radius tokens). The other 5 non-modal overlays and
 * all 4 modals are nova-only x light/dark, per the lead's shot-budget call
 * (see AGENTS.md for the full matrix and the +10 overshoot from this
 * redesign).
 *
 * toast/sonner and tour are NOT covered — see AGENTS.md for why.
 */
const OVERLAY_ITEM = "preview-page-4";

/** Non-modal overlay name -> [how to open it, open content data-slot]. */
const NON_MODAL_OVERLAYS = [
  ["popover", async (page: Page) => page.getByRole("button", { name: "Open Popover" }).click(), "popover-content"],
  ["hover-card", async (page: Page) => page.getByRole("link", { name: "@marko-ui" }).hover(), "hover-card-content"],
  ["context-menu", async (page: Page) =>
    page
      .locator('[data-overlay-card="context-menu"]')
      .getByText("Right click here")
      .click({ button: "right" }), "context-menu-content"],
  ["menubar", async (page: Page) => page.getByRole("button", { name: "File", exact: true }).click(), "menubar-content"],
  ["navigation-menu", async (page: Page) => page.getByRole("button", { name: "Getting Started" }).click(), "navigation-menu-content"],
] as const;

/** Command has no trigger — it renders its listbox open by construction
 *  (an inline list, not a popover/dialog) — so it needs no open step and is
 *  captured directly by locating its own content, nova-only, no separate
 *  loop entry needed beyond a fixed content-slot selector. */
const COMMAND_CONTENT_SLOT = '[data-overlay-card="command"] [data-slot="command"]';

async function captureNonModalOverlay(
  page: Page,
  open: (page: Page) => Promise<void>,
  contentSlot: string,
): Promise<import("@playwright/test").Locator> {
  await open(page);
  const content = page.locator(`[data-slot="${contentSlot}"]`);
  await content.waitFor({ state: "visible" });
  // Positioning (@zag-js/popper) computes the floating panel's placement
  // asynchronously after open — wait for its geometry to stop changing, the
  // same signature waitForLayoutSettled uses for the whole page, scoped to
  // just this content slot.
  await page.waitForFunction(
    (sel) => {
      const w = window as unknown as { __overlayContentSettle?: { last: string; count: number } };
      const el = document.querySelector(sel);
      const r = el?.getBoundingClientRect();
      const signature = r ? `${r.x}:${r.y}:${r.width}:${r.height}` : "";
      const state = (w.__overlayContentSettle ??= { last: "", count: 0 });
      state.count = signature && signature === state.last ? state.count + 1 : 0;
      state.last = signature;
      return Boolean(signature) && state.count >= 3;
    },
    `[data-slot="${contentSlot}"]`,
    { timeout: 20_000, polling: "raf" },
  );
  return content;
}

for (const style of GUARDED_STYLES) {
  for (const theme of THEMES) {
    test(`overlays open ${OVERLAY_ITEM} — popover ${style.name} ${theme}`, async ({ page }) => {
      await page.goto(`/create/preview?item=${OVERLAY_ITEM}`, { waitUntil: "load" });
      await waitForHydration(page);

      await applyStyle(page, style.name);
      await applyTheme(page, theme);
      await freezeForScreenshot(page);
      await waitForLayoutSettled(page);

      const [, open, contentSlot] = NON_MODAL_OVERLAYS[0];
      const content = await captureNonModalOverlay(page, open, contentSlot);

      await expect(content).toHaveScreenshot(`overlays-open-popover-${style.name}-${theme}.png`, {
        animations: "disabled",
        caret: "hide",
        timeout: 30_000,
        maxDiffPixels: 0,
      });
    });
  }
}

for (const theme of THEMES) {
  test(`overlays open ${OVERLAY_ITEM} — command nova ${theme}`, async ({ page }) => {
    await page.goto(`/create/preview?item=${OVERLAY_ITEM}`, { waitUntil: "load" });
    await waitForHydration(page);

    await applyStyle(page, "nova");
    await applyTheme(page, theme);
    await freezeForScreenshot(page);
    await waitForLayoutSettled(page);

    const content = page.locator(COMMAND_CONTENT_SLOT);
    await expect(content).toHaveScreenshot(`overlays-open-command-nova-${theme}.png`, {
      animations: "disabled",
      caret: "hide",
      timeout: 30_000,
      maxDiffPixels: 0,
    });
  });

  for (const [name, open, contentSlot] of NON_MODAL_OVERLAYS.slice(1)) {
    test(`overlays open ${OVERLAY_ITEM} — ${name} nova ${theme}`, async ({ page }) => {
      await page.goto(`/create/preview?item=${OVERLAY_ITEM}`, { waitUntil: "load" });
      await waitForHydration(page);

      await applyStyle(page, "nova");
      await applyTheme(page, theme);
      await freezeForScreenshot(page);
      await waitForLayoutSettled(page);

      const content = await captureNonModalOverlay(page, open, contentSlot);

      await expect(content).toHaveScreenshot(`overlays-open-${name}-nova-${theme}.png`, {
        animations: "disabled",
        caret: "hide",
        timeout: 30_000,
        maxDiffPixels: 0,
      });
    });
  }
}

/** Modal name -> [trigger accessible name, open content data-slot]. */
const MODAL_OVERLAYS = [
  ["dialog", "Edit Profile", "dialog-content"],
  ["alert-dialog", "Show Dialog", "alert-dialog-content"],
  ["sheet", "Open", "sheet-content"],
  ["drawer", "Open Drawer", "drawer-content"],
] as const;

for (const theme of THEMES) {
  for (const [name, triggerLabel, contentSlot] of MODAL_OVERLAYS) {
    test(`overlays open ${OVERLAY_ITEM} — modal ${name} nova ${theme}`, async ({ page }) => {
      await page.goto(`/create/preview?item=${OVERLAY_ITEM}`, { waitUntil: "load" });
      await waitForHydration(page);

      await applyStyle(page, "nova");
      await applyTheme(page, theme);
      await freezeForScreenshot(page);
      await waitForLayoutSettled(page);

      await page.getByRole("button", { name: triggerLabel, exact: true }).click();
      const content = page.locator(`[data-slot="${contentSlot}"]`);
      await content.waitFor({ state: "visible" });
      await waitForLayoutSettled(page);

      await expect(content).toHaveScreenshot(`overlays-open-modal-${name}-nova-${theme}.png`, {
        animations: "disabled",
        caret: "hide",
        timeout: 30_000,
        maxDiffPixels: 0,
      });

      // Close before the next test reuses this same page's server render —
      // each test gets a fresh page via goto() above, so this is a
      // defense-in-depth cleanup, not load-bearing for the next iteration.
      await page.keyboard.press("Escape");
    });
  }
}

/**
 * BASE-COLOR GUARD (AGENTS.md "Gallery visual guard" follow-up #2)
 * ------------------------------------------------------------------
 * Production pairs `style-*` with `base-color-*` (applyParams() in
 * create/preview/+page.marko sets both); this guard's style-swap loop above
 * never touched base-color at all. Covers the real 7-name BASE_COLORS axis
 * (registry-config.ts — neutral/stone/zinc/mauve/olive/mist/taupe; NOT the
 * unrelated globals-{zinc,slate,stone,gray}.css files, which are a different,
 * copy-path-only axis with no relationship to /create's base-color picker).
 *
 * Scoped to nova only, on preview-page-1 only, per the lead's shot-budget
 * decision — see AGENTS.md for the full matrix and what remains unguarded
 * (no style x base-color cross-product, no base-color pass on the overlays
 * page).
 *
 * applyBaseColor() (e2e/visual-helpers.ts) drives this through the real
 * `design-system-params` postMessage applyParams() itself listens for — the
 * same mechanism the live /create customizer uses — never a hand-rolled
 * re-implementation of buildRegistryTheme's CSS-var math.
 */
const BASE_COLOR_ITEM = "preview-page-1";
const BASE_COLORS = ["neutral", "stone", "zinc", "mauve", "olive", "mist", "taupe"] as const;

test("the base-color list this guard covers matches the registry", () => {
  expect(REGISTRY_BASE_COLORS.map((c) => c.name)).toEqual([...BASE_COLORS]);
});

for (const baseColor of BASE_COLORS) {
  for (const theme of THEMES) {
    test(`base-color ${BASE_COLOR_ITEM} — ${baseColor} nova ${theme}`, async ({ page }) => {
      await page.goto(`/create/preview?item=${BASE_COLOR_ITEM}`, { waitUntil: "load" });
      await waitForHydration(page);

      await applyStyle(page, "nova");
      await applyTheme(page, theme);
      await applyBaseColor(page, baseColor);
      await freezeForScreenshot(page);
      await waitForLayoutSettled(page);

      await expect(page).toHaveScreenshot(`base-color-${baseColor}-nova-${theme}.png`, {
        fullPage: true,
        animations: "disabled",
        caret: "hide",
        mask: masksFor(page),
        timeout: 30_000,
        maxDiffPixels: 0,
      });
    });
  }
}
