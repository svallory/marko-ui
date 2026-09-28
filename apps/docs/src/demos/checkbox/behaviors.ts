// Behavior list for Checkbox (round 2a, reviewed against @zag-js/checkbox and the WAI-ARIA Checkbox pattern).
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "checkbox/interaction/click-toggles-checked",
    kind: "interaction",
    description: "Clicking the control toggles the checked state.",
    source: "@zag-js/checkbox; checkbox-basic.marko",
  },
  {
    id: "checkbox/interaction/label-click-toggles-checked",
    kind: "interaction",
    description: "Clicking the label content toggles the checkbox (the root element is the <label>).",
    source: "checkbox.marko root <label>; checkbox-basic.marko",
  },
  {
    id: "checkbox/keyboard/space-toggles-checked",
    kind: "keyboard",
    description: "Space toggles the checked state; both the hidden input and root data-state follow.",
    source: "WAI-ARIA APG checkbox pattern",
  },
  {
    id: "checkbox/api/indeterminate-state",
    kind: "api",
    description: "`checked=\"indeterminate\"` sets data-state=\"indeterminate\" on the root.",
    source: "@zag-js/checkbox Props.checked; checkbox-indeterminate.marko",
  },
  {
    id: "checkbox/api/disabled-blocks-toggle",
    kind: "api",
    description: "`disabled` disables the hidden input and Space no longer changes checked.",
    source: "@zag-js/checkbox Props.disabled; checkbox-disabled.marko",
  },
  {
    id: "checkbox/api/controlled-checked",
    kind: "api",
    description: "A controlled `checked` keeps its value until the consumer updates it via `checkedChange`.",
    source: "@zag-js/checkbox Props.checked; checkbox-controlled.marko",
  },
  {
    id: "checkbox/api/default-checked",
    kind: "api",
    description: "`defaultChecked` sets the initial state of an uncontrolled checkbox.",
    source: "@zag-js/checkbox Props.defaultChecked; checkbox-checked.marko",
  },
  {
    id: "checkbox/api/invalid-state",
    kind: "api",
    description: "`invalid` marks the control invalid without changing its checked/disabled behavior.",
    source: "@zag-js/checkbox Props.invalid; checkbox-invalid.marko",
  },
  {
    id: "checkbox/api/read-only-blocks-toggle",
    kind: "api",
    description: "`readOnly` keeps the control focusable but prevents changing its value.",
    source: "@zag-js/checkbox Props.readOnly",
  },
  {
    id: "checkbox/api/form-submission-value",
    kind: "api",
    description: "The hidden native input carries `name`/`value`/`form` so the checkbox participates in native form submission.",
    source: "@zag-js/checkbox Props.name/value/form; checkbox.marko hidden input",
  },
  {
    id: "checkbox/api/group-independent-items",
    kind: "api",
    description: "Checkboxes in a FieldSet group toggle independently of each other.",
    source: "checkbox-group.marko",
  },
  {
    id: "checkbox/a11y/native-checkbox-semantics",
    kind: "a11y",
    description: "The hidden input is a native input[type=checkbox], so role and checked state are exposed to assistive tech without extra ARIA.",
    source: "@zag-js/checkbox getHiddenInputProps; checkbox docs.ts notes",
  },
  {
    id: "checkbox/a11y/structurally-valid-aria",
    kind: "a11y",
    description: "The hero demo's rendered markup has well-formed roles/aria-* attributes and an accessible name where one is required (structural validity only; says nothing about values tracking state).",
    source: "WAI-ARIA APG; scripts/ci/axe-scan.ts scans the checkbox hero demo",
  },
  {
    id: "checkbox/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS",
  },
  {
    id: "checkbox/visual/rtl-mirrors",
    kind: "visual",
    description: "Under dir=\"rtl\" the component renders mirrored via logical properties.",
    source: "checkbox-rtl.marko",
  },
];
