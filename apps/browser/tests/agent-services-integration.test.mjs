/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 4: the actual AxioSozoServices glue around the actual
// AgentChannelService (agent-channel-v1 §1, §7; workstation-v1 §5.1). Profile
// storage, Zen windows, Gecko identities, the socket runtime and every native
// factory are synthetic in-memory fakes; no socket, process, provider or
// profile is touched. Not evidence of a running browser or of native socket
// ownership.
import test from "node:test";
import assert from "node:assert/strict";
import { contextsCoreAvailable } from "./support/chrome-modules.mjs";
import { fakeZenWindow } from "./support/fake-zen.mjs";

const skip = contextsCoreAvailable ? false : "packages/contexts/src/index.mjs is absent";
const { AxioSozoServices } = skip ? {} : await import("../chrome/AxioSozoServices.sys.mjs");
const { ZenWorkspaceAdapter } = await import("../chrome/ZenWorkspaceAdapter.sys.mjs");
const { createGeckoIdentityAdapter } = await import("../chrome/ProjectContainers.sys.mjs");
const { createAgentChannelService } = await import("../chrome/AgentChannelService.sys.mjs");
const core = skip ? null : await import("../../../packages/contexts/src/index.mjs");
const { manifest } = skip ? {} : await import("../../../packages/contexts/tests/samples.mjs");

const SPACE = "11111111-1111-4111-8111-111111111111";
const COLORS = ["blue", "turquoise", "green", "yellow", "orange", "red", "pink", "purple", "toolbar"];
const flush = async (rounds = 60) => { for (let i = 0; i < rounds; i++) await Promise.resolve(); };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const encode = value => new TextEncoder().encode(`${JSON.stringify(value)}\n`);
const codeError = code => Object.assign(new Error(code), { code });

