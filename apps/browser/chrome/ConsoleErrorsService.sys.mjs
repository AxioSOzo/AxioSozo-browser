/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free backend. No native observer, actor, DOM, cache replay or send effect.
import { ConsoleErrorsStore, ConsoleErrorsError, consoleDocumentId, consoleWebURL,
  validateConsolePacket, MAX_CONSOLE_TABS } from "./ConsoleErrors.sys.mjs";

export const CONSOLE_SERVICE_LIMITS = Object.freeze({ perSecond: 30, perDocument: 1000, recent: 5 });
const TAB = /^t_[1-9][0-9]{0,14}$/u, PROJECT = /^p_[a-z0-9]{4,32}$/u;
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/u;
const own = (object, name) => {
  const descriptor = object && typeof object === "object" ? Object.getOwnPropertyDescriptor(object, name) : null;
  return descriptor && Object.hasOwn(descriptor, "value") ? descriptor.value : undefined;
};
const ref = value => value !== null && (typeof value === "object" || typeof value === "function");
const integer = value => Number.isSafeInteger(value) && value >= 0;
const text = (value, max) => typeof value === "string" && value.length > 0 && value.length <= max && !CONTROL.test(value);
const fail = code => { throw new ConsoleErrorsError(code); };
const freeze = value => Object.freeze(value);
const captureControllers = new WeakMap();
let installed = null, nextToken = 0, nextLease = 0;
export const CONSOLE_CAPTURE_LEASE_MS = 1000;
export function createConsoleErrorsService(deps) {
  const service = new ConsoleErrorsService(deps);
  return freeze({ service, captures: captureControllers.get(service) });
}
export const getConsoleErrorsService = () => installed;
export function setConsoleErrorsService(value) {
  if (value !== null && !(value instanceof ConsoleErrorsService)) fail("INVALID_RUNTIME");
  installed = value;
}

const SAME = ["tab_id", "window", "tab", "windowGlobal", "browser", "permanentKey", "nativeBrowserId",
  "frameLoader", "browsingContext", "principal", "document_id", "navigation_id", "url",
  "project_id", "project_root", "project_revision", "route_revision", "binding_token"];
const same = (left, right) => SAME.every(key => left[key] === right[key]);

/**
 * Factory dependencies are trusted chrome functions, never page/actor input.
 * readPolicy supplies current native normal/private/top-level/document facts.
 * Password-at-capture is established only by trusted registered-actor glue,
 * completing its challenge through the separate chrome-private capture handle.
 * JSON claims never create a lease or retention permit.
 * readProjectAuthority must expose the current synchronous root/revision cache,
 * independently of enabling AgentChannelService, with an authoritative check().
 */
