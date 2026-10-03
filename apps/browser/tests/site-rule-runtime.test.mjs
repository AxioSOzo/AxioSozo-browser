/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
import { createFakeWindow, createFakeAdapter, createFakeServices, createClock, flushMicrotasks, context,
  WORKSPACE_A, WORKSPACE_B } from "./dev-loop-harness.test.mjs";

const core = await import("../../../packages/contexts/src/index.mjs");
const { installSiteRuleRuntime, SENT_INDICATOR_MS, TICK_INTERVAL_MS, OVERVIEW_URL } = await import("../chrome/SiteRuleRuntime.sys.mjs");
const { createDecisionBudget } = await import("../chrome/DecisionBudget.sys.mjs");
const { createDecisionSendingRouter } = await import("../chrome/DecisionSendingRouter.sys.mjs");

const neutral = (request, reason) => ({ version: 1, request_id: request?.request_id ?? null, choice_set: "site_rule_v1",
  context_version: "site-rule-1", outcome: "none", reason_code: null, reason, data_sent: false, authority: "suggestion_only", action_authorized: false });

/** The process decision runtime as AxioSozoServices composes it (Plan 4 step 9):
 * one DecisionBudget, one DecisionSendingRouter whose beforeSending is the
 * host's only sending hook, and decide() that hands a request to `host` only
 * after that hook ran the window's own registered guard. `budget` may be one
 * shared by several windows. */
function fakeDecisions({ clock, host, limit = () => 30, budget = null, ready = () => true, hold = null, process = null }) {
  const router = createDecisionSendingRouter();
  const leases = new Map();
  // Like the services: a process invalidation revokes every retained lease first.
  process?.beforeListeners(() => { for (const lease of leases.values()) lease.revoke(); });
  const runtime = {
    budget: budget ?? createDecisionBudget({ clock: () => clock.fn(), getLimit: () => limit() }),
    leases, handoffs: 0, refused: 0, registrations: 0, revisions: [],
    registerLease({ requestId, level, beforeSending }) {
      if (!ready() || (process && !process.snapshot().ready)) throw Object.assign(new Error("POLICY_UNAVAILABLE"), { code: "POLICY_UNAVAILABLE" });
      const lease = router.register({ requestId, level, beforeSending });
      runtime.registrations++;
      if (process) runtime.revisions.push(process.snapshot().revision);
      leases.set(requestId, lease);
      return lease;
    },
    async decide(request, { signal } = {}) {
      const lease = leases.get(request?.request_id);
      if (!lease || lease.signal !== signal || signal.aborted) return neutral(request, "cancelled");
      // Like createDecide: the host starts (awaited) before the constructor sending hook runs.
      if (hold) await hold();
      if (signal.aborted) return neutral(request, "cancelled");
      try { router.beforeSending({ request_id: request.request_id, level: request.state.observation.level }); }
      catch { runtime.refused++; return neutral(request, "cancelled"); }
      runtime.handoffs++;
      return host(request, { signal });
    },
  };
  return runtime;
}

/**
 * The services' process decision policy (Plan 4 step 9): one revision at a
 * time, published ready or invalidated. An invalidation is synchronous: a new
 * unready revision, every lease revoked, then each registered listener told.
 * wire(services) gives a fake services object getDecisionPolicySnapshot and
 * subscribeDecisionPolicyInvalidation, each registration owned by its caller.
 */
function fakeProcessPolicy({ ready = true } = {}) {
  // ready: false is a fresh process whose first hydration has not published yet.
  let snapshot = Object.freeze(ready ? { revision: 1, limit: 30, ready: true } : { revision: 0, limit: 0, ready: false });
  const listeners = new Set();
  const first = [];
  const process = {
    snapshot: () => snapshot,
    beforeListeners: fn => first.push(fn),
    subscribe(callback) {
      const registration = { callback };
      listeners.add(registration);
      return () => { listeners.delete(registration); };
    },
    invalidate() {
      snapshot = Object.freeze({ revision: snapshot.revision + 1, limit: 0, ready: false });
      for (const fn of first) fn();
      for (const registration of [...listeners]) registration.callback(snapshot);
    },
    publish(limit = 30) { snapshot = Object.freeze({ revision: snapshot.revision + 1, limit, ready: true }); },
    listenerCount: () => listeners.size,
    wire(services) {
      services.getDecisionPolicySnapshot = () => snapshot;
      services.subscribeDecisionPolicyInvalidation = callback => process.subscribe(callback);
      return process;
    },
  };
  return process;
}

const DAY = "2026-09-27";
const utcLocalTime = now => {
  const d = new Date(now);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(),
    minutes: d.getUTCHours() * 60 + d.getUTCMinutes(), weekday: d.getUTCDay() };
};

function rule(overrides = {}) {
  return core.validateSiteRule({ ...core.newRule({ now: 1, id: "r_xcom" }),
    match: { hosts: ["x.com", "*.x.com"] }, instruction: "I come here to post and answer mentions.", ...overrides });
}

function deferred() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
}

function result(request, outcome = "none", { dataSent = true, reason = "validated", reasonCode = null } = {}) {
  return { version: 1, request_id: request.request_id, choice_set: "site_rule_v1", context_version: "site-rule-1",
    outcome, reason_code: reasonCode, reason, data_sent: dataSent, authority: "suggestion_only", action_authorized: false, model: "jev-1.13.0" };
}

async function setup({ rules = [rule()], jev = null, privateWindow = false, decide = null, outcome = "none", hasJevKey = null,
  shared = { suppressions: [] }, clock = createClock(), saveBookmark = null, preload = [], budget = null, ready = () => true, hold = null,
  process = fakeProcessPolicy() } = {}) {
  const h = createFakeWindow({ privateWindow });
  const adapter = createFakeAdapter({ privateWindow });
  const services = createFakeServices(core, { rules,
    contexts: [context(WORKSPACE_A, "project"), context(WORKSPACE_B, "organization")],
    jev: jev ?? { consent: false, interval_minutes: 5, hourly_budget: 30 } });
  process?.wire(services);
  for (const record of preload) await services.recordForeground(record);
  services.calls.recordForeground.length = 0;
  const requests = [];
  const signals = [];
  const decideFn = decide ?? (async (request, { signal }) => { requests.push(request); signals.push(signal); return result(request, outcome); });
  let idleCallback = null;
  const saved = [];
  const decisions = fakeDecisions({ clock, host: decideFn, budget, ready, hold, process, limit: () => services.jev?.hourly_budget ?? 30 });
  const runtime = installSiteRuleRuntime(h.window, { services, adapter, core, decisions,
    clock: clock.fn, timers: clock.timersApi, localTime: utcLocalTime, shared, hasJevKey,
    idle: { subscribe(_seconds, callback) { idleCallback = callback; return () => { idleCallback = null; }; } },
    saveBookmark: saveBookmark ?? (async info => { saved.push(info); }),
    requestId: (() => { let n = 0; return () => `req_test_${++n}`; })() });
  await runtime.ready;
  return { h, adapter, services, clock, runtime, requests, signals, saved, shared, decisions, budget: decisions.budget, process,
    setIdle: value => idleCallback(value),
    indicator: () => h.document.getElementById("axiosozo-rule-indicator"),
    outgoing: () => h.document.getElementById("axiosozo-jev-outgoing"),
    panel: () => h.document.getElementById("axiosozo-rule-panel"),
    pause: tab => h.stackOf(tab).querySelector(".axiosozo-pause"),
    notices: tab => h.notificationBox(tab.linkedBrowser).notifications };
}

const sumFor = (records, host) => records.filter(r => r.host === host).reduce((a, r) => a + r.ms, 0);

test("ledger records only the selected http(s) tab in a focused, visible, non-idle window", async () => {
  const t = await setup();
  const tab = t.h.addTab({ url: "https://x.com/home" });
  t.h.addTab({ url: "https://background.example/", select: false });
  const blank = t.h.addTab({ url: "about:blank", select: false });
  await flushMicrotasks();
  await t.clock.advance(30000); // foreground 30 s
  t.h.window.dispatch("deactivate");
  await t.clock.advance(60000); // unfocused: nothing
  t.h.window.dispatch("activate");
  await t.clock.advance(20000); // +20 s
  t.h.select(blank); // about:blank: nothing
  await t.clock.advance(30000);
  t.h.select(tab);
  await t.clock.advance(10000); // +10 s
  t.setIdle(true);
  await t.clock.advance(60000); // idle: nothing
  t.setIdle(false);
  await t.clock.advance(5000); // +5 s
  t.h.window.windowState = 2;
  t.h.window.dispatch("sizemodechange");
  await t.clock.advance(60000); // minimized: nothing
  await t.runtime.flush();
  const records = t.services.calls.recordForeground;
  assert.equal(sumFor(records, "x.com"), 65000);
  assert.equal(sumFor(records, "background.example"), 0, "background tabs record nothing");
  for (const record of records) assert.deepEqual({ day: record.day, contextUuid: record.contextUuid }, { day: DAY, contextUuid: WORKSPACE_A });
  assert.equal(core.usageFor(t.services.ledger(), { day: DAY, hosts: ["x.com"] }), 65000);
  await t.runtime.dispose();
});

