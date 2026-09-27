/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// about:axiosozo page script. Runs with the about:axiosozo content
// principal; its only channel is window.AxioSozoOverview (the actor child).
// All text is inserted with textContent; nothing is parsed as markup.

import * as M from "./overview-model.mjs";

const api = window.AxioSozoOverview ?? null;
const $ = id => document.getElementById(id);
let idCounter = 0;
const newId = prefix => `${prefix}-${++idCounter}`;

const state = {
  connected: !!api,
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
    else if (["checked", "disabled", "hidden", "value", "selected", "required", "readOnly"].includes(key)) element[key] = value;
    else element.setAttribute(key, value === true ? "" : String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return element;
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

function setStatus(message, kind = "info") {
  const node = $("status");
  node.dataset.kind = kind;
  node.textContent = message;
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

const contextName = uuid => state.contexts.find(context => context.uuid === uuid)?.name ?? null;
const projectName = project => project.manifest?.name ?? project.id;

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
    items.push(h("li", {}, h("p", { class: "item-title" }, "AxioSozo services are not available"),
      h("p", { class: "deemphasized" }, "Open about:axiosozo from the address bar of a normal browser window. Nothing on this page works until it is connected.")));
  }
  for (const item of state.attention) {
    const action = M.attentionAction(item);
    let button = null;
    if (action?.kind === "rule") button = h("button", { type: "button", onclick: () => openRuleEditorById(action.id) }, "Edit rule…");
    else if (action?.kind === "project") button = h("button", { type: "button", onclick: () => focusProject(action.id) }, "Show project");
    else if (action?.kind === "url") button = h("button", { type: "button", onclick: () => act("openUrl", { url: action.url }) }, "Open");
    const kind = item.kind === "service_down" ? "Service down" : item.kind === "rule_limit_reached" ? "Limit reached" : "Attention";
    items.push(h("li", {},
      h("div", { class: "item-head" },
        h("p", { class: "item-title" }, item.title ?? kind),
        h("span", { class: "tag" }, kind),
        button ? h("div", { class: "item-actions" }, button) : null),
      item.detail ? h("p", { class: "deemphasized" }, item.detail) : null));
  }
  if (!items.length) items.push(h("li", { class: "empty" }, "Nothing needs attention."));
  list.replaceChildren(...items);
}

// ---------------------------------------------------------------- contexts

async function loadContexts() {
  try {
    state.contexts = await call("listContexts");
    await keepFocus(renderContexts);
  } catch (error) {
    $("contexts-body").replaceChildren(h("p", { class: "deemphasized" }, "Could not load contexts. " + errorText(error)));
  }
}

function renderContexts() {
  const body = $("contexts-body");
  if (!state.contexts.length) {
    body.replaceChildren(h("p", { class: "deemphasized" }, "No Zen workspaces found."));
    return;
  }
  const engineHelpId = newId("help");
  const rows = M.contextRows(state.contexts, state.projects).map(row => {
    const key = suffix => `context:${row.uuid}:${suffix}`;
    const typeSelect = h("select", {
      "aria-label": `Type of ${row.name}`, "data-focus-key": key("type"),
      onchange: event => act("setContextType", { uuid: row.uuid, type: event.target.value },
        `${row.name} is now a ${event.target.value} context.`).then(loadContexts),
    }, M.CONTEXT_TYPES.map(type => option(type, type[0].toUpperCase() + type.slice(1), row.type)));
    const orgSelect = row.showLinks ? h("select", {
      "aria-label": `Organization of ${row.name}`, "data-focus-key": key("org"),
      onchange: event => act("linkOrganization", { uuid: row.uuid, organizationUuid: event.target.value || null },
        "Organization link saved."),
    }, option("", "None", row.organization_uuid ?? ""),
    row.organizationOptions.map(org => option(org.uuid, org.name, row.organization_uuid))) : h("span", { class: "deemphasized" }, "—");
    const projectSelect = row.showLinks ? h("select", {
      "aria-label": `Project of ${row.name}`, "data-focus-key": key("project"),
      onchange: event => act("linkProject", { uuid: row.uuid, projectId: event.target.value || null },
        "Project link saved."),
    }, option("", "None", row.project_id ?? ""),
    row.projectOptions.map(project => option(project.id, project.name, row.project_id))) : h("span", { class: "deemphasized" }, "—");
    const engineSelect = h("select", {
      "aria-label": `Engine preference of ${row.name}`, "aria-describedby": engineHelpId,
      "data-focus-key": key("engine"), disabled: !state.flags.enginePreferences,
      onchange: event => act("setEnginePreference", { uuid: row.uuid, engine: event.target.value || null },
        "Engine preference saved."),
    }, option("", "Default", row.engine_preference ?? ""),
    option("firefox", "Firefox", row.engine_preference),
    option("chromium", "Chromium (experimental)", row.engine_preference));
    const open = h("button", { type: "button", "aria-label": `Open ${row.name}`, "data-focus-key": key("open"),
      onclick: () => act("openContext", { uuid: row.uuid }) }, "Open");
    return h("tr", {},
      h("th", { scope: "row" }, row.name),
      h("td", {}, typeSelect), h("td", {}, orgSelect), h("td", {}, projectSelect),
      h("td", {}, engineSelect), h("td", {}, open));
  });
  body.replaceChildren(
    h("table", { "aria-describedby": "contexts-help" },
      h("caption", {}, "Zen workspaces and their AxioSozo context settings"),
      h("thead", {}, h("tr", {},
        ["Context", "Type", "Organization", "Project", "Engine", "Actions"].map(label => h("th", { scope: "col" }, label)))),
      h("tbody", {}, rows)),
    h("p", { class: "help", id: engineHelpId }, state.flags.enginePreferences
      ? "Engine preference is experimental. If Chromium is unavailable the Firefox tab stays."
      : "Engine preference is experimental and turned off until the Chromium checks pass."));
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
    label: `${orphan.type} context ${orphan.workspace_uuid}`,
    help: orphan.project_id ? `Linked to project ${orphan.project_id}` : null,
  }));
  const remove = h("button", { type: "button", class: "destructive", "aria-describedby": "orphans-help", onclick: async () => {
    const uuids = [...section.querySelectorAll('input[name="orphan"]:checked')].map(input => input.value);
    if (!uuids.length) { setStatus("Select at least one entry to remove."); return; }
    const ok = await confirmDialog({ title: "Remove old context settings?",
      message: `This removes AxioSozo settings for ${uuids.length} deleted workspace${uuids.length === 1 ? "" : "s"}. Zen is not changed.`,
      accept: "Remove", destructive: true });
    if (ok) await act("removeOrphans", { uuids }, "Old context settings removed.").then(loadOrphans);
  } }, "Remove selected…");
  $("orphans-body").replaceChildren(h("fieldset", {}, h("legend", {}, "Deleted workspaces"), boxes),
    h("div", { class: "toolbar" }, remove));
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

