export const editable = {
  root: "flex items-center gap-1.5",
  area: "flex-1",
  input: "border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  preview: "flex h-9 w-full min-w-0 items-center rounded-md border border-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none hover:bg-accent/50 data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[placeholder-shown]:text-muted-foreground md:text-sm",
  control: "flex items-center gap-1",
  submitTrigger: "border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex size-8 shrink-0 items-center justify-center gap-2 rounded-md border shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
  cancelTrigger: "border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex size-8 shrink-0 items-center justify-center gap-2 rounded-md border shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
  editTrigger: "border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex size-8 shrink-0 items-center justify-center gap-2 rounded-md border shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
  srOnly: "sr-only",
} as const;
