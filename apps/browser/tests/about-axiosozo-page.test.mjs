/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Runs the real about:axiosozo page script (overview/about-axiosozo.mjs) on the
// real page HTML inside a small Node DOM (support/mini-dom.mjs) with a fake
// window.AxioSozoOverview. Checks the three sections, deep links, the
// add-project review, the decision-key forms and the rule editor's provider and
// screen policy. Synthetic: not evidence of Gecko rendering, layout, VoiceOver
// or light/dark appearance.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Node, parseHtml, makeEvent } from "./support/mini-dom.mjs";
import { decisionKeyEntry } from "../chrome/ProviderStatus.sys.mjs";
import * as M from "../chrome/overview/overview-model.mjs";

const HTML = readFileSync(new URL("../chrome/overview/about-axiosozo.html", import.meta.url), "utf8");
const DRAFT = JSON.parse(readFileSync(new URL("../../../packages/contexts/tests/expected/tauri-plus-web.json", import.meta.url), "utf8"));
const HOME = "{11111111-1111-4111-8111-111111111111}";
const BV = "{22222222-2222-4222-8222-222222222222}";
const SECRET = "synthetic-jev-key-0000";
let serial = 0;

const flush = async (rounds = 6) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setTimeout(resolve, 0)); };

async function loadPage({ hash = "", projects = [], handlers = {}, containers = {}, navigator = undefined } = {}) {
  const document = parseHtml(HTML);
  const calls = [];
  const subscribers = [];
  const state = { projects: [...projects], containers };
  const contexts = [
    { uuid: HOME, name: "Home", icon: "", type: "personal", organization_uuid: null, project_id: null, container: 0 },
    { uuid: BV, name: "Acme BV", icon: "", type: "organization", organization_uuid: null, project_id: null, container: 1, container_label: "Work" }];
  const defaults = {
    getOverviewFlags: () => ({ contexts: true, enginePreferences: false, jevKeyEntry: true }),
    activeContext: () => ({ uuid: HOME }),
    listContexts: () => contexts,
    listProjects: () => state.projects,
    listRules: () => [], getJevSettings: () => ({ consent: false, interval_minutes: 5, hourly_budget: 30 }),
    usageSummary: () => [], listOrphans: () => [], needsAttention: () => [],
    serviceStatus: () => [],
    getDecisionKeyStatus: ({ provider }) => decisionKeyEntry({ provider, key_entry_enabled: true, key: "missing" }),
    getProviderStatus: () => ({ version: 1, discovery: "ok", discovery_error: null, model_turns_verified: false, providers: [
      { id: "codex", label: "Codex", state: "unverified", state_label: "Installed · not yet verified", detail: "Installed (0.157.1).", version: "0.157.1", expected_version: "0.157.1" },
      { id: "claude-code", label: "Claude Code", state: "not-installed", state_label: "Not installed", detail: "The official Claude Code client was not found." },
      { id: "antigravity", label: "Antigravity", state: "unknown", state_label: "Status unknown", detail: "Could not read installation metadata." }] }),
    // Like AxioSozoServices.projectHome: the stored record without its container mapping.
    getProjectHome: ({ id }) => {
      const stored = state.projects.find(project => project.id === id);
      if (!stored) throw { code: "UNKNOWN_PROJECT", message: "UNKNOWN_PROJECT" };
      const { container: _mapping, ...project } = structuredClone(stored);
      const space = contexts.find(context => context.uuid === project.context_uuid);
      return { version: 1, project, space: space ? { uuid: space.uuid, name: space.name } : null,
        container: state.containers?.[id] ?? { state: "pending" }, agent_activity: null, console_errors: null };
    },
    pickFolder: () => "/synthetic/domo-cortex",
    detect: () => DRAFT,
    confirmProject: ({ root, manifest, contextUuid }) => {
      const project = { version: 1, id: "p_domo1", root, manifest, manifest_state: "none", context_uuid: contextUuid, trusted: false, created_at: 1, updated_at: 1 };
      state.projects = [...state.projects, project];
      return project;
    },
  };
  const api = {
    async request(name, params) {
      calls.push([name, JSON.parse(JSON.stringify(params ?? {}))]);
      const handler = handlers[name] ?? defaults[name];
      if (!handler) throw { code: "UNKNOWN_METHOD", message: name };
      return handler(params ?? {});
    },
    subscribe(callback) { subscribers.push(callback); return () => {}; },
  };
  const windowListeners = new Map();
  const location = { hash };
  Object.assign(globalThis, {
    document, Node, location,
    window: { AxioSozoOverview: api, addEventListener: (type, fn) => windowListeners.set(type, fn), navigator },
    history: { replaceState: (_state, _title, url) => { location.hash = url; } },
    CSS: { escape: value => String(value).replace(/["\\]/g, "\\$&") },
  });
  await import(`../chrome/overview/about-axiosozo.mjs?page=${++serial}`);
  await flush();
  const navigate = async next => { location.hash = next; windowListeners.get("hashchange")?.(); await flush(); };
  // A services event as the actor delivers it (debounced by the page), and window events such as pagehide.
  const emit = async name => { for (const callback of subscribers) callback({ name }); await new Promise(resolve => setTimeout(resolve, 130)); await flush(); };
  const fire = async (type, event = {}) => { windowListeners.get(type)?.(event); await flush(); };
  return { document, calls, state, location, navigate, emit, fire, subscribers, text: () => document.body.textContent };
}

const visibleView = document => document.querySelectorAll("section.view").filter(section => !section.hidden).map(section => section.dataset.view);
const byText = (root, tag, text) => root.querySelectorAll(tag).find(node => node.textContent.trim() === text);

test("three sections only; the first run guide is the Projects empty state; every space is listed", async () => {
  const page = await loadPage();
  const { document } = page;
  assert.deepEqual(document.querySelectorAll(".views a").map(a => [a.getAttribute("href"), a.textContent]),
    [["#projects", "Projects"], ["#rules", "Site rules"], ["#ai", "AI & keys"]]);
  assert.deepEqual(visibleView(document), ["projects"]);
  assert.ok(document.getElementById("guide-heading"), "first-run guidance folds into Projects");
  // Spaces without projects are one quiet row each, never an empty group box.
  const spaces = document.querySelector(".other-spaces");
  assert.equal(spaces.querySelector("h3").textContent, "Your spaces");
  assert.deepEqual(spaces.querySelectorAll(".row-title").map(node => node.textContent), ["Homethis window", "Acme BV"]);
  assert.equal(document.querySelectorAll(".space-group").length, 0);
  assert.deepEqual(spaces.querySelectorAll("button.ghost").map(button => button.getAttribute("aria-label")),
    ["Add a project to Home", "Add a project to Acme BV"]);
  assert.deepEqual(spaces.querySelectorAll(".menu-items button").map(button => button.textContent),
    ["Switch to Home", "Space type…", "Switch to Acme BV", "Space type…"], "switching and the space type stay reachable, behind …");
  assert.equal(document.getElementById("projects-body").hasAttribute("aria-busy"), false);
  assert.equal(page.calls.some(([name]) => name === "getProviderStatus"), false, "no provider discovery until AI & keys is opened");
  assert.equal(page.calls.some(([name]) => /DecisionKey|JevKey/u.test(name)), false, "no Keychain check until AI & keys is opened");
  for (const view of ["#rules", "#ai", "#projects"]) {
    await page.navigate(view);
    assert.doesNotMatch(document.body.textContent, /\bnull\b|\bundefined\b|\[object /u, view);
  }
});

test("Site rules carry their own screen time; the busiest sites follow, with Add rule", async () => {
  const rule = { version: 1, id: "r_xcom1", enabled: true, match: { hosts: ["x.com"] }, contexts: "all", instruction: "Post, then leave.",
    limits: { daily_minutes: 15, allowed_hours: null }, observation: "none", observation_raised_hosts: [], effects: ["nudge"], override: "confirm",
    agents: { access: "none", instruction: "" }, created_at: 1, updated_at: 1 };
  const page = await loadPage({ hash: "#rules", handlers: {
    listRules: () => [rule],
    usageSummary: ({ days }) => [{ host: "x.com", context_uuid: null, total_ms: (days === 1 ? 20 : 70) * 60_000, by_day: {} },
      { host: "news.example", context_uuid: HOME, total_ms: 30 * 60_000, by_day: {} }] } });
  const card = page.document.getElementById("rule-r_xcom1");
  assert.match(card.querySelector(".usage-line").textContent, /^Today 20 min of 15 min · 7 days 1 h 10 min$/u);
  assert.ok(card.querySelector(".usage-line").hasAttribute("data-over"));
  const rows = page.document.querySelectorAll("#usage-list .usage-row");
  assert.deepEqual(rows.map(row => [row.querySelector(".row-title").textContent, row.querySelector("button").textContent]),
    [["x.com", "Rule"], ["news.example", "Add rule"]]);
  rows[1].querySelector("button").click();
  await flush();
  assert.equal(page.document.getElementById("sheet").open, true);
  assert.equal(page.document.getElementById("sheet-body").querySelector("textarea").value, "news.example");
});

test("old hashes redirect; #ai loads provider status with honest labels", async () => {
  const page = await loadPage({ hash: "#settings" });
  assert.equal(page.location.hash, "#ai");
  assert.deepEqual(visibleView(page.document), ["ai"]);
  assert.deepEqual(page.document.querySelectorAll("#provider-list .card-title").map(title => title.textContent),
    ["CodexInstalled · not yet verified", "Claude CodeNot installed", "AntigravityStatus unknown"]);
  assert.match(page.document.getElementById("providers-summary").textContent, /no assistant was started/u);
  assert.deepEqual(page.calls.filter(([name]) => name === "getDecisionKeyStatus").map(([, params]) => params),
    [{ provider: "jev" }, { provider: "openai" }], "the page names a provider only");
  assert.deepEqual(page.document.querySelectorAll("#decision-keys-body .key-head h4").map(h4 => h4.textContent), ["Jev", "OpenAI"]);
  assert.doesNotMatch(page.document.getElementById("view-ai").textContent, /\bReady\b/u);
  await page.navigate("#time");
  assert.equal(page.location.hash, "#rules");
  assert.deepEqual(visibleView(page.document), ["rules"]);
  await page.navigate("#home");
  assert.deepEqual(visibleView(page.document), ["projects"]);
});

// The browser's side of the decision keys, as ProviderStatus presents it.
function keyHandlers({ entry = { jev: true, openai: true }, stored = [], storeFails = null, gate = null } = {}) {
  const keys = new Set(stored);
  const answer = provider => decisionKeyEntry({ provider, key_entry_enabled: entry[provider], key: keys.has(provider) ? "stored" : "missing" });
  return { keys, handlers: {
    getDecisionKeyStatus: ({ provider }) => answer(provider),
    storeDecisionKey: async ({ provider }) => {
      if (gate) await gate.promise;
      if (storeFails) throw storeFails;
      keys.add(provider); return answer(provider);
    },
    removeDecisionKey: ({ provider }) => { keys.delete(provider); return answer(provider); },
    cancelDecisionKeyOperations: () => null,
  } };
}
const panelOf = (document, provider) => document.querySelector(`#decision-keys-body [data-provider="${provider}"]`);
const allValues = document => JSON.stringify(document.querySelectorAll("*").map(node => [...node.attributes.values(), node.value ?? ""]));

test("decision keys: explicit Store clears the field at once, crosses once, per provider; never echoed; fixed error texts", async () => {
  const { keys, handlers } = keyHandlers();
  let fail = null;
  const page = await loadPage({ hash: "#ai", handlers: { ...handlers,
    storeDecisionKey: params => { if (fail) throw fail; return handlers.storeDecisionKey(params); } } });
  const { document } = page;
  const input = document.getElementById("jev-key");
  assert.equal(input.type, "password");
  assert.equal(input.getAttribute("autocomplete"), "off");
  assert.equal(document.querySelector('label[for="jev-key"]').textContent, "Jev API key");
  assert.equal(document.querySelector('label[for="openai-key"]').textContent, "OpenAI API key");
  assert.deepEqual(["jev", "openai"].map(p => panelOf(document, p).querySelector("button.primary").getAttribute("aria-label")),
    ["Store key for Jev", "Store key for OpenAI"]);
  assert.equal(input.getAttribute("aria-describedby"), "jev-key-detail jev-key-help jev-key-error");
  input.value = SECRET;
  input.dispatchEvent(makeEvent("input"));
  await flush();
  assert.equal(page.calls.some(([name]) => name === "storeDecisionKey"), false, "typing sends nothing");
  byText(panelOf(document, "jev"), "button", "Store key").click();
  assert.equal(input.value, "", "cleared before the request completes");
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "storeDecisionKey"), [["storeDecisionKey", { provider: "jev", key: SECRET }]]);
  assert.deepEqual([...keys], ["jev"]);
  assert.equal(panelOf(document, "jev").querySelector(".tag").textContent, "Key stored");
  assert.equal(panelOf(document, "openai").querySelector(".tag").textContent, "No key stored", "OpenAI is untouched");
  assert.equal(document.getElementById("status").textContent, "Jev key stored in the macOS Keychain. Nothing was sent and consent did not change.");
  assert.equal(byText(panelOf(document, "jev"), "button", "Remove key…").hidden, false, "a stored key can be removed");
  assert.equal(byText(panelOf(document, "openai"), "button", "Remove key…").hidden, true);
  assert.equal(byText(panelOf(document, "jev"), "button", "Replace key").getAttribute("aria-label"), "Replace key for Jev");
  assert.match(panelOf(document, "jev").textContent, /has not been used or checked: decision calls are not available in this build/u);

  fail = { code: "KEYCHAIN_REFUSED", message: "storeDecisionKey failed (KEYCHAIN_REFUSED)" };
  const openai = document.getElementById("openai-key");
  openai.value = SECRET;
  openai.dispatchEvent(makeEvent("keydown", { key: "Enter" }));
  assert.equal(openai.value, "");
  await flush();
  assert.equal(document.getElementById("openai-key-error").textContent, "The macOS Keychain refused the change. Unlock the Keychain and try again.");
  assert.equal(document.getElementById("jev-key-error").textContent, "", "an error stays with its provider");
  for (const invalid of ["short", "line\u0007bell-key", "é".repeat(2049)]) {
    openai.value = invalid;
    byText(panelOf(document, "openai"), "button", "Store key").click();
    await flush();
    assert.equal(document.getElementById("openai-key-error").textContent, "Key not stored. Paste the whole key on one line: 8 to 4096 bytes.");
  }
  assert.equal(page.calls.filter(([name]) => name === "storeDecisionKey").length, 2, "an invalid key is never sent");
  assert.doesNotMatch(document.body.textContent, new RegExp(SECRET, "u"));
  assert.ok(!allValues(document).includes(SECRET), "never in an attribute or a field");
});

test("decision keys: with entry off a stored key can still be removed, after confirming; the other provider is independent", async () => {
  const { keys, handlers } = keyHandlers({ entry: { jev: true, openai: false }, stored: ["openai", "jev"] });
  const page = await loadPage({ hash: "#ai", handlers });
  const { document } = page;
  const panel = panelOf(document, "openai");
  assert.deepEqual([document.getElementById("openai-key").disabled, panel.querySelector("button.primary").disabled], [true, true]);
  assert.match(document.getElementById("openai-key-help").textContent,
    /^Adding an OpenAI key is turned off in this build \(axiosozo\.openai\.keyEntry\.enabled\)\. You can still remove the stored key\.$/u);
  const remove = byText(panel, "button", "Remove key…");
  assert.equal(remove.hidden, false);
  remove.focus();
  remove.click();
  await flush();
  assert.equal(document.getElementById("confirm-dialog").open, true);
  assert.equal(document.getElementById("confirm-title").textContent, "Remove the OpenAI key?");
  assert.equal(page.calls.some(([name]) => name === "removeDecisionKey"), false, "nothing is removed before confirming");
  document.getElementById("confirm-accept").click();
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "removeDecisionKey"), [["removeDecisionKey", { provider: "openai" }]]);
  assert.deepEqual([...keys], ["jev"], "Jev's key stays");
  assert.equal(panel.querySelector(".tag").textContent, "Turned off");
  assert.equal(remove.hidden, true);
  assert.equal(document.activeElement, document.getElementById("openai-key-heading"), "focus stays in the OpenAI form");
  assert.equal(panelOf(document, "jev").querySelector(".tag").textContent, "Key stored");
});

