// Suite -> behavior mapping for select. See mapping-types.ts and notes/behavior-coverage.md.
// A check is listed only where its test actually asserts the behavior as worded.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "select/interaction/mouse-open-supports-arrow-navigation",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "supports arrow navigation after opening with the mouse"],
      },
    ],
  },
  {
    behaviorId: "select/interaction/starts-closed",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "starts collapsed with aria-expanded=false"],
      },
    ],
  },
  {
    behaviorId: "select/keyboard/enter-opens-listbox",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "opens with Enter and exposes a listbox"],
      },
    ],
  },
  {
    behaviorId: "select/keyboard/space-opens-listbox",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "opens with Space as well"],
      },
    ],
  },
  {
    behaviorId: "select/keyboard/arrow-down-up-moves-highlight",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "moves the highlighted option with ArrowDown / ArrowUp"],
      },
    ],
  },
  {
    behaviorId: "select/keyboard/enter-selects-highlighted-and-closes",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "selects the highlighted option with Enter and closes"],
      },
    ],
  },
  {
    behaviorId: "select/keyboard/escape-closes-without-change",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "closes on Escape without changing the selection"],
      },
    ],
  },
  {
    behaviorId: "select/a11y/trigger-aria-expanded-tracks-state",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "starts collapsed with aria-expanded=false"],
      },
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "opens with Enter and exposes a listbox"],
      },
    ],
  },
  {
    behaviorId: "select/a11y/listbox-role",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "opens with Enter and exposes a listbox"],
      },
    ],
  },
  {
    behaviorId: "select/a11y/selected-option-aria-selected",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "marks the selected option with aria-selected when reopened"],
      },
    ],
  },
  {
    behaviorId: "select/api/default-value",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "marks the selected option with aria-selected when reopened"],
      },
    ],
  },
  {
    behaviorId: "select/api/disabled-blocks-open",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "does not open when the select is disabled"],
      },
    ],
  },
  {
    behaviorId: "select/api/disabled-items-never-highlighted",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/select.test.ts",
        title: ["select keyboard contract (APG)", "never highlights a disabled option"],
      },
    ],
  },
  {
    behaviorId: "select/a11y/structurally-valid-aria",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["select"],
      },
    ],
  },
  {
    behaviorId: "select/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: ["hydration invariant (C-4): SSR attributes survive hydration", "select renders identical scoped attributes before and after hydration"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps, not omissions):
  // select/keyboard/home-end-jump-highlight
  // select/keyboard/typeahead-jumps-highlight
  // select/keyboard/tab-closes-and-moves-focus
  // select/api/controlled-value
  // select/api/groups
  // select/api/multiple-selection
  // select/api/form-submission-value
  // select/api/invalid-state
  // select/api/compound-option-tags
  // select/visual/rtl-mirrors
];
