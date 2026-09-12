export const breadcrumb = {
  root: "mu-breadcrumb",
  list: "mu-breadcrumb-list flex flex-wrap items-center wrap-break-word",
} as const;

export const item = {
  root: "mu-breadcrumb-item inline-flex items-center",
} as const;

export const link = {
  root: "mu-breadcrumb-link",
} as const;

export const page = {
  root: "mu-breadcrumb-page",
} as const;

export const separator = {
  root: "mu-breadcrumb-separator",
  icon: "mu-rtl-flip",
} as const;

export const ellipsis = {
  root: "mu-breadcrumb-ellipsis flex items-center justify-center",
  icon: "size-4",
  srOnly: "sr-only",
} as const;
