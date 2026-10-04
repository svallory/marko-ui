// Reads the props a component writes on its own `<zag>` / `<zag-machine>` tag —
// the value the machine actually receives, which is not always Zag's own
// default, and not always settable by the caller either. Split out of
// tooling/extract-api.ts so it can be unit-tested against synthetic tags:
// extract-api.ts runs `main()` on import and has no fixture mode, so there is
// no other way to pin the scanner's edge cases.

/**
 * A prop written on the component's own `<zag>` / `<zag-machine>` tag.
 *
 * marko-zag merges `{ id, ...picked, ...overrides }`
 * (`marko-zag/src/machine-props.ts`, `buildMachineProps`), with `overrides`
 * being the attributes written on the tag — LAST. So anything written there
 * beats what the caller passed, and the caller's value is silently ignored.
 * That makes it a FIXED value, not a default, and the docs must not present
 * it as one: "Default `false`" on `closeOnEscape` reads as "settable to
 * something else".
 *
 * - `fixed` with a `value`: a literal (`closeOnEscape=false`,
 *   `role="alertdialog"`). Documented as `fixed: alertdialog`.
 * - `fixed` without a `value`: a non-literal expression that does not read the
 *   prop back out of `input` (`slideCount=slides.length`, `id=uid`). Still
 *   fixed — the caller's value is still ignored — but not statically knowable,
 *   so it is recorded as fixed with no value.
 * - `passthrough`: an expression that DOES read the prop from `input`
 *   (`count=input.count ?? input.length`). The caller can set it, so it is
 *   neither fixed nor default (the effective fallback cannot be evaluated
 *   statically).
 */
export interface MachineTagProp {
  kind: "fixed" | "passthrough";
  value?: string;
}

/**
 * Reads the props a component fixes on its `<zag …>` / `<zag-machine …>` tag.
 *
 * Needs a real scan rather than a regex because those tags routinely span many
 * lines and embed arbitrary code: `api=() => dialogMachine` contains a `>`,
 * and `props=(picked) => ({ … })` contains both braces and parens. So the tag
 * end is found by tracking quotes, braces and parens together, and the
 * attribute list is read from what is left. The tag's own plumbing
 * (`api=`, `service=`, `from=`, `props=`) and its method-shorthand handlers
 * (`onValueChange(details) { … }`) are not props and are skipped.
 */
export function readMachineTagProps(markoSource: string): Map<string, MachineTagProp> {
  const props = new Map<string, MachineTagProp>();
  const tagStart = /<zag(?:-machine)?(?=[\s/>])/g;
  let match: RegExpExecArray | null;

  while ((match = tagStart.exec(markoSource)) !== null) {
    let index = match.index + match[0].length;
    let depth = 0;
    let quote = "";
    for (; index < markoSource.length; index += 1) {
      const char = markoSource[index];
      if (quote) {
        if (char === quote) quote = "";
        continue;
      }
      if (char === '"' || char === "'" || char === "`") {
        quote = char;
        continue;
      }
      if (char === "(" || char === "{" || char === "[") depth += 1;
      else if (char === ")" || char === "}" || char === "]") depth -= 1;
      // `>` ends the tag — unless it is the `>` of an arrow, which every
      // `<zag/api=() => machine …>` has sitting at depth 0 right after its
      // empty parameter list.
      else if (char === ">" && depth === 0 && markoSource[index - 1] !== "=") break;
    }
    readTagAttributes(markoSource.slice(match.index + match[0].length, index), props);
  }

  return props;
}

/** The `<zag>` plumbing and handler attributes, which are not machine props. */
const TAG_PLUMBING = new Set(["api", "service", "from", "props"]);

