// Hand-authored prose + example ordering for /docs/components/drawer.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A vaul-style bottom sheet with drag-to-dismiss, snap points, and swipe-to-open edge areas. Built on the @zag-js/drawer machine.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Drawer>`,
  importSnippet: `import Drawer from "@/components/ui/drawer/drawer.marko";`,
  usageSnippet: `<Drawer>
  <@trigger|props|>
    <button ...props>Open</button>
  </@trigger>
  <@title>Are you absolutely sure?</@title>
  <@description>This action cannot be undone.</@description>
  <@footer>
    <button>Submit</button>
  </@footer>
</Drawer>`,
  examples: [
    {
      name: "drawer-demo",
      title: "Default",
      description: "A drawer for editing profile details.",
    },
    {
      name: "drawer-no-footer",
      title: "Without footer",
      description: "The footer tag is optional — omit it for a drawer with no actions row.",
    },
    {
      name: "drawer-snap-points",
      title: "Snap points",
      description:
        "Pass `snapPoints` and `defaultSnapPoint` to let the drawer settle at fixed heights as it's dragged.",
    },
    {
      name: "drawer-sides",
      title: "Swipe direction",
      description:
        "Set `swipeDirection` to `start`, `end`, `up`, or `down`. Logical `start`/`end` resolve against text direction.",
    },
  ],
};
