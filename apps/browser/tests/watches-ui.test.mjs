/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 §4 watches at every seam: the actor child's recognition of a trusted
// click on an authored watch control (and nothing else), the parent's private
// messages with their closed params and one-use current-lifetime receipt, the
// real AxioSozoServices facade over the real WatchController (production is
// immutably liveAuthorized: false) and the about:axiosozo page on the real HTML
// in support/mini-dom.mjs. Synthetic stores, windows, clock and documents only:
// no provider, native capture, hidden tab or real profile. Not evidence of
// Gecko rendering, Xray behaviour, VoiceOver or a native watch adapter.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { contextsCoreAvailable } from "./support/chrome-modules.mjs";
import { fakeZenWindow } from "./support/fake-zen.mjs";
import { Node, parseHtml, makeEvent } from "./support/mini-dom.mjs";
import { AboutAxioSozoParent, MESSAGES, METHODS, USER_ACTIONS, setProvidersForTesting, actionRoute } from "../chrome/AboutAxioSozoParent.sys.mjs";
import { userActionFromClick, AboutAxioSozoChild, WATCH_CONTROLS, createOverviewApi, CLICK_OPTIONS } from "../chrome/AboutAxioSozoChild.sys.mjs";

const skip = contextsCoreAvailable ? false : "packages/contexts/src/index.mjs is absent";
const { AxioSozoServices } = skip ? {} : await import("../chrome/AxioSozoServices.sys.mjs");
const { ZenWorkspaceAdapter } = await import("../chrome/ZenWorkspaceAdapter.sys.mjs");
const core = skip ? {} : await import("../../../packages/contexts/src/index.mjs");
const M = await import("../chrome/overview/overview-model.mjs");

const HTML = readFileSync(new URL("../chrome/overview/about-axiosozo.html", import.meta.url), "utf8");
const settle = async (rounds = 20) => { for (let i = 0; i < rounds; i++) await Promise.resolve(); };
const flush = async (rounds = 8) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setTimeout(resolve, 0)); };
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const WATCH_ID = "w_fixture1";

// ---------------------------------------------------------------- the child: trusted clicks on authored controls

function formDocument(uri = "about:axiosozo#project=p_harbor1") {
  const document = parseHtml(`<html><body><main>
    <div id="${WATCH_CONTROLS.form}" data-project-id="p_harbor1">
      <input type="url" id="${WATCH_CONTROLS.url}" value="https://status.example/deploy?token=x#y">
      <textarea id="${WATCH_CONTROLS.question}"></textarea>
      <input type="text" id="${WATCH_CONTROLS.outcomeLabel}0" value="Yes"><input type="hidden" id="${WATCH_CONTROLS.outcomeId}0" value="yes">
      <input type="text" id="${WATCH_CONTROLS.outcomeLabel}1" value="Not yet"><input type="hidden" id="${WATCH_CONTROLS.outcomeId}1" value="not_yet">
      <select id="${WATCH_CONTROLS.observation}"><option value="none">Nothing</option><option value="address" selected>Address</option></select>
      <select id="${WATCH_CONTROLS.provider}"><option value="jev">Jev</option><option value="openai" selected>OpenAI</option></select>
      <input type="checkbox" id="${WATCH_CONTROLS.consent}">
      <input type="checkbox" id="${WATCH_CONTROLS.enabled}">
      <select id="${WATCH_CONTROLS.interval}"><option value="5">5</option><option value="15" selected>15</option></select>
      <button type="button" id="${WATCH_CONTROLS.save}"><span>Add watch</span></button>
    </div>
    <article id="project-home"><div><section class="home-section" data-section="watches"><ul class="watch-list">
      <li class="watch-row" id="watch-${WATCH_ID}"><div class="watch-main"><h4>Is it done?</h4></div>
        <div class="watch-actions"><button type="button" data-watch-action="check" data-watch-id="${WATCH_ID}">Check now</button>
          <button type="button" role="menuitem">Edit…</button></div>
        <div class="watch-confirm" role="group"><span>Remove this watch?</span><div class="button-row">
          <button type="button" data-watch-action="remove" data-watch-id="${WATCH_ID}">Remove watch</button></div></div></li>
      <li class="watch-row" id="watch-w_fixture2"><div class="watch-actions"><button type="button" id="other-row" data-watch-action="check" data-watch-id="w_fixture2">Check now</button></div></li>
    </ul></section></div></article>
    <section id="start-page" data-section="watches"><ul class="watch-list"><li class="watch-row" id="start-watch-${WATCH_ID}">
      <div class="watch-actions"><button type="button" id="start-copy" data-watch-action="check" data-watch-id="${WATCH_ID}">Check now</button></div></li></ul></section>
    <button type="button" id="${WATCH_CONTROLS.retry}">Retry cleanup</button>
    <button type="button" id="outside">Elsewhere</button>
  </main></body></html>`);
  document.documentURI = uri;
  document.getElementById(WATCH_CONTROLS.question).value = "Is the deploy finished?";
  document.getElementById(WATCH_CONTROLS.consent).checked = true;
  document.getElementById(WATCH_CONTROLS.enabled).checked = true;
  return document;
}
const click = (target, init = {}) => ({ ...makeEvent("click", init), target });

test("child: a trusted mouse or keyboard click on Save reads the authored form natively into the closed SaveWatch params", () => {
  const document = formDocument();
  const save = document.getElementById(WATCH_CONTROLS.save);
  const expected = { name: MESSAGES.SAVE_WATCH, event: "watches", data: { projectId: "p_harbor1", watch: {
    url: "https://status.example/deploy?token=x#y", question: "Is the deploy finished?",
    outcomes: [{ id: "yes", label: "Yes" }, { id: "not_yet", label: "Not yet" }], observation: "address", provider: "openai",
    consent: true, enabled: true, intervalMinutes: 15 } } };
  assert.deepEqual(userActionFromClick(click(save), document), expected, "mouse click");
  assert.deepEqual(userActionFromClick(click(save.querySelector("span"), { detail: 0 }), document), expected, "keyboard activation of the button (a trusted click)");
  document.getElementById(WATCH_CONTROLS.form).setAttribute("data-watch-id", WATCH_ID);
  assert.equal(userActionFromClick(click(save), document).data.watch.id, WATCH_ID, "an edit names the service-issued id");
});

test("child: synthetic, inactive, foreign, renamed or incomplete controls start nothing", () => {
  const document = formDocument();
  const save = document.getElementById(WATCH_CONTROLS.save);
  assert.equal(userActionFromClick(click(save, { isTrusted: false }), document), null, "synthesized by page script");
  assert.equal(userActionFromClick({ ...click(save), type: "keydown" }, document), null);
  assert.equal(userActionFromClick(click(save), formDocument("https://evil.example/")), null, "not about:axiosozo");
  assert.equal(userActionFromClick(click(formDocument().getElementById(WATCH_CONTROLS.save)), document), null, "another document's button");
  assert.equal(userActionFromClick(click(document.getElementById("outside")), document), null);
  assert.equal(userActionFromClick(click(document.querySelector('[role="menuitem"]')), document), null, "menu items are not actions");
  save.setAttribute("aria-disabled", "true");
  assert.equal(userActionFromClick(click(save), document), null, "inactive while the form is invalid or saving");
  save.removeAttribute("aria-disabled");
  save.disabled = true;
  assert.equal(userActionFromClick(click(save), document), null);
  save.disabled = false;
  save.setAttribute("type", "submit");
  assert.equal(userActionFromClick(click(save), document), null, "only authored type=button controls");
  save.setAttribute("type", "button");
  save.id = "renamed";
  assert.equal(userActionFromClick(click(save), document), null, "only the exact id");
  save.id = WATCH_CONTROLS.save;
  document.getElementById(`${WATCH_CONTROLS.outcomeId}1`).remove();
  assert.equal(userActionFromClick(click(save), document), null, "an answer without its id control");
  const outside = formDocument();
  const button = outside.getElementById(WATCH_CONTROLS.save);
  outside.querySelector("main").append(button);
  assert.equal(userActionFromClick(click(button), outside), null, "Save outside its form");
});

// What the service's own listWatches answer issued to this document (the real
// one is createOverviewApi().issued, exercised by the actor test below).
const issuedFor = (...ids) => ({ hasWatch: id => ids.includes(id), safetySequence: null });
const ISSUED = issuedFor(WATCH_ID, "w_fixture2");

test("child: list rows use one fixed action kind and the service-issued id; Retry is its own fixed control", () => {
  const document = formDocument();
  const [check, remove] = document.querySelectorAll("#project-home button[data-watch-action]");
  assert.deepEqual(userActionFromClick(click(check), document, ISSUED), { name: MESSAGES.CHECK_WATCH, data: { id: WATCH_ID }, event: "watches" });
  assert.deepEqual(userActionFromClick(click(remove), document, ISSUED), { name: MESSAGES.REMOVE_WATCH, data: { id: WATCH_ID }, event: "watches" });
  assert.deepEqual(userActionFromClick(click(document.getElementById(WATCH_CONTROLS.retry)), document),
    { name: MESSAGES.RETRY_WATCH_CLEANUP, data: {}, event: "watches" });
  check.setAttribute("data-watch-id", "../w_fixture1");
  assert.equal(userActionFromClick(click(check), document, ISSUED), null);
  check.setAttribute("data-watch-id", WATCH_ID);
  check.setAttribute("data-watch-action", "force");
  assert.equal(userActionFromClick(click(check), document, ISSUED), null, "no other action kind");
});

