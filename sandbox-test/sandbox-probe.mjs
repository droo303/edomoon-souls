// Runs probe commands inside Paperclip's own Bubblewrap sandbox, built with
// the options claude_local passes (execute.ts) and the adapterConfig from
// scripts/lib/sandbox.mjs, so it shows what is enforced without waking any
// agent. Every line must say PASS.
//
//   ~/.local/opt/node-v24.22.1-linux-x64/bin/node sandbox-test/sandbox-probe.mjs [probes.json]
//
// The Publer probes mean something only while 127.0.0.1:9333 is listening;
// pass --fake-publer to open a stand-in listener for the run.
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { sandboxAdapterConfig, ROOT } from '../scripts/lib/sandbox.mjs';

const H = '/home/petr';
const mod = execSync(`ls -d ${H}/.npm/_npx/*/node_modules/@paperclipai/adapter-utils/dist/local-process-sandbox.js | head -1`, { encoding: 'utf8' }).trim();
const { buildLocalProcessSandboxSpawnTarget } = await import(mod);
const probesFile = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? path.join(import.meta.dirname, 'probes.json');
let fake = null;
if (process.argv.includes('--fake-publer')) {
  fake = http.createServer((_, res) => res.end('{"Browser":"stand-in"}')).listen(9333, '127.0.0.1');
}
const cfg = sandboxAdapterConfig({ name: 'sandbox-probe' });
fs.mkdirSync(cfg.cwd, { recursive: true });
const claudeDir = `${H}/.paperclip-agents/claude-home/.claude`;
const run = (c, a, o) => new Promise((res) => {
  const p = spawn(c, a, o); let out = '';
  p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (out += d));
  const t = setTimeout(() => p.kill('SIGKILL'), 20000);
  p.on('close', (code) => { clearTimeout(t); res({ status: code, out }); });
});
let failed = 0;
for (const [want, label, cmd] of JSON.parse(fs.readFileSync(probesFile, 'utf8'))) {
  const t = await buildLocalProcessSandboxSpawnTarget({
    executable: '/usr/bin/bash', args: ['-c', cmd], cwd: cfg.cwd,
    options: {
      workspaceDir: cfg.cwd, filesystemScope: cfg.filesystemScope,
      managedPaths: [
        { path: claudeDir, access: 'rw' },
        { path: `${H}/.paperclip-agents/claude-home/.claude.json`, access: 'rw' },
        // what executableReadPaths() adds for the claude binary
        { path: `${H}/.local/bin`, access: 'ro' },
        { path: `${H}/.local/share/claude/versions`, access: 'ro' },
      ],
      extraPaths: cfg.filesystemExtraPaths.map((p) => ({ path: p, access: 'ro' })),
      homeDir: `${H}/.paperclip-agents/claude-home`,
      networkScope: cfg.networkScope, networkAllowlist: cfg.networkAllowlist,
      networkTrustedUrls: ['http://127.0.0.1:3100/api'],
      command: cfg.filesystemSandboxCommand,
    },
  });
  const env = { ...process.env, ...t.env };
  for (const [k, v] of Object.entries(t.env)) if (v === undefined) delete env[k];
  delete env.SSH_AUTH_SOCK;
  const r = await run(t.command, t.args, { cwd: t.cwd, env });
  await t.cleanup?.();
  const ok = r.status === 0;
  const pass = (want === 'allow') === ok;
  if (!pass) failed++;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${want.padEnd(5)} ${label.padEnd(44)} exit=${r.status}  ${r.out.trim().split('\n').pop()?.slice(0, 90) ?? ''}`);
}
fake?.close();
console.log(failed ? `${failed} probe(s) FAILED` : 'all probes pass');
process.exit(failed ? 1 : 0);
