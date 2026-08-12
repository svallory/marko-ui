// Hand-authored prose + example ordering for /docs/components/number-input.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A number input with increment/decrement steppers, min/max/step constraints, and a scrub area.",
  importSnippet: `import NumberInput from "@/components/ui/number-input/number-input.marko";`,
  usageSnippet: `<NumberInput defaultValue="0" min=0 max=100 step=5/>`,
  examples: [
    {
      name: "number-input-demo",
      title: "Basic",
      description: "An uncontrolled number input with `defaultValue` as its initial value.",
    },
    {
      name: "number-input-min-max-step",
      title: "Min / max / step",
      description:
        "Constrain the range with `min` and `max`, and set the increment amount with `step`.",
    },
    {
      name: "number-input-disabled",
      title: "Disabled",
      description:
        "A disabled number input ignores pointer and keyboard input, including the steppers and scrub area.",
    },
    {
      name: "number-input-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`.",
    },
  ],
};