test("decision keys: a second press while a change runs is ignored; leaving AI & keys cancels it, clears typed keys and shows no late answer", async () => {
  let release;
  const gate = { promise: new Promise(resolve => { release = resolve; }) };
  const { handlers } = keyHandlers({ gate });
  const page = await loadPage({ hash: "#ai", handlers });
  const { document } = page;
  const input = document.getElementById("jev-key");
  const store = byText(panelOf(document, "jev"), "button", "Store key");
  input.value = SECRET;
  store.focus();
  store.click();
  await flush();
  assert.equal(panelOf(document, "jev").querySelector(".tag").textContent, "Storing…");
  assert.equal(store.getAttribute("aria-disabled"), "true");
  assert.equal(store.disabled, false, "stays focusable while busy");
  assert.equal(document.activeElement, store);
  input.value = "synthetic-second-key-1";
  input.dispatchEvent(makeEvent("keydown", { key: "Enter" }));
  store.click();
  await flush();
  assert.equal(input.value, "synthetic-second-key-1", "an ignored press does not read the field");
  assert.equal(page.calls.filter(([name]) => name === "storeDecisionKey").length, 1);
  document.getElementById("openai-key").value = "synthetic-typed-not-stored";
  await page.navigate("#projects");
  assert.deepEqual(page.calls.filter(([name]) => name === "cancelDecisionKeyOperations"), [["cancelDecisionKeyOperations", {}]]);
  assert.deepEqual([input.value, document.getElementById("openai-key").value], ["", ""], "typed keys are cleared on leaving");
  release();
  await flush();
  assert.notEqual(document.getElementById("status").textContent, "Jev key stored in the macOS Keychain. Nothing was sent and consent did not change.",
    "the late answer is not shown");
  const reads = page.calls.filter(([name]) => name === "getDecisionKeyStatus").length;
  await page.navigate("#ai");
  assert.equal(page.calls.filter(([name]) => name === "getDecisionKeyStatus").length, reads + 2, "presence is read afresh");
  assert.equal(document.getElementById("jev-key-error").textContent, "Cancelled before it finished, so the change could not be confirmed.");
  assert.equal(panelOf(document, "jev").querySelector(".tag").textContent, "Key stored", "and the browser's answer shows what happened");
});

