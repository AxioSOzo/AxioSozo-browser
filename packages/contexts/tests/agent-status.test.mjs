/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Agent status records, the status board and hook snippets (workstation-v1 §5).
import test from 'node:test';
import assert from 'node:assert/strict';
import { ContextsError, STATUS_STATES, hookConfig, parseHookEvent, statusBoard, validateStatusRecord } from '../src/index.mjs';

const throwsCode = (fn, code, path) => assert.throws(fn, e => e instanceof ContextsError && e.code === code && (path === undefined || e.path === path), `${code} ${path ?? ''}`);
const ID = 'as_0123456789abcdef';
const NOW = 1790000000000;
const ev = (source, event, payload, over = {}) => parseHookEvent({ source, event, cwd: '/Users/me/Code/app', payload, now: NOW, id: ID, ...over });

test('claude-code hooks: Stop, Notification, UserPromptSubmit, SessionStart; SubagentStop ignored', () => {
  const stop = ev('claude-code', 'Stop', { session_id: 'abc-123', transcript_path: '/Users/me/.claude/x.jsonl', cwd: '/Users/me/Code/app/apps/web', stop_hook_active: false });
  assert.deepEqual(stop, { version: 1, id: ID, project_path: '/Users/me/Code/app/apps/web', agent: 'claude-code', state: 'done', title: 'Agent finished', at: NOW, session: 'abc-123' });
  assert.ok(Object.isFrozen(stop));
  assert.doesNotMatch(JSON.stringify(stop), /transcript|jsonl/, 'the transcript is never used');
  const note = ev('claude-code', 'Notification', { message: '  Claude needs your\npermission to use   Bash ', session_id: 's' });
  assert.deepEqual([note.state, note.title], ['needs_input', 'Claude needs your permission to use Bash']);
  assert.equal(ev('claude-code', 'Notification', { message: 'x'.repeat(500) }).title.length, 120);
  assert.equal(ev('claude-code', 'Notification', {}).title, 'Agent needs input');
  assert.deepEqual([ev('claude-code', 'UserPromptSubmit', { prompt: 'secret prompt text' }).state, ev('claude-code', 'SessionStart', {}).title], ['started', 'Agent started']);
  assert.doesNotMatch(JSON.stringify(ev('claude-code', 'UserPromptSubmit', { prompt: 'secret prompt text' })), /secret/);
  assert.equal(ev('claude-code', 'SubagentStop', {}), null);
  assert.equal(ev('claude-code', 'PreToolUse', {}), null);
  assert.equal(ev('claude-code', 'constructor', {}), null);
  assert.equal(ev('claude-code', 'Stop', { cwd: 'relative/dir' }).project_path, '/Users/me/Code/app', 'relative payload cwd falls back');
  assert.equal(ev('claude-code', 'Stop', { session_id: 'x'.repeat(65) }).session, null);
  assert.equal(ev('claude-code', 'Stop', { session_id: 'a\nb' }).session, null);
  assert.equal(ev('claude-code', 'Stop', JSON.stringify({ session_id: 'from-text' })).session, 'from-text', 'stdin text is accepted');
});

test('codex notify: agent-turn-complete only, title from the last message', () => {
  const r = ev('codex', undefined, { type: 'agent-turn-complete', 'thread-id': 't-1', 'turn-id': '7', 'input-messages': ['do the thing'], 'last-assistant-message': 'Done.\n\nI updated   the parser and added tests.' });
  assert.deepEqual([r.agent, r.state, r.title, r.session], ['codex', 'done', 'Done. I updated the parser and added tests.', 't-1']);
  assert.doesNotMatch(JSON.stringify(r), /do the thing/);
  assert.equal(ev('codex', undefined, { type: 'agent-turn-complete' }).title, 'Agent finished');
  assert.equal(ev('codex', undefined, { type: 'agent-turn-complete', 'last-assistant-message': 'é'.repeat(300) }).title.length, 120);
  assert.equal(ev('codex', undefined, { type: 'something-else' }), null);
});

test('manual reports: the event is the state', () => {
  for (const state of STATUS_STATES) assert.equal(ev('manual', state, { title: `t ${state}` }).state, state);
  assert.deepEqual([ev('manual', 'failed', {}).title, ev('manual', 'failed', {}).agent], ['Agent failed', 'other']);
  assert.equal(ev('manual', 'done', { agent: 'codex' }).agent, 'codex');
  assert.equal(ev('manual', 'paused', {}), null);
});

