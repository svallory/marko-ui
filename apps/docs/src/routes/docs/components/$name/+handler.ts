// Serves /docs/components/<name>.md — the standard "append .md to the page
// URL" convention (shadcn's site and the llms.txt ecosystem do the same).
// @marko/run treats a period as the flat-route segment separator, so a
// `$name.md` ROUTE cannot be declared — but a dynamic $name segment happily
// MATCHES "button.md", so this handler catches the suffix inside the param
// and falls through to the page for everything else. The older
// /docs/components/<name>/md route stays as an alias (see ./md/+handler.ts).
import { getComponentPageData } from "../../../../lib/component-page-data.ts";
import { renderComponentMarkdown } from "../../../../lib/component-markdown.ts";

export const GET = (
  context: { params: { name: string } },
  next: () => Promise<Response>
) => {
  const { name } = context.params;

  if (!name.endsWith(".md")) {
    return next();
  }

  const page = getComponentPageData(name.slice(0, -".md".length));

  if (!page) {
    return new Response(`# Not found\n\nNo documentation for "${name}".\n`, {
      status: 404,
      headers: { "content-type": "text/markdown; charset=utf-8" },
    });
  }

  return new Response(renderComponentMarkdown(page), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
};
