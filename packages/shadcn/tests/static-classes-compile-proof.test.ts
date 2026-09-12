/**
 * Contract point 7 gate for cd-tooling: prove a Marko 6 template with a
 * module-level `static const styles = {...} as const;` line compiles and
 * renders with `class=styles.a` BEFORE any resolve-classes/merge-classes
 * tooling is built on top of that assumption.
 */
import { describe, expect, test } from "vitest";
import Fixture from "./fixtures/static-classes-proof.marko";

describe("static const compiles and renders (contract point 7)", () => {
  test("class=styles.a renders the mapped class", async () => {
    const out = await Fixture.render({}).toString();
    expect(out).toContain(`class=proof-class`);
    expect(out).toContain("proof");
  });
});
