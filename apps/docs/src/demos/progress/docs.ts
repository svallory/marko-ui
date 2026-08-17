// Hand-authored prose + example ordering for /docs/components/progress.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Progress>`,
  importSnippet: `import Progress from "@/components/ui/progress/progress.marko";`,
  usageSnippet: `<Progress value=66/>`,
  examples: [
    {
      name: "progress-demo",
      title: "Basic",
      description: "A progress bar filled to a fixed `value` out of the default 0-100 range.",
    },
    {
      name: "progress-label",
      title: "With label",
      description: "Pass `label` to render a caption and live value text above the track.",
    },
    {
      name: "progress-min-max",
      title: "Min / Max",
      description: "Set a custom `min` and `max` when the value isn't a 0-100 percentage.",
    },
    {
      name: "progress-indeterminate",
      title: "Indeterminate",
      description: "Pass `value=null` when progress can't be measured yet.",
    },
    {
      name: "progress-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
  ],
};
