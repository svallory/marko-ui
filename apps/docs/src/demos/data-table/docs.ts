// Hand-authored prose + example ordering for /docs/components/data-table.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A table built on TanStack Table's core row model — pass it columns and data and it handles rendering, header/cell composition, and click-to-sort.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<DataTable>`,
  importSnippet: `import DataTable from "@/components/ui/data-table/data-table.marko";`,
  usageSnippet: `<DataTable columns=columns data=data/>`,
  examples: [
    {
      name: "data-table-demo",
      title: "Basic",
      description:
        "Pass an array of `{ accessorKey, header }` column definitions and a matching data array. A `cell` function on a column formats its value — here the amount column renders as currency.",
    },
    {
      name: "data-table-sorting",
      title: "Sorting",
      description:
        "Every column sorts by default: click a header to cycle ascending, descending, and unsorted. Sorting state lives inside the component, so no extra wiring is needed.",
    },
    {
      name: "data-table-formatted-cells",
      title: "Cell formatting",
      description:
        "A column's `cell(row)` function can return any string, number, or Marko body — use it to format values or capitalize text without changing the underlying data.",
    },
    {
      name: "data-table-empty",
      title: "Empty state",
      description: "An empty `data` array renders a single centered \"No results.\" row instead of an empty table body.",
    },
    {
      name: "data-table-rtl",
      title: "RTL",
      description:
        "The table works unchanged under `dir=\"rtl\"`; wrap it (or an ancestor) in `dir=\"rtl\"` and text alignment, sort-icon placement, and cell order follow the writing direction. See the [RTL guide](/docs/rtl) for site-wide setup.",
    },
  ],
};
