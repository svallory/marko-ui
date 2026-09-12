export const numberInput = {
  root: "border-input dark:bg-input/30 flex h-9 w-fit items-stretch overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow] has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-ring/50 has-[input:focus-visible]:ring-[3px] has-[input:disabled]:pointer-events-none has-[input:disabled]:opacity-50 has-[input[aria-invalid=true]]:ring-destructive/20 dark:has-[input[aria-invalid=true]]:ring-destructive/40 has-[input[aria-invalid=true]]:border-destructive",
  decrement: "text-muted-foreground hover:bg-accent hover:text-accent-foreground flex w-8 shrink-0 items-center justify-center border-r border-input transition-colors disabled:pointer-events-none disabled:opacity-50",
  icon: "size-4",
  control: "relative flex-1",
  field: "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-full w-full min-w-0 bg-transparent px-3 py-1 text-center text-base outline-none disabled:cursor-not-allowed md:text-sm",
  scrubber: "absolute inset-x-0 bottom-0 z-10 h-1.5 data-[disabled]:hidden",
  increment: "text-muted-foreground hover:bg-accent hover:text-accent-foreground flex w-8 shrink-0 items-center justify-center border-l border-input transition-colors disabled:pointer-events-none disabled:opacity-50",
} as const;
