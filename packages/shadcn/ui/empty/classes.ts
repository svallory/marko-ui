export const empty = {
  root: "mu-empty flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance",
} as const;

export const media = {
  base: "mu-empty-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  variant: {
    default: "mu-empty-media-default",
    icon: "mu-empty-media-icon",
  },
} as const;

export const header = {
  root: "mu-empty-header flex max-w-sm flex-col items-center",
} as const;

export const title = {
  root: "mu-empty-title mu-font-heading",
} as const;

export const description = {
  root: "mu-empty-description text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
} as const;

export const content = {
  root: "mu-empty-content flex w-full max-w-sm min-w-0 flex-col items-center text-balance",
} as const;
