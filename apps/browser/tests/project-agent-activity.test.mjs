import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHookEvent, validateStatusRecord } from '../../../packages/contexts/src/agent-status.mjs';
import { createProjectAgentActivity, PROJECT_AGENT_ACTIVITY_LIMITS as LIMITS } from '../chrome/ProjectAgentActivity.sys.mjs';

const PROJECT = 'p_harbor', ROOT = '/synthetic/harbor';
const target = (changes = {}) => ({ project_id: PROJECT, tab_id: 't_1', navigation_id: 'n_41', user_context_id: 3, ...changes });
const projects = (...values) => Object.freeze(values.map(value => Object.freeze({ ...value })));
const initialProjects = () => projects({ id: PROJECT, root: ROOT });
const status = (id = 1, changes = {}) => validateStatusRecord({ version: 1,
  id: 'as_' + id.toString(16).padStart(16, '0'), project_path: ROOT + '/apps/web',
  agent: 'claude-code', state: 'started', title: 'fixture-status', at: 1000, session: null, ...changes });

function harness({ time = 1000, projectCache = initialProjects(), callback = null, validator = validateStatusRecord } = {}) {
  let cache = projectCache, current = time, next = 0, closedTimers = [];
  const tasks = new Map(), changes = [];
  const api = createProjectAgentActivity({ getProjects: () => typeof cache === 'function' ? cache() : cache,
    validateStatusRecord: validator, now: () => current, timers: {
      setTimeout: (run, delay) => { const id = ++next; tasks.set(id, { run, at: current + delay, delay }); return id; },
      clearTimeout: id => { closedTimers.push(id); tasks.delete(id); },
    }, onChange: change => { changes.push(change); return callback?.(change, api); } });
  return { api, tasks, changes, closedTimers,
    cache: value => { cache = value; }, time: value => { current = value; },
    advance: value => {
      const finish = current + value;
      let steps = 0;
      while (true) {
        const next = [...tasks.entries()].filter(([, value]) => value.at <= finish)
          .sort(([a, x], [b, y]) => x.at - y.at || a - b)[0];
        if (!next) break;
        if (++steps > 10000) throw new Error('FAKE_TIMER_SPIN');
        current = next[1].at; tasks.delete(next[0]); next[1].run();
      }
      current = finish;
    }, fire: id => { const job = tasks.get(id); tasks.delete(id); job?.run(); } };
}

const immutable = value => {
  if (value && typeof value === 'object') {
    assert.equal(Object.isFrozen(value), true);
    for (const child of Object.values(value)) immutable(child);
  }
};

test('real hook parser records group subdirectories into one known project root', () => {
  const h = harness();
  for (const [id, cwd] of [[1, ROOT + '/apps/web'], [2, ROOT + '/packages/core']]) {
    const record = parseHookEvent({ source: 'manual', event: 'done', cwd,
      payload: { title: 'fixture-status' }, now: 1000, id: 'as_' + id.toString(16).padStart(16, '0') });
    assert.equal(h.api.accept(record, PROJECT), true);
  }
  const board = h.api.snapshot();
  assert.equal(board.length, 1);
  assert.equal(board[0].project_id, PROJECT);
  assert.equal(board[0].project_path, ROOT);
  assert.equal(board[0].history.length, 2);
  assert.equal(board[0].latest.id, 'as_0000000000000002');
  assert.deepEqual(Object.keys(board[0].latest), ['version', 'id', 'project_path', 'agent', 'state', 'title', 'at', 'session']);
  assert.equal(board[0].history.every(value => value.project_path === ROOT), true);
  immutable(board); immutable(h.api.attention());
  assert.equal(h.api.snapshot(PROJECT).length, 1);
  assert.deepEqual(h.api.snapshot('p_other'), []);
  assert.deepEqual(h.api.snapshot('bad'), []);
});

