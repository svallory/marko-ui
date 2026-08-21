# Deploying to Coolify

`apps/docs` (Marko + `@marko/run` 0.11.9, Vite) also serves the marko-ui
registry as static JSON under `/r/*` (generated into `apps/docs/public/r` by
`tooling/build-registry.ts` — that directory is
`.gitignore`d, never committed, always built fresh). One image, one
deployment, covers docs + registry.

## Production server

`@marko/run` ships a built-in Node adapter (no separate
`@marko/run-adapter-node` package needed for this setup — `apps/docs` has no
adapter configured in `vite.config.ts`, so it uses the default). `marko-run
build` compiles the app to `apps/docs/dist/index.mjs`, a Node HTTP server
(`http.createServer(...).listen(PORT)`, default `PORT=3000`) that serves
`dist/public/**` (including `dist/public/r/*.json`) with gzip/deflate
compression and routes everything else through the app's middleware.

Important: `dist/index.mjs` is **not** a fully bundled/standalone file — it
still imports `marko`, `@zag-js/*`, `valibot`, `compression`, `serve-static`,
etc. as bare specifiers, resolved from `node_modules` at runtime. The Docker
runtime stage installs production dependencies for this reason; don't try to
ship just `dist/` on its own.

## Dockerfile

Root-level, multi-stage, `oven/bun` base:

1. **deps** — copies workspace `package.json` files + `bun.lock`, runs
   `bun install --frozen-lockfile` (full install, needed for the Vite/Tailwind
   build toolchain).
2. **build** — copies the full source tree plus the installed
   `node_modules` from `deps`, rebuilds the registry with
   `REGISTRY_BASE_URL` (build-arg, defaults to `https://marko-ui.saulo.tech/r`),
   then runs `bun run --cwd apps/docs build`.
3. **runtime** — slim stage. Re-installs with `bun install --frozen-lockfile
   --production` (workspace-aware, production deps only — smaller than
   copying the full `deps` node_modules), then copies in `apps/docs/dist`
   from the `build` stage. Runs `bun dist/index.mjs`, listens on `PORT`
   (defaults to 3000, `EXPOSE 3000`).

Build-arg:

```
docker build --build-arg REGISTRY_BASE_URL=https://marko-ui.saulo.tech/r -t marko-ui-docs .
```

The default already matches production, so a plain `docker build .` is
correct for Coolify; the build-arg exists to let you build a local-URL image
for testing without editing the Dockerfile.

## Coolify setup

1. **New Resource → Application → Public Repository (or GitHub App if
   connected) → `svallory/marko-ui`.**
2. **Build Pack: Dockerfile.** Coolify auto-detects the root `Dockerfile`;
   confirm it's selected (not Nixpacks).
3. **Branch:** `main`.
4. **Build arguments:** add `REGISTRY_BASE_URL=https://marko-ui.saulo.tech/r`
   (matches the Dockerfile default — set explicitly anyway so it's visible
   in the Coolify UI and survives a Dockerfile default change).
5. **Port:** 3000 (matches `EXPOSE 3000` / the adapter's default `PORT`).
   Coolify injects its own `PORT` env var into the container if you let it
   manage the mapping — leave the app's `PORT` env unset in Coolify unless
   you need to override it; the image defaults to 3000 either way.
6. **Domain:** `marko-ui.saulo.tech`. Add it in the application's Domains
   tab, let Coolify issue the Let's Encrypt certificate.
7. **Deploy.** Watch the build log for the two `RUN` steps
   (`build-registry.ts`, `marko-run build`) — a failure there most likely
   means a component in `packages/shadcn` was added without a matching
   entry in `apps/docs/package.json` dependencies (see note below).
8. Health check: hit `https://marko-ui.saulo.tech/` (docs home) and
   `https://marko-ui.saulo.tech/r/registry.json` (registry index) after
   deploy.

## CI check

Keep the registry output honest before every deploy:

```
bun run build:registry && git diff --exit-code
```

`apps/docs/public/r/` is gitignored, so this specific invocation (no
`REGISTRY_BASE_URL` override, i.e. `localhost:3000/r` URLs) is really
guarding `packages/shadcn/**` and
`tooling/build-registry.ts` — it fails if the registry
build script itself throws, or if a source change breaks the build. Run it
as a required CI check before merging to `main`, since Coolify deploys
straight from `main` with the production `REGISTRY_BASE_URL` and won't
catch a broken build until deploy time otherwise.

## Known risk: dependency completeness

`@marko/run build`'s output imports every runtime package the bundled
routes actually use (`marko`, `@zag-js/*`, `valibot`, ...) as external,
unbundled specifiers. Under bun's isolated-linking install, a package is
only resolvable from `apps/docs` if `apps/docs/package.json` (or an
ancestor workspace) declares it — a dependency declared only in
`packages/shadcn/package.json` is not automatically reachable from
`apps/docs/dist/index.mjs` in a clean install. A local dev checkout can mask
this (stale/orphaned symlinks from an earlier `bun install` can leave a
package resolvable at the workspace root even after it's no longer declared
anywhere), but a fresh clone + `bun install` — exactly what the Docker build
does — will fail hard and immediately if `apps/docs/package.json` is
missing a dependency that `dist/index.mjs` needs at runtime.

If a Coolify build fails with `Cannot find module '@zag-js/...'` (or
similar) during the `runtime` stage's `bun install --production`, or the
container crashes on start with `ERR_MODULE_NOT_FOUND`, add the missing
package directly to `apps/docs/package.json` dependencies — don't rely on
`packages/shadcn` declaring it.
