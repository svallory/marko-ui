export type AlertVariant = "default" | "destructive";

export interface AlertVariants {
  variant?: AlertVariant;
}

const base =
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2 py-1.5 text-left text-xs/relaxed has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-1.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-3.5";

const variantClasses: Record<AlertVariant, string> = {
  default: "bg-card text-card-foreground",
  destructive:
    "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
};

export function alertVariants({ variant }: AlertVariants = {}): string {
  return `${base} ${variantClasses[variant ?? "default"]}`;
}
