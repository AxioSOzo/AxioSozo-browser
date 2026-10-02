/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../../../packages/contexts/src/index.mjs';
import { createProjectContainers, createGeckoIdentityAdapter, MAX_PUBLIC_USER_CONTEXT_ID } from '../chrome/ProjectContainers.sys.mjs';

const now = 1790935200000;
const record = (id = 'p_alpha', overrides = {}) => core.upgradeProject({
  version: 1, id, root: `/owned/${id}`, manifest: {
    version: 1, name: id, kind: 'web', environments: [{ name: 'local', base_url: 'http://localhost:5101' }],
    surfaces: [], services: [],
  }, manifest_state: 'none', context_uuid: null, trusted: false, created_at: now, updated_at: now,
  ...overrides,
});
function rig({ records = [record()], identityRecords = [], gate = true, saveError = false } = {}) {
  const projects = new Map(records.map(value => [value.id, value]));
  const identities = new Map(identityRecords.map(value => [value.userContextId, structuredClone(value)]));
  const events = [];
  let next = 40;
  const state = { gate, saveError, hook: null };
  const identityAPI = {
    get(id) { events.push(['get', id]); return structuredClone(identities.get(id) ?? null); },
    create(spec) {
      events.push(['create', spec]);
      const value = { userContextId: next++, public: true, ...spec };
      identities.set(value.userContextId, value);
      return structuredClone(value);
    },
    update(id, spec) {
      events.push(['update', id, spec]);
      if (!identities.has(id)) return null;
      const value = { userContextId: id, public: true, ...spec };
      identities.set(id, value);
      return structuredClone(value);
    },
  };
  const callbacks = {
    core, identities: identityAPI, getProject: id => projects.get(id), listProjects: () => [...projects.values()],
    assignContainer(id, assigned, { expectedUserContextId }) {
      events.push(['assign', id, assigned, expectedUserContextId]);
      if (state.saveError) throw new Error('save failed');
      state.hook?.(id, assigned);
      const before = projects.get(id);
      if (!before || before.container.user_context_id !== expectedUserContextId) return null;
      const after = core.validateProject({ ...before, container: { user_context_id: assigned } });
      projects.set(id, after);
      return after;
    },
    presentationForProject: value => ({ name: value.manifest.name, icon: 'briefcase', color: 'cyan' }),
    enabled: () => state.gate,
  };
  const controller = createProjectContainers(callbacks);
  return { controller, projects, identities, events, state, callbacks, identityAPI };
}
const normal = { isPrivate: false };
const routeOptions = { isPrivate: false, defaultUserContextId: 0 };
const rejectsCode = async (operation, code) => assert.rejects(Promise.resolve().then(operation), error => error.code === code);
const withContainer = (value, id) => core.validateProject({ ...value, container: { user_context_id: id } });
const identity = id => ({ userContextId: id, public: true, name: 'Owned project', icon: 'briefcase', color: 'blue' });

test('browser assigns and persists identity; same project has no duplicate creation', async () => {
  const r = rig();
  const a = await r.controller.ensure('p_alpha', normal);
  const b = await r.controller.ensure('p_alpha', normal);
  assert.equal(a.identity.userContextId, 40);
  assert.equal(b.identity.userContextId, 40);
  assert.equal(r.projects.get('p_alpha').container.user_context_id, 40);
  assert.equal(r.events.filter(event => event[0] === 'create').length, 1);
  assert.ok(Object.isFrozen(a));
  assert.ok(Object.isFrozen(a.identity));
});

test('simultaneous ensures serialize and different projects receive different identities', async () => {
  const r = rig({ records: [record(), record('p_beta')] });
  const results = await Promise.all([
    r.controller.ensure('p_alpha', normal), r.controller.ensure('p_beta', normal), r.controller.ensure('p_alpha', normal),
  ]);
  assert.deepEqual(results.map(value => value.identity.userContextId), [40, 41, 40]);
  assert.equal(r.events.filter(event => event[0] === 'create').length, 2);
});

