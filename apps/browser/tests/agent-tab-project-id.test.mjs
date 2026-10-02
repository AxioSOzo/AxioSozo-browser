import test from 'node:test';
import assert from 'node:assert/strict';
import { isProjectId } from '../../../packages/contexts/src/schema.mjs';
import { AgentTabRegistry, createTabIdAllocator } from '../chrome/AgentTabRegistry.sys.mjs';

// Synthetic native facts only; no actor, DOM, process, provider or browser.
function fixture(project_id) {
  const window = {}, tab = {}, browser = {}, permanentKey = {}, browsingContext = {},
    frameLoader = {}, windowGlobal = {}, principal = {};
  const state = { project_id, ambiguous: false }, reads = [];
  const read = (name, value) => { reads.push(name); return value; };
  const runtime = {
    isPrivateWindow: () => read('window-private', false),
    isWindowRegistered: () => read('window-registered', true),
    isWindowClosed: () => read('window-closed', false),
    isTabLive: () => read('tab-live', true),
    getBrowser: () => read('browser', browser),
    isPrivateBrowser: () => read('browser-private', false),
    getBrowserIdentity: () => read('identity', { nativeBrowserId: Number.MAX_SAFE_INTEGER,
      permanentKey, browsingContext, frameLoader, frameLoaderOwner: browser,
      frameLoaderContext: browsingContext }),
    getContextState: () => read('context', { isContent: true, top: browsingContext,
      isDiscarded: false, private: false, privateBrowsingId: 0, userContextId: 2,
      embedder: browser }),
    getEngine: () => read('engine', 'gecko'),
    getCurrentDocument: () => read('document', windowGlobal),
    getDocumentState: () => read('document-state', { browsingContext, isCurrentGlobal: true,
      isClosed: false, failedChannel: null, document_id: 123, principal,
      isSystemPrincipal: false, isNullPrincipal: false, privateBrowsingId: 0,
      userContextId: 2 }),
    getDocumentURL: () => read('url', 'http://localhost:4450/'),
    isActiveTab: () => read('active', true),
    getRoute: () => read('route', { contextUuid: null, revision: 1 }),
    getProjectRevision: () => read('project-revision', 1),
    matchProject: () => read('project-match', { project_id: state.project_id,
      ambiguous: state.ambiguous, revision: 1 }),
    getTitle: () => read('title', 'Synthetic tab'),
    classifyHost: () => read('category', { sensitive: false }),
  };
  const registry = new AgentTabRegistry(runtime, { allocateId: createTabIdAllocator() });
  return { registry, state, reads, tab, window, register: () => registry.register(tab, window) };
}

for (const suffix of ['a0z9', 'a0z9'.repeat(8)]) {
  test(`contexts ${suffix.length}-character project ID survives public and internal projection`, () => {
    const id = `p_${suffix}`, f = fixture(id);
    try {
      assert.equal(isProjectId(id), true);
      const tab_id = f.register(); assert.equal(tab_id, 't_1');
      assert.equal(f.registry.get(tab_id).project_id, id);
      assert.equal(f.registry.metadata(tab_id).project_id, id);
      assert.equal(f.registry.list()[0].project_id, id);
      assert.equal(f.reads.includes('title'), true);
    } finally { f.registry.close(); }
  });
}
for (const [name, id] of [['three characters', 'p_a0z'], ['33 characters', `p_${'a'.repeat(33)}`],
  ['underscore', 'p_ab_cd'], ['hyphen', 'p_ab-cd']]) {
  test(`contexts rejects ${name} before any registry title read or allocation`, () => {
    const f = fixture(id);
    try {
      assert.equal(isProjectId(id), false); assert.equal(f.register(), null);
      assert.equal(f.reads.includes('project-match'), true);
      assert.equal(f.reads.includes('title'), false);
      assert.deepEqual(f.registry.list(), []);
      f.state.project_id = 'p_abcd';
      assert.equal(f.register(), 't_1');
    } finally { f.registry.close(); }
  });
}

test('non-string runtime project IDs deny without coercion or title reads', () => {
  let coercions = 0;
  const disguised = { [Symbol.toPrimitive]() { coercions++; return 'p_abcd'; } };
  for (const id of [undefined, 1234, {}, new String('p_abcd'), disguised, Symbol('p_abcd')]) {
    const f = fixture(id);
    try {
      assert.equal(isProjectId(id), false); assert.equal(f.register(), null);
      assert.equal(f.reads.includes('title'), false);
      assert.deepEqual(f.registry.listMetadata(), []);
    } finally { f.registry.close(); }
  }
  assert.equal(coercions, 0);
});

test('a current invalid project match suppresses existing descriptors and trusted callbacks before title', () => {
  const f = fixture('p_abcd');
  try {
    const tab_id = f.register(), expected = f.registry.metadata(tab_id);
    f.state.project_id = 'p_ab-cd'; f.reads.length = 0;
    assert.equal(f.registry.get(tab_id), null);
    assert.equal(f.registry.metadata(tab_id, { expected }), null);
    let called = false;
    assert.equal(f.registry.withTrusted(tab_id, () => { called = true; return true; }), null);
    assert.equal(called, false); assert.deepEqual(f.registry.list(), []);
    assert.equal(f.reads.includes('title'), false);
    f.state.project_id = 'p_abcd';
    assert.equal(f.register(), tab_id);
    assert.equal(f.registry.metadata(tab_id, { expected }), null);
    assert.equal(f.registry.metadata(tab_id).project_id, 'p_abcd');
  } finally { f.registry.close(); }
});

test('ambiguous matches must still carry null or a valid contexts project ID before title reads', () => {
  const f = fixture('p_ab_cd'); f.state.ambiguous = true;
  try {
    assert.equal(f.register(), null); assert.equal(f.reads.includes('title'), false);
    f.state.project_id = null; assert.equal(f.registry.get(f.register()).project_id, null);
  } finally { f.registry.close(); }
});
