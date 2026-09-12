export const menubar = {
  root: "mu-menubar flex items-center",
} as const;

export const menu = {
  trigger: "mu-menubar-trigger flex items-center outline-hidden select-none",
  content:
    "mu-menubar-content mu-menu-target mu-menu-translucent z-50 origin-(--radix-menubar-content-transform-origin) overflow-hidden",
  separator: "mu-menubar-separator -mx-1 my-1 h-px",
  label: "mu-menubar-label",
  checkboxItem:
    "mu-menubar-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  checkboxItemIndicator:
    "mu-menubar-checkbox-item-indicator pointer-events-none absolute flex items-center justify-center",
  shortcut: "mu-menubar-shortcut ml-auto",
  radioItem:
    "mu-menubar-radio-item relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  radioItemIndicator:
    "mu-menubar-radio-item-indicator pointer-events-none absolute flex items-center justify-center",
  subTrigger: "mu-menubar-sub-trigger flex cursor-default items-center outline-none select-none",
  subTriggerIcon: "mu-rtl-flip ml-auto size-4",
  item: "mu-menubar-item group/menubar-item relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
} as const;

export const submenu = {
  content:
    "mu-menubar-sub-content mu-menu-target mu-menu-translucent z-50 origin-(--radix-menubar-content-transform-origin) overflow-hidden",
  separator: "mu-menubar-separator -mx-1 my-1 h-px",
  label: "mu-menubar-label",
  item: "mu-menubar-item group/menubar-item relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  shortcut: "mu-menubar-shortcut ml-auto",
} as const;
