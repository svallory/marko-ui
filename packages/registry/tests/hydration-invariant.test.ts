/**
 * Hydration-invariant suite (design constraint C-4).
 *
 * For every interactive (Zag-backed) component route, the accessibility-relevant
 * attribute surface rendered by the server must survive hydration untouched.
 * See ./helpers/hydration-invariant.ts for the comparison method and the exact
 * set of attributes under test.
 *
 * Requires the docs dev server on http://localhost:3000 (override with
 * DOCS_BASE_URL). These are integration tests against the real SSR + resume
 * pipeline — there is no meaningful way to fake it.
 */
import { describe, expect, it } from "vitest";
import {
  assertHydrationInvariant,
  formatDifference,
  type AllowedDifference,
  type AllowedElementCountChange,
} from "./helpers/hydration-invariant.ts";

/** The 31 Zag-machine-backed components with demo routes. */
const INTERACTIVE_COMPONENTS = [
  "accordion",
  "alert-dialog",
  "avatar",
  "calendar",
  "carousel",
  "checkbox",
  "clipboard",
  "collapsible",
  "combobox",
  "command",
  "context-menu",
  "date-picker",
  "dialog",
  "drawer",
  "dropdown-menu",
  "file-upload",
  "hover-card",
  "input-otp",
  "menubar",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "select",
  "sheet",
  "slider",
  "switch",
  "tabs",
  "toggle-group",
  "tooltip",
  "tree-view",
  "toast",
] as const;

/**
 * Tolerated SSR/hydration divergences.
 *
 * Every entry states WHY the divergence is correct behavior rather than a bug.
 * An empty array for a component means it must match byte-for-byte on the
 * compared attribute surface.
 */
const ALLOWED_DIFFERENCES: Partial<Record<string, AllowedDifference[]>> = {
  avatar: [
    {
      scope: "avatar",
      part: "image",
      attributeName: "*",
      // Zag's avatar `loaded` flag is `state.matches("loaded")`, entered only
      // when the browser fires the image's load event. The server has no
      // network fetch, so it necessarily renders the pre-load state: image
      // hidden, fallback visible. After hydration the real <img> loads and the
      // states swap. This is the intended progressive-enhancement contract —
      // the fallback is what a no-JS visitor is supposed to see.
      reason:
        "avatar image/fallback visibility depends on the browser image load event, which cannot occur during SSR.",
    },
    {
      scope: "avatar",
      part: "fallback",
      attributeName: "*",
      reason:
        "Counterpart of the image entry above: fallback is visible until the image load event fires client-side.",
    },
  ],
  combobox: [
    {
      scope: "combobox",
      part: "content",
      attributeName: "data-placement",
      // `currentPlacement` is undefined until the popper positioning effect
      // runs, which measures trigger/content rects through floating-ui and so
      // requires layout. SSR emits no value; the client resolves "bottom".
      reason:
        "popper placement is resolved by measuring element rects on the client; SSR has no layout to measure.",
    },
    {
      scope: "combobox",
      part: "content",
      attributeName: "data-side",
      reason:
        "Derived from the same measured popper placement as data-placement above.",
    },
  ],
  // The command palette is built on the combobox machine, so its content part
  // carries the same measured-popper placement attributes.
  command: [
    {
      scope: "combobox",
      part: "content",
      attributeName: "data-placement",
      reason:
        "command is combobox-backed; popper placement is measured client-side and absent from SSR.",
    },
    {
      scope: "combobox",
      part: "content",
      attributeName: "data-side",
      reason: "Derived from the same measured popper placement as data-placement above.",
    },
  ],
  carousel: [
    {
      scope: "carousel",
      part: "item",
      attributeName: "aria-hidden",
      // `data-inview` / `aria-hidden` track which slides are actually within
      // the scroll viewport, computed by an IntersectionObserver after mount.
      // SSR marks every non-first slide hidden; the client corrects it once it
      // can measure which slides are genuinely visible.
      reason:
        "slide in-view state comes from an IntersectionObserver that only exists client-side.",
    },
    {
      scope: "carousel",
      part: "item",
      attributeName: "data-inview",
      reason:
        "Counterpart of aria-hidden above: in-view tracking requires a real scroll viewport.",
    },
    {
      scope: "carousel",
      part: "indicator",
      attributeName: "*",
      // The indicator list length is driven by `api().pageSnapPoints`. On the
      // server that value is Zag's arithmetic estimate from slideCount /
      // slidesPerPage. On the client, the machine's `setSnapPoints` action
      // replaces it with the positions actually measured off the laid-out
      // item-group via getScrollSnapPositions() — which needs a real DOM.
      //
      // For the "Multiple slides per page" demo (5 slides, slidesPerPage=2) the
      // server estimate is 2 pages because Zag's loop drops a trailing partial
      // page (`if (i + slidesPerPage > totalSlides) break`), while the measured
      // layout correctly yields 3 reachable snap positions (viewport 384px,
      // scrollWidth 960px, 192px slides). The hydrated value is the accurate
      // one; SSR cannot reach it without layout. Measurement-dependent by
      // design, not a markup bug.
      reason:
        "pageSnapPoints is re-derived from measured scroll-snap positions on machine start; SSR only has the arithmetic estimate.",
    },
  ],
};

/**
 * Tolerated changes in the NUMBER of rendered parts. Structural, so signed off
 * separately from attribute divergences.
 */
const ALLOWED_ELEMENT_COUNT_CHANGES: Partial<Record<string, AllowedElementCountChange[]>> = {
  carousel: [
    {
      scope: "carousel",
      part: "indicator",
      // The "Multiple slides per page" demo (5 slides, slidesPerPage=2) renders
      // 2 indicators on the server and 3 after hydration. Indicators are driven
      // by `api().pageSnapPoints`, which the machine's `setSnapPoints` action
      // replaces on start with positions measured off the laid-out item-group
      // via getScrollSnapPositions(). Zag's SSR-side arithmetic estimate drops
      // the trailing partial page (`if (i + slidesPerPage > totalSlides) break`),
      // whereas the measured layout (viewport 384px, scrollWidth 960px, 192px
      // slides) correctly exposes 3 reachable pages. The hydrated count is the
      // accurate one and SSR cannot reach it without layout.
      reason:
        "indicator count derives from measured scroll-snap positions; the SSR arithmetic estimate omits the trailing partial page.",
    },
  ],
};

describe("hydration invariant (C-4): SSR attributes survive hydration", () => {
  for (const componentName of INTERACTIVE_COMPONENTS) {
    it(
      `${componentName} renders identical scoped attributes before and after hydration`,
      { timeout: 60_000 },
      async () => {
        const result = await assertHydrationInvariant(
          componentName,
          ALLOWED_DIFFERENCES[componentName] ?? [],
          ALLOWED_ELEMENT_COUNT_CHANGES[componentName] ?? [],
        );

        if (result.failureMessage) {
          expect.fail(`${componentName}\n${result.failureMessage}`);
        }

        // Guard against a route that silently stopped rendering any machine
        // parts — that would make the comparison vacuously pass.
        expect(
          result.comparison.serverElements.length,
          `${componentName} rendered no [data-scope] elements server-side`,
        ).toBeGreaterThan(0);

        // Surface whitelisted hits so a stale exception is visible in output
        // rather than quietly protecting a bug that no longer exists.
        if (result.whitelistedDifferences.length > 0) {
          const summary = result.whitelistedDifferences.map(formatDifference).join("\n  ");
          console.info(
            `${componentName}: ${result.whitelistedDifferences.length} whitelisted difference(s)\n  ${summary}`,
          );
        }
      },
    );
  }
});
