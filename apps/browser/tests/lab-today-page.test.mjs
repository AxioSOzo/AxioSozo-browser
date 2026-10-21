/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The today sheet in about:axiosozo (#today): the actor's methods
// (AboutAxioSozoParent getToday, setTodayErrand, openTodayErrand,
// suggestTodayFirst) with the real lab/today/today-page.sys.mjs over synthetic
// today data and errands, their gates (the switch, a normal window), shapes
// and reply sanitizers; and the real page script on the real page HTML in
// mini-dom: the route and its link follow the switch, the sheet's lines and
// links, the errand buttons with Undo, and the one optional AI step. Synthetic;
// not evidence of Gecko rendering, VoiceOver or a real assistant.
import "./support/chrome-modules.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Node, parseHtml } from "./support/mini-dom.mjs";
import { fakeAiBackend, fakePrefs } from "./support/lab-harness.mjs";

const { dispatch, validateRequest, todayReply, todaySuggestionReply } = await import("../chrome/AboutAxioSozoParent.sys.mjs");
const Page = await import("../chrome/lab/today/today-page.sys.mjs");
const D = await import("../chrome/lab/today/today-data.sys.mjs");
const E = await import("../chrome/lab/errands/errand-store.sys.mjs");
const { createLabAi } = await import("../chrome/lab/ai.sys.mjs");
const M = await import("../chrome/overview/overview-model.mjs");

const WINDOW = Object.freeze({ name: "synthetic browser window" });
const ADMIN = "{22222222-2222-4222-8222-222222222222}";
const NOW = new Date(2026, 9, 9, 8, 30).getTime();
const SINCE = NOW - 10 * 3600000;
const flush = async (rounds = 8) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setTimeout(resolve, 0)); };

const ON = { [D.TODAY_PREFS.sheet]: true, [D.TODAY_PREFS.errands]: true };

function world({ prefs = fakePrefs(ON), sessions = [], errands = [], attention = [] } = {}) {
  const store = E.memoryStore({ version: 1, opened_day: null, seen_at: SINCE, finished: [] }, D.validateTodayStore);
  const errandStore = E.createErrandStore({ store: E.memoryStore({ version: 1, errands }), clock: () => NOW });
  const opened = [];
  const services = {
    isNormalWindow: candidate => candidate === WINDOW,
    needsAttention: async () => attention, listProjects: async () => [{ id: "p_harbor01", manifest: { name: "Harbor" } }],
    listContexts: async () => [{ uuid: ADMIN, name: "BV admin" }],
    openUrl: async options => { opened.push(options); return { opened: true }; },
  };
  const data = D.createTodayData({ store, getAgents: () => ({ list: () => sessions, subscribe: () => () => {} }), services,
    getErrands: () => errandStore, prefs, clock: () => NOW });
  const restoreData = D.setTodayDataForTesting(data);
  const restoreErrands = E.setErrandStoreForTesting(errandStore);
  const turns = [];
  let answer = () => ({ text: "", json: { pick: 1, why: "It is waiting for you" } });
  const backend = fakeAiBackend({ reply: turn => { turns.push(turn); return answer(turn); } });
  // The real module, with the AI facade over a scripted backend.
  const today = { ...Page, aiForWindow: ({ window, isPrivate }) => {
    assert.equal(window, WINDOW, "the sheet's own window");
    return createLabAi({ isPrivate, getBackend: () => backend });
  } };
  const ctx = (overrides = {}) => ({ services, pickedRoots: new Set(), window: () => WINDOW, isPrivate: () => false, current: () => true,
    prefs: () => prefs, today: () => today, ...overrides });
  return { ctx, store, errandStore, opened, prefs, turns, setAnswer: fn => { answer = fn; },
    restore: () => { restoreData(); restoreErrands(); } };
}

