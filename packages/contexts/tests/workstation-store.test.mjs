/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Project record v2 and context store v3 (workstation-v1 §2), the stored
// brief (understand-v1 §4) and contracts/context-v2.schema.json.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  ContextsError, CONTEXT_STORE_VERSION, DEFAULT_CONTEXT_STORE, DEFAULT_SHARED_SITES, MAX_USER_CONTEXT_ID, INTEGRATION_IDS, PLATFORM_KINDS, DOMAIN_ORIGINS,
  migrateContextStore, projectsInContext, upgradeProject, validateBriefRecord, validateContextStore, validateProject, validateDetectionDraft,
  validateManifest, validateSetupDocument,
} from '../src/index.mjs';
import { UUID_A, UUID_B, manifest } from './samples.mjs';

const throwsCode = (fn, code, path) => assert.throws(fn, e => e instanceof ContextsError && e.code === code && (path === undefined || e.path === path), `${code} ${path ?? ''}`);
const context = (uuid, over = {}) => ({ version: 1, workspace_uuid: uuid, type: 'personal', organization_uuid: null, project_id: null, engine_preference: null, updated_at: 1, ...over });
const v1 = (id, over = {}) => ({ version: 1, id, root: `/Volumes/Work/${id}`, manifest: manifest(), manifest_state: 'none', context_uuid: null, trusted: false, created_at: 1, updated_at: 2, ...over });
const brief = (over = {}) => ({
  version: 1, cli: 'claude-code', generated_at: 1790000000000, accepted: false,
  document: {
    version: 1, product: '  A drawing studio with web, desktop and mobile apps.  ',
    apps: [{ name: 'Web', kind: 'web', path: 'apps/web', summary: 'Customer app' }, { name: 'Root', kind: 'other', path: null, summary: '' }],
    domains: [{ host: 'app.acme-corp.io', purpose: 'Customer app' }], services: [{ name: 'Convex', purpose: 'Backend' }],
    start: [{ label: 'Web', command: 'bun run dev', cwd: 'apps/web' }], risks: ['Two apps share port 5173\nin development'],
  },
  ...over,
});
const detected = (over = {}) => ({
  at: 1790000000000,
  integrations: [{ id: 'convex', name: 'Convex', dashboard_url: 'https://dashboard.convex.dev/', sources: ['convex/'] }],
  platforms: [{ kind: 'ios', name: 'App', path: 'apps/ios', source: 'apps/ios/App.xcodeproj' }],
  domains: [{ host: 'app.acme-corp.io', origin: 'docs', source: 'docs/domains.md', confirmed: true }],
  agents: { files: ['AGENTS.md'], dirs: ['.agent-worktrees'], worktrees: 3 }, ...over,
});
const v2 = (id, over = {}) => ({
  ...v1(id), version: 2, detected: detected(), container: { user_context_id: 12 }, shared_sites: { hosts: ['github.com', '*.github.com'], confirmed: true },
  accounts: [{ key: 'vercel', label: '  wout@company Google ' }, { key: '*.atlassian.net', label: 'Work Microsoft' }], brief: brief(), ...over,
});

test('DEFAULT_SHARED_SITES and the v2 enums', () => {
  assert.deepEqual(DEFAULT_SHARED_SITES, ['github.com', '*.github.com', 'gitlab.com', 'bitbucket.org', 'npmjs.com', '*.npmjs.com', 'stackoverflow.com', 'developer.mozilla.org']);
  assert.ok(Object.isFrozen(DEFAULT_SHARED_SITES));
  assert.deepEqual(INTEGRATION_IDS, ['vercel', 'convex', 'clerk', 'stripe', 'supabase', 'firebase', 'cloudflare', 'netlify', 'fly', 'sentry']);
  assert.deepEqual(PLATFORM_KINDS, ['tauri', 'macos', 'ios', 'android', 'electron']);
  assert.deepEqual(DOMAIN_ORIGINS, ['vercel_json', 'wrangler', 'netlify', 'fly', 'docs']);
});

