/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Detection v2 (workstation-v1 §1): convex.json, the inventory phase (names
// and presence only), documented domains, and the draft's integrations,
// platforms, domains and agents. Fixtures harbor-suite and inkline are
// synthetic, invented monorepos shaped like the reference projects.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  ContextsError, DETECTION_FILES, INTEGRATIONS, INTEGRATION_IDS, MAX_INVENTORY_CHECK, MAX_INVENTORY_LIST, PACKAGE_DETECTION_FILES, PLATFORM_KINDS,
  VENDOR_HOST_SUFFIXES, detectProject, documentFiles, documentRefusal, documentedHosts, integrationForPackage, inventoryPlan, inventoryRefusal,
  isAllowedPackagePath, isDocumentPath, isInventoryCheckPath, isInventoryListPath, isProductHost, validateDetectionDraft,
} from '../src/index.mjs';
import { detectFixture, materializeFixture } from './fixture-reader.mjs';

const expected = async name => JSON.parse(await readFile(new URL(`./expected/${name}.json`, import.meta.url), 'utf8'));
const throwsCode = (fn, code, path) => assert.throws(fn, e => e instanceof ContextsError && e.code === code && (path === undefined || e.path === path), `${code} ${path ?? ''}`);
const detect = (extra = {}) => detectProject({ rootName: 'fixture', files: {}, ...extra });
const json = v => JSON.stringify(v);

// Traps a reader must never open, list or follow: .env files everywhere,
// AGENTS.md-style files, a root `ios` and `.codex` symlinked out of the root,
// and (inkline) docs/domains.md symlinked to .env.
async function plantTraps(fx, name) {
  const root = fx.root;
  const outside = join(fx.base, 'outside');
  await mkdir(join(outside, 'Evil.xcodeproj'), { recursive: true });
  await writeFile(join(outside, 'domains.md'), 'TRAP never-read `evil.example-trap.com`\n');
  await symlink(outside, join(root, 'ios'));
  for (const rel of ['apps/customer-web/.env.local', 'apps/web/.env.local', 'docs/.env', 'docs/production/.env.production', '.agent-worktrees/wt-a/.env', '.claude/.env']) {
    try { await writeFile(join(root, ...rel.split('/')), 'TRAP_ENV_SECRET=never-read-nested-env\n'); } catch { /* dir absent in this fixture */ }
  }
  if (name === 'harbor-suite') await symlink(outside, join(root, '.codex'));
  if (name === 'inkline') await symlink('../.env', join(root, 'docs', 'domains.md'));
}

for (const name of ['harbor-suite', 'inkline']) {
  test(`fixture ${name}: expected v2 draft; reads, listings and lstats stay inside the plan; traps untouched`, async () => {
    const fx = await materializeFixture(name);
    try {
      await plantTraps(fx, name);
      const { draft, ws, inv, doc, opened } = await detectFixture(fx.root, name);
      assert.deepEqual(draft, validateDetectionDraft(draft));
      // Every opened file is allowlisted: root files, package files or documented-domains files.
      for (const path of opened) {
        const f = PACKAGE_DETECTION_FILES.find(x => path.endsWith(`/${x}`));
        assert.ok(DETECTION_FILES.includes(path) || (f && isAllowedPackagePath(path.slice(0, -f.length - 1), f)) || doc.paths.includes(path), path);
      }
      assert.ok(!opened.some(p => /(^|\/)\.env|AGENTS|CLAUDE|\.claude|\.codex|agent-worktrees|xcodeproj|gradle|schema\.ts|README|overview|outside/.test(p)), json(opened));
      // The inventory reader touched only planned paths and reported only planned paths.
      const planned = new Set([...inv.plan.list, ...inv.plan.check]);
      for (const p of inv.touched) assert.ok(planned.has(p), `touched outside the plan: ${p}`);
      assert.deepEqual(Object.keys(inv.inventory.listing).filter(p => !inv.plan.list.includes(p)), []);
      assert.deepEqual(Object.keys(inv.inventory.present).filter(p => !inv.plan.check.includes(p)), []);
      assert.ok(inv.plan.list.length <= MAX_INVENTORY_LIST && inv.plan.check.length <= MAX_INVENTORY_CHECK);
      assert.ok(ws.dirs.every(d => inv.plan.list.includes(d)), 'every package dir is listed');
      for (const p of doc.touched) assert.ok(doc.paths.includes(p), p);
      // Symlinks out of the root are absent, never followed.
      assert.equal(inv.inventory.listing.ios, undefined, 'root ios -> outside is not listed');
      if (name === 'harbor-suite') assert.equal(inv.inventory.present['.codex'], undefined, '.codex -> outside is absent');
      assert.ok(!draft.platforms.some(p => p.name === 'Evil'));
      if (name === 'inkline') assert.deepEqual(draft.refused, [{ path: 'docs/domains.md', reason: 'not_allowlisted' }], 'docs/domains.md -> .env is refused before opening');
      else assert.deepEqual(draft.refused, []);
      assert.deepEqual(JSON.parse(json({ ...draft, refused: [] })), await expected(name));
      assert.doesNotMatch(json(draft), /TRAP|never-read|667[0-9]|evil|wt-a|wt-b|fix-billing/i);
    } finally { await fx.cleanup(); }
  });
}