const session = overrides => ({ id: "s1", origin: "browser", source: "browser", client: "claude-code", clientLabel: "Claude Code",
  projectId: "p_harbor01", projectName: "Harbor", title: "Fix", state: "needs_you", reason: "Wants to run npm test.", summary: null,
  startedAt: NOW - 3600000, updatedAt: NOW - 1800000, endedAt: null, ...overrides });
const errand = overrides => ({ id: "e_00000001", title: "Pay VAT Q3", url: "https://tax.example/btw?id=7", space: ADMIN, due: "2026-10-09",
  due_from: null, state: "open", snoozed_until: null, created_at: 1, updated_at: 1, done_at: null, ...overrides });

// ---------------------------------------------------------------- the actor

test("today's methods take closed params: times, a boolean, an errand id and one of three actions", () => {
  for (const params of [undefined, {}, { look: true }, { since: SINCE }, { since: 0, look: false }]) validateRequest({ name: "getToday", params });
  for (const params of [{ since: -1 }, { since: 1.5 }, { since: "1" }, { look: "yes" }, { since: SINCE, window: 1 }, { prefs: {} }]) {
    assert.throws(() => validateRequest({ name: "getToday", params }), { code: "INVALID_PARAMS" }, JSON.stringify(params));
  }
  validateRequest({ name: "setTodayErrand", params: { id: "e_abcdefgh", action: "done" } });
  for (const params of [{ id: "e_abcdefgh", action: "remove" }, { id: "e_ABCDEFGH", action: "done" }, { id: "e_abc", action: "done" },
    { id: "e_abcdefgh" }, { id: "e_abcdefgh", action: "done", url: "https://x" }]) {
    assert.throws(() => validateRequest({ name: "setTodayErrand", params }), { code: "INVALID_PARAMS" }, JSON.stringify(params));
  }
  validateRequest({ name: "openTodayErrand", params: { id: "e_abcdefgh" } });
  assert.throws(() => validateRequest({ name: "openTodayErrand", params: { id: "e_abcdefgh", space: ADMIN } }), { code: "INVALID_PARAMS" });
  assert.throws(() => validateRequest({ name: "suggestTodayFirst", params: { prompt: "x" } }), { code: "INVALID_PARAMS" });
});

test("getToday: only while the sheet is on, only from a normal window; a look moves 'since' but this visit keeps its own", async () => {
  const w = world({ sessions: [session()], errands: [errand()] });
  try {
    const reply = await dispatch(w.ctx(), { name: "getToday", params: { look: true } });
    assert.equal(reply.since, SINCE);
    assert.equal(reply.today, "2026-10-09");
    assert.equal(reply.errands, true);
    assert.deepEqual(reply.counts, { waiting: 1, failed: 0, finished: 0, due: 1 });
    assert.deepEqual(reply.groups.waiting[0], { key: "agent:s1", kind: "agent", group: "waiting", title: "Harbor · Claude Code is waiting for you",
      detail: "Wants to run npm test. · 08:00", source: "Claude Code", project: { id: "p_harbor01", name: "Harbor" }, errand: null });
    assert.deepEqual(reply.groups.due[0].errand, { id: "e_00000001", spaceName: "BV admin" }, "no address crosses to the page");
    assert.equal((await w.store.load()).seen_at, NOW, "looked");
    assert.equal((await dispatch(w.ctx(), { name: "getToday", params: { since: SINCE } })).since, SINCE, "the visit's own since");
    await assert.rejects(dispatch(w.ctx({ isPrivate: () => true }), { name: "getToday" }), { code: "PRIVATE_WINDOW" });
    await assert.rejects(dispatch(w.ctx({ current: () => false }), { name: "getToday" }), { code: "DOCUMENT_GONE" });
    w.prefs.setBoolPref(D.TODAY_PREFS.sheet, false);
    await assert.rejects(dispatch(w.ctx(), { name: "getToday" }), { code: "LAB_OFF" });
  } finally { w.restore(); }
});

