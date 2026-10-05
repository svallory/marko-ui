import { describe, expect, it } from "vitest";
import { readMachineTagProps } from "../machine-tag-props.ts";

// The props a component FIXES on its own `<zag>`/`<zag-machine>` tag are the
// values the machine really receives. Recording Zag's `@default` instead is
// how `alert-dialog` came to document `closeOnEscape` as `true` while
// `alert-dialog.marko` hard-codes `false` — a contradiction on the page whose
// own prose says the opposite.
//
// This module exists as a separate file purely so these can be tested:
// `extract-api.ts` runs `main()` on import and has no fixture mode.
describe("readMachineTagProps", () => {
  it("reads the literal attributes alert-dialog passes, as FIXED", () => {
    const source = [
      '<zag/api=() => dialogMachine from=input',
      '  role="alertdialog"',
      "  closeOnInteractOutside=false",
      "  closeOnEscape=false",
      "/>",
    ].join("\n");

    // Not defaults: marko-zag merges the tag's attributes last, so
    // `<AlertDialog closeOnEscape=true>` is silently ignored.
    expect([...readMachineTagProps(source)]).toEqual([
      ["role", { kind: "fixed", value: "alertdialog" }],
      ["closeOnInteractOutside", { kind: "fixed", value: "false" }],
      ["closeOnEscape", { kind: "fixed", value: "false" }],
    ]);
  });

  it("reads an unquoted boolean as the literal it is, not as an expression", () => {
    // Marko attribute values are JS expressions, but a bare `false` is the
    // boolean false — the most common shape in the registry.
    const props = readMachineTagProps('<zag/api=() => m from=input closeOnEscape=false/>');

    expect(props.get("closeOnEscape")).toEqual({ kind: "fixed", value: "false" });
  });

  it("reads numbers and null as literals too", () => {
    const source = '<zag/api=() => m from=input maxFiles=3 ratio=1.5 fallback=null/>';
    const props = readMachineTagProps(source);

    expect(props.get("maxFiles")).toEqual({ kind: "fixed", value: "3" });
    expect(props.get("ratio")).toEqual({ kind: "fixed", value: "1.5" });
    expect(props.get("fallback")).toEqual({ kind: "fixed", value: "null" });
  });

  it("treats a non-literal expression that ignores the caller as fixed, with no value", () => {
    // `slideCount=slides.length` — the caller's `slideCount` never reaches
    // the machine, and the value is not statically knowable either.
    const props = readMachineTagProps("<zag/api=() => m from=input slideCount=slides.length/>");

    expect(props.get("slideCount")).toEqual({ kind: "fixed" });
  });

  it("treats a prop read back out of input as a passthrough, not fixed", () => {
    // `count=input.count ?? input.length`: the caller still controls it, so it
    // is neither fixed nor a default (the fallback cannot be evaluated).
    const props = readMachineTagProps(
      "<zag/api=() => m from=input count=input.count ?? input.length/>",
    );

    expect(props.get("count")).toEqual({ kind: "passthrough" });
  });

  it("reads a bracketed input lookup as a passthrough too", () => {
    const props = readMachineTagProps('<zag/api=() => m from=input value=input["value"]/>');

    expect(props.get("value")).toEqual({ kind: "passthrough" });
  });

  it("does not count a lookup of a DIFFERENT prop as this prop's passthrough", () => {
    const props = readMachineTagProps('<zag/api=() => m from=input value=input["aria-label"]/>');

    expect(props.get("value")).toEqual({ kind: "fixed" });
  });

  it("does not mistake a longer prop name for a passthrough", () => {
    // `input.countX` must not satisfy "reads input.count".
    const props = readMachineTagProps("<zag/api=() => m from=input count=input.countX/>");

    expect(props.get("count")).toEqual({ kind: "fixed" });
  });

  it("does not read attributes out of a props closure or a handler body", () => {
    // `raw = resolved[key]` inside the closure is a local, not a prop; a
    // scanner that walked it would document a prop the caller cannot set (and
    // one that does not exist).
    const source = [
      "<zag/api=() => colorPickerMachine from=input props=(picked) => {",
      "  const resolved = { ...picked };",
      "  for (const key of [\"value\"]) {",
      "    const raw = resolved[key];",
      "    if (raw === undefined) delete resolved[key];",
      "  }",
      "  return resolved;",
      "}",
      "  onValueChange(details: Details) {",
      "    input.valueChange?.(details.value.map(toPlain));",
      "  }",
      "/>",
    ].join("\n");

    const props = readMachineTagProps(source);

    expect([...props.keys()]).toEqual([]);
  });

  it("does not record the tag's own plumbing as props", () => {
    const props = readMachineTagProps(
      "<zag/api=() => machine from=input props=(picked) => ({ ...picked }) closeOnSelect=false/>",
    );

    expect([...props.keys()]).toEqual(["closeOnSelect"]);
  });

  it("reads the attributes that follow a multi-line props closure", () => {
    // calendar.marko's shape: a `props=` closure spanning several lines, with
    // the real props after it. The `=>` arrows and the `?:`/`??` inside must
    // not end the tag early.
    const source = [
      "<zag/api=() => datePickerMachine from=input props=(picked) => ({",
      "  ...picked,",
      "  value: input.value?.map(toDateValue),",
      "  min: input.min ? toDateValue(input.min) : undefined,",
      "})",
      "  open=true",
      "  inline=true",
      "  closeOnSelect=false",
      "  onValueChange(details: DatePickerChangeDetails) {",
      "    input.valueChange?.(details.value.map(toPlain));",
      "  }",
      "/>",
    ].join("\n");

    const props = readMachineTagProps(source);

    expect(props.get("open")).toEqual({ kind: "fixed", value: "true" });
    expect(props.get("inline")).toEqual({ kind: "fixed", value: "true" });
    expect(props.get("closeOnSelect")).toEqual({ kind: "fixed", value: "false" });
    // A handler is not a prop, and its body must not be mistaken for one.
    expect(props.has("onValueChange")).toBe(false);
    expect(props.has("details")).toBe(false);
    expect(props.has("valueChange")).toBe(false);
  });

  it("reads `<zag-machine>` the same way", () => {
    const props = readMachineTagProps(
      '<zag-machine/service=() => menu from=input onSelect((details) => { input.select?.(details); })/>',
    );

    expect([...props.keys()]).toEqual([]);
  });

  it("does not match `<zag-portal>`", () => {
    const props = readMachineTagProps('<zag-portal>content</zag-portal>');

    expect([...props.keys()]).toEqual([]);
  });

  it("stops at the tag's own `>` and ignores the markup after it", () => {
    const source = [
      '<zag/api=() => m from=input closeOnEscape=false/>',
      '<div role="button" closeOnInteractOutside={true}>after the tag</div>',
    ].join("\n");

    expect([...readMachineTagProps(source).entries()]).toEqual([
      ["closeOnEscape", { kind: "fixed", value: "false" }],
    ]);
  });

  it("returns nothing for a component with no machine tag", () => {
    expect([...readMachineTagProps('<div class="flex">text</div>').keys()]).toEqual([]);
  });

  it("handles single-quoted and empty attribute values", () => {
    const props = readMachineTagProps(
      "<zag/api=() => m from=input role='alertdialog' label=''/>",
    );

    expect(props.get("role")).toEqual({ kind: "fixed", value: "alertdialog" });
    expect(props.get("label")).toEqual({ kind: "fixed", value: "" });
  });
});