export const message = {
  root: "mu-message group/message relative flex w-full min-w-0 data-[align=end]:flex-row-reverse",
} as const;

export const avatar = {
  root: "mu-message-avatar flex w-fit shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted",
} as const;

export const content = {
  root: "mu-message-content flex w-full min-w-0 flex-col wrap-break-word",
} as const;

export const footer = {
  root: "mu-message-footer flex max-w-full min-w-0 items-center group-data-[align=end]/message:justify-end",
} as const;

export const group = {
  root: "mu-message-group flex min-w-0 flex-col",
} as const;

export const header = {
  root: "mu-message-header flex max-w-full min-w-0 items-center",
} as const;
