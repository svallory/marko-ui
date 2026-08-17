// Hand-authored prose + example ordering for /docs/components/image-cropper.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "An image editor with a draggable, resizable crop region, aspect-ratio lock, zoom, rotation and flip.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<ImageCropper>`,
  importSnippet: `import ImageCropper from "@/components/ui/image-cropper/image-cropper.marko";`,
  usageSnippet: `<ImageCropper src=imageUrl alt="Photo to crop"/>`,
  examples: [
    {
      name: "default",
      title: "Default",
      description: "A freely resizable crop region with the rule-of-thirds grid shown.",
    },
    {
      name: "circle-aspect-ratio",
      title: "Circle crop, locked 1:1",
      description:
        "Pass `aspectRatio` to lock the crop region's proportions, and `cropShape=\"circle\"` for an avatar-style mask.",
    },
    {
      name: "fixed-crop-area",
      title: "Fixed crop area",
      description:
        "`fixedCropArea` pins the selection's size and position — the user can only pan and zoom the image underneath it.",
    },
    {
      name: "controlled",
      title: "Controlled zoom and rotation",
      description:
        "Zag machines are controlled: `zoom` and `rotation` props without change handlers never move. Pair them with `zoomChange` and `rotationChange`, or use Marko's bind shorthand `zoom:=state`.",
    },
  ],
};
