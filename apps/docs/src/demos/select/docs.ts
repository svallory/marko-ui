// Hand-authored prose + example ordering for /docs/components/select.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays a list of options for the user to pick from, triggered by a button.",
  importSnippet: `import Select from "@/components/ui/select/select.marko";`,
  usageSnippet: `<Select items=fruits placeholder="Select a fruit"/>`,
  examples: [
    {
      name: "select-demo",
      title: "Basic",
      description: "Pass an `items` array of `{ value, label }` entries.",
    },
    {
      name: "select-with-label",
      title: "With label",
      description: "Pass `label` to render a visible label instead of a screen-reader-only one.",
    },
    {
      name: "select-default-value",
      title: "Default value",
      description: "Pass `defaultValue` to set the initial selection without controlling it.",
    },
    {
      name: "select-disabled-items",
      title: "Disabled items",
      description: "Set `disabled: true` on individual entries in `items` to skip them.",
    },
    {
      name: "select-disabled",
      title: "Disabled",
      description: "A disabled select is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "select-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`.",
    },
    {
      name: "select-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@option>` attribute tags instead of `items=` to compose each option directly in markup.",
    },
  ],
};
