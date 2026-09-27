/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ContextsError, DETECTION_FILES, MAX_FILE_BYTES, detectProject, detectionRefusal, isAllowedPath, validateDetectionDraft, draftManifestState } from '../src/index.mjs';
import { parseToml, parseYaml, gitRemoteUrls, remoteToWeb } from '../src/detect.mjs';
import { materializeFixture, readFixtureRepo, TMP_DIR } from './fixture-reader.mjs';

const FIXTURES = ['vite-app', 'next-app', 'tauri-app', 'cargo-lib', 'compose-fly', 'creds-remote', 'malformed', 'electron-app', 'with-manifest'];
const detect = (files, extra = {}) => detectProject({ rootName: 'fixture', files, ...extra });
const pkg = (scripts, more = {}) => ({ 'package.json': JSON.stringify({ name: 'app', scripts, ...more }) });

test('allowlist is exactly the contract list', () => {
  assert.deepEqual([...DETECTION_FILES], ['package.json', '.vercel/project.json', 'vercel.json', 'netlify.toml', 'wrangler.toml', 'wrangler.json',
    'fly.toml', 'docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml', 'src-tauri/tauri.conf.json', 'tauri.conf.json',
    'electron-builder.json', 'electron-builder.yml', 'Cargo.toml', 'pyproject.toml', 'go.mod', '.git/config', '.axiosozo/project.json']);
  assert.ok(Object.isFrozen(DETECTION_FILES));
  for (const bad of ['.env', '.env.local', '.git/HEAD', '.git/credentials', './package.json', '/package.json', 'a/package.json', 'node_modules/x/package.json',
    'src-tauri/../package.json', 'PACKAGE.JSON', 'package.json ', 'id_rsa', '.npmrc', '.git-credentials', '', null, undefined, {}]) {
    assert.equal(isAllowedPath(bad), false, String(bad));
  }
});

for (const name of FIXTURES) {
  test(`fixture ${name} produces the expected draft and never opens traps`, async () => {
    const fx = await materializeFixture(name);
    try {
      const { files, refused, opened } = await readFixtureRepo(fx.root);
      for (const path of opened) assert.ok(DETECTION_FILES.includes(path), path);
      assert.ok(!opened.some(p => p.startsWith('.env') || p.includes('id_ed25519')));
      const draft = detectProject({ rootName: name, files, refused });
      assert.deepEqual(draft, validateDetectionDraft(draft));
      assert.deepEqual(JSON.parse(JSON.stringify(draft)), JSON.parse(await readFile(new URL(`./expected/${name}.json`, import.meta.url), 'utf8')));
      assert.doesNotMatch(JSON.stringify(draft), /TRAP|never-read|should-not-be-read/);
    } finally { await fx.cleanup(); }
  });
}

test('F3 acceptance essentials for Vite, Next, Tauri and a plain library', async () => {
  const load = async n => JSON.parse(await readFile(new URL(`./expected/${n}.json`, import.meta.url), 'utf8'));
  const vite = await load('vite-app'), next = await load('next-app'), tauri = await load('tauri-app'), lib = await load('cargo-lib');
  assert.deepEqual([vite.kind, vite.environments[0].base_url, vite.environments[0].guess], ['web', 'http://localhost:5173/', true]);
  assert.deepEqual([next.kind, next.environments[0].base_url, next.environments[0].guess], ['web', 'http://localhost:3001/', false]);
  assert.ok(next.surfaces.some(s => s.kind === 'hosting' && s.url === 'https://vercel.com/dashboard'), 'Vercel identity is a dashboard surface');
  assert.ok(!next.environments.some(e => e.name === 'production'), 'Vercel never yields a production URL');
  assert.deepEqual([tauri.kind, tauri.name, tauri.environments[0].base_url, tauri.environments[0].guess], ['desktop', 'Tauri Fixture', 'http://localhost:1420/', false]);
  assert.ok(!tauri.services.some(s => s.port === 5173), 'the superseded Vite guess does not linger');
  assert.deepEqual([lib.kind, lib.environments.length, lib.services.length], ['library', 0, 0]);
  assert.ok(lib.surfaces.some(s => s.kind === 'package' && s.url === 'https://crates.io/crates/tiny-lib'));
});

test('credentials in git remotes and package.json never reach the draft', async () => {
  const fx = await materializeFixture('creds-remote');
  try {
    const { files } = await readFixtureRepo(fx.root);
    const text = JSON.stringify(detect(files));
    for (const secret of ['alice', 'synthetic-remote-password', 'oauth2', 'synthetic-mirror-token', 'bob', 'synthetic-package-password', 'synthetic@example.invalid', 'store']) {
      assert.ok(!text.includes(secret), secret);
    }
    const noGit = JSON.stringify(detect({ 'package.json': files['package.json'] }));
    assert.ok(!noGit.includes('synthetic-package-password') && noGit.includes('https://github.com/acme/widget'));
    assert.match(noGit, /removed credentials/);
  } finally { await fx.cleanup(); }
});

