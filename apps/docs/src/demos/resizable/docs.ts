// Hand-authored prose + example ordering for /docs/components/resizable.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Accessible resizable panel groups and layouts with keyboard support.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Resizable>`,
  importSnippet: `import Resizable from "@/components/ui/resizable/resizable.marko";`,
  usageSnippet: `<Resizable|panel| panels=[{ id: "one", defaultSize: 50 }, { id: "two", defaultSize: 50 }]>
  ${"${panel.id}"}
</Resizable>`,
  // Upstream composes ResizablePanelGroup / ResizablePanel / ResizableHandle
  // as three separate components (built on react-resizable-panels). Our
  // port is one .marko file (packages/shadcn/ui/resizable/resizable.marko)
  // driven by @zag-js/splitter: a `panels` array prop replaces individual
  // `ResizablePanel` children, and handles are generated automatically
  // between adjacent panels rather than authored as explicit
  // `ResizableHandle` elements — api-reference.json sees a single part, so
  // the auto-generated Composition tree (driven by isCompound) never
  // renders. This prose is the fallback (see docs-types.ts `composition`).
  composition:
    "`Resizable` is a single component, not a three-part composition. " +
    "Where upstream composes `ResizablePanelGroup` / `ResizablePanel` / " +
    "`ResizableHandle` as separate importable components, this port folds " +
    "all three into one `Resizable` tag:\n\n" +
    "```text\n" +
    "Resizable\n" +
    "├── (panel — one per entry in the `panels` prop, rendered via the tag's own body)\n" +
    "└── (resize handle — generated automatically between each adjacent pair of panels)\n" +
    "```\n\n" +
    "There is no separate `ResizablePanel` or `ResizableHandle` tag to " +
    "import: pass an ordered `panels` array (`{ id, defaultSize?, minSize?, " +
    "maxSize? }`) and render each panel's content through the tag's own " +
    "body, taking the panel data and its index as default-body tag " +
    "parameters (`<Resizable|panel, index|>`). A resize handle is inserted " +
    "between every pair of adjacent panels for you — there is no " +
    "`withHandle` toggle; the drag-handle icon is always shown.",
  examples: [
    {
      name: "resizable-demo",
      title: "Default",
      description:
        "Nest a `Resizable` inside another panel's content to build a layout of more than two regions.",
    },
    {
      name: "resizable-vertical",
      title: "Vertical",
      description: "Set `orientation=\"vertical\"` to stack panels top to bottom.",
    },
    {
      name: "resizable-handle",
      title: "Min and max sizes",
      description: "Pass `minSize` and `maxSize` on a panel to constrain how far it can be dragged.",
    },
    {
      name: "resizable-rtl",
      title: "RTL",
      description: "Set `dir=\"rtl\"` on the `Resizable` (matching the surrounding document direction) to mirror the layout.",
    },
    {
      name: "resizable-controlled",
      title: "Controlled",
      description:
        "Listen for `resizeChange` to read the live size (in percent) of every panel as the handle is dragged.",
    },
  ],
  // Upstream also documents a "Changelog" section describing
  // react-resizable-panels' v3→v4 API migration (PanelGroup → Group,
  // direction → orientation, defaultSize={50} → defaultSize="50%", etc.).
  // That describes react-resizable-panels version-to-version API changes
  // with no analog in this port — our Resizable is built on
  // @zag-js/splitter, never went through that migration, and never
  // exposed the renamed primitives. There is no real content to carry
  // over, only React-library history, so it is intentionally not ported
  // (same precedent as demos/calendar/docs.ts's Changelog omission).
  accessibilityNotes: [
    "Each resize handle is a focusable, keyboard-operable separator (`role=\"separator\"`) — no pointer is required to resize panels.",
    "Real deviation from upstream: `@zag-js/splitter` accepts a `dir` prop that flips arrow-key semantics for RTL, but this component's `machine-props` doesn't forward it (only `orientation`, `panels`, and callback props are wired to the machine). A `dir=\"rtl\"` attribute on `Resizable` still mirrors the layout visually (it lands on the root `<div>` as a plain HTML attribute), but arrow-key direction is not RTL-aware.",
  ],
  accessibilityKeyboard: [
    { keys: "Tab / Shift+Tab", description: "Moves focus to the next or previous resize handle." },
    { keys: "ArrowLeft / ArrowRight", description: "Resizes a horizontal-orientation handle by 1% per press, or 10% while holding Shift." },
    { keys: "ArrowUp / ArrowDown", description: "Resizes a vertical-orientation handle by 1% per press, or 10% while holding Shift." },
    { keys: "Home", description: "Moves the handle to its minimum allowed position." },
    { keys: "End", description: "Moves the handle to its maximum allowed position." },
    { keys: "Enter", description: "Collapses or expands the adjacent panel." },
    { keys: "F6", description: "Cycles focus to the next resize handle (Shift+F6 cycles to the previous one)." },
  ],
};
