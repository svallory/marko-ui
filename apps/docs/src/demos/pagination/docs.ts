// Hand-authored prose + example ordering for /docs/components/pagination.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Pagination with page navigation, next and previous links.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Pagination>`,
  importSnippet: `import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";`,
  usageSnippet: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#"/>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis/>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#"/>
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
  examples: [
    {
      name: "pagination-demo",
      title: "Default",
      description: "Compose `Pagination` from its parts: `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationEllipsis`, `PaginationPrevious`/`PaginationNext`.",
    },
    {
      name: "pagination-simple",
      title: "Simple",
      description: "A simple pagination with only page numbers.",
    },
    {
      name: "pagination-icons-only",
      title: "Icons only",
      description: "Use just the previous and next buttons without page numbers. This is useful for data tables with a rows-per-page selector.",
    },
    {
      name: "pagination-rtl",
      title: "RTL",
      description: "Pass `dir=\"rtl\"` on `Pagination` — the previous/next chevrons carry `mu-rtl-flip` and mirror automatically. Pair with the `text` prop on `PaginationPrevious`/`PaginationNext` to translate the labels.",
    },
  ],
  composition: `\`\`\`text
Pagination
└── PaginationContent
    ├── PaginationItem
    │   └── PaginationPrevious
    ├── PaginationItem
    │   └── PaginationLink
    ├── PaginationItem
    │   └── PaginationEllipsis
    └── PaginationItem
        └── PaginationNext
\`\`\``,
  accessibilityNotes: [
    "`Pagination` renders `role=\"navigation\"` with `aria-label=\"pagination\"`.",
    "`PaginationLink` gets `aria-current=\"page\"` and `data-active` when `isActive` is set; `data-slot=\"pagination-link\"` on every link.",
    "`PaginationEllipsis` is `aria-hidden` with a visually-hidden \"More pages\" label for screen readers.",
    "`PaginationPrevious`/`PaginationNext` carry `aria-label=\"Go to previous page\"` / `\"Go to next page\"`; pass `disabled`/`aria-disabled` yourself when at the first/last page — this is a presentational kit, not a machine, so there is no built-in disabled-state derivation.",
    "RTL: set `dir=\"rtl\"` on `Pagination` — the chevron icons carry `mu-rtl-flip` and mirror automatically. Pass a `text` prop to `PaginationPrevious`/`PaginationNext` to translate their labels (added for RTL locales, e.g. \"السابق\"/\"التالي\" — see upstream's Changelog).",
  ],
};
