// Injected ChildProcess/streams/signals/timers only; no subprocess or provider is run.
import test from 'node:test';
import { registerHooks } from 'node:module';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { fileURLToPath } from 'node:url';
let active = null;
const SPAWN = Symbol.for('AxioSozo.UnderstandProcessExitTest.spawn');
const previousSpawn = globalThis[SPAWN];
globalThis[SPAWN] = (...args) => {
  assert(active, 'an unexpected real spawn must fail');
  return active.spawn(...args);
};
const MODULE = new URL('../src/understand.mjs', import.meta.url).href;
const FAKE = 'axiosozo-understand-process-exit-test:child-process';
// Only this runner's built-in child_process import is replaced; other modules
// keep their real bindings. No experimental runner flags or production seam.
const hooks = registerHooks({
  resolve(specifier, context, next) {
    return specifier === 'node:child_process' && context.parentURL === MODULE
      ? { url: FAKE, shortCircuit: true } : next(specifier, context);
  },
  load(url, context, next) {
    return url === FAKE ? { format: 'module', shortCircuit: true,
      source: "export const spawn = (...args) => globalThis[Symbol.for('AxioSozo.UnderstandProcessExitTest.spawn')](...args);" }
      : next(url, context);
  },
});
const { UnderstandRunner } = await import('../src/understand.mjs');
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const HOME = fileURLToPath(new URL('../../../', import.meta.url));
const BRIEF = { version: 1, product: 'Synthetic project.', apps: [], domains: [], services: [], start: [], risks: [] };
test.after(() => {
  hooks.deregister();
  if (previousSpawn === undefined) delete globalThis[SPAWN]; else globalThis[SPAWN] = previousSpawn;
});

function harness(t, { groupFails = false, exitDuringGroup = false } = {}) {
  const children = [], groups = [], hooks = new Set();
  const once = process.once, remove = process.removeListener;
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(process, 'once', function(event, callback) {
    if (event === 'exit') { hooks.add(callback); return this; }
    return once.call(this, event, callback);
  });
  t.mock.method(process, 'removeListener', function(event, callback) {
    if (event === 'exit') { hooks.delete(callback); return this; }
    return remove.call(this, event, callback);
  });
  t.mock.method(process, 'kill', (pid, signal) => {
    groups.push([pid, signal]);
    if (exitDuringGroup) children.at(-1).exitCode = 0;
    if (groupFails) throw new Error('synthetic group unavailable');
    return true;
  });
  const stream = () => {
    const pipe = new EventEmitter();
    pipe.destroyed = 0; pipe.destroy = () => { pipe.destroyed++; };
    return pipe;
  };
  active = { spawn(command, args, options) {
    assert.equal(command, '/synthetic/fake-cli');
    assert.equal(options.detached, true); assert.equal(options.shell, false);
    const child = new EventEmitter();
    Object.assign(child, { pid: 7000 + children.length, exitCode: null, signalCode: null,
      stdin: stream(), stdout: stream(), stderr: stream(), signals: [] });
    child.stdin.end = () => {}; child.stderr.resume = () => {};
    child.kill = signal => { child.signals.push(signal); return true; };
    child.terminal = (code = 0, signal = null) => {
      child.exitCode = code; child.signalCode = signal; child.emit('exit', code, signal);
    };
    child.closed = code => child.emit('close', code ?? child.exitCode, child.signalCode);
    child.validOutput = () => child.stdout.emit('data', Buffer.from(JSON.stringify(BRIEF)));
    children.push(child);
    queueMicrotask(() => child.emit('spawn'));
    return child;
  } };
  const runner = new UnderstandRunner({ home: HOME, discover: () => assert.fail('no discovery'),
    testOnlyLaunch: { codex: { command: '/synthetic/fake-cli', prefix: [] } }, limits: { minTimeoutMs: 1 } });
  const start = async (id = 'request') => {
    const result = runner.run({ request_id: id, kind: 'brief', cli: 'codex', project_root: ROOT, timeout_ms: 20 });
    await Promise.resolve();
    return { result, child: children.at(-1) };
  };
  t.after(() => {
    runner.close();
    for (const child of children) { child.terminal(-1); child.closed(); }
    active = null;
  });
  return { runner, start, children, groups, hooks, hostExit: () => { for (const hook of [...hooks]) hook(); },
    stop: name => name === 'cancel' ? runner.cancel({ request_id: 'request' })
      : name === 'timeout' ? t.mock.timers.tick(20) : runner.close() };
}
const emptySignals = (h, child) => { assert.deepEqual(h.groups, []); assert.deepEqual(child.signals, []); };
const destroyedPipes = child => [child.stdin.destroyed, child.stdout.destroyed, child.stderr.destroyed];

