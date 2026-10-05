import { describe, expect, it } from "vitest";
import { GET as mdAliasGET } from "../docs/components/$name/md/+handler.ts";
import { GET as canonicalGET } from "../docs/components/$name/+handler.ts";

/**
 * The site's markdown endpoints, exercised as the static prerender does.
 *
 * This exists because `component-markdown.ts` once shipped a wrapper that
 * called a function that did not exist (`buildModel`), and NO unit test
 * caught it: the renderer's own tests used a fixture model. Under `bun` the
 * call throws `ReferenceError: buildModel is not defined` — which is how the
 * static build's prerender died and `/docs/components/<name>.md` 500'd on
 * every component. Calling the real handler over a real page is the only test
 * that would have failed.
 */
describe("the /docs/components/<name>.md endpoints", () => {
  it("serves the canonical .md URL for a real component", async () => {
    const response = await canonicalGET(
      { params: { name: "button.md" } },
      async () => new Response("not this route", { status: 404 }),
    );
    const body = await response.text();

    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(body.startsWith("# Button")).toBe(true);
    expect(body).toContain("## Usage");
    // Every example, not the CLI's lean slice.
    expect(body).toContain("## Examples");
  });

  it("serves the /md alias with the same content", async () => {
    const response = mdAliasGET({ params: { name: "button" } });
    const body = await response.text();

    expect(body.startsWith("# Button")).toBe(true);
  });

  it("404s a name with no page instead of throwing", async () => {
    const response = mdAliasGET({ params: { name: "definitely-not-a-component" } });

    expect(response.status).toBe(404);
    expect(await response.text()).toContain("# Not found");
  });

  it("hands a name without the .md suffix to the next handler", async () => {
    const next = async () => new Response("next", { status: 418 });

    expect(await canonicalGET({ params: { name: "button" } }, next)).toBeDefined();
    expect((await (await canonicalGET({ params: { name: "button" } }, next)).text())).toBe("next");
  });
});