import { compile } from "./node_modules/.bun/marko@6.3.34/dist/index.mjs";
import { readFileSync } from "fs";
import { resolve } from "path";

const files = [
  "packages/registry/styles/mira/ui/message/group.marko",
  "packages/registry/styles/mira/ui/message/message.marko",
  "packages/registry/styles/mira/ui/message/avatar.marko",
  "packages/registry/styles/mira/ui/message/content.marko",
  "packages/registry/styles/mira/ui/message/header.marko",
  "packages/registry/styles/mira/ui/message/footer.marko",
];

const results = {};

for (const file of files) {
  try {
    const source = readFileSync(resolve(file), "utf-8");
    compile(source, { filename: file });
    results[file.split("/").pop()] = "OK";
  } catch (e) {
    results[file.split("/").pop()] = `FAIL: ${e.message}`;
  }
}

console.log(JSON.stringify(results, null, 2));
