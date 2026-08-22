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
  importSnippet: `import Pagination from "@/components/ui/pagination/pagination.marko";`,
  usageSnippet: `<Pagination count=100 pageSize=10 page=1/>`,
  examples: [
    {
      name: "pagination-demo",
      title: "Default",
      description: "Pass `count` and `pageSize` to derive the total number of pages, and `page` for the active page.",
    },
    {
      name: "pagination-simple",
      title: "Few pages",
      description: "When every page fits within the sibling range, no ellipsis is rendered.",
    },
    {
      name: "pagination-icons-only",
      title: "Icons only",
      description:
        "Paired with a rows-per-page `Select`. Our `Pagination` always renders its page-number list (see Composition below), so this ports the layout rather than a true icons-only mode.",
    },
    {
      name: "pagination-rtl",
      title: "RTL",
      description: "Pass `dir=\"rtl\"` — the previous/next chevrons carry `mu-rtl-flip` and mirror automatically.",
    },
    {
      name: "pagination-sibling-count",
      title: "Sibling count",
      description:
        "`siblingCount` controls how many pages are shown around the active page before an ellipsis appears.",
    },
    {
      name: "pagination-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `page` prop without a change handler never moves. Pair it with `pageChange`.",
    },
  ],
  // Upstream composes Pagination from seven parts (Pagination,
  // PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis,
  // PaginationPrevious, PaginationNext) that callers assemble by hand. Our
  // port collapses all of that into ONE machine-driven component: `count`
  // and `pageSize` derive the page count, `page`/`pageChange` control the
  // active page, and the page-number list (with ellipsis) is generated
  // internally from the `@zag-js/pagination` machine's `api().pages`. There
  // is no `PaginationLink`/`PaginationItem` API to compose by hand, and no
  // `isActive` prop — the active page is derived from `page` automatically.
  //
  // Real deviation from upstream: shadcn's `PaginationPrevious`/
  // `PaginationNext` accept a `text` prop (added for RTL locales that need
  // translated labels, e.g. "السابق"/"التالي" — see upstream's Changelog).
  // Our component hard-codes the English "Previous"/"Next" strings; there
  // is no `text` prop. `dir="rtl"` still mirrors the layout and flips the
  // chevron icons via the `mu-rtl-flip` class, but the button labels always
  // read in English.
  //
  // BLOCKED (parity — missingMappedTargets: "Changelog"): `ComponentDocs`
  // (docs-types.ts) has no `changelog` field, and +page.marko has no
  // Changelog section renderer. Same blocked-needs-template-change finding
  // already recorded for card and toggle-group (see TODO.md "Component-
  // source backlog from docs-parity repair" — "docs template: `changelog`
  // field in docs-types.ts + render branch"). Recorded here for consistency
  // rather than fabricating a Changelog section from this demo directory —
  // the one real changelog item (the RTL `text` prop addition) is already
  // documented above as a genuine deviation, and again in accessibilityNotes
  // below.
  composition: `Our \`Pagination\` is a single component, not a composition:

\`\`\`text
Pagination
├── (prev trigger — \`api().getPrevTriggerProps()\`)
├── (page items — generated from \`api().pages\`, ellipsis inserted automatically)
└── (next trigger — \`api().getNextTriggerProps()\`)
\`\`\`

Configure it with \`count\`, \`pageSize\`, \`page\`/\`pageChange\`, and \`siblingCount\` instead of assembling \`PaginationItem\`/\`PaginationLink\`/\`PaginationEllipsis\` parts by hand.`,
  accessibilityNotes: [
    "The root renders `role=\"navigation\"` with `aria-label=\"pagination\"`.",
    "The active page button gets `aria-current=\"page\"`; the ellipsis is `aria-hidden` with a visually-hidden \"More pages\" label for screen readers.",
    "Previous/next triggers carry `aria-label=\"Go to previous page\"` / `\"Go to next page\"` and disable natively at the first/last page.",
    "RTL: set `dir=\"rtl\"` on `Pagination` — the chevron icons carry `mu-rtl-flip` and mirror automatically; there is no `text` prop for translating the Previous/Next labels (see Composition above).",
  ],
};
