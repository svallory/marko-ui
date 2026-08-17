// Hand-authored prose + example ordering for /docs/components/toggle.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A two-state button that can be either on or off.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Toggle>`,
  importSnippet: `import Toggle from "@/components/ui/toggle/toggle.marko";`,
  usageSnippet: `<Toggle>Toggle</Toggle>`,
  examples: [
    {
      name: "default",
      title: "Default",
      description: "A plain toggle button, off until clicked.",
    },
    {
      name: "outline",
      title: "Outline",
      description: 'Pass `variant="outline"` for an outline style.',
    },
    {
      name: "sizes",
      title: "Size",
      description: "Pass `size` as `sm`, `default`, or `lg` to change the toggle's size.",
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "A disabled toggle is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `pressed` prop without a change handler never moves. Pair it with `pressedChange`, or use Marko's bind shorthand `pressed:=state`.",
    },
  ],
};
