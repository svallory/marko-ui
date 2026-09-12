export const angleSlider = {
  root: "flex flex-col items-center gap-2",
  label: "sr-only",
  control: "relative size-24 rounded-full border border-input bg-muted",
  thumb: "absolute inset-y-0 left-1/2 flex w-0.5 -translate-x-1/2 flex-col items-center justify-start bg-transparent outline-none",
  thumbKnob: "block size-3 -translate-y-1/2 rounded-full border border-primary bg-background shadow-sm ring-0 focus-visible:ring-[3px] focus-visible:ring-ring/50",
  valueText: "text-sm text-muted-foreground tabular-nums",
} as const;
