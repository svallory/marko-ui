// Hand-authored prose + example ordering for /docs/components/radio-group.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<RadioGroup>`,
  importSnippet: `import RadioGroup from "@/components/ui/radio-group/radio-group.marko";`,
  usageSnippet: `<RadioGroup items=[{ value: "option-one", label: "Option One" }, { value: "option-two", label: "Option Two" }] value:=selected/>`,
  // See notes/docs-canonical-structure.md's "Anatomy" section: RadioGroup
  // is a single-file, non-compound component (api-reference.json sees one
  // part, so `isCompound` is false and the auto composition-tree never
  // renders) — this prose is the documented substitute upstream also gives
  // a Composition tree for.
  composition: `RadioGroup
├── item (from \`items=\`, or an \`<@item>\` attribute tag)
└── item`,
  examples: [
    {
      name: "radio-group-demo",
      title: "Basic",
      description:
        "Pass an `items: { value, label, disabled? }[]` array and the component renders every item internally — or compose options in markup with `<@item>` attribute tags (see the Compound example).",
    },
    // radio-group-description: SKIPPED — upstream wraps a standalone
    // `<RadioGroupItem>` in `<Field>`/`<FieldContent>`/`<FieldLabel>`/
    // `<FieldDescription>` to pair each option with description text. Our
    // `<RadioGroup>` has no standalone `RadioGroupItem` tag — every item's
    // label+control markup (label > control span + hidden input + text
    // span) is rendered internally by radio-group.marko, and its `content`
    // slot only replaces the text span's inner content, not the whole item
    // wrapper, so a Field-based per-item description can't be composed.
    // Closing this requires a component-source change (out of scope here);
    // reported as blocked-needs-component-change.
    // radio-group-choice-card: SKIPPED — same constraint as
    // radio-group-description, and worse: upstream also relocates the
    // control to the END of the row and wraps the whole `<Field>` in a
    // clickable `<FieldLabel>` card. Our fixed item wrapper (control first,
    // text second, always inside our own `<label>`) has no slot to
    // restructure or relocate. Closing this requires a component-source
    // change (out of scope here); reported as blocked-needs-component-change.
    {
      name: "radio-group-fieldset",
      title: "Fieldset",
      description:
        "Wrap `RadioGroup` in `FieldSet`/`FieldLegend`/`FieldDescription` to group items with a label and description. Upstream additionally wraps each item in its own `<Field orientation=\"horizontal\">`; our items already render an equivalent label+control pairing internally, so only the outer fieldset composition is needed.",
    },
    {
      name: "radio-group-disabled",
      title: "Disabled item",
      description: "Set `disabled` on a single item to remove it from the tab order and ignore pointer input.",
    },
    {
      name: "radio-group-disabled-group",
      title: "Disabled",
      description: "Pass `disabled` on `RadioGroup` itself to disable every item in the group.",
    },
    // radio-group-invalid: SKIPPED — upstream sets `aria-invalid` on
    // individual `RadioGroupItem`s and `data-invalid` on their wrapping
    // `<Field>`s to show per-item validation state. Our `<RadioGroup>`
    // items accept no `invalid`/`aria-invalid` field (see
    // `RadioGroupItem`/`RadioGroupItemAttrs` in radio-group.marko) and
    // `getItemProps`/`getItemControlProps` are called internally, so
    // there's no way for a demo to inject that attribute per item. Closing
    // this requires a component-source change (out of scope here);
    // reported as blocked-needs-component-change.
    {
      name: "radio-group-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
    {
      name: "radio-group-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@item>` attribute tags instead of `items=` to compose each option directly in markup.",
    },
    {
      name: "radio-group-rtl",
      title: "RTL",
      description:
        "`dir` isn't a @zag-js/radio-group machine prop, so it passes through as a native attribute on the root — pair it with logical-property CSS for full mirroring.",
    },
  ],
};