test("child: a row action needs its own authored row in the project home and an id the service issued; copied attributes mean nothing", () => {
  const document = formDocument();
  const check = document.querySelector('#project-home button[data-watch-action="check"]');
  const remove = document.querySelector('#project-home button[data-watch-action="remove"]');
  const expected = { name: MESSAGES.CHECK_WATCH, data: { id: WATCH_ID }, event: "watches" };
  assert.deepEqual(userActionFromClick(click(check), document, ISSUED), expected);
  assert.equal(userActionFromClick(click(check), document), null, "no service answer yet: nothing was issued");
  assert.equal(userActionFromClick(click(check), document, issuedFor("w_fixture2")), null, "an id the latest list no longer has");
  // The same attributes on any other button: outside every row, in another
  // watch's row, in the start page's action-less copy, or in the wrong group.
  const copy = () => {
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("data-watch-action", "check");
    button.setAttribute("data-watch-id", WATCH_ID);
    return button;
  };
  const outside = copy();
  document.querySelector("main").append(outside);
  assert.equal(userActionFromClick(click(outside), document, ISSUED), null, "outside any row");
  const otherRow = copy();
  document.getElementById("watch-w_fixture2").querySelector(".watch-actions").append(otherRow);
  assert.equal(userActionFromClick(click(otherRow), document, ISSUED), null, "inside another watch's row");
  assert.equal(userActionFromClick(click(document.getElementById("start-copy")), document, ISSUED), null, "the start page's copy is not the project home");
  const main = copy();
  document.getElementById(`watch-${WATCH_ID}`).querySelector(".watch-main").append(main);
  assert.equal(userActionFromClick(click(main), document, ISSUED), null, "inside the row but not its actions");
  const misplacedRemove = copy();
  misplacedRemove.setAttribute("data-watch-action", "remove");
  document.getElementById(`watch-${WATCH_ID}`).querySelector(".watch-actions").append(misplacedRemove);
  assert.equal(userActionFromClick(click(misplacedRemove), document, ISSUED), null, "Remove only from its confirmation");
  const confirmCheck = copy();
  document.getElementById(`watch-${WATCH_ID}`).querySelector(".watch-confirm .button-row").append(confirmCheck);
  assert.equal(userActionFromClick(click(confirmCheck), document, ISSUED), null, "Check now only from the row's actions");
  assert.deepEqual(userActionFromClick(click(remove), document, ISSUED).name, MESSAGES.REMOVE_WATCH, "the authored Remove still counts");
  // A row whose id no longer names the watch, or a section that is not the home's.
  const row = document.getElementById(`watch-${WATCH_ID}`);
  row.id = "watch-w_renamed1";
  assert.equal(userActionFromClick(click(check), document, ISSUED), null, "the row's identity must be that watch");
  row.id = `watch-${WATCH_ID}`;
  document.querySelector("#project-home section").setAttribute("data-section", "about");
  assert.equal(userActionFromClick(click(check), document, ISSUED), null, "only the Watches section");
  document.querySelector("#project-home section").setAttribute("data-section", "watches");
  document.getElementById("project-home").id = "elsewhere";
  assert.equal(userActionFromClick(click(check), document, ISSUED), null, "only inside the project home");
});

test("child: the issued ids are the latest listWatches answer's own; an older answer arriving late, a failure or another method changes nothing", async () => {
  const replies = [];
  const api = createOverviewApi({ win: { Promise, JSON, TypeError }, Cu: fakeCu(), sendAsyncMessage: () => {},
    sendQuery: () => new Promise(resolve => replies.push(resolve)) });
  assert.equal(api.issued.hasWatch(WATCH_ID), false, "nothing before an answer");
  const older = api.request("listWatches");
  const newer = api.request("listWatches");
  replies[1]({ ok: true, value: [{ id: "w_newer1" }] });
  await newer;
  replies[0]({ ok: true, value: [{ id: WATCH_ID }] });
  await older;
  assert.deepEqual([api.issued.hasWatch("w_newer1"), api.issued.hasWatch(WATCH_ID)], [true, false], "the late older list is ignored");
  const status = api.request("getWatchStatus", {});
  replies[2]({ ok: true, value: [{ id: WATCH_ID }] });
  await status;
  const failed = api.request("listWatches").catch(error => error.code);
  replies[3]({ ok: false, error: { code: "STORAGE_ERROR" } });
  assert.equal(await failed, "STORAGE_ERROR");
  assert.deepEqual([api.issued.hasWatch("w_newer1"), api.issued.hasWatch(WATCH_ID)], [true, false], "only listWatches answers issue ids");
  assert.ok(Object.isFrozen(api.issued));
  assert.equal(api.issued.hasWatch("w_newer1 "), false);
});

test("child: only isTrusted, type and target of the event are read; no page detail, getter or callback runs", () => {
  const document = formDocument();
  const target = document.getElementById(WATCH_CONTROLS.save);
  const read = [];
  const event = new Proxy({ isTrusted: true, type: "click", target }, { get(object, key) {
    read.push(key);
    if (!["isTrusted", "type", "target"].includes(key)) throw new Error(`read ${String(key)}`);
    return object[key];
  } });
  assert.equal(userActionFromClick(event, document).name, MESSAGES.SAVE_WATCH);
  assert.deepEqual([...new Set(read)].sort(), ["isTrusted", "target", "type"]);
});

function fakeCu() {
  return { cloneInto: (value, _target, options) => (options?.cloneFunctions ? { ...value } : structuredClone(value)),
    waiveXrays: value => value, exportFunction: fn => fn };
}

test("child actor: the private message carries exactly the action; the page then hears only 'watches', also after a refusal", async () => {
  const previous = globalThis.Cu;
  globalThis.Cu = fakeCu();
  try {
    const document = formDocument();
    const win = { Promise, JSON, TypeError };
    const sent = [], async = [];
    let reply = { ok: true, value: { done: true } };
    const child = new AboutAxioSozoChild();
    Object.assign(child, { contentWindow: win, document, sendQuery: async (name, data) => { sent.push([name, data]); return reply; },
      sendAsyncMessage: (name, data) => async.push([name, data]) });
    child.handleEvent({ type: "DOMDocElementInserted" });
    const heard = [];
    win.AxioSozoOverview.subscribe(event => heard.push(event.name));
    const deliver = (target, init = {}) => { for (const fn of [...(document.listeners.get("click") ?? [])]) fn(click(target, init)); };
    deliver(document.getElementById(WATCH_CONTROLS.save), { isTrusted: false });
    await settle();
    assert.deepEqual([sent, heard], [[], []], "nothing for a synthesized click");
    const check = document.querySelector('#project-home button[data-watch-action="check"]');
    deliver(check);
    await settle();
    assert.deepEqual(sent, [], "no row action before the service listed that watch to this document");
    // The page's own read: the service's answer issues the ids.
    reply = { ok: true, value: [{ id: WATCH_ID }, { id: "../bad" }] };
    await win.AxioSozoOverview.request("listWatches");
    sent.length = 0;
    reply = { ok: true, value: { done: true } };
    deliver(check);
    await settle();
    assert.deepEqual(sent, [[MESSAGES.CHECK_WATCH, { id: WATCH_ID }]]);
    assert.deepEqual(heard, ["watches"], "the event name only, after the parent answered");
    deliver(document.getElementById("other-row"));
    await settle();
    assert.equal(sent.length, 1, "a watch the latest list did not name");
    reply = Promise.reject(new Error("actor gone"));
    reply.catch(() => {});
    deliver(document.getElementById(WATCH_CONTROLS.retry));
    await settle();
    assert.deepEqual(heard, ["watches", "watches"], "a refused or lost reply still lets the page read the truth again");
    assert.deepEqual(Object.keys(win.AxioSozoOverview).sort(), ["request", "subscribe"], "no page method for any of it");
    assert.deepEqual(async.filter(([name]) => name !== MESSAGES.SUBSCRIBE), []);
    child.didDestroy();
  } finally { if (previous === undefined) delete globalThis.Cu; else globalThis.Cu = previous; }
});

// ---------------------------------------------------------------- the parent: closed private protocol

function goodPrincipal() { return { isSystemPrincipal: false, isContentPrincipal: true, originNoSuffix: "about:axiosozo", privateBrowsingId: 0 }; }
function fakeActor({ uri = "about:axiosozo#project=p_harbor1", isPrivate = false } = {}) {
  const actor = new AboutAxioSozoParent();
  const embedder = { name: "browser" };
  const tabListeners = new Set(), progress = new Set();
  const window = { name: "normal-window",
    gBrowser: { selectedBrowser: embedder,
      tabContainer: { addEventListener: (_t, fn) => tabListeners.add(fn), removeEventListener: (_t, fn) => tabListeners.delete(fn) },
      addTabsProgressListener: listener => progress.add(listener), removeTabsProgressListener: listener => progress.delete(listener) } };
  const context = { parent: null, embedderElement: embedder, usePrivateBrowsing: isPrivate, topChromeWindow: window };
  context.top = context;
  actor.browsingContext = context;
  actor.manager = { remoteType: "privilegedabout", isCurrentGlobal: true, documentURI: { spec: uri }, documentPrincipal: goodPrincipal() };
  actor.sendAsyncMessage = () => {};
  return { actor, window, embedder, tabListeners, progress,
    navigate(spec) { actor.manager.documentURI = { spec }; for (const listener of [...progress]) listener.onLocationChange(embedder, { isTopLevel: true }); },
    selectOther() { window.gBrowser.selectedBrowser = { name: "other" }; for (const fn of [...tabListeners]) fn(); } };
}
function actorServices({ normal = true, hold = null } = {}) {
  const calls = [];
  const services = {
    isNormalWindow: () => normal,
    on: () => () => {},
    listWatches: async () => [{ id: WATCH_ID }],
    getWatchStatus: () => ({ busy: false }),
  };
  for (const name of ["saveWatch", "removeWatch", "checkWatch", "retryWatchCleanup"]) {
    services[name] = async args => { calls.push([name, args, args.current()]); if (hold) await hold.promise; return { done: true }; };
  }
  return { services, calls };
}
const VALID = { projectId: "p_harbor1", watch: { url: "https://status.example/deploy", question: "Is the deploy finished?",
  outcomes: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }], observation: "address", provider: "jev", consent: false, enabled: true, intervalMinutes: 5 } };
const request = (actor, name, params) => actor.receiveMessage({ name: MESSAGES.REQUEST, data: { name, params } });
const quietly = async run => { const previous = console.error; console.error = () => {}; try { return await run(); } finally { console.error = previous; } };

