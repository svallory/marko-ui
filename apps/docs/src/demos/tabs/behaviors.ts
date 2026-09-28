// Behavior list for Tabs (round 2a, reviewed against @zag-js/tabs and the WAI-ARIA Tabs pattern).
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "tabs/interaction/first-tab-selected-on-load",
    kind: "interaction",
    description: "On load the first tab is selected and only its panel is shown.",
    source: "@zag-js/tabs; tabs-demo.marko",
  },
  {
    id: "tabs/interaction/click-selects-tab",
    kind: "interaction",
    description: "Clicking a tab selects it and shows its panel.",
    source: "@zag-js/tabs; tabs-demo.marko",
  },
  {
    id: "tabs/interaction/one-panel-visible",
    kind: "interaction",
    description: "Exactly one panel is visible as selection moves.",
    source: "WAI-ARIA APG tabs pattern",
  },
  {
    id: "tabs/keyboard/roving-tabindex",
    kind: "keyboard",
    description: "The selected tab has tabindex=0 and the others -1.",
    source: "WAI-ARIA APG tabs pattern",
  },
  {
    id: "tabs/keyboard/arrow-right-left-moves-focus-and-selection",
    kind: "keyboard",
    description: "ArrowRight/ArrowLeft move focus and (automatic activation) selection to the next/previous tab.",
    source: "WAI-ARIA APG tabs pattern",
  },
  {
    id: "tabs/keyboard/arrow-focus-wraps",
    kind: "keyboard",
    description: "Arrow keys wrap focus from the last tab to the first and back.",
    source: "@zag-js/tabs Props.loopFocus",
  },
  {
    id: "tabs/keyboard/home-end-focus-first-last",
    kind: "keyboard",
    description: "Home/End move focus to the first/last tab.",
    source: "WAI-ARIA APG tabs pattern",
  },
  {
    id: "tabs/keyboard/arrow-skips-disabled-tab",
    kind: "keyboard",
    description: "Arrow navigation skips a disabled tab.",
    source: "@zag-js/tabs; tabs-disabled.marko",
  },
  {
    id: "tabs/a11y/aria-selected-tracks-selection",
    kind: "a11y",
    description: "aria-selected is true on the selected tab and false on the previously selected one.",
    source: "WAI-ARIA APG tabs pattern",
  },
  {
    id: "tabs/a11y/tab-panel-association",
    kind: "a11y",
    description: "Each tab's aria-controls points at a role=tabpanel that is aria-labelledby that tab.",
    source: "WAI-ARIA APG tabs pattern",
  },
  {
    id: "tabs/api/attr-tags-take-precedence",
    kind: "api",
    description: "When both `<@trigger>`/`<@panel>` tags and `items=` are supplied, the tags win for triggers and panels.",
    source: "tabs.marko; tabs-precedence.marko",
  },
  {
    id: "tabs/api/hybrid-trigger-tags-with-items-panels",
    kind: "api",
    description: "`<@trigger>` tags without `<@panel>` tags pair with the `items=`-derived panels.",
    source: "tabs.marko; tabs-hybrid.marko",
  },
  {
    id: "tabs/api/controlled-value",
    kind: "api",
    description: "A controlled `value` keeps the selected tab until the consumer updates it via `valueChange`.",
    source: "@zag-js/tabs Props.value; tabs-controlled.marko",
  },
  {
    id: "tabs/api/manual-activation-mode",
    kind: "api",
    description: "`activationMode=\"manual\"` moves focus with arrows but selects only on Enter/Space/click.",
    source: "@zag-js/tabs Props.activationMode",
  },
  {
    id: "tabs/api/orientation-vertical",
    kind: "api",
    description: "`orientation=\"vertical\"` maps ArrowUp/ArrowDown to tab navigation.",
    source: "@zag-js/tabs Props.orientation; tabs-vertical.marko",
  },
  {
    id: "tabs/api/deselectable",
    kind: "api",
    description: "`deselectable` lets the selected tab be deselected by activating it again.",
    source: "@zag-js/tabs Props.deselectable",
  },
  {
    id: "tabs/visual/line-variant",
    kind: "visual",
    description: "`variant=\"line\"` renders the underline-style tab list.",
    source: "tabs-line.marko",
  },
  {
    id: "tabs/a11y/structurally-valid-aria",
    kind: "a11y",
    description: "The hero demo's rendered markup has well-formed roles/aria-* attributes and an accessible name where one is required (structural validity only; says nothing about values tracking state).",
    source: "WAI-ARIA APG; scripts/ci/axe-scan.ts scans the tabs hero demo",
  },
  {
    id: "tabs/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS",
  },
  {
    id: "tabs/visual/rtl-mirrors",
    kind: "visual",
    description: "Under dir=\"rtl\" the component renders mirrored via logical properties.",
    source: "tabs-rtl.marko",
  },
];
