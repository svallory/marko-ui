// A real, no-JavaScript form round-trip: POST -> Standard Schema validation
// -> server-rendered field errors, with no client bundle involved.
//
// This route exists to make marko-ui's strongest differentiator TESTABLE
// rather than merely asserted. The README claims "forms validate without
// JavaScript", and the Field docs demo (src/demos/field/field-signup.marko)
// does NOT demonstrate it: that demo calls event.preventDefault() and
// validates in the browser via ValidityState, so it proves client-side
// validation only. Nothing in the repo exercised the server path, so the
// claim was unverified in CI.
//
// The pairing that makes this work is:
//   - @marko/run consumes any Standard Schema validator for a form body
//     (`form:` in the options object), handing back a [value, issues] pair.
//   - marko-ui's <FieldError> accepts Standard Schema issue objects
//     unchanged (anything carrying a `message`), so valibot's output is
//     passed straight through with no adapter.
//
// See ../../../../packages/shadcn/tests/behavior/no-js-form.test.ts, which
// POSTs with fetch (never a browser) and asserts the messages are present in
// the returned HTML.
import * as v from "valibot";

/**
 * Deliberately mirrors the client-side constraints in the field-signup demo
 * so the two validation paths make the same promises.
 */
const SignupSchema = v.object({
  username: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(3, "Username must be at least 3 characters."),
    v.maxLength(20, "Username must be at most 20 characters."),
    v.regex(/^[A-Za-z0-9_]+$/, "Username may only contain letters, numbers and underscores."),
  ),
  email: v.pipe(
    v.string(),
    v.trim(),
    v.email("Enter a valid email address."),
  ),
  password: v.pipe(
    v.string(),
    v.minLength(8, "Password must be at least 8 characters."),
    v.regex(/[0-9]/, "Password must contain at least one number."),
  ),
});

/** Field name -> its messages, the shape <FieldError errors=...> consumes. */
export type FieldErrors = Record<string, string[] | undefined>;

export interface NoJsFormData {
  errors?: FieldErrors;
  /** Echoed back so a failed submit does not clear what the user typed. */
  values?: Record<string, string>;
  submitted?: boolean;
}

/**
 * Group Standard Schema issues by the top-level field they belong to.
 *
 * Every Standard Schema issue carries a `path` of segments; the first
 * segment's `key` is the form field name for a flat object schema like this
 * one. An issue with no path (a whole-object failure) is bucketed under
 * `_form` so it can never be silently dropped.
 */
function groupIssuesByField(issues: readonly v.BaseIssue<unknown>[]): FieldErrors {
  const grouped: FieldErrors = {};
  for (const issue of issues) {
    const first = issue.path?.[0];
    const key = typeof first?.key === "string" ? first.key : "_form";
    (grouped[key] ??= []).push(issue.message);
  }
  return grouped;
}

export const GET = Run.GET((_ctx, next) => next({} satisfies NoJsFormData));

export const POST = Run.POST({ form: SignupSchema }, async (ctx, next) => {
  const [body, issues] = await ctx.body;

  if (issues) {
    // `body` is the RAW input when validation fails, which is what lets the
    // page re-render with the user's own values still in the inputs.
    const raw = (body ?? {}) as Record<string, unknown>;
    const values: Record<string, string> = {};
    for (const field of ["username", "email", "password"]) {
      const value = raw[field];
      if (typeof value === "string") values[field] = value;
    }

    return next({
      errors: groupIssuesByField(issues as readonly v.BaseIssue<unknown>[]),
      values,
    } satisfies NoJsFormData);
  }

  // A real app would create the account and POST-redirect-GET here; this
  // route only needs to prove the validation round-trip, so it re-renders a
  // success state instead of persisting anything.
  return next({ submitted: true } satisfies NoJsFormData);
});
