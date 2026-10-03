/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Process-wide model for contexts, projects, site rules and the usage ledger
// (contexts-api-v1 §3.3). Pure logic comes from the contexts core; this module
// adds profile storage, static project detection through the checksum-pinned
// containment reader (ProjectDetection), port-to-folder arrival offers
// (ProjectArrival, ProjectRecords), on-request status checks of loopback
// services (TCP connect only; remote services are never contacted), the
// no-follow manifest write, project containers (ProjectContainers: one Gecko
// contextual identity per project, routed before any project tab exists), the
// process-wide Understand facade with its quiet snapshot cache and guarded
// brief commit (UnderstandService; product reads stay NOT_AUTHORIZED) and
// events. Every Zen call goes through ZenWorkspaceAdapter.
// All methods except on()/registerWindow() return promises of JSON data.

// Relative specifiers resolve to chrome://browser/content/axiosozo/… in the JAR;
// Node tests map ./contexts/ to packages/contexts/src (tests/support/chrome-modules.mjs).
import * as core from "./contexts/index.mjs";
import { JsonStore, profileStorage } from "./JsonStore.sys.mjs";
import { isContextEngine, toContextEngine } from "./EngineRegistry.sys.mjs";
import { createProjectDetection } from "./ProjectDetection.sys.mjs";
import { createProjectRecords } from "./ProjectRecords.sys.mjs";
import { createStoreMigrationValidator } from "./ProjectStoreMigration.sys.mjs";
import { createProjectArrival } from "./ProjectArrival.sys.mjs";
import { createNativeProjectReader, projectReaderPaths } from "./ProjectReaderConfig.sys.mjs";
import { createNativeProjectArrivalSubprocess } from "./ProjectArrivalSubprocess.sys.mjs";
import { createProjectContainers, createGeckoIdentityAdapter, MAX_PUBLIC_USER_CONTEXT_ID } from "./ProjectContainers.sys.mjs";
import { canonicalContainerColor, projectContainerPresentation, PROJECT_CONTAINER_ICON } from "./ProjectAccountRuntime.sys.mjs";
import { createAgentChannelService } from "./AgentChannelService.sys.mjs";
import { createGeckoAgentTransportRuntime } from "./AgentChannelTransport.sys.mjs";
import { createUnderstandService, createOfflineUnderstandService } from "./UnderstandService.sys.mjs";
import { createNativeManifestAcceptIO } from "./ProjectManifestAccept.sys.mjs";

export { MAX_LISTING_ENTRIES } from "./ProjectDetection.sys.mjs";
export const EVENT_NAMES = Object.freeze(["contexts", "projects", "rules", "ledger", "services", "attention", "agents", "understand", "console"]);
// Console retention changes reach pages and the sidebar as one name-only
// event at most this often (Plan 4 step 7); a burst ends with a trailing one.
export const CONSOLE_EVENT_MS = 250;
// The facade operations a page reaches through the actor (Plan 4 step 6). The
// alias and the strictly validated params are the only arguments.
const UNDERSTAND_OPERATIONS = Object.freeze(["state", "available", "read", "cancel", "preview", "accept", "reinspect"]);
// Read, state and availability need the project only off the production path;
// saved-brief confirmation always does (it works while production Read is closed).
const UNDERSTAND_PROJECT_OPERATIONS = new Set(["preview", "reinspect"]);
// Documented default only (contracts/agent-channel-v1.md §1): every process
// starts with the agent endpoint off, and a saved true never starts it.
export const AGENT_ENDPOINT_PREF = "axiosozo.agent.endpoint.enabled";
export const AGENT_HOOK_AGENTS = Object.freeze(["claude-code", "codex"]);
const AGENT_NAMES = Object.freeze({ "claude-code": "Claude Code", codex: "Codex", other: "An agent" });
const AGENT_SESSION = /^s_[0-9a-f]{16}$/u;
const AGENT_CHANNEL_EVENTS = new Set(["endpoint", "enablement", "activity", "cleanup", "capabilities"]);
export const STORE_FILES = Object.freeze({ contexts: "contexts.json", rules: "site-rules.json", ledger: "usage-ledger.json" });
export const PROBE_MIN_INTERVAL_MS = 5000;
export const PROBE_TIMEOUT_MS = 2000;
export const LEDGER_FLUSH_MS = 30000;
// Distinct (day, host, context) entries kept in memory while the ledger file
// cannot be written (for example an invalid file the user has to resolve).
export const MAX_PENDING_LEDGER = 4096;
// Folders the user keeps projects in besides home (privileged configuration;
// never a page or actor parameter). Arrival only looks below these and home.
export const DEFAULT_ARRIVAL_ROOTS = Object.freeze(["/Volumes/T9/Code"]);
// Never detected, listed or offered: settings, keys and browser profiles in
// home, and system folders. Checked on the given and the resolved path before
// any reader is created.
export const HOME_DENIED_FOLDERS = Object.freeze(["Library", ".mozilla", ".thunderbird", ".config", ".cache",
  ".ssh", ".aws", ".gnupg", ".azure", ".kube", ".codex", ".claude"]);
export const SYSTEM_DENIED_ROOTS = Object.freeze(["/System", "/Library", "/dev", "/etc", "/private/etc", "/usr", "/bin", "/sbin", "/cores"]);
const DAY_MS = 86400000;
const CONTEXT_TYPES = ["personal", "organization", "project"];
// Only services on this machine are ever contacted, and only by a TCP connect to
// a loopback address on the declared port. URL.hostname keeps IPv6 brackets.
const LOOPBACK_ADDRESSES = Object.freeze({ "localhost": ["127.0.0.1", "::1"], "127.0.0.1": ["127.0.0.1"], "[::1]": ["::1"] });
const LEDGER_HOST = /^[a-z0-9.-]{1,253}$/u;
const WORKSPACE_UUID = /^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}?$/u;
const MAX_DENIED_ROOTS = 32;
// Gecko's switch for contextual identities. Turning it off closes container
// tabs, clears their data and restarts identity numbering without one
// deletion notification per identity.
export const CONTAINERS_PREF = "privacy.userContext.enabled";
// The pinned engine packages ContextualIdentityService as a moz-src module
// (toolkit/components/contextualidentity/moz.build: MOZ_SRC_FILES); there is
// no resource://gre/modules/ copy. Same URL as BrowserExperience.sys.mjs and
// the engine's own tabbrowser/content/tab-hover-preview.mjs.
export const CONTEXTUAL_IDENTITY_MODULE = "moz-src:///toolkit/components/contextualidentity/ContextualIdentityService.sys.mjs";

export class ServicesError extends Error {
  constructor(code, message) { super(message ?? code); this.name = "ServicesError"; this.code = code; }
}

const clone = value => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
const deepFreeze = value => {
  if (value && typeof value === "object") { for (const child of Object.values(value)) deepFreeze(child); Object.freeze(value); }
  return value;
};
const fail = code => { throw new ServicesError(code); };

function defaultLocalTime(now) {
  const date = new Date(now);
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(),
    minutes: date.getHours() * 60 + date.getMinutes(), weekday: date.getDay() };
}

function defaultRandomId(prefix) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("");
}

