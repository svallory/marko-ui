import { cva, type VariantProps } from "class-variance-authority";

/**
 * Drawer content classes, keyed on the machine's PHYSICAL swipe direction
 * (`data-swipe-direction`, emitted by getContentProps) rather than on a raw
 * prop — Zag resolves the logical `start`/`end` directions against `dir`, so
 * reading the data attribute back off the api is the only correct source.
 *
 * TRANSFORM OWNERSHIP: Zag writes an inline
 * `transform: translate3d(var(--drawer-translate-x), var(--drawer-translate-y), 0)`
 * on the content and drives drag/snap by rewriting those custom properties.
 * The enter/exit keyframes from tw-animate-css animate `transform` directly,
 * which legitimately overrides the inline declaration only WHILE the animation
 * runs and then hands back to Zag's inline transform at its rest value. The
 * machine additionally sets `animation: none !important` on the content while
 * a drag is in flight, so keyframes and dragging never fight. What must NEVER
 * happen is a `style=` attribute of our own on this element: that would
 * replace Zag's transform + all `--drawer-*` vars on every recompute.
 */
export const drawerContentVariants = cva(
  [
    "bg-background fixed z-50 flex outline-none",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=open]:duration-300 data-[state=closed]:duration-200",
    // Zag inlines `transition-duration: 0s` while dragging so the content
    // tracks the pointer exactly; the release then animates back.
    "transition-transform ease-out",
  ],
  {
    variants: {
      swipeDirection: {
        // The flex AXIS follows the swipe axis, so the grabber sits on the
        // draggable edge and the header/body/footer column fills the rest.
        down: [
          "inset-x-0 bottom-0 mx-auto mt-24 max-h-[82vh] w-full max-w-lg flex-col rounded-t-[10px] border-t",
          "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        ],
        up: [
          "inset-x-0 top-0 mx-auto mb-24 max-h-[82vh] w-full max-w-lg flex-col-reverse rounded-b-[10px] border-b",
          "data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
        ],
        left: [
          "inset-y-0 left-0 w-3/4 max-w-sm flex-row-reverse rounded-r-[10px] border-r",
          "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
        ],
        right: [
          "inset-y-0 right-0 w-3/4 max-w-sm flex-row rounded-l-[10px] border-l",
          "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
        ],
      },
    },
    defaultVariants: {
      swipeDirection: "down",
    },
  },
);

export type DrawerContentVariants = VariantProps<typeof drawerContentVariants>;

/** Grab-handle wrapper; orientation follows the same physical direction. */
export const drawerGrabberVariants = cva(
  "group/grabber shrink-0 cursor-grab touch-none active:cursor-grabbing",
  {
    variants: {
      swipeDirection: {
        down: "flex justify-center pt-4 pb-2",
        up: "flex justify-center pt-2 pb-4",
        left: "flex flex-col justify-center pr-2 pl-4",
        right: "flex flex-col justify-center pr-4 pl-2",
      },
    },
    defaultVariants: {
      swipeDirection: "down",
    },
  },
);

/** The visible pill inside the grabber (vaul's signature handle bar). */
export const drawerGrabberIndicatorVariants = cva(
  "bg-muted group-active/grabber:bg-muted-foreground/40 rounded-full transition-colors",
  {
    variants: {
      swipeDirection: {
        down: "h-2 w-[100px]",
        up: "h-2 w-[100px]",
        left: "h-[100px] w-2",
        right: "h-[100px] w-2",
      },
    },
    defaultVariants: {
      swipeDirection: "down",
    },
  },
);
