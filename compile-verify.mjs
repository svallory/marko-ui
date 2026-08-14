const { compileFileSync } = require('@marko/compiler');
const path = require('path');

const files = [
  'packages/registry/styles/lyra/ui/message/group.marko',
  'packages/registry/styles/lyra/ui/message/message.marko',
  'packages/registry/styles/lyra/ui/message/avatar.marko',
  'packages/registry/styles/lyra/ui/message/content.marko',
  'packages/registry/styles/lyra/ui/message/header.marko',
  'packages/registry/styles/lyra/ui/message/footer.marko',
];

const results = [];

for (const file of files) {
  try {
    const fullPath = path.resolve(file);
    const compiled = compileFileSync(fullPath);
    results.push(`OK: ${path.basename(file)}`);
  } catch (e) {
    results.push(`FAIL: ${path.basename(file)}\n  ${e.message}`);
  }
}

console.log(results.join('\n'));