test("ledger accumulates on tab switch and navigation and flushes periodically per context", async () => {
  const t = await setup();
  const tab = t.h.addTab({ url: "https://x.com/" });
  const other = t.h.addTab({ url: "https://news.example/", workspace: WORKSPACE_B, select: false });
  await t.clock.advance(15000);
  t.h.select(other);
  await t.clock.advance(20000);
  t.h.commit(other, "https://x.com/explore");
  await t.clock.advance(25000); // the 60 s flush fires here
  const records = t.services.calls.recordForeground;
  assert.deepEqual(records.map(r => [r.host, r.contextUuid, r.ms]).sort(), [
    ["news.example", WORKSPACE_B, 20000], ["x.com", WORKSPACE_A, 15000], ["x.com", WORKSPACE_B, 25000]].sort());
  assert.equal(t.runtime.diagnostics().pendingMs, 0);
  await t.runtime.dispose();
});

test("a suspended gap is clamped instead of counted as foreground time", async () => {
  const t = await setup();
  t.h.addTab({ url: "https://x.com/" });
  t.clock.timers.clear(); // simulate a sleeping machine: no ticks run
  t.clock.now += 3 * 3600000;
  await t.runtime.flush();
  assert.ok(sumFor(t.services.calls.recordForeground, "x.com") <= 60000);
  await t.runtime.dispose();
});

test("private windows install nothing: no ledger, no indicator, no decide calls", async () => {
  const t = await setup({ privateWindow: true, jev: { consent: true, interval_minutes: 1, hourly_budget: 30 },
    rules: [rule({ observation: "address", effects: ["nudge"], limits: { daily_minutes: 1, allowed_hours: null } })] });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await t.clock.advance(10 * 60000);
  assert.equal(t.indicator(), null);
  assert.equal(t.h.progressListeners.size, 0);
  assert.equal(t.requests.length, 0);
  assert.equal(t.services.calls.recordForeground.length, 0);
  assert.equal(t.services.calls.listRules, 0);
});

test("rule indicator appears on matching hosts and its panel summarizes the rule", async () => {
  const t = await setup({ rules: [rule({ limits: { daily_minutes: 15, allowed_hours: [{ start: "09:00", end: "17:00" }] } })],
    preload: [{ day: DAY, host: "x.com", contextUuid: WORKSPACE_B, ms: 9 * 60000 }] });
  const tab = t.h.addTab({ url: "about:blank" });
  await flushMicrotasks();
  assert.equal(t.indicator().hidden, true);
  assert.equal(t.indicator().parentNode.children.indexOf(t.indicator()),
    t.indicator().parentNode.children.indexOf(t.h.document.getElementById("identity-box")) + 1, "in the identity area");
  t.h.commit(tab, "https://mobile.x.com/home");
  assert.equal(t.indicator().hidden, false);
  assert.equal(t.indicator().localName, "button");
  assert.equal(t.indicator().getAttribute("aria-label"), "Site rule for mobile.x.com: 9 of 15 minutes today. Show rule");
  t.indicator().click();
  assert.equal(t.panel().openedWith, t.indicator());
  const text = t.panel().textContent;
  assert.match(text, /Site rule for mobile\.x\.com/u);
  assert.match(text, /x\.com, \*\.x\.com/u);
  assert.match(text, /I come here to post and answer mentions\./u);
  assert.match(text, /Today9 of 15 minutes/u);
  assert.match(text, /Allowed hours09:00–17:00/u);
  assert.match(text, /Jevoff; nothing leaves this Mac/u);
  t.panel().querySelector(".axiosozo-rule-edit").click();
  assert.deepEqual(t.h.opened.map(o => [o.url, o.where]), [[`${OVERVIEW_URL}#rule=r_xcom`, "tab"]]);
  t.h.commit(tab, "https://notx.com/");
  assert.equal(t.indicator().hidden, true, "x.com rules do not match notx.com");
  t.h.commit(tab, "https://x.com/");
  assert.equal(t.indicator().hidden, false);
  await t.runtime.dispose();
  assert.equal(t.indicator(), null);
  assert.equal(t.panel(), null);
});

test("Edit in Overview opens about:axiosozo at the rule", async () => {
  const h = createFakeWindow();
  const services = createFakeServices(core, { rules: [rule()], contexts: [] });
  const clock = createClock();
  const process = fakeProcessPolicy().wire(services);
  const runtime = installSiteRuleRuntime(h.window, { services, adapter: createFakeAdapter(), core,
    decisions: fakeDecisions({ clock, host: async () => null, process }),
    clock: clock.fn, timers: clock.timersApi, localTime: utcLocalTime, shared: { suppressions: [] },
    idle: { subscribe: () => () => {} } });
  await runtime.ready;
  h.addTab({ url: "https://x.com/" });
  h.document.getElementById("axiosozo-rule-indicator").click();
  h.document.getElementById("axiosozo-rule-panel").querySelector(".axiosozo-rule-edit").click();
  assert.deepEqual(h.opened, [{ url: `${OVERVIEW_URL}#rule=r_xcom`, where: "tab", options: undefined }]);
  // With Firefox's switchToTabHavingURI an open Overview tab is reused.
  const switched = [];
  h.window.switchToTabHavingURI = (url, openNew, params) => switched.push({ url, openNew, params });
  h.document.getElementById("axiosozo-rule-indicator").click();
  h.document.getElementById("axiosozo-rule-panel").querySelector(".axiosozo-rule-edit").click();
  assert.deepEqual(switched, [{ url: `${OVERVIEW_URL}#rule=r_xcom`, openNew: true, params: { ignoreFragment: "whenComparingAndReplace" } }]);
  assert.equal(h.document.getElementById("axiosozo-rule-panel").state, "closed");
  await runtime.dispose();
});

test("daily limit pauses the site with confirm friction; continuing suppresses for 15 minutes", async () => {
  const t = await setup({ rules: [rule({ limits: { daily_minutes: 1, allowed_hours: null }, effects: ["nudge", "pause_site"], override: "confirm" })],
    preload: [{ day: DAY, host: "x.com", contextUuid: WORKSPACE_A, ms: 60000 }] });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/home");
  const pause = t.pause(tab);
  assert.ok(pause, "interstitial in the tab's browser stack");
  assert.equal(pause.getAttribute("role"), "dialog");
  assert.equal(pause.getAttribute("aria-modal"), "true");
  assert.equal(pause.querySelector("h1").textContent, "x.com is paused");
  assert.equal(pause.getAttribute("aria-labelledby"), pause.querySelector("h1").id);
  assert.equal(pause.getAttribute("aria-describedby"), pause.querySelector(".axiosozo-pause-message").id);
  assert.equal(pause.querySelector(".axiosozo-pause-message").textContent, "You have used your 1 minute on x.com today.");
  assert.equal(pause.querySelector(".axiosozo-rule-instruction").textContent, "I come here to post and answer mentions.");
  assert.equal(t.h.document.activeElement, pause.querySelector(".axiosozo-pause-close"), "focus moves into the interstitial");
  assert.equal(t.notices(tab).length, 0, "no page UI and no second effect");
  // Tab cycles within the interstitial.
  const event = pause.dispatch("keydown", { key: "Tab", shiftKey: false });
  assert.equal(event.defaultPrevented, true);
  assert.equal(t.h.document.activeElement, pause.querySelector(".axiosozo-pause-continue"));
  // Ctrl/Cmd/Alt+Tab are left to the browser and the OS (L4).
  for (const modifier of ["ctrlKey", "metaKey", "altKey"]) {
    const passed = pause.dispatch("keydown", { key: "Tab", shiftKey: false, [modifier]: true });
    assert.equal(passed.defaultPrevented, false, modifier);
    assert.equal(t.h.document.activeElement, pause.querySelector(".axiosozo-pause-continue"), modifier);
  }
  pause.querySelector(".axiosozo-pause-continue").click();
  assert.equal(pause.querySelector(".axiosozo-pause-confirm").hidden, false, "confirm friction");
  assert.ok(t.pause(tab), "still paused until confirmed");
  pause.querySelector(".axiosozo-pause-confirm-yes").click();
  assert.equal(t.pause(tab), null);
  assert.equal(t.h.document.activeElement, tab.linkedBrowser);
  assert.deepEqual(t.runtime.diagnostics().suppressions.map(s => [s.rule_id, s.effect, s.context_uuid, s.until - t.clock.now]),
    [["r_xcom", "pause_site", WORKSPACE_A, 15 * 60000]]);
  await t.clock.advance(14 * 60000);
  assert.equal(t.pause(tab), null, "suppressed");
  await t.clock.advance(2 * 60000);
  assert.ok(t.pause(tab), "returns after the suppression ends");
  // Navigating to a host the rule does not cover removes the interstitial.
  t.h.commit(tab, "https://docs.example/");
  assert.equal(t.pause(tab), null);
  await t.runtime.dispose();
});

