import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  AboutAxioSozoParent, validateSender, validateRequest, dispatch, METHODS, MESSAGES, EVENT_NAMES,
  checkWebUrl, readFlags, setProvidersForTesting,
} from "../chrome/AboutAxioSozoParent.sys.mjs";
import { createOverviewApi, exposeOverviewApi, isSendProjectErrorsActivation, AboutAxioSozoChild, SEND_ERRORS_BUTTON }
  from "../chrome/AboutAxioSozoChild.sys.mjs";
import { parseHtml, makeEvent } from "./support/mini-dom.mjs";
import * as ProviderStatus from "../chrome/ProviderStatus.sys.mjs";
import { decisionKeyStatus, storeDecisionKey, removeDecisionKey } from "../chrome/ProviderKeys.sys.mjs";
import { createDecisionKeyFixtureRuntime, KEY_FIXTURE_SHA256 } from "../chrome/DecisionKeyFixtureRuntime.sys.mjs";
import { keychainErrorText as pageKeychainErrorText } from "../chrome/overview/overview-model.mjs";
import {
  aboutFlags, AboutAxioSozoModule, registerAboutAxioSozo, registerOverviewActor, registerForCurrentProcess,
  unregisterAboutModuleInProcess, ACTOR_NAME, ACTOR_OPTIONS, PAGE_URL, PROCESS_SCRIPT_URL, CONTRACT_ID,
  UNREGISTER_MESSAGE,
} from "../chrome/AboutAxioSozo.sys.mjs";

const chrome = fileURLToPath(new URL("../chrome/", import.meta.url));
const UUID_A = "{11111111-2222-3333-4444-555555555555}";
const UUID_B = "{aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee}";

// ---------------------------------------------------------------- fakes

function goodSender(overrides = {}) {
  return {
    remoteType: "privilegedabout", documentURI: "about:axiosozo", isCurrentGlobal: true,
    isTopLevel: true, hasEmbedder: true, usePrivateBrowsing: false,
    principal: { isSystemPrincipal: false, isContentPrincipal: true, originNoSuffix: "about:axiosozo", privateBrowsingId: 0 },
    ...overrides,
  };
}

function fakeServices() {
  const calls = [];
  const listeners = new Map();
  const record = name => (...args) => { calls.push([name, ...args]); return null; };
  const services = new Proxy({
    listContexts: async () => { calls.push(["listContexts"]); return [{ uuid: UUID_A, name: "Work", container: 3 }]; },
    pickFolder: async window => { calls.push(["pickFolder", window]); return "/Users/test/fixture-app"; },
    detect: async root => { calls.push(["detect", root]); return { version: 1, name: "fixture-app" }; },
    confirmProject: async args => { calls.push(["confirmProject", args]); return { id: "p_abcd" }; },
    exportLedger: async () => "{\"version\":1}\n",
    saveRule: async () => { const error = new Error("hosts invalid"); error.code = "INVALID_RULE"; throw error; },
    on(name, callback) {
      calls.push(["on", name]);
      listeners.set(name, callback);
      return () => { calls.push(["off", name]); listeners.delete(name); };
    },
  }, { get: (target, name) => (name in target ? target[name] : typeof name === "string" ? record(name) : undefined) });
  return { services, calls, listeners };
}

function fakeActor({ sender = goodSender(), window = { name: "browser-window" } } = {}) {
  const actor = new AboutAxioSozoParent();
  const context = {
    parent: sender.isTopLevel ? null : {}, embedderElement: sender.hasEmbedder ? {} : null,
    usePrivateBrowsing: sender.usePrivateBrowsing, topChromeWindow: window,
  };
  context.top = sender.isTopLevel ? context : {};
  actor.browsingContext = context;
  actor.manager = {
    remoteType: sender.remoteType, isCurrentGlobal: sender.isCurrentGlobal,
    documentURI: sender.documentURI ? { spec: sender.documentURI } : null,
    documentPrincipal: sender.principal,
  };
  actor.sent = [];
  actor.sendAsyncMessage = (name, data) => actor.sent.push([name, data]);
  return actor;
}

const prefs = values => ({ getBoolPref: (name, fallback) => (name in values ? values[name] : fallback) });

function withProviders(services, prefValues = {}) {
  return setProvidersForTesting({ services: () => services, prefs: () => prefs(prefValues) });
}

const request = (actor, name, params) => actor.receiveMessage({ name: MESSAGES.REQUEST, data: { name, params } });

// ---------------------------------------------------------------- sender

test("sender validation accepts only the top-level about:axiosozo content principal in privilegedabout", () => {
  assert.equal(validateSender(goodSender()), true);
  assert.equal(validateSender(goodSender({ documentURI: "about:axiosozo?x#rules" })), true);
  const rejected = [
    goodSender({ principal: { ...goodSender().principal, isSystemPrincipal: true } }),
    goodSender({ principal: { ...goodSender().principal, isContentPrincipal: false } }),
    goodSender({ principal: { ...goodSender().principal, originNoSuffix: "https://evil.test" } }),
    goodSender({ principal: { ...goodSender().principal, originNoSuffix: "about:axiosozoevil" } }),
    goodSender({ documentURI: "about:axiosozoevil" }),
    goodSender({ remoteType: "webIsolated=https://evil.test" }),
    goodSender({ remoteType: "web" }),
    goodSender({ isTopLevel: false }),
    goodSender({ hasEmbedder: false }),
    goodSender({ isCurrentGlobal: false }),
    goodSender({ usePrivateBrowsing: true }),
    goodSender({ principal: { ...goodSender().principal, privateBrowsingId: 1 } }),
    goodSender({ principal: null }),
  ];
  for (const sender of rejected) assert.throws(() => validateSender(sender), { code: "SENDER_REJECTED" });
  // The log names which native fact was missing; both are refused alike.
  assert.throws(() => validateSender(goodSender({ isTopLevel: false })),
    { code: "SENDER_REJECTED", message: "about:axiosozo request rejected: not a top-level tab (browsing context is not top-level)" });
  assert.throws(() => validateSender(goodSender({ hasEmbedder: false })),
    { code: "SENDER_REJECTED", message: "about:axiosozo request rejected: not a top-level tab (no embedder element)" });
});

test("the actual actor refuses a tab without an embedder element, and admits the same document once it has one", async () => {
  const { services, calls } = fakeServices();
  const restore = withProviders(services);
  const logged = []; const originalError = console.error; console.error = (...args) => logged.push(args.join(" "));
  try {
    const actor = fakeActor();
    const embedder = actor.browsingContext.embedderElement;
    actor.browsingContext.embedderElement = null; // a tab still being attached
    const refused = await request(actor, "getOverviewFlags");
    assert.equal(refused.error.code, "SENDER_REJECTED");
    assert.deepEqual(logged, ["about:axiosozo request rejected: not a top-level tab (no embedder element)"]);
    actor.browsingContext.embedderElement = embedder; // attached: the same document is admitted
    assert.equal((await request(actor, "getOverviewFlags")).ok, true);
    assert.deepEqual(calls, [], "flags read nothing from the services");
  } finally { console.error = originalError; restore(); }
});

test("wrong principal is rejected before any service call", async () => {
  const { services, calls } = fakeServices();
  const restore = withProviders(services);
  try {
    const originalError = console.error; console.error = () => {};
    try {
      for (const sender of [
        goodSender({ principal: { ...goodSender().principal, originNoSuffix: "https://evil.test" } }),
        goodSender({ remoteType: "web" }),
        goodSender({ isTopLevel: false }),
      ]) {
        const reply = await request(fakeActor({ sender }), "listContexts", {});
        assert.deepEqual(reply.ok, false);
        assert.equal(reply.error.code, "SENDER_REJECTED");
      }
      const actor = fakeActor({ sender: goodSender({ remoteType: "web" }) });
      await actor.receiveMessage({ name: MESSAGES.SUBSCRIBE, data: {} });
    } finally { console.error = originalError; }
    assert.deepEqual(calls, []);
  } finally { restore(); }
});

// ---------------------------------------------------------------- dispatch

test("the method list is closed and matches contexts-api-v1 §3.3 plus refreshProjectDetection, P2 accounts, the project home, openContext, openUrl, flags, P3 agents, P4 plugin settings, decision keys and Understand", () => {
  assert.deepEqual(Object.keys(METHODS).sort(), [
    "acceptProjectBrief", "activeContext", "cancelDecisionKeyOperations", "cancelProjectReadOperations", "cancelUnderstand",
    "checkWatch", "clearLedger", "confirmProject", "deleteRule", "detect", "exportLedger",
    "getAgentBridgeConfig", "getAgentEndpointState", "getAgentHookConfig", "getDecisionKeyStatus", "getJevSettings",
    "getOverviewFlags", "getProject", "getProjectHome", "getProviderStatus", "getSafetyStatus", "getUnderstandAvailability", "getUnderstandState",
    "getWatchStatus", "linkOrganization", "linkProject",
    "listAgentActivity", "listAgentSessions", "listContexts",
    "listOrphans", "listProjectContainers", "listProjects", "listRules", "listWatches", "needsAttention", "openContext", "openProjectUrl", "openUrl", "pickFolder",
    "previewProjectBriefAcceptance", "projectForUrl", "readProject", "refreshProjectDetection", "reinspectProjectBriefAcceptance",
    "removeDecisionKey", "removeOrphans", "removeProject", "removeWatch", "retryWatchCleanup", "revokeAgentSession", "saveRule", "saveWatch", "serviceStatus",
    "setAccountLabel", "setAgentEndpointEnabled", "setContextType", "setEnginePreference", "setJevSettings", "setSharedSites", "storeDecisionKey", "updateProject",
    "usageSummary", "writeManifest",
  ]);
  // Watch changes and safety choices are trusted clicks only (private child messages):
  // their page names always refuse, and the safety choices have no page name at all.
  assert.ok(!Object.keys(METHODS).some(name => /confirm(Safety)?Choice|resolveSafety|userConfirmed|receipt|gesture/iu.test(name)));
  // Understand owners, roots, revisions, runtimes and openers never cross to the page.
  assert.ok(!Object.keys(METHODS).some(name => /owner|alias|revision|opener|snapshot|commit|invalidate/iu.test(name)));
  // Key material, runtimes and helpers are never page-named methods.
  assert.ok(!Object.keys(METHODS).some(name => /JevKey|readKey|runtime|fixture|helper|keychain/iu.test(name)));
  // Arrival is accepted in the native notification only (ProjectArrivalRuntime).
  assert.ok(!Object.keys(METHODS).some(name => /arrival/iu.test(name)));
  // Containers are assigned, cleared and observed by the browser only.
  assert.ok(!Object.keys(METHODS).some(name => /assign|ensure|identit|reset|forget|route|userContext/iu.test(name)));
  // Handoff, clipboard, presenters, return targets and diagnostics never cross to the page.
  assert.ok(!Object.keys(METHODS).some(name => /handoff|clipboard|presenter|return|diagnostic|authority|install|tool/iu.test(name)));
});

