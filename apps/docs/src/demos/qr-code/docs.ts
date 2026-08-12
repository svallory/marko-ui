// Hand-authored prose + example ordering for /docs/components/qr-code.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Renders a QR code for a given value, with size variants and an optional center logo overlay.",
  importSnippet: `import QrCode from "@/components/ui/qr-code/qr-code.marko";`,
  usageSnippet: `<QrCode value="https://marko-ui.dev"/>`,
  examples: [
    {
      name: "qr-code-demo",
      title: "Basic",
      description: "A QR code rendered for a given `value`.",
    },
    {
      name: "qr-code-sizes",
      title: "Sizes",
      description: "Pass `size` (`sm`, `default`, `lg`) to scale the rendered frame.",
    },
    {
      name: "qr-code-overlay",
      title: "With center logo overlay",
      description: "Fill the `@overlay` slot to place a logo or mark at the center of the code.",
    },
    {
      name: "qr-code-download",
      title: "Download as PNG",
      description:
        "Pass a ref-like binding (`<QrCode/qrCodeApi>`) to reach the live API and call `getDataUrl` for a downloadable image.",
    },
    {
      name: "qr-code-controlled",
      title: "Controlled value",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`.",
    },
  ],
};