test("override none continues at once, delay_10s counts down, Close tab closes", async () => {
  const limited = { limits: { daily_minutes: 1, allowed_hours: null }, effects: ["pause_site"] };
  const preload = [{ day: DAY, host: "x.com", contextUuid: WORKSPACE_A, ms: 60000 }];
  let t = await setup({ rules: [rule({ ...limited, override: "none" })], preload });
  let tab = t.h.addTab({ url: "https://x.com/" });
  t.pause(tab).querySelector(".axiosozo-pause-continue").click();
  assert.equal(t.pause(tab), null);
  await t.runtime.dispose();

  t = await setup({ rules: [rule({ ...limited, override: "delay_10s" })], preload });
  tab = t.h.addTab({ url: "https://x.com/" });
  const proceed = t.pause(tab).querySelector(".axiosozo-pause-continue");
  assert.equal(proceed.disabled, true);
  assert.equal(proceed.textContent, "Continue in 10 s");
  proceed.click();
  assert.ok(t.pause(tab), "disabled button does nothing");
  await t.clock.advance(4000);
  assert.equal(proceed.textContent, "Continue in 6 s");
  await t.clock.advance(6000);
  assert.equal(proceed.disabled, false);
  assert.equal(proceed.textContent, "Continue anyway");
  proceed.click();
  assert.equal(t.pause(tab), null);
  await t.runtime.dispose();

  t = await setup({ rules: [rule({ ...limited, override: "confirm" })], preload });
  tab = t.h.addTab({ url: "https://x.com/" });
  t.h.addTab({ url: "about:blank", select: false });
  t.pause(tab).querySelector(".axiosozo-pause-close").click();
  assert.equal(t.h.gBrowser.tabs.includes(tab), false);
  await t.runtime.dispose();
});

test("outside allowed hours nudges with a dismissible notice; dismissal suppresses for 5 minutes", async () => {
  const t = await setup({ rules: [rule({ limits: { daily_minutes: null, allowed_hours: [{ start: "00:00", end: "01:00" }] }, effects: ["nudge"] })] });
  const tab = t.h.addTab({ url: "https://x.com/" });
  await flushMicrotasks();
  const [notice] = t.notices(tab);
  assert.equal(notice.type, "axiosozo-rule-nudge");
  assert.equal(notice.label, "x.com is outside the hours you set for it. “I come here to post and answer mentions.”");
  assert.equal(notice.buttons.length, 0);
  // Same-host navigation keeps the notice (no re-show storm).
  t.h.commit(tab, "https://x.com/notifications");
  assert.equal(t.notices(tab).length, 1);
  notice.dismiss();
  await flushMicrotasks();
  assert.equal(t.notices(tab).length, 0);
  await t.clock.advance(4 * 60000);
  assert.equal(t.notices(tab).length, 0);
  await t.clock.advance(2 * 60000);
  assert.equal(t.notices(tab).length, 1, "back after 5 minutes");
  t.h.commit(tab, "https://elsewhere.example/");
  assert.equal(t.notices(tab).length, 0, "leaving the host removes the notice");
  await t.runtime.dispose();
});

test("effects the rule does not list are never applied", async () => {
  const t = await setup({ rules: [rule({ limits: { daily_minutes: 1, allowed_hours: null }, effects: [] })],
    preload: [{ day: DAY, host: "x.com", contextUuid: WORKSPACE_A, ms: 600000 }] });
  const tab = t.h.addTab({ url: "https://x.com/" });
  await t.clock.advance(60000);
  assert.equal(t.pause(tab), null);
  assert.equal(t.notices(tab).length, 0);
  assert.equal(t.indicator().hidden, false, "the rule is still indicated");
  await t.runtime.dispose();
});

test("rules scoped to a context type only apply in that context", async () => {
  const t = await setup({ rules: [rule({ contexts: { types: ["organization"] }, limits: { daily_minutes: 1, allowed_hours: null }, effects: ["nudge"] })],
    preload: [{ day: DAY, host: "x.com", contextUuid: WORKSPACE_B, ms: 600000 }] });
  const inProject = t.h.addTab({ url: "https://x.com/", workspace: WORKSPACE_A });
  assert.equal(t.indicator().hidden, true);
  assert.equal(t.notices(inProject).length, 0);
  const inOrg = t.h.addTab({ url: "https://x.com/", workspace: WORKSPACE_B });
  await flushMicrotasks();
  assert.equal(t.indicator().hidden, false);
  assert.equal(t.notices(inOrg).length, 1);
  await t.runtime.dispose();
});

// ---- Jev layer -------------------------------------------------------------------
const JEV_ON = { consent: true, interval_minutes: 5, hourly_budget: 30 };
const observed = (extra = {}) => rule({ observation: "address", effects: ["nudge", "suggest_leave"], ...extra });

test("zero decide() calls without consent, with observation none, without effects or without a key", async () => {
  const cases = [
    { jev: { ...JEV_ON, consent: false }, rules: [observed()] },
    { jev: JEV_ON, rules: [rule({ observation: "none", effects: ["nudge"] })] },
    { jev: JEV_ON, rules: [observed({ effects: [] })] },
    { jev: JEV_ON, rules: [observed({ enabled: false })] },
    { jev: { ...JEV_ON, hourly_budget: 0 }, rules: [observed()] },
    { jev: JEV_ON, rules: [observed()], hasJevKey: async () => false },
  ];
  for (const input of cases) {
    const t = await setup(input);
    const tab = t.h.addTab({ url: "about:blank" });
    t.h.commit(tab, "https://x.com/home");
    await t.clock.advance(30 * 60000);
    assert.equal(t.requests.length, 0, JSON.stringify(input.jev));
    assert.equal(t.outgoing().hidden, true);
    await t.runtime.dispose();
  }
});

test("no key: the first answer 'disabled' stops further calls until settings change", async () => {
  const t = await setup({ jev: JEV_ON, rules: [observed()],
    decide: async request => { t.requests.push(request); return result(request, "none", { dataSent: false, reason: "disabled" }); } });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  t.h.commit(tab, "https://x.com/two");
  await t.clock.advance(30 * 60000);
  assert.equal(t.requests.length, 1);
  assert.equal(t.outgoing().hidden, true, "nothing was sent");
  t.services.emit("rules");
  await flushMicrotasks();
  t.h.commit(tab, "https://x.com/three");
  await flushMicrotasks();
  assert.equal(t.requests.length, 2);
  await t.runtime.dispose();
});

test("commit checkpoint sends address only and shows the outgoing-data indicator", async () => {
  const pending = deferred();
  let t;
  t = await setup({ jev: JEV_ON, rules: [observed()],
    decide: async (request, { signal }) => { t.requests.push(request); t.signals.push(signal); return pending.promise.then(() => result(request, "none")); } });
  const tab = t.h.addTab({ url: "about:blank", label: "Home / X" });
  t.h.commit(tab, "https://x.com/home?q=private#frag");
  await flushMicrotasks();
  assert.equal(t.requests.length, 1);
  const [request] = t.requests;
  assert.equal(request.choice_set, "site_rule_v1");
  assert.equal(request.state.checkpoint, "commit");
  assert.equal(request.state.context_type, "project");
  assert.deepEqual(request.state.observation, { level: "address",
    address: { origin: "https://x.com", path: "/home", title: "Home / X" } });
  assert.deepEqual(request.state.rule, { id: "r_xcom", instruction: "I come here to post and answer mentions.", effects: ["nudge", "suggest_leave"] });
  assert.equal(t.outgoing().hidden, false, "indicator is visible before the answer");
  assert.equal(t.outgoing().getAttribute("data-state"), "sending");
  assert.equal(t.outgoing().textContent, "Sending to Jev");
  assert.equal(t.outgoing().getAttribute("role"), "status");
  pending.resolve();
  await flushMicrotasks();
  assert.equal(t.outgoing().getAttribute("data-state"), "sent");
  assert.equal(t.outgoing().textContent, "Sent to Jev");
  await t.clock.advance(SENT_INDICATOR_MS);
  assert.equal(t.outgoing().hidden, true);
  assert.equal(t.runtime.diagnostics().dataSent, 1);
  await t.runtime.dispose();
});

test("the commit checkpoint waits for the committed document and never sends the previous title (M3)", async () => {
  const t = await setup({ jev: JEV_ON, rules: [observed()] });
  const tab = t.h.addTab({ url: "https://news.example/", label: "Previous page title" });
  await flushMicrotasks();
  // The new document commits; its title is not known yet and the tab label is stale.
  t.h.commit(tab, "https://x.com/home", { stop: false, title: "" });
  await flushMicrotasks();
  assert.equal(t.requests.length, 0, "no call before the document has loaded");
  tab.linkedBrowser.contentTitle = "Home / X";
  t.h.stop(tab);
  await flushMicrotasks();
  assert.equal(t.requests.length, 1);
  assert.equal(t.requests[0].state.observation.address.title, "Home / X");
  assert.equal(t.requests[0].state.checkpoint, "commit");

  // A document without a title sends an empty title, never tab.label.
  t.h.commit(tab, "https://x.com/untitled", { stop: false, title: "" });
  t.h.stop(tab);
  await flushMicrotasks();
  assert.equal(t.requests[1].state.observation.address.title, "");
  assert.ok(!JSON.stringify(t.requests).includes("Previous page title"));

  // Navigated again before the load finished: only the latest document is checked.
  t.h.commit(tab, "https://x.com/first", { stop: false, title: "First" });
  t.h.commit(tab, "https://x.com/second", { stop: false, title: "Second" });
  t.h.stop(tab);
  await flushMicrotasks();
  assert.deepEqual(t.requests.slice(2).map(r => [r.state.observation.address.path, r.state.observation.address.title]), [["/second", "Second"]]);

  // Went to the background before the load finished: dropped.
  t.h.commit(tab, "https://x.com/later", { stop: false, title: "Later" });
  const other = t.h.addTab({ url: "https://docs.example/" });
  t.h.stop(tab);
  t.h.select(tab);
  t.h.stop(tab);
  await flushMicrotasks();
  assert.equal(t.requests.filter(r => r.state.observation.address.path === "/later" && r.state.checkpoint === "commit").length, 0);

  // A failed or aborted load does not run the commit checkpoint.
  const before = t.requests.length;
  t.h.commit(tab, "https://x.com/aborted", { stop: false, title: "Aborted" });
  t.h.stop(tab, { status: 0x804b0002 });
  await flushMicrotasks();
  assert.equal(t.requests.length, before);
  assert.ok(other);
  await t.runtime.dispose();
});