class Clock {
  at = Date.UTC(2026, 9, 2, 12); next = 0; timers = new Map();
  now = () => this.at;
  setTimeout = (fn, ms) => { const id = ++this.next; this.timers.set(id, { fn, at: this.at + ms }); return id; };
  clearTimeout = id => { this.timers.delete(id); };
  async tick(ms) {
    const end = this.at + ms;
    for (;;) {
      const due = [...this.timers].filter(([, value]) => value.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      this.at = due[1].at; this.timers.delete(due[0]); due[1].fn(); await flush();
    }
    this.at = end; await flush();
  }
}

const record = (id, root, extra = {}) => ({ ...core.upgradeProject({ version: 1, id, root,
  manifest: manifest({ name: id === "p_alpha1" ? "Alpha" : id === "p_bravo1" ? "Bravo" : "Charlie",
    environments: [{ name: "local", base_url: `http://localhost:${id === "p_alpha1" ? 4450 : id === "p_bravo1" ? 4460 : 4470}/` }] }),
  manifest_state: "none", context_uuid: null, trusted: false, created_at: 1, updated_at: 2 }), ...extra });

function fixture({ projects = null, containers = false, nativeFails = 0, hookConfig = true, privateWindow = false } = {}) {
  const clock = new Clock();
  const seeded = projects ?? [record("p_alpha1", "/synthetic/alpha"), record("p_bravo1", "/synthetic/bravo")];
  const files = new Map([["contexts.json", JSON.stringify({ version: 3, contexts: [], projects: seeded })]]);
  const writeGates = [], readGates = [];
  const storageFor = name => ({
    read: async () => { if (name === "contexts.json") { const gate = readGates.shift(); if (gate) await gate.promise; } return files.get(name) ?? null; },
    write: async text => { if (name === "contexts.json") { const gate = writeGates.shift(); if (gate) await gate.promise; } files.set(name, text); },
  });
  const calls = [], servers = [], shutdown = [], presentations = [];
  let failures = nativeFails, hex = 0, captured = null, refreshes = 0;
  const runtime = {
    paths: {
      prepare: async path => ({ path, lock: { lost: new Promise(() => {}) } }),
      verifyBound: async claim => claim,
      cleanup: async claim => { calls.push(["cleanup", claim.path]); },
    },
    file: path => ({ path }),
    createServerSocket() {
      const server = { listener: null, closed: false, initWithFilename(file, mode) { calls.push(["bind", file.path, mode]); },
        asyncListen(listener) { this.listener = listener; }, close() { this.closed = true; this.listener?.onStopListening(); } };
      servers.push(server); return server;
    },
    openConnection(socket, controller) { socket.connection = controller.accept(socket.transport); },
  };
  const agentNative = {
    createNativeConfiguration: async () => {
      calls.push(["native"]);
      if (failures > 0) { failures--; throw codeError("NATIVE_CONFIGURATION_UNAVAILABLE"); }
      return { socketPath: "/synthetic/profile/.a/s", exactPosixBackend: { exactAvailable: true }, close: () => calls.push(["config-close"]),
        ownershipDiagnostics: () => ({ native_config_verified: true, helper_path: "/synthetic/secret/helper.py",
          lock_helpers: { retained_locks: 1, owned_exit_receipts: 2, argv: ["-I"] } }) };
    },
    createTransportRuntime: ({ exactPosixBackend }) => { calls.push(["transport", exactPosixBackend.exactAvailable]); return runtime; },
    ...(hookConfig ? { buildHookConfig: async ({ agent, socketPath }) => { calls.push(["hook", agent, socketPath]); return `${agent} → ${socketPath}\n`; } } : {}),
  };
  const gecko = new Map([[41, { userContextId: 41, public: true, name: "Alpha", icon: "briefcase", color: "blue" }]]);
  let nextIdentity = 60;
  const identityService = {
    getPublicIdentityFromId: id => gecko.get(id) ?? null,
    create: (name, icon, color) => { const value = { userContextId: nextIdentity++, public: true, name, icon, color }; gecko.set(value.userContextId, value); return value; },
    update: (id, name, icon, color) => { const value = gecko.get(id); if (!value) return false; Object.assign(value, { name, icon, color }); return true; },
  };
  const observed = {};
  const containerDeps = containers ? {
    containerIdentities: () => createGeckoIdentityAdapter({ service: identityService, allowedColors: COLORS, allowedIcons: ["briefcase"] }),
    containersEnabled: () => true,
    observeContainers: callbacks => { Object.assign(observed, callbacks); return () => {}; },
  } : {};
  const services = new AxioSozoServices({
    storageFor, clock: clock.now, timers: { setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout },
    randomId: prefix => `${prefix}fixture${++hex}`, randomHex: () => (++hex).toString(16).padStart(16, "0"),
    onShutdown: (fn, label) => shutdown.push({ fn, label }), agentNative,
    resetAgentEndpointPref: () => calls.push(["pref-reset"]),
    createAgentChannel: deps => {
      captured = deps;
      const channel = createAgentChannelService(deps);
      return Object.freeze({ ...channel, refreshProjects: () => { refreshes++; return channel.refreshProjects(); } });
    },
    ...containerDeps,
  });
  const zen = fakeZenWindow({ spaces: [{ uuid: SPACE, name: "Home", containerTabId: 0 }], isPrivate: privateWindow });
  const adapter = new ZenWorkspaceAdapter(zen.window);
  const unregisterWindow = services.registerWindow(zen.window, adapter);
  const tabs = [];
  zen.window.gBrowser.addTab = (url, options) => {
    const tab = { url, options, linkedBrowser: { browsingContext: { originAttributes: { userContextId: options.userContextId } } } };
    tabs.push(tab); zen.window.gBrowser.selectedTab = tab; return tab;
  };
  function presenter(name = "normal", { normal = () => true } = {}) {
    return {
      isNormal: normal,
      requestApproval(view, controls) { const d = deferred(); presentations.push({ name, view, controls, ...d }); return d.promise; },
      onStatus(event) { calls.push(["status", name, event]); },
    };
  }
  function connect() {
    const messages = [], closes = [];
    const transport = { write: bytes => { messages.push(JSON.parse(new TextDecoder().decode(bytes))); }, close: code => closes.push(code) };
    const socket = { transport, close: code => closes.push(code) };
    const server = servers.at(-1);
    server.listener.onSocketAccepted(server, socket);
    return { ...socket.connection, messages, closes };
  }
  const stored = () => JSON.parse(files.get("contexts.json")).projects;
  const cache = () => services.getAgentEndpointState().projects;
  return { services, clock, files, writeGates, readGates, calls, servers, shutdown, presentations, observed, gecko, zen, adapter, tabs,
    presenter, connect, stored, cache, unregisterWindow,
    get loader() { return captured.loadProjects; }, get refreshes() { return refreshes; },
    close: () => services.closeAgentChannel() };
}

const hello = (name, cwd) => ({ v: 1, type: "hello", client: { name, agent: "claude-code", version: "1" }, cwd, pid: 4242 });
const hook = (cwd, message = "Approve the migration?") => ({ v: 1, type: "hook", source: "claude-code", event: "Notification", cwd,
  payload: { message, cwd, session_id: "synthetic-session" } });

// ---------------------------------------------------------------- creation and authority sequencing

test("construction and window registration start nothing; first use creates one channel that only loads the guarded cache", { skip }, async () => {
  const f = fixture();
  try {
    assert.deepEqual(f.services.getAgentDiagnostics(), { created: false, ownership: null });
    assert.deepEqual(f.calls, []);
    const first = f.services.getAgentEndpointState();
    assert.deepEqual([first.enabled, first.state, first.reason, first.socketPath], [false, "disabled", null, undefined]);
    await flush();
    assert.deepEqual([f.cache().state, f.cache().count], ["ready", 2]);
    assert.deepEqual(f.calls, [["pref-reset"]], "a saved endpoint preference is cleared; no native call");
    assert.deepEqual(f.shutdown.map(item => item.label).filter(Boolean), ["AxioSozo: close agent channel"]);
    assert.equal(f.services.getAgentEndpointState().methods.every(method => method.available === false), true, "every P4 method stays unavailable");
    f.services.getAgentEndpointState();
    assert.equal(f.calls.filter(([name]) => name === "pref-reset").length, 1, "one process-wide channel");
  } finally { await f.close(); }
});

test("a routing mutation invalidates before its first await; only the final quiescent scope refreshes, never an intermediate snapshot", { skip }, async () => {
  const f = fixture();
  try {
    f.services.getAgentEndpointState(); await flush();
    const first = deferred(), second = deferred();
    f.writeGates.push(first, second);
    const before = f.refreshes;
    const a = f.services.setAccountLabel("p_alpha1", { key: "vercel", label: "work Google" });
    assert.equal(f.cache().state, "loading", "invalidated synchronously at the call");
    const b = f.services.removeProject("p_bravo1");
    await flush();
    first.resolve(); await a; await flush();
    assert.equal(f.cache().state, "loading", "Bravo's removal is still pending: no refresh after Alpha settled");
    assert.equal(f.refreshes, before, "the earlier scope did not refresh");
    await assert.rejects(f.loader(), { code: "PROJECT_CACHE_BUSY" }, "a manual read is refused while a write is pending");
    second.resolve(); await b; await flush();
    assert.equal(f.refreshes, before + 1, "exactly one refresh, by the final scope");
    assert.deepEqual([f.cache().state, f.cache().count], ["ready", 1]);
    assert.deepEqual(f.services.listAgentActivity("p_bravo1"), []);
  } finally { await f.close(); }
});

test("the guarded loader refuses a write that started and settled inside its read, even with nothing pending", { skip }, async () => {
  const f = fixture();
  try {
    const held = deferred();
    f.readGates.push(held, held); // the initial load and the manual read wait; later reads do not
    f.services.getAgentEndpointState(); await flush();
    const reading = f.loader(); await flush();
    // The mutation's own load is the third read and is not held.
    await f.services.setAccountLabel("p_alpha1", { key: "vercel", label: "work Google" });
    await flush();
    assert.deepEqual([f.cache().state, f.cache().count], ["ready", 2], "the final scope's own refresh published the settled store");
    held.resolve();
    await assert.rejects(reading, { code: "PROJECT_CACHE_BUSY" });
    await flush();
    assert.equal(f.cache().state, "ready", "the stale initial load cannot replace the newer cache");
    assert.equal(JSON.parse(f.files.get("contexts.json")).projects[0].accounts[0].label, "work Google");
  } finally { await f.close(); }
});

test("a failed write keeps the original error and the last committed authority; a failing refresh cannot mask a result", { skip }, async () => {
  const f = fixture();
  try {
    f.services.getAgentEndpointState(); await flush();
    const gate = deferred(); f.writeGates.push(gate);
    const removing = f.services.removeProject("p_bravo1");
    await flush();
    const failure = codeError("SYNTHETIC_WRITE_FAILURE");
    gate.reject(failure);
    await assert.rejects(removing, error => error === failure);
    await flush();
    assert.deepEqual([f.cache().state, f.cache().count], ["ready", 2], "Bravo is still committed, so it stays");
    await f.close();
    // With the channel closed, the settling refresh fails; the mutation's result stands.
    assert.equal((await f.services.setAccountLabel("p_alpha1", { key: "vercel", label: "x" })).id, "p_alpha1");
  } finally { await f.close(); }
});

test("enabling while a project write is pending is refused without any native admission; an explicit retry then listens", { skip }, async () => {
  const f = fixture();
  try {
    f.services.getAgentEndpointState(); await flush();
    const gate = deferred(); f.writeGates.push(gate);
    const writing = f.services.setAccountLabel("p_alpha1", { key: "vercel", label: "work" });
    const refused = await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: true });
    assert.deepEqual([refused.enabled, refused.state, refused.reason], [true, "unavailable", "PROJECT_CACHE_UNAVAILABLE"]);
    assert.equal(f.calls.some(([name]) => name === "native"), false);
    gate.resolve(); await writing; await flush();
    const listening = await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: true });
    assert.deepEqual([listening.state, listening.socketPath], ["listening", "/synthetic/profile/.a/s"]);
    assert.deepEqual(f.calls.find(([name]) => name === "bind"), ["bind", "/synthetic/profile/.a/s", 0o600]);
  } finally { await f.close(); }
});

