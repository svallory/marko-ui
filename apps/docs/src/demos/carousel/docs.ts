// Hand-authored prose + example ordering for /docs/components/carousel.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A carousel for cycling through elements, images, or slides of content.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Carousel>`,
  importSnippet: `import Carousel from "@/components/ui/carousel/carousel.marko";`,
  usageSnippet:
    "<Carousel|item| items=slides>\n" +
    "  <div>${item}</div>\n" +
    "</Carousel>",
  composition:
    "`Carousel` is a single component, not four. Where upstream composes " +
    "`Carousel` / `CarouselContent` / `CarouselItem` / `CarouselPrevious` / " +
    "`CarouselNext`, this port folds the item group, previous/next " +
    "triggers, and a page-indicator group into `Carousel` itself: pass " +
    "`items=` and render each one through the tag's own body, taking the " +
    "item as a default-body tag parameter (or use `@slide` attr tags for " +
    "static markup), and the component renders the scroll container, " +
    "buttons, and indicators for you. There is no separate " +
    "`CarouselContent`, `CarouselItem`, `CarouselPrevious`, or " +
    "`CarouselNext` tag to import.",
  examples: [
    {
      name: "carousel-demo",
      title: "Basic",
      description:
        "Pass `items` and render each one through the tag's own body, taking the item as a default-body tag parameter. Use the previous/next triggers to move between pages.",
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
      name: "carousel-api",
      title: "API",
      description:
        "A `<Carousel/carouselApi/>` tag-variable capture gives you the live, reactive machine api — read `carouselApi().page` and `carouselApi().pageSnapPoints` directly, no `setApi`/`useEffect` subscription needed.",
    },
    {
      name: "carousel-plugin",
      title: "Autoplay",
      description:
        "Our carousel is backed by `@zag-js/carousel`, which has autoplay built in — pass `autoplay={ delay }` instead of an Embla plugin, and call `api().pause()` / `api().play()` to stop on hover.",
    },
    {
      name: "carousel-rtl",
      title: "RTL",
      description:
        "`dir=\"rtl\"` is a real machine prop: it flips scroll direction, keyboard arrows, and item order. The previous/next icons already carry `mu-rtl-flip` in the component, so no extra classes are needed.",
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
    {
      name: "carousel-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@slide>` attribute tags instead of `items=` to compose each slide's markup directly.",
    },
  ],
};
