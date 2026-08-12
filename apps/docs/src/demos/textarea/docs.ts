// Hand-authored prose + example ordering for /docs/components/textarea.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays a form textarea or a component that looks like a textarea.",
  importSnippet: `import Textarea from "@/components/ui/textarea/textarea.marko";`,
  usageSnippet: `<Textarea placeholder="Type your message here." />`,
  examples: [
    {
      name: "default",
      title: "Default",
      description: "A plain textarea with a placeholder.",
    },
    {
      name: "with-label",
      title: "With label",
      description: "Pair a textarea with a `Label` via a shared id.",
    },
    {
      name: "with-text",
      title: "With text",
      description: "Add helper text below the textarea to explain its purpose.",
    },
    {
      name: "with-value",
      title: "With value",
      description:
        "Uncontrolled initial content. `field-sizing-content` grows the textarea with its content as the user types.",
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "A disabled textarea is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "invalid",
      title: "Invalid",
      description: "Set `aria-invalid` to mark the textarea as invalid.",
    },
  ],
};
