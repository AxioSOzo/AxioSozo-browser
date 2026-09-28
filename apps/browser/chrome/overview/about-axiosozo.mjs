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
  connected: !!api,
  view: "projects",
  flags: { contexts: true, enginePreferences: false, jevKeyEntry: true },
  contexts: [], projects: [], rules: [], orphans: [], attention: [], jev: null,
  serviceStatus: new Map(), ledgerSummary: [], usageToday: [], usageWeek: [],
  activeSpace: null, providers: null, providersLoading: false, jevKey: null, placement: null,
};

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
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
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

/** A small overflow menu: <details> with a list of buttons. Closes on choice, Escape or outside click. */
function overflowMenu(label, items) {
  const menu = h("details", { class: "menu" });
  const close = () => { menu.open = false; };
  menu.append(
    h("summary", { class: "icon-summary", "aria-label": label, title: label },
      h("span", { class: "button-like icon" }, icon("more"))),
    h("div", { class: "menu-items", role: "menu" }, items.filter(Boolean).map(item =>
      h("button", { type: "button", role: "menuitem", class: item.destructive ? "destructive" : null,
        "data-focus-key": item.focusKey, onclick: () => { close(); item.run(); } }, item.label))));
  menu.addEventListener("keydown", event => { if (event.key === "Escape" && menu.open) { close(); menu.querySelector("summary").focus(); } });
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
  return error?.message ? String(error.message) : "Something went wrong.";
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

// Keeps keyboard focus on the "same" control across list re-renders.
async function keepFocus(render) {
  const key = document.activeElement?.dataset?.focusKey;
  await render();
  if (key) document.querySelector(`[data-focus-key="${CSS.escape(key)}"]`)?.focus();
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
const projectName = project => project.manifest?.name ?? project.id;
const hostOf = url => { try { return new URL(url).host; } catch { return url; } };

// ---------------------------------------------------------------- views

function showView(view) {
  state.view = view;
  for (const section of document.querySelectorAll("section.view")) section.hidden = section.dataset.view !== view;
  for (const link of document.querySelectorAll(".views a")) {
    if (link.dataset.view === view) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  // Provider discovery reads installation metadata only, and only when this view is opened.
  if (view === "ai" && !state.providers && !state.providersLoading && state.connected) loadProviders();
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
    else if (action?.kind === "project") button = h("button", { type: "button", onclick: () => { location.hash = `project=${action.id}`; } }, "Show project");
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
  try {
    state.contexts = await call("listContexts");
  } catch (error) {
    state.contexts = [];
    setStatus("Could not load spaces. " + errorText(error), "error");
  }
  await keepFocus(renderProjects);
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

function spaceHeader(context, count) {
  const key = suffix => `space:${context.uuid}:${suffix}`;
  const typeSelect = h("select", { class: "compact", "aria-label": `Type of space ${context.name}`, "data-focus-key": key("type"),
    title: "What this space is for. Any space can hold projects.",
    onchange: event => act("setContextType", { uuid: context.uuid, type: event.target.value },
      `${context.name} is now a ${TYPE_LABELS[event.target.value].toLowerCase()} space.`).then(loadContexts) },
  M.CONTEXT_TYPES.map(type => option(type, TYPE_LABELS[type], context.type)));
  const organizations = state.contexts.filter(item => item.type === "organization" && item.uuid !== context.uuid);
  const orgSelect = context.type === "project" && organizations.length
    ? h("select", { class: "compact", "aria-label": `Organization of ${context.name}`, "data-focus-key": key("org"),
      onchange: event => act("linkOrganization", { uuid: context.uuid, organizationUuid: event.target.value || null }, "Organization saved.").then(loadContexts) },
    option("", "No organization", context.organization_uuid ?? ""),
    organizations.map(org => option(org.uuid, org.name, context.organization_uuid))) : null;
  const signIns = context.container_label ? `Sign-ins: ${context.container_label}` : "Shared sign-ins";
  return h("div", { class: "space-group-head" },
    spaceIcon(context),
    h("div", { class: "row-main" },
      h("h3", { class: "space-name" }, context.name,
        context.uuid === state.activeSpace ? h("span", { class: "tag" }, "this window") : null),
      h("span", { class: "space-meta" }, `${count} ${count === 1 ? "project" : "projects"} · ${signIns}`)),
    typeSelect, orgSelect,
    h("button", { type: "button", class: "ghost", "data-focus-key": key("add"), "aria-label": `Add project to ${context.name}`,
      onclick: () => addProjectFlow({ contextUuid: context.uuid }) }, icon("plus", 14), "Add"),
    iconButton("open", `Switch to ${context.name}`, () => act("openContext", { uuid: context.uuid }), { "data-focus-key": key("open") }));
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

async function loadProjects() {
  try {
    state.projects = await call("listProjects");
    await keepFocus(renderProjects);
  } catch (error) {
    $("projects-body").replaceChildren(h("p", { class: "empty" }, "Could not load projects. " + errorText(error)));
  }
}

async function refreshServiceStatus(project, { quiet = false } = {}) {
  try {
    state.serviceStatus.set(project.id, await call("serviceStatus", { projectId: project.id }));
  } catch (error) {
    if (!quiet) setStatus(errorText(error), "error");
  }
  await keepFocus(renderProjects);
  if (quiet) return;
  const down = (state.serviceStatus.get(project.id) ?? []).filter(service => service.status === "down").length;
  setStatus(down ? `${down} local server${down === 1 ? " is" : "s are"} not running in ${projectName(project)}.` : `Local servers checked for ${projectName(project)}.`);
}

function urlChip(label, url, contextUuid, description, glyph = "globe") {
  return h("button", { type: "button", class: "chip", "aria-label": description ?? `Open ${label}`, title: url,
    onclick: () => act("openUrl", { url, contextUuid: contextUuid ?? null }) },
  icon(glyph, 14), h("span", {}, label), h("span", { class: "chip-detail" }, hostOf(url)));
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
      h("p", {}, "Any space can hold projects, personal ones included. Everything stays on this Mac.")),
    h("ol", { class: "steps" }, steps.map(([title, text], index) => h("li", { class: "step" },
      h("span", { class: "step-mark", "aria-hidden": "true" }, String(index + 1)),
      h("span", { class: "step-title" }, title),
      h("p", {}, text)))),
    h("div", {}, h("button", { type: "button", class: "primary", onclick: () => addProjectFlow({}) }, "Add project…")));
}

function projectCard(project) {
  const manifest = project.manifest;
  const key = suffix => `project:${project.id}:${suffix}`;
  const headingId = newId("project");
  const statuses = new Map((state.serviceStatus.get(project.id) ?? []).map(service => [service.name, service]));
  const down = [...statuses.values()].filter(service => service.status === "down").length;
  const inRepo = project.manifest_state === "written" || project.manifest_state === "external";
  const apps = [...new Set(manifest.environments.map(env => env.app ?? null))];
  const multiApp = apps.filter(Boolean).length > 1;
  const envLabel = env => (multiApp && env.app ? `${env.app} · ${env.name}` : env.name);
  const spaceSelect = h("select", { class: "compact", "aria-label": `Space of ${projectName(project)}`, "data-focus-key": key("space"),
    onchange: event => act("updateProject", { id: project.id, patch: { context_uuid: event.target.value || null } },
      event.target.value ? `${projectName(project)} now lives in ${contextName(event.target.value)}.` : `${projectName(project)} is no longer in a space.`)
      .then(() => Promise.all([loadProjects(), loadContexts()])) },
  option("", "No space", project.context_uuid ?? ""),
  state.contexts.map(context => option(context.uuid, spaceLabel(context), project.context_uuid)));
  const primary = manifest.surfaces.filter(surface => M.surfaceProminence(surface) === "primary");
  const secondary = manifest.surfaces.filter(surface => M.surfaceProminence(surface) !== "primary");
  const facts = [
    ["Space", [spaceSelect]],
    manifest.environments.length ? ["Environments", manifest.environments.map(env =>
      urlChip(envLabel(env), env.base_url, project.context_uuid, `Open ${envLabel(env)} environment ${env.base_url}`, env.name === "local" ? "laptop" : "globe"))] : null,
    manifest.services.length ? ["Local servers", [
      ...manifest.services.map(service => {
        const status = statuses.get(service.name)?.status ?? "unknown";
        return h("span", { class: "tag", title: M.SERVICES_HELP },
          h("span", { class: "dot", "data-status": status, "aria-hidden": "true" }), " ",
          `${service.app ? `${service.app} · ` : ""}${service.name} :${service.port} · ${M.serviceStatusText(service, status)}`);
      }),
      iconButton("refresh", `Check local servers of ${projectName(project)}`, () => refreshServiceStatus(project), { "data-focus-key": key("status") })]] : null,
    primary.length ? ["Links", primary.map(surface =>
      urlChip(surface.name, surface.url, project.context_uuid, `Open ${surface.name} (${surface.kind.replaceAll("_", " ")})`))] : null,
    secondary.length ? ["More links", secondary.map(surface =>
      urlChip(surface.name, surface.url, project.context_uuid, `Open ${surface.name} (${surface.kind.replaceAll("_", " ")})`))] : null,
  ].filter(Boolean);
  return h("li", { class: "card", id: `project-${project.id}`, "aria-labelledby": headingId, tabindex: "-1" },
    h("div", { class: "card-head" },
      h("div", { class: "card-titles" },
        h("h4", { id: headingId, class: "card-title" }, projectName(project),
          h("span", { class: "tag" }, manifest.kind),
          inRepo ? h("span", { class: "tag accent", title: "Stored in .axiosozo/project.json" }, "In repository") : null,
          down ? h("span", { class: "tag bad" }, `${down} down`) : null),
        h("span", { class: "card-sub path", title: project.root }, project.root)),
      h("div", { class: "card-actions" },
        h("button", { type: "button", class: "ghost", "data-focus-key": key("edit"), "aria-label": `Edit ${projectName(project)}`,
          onclick: () => openProjectReview({ mode: "edit", project }) }, "Edit"),
        overflowMenu(`More for ${projectName(project)}`, [
          { label: inRepo ? "Update .axiosozo/project.json…" : "Save as .axiosozo/project.json…", focusKey: key("write"), run: () => writeManifestFlow(project) },
          { label: "Remove project…", destructive: true, focusKey: key("remove"), run: () => removeProjectFlow(project) },
        ]))),
    h("dl", { class: "facts" }, facts.map(([label, value]) => [h("dt", {}, label), h("dd", {}, value)])));
}

function renderProjects() {
  const body = $("projects-body");
  const groups = M.projectGroups(state.contexts, state.projects);
  const parts = [];
  if (!state.projects.length) parts.push(state.connected ? firstRunGuide()
    : h("p", { class: "empty" }, "Projects appear here once AxioSozo is connected."));
  if (state.connected && !state.contexts.length) {
    parts.push(h("p", { class: "empty" }, "Waiting for Zen's spaces… If this stays empty, open a normal browser window."));
  }
  for (const group of groups) {
    const headingId = newId("space");
    const header = group.context ? spaceHeader(group.context, group.projects.length)
      : h("div", { class: "space-group-head" }, h("div", { class: "row-main" },
        h("h3", { class: "space-name" }, "Not in a space"),
        h("span", { class: "space-meta" }, "Choose a space to show these in the sidebar.")));
    header.querySelector("h3").id = headingId;
    parts.push(h("section", { class: "space-group", "aria-labelledby": headingId, "data-empty": !group.projects.length },
      header,
      group.projects.length ? h("ul", { class: "cards" }, group.projects.map(projectCard)) : null));
  }
  body.replaceChildren(...parts);
  renderPlacement();
  focusFromHash();
}

function renderPlacement() {
  const box = $("placement");
  const project = state.placement ? state.projects.find(item => item.id === state.placement) : null;
  if (!project) { box.hidden = true; box.replaceChildren(); return; }
  const space = state.contexts.find(context => context.uuid === project.context_uuid);
  box.replaceChildren(...[
    h("span", { class: "dot", "data-status": "up", "aria-hidden": "true" }),
    h("p", {}, M.placementMessage(project, state.contexts)),
    space ? h("button", { type: "button", class: "primary", onclick: () => act("openContext", { uuid: space.uuid }) }, `Switch to ${space.name}`) : null,
    iconButton("close", "Dismiss", () => { state.placement = null; renderPlacement(); })].filter(Boolean));
  box.hidden = false;
}

function focusProject(id) {
  const node = document.getElementById(`project-${id}`);
  if (!node) return false;
  node.scrollIntoView({ block: "start", behavior: "smooth" });
  node.focus({ preventScroll: true });
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
  if (ok) await act("removeProject", { id: project.id }, `${projectName(project)} removed.`).then(loadProjects);
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
      detectionDetails, writeChoice, errorsList],
    footer: [h("button", { type: "button", onclick: () => close() }, "Cancel"),
      h("button", { type: "button", class: "primary", onclick: submit }, mode === "new" ? "Add project" : "Save")],
  });
}

