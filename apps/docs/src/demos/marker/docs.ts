// Hand-authored prose + example ordering for /docs/components/marker.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Displays an inline status, system note, bordered row, or labeled separator in a conversation.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Marker>, <MarkerIcon>, <MarkerContent>`,
  importSnippet: `import Marker from "@/components/ui/marker/marker.marko";
import MarkerIcon from "@/components/ui/marker/icon.marko";
import MarkerContent from "@/components/ui/marker/content.marko";`,
  usageSnippet: `<Marker>
  <MarkerIcon>
    <Icon name="Check"/>
  </MarkerIcon>
  <MarkerContent>Explored 4 files</MarkerContent>
</Marker>`,
  examples: [
    {
      name: "marker-demo",
      title: "Basic",
      description: "A marker with an icon, a status marker with a spinner and shimmering text, and a labeled separator.",
    },
    {
      name: "marker-variants",
      title: "Variants",
      description: 'Use `variant` ("default" | "border" | "separator") to switch between an inline marker, a bordered row, and a labeled separator.',
    },
    {
      name: "marker-status",
      title: "Status",
      description: 'Set `role="status"` and include a `Spinner` for streaming or in-progress markers so updates are announced.',
    },
    {
      name: "marker-shimmer",
      title: "Shimmer",
      description: "Add the `shimmer` utility class to `MarkerContent` for an animated streaming-text effect.",
    },
    {
      name: "marker-separator",
      title: "Separator",
      description: 'Use the `"separator"` variant for labeled dividers, such as dates or section breaks, in a conversation.',
    },
    {
      name: "marker-border",
      title: "Border",
      description: 'Use the `"border"` variant for status rows that should keep the default marker alignment while separating the next row.',
    },
    {
      name: "marker-icon",
      title: "With Icon",
      description: "Use `MarkerIcon` to render an icon alongside the content. Add `flex-col` to stack the icon above the content.",
    },
    {
      name: "marker-link-button",
      title: "Links and Buttons",
      description:
        "Upstream turns a marker into a link or button via a `render` prop. Our `Marker` accepts `asChild`/`render` for API parity but always renders its own wrapping `<div>` (Marko has no runtime slot-merge primitive for it), so this demo wraps the marker markup in a real `<a>`/`<button>` directly for the same focusable, correctly-rendered result.",
    },
  ],
  accessibilityNotes: [
    "`Marker` is presentational by default — the correct role depends on how you use it, so choose based on intent rather than a single default.",
    'For streaming or progress markers (e.g. "Thinking...", a running tool), set `role="status"` so assistive tech announces the update as it appears. `Marker` forwards `role` to the underlying element.',
    "A labeled separator (date, section label) needs no role — its divider lines are decorative CSS, and the label text is announced as ordinary content. Do not add `role=\"separator\"` to a labeled divider: that role takes its accessible name from `aria-label`, not from visible text, so the label would go unannounced. Reserve `role=\"separator\"` for a divider with no meaningful text.",
    "A bordered marker (`variant=\"border\"`) keeps the same semantics as the default marker — its border is decorative, so choose `role=\"status\"` or no role based on the marker's purpose.",
    "`MarkerIcon` is decorative and hidden from assistive tech with `aria-hidden`, so the adjacent `MarkerContent` carries the meaning. For an icon-only marker, provide an `aria-label` or visible text so it is not announced as empty.",
    'When a marker links or triggers an action, upstream renders it as a real `<button>` or `<a>` via the `render` prop so it stays focusable with the correct role. Our port does not support `render` as a real polymorphism (see the Links and Buttons example) — wrap the marker markup in a real `<a>`/`<button>` yourself to get the same focusable, correctly-rendered result.',
  ],
};
