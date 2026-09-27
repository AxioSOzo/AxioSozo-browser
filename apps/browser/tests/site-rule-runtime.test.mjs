/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
import { createFakeWindow, createFakeAdapter, createFakeServices, createClock, flushMicrotasks, context,
  WORKSPACE_A, WORKSPACE_B } from "./dev-loop-harness.test.mjs";

const core = await import("../../../packages/contexts/src/index.mjs");
const { installSiteRuleRuntime, SENT_INDICATOR_MS, TICK_INTERVAL_MS, OVERVIEW_URL } = await import("../chrome/SiteRuleRuntime.sys.mjs");

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
  shared = { budget: null, suppressions: [] }, clock = createClock(), saveBookmark = null, preload = [] } = {}) {
  const h = createFakeWindow({ privateWindow });
  const adapter = createFakeAdapter({ privateWindow });
  const services = createFakeServices(core, { rules,
    contexts: [context(WORKSPACE_A, "project"), context(WORKSPACE_B, "organization")],
    jev: jev ?? { consent: false, interval_minutes: 5, hourly_budget: 30 } });
  for (const record of preload) await services.recordForeground(record);
  services.calls.recordForeground.length = 0;
  const requests = [];
  const signals = [];
  const decideFn = decide ?? (async (request, { signal }) => { requests.push(request); signals.push(signal); return result(request, outcome); });
  let idleCallback = null;
  const saved = [];
  const runtime = installSiteRuleRuntime(h.window, { services, adapter, core, decide: decideFn,
    clock: clock.fn, timers: clock.timersApi, localTime: utcLocalTime, shared, hasJevKey,
    idle: { subscribe(_seconds, callback) { idleCallback = callback; return () => { idleCallback = null; }; } },
    saveBookmark: saveBookmark ?? (async info => { saved.push(info); }),
    requestId: (() => { let n = 0; return () => `req_test_${++n}`; })() });
  await runtime.ready;
  return { h, adapter, services, clock, runtime, requests, signals, saved, shared,
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
  const runtime = installSiteRuleRuntime(h.window, { services, adapter: createFakeAdapter(), core, decide: async () => null,
    clock: clock.fn, timers: clock.timersApi, localTime: utcLocalTime, shared: { budget: null, suppressions: [] },
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
  const runtime = installSiteRuleRuntime(h.window, { services, adapter: createFakeAdapter(), core,
    decide: async request => { requests.push(request); return result(request); },
    clock: clock.fn, timers: clock.timersApi, localTime: utcLocalTime, shared: { budget: null, suppressions: [] },
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
  const shared = { budget: null, suppressions: [] };
  const clock = createClock();
  const one = await setup({ jev: { ...JEV_ON, hourly_budget: 2 }, rules: [observed()], shared, clock });
  const two = await setup({ jev: { ...JEV_ON, hourly_budget: 2 }, rules: [observed()], shared, clock });
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
