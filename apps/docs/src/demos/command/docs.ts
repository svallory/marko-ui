// Hand-authored prose + example ordering for /docs/components/command.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Fast, composable, unstyled command menu for searching and running actions.",
  importSnippet: `import Command from "@/components/ui/command/command.marko";`,
  usageSnippet: `<Command groups=groups placeholder="Type a command or search..."/>`,
  examples: [
    {
      name: "command-demo",
      title: "Basic",
      description: "Pass `groups` — an array of `{ label, items }` — to render a searchable list. Each item can carry an optional `shortcut`.",
    },
    {
      name: "command-scrollable",
      title: "Scrollable",
      description: "The item list scrolls once its content exceeds the fixed max height, so long groups stay usable.",
    },
    {
      name: "command-empty",
      title: "Empty state",
      description: "When a search query matches nothing, the component falls back to a \"No results found.\" message.",
    },
    {
      name: "command-controlled",
      title: "Controlled",
      description: "Pass `valueChange` to observe the selected item's value as the user navigates and picks from the list.",
    },
  ],
};
