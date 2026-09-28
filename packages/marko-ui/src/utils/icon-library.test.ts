import { cpSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { describe, expect, it } from "vitest"

import {
  applyIconLibrary,
  ICON_LIBRARIES,
  isIconLibraryName,
  renderIconResolver,
  type IconLibraryName,
} from "./icon-library"

const LIBRARIES = Object.keys(ICON_LIBRARIES) as IconLibraryName[]
const REAL_ICON_DIR = path.resolve(__dirname, "../../../shadcn/ui/icon")

const iconFile = (name: string, content = `// ${name}`) => ({
  path: `ui/icon/${name}`,
  type: "registry:file" as const,
  target: `~/src/components/ui/icon/${name}`,
  content,
})

// The icon item's file list as build-registry.ts emits it.
const iconItemFiles = () => [
  ...LIBRARIES.map((lib) => iconFile(`__${lib}__.ts`)),
  iconFile("client-swap.ts"),
  iconFile("icon-mapping.json", "{}"),
  iconFile("icon-names.ts"),
  iconFile("icon.marko"),
  iconFile("render.ts"),
  iconFile("resolve.ts", "// registry resolver"),
]

const paths = (files: ReturnType<typeof iconItemFiles> | undefined) =>
  (files ?? []).map((f) => path.basename(f.path)).sort()

describe("isIconLibraryName", () => {
  it.each(LIBRARIES)("accepts %s", (lib) => {
    expect(isIconLibraryName(lib)).toBe(true)
  })
  it.each(["heroicons", "", "LUCIDE", "toString", "__proto__", undefined, 3, null])(
    "rejects %s",
    (value) => {
      expect(isIconLibraryName(value)).toBe(false)
    }
  )
})

describe("applyIconLibrary", () => {
  it.each(LIBRARIES)("keeps only the %s map and drops switcher/data files", (lib) => {
    const out = applyIconLibrary(iconItemFiles(), lib)
    expect(paths(out as never)).toEqual(
      ["icon-names.ts", "icon.marko", "render.ts", "resolve.ts", `__${lib}__.ts`].sort()
    )
  })

  it.each(LIBRARIES)("rewrites resolve.ts to import only %s", (lib) => {
    const out = applyIconLibrary(iconItemFiles(), lib)!
    const resolve = out.find((f) => f.path.endsWith("resolve.ts"))!
    expect(resolve.content).toBe(renderIconResolver(lib))
    expect(resolve.content).toContain(`from "./__${lib}__.ts"`)
    for (const other of LIBRARIES.filter((l) => l !== lib)) {
      expect(resolve.content).not.toContain(`__${other}__`)
      expect(resolve.content).not.toContain(ICON_LIBRARIES[other].ident)
    }
  })

  it("preserves file target/type and leaves untouched files byte-identical", () => {
    const input = iconItemFiles()
    const out = applyIconLibrary(input, "tabler")!
    for (const name of ["icon.marko", "render.ts", "icon-names.ts"]) {
      expect(out.find((f) => f.path.endsWith(name))).toEqual(
        input.find((f) => f.path.endsWith(name))
      )
    }
    const resolve = out.find((f) => f.path.endsWith("resolve.ts"))!
    expect(resolve.target).toBe("~/src/components/ui/icon/resolve.ts")
    expect(resolve.type).toBe("registry:file")
  })

  it("does not mutate its input", () => {
    const input = iconItemFiles()
    const snapshot = JSON.stringify(input)
    applyIconLibrary(input, "phosphor")
    expect(JSON.stringify(input)).toBe(snapshot)
  })

  it("leaves non-icon files alone, including lookalike paths", () => {
    const others = [
      { path: "ui/button/button.marko", type: "registry:ui" as const, content: "a" },
      { path: "ui/button/resolve.ts", type: "registry:file" as const, target: "~/x", content: "b" },
      { path: "ui/icons-extra/__lucide__.ts", type: "registry:file" as const, target: "~/x", content: "c" },
      { path: "lib/utils.ts", type: "registry:lib" as const, content: "d" },
    ]
    expect(applyIconLibrary(others, "tabler")).toEqual(others)
  })

  it("filters other libraries' maps out of a mixed file list", () => {
    const button = { path: "ui/button/button.marko", type: "registry:ui" as const, content: "x" }
    const out = applyIconLibrary([button, ...iconItemFiles()], "remixicon")!
    expect(out[0]).toEqual(button)
    expect(out.map((f) => f.path)).not.toContain("ui/icon/__lucide__.ts")
    expect(out.map((f) => f.path)).toContain("ui/icon/__remixicon__.ts")
  })

  it("also matches paths without a leading directory (nested registry roots)", () => {
    const out = applyIconLibrary(
      [
        { path: "registry/x/ui/icon/__lucide__.ts", type: "registry:file" as const, target: "~/x", content: "" },
        { path: "registry/x/ui/icon/__tabler__.ts", type: "registry:file" as const, target: "~/x", content: "" },
      ],
      "tabler"
    )!
    expect(out.map((f) => f.path)).toEqual(["registry/x/ui/icon/__tabler__.ts"])
  })

  it.each([undefined, "", "heroicons", "feather"])(
    "passes files through unchanged for unsupported iconLibrary %j (legacy)",
    (lib) => {
      const input = iconItemFiles()
      expect(applyIconLibrary(input, lib)).toBe(input)
    }
  )

  it("handles empty and undefined file lists", () => {
    expect(applyIconLibrary(undefined, "lucide")).toBeUndefined()
    expect(applyIconLibrary([], "lucide")).toEqual([])
  })

  it("is idempotent", () => {
    const once = applyIconLibrary(iconItemFiles(), "hugeicons")
    expect(applyIconLibrary(once, "hugeicons")).toEqual(once)
  })
})

describe("renderIconResolver", () => {
  it("uses the node renderer only for hugeicons", () => {
    expect(renderIconResolver("hugeicons")).toContain("renderHugeiconsNodes(nodes)")
    for (const lib of LIBRARIES.filter((l) => l !== "hugeicons")) {
      expect(renderIconResolver(lib)).not.toContain("renderHugeiconsNodes")
    }
  })

  it("exports the same API as the registry resolve.ts", () => {
    const real = readFileSync(path.join(REAL_ICON_DIR, "resolve.ts"), "utf8")
    for (const lib of LIBRARIES) {
      for (const name of ["resolveIconLibrary", "resolveIconInner"]) {
        expect(real).toContain(`export function ${name}(`)
        expect(renderIconResolver(lib)).toContain(`export function ${name}(`)
      }
    }
  })
})

// Runs the generated resolver against the REAL generated maps from the
// registry source, so a drifted export name / render path fails here.
describe("generated resolver against the real icon maps", () => {
  it.each(LIBRARIES)("%s resolves a real icon and ignores the library prop", async (lib) => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-icon-"))
    for (const f of readdirSync(REAL_ICON_DIR)) {
      if (f.endsWith(".ts") && f !== "resolve.ts" && f !== "client-swap.ts") {
        if (/^__/.test(f) && f !== `__${lib}__.ts`) continue
        cpSync(path.join(REAL_ICON_DIR, f), path.join(dir, f))
      }
    }
    writeFileSync(path.join(dir, "resolve.ts"), renderIconResolver(lib))

    const mod = await import(/* @vite-ignore */ path.join(dir, "resolve.ts"))
    expect(mod.resolveIconLibrary("tabler")).toBe(lib)
    expect(mod.resolveIconLibrary(undefined)).toBe(lib)

    const inner = mod.resolveIconInner("SearchIcon", "lucide")
    expect(typeof inner).toBe("string")
    expect(inner.length).toBeGreaterThan(0)
    // Not the fallback square, i.e. the icon really came from this map.
    expect(inner).not.toBe('<rect width="18" height="18" x="3" y="3" rx="2"/>')
    // Unknown names still fall back instead of throwing.
    expect(mod.resolveIconInner("NoSuchIconAnywhere")).toContain("<rect")
  })
})
