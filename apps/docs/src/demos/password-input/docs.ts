// Hand-authored prose + example ordering for /docs/components/password-input.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A password input field with a visibility toggle button and correct autocomplete handling.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<PasswordInput>`,
  importSnippet: `import PasswordInput from "@/components/ui/password-input/password-input.marko";`,
  usageSnippet: `<PasswordInput label="Password" name="password"/>`,
  examples: [
    {
      name: "password-input-demo",
      title: "Basic",
      description: "A labeled password input with a visibility toggle button.",
    },
    {
      name: "password-input-new-password",
      title: "New password",
      description:
        "Pass `autoComplete=\"new-password\"` so browsers offer a generated password instead of an existing one.",
    },
    {
      name: "password-input-disabled",
      title: "Disabled",
      description: "A disabled password input ignores pointer input and is skipped by the tab order.",
    },
    {
      name: "password-input-invalid",
      title: "Invalid",
      description: "Pass `invalid` to mark the field as failing validation.",
    },
    {
      name: "password-input-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `visible` prop without a change handler never moves. Pair it with `visibleChange`, or use Marko's bind shorthand `visible:=state`.",
    },
  ],
};
