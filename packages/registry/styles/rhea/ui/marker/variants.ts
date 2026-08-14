export type MarkerVariant = "default" | "separator" | "border";

export interface MarkerVariants {
  variant?: MarkerVariant;
}

const base =
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground";

const variantClasses: Record<MarkerVariant, string> = {
  default: "",
  separator:
    "before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border",
  border: "border-b border-border pb-2",
};

export function markerVariants({ variant }: MarkerVariants = {}): string {
  return `${base} ${variantClasses[variant ?? "default"]}`;
}
