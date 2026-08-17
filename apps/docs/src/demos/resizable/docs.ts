// Hand-authored prose + example ordering for /docs/components/resizable.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Accessible resizable panel groups and layouts with keyboard support.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Resizable>`,
  importSnippet: `import Resizable from "@/components/ui/resizable/resizable.marko";`,
  usageSnippet: `<Resizable panels=[{ id: "one", defaultSize: 50 }, { id: "two", defaultSize: 50 }]>
  <@content|panel|>
    ${"${panel.id}"}
  </@content>
</Resizable>`,
  examples: [
    {
      name: "resizable-demo",
      title: "Default",
      description:
        "Nest a `Resizable` inside another panel's content to build a layout of more than two regions.",
    },
    {
      name: "resizable-vertical",
      title: "Vertical",
      description: "Set `orientation=\"vertical\"` to stack panels top to bottom.",
    },
    {
      name: "resizable-sizes",
      title: "Min and max sizes",
      description: "Pass `minSize` and `maxSize` on a panel to constrain how far it can be dragged.",
    },
    {
      name: "resizable-controlled",
      title: "Controlled",
      description:
        "Listen for `resizeChange` to read the live size (in percent) of every panel as the handle is dragged.",
    },
  ],
};
