export const alert = {
  base: "mu-alert group/alert relative w-full",
  variant: {
    default: "mu-alert-variant-default",
    destructive: "mu-alert-variant-destructive",
  },
} as const;

export const title = {
  root: "mu-alert-title [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
} as const;

export const description = {
  root: "mu-alert-description [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
} as const;

export const action = {
  root: "mu-alert-action",
} as const;
