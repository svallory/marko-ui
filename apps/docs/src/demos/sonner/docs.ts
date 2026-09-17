// Hand-authored prose + example ordering for /docs/components/sonner.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "An opinionated toast component, ported onto this registry's Zag-powered toast machinery.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Sonner>`,
  importSnippet: `import Sonner from "@/components/ui/sonner/sonner.marko";
import { toast } from "@/components/ui/toast/store.ts";`,
  usageSnippet: `toast.message({ title: "Event has been created" });

<Sonner/>`,
  examples: [
    {
      name: "sonner-demo",
      title: "Default",
      description:
        "Call `toast.*` from anywhere in the app; a single `<Sonner/>` region renders whatever is queued — same store as `Toast`, sonner-shaped wrapper.",
    },
  ],
};
