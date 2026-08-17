// Hand-authored prose + example ordering for /docs/components/popover.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays rich content in a portal, triggered by a button.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Popover>`,
  importSnippet: `import Popover from "@/components/ui/popover/popover.marko";`,
  usageSnippet: `<Popover>
  <@trigger|props|>
    <button ...props>Open</button>
  </@trigger>
  <@content>
    <p>Place any content here.</p>
  </@content>
</Popover>`,
  examples: [
    {
      name: "popover-demo",
      title: "Default",
      description: "A popover with a header and description, anchored to its trigger.",
    },
    {
      name: "popover-placement",
      title: "Placement",
      description: "Pass `positioning` through to the underlying Zag machine to control placement.",
    },
    {
      name: "popover-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: an `open` prop without a change handler never moves. Pair it with `openChange`, or use Marko's bind shorthand `open:=state`.",
    },
  ],
};