test("unknown methods, prototype names and malformed params are rejected at the parent boundary", async () => {
  const { services, calls } = fakeServices();
  const restore = withProviders(services);
  try {
    const actor = fakeActor();
    for (const name of ["on", "get", "constructor", "__proto__", "toString", "evalScript", "", 42]) {
      const reply = await actor.receiveMessage({ name: MESSAGES.REQUEST, data: { name, params: {} } });
      assert.equal(reply.error.code, "UNKNOWN_METHOD", String(name));
    }
    const cases = [
      ["setContextType", { uuid: UUID_A, type: "admin" }],
      ["setContextType", { uuid: "not-a-uuid", type: "project" }],
      ["setContextType", { uuid: UUID_A }],
      ["setContextType", { uuid: UUID_A, type: "project", extra: true }],
      ["listContexts", []],
      ["deleteRule", { id: "../r_1" }],
      ["usageSummary", { days: 0 }],
      ["usageSummary", { days: 366 }],
      ["removeOrphans", { uuids: [] }],
      ["getProject", { id: "p_ABC" }],
      ["saveRule", { rule: "x" }],
    ];
    for (const [name, params] of cases) {
      const reply = await request(actor, name, params);
      assert.equal(reply.error.code, "INVALID_PARAMS", `${name} ${JSON.stringify(params)}`);
    }
    const unknown = await actor.receiveMessage({ name: "AxioSozoOverview:Other", data: {} });
    assert.equal(unknown.error.code, "UNKNOWN_MESSAGE");
    assert.deepEqual(calls, []);
  } finally { restore(); }
});

test("valid requests map named params onto the services API", async () => {
  const { services, calls } = fakeServices();
  const restore = withProviders(services);
  try {
    const actor = fakeActor();
    assert.deepEqual((await request(actor, "listContexts")).value[0].uuid, UUID_A);
    await request(actor, "setContextType", { uuid: UUID_A, type: "organization" });
    await request(actor, "linkOrganization", { uuid: UUID_B, organizationUuid: UUID_A });
    await request(actor, "linkProject", { uuid: UUID_B, projectId: null });
    await request(actor, "usageSummary", { days: 30 });
    await request(actor, "removeOrphans", { uuids: [UUID_A] });
    await request(actor, "updateProject", { id: "p_abcd", patch: { context_uuid: UUID_A } });
    await request(actor, "setJevSettings", { patch: { consent: true, interval_minutes: 5 } });
    assert.deepEqual(calls.slice(1), [
      ["setContextType", UUID_A, "organization"],
      ["linkOrganization", UUID_B, UUID_A],
      ["linkProject", UUID_B, null],
      ["usageSummary", { days: 30 }],
      ["removeOrphans", [UUID_A]],
      ["updateProject", "p_abcd", { context_uuid: UUID_A }],
      ["setJevSettings", { consent: true, interval_minutes: 5 }],
    ]);
    const exported = await request(actor, "exportLedger");
    assert.equal(exported.value, "{\"version\":1}\n");
  } finally { restore(); }
});

test("activeContext asks services for the requesting tab's window only", async () => {
  const { services, calls } = fakeServices();
  const restore = withProviders(services);
  try {
    const window = { name: "requesting-window" };
    const actor = fakeActor({ window });
    await request(actor, "activeContext");
    assert.deepEqual(calls, [["activeContext", { window }]]);
    assert.equal((await request(actor, "activeContext", { window: "other" })).error.code, "INVALID_PARAMS");
  } finally { restore(); }
});

test("service errors keep their contract code; page cannot patch project root or Jev beyond bounds", async () => {
  const { services, calls } = fakeServices();
  const restore = withProviders(services);
  try {
    const actor = fakeActor();
    const saved = await request(actor, "saveRule", { rule: { version: 1 } });
    assert.deepEqual(saved, { ok: false, error: { code: "INVALID_RULE", message: "hosts invalid" } });
    for (const patch of [{ root: "/etc" }, { trusted: true }, { manifest_state: "written" }, {}, { context_uuid: "x" }]) {
      assert.equal((await request(actor, "updateProject", { id: "p_abcd", patch })).error.code, "INVALID_PARAMS");
    }
    for (const patch of [{ interval_minutes: 0 }, { interval_minutes: 31 }, { hourly_budget: 31 }, { consent: "yes" }, { key: "x" }]) {
      assert.equal((await request(actor, "setJevSettings", { patch })).error.code, "INVALID_PARAMS");
    }
    assert.equal(calls.some(([name]) => name === "updateProject" || name === "setJevSettings"), false);
  } finally { restore(); }
});

test("engine preference other than default is refused while the experimental pref is off", async () => {
  const { services, calls } = fakeServices();
  let restore = withProviders(services, {});
  try {
    const actor = fakeActor();
    assert.equal((await request(actor, "setEnginePreference", { uuid: UUID_A, engine: "chromium" })).error.code, "DISABLED");
    assert.equal((await request(actor, "setEnginePreference", { uuid: UUID_A, engine: null })).ok, true);
    restore();
    restore = withProviders(services, { "axiosozo.engine.preferences.enabled": true });
    assert.equal((await request(actor, "setEnginePreference", { uuid: UUID_A, engine: "chromium" })).ok, true);
    assert.deepEqual(calls, [["setEnginePreference", UUID_A, null], ["setEnginePreference", UUID_A, "chromium"]]);
    assert.deepEqual((await request(actor, "getOverviewFlags")).value,
      { contexts: true, enginePreferences: true, jevKeyEntry: false, openaiKeyEntry: false, home: false });
    restore();
    restore = withProviders(services, { "axiosozo.jev.keyEntry.enabled": true, "axiosozo.openai.keyEntry.enabled": true });
    assert.deepEqual((await request(actor, "getOverviewFlags")).value,
      { contexts: true, enginePreferences: false, jevKeyEntry: true, openaiKeyEntry: true, home: false });
  } finally { restore(); }
});

test("folder picking uses the requesting tab's window and only picked roots can be detected or confirmed", async () => {
  const { services, calls } = fakeServices();
  const restore = withProviders(services);
  try {
    const window = { name: "top-chrome-window" };
    const actor = fakeActor({ window });
    assert.equal((await request(actor, "pickFolder", { window: "other" })).error.code, "INVALID_PARAMS");
    assert.equal((await request(actor, "detect", { root: "/Users/test/secret" })).error.code, "ROOT_NOT_PICKED");
    const picked = await request(actor, "pickFolder");
    assert.equal(picked.value, "/Users/test/fixture-app");
    assert.equal(calls[0][1], window);
    assert.equal((await request(actor, "detect", { root: "/Users/test/fixture-app" })).ok, true);
    // A different page instance (new actor) does not inherit the pick.
    assert.equal((await request(fakeActor(), "detect", { root: "/Users/test/fixture-app" })).error.code, "ROOT_NOT_PICKED");
    const manifest = { version: 1, name: "App", kind: "web", environments: [], services: [], surfaces: [] };
    const confirmed = await request(actor, "confirmProject", { root: "/Users/test/fixture-app", manifest, contextUuid: UUID_A });
    assert.deepEqual(confirmed.value, { id: "p_abcd" });
    assert.deepEqual(calls.at(-1), ["confirmProject", { root: "/Users/test/fixture-app", manifest, contextUuid: UUID_A }]);
    // The pick is consumed by confirmation.
    assert.equal((await request(actor, "detect", { root: "/Users/test/fixture-app" })).error.code, "ROOT_NOT_PICKED");
    actor.didDestroy();
  } finally { restore(); }
});

test("openUrl accepts only http(s) without credentials and opens in the requesting window", async () => {
  for (const url of ["javascript:alert(1)", "file:///etc/passwd", "about:config", "chrome://browser/content/browser.xhtml",
    "data:text/html,x", "https://user:pw@example.test/", "moz-extension://x/y", "view-source:https://example.test/", "not a url"]) {
    assert.throws(() => checkWebUrl(url), { code: "INVALID_URL" }, url);
  }
  assert.equal(checkWebUrl("https://example.test/a?b#c"), "https://example.test/a?b#c");

  const { services, calls } = fakeServices();
  const opened = [];
  const window = { openWebLinkIn: (...args) => opened.push(args) };
  const restore = withProviders({ ...services, on: services.on, listContexts: services.listContexts, openUrl: undefined });
  try {
    const actor = fakeActor({ window });
    assert.equal((await request(actor, "openUrl", { url: "javascript:alert(1)" })).error.code, "INVALID_URL");
    assert.deepEqual(opened, []);
    assert.equal((await request(actor, "openUrl", { url: "http://localhost:5173/x", contextUuid: UUID_A })).ok, true);
    assert.deepEqual(opened, [["http://localhost:5173/x", "tab", { userContextId: 3, relatedToCurrent: true }]]);
  } finally { restore(); }

  const withService = [];
  const restore2 = withProviders({ openUrl: args => { withService.push(args); return true; }, on: () => () => {} });
  try {
    await request(fakeActor({ window }), "openUrl", { url: "https://example.test/", contextUuid: UUID_B });
    assert.deepEqual(withService, [{ window, url: "https://example.test/", contextUuid: UUID_B }]);
  } finally { restore2(); }
  assert.ok(calls.every(([name]) => name !== "openUrl"));
});

