// Hand-authored prose + example ordering for /docs/components/card.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays a card with header, content, and footer.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Card>, <CardHeader>, <CardTitle>, <CardDescription>, <CardAction>, <CardContent>, <CardFooter>`,
  importSnippet: `import Card from "@/components/ui/card/card.marko";
import CardHeader from "@/components/ui/card/header.marko";
import CardTitle from "@/components/ui/card/title.marko";
import CardDescription from "@/components/ui/card/description.marko";
import CardAction from "@/components/ui/card/action.marko";
import CardContent from "@/components/ui/card/content.marko";
import CardFooter from "@/components/ui/card/footer.marko";`,
  usageSnippet: `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
    <CardAction>Card Action</CardAction>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>`,
  examples: [
    {
      name: "card-demo",
      title: "Login form",
      description: "A card built from a header, content, and footer holding a login form.",
    },
    {
      name: "card-small",
      title: "Size",
      description: "Use `size=\"sm\"` on `Card` for smaller spacing between sections.",
    },
    {
      name: "card-spacing",
      title: "Spacing",
      description:
        "Set the `--card-spacing` CSS variable to control the gap between sections and the inset of card parts, independent of `size`.",
    },
    {
      name: "card-edge-to-edge",
      title: "Edge to edge",
      description:
        "Use `-mx-(--card-spacing)` on content to bleed it to the card's edges while keeping it aligned with the inset; add `-mb-(--card-spacing)` on `CardContent` when edge-to-edge content sits directly above a footer.",
    },
    {
      name: "card-image",
      title: "Image",
      description: "Place an `img` before `CardHeader` (with `pt-0` on `Card`) to create a card with a cover image.",
    },
    {
      name: "card-rtl",
      title: "RTL",
      description: "Card and its parts restyle correctly for right-to-left layouts via `dir=\"rtl\"`.",
    },
    {
      name: "card-full-composition",
      title: "Full example",
      description:
        "The full part list — `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` — assembled together.",
    },
    {
      name: "card-action",
      title: "With action",
      description: "`CardAction` places content in the top-right of the header, such as a button.",
    },
    {
      name: "card-border-footer",
      title: "With border",
      description: "Add `border-b` to `CardHeader` or `border-t` to `CardFooter` to separate sections.",
    },
    {
      name: "card-content-only",
      title: "Content only",
      description: "A minimal card with only `CardContent`, no header or footer.",
    },
  ],
};