function openProjectEditorById(id) {
  const project = state.projects.find(item => item.id === id);
  if (project) openProjectReview({ mode: "edit", project });
  else setStatus("That project no longer exists.", "error");
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
    contextsDetail.replaceChildren(...[
      h("div", { class: "inline-choices", role: "group", "aria-label": "Space types" },
        M.CONTEXT_TYPES.map(type => choice({ type: "checkbox", name: "context-type", value: type,
          checked: form.contextTypes.includes(type), label: `All ${type} spaces`,
          onchange: event => { toggle(form.contextTypes, type, event.target.checked); } }))),
      state.contexts.length ? h("div", { class: "inline-choices", role: "group", "aria-label": "Specific spaces" },
        state.contexts.map(context => choice({ type: "checkbox", name: "context-workspace", value: context.uuid,
          checked: form.contextWorkspaces.includes(context.uuid), label: context.name,
          onchange: event => { toggle(form.contextWorkspaces, context.uuid, event.target.checked); } }))) : null].filter(Boolean));
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
    raisedBox.hidden = form.observation !== "outline";
    if (raisedBox.hidden) { raisedBox.replaceChildren(); return; }
    const { hosts } = M.parseHosts(form.hostsText);
    raisedBox.replaceChildren(...[h("p", { class: "help" }, M.SENSITIVE_CAP_TEXT),
      hosts.length ? h("div", { role: "group", "aria-label": "Raise the level for sensitive sites" },
        hosts.map(host => choice({ type: "checkbox", name: "raised-host", value: host, checked: form.raisedHosts.includes(host),
          label: `Allow Outline on ${host} even if it is a sensitive site`,
          onchange: event => toggle(form.raisedHosts, host, event.target.checked) }))) : null].filter(Boolean));
  }
  const observationField = h("fieldset", {}, h("legend", {}, "What may leave this Mac (for optional Jev judgement)"),
    M.OBSERVATIONS.map(level => choice({ type: "radio", name: "observation", value: level, checked: form.observation === level,
      label: { none: "Nothing", address: "The address", outline: "An outline of the page" }[level], help: M.OBSERVATION_TEXT[level],
      onchange: () => { form.observation = level; renderRaised(); } })),
    h("p", { class: "help" }, "Data only leaves this Mac when Jev consent is on in AI & keys, a Jev key is stored in the macOS Keychain, and this rule has a level above Nothing and at least one effect. Every call shows the outgoing-data indicator in the address bar."),
    raisedBox);
  renderRaised();

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
      help: "Your words. Shown back to you as written; only used as text for optional Jev judgement." }),
      h("fieldset", {}, h("legend", {}, "Limits (checked on this Mac)"),
        field({ label: "Minutes per day", control: minutesInput, help: "Empty means no daily limit. Counts time the site is in front, in the spaces this rule covers." }),
        h("h4", {}, "Allowed hours"),
        windowsBox, h("div", {}, addWindowButton)),
      effectsField, overrideField, contextsField, observationField, agentsField, errorsList],
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
  state.providersLoading = true;
  renderProviders();
  try {
    state.providers = await call("getProviderStatus");
    state.jevKey = M.providerCards(state.providers).find(card => card.isJev) ?? null;
  } catch (error) {
    state.providers = { version: 1, discovery: "unavailable", providers: [] };
    setStatus("Could not check assistants. " + errorText(error), "error");
  } finally {
    state.providersLoading = false;
  }
  renderProviders();
  renderJevCard();
}

