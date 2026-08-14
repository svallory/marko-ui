export type InputGroupAddonAlign = "inline-start" | "inline-end" | "block-start" | "block-end";
export type InputGroupButtonSize = "xs" | "sm" | "icon-xs" | "icon-sm";

export interface InputGroupAddonVariants {
  align?: InputGroupAddonAlign;
}

export interface InputGroupButtonVariants {
  size?: InputGroupButtonSize;
}

const addonBase =
  "flex h-auto cursor-text items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 **:data-[slot=kbd]:rounded-none **:data-[slot=kbd]:bg-muted-foreground/10 **:data-[slot=kbd]:px-1.5 [&>svg:not([class*='size-'])]:size-3.5";

const addonAlignClasses: Record<InputGroupAddonAlign, string> = {
  "inline-start": "order-first",
  "inline-end": "order-last",
  "block-start":
    "order-first w-full justify-start pt-3 group-has-[>input]/input-group:pt-3.5 [.border-b]:pb-3.5",
  "block-end":
    "order-last w-full justify-start pb-3 group-has-[>input]/input-group:pb-3.5 [.border-t]:pt-3.5",
};

export function inputGroupAddonVariants({ align }: InputGroupAddonVariants = {}): string {
  return `${addonBase} ${addonAlignClasses[align ?? "inline-start"]}`;
}

const buttonBase = "flex items-center gap-2 rounded-none text-sm shadow-none";

const buttonSizeClasses: Record<InputGroupButtonSize, string> = {
  xs: "h-6 gap-1 rounded-none px-1.5 text-xs [&>svg:not([class*='size-'])]:size-3.5",
  sm: "",
  "icon-xs": "size-6 p-0 text-xs has-[>svg]:p-0",
  "icon-sm": "size-8 p-0 has-[>svg]:p-0",
};

export function inputGroupButtonVariants({ size }: InputGroupButtonVariants = {}): string {
  return `${buttonBase} ${buttonSizeClasses[size ?? "xs"]}`;
}
