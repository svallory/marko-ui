// Suite -> behavior mapping for tooltip. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "tooltip/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["tooltip"],
      },
    ],
  },
  {
    behaviorId: "tooltip/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: ["hydration invariant (C-4): SSR attributes survive hydration", "tooltip renders identical scoped attributes before and after hydration"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // tooltip/interaction/hover-opens-after-delay
  // tooltip/interaction/pointer-leave-closes-after-delay
  // tooltip/interaction/interactive-content-stays-open
  // tooltip/interaction/closes-on-scroll
  // tooltip/interaction/closes-on-trigger-pointer-down
  // tooltip/keyboard/focus-opens
  // tooltip/keyboard/escape-closes
  // tooltip/a11y/aria-describedby-only-while-open
  // tooltip/a11y/role-tooltip-unless-aria-label
  // tooltip/api/positioning-placement
  // tooltip/api/disabled-suppresses-tooltip
  // tooltip/api/disabled-button-via-span-wrapper
  // tooltip/visual/rtl-mirrors
];
