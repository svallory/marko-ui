// Hand-authored prose + example ordering for /docs/components/checkbox.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A control that allows the user to toggle between checked, unchecked, and indeterminate states.",
  importSnippet: `import Checkbox from "@/components/ui/checkbox/checkbox.marko";`,
  usageSnippet: `<Checkbox checked:=accepted>\n  <span>Accept terms and conditions</span>\n</Checkbox>`,
  examples: [
    {
      name: "checkbox-demo",
      title: "Basic",
      description: "A checkbox paired with a label as its content.",
    },
    {
      name: "checkbox-checked",
      title: "Checked",
      description: "Pass `checked` for a controlled checkbox, or `defaultChecked` to set only the initial state.",
    },
    {
      name: "checkbox-indeterminate",
      title: "Indeterminate",
      description: 'Pass `checked="indeterminate"` for the tri-state "select all" pattern.',
    },
    {
      name: "checkbox-disabled",
      title: "Disabled",
      description: "A disabled checkbox is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "checkbox-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `checked` prop without a change handler never moves. Pair it with `checkedChange`, or use Marko's bind shorthand `checked:=state`.",
    },
  ],
};
