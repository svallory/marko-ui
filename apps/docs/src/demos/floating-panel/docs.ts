// Hand-authored prose + example ordering for /docs/components/floating-panel.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A draggable and resizable floating window with minimize, maximize and close controls.",
  importSnippet: `import FloatingPanel from "@/components/ui/floating-panel/floating-panel.marko";`,
  usageSnippet: `<FloatingPanel defaultPosition={ x: 320, y: 160 } defaultSize={ width: 360, height: 260 }>
  <@trigger|props|>
    <Button ...props>Open panel</Button>
  </@trigger>
  <@title>Layers</@title>
  <@content>Panel content</@content>
</FloatingPanel>`,
  examples: [
    {
      name: "floating-panel-demo",
      title: "Basic",
      description:
        "Drag the header to move the panel. Grab any edge or corner to resize it. Use the header buttons to minimize, maximize or close.",
    },
    {
      name: "floating-panel-not-resizable",
      title: "Drag only",
      description: "Pass `resizable=false` to disable the resize handles and keep dragging.",
    },
    {
      name: "floating-panel-constrained",
      title: "Size constraints",
      description: "Pass `minSize` and `maxSize` to clamp how far the panel can be resized.",
    },
    {
      name: "floating-panel-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: an `open` prop without a change handler never moves. Pair it with `openChange`, or use Marko's bind shorthand `open:=state`.",
    },
  ],
};
