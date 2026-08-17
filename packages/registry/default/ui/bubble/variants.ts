import { cva, type VariantProps } from "class-variance-authority";

export const bubbleVariants = cva(
  "mu-bubble group/bubble relative flex w-fit min-w-0 flex-col",
  {
    variants: {
      variant: {
        default: "mu-bubble-variant-default",
        secondary: "mu-bubble-variant-secondary",
        muted: "mu-bubble-variant-muted",
        tinted: "mu-bubble-variant-tinted",
        outline: "mu-bubble-variant-outline",
        ghost: "mu-bubble-variant-ghost",
        destructive: "mu-bubble-variant-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BubbleVariants = VariantProps<typeof bubbleVariants>;

export const bubbleReactionsVariants = cva(
  "mu-bubble-reactions absolute z-10 flex w-fit items-center justify-center",
  {
    variants: {
      side: {
        top: "mu-bubble-reactions-side-top",
        bottom: "mu-bubble-reactions-side-bottom",
      },
      align: {
        start: "mu-bubble-reactions-align-start",
        end: "mu-bubble-reactions-align-end",
      },
    },
    defaultVariants: {
      side: "bottom",
      align: "end",
    },
  },
);

export type BubbleReactionsVariants = VariantProps<typeof bubbleReactionsVariants>;
