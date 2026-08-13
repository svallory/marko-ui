// Hand-authored prose + example ordering for /docs/components/icon.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Renders an icon by abstract name from any of five icon libraries (Lucide, Tabler Icons, HugeIcons, Phosphor Icons, Remix Icon).",
  importSnippet: `import Icon from "@/components/ui/icon/icon.marko";`,
  usageSnippet: `<Icon name="SearchIcon" library="lucide"/>`,
  examples: [
    {
      name: "default",
      title: "Default",
      description: "Renders from the default library (`lucide`) when `library` is omitted.",
    },
    {
      name: "libraries",
      title: "Libraries",
      description:
        "The same abstract `name` renders a different, authentic glyph per `library` — the `name` space (191 names) is shared across all five.",
    },
    {
      name: "sizing",
      title: "Sizing & color",
      description:
        "Icons inherit color from `currentColor` and size from Tailwind's `size-*` utilities via `class`, same as any other SVG.",
    },
  ],
};