// ---------------------------------------------------------------- container cleanup scopes

test("a deleted container's whole cleanup is one scope: nested assignment and verification never refresh early", { skip }, async () => {
  const f = fixture({ containers: true, projects: [record("p_alpha1", "/synthetic/alpha", { container: { user_context_id: 41 } }),
    record("p_bravo1", "/synthetic/bravo")] });
  try {
    f.services.getAgentEndpointState(); await flush();
    assert.equal(f.cache().state, "ready");
    const generation = f.cache().generation;
    const gate = deferred(); f.writeGates.push(gate);
    f.gecko.delete(41);
    f.observed.identityDeleted(41);
    assert.equal(f.cache().state, "loading", "invalidated synchronously by the observer");
    assert.ok(f.cache().generation > generation);
    await flush();
    await assert.rejects(f.loader(), { code: "PROJECT_CACHE_BUSY" }, "the outer scope is pending while its nested assignment writes");
    const before = f.refreshes;
    gate.resolve(); await flush(); await flush();
    assert.equal(f.refreshes, before + 1, "one refresh once the outer scope settled");
    assert.equal(f.cache().state, "ready");
    assert.equal(f.stored()[0].container.user_context_id, null);
  } finally { await f.close(); }
});

test("a failed deletion cleanup stays quarantined after its writes settle, until a tracked retry succeeds", { skip }, async () => {
  const f = fixture({ containers: true, projects: [record("p_alpha1", "/synthetic/alpha", { container: { user_context_id: 41 } })] });
  try {
    f.services.getAgentEndpointState(); await flush();
    const gate = deferred(); f.writeGates.push(gate);
    f.gecko.delete(41);
    f.observed.identityDeleted(41);
    await flush();
    gate.reject(codeError("SYNTHETIC_WRITE_FAILURE")); await flush(); await flush();
    assert.notEqual(f.cache().state, "ready", "nothing pending, but the failure keeps old mappings out of authority");
    await assert.rejects(f.loader(), { code: "PROJECT_CACHE_BUSY" });
    assert.equal(f.stored()[0].container.user_context_id, 41, "the failed write left the old mapping on disk");
    // A project link retries the cleanup first (containersReady), as its own tracked attempt.
    await f.services.openProjectUrl({ window: f.zen.window, projectId: "p_alpha1", url: "http://localhost:4450/" }).catch(() => null);
    await flush(); await flush();
    assert.notEqual(f.stored()[0].container.user_context_id, 41);
    assert.equal(f.cache().state, "ready", "a current successful retry cleared the latch and refreshed");
  } finally { await f.close(); }
});