test('reader refuses symlinks leaving the root or to non-allowlisted files, non-files, oversize and invalid UTF-8', async () => {
  const base = join(TMP_DIR, `symlink-${process.pid}-${Date.now()}`);
  const root = join(base, 'repo'), outside = join(base, 'outside');
  await mkdir(join(root, 'config'), { recursive: true }); await mkdir(outside, { recursive: true });
  try {
    await writeFile(join(outside, 'package.json'), JSON.stringify({ name: 'outside-secret', scripts: { dev: 'next dev' } }));
    await mkdir(join(outside, 'vercel-dir'));
    await writeFile(join(outside, 'vercel-dir', 'project.json'), JSON.stringify({ projectName: 'outside-secret' }));
    await symlink(join(outside, 'package.json'), join(root, 'package.json'));
    await symlink(join(outside, 'vercel-dir'), join(root, '.vercel'));
    await writeFile(join(root, 'docker-compose.yml'), 'services:\n  web:\n    ports: ["8080:80"]\n');
    await symlink('docker-compose.yml', join(root, 'compose.yml'));
    await writeFile(join(root, 'config', 'fly.toml'), 'app = "not-allowlisted-target"\n');
    await symlink(join(root, 'config', 'fly.toml'), join(root, 'fly.toml'));
    await writeFile(join(root, '.env'), 'TRAP=never-read\n');
    await symlink(join(root, '.env'), join(root, 'netlify.toml'));
    await symlink('../outside/package.json', join(root, 'wrangler.toml'));
    await mkdir(join(root, 'Cargo.toml'));
    await writeFile(join(root, 'go.mod'), `module example.com/big\n//${'x'.repeat(MAX_FILE_BYTES)}\n`);
    await writeFile(join(root, 'pyproject.toml'), Buffer.from([0x5b, 0x70, 0xff, 0xfe, 0x5d]));
    const { files, refused, opened } = await readFixtureRepo(root);
    assert.deepEqual(opened, ['docker-compose.yml', 'docker-compose.yml', 'pyproject.toml'], 'only regular allowlisted files; the invalid UTF-8 bytes are read then refused');
    assert.deepEqual(Object.fromEntries(refused.map(r => [r.path, r.reason])), {
      'package.json': 'symlink_outside_root', '.vercel/project.json': 'symlink_outside_root', 'netlify.toml': 'not_allowlisted', 'wrangler.toml': 'symlink_outside_root',
      'fly.toml': 'not_allowlisted', 'Cargo.toml': 'not_regular_file', 'go.mod': 'too_large', 'pyproject.toml': 'invalid_utf8',
    });
    const draft = detect(files, { refused });
    assert.doesNotMatch(JSON.stringify(draft), /outside-secret|never-read|not-allowlisted-target/);
    assert.deepEqual(draft.refused, refused);
    assert.deepEqual(draft.services.map(s => s.port), [8080]);
  } finally { await rm(base, { recursive: true, force: true }); }
});

test('detectionRefusal policy', () => {
  const ok = { path: 'package.json', resolvedPath: 'package.json', isFile: true, size: 10 };
  assert.equal(detectionRefusal(ok), null);
  assert.equal(detectionRefusal({ ...ok, resolvedPath: 'compose.yml', path: 'docker-compose.yml' }), null);
  assert.equal(detectionRefusal({ ...ok, path: '.env' }), 'not_allowlisted');
  assert.equal(detectionRefusal({ ...ok, resolvedPath: '.env' }), 'not_allowlisted');
  assert.equal(detectionRefusal({ ...ok, resolvedPath: 'node_modules/x/package.json' }), 'not_allowlisted');
  assert.equal(detectionRefusal({ ...ok, resolvedPath: null }), 'symlink_outside_root');
  assert.equal(detectionRefusal({ ...ok, isFile: false }), 'not_regular_file');
  assert.equal(detectionRefusal({ ...ok, size: MAX_FILE_BYTES }), null);
  assert.equal(detectionRefusal({ ...ok, size: MAX_FILE_BYTES + 1 }), 'too_large');
  assert.equal(detectionRefusal({ ...ok, size: undefined }), 'too_large');
});

