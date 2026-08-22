// Hand-authored prose + example ordering for /docs/components/breadcrumb.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays the path to the current resource using a hierarchy of links.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Breadcrumb>, <BreadcrumbItem>, <BreadcrumbLink>, <BreadcrumbPage>, <BreadcrumbSeparator>`,
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
      title: "Demo",
      description:
        "A breadcrumb combining a link, a dropdown-collapsed section, and the current page.",
    },
    {
      name: "breadcrumb-basic",
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
      name: "breadcrumb-dropdown",
      title: "Dropdown",
      description: "Compose `BreadcrumbItem` with `DropdownMenu` to create a dropdown in the breadcrumb.",
    },
    {
      name: "breadcrumb-ellipsis",
      title: "Collapsed",
      description: "Use `BreadcrumbEllipsis` to show a collapsed state when the path is too long.",
    },
    {
      name: "breadcrumb-link",
      title: "Link component",
      // DEVIATION FROM UPSTREAM: upstream's `BreadcrumbLink` takes a
      // `render` prop so a routing library's own Link component supplies
      // the anchor markup. Our BreadcrumbLink always renders a real
      // `<a href>` — there is no separate custom-link-component API, so
      // this section documents that instead of a `render` prop we don't
      // have.
      description:
        "Our `BreadcrumbLink` always renders a real `<a href>` — there is no `render`-prop indirection to swap in a routing library's Link component.",
    },
    {
      name: "breadcrumb-rtl",
      title: "RTL",
      description: "Breadcrumb restyles correctly under `dir=\"rtl\"` with no component changes.",
    },
    {
      name: "breadcrumb-responsive",
      title: "Responsive",
      description:
        "Hide middle items below the `md` breakpoint and swap in `BreadcrumbEllipsis` with Tailwind's responsive classes.",
    },
  ],
  accessibilityNotes: [
    "The root `<nav>` carries `aria-label=\"breadcrumb\"` so assistive technology announces the trail as a landmark distinct from other navigation.",
    "`BreadcrumbPage` renders `aria-current=\"page\"` and `aria-disabled=\"true\"` on a non-interactive `<span>`, marking the current location without an actionable (and redundant) link.",
    "`BreadcrumbSeparator` and `BreadcrumbEllipsis` are `role=\"presentation\"` with `aria-hidden=\"true\"` — they are visual only and never reachable by keyboard or screen reader.",
  ],
};
