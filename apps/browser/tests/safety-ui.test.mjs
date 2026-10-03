/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// P7 explicit durable safety choice at every seam: the actor child's reading of
// a trusted click on the authored confirm or recovery control, the parent's
// closed private messages and categorical getSafetyStatus, the real
// AxioSozoServices composition over the reviewed SafetyNativeOwner,
// SafetyAtomicStorage, SafetyOwner, SafetyPreferenceFactory and
// SafetyPreferences with invented files, preferences and DNS, and the page's
// first-run offer and Settings block on the real HTML in support/mini-dom.mjs.
// Synthetic only: no real profile, preference, DNS service or network. Not
// evidence of native Gecko preference/DNS behaviour, filtering or rendering.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { contextsCoreAvailable } from "./support/chrome-modules.mjs";
import { fakeZenWindow } from "./support/fake-zen.mjs";
import { Node, parseHtml, makeEvent } from "./support/mini-dom.mjs";
import { prefFixture } from "./safety-fakes.mjs";
import { AboutAxioSozoParent, MESSAGES, METHODS, USER_ACTIONS, setProvidersForTesting, safetyReply } from "../chrome/AboutAxioSozoParent.sys.mjs";
import { userActionFromClick, SAFETY_CONTROLS, createOverviewApi, AboutAxioSozoChild, CLICK_OPTIONS } from "../chrome/AboutAxioSozoChild.sys.mjs";
import { createSafetyNativeOwnerRegistry } from "../chrome/SafetyNativeOwner.sys.mjs";
import { createSafetyAtomicStorage } from "../chrome/SafetyAtomicStorage.sys.mjs";

const skip = contextsCoreAvailable ? false : "packages/contexts/src/index.mjs is absent";
const { AxioSozoServices, SAFETY_REVOKE_TOPICS, observeSafetyLifecycle } = skip ? {} : await import("../chrome/AxioSozoServices.sys.mjs");
const { ZenWorkspaceAdapter } = await import("../chrome/ZenWorkspaceAdapter.sys.mjs");
const M = await import("../chrome/overview/overview-model.mjs");

const HTML = readFileSync(new URL("../chrome/overview/about-axiosozo.html", import.meta.url), "utf8");
const FAMILY = "https://family.cloudflare-dns.com/dns-query";
const settle = async (rounds = 40) => { for (let i = 0; i < rounds; i++) await Promise.resolve(); };
const flush = async (rounds = 8) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setTimeout(resolve, 0)); };
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const OFFER = Object.keys(SAFETY_CONTROLS.confirm);

// ---------------------------------------------------------------- the child

function safetyDocument(uri = "about:axiosozo#projects") {
  const document = parseHtml(`<html><body><main>
    <input type="checkbox" id="axiosozo-safety-offer-checked"><button type="button" id="axiosozo-safety-offer-confirm">Save my choice</button>
    <input type="checkbox" id="axiosozo-safety-settings-checked"><button type="button" id="axiosozo-safety-settings-confirm">Save</button>
    <div id="safety-offer"><div class="panel"><div class="button-row safety-recovery" id="axiosozo-safety-offer-recovery" role="group" data-safety-sequence="3">
      <button type="button" data-safety-outcome="RESTORED">Back</button>
      <button type="button" data-safety-outcome="ACCEPTED">Keep</button></div></div></div>
    <div id="safety-settings-body"><div class="button-row safety-recovery" id="axiosozo-safety-settings-recovery" role="group" data-safety-sequence="3">
      <button type="button" id="settings-changed" data-safety-outcome="EXTERNAL_CHANGED">Changed</button></div></div>
    <button type="button" id="other">Other</button>
  </main></body></html>`);
  document.documentURI = uri;
  document.getElementById("axiosozo-safety-offer-checked").checked = true;
  return document;
}
const click = (target, init = {}) => ({ ...makeEvent("click", init), target });
// What the service's latest getSafetyStatus answer issued (createOverviewApi().issued).
const issuedSequence = safetySequence => ({ hasWatch: () => false, safetySequence });

test("child: a trusted click on a confirm control sends its own checkbox's boolean; recovery buttons their fixed outcome and sequence", () => {
  const document = safetyDocument();
  const issued = issuedSequence(3);
  assert.deepEqual(OFFER, ["axiosozo-safety-offer-confirm", "axiosozo-safety-settings-confirm"]);
  assert.deepEqual(userActionFromClick(click(document.getElementById(OFFER[0])), document),
    { name: MESSAGES.CONFIRM_SAFETY_CHOICE, data: { checked: true }, event: "safety" });
  assert.deepEqual(userActionFromClick(click(document.getElementById(OFFER[1]), { detail: 0 }), document),
    { name: MESSAGES.CONFIRM_SAFETY_CHOICE, data: { checked: false }, event: "safety" }, "the Settings control reads its own checkbox");
  const [restored, accepted] = document.querySelectorAll("#safety-offer button[data-safety-outcome]");
  assert.deepEqual(userActionFromClick(click(restored), document, issued), { name: MESSAGES.RESOLVE_SAFETY_RECOVERY, data: { sequence: 3, outcome: "RESTORED" }, event: "safety" });
  assert.deepEqual(userActionFromClick(click(accepted), document, issued).data, { sequence: 3, outcome: "ACCEPTED" });
  assert.deepEqual(userActionFromClick(click(document.getElementById("settings-changed")), document, issued).data, { sequence: 3, outcome: "EXTERNAL_CHANGED" });
  assert.equal(userActionFromClick(click(document.getElementById(OFFER[0]), { isTrusted: false }), document), null, "synthesized");
  assert.equal(userActionFromClick(click(document.getElementById("other")), document, issued), null);
  const group = document.getElementById("axiosozo-safety-offer-recovery");
  group.setAttribute("data-safety-sequence", "0");
  assert.equal(userActionFromClick(click(restored), document, issued), null);
  group.setAttribute("data-safety-sequence", "3");
  restored.setAttribute("data-safety-outcome", "RESET_PREFS");
  assert.equal(userActionFromClick(click(restored), document, issued), null, "only the fixed outcomes");
  document.getElementById("axiosozo-safety-offer-checked").disabled = true;
  assert.equal(userActionFromClick(click(document.getElementById(OFFER[0])), document), null, "a disabled checkbox decides nothing");
  document.getElementById("axiosozo-safety-offer-checked").disabled = false;
  document.getElementById("axiosozo-safety-offer-checked").setAttribute("type", "text");
  assert.equal(userActionFromClick(click(document.getElementById(OFFER[0])), document), null);
  assert.equal(userActionFromClick(click(document.getElementById(OFFER[1])), safetyDocument("https://example.test/")), null);
});

test("child: a recovery answer needs its authored group in its own panel and the sequence the service issued; copied attributes mean nothing", () => {
  const document = safetyDocument();
  const restored = document.querySelector('#safety-offer button[data-safety-outcome="RESTORED"]');
  const expected = { name: MESSAGES.RESOLVE_SAFETY_RECOVERY, data: { sequence: 3, outcome: "RESTORED" }, event: "safety" };
  assert.deepEqual(userActionFromClick(click(restored), document, issuedSequence(3)), expected);
  assert.equal(userActionFromClick(click(restored), document), null, "no service answer: no sequence was issued");
  assert.equal(userActionFromClick(click(restored), document, issuedSequence(null)), null, "the latest answer requires no recovery");
  assert.equal(userActionFromClick(click(restored), document, issuedSequence(4)), null, "a page still showing an older sequence");
  const copy = (outcome = "RESTORED") => {
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("data-safety-outcome", outcome);
    button.setAttribute("data-safety-sequence", "3");
    return button;
  };
  const loose = copy();
  document.querySelector("main").append(loose);
  assert.equal(userActionFromClick(click(loose), document, issuedSequence(3)), null, "outside any recovery group");
  const nested = copy();
  const wrapper = document.createElement("span");
  wrapper.append(nested);
  document.getElementById("axiosozo-safety-offer-recovery").append(wrapper);
  assert.equal(userActionFromClick(click(nested), document, issuedSequence(3)), null, "only the group's own buttons");
  // A look-alike group: wrong id, or the right id outside its own panel.
  const fake = document.createElement("div");
  fake.setAttribute("class", "button-row safety-recovery");
  fake.setAttribute("data-safety-sequence", "3");
  const inFake = copy();
  fake.append(inFake);
  document.getElementById("safety-offer").append(fake);
  assert.equal(userActionFromClick(click(inFake), document, issuedSequence(3)), null, "a group without the authored id");
  const settingsGroup = document.getElementById("axiosozo-safety-settings-recovery");
  document.querySelector("main").append(settingsGroup);
  assert.equal(userActionFromClick(click(document.getElementById("settings-changed")), document, issuedSequence(3)), null, "outside its panel");
  document.getElementById("axiosozo-safety-offer-recovery").setAttribute("class", "button-row");
  assert.equal(userActionFromClick(click(restored), document, issuedSequence(3)), null, "only the authored recovery group");
});