test('harbor-suite: Convex, Clerk, Vercel and Sentry; Tauri, macOS, iOS and Android; vercel.json domains; agent presence', async () => {
  const d = await expected('harbor-suite');
  assert.equal(d.version, 3);
  assert.deepEqual(d.integrations.map(i => i.id), ['vercel', 'convex', 'clerk', 'sentry'], 'INTEGRATIONS order');
  assert.deepEqual(d.integrations.find(i => i.id === 'convex').sources.slice(0, 1), ['package.json#dependencies']);
  assert.ok(d.integrations.find(i => i.id === 'convex').sources.includes('convex/'), 'the convex directory is evidence');
  assert.ok(d.integrations.find(i => i.id === 'convex').sources.includes('packages/shared-convex/convex/'));
  assert.deepEqual(d.platforms.map(p => [p.kind, p.name, p.path]), [
    ['tauri', 'Harbor Suite', 'src-tauri'], ['macos', 'HarborMac', 'apps/macos-app'], ['ios', 'HarborMobile', 'apps/mobile-app/ios'],
    ['android', 'mobile-app', 'apps/mobile-app/android']]);
  assert.deepEqual(d.domains.map(x => [x.host, x.origin]), [['harborsuite.app', 'vercel_json'], ['www.harborsuite.app', 'vercel_json'],
    ['docs.harborsuite.app', 'vercel_json'], ['api.harborsuite.app', 'vercel_json']]);
  assert.ok(d.domains.every(x => x.confirmed === false));
  assert.doesNotMatch(json(d.domains), /vercel\.app|convex\.site|\(\?<sub>/, 'vendor hosts and host regexes are excluded');
  assert.deepEqual(d.agents, { files: ['AGENTS.md', 'CLAUDE.md'], dirs: ['.claude', '.agent-worktrees'], worktrees: 2 });
  assert.ok(!d.files_read.some(f => f.includes('convex.json')), 'no convex.json in this fixture');
});

test('inkline: Convex, Stripe, Vercel; native apps; documented domains unconfirmed after explicit ones', async () => {
  const d = await expected('inkline');
  assert.deepEqual(d.integrations.map(i => i.id), ['vercel', 'convex', 'stripe']);
  assert.ok(d.integrations.find(i => i.id === 'convex').sources.includes('convex.json#functions'));
  assert.ok(d.integrations.find(i => i.id === 'vercel').sources.includes('package.json#dependencies'), '@vercel/functions');
  assert.deepEqual(d.platforms.map(p => [p.kind, p.name, p.path]), [
    ['macos', 'InklineDesktop', 'apps/macos'], ['ios', 'InklineIOS', 'apps/ios'], ['android', 'android', 'apps/android']]);
  const hosts = d.domains.map(x => [x.host, x.origin, x.source]);
  assert.deepEqual(hosts.slice(0, 3), [['www.inkline.studio', 'vercel_json', 'vercel.json redirects[].has'], ['inkline.studio', 'vercel_json', 'vercel.json redirects[].destination'],
    ['api.inkline.studio', 'vercel_json', 'vercel.json rewrites[].destination']], 'explicit configuration first; api. stays explicit although docs list it too');
  assert.deepEqual(hosts.slice(3).map(([h, o]) => [h, o]), [['preview.inkline.studio', 'docs'], ['app.inkline.studio', 'docs'], ['docs.inkline.studio', 'docs'],
    ['dashboard.inkline.studio', 'docs'], ['realtime.inkline.studio', 'docs']]);
  assert.ok(d.domains.every(x => x.confirmed === false), 'never confirmed in a draft');
  assert.doesNotMatch(json(d.domains.map(x => x.host)), /localhost|127\.0\.0\.1|10\.0\.0\.12|convex\.(cloud|site|dev)|vercel\.(app|json)|stripe\.com|\*/);
  assert.deepEqual(d.agents, { files: ['AGENTS.md'], dirs: ['.claude', '.codex', '.agent-worktrees'], worktrees: 1 });
  assert.ok(d.files_read.includes('convex.json') && d.files_read.includes('docs/production/domains.md') && d.files_read.includes('docs/development/domains.md'));
  assert.ok(!d.files_read.some(f => /README|overview|architecture/.test(f)), 'only domains.md files are read');
});

test('convex.json joins the root allowlist only, parsed for functions only', () => {
  assert.ok(DETECTION_FILES.includes('convex.json'));
  assert.ok(!PACKAGE_DETECTION_FILES.includes('convex.json'));
  const d = detect({ files: { 'convex.json': JSON.stringify({ functions: 'src/convex/', authInfo: [{ domain: 'https://secret.example-auth.com' }], node: { externalPackages: ['x'] } }) } });
  assert.deepEqual(d.integrations, [{ id: 'convex', name: 'Convex', dashboard_url: 'https://dashboard.convex.dev/', sources: ['convex.json#functions'] }]);
  assert.doesNotMatch(json(d), /secret|externalPackages/);
  assert.deepEqual(detect({ files: { 'convex.json': '{ not json' } }).integrations[0].sources, ['convex.json']);
  assert.deepEqual(detect({ files: { 'convex.json': JSON.stringify({ functions: '../../etc' }) } }).integrations[0].sources, ['convex.json']);
});

test('inventoryPlan: fixed entries, per package dir, caps, invalid dirs dropped', () => {
  const base = inventoryPlan();
  assert.deepEqual(base.list, ['docs', '.agent-worktrees', 'ios', 'macos']);
  assert.deepEqual(base.check, ['AGENTS.md', 'CLAUDE.md', '.claude', '.codex', '.agent-worktrees', 'convex', 'convex/schema.ts', 'convex/http.ts',
    'android', 'build.gradle', 'build.gradle.kts', 'android/build.gradle', 'android/build.gradle.kts',
    'dev', 'bin/dev', 'script/dev', 'scripts/dev', 'script/server', 'dev.sh', 'start.sh', 'run.sh', 'scripts/dev.sh',
    'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb', 'bun.lock', 'package-lock.json']);
  assert.ok(Object.isFrozen(base) && Object.isFrozen(base.list));
  const p = inventoryPlan({ packageDirs: ['apps/web', 'apps/web', '../x', '.hidden', 'node_modules/a', '/abs', 7, 'apps/ios'] });
  assert.deepEqual(p.list.slice(4), ['apps/web', 'apps/web/ios', 'apps/web/macos', 'apps/ios', 'apps/ios/ios', 'apps/ios/macos']);
  assert.deepEqual(p.check.slice(27, 32), ['apps/web/convex', 'apps/web/build.gradle', 'apps/web/build.gradle.kts', 'apps/web/android/build.gradle', 'apps/web/android/build.gradle.kts']);
  const many = inventoryPlan({ packageDirs: Array.from({ length: 40 }, (_, i) => `packages/p${i}`) });
  assert.equal(many.list.length, MAX_INVENTORY_LIST);
  assert.equal(many.check.length, 27 + 24 * 5, 'at most 24 package dirs');
  assert.ok(many.check.length <= MAX_INVENTORY_CHECK);
  throwsCode(() => inventoryPlan({ packageDirs: 'apps/*' }), 'INVALID_INPUT', '$.packageDirs');
  for (const ok of ['docs', 'apps/web', 'apps/web/ios', 'macos']) assert.ok(isInventoryListPath(ok), ok);
  for (const bad of ['', '/docs', '../docs', 'docs/..', 'node_modules', '.git', '.agent-worktrees/x', 'apps/a/b/c/d/ios', null]) assert.ok(!isInventoryListPath(bad), String(bad));
  for (const ok of ['AGENTS.md', 'apps/web/convex', 'apps/x/android/build.gradle.kts']) assert.ok(isInventoryCheckPath(ok), ok);
  for (const bad of ['.env', 'apps/web/.env', 'convex/_generated/api.js', 'apps/web/package.json', '../AGENTS.md', 'apps/../convex', 'docs']) assert.ok(!isInventoryCheckPath(bad), bad);
});

test('inventoryRefusal and documentRefusal reader policies', () => {
  const plan = inventoryPlan({ packageDirs: ['apps/web'] });
  assert.equal(inventoryRefusal({ path: 'docs', resolvedPath: 'docs', kind: 'dir', plan }), null);
  assert.equal(inventoryRefusal({ path: 'CLAUDE.md', resolvedPath: 'AGENTS.md', kind: 'file', plan }), null, 'a symlink inside the root is fine');
  assert.equal(inventoryRefusal({ path: 'apps/other', resolvedPath: 'apps/other', kind: 'dir', plan }), 'not_allowlisted', 'not in this plan');
  assert.equal(inventoryRefusal({ path: 'apps/other', resolvedPath: 'apps/other', kind: 'dir' }), null, 'without a plan: the plan shape');
  assert.equal(inventoryRefusal({ path: '.env', resolvedPath: '.env', kind: 'file' }), 'not_allowlisted');
  for (const resolvedPath of [null, undefined, '', '/etc', '../x', 'a/../b']) assert.equal(inventoryRefusal({ path: 'ios', resolvedPath, kind: 'dir', plan }), 'symlink_outside_root', String(resolvedPath));
  assert.equal(inventoryRefusal({ path: 'android', resolvedPath: 'android', kind: 'other', plan }), 'not_regular_file');
  assert.equal(inventoryRefusal(), 'not_allowlisted');

  assert.deepEqual(documentFiles({ listing: { docs: ['production', '.hidden', '..', 'a/b', 'node_modules', 'development', 'production'] } }),
    ['docs/domains.md', 'docs/development/domains.md', 'docs/production/domains.md']);
  assert.deepEqual(documentFiles({ listing: {} }), [], 'no docs dir, nothing to read');
  assert.deepEqual(documentFiles(null), []);
  assert.equal(documentFiles({ listing: { docs: Array.from({ length: 20 }, (_, i) => `d${String(i).padStart(2, '0')}`) } }).length, 9, 'at most 8 children');
  for (const ok of ['docs/domains.md', 'docs/production/domains.md']) assert.ok(isDocumentPath(ok), ok);
  for (const bad of ['docs/a/b/domains.md', 'docs/.x/domains.md', 'docs/../domains.md', 'domains.md', 'docs/domains.MD', 'docs/x/README.md', 'docs/node_modules/domains.md']) assert.ok(!isDocumentPath(bad), bad);
  const ok = { path: 'docs/production/domains.md', resolvedPath: 'docs/production/domains.md', isFile: true, size: 10 };
  assert.equal(documentRefusal(ok), null);
  assert.equal(documentRefusal({ ...ok, path: 'docs/x/notes.md' }), 'not_allowlisted');
  assert.equal(documentRefusal({ ...ok, resolvedPath: '.env' }), 'not_allowlisted', 'domains.md -> .env');
  assert.equal(documentRefusal({ ...ok, resolvedPath: null }), 'symlink_outside_root');
  assert.equal(documentRefusal({ ...ok, isFile: false }), 'not_regular_file');
  assert.equal(documentRefusal({ ...ok, size: 262145 }), 'too_large');
});

test('inventory input: names re-validated, entries outside the plan ignored, bad shapes throw', () => {
  const d = detect({ inventory: {
    listing: { '.agent-worktrees': ['wt-a', 'wt-b', '.cache', '..', 'a/b', 'nul\u0000', '._wt-a', 'wt-a', 42], 'apps/web': ['Web.xcodeproj'],
      'node_modules/evil': ['Evil.xcodeproj'], '../outside': ['Out.xcodeproj'] },
    present: { 'AGENTS.md': 'file', 'CLAUDE.md': 'dir', '.claude': 'file', '.codex': 'dir', '.agent-worktrees': 'dir', '.env': 'file', 'apps/web/convex': 'symlink' },
  } });
  assert.deepEqual(d.agents, { files: ['AGENTS.md'], dirs: ['.codex', '.agent-worktrees'], worktrees: 2 }, 'kinds must match; hidden/odd names are not worktrees');
  assert.deepEqual(d.platforms.map(p => [p.kind, p.name, p.path]), [['macos', 'Web', 'apps/web']]);
  assert.match(d.warnings.join('\n'), /inventory: 4 entries outside the plan ignored/);
  assert.doesNotMatch(json(d), /Evil|Out\b|wt-a|\.env/);
  assert.deepEqual(detect({ inventory: { listing: { '.agent-worktrees': ['a'] }, present: {} } }).agents.worktrees, 0, 'worktrees need the dir to be present');
  throwsCode(() => detect({ inventory: [] }), 'INVALID_INPUT', '$.inventory');
  throwsCode(() => detect({ inventory: { listing: [] } }), 'INVALID_INPUT', '$.inventory.listing');
  throwsCode(() => detect({ inventory: { present: 'x' } }), 'INVALID_INPUT', '$.inventory.present');
  throwsCode(() => detect({ inventory: { listing: {}, extra: 1 } }), 'INVALID_INPUT', '$.inventory.extra');
  throwsCode(() => detect({ docs: 'x' }), 'INVALID_INPUT', '$.docs');
});

test('platforms: Xcode projects in listed dirs, Android Gradle presence, Tauri and Electron', () => {
  const plat = (inventory, extra = {}) => detect({ inventory, ...extra }).platforms.map(p => [p.kind, p.name, p.path, p.source]);
  assert.deepEqual(plat({ listing: {
    ios: ['App.xcworkspace', 'App.xcodeproj', 'Pods', 'notes.txt'], macos: ['Studio.xcodeproj'], 'apps/phone-app': ['Client.xcodeproj'],
    'apps/desktop': ['DeskMobile.xcodeproj', 'Desk.XCODEPROJ'], 'apps/tools': ['ToolsiOS.xcworkspace'], 'apps/mac/ios': ['Mac.xcodeproj'],
  } }), [
    ['macos', 'Desk', 'apps/desktop', 'apps/desktop/Desk.XCODEPROJ'],
    ['macos', 'Studio', 'macos', 'macos/Studio.xcodeproj'],
    ['ios', 'DeskMobile', 'apps/desktop', 'apps/desktop/DeskMobile.xcodeproj'],
    ['ios', 'Mac', 'apps/mac/ios', 'apps/mac/ios/Mac.xcodeproj'],
    ['ios', 'Client', 'apps/phone-app', 'apps/phone-app/Client.xcodeproj'],
    ['ios', 'ToolsiOS', 'apps/tools', 'apps/tools/ToolsiOS.xcworkspace'],
    ['ios', 'App', 'ios', 'ios/App.xcodeproj'],
  ]);
  assert.deepEqual(plat({ listing: { 'apps/android': [], 'apps/server': [] }, present: {
    'android/build.gradle': 'file', 'android/build.gradle.kts': 'file', 'apps/android/build.gradle.kts': 'file', 'apps/server/build.gradle': 'file',
    'apps/mobile/android/build.gradle': 'file', 'apps/android-tv/build.gradle': 'file', 'build.gradle': 'file', 'apps/x/android/build.gradle': 'dir',
  } }), [
    ['android', 'android', 'android', 'android/build.gradle'],
    ['android', 'android-tv', 'apps/android-tv', 'apps/android-tv/build.gradle'],
    ['android', 'android', 'apps/android', 'apps/android/build.gradle.kts'],
    ['android', 'mobile', 'apps/mobile/android', 'apps/mobile/android/build.gradle'],
  ], 'a non-android package and the root build.gradle are not Android apps');
  assert.deepEqual(plat({ present: { 'build.gradle.kts': 'file' } }, { rootName: 'acme-android' }), [['android', 'acme-android', '', 'build.gradle.kts']]);
  // Tauri (root, package) and Electron from the existing detection.
  const d = detect({
    files: { 'package.json': JSON.stringify({ name: 'x', devDependencies: { electron: '30' } }), 'tauri.conf.json': JSON.stringify({ build: { devUrl: 'http://localhost:1420' } }) },
    packages: { 'apps/desk': { files: { 'src-tauri/tauri.conf.json': JSON.stringify({ productName: 'Desk Pro' }) } } },
  });
  assert.deepEqual(d.platforms.map(p => [p.kind, p.name, p.path, p.source]), [
    ['tauri', 'Desktop', '', 'tauri.conf.json'], ['tauri', 'Desk Pro', 'apps/desk/src-tauri', 'apps/desk/src-tauri/tauri.conf.json'], ['electron', 'Desktop', '', 'package.json']]);
  assert.deepEqual(PLATFORM_KINDS, ['tauri', 'macos', 'ios', 'android', 'electron']);
});

test('domains: vercel.json, wrangler, netlify and docs; exclusions; dedupe; cap', () => {
  const files = {
    'vercel.json': JSON.stringify({
      redirects: [{ source: '/', has: [{ type: 'host', value: 'Shop.Acme-Corp.io' }, { type: 'header', key: 'x', value: 'hdr.acme-corp.io' }], destination: '/x' },
        { source: '/a', destination: 'https://user:pw@login.acme-corp.io:8443/a?token=1' }, { source: '/b', destination: 'mailto:x@acme-corp.io' }],
      rewrites: [{ source: '/c', destination: 'https://192.168.1.10/c' }, { source: '/d', destination: 'http://[::1]:3000/' }, { source: '/e', destination: 'https://*.acme-corp.io/' }],
    }),
    'wrangler.toml': 'name = "w"\nroute = "edge.acme-corp.io/*"\nroutes = [ { pattern = "api.acme-corp.io/*", zone_name = "acme-corp.io" }, { pattern = "cdn.acme-corp.io", custom_domain = true }, "*.acme-corp.io/*", "acme.workers.dev/*" ]\n[env.staging]\nroutes = [ "staging.acme-corp.io/*" ]\n',
    'netlify.toml': '[[redirects]]\nfrom = "https://old.acme-corp.io/*"\nto = "https://shop.acme-corp.io/:splat"\n[[redirects]]\nfrom = "/relative"\nto = "/x"\n',
  };
  const docs = {
    'docs/domains.md': '| `shop.acme-corp.io` | dup of an explicit host |\n| `status.acme-corp.io` | status |\n`acme.vercel.app` `x.convex.cloud` `x.convex.site` `x.clerk.accounts.dev` `x.netlify.app` `x.fly.dev` `x.workers.dev` `x.pages.dev` `github.com` `acme.github.io` `stripe.com` `example.com` `www.example.org` `a.example` `a.test` `a.invalid` `printer.local` `localhost` `intranet` `10.1.2.3` `*.acme-corp.io` `package.json` `next.config.mjs` `run dev`\nSee https://help.acme-corp.io/guide, and (https://blog.acme-corp.io).',
  };
  const d = detect({ files, docs, inventory: { listing: { docs: [] }, present: {} } });
  assert.deepEqual(d.domains.map(x => [x.host, x.origin, x.source]), [
    ['shop.acme-corp.io', 'vercel_json', 'vercel.json redirects[].has'],
    ['login.acme-corp.io', 'vercel_json', 'vercel.json redirects[].destination'],
    ['edge.acme-corp.io', 'wrangler', 'wrangler.toml routes'], ['api.acme-corp.io', 'wrangler', 'wrangler.toml routes'], ['cdn.acme-corp.io', 'wrangler', 'wrangler.toml routes'],
    ['staging.acme-corp.io', 'wrangler', 'wrangler.toml routes'],
    ['old.acme-corp.io', 'netlify', 'netlify.toml redirects[].from'],
    ['status.acme-corp.io', 'docs', 'docs/domains.md'], ['help.acme-corp.io', 'docs', 'docs/domains.md'], ['blog.acme-corp.io', 'docs', 'docs/domains.md'],
  ]);
  assert.ok(d.domains.every(x => x.confirmed === false));
  assert.deepEqual(d.files_read, ['vercel.json', 'netlify.toml', 'wrangler.toml', 'docs/domains.md']);
  assert.doesNotMatch(json(d), /user|pw@|token|hdr\./, 'userinfo, queries and non-host headers never reach the draft');
  // Fly: nothing beyond the app name (its fly.dev host is a vendor host).
  assert.deepEqual(detect({ files: { 'fly.toml': 'app = "acme-api"\n' } }).domains, []);
  // Cap at 32, with a warning.
  const many = Array.from({ length: 40 }, (_, i) => `\`h${i}.acme-corp.io\``).join(' ');
  const capped = detect({ docs: { 'docs/domains.md': many } });
  assert.equal(capped.domains.length, 32);
  assert.match(capped.warnings.join('\n'), /8 domain\(s\) beyond the limit of 32/);
  // Docs paths outside the shape are refused, never parsed.
  const bad = detect({ docs: { '.env': 'TRAP `trap.acme-corp.io`', 'docs/a/b/domains.md': '`deep.acme-corp.io`', 'docs/x/domains.md': 7 } });
  assert.deepEqual(bad.refused, [{ path: '.env', reason: 'not_allowlisted' }, { path: 'docs/a/b/domains.md', reason: 'not_allowlisted' }, { path: 'docs/x/domains.md', reason: 'unreadable' }]);
  assert.deepEqual(bad.domains, []);
});

test('documentedHosts and isProductHost', () => {
  assert.deepEqual(documentedHosts('`App.Acme-Corp.io` https://api.acme-corp.io/v1 `https://www.acme-corp.io` `app.acme-corp.io:443` `cdn.acme-corp.io/assets`'),
    ['app.acme-corp.io', 'api.acme-corp.io', 'www.acme-corp.io', 'cdn.acme-corp.io']);
  assert.deepEqual(documentedHosts(null), []);
  assert.deepEqual(documentedHosts('```\nhttps://code.acme-corp.io\n```'), ['code.acme-corp.io'], 'code blocks count as documentation');
  for (const s of VENDOR_HOST_SUFFIXES) assert.equal(isProductHost(`x.${s}`), false, s);
  for (const h of ['localhost', 'intranet', '127.0.0.1', '10.0.0.1', '*.acme.io', 'acme.123', '', null]) assert.equal(isProductHost(h), false, String(h));
  for (const h of ['acme.io', 'APP.Acme.io', 'xn--bcher-kva.de', 'a.b.studio']) assert.equal(isProductHost(h), true, h);
  // Hostile text never throws and stays linear.
  assert.ok(Array.isArray(documentedHosts('`'.repeat(100000) + 'https://'.repeat(20000))));
});

test('integrations: dependency names and config presence only, never keys or env names', () => {
  assert.deepEqual(INTEGRATIONS.map(i => i.id), INTEGRATION_IDS, 'the table follows the display order');
  for (const i of INTEGRATIONS) assert.match(i.dashboard_url, /^https:\/\/[a-z.]+\/[a-z]*$/, `${i.id} dashboard is generic`);
  const cases = [['convex', 'convex'], ['@convex-dev/auth', 'convex'], ['@clerk/clerk-react', 'clerk'], ['@clerk/', null], ['clerk', null], ['stripe', 'stripe'],
    ['@stripe/stripe-js', 'stripe'], ['stripe-mock', null], ['@supabase/supabase-js', 'supabase'], ['firebase', 'firebase'], ['@sentry/node', 'sentry'],
    ['@vercel/functions', 'vercel'], ['@vercelx/x', null], ['wrangler', 'cloudflare'], ['@netlify/functions', 'netlify'], ['convex-helpers', null], [null, null]];
  for (const [name, id] of cases) assert.equal(integrationForPackage(name), id, String(name));
  const d = detect({ files: {
    'package.json': JSON.stringify({ name: 'x', dependencies: { stripe: '1' }, devDependencies: { '@sentry/cli': '1' }, scripts: { dev: 'STRIPE_SECRET_KEY=sk_live_x vite' },
      env: { CLERK_SECRET_KEY: 'x', NEXT_PUBLIC_SUPABASE_URL: 'x' }, keywords: ['firebase', 'convex'] }),
    'wrangler.json': '{"name":"w"}', 'netlify.toml': '', 'fly.toml': 'app = "a"\n', '.vercel/project.json': '{"projectId":"prj_1"}',
  } });
  assert.deepEqual(d.integrations.map(i => [i.id, i.sources]), [['vercel', ['.vercel/project.json']], ['stripe', ['package.json#dependencies']],
    ['cloudflare', ['wrangler.json']], ['netlify', ['netlify.toml']], ['fly', ['fly.toml']], ['sentry', ['package.json#devDependencies']]]);
  assert.doesNotMatch(json(d.integrations), /SECRET|sk_live|prj_1/);
  // At most 8 sources per integration.
  const packages = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`packages/p${i}`, { files: { 'package.json': JSON.stringify({ name: `p${i}`, dependencies: { convex: '1' } }) } }]));
  assert.equal(detect({ packages }).integrations[0].sources.length, 8);
});

