/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free, browser-owned status retention. This module never retains hook
// payloads or decides how activity is presented. All current project authority
// comes from the injected validated frozen cache, never from retained history.
import { projectForPath } from './AgentChannelCore.sys.mjs';

export const PROJECT_AGENT_ACTIVITY_LIMITS = Object.freeze({
  keepMs: 86400000, history: 20, projects: 128, records: 2560,
});
const PROJECT_ID = /^p_[a-z0-9]{4,32}$/u;
const isProjectId = value => typeof value === 'string' && PROJECT_ID.test(value);
const STATUS_ID = /^as_[0-9a-f]{16}$/u;
const TAB_ID = /^t_[1-9][0-9]{0,15}$/u;
const CONTROLS = /[\u0000-\u001f\u007f-\u009f]/u;
const STATES = new Set(['started', 'needs_input', 'done', 'failed']);
const AGENTS = new Set(['claude-code', 'codex', 'other']);
const ATTENTION = new Set(['needs_input', 'done', 'failed']);
const STATUS_KEYS = ['version', 'id', 'project_path', 'agent', 'state', 'title', 'at', 'session'];
const NAVIGATION_ID = /^[A-Za-z0-9_:.\-]{1,128}$/u;
const TARGET_KEYS = ['project_id', 'tab_id', 'navigation_id', 'user_context_id'];
const fail = code => { throw Object.assign(new Error(code), { code }); };
const plain = value => !!value && typeof value === 'object' && !Array.isArray(value) &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value));
const data = (value, key) => Object.getOwnPropertyDescriptor(value, key)?.value;
const exactData = (value, keys) => {
  try { return plain(value) && Reflect.ownKeys(value).length === keys.length &&
    keys.every(key => Object.hasOwn(value, key) &&
      Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value')); } catch { return false; }
};
const text = (value, min, max) => typeof value === 'string' && value.length <= max * 2 &&
  [...value].length >= min && [...value].length <= max && !CONTROLS.test(value);
const path = value => typeof value === 'string' && value.startsWith('/') &&
  value.length > 1 && value.length <= 4096 && !CONTROLS.test(value) &&
  !value.includes('//') && !value.split('/').some(part => part === '.' || part === '..');
const rootPath = value => path(value) ? value.replace(/\/+$/u, '') || null : null;
const frozen = value => {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) frozen(child);
    Object.freeze(value);
  }
  return value;
};
const timestamp = value => Number.isSafeInteger(value) && value >= 0;
const compareRecord = (a, b) => b.record.at - a.record.at || b.sequence - a.sequence;
const compareGroup = (a, b) => b.latest.at - a.latest.at ||
  (a.project_id < b.project_id ? -1 : a.project_id === b.project_id ? 0 : 1);

/**
 * getProjects() synchronously returns the current validated frozen array of
 * project records; null denotes an unavailable/invalid cache. A successful
 * refresh must call synchronizeProjects(), including for a validated empty
 * array. Old history stays hidden during cache failure and is not purged merely
 * because a read fails. Returned data never grants tab/navigation authority.
 *
 * Return targets are only native identity data. The UI/service must revalidate
 * the current normal tab, navigation, project and container before acting.
 * Targets survive record expiry, but not project removal/root change or close.
 * Timers must use the normal asynchronous setTimeout/clearTimeout contract.
 */