test("child: the issued sequence is the latest getSafetyStatus answer's own, only when the owner requires recovery", async () => {
  const replies = [];
  const api = createOverviewApi({ win: { Promise, JSON, TypeError }, Cu: { cloneInto: value => structuredClone(value), waiveXrays: value => value, exportFunction: fn => fn },
    sendAsyncMessage: () => {}, sendQuery: () => new Promise(resolve => replies.push(resolve)) });
  const answer = async value => { const pending = api.request("getSafetyStatus"); replies.at(-1)({ ok: true, value }); await pending; };
  await answer({ code: "RECOVERY_REQUIRED", sequence: 5, blocked: true, cleanup_blocked: false });
  assert.equal(api.issued.safetySequence, 5);
  await answer({ code: "STORE_UNAVAILABLE", sequence: 6, blocked: true, cleanup_blocked: false });
  assert.equal(api.issued.safetySequence, null, "an unreadable record with a sequence is not a recovery");
  await answer({ code: "RECOVERY_REQUIRED", sequence: 7, blocked: true, cleanup_blocked: true });
  assert.equal(api.issued.safetySequence, null, "a blocked cleanup comes first");
  const older = api.request("getSafetyStatus");
  const newer = api.request("getSafetyStatus");
  replies.at(-1)({ ok: true, value: { code: "CURRENT", sequence: 8, blocked: false, cleanup_blocked: false } });
  await newer;
  replies.at(-2)({ ok: true, value: { code: "RECOVERY_REQUIRED", sequence: 7, blocked: true, cleanup_blocked: false } });
  await older;
  assert.equal(api.issued.safetySequence, null, "a late older answer changes nothing");
});

// ---------------------------------------------------------------- the parent

function fakeActor({ uri = "about:axiosozo#projects" } = {}) {
  const actor = new AboutAxioSozoParent();
  const embedder = { name: "browser" };
  const progress = new Set();
  const window = { name: "normal-window", gBrowser: { selectedBrowser: embedder,
    tabContainer: { addEventListener() {}, removeEventListener() {} },
    addTabsProgressListener: listener => progress.add(listener), removeTabsProgressListener: listener => progress.delete(listener) } };
  const context = { parent: null, embedderElement: embedder, usePrivateBrowsing: false, topChromeWindow: window };
  context.top = context;
  actor.browsingContext = context;
  actor.manager = { remoteType: "privilegedabout", isCurrentGlobal: true, documentURI: { spec: uri },
    documentPrincipal: { isSystemPrincipal: false, isContentPrincipal: true, originNoSuffix: "about:axiosozo", privateBrowsingId: 0 } };
  actor.sendAsyncMessage = () => {};
  return { actor, window, navigate(spec) { actor.manager.documentURI = { spec }; for (const listener of [...progress]) listener.onLocationChange(embedder, { isTopLevel: true }); } };
}
const RAW = { code: "CURRENT", reason: "CURRENT", blocked: false, cleanup_blocked: false, sequence: 2, changed: false,
  status: { offer: false, checked: true, active: true, owned: true, extra: "x" }, offer: { offer: false, checked: true },
  state: { owned: { previous: {} } }, actual: { prefs: { "network.trr.uri": { value: FAMILY } } }, applied_fields: ["network.trr.uri"], journal: [] };
function actorServices({ hold = null, reply = RAW } = {}) {
  const calls = [];
  return { calls, services: { isNormalWindow: () => true, on: () => () => {},
    getSafetyStatus: async args => { calls.push(["getSafetyStatus", Object.keys(args)]); return reply; },
    confirmSafetyChoice: async args => { calls.push(["confirmSafetyChoice", args, args.current()]); if (hold) await hold.promise; return reply; },
    resolveSafetyRecovery: async args => { calls.push(["resolveSafetyRecovery", args, args.current()]); return reply; } } };
}
const request = (actor, name, params) => actor.receiveMessage({ name: MESSAGES.REQUEST, data: { name, params } });

test("parent: getSafetyStatus takes exactly an empty object and returns only the categorical projection", async () => {
  const { services, calls } = actorServices();
  const restore = setProvidersForTesting({ services: () => services });
  try {
    const { actor } = fakeActor();
    const reply = await request(actor, "getSafetyStatus", {});
    assert.deepEqual(reply.value, { code: "CURRENT", reason: "CURRENT", blocked: false, cleanup_blocked: false, sequence: 2, changed: false,
      status: { offer: false, checked: true, active: true, owned: true }, offer: { offer: false, checked: true } });
    assert.doesNotMatch(JSON.stringify(reply), /network\.trr|cloudflare|journal|applied|actual|state/u, "no preference value, journal or private state");
    assert.deepEqual(calls, [["getSafetyStatus", ["window"]]]);
    for (const params of [{ x: 1 }, { userConfirmed: true }, { window: "w" }]) {
      assert.equal((await request(actor, "getSafetyStatus", params)).error.code, "INVALID_PARAMS", JSON.stringify(params));
    }
    for (const name of ["confirmSafetyChoice", "resolveSafetyRecovery", "chooseSafety", "setSafety"]) {
      assert.equal((await request(actor, name, { checked: true, userConfirmed: true })).error.code, "UNKNOWN_METHOD", `${name} is no page request`);
    }
    assert.ok(!Object.keys(METHODS).some(name => /safety/iu.test(name) && name !== "getSafetyStatus"));
  } finally { restore(); }
  // Unknown stays null; blocked/cleanup_blocked are false only when the browser says so.
  assert.deepEqual(safetyReply({ code: "STORE_UNAVAILABLE", status: null, changed: null, sequence: null }),
    { code: "STORE_UNAVAILABLE", reason: null, blocked: true, cleanup_blocked: true, sequence: null, changed: null, status: null, offer: null });
  assert.equal(safetyReply({ code: "x-raw message" }).code, "SAFETY_UNAVAILABLE", "never a raw native message");
});

test("parent: private choices carry exactly their closed params; the services get the native window and a current receipt, never userConfirmed", async () => {
  const { services, calls } = actorServices();
  const restore = setProvidersForTesting({ services: () => services });
  try {
    const { actor, window } = fakeActor({ uri: "about:axiosozo#ai" });
    assert.equal((await actor.receiveMessage({ name: MESSAGES.CONFIRM_SAFETY_CHOICE, data: { checked: true } })).ok, true);
    const [[name, args, during]] = calls;
    assert.equal(name, "confirmSafetyChoice");
    assert.deepEqual(Object.keys(args).sort(), ["checked", "current", "window"]);
    assert.deepEqual([args.window === window, args.checked, during, args.current()], [true, true, true, false]);
    for (const data of [{ checked: "true" }, { checked: true, userConfirmed: true }, { checked: true, now: 1 }, {}]) {
      assert.equal((await actor.receiveMessage({ name: MESSAGES.CONFIRM_SAFETY_CHOICE, data })).error.code, "INVALID_PARAMS", JSON.stringify(data));
    }
    for (const data of [{ sequence: 0, outcome: "RESTORED" }, { sequence: 1.5, outcome: "RESTORED" }, { sequence: 2, outcome: "RESET" },
      { sequence: 2, outcome: "ACCEPTED", userConfirmed: true }]) {
      assert.equal((await actor.receiveMessage({ name: MESSAGES.RESOLVE_SAFETY_RECOVERY, data })).error.code, "INVALID_PARAMS", JSON.stringify(data));
    }
    assert.equal((await actor.receiveMessage({ name: MESSAGES.RESOLVE_SAFETY_RECOVERY, data: { sequence: 2, outcome: "EXTERNAL_CHANGED" } })).ok, true);
    assert.deepEqual([calls.at(-1)[1].sequence, calls.at(-1)[1].outcome, Object.keys(calls.at(-1)[1]).sort()],
      [2, "EXTERNAL_CHANGED", ["current", "outcome", "sequence", "window"]]);
    assert.equal(calls.length, 2);
  } finally { restore(); }
});

test("parent: a route change while the owner works, also back to the same text, ends the receipt; the outcome is not handed on", async () => {
  const hold = deferred();
  const { services, calls } = actorServices({ hold });
  const restore = setProvidersForTesting({ services: () => services });
  try {
    const f = fakeActor();
    const pending = f.actor.receiveMessage({ name: MESSAGES.CONFIRM_SAFETY_CHOICE, data: { checked: true } });
    await settle();
    const [[, args]] = calls;
    assert.equal(args.current(), true);
    f.navigate("about:axiosozo#ai");
    f.navigate("about:axiosozo#projects");
    assert.equal(args.current(), false, "leave-and-return ends it for good");
    hold.resolve();
    assert.equal((await pending).error.code, "DOCUMENT_GONE");
  } finally { restore(); }
});

// ---------------------------------------------------------------- the services composition

