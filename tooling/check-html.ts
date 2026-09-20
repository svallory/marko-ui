import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname, join, relative } from "path";
import { execSync } from "child_process";

function run() {
  console.log("Running HTML validate...");
  const docsDir = join(process.cwd(), "apps/docs");
  const distPublic = join(docsDir, "dist/public");
  const glob = new Bun.Glob("dist/public/**/*.html");
  const files = Array.from(glob.scanSync({ cwd: docsDir, absolute: true }));

  // Pre-strip Marko's <!> and <!----> markers before validation
  // so html-validate's parser doesn't choke on them.
  //
  // Also strip <style> blocks: Marko inlines component <style> into the body,
  // and html-validate's element-permitted-content flags <style> under <div>
  // even though every browser applies body styles. This is framework output,
  // not a component defect — removing it keeps the nesting rule ON for real
  // markup. Regex: a <style> open tag through its matching close; style
  // payloads never contain a literal "</style>".
  //
  // The stripped copies go to a temp dir OUTSIDE dist/ — never write back
  // into dist/public. pages.yml validates the SAME dist it then deploys,
  // and stripping the inlined bare-page CSS or Marko's <!> hydration
  // markers from the deployable artifact would silently ship broken pages.
  const tmpDir = join(docsDir, ".htmlvalidate-tmp");
  rmSync(tmpDir, { recursive: true, force: true });
  for (const file of files) {
    const content = readFileSync(file, "utf8")
      .replace(/<!(?:----)?>/g, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
    const out = join(tmpDir, relative(distPublic, file));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, content, "utf8");
  }

  let failed = false;
  try {
    // Run html-validate directly via node to bypass proto shim banner issues
    execSync(`node node_modules/.bin/html-validate ".htmlvalidate-tmp/**/*.html"`, {
      stdio: "inherit",
      cwd: docsDir
    });
    console.log("HTML validation passed.");
  } catch {
    console.error("HTML validation failed.");
    failed = true;
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
  if (failed) process.exit(1);
}

run();
