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
  // Not covered by any existing check (honest gaps, not omissions):
  // alert-dialog/interaction/trigger-click-opens
  // alert-dialog/interaction/cancel-closes
  // alert-dialog/interaction/action-runs-callback-and-closes
  // alert-dialog/interaction/outside-click-does-not-dismiss
  // alert-dialog/keyboard/escape-does-not-dismiss
  // alert-dialog/keyboard/focus-moves-in-and-is-trapped
  // alert-dialog/keyboard/focus-restored-to-trigger
  // alert-dialog/a11y/role-alertdialog
  // alert-dialog/a11y/labelled-and-described
  // alert-dialog/api/controlled-open
  // alert-dialog/api/size-sm
  // alert-dialog/api/media-slot
  // alert-dialog/visual/rtl-mirrors
];