test('longest nested root wins and sibling prefixes never match', () => {
  const h = harness({ projectCache: projects({ id: PROJECT, root: ROOT }, { id: 'p_nested', root: ROOT + '/apps/web' }) });
  assert.equal(h.api.accept(status(1), PROJECT), false);
  assert.equal(h.api.accept(status(1), 'p_nested'), true);
  assert.equal(h.api.accept(status(2, { project_path: ROOT + '2/apps' }), PROJECT), false);
  assert.equal(h.api.accept(status(3, { project_path: '/synthetic/other' }), PROJECT), false);
  assert.equal(h.api.snapshot()[0].project_path, ROOT + '/apps/web');
});

test('equal root ties agree with the channel stable first project match', () => {
  const h = harness({ projectCache: projects({ id: PROJECT, root: ROOT }, { id: 'p_second', root: ROOT }) });
  assert.equal(h.api.accept(status(1), 'p_second'), false);
  assert.equal(h.api.accept(status(1), PROJECT), true);
});

test('validation happens before normalization and raw/unknown payloads are never retained', () => {
  const h = harness();
  const input = { ...status(1), raw_payload: { secret: 'must-not-retain' } };
  assert.equal(h.api.accept(input, PROJECT), false);
  assert.equal(h.api.accept({ message: 'raw-hook' }, PROJECT), false);
  assert.equal(h.api.accept({ ...status(1), state: 'invented' }, PROJECT), false);
  assert.equal(h.api.accept({ ...status(1), title: '' }, PROJECT), false);
  assert.equal(h.api.accept(status(1), 'p_wrong'), false);
  assert.deepEqual(h.api.snapshot(), []);
  assert.equal(h.tasks.size, 0);
});

test('getter and symbol fields are refused without reading or retaining them', () => {
  const h = harness();
  let reads = 0;
  const input = { ...status(1) };
  Object.defineProperty(input, 'title', { get() { reads++; throw new Error('untrusted-getter'); }, enumerable: true });
  assert.equal(h.api.accept(input, PROJECT), false);
  assert.equal(reads, 0);
  assert.equal(h.api.accept({ ...status(1), [Symbol('payload')]: 'private' }, PROJECT), false);
  const value = target();
  Object.defineProperty(value, 'tab_id', { get() { reads++; return 't_1'; }, enumerable: true });
  assert.equal(h.api.rememberReturnTarget(value), false);
  assert.equal(reads, 0);
});

test('status validator permissive paths are rejected at strict containment seam', () => {
  const h = harness();
  for (const path of [ROOT + '/../harbor/apps', ROOT + '/./apps', ROOT + '/\napps', ROOT + '/\u0080apps', ROOT + '//apps']) {
    const record = status(1, { project_path: path });
    assert.equal(h.api.accept(record, PROJECT), false, JSON.stringify(path));
  }
  assert.equal(h.api.accept(status(2, { project_path: ROOT + '/' }), PROJECT), true);
});

test('validator-produced copy and return targets never retain mutable input references', () => {
  const h = harness();
  const input = { ...status(1) };
  assert.equal(h.api.accept(input, PROJECT), true);
  input.title = 'changed-after-accept'; input.project_path = '/synthetic/elsewhere';
  assert.equal(h.api.snapshot()[0].latest.title, 'fixture-status');
  const value = target();
  assert.equal(h.api.rememberReturnTarget(value), true);
  value.tab_id = 't_2';
  assert.equal(h.api.returnTarget(PROJECT).tab_id, 't_1');
  immutable(h.api.returnTarget(PROJECT));
  assert.throws(() => { h.api.returnTarget(PROJECT).navigation_id = 'changed'; }, TypeError);
});

test('unfrozen or malformed validator results are not trusted', () => {
  for (const validator of [value => ({ ...value }), () => null,
    value => Object.freeze({ ...value, raw: 'payload' }), value => Object.freeze({ ...value, title: '\n' })]) {
    const h = harness({ validator });
    assert.equal(h.api.accept(status(1), PROJECT), false);
    assert.deepEqual(h.api.snapshot(), []);
  }
});

