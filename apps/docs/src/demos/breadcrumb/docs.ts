// Hand-authored prose + example ordering for /docs/components/breadcrumb.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays the path to the current resource using a hierarchy of links.",
  importSnippet: `import Breadcrumb from "@/components/ui/breadcrumb/breadcrumb.marko";
import BreadcrumbItem from "@/components/ui/breadcrumb/item.marko";
import BreadcrumbLink from "@/components/ui/breadcrumb/link.marko";
import BreadcrumbPage from "@/components/ui/breadcrumb/page.marko";
import BreadcrumbSeparator from "@/components/ui/breadcrumb/separator.marko";`,
  usageSnippet: `<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/">Home</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator/>
  <BreadcrumbItem>
    <BreadcrumbLink href="/components">Components</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator/>
  <BreadcrumbItem>
    <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
  </BreadcrumbItem>
</Breadcrumb>`,
  examples: [
    {
      name: "breadcrumb-demo",
      title: "Basic",
      description: "A basic breadcrumb with a home link and a components link.",
    },
    {
      name: "breadcrumb-separator",
      title: "Custom separator",
      description:
        "Pass children to `BreadcrumbSeparator` to replace the default `/` with a custom separator.",
    },
    {
      name: "breadcrumb-ellipsis",
      title: "Collapsed",
      description: "Use `BreadcrumbEllipsis` to show a collapsed state when the path is too long.",
    },
    {
      name: "breadcrumb-responsive",
      title: "Responsive",
      description:
        "Hide middle items below the `md` breakpoint and swap in `BreadcrumbEllipsis` with Tailwind's responsive classes.",
    },
  ],
};
