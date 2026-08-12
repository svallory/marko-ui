// Hand-authored prose + example ordering for /docs/components/carousel.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A carousel for cycling through elements, images, or slides of content.",
  importSnippet: `import Carousel from "@/components/ui/carousel/carousel.marko";`,
  usageSnippet:
    "<Carousel items=slides>\n" +
    "  <@content|item|>\n" +
    "    <div>${item}</div>\n" +
    "  </@content>\n" +
    "</Carousel>",
  examples: [
    {
      name: "carousel-demo",
      title: "Basic",
      description:
        "Pass `items` and render each one with the `@content` body parameter. Use the previous/next triggers to move between pages.",
    },
    {
      name: "carousel-size",
      title: "Sizes",
      description: "Set `slidesPerPage` to show more than one item at a time.",
    },
    {
      name: "carousel-spacing",
      title: "Spacing",
      description: "Set `spacing` to control the gap between items.",
    },
    {
      name: "carousel-orientation",
      title: "Orientation",
      description: "Set `orientation` to `vertical` to stack slides top to bottom.",
    },
    {
      name: "carousel-loop",
      title: "Loop",
      description: "Set `loop` so the carousel wraps around at the first and last slide.",
    },
    {
      name: "carousel-controlled",
      title: "Controlled",
      description:
        "The carousel is controlled: a `page` prop without `pageChange` never moves. Pair the two to drive the current page from your own state.",
    },
  ],
};
