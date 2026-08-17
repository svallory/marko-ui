// Hand-authored prose + example ordering for /docs/components/calendar.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "An inline, always-open date field component that allows users to select a date.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Calendar>`,
  importSnippet: `import Calendar from "@/components/ui/calendar/calendar.marko";`,
  usageSnippet: `<let/selectedDates=[] as { year: number; month: number; day: number }[]/>
<Calendar value:=selectedDates/>`,
  examples: [
    {
      name: "default",
      title: "Basic",
      description: "An uncontrolled calendar with no date selected initially.",
    },
    {
      name: "controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
    {
      name: "multiple",
      title: "Multiple",
      description: "Set `selectionMode=\"multiple\"` to allow selecting more than one date.",
    },
    {
      name: "range",
      title: "Range",
      description: "Set `selectionMode=\"range\"` to select a start and end date.",
    },
    {
      name: "min-max",
      title: "Min / Max",
      description: "Pass `min` and `max` as plain `{ year, month, day }` objects to restrict the selectable range.",
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "A disabled calendar ignores pointer input and is skipped by the tab order.",
    },
  ],
};
