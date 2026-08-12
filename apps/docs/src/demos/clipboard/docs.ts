// Hand-authored prose + example ordering for /docs/components/clipboard.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Copy text to the clipboard, with a temporary confirmation state.",
  importSnippet: `import Clipboard from "@/components/ui/clipboard/clipboard.marko";`,
  usageSnippet: `<Clipboard label="Link" value="https://marko-ui.dev"/>`,
  examples: [
    {
      name: "clipboard-demo",
      title: "Basic",
      description: "A labeled clipboard field. Click the trigger to copy the value.",
    },
    {
      name: "clipboard-timeout",
      title: "Custom timeout",
      description: "Pass `timeout` to control how long the copied confirmation state is shown, in milliseconds.",
    },
    {
      name: "clipboard-disabled",
      title: "Disabled",
      description: "A disabled clipboard is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "clipboard-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
  ],
};
