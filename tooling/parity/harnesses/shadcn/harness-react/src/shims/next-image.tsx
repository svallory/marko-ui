/**
 * next/image shim — a handful of upstream example files (aspect-ratio-demo,
 * item-header, item-image, scroll-area-horizontal-demo) import
 * `next/image`'s `Image` component purely for its `src/alt/fill/className`
 * props with no Next-server-only behavior in play (no `loader`, no
 * `placeholder="blur"`); a plain `<img>` renders pixel-identically for
 * those props. `fill` maps to absolute-inset-0 sizing the way next/image's
 * `fill` prop does visually.
 */
import * as React from "react"

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "fill"> {
  fill?: boolean
  priority?: boolean
}

export default function Image({ fill, priority, style, ...props }: ImageProps) {
  void priority
  return (
    <img
      {...props}
      style={
        fill
          ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
          : style
      }
    />
  )
}
