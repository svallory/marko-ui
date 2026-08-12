// Hand-authored prose + example ordering for /docs/components/editable.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Inline editable text: a preview that switches to an input on click or focus, submits on Enter or blur, and cancels on Escape.",
  importSnippet: `import Editable from "@/components/ui/editable/editable.marko";`,
  usageSnippet: `<Editable defaultValue="Edit this text"/>`,
  examples: [
    {
      name: "default",
      title: "Basic",
      description: "An uncontrolled editable with an initial value.",
    },
    {
      name: "placeholder",
      title: "Placeholder",
      description: "Shown in preview mode when the value is empty.",
    },
    {
      name: "submit-mode",
      title: "Submit on Enter only",
      description: "Set `submitMode=\"enter\"` so blurring the input cancels instead of submitting.",
    },
    {
      name: "activation-mode",
      title: "Activation: double-click",
      description: "Set `activationMode=\"dblclick\"` to require a double-click before entering edit mode.",
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "A disabled editable ignores pointer input and is skipped by the tab order.",
    },
    {
      name: "custom-trigger",
      title: "Custom trigger",
      description: "Replace the default edit-trigger button with the `@trigger` tag parameter.",
    },
    {
      name: "controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, and use `valueCommit` to react only when the value is submitted.",
    },
  ],
};
