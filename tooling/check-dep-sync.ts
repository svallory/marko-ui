/**
 * Fails when dependency versions drift between workspace packages.
 *
 * Run: bun tooling/check-dep-sync.ts   (part of `check:tooling`)
 *
 * Two independent checks:
 *
 *  1. **Cross-package agreement** — a dependency declared in more than one
 *     workspace `package.json` must carry the same version range in all of
 *     them. A split range is how two copies of a package end up installed,
 *     which this repo has been burned by twice: two `@zag-js/types` make any
 *     `PropTypes` annotation resolve against the wrong copy, and two
 *     `@marko/compiler` instances break the docs production build with
 *     "Unable to access Marko File outside of a compilation".
 *
 *  2. **Exact-pin enforcement** — packages in `NEEDS_EXACT` must be declared
 *     as a bare version, never a range, wherever they are *installed*. A
 *     `^` on these is what lets a routine `bun update` walk the tree off the
 *     version the repo is verified against.
 *
 * Intentional divergences live in `ALLOWED_DIVERGENCES` below, each with the
 * reason it exists and what would let it be removed. Nothing else is exempt:
 * if a new divergence is legitimate it gets an entry and a justification, and
 * if it is not, this script fails and the versions get aligned.
 *
 * Peer ranges are deliberately NOT compared against installed versions: a
 * published package's peer range is a compatibility statement for consumers,
 * so `marko: "^6.3.46"` as a peer alongside `marko: "6.3.46"` as a devDep is
 * correct, not drift. Peer-only declarations are skipped entirely.
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

/**
 * Packages that must be declared as an exact version everywhere they are
 * installed, and why.
 */
const NEEDS_EXACT: Record<string, string> = {
  marko: "pinned to 6.3.46; bumping needs a regression sweep (see AGENTS.md)",
  "@marko/compiler": "must resolve to exactly one instance workspace-wide",
  "marko-zag": "release-candidate; a silent bun update once downgraded it to 1.2.1",
  "@internationalized/date": "travels with the @zag-js date machines",
};

/** Every `@zag-js/*` package is exact-pinned too; they must share one version. */
const ZAG_SCOPE = "@zag-js/";

/**
 * Divergences that are intentional. Each entry must say why, and what would
 * let it go away — an entry without a live reason is a bug, not a waiver.
 */
const ALLOWED_DIVERGENCES: { dependency: string; reason: string }[] = [
  {
    dependency: "typescript",
    // packages/marko-ui builds with tsup + `dts: true`, whose rollup-plugin-dts
    // needs the classic TypeScript compiler API. typescript@7 (tsgo) ships none,
    // so that build dies with
    //   TypeError: Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')
    // Verified 2026-08-30 by bumping it to ^7.0.2 and running `bun run build`.
    // Removable once rollup-plugin-dts (or tsup's dts step) supports TS 7, or
    // the package stops emitting declarations from tsup.
    reason:
      "packages/marko-ui pins ^5.9.2: tsup's dts step needs the TS 5 compiler API, which typescript@7 does not ship",
  },
];

interface Declaration {
  package: string;
  field: string;
  version: string;
}

/** Workspace members, resolved from the root package.json `workspaces` globs. */
async function workspacePackageFiles(): Promise<string[]> {
  const rootManifest = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
  const globs: string[] = rootManifest.workspaces ?? [];
  const files = [join(ROOT, "package.json")];
  for (const glob of globs) {
    if (glob.endsWith("/*")) {
      const dir = join(ROOT, glob.slice(0, -2));
      if (!existsSync(dir)) continue;
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const manifest = join(dir, entry.name, "package.json");
        if (existsSync(manifest)) files.push(manifest);
      }
    } else {
      const manifest = join(ROOT, glob, "package.json");
      if (existsSync(manifest)) files.push(manifest);
    }
  }
  return files;
}

const INSTALLING_FIELDS = ["dependencies", "devDependencies", "optionalDependencies"];

async function main(): Promise<void> {
  const files = await workspacePackageFiles();
  // dependency -> declarations that actually install it (peers excluded)
  const declarations = new Map<string, Declaration[]>();

  for (const file of files) {
    const manifest = JSON.parse(await readFile(file, "utf8"));
    const packageName: string = manifest.name ?? relative(ROOT, file);
    for (const field of INSTALLING_FIELDS) {
      for (const [dependency, version] of Object.entries(manifest[field] ?? {})) {
        const list = declarations.get(dependency) ?? [];
        list.push({ package: packageName, field, version: version as string });
        declarations.set(dependency, list);
      }
    }
  }

  const allowed = new Set(ALLOWED_DIVERGENCES.map((entry) => entry.dependency));
  const failures: string[] = [];

  // 1. Cross-package agreement.
  for (const [dependency, list] of [...declarations].sort()) {
    if (list.length < 2 || allowed.has(dependency)) continue;
    const versions = new Set(list.map((entry) => entry.version));
    if (versions.size === 1) continue;
    failures.push(
      `${dependency} is declared with ${versions.size} different versions:\n` +
        list
          .map((entry) => `      ${entry.package} (${entry.field}): ${entry.version}`)
          .sort()
          .join("\n"),
    );
  }

  // 2. Exact pins.
  for (const [dependency, list] of [...declarations].sort()) {
    const isZag = dependency.startsWith(ZAG_SCOPE);
    const why = NEEDS_EXACT[dependency] ?? (isZag ? "all @zag-js/* share one exact version" : undefined);
    if (!why) continue;
    const ranged = list.filter((entry) => /^[\^~><=*]|\s-\s|\|\|/.test(entry.version));
    if (ranged.length === 0) continue;
    failures.push(
      `${dependency} must be pinned exactly (${why}), but is a range in:\n` +
        ranged
          .map((entry) => `      ${entry.package} (${entry.field}): ${entry.version}`)
          .sort()
          .join("\n"),
    );
  }

  // 3. All @zag-js/* must agree on ONE version across the whole workspace.
  const zagVersions = new Map<string, string[]>();
  for (const [dependency, list] of declarations) {
    if (!dependency.startsWith(ZAG_SCOPE)) continue;
    for (const entry of list) {
      const holders = zagVersions.get(entry.version) ?? [];
      holders.push(`${dependency} in ${entry.package}`);
      zagVersions.set(entry.version, holders);
    }
  }
  if (zagVersions.size > 1) {
    failures.push(
      `@zag-js/* packages span ${zagVersions.size} versions; they must all share one:\n` +
        [...zagVersions]
          .map(([version, holders]) => `      ${version}: ${holders.length} declaration(s), e.g. ${holders[0]}`)
          .join("\n"),
    );
  }

  const shared = [...declarations.values()].filter((list) => list.length > 1).length;
  if (failures.length) {
    console.error(`dep-sync: ${failures.length} problem(s) across ${files.length} workspace package(s):\n`);
    for (const failure of failures) console.error(`  ✗ ${failure}\n`);
    console.error(
      "  Align the versions, or add a justified entry to ALLOWED_DIVERGENCES in tooling/check-dep-sync.ts.",
    );
    process.exit(1);
  }

  console.log(
    `dep-sync: ${files.length} workspace package(s); ${shared} dependency(ies) shared by 2+ packages, ` +
      `all in agreement; exact pins hold` +
      (ALLOWED_DIVERGENCES.length
        ? `; ${ALLOWED_DIVERGENCES.length} allowed divergence(s): ${ALLOWED_DIVERGENCES.map((e) => e.dependency).join(", ")}.`
        : "."),
  );
}

await main();
