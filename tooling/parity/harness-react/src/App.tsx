import { Suspense, lazy, useMemo } from "react"
// @ts-expect-error -- virtual module supplied by the parity-demo-registry
// Vite plugin in vite.config.ts, generated from the resolved upstream
// clone's registry/new-york-v4/examples/ directory listing.
import { demoLoaders } from "virtual:demo-registry"

/**
 * Every example file in the clone's registry/new-york-v4/examples/
 * directory, lazily. Keyed by basename without extension (e.g.
 * "drawer-demo"), matching the `name` shadcn's own
 * `<ComponentPreview name="...">` MDX tags use — the same demo-name
 * vocabulary tooling/parity/coverage.ts already extracts.
 *
 * Sourced from a generated virtual module rather than a compile-time
 * `import.meta.glob` string because the clone's absolute path varies by
 * machine (env var / hyperspace sibling / repo-local .upstream/); the
 * plugin resolves that path once and bakes a static glob into the
 * generated module, so demo code-splitting still works per-route (a
 * drawer-demo visit doesn't pull in every other demo's recharts/vaul/etc.
 * imports).
 */
const demosByName = new Map<string, () => Promise<{ default: React.ComponentType }>>(
  Object.entries(demoLoaders as Record<string, () => Promise<{ default: React.ComponentType }>>)
)

function parseDemoName(): string | null {
  const match = /^\/demo\/([\w-]+)\/?$/.exec(window.location.pathname)
  return match?.[1] ?? null
}

function NotFound({ demoName }: { demoName: string | null }) {
  return (
    <div style={{ padding: 24, fontFamily: "monospace" }}>
      {demoName === null
        ? 'no demo route matched — expected "/demo/<name>"'
        : `unknown demo "${demoName}" — not found under registry/new-york-v4/examples/`}
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
  const Demo = lazy(loader)

  return (
    <div
      data-parity-demo={demoName}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <Suspense fallback={null}>
        <Demo />
      </Suspense>
    </div>
  )
}