test('files outside the allowlist are refused without being touched', () => {
  const touched = [];
  const files = {};
  for (const path of ['.env', '.env.production', '../package.json', '/etc/passwd', 'node_modules/next/package.json', '.git/credentials', 'id_rsa', '__proto__', 'constructor']) {
    Object.defineProperty(files, path, { enumerable: true, get() { touched.push(path); return 'TRAP'; } });
  }
  files['package.json'] = JSON.stringify({ name: 'ok', scripts: { dev: 'vite' } });
  const draft = detect(files);
  assert.deepEqual(touched, []);
  assert.deepEqual(draft.refused.map(r => r.reason), Array(9).fill('not_allowlisted'));
  assert.deepEqual(draft.files_read, ['package.json']);
  assert.ok(!JSON.stringify(draft.surfaces).includes('TRAP'));
});

test('oversized and non-string contents are refused; bad arguments throw', () => {
  const draft = detect({ 'package.json': 'x'.repeat(MAX_FILE_BYTES + 1), 'go.mod': 42, 'fly.toml': '€'.repeat(90000) });
  assert.deepEqual(Object.fromEntries(draft.refused.map(r => [r.path, r.reason])), { 'package.json': 'too_large', 'go.mod': 'unreadable', 'fly.toml': 'too_large' });
  assert.equal(detect({ 'package.json': 'x'.repeat(MAX_FILE_BYTES) }).refused.length, 0);
  for (const bad of [{ files: null }, { files: [] }, { files: 'x' }, { refused: {} }, { refused: [{ path: 'x', reason: 'nope' }] }]) {
    assert.throws(() => detectProject({ rootName: 'x', ...bad }), e => e instanceof ContextsError && e.code === 'INVALID_INPUT');
  }
});

test('name falls back to a sanitized root name', () => {
  assert.equal(detectProject({ rootName: 'my\u0000repo\n', files: {} }).name, 'myrepo');
  assert.equal(detectProject({ rootName: '', files: {} }).name, 'project');
  assert.equal(detectProject({ rootName: 'x'.repeat(200), files: {} }).name.length, 80);
  const empty = detectProject({ rootName: 'empty', files: {} });
  assert.deepEqual([empty.kind, empty.kind_source], ['web', { source: 'default', guess: true }]);
});

