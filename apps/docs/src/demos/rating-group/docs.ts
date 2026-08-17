// Hand-authored prose + example ordering for /docs/components/rating-group.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A star rating input with hover preview, half-star support, and keyboard navigation.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<RatingGroup>`,
  importSnippet: `import RatingGroup from "@/components/ui/rating-group/rating-group.marko";`,
  usageSnippet: `<RatingGroup label="Rate this" value:=rating/>`,
  examples: [
    {
      name: "default",
      title: "Basic",
      description: "A star rating with an initial value, uncontrolled.",
    },
    {
      name: "half-stars",
      title: "Half stars",
      description: "Pass `allowHalf` to accept and render 0.5 increments.",
    },
    {
      name: "custom-count",
      title: "Custom count",
      description: "The `count` prop sets how many items render, independent of the value scale.",
    },
    {
      name: "readonly",
      title: "Readonly",
      description: "A `readOnly` rating displays a value without accepting hover or click input.",
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "A disabled rating is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
  ],
};
