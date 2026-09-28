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
  {
    behaviorId: "collapsible/interaction/trigger-click-toggles-open",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/collapsible.test.ts",
        title: ["collapsible pointer interaction", "toggles the panel when the trigger is clicked"],
      },
    ],
  },
  {
    behaviorId: "collapsible/keyboard/space-enter-toggle",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/collapsible.test.ts",
        title: ["collapsible keyboard contract (APG disclosure)", "toggles with Enter and with Space"],
      },
    ],
  },
  {
    behaviorId: "collapsible/interaction/content-stays-in-dom",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/collapsible.test.ts",
        title: ["collapsible pointer interaction", "keeps the panel in the DOM while closed, hidden until opened"],
      },
    ],
  },
  {
    behaviorId: "collapsible/api/disabled-ignores-clicks",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/collapsible.test.ts",
        title: ["collapsible props", "ignores activation when disabled but keeps the trigger focusable"],
      },
    ],
  },
  {
    behaviorId: "collapsible/api/controlled-open",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/collapsible.test.ts",
        title: ["collapsible props", "follows a controlled open state changed from outside the trigger"],
      },
    ],
  },
  {
    behaviorId: "collapsible/a11y/trigger-aria-expanded-tracks-state",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/collapsible.test.ts",
        title: ["collapsible ARIA", "tracks aria-expanded and points aria-controls at the panel"],
      },
    ],
  },
  {
    behaviorId: "collapsible/a11y/trigger-controls-content",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/collapsible.test.ts",
        title: ["collapsible ARIA", "tracks aria-expanded and points aria-controls at the panel"],
      },
    ],
  },
  {
    behaviorId: "collapsible/interaction/nested-collapsibles-independent",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/collapsible.test.ts",
        title: ["collapsible pointer interaction", "toggles nested collapsibles independently of their parent"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // collapsible/api/default-open
  // collapsible/api/collapsed-height
  // collapsible/visual/rtl-mirrors
];
