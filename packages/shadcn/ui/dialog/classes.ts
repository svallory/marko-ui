export const dialog = {
  overlay: "mu-dialog-overlay fixed inset-0 z-50",
  positioner: "fixed inset-0 z-50 flex items-center justify-center",
  content:
    "mu-dialog-content fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none",
  header: "mu-dialog-header flex flex-col",
  title: "mu-dialog-title mu-font-heading",
  description: "mu-dialog-description",
  footer: "mu-dialog-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
  close: "mu-dialog-close",
  srOnly: "sr-only",
} as const;