test("an older failed deletion attempt cannot latch over a newer successful one", { skip }, async () => {
  const f = fixture({ containers: true, projects: [record("p_alpha1", "/synthetic/alpha", { container: { user_context_id: 41 } }),
    record("p_bravo1", "/synthetic/bravo", { container: { user_context_id: 41 } })] });
  try {
    f.services.getAgentEndpointState(); await flush();
    const failing = deferred(); f.writeGates.push(failing);
    f.gecko.delete(41);
    f.observed.identityDeleted(41); // attempt A: its first write will fail
    f.observed.identityDeleted(41); // attempt B: the current one
    await flush();
    failing.reject(codeError("SYNTHETIC_WRITE_FAILURE"));
    await flush(); await flush(); await flush();
    assert.deepEqual(f.stored().map(project => project.container.user_context_id), [null, null], "attempt B cleared both mappings");
    assert.equal(f.cache().state, "ready", "A's stale failure left no quarantine");
  } finally { await f.close(); }
});

test("a failed container reset blocks authority until a tracked reset retry succeeds; invalid observer ids change nothing", { skip }, async () => {
  const f = fixture({ containers: true, projects: [record("p_alpha1", "/synthetic/alpha", { container: { user_context_id: 41 } })] });
  try {
    f.services.getAgentEndpointState(); await flush();
    const generation = f.cache().generation;
    for (const id of [0, -1, 1.5, "41", null, 4294967295]) f.observed.identityDeleted(id);
    assert.deepEqual([f.cache().state, f.cache().generation], ["ready", generation], "refused ids neither track nor invalidate");
    const gate = deferred(); f.writeGates.push(gate);
    f.observed.containersDisabled();
    assert.equal(f.cache().state, "loading");
    await flush();
    gate.reject(codeError("SYNTHETIC_WRITE_FAILURE")); await flush(); await flush();
    assert.notEqual(f.cache().state, "ready");
    assert.deepEqual((await f.services.listProjectContainers()).map(item => item.state), ["unavailable"]);
    await f.services.openProjectUrl({ window: f.zen.window, projectId: "p_alpha1", url: "http://localhost:4450/" }).catch(() => null);
    await flush(); await flush();
    assert.equal(f.stored()[0].container.user_context_id === 41, false);
    assert.equal(f.cache().state, "ready");
  } finally { await f.close(); }
});

