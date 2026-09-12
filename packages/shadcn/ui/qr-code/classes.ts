export const qrCode = {
  base: "relative inline-flex shrink-0 items-center justify-center",
  size: {
    sm: "size-24",
    default: "size-40",
    lg: "size-56",
  },
  frame: "h-full w-full",
  pattern: "fill-foreground",
  overlay: "flex items-center justify-center rounded-sm bg-background p-1 shadow-xs",
} as const;
