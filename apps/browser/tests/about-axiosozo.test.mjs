import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  AboutAxioSozoParent, validateSender, validateRequest, dispatch, METHODS, MESSAGES, EVENT_NAMES,
  checkWebUrl, readFlags, setProvidersForTesting,
} from "../chrome/AboutAxioSozoParent.sys.mjs";
import { createOverviewApi, exposeOverviewApi } from "../chrome/AboutAxioSozoChild.sys.mjs";
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

test("the method list is closed and matches contexts-api-v1 §3.3 plus openContext, openUrl and flags", () => {
  assert.deepEqual(Object.keys(METHODS).sort(), [
    "clearLedger", "confirmProject", "deleteRule", "detect", "exportLedger", "getJevKeyStatus", "getJevSettings",
    "getOverviewFlags", "getProject", "getProviderStatus", "linkOrganization", "linkProject", "listContexts",
    "listOrphans", "listProjects", "listRules", "needsAttention", "openContext", "openUrl", "pickFolder",
    "projectForUrl", "removeJevKey", "removeOrphans", "removeProject", "saveRule", "serviceStatus", "setContextType",
    "setEnginePreference", "setJevSettings", "storeJevKey", "updateProject", "usageSummary", "writeManifest",
  ]);
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
      { contexts: true, enginePreferences: true, jevKeyEntry: true });
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

// ---------------------------------------------------------------- providers

function fakeProviderStatus({ storeError = null } = {}) {
  const calls = [];
  const jev = key => ({ id: "jev", state: key === "stored" ? "key-stored" : "needs-key", key });
  let key = "missing";
  return { calls, module: {
    getProviderStatus: async () => { calls.push(["getProviderStatus"]); return { version: 1, providers: [jev(key)] }; },
    getJevKeyStatus: async () => { calls.push(["getJevKeyStatus"]); return jev(key); },
    storeJevKeyAndReport: async secret => {
      calls.push(["store", secret.length]);
      if (storeError) throw new Error(storeError);
      key = "stored"; return jev(key);
    },
    removeJevKeyAndReport: async () => { calls.push(["remove"]); key = "missing"; return jev(key); },
  } };
}
function withProviderStatus(fake, services = fakeServices().services) {
  return setProvidersForTesting({ services: () => services, prefs: () => prefs({}), providerStatus: () => fake.module });
}

test("provider status and Jev key methods go to ProviderStatus, never to services, and never echo the key", async () => {
  const { services, calls: serviceCalls } = fakeServices();
  const fake = fakeProviderStatus();
  const restore = withProviderStatus(fake, services);
  const secret = "synthetic-key-not-real-0123";
  const logged = []; const originalError = console.error; console.error = (...args) => logged.push(args);
  try {
    const actor = fakeActor();
    assert.deepEqual((await request(actor, "getProviderStatus")).value, { version: 1, providers: [{ id: "jev", state: "needs-key", key: "missing" }] });
    assert.equal((await request(actor, "getJevKeyStatus")).value.state, "needs-key");
    const stored = await request(actor, "storeJevKey", { key: secret });
    assert.deepEqual(stored, { ok: true, value: { id: "jev", state: "key-stored", key: "stored" } });
    assert.equal((await request(actor, "removeJevKey")).value.state, "needs-key");
    assert.deepEqual(fake.calls, [["getProviderStatus"], ["getJevKeyStatus"], ["store", secret.length], ["remove"]]);
    assert.deepEqual(serviceCalls, []);
    assert(!JSON.stringify(stored).includes(secret)); assert.deepEqual(logged, []);
  } finally { console.error = originalError; restore(); }
});

test("Jev key params are strict and failures carry fixed codes without the key", async () => {
  const secret = "synthetic-key-not-real-0123";
  const fake = fakeProviderStatus({ storeError: `helper said ${secret}` });
  const restore = withProviderStatus(fake);
  try {
    const actor = fakeActor();
    for (const params of [{}, { key: "short" }, { key: "line\nbreak-key" }, { key: "x".repeat(4097) }, { key: 12345678 },
      { key: secret, extra: 1 }]) {
      const reply = await request(actor, "storeJevKey", params);
      assert.equal(reply.error.code, "INVALID_PARAMS"); assert(!reply.error.message.includes("short"));
    }
    for (const [name, params] of [["removeJevKey", { key: secret }], ["getProviderStatus", { x: 1 }], ["getJevKeyStatus", []]]) {
      assert.equal((await request(actor, name, params)).error.code, "INVALID_PARAMS");
    }
    assert.deepEqual(fake.calls, []);
    const failed = await request(actor, "storeJevKey", { key: secret });
    assert.equal(failed.error.code, "KEYCHAIN_HELPER_UNAVAILABLE");
    assert(!JSON.stringify(failed).includes(secret));
  } finally { restore(); }
  for (const code of ["INVALID_KEY", "JEV_KEY_ENTRY_DISABLED", "KEYCHAIN_REFUSED", "HELPER_TIMEOUT"]) {
    const again = withProviderStatus(fakeProviderStatus({ storeError: code }));
    try { assert.equal((await request(fakeActor(), "storeJevKey", { key: secret })).error.code, code); } finally { again(); }
  }
});

test("Jev keys cannot be stored or removed from a private about:axiosozo tab", async () => {
  const fake = fakeProviderStatus();
  const restore = withProviderStatus(fake);
  try {
    const sender = goodSender({ usePrivateBrowsing: true, principal: { ...goodSender().principal, privateBrowsingId: 1 } });
    const actor = fakeActor({ sender });
    assert.equal((await request(actor, "storeJevKey", { key: "synthetic-key-not-real-0123" })).error.code, "PRIVATE_WINDOW");
    assert.equal((await request(actor, "removeJevKey")).error.code, "PRIVATE_WINDOW");
    assert.equal((await request(actor, "getJevKeyStatus")).ok, true);
    assert.deepEqual(fake.calls, [["getJevKeyStatus"]]);
  } finally { restore(); }
});

test("validateRequest and dispatch are usable without an actor", async () => {
  assert.throws(() => validateRequest(null), { code: "INVALID_REQUEST" });
  assert.throws(() => validateRequest({ name: "listRules", params: { a: 1 } }), { code: "INVALID_PARAMS" });
  const huge = { rule: { instruction: "x".repeat(600 * 1024) } };
  assert.throws(() => validateRequest({ name: "saveRule", params: huge }), { code: "INVALID_PARAMS" });
  const value = await dispatch({ services: { listRules: () => [1] }, pickedRoots: new Set(), window: () => null,
    flags: () => ({}) }, { name: "listRules" });
  assert.deepEqual(value, [1]);
  assert.deepEqual(readFlags({ getBoolPref() { throw new Error("no prefs"); } }),
    { contexts: true, enginePreferences: false, jevKeyEntry: false });
  assert.deepEqual(readFlags({ getBoolPref: (_name, fallback) => fallback }),
    { contexts: true, enginePreferences: false, jevKeyEntry: true });
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

test("destructive buttons use a readable text colour, not the on-red destructive token", () => {
  // --button-text-color-destructive is white (light) / near-black (dark): meant for
  // text on the red destructive background. On the neutral buttons used here it
  // made "Delete…"/"Remove…" invisible (H3 GUI run, light and dark screenshots).
  const css = readFileSync(new URL("../chrome/overview/about-axiosozo.css", import.meta.url), "utf8");
  const rule = /button\.destructive\s*\{([^}]*)\}/u.exec(css)?.[1] ?? "";
  assert.match(rule, /color:\s*var\(--text-color-error/u);
  assert.doesNotMatch(rule, /--button-text-color-destructive/u);
});
