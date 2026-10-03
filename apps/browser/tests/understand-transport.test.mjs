// PREPARED ONLY. Fake children and deterministic timers; no subprocess,
// provider CLI, authentication, network, filesystem fixtures or browser DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createUnderstandTransport, TRANSPORT_LIMITS as L } from '../chrome/ProviderUnderstand.sys.mjs';
const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
function observe(promise) {
  const record = { state: 'pending', value: null, error: null };
  record.promise = Promise.resolve(promise).then(value => { record.state = 'fulfilled'; record.value = value; return record; },
    error => { record.state = 'rejected'; record.error = error; return record; });
  return record;
}
class Clock {
  now = 0; serial = 0; jobs = new Map();
  setTimeout = (fn, ms) => { const id = ++this.serial; this.jobs.set(id, { fn, at: this.now + ms }); return id; };
  clearTimeout = id => { this.jobs.delete(id); };
  async tick(ms) {
    const target = this.now + ms;
    for (;;) {
      const next = [...this.jobs].filter(([, job]) => job.at <= target).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
      if (!next) break;
      this.now = next[1].at; this.jobs.delete(next[0]); next[1].fn(); await flush();
    }
    this.now = target; await flush();
  }
}
class Pipe {
  values = []; readers = []; ended = false; closes = [];
  push(value) {
    const raw = typeof value === 'string' ? new TextEncoder().encode(value).buffer : value;
    this.pushRaw(raw);
  }
  pushRaw(value) { assert.equal(this.ended, false); const reader = this.readers.shift(); if (reader) reader(value); else this.values.push(value); }
  pushBytes(values) { this.pushRaw(Uint8Array.from(values).buffer); }
  end() { this.ended = true; while (this.readers.length) this.readers.shift()(new ArrayBuffer(0)); }
  close = (force = false) => { this.closes.push(force); if (force) this.values = []; this.end(); return Promise.resolve(); };
  read = (...args) => {
    assert.deepEqual(args, [], 'Gecko read must use unsized length=null default');
    if (this.values.length) return Promise.resolve(this.values.shift());
    if (this.ended) return Promise.resolve(new ArrayBuffer(0));
    return new Promise(resolve => this.readers.push(resolve));
  };
}
class Child {
  stdout = new Pipe(); stderr = new Pipe(); exit = deferred(); writes = []; calls = []; exited = false;
  constructor({ ignoreClose = false, ignoreKill = false, failWrite = false, onWrite = null } = {}) {
    this.ignoreClose = ignoreClose; this.ignoreKill = ignoreKill; this.onWrite = onWrite;
    this.stdin = {
      write: line => { this.calls.push('write'); this.writes.push(JSON.parse(line)); if (failWrite) return Promise.reject(new Error('SYNTHETIC_PRIVATE_STDERR'));
        onWrite?.(this, this.writes.at(-1)); return Promise.resolve(); },
      close: () => { this.calls.push('stdin.close'); if (!this.ignoreClose) this.finish(); return Promise.resolve(); },
    };
  }
  wait = () => { this.calls.push('wait'); return this.exit.promise; };
  kill = timeout => { this.calls.push(`kill:${timeout}`); if (!this.ignoreKill) this.finish(); return Promise.resolve(); };
  exitOnly() { if (!this.exited) { this.exited = true; this.exit.resolve({ exitCode: 0 }); } }
  finish() { this.exitOnly(); this.stdout.end(); this.stderr.end(); }
  frame(id, result) { this.stdout.push(JSON.stringify({ version: 1, id, result }) + '\n'); }
  error(id, code) { this.stdout.push(JSON.stringify({ version: 1, id, error: { code, message: 'SYNTHETIC_PRIVATE_DIAGNOSTIC' } }) + '\n'); }
  answer(method, result) { const request = [...this.writes].reverse().find(frame => frame.method === method); assert(request); this.frame(request.id, result); }
}
function harness({ spawn, child = new Child(), env = {}, uuid } = {}) {
  const clock = new Clock(), children = [], options = []; let ids = 0;
  const config = { AXIOSOZO_PROVIDER_NODE: '/trusted/node', AXIOSOZO_PROVIDER_HOST: '/trusted/packages/provider-host/cli.mjs',
    AXIOSOZO_BUILD_ROOT: '/Volumes/AxioSozoBuild/fixture-transport', ...env };
  const runtime = { timers: clock, env: key => config[key], uuid: uuid ?? (() => `wire_${++ids}`),
    spawn: async opts => { options.push(opts); const result = spawn ? await spawn(opts) : child; children.push(result); return result; } };
  return { clock, runtime, api: createUnderstandTransport({ runtime }), child, children, options };
}
const brief = (request_id = 'brief_1', timeout_ms) => ({ request_id, kind: 'brief', cli: 'codex', project_root: '/synthetic/project',
  ...(timeout_ms === undefined ? {} : { timeout_ms }) });
