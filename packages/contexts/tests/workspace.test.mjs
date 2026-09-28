/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Monorepo detection: two-phase, static, allowlisted (contexts-api-v1 §2.2).
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  ContextsError, DETECTION_FILES, MAX_FILE_BYTES, MAX_WORKSPACE_PACKAGES, PACKAGE_DETECTION_FILES, detectProject, expandWorkspaceGlobs,
  isAllowedPackagePath, isPackageDir, normalizeWorkspacePattern, packageDetectionRefusal, validateDetectionDraft, workspaceCandidates,
} from '../src/index.mjs';
import { materializeFixture, readFixtureRepo, readFixtureWorkspace } from './fixture-reader.mjs';

const WORKSPACE_FIXTURES = ['tauri-plus-web', 'pnpm-monorepo', 'npm-workspaces'];
const OLD_FIXTURES = ['vite-app', 'next-app', 'tauri-app', 'cargo-lib', 'compose-fly', 'creds-remote', 'malformed', 'electron-app', 'with-manifest'];
const expected = async name => JSON.parse(await readFile(new URL(`./expected/${name}.json`, import.meta.url), 'utf8'));
const pj = (scripts, more = {}) => JSON.stringify({ name: 'pkg', scripts, ...more });
const envs = d => d.environments.map(e => [e.app ?? null, e.name, e.base_url, e.guess]);

// Traps a reader must never open: package-level .env, node_modules, hidden
// dirs and a package directory symlinked out of the root.
async function plantTraps(fx) {
  const root = fx.root;
  await mkdir(join(root, 'node_modules', 'evil'), { recursive: true });
  await writeFile(join(root, 'node_modules', 'evil', 'package.json'), pj({ dev: 'vite --port 6666' }, { name: 'TRAP-node-modules' }));
  await mkdir(join(root, '.hidden', 'pkg'), { recursive: true });
  await writeFile(join(root, '.hidden', 'pkg', 'package.json'), pj({ dev: 'vite --port 6667' }, { name: 'TRAP-hidden' }));
  await mkdir(join(root, 'apps'), { recursive: true });
  await mkdir(join(root, 'apps', '.secret'), { recursive: true });
  await writeFile(join(root, 'apps', '.secret', 'package.json'), pj({ dev: 'vite --port 6668' }, { name: 'TRAP-hidden-app' }));
  const outside = join(fx.base, 'outside-pkg');
  await mkdir(outside, { recursive: true });
  await writeFile(join(outside, 'package.json'), pj({ dev: 'vite --port 6669' }, { name: 'TRAP-outside' }));
  await symlink(outside, join(root, 'apps', 'linked'));
  for (const dir of ['apps/web', 'client']) {
    try { await writeFile(join(root, ...dir.split('/'), '.env'), 'TRAP_ENV_SECRET=never-read-package-env\n'); } catch { /* dir absent */ }
  }
}

for (const name of WORKSPACE_FIXTURES) {
  test(`workspace fixture ${name}: expected draft, allowlisted reads only, traps untouched`, async () => {
    const fx = await materializeFixture(name);
    try {
      await plantTraps(fx);
      const { files, refused } = await readFixtureRepo(fx.root);
      const ws = await readFixtureWorkspace(fx.root, files);
      assert.ok(ws.listed.every(p => ws.plan.list.includes(p)), 'only planned parents are listed');
      for (const path of ws.opened) {
        const f = PACKAGE_DETECTION_FILES.find(x => path.endsWith(`/${x}`));
        assert.ok(f && isAllowedPackagePath(path.slice(0, -f.length - 1), f), path);
      }
      assert.ok(!ws.opened.some(p => /node_modules|(^|\/)\.(env|hidden|secret)|linked/.test(p)), JSON.stringify(ws.opened));
      assert.ok(ws.dirs.length <= MAX_WORKSPACE_PACKAGES);
      const draft = detectProject({ rootName: name, files, refused, packages: ws.packages });
      assert.deepEqual(draft, validateDetectionDraft(draft));
      // The planted apps/linked -> outside symlink is refused before anything is opened.
      assert.deepEqual(draft.refused, [{ path: 'apps/linked/package.json', reason: 'symlink_outside_root' }]);
      assert.deepEqual(JSON.parse(JSON.stringify({ ...draft, refused: [] })), await expected(name));
      assert.doesNotMatch(JSON.stringify(draft), /TRAP|never-read|666[6-9]/);
    } finally { await fx.cleanup(); }
  });
}

