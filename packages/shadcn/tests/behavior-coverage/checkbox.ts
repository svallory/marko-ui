// Suite -> behavior mapping for checkbox. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "checkbox/keyboard/space-toggles-checked",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
        title: ["checkbox keyboard contract (APG)", "toggles with Space"],
      },
    ],
  },
  {
    behaviorId: "checkbox/api/indeterminate-state",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
        title: ["checkbox keyboard contract (APG)", "exposes the indeterminate state as data-state=indeterminate"],
      },
    ],
  },
  {
    behaviorId: "checkbox/api/disabled-blocks-toggle",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
        title: ["checkbox keyboard contract (APG)", "ignores Space when disabled"],
      },
    ],
  },
  {
    behaviorId: "checkbox/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["checkbox"],
      },
    ],
  },
  {
    behaviorId: "checkbox/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: ["hydration invariant (C-4): SSR attributes survive hydration", "checkbox renders identical scoped attributes before and after hydration"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // checkbox/interaction/click-toggles-checked
  // checkbox/interaction/label-click-toggles-checked
  // checkbox/api/controlled-checked
  // checkbox/api/default-checked
  // checkbox/api/invalid-state
  // checkbox/api/read-only-blocks-toggle
  // checkbox/api/form-submission-value
  // checkbox/api/group-independent-items
  // checkbox/a11y/native-checkbox-semantics
  // checkbox/visual/rtl-mirrors
];
