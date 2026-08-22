# Publishing a port

## Community registry path (any library not on the wanted list)

1. **Start from the template**: `https://github.com/svallory/marko-ui-registry-template` (components.json + tsconfig aliases + registry.json + GitHub Pages CI, one example component).
2. **Author** components under `src/ui/<name>/`, shared helpers under `src/lib/`.
3. **Index** each component in `registry.json`:

   ```json
   {
     "name": "accordion",
     "type": "registry:ui",
     "title": "Accordion",
     "description": "...",
     "files": [
       { "path": "src/ui/accordion/accordion.marko", "type": "registry:ui" }
     ]
   }
   ```

   List only entry files — `marko-ui registry build` walks the import graph, pulling local imports in as extra files and bare imports in as npm `dependencies` automatically.
4. **Build + validate**:

   ```bash
   bunx marko-ui registry build            # registry.json -> public/r/<name>.json
   bunx marko-ui registry validate ./registry.json   # exit 3 on schema problems
   ```

5. **Smoke-test an install** into a scratch Marko project:

   ```bash
   bunx marko-ui add https://<your-host>/r/<name>.json
   ```

6. **Deploy** `public/` (the template's GitHub Actions workflow publishes to GitHub Pages on push to main).
7. **Get listed**: open a PR against `svallory/marko-ui` adding ONE entry to `apps/docs/src/data/directory.json`:

   ```json
   {
     "name": "@your-namespace",
     "homepage": "https://your-site.example.com",
     "url": "https://<your-host>/r/{name}.json",
     "description": "One sentence about what you ship.",
     "target": "marko",
     "logo": "<svg ...>square inline SVG, fill via var(--foreground)</svg>"
   }
   ```

   Contract (CLI-enforced): `target` must be `"marko"`; `url` must contain the literal `{name}` placeholder; the registry must be open source and validate clean. The PR should link your repo and your verification report.

## Official-repo path (wanted-list libraries only)

1. You already forked `svallory/marko-ui` at step 0 and worked on a branch.
2. Components live in `packages/shadcn/ui/<name>/` with a `registry.meta.json` per component (`title`, `description`, `dependencies`, `registryDependencies`). The repo's registry build (`bun run build:registry`) picks them up — no registry.json editing.
3. Follow the repo's own conventions over this skill wherever they differ: `CLAUDE.md`, `notes/component-authoring.md`, `/docs/creating-components`, `/docs/zag-adapter`.
4. Demos: each component needs its demo page(s) so the verify-matrix covers it.
5. Pass the full gate (`references/verification.md` §Official-repo gate), then open the PR: conventional-commit title, verification evidence + deviation log in the description.
6. Expect review on parity and maintenance cost — wanted-list ports become officially maintained code, which is exactly why the list is short.
