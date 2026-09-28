// Behavior list for Radio Group (round 2a, reviewed against @zag-js/radio-group and the WAI-ARIA Radio Group pattern).
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "radio-group/interaction/click-selects-item",
    kind: "interaction",
    description: "Clicking an item (or its label) selects it and deselects the previous one.",
    source: "@zag-js/radio-group; radio-group-demo.marko",
  },
  {
    id: "radio-group/interaction/exactly-one-checked",
    kind: "interaction",
    description: "Exactly one item is checked at any time while navigating.",
    source: "WAI-ARIA APG radio group pattern",
  },
  {
    id: "radio-group/keyboard/arrow-down-moves-checked",
    kind: "keyboard",
    description: "ArrowDown moves focus and the checked state to the next radio.",
    source: "WAI-ARIA APG radio group pattern",
  },
  {
    id: "radio-group/keyboard/arrow-up-moves-checked",
    kind: "keyboard",
    description: "ArrowUp moves focus and the checked state to the previous radio.",
    source: "WAI-ARIA APG radio group pattern",
  },
  {
    id: "radio-group/keyboard/arrow-selection-wraps",
    kind: "keyboard",
    description: "ArrowUp from the first radio selects the last one (selection wraps).",
    source: "WAI-ARIA APG radio group pattern",
  },
  {
    id: "radio-group/keyboard/arrow-skips-disabled-item",
    kind: "keyboard",
    description: "Arrow navigation never checks a disabled item.",
    source: "WAI-ARIA APG radio group pattern; radio-group-disabled.marko",
  },
  {
    id: "radio-group/a11y/role-radiogroup-with-one-checked",
    kind: "a11y",
    description: "The root has role=\"radiogroup\" and the demo starts with exactly one item checked.",
    source: "WAI-ARIA APG radio group pattern",
  },
  {
    id: "radio-group/api/disabled-group",
    kind: "api",
    description: "`disabled` on the group disables every item.",
    source: "@zag-js/radio-group Props.disabled; radio-group-disabled-group demo (radio-group-disabled-group.marko)",
  },
  {
    id: "radio-group/api/controlled-value",
    kind: "api",
    description: "A controlled `value` keeps its selection until the consumer updates it via `valueChange`.",
    source: "@zag-js/radio-group Props.value; radio-group-controlled.marko",
  },
  {
    id: "radio-group/api/default-value",
    kind: "api",
    description: "`defaultValue` selects that item initially in an uncontrolled group.",
    source: "@zag-js/radio-group Props.defaultValue",
  },
  {
    id: "radio-group/api/orientation-horizontal",
    kind: "api",
    description: "`orientation=\"horizontal\"` moves selection with Left/Right arrows instead of Up/Down.",
    source: "@zag-js/radio-group Props.orientation",
  },
  {
    id: "radio-group/api/form-submission-value",
    kind: "api",
    description: "The hidden native radios carry `name`/`value`/`form` so the group submits with a native form.",
    source: "@zag-js/radio-group Props.name/form",
  },
  {
    id: "radio-group/api/read-only-blocks-change",
    kind: "api",
    description: "`readOnly` keeps the group focusable but prevents changing the selection.",
    source: "@zag-js/radio-group Props.readOnly",
  },
  {
    id: "radio-group/api/compound-item-tags",
    kind: "api",
    description: "`<@item>` attribute tags render the same group as `items=`.",
    source: "radio-group.marko; radio-group-compound.marko",
  },
  {
    id: "radio-group/a11y/structurally-valid-aria",
    kind: "a11y",
    description: "The hero demo's rendered markup has well-formed roles/aria-* attributes and an accessible name where one is required (structural validity only; says nothing about values tracking state).",
    source: "WAI-ARIA APG; scripts/ci/axe-scan.ts scans the radio-group hero demo",
  },
  {
    id: "radio-group/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS",
  },
  {
    id: "radio-group/visual/rtl-mirrors",
    kind: "visual",
    description: "Under dir=\"rtl\" the component renders mirrored via logical properties.",
    source: "radio-group-rtl.marko",
  },
];
