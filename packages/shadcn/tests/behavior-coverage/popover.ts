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
  {
    behaviorId: "popover/interaction/trigger-click-toggles-open",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/popover.test.ts",
        title: ["popover pointer interaction", "toggles open and closed when the trigger is clicked"],
      },
    ],
  },
  {
    behaviorId: "popover/interaction/outside-click-closes",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/popover.test.ts",
        title: ["popover pointer interaction", "closes when the user clicks outside the content"],
      },
    ],
  },
  {
    behaviorId: "popover/keyboard/enter-space-opens",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/popover.test.ts",
        title: ["popover keyboard contract (APG)", "opens with Enter and moves focus into the content"],
      },
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/popover.test.ts",
        title: ["popover keyboard contract (APG)", "opens with Space"],
      },
    ],
  },
  {
    behaviorId: "popover/keyboard/escape-closes",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/popover.test.ts",
        title: ["popover keyboard contract (APG)", "closes on Escape and returns focus to the trigger"],
      },
    ],
  },
  {
    behaviorId: "popover/keyboard/focus-moves-into-content-on-open",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/popover.test.ts",
        title: ["popover keyboard contract (APG)", "opens with Enter and moves focus into the content"],
      },
    ],
  },
  {
    behaviorId: "popover/keyboard/focus-restored-to-trigger",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/popover.test.ts",
        title: ["popover keyboard contract (APG)", "closes on Escape and returns focus to the trigger"],
      },
    ],
  },
  {
    behaviorId: "popover/api/positioning-placement",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/popover.test.ts",
        title: ["popover props", "places the content on the side given by positioning.placement"],
      },
    ],
  },
  {
    behaviorId: "popover/api/controlled-open",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/popover.test.ts",
        title: ["popover props", "follows a controlled open state driven by openChange"],
      },
    ],
  },
  {
    behaviorId: "popover/interaction/form-controls-usable-inside",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/popover.test.ts",
        title: ["popover pointer interaction", "keeps the popover open while form controls inside are used"],
      },
    ],
  },
  {
    behaviorId: "popover/a11y/trigger-aria-expanded-tracks-state",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/popover.test.ts",
        title: ["popover ARIA", "advertises the dialog it controls and tracks aria-expanded"],
      },
    ],
  },
  {
    behaviorId: "popover/a11y/trigger-controls-content",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/popover.test.ts",
        title: ["popover ARIA", "advertises the dialog it controls and tracks aria-expanded"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // popover/api/default-open
  // popover/api/modal-traps-focus
  // popover/visual/rtl-mirrors
];
