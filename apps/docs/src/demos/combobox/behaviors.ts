// Behavior list for Combobox — spike component 3/3 (async/server-shaped).
// NOTE: no demo currently exercises server-driven/async item loading
// (combobox-demo.marko and siblings use a static in-memory `items` array).
// The zag machine's API supports it (open/inputValue/highlightedValue as
// controlled state, onInputValueChange as the hook a consumer wires to a
// debounced fetch) so it's listed as a behavior with no proving demo yet —
// see notes/behavior-coverage.md open questions.
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "combobox/interaction/trigger-click-opens",
    kind: "interaction",
    description: "Clicking the input or trigger button opens the listbox.",
    source: "@zag-js/combobox; combobox-demo.marko",
  },
  {
    id: "combobox/interaction/typing-filters-options",
    kind: "interaction",
    description: "Typing in the input filters the visible options by label.",
    source: "@zag-js/combobox inputValue-driven filtering; combobox-basic.marko",
  },
  {
    id: "combobox/interaction/option-click-selects",
    kind: "interaction",
    description: "Clicking an option selects it, sets the input value, and closes the list.",
    source: "@zag-js/combobox ComboboxProps.value; combobox-demo.marko",
  },
  {
    id: "combobox/interaction/clear-button-resets",
    kind: "interaction",
    description: "The clear button resets the input value and selection.",
    source: "combobox-clear.marko",
  },
  {
    id: "combobox/interaction/multiple-selection-accumulates",
    kind: "interaction",
    description: "With `multiple`, selecting an option adds it to the value list without closing the popover; selected options render as removable tags.",
    source: "@zag-js/combobox ComboboxProps.multiple; combobox-multiple.marko",
  },
  {
    id: "combobox/interaction/outside-click-closes",
    kind: "interaction",
    description: "Clicking outside the open listbox closes it.",
    source: "@zag-js/combobox dismissable-layer behavior",
  },
  {
    id: "combobox/interaction/disabled-option-not-selectable",
    kind: "interaction",
    description: "A disabled option in the collection cannot be selected by click.",
    source: "combobox-disabled.marko",
  },
  {
    id: "combobox/interaction/auto-highlight-first-match",
    kind: "interaction",
    description: "With inputBehavior=\"autohighlight\", the first filtered match is highlighted automatically as the user types.",
    source: "@zag-js/combobox ComboboxProps.inputBehavior; combobox-auto-highlight.marko",
  },
  {
    id: "combobox/api/controlled-value-and-input-value",
    kind: "api",
    description: "Passing `value`/`inputValue` (controlled) keeps the combobox in that state; onValueChange/onInputValueChange fire on user interaction.",
    source: "@zag-js/combobox ComboboxProps.value/inputValue; combobox-controlled.marko",
  },
  {
    id: "combobox/api/grouped-options-render-under-headings",
    kind: "api",
    description: "Options passed with group metadata render under their group heading, and are still individually filterable/selectable.",
    source: "combobox-groups.marko",
  },
  {
    id: "combobox/api/invalid-state",
    kind: "api",
    description: "`invalid` sets aria-invalid on the input and data-invalid throughout the part tree.",
    source: "docs.ts accessibilityNotes; combobox-invalid.marko",
  },
  {
    id: "combobox/api/async-item-loading",
    kind: "api",
    description: "Consumers can drive `items`/`open` from a debounced async fetch keyed off onInputValueChange (server-shaped filtering), not just a static in-memory list.",
    source: "@zag-js/combobox ComboboxProps.onInputValueChange/open — machine-level support; NO CURRENT DEMO exercises this path (see file header note)",
  },
  {
    id: "combobox/keyboard/arrow-down-up-moves-highlight",
    kind: "keyboard",
    description: "ArrowDown/ArrowUp moves the highlighted option in the open list.",
    source: "docs.ts accessibilityKeyboard",
  },
  {
    id: "combobox/keyboard/enter-selects-highlighted",
    kind: "keyboard",
    description: "Enter selects the currently highlighted option.",
    source: "docs.ts accessibilityKeyboard",
  },
  {
    id: "combobox/keyboard/escape-closes",
    kind: "keyboard",
    description: "Escape closes the open listbox without changing selection.",
    source: "WAI-ARIA APG combobox pattern",
  },
  {
    id: "combobox/a11y/combobox-listbox-roles",
    kind: "a11y",
    description: "Input carries role=\"combobox\"; the list carries role=\"listbox\"; aria-activedescendant on the input tracks the highlighted option.",
    source: "docs.ts accessibilityNotes; WAI-ARIA APG combobox pattern",
  },
  {
    id: "combobox/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the input and scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS includes \"combobox\"",
  },
  {
    id: "combobox/visual/rtl-mirrors",
    kind: "visual",
    description: "In RTL, the popover alignment and clear-button placement mirror correctly.",
    source: "combobox-rtl.marko",
  },
];
