// Behavior list for Alert Dialog (round 2a, reviewed against @zag-js/dialog with role=alertdialog and the APG Alert Dialog pattern).
// Behaviors are proven by packages/shadcn/tests/behavior/alert-dialog.test.ts (dialog.test.ts covers only <Dialog>).
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "alert-dialog/interaction/trigger-click-opens",
    kind: "interaction",
    description: "Clicking the trigger opens the alert dialog.",
    source: "@zag-js/dialog; alert-dialog-basic.marko",
  },
  {
    id: "alert-dialog/interaction/cancel-closes",
    kind: "interaction",
    description: "The Cancel button closes the dialog without running `action`.",
    source: "alert-dialog.marko; alert-dialog-basic.marko",
  },
  {
    id: "alert-dialog/interaction/action-runs-callback-and-closes",
    kind: "interaction",
    description: "The action button runs the `action` callback and closes the dialog.",
    source: "alert-dialog.marko; alert-dialog-destructive.marko",
  },
  {
    id: "alert-dialog/interaction/outside-click-does-not-dismiss",
    kind: "interaction",
    description: "Clicking outside the content does not close the dialog (closeOnInteractOutside is false by default).",
    source: "@zag-js/dialog Props.closeOnInteractOutside; alert-dialog docs.ts notes",
  },
  {
    id: "alert-dialog/keyboard/escape-does-not-dismiss",
    kind: "keyboard",
    description: "Escape does not close the dialog (closeOnEscape is false by default).",
    source: "@zag-js/dialog Props.closeOnEscape; alert-dialog docs.ts notes",
  },
  {
    id: "alert-dialog/keyboard/focus-moves-in-and-is-trapped",
    kind: "keyboard",
    description: "Focus moves into the dialog on open and Tab/Shift+Tab cycle within it.",
    source: "WAI-ARIA APG alertdialog pattern; @zag-js/dialog Props.trapFocus",
  },
  {
    id: "alert-dialog/keyboard/focus-restored-to-trigger",
    kind: "keyboard",
    description: "Closing the dialog returns focus to the trigger.",
    source: "@zag-js/dialog Props.restoreFocus",
  },
  {
    id: "alert-dialog/a11y/role-alertdialog",
    kind: "a11y",
    description: "The content has role=\"alertdialog\" and aria-modal, not role=\"dialog\".",
    source: "WAI-ARIA APG alertdialog pattern; alert-dialog.marko",
  },
  {
    id: "alert-dialog/a11y/labelled-and-described",
    kind: "a11y",
    description: "The content is aria-labelledby its title and aria-describedby its description.",
    source: "WAI-ARIA APG alertdialog pattern; alert-dialog docs.ts notes",
  },
  {
    id: "alert-dialog/api/controlled-open",
    kind: "api",
    description: "A controlled `open` keeps the dialog in that state until the consumer updates it via `openChange`.",
    source: "@zag-js/dialog Props.open; alert-dialog-controlled.marko",
  },
  {
    id: "alert-dialog/api/size-sm",
    kind: "api",
    description: "`size=\"sm\"` renders the smaller dialog layout (presentational).",
    source: "alert-dialog.marko; alert-dialog-small.marko",
  },
  {
    id: "alert-dialog/api/media-slot",
    kind: "api",
    description: "The `@media` slot renders an icon/image above the title.",
    source: "alert-dialog.marko; alert-dialog-media.marko",
  },
  {
    id: "alert-dialog/a11y/structurally-valid-aria",
    kind: "a11y",
    description: "The hero demo's rendered markup has well-formed roles/aria-* attributes and an accessible name where one is required (structural validity only; says nothing about values tracking state).",
    source: "WAI-ARIA APG; scripts/ci/axe-scan.ts scans the alert-dialog hero demo",
  },
  {
    id: "alert-dialog/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS",
  },
  {
    id: "alert-dialog/visual/rtl-mirrors",
    kind: "visual",
    description: "Under dir=\"rtl\" the component renders mirrored via logical properties.",
    source: "alert-dialog-rtl.marko",
  },
];