test('project record v2: validated, normalized, frozen; v1 still validates', () => {
  const p = validateProject(v2('p_abcd'));
  assert.ok(Object.isFrozen(p) && Object.isFrozen(p.accounts[0]) && Object.isFrozen(p.brief.document.apps));
  assert.equal(p.version, 2);
  assert.deepEqual(p.accounts, [{ key: 'vercel', label: 'wout@company Google' }, { key: '*.atlassian.net', label: 'Work Microsoft' }], 'labels are trimmed');
  assert.equal(p.brief.document.product, 'A drawing studio with web, desktop and mobile apps.');
  assert.equal(p.detected.domains[0].confirmed, true, 'a project record may hold confirmed domains');
  assert.equal(validateProject(v1('p_abcd')).version, 1);
  assert.equal(validateProject(v2('p_abcd', { detected: null, brief: null, container: { user_context_id: null } })).container.user_context_id, null);
  throwsCode(() => validateProject({ ...v1('p_abcd'), detected: null }), 'INVALID_PROJECT', '$.detected');
  const { brief: _b, ...missing } = v2('p_abcd');
  throwsCode(() => validateProject(missing), 'INVALID_PROJECT', '$.brief');
  throwsCode(() => validateProject(v2('p_abcd', { version: 3 })), 'INVALID_PROJECT');
  throwsCode(() => validateProject(v2('p_abcd', { extra: 1 })), 'INVALID_PROJECT', '$.extra');
  assert.equal(MAX_USER_CONTEXT_ID, 4294967294);
  assert.equal(validateProject(v2('p_abcd', { container: { user_context_id: MAX_USER_CONTEXT_ID } })).container.user_context_id, MAX_USER_CONTEXT_ID);
  for (const id of [0, -1, 1.5, 4294967295, 4294967296, Number.MAX_SAFE_INTEGER, '12']) throwsCode(() => validateProject(v2('p_abcd', { container: { user_context_id: id } })), 'INVALID_PROJECT', '$.container.user_context_id');
  throwsCode(() => validateProject(v2('p_abcd', { container: {} })), 'INVALID_PROJECT', '$.container.user_context_id');
  throwsCode(() => validateProject(v2('p_abcd', { shared_sites: { hosts: ['github.com', 'github.com'], confirmed: false } })), 'INVALID_PROJECT', '$.shared_sites.hosts[1]');
  throwsCode(() => validateProject(v2('p_abcd', { shared_sites: { hosts: ['https://github.com'], confirmed: false } })), 'INVALID_PROJECT', '$.shared_sites.hosts[0]');
  throwsCode(() => validateProject(v2('p_abcd', { shared_sites: { hosts: Array.from({ length: 33 }, (_, i) => `h${i}.io`), confirmed: false } })), 'INVALID_PROJECT', '$.shared_sites.hosts');
  throwsCode(() => validateProject(v2('p_abcd', { detected: detected({ at: -1 }) })), 'INVALID_PROJECT', '$.detected.at');
  throwsCode(() => validateProject(v2('p_abcd', { detected: detected({ secret: 'x' }) })), 'INVALID_PROJECT', '$.detected.secret');
});

test('account labels: free text 1–80 characters after trim, no control characters, one per key', () => {
  const acc = accounts => validateProject(v2('p_abcd', { accounts })).accounts;
  assert.equal(acc([{ key: 'stripe', label: 'é'.repeat(80) }])[0].label.length, 80);
  for (const label of ['', '   ', 'x'.repeat(81), 'a\nb', 'tab\there', 'bell\u0007', 'c1\u0085', 7, null]) {
    throwsCode(() => acc([{ key: 'vercel', label }]), 'INVALID_PROJECT', '$.accounts[0].label');
  }
  for (const key of ['https://vercel.com', 'not a host', '', 'Vercel ', 7]) throwsCode(() => acc([{ key, label: 'x' }]), 'INVALID_PROJECT', '$.accounts[0].key');
  assert.equal(acc([{ key: 'VERCEL.COM', label: 'x' }])[0].key, 'vercel.com', 'host keys are normalized');
  throwsCode(() => acc([{ key: 'vercel', label: 'a' }, { key: 'vercel', label: 'b' }]), 'INVALID_PROJECT', '$.accounts[1]');
  throwsCode(() => acc(Array.from({ length: 33 }, (_, i) => ({ key: `h${i}.io`, label: 'x' }))), 'INVALID_PROJECT', '$.accounts');
  throwsCode(() => acc([{ key: 'vercel', label: 'x', token: 'secret' }]), 'INVALID_PROJECT', '$.accounts[0].token');
});