test('package.json scripts: frameworks, explicit ports and defaults', () => {
  const local = (scripts, more) => { const d = detect(pkg(scripts, more)); return [d.frameworks, d.environments[0]?.base_url, d.environments[0]?.guess]; };
  assert.deepEqual(local({ dev: 'vite --port 5174' }), [['vite'], 'http://localhost:5174/', false]);
  assert.deepEqual(local({ dev: 'vite --port=5175 --host' }), [['vite'], 'http://localhost:5175/', false]);
  assert.deepEqual(local({ dev: 'next dev -p 4000' }), [['next'], 'http://localhost:4000/', false]);
  assert.deepEqual(local({ dev: 'next dev' }), [['next'], 'http://localhost:3000/', true]);
  assert.deepEqual(local({ start: 'PORT=4100 react-scripts start' }), [['react-scripts'], 'http://localhost:4100/', false]);
  assert.deepEqual(local({ dev: 'cross-env PORT=4200 nuxt dev' }), [['nuxt'], 'http://localhost:4200/', false]);
  assert.deepEqual(local({ dev: 'astro dev' }), [['astro'], 'http://localhost:4321/', true]);
  assert.deepEqual(local({ dev: 'nuxi dev' }), [['nuxt'], 'http://localhost:3000/', true]);
  assert.deepEqual(local({ dev: 'vite dev' }, { devDependencies: { '@sveltejs/kit': '2' } }), [['sveltekit'], 'http://localhost:5173/', true]);
  assert.deepEqual(local({ dev: 'remix vite:dev' }), [['remix'], 'http://localhost:5173/', true]);
  assert.deepEqual(local({ dev: 'remix dev' }), [['remix'], 'http://localhost:3000/', true]);
  assert.deepEqual(local({ start: 'parcel index.html' }), [['parcel'], 'http://localhost:1234/', true]);
  assert.deepEqual(local({ serve: 'webpack serve --port 9000' }), [['webpack-dev-server'], 'http://localhost:9000/', false]);
  assert.deepEqual(local({ start: 'ng serve' }), [['angular'], 'http://localhost:4200/', true]);
  assert.deepEqual(local({ develop: 'gatsby develop -p 8001' }), [['gatsby'], 'http://localhost:8001/', false]);
  assert.deepEqual(local({ dev: 'wrangler dev' }), [['wrangler'], 'http://localhost:8787/', true]);
  assert.deepEqual(local({ dev: 'npm run web', web: 'pnpm exec vite --port 6000' }), [['vite'], 'http://localhost:6000/', false]);
  assert.deepEqual(local({ dev: 'tsc -p tsconfig.json && vite' }), [['vite'], 'http://localhost:5173/', true]);
  assert.deepEqual(local({ dev: 'next dev -p 99999' }), [['next'], 'http://localhost:3000/', true]);
  assert.deepEqual(local({ dev: 'npm run a', a: 'npm run b', b: 'npm run a' }), [[], undefined, undefined], 'reference cycles terminate');
  assert.deepEqual(local({ build: 'vite build' }, { devDependencies: { vite: '6' } }), [['vite'], 'http://localhost:5173/', true]);
  assert.equal(detect(pkg({ build: 'vite build' }, { devDependencies: { vite: '6' } })).environments[0].source, 'Vite default port (package.json dependency vite)');
  assert.deepEqual(local({ preview: 'vite preview', build: 'next build', start: 'next start' }), [[], undefined, undefined], 'non-dev commands are ignored');
  const sb = detect(pkg({ dev: 'vite', storybook: 'storybook dev -p 6007' }));
  assert.deepEqual(sb.services.map(s => [s.name, s.port, s.guess]), [['Vite dev server', 5173, true], ['Storybook', 6007, false]]);
  assert.deepEqual(detect(pkg({ dev: 'expo start' })).kind, 'mobile');
  assert.deepEqual(detect(pkg({}, { bin: { x: 'x.js' } })).kind_source, { source: 'package.json bin', guess: false });
  const lib = detect(pkg({}, { main: 'index.js', repository: 'github:acme/lib', bugs: 'https://github.com/acme/lib/issues', homepage: 'https://lib.example.org' }));
  assert.equal(lib.kind, 'library');
  assert.deepEqual(lib.surfaces.map(s => s.url), ['https://github.com/acme/lib', 'https://github.com/acme/lib/issues', 'https://github.com/acme/lib/actions',
    'https://github.com/acme/lib/releases', 'https://www.npmjs.com/package/app', 'https://lib.example.org/']);
  assert.ok(!detect(pkg({}, { main: 'x.js', private: true })).surfaces.some(s => s.kind === 'package'), 'private packages get no registry surface');
  const hostile = detect(pkg({ dev: 'vite' }, { homepage: 'javascript:alert(1)', bugs: { url: 'https://u:p@evil.test/' } }));
  assert.ok(!hostile.surfaces.length && hostile.warnings.length === 2);
});

test('tauri v1/v2 and electron builder', () => {
  const v1 = detect({ 'tauri.conf.json': JSON.stringify({ build: { devPath: 'http://localhost:8080', distDir: '../dist' }, package: { productName: 'Old Tauri' } }) });
  assert.deepEqual([v1.kind, v1.name, v1.environments[0].base_url, v1.environments[0].source], ['desktop', 'Old Tauri', 'http://localhost:8080/', 'tauri.conf.json build.devPath']);
  const dist = detect({ 'src-tauri/tauri.conf.json': JSON.stringify({ build: { devPath: '../dist' } }) });
  assert.deepEqual([dist.kind, dist.environments], ['desktop', []]);
  const templated = detect({ 'src-tauri/tauri.conf.json': JSON.stringify({ plugins: { updater: { endpoints: ['https://u.example.com/{{target}}/{{current_version}}'] } } }) });
  assert.deepEqual(templated.surfaces, []);
  const eb = detect({ 'electron-builder.json': JSON.stringify({ productName: 'EB', publish: { provider: 'github', owner: '../..', repo: 'x' } }) });
  assert.deepEqual([eb.kind, eb.name, eb.surfaces], ['desktop', 'EB', []]);
  const pkgBuild = detect(pkg({ start: 'electron-forge start' }, { build: { appId: 'com.x', publish: [{ provider: 'github', owner: 'acme', repo: 'desk' }] } }));
  assert.deepEqual([pkgBuild.kind, pkgBuild.surfaces[0].url], ['desktop', 'https://github.com/acme/desk/releases']);
});

