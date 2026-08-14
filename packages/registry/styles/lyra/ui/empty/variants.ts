export type EmptyMediaVariant = "default" | "icon";

export interface EmptyMediaVariants {
  variant?: EmptyMediaVariant;
}

const base =
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0";

const variantClasses: Record<EmptyMediaVariant, string> = {
  default: "bg-transparent",
  icon: "flex size-8 shrink-0 items-center justify-center rounded-none bg-muted text-foreground [&_svg:not([class*='size-'])]:size-4",
};

export function emptyMediaVariants({ variant }: EmptyMediaVariants = {}): string {
  return `${base} ${variantClasses[variant ?? "default"]}`;
}