test("the reply is rebuilt from closed primitives: a strange line, field or count does not cross", () => {
  const line = { key: "agent:s1", kind: "agent", group: "waiting", title: "Harbor", detail: "x", source: "Claude Code",
    project: { id: "p_harbor01", name: "Harbor", root: "/Users/x/harbor" }, errand: null, url: "https://secret.example/" };
  const reply = todayReply({ today: "2026-10-09", since: SINCE, errands: "yes", counts: { waiting: 2, failed: -1, finished: "3" },
    groups: { waiting: [line, { ...line, key: "file:/etc/passwd" }, { ...line, group: "due" }, { ...line, title: "a\u0000b" }],
      failed: [{ ...line, group: "failed", kind: "shell" }], due: [{ ...line, group: "due", kind: "errand", errand: { id: "e_00000001", url: "https://x" } }] },
    extra: 1 });
  assert.deepEqual(reply.groups.waiting, [{ key: "agent:s1", kind: "agent", group: "waiting", title: "Harbor", detail: "x", source: "Claude Code",
    project: { id: "p_harbor01", name: "Harbor" }, errand: null }]);
  assert.deepEqual(reply.groups.failed, []);
  assert.deepEqual(reply.groups.due[0].errand, { id: "e_00000001", spaceName: null });
  assert.deepEqual(reply.counts, { waiting: 2, failed: 0, finished: 0, due: 0 });
  assert.equal(reply.errands, false);
  assert.equal("extra" in reply, false);
  assert.deepEqual(todaySuggestionReply({ status: "ok", client: "agy", key: "rm -rf", why: "x" }),
    { status: "failed", client: null, model: null, key: null, why: "", text: "No suggestion this time." });
});

test("an errand's Done, Tomorrow and Undo, and its page in its space, need Errands on too", async () => {
  const w = world({ errands: [errand()] });
  try {
    assert.deepEqual(await dispatch(w.ctx(), { name: "setTodayErrand", params: { id: "e_00000001", action: "done" } }), { ok: true });
    assert.equal((await w.errandStore.get("e_00000001")).state, "done");
    await dispatch(w.ctx(), { name: "setTodayErrand", params: { id: "e_00000001", action: "reopen" } });
    await dispatch(w.ctx(), { name: "setTodayErrand", params: { id: "e_00000001", action: "snooze" } });
    assert.equal((await w.errandStore.get("e_00000001")).snoozed_until, "2026-10-10");
    await assert.rejects(dispatch(w.ctx(), { name: "setTodayErrand", params: { id: "e_zzzzzzzz", action: "done" } }), { code: "UNKNOWN_ERRAND" });
    assert.deepEqual(await dispatch(w.ctx(), { name: "openTodayErrand", params: { id: "e_00000001" } }), { ok: true });
    assert.deepEqual(w.opened, [{ window: WINDOW, url: "https://tax.example/btw?id=7", contextUuid: ADMIN }]);
    w.prefs.setBoolPref(D.TODAY_PREFS.errands, false);
    await assert.rejects(dispatch(w.ctx(), { name: "openTodayErrand", params: { id: "e_00000001" } }), { code: "LAB_OFF" });
  } finally { w.restore(); }
});

test("Suggest a first thing: one turn with the numbered lines and no address; a bad pick or a failure is said plainly", async () => {
  const w = world({ sessions: [session()], errands: [errand()] });
  try {
    const reply = await dispatch(w.ctx(), { name: "suggestTodayFirst", params: { since: SINCE } });
    assert.equal(w.turns.length, 1);
    assert.match(w.turns[0].prompt, /^1\. \[waiting for you\] Harbor · Claude Code is waiting for you/mu);
    assert.doesNotMatch(w.turns[0].prompt, /tax\.example|https?:/u);
    assert.deepEqual(w.turns[0].json, { ...w.turns[0].json, required: ["pick", "why"] });
    assert.equal(reply.status, "ok");
    assert.equal(reply.key, "agent:s1");
    assert.equal(reply.why, "It is waiting for you.");
    w.setAnswer(() => ({ text: "", json: { pick: 7, why: "x" } }));
    assert.equal((await dispatch(w.ctx(), { name: "suggestTodayFirst" })).text, "The assistant answered in a form the sheet cannot use. Try again.");
    w.setAnswer(() => { throw Object.assign(new Error("limit"), { code: "TURN_FAILED", reason: "Claude Code is out of its 5-hour limit until 23:30." }); });
    const failed = await dispatch(w.ctx(), { name: "suggestTodayFirst" });
    assert.deepEqual([failed.status, failed.text], ["failed", "Claude Code is out of its 5-hour limit until 23:30."]);
    await assert.rejects(dispatch(w.ctx({ isPrivate: () => true }), { name: "suggestTodayFirst" }), { code: "PRIVATE_WINDOW" });
    assert.equal(w.turns.length, 3, "a private window asks nothing");
  } finally { w.restore(); }
});

