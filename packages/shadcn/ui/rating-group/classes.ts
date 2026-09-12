export const ratingGroup = {
  root: "flex flex-col gap-1.5",
  label: "text-sm leading-none font-medium select-none",
  control: "inline-flex items-center gap-0.5",
  item: "relative inline-flex text-muted-foreground [&_svg]:size-5 data-[disabled]:cursor-not-allowed data-[readonly]:cursor-default data-[state=unchecked]:opacity-60",
  halfIcon: "absolute inset-0 text-foreground",
  iconHighlighted: "text-foreground",
} as const;