async function loadJevKey() {
  try {
    const entry = await call("getJevKeyStatus");
    state.jevKey = M.providerCards({ providers: [entry] })[0] ?? null;
  } catch { state.jevKey = null; }
  renderJevCard();
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
  $("providers-refresh").disabled = state.providersLoading || !state.connected;
}

async function loadJev() {
  try {
    state.jev = await call("getJevSettings");
  } catch {
    state.jev = null;
  }
  renderJevCard();
}

/** The Jev card: key presence and entry (explicit Store/Remove only; the typed
 * key is cleared at once and never shown), then consent and budget. */
function renderJevCard() {
  const box = $("jev-card");
  const jev = state.jevKey;
  const form = M.jevToForm(state.jev);
  const keyState = M.jevKeyForm(jev);
  const keyErrors = h("p", { class: "errors", role: "alert", id: "jev-key-error" });
  const keyInput = h("input", { type: "password", id: "jev-key", autocomplete: "off", spellcheck: "false",
    placeholder: jev?.key === "stored" ? "Replace the stored key" : "Paste your Jev key", disabled: !keyState.enabled,
    "aria-describedby": "jev-key-help jev-key-error" });
  const store = async () => {
    // Read once, clear the field at once; the key crosses the actor exactly once.
    let key = keyInput.value;
    keyInput.value = "";
    const check = M.checkJevKey(key);
    if (!check.ok) { key = ""; keyErrors.textContent = M.keychainErrorText(check.code); return; }
    storeButton.disabled = true;
    try {
      const entry = await call("storeJevKey", { key });
      key = "";
      state.jevKey = M.providerCards({ providers: [entry] })[0] ?? state.jevKey;
      setStatus("Jev key stored in the macOS Keychain.");
      renderJevCard();
      $("jev-key")?.focus();
    } catch (error) {
      key = "";
      keyErrors.textContent = M.keychainErrorText(error?.code);
      storeButton.disabled = false;
    }
  };
  const storeButton = h("button", { type: "button", class: "primary", disabled: !keyState.enabled, onclick: store }, "Store key");
  keyInput.addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); store(); } });
  const removeButton = keyState.enabled && keyState.canRemove ? h("button", { type: "button", class: "ghost destructive", onclick: async () => {
    const ok = await confirmDialog({ title: "Remove the Jev key?", message: "The key is deleted from the macOS Keychain. Site rules keep working on this Mac without Jev.",
      accept: "Remove key", destructive: true });
    if (!ok) return;
    try {
      const entry = await call("removeJevKey");
      state.jevKey = M.providerCards({ providers: [entry] })[0] ?? state.jevKey;
      setStatus("Jev key removed from the macOS Keychain.");
      renderJevCard();
    } catch (error) { setStatus(M.keychainErrorText(error?.code), "error"); }
  } }, "Remove key…") : null;

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
    h("div", { class: "block-head" }, h("h3", { id: "jev-heading" }, "Jev"),
      h("p", { class: "block-help" }, "Optional judgement for site rules. Site rules work fully without it.")),
    h("div", { class: "panel sheet-body" },
      h("div", { class: "jev-state" },
        h("span", { class: "tag state", "data-tone": jev?.tone ?? "unknown" }, jev?.stateLabel ?? "Checking…"),
        h("p", { class: "help" }, jev?.detail ?? M.jevKeyNote({ keyEntryEnabled: state.flags.jevKeyEntry === true }))),
      h("div", { class: "field" },
        h("label", { for: "jev-key" }, jev?.key === "stored" ? "Replace the Jev key" : "Jev API key"),
        h("div", { class: "key-row" }, keyInput, storeButton, removeButton),
        h("span", { class: "help", id: "jev-key-help" }, keyState.reason
          ?? "Stored only in the macOS Keychain; this page never shows it again. Storing makes no call to Jev."),
        keyErrors),
      h("p", { class: "notice", id: "jev-statement" }, M.JEV_STATEMENT),
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
  contexts: () => Promise.all([loadContexts(), loadOrphans()]),
  projects: () => loadProjects(),
  rules: loadRules,
  ledger: loadLedger,
  services: loadAttention,
  attention: loadAttention,
};
const pending = new Map();
function onServicesEvent(event) {
  const name = event?.name;
  if (!Object.hasOwn(loaders, name) || pending.has(name)) return;
  pending.set(name, setTimeout(() => { pending.delete(name); loaders[name]().catch(console.error); }, 100));
}

