// Sidebar navigation tree for the /docs section. Ordering here replaces
// shadcn's per-folder meta.json files — marko-run has no MDX source loader,
// so the tree is authored directly.
import { COMPONENTS } from "../../lib/components-list.ts";
import { DEMOS } from "../../demos/demos-manifest.ts";
import { titleize } from "../../lib/component-page-data.ts";

export interface DocsNavItem {
  href: string;
  label: string;
}

export interface DocsNavSection {
  title: string;
  items: DocsNavItem[];
}

export const DOCS_NAV: DocsNavSection[] = [
  {
    title: "Getting Started",
    items: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/installation", label: "Installation" },
      { href: "/docs/cli", label: "CLI" },
      { href: "/docs/components-json", label: "components.json" },
      { href: "/docs/directory", label: "Directory" },
      { href: "/docs/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Styling",
    items: [
      { href: "/docs/theming", label: "Theming" },
      { href: "/docs/dark-mode", label: "Dark Mode" },
      { href: "/docs/icons", label: "Icons" },
    ],
  },
  {
    title: "Contributing",
    items: [
      { href: "/docs/creating-components", label: "Creating Components" },
      { href: "/docs/zag-adapter", label: "Zag Adapter Anatomy" },
    ],
  },
  {
    // Components without a demos directory yet are omitted rather than
    // linked to a page that 404s — see docs/components/$name +page.marko.
    title: "Components",
    items: [
      { href: "/docs/components", label: "All Components" },
      ...COMPONENTS.filter((name) => name in DEMOS).map((name) => ({
        href: `/docs/components/${name}`,
        label: DEMOS[name].registry.title || titleize(name),
      })),
    ],
  },
];

// Flattened reading order, used to derive prev/next links on every page.
export const DOCS_NAV_FLAT: DocsNavItem[] = DOCS_NAV.flatMap((section) => section.items);
