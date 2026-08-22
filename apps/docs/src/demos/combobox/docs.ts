// Hand-authored prose + example ordering for /docs/components/combobox.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Autocomplete input and command palette with a list of suggestions, filtered as the user types.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Combobox>`,
  importSnippet: `import Combobox from "@/components/ui/combobox/combobox.marko";`,
  usageSnippet: `<Combobox items=frameworks placeholder="Select framework..."/>`,
  // Upstream (base-ui) is a full compound-component tree (Combobox,
  // ComboboxInput, ComboboxContent, ComboboxItem, ComboboxChips, ...). Our
  // port is a single `<Combobox items=/groups=/.../>` tag driven entirely by
  // props and a `@zag-js/combobox` machine — there is one part, so
  // `isCompound` is false and this prose stands in for upstream's three
  // Composition trees (Simple / With chips / With groups and collection).
  composition: `
Our \`<Combobox>\` is a single tag, not a compound-component tree — everything
upstream expresses as nested parts (\`ComboboxInput\`, \`ComboboxContent\`,
\`ComboboxItem\`, \`ComboboxChips\`...) is a prop or a rendered slot here,
driven by one \`@zag-js/combobox\` machine.

**Simple** (see [Default](#combobox-demo)): pass \`items\`. The tag renders its
own input, trigger button, and a floating list — no assembly required.

\`\`\`text
Combobox (items=)
├── input           (data-slot="combobox-input")
├── trigger button  (data-slot="combobox-trigger")
└── positioner      (data-slot="combobox-positioner", portalled)
    └── list        (data-slot="combobox-list")
        └── item    (data-slot="combobox-item", one per entry)
\`\`\`

**With chips** (see [Multiple Selection](#combobox-multiple)): pass
\`multiple\`. The single input is swapped for a chip row with an inline text
input — selected items render as \`data-slot="combobox-chip"\` pills, each
with its own remove button.

\`\`\`text
Combobox (items= multiple)
├── chips            (data-slot="combobox-chips")
│   ├── chip         (data-slot="combobox-chip", one per selected value)
│   └── chip input   (data-slot="combobox-chip-input")
└── positioner → list → item  (same as Simple)
\`\`\`

**With groups** (see [Groups](#combobox-groups)): pass \`groups\` alongside
the flat \`items\` (items still drives the filterable collection; groups is a
display-only regrouping of the same values). Each group renders a label and
its own item block, separated visually.

\`\`\`text
Combobox (items= groups=)
└── positioner → list
    ├── group        (data-slot="combobox-group")
    │   ├── label    (data-slot="combobox-label")
    │   └── collection (data-slot="combobox-collection")
    │       └── item (one per group entry)
    ├── separator    (data-slot="combobox-separator", between groups)
    └── group ...
\`\`\`
`.trim(),
  examples: [
    {
      name: "combobox-demo",
      title: "Default",
      description:
        "Type to filter the list, or use the trigger to open the full set of items.",
    },
    {
      name: "combobox-basic",
      title: "Basic",
      description: "A simple combobox with a list of frameworks.",
    },
    {
      name: "combobox-multiple",
      title: "Multiple",
      description:
        "Pass `multiple` for multi-select with chips. Pair with `inputBehavior=\"autohighlight\"` to highlight the first match while typing.",
    },
    {
      name: "combobox-clear",
      title: "Clear Button",
      description: "Pass `showClear` to show a clear (\"x\") button once a value is selected.",
    },
    {
      name: "combobox-groups",
      title: "Groups",
      description: "Pass `groups` alongside `items` to render a separated, labeled grouping of the same values.",
    },
    // combobox-custom: SKIPPED — upstream renders a caller-supplied
    // component per item (`<ComboboxItem>{(item) => <Item .../>}</ComboboxItem>`).
    // Our `<Combobox>` has no item-content slot/render-prop — item display
    // text is hard-coded to `item.label` in combobox.marko. Closing this
    // requires a component-source change (out of scope here); reported as
    // blocked-needs-component-change.
    {
      name: "combobox-invalid",
      title: "Invalid",
      description: "Pass `invalid` to mark the combobox invalid (sets `aria-invalid`/`data-invalid` throughout).",
    },
    {
      name: "combobox-disabled",
      title: "Disabled",
      description: "Pass `disabled` to disable the input and trigger.",
    },
    {
      name: "combobox-auto-highlight",
      title: "Auto Highlight",
      description:
        "Pass `inputBehavior=\"autohighlight\"` to automatically highlight the first matching item while filtering.",
    },
    // combobox-popup: SKIPPED — upstream triggers the combobox from an
    // arbitrary button via `<ComboboxTrigger render={<Button/>}>` and moves
    // the search input inside the popover content. Our port has no
    // trigger-render-prop / alternate-anchor mode: the input, trigger
    // button, and floating list are all fixed parts of the one root tag.
    // Closing this requires a component-source change (out of scope here);
    // reported as blocked-needs-component-change.
    // combobox-input-group: SKIPPED — upstream nests `<ComboboxInput>`
    // inside an `<InputGroupAddon>` to prefix an icon. Our input is a plain
    // `<input>` inside a fixed `.mu-combobox-input` control div with no
    // addon slot; the `input-group` package component isn't composable
    // with `<Combobox>`. Closing this requires a component-source change
    // (out of scope here); reported as blocked-needs-component-change.
    {
      name: "combobox-rtl",
      title: "RTL",
      description:
        "`dir` is a real `@zag-js/combobox` prop — it drives both the DOM attribute and Zag's RTL-aware keyboard/positioning logic.",
    },
    {
      name: "combobox-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`.",
    },
  ],
  accessibilityNotes: [
    "Built on `@zag-js/combobox`, which implements the [ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) (`role=\"combobox\"` on the input, `role=\"listbox\"` on the list, `aria-activedescendant` tracking the highlighted item).",
    "`invalid` sets `aria-invalid` on the input and `data-invalid` throughout the part tree, so both assistive tech and the `has-aria-invalid:` styling hooks pick it up from one prop.",
    "In `multiple` mode, each selected chip carries its own focusable remove button (`data-slot=\"combobox-chip-remove\"`) rather than only being removable by re-selecting in the list.",
    "`dir=\"rtl\"` is a real machine prop, not just a CSS toggle — it also reverses Zag's arrow-key navigation and floating-list positioning to match reading direction.",
  ],
  accessibilityKeyboard: [
    { keys: "↓ / ↑", description: "Move the highlighted item down or up the (open) list." },
    { keys: "Enter", description: "Select the highlighted item." },
    { keys: "Escape", description: "Close the list without changing the selection." },
    { keys: "Home / End", description: "Jump the highlight to the first or last item." },
  ],
};
