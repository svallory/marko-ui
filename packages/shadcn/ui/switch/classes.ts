// "switch" is a reserved word; the slug convention yields "switchStyles" for reserved-word slugs
export const switchStyles = {
  label: "inline-flex items-center gap-2",
  control:
    "mu-switch peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
  thumb: "mu-switch-thumb pointer-events-none block ring-0 transition-transform",
  text: "text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
} as const;
