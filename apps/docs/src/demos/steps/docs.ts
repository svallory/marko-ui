// Hand-authored prose + example ordering for /docs/components/steps.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Numbered indicators with connecting separators, prev/next triggers, per-step content, and a completed state — for wizard-style flows.",
  importSnippet: `import Steps from "@/components/ui/steps/steps.marko";`,
  usageSnippet: `<Steps items=steps>
  <@content|index|>Content for step ${"${index + 1}"}</@content>
  <@completedContent>All steps complete.</@completedContent>
</Steps>`,
  examples: [
    {
      name: "steps-horizontal",
      title: "Horizontal",
      description: "The default orientation: numbered indicators laid out left to right.",
    },
    {
      name: "steps-vertical",
      title: "Vertical",
      description: "Pass `orientation=\"vertical\"` to stack the indicators along the left edge.",
    },
    {
      name: "steps-linear",
      title: "Linear",
      description: "Pass `linear` to require each step be completed in order before moving forward.",
    },
    {
      name: "steps-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `step` prop without a change handler never moves. Pair it with `stepChange`, or use Marko's bind shorthand `step:=state`.",
    },
  ],
};
