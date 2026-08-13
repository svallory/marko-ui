// Hand-authored prose + example ordering for /docs/components/tabs.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  importSnippet: `import Tabs from "@/components/ui/tabs/tabs.marko";`,
  usageSnippet: `<Tabs|value| items=[{ value: "account", label: "Account" }, { value: "password", label: "Password" }]>
  <p>Showing the ${"${value}"} panel.</p>
</Tabs>`,
  examples: [
    {
      name: "tabs-demo",
      title: "Default",
      description: "Pass `items` and read the active `value` from the tag's default parameter.",
    },
    {
      name: "tabs-disabled",
      title: "Disabled tab",
      description: "Set `disabled: true` on an item to skip it in the tab order and block selection.",
    },
    {
      name: "tabs-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
    {
      name: "tabs-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@trigger>` and `<@panel>` attribute tags instead of `items=` to compose each tab's label and panel content directly in markup.",
    },
    {
      name: "tabs-precedence",
      title: "Precedence",
      description:
        "When both `items=` and attribute tags are supplied, the attribute tags win — the `items=` entry here is replaced entirely.",
    },
    {
      name: "tabs-hybrid",
      title: "Hybrid",
      description:
        "`<@trigger>` and `<@panel>` normalize independently: mixing `<@trigger>` tags with `items=` (and no `<@panel>` tags) pairs attr-tag triggers with items=-derived panels. Supply both tag names (or neither) to stay on one source.",
    },
  ],
};
