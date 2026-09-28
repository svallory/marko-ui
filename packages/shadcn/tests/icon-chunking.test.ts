/**
 * Regression guard for the icon-chunks fix (TODO.md "Icon bundle
 * code-splitting doesn't land as separate network chunks"): icon.marko's
 * import of resolve.ts (which statically imports all 5 per-library icon
 * maps, ~360KB combined) must stay a `server import` so it never reaches a
 * client bundle for ANY route that renders <icon> — not just /create/preview.
 * A plain `import` here silently re-opens the leak (verified: reverting to
 * plain `import` and rebuilding apps/docs put all 5 libraries back in
 * every route's client chunk that renders an icon, e.g. docs/components/
 * button.html went from 21KB to 106KB gzip).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import Icon from "../ui/icon/icon.marko";

const ICON_MARKO_PATH = fileURLToPath(new URL("../ui/icon/icon.marko", import.meta.url));

describe("icon.marko keeps resolve.ts server-only", () => {
  test("imports resolve.ts with `server import`, not a plain import", () => {
    const source = readFileSync(ICON_MARKO_PATH, "utf-8");
    expect(source).toMatch(/^server import \{ resolveIconInner \} from ".\/resolve\.ts";$/m);
    expect(source).not.toMatch(/^import \{ resolveIconInner \} from ".\/resolve\.ts";$/m);
  });

  test("still renders SSR markup for every library correctly", async () => {
    for (const library of ["lucide", "tabler", "phosphor", "remixicon", "hugeicons"] as const) {
      const out = await Icon.render({ name: "SearchIcon", library }).toString();
      expect(out).toContain(`data-icon-library=${library}`);
      expect(out).toContain(`data-icon-name=SearchIcon`);
      expect(out).toContain("<svg");
      expect(out).toContain("</svg>");
    }
  });
});
