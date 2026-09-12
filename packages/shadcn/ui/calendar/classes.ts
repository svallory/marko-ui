export const calendar = {
  root: "mu-calendar group/calendar bg-background in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
  content: "relative flex flex-col gap-4",
  nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
  navTrigger: "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
  rtlFlip: "mu-rtl-flip",
  srOnly: "sr-only",
  dropdowns: "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
  dropdownRoot: "mu-calendar-dropdown-root relative rounded-(--cell-radius)",
  monthSelect: "absolute inset-0 bg-popover opacity-0",
  captionLabel:
    "mu-calendar-caption-label flex items-center gap-1 rounded-(--cell-radius) text-sm font-medium select-none [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
  yearSelect: "absolute inset-0 bg-popover opacity-0",
  viewTrigger: "mu-calendar-caption text-sm font-medium select-none",
  table: "w-full border-collapse",
  headerRow: "flex",
  headerCell: "w-(--cell-size) flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
  weekRow: "mt-2 flex w-full",
  cell:
    "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:has([data-in-range])]:bg-muted first:[&:has([data-in-range])]:rounded-l-(--cell-radius) last:[&:has([data-in-range])]:rounded-r-(--cell-radius)",
  dayButton:
    "mu-calendar-day-button relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal text-foreground data-[today]:bg-muted data-[outside-range]:text-muted-foreground data-[outside-range]:opacity-50 group-data-[focus]/day:relative group-data-[focus]/day:z-10 group-data-[focus]/day:border-ring group-data-[focus]/day:ring-[3px] group-data-[focus]/day:ring-ring/50 data-[range-end]:rounded-(--cell-radius) data-[range-end]:rounded-r-(--cell-radius) data-[range-end]:bg-primary data-[range-end]:text-primary-foreground data-[in-range]:rounded-none data-[in-range]:bg-muted data-[in-range]:text-foreground data-[range-start]:rounded-(--cell-radius) data-[range-start]:rounded-l-(--cell-radius) data-[range-start]:bg-primary data-[range-start]:text-primary-foreground data-selected:bg-primary data-selected:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:text-foreground",
} as const;