// ---------------------------------------------------------------- handoff authority

test("handoff authority: captured at quiescence, checked synchronously, refused while pending; no project only when none matches", { skip }, async () => {
  const f = fixture({ containers: true, projects: [record("p_alpha1", "/synthetic/alpha", { container: { user_context_id: 41 } }),
    record("p_bravo1", "/synthetic/bravo")] });
  try {
    const tab = {};
    const capture = (url, userContextId = 0, window = f.zen.window) => f.services.captureHandoffAuthority({ window, tab, url, userContextId });
    const alpha = await capture("http://localhost:4450/settings?token=1");
    assert.deepEqual([alpha.project, alpha.name, alpha.check()], [{ id: "p_alpha1", root: "/synthetic/alpha" }, "Alpha", true]);
    const none = await capture("https://unrelated.example/");
    assert.deepEqual([none.project, none.check()], [null, true]);
    assert.deepEqual((await capture("https://unrelated.example/", 41)).project, { id: "p_alpha1", root: "/synthetic/alpha" }, "its own container");
    assert.equal((await capture("http://localhost:4460/", 41)).project, null, "URL and container disagree: no project is claimed");
    const gate = deferred(); f.writeGates.push(gate);
    const writing = f.services.setAccountLabel("p_bravo1", { key: "vercel", label: "x" });
    assert.equal(alpha.check(), false, "any project write starting voids the captured authority at once");
    await assert.rejects(capture("http://localhost:4450/"), { code: "PROJECT_CHANGED" }, "pending authority is refused, never 'no project'");
    gate.resolve(); await writing; await flush();
    assert.equal(alpha.check(), false, "a settled write does not revive an older capture");
    assert.equal((await capture("http://localhost:4450/")).check(), true);
    await assert.rejects(capture("http://localhost:4450/", 0, { foreign: true }), { code: "PRIVATE" });
    await assert.rejects(f.services.captureHandoffAuthority({ window: f.zen.window, tab, url: "http://localhost:4450/", userContextId: -1 }), { code: "INVALID_INPUT" });
  } finally { await f.close(); }
});

test("handoff authority is refused for a private window", { skip }, async () => {
  const f = fixture({ privateWindow: true });
  try {
    await assert.rejects(f.services.captureHandoffAuthority({ window: f.zen.window, tab: {}, url: "http://localhost:4450/", userContextId: 0 }), { code: "PRIVATE" });
  } finally { await f.close(); }
});

// ---------------------------------------------------------------- presenters, status and sessions

