// Behavior list for Accordion (round 2a, reviewed against @zag-js/accordion and the WAI-ARIA Accordion pattern).
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "accordion/interaction/click-toggles-item",
    kind: "interaction",
    description: "Clicking a trigger expands its panel (and collapses it again when collapsible).",
    source: "@zag-js/accordion; accordion-demo.marko",
  },
  {
    id: "accordion/interaction/single-mode-keeps-one-open",
    kind: "interaction",
    description: "Without `multiple`, expanding one section collapses the previously open one.",
    source: "@zag-js/accordion Props.multiple; accordion-demo.marko",
  },
  {
    id: "accordion/interaction/multiple-allows-several-open",
    kind: "interaction",
    description: "With `multiple`, several sections can be open at once.",
    source: "@zag-js/accordion Props.multiple; accordion-multiple.marko",
  },
  {
    id: "accordion/interaction/collapsible-closes-open-item",
    kind: "interaction",
    description: "With `collapsible`, activating an open section's trigger collapses it.",
    source: "@zag-js/accordion Props.collapsible; accordion-demo.marko",
  },
  {
    id: "accordion/interaction/not-collapsible-keeps-last-open",
    kind: "interaction",
    description: "Without `collapsible`, the last open section cannot be closed by activating its own trigger.",
    source: "@zag-js/accordion Props.collapsible; accordion-not-collapsible.marko",
  },
  {
    id: "accordion/interaction/starts-collapsed",
    kind: "interaction",
    description: "With no default value, every trigger starts with aria-expanded=false.",
    source: "@zag-js/accordion Props.defaultValue; accordion-disabled.marko",
  },
  {
    id: "accordion/keyboard/enter-toggles-focused-item",
    kind: "keyboard",
    description: "Enter on a focused trigger expands the section.",
    source: "WAI-ARIA APG accordion pattern",
  },
  {
    id: "accordion/keyboard/space-toggles-focused-item",
    kind: "keyboard",
    description: "Space on a focused trigger toggles the section.",
    source: "WAI-ARIA APG accordion pattern",
  },
  {
    id: "accordion/keyboard/arrow-down-up-moves-focus",
    kind: "keyboard",
    description: "ArrowDown/ArrowUp move focus to the next/previous trigger.",
    source: "WAI-ARIA APG accordion pattern (optional keys)",
  },
  {
    id: "accordion/keyboard/arrow-focus-wraps",
    kind: "keyboard",
    description: "ArrowUp on the first trigger wraps to the last, and ArrowDown on the last wraps to the first.",
    source: "@zag-js/accordion (loops focus); accordion docs.ts accessibilityKeyboard",
  },
  {
    id: "accordion/keyboard/home-end-jump-to-first-last",
    kind: "keyboard",
    description: "Home/End move focus to the first/last trigger.",
    source: "WAI-ARIA APG accordion pattern (optional keys)",
  },
  {
    id: "accordion/a11y/aria-expanded-tracks-state",
    kind: "a11y",
    description: "Each trigger's aria-expanded reflects whether its section is open, and updates when it toggles.",
    source: "WAI-ARIA APG accordion pattern",
  },
  {
    id: "accordion/a11y/trigger-controls-labelled-region",
    kind: "a11y",
    description: "Each trigger's aria-controls points at a role=region panel that is aria-labelledby that trigger.",
    source: "WAI-ARIA APG accordion pattern",
  },
  {
    id: "accordion/api/disabled-blocks-all-triggers",
    kind: "api",
    description: "`disabled` disables every trigger so nothing can be toggled.",
    source: "@zag-js/accordion Props.disabled; accordion-disabled.marko",
  },
  {
    id: "accordion/api/controlled-value",
    kind: "api",
    description: "A controlled `value` keeps the open sections until the consumer updates it via `valueChange`.",
    source: "@zag-js/accordion Props.value/onValueChange; accordion-controlled.marko",
  },
  {
    id: "accordion/api/orientation-horizontal-arrow-keys",
    kind: "api",
    description: "`orientation=\"horizontal\"` swaps the arrow keys used to move between triggers.",
    source: "@zag-js/accordion Props.orientation",
  },
  {
    id: "accordion/api/compound-item-tags",
    kind: "api",
    description: "`<@item>` attribute tags render the same accordion as `items=`, with tags winning when both are given.",
    source: "accordion.marko normalizedItems; accordion-compound.marko",
  },
  {
    id: "accordion/a11y/structurally-valid-aria",
    kind: "a11y",
    description: "The hero demo's rendered markup has well-formed roles/aria-* attributes and an accessible name where one is required (structural validity only; says nothing about values tracking state).",
    source: "WAI-ARIA APG; scripts/ci/axe-scan.ts scans the accordion hero demo",
  },
  {
    id: "accordion/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS",
  },
  {
    id: "accordion/visual/rtl-mirrors",
    kind: "visual",
    description: "Under dir=\"rtl\" the component renders mirrored via logical properties.",
    source: "accordion-rtl.marko",
  },
];
