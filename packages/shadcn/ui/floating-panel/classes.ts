export const floatingPanel = {
  positioner: "z-50",
  content: "bg-card text-card-foreground relative flex flex-col overflow-hidden rounded-xl border shadow-lg outline-none data-[dragging]:shadow-xl data-[behind]:opacity-95 data-[minimized]:h-auto! focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  header: "bg-muted/40 flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2",
  dragTrigger: "flex min-w-0 flex-1 items-center gap-2 data-[disabled]:cursor-default",
  title: "truncate text-sm leading-none font-semibold",
  control: "flex shrink-0 items-center gap-0.5",
  stageTrigger: "text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex size-6 items-center justify-center rounded-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  stageIcon: "size-3.5",
  body: "min-h-0 flex-1 overflow-auto p-4 text-sm",
  resizeTrigger: "z-10 data-[disabled]:pointer-events-none data-[axis=n]:h-1 data-[axis=s]:h-1 data-[axis=e]:w-1 data-[axis=w]:w-1 data-[axis=ne]:size-3 data-[axis=nw]:size-3 data-[axis=se]:size-3 data-[axis=sw]:size-3",
  srOnly: "sr-only",
} as const;
