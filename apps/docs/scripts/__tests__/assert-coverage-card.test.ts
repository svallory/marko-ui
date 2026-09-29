import { describe, expect, it } from "vitest";
import { assertCoverageCard, coverageCardPath } from "../assert-coverage-card.ts";

const card = `<a href=https://github.com/svallory/marko-ui/blob/main/notes/behavior-coverage.md><span>58% of documented behaviors covered by tests across 15 components</span></a><span>of documented behaviors covered by tests, across 15 components</span>`;

describe("Pages coverage-card gate", () => {
  it.each(["", "'", '"'])("accepts a release card with %s href quotes", (quote) => {
    const html = card.replace("href=https://", `href=${quote}https://`)
      .replace("behavior-coverage.md>", `behavior-coverage.md${quote}>`);
    expect(() => assertCoverageCard(html)).not.toThrow();
  });
  it("resolves the built home independent of the working directory", () => {
    expect(coverageCardPath.pathname).toMatch(/\/apps\/docs\/dist\/public\/index\.html$/);
  });
  it.each(["", "<span>58%</span>", "<span>of documented behaviors covered by tests, across 15 components</span>", card.replace("58% of documented", "of documented")])(
    "rejects a missing or incomplete card", (html) => expect(() => assertCoverageCard(html)).toThrow(/missing/),
  );
});
