import test from 'node:test';
import assert from 'node:assert/strict';
import { CEFEngineAdapter, CEFHostConnection, CEF_VERSION, CHROMIUM_VERSION, BLANK_IDENTITY,
  fitCEFRenderSurface, validateSurface, validateCEFInput, surfaceFrameRate, engineSurfaceService } from '../chrome/CEFEngineAdapter.sys.mjs';
import { CEFPresenter, wheelPhase } from '../chrome/CEFPresenter.sys.mjs';

// Surface-mode (engine-surface-v1) protocol fixtures with a fake nsIAxioEngineSurfaceService.
// They exercise chrome JS only: no IOSurface, Mach port or Chromium frame exists here, so
// nothing in this file is rendering, E1/E2 or screenshot evidence.
const token = 'cd'.repeat(32);
const timers = { setTimeout, clearTimeout };
const tick = () => new Promise(resolve => setImmediate(resolve));
const settle = async () => { for (let i = 0; i < 8; i++) await tick(); };
function packet(kind, metadata, pixels = new Uint8Array(0)) {
  const text = new TextEncoder().encode(JSON.stringify(metadata)), data = new Uint8Array(16 + text.length + pixels.length);
  const view = new DataView(data.buffer); view.setUint32(0, 0x41584346); view.setUint16(4, 1); view.setUint16(6, kind);
  view.setUint32(8, text.length); view.setUint32(12, pixels.length); data.set(text, 16); data.set(pixels, 16 + text.length);
  return data;
}
class Pipe {
  chunks = new Uint8Array(); pending = []; closed = false;
  read(n) { return new Promise((resolve, reject) => { this.pending.push({ n, resolve, reject }); this.flush(); }); }
  push(bytes) { const joined = new Uint8Array(this.chunks.length + bytes.length); joined.set(this.chunks); joined.set(bytes, this.chunks.length); this.chunks = joined; this.flush(); }
  flush() {
    while (this.pending.length) {
      const next = this.pending[0];
      if (this.chunks.length < next.n) { if (this.closed) { this.pending.shift(); next.reject(new Error('EOF')); continue; } return; }
      this.pending.shift(); const result = this.chunks.slice(0, next.n); this.chunks = this.chunks.slice(next.n); next.resolve(result.buffer);
    }
  }
  close() { this.closed = true; this.flush(); }
}

