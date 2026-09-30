/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Process-wide model for contexts, projects, site rules and the usage ledger
// (contexts-api-v1 §3.3). Pure logic comes from the contexts core; this module
// adds profile storage, the allowlisted project-file reads, on-request status
// checks of loopback services (TCP connect only; remote services are never
// contacted), the no-follow manifest write and events. Every Zen call goes
// through ZenWorkspaceAdapter.
// All methods except on()/registerWindow() return promises of JSON data.

// Relative specifiers resolve to chrome://browser/content/axiosozo/… in the JAR;
// Node tests map ./contexts/ to packages/contexts/src (tests/support/chrome-modules.mjs).
import * as core from "./contexts/index.mjs";
import { JsonStore, profileStorage } from "./JsonStore.sys.mjs";
import { isContextEngine } from "./EngineRegistry.sys.mjs";

export const EVENT_NAMES = Object.freeze(["contexts", "projects", "rules", "ledger", "services", "attention"]);
export const STORE_FILES = Object.freeze({ contexts: "contexts.json", rules: "site-rules.json", ledger: "usage-ledger.json" });
export const PROBE_MIN_INTERVAL_MS = 5000;
export const PROBE_TIMEOUT_MS = 2000;
export const LEDGER_FLUSH_MS = 30000;
// Distinct (day, host, context) entries kept in memory while the ledger file
// cannot be written (for example an invalid file the user has to resolve).
export const MAX_PENDING_LEDGER = 4096;
const DAY_MS = 86400000;
const CONTEXT_TYPES = ["personal", "organization", "project"];
// Only services on this machine are ever contacted, and only by a TCP connect to
// a loopback address on the declared port. URL.hostname keeps IPv6 brackets.
const LOOPBACK_ADDRESSES = Object.freeze({ "localhost": ["127.0.0.1", "::1"], "127.0.0.1": ["127.0.0.1"], "[::1]": ["::1"] });
const LEDGER_HOST = /^[a-z0-9.-]{1,253}$/u;
const WORKSPACE_UUID = /^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}?$/u;
// Directory entries looked at per listed parent in the workspace phase (§2.2).
export const MAX_LISTING_ENTRIES = 512;

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

function metadataRecord(uuid, now) {
  return { version: 1, workspace_uuid: uuid, type: "personal", organization_uuid: null,
    project_id: null, engine_preference: null, updated_at: now };
}

