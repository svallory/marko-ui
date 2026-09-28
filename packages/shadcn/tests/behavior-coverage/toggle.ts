// Suite -> behavior mapping for toggle. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "toggle/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["toggle"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // toggle/interaction/click-toggles-pressed
  // toggle/keyboard/space-enter-toggles-pressed
  // toggle/a11y/aria-pressed-always-present
  // toggle/api/disabled-blocks-toggle
  // toggle/api/controlled-pressed
  // toggle/api/variant-outline
  // toggle/api/size-variants
  // toggle/ssr-hydration/pressed-state-stable
  // toggle/visual/rtl-mirrors
];
