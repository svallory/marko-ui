// Hand-authored prose + example ordering for /docs/components/color-picker.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Pick a color from a saturation area, channel sliders, channel inputs, the screen eyedropper or a preset swatch.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<ColorPicker>`,
  importSnippet: `import ColorPicker from "@/components/ui/color-picker/color-picker.marko";`,
  usageSnippet: `<ColorPicker defaultValue="#8b5cf6">\n  <@label>Brand color</@label>\n</ColorPicker>`,
  examples: [
    {
      name: "color-picker-demo",
      title: "Basic",
      description: "A color picker with a trigger swatch and popover controls.",
    },
    {
      name: "color-picker-swatches",
      title: "With swatch presets",
      description: "Pass `swatches` to render a row of preset colors below the channel inputs.",
    },
    {
      name: "color-picker-hsl",
      title: "HSL format, no eyedropper",
      description:
        "Set `defaultFormat` to start in a different color space, and `hideEyeDropper` to drop the screen eyedropper button.",
    },
    {
      name: "color-picker-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
    {
      name: "color-picker-disabled",
      title: "Disabled",
      description: "A disabled color picker is skipped by the tab order and ignores pointer input.",
    },
  ],
};
