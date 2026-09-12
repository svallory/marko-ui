export const nativeSelect = {
  wrapper: "mu-native-select-wrapper group/native-select relative w-fit has-[select:disabled]:opacity-50",
  select: "mu-native-select outline-none disabled:pointer-events-none disabled:cursor-not-allowed",
  icon: "mu-native-select-icon pointer-events-none absolute select-none",
} as const;

export const nativeSelectOptgroup = {
  root: "bg-[Canvas] text-[CanvasText]",
} as const;

export const nativeSelectOption = {
  root: "bg-[Canvas] text-[CanvasText]",
} as const;
