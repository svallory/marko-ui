// Hand-authored prose + example ordering for /docs/components/button.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Displays a button or a component that looks like a button.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Button>`,
  importSnippet: `import Button from "@/components/ui/button/button.marko";`,
  usageSnippet: `<Button variant="outline">Button</Button>`,
  examples: [
    {
      name: "button-demo",
      title: "Demo",
      description: "The default button, plus an icon-only variant.",
    },
    {
      name: "button-default",
      title: "Basic",
      description: "The default button.",
    },
    {
      name: "button-variants",
      title: "Variants",
      description:
        "Six visual variants, selected with the `variant` prop. They are plain class-variance-authority variants — no machine involved.",
    },
    {
      name: "button-outline",
      title: "Outline",
      description: "The `outline` variant.",
    },
    {
      name: "button-secondary",
      title: "Secondary",
      description: "The `secondary` variant.",
    },
    {
      name: "button-ghost",
      title: "Ghost",
      description: "The `ghost` variant.",
    },
    {
      name: "button-destructive",
      title: "Destructive",
      description: "The `destructive` variant.",
    },
    {
      name: "button-link",
      title: "Link",
      description: "The `link` variant.",
    },
    {
      name: "button-size",
      title: "Sizes",
      description: "Three sizes plus an `icon` size for square icon-only buttons.",
    },
    {
      name: "button-icon",
      title: "Icon",
      description: "The `icon` size for a square, icon-only button.",
    },
    {
      name: "button-with-icon",
      title: "With Icon",
      description:
        'Add the `data-icon="inline-start"` or `data-icon="inline-end"` attribute to the icon for correct spacing.',
    },
    {
      name: "button-rounded",
      title: "Rounded",
      description: 'Use the `rounded-full` class to make the button rounded.',
    },
    {
      name: "button-spinner",
      title: "Spinner",
      description:
        'Render a `Spinner` inside the button to show a loading state. Add `data-icon="inline-start"` or `data-icon="inline-end"` to the spinner for correct spacing.',
    },
    {
      name: "button-group-demo",
      title: "Button Group",
      description:
        'Use `ButtonGroup` to group related buttons together. See the Button Group documentation for more details.',
    },
    {
      name: "button-render",
      title: "As Link",
      description:
        "Use the `buttonVariants` helper to make a link look like a button. Don't render `Button` itself as an `<a>` — it always applies `role=\"button\"`, overriding the semantic link role.",
    },
    {
      name: "button-disabled",
      title: "Disabled",
      description:
        "`disabled` is a native `<button>` attribute — it passes straight through to the element.",
    },
    {
      name: "button-rtl",
      title: "RTL",
      description: "To enable RTL support in shadcn/ui, see the RTL configuration guide.",
    },
  ],
  accessibilityNotes: [
    "Renders a native `<button>` element (see `packages/shadcn/ui/button/button.marko`), so it's keyboard-activatable with `Enter` and `Space` and reachable by `Tab` for free — no custom key handling or ARIA role is added.",
    "`disabled` is the native `<button>` attribute, passed straight through via `...rest` — it removes the button from the tab order and blocks pointer and keyboard activation, matching every other native form control. The `variants.ts` styles (`disabled:pointer-events-none disabled:opacity-50`) key off that same native state rather than a separate `data-disabled` flag.",
    "`Button` always renders a `<button>` — it has no `render`/`asChild` prop to become an `<a>` (unlike upstream Base UI's `Button`, whose polymorphic `render` prop still applies `role=\"button\"` and overrides the `<a>`'s native link semantics). To style a link as a button, apply the `buttonVariants` helper directly to your own `<a>` (see the \"As Link\" example) — the anchor keeps its native link role and keyboard behavior (`Enter` to follow, no `Space` activation) instead of inheriting button semantics.",
  ],
};