test("P2 account methods: closed shapes, no container IDs, project links in the requesting window only", async () => {
  const { services, calls } = fakeServices();
  const restore = withProviders(services);
  try {
    const window = { name: "requesting-window" };
    const actor = fakeActor({ window });
    assert.equal((await request(actor, "listProjectContainers")).ok, true);
    await request(actor, "setAccountLabel", { projectId: "p_abcd", key: "vercel", label: "work Google" });
    await request(actor, "setAccountLabel", { projectId: "p_abcd", key: "*.atlassian.net", label: null });
    await request(actor, "setSharedSites", { projectId: "p_abcd", hosts: ["github.com", "*.github.com"], confirmed: true });
    await request(actor, "setSharedSites", { projectId: "p_abcd", hosts: [], confirmed: false });
    await request(actor, "openProjectUrl", { projectId: "p_abcd", url: "https://vercel.com/team/x" });
    assert.deepEqual(calls, [
      ["listProjectContainers"],
      ["setAccountLabel", "p_abcd", { key: "vercel", label: "work Google" }],
      ["setAccountLabel", "p_abcd", { key: "*.atlassian.net", label: null }],
      ["setSharedSites", "p_abcd", { hosts: ["github.com", "*.github.com"], confirmed: true }],
      ["setSharedSites", "p_abcd", { hosts: [], confirmed: false }],
      ["openProjectUrl", { window, projectId: "p_abcd", url: "https://vercel.com/team/x" }],
    ]);
    calls.length = 0;
    const refused = [
      ["listProjectContainers", { projectId: "p_abcd" }],
      ["setAccountLabel", { projectId: "p_abcd", key: "vercel" }],
      ["setAccountLabel", { projectId: "p_abcd", key: "vercel", label: "x", userContextId: 40 }],
      ["setAccountLabel", { projectId: "p_abcd", key: "a b", label: "x" }],
      ["setAccountLabel", { projectId: "p_abcd", key: "", label: "x" }],
      ["setAccountLabel", { projectId: "p_abcd", key: "x".repeat(254), label: "x" }],
      ["setAccountLabel", { projectId: "p_abcd", key: "vercel", label: "x".repeat(201) }],
      ["setAccountLabel", { projectId: "p_abcd", key: "vercel", label: 5 }],
      ["setAccountLabel", { projectId: "../p", key: "vercel", label: "x" }],
      ["setSharedSites", { projectId: "p_abcd", hosts: ["github.com"], confirmed: "true" }],
      ["setSharedSites", { projectId: "p_abcd", hosts: "github.com", confirmed: true }],
      ["setSharedSites", { projectId: "p_abcd", hosts: Array.from({ length: 33 }, (_, i) => `s${i}.example`), confirmed: true }],
      ["setSharedSites", { projectId: "p_abcd", hosts: ["github.com"], confirmed: true, container: { user_context_id: 1 } }],
      ["openProjectUrl", { projectId: "p_abcd", url: "https://vercel.com/", userContextId: 0 }],
      ["openProjectUrl", { projectId: "p_abcd", url: "https://vercel.com/", contextUuid: UUID_A }],
      ["openProjectUrl", { projectId: "p_abcd", url: "https://vercel.com/", window: "other" }],
      ["openProjectUrl", { url: "https://vercel.com/" }],
      ["updateProject", { id: "p_abcd", patch: { container: { user_context_id: 40 } } }],
      ["updateProject", { id: "p_abcd", patch: { accounts: [] } }],
      ["updateProject", { id: "p_abcd", patch: { shared_sites: { hosts: [], confirmed: true } } }],
    ];
    for (const [name, params] of refused) {
      assert.equal((await request(actor, name, params)).error.code, "INVALID_PARAMS", `${name} ${JSON.stringify(params).slice(0, 80)}`);
    }
    for (const url of ["javascript:alert(1)", "file:///etc/passwd", "https://u:p@vercel.com/", "about:config"]) {
      assert.equal((await request(actor, "openProjectUrl", { projectId: "p_abcd", url })).error.code, "INVALID_URL");
    }
    assert.equal((await request(fakeActor({ window: null }), "openProjectUrl", { projectId: "p_abcd", url: "https://vercel.com/" })).error.code, "NO_WINDOW");
    assert.deepEqual(calls, [], "nothing reached the services");
  } finally { restore(); }
});

test("project home: an id only, for the requesting tab's window; never a root, container, window or private tab", async () => {
  const { services, calls } = fakeServices();
  const restore = withProviders(services);
  try {
    const window = { name: "owner-window" };
    const actor = fakeActor({ window });
    assert.equal((await request(actor, "getProjectHome", { id: "p_abcd" })).ok, true);
    assert.deepEqual(calls, [["projectHome", { window, id: "p_abcd" }]], "the service gets the requesting window, never a page-named one");
    calls.length = 0;
    for (const params of [{}, { id: "../p_abcd" }, { id: "P_ABCD" }, { id: "/Users/test/fixture-app" }, { id: 40 },
      { id: "p_abcd", root: "/Users/test/fixture-app" }, { id: "p_abcd", window: "other" }, { id: "p_abcd", userContextId: 40 },
      { id: "p_abcd", container: { user_context_id: 40 } }, { projectId: "p_abcd" }]) {
      assert.equal((await request(actor, "getProjectHome", params)).error.code, "INVALID_PARAMS", JSON.stringify(params));
    }
    assert.equal((await request(fakeActor({ window: null }), "getProjectHome", { id: "p_abcd" })).error.code, "NO_WINDOW");
    // A private about:axiosozo tab passes the sender check (matching principal) but gets no project home.
    const priv = fakeActor({ window, sender: goodSender({ usePrivateBrowsing: true,
      principal: { ...goodSender().principal, privateBrowsingId: 1 } }) });
    assert.equal((await request(priv, "getProjectHome", { id: "p_abcd" })).error.code, "PRIVATE_WINDOW");
    assert.deepEqual(calls, [], "nothing reached the services");
  } finally { restore(); }
  const restore2 = withProviders({});
  try {
    assert.equal((await request(fakeActor(), "getProjectHome", { id: "p_abcd" })).error.code, "UNSUPPORTED");
  } finally { restore2(); }
});

test("openContext goes through services with the requesting window and reports when unsupported", async () => {
  const window = { name: "w" };
  const opened = [];
  let restore = withProviders({ openContext: args => { opened.push(args); return true; } });
  try {
    assert.equal((await request(fakeActor({ window }), "openContext", { uuid: UUID_A })).ok, true);
    assert.deepEqual(opened, [{ window, uuid: UUID_A }]);
  } finally { restore(); }
  restore = withProviders({});
  try {
    assert.equal((await request(fakeActor({ window }), "openContext", { uuid: UUID_A })).error.code, "UNSUPPORTED");
  } finally { restore(); }
});

test("service events reach subscribed pages as names only, and stop after destroy", async () => {
  const { services, calls, listeners } = fakeServices();
  const restore = withProviders(services);
  try {
    const actor = fakeActor();
    await actor.receiveMessage({ name: MESSAGES.SUBSCRIBE, data: {} });
    await actor.receiveMessage({ name: MESSAGES.SUBSCRIBE, data: {} });
    assert.deepEqual(calls.filter(([name]) => name === "on").map(([, event]) => event), EVENT_NAMES);
    listeners.get("rules")({ secret: "payload" });
    assert.deepEqual(actor.sent, [[MESSAGES.EVENT, { name: "rules" }]]);
    actor.didDestroy();
    assert.equal(listeners.size, 0);
    assert.equal(calls.filter(([name]) => name === "off").length, EVENT_NAMES.length);
  } finally { restore(); }
});

// ---------------------------------------------------------------- providers and decision keys

const KEY = "synthetic-key-not-real-0123";
const KEY_CODES = ["INVALID_PROVIDER", "KEY_ENTRY_DISABLED", "INVALID_KEY", "KEYCHAIN_HELPER_UNAVAILABLE",
  "KEYCHAIN_REFUSED", "HELPER_TIMEOUT", "HELPER_OUTPUT_LIMIT", "SETTINGS_CLOSED"];
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

/** ProviderStatus as the actor sees it; `gates` hold an operation until released. */
function fakeProviderStatus({ storeError = null, gates = null } = {}) {
  const calls = [];
  const keys = { jev: "missing", openai: "missing" };
  const entry = provider => ({ id: provider, state: keys[provider] === "stored" ? "key-stored" : "needs-key", key: keys[provider] });
  let next = 0;
  const gate = async () => { if (gates && next < gates.length) await gates[next++].promise; };
  return { calls, keys, module: {
    getProviderStatus: async () => { calls.push(["getProviderStatus"]); return { version: 1, providers: [] }; },
    getDecisionKeyStatus: async (provider, options) => { calls.push(["status", provider, options]); await gate(); return entry(provider); },
    storeDecisionKeyAndReport: async (provider, secret, options) => {
      calls.push(["store", provider, secret.length, options]);
      await gate();
      if (storeError) throw new Error(storeError);
      keys[provider] = "stored"; return entry(provider);
    },
    removeDecisionKeyAndReport: async (provider, options) => {
      calls.push(["remove", provider, options]); await gate(); keys[provider] = "missing"; return entry(provider);
    },
  } };
}
/** Services that know `registered` windows as normal ones; any other call is recorded. */
function keyServices(...registered) {
  const calls = [];
  const services = new Proxy({ on: () => () => {}, isNormalWindow: window => registered.includes(window) }, {
    get: (target, name) => (name in target ? target[name] : typeof name === "string" ? (...args) => { calls.push([name, ...args]); return null; } : undefined) });
  return { services, calls };
}
function withProviderStatus(fake, services, prefValues = {}) {
  return setProvidersForTesting({ services: () => services, prefs: () => prefs(prefValues), providerStatus: () => fake.module });
}

