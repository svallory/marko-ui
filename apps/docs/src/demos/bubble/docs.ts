// Hand-authored prose + example ordering for /docs/components/bubble.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Displays conversational content in a message bubble. Supports variants, alignment, grouping, reactions, and collapsible content.",
  usageTags: `<Bubble>`,
  importSnippet: `import Bubble from "@/components/ui/bubble/bubble.marko";
import BubbleContent from "@/components/ui/bubble/bubble-content.marko";
import BubbleReactions from "@/components/ui/bubble/bubble-reactions.marko";`,
  usageSnippet: `<Bubble>
  <BubbleContent>
    I checked the registry output and removed the stale route.
  </BubbleContent>
  <BubbleReactions>
    <span>👍</span>
  </BubbleReactions>
</Bubble>`,
  composition: `\`Bubble\` renders the presentational message surface: place avatars, names,
timestamps, and message-level actions in the [\`Message\`](/docs/components/message)
component instead — \`Bubble\` is intentionally scoped to the bubble surface
itself.

Compose a bubble from \`BubbleContent\` and, optionally, \`BubbleReactions\`:

\`\`\`text
Bubble
├── BubbleContent
└── BubbleReactions
\`\`\`

Use \`BubbleGroup\` to group consecutive bubbles from the same sender. The
\`align\` prop stays on each \`Bubble\`, not on the group:

\`\`\`text
BubbleGroup
├── Bubble
│   └── BubbleContent
└── Bubble
    └── BubbleContent
\`\`\`

**Deviation from upstream:** upstream's \`BubbleContent\` accepts a \`render\`
prop (Radix \`Slot.Root\`) to turn the content into a link or button by
merging its props onto an arbitrary child element. Marko 6 has no
\`asChild\`/\`Slot.Root\` equivalent, and this port's other components (e.g.
\`button.marko\`) already drop \`asChild\` for the same reason — see the
deviation comment in \`bubble-content.marko\`. \`BubbleContent\` here always
renders a \`<div>\`; put a real \`<button>\` or \`<a>\` inside the content body
when you need an interactive bubble (the \`Links and Buttons\` example below
shows the pattern).`,
  examples: [
    {
      name: "bubble-demo",
      title: "Basic",
      description: "Two conversation turns using `Bubble`, `BubbleGroup`, and `BubbleReactions`.",
    },
    {
      name: "bubble-variants",
      title: "Variants",
      description:
        'Use `variant` ("default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive") to change the visual treatment of the bubble. A bubble sizes to its content, up to 80% of the container width — `ghost` removes the max-width so content can span the full row.',
    },
    {
      name: "bubble-alignment",
      title: "Alignment",
      description:
        'Use `align` ("start" | "end") on `Bubble` to align it to the start or end of the conversation.',
    },
    {
      name: "bubble-group-demo",
      title: "Bubble Group",
      description: "Use `BubbleGroup` to group consecutive bubbles from the same sender.",
    },
    {
      name: "bubble-link-button",
      title: "Links and Buttons",
      description:
        "Turn a bubble into an interactive control by placing a real `<button>` or `<a>` inside `BubbleContent`.",
    },
    {
      name: "bubble-reactions",
      title: "Reactions",
      description:
        'Use `BubbleReactions` for reactions or quick action buttons. Use `side` and `align` to position the row — reactions overlap the bubble edge, so leave vertical space between rows.',
    },
    {
      name: "bubble-collapsible",
      title: "Show More / Collapsible",
      description:
        "Compose long bubble content with `Collapsible` for a show more / show less interaction.",
    },
    {
      name: "bubble-tooltip",
      title: "Tooltip",
      description: "Wrap a bubble control in `Tooltip` to reveal metadata on hover, such as when a message was read.",
    },
    {
      name: "bubble-popover",
      title: "Popover",
      description: "Pair a bubble with `Popover` to surface more information on demand, such as a failed action's error message.",
    },
  ],
  accessibilityNotes: [
    "`Bubble` renders the presentational message surface only. Keep conversation-level semantics (roles, list structure) on the surrounding container.",
    'Reactions render as a row of emoji read one glyph at a time by screen readers, with counters like "+8" announced as "plus eight". Group the row as a single image with a descriptive `aria-label` (e.g. `aria-label="Reactions: thumbs up, fire, and 8 more"`) so it announces once — `role="img"` also hides the individual emoji from assistive tech, so no `aria-hidden` is needed.',
    "When reactions are interactive, render real buttons instead of `role=\"img\"` spans, and give icon-only buttons an `aria-label`.",
    "When a bubble is clickable, render a real `<button>` or `<a>` inside `BubbleContent` (see the deviation note in Composition above) so it is focusable and exposes the correct role — `BubbleContent` ships a visible focus ring for interactive descendants, and the accessible name comes from the bubble text.",
    "Bubble variants signal role and tone with color alone. Pair them with text, alignment, or icons — for a `destructive` bubble, keep the error context in the message text rather than relying on color.",
  ],
};
