// Hand-authored prose + example ordering for /docs/components/navigation-menu.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A collection of links for navigating websites.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<NavigationMenu>`,
  importSnippet: `import NavigationMenu from "@/components/ui/navigation-menu/navigation-menu.marko";`,
  usageSnippet: `<NavigationMenu items=[{ type: "menu", value: "one", label: "Item One", links: [{ title: "Link", href: "#" }] }]/>`,
  // Upstream documents a NavigationMenu/NavigationMenuList/NavigationMenuItem/
  // NavigationMenuTrigger/NavigationMenuContent/NavigationMenuLink/
  // NavigationMenuIndicator composition tree (separate Radix/Base UI
  // sub-components). Our port is a single authored file
  // (packages/shadcn/ui/navigation-menu/navigation-menu.marko) with one
  // part, so isCompound is false and the auto-generated tree never renders
  // — this prose documents the equivalent anatomy for our API instead of
  // reproducing upstream's per-part tree, since we genuinely don't have
  // separate NavigationMenuTrigger/NavigationMenuContent/etc. tags: entries
  // are data (`items=`) or attr tags (`<@entry>`), and `<NavigationMenu>`
  // renders the list, items, triggers, links, indicator, and shared
  // viewport all from that one input.
  composition: `\`<NavigationMenu>\` renders the whole tree from its input — there is no separate trigger/content/link sub-component to compose:

\`\`\`text
NavigationMenu (nav, data-slot="navigation-menu")
└── ul (data-slot="navigation-menu-list")
    ├── li (data-slot="navigation-menu-item"), one per entry
    │   ├── button (data-slot="navigation-menu-trigger") — entries with type="menu"
    │   └── a (data-slot="navigation-menu-link") — plain link entries
    ├── div (data-slot="navigation-menu-indicator") — caret that slides under the active trigger
    └── div (data-slot="navigation-menu-viewport-positioner")
        └── div (data-slot="navigation-menu-viewport") — shared animated panel
            └── div (data-slot="navigation-menu-content"), one per menu entry

Feed entries as data with \`items=[{ type: "menu" | "link", ... }]\`, or compose them directly in markup with \`<@entry>\` attribute tags — both normalize to the same tree above. A menu entry's panel renders its \`links=\` array (with an optional \`featured\` lead link), a \`content\` body passed to \`<@entry type="menu">\`, or the top-level \`content\` render-prop keyed by entry value.`,
  examples: [
    {
      name: "navigation-menu-demo",
      title: "Default",
      description: "Menu items open a shared content panel of links; plain items navigate directly.",
    },
    {
      name: "navigation-menu-panel",
      title: "Rich content panel",
      description: "Use the `content` body to append extra markup — like a featured link or a footer note — to a panel.",
    },
    {
      name: "navigation-menu-disabled",
      title: "Disabled item",
      description: "Set `disabled` on a menu item to skip it in the tab order and ignore pointer input.",
    },
    {
      name: "navigation-menu-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
    {
      name: "navigation-menu-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@entry>` attribute tags instead of `items=` to compose each entry directly in markup: `type=\"menu\"` opens a shared content panel (the tag body renders inside it), and the default kind is a plain bar link. One tag name means entries render in exactly the order written — links can sit before, between, or after menus.",
    },
    {
      name: "navigation-menu-precedence",
      title: "Precedence",
      description:
        "When both `items=` and `<@entry>` attribute tags are supplied, the attribute tags win — the `items=` entry here is replaced entirely.",
    },
    {
      name: "navigation-menu-rtl",
      title: "RTL",
      description:
        "Pass `dir=\"rtl\"` (with `align=\"end\"` to mirror the viewport) for right-to-left layout. Unlike dropdown-menu/menubar's static-wrapper RTL demos, `dir` here is a real @zag-js/navigation-menu machine prop our Input type re-exposes, so this drives the machine's own RTL positioning — see the in-file comment for why the demo uses a static Arabic locale instead of upstream's live language switcher.",
    },
  ],
};
