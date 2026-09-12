export const tagsInput = {
  root: "flex flex-col gap-1.5",
  label: "text-sm font-medium",
  control: "border-input flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-3 py-1.5 shadow-xs transition-[color,box-shadow] has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 has-[input:focus]:ring-[3px] data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted data-[invalid]:border-destructive data-[invalid]:ring-destructive/20 dark:data-[invalid]:ring-destructive/40",
  item: "inline-flex items-center rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:bg-muted data-[disabled]:text-muted-foreground",
  itemPreview: "inline-flex items-center gap-1",
  itemDeleteTrigger: "inline-flex size-3.5 shrink-0 items-center justify-center rounded-sm outline-none hover:bg-secondary-foreground/20 focus-visible:ring-[3px] focus-visible:ring-ring/50",
  itemDeleteIcon: "size-3",
  itemDeleteSrOnly: "sr-only",
  itemInput: "w-[--width] min-w-4 bg-transparent text-xs outline-none",
  input: "h-6 min-w-20 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
} as const;
