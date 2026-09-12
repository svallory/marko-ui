export const marquee = {
  root: "relative overflow-hidden",
  edgeStart: "pointer-events-none absolute inset-y-0 start-0 z-10 w-12 bg-gradient-to-r from-background to-transparent",
  edgeEnd: "pointer-events-none absolute inset-y-0 end-0 z-10 w-12 bg-gradient-to-l from-background to-transparent",
  viewport: "flex w-full",
  content: "flex shrink-0 items-center",
  item: "flex shrink-0 items-center",
} as const;
