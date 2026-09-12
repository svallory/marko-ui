export const marker = {
  base: "mu-marker group/marker relative flex w-full items-center",
  variant: {
    default: "mu-marker-variant-default",
    separator: "mu-marker-variant-separator",
    border: "mu-marker-variant-border",
  },
} as const;

export const content = {
  root: "mu-marker-content min-w-0 wrap-break-word",
} as const;

export const icon = {
  root: "mu-marker-icon shrink-0",
} as const;