test('without inventory or docs: version 3 with empty agents; drafts v1 and v2 still validate; validation is strict', () => {
  const d = detect({ files: { 'package.json': JSON.stringify({ name: 'plain', scripts: { dev: 'vite' } }) } });
  assert.equal(d.version, 3);
  assert.deepEqual([d.integrations, d.platforms, d.domains, d.agents, d.icon], [[], [], [], { files: [], dirs: [], worktrees: 0 }, null]);
  assert.equal(d.services[0].command, 'npm run dev');
  const { integrations: _i, platforms: _p, domains: _d, agents: _a, icon: _icon, ...withCommands } = d;
  const v1 = { ...withCommands, services: d.services.map(({ command: _c, ...s }) => s) };
  throwsCode(() => validateDetectionDraft({ ...d, version: 2 }), 'INVALID_DRAFT', '$.icon');
  throwsCode(() => validateDetectionDraft({ ...withCommands, version: 1 }), 'INVALID_DRAFT', '$.services[0].command');
  assert.equal(validateDetectionDraft({ ...v1, integrations: [], platforms: [], domains: [], agents: d.agents, version: 2 }).version, 2, 'version 2 drafts keep validating');
  assert.equal(validateDetectionDraft({ ...v1, version: 1 }).version, 1, 'version 1 drafts keep validating');
  throwsCode(() => validateDetectionDraft({ ...v1, version: 1, agents: d.agents }), 'INVALID_DRAFT', '$.agents');
  throwsCode(() => validateDetectionDraft({ ...v1, version: 2 }), 'INVALID_DRAFT', '$.integrations');
  throwsCode(() => validateDetectionDraft({ ...d, version: 4 }), 'INVALID_DRAFT');
  const dom = { host: 'app.acme.io', origin: 'docs', source: 'docs/domains.md', confirmed: false };
  assert.equal(validateDetectionDraft({ ...d, domains: [dom] }).domains[0].host, 'app.acme.io');
  throwsCode(() => validateDetectionDraft({ ...d, domains: [{ ...dom, confirmed: true }] }), 'INVALID_DRAFT', '$.domains[0].confirmed');
  throwsCode(() => validateDetectionDraft({ ...d, domains: [dom, dom] }), 'INVALID_DRAFT', '$.domains[1]');
  throwsCode(() => validateDetectionDraft({ ...d, domains: [{ ...dom, host: '*.acme.io' }] }), 'INVALID_DRAFT', '$.domains[0].host');
  throwsCode(() => validateDetectionDraft({ ...d, domains: [{ ...dom, origin: 'dns' }] }), 'INVALID_DRAFT', '$.domains[0].origin');
  const plat = { kind: 'ios', name: 'App', path: 'apps/ios', source: 'apps/ios/App.xcodeproj' };
  for (const path of ['/abs', '../x', 'a//b', 'a/./b', 'a\\b']) throwsCode(() => validateDetectionDraft({ ...d, platforms: [{ ...plat, path }] }), 'INVALID_DRAFT', '$.platforms[0].path');
  throwsCode(() => validateDetectionDraft({ ...d, platforms: [{ ...plat, kind: 'watchos' }] }), 'INVALID_DRAFT', '$.platforms[0].kind');
  throwsCode(() => validateDetectionDraft({ ...d, platforms: [{ ...plat, name: 'x'.repeat(65) }] }), 'INVALID_DRAFT', '$.platforms[0].name');
  const integ = { id: 'convex', name: 'Convex', dashboard_url: 'https://dashboard.convex.dev/', sources: ['convex/'] };
  throwsCode(() => validateDetectionDraft({ ...d, integrations: [{ ...integ, sources: [] }] }), 'INVALID_DRAFT', '$.integrations[0].sources');
  throwsCode(() => validateDetectionDraft({ ...d, integrations: [{ ...integ, id: 'heroku' }] }), 'INVALID_DRAFT', '$.integrations[0].id');
  throwsCode(() => validateDetectionDraft({ ...d, integrations: [integ, integ] }), 'INVALID_DRAFT', '$.integrations[1]');
  throwsCode(() => validateDetectionDraft({ ...d, integrations: [{ ...integ, dashboard_url: 'https://x.io/?k=1' }] }), 'INVALID_DRAFT');
  throwsCode(() => validateDetectionDraft({ ...d, agents: { files: ['README.md'], dirs: [], worktrees: 0 } }), 'INVALID_DRAFT', '$.agents.files[0]');
  throwsCode(() => validateDetectionDraft({ ...d, agents: { files: [], dirs: [], worktrees: 2 } }), 'INVALID_DRAFT', '$.agents.worktrees');
  throwsCode(() => validateDetectionDraft({ ...d, agents: { files: [], dirs: [], worktrees: 0, names: [] } }), 'INVALID_DRAFT', '$.agents.names');
});

test('hostile inventory and docs never throw and always yield a valid draft', () => {
  const junk = ['', '.', '..', '/', '\u0000', 'a'.repeat(300), '__proto__', 'constructor', 'x.xcodeproj', '.xcodeproj', ' .xcodeproj', '‮.xcodeproj'];
  for (const listing of [{ ios: junk }, { macos: Array(5000).fill('A.xcodeproj') }, Object.fromEntries(Array.from({ length: 2000 }, (_, i) => [`apps/a${i}`, ['X.xcodeproj']]))]) {
    const d = detect({ inventory: { listing, present: {} } });
    assert.deepEqual(d, validateDetectionDraft(d));
    assert.ok(d.platforms.length <= 16);
  }
  const d = detect({ docs: { 'docs/domains.md': '`' + 'a.'.repeat(200) + 'io`' + ' https://'.repeat(1000) + '\u0000'.repeat(10) } });
  assert.deepEqual(d, validateDetectionDraft(d));
  const parsed = JSON.parse('{"listing":{"__proto__":["X.xcodeproj"]},"present":{"__proto__":"dir"}}');
  assert.deepEqual(detect({ inventory: parsed }).platforms, []);
});
