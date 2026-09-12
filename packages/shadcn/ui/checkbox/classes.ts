export const checkbox = {
  root: "inline-flex items-center gap-2 text-sm leading-none",
  rootDisabled: "cursor-not-allowed opacity-50",
  control: "mu-checkbox peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  indicator: "mu-checkbox-indicator grid place-content-center text-current transition-none",
  icon: "size-3.5 [stroke-width:3]",
} as const;
