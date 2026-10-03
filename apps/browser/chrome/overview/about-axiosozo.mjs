/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// about:axiosozo page script. Runs with the about:axiosozo content
// principal; its only channel is window.AxioSozoOverview (the actor child).
// All text is inserted with textContent; nothing is parsed as markup. Icons
// are SVG elements built here (the page CSS may not load url() resources).
//
// Words: a "space" in this page is a Zen space (workspace) with an AxioSozo
// type; the contracts call the same thing a context.

import * as M from "./overview-model.mjs";

const api = window.AxioSozoOverview ?? null;
const $ = id => document.getElementById(id);
let idCounter = 0;
const newId = prefix => `${prefix}-${++idCounter}`;

const TYPE_LABELS = M.TYPE_LABELS;

const state = {
  // connected: not known to be refused (false once the actor refused this page
  // for good, or without the actor). admitted: the actor actually answered this
  // shown page; nothing is read before it (see admit()).
  connected: !!api,
  admitted: false,
  view: "projects",
  flags: { contexts: true, enginePreferences: false, jevKeyEntry: false, openaiKeyEntry: false },
  contexts: [], projects: [], rules: [], orphans: [], attention: [], jev: null,
  // project id → its own container as the browser reports it (listProjectContainers)
  containers: new Map(),
  serviceStatus: new Map(), ledgerSummary: [], usageToday: [], usageWeek: [],
  activeSpace: null, providers: null, providersLoading: false, placement: null,
  // Decision keys (AI & keys), per provider: the browser's last answer, the
  // operation on its way, the last fixed code to show and why the page cannot
  // check at all. A typed key is never kept here.
  keys: Object.fromEntries(M.DECISION_PROVIDERS.map(provider =>
    [provider, { card: null, busy: null, notice: null, refused: null, ticket: 0 }])),
  // Project home (#project=<id>): the id from the route, the actor's answer for
  // it ({ id, data } or { id, problem }), projects whose local servers are being
  // checked, and whether the first load finished (nothing renders half-loaded).
  // homeProbe: this visit of a home still owes its one local-server check.
  homeId: null, home: null, checking: new Set(), loaded: false, focusHome: false, returnTo: null, homeProbe: false,
  // Page lifetime: false from pagehide until a persisted pageshow; started
  // once the first full load (and its one-time work) completed.
  active: true, started: false,
  // Agent status (AI & keys): the browser's endpoint state or the code it
  // refused with, hook settings per agent for the listening socket, and
  // whether a switch request is on its way.
  agents: { endpoint: null, error: null, hooks: new Map(), socket: null, busy: false },
};

// ---------------------------------------------------------------- request lifetimes

// Every answer that can publish state carries a ticket; only the answer to
// the latest ticket of its kind may publish. Tickets never repeat (one
// counter for all), so clearing them cannot let an old answer match a new one.
let ticketSerial = 0;
const nextTicket = () => ++ticketSerial;
const latest = { home: 0, projects: 0, contexts: 0, agents: 0, admission: 0 };
const statusTickets = new Map(); // project id → its latest local-server check
/** Voids any home answer still on its way (and a retry it would schedule). */
const invalidateHome = () => { latest.home = nextTicket(); };

// ---------------------------------------------------------------- DOM helpers

function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") element.className = value;
    else if (key === "text") element.textContent = value;
    else if (key.startsWith("on")) element.addEventListener(key.slice(2), value);
    else if (["checked", "disabled", "hidden", "value", "selected", "required", "readOnly", "open"].includes(key)) element[key] = value;
    else element.setAttribute(key, value === true ? "" : String(value));
  }
  element.append(...nodes(children));
  return element;
}

/** Children as h() takes them: arrays flattened; null, undefined and false
 * (an absent optional part) left out; any other value as text. The native
 * append/replaceChildren would show null as the text "null". */
function nodes(children) {
  return children.flat(Infinity).filter(child => child !== null && child !== undefined && child !== false)
    .map(child => (child instanceof Node ? child : document.createTextNode(String(child))));
}

/** replaceChildren with h()'s rules: absent optional parts are left out. */
function fill(element, ...children) {
  element.replaceChildren(...nodes(children));
  return element;
}

const SVG = "http://www.w3.org/2000/svg";
// 16px line icons, drawn with currentColor.
const ICONS = {
  open: ["M6 3.5h6.5V10", "M12.5 3.5 4 12"],
  more: [],
  close: ["M4 4l8 8", "M12 4l-8 8"],
  check: ["M3.5 8.5 6.5 11.5 12.5 4.5"],
  refresh: ["M13 8a5 5 0 1 1-1.46-3.54", "M13 3v2.5h-2.5"],
  space: ["M3 3.5h10v9H3z", "M6 3.5v9"],
  globe: ["M8 2.5a5.5 5.5 0 1 0 0 11a5.5 5.5 0 1 0 0-11", "M2.5 8h11", "M8 2.5c1.6 1.6 2.3 3.5 2.3 5.5S9.6 11.9 8 13.5C6.4 11.9 5.7 10 5.7 8S6.4 4.1 8 2.5"],
  laptop: ["M3.5 4h9v6h-9z", "M2 12.5h12"],
  plus: ["M8 3v10", "M3 8h10"],
};
function icon(name, size = 16) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.5");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  if (name === "more") {
    for (const x of [4, 8, 12]) {
      const dot = document.createElementNS(SVG, "circle");
      dot.setAttribute("cx", String(x)); dot.setAttribute("cy", "8"); dot.setAttribute("r", "1.1");
      dot.setAttribute("fill", "currentColor"); dot.setAttribute("stroke", "none");
      svg.append(dot);
    }
    return svg;
  }
  for (const d of ICONS[name] ?? []) {
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}

function option(value, label, selected) {
  return h("option", { value, selected: value === selected }, label);
}

function field({ label, control, help }) {
  const helpId = help ? newId("help") : null;
  if (helpId) control.setAttribute("aria-describedby", helpId);
  if (!control.id) control.id = newId("field");
  return h("div", { class: "field" },
    h("label", { for: control.id }, label), control,
    help ? h("span", { class: "help", id: helpId }, help) : null);
}

function choice({ type, name, value, checked, label, help, onchange, disabled }) {
  const input = h("input", { type, name, value, checked, disabled, id: newId("choice"), onchange });
  const helpId = help ? newId("help") : null;
  if (helpId) input.setAttribute("aria-describedby", helpId);
  return h("div", { class: "choice" }, input,
    h("div", {}, h("label", { for: input.id }, label), help ? h("span", { class: "help", id: helpId }, help) : null));
}

function iconButton(name, label, onclick, extra = {}) {
  return h("button", { type: "button", class: "icon", "aria-label": label, title: label, onclick, ...extra }, icon(name));
}

/** A small overflow menu: <details> with a list of buttons. Closes on choice,
 * Escape or outside click; arrow keys, Home and End move between its items. */
function overflowMenu(label, items, { focusKey } = {}) {
  const menu = h("details", { class: "menu" });
  const close = () => { menu.open = false; };
  menu.append(
    h("summary", { class: "icon-summary", "aria-label": label, title: label, "data-focus-key": focusKey },
      h("span", { class: "button-like icon" }, icon("more"))),
    h("div", { class: "menu-items", role: "menu", "aria-label": label }, items.filter(Boolean).map(item =>
      h("button", { type: "button", role: "menuitem", class: item.destructive ? "destructive" : null,
        "data-focus-key": item.focusKey, onclick: () => { close(); item.run(); } }, item.label))));
  menu.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.open) { close(); menu.querySelector("summary").focus(); return; }
    if (!menu.open || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const buttons = [...menu.querySelectorAll("button")];
    const at = buttons.indexOf(document.activeElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
      : event.key === "ArrowDown" ? (at + 1) % buttons.length : (at <= 0 ? buttons.length : at) - 1;
    event.preventDefault();
    buttons[next]?.focus();
  });
  return menu;
}
document.addEventListener("click", event => {
  for (const menu of document.querySelectorAll("details.menu[open]")) if (!menu.contains(event.target)) menu.open = false;
});

let toastTimer = null;
function setStatus(message, kind = "info") {
  const node = $("status");
  node.dataset.kind = kind;
  node.textContent = message;
  node.toggleAttribute("data-visible", !!message);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.removeAttribute("data-visible"), kind === "error" ? 6000 : 3200);
}

function errorText(error) {
  if (error?.code === "SENDER_REJECTED" || error?.code === "ACTOR_ERROR") {
    return "This page is not connected to AxioSozo.";
  }
  return M.errorMessage(error?.code) ?? (error?.message ? String(error.message) : "Something went wrong.");
}

async function call(name, params) {
  if (!api) throw { code: "NOT_CONNECTED", message: "This page is not connected to AxioSozo." };
  return api.request(name, params ?? {});
}

async function act(name, params, done) {
  try {
    const result = await call(name, params);
    if (done) setStatus(typeof done === "function" ? done(result) : done);
    return { ok: true, result };
  } catch (error) {
    setStatus(errorText(error), "error");
    return { ok: false, error };
  }
}

// Keeps keyboard focus on the "same" control across list re-renders, without
// scrolling: the control is where it was.
// A render that moves focus on purpose (a home's title) counts it here, and
// keepFocus then leaves focus where that render put it.
let deliberateFocus = 0;
async function keepFocus(render) {
  const key = document.activeElement?.dataset?.focusKey;
  const moves = deliberateFocus;
  await render();
  if (key && moves === deliberateFocus) document.querySelector(`[data-focus-key="${CSS.escape(key)}"]`)?.focus({ preventScroll: true });
}

let dialogResolve = null;
function confirmDialog({ title, message, accept, destructive = false }) {
  const dialog = $("confirm-dialog");
  $("confirm-title").textContent = title;
  $("confirm-message").textContent = message;
  const acceptButton = $("confirm-accept");
  acceptButton.textContent = accept;
  acceptButton.className = destructive ? "destructive" : "primary";
  const opener = document.activeElement;
  return new Promise(resolve => {
    dialogResolve = value => {
      dialogResolve = null;
      if (dialog.open) dialog.close();
      opener?.focus?.();
      resolve(value);
    };
    dialog.showModal();
    $("confirm-cancel").focus();
  });
}

function setupDialog() {
  const dialog = $("confirm-dialog");
  $("confirm-cancel").addEventListener("click", () => dialogResolve?.(false));
  $("confirm-accept").addEventListener("click", () => dialogResolve?.(true));
  dialog.addEventListener("cancel", event => { event.preventDefault(); dialogResolve?.(false); });
}

// One modal sheet for the project review and the rule editor.
let sheetClose = null;
function openSheet({ title, body, footer }) {
  const dialog = $("sheet");
  const returnFocus = document.activeElement;
  const close = () => {
    sheetClose = null;
    if (dialog.open) dialog.close();
    $("sheet-body").replaceChildren();
    returnFocus?.focus?.();
  };
  sheetClose = close;
  $("sheet-body").replaceChildren(h("div", { class: "sheet" },
    h("div", { class: "sheet-head" }, h("h2", { id: "sheet-title", tabindex: "-1" }, title),
      iconButton("close", "Close", close)),
    h("div", { class: "sheet-body" }, body),
    h("div", { class: "sheet-foot" }, footer)));
  if (!dialog.open) dialog.showModal();
  $("sheet-title").focus();
  return close;
}
function setupSheet() {
  $("sheet").addEventListener("cancel", event => { event.preventDefault(); sheetClose?.(); });
}

const contextName = uuid => state.contexts.find(context => context.uuid === uuid)?.name ?? null;
const projectName = M.projectName;
const hostOf = url => { try { return new URL(url).host; } catch { return url; } };
const DOT_STATUS = { up: "up", down: "down", warn: "warn" };
const dotStatus = tone => DOT_STATUS[tone] ?? "unknown";
const dateText = ms => (Number.isSafeInteger(ms) && ms > 0
  ? new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null);

// ---------------------------------------------------------------- views

