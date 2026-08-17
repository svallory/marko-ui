// Hand-authored prose + example ordering for /docs/components/button-group.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A container that groups related buttons together with consistent styling.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<ButtonGroup>`,
  importSnippet: `import ButtonGroup from "@/components/ui/button-group/button-group.marko";`,
  usageSnippet: `<ButtonGroup>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</ButtonGroup>`,
  examples: [
    {
      name: "default",
      title: "Basic",
      description: "Buttons that share adjacent borders and merge their corners.",
    },
    {
      name: "orientation",
      title: "Orientation",
      description: "Set `orientation=\"vertical\"` to stack the group instead of rowing it.",
    },
    {
      name: "sizes",
      title: "Size",
      description: "Control the size of the whole group through the `size` prop on each `Button`.",
    },
    {
      name: "nested",
      title: "Nested",
      description: "Nest `ButtonGroup` components to add spacing between related clusters of buttons.",
    },
    {
      name: "separator",
      title: "Separator",
      description:
        "`ButtonGroupSeparator` visually divides buttons within a group. Buttons with the `outline` variant already have a border and rarely need one; other variants benefit from it.",
    },
    {
      name: "split",
      title: "Split",
      description: "A split button: two buttons separated by a `ButtonGroupSeparator`.",
    },
    {
      name: "text",
      title: "With Text",
      description: "`ButtonGroupText` renders a non-interactive label inside the group.",
    },
  ],
};
