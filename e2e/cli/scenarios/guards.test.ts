import { describe, expect } from "vitest"
import {
  cli,
  exists,
  makeWorkspace,
  markoApp,
  plain,
  read,
  readJson,
  tail,
  withShims,
  writeTree,
} from "./lib/harness"
import { scenario } from "./lib/scenario"

const REACT_COMPONENTS_JSON = {
  $schema: "https://ui.shadcn.com/schema.json",
  style: "new-york",
  rsc: true,
  tsx: true,
  tailwind: {
    config: "tailwind.config.ts",
    css: "app/globals.css",
    baseColor: "neutral",
    cssVariables: true,
  },
  aliases: { components: "@/components", utils: "@/lib/utils" },
}

function reactApp(ws: string) {
  writeTree(ws, {
    "package.json": {
      name: "react-app",
      dependencies: { react: "^19.0.0", "react-dom": "^19.0.0", next: "^15.0.0" },
    },
    "components.json": {
      ...REACT_COMPONENTS_JSON,
      registries: { "@acme": "https://acme.example/{name}.json" },
    },
    "app/globals.css": '@import "tailwindcss";\n',
    "tailwind.config.ts": "export default {}\n",
    // Lets `registry build` get past its own registry-file check to the
    // config load (the refusal being asserted).
    "registry.json": { name: "test", items: [] },
  })
}

describe("guards — refusals the CLI owes the user", () => {
  scenario("G01", "marko ^5 project: init exits 1 citing the Marko 6 upgrade; --force bypasses", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    const pkg = readJson(ws, "package.json")
    pkg.dependencies.marko = "^5.37.0"
    writeTree(ws, { "package.json": pkg })

    const shim = withShims(makeWorkspace("shim"))
    const r = await cli(ws, ["init"], { shim, timeoutMs: 30_000 })
    expect(r.timedOut, "init hung").toBe(false)
    expect(r.code, tail(r.out)).toBe(1)
    expect(plain(r.out)).toContain("marko-ui requires Marko 6")
    expect(plain(r.out)).toContain("markojs.com")
    expect(exists(ws, "components.json"), "init wrote into a refused project").toBe(false)

    const forced = await cli(ws, ["init", "--force"], { shim, timeoutMs: 30_000 })
    expect(forced.code, tail(forced.out)).toBe(0)
  })

  scenario("G02", "Tailwind v3 project: init exits 1 pointing at the upgrade tool with the project's runner; --force bypasses", async () => {
    const ws = makeWorkspace()
    markoApp(ws, {
      extra: {
        "tailwind.config.js": "export default {}\n",
        "src/styles/app.css": "@tailwind base;\n",
      },
    })
    const pkg = readJson(ws, "package.json")
    pkg.devDependencies.tailwindcss = "^3.4.0"
    writeTree(ws, { "package.json": pkg })

    const shim = withShims(makeWorkspace("shim"))
    const r = await cli(ws, ["init"], { shim, timeoutMs: 30_000 })
    expect(r.timedOut, "init hung").toBe(false)
    expect(r.code, tail(r.out)).toBe(1)
    expect(plain(r.out)).toContain("marko-ui requires Tailwind v4")
    // bun.lock fixture → the upgrade command uses bunx.
    expect(plain(r.out)).toContain("bunx @tailwindcss/upgrade")
    expect(exists(ws, "components.json"), "init wrote into a refused project").toBe(false)

    const forced = await cli(ws, ["init", "--force"], { shim, timeoutMs: 30_000 })
    expect(forced.code, tail(forced.out)).toBe(0)
  })

  scenario("G03", "shadcn/ui-for-React components.json: add exits 1 naming it and the --cwd hint, installs nothing", async () => {
    const ws = makeWorkspace()
    reactApp(ws)

    const shim = withShims(makeWorkspace("shim"))
    const r = await cli(ws, ["add", "button"], { shim, timeoutMs: 30_000 })
    expect(r.timedOut, "add hung").toBe(false)
    expect(r.code, tail(r.out)).toBe(1)
    expect(plain(r.out)).toContain("belongs to shadcn/ui for React")
    expect(plain(r.out)).toContain("--cwd <app>")
    expect(exists(ws, "components/ui/button"), "a component landed in a React project").toBe(false)
  })

  // One row per command that reads or writes components.json: each must exit 1
  // with the React refusal and leave the file byte-identical. Added after a
  // review found search/show/registry list swallowing the refusal and
  // registry add WRITING into the React config.
  scenario("G04", "every config-loading command refuses a React components.json, file byte-identical", async () => {
    const COMMANDS: string[][] = [
      ["status"],
      ["status", "--json"],
      ["add", "button"],
      ["diff"],
      ["doctor"],
      ["agents", "sync", "--no-skill"],
      ["eject"],
      ["search", "--query", "button"],
      ["show", "button"],
      ["registry", "build"],
      ["registry", "list"],
      ["registry", "add", "@new=https://example.invalid/r/{name}.json"],
      ["registry", "remove", "@acme"],
    ]
    for (const args of COMMANDS) {
      const label = args.join(" ")
      const ws = makeWorkspace()
      reactApp(ws)
      const before = read(ws, "components.json")

      const r = await cli(ws, args, { shim: withShims(makeWorkspace("shim")), timeoutMs: 30_000 })
      expect(r.timedOut, `${label} hung`).toBe(false)
      expect(r.code, `${label}\n${tail(r.out)}`).toBe(1)
      expect(plain(r.out), label).toContain("belongs to shadcn/ui for React")
      expect(read(ws, "components.json"), `${label} mutated the React components.json`).toBe(before)
    }
  })
})
