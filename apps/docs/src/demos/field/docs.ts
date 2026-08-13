// Hand-authored prose + example ordering for /docs/components/field.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Validation-library-agnostic form field primitives — combine labels, controls and help text to compose accessible, groupable form fields.",
  importSnippet: `import Field from "@/components/ui/field/field.marko";
import FieldLabel from "@/components/ui/field/field-label.marko";
import FieldDescription from "@/components/ui/field/field-description.marko";`,
  usageSnippet: `<Field>
  <FieldLabel for="name">Full name</FieldLabel>
  <Input id="name" autocomplete="off" placeholder="Evil Rabbit"/>
  <FieldDescription>This appears on invoices and emails.</FieldDescription>
</Field>`,
  examples: [
    {
      name: "default",
      title: "Default",
      description: "A field pairs a label, control and helper text via matching ids.",
    },
    {
      name: "invalid",
      title: "Invalid",
      description:
        "Pass `invalid` to `Field` to switch the whole block into an error state, and `aria-invalid` on the control itself.",
    },
    {
      name: "multiple-errors",
      title: "Multiple errors",
      description: "`FieldError` accepts a list of errors and renders them as a bulleted list.",
    },
    {
      name: "horizontal",
      title: "Horizontal orientation",
      description:
        "Set `orientation=\"horizontal\"` to align the control beside the label. Pair with `FieldContent` to keep descriptions aligned.",
    },
    {
      name: "field-set",
      title: "Field set with legend and separator",
      description:
        "Group related fields with `FieldSet` and `FieldGroup`, and divide sections with `FieldSeparator`.",
    },
    {
      name: "signup",
      title: "Sign up — live validation",
      description:
        "Native `ValidityState` drives client-side validation with zero dependencies — it already understands `required`, `type=email`, `minlength` and `pattern`.",
    },
    {
      name: "fieldset-demo",
      title: "Nested field groups",
      description:
        "Combine `FieldSet`, `FieldLegend` and a grid of `Field`s to build a labeled section like an address form.",
    },
  ],
};
