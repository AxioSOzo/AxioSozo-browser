/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 6 at the integration boundary: the actual AboutAxioSozoParent
// actor, the actual AxioSozoServices glue (snapshot cache, root admission,
// guarded commit, owners) and the actual UnderstandService facade, controller
// and staged JSONL transport. Profile storage, Zen windows, native facts, the
// fixture runtime, its host child, root metadata and the manifest helper are
// synthetic in-memory fakes: no process, helper, provider, CLI or profile is
// touched. Not evidence of native spawn, Gecko rendering or a GUI pass.
import nativeTest from "node:test";
import assert from "node:assert/strict";
import { contextsCoreAvailable } from "./support/chrome-modules.mjs";
import { fakeZenWindow } from "./support/fake-zen.mjs";

const skip = contextsCoreAvailable ? false : "packages/contexts/src/index.mjs is absent";
const test = (name, run) => nativeTest(name, { skip, timeout: 5000 }, run);
const { AxioSozoServices, understandFixtureOpener, understandFixtureRequested } = skip ? {} : await import("../chrome/AxioSozoServices.sys.mjs");
const { ZenWorkspaceAdapter } = await import("../chrome/ZenWorkspaceAdapter.sys.mjs");
const { AboutAxioSozoParent, MESSAGES, EVENT_NAMES, setProvidersForTesting, projectHomeRoute } = await import("../chrome/AboutAxioSozoParent.sys.mjs");
const { createUnderstandTransport } = await import("../chrome/ProviderUnderstand.sys.mjs");
const { createGeckoIdentityAdapter } = await import("../chrome/ProjectContainers.sys.mjs");
const core = skip ? null : await import("../../../packages/contexts/src/index.mjs");

const BASE = "/Volumes/AxioSozoBuild/workstation/gui-fixtures/understand-0123456789abcdef0123456789abcdef/projects";
const HARBOR = `${BASE}/harbor`, INKLINE = `${BASE}/inkline`;
const ORPHAN_SPACE = "99999999-9999-4999-8999-999999999999";
const settle = async (rounds = 30) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setImmediate(resolve)); };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const clone = value => JSON.parse(JSON.stringify(value));
const doc = (product = "A synthetic harbour booking suite.") => ({ version: 1, product, apps: [{ name: "web", kind: "web", path: "apps/web", summary: "Bookings" }],
  domains: [{ host: "api.harbor-synthetic.dev", purpose: "API" }], services: [], start: [{ label: "Web", command: "bun run dev", cwd: null }], risks: [] });
const brief = () => ({ version: 1, cli: "codex", generated_at: 500, accepted: false, document: doc("An earlier synthetic brief.") });
const manifest = name => ({ version: 1, name, kind: "web", environments: [], services: [], surfaces: [] });
const record = (id, root, name, extra = {}) => ({ ...clone(core.upgradeProject({ version: 1, id, root, manifest: manifest(name),
  manifest_state: "none", context_uuid: null, trusted: false, created_at: 1, updated_at: 2 })), ...extra });
const ok = params => ({ version: 1, request_id: params.request_id, kind: "brief", cli: params.cli, status: "ok", reason: null,
  document: doc(), data_sent: true, duration_ms: 7 });
const cancelled = params => ({ version: 1, request_id: params.request_id, kind: "brief", cli: params.cli, status: "cancelled",
  reason: "CANCELLED", document: null, data_sent: true, duration_ms: 3 });

// One clock for the facade, controller and transport timers (never advanced unless a test does).
function fakeClock() {
  let at = Date.UTC(2026, 9, 3, 12), id = 0;
  const tasks = new Map();
  return { now: () => at, timers: { setTimeout(fn, ms) { tasks.set(++id, { fn, due: at + ms }); return id; }, clearTimeout(handle) { tasks.delete(handle); } },
    advance(ms) { const end = at + ms; for (;;) { const next = [...tasks].filter(([, task]) => task.due <= end).sort((a, b) => a[1].due - b[1].due)[0];
      if (!next) break; at = next[1].due; tasks.delete(next[0]); next[1].fn(); } at = end; } };
}

// The provider-host child as the staged transport sees it: raw UTF-8 pipes,
// one JSONL frame per line. Every written frame is recorded; a held run gets
// its terminal reply when the test releases it, or a cancelled one on cancel.
function fakeHostChild(host) {
  function pipe() {
    const queued = []; let waiting = null, closed = false;
    return { read() {
      if (queued.length) return Promise.resolve(queued.shift());
      if (closed) return Promise.resolve(new ArrayBuffer(0));
      const wait = deferred(); waiting = wait.resolve; return wait.promise;
    }, push(text) {
      const raw = new TextEncoder().encode(text).buffer;
      if (waiting) { const resolve = waiting; waiting = null; resolve(raw); } else queued.push(raw);
    }, close() { closed = true; waiting?.(new ArrayBuffer(0)); waiting = null; return Promise.resolve(); } };
  }
  const stdout = pipe(), stderr = pipe(), exit = deferred();
  const reply = (id, result) => stdout.push(JSON.stringify({ version: 1, id, result }) + "\n");
  const stop = () => { host.exits++; exit.resolve({ exitCode: 0 }); return Promise.resolve(); };
  const child = { stdout, stderr, wait: () => exit.promise, kill: stop, stdin: { close: stop, write(line) {
    const frame = JSON.parse(line);
    host.frames.push(frame);
    if (frame.method === "understand/available") reply(frame.id, { clis: [{ cli: "codex", path: "/fixed/private/fake-cli", version: "synthetic-1" }] });
    else if (frame.method === "understand/cancel") {
      reply(frame.id, { cancelled: true });
      const at = host.held.findIndex(item => item.params.request_id === frame.params.request_id);
      if (at >= 0) { const [run] = host.held.splice(at, 1); reply(run.id, cancelled(run.params)); }
    } else if (host.hold) host.held.push(frame);
    else reply(frame.id, ok(frame.params));
    return Promise.resolve();
  } } };
  host.release = (index = 0, answer = ok) => { const [run] = host.held.splice(index, 1); reply(run.id, answer(run.params)); };
  return child;
}

