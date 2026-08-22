// Hand-authored prose + example ordering for /docs/components/textarea.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays a form textarea or a component that looks like a textarea.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Textarea>`,
  importSnippet: `import Textarea from "@/components/ui/textarea/textarea.marko";`,
  usageSnippet: `<Textarea placeholder="Type your message here." />`,
  examples: [
    {
      name: "textarea-demo",
      title: "Default",
      description: "A plain textarea with a placeholder.",
    },
    {
      name: "textarea-field",
      title: "With label",
      description: "Pair a textarea with a `Label` via a shared id.",
    },
    {
      name: "textarea-with-text",
      title: "With text",
      description: "Add helper text below the textarea to explain its purpose.",
    },
    {
      name: "textarea-with-value",
      title: "With value",
      description:
        "Uncontrolled initial content. `field-sizing-content` grows the textarea with its content as the user types.",
    },
    {
      name: "textarea-disabled",
      title: "Disabled",
      description: "A disabled textarea is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "textarea-invalid",
      title: "Invalid",
      description: "Set `aria-invalid` to mark the textarea as invalid.",
    },
    {
      name: "textarea-button",
      title: "Button",
      description: "Pair a textarea with a `Button` to create a message composer.",
    },
    {
      name: "textarea-rtl",
      title: "RTL",
      description: "Textareas restyle correctly under `dir=\"rtl\"` — logical Tailwind properties, not physical ones, drive layout and text alignment.",
    },
  ],
};
