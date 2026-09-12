export const scrollArea = {
  root: "mu-scroll-area relative",
  viewport: "mu-scroll-area-viewport size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
  scrollbar: "mu-scroll-area-scrollbar flex touch-none p-px transition-colors select-none",
  thumb: "mu-scroll-area-thumb relative flex-1 bg-border",
} as const;
