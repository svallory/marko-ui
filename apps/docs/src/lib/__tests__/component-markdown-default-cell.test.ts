import { describe, expect, it } from "vitest";
import { defaultCell } from "../component-markdown.ts";

// The markdown payload is the reader's only view of the API, and it renders
// the Default column straight from api-reference.json. A prop the component
// FIXES on its own `<zag>` tag must never appear there as a default:
// marko-zag merges the tag's attributes last, so `<AlertDialog
// closeOnEscape=true>` is silently ignored and "Default `false`" would be an
// invitation the reader cannot take up.
describe("defaultCell", () => {
  it("renders a real default as code", () => {
    expect(defaultCell({ default: "false" })).toBe("`false`");
  });

  it("renders a known fixed value as `fixed: <value>`", () => {
    expect(defaultCell({ fixed: "alertdialog" })).toBe("`fixed: alertdialog`");
    expect(defaultCell({ fixed: "false" })).toBe("`fixed: false`");
  });

  it("renders a fixed value of unknown magnitude as plain `fixed`", () => {
    // `slideCount=slides.length` — the caller's value is still ignored, but the
    // value is not statically knowable.
    expect(defaultCell({ fixed: true })).toBe("`fixed`");
  });

  it("never says default for a fixed prop, whatever order the fields arrive in", () => {
    // extract-api never writes both, but the renderer must not be the thing
    // that decides which claim wins if it ever does.
    expect(defaultCell({ default: "true", fixed: "alertdialog" })).toBe("`fixed: alertdialog`");
    expect(defaultCell({ default: "true", fixed: true })).toBe("`fixed`");
  });

  it("renders an em dash when nothing is known", () => {
    expect(defaultCell({})).toBe("—");
    expect(defaultCell({ default: "" })).toBe("—");
  });
});