// ---------------------------------------------------------------- the page

const HTML = readFileSync(new URL("../chrome/overview/about-axiosozo.html", import.meta.url), "utf8");
const HOME = "{11111111-1111-4111-8111-111111111111}";
let serial = 0;
const SHEET = Object.freeze({
  version: 1, today: "2026-10-09", since: SINCE, errands: true,
  counts: { waiting: 1, failed: 1, finished: 1, due: 1 }, more: { waiting: 0, failed: 0, finished: 0, due: 0 },
  groups: {
    waiting: [{ key: "agent:s1", kind: "agent", group: "waiting", title: "Harbor · Claude Code is waiting for you", detail: "Wants to run npm test. · 08:00",
      source: "Claude Code", project: { id: "p_harbor01", name: "Harbor" }, errand: null }],
    failed: [{ key: "server:p_north001:web", kind: "server", group: "failed", title: "Northwind · web stopped with an error", detail: "exit code 1",
      source: "Servers", project: { id: "p_north001", name: "Northwind" }, errand: null }],
    finished: [{ key: "agent:s2", kind: "agent", group: "finished", title: "Atlas · Codex finished", detail: "Removed unused rules. · yesterday 23:10",
      source: "Codex", project: null, errand: null }],
    due: [{ key: "errand:e_00000001", kind: "errand", group: "due", title: "Pay VAT Q3", detail: "Due today · BV admin", source: "Errands",
      project: null, errand: { id: "e_00000001", spaceName: "BV admin" } }],
  },
});

