// Hand-authored prose + example ordering for /docs/components/collapsible.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "An interactive component which expands/collapses a panel.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Collapsible>`,
  importSnippet: `import Collapsible from "@/components/ui/collapsible/collapsible.marko";`,
  usageSnippet: `<Collapsible>
  <@trigger|triggerProps|>
    <button ...triggerProps>Can I use this in my project?</button>
  </@trigger>
  Yes. Free to use for personal and commercial projects. No attribution
  required.
</Collapsible>`,
  examples: [
    {
      name: "collapsible-demo",
      title: "Basic",
      description:
        "A trigger toggles the panel's open state; the chevron icon rotates to reflect it.",
    },
    {
      name: "collapsible-settings",
      title: "Settings Panel",
      description: "Use a trigger button to reveal additional settings.",
    },
    {
      name: "collapsible-disabled",
      title: "Disabled",
      description: "A disabled collapsible ignores pointer and keyboard input on its trigger.",
    },
    {
      name: "collapsible-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: an `open` prop without a change handler never moves. Pair it with `openChange`.",
    },
  ],
};
