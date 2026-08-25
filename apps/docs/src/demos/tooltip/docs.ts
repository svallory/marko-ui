// Hand-authored prose + example ordering for /docs/components/tooltip.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A popup that displays information related to an element when it receives keyboard focus or the mouse hovers over it.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Tooltip>`,
  importSnippet: `import Tooltip from "@/components/ui/tooltip/tooltip.marko";`,
  usageSnippet: `<Tooltip content="Add to library">
  <@trigger|props|>
    <Button ...props variant="outline">Hover me</Button>
  </@trigger>
</Tooltip>`,
  // Upstream's tooltip.mdx documents Tooltip/TooltipTrigger/TooltipContent
  // as three separate composed components. Our port is one .marko file
  // (packages/shadcn/ui/tooltip/tooltip.marko) exposing the same anatomy
  // through a `trigger` render-prop and a `content` slot/string prop
  // instead of separate tags — api-reference.json sees a single part, so
  // the auto-generated Composition tree (driven by isCompound) never
  // renders. This prose is the fallback (see docs-types.ts `composition`).
  composition:
    "`Tooltip` is a single component, not three. Where upstream composes " +
    "`Tooltip` / `TooltipTrigger` / `TooltipContent`, this port folds " +
    "trigger and content into `Tooltip` itself: the `@trigger` render-prop " +
    "receives the machine's trigger attributes to spread onto whatever " +
    "element the tooltip describes, and `content` (a string prop, or the " +
    "tag's own body) supplies what's shown when open. There is no separate " +
    "`TooltipTrigger` or `TooltipContent` tag to import.",
  examples: [
    {
      name: "tooltip-demo",
      title: "Basic",
      description:
        "The `trigger` render-prop receives the machine's trigger attributes — spread them onto whatever element the tooltip describes.",
    },
    {
      name: "tooltip-sides",
      title: "Positioning",
      description: "Pass `positioning={ placement: \"top\" | \"right\" | \"bottom\" | \"left\" }` to control where the tooltip renders relative to its trigger.",
    },
    {
      name: "tooltip-delay",
      title: "Custom delay",
      description: "Set `openDelay` and `closeDelay` (in milliseconds) to change how quickly the tooltip appears and disappears.",
    },
    {
      name: "tooltip-keyboard",
      title: "With Keyboard Shortcut",
      description: "Compose `Kbd` inside the tooltip's body to show a keyboard shortcut alongside the tooltip text.",
    },
    {
      name: "tooltip-disabled",
      title: "Disabled Button",
      description: "Show a tooltip on a disabled button by wrapping it with a `span` and spreading the trigger props onto the span instead.",
    },
    {
      name: "tooltip-rtl",
      title: "RTL",
      description: "Set `dir=\"rtl\"` on the `Tooltip` (matching the surrounding document direction) so the positioner flips placement automatically.",
    },
  ],
  accessibilityNotes: [
    "The trigger's `aria-describedby` points at the tooltip content only while it's open, so assistive tech announces the description without adding permanent DOM noise.",
    "The content renders `role=\"tooltip\"` unless the trigger already carries an `aria-label`, in which case the label is the accessible name and the role is omitted to avoid redundant announcements.",
    "Opens on trigger focus as well as hover, so keyboard-only users can reach tooltip content by tabbing to the trigger — no pointer required.",
    "Closes on `Escape` (`closeOnEscape`, default `true`) and on scroll (`closeOnScroll`, default `true`); set `closeOnPointerDown={false}` if the tooltip should survive a click on the trigger.",
  ],
};