test("no Jev call without the outgoing-data indicator mounted and visible in this window (L3)", async () => {
  // Removed from the window.
  let t = await setup({ jev: JEV_ON, rules: [observed()] });
  t.outgoing().remove();
  let tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await t.clock.advance(30 * 60000);
  assert.equal(t.requests.length, 0);
  assert.ok(t.runtime.diagnostics().indicatorSkipped >= 1);
  await t.runtime.dispose();

  // Mounted but its toolbar is not rendered.
  t = await setup({ jev: JEV_ON, rules: [observed()] });
  t.outgoing().parentNode.checkVisibility = () => false;
  tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await t.clock.advance(30 * 60000);
  assert.equal(t.requests.length, 0);
  assert.equal(t.outgoing().hidden, true);
  await t.runtime.dispose();

  // The indicator itself does not become visible when shown.
  t = await setup({ jev: JEV_ON, rules: [observed()] });
  t.outgoing().checkVisibility = () => false;
  tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  assert.equal(t.requests.length, 0);
  assert.equal(t.outgoing().hidden, true, "the notice is withdrawn when nothing is sent");
  assert.equal(t.runtime.diagnostics().decideCalls, 0);
  await t.runtime.dispose();

  // No identity box at all: the runtime still records time but never calls Jev.
  const h = createFakeWindow();
  h.document.getElementById("identity-box").remove();
  const requests = [];
  const services = createFakeServices(core, { rules: [observed()], contexts: [], jev: JEV_ON });
  const clock = createClock();
  const process = fakeProcessPolicy().wire(services);
  const runtime = installSiteRuleRuntime(h.window, { services, adapter: createFakeAdapter(), core,
    decisions: fakeDecisions({ clock, host: async request => { requests.push(request); return result(request); }, process }),
    clock: clock.fn, timers: clock.timersApi, localTime: utcLocalTime, shared: { suppressions: [] },
    idle: { subscribe: () => () => {} } });
  await runtime.ready;
  h.addTab({ url: "https://x.com/" });
  await clock.advance(30 * 60000);
  assert.equal(requests.length, 0);
  await runtime.dispose();
});

test("revoking Jev consent aborts calls in flight and drops their answers", async () => {
  const gate = deferred();
  let t;
  t = await setup({ jev: JEV_ON, rules: [observed({ effects: ["pause_site"], override: "none" })],
    decide: async (request, { signal }) => { t.requests.push(request); t.signals.push(signal); await gate.promise; return result(request, "pause_site"); } });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  assert.equal(t.signals.length, 1);
  assert.equal(t.signals[0].aborted, false);
  t.services.jev = { ...JEV_ON, consent: false };
  t.services.emit("rules");
  await flushMicrotasks();
  assert.equal(t.signals[0].aborted, true, "revocation aborts the in-flight call");
  gate.resolve();
  await flushMicrotasks();
  assert.equal(t.pause(tab), null, "the answer is dropped");
  t.h.commit(tab, "https://x.com/again");
  await t.clock.advance(30 * 60000);
  assert.equal(t.requests.length, 1, "no further calls without consent");
  await t.runtime.dispose();
});

test("outline rules are capped to address in M1 and the request says so", async () => {
  const t = await setup({ jev: JEV_ON, rules: [observed({ observation: "outline" })] });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  assert.equal(t.requests[0].state.observation.level, "address");
  assert.equal("outline" in t.requests[0].state.observation, false);
  assert.equal(t.runtime.diagnostics().outlineCapped, 1);
  await t.runtime.dispose();
});

test("OpenAI rules are refused natively: no key probe, budget, indicator or decide(); a Jev rule beside them still runs", async () => {
  let probes = 0;
  const t = await setup({ jev: JEV_ON, rules: [observed({ provider: "openai" })], hasJevKey: async () => { probes++; return true; } });
  const budget = JSON.stringify(t.budget.snapshot());
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/home");
  await t.clock.advance(30 * 60000);
  assert.equal(t.requests.length, 0);
  assert.equal(probes, 0, "Jev's key is never consulted for OpenAI");
  assert.equal(JSON.stringify(t.budget.snapshot()), budget, "no budget is used");
  assert.equal(t.decisions.registrations, 0, "no sending lease either");
  assert.equal(t.outgoing().hidden, true, "no pre-send indicator");
  const diagnostics = t.runtime.diagnostics();
  assert.deepEqual([diagnostics.decideCalls, diagnostics.budgetSkipped, diagnostics.indicatorSkipped], [0, 0, 0]);
  assert.ok(diagnostics.providerUnavailable >= 1);
  t.indicator().click();
  assert.match(t.panel().textContent, /OpenAInot available in this build; nothing leaves this Mac/u);
  assert.doesNotMatch(t.panel().textContent, /Jevmay see/u);
  await t.runtime.dispose();

  const both = await setup({ jev: JEV_ON, rules: [observed({ provider: "openai" }), observed({ id: "r_xcom2", provider: "jev" })] });
  const other = both.h.addTab({ url: "about:blank" });
  both.h.commit(other, "https://x.com/");
  await flushMicrotasks();
  assert.deepEqual(both.requests.map(request => [request.state.rule.id, request.provider]), [["r_xcom2", "jev"]]);
  await both.runtime.dispose();
});

test("screen rules send nothing natively and are never relabelled; on a sensitive host the core caps them to the address", async () => {
  for (const extra of [{ provider: "openai" }, {}]) {
    const t = await setup({ jev: JEV_ON, rules: [observed({ observation: "screen", ...extra })] });
    const tab = t.h.addTab({ url: "about:blank" });
    t.h.commit(tab, "https://x.com/");
    await t.clock.advance(30 * 60000);
    assert.equal(t.requests.length, 0, JSON.stringify(extra));
    const diagnostics = t.runtime.diagnostics();
    assert.ok(extra.provider ? diagnostics.providerUnavailable >= 1 : diagnostics.screenUnavailable >= 1);
    t.indicator().click();
    assert.match(t.panel().textContent, extra.provider ? /OpenAInot available in this build/u
      : /Jevscreenshots are not available in this build; nothing leaves this Mac/u);
    await t.runtime.dispose();
  }
  // Root policy (contexts core): a sensitive host never gets a screenshot, at most its address.
  const t = await setup({ jev: JEV_ON, rules: [observed({ match: { hosts: ["paypal.com"] }, observation: "screen" })] });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://paypal.com/");
  await flushMicrotasks();
  assert.deepEqual(t.requests.map(request => request.state.observation.level), ["address"]);
  assert.equal("screen" in t.requests[0].state.observation, false);
  await t.runtime.dispose();
});

test("a Jev outcome applies only with Jev provenance and only while the rule still chooses Jev", async () => {
  let t = await setup({ jev: JEV_ON, rules: [observed({ effects: ["pause_site"], override: "none" })],
    decide: async request => ({ ...result(request, "pause_site"), provider: "openai" }) });
  let tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  assert.equal(t.pause(tab), null, "an answer naming another provider is dropped");
  await t.runtime.dispose();

  const gate = deferred();
  t = await setup({ jev: JEV_ON, rules: [observed({ effects: ["pause_site"], override: "none" })],
    decide: async request => { await gate.promise; return { ...result(request, "pause_site"), provider: "jev" }; } });
  tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  t.services.rules = [observed({ effects: ["pause_site"], override: "none", provider: "openai" })];
  t.services.emit("rules");
  await flushMicrotasks();
  gate.resolve();
  await flushMicrotasks();
  assert.equal(t.pause(tab), null, "switched to OpenAI meanwhile: the Jev answer is not applied");
  await t.runtime.dispose();
});

// ---- Current policy after the asynchronous key probe -----------------------------------
/** A key probe held until released; it answers "a key is stored". */
function heldProbe() {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const probe = { calls: 0, release: () => release(), hasJevKey: async () => { probe.calls++; await gate; return true; } };
  return probe;
}
/** setup() with a held probe; decide() records whether the outgoing-data indicator showed "sending" at dispatch. */
async function probing(options = {}) {
  const probe = heldProbe();
  const seen = { sendingAtDispatch: 0 };
  let t;
  t = await setup({ jev: JEV_ON, rules: [observed()], hasJevKey: probe.hasJevKey, ...options,
    decide: async request => {
      t.requests.push(request);
      if (!t.outgoing().hidden && t.outgoing().getAttribute("data-state") === "sending") seen.sendingAtDispatch++;
      return result(request, "none");
    } });
  return Object.assign(t, { probe, seen, budgetCalls: () => t.budget.snapshot().calls.length });
}

