// Suite -> behavior mapping for collapsible. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "collapsible/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["collapsible"],
      },
    ],
  },
  {
    behaviorId: "collapsible/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: ["hydration invariant (C-4): SSR attributes survive hydration", "collapsible renders identical scoped attributes before and after hydration"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // collapsible/interaction/trigger-click-toggles-open
  // collapsible/keyboard/space-enter-toggle
  // collapsible/interaction/content-stays-in-dom
  // collapsible/api/disabled-ignores-clicks
  // collapsible/api/controlled-open
  // collapsible/api/default-open
  // collapsible/api/collapsed-height
  // collapsible/a11y/trigger-aria-expanded-tracks-state
  // collapsible/a11y/trigger-controls-content
  // collapsible/interaction/nested-collapsibles-independent
  // collapsible/visual/rtl-mirrors
];
