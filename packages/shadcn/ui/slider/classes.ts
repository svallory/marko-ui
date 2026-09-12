export const slider = {
  root: "mu-slider relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
  control:
    "relative flex grow touch-none items-center select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:flex-col",
  track:
    "mu-slider-track relative grow overflow-hidden data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
  range:
    "mu-slider-range absolute select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
  thumb:
    "mu-slider-thumb block shrink-0 select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
} as const;
