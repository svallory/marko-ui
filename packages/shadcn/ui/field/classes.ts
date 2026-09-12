export const field = {
  base: "mu-field group/field flex w-full",
  orientation: {
    vertical: "mu-field-orientation-vertical flex-col *:w-full [&>.sr-only]:w-auto",
    horizontal:
      "mu-field-orientation-horizontal flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
    responsive:
      "mu-field-orientation-responsive flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
  },
} as const;

export const fieldContent = {
  root: "mu-field-content group/field-content flex flex-1 flex-col leading-snug",
} as const;

export const fieldDescription = {
  root: "mu-field-description leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance",
  spacing: "last:mt-0 nth-last-2:-mt-1",
  links: "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
} as const;

export const fieldError = {
  root: "mu-field-error font-normal",
  list: "ml-4 flex list-disc flex-col gap-1",
} as const;

export const fieldGroup = {
  root: "mu-field-group group/field-group @container/field-group flex w-full flex-col",
} as const;

export const fieldLabel = {
  root: "mu-field-label group/field-label peer/field-label flex w-fit",
  nested: "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
} as const;

export const fieldLegend = {
  root: "mu-field-legend",
} as const;

export const fieldSeparator = {
  root: "mu-field-separator relative",
  line: "absolute inset-0 top-1/2",
  content: "mu-field-separator-content relative mx-auto block w-fit bg-background",
} as const;

export const fieldSet = {
  root: "mu-field-set flex flex-col",
} as const;

export const fieldTitle = {
  root: "mu-field-title flex w-fit items-center",
} as const;
