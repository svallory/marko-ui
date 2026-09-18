import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

function run() {
  console.log("Running HTML validate...");
  const docsDir = join(process.cwd(), "apps/docs");
  const glob = new Bun.Glob("dist/public/**/*.html");
  const files = Array.from(glob.scanSync({ cwd: docsDir, absolute: true }));
  
  // Pre-strip Marko's <!> and <!----> markers before validation
  // so html-validate's parser doesn't choke on them.
  for (const file of files) {
    let content = readFileSync(file, "utf8");
    // Strip <!> and <!---->
    content = content.replace(/<!(?:----)?>/g, "");
    writeFileSync(file, content, "utf8");
  }

  try {
    // Run html-validate directly via node to bypass proto shim banner issues
    execSync(`node node_modules/.bin/html-validate "dist/public/**/*.html"`, {
      stdio: "inherit",
      cwd: docsDir
    });
    console.log("HTML validation passed.");
  } catch (err: any) {
    console.error("HTML validation failed.");
    process.exit(1);
  }
}

run();
