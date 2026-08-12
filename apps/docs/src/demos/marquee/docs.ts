// Hand-authored prose + example ordering for /docs/components/marquee.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A continuously scrolling strip of content — logos, testimonials, announcements — that pauses on hover.",
  importSnippet: `import Marquee from "@/components/ui/marquee/marquee.marko";`,
  usageSnippet: `<Marquee items=logos>
  <@content|logo|>
    <span>\${logo}</span>
  </@content>
</Marquee>`,
  examples: [
    {
      name: "marquee-demo",
      title: "Basic",
      description: "A row of items scrolling continuously, pausing when hovered or focused.",
    },
    {
      name: "marquee-reverse",
      title: "Reverse",
      description: "Pass `reverse` to scroll the opposite direction.",
    },
    {
      name: "marquee-speed",
      title: "Speed",
      description: "`speed` sets the animation rate in pixels per second (default `50`).",
    },
    {
      name: "marquee-vertical",
      title: "Vertical",
      description: "Set `side` to `\"top\"` or `\"bottom\"` to scroll along the vertical axis.",
    },
    {
      name: "marquee-auto-fill",
      title: "Auto fill",
      description: "`autoFill` duplicates a short item list until it fills the container.",
    },
    {
      name: "marquee-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `paused` prop without a change handler never moves. Pair it with `pausedChange`, or use Marko's bind shorthand `paused:=state`.",
    },
  ],
};
