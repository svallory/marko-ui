import { describe, expect, test } from "vitest"
import {
  addCompilerOptions,
  allowsTsExtensionImports,
} from "@/src/utils/updaters/update-tsconfig"

// TS5096: `allowImportingTsExtensions` is only legal when the project does not
// emit. Inserting it on an emitting project replaces a TS5097 warning with a
// hard TS5096 error — verified against real tsc 5.9.2 — so the updater must
// refuse and name the manual step instead.
describe("allowsTsExtensionImports", () => {
  test.each(["noEmit", "emitDeclarationOnly", "rewriteRelativeImportExtensions"])(
    "accepts a project with %s: true",
    (option) => {
      expect(
        allowsTsExtensionImports(`{"compilerOptions":{"${option}": true}}`)
      ).toBe(true)
    }
  )

  test("rejects a project that emits", () => {
    expect(
      allowsTsExtensionImports(`{"compilerOptions":{"strict": true}}`)
    ).toBe(false)
  })

  test("rejects an explicitly-false guard option", () => {
    expect(
      allowsTsExtensionImports(`{"compilerOptions":{"noEmit": false}}`)
    ).toBe(false)
  })

  test("does not count a guard option mentioned only in a comment", () => {
    expect(
      allowsTsExtensionImports(`{
  "compilerOptions": {
    // "noEmit": true
    "strict": true
  }
}`)
    ).toBe(false)
  })

  test("accepts the stock create-marko scaffold, which sets noEmit", () => {
    // The real scaffold shape — this is the path that must keep working.
    expect(
      allowsTsExtensionImports(`{
  "include": ["src/**/*"],
  "compilerOptions": {
    "noEmit": true,
    "strict": true
  }
}`)
    ).toBe(true)
  })
})

// Registry components import siblings with an explicit `.ts` extension, which
// a stock create-marko tsconfig rejects (TS5097). These cover the edit that
// closes that gap without disturbing the rest of the file.

describe("addCompilerOptions", () => {
  test("adds the option to a stock create-marko tsconfig", () => {
    const input = `{
  "include": ["src/**/*"],
  "compilerOptions": {
    "strict": true,
    "target": "ESNext"
  }
}`
    const result = addCompilerOptions(input)
    expect(result).not.toBeNull()
    expect(result!.added).toEqual(["allowImportingTsExtensions"])
    expect(result!.content).toContain(`"allowImportingTsExtensions": true`)
    // Everything that was there stays there.
    expect(result!.content).toContain(`"strict": true`)
    expect(result!.content).toContain(`"include": ["src/**/*"]`)
  })

  test("is a no-op when the option is already set — this is what makes a second init run change nothing", () => {
    const input = `{
  "compilerOptions": {
    "allowImportingTsExtensions": true
  }
}`
    expect(addCompilerOptions(input)).toBeNull()
  })

  test("leaves an explicit `false` alone rather than overriding the project's choice", () => {
    const input = `{
  "compilerOptions": {
    "allowImportingTsExtensions": false
  }
}`
    expect(addCompilerOptions(input)).toBeNull()
  })

  test("preserves comments (tsconfig is JSONC in practice)", () => {
    const input = `{
  // the project's own note
  "compilerOptions": {
    /* block comment */
    "strict": true
  }
}`
    const result = addCompilerOptions(input)
    expect(result).not.toBeNull()
    expect(result!.content).toContain("// the project's own note")
    expect(result!.content).toContain("/* block comment */")
  })

  test("does not count a key mentioned only inside a comment as present", () => {
    const input = `{
  "compilerOptions": {
    // "allowImportingTsExtensions": true
    "strict": true
  }
}`
    const result = addCompilerOptions(input)
    expect(result).not.toBeNull()
    expect(result!.added).toEqual(["allowImportingTsExtensions"])
  })

  test("matches the surrounding indentation", () => {
    const input = `{
\t"compilerOptions": {
\t\t"strict": true
\t}
}`
    const result = addCompilerOptions(input)
    expect(result!.content).toContain(`\t\t"allowImportingTsExtensions": true,`)
  })

  test("bails out rather than guessing when there is no compilerOptions block", () => {
    const input = `{
  "include": ["src/**/*"]
}`
    expect(addCompilerOptions(input)).toBeNull()
  })

  test("adds only the options that are missing", () => {
    const input = `{
  "compilerOptions": {
    "alpha": true
  }
}`
    const result = addCompilerOptions(input, { alpha: true, beta: true })
    expect(result!.added).toEqual(["beta"])
  })
})