test('invalid cache hides all authority while preserving history until successful refresh', () => {
  const h = harness();
  h.api.accept(status(1, { state: 'done' }), PROJECT);
  h.api.rememberReturnTarget(target());
  h.cache(null);
  assert.equal(h.api.accept(status(2), PROJECT), false);
  assert.equal(h.api.rememberReturnTarget(target()), false);
  assert.equal(h.api.synchronizeProjects(), false);
  assert.deepEqual(h.api.snapshot(), []);
  assert.deepEqual(h.api.attention(), []);
  assert.equal(h.api.returnTarget(PROJECT), null);
  h.cache(() => { throw new Error('CACHE_FAILURE'); });
  assert.equal(h.api.synchronizeProjects(), false);
  h.cache(initialProjects());
  assert.equal(h.api.snapshot()[0].history.length, 1);
  assert.deepEqual(h.api.returnTarget(PROJECT), target());
  assert.equal(h.api.synchronizeProjects(), true);
});

test('successful empty refresh purges retained history and targets permanently', () => {
  const h = harness();
  h.api.accept(status(1), PROJECT); h.api.rememberReturnTarget(target());
  h.cache(Object.freeze([]));
  assert.deepEqual(h.api.snapshot(), []);
  assert.equal(h.api.returnTarget(PROJECT), null);
  // Merely reading a temporarily empty cache does not perform the refresh.
  h.cache(initialProjects());
  assert.equal(h.api.snapshot().length, 1);
  h.cache(Object.freeze([]));
  assert.equal(h.api.synchronizeProjects(), true);
  assert.equal(h.tasks.size, 0);
  h.cache(initialProjects());
  assert.deepEqual(h.api.snapshot(), []); assert.equal(h.api.returnTarget(PROJECT), null);
});

test('removed projects and changed roots lose activity and targets on successful refresh', () => {
  for (const replacement of [projects({ id: PROJECT, root: '/synthetic/new-root' }), projects({ id: 'p_replaced', root: ROOT })]) {
    const h = harness();
    h.api.accept(status(1), PROJECT); h.api.rememberReturnTarget(target());
    h.cache(replacement);
    assert.deepEqual(h.api.snapshot(), []); assert.equal(h.api.returnTarget(PROJECT), null);
    assert.equal(h.api.synchronizeProjects(), true);
    h.cache(initialProjects());
    assert.deepEqual(h.api.snapshot(), []); assert.equal(h.api.returnTarget(PROJECT), null);
  }
});

test('new-root acceptance before synchronization never inherits old-root records or target', () => {
  const h = harness();
  h.api.accept(status(1), PROJECT); h.api.rememberReturnTarget(target());
  h.cache(projects({ id: PROJECT, root: '/synthetic/new-root' }));
  assert.equal(h.api.accept(status(2, { project_path: '/synthetic/new-root/app' }), PROJECT), true);
  assert.equal(h.api.snapshot()[0].history.length, 1);
  assert.equal(h.api.snapshot()[0].latest.id, 'as_0000000000000002');
  assert.equal(h.api.returnTarget(PROJECT), null);
});

test('current-cache malformed, duplicate or mutable records fail closed without purging old history', () => {
  const h = harness();
  h.api.accept(status(1), PROJECT);
  for (const bad of [[], [{ id: PROJECT, root: ROOT }], Object.freeze([{ id: PROJECT, root: ROOT }]),
    projects({ id: PROJECT, root: ROOT }, { id: PROJECT, root: '/synthetic/other' }),
    projects({ id: 'bad', root: ROOT }), projects({ id: PROJECT, root: ROOT + '/../other' }),
    projects(...Array.from({ length: 513 }, (_, i) => ({ id: 'p_' + i.toString().padStart(4, '0'), root: '/synthetic/' + i })))]) {
    h.cache(bad);
    assert.equal(h.api.synchronizeProjects(), false);
    assert.deepEqual(h.api.snapshot(), []);
  }
  h.cache(initialProjects()); assert.equal(h.api.snapshot().length, 1);
});

test('one quiet TTL timer retains exact 24h boundary and expires at +1ms without any new status', () => {
  const h = harness();
  h.api.accept(status(1), PROJECT);
  assert.equal(h.tasks.size, 1);
  assert.equal([...h.tasks.values()][0].delay, LIMITS.keepMs + 1);
  h.advance(LIMITS.keepMs);
  assert.equal(h.api.snapshot().length, 1);
  h.advance(1);
  assert.equal(h.tasks.size, 0);
  assert.deepEqual(h.api.snapshot(), []);
  assert.equal(h.changes.at(-1).kind, 'expired');
});

