// Hand-authored prose + example ordering for /docs/components/empty.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Use the Empty component to display an empty state.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Empty>, <EmptyHeader>, <EmptyMedia>, <EmptyTitle>, <EmptyDescription>, <EmptyContent>`,
  importSnippet: `import Empty from "@/components/ui/empty/empty.marko";
import EmptyHeader from "@/components/ui/empty/header.marko";
import EmptyMedia from "@/components/ui/empty/media.marko";
import EmptyTitle from "@/components/ui/empty/title.marko";
import EmptyDescription from "@/components/ui/empty/description.marko";
import EmptyContent from "@/components/ui/empty/content.marko";`,
  usageSnippet: `<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <Icon/>
    </EmptyMedia>
    <EmptyTitle>No data</EmptyTitle>
    <EmptyDescription>No data found</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>Add data</Button>
  </EmptyContent>
</Empty>`,
  examples: [
    {
      name: "empty-demo",
      title: "Basic",
      description: "A header with icon, title, and description, plus content actions.",
    },
    {
      name: "empty-outline",
      title: "Outline",
      description: "Use the `border` utility class to create an outline empty state.",
    },
    {
      name: "empty-background",
      title: "Background",
      description: "Use `bg-*` and `bg-gradient-*` utilities to add a background to the empty state.",
    },
    {
      name: "empty-avatar",
      title: "Avatar",
      description: "Use `EmptyMedia` with `variant=\"default\"` to display an avatar in the empty state.",
    },
    {
      name: "empty-avatar-group",
      title: "Avatar group",
      description: "Use `EmptyMedia` to display an avatar group in the empty state.",
    },
    {
      name: "empty-input-group",
      title: "Input group",
      description: "You can add an `InputGroup` component to the `EmptyContent` component.",
    },
    {
      name: "empty-icon",
      title: "Icon",
      description: "A grid of compact empty states, each with just an icon, title, and description.",
    },
  ],
};
