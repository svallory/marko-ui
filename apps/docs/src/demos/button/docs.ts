// Hand-authored prose + example ordering for /docs/components/button.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays a button or a component that looks like a button.",
  importSnippet: `import Button from "@/components/ui/button/button.marko";`,
  usageSnippet: `<Button variant="outline">Button</Button>`,
  examples: [
    {
      name: "button-demo",
      title: "Basic",
      description: "The default button.",
    },
    {
      name: "button-variants",
      title: "Variants",
      description:
        "Six visual variants, selected with the `variant` prop. They are plain class-variance-authority variants — no machine involved.",
    },
    {
      name: "button-sizes",
      title: "Sizes",
      description: "Three sizes plus an `icon` size for square icon-only buttons.",
    },
    {
      name: "button-disabled",
      title: "Disabled",
      description:
        "`disabled` is a native `<button>` attribute — it passes straight through to the element.",
    },
  ],
};