test('two projects routing the same origin use separate cookie identities', async () => {
  const r = rig({ records: [record(), record('p_beta')] });
  const a = await r.controller.route('p_alpha', 'https://vercel.com/team/project', routeOptions);
  const b = await r.controller.route('p_beta', 'https://vercel.com/team/project', routeOptions);
  assert.deepEqual([a.userContextId, b.userContextId], [40, 41]);
  assert.equal(a.url, b.url);
  assert.equal(a.reason, 'project');
  const jars = new Map([[a.userContextId, new Map()], [b.userContextId, new Map()]]);
  jars.get(a.userContextId).set(a.url, 'account=synthetic-one');
  jars.get(b.userContextId).set(b.url, 'account=synthetic-two');
  assert.notEqual(jars.get(a.userContextId).get(a.url), jars.get(b.userContextId).get(b.url));
  // This is pure policy evidence; a real app fixture-cookie GUI run is required.
});

test('unconfirmed suggested shared sites stay in the project identity', async () => {
  const r = rig();
  const routed = await r.controller.route('p_alpha', 'https://github.com/acme/example', routeOptions);
  assert.equal(routed.reason, 'project');
  assert.equal(routed.userContextId, 40);
});

test('only confirmed shared-site patterns use the trusted space default', async () => {
  const p = record();
  const r = rig({ records: [core.validateProject({ ...p, shared_sites: { hosts: ['github.com', '*.github.com'], confirmed: true } })], identityRecords: [identity(5)] });
  const options = { ...normal, defaultUserContextId: 5 };
  const a = await r.controller.route('p_alpha', 'https://gist.github.com/x', options);
  const b = await r.controller.route('p_alpha', 'https://evilgithub.com/x', options);
  assert.deepEqual([a.userContextId, a.reason], [5, 'shared_site']);
  assert.deepEqual([b.userContextId, b.reason], [40, 'project']);
});

test('revoking confirmation affects the next route without changing the project identity', async () => {
  const p = record();
  const r = rig({ records: [core.validateProject({ ...p, shared_sites: { hosts: ['github.com'], confirmed: true } })] });
  assert.equal((await r.controller.route('p_alpha', 'https://github.com/x', routeOptions)).userContextId, 0);
  const assigned = r.projects.get('p_alpha');
  r.projects.set('p_alpha', core.validateProject({ ...assigned, shared_sites: { hosts: ['github.com'], confirmed: false } }));
  assert.equal((await r.controller.route('p_alpha', 'https://github.com/x', routeOptions)).userContextId, 40);
});

test('private, unknown privacy and container-disabled requests have no mutation', async () => {
  const r = rig();
  for (const options of [{}, { isPrivate: true }, { isPrivate: null }]) {
    await rejectsCode(() => r.controller.ensure('p_alpha', options), 'PRIVATE');
    await rejectsCode(() => r.controller.route('p_alpha', 'https://example.test', options), 'PRIVATE');
  }
  r.state.gate = false;
  await rejectsCode(() => r.controller.ensure('p_alpha', normal), 'CONTAINERS_DISABLED');
  assert.equal(r.events.length, 0);
});

test('caller cannot pass IDs, projects, names, account labels or identity metadata', async () => {
  const r = rig();
  for (const value of [{ userContextId: 1 }, { project: record('p_beta') }, { name: 'Injected' }, { accounts: [] }, { color: 'pink' }]) {
    await rejectsCode(() => r.controller.ensure('p_alpha', { ...normal, ...value }), 'INVALID_INPUT');
  }
  await rejectsCode(() => r.controller.ensure({ id: 'p_alpha' }, normal), 'INVALID_INPUT');
  assert.equal(r.events.length, 0);
});

test('public uint32 identity boundaries fail closed including reserved UINT32_MAX', async () => {
  assert.equal(MAX_PUBLIC_USER_CONTEXT_ID, 4294967294);
  const r = rig();
  for (const id of [-1, 0.5, '0', undefined, 4294967295, 4294967296, Number.MAX_SAFE_INTEGER]) {
    await rejectsCode(() => r.controller.route('p_alpha', 'https://example.test', { ...normal, defaultUserContextId: id }), 'INVALID_INPUT');
  }
  assert.equal(r.events.filter(event => event[0] === 'create').length, 0);
});

