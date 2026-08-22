// Hand-authored prose + example ordering for /docs/components/toggle-group.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
//
// Order follows upstream's base/toggle-group.mdx (see .upstream/shadcn-ui/
// apps/v4/content/docs/components/base/toggle-group.mdx): hero demo,
// Outline, Size, Spacing, Vertical, Disabled, Custom (font-weight
// selector), RTL. Our pre-existing multiple/controlled/compound demos
// (parity-report's "extraDemos" — kept, never flagged as missing) are
// folded in right after the hero demo, closest to their upstream
// "type=multiple" behavior relative (upstream has no standalone
// multiple-selection demo; ours documents the `multiple` prop directly).
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "A set of two-state buttons that can be toggled on or off.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<ToggleGroup>`,
  importSnippet: `import ToggleGroup from "@/components/ui/toggle-group/toggle-group.marko";`,
  usageSnippet: `<ToggleGroup items=[{ value: "left", label: "Left" }, { value: "center", label: "Center" }] value=["center"]/>`,
  composition: `A single-file component whose anatomy is expressed through the \`items=\` array or \`<@item>\` attribute tags, not separate parts — api-reference.json sees one part, so this prose stands in for upstream's Composition tree:

\`\`\`text
ToggleGroup
└── item (one per entry in \`items=\`, or one per \`<@item>\` attribute tag)
\`\`\`

Upstream expresses this as \`ToggleGroup\` > \`ToggleGroupItem\` children; our port has no separate \`ToggleGroupItem\` tag — each item is either a plain object (\`{ value, label, disabled? }\`) in \`items=\`, or a \`<@item value="...">\` attribute tag whose body becomes the item's rendered content. Attribute tags win if both are supplied on the same \`ToggleGroup\`.`,
  examples: [
    {
      name: "toggle-group-demo",
      title: "Default",
      description:
        "Pass an `items: { value, label, disabled? }[]` array and the component renders every item internally — or compose items in markup with `<@item>` attribute tags (see the Compound example). By default only one item can be pressed at a time.",
    },
    {
      name: "toggle-group-multiple",
      title: "Multiple selection",
      description: "Pass `multiple` to allow more than one item to be pressed at once.",
    },
    {
      name: "toggle-group-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
    {
      name: "toggle-group-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@item>` attribute tags instead of `items=` to compose each option directly in markup.",
    },
    {
      name: "toggle-group-outline",
      title: "Outline",
      description: 'Pass `variant="outline"` for an outline style.',
    },
    {
      name: "toggle-group-sizes",
      title: "Size",
      description: "Pass `size` as `sm`, `default`, or `lg` to change the size of every item.",
    },
    {
      name: "toggle-group-spacing",
      title: "Spacing",
      description: 'Pass `spacing` (in Tailwind spacing-scale units) to add gap between items — `spacing={0}` renders connected items with shared borders instead.',
    },
    {
      name: "toggle-group-vertical",
      title: "Vertical",
      description: 'Pass `orientation="vertical"` for a vertical toggle group; arrow-key navigation follows the same axis.',
    },
    {
      name: "toggle-group-disabled",
      title: "Disabled",
      description: "Pass `disabled` on `ToggleGroup` to disable every item in the group.",
    },
    {
      name: "toggle-group-font-weight-selector",
      title: "Custom",
      description:
        "A custom toggle group example: `<@item>` bodies can render arbitrary markup (not just text), here paired with `Field`/`FieldLabel`/`FieldDescription` to build a font-weight selector.",
    },
    {
      name: "toggle-group-rtl",
      title: "RTL",
      description: 'Toggle groups restyle correctly under `dir="rtl"` — the same prop drives both the machine\'s arrow-key navigation direction and the logical-property layout, so pass it straight to `ToggleGroup` rather than only wrapping it in a `dir` attribute.',
    },
  ],
  accessibilityNotes: [
    'The root renders `role="group"`; each item is a native `<button type="button">` with `aria-pressed` reflecting its toggled state, so assistive tech announces the set and each item\'s state without extra ARIA wiring.',
    "Use `aria-label` or `aria-labelledby` on `ToggleGroup` to give the group an accessible name, especially when it has no visible heading (the font-weight-selector example instead pairs it with a visible `FieldLabel`).",
    "Icon-only items need their own accessible name. `items=` and `<@item>` currently only forward `value`/`disabled`/`content` per item — there is no per-item `aria-label` passthrough — so an icon-only item must include a visually-hidden label in its content (see toggle-group-vertical.marko) rather than relying on an `aria-label` attribute, which the item button does not receive.",
    "Disabling `ToggleGroup` itself (not a single item) removes every item from the tab order and blocks pointer input across the whole group.",
  ],
  accessibilityKeyboard: [
    { keys: "Tab / Shift+Tab", description: "Moves focus into and out of the group, landing on the currently pressed item (or the first item if none is pressed)." },
    { keys: "Arrow Right / Arrow Left", description: "Moves focus between items when `orientation` is `horizontal` (the default); wraps at the ends." },
    { keys: "Arrow Down / Arrow Up", description: 'Moves focus between items when `orientation="vertical"`; wraps at the ends.' },
    { keys: "Space / Enter", description: "Toggles the focused item." },
    { keys: "Home / End", description: "Moves focus to the first / last item." },
  ],
};
