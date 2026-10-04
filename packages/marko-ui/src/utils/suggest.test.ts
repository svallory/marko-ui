import { closestNames, editDistance, formatDidYouMean } from "@/src/utils/suggest"
import { describe, expect, it } from "vitest"

describe("editDistance", () => {
  it("is zero for identical strings", () => {
    expect(editDistance("button", "button")).toBe(0)
  })

  it("counts a substitution, insertion and deletion as one edit", () => {
    expect(editDistance("buton", "button")).toBe(1)
    expect(editDistance("button", "buton")).toBe(1)
    expect(editDistance("button", "buttons")).toBe(1)
  })

  it("handles the empty-string edges", () => {
    expect(editDistance("", "button")).toBe(6)
    expect(editDistance("button", "")).toBe(6)
    expect(editDistance("", "")).toBe(0)
  })
})

describe("closestNames", () => {
  const index = [
    "accordion",
    "alert",
    "badge",
    "button",
    "button-group",
    "card",
    "carousel",
    "dialog",
    "input",
    "select",
  ]

  it("returns nothing for an empty query or a non-positive limit", () => {
    expect(closestNames("", index)).toEqual([])
    expect(closestNames("   ", index)).toEqual([])
    expect(closestNames("button", index, 0)).toEqual([])
  })

  it("suggests the closest name for a typo", () => {
    expect(closestNames("buton", index)).toEqual(["button"])
  })

  it("prefers a prefix match over a merely-close edit", () => {
    // "buttons" is one edit from "button", but "button-group" starts with
    // the query, which is the more likely intent for a plural.
    expect(closestNames("buttons", index)[0]).toBe("button")
    expect(closestNames("butt", index)).toEqual(["button", "button-group"])
  })

  it("ranks a prefix match first", () => {
    expect(closestNames("dial", index)[0]).toBe("dialog")
  })

  it("is case-insensitive, and an exact match counts as exact", () => {
    // Case folding happens before the exact-match test, so an all-caps
    // spelling of a real name is recognized as that name — not returned as a
    // "suggestion" for itself.
    expect(closestNames("DIALOG", index)).toEqual([])
    expect(closestNames("DIALOGG", index)).toEqual(["dialog"])
  })

  it("drops names that are not close enough", () => {
    expect(closestNames("xyzzy-plugh", index)).toEqual([])
  })

  it("keeps a substring match whose edit distance is far too large", () => {
    // 18 edits away from "tablerolltableroll", but it contains the query and
    // is plainly the answer.
    expect(closestNames("table", ["tablerolltableroll"])).toEqual([
      "tablerolltableroll",
    ])
  })

  it("never returns an exact (case-insensitive) match", () => {
    expect(closestNames("button", index)).not.toContain("button")
  })

  it("honours the limit", () => {
    expect(closestNames("b", index, 2)).toHaveLength(2)
  })

  it("is deterministic for equal scores", () => {
    // "alert" and "badge" are both 3 edits from "alertx"-shaped queries;
    // repeated calls must agree.
    const first = closestNames("alrt", index)
    expect(closestNames("alrt", index)).toEqual(first)
  })
})

describe("formatDidYouMean", () => {
  it("returns undefined for an empty list", () => {
    expect(formatDidYouMean([])).toBeUndefined()
  })

  it("uses no comma for a single candidate", () => {
    expect(formatDidYouMean(["button"])).toBe('Did you mean "button"?')
  })

  it("uses an Oxford-free list for two", () => {
    expect(formatDidYouMean(["button", "badge"])).toBe(
      'Did you mean "button" or "badge"?'
    )
  })

  it("uses commas then 'or' for three or more", () => {
    expect(formatDidYouMean(["a", "b", "c"])).toBe(
      'Did you mean "a", "b" or "c"?'
    )
  })
})