/** A fake engine-view component: records every call in order. */
function fakeComponent({ refreshRate = 120 } = {}) {
  const calls = [];
  let tokens = 0, ticket = 0;
  const endpoint = {
    serviceName: `dev.axiosozo.surface.${'a1'.repeat(16)}`, externalBeginFrames: true, listener: null,
    expectHostPid(pid) { calls.push(['expectHostPid', pid]); },
    takeToken() { if (tokens++) throw new Error('NS_ERROR_NOT_AVAILABLE'); calls.push(['takeToken']); return 'ef'.repeat(32); },
    bindElement(element, id, doc, nav) { calls.push(['bind', element, id, doc, nav]); },
    setTargetGenerations(id, doc, nav) { calls.push(['generations', id, doc, nav]); },
    setTargetVisible(id, visible) { calls.push(['visible', id, visible]); },
    unbindTarget(id) { calls.push(['unbind', id]); },
    getTargetStats(id) { return { presented: 7, composited: 7, released: 6, forcedReleases: 0, id }; },
    close() { calls.push(['close']); },
  };
  const service = {
    displayRefreshRate: refreshRate,
    createEndpoint(beginFrames) { calls.push(['createEndpoint', beginFrames]); return endpoint; },
    reserved: new Set(), native: new Map(), finished: [], cursors: [],
    setCursor(element, cursor) { if (/url\(/u.test(cursor)) throw new Error('NS_ERROR_INVALID_ARG'); this.cursors.push([element, cursor]); },
    describeNativeEvent(event) { return this.native.get(event) ?? null; },
    holdKeyEvent(event) { return this.reserved.has(event.key) || event.reply ? 0 : ++ticket; },
    finishKeyEvent(id, consumed, target) { this.finished.push([id, consumed, target]); },
  };
  return { endpoint, service, calls };
}

const surfaceReady = (overrides = {}) => ({ fixture_only: false, devtools: false, private_mode: false, ime: false, edit: true,
  visibility: true, permissions: false, downloads: false, popups: false, accessibility: false, multi_target: true, stop: true,
  cursor: true, persistent_profile: true, open_in_tab: true, surface: true, external_begin_frame: true, frame_rate: 120, ...overrides });

/** A shared web host in surface mode: JSON events only on the pipe, frames over (fake) Mach. */
function surfaceHost({ component = fakeComponent(), renderPath = 'native-osr-iosurface', capabilities = {}, resize = 'success',
  create = 'success', frameRate = 120 } = {}) {
  const pipe = new Pipe(), writes = [], targets = new Map();
  let finished, nativeId = 1;
  const exit = new Promise(resolve => { finished = resolve; });
  const event = value => pipe.push(packet(1, { version: 1, ...value }));
  const process = { pid: 4242, stdout: { read: count => pipe.read(count) }, wait: () => exit,
    kill: async () => { pipe.close(); finished({ exitCode: -9 }); },
    stdin: { close: async () => { pipe.close(); finished({ exitCode: 0 }); }, write: async text => {
      const command = JSON.parse(text); writes.push(command);
      component.calls.push(['write', command.method]);
      if (command.method === 'hello') return event({ event: 'ready', cef: CEF_VERSION, chromium: CHROMIUM_VERSION,
        runtime_cef: CEF_VERSION.split('+')[0], runtime_chromium: CHROMIUM_VERSION, platform: 'macosarm64', sandbox_configured: true,
        engine_instance: 'host-instance', render_path: renderPath, capabilities: surfaceReady({ frame_rate: frameRate, ...capabilities }) });
      if (command.method === 'shutdown') {
        event({ event: 'accepted', request_id: command.request_id });
        event({ event: 'completed', request_id: command.request_id, status: 'success' });
        finished({ exitCode: 0 }); pipe.close(); return;
      }
      const tabId = command.target.tab_id;
      event({ event: 'accepted', request_id: command.request_id });
      if (command.method === 'create') {
        if (create !== 'success') return event({ event: 'completed', request_id: command.request_id, status: 'unsupported', reason: create });
        const target = { ...command.target, engine: 'chromium', native_target_id: String(nativeId++) };
        targets.set(tabId, target);
        event({ event: 'created', request_id: command.request_id, target });
        event({ event: 'completed', request_id: command.request_id, status: 'success' });
        event({ event: 'url', url: command.url, target });
        return event({ event: 'load', http_status: 0, restored_from_history: false, target });
      }
      if (command.method === 'navigate') {
        const target = { ...targets.get(tabId) };
        target.document_generation++; target.navigation_generation++; targets.set(tabId, target);
        event({ event: 'navigation', target }); event({ event: 'url', url: command.url, target });
        event({ event: 'load', http_status: command.url.includes('fail') ? -2 : 200, restored_from_history: false, target });
        return event({ event: 'completed', request_id: command.request_id, status: 'success' });
      }
      if (command.method === 'close') { event({ event: 'closed', target: targets.get(tabId) }); targets.delete(tabId); }
      if (command.method === 'resize' && resize !== 'success') {
        return event({ event: 'completed', request_id: command.request_id, status: 'unsupported', reason: resize });
      }
      if (command.method === 'key' && capabilities.key_verdict) {
        return event({ event: 'completed', request_id: command.request_id, status: 'success',
          reason: command.native_key_code === 0x25 && command.modifiers & 128 ? 'key_not_consumed' : 'key_consumed' });
      }
      event({ event: 'completed', request_id: command.request_id, status: 'success' });
    } } };
  const host = new CEFHostConnection(process, { token, instance: 'host-instance', identity: BLANK_IDENTITY, timers,
    deadline: 1000, browsingMode: 'web', shared: true,
    surface: { endpoint: component.service.createEndpoint(true), service: component.service, frameRate } });
  return { host, writes, targets, event, pipe, process, component, finish: result => finished(result) };
}
const pendingTarget = tabId => ({ tab_id: tabId, engine_instance: 'host-instance', identity: BLANK_IDENTITY,
  document_generation: 1, navigation_generation: 1, private_mode: false });
function attach(host, tabId, element = { tag: 'canvas', tabId }) {
  const seen = { frames: 0, events: [], failures: [], geometry: [] };
  const adapter = new CEFEngineAdapter(host, { pendingTarget: pendingTarget(tabId), element,
    onFrame: () => { seen.frames++; }, onGeometry: value => seen.geometry.push(value),
    onEvent: value => { seen.events.push(value); host.component?.calls.push(['event', value.event]); },
    onFailure: error => seen.failures.push(error.message) });
  return { adapter, seen, element };
}
/** create() resolves only once the endpoint presented a frame of the loaded target. */
async function created(f, tab, geometry = [4, 4, 2, 2, 2]) {
  const creation = tab.adapter.create('about:blank', { width: 2, height: 2, device_scale: 2 });
  await settle();
  const id = Number(f.targets.get(tab.adapter.tabId).native_target_id);
  f.component.endpoint.listener.onTargetGeometry(id, ...geometry);
  await creation;
  return id;
}

test('surface hello: endpoint, pid before token, single-use token, begin frames and display frame rate', async () => {
  const f = surfaceHost(); await f.host.connect();
  const hello = f.writes[0];
  assert.equal(hello.method, 'hello');
  assert.equal(hello.surface_service, f.component.endpoint.serviceName);
  assert.equal(hello.surface_token, 'ef'.repeat(32)); assert.notEqual(hello.surface_token, hello.token);
  assert.equal(hello.surface_begin_frames, true); assert.equal(hello.frame_rate, 120);
  const order = f.component.calls.map(call => call[0]);
  assert.ok(order.indexOf('expectHostPid') < order.indexOf('takeToken'), 'the child pid is registered before the token leaves');
  assert.ok(order.indexOf('takeToken') < order.indexOf('write'), 'the token is only written in the hello');
  assert.deepEqual(f.component.calls.find(call => call[0] === 'expectHostPid'), ['expectHostPid', 4242]);
  assert.equal(f.host.renderPath, 'native-osr-iosurface'); assert.equal(f.host.surfaceMode, true);
  assert.equal(typeof f.component.endpoint.listener.onTargetGeometry, 'function');
  assert.equal(surfaceFrameRate({ displayRefreshRate: 119.88 }), 120); assert.equal(surfaceFrameRate({ displayRefreshRate: 59.94 }), 60);
  assert.equal(surfaceFrameRate(null), 60);
  assert.equal(engineSurfaceService(), null, 'no component in Node: the pipe fallback is selected');
  await f.host.shutdown();
  assert.deepEqual(f.component.calls.at(-1), ['close'], 'shutdown closes the endpoint');
});

test('surface ready must match the negotiated render path, begin frames and frame rate', async () => {
  for (const variant of [{ renderPath: 'native-osr-bgra' }, { frameRate: 60, capabilities: { frame_rate: 120 } },
    { capabilities: { surface: false } }, { capabilities: { external_begin_frame: false } }]) {
    const f = surfaceHost(variant);
    await assert.rejects(f.host.connect(), /UNVERIFIED_CEF_RUNTIME/);
    assert.ok(f.component.calls.some(call => call[0] === 'close'), 'a refused host releases its endpoint');
  }
});

test('surface mode never reads pipe frames nor sends frame_ack; a pipe frame ends the host', async () => {
  const f = surfaceHost(); await f.host.connect();
  const tab = attach(f.host, 'tab-a'); f.host.component = f.component;
  await created(f, tab);
  await assert.rejects(f.host.request('frame_ack', { frame_id: 1 }, tab.adapter.target, { acknowledge: true }), /CEF_SURFACE_FRAME_ACK/);
  f.pipe.push(packet(2, { version: 1, target: tab.adapter.target, frame_id: 1, width: 2, height: 2, stride: 8, device_scale: 1,
    format: 'BGRA8' }, new Uint8Array(16)));
  await settle();
  assert.equal(f.host.status, 'failed'); assert.equal(tab.seen.frames, 0);
  assert.deepEqual(tab.seen.failures, ['UNEXPECTED_CEF_FRAME']);
  assert.equal(f.writes.some(item => item.method === 'frame_ack'), false);
  assert.ok(f.component.calls.some(call => call[0] === 'close'));
});

test('a target binds its canvas at creation; create waits for a presented frame of the loaded page', async () => {
  const f = surfaceHost(); await f.host.connect(); f.host.component = f.component;
  const tab = attach(f.host, 'tab-a');
  let done = false;
  const creation = tab.adapter.create('about:blank', { width: 2, height: 2, device_scale: 2 }).then(() => { done = true; });
  await settle();
  const bind = f.component.calls.find(call => call[0] === 'bind');
  assert.deepEqual(bind, ['bind', tab.element, 1, 1, 1]);
  assert.equal(done, false, 'creation and load alone never commit presentation');
  f.component.endpoint.listener.onTargetGeometry(1, 4, 4, 2, 2, 2);
  await creation;
  assert.deepEqual(tab.seen.geometry, [{ width: 4, height: 4, logicalWidth: 2, logicalHeight: 2, scale: 2 }]);
  assert.equal(tab.adapter.status, 'active'); assert.equal(tab.adapter.renderPath, 'native-osr-iosurface');
  assert.deepEqual(tab.adapter.surfaceStats(), { presented: 7, composited: 7, released: 6, forcedReleases: 0, id: 1 });
  await f.host.shutdown();
});

test('newer generations are confirmed only after chrome processed the navigation and its load', async () => {
  const f = surfaceHost(); await f.host.connect(); f.host.component = f.component;
  const tab = attach(f.host, 'tab-a'); await created(f, tab);
  const before = f.component.calls.length;
  await tab.adapter.navigate(tab.adapter.target, 'https://example.com/'); await settle();
  const after = f.component.calls.slice(before).filter(call => ['event', 'generations'].includes(call[0]));
  assert.deepEqual(after.map(call => call[0] === 'event' ? call[1] : `generations:${call.slice(2).join('/')}`),
    ['navigation', 'url', 'load', 'generations:2/2'],
    'setTargetGenerations follows the url and load events chrome handled');
  // A failed load never releases held frames of its generation.
  await tab.adapter.navigate(tab.adapter.target, 'https://example.com/fail'); await settle();
  assert.equal(f.component.calls.filter(call => call[0] === 'generations').length, 1);
  await f.host.shutdown();
});

test('visibility gates begin frames; closing a tab unbinds only its target', async () => {
  const f = surfaceHost(); await f.host.connect(); f.host.component = f.component;
  const first = attach(f.host, 'tab-a'), second = attach(f.host, 'tab-b');
  await created(f, first); await created(f, second);
  await first.adapter.visibility(first.adapter.target, false);
  assert.deepEqual(f.component.calls.filter(call => call[0] === 'visible'), [['visible', 1, false]]);
  assert.ok(f.writes.some(item => item.method === 'visibility' && item.visible === false));
  await first.adapter.close();
  assert.deepEqual(f.component.calls.filter(call => call[0] === 'unbind'), [['unbind', 1]]);
  assert.equal(second.adapter.status, 'active');
  assert.equal(f.component.calls.some(call => call[0] === 'close'), false, 'the endpoint serves the other tab');
  await f.host.shutdown();
});

test('a host crash or an endpoint failure tears down the endpoint and every Chromium target', async () => {
  const crash = surfaceHost(); await crash.host.connect(); crash.host.component = crash.component;
  const tab = attach(crash.host, 'tab-a'); await created(crash, tab);
  crash.finish({ exitCode: -9 }); await settle();
  assert.equal(crash.host.status, 'failed'); assert.deepEqual(tab.seen.failures, ['CEF_CRASH_OUTCOME_UNCERTAIN']);
  assert.equal(crash.component.calls.filter(call => call[0] === 'close').length, 1);
  crash.component.endpoint.listener.onClosed('host-died'); await settle();
  assert.equal(crash.component.calls.filter(call => call[0] === 'close').length, 1, 'closed once');

  const broken = surfaceHost(); await broken.host.connect(); broken.host.component = broken.component;
  const other = attach(broken.host, 'tab-a'); await created(broken, other);
  broken.component.endpoint.listener.onClosed('protocol:bad-frame'); await settle();
  assert.equal(broken.host.status, 'failed'); assert.deepEqual(other.seen.failures, ['CEF_SURFACE_CLOSED']);
  assert.equal(broken.host.surfaceClosedReason, 'protocol:bad-frame');
});

test('host death is immediate: dead-name or exit fails in-flight work at once, even if the process never exits', async () => {
  // engine-view fires onClosed("host-died") from the Mach dead-name notification
  // on the host's reply port; Subprocess reports the exit. Either must end every
  // Chromium tab without waiting for the CEF action deadline, and must not
  // depend on the process actually exiting (a parked, faulting host).
  for (const trigger of ['dead-name', 'exit']) {
    const f = surfaceHost(); await f.host.connect(); f.host.component = f.component;
    const tab = attach(f.host, 'tab-a'); await created(f, tab);
    let kills = 0;
    f.process.kill = async () => { kills++; };            // hung: SIGTERM ignored, never exits
    f.process.stdin.write = async () => {};               // the host never answers again
    const pending = tab.adapter.navigate(tab.adapter.target, 'https://example.test/next');
    const outcome = pending.then(() => 'resolved', error => error.message);
    const started = performance.now();
    if (trigger === 'dead-name') f.component.endpoint.listener.onClosed('host-died');
    else f.finish({ exitCode: 139 });
    await settle();
    const elapsed = performance.now() - started;
    const expected = trigger === 'dead-name' ? 'CEF_SURFACE_CLOSED' : 'CEF_CRASH_OUTCOME_UNCERTAIN';
    assert.equal(f.host.status, 'failed', trigger);
    assert.deepEqual(tab.seen.failures, [expected], trigger);
    assert.equal(await outcome, expected, `${trigger}: the in-flight navigation rejects with the crash, not a timeout`);
    assert.ok(elapsed < 200, `${trigger}: failure after ${elapsed.toFixed(1)} ms, well under the 1000 ms action deadline`);
    // After dead-name the native endpoint is already CLOSED; after an exit JS closes it once.
    assert.equal(f.component.calls.filter(call => call[0] === 'close').length, trigger === 'exit' ? 1 : 0, trigger);
    if (trigger === 'dead-name') assert.equal(kills, 1, 'the (possibly parked) process is killed, not awaited');
    assert.equal(f.host.surfaceStats(1), null, `${trigger}: no stats from a closed endpoint`);
    // A late second signal (exit after dead-name, or the reverse) changes nothing.
    if (trigger === 'dead-name') f.finish({ exitCode: -9 }); else f.component.endpoint.listener.onClosed('host-died');
    await settle();
    assert.deepEqual(tab.seen.failures, [expected], `${trigger}: reported once`);
  }
});

test('frame_rate: 60 or 120 for the resolved target, sent only when the host announces frame_rate_command', async () => {
  const f = surfaceHost({ capabilities: { frame_rate_command: true } }); await f.host.connect(); f.host.component = f.component;
  const tab = attach(f.host, 'tab-a'); await created(f, tab);
  assert.equal(tab.adapter.appliedFrameRate, 120, 'a new target runs at the hello rate');
  assert.equal(tab.adapter.displayFrameRate, 120);
  f.component.service.displayRefreshRate = 59.94;
  assert.equal(tab.adapter.displayFrameRate, 60, 'the same vsync source as the hello');
  for (const invalid of [90, 0, '60', 120.5, null, undefined]) {
    assert.throws(() => tab.adapter.frameRate(tab.adapter.target, invalid), /INVALID_FRAME_RATE/);
  }
  assert.throws(() => tab.adapter.frameRate({ ...tab.adapter.target, document_generation: 0 }, 60), /STALE_CEF_TARGET/);
  assert.equal(f.writes.some(item => item.method === 'frame_rate'), false, 'rejected values never reach the host');
  assert.equal((await tab.adapter.frameRate(tab.adapter.target, 60)).status, 'success');
  const sent = f.writes.filter(item => item.method === 'frame_rate');
  assert.equal(sent.length, 1); assert.equal(sent[0].frame_rate, 60); assert.deepEqual(sent[0].target, tab.adapter.target);
  assert.equal(tab.adapter.appliedFrameRate, 60);
  await f.host.shutdown();

  const old = surfaceHost(); await old.host.connect(); old.host.component = old.component;
  const legacy = attach(old.host, 'tab-a'); await created(old, legacy);
  assert.deepEqual(await legacy.adapter.frameRate(legacy.adapter.target, 60), { status: 'unsupported', reason: 'FRAME_RATE_UNSUPPORTED' });
  assert.equal(old.writes.some(item => item.method === 'frame_rate'), false);
  assert.equal(legacy.adapter.appliedFrameRate, 120);
  await old.host.shutdown();
});

test('surface mode drops the 32 MiB pipe cap but keeps the 4096 px IOSurface bound', async () => {
  const retina = { width: 2560, height: 1440, device_scale: 2 };
  assert.deepEqual(fitCEFRenderSurface(retina, { maxBytes: Infinity }), { width: 2560, height: 1440, device_scale: 1.5 });
  assert.deepEqual(fitCEFRenderSurface({ width: 2000, height: 1200, device_scale: 2 }, { maxBytes: Infinity }),
    { width: 2000, height: 1200, device_scale: 2 }, '4000×2400 px, 38 MiB: over the pipe cap, fine as a surface');
  assert.deepEqual(fitCEFRenderSurface({ width: 2000, height: 1200, device_scale: 2 }), { width: 2000, height: 1200, device_scale: 1.75 });
  assert.throws(() => validateSurface({ width: 2049, height: 10, device_scale: 2 }, { maxBytes: Infinity }), /UNSUPPORTED_SURFACE/);
  const f = surfaceHost(); await f.host.connect(); f.host.component = f.component;
  const tab = attach(f.host, 'tab-a'); await created(f, tab);
  assert.equal((await tab.adapter.resize(tab.adapter.target, { width: 2000, height: 1200, device_scale: 2 })).status, 'success');
  assert.deepEqual(tab.adapter.surface, { width: 2000, height: 1200, device_scale: 2 });
  await f.host.shutdown();
});

test('surface-mode input extensions are only sent when the host announces them', () => {
  const surface = { width: 100, height: 100 };
  const wheel = { x: 1, y: 1, modifiers: 0, delta_x: 3, delta_y: -4 };
  assert.deepEqual(validateCEFInput('wheel', wheel, surface), wheel);
  assert.throws(() => validateCEFInput('wheel', { ...wheel, phase: 'began', momentum_phase: 'none', precise: true }, surface), /INVALID_CEF_INPUT/);
  assert.ok(validateCEFInput('wheel', { ...wheel, phase: 'began', momentum_phase: 'none', precise: true }, surface, { wheelPhases: true }));
  assert.throws(() => validateCEFInput('wheel', { ...wheel, phase: 'sideways', momentum_phase: 'none', precise: true }, surface, { wheelPhases: true }));
  assert.throws(() => validateCEFInput('pinch', { x: 1, y: 1, modifiers: 0, phase: 'changed', magnification: 0.1 }, surface), /INVALID_CEF_INPUT/);
  assert.ok(validateCEFInput('pinch', { x: 1, y: 1, modifiers: 0, phase: 'changed', magnification: 0.1 }, surface, { pinch: true }));
  assert.throws(() => validateCEFInput('ime_commit_text', { text: 'あ' }, surface), /INVALID_CEF_IME/);
  assert.ok(validateCEFInput('ime_commit_text', { text: 'あ' }, surface, { ime: true }));
  assert.throws(() => validateCEFInput('ime_set_composition', { text: 'ab', selection_start: 0, selection_end: 3 }, surface, { ime: true }));
  assert.equal(wheelPhase('mayBegin'), 'may_begin'); assert.equal(wheelPhase('bogus'), 'none');
});

test('host cursors are CSS keywords only; text_input needs the ime capability', async () => {
  const f = surfaceHost(); await f.host.connect(); f.host.component = f.component;
  const first = attach(f.host, 'tab-a'), second = attach(f.host, 'tab-b');
  await created(f, first); await created(f, second);
  f.event({ event: 'cursor', cursor: 'url(https://evil.example/x.png), auto', target: f.targets.get('tab-a') }); await settle();
  assert.deepEqual(first.seen.failures, ['INVALID_CEF_CURSOR']);
  f.event({ event: 'text_input', mode: 'text', caret_x: 1, caret_y: 1, caret_width: 1, caret_height: 12, target: f.targets.get('tab-b') }); await settle();
  assert.deepEqual(second.seen.failures, ['INVALID_CEF_TEXT_INPUT']);
  assert.equal(f.host.status, 'connected');
});

/* ---- Presenter with a fake component ------------------------------------------------- */

function element(doc, tag = 'div') {
  const node = { tag, style: {}, children: [], listeners: [], attributes: new Map(), hidden: false, isConnected: true, width: 300, height: 150,
    setAttribute(key, value) { this.attributes.set(key, value); }, removeAttribute(key) { this.attributes.delete(key); },
    getAttribute(key) { return this.attributes.get(key) ?? null; }, hasAttribute(key) { return this.attributes.has(key); },
    toggleAttribute(key, value) { if (value) this.attributes.set(key, ''); else this.attributes.delete(key); },
    appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); this.isConnected = false; },
    addEventListener(type, handler, options) { this.listeners.push({ type, handler, options }); },
    removeEventListener(type, handler) { this.listeners = this.listeners.filter(item => item.type !== type || item.handler !== handler); },
    fire(type, event) { for (const item of this.listeners.filter(entry => entry.type === type)) item.handler(event); },
    focus() { doc.focus(this); }, hasPointerCapture: () => false, setPointerCapture() {}, releasePointerCapture() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }) };
  return node;
}
function surfaceWindow({ features = {}, component = fakeComponent() } = {}) {
  const listeners = new Map(), windowListeners = new Map(), frames = [];
  const doc = { hidden: false, activeElement: null, documentElement: null,
    focus(node) { const previous = this.activeElement; this.activeElement = node; if (previous !== node) this.focusLog.push(node); },
    focusLog: [], createElementNS: (_ns, tag) => element(doc, tag),
    addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type) };
  doc.documentElement = element(doc, 'html');
  const stack = { ...element(doc), classList: { contains: value => value === 'browserStack' } };
  const browser = { style: { visibility: '' }, parentNode: stack, currentURI: { spec: 'https://example.com/start' },
    getBoundingClientRect: () => ({ width: 800, height: 600 }), loads: [], loadURI(uri) { this.loads.push(uri.spec); },
    browsingContext: { activeSessionHistoryEntry: { URI: { spec: 'https://example.com/start' }, postData: null } } };
  stack.appendChild(browser);
  const tab = { ...element(doc), id: 'first', linkedBrowser: browser, label: 'first', isConnected: true };
  const win = {
    Services: { env: { get: () => '' }, io: { newURI: spec => ({ spec }) }, scriptSecurityManager: { getSystemPrincipal: () => ({}) } },
    performance, devicePixelRatio: 2, queueMicrotask, setTimeout, clearTimeout, document: doc,
    addEventListener: (type, fn) => windowListeners.set(type, fn), removeEventListener: type => windowListeners.delete(type),
    ResizeObserver: class { observe() {} disconnect() {} }, getComputedStyle: () => ({ position: 'static' }),
    // One animation frame per test step: callbacks run when the test calls frame().
    requestAnimationFrame: callback => frames.push(callback),
    gBrowser: { selectedTab: tab, get selectedBrowser() { return this.selectedTab.linkedBrowser; }, tabs: [tab],
      tabContainer: { addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type) },
      updateTitlebar() {}, setTabTitle() {} },
    SessionStore: { getCustomTabValue: () => '', setCustomTabValue() {}, deleteCustomTabValue() {} },
    BrowserUtils: { whereToOpenLink: () => 'current' },
    BrowserCommands: { back() {}, forward() {}, reload() {}, reloadSkipCache() {}, stop() {} },
    UpdateBackForwardCommands() {}, openTrustedLinkIn() {},
    gURLBar: { focused: false, setURI() {}, view: { close() {} } },
  };
  const gecko = { find: found => ({ browser: found }), target: () => ({ tab_id: 'gecko-first', engine: 'gecko', engine_instance: 'gecko',
    identity: 'https://example.com', private_mode: false }), resolve() {} };
  const inputs = [], sent = [];
  let adapter;
  const launch = async (_win, callbacks) => {
    adapter = { target: { tab_id: callbacks.tabId, engine: 'chromium', native_target_id: '1' }, surface: null,
      surfaceMode: true, renderPath: 'native-osr-iosurface', nativeInput: component.service,
      inputFeatures: Object.freeze({ keyVerdict: false, wheelPhases: false, pinch: false, ime: false, ...features }),
      callbacks, allowedURL: url => /^https?:|^about:blank$/u.test(url), surfaceStats: () => ({ presented: 7 }),
      async create(_url, surface) {
        this.surface = surface; sent.push(['create', surface]);
        callbacks.onGeometry({ width: surface.width * 2, height: surface.height * 2, logicalWidth: surface.width, logicalHeight: surface.height, scale: 2 });
        return this.target;
      },
      async navigate(_t, url) { sent.push(['navigate', url]); return { status: 'success' }; },
      async resize(_t, surface) { sent.push(['resize', surface]); this.surface = surface; return { status: 'success' }; },
      async visibility(_t, visible) { sent.push(['visibility', visible]); return { status: 'success' }; },
      appliedFrameRate: 120, get displayFrameRate() { return surfaceFrameRate(component.service); },
      async frameRate(_t, rate) { sent.push(['frame_rate', rate]); this.appliedFrameRate = rate; return { status: 'success' }; },
      async focus(_t, focused) { sent.push(['focus', focused]); return { status: 'success' }; },
      async edit(_t, action) { sent.push(['edit', action]); return { status: 'success' }; },
      input(_t, method, fields) {
        inputs.push({ method, fields });
        const notConsumed = method === 'key' && this.inputFeatures.keyVerdict && fields.type === 'down' && fields.native_key_code === 0x25 && fields.modifiers & 128;
        return Promise.resolve({ status: 'success', reason: method === 'key' && this.inputFeatures.keyVerdict ? (notConsumed ? 'key_not_consumed' : 'key_consumed') : undefined });
      },
      async close() { sent.push(['close']); } };
    return adapter;
  };
  const frame = () => { for (const callback of frames.splice(0)) callback(); };
  return { win, doc, gecko, launch, tab, browser, component, inputs, sent, frame, listeners, windowListeners,
    get adapter() { return adapter; } };
}
const key = (type, init) => ({ type, isTrusted: true, key: 'a', code: 'KeyA', keyCode: 65, metaKey: false, ctrlKey: false,
  altKey: false, shiftKey: false, buttons: 0, stopped: false, prevented: false, target: null,
  stopPropagation() { this.stopped = true; }, preventDefault() { this.prevented = true; }, getModifierState: () => false, ...init });
