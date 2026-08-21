// Hand-authored prose + example ordering for /docs/components/tree-view.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A hierarchical list of items that can be expanded, collapsed, and selected.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<TreeView>`,
  importSnippet: `import TreeView from "@/components/ui/tree-view/tree-view.marko";`,
  usageSnippet: `<TreeView items=FILE_TREE/>`,
  examples: [
    {
      name: "tree-view-demo",
      title: "Default",
      description: "A tree of nested items, each expandable and selectable.",
    },
    {
      name: "tree-view-expanded",
      title: "Default expanded",
      description: "Pass `expandedValue` with the ids of branches that should start open.",
    },
    {
      name: "tree-view-multiple-selection",
      title: "Multiple selection",
      description: "Set `selectionMode=\"multiple\"` to let users select more than one item at once.",
    },
    {
      name: "tree-view-controlled-selection",
      title: "Controlled selection",
      description:
        "Zag machines are controlled: a `selectedValue` prop without a change handler never moves. Pair it with `selectedValueChange`, or use Marko's bind shorthand `selectedValue:=state`.",
    },
    {
      name: "tree-view-disabled",
      title: "Disabled items",
      description: "Mark any node `disabled` — branches and leaves are both skipped by pointer and keyboard interaction.",
    },
  ],
};
