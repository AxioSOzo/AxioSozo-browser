import test from 'node:test';
import assert from 'node:assert/strict';
import { createAgentViewportCapture } from '../chrome/AgentViewportCapture.sys.mjs';
import { createGeckoBiDiReadSession, createBiDiAllocationBudget, AgentToolError } from '../chrome/GeckoBiDiReadSession.sys.mjs';

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aYxkAAAAASUVORK5CYII=';
// These headers model capped dimensions/bytes only; injected validator tests do
// not claim to decode these deliberately synthetic PNG fixtures as native PNGs.
function header(width, height, bytes = 33) {
  const output = Buffer.alloc(bytes);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(output);
  output.writeUInt32BE(13, 8); output.write('IHDR', 12);
  output.writeUInt32BE(width, 16); output.writeUInt32BE(height, 20);
  return output.toString('base64');
}
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const tick = () => new Promise(resolve => setImmediate(resolve));
const rejects = (promise, code) => assert.rejects(promise, error => error instanceof AgentToolError && error.code === code);
function timers() {
  let next = 0; const entries = new Map();
  return {
    setTimer(fn, ms) { const id = ++next; entries.set(id, { fn, ms }); return id; },
    clearTimer(id) { entries.delete(id); },
    fire(ms) { for (const [id, entry] of [...entries]) if (entry.ms === ms) { entries.delete(id); entry.fn(); } },
    get size() { return entries.size; },
  };
}
function fixture(overrides = {}) {
  const expected = Object.freeze({ tab_id: 't_1', binding_token: 'trusted-only' });
  const lease = Object.freeze({ nonce: 'private-test-lease' });
  const clock = timers();
  const calls = { active: 0, begin: 0, validate: 0, create: 0, capture: 0, png: 0, resize: 0, close: 0, release: 0 };
  const events = [];
  const ctx = { expected, lease, active: true, valid: true, retired: false, calls, events, clock, png: PNG, image: null };
  const invoke = (name, args, fallback) => { calls[name]++; events.push(name); return overrides[name] ? overrides[name](ctx, ...args) : fallback(); };
  const reader = Object.freeze({
    capabilities: Object.freeze({ viewportScreenshot: true, act: false, open: false }),
    capture(value, options) {
      assert.equal(value, expected);
      return invoke('capture', [value, options], () => ({ data_base64: ctx.png }));
    },
    close() { return invoke('close', [], () => undefined); },
  });
  ctx.reader = reader;
  const owner = createAgentViewportCapture({
    isActive(value, request) {
      assert.equal(value, request.expected);
      return invoke('active', [value, request], () => ctx.active && value === expected);
    },
    beginReadLease(request, options) {
      assert.equal(request.expected, expected);
      assert.ok(Object.isFrozen(request));
      return invoke('begin', [request, options], () => lease);
    },
    validateReadLease(value, request, options) {
      assert.equal(value, lease); assert.equal(request.expected, expected);
      assert.equal(ctx.retired, false, 'a retired lease is never validated');
      return invoke('validate', [request, options], () => ctx.valid);
    },
    releaseReadLease(value, request, options) {
      assert.equal(value, lease); assert.equal(request.expected, expected);
      return invoke('release', [request, options], () => {
        if (options.commit && !ctx.valid) return false;
        ctx.retired = true; return true;
      });
    },
    createNativeReadSession(request, options) { return invoke('create', [request, options], () => reader); },
    validatePng(image, options) { return invoke('png', [image, options], () => true); },
    resizePng(image, options) {
      ctx.image = image;
      return invoke('resize', [image, options], () => ({ data_base64: header(image.target_width, image.target_height) }));
    },
    setTimer: clock.setTimer, clearTimer: clock.clearTimer, timeoutMs: 5000, cleanupTimeoutMs: 100,
    ...overrides.options,
  });
  const capture = (params = {}, options = {}) => owner.captureViewport({ tab_id: 't_1', expected, purpose: 'bridge', ...params }, options);
  return { ...ctx, ctx, owner, capture };
}

