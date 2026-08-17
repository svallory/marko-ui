// Hand-authored prose + example ordering for /docs/components/separator.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Visually or semantically separates content.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Separator>`,
  importSnippet: `import Separator from "@/components/ui/separator/separator.marko";`,
  usageSnippet: `<Separator/>`,
  examples: [
    {
      name: "separator-demo",
      title: "Default",
      description:
        "A horizontal separator between a heading and description, and vertical separators between inline links.",
    },
    {
      name: "separator-vertical",
      title: "Vertical",
      description: "Set `orientation=\"vertical\"` to separate content side by side.",
    },
    {
      name: "separator-semantic",
      title: "Semantic (non-decorative)",
      description:
        "Pass `decorative=false` when the separator conveys real document structure, so it renders with `role=\"separator\"` for assistive technology instead of being hidden from it.",
    },
  ],
};
