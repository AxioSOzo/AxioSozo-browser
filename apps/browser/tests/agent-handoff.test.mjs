import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHandoffContext, createHandoff, handoffPolicy, handoffWebUrl, serializeHandoffContext, validateHandoffContext, HANDOFF_LIMITS } from '../chrome/AgentHandoff.sys.mjs';
import { isSensitiveHost } from '../../../packages/contexts/src/rules.mjs';
const id = 'hf_0123456789abcdef';
const tab = () => ({ tab_id: 't_1', navigation_id: 'nav1', url: 'http://localhost:8432/result?q=token#section', is_private: false,
  blocked_category: false, password_risk: false, project: { id: 'p_123456789abc', root: '/Volumes/T9/Code/harbor-suite' } });
const capture = () => ({ tab_id: 't_1', navigation_id: 'nav1', url: tab().url, title: 'Synthetic result', selection: 'render failed\nline two', screen: null,
  console_errors: [{ level: 'error', text: 'Synthetic error', source: 'http://localhost:8432/app.js?secret=1#L2', line: 2, at: 1000 }] });
const build = (extra = {}) => buildHandoffContext({ request_id: id, created_at: 1000, tab: tab(), task: 'Inspect this result', capture: capture(), ...extra }, { isSensitiveHost });
const request = (extra = {}) => ({ request_id: id, tab_id: 't_1', task: 'Inspect this result', target: 'clipboard', ...extra });
function fixture(extra = {}) {
  const calls = []; const copied = [];
  const deps = { tabs: { describe: async () => { calls.push('describe'); return tab(); }, capture: async (_, options) => { calls.push(['capture', options]); return capture(); } },
    isSensitiveHost, isUserRequest: async () => true, clipboard: { write: async text => { copied.push(text); } }, clock: () => 1000, ...extra };
  return { service: createHandoff(deps), calls, copied, deps };
}
function png(width = 1, height = 1, count = 33) {
  const bytes = Buffer.alloc(count); Buffer.from([137,80,78,71,13,10,26,10]).copy(bytes); bytes.writeUInt32BE(13, 8); bytes.write('IHDR', 12);
  bytes.writeUInt32BE(width, 16); bytes.writeUInt32BE(height, 20);
  return { mime: 'image/png', width, height, data_base64: bytes.toString('base64') };
}
test('structured context strips query/fragment and copies only the allowlisted data', () => {
  const context = build(); assert.equal(context.page.url, 'http://localhost:8432/result');
  assert.equal(context.console_errors[0].source, 'http://localhost:8432/app.js');
  assert.deepEqual(JSON.parse(serializeHandoffContext(context)), context); assert(Object.isFrozen(context.page));
  const input = capture(); const copy = build({ capture: input }); input.console_errors[0].text = 'changed'; assert.equal(copy.console_errors[0].text, 'Synthetic error');
});
test('private/blocked/password/unknown privacy facts are rejected before any capture getter is read', () => {
  for (const [field, value, code] of [['is_private', true, 'PRIVATE'], ['is_private', null, 'PRIVATE'], ['blocked_category', true, 'BLOCKED_CATEGORY'], ['password_risk', undefined, 'PASSWORD_RISK']]) {
    const guard = { ...tab(), [field]: value }; let read = false;
    const input = { tab: guard, get capture() { read = true; throw Error('read'); } };
    assert.throws(() => buildHandoffContext(input, { isSensitiveHost }), error => error.code === code); assert.equal(read, false);
  }
});
test('sensitive and invalid URLs fail closed; missing classification never admits capture', () => {
  for (const url of ['https://accounts.google.com/login', 'https://mijnoverheid.nl/', 'https://1password.com/']) assert.equal(handoffPolicy({ ...tab(), url }, { isSensitiveHost }), 'BLOCKED_CATEGORY');
  for (const url of ['about:preferences', 'file:///secret', 'https://user:password@localhost/', 'javascript:alert(1)']) assert.throws(() => handoffWebUrl(url));
  assert.equal(handoffPolicy(tab()), 'POLICY_UNAVAILABLE'); assert.equal(handoffPolicy(tab(), { isSensitiveHost: () => { throw Error('gone'); } }), 'INVALID_INPUT');
});
test('unknown keys, accessors, malformed identifiers and path traversal cannot enter context', () => {
  for (const patch of [{ version: 2 }, { request_id: '../id' }, { extra: true }, { project: { id: 'p_123456789abc', root: '/tmp/project/../secret' } }]) assert.throws(() => validateHandoffContext({ ...build(), ...patch }));
  const input = { ...build() }; Object.defineProperty(input, 'task', { get() { throw Error('getter'); }, enumerable: true }); assert.throws(() => validateHandoffContext(input), error => error.code === 'INVALID_INPUT');
});
test('only selected navigation data are admitted', () => {
  for (const patch of [{ tab_id: 't_2' }, { navigation_id: 'old' }, { url: 'http://localhost:8432/previous' }]) assert.throws(() => build({ capture: { ...capture(), ...patch } }), error => error.code === 'STALE_TAB');
});
test('console sources cannot include privileged URLs or query secrets; error count and text are capped', () => {
  const errors = [{ level: 'error', text: 'warning\nsecond line', source: 'file:///private/key', line: null, at: 1000 }];
  assert.equal(build({ capture: { ...capture(), console_errors: errors } }).console_errors[0].source, null);
  assert.throws(() => build({ capture: { ...capture(), console_errors: Array(51).fill(errors[0]) } }));
  assert.throws(() => build({ capture: { ...capture(), console_errors: [{ ...errors[0], text: 'x'.repeat(1001) }] } }));
});
test('screen is explicit bounded PNG with matching IHDR, canonical base64 and dimension limits', () => {
  assert.equal(build({ capture: { ...capture(), screen: png() } }).page.screen.width, 1);
  for (const screen of [{ ...png(), width: 2 }, png(1281, 1), { ...png(), mime: 'image/jpeg' }, png(1, 1, HANDOFF_LIMITS.imageBytes + 1),
    { ...png(), data_base64: png().data_base64.replace(/.$/, '!') }]) assert.throws(() => build({ capture: { ...capture(), screen } }), error => error.code === 'INVALID_IMAGE');
  const padded = png(1,1,34); const chars = padded.data_base64.split(''); chars[chars.length - 3] = 'B';
  assert.throws(() => build({ capture: { ...capture(), screen: { ...padded, data_base64: chars.join('') } } }), error => error.code === 'INVALID_IMAGE');
});
test('clipboard path requires explicit user action and does not observe after a denied action', async () => {
  const f = fixture({ isUserRequest: () => false }); const result = await f.service.send(request()); assert.equal(result.reason, 'USER_ACTION_REQUIRED'); assert.deepEqual(f.calls, []); assert.equal(f.copied.length, 0);
});
test('clipboard dispatch writes fresh serialized context and performs no provider/terminal call', async () => {
  let launches = 0; const f = fixture({ terminal: { launch: () => { launches++; throw Error('live'); } } });
  assert.deepEqual(await f.service.send(request()), { version: 1, request_id: id, status: 'copied', target: 'clipboard', reason: null });
  assert.equal(JSON.parse(f.copied[0]).page.url, 'http://localhost:8432/result'); assert.equal(launches, 0);
});
test('privacy denial avoids native capture and clipboard', async () => {
  let captured = 0; const f = fixture({ tabs: { describe: () => ({ ...tab(), is_private: true }), capture: () => { captured++; } } });
  assert.equal((await f.service.send(request())).reason, 'PRIVATE'); assert.equal(captured, 0); assert.equal(f.copied.length, 0);
});
test('navigation and private transitions during capture discard everything', async () => {
  for (const patch of [{ navigation_id: 'nav2' }, { is_private: true }, { project: { id: 'p_abcdef012345', root: '/Volumes/T9/Code/inkline' } }]) {
    let calls = 0; const f = fixture({ tabs: { describe: () => calls++ ? { ...tab(), ...patch } : tab(), capture } });
    const result = await f.service.send(request()); assert(['STALE_TAB', 'PRIVATE'].includes(result.reason)); assert.equal(f.copied.length, 0);
  }
});
test('stale tab immediately before clipboard dispatch is rejected', async () => {
  let count = 0; const f = fixture({ tabs: { describe: () => ++count === 3 ? { ...tab(), navigation_id: 'nav2' } : tab(), capture } });
  assert.equal((await f.service.send(request())).reason, 'STALE_TAB'); assert.equal(f.copied.length, 0);
});
test('collector cannot smuggle an opt-out selection, screen or console errors', async () => {
  for (const patch of [{ include_selection: false }, { include_console: false }, {}]) {
    const f = fixture({ tabs: { describe: tab, capture: () => ({ ...capture(), screen: png() }) } });
    assert.equal((await f.service.send(request(patch))).reason, 'OBSERVATION_MISMATCH'); assert.equal(f.copied.length, 0);
  }
});
test('product terminal and undocumented desktop routes are gated with a clipboard fallback', async () => {
  for (const target of ['claude-code', 'codex', 'desktop']) {
    let launches = 0; const f = fixture({ terminal: { launch: () => { launches++; } } }); const result = await f.service.send(request({ target }));
    assert.equal(result.status, 'copied'); assert.equal(result.reason, target === 'desktop' ? 'UNVERIFIED_CAPABILITY' : 'NOT_AUTHORIZED'); assert.equal(launches, 0);
    const g = fixture(); assert.equal((await g.service.send(request({ target, fallback_to_clipboard: false }))).status, 'unavailable'); assert.equal(g.copied.length, 0);
  }
});
test('a fixture launch receives structured context, never a shell command, and creates no agent-status fiction', async () => {
  let launch; const f = fixture({ testOnlyLaunch: { policy: '/owned/fake.json' }, terminal: { launch: async input => { launch = input; return { status: 'handed_off' }; } } });
  assert.equal((await f.service.send(request({ target: 'codex' }))).status, 'handed_off');
  assert.equal(launch.test_only, true); assert.equal(launch.configuration.policy, '/owned/fake.json'); assert.equal(launch.context.project.root, tab().project.root); assert.equal(f.copied.length, 0);
});
test('ambiguous external launch is never duplicated by copying context', async () => {
  const f = fixture({ testOnlyLaunch: {}, terminal: { launch: async () => ({ status: 'failed' }) } });
  assert.equal((await f.service.send(request({ target: 'codex' }))).reason, 'LAUNCH_UNCERTAIN'); assert.equal(f.copied.length, 0);
});
test('known launch refusal may fall back to clipboard', async () => {
  const f = fixture({ testOnlyLaunch: {}, terminal: { launch: async () => ({ status: 'unavailable', reason: 'TERMINAL_UNAVAILABLE', may_have_launched: false }) } });
  const result = await f.service.send(request({ target: 'codex' })); assert.equal(result.status, 'copied'); assert.equal(result.reason, 'TERMINAL_UNAVAILABLE');
});
test('aborted/closed service never observes or dispatches, including cancellation mid-capture', async () => {
  const controller = new AbortController(); controller.abort(); const f = fixture();
  assert.equal((await f.service.send(request(), { signal: controller.signal })).status, 'cancelled'); assert.deepEqual(f.calls, []);
  f.service.close(); assert.equal((await f.service.send(request())).status, 'cancelled');
  const c = new AbortController(); const g = fixture({ tabs: { describe: tab, capture: () => { c.abort(); return capture(); } } });
  assert.equal((await g.service.send(request(), { signal: c.signal })).status, 'cancelled'); assert.equal(g.copied.length, 0);
});
test('duplicate request stays bounded and malformed request errors do not echo content', async () => {
  let release; const paused = new Promise(resolve => { release = resolve; });
  const f = fixture({ tabs: { describe: tab, capture: async () => { await paused; return capture(); } } });
  const first = f.service.send(request()); await new Promise(resolve => setImmediate(resolve));
  assert.equal((await f.service.send(request())).reason, 'DUPLICATE_REQUEST');
  assert.equal((await f.service.send(request())).reason, 'DUPLICATE_REQUEST');
  assert.equal(f.service.diagnostics().active, 1); release(); await first;
  assert.equal(f.service.diagnostics().active, 0);
  const bad = await f.service.send(request({ task: 'x\u0000secret' })); assert.equal(bad.reason, 'INVALID_INPUT'); assert(!JSON.stringify(bad).includes('secret'));
});

