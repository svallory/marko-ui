// Hand-authored prose + example ordering for /docs/components/spinner.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "An indicator that can be used to show a loading state.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Spinner>`,
  importSnippet: `import Spinner from "@/components/ui/spinner/spinner.marko";`,
  usageSnippet: `<Spinner/>`,
  examples: [
    {
      name: "spinner-demo",
      title: "Basic",
      description: "A spinner with the default size and color.",
    },
    {
      name: "spinner-custom",
      title: "Customization",
      description:
        "Spinner is a single-file component: swap its icon or markup by editing `spinner.marko` directly rather than passing a prop.",
    },
    {
      name: "spinner-size",
      title: "Size",
      description: "Use the `size-*` utility class to change the size of the spinner.",
    },
    {
      name: "spinner-color",
      title: "Color",
      description: "The spinner inherits `currentColor`, so any text color utility changes it.",
    },
    {
      name: "spinner-text",
      title: "With text",
      description: "Pair a spinner with a label to describe what is loading.",
    },
    {
      name: "spinner-button",
      title: "Button",
      description: "Place a spinner before a button's label to show a loading state.",
    },
    {
      name: "spinner-badge",
      title: "Badge",
      description: "Place a spinner before a badge's label to show a loading state.",
    },
    {
      name: "spinner-input-group",
      title: "Input Group",
      description: "Show a loading state inside an input group's addon.",
    },
    {
      name: "spinner-empty",
      title: "Empty",
      description: "Use a spinner in an `Empty` state to indicate a request is in progress.",
    },
    {
      name: "spinner-rtl",
      title: "RTL",
      description: "Spinner and its parts restyle correctly for right-to-left layouts via `dir=\"rtl\"`.",
    },
  ],
  accessibilityNotes: [
    "Spinner renders `role=\"status\"` and a fixed `aria-label=\"Loading\"` on the root `<svg>` so assistive technology announces the loading state without extra markup.",
    "The `animate-spin` motion is purely decorative — screen readers rely on the `status` role and label, not the animation, so the loading state is still communicated if motion is reduced or disabled.",
    "When pairing a spinner with visible text (see the \"With text\" and \"Button\" examples), the text is redundant with `aria-label=\"Loading\"` for screen reader users but still valuable for sighted users — this is the same tradeoff upstream ships and is not a deviation.",
  ],
};
