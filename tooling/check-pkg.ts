
import { $ } from "bun";
import { join } from "path";
import { readdir } from "fs/promises";

async function checkPackage(pkgDir: string) {
  console.log(`Checking ${pkgDir}...`);
  // Build first if it's marko-ui
  if (pkgDir.includes("marko-ui") && !pkgDir.includes("shadcn")) {
    await $`bun run build`.cwd(pkgDir);
  }
  
  // Pack the package
  await $`bun pm pack`.cwd(pkgDir);
  
  // Find the tarball
  const files = await readdir(pkgDir);
  const tarball = files.find(f => f.endsWith(".tgz"));
  if (!tarball) throw new Error(`Tarball not found in ${pkgDir}`);
  
  const tarballPath = join(pkgDir, tarball);
  
  // Run publint and attw
  await $`bunx publint ${tarballPath}`;
  // --profile node16: both packages declare engines node >=20 and ship
  // `exports`-map subpaths only (no per-subpath "main"), which node10
  // resolution cannot resolve at runtime at all — a typesVersions shim
  // would pretend types resolve where the runtime would still fail. Node16+
  // (and bundler) resolution is the only supported consumer scenario.
  // cjs-resolves-to-esm is acceptable ONLY for marko-ui since it's an ESM-only CLI.
  if (pkgDir.includes("marko-ui") && !pkgDir.includes("shadcn")) {
    await $`bunx attw ${tarballPath} --profile node16 --ignore-rules cjs-resolves-to-esm`;
  } else {
    await $`bunx attw ${tarballPath} --profile node16`;
  }
}

async function run() {
  try {
    await checkPackage("packages/marko-ui");
    await checkPackage("packages/shadcn");
    console.log("Package checks passed.");
  } catch (err) {
    console.error("Package check failed:", err);
    process.exit(1);
  }
}

run();
