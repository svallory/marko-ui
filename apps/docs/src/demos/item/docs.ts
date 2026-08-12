// Hand-authored prose + example ordering for /docs/components/item.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A flexible flex container for displaying content with media, title, description, and actions. Group items together with `ItemGroup` to build lists.",
  importSnippet: `import Item from "@/components/ui/item/item.marko";
import ItemContent from "@/components/ui/item/content.marko";
import ItemMedia from "@/components/ui/item/media.marko";
import ItemTitle from "@/components/ui/item/title.marko";
import ItemDescription from "@/components/ui/item/description.marko";
import ItemActions from "@/components/ui/item/actions.marko";`,
  usageSnippet: `<Item>
  <ItemMedia variant="icon">
    <Icon/>
  </ItemMedia>
  <ItemContent>
    <ItemTitle>Title</ItemTitle>
    <ItemDescription>Description</ItemDescription>
  </ItemContent>
  <ItemActions>
    <Button>Action</Button>
  </ItemActions>
</Item>`,
  examples: [
    {
      name: "item-demo",
      title: "Basic",
      description: "A simple item with just a title and description.",
    },
    {
      name: "item-variant",
      title: "Variant",
      description:
        "Use the `variant` prop to change the visual style of the item: `default`, `outline`, or `muted`.",
    },
    {
      name: "item-size",
      title: "Size",
      description:
        "Use the `size` prop to change the padding and gap of the item: `default` or `sm`.",
    },
    {
      name: "item-icon",
      title: "Icon",
      description: 'Use `ItemMedia` with `variant="icon"` to display an icon.',
    },
    {
      name: "item-image",
      title: "Image",
      description: 'Use `ItemMedia` with `variant="image"` to display an image.',
    },
    {
      name: "item-group",
      title: "Group",
      description: "Use `ItemGroup` and `ItemSeparator` to group related items together.",
    },
    {
      name: "item-header",
      title: "Header and footer",
      description: "Use `ItemHeader` and `ItemFooter` to add content above and below the item body.",
    },
    {
      name: "item-link",
      title: "As link",
      description: "Wrap an `Item` in an anchor tag to make the entire item clickable.",
    },
  ],
};