test('stored brief (understand-v1 §4): strict, trimmed, capped', () => {
  const b = validateBriefRecord(brief());
  assert.equal(b.document.apps[1].path, null);
  assert.equal(b.document.risks[0], 'Two apps share port 5173\nin development', 'multi-line text keeps newlines');
  const doc = over => brief({ document: { ...brief().document, ...over } });
  throwsCode(() => validateBriefRecord(brief({ cli: 'gemini' })), 'INVALID_BRIEF', '$.cli');
  throwsCode(() => validateBriefRecord(doc({ product: 'x'.repeat(601) })), 'INVALID_BRIEF', '$.document.product');
  throwsCode(() => validateBriefRecord(doc({ apps: [{ name: 'W', kind: 'game', path: null, summary: '' }] })), 'INVALID_BRIEF', '$.document.apps[0].kind');
  throwsCode(() => validateBriefRecord(doc({ apps: [{ name: 'W', kind: 'web', path: '../outside', summary: '' }] })), 'INVALID_BRIEF', '$.document.apps[0].path');
  throwsCode(() => validateBriefRecord(doc({ apps: [{ name: 'W', kind: 'web', path: '/abs', summary: '' }] })), 'INVALID_BRIEF', '$.document.apps[0].path');
  throwsCode(() => validateBriefRecord(doc({ domains: [{ host: 'https://x.io', purpose: '' }] })), 'INVALID_BRIEF', '$.document.domains[0].host');
  throwsCode(() => validateBriefRecord(doc({ domains: [{ host: '*.x.io', purpose: '' }] })), 'INVALID_BRIEF', '$.document.domains[0].host');
  throwsCode(() => validateBriefRecord(doc({ start: [{ label: 'x', command: 'a\nrm -rf /', cwd: null }] })), 'INVALID_BRIEF', '$.document.start[0].command');
  throwsCode(() => validateBriefRecord(doc({ risks: Array(9).fill('r') })), 'INVALID_BRIEF', '$.document.risks');
  throwsCode(() => validateBriefRecord(doc({ chat: [] })), 'INVALID_BRIEF', '$.document.chat');
  throwsCode(() => validateProject(v2('p_abcd', { brief: brief({ accepted: 'yes' }) })), 'INVALID_PROJECT', '$.brief.accepted');
});

test('context store v3 holds v2 records; v1 and v2 stores hold v1 records', () => {
  assert.equal(CONTEXT_STORE_VERSION, 3);
  assert.deepEqual(DEFAULT_CONTEXT_STORE, { version: 3, contexts: [], projects: [] });
  const s = validateContextStore({ version: 3, contexts: [context(UUID_A, { project_id: 'p_one1' })], projects: [v2('p_one1', { context_uuid: UUID_A }), v2('p_two2')] });
  assert.deepEqual(projectsInContext(s, UUID_A).map(p => p.id), ['p_one1']);
  throwsCode(() => validateContextStore({ version: 3, contexts: [], projects: [v1('p_one1')] }), 'INVALID_CONTEXT_STORE', '$.projects[0].version');
  throwsCode(() => validateContextStore({ version: 2, contexts: [], projects: [v2('p_one1')] }), 'INVALID_CONTEXT_STORE', '$.projects[0].version');
  throwsCode(() => validateContextStore({ version: 1, contexts: [], projects: [v2('p_one1')] }), 'INVALID_CONTEXT_STORE', '$.projects[0].version');
  throwsCode(() => validateContextStore({ version: 3, contexts: [context(UUID_A, { project_id: 'p_two2' })], projects: [v2('p_two2', { context_uuid: UUID_B })] }),
    'INVALID_CONTEXT_STORE', '$.contexts[0].project_id', 'the v2 mirror rule still applies');
});

