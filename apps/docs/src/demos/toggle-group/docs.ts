// Hand-authored prose + example ordering for /docs/components/toggle-group.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A set of two-state buttons that can be toggled on or off.",
  importSnippet: `import ToggleGroup from "@/components/ui/toggle-group/toggle-group.marko";`,
  usageSnippet: `<ToggleGroup items=[{ value: "left", label: "Left" }, { value: "center", label: "Center" }] value=["center"]/>`,
  examples: [
    {
      name: "default",
      title: "Default",
      description:
        "Pass an `items: { value, label, disabled? }[]` array and the component renders every item internally — or compose items in markup with `<@item>` attribute tags (see the Compound example). By default only one item can be pressed at a time.",
    },
    {
      name: "multiple",
      title: "Multiple selection",
      description: "Pass `multiple` to allow more than one item to be pressed at once.",
    },
    {
      name: "outline",
      title: "Outline",
      description: 'Pass `variant="outline"` for an outline style.',
    },
    {
      name: "sizes",
      title: "Size",
      description: "Pass `size` as `sm`, `default`, or `lg` to change the size of every item.",
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "Pass `disabled` on `ToggleGroup` to disable every item in the group.",
    },
    {
      name: "controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
    {
      name: "toggle-group-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@item>` attribute tags instead of `items=` to compose each option directly in markup.",
    },
  ],
};
