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
  ],
};
