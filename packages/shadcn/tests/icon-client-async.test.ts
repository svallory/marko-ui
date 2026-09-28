// @vitest-environment happy-dom
/**
 * The registry (import-path) <Icon> ships only the default library to the
 * browser (resolve-client.ts) and loads any other library on demand. A
 * client-mounted <Icon> in a non-default library must therefore paint the
 * placeholder glyph first and then resolve to that library's real markup via
 * the async path; it must never stay empty or stay on the placeholder.
 *
 * The real, UNtransformed icon directory is copied into a temp dir inside this
 * package (so `#lib/*` resolves), compiled by @marko/vite for the browser (this
 * file's happy-dom environment selects the DOM output) and mounted.
 */
import { cpSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { hugeiconsIcons } from "../ui/icon/__hugeicons__.ts";
import { phosphorIcons } from "../ui/icon/__phosphor__.ts";
import { remixiconIcons } from "../ui/icon/__remixicon__.ts";
import { tablerIcons } from "../ui/icon/__tabler__.ts";
import { lucideIcons } from "../ui/icon/__lucide__.ts";
import { FALLBACK_INNER, renderHugeiconsNodes, withSuffixFallback } from "../ui/icon/render.ts";

const WORK = resolve(__dirname, ".icon-client-async");
let Icon: { mount(input: object, host: Element): unknown };

beforeAll(async () => {
  cpSync(resolve(__dirname, "../ui/icon"), join(WORK, "icon"), { recursive: true });
  Icon = (await import(/* @vite-ignore */ join(WORK, "icon", "icon.marko"))).default;
});
afterAll(() => rmSync(WORK, { recursive: true, force: true }));

const expected = {
  lucide: () => withSuffixFallback(lucideIcons, "SearchIcon")!,
  tabler: () => withSuffixFallback(tablerIcons, "SearchIcon")!,
  phosphor: () => withSuffixFallback(phosphorIcons, "SearchIcon")!,
  remixicon: () => withSuffixFallback(remixiconIcons, "SearchIcon")!,
  hugeicons: () => renderHugeiconsNodes(withSuffixFallback(hugeiconsIcons, "SearchIcon")!),
} as const;

// happy-dom re-serializes `<rect/>` as `<rect></rect>`; round-trip the
// expected markup through the DOM so both sides use the same serialization.
function norm(markup: string) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.innerHTML = markup;
  return svg.innerHTML;
}

function mount(library: string, name = "SearchIcon") {
  const host = document.createElement("div");
  document.body.appendChild(host);
  Icon.mount({ name, library }, host);
  return host.querySelector("svg")!;
}

describe("client-mounted <Icon> from the registry source", () => {
  test("default library resolves synchronously, no placeholder", () => {
    const svg = mount("lucide");
    expect(svg.innerHTML).toBe(norm(expected.lucide()));
    expect(svg.innerHTML).not.toBe(norm(FALLBACK_INNER));
  });

  test.each(["tabler", "phosphor", "remixicon", "hugeicons"] as const)(
    "%s paints the placeholder, then resolves to its own markup via the async path",
    async (library) => {
      const svg = mount(library);
      expect(svg.getAttribute("data-icon-library")).toBe(library);
      expect(svg.innerHTML).toBe(norm(FALLBACK_INNER));

      await vi.waitFor(() => expect(svg.innerHTML).not.toBe(norm(FALLBACK_INNER)));
      expect(svg.innerHTML).toBe(norm(expected[library]()));
      expect(svg.children.length).toBeGreaterThan(0);
    }
  );

  test("an unknown icon name in a non-default library settles on the placeholder, never empty", async () => {
    const svg = mount("tabler", "NoSuchIconAnywhere");
    await new Promise((r) => setTimeout(r, 50));
    expect(svg.innerHTML).toBe(norm(FALLBACK_INNER));
  });
});