function readTagAttributes(tagBody: string, props: Map<string, MachineTagProp>): void {
  let index = 0;
  while (index < tagBody.length) {
    const char = tagBody[index] ?? "";
    if (char === " " || char === "\t" || char === "\n" || char === "\r") {
      index += 1;
      continue;
    }
    if (!/[A-Za-z]/.test(char)) {
      index += 1;
      continue;
    }

    let end = index;
    while (end < tagBody.length && /[\w-]/.test(tagBody[end] ?? "")) end += 1;
    const name = tagBody.slice(index, end);
    index = end;

    let next = index;
    while (next < tagBody.length && /\s/.test(tagBody[next] ?? "")) next += 1;
    const after = tagBody[next];

    if (after !== "=") {
      // A method shorthand (`onValueChange(details) { … }`) or a bare flag.
      // A handler is not a prop at all — and its BODY must not be scanned as
      // attributes, or `input.value = x` inside it would look like a prop.
      // So skip the parameter list and the body whole.
      if (after === "(") index = skipExpression(tagBody, next);
      const bodyAt = skipSpaces(tagBody, index);
      if (tagBody[bodyAt] === "{") index = skipExpression(tagBody, bodyAt);
      continue;
    }
    index = next + 1;
    while (index < tagBody.length && /\s/.test(tagBody[index] ?? "")) index += 1;

    const value = tagBody[index] ?? "";
    if (TAG_PLUMBING.has(name)) {
      // `props=(picked) => ({ … })` carries a whole closure; skipping it to
      // the next space would leave its body to be read as attributes.
      index = skipExpression(tagBody, index);
      continue;
    }
    if (value === '"' || value === "'") {
      const close = tagBody.indexOf(value, index + 1);
      props.set(name, {
        kind: "fixed",
        value: close === -1 ? undefined : tagBody.slice(index + 1, close),
      });
      index = close === -1 ? tagBody.length : close + 1;
      continue;
    }
    // An unquoted Marko attribute value is a JS expression, but a bare literal
    // is still knowable: `closeOnEscape=false` is the boolean false, not an
    // expression. Anything else is an expression — fixed, unless it reads the
    // prop back out of `input`, in which case the caller still controls it.
    const bare = /^[^\s/>]+/.exec(tagBody.slice(index))?.[0] ?? "";
    props.set(
      name,
      /^(?:true|false|null|-?\d+(?:\.\d+)?)$/.test(bare)
        ? { kind: "fixed", value: bare }
        : readsInput(tagBody, index, name),
    );
    index = skipValue(tagBody, index);
  }
}

/**
 * True when the unquoted value at `start` reads the prop back out of the
 * component's input — `input.count`, `input["aria-label"]` — which means the
 * caller's value still reaches the machine (`count=input.count ??
 * input.length`), so the prop is not fixed.
 *
 * Plain substring scans rather than a RegExp built from the prop name: the
 * name comes from source, but a dynamic pattern is both unnecessary here and
 * the kind of thing a scanner flags. `input.countX` must not count as
 * `input.count`, hence the identifier-boundary check.
 */
function readsInput(tagBody: string, start: number, name: string): MachineTagProp {
  const expression = tagBody.slice(start, skipValue(tagBody, start));
  const forms = [`input.${name}`, `input["${name}"]`, `input['${name}']`];
  for (const form of forms) {
    let at = expression.indexOf(form);
    while (at !== -1) {
      const next = expression[at + form.length] ?? "";
      if (!/[\w$]/.test(next)) return { kind: "passthrough" };
      at = expression.indexOf(form, at + 1);
    }
  }
  return { kind: "fixed" };
}

/** Index of the next non-whitespace character at or after `from`. */
function skipSpaces(text: string, from: number): number {
  let index = from;
  while (index < text.length && /\s/.test(text[index] ?? "")) index += 1;
  return index;
}

/**
 * Index just past a whole JS expression: a balanced `(…)` / `{…}` / `[…]` group
 * at `start`, plus any `=>` body that follows it. Anything that is not a group
 * opener is skipped to the next whitespace at depth 0, which is the plain
 * `role="dialog"` case.
 */
function skipExpression(text: string, start: number): number {
  let index = start;
  const opener = text[index];
  if (opener === "(" || opener === "{" || opener === "[") {
    const closer = opener === "(" ? ")" : opener === "{" ? "}" : "]";
    let depth = 0;
    let quote = "";
    for (; index < text.length; index += 1) {
      const char = text[index];
      if (quote) {
        if (char === quote) quote = "";
        continue;
      }
      if (char === '"' || char === "'" || char === "`") {
        quote = char;
        continue;
      }
      if (char === opener) depth += 1;
      else if (char === closer) {
        depth -= 1;
        if (depth === 0) {
          index += 1;
          break;
        }
      }
    }
    const after = skipSpaces(text, index);
    if (text[after] === "=" && text[after + 1] === ">") {
      return skipExpression(text, skipSpaces(text, after + 2));
    }
    return index;
  }
  return skipValue(text, start);
}

/** Index just past an unquoted attribute value, honoring nesting. */
function skipValue(tagBody: string, start: number): number {
  let index = start;
  let depth = 0;
  while (index < tagBody.length) {
    const char = tagBody[index] ?? "";
    if (char === "(" || char === "{" || char === "[") depth += 1;
    else if (char === ")" || char === "}" || char === "]") {
      if (depth === 0) break;
      depth -= 1;
    } else if (depth === 0 && /\s/.test(char)) break;
    index += 1;
  }
  return index;
}

