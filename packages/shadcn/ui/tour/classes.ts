export const tour = {
  backdrop: "z-[calc(50+var(--tour-layer,0))] bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
  spotlight: "z-[calc(50+var(--tour-layer,0))] ring-2 ring-ring/40",
  positioner:
    "[--tour-z-index:50] z-[calc(50+var(--tour-layer,0))] data-[type=dialog]:fixed data-[type=dialog]:inset-0 data-[type=dialog]:grid data-[type=dialog]:place-items-center data-[type=floating]:fixed data-[type=floating]:inset-0 data-[type=floating]:grid data-[type=floating]:place-items-center",
  content:
    "group bg-popover text-popover-foreground relative flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-lg border p-4 shadow-lg outline-hidden",
  contentAnim:
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
  arrow:
    "[--arrow-background:var(--popover)] [--arrow-size:10px] group-data-[side=bottom]:top-[calc(var(--arrow-size)/-2)] group-data-[side=bottom]:left-[calc(50%-var(--arrow-size)/2)] group-data-[side=top]:bottom-[calc(var(--arrow-size)/-2)] group-data-[side=top]:left-[calc(50%-var(--arrow-size)/2)] group-data-[side=left]:right-[calc(var(--arrow-size)/-2)] group-data-[side=left]:top-[calc(50%-var(--arrow-size)/2)] group-data-[side=right]:left-[calc(var(--arrow-size)/-2)] group-data-[side=right]:top-[calc(50%-var(--arrow-size)/2)]",
  headerRow: "flex items-start justify-between gap-2",
  title: "text-sm leading-none font-semibold",
  close: "ring-offset-background focus-visible:ring-ring -mt-1 -mr-1 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
  closeIcon: "size-4",
  srOnly: "sr-only",
  description: "text-muted-foreground text-sm",
  footerRow: "flex items-center justify-between gap-3 pt-1",
  progress: "flex items-center gap-1.5",
  progressDot: "size-1.5 rounded-full transition-colors",
  progressDotCurrent: "bg-primary",
  progressDotInactive: "bg-muted-foreground/30",
  progressText: "text-muted-foreground ml-1.5 text-xs tabular-nums",
  actions: "flex items-center gap-2",
  actionTrigger:
    "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  actionTriggerNext: "data-[type=next]:bg-primary data-[type=next]:text-primary-foreground data-[type=next]:hover:bg-primary/90",
  actionTriggerPrev: "data-[type=prev]:border data-[type=prev]:border-input data-[type=prev]:bg-background data-[type=prev]:hover:bg-accent data-[type=prev]:hover:text-accent-foreground",
  actionTriggerSkip: "data-[type=skip]:text-muted-foreground data-[type=skip]:hover:bg-accent data-[type=skip]:hover:text-accent-foreground",
  actionTriggerClose: "data-[type=close]:bg-primary data-[type=close]:text-primary-foreground data-[type=close]:hover:bg-primary/90",
  actionTriggerCustom: "data-[type=custom]:bg-primary data-[type=custom]:text-primary-foreground data-[type=custom]:hover:bg-primary/90",
} as const;
