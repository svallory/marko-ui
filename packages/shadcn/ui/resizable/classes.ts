export const resizable = {
  panelGroup: "mu-resizable-panel-group flex h-full w-full data-[orientation=vertical]:flex-col",
  handle: "mu-resizable-handle relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-1 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:translate-x-0 data-[orientation=vertical]:after:-translate-y-1/2 [&[data-orientation=vertical]>div]:rotate-90",
  handleIcon: "mu-resizable-handle-icon z-10 flex shrink-0",
  handleIconSvg: "size-2.5",
} as const;