async function refreshServiceStatus(project) {
  try {
    state.serviceStatus.set(project.id, await call("serviceStatus", { projectId: project.id }));
  } catch (error) {
    setStatus(errorText(error), "error");
  }
  await keepFocus(renderProjects);
  const down = (state.serviceStatus.get(project.id) ?? []).filter(service => service.status === "down").length;
  setStatus(down ? `${down} service${down === 1 ? " is" : "s are"} down in ${projectName(project)}.` : `Service status updated for ${projectName(project)}.`);
}

function urlButton(label, url, contextUuid, description) {
  return h("button", { type: "button", class: "link-button", "aria-label": description ?? `Open ${label}`,
    onclick: () => act("openUrl", { url, contextUuid: contextUuid ?? null }) }, label);
}

function renderProjects() {
  const list = $("project-list");
  if (!state.projects.length) {
    list.replaceChildren(h("li", { class: "empty" }, "No projects yet. Add a project folder to see its environments, services and web surfaces here."));
    return;
  }
  list.replaceChildren(...state.projects.map(project => {
    const manifest = project.manifest;
    const key = suffix => `project:${project.id}:${suffix}`;
    const headingId = newId("project");
    const statuses = new Map((state.serviceStatus.get(project.id) ?? []).map(service => [service.name, service]));
    const manifestState = { none: "Not in repository", written: "Project file written", external: "From repository file" }[project.manifest_state] ?? project.manifest_state;
    return h("li", { id: `project-${project.id}`, "aria-labelledby": headingId, tabindex: "-1" },
      h("div", { class: "item-head" },
        h("h3", { id: headingId, class: "item-title" }, projectName(project)),
        h("span", { class: "tag" }, manifest.kind),
        h("span", { class: "tag" }, manifestState),
        h("div", { class: "item-actions" },
          h("button", { type: "button", "data-focus-key": key("edit"), "aria-label": `Edit ${projectName(project)}`,
            onclick: () => openProjectReview({ mode: "edit", project }) }, "Edit…"),
          h("button", { type: "button", "data-focus-key": key("write"), "aria-label": `Write project file for ${projectName(project)}`,
            onclick: () => writeManifestFlow(project) }, "Write .axiosozo/project.json…"),
          h("button", { type: "button", class: "destructive", "data-focus-key": key("remove"), "aria-label": `Remove ${projectName(project)}`,
            onclick: () => removeProjectFlow(project) }, "Remove…"))),
      h("p", { class: "path" }, project.root),
      h("p", { class: "item-meta" }, project.context_uuid
        ? `Context: ${contextName(project.context_uuid) ?? "deleted workspace"}` : "Not linked to a context"),
      manifest.environments.length ? [h("h4", {}, "Environments"), h("ul", { class: "file-list" },
        manifest.environments.map(env => h("li", {}, `${env.name}: `,
          urlButton(env.base_url, env.base_url, project.context_uuid, `Open ${env.name} environment ${env.base_url}`))))] : null,
      manifest.services.length ? [h("h4", {}, "Services"), h("ul", { class: "file-list" },
        manifest.services.map(service => {
          const status = statuses.get(service.name)?.status ?? "unknown";
          return h("li", {}, h("span", { class: "service-status", "data-status": status },
            `${service.name} (port ${service.port}): ${M.serviceStatusText(service, status)}`));
        })),
      h("p", { class: "help" }, M.SERVICES_HELP),
      h("button", { type: "button", "data-focus-key": key("status"), onclick: () => refreshServiceStatus(project) }, "Check services")] : null,
      manifest.surfaces.length ? [h("h4", {}, "Surfaces"), h("ul", { class: "file-list" },
        manifest.surfaces.map(surface => h("li", {},
          urlButton(surface.name, surface.url, project.context_uuid, `Open ${surface.name} (${surface.kind})`),
          h("span", { class: "item-meta" }, ` ${surface.kind.replaceAll("_", " ")}`))))] : null);
  }));
}

