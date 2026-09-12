export const drawer = {
  swipeArea:
    "fixed z-40 data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:h-6 data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:h-6 data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-6 data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-6",
  overlay:
    "mu-drawer-overlay fixed inset-0 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
  positioner: "fixed inset-0 z-50",
  content:
    "mu-drawer-content group/drawer-content fixed z-50 flex outline-none",
  contentSwipeDown:
    "data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:mt-24 data-[swipe-direction=down]:max-h-[80vh] data-[swipe-direction=down]:flex-col data-[swipe-direction=down]:sm:mx-auto data-[swipe-direction=down]:sm:max-w-lg",
  contentSwipeUp:
    "data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:mb-24 data-[swipe-direction=up]:max-h-[80vh] data-[swipe-direction=up]:flex-col-reverse data-[swipe-direction=up]:sm:mx-auto data-[swipe-direction=up]:sm:max-w-lg",
  contentSwipeLeft:
    "data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:flex-row-reverse data-[swipe-direction=left]:sm:max-w-sm",
  contentSwipeRight:
    "data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:flex-row data-[swipe-direction=right]:sm:max-w-sm",
  grabber:
    "group/grabber shrink-0 cursor-grab touch-none active:cursor-grabbing data-[swipe-direction=down]:flex data-[swipe-direction=down]:justify-center data-[swipe-direction=down]:pt-4 data-[swipe-direction=down]:pb-2 data-[swipe-direction=up]:flex data-[swipe-direction=up]:justify-center data-[swipe-direction=up]:pt-2 data-[swipe-direction=up]:pb-4 data-[swipe-direction=left]:flex data-[swipe-direction=left]:flex-col data-[swipe-direction=left]:justify-center data-[swipe-direction=left]:pr-2 data-[swipe-direction=left]:pl-4 data-[swipe-direction=right]:flex data-[swipe-direction=right]:flex-col data-[swipe-direction=right]:justify-center data-[swipe-direction=right]:pr-4 data-[swipe-direction=right]:pl-2",
  grabberIndicator:
    "mu-drawer-handle bg-muted rounded-full transition-colors group-active/grabber:bg-muted-foreground/40 data-[swipe-direction=down]:h-2 data-[swipe-direction=down]:w-[100px] data-[swipe-direction=up]:h-2 data-[swipe-direction=up]:w-[100px] data-[swipe-direction=left]:h-[100px] data-[swipe-direction=left]:w-2 data-[swipe-direction=right]:h-[100px] data-[swipe-direction=right]:w-2",
  inner: "flex min-h-0 min-w-0 flex-1 flex-col",
  header:
    "mu-drawer-header flex flex-col group-data-[swipe-direction=down]/drawer-content:text-center group-data-[swipe-direction=up]/drawer-content:text-center",
  title: "mu-drawer-title mu-font-heading",
  description: "mu-drawer-description",
  body: "min-h-0 flex-1 overflow-auto px-4",
  footer: "mu-drawer-footer mt-auto flex flex-col gap-2 p-4",
  close: "absolute top-4 right-4",
  srOnly: "sr-only",
} as const;
