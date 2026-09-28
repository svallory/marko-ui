// Suite -> behavior mapping for alert-dialog. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "alert-dialog/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["alert-dialog"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: ["hydration invariant (C-4): SSR attributes survive hydration", "alert-dialog renders identical scoped attributes before and after hydration"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/interaction/trigger-click-opens",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog keyboard contract (APG)", "opens on trigger click and moves focus into the dialog"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/interaction/cancel-closes",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog pointer interaction", "Cancel closes the dialog without running the action"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/interaction/action-runs-callback-and-closes",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog pointer interaction", "the action button runs the action callback and closes the dialog"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/interaction/outside-click-does-not-dismiss",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog pointer interaction", "does not close when the backdrop is clicked"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/keyboard/escape-does-not-dismiss",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog keyboard contract (APG)", "does not close on Escape"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/keyboard/focus-moves-in-and-is-trapped",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog keyboard contract (APG)", "opens on trigger click and moves focus into the dialog"],
      },
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog keyboard contract (APG)", "traps Tab and Shift+Tab within the dialog"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/keyboard/focus-restored-to-trigger",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog keyboard contract (APG)", "returns focus to the trigger when it closes"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/a11y/role-alertdialog",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog ARIA", "has role=alertdialog with aria-modal, not role=dialog"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/a11y/labelled-and-described",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog ARIA", "is labelled by its title and described by its description"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/api/controlled-open",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog props", "follows a controlled open state driven by openChange"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/api/size-sm",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog props", "size=sm renders the small layout"],
      },
    ],
  },
  {
    behaviorId: "alert-dialog/api/media-slot",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/alert-dialog.test.ts",
        title: ["alert-dialog props", "renders the media slot above the title"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // alert-dialog/visual/rtl-mirrors
];
