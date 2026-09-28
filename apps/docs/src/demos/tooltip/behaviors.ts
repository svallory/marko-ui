// Behavior list for Tooltip (round 2a, reviewed against @zag-js/tooltip and the WAI-ARIA Tooltip pattern).
// No dedicated behavior suite exists for tooltip; only the structural checks apply.
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "tooltip/interaction/hover-opens-after-delay",
    kind: "interaction",
    description: "Hovering the trigger opens the tooltip after `openDelay`.",
    source: "@zag-js/tooltip Props.openDelay; tooltip-demo.marko",
  },
  {
    id: "tooltip/interaction/pointer-leave-closes-after-delay",
    kind: "interaction",
    description: "Moving the pointer away closes the tooltip after `closeDelay`.",
    source: "@zag-js/tooltip Props.closeDelay; tooltip-delay.marko",
  },
  {
    id: "tooltip/interaction/interactive-content-stays-open",
    kind: "interaction",
    description: "With `interactive`, moving the pointer onto the content keeps the tooltip open (off by default).",
    source: "@zag-js/tooltip Props.interactive",
  },
  {
    id: "tooltip/interaction/closes-on-scroll",
    kind: "interaction",
    description: "Scrolling closes the open tooltip (closeOnScroll defaults to true).",
    source: "@zag-js/tooltip Props.closeOnScroll",
  },
  {
    id: "tooltip/interaction/closes-on-trigger-pointer-down",
    kind: "interaction",
    description: "Pressing the trigger closes the tooltip (closeOnPointerDown defaults to true).",
    source: "@zag-js/tooltip Props.closeOnPointerDown",
  },
  {
    id: "tooltip/keyboard/focus-opens",
    kind: "keyboard",
    description: "Focusing the trigger opens the tooltip without a pointer.",
    source: "WAI-ARIA APG tooltip pattern; tooltip docs.ts notes",
  },
  {
    id: "tooltip/keyboard/escape-closes",
    kind: "keyboard",
    description: "Escape closes the open tooltip (closeOnEscape defaults to true).",
    source: "WAI-ARIA APG tooltip pattern; @zag-js/tooltip Props.closeOnEscape",
  },
  {
    id: "tooltip/a11y/aria-describedby-only-while-open",
    kind: "a11y",
    description: "The trigger's aria-describedby points at the content only while the tooltip is open.",
    source: "tooltip docs.ts notes",
  },
  {
    id: "tooltip/a11y/role-tooltip-unless-aria-label",
    kind: "a11y",
    description: "The content has role=\"tooltip\" unless the trigger already has an aria-label.",
    source: "tooltip docs.ts notes; tooltip.marko",
  },
  {
    id: "tooltip/api/positioning-placement",
    kind: "api",
    description: "`positioning.placement` controls the side the tooltip renders on.",
    source: "@zag-js/tooltip Props.positioning; tooltip-sides.marko",
  },
  {
    id: "tooltip/api/disabled-suppresses-tooltip",
    kind: "api",
    description: "`disabled` prevents the tooltip from opening.",
    source: "@zag-js/tooltip Props.disabled",
  },
  {
    id: "tooltip/api/disabled-button-via-span-wrapper",
    kind: "api",
    description: "Spreading the trigger props on a wrapping <span> shows the tooltip for a disabled button.",
    source: "tooltip-disabled.marko",
  },
  {
    id: "tooltip/a11y/structurally-valid-aria",
    kind: "a11y",
    description: "The hero demo's rendered markup has well-formed roles/aria-* attributes and an accessible name where one is required (structural validity only; says nothing about values tracking state).",
    source: "WAI-ARIA APG; scripts/ci/axe-scan.ts scans the tooltip hero demo",
  },
  {
    id: "tooltip/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS",
  },
  {
    id: "tooltip/visual/rtl-mirrors",
    kind: "visual",
    description: "Under dir=\"rtl\" the component renders mirrored via logical properties.",
    source: "tooltip-rtl.marko",
  },
];
