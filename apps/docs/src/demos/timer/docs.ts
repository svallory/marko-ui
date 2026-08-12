// Hand-authored prose + example ordering for /docs/components/timer.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A countdown or stopwatch timer with a segmented digit display and start/pause/resume/reset controls.",
  importSnippet: `import Timer from "@/components/ui/timer/timer.marko";`,
  usageSnippet: `<Timer parts=["minutes", "seconds"]/>`,
  examples: [
    {
      name: "timer-demo",
      title: "Basic",
      description: "A stopwatch timer counting up from zero, showing minutes and seconds.",
    },
    {
      name: "timer-countdown",
      title: "Countdown",
      description:
        "Pass `countdown` with a `startMs` and `targetMs` to count down instead of up.",
    },
    {
      name: "timer-parts",
      title: "Days / hours / minutes / seconds",
      description: "The `parts` prop controls which time segments are rendered, in order.",
    },
    {
      name: "timer-controlled",
      title: "Controlled parts",
      description: "Swap the `parts` array at runtime to change the displayed segments live.",
    },
  ],
};
