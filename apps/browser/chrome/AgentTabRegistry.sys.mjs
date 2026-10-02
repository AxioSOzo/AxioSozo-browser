// DOM-free chrome-owned metadata registry. Callbacks read native facts only.
export const MAX_PUBLIC_TAB_NUMBER = 999_999_999_999_999;
export const MAX_PUBLIC_USER_CONTEXT_ID = 4_294_967_294;
const PUBLIC_ID = /^t_[1-9][0-9]{0,14}$/u;
const PROJECT_ID = /^p_[a-z0-9]{4,32}$/u;
const WORKSPACE_ID = /^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}?$/u;
const CONTROLS = /[\u0000-\u001f\u007f-\u009f]/u;
const reference = value => value !== null && (typeof value === 'object' || typeof value === 'function');
const safeInteger = value => Number.isSafeInteger(value) && value >= 0;
const positive = value => Number.isSafeInteger(value) && value > 0;
const field = (value, name) => {
  if (!reference(value)) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(value, name);
  return descriptor && Object.hasOwn(descriptor, 'value') ? descriptor.value : undefined;
};
const record = (value, fields) => reference(value) && !Array.isArray(value) &&
  fields.every(name => Object.hasOwn(Object.getOwnPropertyDescriptors(value), name) &&
    Object.hasOwn(Object.getOwnPropertyDescriptor(value, name), 'value'));
const synchronous = value => !reference(value) || typeof value.then !== 'function';
const documentId = value => {
  if (positive(value)) return String(value);
  if (typeof value !== 'string' || !/^[1-9][0-9]{0,15}$/u.test(value)) return null;
  return positive(Number(value)) && String(Number(value)) === value ? value : null;
};
const workspaceId = value => value === null || typeof value === 'string' && WORKSPACE_ID.test(value) &&
  value.startsWith('{') === value.endsWith('}');
const text = (value, max) => typeof value === 'string' && value.length <= max && !CONTROLS.test(value);
export class TabRegistryError extends Error {
  constructor(code) { super(code); this.name = 'TabRegistryError'; this.code = code; }
}
export function createTabIdAllocator({ startAt = 0, max = MAX_PUBLIC_TAB_NUMBER } = {}) {
  if (!safeInteger(startAt) || !positive(max) || max > MAX_PUBLIC_TAB_NUMBER || startAt > max)
    throw new TabRegistryError('INVALID_INPUT');
  let current = startAt;
  return () => current < max ? ++current : null;
}
const processTabIds = createTabIdAllocator();
let processBindingNumber = 0;
function nextBindingNumber() {
  if (processBindingNumber >= Number.MAX_SAFE_INTEGER) throw new TabRegistryError('UNAVAILABLE');
  return ++processBindingNumber;
}
/** Unknown policy values deny. Core/BiDi need a boolean, never object truthiness. */
export function createSensitiveHostPredicate(classifyHost, { mode = 'decision' } = {}) {
  if (typeof classifyHost !== 'function' || !['boolean', 'decision'].includes(mode))
    throw new TabRegistryError('INVALID_DEPENDENCIES');
  return hostname => {
    try {
      if (!text(hostname, 253) || !hostname) return true;
      const value = classifyHost(hostname);
      if (!synchronous(value)) return true;
      if (mode === 'boolean') return typeof value === 'boolean' ? value : true;
      const sensitive = field(value, 'sensitive');
      return typeof sensitive === 'boolean' ? sensitive : true;
    } catch { return true; }
  };
}
const ownerEqual = (left, right) => ['tab', 'window', 'browser', 'permanentKey', 'nativeBrowserId']
  .every(key => left[key] === right[key]);
const bindingEqual = (left, right) => ownerEqual(left, right) && [
  'frameLoader', 'browsingContext', 'windowGlobal', 'principal', 'document_id', 'url',
  'engine', 'userContextId', 'project_id', 'project_revision', 'route_revision', 'contextUuid',
].every(key => left[key] === right[key]);
const publicProjection = value => Object.freeze({ tab_id: value.tab_id, url: value.url,
  title: value.title, active: value.active, project_id: value.project_id, engine: value.engine });
