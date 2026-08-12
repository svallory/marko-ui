// Hand-authored prose + example ordering for /docs/components/input.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A text input field for forms and user data entry, with built-in styling and accessibility features.",
  importSnippet: `import Input from "@/components/ui/input/input.marko";`,
  usageSnippet: `<Input type="email" placeholder="Email"/>`,
  examples: [
    {
      name: "input-demo",
      title: "Basic",
      description: "A plain text input with a placeholder.",
    },
    {
      name: "input-label",
      title: "With label",
      description: "Pair an input with a `Label` via a shared `id`.",
    },
    {
      name: "input-disabled",
      title: "Disabled",
      description: "A disabled input ignores pointer input and is skipped by the tab order.",
    },
    {
      name: "input-value",
      title: "With value",
      description: "Pass `value` to render the input pre-filled.",
    },
    {
      name: "input-invalid",
      title: "Invalid",
      description: "Set `aria-invalid=\"true\"` to style the input for a failed validation state.",
    },
    {
      name: "input-file",
      title: "File",
      description: "Use `type=\"file\"` to create a file picker with matching styling.",
    },
    {
      name: "input-number",
      title: "Number",
      description: "Use `type=\"number\"` to restrict input to numeric values.",
    },
    {
      name: "input-password",
      title: "Password",
      description: "Use `type=\"password\"` to mask sensitive input.",
    },
  ],
};
