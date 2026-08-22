// Hand-authored prose + example ordering for /docs/components/tabs.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Tabs>`,
  importSnippet: `import Tabs from "@/components/ui/tabs/tabs.marko";`,
  usageSnippet: `<Tabs|value| items=[{ value: "account", label: "Account" }, { value: "password", label: "Password" }]>
  <p>Showing the ${"${value}"} panel.</p>
</Tabs>`,
  // Tabs is a SINGLE .marko file (one registry part, so isCompound is false
  // and the auto-generated composition-tree never renders — see
  // docs-types.ts's `composition` field doc) exposing the upstream
  // Tabs/TabsList/TabsTrigger/TabsContent anatomy two ways instead: a
  // data-driven `items=` array (sugar) or `<@trigger>`/`<@panel>` attribute
  // tags for markup-composed content, both normalized to one internal shape
  // (see packages/shadcn/ui/tabs/tabs.marko's `triggers`/`panels` consts).
  // TabsList/TabsTrigger/TabsContent aren't separate call sites in our API
  // — the single Tabs tag renders the list and all panels internally.
  composition: `Tabs renders its own list/trigger/panel anatomy internally — there are no
separate TabsList/TabsTrigger/TabsContent tags to compose. Choose one of two
equivalent forms:

\`\`\`text
Tabs (items=)
├── list
│   ├── item 1 { value, label, disabled? }
│   └── item 2 { value, label, disabled? }
└── content(value) — one shared render function keyed by the active value
\`\`\`

\`\`\`text
Tabs
├── <@trigger value>label</@trigger>
├── <@trigger value>label</@trigger>
├── <@panel value>content</@panel>
└── <@panel value>content</@panel>
\`\`\`

\`trigger\` and \`panel\` normalize INDEPENDENTLY: attr tags win over \`items=\`
per tag name, not for the component as a whole. Mixing \`<@trigger>\` tags
with \`items=\` (and no \`<@panel>\` tags) pairs attr-tag-derived triggers with
items=-derived panels — see the Hybrid example below.`,
  examples: [
    {
      name: "tabs-demo",
      title: "Default",
      description: "Pass `items` and read the active `value` from the tag's default parameter.",
    },
    {
      name: "tabs-line",
      title: "Line",
      description: "Pass `variant=\"line\"` for an underline-style tab list.",
    },
    {
      name: "tabs-vertical",
      title: "Vertical",
      description: "Pass `orientation=\"vertical\"` for a vertical tab list.",
    },
    {
      name: "tabs-disabled",
      title: "Disabled tab",
      description: "Set `disabled: true` on an item to skip it in the tab order and block selection.",
    },
    {
      name: "tabs-icons",
      title: "Icons",
      description: "Compose an `Icon` alongside the label inside a `<@trigger>` attribute tag.",
    },
    {
      name: "tabs-rtl",
      title: "RTL",
      description: "Tabs restyles correctly under `dir=\"rtl\"` with no component changes.",
    },
    {
      name: "tabs-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
    {
      name: "tabs-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@trigger>` and `<@panel>` attribute tags instead of `items=` to compose each tab's label and panel content directly in markup.",
    },
    {
      name: "tabs-precedence",
      title: "Precedence",
      description:
        "When both `items=` and attribute tags are supplied, the attribute tags win — the `items=` entry here is replaced entirely.",
    },
    {
      name: "tabs-hybrid",
      title: "Hybrid",
      description:
        "`<@trigger>` and `<@panel>` normalize independently: mixing `<@trigger>` tags with `items=` (and no `<@panel>` tags) pairs attr-tag triggers with items=-derived panels. Supply both tag names (or neither) to stay on one source.",
    },
  ],
};