const REQUIRED = ['isPrivateWindow', 'isWindowRegistered', 'isWindowClosed', 'isTabLive',
  'getBrowser', 'isPrivateBrowser', 'getBrowserIdentity', 'getContextState', 'getCurrentDocument',
  'getDocumentState', 'getDocumentURL', 'getTitle', 'getEngine', 'isActiveTab', 'getRoute',
  'getProjectRevision', 'matchProject', 'classifyHost'];

export class AgentTabRegistry {
  #runtime; #allocate; #maxTabs; #entries = new Map(); #byTab = new WeakMap();
  #expected = new WeakMap(); #projectFloor = -1; #closed = false; #reading = false; #epoch = 0; #lastNumber = 0;
  constructor(runtime, { allocateId = processTabIds, maxTabs = 2048, sensitivityMode = 'decision' } = {}) {
    if (REQUIRED.some(name => typeof runtime?.[name] !== 'function') || typeof allocateId !== 'function' ||
        !positive(maxTabs) || maxTabs > 4096) throw new TabRegistryError('INVALID_DEPENDENCIES');
    this.#runtime = runtime; this.#allocate = allocateId; this.#maxTabs = maxTabs;
    Object.defineProperty(this, 'isSensitiveHost', { value: createSensitiveHostPredicate(host => runtime.classifyHost(host), { mode: sensitivityMode }) });
  }
  #retire(entry) {
    if (!entry || this.#entries.get(entry.id) !== entry) return false;
    this.#entries.delete(entry.id); this.#byTab.delete(entry.tab);
    entry.binding = null; entry.metadata = null; entry.owner = null;
    entry.tab = null; entry.window = null; this.#epoch++;
    entry.version = nextBindingNumber();
    return true;
  }
  #sample(tab, window, owner = null) {
    const r = this.#runtime;
    // No tab, browser, context, document, URI, title or project getter before this.
    if (r.isPrivateWindow(window) !== false) return null;
    const registered = r.isWindowRegistered(window);
    if (registered === false) return { retired: true };
    if (registered !== true) return null;
    const closed = r.isWindowClosed(window);
    if (closed === true) return { retired: true };
    if (closed !== false) return null;
    const live = r.isTabLive(tab, window);
    if (live === false) return { retired: true };
    if (live !== true) return null;
    const browser = r.getBrowser(tab, window);
    if (!reference(browser) || !synchronous(browser)) return null;
    if (r.isPrivateBrowser(browser) !== false) return null;
    const identity = r.getBrowserIdentity(browser);
    if (!record(identity, ['nativeBrowserId', 'permanentKey', 'browsingContext', 'frameLoader',
      'frameLoaderOwner', 'frameLoaderContext'])) return null;
    const nativeBrowserId = field(identity, 'nativeBrowserId'), permanentKey = field(identity, 'permanentKey');
    const browsingContext = field(identity, 'browsingContext'), frameLoader = field(identity, 'frameLoader');
    if (!positive(nativeBrowserId) || !reference(permanentKey) || !reference(browsingContext) || !reference(frameLoader) ||
        field(identity, 'frameLoaderOwner') !== browser || field(identity, 'frameLoaderContext') !== browsingContext) return null;
    if (owner && (owner.browser !== browser || owner.permanentKey !== permanentKey || owner.nativeBrowserId !== nativeBrowserId)) return { retired: true };
    const context = r.getContextState(browsingContext);
    if (!record(context, ['isContent', 'top', 'isDiscarded', 'private', 'privateBrowsingId', 'userContextId', 'embedder'])) return null;
    const userContextId = field(context, 'userContextId');
    if (field(context, 'isContent') !== true || field(context, 'top') !== browsingContext ||
        field(context, 'isDiscarded') !== false || field(context, 'private') !== false ||
        field(context, 'privateBrowsingId') !== 0 || field(context, 'embedder') !== browser ||
        !safeInteger(userContextId) || userContextId > MAX_PUBLIC_USER_CONTEXT_ID) return null;
    const engine = r.getEngine(tab, browser);
    if (!['gecko', 'chromium'].includes(engine)) return null;
    const windowGlobal = r.getCurrentDocument(browsingContext);
    if (!reference(windowGlobal)) return null;
    const document = r.getDocumentState(windowGlobal, browsingContext);
    if (!record(document, ['browsingContext', 'isCurrentGlobal', 'isClosed', 'failedChannel', 'document_id',
      'principal', 'isSystemPrincipal', 'isNullPrincipal', 'privateBrowsingId', 'userContextId'])) return null;
    const document_id = documentId(field(document, 'document_id')), principal = field(document, 'principal');
    if (field(document, 'browsingContext') !== browsingContext || field(document, 'isCurrentGlobal') !== true ||
        field(document, 'isClosed') !== false || field(document, 'failedChannel') !== null || !document_id ||
        !reference(principal) || field(document, 'isSystemPrincipal') !== false || field(document, 'isNullPrincipal') !== false ||
        field(document, 'privateBrowsingId') !== 0 || field(document, 'userContextId') !== userContextId) return null;
    const url = r.getDocumentURL(windowGlobal, browser);
    if (!text(url, 8192) || !url) return null;
    let parsed;
    try { parsed = new URL(url); } catch { return null; }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password ||
        this.isSensitiveHost(parsed.hostname) !== false) return null;
    const active = r.isActiveTab(tab, window);
    if (typeof active !== 'boolean') return null;
    const route = r.getRoute(tab, window);
    if (!record(route, ['contextUuid', 'revision']) || !workspaceId(field(route, 'contextUuid')) ||
        !safeInteger(field(route, 'revision'))) return null;
    const contextUuid = field(route, 'contextUuid'), route_revision = field(route, 'revision');
    const project_revision = r.getProjectRevision();
    if (!safeInteger(project_revision) || project_revision < this.#projectFloor) return null;
    const match = r.matchProject(Object.freeze({ url, engine, userContextId, contextUuid, nativeBrowserId,
      document_id, project_revision, route_revision }));
    if (!record(match, ['project_id', 'ambiguous', 'revision']) || typeof field(match, 'ambiguous') !== 'boolean' ||
        field(match, 'revision') !== project_revision ||
        !(field(match, 'project_id') === null || typeof field(match, 'project_id') === 'string' &&
          PROJECT_ID.test(field(match, 'project_id')))) return null;
    const project_id = field(match, 'ambiguous') ? null : field(match, 'project_id');
    return { tab, window, browser, permanentKey, nativeBrowserId, frameLoader, browsingContext,
      windowGlobal, principal, document_id, userContextId, url, engine, active, contextUuid,
      project_id, project_revision, route_revision };
  }
  #read(tab, window, entry = null) {
    if (this.#closed || this.#reading) return null;
    const epoch = this.#epoch;
    this.#reading = true;
    try {
      const before = this.#sample(tab, window, entry?.owner);
      if (before?.retired) { if (entry) this.#retire(entry); return null; }
      if (!before || entry && before.route_revision < entry.routeFloor) return null;
      if (entry && !ownerEqual(entry.owner, before)) { this.#retire(entry); return null; }
      const title = this.#runtime.getTitle(tab, before.browser, before.windowGlobal);
      if (!text(title, 4096)) return null;
      const after = this.#sample(tab, window, entry?.owner);
      if (after?.retired) { if (entry) this.#retire(entry); return null; }
      if (!after || !bindingEqual(before, after) || before.active !== after.active || this.#epoch !== epoch) return null;
      if (entry && this.#entries.get(entry.id) !== entry) return null;
      return { ...after, title };
    } catch { return null; }
    finally { this.#reading = false; }
  }
  #project(entry, read) {
    if (read.project_revision < this.#projectFloor || read.route_revision < entry.routeFloor) throw new TabRegistryError('UNAVAILABLE');
    this.#projectFloor = read.project_revision; entry.routeFloor = read.route_revision;
    if (!entry.binding || !bindingEqual(entry.binding, read)) entry.version = nextBindingNumber();
    entry.binding = read;
    entry.metadata = Object.freeze({ ...publicProjection({ ...read, tab_id: entry.id }), private: false,
      document_id: read.document_id, userContextId: read.userContextId, binding_token: `b_${entry.version}`,
      project_revision: read.project_revision, route_revision: read.route_revision });
    this.#expected.set(entry.metadata, { entry, version: entry.version });
    return entry.metadata;
  }
  #refresh(id, expected) {
    if (this.#closed || this.#reading || typeof id !== 'string' || !PUBLIC_ID.test(id)) return null;
    const entry = this.#entries.get(id);
    if (!entry) return null;
    if (expected !== undefined) {
      const issued = reference(expected) && this.#expected.get(expected);
      if (!issued || issued.entry !== entry || issued.version !== entry.version) return null;
    }
    const read = this.#read(entry.tab, entry.window, entry);
    if (!read) { entry.binding = null; entry.metadata = null; return null; }
    try {
      const result = this.#project(entry, read);
      if (expected !== undefined && result.binding_token !== expected.binding_token) return null;
      return result;
    } catch { entry.binding = null; entry.metadata = null; return null; }
  }
  register(tab, window) {
    if (this.#closed || this.#reading || !reference(tab) || !reference(window)) return null;
    let entry = this.#byTab.get(tab);
    if (entry && entry.window !== window) { this.#retire(entry); entry = null; }
    if (entry) {
      const refreshed = this.#refresh(entry.id);
      if (refreshed) return refreshed.tab_id;
      if (this.#entries.get(entry.id) === entry) return null;
      entry = null; // Ownership changed: issue a fresh ID after complete validation.
    }
    if (this.#entries.size >= this.#maxTabs) return null;
    const read = this.#read(tab, window);
    if (!read) return null;
    let number; const epoch = this.#epoch;
    try { number = this.#allocate(); } catch { return null; }
    if (this.#closed || this.#epoch !== epoch || !positive(number) || number > MAX_PUBLIC_TAB_NUMBER || number <= this.#lastNumber) return null;
    this.#lastNumber = number;
    entry = { id: `t_${number}`, tab, window, owner: { tab, window, browser: read.browser, permanentKey: read.permanentKey, nativeBrowserId: read.nativeBrowserId }, binding: null, metadata: null, version: 0, routeFloor: -1 };
    this.#entries.set(entry.id, entry); this.#byTab.set(tab, entry); this.#epoch++;
    try { this.#project(entry, read); return entry.id; }
    catch { this.#retire(entry); return null; }
  }
  metadata(id, { expected } = {}) { return this.#refresh(id, expected); }
  snapshot(id, options) { const value = this.metadata(id, options); return value ? publicProjection(value) : null; }
  get(id, options) { return this.snapshot(id, options); }
  listMetadata() {
    if (this.#closed || this.#reading) return Object.freeze([]);
    const epoch = this.#epoch;
    const result = [...this.#entries.keys()].map(id => this.#refresh(id)).filter(Boolean);
    if (this.#epoch !== epoch || result.some(value => {
      const issued = this.#expected.get(value);
      return !issued || this.#entries.get(value.tab_id) !== issued.entry || issued.entry.version !== issued.version;
    })) return Object.freeze([]);
    if (result.length) {
      let revision; this.#reading = true;
      try { revision = this.#runtime.getProjectRevision(); }
      catch { return Object.freeze([]); }
      finally { this.#reading = false; }
      if (!safeInteger(revision) || result.some(value => value.project_revision !== revision)) return Object.freeze([]);
    }
    if (this.#epoch !== epoch || result.some(value => {
      const issued = this.#expected.get(value);
      return !issued || this.#entries.get(value.tab_id) !== issued.entry || issued.entry.version !== issued.version;
    })) return Object.freeze([]);
    // Runtime active facts must describe one global current tab, not one per window.
    return Object.freeze(result.filter(value => value.active).length > 1 ? [] : result);
  }
  list() { return Object.freeze(this.listMetadata().map(publicProjection)); }
  withTrusted(id, callback, { expected } = {}) {
    if (typeof callback !== 'function') throw new TabRegistryError('INVALID_INPUT');
    const metadata = this.#refresh(id, expected);
    if (!metadata) return null;
    const entry = this.#entries.get(id), value = entry?.binding;
    if (!value) return null;
    const epoch = this.#epoch;
    const trusted = Object.freeze({ tab_id: id, descriptor: metadata, tab: value.tab, window: value.window,
      browser: value.browser, permanentKey: value.permanentKey, nativeBrowserId: value.nativeBrowserId,
      frameLoader: value.frameLoader, browsingContext: value.browsingContext,
      windowGlobal: value.windowGlobal, principal: value.principal, contextUuid: value.contextUuid });
    let result;
    try { result = callback(trusted); if (!synchronous(result)) return null; }
    catch { return null; }
    return this.#epoch === epoch && this.#refresh(id, metadata) ? result : null;
  }
  withTrustedList(callback) {
    if (typeof callback !== 'function') throw new TabRegistryError('INVALID_INPUT');
    const metadata = this.listMetadata(), epoch = this.#epoch, entries = [];
    for (const value of metadata) {
      const entry = this.#entries.get(value.tab_id), read = entry?.binding;
      if (!read) return null;
      entries.push(Object.freeze({ tab_id: value.tab_id, tab: read.tab, window: read.window,
        contextUuid: read.contextUuid, descriptor: value }));
    }
    let result;
    try { result = callback(Object.freeze(entries)); if (!synchronous(result)) return null; }
    catch { return null; }
    return this.#epoch === epoch && metadata.every(value => this.#refresh(value.tab_id, value)) ? result : null;
  }
  #consoleOwner(entry) {
    if (this.#closed || this.#reading || this.#entries.get(entry.id) !== entry) return null;
    const r = this.#runtime, epoch = this.#epoch;
    this.#reading = true;
    try {
      const privateWindow = r.isPrivateWindow(entry.window);
      const registered = r.isWindowRegistered(entry.window);
      if (registered === false) { this.#retire(entry); return null; }
      if (registered !== true) return null;
      const closed = r.isWindowClosed(entry.window);
      if (closed === true) { this.#retire(entry); return null; }
      if (closed !== false) return null;
      let contextUuid = null, route_revision = null;
      // Denied-but-live entries are cleanup/tombstone inventory, never permission.
      // Unknown/private windows do not cause a tab/browser/document getter here.
      if (privateWindow === false) {
        const live = r.isTabLive(entry.tab, entry.window);
        if (live === false) { this.#retire(entry); return null; }
        if (live !== true) return null;
        const browser = r.getBrowser(entry.tab, entry.window);
        if (!reference(browser) || !synchronous(browser)) return null;
        const privateBrowser = r.isPrivateBrowser(browser);
        if (privateBrowser === false) {
          const identity = r.getBrowserIdentity(browser);
          if (!record(identity, ['nativeBrowserId', 'permanentKey', 'browsingContext', 'frameLoader', 'frameLoaderOwner', 'frameLoaderContext']) ||
              !positive(field(identity, 'nativeBrowserId')) || !reference(field(identity, 'permanentKey')) ||
              !reference(field(identity, 'browsingContext')) || !reference(field(identity, 'frameLoader')) ||
              field(identity, 'frameLoaderOwner') !== browser || field(identity, 'frameLoaderContext') !== field(identity, 'browsingContext')) return null;
          if (browser !== entry.owner.browser || field(identity, 'nativeBrowserId') !== entry.owner.nativeBrowserId ||
              field(identity, 'permanentKey') !== entry.owner.permanentKey) { this.#retire(entry); return null; }
          const route = r.getRoute(entry.tab, entry.window);
          if (record(route, ['contextUuid', 'revision']) && workspaceId(field(route, 'contextUuid')) &&
              safeInteger(field(route, 'revision')) && field(route, 'revision') >= entry.routeFloor)
            { contextUuid = field(route, 'contextUuid'); route_revision = field(route, 'revision'); }
        } else if (privateBrowser !== true || browser !== entry.owner.browser) return null;
      }
      if (this.#epoch !== epoch || this.#entries.get(entry.id) !== entry) return null;
      return Object.freeze({ tab_id: entry.id, tab: entry.tab, window: entry.window, contextUuid, route_revision });
    } catch { return null; }
    finally { this.#reading = false; }
  }
  #consoleInventory() {
    const placeholder = entry => Object.freeze({ tab_id: entry.id, tab: null, window: null,
      contextUuid: null, route_revision: null });
    if (this.#closed) return Object.freeze([]);
    if (this.#reading) return Object.freeze([...this.#entries.values()].map(placeholder));
    // Confirmed removals may change the epoch. Retry the remaining ownership set;
    // uncertain live slots retain inert IDs so console freshness is not erased.
    for (let attempt = 0; attempt < 2; attempt++) {
      const epoch = this.#epoch, result = [];
      for (const entry of [...this.#entries.values()]) {
        const value = this.#consoleOwner(entry);
        if (value) result.push(value);
        else if (this.#entries.get(entry.id) === entry) result.push(placeholder(entry));
      }
      if (this.#epoch === epoch) return Object.freeze(result);
    }
    return Object.freeze([...this.#entries.values()].map(placeholder));
  }
  withConsoleInventory(callback) {
    if (typeof callback !== 'function') throw new TabRegistryError('INVALID_INPUT');
    const entries = this.#consoleInventory(), epoch = this.#epoch;
    let result;
    try { result = callback(entries); if (!synchronous(result)) return null; }
    catch { return null; }
    const current = this.#consoleInventory();
    const same = this.#epoch === epoch && current.length === entries.length && entries.every((value, index) => {
      const now = current[index];
      return value.tab_id === now.tab_id && value.tab === now.tab && value.window === now.window &&
        value.contextUuid === now.contextUuid && value.route_revision === now.route_revision;
    });
    // The console getter's identity projection receives the current safe inventory
    // after a removal, never null-as-empty for unrelated still-live tombstones.
    return same ? result : result === entries ? current : null;
  }
  invalidate(id) {
    const entry = this.#entries.get(id);
    if (!entry) return false;
    entry.version = nextBindingNumber(); entry.binding = null; entry.metadata = null; this.#epoch++;
    return true;
  }
  forget(idOrTab) {
    const entry = typeof idOrTab === 'string' ? this.#entries.get(idOrTab) : reference(idOrTab) ? this.#byTab.get(idOrTab) : null;
    return this.#retire(entry);
  }
  forgetWindow(window) {
    let count = 0;
    for (const entry of [...this.#entries.values()]) if (entry.window === window && this.#retire(entry)) count++;
    return count;
  }
  reconcile(inventory) {
    if (this.#closed) return Object.freeze({ registered: Object.freeze([]), retired: Object.freeze([]) });
    if (!Array.isArray(inventory) || inventory.length > 4096) throw new TabRegistryError('INVALID_INPUT');
    const live = new Map(), duplicate = new Set();
    for (const value of inventory) {
      if (!record(value, ['tab', 'window']) || !reference(field(value, 'tab')) || !reference(field(value, 'window')))
        throw new TabRegistryError('INVALID_INPUT');
      const tab = field(value, 'tab'), window = field(value, 'window');
      if (live.has(tab)) duplicate.add(tab);
      else live.set(tab, window);
    }
    for (const tab of duplicate) live.delete(tab);
    const beforeIds = [...this.#entries.keys()];
    for (const entry of [...this.#entries.values()]) if (live.get(entry.tab) !== entry.window) {
      this.#retire(entry);
    }
    const registered = [];
    for (const [tab, window] of live) { const id = this.register(tab, window); if (id) registered.push(id); }
    return Object.freeze({ registered: Object.freeze(registered.filter(id => this.#entries.has(id))),
      retired: Object.freeze(beforeIds.filter(id => !this.#entries.has(id))) });
  }
  close() {
    this.#closed = true;
    for (const entry of [...this.#entries.values()]) this.#retire(entry);
    this.#byTab = new WeakMap(); this.#expected = new WeakMap(); this.#epoch++;
  }
}
