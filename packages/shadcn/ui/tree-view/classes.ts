export const treeView = {
  root: "w-full",
  tree: "flex flex-col gap-0.5",
  chevron:
    "text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200 [[data-state=open]>&]:rotate-90",
  branchControl:
    "focus-visible:ring-ring/50 flex items-center gap-1 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  branchIndicator: "flex items-center justify-center",
  branchText: "truncate",
  branchContent: "flex flex-col",
  item:
    "focus-visible:ring-ring/50 flex cursor-pointer items-center gap-1 truncate rounded-md px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  itemText: "truncate",
} as const;