test('one-shot image is frozen, exact-bound, and reader closes before terminal child commit', async () => {
  const f = fixture(); const image = await f.capture();
  assert.deepEqual(image, { mime: 'image/png', width: 1, height: 1, data_base64: PNG });
  assert.ok(Object.isFrozen(image));
  assert.equal(f.calls.capture, 1); assert.equal(f.calls.close, 1); assert.equal(f.calls.release, 1);
  assert.ok(f.events.indexOf('close') < f.events.indexOf('release'));
  assert.equal(f.events.at(-1), 'active');
  assert.deepEqual(f.owner.getState(), { closed: false, busy: false, pending_operations: 0,
    retained_leases: 0, retained_readers: 0, cleanup_incomplete: false });
  assert.equal(f.clock.size, 0);
});

test('invalid parameters and accessor fields have no admission/native side effects', async () => {
  for (const params of [{ tab_id: 't_1000000000000000' }, { tab_id: 't_01' }, { purpose: 'actor-choice' },
    { max_width: 63 }, { max_width: 1921 }, { max_height: 16385 }, { max_bytes: 2097153 },
    { purpose: 'decision', max_width: 1281 }, { purpose: 'handoff', max_height: 1281 },
    { purpose: 'handoff', max_bytes: 1048577 }, { expected: { tab_id: 't_1' } }, { unknown: true }]) {
    const f = fixture(); await rejects(f.capture(params), 'INVALID_PARAMS'); assert.equal(f.calls.begin, 0);
  }
  const f = fixture(); let read = 0;
  const request = { tab_id: 't_1', expected: f.expected, purpose: 'bridge' };
  Object.defineProperty(request, 'max_width', { enumerable: true, get() { read++; return 1280; } });
  await rejects(f.owner.captureViewport(request), 'INVALID_PARAMS'); assert.equal(read, 0); assert.equal(f.calls.begin, 0);
});

test('frozen clone is rejected by exact parent authority before child or native admission', async () => {
  const f = fixture(); const clone = Object.freeze({ ...f.expected });
  await rejects(f.capture({ expected: clone }), 'NOT_APPROVED');
  assert.equal(f.calls.begin, 0); assert.equal(f.calls.create, 0); assert.equal(f.calls.capture, 0);
});

test('false/unknown initial privacy admission makes zero actual capture/resize calls', async () => {
  for (const begin of [false, null, undefined]) {
    const f = fixture({ begin: () => begin });
    await rejects(f.capture(), 'UNAVAILABLE');
    assert.equal(f.calls.create, 0); assert.equal(f.calls.capture, 0); assert.equal(f.calls.resize, 0);
  }
  for (const valid of [false, undefined, {}, Promise.resolve(false)]) {
    const f = fixture({ validate: () => valid });
    await rejects(f.capture(), 'UNAVAILABLE');
    assert.equal(f.calls.create, 0); assert.equal(f.calls.capture, 0); assert.equal(f.calls.resize, 0);
    assert.equal(f.calls.release, 1);
  }
});

test('private initial refusal is coded, hides arbitrary error text, and never constructs native reader', async () => {
  const f = fixture({ begin: () => { throw new AgentToolError('PRIVATE'); } });
  await rejects(f.capture(), 'PRIVATE'); assert.equal(f.calls.create, 0); assert.equal(f.calls.capture, 0);
  const g = fixture({ begin: () => { throw new Error('private arbitrary page text'); } });
  await rejects(g.capture(), 'UNAVAILABLE');
});

test('parent admission must return literal synchronous true', async () => {
  for (const result of [undefined, {}, 1, Promise.resolve(true)]) {
    const f = fixture({ active: () => result }); await rejects(f.capture(), 'NOT_APPROVED'); assert.equal(f.calls.begin, 0);
  }
});

