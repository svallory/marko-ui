/**
 * The showcase pages /create/preview can render.
 *
 * Single source of truth shared by three consumers that must never disagree:
 * - routes/create/preview/+page.marko (picks which body to render),
 * - vite.config.ts (seeds one prerendered document per item),
 * - worker/index.ts (maps `?item=` onto those documents at request time).
 *
 * The first entry is the default for an absent or unrecognised `item`,
 * mirroring shadcn's `parseAsString.withDefault(...)`.
 */
export const PREVIEW_ITEMS = [
  "preview-page-1",
  "preview-page-2",
  "preview-page-3",
] as const;

export type PreviewItem = (typeof PREVIEW_ITEMS)[number];

export const DEFAULT_PREVIEW_ITEM: PreviewItem = PREVIEW_ITEMS[0];

/** Narrow an untrusted `?item=` value to a known page, falling back to the default. */
export function resolvePreviewItem(value: string | null | undefined): PreviewItem {
  return PREVIEW_ITEMS.includes(value as PreviewItem)
    ? (value as PreviewItem)
    : DEFAULT_PREVIEW_ITEM;
}
