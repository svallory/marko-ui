export const contextMenu = {
  trigger: "mu-context-menu-trigger select-none",
  content: "mu-context-menu-content mu-menu-target mu-menu-translucent z-50 max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto",
  separator: "mu-context-menu-separator",
  label: "mu-context-menu-label",
  checkboxItem: "mu-context-menu-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  radioItem: "mu-context-menu-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  itemIndicator: "mu-context-menu-item-indicator pointer-events-none",
  shortcut: "mu-context-menu-shortcut",
  subTrigger: "mu-context-menu-sub-trigger flex cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  subTriggerIcon: "mu-rtl-flip ml-auto",
  item: "mu-context-menu-item group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
} as const;

export const submenu = {
  subContent: "mu-context-menu-sub-content mu-menu-target mu-menu-translucent z-50 origin-(--radix-context-menu-content-transform-origin) overflow-hidden",
  separator: "mu-context-menu-separator",
  label: "mu-context-menu-label",
  item: "mu-context-menu-item group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  shortcut: "mu-context-menu-shortcut",
} as const;
