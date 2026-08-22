// Hand-authored prose + example ordering for /docs/components/context-menu.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Displays a menu to the user — such as a set of actions or functions — triggered by right click.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<ContextMenu>`,
  importSnippet: `import ContextMenu from "@/components/ui/context-menu/context-menu.marko";`,
  usageSnippet: `<ContextMenu items=[{ value: "copy", label: "Copy" }]>
  <@content>Right click here</@content>
</ContextMenu>`,
  examples: [
    {
      name: "context-menu-basic",
      title: "Basic",
      description: "A simple context menu with a few actions, one of them `disabled`.",
    },
    {
      name: "context-menu-submenu",
      title: "Submenu",
      description: "Use a `type: \"sub\"` entry with `subEntries` to nest a secondary menu (one level deep).",
    },
    {
      name: "context-menu-shortcuts",
      title: "Shortcuts",
      description: "Add a `shortcut` string to an item to show a keyboard hint on the right.",
    },
    {
      name: "context-menu-groups",
      title: "Groups",
      description: "Use `type: \"label\"` and `type: \"separator\"` entries to group related actions.",
    },
    {
      name: "context-menu-icons",
      title: "Icons",
      description:
        "Use the `<@item>` attribute-tag form to combine icons with labels for quick scanning — item bodies render in place of the `label` string.",
    },
    {
      name: "context-menu-checkboxes",
      title: "Checkboxes",
      description:
        "Use `type: \"checkbox\"` entries for toggles. `checked` is driven by your own state — flip it in the `select` handler.",
    },
    {
      name: "context-menu-radio",
      title: "Radio",
      description:
        "Use `type: \"radio\"` entries for exclusive choices grouped by `radioGroup`. Exclusivity is your own state, not automatic — set exactly one entry's `checked` per group in the `select` handler.",
    },
    {
      name: "context-menu-destructive",
      title: "Destructive",
      description: "Set `variant: \"destructive\"` on an item to style it as a destructive action.",
    },
    // Upstream's "Sides" demo (side="top"/"right"/"bottom"/"left" on
    // ContextMenuContent) is SKIPPED: our context-menu.marko's `Input`
    // interface exposes only `content`, `items`, `item`, `select`, `class`
    // — there is no `positioning`/`side` prop, so the underlying
    // @zag-js/menu machine's positioning options are never reachable from
    // the component's public API. This needs a component-source change
    // (adding a `positioning`/`side` input and threading it into
    // `machine-props`), which is out of scope for this docs repair (file
    // territory) — reported as blocked-needs-component-change.
    {
      name: "context-menu-demo",
      title: "Demo",
      description:
        "Pass an `items` array of entries; `type: \"separator\"` and `type: \"label\"` entries organize the list.",
    },
    {
      name: "context-menu-rtl",
      title: "RTL",
      description:
        "Wrap the trigger in a `dir=\"rtl\"` container for RTL text direction and logical-property layout. See the in-file comment for a real deviation from upstream: our `Input` type doesn't re-expose the machine's own `dir` prop, so the floating-ui positioner itself doesn't auto-flip placement under RTL the way upstream's demo does.",
    },
    {
      name: "context-menu-simple",
      title: "Simple",
      description: "A minimal menu with a `danger` entry styled as destructive.",
    },
    {
      name: "context-menu-disabled",
      title: "Disabled",
      description: "Set `disabled: true` on an item to skip it during keyboard navigation and pointer input.",
    },
    {
      name: "context-menu-controlled",
      title: "Controlled",
      description: "Pass a `select` handler to react to the chosen item's `value`.",
    },
    {
      name: "context-menu-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@item>` attribute tags instead of `items=` to compose the menu directly in markup — pass `type=\"separator\"` for a divider or `type=\"label\"` for a group label. Entries render in the order they are written. An item's text can come from either a `label=` attribute or a markup body, whichever you prefer.",
    },
  ],
  accessibilityKeyboard: [
    { keys: "Right click / long press", description: "Opens the menu at the pointer position, anchored to the trigger region." },
    { keys: "ArrowDown / ArrowUp", description: "Moves the highlight to the next / previous item, wrapping at the ends." },
    { keys: "ArrowRight", description: "On a submenu trigger item, opens the submenu and moves focus into it." },
    { keys: "ArrowLeft / Escape", description: "Closes an open submenu (ArrowLeft) or the whole menu (Escape) and returns focus to the trigger." },
    { keys: "Enter / Space", description: "Activates the highlighted item." },
    { keys: "Home / End", description: "Moves the highlight to the first / last item." },
    { keys: "A–Z", description: "Typeahead: jumps the highlight to the next item whose label starts with the typed characters." },
  ],
  accessibilityNotes: [
    "The trigger and content wire up `aria-haspopup`, `aria-expanded`, and `aria-controls` automatically via the underlying Zag menu machine — no manual ARIA authoring needed.",
    "Checkbox and radio items expose `role=\"menuitemcheckbox\"` / `role=\"menuitemradio\"` with `aria-checked` reflecting the `checked` field you pass in.",
    "Disabled items (`disabled: true`) are marked `aria-disabled` and skipped by both keyboard navigation and typeahead.",
  ],
};
