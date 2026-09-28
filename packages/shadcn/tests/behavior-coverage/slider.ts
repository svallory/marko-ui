// Suite -> behavior mapping for slider. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "slider/keyboard/arrow-right-left-changes-value",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/slider.test.ts",
        title: ["slider keyboard contract (APG)", "increases with ArrowRight and decreases with ArrowLeft"],
      },
    ],
  },
  {
    behaviorId: "slider/keyboard/cross-axis-arrows-ignored",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/slider.test.ts",
        title: ["slider keyboard contract (APG)", "ignores the cross-axis arrow keys on a horizontal slider"],
      },
    ],
  },
  {
    behaviorId: "slider/keyboard/home-end-jump-to-bounds",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/slider.test.ts",
        title: ["slider keyboard contract (APG)", "jumps to the bounds with Home / End"],
      },
    ],
  },
  {
    behaviorId: "slider/keyboard/value-clamped-at-bounds",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/slider.test.ts",
        title: ["slider keyboard contract (APG)", "clamps at the bounds instead of overflowing"],
      },
    ],
  },
  {
    behaviorId: "slider/keyboard/page-up-down-larger-step",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/slider.test.ts",
        title: ["slider keyboard contract (APG)", "moves by a larger increment with PageUp / PageDown"],
      },
    ],
  },
  {
    behaviorId: "slider/keyboard/step-quantizes-movement",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/slider.test.ts",
        title: ["slider keyboard contract (APG)", "quantizes movement to the configured step"],
      },
    ],
  },
  {
    behaviorId: "slider/keyboard/range-thumbs-independent",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/slider.test.ts",
        title: ["slider keyboard contract (APG)", "keeps range thumbs independently operable and ordered"],
      },
    ],
  },
  {
    behaviorId: "slider/keyboard/lower-thumb-cannot-pass-upper",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/slider.test.ts",
        title: ["slider keyboard contract (APG)", "prevents the lower range thumb from passing the upper one"],
      },
    ],
  },
  {
    behaviorId: "slider/a11y/role-slider-with-value-range",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/slider.test.ts",
        title: ["slider keyboard contract (APG)", "exposes role=slider with the full value range"],
      },
    ],
  },
  {
    behaviorId: "slider/api/default-value",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/slider.test.ts",
        title: ["slider keyboard contract (APG)", "exposes role=slider with the full value range"],
      },
    ],
  },
  {
    behaviorId: "slider/api/disabled-blocks-input",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/slider.test.ts",
        title: ["slider keyboard contract (APG)", "removes a disabled slider from the tab order and ignores arrow keys"],
      },
    ],
  },
  {
    behaviorId: "slider/api/controlled-value",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/slider.test.ts",
        title: ["slider keyboard contract (APG)", "reflects keyboard changes through the controlled value binding"],
      },
    ],
  },
  {
    behaviorId: "slider/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["slider"],
      },
    ],
  },
  {
    behaviorId: "slider/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: ["hydration invariant (C-4): SSR attributes survive hydration", "slider renders identical scoped attributes before and after hydration"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // slider/interaction/pointer-drag-sets-value
  // slider/api/orientation-vertical
  // slider/api/rtl-reverses-direction
  // slider/api/form-submission-value
  // slider/api/read-only-blocks-change
  // slider/api/aria-value-text
  // slider/visual/rtl-mirrors
];
