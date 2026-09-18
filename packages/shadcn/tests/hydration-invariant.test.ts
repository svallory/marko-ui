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

// Covered/uncovered component lists live in a plain module so the CI badge
// script can import them; importing a .test.ts executes vitest's describe()
// at module load and throws outside a runner. Re-exported here because this
// file is where they are used and guarded.
import {
  findZagBackedComponents,
  INTERACTIVE_COMPONENTS,
  UI_DIR,
  NON_INVARIANT_BY_DESIGN,
  ZAG_BACKED_COMPONENT_COUNT,
} from "./hydration-coverage.ts";

export { INTERACTIVE_COMPONENTS, NON_INVARIANT_BY_DESIGN, ZAG_BACKED_COMPONENT_COUNT };

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
  // dropdown-menu-avatar.marko nests an Avatar inside the trigger, so it hits
  // the identical image-load-state divergence documented on the `avatar`
  // entry above — same mechanism, different host component.
  "dropdown-menu": [
    {
      scope: "avatar",
      part: "image",
      attributeName: "*",
      reason:
        "avatar image/fallback visibility depends on the browser image load event, which cannot occur during SSR (same as the standalone avatar component).",
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
      // (default.marko's `open=true` on <zag>, so the palette is
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
  "image-cropper": [
    {
      scope: "image-cropper",
      part: "root",
      attributeName: "aria-busy",
      // The machine is "busy" until the source image fires its browser `load`
      // event (entered via `ctx.imageSrc` resolution). SSR has no network
      // fetch, so it necessarily renders the busy state; hydration clears it
      // once the real <img> loads. Same image-load-event class as avatar's
      // image/fallback entries.
      reason:
        "image-cropper's busy flag is cleared by the browser image load event, which cannot occur during SSR.",
    },
    {
      scope: "image-cropper",
      part: "root",
      attributeName: "aria-description",
      // The description announces the crop geometry ("Crop positioned at X…
      // with a size of W by H"), which the machine only knows after the image
      // has loaded and its natural size plus the default crop rect are
      // measured. SSR announces the "preview loading" placeholder instead.
      reason:
        "the crop-geometry description text depends on the image's loaded natural size and a measured default crop rect; SSR can only announce the loading placeholder.",
    },
    {
      scope: "image-cropper",
      part: "image",
      attributeName: "data-ready",
      // Set when the image element has loaded and its dimensions are known —
      // a client-side measurement milestone that cannot exist during SSR.
      reason:
        "data-ready marks the post-load measured state of the image element; SSR has not (and cannot) load the image.",
    },
    {
      scope: "image-cropper",
      part: "selection",
      attributeName: "aria-valuemax",
      // The selection is a slider-like control whose max is the image's
      // measured width (minus the crop size). SSR has no layout, renders 0,
      // and the client corrects it after the image loads and is measured.
      reason:
        "aria-valuemax is the image's measured width; SSR renders 0 because no measurement can occur without layout.",
    },
    {
      scope: "image-cropper",
      part: "selection",
      attributeName: "aria-valuenow",
      reason:
        "aria-valuenow is the default crop position, resolved from the measured image size after load; SSR renders 0.",
    },
    {
      scope: "image-cropper",
      part: "selection",
      attributeName: "aria-valuetext",
      reason:
        "aria-valuetext narrates the crop rect geometry (position and size), which is only known after client-side measurement of the loaded image.",
    },
    {
      scope: "image-cropper",
      part: "selection",
      attributeName: "data-measured",
      reason:
        "data-measured is set by the machine's post-load measurement pass; it cannot be set during SSR.",
    },
  ],
  "scroll-area": [
    // Every difference below reports scrollbar geometry (which axes overflow,
    // where the thumb is, whether the corner is visible). All of it is derived
    // from measuring the scroll container's real client/scroll dimensions
    // after layout — SSR has no layout, and @zag-js/scroll-area deliberately
    // renders an optimistic "overflow everywhere / corner visible" surface
    // (empty-valued data-overflow-* attributes, corner data-state="visible")
    // that the client corrects once it can measure.
    {
      scope: "scroll-area",
      part: "root",
      attributeName: "data-overflow-x",
      reason:
        "axis overflow flags come from measuring the scroll container's real dimensions; SSR emits an optimistic empty value that the client drops or corrects after measurement.",
    },
    {
      scope: "scroll-area",
      part: "root",
      attributeName: "data-overflow-y",
      reason:
        "axis overflow flags come from measuring the scroll container's real dimensions; SSR emits an optimistic empty value that the client drops or corrects after measurement.",
    },
    {
      scope: "scroll-area",
      part: "viewport",
      attributeName: "data-at-left",
      reason:
        "edge flags (at-left/at-top/…) report scroll position against measured content dimensions; SSR cannot measure scroll offset.",
    },
    {
      scope: "scroll-area",
      part: "viewport",
      attributeName: "data-at-top",
      reason:
        "edge flags report scroll position against measured content dimensions; SSR cannot measure scroll offset.",
    },
    {
      scope: "scroll-area",
      part: "viewport",
      attributeName: "data-overflow-x",
      reason:
        "axis overflow flags come from measuring the scroll container's real dimensions; SSR emits an optimistic empty value that the client drops or corrects after measurement.",
    },
    {
      scope: "scroll-area",
      part: "viewport",
      attributeName: "data-overflow-y",
      reason:
        "axis overflow flags come from measuring the scroll container's real dimensions; SSR emits an optimistic empty value that the client drops or corrects after measurement.",
    },
    {
      scope: "scroll-area",
      part: "content",
      attributeName: "data-overflow-x",
      reason:
        "axis overflow flags come from measuring the scroll container's real dimensions; SSR emits an optimistic empty value that the client drops or corrects after measurement.",
    },
    {
      scope: "scroll-area",
      part: "content",
      attributeName: "data-overflow-y",
      reason:
        "axis overflow flags come from measuring the scroll container's real dimensions; SSR emits an optimistic empty value that the client drops or corrects after measurement.",
    },
    {
      scope: "scroll-area",
      part: "scrollbar",
      attributeName: "data-overflow-x",
      reason:
        "axis overflow flags come from measuring the scroll container's real dimensions; SSR emits an optimistic empty value that the client drops or corrects after measurement.",
    },
    {
      scope: "scroll-area",
      part: "scrollbar",
      attributeName: "data-overflow-y",
      reason:
        "axis overflow flags come from measuring the scroll container's real dimensions; SSR emits an optimistic empty value that the client drops or corrects after measurement.",
    },
    {
      scope: "scroll-area",
      part: "corner",
      attributeName: "data-overflow-x",
      reason:
        "axis overflow flags come from measuring the scroll container's real dimensions; SSR emits an optimistic empty value that the client drops or corrects after measurement.",
    },
    {
      scope: "scroll-area",
      part: "corner",
      attributeName: "data-overflow-y",
      reason:
        "axis overflow flags come from measuring the scroll container's real dimensions; SSR emits an optimistic empty value that the client drops or corrects after measurement.",
    },
    {
      scope: "scroll-area",
      part: "corner",
      attributeName: "data-state",
      // The corner is only visible when BOTH axes overflow, a fact only
      // knowable by measuring. SSR optimistically renders data-state="visible"
      // and the client hides it when one axis doesn't scroll.
      reason:
        "corner visibility requires both axes to overflow, which is only knowable from measured scroll geometry; SSR assumes visible.",
    },
  ],
  toc: [
    // The toc machine is a scroll-spy: it observes the page's headings with an
    // IntersectionObserver and derives which item is active. SSR has no scroll
    // position, no layout, and no registered item nodes, so it renders the
    // pre-observation surface (indicator hidden, no active/current markers).
    {
      scope: "toc",
      part: "indicator",
      attributeName: "hidden",
      // The active-position indicator is hidden until the machine knows which
      // item is active; that requires the client-only IntersectionObserver
      // pass over the headings.
      reason:
        "the active-item indicator only unhides once scroll-spy observation determines the active heading, which requires client-side layout and scroll position.",
    },
    {
      scope: "toc",
      part: "item",
      attributeName: "data-active",
      reason:
        "the active flag comes from scroll-spy observation of the headings; SSR has no scroll position and renders no active item.",
    },
    {
      scope: "toc",
      part: "item",
      attributeName: "data-first",
      reason:
        "first/last flags are computed from the machine's registered item nodes, which only exist once item elements mount client-side.",
    },
    {
      scope: "toc",
      part: "item",
      attributeName: "data-last",
      reason:
        "first/last flags are computed from the machine's registered item nodes, which only exist once item elements mount client-side.",
    },
    {
      scope: "toc",
      part: "link",
      attributeName: "aria-current",
      reason:
        "aria-current=location marks the scroll-spy-active link; the active item is only knowable from client-side observation of scroll position.",
    },
    {
      scope: "toc",
      part: "link",
      attributeName: "data-active",
      reason:
        "the active flag comes from scroll-spy observation of the headings; SSR has no scroll position and renders no active link.",
    },
  ],
};

/**
 * Tolerated changes in the NUMBER of rendered parts. Structural, so signed off
 * separately from attribute divergences.
 */
const ALLOWED_ELEMENT_COUNT_CHANGES: Partial<Record<string, AllowedElementCountChange[]>> = {
  marquee: [
    {
      scope: "marquee",
      part: "content",
      // The marquee duplicates its content ("clones" the item list) until the
      // track is wide enough to loop seamlessly. How many clones are needed
      // depends on the measured width of the rendered items — SSR cannot
      // measure, so it renders the un-cloned item list and the client adds
      // clones after layout. Same measurement-derived count class as the
      // carousel indicator entry.
      reason:
        "marquee clones its content to fill the measured track width; clone count is a measurement result SSR cannot compute.",
    },
    {
      scope: "marquee",
      part: "item",
      reason:
        "item count grows with the cloned content part above; each clone contributes the same items.",
    },
  ],
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

/**
 * Guards the coverage arithmetic the project states publicly ("33 of 54
 * Zag-backed components").
 *
 * Without this, the covered and uncovered lists could drift apart silently —
 * which is how "33/33 identical" ended up on a badge and in the README while
 * 21 components were in fact uncovered.
 */
describe("hydration coverage bookkeeping", () => {
  // The population, read from disk on every run. Everything below compares
  // the hand-maintained lists against THIS, not against each other — the
  // previous version of these tests only asserted
  // `covered.length + uncovered.length === 54`, an arithmetic identity among
  // three hand-edited values that a newly added Zag-backed component in
  // neither list would satisfy happily.
  const onDisk = findZagBackedComponents(UI_DIR);

  it("finds a non-trivial set of Zag-backed components on disk", () => {
    // Guards the guard: a broken glob or a moved ui/ directory would return
    // [] and make every comparison below vacuously satisfiable.
    expect(onDisk.length).toBeGreaterThan(40);
  });

  it("classifies every Zag-backed component on disk as covered or uncovered", () => {
    const classified = new Set<string>([
      ...INTERACTIVE_COMPONENTS,
      ...NON_INVARIANT_BY_DESIGN,
    ]);
    // A new Zag-backed component that nobody added to either list shows up
    // here by name — this is the assertion the old arithmetic check missed.
    const unclassified = onDisk.filter((name) => !classified.has(name));
    expect(
      unclassified,
      `Zag-backed component(s) in packages/shadcn/ui/ missing from both lists in ` +
        `hydration-coverage.ts: ${unclassified.join(", ")}`,
    ).toEqual([]);
  });

  it("lists no component that is not actually Zag-backed on disk", () => {
    const present = new Set(onDisk);
    // The reverse drift: a component renamed, deleted, or migrated off Zag
    // leaves a stale name behind and quietly inflates the denominator.
    const stale = [...INTERACTIVE_COMPONENTS, ...NON_INVARIANT_BY_DESIGN].filter(
      (name) => !present.has(name),
    );
    expect(
      stale,
      `name(s) listed in hydration-coverage.ts with no Zag-backed component ` +
        `directory in packages/shadcn/ui/: ${stale.join(", ")}`,
    ).toEqual([]);
  });

  it("keeps the badge denominator in step with the filesystem", () => {
    // ZAG_BACKED_COMPONENT_COUNT is a literal because scripts/ci/badge.ts is a
    // plain script with no repo checkout to glob. This is what stops that
    // literal going stale: the badge would otherwise keep publishing /54.
    expect(
      ZAG_BACKED_COMPONENT_COUNT,
      "ZAG_BACKED_COMPONENT_COUNT in hydration-coverage.ts no longer matches the " +
        "number of Zag-backed components on disk — update it (the CI badge divides by it)",
    ).toBe(onDisk.length);
  });

  it("never lists a component as both covered and excepted", () => {
    const covered = new Set<string>(INTERACTIVE_COMPONENTS);
    const overlap = NON_INVARIANT_BY_DESIGN.filter((name) => covered.has(name));
    expect(overlap).toEqual([]);
  });

  it("has no duplicates in either list", () => {
    expect(new Set(INTERACTIVE_COMPONENTS).size).toBe(INTERACTIVE_COMPONENTS.length);
    expect(new Set(NON_INVARIANT_BY_DESIGN).size).toBe(NON_INVARIANT_BY_DESIGN.length);
  });
});
