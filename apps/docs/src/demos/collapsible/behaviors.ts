// Behavior list for Collapsible (round 2a, reviewed against @zag-js/collapsible).
// No dedicated behavior suite exists for collapsible; only the structural checks apply.
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "collapsible/interaction/trigger-click-toggles-open",
    kind: "interaction",
    description: "Clicking the trigger toggles the panel between open and closed.",
    source: "@zag-js/collapsible; collapsible-demo.marko",
  },
  {
    id: "collapsible/keyboard/space-enter-toggle",
    kind: "keyboard",
    description: "Space and Enter on the focused trigger toggle the panel.",
    source: "WAI-ARIA APG disclosure pattern; collapsible docs.ts accessibilityKeyboard",
  },
  {
    id: "collapsible/interaction/content-stays-in-dom",
    kind: "interaction",
    description: "The content region stays in the DOM when closed; visibility follows data-state=\"open\"|\"closed\".",
    source: "collapsible docs.ts notes",
  },
  {
    id: "collapsible/api/disabled-ignores-clicks",
    kind: "api",
    description: "`disabled` marks the trigger data-disabled and ignores clicks (trigger stays focusable).",
    source: "@zag-js/collapsible Props.disabled; collapsible-disabled.marko",
  },
  {
    id: "collapsible/api/controlled-open",
    kind: "api",
    description: "A controlled `open` keeps its state until the consumer updates it via `openChange`.",
    source: "@zag-js/collapsible Props.open; collapsible-controlled.marko",
  },
  {
    id: "collapsible/api/default-open",
    kind: "api",
    description: "`defaultOpen` renders the panel open initially.",
    source: "@zag-js/collapsible Props.defaultOpen",
  },
  {
    id: "collapsible/api/collapsed-height",
    kind: "api",
    description: "`collapsedHeight` keeps that much of the content visible while closed.",
    source: "@zag-js/collapsible Props.collapsedHeight",
  },
  {
    id: "collapsible/a11y/trigger-aria-expanded-tracks-state",
    kind: "a11y",
    description: "The trigger's aria-expanded reflects the panel's open state and updates when it toggles.",
    source: "collapsible docs.ts notes; WAI-ARIA APG disclosure pattern",
  },
  {
    id: "collapsible/a11y/trigger-controls-content",
    kind: "a11y",
    description: "The trigger's aria-controls points at the content region's id.",
    source: "collapsible docs.ts notes",
  },
  {
    id: "collapsible/interaction/nested-collapsibles-independent",
    kind: "interaction",
    description: "A collapsible nested in another toggles independently of its parent (file-tree demo).",
    source: "collapsible-file-tree.marko",
  },
  {
    id: "collapsible/a11y/structurally-valid-aria",
    kind: "a11y",
    description: "The hero demo's rendered markup has well-formed roles/aria-* attributes and an accessible name where one is required (structural validity only; says nothing about values tracking state).",
    source: "WAI-ARIA APG; scripts/ci/axe-scan.ts scans the collapsible hero demo",
  },
  {
    id: "collapsible/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS",
  },
  {
    id: "collapsible/visual/rtl-mirrors",
    kind: "visual",
    description: "Under dir=\"rtl\" the component renders mirrored via logical properties.",
    source: "collapsible-rtl.marko",
  },
];
