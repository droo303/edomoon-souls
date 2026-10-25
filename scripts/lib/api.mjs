// Paperclip API for the owner's scripts on this computer (not for agents):
// PAPERCLIP_API_URL (default http://127.0.0.1:3100) and an optional
// PAPERCLIP_API_KEY from the environment or the gitignored .env in the
// repository root. The key is never printed.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './sandbox.mjs';

const vars = { PAPERCLIP_API_URL: process.env.PAPERCLIP_API_URL, PAPERCLIP_API_KEY: process.env.PAPERCLIP_API_KEY };
const file = path.join(ROOT, '.env');
if (existsSync(file)) {
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*(PAPERCLIP_API_URL|PAPERCLIP_API_KEY)\s*=\s*(.*?)\s*$/);
    if (m && !vars[m[1]]) vars[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const API = (vars.PAPERCLIP_API_URL || 'http://127.0.0.1:3100').replace(/\/+$/, '');

export async function api(method, route, body) {
  const headers = { 'content-type': 'application/json' };
  if (vars.PAPERCLIP_API_KEY) headers.authorization = `Bearer ${vars.PAPERCLIP_API_KEY}`;
  const res = await fetch(`${API}/api${route}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
  return { status: res.status, json, text: text.slice(0, 400) };
}
