import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { ConsoleErrorsStore, ConsoleErrorsError, MAX_CONSOLE_MESSAGES, MAX_CONSOLE_TABS,
  sanitizeConsoleSource, consolePrimitiveText, validateConsolePacket } from '../chrome/ConsoleErrors.sys.mjs';

const tabSnapshot = (overrides = {}) => ({ tab_id: 't_1', document_id: '41',
  private: false, engine: 'gecko', url: 'http://localhost:8080/app', project_id: 'p_synthetic', ...overrides });
const packet = (overrides = {}) => ({ v: 1, document_id: '41', navigation_token: 'n_1', observed_at: 1000, level: 'error',
  text: 'synthetic failure', source: 'http://localhost:8080/app.js', line: 7, ...overrides });
const noRead = label => ({ get() { assert.fail(label + ' must not be read'); }, configurable: true });
const code = expected => error => error instanceof ConsoleErrorsError && error.code === expected;

test('retained ring is 50 messages with passed clock, safe fields and immutable results', () => {
  const store = new ConsoleErrorsStore({ clock: () => 42 });
  for (let i = 0; i < 60; i++) assert.equal(store.record(tabSnapshot(), { level: i % 2 ? 'warning' : 'error',
    text: String(i) + '\u0000\u202e' + 'x'.repeat(1200), source: 'https://user:secret@example.invalid/file.js?token=private#secret', line: i }), true);
  const result = store.getTabErrors(tabSnapshot());
  assert.equal(result.count, MAX_CONSOLE_MESSAGES);
  assert.equal(result.messages[0].text.startsWith('10  '), true);
  assert.equal(result.messages[0].text.length, 1000);
  assert.equal(result.messages[0].source, 'https://example.invalid/file.js');
  assert.equal(result.messages[0].at, 42);
  assert.deepEqual(Object.keys(result.messages[0]), ['level', 'text', 'source', 'line', 'at']);
  assert.throws(() => result.messages.pop(), TypeError);
  assert.throws(() => { result.messages[0].text = 'changed'; }, TypeError);
});

test('source is bounded and privileged, data, extension, local and malformed sources decline', () => {
  assert.equal(sanitizeConsoleSource('https://example.invalid/' + 'x'.repeat(9000)).length, 2048);
  for (const value of ['chrome://browser/app.js', 'resource://gre/a.js', 'about:neterror',
    'moz-extension://id/a.js', 'file:///Users/synthetic/a.js', 'data:text/plain,secret', 'bad', 'https://e.invalid/\nsecret']) {
    assert.equal(sanitizeConsoleSource(value), null, value);
  }
});

test('pure store accepts warning/error only and never retains privileged source or invalid clocks', () => {
  const store = new ConsoleErrorsStore({ clock: () => 1 });
  assert.equal(store.record(tabSnapshot(), { level: 'info', text: 'ignored' }), false);
  assert.equal(store.record(tabSnapshot(), { level: 'error', text: 'ignored', source: 'chrome://browser/a.js' }), false);
  assert.equal(store.getTabErrors(tabSnapshot()).count, 0);
  assert.equal(new ConsoleErrorsStore({ clock: () => NaN }).record(tabSnapshot(), { level: 'error', text: 'ignored' }), false);
  assert.throws(() => new ConsoleErrorsStore(), code('INVALID_CLOCK'));
});

test('navigation, changed document identity, private status and Chromium clear old records', () => {
  const store = new ConsoleErrorsStore({ clock: () => 1 });
  const add = () => store.record(tabSnapshot(), { level: 'error', text: 'old document' });
  add(); assert.equal(store.getTabErrors(tabSnapshot({ document_id: '42' })).count, 0);
  add(); assert.equal(store.getTabErrors(tabSnapshot({ url: 'http://localhost:8080/other' })).count, 0);
  add(); assert.throws(() => store.getTabErrors(tabSnapshot({ private: true })), code('PRIVATE'));
  assert.equal(store.getTabErrors(tabSnapshot()).count, 0);
  add(); assert.throws(() => store.getTabErrors(tabSnapshot({ engine: 'chromium' })), code('UNAVAILABLE'));
  assert.equal(store.getTabErrors(tabSnapshot()).count, 0);
});

