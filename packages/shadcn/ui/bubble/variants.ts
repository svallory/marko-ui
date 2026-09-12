import { cva, type VariantProps } from "class-variance-authority";
import { bubble } from "./classes.ts";

export const bubbleVariants = cva(bubble.base, {
  variants: {
    variant: bubble.variant,
  },
  defaultVariants: {
    variant: "default",
  },
});

export type BubbleVariants = VariantProps<typeof bubbleVariants>;

export const bubbleReactionsVariants = cva(bubble.reactions.base, {
  variants: {
    side: bubble.reactions.side,
    align: bubble.reactions.align,
  },
  defaultVariants: {
    side: "bottom",
    align: "end",
  },
});

export type BubbleReactionsVariants = VariantProps<typeof bubbleReactionsVariants>;