let profiles = 0;
const missing = () => Object.assign(new Error("SYNTHETIC_MISSING"), { result: "synthetic-missing" });
/** Invented profile files for the reviewed native registry (no real path). */
function nativeFiles() {
  const profile = `/synthetic-safety-ui-${process.pid}-${++profiles}/profile`;
  const f = { profile, entries: new Map([[profile, { type: "directory", permissions: 0o700 }]]), bytes: null, writes: 0, failWrite: null, writeGate: null,
    parent: true, shutdown: false };
  const files = path => {
    const entry = () => { const value = f.entries.get(path); if (!value) throw missing(); return value; };
    return { path, isSymlink: () => entry().symlink === true, isDirectory: () => entry().type === "directory", isFile: () => entry().type === "regular",
      get permissions() { return entry().permissions; }, clone: () => ({ path, normalize() {} }) };
  };
  const io = {
    async makeDirectory(path) { if (!f.entries.has(path)) f.entries.set(path, { type: "directory", permissions: 0o700 }); },
    async stat(path) { const value = f.entries.get(path); if (!value) throw Object.assign(missing(), { name: "NotFoundError" }); return { ...value, size: f.bytes?.length ?? 0 }; },
    async read() { return f.bytes; },
    async writeUTF8(path, text) {
      f.writes++;
      if (f.writeGate) await f.writeGate.promise;
      if (f.failWrite?.(f.writes)) throw new Error("synthetic write failure");
      f.bytes = new TextEncoder().encode(text); f.entries.set(path, { type: "regular", permissions: 0o600 });
      return f.bytes.length;
    },
  };
  f.deps = { gate: { parent: () => f.parent, profileDir: () => f.profile, lockTime: () => 0, shuttingDown: () => f.shutdown, attemptingQuit: () => false },
    files, isMissing: error => error?.result === "synthetic-missing", io, paths: { join: (a, b) => `${a}/${b}` }, createStorage: createSafetyAtomicStorage };
  return f;
}

/**
 * An in-memory observer service shaped like Services.obs (addObserver,
 * removeObserver, which throws for an unregistered pair as nsObserverService
 * does). fail.add / fail.remove: (topic) => true makes that call throw.
 */
function fakeObserverService() {
  const live = new Map(); // observer → Set of topics
  const fail = { add: null, remove: null };
  const calls = { add: [], remove: [] };
  return {
    fail, calls,
    addObserver(observer, topic) {
      calls.add.push(topic);
      if (fail.add?.(topic)) throw new Error("synthetic NS_ERROR_FAILURE (add)");
      if (!live.has(observer)) live.set(observer, new Set());
      live.get(observer).add(topic);
    },
    removeObserver(observer, topic) {
      calls.remove.push(topic);
      if (fail.remove?.(topic)) throw new Error("synthetic NS_ERROR_FAILURE (remove)");
      if (!live.get(observer)?.delete(topic)) throw new Error("synthetic NS_ERROR_FAILURE (not registered)");
    },
    /** Every topic still registered, across observers. */
    topics: () => [...live.values()].flatMap(set => [...set]),
    /** Observers that were registered and now have no topic left. */
    cleared: () => [...live.values()].filter(set => set.size === 0).length,
    notify(topic) { for (const [observer, set] of [...live]) if (set.has(topic)) observer.observe(null, topic, null); },
  };
}

function safetyHarness({ files = nativeFiles(), prefs = prefFixture(), shutdownOwner = "registered", acquireGate = null, obs = fakeObserverService() } = {}) {
  const shutdown = [];
  // removed: registrations whose every topic was actually removed; revoke(): a lifecycle topic fires.
  const native = { created: 0, acquired: 0, observed: [], registry: null, obs,
    get removed() { return obs.cleared(); }, revoke: () => obs.notify("profile-before-change") };
  // The process shutdown owner: registered, absent, or refusing the safety blocker.
  const onShutdown = shutdownOwner === "missing" ? undefined : (fn, label) => {
    if (shutdownOwner === "throws" && label === "AxioSozo: close safety owner") throw new Error("shutdown phase already passed");
    shutdown.push({ fn, label });
  };
  const make = () => new AxioSozoServices({ storageFor: () => ({ read: async () => null, write: async () => {} }), clock: () => Date.UTC(2026, 9, 3, 12),
    timers: { setTimeout: () => 0, clearTimeout: () => {} }, onShutdown,
    createSafetyNative: () => {
      native.created++;
      const registry = createSafetyNativeOwnerRegistry(files.deps);
      native.registry = registry;
      // acquireGate: the lease is acquired, then its hand-off waits (an acquisition in flight).
      return { registry: { acquire: async () => {
        native.acquired++;
        const lease = await registry.acquire();
        if (acquireGate) await acquireGate.promise;
        return lease;
      }, revoke: () => registry.revoke() },
        prefs: prefs.prefs, dns: { clearCache: trr => prefs.cache.push(trr) },
        // The actual chrome observer helper over the in-memory service (nativeSafety passes Services.obs).
        observe(topics, revoke) { native.observed.push(...topics); return observeSafetyLifecycle(obs, topics, revoke); } };
    } });
  const services = make();
  const zen = fakeZenWindow({ spaces: [{ uuid: "11111111-1111-4111-8111-111111111111", name: "Home", containerTabId: 0 }] });
  services.registerWindow(zen.window, new ZenWorkspaceAdapter(zen.window));
  const events = [];
  services.on("safety", () => events.push("safety"));
  return { services, files, prefs, native, shutdown, zen, events, authority: { window: zen.window, current: () => true },
    close: () => Promise.all(shutdown.filter(entry => entry.label === "AxioSozo: close safety owner").map(entry => entry.fn())) };
}
const prefWrites = h => h.prefs.writes().length;

test("services: nothing safety-related is created on import, construction, window registration or other services", { skip }, async () => {
  const h = safetyHarness();
  h.services.getDecisionRuntime();
  await h.services.listWatches();
  await h.services.listRules();
  assert.deepEqual([h.native.created, h.native.acquired, h.files.writes, prefWrites(h), h.prefs.log.length], [0, 0, 0, 0, 0]);
  assert.ok(!h.shutdown.some(entry => entry.label === "AxioSozo: close safety owner"), "no blocker before the first offer read");
});

test("services: the first offer read acquires once (two windows share it), registers lifecycle revocation and shows the checked offer", { skip }, async () => {
  const h = safetyHarness();
  const other = fakeZenWindow({ spaces: [{ uuid: "11111111-1111-4111-8111-111111111111", name: "Home", containerTabId: 0 }] });
  h.services.registerWindow(other.window, new ZenWorkspaceAdapter(other.window));
  const [one, two] = await Promise.all([h.services.getSafetyStatus({ window: h.zen.window }), h.services.getSafetyStatus({ window: other.window })]);
  assert.deepEqual([h.native.created, h.native.acquired], [1, 1], "one native owner, one shared acquisition");
  assert.deepEqual(h.native.observed, [...SAFETY_REVOKE_TOPICS]);
  assert.deepEqual(SAFETY_REVOKE_TOPICS, ["quit-application", "profile-change-net-teardown", "profile-before-change", "xpcom-will-shutdown"]);
  for (const reply of [one, two]) {
    assert.deepEqual(Object.keys(reply).sort(), ["blocked", "changed", "cleanup_blocked", "code", "offer", "reason", "sequence", "status"]);
    assert.deepEqual([reply.blocked, reply.offer, reply.status], [false, { offer: true, checked: true }, { offer: true, checked: true, active: false, owned: false }]);
  }
  assert.doesNotMatch(JSON.stringify(one), /network\.trr|cloudflare|https:|\/synthetic/u);
  assert.equal(prefWrites(h), 0, "reading writes nothing");
  await assert.rejects(h.services.getSafetyStatus({ window: { foreign: true } }), { code: "PRIVATE_WINDOW" });
});

test("services: an explicit decline completes the offer with zero preference writes or DNS clearing", { skip }, async () => {
  const h = safetyHarness();
  const reply = await h.services.confirmSafetyChoice({ ...h.authority, checked: false });
  assert.deepEqual([reply.offer, reply.blocked, prefWrites(h), h.prefs.cache.length], [{ offer: false, checked: false }, false, 0, 0]);
  assert.deepEqual(h.events, ["safety"]);
  const after = await h.services.getSafetyStatus({ window: h.zen.window });
  assert.deepEqual([after.offer, after.status.active], [{ offer: false, checked: false }, false]);
});

test("services: a checked choice is shown configured only after its acknowledged intent and terminal write", { skip }, async () => {
  const h = safetyHarness();
  const reply = await h.services.confirmSafetyChoice({ ...h.authority, checked: true });
  assert.deepEqual([reply.code, reply.blocked, reply.status], ["APPLIED", false, { offer: false, checked: true, active: true, owned: true }]);
  assert.equal(prefWrites(h), 2, "the two reviewed DoH preferences");
  assert.equal(h.prefs.cache.length, 1, "DNS cache cleared once");
  assert.ok(h.files.writes >= 2, "intent and terminal journal writes");
  const status = await h.services.getSafetyStatus({ window: h.zen.window });
  assert.deepEqual([status.code, status.status.active, status.status.owned], ["CURRENT", true, true]);
});

test("services: a failed intent write never touches a preference and stays blocked recovery, never success", { skip }, async () => {
  const files = nativeFiles();
  files.failWrite = count => count === 1;
  const h = safetyHarness({ files });
  const reply = await h.services.confirmSafetyChoice({ ...h.authority, checked: true });
  assert.deepEqual([reply.code, reply.reason, reply.blocked, prefWrites(h)], ["RECOVERY_REQUIRED", "STORE_WRITE_FAILED", true, 0]);
  assert.notEqual(reply.status?.active, true, "never shown as active");
});