test("presenters: only registered normal windows; approval goes to the most recent one with the project's name; Deny and Allow", { skip }, async () => {
  const f = fixture();
  const other = fakeZenWindow({ spaces: [{ uuid: SPACE, name: "Home", containerTabId: 0 }] });
  const hidden = fakeZenWindow({ spaces: [], isPrivate: true });
  try {
    f.services.registerWindow(other.window, new ZenWorkspaceAdapter(other.window));
    f.services.registerWindow(hidden.window, new ZenWorkspaceAdapter(hidden.window));
    assert.throws(() => f.services.registerAgentPresenter(hidden.window, f.presenter("private")), { code: "PRIVATE_WINDOW" });
    assert.throws(() => f.services.registerAgentPresenter({}, f.presenter("unknown")), { code: "PRIVATE_WINDOW" });
    f.services.registerAgentPresenter(f.zen.window, f.presenter("first"));
    f.services.registerAgentPresenter(other.window, f.presenter("second"));
    assert.throws(() => f.services.registerAgentPresenter(other.window, f.presenter("again")), { code: "INVALID_PRESENTER" });
    assert.equal(f.services.activateAgentPresenter(f.zen.window), true);
    await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: true });
    const denied = f.connect(); denied.receive(encode(hello("agent-bridge", "/synthetic/alpha/apps/web"))); await flush();
    assert.deepEqual(f.presentations.map(item => [item.name, item.view]), [["first", { agent: "claude-code", project_id: "p_alpha1", project_name: "Alpha" }]]);
    assert.deepEqual(Object.keys(f.presentations[0].controls), ["signal"], "no path or cwd reaches the presenter");
    f.presentations[0].resolve(false); await flush();
    assert.equal(denied.messages.at(-1).granted, false);
    f.services.activateAgentPresenter(other.window);
    const allowed = f.connect(); allowed.receive(encode(hello("agent-bridge", "/synthetic/bravo"))); await flush();
    assert.equal(f.presentations[1].name, "second");
    f.presentations[1].resolve(true); await flush();
    assert.equal(allowed.messages.at(-1).granted, true);
    const sessions = f.services.listAgentSessions({ window: f.zen.window, projectId: "p_bravo1" });
    assert.deepEqual(sessions.map(item => [item.agent, item.state]), [["claude-code", "approved"]]);
    const home = await f.services.projectHome({ window: f.zen.window, id: "p_bravo1" });
    assert.deepEqual(home.agent_activity.sessions.map(item => item.state), ["approved"]);
    assert.throws(() => f.services.revokeAgentSession({ window: hidden.window, projectId: "p_bravo1", sessionId: sessions[0].session }), { code: "PRIVATE_WINDOW" });
    assert.deepEqual(f.services.revokeAgentSession({ window: f.zen.window, projectId: "p_bravo1", sessionId: sessions[0].session }), { revoked: true });
    assert.deepEqual(f.services.listAgentSessions({ window: f.zen.window, projectId: "p_bravo1" }), []);
  } finally { await f.close(); }
});

test("private-only presenters: a bridge request is denied without any prompt; closing the last normal window cancels its prompt", { skip }, async () => {
  const f = fixture();
  try {
    const unregister = f.services.registerAgentPresenter(f.zen.window, f.presenter("only", { normal: () => false }));
    await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: true });
    const c = f.connect(); c.receive(encode(hello("agent-bridge", "/synthetic/alpha"))); await flush();
    assert.equal(f.presentations.length, 0, "a presenter that is not normal is never asked");
    assert.equal(c.messages.at(-1).granted, false);
    unregister();
    f.services.registerAgentPresenter(f.zen.window, f.presenter("normal"));
    const pending = f.connect(); pending.receive(encode(hello("agent-bridge", "/synthetic/alpha"))); await flush();
    const prompt = f.presentations.at(-1);
    assert.equal(prompt.controls.signal.aborted, false);
    f.unregisterWindow(); // the window closes: its presenter goes with it
    await flush();
    assert.equal(prompt.controls.signal.aborted, true);
    prompt.resolve(true); await flush();
    assert.equal(pending.messages.at(-1).granted, false, "a late Allow never grants");
  } finally { await f.close(); }
});

test("approval expires after 55 s as a denial and aborts the presentation", { skip }, async () => {
  const f = fixture();
  try {
    f.services.registerAgentPresenter(f.zen.window, f.presenter("normal"));
    await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: true });
    const c = f.connect(); c.receive(encode(hello("agent-bridge", "/synthetic/alpha"))); await flush();
    const prompt = f.presentations.at(-1);
    await f.clock.tick(55000);
    assert.equal(prompt.controls.signal.aborted, true);
    assert.equal(c.messages.at(-1).granted, false);
  } finally { await f.close(); }
});

