// Behavior list for DropdownMenu — spike component 2/3 (compound). See
// notes/behavior-coverage.md for the format and the mapping mechanism.
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "dropdown-menu/interaction/trigger-click-opens",
    kind: "interaction",
    description: "Clicking the trigger opens the menu.",
    source: "@zag-js/menu; dropdown-menu-demo.marko",
  },
  {
    id: "dropdown-menu/interaction/item-click-selects-and-closes",
    kind: "interaction",
    description: "Clicking an item invokes its select handler and closes the menu (default closeOnSelect).",
    source: "@zag-js/menu MenuProps.closeOnSelect (default true); dropdown-menu-selection.marko",
  },
  {
    id: "dropdown-menu/interaction/outside-click-closes",
    kind: "interaction",
    description: "Clicking outside the open menu closes it.",
    source: "@zag-js/menu dismissable-layer behavior",
  },
  {
    id: "dropdown-menu/interaction/disabled-item-not-selectable",
    kind: "interaction",
    description: "A disabled item does not invoke its select handler when clicked.",
    source: "dropdown-menu-disabled-item.marko",
  },
  {
    id: "dropdown-menu/interaction/submenu-hover-opens",
    kind: "interaction",
    description: "Hovering a submenu trigger item opens its nested content after a delay.",
    source: "@zag-js/menu nested menu support; dropdown-menu-submenu.marko",
  },
  {
    id: "dropdown-menu/interaction/checkbox-item-toggles",
    kind: "interaction",
    description: "Clicking a checkbox item toggles its checked state without closing the menu.",
    source: "@zag-js/menu option items (type=checkbox); dropdown-menu-checkboxes.marko",
  },
  {
    id: "dropdown-menu/interaction/radio-item-selects-one",
    kind: "interaction",
    description: "Clicking a radio item within a radio group selects it and deselects the previously selected sibling.",
    source: "@zag-js/menu option items (type=radio); dropdown-menu-radio-group.marko",
  },
  {
    id: "dropdown-menu/api/attr-tag-items-render-in-source-order",
    kind: "api",
    description: "When built with `<@item>`/`<@separator>` attr tags (rather than `items=`), items and separators render interleaved in exact source order, and a body-based item's shortcut span still renders.",
    source: "packages/shadcn/ui/dropdown-menu; dropdown-menu-compound.marko",
  },
  {
    id: "dropdown-menu/keyboard/enter-space-opens-trigger",
    kind: "keyboard",
    description: "Enter/Space opens the menu when focus is on the trigger.",
    source: "docs.ts accessibilityKeyboard; WAI-ARIA APG menu button pattern",
  },
  {
    id: "dropdown-menu/keyboard/arrow-down-up-moves-highlight",
    kind: "keyboard",
    description: "ArrowDown/ArrowUp moves the highlighted item, wrapping at the ends (loopFocus default true).",
    source: "@zag-js/menu MenuProps.loopFocus (default true); docs.ts accessibilityKeyboard",
  },
  {
    id: "dropdown-menu/keyboard/enter-space-activates-highlighted",
    kind: "keyboard",
    description: "Enter/Space activates the currently highlighted item when the menu is open.",
    source: "docs.ts accessibilityKeyboard; WAI-ARIA APG menu pattern",
  },
  {
    id: "dropdown-menu/keyboard/escape-closes-and-returns-focus",
    kind: "keyboard",
    description: "Escape closes the menu and returns focus to the trigger.",
    source: "WAI-ARIA APG menu pattern",
  },
  {
    id: "dropdown-menu/keyboard/arrow-right-opens-submenu",
    kind: "keyboard",
    description: "ArrowRight (LTR) opens a highlighted submenu item and moves highlight into it; ArrowLeft closes back to the parent.",
    source: "@zag-js/menu nested menu keyboard support; WAI-ARIA APG submenu pattern",
  },
  {
    id: "dropdown-menu/keyboard/typeahead-jumps-to-item",
    kind: "keyboard",
    description: "Typing printable characters jumps highlight to the next matching item's label.",
    source: "@zag-js/menu MenuProps.typeahead (default true)",
  },
  {
    id: "dropdown-menu/keyboard/disabled-item-skipped",
    kind: "keyboard",
    description: "Arrow navigation skips disabled items.",
    source: "dropdown-menu-disabled-item.marko; WAI-ARIA APG menu pattern",
  },
  {
    id: "dropdown-menu/a11y/trigger-aria-haspopup-expanded",
    kind: "a11y",
    description: "Trigger carries aria-haspopup and aria-expanded reflecting open state, plus aria-controls pointing at the content.",
    source: "docs.ts accessibilityNotes",
  },
  {
    id: "dropdown-menu/a11y/checkbox-radio-item-roles",
    kind: "a11y",
    description: "Checkbox/radio items expose role=\"menuitemcheckbox\"/\"menuitemradio\" with aria-checked reflecting checked state.",
    source: "docs.ts accessibilityNotes",
  },
  {
    id: "dropdown-menu/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the trigger and scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS includes \"dropdown-menu\"",
  },
  {
    id: "dropdown-menu/visual/open-state-renders",
    kind: "visual",
    description: "The open menu content renders with correct style-layer tokens (radius, spacing, colors) across all 8 registry styles.",
    source: "e2e/gallery-visual.spec.ts preview-page-4 dropdown-menu-adjacent overlay capture (see notes/behavior-coverage.md open question on dropdown-menu itself)",
  },
  {
    id: "dropdown-menu/visual/rtl-mirrors",
    kind: "visual",
    description: "In RTL, submenu arrows and content alignment mirror correctly.",
    source: "dropdown-menu-rtl.marko",
  },
];
