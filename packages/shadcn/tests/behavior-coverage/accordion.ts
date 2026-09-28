// Suite -> behavior mapping for accordion. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "accordion/interaction/single-mode-keeps-one-open",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "keeps at most one section open in single mode"],
      },
    ],
  },
  {
    behaviorId: "accordion/interaction/multiple-allows-several-open",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "allows several sections open at once in multiple mode"],
      },
    ],
  },
  {
    behaviorId: "accordion/interaction/collapsible-closes-open-item",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "collapses an open section with Enter when collapsible"],
      },
    ],
  },
  {
    behaviorId: "accordion/interaction/not-collapsible-keeps-last-open",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "refuses to collapse the last open section when not collapsible"],
      },
    ],
  },
  {
    behaviorId: "accordion/interaction/starts-collapsed",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "starts collapsed with every trigger reporting aria-expanded=false"],
      },
    ],
  },
  {
    behaviorId: "accordion/keyboard/enter-toggles-focused-item",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "expands the focused section with Enter"],
      },
    ],
  },
  {
    behaviorId: "accordion/keyboard/space-toggles-focused-item",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "toggles with Space"],
      },
    ],
  },
  {
    behaviorId: "accordion/keyboard/arrow-down-up-moves-focus",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "moves focus between headers with ArrowDown / ArrowUp"],
      },
    ],
  },
  {
    behaviorId: "accordion/keyboard/arrow-focus-wraps",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "wraps focus at the ends"],
      },
    ],
  },
  {
    behaviorId: "accordion/keyboard/home-end-jump-to-first-last",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "jumps to first and last header with Home / End"],
      },
    ],
  },
  {
    behaviorId: "accordion/a11y/aria-expanded-tracks-state",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "starts collapsed with every trigger reporting aria-expanded=false"],
      },
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "expands the focused section with Enter"],
      },
    ],
  },
  {
    behaviorId: "accordion/a11y/trigger-controls-labelled-region",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/accordion.test.ts",
        title: ["accordion keyboard contract (APG)", "wires each trigger to its panel via aria-controls"],
      },
    ],
  },
  {
    behaviorId: "accordion/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["accordion"],
      },
    ],
  },
  {
    behaviorId: "accordion/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: ["hydration invariant (C-4): SSR attributes survive hydration", "accordion renders identical scoped attributes before and after hydration"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // accordion/interaction/click-toggles-item
  // accordion/api/disabled-blocks-all-triggers
  // accordion/api/controlled-value
  // accordion/api/orientation-horizontal-arrow-keys
  // accordion/api/compound-item-tags
  // accordion/visual/rtl-mirrors
];
