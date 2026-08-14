export type ItemVariant = "default" | "outline" | "muted";
export type ItemSize = "default" | "sm" | "xs";
export type ItemMediaVariant = "default" | "icon" | "image";

export interface ItemVariants {
  variant?: ItemVariant;
  size?: ItemSize;
}

export interface ItemMediaVariants {
  variant?: ItemMediaVariant;
}

const base =
  "group/item flex w-full flex-wrap items-center rounded-lg border text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-muted";

const variantClasses: Record<ItemVariant, string> = {
  default: "border-transparent",
  outline: "border-border",
  muted: "border-transparent bg-muted/50",
};

const sizeClasses: Record<ItemSize, string> = {
  default: "gap-2.5 px-3 py-2.5",
  sm: "gap-2.5 px-3 py-2.5",
  xs: "gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0",
};

export function itemVariants({ variant, size }: ItemVariants = {}): string {
  return `${base} ${variantClasses[variant ?? "default"]} ${sizeClasses[size ?? "default"]}`;
}

const mediaBase =
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none";

const mediaVariantClasses: Record<ItemMediaVariant, string> = {
  default: "bg-transparent",
  icon: "[&_svg:not([class*='size-'])]:size-4",
  image:
    "size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover",
};

export function itemMediaVariants({ variant }: ItemMediaVariants = {}): string {
  return `${mediaBase} ${mediaVariantClasses[variant ?? "default"]}`;
}
