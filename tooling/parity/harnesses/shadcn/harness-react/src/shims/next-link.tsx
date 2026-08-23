/**
 * next/link shim — a plain anchor. The example files that import this
 * (breadcrumb-*, button-as-child, navigation-menu-demo) only use it for its
 * `href` + children, no client-side routing behavior is under test here.
 */
import * as React from "react"

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
}

export default function Link({ href, ...props }: LinkProps) {
  return <a href={href} {...props} />
}
