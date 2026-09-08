// Everything a journey needs to target either the live registry/npm or a
// staging registry/pre-release tag, per brief criterion 2.
export const REGISTRY_URL =
  process.env.ACCEPTANCE_REGISTRY_URL ?? "https://marko-ui.saulo.tech/r"

export const PKG_VERSION = process.env.ACCEPTANCE_PKG_VERSION ?? "latest"

export const CLI_SPEC = `marko-ui@${PKG_VERSION}`
export const SHADCN_SPEC = `@marko-ui/shadcn@${PKG_VERSION}`

// Registry env var forwarded to the CLI itself (packages/marko-ui/src/registry/constants.ts
// reads REGISTRY_URL, not ACCEPTANCE_REGISTRY_URL) so a staging target actually
// gets exercised end to end, not just fetched for the health checks.
export const cliEnv = {
  ...process.env,
  REGISTRY_URL,
}
