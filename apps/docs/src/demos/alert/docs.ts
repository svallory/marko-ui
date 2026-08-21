// Hand-authored prose + example ordering for /docs/components/alert.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays a callout for user attention.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Alert>, <AlertTitle>, <AlertDescription>`,
  importSnippet: `import Alert from "@/components/ui/alert/alert.marko";
import AlertTitle from "@/components/ui/alert/title.marko";
import AlertDescription from "@/components/ui/alert/description.marko";`,
  usageSnippet: `<Alert>
  <InfoIcon/>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components and dependencies to your app using the CLI.
  </AlertDescription>
</Alert>`,
  examples: [
    {
      name: "alert-demo",
      title: "Default",
      description: "An alert with an icon, title, and description.",
    },
    {
      name: "alert-without-icon",
      title: "Without icon",
      description: "The icon column collapses automatically when the alert has no icon.",
    },
    {
      name: "alert-destructive",
      title: "Destructive",
      description: "Use `variant=\"destructive\"` for errors that need urgent attention.",
    },
  ],
};
