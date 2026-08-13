// Hand-authored prose + example ordering for /docs/components/context-menu.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Displays a menu to the user — such as a set of actions or functions — triggered by right click.",
  importSnippet: `import ContextMenu from "@/components/ui/context-menu/context-menu.marko";`,
  usageSnippet: `<ContextMenu items=[{ value: "copy", label: "Copy" }]>
  <@content>Right click here</@content>
</ContextMenu>`,
  examples: [
    {
      name: "default",
      title: "Basic",
      description:
        "Pass an `items` array of entries; `type: \"separator\"` and `type: \"label\"` entries organize the list.",
    },
    {
      name: "simple",
      title: "Simple",
      description: "A minimal menu with a `danger` entry styled as destructive.",
    },
    {
      name: "shortcuts",
      title: "Shortcuts",
      description: "Add a `shortcut` string to an item to show a keyboard hint on the right.",
    },
    {
      name: "groups",
      title: "Groups",
      description: "Use `type: \"label\"` and `type: \"separator\"` entries to group related actions.",
    },
    {
      name: "destructive",
      title: "Destructive",
      description: "Set `danger: true` on an item to style it as a destructive action.",
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "Set `disabled: true` on an item to skip it during keyboard navigation and pointer input.",
    },
    {
      name: "controlled",
      title: "Controlled",
      description: "Pass a `select` handler to react to the chosen item's `value`.",
    },
    {
      name: "context-menu-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@item>` attribute tags instead of `items=` to compose the menu directly in markup — pass `type=\"separator\"` for a divider or `type=\"label\"` for a group label. Entries render in the order they are written. An item's text can come from either a `label=` attribute or a markup body, whichever you prefer.",
    },
  ],
};
