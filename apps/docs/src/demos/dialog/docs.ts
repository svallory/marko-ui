// Hand-authored prose + example ordering for /docs/components/dialog.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Dialog>`,
  importSnippet: `import Dialog from "@/components/ui/dialog/dialog.marko";`,
  usageSnippet: `<Dialog>
  <@trigger|props|>
    <button ...props>Open</button>
  </@trigger>
  <@title>Are you absolutely sure?</@title>
  <@description>
    This action cannot be undone. This will permanently delete your account
    and remove your data from our servers.
  </@description>
</Dialog>`,
  examples: [
    {
      name: "dialog-demo",
      title: "Default",
      description: "A dialog for editing profile details.",
    },
    {
      name: "dialog-close-button",
      title: "Custom close button",
      description: "Replace the default close control with your own button in the footer.",
    },
    {
      name: "dialog-no-footer",
      title: "Without footer",
      description: "The footer tag is optional — omit it for a dialog with no actions row.",
    },
    {
      name: "dialog-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: an `open` prop without a change handler never moves. Pair it with `openChange`.",
    },
  ],
};
