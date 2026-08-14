import { compile } from 'marko';
import { readFileSync } from 'fs';
import { basename } from 'path';

const files = [
  'packages/registry/styles/lyra/ui/message/group.marko',
  'packages/registry/styles/lyra/ui/message/message.marko',
  'packages/registry/styles/lyra/ui/message/avatar.marko',
  'packages/registry/styles/lyra/ui/message/content.marko',
  'packages/registry/styles/lyra/ui/message/header.marko',
  'packages/registry/styles/lyra/ui/message/footer.marko',
];

const results = {};

files.forEach(file => {
  try {
    const source = readFileSync(file, 'utf-8');
    compile(source, { filename: file });
    results[basename(file)] = 'OK';
  } catch (err) {
    results[basename(file)] = `FAIL: ${err.message}`;
  }
});

console.log(JSON.stringify(results, null, 2));
