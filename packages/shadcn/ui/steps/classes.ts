export const steps = {
  root: "flex flex-col gap-6 data-[orientation=horizontal]:w-full data-[orientation=vertical]:flex-row",
  list: "flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:items-center data-[orientation=vertical]:shrink-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:gap-1 data-[orientation=vertical]:pr-8",
  item: "flex items-center data-[orientation=horizontal]:flex-1 data-[orientation=horizontal]:last:flex-none data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start",
  trigger:
    "flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  indicator:
    "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium data-complete:border-primary data-complete:bg-primary data-complete:text-primary-foreground data-current:border-primary data-current:text-primary data-incomplete:border-input data-incomplete:text-muted-foreground",
  indicatorIcon: "[stroke-width:2.5]",
  labelWrapper: "flex flex-col items-start text-left",
  title: "text-sm font-medium",
  titleIncomplete: "text-muted-foreground",
  description: "text-xs text-muted-foreground",
  separator:
    "bg-border data-[orientation=horizontal]:mx-2 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:flex-1 data-[orientation=vertical]:ml-4 data-[orientation=vertical]:w-px data-[orientation=vertical]:flex-1 data-complete:bg-primary",
  contentWrapper: "flex-1",
  actions: "mt-6 flex items-center justify-between gap-2",
  prevTrigger:
    "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
  nextTrigger:
    "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50",
} as const;
