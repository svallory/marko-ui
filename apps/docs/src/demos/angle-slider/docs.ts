// Hand-authored prose + example ordering for /docs/components/angle-slider.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A circular dial slider for selecting an angle value, controlled by arrow keys or dragging the thumb around the track.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<AngleSlider>`,
  importSnippet: `import AngleSlider from "@/components/ui/angle-slider/angle-slider.marko";`,
  usageSnippet: `<AngleSlider defaultValue=45/>`,
  examples: [
    {
      name: "angle-slider-demo",
      title: "Basic",
      description: "An uncontrolled angle slider with an initial value.",
    },
    {
      name: "angle-slider-step",
      title: "Step",
      description: "Pass `step` to snap the value to fixed degree increments while dragging.",
    },
    {
      name: "angle-slider-disabled",
      title: "Disabled",
      description: "A disabled slider is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "angle-slider-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange` to track updates.",
    },
  ],
};
