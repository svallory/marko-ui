// Hand-authored prose + example ordering for /docs/components/radio-group.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.",
  importSnippet: `import RadioGroup from "@/components/ui/radio-group/radio-group.marko";`,
  usageSnippet: `<RadioGroup items=[{ value: "option-one", label: "Option One" }, { value: "option-two", label: "Option Two" }] value:=selected/>`,
  examples: [
    {
      name: "radio-group-demo",
      title: "Basic",
      description:
        "Pass an `items: { value, label, disabled? }[]` array; the component renders every item internally instead of a compound `RadioGroup` / `RadioGroupItem` pair.",
    },
    {
      name: "radio-group-disabled-item",
      title: "Disabled item",
      description: "Set `disabled` on a single item to remove it from the tab order and ignore pointer input.",
    },
    {
      name: "radio-group-disabled",
      title: "Disabled",
      description: "Pass `disabled` on `RadioGroup` itself to disable every item in the group.",
    },
    {
      name: "radio-group-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
  ],
};
