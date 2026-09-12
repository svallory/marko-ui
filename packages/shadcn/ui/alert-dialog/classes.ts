export const alertDialog = {
  overlay: "mu-alert-dialog-overlay fixed inset-0 z-50",
  positioner: "fixed inset-0 z-50 flex items-center justify-center p-4",
  content: "mu-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none",
  header: "mu-alert-dialog-header",
  media: "mu-alert-dialog-media",
  title: "mu-alert-dialog-title mu-font-heading",
  description: "mu-alert-dialog-description",
  footer: "mu-alert-dialog-footer flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
  cancel: "mu-alert-dialog-cancel",
  action: "mu-alert-dialog-action",
} as const;
