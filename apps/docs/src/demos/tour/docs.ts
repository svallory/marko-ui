// Hand-authored prose + example ordering for /docs/components/tour.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A guided product tour: spotlighted targets, a dimmed backdrop, and positioned step popovers with next/prev/skip/finish actions and progress dots.",
  importSnippet: `import Tour from "@/components/ui/tour/tour.marko";`,
  usageSnippet: `<Tour items=steps>
  <@trigger|props|>
    <Button ...props>Start tour</Button>
  </@trigger>
</Tour>`,
  examples: [
    {
      name: "default",
      title: "Default",
      description:
        "A four-step tour that opens on a dialog and then spotlights toolbar targets by CSS selector, one at a time.",
    },
    {
      name: "sides",
      title: "Side placement",
      description:
        "Steps placed to the `right` and `left` of their targets, each with a single action.",
    },
    {
      name: "controlled",
      title: "Controlled",
      description:
        "Pair `stepId` with `stepIdChange` (or Marko's bind shorthand `stepId:=state`) to drive the current step from parent state, and `statusChange` to observe the tour's lifecycle.",
    },
  ],
};