export class AxioSozoServices {
  #deps; #stores; #listeners = new Map(); #windows = new Map();
  #serviceStatus = new Map(); #lastProbe = new Map(); #probing = new Map(); #pendingLedger = new Map(); #effectiveLedger = null;
  #flushTimer = null; #prunedDay = null; #detectCache = new Map(); #contextsFileIsV1 = false;

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
   */
  constructor(deps = {}) {
    this.#deps = { clock: Date.now, localTime: defaultLocalTime, randomId: defaultRandomId,
      timers: globalThis, ...deps };
    const storageFor = this.#deps.storageFor ?? (name => profileStorage(name));
    this.#stores = {
      // contexts.json v1 (contexts[].project_id) is read through the pure
      // migration; the first load writes the v2 document back atomically.
      contexts: new JsonStore({ storage: storageFor(STORE_FILES.contexts),
        validate: value => {
          if (value?.version === 1) this.#contextsFileIsV1 = true;
          return core.migrateContextStore(value);
        }, empty: core.DEFAULT_CONTEXT_STORE }),
      rules: new JsonStore({ storage: storageFor(STORE_FILES.rules),
        validate: core.validateRuleStore, empty: core.DEFAULT_RULE_STORE }),
      ledger: new JsonStore({ storage: storageFor(STORE_FILES.ledger),
        validate: core.validateLedger, empty: core.DEFAULT_LEDGER }),
    };
    try { this.#deps.onShutdown?.(() => this.flushLedger()); }
    catch (error) { console.error("AxioSozo: ledger shutdown flush not registered", error); }
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
  /** The validated v2 contexts document. A v1 file is migrated on read and
   * written back as v2 once (atomic JsonStore write); a failed write is retried
   * on the next load and never loses the v1 file. */
  async #loadContexts() {
    const doc = await this.#stores.contexts.load();
    if (this.#contextsFileIsV1) {
      this.#contextsFileIsV1 = false;
      try { return await this.#stores.contexts.update(current => ({ ...current })); }
      catch (error) { this.#contextsFileIsV1 = true; console.error("AxioSozo: contexts.json v2 write failed", error); }
    }
    return doc;
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
      engine_preference: meta?.engine_preference ?? null,
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
    await this.#updateContexts(doc => {
      if (projectId === null) {
        let next = doc;
        for (const project of doc.projects) if (project.context_uuid === uuid) next = this.#placeProject(next, project.id, null);
        return next;
      }
      if (!doc.projects.some(project => project.id === projectId)) fail("UNKNOWN_PROJECT");
      return this.#placeProject(doc, projectId, uuid);
    }, ["contexts", "projects"]);
    return this.getContext(uuid);
  }

  async setEnginePreference(uuid, engine) {
    this.#requireLive(uuid);
    if (engine !== null && !isContextEngine(engine)) fail("INVALID_ENGINE");
    await this.#updateContexts(doc => this.#upsertMeta(doc, uuid, { engine_preference: engine }));
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
    await this.#updateContexts(doc => {
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
    }, ["contexts", "projects"]);
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

  /** Static, read-only detection (§6.1, contexts-api-v1 §2.1–§2.2), two phases:
   * 1. only DETECTION_FILES under root, each a regular file ≤ MAX_FILE_BYTES,
   *    refusing symlinks that leave the root;
   * 2. for workspaces: the names of the immediate child directories of the
   *    parents the core plans (nothing below them is opened), then only
   *    PACKAGE_DETECTION_FILES in the package directories the core expands.
   * Same lstat/realpath/size refusal policy in both phases; never executes. */
  async detect(root) {
    const fs = this.#fs();
    if (typeof root !== "string" || !root.startsWith("/") || root.includes("\0")) fail("INVALID_ROOT");
    const rootInfo = await fs.lstat(root);
    if (!rootInfo) fail("ROOT_NOT_FOUND");
    const rootReal = await fs.realpath(root);
    const rootStat = rootInfo.type === "symlink" ? await fs.stat(rootReal) : rootInfo;
    if (rootStat?.type !== "directory") fail("ROOT_NOT_DIRECTORY");
    const files = {}; const refused = [];
    for (const relative of core.DETECTION_FILES) {
      if (!core.isAllowedPath(relative)) { refused.push({ path: relative, reason: "not_allowlisted" }); continue; }
      const result = await this.#readAllowlisted(fs, rootReal, relative,
        (resolvedPath, target) => core.detectionRefusal({ path: relative, resolvedPath, isFile: target.type === "regular", size: target.size }));
      if (result.text !== undefined) files[relative] = result.text;
      else if (result.reason) refused.push({ path: relative, reason: result.reason });
    }
    const packages = await this.#readWorkspace(fs, rootReal, files);
    const draft = core.detectProject({ rootName: fs.basename(root), files, refused, packages });
    this.#detectCache.set(root, files[core.MANIFEST_PATH] ?? null);
    return clone(draft);
  }

  /** Phase 2 (§2.2). Returns { [dir]: { files, refused } } for packages with
   * anything readable or refused. */
  async #readWorkspace(fs, rootReal, rootFiles) {
    if (typeof fs.listDirectory !== "function") return {};
    const plan = core.workspaceCandidates(rootFiles);
    const prefix = rootReal.endsWith("/") ? rootReal : rootReal + "/";
    const listing = {};
    for (const parent of plan.list.slice(0, 16)) {
      const names = await this.#listChildDirectories(fs, rootReal, prefix, parent);
      if (names) listing[parent] = names;
    }
    const packages = {};
    for (const dir of core.expandWorkspaceGlobs(plan.patterns, listing).slice(0, core.MAX_WORKSPACE_PACKAGES)) {
      if (!core.isPackageDir(dir)) continue;
      const files = {}; const refused = [];
      for (const rel of core.PACKAGE_DETECTION_FILES) {
        if (!core.isAllowedPackagePath(dir, rel)) continue;
        const result = await this.#readAllowlisted(fs, rootReal, `${dir}/${rel}`,
          (resolvedPath, target) => core.packageDetectionRefusal({ dir, path: rel, resolvedPath,
            isFile: target.type === "regular", size: target.size }));
        if (result.text !== undefined) files[rel] = result.text;
        else if (result.reason) refused.push({ path: rel, reason: result.reason });
      }
      if (Object.keys(files).length || refused.length) packages[dir] = { files, refused };
    }
    return packages;
  }

  /** Names of the immediate child directories (and symlinks, which phase 2
   * re-checks) of one planned parent inside the root; null when the parent is
   * absent, not a directory or resolves outside the root. Nothing below the
   * children is opened or stat'ed. */
  async #listChildDirectories(fs, rootReal, prefix, parent) {
    if (typeof parent !== "string" || (parent && !core.isPackageDir(parent))) return null;
    const full = parent ? fs.join(rootReal, parent) : rootReal;
    try {
      if (parent) {
        if (!await fs.lstat(full)) return null;
        const real = await fs.realpath(full);
        if (!real.startsWith(prefix)) return null;
        if ((await fs.stat(real))?.type !== "directory") return null;
      }
      const entries = await fs.listDirectory(full, MAX_LISTING_ENTRIES);
      return entries.slice(0, MAX_LISTING_ENTRIES)
        .filter(entry => entry && (entry.type === "directory" || entry.type === "symlink") && typeof entry.name === "string")
        .map(entry => entry.name);
    } catch { return null; }
  }

  async #readAllowlisted(fs, rootReal, relative, refusalFor) {
    const full = fs.join(rootReal, relative);
    let info;
    try { info = await fs.lstat(full); } catch { return { reason: "unreadable" }; }
    if (!info) return {}; // absent: nothing to report
    let real;
    try { real = await fs.realpath(full); } catch { return { reason: "unreadable" }; }
    // Covers a symlinked leaf and any symlinked intermediate directory.
    const prefix = rootReal.endsWith("/") ? rootReal : rootReal + "/";
    if (!real.startsWith(prefix)) return { reason: "symlink_outside_root" };
    const target = info.type === "symlink" ? await fs.stat(real).catch(() => null) : info;
    if (!target) return { reason: "unreadable" };
    // An in-root symlink may only resolve to another allowlisted file, so
    // `package.json -> .env` is refused before anything is opened.
    const refusal = refusalFor(real.slice(prefix.length), target);
    if (refusal) return { reason: refusal };
    let bytes;
    try { bytes = await fs.read(real, core.MAX_FILE_BYTES + 1); } catch { return { reason: "unreadable" }; }
    // TOCTOU: a directory or leaf swapped for a link between the check and the
    // read changes the resolved path; nothing read that way is used.
    try {
      if (await fs.realpath(real) !== real || await fs.realpath(full) !== real) return { reason: "unreadable" };
    } catch { return { reason: "unreadable" }; }
    if (bytes.length > core.MAX_FILE_BYTES) return { reason: "too_large" };
    try { return { text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) }; }
    catch { return { reason: "invalid_utf8" }; }
  }

  async confirmProject({ root, manifest, contextUuid = null } = {}) {
    if (typeof root !== "string" || !root.startsWith("/")) fail("INVALID_ROOT");
    const validManifest = core.validateManifest(manifest);
    core.assertNoSecrets(validManifest);
    if (contextUuid !== null) this.#requireLive(contextUuid);
    const fs = this.#deps.fs;
    if (fs) {
      const info = await fs.lstat(root);
      const stat = info?.type === "symlink" ? await fs.stat(await fs.realpath(root)) : info;
      if (stat?.type !== "directory") fail("ROOT_NOT_DIRECTORY");
    }
    const repoText = this.#detectCache.get(root);
    let external = false;
    if (repoText) {
      try { external = core.serializeManifest(core.parseManifest(repoText)) === core.serializeManifest(validManifest); }
      catch { external = false; }
    }
    const now = this.#deps.clock();
    const id = this.#deps.randomId("p_");
    const project = { version: 1, id, root, manifest: clone(validManifest),
      manifest_state: external ? "external" : "none", context_uuid: null, trusted: false,
      created_at: now, updated_at: now };
    await this.#updateContexts(doc => {
      if (doc.projects.some(item => item.root === root)) fail("PROJECT_EXISTS");
      if (doc.projects.some(item => item.id === id)) fail("DUPLICATE_PROJECT_ID");
      // Any space may hold the project; its type (a label) is left as it is.
      const next = { ...doc, projects: [...doc.projects, project] };
      return contextUuid !== null ? this.#placeProject(next, id, contextUuid) : next;
    }, ["projects", "contexts"]);
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
    await this.#updateContexts(doc => ({ ...doc, projects: doc.projects.map(item => (item.id === projectId
      ? { ...item, manifest_state: "written", updated_at: this.#deps.clock() } : item)) }), ["projects"]);
    return { path };
  }

  async updateProject(id, patch = {}) {
    const allowed = ["manifest", "context_uuid"];
    if (!patch || typeof patch !== "object" || Object.keys(patch).some(key => !allowed.includes(key)))
      fail("INVALID_PROJECT_PATCH");
    let manifest;
    if ("manifest" in patch) { manifest = core.validateManifest(patch.manifest); core.assertNoSecrets(manifest); }
    if ("context_uuid" in patch && patch.context_uuid !== null) this.#requireLive(patch.context_uuid);
    await this.#updateContexts(doc => {
      const existing = doc.projects.find(item => item.id === id);
      if (!existing) fail("UNKNOWN_PROJECT");
      let next = doc;
      if (manifest) {
        next = { ...next, projects: next.projects.map(item => (item.id === id
          ? { ...item, manifest: clone(manifest), updated_at: this.#deps.clock() } : item)) };
      }
      if ("context_uuid" in patch && patch.context_uuid !== existing.context_uuid) {
        next = this.#placeProject(next, id, patch.context_uuid);
      }
      return next;
    }, ["projects", "contexts"]);
    this.#serviceStatus.delete(id);
    return this.getProject(id);
  }

  async removeProject(id) {
    await this.#updateContexts(doc => {
      if (!doc.projects.some(item => item.id === id)) fail("UNKNOWN_PROJECT");
      const now = this.#deps.clock();
      return { ...doc, projects: doc.projects.filter(item => item.id !== id),
        contexts: doc.contexts.map(meta => (meta.project_id === id ? { ...meta, project_id: null, updated_at: now } : meta)) };
    }, ["projects", "contexts", "attention"]);
    this.#serviceStatus.delete(id);
    return { removed: true };
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
   * current one. openUrl(url, { contextUuid, window }) or openUrl({ url, contextUuid, window }). */
  async openUrl(urlOrOptions, options = {}) {
    const { url, contextUuid = null, window } = typeof urlOrOptions === "object" && urlOrOptions !== null
      ? urlOrOptions : { ...options, url: urlOrOptions };
    const parsed = URL.parse(String(url));
    if (!parsed || !["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password)
      fail("INVALID_URL");
    let target = contextUuid;
    if (target !== null) this.#requireLive(target);
    else {
      const owner = (await this.projectForUrl(parsed.href))?.project.context_uuid ?? null;
      if (owner && this.#liveWorkspaces().has(owner)) target = owner;
    }
    const adapter = this.#adapterFor(window);
    if (!adapter) fail("NO_WINDOW");
    await adapter.openTab(parsed.href, { workspaceUuid: target });
    return { opened: true };
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
  };
}

function localFile(path) {
  const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
  file.initWithPath(path);
  return file;
}

/** Minimal filesystem seam: lstat without following the leaf, realpath, bounded
 * read, and the no-follow write primitives used by writeManifestFile. */
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
    async read(path, maxBytes) {
      return IOUtils.read(path, { maxBytes });
    },
    /** Names and no-follow types of a directory's entries (workspace phase):
     * IOUtils.getChildren lists names only; each entry is lstat'ed through
     * nsIFile.isSymlink() before isDirectory(), so a link is reported as a link
     * and nothing below an entry is touched. At most `limit` entries. */
    async listDirectory(path, limit = MAX_LISTING_ENTRIES) {
      const children = await IOUtils.getChildren(path, { ignoreAbsent: true });
      const entries = [];
      for (const child of children.slice(0, limit)) {
        const file = localFile(child);
        let type = "other";
        try {
          if (file.isSymlink()) type = "symlink";
          else if (file.isDirectory()) type = "directory";
        } catch { continue; }
        entries.push({ name: PathUtils.filename(child), type });
      }
      return entries;
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
