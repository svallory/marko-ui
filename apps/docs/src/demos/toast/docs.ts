// Hand-authored prose + example ordering for /docs/components/toast.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A succinct message that is displayed temporarily.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Toaster>`,
  importSnippet: `import Toaster from "@/components/ui/toast/toast.marko";
import { toast } from "@/components/ui/toast/store.ts";`,
  usageSnippet: `toast.message({ title: "Event has been created" });

<Toaster/>`,
  examples: [
    {
      name: "toast-demo",
      title: "Default",
      description:
        "Call `toast.*` from anywhere in the app; a single `<Toaster/>` region renders whatever is queued.",
    },
    {
      name: "toast-types",
      title: "Types",
      description: "Every `toast.*` helper sets the `type` used to pick the toast's icon and styling.",
    },
    {
      name: "toast-description",
      title: "With description only",
      description: "`title` is optional — a toast can carry just a `description`.",
    },
    {
      name: "toast-promise",
      title: "Promise",
      description:
        "`toast.promise` shows a loading toast, then swaps it for the success or error toast once the promise settles.",
    },
    {
      name: "toast-dismiss",
      title: "Dismiss all",
      description: "`toast.dismiss()` with no id clears every toast currently on screen.",
    },
  ],
};
