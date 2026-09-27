/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Synthetic browser window with the subset of gZenWorkspaces that
// ZenWorkspaceAdapter uses. Test-only; not evidence of a running Zen window.
export function fakeZenWindow({ spaces = [], active = null, isPrivate = false, disabled = false } = {}) {
  const listeners = new Map();
  let cache = spaces.map(space => ({ ...space }));
  const changeListeners = [];
  const opened = [];
  const zen = {
    activeWorkspace: active ?? cache[0]?.uuid ?? "",
    promiseInitialized: Promise.resolve(),
    get privateWindowOrDisabled() { return disabled || isPrivate; },
    getWorkspaces: () => [...cache],
    workspaceElement: uuid => window.elements[uuid] ?? null,
    addChangeListeners: func => changeListeners.push(func),
    removeChangeListeners: func => { const i = changeListeners.indexOf(func); if (i >= 0) changeListeners.splice(i, 1); },
    async changeWorkspaceWithID(uuid) {
      zen.activeWorkspace = uuid;
      for (const func of [...changeListeners]) await func({ workspace: cache.find(space => space.uuid === uuid), onInit: false });
    },
  };
  const window = {
    gZenWorkspaces: zen,
    PrivateBrowsingUtils: { isWindowPrivate: () => isPrivate },
    ContextualIdentityService: { getUserContextLabel: id => ({ 1: "Personal", 2: "Work" })[id] ?? "" },
    gBrowser: { selectedTab: null },
    document: { getElementById: id => window.elements[id] ?? null },
    elements: {},
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    dispatch(type) { for (const fn of [...(listeners.get(type) ?? [])]) fn({ type }); },
    Services: { scriptSecurityManager: {
      createNullPrincipal: attrs => ({ kind: "null", isSystemPrincipal: false, isNullPrincipal: true, originAttributes: { ...attrs } }),
      getSystemPrincipal: () => ({ kind: "system", isSystemPrincipal: true }) } },
    // Firefox's openWebLinkIn throws on the system principal; openTrustedLinkIn defaults to it.
    openWebLinkIn(url, where, params = {}) {
      if (!params.triggeringPrincipal || params.triggeringPrincipal.isSystemPrincipal) throw new Error("openWebLinkIn needs a non-system principal");
      opened.push({ url, where, workspace: zen.activeWorkspace, principal: params.triggeringPrincipal });
    },
    openTrustedLinkIn: (url, where) => opened.push({ url, where, workspace: zen.activeWorkspace, principal: { kind: "system", isSystemPrincipal: true } }),
  };
  return { window, zen, opened, changeListeners, listeners,
    setSpaces(next) { cache = next.map(space => ({ ...space })); },
    mutate(uuid, patch) { Object.assign(cache.find(space => space.uuid === uuid), patch); } };
}
