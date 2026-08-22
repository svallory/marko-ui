// Hand-authored prose + example ordering for /docs/components/switch.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
//
// Order follows upstream's base/switch.mdx (data/shadcn-ui/apps/v4/content/
// docs/components/base/switch.mdx): demo, description, choice-card,
// disabled, invalid, sizes, rtl. Our pre-existing checked/controlled demos
// (parity-report's "extraDemos" — kept, never flagged as missing) are
// folded in right after "disabled", their closest upstream relative.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A control that allows the user to toggle between checked and not checked.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Switch>`,
  importSnippet: `import Switch from "@/components/ui/switch/switch.marko";`,
  usageSnippet: `<Switch checked:=airplaneMode/>`,
  examples: [
    {
      name: "switch-demo",
      title: "Basic",
      description: "A switch paired with a label via the shared id.",
    },
    {
      name: "switch-description",
      title: "Description",
      description: "Pair a switch with a `Field`, `FieldLabel`, and `FieldDescription` for a labeled row with helper text.",
    },
    {
      name: "switch-choice-card",
      title: "Choice Card",
      description: "Style the switch's own root label as a clickable card, with the title/description in its `content` body.",
    },
    {
      name: "switch-disabled",
      title: "Disabled",
      description: "A disabled switch is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "switch-checked",
      title: "Checked",
      description:
        "Pass `checked` for a controlled switch, or `defaultChecked` to set only the initial state.",
    },
    {
      name: "switch-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `checked` prop without a change handler never moves. Pair it with `checkedChange`, or use Marko's bind shorthand `checked:=state`.",
    },
    {
      name: "switch-invalid",
      title: "Invalid",
      description: "Add the `invalid` prop to the `Switch` to mark it invalid; add `invalid` to a wrapping `Field` for matching label/description styling.",
    },
    {
      name: "switch-sizes",
      title: "Size",
      description: "Use the `size` prop (`\"sm\"` or `\"default\"`) to change the size of the switch.",
    },
    {
      name: "switch-rtl",
      title: "RTL",
      description: "Pass `dir=\"rtl\"` to mirror the switch and its thumb travel direction for right-to-left languages.",
    },
  ],
  composition:
    "`Switch` is a single-file, single-part component: its root element is already a `<label>` (Zag's root/label part), wrapping a styled control `<span>` (with the thumb inside) and the hidden native `<input type=\"checkbox\">`. Pass label text as the switch's `content` body to render it inside that root label — the switch's own `aria-labelledby` then targets it automatically. There is no separate `SwitchLabel` or `SwitchThumb` part to import; visual pieces are addressed with CSS (`mu-switch`, `mu-switch-thumb`) or `data-slot` selectors (`switch`, `switch-thumb`, `switch-text`), not composition.",
  accessibilityNotes: [
    'Renders a native hidden `<input type="checkbox">` under a styled root `<label>`, so it participates in native form submission and inherits the platform checkbox\'s semantics.',
    "Always give the switch an accessible name: either pass label text as its own `content` body (its root element is already a `<label>`) or set `aria-label`/`aria-labelledby` directly — never wrap a `Switch` in a second `<label>` or external `FieldLabel`, since that nests two label elements around the same control.",
    'Pass the `invalid` prop (a real `@zag-js/switch` machine prop) to set `aria-invalid`/`data-invalid` on the control for a failed-validation state; pair it with `invalid` on a wrapping `Field` for matching label/description styling.',
    "Set `disabled` to remove the control from the tab order and block pointer input.",
    'Pass `dir="rtl"` to mirror the control and thumb travel direction for right-to-left languages; it is a real machine prop forwarded to every part (root, control, thumb, hidden input), not just a CSS toggle.',
  ],
  accessibilityKeyboard: [
    { keys: "Space", description: "Toggles the switch between checked and unchecked." },
    { keys: "Tab", description: "Moves focus to the next focusable element; skips the switch entirely when `disabled`." },
  ],
};
