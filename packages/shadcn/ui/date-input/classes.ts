export const dateInput = {
  root: "flex flex-col gap-1",
  control:
    "border-input flex h-9 w-fit min-w-0 items-center gap-1 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
  controlFocus:
    "has-[[data-part=segment-group][data-focus=true]]:border-ring has-[[data-part=segment-group][data-focus=true]]:ring-ring/50 has-[[data-part=segment-group][data-focus=true]]:ring-[3px]",
  controlInvalid:
    "data-[invalid=true]:ring-destructive/20 dark:data-[invalid=true]:ring-destructive/40 data-[invalid=true]:border-destructive",
  controlDisabled:
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
  rangeSeparator: "text-muted-foreground px-1 text-sm",
  label: "sr-only",
  segmentGroup: "flex items-center gap-0.5",
  segment: "rounded-sm px-0.5 tabular-nums outline-none",
  segmentPlaceholder: "data-[placeholder-shown=true]:text-muted-foreground",
  segmentEditable: "data-[editable=true]:focus:bg-accent data-[editable=true]:focus:text-accent-foreground",
} as const;
