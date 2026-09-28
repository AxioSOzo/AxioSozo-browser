/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// F4 dev loop (HANDOFF_3 §5, §6.4; contexts-api-v1 §3.5). Three small, chrome-owned
// additions: an environment pill in the address bar on project URLs, a project
// block at the top of the active project workspace's tab list, and a waiting
// overlay over the browser stack when a *declared* local origin refuses the
// connection. Nothing is injected into web content, no shortcut is taken, no
// port is scanned: status comes from services.serviceStatus (declared loopback
// services only) or one injected probe for exactly the refused origin's port.
// Private windows never probe: no status refresh, no polling (manual retry only).
import * as defaultCore from "./contexts/index.mjs";

export const XHTML = "http://www.w3.org/1999/xhtml";
export const RUNTIME_STYLESHEET = "chrome://browser/content/axiosozo/axiosozo-runtime.css";
// nsIWebProgressListener flags, pinned so Node tests need no Ci.
// Values from uriloader/base/nsIWebProgressListener.idl (LOCATION_CHANGE_ERROR_PAGE
// is 0x2; 0x4 is LOCATION_CHANGE_RELOAD).
export const WPL = Object.freeze({ STATE_START: 0x1, STATE_STOP: 0x10, STATE_IS_WINDOW: 0x80000,
  LOCATION_CHANGE_SAME_DOCUMENT: 0x1, LOCATION_CHANGE_ERROR_PAGE: 0x2, LOCATION_CHANGE_RELOAD: 0x4 });
export const NS_ERROR_CONNECTION_REFUSED = 0x804b000d;
export const WAIT_BACKOFF_MS = Object.freeze([1000, 2000, 3000, 5000, 8000, 10000]);
export const WAIT_MAX_ATTEMPTS = 40; // ≈ 6 minutes, then the overlay offers "Try again"
export const WAIT_MAX_RELOAD_FAILURES = 3; // probe said up but the page still refused
export const SERVICE_REFRESH_MS = 30000;
export const SERVICE_EVENT_THROTTLE_MS = 5000;
// Projects shown per space before the rest fold into "N more projects".
export const FOLDER_LIMIT = 3;
const STATUS_TEXT = Object.freeze({ up: "running", down: "not running", unknown: "status unknown" });
const INERT = Object.freeze({ dispose() {} });

/** An http(s) URL without credentials, or null. */
export function webURL(spec) {
  if (typeof spec !== "string") return null;
  const url = URL.parse(spec);
  return url && (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password ? url : null;
}

export function defaultTimers(window) {
  return {
    setTimeout: (fn, ms) => window.setTimeout(fn, ms), clearTimeout: id => window.clearTimeout(id),
    setInterval: (fn, ms) => window.setInterval(fn, ms), clearInterval: id => window.clearInterval(id),
  };
}

export function prefEnabled(window, name, fallback) {
  try { return window.Services?.prefs?.getBoolPref?.(name, fallback) ?? fallback; } catch { return fallback; }
}

// One stylesheet processing instruction per chrome document, shared by the
// runtime modules and removed when the last one is disposed.
const sheets = new WeakMap();
export function ensureRuntimeStylesheet(document) {
  let entry = sheets.get(document);
  if (!entry) {
    const node = document.createProcessingInstruction?.("xml-stylesheet", `href="${RUNTIME_STYLESHEET}" type="text/css"`);
    if (node) document.insertBefore(node, document.documentElement);
    entry = { node, count: 0 };
    sheets.set(document, entry);
  }
  entry.count++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--entry.count === 0) { entry.node?.remove(); sheets.delete(document); }
  };
}

/** A tabs progress listener that is removed with the installer. */
export function addTabsProgressListener(window, listener) {
  window.gBrowser.addTabsProgressListener(listener);
  return () => { try { window.gBrowser.removeTabsProgressListener(listener); } catch {} };
}

