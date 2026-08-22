// Hand-authored prose + example ordering for /docs/components/direction.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Sets the text direction (ltr/rtl) for its descendants.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<DirectionProvider>`,
  importSnippet: `import DirectionProvider from "@/components/ui/direction/direction-provider.marko";
import { getDirection } from "@/components/ui/direction/direction.ts";`,
  usageSnippet: `<html dir="rtl">
  <body>
    <DirectionProvider direction="rtl">
      <!-- Your app content -->
    </DirectionProvider>
  </body>
</html>`,
  // DEVIATION FROM UPSTREAM: shadcn's DirectionProvider re-exports Base
  // UI's Direction.DirectionProvider, a pure React Context provider that
  // renders no DOM element — descendants read direction via a
  // `useDirection()` context hook. Marko has no context primitive
  // (notes/component-authoring.md / marko-gotchas.md: "React context ->
  // pass values down as attrs from a container tag"), so this port's
  // <DirectionProvider> renders a real wrapping element with a `dir`
  // attribute, and `getDirection(element)` (direction.ts) resolves the
  // effective direction for any descendant by walking up to the nearest
  // ancestor `[dir]` node via `closest()` — the DOM-native equivalent of
  // the source's context lookup, falling back to `"ltr"` like Base UI
  // does. This is a deliberate, documented deviation forced by the
  // absence of a context equivalent in Marko; it adds one wrapper element
  // to the DOM that upstream's provider does not render.
  composition: `\`DirectionProvider\` is a single-file component: it wraps its
body in one element and sets \`dir\` on it directly (see the deviation note
above). There is no separate trigger/content/etc. anatomy to compose —
just wrap the subtree that should adopt the given direction.`,
  accessibilityNotes: [
    "`dir` on the wrapping element is a real HTML attribute, so it participates in the browser's native bidi algorithm and is picked up by assistive technology the same way `dir` on any other element is — no ARIA wiring required.",
    "Prefer setting `dir` on `<html>` for the whole document's default direction; use `DirectionProvider` to override direction for a subtree (e.g. previewing RTL content, or a widget whose content direction differs from the page).",
    "`getDirection(element)` lets non-Marko-reactive code (event handlers, imperative DOM logic) read the effective direction the same way descendants inherit it visually — useful for direction-aware keyboard handling (e.g. swapping ArrowLeft/ArrowRight) outside of Zag machines, which already resolve `dir` themselves.",
  ],
  examples: [
    {
      name: "card-rtl",
      title: "RTL",
      description:
        "Wrap any subtree in `DirectionProvider` with `direction=\"rtl\"` to flip it into right-to-left layout — descendants like `Card` restyle correctly via inherited `dir` and logical (`ms-*`/`me-*`) utility classes.",
    },
  ],
};
