// Hand-authored prose + example ordering for /docs/components/aspect-ratio.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays content within a desired ratio.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<AspectRatio>`,
  importSnippet: `import AspectRatio from "@/components/ui/aspect-ratio/aspect-ratio.marko";`,
  usageSnippet: `<AspectRatio ratio=(16 / 9)>
  <img src="..." alt="Image" class="rounded-md object-cover" />
</AspectRatio>`,
  examples: [
    {
      name: "aspect-ratio-demo",
      title: "Default",
      description: "A `16 / 9` ratio, the common case for images and video.",
    },
    {
      name: "aspect-ratio-square",
      title: "Square",
      description: "A `1 / 1` ratio, useful for displaying images in a square format.",
    },
    {
      name: "aspect-ratio-portrait",
      title: "Portrait",
      description: "A `9 / 16` ratio, useful for displaying images in a portrait format.",
    },
    {
      name: "aspect-ratio-rtl",
      title: "RTL",
      // Static port note: see the in-file comment in aspect-ratio-rtl.marko
      // — upstream's live en/ar/he language switcher has no equivalent
      // here, so this is a static "ar" locale port (established precedent:
      // progress-rtl, card-rtl). AspectRatio has no physical styling to
      // flip; only the figure's dir and caption alignment are RTL-relevant.
      description:
        "To enable RTL support, set `dir=\"rtl\"` on an ancestor. AspectRatio itself has no physical (left/right) styling to flip.",
    },
    {
      name: "aspect-ratio-content-card",
      title: "Content card",
      description: "Ratios apply to any content, not just images — here a `4 / 3` placeholder card.",
    },
    {
      name: "aspect-ratio-ultrawide-banner",
      title: "Ultrawide banner",
      description: "A `21 / 9` ratio for wide banner layouts.",
    },
  ],
};