test('malformed input → null, never throws', () => {
  const huge = { message: 'x'.repeat(70000) };
  const cyclic = {}; cyclic.self = cyclic;
  const cases = [
    ['claude-code', 'Stop', huge], ['claude-code', 'Stop', 'x'.repeat(70000)], ['claude-code', 'Stop', cyclic], ['claude-code', 'Stop', [1, 2]],
    ['claude-code', 'Stop', 'not json'], ['claude-code', 'Stop', 7], ['claude-code', 'Stop', { big: 10n }], ['other', 'Stop', {}], [undefined, 'Stop', {}],
  ];
  for (const [source, event, payload] of cases) assert.equal(ev(source, event, payload), null, `${source} ${typeof payload}`);
  assert.equal(ev('claude-code', 'Stop', {}, { cwd: 'relative' }), null, 'needs an absolute project path');
  assert.equal(ev('claude-code', 'Stop', {}, { now: -1 }), null);
  assert.equal(ev('claude-code', 'Stop', {}, { id: 'as_XYZ' }), null);
  assert.equal(parseHookEvent(), null);
  assert.equal(parseHookEvent(null), null);
  const hostile = new Proxy({}, { get() { throw new Error('boom'); }, ownKeys() { throw new Error('boom'); } });
  assert.equal(ev('claude-code', 'Stop', hostile), null);
});

test('validateStatusRecord', () => {
  const rec = { version: 1, id: ID, project_path: '/p', agent: 'other', state: 'done', title: 'ok', at: 1, session: null };
  assert.deepEqual(validateStatusRecord(rec), rec);
  for (const [k, v] of [['version', 2], ['id', 'as_123'], ['project_path', 'rel'], ['project_path', '/'], ['agent', 'gpt'], ['state', 'idle'], ['title', ''], ['title', 'a\nb'],
    ['title', 'x'.repeat(121)], ['at', -1], ['session', ''], ['session', 'x'.repeat(65)]]) {
    throwsCode(() => validateStatusRecord({ ...rec, [k]: v }), 'INVALID_STATUS', `$.${k}`);
  }
  throwsCode(() => validateStatusRecord({ ...rec, transcript: 'x' }), 'INVALID_STATUS', '$.transcript');
  const { session: _s, ...missing } = rec;
  throwsCode(() => validateStatusRecord(missing), 'INVALID_STATUS', '$.session');
});

test('statusBoard: newest first per project, ≤ 20, older than keepMs dropped', () => {
  const r = (i, path, at, state = 'done') => ({ version: 1, id: `as_${i.toString(16).padStart(16, '0')}`, project_path: path, agent: 'claude-code', state, title: `t${i}`, at, session: null });
  const H = 3600000;
  const records = [
    r(1, '/a', NOW - 25 * H), r(2, '/a', NOW - 2 * H, 'started'), r(3, '/b', NOW - H, 'needs_input'), r(4, '/a', NOW - 30 * 60000), r(5, '/a', NOW - 30 * 60000, 'failed'),
    { bogus: true }, null,
  ];
  const board = statusBoard(records, { now: NOW });
  assert.deepEqual(board.map(b => [b.project_path, b.latest.title, b.history.map(h => h.title)]), [['/a', 't5', ['t5', 't4', 't2']], ['/b', 't3', ['t3']]]);
  assert.ok(Object.isFrozen(board) && Object.isFrozen(board[0].history));
  assert.deepEqual(statusBoard(records, { now: NOW, keepMs: H }).map(b => [b.project_path, b.history.length]), [['/a', 2], ['/b', 1]], 'exactly keepMs old is kept');
  const many = Array.from({ length: 30 }, (_, i) => r(i + 10, '/c', NOW - i));
  assert.equal(statusBoard(many, { now: NOW })[0].history.length, 20);
  assert.equal(statusBoard(many, { now: NOW })[0].latest.title, 't10');
  assert.deepEqual(statusBoard(null, { now: NOW }), []);
  throwsCode(() => statusBoard([], {}), 'INVALID_INPUT', '$.now');
  throwsCode(() => statusBoard([], { now: NOW, keepMs: -1 }), 'INVALID_INPUT', '$.keepMs');
});

test('hookConfig: copyable snippets use literal argv and the current socket', () => {
  const path = '/Users/me/Code/AxioSozo browser/tools/axiosozo-notify/axiosozo-notify';
  const socketPath = '/Volumes/AxioSozoBuild/workstation/p4c-test/gecko/.a/s';
  const claude = JSON.parse(hookConfig({ agent: 'claude-code', notifyPath: path, socketPath }));
  assert.deepEqual(Object.keys(claude.hooks), ['Stop', 'Notification', 'UserPromptSubmit']);
  for (const event of ['Stop', 'Notification', 'UserPromptSubmit']) {
    assert.deepEqual(claude.hooks[event], [{ hooks: [{ type: 'command', command: '/usr/bin/env', args: [`AXIOSOZO_AGENT_SOCKET=${socketPath}`, '/bin/sh', path, 'claude-code', event], timeout: 5 }] }]);
  }
  assert.equal(hookConfig({ agent: 'codex', notifyPath: path, socketPath }), `notify = ${JSON.stringify(['/usr/bin/env', `AXIOSOZO_AGENT_SOCKET=${socketPath}`, '/bin/sh', path, 'codex'])}\n`);
  for (const bad of ['relative/notify', '/a\nb', '/a/../b', '', '/', null]) {
    throwsCode(() => hookConfig({ agent: 'codex', notifyPath: bad, socketPath }), 'INVALID_INPUT', '$.notifyPath');
  }
  throwsCode(() => hookConfig({ agent: 'cursor', notifyPath: path, socketPath }), 'INVALID_INPUT', '$.agent');
});
