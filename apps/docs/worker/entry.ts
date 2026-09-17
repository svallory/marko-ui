/**
 * The Worker's Marko half: renders /no-js-form through the REAL templates.
 *
 * Why not re-export `@marko/run/router` (which is all the default server entry
 * does)? Because that pulls the whole route table into the bundle — all 86
 * component pages and, through them, every Zag machine. Measured: 7.28 MB raw
 * / 1.31 MB gzipped, over the Workers size limit, to serve ONE route.
 *
 * Importing just the layout and the one page instead keeps the Worker small
 * while still rendering the genuine templates, so the POST response carries
 * the same markup, the same asset links and the same <FieldError> output as
 * the statically built page. The alternative — hand-writing the HTML in the
 * Worker — would duplicate the page and drift from it silently, which is
 * exactly what packages/shadcn/tests/behavior/no-js-form.test.ts exists to
 * catch.
 *
 * `$global` is supplied explicitly here because there is no @marko/run router
 * to build it: the layout reads `$global.url` (to decide chrome) and the page
 * reads `$global.data` (the validation result).
 */
import Layout from "../src/routes/+layout.marko";
import NoJsFormPage from "../src/routes/no-js-form/+page.marko";
import type { NoJsFormData } from "../src/lib/no-js-form-schema.ts";

/**
 * Render the no-js-form page, wrapped in the site layout, to a full HTML
 * document string.
 */
export function renderNoJsForm(url: URL, data: NoJsFormData): ReadableStream<Uint8Array> {
  const rendered = Layout.render({
    // The layout renders `<${input.content}/>` in its <main>.
    content: NoJsFormPage,
    $global: { url, data },
  });

  // Streamed rather than awaited into a string: `toString()` is synchronous
  // and would not wait for async content, and buffering the whole document
  // has no upside here. `toReadable()` is a web ReadableStream, which is what
  // a Worker Response wants anyway.
  return rendered.toReadable();
}