test('a nonzero default must exist as a public identity', async () => {
  const r = rig({ identityRecords: [{ ...identity(5), public: false }] });
  await rejectsCode(() => r.controller.route('p_alpha', 'https://example.test', { ...normal, defaultUserContextId: 5 }), 'IDENTITY_UNAVAILABLE');
  await rejectsCode(() => r.controller.route('p_alpha', 'https://example.test', { ...normal, defaultUserContextId: 6 }), 'IDENTITY_UNAVAILABLE');
  assert.equal(r.events.filter(event => event[0] === 'create').length, 0);
});

test('known public mapping survives controller restart', async () => {
  const r = rig({ records: [withContainer(record(), 22)], identityRecords: [identity(22)] });
  assert.equal((await r.controller.ensure('p_alpha', normal)).identity.userContextId, 22);
  assert.equal(r.events.filter(event => event[0] === 'create').length, 0);
});

test('missing or private in-range stored mappings are replaced by browser assignment', async () => {
  for (const stored of [22, MAX_PUBLIC_USER_CONTEXT_ID]) {
    const r = rig({ records: [withContainer(record(), stored)], identityRecords: [{ ...identity(22), public: false }] });
    const out = await r.controller.ensure('p_alpha', normal);
    assert.equal(out.identity.userContextId, 40);
    assert.equal(r.projects.get('p_alpha').container.user_context_id, 40);
  }
});

test('duplicate project mappings never silently share their jar', async () => {
  const r = rig({ records: [withContainer(record(), 22), withContainer(record('p_beta'), 22)], identityRecords: [identity(22)] });
  assert.equal((await r.controller.ensure('p_alpha', normal)).identity.userContextId, 40);
  assert.equal((await r.controller.ensure('p_beta', normal)).identity.userContextId, 22);
  assert.notEqual(r.projects.get('p_alpha').container.user_context_id, r.projects.get('p_beta').container.user_context_id);
});

test('failed persistence retains a private retry hint and never routes unsaved identity', async () => {
  const r = rig({ saveError: true });
  await assert.rejects(r.controller.route('p_alpha', 'https://example.test', routeOptions), /save failed/);
  assert.equal(r.projects.get('p_alpha').container.user_context_id, null);
  r.state.saveError = false;
  assert.equal((await r.controller.ensure('p_alpha', normal)).identity.userContextId, 40);
  assert.equal(r.events.filter(event => event[0] === 'create').length, 1);
});

test('project removal during persistence fails and never removes container data', async () => {
  const r = rig();
  r.state.hook = id => r.projects.delete(id);
  await rejectsCode(() => r.controller.ensure('p_alpha', normal), 'PROJECT_CHANGED');
  assert.equal(r.identities.has(40), true);
  assert.equal(await r.controller.forget('p_alpha'), true);
  await rejectsCode(() => r.controller.ensure('p_alpha', normal), 'UNKNOWN_PROJECT');
  assert.equal(r.identities.has(40), true);
});

test('CAS rejects concurrent mapping changes instead of overwriting them', async () => {
  const r = rig({ identityRecords: [identity(25)] });
  r.state.hook = id => r.projects.set(id, withContainer(r.projects.get(id), 25));
  await rejectsCode(() => r.controller.ensure('p_alpha', normal), 'PROJECT_CHANGED');
  assert.equal(r.projects.get('p_alpha').container.user_context_id, 25);
  assert.equal(r.identities.has(40), true);
});

test('refresh uses trusted presentation callback; account labels stay untouched', async () => {
  const p = record();
  const initial = core.validateProject({ ...p, container: { user_context_id: 22 }, accounts: [{ key: 'vercel', label: 'Manual synthetic label' }] });
  const r = rig({ records: [initial], identityRecords: [identity(22)] });
  const out = await r.controller.refreshPresentation('p_alpha', normal);
  assert.equal(out.identity.name, 'p_alpha');
  assert.equal(out.identity.color, 'cyan');
  assert.deepEqual(out.project.accounts, initial.accounts);
});

test('invalid, privileged and credential URLs cause no identity allocation', async () => {
  const r = rig();
  for (const url of ['about:blank', 'javascript:alert(1)', 'file:///owned/x', 'https://user:pass@example.test', 'invalid', null, 'x'.repeat(65537)]) {
    await rejectsCode(() => r.controller.route('p_alpha', url, routeOptions), 'INVALID_URL');
  }
  assert.equal(r.events.length, 0);
});

