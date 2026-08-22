// Hand-authored prose + example ordering for /docs/components/alert-dialog.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A modal dialog that interrupts the user with important content and expects a response.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<AlertDialog>`,
  importSnippet: `import AlertDialog from "@/components/ui/alert-dialog/alert-dialog.marko";`,
  usageSnippet: `<AlertDialog>
  <@trigger|props|>
    <Button ...props variant="outline">Show Dialog</Button>
  </@trigger>
  <@title>Are you absolutely sure?</@title>
  <@description>
    This action cannot be undone.
  </@description>
</AlertDialog>`,
  // Upstream ("## Composition") documents AlertDialog as a tree of
  // AlertDialogTrigger/AlertDialogContent/AlertDialogHeader/
  // AlertDialogMedia/AlertDialogTitle/AlertDialogDescription/
  // AlertDialogFooter/AlertDialogCancel/AlertDialogAction subcomponents.
  // Our AlertDialog is a single-file component (api-reference.json sees
  // one part, so isCompound is false) whose "parts" are attr-tag slots
  // instead of separate components — this prose is the hand-authored
  // equivalent the docs template falls back to for that case (see
  // apps/docs/src/routes/docs/components/$name/+page.marko).
  composition:
    "`<AlertDialog>` is one file exposing upstream's tree as slots: `@trigger` (render-prop, receives the trigger props to spread onto your own element — never nest a `<button>` inside it), `@media` (optional icon/image above the title), `@title`, and `@description`. The footer's Cancel/Continue buttons are generated from props (`cancelText`/`actionText`, `cancelVariant`/`actionVariant`, `action`) rather than composed as separate slots.",
  examples: [
    {
      name: "alert-dialog-basic",
      title: "Basic",
      description:
        "A basic alert dialog with a title, description, and cancel and continue buttons.",
    },
    {
      name: "alert-dialog-small",
      title: "Small",
      description: 'Use the `size="sm"` prop to make the alert dialog smaller.',
    },
    {
      name: "alert-dialog-media",
      title: "Media",
      description:
        "Use the `@media` slot to add a media element such as an icon or image to the alert dialog.",
    },
    {
      name: "alert-dialog-small-media",
      title: "Small with Media",
      description:
        'Use the `size="sm"` prop to make the alert dialog smaller and the `@media` slot to add a media element such as an icon or image to the alert dialog.',
    },
    {
      name: "alert-dialog-destructive",
      title: "Destructive",
      description:
        "Override `cancelText` and `actionText`, and run side effects on confirm with the `action` callback.",
    },
    {
      name: "alert-dialog-demo",
      title: "Demo",
      description:
        "The hero preview shown at the top of this page — the same basic composition as above.",
    },
    {
      name: "alert-dialog-rtl",
      title: "RTL",
      description:
        "The `dir` prop is a native attribute pass-through — set it on `<AlertDialog>` to flip logical-property layout and typography for right-to-left languages. See the [RTL guide](/docs/rtl).",
    },
    {
      name: "alert-dialog-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: an `open` prop without a change handler never moves. Pair it with `openChange`, or use Marko's bind shorthand `open:=state`.",
    },
  ],
  accessibilityNotes: [
    "Rendered with `role=\"alertdialog\"` (not `\"dialog\"`) so assistive technology announces it as requiring an explicit response, per the [WAI-ARIA Alert and Message Dialogs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/).",
    "Focus moves into the dialog on open and is trapped there until it closes; it's restored to the trigger element on close.",
    "Unlike a plain dialog, closing via the Escape key and clicking outside the content are both disabled by default (`closeOnEscape={false}`, `closeOnInteractOutside={false}`) — the user must choose Cancel or Continue.",
    "The title and description are linked to the content via `aria-labelledby`/`aria-describedby`, generated automatically from `@title`/`@description`.",
  ],
};
