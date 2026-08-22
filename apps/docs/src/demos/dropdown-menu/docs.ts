// Hand-authored prose + example ordering for /docs/components/dropdown-menu.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Displays a menu to the user — such as a set of actions or functions — triggered by a button.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<DropdownMenu>`,
  importSnippet: `import DropdownMenu from "@/components/ui/dropdown-menu/dropdown-menu.marko";`,
  usageSnippet: `<DropdownMenu items=ITEMS select(value) { /* ... */ }>
  <@trigger|triggerProps|>
    <Button variant="outline" ...triggerProps>Open</Button>
  </@trigger>
</DropdownMenu>`,
  examples: [
    {
      name: "dropdown-menu-demo",
      title: "Basic",
      description:
        "Items are a plain array — mix labels, separators, shortcuts, and a destructive item without composing subcomponents.",
    },
    {
      name: "dropdown-menu-basic",
      title: "Labels and separators",
      description: "Labels and separators group related actions; a disabled item is skipped in the tab order.",
    },
    {
      name: "dropdown-menu-submenu",
      title: "Submenu",
      description:
        "A `type: \"sub\"` entry with its own `subEntries` nests a secondary menu. Our submenu wiring supports one level of nesting — see the in-file comment for the upstream second-level flattening.",
    },
    {
      name: "dropdown-menu-shortcuts",
      title: "Shortcuts",
      description: "The `shortcut` field renders a right-aligned keyboard hint.",
    },
    {
      name: "dropdown-menu-icons",
      title: "Icons",
      description: "Compose items with `<@item>` attribute tags to put an icon before the label.",
    },
    {
      name: "dropdown-menu-simple",
      title: "Simple",
      description: "A minimal menu with no label, just actions and a destructive item at the end.",
    },
    {
      name: "dropdown-menu-disabled-item",
      title: "Disabled item",
      description: "Set `disabled` on an item to skip it in the tab order and block pointer input.",
    },
    {
      name: "dropdown-menu-selection",
      title: "Selection",
      description: "Handle `select(value)` on the menu to react to whichever item was chosen.",
    },
    {
      name: "dropdown-menu-checkboxes",
      title: "Checkboxes",
      description:
        "`type: \"checkbox\"` entries render a check indicator; toggle each `checked` flag from `select(value)`.",
    },
    {
      name: "dropdown-menu-checkboxes-icons",
      title: "Checkboxes with icons",
      description: "Checkbox items can carry an icon before the label, same as regular items.",
    },
    {
      name: "dropdown-menu-radio-group",
      title: "Radio group",
      description: "`type: \"radio\"` entries sharing a `radioGroup` name behave as an exclusive choice.",
    },
    {
      name: "dropdown-menu-radio-icons",
      title: "Radio icons",
      description: "Radio items can carry an icon before the label, same as regular items.",
    },
    {
      name: "dropdown-menu-destructive",
      title: "Danger action",
      description: "Mark an item `variant=\"destructive\"` to style it as a destructive action, such as deleting a resource.",
    },
    {
      name: "dropdown-menu-avatar",
      title: "Avatar",
      description: "An account switcher triggered by an avatar instead of a labeled button.",
    },
    {
      name: "dropdown-menu-complex",
      title: "Complex",
      description:
        "A richer menu combining groups, icons, checkboxes, a radio group, and submenus. See the in-file comment for two technically-forced omissions (submenu nesting depth, icons inside submenus).",
    },
    {
      name: "dropdown-menu-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@item>` attribute tags instead of `items=` to compose the menu directly in markup — pass `type=\"separator\"` for a divider or `type=\"label\"` for a group label. Entries render in the order they are written. An item's text can come from either a `label=` attribute or a markup body, whichever you prefer.",
    },
    {
      name: "dropdown-menu-rtl",
      title: "RTL",
      description:
        "A `dir=\"rtl\"` wrapper with Arabic content, matching the precedent set by button/avatar/input's RTL demos. See the in-file comment: the underlying Zag menu machine does accept a `dir` prop for floating-ui placement flipping, but our `Input` type doesn't re-expose it yet (component-source change, out of scope here).",
    },
  ],
  accessibilityKeyboard: [
    { keys: "Enter / Space", description: "Opens the menu when focused on the trigger; activates the highlighted item when the menu is open." },
    { keys: "ArrowDown / ArrowUp", description: "Moves the highlight to the next / previous item, wrapping at the ends." },
    { keys: "ArrowRight", description: "On a submenu trigger item, opens the submenu and moves focus into it." },
    { keys: "ArrowLeft / Escape", description: "Closes an open submenu (ArrowLeft) or the whole menu (Escape) and returns focus to the trigger." },
    { keys: "Home / End", description: "Moves the highlight to the first / last item." },
    { keys: "A–Z", description: "Typeahead: jumps the highlight to the next item whose label starts with the typed characters." },
  ],
  accessibilityNotes: [
    "The trigger and content wire up `aria-haspopup`, `aria-expanded`, and `aria-controls` automatically via the underlying Zag menu machine — no manual ARIA authoring needed.",
    "Checkbox and radio items expose `role=\"menuitemcheckbox\"` / `role=\"menuitemradio\"` with `aria-checked` reflecting the `checked` field.",
    "Disabled items (`disabled: true`) are marked `aria-disabled` and skipped by both keyboard navigation and typeahead.",
  ],
};
