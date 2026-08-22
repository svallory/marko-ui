// Hand-authored prose + example ordering for /docs/components/dialog.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Dialog>`,
  importSnippet: `import Dialog from "@/components/ui/dialog/dialog.marko";`,
  usageSnippet: `<Dialog>
  <@trigger|props|>
    <button ...props>Open</button>
  </@trigger>
  <@title>Are you absolutely sure?</@title>
  <@description>
    This action cannot be undone. This will permanently delete your account
    and remove your data from our servers.
  </@description>
</Dialog>`,
  // Upstream ("## Composition") documents Dialog as a tree of
  // DialogTrigger/DialogContent/DialogHeader/DialogTitle/
  // DialogDescription/DialogFooter subcomponents. Our Dialog is a
  // single-file component (api-reference.json sees one part, so
  // isCompound is false) whose "parts" are attr-tag slots instead of
  // separate components — this prose is the hand-authored equivalent the
  // docs template falls back to for that case (see
  // apps/docs/src/routes/docs/components/$name/+page.marko).
  composition:
    "`<Dialog>` is one file exposing upstream's tree as slots: `@trigger` (render-prop, receives the trigger props to spread onto your own element — never nest a `<button>` inside it), `@title`, `@description`, `@content` (the body between the header and footer), and `@footer` (actions row). `@title`/`@description` are optional but recommended: omitting both drops the generated `dialog-header` wrapper entirely, and either one alone renders without the other. `showCloseButton` (default `true`) controls the generated top-right close button.",
  examples: [
    {
      name: "dialog-demo",
      title: "Default",
      description: "A dialog for editing profile details.",
    },
    {
      name: "dialog-close-button",
      title: "Custom close button",
      description: "Replace the default close control with your own button in the footer.",
    },
    {
      name: "dialog-no-close-button",
      title: "No Close Button",
      description: 'Set `showCloseButton={false}` to hide the top-right close button.',
    },
    {
      name: "dialog-sticky-footer",
      title: "Sticky Footer",
      description: "Keep actions visible while the content scrolls.",
    },
    {
      name: "dialog-scrollable-content",
      title: "Scrollable Content",
      description: "Long content can scroll while the header stays in view.",
    },
    {
      name: "dialog-no-footer",
      title: "Without footer",
      description: "The `@footer` tag is optional — omit it for a dialog with no actions row.",
    },
    {
      name: "dialog-rtl",
      title: "RTL",
      description:
        "The `dir` prop is a native attribute pass-through — set it on `<Dialog>` to flip logical-property layout and typography for right-to-left languages. See the [RTL guide](/docs/rtl).",
    },
    {
      name: "dialog-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: an `open` prop without a change handler never moves. Pair it with `openChange`.",
    },
  ],
  accessibilityNotes: [
    'Rendered with `role="dialog"` per the [WAI-ARIA Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/); the title and description are linked to the content via `aria-labelledby`/`aria-describedby`, generated automatically from `@title`/`@description`.',
    "Focus moves into the dialog on open and is trapped there until it closes; it's restored to the trigger element on close.",
    "Both the Escape key and clicking outside the content close the dialog by default (`closeOnEscape`/`closeOnInteractOutside`, both `true`) — unlike `AlertDialog`, which disables both so the user must make an explicit choice.",
  ],
  accessibilityKeyboard: [
    { keys: "Enter / Space", description: "Opens the dialog when focus is on the trigger." },
    { keys: "Escape", description: "Closes the dialog (when `closeOnEscape` is true)." },
    { keys: "Tab / Shift+Tab", description: "Cycles focus among the dialog's focusable elements; focus is trapped inside while open." },
  ],
};