test("parent: as page requests, watch changes always refuse USER_ACTIVATION_REQUIRED, whatever page-minted authority they carry", async () => {
  const { services, calls } = actorServices();
  const restore = setProvidersForTesting({ services: () => services });
  try {
    const { actor } = fakeActor();
    const attempts = [["saveWatch", VALID], ["saveWatch", { ...VALID, userCreated: true, gesture: "token", confirmed: true }],
      ["removeWatch", { id: WATCH_ID }], ["removeWatch", { id: WATCH_ID, userCreated: true }], ["checkWatch", { id: WATCH_ID, force: true }],
      ["retryWatchCleanup", {}], ["retryWatchCleanup", { receipt: "x" }]];
    for (const [name, params] of attempts) {
      const reply = await request(actor, name, params);
      assert.equal(reply.error?.code, "USER_ACTIVATION_REQUIRED", `${name} ${JSON.stringify(params)}`);
    }
    assert.deepEqual(calls, [], "no service call");
    assert.ok(Object.hasOwn(METHODS, "listWatches") && Object.hasOwn(METHODS, "getWatchStatus"));
    assert.deepEqual((await request(actor, "listWatches")).value, [{ id: WATCH_ID }]);
    assert.deepEqual((await request(actor, "getWatchStatus")).value, { busy: false });
    assert.equal((await request(actor, "listWatches", { projectId: "p_harbor1" })).error.code, "INVALID_PARAMS");
    assert.equal((await request(actor, "getWatchStatus", { window: "x" })).error.code, "INVALID_PARAMS");
  } finally { restore(); }
  const { services: other } = actorServices({ normal: false });
  const again = setProvidersForTesting({ services: () => other });
  try { assert.equal((await request(fakeActor().actor, "listWatches")).error.code, "PRIVATE_WINDOW"); } finally { again(); }
});

test("parent: a private SaveWatch reaches the services with the native window, a current receipt and the closed params only", async () => {
  const { services, calls } = actorServices();
  const restore = setProvidersForTesting({ services: () => services });
  try {
    const { actor, window } = fakeActor();
    const reply = await actor.receiveMessage({ name: MESSAGES.SAVE_WATCH, data: structuredClone(VALID) });
    assert.deepEqual(reply, { ok: true, value: { done: true } });
    const [[name, args, currentDuringCall]] = calls;
    assert.equal(name, "saveWatch");
    assert.deepEqual(Object.keys(args).sort(), ["current", "projectId", "signal", "watch", "window"]);
    assert.ok(args.window === window, "the actor's own top chrome window");
    assert.deepEqual([args.projectId, args.watch], [VALID.projectId, VALID.watch]);
    assert.equal(currentDuringCall, true, "the receipt holds while its action runs");
    assert.equal(args.current(), false, "and is spent once its action finished");
  } finally { restore(); }
});

test("parent: the private params are closed; reserved, duplicate or malformed answers, extra keys and another route refuse before any work", async () => {
  const { services, calls } = actorServices();
  const restore = setProvidersForTesting({ services: () => services });
  const watch = patch => ({ ...VALID, watch: { ...VALID.watch, ...patch } });
  try {
    const { actor } = fakeActor();
    const invalid = [
      { ...VALID, userCreated: true }, { projectId: "p_harbor1" }, watch({ created_by: "user" }), watch({ latest_result: null }),
      watch({ outcomes: [{ id: "unknown", label: "?" }, { id: "no", label: "No" }] }),
      watch({ outcomes: [{ id: "yes", label: "Yes" }, { id: "yes", label: "Again" }] }),
      watch({ outcomes: [{ id: "yes", label: "Yes" }] }), watch({ outcomes: [{ id: "yes", label: "Yes", extra: 1 }, { id: "no", label: "No" }] }),
      watch({ outcomes: [{ id: "Yes", label: "Yes" }, { id: "no", label: "No" }] }), watch({ question: "Two\nlines" }), watch({ question: "x".repeat(501) }),
      watch({ url: "ftp://status.example/" }), watch({ url: "javascript:alert(1)" }), watch({ url: `https://a.example/${"x".repeat(2050)}` }),
      watch({ observation: "everything" }), watch({ provider: "claude" }), watch({ consent: "true" }), watch({ enabled: 1 }),
      watch({ intervalMinutes: 0 }), watch({ intervalMinutes: 31 }), watch({ intervalMinutes: "5" }), watch({ id: "w_UPPER" }),
    ];
    for (const data of invalid) {
      const reply = await actor.receiveMessage({ name: MESSAGES.SAVE_WATCH, data });
      assert.equal(reply.error?.code, "INVALID_PARAMS", JSON.stringify(data).slice(0, 120));
    }
    assert.equal((await actor.receiveMessage({ name: MESSAGES.SAVE_WATCH, data: { ...VALID, projectId: "p_other1" } })).error.code, "ROUTE_MISMATCH",
      "a save names exactly the project whose home is shown");
    for (const data of [{ id: WATCH_ID, extra: 1 }, { id: "w_x" }, {}]) {
      assert.equal((await actor.receiveMessage({ name: MESSAGES.REMOVE_WATCH, data })).error.code, "INVALID_PARAMS");
    }
    assert.equal((await actor.receiveMessage({ name: MESSAGES.RETRY_WATCH_CLEANUP, data: { force: true } })).error.code, "INVALID_PARAMS");
    const list = fakeActor({ uri: "about:axiosozo#projects" }).actor;
    for (const [message, data] of [[MESSAGES.SAVE_WATCH, VALID], [MESSAGES.CHECK_WATCH, { id: WATCH_ID }], [MESSAGES.REMOVE_WATCH, { id: WATCH_ID }]]) {
      assert.equal((await list.receiveMessage({ name: message, data })).error.code, "ROUTE_MISMATCH", `${message} from the project list`);
    }
    const start = fakeActor({ uri: "about:axiosozo#home" }).actor;
    assert.equal((await start.receiveMessage({ name: MESSAGES.CHECK_WATCH, data: { id: WATCH_ID } })).error.code, "ROUTE_MISMATCH");
    assert.deepEqual(calls, []);
    assert.deepEqual(actionRoute("about:axiosozo#project=p_harbor1"), { kind: "project", id: "p_harbor1" });
    assert.deepEqual(actionRoute("about:axiosozo#home"), { kind: "home", id: null });
    assert.equal(actionRoute("https://example.test/#home"), null);
  } finally { restore(); }
});

test("parent: native surface admission: not selected, private, unknown privacy or a non-normal window refuse before any work", async () => {
  const { services, calls } = actorServices();
  const restore = setProvidersForTesting({ services: () => services });
  try {
    const background = fakeActor();
    background.window.gBrowser.selectedBrowser = { name: "another tab" };
    assert.equal((await background.actor.receiveMessage({ name: MESSAGES.CHECK_WATCH, data: { id: WATCH_ID } })).error.code, "DOCUMENT_GONE");
    // A consistent private sender is admitted as a sender but is never a normal surface.
    const priv = fakeActor({ isPrivate: true });
    priv.actor.manager.documentPrincipal = { ...goodPrincipal(), privateBrowsingId: 1 };
    assert.equal((await priv.actor.receiveMessage({ name: MESSAGES.CHECK_WATCH, data: { id: WATCH_ID } })).error.code, "DOCUMENT_GONE");
    await quietly(async () => {
      const unknown = fakeActor();
      unknown.actor.browsingContext.usePrivateBrowsing = undefined;
      assert.equal((await unknown.actor.receiveMessage({ name: MESSAGES.CHECK_WATCH, data: { id: WATCH_ID } })).error.code, "SENDER_REJECTED");
    });
    assert.deepEqual(calls, []);
  } finally { restore(); }
  const { services: notNormal, calls: none } = actorServices({ normal: false });
  const again = setProvidersForTesting({ services: () => notNormal });
  try {
    assert.equal((await fakeActor().actor.receiveMessage({ name: MESSAGES.CHECK_WATCH, data: { id: WATCH_ID } })).error.code, "PRIVATE_WINDOW");
    assert.deepEqual(none, []);
  } finally { again(); }
});

test("parent: the receipt is bound to the native lifetime: a route change (even back to the same text), leaving the tab or destruction ends it at once", async () => {
  for (const [label, change] of [
    ["route away and back", f => { f.navigate("about:axiosozo#projects"); f.navigate("about:axiosozo#project=p_harbor1"); }],
    ["same text, new document URI object", f => { f.actor.manager.documentURI = { spec: "about:axiosozo#project=p_harbor1" }; }],
    ["another tab selected", f => f.selectOther()],
    ["destroyed", f => f.actor.didDestroy()],
  ]) {
    const hold = deferred();
    const { services, calls } = actorServices({ hold });
    const restore = setProvidersForTesting({ services: () => services });
    try {
      const f = fakeActor();
      const pending = f.actor.receiveMessage({ name: MESSAGES.CHECK_WATCH, data: { id: WATCH_ID } });
      await settle();
      const [[, args]] = calls;
      assert.deepEqual([args.current(), args.signal.aborted, args.projectId], [true, false, "p_harbor1"], `${label}: current while shown`);
      change(f);
      assert.equal(args.current(), false, `${label}: ended`);
      if (label !== "same text, new document URI object") assert.equal(args.signal.aborted, true, `${label}: its signal aborted at once`);
      hold.resolve();
      const reply = await pending;
      assert.equal(reply.ok, false, `${label}: a late outcome is never handed to whatever is shown now`);
      assert.equal(args.current(), false, `${label}: never true again`);
    } finally { restore(); }
  }
});

// ---------------------------------------------------------------- the services facade (production: liveAuthorized false)

const HOME_SPACE = "11111111-1111-4111-8111-111111111111";
const MANIFEST = { version: 1, name: "Harbor", kind: "web", environments: [{ name: "local", base_url: "http://localhost:5173" }],
  services: [], surfaces: [] };
const project = id => ({ version: 2, id, root: `/work/${id}`, manifest: MANIFEST, manifest_state: "none", context_uuid: null, trusted: false,
  created_at: 11, updated_at: 13, detected: null, container: { user_context_id: null }, shared_sites: { hosts: [], confirmed: false }, accounts: [], brief: null });

