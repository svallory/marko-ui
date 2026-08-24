import { Suspense, lazy, useMemo } from "react"
// @ts-expect-error -- virtual module supplied by the parity-demo-registry
// Vite plugin in vite.config.ts, generated from the resolved upstream
// clone's apps/v4/examples/base/ directory listing.
import { demoLoaders } from "virtual:demo-registry"

/**
 * Every example file in the clone's apps/v4/examples/base/ directory,
 * lazily. Keyed by basename without extension (e.g. "drawer-demo"),
 * matching the `name` shadcn's own `<ComponentPreview name="...">` MDX
 * tags use — the same demo-name vocabulary
 * tooling/parity/harnesses/shadcn/extract/ already extracts.
 *
 * Sourced from a generated virtual module rather than a compile-time
 * `import.meta.glob` string because the clone's absolute path varies by
 * machine (env var / hyperspace sibling / repo-local .upstream/); the
 * plugin resolves that path once and bakes a static glob into the
 * generated module, so demo code-splitting still works per-route (a
 * drawer-demo visit doesn't pull in every other demo's recharts/sonner/etc.
 * imports).
 *
 * Unlike the old registry/new-york-v4/examples tree (all default
 * exports), apps/v4/examples/base files mix default and single named
 * exports (see examples/README.md: "Both named exports and default
 * exports are supported") — resolveDemoModule below picks whichever this
 * module provides.
 */
const demosByName = new Map<string, () => Promise<Record<string, unknown>>>(
  Object.entries(demoLoaders as Record<string, () => Promise<Record<string, unknown>>>)
)

function resolveDemoModule(mod: Record<string, unknown>): React.ComponentType {
  if (typeof mod.default === "function") return mod.default as React.ComponentType
  const named = Object.values(mod).find((value) => typeof value === "function")
  if (!named) {
    throw new Error("resolveDemoModule: module has neither a default export nor a named function export")
  }
  return named as React.ComponentType
}

function parseDemoName(): string | null {
  const match = /^\/demo\/([\w-]+)\/?$/.exec(window.location.pathname)
  return match?.[1] ?? null
}

function NotFound({ demoName }: { demoName: string | null }) {
  return (
    <div style={{ padding: 24, fontFamily: "monospace" }}>
      {demoName === null
        ? 'no demo route matched — expected "/demo/<name>"'
        : `unknown demo "${demoName}" — not found under apps/v4/examples/base/`}
      <ul>
        {[...demosByName.keys()].sort().map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  )
}

export default function App() {
  const demoName = useMemo(parseDemoName, [])
  const loader = demoName ? demosByName.get(demoName) : undefined

  if (!loader) return <NotFound demoName={demoName} />

  // Lazy per-route so a bad demo name never touches React.lazy's module
  // cache for other names.
  const Demo = lazy(async () => ({ default: resolveDemoModule(await loader()) }))

  // Fit-content, top-left wrapper — NOT viewport-filling and NOT centered.
  // See PROTOCOL.md's "Tight content-box screenshot metric": both harnesses
  // must render this wrapper identically (same display mode, same fixed
  // padding, no min-height:100vh, no flex-centering) so the screenshot
  // target is the demo's actual rendered footprint, not a mostly-empty
  // viewport-sized canvas that dilutes real pixel differences to near
  // zero. `display: inline-block` makes the wrapper shrink-wrap its
  // content's width instead of stretching to the parent block's full
  // width, matching the marko-ui harness's own wrapper (see
  // tooling/parity/harnesses/marko-ui/src/routes/demo/$name/+page.marko).
  return (
    <div
      data-parity-demo={demoName}
      style={{
        display: "inline-block",
        padding: 32,
      }}
    >
      <Suspense fallback={null}>
        <Demo />
      </Suspense>
    </div>
  )
}
