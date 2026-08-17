// Hand-authored prose + example ordering for /docs/components/spinner.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "An indicator that can be used to show a loading state.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Spinner>`,
  importSnippet: `import Spinner from "@/components/ui/spinner/spinner.marko";`,
  usageSnippet: `<Spinner/>`,
  examples: [
    {
      name: "spinner-demo",
      title: "Basic",
      description: "A spinner with the default size and color.",
    },
    {
      name: "spinner-size",
      title: "Size",
      description: "Use the `size-*` utility class to change the size of the spinner.",
    },
    {
      name: "spinner-color",
      title: "Color",
      description: "The spinner inherits `currentColor`, so any text color utility changes it.",
    },
    {
      name: "spinner-text",
      title: "With text",
      description: "Pair a spinner with a label to describe what is loading.",
    },
    {
      name: "spinner-button",
      title: "Button",
      description: "Place a spinner before a button's label to show a loading state.",
    },
    {
      name: "spinner-badge",
      title: "Badge",
      description: "Place a spinner before a badge's label to show a loading state.",
    },
  ],
};