test("decision keys: an uncertain outcome says it could not be confirmed, reads presence once more and never retries the change", async () => {
  const { keys, handlers } = keyHandlers();
  const page = await loadPage({ hash: "#ai", handlers: { ...handlers,
    storeDecisionKey: () => { keys.add("jev"); throw { code: "KEYCHAIN_HELPER_UNAVAILABLE", message: "storeDecisionKey failed (KEYCHAIN_HELPER_UNAVAILABLE)" }; } } });
  const { document } = page;
  const reads = page.calls.filter(([name]) => name === "getDecisionKeyStatus").length;
  document.getElementById("jev-key").value = SECRET;
  byText(panelOf(document, "jev"), "button", "Store key").click();
  await flush();
  assert.equal(document.getElementById("jev-key-error").textContent,
    "The Keychain helper was not available or did not finish, so the change could not be confirmed.");
  assert.doesNotMatch(document.getElementById("jev-key-error").textContent, /Nothing was changed/u);
  assert.equal(page.calls.filter(([name]) => name === "storeDecisionKey").length, 1, "no automatic retry");
  assert.deepEqual(page.calls.filter(([name]) => name === "getDecisionKeyStatus").slice(reads).map(([, params]) => params), [{ provider: "jev" }],
    "presence is read once more, through the browser");
  assert.equal(panelOf(document, "jev").querySelector(".tag").textContent, "Key stored", "and shows what the Keychain now reports");
});

// ---------------------------------------------------------------- admission at startup

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const names = page => page.calls.map(([name]) => name);
/** Answers getOverviewFlags with the given failures first, then the flags. */
const refusingFirst = (...codes) => {
  let n = 0;
  return () => {
    const code = codes[n++];
    if (code) throw { code, message: `about:axiosozo request rejected (${code})` };
    return { contexts: true, enginePreferences: false, jevKeyEntry: true, openaiKeyEntry: true };
  };
};

test("admission: a startup sender refusal is asked again; only the actor's answer admits the page, then keys and providers load", async () => {
  for (const code of ["SENDER_REJECTED", "ACTOR_ERROR"]) {
    const { handlers } = keyHandlers();
    const page = await loadPage({ hash: "#ai", handlers: { ...handlers, getOverviewFlags: refusingFirst(code) } });
    assert.deepEqual(names(page), ["getOverviewFlags"], `${code}: nothing but the read-only check before admission`);
    assert.equal(page.subscribers.length, 0, "no subscription before admission");
    assert.equal(page.document.getElementById("providers-refresh").disabled, true, "refresh is off until admitted");
    assert.doesNotMatch(page.text(), /not connected/u, "a refusal that may pass is not shown as not connected");
    await sleep(M.ADMISSION_RETRY_MS[0] + 30);
    await flush();
    const order = names(page);
    assert.deepEqual(order.slice(0, 2), ["getOverviewFlags", "getOverviewFlags"]);
    assert.equal(page.subscribers.length, 1, "subscribed once, after admission");
    for (const name of ["getProviderStatus", "getDecisionKeyStatus", "activeContext"]) {
      assert.ok(order.indexOf(name) > 1, `${code}: ${name} only after the admitting answer`);
    }
    assert.deepEqual(["jev", "openai"].map(p => panelOf(page.document, p).querySelector(".tag").textContent), ["No key stored", "No key stored"]);
    assert.equal(page.document.getElementById("jev-key").disabled, false, "the key form is usable");
    assert.equal(page.document.getElementById("providers-refresh").disabled, false);
    assert.equal(page.document.querySelectorAll("#provider-list .card").length, 3);
  }
});

test("admission: any other failed flags read admits nothing: no retry, no other read, no subscription, key forms off", async () => {
  const failures = {
    "unknown code": () => { throw { code: "SOMETHING_NEW", message: "a code this page does not know" }; },
    "service error": () => { throw { code: "SERVICE_ERROR", message: "the service failed" }; },
    "private denial": () => { throw { code: "PRIVATE_WINDOW", message: "managed from a normal window" }; },
    "local failure without a code": () => { throw new TypeError("local failure"); },
    "rejected with nothing": () => Promise.reject(undefined),
  };
  for (const [label, getOverviewFlags] of Object.entries(failures)) {
    const { handlers } = keyHandlers();
    const page = await loadPage({ hash: "#ai", handlers: { ...handlers, getOverviewFlags } });
    await sleep(M.ADMISSION_RETRY_MS[0] + 50);
    await flush();
    assert.deepEqual(names(page), ["getOverviewFlags"], `${label}: asked once, nothing else read`);
    assert.equal(page.subscribers.length, 0, `${label}: no subscription`);
    for (const provider of ["jev", "openai"]) {
      assert.equal(panelOf(page.document, provider).querySelector(".tag").textContent, "Not available here", label);
      assert.equal(page.document.getElementById(`${provider}-key`).disabled, true, label);
      assert.equal(panelOf(page.document, provider).querySelector("button.primary").disabled, true, label);
    }
    assert.equal(page.document.getElementById("providers-refresh").disabled, true, label);
    assert.match(page.document.getElementById("attention-list").textContent, /AxioSozo is not connected/u, label);
  }
});

