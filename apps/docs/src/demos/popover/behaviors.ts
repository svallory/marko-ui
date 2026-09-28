// Behavior list for Popover (round 2a, reviewed against @zag-js/popover and the APG Dialog (non-modal) pattern).
// Interaction, keyboard and ARIA behaviors are proven by packages/shadcn/tests/behavior/popover.test.ts.
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "popover/interaction/trigger-click-toggles-open",
    kind: "interaction",
    description: "Clicking the trigger opens the popover, and clicking again closes it.",
    source: "@zag-js/popover; popover-demo.marko",
  },
  {
    id: "popover/interaction/outside-click-closes",
    kind: "interaction",
    description: "Clicking outside the content closes the popover (closeOnInteractOutside defaults to true).",
    source: "@zag-js/popover Props.closeOnInteractOutside",
  },
  {
    id: "popover/keyboard/enter-space-opens",
    kind: "keyboard",
    description: "Enter/Space on the focused trigger opens the popover.",
    source: "@zag-js/popover; native <button> activation",
  },
  {
    id: "popover/keyboard/escape-closes",
    kind: "keyboard",
    description: "Escape closes the popover (closeOnEscape defaults to true).",
    source: "@zag-js/popover Props.closeOnEscape",
  },
  {
    id: "popover/keyboard/focus-moves-into-content-on-open",
    kind: "keyboard",
    description: "Opening moves focus into the content (autoFocus defaults to true).",
    source: "@zag-js/popover Props.autoFocus",
  },
  {
    id: "popover/keyboard/focus-restored-to-trigger",
    kind: "keyboard",
    description: "Closing returns focus to the trigger.",
    source: "@zag-js/popover Props.restoreFocus",
  },
  {
    id: "popover/api/positioning-placement",
    kind: "api",
    description: "`positioning.placement` controls where the content renders relative to the trigger.",
    source: "@zag-js/popover Props.positioning; popover-placement.marko, popover-alignments.marko",
  },
  {
    id: "popover/api/controlled-open",
    kind: "api",
    description: "A controlled `open` keeps its state until the consumer updates it via `openChange`.",
    source: "@zag-js/popover Props.open; popover-controlled.marko",
  },
  {
    id: "popover/api/default-open",
    kind: "api",
    description: "`defaultOpen` renders the popover open initially.",
    source: "@zag-js/popover Props.defaultOpen",
  },
  {
    id: "popover/api/modal-traps-focus",
    kind: "api",
    description: "With `modal`, focus is trapped in the content and outside content is inert.",
    source: "@zag-js/popover Props.modal",
  },
  {
    id: "popover/interaction/form-controls-usable-inside",
    kind: "interaction",
    description: "Form controls inside the content are focusable and usable without dismissing the popover.",
    source: "popover-form.marko",
  },
  {
    id: "popover/a11y/trigger-aria-expanded-tracks-state",
    kind: "a11y",
    description: "The trigger's aria-expanded reflects whether the popover is open and updates when it toggles.",
    source: "@zag-js/popover getTriggerProps",
  },
  {
    id: "popover/a11y/trigger-controls-content",
    kind: "a11y",
    description: "The trigger carries aria-haspopup=\"dialog\" and aria-controls pointing at the content.",
    source: "@zag-js/popover getTriggerProps",
  },
  {
    id: "popover/a11y/structurally-valid-aria",
    kind: "a11y",
    description: "The hero demo's rendered markup has well-formed roles/aria-* attributes and an accessible name where one is required (structural validity only; says nothing about values tracking state).",
    source: "WAI-ARIA APG; scripts/ci/axe-scan.ts scans the popover hero demo",
  },
  {
    id: "popover/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS",
  },
  {
    id: "popover/visual/rtl-mirrors",
    kind: "visual",
    description: "Under dir=\"rtl\" the component renders mirrored via logical properties.",
    source: "popover-rtl.marko",
  },
];