const terminal = (params, status = 'ok', data_sent = true) => ({ version: 1, request_id: params.request_id, kind: params.kind, cli: params.cli,
  status, reason: status === 'ok' ? null : 'CANCELLED', document: status === 'ok' ? { fixture: true } : null, data_sent, duration_ms: 50 });
async function dispose(h) { await h.api.close(); await flush(); }
function rejected(record, code) { assert.equal(record.state, 'rejected'); assert.equal(record.error.code, code); assert.equal(record.error.message, code); }

test('creation, unsupported methods, invalid params and pre-abort never spawn', async () => {
  const h = harness(); assert.equal(h.options.length, 0);
  await assert.rejects(h.api.request('session/open', {}), { code: 'UNSUPPORTED' });
  await assert.rejects(h.api.request('understand/cancel', { request_id: 123 }), { code: 'INVALID_INPUT' });
  assert.throws(() => h.api.cancel({ request_id: 123 }), { code: 'INVALID_INPUT' });
  await assert.rejects(h.api.request('understand/run', { ...brief(), executable: '/bin/sh' }), { code: 'INVALID_INPUT' });
  await assert.rejects(h.api.request('understand/run', { ...brief(), project_root: '/synthetic/../home' }), { code: 'INVALID_INPUT' });
  const abort = new AbortController(); abort.abort();
  await assert.rejects(h.api.request('understand/run', brief(), { signal: abort.signal }), { code: 'CANCELLED' });
  assert.deepEqual(await h.api.cancel({ request_id: 'unknown' }), { cancelled: false });
  assert.equal(h.options.length, 0); await dispose(h);
});
test('fixed host launch uses minimal env, inherited stdio only and result-only replies', async () => {
  const h = harness({ env: { HOME: '/fake/personal', TOKEN: 'SYNTHETIC_TOKEN', AXIOSOZO_DISCOVERY_PATH: '/fake/client' } });
  const first = observe(h.api.request('understand/available', {}, { timeoutMs: 5000, maxOutputBytes: 8192 })); await flush();
  assert.deepEqual(h.options, [{ command: '/trusted/node', arguments: ['/trusted/packages/provider-host/cli.mjs', 'serve'],
    environmentAppend: false, environment: { PATH: '/usr/bin:/bin', LANG: 'C', AXIOSOZO_BUILD_ROOT: '/Volumes/AxioSozoBuild/fixture-transport' }, stderr: 'pipe' }]);
  assert.deepEqual(h.child.writes[0], { version: 1, id: 'wire_1', method: 'understand/available', params: {} });
  h.child.stderr.push('SYNTHETIC_PRIVATE_STDERR'); h.child.answer('understand/available', { clis: [] }); await flush();
  assert.deepEqual(first.value, { clis: [] });
  const second = observe(h.api.request('understand/run', brief())); await flush();
  h.child.answer('understand/run', terminal(brief())); await flush(); assert.equal(second.value.status, 'ok');
  assert.equal(h.options.length, 1); assert(h.child.writes.every(frame => frame.method.startsWith('understand/'))); await dispose(h);
});
test('unsafe runtime paths fail closed without a process', async () => {
  for (const env of [{ AXIOSOZO_PROVIDER_NODE: 'node' }, { AXIOSOZO_PROVIDER_HOST: '/trusted/other.mjs' },
    { AXIOSOZO_PROVIDER_NODE: '/trusted/node\n' }, { AXIOSOZO_PROVIDER_HOST: '/trusted/../packages/provider-host/cli.mjs' }]) {
    const h = harness({ env }); await assert.rejects(h.api.request('understand/available', {}), { code: 'HOST_UNAVAILABLE' });
    assert.equal(h.options.length, 0); await dispose(h);
  }
});
test('default 180-second and explicit 300-second run requests outlast 30-second RPCs', async () => {
  const h = harness(); const first = observe(h.api.request('understand/run', brief())); await flush();
  await h.clock.tick(31000); assert.equal(first.state, 'pending'); h.child.answer('understand/run', terminal(brief())); await flush();
  assert.equal(first.state, 'fulfilled');
  const params = brief('long_2', 300000), second = observe(h.api.request('understand/run', params, { timeoutMs: 300000 })); await flush();
  await h.clock.tick(300000); assert.equal(second.state, 'pending'); await h.clock.tick(L.replyGraceMs);
  rejected(second, 'TIMEOUT'); assert(h.child.calls.includes('stdin.close')); assert(!h.child.calls.some(call => call.startsWith('kill'))); await dispose(h);
});
test('adapter run deadline starts after bounded startup', async () => {
  const launch = deferred(), h = harness({ spawn: () => launch.promise });
  const run = observe(h.api.request('understand/run', brief('startup_1', 10000), { timeoutMs: 10000 })); await flush();
  await h.clock.tick(3000); launch.resolve(h.child); await flush(); await h.clock.tick(10000); assert.equal(run.state, 'pending');
  await h.clock.tick(L.replyGraceMs); rejected(run, 'TIMEOUT'); await dispose(h);
});
test('signal plus explicit cancel share an ACK while the original run waits for terminal', async () => {
  const h = harness(), abort = new AbortController(), params = brief();
  const run = observe(h.api.request('understand/run', params, { signal: abort.signal })); await flush(); abort.abort();
  const cancel = observe(h.api.cancel({ request_id: params.request_id })); await flush();
  assert.equal(h.child.writes.filter(frame => frame.method === 'understand/cancel').length, 1);
  h.child.answer('understand/cancel', { cancelled: true }); await flush(); assert.deepEqual(cancel.value, { cancelled: true });
  assert.equal(run.state, 'pending');
  h.child.answer('understand/run', terminal(params, 'cancelled')); await flush(); assert.equal(run.value.status, 'cancelled');
  assert.equal(run.value.data_sent, true); assert.deepEqual(await h.api.cancel({ request_id: params.request_id }), { cancelled: false }); await dispose(h);
});
test('direct cancel without signal also bounds a missing original terminal reply', async () => {
  const h = harness(), run = observe(h.api.request('understand/run', brief())); await flush();
  const metadata = observe(h.api.request('understand/available', {})); const cancel = observe(h.api.cancel({ request_id: 'brief_1' })); await flush();
  h.child.answer('understand/cancel', { cancelled: true }); await flush(); assert.equal(cancel.state, 'fulfilled'); assert.equal(run.state, 'pending');
  await h.clock.tick(L.cancelGraceMs); rejected(run, 'CANCELLED'); rejected(metadata, 'CANCELLED');
  assert(h.child.calls.includes('stdin.close')); await dispose(h);
});
test('graceful close is idempotent and waits without killing an exited host', async () => {
  const h = harness(), pending = observe(h.api.request('understand/available', {})); await flush();
  const closing = h.api.close(); assert.equal(h.api.close(), closing); await closing; await flush();
  rejected(pending, 'HOST_CLOSED'); assert.equal(h.child.calls.filter(call => call === 'stdin.close').length, 1);
  assert(!h.child.calls.some(call => call.startsWith('kill'))); assert.equal(h.clock.jobs.size, 0);
  await assert.rejects(h.api.request('understand/available', {}), { code: 'HOST_CLOSED' });
});
test('ignored graceful shutdown waits one second, kills, and bounds hostile wait', async () => {
  const child = new Child({ ignoreClose: true, ignoreKill: true }), h = harness({ child });
  const run = observe(h.api.request('understand/run', brief())); await flush(); const closing = observe(h.api.close()); await flush();
  rejected(run, 'HOST_CLOSED'); assert.equal(closing.state, 'pending'); assert(child.calls.includes('stdin.close'));
  await h.clock.tick(999); assert(!child.calls.includes('kill:0')); await h.clock.tick(1); assert(child.calls.includes('kill:0'));
  assert.equal(closing.state, 'pending'); await h.clock.tick(L.killWaitMs); assert.equal(closing.state, 'fulfilled');
  assert(child.calls.indexOf('stdin.close') < child.calls.indexOf('kill:0')); assert.equal(h.clock.jobs.size, 0); child.finish();
});
test('startup timeout rejects promptly and cleans a late child without writing', async () => {
  const launch = deferred(), h = harness({ spawn: () => launch.promise });
  const request = observe(h.api.request('understand/available', {})); await flush(); await h.clock.tick(L.startupMs);
  rejected(request, 'STARTUP_TIMEOUT'); await h.api.close(); launch.resolve(h.child); await flush();
  assert.equal(h.child.writes.length, 0); assert(h.child.calls.includes('stdin.close')); assert(h.child.exited); assert.equal(h.clock.jobs.size, 0);
});
test('immediate close suppresses a queued startup before spawn begins', async () => {
  const h = harness(), request = observe(h.api.request('understand/available', {})); const closing = h.api.close();
  await closing; await flush(); rejected(request, 'HOST_CLOSED'); assert.equal(h.options.length, 0);
});
test('abort during sole deferred startup does not spawn again just to cancel', async () => {
  const launch = deferred(), h = harness({ spawn: () => launch.promise }), abort = new AbortController();
  const run = observe(h.api.request('understand/run', brief(), { signal: abort.signal })); await flush(); abort.abort(); await flush();
  rejected(run, 'CANCELLED'); assert.deepEqual(await h.api.cancel({ request_id: 'brief_1' }), { cancelled: false }); assert.equal(h.options.length, 1);
  launch.resolve(h.child); await flush(); assert.equal(h.child.writes.length, 0); assert(h.child.exited); await dispose(h);
});
test('one aborted startup waiter does not discard another caller sharing startup', async () => {
  const launch = deferred(), h = harness({ spawn: () => launch.promise }), abort = new AbortController();
  const run = observe(h.api.request('understand/run', brief(), { signal: abort.signal }));
  const metadata = observe(h.api.request('understand/available', {})); await flush(); abort.abort(); await flush(); rejected(run, 'CANCELLED');
  launch.resolve(h.child); await flush(); assert.equal(h.child.writes.length, 1); assert.equal(h.child.writes[0].method, 'understand/available');
  h.child.answer('understand/available', { clis: [] }); await flush(); assert.equal(metadata.state, 'fulfilled'); await dispose(h);
});
test('startup failure disposes malformed returned child interfaces', async () => {
  const child = new Child(); child.stdout = {}; const h = harness({ child });
  const request = observe(h.api.request('understand/available', {})); await flush(); rejected(request, 'HOST_UNAVAILABLE');
  assert(child.calls.includes('stdin.close')); assert(child.exited); await dispose(h);
});
test('partial frames and envelopes with missing, extra or unexpected IDs retire all pending', async () => {
  const cases = [
    ['truncated', child => { child.stdout.push('{"version":1'); child.stdout.end(); }, 'INVALID_PROVIDER_FRAME'],
    ['unterminated', child => { child.stdout.push(JSON.stringify({ version: 1, id: 'wire_1', result: {} })); child.stdout.end(); }, 'INVALID_PROVIDER_FRAME'],
    ['bad-json', child => child.stdout.push('not JSON\n'), 'INVALID_PROVIDER_FRAME'],
    ['unknown-id', child => child.frame('unknown', {}), 'UNEXPECTED_PROVIDER_REPLY'],
    ['mixed', child => child.stdout.push(JSON.stringify({ version: 1, id: 'wire_1', result: {}, error: { code: 'X', message: '' } }) + '\n'), 'INVALID_PROVIDER_FRAME'],
    ['extra-key', child => child.stdout.push('{"version":1,"id":"wire_1","result":{},"extra":true}\n'), 'INVALID_PROVIDER_FRAME'],
    ['eof', child => child.finish(), 'HOST_UNAVAILABLE'],
    ['idle', child => child.stdout.push('{"version":1,"event":{"version":1,"type":"host_idle","session_id":null}}\n'), 'HOST_UNAVAILABLE'],
  ];
  for (const [name, send, code] of cases) {
    const h = harness(), first = observe(h.api.request('understand/run', brief(name))), second = observe(h.api.request('understand/available', {}));
    await flush(); send(h.child); await flush(); rejected(first, code); rejected(second, code); await dispose(h);
  }
});
test('split JSON replies and buffered stdout preceding process exit are consumed', async () => {
  const h = harness(), request = observe(h.api.request('understand/available', {})); await flush();
  h.child.stdout.push('{"version":1,"id":"wire_1",'); await flush(); assert.equal(request.state, 'pending');
  h.child.stdout.push('"result":{"clis":[]}}\n'); h.child.exitOnly(); await flush(); assert.deepEqual(request.value, { clis: [] });
  h.child.stdout.end(); h.child.stderr.end(); await dispose(h);
});
test('exited host with a pipe held open settles all pending after a bounded drain', async () => {
  const h = harness(), request = observe(h.api.request('understand/available', {})); await flush(); h.child.exitOnly(); await flush();
  await h.clock.tick(L.closeGraceMs); rejected(request, 'HOST_UNAVAILABLE'); await dispose(h);
});
test('UTF-8 request cap is enforced before spawn, including multibyte data', async () => {
  const h = harness(); const params = { ...brief(), kind: 'explain_errors', input: { url: 'https://test.invalid/', errors: [
    { level: 'error', text: '界'.repeat(25000), source: null, line: null }] } };
  await assert.rejects(h.api.request('understand/run', params), { code: 'INVALID_INPUT' }); assert.equal(h.options.length, 0);
  const valid = { ...params, input: { url: 'https://test.invalid/', errors: Array.from({ length: 20 }, () => ({ level: 'error', text: '界'.repeat(1000), source: null, line: null })) } };
  const request = observe(h.api.request('understand/run', valid)); await flush();
  const line = JSON.stringify(h.child.writes[0]); assert(new TextEncoder().encode(line).byteLength <= L.requestBytes);
  h.child.answer('understand/run', terminal(valid)); await flush(); assert.equal(request.state, 'fulfilled'); await dispose(h);
});
test('output caps count UTF-8 bytes, cover complete whitespace frames, and honor caller result limits', async () => {
  for (const send of [child => child.stdout.push(' '.repeat(L.frameBytes + 1) + '\n'),
    child => child.stdout.push('界'.repeat(Math.ceil(L.frameBytes / 3)) + '\n'),
    child => child.answer('understand/available', { clis: [], padding: '界'.repeat(100) })]) {
    const h = harness(), request = observe(h.api.request('understand/available', {}, { maxOutputBytes: 100 }));
    await flush(); send(h.child); await flush(); rejected(request, 'OUTPUT_LIMIT'); await dispose(h);
  }
});
test('frame cap applies per line rather than to a combined valid read chunk', async () => {
  const h = harness(), first = observe(h.api.request('understand/available', {})), second = observe(h.api.request('understand/available', {})); await flush();
  const payload = { fixture: 'x'.repeat(180000) };
  h.child.stdout.push(h.child.writes.map(frame => JSON.stringify({ version: 1, id: frame.id, result: payload }) + '\n').join(''));
  await flush(); assert.equal(first.state, 'fulfilled'); assert.equal(second.state, 'fulfilled'); await dispose(h);
});
test('seventh outstanding call is rejected before write; concurrent run IDs cannot collide', async () => {
  const h = harness(), pending = Array.from({ length: L.pending }, () => observe(h.api.request('understand/available', {}))); await flush();
  await assert.rejects(h.api.request('understand/available', {}), { code: 'BACKPRESSURE' }); assert.equal(h.child.writes.length, L.pending);
  for (const frame of h.child.writes) h.child.frame(frame.id, { clis: [] }); await flush(); assert(pending.every(entry => entry.state === 'fulfilled'));
  const first = observe(h.api.request('understand/run', brief())); await flush();
  await assert.rejects(h.api.request('understand/run', brief()), { code: 'DUPLICATE_REQUEST' });
  h.child.answer('understand/run', terminal(brief())); await flush(); assert.equal(first.state, 'fulfilled'); await dispose(h);
});
test('host envelope errors expose typed code without diagnostic text; write failure retires', async () => {
  const h = harness(), request = observe(h.api.request('understand/available', {})); await flush();
  h.child.error('wire_1', 'INVALID_INPUT'); await flush(); rejected(request, 'INVALID_INPUT'); assert(!request.error.message.includes('SYNTHETIC_PRIVATE')); await dispose(h);
  const failed = harness({ child: new Child({ failWrite: true }) }), run = observe(failed.api.request('understand/run', brief()));
  await flush(); rejected(run, 'HOST_UNAVAILABLE'); assert(failed.child.calls.includes('stdin.close')); await dispose(failed);
});
test('close and abort microtasks cannot write after retiring a ready host', async () => {
  for (const action of ['close', 'abort']) {
    const h = harness(), warmup = observe(h.api.request('understand/available', {})); await flush(); h.child.answer('understand/available', { clis: [] }); await flush();
    assert.equal(warmup.state, 'fulfilled'); const abort = new AbortController();
    const request = observe(h.api.request('understand/run', brief(), { signal: abort.signal }));
    queueMicrotask(() => action === 'close' ? void h.api.close() : abort.abort()); await flush();
    if (action === 'abort') { // If write won the race, cancellation must own it.
      if (h.child.writes.some(frame => frame.method === 'understand/run')) {
        h.child.answer('understand/cancel', { cancelled: true }); h.child.answer('understand/run', terminal(brief(), 'cancelled')); await flush();
        assert.equal(request.value.status, 'cancelled');
      } else rejected(request, 'CANCELLED');
    } else rejected(request, 'HOST_CLOSED');
    const closedIndex = h.child.calls.indexOf('stdin.close');
    if (closedIndex >= 0) assert(!h.child.calls.slice(closedIndex + 1).includes('write'));
    await dispose(h);
  }
});
test('host request budget retires before sending a 1025th envelope and a later call can restart', async () => {
  const auto = () => new Child({ onWrite: (child, frame) => child.frame(frame.id, { clis: [] }) });
  const h = harness({ spawn: () => auto() });
  for (let i = 0; i < L.requestsPerHost; i++) assert.deepEqual(await h.api.request('understand/available', {}), { clis: [] });
  await assert.rejects(h.api.request('understand/available', {}), { code: 'REQUEST_LIMIT' });
  assert.equal(h.children[0].writes.length, L.requestsPerHost); assert.deepEqual(await h.api.request('understand/available', {}), { clis: [] });
  assert.equal(h.children.length, 2); await dispose(h);
});

