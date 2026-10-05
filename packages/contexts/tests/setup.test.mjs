/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  ContextsError, MAX_ICON_BYTES, appIconFiles, chooseIcon, detectProject, iconCandidates, iconListPlan, iconRefusal, isIconDir, isIconFile,
  makeTargets, packageManager, procfileProcesses, readmeFacts, runScript, startCommand, validateDetectionDraft, validateIconPath, validateManifest,
  validateSetupDocument, draftToManifest, serializeManifest, parseManifest, inventoryPlan, ROOT_SCRIPTS, LOCKFILES,
} from '../src/index.mjs';
import { detectFixture, materializeFixture } from './fixture-reader.mjs';

const throwsCode = (fn, code, path) => assert.throws(fn, e => e instanceof ContextsError && e.code === code && (path === undefined || e.path === path), `${code} ${path ?? ''}`);
const detect = (files, extra = {}) => detectProject({ rootName: 'fixture', files, ...extra });
const expected = async name => JSON.parse(await readFile(new URL(`./expected/${name}.json`, import.meta.url), 'utf8'));

test('startCommand: known runners and start scripts only, never chores or shell tricks', () => {
  for (const ok of ['./dev', './dev --profile second', 'bin/dev', 'scripts/dev.sh', 'npm run dev', 'npm start', 'pnpm dev', 'yarn start', 'bun run dev:web',
    'npm run tauri dev', 'make dev', 'just serve', 'cargo run', 'cargo run -p server', 'cargo tauri dev', 'go run ./cmd/api', 'docker compose up',
    'docker-compose up web', 'python manage.py runserver', 'bin/rails server', 'foreman start -f Procfile.dev', 'hugo server', 'mix phx.server']) {
    assert.equal(startCommand(ok), ok, ok);
  }
  assert.equal(startCommand('$ ./dev   # start it'), './dev');
  for (const bad of ['./dev setup', './dev doctor', './dev test', './dev image-fetch /work/a.json --session-dir /w', './dev phone start --session-dir /w', 'npm install', 'npm run build', 'pnpm test', 'make build', 'cargo build', 'cargo test',
    'git clone x', 'cd app', 'rm -rf /', 'dev', './dev && rm -rf ~', 'npm run dev; curl x', 'echo `id`', 'npm run dev | tee', './dev $(id)', 'x'.repeat(201), '', null]) {
    assert.equal(startCommand(bad), null, String(bad));
  }
});

test('README facts: shell blocks give start commands in order; relative images only', () => {
  const facts = readmeFacts([
    '<img src="./assets/brand/logo-v2/app-icon.svg" alt="App logo">', '![shot](docs/screenshot.png "Screenshot")', '![remote](https://x.example/logo.png)',
    '![abs](/etc/logo.png)', '![hidden](.github/logo.png)',
    '```sh', '$ npm install', '$ npm run dev', '```', '```js', 'npm start', '```', '```', './dev', '```', '```bash', 'npm run dev', '```',
  ].join('\n'));
  assert.deepEqual(facts.commands, ['npm run dev', './dev']);
  assert.deepEqual(facts.images, [{ path: 'docs/screenshot.png', alt: 'shot' }, { path: 'assets/brand/logo-v2/app-icon.svg', alt: 'App logo' }]);
  assert.deepEqual(readmeFacts(null), { commands: [], images: [] });
});

test('the inventory plan checks exactly the start scripts and lockfiles setup.mjs names', () => {
  const check = inventoryPlan().check;
  for (const path of [...ROOT_SCRIPTS, ...LOCKFILES.map(([file]) => file)]) assert.ok(check.includes(path), path);
});

