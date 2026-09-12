import { describe, expect, test } from "vitest"

import { collectClassContextSpans } from "../../../tooling/class-context-scan"

/**
 * class-context-scan.test.ts — unit coverage for the DETECTOR extracted from
 * the retired text-rewriting transform (cd-final). `collectClassContextSpans`
 * is now check-classes.ts's only tool for finding a class-context string
 * literal: it never rewrites, so these tests only assert on the SPANS found
 * (start/end/kind + the substring they point at), not on any transformed
 * output. Moved/adapted from the retired transform's test suite — same
 * scanner shapes, re-pointed at span discovery instead of rewrite output.
 */

function spanTexts(source: string) {
  return collectClassContextSpans(source).map((s) => source.slice(s.start, s.end))
}

describe("plain class attribute literal", () => {
  test("double and single quotes", () => {
    const texts = spanTexts(`<div class="mu-x flex"></div>\n<span class='mu-y grid'></span>`)
    expect(texts).toEqual(["mu-x flex", "mu-y grid"])
  })
})

describe("cn() call — brace form and non-first-position literal", () => {
  test("cn() with multiple literals; identifier/call args produce no span", () => {
    const src = `<div class=cn("mu-x flex", "italic", buttonVariants({ variant }), input.class)></div>`
    const texts = spanTexts(src)
    // Only the two string-literal arguments are found — buttonVariants({ variant })
    // (an object-literal / brace-form call argument) and input.class contribute
    // nothing, proving the scanner walks past nested braces without mistaking
    // them for string content.
    expect(texts).toEqual(["mu-x flex", "italic"])
  })

  test("string literal in a non-first cn() argument is still found", () => {
    const src = `<div class=cn(input.class, "mu-y second")></div>`
    expect(spanTexts(src)).toEqual(["mu-y second"])
  })
})

describe("ternary and concatenation", () => {
  test("ternary nested inside cn() yields both branch literals", () => {
    const src = `<div class=cn("mu-x base", cond ? "a" : "b")></div>`
    expect(spanTexts(src)).toEqual(["mu-x base", "a", "b"])
  })

  test("concatenation nested inside cn(), either side of the operator", () => {
    const src = `<div class=cn("mu-x " + (active ? "on" : "off"))></div>`
    expect(spanTexts(src)).toEqual(["mu-x ", "on", "off"])
  })
})

describe("multi-line cn() with comments", () => {
  test("comments inside the call are skipped, every literal still found", () => {
    const src = [
      `<div`,
      `  class=cn(`,
      `    "mu-x relative",`,
      `    // don't rewrite comments, even mentioning mu-y`,
      `    cond ? "a" : "b",`,
      `    input.class,`,
      `  )`,
      `></div>`,
    ].join("\n")
    expect(spanTexts(src)).toEqual(["mu-x relative", "a", "b"])
  })

  test("block comment inside the call is skipped", () => {
    const src = [
      `<div class=cn(`,
      `  "mu-x a", /* mu-y mentioned here, not a real occurrence */ "mu-z b"`,
      `)></div>`,
    ].join("\n")
    expect(spanTexts(src)).toEqual(["mu-x a", "mu-z b"])
  })
})

describe("template literal chunks", () => {
  test("only static chunks + nested interpolation strings are spans, not the whole literal", () => {
    const src = "<div class=`mu-x ${input.extra} flex`></div>"
    const spans = collectClassContextSpans(src)
    expect(spans.map((s) => s.kind)).toEqual(["template-chunk", "template-chunk"])
    expect(spanTexts(src)).toEqual(["mu-x ", " flex"])
  })

  test("string literal inside a template interpolation is class-context too", () => {
    const src = '<div class=`flex ${cond ? "mu-y" : "italic"}`></div>'
    const spans = collectClassContextSpans(src)
    expect(spans.map((s) => s.kind)).toEqual(["template-chunk", "string", "string"])
    expect(spanTexts(src)).toEqual(["flex ", "mu-y", "italic"])
  })
})

describe("non-class contexts produce no spans", () => {
  test("mu- tokens outside a class-context attribute are ignored entirely", () => {
    const src = [
      `import x from "./mu-x-helpers";`,
      `// mu-button appears in this comment`,
      `<div data-label="mu-x" aria-label="use mu-y here"></div>`,
      `<span>body text mentioning mu-button</span>`,
    ].join("\n")
    expect(collectClassContextSpans(src)).toEqual([])
  })

  test("class: destructuring-rename shape (bare identifier) is not scanned", () => {
    const src = `<const/{ class: className, ...rest }=input/>`
    expect(collectClassContextSpans(src)).toEqual([])
  })
})

describe("class: object property and <name>Class= attribute", () => {
  test("class: property whose value is a real class-string expression", () => {
    const src = `\${trigger}({ class: "mu-menubar-trigger", disabled })`
    expect(spanTexts(src)).toEqual(["mu-menubar-trigger"])
  })

  test("<name>Class= attribute (e.g. toastClass=)", () => {
    const src = `<Toaster toastClass="mu-toast"/>`
    expect(spanTexts(src)).toEqual(["mu-toast"])
  })
})