test('hosting configs: vercel, netlify, wrangler, fly', () => {
  const vercel = detect({ 'vercel.json': '{"name":"legacy"}' });
  assert.deepEqual(vercel.surfaces.map(s => [s.name, s.url, s.kind]), [['Vercel (legacy)', 'https://vercel.com/dashboard', 'hosting']]);
  assert.deepEqual(vercel.environments, []);
  const netlify = detect({ 'netlify.toml': '[build]\ncommand = "npm run build"\n[dev]\nport = 8889\ntargetPort = 5173\n' });
  assert.deepEqual(netlify.services.map(s => [s.name, s.port]), [['Netlify Dev', 8889]]);
  const wj = detect({ 'wrangler.json': JSON.stringify({ name: 'api', routes: [{ pattern: 'api.example.com', custom_domain: true }, { pattern: '*.example.com/*' }], env: { prod: { route: 'example.org/app/*' } } }) });
  assert.deepEqual(wj.environments.map(e => [e.name, e.base_url]), [['production', 'https://api.example.com/']]);
  const wenv = detect({ 'wrangler.toml': 'name = "w"\n[env.production]\nroutes = ["www.example.com/*"]\n[env.preview]\nroute = "preview.example.com/*"\n' });
  assert.deepEqual(wenv.environments.map(e => [e.name, e.base_url]), [['preview', 'https://preview.example.com/'], ['production', 'https://www.example.com/']]);
  const pages = detect({ 'wrangler.toml': 'name = "my-site"\npages_build_output_dir = "./dist"\n' });
  assert.deepEqual(pages.environments.map(e => [e.base_url, e.guess]), [['https://my-site.pages.dev/', true]]);
  const evil = detect({ 'wrangler.toml': 'name = "x"\nroute = "evil.com@example.com/*"\n', 'fly.toml': 'app = "a.evil.com/"\n' });
  assert.deepEqual(evil.environments, []);
  assert.ok(evil.warnings.some(w => w.startsWith('fly.toml')));
});

test('docker compose published ports', () => {
  const doc = [
    'version: "3.9"', 'services:', '  app:', '    ports: ["3000:3000", "3001"]', '  web:', '    ports:', '      - 80:80', '      - "[::1]:8443:443/tcp"',
    '      - "8000-8002:8000-8002"', '      - "${PORT}:80"', '  worker:', '    image: x', 'volumes:', '  data: {}',
  ].join('\n');
  const d = detect({ 'compose.yaml': doc });
  assert.deepEqual(d.services.map(s => [s.name, s.port]), [['app', 3000], ['web (80)', 80], ['web (8443)', 8443]]);
  assert.equal(d.kind_source.source, 'compose.yaml published ports');
  assert.ok(d.warnings.some(w => w.includes('range')) && d.warnings.some(w => w.includes('interpolated')));
  const legacy = detect({ 'docker-compose.yml': 'web:\n  image: nginx\n  ports:\n    - "8081:80"\n' });
  assert.deepEqual(legacy.services.map(s => s.port), [8081]);
});

test('rust, python and go kinds', () => {
  assert.deepEqual(detect({ 'Cargo.toml': '[package]\nname = "tool"\n[[bin]]\nname = "tool"\npath = "src/main.rs"\n' }).kind_source, { source: 'Cargo.toml [[bin]]', guess: false });
  assert.deepEqual(detect({ 'Cargo.toml': '[package]\nname = "lib"\n[lib]\n' }).kind_source, { source: 'Cargo.toml [lib]', guess: false });
  assert.deepEqual(detect({ 'Cargo.toml': '[workspace]\nmembers = ["a", "b"]\n' }).kind_source, { source: 'Cargo.toml [workspace]', guess: true });
  assert.ok(!detect({ 'Cargo.toml': '[package]\nname = "priv"\npublish = false\n' }).surfaces.some(s => s.kind === 'package'));
  const py = detect({ 'pyproject.toml': '[project]\nname = "pytool"\n[project.scripts]\npytool = "pytool.cli:main"\n[project.urls]\nDocumentation = "https://pytool.example.org"\n"Bug Tracker" = "https://github.com/acme/pytool/issues"\n' });
  assert.deepEqual([py.name, py.kind], ['pytool', 'cli']);
  assert.deepEqual(py.surfaces.map(s => [s.kind, s.url]), [['issues', 'https://github.com/acme/pytool/issues'], ['package', 'https://pypi.org/project/pytool/'], ['docs', 'https://pytool.example.org/']]);
  const poetry = detect({ 'pyproject.toml': '[tool.poetry]\nname = "poet"\n' });
  assert.deepEqual([poetry.name, poetry.kind], ['poet', 'library']);
  const go = detect({ 'go.mod': 'module github.com/acme/gotool\n\ngo 1.23\n' });
  assert.deepEqual([go.name, go.kind, go.kind_source.guess, go.surfaces[0].url], ['gotool', 'library', true, 'https://pkg.go.dev/github.com/acme/gotool']);
  assert.ok(detect({ 'go.mod': 'module ../../etc\n' }).warnings.some(w => w.startsWith('go.mod')));
});

