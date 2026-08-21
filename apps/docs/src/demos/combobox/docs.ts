// Hand-authored prose + example ordering for /docs/components/combobox.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Autocomplete input and command palette with a list of suggestions, filtered as the user types.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Combobox>`,
  importSnippet: `import Combobox from "@/components/ui/combobox/combobox.marko";`,
  usageSnippet: `<Combobox items=frameworks placeholder="Select framework..."/>`,
  examples: [
    {
      name: "combobox-demo",
      title: "Default",
      description:
        "Type to filter the list, or use the trigger to open the full set of items.",
    },
    {
      name: "combobox-disabled",
      title: "Disabled",
      description: "Pass `disabled` to disable the input and trigger.",
    },
    {
      name: "combobox-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`.",
    },
  ],
};
