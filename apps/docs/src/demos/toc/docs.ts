// Hand-authored prose + example ordering for /docs/components/toc.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Tracks headings in a scroll container, highlights the active section while scrolling, and smooth-scrolls to a heading on click.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Toc>`,
  importSnippet: `import Toc from "@/components/ui/toc/toc.marko";`,
  usageSnippet: `<Toc items=items scrollEl=() => scrollContainer()/>`,
  examples: [
    {
      name: "toc-demo",
      title: "Basic",
      description: "A table of contents tracking headings inside a scrollable panel.",
    },
    {
      name: "toc-with-title",
      title: "With title",
      description: "Pass `title` to render a heading above the list of links.",
    },
    {
      name: "toc-nested",
      title: "Nested headings",
      description: "Each item's `depth` controls its indentation, so `h2`/`h3` outlines nest naturally.",
    },
    {
      name: "toc-controlled",
      title: "Controlled",
      description:
        "Listen for `activeIdsChange` (or `onActiveChange` for the full details) to read the active headings without taking over control of the list.",
    },
  ],
};
