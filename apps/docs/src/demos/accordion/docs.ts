// Hand-authored prose + example ordering for /docs/components/accordion.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A vertically stacked set of interactive headings that each reveal a section of content.",
  importSnippet: `import Accordion from "@/components/ui/accordion/accordion.marko";`,
  usageSnippet: `<Accordion items=items collapsible/>`,
  examples: [
    {
      name: "default",
      title: "Default",
      description:
        "A single item at a time can be open. Pass `collapsible` to allow closing the open item.",
    },
    {
      name: "multiple",
      title: "Multiple",
      description: "Pass `multiple` to allow more than one item to be open at the same time.",
    },
    {
      name: "not-collapsible",
      title: "Not collapsible",
      description:
        "Without `collapsible`, the open item cannot be closed by clicking its own trigger.",
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "Pass `disabled` to disable every trigger in the accordion.",
    },
    {
      name: "controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`.",
    },
    {
      name: "accordion-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@item>` attribute tags instead of `items=` to compose each item's title and content directly in markup.",
    },
  ],
};