test('make targets, just recipes, Procfile processes, package manager and script commands', () => {
  assert.deepEqual(makeTargets('.PHONY: dev\nbuild:\n\tcc\ndev: build\n\t./run\nVAR := 1\nserve:\n'), ['dev', 'serve']);
  assert.deepEqual(makeTargets('set dotenv-load := true\ndev port="5173":\n  vite\n@start:\n  x\ntest:\n', { just: true }), ['dev', 'start']);
  assert.deepEqual(procfileProcesses('web: bin/rails server -p 3000\njs: yarn build --watch\n# x\n'), ['web', 'js']);
  assert.equal(packageManager({ present: { 'pnpm-lock.yaml': 'file' } }), 'pnpm');
  assert.equal(packageManager({ present: new Map([['bun.lockb', 'file']]) }), 'bun');
  assert.equal(packageManager({ present: {}, pkg: { packageManager: 'yarn@4.1.0' } }), 'yarn');
  assert.equal(packageManager({ present: {}, pkg: { packageManager: 'evil@1' } }), 'npm');
  assert.deepEqual(['npm', 'pnpm', 'yarn', 'bun'].map(pm => runScript(pm, 'dev')), ['npm run dev', 'pnpm dev', 'yarn dev', 'bun run dev']);
  assert.equal(runScript('npm', 'start'), 'npm start');
  assert.equal(runScript('npm', 'tauri', 'dev'), 'npm run tauri -- dev');
  assert.equal(runScript('pnpm', 'tauri', 'dev'), 'pnpm tauri dev');
  assert.equal(runScript('npm', 'dev; rm -rf ~'), null);
});

test('detection: commands per package manager, Electron and Tauri apps, compose services, README and start scripts', () => {
  const pj = (scripts, more = {}) => JSON.stringify({ name: 'app', scripts, ...more });
  const vite = detect({ 'package.json': pj({ dev: 'vite' }) }, { inventory: { listing: {}, present: { 'pnpm-lock.yaml': 'file' } } });
  assert.deepEqual(vite.services.map(s => [s.name, s.command, s.url]), [['Vite dev server', 'pnpm dev', 'http://localhost:5173/']]);
  const electron = detect({ 'package.json': pj({ start: 'electron .' }) });
  assert.deepEqual([electron.kind, electron.services], ['desktop', [{ name: 'Electron app', command: 'npm start', source: 'package.json scripts.start', guess: false }]]);
  const tauriOnly = detect({ 'src-tauri/tauri.conf.json': JSON.stringify({ productName: 'Shell', build: {} }) });
  assert.deepEqual(tauriOnly.services.map(s => [s.name, s.command]), [['Desktop app (Tauri)', 'cargo tauri dev']]);
  const readme = detect({ 'README.md': '# X\n\n```sh\n./dev setup\n./dev\n```\n', 'Cargo.toml': '[workspace]\nmembers = []\n' },
    { inventory: { listing: {}, present: { dev: 'file' } } });
  assert.deepEqual(readme.services, [{ name: 'Dev command', command: './dev', source: 'README.md', guess: false }]);
  assert.deepEqual([readme.kind, readme.kind_source], ['library', { source: 'Cargo.toml [workspace]', guess: true }], 'a bare workspace is the last fallback');
  const script = detect({}, { inventory: { listing: {}, present: { 'bin/dev': 'file' } } });
  assert.deepEqual(script.services.map(s => [s.command, s.guess]), [['bin/dev', true]]);
  const make = detect({ Makefile: 'dev:\n\tgo run .\n', 'go.mod': 'module example.com/svc\n' });
  assert.deepEqual(make.services.map(s => s.command), ['make dev']);
  // A documented command joins the one dev server that has no command of its own.
  const compose = detect({ 'compose.yaml': 'services:\n  app:\n    build: .\n    ports: ["8080:80"]\n' });
  assert.equal(compose.services[0].command, 'docker compose up app');
  const nx = detect({ 'project.json': JSON.stringify({ name: 'studio', projectType: 'application' }), 'Cargo.toml': '[workspace]\n' });
  assert.deepEqual([nx.kind, nx.name], ['web', 'studio'], 'an Nx application is never a guessed library');
  // Commands never reach a draft from chores, and the draft stays valid.
  const chores = detect({ 'README.md': '```sh\nnpm install\nnpm test\n```\n' });
  assert.deepEqual(chores.services, []);
  for (const d of [vite, electron, tauriOnly, readme, script, make, compose, nx, chores]) assert.deepEqual(d, validateDetectionDraft(d));
});