test('existing manifest is used as-is; an invalid one falls back to detection', async () => {
  const fx = await materializeFixture('with-manifest');
  try {
    const { files } = await readFixtureRepo(fx.root);
    const d = detect(files);
    assert.equal(draftManifestState(d), 'external');
    assert.deepEqual(d.frameworks, []);
    const bad = detect({ ...files, '.axiosozo/project.json': '{"version":1,"name":"x","kind":"web","environments":[],"services":[],"surfaces":[],"commands":["rm -rf /"]}' });
    assert.equal(draftManifestState(bad), 'none');
    assert.equal(bad.name, 'ignored-because-manifest-wins');
    assert.ok(bad.warnings.some(w => w.includes('INVALID_MANIFEST')));
    const secret = detect({ '.axiosozo/project.json': JSON.stringify({ version: 1, name: 'x', kind: 'web', environments: [], services: [], surfaces: [{ name: 'a', url: 'https://x.com/' + 'sk-' + 'Z9'.repeat(10), kind: 'other' }] }) });
    assert.ok(secret.warnings.some(w => w.includes('MANIFEST_SECRET')));
    // A committed manifest URL with a query is invalid (L5) and falls back to detection.
    const query = detect({ '.axiosozo/project.json': JSON.stringify({ version: 1, name: 'x', kind: 'web', environments: [], services: [], surfaces: [{ name: 'a', url: 'https://x.com/?token=abc', kind: 'other' }] }) });
    assert.ok(query.warnings.some(w => w.includes('INVALID_MANIFEST')));
    assert.equal(draftManifestState(query), 'none');
  } finally { await fx.cleanup(); }
});

test('git config: only remote urls, credentials stripped, scp converted', () => {
  const cfg = '[core]\n\tbare = false\n[remote "origin"]\n\turl = "git@github.com:acme/app.git" ; comment\n[remote.legacy]\nurl = https://x.test/a/b\n[url "https://evil/"]\n\tinsteadOf = gh:\n';
  assert.deepEqual(gitRemoteUrls(cfg), [{ name: 'origin', urls: ['git@github.com:acme/app.git'] }, { name: 'legacy', urls: ['https://x.test/a/b'] }]);
  const cases = [
    ['git@github.com:acme/app.git', { host: 'github.com', port: '', segments: ['acme', 'app'], credentials: false }],
    ['ssh://git@github.com:22/acme/app.git', { host: 'github.com', port: '', segments: ['acme', 'app'], credentials: false }],
    ['https://user:pw@GitHub.com/acme/app.git/', { host: 'github.com', port: '', segments: ['acme', 'app'], credentials: true }],
    ['https://token@github.com/acme/app', { host: 'github.com', port: '', segments: ['acme', 'app'], credentials: true }],
    ['https://git.example.com:8443/team/app.git', { host: 'git.example.com', port: '8443', segments: ['team', 'app'], credentials: false }],
    ['git+https://github.com/acme/app.git', { host: 'github.com', port: '', segments: ['acme', 'app'], credentials: false }],
    ['https://evil.com@github.com/a/b', { host: 'github.com', port: '', segments: ['a', 'b'], credentials: true }],
  ];
  for (const [input, out] of cases) assert.deepEqual(remoteToWeb(input), out, input);
  for (const bad of ['file:///srv/repo.git', '/srv/repo.git', '../repo', 'C:\\repo', 'ext::sh -c touch% /tmp/pwned', 'https://localhost/a/b', 'https://github.com/a/%2e%2e',
    'user:pass@host:path', 'https://github.com/a b/c', 'git@github.com:acme/app.git extra', 'fd::17/foo', '']) {
    assert.equal(remoteToWeb(bad), null, bad);
  }
  const surfaces = files => detect({ '.git/config': files }).surfaces.map(s => [s.kind, s.url, s.guess]);
  assert.deepEqual(surfaces('[remote "origin"]\nurl = https://bitbucket.org/acme/app.git\n'), [['repository', 'https://bitbucket.org/acme/app', false], ['ci', 'https://bitbucket.org/acme/app/pipelines', true]]);
  assert.deepEqual(surfaces('[remote "origin"]\nurl = https://git.sr.example/team/app\n'), [['repository', 'https://git.sr.example/team/app', true]]);
  assert.deepEqual(surfaces('[remote "upstream"]\nurl = https://codeberg.org/a/b\n[remote "origin"]\nurl = https://github.com/c/d\n')[0], ['repository', 'https://github.com/c/d', false], 'origin preferred');
  assert.ok(detect({ '.git/config': '[remote "origin"]\nurl = /srv/git/app.git\n' }).warnings.some(w => w.includes('not a web-hosted')));
});

