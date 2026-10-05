// Hand-authored prose + example ordering for /docs/components/progress.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Progress>`,
  importSnippet: `import Progress from "@/components/ui/progress/progress.marko";`,
  usageSnippet: `<Progress value=66/>`,
  // composition-tree never renders — see docs-types.ts's `composition` doc.
  // Progress is a single-file component (one part, `isCompound` is false),
  // but upstream still documents a Composition anatomy tree (its base-nova
  // style splits Progress/ProgressLabel/ProgressValue/ProgressTrack/
  // ProgressIndicator as separate primitives). Ours renders the same
  // pieces from one <Progress> tag: `label` composes the label row,
  // `getRangeProps()`/`getTrackProps()` compose the track internally.
  composition: `\`Progress\` renders its full anatomy — an optional label row and a
track/indicator pair — from one tag. Pass \`label\` to render the caption
and live value text above the track; without it, only the track renders.

\`\`\`text
Progress
├── (label row, when \`label\` is set)
│   ├── label
│   └── value text
└── track
    └── indicator
\`\`\``,
  examples: [
    {
      name: "progress-demo",
      title: "Basic",
      description: "A progress bar filled to a fixed `value` out of the default 0-100 range.",
    },
    {
      name: "progress-label",
      title: "With label",
      description: "Pass `label` to render a caption and live value text above the track.",
    },
    {
      name: "progress-controlled",
      title: "Controlled",
      description:
        "Zag machines are controlled: a `value` prop without a change handler never moves. Pair it with `valueChange`, or use Marko's bind shorthand `value:=state`.",
    },
    {
      name: "progress-rtl",
      title: "RTL",
      description:
        "To enable RTL support, set `dir=\"rtl\"` on an ancestor. Our indicator fills via Zag's `getRangeProps()`, not a manual transform, so no extra RTL class is needed.",
    },
    {
      name: "progress-min-max",
      title: "Min / Max",
      description: "Set a custom `min` and `max` when the value isn't a 0-100 percentage.",
    },
    {
      name: "progress-indeterminate",
      title: "Indeterminate",
      description: "Pass `value=null` when progress can't be measured yet.",
    },
  ],
  accessibilityNotes: [
    "The root exposes `role=\"progressbar\"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` (or `aria-valuetext` for indeterminate progress) via Zag's `getRootProps()` — no manual ARIA wiring needed.",
    "Progress is a passive status indicator with no keyboard interaction of its own — nothing needs `accessibilityKeyboard` here.",
    "When `label` is set, the caption and value text are linked to the root through `getLabelProps()`/`getValueTextProps()`, so assistive tech announces both together.",
  ],
};
