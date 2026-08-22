// Hand-authored prose + example ordering for /docs/components/select.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays a list of options for the user to pick from, triggered by a button.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Select>`,
  importSnippet: `import Select from "@/components/ui/select/select.marko";`,
  usageSnippet: `<Select items=fruits placeholder="Select a fruit"/>`,
  composition: `\
Select is a single unsplit component — it has no separate trigger/content/item
parts to compose. Its anatomy (all internal, rendered from \`items=\` or
\`groups=\`) mirrors upstream's tree:

\`\`\`text
Select
├── select-field-label      (visible label, or sr-only when omitted)
├── select-control
│   └── select-trigger
│       ├── select-value
│       └── select-trigger-icon
└── select-positioner        (portalled)
    └── select-content
        ├── select-scroll-up-button
        ├── select-viewport
        │   └── select-group        (only when \`groups=\` is used)
        │       ├── select-label
        │       └── select-item × N
        │           ├── select-item-indicator
        │           └── select-item-text
        └── select-scroll-down-button
\`\`\`

Use \`items=\` for a flat list, \`groups=\` for the grouped/labeled/separated
layout above, or the \`<@option>\` attribute tag to compose options directly in
markup (see the Compound example below).`,
  examples: [
    {
      name: "select-demo",
      title: "Basic",
      description: "Pass an `items` array of `{ value, label }` entries.",
    },
    {
      name: "select-align-item",
      title: "Align item with trigger",
      description:
        "Upstream toggles a real item-aligned positioning mode; @zag-js/select has no such concept, so this demo wires the switch to the closest analog — a `positioning.placement` change — see the in-file comment for the full deviation.",
    },
    {
      name: "select-groups",
      title: "Groups",
      description: "Pass `groups=` — an array of `{ label, items }` — to render labeled, separated option groups.",
    },
    {
      name: "select-scrollable",
      title: "Scrollable",
      description: "A select with many grouped items that scrolls within the viewport.",
    },
    {
      name: "select-disabled",
      title: "Disabled",
      description: "A disabled select is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "select-invalid",
      title: "Invalid",
      description: "Set `invalid` on `Field` and `aria-invalid` on `Select` to show an error state.",
    },
    {
      name: "select-rtl",
      title: "RTL",
      description: "Pass `dir=\"rtl\"` — a real machine prop — to drive both the DOM attribute and Zag's RTL-aware keyboard and positioning logic.",
    },
    {
      name: "select-with-label",
      title: "With label",
      description: "Pass `label` to render a visible label instead of a screen-reader-only one.",
    },
    {
      name: "select-default-value",
      title: "Default value",
      description: "Pass `defaultValue` to set the initial selection without controlling it.",
    },
    {
      name: "select-disabled-items",
      title: "Disabled items",
      description: "Set `disabled: true` on individual entries in `items` to skip them.",
    },
    {
      name: "select-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`.",
    },
    {
      name: "select-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@option>` attribute tags instead of `items=` to compose each option directly in markup.",
    },
  ],
  accessibilityKeyboard: [
    { keys: "Space / Enter", description: "Opens the listbox. When open, selects the highlighted item." },
    { keys: "ArrowDown / ArrowUp", description: "Opens the listbox, or moves the highlight to the next/previous item." },
    { keys: "Home / End", description: "Moves the highlight to the first/last item." },
    { keys: "Type-ahead", description: "Typing characters jumps the highlight to the next matching item's label." },
    { keys: "Escape", description: "Closes the listbox without changing the selection." },
    { keys: "Tab", description: "Closes the listbox and moves focus to the next focusable element." },
  ],
  accessibilityNotes: [
    "The trigger renders as a native `<button>` with `aria-haspopup`, `aria-expanded`, and `aria-controls` wired by the Zag select machine.",
    "A hidden native `<select>` mirrors the current items and value so the component participates in native form submission and browser autofill.",
    "Pass `label` for a visible field label, or omit it to fall back to a screen-reader-only label built from `placeholder`.",
    "Set `invalid` on a wrapping `Field` plus `aria-invalid` on `Select` to announce an error state — see the Invalid example.",
  ],
};