test('TOML reader', () => {
  const { value, errors } = parseToml([
    'title = "A \\"quoted\\" \\u00e9 \\U0001F600"', "lit = 'C:\\path'", 'multi = """', 'line1', 'line2\\', '   joined"""', "raw = '''", 'x\\y', "'''",
    'int = 1_000', 'hex = 0xff', 'flt = 6.5e2', 'neg = -3', 'yes = true', 'date = 2026-09-27', 'dt = 2026-09-27 10:00:00', 'arr = [1, [2, 3], "four",]',
    'inline = { a = 1, b.c = "d" }', 'dotted.key = "v"', '"quoted key" = 1', '[table.sub]', 'k = "v"', '[[items]]', 'n = 1', '[[items]]', 'n = 2', '[items.detail]', 'z = 1',
  ].join('\n'));
  assert.deepEqual(errors, []);
  assert.equal(value.title, 'A "quoted" é 😀');
  assert.equal(value.lit, 'C:\\path');
  assert.equal(value.multi, 'line1\nline2joined');
  assert.equal(value.raw, 'x\\y\n');
  assert.deepEqual([value.int, value.hex, value.flt, value.neg, value.yes, value.date, value.dt], [1000, 255, 650, -3, true, '2026-09-27', '2026-09-27 10:00:00']);
  assert.deepEqual(value.arr, [1, [2, 3], 'four']);
  assert.deepEqual(value.inline, { a: 1, b: { c: 'd' } });
  assert.deepEqual([value.dotted.key, value['quoted key'], value.table.sub.k], ['v', 1, 'v']);
  assert.deepEqual(value.items, [{ n: 1 }, { n: 2, detail: { z: 1 } }]);
  const bad = parseToml('a = 1\na = 2\n__proto__ = { polluted = true }\nb = "unterminated\nc = [1, 2\nd = 4\nf = 6\n');
  assert.equal(bad.value.a, 1);
  assert.equal(bad.value.f, 6, 'parsing resumes after a broken statement');
  assert.equal(bad.errors.length, 4);
  const headers = parseToml('[__proto__]\npolluted = true\n[x\ne = 5\n[ok]\ng = 7\n[a.__proto__.b]\nh = 1\n');
  assert.deepEqual(headers.value, { ok: { g: 7 } }, 'keys after a broken header are not misattributed');
  assert.equal(headers.errors.length, 3);
  assert.equal({}.polluted, undefined);
  assert.ok(parseToml(`x = ${'['.repeat(5000)}`).errors.some(e => e.includes('nesting')));
  assert.equal(parseToml('x = 1\n'.repeat(5) + 'bad\n'.repeat(100)).errors.at(-1), 'too many errors; stopped');
});

test('YAML subset reader', () => {
  const { value, errors } = parseYaml([
    '# comment', 'name: "quoted # not comment"', "single: 'it''s'", 'plain: value # comment', 'num: 42', 'flag: false', 'nothing: ~', 'flow: [a, "b", 3]',
    'map: {x: 1, y: two}', 'anchor: &a', '  k: v', 'alias: *a', 'block: |', '  line one', '  line two', 'list:', '- one', '- two', 'nested:', '  - key: v', '    other: w',
    '  -', '    deep: true', '<<: *a', '__proto__: {polluted: true}',
  ].join('\n'));
  assert.deepEqual(value.name, 'quoted # not comment');
  assert.deepEqual([value.single, value.plain, value.num, value.flag, value.nothing], ["it's", 'value', 42, false, null]);
  assert.deepEqual(value.flow, ['a', 'b', 3]);
  assert.deepEqual(value.map, { x: 1, y: 'two' });
  assert.deepEqual(value.anchor, { k: 'v' });
  assert.equal(value.alias, null);
  assert.equal(value.block, 'line one\nline two');
  assert.deepEqual(value.list, ['one', 'two']);
  assert.deepEqual(value.nested, [{ key: 'v', other: 'w' }, { deep: true }]);
  assert.ok(errors.some(e => e.includes('forbidden key')) && errors.some(e => e.includes('alias')));
  assert.equal({}.polluted, undefined);
  assert.equal(parseYaml('a: 1\n---\nb: 2\n').value.b, undefined, 'only the first document');
  const deep = Array.from({ length: 100 }, (_, i) => `${' '.repeat(i * 2)}k${i}:`).join('\n');
  assert.ok(parseYaml(deep).errors.some(e => e.includes('nesting')));
});

