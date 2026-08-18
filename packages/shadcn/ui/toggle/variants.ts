import { cva, type VariantProps } from "class-variance-authority";

export const toggleVariants = cva(
  "mu-toggle group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "mu-toggle-variant-default",
        outline: "mu-toggle-variant-outline",
      },
      size: {
        default: "mu-toggle-size-default",
        sm: "mu-toggle-size-sm",
        lg: "mu-toggle-size-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ToggleVariants = VariantProps<typeof toggleVariants>;
