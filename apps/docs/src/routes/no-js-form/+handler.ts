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
// The rules themselves live in ../../lib/no-js-form-schema.ts, NOT here: on
// the static Cloudflare deploy this POST is served by a Worker
// (apps/docs/worker/index.ts) rather than by this handler, and both must
// enforce the identical schema. A second copy would be a claim that silently
// stops being true the first time one copy is edited.
//
// See ../../../../packages/shadcn/tests/behavior/no-js-form.test.ts, which
// POSTs with fetch (never a browser) and asserts the messages are present in
// the returned HTML.
import * as v from "valibot";

import {
  SignupSchema,
  echoableValues,
  groupIssuesByField,
  type NoJsFormData,
} from "../../lib/no-js-form-schema.ts";

export type { FieldErrors, NoJsFormData } from "../../lib/no-js-form-schema.ts";

export const GET = Run.GET((_ctx, next) => next({} satisfies NoJsFormData));

export const POST = Run.POST({ form: SignupSchema }, async (ctx, next) => {
  const [body, issues] = await ctx.body;

  if (issues) {
    // `body` is the RAW input when validation fails, which is what lets the
    // page re-render with the user's own values still in the inputs.
    return next({
      errors: groupIssuesByField(issues as readonly v.BaseIssue<unknown>[]),
      values: echoableValues((body ?? {}) as Record<string, unknown>),
    } satisfies NoJsFormData);
  }

  // A real app would create the account and POST-redirect-GET here; this
  // route only needs to prove the validation round-trip, so it re-renders a
  // success state instead of persisting anything.
  return next({ submitted: true } satisfies NoJsFormData);
});
