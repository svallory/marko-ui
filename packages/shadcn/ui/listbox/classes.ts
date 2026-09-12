export const listbox = {
  root: "flex flex-col gap-1.5",
  label: "text-sm font-medium",
  content:
    "bg-popover text-popover-foreground max-h-80 w-full min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-xs",
  item:
    "data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
} as const;