test('future and already expired records are refused and cannot extend retained lifetime', () => {
  const h = harness({ time: LIMITS.keepMs + 1000 });
  assert.equal(h.api.accept(status(1, { at: LIMITS.keepMs + 1001 }), PROJECT), false);
  assert.equal(h.api.accept(status(2, { at: 999 }), PROJECT), false);
  assert.equal(h.api.accept(status(3), PROJECT), true);
  assert.equal([...h.tasks.values()][0].delay, 1);
  h.advance(1); assert.deepEqual(h.api.snapshot(), []);
});

test('timer expires retained activity while invalid cache never exposes stale project IDs', () => {
  const h = harness();
  h.api.accept(status(1, { state: 'needs_input' }), PROJECT);
  h.cache(null); h.advance(LIMITS.keepMs + 1);
  assert.deepEqual(h.api.snapshot(), []);
  assert.deepEqual(h.changes.at(-1), { kind: 'expired' });
  h.cache(initialProjects()); assert.deepEqual(h.api.snapshot(), []);
});

test('cancelled old timer callbacks cannot prune newer accepted history', () => {
  const h = harness();
  h.api.accept(status(1), PROJECT);
  const previous = [...h.tasks.values()][0].run;
  h.time(1001); h.api.accept(status(2, { at: 1001 }), PROJECT);
  const current = [...h.tasks.values()][0];
  previous();
  assert.equal(h.tasks.size, 1); assert.equal([...h.tasks.values()][0], current);
  assert.equal(h.api.snapshot()[0].history.length, 2);
});

test('history retains newest20 and later accepted equal timestamps sort first', () => {
  const h = harness();
  for (let id = 1; id <= 50; id++) assert.equal(h.api.accept(status(id), PROJECT), true);
  const history = h.api.snapshot()[0].history;
  assert.equal(history.length, LIMITS.history);
  assert.equal(history[0].id, 'as_0000000000000032');
  assert.equal(history.at(-1).id, 'as_000000000000001f');
  assert.equal(h.tasks.size, 1);
});

test('older out-of-order reports cannot replace latest status and duplicate IDs are immutable', () => {
  const h = harness();
  const first = status(1, { state: 'done' });
  assert.equal(h.api.accept(first, PROJECT), true);
  const notifications = h.changes.length;
  assert.equal(h.api.accept({ ...first }, PROJECT), true);
  assert.equal(h.changes.length, notifications);
  assert.equal(h.api.accept(status(1, { state: 'failed' }), PROJECT), false);
  assert.equal(h.api.accept(status(2, { at: 900, state: 'started' }), PROJECT), true);
  assert.equal(h.api.attention()[0].latest.state, 'done');
  assert.equal(h.api.snapshot()[0].history.length, 2);
});

test('attention includes only latest needs_input done or failed, never historical or target-only state', () => {
  for (const state of ['started', 'needs_input', 'done', 'failed']) {
    const h = harness();
    h.api.accept(status(1, { state: 'done' }), PROJECT);
    h.api.accept(status(2, { state }), PROJECT);
    assert.equal(h.api.attention().length, state === 'started' ? 0 : 1);
  }
  const h = harness(); h.api.rememberReturnTarget(target());
  assert.deepEqual(h.api.snapshot(), []); assert.deepEqual(h.api.attention(), []);
});

test('global capacity holds 128project groups and2560 records, evicting deterministic oldest group', () => {
  const all = projects(...Array.from({ length: 129 }, (_, i) => ({ id: 'p_' + i.toString().padStart(4, '0'), root: '/synthetic/' + i })));
  const h = harness({ projectCache: all });
  for (const [i, project] of all.entries()) for (let offset = 1; offset <= 20; offset++)
    assert.equal(h.api.accept(status(i * 20 + offset, { project_path: project.root + '/app' }), project.id), true);
  const snapshot = h.api.snapshot();
  assert.equal(snapshot.length, LIMITS.projects);
  assert.equal(snapshot.reduce((sum, group) => sum + group.history.length, 0), LIMITS.records);
  assert.equal(snapshot.some(group => group.project_id === 'p_0000'), false);
  assert.equal(snapshot.some(group => group.project_id === 'p_0128'), true);
  assert.equal(h.tasks.size, 1);
});

