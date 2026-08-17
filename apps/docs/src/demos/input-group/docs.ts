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
      name: "default",
      title: "Default",
      description:
        "An `InputGroupAddon` defaults to `align=\"inline-start\"` and sits before the input in the DOM for proper focus handling.",
    },
    {
      name: "align-inline-start",
      title: "Inline start",
      description: "Use `align=\"inline-start\"` to position the addon at the start of the input. This is the default.",
    },
    {
      name: "align-inline-end",
      title: "Inline end",
      description: "Use `align=\"inline-end\"` to position the addon at the end of the input.",
    },
    {
      name: "align-block-start",
      title: "Block start",
      description: "Use `align=\"block-start\"` to position the addon above the input, most useful with `InputGroupTextarea`.",
    },
    {
      name: "align-block-end",
      title: "Block end",
      description: "Use `align=\"block-end\"` to position the addon below the input.",
    },
    {
      name: "button",
      title: "Button",
      description: "`InputGroupButton` renders a compact button sized to sit inside the group; pass `size=\"icon-xs\"` for icon-only actions.",
    },
    {
      name: "text",
      title: "Text",
      description: "`InputGroupText` renders muted helper text or labels that share the group's addon padding.",
    },
    {
      name: "textarea",
      title: "Textarea",
      description: "`InputGroupTextarea` pairs with block-aligned addons to build a comment or chat composer.",
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "Disabling the control also dims the whole group and disables pointer interaction on its addons.",
    },
    {
      name: "invalid",
      title: "Invalid",
      description: "Set `aria-invalid=\"true\"` on the control to switch the group's focus ring and border to the destructive color.",
    },
  ],
};