test("provider status and decision-key methods go to ProviderStatus with the actor's own signal, never to services, and never echo the key", async () => {
  const window = { name: "normal-window" };
  const { services, calls: serviceCalls } = keyServices(window);
  const fake = fakeProviderStatus();
  const restore = withProviderStatus(fake, services);
  const logged = []; const originalError = console.error; console.error = (...args) => logged.push(args);
  try {
    const actor = fakeActor({ window });
    assert.deepEqual((await request(actor, "getProviderStatus")).value, { version: 1, providers: [] });
    assert.equal((await request(actor, "getDecisionKeyStatus", { provider: "openai" })).value.state, "needs-key");
    const params = { provider: "jev", key: KEY };
    const stored = await request(actor, "storeDecisionKey", params);
    assert.deepEqual(stored, { ok: true, value: { id: "jev", state: "key-stored", key: "stored" } });
    assert.equal((await request(actor, "getDecisionKeyStatus", { provider: "openai" })).value.state, "needs-key", "OpenAI is untouched");
    assert.equal((await request(actor, "removeDecisionKey", { provider: "jev" })).value.state, "needs-key");
    assert.deepEqual(fake.calls.map(call => call.slice(0, call[0] === "store" ? 3 : 2)),
      [["getProviderStatus"], ["status", "openai"], ["store", "jev", KEY.length], ["status", "openai"], ["remove", "jev"]]);
    for (const call of fake.calls.slice(1)) {
      const options = call.at(-1);
      assert.deepEqual(Object.keys(options), ["signal", "isActive"], "only the actor's own authority; the page supplies no option");
      assert.ok(options.signal instanceof AbortSignal); assert.equal(options.signal.aborted, false);
      assert.equal(typeof options.isActive, "function");
    }
    assert.deepEqual(serviceCalls, [], "keys never reach AxioSozoServices");
    assert(!JSON.stringify(stored).includes(KEY)); assert.deepEqual(logged, []);
  } finally { console.error = originalError; restore(); }
});

test("decision-key params are strict; failures carry fixed codes without the key; the Jev-only methods are gone", async () => {
  const window = { name: "normal-window" };
  const fake = fakeProviderStatus({ storeError: `helper said ${KEY}` });
  const restore = withProviderStatus(fake, keyServices(window).services);
  try {
    const actor = fakeActor({ window });
    const refused = [
      ["getDecisionKeyStatus", {}], ["getDecisionKeyStatus", { provider: "anthropic" }], ["getDecisionKeyStatus", { provider: "JEV" }],
      ["getDecisionKeyStatus", { provider: "jev", runtime: {} }], ["getDecisionKeyStatus", { provider: "jev", signal: {} }],
      ["getDecisionKeyStatus", { provider: "jev", path: "/Volumes/AxioSozoBuild/workstation/providers/keychain" }],
      ["getDecisionKeyStatus", { provider: "jev", fixtureRoot: "/Volumes/AxioSozoBuild/workstation/gui-fixtures/keys-0" }],
      ["getDecisionKeyStatus", { provider: "jev", env: { AXIOSOZO_SYNTHETIC_TEST: "1" } }],
      ["storeDecisionKey", { provider: "jev" }], ["storeDecisionKey", { key: KEY }], ["storeDecisionKey", { provider: "jev", key: 12345678 }],
      ["storeDecisionKey", { provider: "jev", key: "x".repeat(4097) }], ["storeDecisionKey", { provider: "jev", key: KEY, extra: 1 }],
      ["storeDecisionKey", { provider: "openai", key: KEY, executable: "/bin/sh" }], ["storeDecisionKey", { provider: "jev", key: KEY, runtime: {} }],
      ["removeDecisionKey", {}], ["removeDecisionKey", { provider: "jev", key: KEY }], ["cancelDecisionKeyOperations", { provider: "jev" }],
      ["getProviderStatus", { x: 1 }],
    ];
    for (const [name, params] of refused) {
      const reply = await request(actor, name, params);
      assert.equal(reply.error.code, "INVALID_PARAMS", `${name} ${JSON.stringify(params).slice(0, 60)}`);
      assert(!reply.error.message.includes(KEY));
    }
    for (const name of ["getJevKeyStatus", "storeJevKey", "removeJevKey"]) {
      assert.equal((await request(actor, name, { key: KEY })).error.code, "UNKNOWN_METHOD");
    }
    assert.deepEqual(fake.calls, [], "nothing reached ProviderStatus");
    const failed = await request(actor, "storeDecisionKey", { provider: "openai", key: KEY });
    assert.equal(failed.error.code, "KEYCHAIN_HELPER_UNAVAILABLE");
    assert(!JSON.stringify(failed).includes(KEY));
  } finally { restore(); }
  for (const code of KEY_CODES) {
    const again = withProviderStatus(fakeProviderStatus({ storeError: code }), keyServices(window).services);
    try {
      const reply = await request(fakeActor({ window }), "storeDecisionKey", { provider: "jev", key: KEY });
      assert.deepEqual(reply.error, { code, message: `storeDecisionKey failed (${code})` });
    } finally { again(); }
  }
});

test("decision keys need a registered normal window and the current document, before any work and after it answered", async () => {
  const window = { name: "normal-window" };
  const fake = fakeProviderStatus();
  const restore = withProviderStatus(fake, keyServices(window).services);
  const each = [["getDecisionKeyStatus", { provider: "jev" }], ["storeDecisionKey", { provider: "jev", key: KEY }], ["removeDecisionKey", { provider: "openai" }]];
  try {
    const priv = fakeActor({ window, sender: goodSender({ usePrivateBrowsing: true, principal: { ...goodSender().principal, privateBrowsingId: 1 } }) });
    for (const [name, params] of each) assert.equal((await request(priv, name, { ...params })).error.code, "PRIVATE_WINDOW", name);
    // A window the browser does not know as normal (unregistered, or privacy unknown) is refused too.
    const stranger = fakeActor({ window: { name: "unregistered" } });
    for (const [name, params] of each) assert.equal((await request(stranger, name, { ...params })).error.code, "PRIVATE_WINDOW", name);
    const windowless = fakeActor({ window: null });
    for (const [name, params] of each) assert.equal((await request(windowless, name, { ...params })).error.code, "NO_WINDOW", name);
    const unknown = { services: keyServices(window).services, window: () => window, isPrivate: () => undefined, current: () => true,
      providers: () => fake.module, keyLease: () => assert.fail("no lease before admission") };
    await assert.rejects(dispatch(unknown, { name: "getDecisionKeyStatus", params: { provider: "jev" } }), { code: "PRIVATE_WINDOW" });
    const stale = { ...unknown, isPrivate: () => false, current: () => false };
    await assert.rejects(dispatch(stale, { name: "storeDecisionKey", params: { provider: "jev", key: KEY } }), { code: "DOCUMENT_GONE" });
    assert.deepEqual(fake.calls, [], "no admission, helper or status work before the window check");
  } finally { restore(); }

  // The page went away while the Keychain worked: the answer is refused, not shown.
  const gates = [deferred(), deferred()];
  const held = fakeProviderStatus({ gates });
  const other = { name: "other-normal-window" };
  const restore2 = withProviderStatus(held, keyServices(window, other).services);
  try {
    const actor = fakeActor({ window });
    const gone = request(actor, "storeDecisionKey", { provider: "jev", key: KEY });
    await new Promise(resolve => setTimeout(resolve, 0));
    actor.manager.isCurrentGlobal = false;
    gates[0].resolve();
    assert.equal((await gone).error.code, "DOCUMENT_GONE");
    const moved = fakeActor({ window });
    const late = request(moved, "removeDecisionKey", { provider: "jev" });
    await new Promise(resolve => setTimeout(resolve, 0));
    moved.browsingContext.topChromeWindow = other;
    gates[1].resolve();
    assert.equal((await late).error.code, "NO_WINDOW", "a tab moved to another window gets no answer");
  } finally { restore2(); }
});

test("the actor owns cancellation: cancel and destroy abort only this document's key work; one change per provider at a time", async () => {
  const window = { name: "normal-window" };
  const gates = [deferred(), deferred(), deferred(), deferred()];
  const fake = fakeProviderStatus({ gates });
  const restore = withProviderStatus(fake, keyServices(window).services);
  try {
    const actor = fakeActor({ window });
    const neighbour = fakeActor({ window });
    const storing = request(actor, "storeDecisionKey", { provider: "jev", key: KEY });
    const openai = request(actor, "storeDecisionKey", { provider: "openai", key: KEY });
    const other = request(neighbour, "removeDecisionKey", { provider: "jev" });
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal((await request(actor, "storeDecisionKey", { provider: "jev", key: KEY })).error.code, "BUSY", "a second Jev change waits");
    assert.equal((await request(actor, "removeDecisionKey", { provider: "jev" })).error.code, "BUSY");
    const [jevSignal, openaiSignal, neighbourSignal] = fake.calls.map(call => call.at(-1).signal);
    assert.equal(jevSignal, openaiSignal, "one lifetime for this document's key work");
    assert.notEqual(jevSignal, neighbourSignal);
    assert.equal((await request(actor, "cancelDecisionKeyOperations")).ok, true);
    assert.deepEqual([jevSignal.aborted, neighbourSignal.aborted], [true, false], "another page's work is not cancelled");
    gates[0].resolve(); gates[1].resolve(); gates[2].resolve();
    await Promise.all([storing, openai, other]);
    // After a cancel, new work gets a fresh lifetime and the provider is free again.
    const again = request(actor, "storeDecisionKey", { provider: "jev", key: KEY });
    await new Promise(resolve => setTimeout(resolve, 0));
    const fresh = fake.calls.at(-1).at(-1).signal;
    assert.equal(fresh.aborted, false);
    actor.didDestroy();
    assert.equal(fresh.aborted, true, "destroying the actor cancels its key work");
    gates[3].resolve();
    assert.equal((await again).error.code, "DOCUMENT_GONE");
  } finally { restore(); }
});

