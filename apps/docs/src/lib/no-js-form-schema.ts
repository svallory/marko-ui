/**
 * The signup rules behind the "forms validate without JavaScript" claim.
 *
 * Extracted out of `routes/no-js-form/+handler.ts` so the Cloudflare Worker
 * that serves the POST can import the SAME schema and the SAME issue-grouping
 * logic. Under the static deploy the POST is the one request that still runs
 * server code, and a second copy of these rules there would be a claim that
 * quietly stops being true the first time someone edits one copy.
 *
 * Deliberately mirrors the client-side constraints in the field-signup demo
 * (apps/docs/src/demos/field/field-signup.marko) so the two validation paths
 * make the same promises.
 */
import * as v from "valibot";

export const SignupSchema = v.object({
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

/** The fields echoed back to the form, in the order they are rendered. */
export const SIGNUP_FIELDS = ["username", "email", "password"] as const;

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
export function groupIssuesByField(issues: readonly v.BaseIssue<unknown>[]): FieldErrors {
  const grouped: FieldErrors = {};
  for (const issue of issues) {
    const first = issue.path?.[0];
    const key = typeof first?.key === "string" ? first.key : "_form";
    (grouped[key] ??= []).push(issue.message);
  }
  return grouped;
}

/**
 * Pick the string values out of a raw (failed) submission, to re-render them.
 *
 * Note this includes `password`: what keeps the password off the page is the
 * template, which binds `value=` on the username and email inputs only (see
 * routes/no-js-form/+page.marko, and the assertion in
 * packages/shadcn/tests/behavior/no-js-form.test.ts that the submitted
 * password never appears in the markup). Filtering it here too would be
 * belt-and-braces, but it would also quietly change the data shape the route
 * handler has always produced, so the original behavior is preserved.
 */
export function echoableValues(raw: Record<string, unknown>): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of SIGNUP_FIELDS) {
    const value = raw[field];
    if (typeof value === "string") values[field] = value;
  }
  return values;
}

/**
 * Validate a submitted form body, returning exactly what the page needs.
 *
 * This is the whole server-side contract in one place: the Marko route
 * handler and the Worker both call it, so "what a bad POST renders" has a
 * single definition.
 */
export function validateSignup(entries: Record<string, unknown>): NoJsFormData {
  const result = v.safeParse(SignupSchema, entries);

  if (!result.success) {
    return {
      errors: groupIssuesByField(result.issues),
      values: echoableValues(entries),
    };
  }

  // A real app would create the account and POST-redirect-GET here; this
  // route only needs to prove the validation round-trip, so it re-renders a
  // success state instead of persisting anything.
  return { submitted: true };
}
