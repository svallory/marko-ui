// Hand-authored prose + example ordering for /docs/components/checkbox.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
//
// Order follows upstream's base/checkbox.mdx (see .upstream/shadcn-ui/apps/
// v4/content/docs/components/base/checkbox.mdx): hero demo first, then
// Invalid / Basic / Description / Disabled / Group / Table / RTL. Our
// pre-existing checked/indeterminate/controlled demos (parity-report's
// "extraDemos" — kept, never flagged as missing) are folded in right after
// Basic, closest to their upstream "Checked State" prose relative.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A control that allows the user to toggle between checked, unchecked, and indeterminate states.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Checkbox>`,
  importSnippet: `import Checkbox from "@/components/ui/checkbox/checkbox.marko";`,
  usageSnippet: `<Checkbox checked:=accepted>\n  <span>Accept terms and conditions</span>\n</Checkbox>`,
  examples: [
    {
      name: "checkbox-demo",
      title: "Basic",
      description:
        "Four common `Checkbox` + `Field` pairings: plain content, `FieldLabel` + `FieldDescription`, a disabled field, and `FieldTitle` + `FieldDescription`.",
    },
    {
      name: "checkbox-invalid",
      title: "Invalid",
      description: 'Set `aria-invalid="true"` on the checkbox and `invalid` on the wrapping `Field` to show the invalid styles.',
    },
    {
      name: "checkbox-basic",
      title: "Basic (label content)",
      description: "A checkbox paired with a label as its content.",
    },
    {
      name: "checkbox-checked",
      title: "Checked",
      description: "Pass `checked` for a controlled checkbox, or `defaultChecked` to set only the initial state.",
    },
    {
      name: "checkbox-indeterminate",
      title: "Indeterminate",
      description: 'Pass `checked="indeterminate"` for the tri-state "select all" pattern.',
    },
    {
      name: "checkbox-description",
      title: "Description",
      description: "Use `FieldContent` and `FieldDescription` for helper text below the label.",
    },
    {
      name: "checkbox-disabled",
      title: "Disabled",
      description: "A disabled checkbox is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "checkbox-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `checked` prop without a change handler never moves. Pair it with `checkedChange`, or use Marko's bind shorthand `checked:=state`.",
    },
    {
      name: "checkbox-group",
      title: "Group",
      description: "Use multiple `Field`s inside a `FieldSet` to create a checkbox list.",
    },
    {
      name: "checkbox-table",
      title: "Table",
      description: "A select-all/select-row pattern built from `Table` and controlled `Checkbox`es.",
    },
    {
      name: "checkbox-rtl",
      title: "RTL",
      description: 'Checkboxes restyle correctly under `dir="rtl"` — logical Tailwind properties, not physical ones, drive layout and text alignment.',
    },
  ],
  accessibilityNotes: [
    'Renders a native hidden `<input type="checkbox">` under a styled root `<label>`, so it participates in native form submission and inherits the platform\'s checkbox semantics.',
    "Always pair the checkbox with visible label text: either as the checkbox's own `content` body (its root element is already a `<label>`), or an external `FieldLabel`/`Label` with `for` matching the checkbox's `id` — never wrap a `Checkbox` in a second `<label>`, since that nests two label elements around the same control.",
    'Set `aria-invalid="true"` on the checkbox (and `invalid` on a wrapping `Field`) when validation fails — screen readers announce the invalid state.',
    "Set `disabled` to remove the control from the tab order and block pointer input.",
    'The indeterminate state (`checked="indeterminate"`) is a purely visual/ARIA cue for partial selection (e.g. "select all" with a mixed subset checked); it is not a persisted value — the underlying control is still binary "checked" or "unchecked" once toggled.',
  ],
  accessibilityKeyboard: [
    { keys: "Space", description: "Toggles the checkbox between checked and unchecked." },
    { keys: "Tab", description: "Moves focus to the next focusable element; skips the checkbox entirely when `disabled`." },
  ],
};