test('kind: a macOS app icon or Xcode project makes a desktop app unless a web dev server says otherwise', () => {
  const icns = { listing: { 'apps/browser/branding': { dirs: [], files: ['app.icns', 'default256.png'] } }, sizes: {} };
  assert.deepEqual(detect({}, { icons: icns }).kind_source, { source: 'apps/browser/branding/app.icns (macOS app icon)', guess: true });
  assert.equal(detect({ 'package.json': JSON.stringify({ scripts: { dev: 'vite' } }) }, { icons: icns }).kind, 'web');
  assert.equal(detect({}, { inventory: { listing: { macos: ['Notes.xcodeproj'] }, present: {} } }).kind, 'desktop');
  assert.equal(detect({}, { inventory: { listing: { ios: ['Notes.xcodeproj'] }, present: {} } }).kind, 'mobile');
  throwsCode(() => detect({}, { icons: 'x' }), 'INVALID_INPUT', '$.icons');
});

test('icon paths, folders and the reader policy', () => {
  for (const ok of ['icon.png', 'public/favicon.svg', 'assets/brand/logo-v2/app-icon.SVG', 'src-tauri/icons/128x128.png', 'build/icon.png']) assert.ok(isIconFile(ok, { readable: true }), ok);
  for (const bad of ['icon.gif', '.github/logo.png', 'a/../icon.png', '/icon.png', 'node_modules/x/icon.png', 'a//icon.png', 'icon.png/', '', null]) {
    assert.ok(!isIconFile(bad, { readable: true }), String(bad));
  }
  assert.ok(isIconFile('branding/app.icns') && !isIconFile('branding/app.icns', { readable: true }));
  for (const ok of ['', 'public', 'apps/web/public', 'assets/brand', 'assets/brand/browser-logo-v2', 'src-tauri', 'app/icons']) assert.ok(isIconDir(ok), ok);
  for (const bad of ['src/components', 'node_modules/public', '.github', 'dist/assets', 'assets/brand/../x', 'a/b/c/d/e/f/g/h/public', null]) assert.ok(!isIconDir(bad), String(bad));
  assert.equal(iconRefusal({ path: 'icon.png', resolvedPath: 'icon.png', isFile: true, size: 100 }), null);
  assert.equal(iconRefusal({ path: 'icon.png', resolvedPath: null, isFile: true, size: 100 }), 'symlink_outside_root');
  assert.equal(iconRefusal({ path: 'icon.png', resolvedPath: '.env', isFile: true, size: 100 }), 'not_allowlisted');
  assert.equal(iconRefusal({ path: 'icon.png', resolvedPath: 'icon.png', isFile: false, size: 100 }), 'not_regular_file');
  assert.equal(iconRefusal({ path: 'icon.png', resolvedPath: 'icon.png', isFile: true, size: MAX_ICON_BYTES + 1 }), 'too_large');
  assert.equal(iconRefusal({ path: '.env.png', resolvedPath: '.env.png', isFile: true, size: 1 }), 'not_allowlisted');
  assert.equal(validateIconPath('assets/icon.svg'), 'assets/icon.svg');
  for (const bad of ['../icon.png', '~/icon.png', 'https://x/icon.png', 'icon.png?x', '.hidden/icon.png', 'icon.txt', '']) throwsCode(() => validateIconPath(bad), 'INVALID_INPUT');
});

