/**
 * Materialize the GET handler responses the static crawler cannot write.
 *
 * `@marko/run-adapter-static`'s crawler writes a non-HTML 200 response to disk
 * only when the request path carries a file extension (its `visit()` tests
 * `/\.\w+$/`); a non-HTML response at an extensionless path is aborted and
 * nothing is written. Two of this app's GET handlers live at such paths:
 *
 *   /typeset/css                  -> text/css
 *   /docs/components/<name>/md    -> text/markdown   (one per component)
 *
 * Both must keep working at their exact current URLs, so this script invokes
 * the same handler modules the server used and writes each body to a file at
 * the literal request path — `dist/public/typeset/css`, with no extension.
 *
 * Writing it extensionless is deliberate and is the only shape that works.
 * Cloudflare's asset server matches non-HTML assets by EXACT pathname; its
 * `html_handling` index resolution (`/folder` -> `/folder/index.html`) applies
 * to `.html` only, so there is no `index.css`/`index.md` equivalent to lean on
 * (verified against the html-handling routing tables). The trade-off is that
 * an extensionless file has no content type to infer, so `public/_headers`
 * declares one for each of these paths — see the entries there.
 *
 * Deliberately NOT a second implementation: the handlers are imported and
 * called, so their logic (and any future change to it) stays the single source
 * of truth. If a handler starts depending on request context this script does
 * not supply, it throws here rather than silently emitting a wrong file.
 *
 * `/docs/components/<name>.md` — the canonical markdown URL — needs none of
 * this: it has an extension, so the crawler writes it directly.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { DOCUMENTED_COMPONENTS } from "../src/lib/component-page-data.ts";

/** Where `marko-run build` put the static output. */
const OUT_DIR = path.resolve(import.meta.dirname, "../dist/public");

interface Written {
  url: string;
  bytes: number;
}

/**
 * Write one handler response to `dist/public/<url>`.
 *
 * A non-200 is fatal: every URL here is expected to exist, so anything else
 * means the handler or the component list changed and the deploy would ship a
 * missing page. Failing the build is how that stays visible.
 */
async function write(url: string, response: Response): Promise<Written> {
  if (response.status !== 200) {
    throw new Error(`${url} -> HTTP ${response.status}; expected 200.`);
  }

  const file = path.join(OUT_DIR, url);
  const body = await response.text();

  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);

  return { url, bytes: Buffer.byteLength(body) };
}

async function main(): Promise<void> {
  const written: Written[] = [];

  // /typeset/css — the raw stylesheet artifact.
  {
    const { GET } = await import("../src/routes/typeset/css/+handler.ts");
    written.push(await write("/typeset/css", await GET()));
  }

  // /docs/components/<name>/md — the markdown alias, one per component.
  {
    const { GET } = await import("../src/routes/docs/components/$name/md/+handler.ts");
    for (const name of DOCUMENTED_COMPONENTS) {
      written.push(await write(`/docs/components/${name}/md`, GET({ params: { name } })));
    }
  }

  const bytes = written.reduce((total, entry) => total + entry.bytes, 0);
  console.log(
    `prerender-handlers: wrote ${written.length} files ` +
      `(${(bytes / 1024).toFixed(1)} kB) for the extensionless GET handlers`,
  );
}

await main();
