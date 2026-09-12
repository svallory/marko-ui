export const inputOtp = {
  root: "mu-input-otp flex items-center has-disabled:opacity-50",
  group: "mu-input-otp-group flex items-center",
  separator: "mu-input-otp-separator flex items-center",
  slot: "mu-input-otp-slot relative flex items-center justify-center has-focus:z-10",
  input: "mu-input-otp-input peer border-input size-9 rounded-md border text-center text-sm shadow-xs outline-none focus:ring-[3px] focus:ring-ring/50 focus:border-ring disabled:cursor-not-allowed caret-transparent",
  caret: "mu-input-otp-caret pointer-events-none absolute inset-0 hidden items-center justify-center peer-[:focus:not([data-filled])]:flex",
  caretLine: "mu-input-otp-caret-line animate-caret-blink bg-foreground h-4 w-px duration-1000",
} as const;
