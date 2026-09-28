/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Projects in any space (store v2), multi-app environments, surface
// prominence, the production URL field and tab ↔ project linking.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  ContextsError, CONTEXT_STORE_VERSION, DEFAULT_CONTEXT_STORE, PRIMARY_SURFACE_KINDS, SURFACE_KINDS, draftToManifest, mainWebApp, matchProjectForUrl,
  migrateContextStore, parseManifest, projectsInContext, serializeManifest, surfaceProminence, switchEnvironment, validateContextStore,
  validateDetectionDraft, validateManifest, withProductionUrl,
} from '../src/index.mjs';
import { UUID_A, UUID_B, manifest } from './samples.mjs';

const UUID_C = '{cccccccc-dddd-4eee-8fff-000000000000}';
const expected = async name => JSON.parse(await readFile(new URL(`./expected/${name}.json`, import.meta.url), 'utf8'));
const throwsCode = (fn, code, path) => assert.throws(fn, e => e instanceof ContextsError && e.code === code && (path === undefined || e.path === path), `${code} ${path ?? ''}`);
const context = (uuid, over = {}) => ({ version: 1, workspace_uuid: uuid, type: 'personal', organization_uuid: null, project_id: null, engine_preference: null, updated_at: 1, ...over });
const project = (id, over = {}) => ({ version: 1, id, root: `/Volumes/Work/${id}`, manifest: manifest(), manifest_state: 'none', context_uuid: null, trusted: false, created_at: 1, updated_at: 2, ...over });

test('store v2: several projects in one space of any type; v1 stores still load', () => {
  assert.equal(CONTEXT_STORE_VERSION, 2);
  assert.equal(DEFAULT_CONTEXT_STORE.version, 2);
  const v2 = validateContextStore({ version: 2, contexts: [context(UUID_A), context(UUID_B, { type: 'organization' })],
    projects: [project('p_one1', { context_uuid: UUID_A }), project('p_two2', { context_uuid: UUID_A }), project('p_org3', { context_uuid: UUID_B })] });
  assert.deepEqual(projectsInContext(v2, UUID_A).map(p => p.id), ['p_one1', 'p_two2'], 'a personal space holds two projects');
  assert.deepEqual(projectsInContext(v2, UUID_B).map(p => p.id), ['p_org3']);
  assert.deepEqual(projectsInContext(v2, UUID_C), []);
  // The deprecated per-context mirror is accepted only when it agrees.
  assert.equal(validateContextStore({ ...v2, contexts: [context(UUID_A, { project_id: 'p_one1' })] }).contexts[0].project_id, 'p_one1');
  throwsCode(() => validateContextStore({ ...v2, contexts: [context(UUID_A, { project_id: 'p_org3' })] }), 'INVALID_CONTEXT_STORE', '$.contexts[0].project_id');
  throwsCode(() => validateContextStore({ ...v2, contexts: [context(UUID_A, { project_id: 'p_gone' })] }), 'INVALID_CONTEXT_STORE', '$.contexts[0].project_id');
  throwsCode(() => validateContextStore({ ...v2, version: 3 }), 'INVALID_CONTEXT_STORE', '$.version');
  // v1 (as written by existing profiles) keeps loading unchanged, including inconsistent links.
  const v1 = { version: 1, contexts: [context(UUID_A, { type: 'project', project_id: 'p_one1' })], projects: [project('p_one1')] };
  assert.equal(validateContextStore(v1).version, 1);
  assert.deepEqual(projectsInContext(v1, UUID_A).map(p => p.id), ['p_one1'], 'v1 links are honoured through the mirror');
});

test('migrateContextStore: v1 contexts[].project_id → projects[].context_uuid, pure and idempotent', () => {
  const v1 = {
    version: 1,
    contexts: [
      context(UUID_A, { type: 'project', project_id: 'p_one1', organization_uuid: UUID_C }),
      context(UUID_B, { type: 'personal', project_id: 'p_two2' }),
      context(UUID_C, { type: 'organization', project_id: 'p_miss' }),
    ],
    projects: [project('p_one1', { context_uuid: UUID_A }), project('p_two2'), project('p_free', { updated_at: 9 })],
  };
  const before = JSON.stringify(v1);
  const out = migrateContextStore(v1);
  assert.equal(JSON.stringify(v1), before, 'input untouched');
  assert.ok(Object.isFrozen(out) && Object.isFrozen(out.projects[0]));
  assert.equal(out.version, 2);
  assert.deepEqual(out.contexts.map(c => [c.workspace_uuid, c.type, c.project_id, c.organization_uuid]),
    [[UUID_A, 'project', null, UUID_C], [UUID_B, 'personal', null, null], [UUID_C, 'organization', null, null]]);
  assert.deepEqual(out.projects.map(p => [p.id, p.context_uuid, p.updated_at]), [['p_one1', UUID_A, 2], ['p_two2', UUID_B, 2], ['p_free', null, 9]]);
  assert.deepEqual(migrateContextStore(out), out, 'idempotent');
  // A project that already names a space keeps it; the stale context link is dropped.
  const conflict = migrateContextStore({ version: 1, contexts: [context(UUID_A, { type: 'project', project_id: 'p_one1' })], projects: [project('p_one1', { context_uuid: UUID_B })] });
  assert.deepEqual([conflict.projects[0].context_uuid, conflict.contexts[0].project_id], [UUID_B, null]);
  assert.deepEqual(migrateContextStore({ version: 1, contexts: [], projects: [] }), DEFAULT_CONTEXT_STORE);
  throwsCode(() => migrateContextStore({ version: 1, contexts: 'x', projects: [] }), 'INVALID_CONTEXT_STORE');
  throwsCode(() => migrateContextStore(null), 'INVALID_CONTEXT_STORE');
});

