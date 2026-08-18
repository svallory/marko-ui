import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "mu-badge group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "mu-badge-variant-default",
        secondary: "mu-badge-variant-secondary",
        destructive: "mu-badge-variant-destructive",
        outline: "mu-badge-variant-outline",
        ghost: "mu-badge-variant-ghost",
        link: "mu-badge-variant-link",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
