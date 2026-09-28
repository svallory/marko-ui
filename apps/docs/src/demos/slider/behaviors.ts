// Behavior list for Slider (round 2a, reviewed against @zag-js/slider and the WAI-ARIA Slider (Multi-Thumb) pattern).
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "slider/interaction/pointer-drag-sets-value",
    kind: "interaction",
    description: "Dragging a thumb, or clicking the track, sets the value to the pointer position (snapped to step).",
    source: "@zag-js/slider; slider-demo.marko",
  },
  {
    id: "slider/keyboard/arrow-right-left-changes-value",
    kind: "keyboard",
    description: "ArrowRight increases and ArrowLeft decreases the value by one step.",
    source: "WAI-ARIA APG slider pattern",
  },
  {
    id: "slider/keyboard/cross-axis-arrows-ignored",
    kind: "keyboard",
    description: "On a horizontal slider ArrowUp/ArrowDown do not change the value.",
    source: "@zag-js/slider Props.orientation",
  },
  {
    id: "slider/keyboard/home-end-jump-to-bounds",
    kind: "keyboard",
    description: "Home/End set the value to min/max.",
    source: "WAI-ARIA APG slider pattern",
  },
  {
    id: "slider/keyboard/value-clamped-at-bounds",
    kind: "keyboard",
    description: "Stepping past min or max leaves the value at the bound.",
    source: "WAI-ARIA APG slider pattern",
  },
  {
    id: "slider/keyboard/page-up-down-larger-step",
    kind: "keyboard",
    description: "PageUp/PageDown change the value by more than one step.",
    source: "WAI-ARIA APG slider pattern; Props.largeStep",
  },
  {
    id: "slider/keyboard/step-quantizes-movement",
    kind: "keyboard",
    description: "Keyboard movement advances in `step` increments.",
    source: "@zag-js/slider Props.step; slider-step.marko",
  },
  {
    id: "slider/keyboard/range-thumbs-independent",
    kind: "keyboard",
    description: "In a range slider each thumb is independently keyboard-operable.",
    source: "WAI-ARIA APG multi-thumb slider; slider-range.marko",
  },
  {
    id: "slider/keyboard/lower-thumb-cannot-pass-upper",
    kind: "keyboard",
    description: "The lower range thumb cannot move past the upper one.",
    source: "@zag-js/slider Props.thumbCollisionBehavior; slider-range.marko",
  },
  {
    id: "slider/a11y/role-slider-with-value-range",
    kind: "a11y",
    description: "Each thumb has role=\"slider\" with aria-valuemin, aria-valuemax and a current value.",
    source: "WAI-ARIA APG slider pattern",
  },
  {
    id: "slider/api/default-value",
    kind: "api",
    description: "`defaultValue` sets the initial thumb value(s).",
    source: "@zag-js/slider Props.defaultValue; slider-demo.marko",
  },
  {
    id: "slider/api/disabled-blocks-input",
    kind: "api",
    description: "`disabled` removes the thumb from the tab order and ignores arrow keys.",
    source: "@zag-js/slider Props.disabled; slider-disabled.marko",
  },
  {
    id: "slider/api/controlled-value",
    kind: "api",
    description: "A controlled `value` follows keyboard changes through `valueChange`.",
    source: "@zag-js/slider Props.value; slider-controlled.marko",
  },
  {
    id: "slider/api/orientation-vertical",
    kind: "api",
    description: "`orientation=\"vertical\"` lays the slider out vertically and maps ArrowUp/ArrowDown to the value.",
    source: "@zag-js/slider Props.orientation; slider-vertical.marko",
  },
  {
    id: "slider/api/rtl-reverses-direction",
    kind: "api",
    description: "Under `dir=\"rtl\"` ArrowRight/ArrowLeft and the track direction reverse.",
    source: "@zag-js/slider Props.dir; slider-rtl.marko",
  },
  {
    id: "slider/api/form-submission-value",
    kind: "api",
    description: "Hidden inputs carry `name`/`form` so the value submits with a native form.",
    source: "@zag-js/slider Props.name/form",
  },
  {
    id: "slider/api/read-only-blocks-change",
    kind: "api",
    description: "`readOnly` keeps the thumb focusable but ignores changes.",
    source: "@zag-js/slider Props.readOnly",
  },
  {
    id: "slider/api/aria-value-text",
    kind: "api",
    description: "`getAriaValueText` customizes the announced aria-valuetext.",
    source: "@zag-js/slider Props.getAriaValueText",
  },
  {
    id: "slider/a11y/structurally-valid-aria",
    kind: "a11y",
    description: "The hero demo's rendered markup has well-formed roles/aria-* attributes and an accessible name where one is required (structural validity only; says nothing about values tracking state).",
    source: "WAI-ARIA APG; scripts/ci/axe-scan.ts scans the slider hero demo",
  },
  {
    id: "slider/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS",
  },
  {
    id: "slider/visual/rtl-mirrors",
    kind: "visual",
    description: "Under dir=\"rtl\" the component renders mirrored via logical properties.",
    source: "slider-rtl.marko",
  },
];
