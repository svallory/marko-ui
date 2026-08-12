// Hand-authored prose + example ordering for /docs/components/menubar.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands.",
  importSnippet: `import Menubar from "@/components/ui/menubar/menubar.marko";
import MenubarMenu from "@/components/ui/menubar/menu.marko";`,
  usageSnippet: `<Menubar>
  <@content>
    <MenubarMenu items=fileItems select(value) { /* ... */ }>
      <@trigger|triggerProps|>
        <button ...triggerProps>File</button>
      </@trigger>
    </MenubarMenu>
  </@content>
</Menubar>`,
  examples: [
    {
      name: "menubar-demo",
      title: "Basic",
      description:
        "Each `MenubarMenu` takes an `items` array of the same shape as the dropdown menu, plus its own `@trigger` body for the visible button.",
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
  ],
};
