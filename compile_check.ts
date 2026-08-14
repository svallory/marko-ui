import { compile } from 'marko';
import { readFileSync } from 'fs';

const files = [
  './packages/registry/styles/nova/ui/message-scroller/message-scroller.marko',
  './packages/registry/styles/nova/ui/message-scroller/viewport.marko',
  './packages/registry/styles/nova/ui/message-scroller/content.marko',
  './packages/registry/styles/nova/ui/message-scroller/item.marko',
  './packages/registry/styles/nova/ui/message-scroller/button.marko',
  './packages/registry/styles/nova/ui/message-scroller/message-scroller-provider.marko'
];

const results: Record<string, string> = {};

for (const file of files) {
  try {
    const src = readFileSync(file, 'utf-8');
    compile(src, { filename: file });
    results[file.split('/').pop()!] = 'OK';
  } catch (err) {
    results[file.split('/').pop()!] = 'FAIL: ' + (err instanceof Error ? err.message : String(err));
  }
}

console.log(JSON.stringify(results, null, 2));