test("admission: a page the actor keeps refusing asks a bounded number of times, then stays not connected and reads nothing", async () => {
  const { handlers } = keyHandlers();
  const always = refusingFirst(...Array(20).fill("SENDER_REJECTED"));
  const page = await loadPage({ hash: "#ai", handlers: { ...handlers, getOverviewFlags: always } });
  const total = M.ADMISSION_RETRY_MS.reduce((sum, ms) => sum + ms, 0);
  await sleep(total + 150);
  await flush();
  assert.deepEqual(names(page), Array(M.ADMISSION_RETRY_MS.length + 1).fill("getOverviewFlags"), "no other read, ever");
  assert.equal(page.subscribers.length, 0);
  assert.match(page.document.getElementById("attention-list").textContent, /AxioSozo is not connected/u);
  for (const provider of ["jev", "openai"]) {
    assert.equal(panelOf(page.document, provider).querySelector(".tag").textContent, "Not available here");
    assert.equal(page.document.getElementById(`${provider}-key-detail`).textContent, "This page is not connected to AxioSozo.");
    assert.equal(page.document.getElementById(`${provider}-key`).disabled, true);
  }
  assert.equal(page.document.getElementById("providers-refresh").disabled, true);
  await sleep(300);
  assert.equal(page.calls.length, M.ADMISSION_RETRY_MS.length + 1, "it does not keep polling");
});

test("admission: a pagehide during the retry stops asking; an answer from before the hide is not used; a restore asks afresh", async () => {
  // Hidden while waiting to ask again: no request while hidden.
  const { handlers } = keyHandlers();
  const page = await loadPage({ hash: "#ai", handlers: { ...handlers, getOverviewFlags: refusingFirst("SENDER_REJECTED") } });
  await page.fire("pagehide");
  await sleep(M.ADMISSION_RETRY_MS[0] * 3);
  assert.deepEqual(names(page), ["getOverviewFlags"], "a hidden page asks nothing");
  await page.fire("pageshow", { persisted: true });
  await flush();
  assert.equal(names(page).filter(name => name === "getOverviewFlags").length, 2, "the restored page asks afresh");
  assert.equal(panelOf(page.document, "jev").querySelector(".tag").textContent, "No key stored");

  // Hidden while the first check was on its way: its late answer admits nothing,
  // not even for the restored page while that page's own check is still open.
  const FLAGS = { contexts: true, enginePreferences: false, jevKeyEntry: true, openaiKeyEntry: true };
  const answers = [];
  const { handlers: second } = keyHandlers();
  const late = await loadPage({ hash: "#ai", handlers: { ...second,
    getOverviewFlags: () => new Promise(resolve => answers.push(resolve)) } });
  await late.fire("pagehide");
  answers[0](FLAGS);
  await flush();
  assert.deepEqual(names(late), ["getOverviewFlags"], "the answer from before the hide starts nothing");
  assert.equal(late.subscribers.length, 0);
  await late.fire("pageshow", { persisted: true });
  await flush();
  assert.equal(answers.length, 2, "the restored page asks for itself");
  await late.navigate("#projects");
  await late.navigate("#ai");
  assert.deepEqual(names(late), ["getOverviewFlags", "getOverviewFlags"], "nothing is read while the restored page's own check is open");
  answers[1](FLAGS);
  await flush();
  assert.ok(names(late).includes("getDecisionKeyStatus"), "admitted by the restored page's own answer");
});

test("decision keys: a private window or a refused check says why and offers nothing", async () => {
  const page = await loadPage({ hash: "#ai", handlers: {
    getDecisionKeyStatus: () => { throw { code: "PRIVATE_WINDOW", message: "getDecisionKeyStatus: keys are managed from a normal window" }; } } });
  for (const provider of ["jev", "openai"]) {
    const panel = panelOf(page.document, provider);
    assert.equal(panel.querySelector(".tag").textContent, "Not available here");
    assert.equal(page.document.getElementById(`${provider}-key-detail`).textContent, "Keys are managed from a normal window, never a private one.");
    assert.equal(page.document.getElementById(`${provider}-key`).disabled, true);
    assert.equal(byText(panel, "button", "Remove key…").hidden, true);
  }
  assert.equal(page.calls.some(([name]) => name === "storeDecisionKey" || name === "removeDecisionKey"), false);
});

// Rules (site-rule-v1): a provider only when chosen or already saved; screen is policy only.
const RULE = { version: 1, id: "r_xcom1", enabled: true, match: { hosts: ["x.com"] }, contexts: "all", instruction: "Post, then leave.",
  limits: { daily_minutes: 15, allowed_hours: null }, observation: "address", observation_raised_hosts: [], effects: ["nudge"], override: "confirm",
  agents: { access: "none", instruction: "" }, created_at: 1, updated_at: 1 };
async function ruleEditor(rule) {
  const saved = [];
  const page = await loadPage({ hash: `#rule=${rule.id}`, handlers: {
    listRules: () => [rule], saveRule: params => { saved.push(params.rule); return params.rule; } } });
  const sheet = page.document.getElementById("sheet");
  assert.equal(sheet.open, true);
  const radio = (name, value) => sheet.querySelectorAll(`input[name="${name}"]`).find(node => node.value === value);
  const save = async () => { byText(sheet, "button", "Save rule").click(); await flush(); return saved.at(-1); };
  return { page, sheet, radio, save, saved };
}

test("rule editor: a legacy rule keeps no provider; a chosen provider is written and kept through unrelated edits", async () => {
  const legacy = await ruleEditor(RULE);
  assert.equal(legacy.radio("provider", "jev").checked, true, "a rule without a provider is Jev");
  const minutes = legacy.sheet.querySelectorAll("input").find(node => node.getAttribute("placeholder") === "No limit");
  minutes.value = "20"; minutes.dispatchEvent(makeEvent("input"));
  const kept = await legacy.save();
  assert.equal(kept.limits.daily_minutes, 20);
  assert.equal(Object.hasOwn(kept, "provider"), false, "the exact legacy shape");

  const chosen = await ruleEditor(RULE);
  chosen.radio("provider", "openai").click();
  assert.equal((await chosen.save()).provider, "openai");

  const openai = await ruleEditor({ ...RULE, provider: "openai" });
  assert.equal(openai.radio("provider", "openai").checked, true);
  assert.match(openai.sheet.textContent, /OpenAI has no consent setting yet and its decision format is not verified/u);
  assert.equal((await openai.save()).provider, "openai", "kept through an unrelated save");
  const back = await ruleEditor({ ...RULE, provider: "openai" });
  back.radio("provider", "jev").click();
  assert.equal((await back.save()).provider, "jev", "a switch back is written, so the stored OpenAI is not kept");
});

test("rule editor: a screenshot cannot be newly chosen; a saved screen rule keeps it; raising a host never allows it", async () => {
  const fresh = await ruleEditor(RULE);
  const screen = fresh.radio("observation", "screen");
  assert.equal(screen.disabled, true, "no native capture in this build");
  assert.match(fresh.sheet.textContent, /A screenshot of the tab/u);
  assert.match(fresh.sheet.textContent, /Not available in this build: no screenshot is taken and nothing is sent for this level\./u);
  assert.match(fresh.sheet.textContent, new RegExp(M.DECISIONS_UNAVAILABLE.replaceAll(".", "\\."), "u"));

  const saved = await ruleEditor({ ...RULE, observation: "screen", provider: "openai", observation_raised_hosts: [] });
  assert.deepEqual([saved.radio("observation", "screen").checked, saved.radio("observation", "screen").disabled], [true, false]);
  assert.match(saved.sheet.textContent, /A screenshot is never taken on banking, government, health, identity and password-manager sites/u);
  assert.equal(saved.sheet.querySelectorAll('input[name="raised-host"]').length, 0, "no host can be raised for a screenshot");
  const kept = await saved.save();
  assert.deepEqual([kept.observation, kept.provider, kept.observation_raised_hosts], ["screen", "openai", []]);
  assert.equal(JSON.stringify(kept).includes("data_base64"), false, "a rule never carries an image");
});