for (const stage of ['begin', 'create', 'capture', 'png', 'resize', 'close']) {
  test(`child taint during ${stage} is permanently discarded before terminal commit`, async () => {
    const f = fixture({
      [stage]: (ctx, ...args) => {
        ctx.valid = false;
        if (stage === 'begin') return ctx.lease;
        if (stage === 'create') return ctx.reader;
        if (stage === 'capture') return { data_base64: ctx.png };
        if (stage === 'png') return true;
        if (stage === 'resize') return { data_base64: header(args[0].target_width, args[0].target_height) };
      },
    });
    if (stage === 'resize') f.ctx.png = header(2000, 1000);
    await rejects(f.capture(), 'UNAVAILABLE');
    if (stage === 'begin') { assert.equal(f.calls.create, 0); assert.equal(f.calls.capture, 0); }
    if (stage === 'create') assert.equal(f.calls.capture, 0);
    assert.equal(f.ctx.retired, true);
  });
}

for (const stage of ['begin', 'create', 'capture', 'png', 'resize', 'close']) {
  test(`parent revocation during ${stage} wins over native result/error`, async () => {
    const f = fixture({ [stage]: ctx => { ctx.active = false; throw new Error('native message not published'); } });
    if (stage === 'resize') f.ctx.png = header(2000, 1000);
    await rejects(f.capture(), 'NOT_APPROVED');
    assert.equal(f.calls.resize, stage === 'resize' ? 1 : 0);
  });
}

test('terminal child commit atomically refuses taint introduced after last validation', async () => {
  const f = fixture({ release: (ctx, _request, options) => {
    if (options.commit) { ctx.valid = false; return false; }
    ctx.retired = true; return true;
  } });
  await rejects(f.capture(), 'UNAVAILABLE'); assert.equal(f.calls.release, 2); assert.equal(f.ctx.retired, true);
  assert.equal(f.owner.getState().busy, false);
});

test('parent revocation while terminal commit reply is pending discards image after positive retirement', async () => {
  const reply = deferred();
  const f = fixture({ release: (ctx, _request, options) => {
    if (options.commit) return reply.promise.then(() => { ctx.retired = true; return true; });
    ctx.retired = true; return true;
  } });
  const work = f.capture(); await tick();
  assert.equal(f.calls.close, 1); assert.equal(f.calls.release, 1);
  f.ctx.active = false; reply.resolve(); await rejects(work, 'NOT_APPROVED');
  assert.equal(f.calls.release, 1); assert.equal(f.owner.getState().busy, false);
});

test('no validation/native image work occurs after terminal retirement', async () => {
  let retiredAt = -1;
  const f = fixture({ release: (ctx, _request, options) => {
    assert.equal(options.commit, true); ctx.retired = true; retiredAt = ctx.events.length; return true;
  } });
  await f.capture(); assert.deepEqual(f.events.slice(retiredAt), ['active']);
});

test('decision and handoff enforce both dimensions, including a tall portrait requiring width below64', async () => {
  for (const purpose of ['decision', 'handoff']) {
    const f = fixture(); f.ctx.png = header(100, 4000);
    const image = await f.capture({ purpose });
    assert.equal(image.width, 32); assert.equal(image.height, 1280);
    assert.equal(f.ctx.image.target_width, 32); assert.equal(f.ctx.image.target_height, 1280);
    assert.equal(f.ctx.image.max_bytes, 1048576); assert.equal(f.calls.resize, 1);
    assert.equal('expected' in f.ctx.image, false);
  }
});

test('bridge default width1280, explicit1920, and requested height/byte limits are enforced', async () => {
  const f = fixture(); f.ctx.png = header(2000, 1000);
  assert.equal((await f.capture()).width, 1280);
  const g = fixture(); g.ctx.png = header(2000, 1000);
  assert.equal((await g.capture({ max_width: 1920 })).width, 1920);
  const h = fixture(); h.ctx.png = header(200, 1000);
  assert.deepEqual((await h.capture({ max_height: 100 })).height, 100);
  const j = fixture(); j.ctx.png = header(1, 1, 1048577);
  await j.capture({ purpose: 'decision' }); assert.equal(j.calls.resize, 1);
});

test('oversized/bad resized PNG cannot bypass actual dimensions or purpose decoded bytes', async () => {
  for (const data of [header(32, 1281), header(33, 1280), header(32, 1280, 1048577)]) {
    const f = fixture({ resize: () => ({ data_base64: data }) }); f.ctx.png = header(100, 4000);
    await rejects(f.capture({ purpose: 'handoff' }), 'TOO_LARGE'); assert.equal(f.calls.release, 1);
  }
});

