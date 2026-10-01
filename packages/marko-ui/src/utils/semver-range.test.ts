import { describe, expect, it } from "vitest"

import {
  declaredRange,
  installedVersion,
  rangeExcludesMajor,
} from "@/src/utils/semver-range"

describe("rangeExcludesMajor", () => {
  describe("marko ranges against 6", () => {
    it.each(["^5.0.0", "^5", "~5", "~5.37.0", "5.37.0", "5", "5.x", "5.x.x", "<6", "<6.0.0", "<5", "<=5", "<=5.9.9", ">=5 <6", "^5.0.0 || ^4.0.0", "1.0.0 - 5.4.0", "^0.9.0"])(
      "excludes 6: %s",
      (range) => {
        expect(rangeExcludesMajor(range, 6)).toBe(true)
      }
    )
    it.each([
      "^6.0.0",
      "~6",
      "6",
      "6.0.0",
      "6.x",
      ">=5",
      ">=5.0.0",
      ">4",
      "*",
      "x",
      "latest",
      "next",
      "workspace:*",
      "workspace:^",
      "file:../marko",
      "npm:marko@6",
      ">=5 <7",
      "<=6",
      "<6.1",
      "<7",
      "^5 || ^6",
      "^5 || >=6",
      "5.0.0 - 6.2.0",
      "",
      "not a range",
    ])("allows 6: %s", (range) => {
      expect(rangeExcludesMajor(range, 6)).toBe(false)
    })
  })

  describe("tailwindcss ranges against 4", () => {
    it.each(["^3.4.0", "^3", "~3", "~3.4.1", "3.4.1", "3", "3.x", "<4", "<=3", ">=3 <4"])(
      "excludes 4: %s",
      (range) => {
        expect(rangeExcludesMajor(range, 4)).toBe(true)
      }
    )
    it.each(["^4.0.0", "~4", "4", "4.x", ">=3", "*", "latest", "workspace:*", ">=3 <5"])(
      "allows 4: %s",
      (range) => {
        expect(rangeExcludesMajor(range, 4)).toBe(false)
      }
    )
  })
})

describe("declaredRange", () => {
  it("finds the range in dependencies, devDependencies and peerDependencies", () => {
    expect(declaredRange({ dependencies: { marko: "^6" } }, "marko")).toBe("^6")
    expect(declaredRange({ devDependencies: { marko: "^6" } }, "marko")).toBe("^6")
    expect(declaredRange({ peerDependencies: { marko: "^6" } }, "marko")).toBe("^6")
  })
  it("returns null when the package is not declared", () => {
    expect(declaredRange({ dependencies: { react: "19" } }, "marko")).toBe(null)
    expect(declaredRange(null, "marko")).toBe(null)
  })
})

describe("installedVersion", () => {
  it("reads this package's own installed dependencies", () => {
    // zod is a dependency of packages/marko-ui, so it resolves from here.
    expect(installedVersion(process.cwd(), "zod")).toMatch(/^\d+\./)
  })
  it("returns null for a package that is not installed", () => {
    expect(
      installedVersion(process.cwd(), "definitely-not-a-real-package-name-xyz")
    ).toBe(null)
  })
})