test("add project: review sheet with the current space, environments per app, production URL, then where it lives", async () => {
  const page = await loadPage();
  const { document } = page;
  document.getElementById("add-project").click();
  await flush();
  assert.equal(document.getElementById("sheet").open, true);
  const sheet = document.getElementById("sheet-body");
  assert.equal(sheet.querySelector("h2").textContent, "Review project");
  const space = sheet.querySelectorAll("select").find(select => select.querySelector("option")?.textContent.startsWith("No space"));
  assert.equal(space.value, HOME, "defaults to the space this window shows");
  assert.deepEqual(space.querySelectorAll("option").map(o => o.textContent),
    ["No space (not in the sidebar)", "Home (personal) · this window", "Acme BV (organization)"]);
  assert.deepEqual(sheet.querySelectorAll(".env-group h4").map(h4 => h4.textContent), ["Desktop app (desktop)", "App web"]);
  assert.deepEqual(sheet.querySelectorAll(".review-row .env-url").slice(0, 2).map(input => input.value), ["http://localhost:1420", "http://localhost:5173"]);
  assert.ok(sheet.querySelectorAll(".tag.guess").some(tag => tag.textContent === "guessed"), "the Vite default port is marked guessed");
  assert.match(sheet.textContent, /Shown in the sidebarRepositorygithub\.comMove to More/u, "only the repository is shown");
  assert.match(sheet.textContent, /More \(behind … in the sidebar\): 4Issues.*Vercel \(synthetic-web\)vercel\.com/u, "issues, CI, releases and the Vercel dashboard go behind …");
  // Detection v2 preview: services and apps as plain text, no links before the project exists.
  const findings = sheet.querySelector("fieldset.findings");
  assert.equal(findings.querySelector("legend").textContent, "Also found in the folder");
  assert.deepEqual(findings.querySelectorAll("dt").map(dt => dt.textContent), ["Services", "Apps"]);
  assert.deepEqual(findings.querySelectorAll("dd .tag").map(tag => tag.textContent), ["Vercel", "Desktop (Tauri) · Tauri Plus Web"]);
  assert.equal(findings.querySelectorAll("button").length, 0);
  const production = sheet.querySelectorAll("input").find(input => input.getAttribute("placeholder") === "https://example.com");
  production.value = "https://domo.example";
  production.dispatchEvent(makeEvent("input"));
  byText(sheet, "button", "Add environment").click();
  const added = sheet.querySelectorAll(".env-group .review-row").at(-1);
  const [name, url] = added.querySelectorAll("input").filter(input => input.type !== "checkbox");
  name.value = "staging"; name.dispatchEvent(makeEvent("input"));
  url.value = "http://localhost:5180"; url.dispatchEvent(makeEvent("input"));
  byText(document.getElementById("sheet"), "button", "Add project").click();
  await flush();
  const [, params] = page.calls.find(([method]) => method === "confirmProject");
  assert.equal(params.root, "/synthetic/domo-cortex");
  assert.equal(params.contextUuid, HOME);
  assert.equal(params.manifest.version, 2);
  assert.deepEqual(params.manifest.environments.map(env => [env.app ?? null, env.name, env.base_url]), [
    ["desktop", "local", "http://localhost:1420"], ["web", "local", "http://localhost:5173"],
    ["web", "staging", "http://localhost:5180"], ["web", "production", "https://domo.example"]]);
  assert.ok(params.manifest.services.some(service => service.port === 5180), "a new local environment gets a dev server for its dot");
  assert.equal(document.getElementById("sheet").open, false);
  const placement = document.getElementById("placement");
  assert.equal(placement.hidden, false);
  assert.match(placement.textContent, /Tauri Plus Web was added to the space Home\. It is in that space's sidebar/u);
  byText(placement, "button", "Switch to Home").click();
  await flush();
  assert.deepEqual(page.calls.at(-1), ["openContext", { uuid: HOME }]);
  assert.ok(document.getElementById("project-p_domo1"), "the new project card is listed under its space");
});

// P2: one synthetic v2 project with its own container, a detected service and
// an account label the user typed earlier.
const HARBOR = { version: 2, id: "p_harbor1", root: "/synthetic/harbor", manifest_state: "none", context_uuid: HOME, trusted: false,
  created_at: 1, updated_at: 1,
  manifest: { version: 1, name: "Harbor", kind: "web", environments: [{ name: "local", base_url: "http://localhost:5101" }], services: [], surfaces: [] },
  detected: { at: 1, integrations: [{ id: "vercel", name: "Vercel", dashboard_url: "https://vercel.com/dashboard", sources: ["vercel.json"] }],
    platforms: [], domains: [], agents: { files: [], dirs: [], worktrees: 0 } },
  container: { user_context_id: 40 }, shared_sites: { hosts: ["github.com", "*.github.com"], confirmed: false },
  accounts: [{ key: "vercel", label: "work Google" }], brief: null };

function harborPage(extra = {}, { hash = "#project=p_harbor1" } = {}) {
  let state;
  const update = (id, change) => { state.projects = state.projects.map(project => (project.id === id ? change(project) : project)); return state.projects.find(p => p.id === id); };
  const pagePromise = loadPage({ hash, projects: [structuredClone(HARBOR)], containers: { p_harbor1: { state: "own", name: "Harbor", color: "cyan" } }, handlers: {
    listProjectContainers: () => [{ project_id: "p_harbor1", state: "own", name: "Harbor", color: "cyan" }],
    openProjectUrl: () => ({ opened: true, container: "project" }),
    setAccountLabel: ({ projectId, key, label }) => update(projectId, project => ({ ...project,
      accounts: [...project.accounts.filter(account => account.key !== key), ...(label === null ? [] : [{ key, label }])] })),
    setSharedSites: ({ projectId, hosts, confirmed }) => update(projectId, project => ({ ...project, shared_sites: { hosts, confirmed } })),
    ...extra } });
  return pagePromise.then(page => { state = page.state; return page; });
}
const homeSectionOf = (document, key) => document.getElementById("project-home").querySelector(`[data-section="${key}"]`);

test("P2: the home shows the own container in Firefox's colour, typed account labels and unconfirmed shared sites", async () => {
  const page = await harborPage();
  const accounts = homeSectionOf(page.document, "accounts");
  assert.equal(accounts.querySelector("h3").textContent, "Services and sign-ins");
  const line = accounts.querySelector(".container-line");
  assert.equal(line.textContent, "Own container");
  assert.equal(line.getAttribute("data-state"), "own");
  assert.match(accounts.textContent, /Links on this page open in it, so Harbor keeps its own sign-ins\. Firefox tabs only\. Chromium tabs do not have per-project sign-ins yet\./u);
  assert.deepEqual(line.querySelector(".container-mark").className.split(" "), ["container-mark", "identity-color-cyan"]);
  assert.equal(line.querySelector(".container-mark").getAttribute("aria-hidden"), "true");
  assert.deepEqual(accounts.querySelectorAll(".service-rows .row").map(row => [row.querySelector(".row-title").textContent, row.querySelector(".row-detail").textContent]),
    [["Vercel", "Account: work Google"]]);
  assert.equal(accounts.querySelector(".fact-text").textContent, "Not shared yet. Suggested: github.com, *.github.com");
  assert.equal(accounts.querySelector('[data-focus-key="project:p_harbor1:accounts"]').getAttribute("aria-label"), "Accounts for Harbor");
  assert.doesNotMatch(page.document.getElementById("project-home").textContent, /\b40\b|user_context/u, "no container ID is shown");
  assert.ok(page.document.querySelector('link[href="chrome://browser/content/usercontext/usercontext.css"]'), "Firefox's own colours");
  // The list card carries the same colour on its tile.
  await page.navigate("#projects");
  const tile = page.document.getElementById("project-p_harbor1").querySelector(".project-tile");
  assert.deepEqual([tile.className, tile.textContent, tile.getAttribute("aria-hidden")], ["project-tile identity-color-cyan", "H", "true"]);
});

test("P2: every project link on the home goes through the container router, never a plain openUrl", async () => {
  const page = await harborPage({ openProjectUrl: ({ url }) => ({ opened: true, container: url.includes("vercel") ? "off" : "project" }) });
  const home = page.document.getElementById("project-home");
  const button = label => home.querySelectorAll("button").find(node => node.getAttribute("aria-label") === label);
  button("Open Local at localhost:5101").click();
  await flush();
  button("Open the Vercel dashboard").click();
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "openProjectUrl" || name === "openUrl"), [
    ["openProjectUrl", { projectId: "p_harbor1", url: "http://localhost:5101" }],
    ["openProjectUrl", { projectId: "p_harbor1", url: "https://vercel.com/dashboard" }]]);
  assert.match(page.document.getElementById("status").textContent, /containers are off/u, "a link without its container says so");
});

