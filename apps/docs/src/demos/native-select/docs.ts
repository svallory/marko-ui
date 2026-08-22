// Hand-authored prose + example ordering for /docs/components/native-select.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A styled wrapper around the native HTML select element — zero JavaScript, full native accessibility and the platform's own mobile picker.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<NativeSelect>, <NativeSelectOption>`,
  importSnippet: `import NativeSelect from "@/components/ui/native-select/native-select.marko";
import NativeSelectOption from "@/components/ui/native-select/native-select-option.marko";`,
  usageSnippet: `<NativeSelect>
  <NativeSelectOption value="">Select an option</NativeSelectOption>
  <NativeSelectOption value="one">One</NativeSelectOption>
  <NativeSelectOption value="two">Two</NativeSelectOption>
</NativeSelect>`,
  examples: [
    {
      name: "native-select-demo",
      title: "Default",
      description: "A native select styled to match the rest of the form controls.",
    },
    {
      name: "native-select-groups",
      title: "Option groups",
      description: "Use `NativeSelectOptGroup` to group related options under a label.",
    },
    {
      name: "native-select-disabled",
      title: "Disabled",
      description: "Pass `disabled` to disable the whole control.",
    },
    {
      name: "native-select-invalid",
      title: "Invalid",
      description: "Pass `aria-invalid` to show a validation error state.",
    },
    {
      name: "native-select-rtl",
      title: "RTL",
      description:
        "Pass `dir=\"rtl\"` — a plain native HTML attribute here, since native-select wraps a `<select>` with no Zag machine — to get the browser's own RTL rendering and keyboard handling.",
    },
  ],
  // native-select has 3 parts (native-select, native-select-option,
  // native-select-optgroup), so `isCompound` is true on the page and the
  // auto-generated <composition-tree> renders from api-reference.json —
  // this component never reads `docs.composition` (see docs-types.ts and
  // $name/+page.marko), so that field is intentionally omitted here.
  accessibilityNotes: [
    "Renders a real native `<select>` element, so it gets full native keyboard support, screen-reader semantics, and the platform's own mobile picker UI for free — no ARIA wiring or Zag machine required.",
    "Pass `aria-invalid=\"true\"` to announce a validation error state; pair it with a wrapping `Field` and `FieldError` for visible error styling and messaging (see the Invalid example).",
    "`dir` is a plain native HTML attribute here (native-select has no Zag machine), so `dir=\"rtl\"` relies entirely on the browser's own RTL layout and keyboard handling rather than any library-level positioning logic.",
    "Use `NativeSelect` for native browser behavior, better performance, or mobile-optimized dropdowns; use `Select` (the styled, Zag-driven component) for custom styling, animations, or complex interactions.",
  ],
};
