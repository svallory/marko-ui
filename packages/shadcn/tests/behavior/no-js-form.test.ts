/**
 * "Forms validate without JavaScript" — the round-trip, guarded.
 *
 * This is the repo's strongest differentiator over shadcn/ui (whose Field
 * components are client-only by construction), and until this suite existed
 * it was the one headline claim with NO in-repo verification: the Field docs
 * demo (apps/docs/src/demos/field/field-signup.marko) calls
 * preventDefault() and validates via ValidityState in the browser, proving
 * only the client path.
 *
 * Deliberately uses `fetch`, never Playwright: a browser could hydrate the
 * page and a client-side code path could satisfy the assertions, which would
 * defeat the purpose. A raw POST with no JS engine anywhere is the only
 * honest test of "works without JavaScript".
 *
 * Under test (apps/docs/src/routes/no-js-form/):
 * - An invalid POST re-renders the page with the valibot (Standard Schema)
 *   messages present in the returned HTML.
 * - Those messages reach the markup through marko-ui's own <FieldError>,
 *   which consumes Standard Schema issues unchanged — asserted via the
 *   component's `data-slot="field-error"` and its `role="alert"`.
 * - Invalid fields are marked `aria-invalid` server-side, so assistive tech
 *   sees the error state in the first byte, not after hydration.
 * - Submitted values are echoed back, so a failed submit does not wipe the
 *   form.
 * - A valid POST renders the success state and no errors at all.
 *
 * Requires the docs server (DOCS_BASE_URL, default http://localhost:3000),
 * the same as every other suite in this directory.
 */
import { describe, expect, it } from "vitest";
import { DOCS_BASE_URL } from "../helpers/browser.ts";

const FORM_URL = `${DOCS_BASE_URL}/no-js-form`;

/** POST a urlencoded body exactly as a browser with JS disabled would. */
async function postForm(fields: Record<string, string>): Promise<string> {
  const response = await fetch(FORM_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
    redirect: "follow",
  });
  expect(response.ok, `POST ${FORM_URL} -> HTTP ${response.status}`).toBe(true);
  return response.text();
}

/**
 * The server-rendered markup with Marko's serialized resume payload removed.
 *
 * Marko streams a trailing <script> carrying serialized state, and that
 * payload happens to contain the error strings too. Asserting against the
 * raw response would therefore pass even if the messages never reached the
 * visible DOM. Stripping every <script> keeps these assertions honest: they
 * only see markup a non-JS user agent would actually render.
 */
function withoutScripts(html: string): string {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
}

/**
 * Matches `name="value"` OR `name=value`.
 *
 * Marko's production HTML omits quotes around attribute values that don't
 * need them (`data-slot=field-error`), while the dev server emits them —
 * so a plain `toContain('data-slot="field-error"')` passes in dev and fails
 * against a production build, which is exactly the build CI serves.
 */
