export const scrollArea = {
  root: "mu-scroll-area relative",
  viewport: "mu-scroll-area-viewport size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
  scrollbar: "mu-scroll-area-scrollbar flex touch-none p-px transition-colors select-none",
  // flex-1 (flex: 1 1 0%) is Radix parity by class name, but Radix never
  // mounts this element at all when the axis has no overflow — under Zag,
  // where the scrollbar/thumb are gated by JS state that starts as "not
  // hidden" until the first (always-async, see scroll-area.machine's
  // ResizeObserver+setTimeout) measurement, flex-grow would fill the whole
  // track with an empty thumb for at least one frame regardless of the
  // measured --thumb-width var. flex-none + the var (falling back to 0)
  // makes the thumb's actual size the single source of truth, so an
  // unmeasured/zero-size thumb is genuinely invisible instead of merely
  // hidden behind a JS gate that can't run before first paint.
  thumb: "mu-scroll-area-thumb relative flex-none bg-border",
} as const;
