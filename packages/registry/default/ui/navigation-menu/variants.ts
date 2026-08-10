import { cva, type VariantProps } from "class-variance-authority";

export const navigationMenuTriggerStyle = cva(
  "bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
);

export type NavigationMenuTriggerVariants = VariantProps<typeof navigationMenuTriggerStyle>;
