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

/**
 * The showcase pages of /create/preview. Each renders a different
 * composition of real components, so together they cover far more of the
 * registry's surface than any single page would.
 */
const PREVIEW_ITEMS = ["preview-page-1", "preview-page-2", "preview-page-3"] as const;

const THEMES = ["light", "dark"] as const;

/**
 * Guard against this spec silently losing coverage if VISUAL_STYLES is
 * edited. The registry ships 8 styles; a change to that set is a deliberate
 * act that should also be a deliberate baseline change, not a quiet drop.
 */
test("the style list this guard covers matches the registry", () => {
  expect(VISUAL_STYLES.map((style) => style.name)).toEqual([
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
 * Freeze everything that would otherwise differ between two runs of the
 * same commit. This is done with injected CSS + DOM writes rather than by
 * editing the demos, so the guard never changes what ships.
 */
async function freezeForScreenshot(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      /* Animations and transitions: a screenshot taken mid-transition
         differs run to run. Freeze rather than disable so elements land in
         their final state instead of their initial one. */
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        animation-iteration-count: 1 !important;
        animation-play-state: paused !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      /* Caret blink in any focused text input. */
      * { caret-color: transparent !important; }
      /* Marquee-style scrollers translate on a timer. */
      [data-slot="marquee"] *, .mu-marquee * {
        animation-play-state: paused !important;
        transform: none !important;
      }
      /* Focus rings depend on which element the browser happened to focus
         first; the guard is about style layers, not focus state. */
      *:focus, *:focus-visible { outline: none !important; box-shadow: none !important; }

      /* The accordion animates height from 0 to a value a ResizeObserver
         measures at runtime (--marko-accordion-content-height, see
         packages/shadcn/styles/marko-accordion.css). The observer callback
         can land on either side of a capture, so the panel is caught
         mid-open: measured as a real 2,640-pixel diff between two runs of
         the same commit, localised to the accordion card. Pinning the
         animation to its final frame removes the race without hiding the
         component — the accordion's open panel is still fully asserted. */
      [data-slot="accordion-content"] {
        animation: none !important;
        transition: none !important;
      }
      [data-slot="accordion-content"][data-state="open"] {
        height: var(--marko-accordion-content-height, auto) !important;
      }
      [data-slot="accordion-content"][data-state="closed"] {
        height: 0 !important;
      }
    `,
  });

  // Blur whatever autofocused, so no element renders in a focused state.
  await page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  });
}

/** Apply a visual style the same way the real customizer does. */
async function applyStyle(page: Page, style: string): Promise<void> {
  await page.evaluate((name) => {
    const body = document.body;
    for (const className of Array.from(body.classList)) {
      if (className.startsWith("style-")) body.classList.remove(className);
    }
    body.classList.add(`style-${name}`);
  }, style);
}

/** Apply a theme the same way +layout.marko's inline boot script does. */
async function applyTheme(page: Page, theme: "light" | "dark"): Promise<void> {
  await page.evaluate((name) => {
    document.documentElement.classList.toggle("dark", name === "dark");
  }, theme);
}

/**
 * Wait for Marko resumption — the same signal scripts/ci/axe-scan.ts and the
 * behavior-test helpers use. Screenshotting before hydration captures the
 * SSR paint, which differs from the hydrated one for components whose Zag
 * machine writes attributes on mount.
 */
async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => document.querySelector("[data-ssr]") === null, undefined, {
    timeout: 15_000,
  });
  await page.evaluate(() => document.fonts.ready);
  // Let any ResizeObserver that publishes a measured size (the accordion's
  // content height, chart containers) deliver its callback and settle
  // before anything is captured.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
}

/**
 * Block until the page's geometry stops changing, instead of guessing with a
 * fixed sleep.
 *
 * The style swap rewrites radius, padding, border widths and font weights, so
 * the whole page reflows; the accordion's ResizeObserver then republishes its
 * measured content height off the back of that reflow. A fixed `waitForTimeout`
 * is a bet that all of it finishes within N milliseconds — one that held on a
 * developer laptop and lost on the CI runner, where it produced a 4,102-pixel
 * diff on `preview-page-1 — mira dark` (and only that one, which is what a race
 * looks like: the same 24-sample probe finds the settled page perfectly stable).
 *
 * So sample the real thing instead: the full-document scroll size plus every
 * element's box, and require it to hold identical across consecutive frames
 * before returning. Bounded by a timeout so a genuinely animating page fails
 * the test rather than hanging it.
 */
async function waitForLayoutSettled(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const w = window as unknown as { __settle?: { last: string; count: number } };
      const signature = [
        document.documentElement.scrollWidth,
        document.documentElement.scrollHeight,
        ...Array.from(document.querySelectorAll("*")).map((el) => {
          const r = el.getBoundingClientRect();
          return `${r.x}:${r.y}:${r.width}:${r.height}`;
        }),
      ].join("|");

      const state = (w.__settle ??= { last: "", count: 0 });
      state.count = signature === state.last ? state.count + 1 : 0;
      state.last = signature;
      // Three identical consecutive frames — one repeat can happen by luck
      // between two writes in the same frame budget.
      return state.count >= 3;
    },
    undefined,
    { timeout: 20_000, polling: "raf" }
  );
}

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
  for (const style of VISUAL_STYLES) {
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
