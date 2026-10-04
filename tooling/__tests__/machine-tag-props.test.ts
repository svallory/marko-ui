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
  it("reads the literal attributes alert-dialog passes", () => {
    const source = [
      '<zag/api=() => dialogMachine from=input',
      '  role="alertdialog"',
      "  closeOnInteractOutside=false",
      "  closeOnEscape=false",
      "/>",
    ].join("\n");

    expect([...readMachineTagProps(source)]).toEqual([
      ["role", "alertdialog"],
      ["closeOnInteractOutside", "false"],
      ["closeOnEscape", "false"],
    ]);
  });

  it("reads an unquoted boolean as the literal it is, not as an expression", () => {
    // Marko attribute values are JS expressions, but a bare `false` is the
    // boolean false — the most common shape in the registry.
    const props = readMachineTagProps('<zag/api=() => m from=input closeOnEscape=false/>');

    expect(props.get("closeOnEscape")).toBe("false");
  });

  it("reads numbers and null as literals too", () => {
    const source = '<zag/api=() => m from=input maxFiles=3 ratio=1.5 fallback=null/>';
    const props = readMachineTagProps(source);

    expect(props.get("maxFiles")).toBe("3");
    expect(props.get("ratio")).toBe("1.5");
    expect(props.get("fallback")).toBe("null");
  });

  it("marks a non-literal expression as not statically knowable", () => {
    const props = readMachineTagProps(
      "<zag/api=() => m from=input count=input.count ?? input.length/>",
    );

    expect(props.get("count")).toBeNull();
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

    expect(props.get("open")).toBe("true");
    expect(props.get("inline")).toBe("true");
    expect(props.get("closeOnSelect")).toBe("false");
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

    expect([...readMachineTagProps(source).entries()]).toEqual([["closeOnEscape", "false"]]);
  });

  it("returns nothing for a component with no machine tag", () => {
    expect([...readMachineTagProps('<div class="flex">text</div>').keys()]).toEqual([]);
  });

  it("handles single-quoted and empty attribute values", () => {
    const props = readMachineTagProps(
      "<zag/api=() => m from=input role='alertdialog' label=''/>",
    );

    expect(props.get("role")).toBe("alertdialog");
    expect(props.get("label")).toBe("");
  });
});