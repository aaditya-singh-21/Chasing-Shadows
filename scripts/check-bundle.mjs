import { readdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const assets = new URL('../dist/assets/', import.meta.url);
let raw = 0;
let compressed = 0;
for (const file of await readdir(assets)) {
  if (!file.endsWith('.js')) continue;
  const content = await readFile(new URL(file, assets));
  raw += content.length;
  compressed += gzipSync(content).length;
}
console.log(
  `Runtime JavaScript: ${(raw / 1024).toFixed(1)} KiB raw; ${(compressed / 1024).toFixed(1)} KiB gzip estimate.`,
);
if (compressed > 500 * 1024) {
  throw new Error(
    'Runtime JavaScript exceeded the 500 KiB gzip budget. Review the bundle before shipping.',
  );
}
console.log(
  'Bundle budget passed. Transfer compression must also be enabled by the production host.',
);
