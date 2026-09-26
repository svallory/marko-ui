export const pagination = {
  root: "mu-pagination mx-auto flex w-full justify-center",
} as const;

export const content = {
  root: "mu-pagination-content flex items-center",
} as const;

export const link = {
  root: "mu-pagination-link",
} as const;

export const previous = {
  root: "mu-pagination-previous",
  icon: "mu-rtl-flip",
  text: "mu-pagination-previous-text hidden sm:block",
} as const;

export const next = {
  root: "mu-pagination-next",
  icon: "mu-rtl-flip",
  text: "mu-pagination-next-text hidden sm:block",
} as const;

export const ellipsis = {
  root: "mu-pagination-ellipsis flex items-center justify-center",
  srOnly: "sr-only",
} as const;
