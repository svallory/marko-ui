// Hand-authored prose + example ordering for /docs/components/date-picker.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A popover-style date field that combines a text input and a calendar for selecting a date.",
  importSnippet: `import DatePicker from "@/components/ui/date-picker/date-picker.marko";`,
  usageSnippet: `<DatePicker valueChange=(date) => setDate(date)/>`,
  examples: [
    {
      name: "date-picker-demo",
      title: "Basic",
      description: "A date picker with no initial value.",
    },
    {
      name: "date-picker-value",
      title: "With value",
      description: "Pass `value` as an ISO date string (`YYYY-MM-DD`) to preselect a date.",
    },
    {
      name: "date-picker-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, which receives the new ISO string (or `undefined` when cleared).",
    },
    {
      name: "date-picker-disabled",
      title: "Disabled",
      description: "A disabled date picker is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "date-picker-read-only",
      title: "Read-only",
      description: "A read-only date picker shows its value but the calendar cannot change it.",
    },
    {
      name: "date-picker-locale",
      title: "Custom locale",
      description: "Pass a BCP 47 `locale` to localize month names, weekday labels, and formatting.",
    },
  ],
};
