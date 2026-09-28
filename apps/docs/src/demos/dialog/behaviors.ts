// Behavior list for Dialog (round 2a, reviewed against @zag-js/dialog and the APG Dialog (Modal) pattern).
import type { ComponentBehavior } from "../behavior-types.ts";

export const behaviors: ComponentBehavior[] = [
  {
    id: "dialog/interaction/closed-on-load",
    kind: "interaction",
    description: "On load the dialog content is not rendered and the trigger reports aria-expanded=false.",
    source: "@zag-js/dialog; dialog-demo.marko",
  },
  {
    id: "dialog/interaction/trigger-click-opens",
    kind: "interaction",
    description: "Clicking the trigger opens the dialog.",
    source: "@zag-js/dialog; dialog-demo.marko",
  },
  {
    id: "dialog/interaction/close-button-closes-and-restores-focus",
    kind: "interaction",
    description: "The close button closes the dialog and focus returns to the trigger.",
    source: "dialog.marko close-trigger; dialog-demo.marko",
  },
  {
    id: "dialog/interaction/outside-click-closes",
    kind: "interaction",
    description: "Clicking outside the content closes the dialog (closeOnInteractOutside defaults to true).",
    source: "@zag-js/dialog Props.closeOnInteractOutside; dialog docs.ts notes",
  },
  {
    id: "dialog/keyboard/enter-opens-and-focuses-inside",
    kind: "keyboard",
    description: "Enter on the trigger opens the dialog and moves focus inside it.",
    source: "WAI-ARIA APG dialog (modal) pattern",
  },
  {
    id: "dialog/keyboard/space-opens",
    kind: "keyboard",
    description: "Space on the trigger opens the dialog.",
    source: "WAI-ARIA APG dialog (modal) pattern",
  },
  {
    id: "dialog/keyboard/tab-trapped-in-dialog",
    kind: "keyboard",
    description: "Tab cycles within the dialog and never escapes to the page.",
    source: "WAI-ARIA APG dialog (modal) pattern",
  },
  {
    id: "dialog/keyboard/shift-tab-trapped-in-dialog",
    kind: "keyboard",
    description: "Shift+Tab cycles within the dialog and never escapes to the page.",
    source: "WAI-ARIA APG dialog (modal) pattern",
  },
  {
    id: "dialog/keyboard/tab-cycles-across-elements",
    kind: "keyboard",
    description: "Repeated Tab moves through more than one focusable element rather than stalling.",
    source: "WAI-ARIA APG dialog (modal) pattern",
  },
  {
    id: "dialog/keyboard/escape-closes-and-restores-focus",
    kind: "keyboard",
    description: "Escape closes the dialog, returns focus to the trigger and resets aria-expanded to false.",
    source: "@zag-js/dialog Props.closeOnEscape/restoreFocus",
  },
  {
    id: "dialog/a11y/role-dialog-modal",
    kind: "a11y",
    description: "The open content has role=\"dialog\" and aria-modal=\"true\".",
    source: "WAI-ARIA APG dialog (modal) pattern",
  },
  {
    id: "dialog/a11y/labelled-and-described",
    kind: "a11y",
    description: "The content is aria-labelledby its title and aria-describedby its description, both resolving to the rendered text.",
    source: "WAI-ARIA APG dialog (modal) pattern",
  },
  {
    id: "dialog/api/controlled-open",
    kind: "api",
    description: "A controlled `open` keeps its state until the consumer updates it via `openChange`.",
    source: "@zag-js/dialog Props.open; dialog-controlled.marko",
  },
  {
    id: "dialog/api/show-close-button-false",
    kind: "api",
    description: "`showCloseButton={false}` hides the top-right close button.",
    source: "dialog.marko; dialog-no-close-button.marko",
  },
  {
    id: "dialog/api/prevent-scroll-locks-body",
    kind: "api",
    description: "While open (modal), page scroll is locked.",
    source: "@zag-js/dialog Props.preventScroll",
  },
  {
    id: "dialog/interaction/scrollable-content-keeps-header",
    kind: "interaction",
    description: "Long content scrolls inside the dialog while the header stays visible.",
    source: "dialog-scrollable-content.marko",
  },
  {
    id: "dialog/a11y/structurally-valid-aria",
    kind: "a11y",
    description: "The hero demo's rendered markup has well-formed roles/aria-* attributes and an accessible name where one is required (structural validity only; says nothing about values tracking state).",
    source: "WAI-ARIA APG; scripts/ci/axe-scan.ts scans the dialog hero demo",
  },
  {
    id: "dialog/ssr-hydration/attributes-stable",
    kind: "ssr-hydration",
    description: "Server-rendered ARIA/data attributes on the scoped elements are unchanged after client hydration.",
    source: "packages/shadcn/tests/hydration-coverage.ts INTERACTIVE_COMPONENTS",
  },
  {
    id: "dialog/visual/rtl-mirrors",
    kind: "visual",
    description: "Under dir=\"rtl\" the component renders mirrored via logical properties.",
    source: "dialog-rtl.marko",
  },
];