test('Domo-like: root Tauri (1420) and a web app in apps/web (5173) become two local environments', async () => {
  const d = await expected('tauri-plus-web');
  assert.equal(d.kind, 'desktop');
  assert.deepEqual(envs(d), [['desktop', 'local', 'http://localhost:1420/', false], ['web', 'local', 'http://localhost:5173/', true]]);
  assert.deepEqual(d.services.map(s => [s.app, s.name, s.port]), [['desktop', 'Tauri dev server', 1420], ['web', 'Vite dev server', 5173]]);
  const vercel = d.surfaces.find(s => s.kind === 'hosting');
  assert.deepEqual([vercel.name, vercel.url, vercel.prominence, vercel.source], ['Vercel (synthetic-web)', 'https://vercel.com/dashboard', 'secondary', 'apps/web/.vercel/project.json']);
  assert.ok(!d.environments.some(e => e.name === 'production'), 'Vercel never yields a production URL');
});

test('pnpm monorepo: apps get their own environments, the library package and the root add none', async () => {
  const d = await expected('pnpm-monorepo');
  assert.equal(d.kind, 'web');
  assert.deepEqual(envs(d), [['admin', 'local', 'http://localhost:3001/', false], ['web', 'local', 'http://localhost:5174/', false],
    ['web', 'production', 'https://synthetic-web.pages.dev/', true]]);
  assert.ok(d.files_read.includes('packages/ui/package.json') && !d.services.some(s => s.port === 5173), 'root and library vite deps are not guessed');
});

test('npm workspaces (RemoteRAL-like, nothing at the root): the single app keeps no app label', async () => {
  const d = await expected('npm-workspaces');
  assert.deepEqual(envs(d), [[null, 'local', 'http://localhost:5173/', true]]);
  assert.equal(detectProject({ rootName: 'x', files: { 'package.json': JSON.stringify({ workspaces: ['client'], devDependencies: { vite: '6' } }) } }).environments.length, 0,
    'a workspace root without packages yields no guessed dev server');
});

test('single-app fixtures are unchanged when the workspace phase runs too', async () => {
  for (const name of OLD_FIXTURES) {
    const fx = await materializeFixture(name);
    try {
      const { files, refused } = await readFixtureRepo(fx.root);
      const { packages } = await readFixtureWorkspace(fx.root, files);
      assert.deepEqual(packages, {}, name);
      assert.deepEqual(JSON.parse(JSON.stringify(detectProject({ rootName: name, files, refused, packages }))), await expected(name), name);
    } finally { await fx.cleanup(); }
  }
});

