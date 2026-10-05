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
  examples: [    {
      name: "button-default",
      title: "Basic",
      description: "The default button.",
    },

    {
      name: "button-demo",
      title: "Demo",
      description: "The default button, plus an icon-only variant.",
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
        "Pass `href` to render an `<a>` with the same styling — the Marko equivalent of shadcn's `asChild`. The element stays a real anchor (no `role=\"button\"` override), so middle-click, \"copy link address\" and keyboard activation all behave natively. `buttonVariants` is still available when you need the classes on markup you control yourself.",
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
      description:
        "Wrap the components in `dir=\"rtl\"` to render right-to-left. Arabic labels throughout, with the directional icon flipped via `rtl:rotate-180` — the same `dir`-wrapper pattern every RTL example on this site uses.",
    },],
  accessibilityNotes: [
    "Renders a native `<button>` by default, or a native `<a>` when `href` is passed (see `packages/shadcn/ui/button/button.marko`) — either way the element is a real interactive element, so it is keyboard-activatable with `Enter` and `Space` (`<a>`: `Enter` only, following the link) and reachable by `Tab` for free — no custom key handling or ARIA role is added.",
    "`disabled` is the native `<button>` attribute, passed straight through via `...rest` — it removes the button from the tab order and blocks pointer and keyboard activation, matching every other native form control. The `variants.ts` styles (`disabled:pointer-events-none disabled:opacity-50`) key off that same native state rather than a separate `data-disabled` flag.",
    "Pass `href` and `Button` renders an `<a>` with the same styling and data attributes — the Marko equivalent of shadcn's `asChild`. There is no `render`/`asChild` prop (unlike upstream Base UI's `Button`, whose polymorphic `render` prop still applies `role=\"button\"` and overrides the `<a>`'s native link semantics); the anchor keeps its native link role and keyboard behavior instead of inheriting button semantics. To style markup `Button` does not wrap, apply the `buttonVariants` helper directly to it.",
  ],
};
