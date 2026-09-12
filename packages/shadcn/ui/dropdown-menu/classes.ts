export const dropdownMenu = {
  content:
    "mu-dropdown-menu-content mu-menu-target mu-menu-translucent z-50 max-h-(--radix-dropdown-menu-content-available-height) w-(--radix-dropdown-menu-trigger-width) origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto data-closed:overflow-hidden",
  separator: "mu-dropdown-menu-separator",
  label: "mu-dropdown-menu-label",
  checkboxItem:
    "mu-dropdown-menu-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  itemIndicator: "mu-dropdown-menu-item-indicator pointer-events-none",
  shortcut: "mu-dropdown-menu-shortcut",
  radioItem:
    "mu-dropdown-menu-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  subTrigger:
    "mu-dropdown-menu-sub-trigger flex cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  subTriggerIcon: "mu-rtl-flip ml-auto",
  item: "mu-dropdown-menu-item group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
} as const;

export const submenu = {
  content:
    "mu-dropdown-menu-sub-content mu-menu-target mu-menu-translucent z-50 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden",
  separator: "mu-dropdown-menu-separator",
  label: "mu-dropdown-menu-label",
  item: "mu-dropdown-menu-item group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  shortcut: "mu-dropdown-menu-shortcut",
} as const;
