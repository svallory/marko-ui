// Hand-authored prose + example ordering for /docs/components/date-input.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A segmented date input with keyboard editing and locale-aware formatting.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<DateInput>`,
  importSnippet: `import DateInput from "@/components/ui/date-input/date-input.marko";`,
  usageSnippet: `<DateInput value:=date/>`,
  examples: [
    {
      name: "date-input-demo",
      title: "Basic",
      description: "A date input with empty segments, ready for keyboard entry.",
    },
    {
      name: "date-input-value",
      title: "With value",
      description: "Pass `value` as an array of ISO date strings to pre-fill the segments.",
    },
    {
      name: "date-input-locale",
      title: "Custom locale",
      description: "Pass `locale` to change segment order and formatting, e.g. `fr-FR`.",
    },
    {
      name: "date-input-disabled",
      title: "Disabled",
      description: "A disabled date input is skipped by the tab order and ignores input.",
    },
    {
      name: "date-input-range",
      title: "Date range",
      description: "Set `selectionMode=\"range\"` to render two segment groups for a start and end date.",
    },
    {
      name: "date-input-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
  ],
};