function servicesHarness({ shutdownOwner = "registered" } = {}) {
  const files = new Map([["contexts.json", JSON.stringify({ version: 3, contexts: [], projects: [project("p_harbor1"), project("p_inkline1")] })]]);
  const writes = [];
  // A held watches.json write waits for its gate (the work is then in flight).
  const writeGates = [];
  const storageFor = name => ({ read: async () => files.get(name) ?? null, write: async text => {
    const gate = name === "watches.json" ? writeGates.shift() : null;
    if (gate) await gate.promise;
    writes.push(name); files.set(name, text);
  } });
  let now = Date.UTC(2026, 9, 3, 12);
  let serial = 0;
  const host = { factory: 0 };
  const events = [];
  // Timers run only when a test fires them.
  const timers = [];
  const shutdown = [];
  const services = new AxioSozoServices({ storageFor, clock: () => now, randomId: prefix => `${prefix}fixture${++serial}`,
    timers: { setTimeout: (fn, ms) => timers.push({ fn, ms, cleared: false }), clearTimeout: id => { if (timers[id - 1]) timers[id - 1].cleared = true; } },
    onShutdown: shutdownOwner === "missing" ? undefined : (fn, label) => shutdown.push({ fn, label }),
    createDecisionHost: () => { host.factory++; return async () => { throw new Error("never"); }; } });
  services.on("watches", () => events.push("watches"));
  const zen = fakeZenWindow({ spaces: [{ uuid: HOME_SPACE, name: "Home", containerTabId: 0 }] });
  services.registerWindow(zen.window, new ZenWorkspaceAdapter(zen.window));
  const authority = { window: zen.window, current: () => true };
  const stored = () => JSON.parse(files.get("watches.json") ?? "{\"watches\":[]}").watches;
  return { services, files, writes, events, host, authority, stored, zen, timers, shutdown,
    holdWrite: () => { const gate = deferred(); writeGates.push(gate); return gate; },
    /** Fires the newest pending timer of at least `min` ms (the schedule's own arm). */
    fireTimer: (min = 1000) => {
      const entry = timers.findLast(item => !item.cleared && !item.fired && item.ms >= min && item.ms <= 60000);
      if (!entry) return false;
      entry.fired = true; entry.fn(); return true;
    },
    advance: ms => { now += ms; }, get now() { return now; } };
}
const input = (patch = {}) => ({ url: "https://user:pw@status.example/deploy?token=x#frag", question: "Is the deploy finished?",
  outcomes: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }], observation: "none", provider: "jev", consent: false, enabled: true,
  intervalMinutes: 5, ...patch });

test("services: a trusted save creates a user watch with a fresh id and trusted time; only origin and path are kept", { skip }, async () => {
  const h = servicesHarness();
  const saved = await h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: input() });
  const [record] = h.stored();
  assert.equal(record.id, "w_fixture1");
  assert.deepEqual([record.project_id, record.created_by, record.revision, record.url, record.latest_result, record.schedule],
    ["p_harbor1", "user", 1, "https://status.example/deploy", null, { interval_minutes: 5, last_checked_at: null }]);
  assert.deepEqual([record.observation, record.provider, record.consent, record.enabled], ["none", "jev", false, true], "the new-form defaults");
  assert.equal(record.created_at, h.now);
  assert.deepEqual(saved, record);
  assert.deepEqual(await h.services.listWatches(), [record]);
  assert.deepEqual(h.events, ["watches"]);
  assert.equal(h.services.getWatchStatus().last_error, null);
  assert.equal(h.host.factory, 0, "no provider host");
  await assert.rejects(h.services.saveWatch({ ...h.authority, projectId: "p_gone1", watch: input() }), { code: "UNKNOWN_PROJECT" });
  assert.deepEqual(h.services.getWatchStatus().last_error, { action: "save", code: "UNKNOWN_PROJECT", watch_id: null });
  await assert.rejects(h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: input({ question: "" }) }), { code: "INVALID_WATCH" });
  assert.equal(h.stored().length, 1, "nothing invalid was written");
});

test("services: production checks record NOT_AUTHORIZED with nothing sent and no native, budget or provider work, whatever the saved consent", { skip }, async () => {
  const h = servicesHarness();
  await h.services.saveWatch({ ...h.authority, projectId: "p_harbor1",
    watch: input({ observation: "screen", provider: "openai", consent: true, enabled: true, intervalMinutes: 1 }) });
  const report = await h.services.checkWatch({ ...h.authority, id: "w_fixture1", projectId: "p_harbor1" });
  assert.equal(report.code, "NOT_AUTHORIZED");
  assert.deepEqual([report.data_sent, report.persisted, report.provider, report.outcome], [false, true, "openai", "unknown"]);
  const [record] = h.stored();
  assert.deepEqual(record.latest_result, { request_id: record.latest_result.request_id, checked_at: h.now, outcome: "unknown", reason: "NOT_AUTHORIZED",
    confidence: null, data_sent: false, provider: "openai" });
  assert.equal(record.schedule.last_checked_at, h.now);
  assert.equal(h.host.factory, 0, "no provider host was ever created");
  const status = h.services.getWatchStatus();
  assert.deepEqual(Object.keys(status).sort(), ["busy", "cleanup_required", "closed", "last", "last_error", "loaded", "pending_disclosure", "phase",
    "recovery_required", "residual", "retry_allowed", "scheduled"]);
  assert.deepEqual([status.last.code, status.busy, status.scheduled, status.retry_allowed, status.residual, status.last_error], ["NOT_AUTHORIZED", false, false, false, null, null]);
  // Not due again yet: a category of its own, not a check.
  const again = await h.services.checkWatch({ ...h.authority, id: "w_fixture1", projectId: "p_harbor1" });
  assert.equal(again.code, "NOT_DUE");
  assert.deepEqual(h.services.getWatchStatus().last_error, { action: "check", code: "NOT_DUE", watch_id: "w_fixture1" });
  // Observing nothing: disabled, nothing recorded.
  const quiet = await h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: input() });
  assert.equal((await h.services.checkWatch({ ...h.authority, id: quiet.id, projectId: "p_harbor1" })).code, "disabled");
  assert.equal(h.stored().find(item => item.id === quiet.id).latest_result, null);
  assert.deepEqual(h.services.getWatchStatus().last_error, { action: "check", code: "disabled", watch_id: quiet.id });
  await assert.rejects(h.services.checkWatch({ ...h.authority, id: "w_fixture1", projectId: "p_inkline1" }), { code: "PROJECT_MISMATCH" });
  await assert.rejects(h.services.retryWatchCleanup(h.authority), { code: "NOTHING_TO_RETRY" }, "a retry never starts a check");
});

test("services: an edit keeps id, project, provenance and creation time and clears the old result before validation", { skip }, async () => {
  const h = servicesHarness();
  await h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: input({ observation: "address", consent: true }) });
  await h.services.checkWatch({ ...h.authority, id: "w_fixture1", projectId: "p_harbor1" });
  const created = h.stored()[0];
  assert.equal(created.latest_result.reason, "NOT_AUTHORIZED");
  h.advance(60_000);
  await h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: input({ id: "w_fixture1", question: "Is it live?",
    outcomes: [{ id: "live", label: "Live" }, { id: "down", label: "Down" }, { id: "partly", label: "Partly" }] }) });
  const edited = h.stored()[0];
  assert.deepEqual([edited.id, edited.project_id, edited.created_by, edited.created_at, edited.revision],
    [created.id, "p_harbor1", "user", created.created_at, created.revision + 1]);
  assert.deepEqual([edited.latest_result, edited.schedule.last_checked_at, edited.question], [null, null, "Is it live?"]);
  assert.deepEqual(edited.outcomes.map(item => item.id), ["live", "down", "partly"], "answers changed although an old result named others");
  await assert.rejects(h.services.saveWatch({ ...h.authority, projectId: "p_inkline1", watch: input({ id: "w_fixture1" }) }), { code: "PROJECT_MISMATCH" });
  await assert.rejects(h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: input({ id: "w_unknown1" }) }), { code: "UNKNOWN_WATCH" },
    "an unknown id is refused, never created");
  await h.services.removeWatch({ ...h.authority, id: "w_fixture1", projectId: "p_harbor1" });
  await assert.rejects(h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: input({ id: "w_fixture1" }) }), { code: "UNKNOWN_WATCH" },
    "a stale edit never recreates a removed watch");
  assert.deepEqual(h.stored(), []);
});

test("services: the action's current check runs again inside the serialized write; a lost lifetime or a project change writes nothing", { skip }, async () => {
  const h = servicesHarness();
  // The predicate holds for the checks before the write and fails at the one inside it.
  let checks = 0;
  const flaky = { window: h.zen.window, current: () => ++checks <= 3 };
  await assert.rejects(h.services.saveWatch({ ...flaky, projectId: "p_harbor1", watch: input() }), { code: "DOCUMENT_GONE" });
  assert.equal(checks, 4, "the fourth check was the one inside the write");
  assert.deepEqual([h.stored(), h.writes.filter(name => name === "watches.json")], [[], []], "nothing was written");
  // A project mutation that starts after the checks before the write moves its mark: refused inside the write.
  let started = 0;
  const moving = { window: h.zen.window, current: () => {
    if (++started === 3) void h.services.setAccountLabel("p_harbor1", { key: "vercel", label: "Work" });
    return true;
  } };
  await assert.rejects(h.services.saveWatch({ ...moving, projectId: "p_harbor1", watch: input() }), { code: "PROJECT_CHANGED" });
  assert.deepEqual(h.stored(), []);
  assert.deepEqual(h.services.getWatchStatus().last_error, { action: "save", code: "PROJECT_CHANGED", watch_id: null });
  // An already-ended lifetime or an unknown window is refused before anything.
  await assert.rejects(h.services.saveWatch({ window: h.zen.window, current: () => false, projectId: "p_harbor1", watch: input() }), { code: "DOCUMENT_GONE" });
  await assert.rejects(h.services.saveWatch({ window: { other: true }, current: () => true, projectId: "p_harbor1", watch: input() }), { code: "NO_WINDOW" });
  const ended = new AbortController();
  ended.abort();
  await h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: input({ observation: "address", consent: true }) });
  await assert.rejects(h.services.checkWatch({ ...h.authority, signal: ended.signal, id: "w_fixture3", projectId: "p_harbor1" }), { code: "DOCUMENT_GONE" });
  assert.equal(h.stored()[0].latest_result, null, "no check ran for a lifetime that already ended");
});

test("services: manual actions are serialized; a removal queued after an edit, or an edit after a removal, never resurrects a watch", { skip }, async () => {
  const h = servicesHarness();
  await h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: input() });
  const remove = h.services.removeWatch({ ...h.authority, id: "w_fixture1", projectId: "p_harbor1" });
  const edit = h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: input({ id: "w_fixture1", question: "Late edit?" }) });
  await remove;
  await assert.rejects(edit, { code: "UNKNOWN_WATCH" });
  assert.deepEqual(h.stored(), []);
  await assert.rejects(h.services.removeWatch({ ...h.authority, id: "w_fixture1", projectId: "p_harbor1" }), { code: "UNKNOWN_WATCH" });
});

