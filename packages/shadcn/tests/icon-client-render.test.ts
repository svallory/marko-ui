// @vitest-environment happy-dom
/**
 * A client-mounted <Icon> (an overlay opened after hydration, a conditional
 * branch) runs the component's DOM output in the browser, not its SSR output.
 * The add-time transform (`marko-ui add` with a components.json `iconLibrary`)
 * rewrites resolve.ts to import one library's map statically, so this must
 * render real SVG children synchronously: round 1 of perf/icon-chunks broke
 * exactly this path (empty <svg> in dropdowns opened after load).
 *
 * The transformed icon directory is written to a temp dir INSIDE this package
 * (so `#lib/*` resolves), compiled by @marko/vite for the browser (this file's
 * happy-dom environment selects the DOM output), and mounted into happy-dom.
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, test } from "vitest";
import {
  applyIconLibrary,
  ICON_LIBRARIES,
  type IconLibraryName,
} from "../../marko-ui/src/utils/icon-library";

const ICON_DIR = resolve(__dirname, "../ui/icon");
const WORK = resolve(__dirname, ".icon-client-render");
const LIBRARIES = Object.keys(ICON_LIBRARIES) as IconLibraryName[];
const FALLBACK = '<rect width="18" height="18" x="3" y="3" rx="2"/>';

// Same file-level transform `updateFiles` performs, applied to the real
// registry source files.
function copyTransformed(lib: IconLibraryName) {
  const out = join(WORK, lib, "icon");
  mkdirSync(out, { recursive: true });
  const files = readdirSync(ICON_DIR).map((name) => ({
    path: `ui/icon/${name}`,
    type: "registry:file" as const,
    target: `~/${name}`,
    content: readFileSync(join(ICON_DIR, name), "utf8"),
  }));
  for (const file of applyIconLibrary(files, lib)!) {
    writeFileSync(join(out, file.path.replace("ui/icon/", "")), file.content!);
  }
  return out;
}

afterAll(() => rmSync(WORK, { recursive: true, force: true }));

describe("client-mounted <Icon> from the add-time transformed copy", () => {
  test.each(LIBRARIES)("%s renders real SVG in the browser", async (lib) => {
    const dir = copyTransformed(lib);
    const Icon = (await import(/* @vite-ignore */ join(dir, "icon.marko"))).default;

    const host = document.createElement("div");
    document.body.appendChild(host);
    // A different library on the prop must not matter: the copy is fixed to `lib`.
    Icon.mount({ name: "Search", library: lib === "lucide" ? "tabler" : "lucide" }, host);

    const svg = host.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("data-icon-library")).toBe(lib);
    expect(svg!.children.length).toBeGreaterThan(0);
    expect(svg!.innerHTML).not.toBe(FALLBACK);
    expect(svg!.innerHTML).toContain("<");
  });
});