test('icon search: units first, then icon folders, logo folders inside brand folders; bounded', () => {
  const units = ['', 'apps/browser'];
  assert.deepEqual(iconListPlan({ units }), ['', 'apps/browser']);
  const listing = { '': { dirs: ['assets', 'src', 'docs'], files: [] }, 'apps/browser': { dirs: ['branding', 'chrome'], files: [] } };
  assert.deepEqual(iconListPlan({ units, listing }), ['assets', 'src', 'apps/browser/branding']);
  const deeper = { ...listing, assets: { dirs: ['brand', 'fonts'], files: [] }, src: { dirs: ['app', 'lib'], files: [] }, 'apps/browser/branding': { dirs: [], files: [] } };
  assert.deepEqual(iconListPlan({ units, listing: deeper }), ['assets/brand', 'src/app']);
  const brand = { ...deeper, 'assets/brand': { dirs: ['browser-logo-v2', 'fonts-v1', 'symbol'], files: [] }, 'src/app': { dirs: [], files: [] } };
  assert.deepEqual(iconListPlan({ units, listing: brand }), ['assets/brand/browser-logo-v2', 'assets/brand/symbol']);
  const full = Object.fromEntries(Array.from({ length: 48 }, (_, i) => [`d${i}`, { dirs: ['public'], files: [] }]));
  assert.deepEqual(iconListPlan({ units, listing: full }), [], 'at most MAX_ICON_LISTINGS folders');
});

test('icon choice: configuration and README beat names; previews lose; too large or missing falls through', () => {
  const listing = {
    'assets/brand/logo-v1': { dirs: [], files: ['app-icon-v1-1024.png', 'README.md'] },
    'assets/brand/logo-v2': { dirs: [], files: ['app-icon-v2.svg', 'app-icon-v2-preview.png', 'build_icons.py'] },
    'apps/browser/branding': { dirs: [], files: ['default256.png', 'default16.png', 'firefox.icns'] },
    public: { dirs: [], files: ['favicon.ico', 'og-image.png', 'robots.txt'] },
  };
  const hints = [{ path: 'assets/brand/logo-v1/app-icon-v1-1024.png', source: 'README.md image', weight: 40 }];
  const candidates = iconCandidates({ listing, hints });
  assert.deepEqual(candidates.slice(0, 3).map(c => c.path), ['assets/brand/logo-v1/app-icon-v1-1024.png', 'assets/brand/logo-v2/app-icon-v2.svg',
    'apps/browser/branding/default256.png']);
  assert.ok(candidates.findIndex(c => c.path.endsWith('preview.png')) > 2, 'previews come after real icons');
  assert.ok(!candidates.some(c => /og-image|robots|build_icons|\.icns/.test(c.path)));
  const file = size => ({ kind: 'file', size });
  // The README image is too large to show, so the next one wins (as a guess).
  assert.deepEqual(chooseIcon(candidates, { 'assets/brand/logo-v1/app-icon-v1-1024.png': file(936364), 'assets/brand/logo-v2/app-icon-v2.svg': file(38789) }),
    { path: 'assets/brand/logo-v2/app-icon-v2.svg', source: 'assets/brand/logo-v2/app-icon-v2.svg (named like an icon)', guess: true });
  assert.deepEqual(chooseIcon(candidates, { 'assets/brand/logo-v1/app-icon-v1-1024.png': file(1000) }).guess, false);
  assert.equal(chooseIcon(candidates, {}), null);
  assert.equal(chooseIcon(candidates, { 'assets/brand/logo-v2/app-icon-v2.svg': { kind: 'other', size: 10 } }), null, 'only regular files');
  assert.deepEqual(appIconFiles(listing), ['apps/browser/branding/firefox.icns']);
});

