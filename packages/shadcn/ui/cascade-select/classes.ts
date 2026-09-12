export const cascadeSelect = {
  label: "text-sm font-medium",
  labelSrOnly: "sr-only",
  trigger: "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9",
  indicatorIcon: "size-4 opacity-50",
  content: "bg-popover text-popover-foreground relative z-50 flex overflow-hidden rounded-md border shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
  list: "min-w-[8rem] overflow-x-hidden overflow-y-auto border-r p-1 last:border-r-0",
  item: "focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 relative flex w-full cursor-default items-center justify-between gap-2 rounded-sm py-1.5 pr-2 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  itemChevron: "size-3.5 opacity-50",
  itemIndicator: "flex size-3.5 items-center justify-center",
  itemIndicatorIcon: "size-4",
} as const;
