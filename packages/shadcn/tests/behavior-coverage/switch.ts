// Suite -> behavior mapping for Switch. See mapping-types.ts and
// notes/behavior-coverage.md.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

const TOGGLE_CONTROLS_FILE = "packages/shadcn/tests/behavior/toggle-controls.test.ts";
const SWITCH_DESCRIBE = "switch keyboard contract (APG)";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "switch/keyboard/space-toggles-checked",
    provenBy: [
      {
        source: "vitest",
        file: TOGGLE_CONTROLS_FILE,
        title: [SWITCH_DESCRIBE, "toggles with Space and reflects aria-checked"],
      },
    ],
  },
  {
    behaviorId: "switch/api/disabled-blocks-toggle",
    provenBy: [
      {
        source: "vitest",
        file: TOGGLE_CONTROLS_FILE,
        title: [SWITCH_DESCRIBE, "ignores Space when disabled"],
      },
    ],
  },
  {
    behaviorId: "switch/api/default-checked",
    provenBy: [
      {
        source: "vitest",
        file: TOGGLE_CONTROLS_FILE,
        title: [SWITCH_DESCRIBE, "starts checked when the checked prop is set"],
      },
    ],
  },
  {
    behaviorId: "switch/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: [
          "hydration invariant (C-4): SSR attributes survive hydration",
          "switch renders identical scoped attributes before and after hydration",
        ],
      },
    ],
  },
  {
    behaviorId: "switch/a11y/accessible-name-from-label-or-aria-label",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["switch"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // switch/a11y/role-and-checked-state-exposed — real a11y gap, not a test gap:
  //   the hidden input is a plain type="checkbox" (no role, no aria-checked),
  //   and the styled control carries aria-hidden="true" — no rendered element
  //   exposes role=switch/aria-checked. See notes/team-lead/reports/report-behavior-coverage.md.
  // switch/interaction/click-toggles-checked
  // switch/interaction/label-click-toggles-checked
  // switch/api/controlled-checked
  // switch/api/size-variants
  // switch/api/invalid-state
  // switch/api/form-submission-value
  // switch/visual/rtl-mirrors
];
