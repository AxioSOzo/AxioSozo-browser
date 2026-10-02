/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free ownership and routing. Privileged integration supplies the model,
// identity API and presentation metadata. No actor-facing method accepts an ID.
export const MAX_PUBLIC_USER_CONTEXT_ID = 4294967294;
const own = (value, key) => Object.prototype.hasOwnProperty.call(value ?? {}, key) ? value[key] : undefined;
const validId = (id, zero = false) => Number.isInteger(id) && id >= (zero ? 0 : 1) && id <= MAX_PUBLIC_USER_CONTEXT_ID;
const validProjectId = id => typeof id === 'string' && /^p_[a-z0-9]{4,32}$/.test(id);
const sameKeys = (value, keys) => value !== null && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).every(key => keys.includes(key));

export class ProjectContainerError extends Error {
  constructor(code) { super(code); this.name = 'ProjectContainerError'; this.code = code; }
}
const fail = code => { throw new ProjectContainerError(code); };
function normalOnly(options, extras = []) {
  if (!sameKeys(options, ['isPrivate', ...extras])) fail('INVALID_INPUT');
  if (options.isPrivate !== false) fail('PRIVATE');
}
function description(value) {
  if (!sameKeys(value, ['name', 'icon', 'color']) || Object.keys(value).length !== 3 ||
      typeof value.name !== 'string' || !value.name.trim() || value.name.length > 128 ||
      /[\u0000-\u001f\u007f-\u009f]/u.test(value.name) ||
      typeof value.icon !== 'string' || !/^[a-z][a-z0-9-]{0,39}$/.test(value.icon) ||
      typeof value.color !== 'string' || !/^[a-z][a-z0-9-]{0,39}$/.test(value.color)) fail('INVALID_IDENTITY');
  return Object.freeze({ name: value.name.trim(), icon: value.icon, color: value.color });
}
function publicIdentity(value, expectedId = null) {
  if (!value || value.public !== true || !validId(value.userContextId) ||
      (expectedId !== null && value.userContextId !== expectedId)) return null;
  return Object.freeze({
    userContextId: value.userContextId, public: true,
    name: typeof value.name === 'string' ? value.name : null,
    icon: typeof value.icon === 'string' ? value.icon : null,
    color: typeof value.color === 'string' ? value.color : null,
  });
}

/** Wrap only non-DOM ContextualIdentityService APIs. Creating/updating identities
 * receives an already prepared descriptor from the Claude-owned integration.
 * Supply the pinned service's canonical color names: legacy aliases are not
 * accepted by this adapter. No remove method is exposed because it clears data.
 */
export function createGeckoIdentityAdapter({ service, allowedColors, allowedIcons }) {
  if (!service || !['getPublicIdentityFromId', 'create', 'update'].every(key => typeof service[key] === 'function') ||
      !Array.isArray(allowedColors) || !allowedColors.length || !Array.isArray(allowedIcons) || !allowedIcons.length) fail('INVALID_INPUT');
  const colors = new Set(allowedColors), icons = new Set(allowedIcons);
  const checked = value => {
    const out = description(value);
    if (!colors.has(out.color) || !icons.has(out.icon)) fail('INVALID_IDENTITY');
    return out;
  };
  const get = id => {
    if (!validId(id)) return null;
    return publicIdentity(service.getPublicIdentityFromId(id), id);
  };
  return Object.freeze({
    get,
    create(value) {
      const spec = checked(value);
      const made = publicIdentity(service.create(spec.name, spec.icon, spec.color));
      if (!made) fail('IDENTITY_UNAVAILABLE');
      const saved = get(made.userContextId);
      if (!saved) fail('IDENTITY_UNAVAILABLE');
      return saved;
    },
    update(id, value) {
      const spec = checked(value);
      if (!get(id)) fail('IDENTITY_UNAVAILABLE');
      if (service.update(id, spec.name, spec.icon, spec.color) !== true) fail('IDENTITY_UNAVAILABLE');
      const saved = get(id);
      if (!saved) fail('IDENTITY_UNAVAILABLE');
      return saved;
    },
  });
}

/** Model callbacks are service-owned. assignContainer performs a compare-and-swap
 * inside the store's serialized update; returns an updated project or null when
 * removed/stale. presentationForProject belongs to the frontend implementation.
 */
