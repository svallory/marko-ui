export const attachment = {
  base: "mu-attachment group/attachment relative flex max-w-full min-w-0 shrink-0 flex-wrap border bg-card text-card-foreground transition-colors has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-destructive/30 data-[state=idle]:border-dashed",
  size: {
    default: "mu-attachment-size-default",
    sm: "mu-attachment-size-sm",
    xs: "mu-attachment-size-xs",
  },
  orientation: {
    horizontal: "mu-attachment-orientation-horizontal items-center",
    vertical: "mu-attachment-orientation-vertical flex-col",
  },
  media: {
    base: "mu-attachment-media relative flex aspect-square shrink-0 items-center justify-center overflow-hidden group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive [&_svg]:pointer-events-none",
    variant: {
      icon: "mu-attachment-media-variant-icon",
      image: "mu-attachment-media-variant-image *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
    },
  },
} as const;

export const action = {
  root: "mu-attachment-action",
} as const;

export const actions = {
  root: "mu-attachment-actions flex shrink-0 items-center",
} as const;

export const content = {
  root: "mu-attachment-content max-w-full min-w-0 flex-1",
} as const;

export const description = {
  root: "mu-attachment-description block min-w-0 truncate text-muted-foreground group-data-[state=error]/attachment:text-destructive/80",
  maxWidth: "max-w-full",
} as const;

export const group = {
  root: "mu-attachment-group flex min-w-0 scroll-fade-x snap-x snap-mandatory scrollbar-none overflow-x-auto overscroll-x-contain *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start",
} as const;

export const title = {
  root: "mu-attachment-title block max-w-full min-w-0 truncate group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer",
} as const;

export const trigger = {
  root: "mu-attachment-trigger absolute inset-0 z-10 outline-none",
} as const;