function focusProject(id) {
  const node = document.getElementById(`project-${id}`);
  if (node) { node.scrollIntoView({ block: "start" }); node.focus(); }
}

async function writeManifestFlow(project) {
  const ok = await confirmDialog({
    title: "Write the project file?",
    message: `This writes .axiosozo/project.json in ${project.root}, replacing any existing file there. It holds names, addresses, ports and surfaces only, never secrets. You can commit it so your team gets the same setup.`,
    accept: "Write file",
  });
  if (ok) await act("writeManifest", { projectId: project.id }, result => `Wrote ${result?.path ?? ".axiosozo/project.json"}.`);
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
  if (!picked.result) { setStatus("No folder chosen."); return; }
  const root = picked.result;
  setStatus(`Reading project files in ${root}…`);
  const detected = await act("detect", { root });
  if (!detected.ok) return;
  openProjectReview({ mode: "new", root, draft: detected.result });
  setStatus("Detection finished. Review the draft before confirming.");
}

// Draft review / project edit form.
function openProjectReview({ mode, root, draft, project }) {
  const container = $("project-review");
  const review = mode === "new" ? { ...M.draftToReview(draft), contextUuid: null } : M.projectToReview(project);
  const returnFocus = document.activeElement;
  const headingId = newId("review");
  const errorsList = h("ul", { class: "errors", role: "alert" });
  let writeManifest = false;

  const close = () => { container.hidden = true; container.replaceChildren(); returnFocus?.focus?.(); };

  const provenance = row => row.source
    ? h("span", { class: "provenance" }, row.guess ? h("span", { class: "tag guess" }, "guess") : null,
      ` from ${row.source}`) : null;

  const rowEditor = ({ title, rows, fields, empty, addLabel }) => {
    const box = h("div", { class: "rows" });
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
        const remove = h("button", { type: "button", "aria-label": `Remove ${title.toLowerCase()} ${index + 1}`,
          onclick: () => { rows.splice(index, 1); render(Math.min(index, rows.length - 1)); } }, "Remove");
        return h("div", { class: "row", role: "group", "aria-label": `${title} ${index + 1}` }, controls, remove, provenance(row));
      }));
      if (!rows.length) box.append(h("p", { class: "deemphasized" }, empty));
      if (focusIndex !== undefined && focusIndex >= 0) box.children[focusIndex]?.querySelector("input, select, button")?.focus();
      else if (focusIndex !== undefined) addButton.focus();
    };
    const addButton = h("button", { type: "button", onclick: () => {
      rows.push(Object.fromEntries([...fields.map(spec => [spec.key, spec.kind ? spec.kind[0] : ""]), ["source", ""], ["guess", false]]));
      render(rows.length - 1);
    } }, addLabel);
    render();
    return h("fieldset", {}, h("legend", {}, title), box, h("div", { class: "toolbar" }, addButton));
  };

  const nameInput = h("input", { type: "text", value: review.name, maxlength: "80", required: true,
    oninput: event => { review.name = event.target.value; } });
  const kindSelect = h("select", { onchange: event => { review.kind = event.target.value; } },
    M.PROJECT_KINDS.map(kind => option(kind, kind, review.kind)));
  const contextSelect = h("select", { onchange: event => { review.contextUuid = event.target.value || null; } },
    option("", "No context", review.contextUuid ?? ""),
    state.contexts.map(context => option(context.uuid, `${context.name} (${context.type})`, review.contextUuid)));

  const detectionDetails = mode === "new" ? h("details", {},
    h("summary", {}, `What was read: ${review.filesRead.length} file${review.filesRead.length === 1 ? "" : "s"}, ${review.refused.length} refused`),
    review.frameworks.length ? h("p", {}, "Frameworks: " + review.frameworks.join(", ")) : null,
    h("h4", {}, "Files read"),
    review.filesRead.length ? h("ul", { class: "file-list" }, review.filesRead.map(path => h("li", { class: "path" }, path)))
      : h("p", { class: "deemphasized" }, "None."),
    h("h4", {}, "Files refused"),
    review.refused.length ? h("ul", { class: "file-list" }, review.refused.map(item =>
      h("li", {}, h("span", { class: "path" }, item.path), ` — ${M.REFUSAL_TEXT[item.reason] ?? item.reason}`)))
      : h("p", { class: "deemphasized" }, "None."),
    review.warnings.length ? [h("h4", {}, "Warnings"), h("ul", { class: "file-list" }, review.warnings.map(text => h("li", {}, text)))] : null,
    h("p", { class: "help" }, ".env files, key files and anything outside the folder are never read. Nothing is executed.")) : null;

  const writeChoice = mode === "new" ? choice({ type: "checkbox", name: "write-manifest", label: "Also write .axiosozo/project.json into the folder",
    help: "Asks for confirmation first. The file holds names, addresses, ports and surfaces only, never secrets.",
    onchange: event => { writeManifest = event.target.checked; } }) : null;

  const submit = async () => {
    const { manifest, errors } = M.reviewToManifest(review);
    errorsList.replaceChildren(...errors.map(error => h("li", {}, error.message)));
    if (!manifest) { setStatus("Fix the highlighted problems before saving.", "error"); return; }
    if (mode === "edit") {
      const saved = await act("updateProject", { id: project.id, patch: { manifest, context_uuid: review.contextUuid } },
        `${manifest.name} saved.`);
      if (saved.ok) { close(); await loadProjects(); }
      return;
    }
    const confirmed = await act("confirmProject", { root, manifest, contextUuid: review.contextUuid }, `${manifest.name} added.`);
    if (!confirmed.ok) return;
    close();
    await loadProjects();
    if (writeManifest && confirmed.result?.id) await writeManifestFlow(confirmed.result);
  };

  container.replaceChildren(h("div", { class: "editor", role: "region", "aria-labelledby": headingId },
    h("h3", { id: headingId, tabindex: "-1" }, mode === "new" ? "Review detected project" : `Edit ${projectName(project)}`),
    mode === "new" ? [h("p", { class: "path" }, root),
      h("p", { class: "notice" }, "Everything below is a draft from static detection. Values marked guess are framework defaults. Nothing is saved until you confirm.")] : null,
    field({ label: "Name", control: nameInput }),
    field({ label: "Kind", control: kindSelect, help: review.kindSource.source
      ? `${review.kindSource.guess ? "Guessed" : "Detected"} from ${review.kindSource.source}` : null }),
    rowEditor({ title: "Environment", rows: review.environments, empty: "No environments.", addLabel: "Add environment",
      fields: [{ key: "name", label: "Name of environment", placeholder: "local" },
        { key: "base_url", label: "Address of environment", type: "url" }] }),
    rowEditor({ title: "Service", rows: review.services, empty: "No services.", addLabel: "Add service",
      fields: [{ key: "name", label: "Name of service" }, { key: "url", label: "Address of service", type: "url" },
        { key: "port", label: "Port of service", type: "number" }] }),
    rowEditor({ title: "Surface", rows: review.surfaces, empty: "No web surfaces.", addLabel: "Add surface",
      fields: [{ key: "name", label: "Name of surface" }, { key: "url", label: "Address of surface", type: "url" },
        { key: "kind", label: "Kind of surface", kind: M.SURFACE_KINDS }] }),
    field({ label: "Context", control: contextSelect, help: "The Zen workspace this project belongs to." }),
    detectionDetails, writeChoice, errorsList,
    h("div", { class: "button-row" },
      h("button", { type: "button", onclick: close }, "Cancel"),
      h("button", { type: "button", class: "primary", onclick: submit }, mode === "new" ? "Confirm project" : "Save changes"))));
  container.hidden = false;
  container.querySelector(`#${headingId}`).focus();
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
  if (!state.rules.length) {
    list.replaceChildren(h("li", { class: "empty" }, "No site rules yet."));
    return;
  }
  list.replaceChildren(...state.rules.map(rule => {
    const key = suffix => `rule:${rule.id}:${suffix}`;
    const hosts = rule.match.hosts.join(", ");
    const headingId = newId("rule");
    const enabled = h("input", { type: "checkbox", checked: rule.enabled, id: newId("enabled"), "data-focus-key": key("enabled"),
      "aria-label": `Rule for ${hosts} enabled`,
      onchange: event => act("saveRule", { rule: { ...rule, enabled: event.target.checked, updated_at: Date.now() } },
        `Rule for ${hosts} ${event.target.checked ? "enabled" : "disabled"}.`).then(loadRules) });
    return h("li", { "aria-labelledby": headingId },
      h("div", { class: "item-head" },
        h("h3", { id: headingId, class: "item-title" }, hosts),
        rule.enabled ? null : h("span", { class: "tag" }, "Off"),
        h("div", { class: "item-actions" },
          h("div", { class: "choice" }, enabled, h("label", { for: enabled.id }, "Enabled")),
          h("button", { type: "button", "data-focus-key": key("edit"), "aria-label": `Edit rule for ${hosts}`,
            onclick: () => openRuleEditor(rule) }, "Edit…"),
          h("button", { type: "button", class: "destructive", "data-focus-key": key("delete"), "aria-label": `Delete rule for ${hosts}`,
            onclick: () => deleteRuleFlow(rule) }, "Delete…"))),
      h("p", { class: "item-meta" }, M.describeRule(rule)),
      rule.instruction ? h("p", {}, h("q", {}, rule.instruction)) : null);
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
  const container = $("rule-editor");
  const form = rule ? M.ruleToForm(rule) : M.emptyRuleForm();
  const returnFocus = document.activeElement;
  const headingId = newId("editor");
  const errorsList = h("ul", { class: "errors", role: "alert" });
  const close = () => { container.hidden = true; container.replaceChildren(); returnFocus?.focus?.(); };

  // Hosts
  const hostsInput = h("textarea", { rows: "3", value: form.hostsText, spellcheck: "false",
    oninput: event => { form.hostsText = event.target.value; renderRaised(); } });

  // Contexts
  const contextsDetail = h("div", {});
  const renderContextsDetail = () => {
    contextsDetail.hidden = form.contextsMode !== "selected";
    contextsDetail.replaceChildren(
      h("div", { class: "inline-choices", role: "group", "aria-label": "Context types" },
        M.CONTEXT_TYPES.map(type => choice({ type: "checkbox", name: "context-type", value: type,
          checked: form.contextTypes.includes(type), label: `All ${type} contexts`,
          onchange: event => { toggle(form.contextTypes, type, event.target.checked); } }))),
      state.contexts.length ? h("div", { role: "group", "aria-label": "Specific contexts" },
        state.contexts.map(context => choice({ type: "checkbox", name: "context-workspace", value: context.uuid,
          checked: form.contextWorkspaces.includes(context.uuid), label: `${context.name} (${context.type})`,
          onchange: event => { toggle(form.contextWorkspaces, context.uuid, event.target.checked); } }))) : null);
  };
  const contextsField = h("fieldset", {}, h("legend", {}, "Where it applies"),
    choice({ type: "radio", name: "contexts-mode", value: "all", checked: form.contextsMode === "all", label: "In every context",
      onchange: () => { form.contextsMode = "all"; renderContextsDetail(); } }),
    choice({ type: "radio", name: "contexts-mode", value: "selected", checked: form.contextsMode === "selected", label: "Only in selected contexts",
      onchange: () => { form.contextsMode = "selected"; renderContextsDetail(); } }),
    contextsDetail);
  renderContextsDetail();

  // Limits
  const minutesInput = h("input", { type: "number", min: "1", max: "1440", step: "1", value: form.dailyMinutes,
    oninput: event => { form.dailyMinutes = event.target.value; } });
  const windowsBox = h("div", { class: "rows" });
  const addWindowButton = h("button", { type: "button", onclick: () => {
    if (form.windows.length >= M.MAX_WINDOWS) { setStatus(`At most ${M.MAX_WINDOWS} time windows.`); return; }
    form.windows.push({ start: "09:00", end: "17:00", days: [] });
    renderWindows(form.windows.length - 1);
  } }, "Add time window");
  const renderWindows = focusIndex => {
    windowsBox.replaceChildren(...form.windows.map((window, index) => h("div", { class: "row", role: "group", "aria-label": `Time window ${index + 1}` },
      field({ label: `From (window ${index + 1})`, control: h("input", { type: "time", value: window.start, oninput: event => { window.start = event.target.value; } }) }),
      field({ label: `Until (window ${index + 1})`, control: h("input", { type: "time", value: window.end, oninput: event => { window.end = event.target.value; } }) }),
      h("div", { class: "inline-choices", role: "group", "aria-label": `Days for window ${index + 1}; none selected means every day` },
        M.WEEKDAYS.map((label, day) => choice({ type: "checkbox", name: `window-${index}-days`, value: String(day),
          checked: window.days.includes(day), label, onchange: event => toggle(window.days, day, event.target.checked) }))),
      h("button", { type: "button", "aria-label": `Remove time window ${index + 1}`, onclick: () => {
        form.windows.splice(index, 1); renderWindows(Math.min(index, form.windows.length - 1));
      } }, "Remove"))));
    if (!form.windows.length) windowsBox.append(h("p", { class: "deemphasized" }, "No time windows: the site is allowed at any hour."));
    if (focusIndex !== undefined && focusIndex >= 0) windowsBox.children[focusIndex]?.querySelector("input")?.focus();
    else if (focusIndex !== undefined) addWindowButton.focus();
  };
  renderWindows();

  // Observation
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
  const observationField = h("fieldset", {}, h("legend", {}, "What may leave this machine"),
    M.OBSERVATIONS.map(level => choice({ type: "radio", name: "observation", value: level, checked: form.observation === level,
      label: { none: "None", address: "Address", outline: "Outline" }[level], help: M.OBSERVATION_TEXT[level],
      onchange: () => { form.observation = level; renderRaised(); } })),
    h("p", { class: "help" }, "Data only leaves this machine when Jev consent is on in the Jev settings, a Jev key is stored in the macOS Keychain, and this rule has a level above None and at least one effect. Every call shows the outgoing-data indicator in the address bar."),
    raisedBox);
  renderRaised();

  const effectsField = h("fieldset", {}, h("legend", {}, "What the browser may do"),
    M.EFFECTS.map(effect => choice({ type: "checkbox", name: "effect", value: effect, checked: form.effects.includes(effect),
      label: M.EFFECT_TEXT[effect], onchange: event => toggle(form.effects, effect, event.target.checked) })),
    h("p", { class: "help" }, "No blocking of network traffic and no changes to page content."));
  const overrideField = h("fieldset", {}, h("legend", {}, "Continuing anyway"),
    M.OVERRIDES.map(value => choice({ type: "radio", name: "override", value, checked: form.override === value,
      label: M.OVERRIDE_TEXT[value], onchange: () => { form.override = value; } })),
    h("p", { class: "help" }, "You can always continue; a rule never traps you."));

  const agentsField = h("fieldset", { disabled: true },
    h("legend", {}, "Agents (M2, not active)"),
    h("p", { class: "help" }, "Stored with the rule and ignored until agent support ships. Your limits never restrict agents."),
    field({ label: "Agent access", control: h("select", {},
      M.AGENT_ACCESS.map(value => option(value, value.replaceAll("_", " "), form.agents.access))) }),
    field({ label: "Instruction for agents", control: h("textarea", { rows: "2", value: form.agents.instruction }) }));

  const enabledChoice = choice({ type: "checkbox", name: "enabled", checked: form.enabled, label: "Rule is enabled",
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

  container.replaceChildren(h("div", { class: "editor", role: "region", "aria-labelledby": headingId },
    h("h3", { id: headingId, tabindex: "-1" }, rule ? `Edit rule for ${rule.match.hosts.join(", ")}` : "New site rule"),
    enabledChoice,
    field({ label: "Sites", control: hostsInput, help: "One per line, for example x.com and *.x.com. *.x.com matches subdomains only." }),
    contextsField,
    field({ label: "Your instruction", control: h("textarea", { rows: "3", maxlength: String(M.MAX_INSTRUCTION), value: form.instruction,
      oninput: event => { form.instruction = event.target.value; } }),
    help: "Plain language, for example “I come here to post and answer mentions. If I drift into the feed, nudge me.” Shown to you as written and only used as text for optional Jev judgement." }),
    h("fieldset", {}, h("legend", {}, "Limits (checked on this machine)"),
      field({ label: "Daily minutes", control: minutesInput, help: "Empty means no daily limit. Counts foreground time in this rule's contexts." }),
      h("h4", {}, "Allowed hours"),
      h("p", { class: "help" }, "Outside these windows the rule applies its effects. A window that ends before it starts runs past midnight."),
      windowsBox, h("div", { class: "toolbar" }, addWindowButton)),
    observationField, effectsField, overrideField, agentsField, errorsList,
    h("div", { class: "button-row" },
      rule ? h("button", { type: "button", class: "destructive", onclick: async () => { if (await deleteRuleFlow(rule)) close(); } }, "Delete rule…") : null,
      h("button", { type: "button", onclick: close }, "Cancel"),
      h("button", { type: "button", class: "primary", onclick: save }, "Save rule"))));
  container.hidden = false;
  container.querySelector(`#${headingId}`).focus();
}

function toggle(list, value, on) {
  const index = list.indexOf(value);
  if (on && index < 0) list.push(value);
  if (!on && index >= 0) list.splice(index, 1);
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
  const headingId = "jev-heading";
  const form = M.jevToForm(state.jev);
  const errorsList = h("ul", { class: "errors", role: "alert" });
  const consent = choice({ type: "checkbox", name: "jev-consent", checked: form.consent,
    label: "Allow Jev to judge pages for rules that permit it",
    help: "Only rules with an observation level above None can send anything.",
    onchange: event => { form.consent = event.target.checked; } });
  const interval = h("input", { type: "number", min: "1", max: "30", step: "1", value: form.intervalMinutes,
    oninput: event => { form.intervalMinutes = event.target.value; } });
  const budget = h("input", { type: "number", min: "0", max: "30", step: "1", value: form.hourlyBudget,
    oninput: event => { form.hourlyBudget = event.target.value; } });
  const keyPresent = state.jev?.key_present ?? state.jev?.has_key;
  const keyNote = M.jevKeyNote({ keyEntryEnabled: state.flags.jevKeyEntry === true,
    keyPresent: typeof keyPresent === "boolean" ? keyPresent : undefined });
  box.replaceChildren(h("section", { "aria-labelledby": headingId, class: "editor" },
    h("h3", { id: headingId }, "Jev judgement (optional)"),
    h("p", { class: "notice", id: "jev-statement" }, M.JEV_STATEMENT),
    h("p", { class: "help" }, keyNote),
    h("p", { class: "help", id: "jev-sent" }, M.JEV_SENT_TEXT),
    consent,
    field({ label: "Check every (minutes)", control: interval, help: "1 to 30. Only while the tab is in front; never for background tabs or private windows." }),
    field({ label: "Calls per hour at most", control: budget, help: "0 to 30." }),
    errorsList,
    h("div", { class: "button-row" }, h("button", { type: "button", "aria-describedby": "jev-statement", onclick: async () => {
      const { patch, errors } = M.formToJevPatch(form);
      errorsList.replaceChildren(...errors.map(error => h("li", {}, error.message)));
      if (!patch) return;
      await act("setJevSettings", { patch }, "Jev settings saved.").then(loadJev);
    } }, "Save Jev settings"))));
}

// ---------------------------------------------------------------- screen time

async function loadLedger() {
  const days = Number($("ledger-days").value) || 7;
  try {
    state.ledgerSummary = await call("usageSummary", { days });
    renderLedger();
  } catch (error) {
    $("ledger-body").replaceChildren(h("p", { class: "deemphasized" }, "Could not load screen time. " + errorText(error)));
  }
}

function renderLedger() {
  const body = $("ledger-body");
  const group = $("ledger-group").value;
  const period = $("ledger-days").selectedOptions[0]?.textContent ?? "";
  if (!state.ledgerSummary.length) {
    body.replaceChildren(h("p", { class: "deemphasized" }, "No screen time recorded for this period."));
    return;
  }
  if (group === "day") {
    body.replaceChildren(h("table", {},
      h("caption", {}, `Foreground time per day, ${period.toLowerCase()}`),
      h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Day"), h("th", { scope: "col", class: "number" }, "Total"),
        h("th", { scope: "col" }, "Most time on"))),
      h("tbody", {}, M.ledgerDays(state.ledgerSummary).map(day => h("tr", {},
        h("th", { scope: "row" }, day.day), h("td", { class: "number" }, day.totalText),
        h("td", {}, day.hosts.slice(0, 3).map(host => `${host.host} ${host.text}`).join(", ")))))));
    return;
  }
  body.replaceChildren(h("table", {},
    h("caption", {}, `Foreground time per site and context, ${period.toLowerCase()}`),
    h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Site"), h("th", { scope: "col" }, "Context"),
      h("th", { scope: "col", class: "number" }, "Total"), h("th", { scope: "col" }, "Per day"))),
    h("tbody", {}, M.ledgerRows(state.ledgerSummary, state.contexts).map(row => h("tr", {},
      h("th", { scope: "row" }, row.host), h("td", {}, row.contextName),
      h("td", { class: "number" }, row.totalText),
      h("td", {}, row.days.length > 1 ? h("details", {},
        h("summary", { "aria-label": `${row.days.length} days for ${row.host} in ${row.contextName}` }, `${row.days.length} days`),
        h("ul", { class: "file-list" }, row.days.map(day => h("li", {}, `${day.day}: ${day.text}`))))
        : row.days.map(day => `${day.day}: ${day.text}`).join("")))))));
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
    message: "All recorded foreground time is deleted from this machine. Site rules keep working and start counting again from now.",
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

async function init() {
  setupDialog();
  $("add-project").addEventListener("click", () => addProjectFlow());
  $("add-rule").addEventListener("click", () => openRuleEditor(null));
  $("ledger-days").addEventListener("change", loadLedger);
  $("ledger-group").addEventListener("change", renderLedger);
  $("ledger-export").addEventListener("click", exportLedgerFlow);
  $("ledger-clear").addEventListener("click", clearLedgerFlow);
  if (!api) {
    state.connected = false;
    renderAttention();
    for (const button of document.querySelectorAll("main button, main select")) button.disabled = true;
    return;
  }
  try { state.flags = await call("getOverviewFlags"); } catch (error) { if (error?.code === "SENDER_REJECTED") state.connected = false; }
  api.subscribe(onServicesEvent);
  await loadContexts();
  await Promise.allSettled([loadProjects(), loadRules(), loadJev(), loadLedger(), loadOrphans(), loadAttention()]);
  renderContexts();
  // The address-bar rule panel's "Edit in Overview" opens about:axiosozo#rule=<id>.
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
}

function openFromHash() {
  const match = /^#rule=(r_[a-z0-9]{4,32})$/.exec(location.hash);
  if (!match) return;
  openRuleEditorById(match[1]);
  $("rule-editor").scrollIntoView({ block: "start" });
}

init().catch(error => { console.error(error); setStatus("The overview could not start.", "error"); });
