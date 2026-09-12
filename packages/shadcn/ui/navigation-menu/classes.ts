export const navigationMenuTrigger = {
  base: "mu-navigation-menu-trigger group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none",
} as const;

export const navigationMenu = {
  base: "mu-navigation-menu group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
  triggerGroup: "group",
  triggerIcon: "mu-navigation-menu-trigger-icon",
  link: "mu-navigation-menu-link",
  list: "mu-navigation-menu-list group flex flex-1 list-none items-center justify-center",
  item: "mu-navigation-menu-item relative",
  indicator: "mu-navigation-menu-indicator top-full z-1 flex h-1.5 items-end justify-center overflow-hidden [width:var(--trigger-width)] [translate:var(--trigger-x)_0]",
  indicatorArrow: "mu-navigation-menu-indicator-arrow relative top-[60%] size-2 rotate-45",
  viewportPositioner: "mu-navigation-menu-viewport-wrapper absolute top-full left-0 isolate z-50 flex justify-center",
  viewport: "mu-navigation-menu-viewport origin-top-center relative mt-1.5 h-[var(--viewport-height)] w-[var(--viewport-width)] overflow-hidden",
  content: "mu-navigation-menu-content top-0 left-0 w-full **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none md:absolute md:w-auto",
  linksGrid: "grid gap-2",
  linksGridFeatured: "w-[500px] grid-cols-[.75fr_1fr]",
  linksGridPlain: "w-[400px]",
  plainList: "grid gap-1",
  plainListCols: "md:grid-cols-2",
  featuredTitle: "mt-4 mb-2 text-lg font-medium",
  featuredDescription: "text-muted-foreground text-sm leading-tight",
  plainTitle: "text-sm font-medium leading-none",
  plainDescription: "text-muted-foreground line-clamp-2 text-sm leading-snug",
} as const;
