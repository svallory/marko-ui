// The framework list the typeset docs panel's picker offers. Ported from
// shadcn/ui app/(app)/(create)/lib/templates.ts — same values, same titles,
// same order. The `logo` SVG strings are dropped: the typeset docs panel is
// the only consumer here and it renders titles only (docs-panel.tsx builds
// FRAMEWORK_ITEMS as {value, label} and never touches logo).
export const TEMPLATES = [
  { value: "next", title: "Next.js" },
  { value: "vite", title: "Vite" },
  { value: "start", title: "TanStack Start" },
  { value: "laravel", title: "Laravel" },
  { value: "react-router", title: "React Router" },
  { value: "astro", title: "Astro" },
] as const

export type TemplateValue = (typeof TEMPLATES)[number]["value"]
