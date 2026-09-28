// Suite -> behavior mapping for tabs. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "tabs/interaction/first-tab-selected-on-load",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tabs.test.ts",
        title: ["tabs keyboard contract (APG)", "selects the first tab and shows only its panel on load"],
      },
    ],
  },
  {
    behaviorId: "tabs/interaction/one-panel-visible",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tabs.test.ts",
        title: ["tabs keyboard contract (APG)", "keeps exactly one panel visible as selection moves"],
      },
    ],
  },
  {
    behaviorId: "tabs/keyboard/roving-tabindex",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tabs.test.ts",
        title: ["tabs keyboard contract (APG)", "implements roving tabindex on the tablist"],
      },
    ],
  },
  {
    behaviorId: "tabs/keyboard/arrow-right-left-moves-focus-and-selection",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tabs.test.ts",
        title: ["tabs keyboard contract (APG)", "moves focus and selection with ArrowRight / ArrowLeft"],
      },
    ],
  },
  {
    behaviorId: "tabs/keyboard/arrow-focus-wraps",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tabs.test.ts",
        title: ["tabs keyboard contract (APG)", "wraps focus at both ends of the tablist"],
      },
    ],
  },
  {
    behaviorId: "tabs/keyboard/home-end-focus-first-last",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tabs.test.ts",
        title: ["tabs keyboard contract (APG)", "jumps to the first and last tab with Home / End"],
      },
    ],
  },
  {
    behaviorId: "tabs/keyboard/arrow-skips-disabled-tab",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tabs.test.ts",
        title: ["tabs keyboard contract (APG)", "skips a disabled tab during arrow navigation"],
      },
    ],
  },
  {
    behaviorId: "tabs/a11y/aria-selected-tracks-selection",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tabs.test.ts",
        title: ["tabs keyboard contract (APG)", "moves focus and selection with ArrowRight / ArrowLeft"],
      },
    ],
  },
  {
    behaviorId: "tabs/a11y/tab-panel-association",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tabs.test.ts",
        title: ["tabs keyboard contract (APG)", "associates each tab with its panel via aria-controls"],
      },
    ],
  },
  {
    behaviorId: "tabs/api/attr-tags-take-precedence",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/compound-order.test.ts",
        title: ["tabs <@trigger>/<@panel> precedence over items=", "gives attr tags precedence for both triggers and panels when both sources are supplied"],
      },
    ],
  },
  {
    behaviorId: "tabs/api/hybrid-trigger-tags-with-items-panels",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/compound-order.test.ts",
        title: ["tabs <@trigger>/<@panel> precedence over items=", "hybrid: <@trigger> with items= and no <@panel> pairs attr-tag triggers with items=-derived panels"],
      },
    ],
  },
  {
    behaviorId: "tabs/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["tabs"],
      },
    ],
  },
  {
    behaviorId: "tabs/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: ["hydration invariant (C-4): SSR attributes survive hydration", "tabs renders identical scoped attributes before and after hydration"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // tabs/interaction/click-selects-tab
  // tabs/api/controlled-value
  // tabs/api/manual-activation-mode
  // tabs/api/orientation-vertical
  // tabs/api/deselectable
  // tabs/visual/line-variant
  // tabs/visual/rtl-mirrors
];