test("services: locked or externally configured DNS refuses the change and the next status explains it", { skip }, async () => {
  const locked = safetyHarness();
  locked.prefs.lock("network.trr.mode");
  const reply = await locked.services.confirmSafetyChoice({ ...locked.authority, checked: true });
  assert.deepEqual([reply.reason, prefWrites(locked)], ["PREF_LOCKED", 0]);
  const status = await locked.services.getSafetyStatus({ window: locked.zen.window });
  assert.deepEqual([status.code, status.reason, status.offer.offer], ["CURRENT", "PREF_LOCKED", true], "the offer is not completed");
  const external = safetyHarness();
  external.prefs.external("network.trr.use_ohttp", true);
  const refused = await external.services.confirmSafetyChoice({ ...external.authority, checked: true });
  assert.deepEqual([refused.reason, prefWrites(external)], ["EXTERNAL_DOH_CONFIGURATION", 0]);
});

test("services: unreadable preferences give a null status, never a guessed one", { skip }, async () => {
  const h = safetyHarness();
  h.prefs.onRead = () => { throw new Error("synthetic read failure"); };
  const reply = await h.services.getSafetyStatus({ window: h.zen.window });
  assert.deepEqual([reply.status, reply.offer], [null, { offer: true, checked: true }]);
  const view = M.safetyView(reply);
  assert.equal(view.text, "The current DNS setting could not be read, so it is shown as unknown.");
});

test("services: an unresolved journal after restart replays nothing; a stale sequence refuses; the exact one resolves without writes", { skip }, async () => {
  const files = nativeFiles();
  const prefs = prefFixture();
  files.failWrite = count => count === 2; // the terminal write fails after the preferences changed
  const first = safetyHarness({ files, prefs });
  const blocked = await first.services.confirmSafetyChoice({ ...first.authority, checked: true });
  assert.deepEqual([blocked.code, blocked.blocked], ["RECOVERY_REQUIRED", true]);
  const writes = prefWrites(first);
  await first.close();
  files.failWrite = null;
  const second = safetyHarness({ files, prefs });
  const status = await second.services.getSafetyStatus({ window: second.zen.window });
  assert.deepEqual([status.code, status.reason, status.blocked], ["RECOVERY_REQUIRED", "STARTUP_UNCERTAIN", true]);
  assert.equal(prefWrites(second), writes, "nothing replayed, restored or adopted at startup");
  await assert.rejects(second.services.resolveSafetyRecovery({ ...second.authority, sequence: status.sequence + 5, outcome: "ACCEPTED" }),
    { code: "SAFETY_SEQUENCE_MISMATCH" });
  const resolved = await second.services.resolveSafetyRecovery({ ...second.authority, sequence: status.sequence, outcome: "ACCEPTED" });
  assert.deepEqual([resolved.code, resolved.blocked], ["RESOLVED", false]);
  assert.equal(prefWrites(second), writes, "acknowledging writes no preference");
  await second.close();
});

test("services: a stale action lifetime refuses before the owner runs; revocation during awaited work answers unavailable", { skip }, async () => {
  const h = safetyHarness();
  await assert.rejects(h.services.confirmSafetyChoice({ window: h.zen.window, current: () => false, checked: true }), { code: "DOCUMENT_GONE" });
  assert.equal(prefWrites(h), 0);
  await h.services.getSafetyStatus({ window: h.zen.window });
  h.files.writeGate = deferred();
  const pending = h.services.confirmSafetyChoice({ ...h.authority, checked: true });
  await settle();
  h.native.revoke(); // quit-application / profile teardown, synchronously
  h.files.writeGate.resolve();
  const outcome = await pending.then(reply => reply, error => error);
  assert.ok(outcome.code === "SAFETY_UNAVAILABLE" || outcome.blocked === true, "uncertain, never success");
  assert.equal(prefWrites(h), 0, "no preference change after the lease was revoked");
  await assert.rejects(h.services.getSafetyStatus({ window: h.zen.window }), { code: "SAFETY_UNAVAILABLE" }, "retired for this process");
});

test("services: failed observer cleanup keeps the writer reserved until an explicit retry succeeds", { skip }, async () => {
  const h = safetyHarness();
  await h.services.getSafetyStatus({ window: h.zen.window });
  const remove = h.prefs.prefs.removeObserver;
  h.prefs.prefs.removeObserver = () => { throw new Error("synthetic removal failure"); };
  const reply = await h.services.confirmSafetyChoice({ ...h.authority, checked: true });
  assert.equal(reply.cleanup_blocked, true, "said so, never hidden");
  assert.equal(M.safetyView(reply).state, "cleanup");
  const blocker = h.shutdown.find(entry => entry.label === "AxioSozo: close safety owner");
  const quiet = console.error; console.error = () => {};
  try { await blocker.fn(); } finally { console.error = quiet; }
  await assert.rejects(createSafetyNativeOwnerRegistry(h.files.deps).acquire(), { code: "SAFETY_WRITER_BUSY" }, "the writer stays reserved");
  assert.equal(h.native.removed, 0, "the lifecycle observers stay too");
  h.prefs.prefs.removeObserver = remove;
  await blocker.fn();
  assert.equal(h.native.removed, 1);
  const lease = await createSafetyNativeOwnerRegistry(h.files.deps).acquire();
  assert.equal(typeof lease.close, "function", "released after the retry succeeded");
  await lease.close(() => true);
});

test("services: without its shutdown blocker nothing is published or acquired; the observers are removed again, or stay owned and deny admission", { skip }, async () => {
  for (const shutdownOwner of ["throws", "missing"]) {
    const h = safetyHarness({ shutdownOwner });
    const quiet = console.error; console.error = () => {};
    try {
      await assert.rejects(h.services.getSafetyStatus({ window: h.zen.window }), { code: "SAFETY_UNAVAILABLE" });
      await assert.rejects(h.services.confirmSafetyChoice({ ...h.authority, checked: true }), { code: "SAFETY_UNAVAILABLE" });
    } finally { console.error = quiet; }
    assert.deepEqual([h.native.acquired, h.native.removed, prefWrites(h), h.files.writes], [0, h.native.created, 0, 0],
      `${shutdownOwner}: no lease, every observer removed again, nothing written`);
    assert.ok(!h.shutdown.some(entry => entry.label === "AxioSozo: close safety owner"));
    assert.deepEqual({ ...h.services.getSafetyDiagnostics() }.held, false);
    const lease = await createSafetyNativeOwnerRegistry(h.files.deps).acquire();
    await lease.close(() => true);
  }
  // The observers cannot all be removed either: exactly those stay owned, and
  // nothing new is constructed or acquired while any of them remains.
  const stuck = safetyHarness({ shutdownOwner: "throws" });
  stuck.native.obs.fail.remove = topic => topic === "profile-before-change";
  const quiet = console.error; console.error = () => {};
  try {
    await assert.rejects(stuck.services.getSafetyStatus({ window: stuck.zen.window }), { code: "SAFETY_UNAVAILABLE" });
    await assert.rejects(stuck.services.getSafetyStatus({ window: stuck.zen.window }), { code: "SAFETY_UNAVAILABLE" });
  } finally { console.error = quiet; }
  assert.deepEqual([stuck.native.created, stuck.native.acquired], [1, 0], "no replacement owner while one is unresolved");
  assert.deepEqual(stuck.native.obs.topics(), ["profile-before-change"], "exactly the failed topic is still registered, and still owned");
  assert.equal(stuck.services.getSafetyDiagnostics().observers_retained, true);
});

// ---- The actual lifecycle observer helper (nativeSafety passes Services.obs), over an in-memory service.

test("observer seam: unobserve forgets a topic only after its own removal returned; the failed one stays for the retry, removed ones are never tried again", { skip }, () => {
  const obs = fakeObserverService();
  let revoked = 0;
  const unobserve = observeSafetyLifecycle(obs, SAFETY_REVOKE_TOPICS, () => { revoked++; });
  assert.deepEqual(obs.topics(), [...SAFETY_REVOKE_TOPICS]);
  obs.notify("quit-application");
  assert.equal(revoked, 1, "a lifecycle topic revokes synchronously");
  obs.fail.remove = topic => topic === "profile-change-net-teardown";
  assert.equal(unobserve(), false, "never true while one remains");
  assert.deepEqual(obs.topics(), ["profile-change-net-teardown"]);
  obs.calls.remove.length = 0;
  assert.equal(unobserve(), false);
  assert.deepEqual(obs.calls.remove, ["profile-change-net-teardown"], "only the failed topic is tried again");
  obs.fail.remove = null;
  assert.equal(unobserve(), true);
  assert.deepEqual(obs.topics(), []);
  obs.calls.remove.length = 0;
  assert.equal(unobserve(), true);
  assert.deepEqual(obs.calls.remove, [], "nothing left to remove");
});

