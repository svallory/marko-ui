export const button = {
  base: "mu-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  variant: {
    default: "mu-button-variant-default",
    outline: "mu-button-variant-outline",
    secondary: "mu-button-variant-secondary",
    ghost: "mu-button-variant-ghost",
    destructive: "mu-button-variant-destructive",
    link: "mu-button-variant-link",
  },
  size: {
    default: "mu-button-size-default",
    xs: "mu-button-size-xs",
    sm: "mu-button-size-sm",
    lg: "mu-button-size-lg",
    icon: "mu-button-size-icon",
    "icon-xs": "mu-button-size-icon-xs",
    "icon-sm": "mu-button-size-icon-sm",
    "icon-lg": "mu-button-size-icon-lg",
  },
} as const;
