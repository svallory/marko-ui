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

/**
 * The 33 Zag-machine-backed components currently covered by this suite.
 *
 * NOT the full set. packages/shadcn/ui/ holds 54 Zag-backed components (54
 * component directories contain both a <service> and a <connect> tag; 53 of
 * those also carry <machine-props> — `toast` is the lone exception, a
 * client-only group store that is Zag-backed by <service>/<connect> alone).
 * All 54 have demo directories under apps/docs/src/demos/.
 *
 * 33 are listed below, so 21 are uncovered — a real coverage gap in
 * constraint C-4, not a deliberate exclusion:
 *
 *   angle-slider, cascade-select, color-picker, date-input, editable,
 *   floating-panel, image-cropper, listbox, marquee, navigation-menu,
 *   number-input, password-input, qr-code, rating-group, scroll-area,
 *   signature-pad, steps, tags-input, timer, toc, tour
 *
 * (54 Zag-backed − 33 covered = 21, matching that list exactly.)
 *
 * Add a component here once its route is verified; several of the above are
 * measurement-heavy (color-picker, image-cropper, signature-pad, floating-panel)
 * and will likely need ALLOWED_DIFFERENCES entries the way carousel does.
 */
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
    {
      scope: "combobox",
      part: "content",
      attributeName: "data-has-nested",
      // Set by @zag-js/dismissable's layer-stack module (layer-stack.mjs):
      // when a dismissable layer (popover/dialog/combobox content, etc.) mounts,
      // it registers itself in a page-wide, in-memory layer stack and marks
      // itself `data-has-nested="<type>"` (plus a `--nested-layer-count` CSS
      // var) if OTHER layers are already registered on top of it. This
      // registry only exists client-side — there is no way to know "how many
      // other dismissable layers are open elsewhere on the page" during SSR,
      // since SSR renders each route in isolation with no shared runtime.
      //
      // The command demo route hardcodes `open=true` on all 4 Command demos
      // (default.marko's `open=true` on <machine-props>, so the palette is
      // always visible for documentation purposes) instead of gating on real
      // user interaction, so all 4 combobox content layers mount simultaneously
      // and the layer stack detects nesting on the first one client-side. A
      // route with normally-triggered (click-to-open) layers would not hit
      // this, since only one layer is ever open at a time.
      reason:
        "layer-stack nesting detection requires a client-side, page-wide layer registry that cannot exist during SSR; this route's demos intentionally keep several combobox layers open at once.",
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
    {
      scope: "carousel",
      part: "next-trigger",
      attributeName: "disabled",
      // `canScrollNext` (which drives the next-trigger's `disabled` attribute)
      // is `page < pageSnapPoints.length - 1`, i.e. it is derived from the same
      // `pageSnapPoints` estimate documented on the indicator entry above.
      //
      // The "Spacing" demo (5 slides, slidesPerPage=3) hits the arithmetic
      // estimate's edge case directly: `if (i + slidesPerPage > totalSlides)
      // break` yields exactly ONE page server-side (3 + 3 > 5), so
      // pageSnapPoints.length === 1 and canScrollNext is false — SSR renders
      // next-trigger disabled. The measured client-side layout finds a second,
      // partial-page snap position, so pageSnapPoints.length === 2 post-hydration
      // and the trigger becomes enabled. Same measurement-dependent mechanism as
      // the indicator entry, surfacing through a derived attribute instead of
      // element count.
      reason:
        "next-trigger's disabled state is derived from pageSnapPoints.length, which is only an arithmetic estimate at SSR and is corrected by client-side measurement on machine start.",
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