test('concurrent gesture checks reserve request ids before awaiting authorization', async () => {
  let authorize; const gate = new Promise(resolve => { authorize = resolve; });
  const f = fixture({ isUserRequest: () => gate }); const first = f.service.send(request());
  assert.equal((await f.service.send(request())).reason, 'DUPLICATE_REQUEST'); authorize(true);
  assert.equal((await first).status, 'copied'); assert.equal(f.copied.length, 1);
});
test('at most eight handoffs may be awaiting user authorization', async () => {
  let authorize; const gate = new Promise(resolve => { authorize = resolve; });
  const f = fixture({ isUserRequest: () => gate });
  const pending = Array.from({ length: 8 }, (_, i) => f.service.send(request({ request_id: `hf_${i.toString(16).padStart(16, '0')}` })));
  assert.equal((await f.service.send(request({ request_id: 'hf_ffffffffffffffff' }))).reason, 'BUSY');
  authorize(false); await Promise.all(pending); assert.equal(f.service.diagnostics().active, 0);
});
test('native failures and launch refusals cannot echo stderr or captured page data', async () => {
  const f = fixture({ clipboard: { write: () => { const error = Error('secret stderr'); error.code = 'secret stderr'; throw error; } } });
  assert.equal((await f.service.send(request())).reason, 'HANDOFF_FAILED');
  const g = fixture({ testOnlyLaunch: {}, terminal: { launch: () => ({ status: 'failed', may_have_launched: false, reason: 'secret stderr' }) } });
  assert.equal((await g.service.send(request({ target: 'codex' }))).reason, 'TERMINAL_UNAVAILABLE');
});

