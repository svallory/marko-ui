import { describe, expect, it } from "vitest";
import { getComponentPageData } from "../component-page-data.ts";
import { renderComponentMarkdown } from "../component-markdown.ts";

// A prop the component fixes on its own `<zag>` tag cannot be changed by the
// caller, so its Default cell says so rather than showing a value the reader
// would read as "the value you get if you pass nothing". One legend line
// explains the cell, on parts that have one, above the table.
describe("the fixed legend in the rendered markdown", () => {
  const alertDialog = renderComponentMarkdown(getComponentPageData("alert-dialog")!);
  const button = renderComponentMarkdown(getComponentPageData("button")!);

  it("appears under the Props heading and before the first prop line", () => {
    const legendAt = alertDialog.indexOf("`fixed` means");
    const propsAt = alertDialog.indexOf("## Props");
    const firstPropAt = alertDialog.indexOf("- closeOnEscape:");

    expect(legendAt).toBeGreaterThan(propsAt);
    expect(legendAt).toBeLessThan(firstPropAt);
  });

  it("says the caller's value is ignored", () => {
    const legend = alertDialog.slice(alertDialog.indexOf("`fixed` means")).split("\n")[0] ?? "";

    expect(legend).toContain("you pass is ignored");
  });

  it("is absent on a component with no fixed prop", () => {
    expect(button).not.toContain("`fixed` means");
    expect(button).toContain("## Props");
  });

  it("marks the fixed cells themselves", () => {
    expect(alertDialog).toContain("- closeOnEscape: boolean = fixed false");
    expect(alertDialog).toContain("- role: 'dialog' | 'alertdialog' = fixed alertdialog");
  });
});
