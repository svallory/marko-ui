// Hand-authored prose + example ordering for /docs/components/date-picker.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A popover-style date field that combines a text input and a calendar for selecting a date.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<DatePicker>`,
  importSnippet: `import DatePicker from "@/components/ui/date-picker/date-picker.marko";`,
  usageSnippet: `<DatePicker valueChange=(date) => setDate(date)/>`,
  // Upstream (base style) has no `DatePicker` root component at all — its
  // "date picker" is a hand-composed `Popover` + `Calendar` pairing, and
  // its Composition section documents exactly that tree:
  //   Popover
  //   ├── PopoverTrigger
  //   └── PopoverContent
  //       └── Calendar
  // This port ships BOTH: a self-contained `<DatePicker>` (single .marko
  // file, its own text input + trigger + calendar wired to
  // @zag-js/date-picker) for the common case, AND the same `Popover` +
  // `Calendar` primitives upstream composes by hand, for every case that
  // needs a shape `<DatePicker>` doesn't cover (ranges, dropdown captions,
  // custom input syncing). Every example below that isn't the plain
  // `<DatePicker>` demo is composed exactly the way upstream composes it —
  // `Popover` for the trigger/positioning, `Calendar` for the grid — so the
  // anatomy upstream documents is real, reachable API here too, just not
  // gated behind one all-in-one tag.
  composition:
    "`<DatePicker>` is a complete, self-contained field (input + trigger + " +
    "calendar) built on `@zag-js/date-picker` — reach for it first. For " +
    "anything it doesn't cover (a date range, a dropdown month/year " +
    "caption, syncing a free-text input), compose `Popover` and `Calendar` " +
    "directly, the same way upstream does:\n\n" +
    "```text\n" +
    "Popover\n" +
    "├── @trigger (render-prop)\n" +
    "└── (body)\n" +
    "    └── Calendar\n" +
    "```\n\n" +
    "`Popover`'s `@trigger` receives the machine's trigger props to spread " +
    "onto any element (a `Button`, an `InputGroupButton`…), and the tag's " +
    "own body holds whatever should render inside the positioned panel — " +
    "typically a `Calendar`. See the Popover and Calendar pages for their " +
    "full APIs.",
  examples: [
    {
      name: "date-picker-demo",
      title: "Basic",
      description: "A date picker with no initial value.",
    },
    {
      name: "date-picker-basic",
      title: "Simple",
      description:
        "The upstream composition — `Popover` + `Calendar` wired together by hand instead of the all-in-one `DatePicker`.",
    },
    {
      name: "date-picker-range",
      title: "Range Picker",
      description:
        "`Calendar selectionMode=\"range\"` with `numOfMonths={2}` for selecting a date range across two visible months.",
    },
    {
      name: "date-picker-dob",
      title: "Date of Birth",
      description:
        "`Calendar captionLayout=\"dropdown\"` swaps the month/year label for native `<select>`s, and the popover closes itself once a date is picked.",
    },
    {
      name: "date-picker-input",
      title: "Input",
      description:
        "An `InputGroup` text field kept in sync with a `Calendar` behind a popover trigger button.",
    },
    {
      name: "date-picker-time",
      title: "Time Picker",
      description:
        "A date `Popover`/`Calendar` pair alongside a plain `<input type=\"time\">` — there's no separate time-picker component upstream either.",
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
    {
      name: "date-picker-rtl",
      title: "RTL",
      description:
        "Set `dir=\"rtl\"` on a wrapping element (matching the surrounding document direction); the trigger icon and positioner flip automatically.",
    },
    // date-picker-natural-language: SKIPPED. Upstream parses free text
    // ("in 2 days", "next week") via the `chrono-node` npm package, which
    // is not a dependency of this repo (nor of any other date-related
    // port here) and this task's file territory (apps/docs/src/demos/
    // date-picker/) can't add one. Porting a fake/partial parser would be
    // exactly the kind of approximation the porting rules forbid, so this
    // demo is left unported rather than faked. A faithful port would
    // reuse the same InputGroup+Popover+Calendar shape as
    // date-picker-input, swapping `parseInput`'s `new Date(text)` call
    // for `chrono-node`'s `parseDate`, once that dependency is available.
  ],
  accessibilityNotes: [
    "The text input and the calendar trigger button share one `data-slot=\"date-picker-control\"` group; typing a valid date and picking one from the calendar both update the same controlled `value`.",
    "The calendar panel is a popover (`role` and `aria-expanded` on the trigger button come from `@zag-js/date-picker`'s `getTriggerProps()`), so it's reachable and dismissible with the same keyboard model as `Popover`.",
    "Day cells expose `aria-selected` and `aria-disabled` via `getDayTableCellTriggerProps()`; the composed `Popover`+`Calendar` examples (range, dropdown, input-sync) get the same semantics from `Calendar` directly.",
    "Set `disabled` to remove the whole field from the tab order, or `readOnly` to keep the value visible and focusable while blocking changes from both the input and the calendar.",
  ],
  accessibilityKeyboard: [
    { keys: "Tab / Shift+Tab", description: "Moves focus between the text input and the calendar-trigger button, then into the open calendar panel." },
    { keys: "Enter / Space", description: "Opens the calendar panel when the trigger button is focused; selects the focused day when a day cell is focused." },
    { keys: "Arrow keys", description: "Moves focus one day at a time within the calendar grid (composed examples get this from `Calendar`)." },
    { keys: "Page Up / Page Down", description: "Moves focus to the same day in the previous/next month." },
    { keys: "Home / End", description: "Moves focus to the first/last day of the visible week." },
    { keys: "Escape", description: "Closes the calendar panel without changing the value." },
  ],
};
