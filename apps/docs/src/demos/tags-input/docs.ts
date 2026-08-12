// Hand-authored prose + example ordering for /docs/components/tags-input.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Tag chips input: type and press Enter to add, Backspace to delete the last tag, double-click a tag to edit it inline, with an optional max tag count and paste splitting.",
  importSnippet: `import TagsInput from "@/components/ui/tags-input/tags-input.marko";`,
  usageSnippet: `<TagsInput defaultValue=["marko", "zag-js"] placeholder="Add tag..."/>`,
  examples: [
    {
      name: "default",
      title: "Basic",
      description: "An uncontrolled tags input seeded with `defaultValue`.",
    },
    {
      name: "label",
      title: "With label",
      description: "Pass `label` to render an associated `<label>` above the control.",
    },
    {
      name: "max",
      title: "Max tags",
      description: "Set `max` to cap how many tags can be added.",
    },
    {
      name: "paste",
      title: "Paste splitting",
      description:
        "Set `addOnPaste` to split a comma-separated clipboard paste into individual tags.",
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "A disabled tags input ignores pointer and keyboard input.",
    },
    {
      name: "controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
  ],
};
