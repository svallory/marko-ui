/**
 * SSR contract tests (design C-3): machines never start during SSR, yet
 * connect() on an un-started service must emit correct initial attributes.
 * Behavioral (keyboard/focus) coverage runs in the browser against apps/docs.
 *
 * Marko renders attributes unquoted when safe; `attr()` matches both forms,
 * and assertions run against markup only (resume payload script stripped).
 */
import { describe, expect, it } from "vitest";
// @ts-expect-error marko template
import TabsFixture from "./fixtures/tabs-fixture.marko";

async function renderMarkup(input: Record<string, unknown> = {}) {
  const html = String(await TabsFixture.render(input));
  return html.slice(0, html.indexOf("<script"));
}

const attr = (name: string, value: string) => new RegExp(`${name}=("?)${value}\\1[ >]`);

describe("tabs SSR", () => {
  it("renders aria/data attributes from an un-started service", async () => {
    const markup = await renderMarkup();
    expect(markup).toMatch(attr("role", "tablist"));
    expect(markup).toMatch(attr("aria-selected", "true"));
    expect(markup).toMatch(attr("aria-selected", "false"));
    expect(markup).toMatch(attr("data-part", "trigger"));
    expect(markup).toMatch(attr("data-part", "content"));
  });

  it("selects defaultValue and hides other contents", async () => {
    const markup = await renderMarkup();
    expect(markup).toMatch(/data-value=("?)one\1[^>]*aria-selected=("?)true\2/);
    expect(markup.match(/hidden/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("respects controlled value", async () => {
    const markup = await renderMarkup({ value: "two" });
    expect(markup).toMatch(/data-value=("?)two\1[^>]*aria-selected=("?)true\2/);
    expect(markup).not.toMatch(/data-value=("?)one\1[^>]*aria-selected=("?)true\2/);
  });

  it("emits deterministic scoped ids wired via aria-controls", async () => {
    const markup = await renderMarkup();
    const controls = markup.match(/aria-controls=("?)([^"\s>]+)\1/)?.[2];
    expect(controls).toBeTruthy();
    expect(markup).toMatch(attr("id", controls!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });

  it("does not leak event handlers into server HTML", async () => {
    const markup = await renderMarkup();
    expect(markup).not.toMatch(/ onkeydown| onclick| onfocus/i);
  });

  it("stringifies boolean aria attributes", async () => {
    const markup = await renderMarkup();
    expect(markup).not.toMatch(/aria-selected[ >]/);
  });
});