const fireKey = (record, event) => { record.overlay.fire(event.type, event); return event; };
async function surfacePresenter(options) {
  const z = surfaceWindow(options);
  const presenter = new CEFPresenter(z.win, z.gecko, { launch: z.launch, browsingMode: 'web' });
  await presenter.switchToChromium(z.tab); await settle();
  return { z, presenter, record: presenter.active };
}

test('the presenter binds a context-less canvas, sizes it logically and never draws pixels', async () => {
  const { z, presenter, record } = await surfacePresenter();
  assert.equal(record.surfaceMode, true);
  assert.ok(record.canvas.hasAttribute('moz-opaque'));
  assert.equal(record.canvas.style.objectFit, 'none'); assert.equal(record.canvas.style.objectPosition, '0 0');
  assert.equal(record.canvas.getContext, undefined, 'no rendering context is ever requested');
  assert.equal(record.canvas.width, 800); assert.equal(record.canvas.height, 600);
  assert.deepEqual(z.sent[0], ['create', { width: 800, height: 600, device_scale: 2 }], 'full Retina, no pipe cap');
  const diagnostics = presenter.diagnostics();
  assert.equal(diagnostics.renderPath, 'native-osr-iosurface'); assert.equal(diagnostics.pipeFallback, false);
  assert.equal(diagnostics.frames, 7);
  assert.throws(() => presenter.captureFixtureFrame(), /CEF_SURFACE_CAPTURE_UNAVAILABLE/);
  assert.ok(z.sent.some(call => call[0] === 'visibility' && call[1] === true), 'the visible tab receives begin frames');
  await presenter.dispose();
});

