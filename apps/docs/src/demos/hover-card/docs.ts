// Hand-authored prose + example ordering for /docs/components/hover-card.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "For sighted users to preview content available behind a link.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<HoverCard>`,
  importSnippet: `import HoverCard from "@/components/ui/hover-card/hover-card.marko";`,
  usageSnippet: `<HoverCard>
  <@trigger|props|>
    <a ...props href="#">@marko-ui</a>
  </@trigger>
  <@content>
    The component registry for Marko 6.
  </@content>
</HoverCard>`,
  // Upstream's hover-card.mdx documents HoverCard/HoverCardTrigger/
  // HoverCardContent as three separate composed components. Our port is
  // one .marko file (packages/shadcn/ui/hover-card/hover-card.marko)
  // exposing the same anatomy through a `trigger` render-prop and a
  // `content` slot instead of separate tags — api-reference.json sees a
  // single part, so the auto-generated Composition tree (driven by
  // isCompound) never renders. This prose is the fallback (see
  // docs-types.ts `composition`).
  composition:
    "`HoverCard` is a single component, not three. Where upstream " +
    "composes `HoverCard` / `HoverCardTrigger` / `HoverCardContent`, this " +
    "port folds trigger and content into `HoverCard` itself: the " +
    "`@trigger` render-prop receives the machine's trigger attributes to " +
    "spread onto whatever element opens the card, and `@content` supplies " +
    "what's shown once the pointer lingers. There is no separate " +
    "`HoverCardTrigger` or `HoverCardContent` tag to import.",
  examples: [
    {
      name: "hover-card-demo",
      title: "Basic",
      description:
        "The `trigger` render-prop receives the trigger's props and spreads them onto the element that opens the card; `content` is shown once the pointer lingers.",
    },
    {
      name: "hover-card-sides",
      title: "Positioning",
      description:
        "Pass `positioning` with a `placement` to control which side of the trigger the card opens on.",
    },
    {
      name: "hover-card-custom-delays",
      title: "Custom delays",
      description:
        "Use `openDelay` and `closeDelay` (in milliseconds) to control how quickly the card opens and closes.",
    },
    {
      name: "hover-card-disabled",
      title: "Disabled",
      description: "Pass `disabled` to prevent the hover card from ever opening.",
    },
    {
      name: "hover-card-rtl",
      title: "RTL",
      description: "Set `dir=\"rtl\"` on the `HoverCard` (matching the surrounding document direction) so the positioner flips placement automatically.",
    },
  ],
  accessibilityNotes: [
    "The trigger only gains hover-card behavior in addition to its native semantics — an `<a>` trigger stays a real, focusable link with its own `href`, so keyboard users can activate it directly even though the card itself opens on hover/focus.",
    "The card opens on trigger focus as well as hover, so keyboard-only users can reveal the preview by tabbing to the trigger — no pointer required.",
    "Closes on `Escape` and on pointer interaction outside the card; `openDelay`/`closeDelay` (default 600ms/300ms on the underlying machine) prevent the card from flickering open during incidental mouse movement.",
  ],
};
