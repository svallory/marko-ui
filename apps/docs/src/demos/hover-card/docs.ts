// Hand-authored prose + example ordering for /docs/components/hover-card.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "For sighted users to preview content available behind a link.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<HoverCard>`,
  importSnippet: `import HoverCard from "@/components/ui/hover-card/hover-card.marko";`,
  usageSnippet: `<HoverCard>
  <@trigger|props|>
    <a ...props href="#">@marko-ui</a>
  </@trigger>
  <@content>
    The component registry for Marko 6.
  </@content>
</HoverCard>`,
  examples: [
    {
      name: "hover-card-demo",
      title: "Basic",
      description:
        "The `trigger` render-prop receives the trigger's props and spreads them onto the element that opens the card; `content` is shown once the pointer lingers.",
    },
    {
      name: "hover-card-sides",
      title: "Positioning",
      description:
        "Pass `positioning` with a `placement` to control which side of the trigger the card opens on.",
    },
    {
      name: "hover-card-custom-delays",
      title: "Custom delays",
      description:
        "Use `openDelay` and `closeDelay` (in milliseconds) to control how quickly the card opens and closes.",
    },
    {
      name: "hover-card-disabled",
      title: "Disabled",
      description: "Pass `disabled` to prevent the hover card from ever opening.",
    },
  ],
};
