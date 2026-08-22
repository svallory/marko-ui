// Hand-authored prose + example ordering for /docs/components/skeleton.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Use to show a placeholder while content is loading.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Skeleton>`,
  importSnippet: `import Skeleton from "@/components/ui/skeleton/skeleton.marko";`,
  usageSnippet: `<Skeleton class="h-[20px] w-[100px] rounded-full"/>`,
  examples: [
    {
      name: "skeleton-demo",
      title: "Basic",
      description: "An avatar and two lines of text, each represented by a skeleton.",
    },
    {
      name: "skeleton-avatar",
      title: "Avatar",
      description: "A circular skeleton for an avatar, paired with two lines of text.",
    },
    {
      name: "skeleton-card",
      title: "Card",
      description: "A larger skeleton for an image or media block, paired with text lines.",
    },
    {
      name: "skeleton-text",
      title: "Text",
      description: "A paragraph of loading text, with the last line shorter than the rest.",
    },
    {
      name: "skeleton-form",
      title: "Form",
      description: "Skeleton placeholders for labeled form fields and a submit button.",
    },
    {
      name: "skeleton-table",
      title: "Table",
      description: "Skeleton rows for a table, each column a different width.",
    },
    {
      name: "skeleton-rtl",
      title: "RTL",
      description: "Skeleton markup mirrors correctly under `dir=\"rtl\"`.",
    },
  ],
  accessibilityNotes: [
    "`Skeleton` renders a plain `<div>` with no ARIA role of its own — it communicates loading state visually, not to assistive technology.",
    "Wrap the region being replaced in a live region (e.g. `aria-busy=\"true\"` or `aria-live=\"polite\"` on a parent) so screen reader users are told content is loading, and update or remove it once real content renders.",
  ],
};