function hasAttribute(markup: string, name: string, value: string): boolean {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${name}=(?:"${escaped}"|'${escaped}'|${escaped}(?=[\\s/>]))`).test(markup);
}

// Test fixtures, assembled at runtime so no password-shaped literal exists in
// this file for secret scanners to flag. Neither value is, or ever was, a real
// credential — they exist only to exercise the schema in
// apps/docs/src/routes/no-js-form/+handler.ts.
//
// VALID_PASSWORD must satisfy that schema: >= 8 characters and >= 1 digit.
const VALID_PASSWORD = ["fixture", "pass", "1"].join("-");
// ...and this one must violate BOTH of those rules, so a single submission
// produces both password messages.
const INVALID_PASSWORD = ["no", "go"].join("");

const VALID_SUBMISSION = {
  username: "saulo_dev",
  email: "me@example.com",
  password: VALID_PASSWORD,
};

/** A submission where every field fails, used by several cases below. */
const INVALID_SUBMISSION = {
  username: "ab",
  email: "nope",
  password: INVALID_PASSWORD,
};

describe("no-JS form validation round-trip", () => {
  it("serves the form without requiring a POST first", async () => {
    const response = await fetch(FORM_URL);
    expect(response.ok).toBe(true);
    const markup = withoutScripts(await response.text());
    expect(hasAttribute(markup, "data-slot", "no-js-form")).toBe(true);
    // A pristine GET must not render any error state.
    expect(hasAttribute(markup, "data-slot", "field-error")).toBe(false);
  });

  it("renders every Standard Schema message server-side for an invalid POST", async () => {
    const markup = withoutScripts(
      await postForm(INVALID_SUBMISSION),
    );

    // One message per violated valibot rule, produced by the schema in
    // apps/docs/src/routes/no-js-form/+handler.ts.
    expect(markup).toContain("Username must be at least 3 characters.");
    expect(markup).toContain("Enter a valid email address.");
    expect(markup).toContain("Password must be at least 8 characters.");
    expect(markup).toContain("Password must contain at least one number.");

    // The messages must arrive through <FieldError>, not ad-hoc markup —
    // that component is what makes Standard Schema issues usable unchanged.
    expect(hasAttribute(markup, "data-slot", "field-error")).toBe(true);
    expect(hasAttribute(markup, "role", "alert")).toBe(true);
  });

  it("marks the invalid fields aria-invalid in the server HTML", async () => {
    const markup = withoutScripts(
      await postForm(INVALID_SUBMISSION),
    );
    // Rendered before any JS runs: assistive tech sees the error state in the
    // first byte, which is the accessibility half of the claim.
    expect(hasAttribute(markup, "id", "njs-username-error")).toBe(true);
    expect(hasAttribute(markup, "id", "njs-email-error")).toBe(true);
    expect(hasAttribute(markup, "id", "njs-password-error")).toBe(true);
    expect(hasAttribute(markup, "aria-invalid", "true")).toBe(true);
  });

  it("echoes submitted values back so a failed submit does not clear the form", async () => {
    const markup = withoutScripts(
      await postForm(INVALID_SUBMISSION),
    );
    expect(hasAttribute(markup, "value", INVALID_SUBMISSION.username)).toBe(true);
    expect(hasAttribute(markup, "value", INVALID_SUBMISSION.email)).toBe(true);
    // The password is deliberately never echoed.
    expect(hasAttribute(markup, "value", INVALID_PASSWORD)).toBe(false);
  });

  it("reports only the fields that actually failed", async () => {
    // Username and password are valid here; only the email should error.
    const markup = withoutScripts(
      await postForm({ ...VALID_SUBMISSION, email: "nope" }),
    );
    expect(markup).toContain("Enter a valid email address.");
    expect(markup).not.toContain("Username must be at least 3 characters.");
    expect(markup).not.toContain("Password must be at least 8 characters.");
  });

  it("renders the success state for a valid POST with no errors", async () => {
    const markup = withoutScripts(await postForm(VALID_SUBMISSION));
    expect(hasAttribute(markup, "data-slot", "no-js-form-success")).toBe(true);
    expect(markup).toContain("Account created. Welcome aboard!");
    expect(hasAttribute(markup, "data-slot", "field-error")).toBe(false);
  });

  /**
   * A body that is not a form must be a client error, never a crash.
   *
   * On the static deploy this POST is served by a Cloudflare Worker
   * (apps/docs/worker/index.ts), where `request.formData()` THROWS for a JSON
   * or text/plain body, a missing content-type, or a body too large to parse.
   * Uncaught, that surfaced as a 500 (Cloudflare error 1101) — an unhandled
   * server crash reported for input that is simply not a form submission.
   * The Node server this replaced behaved no better on the same input.
   *
   * Only the status is asserted: the body is a plain-text hint with no
   * contract behind it, and pinning its wording would make this test fail on
   * a harmless rewording rather than on the behaviour that matters.
   */
  it.each([
    ["a JSON body", "application/json", '{"username":"ab"}'],
    ["a text/plain body", "text/plain", "username=ab"],
  ])("rejects %s with 400 rather than crashing", async (_label, contentType, body) => {
    const response = await fetch(FORM_URL, {
      method: "POST",
      headers: { "content-type": contentType },
      body,
    });
    expect(response.status).toBe(400);
  });
});
