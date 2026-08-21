/**
 * next-themes shim — the parity harness always forces light theme (see
 * App.tsx), so `useTheme()` is stubbed to report "light" and a no-op
 * setter. Only mode-toggle.tsx uses this; it is not one of the demos this
 * harness targets, but the import must resolve or Vite's module graph
 * fails for anyone who pulls it in transitively.
 */
export function useTheme() {
  return { theme: "light", setTheme: () => {}, resolvedTheme: "light", themes: ["light", "dark"] }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return children
}
