export const accordion = {
  root: "mu-accordion flex w-full flex-col",
  item: "mu-accordion-item",
  header: "flex",
  trigger:
    "mu-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none disabled:pointer-events-none disabled:opacity-50",
  triggerIcon:
    "mu-accordion-trigger-icon pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden",
  triggerIconActive:
    "mu-accordion-trigger-icon pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline",
  content: "mu-accordion-content overflow-hidden",
  // NO height here. `--marko-accordion-content-height` is an OUTPUT of the
  // ResizeObserver in accordion.marko (which measures this panel's
  // `scrollHeight`) and an input to the `marko-accordion-down`/`-up`
  // keyframes only. Setting it as this element's own `height` fed the
  // measurement back in as the input to the thing being measured: once a
  // value was published, the inner div was locked to it, so the panel's
  // `scrollHeight` reported that stale number instead of the content's real
  // height and the observer could never correct itself. Any reflow that
  // changes the content's natural height but not the panel's box — a style
  // layer with different type metrics (lyra is `text-xs`/12px-16px where
  // nova is `text-sm`/14px-20px), a late font load, i18n text — was then
  // permanently stuck at the height measured under the PREVIOUS layout.
  // Measured on /create/preview: swapping nova -> lyra left the panel at
  // nova's 90px when lyra's correct height is 74px; with this height
  // removed the observer republishes 74px. Upstream shadcn's inner div is
  // `pt-0 pb-4` with no height at all, so this is also parity, not a
  // divergence. See e2e/gallery-visual.spec.ts for the guard.
  contentInner:
    "mu-accordion-content-inner [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
} as const;
