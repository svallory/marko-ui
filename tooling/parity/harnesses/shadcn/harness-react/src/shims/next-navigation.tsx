/**
 * next/navigation shim — no-op stand-ins for Next's routing hooks. The
 * example files that import this only read pathname/params for active-
 * link highlighting or similar cosmetic branching, never for navigation
 * this harness needs to actually perform (there is no router here — each
 * demo is a standalone route rendered in isolation, see PROTOCOL.md's
 * "GET /demo/<name>" contract).
 */
export function usePathname(): string {
  return typeof window !== "undefined" ? window.location.pathname : "/"
}

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: () => {},
  }
}

export function useSearchParams(): URLSearchParams {
  return typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams()
}

export function useParams(): Record<string, string | string[]> {
  return {}
}