test("status reports: parsed records reach the home, attention and the most recent normal presenter; never another root", { skip }, async () => {
  const f = fixture();
  try {
    f.services.registerAgentPresenter(f.zen.window, f.presenter("normal"));
    assert.equal((await f.services.projectHome({ window: f.zen.window, id: "p_alpha1" })).agent_activity, null,
      "the cache is still loading: unavailable, never an empty claim");
    await flush();
    const before = await f.services.projectHome({ window: f.zen.window, id: "p_alpha1" });
    assert.deepEqual(before.agent_activity, { records: [], reporting: false, sessions: [] }, "ready and empty, with reporting off");
    await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: true });
    const c = f.connect(); c.receive(encode(hello("axiosozo-notify", "/synthetic/alpha"))); c.receive(encode(hook("/synthetic/alpha/apps/web")));
    await flush();
    assert.deepEqual(c.messages.at(-1), { v: 1, type: "ack", matched: true });
    const status = f.calls.find(([name]) => name === "status");
    assert.deepEqual([status[2].project_id, status[2].project_name, status[2].record.state, status[2].record.title],
      ["p_alpha1", "Alpha", "needs_input", "Approve the migration?"]);
    assert.deepEqual(Object.keys(status[2].record), ["id", "agent", "state", "title", "at"], "no path or session reaches the presenter");
    const groups = f.services.listAgentActivity("p_alpha1");
    assert.deepEqual(groups.map(group => [group.project_id, group.project_path, group.history.length]), [["p_alpha1", "/synthetic/alpha", 1]]);
    assert.deepEqual(f.services.listAgentActivity("p_bravo1"), []);
    assert.deepEqual(f.services.listAgentActivity("../p_alpha1"), []);
    const home = await f.services.projectHome({ window: f.zen.window, id: "p_alpha1" });
    assert.deepEqual([home.agent_activity.reporting, home.agent_activity.records.map(item => item.title)], [true, ["Approve the migration?"]]);
    assert.equal(JSON.stringify(home.agent_activity).includes("payload"), false);
    assert.deepEqual((await f.services.projectHome({ window: f.zen.window, id: "p_bravo1" })).agent_activity.records, []);
    const attention = (await f.services.needsAttention()).filter(item => item.kind === "agent");
    assert.deepEqual(attention, [{ kind: "agent", title: "Alpha: Claude Code needs you", detail: "Approve the migration?",
      target: { type: "project", id: "p_alpha1" } }]);
    const foreign = f.connect(); foreign.receive(encode(hello("axiosozo-notify", "/synthetic/elsewhere"))); foreign.receive(encode(hook("/synthetic/elsewhere")));
    await flush();
    assert.deepEqual(foreign.messages.at(-1), { v: 1, type: "ack", matched: false });
    // A project write hides the history until the cache is authoritative again.
    const gate = deferred(); f.writeGates.push(gate);
    const writing = f.services.setAccountLabel("p_alpha1", { key: "vercel", label: "x" });
    assert.deepEqual(f.services.listAgentActivity("p_alpha1"), []);
    gate.resolve(); await writing; await flush();
    assert.equal(f.services.listAgentActivity("p_alpha1")[0].history.length, 1);
  } finally { await f.close(); }
});

// An expiring record emits synchronously while the home reads activity; an
// agents listener starts a tracked write right there and holds it pending.
async function expiringHome(f, writeTo) {
  f.services.registerAgentPresenter(f.zen.window, f.presenter("normal"));
  await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: true });
  const c = f.connect(); c.receive(encode(hello("axiosozo-notify", "/synthetic/alpha"))); c.receive(encode(hook("/synthetic/alpha")));
  await flush();
  assert.equal(f.services.listAgentActivity("p_alpha1")[0].history.length, 1);
  const gate = deferred(); f.writeGates.push(gate);
  let mutation = null;
  const off = f.services.on("agents", () => {
    if (!mutation) mutation = f.services.setAccountLabel(writeTo, { key: "vercel", label: "written during the home read" });
  });
  f.clock.at += 86400000 + 1; // past retention; the expiry timer itself is not run
  const reading = f.services.projectHome({ window: f.zen.window, id: "p_alpha1" });
  const release = async () => { off(); gate.resolve(); await mutation; await flush(); };
  return { reading, release, started: () => mutation !== null };
}

test("home re-entrancy: a write to this project started from an expiry callback during the home read refuses the stale home", { skip }, async () => {
  const f = fixture();
  try {
    const { reading, release, started } = await expiringHome(f, "p_alpha1");
    await assert.rejects(reading, { code: "PROJECT_CHANGED" }, "never the old project or available activity while its own write is pending");
    assert.equal(started(), true, "the expiry callback really started the write during the read");
    assert.equal(f.cache().state, "loading");
    await release();
    const home = await f.services.projectHome({ window: f.zen.window, id: "p_alpha1" });
    assert.deepEqual(home.project.accounts, [{ key: "vercel", label: "written during the home read" }]);
    assert.deepEqual(home.agent_activity, { records: [], reporting: true, sessions: [] }, "authoritative again once settled");
  } finally { await f.close(); }
});

test("home re-entrancy: a write to another project keeps this home's own mark but revokes the activity cache: activity is null", { skip }, async () => {
  const f = fixture();
  try {
    const { reading, release, started } = await expiringHome(f, "p_bravo1");
    const home = await reading;
    assert.equal(started(), true);
    assert.equal(home.project.id, "p_alpha1", "this project's own record and mark are unchanged, so its home stands");
    assert.equal(home.agent_activity, null, "but the activity cache was revoked during the read: unavailable, never available-and-empty");
    assert.equal(f.cache().state, "loading");
    await release();
    assert.notEqual((await f.services.projectHome({ window: f.zen.window, id: "p_alpha1" })).agent_activity, null);
  } finally { await f.close(); }
});