test('surface prominence: defaults by kind, explicit values, old manifests unchanged', () => {
  assert.deepEqual(PRIMARY_SURFACE_KINDS, ['repository', 'package', 'store']);
  const defaults = Object.fromEntries(SURFACE_KINDS.map(kind => [kind, surfaceProminence({ kind })]));
  assert.deepEqual(Object.entries(defaults).filter(([, p]) => p === 'primary').map(([k]) => k), ['repository', 'package', 'store']);
  for (const kind of ['issues', 'ci', 'releases', 'hosting', 'dashboard', 'analytics']) assert.equal(defaults[kind], 'secondary', kind);
  assert.equal(surfaceProminence({ kind: 'ci', prominence: 'primary' }), 'primary');
  assert.equal(surfaceProminence({ kind: 'repository', prominence: 'bogus' }), 'primary');
  assert.equal(surfaceProminence(null), 'secondary');
  const old = validateManifest(manifest());
  assert.equal(old.version, 1);
  assert.equal(old.surfaces[0].prominence, undefined, 'v1 records round-trip without new keys');
  throwsCode(() => validateManifest(manifest({ surfaces: [{ name: 'CI', url: 'https://ci.example/', kind: 'ci', prominence: 'primary' }] })), 'INVALID_MANIFEST', '$.surfaces[0].prominence');
  const v2 = validateManifest(manifest({ version: 2, surfaces: [{ name: 'CI', url: 'https://ci.example/', kind: 'ci', prominence: 'primary' }] }));
  assert.equal(v2.surfaces[0].prominence, 'primary');
  throwsCode(() => validateManifest(manifest({ version: 2, surfaces: [{ name: 'CI', url: 'https://ci.example/', kind: 'ci', prominence: 'loud' }] })), 'INVALID_MANIFEST');
});

