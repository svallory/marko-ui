// Hand-authored prose + example ordering for /docs/components/kbd.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Used to display textual user input from keyboard.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Kbd>`,
  importSnippet: `import Kbd from "@/components/ui/kbd/kbd.marko";`,
  usageSnippet: `<Kbd>Ctrl</Kbd>`,
  examples: [
    {
      name: "kbd-demo",
      title: "Basic",
      description: "Group individual keys with `KbdGroup`.",
    },
    {
      name: "kbd-group",
      title: "Group",
      description: "Use `KbdGroup` to group keyboard keys together inside a sentence.",
    },
    {
      name: "kbd-button",
      title: "Button",
      description: "Use `Kbd` inside a `Button` component to display a keyboard key inside a button.",
    },
    {
      name: "kbd-tooltip",
      title: "Tooltip",
      description: "Use `Kbd` inside a `Tooltip` component to display a tooltip with a keyboard key.",
    },
    {
      name: "kbd-input-group",
      title: "Input Group",
      description: "Use `Kbd` inside an `InputGroupAddon` component to display a keyboard key inside an input group.",
    },
    {
      name: "kbd-rtl",
      title: "RTL",
      description: "Pass `dir=\"rtl\"` to a wrapping element to mirror `Kbd`/`KbdGroup` layout for right-to-left languages.",
    },
  ],
  composition:
    "`Kbd` and `KbdGroup` are both plain, single-file elements (`<kbd>` and a styled wrapper `<div>` — no Zag machine, no sub-parts to import): `KbdGroup` renders `Kbd` children directly (`<KbdGroup><Kbd>...</Kbd><Kbd>...</Kbd></KbdGroup>`) — there is no separate `KbdKey` or similar sub-tag.",
  accessibilityNotes: [
    "`Kbd` renders a native `<kbd>` element, which the accessibility tree exposes as textual content (not an interactive control) — screen readers announce its text but do not treat it as a button or landmark.",
    "`Kbd` sets `pointer-events-none` since it displays a static key/shortcut label rather than something clickable; wrap it in a `Button` or `Tooltip` trigger when the underlying action IS clickable, rather than making the `Kbd` itself interactive.",
    "Neither `Kbd` nor `KbdGroup` exposes a machine `dir` prop — pass `dir=\"rtl\"` as a plain native attribute on `Kbd`, `KbdGroup`, or a wrapping element; layout mirrors via Tailwind's logical-property utilities with no component changes required.",
  ],
};