test('resize follows the window without the pipe cap; a host that still caps is handled once', async () => {
  const { z, presenter, record } = await surfacePresenter();
  z.browser.getBoundingClientRect = () => ({ width: 2000, height: 1200 });
  // The ResizeObserver is inert here; tab selection runs the same resize path.
  presenter.onTabSelect(); await settle(); z.frame(); await settle();
  assert.deepEqual(z.sent.filter(call => call[0] === 'resize').at(-1), ['resize', { width: 2000, height: 1200, device_scale: 2 }]);
  assert.equal(presenter.diagnostics().renderScaleLimited, false);
  // A pinned host answers surface_limit: step down to the pipe bound instead of failing the tab.
  z.adapter.resize = async function(_t, surface) {
    z.sent.push(['resize', surface]);
    if (surface.width * surface.device_scale * surface.height * surface.device_scale * 4 > 33554432) return { status: 'unsupported', reason: 'surface_limit' };
    this.surface = surface; return { status: 'success' };
  };
  z.browser.getBoundingClientRect = () => ({ width: 2040, height: 1250 }); // 4080×2500 px: 40.8 MB
  presenter.onTabSelect(); await settle(); z.frame(); await settle();
  assert.deepEqual(z.sent.filter(call => call[0] === 'resize').slice(-2).map(call => call[1].device_scale), [2, 1.75]);
  assert.equal(presenter.diagnostics().renderScaleLimited, true); assert.equal(presenter.diagnostics().engine, 'chromium');
  await presenter.dispose();
});