test("observer seam: a part-way registration rolls back; a rollback that cannot remove everything hands back that exact cleanup", { skip }, () => {
  const clean = fakeObserverService();
  clean.fail.add = topic => topic === SAFETY_REVOKE_TOPICS[2];
  assert.throws(() => observeSafetyLifecycle(clean, SAFETY_REVOKE_TOPICS, () => {}),
    error => /\(add\)/u.test(error.message) && error.cleanup === undefined, "fully rolled back: the registration's own error");
  assert.deepEqual(clean.topics(), []);
  const obs = fakeObserverService();
  obs.fail.add = topic => topic === SAFETY_REVOKE_TOPICS[2];
  obs.fail.remove = topic => topic === SAFETY_REVOKE_TOPICS[0];
  let thrown = null;
  try { observeSafetyLifecycle(obs, SAFETY_REVOKE_TOPICS, () => {}); } catch (error) { thrown = error; }
  assert.equal(thrown?.code, "SAFETY_OBSERVER_CLEANUP_REQUIRED");
  assert.match(thrown.cause.message, /\(add\)/u, "the registration failure is kept as the cause");
  assert.equal(typeof thrown.cleanup, "function");
  assert.deepEqual(obs.topics(), [SAFETY_REVOKE_TOPICS[0]], "exactly the topic whose rollback failed");
  assert.equal(thrown.cleanup(), false);
  obs.fail.remove = null;
  assert.equal(thrown.cleanup(), true);
  assert.deepEqual(obs.topics(), []);
});

test("services: a part-way registration whose rollback fails keeps its exact cleanup: no acquire and no replacement owner until that topic is actually removed", { skip }, async () => {
  const obs = fakeObserverService();
  obs.fail.add = topic => topic === "profile-before-change";
  obs.fail.remove = topic => topic === "quit-application";
  const h = safetyHarness({ obs });
  await assert.rejects(h.services.getSafetyStatus({ window: h.zen.window }), { code: "SAFETY_UNAVAILABLE" });
  assert.deepEqual([h.native.created, h.native.acquired], [1, 0]);
  assert.deepEqual(obs.topics(), ["quit-application"]);
  assert.deepEqual([h.services.getSafetyDiagnostics().native, h.services.getSafetyDiagnostics().observers_retained], [false, true]);
  assert.ok(!h.shutdown.some(entry => entry.label === "AxioSozo: close safety owner"), "no blocker for an owner never published");
  // Registration would work now, but the earlier observer is still there: nothing new.
  obs.fail.add = null;
  await assert.rejects(h.services.getSafetyStatus({ window: h.zen.window }), { code: "SAFETY_UNAVAILABLE" });
  await assert.rejects(h.services.confirmSafetyChoice({ ...h.authority, checked: true }), { code: "SAFETY_UNAVAILABLE" });
  assert.deepEqual([h.native.created, h.native.acquired, prefWrites(h)], [1, 0, 0], "no replacement owner, no lease, no write");
  assert.deepEqual(obs.topics(), ["quit-application"], "the handle was never dropped");
  // Its removal succeeds: only then a new owner registers, publishes and acquires.
  obs.fail.remove = null;
  const reply = await h.services.getSafetyStatus({ window: h.zen.window });
  assert.deepEqual(reply.offer, { offer: true, checked: true });
  assert.deepEqual([h.native.created, h.native.acquired], [2, 1]);
  assert.deepEqual(obs.topics(), [...SAFETY_REVOKE_TOPICS], "the new owner's own registration only");
  assert.equal(h.services.getSafetyDiagnostics().observers_retained, false);
  await h.close();
  assert.deepEqual(obs.topics(), []);
});

test("services: a refused blocker followed by a failed removal keeps that exact topic; once removed, a later admission starts clean", { skip }, async () => {
  const h = safetyHarness({ shutdownOwner: "throws" });
  h.native.obs.fail.remove = topic => topic === "xpcom-will-shutdown";
  const quiet = console.error; console.error = () => {};
  try {
    await assert.rejects(h.services.getSafetyStatus({ window: h.zen.window }), { code: "SAFETY_UNAVAILABLE" });
    assert.deepEqual([h.native.created, h.native.acquired, h.native.obs.topics()], [1, 0, ["xpcom-will-shutdown"]]);
    h.native.obs.calls.remove.length = 0;
    await assert.rejects(h.services.getSafetyStatus({ window: h.zen.window }), { code: "SAFETY_UNAVAILABLE" });
    assert.deepEqual([h.native.created, h.native.obs.calls.remove], [1, ["xpcom-will-shutdown"]], "only its retry; nothing constructed");
    h.native.obs.fail.remove = null;
    await assert.rejects(h.services.getSafetyStatus({ window: h.zen.window }), { code: "SAFETY_UNAVAILABLE" }, "the blocker is still refused");
  } finally { console.error = quiet; }
  assert.deepEqual([h.native.created, h.native.acquired, h.native.obs.topics()], [2, 0, []], "removed first, then one clean attempt, removed again");
  assert.equal(h.services.getSafetyDiagnostics().observers_retained, false);
});

test("services: at shutdown an observer whose removal fails stays with the owner; the next blocker run retries only that topic", { skip }, async () => {
  const h = safetyHarness();
  await h.services.getSafetyStatus({ window: h.zen.window });
  h.native.obs.fail.remove = topic => topic === "quit-application";
  const quiet = console.error; console.error = () => {};
  try { await h.close(); } finally { console.error = quiet; }
  assert.deepEqual(h.native.obs.topics(), ["quit-application"]);
  const lease = await createSafetyNativeOwnerRegistry(h.files.deps).acquire();
  await lease.close(() => true);
  h.native.obs.fail.remove = null;
  h.native.obs.calls.remove.length = 0;
  await h.close();
  assert.deepEqual([h.native.obs.topics(), h.native.obs.calls.remove], [[], ["quit-application"]]);
});

test("services: shutdown during an acquisition in flight retires first, joins it and closes its lease before it resolves", { skip }, async () => {
  const acquireGate = deferred();
  const h = safetyHarness({ acquireGate });
  const read = h.services.getSafetyStatus({ window: h.zen.window }).then(() => "answered", error => error.code);
  await flush();
  assert.equal(h.native.acquired, 1, "the writer lease is taken; its hand-off is still pending");
  await assert.rejects(createSafetyNativeOwnerRegistry(h.files.deps).acquire(), { code: "SAFETY_WRITER_BUSY" }, "reserved meanwhile");
  let closed = false;
  const close = h.close().then(() => { closed = true; });
  await flush();
  assert.equal(closed, false, "shutdown waits for the acquisition");
  await assert.rejects(h.services.getSafetyStatus({ window: h.zen.window }), { code: "SAFETY_UNAVAILABLE" }, "retired at once: no new work");
  acquireGate.resolve();
  await close;
  assert.equal(await read, "SAFETY_UNAVAILABLE", "the in-flight read never answers from a retired owner");
  const diagnostics = h.services.getSafetyDiagnostics();
  assert.deepEqual([diagnostics.held, diagnostics.retained, diagnostics.acquiring, diagnostics.retired], [false, false, false, true]);
  assert.equal(h.native.removed, 1, "the lifecycle observers are removed after the close");
  const lease = await createSafetyNativeOwnerRegistry(h.files.deps).acquire();
  assert.equal(typeof lease.close, "function", "the writer was released, not left reserved");
  await lease.close(() => true);
  assert.equal(prefWrites(h), 0);
});

test("services: shutdown with a held owner closes it, then removes the observers and releases the writer", { skip }, async () => {
  const h = safetyHarness();
  await h.services.getSafetyStatus({ window: h.zen.window });
  assert.equal(h.services.getSafetyDiagnostics().held, true);
  await h.close();
  assert.deepEqual([h.services.getSafetyDiagnostics().held, h.native.removed], [false, 1]);
  const lease = await createSafetyNativeOwnerRegistry(h.files.deps).acquire();
  await lease.close(() => true);
});

// ---------------------------------------------------------------- the page

let serialPage = 0;
const reply = (patch = {}) => ({ code: "CURRENT", reason: "CURRENT", blocked: false, cleanup_blocked: false, sequence: 0, changed: false,
  status: { offer: true, checked: true, active: false, owned: false }, offer: { offer: true, checked: true }, ...patch });

// ---- Native activation order (Gecko EventDispatcher::HandleEventTargetChain)

/** Keeps each listener's phase and group as Gecko does (the mini-dom keeps only
 * the function, and still gets it for its own simple dispatches). */
function trackListeners(target) {
  const entries = [];
  const add = target.addEventListener?.bind(target), remove = target.removeEventListener?.bind(target);
  const kind = options => ({ capture: options === true || options?.capture === true, system: options?.mozSystemGroup === true });
  const same = (entry, type, fn, { capture, system }) => entry.type === type && entry.fn === fn && entry.capture === capture && entry.system === system;
  target.addEventListener = (type, fn, options) => {
    if (!entries.some(entry => same(entry, type, fn, kind(options)))) entries.push({ type, fn, ...kind(options) });
    add?.(type, fn, options);
  };
  target.removeEventListener = (type, fn, options) => {
    const index = entries.findIndex(entry => same(entry, type, fn, kind(options)));
    if (index >= 0) entries.splice(index, 1);
    remove?.(type, fn, options);
  };
  target.trackedListeners = entries;
  return target;
}

/**
 * A trusted click as Gecko dispatches it: the whole default group first
 * (capture from the window down to the target's parent, at the target its
 * capture then its other listeners, then bubbling back up to the window), and
 * only then the system group in the same order, with propagation reset between
 * the two (EventDispatcher.cpp lines 587-692). Element listeners the mini-dom
 * keeps without options (the page's own onclick handlers) are default-group
 * bubble listeners. A disabled button receives no click.
 */
