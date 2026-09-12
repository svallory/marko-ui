export const item = {
  base: "mu-item group/item flex w-full flex-wrap items-center transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors",
  variant: {
    default: "mu-item-variant-default",
    outline: "mu-item-variant-outline",
    muted: "mu-item-variant-muted",
  },
  size: {
    default: "mu-item-size-default",
    sm: "mu-item-size-sm",
    xs: "mu-item-size-xs",
  },
  media: {
    base: "mu-item-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
    variant: {
      default: "mu-item-media-variant-default",
      icon: "mu-item-media-variant-icon",
      image: "mu-item-media-variant-image",
    },
  },
} as const;

export const actions = {
  root: "mu-item-actions flex items-center",
} as const;

export const content = {
  root: "mu-item-content flex flex-1 flex-col [&+[data-slot=item-content]]:flex-none",
} as const;

export const description = {
  root: "mu-item-description line-clamp-2 font-normal [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
} as const;

export const footer = {
  root: "mu-item-footer flex basis-full items-center justify-between",
} as const;

export const group = {
  root: "mu-item-group group/item-group flex w-full flex-col",
} as const;

export const header = {
  root: "mu-item-header flex basis-full items-center justify-between",
} as const;

export const separator = {
  root: "mu-item-separator",
  orientation:
    "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
} as const;

export const title = {
  root: "mu-item-title line-clamp-1 flex w-fit items-center",
} as const;