function serviceRig() {
  const store = new Map([[9, identity(9)]]);
  const events = [];
  const service = {
    getPublicIdentityFromId(id) { events.push(['get', id]); return store.get(id); },
    create(name, icon, color) { const value = { userContextId: 10, public: true, name, icon, color }; store.set(10, value); events.push(['create', name, icon, color]); return value; },
    update(id, name, icon, color) { if (!store.has(id)) return false; store.set(id, { userContextId: id, public: true, name, icon, color }); events.push(['update', id, name, icon, color]); return true; },
    remove() { assert.fail('Data-clearing remove must not be reachable'); },
  };
  return { store, events, service, adapter: createGeckoIdentityAdapter({ service, allowedColors: ['blue', 'cyan'], allowedIcons: ['briefcase'] }) };
}

test('Gecko adapter calls fixed pinned service signatures and exposes no removal', () => {
  const r = serviceRig();
  const spec = { name: '  Synthetic project  ', icon: 'briefcase', color: 'cyan' };
  assert.equal(r.adapter.get(9).userContextId, 9);
  assert.equal(r.adapter.create(spec).userContextId, 10);
  assert.deepEqual(r.events.find(event => event[0] === 'create'), ['create', 'Synthetic project', 'briefcase', 'cyan']);
  assert.equal(r.adapter.update(10, { ...spec, name: 'Renamed project' }).name, 'Renamed project');
  assert.equal(r.adapter.remove, undefined);
});

test('adapter rejects legacy-only color, unknown metadata and control-character names', () => {
  const r = serviceRig();
  const spec = { name: 'Synthetic', icon: 'briefcase', color: 'cyan' };
  for (const invalid of [{ ...spec, color: 'turquoise' }, { ...spec, icon: 'unknown' }, { ...spec, name: 'x\ny' }, { ...spec, name: '' }, { ...spec, userContextId: 1 }, { ...spec, public: true }]) {
    assert.throws(() => r.adapter.create(invalid), error => error.code === 'INVALID_IDENTITY');
  }
  assert.equal(r.events.length, 0);
});

test('adapter refuses non-public, mismatched and reserved identity replies', () => {
  const r = serviceRig();
  r.store.set(9, { ...identity(11), public: true });
  assert.equal(r.adapter.get(9), null);
  r.store.set(9, { ...identity(9), public: false });
  assert.equal(r.adapter.get(9), null);
  assert.equal(r.adapter.get(4294967295), null);
  assert.throws(() => r.adapter.update(9, { name: 'Synthetic', icon: 'briefcase', color: 'blue' }), error => error.code === 'IDENTITY_UNAVAILABLE');
});


test('shared-site revocation during identity checks changes the resolved route', async () => {
  const p = withContainer(record(), 22);
  const initial = core.validateProject({ ...p, shared_sites: { hosts: ['github.com'], confirmed: true } });
  const r = rig({ records: [initial], identityRecords: [identity(22)] });
  let calls = 0;
  const get = r.identityAPI.get;
  r.identityAPI.get = id => {
    if (++calls === 2) r.projects.set('p_alpha', core.validateProject({ ...initial, shared_sites: { hosts: ['github.com'], confirmed: false } }));
    return get(id);
  };
  const out = await r.controller.route('p_alpha', 'https://github.com/acme/project', routeOptions);
  assert.equal(out.userContextId, 22);
  assert.equal(out.reason, 'project');
  assert.equal(out.project_updated_at, initial.updated_at);
});

test('disabling containers during presentation preparation prevents creation', async () => {
  const r = rig();
  r.callbacks.presentationForProject = value => { r.state.gate = false; return { name: value.manifest.name, icon: 'briefcase', color: 'cyan' }; };
  const controller = createProjectContainers(r.callbacks);
  await rejectsCode(() => controller.ensure('p_alpha', normal), 'CONTAINERS_DISABLED');
  assert.equal(r.events.filter(event => event[0] === 'create').length, 0);
});

