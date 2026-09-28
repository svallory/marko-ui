// Suite -> behavior mapping for dialog. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "dialog/interaction/closed-on-load",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/dialog.test.ts",
        title: ["dialog keyboard contract (APG)", "is closed on load"],
      },
    ],
  },
  {
    behaviorId: "dialog/interaction/close-button-closes-and-restores-focus",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/dialog.test.ts",
        title: ["dialog keyboard contract (APG)", "closes via the close button and restores focus"],
      },
    ],
  },
  {
    behaviorId: "dialog/keyboard/enter-opens-and-focuses-inside",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/dialog.test.ts",
        title: ["dialog keyboard contract (APG)", "opens with Enter and moves focus into the dialog"],
      },
    ],
  },
  {
    behaviorId: "dialog/keyboard/space-opens",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/dialog.test.ts",
        title: ["dialog keyboard contract (APG)", "opens with Space as well as Enter"],
      },
    ],
  },
  {
    behaviorId: "dialog/keyboard/tab-trapped-in-dialog",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/dialog.test.ts",
        title: ["dialog keyboard contract (APG)", "traps Tab within the dialog"],
      },
    ],
  },
  {
    behaviorId: "dialog/keyboard/shift-tab-trapped-in-dialog",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/dialog.test.ts",
        title: ["dialog keyboard contract (APG)", "traps Shift+Tab within the dialog"],
      },
    ],
  },
  {
    behaviorId: "dialog/keyboard/tab-cycles-across-elements",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/dialog.test.ts",
        title: ["dialog keyboard contract (APG)", "cycles focus rather than stalling on one element"],
      },
    ],
  },
  {
    behaviorId: "dialog/keyboard/escape-closes-and-restores-focus",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/dialog.test.ts",
        title: ["dialog keyboard contract (APG)", "closes on Escape and returns focus to the trigger"],
      },
    ],
  },
  {
    behaviorId: "dialog/a11y/role-dialog-modal",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/dialog.test.ts",
        title: ["dialog keyboard contract (APG)", "opens with Enter and moves focus into the dialog"],
      },
    ],
  },
  {
    behaviorId: "dialog/a11y/labelled-and-described",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/dialog.test.ts",
        title: ["dialog keyboard contract (APG)", "labels the dialog by its title and describes it by its description"],
      },
    ],
  },
  {
    behaviorId: "dialog/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["dialog"],
      },
    ],
  },
  {
    behaviorId: "dialog/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: ["hydration invariant (C-4): SSR attributes survive hydration", "dialog renders identical scoped attributes before and after hydration"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // dialog/interaction/trigger-click-opens
  // dialog/interaction/outside-click-closes
  // dialog/api/controlled-open
  // dialog/api/show-close-button-false
  // dialog/api/prevent-scroll-locks-body
  // dialog/interaction/scrollable-content-keeps-header
  // dialog/visual/rtl-mirrors
];
