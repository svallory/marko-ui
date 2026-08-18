import { describe, expect, it } from "vitest"

import { IMPORT_SPECIFIER_REGEX } from "./update-files"

function specifiers(content: string) {
  return Array.from(content.matchAll(IMPORT_SPECIFIER_REGEX), (m) => m[3])
}

describe("IMPORT_SPECIFIER_REGEX", () => {
  it("matches static imports, re-exports, side-effect and dynamic imports", () => {
    const content = [
      `import { cn } from "~/lib/utils"`,
      `import type { Foo } from '~/types'`,
      `export { bar } from "~/lib/bar"`,
      `import "~/styles.css"`,
      `const mod = await import("~/lazy")`,
      `import {`,
      `  a,`,
      `  b,`,
      `} from "~/multi"`,
    ].join("\n")

    expect(specifiers(content)).toEqual([
      "~/lib/utils",
      "~/types",
      "~/lib/bar",
      "~/styles.css",
      "~/lazy",
      "~/multi",
    ])
  })

  it("does not treat 'from' inside comments or strings as an import", () => {
    const content = [
      `// re-exported from "~/lib/utils"`,
      `const note = 'imported from "~/lib/utils"'`,
      `/* export things from "~/lib/utils" */`,
      `import { real } from "~/lib/real"`,
    ].join("\n")

    expect(specifiers(content)).toEqual(["~/lib/real"])
  })
})
