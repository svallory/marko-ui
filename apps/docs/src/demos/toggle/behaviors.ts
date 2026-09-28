// Behavior list for Toggle (round 2a). Toggle is a plain native <button> with local state, not a zag machine.
// No behavior suite, and no hydration-invariant coverage (not Zag-backed): only the axe structural check applies.
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "toggle/interaction/click-toggles-pressed",
    kind: "interaction",
    description: "Clicking the toggle flips pressed on/off (data-state and aria-pressed).",
    source: "toggle.marko onClick; toggle-demo.marko",
  },
  {
    id: "toggle/keyboard/space-enter-toggles-pressed",
    kind: "keyboard",
    description: "Space/Enter on the focused toggle flips pressed (native <button> activation).",
    source: "toggle docs.ts accessibilityKeyboard; toggle.marko",
  },
  {
    id: "toggle/a11y/aria-pressed-always-present",
    kind: "a11y",
    description: "aria-pressed is always rendered as the literal \"true\" or \"false\" (never omitted when off).",
    source: "toggle.marko aria-pressed comment",
  },
  {
    id: "toggle/a11y/structurally-valid-aria",
    kind: "a11y",
    description: "The hero demo's rendered markup has well-formed roles/aria-* attributes and an accessible name (structural validity only; says nothing about values tracking state).",
    source: "scripts/ci/axe-scan.ts scans the toggle hero demo",
  },
  {
    id: "toggle/api/disabled-blocks-toggle",
    kind: "api",
    description: "`disabled` removes the toggle from the tab order and blocks clicks.",
    source: "toggle.marko (native disabled); toggle-disabled.marko",
  },
  {
    id: "toggle/api/controlled-pressed",
    kind: "api",
    description: "A `pressed` prop sets the state and `pressedChange` fires on user toggle.",
    source: "toggle.marko; toggle-controlled.marko",
  },
  {
    id: "toggle/api/variant-outline",
    kind: "api",
    description: "`variant=\"outline\"` renders the outline style (presentational).",
    source: "toggle/variants.ts; toggle-outline.marko",
  },
  {
    id: "toggle/api/size-variants",
    kind: "api",
    description: "`size` (\"sm\" | \"default\" | \"lg\") changes the dimensions (presentational).",
    source: "toggle/variants.ts; toggle-sizes.marko",
  },
  {
    id: "toggle/ssr-hydration/pressed-state-stable",
    kind: "ssr-hydration",
    description: "The server-rendered data-state/aria-pressed are unchanged after client hydration.",
    source: "toggle.marko (local state); not in hydration-coverage.ts",
  },
  {
    id: "toggle/visual/rtl-mirrors",
    kind: "visual",
    description: "Under dir=\"rtl\" the toggle renders mirrored via logical properties.",
    source: "toggle-rtl.marko",
  },
];
