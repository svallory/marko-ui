// Hand-authored prose + example ordering for /docs/components/field.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Validation-library-agnostic form field primitives — combine labels, controls and help text to compose accessible, groupable form fields.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Field>, <FieldLabel>, <FieldDescription>`,
  importSnippet: `import Field from "@/components/ui/field/field.marko";
import FieldLabel from "@/components/ui/field/field-label.marko";
import FieldDescription from "@/components/ui/field/field-description.marko";`,
  usageSnippet: `<Field>
  <FieldLabel for="name">Full name</FieldLabel>
  <Input id="name" autocomplete="off" placeholder="Evil Rabbit"/>
  <FieldDescription>This appears on invoices and emails.</FieldDescription>
</Field>`,
  // `field` is compound (10 parts in api-reference.json), so `isCompound` is
  // true and the route renders the auto-generated <composition-tree> for
  // "Anatomy" from api-reference.json's part list — this docs.composition
  // field is never read for compound components (see
  // routes/docs/components/$name/+page.marko: `<if=page.isCompound>` wins
  // before `<else-if=page.docs.composition>` is ever reached). Upstream's
  // "Composition" section shows THREE separate narrative trees (Field,
  // FieldGroup, FieldSet) with prose under each; our auto-tree is one flat
  // tree of all parts under the `field` root, which is the honest
  // presence-only equivalent the canonical structure spec calls for
  // ("Anatomy — tag tree, slots/attr-tags") — narrated per-root prose isn't
  // a capability the shared composition-tree renderer has for a component
  // with multiple usable roots (Field/FieldGroup/FieldSet), and per FILE
  // TERRITORY that renderer is out of scope for this repair.
  //
  // BLOCKED (parity — missingMappedTargets: "Anatomy"): base/field.mdx has
  // TWO distinct upstream headings that both matter here, and the above
  // paragraph only accounts for one. `## Composition` (its own heading,
  // Field/FieldGroup/FieldSet trio) maps via tooling/parity/section-map.ts
  // (`composition: [{ action: "move", parent: ["anatomy"] }]`) and IS
  // satisfied — its fallback target.title is "Composition" (no title
  // override in that map entry), and our page always renders a heading
  // literally titled "Composition" for a compound component, so
  // `isTargetPresent`'s mappedTitlePresent branch matches.
  // But upstream ALSO has a SEPARATE `## Anatomy` heading (line 140,
  // sibling of `## Composition`, not nested under it) — a short prose +
  // JSX-tree "how Field/FieldContent/FieldGroup/FieldSet compose" block.
  // Its heading slug "anatomy" hits the CANONICAL_BUCKET_SLUGS pre-pass
  // directly (coverage.ts's classifySection step 0), producing
  // target = { parent: [], title: "Anatomy" } — canonical bucket "Anatomy"
  // itself. `ourSectionsFor` (coverage.ts) never emits a heading titled
  // "Anatomy" (only "Composition"), and +page.marko has no render branch
  // that produces one either — a real template gap, not something
  // closeable from this demo directory. The content of upstream's `##
  // Anatomy` heading (the field-structure bullet list + JSX skeleton) is
  // materially the same content our auto-generated <composition-tree>
  // already provides under "Composition", so nothing is missing from the
  // reader's perspective — only the checker's per-heading presence check,
  // which is looking for a heading literally titled "Anatomy" that this
  // page's fixed section skeleton has no path to produce.
  examples: [
    {
      name: "field-demo",
      title: "Default",
      description: "A field pairs a label, control and helper text via matching ids.",
    },
    {
      name: "field-invalid",
      title: "Invalid",
      description:
        "Pass `invalid` to `Field` to switch the whole block into an error state, and `aria-invalid` on the control itself.",
    },
    {
      name: "field-multiple-errors",
      title: "Multiple errors",
      description: "`FieldError` accepts a list of errors and renders them as a bulleted list.",
    },
    {
      name: "field-input",
      title: "Input",
      description: "Pair `Field` with `Input` for text and password controls.",
    },
    {
      name: "field-textarea",
      title: "Textarea",
      description: "Pair `Field` with `Textarea` for multi-line input.",
    },
    {
      name: "field-select",
      title: "Select",
      description:
        "`Select` renders its own accessible label (via `label=`), so it pairs directly with `Field` — no separate `FieldLabel` needed.",
    },
    {
      name: "field-slider",
      title: "Slider",
      description: "Pair `Field` with `Slider` and reflect the live value in `FieldDescription`.",
    },
    {
      name: "field-horizontal",
      title: "Horizontal orientation",
      description:
        "Set `orientation=\"horizontal\"` to align the control beside the label. Pair with `FieldContent` to keep descriptions aligned.",
    },
    {
      name: "field-fieldset-basic",
      title: "Field set with legend and separator",
      description:
        "Group related fields with `FieldSet` and `FieldGroup`, and divide sections with `FieldSeparator`.",
    },
    {
      name: "field-fieldset",
      title: "Nested field groups",
      description:
        "Combine `FieldSet`, `FieldLegend` and a grid of `Field`s to build a labeled section like an address form.",
    },
    {
      name: "field-checkbox",
      title: "Checkbox",
      description:
        "`Checkbox` renders its own root `<label>` around the hidden input, so label text lives in its `content` body rather than a separate `FieldLabel`.",
    },
    {
      name: "field-radio",
      title: "Radio",
      description: "`RadioGroup` renders every option as its own labeled item — pass `items=` and describe the group with `FieldSet`/`FieldLabel`.",
    },
    {
      name: "field-switch",
      title: "Switch",
      description: "Pair `Field` with `Switch`, keeping the label and description in `FieldContent`.",
    },
    {
      name: "field-choice-card",
      title: "Choice card",
      description:
        "Render rich title/description content inside a `RadioGroup` item's `content` slot to build a selectable card group.",
    },
    {
      name: "field-group",
      title: "Field group",
      description: "Stack related `FieldSet`s inside one `FieldGroup`, dividing sections with `FieldSeparator`.",
    },
    {
      name: "field-signup",
      title: "Sign up — live validation",
      description:
        "Native `ValidityState` drives client-side validation with zero dependencies — it already understands `required`, `type=email`, `minlength` and `pattern`.",
    },
    {
      name: "field-rtl",
      title: "RTL",
      description: "Field's layout uses Tailwind logical properties, so it restyles correctly under `dir=\"rtl\"` with no component changes.",
    },
    {
      name: "field-responsive",
      title: "Responsive layout",
      description:
        "Set `orientation=\"responsive\"` to stack vertically on narrow containers and switch to a horizontal row once the `FieldGroup`'s `@container` query matches — apply `@md/field-group:` classes on `FieldGroup` to tune the breakpoint.",
    },
  ],
  accessibilityNotes: [
    "`FieldSet` and `FieldLegend` keep related controls grouped for keyboard and assistive-technology users.",
    "`Field` renders `role=\"group\"` so nested controls inherit labeling from `FieldLabel` and `FieldLegend` when combined.",
    "Apply `FieldSeparator` sparingly so screen reader users encounter clear section boundaries.",
    "Set `invalid` on `Field` for the visual error state, and pair it with `aria-invalid` on the control itself — the `invalid` prop alone does not add `aria-invalid`.",
    "Render `FieldError` immediately after the control (or inside `FieldContent`) and reference it from the control's `aria-describedby` so assistive technology announces the error with the field.",
  ],
};
