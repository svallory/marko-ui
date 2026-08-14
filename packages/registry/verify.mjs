import { compile } from 'marko';
import { readFileSync } from 'fs';
import { basename } from 'path';

const files = [
  'styles/rhea/ui/bubble/bubble.marko',
  'styles/rhea/ui/bubble/bubble-content.marko',
  'styles/rhea/ui/bubble/bubble-group.marko',
  'styles/rhea/ui/bubble/bubble-reactions.marko',
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
