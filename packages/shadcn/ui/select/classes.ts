export const select = {
  fieldLabel: "text-sm font-medium",
  fieldLabelSrOnly: "sr-only",
  trigger:
    "mu-select-trigger flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  triggerIcon: "mu-select-trigger-icon pointer-events-none",
  content:
    "mu-select-content mu-menu-target mu-menu-translucent relative z-50 max-h-(--available-height) overflow-x-hidden overflow-y-auto origin-(--transform-origin) data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
  scrollUpButton: "mu-select-scroll-up-button",
  scrollDownButton: "mu-select-scroll-down-button",
  scrollButtonIcon: "size-4",
  viewport: "mu-select-viewport",
  group: "mu-select-group",
  groupLabel: "mu-select-label",
  separator: "mu-select-separator pointer-events-none",
  item: "mu-select-item relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  itemIndicator: "mu-select-item-indicator",
  itemIndicatorIcon: "mu-select-item-indicator-icon pointer-events-none",
} as const;
