// Serves the raw typeset.css stylesheet as a downloadable/curl-able artifact,
// the analog of shadcn/ui's own `/typeset.css` route. @marko/run treats a
// period as the flat-route segment separator (see
// ../../docs/components/$name/md/+handler.ts), so `/typeset.css` cannot be
// declared directly; `/typeset/css` is the closest reachable URL.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CSS_PATH = fileURLToPath(new URL("../../../tags/typeset/typeset.css", import.meta.url));
const CSS_TEXT = readFileSync(CSS_PATH, "utf-8");

export const GET = () => {
  return new Response(CSS_TEXT, {
    headers: {
      "content-type": "text/css; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
};
