/**
 * Drawer content classes, keyed on the machine's PHYSICAL swipe direction
 * (`data-swipe-direction`, emitted by getContentProps) rather than on a raw
 * prop — Zag resolves the logical `start`/`end` directions against `dir`, so
 * reading the data attribute back off the api is the only correct source.
 *
 * base-mira parity: class strings below are copied verbatim (per axis/side)
 * from shadcn styles/base-mira/ui/drawer.tsx's DrawerPrimitive.Popup
 * className, which is a single big string built from base + nested + bleed +
 * sizing + stack + transition + per-axis + per-direction chunks. Base UI's
 * Drawer primitive drives layout through those same axis/direction data
 * attributes (data-swipe-axis, data-swipe-direction) that Zag also emits, so
 * the selectors transfer directly — only the copy is reorganized here into
 * cva variants (one per direction) instead of one flat template string,
 * since our port has no single element carrying every direction's
 * data-[swipe-direction=X] selector simultaneously.
 *
 * TRANSFORM OWNERSHIP: Zag writes an inline
 * `transform: translate3d(var(--drawer-translate-x), var(--drawer-translate-y), 0)`
 * on the content and drives drag/snap by rewriting those custom properties.
 * What must NEVER happen is a `style=` attribute of our own on this element:
 * that would replace Zag's transform + all `--drawer-*` vars on every
 * recompute.
 */
export type DrawerSwipeDirection = "up" | "down" | "left" | "right";

export interface DrawerContentVariants {
  swipeDirection?: DrawerSwipeDirection;
}

const contentBase =
  "group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) flex h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) min-h-0 w-(--drawer-content-width,auto) transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)_scale(var(--stack-scale))] flex-col rounded-xl border border-popover bg-popover text-xs/relaxed text-popover-foreground transition-[transform,height,opacity,filter] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform outline-none select-none [--drawer-bleed-background:transparent] [--drawer-inset:--spacing(2)] [interpolate-size:allow-keywords] dark:border-border" +
  " data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-95" +
  " after:pointer-events-none after:absolute after:bg-(--drawer-bleed-background,var(--color-popover)) data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-(--bleed) data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-(--bleed) data-[swipe-direction=down]:after:top-full data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:after:left-full data-[swipe-direction=up]:after:bottom-full" +
  " [--drawer-content-height:var(--drawer-height,auto)] data-[swipe-axis=x]:[--drawer-content-width:75%] data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-6rem)] data-[swipe-axis=y]:data-snap-points:[--drawer-content-height:100dvh] data-[swipe-axis=x]:sm:[--drawer-content-width:24rem]" +
  " [--bleed:3rem] [--peek:1rem] [--stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-scale-base:max(0,calc(1-(var(--nested-drawers)*var(--stack-step))))] [--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--stack-shrink:calc(1-var(--stack-scale))] [--stack-step:0.05]" +
  " data-ending-style:transform-(--closed-transform) data-ending-style:opacity-[0.9999] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-nested-drawer-swiping:duration-0 data-ending-style:data-nested-drawer-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:transform-(--closed-transform) data-swiping:duration-0 data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)]";

const directionClasses: Record<DrawerSwipeDirection, string> = {
  down:
    "inset-x-0 data-nested-drawer-open:h-(--stack-height)" +
    " bottom-0 origin-bottom [--closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)] [--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--stack-shrink)*var(--stack-height)))]",
  up:
    "inset-x-0 data-nested-drawer-open:h-(--stack-height)" +
    " top-0 origin-top [--closed-transform:translate3d(0,calc(-100%-var(--drawer-inset,0px)-2px),0)] [--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--stack-shrink)*var(--stack-height)))]",
  left:
    "inset-y-0 flex-row" +
    " left-0 origin-left [--closed-transform:translate3d(calc(-100%-var(--drawer-inset,0px)-2px),0,0)] [--translate-x:calc(var(--drawer-swipe-movement-x)+var(--stack-peek-offset)+(var(--stack-shrink)*100%))]",
  right:
    "inset-y-0 flex-row" +
    " right-0 origin-right [--closed-transform:translate3d(calc(100%+var(--drawer-inset,0px)+2px),0,0)] [--translate-x:calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)-(var(--stack-shrink)*100%))]",
};

export function drawerContentVariants({
  swipeDirection = "down",
}: DrawerContentVariants = {}): string {
  return `${contentBase} ${directionClasses[swipeDirection]}`;
}

/**
 * base-mira has no dedicated grabber/handle component class targeted by
 * direction in the same way as the default (vaul-style) port — its
 * equivalent is DrawerSwipeHandle, which base-mira only renders when
 * `showSwipeHandle` is true and styles with axis/direction data-attribute
 * selectors (group-data-[swipe-axis=...], group-data-[swipe-direction=...])
 * rather than per-direction branches, because a single element's classes
 * must cover every axis/direction combination at once via CSS attribute
 * selectors instead of a JS-side switch. Reproduced as one cva "axis"
 * variant (x/y) to mirror that grouping while keeping the per-direction
 * ordering/justify rules verbatim as always-on classes (they are already
 * scoped by their own data-[swipe-direction=...] selector so they don't
 * conflict across directions).
 */
export type DrawerSwipeAxis = "x" | "y";

export interface DrawerGrabberVariants {
  swipeDirection?: DrawerSwipeDirection;
}

const grabberBase =
  "relative z-10 flex shrink-0 cursor-grab transition-opacity duration-200 group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100" +
  " group-data-[swipe-axis=x]/drawer-popup:h-full group-data-[swipe-axis=x]/drawer-popup:w-3 group-data-[swipe-axis=x]/drawer-popup:items-center" +
  " group-data-[swipe-axis=y]/drawer-popup:h-3 group-data-[swipe-axis=y]/drawer-popup:w-full group-data-[swipe-axis=y]/drawer-popup:justify-center" +
  " group-data-[swipe-direction=down]/drawer-popup:items-end" +
  " group-data-[swipe-direction=left]/drawer-popup:order-last group-data-[swipe-direction=left]/drawer-popup:justify-start" +
  " group-data-[swipe-direction=right]/drawer-popup:justify-end" +
  " group-data-[swipe-direction=up]/drawer-popup:order-last group-data-[swipe-direction=up]/drawer-popup:items-start" +
  " active:cursor-grabbing";

export function drawerGrabberVariants(_props: DrawerGrabberVariants = {}): string {
  return grabberBase;
}

export interface DrawerGrabberIndicatorVariants {
  swipeDirection?: DrawerSwipeDirection;
}

const grabberIndicatorBase =
  "block shrink-0 rounded-full bg-muted" +
  " group-data-[swipe-axis=x]/drawer-popup:h-12 group-data-[swipe-axis=x]/drawer-popup:w-1" +
  " group-data-[swipe-axis=y]/drawer-popup:h-1 group-data-[swipe-axis=y]/drawer-popup:w-12";

export function drawerGrabberIndicatorVariants(
  _props: DrawerGrabberIndicatorVariants = {},
): string {
  return grabberIndicatorBase;
}
