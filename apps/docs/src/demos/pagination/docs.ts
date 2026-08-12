// Hand-authored prose + example ordering for /docs/components/pagination.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Pagination with page navigation, next and previous links.",
  importSnippet: `import Pagination from "@/components/ui/pagination/pagination.marko";`,
  usageSnippet: `<Pagination count=100 pageSize=10 page=1/>`,
  examples: [
    {
      name: "default",
      title: "Default",
      description: "Pass `count` and `pageSize` to derive the total number of pages, and `page` for the active page.",
    },
    {
      name: "sibling-count",
      title: "Sibling count",
      description:
        "`siblingCount` controls how many pages are shown around the active page before an ellipsis appears.",
    },
    {
      name: "few-pages",
      title: "Few pages",
      description: "When every page fits within the sibling range, no ellipsis is rendered.",
    },
    {
      name: "controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `page` prop without a change handler never moves. Pair it with `pageChange`.",
    },
  ],
};
