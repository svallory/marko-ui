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
  {
    behaviorId: "toggle/interaction/click-toggles-pressed",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle.test.ts",
        title: ["toggle pointer interaction", "flips pressed on click"],
      },
    ],
  },
  {
    behaviorId: "toggle/keyboard/space-enter-toggles-pressed",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle.test.ts",
        title: ["toggle keyboard contract (APG button)", "flips pressed with Space and with Enter"],
      },
    ],
  },
  {
    behaviorId: "toggle/a11y/aria-pressed-always-present",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle.test.ts",
        title: ["toggle keyboard contract (APG button)", "starts unpressed with aria-pressed=\"false\" and data-state=off"],
      },
    ],
  },
  {
    behaviorId: "toggle/api/disabled-blocks-toggle",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle.test.ts",
        title: ["toggle props", "a disabled toggle is skipped by Tab and ignores clicks"],
      },
    ],
  },
  {
    behaviorId: "toggle/api/controlled-pressed",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle.test.ts",
        title: ["toggle props", "a controlled pressed prop sets the state and pressedChange reports toggles"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // toggle/api/variant-outline
  // toggle/api/size-variants
  // toggle/ssr-hydration/pressed-state-stable
  // toggle/visual/rtl-mirrors
];
