export type SheetSide = "top" | "right" | "bottom" | "left";

export interface SheetVariants {
  side?: SheetSide;
}

// Ported verbatim from shadcn styles/base-mira/ui/sheet.tsx: the base-mira
// source keeps every side's classes in ONE data-[side=...] conditional
// string on a single element (Base UI evaluates all four data-[side=*]
// selectors against whichever data-side value is present), rather than a
// cva() per-variant map. We replicate that shape as a single template
// string returned regardless of `side`, matching the tsx character for
// character — the lookup below only selects the "sm:max-w-*" tail that the
// tsx also leaves side-independent (it's identical for left/right and absent
// for top/bottom in the source).
const base =
  "fixed z-50 flex flex-col bg-popover bg-clip-padding text-xs/relaxed text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm";

export function sheetVariants(_variants: SheetVariants = {}): string {
  return base;
}