function fixture({ fixtureMode = true, projects = null, containers = false, manifestIO = null, roots = null, fs = undefined } = {}) {
  const clock = fakeClock();
  const seeded = projects ?? [record("p_harbor1", HARBOR, "Harbor"), record("p_inkline1", INKLINE, "Inkline")];
  const files = new Map([["contexts.json", JSON.stringify({ version: 3, contexts: [{ version: 1, workspace_uuid: ORPHAN_SPACE, type: "personal",
    organization_uuid: null, project_id: null, engine_preference: null, updated_at: 1 }], projects: seeded })]]);
  const counts = { reads: 0, writes: 0, rootMetadata: 0, opens: 0, manifestIO: 0, spawns: 0, closes: 0 };
  const writeFailures = [], writeGates = [], events = [], shutdown = [];
  const storageFor = name => ({
    read: async () => { if (name === "contexts.json") counts.reads++; return files.get(name) ?? null; },
    write: async text => {
      if (name === "contexts.json") {
        const gate = writeGates.shift(); if (gate) await gate.promise;
        if (writeFailures.shift()) throw new Error("synthetic disk failure /private/detail");
        counts.writes++;
      }
      files.set(name, text);
    },
  });
  const metadata = new Map((roots ?? [[HARBOR, { canonical: HARBOR, directory: true }], [INKLINE, { canonical: INKLINE, directory: true }]]));
  const host = { frames: [], held: [], hold: false, exits: 0, gate: null };
  const runtime = { fixturePaths: Object.freeze({ projectRoots: Object.freeze([HARBOR, INKLINE]) }), timers: clock.timers,
    env: key => (key === "AXIOSOZO_PROVIDER_NODE" ? "/fixed/toolchain/node" : key === "AXIOSOZO_PROVIDER_HOST" ? "/fixed/root/packages/provider-host/cli.mjs" : ""),
    uuid: (() => { let n = 0; return () => `wire_${++n}`; })(),
    async spawn() { counts.spawns++; if (host.gate) await host.gate.promise; return fakeHostChild(host); } };
  const understandFixture = fixtureMode ? { openRuntime: understandFixtureOpener({
    createRuntime: async ({ signal }) => { counts.opens++; assert.equal(signal.aborted, false); return runtime; },
    createTransport: async options => {
      const transport = createUnderstandTransport(options);
      return { request: (...args) => transport.request(...args), cancel: (...args) => transport.cancel(...args),
        close: () => { counts.closes++; return transport.close(); } };
    } }) } : undefined;
  const identityService = { getPublicIdentityFromId: () => null, create: (name, icon, color) => ({ userContextId: 70, public: true, name, icon, color }), update: () => true };
  const observed = {};
  const services = new AxioSozoServices({
    storageFor, clock: clock.now, timers: clock.timers, randomId: (() => { let n = 0; return prefix => `${prefix}fixture${++n}`; })(),
    onShutdown: (fn, label) => shutdown.push({ fn, label }), ...(fs ? { fs } : {}),
    rootMetadata: path => { counts.rootMetadata++; return typeof metadata.get(path) === "function" ? metadata.get(path)() : metadata.get(path) ?? null; },
    ...(understandFixture ? { understandFixture } : {}),
    ...(manifestIO ? { createManifestAcceptIO: () => { counts.manifestIO++; return manifestIO; } } : {}),
    ...(containers ? { containerIdentities: () => createGeckoIdentityAdapter({ service: identityService, allowedColors: ["blue"], allowedIcons: ["briefcase"] }),
      containersEnabled: () => true, observeContainers: callbacks => { Object.assign(observed, callbacks); return () => {}; } } : {}),
  });
  for (const name of EVENT_NAMES) services.on(name, () => events.push(name));
  const tabListeners = new Set(), progressListeners = new Set();
  function openWindow({ listeners = new Set(), progress = new Set(), isPrivate = false } = {}) {
    const zen = fakeZenWindow({ spaces: [{ uuid: "11111111-1111-4111-8111-111111111111", name: "Home", containerTabId: 0 }], isPrivate });
    zen.window.gBrowser.tabContainer = { addEventListener: (type, fn) => { if (type === "TabSelect") listeners.add(fn); },
      removeEventListener: (type, fn) => { if (type === "TabSelect") listeners.delete(fn); } };
    // tabbrowser's tabs progress listeners: onLocationChange(browser, webProgress, request, location, flags).
    zen.window.gBrowser.addTabsProgressListener = listener => progress.add(listener);
    zen.window.gBrowser.removeTabsProgressListener = listener => progress.delete(listener);
    const unregister = services.registerWindow(zen.window, new ZenWorkspaceAdapter(zen.window));
    return { zen, window: zen.window, unregister, listeners, progress };
  }
  const first = openWindow({ listeners: tabListeners, progress: progressListeners });
  // The actor reaches the real services; the predicate each owner was minted with is kept for the test.
  const minted = [];
  const spy = new Proxy(services, { get(target, name) {
    if (name === "registerUnderstandOwner") return options => { minted.push(options.current); return target.registerUnderstandOwner(options); };
    const value = target[name];
    return typeof value === "function" ? value.bind(target) : value;
  } });
  const restore = setProvidersForTesting({ services: () => spy });
  const stored = id => JSON.parse(files.get("contexts.json")).projects.find(item => item.id === id);
  return { services, clock, files, counts, writeFailures, writeGates, events, shutdown, metadata, host, zen: first.zen, unregister: first.unregister,
    restore, observed, stored, openWindow, tabListeners, progressListeners, minted,
    select(browser) { first.window.gBrowser.selectedBrowser = browser; for (const fn of [...tabListeners]) fn({ type: "TabSelect" }); },
    // A native top-level location change of `browser`, as tabbrowser reports it (a same-document one included).
    locationChange(browser, { isTopLevel = true } = {}) {
      for (const listener of [...progressListeners]) listener.onLocationChange?.(browser, { isTopLevel }, null, null, 1);
    } };
}

/** One about:axiosozo document in the fixture's window, with native facts the
 * test can change. `route` is the project home it shows; route(next) is a
 * same-document navigation as Gecko reports it to the parent: a new native
 * documentURI object on the WindowGlobal (no page message, no cleanup RPC). */
function page(f, { window = f.zen.window, route = "p_harbor1" } = {}) {
  const actor = new AboutAxioSozoParent();
  const embedder = { localName: "browser" };
  const context = { parent: null, embedderElement: embedder, usePrivateBrowsing: false, topChromeWindow: window };
  context.top = context;
  actor.browsingContext = context;
  const uri = next => ({ spec: next === null ? "about:axiosozo#projects" : `about:axiosozo#project=${next}` });
  actor.manager = { remoteType: "privilegedabout", isCurrentGlobal: true, documentURI: uri(route),
    documentPrincipal: { isSystemPrincipal: false, isContentPrincipal: true, originNoSuffix: "about:axiosozo", privateBrowsingId: 0 } };
  actor.sent = [];
  actor.sendAsyncMessage = (name, data) => actor.sent.push([name, data]);
  window.gBrowser.selectedBrowser = embedder;
  const request = (name, params) => actor.receiveMessage({ name: MESSAGES.REQUEST, data: { name, params } });
  return { actor, embedder, context, request, read: (projectId = "p_harbor1", cli = "codex") => request("readProject", { projectId, cli }),
    route(next) { actor.manager.documentURI = uri(next); } };
}
const value = reply => { assert.equal(reply.ok, true, JSON.stringify(reply.error)); return reply.value; };
const code = reply => { assert.equal(reply.ok, false, "expected a refusal"); return reply.error.code; };
const runs = f => f.host.frames.filter(frame => frame.method === "understand/run");

// ---------------------------------------------------------------- production and fixture selection

test("production: Read, state and availability are NOT_AUTHORIZED before any snapshot, root admission, runtime or event; a saved brief stays", async () => {
  const f = fixture({ fixtureMode: false, projects: [record("p_harbor1", HARBOR, "Harbor", { brief: brief() })] });
  try {
    const p = page(f);
    const read = value(await p.read());
    assert.deepEqual([read.status, read.reason, read.document, read.data_sent], ["unavailable", "NOT_AUTHORIZED", null, false]);
    assert.deepEqual(value(await p.request("getUnderstandState", { projectId: "p_harbor1" })),
      { authorization: "NOT_AUTHORIZED", mode: "PRODUCTION", clis: [], jobs: [] });
    assert.deepEqual(value(await p.request("getUnderstandAvailability", { projectId: "p_harbor1" })), { authorization: "NOT_AUTHORIZED", clis: [] });
    // An unknown project's home is denied the same way: nothing was looked up to answer.
    assert.equal(value(await page(f, { route: "p_unknown1" }).read("p_unknown1")).reason, "NOT_AUTHORIZED");
    // A home may act for its own project only: the selected Harbor home cannot ask for another.
    f.zen.window.gBrowser.selectedBrowser = p.embedder;
    assert.equal(code(await p.read("p_unknown1")), "DOCUMENT_GONE");
    assert.deepEqual([f.counts.reads, f.counts.rootMetadata, f.counts.opens, f.counts.spawns, f.host.frames.length], [0, 0, 0, 0, 0],
      "no store read (cache preparation), root admission, factory, spawn or envelope");
    assert.equal(f.events.includes("understand"), false, "no indicator or understand event");
    assert.deepEqual(value(await p.request("cancelUnderstand", { projectId: "p_harbor1", requestId: "x:1" })), { cancelled: false });
    const home = await f.services.projectHome({ window: f.zen.window, id: "p_harbor1" });
    assert.equal(home.project.brief.document.product, "An earlier synthetic brief.", "the saved brief is still the home's document");
    assert.equal(f.services.getUnderstandDiagnostics().offline, false);
  } finally { f.restore(); }
});

