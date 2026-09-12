export const bubble = {
  base: "mu-bubble group/bubble relative flex w-fit min-w-0 flex-col",
  variant: {
    default: "mu-bubble-variant-default",
    secondary: "mu-bubble-variant-secondary",
    muted: "mu-bubble-variant-muted",
    tinted: "mu-bubble-variant-tinted",
    outline: "mu-bubble-variant-outline",
    ghost: "mu-bubble-variant-ghost",
    destructive: "mu-bubble-variant-destructive",
  },
  reactions: {
    base: "mu-bubble-reactions absolute z-10 flex w-fit items-center justify-center",
    side: {
      top: "mu-bubble-reactions-side-top",
      bottom: "mu-bubble-reactions-side-bottom",
    },
    align: {
      start: "mu-bubble-reactions-align-start",
      end: "mu-bubble-reactions-align-end",
    },
  },
} as const;

export const bubbleContent = {
  root: "mu-bubble-content w-fit max-w-full min-w-0 overflow-hidden wrap-break-word [button]:text-left [button,a]:transition-colors",
} as const;

export const bubbleGroup = {
  root: "mu-bubble-group flex min-w-0 flex-col",
} as const;
