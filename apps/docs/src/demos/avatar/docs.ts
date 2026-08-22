// Hand-authored prose + example ordering for /docs/components/avatar.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "An image element with a fallback for representing the user.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Avatar>`,
  importSnippet: `import Avatar from "@/components/ui/avatar/avatar.marko";`,
  usageSnippet: `<Avatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN"/>`,
  examples: [
    {
      name: "avatar-demo",
      title: "Basic",
      description: "An avatar with an image, and one falling back to initials when it has no `src`.",
    },
    {
      name: "avatar-basic",
      title: "Basic image",
      description: "A basic avatar with an image and a fallback.",
    },
    {
      name: "avatar-fallback",
      title: "Fallback",
      description: "Without a `src`, the fallback content renders immediately.",
    },
    {
      name: "avatar-broken-image",
      title: "Broken image",
      description: "When `src` fails to load, the machine reports an `error` status and the fallback takes over.",
    },
    {
      name: "avatar-custom-fallback",
      title: "Custom fallback content",
      description: "Pass a body instead of `fallback` for arbitrary fallback markup, such as an icon.",
    },
    {
      name: "avatar-controlled",
      title: "Controlled",
      description: "Listen for `statusChange` to react to `loading`, `loaded`, or `error` as `src` changes.",
    },
    {
      name: "avatar-badge",
      title: "Badge",
      description:
        "Pass an `AvatarBadge` through the `@badge` slot to add a badge to the avatar, positioned at the bottom right. Use `class` to customize its color and size.",
    },
    {
      name: "avatar-badge-icon",
      title: "Badge with Icon",
      description: "You can also render an icon inside `AvatarBadge`.",
    },
    {
      name: "avatar-group",
      title: "Avatar Group",
      description: "Use `AvatarGroup` to render a group of overlapping avatars.",
    },
    {
      name: "avatar-group-count",
      title: "Avatar Group Count",
      description: "Use `AvatarGroupCount` to add a count indicator to the group.",
    },
    {
      name: "avatar-group-count-icon",
      title: "Avatar Group with Icon",
      description: "You can also render an icon inside `AvatarGroupCount`.",
    },
    {
      name: "avatar-size",
      title: "Sizes",
      description: 'Use the `size` prop ("sm" | "default" | "lg") to change the size of the avatar.',
    },
    {
      name: "avatar-dropdown",
      title: "Dropdown",
      description: "Use `Avatar` as the trigger for a dropdown menu.",
    },
    {
      name: "avatar-rtl",
      title: "RTL",
      description: "Avatar, badge, and group markup mirror correctly under `dir=\"rtl\"`.",
    },
  ],
};
