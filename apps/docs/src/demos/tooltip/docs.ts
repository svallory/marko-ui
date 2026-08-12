// Hand-authored prose + example ordering for /docs/components/tooltip.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A popup that displays information related to an element when it receives keyboard focus or the mouse hovers over it.",
  importSnippet: `import Tooltip from "@/components/ui/tooltip/tooltip.marko";`,
  usageSnippet: `<Tooltip content="Add to library">
  <@trigger|props|>
    <Button ...props variant="outline">Hover me</Button>
  </@trigger>
</Tooltip>`,
  examples: [
    {
      name: "tooltip-demo",
      title: "Basic",
      description:
        "The `trigger` render-prop receives the machine's trigger attributes — spread them onto whatever element the tooltip describes.",
    },
    {
      name: "tooltip-positioning",
      title: "Positioning",
      description: "Pass `positioning={ placement: \"top\" | \"right\" | \"bottom\" | \"left\" }` to control where the tooltip renders relative to its trigger.",
    },
    {
      name: "tooltip-delay",
      title: "Custom delay",
      description: "Set `openDelay` and `closeDelay` (in milliseconds) to change how quickly the tooltip appears and disappears.",
    },
  ],
};