test('project removal during routing identity checks prevents a returned plan', async () => {
  const p = withContainer(record(), 22);
  const r = rig({ records: [p], identityRecords: [identity(22)] });
  let calls = 0;
  const get = r.identityAPI.get;
  r.identityAPI.get = id => { if (++calls === 2) r.projects.delete('p_alpha'); return get(id); };
  await rejectsCode(() => r.controller.route('p_alpha', 'https://example.test', routeOptions), 'UNKNOWN_PROJECT');
  assert.equal(r.events.filter(event => event[0] === 'create').length, 0);
});


test('trusted deletion observation detaches mapping without clearing identity data', async () => {
  const r = rig({ records: [withContainer(record(), 22)], identityRecords: [identity(22)] });
  assert.equal(await r.controller.identityDeleted(22), 1);
  assert.equal(r.projects.get('p_alpha').container.user_context_id, null);
  assert.equal(r.identities.has(22), true, 'fake observer does not delete itself');
  assert.equal((await r.controller.ensure('p_alpha', normal)).identity.userContextId, 40);
});

test('identity reset clears all associations and cannot silently adopt reused IDs', async () => {
  const r = rig({ records: [withContainer(record(), 22), withContainer(record('p_beta'), 23)], identityRecords: [identity(22), identity(23)] });
  assert.equal(await r.controller.identitiesReset(), 2);
  assert.equal(r.projects.get('p_alpha').container.user_context_id, null);
  assert.equal(r.projects.get('p_beta').container.user_context_id, null);
  assert.equal((await r.controller.ensure('p_alpha', normal)).identity.userContextId, 40);
});

test('failed reset persistence keeps routing blocked until cleanup succeeds', async () => {
  const r = rig({ records: [withContainer(record(), 22)], identityRecords: [identity(22)], saveError: true });
  await assert.rejects(r.controller.identitiesReset(), /save failed/);
  await rejectsCode(() => r.controller.ensure('p_alpha', normal), 'IDENTITY_RESET_PENDING');
  r.state.saveError = false;
  assert.equal(await r.controller.identitiesReset(), 1);
  assert.equal((await r.controller.ensure('p_alpha', normal)).identity.userContextId, 40);
});

test('deletion revokes an already running route before observer cleanup completes', async () => {
  const r = rig({ records: [withContainer(record(), 22)], identityRecords: [identity(22)] });
  let cleanup;
  const get = r.identityAPI.get;
  let observed = false;
  r.identityAPI.get = id => {
    if (!observed) { observed = true; cleanup = r.controller.identityDeleted(id); }
    return get(id);
  };
  await rejectsCode(() => r.controller.route('p_alpha', 'https://example.test', routeOptions), 'PROJECT_CHANGED');
  assert.equal(await cleanup, 1);
  assert.equal(r.projects.get('p_alpha').container.user_context_id, null);
});


test('reset stays blocked when a stale assignment callback leaves associations uncleared', async () => {
  const r = rig({ records: [withContainer(record(), 22)], identityRecords: [identity(22)] });
  const callbacks = { ...r.callbacks, assignContainer: () => null };
  const controller = createProjectContainers(callbacks);
  await rejectsCode(() => controller.identitiesReset(), 'PROJECT_CHANGED');
  await rejectsCode(() => controller.ensure('p_alpha', normal), 'IDENTITY_RESET_PENDING');
});


test('disabled routing reads no identity metadata and allocates nothing', async () => {
  const r = rig({ gate: false, identityRecords: [identity(5)] });
  await rejectsCode(() => r.controller.route('p_alpha', 'https://example.test', { ...normal, defaultUserContextId: 5 }), 'CONTAINERS_DISABLED');
  assert.equal(r.events.length, 0);
});

test('stale deletion cleanup fails instead of treating its old mapping as detached', async () => {
  const r = rig({ records: [withContainer(record(), 22)], identityRecords: [identity(22)] });
  const callbacks = { ...r.callbacks, assignContainer: () => null };
  const controller = createProjectContainers(callbacks);
  await rejectsCode(() => controller.identityDeleted(22), 'PROJECT_CHANGED');
  await rejectsCode(() => controller.ensure('p_alpha', normal), 'PROJECT_CHANGED');
  assert.equal(r.projects.get('p_alpha').container.user_context_id, 22);
});


