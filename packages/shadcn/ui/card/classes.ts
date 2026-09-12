export const card = {
  root: "mu-card group/card flex flex-col",
} as const;

export const header = {
  root: "mu-card-header group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
} as const;

export const title = {
  root: "mu-card-title mu-font-heading",
} as const;

export const description = {
  root: "mu-card-description",
} as const;

export const action = {
  root: "mu-card-action col-start-2 row-span-2 row-start-1 self-start justify-self-end",
} as const;

export const content = {
  root: "mu-card-content",
} as const;

export const footer = {
  root: "mu-card-footer flex items-center",
} as const;
