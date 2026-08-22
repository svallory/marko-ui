// Hand-authored prose + example ordering for /docs/components/collapsible.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "An interactive component which expands/collapses a panel.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Collapsible>`,
  importSnippet: `import Collapsible from "@/components/ui/collapsible/collapsible.marko";`,
  usageSnippet: `<Collapsible>
  <@trigger|triggerProps|>
    <button ...triggerProps>Can I use this in my project?</button>
  </@trigger>
  Yes. Free to use for personal and commercial projects. No attribution
  required.
</Collapsible>`,
  // Upstream's Composition section documents a static
  // Collapsible/CollapsibleTrigger/CollapsibleContent tree (three separate
  // components). Our Collapsible is a SINGLE .marko file (one registry
  // part, so isCompound is false and the auto-generated
  // <composition-tree> never renders — see docs-types.ts's `composition`
  // field doc) exposing that same anatomy through a trigger attr-tag plus
  // the tag's own body instead of separate sibling components.
  composition: `Collapsible renders its own trigger/content anatomy internally — there are
no separate CollapsibleTrigger/CollapsibleContent tags to compose.

\`\`\`text
Collapsible
├── <@trigger|triggerProps|>...</@trigger>  (optional; spread triggerProps onto your own element)
└── body content                             (the collapsible panel itself)
\`\`\`

The \`<@trigger>\` attribute tag is a render-prop-style slot: it receives
\`triggerProps\` (the machine's \`getTriggerProps()\` plus a \`data-slot\`) and
you spread them onto whatever element you render as the trigger — a
\`<Button>\`, a plain \`<button>\`, or anything else. Everything else placed
directly in the tag's body becomes the collapsible content region, wrapped
in the machine's \`getContentProps()\` internally.`,
  examples: [
    {
      name: "collapsible-demo",
      title: "Basic",
      description:
        "A trigger toggles the panel's open state; the chevron icon rotates to reflect it.",
    },
    {
      name: "collapsible-basic",
      title: "Product Details",
      description:
        "A ghost-button trigger inside a card reveals a short description and a call-to-action button.",
    },
    {
      name: "collapsible-settings",
      title: "Settings Panel",
      description: "Use a trigger button to reveal additional settings.",
    },
    {
      name: "collapsible-file-tree",
      title: "File Tree",
      description:
        "Use nested collapsibles to build a file tree. Each folder recurses into its own Collapsible; files render as plain link-styled buttons.",
    },
    {
      name: "collapsible-rtl",
      title: "RTL",
      description:
        "Collapsible restyles correctly under `dir=\"rtl\"` with no component changes — its layout uses logical Tailwind flex utilities rather than hard-coded physical margins.",
    },
    {
      name: "collapsible-disabled",
      title: "Disabled",
      description: "A disabled collapsible marks its trigger `data-disabled` and ignores clicks on it.",
    },
    {
      name: "collapsible-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: an `open` prop without a change handler never moves. Pair it with `openChange`.",
    },
  ],
  accessibilityNotes: [
    "The trigger owns `aria-expanded`, reflecting the panel's open state, and `aria-controls`, pointing at the content region's id.",
    "The content region is present in the DOM at all times; its visibility (and, when animated, height) is driven by `data-state=\"open\"|\"closed\"` rather than removing/re-adding the subtree, so assistive tech never loses its place in the document.",
    "A `disabled` Collapsible marks its trigger `data-disabled` (style off `data-[disabled]:` selectors, not `disabled:`) and ignores clicks on it. The machine never sets a native `disabled` attribute, so the trigger stays focusable and keyboard-activatable unless you also disable the element you render as the trigger yourself.",
  ],
  accessibilityKeyboard: [
    { keys: "Space / Enter", description: "Toggles the panel open or closed when the trigger is focused." },
  ],
};
