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
  <AlertAction>
    <Button variant="outline">Enable</Button>
  </AlertAction>
</Alert>`,
  composition: `<Alert> lays out its content in a CSS grid: an optional leading icon
column (any element passed as a direct child that isn't \`AlertTitle\`/
\`AlertDescription\`/\`AlertAction\` — typically an \`<svg>\`), title and
description rows, and \`AlertAction\` positioned in the top-right corner.
The icon column collapses automatically when no icon is present (see the
"Without icon" example below).

\`\`\`text
Alert
├── Icon
├── AlertTitle
├── AlertDescription
└── AlertAction
\`\`\``,
  examples: [
    {
      name: "alert-demo",
      title: "Default",
      description: "An alert with an icon, title, and description.",
    },
    {
      name: "alert-basic",
      title: "Basic",
      description: "A basic alert with an icon, title, and description.",
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
    {
      name: "alert-action",
      title: "Action",
      description: "Use `AlertAction` to add a button or other action element to the alert.",
    },
    {
      name: "alert-colors",
      title: "Custom Colors",
      description: "Customize the alert colors by adding custom classes such as `bg-amber-50 dark:bg-amber-950` to the `Alert` component.",
    },
    {
      name: "alert-rtl",
      title: "RTL",
      description: "Alert has no directional logic of its own — icon placement and text flow follow the ambient `dir` attribute.",
    },
  ],
  accessibilityNotes: [
    "`Alert` renders with `role=\"alert\"`, so assistive technology announces its content as soon as it mounts — reserve it for messages the user genuinely needs to know about immediately, not routine or decorative content.",
    "`role=\"alert\"` implies an assertive live region: screen readers interrupt their current announcement to read it. For less urgent, non-interrupting updates use a `role=\"status\"` region instead of `Alert`.",
    "The component is a static callout, not a dialog — it has no focus management and no keyboard interaction of its own. When `AlertAction` contains an interactive element (e.g. a `Button`), that element follows normal tab order and standard button keyboard semantics.",
  ],
};
