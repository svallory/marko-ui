// Hand-authored prose + example ordering for /docs/components/command.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Fast, composable, unstyled command menu for searching and running actions.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Command>`,
  importSnippet: `import Command from "@/components/ui/command/command.marko";`,
  usageSnippet: `<Command groups=groups placeholder="Type a command or search..."/>`,
  // Command has no separate CommandDialog wrapper (see command.marko's top
  // comment): consumers compose Dialog + Command themselves. Documented
  // here rather than as a Composition tree since it's prose about
  // combining two components, not this component's own internal anatomy.
  composition:
    "`Command` is a single self-contained component — pass it a `groups` array of `{ label, items[] }`, where each item is `{ value, label, shortcut? }`. " +
    "It renders its own search input, item list, empty state, and group separators internally; there are no separate `CommandInput`/`CommandList`/`CommandGroup`/`CommandItem` parts to compose. " +
    "For a command palette opened from a trigger (upstream's `CommandDialog`), compose `Dialog` and `Command` yourself:\n\n" +
    "```marko\n" +
    '<Dialog class="mu-command-dialog top-1/3 translate-y-0 overflow-hidden p-0" showCloseButton=false>\n' +
    "  <@trigger|props|><Button ...props>Open</Button></@trigger>\n" +
    '  <@title class="sr-only">Command Palette</@title>\n' +
    '  <@description class="sr-only">Search for a command to run...</@description>\n' +
    "  <Command groups=groups placeholder=\"Type a command or search...\"/>\n" +
    "</Dialog>\n" +
    "```",
  examples: [
    {
      name: "command-demo",
      title: "Basic",
      description: "Pass `groups` — an array of `{ label, items }` — to render a searchable list. Each item can carry an optional `shortcut`.",
    },
    {
      name: "command-basic",
      title: "Command Dialog",
      description: "A command menu opened from a button trigger, composed from `Dialog` and `Command` (see Composition above).",
    },
    {
      name: "command-shortcuts",
      title: "Shortcuts",
      description: "Items with a `shortcut` render it right-aligned. Upstream also shows a leading icon per item; our `CommandItem` type has no icon slot, so this demo omits it (see the in-file comment).",
    },
    {
      name: "command-groups",
      title: "Groups",
      description: "Multiple groups are separated automatically by a `CommandSeparator`. Upstream also shows a leading icon per item; omitted here for the same reason as Shortcuts.",
    },
    {
      name: "command-scrollable",
      title: "Scrollable",
      description: "The item list scrolls once its content exceeds the fixed max height, so long groups stay usable.",
    },
    {
      name: "command-empty",
      title: "Empty state",
      description: "When a search query matches nothing, the component falls back to a \"No results found.\" message.",
    },
    {
      name: "command-controlled",
      title: "Controlled",
      description: "Pass `valueChange` to observe the selected item's value as the user navigates and picks from the list.",
    },
    {
      name: "command-rtl",
      title: "RTL",
      description: "Pass `dir=\"rtl\"` — it forwards straight through to the root element and search input, no extra wiring required.",
    },
  ],
  accessibilityNotes: [
    "Built on `@zag-js/combobox`: the search input owns `role=\"combobox\"` with `aria-expanded`/`aria-controls`, and the list is `role=\"listbox\"` with items as `role=\"option\"`.",
    "The currently highlighted item is announced via `aria-activedescendant` on the input, so screen reader users always know which item arrow-key navigation lands on.",
    "Group headings are associated with their items via `aria-labelledby`, not just visual proximity.",
  ],
  accessibilityKeyboard: [
    { keys: "↓ / ↑", description: "Move the highlighted item to the next/previous item, wrapping at the ends." },
    { keys: "Enter", description: "Select the highlighted item." },
    { keys: "Escape", description: "Clear the search query, or close the containing dialog when composed inside one." },
  ],
};