test("with the real ProviderStatus and ProviderKeys behind the actor: both providers store, report and remove independently", async () => {
  const status = await import("../chrome/ProviderStatus.sys.mjs");
  const keys = await import("../chrome/ProviderKeys.sys.mjs");
  const items = new Set(); const stdin = [];
  const runtime = () => ({ env: name => (name === "AXIOSOZO_BUILD_ROOT" ? "/Volumes/AxioSozoBuild/workstation" : ""),
    timers: { setTimeout, clearTimeout }, verifyHelper: async () => true,
    async spawn({ arguments: [operation, provider = "jev"] }) {
      let closed, input = ""; const done = new Promise(resolve => { closed = resolve; });
      const empty = { readString: async () => "" };
      return { stdout: empty, stderr: empty, kill: async () => {},
        stdin: { write: async value => { input += value; stdin.push(value); }, close: async () => closed() },
        async wait() {
          await done;
          if (operation === "exists") return { exitCode: items.has(provider) ? 0 : 44 };
          if (operation === "remove") return { exitCode: items.delete(provider) ? 0 : 44 };
          if (!input) return { exitCode: 1 };
          items.add(provider); return { exitCode: 0 };
        } };
    } });
  const options = extra => ({ ...extra, prefs: prefs({ "axiosozo.jev.keyEntry.enabled": true, "axiosozo.openai.keyEntry.enabled": true }),
    keys: { runtime: async () => runtime(), status: keys.decisionKeyStatus, store: keys.storeDecisionKey, remove: keys.removeDecisionKey } });
  const module = {
    getDecisionKeyStatus: (provider, o) => status.getDecisionKeyStatus(provider, options(o)),
    storeDecisionKeyAndReport: (provider, secret, o) => status.storeDecisionKeyAndReport(provider, secret, options(o)),
    removeDecisionKeyAndReport: (provider, o) => status.removeDecisionKeyAndReport(provider, options(o)),
  };
  const window = { name: "normal-window" };
  const restore = setProvidersForTesting({ services: () => keyServices(window).services, prefs: () => prefs({}), providerStatus: () => module });
  try {
    const actor = fakeActor({ window });
    const state = async provider => (await request(actor, "getDecisionKeyStatus", { provider })).value.state;
    const stored = await request(actor, "storeDecisionKey", { provider: "openai", key: KEY });
    assert.equal(stored.value.state, "key-stored"); assert.equal(stored.value.shape_status, "UNVERIFIED_SHAPE");
    assert.deepEqual([await state("jev"), await state("openai")], ["needs-key", "key-stored"]);
    assert.equal((await request(actor, "storeDecisionKey", { provider: "jev", key: "short" })).error.code, "INVALID_KEY");
    assert.equal((await request(actor, "storeDecisionKey", { provider: "jev", key: "synthetic-jev-key-0000" })).value.state, "key-stored");
    assert.equal((await request(actor, "removeDecisionKey", { provider: "openai" })).value.state, "needs-key");
    assert.deepEqual([await state("jev"), await state("openai")], ["key-stored", "needs-key"]);
    assert.deepEqual(stdin, [KEY, "synthetic-jev-key-0000"]);
    assert(!JSON.stringify(stored).includes(KEY));
  } finally { restore(); }
});

// ---------------------------------------------------------------- key authority through the actual actor

const until = async condition => { for (let i = 0; i < 400 && !condition(); i++) await new Promise(resolve => setImmediate(resolve)); };
const quietly = async run => { const previous = console.error; console.error = () => {}; try { return await run(); } finally { console.error = previous; } };

/**
 * The actual AboutAxioSozoParent over the real ProviderStatus and ProviderKeys.
 * Only the runtime factory, its helper pipes and the window registry are fakes.
 * `hold` pauses the first factory admission ("factory") or helper verification
 * ("verify"); `fixture` makes the factory root's real generic fixture runtime.
 */
function keyHarness({ hold = null, waitFails = false, fixture = null } = {}) {
  const window = { name: "normal-window" }, other = { name: "other-normal-window" };
  const registered = new Set([window, other]);
  const actor = fakeActor({ window });
  const state = { admissions: 0, verifications: 0, spawns: 0, stdin: [], signals: [], present: new Set(), release: null };
  const pause = () => new Promise(resolve => { state.release = resolve; });
  const runtime = () => ({
    env: name => (name === "AXIOSOZO_BUILD_ROOT" ? "/Volumes/AxioSozoBuild/workstation" : ""),
    timers: { setTimeout, clearTimeout },
    verifyHelper: async () => { state.verifications++; if (hold === "verify" && state.verifications === 1) await pause(); return true; },
    async spawn({ arguments: [operation, provider = "jev"] }) {
      state.spawns++;
      let closed, input = ""; const done = new Promise(resolve => { closed = resolve; });
      const empty = { readString: async () => "" };
      return { stdout: empty, stderr: empty, kill: async () => {},
        stdin: { write: async value => { input += value; state.stdin.push(value); }, close: async () => closed() },
        async wait() {
          await done;
          if (waitFails) throw new Error("invented wait failure after stdin");
          if (operation === "exists") return { exitCode: state.present.has(provider) ? 0 : 44 };
          if (operation === "remove") return { exitCode: state.present.delete(provider) ? 0 : 44 };
          if (!input) return { exitCode: 1 };
          state.present.add(provider); return { exitCode: 0 };
        } };
    } });
  const keys = { status: decisionKeyStatus, store: storeDecisionKey, remove: removeDecisionKey,
    runtime: async options => {
      state.admissions++; state.signals.push(options.signal);
      if (hold === "factory" && state.admissions === 1) await pause();
      return fixture ? createDecisionKeyFixtureRuntime(fixture, options) : runtime();
    } };
  const keyPrefs = prefs({ "axiosozo.jev.keyEntry.enabled": true, "axiosozo.openai.keyEntry.enabled": true });
  const module = {
    getDecisionKeyStatus: (provider, options) => ProviderStatus.getDecisionKeyStatus(provider, { ...options, prefs: keyPrefs, keys }),
    storeDecisionKeyAndReport: (provider, secret, options) => ProviderStatus.storeDecisionKeyAndReport(provider, secret, { ...options, prefs: keyPrefs, keys }),
    removeDecisionKeyAndReport: (provider, options) => ProviderStatus.removeDecisionKeyAndReport(provider, { ...options, prefs: keyPrefs, keys }),
  };
  const services = { on: () => () => {}, isNormalWindow: candidate => registered.has(candidate) };
  const restore = setProvidersForTesting({ services: () => services, prefs: () => keyPrefs, providerStatus: () => module });
  return { actor, window, other, registered, state, restore,
    store: (provider = "jev") => request(actor, "storeDecisionKey", { provider, key: KEY }),
    remove: (provider = "jev") => request(actor, "removeDecisionKey", { provider }),
    status: (provider = "jev") => request(actor, "getDecisionKeyStatus", { provider }) };
}
// Root's real generic fixture runtime underneath (fake native callbacks only).
function fixtureNative({ pauseAt = 0 } = {}) {
  const id = "e".repeat(32);
  const env = { AXIOSOZO_SYNTHETIC_TEST: "1", AXIOSOZO_KEY_GUI_FIXTURE_ROOT: `/Volumes/AxioSozoBuild/workstation/gui-fixtures/keys-${id}` };
  const box = { present: new Set(), spawns: [], stdin: [], verified: 0, release: null };
  box.native = {
    timers: { setTimeout, clearTimeout }, env: name => env[name],
    profilePath: () => `/Volumes/AxioSozoBuild/workstation/runtime/e626697ad91fe95c/plan4-keys-${id}/gecko`,
    async verifyFile() {
      box.verified++;
      if (box.verified === pauseAt) await new Promise(resolve => { box.release = resolve; });
      return true;
    },
    sha256: async () => KEY_FIXTURE_SHA256,
    async spawn(options) {
      const [operation, provider = "jev"] = options.arguments.slice(4);
      box.spawns.push([operation, provider]);
      let input = "", done; const exit = new Promise(resolve => { done = resolve; });
      const quiet = { readString: async () => null, close: async () => {} };
      return { stdout: quiet, stderr: quiet, kill: async () => {}, wait: () => exit,
        stdin: { write: async value => { input = value; box.stdin.push(value); }, close: async () => {
          if (operation === "store") { if (input) box.present.add(provider); done({ exitCode: input ? 0 : 2 }); }
          else if (operation === "exists") done({ exitCode: box.present.has(provider) ? 0 : 44 });
          else done({ exitCode: box.present.delete(provider) ? 0 : 44 });
        } } };
    } };
  return box;
}

test("the actual actor refuses missing, malformed or throwing privacy and current-document facts before any key work", async () => {
  const thrower = () => { throw new Error("native fact unavailable"); };
  const cases = {
    "privacy missing": actor => { delete actor.browsingContext.usePrivateBrowsing; },
    "privacy throws": actor => { Object.defineProperty(actor.browsingContext, "usePrivateBrowsing", { get: thrower }); },
    "privacy not boolean": actor => { actor.browsingContext.usePrivateBrowsing = "false"; },
    "principal privacy missing": actor => { delete actor.manager.documentPrincipal.privateBrowsingId; },
    "current-global missing": actor => { delete actor.manager.isCurrentGlobal; },
    "current-global throws": actor => { Object.defineProperty(actor.manager, "isCurrentGlobal", { get: thrower }); },
    "manager missing": actor => { actor.manager = null; },
    "manager throws": actor => { Object.defineProperty(actor, "manager", { get: thrower }); },
    "context throws": actor => { Object.defineProperty(actor, "browsingContext", { get: thrower }); },
  };
  for (const [label, mutate] of Object.entries(cases)) {
    const h = keyHarness();
    try {
      h.actor.manager.documentPrincipal = { ...h.actor.manager.documentPrincipal };
      mutate(h.actor);
      for (const send of [h.store, h.remove, h.status]) {
        const reply = await quietly(() => send("jev"));
        assert.equal(reply.ok, false, label);
        assert.equal(reply.error.code, "SENDER_REJECTED", label);
      }
      assert.deepEqual([h.state.admissions, h.state.spawns, h.state.stdin.length], [0, 0, 0], `${label}: no admission, helper or key`);
    } finally { h.restore(); }
  }
});