test('manifest v2: app-scoped environments, unique per (app, name), written as v1 when possible', () => {
  const m = validateManifest(manifest({ version: 2, environments: [
    { name: 'local', app: 'web', base_url: 'http://localhost:5173' }, { name: 'local', app: 'desktop', base_url: 'http://localhost:1420' },
    { name: 'production', app: 'web', base_url: 'https://app.example.com' }, { name: 'production', base_url: 'https://example.com' },
  ] }));
  assert.deepEqual(m.environments.map(e => [e.app ?? null, e.name]), [['web', 'local'], ['desktop', 'local'], ['web', 'production'], [null, 'production']]);
  throwsCode(() => validateManifest(manifest({ version: 2, environments: [{ name: 'local', app: 'web', base_url: 'http://a.com' }, { name: 'local', app: 'web', base_url: 'http://b.com' }] })), 'INVALID_MANIFEST', '$.environments[1]');
  throwsCode(() => validateManifest(manifest({ environments: [{ name: 'local', app: 'web', base_url: 'http://a.com' }] })), 'INVALID_MANIFEST', '$.environments[0].app');
  for (const app of ['', 'Web', 'a b', '-x', 'x'.repeat(41), 7]) throwsCode(() => validateManifest(manifest({ version: 2, environments: [{ name: 'local', app, base_url: 'http://a.com' }] })), 'INVALID_MANIFEST');
  throwsCode(() => validateManifest(manifest({ version: 3 })), 'INVALID_MANIFEST', '$.version');
  const text = serializeManifest(m);
  assert.match(text, /^\{\n {2}"version": 2,/);
  assert.deepEqual(Object.keys(JSON.parse(text).environments[0]), ['name', 'app', 'base_url']);
  assert.equal(serializeManifest(parseManifest(text)), text);
  assert.match(serializeManifest(manifest()), /"version": 1,/, 'no v2 field → still version 1');
  assert.match(serializeManifest(manifest({ version: 2 })), /"version": 2,/, 'an explicit v2 file is never downgraded');
});

test('draftToManifest: multi-app drafts, secondary Vercel, the optional production URL', async () => {
  const draft = await expected('tauri-plus-web');
  const m = draftToManifest(draft);
  assert.equal(m.version, 2);
  assert.deepEqual(m.environments, [{ name: 'local', app: 'desktop', base_url: 'http://localhost:1420/' }, { name: 'local', app: 'web', base_url: 'http://localhost:5173/' }]);
  assert.deepEqual(m.services.map(s => s.app), ['desktop', 'web']);
  assert.ok(m.surfaces.every(s => s.prominence === undefined), 'default prominence is not written');
  assert.equal(mainWebApp(m), 'web');
  const prod = draftToManifest(draft, { production_url: ' https://app.example.com/ ' });
  assert.deepEqual(prod.environments.at(-1), { name: 'production', app: 'web', base_url: 'https://app.example.com/' });
  const byApp = draftToManifest(draft, { production_url: { web: 'https://www.example.com', desktop: '' } });
  assert.deepEqual(byApp.environments.filter(e => e.name === 'production'), [{ name: 'production', app: 'web', base_url: 'https://www.example.com/' }]);
  assert.equal(draftToManifest(draft, { production_url: null }).environments.length, 2);
  // Single-app projects: the production URL is project-wide and the manifest stays v1.
  const single = draftToManifest(await expected('next-app'), { production_url: 'https://next.example.com/app/' });
  assert.equal(single.version, 1);
  assert.deepEqual(single.environments.at(-1), { name: 'production', base_url: 'https://next.example.com/app' });
  assert.ok(!single.environments.some(e => e.base_url.includes('vercel.com')), 'the Vercel dashboard is never a production URL');
  const replaced = withProductionUrl(single, 'https://other.example.com');
  assert.deepEqual(replaced.environments.filter(e => e.name === 'production').map(e => e.base_url), ['https://other.example.com/']);
  for (const bad of ['javascript:alert(1)', 'https://u:p@x.com', 'https://x.com/?token=1', 'https://x.com/#a', 'not a url']) {
    throwsCode(() => draftToManifest(draft, { production_url: bad }), 'INVALID_INPUT', '$.production_url');
  }
  throwsCode(() => draftToManifest(draft, { production_url: 42 }), 'INVALID_INPUT', '$.edits.production_url');
  // An edited surface keeps an explicit non-default prominence (→ v2), drops a default one.
  const edited = draftToManifest(await expected('vite-app'), { surfaces: [
    { name: 'CI', url: 'https://ci.example/', kind: 'ci', prominence: 'primary' }, { name: 'Repo', url: 'https://git.example/r', kind: 'repository', prominence: 'primary' }] });
  assert.deepEqual([edited.version, edited.surfaces[0].prominence, edited.surfaces[1].prominence], [2, 'primary', undefined]);
  assert.equal(draftToManifest(await expected('vite-app')).version, 1, 'single-app drafts still confirm to v1 manifests');
});

test('detection drafts: optional app and prominence, unique per (app, name)', () => {
  const base = { version: 1, name: 'x', kind: 'web', kind_source: { source: 'default', guess: true }, services: [], surfaces: [], frameworks: [], files_read: [], refused: [], warnings: [] };
  const env = (app, port) => ({ name: 'local', ...(app ? { app } : {}), base_url: `http://localhost:${port}/`, source: 's', guess: false });
  assert.equal(validateDetectionDraft({ ...base, environments: [env('web', 1), env('desktop', 2), env(null, 3)] }).environments.length, 3);
  throwsCode(() => validateDetectionDraft({ ...base, environments: [env('web', 1), env('web', 2)] }), 'INVALID_DRAFT', '$.environments[1]');
  throwsCode(() => validateDetectionDraft({ ...base, environments: [env('Web!', 1)] }), 'INVALID_DRAFT', '$.environments[0].app');
  throwsCode(() => validateDetectionDraft({ ...base, environments: [], surfaces: [{ name: 's', url: 'https://x.com/', kind: 'ci', prominence: 'hidden', source: 's', guess: false }] }), 'INVALID_DRAFT');
});

test('switchEnvironment respects the app of the current environment', () => {
  const envs = [
    { name: 'local', app: 'web', base_url: 'http://localhost:5173/' }, { name: 'local', app: 'desktop', base_url: 'http://localhost:1420/' },
    { name: 'production', app: 'web', base_url: 'https://app.example.com/' }, { name: 'production', app: 'admin', base_url: 'https://admin.example.com/' },
    { name: 'local', app: 'admin', base_url: 'http://localhost:3001/' }, { name: 'preview', base_url: 'https://preview.example.com/' },
  ];
  assert.equal(switchEnvironment(envs, 'http://localhost:5173/users/7?tab=a#top', 'production'), 'https://app.example.com/users/7?tab=a#top');
  assert.equal(switchEnvironment(envs, 'http://localhost:3001/x', 'production'), 'https://admin.example.com/x');
  assert.equal(switchEnvironment(envs, 'https://admin.example.com/x', 'local'), 'http://localhost:3001/x');
  assert.equal(switchEnvironment(envs, 'http://localhost:1420/', 'production'), null, 'no implicit jump to another app');
  assert.equal(switchEnvironment(envs, 'http://localhost:1420/a', 'local', { app: 'web' }), 'http://localhost:5173/a', 'explicit app');
  assert.equal(switchEnvironment(envs, 'http://localhost:5173/p', 'preview'), 'https://preview.example.com/p', 'falls back to a project-wide environment');
  assert.equal(switchEnvironment(envs, 'http://localhost:5173/p', 'preview', { app: 'web' }), null);
});

test('matchProjectForUrl: origin match with loopback aliases, path prefixes, context preference', () => {
  const projects = [
    { id: 'p_one1', context_uuid: UUID_A, manifest: validateManifest(manifest({ version: 2, environments: [
      { name: 'local', app: 'web', base_url: 'http://localhost:5173' }, { name: 'local', app: 'desktop', base_url: 'http://localhost:1420' },
      { name: 'production', app: 'web', base_url: 'https://app.example.com' }] })) },
    { id: 'p_two2', context_uuid: null, manifest: validateManifest(manifest({ environments: [
      { name: 'local', base_url: 'http://127.0.0.1:3000' }, { name: 'production', base_url: 'https://example.org/docs' }] })) },
  ];
  const m = url => { const r = matchProjectForUrl(projects, url); return r && [r.project_id, r.environment.name, r.app, r.ambiguous]; };
  assert.deepEqual(m('http://localhost:5173/settings?x=1#y'), ['p_one1', 'local', 'web', false]);
  assert.deepEqual(m('http://127.0.0.1:5173/'), ['p_one1', 'local', 'web', false], 'loopback alias');
  assert.deepEqual(m('http://[::1]:1420/'), ['p_one1', 'local', 'desktop', false]);
  assert.deepEqual(m('http://localhost:3000/a'), ['p_two2', 'local', null, false]);
  assert.deepEqual(m('https://APP.example.com:443/x'), ['p_one1', 'production', 'web', false]);
  assert.deepEqual(m('https://example.org/docs/intro'), ['p_two2', 'production', null, false]);
  for (const miss of ['https://example.org/other', 'https://example.org/docsx', 'http://0.0.0.0:5173/', 'https://localhost:5173/', 'http://localhost:5174/',
    'http://localhost.evil.com:5173/', 'about:blank', 'javascript:alert(1)', '', null, 42]) assert.equal(m(miss), null, String(miss));
  assert.equal(matchProjectForUrl(null, 'http://localhost:5173/'), null);
  assert.equal(matchProjectForUrl([null, { id: 'p_bad1', manifest: { environments: [{ name: 'local', base_url: 'javascript:1' }] } }], 'http://localhost:5173/'), null);
  // Two projects on the same dev port: the first wins but is flagged; the active space's project wins outright.
  const clash = [...projects, { id: 'p_thr3', context_uuid: UUID_B, environments: [{ name: 'local', base_url: 'http://localhost:5173/' }] }];
  assert.deepEqual((({ project_id, ambiguous }) => [project_id, ambiguous])(matchProjectForUrl(clash, 'http://localhost:5173/')), ['p_one1', true]);
  assert.deepEqual((({ project_id, ambiguous }) => [project_id, ambiguous])(matchProjectForUrl(clash, 'http://localhost:5173/', { contextUuid: UUID_B })), ['p_thr3', false]);
  // An exact host beats a loopback alias.
  const exact = [...projects, { id: 'p_fou4', environments: [{ name: 'local', base_url: 'http://127.0.0.1:5173/' }] }];
  assert.equal(matchProjectForUrl(exact, 'http://127.0.0.1:5173/').project_id, 'p_fou4');
  // The longest path prefix wins across projects.
  const nested = [{ id: 'p_root', environments: [{ name: 'production', base_url: 'https://x.com/' }] }, { id: 'p_beta', environments: [{ name: 'preview', base_url: 'https://x.com/beta' }] }];
  assert.equal(matchProjectForUrl(nested, 'https://x.com/beta/page').project_id, 'p_beta');
  assert.equal(matchProjectForUrl(nested, 'https://x.com/betamax').project_id, 'p_root');
  assert.ok(Object.isFrozen(matchProjectForUrl(nested, 'https://x.com/')));
});