test('the visible Chromium tab follows its display refresh class; unchanged or hidden tabs send nothing', async () => {
  const { z, presenter } = await surfacePresenter();
  const rates = () => z.sent.filter(call => call[0] === 'frame_rate').map(call => call[1]);
  assert.deepEqual(rates(), [], 'the hello rate already matches the display');
  for (const type of ['resize', 'sizemodechange', 'activate']) assert.equal(typeof z.windowListeners.get(type), 'function');
  z.component.service.displayRefreshRate = 60;
  z.windowListeners.get('resize')(); await settle();
  assert.deepEqual(rates(), [60], 'moved to a 60 Hz display');
  z.windowListeners.get('resize')(); z.windowListeners.get('activate')(); presenter.onTabSelect(); await settle();
  assert.deepEqual(rates(), [60], 'no change, no command');
  // A hidden window's target is not sent a rate; it catches up when shown.
  z.doc.hidden = true; z.listeners.get('visibilitychange')(); await settle();
  z.component.service.displayRefreshRate = 120;
  z.windowListeners.get('sizemodechange')(); await settle();
  assert.deepEqual(rates(), [60]);
  z.doc.hidden = false; z.listeners.get('visibilitychange')(); await settle();
  assert.deepEqual(rates(), [60, 120]);
  // A failed or unsupported command is not retried in a loop and leaves the rate unapplied.
  z.adapter.frameRate = async function(_t, rate) { z.sent.push(['frame_rate', rate]); return { status: 'unsupported', reason: 'FRAME_RATE_UNSUPPORTED' }; };
  z.component.service.displayRefreshRate = 60;
  z.windowListeners.get('resize')(); await settle();
  assert.deepEqual(rates(), [60, 120, 60]);
  await presenter.dispose();
  assert.equal(z.windowListeners.size, 0, 'dispose removes the display listeners');
});

