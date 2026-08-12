// Hand-authored prose + example ordering for /docs/components/dropdown-menu.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Displays a menu to the user — such as a set of actions or functions — triggered by a button.",
  importSnippet: `import DropdownMenu from "@/components/ui/dropdown-menu/dropdown-menu.marko";`,
  usageSnippet: `<DropdownMenu items=ITEMS select(value) { /* ... */ }>
  <@trigger|triggerProps|>
    <Button variant="outline" ...triggerProps>Open</Button>
  </@trigger>
</DropdownMenu>`,
  examples: [
    {
      name: "dropdown-menu-demo",
      title: "Basic",
      description:
        "Items are a plain array — mix labels, separators, shortcuts, and a danger item without composing subcomponents.",
    },
    {
      name: "dropdown-menu-simple",
      title: "Simple",
      description: "A minimal menu with no label, just actions and a destructive item at the end.",
    },
    {
      name: "dropdown-menu-disabled-item",
      title: "Disabled item",
      description: "Set `disabled` on an item to skip it in the tab order and block pointer input.",
    },
    {
      name: "dropdown-menu-selection",
      title: "Selection",
      description: "Handle `select(value)` on the menu to react to whichever item was chosen.",
    },
    {
      name: "dropdown-menu-danger",
      title: "Danger action",
      description: "Mark an item `danger` to style it as a destructive action, such as deleting a resource.",
    },
    {
      name: "dropdown-menu-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@item>` attribute tags instead of `items=` to compose the menu directly in markup — pass `type=\"separator\"` for a divider or `type=\"label\"` for a group label. Entries render in the order they are written. An item's text can come from either a `label=` attribute or a markup body, whichever you prefer.",
    },
  ],
};
