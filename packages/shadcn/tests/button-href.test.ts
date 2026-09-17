/**
 * `href` is Button's escape hatch for the commonest case in a static site: a
 * control that looks like a button but is semantically a link. shadcn solves
 * it with `asChild`, which has no Marko equivalent; passing `href` renders an
 * <a> with identical styling instead.
 *
 * The anchor must stay a REAL anchor — no `role="button"` — or middle-click,
 * "copy link address" and keyboard activation all regress to button
 * behaviour, which is the whole reason for the prop.
 */
import { describe, expect, test } from "vitest";
import Button from "../ui/button/button.marko";

describe("Button href escape hatch", () => {
  test("renders a <button> when no href is passed", async () => {
    const out = await Button.render({}).toString();
    expect(out).toContain("<button");
    expect(out).not.toContain("<a ");
  });

  test("renders an <a> when href is passed", async () => {
    const out = await Button.render({ href: "/docs" }).toString();
    expect(out).toContain("<a ");
    expect(out).toContain("/docs");
    expect(out).not.toContain("<button");
  });

  test("the anchor keeps link semantics — no role override", async () => {
    const out = await Button.render({ href: "/docs" }).toString();
    // Both spellings: Marko emits unquoted values where it can, so asserting
    // only the quoted form would pass vacuously.
    expect(out).not.toContain('role="button"');
    expect(out).not.toContain("role=button");
    expect(out).not.toMatch(/\brole\s*=/);
  });

  test("both branches carry the same data-slot and variant attributes", async () => {
    const asButton = await Button.render({ variant: "secondary" }).toString();
    const asLink = await Button.render({
      href: "/docs",
      variant: "secondary",
    }).toString();

    // Marko emits attribute values unquoted when they need no quoting, so
    // these are matched as rendered rather than as `data-slot="button"`.
    for (const out of [asButton, asLink]) {
      expect(out).toContain("data-slot=button");
      expect(out).toContain("data-variant=secondary");
      expect(out).toContain("data-size=default");
    }
  });

  test("variant and size classes apply on the anchor branch too", async () => {
    const asButton = await Button.render({
      variant: "outline",
      size: "sm",
    }).toString();
    const asLink = await Button.render({
      href: "/docs",
      variant: "outline",
      size: "sm",
    }).toString();

    // The generated class list must be identical apart from the element name:
    // a link that looks different from the button it mirrors is the bug.
    const classOf = (html: string) => /class=(?:"([^"]*)"|(\S+))/.exec(html);
    expect(classOf(asLink)?.[0]).toBe(classOf(asButton)?.[0]);
  });
});
