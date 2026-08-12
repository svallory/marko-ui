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
  ],
};
