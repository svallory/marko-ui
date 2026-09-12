export const timer = {
  root: "flex flex-col items-center gap-4 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
  area: "flex items-center gap-1",
  separator: "pb-4 text-2xl font-semibold text-muted-foreground",
  item: "flex flex-col items-center gap-1",
  itemValue:
    "flex h-14 min-w-14 items-center justify-center rounded-md border bg-muted px-2 font-mono text-3xl font-semibold tabular-nums text-foreground",
  itemLabel: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
  control: "flex items-center gap-2",
  actionPrimary:
    "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  actionSecondary:
    "inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
} as const;
