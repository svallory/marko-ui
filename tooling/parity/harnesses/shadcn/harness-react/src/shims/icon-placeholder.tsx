/**
 * @/app/(create)/components/icon-placeholder shim.
 *
 * Upstream's real IconPlaceholder is the "Create" design-playground's
 * live icon-library switcher (lucide/tabler/hugeicons/phosphor/remixicon,
 * chosen via a `nuqs` URL search param and a `DesignSystemProvider`
 * context this harness has no reason to boot). No `base/*.mdx` component
 * doc page — the ones this harness screenshots — ever exposes that
 * switcher; the real site always renders the `lucide` variant there. This
 * shim renders the same thing unconditionally: the named lucide-react
 * icon from the `lucide` prop, ignoring the other four library props.
 */
import * as LucideIcons from "lucide-react"
import type { ComponentProps } from "react"

type IconLibraryProps = {
  lucide?: string
  tabler?: string
  hugeicons?: string
  phosphor?: string
  remixicon?: string
} & ComponentProps<"svg">

export function IconPlaceholder({
  lucide,
  tabler: _tabler,
  hugeicons: _hugeicons,
  phosphor: _phosphor,
  remixicon: _remixicon,
  ...props
}: IconLibraryProps) {
  if (!lucide) return null
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<ComponentProps<"svg">>>)[lucide]
  if (!Icon) return null
  return <Icon {...props} />
}