test('workspaceCandidates: sources, order, conventional fallback, refused patterns', () => {
  const plan = workspaceCandidates({
    'package.json': JSON.stringify({ workspaces: { packages: ['services/*', './tools/cli/', 'libs/app-*', '!services/legacy'] } }),
    'pnpm-workspace.yaml': "packages:\n  - 'apps/*'\n  - '!**/test/**'\n  - '**'\n  - '../x/*'\n  - '/abs/*'\n  - '.github/*'\n  - 'node_modules/*'\n  - 'a/*/b'\n  - 'x/{a,b}'\n  - 'dist'\n",
    'lerna.json': '{}',
  });
  assert.deepEqual(plan.patterns.slice(0, 6), ['services/*', 'tools/cli', 'libs/app-*', '!services/legacy', 'apps/*', 'packages/*']);
  assert.ok(plan.patterns.includes('web') && plan.patterns.includes('backend'), 'conventional dirs are always candidates');
  assert.deepEqual(plan.list, ['', 'services', 'tools', 'libs', 'apps', 'packages']);
  assert.deepEqual(plan.refused.map(r => [r.pattern, r.reason]), [['**', 'recursive_glob'], ['../x/*', 'parent_traversal'], ['/abs/*', 'absolute'],
    ['.github/*', 'hidden'], ['node_modules/*', 'node_modules'], ['a/*/b', 'nested_glob'], ['x/{a,b}', 'unsupported_glob'], ['dist', 'build_output']]);
  assert.ok(Object.isFrozen(plan) && Object.isFrozen(plan.patterns));
  assert.deepEqual(workspaceCandidates({ 'lerna.json': '{"version":"1.0.0"}' }).patterns.slice(0, 2), ['packages/*', 'apps/*'], 'lerna defaults to packages/*');
  const tauri = workspaceCandidates({ 'src-tauri/tauri.conf.json': JSON.stringify({ build: { frontendDist: '../ui-shell/dist', beforeDevCommand: 'cd front-end && npm run dev' } }) });
  assert.deepEqual(tauri.patterns.slice(0, 2), ['ui-shell', 'front-end']);
  const escape = workspaceCandidates({ 'tauri.conf.json': JSON.stringify({ build: { frontendDist: '../../outside', beforeDevCommand: { script: 'npm run dev', cwd: '/etc' } } }) });
  assert.deepEqual(escape.patterns, workspaceCandidates({}).patterns, 'hints leaving the root are ignored');
  for (const bad of [null, [], 'x', { 'package.json': '{' }, { 'package.json': JSON.stringify({ workspaces: 'apps/*' }) }, { '.env': 'workspaces' }]) {
    assert.deepEqual(workspaceCandidates(bad).patterns, workspaceCandidates({}).patterns);
  }
  const many = workspaceCandidates({ 'package.json': JSON.stringify({ workspaces: Array.from({ length: 500 }, (_, i) => `p${i}`) }) });
  assert.ok(many.patterns.length <= 64 && many.list.length <= 16);
});

test('glob refusal: **, .., absolute, hidden, node_modules, build output and odd syntax', () => {
  const cases = {
    '**': 'recursive_glob', 'packages/**': 'recursive_glob', '**/apps': 'recursive_glob', '../apps/*': 'parent_traversal', 'apps/../..': 'parent_traversal',
    '/apps/*': 'absolute', '~/apps': 'absolute', 'C:/apps': 'absolute', 'apps\\web': 'absolute', '.hidden/*': 'hidden', 'apps/.x': 'hidden',
    'node_modules/*': 'node_modules', 'apps/node_modules': 'node_modules', 'apps/*/pkg': 'nested_glob', '*/web': 'nested_glob', 'apps/[ab]': 'unsupported_glob',
    'apps/a?': 'unsupported_glob', 'apps/*-*': 'unsupported_glob', 'build': 'build_output', 'apps/dist': 'build_output', '': 'invalid', 'a//b': 'invalid',
    'a/b/c/d/e': 'invalid', 'apps/__proto__': 'invalid',
  };
  for (const [input, reason] of Object.entries(cases)) assert.deepEqual(normalizeWorkspacePattern(input), { reason }, input);
  for (const bad of [null, 1, {}, 'x'.repeat(201)]) assert.equal(normalizeWorkspacePattern(bad).reason, 'invalid');
  assert.deepEqual(normalizeWorkspacePattern(' ./apps/*/ '), { pattern: 'apps/*' });
  assert.deepEqual(normalizeWorkspacePattern('packages/web/package.json'), { pattern: 'packages/web' });
  assert.deepEqual(normalizeWorkspacePattern('!apps/legacy'), { pattern: '!apps/legacy' });
  assert.deepEqual(normalizeWorkspacePattern('packages/@scope/app-*'), { pattern: 'packages/@scope/app-*' });
});

