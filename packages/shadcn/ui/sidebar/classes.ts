export const content = {
  root: "mu-sidebar-content flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden",
} as const;

export const footer = {
  root: "mu-sidebar-footer flex flex-col",
} as const;

export const groupAction = {
  root: "mu-sidebar-group-action flex aspect-square items-center justify-center outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>svg]:shrink-0",
} as const;

export const groupContent = {
  root: "mu-sidebar-group-content w-full",
} as const;

export const groupLabel = {
  root: "mu-sidebar-group-label flex shrink-0 items-center outline-hidden [&>svg]:shrink-0",
} as const;

export const group = {
  root: "mu-sidebar-group relative flex w-full min-w-0 flex-col",
} as const;

export const header = {
  root: "mu-sidebar-header flex flex-col",
} as const;

export const input = {
  root: "mu-sidebar-input",
} as const;

export const inset = {
  root: "mu-sidebar-inset relative flex w-full flex-1 flex-col",
} as const;

export const menuAction = {
  root: "mu-sidebar-menu-action flex items-center justify-center outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>svg]:shrink-0",
  showOnHover:
    "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0",
} as const;

export const menuBadge = {
  root: "mu-sidebar-menu-badge flex items-center justify-center tabular-nums select-none group-data-[collapsible=icon]:hidden",
} as const;

export const menuItem = {
  root: "group/menu-item relative",
} as const;

export const menuSkeleton = {
  root: "mu-sidebar-menu-skeleton flex items-center",
  icon: "mu-sidebar-menu-skeleton-icon",
  text: "mu-sidebar-menu-skeleton-text max-w-(--skeleton-width) flex-1",
} as const;

export const menuSubButton = {
  root: "mu-sidebar-menu-sub-button flex min-w-0 -translate-x-px items-center overflow-hidden outline-hidden group-data-[collapsible=icon]:hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:shrink-0",
} as const;

export const menuSubItem = {
  root: "group/menu-sub-item relative",
} as const;

export const menuSub = {
  root: "mu-sidebar-menu-sub flex min-w-0 flex-col",
} as const;

export const menu = {
  root: "mu-sidebar-menu flex w-full min-w-0 flex-col",
} as const;

export const provider = {
  root: "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
} as const;

export const rail = {
  root: "mu-sidebar-rail absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2 in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize [[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar [[data-side=left][data-collapsible=offcanvas]_&]:-right-2 [[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
} as const;

export const separator = {
  root: "mu-sidebar-separator w-auto",
} as const;

export const sidebar = {
  rootFixed:
    "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
  wrapper: "group peer hidden text-sidebar-foreground md:block",
  gap: "mu-sidebar-gap relative w-(--sidebar-width) bg-transparent group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180",
  gapFloatingIcon:
    "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]",
  gapDefaultIcon: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
  container:
    "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",
  containerFloating:
    "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]",
  containerDefault:
    "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
  inner: "mu-sidebar-inner flex size-full flex-col",
} as const;

export const menuButton = {
  base: "mu-sidebar-menu-button peer/menu-button group/menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
  variant: {
    default: "mu-sidebar-menu-button-variant-default",
    outline: "mu-sidebar-menu-button-variant-outline",
  },
  size: {
    default: "mu-sidebar-menu-button-size-default",
    sm: "mu-sidebar-menu-button-size-sm",
    lg: "mu-sidebar-menu-button-size-lg",
  },
} as const;

export const trigger = {
  root: "mu-sidebar-trigger",
  icon: "mu-rtl-flip size-4",
  srOnly: "sr-only",
} as const;
