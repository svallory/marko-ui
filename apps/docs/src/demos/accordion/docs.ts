// Hand-authored prose + example ordering for /docs/components/accordion.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A vertically stacked set of interactive headings that each reveal a section of content.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Accordion>`,
  importSnippet: `import Accordion from "@/components/ui/accordion/accordion.marko";`,
  usageSnippet: `<Accordion items=items collapsible/>`,
  // Upstream's Composition section documents a static
  // Accordion/AccordionItem/AccordionTrigger/AccordionContent tree (four
  // separate components). Our Accordion is a SINGLE .marko file (one
  // registry part, so isCompound is false and the auto-generated
  // composition-tree never renders — see docs-types.ts's `composition`
  // field doc) exposing that same anatomy two ways instead: a data-driven
  // `items=` array (sugar) or `<@item>` attribute tags for markup-composed
  // content, both normalized to one internal shape (see
  // packages/shadcn/ui/accordion/accordion.marko's `normalizedItems`).
  // AccordionTrigger/AccordionContent aren't separate call sites in our
  // API — the single Accordion tag renders both per item internally.
  composition: `Accordion renders its own item/trigger/content anatomy internally — there
are no separate AccordionItem/AccordionTrigger/AccordionContent tags to
compose. Choose one of two equivalent forms:

\`\`\`text
Accordion (items=)
├── item 1 { value, title, content }
├── item 2 { value, title, content }
└── item 3 { value, title, content }
\`\`\`

\`\`\`text
Accordion
├── <@item value title>content</@item>
├── <@item value title>content</@item>
└── <@item value title>content</@item>
\`\`\`

Both sources are merged into one normalized item list before rendering, so
they may be mixed across an app but not within a single Accordion instance
(attr tags win if both are present on the same tag).`,
  examples: [
    {
      name: "accordion-demo",
      title: "Default",
      description:
        "A single item at a time can be open. Pass `collapsible` to allow closing the open item.",
    },
    {
      name: "accordion-basic",
      title: "Basic",
      description: "A basic accordion that shows one item at a time, open by default.",
    },
    {
      name: "accordion-multiple",
      title: "Multiple",
      description: "Pass `multiple` to allow more than one item to be open at the same time.",
    },
    {
      name: "accordion-disabled",
      title: "Disabled",
      description: "Pass `disabled` to disable every trigger in the accordion.",
    },
    {
      name: "accordion-borders",
      title: "Borders",
      description: "Add a border between items with a descendant selector on the root class.",
    },
    {
      name: "accordion-card",
      title: "Card",
      description: "Wrap the Accordion in a Card component.",
    },
    {
      name: "accordion-rtl",
      title: "RTL",
      description: "Accordion restyles correctly under `dir=\"rtl\"` with no component changes.",
    },
    {
      name: "accordion-not-collapsible",
      title: "Not collapsible",
      description:
        "Without `collapsible`, the open item cannot be closed by clicking its own trigger.",
    },
    {
      name: "accordion-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`.",
    },
    {
      name: "accordion-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@item>` attribute tags instead of `items=` to compose each item's title and content directly in markup.",
    },
  ],
  accessibilityNotes: [
    "Full keyboard navigation is supported, adhering to the WAI-ARIA Accordion design pattern.",
    "Each trigger is a real `<button>` inside an `<h3>`, so it participates in the page's heading outline.",
  ],
  accessibilityKeyboard: [
    { keys: "Tab / Shift+Tab", description: "Moves focus to the next/previous focusable trigger." },
    { keys: "Enter / Space", description: "Toggles the focused item's expanded state." },
    { keys: "Down Arrow", description: "Moves focus to the next trigger, looping to the first." },
    { keys: "Up Arrow", description: "Moves focus to the previous trigger, looping to the last." },
    { keys: "Home", description: "Moves focus to the first trigger." },
    { keys: "End", description: "Moves focus to the last trigger." },
  ],
};
