// Ported verbatim from shadcn/ui
// app/(app)/(typeset)/lib/fixtures/index.ts.
//
// Only deviation: `AVAILABLE_CONTENT_OPTIONS` gates the dev-only options on
// Vite's `import.meta.env.DEV` instead of Next's `process.env.NODE_ENV ===
// "development"` — same semantics, this app's build-time flag. Since
// DEV_CONTENT_OPTIONS is currently empty (both entries commented out
// upstream), the two lists are identical either way.
import { ARTICLE_HTML } from "./article"
import { CHANGELOG_HTML } from "./changelog"
import { CHAT_HTML } from "./chat"
import { DOCS_HTML } from "./docs"
import { KITCHEN_SINK_HTML } from "./elements"
import { NOTES_HTML } from "./notes"
import { RECIPE_HTML } from "./recipe"
import { TAILWIND_HTML } from "./tailwind"

export const FIXTURES = {
  docs: DOCS_HTML,
  chat: CHAT_HTML,
  article: ARTICLE_HTML,
  changelog: CHANGELOG_HTML,
  notes: NOTES_HTML,
  recipe: RECIPE_HTML,
  elements: KITCHEN_SINK_HTML,
  tailwind: TAILWIND_HTML,
} as const

export const CONTENT_OPTIONS = [
  { value: "docs", label: "Docs" },
  { value: "chat", label: "Chat" },
  { value: "article", label: "Article" },
  { value: "changelog", label: "Changelog" },
  { value: "notes", label: "Notes" },
  // { value: "recipe", label: "Recipe" },
  // { value: "elements", label: "Elements" },
] as const

// Testing baselines, dev-only: never built or offered in production.
export const DEV_CONTENT_OPTIONS: readonly {
  value: keyof typeof FIXTURES
  label: string
}[] = [
  // { value: "tailwind", label: "Tailwind" },
]

// Vite's build-time flag. Typed loosely because this app's tsconfig does not
// pull in vite/client's ImportMeta augmentation.
export const IS_DEV: boolean = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
)

export const AVAILABLE_CONTENT_OPTIONS = IS_DEV
  ? ([...CONTENT_OPTIONS, ...DEV_CONTENT_OPTIONS] as const)
  : CONTENT_OPTIONS