export function createProjectContainers({ core, identities, getProject, listProjects, assignContainer,
  presentationForProject, enabled }) {
  if (!core || !['upgradeProject', 'routeForUrl'].every(key => typeof core[key] === 'function') ||
      !identities || !['get', 'create', 'update'].every(key => typeof identities[key] === 'function') ||
      ![getProject, listProjects, assignContainer, presentationForProject, enabled].every(value => typeof value === 'function')) fail('INVALID_INPUT');
  let tail = Promise.resolve(), generation = 0, resetPending = false;
  const pending = new Map(), deleted = new Set();
  const unchanged = before => { if (before !== generation) fail('PROJECT_CHANGED'); };
  const serial = task => {
    const next = tail.then(task);
    tail = next.catch(() => {});
    return next;
  };
  const project = async id => {
    if (!validProjectId(id)) fail('INVALID_INPUT');
    const found = await getProject(id);
    if (!found) fail('UNKNOWN_PROJECT');
    const out = core.upgradeProject(found);
    if (out.id !== id) fail('INVALID_PROJECT');
    return out;
  };
  const available = async () => {
    if (resetPending) fail('IDENTITY_RESET_PENDING');
    if (await enabled() !== true) fail('CONTAINERS_DISABLED');
  };
  const unique = async (id, userContextId) => {
    const projects = await listProjects();
    if (!Array.isArray(projects) || projects.length > 512) fail('INVALID_PROJECTS');
    return !projects.some(other => other?.id !== id && own(own(other, 'container'), 'user_context_id') === userContextId);
  };
  const lookup = async id => validId(id) && !deleted.has(id) ? publicIdentity(await identities.get(id), id) : null;
  const ensureInternal = async id => {
    const before = generation;
    await available();
    const current = await project(id);
    const expected = current.container.user_context_id;
    const existing = await lookup(expected);
    if (existing && await unique(id, expected)) {
      unchanged(before);
      return Object.freeze({ project: current, identity: existing });
    }

    let candidate = await lookup(pending.get(id));
    if (candidate && !await unique(id, candidate.userContextId)) candidate = null;
    if (!candidate) {
      if (pending.size >= 512 && !pending.has(id)) fail('BUSY');
      const spec = description(await presentationForProject(current));
      await available();
      unchanged(before);
      candidate = publicIdentity(await identities.create(spec));
      unchanged(before);
      if (candidate) deleted.delete(candidate.userContextId);
      if (!candidate || !await lookup(candidate.userContextId) || !await unique(id, candidate.userContextId)) fail('IDENTITY_UNAVAILABLE');
      unchanged(before);
      pending.set(id, candidate.userContextId);
    }
    await available();
    unchanged(before);
    // This callback must re-read the project atomically, not capture current.
    const assigned = await assignContainer(id, candidate.userContextId, { expectedUserContextId: expected });
    if (!assigned) fail('PROJECT_CHANGED');
    const saved = core.upgradeProject(assigned);
    if (saved.id !== id || saved.container.user_context_id !== candidate.userContextId) fail('PROJECT_CHANGED');
    const reread = await project(id);
    if (reread.container.user_context_id !== candidate.userContextId || !await unique(id, candidate.userContextId)) fail('PROJECT_CHANGED');
    const identity = await lookup(candidate.userContextId);
    if (!identity) fail('IDENTITY_UNAVAILABLE');
    unchanged(before);
    pending.delete(id);
    return Object.freeze({ project: reread, identity });
  };
  const defaultIdentity = async id => {
    if (!validId(id, true)) fail('INVALID_INPUT');
    if (id !== 0 && !await lookup(id)) fail('IDENTITY_UNAVAILABLE');
    return id;
  };
  const webUrl = value => {
    if (typeof value !== 'string' || value.length > 65536) fail('INVALID_URL');
    let url;
    try { url = new URL(value); } catch { fail('INVALID_URL'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) fail('INVALID_URL');
    return url.href;
  };
  return Object.freeze({
    ensure(projectId, options = {}) {
      normalOnly(options);
      return serial(() => ensureInternal(projectId));
    },
    route(projectId, url, options = {}) {
      normalOnly(options, ['defaultUserContextId']);
      const href = webUrl(url);
      return serial(async () => {
        const before = generation;
        await available();
        const fallback = await defaultIdentity(options.defaultUserContextId);
        const ensured = await ensureInternal(projectId);
        const ownId = ensured.identity.userContextId;
        // Finish fallible asynchronous identity checks before reading routing
        // preferences again. Revocation while those checks run must take effect.
        if (!await lookup(ownId) || !await unique(projectId, ownId)) fail('IDENTITY_UNAVAILABLE');
        await defaultIdentity(fallback);
        await available();
        const latest = await project(projectId);
        if (latest.container.user_context_id !== ownId) fail('PROJECT_CHANGED');
        // Even before the pure package follow-up lands, suggestions never share
        // an account jar until the user has explicitly confirmed them.
        const record = latest.shared_sites.confirmed === true ? latest :
          { ...latest, shared_sites: { hosts: [], confirmed: false } };
        unchanged(before);
        const result = core.routeForUrl({ project: record, url: href, defaultUserContextId: fallback });
        if (!validId(result.userContextId, true) || !['project', 'shared_site'].includes(result.reason) ||
            (result.reason === 'project' && result.userContextId !== ownId) ||
            (result.reason === 'shared_site' && result.userContextId !== fallback)) fail('IDENTITY_UNAVAILABLE');
        return Object.freeze({ project_id: projectId, project_updated_at: latest.updated_at,
          url: href, userContextId: result.userContextId, reason: result.reason });
      });
    },
    refreshPresentation(projectId, options = {}) {
      normalOnly(options);
      return serial(async () => {
        const before = generation;
        const ensured = await ensureInternal(projectId);
        const id = ensured.identity.userContextId;
        const spec = description(await presentationForProject(ensured.project));
        unchanged(before);
        await available();
        if (!await lookup(id) || !await unique(projectId, id)) fail('IDENTITY_UNAVAILABLE');
        const latest = await project(projectId);
        unchanged(before);
        if (latest.container.user_context_id !== id) fail('PROJECT_CHANGED');
        // No await between the final model/generation checks and invocation of
        // the synchronous Gecko adapter update, so a reused ID cannot be styled.
        const identity = publicIdentity(await identities.update(id, spec), id);
        if (!identity) fail('IDENTITY_UNAVAILABLE');
        const reread = await project(projectId);
        if (reread.container.user_context_id !== identity.userContextId || !await unique(projectId, identity.userContextId)) fail('PROJECT_CHANGED');
        await available();
        unchanged(before);
        return Object.freeze({ project: reread, identity });
      });
    },
    // Privileged observer seams, never actor methods. Generation changes are
    // synchronous so an in-flight route cannot escape before queued cleanup.
    identityDeleted(userContextId) {
      if (!validId(userContextId)) fail('INVALID_INPUT');
      generation++;
      deleted.add(userContextId);
      for (const [id, pendingId] of pending) if (pendingId === userContextId) pending.delete(id);
      return serial(async () => {
        const records = await listProjects();
        if (!Array.isArray(records) || records.length > 512) fail('INVALID_PROJECTS');
        let cleared = 0;
        for (const value of records) if (value?.container?.user_context_id === userContextId) {
          if (await assignContainer(value.id, null, { expectedUserContextId: userContextId })) cleared++;
        }
        const remaining = await listProjects();
        if (!Array.isArray(remaining) || remaining.length > 512) fail('INVALID_PROJECTS');
        if (remaining.some(value => value?.container?.user_context_id === userContextId)) fail('PROJECT_CHANGED');
        deleted.delete(userContextId);
        return cleared;
      });
    },
    identitiesReset() {
      generation++;
      resetPending = true;
      pending.clear();
      return serial(async () => {
        const records = await listProjects();
        if (!Array.isArray(records) || records.length > 512) fail('INVALID_PROJECTS');
        let cleared = 0;
        for (const value of records) {
          const id = value?.container?.user_context_id;
          if (id !== null && id !== undefined && await assignContainer(value.id, null, { expectedUserContextId: id })) cleared++;
        }
        const remaining = await listProjects();
        if (!Array.isArray(remaining) || remaining.length > 512) fail('INVALID_PROJECTS');
        if (remaining.some(value => value?.container?.user_context_id !== null && value?.container?.user_context_id !== undefined)) fail('PROJECT_CHANGED');
        deleted.clear();
        resetPending = false;
        return cleared;
      });
    },
    // Project deletion leaves Gecko identities, open tabs and their cookies
    // untouched. Forgetting this retry hint performs no identity mutation.
    forget(projectId) {
      if (!validProjectId(projectId)) fail('INVALID_INPUT');
      return serial(() => pending.delete(projectId));
    },
  });
}
