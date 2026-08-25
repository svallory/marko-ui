// Hand-authored prose + example ordering for /docs/components/menubar.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Menubar>, <MenubarMenu>`,
  importSnippet: `import Menubar from "@/components/ui/menubar/menubar.marko";
import MenubarMenu from "@/components/ui/menubar/menu.marko";`,
  usageSnippet: `<Menubar>
  <MenubarMenu items=fileItems select(value) { /* ... */ }>
    <@trigger|triggerProps|>
      <button ...triggerProps>File</button>
    </@trigger>
  </MenubarMenu>
</Menubar>`,
  examples: [
    {
      name: "menubar-demo",
      title: "Basic",
      description:
        "Each `MenubarMenu` takes an `items` array of the same shape as the dropdown menu, plus its own `@trigger` body for the visible button.",
    },
    {
      name: "menubar-checkbox",
      title: "Checkbox",
      description:
        "Use `<@item type=\"checkbox\">` (or an `items` entry with `type: \"checkbox\"`) for toggleable options; drive `checked` from your own state and update it in `checkedChange`.",
    },
    {
      name: "menubar-radio",
      title: "Radio",
      description:
        "Group `<@item type=\"radio\">` entries with a shared `radioGroup` name for single-select options; `radioChange` fires with the group name and the newly selected value.",
    },
    {
      name: "menubar-submenu",
      title: "Submenu",
      description:
        "Use a `type: \"sub\"` entry with its own `subEntries` array for nested menus, opened from a `MenubarSubTrigger`-equivalent row inside the parent menu.",
    },
    {
      name: "menubar-icons",
      title: "With Icons",
      description:
        "Give an item a markup body (instead of `label=`) to render an `<Icon>` alongside its text; mark a destructive entry with `variant=\"destructive\"`.",
    },
    {
      name: "menubar-rtl",
      title: "RTL",
      description:
        "Wrap the menubar in a `dir=\"rtl\"` container for right-to-left layout and text; see the note in the demo source for the one behavioral gap versus upstream's floating-ui RTL placement flip.",
    },
    {
      name: "menubar-danger",
      title: "With danger item",
      description: "Mark a destructive entry with `danger` to style it distinctly, and group entries with a `label` item and separators.",
    },
    {
      name: "menubar-disabled",
      title: "Disabled item",
      description: "Set `disabled` on an individual item to skip it in the tab order and ignore pointer input, without disabling the whole menu.",
    },
    {
      name: "menubar-controlled",
      title: "Selection",
      description:
        "Pass a `select` handler to each `MenubarMenu` to react to the chosen item's `value`.",
    },
    {
      name: "menubar-compound",
      title: "Compound (attr tags)",
      description:
        "Use `<@item>` attribute tags on `MenubarMenu` instead of `items=` to compose the menu directly in markup — pass `type=\"separator\"` for a divider or `type=\"label\"` for a group label. Entries render in the order they are written. An item's text can come from either a `label=` attribute or a markup body, whichever you prefer.",
    },
  ],
};