test('project counts follow relinking, warning levels, navigation and closing tabs', () => {
  const store = new ConsoleErrorsStore({ clock: () => 1 }), changes = [];
  const off = store.onChange(event => changes.push(event));
  store.record(tabSnapshot(), { level: 'error', text: 'one' });
  store.record(tabSnapshot({ tab_id: 't_2' }), { level: 'warning', text: 'two' });
  assert.deepEqual(store.getProjectCounts(), [{ project_id: 'p_synthetic', count: 2, errors: 1, warnings: 1, tabs: 2 }]);
  assert.equal(store.updateTab(tabSnapshot({ tab_id: 't_2', project_id: 'p_other' })), true);
  assert.deepEqual(store.getProjectCounts().map(value => [value.project_id, value.count]), [['p_synthetic', 1], ['p_other', 1]]);
  store.prune(['t_1']); assert.equal(store.getProjectCounts().length, 1);
  store.forgetTab('t_1'); assert.deepEqual(store.getProjectCounts(), []);
  assert.equal(changes.some(event => event.kind === 'relinked'), true);
  assert.equal(changes.some(event => Object.hasOwn(event, 'text')), false);
  off(); store.dispose();
});

test('live tab storage has a total tab cap', () => {
  const store = new ConsoleErrorsStore({ clock: () => 1 });
  for (let i = 0; i < MAX_CONSOLE_TABS; i++) assert.equal(store.updateTab(tabSnapshot({ tab_id: 't_' + i })), true);
  assert.equal(store.updateTab(tabSnapshot({ tab_id: 't_overflow' })), false);
  store.prune(['t_1']); assert.equal(store.updateTab(tabSnapshot({ tab_id: 't_new' })), true);
});

test('ConsoleAPI primitives avoid object serialization and accessor reads', () => {
  const values = ['plain', 4, false, { toString() { assert.fail('object conversion'); },
    toJSON() { assert.fail('object serialization'); } }, null];
  Object.defineProperty(values, '5', noRead('array getter'));
  assert.equal(consolePrimitiveText(values), 'plain 4 false');
  assert.equal(consolePrimitiveText([{}]), null);
  assert.equal(consolePrimitiveText(['x'.repeat(5000)]).length, 1000);
});

test('packet contract rejects extra keys, getters, objects, unsupported fields and oversized output', () => {
  assert.deepEqual(validateConsolePacket(packet()), packet());
  for (const invalid of [packet({ extra: true }), packet({ v: 2 }), packet({ document_id: 'jsm' }),
    packet({ level: 'log' }), packet({ text: {} }), packet({ text: 'x'.repeat(1001) }),
    packet({ source: 'x'.repeat(2049) }), packet({ line: -1 }), packet({ source: 'about:neterror' })]) {
    assert.equal(validateConsolePacket(invalid), null);
  }
  const getterPacket = packet(); Object.defineProperty(getterPacket, 'text', noRead('packet getter'));
  assert.equal(validateConsolePacket(getterPacket), null);
});

test('pure private store declines before reading a supplied log payload', () => {
  const store = new ConsoleErrorsStore({ clock: () => 1 });
  const payload = {}; Object.defineProperty(payload, 'text', noRead('private store text'));
  Object.defineProperty(payload, 'source', noRead('private store source'));
  assert.equal(store.record(tabSnapshot({ private: true }), payload), false);
});

test('packet validation accepts a plain structured-clone shape from another global', () => {
  const value = runInNewContext('({v:1,document_id:"41",navigation_token:"n_1",observed_at:1000,level:"error",text:"synthetic failure",source:"http://localhost:8080/app.js",line:7})');
  assert.deepEqual(validateConsolePacket(value), packet());
  assert.equal(validateConsolePacket(Object.assign(new Date(), packet())), null);
});

test('private store snapshots do not read document metadata before privacy', () => {
  const store = new ConsoleErrorsStore({ clock: () => 1 }), snapshot = tabSnapshot({ private: true });
  Object.defineProperty(snapshot, 'url', noRead('private snapshot URL'));
  Object.defineProperty(snapshot, 'document_id', noRead('private snapshot document identity'));
  assert.equal(store.record(snapshot, { level: 'error', text: 'private' }), false);
});
