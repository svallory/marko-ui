// Suite -> behavior mapping for radio-group. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "radio-group/interaction/exactly-one-checked",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
        title: ["radio group keyboard contract (APG)", "keeps exactly one radio checked at a time"],
      },
    ],
  },
  {
    behaviorId: "radio-group/keyboard/arrow-down-moves-checked",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
        title: ["radio group keyboard contract (APG)", "moves the checked radio with ArrowDown"],
      },
    ],
  },
  {
    behaviorId: "radio-group/keyboard/arrow-up-moves-checked",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
        title: ["radio group keyboard contract (APG)", "moves the checked radio back with ArrowUp"],
      },
    ],
  },
  {
    behaviorId: "radio-group/keyboard/arrow-selection-wraps",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
        title: ["radio group keyboard contract (APG)", "wraps selection past the first radio"],
      },
    ],
  },
  {
    behaviorId: "radio-group/keyboard/arrow-skips-disabled-item",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
        title: ["radio group keyboard contract (APG)", "skips a disabled radio during arrow navigation"],
      },
    ],
  },
  {
    behaviorId: "radio-group/a11y/role-radiogroup-with-one-checked",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
        title: ["radio group keyboard contract (APG)", "exposes role=radiogroup with one checked item"],
      },
    ],
  },
  {
    behaviorId: "radio-group/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["radio-group"],
      },
    ],
  },
  {
    behaviorId: "radio-group/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: ["hydration invariant (C-4): SSR attributes survive hydration", "radio-group renders identical scoped attributes before and after hydration"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // radio-group/interaction/click-selects-item
  // radio-group/api/disabled-group
  // radio-group/api/controlled-value
  // radio-group/api/default-value
  // radio-group/api/orientation-horizontal
  // radio-group/api/form-submission-value
  // radio-group/api/read-only-blocks-change
  // radio-group/api/compound-item-tags
  // radio-group/visual/rtl-mirrors
];