// Deep links (M.routeFromHash): #projects, #rules, #ai (old #home, #time and
// #settings redirect), #project=<id> highlights a project, #edit-project=<id>
// opens its editor (sidebar "Edit project…"), #add-project=<space> starts
// adding a project to that space (the space menu), #rule=<id> opens a rule.
let handledHash = null;
function focusFromHash() {
  const hash = location.hash;
  if (hash === handledHash || !state.connected) return;
  const route = M.routeFromHash(hash);
  if (route.addTo) {
    handledHash = hash;
    history.replaceState(null, "", "#projects");
    addProjectFlow({ contextUuid: route.addTo });
    return;
  }
  if (route.edit && state.projects.length) {
    // Back to the plain view so the next "Edit project…" for the same project is a new hash.
    handledHash = hash;
    history.replaceState(null, "", "#projects");
    openProjectEditorById(route.project);
    return;
  }
  if (route.project && !route.edit && focusProject(route.project)) { handledHash = hash; return; }
  if (route.rule && state.rules.length) { handledHash = hash; openRuleEditorById(route.rule); }
}

function applyRoute() {
  if (location.hash === "#main") return; // the skip link
  const route = M.routeFromHash(location.hash);
  if (route.legacy) history.replaceState(null, "", `#${route.view}`);
  showView(route.view);
}

