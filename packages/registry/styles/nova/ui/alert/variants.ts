export type AlertVariant = "default" | "destructive";

export interface AlertVariants {
  variant?: AlertVariant;
}

const base =
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4";

const variantClasses: Record<AlertVariant, string> = {
  default: "bg-card text-card-foreground",
  destructive:
    "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
};

export function alertVariants({ variant }: AlertVariants = {}): string {
  return `${base} ${variantClasses[variant ?? "default"]}`;
}