test('raw cap and decompressed pixel ceiling reject before native PNG validation/resize', async () => {
  for (const data of [header(16384, 16384), header(1, 1, 2097153), 'AAAA', header(0, 1)]) {
    const f = fixture(); f.ctx.png = data; await assert.rejects(f.capture(), error => ['TOO_LARGE', 'UNAVAILABLE'].includes(error.code));
    assert.equal(f.calls.png, 0); assert.equal(f.calls.resize, 0);
  }
});

test('full native PNG validation requires literal true before resizing or publication', async () => {
  for (const receipt of [false, undefined, {}]) {
    const f = fixture({ png: () => receipt }); f.ctx.png = header(2000, 1000);
    await rejects(f.capture(), 'UNAVAILABLE'); assert.equal(f.calls.resize, 0);
  }
});

test('missing bounding-box resizer refuses oversize rather than using width-only fallback', async () => {
  const f = fixture({ options: { resizePng: null } }); f.ctx.png = header(100, 4000);
  await rejects(f.capture({ purpose: 'handoff' }), 'TOO_LARGE'); assert.equal(f.calls.resize, 0);
});

test('abort during raw capture drops late PNG and retains pending work until it settles', async () => {
  const pending = deferred(); const external = new AbortController();
  const f = fixture({ capture: () => pending.promise }); const work = f.capture({}, { signal: external.signal });
  await tick(); external.abort(); await rejects(work, 'NOT_APPROVED');
  assert.equal(f.calls.png, 0); assert.equal(f.calls.close, 1); assert.equal(f.calls.release, 1);
  assert.equal(f.owner.getState().pending_operations, 1);
  await rejects(f.capture(), 'BUSY'); pending.resolve({ data_base64: PNG }); await tick();
  assert.equal(f.owner.getState().busy, false); assert.equal(f.calls.png, 0); assert.equal(f.calls.resize, 0);
});

test('timeout during resize drops a late error with no unhandled rejection', async () => {
  const pending = deferred(); const f = fixture({ resize: () => pending.promise }); f.ctx.png = header(2000, 1000);
  const work = f.capture(); await tick(); f.clock.fire(5000); await rejects(work, 'TIMEOUT');
  assert.equal(f.owner.getState().pending_operations, 1); pending.reject(new Error('late arbitrary text')); await tick();
  assert.equal(f.owner.getState().busy, false); assert.equal(f.calls.close, 1); assert.equal(f.calls.release, 1);
});

test('late child acquisition is owned and retired without native construction', async () => {
  const pending = deferred(); const f = fixture({ begin: () => pending.promise });
  const work = f.capture(); await tick(); f.clock.fire(5000); await rejects(work, 'TIMEOUT');
  assert.equal(f.owner.getState().pending_operations, 1); await rejects(f.capture(), 'BUSY');
  pending.resolve(f.lease); await tick();
  assert.equal(f.calls.release, 1); assert.equal(f.calls.create, 0); assert.equal(f.calls.capture, 0);
  assert.equal(f.owner.getState().busy, false);
});

test('late native reader acquisition is closed, never captured, and blocks reuse while unresolved', async () => {
  const pending = deferred(); const f = fixture({ create: () => pending.promise });
  const work = f.capture(); await tick(); f.clock.fire(5000); await rejects(work, 'TIMEOUT');
  assert.equal(f.calls.release, 1); assert.equal(f.owner.getState().pending_operations, 1);
  pending.resolve(f.ctx.reader); await tick();
  assert.equal(f.calls.close, 1); assert.equal(f.calls.capture, 0); assert.equal(f.owner.getState().busy, false);
});

test('failed reader close retains exact reader and explicit close retries owned cleanup', async () => {
  const f = fixture({ close: ctx => { if (ctx.calls.close === 1) throw new Error('close failed'); } });
  await rejects(f.capture(), 'UNAVAILABLE'); assert.equal(f.calls.close, 1); assert.equal(f.calls.release, 1);
  assert.equal(f.owner.getState().retained_readers, 1); await rejects(f.capture(), 'BUSY');
  assert.equal(await f.owner.close(), true); assert.equal(f.calls.close, 2); assert.equal(f.calls.release, 1);
  assert.equal(f.owner.getState().busy, false); await rejects(f.capture(), 'NOT_APPROVED');
});

