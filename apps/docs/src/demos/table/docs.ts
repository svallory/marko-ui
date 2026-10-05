// Hand-authored prose + example ordering for /docs/components/table.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A responsive table component.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Table>, <TableHeader>, <TableBody>, <TableFooter>, <TableRow>, <TableHead>, <TableCell>, <TableCaption>`,
  importSnippet: `import Table from "@/components/ui/table/table.marko";
import TableHeader from "@/components/ui/table/header.marko";
import TableBody from "@/components/ui/table/body.marko";
import TableFooter from "@/components/ui/table/footer.marko";
import TableRow from "@/components/ui/table/row.marko";
import TableHead from "@/components/ui/table/head.marko";
import TableCell from "@/components/ui/table/cell.marko";
import TableCaption from "@/components/ui/table/caption.marko";`,
  usageSnippet: `<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV001</TableCell>
      <TableCell>Paid</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
  examples: [
    {
      name: "table-demo",
      title: "Basic",
      description:
        "A full table built from `TableCaption`, `TableHeader`, `TableBody`, and `TableFooter`, with `TableRow` holding `TableHead` or `TableCell` children.",
    },
    {
      name: "table-footer",
      title: "Footer",
      description:
        "Add a `TableFooter` after `TableBody` for a summary row — it renders a `<tfoot>` styled to match the header.",
    },
    {
      name: "table-actions",
      title: "Actions",
      description:
        "A table showing per-row actions using a `DropdownMenu` in the last cell.",
    },
    {
      name: "table-selected-row",
      title: "Selected row",
      description:
        "Add `data-state=\"selected\"` to a `TableRow` to highlight it — the row's `hover:bg-muted` and `data-[state=selected]:bg-muted` styles handle the rest.",
    },
    {
      name: "table-rtl",
      title: "RTL",
      description:
        "`Table` and its parts restyle for right-to-left reading direction with no extra markup — set `dir=\"rtl\"` on the `Table` root.",
    },
  ],
};