export class ConsoleErrorsService {
  #deps; #store; #states = new Map(); #listeners = new Set(); #closed = false; #epoch = 0;
  #leases = new WeakMap(); #pending = new Map(); #permits = new WeakMap(); #claims = new Map();
  #busy = new Set();
  constructor(deps = {}) {
    for (const key of ["clock", "isNormalWindow", "readPolicy", "readProjectAuthority", "isActorCurrent"])
      if (typeof deps[key] !== "function") fail("INVALID_DEPENDENCIES");
    for (const key of ["withTrusted", "withConsoleInventory"])
      if (typeof deps.registry?.[key] !== "function") fail("INVALID_DEPENDENCIES");
    this.#deps = deps;
    this.#store = new ConsoleErrorsStore({ clock: deps.clock });
    captureControllers.set(this, freeze({
      begin: (owner, actor, readOffer) => this.#begin(owner, actor, readOffer),
      complete: (lease, actor, readReply) => this.#complete(lease, actor, readReply),
      cancel: lease => this.#cancel(lease),
    }));
    this.#store.onChange(() => {
      const event = freeze({ name: "console" });
      for (const listener of [...this.#listeners]) { try { listener(event); } catch {} }
    });
  }
  onChange(callback) {
    if (this.#closed || typeof callback !== "function") fail("INVALID_CALLBACK");
    this.#listeners.add(callback);
    return () => this.#listeners.delete(callback);
  }
  #now() {
    const value = this.#deps.clock();
    if (!integer(value) || value >= Number.MAX_SAFE_INTEGER) fail("UNAVAILABLE");
    return value;
  }
  #normal(window) {
    if (this.#closed) fail("UNAVAILABLE");
    if (!ref(window) || this.#deps.isNormalWindow(window) !== true) fail("PRIVATE");
  }
  #authority(window, project_id) {
    if (!PROJECT.test(project_id ?? "")) fail("UNAVAILABLE");
    const authority = this.#deps.readProjectAuthority({ window, project_id });
    const check = own(authority, "check"), root = own(authority, "root"), revision = own(authority, "revision");
    if (own(authority, "id") !== project_id || !text(root, 4096) || !root.startsWith("/")
      || !integer(revision) || typeof check !== "function" || check() !== true) fail("PROJECT_CHANGED");
    return { project_id, project_root: root, project_revision: revision, check };
  }
  #policy(owner) {
    const window = own(owner, "window"), tab_id = own(owner, "tab_id"), tab = own(owner, "tab"),
      windowGlobal = own(owner, "windowGlobal");
    this.#normal(window);
    if (tab_id !== undefined && !TAB.test(tab_id)) fail("UNKNOWN_TAB");
    if (tab_id === undefined && !ref(tab)) fail("UNKNOWN_TAB");
    const policy = this.#deps.readPolicy(freeze({ window, tab_id, tab, windowGlobal }));
    // These cheap trusted policy facts precede registry lookup or packet input.
    if (own(policy, "normal") !== true || own(policy, "private") !== false) fail("PRIVATE");
    if (own(policy, "engine") !== "gecko") fail("UNAVAILABLE");
    if (own(policy, "blocked_category") !== false) fail("BLOCKED_CATEGORY");
    if (own(policy, "current") !== true || own(policy, "top_level") !== true
      || own(policy, "window") !== window) fail("STALE_TAB");
    const id = own(policy, "tab_id"), nativeTab = own(policy, "tab"), global = own(policy, "windowGlobal");
    const document_id = consoleDocumentId(own(policy, "document_id")), url = consoleWebURL(own(policy, "url"));
    const navigation_id = own(policy, "navigation_id"), project_id = own(policy, "project_id"),
      project_revision = own(policy, "project_revision"), route_revision = own(policy, "route_revision");
    if (!TAB.test(id ?? "") || tab_id !== undefined && id !== tab_id || !ref(nativeTab) || !ref(global)
      || tab !== undefined && nativeTab !== tab || windowGlobal !== undefined && global !== windowGlobal
      || !document_id || !url || !text(navigation_id, 256) || !integer(project_revision) || !integer(route_revision))
      fail("STALE_TAB");
    const authority = this.#authority(window, project_id);
    if (authority.project_revision !== project_revision) fail("PROJECT_CHANGED");
    return { window, tab_id: id, tab: nativeTab, windowGlobal: global, document_id, url: url.href,
      navigation_id, project_id, project_revision, route_revision, ...authority };
  }
  #trusted(policy, trusted) {
    const descriptor = own(trusted, "descriptor");
    const facts = { ...policy, descriptor, browser: own(trusted, "browser"),
      permanentKey: own(trusted, "permanentKey"), nativeBrowserId: own(trusted, "nativeBrowserId"),
      frameLoader: own(trusted, "frameLoader"), browsingContext: own(trusted, "browsingContext"),
      principal: own(trusted, "principal"), binding_token: own(descriptor, "binding_token") };
    if (own(trusted, "tab_id") !== policy.tab_id || own(trusted, "window") !== policy.window
      || own(trusted, "tab") !== policy.tab || own(trusted, "windowGlobal") !== policy.windowGlobal
      || own(descriptor, "private") !== false || own(descriptor, "engine") !== "gecko"
      || own(descriptor, "document_id") !== policy.document_id || own(descriptor, "url") !== policy.url
      || own(descriptor, "project_id") !== policy.project_id
      || own(descriptor, "project_revision") !== policy.project_revision
      || own(descriptor, "route_revision") !== policy.route_revision
      || !text(facts.binding_token, 64) || ![facts.browser, facts.permanentKey, facts.frameLoader,
        facts.browsingContext, facts.principal].every(ref) || !integer(facts.nativeBrowserId)
      || facts.nativeBrowserId < 1) return null;
    return facts;
  }
  #sample(owner) {
    const policy = this.#policy(owner);
    const sample = this.#deps.registry.withTrusted(policy.tab_id, trusted => {
      const facts = this.#trusted(policy, trusted);
      if (!facts) return null;
      const current = this.#policy(owner);
      return same(facts, { ...facts, ...current }) ? facts : null;
    });
    if (!sample) fail("STALE_TAB");
    return sample;
  }
  #current(sample) {
    try {
      const owner = { window: sample.window, tab_id: sample.tab_id, tab: sample.tab, windowGlobal: sample.windowGlobal };
      const policy = this.#policy(owner); // native normal/private/project before lookup again
      if (!same(sample, { ...sample, ...policy }) || sample.check() !== true) return false;
      return this.#deps.registry.withTrusted(sample.tab_id, trusted => {
        const facts = this.#trusted(policy, trusted);
        return !!facts && same(sample, facts) && sample.check() === true && policy.check() === true;
      }, { expected: sample.descriptor }) === true;
    } catch { return false; }
  }
  #readCurrent(sample, state, token) {
    const live = () => state === this.#states.get(sample.tab_id) && !state.revoked && state.token === token;
    return live() && this.#current(sample) && live();
  }
  #token() {
    if (nextToken >= Number.MAX_SAFE_INTEGER) fail("UNAVAILABLE");
    return "n_" + (++nextToken);
  }
  #dropCapture(tab_id) {
    const lease = this.#pending.get(tab_id), permit = this.#claims.get(tab_id);
    if (lease) this.#leases.delete(lease);
    if (permit) this.#permits.delete(permit);
    this.#pending.delete(tab_id); this.#claims.delete(tab_id);
  }
  #deny(tab_id) {
    this.#dropCapture(tab_id);
    const state = this.#states.get(tab_id);
    if (state && !state.revoked) {
      this.#epoch++;
      state.revoked = true;
      state.token = this.#token();
      try { state.not_before = Math.max(state.not_before, this.#now() + 1); }
      catch { state.not_before = Number.MAX_SAFE_INTEGER; }
    }
    this.#store.forgetTab(tab_id);
  }
  #sync(sample) {
    let state = this.#states.get(sample.tab_id);
    if (!state && this.#states.size >= MAX_CONSOLE_TABS) fail("UNAVAILABLE");
    const changed = !!state && (state.revoked || !same(state.sample, sample));
    if (!state || changed) {
      const now = this.#now();
      const budget = state && state.sample.windowGlobal === sample.windowGlobal
        && state.sample.document_id === sample.document_id ? state.budget : { at: now, recent: 0, total: 0 };
      const floor = Math.max(state?.not_before ?? 0, now + 1);
      const next = { sample, token: this.#token(), not_before: floor, revoked: false, budget };
      // Rotate before clearing: a reentrant callback cannot replay the old grant.
      this.#dropCapture(sample.tab_id);
      this.#epoch++;
      this.#states.set(sample.tab_id, next);
      this.#store.forgetTab(sample.tab_id);
      state = next;
    } else state.sample = sample;
    const snapshot = this.#snapshot(sample), token = state.token;
    if (!this.#store.updateTab(snapshot) || !this.#readCurrent(sample, state, token)) {
      this.#deny(sample.tab_id); fail("STALE_TAB");
    }
    return state;
  }
  #snapshot(sample) {
    return { tab_id: sample.tab_id, document_id: sample.document_id, url: sample.url,
      project_id: sample.project_id, private: false, engine: "gecko" };
  }
  #admit(owner) {
    try { const sample = this.#sample(owner); return { sample, state: this.#sync(sample) }; }
    catch (error) {
      const id = own(owner, "tab_id"), window = own(owner, "window"), tab = own(owner, "tab");
      for (const [candidate, state] of this.#states)
        if (state.sample.window === window && (id === candidate || id === undefined && tab === state.sample.tab))
          this.#deny(candidate);
      throw error;
    }
  }
  authorize(owner) {
    try {
      const { sample, state } = this.#admit(owner);
      return freeze({ enabled: true, document_id: sample.document_id,
        navigation_token: state.token, not_before: state.not_before });
    } catch { return freeze({ enabled: false }); }
  }
  #charge(state) {
    const now = this.#now(), budget = state.budget;
    if (now < budget.at) return false;
    if (now - budget.at >= 1000) { budget.at = now; budget.recent = 0; }
    if (budget.recent >= CONSOLE_SERVICE_LIMITS.perSecond || budget.total >= CONSOLE_SERVICE_LIMITS.perDocument) return false;
    budget.recent++; budget.total++;
    return true;
  }
  #actorCurrent(scope, actor) {
    return actor === scope.actor && this.#readCurrent(scope.sample, scope.state, scope.token)
      && this.#deps.isActorCurrent(actor, freeze({ window: scope.sample.window, tab: scope.sample.tab,
        windowGlobal: scope.sample.windowGlobal, tab_id: scope.sample.tab_id })) === true
      && this.#readCurrent(scope.sample, scope.state, scope.token);
  }
  #fresh(scope) {
    const now = this.#now();
    if (now < scope.issued_at || now > scope.deadline || !this.#actorCurrent(scope, scope.actor)) return false;
    const after = this.#now();
    return after >= scope.issued_at && after <= scope.deadline;
  }
  #offer(value, sample, state) {
    const fields = ["v", "offer_id", "document_id", "observed_at"];
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Object.keys(descriptors).length !== fields.length || fields.some(name =>
      !descriptors[name] || !Object.hasOwn(descriptors[name], "value"))) return null;
    const offer = Object.fromEntries(fields.map(name => [name, descriptors[name].value]));
    const now = this.#now();
    return offer.v === 1 && text(offer.offer_id, 64) && offer.document_id === sample.document_id
      && Number.isFinite(offer.observed_at) && offer.observed_at >= state.not_before
      && offer.observed_at <= now + 1000 ? freeze(offer) : null;
  }
  #begin(owner, actor, readOffer) {
    const id = own(owner, "tab_id");
    if (!TAB.test(id ?? "") || !ref(actor) || typeof readOffer !== "function" || this.#busy.has(id)) return null;
    // Reserve before native callbacks: they may synchronously try another offer.
    this.#busy.add(id);
    let sample;
    try {
      const admitted = this.#admit(owner); sample = admitted.sample;
      const { state } = admitted, token = state.token;
      for (const capability of [this.#pending.get(sample.tab_id), this.#claims.get(sample.tab_id)]) {
        const previous = this.#leases.get(capability) ?? this.#permits.get(capability);
        if (previous && this.#fresh(previous)) return null;
        if (capability) this.#dropCapture(sample.tab_id);
      }
      const issued_at = this.#now(), scope = { sample, state, token, actor, issued_at,
        deadline: issued_at + CONSOLE_CAPTURE_LEASE_MS };
      if (!integer(scope.deadline) || !this.#actorCurrent(scope, actor) || !this.#charge(state)
        || !this.#fresh(scope)) return null;
      const offer = this.#offer(readOffer(), sample, state);
      if (!offer || !this.#fresh(scope)) return null;
      if (nextLease >= Number.MAX_SAFE_INTEGER) return null;
      scope.offer = offer; scope.lease_id = "cl_" + (++nextLease);
      const lease = freeze(Object.create(null));
      this.#leases.set(lease, scope); this.#pending.set(sample.tab_id, lease);
      return freeze({ lease, challenge: freeze({ v: 1, lease_id: scope.lease_id,
        offer_id: offer.offer_id, document_id: sample.document_id,
        navigation_token: token, not_before: state.not_before, url: sample.url }) });
    } catch { if (sample) this.#deny(sample.tab_id); return null; }
    finally { this.#busy.delete(id); }
  }
  #cancel(lease) {
    const scope = ref(lease) ? this.#leases.get(lease) : null;
    if (!scope) return false;
    this.#leases.delete(lease);
    if (this.#pending.get(scope.sample.tab_id) === lease) this.#pending.delete(scope.sample.tab_id);
    return true;
  }
  #complete(lease, actor, readReply) {
    const scope = ref(lease) ? this.#leases.get(lease) : null;
    if (!scope) return null;
    const id = scope.sample.tab_id;
    if (this.#busy.has(id)) return null;
    // Consume once, but reserve the tab while checking/reentrant callbacks run.
    this.#busy.add(id); this.#leases.delete(lease);
    try {
      if (typeof readReply !== "function" || actor !== scope.actor || this.#pending.get(id) !== lease) return null;
      if (!this.#fresh(scope)) { this.#deny(id); return null; }
      const reply = readReply(), fields = ["v", "lease_id", "offer_id", "packet"];
      if (!reply || typeof reply !== "object" || Array.isArray(reply)) return null;
      const descriptors = Object.getOwnPropertyDescriptors(reply);
      if (Object.keys(descriptors).length !== fields.length || fields.some(name =>
        !descriptors[name] || !Object.hasOwn(descriptors[name], "value"))) return null;
      if (own(reply, "v") !== 1 || own(reply, "lease_id") !== scope.lease_id
        || own(reply, "offer_id") !== scope.offer.offer_id) return null;
      const packet = validateConsolePacket(own(reply, "packet"));
      if (!packet || packet.document_id !== scope.sample.document_id || packet.navigation_token !== scope.token
        || packet.observed_at !== scope.offer.observed_at) return null;
      if (!this.#fresh(scope)) { this.#deny(id); return null; }
      if (this.#pending.get(id) !== lease) return null;
      const permit = freeze(Object.create(null));
      this.#permits.set(permit, { ...scope, packet: freeze(packet) }); this.#claims.set(id, permit);
      return permit;
    } catch { return null; }
    finally {
      if (this.#pending.get(id) === lease) this.#pending.delete(id);
      this.#busy.delete(id);
    }
  }
  acceptCapture(permit) {
    const scope = ref(permit) ? this.#permits.get(permit) : null;
    if (!scope) return false;
    this.#permits.delete(permit);
    const id = scope.sample.tab_id;
    if (this.#claims.get(id) === permit) this.#claims.delete(id);
    try {
      if (!this.#fresh(scope)) { this.#deny(id); return false; }
      const recorded = this.#store.record(this.#snapshot(scope.sample), scope.packet);
      if (!this.#fresh(scope)) { this.#deny(id); return false; }
      return recorded;
    } catch { this.#deny(id); return false; }
  }
  readTab(owner) {
    const { sample, state } = this.#admit(owner), token = state.token, epoch = this.#epoch;
    const result = this.#store.getTabErrors(this.#snapshot(sample));
    if (!this.#readCurrent(sample, state, token) || epoch !== this.#epoch) {
      this.#deny(sample.tab_id); fail("STALE_TAB");
    }
    return result;
  }
  onNavigation(owner) {
    const id = own(owner, "tab_id"), window = own(owner, "window"), state = this.#states.get(id);
    if (!state || state.sample.window !== window) return false;
    this.#deny(id);
    return true; // budget survives same-document navigation and revocation
  }
  invalidateProjects() {
    for (const id of [...this.#states.keys()]) this.#deny(id);
  }
  #inventory() {
    const entries = this.#deps.registry.withConsoleInventory(value => value);
    if (!Array.isArray(entries) || entries.length > 4096) return null;
    const ids = entries.map(entry => own(entry, "tab_id"));
    if (ids.some(id => !TAB.test(id ?? "")) || new Set(ids).size !== ids.length) return null;
    return entries; // Never treat uncertain inventory as empty/removal.
  }
  #prune(entries) {
    const keep = new Set(entries.map(entry => own(entry, "tab_id")));
    for (const id of [...this.#states.keys()]) if (!keep.has(id)) {
      this.#dropCapture(id); this.#epoch++;
      this.#store.forgetTab(id); this.#states.delete(id);
    }
  }
  refresh() {
    if (this.#closed) return false;
    const entries = this.#inventory();
    if (!entries) return false;
    for (const entry of entries) {
      const id = own(entry, "tab_id"), window = own(entry, "window");
      try { this.#admit({ window, tab_id: id }); } catch { this.#deny(id); }
    }
    this.#prune(entries);
    return true;
  }
  #collect(window, project_id = null) {
    this.#normal(window);
    const authority = project_id === null ? null : this.#authority(window, project_id);
    const entries = this.#inventory();
    if (!entries) fail("UNAVAILABLE");
    const collected = [];
    for (const entry of entries) {
      const id = own(entry, "tab_id");
      if (own(entry, "window") !== window) continue;
      try {
        const { sample, state } = this.#admit({ window, tab_id: id }), token = state.token;
        if (project_id !== null && sample.project_id !== project_id) continue;
        const result = this.#store.getTabErrors(this.#snapshot(sample));
        collected.push({ sample, state, token, result });
      } catch { this.#deny(id); }
    }
    this.#prune(entries);
    const epoch = this.#epoch;
    this.#normal(window);
    if (authority) {
      const current = this.#authority(window, project_id);
      if (current.project_root !== authority.project_root || current.project_revision !== authority.project_revision) fail("PROJECT_CHANGED");
    }
    if (collected.some(({ sample, state, token }) => !this.#readCurrent(sample, state, token))
      || epoch !== this.#epoch) fail("STALE_TAB");
    return collected;
  }
  readProject(params) {
    const window = own(params, "window"), project_id = own(params, "project_id");
    if (!PROJECT.test(project_id ?? "")) return null;
    try {
      const collected = this.#collect(window, project_id);
      const messages = collected.flatMap(({ result }) => result.messages);
      messages.sort((left, right) => right.at - left.at);
      return freeze({ count: messages.length, recent: freeze(messages.slice(0, CONSOLE_SERVICE_LIMITS.recent)
        .map(({ level, text }) => freeze({ level, text }))) });
    } catch { return null; }
  }
  readCounts(params) {
    const window = own(params, "window");
    try {
      const collected = this.#collect(window), counts = new Map();
      for (const { sample, result } of collected) {
        if (!result.count) continue;
        const count = counts.get(sample.project_id) ?? { project_id: sample.project_id, count: 0, errors: 0, warnings: 0, tabs: 0 };
        count.count += result.count; count.tabs++;
        for (const message of result.messages) count[message.level === "error" ? "errors" : "warnings"]++;
        counts.set(sample.project_id, count);
      }
      return freeze([...counts.values()].map(freeze));
    } catch { return null; }
  }
  readHandoff(params) {
    const window = own(params, "window"), tab = own(params, "tab"), windowGlobal = own(params, "windowGlobal");
    const { sample, state } = this.#admit({ window, tab, windowGlobal }), token = state.token, epoch = this.#epoch;
    for (const key of ["url", "document_id", "navigation_id", "project_id", "project_root", "project_revision"])
      if (own(params, key) !== sample[key]) fail(key.startsWith("project_") ? "PROJECT_CHANGED" : "STALE_TAB");
    const result = this.#store.getTabErrors(this.#snapshot(sample));
    if (!this.#readCurrent(sample, state, token) || epoch !== this.#epoch) {
      this.#deny(sample.tab_id); fail("STALE_TAB");
    }
    return freeze({ tab_id: sample.tab_id, document_id: sample.document_id, navigation_id: sample.navigation_id,
      url: sample.url, console_errors: freeze(result.messages.map(message => freeze({ ...message,
        line: message.line > 10000000 ? null : message.line }))) });
  }
  dispose() {
    if (this.#closed) return;
    for (const id of [...this.#states.keys()]) this.#dropCapture(id);
    captureControllers.delete(this);
    this.#epoch++; this.#closed = true; this.#states.clear(); this.#store.dispose(); this.#listeners.clear();
    if (installed === this) installed = null;
  }
}
