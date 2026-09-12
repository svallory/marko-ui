export const toaster = {
  root: "outline-none",
} as const;

export const toastItem = {
  root: "group pointer-events-auto relative flex w-[356px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border border-border bg-popover p-4 text-sm text-popover-foreground shadow-lg outline-none min-h-14 [translate:var(--x)_var(--y)] [scale:var(--scale,1)] [z-index:var(--z-index)] opacity-[var(--opacity)] [will-change:translate,opacity,scale] [transition:translate_400ms,scale_400ms,opacity_400ms] [transition-timing-function:cubic-bezier(0.21,1.02,0.73,1)] data-[state=closed]:[transition:translate_400ms,scale_400ms,opacity_200ms] focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[type=error]:border-destructive/50 data-[type=error]:text-destructive",
  iconSuccess: "mt-0.5 size-4 shrink-0 relative z-[1] text-emerald-500",
  iconError: "mt-0.5 size-4 shrink-0 relative z-[1] text-destructive",
  iconWarning: "mt-0.5 size-4 shrink-0 relative z-[1] text-amber-500",
  iconInfo: "mt-0.5 size-4 shrink-0 relative z-[1] text-blue-500",
  iconLoading: "mt-0.5 size-4 shrink-0 relative z-[1] animate-spin text-muted-foreground",
  body: "relative z-[1] flex min-w-0 flex-1 flex-col gap-1",
  title: "font-medium leading-none",
  description: "text-sm text-muted-foreground",
  action: "relative z-[1] inline-flex h-8 shrink-0 items-center rounded-md border border-border bg-transparent px-3 text-xs font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  close: "relative z-[1] shrink-0 rounded-xs text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  closeIcon: "size-4",
} as const;
