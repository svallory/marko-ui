// Hand-authored prose + example ordering for /docs/components/card.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays a card with header, content, and footer.",
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
      name: "default",
      title: "Login form",
      description: "A card built from a header, content, and footer holding a login form.",
    },
    {
      name: "full-composition",
      title: "Full example",
      description:
        "The full part list — `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` — assembled together.",
    },
    {
      name: "action",
      title: "With action",
      description: "`CardAction` places content in the top-right of the header, such as a button.",
    },
    {
      name: "border-footer",
      title: "With border",
      description: "Add `border-b` to `CardHeader` or `border-t` to `CardFooter` to separate sections.",
    },
    {
      name: "content-only",
      title: "Content only",
      description: "A minimal card with only `CardContent`, no header or footer.",
    },
  ],
};
