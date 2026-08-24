# Vite plugin, adapters, CLI

## Vite plugin
```ts
import { defineConfig } from "vite";
import marko from "@marko/run/vite";
export default defineConfig({ plugins: [marko({ /* options */ })] });
```
Options: `routesDir` (default `src/routes`; don't change), `adapter` (explicit instance, or `null` to disable discovery), `trailingSlashes` (`RedirectWithout` default | `RedirectWith` | `RewriteWithout` | `RewriteWith` | `Ignore`; redirects recommended for canonical URLs), plus every `@marko/vite` option (e.g. `runtimeId`, `linked`).

## Adapters
Resolution: plugin `adapter` → first `package.json` dep starting `@marko/run-adapter` or containing `marko-run-adapter` → built-in Node.

- **Node** `@marko/run-adapter-node`: standalone server + middleware for Connect/Express:
  ```ts
  import { routerMiddleware, matchMiddleware } from "@marko/run-adapter-node/middleware";
  app.use(routerMiddleware());                         // option A: fully handles matching routes
  // option B (pick one, not both): match first, run other middleware, then invoke
  app.use(matchMiddleware()).use((req,res,next)=> req.route ? req.route.invoke(req,res,next) : next()); // req.route.config = meta
  ```
- **Static** `@marko/run-adapter-static`: prerenders known routes + crawls relative links; `staticAdapter({ urls: ["/products/lamp"] | async (routes) => string[] })`.
- **Netlify** `@marko/run-adapter-netlify`: `netlifyAdapter({ edge?: true })`; `netlify.toml` → `[build] command="marko-run build" publish="dist/public" functions="dist"` (or `edge_functions="dist"`).
- Custom: implement `Adapter` from `@marko/run/vite` (dev/build/preview hooks); official adapters are reference impls.

## CLI `marko-run`
Common: `-c/--config <vite config>`, `-e/--env <dotenv>`.
- `dev` (default): `-p/--port` (server.port → preview.port → `PORT` → 3000).
- `build`: `-o/--output` (build.outDir).
- `preview`: build + prod-like server; `-o`, `-p`, `-f/--file` entry to start.

## Scaffold
`npm init marko` (pick template) → `cd`, `dev`. Manual: install `@marko/run`, create `src/routes/+page.marko`, run `marko-run`. Here: use `bun`/`bunx` equivalents.