test('typed run faults disclose false before writes and conservatively true after an attempt', async () => {
  const rejectedSpawn = harness({ spawn: () => Promise.reject(new Error('SYNTHETIC_STARTUP_FAILURE')) });
  const before = observe(rejectedSpawn.api.request('understand/run', brief())); await flush();
  rejected(before, 'HOST_UNAVAILABLE'); assert.equal(before.error.data_sent, false); await dispose(rejectedSpawn);
  const aborted = harness(), signal = new AbortController(); signal.abort();
  await assert.rejects(aborted.api.request('understand/run', brief(), { signal: signal.signal }), error => error.code === 'CANCELLED' && error.data_sent === false);
  assert.equal(aborted.options.length, 0); await dispose(aborted);
  const failedWrite = harness({ child: new Child({ failWrite: true }) }), attempted = observe(failedWrite.api.request('understand/run', brief()));
  await flush(); rejected(attempted, 'HOST_UNAVAILABLE'); assert.equal(attempted.error.data_sent, true); await dispose(failedWrite);
  const diagnostic = harness(), result = observe(diagnostic.api.request('understand/run', brief())); await flush();
  diagnostic.child.error('wire_1', 'INVALID_INPUT'); await flush(); rejected(result, 'INVALID_INPUT');
  assert.equal(result.error.data_sent, true); await dispose(diagnostic);
  const injected = harness(), injection = observe(injected.api.request('understand/run', brief())); await flush();
  injected.child.stdout.push('{"version":1,"id":"wire_1","error":{"code":"INVALID_INPUT","message":"fixture","data_sent":false}}\n');
  await flush(); rejected(injection, 'INVALID_PROVIDER_FRAME'); assert.equal(injection.error.data_sent, true); await dispose(injected);
});


