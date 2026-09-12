export const avatar = {
  root: "mu-avatar group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten",
  image: "mu-avatar-image aspect-square size-full object-cover",
  fallback: "mu-avatar-fallback flex size-full items-center justify-center group-data-[size=sm]/avatar:text-xs",
} as const;

export const badge = {
  root: "mu-avatar-badge absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none",
  sizeSm: "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
  sizeDefault: "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
  sizeLg: "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
} as const;

export const group = {
  root: "mu-avatar-group group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
} as const;

export const groupCount = {
  root: "mu-avatar-group-count relative flex shrink-0 items-center justify-center ring-2 ring-background",
} as const;
