// Serves GET /demos.json per PROTOCOL.md: the flat list of demo names this
// harness's server can render, sourced from the same demos-manifest.ts the
// /demo/$name route resolves against.
//
// @marko/run treats a literal "." in a route SEGMENT as a path separator
// (a routes/demos.json/ directory maps to the route "/demos/json", not
// "/demos.json" — the same quirk documented in apps/docs/src/routes/docs/
// components/$name/md/+handler.ts), so "/demos.json" cannot be declared as
// a literal directory. A dynamic $file segment captures it instead (same
// technique as ../docs/components/$name/+handler.ts's ".md" suffix catch),
// falling through to the next route for every other single-segment path.
import { DEMOS } from "../../../../../../../apps/docs/src/demos/demos-manifest.ts";

export const GET = (context: { params: { file: string } }, next: () => Promise<Response>) => {
  if (context.params.file !== "demos.json") return next();

  const names = Object.values(DEMOS).flatMap((component) => Object.keys(component.demos));
  return new Response(JSON.stringify(names), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