export function element(document, tag, { className, text, attrs } = {}, parent = null) {
  const node = document.createElementNS(XHTML, tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  for (const [key, value] of Object.entries(attrs ?? {})) node.setAttribute(key, value);
  parent?.appendChild(node);
  return node;
}

/** The tab's browser stack (Tabbrowser: browser → browserStack → browserContainer). */
export function browserStackOf(window, tab) {
  const stack = tab?.linkedBrowser?.parentNode;
  if (!stack?.classList?.contains("browserStack")) return null;
  return stack;
}

function envName(environment) {
  return typeof environment === "string" ? environment : environment?.name ?? null;
}

function hostLabel(baseUrl) {
  return webURL(baseUrl)?.host ?? "";
}

/**
 * F4. `services`: AxioSozoServices (listProjects, serviceStatus, updateProject,
 * on). `adapter`: ZenWorkspaceAdapter (activeWorkspaceUuid, workspaceForTab,
 * isPrivateWindow, onChange, optional workspaceHeader / workspaceElement).
 * Optional: `core` (contexts core), `timers`, `clock`, `probe({ url, port }) → boolean`,
 * `openUrl(url, where, tab)`, `openSettings(projectId, { edit })` (the project in about:axiosozo).
 */
export function installDevLoop(window, { services, adapter, core = defaultCore, timers = defaultTimers(window),
  clock = () => Date.now(), probe = null, openUrl = null, openSettings = null } = {}) {
  if (!services || !adapter || !window?.gBrowser || !prefEnabled(window, "axiosozo.contexts.enabled", true)) return INERT;
  const document = window.document;
  const gBrowser = window.gBrowser;
  const privateWindow = adapter.isPrivateWindow();
  const cleanups = [];
  let disposed = false;
  const releaseSheet = ensureRuntimeStylesheet(document);
  cleanups.push(releaseSheet);
  const diagnostics = { pillShown: false, blockShown: false, foldersShown: 0, waits: 0, probes: 0, reloads: 0, switches: 0 };
  // The target URL is built from a repository manifest: load it like an
  // untrusted web link (null principal in the tab's container), never with the
  // system principal.
  const open = openUrl ?? ((url, where, tab) => {
    const userContextId = tab?.userContextId ?? 0;
    const triggeringPrincipal = window.Services.scriptSecurityManager.createNullPrincipal({ userContextId });
    if (!triggeringPrincipal || triggeringPrincipal.isSystemPrincipal) throw new Error("UNSAFE_PRINCIPAL");
    window.openWebLinkIn(url, where, where === "current"
      ? { triggeringPrincipal, targetBrowser: tab?.linkedBrowser }
      : { triggeringPrincipal, userContextId });
  });

  const environmentsOf = project => core.orderedEnvironments(project);
  const statusCache = new Map(); // projectId → { statuses }
  let lastStatusRefresh = 0;

  // ---- Projects and tab ↔ project linking (contexts-api-v1 §2.5) ----------------
  // Every decision about which project a tab belongs to goes through
  // core.matchProjectForUrl over the stored projects, preferring projects of the
  // tab's space, so a manually opened localhost:5173 tab is linked like one
  // opened from the sidebar, and edits re-link open tabs at once.
  let projects = [];
  let projectsLoad = null;
  let projectsGeneration = 0;
  function loadProjects() {
    const generation = ++projectsGeneration;
    projectsLoad = (async () => {
      let list = [];
      try { const result = await services.listProjects(); list = Array.isArray(result) ? result : []; } catch { list = projects; }
      if (generation === projectsGeneration && !disposed) projects = list;
    })();
    return projectsLoad;
  }
  const ensureProjects = () => projectsLoad ?? loadProjects();
  const projectById = id => projects.find(project => project.id === id) ?? null;
  const appOf = environment => (typeof environment?.app === "string" ? environment.app : null);
  const appsOf = project => [...new Set((project.manifest?.environments ?? []).map(appOf))];
  const envKey = environment => `${appOf(environment) ?? ""}\u0000${environment?.name}`;
  const envLabel = (project, environment) => (appOf(environment) && appsOf(project).filter(Boolean).length > 1
    ? `${environment.app} · ${environment.name}` : environment.name);

  /** { project, environment, app } for a URL, preferring projects in contextUuid. */
  function matchUrl(spec, contextUuid) {
    const url = webURL(spec);
    if (!url) return null;
    const match = core.matchProjectForUrl(projects, url.href, { contextUuid: contextUuid ?? undefined });
    const project = match && projectById(match.project_id);
    return project ? { project, environment: match.environment, app: match.app ?? null } : null;
  }
  const spaceOfTab = tab => adapter.workspaceForTab(tab) ?? adapter.activeWorkspaceUuid();
  const matchTab = tab => (tab && !tab.closing ? matchUrl(tab.linkedBrowser?.currentURI?.spec, spaceOfTab(tab)) : null);

  const isLoopbackUrl = spec => ["localhost", "127.0.0.1", "[::1]"].includes(webURL(spec)?.hostname);
  /** "up" | "down" | "unknown" for a local environment (its declared service on
   * the same port and app); "remote" for anything that is never contacted. */
  function environmentStatus(project, environment, statuses) {
    const base = webURL(environment.base_url);
    if (!base || !isLoopbackUrl(base.href)) return "remote";
    const port = Number(base.port) || (base.protocol === "https:" ? 443 : 80);
    const services = project.manifest?.services ?? [];
    const declared = services.find(s => s.port === port && (appOf(s) ?? null) === appOf(environment))
      ?? services.find(s => s.port === port);
    if (!declared) return "unknown";
    const status = statuses.find(s => s.port === port && s.name === declared.name)?.status ?? statuses.find(s => s.port === port)?.status;
    return STATUS_TEXT[status] ? status : "unknown";
  }

  async function statusesFor(project, { fresh = false } = {}) {
    const projectId = project.id;
    // A project without declared services has nothing to probe; a private window never probes.
    if (privateWindow || !(project.manifest?.services?.length > 0)) return [];
    const cached = statusCache.get(projectId);
    if (cached && !fresh) return cached.statuses;
    let statuses = [];
    try {
      const result = await services.serviceStatus(projectId);
      statuses = Array.isArray(result) ? result : [];
    } catch { statuses = cached?.statuses ?? []; }
    statusCache.set(projectId, { statuses });
    return statuses;
  }
  const cachedStatuses = project => statusCache.get(project.id)?.statuses ?? [];

  // ---- Environment pill --------------------------------------------------------
  const pill = element(document, "button", { className: "axiosozo-env-pill",
    attrs: { id: "axiosozo-env-pill", "aria-haspopup": "menu", "aria-expanded": "false" } });
  pill.hidden = true;
  const pillLabel = element(document, "span", { className: "axiosozo-env-pill-label" }, pill);
  element(document, "span", { className: "axiosozo-env-pill-alert", attrs: { "aria-hidden": "true" } }, pill);
  const menu = document.createXULElement("menupopup");
  menu.id = "axiosozo-env-menu";
  let pillState = null; // { tab, url, project, environment, app, current, environments, statuses }
  let pillToken = 0;
  const lastActive = new Map(); // projectId → clock() when one of its tabs was last in front

  const pageActions = document.getElementById("page-action-buttons");
  if (pageActions) {
    pageActions.prepend(pill);
    (document.getElementById("mainPopupSet") ?? document.documentElement).appendChild(menu);
    cleanups.push(() => { pill.remove(); menu.remove(); });
  }

  function hidePill() {
    pillState = null; pill.hidden = true; diagnostics.pillShown = false;
    pill.removeAttribute("data-environment"); pill.removeAttribute("data-services");
  }

  function renderPill() {
    if (!pillState) return hidePill();
    const { project, environment, statuses } = pillState;
    const name = project.manifest?.name ?? "Project";
    const label = envLabel(project, environment);
    const down = statuses.filter(s => s.status === "down").length;
    pillLabel.textContent = label;
    pill.setAttribute("data-environment", environment.name);
    if (down) pill.setAttribute("data-services", "down"); else pill.removeAttribute("data-services");
    const serviceText = down ? `, ${down} of ${statuses.length} services not running` : "";
    pill.setAttribute("aria-label", `${name}: ${label} environment${serviceText}. Switch environment`);
    pill.setAttribute("title", `${name} · ${label}${serviceText}`); // HTML elements in chrome use title for tooltips
    pill.hidden = false; diagnostics.pillShown = true;
  }

  async function refreshPill() {
    const token = ++pillToken;
    await ensureProjects();
    if (disposed || token !== pillToken) return;
    const tab = gBrowser.selectedTab;
    const url = webURL(tab?.linkedBrowser?.currentURI?.spec);
    const match = url ? matchTab(tab) : null;
    if (!match) { hidePill(); scheduleFolders(); return; }
    lastActive.set(match.project.id, clock());
    pillState = { tab, url: url.href, project: match.project, environment: match.environment, app: match.app,
      current: match.environment.name, environments: environmentsOf(match.project), statuses: cachedStatuses(match.project) };
    renderPill();
    scheduleFolders();
    const statuses = await statusesFor(match.project);
    if (disposed || token !== pillToken || !pillState) return;
    pillState.statuses = statuses; renderPill();
  }

  function clearMenu() { while (menu.firstChild) menu.firstChild.remove(); }
  function menuItem(popup, attributes) {
    const item = document.createXULElement("menuitem");
    for (const [key, value] of Object.entries(attributes)) item.setAttribute(key, value);
    popup.appendChild(item);
    return item;
  }
  function buildMenu() {
    clearMenu();
    if (!pillState) return false;
    const { project, environment: currentEnv, environments, statuses } = pillState;
    const app = appOf(currentEnv);
    menuItem(menu, { label: project.manifest?.name ?? "Project", disabled: "true" });
    menu.appendChild(document.createXULElement("menuseparator"));
    // The current app's environments (and project-wide ones) switch in place,
    // keeping the path; other apps of the project open at their base address.
    const same = environments.filter(e => appOf(e) === app || appOf(e) === null);
    const others = environments.filter(e => !same.includes(e));
    for (const environment of same) {
      const item = menuItem(menu, { type: "radio", label: `${envLabel(project, environment)} · ${hostLabel(environment.base_url)}`,
        "data-environment": environment.name, "data-app": appOf(environment) ?? "" });
      if (envKey(environment) === envKey(currentEnv)) { item.setAttribute("checked", "true"); item.setAttribute("disabled", "true"); }
    }
    if (others.length) {
      menu.appendChild(document.createXULElement("menuseparator"));
      for (const environment of others) {
        menuItem(menu, { label: `${envLabel(project, environment)} · ${hostLabel(environment.base_url)}`, "data-open-url": environment.base_url });
      }
    }
    if (statuses.length) {
      menu.appendChild(document.createXULElement("menuseparator"));
      for (const service of statuses) {
        menuItem(menu, { label: `${service.name} (port ${service.port}): ${STATUS_TEXT[service.status] ?? STATUS_TEXT.unknown}`,
          disabled: "true", "data-status": STATUS_TEXT[service.status] ? service.status : "unknown" });
      }
    }
    return true;
  }

  /** Switches the selected tab to the same path/query/hash on `target` (an
   * environment name; `app` picks that app's environment, null a project-wide one). */
  function switchTo(target, app) {
    if (!pillState) return null;
    const options = app === undefined ? {} : { app };
    const next = core.switchEnvironment(pillState.environments, pillState.url, target, options);
    if (!next || !webURL(next) || next === pillState.url) return null;
    diagnostics.switches++;
    open(next, "current", pillState.tab);
    return next;
  }

  const onPillClick = event => {
    event.stopPropagation?.();
    if (!buildMenu()) return;
    if (typeof menu.openPopup === "function") menu.openPopup(pill, "after_end");
  };
  const onPillMouseDown = event => event.stopPropagation?.(); // keep the urlbar from taking focus
  const onMenuCommand = event => {
    const item = event.target;
    const target = item?.getAttribute?.("data-environment");
    if (target) { const app = item.getAttribute("data-app"); switchTo(target, app ? app : null); return; }
    const url = item?.getAttribute?.("data-open-url");
    if (url && pillState) goTo(url, spaceOfTab(pillState.tab));
  };
  const onMenuShowing = event => { if (event.target === menu) pill.setAttribute("aria-expanded", "true"); };
  const onMenuHidden = event => { if (event.target === menu) pill.setAttribute("aria-expanded", "false"); };
  pill.addEventListener("click", onPillClick);
  pill.addEventListener("mousedown", onPillMouseDown);
  menu.addEventListener("command", onMenuCommand);
  menu.addEventListener("popupshowing", onMenuShowing);
  menu.addEventListener("popuphidden", onMenuHidden);
  cleanups.push(() => {
    pill.removeEventListener("click", onPillClick); pill.removeEventListener("mousedown", onPillMouseDown);
    menu.removeEventListener("command", onMenuCommand); menu.removeEventListener("popupshowing", onMenuShowing);
    menu.removeEventListener("popuphidden", onMenuHidden);
  });

  // ---- Project folders (sidebar) ------------------------------------------------------
  // Under the space header: one compact, collapsible row per project that lives
  // in this space (any space type), with a status dot per local environment and
  // production. A project with an open tab in this space is "active" and starts
  // expanded; others are collapsed and sort below. More than FOLDER_LIMIT
  // projects collapse into an "N more projects" row. Expanded: environments
  // (grouped by app) and primary surfaces; "…" holds secondary surfaces,
  // "Edit project…" and "Remove from space".
  const folders = element(document, "div", { className: "axiosozo-project-folders",
    attrs: { id: "axiosozo-project-folders", role: "group", "aria-label": "Projects in this space" } });
  const moreMenu = document.createXULElement("menupopup");
  moreMenu.id = "axiosozo-project-more-menu";
  (document.getElementById("mainPopupSet") ?? document.documentElement).appendChild(moreMenu);
  const expandedChoice = new Map(); // projectId → boolean chosen by the user in this window
  const showAll = new Set(); // space uuids whose full project list is open
  let foldersState = null; // { uuid, entries: [{ project, active, running }] }
  let folderSerial = 0;
  let foldersScheduled = false;
  let moreTarget = null; // { project, uuid } for the open "…" menu

  function removeFolders() { foldersState = null; folders.remove(); diagnostics.foldersShown = 0; diagnostics.blockShown = false; }

  function workspaceOf(uuid) {
    let workspace = null;
    // Only the Zen workspace adapter knows Zen's markup (handoff §2.6).
    try { workspace = adapter.workspaceElement?.(uuid) ?? null; } catch {}
    if (!workspace || (workspace.localName && workspace.localName !== "zen-workspace")) return null;
    return workspace;
  }

  function place(uuid) {
    let header = null;
    try { header = adapter.workspaceHeader?.(uuid) ?? null; } catch {}
    if (header?.parentNode) {
      // Zen's space header stays in the DOM when SpaceSwitcher hides it.
      if (folders.previousElementSibling !== header) header.after(folders);
      return true;
    }
    const workspace = workspaceOf(uuid);
    if (!workspace) return false;
    if (workspace.firstChild !== folders) workspace.prepend(folders);
    return true;
  }

  /** An open tab of this space whose page is under `base` (same origin, path prefix). */
  function openTabUnder(base, uuid) {
    const target = webURL(base);
    if (!target) return null;
    for (const tab of gBrowser.tabs ?? []) {
      if (tab.closing || adapter.workspaceForTab(tab) !== uuid) continue;
      const url = webURL(tab.linkedBrowser?.currentURI?.spec);
      if (url && url.origin === target.origin && url.pathname.startsWith(target.pathname)) return tab;
    }
    return null;
  }

  /** An open tab of this space linked to exactly this project environment
   * (loopback aliases included); else one under the base address. */
  function openTabForEnvironment(project, environment, uuid) {
    for (const tab of gBrowser.tabs ?? []) {
      if (tab.closing || adapter.workspaceForTab(tab) !== uuid) continue;
      const match = matchUrl(tab.linkedBrowser?.currentURI?.spec, uuid);
      if (match?.project.id === project.id && envKey(match.environment) === envKey(environment)) return tab;
    }
    return openTabUnder(environment.base_url, uuid);
  }

  function goTo(url, uuid, existing = undefined) {
    const target = webURL(url);
    if (!target) return null;
    const tab = existing === undefined ? openTabUnder(target.href, uuid) : existing;
    if (tab) { gBrowser.selectedTab = tab; return "selected"; }
    open(target.href, "tab", gBrowser.selectedTab);
    return "opened";
  }

  /** Projects of the space with their activity, most relevant first. */
  function folderEntries(uuid) {
    const inSpace = projects.filter(project => project.context_uuid === uuid);
    const openTabs = new Map();
    for (const tab of gBrowser.tabs ?? []) {
      if (tab.closing || adapter.workspaceForTab(tab) !== uuid) continue;
      const match = matchUrl(tab.linkedBrowser?.currentURI?.spec, uuid);
      if (match) openTabs.set(match.project.id, (openTabs.get(match.project.id) ?? 0) + 1);
    }
    return inSpace.map((project, order) => ({
      project, order, active: openTabs.has(project.id),
      running: cachedStatuses(project).some(s => s.status === "up"),
      last: lastActive.get(project.id) ?? 0,
    })).sort((a, b) => (Number(b.active) - Number(a.active)) || (Number(b.running) - Number(a.running))
      || (b.last - a.last) || (a.order - b.order));
  }

  function dot(status, parent) {
    return element(document, "span", { className: "axiosozo-status-dot",
      attrs: { "data-status": ["up", "down", "remote"].includes(status) ? status : "unknown", "aria-hidden": "true" } }, parent);
  }

  function statusSentence(project, statuses) {
    const envs = project.manifest?.environments ?? [];
    const local = envs.filter(e => environmentStatus(project, e, statuses) !== "remote");
    const up = local.filter(e => environmentStatus(project, e, statuses) === "up").length;
    const parts = [];
    if (local.length) parts.push(`${up} of ${local.length} local ${local.length === 1 ? "server" : "servers"} running`);
    if (envs.some(e => e.name === "production")) parts.push("production not checked");
    return parts.length ? `, ${parts.join(", ")}` : "";
  }

  function row(list, { kind, label, detail, url, status = null, onActivate, current = false, focusKey }) {
    const item = element(document, "li", { className: "axiosozo-project-link" }, list);
    const button = element(document, "button", { attrs: { "data-kind": kind, "data-focus-key": focusKey,
      "aria-label": `${label}, ${detail}${status && status !== "remote" ? `, ${STATUS_TEXT[status] ?? STATUS_TEXT.unknown}` : ""}` } }, item);
    if (status) dot(status, button);
    else {
      const icon = element(document, "img", { className: "axiosozo-project-link-icon", attrs: { alt: "", role: "presentation" } }, button);
      // Surfaces show the site's own favicon when Places has one.
      if (kind === "surface" && url) icon.setAttribute("src", `page-icon:${url}`);
    }
    element(document, "span", { className: "axiosozo-project-link-label", text: label }, button);
    element(document, "span", { className: "axiosozo-project-link-detail", text: detail }, button);
    if (current) button.setAttribute("aria-current", "true");
    button.addEventListener("click", event => { event.stopPropagation?.(); onActivate(); });
    return button;
  }

  function projectFolder(entry, uuid) {
    const { project } = entry;
    const id = project.id;
    const statuses = cachedStatuses(project);
    const expanded = expandedChoice.has(id) ? expandedChoice.get(id) : entry.active;
    const name = project.manifest?.name ?? "Project";
    const bodyId = `axiosozo-project-body-${++folderSerial}`;
    const block = element(document, "div", { className: "axiosozo-project-block",
      attrs: { "data-project-id": id, role: "group", "aria-label": `Project ${name}` } }, folders);
    block.toggleAttribute?.("data-expanded", expanded);
    block.toggleAttribute?.("data-active", entry.active);
    const toggle = element(document, "button", { className: "axiosozo-project-toggle",
      attrs: { "aria-expanded": String(expanded), "aria-controls": bodyId, "data-focus-key": `${id}:toggle`,
        "aria-label": `${name}${statusSentence(project, statuses)}. ${expanded ? "Collapse" : "Expand"} project` } }, block);
    element(document, "span", { className: "axiosozo-project-glyph", attrs: { "aria-hidden": "true" } }, toggle);
    element(document, "span", { className: "axiosozo-project-name", text: name }, toggle);
    const summary = element(document, "span", { className: "axiosozo-project-summary", attrs: { "aria-hidden": "true" } }, toggle);
    const environments = environmentsOf(project);
    for (const environment of environments) {
      const status = environmentStatus(project, environment, statuses);
      if (status !== "remote" || environment.name === "production") dot(status, summary).setAttribute("title", envLabel(project, environment));
    }
    element(document, "span", { className: "axiosozo-project-chevron", attrs: { "aria-hidden": "true" } }, toggle);
    toggle.addEventListener("click", event => {
      event.stopPropagation?.();
      expandedChoice.set(id, !expanded);
      // Opening a folder is the moment to look: refresh its dots now.
      if (!expanded) statusesFor(project, { fresh: true }).then(() => scheduleFolders()).catch(() => {});
      renderFolders();
    });
    const body = element(document, "div", { className: "axiosozo-project-body", attrs: { id: bodyId } }, block);
    body.hidden = !expanded;
    if (!expanded) return block;
    const list = element(document, "ul", { className: "axiosozo-project-links", attrs: { "aria-label": `${name} links` } }, body);
    const apps = appsOf(project);
    const grouped = apps.filter(Boolean).length > 1;
    const selectedMatch = pillState?.project.id === id ? pillState.environment : null;
    for (const app of grouped ? apps : [undefined]) {
      const envs = environments.filter(e => app === undefined || appOf(e) === app);
      if (!envs.length) continue;
      if (grouped) element(document, "li", { className: "axiosozo-project-app", text: app ?? "all apps", attrs: { "aria-hidden": "true" } }, list);
      for (const environment of envs) {
        const status = environmentStatus(project, environment, statuses);
        row(list, { kind: "environment", label: envLabel(project, environment), detail: hostLabel(environment.base_url),
          status: status === "remote" ? "remote" : status, focusKey: `${id}:env:${envKey(environment)}`,
          current: !!selectedMatch && envKey(selectedMatch) === envKey(environment),
          onActivate: () => goTo(environment.base_url, uuid, openTabForEnvironment(project, environment, uuid)) });
      }
    }
    const surfaces = project.manifest?.surfaces ?? [];
    for (const surface of surfaces.filter(s => core.surfaceProminence(s) === "primary")) {
      row(list, { kind: "surface", label: surface.name, detail: hostLabel(surface.url), url: surface.url, focusKey: `${id}:surface:${surface.url}`,
        onActivate: () => goTo(surface.url, uuid) });
    }
    const moreItem = element(document, "li", { className: "axiosozo-project-link" }, list);
    const more = element(document, "button", { className: "axiosozo-project-more", attrs: { "data-kind": "more",
      "aria-haspopup": "menu", "aria-expanded": "false", "data-focus-key": `${id}:more`, "aria-label": `More for ${name}` } }, moreItem);
    element(document, "span", { className: "axiosozo-project-more-glyph", attrs: { "aria-hidden": "true" }, text: "…" }, more);
    element(document, "span", { className: "axiosozo-project-link-label", text: "More" }, more);
    more.addEventListener("click", event => {
      event.stopPropagation?.();
      buildMoreMenu(project, uuid, more);
      if (typeof moreMenu.openPopup === "function") moreMenu.openPopup(more, "after_start");
    });
    return block;
  }

  function buildMoreMenu(project, uuid, anchor) {
    while (moreMenu.firstChild) moreMenu.firstChild.remove();
    moreTarget = { project, uuid, anchor };
    const secondary = (project.manifest?.surfaces ?? []).filter(s => core.surfaceProminence(s) !== "primary");
    for (const surface of secondary) menuItem(moreMenu, { label: `${surface.name} · ${hostLabel(surface.url)}`, "data-url": surface.url });
    if (secondary.length) moreMenu.appendChild(document.createXULElement("menuseparator"));
    if (typeof openSettings === "function") menuItem(moreMenu, { label: "Edit project…", "data-action": "edit" });
    menuItem(moreMenu, { label: "Remove from space", "data-action": "remove" });
  }

  const onMoreCommand = event => {
    const item = event.target;
    if (!moreTarget) return;
    const { project, uuid } = moreTarget;
    const url = item?.getAttribute?.("data-url");
    const action = item?.getAttribute?.("data-action");
    if (url) goTo(url, uuid);
    else if (action === "edit") openSettings?.(project.id, { edit: true });
    else if (action === "remove") {
      // Reversible from about:axiosozo (Projects); the folder and repository are untouched.
      Promise.resolve(services.updateProject(project.id, { context_uuid: null })).catch(error => console.error("AxioSozo: remove from space failed", error));
    }
  };
  const onMoreShowing = event => { if (event.target === moreMenu) moreTarget?.anchor?.setAttribute("aria-expanded", "true"); };
  const onMoreHidden = event => { if (event.target === moreMenu) moreTarget?.anchor?.setAttribute("aria-expanded", "false"); };
  moreMenu.addEventListener("command", onMoreCommand);
  moreMenu.addEventListener("popupshowing", onMoreShowing);
  moreMenu.addEventListener("popuphidden", onMoreHidden);
  cleanups.push(() => {
    moreMenu.removeEventListener("command", onMoreCommand);
    moreMenu.removeEventListener("popupshowing", onMoreShowing);
    moreMenu.removeEventListener("popuphidden", onMoreHidden);
    moreMenu.remove(); folders.remove();
  });

  function renderFolders() {
    foldersScheduled = false;
    if (disposed) return;
    const uuid = privateWindow ? null : adapter.activeWorkspaceUuid();
    const entries = uuid ? folderEntries(uuid) : [];
    if (!entries.length || !place(uuid)) { removeFolders(); return; }
    const focusKey = folders.contains?.(document.activeElement) ? document.activeElement?.getAttribute?.("data-focus-key") : null;
    foldersState = { uuid, entries };
    while (folders.firstChild) folders.firstChild.remove();
    const all = showAll.has(uuid);
    const visible = entries.length > FOLDER_LIMIT && !all ? entries.slice(0, FOLDER_LIMIT) : entries;
    for (const entry of visible) projectFolder(entry, uuid);
    if (entries.length > FOLDER_LIMIT) {
      const hidden = entries.length - FOLDER_LIMIT;
      const toggleAll = element(document, "button", { className: "axiosozo-project-overflow",
        attrs: { "aria-expanded": String(all), "data-focus-key": "overflow" },
        text: all ? "Show fewer projects" : `${hidden} more ${hidden === 1 ? "project" : "projects"}` }, folders);
      toggleAll.addEventListener("click", event => {
        event.stopPropagation?.();
        if (all) showAll.delete(uuid); else showAll.add(uuid);
        renderFolders();
      });
    }
    if (focusKey) folders.querySelector?.(`[data-focus-key="${focusKey.replace(/["\\]/gu, "\\$&")}"]`)?.focus?.();
    diagnostics.foldersShown = visible.length; diagnostics.blockShown = true;
  }

  /** Coalesces renders from bursts of tab events into one microtask. */
  function scheduleFolders() {
    if (foldersScheduled || disposed) return;
    foldersScheduled = true;
    Promise.resolve().then(renderFolders).catch(() => {});
  }

  async function refreshFolders({ fresh = false } = {}) {
    await ensureProjects();
    if (disposed) return;
    renderFolders();
    if (!foldersState) return;
    const { entries } = foldersState;
    if (!privateWindow) lastStatusRefresh = clock();
    await Promise.all(entries.map(entry => statusesFor(entry.project, { fresh }).catch(() => [])));
    if (!disposed) renderFolders();
  }

  async function refreshStatuses() {
    if (privateWindow) return;
    lastStatusRefresh = clock();
    const due = new Map((foldersState?.entries ?? []).map(entry => [entry.project.id, entry.project]));
    if (pillState) due.set(pillState.project.id, pillState.project);
    for (const project of due.values()) await statusesFor(project, { fresh: true });
    if (disposed) return;
    if (pillState) { pillState.statuses = cachedStatuses(pillState.project); renderPill(); }
    renderFolders();
  }

  // ---- Waiting overlay --------------------------------------------------------------
  const waits = new Map(); // tab → state
  const cancelled = new WeakMap(); // tab → url the user cancelled waiting for
  // tab → href of the most recent refused top-level load, until another load
  // starts or another document commits. Gecko reports the refused STATE_STOP
  // *before* the error page's location change, so the tab's currentURI is
  // still the previous page when onRefused runs.
  const refused = new WeakMap();
  let overlaySerial = 0;

  function overlayFor(state) {
    const titleId = `axiosozo-waiting-title-${++overlaySerial}`; // unique per tab
    const overlay = element(document, "div", { className: "axiosozo-waiting",
      attrs: { role: "region", "aria-labelledby": titleId, "data-axiosozo-waiting": "" } });
    const card = element(document, "div", { className: "axiosozo-waiting-card" }, overlay);
    element(document, "div", { className: "axiosozo-waiting-spinner", attrs: { "aria-hidden": "true" } }, card);
    state.title = element(document, "h1", { className: "axiosozo-waiting-title",
      attrs: { id: titleId }, text: `Waiting for ${state.serviceName} on port ${state.port}…` }, card);
    state.status = element(document, "p", { className: "axiosozo-waiting-status", attrs: { "aria-live": "polite" } }, card);
    element(document, "p", { className: "axiosozo-waiting-url", text: state.display }, card);
    const actions = element(document, "div", { className: "axiosozo-waiting-actions" }, card);
    state.retry = element(document, "button", { className: "axiosozo-waiting-retry", text: "Try again" }, actions);
    state.cancel = element(document, "button", { className: "axiosozo-waiting-cancel", text: "Cancel" }, actions);
    state.onRetry = () => retryWait(state);
    state.onCancel = () => { cancelled.set(state.tab, state.url); endWait(state); };
    state.retry.addEventListener("click", state.onRetry);
    state.cancel.addEventListener("click", state.onCancel);
    return overlay;
  }

  function setWaitMode(state, mode) {
    state.mode = mode;
    state.overlay.setAttribute("data-mode", mode);
    state.retry.hidden = mode === "polling" || mode === "reloading";
    state.status.textContent = mode === "manual"
      ? `Start ${state.serviceName} for ${state.projectName}, then choose Try again.`
      : mode === "stopped" ? `${state.serviceName} has not answered yet. Start it, then choose Try again.`
      : mode === "reloading" ? `${state.serviceName} answered. Loading…`
      : `Start ${state.serviceName} for ${state.projectName}. This page loads when it answers.`;
  }

  function endWait(state) {
    if (state.ended) return;
    state.ended = true;
    if (state.timer !== null) timers.clearTimeout(state.timer);
    state.timer = null;
    state.retry.removeEventListener("click", state.onRetry);
    state.cancel.removeEventListener("click", state.onCancel);
    state.overlay.remove();
    if (state.restorePosition !== null) state.stack.style.position = state.restorePosition;
    if (waits.get(state.tab) === state) waits.delete(state.tab);
  }

  function schedulePoll(state) {
    if (state.ended) return;
    if (state.attempts >= WAIT_MAX_ATTEMPTS) { setWaitMode(state, "stopped"); return; }
    const delay = WAIT_BACKOFF_MS[Math.min(state.attempts, WAIT_BACKOFF_MS.length - 1)];
    state.timer = timers.setTimeout(() => { state.timer = null; poll(state).catch(() => {}); }, delay);
  }

  async function probeOnce(state) {
    if (privateWindow) return false;
    diagnostics.probes++;
    if (typeof probe === "function") return (await probe({ url: state.origin, port: state.port })) === true;
    const statuses = await statusesFor(state.project, { fresh: true });
    return statuses.find(s => s.port === state.port && s.name === state.serviceName)?.status === "up"
      || statuses.find(s => s.port === state.port)?.status === "up";
  }

  async function poll(state) {
    if (state.ended) return;
    state.attempts++;
    let up = false;
    try { up = await probeOnce(state); } catch { up = false; }
    if (state.ended) return;
    if (!up) { schedulePoll(state); return; }
    setWaitMode(state, "reloading");
    diagnostics.reloads++;
    state.tab.linkedBrowser.reload();
  }

  function startPolling(state) {
    if (state.timer !== null) { timers.clearTimeout(state.timer); state.timer = null; }
    if (!state.canPoll) { setWaitMode(state, "manual"); return; }
    setWaitMode(state, "polling");
    schedulePoll(state);
  }

  function retryWait(state) {
    if (state.ended) return;
    state.attempts = 0; state.reloadFailures = 0;
    if (state.canPoll) startPolling(state);
    else { setWaitMode(state, "reloading"); diagnostics.reloads++; state.tab.linkedBrowser.reload(); }
  }

  async function onRefused(tab, spec) {
    const url = webURL(spec);
    if (!url || disposed) return;
    const existing = waits.get(tab);
    if (existing && existing.url === url.href) {
      // Our reload (or the user's) was refused again: keep the same overlay.
      if (existing.mode === "reloading") existing.reloadFailures++;
      if (existing.reloadFailures >= WAIT_MAX_RELOAD_FAILURES) { setWaitMode(existing, "stopped"); return; }
      existing.attempts = 0;
      startPolling(existing);
      return;
    }
    if (cancelled.get(tab) === url.href) return;
    await ensureProjects();
    const match = matchUrl(url.href, spaceOfTab(tab));
    if (disposed || !match?.project || !tab.linkedBrowser || tab.closing) return;
    const environments = environmentsOf(match.project);
    if (!core.isDeclaredLocalOrigin(environments, url.href)) return; // neterror stays unchanged
    if (refused.get(tab) !== url.href) return; // another load started or committed meanwhile
    const stack = browserStackOf(window, tab);
    if (!stack) return;
    waits.get(tab) && endWait(waits.get(tab));
    const port = Number(url.port) || (url.protocol === "https:" ? 443 : 80);
    const declared = (match.project.manifest?.services ?? []).find(s => s.port === port);
    const projectName = match.project.manifest?.name ?? "this project";
    const state = { tab, url: url.href, origin: url.origin, port, project: match.project, projectName,
      serviceName: declared?.name ?? `${projectName} ${envName(match.environment) ?? "local"} server`,
      display: `${url.host}${url.pathname}`, canPoll: !privateWindow && (typeof probe === "function" || !!declared),
      attempts: 0, reloadFailures: 0, timer: null, ended: false, mode: null, stack, restorePosition: null };
    state.overlay = overlayFor(state);
    if (window.getComputedStyle?.(stack)?.position === "static") {
      state.restorePosition = stack.style.position ?? "";
      stack.style.position = "relative";
    }
    stack.appendChild(state.overlay);
    waits.set(tab, state);
    diagnostics.waits++;
    startPolling(state);
  }

  // ---- Wiring ---------------------------------------------------------------------------
  const progress = {
    onStateChange(browser, webProgress, request, flags, status) {
      if (!webProgress?.isTopLevel) return;
      if ((flags & WPL.STATE_START) && (flags & WPL.STATE_IS_WINDOW)) {
        const started = gBrowser.getTabForBrowser(browser);
        if (started) refused.delete(started); // a newer load supersedes the refusal
        return;
      }
      if (!(flags & WPL.STATE_STOP) || status !== NS_ERROR_CONNECTION_REFUSED) return;
      const tab = gBrowser.getTabForBrowser(browser);
      if (!tab) return;
      let spec = null;
      try { spec = request?.URI?.spec ?? request?.originalURI?.spec ?? null; } catch {}
      spec ??= browser.currentURI?.spec;
      const href = webURL(spec)?.href;
      if (href) refused.set(tab, href);
      onRefused(tab, spec).catch(() => {});
    },
    onLocationChange(browser, webProgress, request, location, flags) {
      if (!webProgress?.isTopLevel || (flags & WPL.LOCATION_CHANGE_SAME_DOCUMENT)) return;
      const tab = gBrowser.getTabForBrowser(browser);
      const state = tab && waits.get(tab);
      const errorPage = !!(flags & WPL.LOCATION_CHANGE_ERROR_PAGE);
      if (tab && !(errorPage && location?.spec === refused.get(tab))) refused.delete(tab);
      if (state && !(errorPage && location?.spec === state.url)) endWait(state);
      if (tab && (!errorPage || cancelled.get(tab) !== location?.spec)) cancelled.delete(tab);
      if (tab === gBrowser.selectedTab) refreshPill().catch(() => {});
      else scheduleFolders(); // a background tab may now belong to a project
    },
  };
  cleanups.push(addTabsProgressListener(window, progress));

  const onTabSelect = () => { refreshPill().catch(() => {}); };
  const onTabClose = event => { const state = waits.get(event.target); if (state) endWait(state); scheduleFolders(); };
  gBrowser.tabContainer.addEventListener("TabSelect", onTabSelect);
  gBrowser.tabContainer.addEventListener("TabClose", onTabClose);
  cleanups.push(() => {
    gBrowser.tabContainer.removeEventListener("TabSelect", onTabSelect);
    gBrowser.tabContainer.removeEventListener("TabClose", onTabClose);
  });

  cleanups.push(adapter.onChange(() => {
    refreshFolders().catch(() => {}); // switched, created (late restore), renamed or deleted
    refreshPill().catch(() => {});
  }));
  // Project edits (environments, space) re-link open tabs at once.
  for (const name of ["projects", "contexts"]) {
    cleanups.push(services.on(name, () => {
      statusCache.clear();
      loadProjects().then(() => Promise.all([refreshFolders(), refreshPill()])).catch(() => {});
    }));
  }
  if (!privateWindow) {
    cleanups.push(services.on("services", () => {
      // serviceStatus may itself emit "services"; the throttle prevents a loop.
      if (clock() - lastStatusRefresh < SERVICE_EVENT_THROTTLE_MS) return;
      refreshStatuses().catch(() => {});
    }));
    const refreshTimer = timers.setInterval(() => {
      if (disposed || document.hidden || (!pillState && !foldersState)) return;
      refreshStatuses().catch(() => {});
    }, SERVICE_REFRESH_MS);
    cleanups.push(() => timers.clearInterval(refreshTimer));
  }

  loadProjects();
  refreshPill().catch(() => {});
  refreshFolders().catch(() => {});

  return Object.freeze({
    refresh: () => loadProjects().then(() => Promise.all([refreshPill(), refreshFolders()])),
    switchEnvironment: switchTo,
    diagnostics: () => ({ ...diagnostics, waiting: [...waits.values()].map(s => ({ url: s.url, port: s.port, mode: s.mode, attempts: s.attempts })) }),
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const state of [...waits.values()]) endWait(state);
      for (const cleanup of cleanups.reverse()) { try { cleanup?.(); } catch {} }
      clearMenu();
      while (moreMenu.firstChild) moreMenu.firstChild.remove();
    },
  });
}