test("home re-entrancy: without any callback write the home and its activity read normally", { skip }, async () => {
  const f = fixture();
  try {
    f.services.registerAgentPresenter(f.zen.window, f.presenter("normal"));
    await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: true });
    const c = f.connect(); c.receive(encode(hello("axiosozo-notify", "/synthetic/alpha"))); c.receive(encode(hook("/synthetic/alpha")));
    await flush();
    let events = 0;
    const off = f.services.on("agents", () => { events++; });
    f.clock.at += 86400000 + 1;
    const home = await f.services.projectHome({ window: f.zen.window, id: "p_alpha1" });
    off();
    assert.equal(events > 0, true, "the expiry still emitted");
    assert.deepEqual(home.agent_activity, { records: [], reporting: true, sessions: [] }, "expired, so empty, and still authoritative");
  } finally { await f.close(); }
});

test("hook settings only for a normal window while listening; diagnostics keep counts and booleans only; shutdown closes the channel", { skip }, async () => {
  const f = fixture();
  const hidden = fakeZenWindow({ spaces: [], isPrivate: true });
  try {
    f.services.registerWindow(hidden.window, new ZenWorkspaceAdapter(hidden.window));
    await assert.rejects(f.services.getAgentHookConfig({ window: f.zen.window, agent: "codex" }), { code: "ENDPOINT_UNAVAILABLE" });
    await assert.rejects(f.services.setAgentEndpointEnabled({ window: hidden.window, enabled: true }), { code: "PRIVATE_WINDOW" });
    await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: true });
    assert.deepEqual(await f.services.getAgentHookConfig({ window: f.zen.window, agent: "codex" }), { agent: "codex", text: "codex → /synthetic/profile/.a/s\n" });
    await assert.rejects(f.services.getAgentHookConfig({ window: f.zen.window, agent: "bash" }), { code: "INVALID_INPUT" });
    await assert.rejects(f.services.getAgentHookConfig({ window: hidden.window, agent: "codex" }), { code: "PRIVATE_WINDOW" });
    const diagnostics = f.services.getAgentDiagnostics();
    const strings = [];
    const walk = value => { if (typeof value === "string") strings.push(value); else if (value && typeof value === "object") Object.values(value).forEach(walk); };
    walk(diagnostics);
    assert.deepEqual(strings, [], "no paths, argv or codes");
    assert.deepEqual([diagnostics.listening, diagnostics.enabled, diagnostics.ownership.active, diagnostics.ownership.configuration.native_config_verified,
      diagnostics.ownership.configuration.lock_helpers.owned_exit_receipts], [true, true, true, true, 2]);
    const closing = f.shutdown.find(item => item.label === "AxioSozo: close agent channel");
    await closing.fn();
    const closed = f.services.getAgentEndpointState();
    assert.deepEqual([closed.enabled, closed.state, closed.projects.state], [false, "disabled", "closed"]);
    assert.ok(f.calls.some(([name]) => name === "cleanup"), "owned cleanup ran");
    assert.equal(f.services.getAgentDiagnostics().closed, true);
  } finally { await f.close(); }
});

test("a native start failure is reported honestly and an explicit retry starts it; disable stops it", { skip }, async () => {
  const f = fixture({ nativeFails: 1 });
  try {
    const failed = await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: true });
    assert.deepEqual([failed.enabled, failed.state, failed.reason], [true, "unavailable", "NATIVE_CONFIGURATION_UNAVAILABLE"]);
    assert.equal(f.servers.length, 0, "nothing was bound");
    const retried = await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: true });
    assert.equal(retried.state, "listening");
    const off = await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: false });
    assert.deepEqual([off.enabled, off.state, off.socketPath], [false, "disabled", undefined]);
    assert.equal(f.servers[0].closed, true);
    await assert.rejects(f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: "yes" }), { code: "INVALID_INPUT" });
  } finally { await f.close(); }
});

test("no verified hook builder means no hook settings, never a constructed fallback", { skip }, async () => {
  const f = fixture({ hookConfig: false });
  try {
    await f.services.setAgentEndpointEnabled({ window: f.zen.window, enabled: true });
    await assert.rejects(f.services.getAgentHookConfig({ window: f.zen.window, agent: "claude-code" }), { code: "ENDPOINT_UNAVAILABLE" });
  } finally { await f.close(); }
});
