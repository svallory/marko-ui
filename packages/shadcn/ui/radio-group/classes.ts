export const radioGroup = {
  root: "mu-radio-group w-full",
  itemWrapper: "flex items-center gap-2",
  item:
    "mu-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  indicator: "mu-radio-group-indicator",
  indicatorIcon: "mu-radio-group-indicator-icon",
  itemText:
    "text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
} as const;
