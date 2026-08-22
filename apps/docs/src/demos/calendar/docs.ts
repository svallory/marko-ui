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
  // Upstream also documents a "Changelog" section (react-day-picker's
  // `locale` prop migration steps for a *previous* version of the React
  // component). It describes react-day-picker version-to-version API
  // changes with no analog in this port (our Calendar never went through
  // that migration), so it is intentionally not carried over — there is no
  // real content to port, only React-library history.
  examples: [
    {
      name: "calendar-hijri",
      title: "Persian / Hijri / Jalali Calendar",
      description:
        "Pass `locale` and `createCalendar` (re-exported from `@internationalized/date`, the same helper upstream's own MDX points to) to switch the calendar system — no react-day-picker locale swap needed. A controlled initial `value` is intentionally omitted here: `calendar.marko`'s `toDateValue()` always builds a Gregorian `CalendarDate`, so a hardcoded non-Gregorian `{ year, month, day }` would be silently misinterpreted.",
    },
    {
      name: "calendar-basic",
      title: "Basic",
      description: "An uncontrolled calendar with no date selected initially.",
    },
    {
      name: "calendar-range",
      title: "Range",
      description: "Set `selectionMode=\"range\"` to select a start and end date.",
    },
    {
      name: "calendar-caption",
      title: "Month and Year Selector",
      description:
        "Set `captionLayout=\"dropdown\"` to swap the caption label for native month and year `<select>` controls.",
    },
    {
      name: "calendar-presets",
      title: "Presets",
      description:
        "Preset buttons that jump the selection to a relative date. Our Calendar has no separate controlled visible-month prop (upstream's `month`/`onMonthChange`) — the Zag machine re-focuses its visible month whenever `value` changes, so presets still navigate the grid correctly.",
    },
    {
      name: "calendar-time",
      title: "Date and Time Picker",
      description: "A calendar paired with `Field`/`InputGroup` time inputs in a card footer.",
    },
    {
      name: "calendar-booked-dates",
      title: "Booked dates",
      description:
        "Use `isDateUnavailable` to mark specific dates unselectable. Unlike upstream's strikethrough styling, our day button has no per-day custom-class hook, so booked days render as ordinary unselectable days rather than struck through.",
    },
    {
      name: "calendar-custom-days",
      title: "Custom Cell Size",
      description:
        "Customize cell size with the `--cell-size` CSS variable, responsively via breakpoint-specific arbitrary values. Upstream's per-day weekend/weekday price labels are omitted — our day button has no content-render slot to inject them.",
    },
    {
      name: "calendar-demo",
      title: "Dropdown caption",
      description:
        "The hero preview: `captionLayout=\"dropdown\"` swaps the caption label for native month and year `<select>` controls.",
    },
    {
      name: "calendar-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
    {
      name: "calendar-multiple",
      title: "Multiple",
      description: "Set `selectionMode=\"multiple\"` to allow selecting more than one date.",
    },
    {
      name: "calendar-min-max",
      title: "Min / Max",
      description: "Pass `min` and `max` as plain `{ year, month, day }` objects to restrict the selectable range.",
    },
    {
      name: "calendar-disabled",
      title: "Disabled",
      description: "A disabled calendar ignores pointer input and is skipped by the tab order.",
    },
    {
      name: "calendar-rtl",
      title: "RTL",
      description:
        "Pass `dir=\"rtl\"` and a BCP-47 `locale` string (the Zag machine's own locale shape, rather than upstream's `react-day-picker/locale` object) for right-to-left rendering.",
    },
    // calendar-week-numbers: SKIPPED. Upstream's `showWeekNumber` sets
    // the Zag machine's `showWeekNumbers` prop (forwardable through our
    // Input), but calendar.marko's markup never calls
    // `getWeekNumberHeaderCellProps`/`getWeekNumberCellProps` — there is
    // no week-number column in the rendered table at all, regardless of
    // the prop. Porting this demo faithfully requires adding that column
    // to packages/shadcn/ui/calendar/calendar.marko, which is out of
    // scope for a demos-only repair (component-source change needed).
  ],
};
