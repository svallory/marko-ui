export const toc = {
  root: "relative text-sm",
  title: "mb-3 font-medium text-foreground",
  list: "relative space-y-2 border-l border-border",
  indicator: "w-px bg-foreground transition-[top,height] duration-200 [top:var(--top)] [height:var(--height)]",
  item: "pl-[calc(0.75rem*var(--depth))]",
  link:
    "block text-muted-foreground transition-colors hover:text-foreground data-[active]:font-medium data-[active]:text-foreground",
} as const;
