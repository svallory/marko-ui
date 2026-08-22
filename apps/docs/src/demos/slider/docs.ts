// Hand-authored prose + example ordering for /docs/components/slider.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "An input where the user selects a value from within a given range.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Slider>`,
  importSnippet: `import Slider from "@/components/ui/slider/slider.marko";`,
  usageSnippet: `<Slider defaultValue=[33] max=100 step=1/>`,
  examples: [
    {
      name: "slider-demo",
      title: "Basic",
      description: "A single-thumb slider bounded by `max` and `step`.",
    },
    {
      name: "slider-range",
      title: "Range",
      description: "Pass two values in `defaultValue` for a range slider with two thumbs.",
    },
    {
      name: "slider-multiple",
      title: "Multiple Thumbs",
      description: "Pass any number of values in `defaultValue` for multiple thumbs.",
    },
    {
      name: "slider-step",
      title: "Step",
      description: "Set `min`, `max`, and `step` to control the value increments.",
    },
    {
      name: "slider-vertical",
      title: "Vertical",
      description: "Set `orientation=\"vertical\"` for a vertical slider.",
    },
    {
      name: "slider-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`.",
    },
    {
      name: "slider-disabled",
      title: "Disabled",
      description: "A disabled slider is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "slider-rtl",
      title: "RTL",
      description:
        "`dir` is a Zag machine prop, so `dir=\"rtl\"` drives the slider's own layout and interaction direction, not just text flow.",
    },
  ],
};
