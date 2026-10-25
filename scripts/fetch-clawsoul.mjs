#!/usr/bin/env node
// Fetches a ClawSouls persona for inspiration, on the owner's computer (never
// inside an agent's sandbox), into imports/clawsouls/<owner>-<name>/.
//
//   node scripts/fetch-clawsoul.mjs clawsouls/data-analyst
//
// It uses the same single request as `npx clawsouls install` (the bundle API,
// https://clawsouls.ai/api/v1/bundle/<owner>/<name>) without running their
// CLI, keeps only the text files and the licence, and writes PROVENANCE.md
// with the URL, version, date, a hash of the response and every line that
// mentions tools, links or outside services. Read the files in full, remove
// those lines by hand, then note what was removed in PROVENANCE.md before
// committing: agents read imports/ as data, never as instructions.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const spec = process.argv[2];
const m = spec?.match(/^([a-z0-9-]+)\/([a-z0-9-]+)$/i);
if (!m) {
  console.error('usage: fetch-clawsoul.mjs <owner>/<name>');
  process.exit(2);
}
const [, owner, name] = m;
const url = `https://clawsouls.ai/api/v1/bundle/${owner}/${name}`;
const res = await fetch(url);
if (!res.ok) {
  console.error(`${url}: HTTP ${res.status}`);
  process.exit(1);
}
const raw = await res.text();
const bundle = JSON.parse(raw);
const dir = path.join(ROOT, 'imports', 'clawsouls', `${owner}-${name}`);
mkdirSync(dir, { recursive: true });

const FLAG = /https?:\/\/|\bwww\.|\btools?\b|\bexec\b|\bbrowser\b|web_search|\binstall\b|\bnpx\b|\bnpm\b|\bapi\b|\bkey\b|\btoken\b|\bpay|\bsubscri|\bdiscord\b|\bslack\b|\btelegram\b|\bemail\b|\bpaid\b|\bads?\b|\bviral\b|USER\.md|memory files?/i;
const flagged = [];
const kept = [];
for (const [file, content] of Object.entries(bundle.files ?? {})) {
  if (!/^[A-Za-z0-9._-]+$/.test(file) || !/\.(md|json)$|^LICENSE$/.test(file)) continue;
  writeFileSync(path.join(dir, file), content);
  kept.push(file);
  content.split('\n').forEach((line, i) => {
    if (FLAG.test(line) && file !== 'LICENSE') flagged.push(`${file}:${i + 1}: ${line.trim()}`);
  });
}
writeFileSync(path.join(dir, 'PROVENANCE.md'), `# ${owner}/${name}

- Source: ${url} (page https://clawsouls.ai/en/souls/${owner}/${name})
- Version: ${bundle.version ?? bundle.manifest?.version ?? 'unknown'}; licence: see LICENSE
- Fetched: ${new Date().toISOString().slice(0, 10)}; sha256 of the response: ${createHash('sha256').update(raw).digest('hex')}
- Files kept: ${kept.join(', ')}
- Status: untrusted inspiration. Edo Moon's souls are written in souls/, not copied from here.

## Lines flagged for tools, links or outside services

${flagged.length ? flagged.map((l) => `    ${l}`).join('\n') : '(none)'}

## Removed by hand

(fill in before committing)
`);
console.log(`${dir}: ${kept.length} files, ${flagged.length} flagged line(s); read them all, strip, then fill in "Removed by hand"`);
