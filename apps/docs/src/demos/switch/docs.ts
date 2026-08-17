// Hand-authored prose + example ordering for /docs/components/switch.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A control that allows the user to toggle between checked and not checked.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Switch>`,
  importSnippet: `import Switch from "@/components/ui/switch/switch.marko";`,
  usageSnippet: `<Switch checked:=airplaneMode/>`,
  examples: [
    {
      name: "switch-demo",
      title: "Basic",
      description: "A switch paired with a label via the shared id.",
    },
    {
      name: "switch-checked",
      title: "Checked",
      description:
        "Pass `checked` for a controlled switch, or `defaultChecked` to set only the initial state.",
    },
    {
      name: "switch-disabled",
      title: "Disabled",
      description: "A disabled switch is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "switch-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `checked` prop without a change handler never moves. Pair it with `checkedChange`, or use Marko's bind shorthand `checked:=state`.",
    },
  ],
};