/** 16 lowercase hex characters from the platform CSPRNG (agent session and status ids). */
function defaultRandomHex() {
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

const unavailableNative = () => { throw new ServicesError("NATIVE_CONFIGURATION_UNAVAILABLE"); };

/** Privileged diagnostics keep booleans, non-negative counts and nesting only:
 * never paths, sessions, argv, output, handles or tokens. */
function countsOnly(value, depth = 0) {
  if (value === null || typeof value === "boolean") return value;
  if (Number.isSafeInteger(value) && value >= 0) return value;
  if (depth >= 6 || !value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (!/^[a-z][a-z0-9_]{0,63}$/u.test(key)) continue;
    const kept = countsOnly(child, depth + 1);
    if (kept !== undefined) out[key] = kept;
  }
  return Object.freeze(out);
}

/** A project name for chrome text: one line, at most 80 characters. */
function displayName(project) {
  const name = typeof project?.manifest?.name === "string" ? project.manifest.name.replace(/[\u0000-\u001f\u007f-\u009f]+/gu, " ").trim() : "";
  return name ? [...name].slice(0, 80).join("") : "This project";
}

/** Opaque arrival token: a browser crypto UUID without braces (36 characters),
 * never derived from paths, URLs or page data. */
export function browserToken() {
  const uuid = typeof globalThis.crypto?.randomUUID === "function" ? globalThis.crypto.randomUUID()
    : Services.uuid.generateUUID().toString();
  return uuid.replace(/[{}]/gu, "");
}

function metadataRecord(uuid, now) {
  return { version: 1, workspace_uuid: uuid, type: "personal", organization_uuid: null,
    project_id: null, engine_preference: null, updated_at: now };
}

const within = (path, base) => path === base || path.startsWith(`${base}/`);
const normalAbsolute = path => typeof path === "string" && path.startsWith("/") && path.length > 1 && path.length <= 4096
  && !/[\u0000-\u001f\u007f]/u.test(path) && !path.endsWith("/") && path.slice(1).split("/").every(part => part && part !== "." && part !== "..");

/**
 * Extra arrival roots from the environment. Normally DEFAULT_ARRIVAL_ROOTS.
 * Development only: with AXIOSOZO_SYNTHETIC_TEST=1, AXIOSOZO_ARRIVAL_ROOTS (a
 * JSON array) replaces them, and every entry must be an absolute path below
 * <build root>/gui-fixtures/ of the configured workstation build root
 * (AXIOSOZO_STATIC_READER_ROOT or AXIOSOZO_BUILD_ROOT, validated like the
 * project reader's). Anything else yields no extra roots (fails closed).
 */
export function arrivalRootsFromEnvironment(env) {
  const read = name => { try { const value = env(name); return typeof value === "string" ? value : ""; } catch { return ""; } };
  const raw = read("AXIOSOZO_ARRIVAL_ROOTS");
  if (read("AXIOSOZO_SYNTHETIC_TEST") !== "1" || !raw) return [...DEFAULT_ARRIVAL_ROOTS];
  let base;
  try {
    const buildRoot = read("AXIOSOZO_STATIC_READER_ROOT") || read("AXIOSOZO_BUILD_ROOT");
    projectReaderPaths(buildRoot);
    base = `${buildRoot}/gui-fixtures/`;
  } catch { return []; }
  let list;
  try { list = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(list) || !list.length || list.length > 8) return [];
  const valid = list.every(path => normalAbsolute(path) && path.length <= 1024 && path.startsWith(base) && path.length > base.length);
  return valid ? [...new Set(list)] : [];
}

/**
 * The arrival runtime handed to ProjectArrival: `{ call(options) }` with the
 * Subprocess.call shape, backed by an adapter that `create()` builds only when
 * the first call arrives (an actual discovery), never at startup. Concurrent
 * first calls share one construction; a successful adapter is reused. A failed
 * construction rejects that call with ARRIVAL_SUBPROCESS_UNAVAILABLE and is
 * forgotten, so a later discovery tries again. Only the adapter's own call is
 * used, with ProjectArrival's options passed through unchanged; the adapter
 * accepts nothing but its fixed operations. ProjectArrival keeps owning the
 * returned child (draining, killing, reaping).
 */
export function lazyArrivalSubprocess(create) {
  const unavailable = () => Object.assign(new Error("ARRIVAL_SUBPROCESS_UNAVAILABLE"), { code: "ARRIVAL_SUBPROCESS_UNAVAILABLE" });
  let pending = null;
  const adapter = () => {
    if (pending) return pending;
    const attempt = Promise.resolve().then(create).then(value => {
      if (typeof value?.call !== "function") throw unavailable();
      return value;
    }, () => { throw unavailable(); });
    pending = attempt;
    attempt.catch(() => { if (pending === attempt) pending = null; });
    return attempt;
  };
  return Object.freeze({ call: async options => (await adapter()).call(options) });
}

export class AxioSozoServices {
  #deps; #stores; #listeners = new Map(); #windows = new Map();
  #serviceStatus = new Map(); #lastProbe = new Map(); #probing = new Map(); #pendingLedger = new Map(); #effectiveLedger = null;
  #flushTimer = null; #prunedDay = null;
  // Store v3 persistence: set when the file on disk was a valid v1/v2 store or
  // held v1 project records; cleared only after the migrated document was written.
  #contextsNeedPersistence = false; #persistingContexts = null;
  #records; #arrival;
  // Arrival acceptances between token consumption and the store append.
  #acceptances = new Set();
  // Project containers: one controller per process (assignment is serialized),
  // the identity API it was built with, whether the dependency was configured
  // at all, the reset in flight or failed (routing stays blocked until a retry
  // succeeds), deletions whose mapping cleanup failed, and a generation that
  // every deletion or reset observation bumps so an opening in progress stops.
  #containers = null; #identities = null; #containersConfigured = false;
  #containerReset = null; #containerResetFailed = false; #failedDeletions = new Set(); #containerGeneration = 0;
  // Each reset or deletion cleanup is one tracked attempt; only the latest
  // attempt for its key may set or clear that key's failure latch.
  #cleanupSerial = 0; #resetAttempt = null; #deletionAttempts = new Map();
  // Routing marks: a monotonic value per project (and one for every project)
  // that changes synchronously when a store mutation that can change a
  // project's route starts and again when it settles, failed or not, plus the
  // mutations still in flight. Service memory only; never stored or sent.
  #routingSequence = 0; #routingAll = 0; #routingMarks = new Map(); #routingPending = new Map(); #routingPendingAll = 0;
  // Agent channel (P3): one process-wide AgentChannelService, created on first
  // use. Its project cache is only ever filled by #loadAgentProjects at global
  // quiescence. Presenters are registered per normal window.
  #agentChannel = null; #agentChannelClosed = false; #agentPresenters = new Map();
  // The one process owner of the P4 browser tools (AgentBridgeRuntime), chrome only.
  #agentBridge = null;
  // Understand (Plan 4 step 6): one facade per process, created when the first
  // native owner registers; its private owner aliases per registered window.
  #understand = null; #understandClosed = false; #understandOffline = false;
  #understandWindows = new Map(); #understandAliases = new Map();
  #manifestAcceptIO = null;
  // Its authoritative project snapshots: id → { binding: { id, revision,
  // canonicalRoot }, record }, filled only from the settled store at global
  // quiescence. Revisions are this service's own monotonic counter, never a
  // timestamp. An external mutation deletes the entries it can change before it
  // starts (its id or every id), counts itself pending and moves the change
  // marks a facade-owned commit compares inside its serialized write. Ids ever
  // published stay known so an every-project change reaches all of them.
  #snapshots = new Map(); #snapshotRevision = 0; #snapshotsKnown = new Set();
  #understandPending = new Map(); #understandPendingAll = 0;
  #understandChanges = new Map(); #understandChangesAll = 0; #understandSequence = 0;
  // Facade-owned commits in flight per project (their own reserved writes).
  #understandWrites = new Map(); #lastUnderstandClock = 0;
  // Native project authority for console collection (Plan 4 step 7), chrome
  // only: one global epoch that moves synchronously on every invalidation and
  // on every settled publication, the published snapshot ({ revision,
  // hydration, projects, snapshot }) or null, a hydration generation that
  // voids a read in flight, and the chrome listeners. Independent of the
  // Understand cache, its per-project binding revisions and of AgentChannel.
  #nativeEpoch = 0; #nativePublished = null; #nativeHydration = 0; #nativeExhausted = false; #nativeListeners = new Set();
  // Profile shutdown ended native authority for good: nothing is published,
  // read, captured or registered again in this process.
  #nativeShutdown = false;
  // The one process console owner (ConsoleErrorsNativeRuntime) and its
  // throttled name-only console event.
  #nativeOwner = null; #nativeOwnerUnregister = null; #consoleTimer = null; #consolePending = false;

  /** Chrome singleton; created lazily on first use. */
  static get() {
    instance ??= new AxioSozoServices(chromeDependencies());
    return instance;
  }

  /**
   * deps (all optional except in chrome, where get() supplies them):
   * storageFor(fileName) → { read, write }; fs (see chromeFileSystem);
   * probe({ address, port, timeoutMs }) → "up"|"down"|"unknown" (loopback TCP connect only);
   * clock() → ms; localTime(ms) → { year, month, day, minutes, weekday }; randomId(prefix);
   * timers { setTimeout, clearTimeout }; pickFolder(window) → path|null;
   * onShutdown(fn); mostRecentWindow() → window.
   * Detection: reader (an injected containment reader, tests) or createReader()
   * → the checksum-pinned native reader, called only for an admitted detection.
   * Arrival: arrivalRuntime ({ call } with the Gecko Subprocess.call shape; in
   * chrome the lazily built ProjectArrivalSubprocess adapter, see
   * lazyArrivalSubprocess),
   * home, profileDir, arrivalRoots, newToken() (browser UUID, see browserToken).
   * Containers: containerIdentities (an identity API { get, create, update },
   * or a function building it, see createGeckoIdentityAdapter; absent = not
   * configured, project links open in the space's own container as before),
   * containersEnabled() → boolean (the privacy.userContext.enabled pref) and
   * observeContainers({ identityDeleted(id), containersDisabled() }) →
   * unobserve.
   * Agent channel: randomHex() → 16 hex (CSPRNG); agentNative
   * { createNativeConfiguration(), createTransportRuntime({ exactPosixBackend }),
   * buildHookConfig({ agent, socketPath }), buildBridgeConfig({ agent,
   * socketPath }) } (absent = never available);
   * createAgentChannel(deps) (tests only; default createAgentChannelService);
   * resetAgentEndpointPref() (clears a saved true; nothing reads it to start).
   * Understand: rootMetadata(path) → { canonical, directory } | null, synchronous
   * metadata only (chrome: nsIFile); understandFixture { openRuntime({ signal }) }
   * only when the native environment explicitly requests the synthetic fixture
   * (absent: the always-closed production facade); createManifestAcceptIO() →
   * the pinned manifest helper's { snapshot, accept }, built on first explicit use.
   */
  constructor(deps = {}) {
    this.#deps = { clock: Date.now, localTime: defaultLocalTime, randomId: defaultRandomId, randomHex: defaultRandomHex,
      timers: globalThis, newToken: browserToken, ...deps };
    const storageFor = this.#deps.storageFor ?? (name => profileStorage(name));
    const migration = createStoreMigrationValidator({ core });
    this.#records = createProjectRecords({ core, clock: () => this.#deps.clock(), newToken: () => this.#deps.newToken() });
    this.#stores = {
      // contexts.json v1/v2 (or v3 holding v1 project records) is read through
      // the pure migration; the next load writes the v3 document back atomically.
      // An invalid file throws before anything is flagged and is never written.
      contexts: new JsonStore({ storage: storageFor(STORE_FILES.contexts),
        validate: value => {
          const { document, needsPersistence } = migration.validateOriginalVersion(value);
          if (needsPersistence) this.#contextsNeedPersistence = true;
          return document;
        }, empty: core.DEFAULT_CONTEXT_STORE }),
      rules: new JsonStore({ storage: storageFor(STORE_FILES.rules),
        validate: core.validateRuleStore, empty: core.DEFAULT_RULE_STORE }),
      ledger: new JsonStore({ storage: storageFor(STORE_FILES.ledger),
        validate: core.validateLedger, empty: core.DEFAULT_LEDGER }),
    };
    try { this.#deps.onShutdown?.(() => this.flushLedger()); }
    catch (error) { console.error("AxioSozo: ledger shutdown flush not registered", error); }
    this.#setUpContainers();
  }

  // ── events ────────────────────────────────────────────────────────────
  on(name, callback) {
    if (!EVENT_NAMES.includes(name) || typeof callback !== "function") fail("INVALID_EVENT");
    if (!this.#listeners.has(name)) this.#listeners.set(name, new Set());
    this.#listeners.get(name).add(callback);
    return () => this.#listeners.get(name)?.delete(callback);
  }

  #emit(...names) {
    for (const name of names) {
      for (const callback of [...(this.#listeners.get(name) ?? [])]) {
        try { callback({ name }); } catch (error) { console.error("AxioSozo services listener failed", error); }
      }
    }
  }

  // ── windows ───────────────────────────────────────────────────────────
  /** Called once per browser window by AxioSozoStartup; returns unregister(). */
  registerWindow(window, adapter) {
    // A plain switch changes no context data; runtime modules watch the adapter for that.
    const unsubscribe = adapter.onChange(change => {
      if (change.kind === "switched") return;
      this.#emit("contexts");
      if (change.kind === "deleted") this.#emit("attention");
    });
    this.#windows.set(window, adapter);
    // A restored about:axiosozo tab can load before the first window registers;
    // without this it would keep showing an empty workspace list.
    this.#emit("contexts");
    // A window that is ready is a real signal to publish native authority again.
    this.#settleNative();
    return () => {
      // The console owner forgets this window while it is still known as normal.
      try { this.#nativeOwner?.detachWindow(window); } catch (error) { console.error("AxioSozo: console window not detached", error); }
      unsubscribe();
      // Its Understand owners end at once: their reads and leases only, never
      // the shared facade or another window's work.
      this.#releaseUnderstandWindow(window);
      // Its agent presenter goes first: outstanding prompts are cancelled.
      this.#agentPresenters.get(window)?.();
      if (this.#windows.get(window) === adapter) this.#windows.delete(window);
      // Arrival offers and acceptances are bound to this window; they never outlive it.
      this.#revokeAcceptances(window);
      this.#records.discardWindow(window);
    };
  }

  #authoritativeAdapters() {
    return [...this.#windows.values()].filter(adapter => {
      try { return adapter.isAuthoritative?.() ?? !adapter.isPrivateWindow(); } catch { return false; }
    });
  }

  /** Map uuid → workspace from every synced window. Empty when no window can tell. */
  #liveWorkspaces() {
    const live = new Map();
    for (const adapter of this.#authoritativeAdapters()) {
      for (const space of adapter.listWorkspaces()) if (!live.has(space.uuid)) live.set(space.uuid, { ...space, adapter });
    }
    return live;
  }

  #requireLive(uuid) {
    if (typeof uuid !== "string" || !WORKSPACE_UUID.test(uuid)) fail("INVALID_CONTEXT");
    const space = this.#liveWorkspaces().get(uuid);
    if (!space) fail("UNKNOWN_CONTEXT");
    return space;
  }

  #adapterFor(window) {
    if (window && this.#windows.has(window)) return this.#windows.get(window);
    const recent = this.#deps.mostRecentWindow?.();
    if (recent && this.#windows.has(recent)) return this.#windows.get(recent);
    return this.#authoritativeAdapters()[0] ?? null;
  }

  // ── contexts ──────────────────────────────────────────────────────────
  /** The validated v3 contexts document. A v1/v2 file, or a v3 file with v1
   * project records, is migrated on read and written back as v3 once (atomic
   * JsonStore write of a copy; an identical document would be skipped). A
   * failed write keeps the flag, is retried on the next load and never loses
   * the old file. Persistence alone emits no event. */
  async #loadContexts() {
    const doc = await this.#stores.contexts.load();
    if (!this.#contextsNeedPersistence) return doc;
    if (!this.#persistingContexts) {
      // A direct migration write is an every-project change for Understand: no
      // snapshot is captured until it settled, and a failed one keeps the flag.
      // Native console authority is withdrawn with it.
      this.#beginUnderstandChange(null);
      this.#invalidateNative();
      this.#persistingContexts = this.#stores.contexts.update(current => ({ ...current }))
        .then(written => { this.#contextsNeedPersistence = false; return written; })
        .finally(() => { this.#persistingContexts = null; this.#endUnderstandChange(null); this.#settleNative(); });
    }
    try { return await this.#persistingContexts; }
    catch (error) { console.error("AxioSozo: contexts.json v3 write failed", error); return doc; }
  }

  #contextView(space, meta, projects = []) {
    const adapter = space.adapter;
    // Projects live in a space through projects[].context_uuid (store v2); any
    // space type may hold several. project_id is the first, kept for callers
    // that predate v2.
    const projectIds = projects.filter(project => project.context_uuid === space.uuid).map(project => project.id);
    return {
      uuid: space.uuid, name: space.name, icon: space.icon,
      type: meta?.type ?? "personal",
      organization_uuid: meta?.organization_uuid ?? null,
      project_id: projectIds[0] ?? null,
      project_ids: projectIds,
      engine_preference: meta?.engine_preference ? toContextEngine(meta.engine_preference) : null,
      // Identity: the Zen workspace's default container (userContextId, 0 = none).
      container: space.containerTabId,
      container_label: adapter?.containerLabel?.(space.containerTabId) ?? null,
    };
  }

  async listContexts() {
    const doc = await this.#loadContexts();
    const byUuid = new Map(doc.contexts.map(meta => [meta.workspace_uuid, meta]));
    return [...this.#liveWorkspaces().values()].map(space => this.#contextView(space, byUuid.get(space.uuid), doc.projects));
  }

  async getContext(uuid) {
    const space = this.#liveWorkspaces().get(uuid);
    if (!space) return null;
    const doc = await this.#loadContexts();
    return this.#contextView(space, doc.contexts.find(meta => meta.workspace_uuid === uuid), doc.projects);
  }

  /** The space shown in the requesting (or most recent) window, or null. */
  async activeContext({ window } = {}) {
    const adapter = this.#adapterFor(window);
    let uuid = null;
    try { uuid = adapter && !adapter.isPrivateWindow() ? adapter.activeWorkspaceUuid() : null; } catch { uuid = null; }
    return { uuid: uuid && this.#liveWorkspaces().has(uuid) ? uuid : null };
  }

  #upsertMeta(doc, uuid, patch) {
    const now = this.#deps.clock();
    const existing = doc.contexts.find(meta => meta.workspace_uuid === uuid);
    const next = { ...(existing ?? metadataRecord(uuid, now)), ...patch, updated_at: now };
    const contexts = existing
      ? doc.contexts.map(meta => (meta.workspace_uuid === uuid ? next : meta))
      : [...doc.contexts, next];
    return { ...doc, contexts };
  }

  async #updateContexts(mutator, events = ["contexts"]) {
    await this.#loadContexts();
    const result = await this.#stores.contexts.update(mutator);
    this.#emit(...events);
    return result;
  }

  async setContextType(uuid, type) {
    this.#requireLive(uuid);
    if (!CONTEXT_TYPES.includes(type)) fail("INVALID_CONTEXT_TYPE");
    await this.#updateContexts(doc => {
      const current = doc.contexts.find(meta => meta.workspace_uuid === uuid);
      if ((current?.type ?? "personal") === type) return doc;
      const patch = { type };
      let next = doc;
      // The type is a label: projects stay in this space whatever its type. Only
      // project spaces belong to an organization (context-v1).
      if (type !== "project") patch.organization_uuid = null;
      if (current?.type === "organization") {
        next = { ...next, contexts: next.contexts.map(meta => (meta.organization_uuid === uuid
          ? { ...meta, organization_uuid: null, updated_at: this.#deps.clock() } : meta)) };
      }
      return this.#upsertMeta(next, uuid, patch);
    }, ["contexts", "projects"]);
    return this.getContext(uuid);
  }

  async linkOrganization(uuid, orgUuid) {
    this.#requireLive(uuid);
    if (orgUuid !== null) {
      this.#requireLive(orgUuid);
      if (orgUuid === uuid) fail("INVALID_ORGANIZATION");
    }
    await this.#updateContexts(doc => {
      const meta = doc.contexts.find(item => item.workspace_uuid === uuid);
      if (meta?.type !== "project") fail("CONTEXT_NOT_PROJECT");
      if (orgUuid !== null && doc.contexts.find(item => item.workspace_uuid === orgUuid)?.type !== "organization")
        fail("NOT_AN_ORGANIZATION");
      return this.#upsertMeta(doc, uuid, { organization_uuid: orgUuid });
    });
    return this.getContext(uuid);
  }

  /** Store v2: a project lives in the space named by its context_uuid (or none).
   * Other projects of that space stay; the deprecated contexts[].project_id
   * mirror is always cleared. */
  #placeProject(doc, projectId, uuid) {
    const now = this.#deps.clock();
    return {
      ...doc,
      projects: doc.projects.map(project => (project.id === projectId && project.context_uuid !== uuid
        ? { ...project, context_uuid: uuid, updated_at: now } : project)),
      contexts: doc.contexts.map(meta => (meta.project_id !== null ? { ...meta, project_id: null, updated_at: now } : meta)),
    };
  }

  /** Puts a project in any space (personal, organization or project); several
   * projects may share a space. projectId null takes every project out of it. */
  async linkProject(uuid, projectId) {
    this.#requireLive(uuid);
    await this.#routingMutation(projectId === null ? null : [projectId], () => this.#updateContexts(doc => {
      if (projectId === null) {
        let next = doc;
        for (const project of doc.projects) if (project.context_uuid === uuid) next = this.#placeProject(next, project.id, null);
        return next;
      }
      if (!doc.projects.some(project => project.id === projectId)) fail("UNKNOWN_PROJECT");
      return this.#placeProject(doc, projectId, uuid);
    }, ["contexts", "projects"]));
    return this.getContext(uuid);
  }

  async setEnginePreference(uuid, engine) {
    this.#requireLive(uuid);
    if (engine !== null && !isContextEngine(engine)) fail("INVALID_ENGINE");
    // Stored as the contract's `gecko`; the deprecated `firefox` is accepted and normalized.
    await this.#updateContexts(doc => this.#upsertMeta(doc, uuid, { engine_preference: engine === null ? null : toContextEngine(engine) }));
    return this.getContext(uuid);
  }

  /** Metadata whose workspace no longer exists in any synced window. Offered for
   * cleanup only; never applied. Empty while no synced window is registered. */
  async listOrphans() {
    if (!this.#authoritativeAdapters().length) return [];
    const live = this.#liveWorkspaces();
    const doc = await this.#loadContexts();
    return clone(doc.contexts.filter(meta => !live.has(meta.workspace_uuid)));
  }

  async removeOrphans(uuids) {
    if (!Array.isArray(uuids) || !this.#authoritativeAdapters().length) fail("INVALID_ORPHANS");
    const live = this.#liveWorkspaces();
    const doomed = new Set(uuids.filter(uuid => typeof uuid === "string" && !live.has(uuid)));
    let removed = 0;
    await this.#routingMutation(null, () => this.#updateContexts(doc => {
      const now = this.#deps.clock();
      const contexts = doc.contexts.filter(meta => !doomed.has(meta.workspace_uuid));
      removed = doc.contexts.length - contexts.length;
      if (!removed) return doc;
      return {
        ...doc,
        contexts: contexts.map(meta => (doomed.has(meta.organization_uuid)
          ? { ...meta, organization_uuid: null, updated_at: now } : meta)),
        projects: doc.projects.map(project => (doomed.has(project.context_uuid)
          ? { ...project, context_uuid: null, updated_at: now } : project)),
      };
    }, ["contexts", "projects"]));
    return { removed };
  }

  // ── projects ──────────────────────────────────────────────────────────
  async listProjects() {
    return clone((await this.#loadContexts()).projects);
  }

  async getProject(id) {
    const project = (await this.#loadContexts()).projects.find(item => item.id === id);
    return project ? clone(project) : null;
  }

  /** Native folder picker (nsIFilePicker folder mode). */
  async pickFolder(window) {
    if (!this.#deps.pickFolder) fail("UNAVAILABLE");
    const path = await this.#deps.pickFolder(window);
    return typeof path === "string" && path.startsWith("/") ? path : null;
  }

  #fs() {
    return this.#deps.fs ?? fail("UNAVAILABLE");
  }

  /** Static, read-only detection (contexts-api-v1 §2.1–§2.2, workstation-v1 §1):
   * root files, workspace packages, inventory (names and presence only) and
   * documented domains, all through ProjectDetection and the containment
   * reader. No plain path read or listing exists; without a reader nothing is
   * read (READ_CONTAINMENT_UNAVAILABLE). Never executes. The complete result
   * is remembered privately; the caller gets the validated draft only. The
   * Overview actor admits only roots chosen with the native folder picker. */
  async detect(root) {
    const result = await this.#detectSecurely(root);
    return clone(this.#records.rememberDetection(result));
  }

  #deniedRoots() {
    const home = normalAbsolute(this.#deps.home) ? this.#deps.home : null;
    const profile = normalAbsolute(this.#deps.profileDir) ? this.#deps.profileDir : null;
    return [...SYSTEM_DENIED_ROOTS, ...(home ? HOME_DENIED_FOLDERS.map(name => `${home}/${name}`) : []),
      ...(profile ? [profile] : [])].slice(0, MAX_DENIED_ROOTS);
  }

  /** Settings, key and profile folders are refused by name and by resolved
   * path before any reader exists; their contents are never inspected. */
  async #refuseDeniedRoot(fs, root) {
    const denied = this.#deniedRoots();
    if (denied.some(base => within(root, base))) fail("ROOT_DENIED");
    let real = null;
    try { real = await fs.realpath(root); } catch { return; } // the detector reports a missing root
    if (typeof real === "string" && denied.some(base => within(real, base))) fail("ROOT_DENIED");
  }

  async #containmentReader() {
    if (this.#deps.reader) return this.#deps.reader;
    if (typeof this.#deps.createReader !== "function") fail("READ_CONTAINMENT_UNAVAILABLE");
    try { return await this.#deps.createReader(); } catch { fail("READ_CONTAINMENT_UNAVAILABLE"); }
  }

  /** One admitted detection of `root`: deny list, then the reader, then the
   * four phases. Returns the detector's complete (privileged) result.
   * The folder can change while the reader is being set up, so the detector
   * asks again (allowCanonicalRoot) for the canonical target it actually
   * resolved, before any metadata, listing or content request and once more
   * before its result: denied folders are refused (ROOT_DENIED), and
   * `expectedCanonicalRoot` (a consumed arrival offer, a registered project)
   * or `checkCanonicalRoot` (a still-cached preview) refuse any other target
   * with ROOT_CHANGED. Synchronous and service-owned; never page input. */
  async #detectSecurely(root, { expectedCanonicalRoot = null, checkCanonicalRoot = null } = {}) {
    if (typeof root !== "string" || !root.startsWith("/") || root.includes("\0")) fail("INVALID_ROOT");
    const fs = this.#fs();
    await this.#refuseDeniedRoot(fs, root);
    const reader = await this.#containmentReader();
    const allowCanonicalRoot = canonical => {
      if (this.#deniedRoots().some(base => within(canonical, base))) return false;
      if (expectedCanonicalRoot !== null && canonical !== expectedCanonicalRoot) fail("ROOT_CHANGED");
      checkCanonicalRoot?.(canonical);
      return true;
    };
    return createProjectDetection({ fs, reader, core, clock: () => this.#deps.clock(), allowCanonicalRoot }).detect(root);
  }

  /** Adds a folder chosen with the native picker. The selected root is
   * detected again right before the record is made, so a folder replaced at
   * the same path since the preview is read afresh, and a root that now
   * resolves to another folder than the preview did is refused (ROOT_CHANGED).
   * The record is version 2 with the detected snapshot (profile only);
   * nothing is written to the folder. */
  async confirmProject({ root, manifest, contextUuid = null } = {}) {
    if (typeof root !== "string" || !root.startsWith("/")) fail("INVALID_ROOT");
    const validManifest = core.validateManifest(manifest);
    core.assertNoSecrets(validManifest);
    if (contextUuid !== null) this.#requireLive(contextUuid);
    // A preview still cached for this root names the folder the user reviewed;
    // a different resolved target is refused before it is opened.
    const result = await this.#detectSecurely(root, { checkCanonicalRoot: canonical => this.#records.detectionFor(root, canonical) });
    this.#records.detectionFor(root, result.canonicalRoot);
    this.#records.rememberDetection(result);
    return this.#addProject({ root, canonicalRoot: result.canonicalRoot, manifest: validManifest, contextUuid });
  }

  /** The one path that appends a project (folder picker and arrival). The
   * record comes from ProjectRecords (version 2, canonical root, detected
   * snapshot only from a matching fresh detection). `guard` (arrival) runs
   * inside the serialized store mutation, after every earlier queued write,
   * and throws when the acceptance no longer holds. Duplicates are checked
   * there too; events follow the atomic write. */
  async #addProject({ root, canonicalRoot, manifest, contextUuid, guard = null }) {
    const id = this.#deps.randomId("p_");
    const record = this.#records.createRecord({ id, root, canonicalRoot, manifest, contextUuid: null });
    await this.#routingMutation([id], () => this.#updateContexts(doc => {
      guard?.();
      if (doc.projects.some(item => item.root === record.root || item.root === root)) fail("PROJECT_EXISTS");
      if (doc.projects.some(item => item.id === id)) fail("DUPLICATE_PROJECT_ID");
      // Any space may hold the project; its type (a label) is left as it is.
      const next = { ...doc, projects: [...doc.projects, record] };
      return contextUuid !== null ? this.#placeProject(next, id, contextUuid) : next;
    }, ["projects", "contexts"]));
    // Its own container exists (and is saved) before any of its links opens.
    await this.#ensureContainer(id);
    return this.getProject(id);
  }

  /** Reads a registered project's folder again (its stored root, never a
   * parameter). Only `detected` and `updated_at` change; manifest, space,
   * container, accounts, shared sites, brief and trust stay as they are. */
  async refreshProjectDetection(id) {
    // Understand authority over this project ends synchronously at entry:
    // before the record is even looked up, the folder read again or the final
    // write made (an unknown id withdraws nothing that exists).
    await this.#understandScope([id], async () => {
      const project = (await this.#loadContexts()).projects.find(item => item.id === id);
      if (!project) fail("UNKNOWN_PROJECT");
      // The registered root is canonical; a folder that now resolves elsewhere is not opened.
      const result = await this.#detectSecurely(project.root, { expectedCanonicalRoot: project.root });
      this.#records.rememberDetection(result);
      await this.#routingMutation([id], () => this.#updateContexts(doc => {
        const current = doc.projects.find(item => item.id === id);
        if (!current) fail("UNKNOWN_PROJECT");
        const next = this.#records.refreshedRecord(current, { root: project.root, canonicalRoot: result.canonicalRoot });
        return { ...doc, projects: doc.projects.map(item => (item.id === id ? next : item)) };
      }, ["projects"]));
    });
    return this.getProject(id);
  }

  /** Writes <root>/.axiosozo/project.json atomically without following links a
   * repository may have planted (writeManifestFile). Callers invoke this only
   * after the user explicitly confirmed the write in the Overview. */
  async writeManifest(projectId) {
    // The disk write comes before the profile write; Understand authority over
    // this project (a brief acceptance included) ends synchronously at entry,
    // before the record lookup and either write.
    return this.#understandScope([projectId], async () => {
      const project = await this.getProject(projectId);
      if (!project) fail("UNKNOWN_PROJECT");
      const manifest = core.validateManifest(project.manifest);
      core.assertNoSecrets(manifest);
      const path = await writeManifestFile(this.#fs(), project.root, core.MANIFEST_PATH, core.serializeManifest(manifest),
        this.#deps.randomId("tmp_"));
      await this.#routingMutation([projectId], () => this.#updateContexts(doc => ({ ...doc, projects: doc.projects.map(item => (item.id === projectId
        ? { ...item, manifest_state: "written", updated_at: this.#deps.clock() } : item)) }), ["projects"]));
      return { path };
    });
  }

  async updateProject(id, patch = {}) {
    const allowed = ["manifest", "context_uuid"];
    if (!patch || typeof patch !== "object" || Object.keys(patch).some(key => !allowed.includes(key)))
      fail("INVALID_PROJECT_PATCH");
    let manifest;
    if ("manifest" in patch) { manifest = core.validateManifest(patch.manifest); core.assertNoSecrets(manifest); }
    if ("context_uuid" in patch && patch.context_uuid !== null) this.#requireLive(patch.context_uuid);
    let renamed = false;
    await this.#routingMutation([id], () => this.#updateContexts(doc => {
      const existing = doc.projects.find(item => item.id === id);
      if (!existing) fail("UNKNOWN_PROJECT");
      renamed = !!manifest && existing.manifest.name !== manifest.name;
      let next = doc;
      if (manifest) {
        next = { ...next, projects: next.projects.map(item => (item.id === id
          ? { ...item, manifest: clone(manifest), updated_at: this.#deps.clock() } : item)) };
      }
      if ("context_uuid" in patch && patch.context_uuid !== existing.context_uuid) {
        next = this.#placeProject(next, id, patch.context_uuid);
      }
      return next;
    }, ["projects", "contexts"]));
    this.#serviceStatus.delete(id);
    if (renamed) await this.#renameContainer(id);
    return this.getProject(id);
  }

  /** Forgets the project. Its container, open tabs and their sign-ins stay as
   * they are (removing a container clears its data; that would be a separate,
   * explicit choice). Only the container controller's retry hint is dropped. */
  async removeProject(id) {
    await this.#routingMutation([id], () => this.#updateContexts(doc => {
      if (!doc.projects.some(item => item.id === id)) fail("UNKNOWN_PROJECT");
      const now = this.#deps.clock();
      return { ...doc, projects: doc.projects.filter(item => item.id !== id),
        contexts: doc.contexts.map(meta => (meta.project_id === id ? { ...meta, project_id: null, updated_at: now } : meta)) };
    }, ["projects", "contexts", "attention"]));
    this.#serviceStatus.delete(id);
    if (this.#containers && core.isProjectId(id)) await this.#containers.forget(id).catch(() => {});
    return { removed: true };
  }

  // ── accounts per project (P2; manual profile metadata only) ───────────
  /** The account the user signs in with for one service or site of a project:
   * `key` is an integration id (vercel, convex, …) or a host pattern, `label`
   * the text the user typed (1–80 characters) or null to remove it. Nothing is
   * read from pages, cookies or the Keychain; every other field of the record
   * is kept (ProjectRecords.withAccountLabel, inside the serialized write). */
  async setAccountLabel(projectId, { key, label } = {}) {
    await this.#routingMutation([projectId], () => this.#updateContexts(doc => {
      const current = doc.projects.find(item => item.id === projectId);
      if (!current) fail("UNKNOWN_PROJECT");
      const next = this.#records.withAccountLabel(current, { key, label });
      return { ...doc, projects: doc.projects.map(item => (item.id === projectId ? next : item)) };
    }, ["projects"]));
    return this.getProject(projectId);
  }

  /** Sites that use the space's own container instead of the project's, e.g.
   * GitHub with one account everywhere. Suggestions share nothing until the
   * user confirms them (`confirmed: true`); only hosts and confirmation change. */
  async setSharedSites(projectId, { hosts, confirmed } = {}) {
    await this.#routingMutation([projectId], () => this.#updateContexts(doc => {
      const current = doc.projects.find(item => item.id === projectId);
      if (!current) fail("UNKNOWN_PROJECT");
      const next = this.#records.withSharedSites(current, { hosts, confirmed });
      return { ...doc, projects: doc.projects.map(item => (item.id === projectId ? next : item)) };
    }, ["projects"]));
    return this.getProject(projectId);
  }

  // ── routing marks (P2) ────────────────────────────────────────────────
  #markRouting(projectIds, delta) {
    const mark = ++this.#routingSequence;
    if (projectIds === null) { this.#routingAll = mark; this.#routingPendingAll += delta; return; }
    for (const id of projectIds) {
      this.#routingMarks.set(id, mark);
      const pending = (this.#routingPending.get(id) ?? 0) + delta;
      if (pending > 0) this.#routingPending.set(id, pending); else this.#routingPending.delete(id);
    }
  }

  /** Runs a profile-store mutation that can change how `projectIds` (null:
   * every project) route: space, sharing, account labels, container mapping,
   * existence or stored record. Their mark changes synchronously when it starts
   * and again when it settles, so an opening of those projects in flight stops.
   *
   * Agent channel authority (agent-channel-v1 §7): the pending mark is visible
   * first, then an existing channel's project cache is invalidated, both before
   * `run` reaches its first await. Only the scope that settles at global
   * quiescence (no pending mark anywhere, no container cleanup in flight or
   * failed) refreshes it; a nested or earlier scope never does. The refresh is
   * isolated: its failure or a closed channel never replaces this mutation's
   * own result or error, and the cache stays unavailable instead.
   *
   * Understand authority (Plan 4 step 6) ends the same way, before the first
   * await: the projects' snapshots are withdrawn and their facade jobs and
   * acceptance leases invalidated. `understand: false` is only for the facade's
   * own guarded commit, which checks its captured authority inside the write
   * instead (invalidating it first would cancel every save).
   *
   * Native console authority (Plan 4 step 7) is withdrawn for every mutation,
   * the facade's own commit included (it never touches the facade), with the
   * pending marks already visible and before the first await; it is published
   * again only by the scope that settles at global quiescence. */
  async #routingMutation(projectIds, run, { understand = true } = {}) {
    this.#markRouting(projectIds, 1);
    if (understand) this.#beginUnderstandChange(projectIds);
    this.#invalidateNative();
    this.#invalidateAgentProjects();
    try { return await run(); } finally {
      this.#markRouting(projectIds, -1);
      if (understand) this.#endUnderstandChange(projectIds);
      this.#settleAgentProjects();
      this.#settleNative();
    }
  }

  /** No project or container write is pending, in flight or failed. */
  #agentAuthorityQuiet() {
    return this.#routingPendingAll === 0 && this.#routingPending.size === 0 && this.#resetAttempt === null
      && this.#deletionAttempts.size === 0 && !this.#containerResetFailed && this.#failedDeletions.size === 0;
  }

  #invalidateAgentProjects() {
    try { this.#agentChannel?.invalidateProjects(); } catch (error) { console.error("AxioSozo: agent project cache not invalidated", error); }
  }

  #settleAgentProjects() {
    if (!this.#agentChannel || !this.#agentAuthorityQuiet()) return;
    try { Promise.resolve(this.#agentChannel.refreshProjects()).catch(() => {}); } catch { /* cache stays unavailable */ }
  }

  /** The channel's only project loader. Refuses at once (PROJECT_CACHE_BUSY)
   * unless every project and container write has settled; after the validated
   * read it refuses again if anything is pending or the global routing
   * sequence or container generation moved during the read, so a write that
   * started and settled inside it is never published as authority. No await
   * follows the final check. Container cleanups keep their own raw reads. */
  async #loadAgentProjects() {
    const sequence = this.#routingSequence, generation = this.#containerGeneration;
    if (!this.#agentAuthorityQuiet()) fail("PROJECT_CACHE_BUSY");
    const { projects } = await this.#loadContexts();
    if (!this.#agentAuthorityQuiet() || sequence !== this.#routingSequence || generation !== this.#containerGeneration)
      fail("PROJECT_CACHE_BUSY");
    return projects;
  }

  /** The project's current routing mark; null while a mutation of it is in flight. */
  #routingMark(projectId) {
    if (this.#routingPendingAll > 0 || this.#routingPending.has(projectId)) return null;
    return `${this.#routingAll}:${this.#routingMarks.get(projectId) ?? 0}`;
  }

  // ── project containers (P2) ───────────────────────────────────────────
  #setUpContainers() {
    const { containerIdentities } = this.#deps;
    if (containerIdentities === undefined) return;
    this.#containersConfigured = true;
    try {
      const identities = typeof containerIdentities === "function" ? containerIdentities() : containerIdentities;
      this.#containers = createProjectContainers({ core, identities,
        // Browser-owned model callbacks: always read the store again.
        getProject: id => this.getProject(id),
        listProjects: async () => (await this.#loadContexts()).projects,
        assignContainer: (id, userContextId, assignment) => this.#assignContainer(id, userContextId, assignment),
        presentationForProject: project => projectContainerPresentation(core, project),
        enabled: () => this.#containersEnabled() });
      this.#identities = identities;
    } catch (error) {
      console.error("AxioSozo: project containers unavailable", error);
      this.#containers = null;
      return;
    }
    try {
      this.#deps.observeContainers?.({ identityDeleted: id => this.#identityDeleted(id), containersDisabled: () => { this.#resetContainers(); } });
    } catch (error) { console.error("AxioSozo: container observers not registered", error); }
    // Turned off while the browser was closed: Gecko has already reset its
    // identities, so stored mappings may name reused IDs.
    if (!this.#containersEnabled()) this.#resetContainers();
  }

  #containersEnabled() {
    try { return this.#deps.containersEnabled?.() === true; } catch { return false; }
  }

  /** Compare-and-set of a project's container inside the serialized store
   * write; null when the project is gone or its mapping changed meanwhile.
   * The preliminary load is inside the tracked scope, so the mark is set from
   * the moment the assignment starts. */
  async #assignContainer(projectId, userContextId, assignment) {
    let assigned = null;
    await this.#routingMutation([projectId], async () => {
      await this.#loadContexts();
      return this.#stores.contexts.update(doc => {
        assigned = null;
        const current = doc.projects.find(item => item.id === projectId);
        if (!current) return doc;
        const next = this.#records.withBrowserAssignedContainer(current, userContextId, assignment);
        if (!next) return doc;
        assigned = next;
        return { ...doc, projects: doc.projects.map(item => (item.id === projectId ? next : item)) };
      });
    });
    if (!assigned) return null;
    this.#emit("projects");
    return clone(assigned);
  }

  /** One complete container cleanup (a reset, or one deleted identity's
   * mappings) as an all-project tracked scope: the container generation moves
   * and the agent cache is invalidated before the controller is called, and
   * the scope lasts through the controller's nested assignments and final
   * verification, which therefore never refresh. The latch for `key` changes
   * inside the scope, so it is set before the scope's settle step looks at it,
   * and only for the latest attempt: an older attempt settling later changes
   * nothing, and only a current success clears a failure. */
  #containerCleanup(key, start) {
    this.#containerGeneration++;
    const token = ++this.#cleanupSerial;
    const reset = key === "reset";
    if (reset) this.#resetAttempt = token; else this.#deletionAttempts.set(key, token);
    const current = () => (reset ? this.#resetAttempt : this.#deletionAttempts.get(key)) === token;
    return this.#routingMutation(null, async () => {
      try {
        const result = await start();
        if (current()) { if (reset) this.#containerResetFailed = false; else this.#failedDeletions.delete(key); }
        return result;
      } catch (error) {
        if (current()) { if (reset) this.#containerResetFailed = true; else this.#failedDeletions.add(key); }
        throw error;
      } finally {
        if (current()) { if (reset) this.#resetAttempt = null; else this.#deletionAttempts.delete(key); }
      }
    });
  }

  /** Observer: Firefox deleted a container. In-flight routes stop at once; the
   * projects that named it lose the mapping (never the project or its data).
   * An ID the controller would refuse changes nothing, as before. */
  #identityDeleted(userContextId) {
    if (!this.#containers) return;
    if (!Number.isInteger(userContextId) || userContextId < 1 || userContextId > MAX_PUBLIC_USER_CONTEXT_ID) return;
    this.#containerCleanup(userContextId, () => this.#containers.identityDeleted(userContextId)).catch(error => {
      console.error("AxioSozo: deleted container still mapped; project links wait for a retry", error?.code ?? error);
    });
  }

  /** Observer and startup: containers were turned off. Every route stops at
   * once and every mapping is cleared; a failed cleanup blocks routing until a
   * retry succeeds (#containersReady). */
  #resetContainers() {
    if (!this.#containers) return Promise.resolve(0);
    const run = this.#containerCleanup("reset", () => this.#containers.identitiesReset());
    this.#containerReset = run;
    run.then(() => {
      if (this.#containerReset === run) this.#containerReset = null;
      this.#emit("projects"); // views re-read availability once the cleanup is saved
    }, error => {
      if (this.#containerReset === run) this.#containerReset = null;
      console.error("AxioSozo: container reset not saved; project links wait for a retry", error?.code ?? error);
    });
    return run;
  }

  /** Waits for a reset in flight and retries failed cleanups first, each as
   * its own tracked attempt; rejects while they still fail, so nothing is
   * routed against stale mappings. */
  async #containersReady() {
    if (this.#containerReset) await this.#containerReset.catch(() => {});
    if (this.#containerResetFailed) await this.#resetContainers();
    for (const id of [...this.#failedDeletions]) {
      await this.#containerCleanup(id, () => this.#containers.identityDeleted(id));
    }
  }

  async #ensureContainer(projectId) {
    if (!this.#containers || !this.#containersEnabled()) return;
    try {
      await this.#containersReady();
      await this.#containers.ensure(projectId, { isPrivate: false });
    } catch (error) { console.error("AxioSozo: project container not created yet", error?.code ?? error); }
  }

  /** A renamed project renames its own container; only an identity the browser
   * already assigned to it is touched, and only its name and style. */
  async #renameContainer(projectId) {
    if (!this.#containers || !this.#containersEnabled()) return;
    try {
      const project = await this.getProject(projectId);
      const id = project ? core.upgradeProject(project).container.user_context_id : null;
      if (id === null || !(await this.#identities.get(id))) return;
      await this.#containersReady();
      await this.#containers.refreshPresentation(projectId, { isPrivate: false });
      this.#emit("projects");
    } catch (error) { console.error("AxioSozo: project container not renamed", error?.code ?? error); }
  }

  #containerAvailability() {
    if (!this.#containersConfigured || (this.#containers && !this.#containersEnabled())) return "off";
    if (!this.#containers || this.#containerReset || this.#containerResetFailed) return "unavailable";
    return "on";
  }

  /** Per project, what its own container looks like, for the Overview:
   * { project_id, state: "own", name, color } (the actual Firefox container),
   * "pending" (made when one of its links first opens), "off" or
   * "unavailable". Read only: nothing is created here, and no ID is returned. */
  async listProjectContainers() {
    const { projects } = await this.#loadContexts();
    const availability = this.#containerAvailability();
    const out = [];
    for (const stored of projects) {
      const project = core.upgradeProject(stored);
      out.push({ project_id: project.id, ...(await this.#containerPresentation(project, projects, availability)) });
    }
    return out;
  }

  /** { state, name?, color? } of one (upgraded) project's own container; never its ID. */
  async #containerPresentation(project, projects, availability) {
    if (availability !== "on") return { state: availability };
    const id = project.container.user_context_id;
    const shared = id !== null && projects.some(other => other.id !== project.id && other.container?.user_context_id === id);
    let identity = null;
    if (id !== null && !shared) { try { identity = await this.#identities.get(id); } catch { identity = null; } }
    return identity?.userContextId === id
      ? { state: "own", name: typeof identity.name === "string" ? identity.name : "", color: canonicalContainerColor(identity.color) }
      : { state: "pending" };
  }

  /**
   * The project home (about:axiosozo#project=<id>), for a registered normal
   * window only: private or unknown-privacy windows get PRIVATE_WINDOW, an
   * unknown or removed id UNKNOWN_PROJECT. The record is the current stored
   * one (upgraded to version 2) without its container mapping; the container
   * is presented as listProjectContainers does, never by ID. Nothing is
   * probed, detected or created here. `agent_activity` is the agent channel's
   * RAM history for this project and its current root, { records, reporting,
   * sessions }, or null while that cache is unavailable; `console_errors` is
   * the console owner's RAM { count, recent } for this project's tabs in this
   * window (Plan 4 step 7), or null while it is unavailable.
   *
   * The answer is current when it is returned: the project's routing mark,
   * the container deletion/reset generation and availability are taken before
   * the first read; after the awaited container lookup the store is read
   * again, and the record must still exist (else UNKNOWN_PROJECT) and be
   * unchanged with the same mark, generation and availability (else
   * PROJECT_CHANGED). A mutation of the project still in flight refuses at
   * once. A removed or superseded record is never returned.
   */
  async projectHome({ window, id } = {}) {
    if (!core.isProjectId(id)) fail("UNKNOWN_PROJECT");
    const adapter = window ? this.#windows.get(window) ?? null : null;
    if (!adapter) fail("NO_WINDOW");
    if (!this.#normalWindow(window, adapter)) fail("PRIVATE_WINDOW");
    const mark = this.#routingMark(id);
    if (mark === null) fail("PROJECT_CHANGED");
    const generation = this.#containerGeneration;
    const availability = this.#containerAvailability();
    const first = await this.#loadContexts();
    const stored = first.projects.find(item => item.id === id);
    if (!stored) fail("UNKNOWN_PROJECT");
    const project = core.upgradeProject(stored);
    const container = await this.#containerPresentation(project, first.projects, availability);
    const { projects } = await this.#loadContexts();
    const current = projects.find(item => item.id === id);
    if (!current) fail("UNKNOWN_PROJECT");
    // Everything that can call back into listeners is read first: an expiring
    // activity record emits synchronously, and a listener may start a project
    // write right there. The final checks follow these reads, with nothing
    // between them and the return.
    const space = project.context_uuid ? this.#liveWorkspaces().get(project.context_uuid) : null;
    const agentActivity = this.#agentActivity(id, current.root);
    const consoleErrors = this.#consoleErrors(window, id);
    if (this.#routingMark(id) !== mark || this.#containerGeneration !== generation || this.#containerAvailability() !== availability
      || JSON.stringify(current) !== JSON.stringify(stored)) fail("PROJECT_CHANGED");
    // The window may have closed or been unregistered meanwhile.
    if (!this.#normalWindow(window, adapter)) fail("NO_WINDOW");
    const { container: _mapping, ...record } = clone(project);
    return { version: 1, project: record, space: space ? { uuid: space.uuid, name: space.name } : null, container,
      agent_activity: agentActivity, console_errors: consoleErrors };
  }

  /** The console owner's RAM count and five newest messages of this
   * project's eligible tabs in this window, { count, recent: [{ level, text }] },
   * or null while unavailable (no owner, native authority unsettled, the
   * window not normal). Text only; nothing of it is stored. */
  #consoleErrors(window, id) {
    const owner = this.#nativeOwner;
    if (!owner) return null;
    try {
      const value = owner.service.readProject({ window, project_id: id });
      if (!value || !Number.isSafeInteger(value.count) || value.count < 0 || !Array.isArray(value.recent)) return null;
      return { count: value.count, recent: value.recent.slice(0, 5).filter(item => typeof item?.text === "string")
        .map(item => ({ level: item.level === "warning" ? "warning" : "error", text: item.text })) };
    } catch { return null; }
  }

  /** The channel's validated history of one project: null unless its cache is
   * ready and still names this project with this root, both before and after
   * the activity and session reads (an expiry callback inside them can start a
   * write to any project, which revokes the whole cache even when this
   * project's own routing mark is untouched). Only the matching group's
   * records, never a hook payload; bridge sessions by agent and state only. */
  #agentActivity(id, root) {
    const channel = this.#agentChannel;
    if (!channel) return null;
    try {
      const authority = () => {
        const cache = channel.getProjectCacheState();
        return cache.state === "ready" && channel.getProjects().some(project => project.id === id && project.root === root)
          ? cache.generation : null;
      };
      const before = authority();
      if (before === null) return null;
      const group = channel.listActivity(id).find(item => item.project_id === id && item.project_path === root) ?? null;
      const sessions = channel.listSessions(id).filter(view => view.project_id === id && AGENT_SESSION.test(view.session)
        && (view.state === "approved" || view.state === "pending"))
        .map(view => ({ session: view.session, agent: Object.hasOwn(AGENT_NAMES, view.client?.agent) ? view.client.agent : "other",
          state: view.state }));
      const reporting = channel.getEndpointState().state === "listening";
      if (authority() !== before) return null;
      return { records: group ? clone(group.history) : [], reporting, sessions };
    } catch { return null; }
  }

  /** The space a project link opens in: the caller's (live) space, else the
   * project's own live space, else the window's active one. */
  #linkSpace(adapter, project, contextUuid) {
    if (contextUuid !== null) return contextUuid;
    const live = this.#liveWorkspaces();
    if (project.context_uuid && live.has(project.context_uuid)) return project.context_uuid;
    let active = null;
    try { active = adapter.activeWorkspaceUuid(); } catch { active = null; }
    return active && live.has(active) ? active : null;
  }

  #normalWindow(window, adapter) {
    try { return this.#windows.get(window) === adapter && adapter.isPrivateWindow() === false; } catch { return false; }
  }

  /**
   * Opens a project link (project home, card, environment pill, project block
   * or a known matching URL) in a new tab of `window`, after its route is
   * resolved: the project's own container, or the space's default container
   * for a confirmed shared site. Its identity is created and saved first if
   * needed. The project's routing mark is then taken and its record read and
   * routed again (sharing, host and mapping); synchronously right before the
   * tab exists, the mark, the deletion/reset generation, the window, its
   * privacy, the space and its default container must all be unchanged. Any
   * change refuses the stale route (PROJECT_CHANGED) before a tab exists; it is
   * never opened in another container instead. A private (or unknown-privacy)
   * window opens a plain tab without any project container; with containers
   * turned off the link opens in the space's own container as before.
   * Returns { opened: true, container: "project" | "shared_site", selected }
   * (selected: Firefox brought the new tab to the front), or { opened: true,
   * container: "off" | "private" }.
   */
  async openProjectUrl({ window, projectId, url, contextUuid = null } = {}) {
    const parsed = typeof url === "string" && url.length <= 65536 ? URL.parse(url) : null;
    if (!parsed || !["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) fail("INVALID_URL");
    if (!core.isProjectId(projectId)) fail("UNKNOWN_PROJECT");
    const adapter = window ? this.#windows.get(window) ?? null : null;
    if (!adapter) fail("NO_WINDOW");
    if (contextUuid !== null) this.#requireLive(contextUuid);
    const project = await this.getProject(projectId);
    if (!project) fail("UNKNOWN_PROJECT");
    if (!this.#normalWindow(window, adapter)) {
      await adapter.openTab(parsed.href, { workspaceUuid: null });
      return { opened: true, container: "private" };
    }
    const space = this.#linkSpace(adapter, project, contextUuid);
    const sameSpace = () => space === null || this.#liveWorkspaces().has(space);
    if (!this.#containersConfigured || (this.#containers && !this.#containersEnabled())) {
      await adapter.openTab(parsed.href, { workspaceUuid: space });
      return { opened: true, container: "off" };
    }
    if (!this.#containers) fail("CONTAINERS_UNAVAILABLE");
    const defaultUserContextId = space ? adapter.containerForWorkspace(space) : 0;
    await this.#containersReady();
    const generation = this.#containerGeneration;
    let route;
    try { route = await this.#containers.route(projectId, parsed.href, { isPrivate: false, defaultUserContextId }); }
    catch (error) {
      if (error?.code !== "CONTAINERS_DISABLED") throw error;
      await adapter.openTab(parsed.href, { workspaceUuid: space });
      return { opened: true, container: "off" };
    }
    // Every later change of this project's route, mapping or existence moves
    // its mark, so the mark is taken before the record is read again.
    const mark = this.#routingMark(projectId);
    if (mark === null) fail("PROJECT_CHANGED");
    const current = await this.getProject(projectId);
    if (!current) fail("PROJECT_CHANGED");
    const again = core.routeForUrl({ project: core.upgradeProject(current), url: route.url, defaultUserContextId });
    if (again.reason !== route.reason || again.userContextId !== route.userContextId) fail("PROJECT_CHANGED");
    const verify = () => {
      if (this.#routingMark(projectId) !== mark || this.#containerGeneration !== generation || !this.#normalWindow(window, adapter)
        || !sameSpace() || (space ? adapter.containerForWorkspace(space) : 0) !== defaultUserContextId) fail("PROJECT_CHANGED");
    };
    verify();
    const { selected } = await adapter.openTab(route.url, { workspaceUuid: space, userContextId: route.userContextId, verify });
    return { opened: true, container: route.reason, selected };
  }

  // ── arrival (P1; privileged chrome callers only, never the Overview actor) ──
  /** What the browser itself says about a tab: a registered normal window,
   * the tab's own browser id and its current top-level URL. The window object
   * is the offer's private window key. Unknown privacy fails closed. */
  #arrivalBinding(window, tab) {
    const adapter = this.#windows.get(window);
    let normal = false;
    try { normal = !!adapter && adapter.isPrivateWindow() === false; } catch { normal = false; }
    const browser = tab?.linkedBrowser;
    let normalBrowser = false;
    try { normalBrowser = browser?.browsingContext?.usePrivateBrowsing === false; } catch { normalBrowser = false; }
    if (!normal || !normalBrowser || tab.documentGlobal !== window || tab.closing || tab.isConnected === false) fail("ARRIVAL_UNAVAILABLE");
    const tabId = browser.browserId;
    const url = browser.currentURI?.spec;
    if (!Number.isSafeInteger(tabId) || tabId < 1 || typeof url !== "string") fail("ARRIVAL_UNAVAILABLE");
    return { tabId, url, windowKey: window, isPrivate: false };
  }

  #arrivalDiscovery() {
    if (this.#arrival !== undefined) return this.#arrival;
    const { arrivalRuntime, fs } = this.#deps;
    const home = normalAbsolute(this.#deps.home) ? this.#deps.home : null;
    const roots = Array.isArray(this.#deps.arrivalRoots) ? this.#deps.arrivalRoots.filter(normalAbsolute) : [];
    this.#arrival = typeof arrivalRuntime?.call === "function" && fs && (home || roots.length)
      ? createProjectArrival({ runtime: arrivalRuntime, fs, core, home, roots, deniedRoots: this.#deniedRoots(),
        getProjects: async () => (await this.#loadContexts()).projects, clock: () => this.#deps.clock(), timers: this.#deps.timers })
      : null;
    return this.#arrival;
  }

  #displayPath(path) {
    const home = normalAbsolute(this.#deps.home) ? this.#deps.home : null;
    return home && path !== home && within(path, home) ? `~${path.slice(home.length)}` : path;
  }

  #arrivalSpace(window, tab) {
    const adapter = this.#windows.get(window);
    let uuid = null;
    try { uuid = adapter?.workspaceForTab(tab) ?? adapter?.activeWorkspaceUuid() ?? null; } catch { uuid = null; }
    return uuid && this.#liveWorkspaces().has(uuid) ? uuid : null;
  }

  /**
   * Arrival for the current top-level URL of `tab` in `window` (called by
   * ProjectArrivalRuntime). Returns null; { kind: "known", project_id } for a
   * registered project (a known repository or hosting URL needs no process);
   * or { kind: "new", token, name, root, displayRoot, expiresAt } for a folder
   * served by one of the user's own loopback processes. The token is opaque,
   * one-use, two minutes, bound to this window, tab and exact URL; the root is
   * for the native notification only. Never for private windows.
   */
  async offerArrival({ window, tab, signal } = {}) {
    let binding;
    try { binding = this.#arrivalBinding(window, tab); } catch { return null; }
    const arrival = this.#arrivalDiscovery();
    if (!arrival || signal?.aborted) return null;
    let offer = null;
    try { offer = await arrival.discover(binding.url, { isPrivate: false, signal }); } catch { offer = null; }
    if (!offer || signal?.aborted) return null;
    if (offer.kind === "known") return typeof offer.project_id === "string" ? { kind: "known", project_id: offer.project_id } : null;
    if (offer.kind !== "new" || !normalAbsolute(offer.root) || this.#deniedRoots().some(base => within(offer.root, base))) return null;
    try {
      // Bound to what the tab shows now; a tab that moved on gets nothing.
      const current = this.#arrivalBinding(window, tab);
      if (current.url !== binding.url || current.tabId !== binding.tabId) return null;
      const issued = this.#records.issueArrival({ root: offer.root, canonicalRoot: offer.root, ...current });
      return { kind: "new", token: issued.token, name: offer.name, root: issued.root,
        displayRoot: this.#displayPath(issued.root), expiresAt: issued.expiresAt };
    } catch { return null; }
  }

  /** Marks in-flight acceptances of `window` (or of one of its tabs) revoked.
   * Synchronous, so a discard can never lose a race with an acceptance. */
  #revokeAcceptances(window, tab = null) {
    const tabId = tab?.linkedBrowser?.browserId;
    for (const acceptance of this.#acceptances) {
      if (acceptance.window !== window) continue;
      if (tab && acceptance.tab !== tab && acceptance.tabId !== tabId) continue;
      acceptance.revoked = true;
    }
  }

  /** An acceptance may only finish for the page it was made on: not revoked,
   * the window still registered and normal, the same tab and browser id and
   * the exact same URL, privacy known to be off. */
  #assertAcceptance(acceptance) {
    if (acceptance.revoked) fail("STALE_ARRIVAL");
    const binding = this.#arrivalBinding(acceptance.window, acceptance.tab);
    if (binding.tabId !== acceptance.tabId || binding.url !== acceptance.url) fail("STALE_ARRIVAL");
  }

  /**
   * "Keep as project" on the arrival notification of `tab` (the originating
   * tab, whichever tab is selected now). The token is checked against that
   * tab's current URL, window and privacy and the folder's canonical path,
   * then consumed before detection, so it works once. From then on an
   * in-flight acceptance stands for it: navigation, dismissal, tab close and
   * window disposal (discardArrival, unregister) revoke it, and it is checked
   * again after the fresh detection and inside the serialized store mutation
   * right before the record is appended. The folder is detected again through
   * the containment reader and added through the same path as a picked
   * folder, in the tab's space. No repository file is written.
   */
  async acceptArrival({ window, tab, token } = {}) {
    const offer = this.#records.inspectArrival(token, this.#arrivalBinding(window, tab));
    const fs = this.#fs();
    let canonical;
    try { canonical = await fs.realpath(offer.root); } catch { fail("ROOT_CHANGED"); }
    if ((await fs.stat(canonical))?.type !== "directory") fail("ROOT_NOT_DIRECTORY");
    const binding = this.#arrivalBinding(window, tab);
    const claimed = this.#records.consumeArrival(token, { ...binding, canonicalRoot: canonical });
    const acceptance = { window, tab, tabId: binding.tabId, url: binding.url, revoked: false };
    this.#acceptances.add(acceptance);
    try {
      const contextUuid = this.#arrivalSpace(window, tab);
      // Only the canonical folder the spent token was checked against may be opened.
      const result = await this.#detectSecurely(claimed.root, { expectedCanonicalRoot: claimed.canonicalRoot });
      this.#assertAcceptance(acceptance);
      this.#records.rememberDetection(result);
      return await this.#addProject({ root: claimed.root, canonicalRoot: result.canonicalRoot,
        manifest: core.draftToManifest(result.draft), contextUuid, guard: () => this.#assertAcceptance(acceptance) });
    } finally {
      this.#acceptances.delete(acceptance);
    }
  }

  /** Invalidates the arrival offers and in-flight acceptances of one tab
   * (navigation, dismissal, close) or, without a tab, of the whole window.
   * Synchronous; returns nothing. */
  discardArrival({ window, tab } = {}) {
    if (!window) return;
    this.#revokeAcceptances(window, tab ?? null);
    if (!tab) { this.#records.discardWindow(window); return; }
    const tabId = tab.linkedBrowser?.browserId;
    if (Number.isSafeInteger(tabId)) this.#records.discardTab(window, tabId);
  }

  /** Tab ↔ project linking (§2.5): the project and environment whose declared
   * base URL contains url (loopback aliases count as one host). A project in
   * contextUuid wins, then an exact host, then the longest path prefix. */
  async projectForUrl(url, contextUuid) {
    if (typeof url !== "string") return null;
    const { projects } = await this.#loadContexts();
    const match = core.matchProjectForUrl(projects, url, { contextUuid: contextUuid ?? undefined });
    const project = match && projects.find(item => item.id === match.project_id);
    if (!project) return null;
    return { project: clone(project), environment: clone(match.environment), app: match.app, ambiguous: match.ambiguous };
  }

  // ── service status (declared loopback ports only, on request) ─────────
  /** Services whose URL host is localhost, 127.0.0.1 or [::1] get one TCP
   * connect to 127.0.0.1 / ::1 on the declared port (rate-limited). Every other
   * service is "unknown" without any network access: no remote probe, no DNS. */
  async serviceStatus(projectId) {
    const project = await this.getProject(projectId);
    if (!project) fail("UNKNOWN_PROJECT");
    const cache = this.#serviceStatus.get(projectId) ?? new Map();
    this.#serviceStatus.set(projectId, cache);
    const now = this.#deps.clock();
    let changed = false;
    const results = await Promise.all(project.manifest.services.map(async service => {
      const key = `${service.url}|${service.port}`;
      const previous = cache.get(key);
      if (!loopbackAddresses(service.url)) {
        const entry = { name: service.name, url: service.url, port: service.port, status: "unknown", checked_at: null };
        if (previous && previous.status !== "unknown") changed = true;
        cache.set(key, entry);
        return entry;
      }
      if (previous && now - (this.#lastProbe.get(key) ?? 0) < PROBE_MIN_INTERVAL_MS) return previous;
      this.#lastProbe.set(key, now);
      // Concurrent requests share one connection attempt.
      let pending = this.#probing.get(key);
      if (!pending) {
        pending = this.#probe(service).finally(() => this.#probing.delete(key));
        this.#probing.set(key, pending);
      }
      const status = await pending;
      const entry = { name: service.name, url: service.url, port: service.port, status, checked_at: this.#deps.clock() };
      if (previous?.status !== status) changed = true;
      cache.set(key, entry);
      return entry;
    }));
    if (changed) this.#emit("services", "attention");
    return clone(results);
  }

  async #probe(service) {
    const addresses = loopbackAddresses(service.url);
    const port = service.port;
    if (!addresses || !this.#deps.probe || !Number.isInteger(port) || port < 1 || port > 65535) return "unknown";
    let result = "down";
    for (const address of addresses) {
      let status;
      try { status = await this.#deps.probe({ address, port, timeoutMs: PROBE_TIMEOUT_MS }); } catch { status = "unknown"; }
      if (status === "up") return "up";
      if (status !== "down") result = "unknown";
    }
    return result;
  }

  // ── rules ─────────────────────────────────────────────────────────────
  async listRules() {
    return clone((await this.#stores.rules.load()).rules);
  }

  /** Creates (no id) or replaces (known id) a rule. Missing fields take the
   * core defaults (newRule); timestamps are set here. */
  async saveRule(rule) {
    if (!rule || typeof rule !== "object") fail("INVALID_RULE");
    let saved;
    await this.#stores.rules.update(doc => {
      const now = this.#deps.clock();
      const existing = rule.id ? doc.rules.find(item => item.id === rule.id) : null;
      if (rule.id && !existing) fail("UNKNOWN_RULE");
      const base = existing ?? core.newRule({ now, id: this.#deps.randomId("r_") });
      saved = core.validateSiteRule({ ...clone(base), ...clone(rule), id: base.id, version: 1,
        created_at: base.created_at, updated_at: now });
      const rules = existing ? doc.rules.map(item => (item.id === saved.id ? saved : item)) : [...doc.rules, saved];
      return { ...doc, rules };
    });
    this.#emit("rules", "attention");
    return clone(saved);
  }

  async deleteRule(id) {
    await this.#stores.rules.update(doc => {
      if (!doc.rules.some(item => item.id === id)) fail("UNKNOWN_RULE");
      return { ...doc, rules: doc.rules.filter(item => item.id !== id) };
    });
    this.#emit("rules", "attention");
    return { removed: true };
  }

  async getJevSettings() {
    return clone((await this.#stores.rules.load()).jev);
  }

  async setJevSettings(patch = {}) {
    const allowed = ["consent", "interval_minutes", "hourly_budget"];
    if (!patch || typeof patch !== "object" || Object.keys(patch).some(key => !allowed.includes(key)))
      fail("INVALID_JEV_SETTINGS");
    const doc = await this.#stores.rules.update(current => ({ ...current, jev: { ...current.jev, ...patch } }));
    this.#emit("rules");
    return clone(doc.jev);
  }

  // ── usage ledger ──────────────────────────────────────────────────────
  #today() {
    const { year, month, day } = this.#deps.localTime(this.#deps.clock());
    return core.localDay({ year, month, day });
  }

  /** Runtime entry point: foreground time for one host in one context on `day`
   * (local "YYYY-MM-DD", default today). Returns whether it was recorded; never
   * throws. isPrivate: true is always ignored (callers also skip private windows).
   * Batched in memory; flushed every 30 s, before export and at shutdown. */
  recordForeground({ host, contextUuid = null, ms, isPrivate = false, day } = {}) {
    if (isPrivate !== false) return false;
    if (day !== undefined && (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/u.test(day))) return false;
    if (typeof host !== "string") return false;
    const normalized = host.toLowerCase().replace(/\.$/u, "");
    if (!LEDGER_HOST.test(normalized)) return false;
    if (contextUuid !== null && (typeof contextUuid !== "string" || !WORKSPACE_UUID.test(contextUuid))) return false;
    if (!Number.isFinite(ms) || ms <= 0) return false;
    const entry = { day: day ?? this.#today(), host: normalized, contextUuid, ms: Math.min(Math.round(ms), DAY_MS) };
    // Merged per (day, host, context) and bounded, so an unwritable ledger file
    // cannot make the pending batch grow without limit.
    const key = `${entry.day}\t${entry.host}\t${contextUuid ?? ""}`;
    const existing = this.#pendingLedger.get(key);
    if (existing) existing.ms = Math.min(existing.ms + entry.ms, DAY_MS);
    else if (this.#pendingLedger.size >= MAX_PENDING_LEDGER) return false;
    else this.#pendingLedger.set(key, entry);
    this.#effectiveLedger = null;
    this.#scheduleFlush();
    return true;
  }

  #scheduleFlush() {
    if (this.#flushTimer) return;
    this.#flushTimer = this.#deps.timers.setTimeout(() => {
      this.#flushTimer = null;
      return this.flushLedger().catch(error => console.error("AxioSozo ledger flush failed", error));
    }, LEDGER_FLUSH_MS);
  }

  async flushLedger() {
    if (this.#flushTimer) { this.#deps.timers.clearTimeout(this.#flushTimer); this.#flushTimer = null; }
    const today = this.#today();
    const batch = this.#pendingLedger;
    if (!batch.size && this.#prunedDay === today) return;
    this.#pendingLedger = new Map();
    try {
      await this.#stores.ledger.update(ledger => {
        let next = ledger;
        for (const entry of batch.values()) next = core.recordForeground(next, entry);
        return core.prune(next, { today });
      });
      this.#prunedDay = today;
    } catch (error) {
      // Keep the batch for the next attempt (still bounded); an invalid file is never overwritten.
      for (const [key, entry] of this.#pendingLedger) {
        const kept = batch.get(key);
        if (kept) kept.ms = Math.min(kept.ms + entry.ms, DAY_MS);
        else if (batch.size < MAX_PENDING_LEDGER) batch.set(key, entry);
      }
      this.#pendingLedger = batch;
      throw error;
    } finally {
      this.#effectiveLedger = null;
    }
    this.#emit("ledger", "attention");
  }

  async #ledgerNow() {
    if (this.#effectiveLedger) return this.#effectiveLedger;
    let ledger = await this.#stores.ledger.load();
    for (const entry of this.#pendingLedger.values()) ledger = core.recordForeground(ledger, entry);
    this.#effectiveLedger = ledger;
    return ledger;
  }

  /** Today's (or day's) foreground ms for host patterns; all contexts when contextUuid is undefined. */
  async usageFor({ hosts, contextUuid, day } = {}) {
    return core.usageFor(await this.#ledgerNow(), { day: day ?? this.#today(), hosts, contextUuid });
  }

  async usageSummary({ days = 7 } = {}) {
    return clone(core.summarize(await this.#ledgerNow(), { today: this.#today(), days }));
  }

  async exportLedger() {
    await this.flushLedger();
    return core.exportLedger(await this.#stores.ledger.load());
  }

  async clearLedger() {
    this.#pendingLedger = new Map();
    this.#effectiveLedger = null;
    await this.#stores.ledger.update(() => core.clearLedger());
    this.#emit("ledger", "attention");
    return { cleared: true };
  }

  // ── attention ─────────────────────────────────────────────────────────
  /** A declared service found down by the last requested probe, an agent whose
   * latest report says it needs input or failed (current project root only),
   * and rules whose daily limit is reached today. Never probes by itself. */
  async needsAttention() {
    const items = [];
    const { projects } = await this.#loadContexts();
    for (const project of projects) {
      for (const entry of this.#serviceStatus.get(project.id)?.values() ?? []) {
        if (entry.status !== "down") continue;
        items.push({ kind: "service_down", title: `${entry.name} is not responding`,
          detail: `${project.manifest.name} · ${entry.url}`,
          target: { type: "project", id: project.id, service: entry.name } });
      }
    }
    let waiting = [];
    try { waiting = this.#agentChannel?.needsAttention() ?? []; } catch { waiting = []; }
    for (const group of waiting) {
      const { state, agent, title } = group.latest ?? {};
      if (state !== "needs_input" && state !== "failed") continue;
      const project = projects.find(item => item.id === group.project_id && item.root === group.project_path);
      if (!project) continue;
      items.push({ kind: "agent", title: `${displayName(project)}: ${AGENT_NAMES[agent] ?? AGENT_NAMES.other} ${state === "failed" ? "failed" : "needs you"}`,
        detail: typeof title === "string" ? title : "", target: { type: "project", id: project.id } });
    }
    const { rules } = await this.#stores.rules.load();
    const contexts = rules.some(rule => rule.contexts !== "all") ? await this.listContexts() : [];
    for (const rule of rules) {
      const limit = rule.limits.daily_minutes;
      if (!rule.enabled || !limit) continue;
      const used = await this.#ruleUsageToday(rule, contexts);
      if (used < limit * 60000) continue;
      items.push({ kind: "rule_limit_reached", title: `Daily limit reached on ${rule.match.hosts[0]}`,
        detail: `${Math.floor(used / 60000)} of ${limit} minutes used today`,
        target: { type: "rule", id: rule.id } });
    }
    return items;
  }

  async #ruleUsageToday(rule, contexts) {
    const hosts = rule.match.hosts;
    if (rule.contexts === "all") return this.usageFor({ hosts });
    const scope = new Set(rule.contexts.workspaces ?? []);
    for (const context of contexts) if (rule.contexts.types?.includes(context.type)) scope.add(context.uuid);
    let total = 0;
    for (const uuid of scope) total += await this.usageFor({ hosts, contextUuid: uuid });
    return total;
  }

  // ── agent channel (P3; agent-channel-v1 §1, §7) ───────────────────────
  /** The process-wide channel, created on first use. Creating it starts
   * nothing: it only loads the guarded project cache. The endpoint starts off
   * in every process; setAgentEndpointEnabled is the only way to start it. */
  #agentService() {
    if (this.#agentChannel || this.#agentChannelClosed) return this.#agentChannel;
    const native = this.#deps.agentNative ?? null;
    const factory = typeof this.#deps.createAgentChannel === "function" ? this.#deps.createAgentChannel : createAgentChannelService;
    let channel;
    try {
      channel = factory({
        loadProjects: () => this.#loadAgentProjects(),
        validateProject: core.validateProject, validateStatusRecord: core.validateStatusRecord,
        parseHookEvent: core.parseHookEvent, isSensitiveHost: core.isSensitiveHost,
        now: () => this.#deps.clock(), randomHex: () => this.#deps.randomHex(),
        timers: { setTimeout: (fn, ms) => this.#deps.timers.setTimeout(fn, ms), clearTimeout: id => this.#deps.timers.clearTimeout(id) },
        createNativeConfiguration: typeof native?.createNativeConfiguration === "function" ? () => native.createNativeConfiguration() : unavailableNative,
        createTransportRuntime: typeof native?.createTransportRuntime === "function"
          ? ({ exactPosixBackend }) => native.createTransportRuntime({ exactPosixBackend }) : unavailableNative,
        ...(typeof native?.buildHookConfig === "function"
          ? { buildHookConfig: ({ agent, socketPath }) => native.buildHookConfig({ agent, socketPath }) } : {}),
        // Only the agent and the channel's own verified socket reach the builder.
        ...(typeof native?.buildBridgeConfig === "function"
          ? { buildBridgeConfig: ({ agent, socketPath }) => native.buildBridgeConfig({ agent, socketPath }) } : {}),
        onChange: event => this.#onAgentChange(event),
      });
    } catch (error) {
      console.error("AxioSozo: agent channel unavailable", error);
      return null;
    }
    this.#agentChannel = channel;
    try { this.#deps.resetAgentEndpointPref?.(); } catch { /* the endpoint never reads it */ }
    try { this.#deps.onShutdown?.(() => this.closeAgentChannel(), "AxioSozo: close agent channel"); }
    catch (error) { console.error("AxioSozo: agent channel shutdown not registered", error); }
    // At quiescence this fills the cache; otherwise it stays unavailable until
    // the final settling write refreshes it.
    Promise.resolve().then(() => (this.#agentChannel === channel ? channel.initialize() : null)).catch(() => {});
    return channel;
  }

  /** Channel changes reach pages only as event names. A cache invalidation is
   * not one of them (the projects event of the same write already reloads);
   * its ready or unavailable outcome is. Hook sessions are not either. */
  #onAgentChange(event) {
    const kind = event?.kind;
    if (AGENT_CHANNEL_EVENTS.has(kind) || (kind === "projects" && event.state !== "loading")
      || (kind === "session" && event.client?.name === "agent-bridge")) this.#emit("agents");
    if (kind === "activity") this.#emit("attention");
  }

  /** A window this service knows and that is known not to be private. */
  isNormalWindow(window) {
    const adapter = window ? this.#windows.get(window) ?? null : null;
    return !!adapter && this.#normalWindow(window, adapter);
  }

  #agentProject(id) {
    let project;
    try { project = this.#agentChannel?.getProjects().find(item => item.id === id); } catch { project = null; }
    return project ? Object.freeze({ id: project.id, root: project.root, name: displayName(project) }) : null;
  }

  /**
   * One chrome presenter per registered normal window (AgentStatusRuntime):
   * isNormal(), requestApproval({ agent, project_id, project_name }, { cwd,
   * signal }) → literally true to allow, and onStatus({ project_id,
   * project_name, record }). Private, unknown and unregistered windows are
   * refused here and are never eligible later. Returns unregister(); it also
   * runs when the window unregisters, cancelling its outstanding prompts.
   */
  registerAgentPresenter(window, presenter) {
    const adapter = window ? this.#windows.get(window) ?? null : null;
    if (!adapter || !this.#normalWindow(window, adapter)) fail("PRIVATE_WINDOW");
    if (typeof presenter?.isNormal !== "function" || typeof presenter?.requestApproval !== "function") fail("INVALID_PRESENTER");
    if (this.#agentPresenters.has(window)) fail("INVALID_PRESENTER");
    const channel = this.#agentService();
    if (!channel) fail("AGENT_CHANNEL_UNAVAILABLE");
    const unregister = channel.registerPresenter(window, {
      isNormal: () => this.#normalWindow(window, adapter) && presenter.isNormal() === true,
      requestApproval: (view, controls) => {
        const project = this.#agentProject(view?.project_id);
        if (!project) return false;
        const agent = Object.hasOwn(AGENT_NAMES, view?.client?.agent) ? view.client.agent : "other";
        return presenter.requestApproval(Object.freeze({ agent, project_id: project.id, project_name: project.name }),
          { signal: controls?.signal });
      },
      onStatus: event => {
        const project = this.#agentProject(event?.project_id);
        const latest = event?.latest;
        if (!project || !latest || latest.project_path !== project.root || typeof presenter.onStatus !== "function") return undefined;
        return presenter.onStatus(Object.freeze({ project_id: project.id, project_name: project.name,
          record: Object.freeze({ id: latest.id, agent: latest.agent, state: latest.state, title: latest.title, at: latest.at }) }));
      },
    });
    const remove = () => {
      if (this.#agentPresenters.get(window) === remove) this.#agentPresenters.delete(window);
      unregister();
    };
    this.#agentPresenters.set(window, remove);
    return remove;
  }

  /** A normal window came to the front: its presenter is the most recent one. */
  activateAgentPresenter(window) {
    return this.#agentPresenters.has(window) && this.isNormalWindow(window) ? this.#agentChannel?.activatePresenter(window) === true : false;
  }

  /** { enabled, state, reason, cleanup_pending, cleanup_blocked, projects,
   * methods, capabilities } and socketPath only while listening. `methods` is
   * what a connected agent can use now (never while off); `capabilities` is
   * what this build's tools can do once an agent is allowed: [{ method,
   * available, reason }] with fixed reason codes. Reading starts nothing. */
  getAgentEndpointState() {
    const channel = this.#agentService();
    if (!channel) return { enabled: false, state: "unavailable", reason: "AGENT_CHANNEL_UNAVAILABLE", cleanup_pending: false,
      cleanup_blocked: false, projects: { state: "unavailable", reason: null, generation: 0, count: 0 }, methods: [], capabilities: [] };
    return { ...clone(channel.getEndpointState()), capabilities: this.#agentCapabilities() };
  }

  #agentCapabilities() {
    let list = [];
    try { list = this.#agentBridge?.capabilities() ?? []; } catch { list = []; }
    return (Array.isArray(list) ? list : []).filter(item => typeof item?.method === "string" && /^[a-z]+\.[a-z]+$/u.test(item.method))
      .slice(0, 16).map(item => ({ method: item.method, available: item.available === true,
        reason: item.available === true ? null : typeof item.reason === "string" && /^[A-Z][A-Z0-9_]{0,63}$/u.test(item.reason) ? item.reason : "UNAVAILABLE" }));
  }

  /** The explicit Settings action of a registered normal window; on for this
   * browser session only. P4 methods follow the installed tools' own gates. */
  async setAgentEndpointEnabled({ window, enabled } = {}) {
    if (typeof enabled !== "boolean") fail("INVALID_INPUT");
    if (!this.isNormalWindow(window)) fail("PRIVATE_WINDOW");
    const channel = this.#agentService();
    if (!channel) fail("AGENT_CHANNEL_UNAVAILABLE");
    return clone(await channel.setEnabled(enabled));
  }

  /** Copyable hook configuration bound to the listening, verified socket and
   * the verified installed notify script. Nothing is installed or run. */
  async getAgentHookConfig({ window, agent } = {}) {
    if (!AGENT_HOOK_AGENTS.includes(agent)) fail("INVALID_INPUT");
    if (!this.isNormalWindow(window)) fail("PRIVATE_WINDOW");
    const channel = this.#agentService();
    if (!channel) fail("ENDPOINT_UNAVAILABLE");
    const text = await channel.getHookConfig(agent);
    if (!this.isNormalWindow(window)) fail("NO_WINDOW");
    return { agent, text };
  }

  /** Copyable plugin configuration for the shipped agent bridge (P4): Claude
   * Code .mcp.json or Codex config.toml text, generated by the channel's
   * verified builder for its own listening socket. The channel checks its
   * endpoint, cache, generation and shutdown before and after the build; this
   * checks the registered normal window before and after. Nothing is
   * installed, written, discovered or run, and copying it enables nothing. */
  async getAgentBridgeConfig({ window, agent } = {}) {
    if (!AGENT_HOOK_AGENTS.includes(agent)) fail("INVALID_INPUT");
    if (!this.isNormalWindow(window)) fail("PRIVATE_WINDOW");
    const channel = this.#agentService();
    if (!channel || typeof channel.getBridgeConfig !== "function") fail("ENDPOINT_UNAVAILABLE");
    const text = await channel.getBridgeConfig(agent);
    if (this.#agentChannelClosed || this.#agentChannel !== channel) fail("ENDPOINT_UNAVAILABLE");
    if (!this.isNormalWindow(window)) fail("NO_WINDOW");
    return { agent, text };
  }

  // ── P4 browser tools (Plan 4 step 8; chrome only, never the actor or the wire) ──
  /** The one process owner of the browser tools: { capabilities(), close() }.
   * Its close runs once at profile shutdown. Returns unregister. */
  registerAgentBridge(owner) {
    if (this.#agentChannelClosed) fail("SHUTDOWN");
    if (this.#agentBridge) fail("OWNER_REGISTERED");
    if (typeof owner?.capabilities !== "function" || typeof owner.close !== "function") fail("INVALID_OWNER");
    this.#agentBridge = owner;
    try { this.#deps.onShutdown?.(() => Promise.resolve(owner.close()).then(() => {}), "AxioSozo: close agent tools"); }
    catch (error) { console.error("AxioSozo: agent tools shutdown not registered", error); }
    return () => { if (this.#agentBridge === owner) this.#agentBridge = null; };
  }

  /** Installs the bridge owner's exact six-function tools into the channel
   * (which stops every session first). */
  installAgentBridgeTools(tools) {
    const channel = this.#agentService();
    if (!channel) fail("AGENT_CHANNEL_UNAVAILABLE");
    channel.installTools(tools);
    return true;
  }

  /** The channel's own trusted predicate for an approved bridge session; a
   * listed session view or an ID format is never authority. */
  isApprovedBridgeSession(id) {
    try { return this.#agentChannel?.isApprovedBridgeSession(id) === true; } catch { return false; }
  }

  /** project.info for an approved session, from the channel's validated cache:
   * names, roots, apps with their environment URLs and integration names. Never
   * account labels, containers, briefs or detection file content. */
  agentBridgeProject(id) {
    let project = null;
    try { project = this.#agentChannel?.getProjects().find(item => item.id === id) ?? null; } catch { project = null; }
    if (!project) return null;
    const line = (value, max) => (typeof value === "string" ? [...value.replace(/[\u0000-\u001f\u007f-\u009f]+/gu, " ").trim()].slice(0, max).join("") : "");
    const groups = new Map();
    for (const env of Array.isArray(project.manifest?.environments) ? project.manifest.environments : []) {
      const url = typeof env?.base_url === "string" && env.base_url.length <= 8192 && !/[\u0000-\u001f\u007f]/u.test(env.base_url)
        ? URL.parse(env.base_url) : null;
      if (!url || !["http:", "https:"].includes(url.protocol) || url.username || url.password || !line(env.name, 128)) continue;
      const app = typeof env.app === "string" && line(env.app, 128) ? line(env.app, 128) : null;
      if (!groups.has(app)) groups.set(app, []);
      groups.get(app).push({ name: line(env.name, 128), base_url: env.base_url });
    }
    const integrations = Array.isArray(project.detected?.integrations) ? project.detected.integrations : [];
    return deepFreeze({ project_id: project.id, name: line(project.manifest?.name, 160), root: project.root,
      apps: [...groups].slice(0, 32).map(([app, environments]) => ({ app, environments: environments.slice(0, 32) })),
      integrations: integrations.filter(item => line(item?.id, 128) && line(item?.name, 256)).slice(0, 16)
        .map(item => ({ id: line(item.id, 128), name: line(item.name, 256) })) });
  }

  /** The channel's groups for one known project ([] for any other id). */
  listAgentActivity(projectId) {
    if (!core.isProjectId(projectId)) return [];
    try { return clone(this.#agentService()?.listActivity(projectId) ?? []); } catch { return []; }
  }

  /** Approved or pending browser-bridge sessions of a project: agent and state. */
  listAgentSessions({ window, projectId } = {}) {
    if (!core.isProjectId(projectId)) fail("UNKNOWN_PROJECT");
    if (!this.isNormalWindow(window)) fail("PRIVATE_WINDOW");
    return (this.#agentChannel?.listSessions(projectId) ?? []).filter(view => view.project_id === projectId)
      .map(view => ({ session: view.session, agent: Object.hasOwn(AGENT_NAMES, view.client?.agent) ? view.client.agent : "other",
        state: view.state }));
  }

  revokeAgentSession({ window, projectId, sessionId } = {}) {
    if (!core.isProjectId(projectId) || typeof sessionId !== "string" || !AGENT_SESSION.test(sessionId)) fail("INVALID_INPUT");
    if (!this.isNormalWindow(window)) fail("PRIVATE_WINDOW");
    return { revoked: this.#agentChannel?.revokeSession(projectId, sessionId) === true };
  }

  /** Return targets are native identity only (agent-channel-v1 §7). */
  rememberAgentReturnTarget(target) {
    try { return this.#agentChannel?.rememberReturnTarget(target) === true; } catch { return false; }
  }

  agentReturnTarget(projectId) {
    try { return this.#agentChannel?.returnTarget(projectId) ?? null; } catch { return null; }
  }

  /** Privileged evidence only (never the actor or the wire): booleans and
   * counts, including the channel's read-only ownership snapshot. */
  getAgentDiagnostics() {
    const channel = this.#agentChannel;
    if (!channel) return Object.freeze({ created: false, ownership: null });
    let raw;
    try { raw = channel.diagnostics(); } catch { return Object.freeze({ created: true, ownership: null }); }
    let tools = null;
    try { tools = this.#agentBridge?.getState?.() ?? null; } catch { tools = null; }
    return countsOnly({ created: true, closed: raw.closed === true, enabled: raw.enabled === true,
      listening: raw.endpoint === "listening", cache_ready: raw.cache === "ready", projects: raw.projects,
      sessions: raw.sessions, presenters: raw.presenters, presentations: raw.presentations,
      cleanup_blocked: raw.cleanupBlocked === true, ownership: raw.ownership ?? null, tools });
  }

  /** Process shutdown: the listener stops and owned cleanup runs once. */
  async closeAgentChannel() {
    this.#agentChannelClosed = true;
    const channel = this.#agentChannel;
    for (const remove of [...this.#agentPresenters.values()]) remove();
    if (channel) await channel.close();
  }

  // ── Understand (Plan 4 step 6; reached through the Overview actor only) ──
  /** The process-wide facade, created when the first native owner registers.
   * Without an explicit synthetic request in the native environment it is the
   * always-closed production service: read, state and availability answer
   * NOT_AUTHORIZED before any project lookup, admission or runtime. Only that
   * privileged request selects the offline constructor, whose opener the
   * facade calls lazily with its process lifetime signal; a refused fixture
   * never falls back to a product client. Saved-brief confirmation works in
   * both, through the pinned manifest helper only. */
  #understandService() {
    if (this.#understand || this.#understandClosed) return this.#understand;
    const fixture = this.#deps.understandFixture ?? null;
    const dependencies = {
      core,
      lookupSnapshot: id => this.#lookupSnapshot(id),
      rootAdmission: root => this.#understandRootAdmission(root),
      commitProject: request => this.#commitUnderstandProject(request),
      uuid: () => this.#deps.newToken(),
      manifestIO: typeof this.#deps.createManifestAcceptIO === "function" ? this.#lazyManifestIO() : null,
      clock: () => this.#understandClock(),
      timers: { setTimeout: (fn, ms) => this.#deps.timers.setTimeout(fn, ms), clearTimeout: id => this.#deps.timers.clearTimeout(id) },
      // Pages learn that something changed, never whose or what: each asks for its own owner's state.
      onState: () => this.#emit("understand"),
    };
    try {
      this.#understand = typeof fixture?.openRuntime === "function"
        ? createOfflineUnderstandService(dependencies, { openRuntime: ({ signal }) => fixture.openRuntime({ signal }) })
        : createUnderstandService(dependencies);
      this.#understandOffline = typeof fixture?.openRuntime === "function";
    } catch (error) {
      console.error("AxioSozo: Understand unavailable", error?.code ?? error);
      return null;
    }
    try { this.#deps.onShutdown?.(() => this.closeUnderstand(), "AxioSozo: close Understand"); }
    catch (error) { console.error("AxioSozo: Understand shutdown not registered", error); }
    return this.#understand;
  }

  /** Nondecreasing epoch milliseconds for the facade, even if the clock steps back. */
  #understandClock() {
    const now = this.#deps.clock();
    if (Number.isSafeInteger(now) && now > this.#lastUnderstandClock) this.#lastUnderstandClock = now;
    return this.#lastUnderstandClock;
  }

  /** The pinned manifest helper's exact snapshot/accept, built only when an
   * explicit preview, acceptance or inspection first needs it. Unavailable
   * refuses that operation (known uncommitted); there is no other writer. */
  #lazyManifestIO() {
    const io = () => {
      if (this.#manifestAcceptIO) return this.#manifestAcceptIO;
      let created = null;
      try { created = this.#deps.createManifestAcceptIO(); } catch { created = null; }
      if (typeof created?.snapshot !== "function" || typeof created?.accept !== "function") {
        throw Object.assign(new ServicesError("WRITE_CONTAINMENT_UNAVAILABLE"), { committed: false });
      }
      this.#manifestAcceptIO = created;
      return created;
    };
    return Object.freeze({ snapshot: (root, options) => io().snapshot(root, options), accept: (value, options) => io().accept(value, options) });
  }

  /**
   * Chrome-only (never a page method): mints the facade's private owner alias
   * for one native caller. `current` is the caller's own synchronous, literal
   * true predicate (the actor binds it to its document, browser and selection);
   * it is composed with this registered normal window. The optional signal is
   * browser-owned. The alias is an object identity: never cloned, stringified
   * or derived from a project. Releasing it (or the signal, the window's
   * unregistration, shutdown) cancels that owner's reads and leases only.
   */
  registerUnderstandOwner({ window, current, signal } = {}) {
    if (this.#understandClosed) fail("UNDERSTAND_UNAVAILABLE");
    const adapter = window ? this.#windows.get(window) ?? null : null;
    if (typeof current !== "function" || !adapter || !this.#normalWindow(window, adapter)) fail("PRIVATE_WINDOW");
    const facade = this.#understandService();
    if (!facade) fail("UNDERSTAND_UNAVAILABLE");
    const alias = facade.createOwner({ current: () => this.#normalWindow(window, adapter) && current() === true,
      ...(signal === undefined ? {} : { signal }) });
    let owned = this.#understandWindows.get(window);
    if (!owned) this.#understandWindows.set(window, owned = new Set());
    owned.add(alias);
    this.#understandAliases.set(alias, window);
    signal?.addEventListener?.("abort", () => this.releaseUnderstandOwner(alias), { once: true });
    return alias;
  }

  /** Chrome-only, idempotent: ends one owner's work; the facade and every other owner continue. */
  releaseUnderstandOwner(alias) {
    if (!this.#understandAliases.has(alias)) return false;
    const window = this.#understandAliases.get(alias);
    this.#understandAliases.delete(alias);
    const owned = this.#understandWindows.get(window);
    owned?.delete(alias);
    if (owned && !owned.size) this.#understandWindows.delete(window);
    try { this.#understand?.releaseOwner(alias); } catch (error) { console.error("AxioSozo: Understand owner not released", error?.code ?? error); }
    return true;
  }

  #releaseUnderstandWindow(window) {
    for (const alias of [...(this.#understandWindows.get(window) ?? [])]) this.releaseUnderstandOwner(alias);
  }

  /** Process shutdown: every owner ends and the facade closes once; nothing new is admitted. */
  async closeUnderstand() {
    if (this.#understandClosed) return;
    this.#understandClosed = true;
    for (const alias of [...this.#understandAliases.keys()]) this.releaseUnderstandOwner(alias);
    const facade = this.#understand;
    if (facade) await facade.close();
  }

  // The closed page RPCs (AboutAxioSozoParent): the actor's private alias and
  // its strictly validated JSON params, unchanged, to the facade operation.
  getUnderstandState(alias, params) { return this.#understandCall("state", alias, params); }
  getUnderstandAvailability(alias, params) { return this.#understandCall("available", alias, params); }
  readProject(alias, params) { return this.#understandCall("read", alias, params); }
  cancelUnderstand(alias, params) { return this.#understandCall("cancel", alias, params); }
  previewProjectBriefAcceptance(alias, params) { return this.#understandCall("preview", alias, params); }
  acceptProjectBrief(alias, params) { return this.#understandCall("accept", alias, params); }
  reinspectProjectBriefAcceptance(alias, params) { return this.#understandCall("reinspect", alias, params); }

  /** Production read/state/availability go straight to the facade's closed
   * branch: no snapshot is prepared and no project looked up. Off it, and for
   * every confirmation step, the settled snapshots are prepared first; the same
   * registered owner is required again after that await, and the facade then
   * checks the owner, root and revision itself. A project whose snapshot is
   * withheld (a change pending, cleanup failed) refuses as PROJECT_CHANGED. */
  async #understandCall(operation, alias, params) {
    if (!UNDERSTAND_OPERATIONS.includes(operation)) fail("UNSUPPORTED");
    let facade = this.#understandFor(alias);
    const project = operation === "accept" || UNDERSTAND_PROJECT_OPERATIONS.has(operation)
      || (this.#understandOffline && operation !== "cancel");
    if (project) {
      await this.#prepareSnapshots();
      facade = this.#understandFor(alias);
      // An acceptance attempt always reaches the facade: it consumes its own token even when stale.
      if (operation !== "accept" && core.isProjectId(params?.projectId) && !this.#lookupSnapshot(params.projectId)) fail("PROJECT_CHANGED");
    }
    return facade[operation](alias, params);
  }

  #understandFor(alias) {
    if (this.#understandClosed || !this.#understand) fail("UNDERSTAND_UNAVAILABLE");
    if (!this.#understandAliases.has(alias)) fail("OWNER_REVOKED");
    return this.#understand;
  }

  /** Privileged evidence only: booleans and counts, never aliases, roots or documents. */
  getUnderstandDiagnostics() {
    const facade = this.#understand;
    if (!facade) return Object.freeze({ created: false, closed: this.#understandClosed });
    let raw = null;
    try { raw = facade.diagnostics(); } catch { raw = null; }
    return countsOnly({ created: true, closed: this.#understandClosed, offline: this.#understandOffline,
      owners: this.#understandAliases.size, windows: this.#understandWindows.size, snapshots: this.#snapshots.size,
      pending: this.#understandPending.size + this.#understandPendingAll, writes: this.#understandWrites.size, facade: raw });
  }

  /** Nothing that can change `id`'s authority (null: any project's) is pending,
   * in flight or failed: no store mutation or facade-owned write, no container
   * cleanup, no migration write still owed. */
  #snapshotQuiet(id = null) {
    const containers = this.#resetAttempt === null && this.#deletionAttempts.size === 0 && !this.#containerResetFailed
      && this.#failedDeletions.size === 0;
    const routing = this.#routingPendingAll === 0 && (id === null ? this.#routingPending.size === 0 : !this.#routingPending.has(id));
    const understand = this.#understandPendingAll === 0 && (id === null
      ? this.#understandPending.size === 0 && this.#understandWrites.size === 0
      : !this.#understandPending.has(id) && !this.#understandWrites.has(id));
    return containers && routing && understand && !this.#contextsNeedPersistence && this.#persistingContexts === null;
  }

  /** The facade's synchronous lookupSnapshot: exactly { binding, record } of the
   * settled cache, or null while anything that can change it is unsettled. */
  #lookupSnapshot(id) {
    if (!core.isProjectId(id) || this.#understandClosed || !this.#snapshotQuiet(id)) return null;
    const entry = this.#snapshots.get(id);
    return entry ? { binding: { ...entry.binding }, record: entry.record } : null;
  }

  /** Fills the cache from the settled store, at global quiescence only: nothing
   * pending before or after the read, and the routing sequence, container
   * generation and Understand change counter unmoved by it. An unchanged record
   * keeps its revision; a new or withdrawn one gets a fresh one (also when its
   * values came back to what they were). No await follows the final check. */
  async #prepareSnapshots() {
    if (!this.#snapshotQuiet()) return false;
    const sequence = this.#routingSequence, generation = this.#containerGeneration, changes = this.#understandSequence;
    const { projects } = await this.#loadContexts();
    if (!this.#snapshotQuiet() || sequence !== this.#routingSequence || generation !== this.#containerGeneration
      || changes !== this.#understandSequence) return false;
    const next = new Map();
    for (const stored of projects) {
      let record;
      try { record = core.upgradeProject(stored); } catch { continue; }
      const known = this.#snapshots.get(record.id);
      const same = known && known.binding.canonicalRoot === record.root && JSON.stringify(known.record) === JSON.stringify(record);
      next.set(record.id, same ? known : Object.freeze({
        binding: Object.freeze({ id: record.id, revision: ++this.#snapshotRevision, canonicalRoot: record.root }), record }));
      this.#snapshotsKnown.add(record.id);
    }
    this.#snapshots = next;
    return true;
  }

  /** Synchronously before an external mutation of `projectIds` (null: every
   * project) starts: marked pending, its snapshots withdrawn, its change marks
   * moved, then the facade's jobs and leases for it invalidated (a job the
   * controller pumps meanwhile already finds no snapshot). */
  #beginUnderstandChange(projectIds) {
    this.#understandSequence++;
    let affected;
    if (projectIds === null) {
      this.#understandPendingAll++;
      this.#understandChangesAll++;
      affected = [...new Set([...this.#snapshots.keys(), ...this.#snapshotsKnown])];
      this.#snapshots = new Map();
    } else {
      affected = projectIds.filter(id => typeof id === "string");
      for (const id of affected) {
        this.#understandPending.set(id, (this.#understandPending.get(id) ?? 0) + 1);
        this.#understandChanges.set(id, (this.#understandChanges.get(id) ?? 0) + 1);
        this.#snapshots.delete(id);
      }
    }
    const facade = this.#understand;
    if (!facade) return;
    for (const id of affected) {
      if (!core.isProjectId(id)) continue;
      try { facade.invalidateProject(id); } catch (error) { console.error("AxioSozo: Understand invalidation failed", error?.code ?? error); }
    }
  }

  #endUnderstandChange(projectIds) {
    if (projectIds === null) { this.#understandPendingAll = Math.max(0, this.#understandPendingAll - 1); return; }
    for (const id of projectIds) {
      if (typeof id !== "string") continue;
      const pending = (this.#understandPending.get(id) ?? 0) - 1;
      if (pending > 0) this.#understandPending.set(id, pending); else this.#understandPending.delete(id);
    }
  }

  /** An external phase that changes `projectIds` before (or without) a store
   * write, such as a folder read or a disk write ahead of the profile write. */
  async #understandScope(projectIds, run) {
    this.#beginUnderstandChange(projectIds);
    // Native console authority ends before the folder read or disk write too.
    this.#invalidateNative();
    try { return await run(); } finally { this.#endUnderstandChange(projectIds); this.#settleNative(); }
  }

  /** The facade's synchronous rootAdmission: literal true only for a root that
   * a settled snapshot registers, that is no denied system, home-settings,
   * credential or profile tree (given and resolved) and not home itself, and
   * that is now an existing directory whose canonical path is exactly itself.
   * Metadata only (no listing or reading); asked afresh on every call. */
  #understandRootAdmission(root) {
    try {
      if (!normalAbsolute(root) || this.#understandClosed) return false;
      const home = normalAbsolute(this.#deps.home) ? this.#deps.home : null;
      const denied = this.#deniedRoots();
      if (root === home || denied.some(base => within(root, base))) return false;
      if (![...this.#snapshots.values()].some(entry => entry.binding.canonicalRoot === root && entry.record.root === root)) return false;
      if (typeof this.#deps.rootMetadata !== "function") return false;
      const meta = this.#deps.rootMetadata(root);
      if (!meta || typeof meta !== "object" || typeof meta.then === "function") return false;
      if (meta.directory !== true || meta.canonical !== root) return false;
      return !denied.some(base => within(meta.canonical, base));
    } catch { return false; }
  }

  /**
   * The facade's commitProject: its own guarded profile write through the
   * contexts JsonStore queue, never an external-mutation hook (that would end
   * the facade's epoch before its guard runs). While reserved, no snapshot of
   * the project is handed out and its routing and the agent cache are held.
   * Inside the serialized write the latest record must still be the cached one
   * and no external change of it (or of every project) may have begun since;
   * then the facade's synchronous mutate(latest) runs exactly once and its
   * validated record is written atomically. Only after that durable write does
   * the cache take a new revision with exactly that record; then projects is
   * emitted. A refused or failed write leaves the record, cache and revision.
   */
  async #commitUnderstandProject({ binding, mutate } = {}) {
    const id = binding?.id;
    if (!core.isProjectId(id) || typeof mutate !== "function" || this.#understandClosed) fail("STALE_PROJECT");
    const marks = { id: this.#understandChanges.get(id) ?? 0, all: this.#understandChangesAll };
    const unchanged = () => !this.#understandClosed && marks.id === (this.#understandChanges.get(id) ?? 0)
      && marks.all === this.#understandChangesAll;
    this.#understandWrites.set(id, (this.#understandWrites.get(id) ?? 0) + 1);
    let published, before;
    try {
      published = await this.#routingMutation([id], async () => {
        await this.#loadContexts();
        let next = null;
        const doc = await this.#stores.contexts.update(current => {
          const known = this.#snapshots.get(id);
          const latest = current.projects.find(item => item.id === id);
          if (!unchanged() || !known || !latest || latest.root !== known.binding.canonicalRoot
            || JSON.stringify(latest) !== JSON.stringify(known.record)) fail("STALE_PROJECT");
          before = latest;
          next = core.validateProject(mutate({ binding: { ...known.binding }, record: latest }));
          if (next.id !== id || next.root !== latest.root) fail("STALE_PROJECT");
          return { ...current, projects: current.projects.map(item => (item.id === id ? next : item)) };
        });
        const stored = next ? doc.projects.find(item => item.id === id) : null;
        if (!stored) fail("BRIEF_SAVE_FAILED");
        const entry = Object.freeze({ binding: Object.freeze({ id, revision: ++this.#snapshotRevision, canonicalRoot: stored.root }), record: stored });
        this.#snapshots.set(id, entry);
        this.#snapshotsKnown.add(id);
        return entry;
      }, { understand: false });
    } finally {
      const writes = (this.#understandWrites.get(id) ?? 1) - 1;
      if (writes > 0) this.#understandWrites.set(id, writes); else this.#understandWrites.delete(id);
      // Its routing scope settled while this write was still counted.
      this.#settleNative();
    }
    // An accepted brief can bring the inspected file's manifest with it: checks
    // start afresh, and a confirmed new name renames the project's own container.
    if (JSON.stringify(before?.manifest) !== JSON.stringify(published.record.manifest)) this.#serviceStatus.delete(id);
    if (before?.manifest?.name !== published.record.manifest.name) void this.#renameContainer(id);
    this.#emit("projects");
    return { committed: true, snapshot: { binding: { ...published.binding }, record: published.record } };
  }

  // ── handoff project authority (P3; never the actor or the wire) ───────
  /**
   * The project of a page being handed off, captured only while no project or
   * container write is pending, in flight or failed: { project: null | { id,
   * root }, name, check() }. `check()` is synchronous and true only while the
   * global routing sequence and container generation are unchanged, nothing is
   * pending, the window is still registered and normal and the tab is still in
   * the same space; the handoff calls it immediately before its clipboard write.
   * An ambiguous match is no project; unknown or pending authority refuses
   * (PROJECT_CHANGED) instead of claiming no project. Engine and workspace
   * identity of the tab stay with the caller's native tab checks.
   */
  async captureHandoffAuthority({ window, tab, url, userContextId } = {}) {
    const adapter = window ? this.#windows.get(window) ?? null : null;
    if (!adapter || !this.#normalWindow(window, adapter)) fail("PRIVATE");
    if (typeof url !== "string" || !URL.parse(url) || !Number.isSafeInteger(userContextId) || userContextId < 0
      || userContextId > MAX_PUBLIC_USER_CONTEXT_ID) fail("INVALID_INPUT");
    const workspace = () => { try { return adapter.workspaceForTab(tab) ?? null; } catch { return undefined; } };
    const contextUuid = workspace();
    if (contextUuid === undefined) fail("POLICY_UNAVAILABLE");
    if (!this.#agentAuthorityQuiet()) fail("PROJECT_CHANGED");
    const sequence = this.#routingSequence, generation = this.#containerGeneration;
    const { projects } = await this.#loadContexts();
    const check = () => this.#agentAuthorityQuiet() && sequence === this.#routingSequence && generation === this.#containerGeneration
      && this.#normalWindow(window, adapter) && workspace() === contextUuid;
    if (!check()) fail("PROJECT_CHANGED");
    const match = core.matchProjectForUrl(projects, url, { contextUuid: contextUuid ?? undefined });
    const byUrl = match && !match.ambiguous ? projects.find(item => item.id === match.project_id) ?? null : null;
    const owners = userContextId > 0
      ? projects.filter(item => core.upgradeProject(item).container.user_context_id === userContextId) : [];
    const byContainer = owners.length === 1 ? owners[0] : null;
    const found = byUrl && byContainer && byUrl !== byContainer ? null : byUrl ?? byContainer;
    return Object.freeze({ project: found ? Object.freeze({ id: found.id, root: found.root }) : null,
      name: found ? displayName(found) : null, check });
  }

  // ── native project authority (Plan 4 step 7; chrome only, never the actor or the wire) ──
  /**
   * Publishes the native snapshot of settled projects, at global quiescence
   * only: nothing pending, in flight or failed (project writes, facade
   * commits, container cleanups, a migration write still owed) before and
   * after the one store read, and the routing sequence, container
   * generation, Understand change counter, epoch and hydration unmoved by it.
   * No await follows the final check. Metadata only: no facade, owner,
   * client, transport, endpoint, provider, repository read or manifest write.
   * Resolves true while a publication is current.
   */
  async prepareNativeProjectAuthority() {
    if (this.#nativeShutdown || this.#nativeExhausted) return false;
    if (this.#nativeAllowing()) return true;
    if (!this.#snapshotQuiet()) return false;
    const hydration = ++this.#nativeHydration, epoch = this.#nativeEpoch;
    const sequence = this.#routingSequence, generation = this.#containerGeneration, changes = this.#understandSequence;
    let projects;
    try { ({ projects } = await this.#loadContexts()); } catch { return false; }
    if (this.#nativeShutdown || hydration !== this.#nativeHydration || epoch !== this.#nativeEpoch || this.#nativeExhausted
      || !this.#snapshotQuiet() || sequence !== this.#routingSequence || generation !== this.#containerGeneration
      || changes !== this.#understandSequence) return false;
    const records = [];
    for (const stored of projects) {
      try { records.push(deepFreeze(clone(core.upgradeProject(stored)))); } catch { /* an invalid record is never authority */ }
    }
    if (this.#nativeEpoch >= Number.MAX_SAFE_INTEGER - 1) { this.#nativeExhausted = true; return false; }
    const revision = ++this.#nativeEpoch;
    const list = Object.freeze(records);
    this.#nativePublished = Object.freeze({ revision, hydration, projects: list, snapshot: Object.freeze({ revision, projects: list }) });
    this.#notifyNative("settled");
    // Availability changed: shown counts and homes read again.
    this.#emitConsole();
    return true;
  }

  /** The current publication, frozen { revision, projects }, or null while
   * unpublished, exhausted, anything is pending or failed, or a newer
   * hydration started. `revision` is the global epoch shared by every
   * project and tab of this publication. */
  readNativeProjectSnapshot() {
    return this.#nativeAllowing() ? this.#nativePublished.snapshot : null;
  }

  /**
   * One project's native authority for a registered normal window:
   * frozen { id, root, revision, check }, or null. The record must be in the
   * current publication, and its root admitted afresh: no denied system,
   * home-settings, credential or profile folder, not home itself, an existing
   * directory whose canonical path is exactly the stored root (synchronous
   * metadata). `revision` is the global epoch. `check()` is synchronous and
   * literally true only while the window, publication, epoch, quiescence,
   * routing sequence, container generation, Understand change counter, the
   * exact retained record and the root all still hold; an invalidation is
   * caught even when the values later come back.
   */
  captureNativeProjectAuthority({ window, project_id } = {}) {
    try {
      if (!core.isProjectId(project_id)) return null;
      const adapter = window ? this.#windows.get(window) ?? null : null;
      if (!adapter || !this.#normalWindow(window, adapter) || !this.#nativeAllowing()) return null;
      const published = this.#nativePublished, revision = published.revision;
      const record = published.projects.find(item => item.id === project_id);
      if (!record || this.#nativeRootAdmission(record.root) !== true) return null;
      const root = record.root;
      const sequence = this.#routingSequence, generation = this.#containerGeneration, changes = this.#understandSequence;
      const check = () => {
        try {
          return this.#nativePublished === published && this.#nativeEpoch === revision && this.#nativeAllowing()
            && this.#windows.get(window) === adapter && this.#normalWindow(window, adapter)
            && sequence === this.#routingSequence && generation === this.#containerGeneration && changes === this.#understandSequence
            && published.projects.find(item => item.id === project_id) === record && this.#nativeRootAdmission(root) === true;
        } catch { return false; }
      };
      if (check() !== true) return null;
      return Object.freeze({ id: project_id, root, revision, check });
    } catch { return null; }
  }

  /** Chrome-only, synchronous: callback(frozen { phase: "invalidated" |
   * "settled", revision }). No record, root or owner leaves this hook. */
  onNativeProjectAuthority(callback) {
    if (typeof callback !== "function") fail("INVALID_CALLBACK");
    this.#nativeListeners.add(callback);
    return () => { this.#nativeListeners.delete(callback); };
  }

  /**
   * Chrome-only: the one process console owner (ConsoleErrorsNativeRuntime).
   * The same object again is idempotent; another one is refused while this
   * one is registered, and every one after profile shutdown. Its service's
   * changes become the name-only "console" event. At profile shutdown native
   * authority ends for good first (publication withdrawn, any hydration
   * voided, listeners told), then the owner is unregistered and disposed once.
   * Returns unregister (an ordinary unregistration, not a shutdown).
   */
  registerNativeBrowserOwner(owner) {
    if (this.#nativeShutdown) fail("SHUTDOWN");
    if (owner && owner === this.#nativeOwner) return this.#nativeOwnerUnregister;
    if (this.#nativeOwner) fail("OWNER_REGISTERED");
    if (!owner || typeof owner !== "object" || typeof owner.dispose !== "function" || typeof owner.detachWindow !== "function"
      || typeof owner.service?.onChange !== "function") fail("INVALID_OWNER");
    const unsubscribe = owner.service.onChange(() => this.#emitConsole());
    this.#nativeOwner = owner;
    const unregister = () => {
      if (this.#nativeOwner !== owner) return;
      this.#nativeOwner = null;
      this.#nativeOwnerUnregister = null;
      try { unsubscribe(); } catch {}
      if (this.#consoleTimer !== null) { try { this.#deps.timers.clearTimeout(this.#consoleTimer); } catch {} }
      this.#consoleTimer = null;
      this.#consolePending = false;
    };
    let disposed = false;
    const shutdown = () => {
      this.#shutdownNative();
      unregister();
      if (disposed) return;
      disposed = true;
      try { owner.dispose(); } catch (error) { console.error("AxioSozo: console errors not closed", error); }
    };
    try { this.#deps.onShutdown?.(async () => shutdown(), "AxioSozo: close console errors"); }
    catch (error) { console.error("AxioSozo: console errors shutdown not registered", error); }
    this.#nativeOwnerUnregister = unregister;
    return unregister;
  }

  /** Profile shutdown, irreversibly and synchronously: no publication stays
   * readable, a hydration in flight is void, every held check() turns false
   * and listeners hear "invalidated" before any owner is disposed. */
  #shutdownNative() {
    if (this.#nativeShutdown) return;
    this.#nativeShutdown = true;
    this.#invalidateNative();
  }

  #nativeAllowing() {
    const published = this.#nativePublished;
    return !this.#nativeShutdown && !!published && !this.#nativeExhausted && published.revision === this.#nativeEpoch
      && published.hydration === this.#nativeHydration && this.#snapshotQuiet() && this.#agentAuthorityQuiet();
  }

  /** Synchronously, at the start of any change that can move project
   * authority: the publication is withdrawn, a hydration in flight voided and
   * the epoch moved before listeners hear "invalidated". Nested ones are fine. */
  #invalidateNative() {
    this.#nativeHydration++;
    this.#nativePublished = null;
    if (this.#nativeEpoch >= Number.MAX_SAFE_INTEGER - 1) this.#nativeExhausted = true;
    else this.#nativeEpoch++;
    this.#notifyNative("invalidated");
  }

  /** At quiescence, while someone uses native authority, publish again. */
  #settleNative() {
    if (this.#nativeShutdown || (!this.#nativeOwner && !this.#nativeListeners.size) || this.#nativeExhausted || !this.#snapshotQuiet()) return;
    Promise.resolve().then(() => this.prepareNativeProjectAuthority()).catch(() => {});
  }

  #notifyNative(phase) {
    const event = Object.freeze({ phase, revision: this.#nativeEpoch });
    for (const listener of [...this.#nativeListeners]) {
      try { listener(event); } catch (error) { console.error("AxioSozo: native authority listener failed", error); }
    }
  }

  /** The same containment policy as Understand root admission, against the
   * native publication: metadata only, asked afresh on every call. */
  #nativeRootAdmission(root) {
    try {
      if (!normalAbsolute(root)) return false;
      const home = normalAbsolute(this.#deps.home) ? this.#deps.home : null;
      const denied = this.#deniedRoots();
      if (root === home || denied.some(base => within(root, base))) return false;
      if (typeof this.#deps.rootMetadata !== "function") return false;
      const meta = this.#deps.rootMetadata(root);
      if (!meta || typeof meta !== "object" || typeof meta.then === "function") return false;
      if (meta.directory !== true || meta.canonical !== root) return false;
      return !denied.some(base => within(meta.canonical, base));
    } catch { return false; }
  }

  /** The name-only console event, at most once per CONSOLE_EVENT_MS. */
  #emitConsole() {
    if (this.#consoleTimer !== null) { this.#consolePending = true; return; }
    this.#emit("console");
    try {
      this.#consoleTimer = this.#deps.timers.setTimeout(() => {
        this.#consoleTimer = null;
        if (this.#consolePending) { this.#consolePending = false; this.#emitConsole(); }
      }, CONSOLE_EVENT_MS);
    } catch { this.#consoleTimer = null; }
  }

  // ── navigation helpers for the Overview actor ─────────────────────────
  /** openContext(uuid, { window }) or openContext({ uuid, window }). */
  async openContext(uuidOrOptions, options = {}) {
    const { uuid, window } = typeof uuidOrOptions === "object" && uuidOrOptions !== null
      ? uuidOrOptions : { ...options, uuid: uuidOrOptions };
    const space = this.#requireLive(uuid);
    const adapter = this.#adapterFor(window) ?? space.adapter;
    return { opened: await adapter.switchTo(uuid) };
  }

  /** http(s) only; new tab in contextUuid, else the matching project's context, else the
   * current one. A URL of a known project opens as that project's link
   * (openProjectUrl: its own container). openUrl(url, { contextUuid, window })
   * or openUrl({ url, contextUuid, window }). */
  async openUrl(urlOrOptions, options = {}) {
    const { url, contextUuid = null, window } = typeof urlOrOptions === "object" && urlOrOptions !== null
      ? urlOrOptions : { ...options, url: urlOrOptions };
    const parsed = URL.parse(String(url));
    if (!parsed || !["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password)
      fail("INVALID_URL");
    let target = contextUuid;
    if (target !== null) this.#requireLive(target);
    const match = await this.projectForUrl(parsed.href, target ?? undefined);
    const routed = this.#registeredWindow(window);
    if (match && routed) return this.openProjectUrl({ window: routed, projectId: match.project.id, url: parsed.href, contextUuid: target });
    if (target === null) {
      const owner = match?.project.context_uuid ?? null;
      if (owner && this.#liveWorkspaces().has(owner)) target = owner;
    }
    const adapter = this.#adapterFor(window);
    if (!adapter) fail("NO_WINDOW");
    await adapter.openTab(parsed.href, { workspaceUuid: target });
    return { opened: true };
  }

  /** The registered window behind #adapterFor(window): the given one, the most
   * recent one, else the first authoritative one. */
  #registeredWindow(window) {
    if (window && this.#windows.has(window)) return window;
    const recent = this.#deps.mostRecentWindow?.();
    if (recent && this.#windows.has(recent)) return recent;
    const adapter = this.#authoritativeAdapters()[0];
    for (const [key, value] of this.#windows) if (value === adapter) return key;
    return null;
  }
}

let instance = null;

/** Loopback addresses to connect to for a service URL, or null when the URL's
 * host is not localhost / 127.0.0.1 / [::1] (then nothing is ever contacted). */
export function loopbackAddresses(url) {
  const parsed = typeof url === "string" ? URL.parse(url) : null;
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) return null;
  return Object.hasOwn(LOOPBACK_ADDRESSES, parsed.hostname) ? LOOPBACK_ADDRESSES[parsed.hostname] : null;
}

const isExistsError = error => error?.name === "NoModificationAllowedError" || error?.code === "EEXIST";

/**
 * Writes <root>/<dir>/<file> without ever following a link planted in the
 * repository. fs primitives (see chromeFileSystem): lstat (no follow),
 * makeDirectory (one level, fails if anything exists), writeNew (O_CREAT|O_EXCL:
 * fails on any existing entry, dangling links included), rename (rename(2):
 * replaces the target entry itself) and remove (the entry, not a link target).
 * The temporary file has an unpredictable name; .axiosozo and the target are
 * re-checked right before and after the rename; the temporary file is removed
 * on failure.
 */
export async function writeManifestFile(fs, root, relative, text, token) {
  const parts = String(relative).split("/");
  if (parts.length !== 2 || parts.some(part => !part || part.startsWith(".."))) throw new ServicesError("INVALID_MANIFEST_PATH");
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{6,64}$/u.test(token)) throw new ServicesError("INVALID_TEMP_NAME");
  if ((await fs.lstat(root))?.type !== "directory") throw new ServicesError("ROOT_NOT_DIRECTORY");
  const dir = fs.join(root, parts[0]);
  const path = fs.join(root, relative);
  const checkDir = async () => {
    if ((await fs.lstat(dir))?.type !== "directory") throw new ServicesError("MANIFEST_DIR_REFUSED");
  };
  const checkTarget = async ({ required = false } = {}) => {
    const info = await fs.lstat(path);
    if (info ? info.type !== "regular" : required) throw new ServicesError("MANIFEST_TARGET_REFUSED");
  };
  const dirInfo = await fs.lstat(dir);
  if (!dirInfo) await fs.makeDirectory(dir);
  else if (dirInfo.type !== "directory") throw new ServicesError("MANIFEST_DIR_REFUSED");
  await checkDir();
  await checkTarget();
  const tmp = fs.join(dir, `.${parts[1]}.${token}.tmp`);
  let ours = false;
  try {
    try {
      await fs.writeNew(tmp, text);
      ours = true;
    } catch (error) {
      // A partial write of our own file is cleaned up; an entry that already
      // existed is someone else's and is left alone.
      if (!isExistsError(error) && (await fs.lstat(tmp).catch(() => null))?.type === "regular") ours = true;
      throw error;
    }
    if ((await fs.lstat(tmp))?.type !== "regular") throw new ServicesError("MANIFEST_TEMP_REFUSED");
    await checkDir();
    await checkTarget();
    await fs.rename(tmp, path);
    ours = false;
    await checkDir();
    await checkTarget({ required: true });
  } catch (error) {
    if (ours) await Promise.resolve().then(() => fs.remove(tmp)).catch(() => {});
    throw error;
  }
  return path;
}

const processSingletons = new Map();
/** One value per process for chrome glue that must not be created per window
 * (for example the on-demand provider-host `decide`). This module lives in the
 * shared system global, so the map is process-wide. */
export function processSingleton(key, factory) {
  if (!processSingletons.has(key)) processSingletons.set(key, factory());
  return processSingletons.get(key);
}

// ── chrome-only dependencies (never evaluated under Node tests) ─────────
function chromeDependencies() {
  const { setTimeout, clearTimeout } = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  const directory = key => { try { return Services.dirsvc.get(key, Ci.nsIFile).path; } catch { return null; } };
  return {
    storageFor: name => profileStorage(name),
    fs: chromeFileSystem(),
    probe: target => tcpProbe(target, { setTimeout, clearTimeout }),
    timers: { setTimeout, clearTimeout },
    pickFolder: pickFolderWithFilePicker,
    mostRecentWindow: () => Services.wm.getMostRecentWindow("navigator:browser"),
    onShutdown(flush, label = "AxioSozo: flush usage ledger") {
      const { AsyncShutdown } = ChromeUtils.importESModule("resource://gre/modules/AsyncShutdown.sys.mjs");
      AsyncShutdown.profileBeforeChange.addBlocker(label, () => flush().catch(() => {}));
    },
    // Agent channel natives, each loaded only when the explicit Settings action
    // (or a copy of hook settings) needs it. No path comes from a caller: the
    // configuration uses the current profile and the pinned helper, and the
    // hook builder its verified installed notify script. A missing or failing
    // module makes that capability unavailable; there is no fallback.
    agentNative: Object.freeze({
      createNativeConfiguration: async () => (await import("./AgentChannelConfig.sys.mjs")).createNativeAgentChannelConfiguration(),
      createTransportRuntime: ({ exactPosixBackend }) => createGeckoAgentTransportRuntime({ exactPosixBackend }),
      buildHookConfig: async ({ agent, socketPath }) => {
        let build;
        try { build = (await import("./AgentHookConfig.sys.mjs")).buildNativeAgentHookConfig; }
        catch { throw new ServicesError("AGENT_HOOK_CONFIG_UNAVAILABLE"); }
        if (typeof build !== "function") throw new ServicesError("AGENT_HOOK_CONFIG_UNAVAILABLE");
        return build({ agent, socketPath });
      },
      // The checksum-pinned installed bridge bundle and its fixed Node, verified
      // afresh on each request; it runs only fixed id/stat metadata tools.
      buildBridgeConfig: async ({ agent, socketPath }) => {
        let build;
        try { build = (await import("./AgentBridgeConfig.sys.mjs")).buildNativeAgentBridgeConfig; }
        catch { throw new ServicesError("AGENT_BRIDGE_CONFIG_UNAVAILABLE"); }
        if (typeof build !== "function") throw new ServicesError("AGENT_BRIDGE_CONFIG_UNAVAILABLE");
        return build({ agent, socketPath });
      },
    }),
    resetAgentEndpointPref: () => { if (Services.prefs.prefHasUserValue(AGENT_ENDPOINT_PREF)) Services.prefs.clearUserPref(AGENT_ENDPOINT_PREF); },
    // Fixed interpreter/helper paths and checksum (ProjectReaderConfig); created
    // per admitted detection, never from page or actor parameters.
    createReader: () => createNativeProjectReader(),
    newToken: browserToken,
    home: directory("Home"),
    profileDir: directory("ProfD"),
    arrivalRoots: arrivalRootsFromEnvironment(name => Services.env.get(name)),
    // ProjectArrival's fixed /usr/bin/id and own-UID lsof requests run through
    // the checksum-pinned supervisor (ProjectArrivalSubprocess), built on the
    // first actual discovery. Unavailable means no discovery; there is no
    // direct-lsof fallback.
    arrivalRuntime: lazyArrivalSubprocess(() => createNativeProjectArrivalSubprocess()),
    // Project containers through the pinned ContextualIdentityService: its
    // canonical colours, the briefcase icon, no data-clearing removal. A failed
    // import leaves containers unavailable (fail closed); there is no fallback.
    containerIdentities: () => {
      const { ContextualIdentityService, CONTAINER_COLORS } = ChromeUtils.importESModule(CONTEXTUAL_IDENTITY_MODULE);
      const colors = Array.isArray(CONTAINER_COLORS) ? CONTAINER_COLORS.map(entry => entry.name) : ContextualIdentityService.containerColors;
      return createGeckoIdentityAdapter({ service: ContextualIdentityService, allowedColors: colors, allowedIcons: [PROJECT_CONTAINER_ICON] });
    },
    containersEnabled: () => Services.prefs.getBoolPref(CONTAINERS_PREF, false),
    observeContainers: observeChromeContainers,
    // Understand (Plan 4 step 6): synchronous nsIFile metadata for root
    // admission; the synthetic fixture only when this process's native
    // environment explicitly requests it (otherwise the always-closed
    // production facade, and no fixture factory is ever called); the pinned
    // manifest helper, built on the first explicit confirmation.
    rootMetadata: rootMetadataSync,
    understandFixture: understandFixtureRequested(name => Services.env.get(name))
      ? Object.freeze({ openRuntime: understandFixtureOpener({
        createRuntime: async options => (await import("./NativeUnderstandFixtureRuntime.sys.mjs")).createNativeUnderstandFixtureRuntime(options),
        createTransport: async options => (await import("./ProviderUnderstand.sys.mjs")).createUnderstandTransport(options) }) })
      : null,
    createManifestAcceptIO: () => createNativeManifestAcceptIO(),
  };
}

/** Whether this process's native environment explicitly requests the synthetic
 * Understand fixture (the variable the native factory itself requires). Being
 * requested admits nothing: the factory validates its exact root, profile,
 * flags, pins and executables, and refuses without any fallback. */
export function understandFixtureRequested(env) {
  try { const value = env("AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT"); return typeof value === "string" && value !== ""; }
  catch { return false; }
}

/** The offline facade's process-scoped opener: the admitted native fixture
 * runtime (called with the facade's lifetime signal only), then the staged
 * transport over it. Returns exactly { transport, projectRoots }, the roots
 * taken from that admitted runtime. An absent or refused runtime throws; a
 * product runtime or installed client is never used instead. */
export function understandFixtureOpener({ createRuntime, createTransport }) {
  return async ({ signal } = {}) => {
    const runtime = await createRuntime({ signal });
    const roots = runtime?.fixturePaths?.projectRoots;
    if (!runtime || !Array.isArray(roots) || !roots.length) throw new ServicesError("UNDERSTAND_FIXTURE_UNAVAILABLE");
    const transport = await createTransport({ runtime });
    return { transport, projectRoots: [...roots] };
  };
}

/** Synchronous metadata of a folder for Understand root admission: whether it
 * exists as a directory and its canonical path. Nothing is listed or read. */
function rootMetadataSync(path) {
  const file = localFile(path);
  if (!file.exists()) return null;
  const directory = file.isDirectory();
  file.normalize();
  return { canonical: file.path, directory };
}

/** Firefox's container deletion notification (its trusted payload carries the
 * userContextId) and the containers pref turned off. Never per-ID events for
 * the pref: Gecko resets every identity at once without them. */
function observeChromeContainers({ identityDeleted, containersDisabled }) {
  const deleted = { observe(subject) {
    let id;
    try { id = subject?.wrappedJSObject?.userContextId; } catch { id = undefined; }
    identityDeleted(id);
  } };
  const pref = { observe() { if (!Services.prefs.getBoolPref(CONTAINERS_PREF, false)) containersDisabled(); } };
  Services.obs.addObserver(deleted, "contextual-identity-deleted");
  Services.prefs.addObserver(CONTAINERS_PREF, pref);
  return () => {
    Services.obs.removeObserver(deleted, "contextual-identity-deleted");
    Services.prefs.removeObserver(CONTAINERS_PREF, pref);
  };
}

function localFile(path) {
  const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
  file.initWithPath(path);
  return file;
}

/** Minimal filesystem seam: lstat without following the leaf, stat, realpath
 * (metadata only) and the no-follow write primitives used by writeManifestFile.
 * It has no read or listing on purpose: project content is only ever read and
 * listed through the containment reader (ProjectDetection). */
export function chromeFileSystem() {
  const statOf = (file, followLeaf) => {
    if (!followLeaf && file.isSymlink()) return { type: "symlink", size: 0 };
    if (file.isFile()) return { type: "regular", size: file.fileSize };
    if (file.isDirectory()) return { type: "directory", size: 0 };
    return { type: "other", size: 0 };
  };
  return {
    join: (root, relative) => PathUtils.join(root, ...relative.split("/")),
    basename: path => PathUtils.filename(path),
    async lstat(path) {
      const file = localFile(path);
      // exists() follows links; a dangling link still has to be reported.
      // nsIFile.isSymlink() throws NS_ERROR_FILE_NOT_FOUND for a missing entry
      // (it lstat()s), so an absent file must yield null, not an error: otherwise
      // every absent allowlisted file is reported as "unreadable".
      let link = false;
      try { link = file.isSymlink(); } catch { link = false; }
      if (!link && !file.exists()) return null;
      return statOf(file, false);
    },
    async stat(path) {
      const file = localFile(path);
      return file.exists() ? statOf(file, true) : null;
    },
    async realpath(path) {
      const file = localFile(path);
      file.normalize();
      return file.path;
    },
    /** One directory level; rejects when anything (a link included) already exists. */
    async makeDirectory(path) {
      await IOUtils.makeDirectory(path, { createAncestors: false, ignoreExisting: false, permissions: 0o755 });
    },
    /** IOUtils "create" mode opens with PR_CREATE_FILE | PR_EXCL (O_CREAT|O_EXCL):
     * it fails on any existing entry, including a dangling symlink, and never
     * follows a link (xpcom/ioutils/IOUtils.cpp WriteSync). */
    async writeNew(path, text) {
      await IOUtils.writeUTF8(path, text, { mode: "create" });
    },
    /** IOUtils.move → nsLocalFile::MoveToNative → rename(2), which replaces the
     * destination entry rather than following it. IOUtils moves *into* a
     * destination that resolves to a directory, so callers lstat the target
     * first (writeManifestFile does). */
    async rename(from, to) {
      await IOUtils.move(from, to);
    },
    async remove(path) {
      await IOUtils.remove(path, { ignoreAbsent: true, recursive: false });
    },
  };
}

async function pickFolderWithFilePicker(window) {
  const picker = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
  picker.init(window.browsingContext, "Choose project folder", Ci.nsIFilePicker.modeGetFolder);
  const result = await new Promise(resolve => picker.open(resolve));
  return result === Ci.nsIFilePicker.returnOK && picker.file ? picker.file.path : null;
}

/** One TCP connect to a loopback address (literal, so no DNS) on a declared
 * port; nothing is sent. Remote hosts are never passed here.
 * "up" once the transport reports STATUS_CONNECTED_TO; "down" when the input
 * stream reports an error (connection refused) or on timeout. An output-stream
 * readiness callback is not usable here: Gecko fires it before the connection
 * exists, where a 0-byte write succeeds and isAlive() is still false, so every
 * running service used to be reported as down (H3 GUI run). */
export function tcpProbe({ address, port, timeoutMs }, timers) {
  return new Promise(resolve => {
    if (address !== "127.0.0.1" && address !== "::1") { resolve("unknown"); return; }
    let transport; let finished = false; let timer = null;
    const finish = status => {
      if (finished) return;
      finished = true;
      if (timer) timers.clearTimeout(timer);
      try { transport?.close(Cr.NS_OK); } catch {}
      resolve(status);
    };
    try {
      const sts = Cc["@mozilla.org/network/socket-transport-service;1"].getService(Ci.nsISocketTransportService);
      transport = sts.createTransport([], address, port, null, null);
      transport.setTimeout(Ci.nsISocketTransport.TIMEOUT_CONNECT, Math.ceil(timeoutMs / 1000));
      transport.setEventSink({ onTransportStatus(_transport, status) {
        if (status === Ci.nsISocketTransport.STATUS_CONNECTED_TO) finish("up");
      } }, Services.tm.currentThread);
      // Opening the input stream starts the connect; nothing is ever read or written.
      const input = transport.openInputStream(0, 0, 0).QueryInterface(Ci.nsIAsyncInputStream);
      input.asyncWait({ onInputStreamReady(stream) {
        try { stream.available(); finish("up"); } catch (error) {
          // Accepted and then closed by the peer still means it answered.
          finish(error?.result === Cr.NS_BASE_STREAM_CLOSED ? "up" : "down");
        }
      } }, 0, 0, Services.tm.currentThread);
      timer = timers.setTimeout(() => finish("down"), timeoutMs);
    } catch { finish("unknown"); }
  });
}
