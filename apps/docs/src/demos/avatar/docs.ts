// Hand-authored prose + example ordering for /docs/components/avatar.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "An image element with a fallback for representing the user.",
  importSnippet: `import Avatar from "@/components/ui/avatar/avatar.marko";`,
  usageSnippet: `<Avatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN"/>`,
  examples: [
    {
      name: "avatar-demo",
      title: "Basic",
      description: "An avatar with an image, and one falling back to initials when it has no `src`.",
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
  ],
};
