export type TabsVariant = "default" | "line";

export interface TabsListVariants {
  variant?: TabsVariant;
}

const base =
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-none p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none";

const variantClasses: Record<TabsVariant, string> = {
  default: "bg-muted",
  line: "gap-1 bg-transparent",
};

export function tabsListVariants({ variant }: TabsListVariants = {}): string {
  return `${base} ${variantClasses[variant ?? "default"]}`;
}