test("the current document lost while the factory admits: the key never reaches the helper, with or without the page's cancel", async () => {
  for (const cancel of [false, true]) {
    const h = keyHarness({ hold: "factory" });
    try {
      const pending = h.store();
      await until(() => h.state.release);
      assert.deepEqual([h.state.admissions, h.state.stdin.length], [1, 0]);
      h.actor.manager.isCurrentGlobal = false;
      if (cancel) {
        // The stale page's cancel is refused by the sender check, which still ends this document's key work.
        const reply = await quietly(() => request(h.actor, "cancelDecisionKeyOperations", {}));
        assert.equal(reply.error.code, "SENDER_REJECTED");
        assert.equal(h.state.signals[0].aborted, true);
      } else assert.equal(h.state.signals[0].aborted, false, "the live authority alone must stop it");
      h.state.release();
      const reply = await pending;
      assert.equal(reply.ok, false);
      assert.equal(reply.error.code, "DOCUMENT_GONE");
      assert.deepEqual([h.state.spawns, h.state.stdin], [0, []], `cancel=${cancel}: no helper and no key`);
      assert.equal(h.state.admissions, 1, "no refresh either");
    } finally { h.restore(); }
  }
});

test("window, manager, browsing context or privacy changing while the factory admits or the helper is verified: no key is written", async () => {
  const copyContext = actor => {
    const context = { ...actor.browsingContext };
    context.top = context;
    actor.browsingContext = context;
  };
  const changes = [
    ["window unregistered", h => { h.registered.delete(h.window); }, "PRIVATE_WINDOW"],
    ["moved to another registered window", h => { h.actor.browsingContext.topChromeWindow = h.other; }, "NO_WINDOW"],
    ["manager replaced by an equal one", h => { h.actor.manager = { ...h.actor.manager }; }, "DOCUMENT_GONE"],
    ["browsing context replaced by an equal one", h => copyContext(h.actor), "DOCUMENT_GONE"],
    ["privacy became unknown", h => { delete h.actor.browsingContext.usePrivateBrowsing; }, "PRIVATE_WINDOW"],
    ["privacy became private", h => { h.actor.browsingContext.usePrivateBrowsing = true;
      h.actor.manager.documentPrincipal = { ...h.actor.manager.documentPrincipal, privateBrowsingId: 1 }; }, "PRIVATE_WINDOW"],
  ];
  for (const hold of ["factory", "verify"]) {
    for (const [label, change, code] of changes) {
      for (const operation of ["store", "remove"]) {
        const h = keyHarness({ hold });
        h.state.present.add("jev");
        try {
          const pending = h[operation]();
          await until(() => h.state.release);
          change(h);
          h.state.release();
          const reply = await quietly(() => pending);
          assert.equal(reply.ok, false, `${hold}/${label}/${operation}`);
          assert.equal(reply.error.code, code, `${hold}/${label}/${operation}`);
          assert.deepEqual([h.state.spawns, h.state.stdin], [0, []], `${hold}/${label}/${operation}: no helper, no key`);
          assert.ok(h.state.present.has("jev"), "nothing was removed");
        } finally { h.restore(); }
      }
    }
  }
});

test("control: didDestroy while the factory admits aborts before any key is written", async () => {
  const h = keyHarness({ hold: "factory" });
  try {
    const pending = h.store();
    await until(() => h.state.release);
    h.actor.didDestroy();
    assert.equal(h.state.signals[0].aborted, true);
    h.state.release();
    const reply = await pending;
    assert.equal(reply.ok, false);
    assert.deepEqual([h.state.spawns, h.state.stdin], [0, []]);
  } finally { h.restore(); }
});

test("a helper failure after the key was written is reported as unconfirmed, never as nothing changed", async () => {
  const h = keyHarness({ waitFails: true });
  try {
    const reply = await h.store();
    assert.equal(reply.error.code, "KEYCHAIN_HELPER_UNAVAILABLE");
    assert.deepEqual(h.state.stdin, [KEY], "the key had been written");
    for (const text of [ProviderStatus.keychainErrorText(reply.error.code), pageKeychainErrorText(reply.error.code)]) {
      assert.match(text, /could not be confirmed/u);
      assert.doesNotMatch(text, /Nothing was changed/u);
    }
    assert.equal(h.state.admissions, 1, "no automatic retry and no refresh after an uncertain store");
  } finally { h.restore(); }
});

test("through the actor: a fresh runtime per status, store and refresh; the other provider is unchanged", async () => {
  const h = keyHarness();
  try {
    assert.equal((await h.store("jev")).value.state, "key-stored");
    assert.equal(h.state.admissions, 2, "the store and its refresh each admitted their own runtime");
    assert.equal((await h.status("openai")).value.state, "needs-key");
    assert.equal(h.state.admissions, 3);
    assert.equal(new Set(h.state.signals).size, 1, "one lifetime for this document's key work");
    assert.equal((await h.remove("openai")).value.state, "needs-key");
    assert.equal((await h.status("jev")).value.state, "key-stored", "Jev is untouched by OpenAI's removal");
  } finally { h.restore(); }
});

test("through the actor and root's real fixture runtime: revoked during the remove's in-spawn admission, the helper never starts", async () => {
  for (const revoke of [h => { h.actor.manager.isCurrentGlobal = false; }, h => { h.registered.delete(h.window); }]) {
    const fixture = fixtureNative({ pauseAt: 15 }); // the third admission: inside runtime.spawn
    fixture.present.add("jev"); fixture.present.add("openai");
    const h = keyHarness({ fixture: fixture.native });
    try {
      const pending = h.remove("jev");
      await until(() => fixture.release);
      assert.ok(fixture.release, "paused inside the fixture runtime's spawn admission");
      revoke(h);
      fixture.release();
      assert.equal((await quietly(() => pending)).ok, false);
      assert.deepEqual(fixture.spawns, [], "the fixed fixture helper was never started");
      assert.deepEqual([...fixture.present].sort(), ["jev", "openai"], "both markers unchanged");
    } finally { h.restore(); }
  }
  // The same composition while the surface stays live: it works, per provider.
  const fixture = fixtureNative();
  const h = keyHarness({ fixture: fixture.native });
  try {
    assert.equal((await h.store("openai")).value.state, "key-stored");
    assert.equal((await h.status("jev")).value.state, "needs-key");
    assert.deepEqual(fixture.spawns, [["store", "openai"], ["exists", "openai"], ["exists", "jev"]]);
    assert.deepEqual(fixture.stdin, [KEY]);
  } finally { h.restore(); }
});

test("validateRequest and dispatch are usable without an actor", async () => {
  assert.throws(() => validateRequest(null), { code: "INVALID_REQUEST" });
  assert.throws(() => validateRequest({ name: "listRules", params: { a: 1 } }), { code: "INVALID_PARAMS" });
  const huge = { rule: { instruction: "x".repeat(600 * 1024) } };
  assert.throws(() => validateRequest({ name: "saveRule", params: huge }), { code: "INVALID_PARAMS" });
  const value = await dispatch({ services: { listRules: () => [1] }, pickedRoots: new Set(), window: () => null,
    flags: () => ({}) }, { name: "listRules" });
  assert.deepEqual(value, [1]);
  // Key entry reads as ProviderKeys enforces it: an unreadable or absent pref is off
  // (defaults.yaml declares both on).
  assert.deepEqual(readFlags({ getBoolPref() { throw new Error("no prefs"); } }),
    { contexts: true, enginePreferences: false, jevKeyEntry: false, openaiKeyEntry: false, home: false });
  assert.deepEqual(readFlags({ getBoolPref: (_name, fallback) => fallback }),
    { contexts: true, enginePreferences: false, jevKeyEntry: false, openaiKeyEntry: false, home: false });
  assert.deepEqual(readFlags(prefs({ "axiosozo.openai.keyEntry.enabled": true })),
    { contexts: true, enginePreferences: false, jevKeyEntry: false, openaiKeyEntry: true, home: false });
  // P6: the experimental start page flag is read only (absent, false or unreadable is off).
  assert.equal(readFlags(prefs({ "axiosozo.home.enabled": true })).home, true);
});

// ---------------------------------------------------------------- child

function fakeCu() {
  return {
    cloneInto: (value, _target, options) => (options?.cloneFunctions ? { ...value } : structuredClone(value)),
    waiveXrays: value => value,
    exportFunction: fn => fn,
  };
}

test("child request serializes params as JSON and resolves with a clone of the reply", async () => {
  const win = { Promise, JSON, TypeError };
  const sent = [];
  const api = createOverviewApi({ win, Cu: fakeCu(), sendAsyncMessage: () => {},
    sendQuery: async (name, data) => { sent.push([name, data]); return { ok: true, value: { rules: [1] } }; } });
  const params = { rule: { id: "r_abcd" }, skip: undefined };
  assert.deepEqual(await api.request("saveRule", params), { rules: [1] });
  assert.deepEqual(sent, [[MESSAGES.REQUEST, { name: "saveRule", params: { rule: { id: "r_abcd" } } }]]);
  assert.notEqual(sent[0][1].params, params);
});

test("child rejects bad names and non-JSON params without messaging the parent", async () => {
  const win = { Promise, JSON, TypeError };
  let sent = 0;
  const api = createOverviewApi({ win, Cu: fakeCu(), sendAsyncMessage: () => {}, sendQuery: async () => { sent++; return { ok: true }; } });
  const cyclic = {}; cyclic.self = cyclic;
  await assert.rejects(api.request("list.Rules"), { code: "INVALID_REQUEST" });
  await assert.rejects(api.request(42), { code: "INVALID_REQUEST" });
  await assert.rejects(api.request("saveRule", cyclic), { code: "INVALID_PARAMS" });
  await assert.rejects(api.request("saveRule", () => {}), { code: "INVALID_PARAMS" });
  await assert.rejects(api.request("saveRule", { big: "x".repeat(513 * 1024) }), { code: "INVALID_PARAMS" });
  assert.equal(sent, 0);
});

test("child maps parent errors to page errors", async () => {
  const win = { Promise, JSON, TypeError };
  const api = createOverviewApi({ win, Cu: fakeCu(), sendAsyncMessage: () => {},
    sendQuery: async () => ({ ok: false, error: { code: "UNKNOWN_METHOD", message: "nope" } }) });
  await assert.rejects(api.request("whatever"), { code: "UNKNOWN_METHOD", message: "nope" });
  const broken = createOverviewApi({ win, Cu: fakeCu(), sendAsyncMessage: () => {}, sendQuery: async () => { throw new Error("gone"); } });
  await assert.rejects(broken.request("listRules"), { code: "ACTOR_ERROR" });
});

