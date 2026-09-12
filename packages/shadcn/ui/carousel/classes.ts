export const carousel = {
  root: "relative",
  itemGroup: "overflow-hidden outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  item: "min-w-0 shrink-0 grow-0 basis-full",
  prev: "mu-carousel-previous absolute top-1/2 left-2 -translate-y-1/2 touch-manipulation",
  prevIcon: "mu-rtl-flip",
  next: "mu-carousel-next absolute top-1/2 right-2 -translate-y-1/2 touch-manipulation",
  nextIcon: "mu-rtl-flip",
  srOnly: "sr-only",
  indicatorGroup: "flex items-center justify-center gap-2 pt-4",
  indicator: "group/indicator flex size-6 items-center justify-center",
  indicatorDot: "size-2 rounded-full bg-primary/20 group-data-[current]/indicator:bg-primary",
} as const;
