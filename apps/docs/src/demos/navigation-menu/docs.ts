// Hand-authored prose + example ordering for /docs/components/navigation-menu.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A collection of links for navigating websites.",
  importSnippet: `import NavigationMenu from "@/components/ui/navigation-menu/navigation-menu.marko";`,
  usageSnippet: `<NavigationMenu items=[{ type: "menu", value: "one", label: "Item One", links: [{ title: "Link", href: "#" }] }]/>`,
  examples: [
    {
      name: "default",
      title: "Default",
      description: "Menu items open a shared content panel of links; plain items navigate directly.",
    },
    {
      name: "panel",
      title: "Rich content panel",
      description: "Use the `content` body to append extra markup — like a featured link or a footer note — to a panel.",
    },
    {
      name: "disabled",
      title: "Disabled item",
      description: "Set `disabled` on a menu item to skip it in the tab order and ignore pointer input.",
    },
    {
      name: "controlled",
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
  ],
};
