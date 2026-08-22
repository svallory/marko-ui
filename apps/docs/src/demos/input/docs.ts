// Hand-authored prose + example ordering for /docs/components/input.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
//
// Order follows upstream's base/input.mdx (see .upstream/shadcn-ui/apps/v4/
// content/docs/components/base/input.mdx), with our pre-existing
// label/number/password/value demos folded in near their closest upstream
// relative (parity-report's "extraDemos" — kept, never flagged as missing).
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A text input field for forms and user data entry, with built-in styling and accessibility features.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Input>`,
  importSnippet: `import Input from "@/components/ui/input/input.marko";`,
  usageSnippet: `<Input type="email" placeholder="Email"/>`,
  examples: [
    {
      name: "input-demo",
      title: "Basic",
      description: "A plain text input with a placeholder.",
    },
    {
      name: "input-basic",
      title: "Basic (text)",
      description: "A minimal text input with a placeholder.",
    },
    {
      name: "input-label",
      title: "With label",
      description: "Pair an input with a `Label` via a shared `id`.",
    },
    {
      name: "input-field",
      title: "Field",
      description: "Use `Field`, `FieldLabel`, and `FieldDescription` to create an input with a label and description.",
    },
    {
      name: "input-fieldgroup",
      title: "Field group",
      description: "Use `FieldGroup` to show multiple `Field` blocks and to build forms.",
    },
    {
      name: "input-disabled",
      title: "Disabled",
      description: "A disabled input ignores pointer input and is skipped by the tab order. To style the disabled state, add the `data-disabled` attribute to the `Field` component.",
    },
    {
      name: "input-invalid",
      title: "Invalid",
      description: "Set `aria-invalid=\"true\"` to style the input for a failed validation state. To style the invalid state, add the `data-invalid` attribute to the `Field` component.",
    },
    {
      name: "input-value",
      title: "With value",
      description: "Pass `value` to render the input pre-filled.",
    },
    {
      name: "input-file",
      title: "File",
      description: "Use `type=\"file\"` to create a file picker with matching styling.",
    },
    {
      name: "input-number",
      title: "Number",
      description: "Use `type=\"number\"` to restrict input to numeric values.",
    },
    {
      name: "input-password",
      title: "Password",
      description: "Use `type=\"password\"` to mask sensitive input.",
    },
    {
      name: "input-inline",
      title: "Inline",
      description: "Use `Field` with `orientation=\"horizontal\"` to create an inline input. Pair with `Button` to create a search input with a button.",
    },
    {
      name: "input-grid",
      title: "Grid",
      description: "Use a grid layout to place multiple inputs side by side.",
    },
    {
      name: "input-required",
      title: "Required",
      description: "Use the `required` attribute to indicate required inputs.",
    },
    {
      name: "input-badge",
      title: "Badge",
      description: "Use `Badge` in the label to highlight a recommended field.",
    },
    {
      name: "input-input-group",
      title: "Input group",
      description: "To add icons, text, or buttons inside an input, use the `InputGroup` component. See the Input Group component for more examples.",
    },
    {
      name: "input-button-group",
      title: "Button group",
      description: "To add buttons to an input, use the `ButtonGroup` component. See the Button Group component for more examples.",
    },
    {
      name: "input-form",
      title: "Form",
      description: "A full form example with multiple inputs, a select, and a button.",
    },
    {
      name: "input-rtl",
      title: "RTL",
      description: "Inputs restyle correctly under `dir=\"rtl\"` — logical Tailwind properties, not physical ones, drive layout and text alignment.",
    },
  ],
  accessibilityNotes: [
    "Renders a native `<input>` element, so it inherits every built-in keyboard, screen-reader, and form-submission behavior of the platform control — no ARIA role or custom key handling is added.",
    "Always pair the input with a visible label: either a `Label`/`FieldLabel` with a matching `for`/`id`, or an `aria-label`/`aria-labelledby` when no visible label fits (e.g. an icon-only search field).",
    "Set `aria-invalid=\"true\"` (and, inside a `Field`, `invalid`) when validation fails — screen readers announce the invalid state, and `FieldError` can describe why via `aria-describedby`.",
    "Set `disabled` to remove the control from the tab order and block pointer input; prefer `aria-disabled` with `readonly` instead when the value must still be announced or submitted.",
  ],
};
