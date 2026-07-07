import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const files = ['fr.json', 'en.json', 'nl.json'];
const messagesDir = resolve(dir, '..', 'src', 'i18n');

function collectKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      keys.push(...collectKeys(val, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

const data = files.map(f => {
  const content = JSON.parse(readFileSync(resolve(messagesDir, f), 'utf-8'));
  return { file: f, keys: collectKeys(content) };
});

const [first, ...rest] = data;
let hasError = false;

for (const entry of rest) {
  const missing = first.keys.filter(k => !entry.keys.includes(k));
  const extra = entry.keys.filter(k => !first.keys.includes(k));
  if (missing.length) {
    console.error(`❌ ${entry.file} is missing keys: ${missing.join(', ')}`);
    hasError = true;
  }
  if (extra.length) {
    console.error(`❌ ${entry.file} has extra keys: ${extra.join(', ')}`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log('✅ All translation files match');
}