function geckoClick(target, win, init = {}) {
  if (target.disabled === true) return null;
  const event = { ...makeEvent("click", init), target };
  const path = [];
  for (let node = target; node; node = node.parentNode) path.push(node);
  path.push(win);
  const listeners = (node, system, capture) => (node.trackedListeners
    ? node.trackedListeners.filter(entry => entry.type === "click" && entry.system === system && entry.capture === capture).map(entry => entry.fn)
    : !system && !capture ? [...(node.listeners?.get("click") ?? [])] : []);
  const run = (node, system, capture) => {
    for (const fn of listeners(node, system, capture)) { event.currentTarget = node; fn.call(node, event); }
  };
  for (const system of [false, true]) {
    event.cancelBubble = false;
    for (let i = path.length - 1; i > 0 && !event.cancelBubble; i--) run(path[i], system, true);
    if (!event.cancelBubble) run(path[0], system, true);
    if (!event.cancelBubble) run(path[0], system, false);
    for (let i = 1; i < path.length && !event.cancelBubble; i++) run(path[i], system, false);
  }
  return event;
}

/**
 * The real actor child on the page's document, installed as Gecko does at
 * DOMDocElementInserted, before the page script runs: it exposes
 * window.AxioSozoOverview and adds its click listener. `answer(name, params)`
 * answers its page requests; its private action messages are recorded and,
 * unless `actionReply` says otherwise, stay unanswered (the tests deliver the
 * browser's events themselves).
 */
function installActor({ document, answer, actionReply = () => new Promise(() => {}) }) {
  trackListeners(document);
  const listeners = new Map();
  const win = trackListeners({ Promise, JSON, TypeError, addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener() {} });
  const calls = [], actions = [], async = [];
  const child = new AboutAxioSozoChild();
  Object.assign(child, { contentWindow: win, document, sendAsyncMessage: (name, data) => async.push([name, data]),
    sendQuery: async (name, data) => {
      if (name !== MESSAGES.REQUEST) { actions.push({ name, data }); return actionReply(name, data); }
      calls.push([data.name, data.params]);
      try { return { ok: true, value: await answer(data.name, data.params) }; }
      catch (error) { return { ok: false, error: { code: error?.code ?? "SERVICE_ERROR", message: String(error?.message ?? error) } }; }
    } });
  const previous = globalThis.Cu;
  globalThis.Cu = { cloneInto: (value, _target, options) => (options?.cloneFunctions ? { ...value } : structuredClone(value)),
    waiveXrays: value => value, exportFunction: fn => fn };
  try { child.handleEvent({ type: "DOMDocElementInserted" }); } finally { if (previous === undefined) delete globalThis.Cu; else globalThis.Cu = previous; }
  return { win, child, listeners, calls, actions, async,
    emit: name => child.receiveMessage({ name: MESSAGES.EVENT, data: { name } }),
    /** A trusted activation, in native order; the private message it sent, if any. */
    activate(node, init = {}) {
      const before = actions.length;
      geckoClick(node, win, init);
      const sent = actions.slice(before);
      assert.ok(sent.length <= 1, "at most one private message per activation");
      return sent[0] ? { name: sent[0].name, data: sent[0].data, event: USER_ACTIONS[sent[0].name].event } : null;
    } };
}