test('expandWorkspaceGlobs: single-level expansion from the caller listing only', () => {
  const listing = {
    '': ['apps', 'web', '.git', 'node_modules', 'src-tauri'],
    apps: ['web', 'admin', '.hidden', 'node_modules', 'dist', '..', 'a/b', '__proto__', 'legacy', 7, null],
    packages: ['ui', 'app-one', 'app-two'],
  };
  assert.deepEqual(expandWorkspaceGlobs(['apps/*', '!apps/legacy', 'packages/app-*', 'web', 'frontend', 'missing/x', '**', '../x', '.git'], listing),
    ['apps/admin', 'apps/web', 'packages/app-one', 'packages/app-two', 'web', 'missing/x']);
  assert.deepEqual(expandWorkspaceGlobs(['apps/*'], {}), [], 'a glob without a listing expands to nothing');
  assert.deepEqual(expandWorkspaceGlobs(['apps/web'], {}), ['apps/web'], 'a literal without a parent listing is kept for the reader to probe');
  assert.deepEqual(expandWorkspaceGlobs(null, listing), []);
  const big = { packages: Array.from({ length: 100 }, (_, i) => `p${String(i).padStart(3, '0')}`) };
  const out = expandWorkspaceGlobs(['packages/*'], big);
  assert.equal(out.length, MAX_WORKSPACE_PACKAGES);
  assert.equal(out[0], 'packages/p000');
  assert.ok(Object.isFrozen(out));
});

test('package reader policy', () => {
  assert.deepEqual([...PACKAGE_DETECTION_FILES], ['package.json', '.vercel/project.json', 'vercel.json', 'netlify.toml', 'wrangler.toml', 'wrangler.json',
    'src-tauri/tauri.conf.json', 'tauri.conf.json']);
  for (const good of ['apps/web', 'web', 'packages/@scope/ui', 'a/b/c/d']) assert.equal(isPackageDir(good), true, good);
  for (const bad of ['', '.', '..', '../web', 'apps/../x', '/apps/web', 'apps/web/', 'apps//web', '.hidden', 'apps/.x', 'node_modules/x', 'apps/dist',
    'a/b/c/d/e', '__proto__', 'apps\\web', null, 7]) assert.equal(isPackageDir(bad), false, String(bad));
  assert.equal(isAllowedPackagePath('apps/web', 'package.json'), true);
  for (const bad of ['.env', 'vite.config.ts', 'Cargo.toml', '.git/config', 'fly.toml', '../package.json']) assert.equal(isAllowedPackagePath('apps/web', bad), false, bad);
  const ok = { dir: 'apps/web', path: 'package.json', resolvedPath: 'apps/web/package.json', isFile: true, size: 10 };
  assert.equal(packageDetectionRefusal(ok), null);
  assert.equal(packageDetectionRefusal({ ...ok, resolvedPath: 'packages/shared/package.json' }), null, 'a symlink to another allowlisted package file');
  assert.equal(packageDetectionRefusal({ ...ok, resolvedPath: 'package.json' }), null);
  assert.equal(packageDetectionRefusal({ ...ok, resolvedPath: 'apps/web/.env' }), 'not_allowlisted');
  assert.equal(packageDetectionRefusal({ ...ok, resolvedPath: 'node_modules/x/package.json' }), 'not_allowlisted');
  assert.equal(packageDetectionRefusal({ ...ok, resolvedPath: null }), 'symlink_outside_root');
  assert.equal(packageDetectionRefusal({ ...ok, dir: '../x' }), 'not_allowlisted');
  assert.equal(packageDetectionRefusal({ ...ok, isFile: false }), 'not_regular_file');
  assert.equal(packageDetectionRefusal({ ...ok, size: MAX_FILE_BYTES + 1 }), 'too_large');
  assert.ok(!DETECTION_FILES.some(f => f.startsWith('.env')));
});

