/**
 * The blocks catalog surfaced by /blocks.
 *
 * Blocks are whole-page compositions built from marko-ui registry components.
 * Their source lives at packages/registry/default/blocks/<name>/ and is
 * emitted as a `registry:block` item by packages/registry/scripts/build-registry.ts.
 *
 * `previewHeight` is the intrinsic height (px) the gallery gives the block's
 * preview iframe before scaling — blocks that are full app shells need more
 * room than a centered card.
 */
export interface BlockCategory {
  name: string;
  slug: string;
}

export interface BlockEntry {
  name: string;
  title: string;
  description: string;
  categories: string[];
  registryDependencies: string[];
  previewHeight: number;
}

// shadcn's registryCategories (data/shadcn-ui/apps/v4/lib/categories.ts), in
// their exact order. shadcn marks Dashboard and Authentication `hidden` and
// filters them out of its blocks-nav — we render every category, so there is
// no `hidden` flag here at all.
export const BLOCK_CATEGORIES: BlockCategory[] = [
  { name: "Featured", slug: "" },
  { name: "Sidebar", slug: "sidebar" },
  { name: "Dashboard", slug: "dashboard" },
  { name: "Authentication", slug: "authentication" },
  { name: "Login", slug: "login" },
  { name: "Signup", slug: "signup" },
];