const dueWatch = () => input({ observation: "address", consent: true, intervalMinutes: 1 });
const stopWatches = h => h.shutdown.filter(entry => entry.label === "AxioSozo: stop watches");

test("services: one process schedule starts once, only with its shutdown owner; scheduled checks record NOT_AUTHORIZED, send nothing and announce 'watches'", { skip }, async () => {
  const h = servicesHarness();
  assert.deepEqual({ ...h.services.getWatchDiagnostics() }, { created: false, owned: false, scheduled: false, closed: false, busy: false, shutdown: null },
    "reading diagnostics creates nothing");
  await h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: dueWatch() });
  assert.equal(h.services.getWatchStatus().scheduled, false, "nothing is scheduled before an admitted window starts it");
  h.events.length = 0;
  const first = h.services.startWatchScheduler();
  assert.equal(h.services.startWatchScheduler(), first, "one schedule per process, however many windows start");
  assert.equal(await first, true);
  assert.equal(stopWatches(h).length, 1, "one shutdown registration");
  assert.deepEqual([h.services.getWatchDiagnostics().owned, h.services.getWatchDiagnostics().scheduled, h.services.getWatchStatus().scheduled], [true, true, true]);
  assert.ok(h.fireTimer(), "armed for the due watch");
  await flush();
  const [record] = h.stored();
  assert.deepEqual([record.latest_result.reason, record.latest_result.outcome, record.latest_result.data_sent], ["NOT_AUTHORIZED", "unknown", false]);
  const last = h.services.getWatchStatus().last;
  assert.deepEqual([last.code, last.data_sent, last.watch_id], ["NOT_AUTHORIZED", false, "w_fixture1"]);
  assert.ok(h.events.includes("watches"), "the scheduled write is announced to pages");
  assert.equal(h.host.factory, 0, "no provider host");
  // No page or actor API starts or stops it.
  for (const names of [Object.keys(METHODS), Object.keys(USER_ACTIONS), Object.values(MESSAGES)]) {
    assert.ok(!names.some(name => /schedul|startWatch|stopWatch/iu.test(name)), names.join(","));
  }
  // Profile shutdown: the schedule ends with intake; what it reports is the controller's own status.
  await stopWatches(h)[0].fn();
  const after = h.services.getWatchDiagnostics();
  assert.deepEqual([after.scheduled, after.closed, after.busy, after.shutdown], [false, true, false, "settled"]);
  assert.equal(h.fireTimer(), false, "no armed schedule remains");
  await assert.rejects(h.services.checkWatch({ ...h.authority, id: "w_fixture1", projectId: "p_harbor1" }), { code: "CLOSED" });
  assert.equal(await h.services.startWatchScheduler(), true, "asking again starts no second schedule");
  assert.equal(h.services.getWatchStatus().scheduled, false);
});

test("services: without a registered shutdown owner the schedule never starts", { skip }, async () => {
  for (const shutdownOwner of ["missing"]) {
    const h = servicesHarness({ shutdownOwner });
    await h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: dueWatch() });
    assert.equal(await h.services.startWatchScheduler(), false);
    const diagnostics = h.services.getWatchDiagnostics();
    assert.deepEqual([diagnostics.owned, diagnostics.scheduled], [false, false]);
    assert.equal(h.fireTimer(), false, "nothing armed");
    assert.equal(h.stored()[0].latest_result, null);
  }
});

test("services: shutdown disposes first, then joins the owned work in flight, and reports its status, never a cleanup success", { skip }, async () => {
  const h = servicesHarness();
  await h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: dueWatch() });
  await h.services.startWatchScheduler();
  const gate = h.holdWrite();
  h.fireTimer();
  await flush();
  assert.equal(h.services.getWatchStatus().busy, true, "a scheduled check is writing its result");
  let stopped = false;
  const stop = Promise.resolve(stopWatches(h)[0].fn()).then(() => { stopped = true; });
  await flush();
  const during = h.services.getWatchDiagnostics();
  assert.deepEqual([during.closed, during.scheduled, during.shutdown, stopped], [true, false, null, false], "intake stopped at once; the work is joined, not abandoned");
  gate.resolve();
  await stop;
  const after = h.services.getWatchDiagnostics();
  assert.deepEqual([after.busy, after.shutdown], [false, "settled"]);
});

test("services: a check's signal belongs to its own run: aborting it cancels only that run, never the schedule's work", { skip }, async () => {
  // Its own run, persisting, is cancelled by its own signal.
  const own = servicesHarness();
  await own.services.saveWatch({ ...own.authority, projectId: "p_harbor1", watch: dueWatch() });
  const gate = own.holdWrite();
  const ended = new AbortController();
  const check = own.services.checkWatch({ ...own.authority, signal: ended.signal, id: "w_fixture1", projectId: "p_harbor1" });
  await flush();
  assert.equal(own.services.getWatchStatus().busy, true);
  ended.abort();
  gate.resolve();
  const report = await check;
  assert.deepEqual([report.code, report.data_sent], ["cancelled", false]);
  assert.deepEqual(own.services.getWatchStatus().last_error, { action: "check", code: "CHECK_CANCELLED", watch_id: "w_fixture1" });
  // The schedule's work in flight: another window's check is refused BUSY, and
  // aborting that check's signal at any point leaves the scheduled work alone.
  for (const rounds of [0, 2, 6, 40]) {
    const h = servicesHarness();
    await h.services.saveWatch({ ...h.authority, projectId: "p_harbor1", watch: dueWatch() });
    await h.services.startWatchScheduler();
    const held = h.holdWrite();
    h.fireTimer();
    await flush();
    assert.equal(h.services.getWatchStatus().busy, true);
    const page = new AbortController();
    const manual = h.services.checkWatch({ ...h.authority, signal: page.signal, id: "w_fixture1", projectId: "p_harbor1" }).then(r => r.code, e => e.code);
    await settle(rounds);
    page.abort();
    const code = await manual;
    assert.ok(["BUSY", "DOCUMENT_GONE", "cancelled"].includes(code), `${rounds}: ${code}`);
    held.resolve();
    await flush();
    assert.deepEqual([h.services.getWatchStatus().last.code, h.stored()[0].latest_result?.reason], ["NOT_AUTHORIZED", "NOT_AUTHORIZED"],
      `${rounds}: the scheduled check finished as itself, not cancelled`);
  }
  const source = readFileSync(new URL("../chrome/AxioSozoServices.sys.mjs", import.meta.url), "utf8");
  const body = source.slice(source.indexOf("  async checkWatch("), source.indexOf("  async retryWatchCleanup("));
  assert.match(body, /controller\.run\(\{ id \}, signal \? \{ signal \} : undefined\)/u);
  assert.doesNotMatch(body, /\.cancel\(|addEventListener|status\(\)\.busy/u, "no global busy/cancel wrapper");
});

// ---------------------------------------------------------------- the page

const HARBOR = { ...project("p_harbor1"), manifest: { ...MANIFEST, name: "Harbor Suite" } };
let serialPage = 0;

/** A watch record as the browser stores it (contexts core createWatch). */
function storedWatch(patch = {}, result = null) {
  const base = core.createWatch({ id: "w_fixture1", projectId: "p_harbor1", url: "https://status.example/deploy", question: "Is the deploy finished?",
    outcomes: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }], now: 1000, userCreated: true, observation: "address", consent: true, ...patch });
  return result ? { ...structuredClone(base), schedule: { ...base.schedule, last_checked_at: 2000 }, updated_at: 2000,
    latest_result: { request_id: "wreq_fixture1", checked_at: 2000, outcome: "unknown", reason: "NOT_AUTHORIZED", confidence: null, data_sent: false, provider: "jev", ...result } }
    : structuredClone(base);
}
const idleStatus = (patch = {}) => ({ closed: false, scheduled: false, loaded: true, busy: false, phase: null, cleanup_required: false,
  recovery_required: false, retry_allowed: false, pending_disclosure: false, last: null, last_error: null, residual: null, ...patch });

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

