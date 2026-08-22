// Hand-authored prose + example ordering for /docs/components/toggle.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
//
// Order follows upstream's base/toggle.mdx (see .upstream/shadcn-ui/apps/v4/
// content/docs/components/base/toggle.mdx): hero demo, Outline, With Text,
// Size, Disabled, RTL. Our pre-existing `toggle-controlled` demo (parity
// report's "extraDemos" — kept, never flagged as missing) is folded in
// right after the hero demo since it documents the `pressed`/`pressedChange`
// prop pair directly, before the styling-focused examples.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A two-state button that can be either on or off.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Toggle>`,
  importSnippet: `import Toggle from "@/components/ui/toggle/toggle.marko";`,
  usageSnippet: `<Toggle>Toggle</Toggle>`,
  examples: [
    {
      name: "toggle-demo",
      title: "Default",
      description: "A plain toggle button, off until clicked.",
    },
    {
      name: "toggle-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `pressed` prop without a change handler never moves. Pair it with `pressedChange`, or use Marko's bind shorthand `pressed:=state`.",
    },
    {
      name: "toggle-outline",
      title: "Outline",
      description: 'Pass `variant="outline"` for an outline style.',
    },
    {
      name: "toggle-text",
      title: "With Text",
      description: "A toggle can combine an icon and a text label as its content.",
    },
    {
      name: "toggle-sizes",
      title: "Size",
      description: "Pass `size` as `sm`, `default`, or `lg` to change the toggle's size.",
    },
    {
      name: "toggle-disabled",
      title: "Disabled",
      description: "A disabled toggle is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "toggle-rtl",
      title: "RTL",
      description:
        'Toggle restyles correctly under `dir="rtl"`. Unlike our Zag-machine components, Toggle is a plain native `<button>` with local state, so `dir="rtl"` on the element (or an ancestor) is a complete port with no machine-level RTL gap.',
    },
  ],
  accessibilityNotes: [
    'Toggle renders as a native `<button type="button">` with `aria-pressed` reflecting its toggled state, so assistive tech announces the control and its state without extra ARIA wiring — always pass `aria-label` (or wrap it with a visible label) since Toggle has no built-in accessible name of its own.',
    "Disabling a toggle removes it from the tab order and blocks pointer input.",
    "Icon-only toggles (an icon with no visible text, e.g. the RTL example's icon+label pared down to just the icon) need an explicit `aria-label` — the icon alone gives assistive tech nothing to announce.",
  ],
  accessibilityKeyboard: [
    { keys: "Tab / Shift+Tab", description: "Moves focus to and from the toggle." },
    { keys: "Space / Enter", description: "Toggles the pressed state." },
  ],
};