test("P2: account editor: labels the user types per service or site, sent one by one; bad sites are refused locally", async () => {
  const page = await harborPage();
  const { document } = page;
  byText(homeSectionOf(document, "accounts"), "button", "Edit accounts…").click();
  await flush();
  const sheet = document.getElementById("sheet-body");
  assert.equal(sheet.querySelector("h2").textContent, "Accounts for Harbor");
  assert.match(sheet.textContent, /never reads accounts, cookies or passwords from pages/u);
  const [vercel] = sheet.querySelectorAll("input.account-label");
  assert.deepEqual([vercel.value, vercel.getAttribute("aria-label"), vercel.getAttribute("maxlength")], ["work Google", "Account for Vercel", "80"]);
  vercel.value = "personal Google"; vercel.dispatchEvent(makeEvent("input"));
  byText(sheet, "button", "Add a site").click();
  const site = sheet.querySelector("input.account-site");
  assert.equal(document.activeElement, site, "focus moves to the new row");
  site.value = "not a site!"; site.dispatchEvent(makeEvent("input"));
  const label = sheet.querySelectorAll("input.account-label").at(-1);
  label.value = "Work Microsoft"; label.dispatchEvent(makeEvent("input"));
  byText(document.getElementById("sheet"), "button", "Save").click();
  await flush();
  assert.match(sheet.querySelector(".errors").textContent, /is not a site/u);
  assert.equal(page.calls.filter(([name]) => name === "setAccountLabel").length, 0, "nothing is sent while a row is invalid");
  site.value = "Linear.app"; site.dispatchEvent(makeEvent("input"));
  byText(document.getElementById("sheet"), "button", "Save").click();
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "setAccountLabel"), [
    ["setAccountLabel", { projectId: "p_harbor1", key: "vercel", label: "personal Google" }],
    ["setAccountLabel", { projectId: "p_harbor1", key: "linear.app", label: "Work Microsoft" }]]);
  assert.equal(document.getElementById("sheet").open, false);
  assert.deepEqual(homeSectionOf(document, "accounts").querySelectorAll(".service-rows .row").map(row => row.textContent),
    ["VercelAccount: personal GoogleDashboard", "linear.appAccount: Work Microsoft"], "the home reads the saved labels back");
});

test("P2: shared-sites editor offers the suggestions and shares only after the user turns sharing on", async () => {
  const page = await harborPage();
  const { document } = page;
  byText(homeSectionOf(document, "accounts"), "button", "Review…").click();
  await flush();
  const sheet = document.getElementById("sheet-body");
  assert.equal(sheet.querySelector("h2").textContent, "Shared sites for Harbor");
  const hosts = sheet.querySelector("textarea");
  assert.equal(hosts.value, "github.com\n*.github.com");
  const share = sheet.querySelector('input[name="share-sites"]');
  assert.equal(share.checked, false, "suggestions are not shared yet");
  byText(sheet, "button", "Use the suggested sites").click();
  assert.equal(hosts.value.split("\n").length, 8);
  byText(document.getElementById("sheet"), "button", "Save").click();
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "setSharedSites").at(-1)[1].confirmed, false, "saving the list alone shares nothing");
  assert.match(homeSectionOf(document, "accounts").querySelector(".fact-text").textContent, /^Not shared yet\. Suggested: github\.com/u);
  byText(homeSectionOf(document, "accounts"), "button", "Review…").click();
  await flush();
  document.getElementById("sheet-body").querySelector('input[name="share-sites"]').click();
  byText(document.getElementById("sheet"), "button", "Save").click();
  await flush();
  const [, params] = page.calls.filter(([name]) => name === "setSharedSites").at(-1);
  assert.equal(params.confirmed, true);
  assert.equal(params.hosts.length, 8);
  const accounts = homeSectionOf(document, "accounts");
  assert.match(accounts.querySelector(".fact-text").textContent, /^Shared with the space: github\.com/u);
  assert.match(accounts.querySelector(".shared-line").textContent, /These use the sign-ins of Home\./u);
  assert.equal(byText(accounts, "button", "Edit…").getAttribute("aria-label"), "Shared sites of Harbor");
});

test("P2: the list card keeps editing secondary but reachable: its menu opens the same editors", async () => {
  const page = await harborPage({}, { hash: "#projects" });
  const card = page.document.getElementById("project-p_harbor1");
  assert.deepEqual(card.querySelectorAll(".menu-items button").map(button => button.textContent),
    ["Edit project…", "Accounts…", "Shared sites…", "Read folder again", "Save as .axiosozo/project.json…", "Remove project…"]);
  assert.equal(card.querySelector("summary").getAttribute("aria-label"), "More for Harbor");
  byText(card, "button", "Accounts…").click();
  await flush();
  assert.equal(page.document.getElementById("sheet-body").querySelector("h2").textContent, "Accounts for Harbor");
  byText(page.document.getElementById("sheet"), "button", "Cancel").click();
  byText(card, "button", "Shared sites…").click();
  await flush();
  assert.equal(page.document.getElementById("sheet-body").querySelector("h2").textContent, "Shared sites for Harbor");
});

test("#add-project=<space> from the space menu preselects that space; #edit-project opens the editor", async () => {
  const page = await loadPage({ hash: `#add-project=${BV}` });
  await flush();
  assert.equal(page.location.hash, "#projects");
  assert.equal(page.calls.filter(([name]) => name === "pickFolder").length, 1);
  const sheet = page.document.getElementById("sheet-body");
  const space = sheet.querySelectorAll("select").find(select => select.querySelector("option")?.textContent.startsWith("No space"));
  assert.equal(space.value, BV);

  const project = { version: 1, id: "p_blog1", root: "/synthetic/blog", manifest_state: "none", context_uuid: HOME, trusted: false, created_at: 1, updated_at: 1,
    manifest: { version: 1, name: "Blog", kind: "web", environments: [{ name: "local", base_url: "http://localhost:4321" }],
      services: [{ name: "Dev server", url: "http://localhost:4321/", port: 4321 }], surfaces: [] } };
  const edit = await loadPage({ hash: "#edit-project=p_blog1", projects: [project] });
  assert.equal(edit.document.getElementById("sheet-body").querySelector("h2").textContent, "Edit Blog");
  assert.equal(edit.location.hash, "#project=p_blog1", "the editor opens over the project's home");
  assert.equal(edit.document.getElementById("project-home").hidden, false);
  assert.equal(edit.document.activeElement?.id, "sheet-title", "the home does not take focus from the open editor");
});

// ---------------------------------------------------------------- agent status (P3)

const ENDPOINT = { enabled: false, state: "disabled", reason: null, cleanup_pending: false, cleanup_blocked: false,
  projects: { state: "ready", reason: null, generation: 1, count: 2 }, methods: [{ method: "tabs.list", available: false }] };
function agentHandlers(overrides = {}) {
  const box = { endpoint: { ...ENDPOINT }, copied: [] };
  const handlers = {
    getAgentEndpointState: () => box.endpoint,
    setAgentEndpointEnabled: ({ enabled }) => {
      box.endpoint = enabled ? { ...ENDPOINT, enabled: true, state: "listening", socketPath: "/synthetic/profile/.a/s" } : { ...ENDPOINT };
      return box.endpoint;
    },
    getAgentHookConfig: ({ agent }) => ({ agent, text: `{"hooks":"<b>${agent}</b>"}\n` }),
    ...overrides,
  };
  const navigator = { clipboard: { writeText: async text => { box.copied.push(text); } } };
  return { box, handlers, navigator };
}
const agentBody = page => page.document.getElementById("agent-settings-body");
const agentButton = (page, label) => agentBody(page).querySelectorAll("button").find(button => button.textContent === label);

