export const passwordInput = {
  root: "grid w-full gap-1.5",
  label: "text-sm leading-none font-medium select-none",
  control: "relative flex items-center",
  input:
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-9 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  inputFocus: "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  inputInvalid: "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  visibilityTrigger:
    "text-muted-foreground hover:text-foreground absolute right-0 inline-flex size-9 shrink-0 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  srOnly: "sr-only",
} as const;
