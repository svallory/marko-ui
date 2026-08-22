// Hand-authored prose + example ordering for /docs/components/attachment.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Displays a file or image attachment with media, metadata, upload state, and actions.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Attachment>, <AttachmentMedia>, <AttachmentContent>, <AttachmentTitle>, <AttachmentDescription>, <AttachmentActions>, <AttachmentAction>, <AttachmentTrigger>, <AttachmentGroup>`,
  importSnippet: `import Attachment from "@/components/ui/attachment/attachment.marko";
import AttachmentMedia from "@/components/ui/attachment/media.marko";
import AttachmentContent from "@/components/ui/attachment/content.marko";
import AttachmentTitle from "@/components/ui/attachment/title.marko";
import AttachmentDescription from "@/components/ui/attachment/description.marko";
import AttachmentActions from "@/components/ui/attachment/actions.marko";
import AttachmentAction from "@/components/ui/attachment/action.marko";`,
  usageSnippet: `<Attachment>
  <AttachmentMedia>
    <Icon name="FileTextIcon"/>
  </AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
    <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
  </AttachmentContent>
  <AttachmentActions>
    <AttachmentAction aria-label="Remove sales-dashboard.pdf">
      <Icon name="X"/>
    </AttachmentAction>
  </AttachmentActions>
</Attachment>`,
  examples: [
    {
      name: "attachment-demo",
      title: "Basic",
      description:
        "An `AttachmentGroup` of images above a card mid-upload and a finished file attachment.",
    },
    {
      name: "attachment-image",
      title: "Image",
      description:
        "Set `variant=\"image\"` on `AttachmentMedia` and render an `<img>` inside it, with `orientation=\"vertical\"` stacking the media above the content.",
    },
    {
      name: "attachment-states",
      title: "States",
      description:
        "Set `state` to reflect the upload lifecycle — `uploading` and `processing` shimmer the title, and `error` switches to a destructive treatment.",
    },
    {
      name: "attachment-sizes",
      title: "Sizes",
      description: "Use `size` to switch between `default`, `sm`, and `xs`.",
    },
    {
      name: "attachment-group",
      title: "Group",
      description:
        "Wrap attachments in `AttachmentGroup` to lay them out in a horizontally scrollable, snapping row with an edge fade.",
    },
    {
      name: "attachment-trigger",
      title: "Trigger",
      description:
        "Add an `AttachmentTrigger` to make the whole card open a link or dialog — it fills the card behind the actions, so the actions stay clickable.",
    },
  ],
  accessibilityNotes: [
    "`AttachmentAction` is usually icon-only, so give each one an `aria-label` describing the action and its target, e.g. `<AttachmentAction aria-label=\"Remove sales-dashboard.pdf\">`.",
    "`AttachmentTrigger` covers the card with no text of its own, so give it an `aria-label` describing what activating it does. It renders a real `<button>` (`packages/shadcn/ui/attachment/trigger.marko`) positioned `absolute inset-0` behind `AttachmentActions` in the stacking order, so the trigger and any action stay separately focusable and clickable — neither traps the other.",
    "`AttachmentTrigger` accepts an `asChild` prop for API parity with upstream, but this port has no dynamic-tag/props-merging primitive to back it (see the `asChild` deviation comment in `trigger.marko`) — `asChild` is a no-op here and the trigger always renders its own `<button>`, unlike upstream's `render`-prop version which can become an `<a>` or open a dialog trigger.",
    "An `AttachmentGroup` scrolls horizontally. When its attachments are interactive (a trigger or actions), keyboard users reach off-screen items by tabbing to them. For a row of purely presentational attachments, make the group itself focusable and scrollable with `tabIndex={0}`, `role=\"group\"`, and an `aria-label`.",
    "The `error` state applies a destructive color treatment. Keep the failure reason in `AttachmentDescription` so the state isn't conveyed by color alone.",
  ],
};
