import { describe, expect, it } from "vitest";
import { assertCoverageCard } from "../assert-coverage-card.ts";

const card = `<a href=https://github.com/svallory/marko-ui/blob/main/notes/behavior-coverage.md><span>58% of documented behaviors covered by tests across 15 components</span></a><span>of documented behaviors covered by tests, across 15 components</span>`;

describe("Pages coverage-card gate", () => {
  it("accepts a release card", () => expect(() => assertCoverageCard(card)).not.toThrow());
  it.each(["", "<span>58%</span>", "<span>of documented behaviors covered by tests, across 15 components</span>", card.replace("58% of documented", "of documented")])(
    "rejects a missing or incomplete card", (html) => expect(() => assertCoverageCard(html)).toThrow(/missing/),
  );
});
