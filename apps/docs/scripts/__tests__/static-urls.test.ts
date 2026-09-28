import { describe, expect, it } from "vitest";
import type { Route } from "@marko/run/vite";

import { staticUrls } from "../../vite.config.ts";
import { COMPONENTS } from "../../src/lib/components-list.ts";

// Minimal fixture matching the fields staticUrls() actually reads
// (route.path.path, route.path.params).
function route(path: string, params?: Record<string, number | null>): Route {
  return {
    key: path,
    index: 0,
    path: { id: path, path, segments: path.split("/").filter(Boolean), params },
    layouts: [],
    middleware: [],
  } as Route;
}

describe("staticUrls", () => {
  it("never duplicates a path the adapter already gets from a parameterless route", () => {
    // "chart" has its own generated static route, same as the vast majority
    // of COMPONENTS — the adapter already visits it via routes.list, so
    // staticUrls() must not push it again.
    expect(COMPONENTS).toContain("chart");
    const routes = COMPONENTS.map((name) => route(`/docs/components/${name}`));

    const urls = staticUrls(routes);

    expect(urls).not.toContain("/docs/components/chart");
    // The .md twins are never covered by a parameterless HTML route, so they
    // must still be present.
    expect(urls).toContain("/docs/components/chart.md");
    expect(urls).toContain("/docs/components/chart/md");
  });

  it("still lists the HTML page for a component with no static route (served only via $name)", () => {
    // Simulate a component whose only route is the dynamic $name fallback:
    // omit it from the fixture routes list entirely.
    const onlyDynamic = COMPONENTS[0];
    const routes = COMPONENTS.filter((name) => name !== onlyDynamic).map((name) =>
      route(`/docs/components/${name}`),
    );

    const urls = staticUrls(routes);

    expect(urls).toContain(`/docs/components/${onlyDynamic}`);
    expect(urls).toContain(`/docs/components/${onlyDynamic}.md`);
  });

  it("returns no duplicate entries at all", () => {
    const routes = COMPONENTS.map((name) => route(`/docs/components/${name}`));

    const urls = staticUrls(routes);

    expect(urls.length).toBe(new Set(urls).size);
  });

  it("does not push a path for a dynamic (parameterized) route", () => {
    const routes = [
      ...COMPONENTS.map((name) => route(`/docs/components/${name}`)),
      route("/docs/components/$name", { name: 0 }),
    ];

    const urls = staticUrls(routes);

    expect(urls).not.toContain("/docs/components/$name");
  });
});
