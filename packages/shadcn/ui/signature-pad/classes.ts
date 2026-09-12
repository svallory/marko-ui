export const signaturePad = {
  root: "bg-card text-card-foreground flex w-full max-w-sm flex-col gap-2 rounded-xl border p-4 shadow-sm",
  label: "text-sm font-medium",
  control: "border-input bg-muted/30 relative h-32 w-full overflow-hidden rounded-md border",
  clearTrigger: "absolute top-1 right-1 size-7",
  clearIcon: "size-4",
  guide: "border-border pointer-events-none absolute right-4 bottom-6 left-4 border-b border-dashed",
  srOnly: "sr-only",
} as const;