async function loadPage({ hash = "#today", flags = { contexts: true, today: true }, handlers = {} } = {}) {
  const document = parseHtml(HTML);
  const calls = [];
  const defaults = {
    getOverviewFlags: () => flags,
    activeContext: () => ({ uuid: HOME }),
    listContexts: () => [{ uuid: HOME, name: "Home", icon: "", type: "personal", organization_uuid: null, project_id: null, container: 0 }],
    listProjects: () => [], listRules: () => [], getJevSettings: () => ({ consent: false, interval_minutes: 5, hourly_budget: 30 }),
    usageSummary: () => [], listOrphans: () => [], needsAttention: () => [], serviceStatus: () => [], listWatches: () => [],
    getWatchStatus: () => ({}), getSafetyStatus: () => ({}),
    getToday: () => structuredClone(SHEET),
    setTodayErrand: () => ({ ok: true }), openTodayErrand: () => ({ ok: true }),
    suggestTodayFirst: () => ({ status: "ok", client: "claude-code", model: "haiku", key: "errand:e_00000001", why: "It is due today.", text: "" }),
  };
  const api = {
    async request(name, params) {
      calls.push([name, JSON.parse(JSON.stringify(params ?? {}))]);
      const handler = handlers[name] ?? defaults[name];
      if (!handler) throw { code: "UNKNOWN_METHOD", message: name };
      return handler(params ?? {});
    },
    subscribe() { return () => {}; },
  };
  const windowListeners = new Map();
  const location = { hash };
  Object.assign(globalThis, {
    document, Node, location,
    window: { AxioSozoOverview: api, addEventListener: (type, fn) => windowListeners.set(type, fn) },
    history: { replaceState: (_state, _title, url) => { location.hash = url; } },
    CSS: { escape: value => String(value).replace(/["\\]/g, "\\$&") },
  });
  await import(`../chrome/overview/about-axiosozo.mjs?today-page=${++serial}`);
  await flush();
  const named = name => calls.filter(([call]) => call === name);
  const root = () => document.getElementById("today-page");
  return { document, calls, named, root, status: () => document.getElementById("status").textContent };
}
const visibleView = document => document.querySelectorAll("section.view").filter(section => !section.hidden).map(section => section.dataset.view);
const byText = (root, text) => root.querySelectorAll("button").find(node => node.textContent === text);

test("#today is the sheet while its switch is on, with a Today link; off, the address shows Projects and there is no link", async () => {
  const on = await loadPage();
  assert.deepEqual(visibleView(on.document), ["today"]);
  assert.equal(on.document.querySelector('.views a[data-view="today"]').textContent, "Today");
  assert.deepEqual(on.named("getToday")[0], ["getToday", { look: true }], "this visit is a look");
  const off = await loadPage({ flags: { contexts: true, today: false } });
  assert.deepEqual(visibleView(off.document), ["projects"]);
  assert.equal(off.document.querySelector('.views a[data-view="today"]'), null);
  assert.deepEqual(off.named("getToday"), [], "nothing read for a sheet that is off");
});

test("the sheet: a date, one sentence, lines grouped by what they need, each a link, and what it is made of", async t => {
  // The page labels "since" against the wall clock; pin it to the fixture's NOW
  // so "yesterday" stays yesterday after 9 October 2026 (Date only, not timers).
  t.mock.timers.enable({ apis: ["Date"], now: NOW });
  const page = await loadPage();
  const root = page.root();
  assert.equal(root.getAttribute("aria-busy"), null);
  assert.equal(root.querySelector("h2").textContent, "Today");
  assert.equal(root.querySelector(".today-date").textContent, "Friday 9 October");
  assert.equal(root.querySelector(".view-head .block-help").textContent, "1 needs you, 1 failed and 1 errand is due.");
  const sections = root.querySelectorAll("section.today-section");
  assert.deepEqual(sections.map(section => section.getAttribute("data-group")), ["waiting", "failed", "finished", "due"]);
  assert.match(sections[2].querySelector("h3").textContent, /^Finished since \d\d:\d\d (yesterday|today)/u);
  assert.deepEqual(root.querySelectorAll(".today-row .dot").map(dot => dot.getAttribute("data-status")), ["warn", "down", "up", "due"]);
  const links = root.querySelectorAll("a.today-link");
  assert.deepEqual(links.map(link => [link.textContent, link.getAttribute("href")]),
    [["Harbor · Claude Code is waiting for you", "#project=p_harbor01"], ["Northwind · web stopped with an error", "#project=p_north001"]]);
  assert.equal(root.querySelector(".today-row:not([data-picked]) span.row-title").textContent, "Atlas · Codex finished", "no project: plain text");
  assert.equal(root.querySelector("p.footnote").textContent, M.TODAY_NOTE);
  assert.equal(root.querySelector("#today-suggest-help").textContent, M.TODAY_SUGGEST_HELP, "what goes where, before the click");
  assert.deepEqual(page.named("suggestTodayFirst"), [], "no AI until asked");
});

test("errand lines: the title opens its page in its space; Done and Tomorrow, then Undo", async () => {
  const page = await loadPage();
  const root = page.root();
  byText(root, "Pay VAT Q3").click();
  await flush();
  assert.deepEqual(page.named("openTodayErrand"), [["openTodayErrand", { id: "e_00000001" }]]);
  byText(root, "Done").click();
  await flush();
  assert.deepEqual(page.named("setTodayErrand").at(-1), ["setTodayErrand", { id: "e_00000001", action: "done" }]);
  assert.equal(page.status(), "Done: Pay VAT Q3");
  assert.deepEqual(page.named("getToday").at(-1), ["getToday", { since: SINCE }], "read again with the visit's own since");
  const undo = page.root().querySelector(".today-undo");
  assert.match(undo.textContent, /Pay VAT Q3 is marked done\./u);
  byText(undo, "Undo").click();
  await flush();
  assert.deepEqual(page.named("setTodayErrand").at(-1), ["setTodayErrand", { id: "e_00000001", action: "reopen" }]);
  assert.equal(page.root().querySelector(".today-undo"), null);
  byText(page.root(), "Tomorrow").click();
  await flush();
  assert.deepEqual(page.named("setTodayErrand").at(-1), ["setTodayErrand", { id: "e_00000001", action: "snooze" }]);
  assert.equal(page.status(), "Pay VAT Q3 is back tomorrow.");
});

test("Suggest a first thing: on the click only, it marks one line and says who suggested it and that it can be wrong", async () => {
  const page = await loadPage();
  byText(page.root(), "Suggest a first thing").click();
  await flush();
  assert.deepEqual(page.named("suggestTodayFirst"), [["suggestTodayFirst", { since: SINCE }]]);
  const root = page.root();
  const pick = root.querySelector(".today-pick");
  assert.match(pick.textContent, /^Start with: Pay VAT Q3 It is due today\./u);
  assert.match(pick.textContent, /Suggested by Claude Code from the lines on this sheet\. It can be wrong; the choice is yours\./u);
  const picked = root.querySelector(".today-row[data-picked]");
  assert.equal(picked.querySelector(".row-title").textContent, "Pay VAT Q3");
  assert.equal(picked.querySelector(".tag").textContent, "Suggested first");
  const failing = await loadPage({ handlers: { suggestTodayFirst: () => ({ status: "failed", client: null, text: "Neither Claude Code nor Codex is ready on this Mac." }) } });
  byText(failing.root(), "Suggest a first thing").click();
  await flush();
  assert.equal(failing.root().querySelector(".today-pick").textContent, "Neither Claude Code nor Codex is ready on this Mac.");
  assert.equal(failing.root().querySelector(".today-row[data-picked]"), null);
});

test("an empty day says so, without the AI button; a refused sheet says why", async () => {
  const empty = await loadPage({ handlers: { getToday: () => ({ ...structuredClone(SHEET), counts: { waiting: 0, failed: 0, finished: 0, due: 0 },
    groups: { waiting: [], failed: [], finished: [], due: [] } }) } });
  assert.equal(empty.root().querySelector(".view-head .block-help").textContent, "Nothing needs you.");
  assert.match(empty.root().querySelector("p.empty").textContent, /^Nothing waiting, failed or due/u);
  assert.equal(byText(empty.root(), "Suggest a first thing"), undefined);
  const refused = await loadPage({ handlers: { getToday: () => { throw { code: "LAB_OFF", message: "off" }; } } });
  assert.equal(refused.root().querySelector("p.empty").textContent, M.TODAY_OFF);
});

test("the model: summary sentences, the route and where a line leads", () => {
  assert.equal(M.todaySummary({ waiting: 2, failed: 0, due: 3 }), "2 need you and 3 errands are due.");
  assert.equal(M.todaySummary({ finished: 1 }), "Nothing needs you. 1 thing finished since you last looked.");
  assert.deepEqual(M.routeFromHash("#today", { today: true }), { view: "today" });
  assert.deepEqual(M.routeFromHash("#today", { today: false }), { view: "projects" });
  assert.equal(M.isTodayHash("#today"), true);
  assert.equal(M.isTodayHash("#today=1"), false);
  assert.deepEqual(M.todayTarget({ errand: { id: "e_00000001" } }), { kind: "errand", id: "e_00000001" });
  assert.deepEqual(M.todayTarget({ project: { id: "p_harbor01" } }), { kind: "project", href: "#project=p_harbor01" });
  assert.equal(M.todayTarget({ project: { id: "../x" } }), null);
});