test('detectProject packages input: bad dirs refused, bad shapes throw, content never touched outside the allowlist', () => {
  const touched = [];
  const files = { 'package.json': pj({}) };
  Object.defineProperty(files, '.env', { enumerable: true, get() { touched.push('.env'); return 'TRAP'; } });
  const pkgFiles = { 'package.json': pj({ dev: 'vite' }) };
  for (const path of ['.env', 'vite.config.ts', '../package.json']) Object.defineProperty(pkgFiles, path, { enumerable: true, get() { touched.push(path); return 'TRAP'; } });
  const d = detectProject({ rootName: 'x', files, packages: {
    'apps/web': { files: pkgFiles, refused: [{ path: 'wrangler.toml', reason: 'symlink_outside_root' }] },
    '../escape': { files: { 'package.json': pj({ dev: 'vite --port 6000' }) } },
    'node_modules/x': { files: { 'package.json': pj({ dev: 'vite --port 6001' }) } },
  } });
  assert.deepEqual(touched, []);
  assert.deepEqual(d.refused, [{ path: '.env', reason: 'not_allowlisted' }, { path: 'apps/web/wrangler.toml', reason: 'symlink_outside_root' },
    { path: 'apps/web/.env', reason: 'not_allowlisted' }, { path: 'apps/web/vite.config.ts', reason: 'not_allowlisted' },
    { path: 'apps/web/../package.json', reason: 'not_allowlisted' }, { path: '../escape', reason: 'not_allowlisted' }, { path: 'node_modules/x', reason: 'not_allowlisted' }]);
  assert.deepEqual(d.files_read, ['package.json', 'apps/web/package.json']);
  assert.deepEqual(envs(d), [[null, 'local', 'http://localhost:5173/', true]]);
  for (const packages of ['x', [], { 'apps/web': null }, { 'apps/web': { files: [] } }, { 'apps/web': { files: {}, refused: {} } },
    { 'apps/web': { files: {}, refused: [{ path: 'x', reason: 'nope' }] } }]) {
    assert.throws(() => detectProject({ rootName: 'x', files: {}, packages }), e => e instanceof ContextsError && e.code === 'INVALID_INPUT', JSON.stringify(packages));
  }
  const many = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`apps/a${i}`, { files: { 'package.json': pj({ dev: `vite --port ${4000 + i}` }) } }]));
  const capped = detectProject({ rootName: 'x', files: {}, packages: many });
  assert.equal(capped.files_read.length, MAX_WORKSPACE_PACKAGES);
  assert.ok(capped.warnings.some(w => w.includes('workspace package(s) beyond the limit')));
  assert.equal(capped.environments.length, 16, 'environments stay capped');
});