test('fixture desktop-browser: desktop app started with ./dev, its brand icon; reads and lists stay in the plans', async () => {
  const fx = await materializeFixture('desktop-browser');
  try {
    await symlink(join(fx.base, '..'), join(fx.root, 'assets', 'brand', 'logo-outside'));
    await writeFile(join(fx.root, 'assets', 'brand', 'logo-v2', '.env.png'), 'TRAP never-read');
    const { draft, ico, opened } = await detectFixture(fx.root, 'desktop-browser');
    assert.deepEqual(draft, validateDetectionDraft(draft));
    assert.deepEqual(JSON.parse(JSON.stringify({ ...draft, refused: [] })), await expected('desktop-browser'));
    assert.deepEqual([draft.kind, draft.services.map(s => s.command), draft.icon.path], ['desktop', ['./dev'], 'assets/brand/logo-v2/browser-icon-v2.svg']);
    for (const dir of Object.keys(ico.icons.listing)) assert.ok(dir === '' || isIconDir(dir) || ['apps/browser', 'packages/core'].includes(dir), dir);
    for (const path of Object.keys(ico.icons.sizes)) assert.ok(isIconFile(path, { readable: true }), path);
    assert.ok(!opened.some(p => /\.env|id_ed25519|\.png|\.svg|\.icns/.test(p)), JSON.stringify(opened));
    assert.doesNotMatch(JSON.stringify(draft), /TRAP|never-read|logo-outside/);
    // Confirmed as a v3 manifest that round-trips; the icon and command are kept.
    const m = draftToManifest(draft);
    assert.deepEqual([m.version, m.icon, m.services], [3, 'assets/brand/logo-v2/browser-icon-v2.svg', [{ name: 'Desktop app', command: './dev' }]]);
    assert.equal(serializeManifest(parseManifest(serializeManifest(m))), serializeManifest(m));
  } finally { await fx.cleanup(); }
});

test('manifest v3 and the setup document validate strictly', () => {
  const base = { name: 'X', kind: 'desktop', environments: [], surfaces: [] };
  assert.equal(validateManifest({ ...base, version: 3, services: [{ name: 'App', command: './dev', cwd: 'apps/x' }] }).services[0].cwd, 'apps/x');
  throwsCode(() => validateManifest({ ...base, version: 2, services: [{ name: 'App', command: './dev' }] }), 'INVALID_MANIFEST');
  throwsCode(() => validateManifest({ ...base, version: 2, icon: 'icon.png', services: [] }), 'INVALID_MANIFEST', '$.icon');
  throwsCode(() => validateManifest({ ...base, version: 3, services: [{ name: 'App', url: 'http://localhost:1/' }] }), 'INVALID_MANIFEST', '$.services[0]');
  throwsCode(() => validateManifest({ ...base, version: 3, services: [{ name: 'App', cwd: 'x', url: 'http://localhost:1/', port: 1 }] }), 'INVALID_MANIFEST', '$.services[0].cwd');
  throwsCode(() => validateManifest({ ...base, version: 3, services: [{ name: 'App', command: './dev', cwd: '' }] }), 'INVALID_MANIFEST', '$.services[0].cwd');
  throwsCode(() => validateManifest({ ...base, version: 3, services: [{ name: 'App', command: 'a\nb' }] }), 'INVALID_MANIFEST', '$.services[0].command');
  // Serialization uses the lowest version the fields need.
  assert.match(serializeManifest({ ...base, version: 3, services: [] }), /"version": 3/, 'never lowered');
  assert.match(serializeManifest({ ...base, version: 1, services: [] }), /"version": 1/);
  const doc = { version: 1, name: null, kind: 'desktop', kind_reason: ' Native app ', icon: ' assets/icon.png ',
    services: [{ name: 'App', kind: 'desktop', command: './dev', cwd: null, url: 'http://127.0.0.1:8080/' }] };
  assert.deepEqual(validateSetupDocument(doc), { ...doc, kind_reason: 'Native app', icon: 'assets/icon.png',
    services: [{ ...doc.services[0], url: 'http://127.0.0.1:8080' }] });
  for (const [patch, path] of [[{ kind: 'game' }, '$.kind'], [{ extra: 1 }, '$.extra'], [{ icon: '../x.png' }, '$.icon'], [{ icon: '.env.png' }, '$.icon'],
    [{ services: [{ ...doc.services[0], url: 'http://example.com:80' }] }, '$.services[0].url'],
    [{ services: [{ ...doc.services[0], url: 'http://localhost/' }] }, '$.services[0].url'],
    [{ services: [{ ...doc.services[0], cwd: '/abs' }] }, '$.services[0].cwd'],
    [{ services: Array.from({ length: 9 }, () => doc.services[0]) }, '$.services']]) {
    throwsCode(() => validateSetupDocument({ ...doc, ...patch }), 'INVALID_SETUP', path);
  }
});