test('keys follow the remote-tab model: reserved keys stay with Zen, unconsumed keys return to Zen', async () => {
  const { z, presenter, record } = await surfacePresenter({ features: { keyVerdict: true } });
  const service = z.component.service;
  service.reserved.add('t');
  // Listeners sit in the system group, capture phase, on the engine view.
  const keyListeners = record.overlay.listeners.filter(item => item.type.startsWith('key'));
  assert.deepEqual(keyListeners.map(item => [item.type, item.options]), ['keydown', 'keypress', 'keyup']
    .map(type => [type, { capture: true, mozSystemGroup: true }]));
  // ⌘T is reserved by chrome: untouched, never sent to the page.
  const reserved = fireKey(record, key('keydown', { key: 't', code: 'KeyT', keyCode: 84, metaKey: true }));
  assert.equal(reserved.stopped, false); assert.equal(z.inputs.length, 0);
  // ⌘L: the page gets first refusal, then keydown and keypress return to Zen as replies.
  const down = fireKey(record, key('keydown', { key: 'l', code: 'KeyL', keyCode: 76, metaKey: true }));
  const press = fireKey(record, key('keypress', { key: 'l', code: 'KeyL', keyCode: 0, metaKey: true }));
  assert.equal(down.stopped, true); assert.equal(down.prevented, false, 'keydown stays IME-capable');
  assert.equal(press.prevented, true);
  await settle(); await new Promise(resolve => setTimeout(resolve, 5));
  assert.deepEqual(z.inputs.map(item => [item.fields.type, item.fields.native_key_code]), [['down', 0x25]], 'no char for a ⌘ chord');
  assert.deepEqual(service.finished.map(([, consumed, target]) => [consumed, target === record.canvas]), [[false, true], [false, true]]);
  // A plain letter is consumed by the page: its ticket is only released.
  service.finished.length = 0; z.inputs.length = 0;
  service.native.set(fireKey(record, key('keydown', {})), null);
  fireKey(record, key('keypress', { keyCode: 0 }));
  fireKey(record, key('keyup', {}));
  await settle();
  assert.deepEqual(z.inputs.map(item => [item.fields.type, item.fields.text]), [['down', 'a'], ['char', 'a'], ['up', 'a']]);
  assert.deepEqual(service.finished.map(item => item[1]), [true, true, true]);
  // Composition keys belong to the IME: never held or forwarded.
  const composing = fireKey(record, key('keydown', { key: 'Process', keyCode: 229, isComposing: true }));
  assert.equal(composing.stopped, false);
  await presenter.dispose();
});

