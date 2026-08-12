// Hand-authored prose + example ordering for /docs/components/kbd.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Used to display textual user input from keyboard.",
  importSnippet: `import Kbd from "@/components/ui/kbd/kbd.marko";`,
  usageSnippet: `<Kbd>Ctrl</Kbd>`,
  examples: [
    {
      name: "kbd-demo",
      title: "Basic",
      description: "Group individual keys with `KbdGroup`.",
    },
    {
      name: "kbd-group",
      title: "Group",
      description: "Use `KbdGroup` to group keyboard keys together inside a sentence.",
    },
    {
      name: "kbd-button",
      title: "Button",
      description: "Use `Kbd` inside a `Button` component to display a keyboard key inside a button.",
    },
    {
      name: "kbd-tooltip",
      title: "Tooltip",
      description: "Use `Kbd` inside a `Tooltip` component to display a tooltip with a keyboard key.",
    },
    {
      name: "kbd-input-group",
      title: "Input Group",
      description: "Use `Kbd` inside an `InputGroupAddon` component to display a keyboard key inside an input group.",
    },
  ],
};
