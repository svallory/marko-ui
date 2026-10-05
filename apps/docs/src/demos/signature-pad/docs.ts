// Hand-authored prose + example ordering for /docs/components/signature-pad.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A draw-to-sign pad for capturing handwritten signatures via pointer input.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<SignaturePad>`,
  importSnippet: `import SignaturePad from "@/components/ui/signature-pad/signature-pad.marko";`,
  usageSnippet: `<SignaturePad/>`,
  examples: [
    {
      name: "signature-pad-demo",
      title: "Basic",
      description: "A signature pad with a clear trigger and a dashed signing guide.",
    },
    {
      name: "signature-pad-form",
      title: "Form value",
      description:
        "Pass `name` to submit the committed strokes as JSON through a hidden input.",
    },
    {
      name: "signature-pad-disabled",
      title: "Disabled",
      description: "A disabled pad ignores pointer input and skips the tab order.",
    },
    {
      name: "signature-pad-controlled",
      title: "Controlled draw-end",
      description:
        "Listen for `drawEndChange` to read the committed stroke paths whenever a stroke is finished.",
    },
  ],
};