test('without host key verdicts the fixed heuristic keeps Zen shortcuts in chrome; edit chords map to edit commands', async () => {
  const { z, presenter, record } = await surfacePresenter();
  const service = z.component.service;
  const shortcut = fireKey(record, key('keydown', { key: 'l', code: 'KeyL', keyCode: 76, metaKey: true }));
  assert.equal(shortcut.stopped, false, '⌘L proceeds to Zen untouched');
  const paste = key('keydown', { key: 'v', code: 'KeyV', keyCode: 86, metaKey: true });
  fireKey(record, paste); await settle();
  assert.equal(paste.stopped, true); assert.deepEqual(z.sent.filter(call => call[0] === 'edit'), [['edit', 'paste']]);
  // Native keyCodes from the component reach keys the static table lacks (e.g. ISO §).
  const iso = key('keydown', { key: '§', code: 'IntlBackslash', keyCode: 0 });
  service.native.set(iso, { kind: 'key', keyCode: 0x0a });
  fireKey(record, iso); await settle();
  assert.equal(z.inputs.at(-1).fields.native_key_code, 0x0a);
  assert.ok(service.finished.every(item => item[1] === true));
  await presenter.dispose();
});

test('focus returns to the page when Zen focuses the tab browser (urlbar close, tab switch)', async () => {
  const { z, presenter, record } = await surfacePresenter();
  z.doc.activeElement = null;
  z.browser.focus(); // what the urlbar calls on Escape and on close
  assert.equal(z.doc.activeElement, record.canvas);
  record.overlay.fire('focusin', { target: record.canvas });
  record.overlay.fire('focusout', { target: record.canvas, relatedTarget: null });
  await settle();
  assert.deepEqual(z.sent.filter(call => call[0] === 'focus').map(call => call[1]), [true, false]);
  await presenter.switchToGecko();
  assert.equal(Object.hasOwn(z.browser, 'focus'), false, 'the Gecko browser gets its own focus() back');
  await presenter.dispose();
});

test('page focus is restated for each new document (a focus that crossed the navigation was stale)', async () => {
  // E1 2026-09-30: a new tab's first focus races its initial navigation and the
  // host rejects it (STALE_CEF_TARGET); one sent as a navigation starts reaches
  // the old document. Chromium then never focused page elements.
  const { z, presenter, record } = await surfacePresenter();
  let stale = true;
  z.adapter.focus = async (_t, focused) => { z.sent.push(['focus', focused]); if (stale) throw new Error('STALE_CEF_TARGET'); return { status: 'success' }; };
  record.overlay.fire('focusin', { target: record.canvas }); await settle();
  assert.deepEqual(z.sent.filter(call => call[0] === 'focus'), [['focus', true]]);
  stale = false;
  record.adapter.callbacks.onEvent({ event: 'navigation' }); await settle();
  assert.equal(z.sent.filter(call => call[0] === 'focus').length, 1, 'nothing is sent while the navigation starts');
  record.adapter.callbacks.onEvent({ event: 'load', http_status: 200, restored_from_history: false }); await settle();
  assert.deepEqual(z.sent.filter(call => call[0] === 'focus'), [['focus', true], ['focus', true]]);
  // A page without focus is not focused by a load.
  record.overlay.fire('focusout', { target: record.canvas, relatedTarget: null }); await settle();
  record.adapter.callbacks.onEvent({ event: 'load', http_status: 200, restored_from_history: false }); await settle();
  assert.deepEqual(z.sent.filter(call => call[0] === 'focus').map(call => call[1]), [true, true, false]);
  await presenter.dispose();
});

