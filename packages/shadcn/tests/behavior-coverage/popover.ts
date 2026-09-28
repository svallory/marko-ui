// Suite -> behavior mapping for popover. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "popover/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["popover"],
      },
    ],
  },
  {
    behaviorId: "popover/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: ["hydration invariant (C-4): SSR attributes survive hydration", "popover renders identical scoped attributes before and after hydration"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // popover/interaction/trigger-click-toggles-open
  // popover/interaction/outside-click-closes
  // popover/keyboard/enter-space-opens
  // popover/keyboard/escape-closes
  // popover/keyboard/focus-moves-into-content-on-open
  // popover/keyboard/focus-restored-to-trigger
  // popover/api/positioning-placement
  // popover/api/controlled-open
  // popover/api/default-open
  // popover/api/modal-traps-focus
  // popover/interaction/form-controls-usable-inside
  // popover/a11y/trigger-aria-expanded-tracks-state
  // popover/a11y/trigger-controls-content
  // popover/visual/rtl-mirrors
];