test('reset during created-identity lookup cannot republish a stale retry hint', async () => {
  const r = rig();
  let reset, triggered = false;
  const get = r.identityAPI.get;
  r.identityAPI.get = id => {
    if (id === 40 && !triggered) { triggered = true; reset = r.controller.identitiesReset(); }
    return get(id);
  };
  await rejectsCode(() => r.controller.ensure('p_alpha', normal), 'PROJECT_CHANGED');
  assert.equal(await reset, 0);
  r.identities.set(40, { ...identity(40), name: 'Unrelated identity after reset' });
  assert.equal((await r.controller.ensure('p_alpha', normal)).identity.userContextId, 41);
  assert.equal(r.events.filter(event => event[0] === 'create').length, 2);
});

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

test('reset during awaited presentation cannot modify a reused identity', async () => {
  const r = rig({ records: [withContainer(record(), 22)], identityRecords: [identity(22)] });
  const entered = deferred(), presentation = deferred();
  r.callbacks.presentationForProject = () => { entered.resolve(); return presentation.promise; };
  const controller = createProjectContainers(r.callbacks);
  const refresh = controller.refreshPresentation('p_alpha', normal);
  await entered.promise;
  const reset = controller.identitiesReset();
  const unrelated = { ...identity(22), name: 'Unrelated identity after reset' };
  r.identities.set(22, unrelated);
  presentation.resolve({ name: 'Old project title', icon: 'briefcase', color: 'cyan' });
  await rejectsCode(() => refresh, 'PROJECT_CHANGED');
  assert.equal(await reset, 1);
  assert.deepEqual(r.identities.get(22), unrelated);
  assert.equal(r.events.filter(event => event[0] === 'update').length, 0);
});

test('mapping change during presentation prevents old-identity mutation', async () => {
  const r = rig({ records: [withContainer(record(), 22)], identityRecords: [identity(22), identity(25)] });
  const entered = deferred(), presentation = deferred();
  r.callbacks.presentationForProject = () => { entered.resolve(); return presentation.promise; };
  const controller = createProjectContainers(r.callbacks);
  const refresh = controller.refreshPresentation('p_alpha', normal);
  await entered.promise;
  r.projects.set('p_alpha', withContainer(r.projects.get('p_alpha'), 25));
  presentation.resolve({ name: 'Old project title', icon: 'briefcase', color: 'cyan' });
  await rejectsCode(() => refresh, 'PROJECT_CHANGED');
  assert.equal(r.events.filter(event => event[0] === 'update').length, 0);
  assert.equal(r.identities.get(22).name, 'Owned project');
});


test('reserved or otherwise invalid persisted identity records reject before browser side effects', async () => {
  for (const id of [0, -1, 1.5, 4294967295, 4294967296, Number.MAX_SAFE_INTEGER, '22']) {
    const corrupt = { ...record(), container: { user_context_id: id } };
    assert.throws(() => core.validateProject(corrupt), error => error.code === 'INVALID_PROJECT');
    assert.throws(() => core.validateContextStore({ version: 3, contexts: [], projects: [corrupt] }), error => error.code === 'INVALID_CONTEXT_STORE');
    const r = rig({ records: [corrupt] });
    await rejectsCode(() => r.controller.ensure('p_alpha', normal), 'INVALID_PROJECT');
    assert.equal(r.events.length, 0, 'no identity lookup, allocation or persistence for invalid bytes');
    assert.equal(r.projects.get('p_alpha').container.user_context_id, id, 'invalid bytes are not repaired');
  }
});

test('the last public identity remains a valid saved ownership mapping', async () => {
  assert.equal(core.MAX_USER_CONTEXT_ID, MAX_PUBLIC_USER_CONTEXT_ID);
  const id = MAX_PUBLIC_USER_CONTEXT_ID;
  const r = rig({ records: [withContainer(record(), id)], identityRecords: [identity(id)] });
  assert.equal((await r.controller.ensure('p_alpha', normal)).identity.userContextId, id);
  assert.equal(r.events.filter(event => event[0] === 'create').length, 0);
});