for (const [label, code, signal, status, reason] of [
  ['success', 0, null, 'ok', null], ['nonzero', 7, null, 'failed', 'EXIT_NONZERO'],
  ['signal exit', null, 'SIGTERM', 'failed', 'EXIT_NONZERO'],
]) test(`ordinary ${label} close never signals a numeric PGID or the retained child`, async t => {
  const h = harness(t); const { result, child } = await h.start();
  child.validOutput(); child.terminal(code, signal);
  assert.deepEqual(destroyedPipes(child), [0, 0, 0], 'ordinary exit keeps draining');
  child.closed();
  const value = await result;
  assert.deepEqual([value.status, value.reason], [status, reason]);
  if (status === 'ok') assert.deepEqual(value.document, BRIEF);
  emptySignals(h, child); assert.equal(h.hooks.size, 0);
});

test('close alone never tries group cleanup even if fake retained exit fields are still null', async t => {
  const h = harness(t); const { result, child } = await h.start();
  child.validOutput(); child.closed(0);
  assert.equal((await result).status, 'ok'); emptySignals(h, child);
});

for (const [operation, status, reason] of [
  ['cancel', 'cancelled', 'CANCELLED'], ['timeout', 'timeout', 'TIMEOUT'], ['close', 'cancelled', 'HOST_CLOSED'],
]) {
  test(`${operation} after leader exit settles without a close event or descendant signals`, async t => {
    const h = harness(t); const { result, child } = await h.start();
    child.terminal(0);
    h.stop(operation);
    const value = await result;
    assert.deepEqual([value.status, value.reason, value.document], [status, reason, null]);
    assert.equal(value.data_sent, true);
    emptySignals(h, child); assert.deepEqual(destroyedPipes(child), [1, 1, 1]);
    assert.equal(h.runner.active, 0); assert.equal(h.hooks.size, 0);
    assert.deepEqual(h.runner.cancel({ request_id: 'request' }), { cancelled: false });
    child.closed(); emptySignals(h, child);
    assert.deepEqual(destroyedPipes(child), [1, 1, 1], 'late close adds no cleanup or settlement');
  });
  test(`${operation} while leader is live attempts the group then settles on exit without waiting for inherited pipes`, async t => {
    const h = harness(t); const { result, child } = await h.start();
    h.stop(operation);
    assert.deepEqual(h.groups, [[-child.pid, 'SIGKILL']]); assert.deepEqual(child.signals, ['SIGKILL']);
    child.terminal(null, 'SIGKILL'); // descendants never emit close in this fake
    const value = await result;
    assert.deepEqual([value.status, value.reason, value.document], [status, reason, null]);
    assert.deepEqual(destroyedPipes(child), [1, 1, 1]); assert.equal(h.hooks.size, 0);
  });
}

test('host exit signals only a retained live leader; known exit is left alone', async t => {
  const h = harness(t); const { result, child } = await h.start();
  h.hostExit();
  assert.deepEqual(h.groups, [[-child.pid, 'SIGKILL']]); assert.deepEqual(child.signals, ['SIGKILL']);
  child.validOutput(); child.terminal(0);
  h.hostExit();
  assert.equal(h.groups.length, 1); assert.equal(child.signals.length, 1);
  child.closed(); assert.equal((await result).status, 'ok');
});

test('a leader exit observed during the group attempt suppresses the direct fallback and bounds cancel', async t => {
  const h = harness(t, { exitDuringGroup: true }); const { result, child } = await h.start();
  h.stop('cancel');
  assert.deepEqual(h.groups, [[-child.pid, 'SIGKILL']]); assert.deepEqual(child.signals, []);
  assert.equal((await result).status, 'cancelled'); assert.deepEqual(destroyedPipes(child), [1, 1, 1]);
});

test('a failed group attempt still uses the retained live child fallback', async t => {
  const h = harness(t, { groupFails: true }); const { result, child } = await h.start();
  h.stop('cancel');
  assert.deepEqual(h.groups, [[-child.pid, 'SIGKILL']]); assert.deepEqual(child.signals, ['SIGKILL']);
  child.terminal(null, 'SIGKILL'); assert.equal((await result).status, 'cancelled');
});

test('unknown retained exit facts refuse both signals; close still settles the selected timeout', async t => {
  const h = harness(t); const { result, child } = await h.start();
  child.exitCode = undefined; child.signalCode = undefined;
  h.stop('timeout'); emptySignals(h, child);
  child.closed(0); assert.equal((await result).status, 'timeout');
});

test('a stopped exited child can advance the queue; its late close cannot remove the next child exit hook', async t => {
  const h = harness(t); const first = await h.start('request');
  const next = h.runner.run({ request_id: 'next', kind: 'brief', cli: 'codex', project_root: ROOT, timeout_ms: 20 });
  first.child.terminal(0); h.stop('cancel');
  assert.equal((await first.result).status, 'cancelled'); await Promise.resolve();
  const second = h.children[1]; assert(second);
  first.child.closed(); assert.equal(h.hooks.size, 1);
  h.hostExit(); assert.deepEqual(h.groups, [[-second.pid, 'SIGKILL']]);
  assert.deepEqual(first.child.signals, []); assert.deepEqual(second.signals, ['SIGKILL']);
  second.validOutput(); second.terminal(0); second.closed();
  assert.equal((await next).status, 'ok'); assert.equal(h.hooks.size, 0);
});