test('IME: a focused page editable moves focus to the proxy editor and composition reaches the host', async () => {
  const { z, presenter, record } = await surfacePresenter({ features: { ime: true } });
  record.canvas.focus();
  record.adapter.callbacks.onEvent({ event: 'text_input', mode: 'text', caret_x: 40, caret_y: 30, caret_width: 1, caret_height: 18 });
  const proxy = record.ime.text;
  assert.equal(proxy.tag, 'textarea'); assert.equal(z.doc.activeElement, proxy);
  assert.equal(proxy.getAttribute('aria-hidden'), 'true');
  assert.equal(proxy.style.left, '40px'); assert.equal(proxy.style.top, '30px'); assert.equal(proxy.style.fontSize, '18px');
  // Moving focus between the view and its proxy is not a page blur.
  record.overlay.fire('focusout', { target: record.canvas, relatedTarget: proxy });
  assert.equal(z.sent.some(call => call[0] === 'focus' && call[1] === false), false);
  proxy.fire('compositionstart', { data: '' });
  proxy.fire('compositionupdate', { data: 'にほ' });
  proxy.fire('compositionupdate', { data: 'にほん' });
  proxy.fire('compositionend', { data: '日本' });
  proxy.value = '日本'; proxy.fire('input', { isComposing: false, inputType: 'insertCompositionText', data: '日本' });
  await settle();
  assert.deepEqual(z.inputs.map(item => [item.method, item.fields.text]), [['ime_set_composition', 'にほ'],
    ['ime_set_composition', 'にほん'], ['ime_commit_text', '日本']]);
  assert.equal(proxy.value, '', 'the proxy is cleared after commit');
  // Dictation or the character viewer insert text without keys.
  proxy.fire('input', { isComposing: false, inputType: 'insertText', data: '😀' }); await settle();
  assert.deepEqual(z.inputs.at(-1), { method: 'ime_commit_text', fields: { text: '😀' } });
  // Password fields use a password input so macOS secure input turns on.
  record.adapter.callbacks.onEvent({ event: 'text_input', mode: 'password', caret_x: 5, caret_y: 5, caret_width: 1, caret_height: 14 });
  assert.equal(z.doc.activeElement, record.ime.password); assert.equal(record.ime.password.getAttribute('type'), 'password');
  presenter.focus(); assert.equal(z.doc.activeElement, record.ime.password, 'page focus keeps the editable');
  record.adapter.callbacks.onEvent({ event: 'text_input', mode: 'none', caret_x: 0, caret_y: 0, caret_width: 0, caret_height: 0 });
  assert.equal(z.doc.activeElement, record.canvas);
  await presenter.dispose();
});

test('wheel deltas are summed per frame; native precise deltas, phases and pinch are used when available', async () => {
  const wheel = init => ({ isTrusted: true, clientX: 10, clientY: 20, deltaMode: 0, deltaX: 0, deltaY: 0, buttons: 0,
    getModifierState: () => false, preventDefault() { this.prevented = true; }, ...init });
  const plain = await surfacePresenter();
  for (const deltaY of [10, 12.5, 7.6]) plain.record.canvas.fire('wheel', wheel({ deltaY }));
  assert.equal(plain.z.inputs.length, 0, 'nothing is sent before the frame');
  plain.z.frame(); await settle();
  assert.deepEqual(plain.z.inputs, [{ method: 'wheel', fields: { x: 10, y: 20, modifiers: 0, delta_x: 0, delta_y: -30 } }]);
  await plain.presenter.dispose();

  const rich = await surfacePresenter({ features: { wheelPhases: true, pinch: true } });
  const service = rich.z.component.service;
  const native = (init, detail) => { const event = wheel(init); service.native.set(event, { kind: 'wheel', ...detail }); return event; };
  const scroll = (phase, dy) => native({ deltaY: -dy * 3 }, { native: 'scroll', phase, momentumPhase: 'none', scrollingDeltaX: 0, scrollingDeltaY: dy, precise: true });
  rich.record.canvas.fire('wheel', scroll('began', 2));
  rich.record.canvas.fire('wheel', scroll('changed', 4));
  rich.record.canvas.fire('wheel', scroll('changed', 5));
  rich.record.canvas.fire('wheel', native({ deltaY: 3, ctrlKey: true }, { native: 'magnify', phase: 'changed', magnification: 0.05 }));
  rich.record.canvas.fire('wheel', native({ deltaY: 3, ctrlKey: true }, { native: 'magnify', phase: 'changed', magnification: 0.07 }));
  rich.z.frame(); await settle();
  assert.deepEqual(rich.z.inputs.map(item => [item.method, item.fields.phase, item.fields.delta_y ?? item.fields.magnification]),
    [['wheel', 'began', 2], ['wheel', 'changed', 9], ['pinch', 'changed', 0.05 + 0.07]]);
  assert.equal(rich.z.inputs[0].fields.precise, true); assert.equal(rich.z.inputs[0].fields.momentum_phase, 'none');
  await rich.presenter.dispose();
});

test('native click counts and host cursors use the component; a button flushes pending scroll first', async () => {
  const { z, presenter, record } = await surfacePresenter();
  const service = z.component.service;
  const pointer = (type, init) => ({ type, isTrusted: true, pointerId: 1, clientX: 5, clientY: 5, button: 0, buttons: 1,
    timeStamp: 1, getModifierState: () => false, preventDefault() {}, ...init });
  record.canvas.fire('wheel', { isTrusted: true, clientX: 5, clientY: 5, deltaMode: 0, deltaX: 0, deltaY: 4, buttons: 0,
    getModifierState: () => false, preventDefault() {} });
  const down = pointer('pointerdown', { timeStamp: 1 });
  service.native.set(down, { kind: 'mouse', clickCount: 3, pressure: 1 });
  record.canvas.fire('pointerdown', down); await settle();
  assert.deepEqual(z.inputs.map(item => [item.method, item.fields.type ?? item.fields.delta_y, item.fields.click_count]),
    [['wheel', -4, undefined], ['mouse', 'down', 3]]);
  record.adapter.callbacks.onEvent({ event: 'cursor', cursor: 'pointer' });
  assert.deepEqual(service.cursors, [[record.canvas, 'pointer']]);
  assert.equal(record.canvas.style.cursor, undefined, 'the component sets it; JS never writes arbitrary cursor CSS');
  await presenter.dispose();
});