test('target-only entries share the project capacity and never escape retention bounds', () => {
  const all = projects(...Array.from({ length: 129 }, (_, i) => ({ id: 'p_' + i.toString().padStart(4, '0'), root: '/synthetic/' + i })));
  const h = harness({ projectCache: all });
  for (const [i, project] of all.entries()) assert.equal(h.api.rememberReturnTarget(target({ project_id: project.id, tab_id: 't_' + (i + 1) })), true);
  assert.equal(h.api.returnTarget('p_0000'), null);
  assert.equal(all.filter(project => h.api.returnTarget(project.id)).length, LIMITS.projects);
  assert.equal(h.tasks.size, 0);
});

test('return target four-field shape accepts only canonical positive safe native tab IDs and public jars', () => {
  const h = harness();
  for (const [tab, jar] of [['t_1', 0], ['t_9007199254740991', 4294967294]]) {
    assert.equal(h.api.rememberReturnTarget(target({ tab_id: tab, user_context_id: jar })), true);
    assert.deepEqual(Object.keys(h.api.returnTarget(PROJECT)), ['project_id', 'tab_id', 'navigation_id', 'user_context_id']);
  }
  for (const tab of ['t_0', 't_01', 't_-1', 't_1.0', 't_9007199254740992', 't_10000000000000000', 't_1\n'])
    assert.equal(h.api.rememberReturnTarget(target({ tab_id: tab })), false, tab);
  for (const jar of [-1, 1.5, 4294967295, '2', NaN])
    assert.equal(h.api.rememberReturnTarget(target({ user_context_id: jar })), false);
  for (const navigation of ['', 'x'.repeat(129), 'n_41\n', 'n_41\u0080', 'https://fixture.invalid', 'prose with spaces', 'n_41?x=1', 'n_41/path'])
    assert.equal(h.api.rememberReturnTarget(target({ navigation_id: navigation })), false);
  assert.equal(h.api.rememberReturnTarget(target({ project_id: 'p_other' })), false);
  assert.equal(h.api.rememberReturnTarget(target({ url: 'https://fixture.invalid' })), false);
  assert.equal(h.api.rememberReturnTarget(target({ title: 'fixture' })), false);
});

test('return targets outlive status TTL as native identity data until explicit project invalidation', () => {
  const h = harness();
  h.api.accept(status(1), PROJECT); h.api.rememberReturnTarget(target());
  h.advance(LIMITS.keepMs + 1);
  assert.deepEqual(h.api.snapshot(), []);
  assert.deepEqual(h.api.returnTarget(PROJECT), target());
  h.cache(Object.freeze([])); h.api.synchronizeProjects();
  assert.equal(h.api.returnTarget(PROJECT), null);
});

test('callbacks expose immutable kind-only machine envelopes and callback errors cannot corrupt data', () => {
  const h = harness({ callback: () => { throw new Error('observer-failure'); } });
  assert.equal(h.api.accept(status(1), PROJECT), true);
  assert.equal(h.api.rememberReturnTarget(target()), true);
  for (const event of h.changes) { assert.deepEqual(Object.keys(event), ['kind']); immutable(event); }
  assert.equal(h.api.snapshot().length, 1);
});

test('close clears data and owned timer and stale callback cannot resurrect activity', () => {
  const h = harness();
  h.api.accept(status(1), PROJECT); h.api.rememberReturnTarget(target());
  const old = [...h.tasks.values()][0].run;
  h.api.close(); h.api.close(); old();
  assert.equal(h.tasks.size, 0);
  assert.deepEqual(h.api.snapshot(), []); assert.deepEqual(h.api.attention(), []);
  assert.equal(h.api.returnTarget(PROJECT), null);
  assert.equal(h.api.accept(status(2), PROJECT), false);
  assert.equal(h.api.rememberReturnTarget(target()), false);
  assert.equal(h.api.synchronizeProjects(), false);
  assert.equal(h.changes.filter(event => event.kind === 'closed').length, 1);
});

