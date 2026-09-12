import { describe, expect, test } from "vitest"
import { mergeClasses, extractLiteralForExport } from "../../../tooling/merge-classes"
import { printClassModule } from "../../../tooling/resolve-classes"

describe("mergeClasses: .marko file kind", () => {
  test("replaces the classes.ts import line with a static const declaration", () => {
    const source = [
      'import { cn } from "#lib/utils.ts";',
      'import { button as styles } from "./classes.ts";',
      "",
      "<button class=styles.base>x</button>",
      "",
    ].join("\n")
    const { content, importedName, localName } = mergeClasses(
      source,
      "marko",
      '{ base: "flex" } as const',
    )
    expect(importedName).toBe("button")
    expect(localName).toBe("styles")
    expect(content).toContain('static const styles = { base: "flex" } as const;')
    expect(content).not.toContain("./classes.ts")
    expect(content).toContain('import { cn } from "#lib/utils.ts";')
    expect(content).toContain("<button class=styles.base>x</button>")
  })

  test("uses the bare export name as the local binding when there is no alias", () => {
    const source = 'import { button } from "./classes.ts";\n<div class=button.base/>\n'
    const { content, localName } = mergeClasses(source, "marko", '{ base: "flex" } as const')
    expect(localName).toBe("button")
    expect(content).toContain('static const button = { base: "flex" } as const;')
  })
})

describe("mergeClasses: variants.ts file kind", () => {
  test("replaces the classes.ts import line with a plain const declaration (no static keyword)", () => {
    const source = [
      'import { cva } from "class-variance-authority";',
      'import { button } from "./classes.ts";',
      "",
      "export const buttonVariants = cva(button.base);",
      "",
    ].join("\n")
    const { content } = mergeClasses(source, "variants", '{ base: "flex" } as const')
    expect(content).toContain('const button = { base: "flex" } as const;')
    expect(content).not.toContain("static const")
    expect(content).not.toContain("./classes.ts")
  })
})

describe("mergeClasses: no-match failure", () => {
  test("throws when the file has no classes.ts reference at all", () => {
    const source = "<div>no import here</div>\n"
    expect(() => mergeClasses(source, "marko", '{} as const')).toThrow(
      /no "\.\/classes\.ts" import line found/,
    )
  })

  test("throws with a clear message when the file references classes.ts but not via the exact import shape", () => {
    const source = 'const x = await import("./classes.ts");\n<div/>\n'
    expect(() => mergeClasses(source, "marko", '{} as const')).toThrow(
      /no line matches the exact expected import shape/,
    )
  })

  test("throws when a SECOND classes.ts import line is present, instead of merging only the first and leaving the rest dangling", () => {
    const source = [
      'import { a } from "./classes.ts";',
      'import { b } from "./classes.ts";',
      "<div class=a.x/><span class=b.y/>",
      "",
    ].join("\n")
    expect(() => mergeClasses(source, "marko", '{ x: "flex" } as const')).toThrow(
      /2 lines match the "\.\/classes\.ts" import shape/,
    )
  })
})

describe("mergeClasses: mu- survival failure", () => {
  test("throws if a non-allowlisted mu- token survives in the merged output", () => {
    const source = 'import { x } from "./classes.ts";\n<div class=x.a/>\n'
    expect(() =>
      mergeClasses(source, "marko", '{ a: "mu-not-mapped flex" } as const'),
    ).toThrow(/mu-not-mapped.*survives/)
  })

  test("does NOT throw when only an allowlisted mu- token survives", () => {
    const source = 'import { x } from "./classes.ts";\n<div class=x.a/>\n'
    const { content } = mergeClasses(source, "marko", '{ a: "mu-rtl-flip size-4" } as const')
    expect(content).toContain("mu-rtl-flip")
  })
})

describe("extractLiteralForExport", () => {
  test("extracts one export's literal (including its trailing as const) from a printed module", () => {
    const printed = printClassModule({
      button: { base: "flex" },
      other: { x: "1" },
    })
    const literal = extractLiteralForExport(printed, "button")
    expect(literal).toBe('{\n  base: "flex",\n} as const')
  })

  test("throws when the export name is not present", () => {
    const printed = printClassModule({ button: { base: "flex" } })
    expect(() => extractLiteralForExport(printed, "missing")).toThrow(/no export named "missing"/)
  })
})