test('hostile input never throws and always yields a valid draft', () => {
  let seed = 12345;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const alphabet = '{}[]"\'=:,.-_ #\n\t\\/@*${}<>!&|%0123456789abcxyzABC\u0000\u2028é😀';
  const noise = n => Array.from({ length: n }, () => alphabet[Math.floor(rand() * alphabet.length)]).join('');
  const nasty = ['', '\ufeff', 'null', '[]', '"string"', '1e999', '{"__proto__":{"polluted":true}}', '['.repeat(100000), '{"a":'.repeat(50000),
    `[${'['.repeat(40)}`, 'a = '.repeat(1000), '- - - - -\n'.repeat(100), '\\'.repeat(1000), '"""', "'''", '[remote "x"]\nurl = \n', 'module \n',
    JSON.stringify({ scripts: { dev: 'vite --port '.repeat(500) } }), JSON.stringify({ scripts: Object.fromEntries(Array.from({ length: 300 }, (_, i) => [`s${i}`, `npm run s${i + 1}`])) })];
  for (const path of DETECTION_FILES) {
    for (const content of [...nasty, ...Array.from({ length: 25 }, () => noise(400))]) {
      const draft = detect({ [path]: content });
      assert.deepEqual(draft, validateDetectionDraft(draft), path);
    }
  }
  assert.equal({}.polluted, undefined);
  assert.equal(Object.prototype.polluted, undefined);
});

test('parsers stay linear on pathological 256 KiB inputs (no regex backtracking blowups)', () => {
  const N = MAX_FILE_BYTES - 64;
  const scripts = Object.fromEntries(Array.from({ length: 80 }, (_, i) => [`s${i}`, Array.from({ length: 80 }, (_, j) => `npm run s${j}`).join(' && ')]));
  const cases = [
    ['docker-compose.yml', `a:${' '.repeat(N)}x`], ['docker-compose.yml', `a${' '.repeat(N)}`], ['docker-compose.yml', `x: {${'a '.repeat(N / 2)}}`],
    ['electron-builder.yml', `"${'\\"'.repeat(N / 2)}`], ['electron-builder.yml', `${'- '.repeat(N / 2)}x`],
    ['.git/config', `[${'a'.repeat(N / 2)}${' '.repeat(N / 2)}`], ['.git/config', `[remote${' '.repeat(N)}`], ['.git/config', `[remote "x"]\nurl = ${'/'.repeat(N)}a`],
    ['go.mod', '\n'.repeat(N)], ['go.mod', `module${' '.repeat(N)}x y`],
    ['wrangler.toml', `route = "a.com${'/'.repeat(N - 20)}x"`], ['wrangler.toml', `route = "${'a'.repeat(N / 2)}/${'b'.repeat(N / 2 - 20)}*x"`],
    ['Cargo.toml', `x = ${'1_'.repeat(N / 2)}`], ['Cargo.toml', `x = "${'\\u00e9'.repeat(N / 6)}"`], ['pyproject.toml', '#'.repeat(N)],
    ['package.json', JSON.stringify({ scripts })], ['package.json', JSON.stringify({ scripts: { dev: `vite ${'-p '.repeat(N / 4)}` } })],
  ];
  for (const [path, content] of cases) {
    const start = performance.now();
    detectProject({ rootName: 'x', files: { [path]: content } });
    assert.ok(performance.now() - start < 1500, `${path} took ${Math.round(performance.now() - start)} ms`);
  }
});

test('warnings and sources never echo file content or odd remote names', () => {
  const d = detect({ 'Cargo.toml': 'x = SECRETVALUE123\n', '.git/config': '[remote "tok@en\\"x"]\nurl = https://github.com/a/b\n' });
  assert.doesNotMatch(JSON.stringify(d), /SECRETVALUE123|tok@en/);
  assert.ok(d.surfaces.every(s => s.source === '.git/config remote remote'));
});

test('detected service and surface URLs lose any query or fragment (L5)', () => {
  const d = detect({
    'package.json': JSON.stringify({ name: 'q', homepage: 'https://q.example/app?utm=1#top', bugs: { url: 'https://q.example/issues?token=abc' } }),
    'src-tauri/tauri.conf.json': JSON.stringify({ build: { devUrl: 'http://localhost:1420/?debug=1#x' } }),
  });
  const urls = [...d.services, ...d.surfaces].map(item => item.url);
  assert.ok(urls.includes('https://q.example/app'), JSON.stringify(urls));
  assert.ok(urls.includes('https://q.example/issues'), JSON.stringify(urls));
  assert.ok(d.services.some(s => s.url === 'http://localhost:1420/' && s.port === 1420), JSON.stringify(d.services));
  assert.ok(urls.every(url => !/[?#]/.test(url)));
  assert.doesNotMatch(JSON.stringify(d), /token=abc|utm=1/);
});