test("a rule changed while the key probe is pending: nothing of the old policy is sent", async () => {
  const changes = [
    ["Jev/address to OpenAI/address", t => { t.services.rules = [observed({ provider: "openai" })]; }],
    ["Jev/address to Jev/screen", t => { t.services.rules = [observed({ observation: "screen" })]; }],
    ["rule turned off", t => { t.services.rules = [observed({ enabled: false })]; }],
    ["level none", t => { t.services.rules = [observed({ observation: "none" })]; }],
    ["no effects left", t => { t.services.rules = [observed({ effects: [] })]; }],
    ["rule deleted", t => { t.services.rules = []; }],
    ["Jev consent revoked", t => { t.services.jev = { ...JEV_ON, consent: false }; }],
  ];
  for (const [label, change] of changes) {
    const t = await probing();
    const tab = t.h.addTab({ url: "about:blank" });
    t.h.commit(tab, "https://x.com/home");
    await flushMicrotasks();
    assert.deepEqual([t.probe.calls, t.requests.length, t.budgetCalls()], [1, 0, 0], `${label}: probing, nothing sent yet`);
    assert.equal(t.outgoing().hidden, true);
    change(t);
    t.services.emit("rules");
    await flushMicrotasks();
    assert.equal(t.services.calls.listRules, 2, `${label}: the new policy is loaded while the probe waits`);
    t.probe.release();
    await flushMicrotasks();
    assert.deepEqual([t.runtime.diagnostics().decideCalls, t.requests.length, t.budgetCalls(), t.seen.sendingAtDispatch], [0, 0, 0, 0],
      `${label}: no decide(), no request, no budget, no indicator`);
    assert.equal(t.outgoing().hidden, true);
    assert.equal(t.outgoing().getAttribute("data-state"), null, `${label}: the indicator never said "sending"`);
    // Later checkpoints follow the new policy too.
    await t.clock.advance(30 * 60000);
    assert.equal(t.requests.length, 0, label);
    await t.runtime.dispose();
  }
});

test("control: a rule still current after the key probe is sent once, with the indicator before dispatch; after an edit, the next checkpoint sends the edited rule", async () => {
  const t = await probing();
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/home");
  await flushMicrotasks();
  t.probe.release();
  await flushMicrotasks();
  assert.deepEqual([t.probe.calls, t.runtime.diagnostics().decideCalls, t.requests.length, t.budgetCalls(), t.seen.sendingAtDispatch], [1, 1, 1, 1, 1]);
  const [request] = t.requests;
  assert.equal(Object.hasOwn(request, "provider"), false, "a rule without a provider stays the legacy Jev request");
  assert.equal(request.state.observation.level, "address");
  assert.equal(request.state.checkpoint, "commit");
  await t.runtime.dispose();

  // An allowed edit while probing (still Jev, still the address): that probe sends
  // nothing (it began under the old snapshot); the next checkpoint sends the edited rule.
  const u = await probing();
  const other = u.h.addTab({ url: "about:blank" });
  u.h.commit(other, "https://x.com/home");
  await flushMicrotasks();
  u.services.rules = [observed({ instruction: "Only answer mentions." })];
  u.services.emit("rules");
  await flushMicrotasks();
  u.probe.release();
  await flushMicrotasks();
  assert.equal(u.requests.length, 0, "the probe that began under the old snapshot sends nothing");
  u.h.commit(other, "https://x.com/mentions");
  await flushMicrotasks();
  assert.deepEqual(u.requests.map(r => [r.state.rule.instruction, r.state.observation.address.path]), [["Only answer mentions.", "/mentions"]]);
  assert.equal(u.seen.sendingAtDispatch, 1);
  await u.runtime.dispose();
});

test("a new document while the key probe is pending voids the old checkpoint; the new document's own check runs", async () => {
  const t = await probing();
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/first");
  await flushMicrotasks();
  t.h.commit(tab, "https://x.com/second");
  await flushMicrotasks();
  assert.equal(t.probe.calls, 2);
  t.probe.release();
  await flushMicrotasks();
  assert.deepEqual(t.requests.map(request => request.state.observation.address.path), ["/second"]);
  assert.equal(t.budgetCalls(), 1);
  // Moved to a host without a matching rule while probing: nothing at all.
  const u = await probing();
  const other = u.h.addTab({ url: "about:blank" });
  u.h.commit(other, "https://x.com/home");
  await flushMicrotasks();
  u.h.commit(other, "https://news.example/");
  await flushMicrotasks();
  u.probe.release();
  await flushMicrotasks();
  assert.deepEqual([u.requests.length, u.budgetCalls()], [0, 0]);
  await t.runtime.dispose();
  await u.runtime.dispose();
});

test("an answer arriving after the rule stopped asking Jev (screenshot, level none, no effects) is not applied", async () => {
  for (const change of [{ observation: "screen" }, { observation: "none" }, { effects: [] }]) {
    const gate = deferred();
    const t = await setup({ jev: JEV_ON, rules: [observed({ effects: ["pause_site"], override: "none" })],
      decide: async request => { await gate.promise; return { ...result(request, "pause_site"), provider: "jev" }; } });
    const tab = t.h.addTab({ url: "about:blank" });
    t.h.commit(tab, "https://x.com/");
    await flushMicrotasks();
    t.services.rules = [observed({ effects: ["pause_site"], override: "none", ...change })];
    t.services.emit("rules");
    await flushMicrotasks();
    gate.resolve();
    await flushMicrotasks();
    assert.equal(t.pause(tab), null, JSON.stringify(change));
    await t.runtime.dispose();
  }
});

// ---- Settled policy snapshot: reloads of rules, Jev settings and contexts ------------------
/** Holds every call of one services read until the test answers or fails it, in any order. */
function holdRead(services, name) {
  const original = services[name];
  const pending = [];
  services[name] = (...args) => new Promise((resolve, reject) => {
    pending.push({ resolve, reject, now: () => original.apply(services, args) });
  });
  return { pending,
    // Answers held call `index` with `value`, or with what the fake service would answer now.
    answer: (index, value) => (value === undefined ? pending[index].now().then(pending[index].resolve) : pending[index].resolve(value)),
    fail: index => pending[index].reject(new Error("synthetic read failure")),
    restore: () => { services[name] = original; } };
}
const nothingSent = (t, label) => {
  assert.deepEqual([t.runtime.diagnostics().decideCalls, t.requests.length, t.budgetCalls(), t.seen.sendingAtDispatch], [0, 0, 0, 0], label);
  assert.equal(t.outgoing().getAttribute("data-state"), null, `${label}: the indicator never said "sending"`);
};

test("a policy reload holds decisions from its start: a probe already pending sends nothing, during and after the reload", async () => {
  for (const [label, read, change] of [
    ["rule switched to OpenAI while listRules is pending", "listRules", t => { t.services.rules = [observed({ provider: "openai" })]; }],
    ["consent revoked while getJevSettings is pending", "getJevSettings", t => { t.services.jev = { ...JEV_ON, consent: false }; }],
  ]) {
    const t = await probing();
    const tab = t.h.addTab({ url: "about:blank" });
    t.h.commit(tab, "https://x.com/home");
    await flushMicrotasks();
    assert.deepEqual([t.probe.calls, t.requests.length], [1, 0]);
    change(t);
    const held = holdRead(t.services, read);
    t.services.emit("rules");
    await flushMicrotasks();
    assert.equal(held.pending.length, 1, `${label}: the reload is still reading`);
    t.probe.release();
    await flushMicrotasks();
    nothingSent(t, `${label}: the pending probe`);
    assert.ok(t.runtime.diagnostics().policyUnsettled >= 1);
    // New checkpoints while the reload is pending are refused too.
    t.h.commit(tab, "https://x.com/second");
    await t.clock.advance(30 * 60000);
    nothingSent(t, `${label}: new checkpoints during the reload`);
    held.answer(0);
    await flushMicrotasks();
    // Settled: the new policy (OpenAI, or no consent) still sends nothing.
    t.h.commit(tab, "https://x.com/third");
    await t.clock.advance(30 * 60000);
    nothingSent(t, `${label}: after the reload`);
    held.restore();
    await t.runtime.dispose();
  }
});

test("during a reload new checkpoints are refused; once the latest valid snapshot settles a fresh checkpoint is sent", async () => {
  const t = await probing({ hasJevKey: null });
  const held = holdRead(t.services, "listRules");
  t.services.emit("rules");
  await flushMicrotasks();
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/home");
  await flushMicrotasks();
  await t.clock.advance(30 * 60000);
  nothingSent(t, "while listRules is pending");
  assert.ok(t.indicator().hidden === false, "the rule itself still shows and limits locally");
  held.answer(0);
  await flushMicrotasks();
  t.h.commit(tab, "https://x.com/again");
  await flushMicrotasks();
  assert.deepEqual([t.requests.length, t.budgetCalls(), t.seen.sendingAtDispatch], [1, 1, 1], "recovered with the current allowed snapshot");
  assert.equal(t.requests[0].state.observation.address.path, "/again");
  held.restore();
  await t.runtime.dispose();
});