test('existing project ids accepted by the context schema remain compatible', () => {
  for (const id of ['p_abcd', 'p_' + 'a'.repeat(32)]) assert.equal(build({ tab: { ...tab(), project: { ...tab().project, id } } }).project.id, id);
});

test('abort or close while describing a tab prevents subsequent capture and terminal launch', async () => {
  for (const stopAt of [1, 2]) for (const stop of ['abort', 'close']) {
    const controller = new AbortController(); let describes = 0, captures = 0, launches = 0; let service;
    const f = fixture({ testOnlyLaunch: {}, tabs: { describe: () => {
      if (++describes === stopAt) { if (stop === 'abort') controller.abort(); else service.close(); }
      return tab();
    }, capture: () => { captures++; return capture(); } }, terminal: { launch: () => { launches++; return { status: 'handed_off' }; } } });
    service = f.service;
    assert.equal((await service.send(request({ target: 'codex' }), { signal: controller.signal })).status, 'cancelled');
    assert.equal(captures, stopAt === 1 ? 0 : 1); assert.equal(launches, 0); assert.equal(f.copied.length, 0);
  }
});

test('descriptor and capture from another valid tab cannot replace the selected tab', async () => {
  let captures = 0;
  const f = fixture({ tabs: { describe: () => ({ ...tab(), tab_id: 't_2' }), capture: () => { captures++; return { ...capture(), tab_id: 't_2' }; } } });
  assert.equal((await f.service.send(request())).reason, 'STALE_TAB'); assert.equal(captures, 0); assert.equal(f.copied.length, 0);
});

test('Unicode limits match native UTF16 units and reject unpaired surrogates', () => {
  assert.equal(build({ capture: { ...capture(), title: '😀'.repeat(256) }, task: '😀'.repeat(4096) }).page.title.length,512);
  assert.throws(()=>build({task:'bad\ud800'}),error=>error.code==='INVALID_INPUT');
  assert.throws(()=>build({task:'bad\udc00'}),error=>error.code==='INVALID_INPUT');
});
