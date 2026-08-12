// Hand-authored prose + example ordering for /docs/components/input-otp.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Accessible one-time password component with copy paste functionality.",
  importSnippet: `import InputOTP from "@/components/ui/input-otp/input-otp.marko";`,
  usageSnippet: `<InputOTP length=6/>`,
  examples: [
    {
      name: "input-otp-demo",
      title: "Basic",
      description: "Set `length` to the number of slots the code should have.",
    },
    {
      name: "input-otp-separator",
      title: "Grouped",
      description: "Set `groupSize` to insert a separator between fixed-size groups of slots.",
    },
    {
      name: "input-otp-masked",
      title: "Masked",
      description: "Pass `mask` to render entered characters as dots, like a password field.",
    },
    {
      name: "input-otp-disabled",
      title: "Disabled",
      description: "A disabled input is skipped by the tab order and ignores pointer input.",
    },
    {
      name: "input-otp-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, which receives the array of per-slot characters.",
    },
  ],
};