test('migrateContextStore: v1 and v2 → v3 with record defaults; idempotent; updated_at untouched', () => {
  const fromV1 = migrateContextStore({ version: 1, contexts: [context(UUID_A, { type: 'project', project_id: 'p_one1' })], projects: [v1('p_one1', { updated_at: 77 })] });
  assert.equal(fromV1.version, 3);
  assert.deepEqual(fromV1.contexts[0].project_id, null);
  assert.deepEqual(fromV1.projects[0], {
    ...validateProject(v1('p_one1', { updated_at: 77, context_uuid: UUID_A })), version: 2, detected: null, container: { user_context_id: null },
    shared_sites: { hosts: DEFAULT_SHARED_SITES, confirmed: false }, accounts: [], brief: null,
  });
  const v2store = { version: 2, contexts: [context(UUID_B)], projects: [v1('p_two2', { context_uuid: UUID_B }), v1('p_thr3')] };
  const before = JSON.stringify(v2store);
  const out = migrateContextStore(v2store);
  assert.equal(JSON.stringify(v2store), before, 'input untouched');
  assert.deepEqual(out.projects.map(p => [p.id, p.version, p.context_uuid, p.updated_at, p.shared_sites.confirmed]), [['p_two2', 2, UUID_B, 2, false], ['p_thr3', 2, null, 2, false]]);
  assert.deepEqual(migrateContextStore(out), out, 'idempotent');
  assert.ok(Object.isFrozen(out.projects[0].shared_sites.hosts));
  const v3 = validateContextStore({ version: 3, contexts: [], projects: [v2('p_one1')] });
  assert.deepEqual(migrateContextStore(v3), v3, 'v3 input is returned as is');
  // A v3 document with a v1 record from an older writer is repaired, not rejected.
  const mixed = migrateContextStore({ version: 3, contexts: [], projects: [v2('p_one1'), v1('p_two2')] });
  assert.deepEqual(mixed.projects.map(p => p.version), [2, 2]);
  assert.deepEqual(upgradeProject(v1('p_two2')), mixed.projects[1]);
  assert.equal(upgradeProject(v2('p_one1')).container.user_context_id, 12, 'v2 records are kept');
  throwsCode(() => migrateContextStore({ version: 3, contexts: [], projects: [{ ...v1('p_bad1'), trusted: true }] }), 'INVALID_CONTEXT_STORE', '$.projects[0].trusted');
  throwsCode(() => migrateContextStore({ version: 4, contexts: [], projects: [] }), 'INVALID_CONTEXT_STORE', '$.version');
});

