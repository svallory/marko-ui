export const toggle = {
  base: "mu-toggle group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  variant: {
    default: "mu-toggle-variant-default",
    outline: "mu-toggle-variant-outline",
  },
  size: {
    default: "mu-toggle-size-default",
    sm: "mu-toggle-size-sm",
    lg: "mu-toggle-size-lg",
  },
} as const;
