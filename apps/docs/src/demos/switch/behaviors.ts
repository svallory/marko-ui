// Behavior list for Switch — spike component 1/3 (simple). See
// notes/behavior-coverage.md for the format and the mapping mechanism.
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "switch/interaction/click-toggles-checked",
    kind: "interaction",
    description: "Clicking the control toggles the checked state.",
    source: "@zag-js/switch SwitchApi.toggleChecked; switch-demo.marko",
  },
  {
    id: "switch/interaction/label-click-toggles-checked",
    kind: "interaction",
    description: "Clicking the label text (not just the control) also toggles checked state.",
    source: "@zag-js/switch getRootProps() returns a <label> wrapping the control; switch-description.marko",
  },
  {
    id: "switch/keyboard/space-toggles-checked",
    kind: "keyboard",
    description: "Space toggles checked state while the switch is focused (native input[type=checkbox] behavior).",
    source: "WAI-ARIA APG switch pattern; native hidden <input> keyboard handling",
  },
  {
    id: "switch/api/disabled-blocks-toggle",
    kind: "api",
    description: "`disabled` prevents the switch from toggling via click or keyboard, and excludes it from tab order.",
    source: "@zag-js/switch SwitchProps.disabled; switch-disabled.marko",
  },
  {
    id: "switch/api/controlled-checked",
    kind: "api",
    description: "Passing `checked` (controlled) renders and keeps the switch in that state; `checkedChange`/`onCheckedChange` fires on user toggle without the value changing until the consumer updates it.",
    source: "@zag-js/switch SwitchProps.checked/onCheckedChange; switch-controlled.marko",
  },
  {
    id: "switch/api/default-checked",
    kind: "api",
    description: "`defaultChecked` sets the initial checked state for an uncontrolled switch.",
    source: "@zag-js/switch SwitchProps.defaultChecked; switch-checked.marko",
  },
  {
    id: "switch/api/size-variants",
    kind: "api",
    description: "`size` (\"sm\" | \"default\") changes the control's rendered dimensions; purely presentational, not read by the machine.",
    source: "packages/shadcn/ui/switch/switch.marko Input.size; switch-sizes.marko",
  },
  {
    id: "switch/api/invalid-state",
    kind: "api",
    description: "`invalid` marks the switch as invalid (aria-invalid) without changing its checked/disabled behavior.",
    source: "@zag-js/switch SwitchProps.invalid; switch-invalid.marko",
  },
  {
    id: "switch/api/form-submission-value",
    kind: "api",
    description: "The switch renders a hidden native input so `name`/`value`/`form` participate in native form submission.",
    source: "@zag-js/switch SwitchApi.getHiddenInputProps; SwitchProps.name/value/form",
  },
  {
    id: "switch/a11y/accessible-name-from-label-or-aria-label",
    kind: "a11y",
    description: "The switch has an accessible name either from its label content or an explicit aria-label/aria-labelledby; the hidden input's aria-labelledby only references the label part when label content is actually rendered.",
    source: "WAI-ARIA APG switch pattern (name required); packages/shadcn/ui/switch/switch.marko rootProps comment",
  },
  {
    id: "switch/a11y/role-and-checked-state-exposed",
    kind: "a11y",
    description: "The control exposes checked state to assistive tech (native input[type=checkbox] semantics via the hidden input Zag renders).",
    source: "@zag-js/switch getHiddenInputProps; WAI-ARIA APG switch pattern",
  },
  {
    id: "switch/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the switch's scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS includes \"switch\"",
  },
  {
    id: "switch/visual/rtl-mirrors",
    kind: "visual",
    description: "In RTL (dir=\"rtl\"), the switch's thumb and track render mirrored.",
    source: "switch-rtl.marko",
  },
];
