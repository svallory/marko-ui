// Reads the props a component FIXES on its own `<zag>` / `<zag-machine>` tag —
// the value the machine actually receives, which is not always Zag's own
// default. Split out of tooling/extract-api.ts so it can be unit-tested against
// synthetic tags: extract-api.ts runs `main()` on import and has no fixture
// mode, so there is no other way to pin the scanner's edge cases.

/**
 * A prop the component passes to its own machine on the `<zag>` /
 * `<zag-machine>` tag — the value the machine actually sees, which is NOT
 * always Zag's own default.
 *
 * `literal` is the string a table cell should show; `null` means the
 * component passes a non-literal expression (`count=input.count ??
 * input.length`), so the effective value cannot be determined statically and
 * no default is recorded at all. Recording Zag's `@default` in that case is
 * how `alert-dialog` came to document `closeOnEscape` as `true` while the
 * component hard-codes `false`.
 */
export type MachineTagProp = string | null;

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
      // Either way it is not a fixed value; a handler is not a prop at all,
      // and the parse continues past it.
      continue;
    }
    index = next + 1;
    while (index < tagBody.length && /\s/.test(tagBody[index] ?? "")) index += 1;

    const value = tagBody[index] ?? "";
    if (TAG_PLUMBING.has(name)) {
      index = skipValue(tagBody, index);
      continue;
    }
    if (value === '"' || value === "'") {
      const close = tagBody.indexOf(value, index + 1);
      props.set(name, close === -1 ? null : tagBody.slice(index + 1, close));
      index = close === -1 ? tagBody.length : close + 1;
      continue;
    }
    // An unquoted Marko attribute value is a JS expression, but a bare literal
    // is still knowable: `closeOnEscape=false` is the boolean false, not an
    // expression. Anything else (`input.count ?? input.length`) depends on
    // runtime input, so no default can be stated for it.
    const bare = /^[^\s/>]+/.exec(tagBody.slice(index))?.[0] ?? "";
    props.set(name, /^(?:true|false|null|-?\d+(?:\.\d+)?)$/.test(bare) ? bare : null);
    index = skipValue(tagBody, index);
  }
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