test("fixture selection: only the native request picks the offline facade; OFFLINE_FIXTURE still says NOT_AUTHORIZED; the opener is lazy and admits no fallback", async () => {
  assert.equal(understandFixtureRequested(() => ""), false);
  assert.equal(understandFixtureRequested(() => undefined), false);
  assert.equal(understandFixtureRequested(() => { throw new Error("env"); }), false);
  assert.equal(understandFixtureRequested(name => (name === "AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT" ? "/Volumes/AxioSozoBuild/x" : "")), true);
  // A requested fixture whose runtime the native factory refuses (null) never becomes a product client.
  let transports = 0;
  const refused = understandFixtureOpener({ createRuntime: async () => null, createTransport: async () => { transports++; return {}; } });
  await assert.rejects(refused({ signal: new AbortController().signal }), { code: "UNDERSTAND_FIXTURE_UNAVAILABLE" });
  const rootless = understandFixtureOpener({ createRuntime: async () => ({ fixturePaths: { projectRoots: [] } }), createTransport: async () => { transports++; return {}; } });
  await assert.rejects(rootless({}), { code: "UNDERSTAND_FIXTURE_UNAVAILABLE" });
  assert.equal(transports, 0);
  const f = fixture();
  try {
    const p = page(f);
    const state = value(await p.request("getUnderstandState", { projectId: "p_harbor1" }));
    assert.deepEqual(state, { authorization: "NOT_AUTHORIZED", mode: "OFFLINE_FIXTURE", clis: [], jobs: [] });
    assert.equal(f.counts.opens, 0, "reading state opens no runtime");
    assert.deepEqual(value(await p.request("getUnderstandAvailability", { projectId: "p_harbor1" })),
      { authorization: "NOT_AUTHORIZED", clis: [{ cli: "codex", version: "synthetic-1" }] }, "metadata only, never a native path");
    assert.equal(f.counts.opens, 1);
    assert.deepEqual(value(await p.request("getUnderstandState", { projectId: "p_harbor1" })).clis, [{ cli: "codex", version: "synthetic-1" }]);
    assert.equal(JSON.stringify(f.events).includes("/fixed"), false);
  } finally { f.restore(); }
});

// ---------------------------------------------------------------- guarded persistence

test("a successful read commits once through the real JsonStore queue; projects follows the durable write; the result is not self-cancelled", async () => {
  const f = fixture();
  try {
    const p = page(f);
    const writesBefore = f.counts.writes;
    const result = value(await p.read());
    assert.deepEqual([result.status, result.reason, result.data_sent], ["ok", null, true], "a self-invalidating commit would answer STALE_PROJECT");
    assert.equal(JSON.stringify(result).includes(HARBOR), false, "no root crosses to the page");
    assert.equal(f.counts.writes, writesBefore + 1, "one profile write");
    const saved = f.stored("p_harbor1");
    assert.deepEqual([saved.brief.cli, saved.brief.accepted, saved.brief.document.product], ["codex", false, doc().product]);
    assert.equal(f.stored("p_inkline1").brief, null, "the other project is untouched");
    assert.ok(f.events.indexOf("projects") > f.events.indexOf("understand"), "projects is published after the read's states");
    const state = value(await p.request("getUnderstandState", { projectId: "p_harbor1" }));
    assert.deepEqual(state.jobs.map(job => [job.state, job.status, job.reason, job.data_sent]), [["complete", "ok", null, true]]);
    // The next read binds to the published revision: it is not refused as stale.
    assert.equal(value(await p.read()).status, "ok");
    assert.equal(runs(f).length, 2);
  } finally { f.restore(); }
});

test("a failed profile write keeps the earlier brief: BRIEF_SAVE_FAILED, no projects event and a failed state row", async () => {
  const f = fixture({ projects: [record("p_harbor1", HARBOR, "Harbor", { brief: brief() }), record("p_inkline1", INKLINE, "Inkline")] });
  try {
    const p = page(f);
    f.writeFailures.push(true);
    const before = f.files.get("contexts.json");
    f.events.length = 0;
    assert.equal(code(await p.read()), "BRIEF_SAVE_FAILED");
    assert.equal(f.files.get("contexts.json"), before, "the profile file is unchanged");
    assert.equal(f.events.includes("projects"), false, "no success published");
    assert.equal(f.stored("p_harbor1").brief.document.product, "An earlier synthetic brief.");
    const state = value(await p.request("getUnderstandState", { projectId: "p_harbor1" }));
    assert.deepEqual(state.jobs.map(job => [job.state, job.status, job.reason]), [["complete", "failed", "BRIEF_SAVE_FAILED"]]);
    // The cache kept the old revision: a later read still binds and saves.
    assert.equal(value(await p.read()).status, "ok");
  } finally { f.restore(); }
});

