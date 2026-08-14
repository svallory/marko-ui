export type ToggleVariant = "default" | "outline";
export type ToggleSize = "default" | "sm" | "lg";

export interface ToggleVariants {
  variant?: ToggleVariant;
  size?: ToggleSize;
}

const base =
  "group/toggle inline-flex items-center justify-center gap-1.5 rounded-none text-xs font-semibold tracking-widest whitespace-nowrap uppercase transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5";

const variantClasses: Record<ToggleVariant, string> = {
  default: "bg-transparent",
  outline: "border border-input bg-transparent hover:bg-muted",
};

const sizeClasses: Record<ToggleSize, string> = {
  default: "h-10 min-w-10 px-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
  sm: "h-9 min-w-9 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
  lg: "h-11 min-w-11 px-8 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
};

export function toggleVariants({ variant, size }: ToggleVariants = {}): string {
  return `${base} ${variantClasses[variant ?? "default"]} ${sizeClasses[size ?? "default"]}`;
}