test("child subscription sends one subscribe, filters event names and unsubscribes with the last listener", () => {
  const win = { Promise, JSON, TypeError };
  const messages = [];
  const api = createOverviewApi({ win, Cu: fakeCu(), sendQuery: async () => ({}), sendAsyncMessage: name => messages.push(name) });
  const seen = [];
  const offA = api.subscribe(event => seen.push(["a", event.name]));
  const offB = api.subscribe(event => seen.push(["b", event.name]));
  assert.throws(() => api.subscribe("not a function"), TypeError);
  api.deliver("rules");
  api.deliver("secrets");
  offA(); offA();
  api.deliver("ledger");
  offB();
  assert.deepEqual(seen, [["a", "rules"], ["b", "rules"], ["b", "ledger"]]);
  assert.deepEqual(messages, [MESSAGES.SUBSCRIBE, MESSAGES.UNSUBSCRIBE]);
});

// Plan 4 step 7: the child's own trusted-click route for "Send errors to agent…".
function homeDocument(uri = "about:axiosozo#project=p_harbor1") {
  const document = parseHtml(`<html><body><main><p>Console errors</p><button id="${SEND_ERRORS_BUTTON}" type="button"><span>Send errors to agent…</span></button>`
    + "<button id=\"other\" type=\"button\">Edit</button></main></body></html>");
  document.documentURI = uri;
  return document;
}

test("Send errors to agent is recognized only as a trusted click on the authored button of this about:axiosozo document", () => {
  const document = homeDocument();
  const button = document.getElementById(SEND_ERRORS_BUTTON);
  const click = (target, init = {}) => ({ ...makeEvent("click", init), target });
  assert.equal(isSendProjectErrorsActivation(click(button), document), true);
  assert.equal(isSendProjectErrorsActivation(click(button.querySelector("span")), document), true, "inside the button");
  assert.equal(isSendProjectErrorsActivation(click(button, { isTrusted: false }), document), false, "synthesized by page script");
  assert.equal(isSendProjectErrorsActivation(click(document.getElementById("other")), document), false);
  assert.equal(isSendProjectErrorsActivation({ ...click(button), type: "keydown" }, document), false);
  assert.equal(isSendProjectErrorsActivation(click(button), homeDocument("https://example.test/")), false, "not about:axiosozo");
  const elsewhere = homeDocument();
  assert.equal(isSendProjectErrorsActivation(click(elsewhere.getElementById(SEND_ERRORS_BUTTON)), document), false, "another document's button");
  button.disabled = true;
  assert.equal(isSendProjectErrorsActivation(click(button), document), false);
  button.disabled = false;
  button.id = "renamed";
  assert.equal(isSendProjectErrorsActivation(click(button), document), false, "only the exact id");
});

test("the child's click listener sends the fixed { v: 1 } message and nothing of the page; destroy removes it", () => {
  const previous = globalThis.Cu;
  globalThis.Cu = fakeCu();
  try {
    const document = homeDocument();
    const win = { Promise, JSON, TypeError };
    const sent = [];
    const child = new AboutAxioSozoChild();
    Object.assign(child, { contentWindow: win, document, sendQuery: async () => ({ ok: true }), sendAsyncMessage: (name, data) => sent.push([name, data]) });
    child.handleEvent({ type: "DOMDocElementInserted" });
    child.handleEvent({ type: "DOMDocElementInserted" });
    assert.equal(document.listeners.get("click")?.size, 1, "one listener on its own document");
    // As Gecko delivers a click to a document capture listener: once.
    const deliver = (target, init = {}) => { for (const fn of [...(document.listeners.get("click") ?? [])]) fn({ ...makeEvent("click", init), target }); };
    const button = document.getElementById(SEND_ERRORS_BUTTON);
    deliver(button, { isTrusted: false });
    deliver(button.querySelector("span"));
    deliver(document.getElementById("other"));
    assert.deepEqual(sent, [[MESSAGES.SEND_PROJECT_ERRORS, { v: 1 }]], "trusted only, the button only");
    assert.deepEqual(Object.keys(win.AxioSozoOverview).sort(), ["request", "subscribe"], "no page method for it");
    child.didDestroy();
    assert.equal(document.listeners.get("click")?.size ?? 0, 0, "removed on destroy");
  } finally { if (previous === undefined) delete globalThis.Cu; else globalThis.Cu = previous; }
});

test("the page API is exposed as a frozen, non-writable window property with only request and subscribe", () => {
  const win = { Promise, JSON, TypeError };
  const api = createOverviewApi({ win, Cu: fakeCu(), sendQuery: async () => ({}), sendAsyncMessage: () => {} });
  exposeOverviewApi({ win, Cu: fakeCu(), api });
  assert.deepEqual(Object.keys(win.AxioSozoOverview).sort(), ["request", "subscribe"]);
  assert.ok(Object.isFrozen(win.AxioSozoOverview));
  const descriptor = Object.getOwnPropertyDescriptor(win, "AxioSozoOverview");
  assert.equal(descriptor.writable, false);
  assert.equal(descriptor.configurable, false);
});

// ---------------------------------------------------------------- registration

const FLAG = {
  URI_SAFE_FOR_UNTRUSTED_CONTENT: 1 << 0, ALLOW_SCRIPT: 1 << 1, HIDE_FROM_ABOUTABOUT: 1 << 2, ENABLE_INDEXED_DB: 1 << 3,
  URI_CAN_LOAD_IN_CHILD: 1 << 4, URI_MUST_LOAD_IN_CHILD: 1 << 5, MAKE_UNLINKABLE: 1 << 6, MAKE_LINKABLE: 1 << 7,
  URI_CAN_LOAD_IN_PRIVILEGEDABOUT_PROCESS: 1 << 8, URI_MUST_LOAD_IN_EXTENSION_PROCESS: 1 << 9, IS_SECURE_CHROME_UI: 1 << 10,
};

function fakeGecko({ processType = 0, remoteType = null } = {}) {
  const log = [];
  let uuid = 0;
  const deps = {
    Ci: { nsIAboutModule: FLAG, nsIComponentRegistrar: "nsIComponentRegistrar", nsIXULRuntime: { PROCESS_TYPE_DEFAULT: 0 } },
    ChromeUtils: {
      generateQI: names => iid => { if (!names.includes(iid)) throw new Error("NS_NOINTERFACE"); return true; },
      registerWindowActor: (name, options) => log.push(["registerWindowActor", name, options]),
      unregisterWindowActor: name => log.push(["unregisterWindowActor", name]),
    },
    Components: {
      ID: value => ({ cid: value }),
      manager: { QueryInterface: () => ({
        registerFactory: (cid, description, contract, factory) => log.push(["registerFactory", contract, factory]),
        unregisterFactory: cid => log.push(["unregisterFactory", cid.cid]),
      }) },
    },
    Services: {
      uuid: { generateUUID: () => ({ toString: () => `{uuid-${++uuid}}` }) },
      appinfo: { processType, remoteType },
      io: {
        newURI: spec => ({ spec }),
        newChannelFromURIWithLoadInfo: (uri, loadInfo) => ({ URI: uri, loadInfo, owner: { system: true }, originalURI: uri }),
      },
      ppmm: {
        loadProcessScript: (url, delayed) => log.push(["loadProcessScript", url, delayed]),
        removeDelayedProcessScript: url => log.push(["removeDelayedProcessScript", url]),
        broadcastAsyncMessage: name => log.push(["broadcastAsyncMessage", name]),
      },
    },
  };
  return { deps, log };
}

test("about:axiosozo uses exactly the §3.4 flags: never safe for untrusted content, never linkable", () => {
  const flags = aboutFlags({ nsIAboutModule: FLAG });
  assert.equal(flags, FLAG.IS_SECURE_CHROME_UI | FLAG.ALLOW_SCRIPT | FLAG.URI_MUST_LOAD_IN_CHILD
    | FLAG.URI_CAN_LOAD_IN_PRIVILEGEDABOUT_PROCESS | FLAG.HIDE_FROM_ABOUTABOUT);
  assert.equal(flags & FLAG.URI_SAFE_FOR_UNTRUSTED_CONTENT, 0);
  assert.equal(flags & FLAG.MAKE_LINKABLE, 0);
  assert.equal(flags & FLAG.URI_CAN_LOAD_IN_CHILD, 0);
});

test("the about module loads the chrome page with the about: URI and drops the chrome system principal", () => {
  const { deps } = fakeGecko();
  const module = new AboutAxioSozoModule(deps);
  const aboutUri = { spec: "about:axiosozo" };
  const loadInfo = { id: "load-info" };
  const channel = module.newChannel(aboutUri, loadInfo);
  assert.equal(channel.URI.spec, PAGE_URL);
  assert.equal(channel.loadInfo, loadInfo);
  assert.equal(channel.originalURI, aboutUri);
  assert.equal(channel.owner, null);
  assert.equal(module.getChromeURI(aboutUri).spec, PAGE_URL);
  assert.equal(module.QueryInterface("nsIAboutModule"), true);
});

test("registerAboutAxioSozo is idempotent, reaches privilegedabout processes and unregisters cleanly", () => {
  const { deps, log } = fakeGecko();
  const unregister = registerAboutAxioSozo(deps);
  assert.equal(registerAboutAxioSozo(deps), unregister);
  assert.deepEqual(log.map(entry => entry[0]), ["registerFactory", "loadProcessScript"]);
  assert.equal(log[0][1], CONTRACT_ID);
  assert.equal(CONTRACT_ID, "@mozilla.org/network/protocol/about;1?what=axiosozo");
  assert.equal(log[0][2].QueryInterface("nsIFactory"), true);
  assert.deepEqual(log[1], ["loadProcessScript", PROCESS_SCRIPT_URL, true]);
  unregister();
  unregister();
  assert.deepEqual(log.slice(2), [["removeDelayedProcessScript", PROCESS_SCRIPT_URL],
    ["broadcastAsyncMessage", UNREGISTER_MESSAGE], ["unregisterFactory", "{uuid-1}"]]);
  const again = registerAboutAxioSozo(deps);
  assert.notEqual(again, unregister);
  again();
});

