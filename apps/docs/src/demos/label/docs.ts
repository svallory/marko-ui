// Hand-authored prose + example ordering for /docs/components/label.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Renders an accessible label associated with a control.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Label>`,
  importSnippet: `import Label from "@/components/ui/label/label.marko";`,
  usageSnippet: `<Label for="email">Your email address</Label>`,
  examples: [
    {
      name: "label-demo",
      title: "Basic",
      description: "A label paired with a checkbox via the shared id.",
    },
    {
      name: "label-input-with-label",
      title: "With input",
      description: "A label stacked above an input, associated by `for`/`id`.",
    },
    {
      name: "label-required",
      title: "Required field",
      description: "Compose arbitrary markup, such as a required-field marker, inside the label.",
    },
    {
      name: "label-disabled",
      title: "Disabled",
      description:
        "Label styles react to a disabled peer or an ancestor with `data-disabled=\"true\"`, dimming the text and blocking pointer events.",
    },
    {
      name: "label-in-field",
      title: "Label in Field",
      description:
        "For form fields, use the `Field` component, which includes built-in `FieldLabel`, `FieldDescription`, and `FieldError` parts.",
    },
    // field-demo: upstream's "Label in Field" section (base/label.mdx) embeds
    // this exact demo (also documented on the field page). demos-manifest.ts
    // is generated per-component-directory with no cross-component reuse
    // (see apps/docs/scripts/build-demos-manifest.ts's componentDirectories()
    // + per-dir readdir), so field-demo.marko is duplicated verbatim here
    // (byte-for-byte copy of apps/docs/src/demos/field/field-demo.marko)
    // rather than symlinked or imported cross-directory.
    {
      name: "field-demo",
      title: "Field",
      description:
        "The same `Field`/`FieldLabel`/`FieldDescription` composition shown on the Field page — reach for it whenever a label needs to sit inside a full form field.",
    },
    {
      name: "label-rtl",
      title: "RTL",
      description: "Label restyles correctly under a `dir=\"rtl\"` ancestor — no component changes needed.",
    },
  ],
};
