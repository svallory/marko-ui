// Hand-authored prose + example ordering for /docs/components/cascade-select.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A hierarchical select with cascading panels for drilling down through nested options, e.g. Region > Country > City.",
  importSnippet: `import CascadeSelect from "@/components/ui/cascade-select/cascade-select.marko";`,
  usageSnippet: `<CascadeSelect items=items placeholder="Select a city" label="Region / Country / City"/>`,
  examples: [
    {
      name: "default",
      title: "Default",
      description: "Each level of the `items` tree opens a new panel as you drill down.",
    },
    {
      name: "default-value",
      title: "Default value",
      description: "Pass `value` as a list of path arrays to select a leaf on mount.",
    },
    {
      name: "disabled-items",
      title: "Disabled items",
      description: "Mark an individual item `disabled` to skip it in navigation and selection.",
    },
    {
      name: "controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`.",
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "Pass `disabled` to disable the whole control.",
    },
  ],
};