test("the process script registers only in the parent and privilegedabout processes", () => {
  for (const [processType, remoteType, expected] of [[0, null, true], [2, "privilegedabout", true],
    [2, "web", false], [2, "webIsolated=https://example.test", false], [2, "file", false], [2, "extension", false]]) {
    const { deps, log } = fakeGecko({ processType, remoteType });
    assert.equal(registerForCurrentProcess(deps), expected, `${remoteType}`);
    assert.equal(log.some(entry => entry[0] === "registerFactory"), expected);
    unregisterAboutModuleInProcess();
  }
});

test("registerOverviewActor registers the contract actor once and returns its unregister", () => {
  const { deps, log } = fakeGecko();
  const unregister = registerOverviewActor(deps);
  assert.equal(registerOverviewActor(deps), unregister);
  assert.equal(log.length, 1);
  const [, name, options] = log[0];
  assert.equal(name, ACTOR_NAME);
  assert.equal(name, "AxioSozoOverview");
  assert.deepEqual(options.matches, ["about:axiosozo*"]);
  assert.deepEqual(options.remoteTypes, ["privilegedabout"]);
  assert.equal(options.allFrames, undefined);
  assert.equal(options.includeChrome, undefined);
  assert.deepEqual(options.child.events, { DOMDocElementInserted: {} });
  assert.equal(options.parent.esModuleURI, "chrome://browser/content/axiosozo/AboutAxioSozoParent.sys.mjs");
  assert.equal(options.child.esModuleURI, "chrome://browser/content/axiosozo/AboutAxioSozoChild.sys.mjs");
  assert.equal(options, ACTOR_OPTIONS);
  unregister();
  assert.deepEqual(log[1], ["unregisterWindowActor", "AxioSozoOverview"]);
});

test("actor modules export the class names Gecko constructs (`${ACTOR_NAME}Parent` / `${ACTOR_NAME}Child`)", async () => {
  // JSWindowActor resolves `<name>Parent` / `<name>Child` from esModuleURI; a
  // missing export leaves about:axiosozo disconnected (found in the H3 GUI run).
  const parent = await import("../chrome/AboutAxioSozoParent.sys.mjs");
  const child = await import("../chrome/AboutAxioSozoChild.sys.mjs");
  assert.equal(typeof parent[`${ACTOR_NAME}Parent`], "function");
  assert.equal(parent[`${ACTOR_NAME}Parent`], parent.AboutAxioSozoParent);
  assert.equal(typeof child[`${ACTOR_NAME}Child`], "function");
  assert.equal(child[`${ACTOR_NAME}Child`], child.AboutAxioSozoChild);
});

// ---------------------------------------------------------------- static page checks

const read = path => readFileSync(chrome + path, "utf8");
// License headers carry the MPL URL; checks apply to the content itself.
const stripComments = text => text.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const CSP = "default-src 'none'; script-src chrome:; style-src chrome:; img-src chrome: data:; object-src 'none'; frame-ancestors 'none'; form-action 'none'";

test("the overview page carries the strict CSP and loads only chrome: resources", () => {
  const html = stripComments(read("overview/about-axiosozo.html"));
  const metas = [...html.matchAll(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]*)"/g)];
  assert.equal(metas.length, 1);
  assert.equal(metas[0][1], CSP);
  assert.ok(html.indexOf("Content-Security-Policy") < html.indexOf("<link"), "CSP must precede resources");
  const references = [...html.matchAll(/\s(?:src|href)="([^"]*)"/g)].map(match => match[1]);
  assert.ok(references.length >= 4);
  for (const reference of references) {
    assert.ok(reference.startsWith("chrome://") || reference.startsWith("#"), reference);
  }
  assert.doesNotMatch(html, /https?:|\/\/(?!browser\/|global\/|branding\/)/i);
  assert.doesNotMatch(html, /<script(?![^>]*\ssrc=)[^>]*>/i, "no inline scripts");
  assert.doesNotMatch(html, /\sstyle=|<style/i, "no inline styles");
  assert.doesNotMatch(html, /\son[a-z]+=/i, "no inline event handlers");
  assert.doesNotMatch(html, /<(iframe|object|embed|form)\b/i);
  for (const reference of references.filter(value => value.startsWith("chrome://browser/content/axiosozo/overview/"))) {
    assert.ok(existsSync(chrome + reference.replace("chrome://browser/content/axiosozo/", "")), reference);
  }
  assert.ok(existsSync(chrome + PAGE_URL.replace("chrome://browser/content/axiosozo/", "")));
  assert.ok(existsSync(chrome + PROCESS_SCRIPT_URL.replace("chrome://browser/content/axiosozo/", "")));
});

test("overview scripts and styles have no network, markup injection or remote references", () => {
  const css = stripComments(read("overview/about-axiosozo.css"));
  assert.doesNotMatch(css, /https?:|url\(|@import/i);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, "colors come from design tokens");
  for (const file of ["overview/about-axiosozo.mjs", "overview/overview-model.mjs", "overview/about-axiosozo-process.js",
    "AboutAxioSozo.sys.mjs", "AboutAxioSozoParent.sys.mjs", "AboutAxioSozoChild.sys.mjs"]) {
    const source = read(file);
    assert.doesNotMatch(source, /\bfetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|innerHTML|outerHTML|insertAdjacentHTML|document\.write|\beval\(|new Function/, file);
    for (const [, specifier] of source.matchAll(/\bimport\s[^"']*["']([^"']+)["']/g)) {
      assert.ok(specifier.startsWith("./") || specifier.startsWith("chrome://"), `${file}: ${specifier}`);
    }
  }
  const page = read("overview/about-axiosozo.mjs");
  assert.match(page, /window\.AxioSozoOverview/);
  assert.doesNotMatch(page, /ChromeUtils|Services\.|Components|\bCu\./, "page stays unprivileged");
});

// Native tokens the overview stylesheet consumes, by where the pinned engine
// defines them for this page (in-content/common.css → tokens-brand.css →
// tokens-shared.css → zen-styles/zen-theme.css; usercontext.css). A name used
// in the stylesheet that is neither defined there nor here is invented.
const NATIVE_TOKENS = Object.freeze({
  firefox: ["--background-color-box", "--background-color-canvas", "--background-color-overlay", "--border-radius-circle",
    "--border-radius-medium", "--border-radius-small", "--box-shadow-level-1", "--box-shadow-level-4", "--button-background-color",
    "--button-background-color-active", "--button-background-color-hover", "--button-background-color-primary", "--button-font-weight",
    "--button-min-height-small", "--button-text-color", "--button-text-color-primary", "--card-border-color", "--card-box-shadow",
    "--card-box-shadow-hover", "--color-accent-primary", "--color-accent-primary-active", "--color-accent-primary-hover",
    "--color-green-20", "--color-green-70", "--color-white", "--color-yellow-20", "--color-yellow-70", "--focus-outline",
    "--focus-outline-offset", "--font-size-heading-large", "--font-size-large", "--font-size-root", "--font-size-small",
    "--font-size-xlarge", "--font-size-xxlarge", "--font-weight-bold", "--font-weight-heading", "--font-weight-semibold",
    "--icon-color-critical", "--icon-color-success", "--icon-color-warning", "--page-main-content-width", "--page-space-block-start",
    "--space-large", "--space-medium", "--space-small", "--space-xlarge", "--space-xsmall", "--space-xxlarge", "--text-color",
    "--text-color-error"],
  zen: ["--arrowpanel-background", "--button-border-radius", "--in-content-page-background", "--input-border-color",
    "--zen-branding-bg", "--zen-branding-bg-reverse", "--zen-colors-border", "--zen-colors-input-bg", "--zen-dialog-background"],
  usercontext: ["--identity-icon-color"],
});

test("the overview's palette, shape, type and spacing come from native Firefox and Zen tokens, with no colour literals", () => {
  const css = stripComments(readFileSync(new URL("../chrome/overview/about-axiosozo.css", import.meta.url), "utf8"));
  const defined = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gu)].map(match => match[1]));
  const used = new Set([...css.matchAll(/var\((--[a-z0-9-]+)/gu)].map(match => match[1]));
  const native = new Set(Object.values(NATIVE_TOKENS).flat());
  assert.deepEqual([...used].filter(name => !defined.has(name) && !native.has(name)), [], "no invented tokens");
  assert.doesNotMatch(css, /\brgba?\(|\bhsla?\(|\boklch\(/u, "no colour literals: surfaces, text, accent and status are tokens");
  const root = /:root\s*\{([\s\S]*?)\n\}/u.exec(css)?.[1] ?? "";
  const alias = name => new RegExp(`${name}:\\s*([^;]+);`, "u").exec(root)?.[1].trim();
  assert.deepEqual({ page: alias("--page"), surface: alias("--surface"), ink: alias("--ink"), accent: alias("--accent"),
    radius: alias("--radius"), width: alias("--width") }, {
    page: "var(--in-content-page-background)", surface: "var(--background-color-box)", ink: "var(--text-color)",
    accent: "var(--color-accent-primary)", radius: "var(--border-radius-medium)", width: "var(--page-main-content-width)" });
  assert.match(css, /body\s*\{[^}]*font-size:\s*var\(--font-size-small\)/u, "the in-content 13px base");
  assert.doesNotMatch(css, /font:\s*menu/u, "the font family is Zen's, not a page override");
  assert.match(css, /:focus-visible\s*\{\s*outline:\s*var\(--focus-outline\)/u, "Firefox's focus outline");
  assert.doesNotMatch(css, /font-size:\s*\d/u, "every font size is a token or derived from one");
});

test("destructive buttons use a readable text colour, not the on-red destructive token", () => {
  // --button-text-color-destructive is white (light) / near-black (dark): meant for
  // text on the red destructive background. On the neutral buttons used here it
  // made "Delete…"/"Remove…" invisible (H3 GUI run, light and dark screenshots).
  const css = readFileSync(new URL("../chrome/overview/about-axiosozo.css", import.meta.url), "utf8");
  const rule = /button\.destructive\s*\{([^}]*)\}/u.exec(css)?.[1] ?? "";
  assert.match(rule, /color:\s*var\(--text-color-error/u);
  assert.doesNotMatch(rule, /--button-text-color-destructive/u);
});