test('failed release retains exact lease; lost usability cannot stand in for literal retirement receipt', async () => {
  const f = fixture({ release: (ctx, _request, options) => {
    if (ctx.calls.release <= 2) return undefined;
    assert.equal(options.commit, false); ctx.retired = true; return true;
  } });
  await rejects(f.capture(), 'UNAVAILABLE'); assert.equal(f.calls.release, 2);
  assert.equal(f.owner.getState().retained_leases, 1); await rejects(f.capture(), 'BUSY');
  assert.equal(await f.owner.close(), true); assert.equal(f.calls.release, 3); assert.equal(f.owner.getState().busy, false);
});

test('hanging cleanup is bounded, pending release is coalesced, late true receipt clears ownership', async () => {
  const pending = deferred(); const f = fixture({ release: () => pending.promise });
  const work = f.capture(); await tick(); f.clock.fire(100); await tick(); f.clock.fire(100);
  await rejects(work, 'UNAVAILABLE'); assert.equal(f.calls.release, 1);
  assert.equal(f.owner.getState().retained_leases, 1);
  const closed = f.owner.close(); await tick(); f.clock.fire(100); await rejects(closed, 'UNAVAILABLE');
  assert.equal(f.calls.release, 1);
  pending.resolve(true); await tick(); assert.equal(f.owner.getState().busy, false);
  assert.equal(await f.owner.close(), true);
});

test('close during unresolved acquisition stays failed until late resource has positive cleanup', async () => {
  const pending = deferred(); const f = fixture({ begin: () => pending.promise }); const work = f.capture(); await tick();
  await rejects(f.owner.close(), 'UNAVAILABLE'); await rejects(work, 'NOT_APPROVED');
  assert.equal(f.owner.getState().pending_operations, 1);
  pending.resolve(f.lease); await tick(); assert.equal(f.calls.release, 1);
  assert.equal(await f.owner.close(), true); assert.equal(f.owner.getState().busy, false);
});

test('read-only categorical state never calls native/lease/authority callbacks', async () => {
  const pending = deferred(); const f = fixture({ capture: () => pending.promise }); const work = f.capture(); await tick();
  const before = { ...f.calls }; for (let i = 0; i < 50; i++) assert.ok(Object.isFrozen(f.owner.getState()));
  assert.deepEqual(f.calls, before); f.clock.fire(5000); await rejects(work, 'TIMEOUT');
  pending.resolve({ data_base64: PNG }); await tick();
});

test('composes genuine BiDi adapter with fake Gecko modules without any listener or custom capture', async () => {
  const native = { execute: [], constructed: 0, destroyed: 0 };
  class Session {
    static SESSION_FLAG_BIDI = 'bidi';
    constructor(capabilities, flags) {
      native.constructed++;
      assert.deepEqual(capabilities, { acceptInsecureCerts: false, unhandledPromptBehavior: 'ignore' });
      assert.deepEqual(flags, new Set(['bidi']));
    }
    execute(module, command, params) { native.execute.push({ module, command, params }); return Promise.resolve({ data: PNG }); }
    destroy() { native.destroyed++; }
  }
  const bc = { isContent: true, parent: null, isDiscarded: false, usePrivateBrowsing: false,
    currentWindowGlobal: { isClosed: false, isCurrentGlobal: true, innerWindowId: 7, documentURI: { spec: 'https://synthetic.invalid/' } } };
  const nativeTab = { browsingContext: bc, document_id: '7', url: 'https://synthetic.invalid/' };
  const f = fixture({ create: (ctx, request) => {
    const reader = createGeckoBiDiReadSession({
      loadModules: async () => ({ WebDriverSession: Session, hasActiveWebDriverSession: () => false,
        getNavigableManager: async () => ({ getIdForBrowsingContext(value) { assert.equal(value, bc); return 'native-context-1'; } }),
        RemoteAgent: { enabled: false, running: false, allowSystemAccess: false }, Marionette: { enabled: false, running: false } }),
      setTimer: ctx.clock.setTimer, clearTimer: ctx.clock.clearTimer, allocationBudget: createBiDiAllocationBudget(),
    });
    return Object.freeze({ capabilities: reader.capabilities, close: () => reader.close(),
      capture(expected, options) { assert.equal(expected, request.expected); return reader.capture(nativeTab, options); } });
  } });
  assert.equal((await f.capture()).data_base64, PNG);
  assert.deepEqual(native, { constructed: 1, destroyed: 1, execute: [{ module: 'browsingContext', command: 'captureScreenshot',
    params: { context: 'native-context-1', origin: 'viewport', format: { type: 'image/png' } } }] });
});


