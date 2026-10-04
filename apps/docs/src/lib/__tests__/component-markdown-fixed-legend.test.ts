import { describe, expect, it } from "vitest";
import { getComponentPageData } from "../component-page-data.ts";
import { renderComponentMarkdown } from "../component-markdown.ts";

// `fixed: X` under a column headed "Default" reads, to an agent, like part of
// the value. One line above the table says what it means — and only where it
// is needed, so a page with no fixed prop is not carrying a legend for a
// concept it never uses.
describe("the fixed legend in the rendered markdown", () => {
  const alertDialog = renderComponentMarkdown(getComponentPageData("alert-dialog")!);
  const button = renderComponentMarkdown(getComponentPageData("button")!);

  it("appears above the table when a part has a fixed prop", () => {
    const legendAt = alertDialog.indexOf("`fixed: X`");
    const tableAt = alertDialog.indexOf("| Prop | Type | Default | Description |");

    expect(legendAt).toBeGreaterThan(-1);
    // Above the header row, never between the header and the body — prose in
    // that gap ends the table for most markdown renderers.
    expect(legendAt).toBeLessThan(tableAt);
  });

  it("says both what fixed means and that the caller's value is ignored", () => {
    const legend = alertDialog.slice(alertDialog.indexOf("`fixed: X`")).split("\n")[0] ?? "";

    expect(legend).toContain("component sets this value itself");
    expect(legend).toContain("ignored");
  });

  it("is absent on a component with no fixed prop", () => {
    expect(button).not.toContain("`fixed: X`");
    expect(button).toContain("| Prop | Type | Default | Description |");
  });

  it("still renders the fixed cells themselves", () => {
    expect(alertDialog).toContain("| `closeOnEscape` | `boolean \\| undefined` | `fixed: false` |");
    expect(alertDialog).toContain("| `role` | `'dialog' \\| 'alertdialog' \\| undefined` | `fixed: alertdialog` |");
  });
});