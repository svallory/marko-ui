export const imageCropper = {
  root: "bg-muted relative w-full overflow-hidden rounded-lg border shadow-xs",
  viewport: "relative size-full touch-none",
  image: "absolute inset-0 m-auto max-h-full max-w-full select-none",
  selection:
    "border-background border-2 shadow-[0_0_0_9999px_var(--color-black)]/50 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[shape=circle]:rounded-full data-[disabled]:cursor-not-allowed",
  gridHorizontal: "border-background/60 border-y",
  gridVertical: "border-background/60 border-x",
  handle:
    "bg-background ring-foreground/20 size-3 rounded-full shadow-sm ring-1 data-[position=e]:h-auto data-[position=w]:h-auto data-[position=n]:w-auto data-[position=s]:w-auto data-[position=e]:w-1.5 data-[position=w]:w-1.5 data-[position=n]:h-1.5 data-[position=s]:h-1.5 data-[position=e]:rounded-full data-[position=w]:rounded-full data-[position=n]:rounded-full data-[position=s]:rounded-full data-[position=e]:bg-transparent data-[position=w]:bg-transparent data-[position=n]:bg-transparent data-[position=s]:bg-transparent data-[position=e]:ring-0 data-[position=w]:ring-0 data-[position=n]:ring-0 data-[position=s]:ring-0 data-[disabled]:opacity-40",
} as const;
