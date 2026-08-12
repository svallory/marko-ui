// Raw-markdown twin of /docs/components/$name — shadcn's llm/[[...slug]]
// route. This is what the Copy Page button fetches, what "View as Markdown"
// links to, and what the Open-in-Claude/ChatGPT prompts point an assistant at.
//
// URL is /docs/components/<name>/md rather than shadcn's `<name>.md`: in
// @marko/run a period is the flat-route segment separator, so `$name.md/`
// declares the route `/docs/components/$name/md` no matter how it is spelled.
// Fighting that would mean matching `.md` inside the $name param and
// re-dispatching, which trades a clean route table for a cosmetic URL.
import { getComponentPageData } from "../../../../../lib/component-page-data.ts";
import { renderComponentMarkdown } from "../../../../../lib/component-markdown.ts";

export const GET = (context: { params: { name: string } }) => {
  const page = getComponentPageData(context.params.name);

  if (!page) {
    return new Response(`# Not found\n\nNo documentation for "${context.params.name}".\n`, {
      status: 404,
      headers: { "content-type": "text/markdown; charset=utf-8" },
    });
  }

  return new Response(renderComponentMarkdown(page), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      // Same cacheability as the HTML page it mirrors.
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
};
