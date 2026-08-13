// Hand-authored prose + example ordering for /docs/components/listbox.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "An always-visible list of options with single or multiple selection and keyboard navigation.",
  importSnippet: `import Listbox from "@/components/ui/listbox/listbox.marko";`,
  usageSnippet: `<Listbox items=fruits label="Favorite fruit" defaultValue=["apple"]/>`,
  examples: [
    {
      name: "listbox-demo",
      title: "Basic",
      description: "A single-selection listbox with a label.",
    },
    {
      name: "listbox-multiple",
      title: "Multiple selection",
      description: 'Pass `selectionMode="multiple"` to let the user select more than one item without modifier keys.',
    },
    {
      name: "listbox-disabled",
      title: "Disabled items",
      description: "Mark individual items with `disabled: true` to skip them in keyboard navigation and pointer input.",
    },
    {
      name: "listbox-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
    {
      name: "listbox-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@option>` attribute tags instead of `items=` to compose each option directly in markup.",
    },
  ],
};
