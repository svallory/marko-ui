// Sidebar navigation tree for the /docs section. Ordering here replaces
// shadcn's per-folder meta.json files — marko-run has no MDX source loader,
// so the tree is authored directly.
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
      { href: "/docs/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Styling",
    items: [
      { href: "/docs/theming", label: "Theming" },
      { href: "/docs/dark-mode", label: "Dark Mode" },
    ],
  },
  {
    title: "Contributing",
    items: [
      { href: "/docs/creating-components", label: "Creating Components" },
      { href: "/docs/zag-adapter", label: "Zag Adapter Anatomy" },
    ],
  },
];

// Flattened reading order, used to derive prev/next links on every page.
export const DOCS_NAV_FLAT: DocsNavItem[] = DOCS_NAV.flatMap((section) => section.items);
