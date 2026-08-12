// Hand-authored prose + example ordering for /docs/components/badge.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays a badge or a component that looks like a badge.",
  importSnippet: `import Badge from "@/components/ui/badge/badge.marko";`,
  usageSnippet: `<Badge variant="default | secondary | destructive | outline">Badge</Badge>`,
  examples: [
    {
      name: "default",
      title: "Default",
      description: "A badge with the default variant.",
    },
    {
      name: "variants",
      title: "Variants",
      description: "Use the `variant` prop to change the appearance of the badge.",
    },
    {
      name: "status",
      title: "Status examples",
      description: "Badges are a common way to surface state, such as the status of a record.",
    },
    {
      name: "with-icon",
      title: "With icon",
      description: "Render an icon alongside the badge text.",
    },
    {
      name: "numeric",
      title: "Numeric",
      description: "Badges also work well for short counts, like unread totals.",
    },
  ],
};
