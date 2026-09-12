export const progress = {
  root: "mu-progress relative flex w-full items-center overflow-x-hidden flex-col gap-2",
  labelRow: "flex items-center justify-between text-sm",
  label: "text-sm font-medium",
  value: "text-muted-foreground ml-auto text-sm tabular-nums",
  track: "bg-muted relative h-2 w-full overflow-hidden rounded-full",
  indicator: "mu-progress-indicator size-full flex-1 transition-all",
} as const;
