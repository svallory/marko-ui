// Hand-authored prose + example ordering for /docs/components/input-group.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Add addons, buttons, and helper content to inputs.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<InputGroup>, <InputGroupInput>, <InputGroupAddon>`,
  importSnippet: `import InputGroup from "@/components/ui/input-group/input-group.marko";
import InputGroupInput from "@/components/ui/input-group/input.marko";
import InputGroupAddon from "@/components/ui/input-group/addon.marko";`,
  usageSnippet: `<InputGroup>
  <InputGroupInput placeholder="Search..." />
  <InputGroupAddon>
    <SearchIcon />
  </InputGroupAddon>
</InputGroup>`,
  examples: [
    {
      name: "input-group-demo",
      title: "Default",
      description:
        "An `InputGroupAddon` defaults to `align=\"inline-start\"` and sits before the input in the DOM for proper focus handling.",
    },
    {
      name: "input-group-inline-start",
      title: "Inline start",
      description: "Use `align=\"inline-start\"` to position the addon at the start of the input. This is the default.",
    },
    {
      name: "input-group-inline-end",
      title: "Inline end",
      description: "Use `align=\"inline-end\"` to position the addon at the end of the input.",
    },
    {
      name: "input-group-block-start",
      title: "Block start",
      description: "Use `align=\"block-start\"` to position the addon above the input, most useful with `InputGroupTextarea`.",
    },
    {
      name: "input-group-block-end",
      title: "Block end",
      description: "Use `align=\"block-end\"` to position the addon below the input.",
    },
    {
      name: "input-group-icon",
      title: "Icon",
      description: "Any icon or inline SVG can sit in an `InputGroupAddon` on either edge of the input.",
    },
    {
      name: "input-group-text",
      title: "Text",
      description: "`InputGroupText` renders muted helper text or labels that share the group's addon padding.",
    },
    {
      name: "input-group-button",
      title: "Button",
      description: "`InputGroupButton` renders a compact button sized to sit inside the group; pass `size=\"icon-xs\"` for icon-only actions.",
    },
    {
      name: "input-group-kbd",
      title: "Kbd",
      description: "Pair `InputGroupAddon` with `Kbd` to show a keyboard shortcut for the input's action.",
    },
    {
      name: "input-group-dropdown",
      title: "Dropdown",
      description: "An `InputGroupButton` can open a `DropdownMenu` by rendering it inside the menu's trigger render-prop.",
    },
    {
      name: "input-group-spinner",
      title: "Spinner",
      description: "Show a `Spinner` in an addon to indicate the input's async state, such as searching or saving.",
    },
    {
      name: "input-group-textarea",
      title: "Textarea",
      description: "`InputGroupTextarea` pairs with block-aligned addons to build a comment or chat composer.",
    },
    {
      name: "input-group-disabled",
      title: "Disabled",
      description: "Disabling the control also dims the whole group and disables pointer interaction on its addons.",
    },
    {
      name: "input-group-invalid",
      title: "Invalid",
      description: "Set `aria-invalid=\"true\"` on the control to switch the group's focus ring and border to the destructive color.",
    },
    {
      name: "input-group-custom",
      title: "Custom Input",
      description:
        "Add `data-slot=\"input-group-control\"` to a custom control for automatic focus-state handling. Upstream wraps `react-textarea-autosize`; this port uses a plain `<textarea>` with CSS `field-sizing-content` for the same autosize behavior without a React-only dependency.",
    },
    {
      name: "input-group-rtl",
      title: "RTL",
      description:
        "InputGroup's parts use Tailwind logical properties, so they restyle correctly under `dir=\"rtl\"` with no component changes. See the [RTL configuration guide](/docs/rtl).",
    },
  ],
};
