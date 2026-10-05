// Hand-authored prose + example ordering for /docs/components/button-group.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A container that groups related buttons together with consistent styling.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<ButtonGroup>`,
  importSnippet: `import ButtonGroup from "@/components/ui/button-group/button-group.marko";`,
  usageSnippet: `<ButtonGroup>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</ButtonGroup>`,

  requires: ["button"],
  examples: [
    {
      name: "button-group-demo",
      title: "Basic",
      description: "Buttons that share adjacent borders and merge their corners.",
    },
    {
      name: "button-group-orientation",
      title: "Orientation",
      description: "Set `orientation=\"vertical\"` to stack the group instead of rowing it.",
    },
    {
      name: "button-group-size",
      title: "Size",
      description: "Control the size of the whole group through the `size` prop on each `Button`.",
    },
    {
      name: "button-group-nested",
      title: "Nested",
      description: "Nest `ButtonGroup` components to add spacing between related clusters of buttons.",
    },
    {
      name: "button-group-separator",
      title: "Separator",
      description:
        "`ButtonGroupSeparator` visually divides buttons within a group. Buttons with the `outline` variant already have a border and rarely need one; other variants benefit from it.",
    },
    {
      name: "button-group-split",
      title: "Split",
      description: "A split button: two buttons separated by a `ButtonGroupSeparator`.",
    },
    {
      name: "button-group-input",
      title: "Input",
      description: "Wrap an `Input` with buttons.",
    },
    {
      name: "button-group-input-group",
      title: "Input Group",
      description: "Wrap an `InputGroup` to create complex input layouts.",
    },
    {
      name: "button-group-dropdown",
      title: "Dropdown Menu",
      description: "Create a split button group with a `DropdownMenu`.",
    },
    {
      name: "button-group-select",
      title: "Select",
      description:
        "Pair with a `Select`. Upstream's `SelectTrigger` accepts arbitrary children and renders the bare currency symbol via a `font-mono` class; ours always shows the selected item's `label` (`valueAsString || placeholder`) with no custom-content slot, so the trigger reads 'US Dollar' rather than a bare '$'.",
      essential: true,
    },
    {
      name: "button-group-popover",
      title: "Popover",
      description: "Use with a `Popover`.",
    },
    {
      name: "button-group-rtl",
      title: "RTL",
      description:
        "Set `dir=\"rtl\"` on a wrapping element for RTL text and logical-property layout. `DropdownMenu` doesn't expose the underlying Zag menu's `dir` prop, so this doesn't drive floating-ui's own RTL placement flip. Upstream's RTL demo also drives a live language switcher (English/Arabic/Hebrew); this one is static Arabic content, like every other RTL example on this site.",
    },
    {
      name: "button-group-text",
      title: "With Text",
      description: "`ButtonGroupText` renders a non-interactive label inside the group.",
    },],
  accessibilityNotes: [
    "The `ButtonGroup` root renders `role=\"group\"` so assistive tech announces the buttons as one related set.",
    "Use `aria-label` or `aria-labelledby` on `ButtonGroup` to give the group an accessible name, especially when it has no visible heading.",
    "Icon-only buttons inside a group (a split-button's second button, a dropdown or popover trigger) need their own `aria-label` — the group's label does not substitute for a per-button accessible name.",
  ],
  accessibilityKeyboard: [
    { keys: "Tab / Shift+Tab", description: "Moves focus between the buttons in the group, same as any sequence of focusable elements." },
  ],
};
