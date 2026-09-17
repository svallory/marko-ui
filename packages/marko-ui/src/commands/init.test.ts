import { describe, expect, it } from "vitest"

import { MARKO_DEFAULT_CSS, resolveTailwindCssPath } from "@/src/commands/init"

/**
 * Regression coverage for the components.json stylesheet path.
 *
 * `marko-ui init` used to crash on a plain `bun create marko` app following
 * the documented install commands:
 *
 *     - Updating app/globals.css
 *     ENOENT: no such file or directory, open '<cwd>/app/globals.css'
 *
 * `app/globals.css` is Next.js's convention, inherited from shadcn via
 * DEFAULT_TAILWIND_CSS. It was reached because `getTailwindCssFile` only
 * recognizes a stylesheet that already contains `@import "tailwindcss"`, and
 * a freshly scaffolded app has none — the very file init is about to create
 * is the one whose absence makes detection fail.
 */
describe("resolveTailwindCssPath", () => {
  it("prefers an explicitly configured path over everything else", () => {
    expect(
      resolveTailwindCssPath({
        configuredCss: "app/custom.css",
        detectedCss: "src/styles/globals.css",
        frameworkName: "marko-run",
        isSrcDir: true,
      })
    ).toBe("app/custom.css")
  })

  it("uses a detected stylesheet when there is no configured one", () => {
    expect(
      resolveTailwindCssPath({
        detectedCss: "src/assets/tw.css",
        frameworkName: "marko-run",
        isSrcDir: true,
      })
    ).toBe("src/assets/tw.css")
  })

  it.each(["marko-run", "marko-vite"])(
    "falls back to the Marko convention for %s when detection found nothing",
    (frameworkName) => {
      // Asserted against the exported constant, not a repeated literal: the
      // value is expected to change with the in-flight CLI DX work, and this
      // test is about WHICH default is chosen, not what it spells.
      expect(resolveTailwindCssPath({ frameworkName, isSrcDir: true })).toBe(
        `src/${MARKO_DEFAULT_CSS}`
      )
    }
  )

  it("omits the src/ prefix for a Marko project without a src directory", () => {
    expect(
      resolveTailwindCssPath({ frameworkName: "marko-run", isSrcDir: false })
    ).toBe(MARKO_DEFAULT_CSS)
  })

  // The Next.js literals below stay hardcoded deliberately: they are shadcn's
  // inherited default, owned elsewhere, and the point of these assertions is
  // that a Marko project never receives that specific path.
  it("never returns the Next.js default for a Marko project", () => {
    // The exact failure: a Marko app, nothing configured, nothing detected.
    for (const frameworkName of ["marko-run", "marko-vite"]) {
      for (const isSrcDir of [true, false]) {
        expect(
          resolveTailwindCssPath({ frameworkName, isSrcDir })
        ).not.toBe("app/globals.css")
      }
    }
  })

  it("keeps the shadcn default for a non-Marko project", () => {
    // Unchanged behavior for Next.js and unknown projects — this fix must not
    // change what shadcn-compatible consumers get.
    expect(resolveTailwindCssPath({ frameworkName: "next-app" })).toBe(
      "app/globals.css"
    )
    expect(resolveTailwindCssPath({})).toBe("app/globals.css")
  })
})
