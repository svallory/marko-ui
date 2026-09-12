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
  contentInner:
    "mu-accordion-content-inner h-(--marko-accordion-content-height) [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
} as const;
