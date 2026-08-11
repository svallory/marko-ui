import * as v from "valibot";

const FIELDS = ["username", "email", "password", "plan"] as const;

type FieldName = (typeof FIELDS)[number];

export type SignUpValues = Partial<Record<FieldName, string>>;
export type SignUpErrors = Partial<Record<FieldName, string[]>>;

/**
 * A Standard Schema validator. `@marko/run` consumes it directly for `form` bodies and
 * resolves `context.body` to a `[value, issues]` tuple, so the only work left here is
 * mapping issues onto field names.
 *
 * Every field is `unknown`-tolerant at the entry point so that a missing field produces a
 * readable message rather than a type error.
 */
const signUpSchema = v.object({
  username: v.pipe(
    v.string("Username is required."),
    v.trim(),
    v.minLength(3, "Username must be at least 3 characters."),
    v.maxLength(20, "Username must be at most 20 characters."),
    v.regex(/^[a-z0-9_]+$/i, "Use only letters, numbers and underscores."),
  ),
  email: v.pipe(
    v.string("Email is required."),
    v.trim(),
    v.nonEmpty("Email is required."),
    v.email("Enter a valid email address."),
  ),
  password: v.pipe(
    v.string("Password is required."),
    v.minLength(8, "Password must be at least 8 characters."),
    v.regex(/[0-9]/, "Password must contain a number."),
  ),
  plan: v.picklist(["free", "pro"], "Choose a plan."),
});

export const POST = Run.POST(
  {
    // A permissive pass-through validator: it returns the raw values so a failed
    // submission can repopulate the form, and runs the real schema separately.
    form: (body: Record<string, unknown>) => body,
  },
  async (context, next) => {
    const body = await context.body;
    const values = readSubmittedValues(body);
    const result = v.safeParse(signUpSchema, values);

    if (!result.success) {
      const errors: SignUpErrors = {};

      for (const issue of result.issues) {
        const field = issue.path?.[0]?.key;
        if (typeof field !== "string") continue;
        (errors[field as FieldName] ??= []).push(issue.message);
      }

      // Re-render the page with errors and the submitted values, so the form works
      // with JavaScript disabled.
      return next({ errors, values });
    }

    return next({ submitted: result.output });
  },
);

/** Keeps the user's raw input so a failed submission does not clear the form. */
function readSubmittedValues(body: Record<string, unknown>): SignUpValues {
  const values: SignUpValues = {};
  for (const field of FIELDS) {
    const value = body[field];
    if (typeof value === "string") values[field] = value;
  }
  return values;
}
