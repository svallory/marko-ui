export const colorPicker = {
  root: "flex w-56 flex-col gap-2",
  label: "text-sm leading-none font-medium select-none data-[disabled]:opacity-50",
  control: "flex items-center gap-2",
  trigger:
    "border-input focus-visible:border-ring focus-visible:ring-ring/50 relative size-9 shrink-0 overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
  triggerSwatch: "absolute inset-0 size-full",
  transparencyGridRounded: "rounded-full",
  valueText: "text-foreground truncate font-mono text-sm tabular-nums",
  content:
    "bg-popover text-popover-foreground z-50 flex w-64 flex-col gap-3 rounded-md border p-3 shadow-md outline-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
  area: "h-32 w-full overflow-hidden rounded-md",
  areaBackground: "size-full",
  areaThumb:
    "ring-ring/50 size-4 rounded-full border-2 border-white shadow-sm outline-none focus-visible:ring-[3px]",
  row: "flex items-center gap-2",
  eyeDropperTrigger:
    "border-input hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex size-8 shrink-0 items-center justify-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
  eyeDropperIcon: "size-4",
  channelSlidersWrapper: "flex min-w-0 flex-1 flex-col gap-2",
  channelSlider: "h-3 w-full",
  channelSliderTrack: "h-3 w-full rounded-full",
  channelSliderThumb:
    "ring-ring/50 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm outline-none focus-visible:ring-[3px]",
  formatSelect:
    "border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 h-8 shrink-0 rounded-md border px-1.5 text-xs uppercase shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]",
  channelInputWrapper: "flex min-w-0 flex-1 flex-col gap-1",
  channelInput:
    "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full min-w-0 rounded-md border bg-transparent px-2 text-center font-mono text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
  channelInputLabel: "text-muted-foreground text-center text-[10px] uppercase",
  swatchGroup: "flex flex-wrap gap-1.5",
  swatchTrigger:
    "border-input focus-visible:border-ring focus-visible:ring-ring/50 size-6 overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
  swatch: "size-full",
  swatchIndicator: "flex size-full items-center justify-center text-white mix-blend-difference",
  swatchIndicatorIcon: "size-3.5",
} as const;