function onHashChange() {
  handledHash = null;
  applyRoute();
  focusFromHash();
}

async function init() {
  setupDialog();
  setupSheet();
  applyRoute();
  $("add-project").addEventListener("click", () => addProjectFlow({}));
  $("add-rule").addEventListener("click", () => openRuleEditor(null));
  $("ledger-days").addEventListener("change", loadLedger);
  $("ledger-export").addEventListener("click", exportLedgerFlow);
  $("ledger-clear").addEventListener("click", clearLedgerFlow);
  $("providers-refresh").addEventListener("click", () => loadProviders());
  window.addEventListener("hashchange", onHashChange);
  if (!api) {
    state.connected = false;
    renderAttention();
    renderProjects();
    renderProviders();
    renderJevCard();
    for (const control of document.querySelectorAll("main button, main select, main input")) control.disabled = true;
    return;
  }
  try { state.flags = await call("getOverviewFlags"); } catch (error) { if (error?.code === "SENDER_REJECTED") state.connected = false; }
  api.subscribe(onServicesEvent);
  await loadActiveSpace();
  await loadContexts();
  await Promise.allSettled([loadProjects(), loadRules(), loadJev(), loadLedger(), loadOrphans(), loadAttention()]);
  renderProjects();
  renderJevCard();
  if (state.view === "ai") { if (!state.providers) await loadProviders(); }
  else loadJevKey(); // Keychain presence only (no discovery until AI & keys is opened)
  focusFromHash();
  // Local servers are checked when the page opens (declared loopback ports only).
  for (const project of state.projects) if (project.manifest.services.length) refreshServiceStatus(project, { quiet: true });
}

init().catch(error => { console.error(error); setStatus("AxioSozo could not start this page.", "error"); });