test("overlapping reloads: a late, older answer never replaces the newer snapshot, either way", async () => {
  // Newer: OpenAI. Older, answered late: the allowed Jev rule. The older one must not come back.
  const t = await probing({ hasJevKey: null });
  const held = holdRead(t.services, "listRules");
  t.services.emit("rules"); await flushMicrotasks();
  t.services.emit("rules"); await flushMicrotasks();
  assert.equal(held.pending.length, 2);
  held.answer(1, [observed({ provider: "openai" })]); await flushMicrotasks();
  held.answer(0, [observed()]); await flushMicrotasks();
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/home");
  await t.clock.advance(30 * 60000);
  nothingSent(t, "the newer OpenAI snapshot stands");
  assert.ok(t.runtime.diagnostics().providerUnavailable >= 1);
  t.indicator().click();
  assert.match(t.panel().textContent, /OpenAInot available in this build/u);
  held.restore();
  await t.runtime.dispose();

  // Newer: an allowed edit. Older, answered late: OpenAI. The newer edit is what is sent.
  const u = await probing({ hasJevKey: null });
  const late = holdRead(u.services, "listRules");
  u.services.emit("rules"); await flushMicrotasks();
  u.services.emit("rules"); await flushMicrotasks();
  late.answer(1, [observed({ instruction: "Newest." })]); await flushMicrotasks();
  late.answer(0, [observed({ provider: "openai" })]); await flushMicrotasks();
  const other = u.h.addTab({ url: "about:blank" });
  u.h.commit(other, "https://x.com/home");
  await flushMicrotasks();
  assert.deepEqual(u.requests.map(request => request.state.rule.instruction), ["Newest."]);
  // Disposed while a reload reads: its late answer publishes nothing and nothing is sent.
  const after = holdRead(u.services, "listRules");
  u.services.emit("rules"); await flushMicrotasks();
  await u.runtime.dispose();
  after.answer(0, [observed()]); await flushMicrotasks();
  await u.runtime.checkpoint("commit", other);
  assert.equal(u.requests.length, 1);
});

test("a failed reload keeps decisions unavailable while the cached rule still limits locally; a later good reload recovers", async () => {
  for (const read of ["listRules", "getJevSettings"]) {
    const t = await probing({ hasJevKey: null,
      rules: [observed({ effects: ["pause_site"], override: "none", limits: { daily_minutes: 1, allowed_hours: null } })],
      preload: [{ day: DAY, host: "x.com", contextUuid: WORKSPACE_A, ms: 2 * 60000 }] });
    const held = holdRead(t.services, read);
    t.services.emit("rules"); await flushMicrotasks();
    held.fail(0); await flushMicrotasks();
    const tab = t.h.addTab({ url: "about:blank" });
    t.h.commit(tab, "https://x.com/home");
    await t.clock.advance(30 * 60000);
    nothingSent(t, `${read} failed`);
    assert.ok(t.pause(tab), `${read} failed: the deterministic daily limit still pauses from the cached rule`);
    held.restore();
    t.services.emit("rules"); await flushMicrotasks();
    t.h.commit(tab, "https://x.com/again");
    await flushMicrotasks();
    assert.equal(t.requests.length, 1, `${read}: a successful reload makes decisions available again`);
    await t.runtime.dispose();
  }
});

test("a contexts reload holds decisions the same way: pending, failed and recovered", async () => {
  const t = await probing();
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/home");
  await flushMicrotasks();
  const held = holdRead(t.services, "listContexts");
  t.services.emit("contexts");
  await flushMicrotasks();
  t.probe.release();
  await flushMicrotasks();
  nothingSent(t, "the probe pending when contexts began to reload");
  t.h.commit(tab, "https://x.com/second");
  await flushMicrotasks();
  nothingSent(t, "a new checkpoint while contexts reload");
  held.answer(0);
  await flushMicrotasks();
  t.h.commit(tab, "https://x.com/third");
  await flushMicrotasks();
  assert.deepEqual(t.requests.map(request => [request.state.observation.address.path, request.state.context_type]), [["/third", "project"]]);
  held.restore();
  const failing = holdRead(t.services, "listContexts");
  t.services.emit("contexts"); await flushMicrotasks();
  failing.fail(0); await flushMicrotasks();
  t.h.commit(tab, "https://x.com/fourth");
  await t.clock.advance(30 * 60000);
  assert.equal(t.requests.length, 1, "a failed contexts read keeps decisions unavailable");
  failing.restore();
  await t.runtime.dispose();
});

test("an answer to a request sent before a reload is not applied, even when the rule ID and policy are unchanged", async () => {
  for (const event of ["rules", "contexts"]) {
    const gate = deferred();
    let signal = null;
    const t = await setup({ jev: JEV_ON, rules: [observed({ effects: ["pause_site"], override: "none" })],
      decide: async (request, options) => { signal = options.signal; await gate.promise; return result(request, "pause_site"); } });
    const tab = t.h.addTab({ url: "about:blank" });
    t.h.commit(tab, "https://x.com/");
    await flushMicrotasks();
    assert.equal(t.runtime.diagnostics().decideCalls, 1);
    t.services.emit(event); // the same rule and settings are read again and settle at once
    await flushMicrotasks();
    assert.equal(signal.aborted, true, `${event}: the request under the old snapshot is revoked`);
    gate.resolve();
    await flushMicrotasks();
    assert.equal(t.pause(tab), null, `${event}: its answer is not applied`);
    await t.runtime.dispose();
  }
});

test("interval checkpoints run only while the tab is foreground; background tabs never call", async () => {
  const t = await setup({ jev: JEV_ON, rules: [observed()] });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  assert.equal(t.requests.length, 1);
  await t.clock.advance(5 * 60000 - TICK_INTERVAL_MS);
  assert.equal(t.requests.length, 1);
  await t.clock.advance(TICK_INTERVAL_MS);
  assert.equal(t.requests.length, 2);
  assert.equal(t.requests[1].state.checkpoint, "interval");
  assert.ok(t.requests[1].state.elapsed.foreground_session_ms >= 5 * 60000 - TICK_INTERVAL_MS);
  // Background: another tab selected; a commit in the background x.com tab never calls.
  const other = t.h.addTab({ url: "https://docs.example/" });
  t.h.commit(tab, "https://x.com/explore");
  await t.clock.advance(20 * 60000);
  assert.equal(t.requests.length, 2);
  // Unfocused window: no calls either.
  t.h.select(tab);
  await flushMicrotasks();
  const afterSelect = t.requests.length;
  t.h.window.dispatch("deactivate");
  await t.clock.advance(20 * 60000);
  assert.equal(t.requests.length, afterSelect);
  assert.ok(other);
  await t.runtime.dispose();
});

test("a new checkpoint cancels the stale in-flight request of the same tab", async () => {
  const gates = [];
  let t;
  t = await setup({ jev: JEV_ON, rules: [observed({ effects: ["nudge"] })],
    decide: async (request, { signal }) => { t.requests.push(request); t.signals.push(signal); const g = deferred(); gates.push(g); await g.promise;
      return result(request, "nudge", { reasonCode: "drift" }); } });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/a");
  await flushMicrotasks();
  t.h.commit(tab, "https://x.com/b");
  await flushMicrotasks();
  assert.equal(t.signals[0].aborted, true);
  assert.equal(t.signals[1].aborted, false);
  gates[0].resolve();
  await flushMicrotasks();
  assert.equal(t.notices(tab).length, 0, "a cancelled answer is dropped");
  gates[1].resolve();
  await flushMicrotasks();
  assert.equal(t.notices(tab).length, 1);
  assert.equal(t.notices(tab)[0].label, "A reminder from your rule for x.com. “I come here to post and answer mentions.”");
  await t.runtime.dispose();
});

test("the hourly budget is enforced browser-wide with no queue or retry", async () => {
  const shared = { suppressions: [] };
  const clock = createClock();
  // One process DecisionBudget (AxioSozoServices) for every window, at the published limit.
  const budget = createDecisionBudget({ clock: () => clock.fn(), getLimit: () => 2 });
  const one = await setup({ jev: { ...JEV_ON, hourly_budget: 2 }, rules: [observed()], shared, clock, budget });
  const two = await setup({ jev: { ...JEV_ON, hourly_budget: 2 }, rules: [observed()], shared, clock, budget });
  const tab = one.h.addTab({ url: "about:blank" });
  one.h.commit(tab, "https://x.com/1");
  one.h.commit(tab, "https://x.com/2");
  await flushMicrotasks();
  one.h.commit(tab, "https://x.com/3");
  await flushMicrotasks();
  assert.equal(one.requests.length, 2);
  assert.equal(one.runtime.diagnostics().budgetSkipped, 1);
  const other = two.h.addTab({ url: "about:blank" });
  two.h.commit(other, "https://x.com/");
  await flushMicrotasks();
  assert.equal(two.requests.length, 0, "the budget is shared across windows");
  one.h.window.dispatch("deactivate"); // no interval checkpoints while waiting out the hour
  await clock.advance(3600001);
  one.h.window.dispatch("activate");
  const before = one.requests.length;
  assert.equal(before, 2);
  one.h.commit(tab, "https://x.com/4");
  await flushMicrotasks();
  assert.equal(one.requests.length, before + 1, "rolling hour frees the budget");
  await one.runtime.dispose();
  await two.runtime.dispose();
});

// ---- Process decision runtime (Plan 4 step 9) ------------------------------------------
test("an unready process policy registers no lease: nothing is charged, shown or sent", async () => {
  const t = await setup({ jev: JEV_ON, rules: [observed()], ready: () => false });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/home");
  await t.clock.advance(30 * 60000);
  assert.deepEqual([t.requests.length, t.budget.snapshot().calls.length, t.decisions.registrations], [0, 0, 0]);
  assert.ok(t.runtime.diagnostics().leaseRefused >= 1);
  assert.equal(t.outgoing().hidden, true, "no outgoing-data notice without a lease");
  await t.runtime.dispose();
});

