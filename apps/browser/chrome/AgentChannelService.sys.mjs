/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free process service. Every window/presenter, native factory and eventual
// browser tool is injected by trusted chrome. Nothing starts on construction.
import { AgentChannelController, CHANNEL_METHODS, projectForPath } from "./AgentChannelCore.sys.mjs";
import { AgentChannelEndpoint } from "./AgentChannelTransport.sys.mjs";
import { createProjectAgentActivity } from "./ProjectAgentActivity.sys.mjs";

export const AGENT_SERVICE_LIMITS = Object.freeze({ projects: 128, projectLoadMs: 3000,
  nativeConfigMs: 3000, endpointStartMs: 15000, cleanupMs: 1500, configBytes: 65536, presenters: 64 });
const EMPTY = Object.freeze([]);
const STATES = new Set(["disabled", "starting", "listening", "in_use", "blocked", "unavailable"]);
const CODE = /^[A-Z][A-Z0-9_]{0,63}$/u;
const PROJECT = /^p_[a-z0-9]{4,32}$/u;
const SESSION = /^s_[0-9a-f]{16}$/u;
const encoder = new TextEncoder();
const freeze = value => {
  if (value && typeof value === "object") { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
  return value;
};
const error = code => Object.assign(new Error(code), { code });
const reason = value => typeof value === "string" && CODE.test(value) ? value : "UNAVAILABLE";
const copy = value => freeze(JSON.parse(JSON.stringify(value)));
const ownFunction = (value, name) => typeof Object.getOwnPropertyDescriptor(value ?? {}, name)?.value === "function";
const required = (value, names) => { for (const name of names) if (typeof value?.[name] !== "function") throw error("INVALID_RUNTIME"); };

/** Contexts policy returns an object; the channel requires a boolean. */
export function channelSensitiveHost(policy, host) {
  if (typeof policy !== "function" || typeof host !== "string" || !host.length || host.length > 253
      || /[\u0000-\u0020\u007f]/u.test(host)) return true;
  try {
    const result = policy(host);
    return result && typeof result.sensitive === "boolean" ? result.sensitive : true;
  } catch { return true; }
}

/**
 * Caller must create one instance with the existing processSingleton. The only
 * enabling entry point is setEnabled(true), called after the normal privileged
 * Settings action. No actor can supply dependencies, a path or a presenter.
 * Mandatory core validators are injected from the existing contexts package.
 */
export function createAgentChannelService(deps = {}) {
  required(deps, ["loadProjects", "validateProject", "validateStatusRecord", "parseHookEvent",
    "now", "randomHex", "isSensitiveHost", "createNativeConfiguration", "createTransportRuntime"]);
  required(deps.timers, ["setTimeout", "clearTimeout"]);
  let closed = false, wanted = false, generation = 0, cacheGeneration = 0;
  let cache = EMPTY, cacheReady = false, cacheState = freeze({ state: "empty", reason: null, generation: 0, count: 0 });
  let endpoint = null, nativeConfiguration = null, lifetime = null, cleanupJob = null, cleanupBlocked = false;
  let queue = Promise.resolve(), order = 0, eventSequence = 0;
  let state = freeze({ state: "disabled", reason: null });
  let tools = null, lastOwnership = null;
  const listeners = new Set(), presenters = new Map(), presentations = new Set(), configClosures = new WeakMap();
  const shutdown = new AbortController();
  const timers = deps.timers;
  const emit = event => {
    const envelope = copy({ ...event, sequence: ++eventSequence });
    for (const listener of [...listeners]) { try { Promise.resolve(listener(envelope)).catch(() => {}); } catch { /* observer isolation */ } }
    try { Promise.resolve(deps.onChange?.(envelope)).catch(() => {}); } catch { /* observer isolation */ }
  };
  const endpointState = value => {
    const next = { state: STATES.has(value?.state) ? value.state : "unavailable",
      reason: value?.reason === null || value?.reason === undefined ? null : reason(value.reason) };
    if (next.state === "listening" && typeof value.socketPath === "string") next.socketPath = value.socketPath;
    const changed = JSON.stringify(state) !== JSON.stringify(next);
    state = freeze(next);
    if (changed) emit({ kind: "endpoint", enabled: wanted, ...state });
  };
  function timeout(promise, ms, { signal, late } = {}) {
    return new Promise((resolve, reject) => {
      let settled = false, timer;
      const finish = (fn, value) => {
        if (settled) return false;
        settled = true; timers.clearTimeout(timer); signal?.removeEventListener("abort", abort); fn(value); return true;
      };
      const abort = () => finish(reject, error("CANCELLED"));
      timer = timers.setTimeout(() => finish(reject, error("TIMEOUT")), ms);
      if (signal?.aborted) abort();
      else signal?.addEventListener("abort", abort, { once: true });
      Promise.resolve(promise).then(value => {
        if (!finish(resolve, value)) { try { Promise.resolve(late?.(value)).catch(() => {}); } catch { /* late owned cleanup */ } }
      }, cause => finish(reject, cause));
    });
  }
  const eligible = entry => {
    try { return !closed && presenters.get(entry.key) === entry && entry.presenter.isNormal() === true; }
    catch { return false; }
  };
  const recentPresenter = () => [...presenters.values()].filter(eligible).sort((a, b) => b.order - a.order)[0] ?? null;
  const activity = createProjectAgentActivity({ getProjects: () => cacheReady ? cache : null,
    validateStatusRecord: deps.validateStatusRecord, now: deps.now, timers,
    onChange: event => emit({ kind: "activity", reason: event?.reason === undefined || event?.reason === null ? null : reason(event.reason) }) });

  async function requestApproval(view, { cwd, signal } = {}) {
    if (closed || !wanted || !cacheReady || signal?.aborted || view?.client?.name !== "agent-bridge") return false;
    const project = cache.find(value => value.id === view.project_id);
    if (!project || projectForPath(cache, cwd)?.id !== project.id) return false;
    const entry = recentPresenter();
    if (!entry || typeof entry.presenter.requestApproval !== "function") return false;
    const revision = cacheGeneration, currentGeneration = generation, abort = new AbortController();
    let settleAbort;
    const cancelled = new Promise(resolve => { settleAbort = () => { abort.abort(); resolve(false); }; });
    const presentation = { entry, abort, cancel: settleAbort };
    presentations.add(presentation);
    signal?.addEventListener("abort", settleAbort, { once: true });
    const valid = () => !closed && wanted && generation === currentGeneration && cacheReady && cacheGeneration === revision
      && !signal?.aborted && !abort.signal.aborted && eligible(entry) && cache.some(value => value.id === project.id && value.root === project.root);
    try {
      if (!valid()) return false;
      const approved = await Promise.race([cancelled,
        Promise.resolve().then(() => valid() ? entry.presenter.requestApproval(copy(view), { cwd, signal: abort.signal }) : false)]);
      return approved === true && valid();
    } catch { return false; }
    finally {
      presentations.delete(presentation); signal?.removeEventListener("abort", settleAbort); abort.abort();
    }
  }
  const available = method => {
    try { return !closed && wanted && cacheReady && tools?.isMethodAvailable?.(method) === true; }
    catch { return false; }
  };
  const controller = new AgentChannelController({ now: deps.now, setTimeout: timers.setTimeout, clearTimeout: timers.clearTimeout,
    randomHex: deps.randomHex, getProjects: () => cache, parseHookEvent: deps.parseHookEvent,
    isSensitiveHost: host => channelSensitiveHost(deps.isSensitiveHost, host), requestApproval,
    onStatus(record, projectId) {
      if (closed || !wanted || !cacheReady || !activity.accept(record, projectId)) throw error("PROJECT_CHANGED");
      // Presentation is independent of acceptance. No hook waits for a click.
      if (closed || !wanted || !cacheReady) return;
      const group = activity.snapshot(projectId)[0];
      const project = cache.find(value => value.id === projectId);
      // An activity observer can synchronously revoke project/channel authority.
      // Accepted RAM history survives hidden, but no stale notification follows.
      if (closed || !wanted || !cacheReady || !group?.latest || !project || group.project_path !== project.root) return;
      const entry = recentPresenter();
      if (entry && typeof entry.presenter.onStatus === "function") {
        try { Promise.resolve(entry.presenter.onStatus(copy({ project_id: projectId, latest: group.latest }))).catch(() => {}); }
        catch { /* status remains accepted */ }
      }
    },
    onStateChange(event) { emit({ ...event, kind: "session" }); },
    onSessionClosed(view, code) {
      try { return tools?.releaseSession?.(view.session, code); } catch { return undefined; }
    },
    listTabs: () => tools?.listTabs?.() ?? EMPTY,
    getTab: id => tools?.getTab?.(id) ?? null,
    isMethodAvailable: available,
    executeMethod: (...args) => {
      if (typeof tools?.executeMethod !== "function") throw error("UNAVAILABLE");
      return tools.executeMethod(...args);
    },
    confirmAction: (...args) => typeof tools?.confirmAction === "function" ? tools.confirmAction(...args) : false,
  });
  const cancelPresentations = () => { for (const item of [...presentations]) item.cancel(); };

  function invalidateProjects() {
    if (closed) return cacheGeneration;
    ++cacheGeneration; cache = EMPTY; cacheReady = false;
    cacheState = freeze({ state: "loading", reason: null, generation: cacheGeneration, count: 0 });
    // Before a store write begins, no cached project may keep session authority.
    cancelPresentations(); controller.stop();
    emit({ kind: "projects", ...cacheState });
    return cacheGeneration;
  }
  async function refreshProjects() {
    if (closed) throw error("CLOSED");
    const revision = invalidateProjects();
    try {
      const values = await timeout(Promise.resolve().then(() => deps.loadProjects()), AGENT_SERVICE_LIMITS.projectLoadMs, { signal: shutdown.signal });
      if (closed || revision !== cacheGeneration) return cacheState;
      if (!Array.isArray(values) || values.length > AGENT_SERVICE_LIMITS.projects) throw error("PROJECT_CACHE_UNAVAILABLE");
      const next = values.map(value => deps.validateProject(value));
      if (new Set(next.map(value => value.id)).size !== next.length || new Set(next.map(value => value.root)).size !== next.length)
        throw error("PROJECT_CACHE_UNAVAILABLE");
      // The validator returns trusted copies; cloning also freezes the array and
      // does not retain a caller-mutable loader object.
      cache = copy(next); cacheReady = true;
      cacheState = freeze({ state: "ready", reason: null, generation: revision, count: cache.length });
      activity.synchronizeProjects(); emit({ kind: "projects", ...cacheState });
    } catch (cause) {
      if (!closed && revision === cacheGeneration) {
        cache = EMPTY; cacheReady = false;
        cacheState = freeze({ state: "unavailable", reason: reason(cause?.code), generation: revision, count: 0 });
        emit({ kind: "projects", ...cacheState });
      }
    }
    return cacheState;
  }
  function closeConfiguration(config) {
    if (!config || typeof config !== "object") return Promise.resolve();
    if (configClosures.has(config)) return configClosures.get(config);
    const promise = Promise.resolve().then(() => config.close?.());
    configClosures.set(config, promise);
    promise.catch(() => {});
    return promise;
  }
  function beginCleanup(owned, config) {
    if (!owned && !config) return Promise.resolve();
    if (cleanupJob?.endpoint === owned && cleanupJob.config === config) return cleanupJob.promise;
    const promise = Promise.resolve().then(async () => {
      if (owned) await owned.stop();
      await closeConfiguration(config);
      // Preserve actual terminal receipts before releasing these owned objects.
      // A read never starts, waits for, kills or probes any native resource.
      lastOwnership = readOwnership(owned, config, false);
    });
    const job = { endpoint: owned, config, promise };
    cleanupJob = job;
    promise.then(() => {
      if (cleanupJob !== job) return;
      cleanupJob = null; cleanupBlocked = false;
      if (endpoint === owned) endpoint = null;
      if (nativeConfiguration === config) nativeConfiguration = null;
      if (state.reason === "CLEANUP_INCOMPLETE") endpointState(closed || !wanted ? { state: "disabled", reason: null } : { state: "unavailable", reason: "RETRY_REQUIRED" });
      emit({ kind: "cleanup", complete: true, reason: null });
    }, () => {
      if (cleanupJob !== job) return;
      // Retain the endpoint/claim; a later explicit enable retries owned stop,
      // never binds on the strength of a failed cleanup promise.
      cleanupJob = null; cleanupBlocked = true;
      emit({ kind: "cleanup", complete: false, reason: "CLEANUP_INCOMPLETE" });
    });
    return promise;
  }
  async function stopOwned() {
    cancelPresentations(); controller.stop(); lifetime?.abort(); lifetime = null;
    if (!endpoint && !nativeConfiguration) return !cleanupBlocked;
    try { await timeout(beginCleanup(endpoint, nativeConfiguration), AGENT_SERVICE_LIMITS.cleanupMs); return !cleanupBlocked; }
    catch { cleanupBlocked = true; endpointState({ state: "unavailable", reason: "CLEANUP_INCOMPLETE" }); return false; }
  }
  async function transition(enabled, revision) {
    // Every disable is honored, including one queued before a later enable.
    if (!enabled) {
      const clean = await stopOwned();
      if (clean && (closed || !wanted)) endpointState({ state: "disabled", reason: null });
      return snapshot();
    }
    if (closed || !wanted || revision !== generation) return snapshot();
    if (!await stopOwned() || closed || !wanted || revision !== generation) return snapshot();
    if (!cacheReady) await refreshProjects();
    if (closed || !wanted || revision !== generation) return snapshot();
    if (!cacheReady) { endpointState({ state: "unavailable", reason: "PROJECT_CACHE_UNAVAILABLE" }); return snapshot(); }
    const abort = new AbortController(); lifetime = abort;
    endpointState({ state: "starting", reason: null });
    let owned = null;
    try {
      const config = await timeout(Promise.resolve().then(() => {
        if (closed || !wanted || revision !== generation || abort.signal.aborted) throw error("CANCELLED");
        return deps.createNativeConfiguration({ signal: abort.signal });
      }), AGENT_SERVICE_LIMITS.nativeConfigMs, { signal: abort.signal,
        late: closeConfiguration });
      nativeConfiguration = config;
      if (closed || !wanted || revision !== generation || abort.signal.aborted) { await stopOwned(); return snapshot(); }
      if (!config || typeof config.socketPath !== "string" || !config.exactPosixBackend) throw error("NATIVE_CONFIGURATION_UNAVAILABLE");
      const runtime = deps.createTransportRuntime({ exactPosixBackend: config.exactPosixBackend });
      owned = new AgentChannelEndpoint({ runtime, controller, onStateChange: event => {
        if (owned && endpoint === owned && !closed) endpointState(event);
      } });
      endpoint = owned; nativeConfiguration = config;
      await timeout(owned.start({ enabled: true, socketPath: config.socketPath }),
        AGENT_SERVICE_LIMITS.endpointStartMs, { signal: abort.signal });
      if (closed || !wanted || revision !== generation || abort.signal.aborted) {
        await stopOwned(); return snapshot();
      }
      const outcome = owned.status;
      endpointState(outcome);
      if (outcome.state !== "listening") {
        await stopOwned();
        if (!cleanupBlocked && !closed && wanted && revision === generation) endpointState(outcome);
      }
    } catch (cause) {
      abort.abort();
      if (owned || nativeConfiguration) await stopOwned();
      if (!closed && wanted && revision === generation && !cleanupBlocked)
        endpointState({ state: "unavailable", reason: reason(cause?.code) });
    }
    return snapshot();
  }
  function readOwnership(owned = endpoint, config = nativeConfiguration, active = !!(owned || config)) {
    const diagnostic = value => {
      try { return typeof value?.ownershipDiagnostics === "function" ? copy(value.ownershipDiagnostics()) : null; }
      catch { return null; }
    };
    return freeze({ active, configuration: diagnostic(config), endpoint: diagnostic(owned) });
  }
  function snapshot() {
    return copy({ enabled: wanted, ...state, cleanup_pending: cleanupJob !== null, cleanup_blocked: cleanupBlocked, projects: cacheState,
      methods: CHANNEL_METHODS.map(method => ({ method, available: available(method) })) });
  }
  function setEnabled(enabled) {
    if (typeof enabled !== "boolean") return Promise.reject(error("INVALID_INPUT"));
    if (closed) return Promise.reject(error("CLOSED"));
    if (enabled === wanted && (!enabled || state.state === "listening")) return queue.then(snapshot);
    wanted = enabled; const revision = ++generation;
    lifetime?.abort(); cancelPresentations(); controller.stop();
    emit({ kind: "enablement", enabled });
    const job = queue.then(() => transition(enabled, revision));
    queue = job.catch(() => {});
    return job;
  }
  function registerPresenter(key, presenter) {
    if (closed || key === null || key === undefined || presenters.has(key) || presenters.size >= AGENT_SERVICE_LIMITS.presenters
        || !ownFunction(presenter, "isNormal") || !ownFunction(presenter, "requestApproval")) throw error("INVALID_PRESENTER");
    const entry = { key, presenter, order: ++order };
    presenters.set(key, entry);
    return () => {
      if (presenters.get(key) !== entry) return;
      presenters.delete(key);
      for (const item of [...presentations]) if (item.entry === entry) item.cancel();
    };
  }
  function activatePresenter(key) {
    const entry = presenters.get(key);
    if (!entry || !eligible(entry)) return false;
    entry.order = ++order; return true;
  }
  function sessions(projectId = null) {
    if (projectId !== null && (!PROJECT.test(projectId) || !cacheReady || !cache.some(project => project.id === projectId))) return EMPTY;
    return copy(controller.sessions.filter(view => view.client?.name === "agent-bridge"
      && cacheReady && cache.some(project => project.id === view.project_id)
      && (projectId === null || view.project_id === projectId)));
  }
  function revokeSession(projectId, id) {
    if (closed || !cacheReady || !PROJECT.test(projectId) || !SESSION.test(id)
        || !cache.some(project => project.id === projectId)) return false;
    const view = controller.sessions.find(value => value.session === id);
    return view?.project_id === projectId && view.client?.name === "agent-bridge" ? controller.revoke(id) : false;
  }
  async function getHookConfig(agent) {
    if (!["claude-code", "codex"].includes(agent)) throw error("INVALID_INPUT");
    const config = nativeConfiguration, revision = generation, owned = endpoint;
    const current = () => !closed && wanted && state.state === "listening"
      && config && config === nativeConfiguration && owned === endpoint && revision === generation;
    if (!current() || typeof deps.buildHookConfig !== "function") throw error("ENDPOINT_UNAVAILABLE");
    const snippet = await timeout(Promise.resolve().then(() => {
      if (!current()) throw error("ENDPOINT_UNAVAILABLE");
      return deps.buildHookConfig({ agent, socketPath: config.socketPath });
    }), AGENT_SERVICE_LIMITS.nativeConfigMs, { signal: shutdown.signal });
    if (!current()) throw error("ENDPOINT_UNAVAILABLE");
    if (typeof snippet !== "string" || encoder.encode(snippet).length > AGENT_SERVICE_LIMITS.configBytes) throw error("CONFIG_UNAVAILABLE");
    return snippet;
  }
  function installTools(value) {
    if (closed || !value || typeof value !== "object" || !ownFunction(value, "isMethodAvailable")) throw error("INVALID_RUNTIME");
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const names = ["isMethodAvailable", "listTabs", "getTab", "executeMethod", "confirmAction", "releaseSession"];
    if (Object.keys(descriptors).some(name => !names.includes(name) || !Object.hasOwn(descriptors[name], "value")
        || typeof descriptors[name].value !== "function")) throw error("INVALID_RUNTIME");
    controller.stop(); tools = Object.freeze(Object.fromEntries(Object.entries(descriptors).map(([name, descriptor]) => [name, descriptor.value])));
    emit({ kind: "capabilities" });
  }
  async function close() {
    if (closed) { await queue; return snapshot(); }
    closed = true; wanted = false; ++generation; ++cacheGeneration; shutdown.abort();
    cache = EMPTY; cacheReady = false;
    cacheState = freeze({ state: "closed", reason: null, generation: cacheGeneration, count: 0 });
    lifetime?.abort(); cancelPresentations(); controller.stop();
    presenters.clear(); activity.close();
    const job = queue.then(() => transition(false, generation)); queue = job.catch(() => {});
    const result = await job; listeners.clear(); return result;
  }
  return Object.freeze({ initialize: refreshProjects, refreshProjects, invalidateProjects, getProjects: () => cache,
    getProjectCacheState: () => cacheState, setEnabled, getEndpointState: snapshot, registerPresenter, activatePresenter,
    listSessions: sessions, revokeSession, getHookConfig, installTools,
    listActivity: projectId => activity.snapshot(projectId), needsAttention: () => activity.attention(),
    rememberReturnTarget: target => activity.rememberReturnTarget(target), returnTarget: projectId => activity.returnTarget(projectId),
    onChange(callback) { if (closed || typeof callback !== "function") throw error("INVALID_LISTENER"); listeners.add(callback); return () => listeners.delete(callback); },
    close, diagnostics: () => freeze({ closed, enabled: wanted, endpoint: state.state, cache: cacheState.state,
      projects: cache.length, sessions: controller.sessions.length, presenters: presenters.size,
      presentations: presentations.size, cleanupBlocked,
      ownership: endpoint || nativeConfiguration ? readOwnership() : lastOwnership }) });
}