test("agent status: off in every new page; Turn on asks the browser and shows what it reports; hook settings only while listening", async () => {
  const { box, handlers, navigator } = agentHandlers();
  const page = await loadPage({ hash: "#ai", handlers, navigator });
  assert.match(agentBody(page).querySelector(".row-title").textContent, /^Agent status Off$/u);
  assert.equal(agentBody(page).hasAttribute("aria-busy"), false);
  const on = agentButton(page, "Turn on");
  assert.equal(on.className, "primary");
  assert.equal(on.getAttribute("aria-describedby"), "agent-status-text");
  assert.equal(agentBody(page).querySelectorAll(".hook-row").length, 0, "no hook settings while off");
  assert.match(agentBody(page).textContent, /Clicking, typing and opening pages are not available in this build\./u);
  const footnote = agentBody(page).querySelectorAll("p.footnote").find(node => /private windows/u.test(node.textContent));
  assert.equal(footnote.textContent, "Agents never see private windows. Console errors are read from Firefox tabs only, never from Chromium tabs. "
    + "Clicking, typing and opening pages are not available in this build.");
  assert.doesNotMatch(agentBody(page).textContent, /Chromium tabs are listed|listed but never read/u, "no Chromium listing is claimed");
  assert.equal(page.calls.some(([name]) => name === "getAgentHookConfig" || name === "setAgentEndpointEnabled"), false, "reading starts nothing");
  on.focus();
  on.click();
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "setAgentEndpointEnabled"), [["setAgentEndpointEnabled", { enabled: true }]]);
  assert.match(agentBody(page).querySelector(".row-title").textContent, /On$/u);
  assert.equal(page.document.activeElement?.textContent, "Turn off", "focus stays on the switch across the re-render");
  assert.deepEqual(page.calls.filter(([name]) => name === "getAgentHookConfig").map(([, params]) => params),
    [{ agent: "claude-code" }, { agent: "codex" }], "the page names an agent only: never a socket, script or executable path");
  const rows = agentBody(page).querySelectorAll(".hook-row");
  assert.deepEqual(rows.map(row => row.querySelector(".row-title").textContent), ["Claude Code", "Codex"]);
  assert.equal(rows[0].querySelector("pre code").textContent, '{"hooks":"<b>claude-code</b>"}\n', "shown as text, never markup");
  assert.equal(rows[0].querySelectorAll("b").length, 0);
  assert.equal(page.document.getElementById("status").textContent, "Agent status is on until you turn it off or quit AxioSozo.");
  agentButton(page, "Copy for Codex").click();
  await flush();
  assert.deepEqual(box.copied, ['{"hooks":"<b>codex</b>"}\n']);
  assert.match(page.document.getElementById("status").textContent, /^Codex settings copied\./u);
  agentButton(page, "Turn off").click();
  await flush();
  assert.match(agentBody(page).querySelector(".row-title").textContent, /Off$/u);
  assert.equal(agentBody(page).querySelectorAll(".hook-row").length, 0);
});

test("agent status: while the switch is on its way it keeps focus and ignores a second press", async () => {
  let finish;
  const { handlers } = agentHandlers();
  const page = await loadPage({ hash: "#ai", handlers: { ...handlers,
    setAgentEndpointEnabled: params => new Promise(resolve => { finish = () => resolve(handlers.setAgentEndpointEnabled(params)); }) } });
  const on = agentButton(page, "Turn on");
  on.focus();
  on.click();
  await flush();
  const busy = page.document.activeElement;
  assert.equal(busy.getAttribute("aria-disabled"), "true");
  assert.equal(busy.hasAttribute("disabled"), false, "never disabled, so keyboard focus stays");
  assert.match(agentBody(page).querySelector(".tag").textContent, /Working…/u);
  busy.click();
  await flush();
  assert.equal(page.calls.filter(([name]) => name === "setAgentEndpointEnabled").length, 1);
  finish();
  await flush();
  assert.equal(page.document.activeElement.textContent, "Turn off");
  assert.equal(page.document.activeElement.hasAttribute("aria-disabled"), false);
});

test("agent status: a failed start is one calm sentence with the code only in a detail; Try again asks again", async () => {
  const failed = { ...ENDPOINT, enabled: true, state: "unavailable", reason: "EXACT_SOCKET_METADATA_UNAVAILABLE" };
  let asked = false;
  const { handlers } = agentHandlers({ setAgentEndpointEnabled: () => { asked = true; return failed; } });
  const page = await loadPage({ hash: "#ai", handlers: { ...handlers, getAgentEndpointState: () => (asked ? failed : ENDPOINT) } });
  agentButton(page, "Turn on").click();
  await flush();
  const text = page.document.getElementById("agent-status-text").textContent;
  assert.equal(text, "This build cannot open a private connection point for this profile, so nothing was started.");
  assert.equal(agentBody(page).querySelector(".fact-note").textContent, "Detail: EXACT_SOCKET_METADATA_UNAVAILABLE");
  assert.ok(agentButton(page, "Try again") && agentButton(page, "Turn off"));
  assert.equal(page.document.getElementById("status").dataset.kind, "error");
  agentButton(page, "Try again").click();
  await flush();
  assert.equal(page.calls.filter(([name]) => name === "setAgentEndpointEnabled").length, 2);
});

test("agent status: without a verified notify script the hook rows say so and offer no copy; private windows see a calm line", async () => {
  const { handlers } = agentHandlers({ getAgentEndpointState: () => ({ ...ENDPOINT, enabled: true, state: "listening", socketPath: "/synthetic/profile/.a/s" }),
    getAgentHookConfig: () => { throw { code: "AGENT_HOOK_CONFIG_UNAVAILABLE", message: "AGENT_HOOK_CONFIG_UNAVAILABLE" }; } });
  const page = await loadPage({ hash: "#ai", handlers });
  const rows = agentBody(page).querySelectorAll(".hook-row");
  assert.equal(rows.length, 2);
  assert.ok(rows.every(row => /no verified copy of its notify script/u.test(row.textContent)));
  assert.equal(agentBody(page).querySelectorAll("button").filter(button => /^Copy/u.test(button.textContent)).length, 0);
  const hidden = await loadPage({ hash: "#ai", handlers: { getAgentEndpointState: () => { throw { code: "PRIVATE_WINDOW", message: "x" }; } } });
  assert.equal(hidden.document.getElementById("agent-status-text").textContent, "Agent status is managed from a normal window.");
  assert.equal(agentBody(hidden).querySelectorAll("button").length, 0);
});

test("agent status lifecycle: a hidden page publishes nothing; an agents event re-reads only while AI & keys shows; a restore reads afresh", async () => {
  let release = null;
  const { handlers } = agentHandlers();
  const page = await loadPage({ hash: "#projects", handlers: { ...handlers,
    getAgentEndpointState: () => (release ? new Promise(resolve => { const go = release; release = () => { go(); resolve({ ...ENDPOINT, enabled: true, state: "listening", socketPath: "/s/.a/s" }); }; }) : ENDPOINT) } });
  const reads = () => page.calls.filter(([name]) => name === "getAgentEndpointState").length;
  assert.equal(reads(), 0, "not read until AI & keys is opened");
  await page.emit("agents");
  assert.equal(reads(), 0, "an agents event on another view reads nothing");
  await page.navigate("#ai");
  assert.equal(reads(), 1);
  release = () => {};
  await page.emit("agents");
  assert.equal(reads(), 2);
  await page.fire("pagehide");
  release();
  await flush();
  assert.match(agentBody(page).querySelector(".row-title").textContent, /Off$/u, "the late answer is not shown on a hidden page");
  await page.fire("pageshow", { persisted: true });
  await flush(); await flush();
  assert.equal(reads(), 3, "a restored page reads afresh");
});

// ---------------------------------------------------------------- browser tools (P4, step 8)

const CAPABILITIES = [
  { method: "tabs.list", available: true, reason: null }, { method: "tabs.active", available: true, reason: null },
  { method: "project.info", available: true, reason: null }, { method: "console.errors", available: true, reason: null },
  { method: "tabs.screenshot", available: false, reason: "CAPTURE_NOT_ENABLED" }, { method: "tabs.open", available: false, reason: "OPEN_NOT_ENABLED" },
  { method: "tabs.navigate", available: false, reason: "ACT_NOT_ENABLED" }, { method: "page.click", available: false, reason: "ACT_NOT_ENABLED" },
  { method: "page.type", available: false, reason: "ACT_NOT_ENABLED" }];
