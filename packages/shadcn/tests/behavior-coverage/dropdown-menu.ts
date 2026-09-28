// Suite -> behavior mapping for DropdownMenu. See mapping-types.ts and
// notes/behavior-coverage.md.
import type { BehaviorCoverageEntry } from "./mapping-types.ts";

export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "dropdown-menu/interaction/trigger-click-opens",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/compound-order.test.ts",
        title: [
          "menu family <@item> ordering",
          "dropdown-menu renders interleaved items and separator in source order",
        ],
      },
    ],
  },
  {
    behaviorId: "dropdown-menu/api/attr-tag-items-render-in-source-order",
    provenBy: [
      {
        source: "vitest",
        file: "packages/shadcn/tests/behavior/compound-order.test.ts",
        title: [
          "menu family <@item> ordering",
          "dropdown-menu renders interleaved items and separator in source order",
        ],
      },
    ],
  },
  {
    behaviorId: "dropdown-menu/ssr-hydration/attributes-stable",
    provenBy: [
      {
        source: "hydration-invariant",
        file: "packages/shadcn/tests/hydration-invariant.test.ts",
        title: [
          "hydration invariant (C-4): SSR attributes survive hydration",
          "dropdown-menu renders identical scoped attributes before and after hydration",
        ],
      },
    ],
  },
  {
    behaviorId: "dropdown-menu/a11y/trigger-aria-haspopup-expanded",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["dropdown-menu"],
      },
    ],
  },
  {
    behaviorId: "dropdown-menu/a11y/checkbox-radio-item-roles",
    provenBy: [
      {
        source: "axe-scan",
        file: "scripts/ci/axe-scan.ts",
        title: ["dropdown-menu"],
      },
    ],
  },
  // Not covered by any existing check (honest gaps — this is the compound
  // component of the spike, and it shows: no dedicated keyboard-contract
  // suite exists for dropdown-menu the way toggle-controls.test.ts and
  // tabs.test.ts exist for switch/checkbox/tabs):
  // dropdown-menu/interaction/item-click-selects-and-closes
  // dropdown-menu/interaction/outside-click-closes
  // dropdown-menu/interaction/disabled-item-not-selectable
  // dropdown-menu/interaction/submenu-hover-opens
  // dropdown-menu/interaction/checkbox-item-toggles
  // dropdown-menu/interaction/radio-item-selects-one
  // dropdown-menu/keyboard/enter-space-opens-trigger
  // dropdown-menu/keyboard/arrow-down-up-moves-highlight
  // dropdown-menu/keyboard/enter-space-activates-highlighted
  // dropdown-menu/keyboard/escape-closes-and-returns-focus
  // dropdown-menu/keyboard/arrow-right-opens-submenu
  // dropdown-menu/keyboard/typeahead-jumps-to-item
  // dropdown-menu/keyboard/disabled-item-skipped
  // dropdown-menu/visual/open-state-renders (preview-page-4 opens it but
  //   asserts pixels, not the specific behaviors above — counted separately,
  //   see notes/behavior-coverage.md open questions on whether a visual
  //   guard capture should count as proving an interaction/keyboard id)
  // dropdown-menu/visual/rtl-mirrors
];