// A compact JSON Schema (2020-12) checker for the subset context-v1/-v2 use:
// $ref (local and cross-file), type, const, enum, pattern, min/maxLength,
// minimum/maximum, min/maxItems, uniqueItems, required, properties,
// additionalProperties, items, oneOf, anyOf, allOf. Enough to check the schema against the hand-written validators.
async function loadSchemas() {
  const v1s = JSON.parse(await readFile(new URL('../../../contracts/context-v1.schema.json', import.meta.url), 'utf8'));
  const v2s = JSON.parse(await readFile(new URL('../../../contracts/context-v2.schema.json', import.meta.url), 'utf8'));
  return { v1s, v2s, docs: { [v1s.$id]: v1s, [v2s.$id]: v2s } };
}
function resolver(docs) {
  return (ref, base) => {
    const [file, pointer = ''] = ref.split('#');
    const doc = file ? docs[new URL(file, base).href] : docs[base];
    if (!doc) throw new Error(`unresolved $ref ${ref}`);
    let node = doc;
    for (const part of pointer.split('/').filter(Boolean)) { node = node?.[part.replace(/~1/g, '/').replace(/~0/g, '~')]; if (node === undefined) throw new Error(`unresolved pointer ${ref}`); }
    return { node, base: file ? new URL(file, base).href : base };
  };
}
function check(schema, value, base, resolve) {
  if (schema.$ref) { const r = resolve(schema.$ref, base); if (!check(r.node, value, r.base, resolve)) return false; }
  const type = Array.isArray(value) ? 'array' : value === null ? 'null' : Number.isInteger(value) ? 'integer' : typeof value;
  if (schema.type && !(schema.type === type || (schema.type === 'number' && type === 'integer'))) return false;
  if ('const' in schema && JSON.stringify(schema.const) !== JSON.stringify(value)) return false;
  if (schema.enum && !schema.enum.some(e => JSON.stringify(e) === JSON.stringify(value))) return false;
  if (typeof value === 'string') {
    const n = [...value].length;
    if ((schema.minLength !== undefined && n < schema.minLength) || (schema.maxLength !== undefined && n > schema.maxLength)) return false;
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) return false;
  }
  if (typeof value === 'number' && ((schema.minimum !== undefined && value < schema.minimum) || (schema.maximum !== undefined && value > schema.maximum))) return false;
  if (Array.isArray(value)) {
    if ((schema.minItems !== undefined && value.length < schema.minItems) || (schema.maxItems !== undefined && value.length > schema.maxItems)) return false;
    if (schema.items && !value.every(v => check(schema.items, v, base, resolve))) return false;
    if (schema.uniqueItems && new Set(value.map(v => JSON.stringify(v))).size !== value.length) return false;
  }
  if (type === 'object') {
    if (schema.required && !schema.required.every(k => k in value)) return false;
    for (const [k, v] of Object.entries(value)) {
      if (schema.properties?.[k]) { if (!check(schema.properties[k], v, base, resolve)) return false; }
      else if (schema.additionalProperties === false) return false;
    }
  }
  if (schema.oneOf && schema.oneOf.filter(s => check(s, value, base, resolve)).length !== 1) return false;
  if (schema.allOf && !schema.allOf.every(s => check(s, value, base, resolve))) return false;
  if (schema.anyOf && !schema.anyOf.some(s => check(s, value, base, resolve))) return false;
  return true;
}

