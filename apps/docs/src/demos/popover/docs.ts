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
  <p>Place any content here.</p>
</Popover>`,
  // Upstream (both radix and base variants) documents a Composition tree
  // of separate Popover / PopoverTrigger / PopoverContent components.
  // Ours is single-file — the trigger is a render-prop (`@trigger`) and
  // the content is the tag's own default body on one `Popover` tag, so
  // api-reference.json sees one part and `isCompound` is false. Documented
  // here as prose instead of the auto-generated compound tree.
  composition: `\`Popover\` is a single-file component. Its two upstream parts map onto slots on one tag:

- \`<@trigger|props|>\` — render-prop slot; spread \`props\` onto your own trigger element (a \`Button\`, typically). Replaces upstream's separate \`PopoverTrigger\`.
- the tag's own body — rendered inside the floating panel when open. Replaces upstream's separate \`PopoverContent\`.

Upstream's \`PopoverHeader\`, \`PopoverTitle\`, and \`PopoverDescription\` have no dedicated parts in our port — they're plain markup (an \`h4\`/\`p\` pair) composed directly inside the body, as shown in the examples below.`,
  examples: [
    {
      name: "popover-demo",
      title: "Default",
      description: "A popover with a header and description, anchored to its trigger.",
    },
    {
      name: "popover-basic",
      title: "Basic",
      description: "A simple popover with a header, title, and description.",
    },
    {
      name: "popover-alignments",
      title: "Align",
      description:
        "Upstream's `align` prop lives on Radix's `PopoverContent`; our port has no separate `align` prop — Zag folds it into `positioning.placement` (e.g. `\"bottom-start\"` / `\"bottom\"` / `\"bottom-end\"`), forwarded straight through to the popper.",
    },
    {
      name: "popover-form",
      title: "With Form",
      description: "A popover with form fields inside.",
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
    {
      name: "popover-rtl",
      title: "RTL",
      description: "Set `dir=\"rtl\"` on the `Popover` (matching the surrounding document direction) so the positioner flips placement automatically.",
    },
  ],
};
