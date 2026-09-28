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
 * F4. `services`: AxioSozoServices (projectForUrl, listContexts, getProject,
 * serviceStatus, on). `adapter`: ZenWorkspaceAdapter (activeWorkspaceUuid,
 * workspaceForTab, isPrivateWindow, onChange, optional workspaceElement).
 * Optional: `core` (contexts core), `timers`, `clock`, `probe({ url, port }) → boolean`,
 * `openUrl(url, where, tab)`, `openSettings(projectId)` (the project in about:axiosozo).
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
  const diagnostics = { pillShown: false, blockShown: false, waits: 0, probes: 0, reloads: 0, switches: 0 };
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
  const statusCache = new Map(); // projectId → { statuses, at }
  let lastStatusRefresh = 0;

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

  // ---- Environment pill --------------------------------------------------------
  const pill = element(document, "button", { className: "axiosozo-env-pill",
    attrs: { id: "axiosozo-env-pill", "aria-haspopup": "menu", "aria-expanded": "false" } });
  pill.hidden = true;
  const pillLabel = element(document, "span", { className: "axiosozo-env-pill-label" }, pill);
  element(document, "span", { className: "axiosozo-env-pill-alert", attrs: { "aria-hidden": "true" } }, pill);
  const menu = document.createXULElement("menupopup");
  menu.id = "axiosozo-env-menu";
  let pillState = null; // { tab, url, project, current, environments, statuses }
  let pillToken = 0;

  const pageActions = document.getElementById("page-action-buttons");
  if (pageActions) {
    pageActions.prepend(pill);
    (document.getElementById("mainPopupSet") ?? document.documentElement).appendChild(menu);
    cleanups.push(() => { pill.remove(); menu.remove(); });
  }

  function hidePill() {
    pillState = null; pill.hidden = true; diagnostics.pillShown = false;
    pill.removeAttribute("data-environment"); pill.removeAttribute("data-services");
    if (blockState) renderBlock(); // the block marks the current environment
  }

  function renderPill() {
    if (!pillState) return hidePill();
    const { project, current, statuses } = pillState;
    const name = project.manifest?.name ?? "Project";
    const down = statuses.filter(s => s.status === "down").length;
    pillLabel.textContent = current;
    pill.setAttribute("data-environment", current);
    if (down) pill.setAttribute("data-services", "down"); else pill.removeAttribute("data-services");
    const serviceText = down ? `, ${down} of ${statuses.length} services not running` : "";
    pill.setAttribute("aria-label", `${name}: ${current} environment${serviceText}. Switch environment`);
    pill.setAttribute("title", `${name} · ${current}${serviceText}`); // HTML elements in chrome use title for tooltips
    pill.hidden = false; diagnostics.pillShown = true;
    if (blockState) renderBlock();
  }

  async function refreshPill() {
    const token = ++pillToken;
    const tab = gBrowser.selectedTab;
    const url = webURL(tab?.linkedBrowser?.currentURI?.spec);
    if (!url) { hidePill(); return; }
    let match = null;
    try { match = await services.projectForUrl(url.href, adapter.workspaceForTab(tab) ?? undefined); } catch {}
    if (disposed || token !== pillToken) return;
    const current = envName(match?.environment);
    if (!match?.project || !current) { hidePill(); return; }
    const environments = environmentsOf(match.project);
    pillState = { tab, url: url.href, project: match.project, current, environments,
      statuses: statusCache.get(match.project.id)?.statuses ?? [] };
    renderPill();
    const statuses = await statusesFor(match.project);
    if (disposed || token !== pillToken || !pillState) return;
    pillState.statuses = statuses; renderPill();
  }

  function clearMenu() { while (menu.firstChild) menu.firstChild.remove(); }
  function buildMenu() {
    clearMenu();
    if (!pillState) return false;
    const { project, current, environments, statuses } = pillState;
    const header = document.createXULElement("menuitem");
    header.setAttribute("label", project.manifest?.name ?? "Project");
    header.setAttribute("disabled", "true");
    menu.appendChild(header);
    menu.appendChild(document.createXULElement("menuseparator"));
    for (const environment of environments) {
      const item = document.createXULElement("menuitem");
      item.setAttribute("type", "radio");
      item.setAttribute("label", `${environment.name} · ${hostLabel(environment.base_url)}`);
      item.setAttribute("data-environment", environment.name);
      if (environment.name === current) { item.setAttribute("checked", "true"); item.setAttribute("disabled", "true"); }
      menu.appendChild(item);
    }
    if (statuses.length) {
      menu.appendChild(document.createXULElement("menuseparator"));
      for (const service of statuses) {
        const item = document.createXULElement("menuitem");
        item.setAttribute("label", `${service.name} (port ${service.port}): ${STATUS_TEXT[service.status] ?? STATUS_TEXT.unknown}`);
        item.setAttribute("disabled", "true");
        item.setAttribute("data-status", STATUS_TEXT[service.status] ? service.status : "unknown");
        menu.appendChild(item);
      }
    }
    return true;
  }

  /** Switches the selected tab to the same path/query/hash on `target`. */
  function switchTo(target) {
    if (!pillState || target === pillState.current) return null;
    const next = core.switchEnvironment(pillState.environments, pillState.url, target);
    if (!next || !webURL(next)) return null;
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
    const target = event.target?.getAttribute?.("data-environment");
    if (target) switchTo(target);
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

  // ---- Project block -------------------------------------------------------------
  // One quiet row under the space name: project name and service dots. Expanded,
  // it lists the project's environments, services and web surfaces as tab-like
  // rows; a row selects an open tab of that site in this space before it opens
  // a new one. Collapsed by default, remembered per project for this window.
  const block = element(document, "div", { className: "axiosozo-project-block", attrs: { id: "axiosozo-project-block", role: "group" } });
  const blockToggle = element(document, "button", { className: "axiosozo-project-toggle",
    attrs: { "aria-expanded": "false", "aria-controls": "axiosozo-project-body" } }, block);
  element(document, "span", { className: "axiosozo-project-glyph", attrs: { "aria-hidden": "true" } }, blockToggle);
  const blockName = element(document, "span", { className: "axiosozo-project-name" }, blockToggle);
  const blockSummary = element(document, "span", { className: "axiosozo-project-summary", attrs: { "aria-hidden": "true" } }, blockToggle);
  element(document, "span", { className: "axiosozo-project-chevron", attrs: { "aria-hidden": "true" } }, blockToggle);
  const blockBody = element(document, "div", { className: "axiosozo-project-body", attrs: { id: "axiosozo-project-body" } }, block);
  const blockLinks = element(document, "ul", { className: "axiosozo-project-links", attrs: { "aria-label": "Project links" } }, blockBody);
  const blockList = element(document, "ul", { className: "axiosozo-project-services", attrs: { id: "axiosozo-project-services", "aria-label": "Services" } }, blockBody);
  const blockSettings = element(document, "button", { className: "axiosozo-project-settings", text: "Project settings" }, blockBody);
  let blockState = null; // { uuid, project, statuses }
  let blockToken = 0;
  const expandedProjects = new Set();

  function removeBlock() { blockState = null; block.remove(); diagnostics.blockShown = false; }

  function blockAnchor(uuid) {
    let workspace = null;
    // Only the Zen workspace adapter knows Zen's markup (handoff §2.6).
    try { workspace = adapter.workspaceElement?.(uuid) ?? null; } catch {}
    if (!workspace || (workspace.localName && workspace.localName !== "zen-workspace")) return null;
    return workspace;
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

  function goTo(url, uuid) {
    const target = webURL(url);
    if (!target) return null;
    const existing = openTabUnder(target.href, uuid);
    if (existing) { gBrowser.selectedTab = existing; return "selected"; }
    open(target.href, "tab", gBrowser.selectedTab);
    return "opened";
  }

  function linkRow(kind, label, detail, url, uuid) {
    const item = element(document, "li", { className: "axiosozo-project-link" }, blockLinks);
    const button = element(document, "button", { attrs: { "data-kind": kind, "aria-label": `${label}, ${detail}` } }, item);
    const icon = element(document, "img", { className: "axiosozo-project-link-icon", attrs: { alt: "", role: "presentation" } }, button);
    // Surfaces show the site's own favicon when Places has one; environments use a fixed glyph.
    if (kind === "surface") icon.setAttribute("src", `page-icon:${url}`);
    element(document, "span", { className: "axiosozo-project-link-label", text: label }, button);
    element(document, "span", { className: "axiosozo-project-link-detail", text: detail }, button);
    button.addEventListener("click", event => { event.stopPropagation?.(); goTo(url, uuid); });
    return button;
  }

  function renderBlock() {
    if (!blockState) return removeBlock();
    const { uuid, project, statuses } = blockState;
    const workspace = blockAnchor(uuid);
    if (!workspace) return removeBlock();
    const expanded = expandedProjects.has(project.id);
    const name = project.manifest?.name ?? "Project";
    const up = statuses.filter(s => s.status === "up").length;
    const down = statuses.filter(s => s.status === "down").length;
    blockName.textContent = name;
    while (blockSummary.firstChild) blockSummary.firstChild.remove();
    for (const service of statuses) {
      element(document, "span", { className: "axiosozo-status-dot",
        attrs: { "data-status": STATUS_TEXT[service.status] ? service.status : "unknown", "aria-hidden": "true" } }, blockSummary);
    }
    const serviceText = statuses.length ? `, ${up} of ${statuses.length} services running` : "";
    block.setAttribute("aria-label", `Project ${name}`);
    block.toggleAttribute?.("data-expanded", expanded);
    if (down) block.setAttribute("data-services", "down"); else block.removeAttribute("data-services");
    blockToggle.setAttribute("aria-label", `${name}${serviceText}. ${expanded ? "Collapse" : "Expand"} project`);
    blockToggle.setAttribute("aria-expanded", String(expanded));
    while (blockLinks.firstChild) blockLinks.firstChild.remove();
    const current = pillState?.project.id === project.id ? pillState.current : null;
    for (const environment of environmentsOf(project)) {
      const button = linkRow("environment", environment.name, hostLabel(environment.base_url), environment.base_url, uuid);
      if (environment.name === current) button.setAttribute("aria-current", "true");
    }
    for (const surface of project.manifest?.surfaces ?? []) {
      linkRow("surface", surface.name, hostLabel(surface.url), surface.url, uuid);
    }
    while (blockList.firstChild) blockList.firstChild.remove();
    for (const service of statuses) {
      const status = STATUS_TEXT[service.status] ? service.status : "unknown";
      const item = element(document, "li", { className: "axiosozo-project-service" }, blockList);
      element(document, "span", { className: "axiosozo-status-dot", attrs: { "data-status": status, "aria-hidden": "true" } }, item);
      element(document, "span", { className: "axiosozo-service-name", text: service.name }, item);
      element(document, "span", { className: "axiosozo-service-status", text: `${STATUS_TEXT[status]} · port ${service.port}` }, item);
    }
    blockBody.hidden = !expanded;
    blockLinks.hidden = !blockLinks.children.length;
    blockList.hidden = !expanded || statuses.length === 0;
    blockSettings.hidden = typeof openSettings !== "function";
    if (block.parentNode !== workspace) {
      const indicator = workspace.querySelector?.(".zen-current-workspace-indicator");
      if (indicator) indicator.after(block); else workspace.prepend(block);
    }
    diagnostics.blockShown = true;
  }

  async function refreshBlock({ fresh = false } = {}) {
    const token = ++blockToken;
    const uuid = privateWindow ? null : adapter.activeWorkspaceUuid();
    if (!uuid) { removeBlock(); return; }
    let project = null;
    try {
      const contexts = await services.listContexts();
      const context = Array.isArray(contexts) ? contexts.find(c => c.uuid === uuid) : null;
      if (context?.type === "project" && context.project_id) project = await services.getProject(context.project_id);
    } catch {}
    if (disposed || token !== blockToken) return;
    if (!project) { removeBlock(); return; }
    blockState = { uuid, project, statuses: statusCache.get(project.id)?.statuses ?? [] };
    renderBlock();
    const statuses = await statusesFor(project, { fresh });
    if (disposed || token !== blockToken || !blockState) return;
    blockState.statuses = statuses; renderBlock();
  }

  const onToggle = event => {
    event.stopPropagation?.();
    if (!blockState) return;
    const id = blockState.project.id;
    if (expandedProjects.has(id)) expandedProjects.delete(id);
    else {
      expandedProjects.add(id);
      // Opening the block is the moment to look: refresh service dots now.
      refreshStatuses().catch(() => {});
    }
    renderBlock();
  };
  const onSettings = event => {
    event.stopPropagation?.();
    if (blockState) openSettings?.(blockState.project.id);
  };
  blockToggle.addEventListener("click", onToggle);
  blockSettings.addEventListener("click", onSettings);
  cleanups.push(() => {
    blockToggle.removeEventListener("click", onToggle);
    blockSettings.removeEventListener("click", onSettings);
    block.remove();
  });

  async function refreshStatuses() {
    if (privateWindow) return;
    lastStatusRefresh = clock();
    const projects = new Map([pillState?.project, blockState?.project].filter(Boolean).map(p => [p.id, p]));
    for (const project of projects.values()) await statusesFor(project, { fresh: true });
    if (disposed) return;
    if (pillState) { pillState.statuses = statusCache.get(pillState.project.id)?.statuses ?? []; renderPill(); }
    if (blockState) { blockState.statuses = statusCache.get(blockState.project.id)?.statuses ?? []; renderBlock(); }
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
    let match = null;
    try { match = await services.projectForUrl(url.href, adapter.workspaceForTab(tab) ?? undefined); } catch {}
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
    },
  };
  cleanups.push(addTabsProgressListener(window, progress));

  const onTabSelect = () => { refreshPill().catch(() => {}); };
  const onTabClose = event => { const state = waits.get(event.target); if (state) endWait(state); };
  gBrowser.tabContainer.addEventListener("TabSelect", onTabSelect);
  gBrowser.tabContainer.addEventListener("TabClose", onTabClose);
  cleanups.push(() => {
    gBrowser.tabContainer.removeEventListener("TabSelect", onTabSelect);
    gBrowser.tabContainer.removeEventListener("TabClose", onTabClose);
  });

  cleanups.push(adapter.onChange(change => {
    refreshBlock().catch(() => {}); // switched, created (late restore), renamed or deleted
    refreshPill().catch(() => {});
  }));
  for (const name of ["projects", "contexts"]) {
    cleanups.push(services.on(name, () => { statusCache.clear(); refreshBlock().catch(() => {}); refreshPill().catch(() => {}); }));
  }
  if (!privateWindow) {
    cleanups.push(services.on("services", () => {
      // serviceStatus may itself emit "services"; the throttle prevents a loop.
      if (clock() - lastStatusRefresh < SERVICE_EVENT_THROTTLE_MS) return;
      refreshStatuses().catch(() => {});
    }));
    const refreshTimer = timers.setInterval(() => {
      if (disposed || document.hidden || (!pillState && !blockState)) return;
      refreshStatuses().catch(() => {});
    }, SERVICE_REFRESH_MS);
    cleanups.push(() => timers.clearInterval(refreshTimer));
  }

  refreshPill().catch(() => {});
  refreshBlock().catch(() => {});

  return Object.freeze({
    refresh: () => Promise.all([refreshPill(), refreshBlock()]),
    switchEnvironment: switchTo,
    diagnostics: () => ({ ...diagnostics, waiting: [...waits.values()].map(s => ({ url: s.url, port: s.port, mode: s.mode, attempts: s.attempts })) }),
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const state of [...waits.values()]) endWait(state);
      for (const cleanup of cleanups.reverse()) { try { cleanup?.(); } catch {} }
      clearMenu();
    },
  });
}