test("the reservation is charged once at the admitted checkpoint, never again at sending", async () => {
  const t = await setup({ jev: JEV_ON, rules: [observed()] });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/home");
  await flushMicrotasks();
  assert.deepEqual([t.requests.length, t.decisions.handoffs, t.budget.snapshot().calls.length], [1, 1, 1]);
  assert.equal(t.decisions.leases.get(t.requests[0].request_id).signal.aborted, true, "the lease is revoked once the answer arrived");
  await t.runtime.dispose();
});

test("the window's own sending guard: what changed while the host started is never handed off, and the charge is not refunded", async () => {
  const changes = [
    ["another tab selected", t => { t.h.addTab({ url: "https://docs.example/" }); }],
    ["the tab navigated", (t, tab) => { t.h.commit(tab, "https://x.com/elsewhere", { stop: false }); }],
    ["consent revoked", t => { t.services.jev = { ...JEV_ON, consent: false }; t.services.emit("rules"); }],
    ["the window lost focus", t => { t.h.window.dispatch("deactivate"); }],
    ["the indicator was hidden", t => { t.outgoing().parentNode.checkVisibility = () => false; }],
  ];
  for (const [label, change] of changes) {
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    const t = await setup({ jev: JEV_ON, rules: [observed()], hold: () => gate });
    const tab = t.h.addTab({ url: "about:blank" });
    t.h.commit(tab, "https://x.com/home");
    await flushMicrotasks();
    assert.equal(t.budget.snapshot().calls.length, 1, `${label}: reserved once at the checkpoint`);
    change(t, tab);
    await flushMicrotasks();
    release();
    await flushMicrotasks();
    assert.deepEqual([t.requests.length, t.decisions.handoffs], [0, 0], `${label}: nothing handed to the host`);
    assert.equal(t.budget.snapshot().calls.length, 1, `${label}: an uncertain dispatch is never refunded`);
    await t.runtime.dispose();
  }
});

test("a positive answer arriving after the lease was revoked (a policy write meanwhile) applies no effect, but its disclosure stays", async () => {
  const gate = deferred();
  const t = await setup({ jev: JEV_ON, rules: [observed({ effects: ["pause_site"], override: "none" })],
    decide: async request => { t.requests.push(request); await gate.promise; return result(request, "pause_site"); } });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  assert.equal(t.decisions.handoffs, 1, "handed off: the data left");
  // The process policy was invalidated while the provider answered: every lease revoked.
  for (const lease of t.decisions.leases.values()) lease.revoke();
  gate.resolve();
  await flushMicrotasks();
  assert.equal(t.pause(tab), null, "the stale pause_site is never applied");
  assert.deepEqual(t.runtime.diagnostics().displayed, []);
  assert.equal(t.runtime.diagnostics().dataSent, 1, "that data was sent is still counted");
  assert.equal(t.outgoing().getAttribute("data-state"), "sent", "and still shown");
  await t.runtime.dispose();
});

test("process invalidation: a key probe held across another window's write and its new publication never registers against the new revision", async () => {
  const t = await probing();
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/home");
  await flushMicrotasks();
  assert.deepEqual([t.probe.calls, t.decisions.registrations, t.process.snapshot().revision], [1, 0, 1], "probing under revision 1");
  // A rule or Jev write began elsewhere (synchronous invalidation) and its
  // hydration already published revision 3; this window's "rules" reload has
  // not run yet when the probe answers.
  t.process.invalidate();
  t.process.publish();
  t.probe.release();
  await flushMicrotasks();
  nothingSent(t, "the probe that began under revision 1");
  assert.deepEqual([t.decisions.registrations, t.decisions.handoffs], [0, 0], "no lease and no host call");
  assert.ok(t.runtime.diagnostics().policyUnsettled >= 1);
  // Until the write's own "rules" reload, nothing new is admitted either.
  t.h.commit(tab, "https://x.com/meanwhile");
  await flushMicrotasks();
  nothingSent(t, "before this window's reload");
  t.services.emit("rules");
  await flushMicrotasks();
  t.h.commit(tab, "https://x.com/next");
  await flushMicrotasks();
  assert.deepEqual([t.requests.length, t.decisions.revisions], [1, [3]], "a fresh checkpoint, under the revision it read");
  assert.equal(t.requests[0].state.observation.address.path, "/next");
  await t.runtime.dispose();
});

test("process invalidation: a rules reload that began before another window's write never settles decisions, even after the new publication", async () => {
  const t = await probing({ hasJevKey: null });
  const held = holdRead(t.services, "listRules");
  t.services.emit("rules"); // an earlier rules event: this read starts before the write
  await flushMicrotasks();
  t.process.invalidate();
  t.process.publish();
  held.answer(0);
  await flushMicrotasks();
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/home");
  await flushMicrotasks();
  await t.clock.advance(30 * 60000);
  nothingSent(t, "the read that predates the write");
  assert.equal(t.decisions.registrations, 0);
  assert.equal(t.indicator().hidden, false, "local limits keep the rule it read");
  held.restore();
  t.services.emit("rules"); // the write's own reload
  await flushMicrotasks();
  t.h.commit(tab, "https://x.com/again");
  await flushMicrotasks();
  assert.deepEqual([t.requests.length, t.decisions.revisions], [1, [3]]);
  await t.runtime.dispose();
});

test("process invalidation reaches every window: two held probes send nothing; work already dispatched keeps its disclosure; a window removes only its own registration", async () => {
  const process = fakeProcessPolicy();
  const a = await probing({ process });
  const gate = deferred();
  let b;
  b = await setup({ jev: JEV_ON, rules: [observed({ effects: ["pause_site"], override: "none" })], process, hasJevKey: async () => true,
    decide: async request => { b.requests.push(request); await gate.promise; return result(request, "pause_site"); } });
  const c = await probing({ process });
  assert.equal(process.listenerCount(), 3, "one owned registration per window");
  const tabA = a.h.addTab({ url: "about:blank" });
  a.h.commit(tabA, "https://x.com/home");
  const tabC = c.h.addTab({ url: "about:blank" });
  c.h.commit(tabC, "https://x.com/home");
  const tabB = b.h.addTab({ url: "about:blank" });
  b.h.commit(tabB, "https://x.com/");
  await flushMicrotasks();
  assert.deepEqual([a.probe.calls, c.probe.calls, b.decisions.handoffs], [1, 1, 1], "A and C probing; B already handed off");
  process.invalidate();
  process.publish();
  a.probe.release();
  c.probe.release();
  gate.resolve();
  await flushMicrotasks();
  for (const [label, w] of [["A", a], ["C", c]]) {
    nothingSent(w, `window ${label}`);
    assert.equal(w.decisions.registrations, 0, label);
  }
  assert.equal(b.pause(tabB), null, "B's answer from the old revision applies nothing");
  assert.equal(b.runtime.diagnostics().dataSent, 1, "what B already sent stays disclosed");
  assert.equal(b.outgoing().getAttribute("data-state"), "sent");
  assert.equal(b.requests.length, 1, "no further host call");
  // Closing A removes exactly its own registration; nothing shared is closed.
  await a.runtime.dispose();
  assert.equal(process.listenerCount(), 2);
  b.services.emit("rules");
  await flushMicrotasks();
  b.h.commit(tabB, "https://x.com/later");
  await flushMicrotasks();
  assert.deepEqual([b.requests.length, b.decisions.revisions.at(-1)], [2, 3], "B still decides, under the new revision");
  // A later invalidation still reaches B (its registration was never removed by A).
  const before = b.runtime.diagnostics().policyUnsettled;
  process.invalidate();
  b.h.commit(tabB, "https://x.com/after");
  await flushMicrotasks();
  assert.ok(b.runtime.diagnostics().policyUnsettled > before, "B's rules are unsettled by the invalidation");
  assert.equal(b.requests.length, 2);
  await b.runtime.dispose();
  await c.runtime.dispose();
  assert.equal(process.listenerCount(), 0);
});

/** Counts every services.listRules call from now on (the fake's own answer). */
function countReads(services) {
  const original = services.listRules;
  const reads = { count: 0 };
  services.listRules = (...args) => { reads.count++; return original.apply(services, args); };
  return reads;
}

test("process publication: a rules read begun after an invalidation, while unready, never binds the revision published before it answered", async () => {
  for (const [label, written, expected] of [
    ["the write switched the rule to OpenAI", [observed({ provider: "openai" })], null],
    ["the write changed the Jev rule's instruction", [observed({ instruction: "After the write: answers only." })], "After the write: answers only."],
  ]) {
    const t = await probing({ hasJevKey: null });
    const tab = t.h.addTab({ url: "about:blank" });
    await flushMicrotasks();
    t.process.invalidate(); // a write began (in this or another window)
    const held = holdRead(t.services, "listRules");
    t.services.emit("rules"); // a reload begins while unready and reads what the store holds before the write lands
    await flushMicrotasks();
    // The write lands and the process publishes its ready revision, with no
    // further invalidation; then the earlier read answers with its old rules.
    t.services.rules = written;
    t.process.publish();
    held.answer(0, [observed()]);
    await flushMicrotasks();
    held.restore();
    const reads = countReads(t.services);
    t.h.commit(tab, "https://x.com/home");
    await flushMicrotasks();
    await t.clock.advance(30 * 60000);
    if (expected === null) {
      nothingSent(t, `${label}: nothing from the earlier read`);
      assert.deepEqual([t.decisions.registrations, t.budgetCalls()], [0, 0], label);
    } else {
      assert.ok(t.requests.length >= 1, label);
      assert.ok(t.requests.every(request => request.state.rule.instruction === expected), `${label}: built from the fresh read only`);
      assert.ok(t.decisions.revisions.every(revision => revision === 3), `${label}: under the published revision`);
    }
    assert.equal(reads.count, 1, `${label}: exactly one fresh read for that revision, however many checkpoints`);
    await t.runtime.dispose();
  }
});

