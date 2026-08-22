// Hand-authored prose + example ordering for /docs/components/input-otp.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description: "Accessible one-time password component with copy paste functionality.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<InputOTP>`,
  importSnippet: `import InputOTP from "@/components/ui/input-otp/input-otp.marko";`,
  usageSnippet: `<InputOTP length=6/>`,
  // Upstream's InputOTP is built on the `input-otp` npm package (a
  // React-only dependency); ours is a Zag `pin-input` machine instead, so
  // the underlying behavior comes from marko-zag's `@zag-js/pin-input`,
  // not the `input-otp` project the upstream MDX links to.
  composition:
    "`InputOTP` is a single component, not four. Where upstream composes " +
    "`InputOTP` / `InputOTPGroup` / `InputOTPSlot` / `InputOTPSeparator`, " +
    "this port folds all four into one tag backed by a Zag `pin-input` " +
    "machine: `length` sets the slot count (sugar for the machine's " +
    "`count` prop) and `groupSize` inserts a separator automatically " +
    "between fixed-size groups — there is no separate `InputOTPGroup`, " +
    "`InputOTPSlot`, or `InputOTPSeparator` tag to import or compose by " +
    "hand.",
  accessibilityNotes: [
    "Each slot renders as a real `<input>` with `aria-label` identifying its position (\"digit N of M\"), `aria-invalid` when the `invalid` prop is set, and `data-complete`/`data-disabled` state attributes shared with the root for styling hooks.",
    "Only one slot is ever tabbable at a time — the machine keeps `tabindex=0` on the next empty slot (or the last filled one when complete) and `tabindex=-1` on the rest, so Tab moves straight from the input into and back out of the whole group instead of stopping at every slot.",
    "A visually-hidden native `<input>` mirrors the joined value for native form participation (`name`, `required`, `form` all pass through to it), so the component works inside a plain HTML form submit without extra wiring.",
    "Pasting a full code is supported and validated against `pattern`/`type` before it's accepted; an invalid paste is rejected rather than partially applied.",
  ],
  accessibilityKeyboard: [
    { keys: "0-9 / a-z", description: "Types into the focused slot and advances to the next one (character set constrained by `pattern` or `type`)." },
    { keys: "Backspace", description: "Clears the focused slot and moves focus to the previous slot." },
    { keys: "Left / Right", description: "Moves focus to the adjacent slot." },
    { keys: "Ctrl/Cmd+V", description: "Pastes and distributes a full code across the slots, validated against `pattern`/`type`." },
  ],
  examples: [
    {
      name: "input-otp-demo",
      title: "Basic",
      description: "Set `length` to the number of slots the code should have.",
    },
    {
      name: "input-otp-pattern",
      title: "Pattern",
      description:
        "Constrain accepted characters with `pattern`, a regular-expression source string. Upstream imports the `REGEXP_ONLY_DIGITS`/`REGEXP_ONLY_DIGITS_AND_CHARS` constants from the `input-otp` package; this port inlines the equivalent regex source directly since that package isn't a dependency here.",
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
      name: "input-otp-invalid",
      title: "Invalid",
      description:
        "Pass `invalid` to mark every slot's `aria-invalid`/`data-invalid` state. The machine applies this at the root, not per slot — upstream instead sets `aria-invalid` on individual `InputOTPSlot`s, which this single-tag port has no equivalent for.",
    },
    {
      name: "input-otp-four-digits",
      title: "Four Digits",
      description: "A common pattern for PIN codes: set `length=4` with a digits-only `pattern`.",
    },
    {
      name: "input-otp-alphanumeric",
      title: "Alphanumeric",
      description: "Use a `pattern` that accepts both letters and numbers.",
    },
    {
      name: "input-otp-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, which receives the array of per-slot characters.",
    },
    {
      name: "input-otp-form",
      title: "Form",
      description: "A full verification-code form built from `Card`, `Field`, and `InputOTP`.",
    },
    {
      name: "input-otp-rtl",
      title: "RTL",
      description:
        "The machine's own `dir` prop drives right-to-left slot layout and arrow-key navigation directly, with no separate RTL configuration step.",
    },
  ],
};