for (const [label, mutate] of [
  ["an account label update", f => f.services.setAccountLabel("p_harbor1", { key: "vercel", label: "work Google" })],
  ["the project's removal", f => f.services.removeProject("p_harbor1")],
  ["an every-project orphan cleanup", f => f.services.removeOrphans([ORPHAN_SPACE])],
]) {
  test(`${label} invalidates a running read before it starts: a cancel is sent and nothing is saved`, async () => {
    const f = fixture({ projects: [record("p_harbor1", HARBOR, "Harbor", { brief: brief() }), record("p_inkline1", INKLINE, "Inkline")] });
    try {
      f.host.hold = true;
      const p = page(f);
      const pending = p.read();
      await settle();
      assert.equal(runs(f).length, 1);
      const gate = deferred();
      f.writeGates.push(gate);
      const mutation = mutate(f);
      // Synchronously at its start the job is stopped and no snapshot is handed out.
      assert.equal(code(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" })), "PROJECT_CHANGED");
      // Its cancel envelope goes out while the profile write is still held.
      const result = value(await pending);
      assert.deepEqual(f.host.frames.filter(frame => frame.method === "understand/cancel").map(frame => frame.params.request_id), [runs(f)[0].params.request_id]);
      gate.resolve();
      await mutation;
      assert.deepEqual([result.status, result.reason, result.document], ["cancelled", "STALE_PROJECT", null]);
      const saved = f.stored("p_harbor1");
      assert.equal(saved?.brief?.document.product ?? null, label.includes("removal") ? null : "An earlier synthetic brief.", "no stale brief was persisted");
    } finally { f.restore(); }
  });
}

test("a container reset (every project) stops a running read and no snapshot is handed out until it settled", async () => {
  // Inkline is mapped to a container, so the reset has a store write to make.
  const f = fixture({ containers: true, projects: [record("p_harbor1", HARBOR, "Harbor"),
    record("p_inkline1", INKLINE, "Inkline", { container: { user_context_id: 41 } })] });
  try {
    f.host.hold = true;
    const p = page(f);
    const pending = p.read();
    await settle();
    const gate = deferred();
    f.writeGates.push(gate);
    f.observed.containersDisabled();
    assert.equal(value(await pending).reason, "STALE_PROJECT");
    assert.equal(f.host.frames.filter(frame => frame.method === "understand/cancel").length, 1, "stopped while the cleanup's write is held");
    assert.equal(code(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" })), "PROJECT_CHANGED", "withheld while cleanup runs");
    gate.resolve();
    await settle();
    assert.equal(f.stored("p_harbor1").brief, null);
  } finally { f.restore(); }
});

test("early phases count: a refresh still reading the folder and a legacy manifest write still on disk already stopped the read", async () => {
  for (const phase of ["refresh", "manifest"]) {
    // Both begin with an asynchronous filesystem step long before their profile write.
    const gate = deferred(), touched = [];
    const fs = { join: (root, relative) => `${root}/${relative}`, basename: path => path.split("/").at(-1),
      realpath: async path => { touched.push("realpath"); await gate.promise; return path; },
      lstat: async () => { touched.push("lstat"); await gate.promise; return null; }, stat: async () => null };
    const f = fixture({ fs });
    try {
      f.host.hold = true;
      const p = page(f);
      const pending = p.read();
      await settle();
      assert.equal(runs(f).length, 1);
      const started = phase === "refresh" ? f.services.refreshProjectDetection("p_harbor1") : f.services.writeManifest("p_harbor1");
      started.catch(() => {});
      await settle();
      assert.deepEqual(touched, [phase === "refresh" ? "realpath" : "lstat"], `${phase}: held in its first filesystem step`);
      assert.equal(f.host.frames.filter(frame => frame.method === "understand/cancel").length, 1, `${phase}: the read was already stopped`);
      assert.equal(value(await pending).reason, "STALE_PROJECT");
      gate.resolve();
      await started.catch(() => {});
      assert.equal(f.stored("p_harbor1").brief, null, `${phase}: nothing stale was saved`);
    } finally { f.restore(); }
  }
});

// ---------------------------------------------------------------- root admission

test("root admission is synchronous, literal and fresh: not a directory, a moved canonical path, a throw, a Promise or nothing refuse before any runtime", async () => {
  for (const [label, answer] of [["not a directory", { canonical: HARBOR, directory: false }],
    ["moved canonical path", { canonical: `${BASE}/elsewhere`, directory: true }], ["throws", () => { throw new Error("EIO /private"); }],
    ["Promise", () => Promise.resolve({ canonical: HARBOR, directory: true })], ["missing", undefined]]) {
    const f = fixture();
    try {
      f.metadata.set(HARBOR, answer);
      const p = page(f);
      assert.equal(code(await p.read()), "INVALID_PROJECT", label);
      assert.equal(f.counts.opens, 0, `${label}: refused before the factory`);
      // Asked afresh every time: once the folder is right again it is admitted.
      f.metadata.set(HARBOR, { canonical: HARBOR, directory: true });
      assert.equal(value(await p.read()).status, "ok", `${label}: no stale refusal is kept`);
    } finally { f.restore(); }
  }
});

// ---------------------------------------------------------------- live authority across host admission

for (const loss of ["selection", "revision", "root", "metadata"]) {
  test(`delayed host start: ${loss} lost with no page cancellation sends no envelope; another owner then uses the shared runtime`, async () => {
    const f = fixture();
    try {
      f.host.gate = deferred();
      const p = page(f);
      const pending = loss === "metadata" ? p.request("getUnderstandAvailability", { projectId: "p_harbor1" }) : p.read();
      await settle();
      assert.deepEqual([f.counts.opens, f.counts.spawns, f.host.frames.length], [1, 1, 0], "held inside the host start");
      // No TabSelect, no cancel message, no pagehide: only the native facts or the profile change.
      if (loss === "selection" || loss === "metadata") f.zen.window.gBrowser.selectedBrowser = { localName: "browser", other: true };
      if (loss === "revision") await f.services.setAccountLabel("p_harbor1", { key: "vercel", label: "work Google" });
      if (loss === "root") f.metadata.set(HARBOR, { canonical: `${BASE}/swapped`, directory: true });
      f.host.gate.resolve();
      const reply = await pending;
      if (loss === "selection" || loss === "metadata") assert.equal(code(reply), "OWNER_REVOKED");
      else assert.deepEqual([value(reply).status, value(reply).reason, value(reply).data_sent], ["cancelled", "STALE_PROJECT", false]);
      await settle();
      assert.equal(f.host.frames.length, 0, "no run, availability or cancel envelope crossed the last live boundary");
      assert.equal(f.stored("p_harbor1").brief, null);
      // A different, authorized document still gets the shared runtime (not tied to the first caller).
      const second = page(f, { route: "p_inkline1" });
      assert.equal(value(await second.read("p_inkline1")).status, "ok");
      assert.equal(f.counts.opens, 1, "one runtime for the process");
      assert.deepEqual(runs(f).map(frame => frame.params.project_root), [INKLINE]);
    } finally { f.restore(); }
  });
}

for (const phase of ["queued", "running"]) {
  test(`a synchronous revocation inside the ${phase} notification stops dispatch before any spawn`, async () => {
    const f = fixture();
    try {
      const p = page(f);
      let seen = 0;
      f.services.on("understand", () => {
        // The facade notifies queued, then running, before any runtime handoff.
        if (++seen === (phase === "queued" ? 1 : 2)) f.zen.window.gBrowser.selectedBrowser = { localName: "browser", other: true };
      });
      assert.equal(code(await p.read()), "OWNER_REVOKED");
      assert.deepEqual([f.counts.spawns, f.host.frames.length], [0, 0], "nothing was handed to the transport");
      const second = page(f, { route: "p_inkline1" });
      assert.equal(value(await second.read("p_inkline1")).status, "ok", "the queue and runtime keep working for another owner");
    } finally { f.restore(); }
  });
}

test("TabSelect away ends the lifetime at once: the running read is cancelled, its listener removed, and a new lifetime starts on return", async () => {
  const f = fixture();
  try {
    f.host.hold = true;
    const p = page(f);
    const pending = p.read();
    await settle();
    assert.equal(f.tabListeners.size, 1);
    f.select({ localName: "browser", other: true });
    assert.equal(f.tabListeners.size, 0, "unwatched synchronously");
    assert.equal(code(await pending), "OWNER_REVOKED");
    assert.equal(f.host.frames.filter(frame => frame.method === "understand/cancel").length, 1);
    f.select(p.embedder);
    // Never revived: the next operation acquires a fresh owner with no jobs.
    assert.deepEqual(value(await p.request("getUnderstandState", { projectId: "p_harbor1" })).jobs, []);
    f.host.hold = false;
    assert.equal(value(await p.read()).status, "ok");
  } finally { f.restore(); }
});

test("post-answer guards: a document replaced while its read ran gets no result, and nothing is saved for it", async () => {
  const f = fixture();
  try {
    f.host.hold = true;
    const p = page(f);
    const pending = p.read();
    await settle();
    // The same actor now fronts another document (a new WindowGlobal), with no message about it.
    p.actor.manager = { ...p.actor.manager, documentURI: { spec: "about:axiosozo#projects" } };
    f.host.release();
    assert.equal(code(await pending), "OWNER_REVOKED");
    assert.equal(f.stored("p_harbor1").brief, null, "a stale owner's success is never published");
  } finally { f.restore(); }
});

// ---------------------------------------------------------------- owners and lifetimes

test("two documents share one host: destroying one ends only its read and listeners; unregistering a window ends its owners; shutdown closes once", async () => {
  const io = diskIO();
  const f = fixture({ manifestIO: io.io, projects: [record("p_harbor1", HARBOR, "Harbor", { brief: brief() }),
    record("p_inkline1", INKLINE, "Inkline", { brief: brief() })] });
  try {
    const other = f.openWindow();
    const a = page(f), b = page(f, { window: other.window, route: "p_inkline1" });
    await a.actor.receiveMessage({ name: MESSAGES.SUBSCRIBE, data: {} });
    const aLease = value(await a.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
    const bLease = value(await b.request("previewProjectBriefAcceptance", { projectId: "p_inkline1" }));
    f.host.hold = true;
    const aRead = a.read(), bRead = b.read("p_inkline1");
    await settle();
    assert.deepEqual(runs(f).map(frame => frame.params.project_root), [HARBOR], "B waits in the shared queue");
    const sentBefore = a.actor.sent.length;
    a.actor.didDestroy();
    assert.notEqual((await aRead).ok, true);
    await settle();
    assert.equal(f.host.frames.filter(frame => frame.method === "understand/cancel").length, 1, "only A's run was cancelled");
    assert.deepEqual(runs(f).map(frame => frame.params.project_root), [HARBOR, INKLINE], "B then ran on the same host");
    assert.equal(a.actor.sent.length, sentBefore, "a destroyed actor's listeners are gone");
    // A's lease died with it: a newer document in A's window cannot use it either.
    const c = page(f);
    assert.equal(code(await c.request("acceptProjectBrief", { projectId: "p_harbor1", token: aLease.token, edits: { name: "H" }, confirmed: true })),
      "STALE_ACCEPTANCE");
    f.host.release();
    assert.equal(value(await bRead).status, "ok");
    assert.deepEqual([f.counts.opens, f.counts.spawns], [1, 1]);
    // B's read replaced inkline's brief, so B's older lease is stale now: a fresh preview is needed.
    assert.equal(code(await b.request("acceptProjectBrief", { projectId: "p_inkline1", token: bLease.token, edits: { name: "Ink" }, confirmed: true })),
      "STALE_ACCEPTANCE");
    const fresh = value(await b.request("previewProjectBriefAcceptance", { projectId: "p_inkline1" }));
    assert.equal(typeof fresh.token, "string");
    // Unregistering B's window ends B's owner and its work.
    f.host.hold = true;
    const bAgain = b.read("p_inkline1");
    await settle();
    other.unregister();
    assert.equal(code(await bAgain), "OWNER_REVOKED");
    assert.equal(code(await b.request("acceptProjectBrief", { projectId: "p_inkline1", token: fresh.token, edits: { name: "Ink" }, confirmed: true })),
      "PRIVATE_WINDOW", "an unregistered window reaches nothing");
    assert.equal(io.writes.length, 0);
    // Profile shutdown: the facade closes once and admits no new work.
    const close = f.shutdown.find(entry => entry.label === "AxioSozo: close Understand");
    await close.fn();
    await close.fn();
    assert.equal(f.counts.closes, 1);
    const late = page(f);
    assert.equal(code(await late.request("getUnderstandState", { projectId: "p_harbor1" })), "UNDERSTAND_UNAVAILABLE");
    assert.equal(f.services.getUnderstandDiagnostics().owners, 0);
  } finally { f.restore(); }
});

// ---------------------------------------------------------------- actor boundary

test("closed RPCs: unknown keys, nested edit keys and malformed values are refused before any owner or facade exists", async () => {
  const f = fixture();
  try {
    const p = page(f);
    const token = "t".repeat(24);
    for (const [name, params] of [
      ["readProject", { projectId: "p_harbor1", cli: "codex", root: HARBOR }], ["readProject", { projectId: "p_harbor1", cli: "bash" }],
      ["readProject", { projectId: "p_harbor1", cli: "codex", timeoutMs: 9999 }], ["readProject", { projectId: "p_harbor1", cli: "codex", timeoutMs: 10000.5 }],
      ["readProject", { projectId: "../p_x", cli: "codex" }], ["readProject", { projectId: "p_harbor1", cli: "codex", testOnlyAllowRun: true }],
      ["getUnderstandState", { projectId: "p_harbor1", owner: {} }], ["getUnderstandAvailability", { projectId: "p_harbor1", runtime: {} }],
      ["cancelUnderstand", { projectId: "p_harbor1", requestId: "has space" }], ["previewProjectBriefAcceptance", { projectId: "p_harbor1", token }],
      ["acceptProjectBrief", { projectId: "p_harbor1", token, edits: { name: "X", command: "rm -rf /" }, confirmed: true }],
      ["acceptProjectBrief", { projectId: "p_harbor1", token, edits: {}, confirmed: true }],
      ["acceptProjectBrief", { projectId: "p_harbor1", token, edits: { name: "x".repeat(81) }, confirmed: true }],
      ["acceptProjectBrief", { projectId: "p_harbor1", token, edits: { kind: "service" }, confirmed: true }],
      ["acceptProjectBrief", { projectId: "p_harbor1", token, edits: { name: "X" }, confirmed: false }],
      ["acceptProjectBrief", { projectId: "p_harbor1", token, edits: { name: "X" }, confirmed: true, revision: 1 }],
      ["acceptProjectBrief", { projectId: "p_harbor1", token: "short", edits: { name: "X" }, confirmed: true }],
      ["reinspectProjectBriefAcceptance", { projectId: "p_harbor1", write: true }], ["cancelProjectReadOperations", { projectId: "p_harbor1" }],
    ]) assert.equal(code(await p.request(name, params)), "INVALID_PARAMS", `${name} ${JSON.stringify(params)}`);
    assert.equal(f.services.getUnderstandDiagnostics().created, false, "no facade or owner was made");
    assert.deepEqual([f.counts.reads, f.counts.rootMetadata, f.counts.opens], [0, 0, 0]);
    assert.equal(value(await p.request("cancelProjectReadOperations", {})), null, "a release without an owner is a no-op");
  } finally { f.restore(); }
});

test("refusals before any owner: private, unknown privacy, unregistered window, unselected browser, stale document or embedder", async () => {
  const cases = [
    ["private window", (f, p) => { p.context.usePrivateBrowsing = true; p.actor.manager.documentPrincipal = { ...p.actor.manager.documentPrincipal, privateBrowsingId: 1 }; }, "PRIVATE_WINDOW"],
    ["unknown privacy", (f, p) => { p.context.usePrivateBrowsing = undefined; }, "SENDER_REJECTED"],
    ["unregistered window", (f, p) => {
      const stray = f.openWindow();
      stray.unregister();
      p.context.topChromeWindow = stray.window;
      stray.window.gBrowser.selectedBrowser = p.embedder;
    }, "PRIVATE_WINDOW"],
    ["unselected browser", f => { f.zen.window.gBrowser.selectedBrowser = { localName: "browser", other: true }; }, "DOCUMENT_GONE"],
    ["stale document", (f, p) => { p.actor.manager.isCurrentGlobal = false; }, "SENDER_REJECTED"],
    ["no embedder", (f, p) => { p.context.embedderElement = null; }, "SENDER_REJECTED"],
  ];
  const quiet = console.error; console.error = () => {};
  try {
    for (const [label, setup, expected] of cases) {
      const f = fixture();
      try {
        const p = page(f);
        setup(f, p);
        for (const [name, params] of [["readProject", { projectId: "p_harbor1", cli: "codex" }], ["getUnderstandState", { projectId: "p_harbor1" }],
          ["previewProjectBriefAcceptance", { projectId: "p_harbor1" }]]) {
          assert.equal(code(await p.request(name, params)), expected, `${label}: ${name}`);
        }
        assert.equal(f.services.getUnderstandDiagnostics().created, false, `${label}: zero downstream work`);
        assert.deepEqual([f.counts.reads, f.counts.opens, f.host.frames.length], [0, 0, 0], label);
      } finally { f.restore(); }
    }
  } finally { console.error = quiet; }
});

test("events cross as names only: understand and projects reach the page without owners, jobs, documents, tokens or roots", async () => {
  const f = fixture();
  try {
    const p = page(f);
    await p.actor.receiveMessage({ name: MESSAGES.SUBSCRIBE, data: {} });
    assert.ok(EVENT_NAMES.includes("understand"));
    assert.equal(value(await p.read()).status, "ok");
    const names = p.actor.sent.filter(([message]) => message === MESSAGES.EVENT).map(([, data]) => data);
    assert.ok(names.some(data => data.name === "understand") && names.some(data => data.name === "projects"));
    assert.ok(names.every(data => Object.keys(data).join() === "name"), "only the event name");
    assert.equal(JSON.stringify(p.actor.sent).includes(HARBOR), false);
    // Unsubscribing (pagehide) ends the owner with the listeners.
    await p.actor.receiveMessage({ name: MESSAGES.UNSUBSCRIBE, data: {} });
    assert.equal(f.services.getUnderstandDiagnostics().owners, 0);
  } finally { f.restore(); }
});

// ---------------------------------------------------------------- brief acceptance

function diskIO() {
  const disk = new Map(), writes = [], inspections = [];
  let acceptImpl = null, snapshotImpl = null;
  const identity = inode => ({ device: "1", inode: String(inode) });
  const io = Object.freeze({
    async snapshot(root, { admit }) {
      assert.equal(admit(), true, "every inspection is guarded");
      inspections.push(root);
      if (snapshotImpl) return snapshotImpl(root, disk, { admit });
      const found = disk.get(root);
      return { rootIdentity: identity(2), directoryIdentity: found ? identity(3) : null,
        target: found ? { identity: identity(4), digest: found.digest, size: 120, mode: 0o644 } : null, manifest: found?.manifest ?? null };
    },
    async accept(payload, { admit }) {
      assert.equal(admit(), true, "the write is guarded");
      writes.push(clone(payload));
      if (acceptImpl) return acceptImpl(payload, disk, { admit });
      disk.set(payload.root, { manifest: clone(payload.manifest), digest: "b".repeat(64) });
      return { path: `${payload.root}/.axiosozo/project.json`, digest: "b".repeat(64), committed: true };
    },
  });
  return { io, disk, writes, inspections, onAccept(fn) { acceptImpl = fn; }, onSnapshot(fn) { snapshotImpl = fn; } };
}
const accept = (p, token, edits = { name: "Harbor Accepted", kind: "desktop" }) =>
  p.request("acceptProjectBrief", { projectId: "p_harbor1", token, edits, confirmed: true });

test("production acceptance: only the confirmed name and kind are written, tokens are one-use and owner-bound, and accepted only after reconciliation", async () => {
  const io = diskIO();
  const existing = clone(core.validateManifest({ ...manifest("Disk Harbor"), environments: [{ name: "local", base_url: "http://127.0.0.1:4173" }] }));
  io.disk.set(HARBOR, { manifest: existing, digest: "a".repeat(64) });
  const f = fixture({ fixtureMode: false, manifestIO: io.io, projects: [record("p_harbor1", HARBOR, "Harbor", { brief: brief() })] });
  try {
    const p = page(f), other = page(f, { window: f.openWindow().window });
    assert.equal(f.counts.manifestIO, 0, "the helper seam is built on first use only");
    const first = value(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
    assert.deepEqual(Object.keys(first), ["token", "manifest"]);
    assert.equal(first.manifest.name, "Disk Harbor", "the inspected file, not the brief");
    assert.equal(JSON.stringify(first).includes(HARBOR), false);
    assert.equal(f.counts.manifestIO, 1);
    // Another document cannot spend it: its owner is not this one.
    assert.equal(code(await accept(other, first.token)), "STALE_ACCEPTANCE");
    // A malformed attempt by its own document spends it, without any write.
    assert.equal(code(await accept(p, first.token, { name: "X", command: "bun run dev" })), "INVALID_PARAMS");
    assert.equal(code(await accept(p, first.token)), "STALE_ACCEPTANCE", "spent by the malformed attempt");
    assert.equal(io.writes.length, 0);
    // An expired review needs a fresh preview.
    const expired = value(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
    f.clock.advance(120000);
    assert.equal(code(await accept(p, expired.token)), "STALE_ACCEPTANCE");
    const second = value(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
    assert.deepEqual(value(await accept(p, second.token)), { status: "ACCEPTED", committed: true, reason: null });
    assert.equal(io.writes.length, 1);
    assert.deepEqual([io.writes[0].manifest.name, io.writes[0].manifest.kind], ["Harbor Accepted", "desktop"]);
    assert.deepEqual(io.writes[0].manifest.environments, existing.environments, "other fields are preserved");
    assert.doesNotMatch(JSON.stringify(io.writes), /bun run dev|api\.harbor-synthetic|earlier synthetic brief/u, "nothing of the brief is copied");
    const saved = f.stored("p_harbor1");
    assert.deepEqual([saved.manifest.name, saved.manifest_state, saved.brief.accepted], ["Harbor Accepted", "written", true]);
    assert.equal(code(await accept(p, second.token)), "STALE_ACCEPTANCE", "one use");
    assert.equal(io.writes.length, 1);
  } finally { f.restore(); }
});

test("uncertain writes: REINSPECTION_REQUIRED blocks a fresh preview, inspection never writes again, and lost authority never claims a rollback", async () => {
  const io = diskIO();
  const f = fixture({ fixtureMode: false, manifestIO: io.io, projects: [record("p_harbor1", HARBOR, "Harbor", { brief: brief() })] });
  try {
    const p = page(f);
    let refuseInspection = false;
    io.onAccept(() => { refuseInspection = true; throw Object.assign(new Error("private native detail"), { code: "WRITE_OUTCOME_UNKNOWN", committed: null }); });
    io.onSnapshot(() => {
      if (refuseInspection) throw new Error("private native detail");
      return { rootIdentity: { device: "1", inode: "2" }, directoryIdentity: null, target: null, manifest: null };
    });
    const lease = value(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
    assert.deepEqual(value(await accept(p, lease.token)), { status: "REINSPECTION_REQUIRED", committed: null, reason: "WRITE_OUTCOME_UNKNOWN" });
    assert.equal(code(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" })), "MANIFEST_REINSPECTION_REQUIRED");
    refuseInspection = false;
    assert.deepEqual(value(await p.request("reinspectProjectBriefAcceptance", { projectId: "p_harbor1" })),
      { status: "INSPECTED", committed: null, reason: "WRITE_OUTCOME_UNKNOWN" });
    assert.equal(io.writes.length, 1, "inspection is never a write retry");
    assert.equal(f.stored("p_harbor1").brief.accepted, false, "unknown certainty never marks accepted");
    // A known commit whose page lost authority meanwhile: reported as unknown, never as rolled back.
    io.onSnapshot(null);
    const gate = deferred();
    io.onAccept(async payload => {
      io.disk.set(payload.root, { manifest: clone(payload.manifest), digest: "b".repeat(64) });
      await gate.promise;
      return { path: `${payload.root}/.axiosozo/project.json`, digest: "b".repeat(64), committed: true };
    });
    const next = value(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
    const pending = accept(p, next.token);
    await settle();
    f.zen.window.gBrowser.selectedBrowser = { localName: "browser", other: true };
    gate.resolve();
    assert.equal(code(await pending), "WRITE_OUTCOME_UNKNOWN");
    assert.equal(f.stored("p_harbor1").brief.accepted, false);
    // Selected again, a fresh owner inspects the known write and reconciles it.
    f.zen.window.gBrowser.selectedBrowser = p.embedder;
    assert.deepEqual(value(await p.request("reinspectProjectBriefAcceptance", { projectId: "p_harbor1" })), { status: "ACCEPTED", committed: true, reason: null });
    assert.equal(f.stored("p_harbor1").brief.accepted, true);
    assert.equal(io.writes.length, 2);
  } finally { f.restore(); }
});

// ---------------------------------------------------------------- review: native route lifetime

test("route facts: only the native URI's exact project home admits an owner; unknown or other routes refuse with zero work", async () => {
  assert.equal(projectHomeRoute("about:axiosozo#project=p_harbor1"), "p_harbor1");
  assert.equal(projectHomeRoute("about:axiosozo?x=1#project%3Dp_harbor1"), "p_harbor1", "decoded like the page's own route");
  for (const spec of ["about:axiosozo", "about:axiosozo#projects", "about:axiosozo#project=p_harbor1=x", "about:axiosozo#project=p_harbor1%3Dx",
    "about:axiosozo#edit-project=p_harbor1", "about:axiosozo#project=P_HARBOR1", "about:axiosozo#project=%E0%A4%A", "about:axiosozoevil#project=p_harbor1",
    "https://x.test/#project=p_harbor1", null, undefined, 7]) assert.equal(projectHomeRoute(spec), null, String(spec));
  const quiet = console.error; console.error = () => {};
  try {
    for (const [label, setup] of [
      ["another project's home", p => p.route("p_inkline1")], ["the list", p => p.route(null)],
      ["no document URI", p => { p.actor.manager.documentURI = null; }], ["a URI without text", p => { p.actor.manager.documentURI = { spec: 5 }; }],
      ["a throwing URI", p => { Object.defineProperty(p.actor.manager, "documentURI", { get() { throw new Error("gone"); } }); }],
    ]) {
      const f = fixture();
      try {
        const p = page(f);
        setup(p);
        const reply = await p.read();
        assert.equal(reply.ok, false, label);
        assert.ok(["DOCUMENT_GONE", "SENDER_REJECTED"].includes(reply.error.code), `${label}: ${reply.error.code}`);
        assert.equal(f.services.getUnderstandDiagnostics().created, false, `${label}: no owner or facade`);
        assert.deepEqual([f.counts.reads, f.counts.opens, f.host.frames.length], [0, 0, 0], label);
      } finally { f.restore(); }
    }
  } finally { console.error = quiet; }
});

for (const [label, steps] of [["A → B", ["p_inkline1"]], ["A → list", [null]], ["A → list → A", [null, "p_harbor1"]]]) {
  test(`held host admission: a native ${label} route change with no page cleanup ends the owner; no run envelope or input crosses`, async () => {
    const f = fixture();
    try {
      f.host.gate = deferred();
      const p = page(f);
      const pending = p.read();
      await settle();
      assert.deepEqual([f.counts.spawns, f.host.frames.length, f.minted.length], [1, 0, 1], "held inside the host start");
      const current = f.minted[0];
      assert.equal(current(), true);
      // Only the WindowGlobal's documentURI changes: no TabSelect, location event, pagehide or cleanup RPC.
      for (const next of steps) p.route(next);
      assert.equal(current(), false, "the minted predicate refuses at once");
      f.host.gate.resolve();
      assert.equal(code(await pending), "OWNER_REVOKED");
      await settle();
      assert.equal(f.host.frames.length, 0, "no run envelope or stdin input crossed");
      assert.equal(f.stored("p_harbor1").brief, null);
      assert.equal(current(), false, "permanently, even where the route reads A again");
      if (steps.at(-1) === "p_harbor1") {
        // The A shown now is a new route lifetime: a fresh owner, not the old one revived.
        assert.equal(value(await p.read()).status, "ok");
        assert.equal(f.minted.length, 2);
        assert.equal(current(), false);
      }
    } finally { f.restore(); }
  });
}

test("control: an unchanged route keeps the owner through a held host admission and the read completes", async () => {
  const f = fixture();
  try {
    f.host.gate = deferred();
    const p = page(f);
    const pending = p.read();
    await settle();
    f.host.gate.resolve();
    assert.equal(value(await pending).status, "ok");
    assert.equal(f.minted[0](), true);
    assert.deepEqual(runs(f).map(frame => frame.params.project_root), [HARBOR]);
  } finally { f.restore(); }
});

test("a native top-level location change of this browser ends the lifetime at once; another browser's or a subframe's does not", async () => {
  const f = fixture();
  try {
    f.host.hold = true;
    const p = page(f);
    const pending = p.read();
    await settle();
    assert.equal(f.progressListeners.size, 1);
    f.locationChange({ localName: "browser", other: true });
    f.locationChange(p.embedder, { isTopLevel: false });
    assert.equal(f.minted[0](), true, "not this browser's top-level document");
    f.locationChange(p.embedder);
    assert.deepEqual([f.progressListeners.size, f.tabListeners.size], [0, 0], "ended and unwatched synchronously");
    assert.equal(code(await pending), "OWNER_REVOKED");
    assert.equal(f.host.frames.filter(frame => frame.method === "understand/cancel").length, 1, "the running read is cancelled now");
    assert.equal(f.stored("p_harbor1").brief, null);
  } finally { f.restore(); }
});

test("held manifest preview and acceptance: a native route change ends them; no lease is published and no write crosses", async () => {
  for (const held of ["preview", "accept"]) {
    const io = diskIO();
    const gate = deferred(), crossed = [];
    const f = fixture({ fixtureMode: false, manifestIO: io.io, projects: [record("p_harbor1", HARBOR, "Harbor", { brief: brief() })] });
    try {
      const p = page(f);
      if (held === "preview") {
        io.onSnapshot(async () => { await gate.promise; return { rootIdentity: { device: "1", inode: "2" }, directoryIdentity: null, target: null, manifest: null }; });
        const pending = p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" });
        await settle();
        p.route(null);
        gate.resolve();
        assert.equal(code(await pending), "OWNER_REVOKED");
        assert.equal(f.services.getUnderstandDiagnostics().facade?.leases ?? 0, 0, "no lease was published");
      } else {
        const lease = value(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
        // As the pinned helper does: the guard is asked again right before the write is sent.
        io.onAccept(async (payload, disk, { admit }) => {
          await gate.promise;
          if (admit() !== true) throw Object.assign(new Error("STALE_ACCEPTANCE"), { code: "STALE_ACCEPTANCE", committed: false });
          crossed.push(payload);
          return { path: `${payload.root}/.axiosozo/project.json`, digest: "b".repeat(64), committed: true };
        });
        const pending = accept(p, lease.token);
        await settle();
        p.route("p_inkline1");
        gate.resolve();
        assert.equal(code(await pending), "STALE_ACCEPTANCE", "a known non-write is told as refused, never as unknown or done");
        assert.equal(crossed.length, 0, "no write crossed the guard");
        assert.equal(f.stored("p_harbor1").brief.accepted, false);
      }
    } finally { f.restore(); }
  }
});

// ---------------------------------------------------------------- review: own-token consumption

for (const [label, attempt] of [
  ["another project with empty edits", token => ({ projectId: "p_inkline1", token, edits: {}, confirmed: true })],
  ["another project, not confirmed", token => ({ projectId: "p_inkline1", token, edits: { name: "X" }, confirmed: false })],
  ["a missing project id", token => ({ token, edits: { name: "X" }, confirmed: true })],
  ["an invalid project id", token => ({ projectId: "../p_x", token, edits: { name: "X" }, confirmed: true })],
  ["a non-string project id", token => ({ projectId: 7, token, edits: { name: "X" }, confirmed: true })],
  ["extra invalid fields", token => ({ projectId: "p_harbor1", token, edits: { name: "X", root: "/" }, confirmed: true, revision: 9 })],
  ["a well-formed request for another project", token => ({ projectId: "p_inkline1", token, edits: { name: "X" }, confirmed: true })],
]) {
  test(`own token, ${label}: the attempt spends it, so a valid replay is STALE_ACCEPTANCE with zero writes`, async () => {
    const io = diskIO();
    const f = fixture({ fixtureMode: false, manifestIO: io.io, projects: [record("p_harbor1", HARBOR, "Harbor", { brief: brief() }),
      record("p_inkline1", INKLINE, "Inkline", { brief: brief() })] });
    try {
      const p = page(f);
      const lease = value(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
      const minted = f.minted.length;
      assert.equal((await p.request("acceptProjectBrief", attempt(lease.token))).ok, false);
      assert.ok(f.minted.length === minted, "no new owner was made to refuse it");
      assert.equal(code(await accept(p, lease.token)), "STALE_ACCEPTANCE");
      assert.equal(io.writes.length, 0, "no native write");
      // A fresh review still works afterwards.
      const fresh = value(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
      assert.equal(value(await accept(p, fresh.token)).status, "ACCEPTED");
    } finally { f.restore(); }
  });
}

test("another owner's token stays protected, an unrecognizable token spends nothing, and the ordinary acceptance still works", async () => {
  const io = diskIO();
  const f = fixture({ fixtureMode: false, manifestIO: io.io, projects: [record("p_harbor1", HARBOR, "Harbor", { brief: brief() })] });
  try {
    const p = page(f);
    const lease = value(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
    // Another document (its own owner) tries this page's token, malformed and well-formed.
    const other = page(f, { window: f.openWindow().window });
    value(await other.request("getUnderstandState", { projectId: "p_harbor1" }));
    assert.equal(code(await other.request("acceptProjectBrief", { projectId: "p_inkline1", token: lease.token, edits: {}, confirmed: false })), "INVALID_PARAMS");
    assert.equal(code(await accept(other, lease.token)), "STALE_ACCEPTANCE");
    // This page's own malformed attempts without a recognizable token spend nothing.
    for (const token of ["short", 42, null]) {
      assert.equal(code(await p.request("acceptProjectBrief", { projectId: "p_harbor1", token, edits: { name: "X" }, confirmed: true })), "INVALID_PARAMS");
    }
    assert.deepEqual(value(await accept(p, lease.token)), { status: "ACCEPTED", committed: true, reason: null });
    assert.equal(io.writes.length, 1);
  } finally { f.restore(); }
});

// ---------------------------------------------------------------- review: withdrawal at mutation entry

for (const kind of ["refresh", "manifest"]) {
  test(`${kind} withdraws the project's Understand authority synchronously at entry, before its first lookup`, async () => {
    const io = diskIO();
    const f = fixture({ manifestIO: io.io, projects: [record("p_harbor1", HARBOR, "Harbor", { brief: brief() }), record("p_inkline1", INKLINE, "Inkline")] });
    try {
      const p = page(f);
      const lease = value(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
      f.host.hold = true;
      const pending = p.read();
      await settle();
      // The read's answer is ready: its continuation (validate, then commit) is queued but has not run.
      f.host.release();
      const before = f.services.getUnderstandDiagnostics();
      assert.deepEqual([before.facade.leases, before.snapshots], [1, 2]);
      const started = kind === "refresh" ? f.services.refreshProjectDetection("p_harbor1") : f.services.writeManifest("p_harbor1");
      const outcome = started.then(() => null, error => error.code);
      // Synchronously, with its first lookup not yet resolved: withdrawn and invalidated.
      const now = f.services.getUnderstandDiagnostics();
      assert.equal(now.pending, before.pending + 1, "counted pending");
      assert.equal(now.snapshots, 1, "the prior binding is withdrawn");
      assert.equal(now.facade.leases, 0, "the preview lease is revoked");
      // Neither the ready read nor the lease can publish against the old binding.
      const result = value(await pending);
      assert.deepEqual([result.status, result.reason, result.document], ["cancelled", "STALE_PROJECT", null]);
      assert.equal(code(await accept(p, lease.token)), "STALE_ACCEPTANCE");
      // Errors are kept (this fixture has no filesystem seam), and nothing was published.
      assert.equal(await outcome, "UNAVAILABLE");
      assert.equal(f.stored("p_harbor1").brief.document.product, "An earlier synthetic brief.");
      assert.deepEqual([io.writes.length, f.services.getUnderstandDiagnostics().pending], [0, 0]);
      // Settled: only a fresh snapshot is used.
      const fresh = value(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
      assert.equal(value(await accept(p, fresh.token)).status, "ACCEPTED");
    } finally { f.restore(); }
  });
}

test("an unknown project's refresh or manifest write keeps UNKNOWN_PROJECT and withdraws nothing of another project", async () => {
  const io = diskIO();
  const f = fixture({ fixtureMode: false, manifestIO: io.io, projects: [record("p_harbor1", HARBOR, "Harbor", { brief: brief() })] });
  try {
    const p = page(f);
    const lease = value(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" }));
    await assert.rejects(f.services.refreshProjectDetection("p_unknown1"), { code: "UNKNOWN_PROJECT" });
    await assert.rejects(f.services.writeManifest("p_unknown1"), { code: "UNKNOWN_PROJECT" });
    assert.equal(f.services.getUnderstandDiagnostics().pending, 0);
    assert.equal(value(await accept(p, lease.token)).status, "ACCEPTED", "Harbor's lease was never touched");
  } finally { f.restore(); }
});

test("without the manifest helper, or when it cannot be built, confirmation refuses and nothing writes", async () => {
  for (const variant of ["absent", "unbuildable"]) {
    const f = fixture({ fixtureMode: false, projects: [record("p_harbor1", HARBOR, "Harbor", { brief: brief() })],
      manifestIO: variant === "unbuildable" ? {} : null });
    try {
      const p = page(f);
      assert.equal(code(await p.request("previewProjectBriefAcceptance", { projectId: "p_harbor1" })), "WRITE_CONTAINMENT_UNAVAILABLE", variant);
      assert.equal(f.stored("p_harbor1").manifest_state, "none");
    } finally { f.restore(); }
  }
});