const LIVE = CAPABILITIES.map(({ method, available }) => ({ method, available }));
function toolHandlers(overrides = {}) {
  const box = { endpoint: { ...ENDPOINT, capabilities: CAPABILITIES }, copied: [] };
  const handlers = {
    getAgentEndpointState: () => box.endpoint,
    setAgentEndpointEnabled: ({ enabled }) => {
      box.endpoint = enabled ? { ...ENDPOINT, enabled: true, state: "listening", socketPath: "/synthetic/profile/.a/s", methods: LIVE, capabilities: CAPABILITIES }
        : { ...ENDPOINT, capabilities: CAPABILITIES };
      return box.endpoint;
    },
    getAgentHookConfig: ({ agent }) => ({ agent, text: `hook ${agent}\n` }),
    getAgentBridgeConfig: ({ agent }) => ({ agent, text: agent === "codex" ? "[mcp_servers.axiosozo]\ncommand = \"<b>node</b>\"\n" : "{\"mcpServers\":{}}\n" }),
    ...overrides,
  };
  return { box, handlers, navigator: { clipboard: { writeText: async text => { box.copied.push(text); } } } };
}
const bridgeRows = page => agentBody(page).querySelectorAll(".bridge-row");

test("browser tools: the browser's own list, with fixed reasons; plugin settings only while on, named by agent, shown as text and copied on request", async () => {
  const { box, handlers, navigator } = toolHandlers();
  const page = await loadPage({ hash: "#ai", handlers, navigator });
  const tools = agentBody(page).querySelector(".agent-tools");
  assert.equal(tools.getAttribute("role"), "group");
  assert.equal(page.document.getElementById(tools.getAttribute("aria-labelledby")).textContent, "Browser tools for agents");
  assert.equal(tools.querySelector(".tool-list").getAttribute("aria-label"), "Browser tools");
  assert.equal(page.document.getElementById("agent-tools-text").textContent, "Once agent status is on, an agent you allow for its session can use the available tools.");
  const rows = tools.querySelectorAll(".tool-row");
  assert.deepEqual(rows.map(row => [row.querySelector(".tag").textContent, row.querySelector(".tool-label").textContent, row.dataset.available]), [
    ["Available", "See your open tabs: address and title", "true"], ["Available", "See which tab is in front", "true"],
    ["Available", "Read the project's name, folder and environment links", "true"], ["Available", "Read console errors of a Firefox tab in the project", "true"],
    ["Not available", "Take a screenshot of a tab", "false"], ["Not available", "Open a page in a new background tab", "false"],
    ["Not available", "Go to another page in a tab", "false"], ["Not available", "Click on a page", "false"], ["Not available", "Type into a page", "false"]]);
  assert.equal(rows[4].querySelector(".help").textContent, "Not in this build yet: screenshots wait for their privacy checks.");
  assert.equal(rows[0].querySelector(".tag").getAttribute("data-tone"), "ok");
  assert.equal(rows[4].querySelector(".tag").hasAttribute("data-tone"), false, "unavailable stays a quiet tag");
  assert.equal(bridgeRows(page).length, 0, "no plugin settings while off");
  assert.equal(page.calls.some(([name]) => name === "getAgentBridgeConfig"), false, "reading starts nothing");
  agentButton(page, "Turn on").click();
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "getAgentBridgeConfig").map(([, params]) => params),
    [{ agent: "claude-code" }, { agent: "codex" }], "the page names an agent only: never a socket, Node or bridge path");
  assert.equal(page.document.getElementById("agent-tools-text").textContent,
    "An agent you allow for its session can use the available tools until it disconnects or you end its session.");
  const plugins = bridgeRows(page);
  assert.deepEqual(plugins.map(row => row.querySelector(".row-title").textContent), ["Claude Code", "Codex"]);
  assert.match(plugins[0].querySelector(".help").textContent, /\.mcp\.json/u);
  assert.equal(plugins[1].querySelector("pre code").textContent, "[mcp_servers.axiosozo]\ncommand = \"<b>node</b>\"\n", "text, never markup");
  assert.equal(plugins[1].querySelectorAll("b").length, 0);
  assert.equal(plugins[1].querySelector("pre").getAttribute("aria-label"), "Codex plugin settings");
  const copy = plugins[1].querySelector("button");
  assert.equal(copy.textContent, "Copy for Codex");
  assert.equal(copy.getAttribute("aria-describedby"), "agent-bridge-codex-help");
  copy.focus();
  copy.click();
  await flush();
  assert.deepEqual(box.copied, ["[mcp_servers.axiosozo]\ncommand = \"<b>node</b>\"\n"]);
  assert.equal(page.document.getElementById("status").textContent, "Codex plugin settings copied. Paste them into your Codex settings yourself.");
  await page.emit("agents");
  assert.equal(page.document.activeElement?.dataset.focusKey, "agents:bridge:codex:copy", "focus stays on the copy button across a re-render");
  assert.equal(page.calls.filter(([name]) => name === "getAgentBridgeConfig").length, 2, "prepared settings for the same socket are kept");
  agentButton(page, "Turn off").click();
  await flush();
  assert.equal(bridgeRows(page).length, 0);
  assert.doesNotMatch(agentBody(page).textContent, /\bnull\b|\bundefined\b|\[object /u);
});

test("plugin settings: no verified bridge says so and offers no copy; an answer prepared for an earlier socket is never shown", async () => {
  const listening = socket => ({ ...ENDPOINT, enabled: true, state: "listening", socketPath: socket, methods: LIVE, capabilities: CAPABILITIES });
  const missing = toolHandlers({ getAgentEndpointState: () => listening("/synthetic/profile/.a/s"),
    getAgentBridgeConfig: () => { throw { code: "AGENT_BRIDGE_CONFIG_UNAVAILABLE", message: "AGENT_BRIDGE_CONFIG_UNAVAILABLE" }; } });
  const page = await loadPage({ hash: "#ai", handlers: missing.handlers });
  assert.equal(bridgeRows(page).length, 2);
  assert.ok(bridgeRows(page).every(row => /no verified copy of its agent bridge/u.test(row.textContent)));
  assert.equal(bridgeRows(page).flatMap(row => row.querySelectorAll("button")).length, 0);
  assert.equal(agentBody(page).querySelectorAll(".hook-row button").length, 2, "hook settings are unaffected");

  let release;
  const held = new Promise(resolve => { release = resolve; });
  const box = { socket: "/synthetic/a/.a/s" };
  const stale = toolHandlers({ getAgentEndpointState: () => listening(box.socket),
    getAgentBridgeConfig: ({ agent }) => {
      const socket = box.socket;
      const answer = { agent, text: `${agent} at ${socket}\n` };
      return socket === "/synthetic/a/.a/s" ? held.then(() => answer) : answer;
    } });
  const second = await loadPage({ hash: "#ai", handlers: stale.handlers });
  assert.equal(bridgeRows(second)[0].textContent.includes("Preparing…"), true);
  box.socket = "/synthetic/b/.a/s";
  await second.emit("agents");
  release();
  await flush(); await flush();
  const shown = bridgeRows(second).map(row => row.querySelector("pre code")?.textContent);
  assert.deepEqual(shown, ["claude-code at /synthetic/b/.a/s\n", "codex at /synthetic/b/.a/s\n"]);
  assert.doesNotMatch(agentBody(second).textContent, /synthetic\/a\//u, "the earlier socket's answer is dropped");
});

test("browser tools without the browser's capabilities say so; nothing is claimed as available", async () => {
  const { handlers } = agentHandlers();
  const page = await loadPage({ hash: "#ai", handlers });
  assert.equal(page.document.getElementById("agent-tools-text").textContent, "AxioSozo could not tell which browser tools are available.");
  assert.equal(agentBody(page).querySelectorAll(".tool-row").length, 0);
  const hidden = await loadPage({ hash: "#ai", handlers: { getAgentEndpointState: () => { throw { code: "PRIVATE_WINDOW", message: "x" }; } } });
  assert.equal(agentBody(hidden).querySelectorAll(".agent-tools").length, 0, "no tools list where agent status cannot be read");
});
