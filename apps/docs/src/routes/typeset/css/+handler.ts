// Serves the raw typeset.css stylesheet as a downloadable/curl-able artifact,
// the analog of shadcn/ui's own `/typeset.css` route. @marko/run treats a
// period as the flat-route segment separator (see
// ../../docs/components/$name/md/+handler.ts), so `/typeset.css` cannot be
// declared directly; `/typeset/css` is the closest reachable URL.
// Imported with Vite's `?raw` so the text is inlined at BUILD time — a
// module-scope readFileSync of the source path crashed the production
// container on boot (the source tree does not ship in dist/index.mjs).
import CSS_TEXT from "../../../tags/typeset/typeset.css?raw";

export const GET = () => {
  return new Response(CSS_TEXT, {
    headers: {
      "content-type": "text/css; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
};
