import { describe, expect, it } from "vitest"
// The CLI's own schema module — packages/marko-ui/package.json publishes
// this exact file tree under the "./schema" export, so validating against
// the workspace source is validating against what `marko-ui@latest` ships.
import { registryItemSchema } from "../../packages/marko-ui/src/registry/schema.ts"
import { REGISTRY_URL } from "./lib/env"
import { retryOnce } from "./lib/proc"

async function fetchJson(url: string) {
  return retryOnce(async () => {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`GET ${url} -> ${res.status}`)
    }
    return res.json()
  })
}

// Journey: fetch style + component JSONs from the live registry, schema-
// validate them, and check for the specific defect this suite's other
// journeys found live in the deployed registry (see AGENTS.md "Acceptance
// suite" — the marker documented there).
describe("registry health", () => {
  it("style.json (index.json) is reachable and schema-shaped", async () => {
    const index = await fetchJson(`${REGISTRY_URL}/index.json`)
    expect(Array.isArray(index)).toBe(true)
    expect(index.length).toBeGreaterThan(0)
  })

  it("button.json validates against registryItemSchema", async () => {
    const item = await fetchJson(`${REGISTRY_URL}/button.json`)
    const parsed = registryItemSchema.safeParse(item)
    expect(
      parsed.success,
      parsed.success ? "" : JSON.stringify(parsed.error?.issues, null, 2)
    ).toBe(true)
  })

  it("switch.json validates against registryItemSchema", async () => {
    const item = await fetchJson(`${REGISTRY_URL}/switch.json`)
    const parsed = registryItemSchema.safeParse(item)
    expect(
      parsed.success,
      parsed.success ? "" : JSON.stringify(parsed.error?.issues, null, 2)
    ).toBe(true)
  })

  // Stable marker for "does the deployed registry match the current
  // component-authoring pattern": every zag-machine component's source
  // moved to a single `<zag/api=... from=input/>` tag when the old
  // <machine-props>/<service>/<connect> three-tag wiring was retired
  // (AGENTS.md "The SSR-safe Zag pattern"). A registry serving the old
  // shape means the deploy is stale relative to `main`, even though the
  // registry-drift CI check (which only diffs the *workspace* build
  // output) stays green.
  it("switch.json's component source uses the current <zag> tag, not the retired three-tag wiring", async () => {
    const item = await fetchJson(`${REGISTRY_URL}/switch.json`)
    const file = item.files?.find((f: { path: string }) =>
      f.path.endsWith("switch.marko")
    )
    expect(file, "switch.json has no switch.marko file entry").toBeTruthy()
    expect(
      file.content,
      "live registry served the pre-<zag>-migration three-tag wiring (<machine-props>/<service>/<connect>) for switch.marko — this means the Coolify registry deploy is stale relative to the current main branch. See report-acceptance.md."
    ).toContain("<zag/api=")
  })
})