export const BLOCKS: BlockEntry[] = [
  {
    // Not part of shadcn's registry (data/shadcn-ui/apps/v4/registry/new-york-v4/blocks
    // has no calendar-01 and __blocks__.json doesn't list one) — this block is
    // marko-ui's own. Left uncategorized, matching shadcn's rendering behavior
    // for uncategorized blocks: getAllBlocks's category filter is skipped when
    // `categories` is empty, so an uncategorized block still appears on the
    // Featured ("") view but on no category page.
    name: "calendar-01",
    title: "Calendar 01",
    description: "An appointment booking card pairing an inline calendar with selectable time slots.",
    categories: [],
    registryDependencies: ["utils", "calendar", "card", "button", "separator"],
    previewHeight: 780,
  },
  {
    name: "dashboard-01",
    title: "Dashboard 01",
    description: "A dashboard shell with a collapsible sidebar, metric cards, and a sortable data table.",
    categories: ["dashboard"],
    registryDependencies: ["utils", "sidebar", "separator", "button", "badge", "card", "data-table"],
    previewHeight: 900,
  },
  {
    name: "login-01",
    title: "Login 01",
    description: "A simple login form on a centered card.",
    categories: ["authentication", "login"],
    registryDependencies: ["utils", "button", "card", "input", "label"],
    previewHeight: 640,
  },
  {
    name: "login-02",
    title: "Login 02",
    description: "A two-column login page with a form on one side and an image on the other.",
    categories: ["authentication", "login"],
    registryDependencies: ["utils", "button", "input", "label", "separator", "field"],
    previewHeight: 700,
  },
  {
    name: "login-03",
    title: "Login 03",
    description: "A login form with Apple and Google sign-in options above an email and password form.",
    categories: ["authentication", "login"],
    registryDependencies: ["utils", "button", "card", "input", "label", "separator", "field"],
    previewHeight: 700,
  },
  {
    name: "login-04",
    title: "Login 04",
    description: "A two-column login page with social login options and a side image panel.",
    categories: ["authentication", "login"],
    registryDependencies: ["utils", "button", "card", "field", "input"],
    previewHeight: 700,
  },
  {
    name: "login-05",
    title: "Login 05",
    description: "A centered login form with social login buttons and a field separator.",
    categories: ["authentication", "login"],
    registryDependencies: ["utils", "button", "field", "input"],
    previewHeight: 700,
  },
  {
    name: "sidebar-01",
    title: "Sidebar 01",
    description: "A simple sidebar with navigation grouped by section, a version switcher, and a search form.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "separator", "breadcrumb", "dropdown-menu", "input", "label"],
    previewHeight: 900,
  },
  {
    name: "sidebar-02",
    title: "Sidebar 02",
    description: "A collapsible sidebar with a version switcher, search form, and collapsible nav groups.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "collapsible", "dropdown-menu", "breadcrumb", "separator", "input", "label"],
    previewHeight: 900,
  },
  {
    name: "sidebar-03",
    title: "Sidebar 03",
    description: "A sidebar with submenus and breadcrumb navigation.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "separator", "breadcrumb"],
    previewHeight: 900,
  },
  {
    name: "sidebar-04",
    title: "Sidebar 04",
    description: "A documentation sidebar with nested navigation sections and a breadcrumb header.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "separator", "breadcrumb"],
    previewHeight: 900,
  },
  {
    name: "sidebar-05",
    title: "Sidebar 05",
    description: "A sidebar with collapsible nav items and a search form.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "collapsible", "breadcrumb", "separator", "input", "label"],
    previewHeight: 900,
  },
  {
    name: "sidebar-06",
    title: "Sidebar 06",
    description: "A documentation sidebar with dropdown navigation sections and a newsletter opt-in card in the footer.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "dropdown-menu", "breadcrumb", "separator", "card", "input", "button"],
    previewHeight: 900,
  },
  {
    name: "sidebar-07",
    title: "Sidebar 07",
    description: "A collapsible sidebar with a team switcher, collapsible nav groups, a projects list, and a user menu.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "collapsible", "dropdown-menu", "breadcrumb", "separator", "avatar"],
    previewHeight: 900,
  },
  {
    name: "sidebar-08",
    title: "Sidebar 08",
    description: "A sidebar with collapsible sections, projects with a dropdown menu, secondary nav, and a user menu.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "collapsible", "dropdown-menu", "avatar", "breadcrumb", "separator"],
    previewHeight: 900,
  },
  {
    name: "sidebar-09",
    title: "Sidebar 09",
    description: "A collapsible sidebar with a two-panel layout: an icon rail for primary navigation and a secondary list panel, plus a user menu in the footer.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "separator", "breadcrumb", "label", "switch", "input", "avatar", "dropdown-menu"],
    previewHeight: 900,
  },
  {
    name: "sidebar-10",
    title: "Sidebar 10",
    description: "A sidebar with a team switcher, favorites, collapsible workspaces, and secondary navigation, plus a header with page actions.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "dropdown-menu", "popover", "collapsible", "breadcrumb", "separator", "button"],
    previewHeight: 900,
  },
  {
    name: "sidebar-11",
    title: "Sidebar 11",
    description: "A sidebar with a recursive file tree and a list of changed files, each with a status badge.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "separator", "breadcrumb", "collapsible"],
    previewHeight: 900,
  },
  {
    name: "sidebar-12",
    title: "Sidebar 12",
    description: "A sidebar with a calendar and a list of favorite calendars.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "separator", "breadcrumb", "calendar", "collapsible", "avatar", "dropdown-menu"],
    previewHeight: 900,
  },
  {
    name: "sidebar-13",
    title: "Sidebar 13",
    description: "A settings dialog with a static navigation sidebar and a scrollable content pane.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "dialog", "breadcrumb", "button"],
    previewHeight: 900,
  },
  {
    name: "sidebar-14",
    title: "Sidebar 14",
    description: "A right-side sidebar with a table of contents grouped by section.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "breadcrumb"],
    previewHeight: 900,
  },
  {
    name: "sidebar-15",
    title: "Sidebar 15",
    description: "A dual sidebar layout with a collapsible left navigation panel and a static right panel showing a calendar and events.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "separator", "breadcrumb", "collapsible", "calendar", "avatar", "dropdown-menu"],
    previewHeight: 900,
  },
  {
    name: "sidebar-16",
    title: "Sidebar 16",
    description: "A sidebar with a header and a search form.",
    categories: ["sidebar", "dashboard"],
    registryDependencies: ["utils", "sidebar", "collapsible", "dropdown-menu", "breadcrumb", "separator", "avatar", "button", "label", "input"],
    previewHeight: 900,
  },
  {
    name: "signup-01",
    title: "Signup 01",
    description: "A simple signup form on a centered card.",
    categories: ["authentication", "signup"],
    registryDependencies: ["utils", "button", "card", "field", "input"],
    previewHeight: 760,
  },
  {
    name: "signup-02",
    title: "Signup 02",
    description: "A signup page with a full-height split layout, form on one side and a cover image on the other.",
    categories: ["authentication", "signup"],
    registryDependencies: ["utils", "button", "field", "input", "label", "separator"],
    previewHeight: 760,
  },
  {
    name: "signup-03",
    title: "Signup 03",
    description: "A signup form with name, email, and password fields on a centered card.",
    categories: ["authentication", "signup"],
    registryDependencies: ["utils", "button", "card", "input", "label"],
    previewHeight: 760,
  },
  {
    name: "signup-04",
    title: "Signup 04",
    description: "A two-column signup form with social sign up options and a decorative side panel.",
    categories: ["authentication", "signup"],
    registryDependencies: ["utils", "button", "card", "field", "input", "label", "separator"],
    previewHeight: 760,
  },
  {
    name: "signup-05",
    title: "Signup 05",
    description: "A centered signup form with social signup options and a field separator.",
    categories: ["authentication", "signup"],
    registryDependencies: ["utils", "button", "field", "input"],
    previewHeight: 760,
  },
];

export function blocksInCategory(slug: string): BlockEntry[] {
  if (slug === "") return BLOCKS;
  return BLOCKS.filter((block) => block.categories.includes(slug));
}

export function findBlock(name: string): BlockEntry | undefined {
  return BLOCKS.find((block) => block.name === name);
}
