// Suite -> behavior mapping for Combobox. See mapping-types.ts and
// notes/behavior-coverage.md.
//
// Combobox has no dedicated packages/shadcn/tests/behavior/*.test.ts suite
// today — unlike switch/checkbox (toggle-controls.test.ts) or tabs
// (tabs.test.ts), nothing drives its interaction/keyboard contract with
// Playwright. Only the two structural checks every Zag-backed component
// gets automatically (hydration-invariant, axe-scan) apply.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "combobox/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: [
          "hydration invariant (C-4): SSR attributes survive hydration",
          "combobox renders identical scoped attributes before and after hydration",
        ],
      },
    ],
  },
  {
    behaviorId: "combobox/a11y/combobox-listbox-roles",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["combobox"],
      },
    ],
  },
  // Not covered by any existing check — the whole interaction/keyboard
  // surface, including the one behavior the machine supports but no demo
  // exercises (combobox/api/async-item-loading):
  // combobox/interaction/trigger-click-opens
  // combobox/interaction/typing-filters-options
  // combobox/interaction/option-click-selects
  // combobox/interaction/clear-button-resets
  // combobox/interaction/multiple-selection-accumulates
  // combobox/interaction/outside-click-closes
  // combobox/interaction/disabled-option-not-selectable
  // combobox/interaction/auto-highlight-first-match
  // combobox/api/controlled-value-and-input-value
  // combobox/api/grouped-options-render-under-headings
  // combobox/api/invalid-state
  // combobox/api/async-item-loading
  // combobox/keyboard/arrow-down-up-moves-highlight
  // combobox/keyboard/enter-selects-highlighted
  // combobox/keyboard/escape-closes
  // combobox/visual/rtl-mirrors
];
