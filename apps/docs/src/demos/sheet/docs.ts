// Hand-authored prose + example ordering for /docs/components/sheet.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Extends the Dialog component to display content that complements the main content of the screen.",
  importSnippet: `import Sheet from "@/components/ui/sheet/sheet.marko";`,
  usageSnippet: `<Sheet>
  <@trigger|props|>
    <button ...props>Open</button>
  </@trigger>
  <@title>Edit profile</@title>
  <@description>
    Make changes to your profile here. Click save when you're done.
  </@description>
  <@content>
    ...
  </@content>
</Sheet>`,
  examples: [
    {
      name: "sheet-demo",
      title: "Default",
      description: "A sheet for editing profile details, sliding in from the right.",
    },
    {
      name: "sheet-side",
      title: "Side",
      description: "Pass `side` to set which edge of the screen the sheet slides in from: `top`, `right`, `bottom`, or `left`.",
    },
    {
      name: "sheet-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: an `open` prop without a change handler never moves. Pair it with `openChange`.",
    },
  ],
};