async function loadPage({ hash = "#project=p_harbor1", watches = [], status = idleStatus(), handlers = {}, actionReply } = {}) {
  const document = parseHtml(HTML);
  document.documentURI = `about:axiosozo${hash}`;
  const backend = { watches: structuredClone(watches), status: structuredClone(status) };
  const defaults = {
    getOverviewFlags: () => ({ contexts: true, enginePreferences: false, jevKeyEntry: true }),
    activeContext: () => ({ uuid: null }), listContexts: () => [], listProjects: () => [structuredClone(HARBOR)],
    listProjectContainers: () => [], serviceStatus: () => [], listRules: () => [], usageSummary: () => [], listOrphans: () => [],
    needsAttention: () => [], getJevSettings: () => ({ consent: false, interval_minutes: 5, hourly_budget: 30 }),
    getUnderstandState: () => ({ authorization: "NOT_AUTHORIZED", mode: "PRODUCTION", clis: [], jobs: [] }),
    getProjectHome: ({ id }) => {
      if (id !== "p_harbor1") throw { code: "UNKNOWN_PROJECT" };
      const { container: _c, ...record } = structuredClone(HARBOR);
      return { version: 1, project: record, space: null, container: { state: "pending" }, agent_activity: null, console_errors: null };
    },
    listWatches: () => structuredClone(backend.watches), getWatchStatus: () => structuredClone(backend.status),
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
  await import(`../chrome/overview/about-axiosozo.mjs?watches=${++serialPage}`);
  await flush();
  const $ = id => document.getElementById(id);
  const emit = async name => { actor.emit(name); await new Promise(resolve => setTimeout(resolve, 130)); await flush(); };
  // A trusted activation as Gecko delivers it to the real actor child and the
  // page's own handlers, in native order (geckoClick).
  const section = () => $("project-home").querySelector('[data-section="watches"]');
  return { document, calls: actor.calls, backend, $, emit, activate: actor.activate, actor, section,
    fire: async (type, event = {}) => { actor.listeners.get(type)?.(event); await flush(); },
    names: () => actor.calls.map(([name]) => name) };
}
const typeInto = (node, value) => { node.value = value; node.dispatchEvent(makeEvent("input")); };

test("page: the project home lists its own watches with their saved, historical results; nothing reads as a current check", { skip }, async () => {
  const other = { ...storedWatch({ id: "w_fixture2", projectId: "p_inkline1" }) };
  const page = await loadPage({ watches: [storedWatch({}, {}), storedWatch({ id: "w_fixture3", question: "<b>Is it <i>bold</i>?</b>", observation: "none", consent: false }), other] });
  const section = page.section();
  assert.equal(section.querySelector("h3").textContent, "Watches");
  const rows = section.querySelectorAll("li.watch-row");
  assert.deepEqual(rows.map(row => row.id), ["watch-w_fixture1", "watch-w_fixture3"], "this project's watches only");
  const [first, second] = rows;
  assert.equal(first.querySelector("h4").textContent, "Is the deploy finished?");
  assert.equal(first.querySelector(".watch-page").textContent, "status.example/deploy");
  assert.match(first.querySelector(".watch-result").textContent, /^Not checked: live checks are not authorized in this build · .* · Nothing was sent\.$/u);
  assert.equal(first.querySelector(".watch-result").getAttribute("data-tone"), "info");
  assert.match(first.textContent, /Answers: Yes, No/u);
  const check = first.querySelector('button[data-watch-action="check"]');
  assert.deepEqual([check.textContent, check.getAttribute("data-watch-id"), check.getAttribute("type")], ["Check now", "w_fixture1", "button"]);
  assert.equal(second.querySelector("h4").textContent, "<b>Is it <i>bold</i>?</b>", "page text stays text");
  assert.equal(second.querySelector("b"), null);
  assert.equal(second.querySelector('button[data-watch-action="check"]'), null, "a watch that observes nothing offers no check");
  assert.equal(second.querySelector(".watch-schedule").textContent, "Observes nothing yet, so it is never checked");
  assert.equal(second.querySelector(".watch-result").textContent, "Not checked yet");
  assert.match(section.querySelector(".footnote").textContent, /Live checks are not authorized in this build/u);
  assert.doesNotMatch(page.$("project-home").textContent, /\bnull\b|\bundefined\b|\[object /u);
  for (const name of ["saveWatch", "removeWatch", "checkWatch", "retryWatchCleanup"]) assert.ok(!page.names().includes(name), name);
});

test("page: the empty state, an unavailable list and a busy controller are honest and calm", { skip }, async () => {
  const empty = await loadPage();
  assert.match(empty.section().textContent, /No watches yet\./u);
  assert.ok(empty.section().querySelector('button[data-focus-key="project:p_harbor1:watches:new"]'));
  assert.deepEqual(empty.$("project-home").querySelectorAll("section.home-section h3").map(h3 => h3.textContent),
    ["Environments and links", "Services and sign-ins", "Activity", "Watches", "About this project"], "just above what the project is");
  const older = await loadPage({ handlers: { listWatches: () => { throw { code: "UNKNOWN_METHOD" }; } } });
  assert.equal(older.section(), null, "a browser without watches shows no Watches section");
  const refused = await loadPage({ handlers: { listWatches: () => { throw { code: "PRIVATE_WINDOW" }; } } });
  assert.equal(refused.section().querySelector("p").textContent, "Watches cannot be shown right now.");
  assert.equal(refused.section().querySelectorAll("button").length, 0, "nothing to act on while unreadable");
  const busy = await loadPage({ watches: [storedWatch()], status: idleStatus({ busy: true, phase: "provider", pending_disclosure: true }) });
  assert.match(busy.section().querySelector(".watch-status").textContent, /Waiting for the answer…/u);
  assert.match(busy.section().querySelector(".watch-status").textContent, /Data may have left this Mac for the running check/u);
  assert.equal(busy.section().querySelector('button[data-watch-action="check"]').getAttribute("aria-disabled"), "true");
});

test("page: the editor's authored controls are what the actor reads; Save stays inactive until the form is valid", { skip }, async () => {
  const page = await loadPage();
  page.section().querySelector('button[data-focus-key="project:p_harbor1:watches:new"]').click();
  await flush();
  assert.equal(page.$("sheet").open, true);
  const form = page.$(WATCH_CONTROLS.form);
  assert.deepEqual([form.getAttribute("data-project-id"), form.hasAttribute("data-watch-id")], ["p_harbor1", false]);
  const save = page.$(WATCH_CONTROLS.save);
  assert.deepEqual([save.textContent, save.getAttribute("aria-disabled")], ["Add watch", "true"]);
  assert.equal(page.$(WATCH_CONTROLS.observation).value, "none", "observes nothing by default");
  assert.deepEqual([page.$(WATCH_CONTROLS.provider).value, page.$(WATCH_CONTROLS.consent).checked, page.$(WATCH_CONTROLS.enabled).checked,
    page.$(WATCH_CONTROLS.interval).value], ["jev", false, true, "5"]);
  for (const id of [WATCH_CONTROLS.url, WATCH_CONTROLS.question, WATCH_CONTROLS.observation, WATCH_CONTROLS.provider, WATCH_CONTROLS.interval]) {
    assert.ok(page.document.querySelector(`label[for="${id}"]`), `${id} has a label`);
  }
  // Clicking an invalid form explains, and the actor sends nothing.
  assert.equal(page.activate(save), null);
  assert.ok(page.$("sheet-body").querySelector(".errors li"));
  typeInto(page.$(WATCH_CONTROLS.url), "https://status.example/deploy");
  const question = page.$(WATCH_CONTROLS.question);
  const enter = makeEvent("keydown", { key: "Enter" });
  question.dispatchEvent(enter);
  assert.equal(enter.defaultPrevented, true, "the question stays on one line");
  typeInto(question, "Is the deploy\nfinished?");
  assert.equal(question.value, "Is the deploy finished?");
  typeInto(page.$(`${WATCH_CONTROLS.outcomeLabel}1`), "Unknown");
  assert.equal(page.$(`${WATCH_CONTROLS.outcomeId}1`).value, "unknown_answer", "the reserved id is never derived");
  [...page.$("sheet-body").querySelectorAll("button")].find(button => button.textContent === "Add an answer").click();
  typeInto(page.$(`${WATCH_CONTROLS.outcomeLabel}2`), "Yes");
  assert.equal(save.getAttribute("aria-disabled"), "true", "two answers with the same label");
  typeInto(page.$(`${WATCH_CONTROLS.outcomeLabel}2`), "Rolled back");
  assert.equal(page.$(`${WATCH_CONTROLS.outcomeId}2`).value, "rolled_back");
  assert.equal(save.hasAttribute("aria-disabled"), false);
  const before = page.calls.length;
  const action = page.activate(save);
  assert.deepEqual(action, { name: MESSAGES.SAVE_WATCH, event: "watches", data: { projectId: "p_harbor1", watch: {
    url: "https://status.example/deploy", question: "Is the deploy finished?",
    outcomes: [{ id: "yes", label: "Yes" }, { id: "unknown_answer", label: "Unknown" }, { id: "rolled_back", label: "Rolled back" }],
    observation: "none", provider: "jev", consent: false, enabled: true, intervalMinutes: 5 } } });
  assert.doesNotThrow(() => USER_ACTIONS[action.name].parse(structuredClone(action.data)), "exactly the parent's closed params");
  assert.deepEqual(page.calls.slice(before), [], "the page itself sends nothing");
  assert.deepEqual([save.textContent, save.getAttribute("aria-disabled")], ["Saving…", "true"]);
  assert.equal(page.activate(save), null, "a second press while saving starts nothing");
  // The browser saved exactly that (its own actor and services), then told the page.
  page.backend.watches.push(storedWatch({ outcomes: action.data.watch.outcomes, observation: "none", consent: false }));
  await page.emit("watches");
  // The list shows it, but a name-only "watches" event cannot say whose save it was.
  assert.ok(page.section().querySelector("#watch-w_fixture1"), "the list's current state");
  assert.equal(page.$("sheet").open, true, "the entry is never closed on a matching record alone");
  assert.match(page.$("status").textContent, /^A watch with exactly these details is now in the list, from this Save or another window/u);
  assert.notEqual(page.$("status").textContent, "Watch added.");
  const note = page.$("sheet-body").querySelector('p[role="status"]');
  assert.equal([note.hidden, note.textContent === page.$("status").textContent].join(), "false,true");
  assert.equal(page.$(WATCH_CONTROLS.question).value, "Is the deploy finished?", "the entry is kept");
  assert.equal(save.hasAttribute("aria-disabled"), false, "and stays editable");
});

test("page: Save is never confirmed from the list: a record with exactly its fields is current state; another window's change, a duplicate or silence stays unconfirmed and editable", { skip }, async () => {
  // Edit: the baseline is the revision the browser reported when Save was clicked.
  const page = await loadPage({ watches: [storedWatch()] });
  const openEditor = async () => {
    const row = page.section().querySelector("#watch-w_fixture1");
    row.querySelector("details.menu summary").click();
    [...row.querySelectorAll(".menu-items button")].find(button => button.textContent === "Edit…").click();
    await flush();
  };
  await openEditor();
  // Meanwhile another window edited the same watch (revision 2) and this page heard it.
  page.backend.watches = [{ ...storedWatch(), revision: 2, question: "Is the deploy done?" }];
  await page.emit("watches");
  typeInto(page.$(WATCH_CONTROLS.question), "Is it live?");
  const save = page.$(WATCH_CONTROLS.save);
  assert.equal(page.activate(save).data.watch.question, "Is it live?");
  // A third window's different edit lands instead of this one (revision 3).
  page.backend.watches = [{ ...storedWatch(), revision: 3, question: "Something else?" }];
  await page.emit("watches");
  assert.equal(page.$("sheet").open, true, "never closed as saved");
  assert.match(page.$("sheet-body").querySelector(".errors").textContent, /changed elsewhere meanwhile, so your save is not confirmed/u);
  assert.equal(page.$(WATCH_CONTROLS.question).value, "Is it live?", "the user's edits are still there");
  assert.equal(save.hasAttribute("aria-disabled"), false, "and Save can be pressed again");
  assert.notEqual(page.$("status").textContent, "Watch saved.");
  // This time the list has exactly this edit at a newer revision: shown as the
  // watch's current state, never as this Save's completion.
  page.activate(save);
  page.backend.watches = [{ ...storedWatch(), revision: 4, question: "Is it live?" }];
  await page.emit("watches");
  assert.equal(page.$("sheet").open, true);
  assert.match(page.$("status").textContent, /^This watch now has exactly these details, from this Save or another window/u);
  assert.equal(page.$("sheet-body").querySelector(".errors").textContent, "", "not an error either");
  assert.equal(page.$(WATCH_CONTROLS.question).value, "Is it live?");
  [...page.$("sheet").querySelectorAll("button")].find(button => button.textContent === "Cancel").click();
  await flush();

  // A fresh refusal wins even when a matching record is listed.
  await openEditor();
  typeInto(page.$(WATCH_CONTROLS.question), "Refused?");
  page.activate(page.$(WATCH_CONTROLS.save));
  page.backend.watches = [{ ...storedWatch(), revision: 5, question: "Refused?" }];
  page.backend.status = idleStatus({ last_error: { action: "save", code: "STORAGE_ERROR", watch_id: "w_fixture1" } });
  await page.emit("watches");
  assert.equal(page.$("sheet").open, true);
  assert.match(page.$("sheet-body").querySelector(".errors").textContent, /Saving the watches on this Mac failed, so the change is not confirmed/u);
  page.$("sheet").close();

  // New: two identical new watches (this window's and another's) are not "added".
  const fresh = await loadPage();
  fresh.section().querySelector('button[data-focus-key="project:p_harbor1:watches:new"]').click();
  await flush();
  typeInto(fresh.$(WATCH_CONTROLS.url), "https://status.example/deploy?token=x");
  typeInto(fresh.$(WATCH_CONTROLS.question), "Is the deploy finished?");
  const added = fresh.activate(fresh.$(WATCH_CONTROLS.save));
  const twin = id => storedWatch({ id, url: "https://status.example/deploy", outcomes: added.data.watch.outcomes, observation: "none", consent: false });
  fresh.backend.watches = [twin("w_fixture7"), twin("w_fixture8")];
  await fresh.emit("watches");
  assert.equal(fresh.$("sheet").open, true);
  assert.match(fresh.$("sheet-body").querySelector(".errors").textContent, /More than one matching watch appeared/u);
  // A different new watch from another window only: no answer yet, then unconfirmed at the deadline.
  fresh.activate(fresh.$(WATCH_CONTROLS.save));
  fresh.backend.watches.push(storedWatch({ id: "w_fixture9", question: "Another window's?", observation: "none", consent: false }));
  await fresh.emit("watches");
  assert.equal(fresh.$("sheet").open, true, "not this save");
  await new Promise(resolve => setTimeout(resolve, 2600));
  await flush();
  assert.equal(fresh.$("sheet").open, true);
  assert.match(fresh.$("sheet-body").querySelector(".errors").textContent, /has not confirmed this save/u);
  assert.equal(fresh.$(WATCH_CONTROLS.save).hasAttribute("aria-disabled"), false, "still editable");
});

test("page: while this page's Save is still held, another window's identical record is current state only; this Save's later refusal still takes over", { skip }, async () => {
  // New watch: this page's Save is queued in the browser; another window
  // publishes exactly the same watch and the generic "watches" event arrives.
  const page = await loadPage();
  page.section().querySelector('button[data-focus-key="project:p_harbor1:watches:new"]').click();
  await flush();
  typeInto(page.$(WATCH_CONTROLS.url), "https://status.example/deploy");
  typeInto(page.$(WATCH_CONTROLS.question), "Is the deploy finished?");
  const save = page.$(WATCH_CONTROLS.save);
  const mine = page.activate(save);
  page.backend.watches = [storedWatch({ id: "w_fixture5", outcomes: mine.data.watch.outcomes, observation: "none", consent: false })];
  await page.emit("watches");
  assert.ok(page.section().querySelector("#watch-w_fixture5"), "the list shows the other window's watch");
  assert.equal(page.$("sheet").open, true, "not closed: this click is not known to be done");
  assert.notEqual(page.$("status").textContent, "Watch added.");
  assert.match(page.$("sheet-body").querySelector('p[role="status"]').textContent, /from this Save or another window; AxioSozo cannot tell which/u);
  assert.equal(page.$(WATCH_CONTROLS.question).value, "Is the deploy finished?", "nothing typed is discarded");
  // The held Save is then refused (for example the limit was reached meanwhile): that refusal is shown.
  page.backend.status = idleStatus({ last_error: { action: "save", code: "WATCH_LIMIT", watch_id: null } });
  await page.emit("watches");
  assert.equal(page.$("sheet").open, true);
  assert.equal(page.$("sheet-body").querySelector(".errors").textContent, M.watchActionText("WATCH_LIMIT"));
  assert.equal(page.$("sheet-body").querySelector('p[role="status"]').hidden, true, "the current-state note gives way to the refusal");
  assert.equal(save.hasAttribute("aria-disabled"), false);

  // Edit: the same for a newer identical revision published by another window;
  // a held Save that never refuses ends its wait quietly at its deadline.
  const edit = await loadPage({ watches: [storedWatch()] });
  const row = edit.section().querySelector("#watch-w_fixture1");
  row.querySelector("details.menu summary").click();
  [...row.querySelectorAll(".menu-items button")].find(button => button.textContent === "Edit…").click();
  await flush();
  typeInto(edit.$(WATCH_CONTROLS.question), "Is it live?");
  edit.activate(edit.$(WATCH_CONTROLS.save));
  edit.backend.watches = [{ ...storedWatch(), revision: 2, question: "Is it live?" }];
  await edit.emit("watches");
  assert.equal(edit.$("sheet").open, true);
  assert.notEqual(edit.$("status").textContent, "Watch saved.");
  const noted = edit.$("status").textContent;
  assert.match(noted, /^This watch now has exactly these details/u);
  await new Promise(resolve => setTimeout(resolve, 2600));
  await edit.emit("watches");
  assert.deepEqual([edit.$("sheet").open, edit.$("status").textContent, edit.$("sheet-body").querySelector(".errors").textContent], [true, noted, ""],
    "no late success and no invented failure");
  assert.equal(edit.$(WATCH_CONTROLS.question).value, "Is it live?");
});

test("page: a refused save keeps the editor open with the browser's categorical reason; an edit names its own id", { skip }, async () => {
  const page = await loadPage({ watches: [storedWatch()] });
  const row = page.section().querySelector("#watch-w_fixture1");
  row.querySelector("details.menu summary").click();
  [...row.querySelectorAll(".menu-items button")].find(button => button.textContent === "Edit…").click();
  await flush();
  assert.equal(page.$(WATCH_CONTROLS.form).getAttribute("data-watch-id"), "w_fixture1");
  assert.equal(page.$(WATCH_CONTROLS.save).textContent, "Save watch");
  typeInto(page.$(WATCH_CONTROLS.question), "Is it live?");
  const action = page.activate(page.$(WATCH_CONTROLS.save));
  assert.equal(action.data.watch.id, "w_fixture1");
  page.backend.status = idleStatus({ last_error: { action: "save", code: "PROJECT_CHANGED", watch_id: "w_fixture1" } });
  await page.emit("watches");
  assert.equal(page.$("sheet").open, true);
  assert.equal(page.$("sheet-body").querySelector(".errors").textContent, "The project was changing. Try again in a moment.");
  assert.equal(page.$(WATCH_CONTROLS.save).hasAttribute("aria-disabled"), false, "it can be tried again");
});

test("page: Check now and removal are the actor's trusted clicks; the outcome shown is the browser's report", { skip }, async () => {
  const page = await loadPage({ watches: [storedWatch()] });
  const check = page.section().querySelector('button[data-watch-action="check"]');
  assert.deepEqual(page.activate(check), { name: MESSAGES.CHECK_WATCH, data: { id: "w_fixture1" }, event: "watches" });
  await flush();
  assert.equal(page.section().querySelector('button[data-watch-action="check"]').textContent, "Checking…");
  page.backend.watches = [storedWatch({}, { request_id: "wreq_fixture9" })];
  page.backend.status = idleStatus({ last: { code: "NOT_AUTHORIZED", watch_id: "w_fixture1", request_id: "wreq_fixture9", data_sent: false, persisted: true } });
  await page.emit("watches");
  assert.equal(page.section().querySelector(".watch-notice").textContent, "Recorded: not checked, because live checks are not authorized in this build. Nothing was sent.");
  // Not due: its own category, never a check.
  page.activate(page.section().querySelector('button[data-watch-action="check"]'));
  page.backend.status = idleStatus({ last: page.backend.status.last, last_error: { action: "check", code: "NOT_DUE", watch_id: "w_fixture1" } });
  await page.emit("watches");
  assert.equal(page.section().querySelector(".watch-notice").textContent, "Not checked: it was checked less than its interval ago.");
  // Removal asks first, inline; Keep puts focus back.
  const row = page.section().querySelector("#watch-w_fixture1");
  row.querySelector("details.menu summary").click();
  [...row.querySelectorAll(".menu-items button")].find(button => button.textContent === "Remove…").click();
  await flush();
  const confirm = page.section().querySelector(".watch-confirm");
  assert.ok(confirm);
  assert.equal(page.document.activeElement?.textContent, "Keep", "the safe choice has focus");
  const remove = confirm.querySelector('button[data-watch-action="remove"]');
  assert.deepEqual([remove.textContent, remove.getAttribute("data-watch-id")], ["Remove watch", "w_fixture1"]);
  assert.deepEqual(page.activate(remove), { name: MESSAGES.REMOVE_WATCH, data: { id: "w_fixture1" }, event: "watches" });
  page.backend.watches = [];
  await page.emit("watches");
  assert.equal(page.section().querySelector("#watch-w_fixture1"), null);
  assert.equal(page.$("status").textContent, "Watch removed.");
  assert.equal(page.document.activeElement?.getAttribute("data-focus-key"), "project:p_harbor1:watches:new", "focus stays in the section");
  for (const name of ["saveWatch", "removeWatch", "checkWatch"]) assert.ok(!page.names().includes(name), name);
});

test("page: a blocking cleanup offers Retry only when the browser allows it; a refused page shows nothing to act on", { skip }, async () => {
  const blocked = await loadPage({ watches: [storedWatch()], status: idleStatus({ cleanup_required: true, retry_allowed: true,
    residual: null, last: { code: "CLEANUP_REQUIRED", watch_id: "w_fixture1", request_id: "wreq_x1", data_sent: true, disclosure: "conservative" } }) });
  const problem = blocked.section().querySelector(".watch-problem");
  assert.match(problem.textContent, /could not finish its cleanup/u);
  const retry = blocked.$(WATCH_CONTROLS.retry);
  assert.equal(retry.textContent, "Retry cleanup");
  assert.equal(blocked.section().querySelector('button[data-watch-action="check"]').getAttribute("aria-disabled"), "true", "no new check while blocked");
  assert.deepEqual(blocked.activate(retry), { name: MESSAGES.RETRY_WATCH_CLEANUP, data: {}, event: "watches" });
  blocked.backend.status = idleStatus();
  await blocked.emit("watches");
  assert.equal(blocked.section().querySelector(".watch-problem"), null);
  const recovery = await loadPage({ watches: [storedWatch()], status: idleStatus({ recovery_required: true, retry_allowed: false,
    residual: { watch_id: "w_fixture1", request_id: "wreq_x1", revision: 1 } }) });
  assert.equal(recovery.$(WATCH_CONTROLS.retry), null, "no Retry the browser does not allow");
  assert.match(recovery.section().querySelector(".watch-problem").textContent, /Restart AxioSozo if this stays\./u);
});

test("page: hidden while an action waits, nothing continues; the restored page reads the watches afresh", { skip }, async () => {
  const page = await loadPage({ watches: [storedWatch()] });
  page.activate(page.section().querySelector('button[data-watch-action="check"]'));
  await page.fire("pagehide");
  const at = page.calls.length;
  await new Promise(resolve => setTimeout(resolve, 2700));
  assert.deepEqual(page.calls.slice(at), [], "no read while hidden, not even when the wait expired");
  await page.fire("pageshow", { persisted: true });
  await flush(12);
  assert.ok(page.calls.slice(at).some(([name]) => name === "listWatches"));
  assert.equal(page.section().querySelector('button[data-watch-action="check"]').textContent, "Check now", "no stale pending state");
});

// ---------------------------------------------------------------- native activation order

test("native order: Save, Check now, Remove and Retry are read before the page's own handlers change their controls", { skip }, async () => {
  assert.deepEqual({ ...CLICK_OPTIONS }, { capture: true }, "the default group's capture phase, never the system group");
  // Save: the page's own handler marks the very button Saving… and inactive in that same dispatch.
  const editor = await loadPage();
  editor.section().querySelector('button[data-focus-key="project:p_harbor1:watches:new"]').click();
  await flush();
  typeInto(editor.$(WATCH_CONTROLS.url), "https://status.example/deploy");
  typeInto(editor.$(WATCH_CONTROLS.question), "Is the deploy finished?");
  const save = editor.$(WATCH_CONTROLS.save);
  const saved = editor.activate(save);
  assert.deepEqual([saved.name, saved.data.projectId, saved.data.watch.url, saved.data.watch.question],
    [MESSAGES.SAVE_WATCH, "p_harbor1", "https://status.example/deploy", "Is the deploy finished?"]);
  assert.deepEqual([save.textContent, save.getAttribute("aria-disabled")], ["Saving…", "true"], "changed by the page after the actor read it");
  assert.equal(editor.activate(save), null, "and so a second press sends nothing");
  assert.equal(editor.actor.actions.length, 1);

  // Check now, answered by the browser: the actor lets the page hear "watches" and it shows the report.
  let page;
  page = await loadPage({ watches: [storedWatch()], actionReply: async name => {
    if (name === MESSAGES.CHECK_WATCH) {
      page.backend.watches = [storedWatch({}, { request_id: "wreq_fixture9" })];
      page.backend.status = idleStatus({ last: { code: "NOT_AUTHORIZED", watch_id: "w_fixture1", request_id: "wreq_fixture9", data_sent: false, persisted: true } });
    }
    return { ok: true, value: {} };
  } });
  const check = page.section().querySelector('button[data-watch-action="check"]');
  assert.deepEqual(page.activate(check), { name: MESSAGES.CHECK_WATCH, data: { id: "w_fixture1" }, event: "watches" });
  await new Promise(resolve => setTimeout(resolve, 150));
  await flush();
  assert.equal(page.section().querySelector(".watch-notice").textContent,
    "Recorded: not checked, because live checks are not authorized in this build. Nothing was sent.");

  // Remove, from its confirmation; the page then marks it Removing… and inactive.
  const removing = await loadPage({ watches: [storedWatch()] });
  const row = removing.section().querySelector("#watch-w_fixture1");
  row.querySelector("details.menu summary").click();
  [...row.querySelectorAll(".menu-items button")].find(button => button.textContent === "Remove…").click();
  await flush();
  const remove = removing.section().querySelector('.watch-confirm button[data-watch-action="remove"]');
  assert.deepEqual(removing.activate(remove), { name: MESSAGES.REMOVE_WATCH, data: { id: "w_fixture1" }, event: "watches" });
  await flush();
  assert.equal(removing.activate(removing.section().querySelector('.watch-confirm button[data-watch-action="remove"]')), null, "no second removal while it waits");

  // Retry cleanup, the one fixed control.
  const blocked = await loadPage({ watches: [storedWatch()], status: idleStatus({ cleanup_required: true, retry_allowed: true }) });
  const retry = blocked.$(WATCH_CONTROLS.retry);
  assert.deepEqual(blocked.activate(retry), { name: MESSAGES.RETRY_WATCH_CLEANUP, data: {}, event: "watches" });
  await flush();
  assert.equal(blocked.activate(blocked.$(WATCH_CONTROLS.retry)), null, "no second retry while it waits");
});

test("native order: untrusted, forged and inactive watch controls send nothing", { skip }, async () => {
  const page = await loadPage({ watches: [storedWatch()] });
  const check = page.section().querySelector('button[data-watch-action="check"]');
  // A page-made copy of the row button outside its row.
  const forged = page.document.createElement("button");
  forged.setAttribute("type", "button");
  forged.setAttribute("data-watch-action", "check");
  forged.setAttribute("data-watch-id", "w_fixture1");
  page.section().append(forged);
  assert.equal(page.activate(forged), null, "outside its authored row");
  forged.remove();
  assert.equal(page.activate(check, { isTrusted: false }), null, "a synthesized click");
  assert.equal(page.actor.actions.length, 0);
  // That synthesized click still ran the page's handler: the row now waits and its button is inactive.
  await flush();
  const waiting = page.section().querySelector('button[data-watch-action="check"]');
  assert.equal(waiting.getAttribute("aria-disabled"), "true");
  assert.equal(page.activate(waiting), null, "nothing while the row is inactive");
  // A row the page still shows, for a watch the browser's latest list answer no longer names.
  const other = await loadPage({ watches: [storedWatch()] });
  other.backend.watches = [];
  await other.actor.win.AxioSozoOverview.request("listWatches");
  const stale = other.section().querySelector('button[data-watch-action="check"]');
  assert.ok(other.document.contains(stale), "still rendered");
  assert.equal(other.activate(stale), null, "an id the latest list no longer issued");
  assert.equal(other.actor.actions.length, 0);
});

test("model: forms, answer ids, schedule and result texts follow the contexts core limits", () => {
  assert.deepEqual(M.outcomeKeys(["Yes", "yes", "Unknown", "", "Ça marche", "42"]), ["yes", "yes_2", "unknown_answer", "answer", "ca_marche", "answer_42"]);
  assert.ok(M.outcomeKeys(["x".repeat(80)])[0].length <= 32);
  const form = M.emptyWatchForm();
  assert.deepEqual(M.watchFormErrors(form), ["Enter the page's address, starting with https:// or http://.", "Write the question this watch asks."]);
  assert.deepEqual(M.watchFormErrors({ ...form, url: "https://a.example/x", question: "Up?" }), []);
  assert.ok(M.watchFormErrors({ ...form, url: "https://a.example/x", question: "Up?", outcomes: [{ id: "yes", label: "Yes" }] }).length);
  assert.ok(M.watchFormErrors({ ...form, url: "https://a.example/x", question: "Up?", intervalMinutes: 31 }).length);
  const watch = storedWatch();
  assert.deepEqual(M.watchScheduleView(watch, { now: 5000 }), { state: "due", text: "Can be checked now · every 5 minutes at most" });
  const checked = storedWatch({}, {});
  assert.equal(M.watchScheduleView(checked, { now: 2000 + 60_000 }).text, "Can be checked again in 4 min · every 5 minutes at most");
  assert.deepEqual(M.watchScheduleView(storedWatch({ enabled: false }), {}).state, "off");
  assert.deepEqual(M.watchScheduleView(storedWatch({ consent: false }), {}).state, "no-consent");
  assert.equal(M.watchResultView(null, watch).text, "Not checked yet");
  const answered = { ...checked.latest_result, reason: "validated", outcome: "yes", confidence: 0.92, data_sent: true };
  assert.equal(M.watchResultView(answered, watch).text, "Answer: Yes · 92% sure");
  assert.deepEqual([M.watchResultView(answered, watch, { busy: true }).text, M.watchResultView(answered, watch, { busy: true }).tone],
    ["Earlier answer: Yes · 92% sure", "none"], "never a current answer while another check runs");
  // Cancelled or stale after a possible hand-off: the disclosure stays.
  const cancelled = { code: "cancelled", reason: "cancelled", data_sent: true, disclosure: "conservative" };
  assert.equal(M.watchReportText(cancelled), "Cancelled. Data may have left this Mac.");
  assert.equal(M.watchStatusView(idleStatus({ last: cancelled })).disclosure, "The last check may have sent data to the provider before it ended.");
  assert.equal(M.watchReportText({ code: "NOT_AUTHORIZED", data_sent: false }), "Recorded: not checked, because live checks are not authorized in this build. Nothing was sent.");
  const status = M.watchStatusView(idleStatus({ last_error: { action: "check", code: "BUSY", watch_id: "w_fixture1" } }));
  assert.deepEqual([status.notice.tone, status.notice.text], ["info", "Not checked: another check is still running."]);
  assert.equal(M.watchStatusView(null, { error: "X" }).text, "Watch status cannot be shown right now.");
});
