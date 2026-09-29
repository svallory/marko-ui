import { readFileSync } from "node:fs";

/** Pages must not deploy a successful prerender that silently omitted the release card. */
export function assertCoverageCard(html: string): void {
  if (!/<a\b[^>]*href=https:\/\/github\.com\/svallory\/marko-ui\/blob\/main\/notes\/behavior-coverage\.md/.test(html) ||
      !/\d{1,3}% of documented behaviors covered by tests across \d+ components/.test(html) ||
      !/of documented behaviors covered by tests, across \d+ components/.test(html)) {
    throw new Error("Home page is missing the release-pinned coverage card");
  }
}

if (import.meta.main) {
  try {
    assertCoverageCard(readFileSync("apps/docs/dist/public/index.html", "utf8"));
    console.log("verified: release-pinned coverage card in built home page");
  } catch (error) {
    console.error("::error::", error);
    process.exitCode = 1;
  }
}
