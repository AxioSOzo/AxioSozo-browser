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

const VIEWS = ["home", "projects", "rules", "time", "settings"];
const TYPE_LABELS = { personal: "Personal", organization: "Organization", project: "Project" };
const GUIDE_DISMISSED = "axiosozo.guide.dismissed";

const state = {
  connected: !!api,
  view: "home",
  flags: { contexts: true, enginePreferences: false, jevKeyEntry: false },
  contexts: [], projects: [], rules: [], orphans: [], attention: [], jev: null,
  serviceStatus: new Map(), ledgerSummary: [],
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

function viewFromHash() {
  const hash = location.hash.slice(1);
  if (/^project=/.test(hash)) return "projects";
  if (/^rule=/.test(hash)) return "rules";
  return VIEWS.includes(hash) ? hash : "home";
}

function showView(view) {
  state.view = view;
  for (const section of document.querySelectorAll("section.view")) section.hidden = section.dataset.view !== view;
  for (const link of document.querySelectorAll(".views a")) {
    if (link.dataset.view === view) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

function renderViewCounts() {
  const link = document.querySelector('.views a[data-view="home"]');
  link.querySelector(".count")?.remove();
  if (state.attention.length) link.append(h("span", { class: "count", "aria-label": `${state.attention.length} need attention` }, String(state.attention.length)));
}

// ---------------------------------------------------------------- guide

function guideDismissed() {
  try { return localStorage.getItem(GUIDE_DISMISSED) === "1"; } catch { return false; }
}

function renderGuide() {
  const box = $("guide");
  const steps = [
    { title: "Type your spaces", text: "Mark a Zen space as personal, organization or project. Sign-ins already stay separate per space.",
      done: state.contexts.some(context => context.type !== "personal"),
      action: h("button", { type: "button", onclick: () => document.querySelector(".space input:checked")?.focus() }, "Show spaces") },
    { title: "Add a project", text: "Pick a folder. AxioSozo reads a few config files, never runs anything, and puts the project at the top of its space.",
      done: state.projects.some(project => project.context_uuid),
      action: h("button", { type: "button", onclick: () => { location.hash = "projects"; addProjectFlow(); } }, "Add project…") },
    { title: "Set a site rule", text: "Write what a site is for, in your words, with an optional daily limit. You can always continue.",
      done: state.rules.length > 0,
      action: h("button", { type: "button", onclick: () => { location.hash = "rules"; openRuleEditor(null); } }, "Add rule…") },
  ];
  if (!state.connected || guideDismissed() || steps.every(step => step.done)) { box.replaceChildren(); return; }
  box.replaceChildren(h("section", { class: "guide", "aria-labelledby": "guide-heading" },
    h("div", { class: "guide-head" },
      h("h3", { id: "guide-heading" }, "Make AxioSozo yours"),
      h("p", {}, "Three steps, each optional. Everything stays on this Mac.")),
    iconButton("close", "Hide these steps", () => {
      try { localStorage.setItem(GUIDE_DISMISSED, "1"); } catch {}
      renderGuide();
    }, { class: "icon guide-close" }),
    h("ol", { class: "steps" }, steps.map((step, index) => h("li", { class: "step", "data-done": step.done },
      h("span", { class: "step-mark", "aria-hidden": "true" }, step.done ? icon("check", 12) : String(index + 1)),
      h("span", { class: "step-title" }, step.title, step.done ? h("span", { class: "visually-hidden" }, " (done)") : null),
      h("p", {}, step.text),
      step.done ? null : step.action)))));
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
    await keepFocus(renderContexts);
  } catch (error) {
    $("spaces-body").replaceChildren(h("p", { class: "empty" }, "Could not load spaces. " + errorText(error)));
  }
}

function spaceIcon(space) {
  const box = h("span", { class: "space-icon", "aria-hidden": "true" });
  const glyph = typeof space.icon === "string" ? space.icon.trim() : "";
  if (glyph.startsWith("chrome://")) box.append(h("img", { src: glyph, alt: "" }));
  else if (glyph && [...glyph].length <= 2) box.textContent = glyph;
  else box.append(icon("space"));
  return box;
}

function typePicker(row) {
  const name = newId("type");
  return h("fieldset", { class: "segmented", "aria-label": `Type of ${row.name}` },
    M.CONTEXT_TYPES.map(type => {
      const input = h("input", { type: "radio", name, value: type, checked: row.type === type, id: newId("type"),
        "data-focus-key": `space:${row.uuid}:type:${type}`,
        onchange: () => act("setContextType", { uuid: row.uuid, type },
          `${row.name} is now a ${TYPE_LABELS[type].toLowerCase()} space.`).then(loadContexts) });
      return [input, h("label", { for: input.id }, TYPE_LABELS[type])];
    }));
}

function renderContexts() {
  const body = $("spaces-body");
  if (!state.contexts.length) {
    body.replaceChildren(h("p", { class: "empty" }, state.connected
      ? "Waiting for Zen's spaces… If this stays empty, open a normal browser window."
      : "Spaces appear here once AxioSozo is connected."));
    renderGuide();
    return;
  }
  const cards = M.contextRows(state.contexts, state.projects).map(row => {
    const key = suffix => `space:${row.uuid}:${suffix}`;
    let meta = row.container_label ? `Sign-ins: ${row.container_label}` : "Shared sign-ins";
    const links = [];
    if (row.showLinks) {
      const linked = state.projects.find(project => project.id === row.project_id);
      meta = linked ? `Project: ${projectName(linked)}` : "No project linked yet";
      links.push(h("select", { "aria-label": `Project of ${row.name}`, "data-focus-key": key("project"),
        onchange: event => act("linkProject", { uuid: row.uuid, projectId: event.target.value || null }, "Project link saved.") },
      option("", row.projectOptions.length ? "Link a project…" : "No projects yet", row.project_id ?? ""),
      row.projectOptions.map(project => option(project.id, project.name, row.project_id))));
      if (row.organizationOptions.length) {
        links.push(h("select", { "aria-label": `Organization of ${row.name}`, "data-focus-key": key("org"),
          onchange: event => act("linkOrganization", { uuid: row.uuid, organizationUuid: event.target.value || null }, "Organization link saved.") },
        option("", "No organization", row.organization_uuid ?? ""),
        row.organizationOptions.map(org => option(org.uuid, org.name, row.organization_uuid))));
      }
    }
    return h("li", { class: "space" },
      h("div", { class: "space-head" }, spaceIcon(row),
        h("div", { class: "row-main" }, h("span", { class: "space-name" }, row.name), h("span", { class: "space-meta" }, meta)),
        iconButton("open", `Switch to ${row.name}`, () => act("openContext", { uuid: row.uuid }), { class: "icon open", "data-focus-key": key("open") })),
      typePicker(row),
      links.length ? h("div", { class: "form-row" }, links) : null);
  });
  body.replaceChildren(h("ul", { class: "spaces", "aria-describedby": "spaces-help" }, cards));
  renderGuide();
  renderEngineSettings();
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
    help: orphan.project_id ? `Linked to project ${orphan.project_id}` : null,
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
    $("project-list").replaceChildren(h("li", { class: "empty" }, "Could not load projects. " + errorText(error)));
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
  setStatus(down ? `${down} service${down === 1 ? " is" : "s are"} not running in ${projectName(project)}.` : `Services checked for ${projectName(project)}.`);
}

function urlChip(label, url, contextUuid, description, glyph = "globe") {
  return h("button", { type: "button", class: "chip", "aria-label": description ?? `Open ${label}`, title: url,
    onclick: () => act("openUrl", { url, contextUuid: contextUuid ?? null }) },
  icon(glyph, 14), h("span", {}, label), h("span", { class: "chip-detail" }, hostOf(url)));
}

function renderProjects() {
  const list = $("project-list");
  if (!state.projects.length) {
    list.replaceChildren(h("li", { class: "empty" },
      h("p", {}, "No projects yet."),
      h("p", { class: "help" }, "Add a project folder to see its environments, services and web surfaces here and at the top of its space.")));
    return;
  }
  list.replaceChildren(...state.projects.map(project => {
    const manifest = project.manifest;
    const key = suffix => `project:${project.id}:${suffix}`;
    const headingId = newId("project");
    const statuses = new Map((state.serviceStatus.get(project.id) ?? []).map(service => [service.name, service]));
    const down = [...statuses.values()].filter(service => service.status === "down").length;
    const inRepo = project.manifest_state === "written" || project.manifest_state === "external";
    const spaceSelect = h("select", { "aria-label": `Space of ${projectName(project)}`, "data-focus-key": key("space"),
      onchange: event => act("updateProject", { id: project.id, patch: { context_uuid: event.target.value || null } },
        event.target.value ? `${projectName(project)} now lives in ${contextName(event.target.value)}.` : `${projectName(project)} is no longer linked to a space.`)
        .then(() => Promise.all([loadProjects(), loadContexts()])) },
    option("", "Not linked", project.context_uuid ?? ""),
    state.contexts.map(context => option(context.uuid, context.name, project.context_uuid)));
    const facts = [
      ["Space", [spaceSelect, project.context_uuid && contextName(project.context_uuid)
        ? iconButton("open", `Switch to ${contextName(project.context_uuid)}`, () => act("openContext", { uuid: project.context_uuid }), { "data-focus-key": key("open-space") })
        : h("span", { class: "help" }, project.context_uuid ? "That space was deleted." : "Link it to show the project in that space's sidebar.")]],
      manifest.environments.length ? ["Environments", manifest.environments.map(env =>
        urlChip(env.name, env.base_url, project.context_uuid, `Open ${env.name} environment ${env.base_url}`, env.name === "local" ? "laptop" : "globe"))] : null,
      manifest.services.length ? ["Services", [
        ...manifest.services.map(service => {
          const status = statuses.get(service.name)?.status ?? "unknown";
          return h("span", { class: "tag", title: M.SERVICES_HELP },
            h("span", { class: "dot", "data-status": status, "aria-hidden": "true" }), " ",
            `${service.name} :${service.port} · ${M.serviceStatusText(service, status)}`);
        }),
        iconButton("refresh", `Check services of ${projectName(project)}`, () => refreshServiceStatus(project), { "data-focus-key": key("status") })]] : null,
      manifest.surfaces.length ? ["Links", manifest.surfaces.map(surface =>
        urlChip(surface.name, surface.url, project.context_uuid, `Open ${surface.name} (${surface.kind.replaceAll("_", " ")})`))] : null,
    ].filter(Boolean);
    return h("li", { class: "card", id: `project-${project.id}`, "aria-labelledby": headingId, tabindex: "-1" },
      h("div", { class: "card-head" },
        h("div", { class: "card-titles" },
          h("h3", { id: headingId, class: "card-title" }, projectName(project),
            h("span", { class: "tag" }, manifest.kind),
            inRepo ? h("span", { class: "tag accent", title: "Stored in .axiosozo/project.json" }, "In repository") : null,
            down ? h("span", { class: "tag bad" }, `${down} down`) : null),
          h("span", { class: "card-sub path", title: project.root }, project.root)),
        h("div", { class: "card-actions" },
          overflowMenu(`More for ${projectName(project)}`, [
            { label: "Edit project…", focusKey: key("edit"), run: () => openProjectReview({ mode: "edit", project }) },
            { label: inRepo ? "Update .axiosozo/project.json…" : "Save as .axiosozo/project.json…", focusKey: key("write"), run: () => writeManifestFlow(project) },
            { label: "Remove project…", destructive: true, focusKey: key("remove"), run: () => removeProjectFlow(project) },
          ]))),
      h("dl", { class: "facts" }, facts.map(([label, value]) => [h("dt", {}, label), h("dd", {}, value)])));
  }));
  focusFromHash();
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

async function addProjectFlow() {
  const picked = await act("pickFolder");
  if (!picked.ok) return;
  if (!picked.result) return;
  const root = picked.result;
  const detected = await act("detect", { root });
  if (!detected.ok) return;
  openProjectReview({ mode: "new", root, draft: detected.result });
}

// Draft review / project edit form, in the sheet.
function openProjectReview({ mode, root, draft, project }) {
  const review = mode === "new" ? { ...M.draftToReview(draft), contextUuid: null } : M.projectToReview(project);
  const errorsList = h("ul", { class: "errors", role: "alert" });
  let writeManifest = false;
  let close = () => {};

  const provenance = row => row.source
    ? h("span", { class: "provenance" }, row.guess ? h("span", { class: "tag guess" }, "guess") : null,
      `from ${row.source}`) : null;

  const rowEditor = ({ title, rows, fields, empty, addLabel }) => {
    const box = h("div", { class: "form-rows" });
    const render = focusIndex => {
      box.replaceChildren(...rows.map((row, index) => {
        const controls = fields.map(spec => {
          const control = spec.kind
            ? h("select", { onchange: event => { row[spec.key] = event.target.value; } },
              spec.kind.map(value => option(value, value.replaceAll("_", " "), row[spec.key])))
            : h("input", { type: spec.type ?? "text", value: row[spec.key] ?? "", placeholder: spec.placeholder,
              oninput: event => { row[spec.key] = event.target.value; } });
          return field({ label: `${spec.label} ${index + 1}`, control });
        });
        const remove = iconButton("close", `Remove ${title.toLowerCase()} ${index + 1}`,
          () => { rows.splice(index, 1); render(Math.min(index, rows.length - 1)); });
        return h("div", { class: "form-row", role: "group", "aria-label": `${title} ${index + 1}` }, controls, remove, provenance(row));
      }));
      if (!rows.length) box.append(h("p", { class: "help" }, empty));
      if (focusIndex !== undefined && focusIndex >= 0) box.children[focusIndex]?.querySelector("input, select, button")?.focus();
      else if (focusIndex !== undefined) addButton.focus();
    };
    const addButton = h("button", { type: "button", class: "ghost", onclick: () => {
      rows.push(Object.fromEntries([...fields.map(spec => [spec.key, spec.kind ? spec.kind[0] : ""]), ["source", ""], ["guess", false]]));
      render(rows.length - 1);
    } }, icon("plus", 14), addLabel);
    render();
    return h("fieldset", {}, h("legend", {}, title), box, h("div", {}, addButton));
  };

  const nameInput = h("input", { type: "text", value: review.name, maxlength: "80", required: true,
    oninput: event => { review.name = event.target.value; } });
  const kindSelect = h("select", { onchange: event => { review.kind = event.target.value; } },
    M.PROJECT_KINDS.map(kind => option(kind, kind, review.kind)));
  const contextSelect = h("select", { onchange: event => { review.contextUuid = event.target.value || null; } },
    option("", "Not linked", review.contextUuid ?? ""),
    state.contexts.map(context => option(context.uuid, context.name, review.contextUuid)));

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
    h("p", { class: "help" }, ".env files, key files and anything outside the folder are never read. Nothing is executed.")) : null;

  const writeChoice = mode === "new" ? choice({ type: "checkbox", name: "write-manifest", label: "Also save .axiosozo/project.json in the folder",
    help: "Asks first. The file holds names, addresses, ports and links only, never secrets.",
    onchange: event => { writeManifest = event.target.checked; } }) : null;

  const submit = async () => {
    const { manifest, errors } = M.reviewToManifest(review);
    errorsList.replaceChildren(...errors.map(error => h("li", {}, error.message)));
    if (!manifest) { setStatus("Fix the highlighted problems before saving.", "error"); return; }
    if (mode === "edit") {
      const saved = await act("updateProject", { id: project.id, patch: { manifest, context_uuid: review.contextUuid } },
        `${manifest.name} saved.`);
      if (saved.ok) { close(); await Promise.all([loadProjects(), loadContexts()]); }
      return;
    }
    const confirmed = await act("confirmProject", { root, manifest, contextUuid: review.contextUuid }, `${manifest.name} added.`);
    if (!confirmed.ok) return;
    close();
    await Promise.all([loadProjects(), loadContexts()]);
    if (confirmed.result?.id) { location.hash = `project=${confirmed.result.id}`; focusFromHash(); }
    if (writeManifest && confirmed.result?.id) await writeManifestFlow(confirmed.result);
  };

  close = openSheet({
    title: mode === "new" ? "Review project" : `Edit ${projectName(project)}`,
    body: [
      mode === "new" ? [h("p", { class: "path" }, root),
        h("p", { class: "notice" }, "A draft from static detection. Values marked guess are framework defaults. Nothing is saved until you confirm.")] : null,
      h("div", { class: "form-row" }, field({ label: "Name", control: nameInput }),
        field({ label: "Kind", control: kindSelect, help: review.kindSource.source
          ? `${review.kindSource.guess ? "Guessed" : "Detected"} from ${review.kindSource.source}` : null }),
        field({ label: "Space", control: contextSelect })),
      rowEditor({ title: "Environments", rows: review.environments, empty: "No environments.", addLabel: "Add environment",
        fields: [{ key: "name", label: "Name of environment", placeholder: "local" },
          { key: "base_url", label: "Address of environment", type: "url" }] }),
      rowEditor({ title: "Services", rows: review.services, empty: "No services.", addLabel: "Add service",
        fields: [{ key: "name", label: "Name of service" }, { key: "url", label: "Address of service", type: "url" },
          { key: "port", label: "Port of service", type: "number" }] }),
      rowEditor({ title: "Links", rows: review.surfaces, empty: "No web links.", addLabel: "Add link",
        fields: [{ key: "name", label: "Name of link" }, { key: "url", label: "Address of link", type: "url" },
          { key: "kind", label: "Kind of link", kind: M.SURFACE_KINDS }] }),
      detectionDetails, writeChoice, errorsList],
    footer: [h("button", { type: "button", onclick: () => close() }, "Cancel"),
      h("button", { type: "button", class: "primary", onclick: submit }, mode === "new" ? "Add project" : "Save")],
  });
}

// ---------------------------------------------------------------- site rules

async function loadRules() {
  try {
    state.rules = await call("listRules");
    await keepFocus(renderRules);
  } catch (error) {
    $("rule-list").replaceChildren(h("li", { class: "empty" }, "Could not load site rules. " + errorText(error)));
  }
}

function renderRules() {
  const list = $("rule-list");
  renderGuide();
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
    const enabled = h("input", { type: "checkbox", class: "switch", checked: rule.enabled, "data-focus-key": key("enabled"),
      "aria-label": `Rule for ${hosts} ${rule.enabled ? "on" : "off"}`, title: rule.enabled ? "On" : "Off",
      onchange: event => act("saveRule", { rule: { ...rule, enabled: event.target.checked, updated_at: Date.now() } },
        `Rule for ${hosts} ${event.target.checked ? "on" : "off"}.`).then(loadRules) });
    return h("li", { class: "card", id: `rule-${rule.id}`, "aria-labelledby": headingId, tabindex: "-1" },
      h("div", { class: "card-head" },
        h("div", { class: "card-titles" },
          h("h3", { id: headingId, class: "card-title" }, hosts),
          h("span", { class: "card-sub" }, M.describeRule(rule))),
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

function openRuleEditor(rule) {
  const form = rule ? M.ruleToForm(rule) : M.emptyRuleForm();
  const errorsList = h("ul", { class: "errors", role: "alert" });
  let close = () => {};

  const hostsInput = h("textarea", { rows: "2", value: form.hostsText, spellcheck: "false", placeholder: "x.com\n*.x.com",
    oninput: event => { form.hostsText = event.target.value; renderRaised(); } });

  const contextsDetail = h("div", {});
  const renderContextsDetail = () => {
    contextsDetail.hidden = form.contextsMode !== "selected";
    contextsDetail.replaceChildren(
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
    raisedBox.hidden = form.observation !== "outline";
    if (raisedBox.hidden) { raisedBox.replaceChildren(); return; }
    const { hosts } = M.parseHosts(form.hostsText);
    raisedBox.replaceChildren(h("p", { class: "help" }, M.SENSITIVE_CAP_TEXT),
      hosts.length ? h("div", { role: "group", "aria-label": "Raise the level for sensitive sites" },
        hosts.map(host => choice({ type: "checkbox", name: "raised-host", value: host, checked: form.raisedHosts.includes(host),
          label: `Allow Outline on ${host} even if it is a sensitive site`,
          onchange: event => toggle(form.raisedHosts, host, event.target.checked) }))) : null);
  }
  const observationField = h("fieldset", {}, h("legend", {}, "What may leave this Mac (for optional Jev judgement)"),
    M.OBSERVATIONS.map(level => choice({ type: "radio", name: "observation", value: level, checked: form.observation === level,
      label: { none: "Nothing", address: "The address", outline: "An outline of the page" }[level], help: M.OBSERVATION_TEXT[level],
      onchange: () => { form.observation = level; renderRaised(); } })),
    h("p", { class: "help" }, "Data only leaves this Mac when Jev consent is on in Settings, a Jev key is stored in the macOS Keychain, and this rule has a level above Nothing and at least one effect. Every call shows the outgoing-data indicator in the address bar."),
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

// ---------------------------------------------------------------- settings

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
    h("div", { class: "block-head" }, h("h3", {}, "Engines"),
      h("p", { class: "block-help" }, on
        ? "Pages in a space can open in Chromium by default. If Chromium is unavailable the tab stays in Firefox."
        : "Every tab runs in Firefox. Rest the pointer on a tab to see its engine; on the tab you are on, click that engine icon to switch. A default engine per space stays off until the Chromium checks pass.")),
    // While the preference is off the per-space list would be inert; leave it out.
    on && rows.length ? h("ul", { class: "rows" }, rows) : null);
}

async function loadJev() {
  try {
    state.jev = await call("getJevSettings");
  } catch {
    state.jev = null;
  }
  renderJev();
}

function renderJev() {
  const box = $("jev-settings");
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
  const keyPresent = state.jev?.key_present ?? state.jev?.has_key;
  const keyNote = M.jevKeyNote({ keyEntryEnabled: state.flags.jevKeyEntry === true,
    keyPresent: typeof keyPresent === "boolean" ? keyPresent : undefined });
  box.replaceChildren(
    h("div", { class: "block-head" }, h("h3", { id: "jev-heading" }, "Jev judgement"),
      h("p", { class: "block-help" }, "Optional. Site rules work fully without it.")),
    h("div", { class: "panel sheet-body", "aria-labelledby": "jev-heading" },
      h("p", { class: "notice", id: "jev-statement" }, M.JEV_STATEMENT),
      h("p", { class: "help" }, keyNote),
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
      } }, "Save"))));
}

// ---------------------------------------------------------------- screen time

async function loadLedger() {
  const days = Number($("ledger-days").value) || 7;
  try {
    state.ledgerSummary = await call("usageSummary", { days });
    renderLedger();
  } catch (error) {
    $("ledger-body").replaceChildren(h("p", { class: "empty" }, "Could not load screen time. " + errorText(error)));
  }
}

function barRow(label, sub, ms, max, text) {
  const width = max > 0 ? Math.max(2, Math.round((ms / max) * 100)) : 0;
  const fill = h("span", {});
  fill.style.width = `${width}%`;
  return h("li", { class: "bar-row" },
    h("span", { class: "bar-label" }, h("span", {}, label), sub ? h("span", {}, sub) : null),
    h("span", { class: "bar", "aria-hidden": "true" }, fill),
    h("span", { class: "bar-value" }, text));
}

function renderLedger() {
  const body = $("ledger-body");
  const group = $("ledger-group").value;
  const period = $("ledger-days").selectedOptions[0]?.textContent ?? "";
  if (!state.ledgerSummary.length) {
    body.replaceChildren(h("p", { class: "empty" }, "No screen time recorded for this period."));
    return;
  }
  if (group === "day") {
    const days = M.ledgerDays(state.ledgerSummary);
    const max = Math.max(...days.map(day => day.totalMs));
    const total = days.reduce((sum, day) => sum + day.totalMs, 0);
    body.replaceChildren(
      h("div", { class: "time-total" }, h("strong", {}, M.formatDuration(total)), h("span", {}, period.toLowerCase())),
      h("ul", { class: "bars", "aria-label": `Time per day, ${period.toLowerCase()}` }, days.map(day =>
        barRow(day.day, day.hosts.slice(0, 3).map(host => host.host).join(", "), day.totalMs, max, day.totalText))));
    return;
  }
  const rows = M.ledgerRows(state.ledgerSummary, state.contexts);
  const max = Math.max(...rows.map(row => row.totalMs));
  const total = rows.reduce((sum, row) => sum + row.totalMs, 0);
  body.replaceChildren(
    h("div", { class: "time-total" }, h("strong", {}, M.formatDuration(total)), h("span", {}, period.toLowerCase())),
    h("ul", { class: "bars", "aria-label": `Time per site and space, ${period.toLowerCase()}` }, rows.map(row =>
      barRow(row.host, row.contextName, row.totalMs, max, row.totalText))));
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
  contexts: () => Promise.all([loadContexts(), loadOrphans()]).then(() => keepFocus(renderProjects)),
  projects: () => loadProjects().then(renderContexts),
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

// #project=<id> highlights a project; #rule=<id> opens its editor (the
// address-bar rule panel's "Edit in Overview" and the sidebar project block).
let handledHash = null;
function focusFromHash() {
  const hash = location.hash;
  if (hash === handledHash) return;
  const project = /^#project=(p_[a-z0-9]{4,32})$/.exec(hash);
  if (project && focusProject(project[1])) { handledHash = hash; return; }
  const rule = /^#rule=(r_[a-z0-9]{4,32})$/.exec(hash);
  if (rule && state.rules.length) { handledHash = hash; openRuleEditorById(rule[1]); }
}

function onHashChange() {
  handledHash = null;
  showView(viewFromHash());
  focusFromHash();
}

async function init() {
  setupDialog();
  setupSheet();
  showView(viewFromHash());
  $("add-project").addEventListener("click", () => addProjectFlow());
  $("add-rule").addEventListener("click", () => openRuleEditor(null));
  $("ledger-days").addEventListener("change", loadLedger);
  $("ledger-group").addEventListener("change", renderLedger);
  $("ledger-export").addEventListener("click", exportLedgerFlow);
  $("ledger-clear").addEventListener("click", clearLedgerFlow);
  window.addEventListener("hashchange", onHashChange);
  if (!api) {
    state.connected = false;
    renderAttention();
    renderContexts();
    for (const control of document.querySelectorAll("main button, main select")) control.disabled = true;
    return;
  }
  try { state.flags = await call("getOverviewFlags"); } catch (error) { if (error?.code === "SENDER_REJECTED") state.connected = false; }
  api.subscribe(onServicesEvent);
  await loadContexts();
  await Promise.allSettled([loadProjects(), loadRules(), loadJev(), loadLedger(), loadOrphans(), loadAttention()]);
  renderContexts();
  focusFromHash();
  // Service dots are checked when the page opens (declared loopback ports only).
  for (const project of state.projects) if (project.manifest.services.length) refreshServiceStatus(project, { quiet: true });
}

init().catch(error => { console.error(error); setStatus("AxioSozo could not start this page.", "error"); });
