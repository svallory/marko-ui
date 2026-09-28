// Suite -> behavior mapping for tooltip. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "tooltip/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["tooltip"],
      },
    ],
  },
  {
    behaviorId: "tooltip/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: ["hydration invariant (C-4): SSR attributes survive hydration", "tooltip renders identical scoped attributes before and after hydration"],
      },
    ],
  },
  {
    behaviorId: "tooltip/interaction/hover-opens-after-delay",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tooltip.test.ts",
        title: ["tooltip pointer interaction", "opens on hover only after the open delay has elapsed"],
      },
    ],
  },
  {
    behaviorId: "tooltip/interaction/pointer-leave-closes-after-delay",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tooltip.test.ts",
        title: ["tooltip pointer interaction", "closes once the pointer leaves the trigger"],
      },
    ],
  },
  {
    behaviorId: "tooltip/interaction/closes-on-scroll",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tooltip.test.ts",
        title: ["tooltip pointer interaction", "closes when the page scrolls"],
      },
    ],
  },
  {
    behaviorId: "tooltip/interaction/closes-on-trigger-pointer-down",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tooltip.test.ts",
        title: ["tooltip pointer interaction", "closes when the trigger is pressed"],
      },
    ],
  },
  {
    behaviorId: "tooltip/keyboard/focus-opens",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tooltip.test.ts",
        title: ["tooltip keyboard contract (APG)", "opens when the trigger receives keyboard focus"],
      },
    ],
  },
  {
    behaviorId: "tooltip/keyboard/escape-closes",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tooltip.test.ts",
        title: ["tooltip keyboard contract (APG)", "closes on Escape without moving focus"],
      },
    ],
  },
  {
    behaviorId: "tooltip/a11y/aria-describedby-only-while-open",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tooltip.test.ts",
        title: ["tooltip ARIA", "has role=tooltip content, referenced by aria-describedby only while open"],
      },
    ],
  },
  {
    behaviorId: "tooltip/a11y/role-tooltip",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tooltip.test.ts",
        title: ["tooltip ARIA", "has role=tooltip content, referenced by aria-describedby only while open"],
      },
    ],
  },
  {
    behaviorId: "tooltip/api/positioning-placement",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tooltip.test.ts",
        title: ["tooltip props", "renders on the side given by positioning.placement"],
      },
    ],
  },
  {
    behaviorId: "tooltip/api/disabled-button-via-span-wrapper",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/tooltip.test.ts",
        title: ["tooltip pointer interaction", "shows the tooltip for a disabled button when the props sit on a wrapping span"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // tooltip/interaction/interactive-content-stays-open
  // tooltip/a11y/role-omitted-with-tooltip-aria-label
  // tooltip/api/disabled-suppresses-tooltip
  // tooltip/visual/rtl-mirrors
];
