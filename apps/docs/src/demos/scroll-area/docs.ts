// Hand-authored prose + example ordering for /docs/components/scroll-area.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Augments native scroll functionality for custom, cross-browser styling.",
  importSnippet: `import ScrollArea from "@/components/ui/scroll-area/scroll-area.marko";`,
  usageSnippet: `<ScrollArea class="h-[200px] w-[350px] rounded-md border p-4">
  Your scrollable content here.
</ScrollArea>`,
  examples: [
    {
      name: "default",
      title: "Vertical",
      description: "A vertical scroll area with a synthetic, auto-hiding draggable thumb.",
    },
    {
      name: "horizontal",
      title: "Horizontal",
      description: "Pass `horizontal` to render a horizontal scrollbar and thumb alongside the vertical one.",
    },
  ],
};