function showView(view) {
  const previous = state.view;
  state.view = view;
  for (const section of document.querySelectorAll("section.view")) section.hidden = section.dataset.view !== view;
  for (const link of document.querySelectorAll(".views a")) {
    if (link.dataset.view === view) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  // Leaving AI & keys ends this page's key work there: typed keys are cleared
  // and anything still on its way is cancelled.
  if (previous === "ai" && view !== "ai") leaveDecisionKeys();
  // Provider discovery reads installation metadata only, and only when this view is
  // opened by an admitted page.
  if (view === "ai" && !state.providers && !state.providersLoading && state.admitted) loadProviders();
  // Reading the agent status starts nothing; it is read whenever the view shows.
  if (view === "ai" && state.connected && state.loaded) loadAgentSettings();
  // Key presence is read when AI & keys opens, never on the other views.
  if (view === "ai" && previous !== "ai" && state.connected && state.loaded) loadDecisionKeys();
}

function renderViewCounts() {
  const link = document.querySelector('.views a[data-view="projects"]');
  link.querySelector(".count")?.remove();
  if (state.attention.length) link.append(h("span", { class: "count", "aria-label": `${state.attention.length} need attention` }, String(state.attention.length)));
}

// ---------------------------------------------------------------- attention

async function loadAttention() {
  try {
    state.attention = await call("needsAttention");
  } catch (error) {
    state.attention = [];
    if (!api || error?.code === "SENDER_REJECTED" || error?.code === "ACTOR_ERROR") state.connected = false;
  }
  renderAttention();
}

function renderAttention() {
  const list = $("attention-list");
  const items = [];
  if (!state.connected) {
    items.push(h("li", { class: "row" }, h("span", { class: "dot", "data-status": "warn", "aria-hidden": "true" }),
      h("div", { class: "row-main" }, h("span", { class: "row-title" }, "AxioSozo is not connected"),
        h("span", { class: "row-detail" }, "Open about:axiosozo from the address bar of a normal browser window."))));
  }
  for (const item of state.attention) {
    const action = M.attentionAction(item);
    let button = null;
    if (action?.kind === "rule") button = h("button", { type: "button", onclick: () => { location.hash = `rule=${action.id}`; } }, "Edit rule");
    else if (action?.kind === "project") button = h("button", { type: "button", onclick: () => { location.hash = M.homeHash(action.id); } }, "Show project");
    else if (action?.kind === "url") button = h("button", { type: "button", onclick: () => act("openUrl", { url: action.url }) }, "Open");
    const status = item.kind === "service_down" ? "down" : "warn";
    items.push(h("li", { class: "row" },
      h("span", { class: "dot", "data-status": status, "aria-hidden": "true" }),
      h("div", { class: "row-main" },
        h("span", { class: "row-title" }, item.title ?? "Needs attention"),
        item.detail ? h("span", { class: "row-detail" }, item.detail) : null),
      button));
  }
  list.replaceChildren(...items);
  $("attention").hidden = !items.length;
  renderViewCounts();
}

// ---------------------------------------------------------------- spaces

async function loadContexts() {
  if (!state.active) return;
  const ticket = latest.contexts = nextTicket();
  let contexts = [];
  let failure = null;
  try { contexts = await call("listContexts"); } catch (error) { failure = error; }
  if (ticket !== latest.contexts) return; // a newer read (or pagehide) superseded this one
  state.contexts = contexts;
  if (failure) setStatus("Could not load spaces. " + errorText(failure), "error");
  await keepFocus(renderProjectsView);
  renderEngineSettings();
}

async function loadActiveSpace() {
  try { state.activeSpace = (await call("activeContext"))?.uuid ?? null; } catch { state.activeSpace = null; }
}

function spaceIcon(space) {
  const box = h("span", { class: "space-icon", "aria-hidden": "true" });
  const glyph = typeof space?.icon === "string" ? space.icon.trim() : "";
  if (glyph.startsWith("chrome://")) box.append(h("img", { src: glyph, alt: "" }));
  else if (glyph && [...glyph].length <= 2) box.textContent = glyph;
  else box.append(icon("space"));
  return box;
}

const spaceLabel = context => `${context.name} (${TYPE_LABELS[context.type]?.toLowerCase() ?? context.type})`;
const thisWindowTag = context => (context.uuid === state.activeSpace ? h("span", { class: "tag" }, "this window") : null);

/** Add a project to a space, or switch to it; its type lives behind "…". */
function spaceActions(context) {
  const key = suffix => `space:${context.uuid}:${suffix}`;
  return h("div", { class: "group-actions" },
    h("button", { type: "button", class: "ghost small", "data-focus-key": key("add"), "aria-label": `Add a project to ${context.name}`,
      onclick: () => addProjectFlow({ contextUuid: context.uuid }) }, icon("plus", 14), "Add project"),
    overflowMenu(`More for space ${context.name}`, [
      { label: `Switch to ${context.name}`, focusKey: key("open"), run: () => act("openContext", { uuid: context.uuid }) },
      { label: "Space type…", focusKey: key("type"), run: () => openSpaceSettings(context) },
    ], { focusKey: key("menu") }));
}

/** A space's type (and, for project spaces, its organization) in the sheet. */
function openSpaceSettings(context) {
  const organizations = state.contexts.filter(item => item.type === "organization" && item.uuid !== context.uuid);
  const typeSelect = h("select", {}, M.CONTEXT_TYPES.map(type => option(type, TYPE_LABELS[type], context.type)));
  const orgSelect = h("select", {}, option("", "No organization", context.organization_uuid ?? ""),
    organizations.map(org => option(org.uuid, org.name, context.organization_uuid)));
  const orgField = field({ label: "Organization", control: orgSelect, help: "Only project spaces belong to an organization." });
  const showOrg = () => { orgField.hidden = typeSelect.value !== "project" || !organizations.length; };
  typeSelect.addEventListener("change", showOrg);
  showOrg();
  let close = () => {};
  const save = async () => {
    const type = typeSelect.value;
    if (type !== context.type && !(await act("setContextType", { uuid: context.uuid, type })).ok) return;
    const org = type === "project" && organizations.length ? orgSelect.value || null : null;
    if (type === "project" && organizations.length && org !== (context.organization_uuid ?? null)
      && !(await act("linkOrganization", { uuid: context.uuid, organizationUuid: org })).ok) return;
    close();
    setStatus(`${context.name} is a ${TYPE_LABELS[type].toLowerCase()} space.`);
    await loadContexts();
  };
  close = openSheet({
    title: `Space ${context.name}`,
    body: [h("p", { class: "help" }, "What this space is for. Any space can hold projects; a site rule can apply to every space of one type."),
      field({ label: "Type", control: typeSelect }), orgField],
    footer: [h("button", { type: "button", onclick: () => close() }, "Cancel"),
      h("button", { type: "button", class: "primary", onclick: save }, "Save")],
  });
}

async function loadOrphans() {
  try {
    state.orphans = await call("listOrphans");
  } catch {
    state.orphans = [];
  }
  renderOrphans();
}

function renderOrphans() {
  const section = $("orphans");
  section.hidden = !state.orphans.length;
  if (!state.orphans.length) { $("orphans-body").replaceChildren(); return; }
  const boxes = state.orphans.map(orphan => choice({
    type: "checkbox", name: "orphan", value: orphan.workspace_uuid, checked: true,
    label: `${TYPE_LABELS[orphan.type] ?? orphan.type} space ${orphan.workspace_uuid}`,
  }));
  const remove = h("button", { type: "button", class: "destructive", "aria-describedby": "orphans-help", onclick: async () => {
    const uuids = [...section.querySelectorAll('input[name="orphan"]:checked')].map(input => input.value);
    if (!uuids.length) { setStatus("Select at least one entry to remove."); return; }
    const ok = await confirmDialog({ title: "Remove old space settings?",
      message: `This removes AxioSozo settings for ${uuids.length} deleted space${uuids.length === 1 ? "" : "s"}. Zen is not changed.`,
      accept: "Remove", destructive: true });
    if (ok) await act("removeOrphans", { uuids }, "Old space settings removed.").then(loadOrphans);
  } }, "Remove selected…");
  $("orphans-body").replaceChildren(h("div", { class: "panel sheet-body" },
    h("fieldset", {}, h("legend", {}, "Deleted spaces"), boxes), h("div", { class: "button-row" }, remove)));
}

// ---------------------------------------------------------------- projects

/** The project list and its containers; then the shown home is asked for again.
 * Only the latest read publishes: an older list answering late changes nothing. */
async function loadProjects() {
  if (!state.active) return;
  const ticket = latest.projects = nextTicket();
  // Checked after every await, before anything follows: a superseded read or
  // a hidden page asks for nothing more (no containers, no home).
  const current = () => ticket === latest.projects && state.active;
  try {
    const projects = await call("listProjects");
    if (!current()) return;
    const containers = await loadContainers();
    if (!current()) return;
    state.projects = projects;
    state.containers = containers;
    await keepFocus(renderProjects);
  } catch (error) {
    if (!current()) return;
    $("projects-body").removeAttribute("aria-busy");
    $("projects-body").replaceChildren(h("p", { class: "empty" }, "Could not load projects. " + errorText(error)));
  }
  if (state.homeId && state.loaded && current()) await loadHome();
}

async function loadContainers() {
  try {
    const list = await call("listProjectContainers");
    return new Map((Array.isArray(list) ? list : []).map(info => [info.project_id, info]));
  } catch { return new Map(); }
}

/** A link of one project: the browser picks the project's own container (or
 * the space's sign-ins for a shared site) before the tab opens. */
async function openProjectLink(project, url) {
  const opened = await act("openProjectUrl", { projectId: project.id, url });
  const note = opened.ok ? M.openedNote(opened.result) : null;
  if (note) setStatus(note);
}

// The latest status check per project (statusTickets): an older answer that
// arrives later never replaces a newer one, nor ends the newer one's
// "Checking…". Nothing is checked, and no answer is shown, while the page is hidden.
/** Asks serviceStatus once; true when this answer is the project's latest. */
async function checkServiceStatus(projectId) {
  if (!state.active) return false;
  const ticket = nextTicket();
  statusTickets.set(projectId, ticket);
  state.checking.add(projectId);
  try {
    const result = await call("serviceStatus", { projectId });
    if (statusTickets.get(projectId) !== ticket) return false;
    state.serviceStatus.set(projectId, result);
    return true;
  } finally {
    if (statusTickets.get(projectId) === ticket) state.checking.delete(projectId);
  }
}

/** One loopback check of the project's declared local servers (serviceStatus:
 * a TCP connect to this Mac only, rate-limited by the service). */
async function refreshServiceStatus(project, { quiet = false } = {}) {
  if (!state.active) return;
  const pending = checkServiceStatus(project.id);
  if (!quiet) await keepFocus(renderProjectsView);
  let current = false;
  try {
    current = await pending;
  } catch (error) {
    if (!quiet && state.active) setStatus(errorText(error), "error");
  }
  if (!state.active) return;
  await keepFocus(renderProjectsView);
  if (quiet || !current) return;
  const down = (state.serviceStatus.get(project.id) ?? []).filter(service => service.status === "down").length;
  setStatus(down ? `${down} local server${down === 1 ? " is" : "s are"} not running in ${projectName(project)}.` : `Local servers checked for ${projectName(project)}.`);
}

/** Every project's local servers, checked together and shown in one render. */
async function refreshAllServiceStatus() {
  const projects = state.projects.filter(project => project.manifest.services.length);
  if (!projects.length || !state.active) return;
  const checks = projects.map(project => checkServiceStatus(project.id));
  await keepFocus(renderProjectsView);
  await Promise.allSettled(checks);
  if (state.active) await keepFocus(renderProjectsView);
}

/** Rows for what static detection found (M.detectionSummary) in the
 * add-project preview: services, apps, domains (documented ones apart, marked
 * unconfirmed) and agent presence. Every value is text, never markup. */
function findingFacts(summary) {
  const sources = list => (list.length ? `Found in ${list.join(", ")}` : null);
  return [
    summary.integrations.length ? ["Services", summary.integrations.map(item =>
      h("span", { class: "tag", title: sources(item.sources) }, item.name))] : null,
    summary.platforms.length ? ["Apps", summary.platforms.map(item =>
      h("span", { class: "tag", title: item.source || item.path || null }, item.label))] : null,
    summary.configuredDomains.length ? ["Domains", summary.configuredDomains.map(item =>
      h("span", { class: "tag", title: item.source ? `From ${item.source}` : null }, item.host))] : null,
    summary.documentedDomains.length ? ["From docs", [
      ...summary.documentedDomains.map(item => h("span", { class: "tag unconfirmed",
        title: item.source ? `${M.DOCUMENTED_DOMAIN_NOTE}: ${item.source}` : M.DOCUMENTED_DOMAIN_NOTE }, item.host)),
      h("span", { class: "fact-note" }, "unconfirmed")]] : null,
    summary.agents.length ? ["Agents", summary.agents.map(name =>
      h("span", { class: "tag", title: "Present in the folder; not opened" }, name))] : null,
  ].filter(Boolean);
}

async function refreshDetectionFlow(project) {
  const result = await act("refreshProjectDetection", { id: project.id }, `Read the folder of ${projectName(project)} again.`);
  if (result.ok) await loadProjects();
}

/** First run: what adding a project does, as the empty state of this view. */
function firstRunGuide() {
  const steps = [
    ["Choose the folder", "AxioSozo reads a few config files (never .env files) and runs nothing."],
    ["Check what was found", "Local servers per app, an optional production address and web links. Guesses are marked."],
    ["Find it in the sidebar", "The project appears in the space you pick, under the space name. Opening one of its local addresses links the tab to it."],
  ];
  return h("section", { class: "guide", "aria-labelledby": "guide-heading" },
    h("div", { class: "guide-head" },
      h("h3", { id: "guide-heading" }, "Add your first project"),
      h("p", {}, "Any space can hold projects, personal ones included. Everything stays on this Mac."),
      h("p", {}, "Opening your app on localhost also works: AxioSozo offers to keep its folder as a project.")),
    h("ol", { class: "steps" }, steps.map(([title, text], index) => h("li", { class: "step" },
      h("span", { class: "step-mark", "aria-hidden": "true" }, String(index + 1)),
      h("span", { class: "step-title" }, title),
      h("p", {}, text)))),
    h("div", {}, h("button", { type: "button", class: "primary", onclick: () => addProjectFlow({}) }, "Add project…")));
}

/** The project's tile: its first letter, tinted with its own container's
 * Firefox colour (the same colour its tabs carry), neutral without one. */
function projectTile(card, extra = "") {
  return h("span", { class: `project-tile${extra}${card.color ? ` identity-color-${card.color}` : ""}`,
    "data-colored": card.color ? "" : null, "aria-hidden": "true" }, card.monogram);
}

/** Edit, accounts, shared sites, folder and removal: secondary, behind "…". */
function projectMenu(project, { home = false, space = null } = {}) {
  const key = suffix => `project:${project.id}:${home ? "home-" : ""}${suffix}`;
  const inRepo = project.manifest_state === "written" || project.manifest_state === "external";
  return overflowMenu(`More for ${projectName(project)}`, [
    home ? null : { label: "Edit project…", focusKey: key("edit"), run: () => openProjectReview({ mode: "edit", project }) },
    home ? null : { label: "Accounts…", focusKey: key("accounts"), run: () => openAccountsEditor(project) },
    home ? null : { label: "Shared sites…", focusKey: key("shared"), run: () => openSharedSitesEditor(project) },
    { label: project.detected ? "Read folder again" : "Read folder", focusKey: key("refresh"), run: () => refreshDetectionFlow(project) },
    { label: inRepo ? "Update .axiosozo/project.json…" : "Save as .axiosozo/project.json…", focusKey: key("write"), run: () => writeManifestFlow(project) },
    space ? { label: `Switch to ${space.name}`, focusKey: key("space"), run: () => act("openContext", { uuid: space.uuid }) } : null,
    { label: "Remove project…", destructive: true, focusKey: key("remove"), run: () => removeProjectFlow(project) },
  ], { focusKey: key("menu") });
}

/** A project in the list: a named card whose title opens the project home;
 * the whole card is the same link for the pointer. */
function projectCard(project, { loose = false } = {}) {
  const card = M.projectCard(project, { statuses: state.serviceStatus.get(project.id) ?? [], container: state.containers.get(project.id) });
  const titleId = `project-title-${project.id}`;
  const key = suffix => `project:${project.id}:${suffix}`;
  const local = card.local && state.checking.has(project.id) && card.local.tone === "unknown"
    ? { tone: "unknown", text: "Checking local servers…" } : card.local;
  return h("li", { class: "project-card", id: `project-${project.id}`, "aria-labelledby": titleId },
    projectTile(card),
    h("div", { class: "project-main" },
      h("h4", { class: "project-title", id: titleId },
        h("a", { href: card.href, class: "project-link", "data-focus-key": key("open") }, card.name)),
      h("p", { class: "project-sub" }, h("span", {}, card.kind),
        card.folder ? h("span", { class: "path", title: card.folder }, card.folder) : null),
      local || card.facts.length ? h("p", { class: "project-facts" },
        local ? h("span", { class: "fact", "data-tone": local.tone },
          h("span", { class: "dot", "data-status": dotStatus(local.tone), "aria-hidden": "true" }), local.text) : null,
        card.facts.map(fact => h("span", { class: "fact" }, h("span", { class: "fact-label" }, `${fact.label}:`), " ", fact.text))) : null,
      loose ? h("div", { class: "card-control" }, spaceSelect(project)) : null),
    h("div", { class: "project-actions" }, projectMenu(project)));
}

/** Moves a project to a space (used where it is in none). */
function spaceSelect(project) {
  const name = projectName(project);
  return h("select", { class: "compact", "aria-label": `Space of ${name}`, "data-focus-key": `project:${project.id}:space`,
    onchange: event => act("updateProject", { id: project.id, patch: { context_uuid: event.target.value || null } },
      event.target.value ? `${name} now lives in ${contextName(event.target.value)}.` : `${name} is no longer in a space.`)
      .then(() => Promise.all([loadProjects(), loadContexts()])) },
  option("", "Choose a space…", project.context_uuid ?? ""),
  state.contexts.map(context => option(context.uuid, spaceLabel(context), project.context_uuid)));
}

/** Projects of one space, like that space's sidebar; or the ones in no space. */
function spaceGroup(group) {
  const headingId = newId("space");
  const count = group.projects.length;
  const context = group.context;
  const head = context
    ? h("div", { class: "group-head" }, spaceIcon(context),
      h("div", { class: "group-titles" },
        h("h3", { id: headingId, class: "group-name" }, h("span", {}, context.name), thisWindowTag(context)),
        h("span", { class: "group-meta" }, `${count} ${count === 1 ? "project" : "projects"} in this space's sidebar`)),
      spaceActions(context))
    : h("div", { class: "group-head" }, h("span", { class: "space-icon", "aria-hidden": "true" }, icon("space")),
      h("div", { class: "group-titles" },
        h("h3", { id: headingId, class: "group-name" }, h("span", {}, "Not in a space")),
        h("span", { class: "group-meta" }, "Choose a space so these show in a sidebar.")));
  return h("section", { class: "space-group", "aria-labelledby": headingId }, head,
    h("ul", { class: "project-list", "aria-labelledby": headingId }, group.projects.map(project => projectCard(project, { loose: !context }))));
}

/** Spaces that hold no project yet: one quiet row each, never an empty box. */
function otherSpaces(groups, { only }) {
  const headingId = newId("spaces");
  return h("section", { class: "other-spaces", "aria-labelledby": headingId },
    h("h3", { id: headingId, class: "subhead" }, only ? "Your spaces" : "Spaces without projects"),
    h("ul", { class: "rows" }, groups.map(({ context }) => h("li", { class: "row" }, spaceIcon(context),
      h("div", { class: "row-main" },
        h("span", { class: "row-title" }, h("span", {}, context.name), thisWindowTag(context)),
        h("span", { class: "row-detail" }, `${TYPE_LABELS[context.type] ?? "Personal"} space · no projects yet`)),
      spaceActions(context)))));
}

/** Account labels: free text the user types per service or site. */
function openAccountsEditor(project) {
  const rows = M.accountRows(project);
  const errorsList = h("ul", { class: "errors", role: "alert" });
  const list = h("div", { class: "form-rows" });
  let close = () => {};
  const labelInput = (row, ariaLabel) => h("input", { type: "text", value: row.label, maxlength: String(M.ACCOUNT_LABEL_MAX),
    placeholder: "e.g. work Google", class: "account-label", "aria-label": ariaLabel, oninput: event => { row.label = event.target.value; } });
  const render = focusIndex => {
    list.replaceChildren(...rows.map((row, index) => {
      if (row.added) {
        const site = h("input", { type: "text", value: row.key, placeholder: "example.com", spellcheck: "false", class: "account-site",
          "aria-label": `Site ${index + 1}`, oninput: event => { row.key = event.target.value; } });
        return h("div", { class: "review-row account-row", "data-index": index }, site, labelInput(row, `Account on site ${index + 1}`),
          iconButton("close", `Remove site ${index + 1}`, () => { rows.splice(index, 1); render(-1); }));
      }
      return h("div", { class: "review-row account-row", "data-index": index },
        h("span", { class: "account-name", "aria-hidden": "true" }, row.name), labelInput(row, `Account for ${row.name}`),
        row.label ? iconButton("close", `Clear the account for ${row.name}`, () => { row.label = ""; render(index); }) : null);
    }));
    if (!rows.length) list.append(h("p", { class: "help" }, "No services were found in the folder. Add the sites you sign in to for this project."));
    if (focusIndex !== undefined && focusIndex >= 0) list.querySelector(`[data-index="${focusIndex}"] input`)?.focus();
    else if (focusIndex !== undefined) addSite.focus();
  };
  const addSite = h("button", { type: "button", class: "ghost", onclick: () => {
    rows.push({ key: "", name: "", label: "", kind: "site", added: true });
    render(rows.length - 1);
  } }, icon("plus", 14), "Add a site");
  const save = async () => {
    const { changes, errors } = M.accountChanges(rows, project);
    errorsList.replaceChildren(...errors.map(text => h("li", {}, text)));
    if (!changes) return;
    for (const change of changes) {
      const saved = await act("setAccountLabel", { projectId: project.id, key: change.key, label: change.label });
      if (!saved.ok) { await loadProjects(); return; }
    }
    close();
    setStatus(changes.length ? `Accounts for ${projectName(project)} saved.` : "Nothing changed.");
    await loadProjects();
  };
  close = openSheet({
    title: `Accounts for ${projectName(project)}`,
    body: [
      h("p", { class: "notice" }, `Note which account you use where, for example “work Google”. ${M.ACCOUNTS_NOTE}`),
      list, h("div", {}, addSite),
      h("p", { class: "help" }, `Each project signs in through its own Firefox container. ${M.CHROMIUM_SIGN_INS_NOTE}`), errorsList],
    footer: [h("button", { type: "button", onclick: () => close() }, "Cancel"),
      h("button", { type: "button", class: "primary", onclick: save }, "Save")],
  });
  render();
}

/** Shared sites: the suggested list is offered, never used until the user turns sharing on. */
function openSharedSitesEditor(project) {
  const form = M.sharedSitesForm(project);
  const errorsList = h("ul", { class: "errors", role: "alert" });
  let close = () => {};
  const hostsInput = h("textarea", { rows: "6", value: form.hostsText, spellcheck: "false", placeholder: "github.com\n*.github.com",
    oninput: event => { form.hostsText = event.target.value; } });
  const suggested = h("button", { type: "button", class: "ghost small", onclick: () => {
    form.hostsText = M.DEFAULT_SHARED_SITES.join("\n");
    hostsInput.value = form.hostsText;
    hostsInput.focus();
  } }, "Use the suggested sites");
  const share = choice({ type: "checkbox", name: "share-sites", checked: form.confirmed, label: "Share these sites with the space",
    help: "On: links to these sites from this project use the space's own sign-ins. Off: they stay in the project's container.",
    onchange: event => { form.confirmed = event.target.checked; } });
  const save = async () => {
    const { sites, errors } = M.formToSharedSites(form);
    errorsList.replaceChildren(...errors.map(text => h("li", {}, text)));
    if (!sites) return;
    const saved = await act("setSharedSites", { projectId: project.id, hosts: sites.hosts, confirmed: sites.confirmed },
      sites.confirmed && sites.hosts.length ? `${projectName(project)} shares ${sites.hosts.length} site${sites.hosts.length === 1 ? "" : "s"} with the space.`
        : `${projectName(project)} shares no sites with the space.`);
    if (saved.ok) { close(); await loadProjects(); }
  };
  close = openSheet({
    title: `Shared sites for ${projectName(project)}`,
    body: [h("p", { class: "notice" }, M.SHARED_SITES_NOTE),
      field({ label: "Sites", control: hostsInput, help: "One per line. *.github.com covers its subdomains." }),
      h("div", {}, suggested), share, errorsList],
    footer: [h("button", { type: "button", onclick: () => close() }, "Cancel"),
      h("button", { type: "button", class: "primary", onclick: save }, "Save")],
  });
}

/** The list: projects per space in Zen's order, then spaces without projects.
 * Nothing is drawn until the first load finished, so it never shows half. */
function renderProjects() {
  const body = $("projects-body");
  if (state.connected && !state.loaded) return;
  body.removeAttribute("aria-busy");
  const groups = M.projectGroups(state.contexts, state.projects);
  const filled = groups.filter(group => group.projects.length);
  const empty = groups.filter(group => group.context && !group.projects.length);
  const parts = [];
  if (!state.connected) parts.push(h("p", { class: "empty" }, "Projects appear here once AxioSozo is connected."));
  else if (!state.projects.length) parts.push(firstRunGuide());
  if (state.connected && !state.contexts.length) {
    parts.push(h("p", { class: "empty" }, "Waiting for Zen's spaces… If this stays empty, open a normal browser window."));
  }
  parts.push(...filled.map(spaceGroup));
  if (empty.length) parts.push(otherSpaces(empty, { only: !filled.length }));
  body.replaceChildren(...parts);
  renderPlacement();
}

/** Whichever pane of Projects is showing: the list or one project's home. */
function renderProjectsView() {
  renderProjects();
  if (state.homeId) renderHome();
}

function renderPlacement() {
  const box = $("placement");
  const project = state.placement ? state.projects.find(item => item.id === state.placement) : null;
  if (!project) { box.hidden = true; box.replaceChildren(); return; }
  const space = state.contexts.find(context => context.uuid === project.context_uuid);
  fill(box,
    h("span", { class: "dot", "data-status": "up", "aria-hidden": "true" }),
    h("p", {}, M.placementMessage(project, state.contexts)),
    space ? h("button", { type: "button", class: "primary", onclick: () => act("openContext", { uuid: space.uuid }) }, `Switch to ${space.name}`) : null,
    iconButton("close", "Dismiss", () => { state.placement = null; renderPlacement(); }));
  box.hidden = false;
}

function focusProject(id) {
  const node = document.getElementById(`project-${id}`);
  if (!node) return false;
  node.scrollIntoView({ block: "nearest" });
  node.querySelector(".project-link")?.focus({ preventScroll: true });
  node.removeAttribute("data-highlight");
  void node.offsetWidth;
  node.setAttribute("data-highlight", "");
  return true;
}

async function writeManifestFlow(project) {
  const ok = await confirmDialog({
    title: "Save the project file?",
    message: `This writes .axiosozo/project.json in ${project.root}, replacing any existing file there. It holds names, addresses, ports and links only, never secrets. Commit it and your team gets the same setup.`,
    accept: "Save file",
  });
  if (ok) await act("writeManifest", { projectId: project.id }, result => `Saved ${result?.path ?? ".axiosozo/project.json"}.`).then(loadProjects);
}

async function removeProjectFlow(project) {
  const ok = await confirmDialog({
    title: `Remove ${projectName(project)}?`,
    message: "AxioSozo forgets this project. The folder and any .axiosozo/project.json in it are not touched.",
    accept: "Remove project", destructive: true,
  });
  if (!ok) return;
  const removed = await act("removeProject", { id: project.id }, `${projectName(project)} removed.`);
  // Its home is gone: back to the list rather than a "not here" page.
  if (removed.ok && state.homeId === project.id) location.hash = "#projects";
  await loadProjects();
}

/** Folder picker → static detection → review sheet. The space defaults to the
 * one this window shows (any type); contextUuid overrides it. */
async function addProjectFlow({ contextUuid } = {}) {
  const picked = await act("pickFolder");
  if (!picked.ok || !picked.result) return;
  const root = picked.result;
  const detected = await act("detect", { root });
  if (!detected.ok) return;
  if (!contextUuid) await loadActiveSpace();
  const space = contextUuid ?? state.activeSpace ?? state.contexts[0]?.uuid ?? null;
  openProjectReview({ mode: "new", root, draft: detected.result, contextUuid: space });
}

// Add-project review / project edit, in the sheet.
function openProjectReview({ mode, root, draft, project, contextUuid = null }) {
  const review = mode === "new" ? M.draftToReview(draft, { contextUuid }) : M.projectToReview(project);
  const errorsList = h("ul", { class: "errors", role: "alert" });
  let writeManifest = false;
  let close = () => {};

  const provenance = row => (row.source && row.source !== "confirmed"
    ? h("span", { class: "provenance" }, row.guess ? h("span", { class: "tag guess" }, "guessed") : null, `from ${row.source}`)
    : row.guess ? h("span", { class: "provenance" }, h("span", { class: "tag guess" }, "guessed")) : null);

  // Environments, grouped per app; each has a checkbox and an editable address.
  const environmentsBox = h("div", { class: "form-rows" });
  const addEnvironmentButton = h("button", { type: "button", class: "ghost", onclick: () => {
    const apps = M.reviewApps(review).filter(Boolean);
    review.environments.push({ app: apps.find(app => app !== "desktop") ?? apps[0] ?? null, name: "", base_url: "",
      source: "", guess: false, enabled: true, servicePort: null, added: true });
    renderEnvironments(review.environments.length - 1);
  } }, icon("plus", 14), "Add environment");
  const renderEnvironments = focusIndex => {
    const groups = M.environmentGroups(review);
    const apps = M.reviewApps(review).filter(Boolean);
    environmentsBox.replaceChildren(...groups.map(group => h("div", { class: "env-group", role: group.label ? "group" : null, "aria-label": group.label },
      group.label ? h("h4", {}, group.label) : null,
      group.rows.map(({ row, index }) => {
        const label = `${row.app && group.label ? `${row.app} · ` : ""}${row.name || "new environment"}`;
        const use = h("input", { type: "checkbox", checked: row.enabled !== false, id: newId("env"), "aria-label": `Use ${label}`,
          onchange: event => { row.enabled = event.target.checked; renderEnvironments(); } });
        const nameInput = h("input", { type: "text", value: row.name, placeholder: "local", "aria-label": `Name of ${label}`,
          class: "env-name", disabled: row.enabled === false, oninput: event => { row.name = event.target.value; } });
        const urlInput = h("input", { type: "url", value: row.base_url, placeholder: "http://localhost:5173", "aria-label": `Address of ${label}`,
          class: "env-url", disabled: row.enabled === false, oninput: event => { row.base_url = event.target.value; } });
        const appSelect = row.added && apps.length > 1 ? h("select", { class: "compact", "aria-label": `App of ${label}`,
          onchange: event => { row.app = event.target.value || null; renderEnvironments(index); } },
        option("", "Whole project", row.app ?? ""), apps.map(app => option(app, app, row.app))) : null;
        const remove = row.added ? iconButton("close", `Remove ${label}`, () => { review.environments.splice(index, 1); renderEnvironments(-1); }) : null;
        return h("div", { class: "review-row", "data-enabled": row.enabled !== false, "data-index": index },
          use, appSelect, nameInput, urlInput, remove, provenance(row));
      }))));
    if (!review.environments.length) environmentsBox.append(h("p", { class: "help" }, "Nothing was detected. Add the address you open during development."));
    if (focusIndex !== undefined && focusIndex >= 0) environmentsBox.querySelector(`[data-index="${focusIndex}"] input:not([type="checkbox"])`)?.focus();
    else if (focusIndex !== undefined) addEnvironmentButton.focus();
  };
  renderEnvironments();

  const productionInput = h("input", { type: "url", value: review.productionUrl, placeholder: "https://example.com",
    oninput: event => { review.productionUrl = event.target.value; } });

  // Links: "Shown" in the sidebar and "More" behind "…".
  const surfacesShown = h("div", { class: "form-rows" });
  const surfacesMore = h("div", { class: "form-rows" });
  const moreDetails = h("details", {}, h("summary", {}, "More (behind … in the sidebar)"), surfacesMore);
  const renderSurfaces = () => {
    const rowFor = (row, index) => {
      const label = row.name || `link ${index + 1}`;
      const keep = h("input", { type: "checkbox", checked: row.enabled !== false, "aria-label": `Keep ${label}`,
        onchange: event => { row.enabled = event.target.checked; renderSurfaces(); } });
      const move = h("button", { type: "button", class: "ghost small", disabled: row.enabled === false,
        onclick: () => { row.prominence = row.prominence === "primary" ? "secondary" : "primary"; renderSurfaces(); } },
      row.prominence === "primary" ? "Move to More" : "Show in sidebar");
      const controls = row.added
        ? [h("input", { type: "text", value: row.name, placeholder: "Name", "aria-label": `Name of ${label}`, oninput: event => { row.name = event.target.value; } }),
          h("input", { type: "url", value: row.url, placeholder: "https://", "aria-label": `Address of ${label}`, class: "env-url", oninput: event => { row.url = event.target.value; } }),
          h("select", { class: "compact", "aria-label": `Kind of ${label}`, onchange: event => { row.kind = event.target.value; } },
            M.SURFACE_KINDS.map(kind => option(kind, kind.replaceAll("_", " "), row.kind)))]
        : [h("span", { class: "surface-name" }, row.name), h("span", { class: "surface-host", title: row.url }, hostOf(row.url))];
      return h("div", { class: "review-row", "data-enabled": row.enabled !== false }, keep, controls, move, provenance(row));
    };
    const shown = review.surfaces.map((row, index) => [row, index]).filter(([row]) => row.prominence === "primary");
    const more = review.surfaces.map((row, index) => [row, index]).filter(([row]) => row.prominence !== "primary");
    surfacesShown.replaceChildren(...shown.map(([row, index]) => rowFor(row, index)));
    if (!shown.length) surfacesShown.append(h("p", { class: "help" }, "No links shown in the sidebar."));
    surfacesMore.replaceChildren(...more.map(([row, index]) => rowFor(row, index)));
    if (!more.length) surfacesMore.append(h("p", { class: "help" }, "Nothing here."));
    moreDetails.querySelector("summary").textContent = `More (behind … in the sidebar): ${more.length}`;
  };
  renderSurfaces();
  const addLinkButton = h("button", { type: "button", class: "ghost", onclick: () => {
    review.surfaces.push({ name: "", url: "", kind: "other", prominence: "primary", source: "", guess: false, enabled: true, added: true });
    renderSurfaces();
    surfacesShown.querySelector("input[type=text]:last-of-type")?.focus();
  } }, icon("plus", 14), "Add link");

  const nameInput = h("input", { type: "text", value: review.name, maxlength: "80", required: true,
    oninput: event => { review.name = event.target.value; } });
  const kindSelect = h("select", { onchange: event => { review.kind = event.target.value; } },
    M.PROJECT_KINDS.map(kind => option(kind, kind, review.kind)));
  const spaceSelect = h("select", { onchange: event => { review.contextUuid = event.target.value || null; } },
    option("", "No space (not in the sidebar)", review.contextUuid ?? ""),
    state.contexts.map(context => option(context.uuid,
      `${spaceLabel(context)}${context.uuid === state.activeSpace ? " · this window" : ""}`, review.contextUuid)));

  const findingRows = mode === "new" ? findingFacts(review.findings) : [];
  const findings = findingRows.length ? h("fieldset", { class: "findings" }, h("legend", {}, "Also found in the folder"),
    h("p", { class: "help" }, `Kept with the project in this browser, never written to the folder. ${M.PRESENCE_NOTE}`),
    h("dl", { class: "facts" }, findingRows.map(([label, value]) => [h("dt", {}, label), h("dd", {}, value)]))) : null;

  const detectionDetails = mode === "new" ? h("details", {},
    h("summary", {}, `What was read: ${review.filesRead.length} file${review.filesRead.length === 1 ? "" : "s"}, ${review.refused.length} refused`),
    review.frameworks.length ? h("p", {}, "Frameworks: " + review.frameworks.join(", ")) : null,
    h("h4", {}, "Files read"),
    review.filesRead.length ? h("ul", { class: "file-list" }, review.filesRead.map(path => h("li", { class: "path" }, path)))
      : h("p", { class: "help" }, "None."),
    h("h4", {}, "Files refused"),
    review.refused.length ? h("ul", { class: "file-list" }, review.refused.map(item =>
      h("li", {}, h("span", { class: "path" }, item.path), ` — ${M.REFUSAL_TEXT[item.reason] ?? item.reason}`)))
      : h("p", { class: "help" }, "None."),
    review.warnings.length ? [h("h4", {}, "Warnings"), h("ul", { class: "file-list" }, review.warnings.map(text => h("li", {}, text)))] : null,
    h("p", { class: "help" }, ".env files, key files and anything outside the folder are never read. In a monorepo only the app folders' own config files are read. Nothing is executed.")) : null;

  const writeChoice = mode === "new" ? choice({ type: "checkbox", name: "write-manifest", label: "Also save .axiosozo/project.json in the folder",
    help: "Asks first. The file holds names, addresses, ports and links only, never secrets.",
    onchange: event => { writeManifest = event.target.checked; } }) : null;

  const submit = async () => {
    const { manifest, errors } = M.reviewToManifest(review);
    errorsList.replaceChildren(...errors.map(error => h("li", {}, error.message)));
    if (!manifest) { setStatus("Fix the problems listed above Save.", "error"); return; }
    if (mode === "edit") {
      const saved = await act("updateProject", { id: project.id, patch: { manifest, context_uuid: review.contextUuid } },
        `${manifest.name} saved. Open tabs follow the new addresses.`);
      if (saved.ok) { close(); await Promise.all([loadProjects(), loadContexts()]); }
      return;
    }
    const confirmed = await act("confirmProject", { root, manifest, contextUuid: review.contextUuid });
    if (!confirmed.ok) return;
    close();
    await Promise.all([loadProjects(), loadContexts()]);
    if (confirmed.result?.id) {
      state.placement = confirmed.result.id;
      renderPlacement();
      setStatus(M.placementMessage(confirmed.result, state.contexts));
      focusProject(confirmed.result.id);
    }
    if (writeManifest && confirmed.result?.id) await writeManifestFlow(confirmed.result);
  };

  close = openSheet({
    title: mode === "new" ? "Review project" : `Edit ${projectName(project)}`,
    body: [
      mode === "new" ? [h("p", { class: "path" }, root),
        h("p", { class: "notice" }, "Found by reading config files. Items marked guessed are framework defaults. Untick what you do not use; nothing is saved until you add the project.")] : null,
      h("div", { class: "form-row" }, field({ label: "Name", control: nameInput }),
        field({ label: "Kind", control: kindSelect, help: review.kindSource.source && review.kindSource.source !== "confirmed"
          ? `${review.kindSource.guess ? "Guessed" : "Detected"} from ${review.kindSource.source}` : null })),
      field({ label: "Space", control: spaceSelect, help: "Where the project shows in the sidebar. Any space works, personal ones too." }),
      h("fieldset", {}, h("legend", {}, "Environments"),
        h("p", { class: "help" }, "Addresses you open. A tab on one of them is linked to this project, also when you type it yourself."),
        environmentsBox, h("div", {}, addEnvironmentButton)),
      field({ label: "Production URL (optional)", control: productionInput,
        help: "The live site, for the environment switch. Hosting links such as Vercel only point to the dashboard, so add it here." }),
      h("fieldset", {}, h("legend", {}, "Links"),
        h("h4", {}, "Shown in the sidebar"), surfacesShown, moreDetails, h("div", {}, addLinkButton)),
      findings, detectionDetails, writeChoice, errorsList],
    footer: [h("button", { type: "button", onclick: () => close() }, "Cancel"),
      h("button", { type: "button", class: "primary", onclick: submit }, mode === "new" ? "Add project" : "Save")],
  });
}

function openProjectEditorById(id) {
  const project = state.projects.find(item => item.id === id);
  if (project) openProjectReview({ mode: "edit", project });
  else setStatus("That project no longer exists.", "error");
}

// ---------------------------------------------------------------- project home (#project=<id>)

// Every home request takes a ticket (latest.home). A route change (also away
// and back to the same project), a projects or contexts event, and pagehide
// take one too. Only the answer to the latest ticket may publish anything:
// state, a render, focus or a check. A visit's one local-server check
// (state.homeProbe) belongs to the visit, so a request reissued after an
// event still makes it, once.
const HOME_RETRY_MS = 150;
let homeRetry = null;

/** Asks the actor for the current stored project (normal window only). A
 * project that changed while it was read is asked for once more. */
async function loadHome({ retry = true } = {}) {
  const id = state.homeId;
  if (!id || !state.connected || !state.active) return;
  clearTimeout(homeRetry);
  homeRetry = null;
  invalidateHome();
  const ticket = latest.home;
  let next;
  let code = null;
  try {
    next = { id, data: await call("getProjectHome", { id }), problem: null };
  } catch (error) {
    code = error?.code ?? null;
    next = { id, data: null, problem: M.homeProblem(code) };
  }
  const current = () => ticket === latest.home && state.homeId === id && state.active;
  if (!current()) return; // superseded or hidden: publish nothing
  if (code === "SENDER_REJECTED" || code === "ACTOR_ERROR") state.connected = false;
  if (code === "PROJECT_CHANGED" && retry) {
    homeRetry = setTimeout(() => { homeRetry = null; if (current()) loadHome({ retry: false }); }, HOME_RETRY_MS);
    return;
  }
  state.home = next;
  await keepFocus(renderHome);
  if (!current() || !state.homeProbe || !next.data) return;
  state.homeProbe = false;
  if (next.data.project.manifest.services.length) refreshServiceStatus(next.data.project, { quiet: true });
}

const homeSection = (key, title, body, { action = null, quiet = false } = {}) => {
  const headingId = `home-${key}-heading`;
  return h("section", { class: `home-section${quiet ? " quiet" : ""}`, "data-section": key, "aria-labelledby": headingId },
    h("div", { class: "section-head" }, h("h3", { id: headingId }, title), action),
    body);
};

/** Environments per app with their honest status, then the project's links. */
function homeOpen(project) {
  const key = suffix => `project:${project.id}:${suffix}`;
  const groups = M.homeEnvironments(project, state.serviceStatus.get(project.id) ?? [], { checking: state.checking.has(project.id) });
  const surfaces = project.manifest.surfaces.filter(surface => M.isHttpUrl(surface.url));
  const primary = surfaces.filter(surface => M.surfaceProminence(surface) === "primary");
  const secondary = surfaces.filter(surface => M.surfaceProminence(surface) !== "primary");
  const linkItem = surface => {
    const kind = surface.kind.replaceAll("_", " ");
    return h("li", {}, h("button", { type: "button", class: "link-open", title: surface.url,
      "aria-label": `Open ${surface.name} (${kind}) at ${M.displayAddress(surface.url)}`, onclick: () => openProjectLink(project, surface.url) },
    h("span", { class: "link-name" }, surface.name), h("span", { class: "link-address" }, hostOf(surface.url)), icon("open", 14)));
  };
  // Stays enabled while checking so keyboard focus survives the re-render; the service rate-limits checks.
  const check = project.manifest.services.some(service => M.isCheckedService(service.url))
    ? iconButton("refresh", `Check the local servers of ${projectName(project)} again`, () => refreshServiceStatus(project),
      { "data-focus-key": key("status") }) : null;
  const body = [];
  for (const group of groups) {
    body.push(h("div", { class: "env-block", role: group.label ? "group" : null, "aria-label": group.label ? `App ${group.label}` : null },
      group.label ? h("h4", { class: "env-app" }, group.label) : null,
      h("ul", { class: "env-list" }, group.rows.map(row => {
        const statusId = newId("status");
        return h("li", { class: "env-row" },
          h("button", { type: "button", class: "env-open", title: row.url, "aria-label": row.openLabel, "aria-describedby": statusId,
            "data-focus-key": key(`env:${row.app ?? ""}:${row.name}`), onclick: () => openProjectLink(project, row.url) },
          icon(row.local ? "laptop" : "globe"), h("span", { class: "env-name" }, row.label),
          h("span", { class: "env-address" }, row.address), icon("open", 14)),
          h("span", { class: "env-status", id: statusId, "data-status": row.status },
            h("span", { class: "dot", "data-status": dotStatus(row.status), "aria-hidden": "true" }), row.statusText));
      }))));
  }
  if (groups.length) body.push(h("p", { class: "footnote" }, M.STATUS_NOTE));
  if (primary.length || secondary.length) {
    body.push(h("div", { class: "links" },
      h("h4", { class: "env-app" }, "Links"),
      primary.length ? h("ul", { class: "link-list" }, primary.map(linkItem)) : null,
      secondary.length ? h("details", { class: "more-links", open: !primary.length },
        h("summary", {}, `More links (${secondary.length})`), h("ul", { class: "link-list" }, secondary.map(linkItem))) : null));
  }
  if (!body.length) {
    body.push(h("p", { class: "quiet-text" }, "No addresses yet. Add the address you open during development with Edit."));
  }
  return homeSection("open", "Environments and links", body, { action: check });
}

/** The project's own container, the accounts the user noted and shared sites. */
function homeAccounts(project, container, space) {
  const name = projectName(project);
  const key = suffix => `project:${project.id}:${suffix}`;
  const summary = M.containerSummary(container);
  const rows = M.homeServices(project);
  const shared = M.sharedSites(project);
  const labelled = rows.some(row => row.account);
  const containerLine = summary ? h("p", { class: "container-line", "data-state": summary.state },
    h("span", { class: `container-mark${summary.color ? ` identity-color-${summary.color}` : ""}`, "aria-hidden": "true" }),
    h("span", {}, summary.name && summary.name !== name ? `${summary.text}: ${summary.name}` : summary.text)) : null;
  return homeSection("accounts", "Services and sign-ins", [
    containerLine,
    h("p", { class: "footnote" }, summary?.state === "own" || summary?.state === "pending"
      ? `Links on this page open in it, so ${name} keeps its own sign-ins. ${M.CHROMIUM_SIGN_INS_NOTE}` : M.CHROMIUM_SIGN_INS_NOTE),
    rows.length ? h("ul", { class: "rows service-rows" }, rows.map(row => h("li", { class: "row" },
      h("div", { class: "row-main" },
        h("span", { class: "row-title" }, row.name),
        h("span", { class: `row-detail${row.account ? " account" : ""}` }, row.account ? `Account: ${row.account}` : "No account noted")),
      row.url ? h("button", { type: "button", class: "ghost small", title: row.url, "aria-label": `Open the ${row.name} dashboard`,
        "data-focus-key": key(`dashboard:${row.key}`), onclick: () => openProjectLink(project, row.url) }, "Dashboard", icon("open", 14)) : null)))
      : h("p", { class: "quiet-text" }, "No services were found in the folder. Note the sites you sign in to for this project."),
    h("div", { class: "section-actions" },
      h("button", { type: "button", class: "ghost small", "aria-label": `Accounts for ${name}`, "data-focus-key": key("accounts"),
        onclick: () => openAccountsEditor(project) }, labelled ? "Edit accounts…" : "Note accounts…"),
      h("span", { class: "help" }, M.ACCOUNTS_NOTE)),
    h("div", { class: "shared-line" },
      h("div", { class: "row-main" },
        h("span", { class: "row-title" }, "Shared sites"),
        h("span", { class: "fact-text", "data-confirmed": shared.confirmed }, shared.text),
        shared.confirmed && space ? h("span", { class: "help" }, `These use the sign-ins of ${space.name}.`) : null),
      h("button", { type: "button", class: "ghost small", "aria-label": `Shared sites of ${name}`, "data-focus-key": key("shared"),
        onclick: () => openSharedSitesEditor(project) }, shared.confirmed ? "Edit…" : "Review…")),
  ]);
}

/** Agents and console errors: what this build actually reports, nothing more. */
function homeActivity(project, agents, errors) {
  const presence = M.detectionSummary(project.detected).agents;
  const quiet = agents.state !== "list" && errors.state !== "list";
  const key = suffix => `project:${project.id}:${suffix}`;
  return homeSection("activity", "Activity", h("dl", { class: "home-facts" },
    h("dt", {}, "Agents"),
    h("dd", {},
      agents.state === "list" ? h("ul", { class: "activity-list" }, agents.items.map(item => h("li", {},
        h("span", { class: "tag state", "data-tone": item.state === "failed" ? "warn" : item.state === "needs_input" ? "info" : "ok" }, item.stateText),
        h("span", { class: "activity-title" }, `${item.agent}: ${item.title}`),
        item.ago ? h("span", { class: "help" }, item.ago) : null)))
        : h("p", { class: "quiet-text" }, agents.text),
      agents.state === "off" ? h("p", {}, h("a", { href: "#ai", class: "button-link small", "data-focus-key": key("agent-settings") }, "Agent status settings")) : null,
      agents.sessions.length ? h("ul", { class: "activity-list sessions", "aria-label": "Browser sessions" }, agents.sessions.map(item => h("li", {},
        h("span", { class: "tag state", "data-tone": item.state === "approved" ? "ok" : "info" }, item.stateText),
        h("span", { class: "activity-title" }, `${item.agent}: browser session`),
        h("button", { type: "button", class: "ghost small", "aria-label": `End the browser session of ${item.agent}`,
          "data-focus-key": key(`session:${item.session}`), onclick: () => revokeAgentSession(project, item) }, "End")))) : null,
      presence.length ? h("p", { class: "footnote" }, `In the folder: ${presence.join(", ")}. ${M.PRESENCE_TEXT}`) : null),
    h("dt", {}, "Console errors"),
    h("dd", {},
      errors.state === "list" ? [h("p", {}, errors.text), h("ul", { class: "activity-list" }, errors.items.map(item =>
        h("li", {}, h("span", { class: "tag state", "data-tone": item.level === "warning" ? "warn" : "bad" }, item.level), h("span", { class: "activity-title" }, item.text))))]
        : h("p", { class: "quiet-text" }, errors.text))), { quiet });
}

/** Ends one browser-bridge session of this project (it closes its connection). */
async function revokeAgentSession(project, item) {
  const ended = await act("revokeAgentSession", { projectId: project.id, sessionId: item.session });
  if (!state.active) return;
  if (ended.ok) setStatus(ended.result?.revoked ? `${item.agent}'s browser session ended.` : "That browser session had already ended.");
  if (state.homeId === project.id) await loadHome();
}

/** The brief (a document, never a chat), then folder, apps and domains found. */
function homeAbout(project) {
  const key = suffix => `project:${project.id}:${suffix}`;
  const brief = M.briefView(project.brief);
  const found = M.detectionSummary(project.detected);
  const folder = M.folderFacts(project);
  const read = dateText(folder.lastRead);
  const facts = [
    ["Folder", h("span", { class: "path" }, folder.root)],
    ["Project file", folder.projectFile],
    found.platforms.length ? ["Apps found", found.platforms.map(item => item.label).join(", ")] : null,
    found.configuredDomains.length ? ["Domains", h("span", {}, found.configuredDomains.map(item => item.host).join(", "),
      h("span", { class: "help" }, " · from the project's config files"))] : null,
    found.documentedDomains.length ? ["From docs", h("span", {}, found.documentedDomains.map(item => item.host).join(", "),
      h("span", { class: "tag unconfirmed", title: M.DOCUMENTED_DOMAIN_NOTE }, "unconfirmed"))] : null,
    ["Last read", h("span", { class: "inline-action" }, read ? `Folder read on ${read}` : "Not read yet",
      h("button", { type: "button", class: "ghost small", "data-focus-key": key("home-read"), onclick: () => refreshDetectionFlow(project) },
        read ? "Read folder again" : "Read folder"))],
  ].filter(Boolean);
  const briefBlock = brief ? h("div", { class: "brief", role: "group", "aria-label": "Brief" },
    h("h4", {}, "Brief"),
    brief.apps.length ? [h("h5", {}, "Apps"), h("ul", { class: "brief-list" }, brief.apps.map(app =>
      h("li", {}, h("strong", {}, app.name), app.kind ? ` (${app.kind})` : "", app.summary ? ` — ${app.summary}` : "")))] : null,
    brief.start.length ? [h("h5", {}, "How to start"), h("ul", { class: "brief-list" }, brief.start.map(step =>
      h("li", {}, `${step.label}: `, h("code", {}, step.command), step.cwd ? ` in ${step.cwd}` : ""))),
    h("p", { class: "footnote" }, "AxioSozo shows these commands; it never runs them.")] : null,
    brief.services.length ? [h("h5", {}, "Services"), h("ul", { class: "brief-list" }, brief.services.map(item =>
      h("li", {}, h("strong", {}, item.name), item.purpose ? ` — ${item.purpose}` : "")))] : null,
    brief.domains.length ? [h("h5", {}, "Domains it mentions"), h("ul", { class: "brief-list" }, brief.domains.map(item =>
      h("li", {}, item.host, item.purpose ? ` — ${item.purpose}` : "", " ", h("span", { class: "tag unconfirmed" }, "unconfirmed"))))] : null,
    brief.risks.length ? [h("h5", {}, "Known risks"), h("ul", { class: "brief-list" }, brief.risks.map(text => h("li", {}, text)))] : null,
    h("p", { class: "footnote" }, `Written by ${brief.by}${dateText(brief.generatedAt) ? ` on ${dateText(brief.generatedAt)}` : ""}. `,
      brief.accepted ? "Accepted." : "Not accepted into the project file."))
    : h("div", { class: "brief absent" }, h("h4", {}, "Brief"), h("p", { class: "quiet-text" }, `No brief yet. ${M.BRIEF_UNAVAILABLE}`));
  return homeSection("about", "About this project", [briefBlock,
    h("dl", { class: "home-facts" }, facts.map(([label, value]) => [h("dt", {}, label), h("dd", {}, value)]))]);
}

/** One project's home: who it is, how to open it, its sign-ins, what is going on, and what it is. */
function renderHome() {
  const root = $("project-home");
  const id = state.homeId;
  if (!id) { root.replaceChildren(); return; }
  const crumbs = h("nav", { class: "crumbs", "aria-label": "Breadcrumb" },
    h("a", { href: "#projects", "data-focus-key": "home:back" }, "Projects"), h("span", { "aria-hidden": "true" }, "/"),
    h("span", { "aria-current": "page" }, state.home?.data ? projectName(state.home.data.project) : "Project"));
  if (!state.connected) {
    root.removeAttribute("aria-busy");
    root.replaceChildren(crumbs, h("p", { class: "empty" }, "Project homes appear here once AxioSozo is connected."));
    return;
  }
  if (!state.loaded || state.home?.id !== id) {
    root.setAttribute("aria-busy", "true");
    root.replaceChildren(crumbs, h("p", { class: "loading" }, "Loading project…"));
    return;
  }
  root.removeAttribute("aria-busy");
  if (state.home.problem) {
    root.replaceChildren(crumbs, h("div", { class: "home-problem" },
      h("h2", { id: "home-title", tabindex: "-1", "data-focus-key": "home:title" }, state.home.problem.title),
      h("p", {}, state.home.problem.text),
      h("p", {}, h("a", { href: "#projects", class: "button-link" }, "Show all projects"))));
    focusHomeTitle();
    return;
  }
  const { project, space, container } = state.home.data;
  const name = projectName(project);
  const card = M.projectCard(project, { container });
  const brief = M.briefView(project.brief);
  const agents = M.homeAgentActivity(state.home.data.agent_activity, { root: project.root, now: Date.now() });
  const errors = M.homeConsoleErrors(state.home.data.console_errors);
  const sections = {
    open: () => homeOpen(project),
    accounts: () => homeAccounts(project, container, space),
    activity: () => homeActivity(project, agents, errors),
    about: () => homeAbout(project),
  };
  fill(root, crumbs,
    h("header", { class: "home-head" },
      projectTile(card, " large"),
      h("div", { class: "home-titles" },
        h("h2", { id: "home-title", tabindex: "-1", "data-focus-key": "home:title" }, name),
        h("p", { class: "home-sub" }, h("span", {}, card.kind),
          h("span", {}, space ? `Space: ${space.name}` : "Not in a space"),
          card.inRepo ? h("span", { title: "Stored in .axiosozo/project.json" }, "In the repository") : null),
        h("p", { class: "path home-folder", title: project.root }, project.root)),
      h("div", { class: "home-actions" },
        h("button", { type: "button", class: "ghost", "aria-label": `Edit ${name}`, "data-focus-key": `project:${project.id}:home-edit`,
          onclick: () => openProjectReview({ mode: "edit", project }) }, "Edit"),
        projectMenu(project, { home: true, space }))),
    brief ? h("p", { class: "home-lede" }, brief.product) : null,
    ...M.homeSections({ agents, errors }).map(section => sections[section]()));
  focusHomeTitle();
}

/** After navigating to a home, focus (and screen readers) land on its title;
 * never while a dialog over it has focus, nor while the page is hidden. */
function focusHomeTitle() {
  if (!state.focusHome || !state.active) return;
  state.focusHome = false;
  if ($("sheet").open || $("confirm-dialog").open) return;
  window.scrollTo?.({ top: 0 });
  deliberateFocus++;
  $("home-title")?.focus({ preventScroll: true });
}

// ---------------------------------------------------------------- site rules

async function loadRules() {
  try {
    state.rules = await call("listRules");
    await keepFocus(renderRules);
  } catch (error) {
    $("rule-list").replaceChildren(h("li", { class: "empty" }, "Could not load site rules. " + errorText(error)));
  }
  renderUsage();
}

function renderRules() {
  const list = $("rule-list");
  if (!state.rules.length) {
    list.replaceChildren(h("li", { class: "empty" },
      h("p", {}, "No site rules yet."),
      h("p", { class: "help" }, "For example: “x.com — I come here to post and answer mentions. Nudge me if I drift into the feed.”")));
    return;
  }
  list.replaceChildren(...state.rules.map(rule => {
    const key = suffix => `rule:${rule.id}:${suffix}`;
    const hosts = rule.match.hosts.join(", ");
    const headingId = newId("rule");
    const usage = M.ruleUsage(rule, { today: state.usageToday, week: state.usageWeek });
    const enabled = h("input", { type: "checkbox", class: "switch", checked: rule.enabled, "data-focus-key": key("enabled"),
      "aria-label": `Rule for ${hosts} ${rule.enabled ? "on" : "off"}`, title: rule.enabled ? "On" : "Off",
      onchange: event => act("saveRule", { rule: { ...rule, enabled: event.target.checked, updated_at: Date.now() } },
        `Rule for ${hosts} ${event.target.checked ? "on" : "off"}.`).then(loadRules) });
    return h("li", { class: "card", id: `rule-${rule.id}`, "aria-labelledby": headingId, tabindex: "-1" },
      h("div", { class: "card-head" },
        h("div", { class: "card-titles" },
          h("h3", { id: headingId, class: "card-title" }, hosts),
          h("span", { class: "card-sub" }, M.describeRule(rule)),
          h("span", { class: "card-sub usage-line", "data-over": usage.overLimit }, usage.text)),
        h("div", { class: "card-actions" }, enabled,
          h("button", { type: "button", class: "ghost", "data-focus-key": key("edit"), "aria-label": `Edit rule for ${hosts}`,
            onclick: () => openRuleEditor(rule) }, "Edit"),
          overflowMenu(`More for rule ${hosts}`, [
            { label: "Delete rule…", destructive: true, focusKey: key("delete"), run: () => deleteRuleFlow(rule) }]))),
      rule.instruction ? h("p", { class: "card-quote" }, rule.instruction) : null);
  }));
}

async function deleteRuleFlow(rule) {
  const ok = await confirmDialog({ title: "Delete this site rule?",
    message: `The rule for ${rule.match.hosts.join(", ")} is removed. Screen time already recorded stays until you delete it.`,
    accept: "Delete rule", destructive: true });
  if (!ok) return false;
  const result = await act("deleteRule", { id: rule.id }, "Site rule deleted.");
  await loadRules();
  return result.ok;
}

function openRuleEditorById(id) {
  const rule = state.rules.find(item => item.id === id);
  if (rule) openRuleEditor(rule);
  else setStatus("That site rule no longer exists.", "error");
}

function openRuleEditor(rule, { hosts = "" } = {}) {
  const form = rule ? M.ruleToForm(rule) : { ...M.emptyRuleForm(), hostsText: hosts };
  const errorsList = h("ul", { class: "errors", role: "alert" });
  let close = () => {};

  const hostsInput = h("textarea", { rows: "2", value: form.hostsText, spellcheck: "false", placeholder: "x.com\n*.x.com",
    oninput: event => { form.hostsText = event.target.value; renderRaised(); } });

  const contextsDetail = h("div", {});
  const renderContextsDetail = () => {
    contextsDetail.hidden = form.contextsMode !== "selected";
    fill(contextsDetail,
      h("div", { class: "inline-choices", role: "group", "aria-label": "Space types" },
        M.CONTEXT_TYPES.map(type => choice({ type: "checkbox", name: "context-type", value: type,
          checked: form.contextTypes.includes(type), label: `All ${type} spaces`,
          onchange: event => { toggle(form.contextTypes, type, event.target.checked); } }))),
      state.contexts.length ? h("div", { class: "inline-choices", role: "group", "aria-label": "Specific spaces" },
        state.contexts.map(context => choice({ type: "checkbox", name: "context-workspace", value: context.uuid,
          checked: form.contextWorkspaces.includes(context.uuid), label: context.name,
          onchange: event => { toggle(form.contextWorkspaces, context.uuid, event.target.checked); } }))) : null);
  };
  const contextsField = h("fieldset", {}, h("legend", {}, "Where it applies"),
    h("div", { class: "inline-choices" },
      choice({ type: "radio", name: "contexts-mode", value: "all", checked: form.contextsMode === "all", label: "In every space",
        onchange: () => { form.contextsMode = "all"; renderContextsDetail(); } }),
      choice({ type: "radio", name: "contexts-mode", value: "selected", checked: form.contextsMode === "selected", label: "Only in some spaces",
        onchange: () => { form.contextsMode = "selected"; renderContextsDetail(); } })),
    contextsDetail);
  renderContextsDetail();

  const minutesInput = h("input", { type: "number", min: "1", max: "1440", step: "1", value: form.dailyMinutes, placeholder: "No limit",
    oninput: event => { form.dailyMinutes = event.target.value; } });
  const windowsBox = h("div", { class: "form-rows" });
  const addWindowButton = h("button", { type: "button", class: "ghost", onclick: () => {
    if (form.windows.length >= M.MAX_WINDOWS) { setStatus(`At most ${M.MAX_WINDOWS} time windows.`); return; }
    form.windows.push({ start: "09:00", end: "17:00", days: [] });
    renderWindows(form.windows.length - 1);
  } }, icon("plus", 14), "Add allowed hours");
  const renderWindows = focusIndex => {
    windowsBox.replaceChildren(...form.windows.map((window, index) => h("div", { class: "form-row", role: "group", "aria-label": `Time window ${index + 1}` },
      field({ label: `From (window ${index + 1})`, control: h("input", { type: "time", value: window.start, oninput: event => { window.start = event.target.value; } }) }),
      field({ label: `Until (window ${index + 1})`, control: h("input", { type: "time", value: window.end, oninput: event => { window.end = event.target.value; } }) }),
      iconButton("close", `Remove time window ${index + 1}`, () => {
        form.windows.splice(index, 1); renderWindows(Math.min(index, form.windows.length - 1));
      }),
      h("div", { class: "inline-choices", role: "group", "aria-label": `Days for window ${index + 1}; none selected means every day` },
        M.WEEKDAYS.map((label, day) => choice({ type: "checkbox", name: `window-${index}-days`, value: String(day),
          checked: window.days.includes(day), label, onchange: event => toggle(window.days, day, event.target.checked) }))))));
    if (!form.windows.length) windowsBox.append(h("p", { class: "help" }, "Any hour is fine."));
    if (focusIndex !== undefined && focusIndex >= 0) windowsBox.children[focusIndex]?.querySelector("input")?.focus();
    else if (focusIndex !== undefined) addWindowButton.focus();
  };
  renderWindows();

  const raisedBox = h("div", {});
  function renderRaised() {
    // Raising a host is for Outline only; a screenshot is never raised.
    raisedBox.hidden = form.observation !== "outline" && form.observation !== "screen";
    if (raisedBox.hidden) { raisedBox.replaceChildren(); return; }
    if (form.observation === "screen") { fill(raisedBox, h("p", { class: "help" }, M.SCREEN_CAP_TEXT)); return; }
    const { hosts } = M.parseHosts(form.hostsText);
    fill(raisedBox, h("p", { class: "help" }, M.SENSITIVE_CAP_TEXT),
      hosts.length ? h("div", { role: "group", "aria-label": "Raise the level for sensitive sites" },
        hosts.map(host => choice({ type: "checkbox", name: "raised-host", value: host, checked: form.raisedHosts.includes(host),
          label: `Allow Outline on ${host} even if it is a sensitive site`,
          onchange: event => toggle(form.raisedHosts, host, event.target.checked) }))) : null);
  }
  // No screenshot can be taken in this build, so Screenshot is not offered for a
  // new choice. A rule that already has it keeps it (and can keep it) unchanged.
  const savedScreen = form.observation === "screen";
  const observationField = h("fieldset", {}, h("legend", {}, "What may leave this Mac (for optional judgement)"),
    M.OBSERVATIONS.map(level => choice({ type: "radio", name: "observation", value: level, checked: form.observation === level,
      disabled: level === "screen" && !savedScreen,
      label: M.OBSERVATION_LABELS[level], help: M.OBSERVATION_TEXT[level],
      onchange: () => { form.observation = level; renderRaised(); } })),
    h("p", { class: "help" }, M.RULE_DATA_TEXT),
    raisedBox);
  renderRaised();
  const providerField = h("fieldset", {}, h("legend", {}, "Who may judge this rule"),
    M.DECISION_PROVIDERS.map(provider => choice({ type: "radio", name: "provider", value: provider, checked: form.provider === provider,
      label: M.PROVIDER_LABELS[provider], help: M.PROVIDER_TEXT[provider],
      onchange: () => { form.provider = provider; } })));

  const effectsField = h("fieldset", {}, h("legend", {}, "What the browser may do"),
    M.EFFECTS.map(effect => choice({ type: "checkbox", name: "effect", value: effect, checked: form.effects.includes(effect),
      label: M.EFFECT_TEXT[effect], onchange: event => toggle(form.effects, effect, event.target.checked) })),
    h("p", { class: "help" }, "No blocking of network traffic and no changes to page content."));
  const overrideField = h("fieldset", {}, h("legend", {}, "Continuing anyway"),
    M.OVERRIDES.map(value => choice({ type: "radio", name: "override", value, checked: form.override === value,
      label: M.OVERRIDE_TEXT[value], onchange: () => { form.override = value; } })));

  const agentsField = h("details", {},
    h("summary", {}, "Agents (not active yet)"),
    h("fieldset", { disabled: true },
      h("p", { class: "help" }, "Stored with the rule and ignored until agent support ships. Your limits never restrict agents."),
      field({ label: "Agent access", control: h("select", {},
        M.AGENT_ACCESS.map(value => option(value, value.replaceAll("_", " "), form.agents.access))) }),
      field({ label: "Instruction for agents", control: h("textarea", { rows: "2", value: form.agents.instruction }) })));

  const enabledSwitch = h("input", { type: "checkbox", class: "switch", checked: form.enabled, id: newId("enabled"),
    onchange: event => { form.enabled = event.target.checked; } });

  const save = async () => {
    const random = crypto.getRandomValues(new Uint8Array(12));
    const { rule: next, errors } = M.formToRule(form, { now: Date.now(), id: M.newRuleId(random) });
    errorsList.replaceChildren(...errors.map(error => h("li", {}, error.message)));
    if (!next) { setStatus("Fix the highlighted problems before saving.", "error"); return; }
    // saveRule creates a rule when it has no id and replaces a known id; an id
    // the store does not know is refused (UNKNOWN_RULE). A new rule therefore
    // goes without the model's placeholder id; the service assigns one.
    const payload = { ...next };
    if (!rule) delete payload.id;
    const saved = await act("saveRule", { rule: payload }, `Rule for ${next.match.hosts.join(", ")} saved.`);
    if (saved.ok) { close(); await loadRules(); }
  };

  close = openSheet({
    title: rule ? `Rule for ${rule.match.hosts.join(", ")}` : "New site rule",
    body: [
      field({ label: "Sites", control: hostsInput, help: "One per line. *.x.com matches subdomains only." }),
      field({ label: "What is this site for?", control: h("textarea", { rows: "3", maxlength: String(M.MAX_INSTRUCTION), value: form.instruction,
        placeholder: "I come here to post and answer mentions. If I drift into the feed, nudge me.",
        oninput: event => { form.instruction = event.target.value; } }),
      help: "Your words. Shown back to you as written; only used as text for optional judgement." }),
      h("fieldset", {}, h("legend", {}, "Limits (checked on this Mac)"),
        field({ label: "Minutes per day", control: minutesInput, help: "Empty means no daily limit. Counts time the site is in front, in the spaces this rule covers." }),
        h("h4", {}, "Allowed hours"),
        windowsBox, h("div", {}, addWindowButton)),
      effectsField, overrideField, contextsField, observationField, providerField, agentsField, errorsList],
    footer: [
      h("div", { class: "setting" }, enabledSwitch, h("label", { for: enabledSwitch.id }, "Rule is on")),
      h("span", { class: "spacer" }),
      rule ? h("button", { type: "button", class: "ghost destructive", onclick: async () => { if (await deleteRuleFlow(rule)) close(); } }, "Delete…") : null,
      h("button", { type: "button", onclick: () => close() }, "Cancel"),
      h("button", { type: "button", class: "primary", onclick: save }, "Save rule")],
  });
}

function toggle(list, value, on) {
  const index = list.indexOf(value);
  if (on && index < 0) list.push(value);
  if (!on && index >= 0) list.splice(index, 1);
}

// ---------------------------------------------------------------- AI & keys

async function loadProviders() {
  if (!state.admitted || !state.active) return;
  state.providersLoading = true;
  renderProviders();
  try {
    state.providers = await call("getProviderStatus");
  } catch (error) {
    state.providers = { version: 1, discovery: "unavailable", providers: [] };
    setStatus("Could not check assistants. " + errorText(error), "error");
  } finally {
    state.providersLoading = false;
  }
  renderProviders();
}

function providerCard(card) {
  return h("li", { class: "card provider", "data-tone": card.tone, "data-provider": card.id },
    h("div", { class: "card-head" },
      h("div", { class: "card-titles" },
        h("h3", { class: "card-title" }, card.label,
          h("span", { class: "tag state", "data-tone": card.tone }, card.stateLabel)),
        card.version ? h("span", { class: "card-sub" }, `Version ${card.version}${card.expectedVersion && card.expectedVersion !== card.version ? ` · this build expects ${card.expectedVersion}` : ""}`) : null)),
    h("p", { class: "help provider-detail" }, card.detail));
}

function renderProviders() {
  $("providers-summary").textContent = state.providersLoading && !state.providers ? "Checking which assistants are installed…" : M.providerSummary(state.providers);
  const cards = M.providerCards(state.providers).filter(card => !card.isJev);
  $("provider-list").replaceChildren(...cards.map(providerCard));
  $("providers-refresh").disabled = state.providersLoading || !state.admitted;
}

async function loadJev() {
  try {
    state.jev = await call("getJevSettings");
  } catch {
    state.jev = null;
  }
  renderJevCard();
}

// ---------------------------------------------------------------- decision keys (inside AI & keys)

// One form per provider, built once and then updated in place, so a key being
// typed and keyboard focus survive every refresh of either provider.
const keyPanels = new Map();

function keyPanel(provider) {
  const label = M.PROVIDER_LABELS[provider];
  const id = part => `${provider}-key${part}`;
  const panel = {
    tag: h("span", { class: "tag state", "data-tone": "unknown" }),
    detail: h("p", { class: "help", id: id("-detail") }),
    note: h("span", { class: "fact-note", hidden: true }),
    inputLabel: h("label", { for: id("") }),
    input: h("input", { type: "password", id: id(""), autocomplete: "off", spellcheck: "false", maxlength: "4096", disabled: true,
      "aria-describedby": `${id("-detail")} ${id("-help")} ${id("-error")}`, "data-focus-key": `keys:${provider}:input` }),
    store: h("button", { type: "button", class: "primary", disabled: true, "data-focus-key": `keys:${provider}:store`,
      onclick: () => storeDecisionKeyFlow(provider) }),
    remove: h("button", { type: "button", class: "ghost destructive", hidden: true, "data-focus-key": `keys:${provider}:remove`,
      onclick: () => removeDecisionKeyFlow(provider) }, "Remove key…"),
    help: h("span", { class: "help", id: id("-help") }),
    error: h("p", { class: "errors", role: "alert", id: id("-error") }),
    heading: h("h4", { id: id("-heading"), tabindex: "-1" }, label),
  };
  panel.input.addEventListener("keydown", event => {
    if (event.key === "Enter") { event.preventDefault(); storeDecisionKeyFlow(provider); }
  });
  panel.root = h("section", { class: "key-panel", "data-provider": provider, "aria-labelledby": id("-heading") },
    h("div", { class: "key-head" }, panel.heading, panel.tag),
    panel.detail, panel.note,
    h("div", { class: "field" }, panel.inputLabel,
      h("div", { class: "key-row" }, panel.input, panel.store, panel.remove),
      panel.help, panel.error));
  return panel;
}

function renderKeyPanel(provider) {
  const panel = keyPanels.get(provider);
  if (!panel) return;
  const slot = state.keys[provider];
  const view = M.decisionKeyView(provider, slot.card, { busy: slot.busy, refused: slot.refused });
  panel.tag.textContent = view.tagLabel;
  panel.tag.setAttribute("data-tone", view.tone);
  panel.detail.textContent = view.detail;
  panel.note.textContent = view.note ?? "";
  panel.note.hidden = !view.note;
  panel.inputLabel.textContent = view.inputLabel;
  panel.input.setAttribute("placeholder", view.placeholder);
  panel.input.disabled = !view.canStore;
  panel.store.textContent = view.storeLabel;
  panel.store.setAttribute("aria-label", view.storeName);
  panel.store.disabled = !view.canStore;
  panel.remove.setAttribute("aria-label", view.removeName);
  panel.remove.hidden = !view.canRemove;
  // While an operation runs the buttons keep focus but are inactive (aria-disabled).
  for (const button of [panel.store, panel.remove]) {
    if (view.busy) button.setAttribute("aria-disabled", "true"); else button.removeAttribute("aria-disabled");
  }
  panel.help.textContent = view.help;
  panel.error.textContent = slot.notice ? M.keychainErrorText(slot.notice) : "";
  if (view.busy) panel.root.setAttribute("aria-busy", "true"); else panel.root.removeAttribute("aria-busy");
}

function renderDecisionKeys() {
  const body = $("decision-keys-body");
  if (!body) return;
  if (!keyPanels.size) {
    for (const provider of M.DECISION_PROVIDERS) keyPanels.set(provider, keyPanel(provider));
    body.replaceChildren(...[...keyPanels.values()].map(panel => panel.root));
  }
  if (!state.connected) for (const provider of M.DECISION_PROVIDERS) state.keys[provider].refused ??= "NOT_CONNECTED";
  for (const provider of M.DECISION_PROVIDERS) renderKeyPanel(provider);
}

/** Presence of one provider's key. Only the latest read publishes, and never while hidden. */
async function loadDecisionKey(provider) {
  const slot = state.keys[provider];
  if (!state.active || !state.connected || !state.admitted || slot.busy) return;
  const ticket = slot.ticket = nextTicket();
  slot.busy = "check";
  renderKeyPanel(provider);
  let card = null, refused = null;
  try { card = M.decisionKeyCard(await call("getDecisionKeyStatus", { provider })); }
  catch (error) { refused = error?.code ?? "ERROR"; }
  if (slot.ticket !== ticket) return;
  slot.busy = null;
  slot.card = card;
  slot.refused = card ? null : refused ?? "ERROR";
  renderKeyPanel(provider);
}

function loadDecisionKeys() {
  renderDecisionKeys();
  return Promise.all(M.DECISION_PROVIDERS.map(loadDecisionKey));
}

/** Moves focus to the provider's form when the focused control went away. */
function keepKeyFocus(provider, focused) {
  const panel = keyPanels.get(provider);
  if (!panel || !focused || !(focused.disabled || focused.hidden)) return;
  const next = [panel.input, panel.store, panel.remove].find(node => !node.disabled && !node.hidden);
  (next ?? panel.heading).focus();
}

async function keyChange(provider, kind, request) {
  const slot = state.keys[provider];
  const ticket = slot.ticket = nextTicket();
  slot.busy = kind;
  slot.notice = null;
  renderKeyPanel(provider);
  let entry = null, code = null;
  try { entry = await request(); } catch (error) { code = error?.code ?? "ERROR"; }
  // Left AI & keys or hidden meanwhile: this answer is not shown.
  if (slot.ticket !== ticket) return;
  slot.busy = null;
  const card = M.decisionKeyCard(entry);
  const focused = document.activeElement;
  if (card) {
    slot.card = card;
    setStatus(M.keyChangedText(provider, kind === "store" ? "stored" : "removed"));
  } else slot.notice = code ?? "ERROR";
  renderKeyPanel(provider);
  keepKeyFocus(provider, focused);
  if (!card && M.KEY_RECHECK.includes(code)) loadDecisionKey(provider);
}

/** Explicit Store (button or Enter). The field is read once and cleared at once;
 * the key crosses the actor exactly once and is never shown, kept or logged. */
function storeDecisionKeyFlow(provider) {
  const panel = keyPanels.get(provider);
  const slot = state.keys[provider];
  if (!panel || slot.busy || !state.active) return;
  let key = panel.input.value;
  panel.input.value = "";
  if (!M.decisionKeyView(provider, slot.card, { refused: slot.refused }).canStore) { key = ""; return; }
  const check = M.checkDecisionKey(key);
  if (!check.ok) {
    key = "";
    slot.notice = check.code;
    renderKeyPanel(provider);
    return;
  }
  keyChange(provider, "store", async () => {
    try { return await call("storeDecisionKey", { provider, key }); } finally { key = ""; }
  }).catch(console.error);
}

async function removeDecisionKeyFlow(provider) {
  const slot = state.keys[provider];
  if (slot.busy || !state.active) return;
  const label = M.PROVIDER_LABELS[provider];
  const ok = await confirmDialog({ title: `Remove the ${label} key?`,
    message: `The key is deleted from the macOS Keychain. Site rules keep working on this Mac without ${label}.`,
    accept: "Remove key", destructive: true });
  if (!ok || slot.busy || !state.active) return;
  await keyChange(provider, "remove", () => call("removeDecisionKey", { provider }));
}

/** Leaving AI & keys (or hiding the page): typed keys are cleared, no late answer
 * is shown, and this page's key operations still on their way are cancelled. */
function leaveDecisionKeys() {
  let pending = false;
  for (const provider of M.DECISION_PROVIDERS) {
    const slot = state.keys[provider];
    // Only a change cancelled just now is reported when the view shows again.
    slot.notice = slot.busy === "store" || slot.busy === "remove" ? "SETTINGS_CLOSED" : null;
    pending ||= !!slot.busy;
    slot.ticket = nextTicket();
    slot.busy = null;
    const panel = keyPanels.get(provider);
    if (panel) panel.input.value = "";
    renderKeyPanel(provider);
  }
  if (pending && api && state.connected) call("cancelDecisionKeyOperations").catch(() => {});
}

// ---------------------------------------------------------------- Jev settings (inside AI & keys)

/** The Jev card: consent, check interval and budget. Keys are in their own block. */
function renderJevCard() {
  const box = $("jev-card");
  const form = M.jevToForm(state.jev);
  const errorsList = h("ul", { class: "errors", role: "alert" });
  const consent = choice({ type: "checkbox", name: "jev-consent", checked: form.consent,
    label: "Allow Jev to judge pages for rules that permit it",
    help: "Only rules with an observation level above Nothing can send anything.",
    onchange: event => { form.consent = event.target.checked; } });
  const interval = h("input", { type: "number", min: "1", max: "30", step: "1", value: form.intervalMinutes,
    oninput: event => { form.intervalMinutes = event.target.value; } });
  const budget = h("input", { type: "number", min: "0", max: "30", step: "1", value: form.hourlyBudget,
    oninput: event => { form.hourlyBudget = event.target.value; } });

  box.replaceChildren(
    h("div", { class: "block-head" }, h("h3", { id: "jev-heading" }, "Jev judgement"),
      h("p", { class: "block-help" }, "Optional judgement for site rules that choose Jev. Site rules work fully without it.")),
    h("div", { class: "panel settings-panel" },
      h("p", { class: "notice", id: "jev-statement" }, M.JEV_STATEMENT),
      h("p", { class: "help" }, M.DECISIONS_UNAVAILABLE),
      consent,
      h("div", { class: "form-row" },
        field({ label: "Check every (minutes)", control: interval, help: "1 to 30. Only for the tab in front; never background tabs or private windows." }),
        field({ label: "Calls per hour at most", control: budget, help: "0 to 30." })),
      h("details", {}, h("summary", {}, "What is sent on each call"), h("p", { class: "help", id: "jev-sent" }, M.JEV_SENT_TEXT)),
      errorsList,
      h("div", { class: "button-row" }, h("button", { type: "button", class: "primary", "aria-describedby": "jev-statement", onclick: async () => {
        const { patch, errors } = M.formToJevPatch(form);
        errorsList.replaceChildren(...errors.map(error => h("li", {}, error.message)));
        if (!patch) return;
        await act("setJevSettings", { patch }, "Jev settings saved.").then(loadJev);
      } }, "Save Jev settings"))));
}

function renderEngineSettings() {
  const box = $("engine-settings");
  const on = state.flags.enginePreferences;
  const rows = state.contexts.map(context => h("li", { class: "row" },
    spaceIcon(context),
    h("div", { class: "row-main" }, h("span", { class: "row-title" }, context.name)),
    h("select", { "aria-label": `Engine for ${context.name}`, "data-focus-key": `engine:${context.uuid}`, disabled: !on,
      onchange: event => act("setEnginePreference", { uuid: context.uuid, engine: event.target.value || null }, "Engine preference saved.") },
    option("", "Default (Firefox)", context.engine_preference ?? ""),
    option("firefox", "Firefox", context.engine_preference),
    option("chromium", "Chromium", context.engine_preference))));
  box.replaceChildren(
    h("div", { class: "block-head" }, h("h3", {}, "Other settings: engines"),
      h("p", { class: "block-help" }, on
        ? "Pages in a space can open in Chromium by default. If Chromium is unavailable the tab stays in Firefox."
        : "Every tab runs in Firefox. Rest the pointer on a tab to see its engine; on the tab you are on, click that engine icon to switch. A default engine per space stays off until the Chromium checks pass.")),
    // While the preference is off the per-space list would be inert; leave it out.
    ...(on && rows.length ? [h("ul", { class: "rows" }, rows)] : []));
}

// ---------------------------------------------------------------- agent status (inside AI & keys)

/** Reads the endpoint's own state (and, while it listens, both hook settings).
 * Reading starts nothing. Only the latest read publishes, never while hidden. */
async function loadAgentSettings() {
  if (!state.active || !state.connected || !state.admitted) return;
  const ticket = latest.agents = nextTicket();
  const current = () => ticket === latest.agents && state.active;
  let endpoint = null, error = null;
  try { endpoint = await call("getAgentEndpointState"); } catch (failure) { error = failure?.code ?? "ERROR"; }
  if (!current()) return;
  state.agents.endpoint = endpoint;
  state.agents.error = error;
  const socket = endpoint?.state === "listening" && typeof endpoint.socketPath === "string" ? endpoint.socketPath : null;
  if (socket !== state.agents.socket) { state.agents.hooks = new Map(); state.agents.socket = socket; }
  await keepFocus(renderAgentSettings);
  if (!socket || M.AGENT_HOOKS.every(({ agent }) => state.agents.hooks.has(agent))) return;
  const hooks = new Map();
  for (const { agent } of M.AGENT_HOOKS) {
    try { hooks.set(agent, { text: (await call("getAgentHookConfig", { agent }))?.text ?? null, error: null }); }
    catch (failure) { hooks.set(agent, { text: null, error: failure?.code ?? "ERROR" }); }
    if (!current()) return;
  }
  if (state.agents.socket !== socket) return;
  state.agents.hooks = hooks;
  await keepFocus(renderAgentSettings);
}

/** The explicit switch: on for this browser session, or off. The page shows
 * what the browser then reports, never what it asked for. */
async function setAgentStatus(enabled) {
  if (state.agents.busy || !state.active) return;
  state.agents.busy = true;
  await keepFocus(renderAgentSettings);
  let reply = null;
  try { reply = await call("setAgentEndpointEnabled", { enabled }); }
  catch (error) { if (state.active) setStatus(errorText(error), "error"); }
  state.agents.busy = false;
  if (!state.active) return;
  await loadAgentSettings();
  if (!reply) return;
  if (reply.state === "listening") setStatus("Agent status is on until you turn it off or quit AxioSozo.");
  else if (!enabled && reply.enabled === false && reply.state === "disabled") setStatus("Agent status is off.");
  else if (enabled) setStatus("Agent status did not start. Nothing is listening.", "error");
}

async function copyHook(entry, hook) {
  const clipboard = window.navigator?.clipboard;
  try {
    if (typeof clipboard?.writeText !== "function") throw new Error("NO_CLIPBOARD");
    await clipboard.writeText(entry.text);
    setStatus(`${hook.name} settings copied. Paste them into your ${hook.name} settings yourself.`);
  } catch {
    setStatus("Copying did not work. Open Show settings and copy the text yourself.", "error");
  }
}

function hookRow(hook) {
  const entry = state.agents.hooks.get(hook.agent);
  const key = `agents:hook:${hook.agent}`;
  const helpId = `agent-hook-${hook.agent}-help`;
  return h("li", { class: "row hook-row" },
    h("div", { class: "row-main" },
      h("span", { class: "row-title" }, hook.name),
      h("span", { class: "help", id: helpId }, entry?.error ? M.agentHookErrorText(entry.error) : hook.where),
      entry?.text ? h("details", { class: "snippet" },
        h("summary", { "data-focus-key": `${key}:show` }, "Show settings"),
        h("pre", { tabindex: "0", "aria-label": `${hook.name} settings` }, h("code", {}, entry.text))) : null),
    entry?.text ? h("button", { type: "button", class: "ghost small", "aria-describedby": helpId, "data-focus-key": `${key}:copy`,
      onclick: () => copyHook(entry, hook) }, `Copy for ${hook.name}`)
      : h("span", { class: "help" }, entry ? "" : "Preparing…"));
}

function renderAgentSettings() {
  const body = $("agent-settings-body");
  if (!body) return;
  if (!state.connected) {
    body.removeAttribute("aria-busy");
    fill(body, h("p", { class: "quiet-text" }, "Agent status appears here once AxioSozo is connected."));
    return;
  }
  const { endpoint, error, busy } = state.agents;
  const view = M.agentEndpointView(endpoint, { error });
  if (endpoint || error) body.removeAttribute("aria-busy"); else body.setAttribute("aria-busy", "true");
  // While a request is on its way the buttons stay focusable (aria-disabled, not
  // disabled), so keyboard focus is not dropped; a second press is ignored.
  const button = (action, primary) => action ? h("button", { type: "button", class: primary && action.kind === "enable" ? "primary" : "ghost",
    "aria-disabled": busy ? "true" : null, "aria-describedby": "agent-status-text", "data-focus-key": primary ? "agents:switch" : "agents:off",
    onclick: () => setAgentStatus(action.kind === "enable") }, action.label) : null;
  fill(body,
    h("div", { class: "setting agent-setting" },
      h("div", { class: "row-main" },
        h("span", { class: "row-title" }, "Agent status ", h("span", { class: "tag state", "data-tone": view.tone }, busy ? "Working…" : view.label)),
        h("span", { class: "help", id: "agent-status-text" }, view.text),
        view.detail ? h("span", { class: "fact-note" }, `Detail: ${view.detail}`) : null),
      h("div", { class: "card-actions" }, button(view.secondary, false), button(view.action, true))),
    view.listening ? h("div", { class: "agent-hooks" },
      h("h4", {}, "Hook settings"),
      h("p", { class: "help" }, M.AGENT_HOOKS_NOTE),
      h("ul", { class: "rows" }, M.AGENT_HOOKS.map(hookRow))) : null,
    h("p", { class: "footnote" }, M.AGENT_TOOLS_NOTE));
}

// ---------------------------------------------------------------- screen time (inside Site rules)

async function loadLedger() {
  const days = Number($("ledger-days").value) || 7;
  try {
    const [period, today, week] = await Promise.all([call("usageSummary", { days }),
      call("usageSummary", { days: 1 }), call("usageSummary", { days: 7 })]);
    state.ledgerSummary = period; state.usageToday = today; state.usageWeek = week;
  } catch (error) {
    state.ledgerSummary = []; state.usageToday = []; state.usageWeek = [];
    $("usage-list").replaceChildren(h("li", { class: "row" }, "Could not load screen time. " + errorText(error)));
    return;
  }
  await keepFocus(renderRules);
  renderUsage();
}

function renderUsage() {
  const list = $("usage-list");
  const rows = M.siteUsageRows(state.ledgerSummary, state.rules, 8);
  if (!rows.length) {
    list.replaceChildren(h("li", { class: "row" }, h("span", { class: "row-detail" }, "No screen time recorded for this period.")));
    return;
  }
  const max = Math.max(...rows.map(row => row.ms));
  list.replaceChildren(...rows.map(row => {
    const fill = h("span", {});
    fill.style.width = `${Math.max(2, Math.round((row.ms / max) * 100))}%`;
    return h("li", { class: "row usage-row" },
      h("span", { class: "row-main" }, h("span", { class: "row-title" }, row.host)),
      h("span", { class: "bar", "aria-hidden": "true" }, fill),
      h("span", { class: "bar-value" }, row.text),
      row.rule
        ? h("button", { type: "button", class: "ghost small", "aria-label": `Edit the rule for ${row.host}`, onclick: () => { location.hash = `rule=${row.rule}`; } }, "Rule")
        : h("button", { type: "button", class: "ghost small", "aria-label": `Add a rule for ${row.host}`, onclick: () => openRuleEditor(null, { hosts: row.host }) }, "Add rule"));
  }));
}

async function exportLedgerFlow() {
  const exported = await act("exportLedger");
  if (!exported.ok) return;
  const now = new Date();
  const name = M.exportFileName({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
  const url = URL.createObjectURL(new Blob([exported.result], { type: "application/json" }));
  const link = h("a", { href: url, download: name, hidden: true });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  setStatus(`Screen time exported as ${name}.`);
}

async function clearLedgerFlow() {
  const ok = await confirmDialog({ title: "Delete all screen time?",
    message: "All recorded time is deleted from this Mac. Site rules keep working and start counting again from now.",
    accept: "Delete screen time", destructive: true });
  if (ok) await act("clearLedger", {}, "Screen time deleted.").then(loadLedger);
}

// ---------------------------------------------------------------- wiring

const loaders = {
  contexts: () => Promise.all([loadContexts(), loadOrphans(), state.homeId ? loadHome() : null]),
  projects: () => loadProjects(),
  rules: loadRules,
  ledger: loadLedger,
  services: loadAttention,
  attention: loadAttention,
  // Agent status, activity or a browser session changed.
  agents: () => Promise.all([state.view === "ai" ? loadAgentSettings() : null, state.homeId ? loadHome() : null]),
};
// Events that can change what a project home shows.
const HOME_EVENTS = new Set(["projects", "contexts", "agents"]);
const pending = new Map();
function onServicesEvent(event) {
  const name = event?.name;
  if (!state.active || !Object.hasOwn(loaders, name)) return;
  // From this moment the home being fetched may be out of date: void its
  // answer now, also when this event joins a reload that is already queued.
  if (HOME_EVENTS.has(name)) invalidateHome();
  if (pending.has(name)) return;
  pending.set(name, setTimeout(() => {
    pending.delete(name);
    if (state.active) loaders[name]().catch(console.error);
  }, 100));
}

// ---------------------------------------------------------------- page lifetime

let unsubscribe = null;

// ---------------------------------------------------------------- admission

// A wait between admission attempts that a pagehide ends at once.
let admissionWait = null;
function waitForAdmissionRetry(ms) {
  return new Promise(resolve => {
    const timer = setTimeout(() => { admissionWait = null; resolve(); }, ms);
    admissionWait = () => { clearTimeout(timer); admissionWait = null; resolve(); };
  });
}

/**
 * The actor's own answer that it admits this shown page as a sender, read with
 * the read-only flags. While the browser still attaches a new tab it can refuse
 * the first messages, so a refusal is asked again a bounded number of times
 * (M.ADMISSION_RETRY_MS), only while this page is shown and this attempt is the
 * latest. Only a successful answer admits the page. Any other failure, and the
 * last refusal, leave it not connected. Nothing else is requested before
 * admission. Resolves true when admitted; false when refused for good or
 * superseded/hidden.
 */
async function admit() {
  const ticket = latest.admission = nextTicket();
  const current = () => ticket === latest.admission && state.active;
  for (let attempt = 0; ; attempt++) {
    let failure = null;
    try {
      const flags = await call("getOverviewFlags");
      if (!current()) return false;
      state.flags = flags;
      state.admitted = true;
      return true;
    } catch (error) {
      if (!current()) return false;
      failure = M.admissionFailure(error?.code);
    }
    if (failure !== "retry" || attempt >= M.ADMISSION_RETRY_MS.length) {
      state.connected = false;
      return false;
    }
    await waitForAdmissionRetry(M.ADMISSION_RETRY_MS[attempt]);
    if (!current()) return false;
  }
}

/** Refused for good, or without the actor: every part says so, and the controls
 * that would only ask the actor are off. */
function renderDisconnected() {
  renderAttention();
  renderProjects();
  renderProviders();
  renderJevCard();
  renderAgentSettings();
  renderDecisionKeys();
  for (const control of document.querySelectorAll("main button, main select, main input")) control.disabled = true;
}

/** pagehide: nothing queued runs, no late answer publishes and no new request
 * starts until the page is shown again; events stop arriving. An admission still
 * being asked stops, and a restored page is admitted afresh. */
function deactivate() {
  if (!state.active) return;
  leaveDecisionKeys();
  state.active = false;
  state.admitted = false;
  latest.admission = nextTicket();
  admissionWait?.();
  for (const timer of pending.values()) clearTimeout(timer);
  pending.clear();
  clearTimeout(homeRetry);
  homeRetry = null;
  invalidateHome();
  latest.projects = nextTicket();
  latest.contexts = nextTicket();
  latest.agents = nextTicket();
  state.agents.busy = false;
  statusTickets.clear();
  state.checking.clear();
  try { unsubscribe?.(); } catch (error) { console.error(error); }
  unsubscribe = null;
}

/** A persisted pageshow (back/forward cache): listen again and read everything
 * afresh, finishing a first load that the hide interrupted. */
function reactivate(event) {
  if (!event?.persisted || state.active) return;
  state.active = true;
  if (api && state.connected) boot().catch(error => { console.error(error); setStatus("AxioSozo could not start this page.", "error"); });
}

/** Subscribes and loads the page; run at start and again after a restore. A
 * hide while it runs stops it at the next step; the restore picks it up. */
async function boot() {
  if (!(await admit())) {
    if (state.active && !state.connected) renderDisconnected();
    return;
  }
  if (!state.active) return;
  // Subscribed only once admitted: a refused subscription is never sent again by the child.
  unsubscribe ??= api.subscribe(onServicesEvent);
  await loadActiveSpace();
  if (!state.active) return;
  // Everything the first view needs is loaded before Projects is drawn once
  // (renderProjects waits for state.loaded), so the page never shows half.
  await Promise.allSettled([loadContexts(), loadProjects(), loadRules(), loadJev(), loadLedger(), loadOrphans(), loadAttention()]);
  if (!state.active) return;
  // The check below covers every project, the shown home included.
  state.homeProbe = false;
  if (!state.started) {
    state.loaded = true;
    renderProjects();
    if (state.homeId) await loadHome();
    else renderHome();
    if (!state.active) return;
    renderJevCard();
    // No discovery and no Keychain check until AI & keys is opened.
    if (state.view === "ai" && !state.providers) await loadProviders();
    if (!state.active) return;
    state.started = true;
  }
  if (state.view === "ai") await Promise.all([loadAgentSettings(), loadDecisionKeys()]);
  else { renderAgentSettings(); renderDecisionKeys(); }
  if (!state.active) return;
  routeActions();
  // Local servers are checked when the page opens (declared loopback ports only).
  await refreshAllServiceStatus();
}

// Deep links (M.routeFromHash): #projects, #rules, #ai (old #home, #time and
// #settings redirect), #project=<id> is that project's home (the sidebar's and
// the arrival notification's "Show project"), #edit-project=<id> opens its home
// with the editor (sidebar "Edit project…"), #add-project=<space> starts adding
// a project to that space (the space menu), #rule=<id> opens a rule.
let handledHash = null;
function routeActions() {
  const hash = location.hash;
  if (hash === handledHash || !state.connected || !state.loaded) return;
  const route = M.routeFromHash(hash);
  if (route.addTo) {
    handledHash = hash;
    history.replaceState(null, "", "#projects");
    addProjectFlow({ contextUuid: route.addTo });
    return;
  }
  if (route.edit) {
    // The editor opens over the project's home; the next "Edit project…" is a new hash again.
    const home = M.homeHash(route.project);
    handledHash = home;
    history.replaceState(null, "", home);
    applyRoute();
    openProjectEditorById(route.project);
    return;
  }
  if (route.rule && state.rules.length) { handledHash = hash; openRuleEditorById(route.rule); }
}

function applyRoute() {
  const route = M.routeFromHash(location.hash);
  if (route.legacy) history.replaceState(null, "", `#${route.view}`);
  const previous = state.homeId;
  const homeId = M.homeIdFromRoute(route);
  state.homeId = homeId;
  showView(route.view);
  if (homeId !== previous) {
    // Answers for the route left behind (even the same project, away and back) are void.
    invalidateHome();
    clearTimeout(homeRetry);
    homeRetry = null;
    state.home = null;
    state.focusHome = !!homeId;
    state.homeProbe = !!homeId;
    state.returnTo = homeId ? null : previous;
  }
  const list = $("projects-list");
  const home = $("project-home");
  list.hidden = !!homeId;
  home.hidden = !homeId;
  if (!homeId) {
    home.replaceChildren();
    // Back from a home: keyboard focus returns to that project's card.
    if (state.returnTo) {
      document.querySelector(`[data-focus-key="${CSS.escape(`project:${state.returnTo}:open`)}"]`)?.focus();
      state.returnTo = null;
    }
    return;
  }
  renderHome();
  if (homeId !== previous && state.loaded) loadHome();
}

function onHashChange() {
  handledHash = null;
  applyRoute();
  routeActions();
}

// The skip link moves focus without changing the address (a project home stays put).
function setupSkipLink() {
  document.querySelector(".skip-link")?.addEventListener("click", event => {
    event.preventDefault();
    $("main").focus();
  });
}

async function init() {
  setupDialog();
  setupSheet();
  setupSkipLink();
  applyRoute();
  $("add-project").addEventListener("click", () => addProjectFlow({}));
  $("add-rule").addEventListener("click", () => openRuleEditor(null));
  $("ledger-days").addEventListener("change", loadLedger);
  $("ledger-export").addEventListener("click", exportLedgerFlow);
  $("ledger-clear").addEventListener("click", clearLedgerFlow);
  $("providers-refresh").addEventListener("click", () => { loadProviders(); loadDecisionKeys(); });
  window.addEventListener("hashchange", onHashChange);
  // Hidden (also into the back/forward cache): inactive until shown again from it.
  window.addEventListener("pagehide", deactivate);
  window.addEventListener("pageshow", reactivate);
  if (!api) {
    state.connected = false;
    renderDisconnected();
    return;
  }
  renderProviders(); // "Checking…", its refresh off until the actor admits this page
  await boot();
}

init().catch(error => { console.error(error); setStatus("AxioSozo could not start this page.", "error"); });