test('callback close after acceptance owns no active timer or stale return data', () => {
  const h = harness({ callback: (change, api) => { if (change.kind === 'accepted') api.close(); } });
  assert.equal(h.api.accept(status(1), PROJECT), true);
  assert.equal(h.tasks.size, 0); assert.deepEqual(h.api.snapshot(), []);
});

test('bad dependencies and synchronous/throwing timers fail closed without recursion', () => {
  assert.throws(() => createProjectAgentActivity(), { code: 'INVALID_ACTIVITY_DEPENDENCIES' });
  for (const setTimeout of [run => { run(); return 1; }, () => { throw new Error('TIMER_FAILURE'); }]) {
    const changes = [], cleared = [];
    const api = createProjectAgentActivity({ getProjects: initialProjects, validateStatusRecord,
      now: () => 1000, timers: { setTimeout, clearTimeout: value => cleared.push(value) }, onChange: change => changes.push(change) });
    assert.equal(api.accept(status(1), PROJECT), false);
    assert.deepEqual(api.snapshot(), []);
    assert.equal(api.rememberReturnTarget(target()), false);
    assert.deepEqual(changes.at(-1), { kind: 'unavailable' });
  }
});

test('invalid clock hides data and a valid resumed clock still expires quiet retained activity', () => {
  const h = harness(); h.api.accept(status(1), PROJECT);
  h.time(NaN);
  assert.deepEqual(h.api.snapshot(), []); assert.equal(h.api.accept(status(2), PROJECT), false);
  assert.equal(h.api.synchronizeProjects(), true);
  assert.equal(h.tasks.size, 1);
  h.time(1000); h.advance(LIMITS.keepMs + 1);
  assert.deepEqual(h.api.snapshot(), []); assert.equal(h.tasks.size, 0);
});


test('snapshot expiry callback invalidating cache cannot expose a stale project snapshot', () => {
  let invalidate = false, h;
  h = harness({ callback: change => { if (invalidate && change.kind === 'expired') h.cache(null); } });
  h.api.accept(status(1), PROJECT);
  h.time(1001); h.api.accept(status(2, { at: 1001 }), PROJECT);
  invalidate = true; h.time(1000 + LIMITS.keepMs + 1);
  assert.deepEqual(h.api.snapshot(), []);
  h.cache(initialProjects());
  assert.equal(h.api.snapshot()[0].latest.id, 'as_0000000000000002');
});

test('hostile non-data inputs and coercible IDs are refused without executing coercion', () => {
  const h = harness();
  const hostile = new Proxy({}, { getPrototypeOf() { throw new Error('NO_ACCESS'); } });
  assert.equal(h.api.accept(hostile, PROJECT), false);
  assert.equal(h.api.rememberReturnTarget(hostile), false);
  let coerced = 0;
  const id = { toString() { coerced++; return PROJECT; } };
  assert.equal(h.api.accept(status(1), id), false);
  assert.deepEqual(h.api.snapshot(id), []);
  assert.equal(h.api.returnTarget(id), null);
  assert.equal(h.api.rememberReturnTarget(target({ project_id: id })), false);
  assert.equal(coerced, 0);
});


test('backwards clock adjustments never schedule beyond the bounded native timer range', () => {
  const h = harness({ time: Number.MAX_SAFE_INTEGER - 1 });
  assert.equal(h.api.accept(status(1, { at: Number.MAX_SAFE_INTEGER - 1 }), PROJECT), true);
  h.time(1);
  assert.equal(h.api.synchronizeProjects(), true);
  assert.equal([...h.tasks.values()][0].delay, LIMITS.keepMs + 1);
  h.api.close(); assert.equal(h.tasks.size, 0);
});


test('rejected asynchronous observer result is handled without waiting for UI completion', async () => {
  const h = harness({ callback: () => Promise.reject(new Error('ASYNC_OBSERVER_FAILURE')) });
  assert.equal(h.api.accept(status(1), PROJECT), true);
  assert.equal(h.api.rememberReturnTarget(target()), true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.api.snapshot().length, 1);
  h.api.close();
  await new Promise(resolve => setImmediate(resolve));
});
