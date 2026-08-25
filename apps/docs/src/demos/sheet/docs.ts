// Hand-authored prose + example ordering for /docs/components/sheet.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Extends the Dialog component to display content that complements the main content of the screen.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Sheet>`,
  importSnippet: `import Sheet from "@/components/ui/sheet/sheet.marko";`,
  usageSnippet: `<Sheet>
  <@trigger|props|>
    <button ...props>Open</button>
  </@trigger>
  <@title>Edit profile</@title>
  <@description>
    Make changes to your profile here. Click save when you're done.
  </@description>
  ...
</Sheet>`,
  // Sheet is single-file (parts.length === 1 → isCompound is false), so the
  // auto-generated <composition-tree> never renders. Upstream documents a
  // Composition tree of separate Sheet/SheetTrigger/SheetContent/
  // SheetHeader/SheetTitle/SheetDescription/SheetFooter components — our
  // port collapses that anatomy into named attr-tags (`@trigger`, `@title`,
  // `@description`, `@footer`) plus the tag's own default body on a single
  // `<Sheet>` tag, so the tree below documents the real anatomy rather than
  // restating upstream's separate-component shape, which doesn't exist in
  // this port.
  composition: `\`Sheet\` composes its anatomy from attr-tags (plus its own default body) instead of separate components:

\`\`\`text
Sheet
├── @trigger   — render prop; spread the given props onto your own trigger element
├── @title     — heading text, wired to the dialog's aria-labelledby
├── @description — supporting text, wired to the dialog's aria-describedby
├── (body)     — the scrollable content
└── @footer    — optional actions row, e.g. Save / Close buttons
\`\`\`

There is no separate close-button slot: the close button is rendered automatically (see \`showCloseButton\`).`,
  examples: [
    {
      name: "sheet-demo",
      title: "Default",
      description: "A sheet for editing profile details, sliding in from the right.",
    },
    {
      name: "sheet-side",
      title: "Side",
      description: "Pass `side` to set which edge of the screen the sheet slides in from: `top`, `right`, `bottom`, or `left`.",
    },
    {
      name: "sheet-no-close-button",
      title: "No Close Button",
      description: "Pass `showCloseButton={false}` to hide the close button in the top-right corner. Click outside, or provide your own `@footer` action, to close.",
    },
    {
      name: "sheet-rtl",
      title: "RTL",
      description:
        "The `dir` prop is a native attribute pass-through — set it on `<Sheet>` to flip logical-property layout and typography for right-to-left languages. See the [RTL guide](/docs/rtl).",
    },
    {
      name: "sheet-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: an `open` prop without a change handler never moves. Pair it with `openChange`.",
    },
  ],
};