test('throwing authority and parameter traps cannot expose arbitrary exception text', async () => {
  const f = fixture({ active: () => { throw new Error('arbitrary native diagnostic'); } });
  await rejects(f.capture(), 'UNAVAILABLE'); assert.equal(f.calls.begin, 0);
  const request = new Proxy({}, { getPrototypeOf() { throw new Error('arbitrary trap text'); } });
  await rejects(f.owner.captureViewport(request), 'INVALID_PARAMS');
  const g = fixture({ begin: () => { throw new AgentToolError('ARBITRARY_PRIVATE_TEXT'); } });
  await rejects(g.capture(), 'UNAVAILABLE');
});

test('native reader with wrong capabilities is closed without any raw capture', async () => {
  let closed = 0, captured = 0;
  const f = fixture({ create: () => Object.freeze({ capabilities: Object.freeze({ viewportScreenshot: true, act: true, open: false }),
    close() { closed++; }, capture() { captured++; return { data_base64: PNG }; } }) });
  await rejects(f.capture(), 'UNAVAILABLE'); assert.equal(captured, 0); assert.equal(closed, 1);
  assert.equal(f.owner.getState().busy, false);
});

test('pending async reader close retains ownership and lease observes until success-phase close completes', async () => {
  const pending = deferred(); const f = fixture({ close: () => pending.promise }); const work = f.capture(); await tick();
  assert.equal(f.calls.close, 1); assert.equal(f.calls.release, 0); assert.equal(f.ctx.retired, false);
  f.ctx.valid = false; pending.resolve(undefined); await rejects(work, 'UNAVAILABLE');
  assert.equal(f.calls.close, 1); assert.equal(f.calls.release, 1); assert.equal(f.owner.getState().busy, false);
});

test('abort before admission yields no lease, reader, PNG, or resize', async () => {
  const abort = new AbortController(); abort.abort(); const f = fixture();
  await rejects(f.capture({}, { signal: abort.signal }), 'NOT_APPROVED');
  assert.equal(f.calls.active, 0); assert.equal(f.calls.begin, 0); assert.equal(f.calls.capture, 0); assert.equal(f.calls.resize, 0);
});


test('capability accessors are never executed as native admission evidence', async () => {
  let reads = 0, closes = 0, captures = 0;
  const capabilities = { get viewportScreenshot() { reads++; return true; }, act: false, open: false };
  const f = fixture({ create: () => Object.freeze({ capabilities,
    close() { closes++; }, capture() { captures++; return { data_base64: PNG }; } }) });
  await rejects(f.capture(), 'UNAVAILABLE'); assert.equal(reads, 0); assert.equal(captures, 0); assert.equal(closes, 1);
});


test('revocation in checkpoint promise reaction prevents invoking terminal commit', async () => {
  let checksAfterClose = 0, commits = 0;
  const f = fixture({ active: ctx => {
    if (ctx.calls.close === 1 && ctx.calls.release === 0 && ++checksAfterClose === 2) {
      queueMicrotask(() => { ctx.active = false; });
    }
    return ctx.active;
  }, release: (ctx, _request, options) => {
    if (options.commit) commits++;
    ctx.retired = true; return true;
  } });
  await rejects(f.capture(), 'NOT_APPROVED'); assert.equal(commits, 0); assert.equal(f.calls.release, 1);
});