test('Tauri frontend association: hints, --filter, same port, explicit different port', () => {
  const tauri = build => ({ 'src-tauri/tauri.conf.json': JSON.stringify({ productName: 'Desk', build: { devUrl: 'http://localhost:1420', ...build } }) });
  // frontendDist names the frontend package: its guessed dev server is the desktop app.
  const hinted = detectProject({ rootName: 'x', files: tauri({ frontendDist: '../ui-shell/dist' }), packages: {
    'ui-shell': { files: { 'package.json': pj({ dev: 'vite' }) } }, site: { files: { 'package.json': pj({ dev: 'astro dev --port 4000' }) } },
  } });
  assert.deepEqual(envs(hinted), [['desktop', 'local', 'http://localhost:1420/', false], ['site', 'local', 'http://localhost:4000/', false]]);
  assert.ok(!hinted.services.some(s => s.port === 5173));
  // pnpm --filter names the frontend package by package.json name.
  const filtered = detectProject({ rootName: 'x', files: tauri({ beforeDevCommand: 'pnpm --filter @acme/front dev' }), packages: {
    'apps/front': { files: { 'package.json': JSON.stringify({ name: '@acme/front', scripts: { dev: 'vite' } }) } },
    'apps/web': { files: { 'package.json': pj({ dev: 'vite --port 5180' }) } },
  } });
  assert.deepEqual(envs(filtered), [['desktop', 'local', 'http://localhost:1420/', false], ['web', 'local', 'http://localhost:5180/', false]]);
  // A package serving the dev URL port is the frontend: one app, no labels, never called a web dev server.
  const same = detectProject({ rootName: 'x', files: tauri({}), packages: { frontend: { files: { 'package.json': pj({ dev: 'vite --port 1420' }) } } } });
  assert.deepEqual(envs(same), [[null, 'local', 'http://localhost:1420/', false]]);
  assert.deepEqual(same.services.map(s => [s.name, s.port]), [['Tauri dev server', 1420]]);
  // An explicit, different root port is a separate web app next to the desktop app.
  const both = detectProject({ rootName: 'x', files: { ...tauri({}), 'package.json': pj({ dev: 'vite --port 5174' }) } });
  assert.deepEqual(envs(both), [['web', 'local', 'http://localhost:5174/', false], ['desktop', 'local', 'http://localhost:1420/', false]]);
  // Tauri inside a workspace package.
  const nested = detectProject({ rootName: 'x', files: { 'package.json': JSON.stringify({ workspaces: ['apps/*'] }) }, packages: {
    'apps/desktop': { files: { 'package.json': pj({ dev: 'vite' }), 'src-tauri/tauri.conf.json': JSON.stringify({ build: { devUrl: 'http://localhost:1421' } }) } },
    'apps/web': { files: { 'package.json': pj({ dev: 'next dev' }) } },
  } });
  assert.deepEqual([nested.kind, ...envs(nested)], ['desktop', ['desktop', 'local', 'http://localhost:1421/', false], ['web', 'local', 'http://localhost:3000/', true]]);
  assert.equal(nested.environments[0].source, 'apps/desktop/src-tauri/tauri.conf.json build.devUrl');
});

test('app labels: package dir names, root last, collisions suffixed, same-port warning', () => {
  const d = detectProject({ rootName: 'x', files: { 'package.json': pj({ dev: 'vite' }) }, packages: {
    'apps/web': { files: { 'package.json': pj({ dev: 'vite' }) } },
    'packages/web': { files: { 'package.json': pj({ dev: 'next dev -p 3002' }) } },
    'apps/My_Site': { files: { 'package.json': pj({ dev: 'astro dev' }) } },
  } });
  assert.deepEqual(d.environments.map(e => e.app), ['web-3', 'web', 'web-2', 'my_site']);
  assert.ok(d.warnings.some(w => w.includes('same local URL')), 'root and apps/web both guess 5173');
});

test('hostile package contents never throw and always yield a valid draft', () => {
  let seed = 99;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const alphabet = '{}[]"\'=:,.-_ #\n\\/@*$<>!&|%0123456789abcvite';
  const noise = n => Array.from({ length: n }, () => alphabet[Math.floor(rand() * alphabet.length)]).join('');
  for (const path of PACKAGE_DETECTION_FILES) {
    for (const content of ['', '{"__proto__":{"polluted":true}}', JSON.stringify({ build: { devUrl: 'javascript:alert(1)', frontendDist: '../../..' } }), ...Array.from({ length: 10 }, () => noise(300))]) {
      const d = detectProject({ rootName: 'x', files: { 'tauri.conf.json': content }, packages: { 'apps/x': { files: { [path]: content } } } });
      assert.deepEqual(d, validateDetectionDraft(d), path);
      assert.deepEqual(workspaceCandidates({ 'package.json': content, 'pnpm-workspace.yaml': content, 'lerna.json': content, 'tauri.conf.json': content }).list[0], '');
    }
  }
  assert.equal({}.polluted, undefined);
});