test('byte-shaped pipes are required; readString-only children are retired without writes', async () => {
  for (const which of ['stdout', 'stderr']) {
    const child = new Child(); child[which] = { readString() { throw new Error('No fallback'); }, end() {} };
    const h = harness({ child }), request = observe(h.api.request('understand/available', {}));
    await flush(); rejected(request, 'HOST_UNAVAILABLE'); assert.equal(child.writes.length, 0); await dispose(h);
  }
});
test('split UTF-8 lead chunks are not EOF and Unicode following frames remain bound to their RPC IDs', async () => {
  const h = harness(), first = observe(h.api.request('understand/available', {})), second = observe(h.api.request('understand/available', {}));
  await flush();
  const wire1 = new TextEncoder().encode(JSON.stringify({ version: 1, id: h.child.writes[0].id, result: { fixture: '😀' } }) + '\n');
  const wire2 = new TextEncoder().encode(JSON.stringify({ version: 1, id: h.child.writes[1].id, result: { fixture: '€' } }) + '\n');
  const lead = wire1.indexOf(0xf0);
  h.child.stdout.pushRaw(wire1.slice(0, lead).buffer); await flush();
  h.child.stdout.pushBytes([wire1[lead]]); await flush(); assert.equal(first.state, 'pending'); assert.equal(second.state, 'pending');
  h.child.stdout.pushBytes([...wire1.slice(lead + 1), ...wire2]); await flush();
  assert.deepEqual(first.value, { fixture: '😀' }); assert.deepEqual(second.value, { fixture: '€' }); await dispose(h);
});
test('invalid or EOF-truncated raw UTF-8 retires all pending without replacement decoding', async () => {
  for (const incomplete of [false, true]) {
    const h = harness(), first = observe(h.api.request('understand/run', brief())), second = observe(h.api.request('understand/available', {}));
    await flush(); h.child.stdout.pushBytes([0xe2]); await flush(); assert.equal(first.state, 'pending');
    if (incomplete) { h.child.stdout.pushBytes([0x82]); h.child.stdout.end(); }
    else h.child.stdout.pushBytes([0x28]);
    await flush(); rejected(first, 'INVALID_PROVIDER_FRAME'); rejected(second, 'INVALID_PROVIDER_FRAME');
    assert.equal(first.error.data_sent, true); await dispose(h);
  }
});
test('raw frame flooding counts incomplete bytes before they produce decoded text', async () => {
  const h = harness(), request = observe(h.api.request('understand/run', brief())); await flush();
  h.child.stdout.pushRaw(new Uint8Array(L.frameBytes).fill(0x20).buffer); await flush(); assert.equal(request.state, 'pending');
  h.child.stdout.pushBytes([0xf0]); await flush(); rejected(request, 'OUTPUT_LIMIT'); assert.equal(request.error.data_sent, true); await dispose(h);
});
test('stderr has independent fatal decoding and a raw-byte budget without exposing diagnostics', async () => {
  const h = harness(), request = observe(h.api.request('understand/available', {})); await flush();
  h.child.stderr.pushBytes([0xe2]); await flush(); h.child.answer('understand/available', { fixture: '😀' }); await flush();
  assert.deepEqual(request.value, { fixture: '😀' }); h.child.stderr.pushBytes([0x82, 0xac]); await flush(); await dispose(h);
  for (const bytes of [new Uint8Array(L.stderrBytes + 1).fill(0x20), new Uint8Array([0xff])]) {
    const flood = harness(), pending = observe(flood.api.request('understand/run', brief())); await flush();
    flood.child.stderr.pushRaw(bytes.buffer); await flush();
    rejected(pending, bytes.length > L.stderrBytes ? 'OUTPUT_LIMIT' : 'INVALID_PROVIDER_FRAME');
    assert(!pending.error.message.includes('PRIVATE')); await dispose(flood);
  }
});
test('late cancellation followed by fragmented Unicode success retains no controller document', async () => {
  const [{ createUnderstand }, core] = await Promise.all([import('../chrome/Understand.sys.mjs'), import('../../../packages/contexts/src/index.mjs')]);
  const h = harness();
  const controller = createUnderstand({ runtime: h.api, core, lookupProject: () => ({ id: 'p_fake', revision: 1, canonicalRoot: '/synthetic/project' }),
    uuid: () => 'late', testOnlyAllowRun: true, authorizeContext: () => true, timers: h.clock, now: () => h.clock.now });
  const completion = observe(controller.run({ projectId: 'p_fake', cli: 'codex' })); await flush();
  const sent = h.child.writes.find(frame => frame.method === 'understand/run');
  assert.deepEqual(controller.cancel(sent.params.request_id), { cancelled: true }); await flush();
  h.child.answer('understand/cancel', { cancelled: true }); await flush(); assert.equal(completion.state, 'pending');
  const result = { ...terminal(sent.params), document: { version: 1, product: '😀 synthetic fixture.', apps: [], domains: [], services: [], start: [], risks: [] } };
  const frame = new TextEncoder().encode(JSON.stringify({ version: 1, id: sent.id, result }) + '\n');
  const lead = frame.indexOf(0xf0);
  h.child.stdout.pushRaw(frame.slice(0, lead).buffer); h.child.stdout.pushBytes([frame[lead]]); await flush();
  assert.equal(completion.state, 'pending'); h.child.stdout.pushRaw(frame.slice(lead + 1).buffer); await flush();
  assert.equal(completion.value.result.status, 'cancelled'); assert.equal(completion.value.result.document, null);
  assert.equal(completion.value.result.data_sent, true); await controller.close(); assert.equal(h.clock.jobs.size, 0);
});


