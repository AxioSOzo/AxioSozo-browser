/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Process-wide model for contexts, projects, site rules and the usage ledger
// (contexts-api-v1 §3.3). Pure logic comes from the contexts core; this module
// adds profile storage, static project detection through the checksum-pinned
// containment reader (ProjectDetection), port-to-folder arrival offers
// (ProjectArrival, ProjectRecords), on-request status checks of loopback
// services (TCP connect only; remote services are never contacted), the
// no-follow manifest write, project containers (ProjectContainers: one Gecko
// contextual identity per project, routed before any project tab exists) and
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
import { createProjectContainers, createGeckoIdentityAdapter } from "./ProjectContainers.sys.mjs";
import { canonicalContainerColor, projectContainerPresentation, PROJECT_CONTAINER_ICON } from "./ProjectAccountRuntime.sys.mjs";

export { MAX_LISTING_ENTRIES } from "./ProjectDetection.sys.mjs";
export const EVENT_NAMES = Object.freeze(["contexts", "projects", "rules", "ledger", "services", "attention"]);
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

export class ServicesError extends Error {
  constructor(code, message) { super(message ?? code); this.name = "ServicesError"; this.code = code; }
}

const clone = value => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
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
  // Routing marks: a monotonic value per project (and one for every project)
  // that changes synchronously when a store mutation that can change a
  // project's route starts and again when it settles, failed or not, plus the
  // mutations still in flight. Service memory only; never stored or sent.
  #routingSequence = 0; #routingAll = 0; #routingMarks = new Map(); #routingPending = new Map(); #routingPendingAll = 0;

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
   */
  constructor(deps = {}) {
    this.#deps = { clock: Date.now, localTime: defaultLocalTime, randomId: defaultRandomId,
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
    return () => {
      unsubscribe();
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
    this.#persistingContexts ??= this.#stores.contexts.update(current => ({ ...current }))
      .then(written => { this.#contextsNeedPersistence = false; return written; })
      .finally(() => { this.#persistingContexts = null; });
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
    return this.getProject(id);
  }

  /** Writes <root>/.axiosozo/project.json atomically without following links a
   * repository may have planted (writeManifestFile). Callers invoke this only
   * after the user explicitly confirmed the write in the Overview. */
  async writeManifest(projectId) {
    const project = await this.getProject(projectId);
    if (!project) fail("UNKNOWN_PROJECT");
    const manifest = core.validateManifest(project.manifest);
    core.assertNoSecrets(manifest);
    const path = await writeManifestFile(this.#fs(), project.root, core.MANIFEST_PATH, core.serializeManifest(manifest),
      this.#deps.randomId("tmp_"));
    await this.#routingMutation([projectId], () => this.#updateContexts(doc => ({ ...doc, projects: doc.projects.map(item => (item.id === projectId
      ? { ...item, manifest_state: "written", updated_at: this.#deps.clock() } : item)) }), ["projects"]));
    return { path };
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
   * and again when it settles, so an opening of those projects in flight stops. */
  async #routingMutation(projectIds, run) {
    this.#markRouting(projectIds, 1);
    try { return await run(); } finally { this.#markRouting(projectIds, -1); }
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
   * write; null when the project is gone or its mapping changed meanwhile. */
  async #assignContainer(projectId, userContextId, assignment) {
    let assigned = null;
    await this.#loadContexts();
    await this.#routingMutation([projectId], () => this.#stores.contexts.update(doc => {
      assigned = null;
      const current = doc.projects.find(item => item.id === projectId);
      if (!current) return doc;
      const next = this.#records.withBrowserAssignedContainer(current, userContextId, assignment);
      if (!next) return doc;
      assigned = next;
      return { ...doc, projects: doc.projects.map(item => (item.id === projectId ? next : item)) };
    }));
    if (!assigned) return null;
    this.#emit("projects");
    return clone(assigned);
  }

  /** Observer: Firefox deleted a container. In-flight routes stop at once; the
   * projects that named it lose the mapping (never the project or its data). */
  #identityDeleted(userContextId) {
    if (!this.#containers) return;
    let cleanup;
    try { cleanup = this.#containers.identityDeleted(userContextId); } catch { return; }
    this.#containerGeneration++;
    this.#failedDeletions.delete(userContextId);
    cleanup.catch(error => {
      this.#failedDeletions.add(userContextId);
      console.error("AxioSozo: deleted container still mapped; project links wait for a retry", error?.code ?? error);
    });
  }

  /** Observer and startup: containers were turned off. Every route stops at
   * once and every mapping is cleared; a failed cleanup blocks routing until a
   * retry succeeds (#containersReady). */
  #resetContainers() {
    if (!this.#containers) return Promise.resolve(0);
    this.#containerGeneration++;
    const run = this.#containers.identitiesReset();
    this.#containerReset = run;
    this.#containerResetFailed = false;
    run.then(() => {
      if (this.#containerReset === run) this.#containerReset = null;
      this.#emit("projects"); // views re-read availability once the cleanup is saved
    }, error => {
      if (this.#containerReset === run) { this.#containerReset = null; this.#containerResetFailed = true; }
      console.error("AxioSozo: container reset not saved; project links wait for a retry", error?.code ?? error);
    });
    return run;
  }

  /** Waits for a reset in flight and retries failed cleanups first; rejects
   * while they still fail, so nothing is routed against stale mappings. */
  async #containersReady() {
    if (this.#containerReset) await this.#containerReset.catch(() => {});
    if (this.#containerResetFailed) await this.#resetContainers();
    for (const id of [...this.#failedDeletions]) {
      this.#containerGeneration++;
      await this.#containers.identityDeleted(id);
      this.#failedDeletions.delete(id);
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
      if (availability !== "on") { out.push({ project_id: project.id, state: availability }); continue; }
      const id = project.container.user_context_id;
      const shared = id !== null && projects.some(other => other.id !== project.id && other.container?.user_context_id === id);
      let identity = null;
      if (id !== null && !shared) { try { identity = await this.#identities.get(id); } catch { identity = null; } }
      out.push(identity?.userContextId === id
        ? { project_id: project.id, state: "own", name: typeof identity.name === "string" ? identity.name : "", color: canonicalContainerColor(identity.color) }
        : { project_id: project.id, state: "pending" });
    }
    return out;
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
    if (!normal || !normalBrowser || tab.ownerGlobal !== window || tab.closing || tab.isConnected === false) fail("ARRIVAL_UNAVAILABLE");
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
  /** M1 sources only: a declared service found down by the last requested probe,
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
    onShutdown(flush) {
      const { AsyncShutdown } = ChromeUtils.importESModule("resource://gre/modules/AsyncShutdown.sys.mjs");
      AsyncShutdown.profileBeforeChange.addBlocker("AxioSozo: flush usage ledger", () => flush().catch(() => {}));
    },
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
    // canonical colours, the briefcase icon, no data-clearing removal.
    containerIdentities: () => {
      const { ContextualIdentityService, CONTAINER_COLORS } = ChromeUtils.importESModule("resource://gre/modules/ContextualIdentityService.sys.mjs");
      const colors = Array.isArray(CONTAINER_COLORS) ? CONTAINER_COLORS.map(entry => entry.name) : ContextualIdentityService.containerColors;
      return createGeckoIdentityAdapter({ service: ContextualIdentityService, allowedColors: colors, allowedIcons: [PROJECT_CONTAINER_ICON] });
    },
    containersEnabled: () => Services.prefs.getBoolPref(CONTAINERS_PREF, false),
    observeContainers: observeChromeContainers,
  };
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