test('contracts/context-v2.schema.json agrees with the validators', async () => {
  const { v2s, docs } = await loadSchemas();
  assert.equal(v2s.$schema, 'https://json-schema.org/draft/2020-12/schema');
  const resolve = resolver(docs);
  // Every $ref resolves.
  const refs = [];
  (function walk(n) { if (n && typeof n === 'object') { if (typeof n.$ref === 'string') refs.push(n.$ref); Object.values(n).forEach(walk); } })(v2s);
  assert.ok(refs.some(r => r.startsWith('context-v1.schema.json#')), 'unchanged definitions come from context-v1');
  for (const r of refs) resolve(r, v2s.$id);
  const def = name => ({ $ref: `#/$defs/${name}` });
  const ok = (name, value) => assert.equal(check(def(name), value, v2s.$id, resolve), true, `${name} should accept`);
  const bad = (name, value) => assert.equal(check(def(name), value, v2s.$id, resolve), false, `${name} should reject`);
  for (const name of ['harbor-suite', 'inkline', 'next-app', 'tauri-plus-web', 'with-manifest']) {
    ok('detectionDraft', JSON.parse(await readFile(new URL(`./expected/${name}.json`, import.meta.url), 'utf8')));
  }
  const draft = JSON.parse(await readFile(new URL('./expected/inkline.json', import.meta.url), 'utf8'));
  bad('detectionDraft', { ...draft, domains: [{ ...draft.domains[0], confirmed: true }] });
  bad('detectionDraft', { ...draft, agents: { ...draft.agents, names: ['wt-a'] } });
  const { integrations: _i, ...noV2 } = draft;
  bad('detectionDraft', noV2);
  const { platforms: _p, domains: _d, agents: _a, icon: _icon, ...draftV1 } = noV2;
  const v1Services = draftV1.services.map(({ command: _c, cwd: _w, ...s }) => s);
  ok('detectionDraft', JSON.parse(JSON.stringify(validateDetectionDraft({ ...draftV1, services: v1Services, version: 1 }))));
  // workstation-v1 §1.5: draft v3 (icon, command-only services), manifest v3 and the setup document.
  ok('detectionDraft', JSON.parse(await readFile(new URL('./expected/desktop-browser.json', import.meta.url), 'utf8')));
  bad('detectionDraft', { ...draft, icon: { path: '.hidden/icon.png', source: 's', guess: true } });
  bad('detectionDraft', { ...draft, icon: { path: 'icon.gif', source: 's', guess: true } });
  bad('detectionDraft', { ...draft, services: [{ name: 'x', source: 's', guess: true }] });
  const m3 = { version: 3, name: 'Browser', kind: 'desktop', icon: 'assets/icon.svg', environments: [], surfaces: [],
    services: [{ name: 'Desktop app', command: './dev' }, { name: 'Web', url: 'http://localhost:5173/', port: 5173, command: 'pnpm dev', cwd: 'apps/web' }] };
  ok('manifest', m3);
  ok('manifest', JSON.parse(JSON.stringify(validateManifest(m3))));
  bad('manifest', { ...m3, version: 2 });
  bad('manifest', { ...m3, icon: '../icon.png' });
  bad('manifest', { ...m3, services: [{ name: 'Nothing' }] });
  bad('manifest', { ...m3, services: [{ name: 'x', command: 'a\nb' }] });
  const setup = { version: 1, name: 'Browser', kind: 'desktop', kind_reason: 'A desktop browser', icon: 'assets/icon.svg',
    services: [{ name: 'Desktop app', kind: 'desktop', command: './dev', cwd: null, url: null }, { name: 'Web', kind: 'web', command: 'pnpm dev', cwd: 'apps/web', url: 'http://localhost:5173' }] };
  ok('setupDocument', setup);
  ok('setupDocument', JSON.parse(JSON.stringify(validateSetupDocument(setup))));
  bad('setupDocument', { ...setup, kind: 'game' });
  bad('setupDocument', { ...setup, services: [{ ...setup.services[1], url: 'https://example.com:443' }] });
  ok('project', JSON.parse(JSON.stringify(validateProject(v2('p_abcd')))));
  ok('project', v1('p_abcd'));
  ok('container', { user_context_id: null });
  ok('container', { user_context_id: 1 });
  ok('container', { user_context_id: MAX_USER_CONTEXT_ID });
  const normalizedProject = JSON.parse(JSON.stringify(validateProject(v2('p_abcd'))));
  ok('project', { ...normalizedProject, container: { user_context_id: MAX_USER_CONTEXT_ID } });
  for (const id of [0, -1, 1.5, 4294967295, 4294967296, Number.MAX_SAFE_INTEGER, '12']) {
    bad('container', { user_context_id: id });
    bad('project', { ...normalizedProject, container: { user_context_id: id } });
  }
  bad('project', { ...v1('p_abcd'), brief: null });
  ok('contextStore', JSON.parse(JSON.stringify(migrateContextStore({ version: 1, contexts: [context(UUID_A, { project_id: 'p_one1' })], projects: [v1('p_one1')] }))));
  ok('contextStore', { version: 2, contexts: [], projects: [v1('p_one1')] });
  bad('contextStore', { version: 3, contexts: [], projects: [v1('p_one1')] });
  bad('contextStore', { version: 2, contexts: [], projects: [v2('p_one1')] });
  ok('sharedSites', { hosts: [...DEFAULT_SHARED_SITES], confirmed: false });
  bad('account', { key: 'vercel', label: '' });
  bad('account', { key: 'vercel', label: ' padded' });
  ok('account', { key: 'vercel', label: 'wout@company Google' });
  ok('account', { key: '*.atlassian.net', label: 'Work' });
  bad('platform', { kind: 'ios', name: 'A', path: '../x', source: 's' });
  bad('platform', { kind: 'ios', name: 'A', path: 'a/./b', source: 's' });
  ok('platform', { kind: 'ios', name: 'A', path: 'apps/.hidden-ok/ios', source: 's' });
  ok('platform', { kind: 'tauri', name: 'A', path: '', source: 's' });
  ok('briefRecord', JSON.parse(JSON.stringify(validateBriefRecord(brief()))));
  bad('briefRecord', brief(), 'the stored form is trimmed');
});
