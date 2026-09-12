export const sheet = {
  overlay:
    "mu-sheet-overlay fixed inset-0 z-50 duration-100 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
  positioner: "contents",
  content:
    "mu-sheet-content data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[side=bottom]:data-[state=open]:slide-in-from-bottom-10 data-[side=left]:data-[state=open]:slide-in-from-left-10 data-[side=right]:data-[state=open]:slide-in-from-right-10 data-[side=top]:data-[state=open]:slide-in-from-top-10 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[side=bottom]:data-[state=closed]:slide-out-to-bottom-10 data-[side=left]:data-[state=closed]:slide-out-to-left-10 data-[side=right]:data-[state=closed]:slide-out-to-right-10 data-[side=top]:data-[state=closed]:slide-out-to-top-10",
  header: "mu-sheet-header flex flex-col",
  title: "mu-sheet-title mu-font-heading",
  description: "mu-sheet-description",
  footer: "mu-sheet-footer mt-auto flex flex-col",
  close: "mu-sheet-close",
  srOnly: "sr-only",
} as const;
