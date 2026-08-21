// Hand-authored prose + example ordering for /docs/components/alert-dialog.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A modal dialog that interrupts the user with important content and expects a response.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<AlertDialog>`,
  importSnippet: `import AlertDialog from "@/components/ui/alert-dialog/alert-dialog.marko";`,
  usageSnippet: `<AlertDialog>
  <@trigger|props|>
    <Button ...props variant="outline">Show Dialog</Button>
  </@trigger>
  <@title>Are you absolutely sure?</@title>
  <@description>
    This action cannot be undone.
  </@description>
</AlertDialog>`,
  examples: [
    {
      name: "alert-dialog-basic",
      title: "Basic",
      description:
        "A dialog with a title, description, and cancel and continue buttons.",
    },
    {
      name: "alert-dialog-destructive",
      title: "Destructive",
      description:
        "Override `cancelText` and `actionText`, and run side effects on confirm with the `action` callback.",
    },
    {
      name: "alert-dialog-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: an `open` prop without a change handler never moves. Pair it with `openChange`, or use Marko's bind shorthand `open:=state`.",
    },
  ],
};