test('retirement force-closes descendant-held raw output pipes even after host wait resolves', async () => {
  const child = new Child({ ignoreClose: true }), h = harness({ child });
  const pending = observe(h.api.request('understand/available', {})); await flush();
  assert.equal(child.stdout.readers.length, 1); assert.equal(child.stderr.readers.length, 1);
  child.exitOnly(); await flush(); await h.clock.tick(L.closeGraceMs);
  rejected(pending, 'HOST_UNAVAILABLE'); await dispose(h);
  assert.deepEqual(child.stdout.closes, [true]); assert.deepEqual(child.stderr.closes, [true]);
  assert.equal(child.stdout.readers.length, 0); assert.equal(child.stderr.readers.length, 0); assert.equal(h.clock.jobs.size, 0);
});
test('a throwing output close cannot prevent the other close; hanging closes remain bounded', async () => {
  for (const mode of ['throw', 'hang']) {
    const child = new Child(), h = harness({ child });
    child.stdout.close = force => { child.stdout.closes.push(force); if (mode === 'throw') throw new Error('SYNTHETIC_PRIVATE_CLOSE'); return new Promise(() => {}); };
    const pending = observe(h.api.request('understand/available', {})); await flush();
    const closing = observe(h.api.close()); await flush(); rejected(pending, 'HOST_CLOSED');
    assert.deepEqual(child.stdout.closes, [true]); assert.deepEqual(child.stderr.closes, [true]);
    if (mode === 'hang') { assert.equal(closing.state, 'pending'); await h.clock.tick(L.pipeCloseGraceMs); }
    assert.equal(closing.state, 'fulfilled'); assert.equal(h.clock.jobs.size, 0);
  }
});