async function loadPage({ hash = "#projects", safety = reply(), handlers = {}, actionReply } = {}) {
  const document = parseHtml(HTML);
  document.documentURI = `about:axiosozo${hash}`;
  // backend.safety: the answer, { throws: code } for a failed read, or "hang" for one that never answers.
  const backend = { safety: structuredClone(safety) };
  const defaults = {
    getOverviewFlags: () => ({ contexts: true, enginePreferences: false, jevKeyEntry: true }),
    activeContext: () => ({ uuid: null }), listContexts: () => [], listProjects: () => [], listProjectContainers: () => [],
    listRules: () => [], usageSummary: () => [], listOrphans: () => [], needsAttention: () => [],
    getJevSettings: () => ({ consent: false, interval_minutes: 5, hourly_budget: 30 }),
    listWatches: () => [], getWatchStatus: () => null,
    getSafetyStatus: () => {
      if (backend.safety === "hang") return new Promise(() => {});
      if (backend.safety instanceof Error) throw backend.safety;
      if (backend.safety?.throws) throw { code: backend.safety.throws };
      return structuredClone(backend.safety);
    },
  };
  const actor = installActor({ document, actionReply, answer: (name, params) => {
    const handler = handlers[name] ?? defaults[name];
    if (!handler) throw { code: "UNKNOWN_METHOD", message: name };
    return handler(params ?? {});
  } });
  const location = { hash };
  Object.assign(globalThis, {
    document, Node, location, window: actor.win,
    history: { replaceState: (_s, _t, url) => { location.hash = url; } },
    CSS: { escape: value => String(value).replace(/["\\]/g, "\\$&") },
  });
  await import(`../chrome/overview/about-axiosozo.mjs?safety=${++serialPage}`);
  await flush();
  const $ = id => document.getElementById(id);
  const emit = async name => { actor.emit(name); await new Promise(resolve => setTimeout(resolve, 130)); await flush(); };
  const navigate = async next => { location.hash = next; actor.listeners.get("hashchange")?.(); await flush(); };
  return { document, calls: actor.calls, backend, $, emit, activate: actor.activate, actor, navigate, names: () => actor.calls.map(([name]) => name) };
}

test("page: the first-run offer is checked; Not now grants and completes nothing and sends nothing", { skip }, async () => {
  const page = await loadPage();
  const card = page.$("safety-offer");
  assert.equal(card.hidden, false);
  assert.equal(card.querySelector("h3").textContent, "Before you start");
  const box = page.$("axiosozo-safety-offer-checked");
  assert.deepEqual([box.checked, box.type, page.document.querySelector('label[for="axiosozo-safety-offer-checked"]').textContent],
    [true, "checkbox", M.SAFETY_TITLE], "checked by default, with its own label");
  assert.match(card.textContent, /family\.cloudflare-dns\.com/u);
  const before = page.calls.length;
  const later = [...card.querySelectorAll("button")].find(button => button.textContent === "Not now");
  assert.equal(page.activate(later), null, "Not now is no action");
  await flush();
  assert.equal(card.hidden, true);
  assert.deepEqual(page.calls.slice(before), [], "nothing was asked or sent");
  const again = await loadPage();
  assert.equal(again.$("safety-offer").hidden, false, "the offer is back on the next visit: nothing was completed");
  assert.ok(!page.names().some(name => /confirm|resolve|choose/iu.test(name)));
});

test("page: confirming is the actor's trusted click; the outcome shown is the browser's next answer", { skip }, async () => {
  const page = await loadPage();
  const confirm = page.$("axiosozo-safety-offer-confirm");
  assert.deepEqual(page.activate(confirm), { name: MESSAGES.CONFIRM_SAFETY_CHOICE, data: { checked: true }, event: "safety" });
  await flush();
  assert.deepEqual([page.$("axiosozo-safety-offer-confirm").textContent, page.$("axiosozo-safety-offer-confirm").getAttribute("aria-disabled")], ["Saving…", "true"]);
  assert.equal(page.activate(page.$("axiosozo-safety-offer-confirm")), null, "no second confirmation while waiting");
  page.backend.safety = reply({ code: "CURRENT", reason: "APPLIED", status: { offer: false, checked: true, active: true, owned: true }, offer: { offer: false, checked: true } });
  await page.emit("safety");
  assert.equal(page.$("status").textContent, "Saved. The family filter is on.");
  assert.match(page.$("safety-offer").textContent, /On: AxioSozo set Cloudflare's family filter\./u);
  // Unchecking first sends false.
  const off = await loadPage();
  off.$("axiosozo-safety-offer-checked").click();
  assert.deepEqual(off.activate(off.$("axiosozo-safety-offer-confirm")).data, { checked: false });
});

test("page: a refused choice is explained; an unfinished change asks what the user sees, with the exact sequence and no preference wording", { skip }, async () => {
  const page = await loadPage();
  page.activate(page.$("axiosozo-safety-offer-confirm"));
  page.backend.safety = reply({ reason: "PREF_LOCKED" });
  await page.emit("safety");
  assert.equal(page.$("status").textContent, "DNS over HTTPS is locked by a policy on this Mac, so AxioSozo changed nothing.");
  const recovery = await loadPage({ safety: reply({ code: "RECOVERY_REQUIRED", reason: "STARTUP_UNCERTAIN", blocked: true, sequence: 4, status: null }) });
  const card = recovery.$("safety-offer");
  assert.equal(card.hidden, false);
  assert.match(card.textContent, /Your answer is only recorded; it changes no setting\./u);
  const buttons = card.querySelectorAll("button[data-safety-outcome]");
  assert.deepEqual(buttons.map(button => [button.textContent, button.getAttribute("data-safety-outcome"), button.parentNode.getAttribute("data-safety-sequence")]), [
    ["My earlier settings are back", "RESTORED", "4"], ["I changed them myself", "EXTERNAL_CHANGED", "4"], ["Keep them as they are now", "ACCEPTED", "4"]]);
  assert.equal(buttons[0].parentNode.id, "axiosozo-safety-offer-recovery", "the authored group the browser reads");
  assert.doesNotMatch(card.textContent, /Restore|Undo|Reset/u, "RESTORED acknowledges; it is not a restore button");
  assert.equal(recovery.$("axiosozo-safety-offer-confirm"), null, "no new choice while blocked");
  assert.deepEqual(recovery.activate(buttons[2]).data, { sequence: 4, outcome: "ACCEPTED" });
  const cleanup = await loadPage({ safety: reply({ code: "NATIVE_CLEANUP_REQUIRED", blocked: true, cleanup_blocked: true, status: null }) });
  assert.match(cleanup.$("safety-offer").textContent, /Restart AxioSozo before choosing again\./u);
  const unreadable = await loadPage({ safety: reply({ code: "STORE_UNAVAILABLE", blocked: true, cleanup_blocked: false, status: null, offer: null, sequence: null }) });
  assert.equal(unreadable.$("safety-offer").hidden, true, "no offer from an unreadable record");
  await unreadable.navigate("#ai");
  assert.match(unreadable.$("safety-settings-body").textContent, /could not read its record of this choice/u);
});

test("page: Settings keeps the later choice under AI & keys, with the same controls and honest states", { skip }, async () => {
  const page = await loadPage({ hash: "#ai", safety: reply({ status: { offer: false, checked: false, active: false, owned: false }, offer: { offer: false, checked: false } }) });
  const body = page.$("safety-settings-body");
  assert.equal(page.$("safety-heading").textContent, "Other settings: safe browsing");
  const box = page.$("axiosozo-safety-settings-checked");
  assert.equal(box.checked, false, "the saved choice");
  assert.match(body.textContent, /Off: DNS over HTTPS does not use the family filter\./u);
  box.click();
  assert.deepEqual(page.activate(page.$("axiosozo-safety-settings-confirm")).data, { checked: true });
  const refused = await loadPage({ hash: "#ai", handlers: { getSafetyStatus: () => { throw { code: "SAFETY_WRITER_BUSY" }; } } });
  assert.equal(refused.$("safety-settings-body").textContent, "Another AxioSozo window is using the safety setting. Try again in a moment.");
  assert.equal(refused.$("axiosozo-safety-settings-confirm"), null);
  assert.doesNotMatch(page.document.body.textContent, /\bnull\b|\bundefined\b/u);
});

test("page: the safety status is read only after admission, on the list or in Settings, never on a project home", { skip }, async () => {
  const home = await loadPage({ hash: "#project=p_harbor1", handlers: { listProjects: () => [] } });
  assert.ok(!home.names().includes("getSafetyStatus"));
  const list = await loadPage();
  assert.equal(list.names().indexOf("getSafetyStatus") > list.names().indexOf("getOverviewFlags"), true);
});

test("model: recovery only on the owner's own RECOVERY_REQUIRED; an unreadable record with a sequence stays unavailable; configured only from a settled answer", () => {
  const recovery = M.safetyView(reply({ code: "RECOVERY_REQUIRED", reason: "STARTUP_UNCERTAIN", blocked: true, sequence: 4, status: null }));
  assert.deepEqual([recovery.state, recovery.recovery.sequence], ["recovery", 4]);
  for (const patch of [{ code: "STORE_UNAVAILABLE", blocked: true, cleanup_blocked: false, sequence: 6, status: null },
    { code: "STORE_UNAVAILABLE", blocked: true, cleanup_blocked: false, sequence: 0 }, { code: "SAFETY_UNAVAILABLE", blocked: true, sequence: 3 },
    { code: "CURRENT", blocked: true, sequence: 9 }]) {
    const view = M.safetyView(reply(patch));
    assert.deepEqual([view.state, view.recovery, view.form], ["unavailable", null, false], JSON.stringify(patch));
  }
  assert.equal(M.safetyView(reply({ code: "RECOVERY_REQUIRED", blocked: true, cleanup_blocked: true, sequence: 4 })).state, "cleanup", "a blocked cleanup comes first");
  // A choice's own answer code is not a settled status: never shown as configured from it.
  const unsettled = M.safetyView(reply({ code: "APPLIED", status: { offer: false, checked: true, active: true, owned: true }, offer: { offer: false, checked: true } }));
  assert.deepEqual([unsettled.state, unsettled.form], ["unavailable", false]);
  const settled = M.safetyView(reply({ code: "CURRENT", status: { offer: false, checked: true, active: true, owned: true }, offer: { offer: false, checked: true } }));
  assert.deepEqual([settled.state, settled.tone, settled.text], ["chosen", "ok", "On: AxioSozo set Cloudflare's family filter."]);
  // A failed read wins over any older answer.
  const failed = M.safetyView(reply({ status: { offer: false, checked: true, active: true, owned: true }, offer: { offer: false, checked: true } }), { error: "ACTOR_ERROR" });
  assert.deepEqual([failed.state, failed.form, failed.text], ["unavailable", false, "The safety setting cannot be read right now."]);
});

test("model: the actor's projection of an unreadable record (cleanup fact unknown, so cleanup_blocked: true) reads as unreadable, never as a failed DNS cleanup", () => {
  const cleanupText = /could not be cleaned up/u;
  for (const raw of [{ code: "STORE_UNAVAILABLE", status: null, changed: null, sequence: null },
    { code: "STORE_UNAVAILABLE", sequence: 6, blocked: true }, { code: "x-raw message" }, {}]) {
    const projected = safetyReply(raw);
    assert.equal(projected.cleanup_blocked, true, "the actual projection of an unknown cleanup fact");
    const view = M.safetyView(projected);
    assert.deepEqual([view.state, view.form, view.recovery], ["unavailable", false, null], JSON.stringify(raw));
    assert.doesNotMatch(view.text, cleanupText);
    assert.match(view.text, /could not read its record of this choice/u);
  }
  // The owner's explicit cleanup answers keep saying so.
  for (const raw of [{ code: "NATIVE_CLEANUP_REQUIRED", reason: "NATIVE_CLEANUP_REQUIRED", blocked: true, cleanup_blocked: true },
    { code: "RECOVERY_REQUIRED", blocked: true, cleanup_blocked: true, sequence: 3 }, { code: "NATIVE_CLEANUP_REQUIRED" }]) {
    assert.equal(M.safetyView(safetyReply(raw)).state, "cleanup", JSON.stringify(raw));
  }
});

test("page: an unreadable record projected with an unknown cleanup fact shows the unreadable state on the offer and in Settings", { skip }, async () => {
  const page = await loadPage({ safety: safetyReply({ code: "STORE_UNAVAILABLE", status: null, changed: null, sequence: 4 }) });
  assert.equal(page.$("safety-offer").hidden, true, "no offer, no cleanup card from an unreadable record");
  await page.navigate("#ai");
  assert.match(page.$("safety-settings-body").textContent, /could not read its record of this choice/u);
  assert.doesNotMatch(page.$("safety-settings-body").textContent, /could not be cleaned up/u);
  assert.equal(page.$("axiosozo-safety-settings-confirm"), null);
});

test("model: the copy claims no more than it knows: the resolver, not complete filtering; a proposal until saved; uncertain failures change no guarantee", () => {
  assert.doesNotMatch(M.SAFETY_TEXT, /do not open|blocks? (?:all|every)|safe from|protects/iu);
  assert.match(M.SAFETY_TEXT, /family\.cloudflare-dns\.com/u);
  assert.match(M.SAFETY_TEXT, /not a complete filter/u);
  assert.match(M.SAFETY_OFFER_HELP, /nothing changes until you save your choice/u);
  assert.doesNotMatch(M.SAFETY_OFFER_HELP, /It is on unless/u);
  for (const code of ["ACTOR_ERROR", "SAFETY_UNAVAILABLE", "ERROR"]) assert.doesNotMatch(M.safetyErrorText(code), /[Nn]othing was changed/u, code);
  for (const code of ["STORAGE_ERROR", "DOCUMENT_GONE"]) {
    assert.doesNotMatch(M.watchActionText(code), /[Nn]othing was changed|nothing was changed by it/u, code);
    assert.match(M.watchActionText(code), /not confirmed|cannot be confirmed/u, code);
  }
});

test("page: the offer describes a checked proposal awaiting Save; nothing reads as configured before the owner's settled answer", { skip }, async () => {
  const page = await loadPage();
  const card = page.$("safety-offer");
  assert.equal(card.querySelector(".block-help").textContent, M.SAFETY_OFFER_HELP);
  assert.doesNotMatch(card.textContent, /It is on unless you turn it off|Saved|On: AxioSozo/u);
  assert.match(card.querySelector(".safety-now").textContent, /^Off: /u, "what is set now, observed; the checkbox is only the proposal");
});

test("page: a failed re-read replaces an earlier ready answer: no old 'On', no enabled Save", { skip }, async () => {
  const page = await loadPage({ hash: "#ai", safety: reply({ status: { offer: false, checked: true, active: true, owned: true }, offer: { offer: false, checked: true } }) });
  const body = page.$("safety-settings-body");
  assert.match(body.textContent, /On: AxioSozo set Cloudflare's family filter\./u);
  assert.ok(page.$("axiosozo-safety-settings-confirm"));
  page.backend.safety = { throws: "ACTOR_ERROR" };
  await page.emit("safety");
  assert.equal(body.textContent, "The safety setting cannot be read right now.");
  assert.doesNotMatch(body.textContent, /On:|Nothing was changed/u);
  assert.equal(page.$("axiosozo-safety-settings-confirm"), null, "no Save on a state the page can no longer vouch for");
  assert.equal(page.$("axiosozo-safety-settings-checked"), null);
  page.backend.safety = reply({ status: { offer: false, checked: true, active: true, owned: true }, offer: { offer: false, checked: true } });
  await page.emit("safety");
  assert.ok(page.$("axiosozo-safety-settings-confirm"), "a later good answer brings it back");
});

test("page: a dispatched choice whose re-read fails or hangs is shown unconfirmed, never 'Nothing was changed', and its late answer is still reported", { skip }, async () => {
  // The re-read fails.
  const failing = await loadPage();
  assert.ok(failing.activate(failing.$("axiosozo-safety-offer-confirm")));
  failing.backend.safety = { throws: "ACTOR_ERROR" };
  await failing.emit("safety");
  const card = failing.$("safety-offer");
  assert.equal(card.hidden, false, "the card keeps the outcome of its own choice");
  assert.match(failing.$("status").textContent, /could not read the setting after your choice, so it is not confirmed/u);
  assert.doesNotMatch(card.textContent, /[Nn]othing was changed|Saved/u);
  assert.equal(failing.$("axiosozo-safety-offer-confirm"), null, "no Save while the state is unknown");
  // The browser answers later: the late result is reported against the click's baseline.
  failing.backend.safety = reply({ reason: "APPLIED", status: { offer: false, checked: true, active: true, owned: true }, offer: { offer: false, checked: true } });
  await failing.emit("safety");
  assert.equal(failing.$("status").textContent, "Your earlier choice has an answer now. Saved. The family filter is on.");

  // The re-read hangs past the wait.
  const hung = await loadPage();
  hung.activate(hung.$("axiosozo-safety-offer-confirm"));
  hung.backend.safety = "hang";
  await hung.emit("safety");
  await new Promise(resolve => setTimeout(resolve, 2600));
  await flush();
  assert.match(hung.$("status").textContent, /has not confirmed your choice yet/u);
  assert.doesNotMatch(hung.$("safety-offer").textContent, /[Nn]othing was changed|Saved\./u);
  // A later answer identical to the one before the click says nothing new.
  hung.backend.safety = reply();
  await hung.emit("safety");
  assert.match(hung.$("status").textContent, /has not confirmed your choice yet/u);
  // A refusal that arrives later is reported as that refusal.
  hung.backend.safety = reply({ reason: "PREF_LOCKED" });
  await hung.emit("safety");
  assert.equal(hung.$("status").textContent, "Your earlier choice has an answer now. DNS over HTTPS is locked by a policy on this Mac, so AxioSozo changed nothing.");

  // Two good answers equal to the one before the click: the same setting, said as such.
  const same = await loadPage({ hash: "#ai", safety: reply({ status: { offer: false, checked: false, active: false, owned: false }, offer: { offer: false, checked: false } }) });
  same.activate(same.$("axiosozo-safety-settings-confirm"));
  await same.emit("safety");
  await same.emit("safety");
  assert.match(same.$("status").textContent, /^AxioSozo reports the same setting as before your choice\./u);
});

// ---------------------------------------------------------------- native activation order

test("native order: the actor's one click listener is a default-group capture listener on its own document, added before any page listener", { skip }, async () => {
  assert.deepEqual({ ...CLICK_OPTIONS }, { capture: true }, "not the system group, which Gecko runs only after every page handler");
  const page = await loadPage();
  const clicks = page.document.trackedListeners.filter(entry => entry.type === "click");
  assert.deepEqual([clicks[0].capture, clicks[0].system], [true, false], "the actor's, first: installed at DOMDocElementInserted");
  assert.ok(clicks.slice(1).every(entry => !entry.capture && !entry.system), "the page's own document click listeners only bubble");
  assert.deepEqual(page.actor.win.trackedListeners.filter(entry => entry.type === "click"), [], "the page adds no window click listener that could run first");
  page.actor.child.didDestroy();
  assert.deepEqual(page.document.trackedListeners.filter(entry => entry.type === "click").map(entry => entry.capture), [false],
    "destroy removes exactly the actor's listener, by its own options");
});

test("native order: the unchecked first offer is read before the page replaces its Save control, and the browser's answer is shown", { skip }, async () => {
  let page;
  page = await loadPage({ actionReply: async () => {
    // The owner saved exactly the choice it was given: first run completed, unchecked, Off.
    page.backend.safety = reply({ reason: "UNCHANGED", status: { offer: false, checked: false, active: false, owned: false }, offer: { offer: false, checked: false } });
    return { ok: true, value: {} };
  } });
  const box = page.$("axiosozo-safety-offer-checked");
  assert.equal(box.checked, true, "the offer starts checked");
  box.click();
  assert.equal(box.checked, false, "the user unchecked it");
  const confirm = page.$("axiosozo-safety-offer-confirm");
  assert.deepEqual(page.activate(confirm), { name: MESSAGES.CONFIRM_SAFETY_CHOICE, data: { checked: false }, event: "safety" });
  assert.equal(page.document.contains(confirm), false, "the page replaced the clicked control in that same dispatch, after the actor read it");
  assert.equal(page.$("axiosozo-safety-offer-confirm").textContent, "Saving…");
  // The parent answered; the actor then let the page hear "safety", and it read the browser's state.
  await new Promise(resolve => setTimeout(resolve, 150));
  await flush();
  assert.equal(page.$("status").textContent, "Saved. The family filter is off.");
  assert.doesNotMatch(page.$("safety-offer").textContent, /has not confirmed/u);
  assert.equal(page.actor.actions.length, 1, "exactly one private message");
});

test("native order: the checked offer, a Settings restore and a recovery answer each send what the user activated", { skip }, async () => {
  const checked = await loadPage();
  const offerConfirm = checked.$("axiosozo-safety-offer-confirm");
  assert.deepEqual(checked.activate(offerConfirm).data, { checked: true });
  assert.equal(checked.document.contains(offerConfirm), false);
  // Settings: the family filter AxioSozo set is on; unchecking restores the earlier settings.
  const settings = await loadPage({ hash: "#ai", safety: reply({ status: { offer: false, checked: true, active: true, owned: true }, offer: { offer: false, checked: true } }) });
  settings.$("axiosozo-safety-settings-checked").click();
  const save = settings.$("axiosozo-safety-settings-confirm");
  assert.deepEqual(settings.activate(save), { name: MESSAGES.CONFIRM_SAFETY_CHOICE, data: { checked: false }, event: "safety" });
  assert.equal(settings.document.contains(save), false);
  // Recovery: the exact sequence the browser issued, from the authored group the page then re-renders.
  const recovery = await loadPage({ safety: reply({ code: "RECOVERY_REQUIRED", reason: "STARTUP_UNCERTAIN", blocked: true, sequence: 7, status: null }) });
  const restored = recovery.$("safety-offer").querySelector('button[data-safety-outcome="RESTORED"]');
  assert.deepEqual(recovery.activate(restored), { name: MESSAGES.RESOLVE_SAFETY_RECOVERY, data: { sequence: 7, outcome: "RESTORED" }, event: "safety" });
  assert.equal(recovery.document.contains(restored), false);
  assert.equal(recovery.$("axiosozo-safety-offer-recovery").querySelector('button[data-safety-outcome="RESTORED"]').getAttribute("aria-disabled"), "true",
    "the page re-rendered it inactive after the actor read it");
});

test("native order: untrusted, forged, disabled and repeated activations send nothing", { skip }, async () => {
  const page = await loadPage();
  const confirm = page.$("axiosozo-safety-offer-confirm");
  // A page-made copy with the same id elsewhere is not the authored control.
  const forged = page.document.createElement("button");
  forged.setAttribute("type", "button");
  forged.id = "axiosozo-safety-offer-confirm";
  page.document.querySelector("main").append(forged);
  assert.equal(page.activate(forged), null, "a forged copy of the id");
  forged.remove();
  confirm.disabled = true;
  assert.equal(page.activate(confirm), null, "a disabled button receives no click");
  confirm.disabled = false;
  assert.equal(page.activate(confirm, { isTrusted: false }), null, "a synthesized click");
  assert.equal(page.actor.actions.length, 0);
  // The synthesized click still ran the page's own handler, which now waits: the re-rendered control
  // is inactive while a choice is pending, so a trusted press sends nothing twice.
  const pending = page.$("axiosozo-safety-offer-confirm");
  assert.equal(pending.getAttribute("aria-disabled"), "true");
  assert.equal(page.activate(pending), null, "no second choice while one is pending");
  assert.equal(page.actor.actions.length, 0);
  // A recovery copy outside its authored group, with the right sequence.
  const recovery = await loadPage({ safety: reply({ code: "RECOVERY_REQUIRED", reason: "STARTUP_UNCERTAIN", blocked: true, sequence: 7, status: null }) });
  const copy = recovery.document.createElement("button");
  copy.setAttribute("type", "button");
  copy.setAttribute("data-safety-outcome", "ACCEPTED");
  copy.setAttribute("data-safety-sequence", "7");
  recovery.$("safety-offer").append(copy);
  assert.equal(recovery.activate(copy), null);
  assert.equal(recovery.actor.actions.length, 0);
});
