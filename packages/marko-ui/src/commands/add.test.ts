import { describe, expect, it } from "vitest"

import { assertAddableDistribution, shouldConfirmAutoInit } from "@/src/commands/add"
import { CommandError } from "@/src/utils/handle-error"

const plain = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, "")

function message(fn: () => void) {
  try {
    fn()
  } catch (error) {
    expect(error).toBeInstanceOf(CommandError)
    return plain((error as Error).message)
  }
  throw new Error("expected assertAddableDistribution to throw")
}

describe("assertAddableDistribution", () => {
  it("lets a copy project through", () => {
    expect(() => assertAddableDistribution({ distribution: "copy" }, ["button"])).not.toThrow()
  })

  it("lets a config with no distribution through (older configs are copy)", () => {
    expect(() => assertAddableDistribution({} as never, ["button"])).not.toThrow()
  })

  it("refuses an import project and shows the import path per component", () => {
    const text = message(() => assertAddableDistribution({ distribution: "import" }, ["button", "dialog"]))
    expect(text).toContain("import distribution")
    expect(text).toContain("@marko-ui/shadcn/ui/button/button.marko")
    expect(text).toContain("@marko-ui/shadcn/ui/dialog/dialog.marko")
  })

  it("shows the generic path when no component was named", () => {
    const text = message(() => assertAddableDistribution({ distribution: "import" }, []))
    expect(text).toContain("@marko-ui/shadcn/ui/<name>/<name>.marko")
  })

  it("does not invent an import path for a URL or namespaced item", () => {
    const text = message(() =>
      assertAddableDistribution({ distribution: "import" }, ["https://x.dev/r/foo.json", "@acme/card"])
    )
    expect(text).not.toContain("ui/https")
    expect(text).not.toContain("ui/@acme")
    expect(text).toContain("@marko-ui/shadcn/ui/<name>/<name>.marko")
  })

  it("points at eject for copying source", () => {
    expect(message(() => assertAddableDistribution({ distribution: "import" }, ["button"]))).toContain("marko-ui eject")
  })
})

describe("shouldConfirmAutoInit", () => {
  it("asks in an interactive terminal without -y", () => {
    expect(shouldConfirmAutoInit({ yes: false }, true)).toBe(true)
  })
  it("does not ask with -y, even in a terminal", () => {
    expect(shouldConfirmAutoInit({ yes: true }, true)).toBe(false)
  })
  it("does not ask when non-interactive", () => {
    expect(shouldConfirmAutoInit({ yes: false }, false)).toBe(false)
  })
  it("does not ask with -y when non-interactive", () => {
    expect(shouldConfirmAutoInit({ yes: true }, false)).toBe(false)
  })
})
