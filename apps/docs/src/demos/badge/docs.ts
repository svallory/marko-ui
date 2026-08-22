// Hand-authored prose + example ordering for /docs/components/badge.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays a badge or a component that looks like a badge.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Badge>`,
  importSnippet: `import Badge from "@/components/ui/badge/badge.marko";`,
  usageSnippet: `<Badge variant="default | secondary | destructive | outline | ghost | link">Badge</Badge>`,
  examples: [
    {
      name: "badge-default",
      title: "Default",
      description: "A badge with the default variant.",
    },
    {
      name: "badge-demo",
      title: "Variants",
      description: "Use the `variant` prop to change the appearance of the badge.",
    },
    {
      name: "badge-variants",
      title: "All variants",
      description: "Every variant side by side, including `ghost`, which upstream's hero demo omits.",
    },
    {
      name: "badge-status",
      title: "Status examples",
      description: "Badges are a common way to surface state, such as the status of a record.",
    },
    {
      name: "badge-icon",
      title: "With icon",
      description:
        "Render an icon alongside the badge text. Use `data-icon=\"inline-start\"` to render the icon on the left and `data-icon=\"inline-end\"` to render the icon on the right.",
    },
    {
      name: "badge-spinner",
      title: "With spinner",
      description:
        "Render a spinner inside the badge. Add `data-icon=\"inline-start\"` or `data-icon=\"inline-end\"` to the spinner, same as an icon.",
    },
    {
      name: "badge-link",
      title: "Link",
      description:
        "Our Badge has no `render`/asChild prop, so a link badge nests an `<a>` inside the badge instead of rendering the badge itself as the anchor — the badge's `[a]:hover:` styles already target a child link.",
    },
    {
      name: "badge-numeric",
      title: "Numeric",
      description: "Badges also work well for short counts, like unread totals.",
    },
    {
      name: "badge-colors",
      title: "Custom colors",
      description:
        "Customize a badge's colors by adding classes such as `bg-green-50 dark:bg-green-800` directly to the `Badge` component.",
    },
    {
      name: "badge-rtl",
      title: "RTL",
      description: "Badge has no directional logic of its own — icon placement and text flow follow the ambient `dir` attribute.",
    },
  ],
  accessibilityNotes: [
    "Renders a plain `<span>` (see `packages/shadcn/ui/badge/badge.marko`) with no implicit ARIA role — it's a visual label, not an interactive control.",
    "A badge conveying status information should not rely on color alone; pair it with text (as in the status examples) so the meaning survives for users who can't perceive color.",
    "When a badge wraps interactive content, such as the link pattern above, the interactive element itself (`<a>`, `<button>`) carries the accessibility semantics and keyboard behavior — the badge only supplies styling.",
  ],
};
