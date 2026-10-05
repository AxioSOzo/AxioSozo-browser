// TEST FIXTURE ONLY: a fake Claude Code / Codex CLI for the understand tier. It never contacts
// anything. It records what it was launched with into the (temporary) project folder so tests
// can assert argv, environment, cwd and the stdin prompt, then prints canned output.
import { writeFileSync } from 'node:fs';

export async function readPrompt() {
  let text = '';
  for await (const chunk of process.stdin) text += chunk;
  return text;
}
export function record(prompt, extra = {}) {
  writeFileSync('fixture-record.json', JSON.stringify({ argv: process.argv.slice(2), env: process.env, cwd: process.cwd(), prompt, ...extra }));
}
export const BRIEF = { version: 1, product: '  Synthetic shop for testing.  ',
  apps: [{ name: 'web', kind: 'web', path: 'apps/web', summary: 'Storefront' }],
  domains: [{ host: 'Shop.Example.TEST', purpose: 'production site' }],
  services: [{ name: 'Postgres', purpose: 'orders' }],
  start: [{ label: 'dev', command: 'npm run dev', cwd: null }],
  risks: ['No tests for checkout'] };
export const EXPLANATION = { version: 1, summary: 'The API base URL is missing.',
  items: [{ error: 'TypeError: x is undefined', likely_cause: 'config not loaded', where: 'src/config.ts' }] };
export const SETUP = { version: 1, name: 'Harbor Suite', kind: 'web', kind_reason: 'Web storefront with a background worker, started with pnpm',
  icon: 'apps/web/public/icon.png',
  services: [{ name: 'web', kind: 'web', command: 'pnpm dev', cwd: 'apps/web', url: 'http://localhost:5173/' },
    { name: 'worker', kind: 'worker', command: 'pnpm run worker', cwd: null, url: null }] };
export const documentFor = prompt => prompt.includes('understand request: explain_errors') ? EXPLANATION
  : prompt.includes('understand request: setup') ? SETUP : BRIEF;