export function createProjectAgentActivity({ getProjects, validateStatusRecord, now,
  timers, onChange = null } = {}) {
  if ([getProjects, validateStatusRecord, now, timers?.setTimeout, timers?.clearTimeout]
    .some(value => typeof value !== 'function') ||
      onChange !== null && typeof onChange !== 'function') fail('INVALID_ACTIVITY_DEPENDENCIES');
  const entries = new Map();
  let closed = false, timer = null, generation = 0, sequence = 0;

  function clock() {
    try { const value = now(); return timestamp(value) ? value : null; } catch { return null; }
  }
  function currentProjects() {
    try {
      const values = getProjects();
      if (!Array.isArray(values) || !Object.isFrozen(values) || values.length > 512) return null;
      const ids = new Set(), result = [];
      for (const project of values) {
        if (!plain(project) || !Object.isFrozen(project)) return null;
        const id = data(project, 'id'), root = rootPath(data(project, 'root'));
        if (!isProjectId(id) || !root || ids.has(id)) return null;
        ids.add(id);
        result.push(Object.freeze({ id, root }));
      }
      // Equal-root entries deliberately retain projectForPath's stable
      // first-match behavior, matching the channel's current-project lookup.
      return Object.freeze(result);
    } catch { return null; }
  }
  function emit(kind) {
    // No record titles, raw reports, URLs or stale cached project identities
    // are exposed through callbacks, including during invalid-cache expiry.
    try {
      if (onChange) Promise.resolve(onChange(Object.freeze({ kind }))).catch(() => {});
    } catch {}
  }
  function cancelTimer() {
    generation++;
    const previous = timer;
    timer = null;
    if (previous !== null) { try { timers.clearTimeout(previous); } catch {} }
  }
  function terminate(kind = 'closed') {
    if (closed) return;
    closed = true;
    cancelTimer();
    entries.clear();
    emit(kind);
  }
  function nextSequence() {
    if (sequence >= Number.MAX_SAFE_INTEGER - 1) {
      const ranks = [];
      for (const entry of entries.values()) {
        ranks.push({ value: entry, key: 'sequence' });
        for (const item of entry.history) ranks.push({ value: item, key: 'sequence' });
      }
      ranks.sort((a, b) => a.value[a.key] - b.value[b.key]);
      let replacement = 0;
      for (const rank of ranks) rank.value[rank.key] = ++replacement;
      sequence = replacement;
    }
    return ++sequence;
  }
  function prune(time) {
    let changed = false;
    for (const [id, entry] of entries) {
      const before = entry.history.length;
      entry.history = entry.history.filter(item => time - item.record.at <= PROJECT_AGENT_ACTIVITY_LIMITS.keepMs);
      changed ||= entry.history.length !== before;
      if (!entry.history.length && !entry.target) entries.delete(id);
    }
    return changed;
  }
  function schedule(time, retryMs = null) {
    cancelTimer();
    if (closed) return false;
    let delay = null;
    for (const entry of entries.values()) for (const item of entry.history) {
      const remaining = Math.min(PROJECT_AGENT_ACTIVITY_LIMITS.keepMs + 1,
        Math.max(1, PROJECT_AGENT_ACTIVITY_LIMITS.keepMs - (time - item.record.at) + 1));
      delay = delay === null ? remaining : Math.min(delay, remaining);
    }
    if (delay === null) return true;
    if (retryMs !== null) delay = retryMs;
    const expected = generation;
    let setting = true, synchronous = false, token;
    try {
      token = timers.setTimeout(() => {
        if (setting) { synchronous = true; return; }
        if (closed || expected !== generation) return;
        timer = null;
        const current = clock();
        if (current === null) {
          // A temporarily bad clock hides snapshots; retry with a bounded
          // delay so valid clocks still expire retained quiet activity.
          schedule(time, 60000);
          return;
        }
        const changed = prune(current);
        schedule(current);
        if (changed && !closed) emit('expired');
      }, delay);
    } catch { setting = false; terminate('unavailable'); return false; }
    setting = false;
    if (synchronous) {
      try { timers.clearTimeout(token); } catch {}
      terminate('unavailable');
      return false;
    }
    timer = token;
    return true;
  }
  function cap() {
    while (entries.size > PROJECT_AGENT_ACTIVITY_LIMITS.projects) {
      const oldest = [...entries.entries()].sort(([idA, a], [idB, b]) =>
        a.freshness - b.freshness || a.sequence - b.sequence ||
        (idA < idB ? -1 : idA === idB ? 0 : 1))[0];
      entries.delete(oldest[0]);
    }
    // Explicit global bound, in addition to projects * per-project history.
    let count = [...entries.values()].reduce((sum, entry) => sum + entry.history.length, 0);
    while (count > PROJECT_AGENT_ACTIVITY_LIMITS.records) {
      let selected = null;
      for (const [id, entry] of entries) for (const item of entry.history) {
        if (!selected || item.record.at < selected.item.record.at ||
          item.record.at === selected.item.record.at && item.sequence < selected.item.sequence)
          selected = { id, entry, item };
      }
      selected.entry.history = selected.entry.history.filter(item => item !== selected.item);
      if (!selected.entry.history.length && !selected.entry.target) entries.delete(selected.id);
      count--;
    }
  }
  function entryFor(project, time) {
    let entry = entries.get(project.id);
    if (entry && entry.root !== project.root) {
      // A refreshed root must never inherit old-root records or return data,
      // even if an accept arrives before the refresh's synchronization call.
      entries.delete(project.id);
      entry = null;
    }
    if (!entry) {
      entry = { root: project.root, history: [], target: null,
        freshness: time, sequence: nextSequence() };
      entries.set(project.id, entry);
    }
    return entry;
  }
  function accept(input, projectId) {
    if (closed || !isProjectId(projectId) || !exactData(input, STATUS_KEYS)) return false;
    const time = clock(), projects = currentProjects();
    if (time === null || !projects) return false;
    let parsed;
    try { parsed = validateStatusRecord(input); } catch { return false; }
    if (!exactData(parsed, STATUS_KEYS) || !Object.isFrozen(parsed) ||
        parsed.version !== 1 || typeof parsed.id !== 'string' || !STATUS_ID.test(parsed.id) ||
        !path(parsed.project_path) || !AGENTS.has(parsed.agent) || !STATES.has(parsed.state) ||
        !text(parsed.title, 1, 120) || !timestamp(parsed.at) || parsed.at > time ||
        time - parsed.at > PROJECT_AGENT_ACTIVITY_LIMITS.keepMs ||
        parsed.session !== null && !text(parsed.session, 1, 64)) return false;
    const project = projectForPath(projects, parsed.project_path);
    if (!project || project.id !== projectId) return false;
    const record = Object.freeze({ version: 1, id: parsed.id, project_path: project.root,
      agent: parsed.agent, state: parsed.state, title: parsed.title, at: parsed.at, session: parsed.session });
    prune(time);
    const entry = entryFor(project, parsed.at);
    // An identical transport retry is idempotent. Changed data with an already
    // retained ID is refused rather than replacing a prior accepted report.
    const existing = entry.history.find(item => item.record.id === record.id);
    if (existing) return STATUS_KEYS.every(key => existing.record[key] === record[key]);
    entry.history.push({ record, sequence: nextSequence() });
    entry.history.sort(compareRecord);
    entry.history.length = Math.min(entry.history.length, PROJECT_AGENT_ACTIVITY_LIMITS.history);
    entry.freshness = Math.max(entry.freshness, parsed.at);
    entry.sequence = nextSequence();
    cap();
    if (!schedule(time)) return false;
    emit('accepted');
    return true;
  }
  function synchronizeProjects() {
    if (closed) return false;
    const projects = currentProjects();
    if (projects === null) return false;
    const byId = new Map(projects.map(project => [project.id, project.root]));
    let changed = false;
    for (const [id, entry] of entries) {
      if (byId.get(id) !== entry.root) { entries.delete(id); changed = true; }
    }
    const time = clock();
    if (time !== null) { changed = prune(time) || changed; schedule(time); }
    else if (![...entries.values()].some(entry => entry.history.length)) cancelTimer();
    if (changed && !closed) emit('projects');
    return !closed;
  }
  function snapshot(projectId) {
    if (closed || projectId !== undefined && !isProjectId(projectId)) return Object.freeze([]);
    const time = clock(), projects = currentProjects();
    if (time === null || projects === null) return Object.freeze([]);
    const byId = new Map(projects.map(project => [project.id, project.root]));
    const changed = prune(time);
    if (changed) schedule(time);
    if (closed) return Object.freeze([]);
    const groups = [];
    for (const [id, entry] of entries) {
      if (projectId !== undefined && id !== projectId || byId.get(id) !== entry.root || !entry.history.length) continue;
      const history = entry.history.map(item => item.record);
      groups.push({ project_id: id, project_path: entry.root, latest: history[0], history });
    }
    groups.sort(compareGroup);
    if (changed && !closed) emit('expired');
    // An observer may invalidate the cache or close this store synchronously.
    // Recheck authority after callbacks before exposing the copied snapshot.
    if (closed) return Object.freeze([]);
    const finalProjects = currentProjects();
    if (finalProjects === null) return Object.freeze([]);
    const finalRoots = new Map(finalProjects.map(project => [project.id, project.root]));
    return frozen(groups.filter(group => finalRoots.get(group.project_id) === group.project_path));
  }
  function rememberReturnTarget(value) {
    if (closed || !exactData(value, TARGET_KEYS)) return false;
    const { project_id: id, tab_id: tabId, navigation_id: navigation, user_context_id: container } = value;
    if (!isProjectId(id) || typeof tabId !== 'string' || !TAB_ID.test(tabId) ||
        !Number.isSafeInteger(Number(tabId.slice(2))) || typeof navigation !== 'string' || !NAVIGATION_ID.test(navigation) ||
        !Number.isSafeInteger(container) || container < 0 || container > 4294967294) return false;
    const projects = currentProjects(), time = clock();
    const project = projects?.find(candidate => candidate.id === id);
    if (!project || time === null) return false;
    prune(time);
    const entry = entryFor(project, time);
    entry.target = Object.freeze({ project_id: id, tab_id: tabId,
      navigation_id: navigation, user_context_id: container });
    entry.freshness = Math.max(entry.freshness, time);
    entry.sequence = nextSequence();
    cap();
    if (!schedule(time)) return false;
    emit('target');
    return true;
  }
  function returnTarget(projectId) {
    if (closed || !isProjectId(projectId)) return null;
    const projects = currentProjects();
    const project = projects?.find(candidate => candidate.id === projectId);
    const entry = entries.get(projectId);
    return project && entry?.root === project.root ? entry.target : null;
  }
  return Object.freeze({ accept, synchronizeProjects, snapshot,
    attention: () => frozen(snapshot().filter(group => ATTENTION.has(group.latest.state))),
    rememberReturnTarget, returnTarget, close: () => terminate() });
}