test('trusted inactive or throwing authority performs zero spawn/write', async () => {
  for (const isActive of [() => false, () => { throw Error('revoked'); }]) {
    const h = harness();
    await assert.rejects(h.api.request('understand/run', brief(), { isActive }), error => error.code === 'CANCELLED' && error.data_sent === false);
    await assert.rejects(h.api.request('understand/available', {}, { isActive }), { code: 'CANCELLED' });
    assert.equal(h.options.length, 0); assert.equal(h.child.writes.length, 0); await dispose(h);
  }
});
test('authority revoked before deferred startup suppresses spawn', async () => {
  const h = harness(); let active = true;
  const pending = observe(h.api.request('understand/run', brief(), { isActive: () => active })); active = false;
  await flush(); rejected(pending, 'CANCELLED'); assert.equal(pending.error.data_sent, false);
  assert.equal(h.options.length, 0); assert.equal(h.child.writes.length, 0); await dispose(h);
});
test('delayed startup propagates initiating authority and cleans a revoked late child without writes', async () => {
  const launch = deferred(), h = harness({ spawn: () => launch.promise }); let active = true;
  const run = observe(h.api.request('understand/run', brief(), { isActive: () => active })); await flush();
  assert.equal(typeof h.options[0].isActive, 'function'); assert.equal(h.options[0].isActive(), true);
  active = false; assert.equal(h.options[0].isActive(), false); launch.resolve(h.child); await flush();
  rejected(run, 'CANCELLED'); assert.equal(run.error.data_sent, false);
  assert.equal(h.child.writes.length, 0); assert(h.child.calls.includes('stdin.close')); await dispose(h);
});
test('ready host checks each owner after ensureHost and immediately before write; another owner can reuse it', async () => {
  const h = harness(); const warmup = observe(h.api.request('understand/available', {})); await flush();
  h.child.answer('understand/available', { clis: [] }); await flush(); assert.equal(warmup.state, 'fulfilled');
  let active = true;
  const revoked = observe(h.api.request('understand/run', brief('revoked'), { isActive: () => active })); active = false;
  await flush(); rejected(revoked, 'CANCELLED'); assert.equal(revoked.error.data_sent, false); assert.equal(h.child.writes.length, 1);
  let authority = true;
  h.runtime.uuid = () => { authority = false; return 'prewrite'; };
  const prewrite = observe(h.api.request('understand/run', brief('prewrite'), { isActive: () => authority })); await flush();
  rejected(prewrite, 'CANCELLED'); assert.equal(prewrite.error.data_sent, false); assert.equal(h.child.writes.length, 1);
  h.runtime.uuid = () => 'new_owner';
  const valid = observe(h.api.request('understand/run', brief('new_owner'), { isActive: () => true })); await flush();
  h.child.answer('understand/run', terminal(brief('new_owner'))); await flush(); assert.equal(valid.state, 'fulfilled');
  assert.equal(h.options.length, 1); await dispose(h);
});
test('revoked initiating owner does not bind a reused host; cancel still reaches the already-owned run', async () => {
  const h = harness(); let firstActive = true;
  const first = observe(h.api.request('understand/run', brief('first_owner'), { isActive: () => firstActive })); await flush();
  h.child.answer('understand/run', terminal(brief('first_owner'))); await flush(); assert.equal(first.state, 'fulfilled'); firstActive = false;
  let secondActive = true;
  const second = observe(h.api.request('understand/run', brief('second_owner'), { isActive: () => secondActive })); await flush(); secondActive = false;
  const cancellation = observe(h.api.cancel({ request_id: 'second_owner' })); await flush();
  assert.equal(h.child.writes.at(-1).method, 'understand/cancel');
  h.child.answer('understand/cancel', { cancelled: true }); h.child.answer('understand/run', terminal(brief('second_owner'), 'cancelled')); await flush();
  assert.deepEqual(cancellation.value, { cancelled: true }); assert.equal(second.value.status, 'cancelled'); assert.equal(h.options.length, 1); await dispose(h);
});
test('default Subprocess adapter consumes private authority and passes only Gecko options', async () => {
  const child = new Child(), clock = new Clock(), calls = [];
  const before = { ChromeUtils: globalThis.ChromeUtils, Services: globalThis.Services };
  globalThis.ChromeUtils = { importESModule(path) { return path.includes('Subprocess') ? { Subprocess: { call(options) { calls.push(options); return Promise.resolve(child); } } } : clock; } };
  globalThis.Services = { env: { get(name) { return name === 'AXIOSOZO_PROVIDER_NODE' ? '/trusted/node' : name === 'AXIOSOZO_PROVIDER_HOST' ? '/trusted/packages/provider-host/cli.mjs' : ''; } }, uuid: { generateUUID: () => 'native_fake' } };
  const api = createUnderstandTransport();
  try {
    const pending = observe(api.request('understand/available', {}, { isActive: () => true })); await flush();
    assert.equal(calls.length, 1); assert.equal(Object.hasOwn(calls[0], 'isActive'), false);
    assert.deepEqual(Object.keys(calls[0]).sort(), ['arguments','command','environment','environmentAppend','stderr']);
    child.answer('understand/available', { clis: [] }); await flush(); assert.equal(pending.state, 'fulfilled');
    await api.close();
  } finally { globalThis.ChromeUtils = before.ChromeUtils; globalThis.Services = before.Services; }
});