test("process publication: an exact ready revision changing during a rules read leaves that read unbound; the next checkpoint reads once under the new one", async () => {
  const t = await probing({ hasJevKey: null });
  const tab = t.h.addTab({ url: "about:blank" });
  await flushMicrotasks();
  assert.equal(t.process.snapshot().revision, 1);
  const held = holdRead(t.services, "listRules");
  t.services.emit("rules"); // begins under ready revision 1
  await flushMicrotasks();
  t.services.rules = [observed({ instruction: "Revision two." })];
  t.process.publish(); // ready 1 → ready 2 during the read, without an invalidation
  held.answer(0, [observed({ instruction: "Revision one." })]);
  await flushMicrotasks();
  held.restore();
  const reads = countReads(t.services);
  t.h.commit(tab, "https://x.com/home");
  await flushMicrotasks();
  assert.equal(reads.count, 1);
  assert.deepEqual([t.requests.length, t.requests[0]?.state.rule.instruction, t.decisions.revisions], [1, "Revision two.", [2]],
    "the checkpoint continued from the fresh read, under revision 2");
  t.h.commit(tab, "https://x.com/again");
  await flushMicrotasks();
  assert.deepEqual([reads.count, t.requests.length, t.decisions.revisions], [1, 2, [2, 2]], "bound now: no further read");
  await t.runtime.dispose();
});

test("process publication: a fresh startup becomes usable when its first hydration publishes, without a write; a failed fresh read is not retried", async () => {
  const process = fakeProcessPolicy({ ready: false });
  const t = await probing({ hasJevKey: null, process });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/home");
  await flushMicrotasks();
  nothingSent(t, "before the first publication");
  assert.equal(t.indicator().hidden, false, "local rules already work");
  const reads = countReads(t.services);
  process.publish(); // the first hydration: revision 1, ready
  t.h.commit(tab, "https://x.com/first");
  await flushMicrotasks();
  assert.deepEqual([reads.count, t.requests.length, t.decisions.revisions], [1, 1, [1]], "one fresh read, then that same checkpoint sends");
  assert.equal(t.requests[0].state.observation.address.path, "/first");
  t.h.commit(tab, "https://x.com/second");
  await flushMicrotasks();
  assert.deepEqual([reads.count, t.requests.length], [1, 2]);
  await t.runtime.dispose();

  // The fresh read fails: nothing is sent and it is not read again for that revision.
  const failing = await probing({ hasJevKey: null, process: fakeProcessPolicy({ ready: false }) });
  const failingTab = failing.h.addTab({ url: "about:blank" });
  await flushMicrotasks();
  const listRules = failing.services.listRules;
  let failed = 0;
  failing.services.listRules = async () => { failed++; throw new Error("synthetic read failure"); };
  failing.process.publish();
  failing.h.commit(failingTab, "https://x.com/home");
  await flushMicrotasks();
  await failing.clock.advance(30 * 60000);
  failing.h.commit(failingTab, "https://x.com/later");
  await flushMicrotasks();
  nothingSent(failing, "a failed fresh read");
  assert.equal(failed, 1, "one read per revision, not a retry loop");
  // The ordinary rules reload (a later write's event) restores it.
  failing.services.listRules = listRules;
  failing.services.emit("rules");
  await flushMicrotasks();
  failing.h.commit(failingTab, "https://x.com/after");
  await flushMicrotasks();
  assert.deepEqual([failing.requests.length, failing.decisions.revisions], [1, [1]]);
  await failing.runtime.dispose();
});

test("without the process policy snapshot and its owned invalidation registration a window makes no decision request", async () => {
  for (const [label, mutate] of [
    ["no registration API", services => { delete services.subscribeDecisionPolicyInvalidation; }],
    ["the registration throws", services => { services.subscribeDecisionPolicyInvalidation = () => { throw new Error("closed"); }; }],
    ["the registration returns no owned unsubscribe", services => { services.subscribeDecisionPolicyInvalidation = () => true; }],
    ["no snapshot API", services => { delete services.getDecisionPolicySnapshot; }],
  ]) {
    const base = fakeProcessPolicy();
    const process = { ...base, wire(services) { base.wire(services); mutate(services); return process; } };
    const t = await setup({ jev: JEV_ON, rules: [observed()], process });
    const tab = t.h.addTab({ url: "about:blank" });
    t.h.commit(tab, "https://x.com/home");
    await t.clock.advance(30 * 60000);
    assert.deepEqual([t.requests.length, t.decisions.registrations, t.budget.snapshot().calls.length], [0, 0, 0], label);
    assert.equal(t.indicator().hidden, false, `${label}: the rule itself still works locally`);
    await t.runtime.dispose();
  }
});

test("Jev outcomes apply only when listed, still foreground and on the same host", async () => {
  // Unlisted outcome: dropped.
  let t = await setup({ jev: JEV_ON, rules: [observed({ effects: ["nudge"] })], outcome: "pause_site" });
  let tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  assert.equal(t.pause(tab), null);
  assert.equal(t.notices(tab).length, 0);
  await t.runtime.dispose();

  // Tab switched away before the answer: dropped.
  const gate = deferred();
  t = await setup({ jev: JEV_ON, rules: [observed({ effects: ["pause_site"] })],
    decide: async request => { await gate.promise; return result(request, "pause_site"); } });
  tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  t.h.addTab({ url: "https://docs.example/" });
  gate.resolve();
  await flushMicrotasks();
  assert.equal(t.pause(tab), null);
  await t.runtime.dispose();

  // Listed pause_site while foreground: interstitial from the Jev layer.
  t = await setup({ jev: JEV_ON, rules: [observed({ effects: ["pause_site"], override: "none" })], outcome: "pause_site" });
  tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  assert.ok(t.pause(tab));
  assert.equal(t.pause(tab).querySelector(".axiosozo-pause-message").textContent, "Your rule for x.com pauses this site now.");
  assert.deepEqual(t.runtime.diagnostics().displayed, [{ rule_id: "r_xcom", effect: "pause_site", source: "jev" }]);
  await t.runtime.dispose();
});

test("suggest_leave offers Save and close: saves a bookmark, then closes; a failed save keeps the tab", async () => {
  let t = await setup({ jev: JEV_ON, rules: [observed()], outcome: "suggest_leave" });
  let tab = t.h.addTab({ url: "about:blank", label: "Mentions" });
  t.h.addTab({ url: "about:blank", select: false });
  t.h.commit(tab, "https://x.com/notifications");
  await flushMicrotasks();
  let [notice] = t.notices(tab);
  assert.equal(notice.type, "axiosozo-rule-suggest_leave");
  assert.deepEqual(notice.buttons.map(b => b.label), ["Save and close", "Not now"]);
  notice.clickButton("Save and close");
  await flushMicrotasks();
  assert.deepEqual(t.saved, [{ url: "https://x.com/notifications", title: "Mentions" }]);
  assert.equal(t.h.gBrowser.tabs.includes(tab), false);
  await t.runtime.dispose();

  t = await setup({ jev: JEV_ON, rules: [observed()], outcome: "suggest_leave", saveBookmark: async () => { throw new Error("disk"); } });
  tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  [notice] = t.notices(tab);
  notice.clickButton("Save and close");
  await flushMicrotasks();
  assert.equal(t.h.gBrowser.tabs.includes(tab), true, "nothing saved, so nothing closed");
  assert.equal(t.notices(tab).length, 1, "the notice stays so the user can choose again");
  await t.runtime.dispose();

  // Not now suppresses suggest_leave for this rule and context.
  t = await setup({ jev: JEV_ON, rules: [observed()], outcome: "suggest_leave" });
  tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://x.com/");
  await flushMicrotasks();
  t.notices(tab)[0].clickButton("Not now");
  t.h.commit(tab, "https://x.com/again");
  await flushMicrotasks();
  assert.equal(t.requests.length, 2);
  assert.equal(t.notices(tab).length, 0, "suppressed for 15 minutes");
  await t.runtime.dispose();
});

test("dispose flushes the ledger and removes every addition and listener", async () => {
  const t = await setup({ rules: [rule({ limits: { daily_minutes: 1, allowed_hours: null }, effects: ["pause_site"] })],
    preload: [{ day: DAY, host: "x.com", contextUuid: WORKSPACE_A, ms: 60000 }] });
  const tab = t.h.addTab({ url: "https://x.com/" });
  await t.clock.advance(12000);
  assert.ok(t.pause(tab));
  await t.runtime.dispose();
  assert.equal(sumFor(t.services.calls.recordForeground, "x.com"), 12000);
  assert.equal(t.pause(tab), null);
  assert.equal(t.indicator(), null);
  assert.equal(t.outgoing(), null);
  assert.equal(t.h.progressListeners.size, 0);
  assert.equal(t.h.gBrowser.tabContainer.listenerCount(), 0);
  assert.equal(t.h.window.windowListenerCount(), 0);
  assert.equal(t.services.listenerCount(), 0);
  assert.equal(t.adapter.listenerCount(), 0);
  assert.equal(t.clock.timers.size, 0);
  assert.equal(t.h.document.prolog.length, 0);
});
