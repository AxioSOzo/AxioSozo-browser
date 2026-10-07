/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The Projects section of the sidebar and its project panel
// (docs/design/projects.md §2). Under the space header: a "Projects" heading
// and one quiet row per project of this space, with the project's own icon (or
// a monogram tile in its container colour), its name and, only when it
// matters, how many of its servers run or that one failed. A row never
// expands into a list: it opens the project panel beside the sidebar, which
// holds everything the project can run (servers, mobile and desktop apps,
// workers: start, stop, output) and every link (environments, repository,
// dashboards). The sidebar therefore stays one row per project however large
// a project is. Zen's compact and collapsed sidebars keep the section (icons
// only when collapsed).
//
// Installed by DevLoop, which owns the project model, tab linking, the
// container route (goTo) and port checks; this module only draws and acts
// through the services (projectRuns, startRun, stopRun, stopRuns, runLog,
// listRuns, projectIcon) and DevLoop's callbacks. Nothing is injected into
// web content. Runs start only from a button that names the target, and a
// command is shown before its first run (ProjectRunner approvals).
import { displayState, localAddress, targetUrl } from "./ProjectRunner.sys.mjs";

// Projects shown before the rest fold into "N more"; current and running
// projects are always among them.
export const PROJECT_LIMIT = 6;
export const LOG_PREVIEW_LINES = 60;
// While a server starts, its port is checked this often (the services keep
// their own five-second floor per port).
export const STARTING_POLL_MS = 1500;
export const STATE_TEXT = Object.freeze({ running: "Running", starting: "Starting…", stopping: "Stopping…",
  external: "Running, started outside AxioSozo", failed: "Stopped with an error", stopped: "Not running" });
export const KIND_TEXT = Object.freeze({ web: "Web app", api: "API", mobile: "Mobile app", desktop: "Desktop app", worker: "Background worker",
  other: "Command" });
const LIVE = new Set(["running", "starting", "external"]);
const OURS = new Set(["running", "starting", "stopping"]);
const ERROR_TEXT = Object.freeze({
  ROOT_MOVED: "The project folder now points somewhere else, so nothing was started.",
  ROOT_NOT_FOUND: "The project folder is missing.",
  ROOT_DENIED: "This folder is protected; nothing runs in it.",
  PRIVATE_WINDOW: "Servers do not start from a private window.",
  RUNS_UNAVAILABLE: "Starting servers is not available in this build.",
  TOO_MANY_RUNS: "Too many servers are running. Stop one first.",
  ALREADY_RUNNING: "It is already running.",
  NO_COMMAND: "This server has no start command yet. Add one in Edit project.",
  INVALID_CWD: "Its folder is not inside the project.",
});

/** The first letter or digit of a name, upper-cased, for a monogram tile. */
export function monogram(name) {
  const letter = [...String(name ?? "").trim()].find(ch => /[\p{L}\p{N}]/u.test(ch));
  return (letter ?? "·").toLocaleUpperCase();
}

/** A stable hue (0–359) for a project without a container colour. */
export function hueOf(text) {
  let hue = 0;
  for (const ch of String(text ?? "")) hue = (hue * 31 + ch.codePointAt(0)) % 360;
  return hue;
}

function portOf(target, statuses) {
  const list = Array.isArray(statuses) ? statuses : [];
  const status = list.find(item => item.port === target.port && item.name === target.name) ?? list.find(item => item.port === target.port);
  return status?.status ?? null;
}

/** What the user sees per target: { target, run, port, state, url }. */
export function targetViews(targets, statuses) {
  return (Array.isArray(targets) ? targets : []).map(target => {
    const run = target.run ?? null;
    const port = target.local ? portOf(target, statuses) : null;
    return { target, run, port, state: displayState(target, run, port), url: targetUrl(target, run) };
  });
}

/** One project's run summary: live (running, starting or answering) count,
 * failures, and the row's state ("starting" | "running" | "failed" | "idle"). */
export function summarize(views) {
  const live = views.filter(view => LIVE.has(view.state)).length;
  const busy = views.some(view => view.state === "starting" || view.state === "stopping");
  const failed = views.filter(view => view.state === "failed").length;
  return { live, failed, state: busy ? "starting" : live ? "running" : failed ? "failed" : "idle" };
}

/** The target a project's quick start opens: its first startable local web
 * server (or API), else its first startable target. */
export function primaryTarget(views) {
  return views.find(view => view.target.startable && view.target.local && ["web", "api"].includes(view.target.kind))
    ?? views.find(view => view.target.startable) ?? null;
}

const hostOf = spec => { const url = typeof spec === "string" ? URL.parse(spec) : null; return url ? url.host : ""; };
const sameOrigin = (a, b) => { const x = URL.parse(a ?? ""), y = URL.parse(b ?? ""); return !!x && !!y && x.origin === y.origin; };
const errorText = code => ERROR_TEXT[code] ?? `Could not start (${typeof code === "string" ? code : "error"}).`;

/**
 * ctx (from DevLoop): services, adapter, core, privateWindow, element(document,
 * tag, opts, parent), place(node, uuid), projects(), projectById(id),
 * environmentsOf(project), currentProjectId(), cachedStatuses(project),
 * statusesFor(project, { fresh }), consoleCounts(), consolePhrase(counts),
 * paintContainer(node, baseClass, color), projectColor(project),
 * goTo(project, url, uuid, environment), displayPath(root),
 * openSettings(id, { edit }), openOverview(fragment), timers.
 */
export function installProjectSidebar(window, ctx) {
  const { document } = window;
  const { services, adapter } = ctx;
  const el = (tag, options, parent = null) => ctx.element(document, tag, options, parent);
  const popupSet = document.getElementById("mainPopupSet") ?? document.documentElement;
  const cleanups = [];
  let disposed = false;

  const root = el("section", { className: "axiosozo-projects", attrs: { id: "axiosozo-projects", role: "group", "aria-label": "Projects in this space" } });
  const panel = document.createXULElement("panel");
  for (const [key, value] of Object.entries({ id: "axiosozo-project-panel", type: "arrow", class: "axiosozo-project-panel", role: "dialog",
    orient: "vertical", noautofocus: "true" })) panel.setAttribute(key, value);
  const panelBody = el("div", { className: "axiosozo-pp" }, panel);
  popupSet.appendChild(panel);
  const menu = document.createXULElement("menupopup");
  menu.id = "axiosozo-project-more-menu";
  popupSet.appendChild(menu);
  cleanups.push(() => { root.remove(); panel.remove(); menu.remove(); });

  const diagnostics = { shown: false, rows: 0, panel: null, starts: 0, stops: 0, confirms: 0 };
  let sectionCollapsed = false;
  const showAll = new Set(); // space uuids whose full list is open
  const runs = new Map(); // project id → { available, targets }
  let allRuns = []; // services.listRuns()
  const icons = new Map(); // project id → data: URL | null (none, or still loading)
  const loadingIcons = new Set();
  let shownUuid = null;
  // The open panel: { mode: "project", projectId, uuid, anchor } | { mode: "runs", uuid, anchor }.
  let open = null;
  let confirming = null; // { projectId, key, then: "open" | "start" }
  let logOpen = null; // { projectId, key }
  const errors = new Map(); // `${projectId}\0${key}` → text
  const busy = new Set();
  let menuTarget = null; // { projectId, uuid, binding }
  let focusOnShow = false;
  let binding = 0; // a model change makes a shown ⋯ menu stale
  let scheduled = false;
  let pollTimer = null;
  const tkey = (projectId, key) => `${projectId}\u0000${key}`;

  // ---- Data ------------------------------------------------------------------------------
  async function loadRuns(ids) {
    await Promise.all([...new Set(ids)].map(async id => {
      try { runs.set(id, await services.projectRuns(id)); } catch { runs.delete(id); }
    }));
  }
  async function loadAllRuns() {
    try { const list = await services.listRuns?.(); allRuns = Array.isArray(list) ? list : []; } catch { allRuns = []; }
  }
  const viewsOf = project => targetViews(runs.get(project.id)?.targets ?? [], ctx.cachedStatuses(project));

  function loadIcon(project) {
    if (icons.has(project.id) || loadingIcons.has(project.id) || typeof services.projectIcon !== "function" || typeof project.manifest?.icon !== "string") return;
    loadingIcons.add(project.id);
    Promise.resolve().then(() => services.projectIcon(project.id)).then(url => (typeof url === "string" && url.startsWith("data:image/") ? url : null), () => null)
      .then(url => { loadingIcons.delete(project.id); if (disposed) return; icons.set(project.id, url); if (url) schedule(); });
  }

  // ---- Pieces --------------------------------------------------------------------------------
  /** The project's mark: its own icon, else a monogram tile in its container's
   * colour (or a stable hue). */
  function projectIcon(project, parent, size = "small") {
    const name = project.manifest?.name ?? "Project";
    const tile = el("span", { attrs: { "aria-hidden": "true", "data-size": size } }, parent);
    ctx.paintContainer(tile, "axiosozo-project-icon", ctx.projectColor(project));
    tile.style?.setProperty?.("--axiosozo-project-hue", String(hueOf(project.id)));
    loadIcon(project);
    const url = icons.get(project.id);
    if (url) {
      tile.setAttribute("data-image", "");
      el("img", { attrs: { src: url, alt: "", role: "presentation" } }, tile);
    } else {
      el("span", { className: "axiosozo-project-letter", text: monogram(name) }, tile);
    }
    return tile;
  }

  function button(parent, { className, text, label, focusKey, title, attrs = {}, onClick }) {
    const node = el("button", { className, text, attrs: { type: "button", ...(label ? { "aria-label": label } : {}),
      ...(focusKey ? { "data-focus-key": focusKey } : {}), ...(title ? { title } : {}), ...attrs } }, parent);
    node.addEventListener("click", event => { event.stopPropagation?.(); onClick(event); });
    return node;
  }

  // ---- The Projects section ---------------------------------------------------------------
  function visibleEntries(uuid) {
    const inSpace = ctx.projects().filter(project => project.context_uuid === uuid)
      .sort((a, b) => (a.manifest?.name ?? "").localeCompare(b.manifest?.name ?? "", undefined, { sensitivity: "base" }) || a.id.localeCompare(b.id));
    const current = ctx.currentProjectId();
    const entries = inSpace.map(project => {
      const views = viewsOf(project);
      return { project, views, summary: summarize(views), current: project.id === current };
    });
    if (entries.length <= PROJECT_LIMIT || showAll.has(uuid)) return { entries, all: entries, hidden: 0 };
    // Stable alphabetical order; the current and running projects are never folded away.
    const keep = new Set(entries.filter(entry => entry.current || entry.summary.live || entry.summary.failed).map(entry => entry.project.id));
    for (const entry of entries) { if (keep.size >= PROJECT_LIMIT) break; keep.add(entry.project.id); }
    const shown = entries.filter(entry => keep.has(entry.project.id));
    return { entries: shown, all: entries, hidden: entries.length - shown.length };
  }

  // Stable nodes: rows are keyed by project and updated in place, so an open
  // panel keeps its anchor, and focus and hover survive the frequent redraws
  // a starting server causes.
  const head = el("div", { className: "axiosozo-projects-head" }, root);
  const listId = "axiosozo-projects-list";
  const titleButton = button(head, { className: "axiosozo-projects-title", text: "Projects", focusKey: "head:title",
    attrs: { "aria-controls": listId }, onClick: () => { sectionCollapsed = !sectionCollapsed; render(); } });
  const runningButton = button(head, { className: "axiosozo-projects-running", focusKey: "head:running", attrs: { "aria-haspopup": "dialog" },
    onClick: () => toggleRunsPanel(runningButton, shownUuid) });
  const addButton = button(head, { className: "axiosozo-projects-add", label: "Add a project to this space", title: "Add project", focusKey: "head:add",
    onClick: () => ctx.openOverview?.(`#add-project=${shownUuid}`) });
  addButton.hidden = typeof ctx.openOverview !== "function";
  const list = el("ul", { className: "axiosozo-projects-list", attrs: { id: listId, "aria-label": "Projects" } }, root);
  const overflowItem = el("li", { className: "axiosozo-projects-more" });
  const overflowButton = button(overflowItem, { className: "axiosozo-projects-overflow", focusKey: "overflow",
    onClick: () => { if (showAll.has(shownUuid)) showAll.delete(shownUuid); else showAll.add(shownUuid); render(); } });
  const rowNodes = new Map(); // project id → { item, row, quick, entry, signature }

  function render() {
    scheduled = false;
    if (disposed) return;
    const uuid = ctx.privateWindow ? null : adapter.activeWorkspaceUuid();
    const { entries, all, hidden } = uuid ? visibleEntries(uuid) : { entries: [], all: [], hidden: 0 };
    if (!all.length || !ctx.place(root, uuid)) {
      root.remove(); shownUuid = null; diagnostics.shown = false; diagnostics.rows = 0;
      if (open) renderPanel();
      return;
    }
    shownUuid = uuid;
    root.toggleAttribute?.("data-collapsed", sectionCollapsed);
    titleButton.setAttribute("aria-expanded", String(!sectionCollapsed));
    const live = allRuns.filter(run => OURS.has(run.status)).length;
    runningButton.hidden = !live;
    if (live) {
      runningButton.textContent = `${live} running`;
      runningButton.setAttribute("aria-label", `${live} ${live === 1 ? "server" : "servers"} started here ${live === 1 ? "is" : "are"} running. Show them`);
      runningButton.setAttribute("aria-expanded", String(open?.mode === "runs"));
    }
    list.hidden = sectionCollapsed;
    const counts = ctx.consoleCounts();
    const wanted = sectionCollapsed ? [] : entries;
    let previous = null;
    for (const entry of wanted) {
      const id = entry.project.id;
      let node = rowNodes.get(id);
      if (!node) { node = createRow(id); rowNodes.set(id, node); }
      fillRow(node, entry, counts?.get(id) ?? null);
      if (previous ? node.item.previousElementSibling !== previous : list.firstChild !== node.item) {
        if (previous) previous.after(node.item); else list.prepend(node.item);
      }
      previous = node.item;
    }
    const keep = new Set(wanted.map(entry => entry.project.id));
    for (const [id, node] of rowNodes) if (!keep.has(id)) { node.item.remove(); rowNodes.delete(id); }
    const more = showAll.has(uuid);
    if (!sectionCollapsed && (hidden || more) && all.length > PROJECT_LIMIT) {
      overflowButton.textContent = more ? "Show fewer" : `${hidden} more`;
      overflowButton.setAttribute("aria-expanded", String(more));
      if (previous) previous.after(overflowItem); else list.prepend(overflowItem);
    } else overflowItem.remove();
    diagnostics.shown = true; diagnostics.rows = wanted.length;
    if (open) renderPanel();
    pollWhileStarting(all);
  }

  function rowLabel(name, summary, logged) {
    const parts = [name];
    if (summary.live) parts.push(`${summary.live} running`);
    if (summary.failed) parts.push(`${summary.failed} stopped with an error`);
    if (logged) parts.push(ctx.consolePhrase(logged));
    return `${parts.join(", ")}. Show project`;
  }

  function createRow(id) {
    const node = { item: el("li", { className: "axiosozo-project", attrs: { "data-project-id": id } }), entry: null, signature: null };
    node.row = button(node.item, { className: "axiosozo-project-row", focusKey: `${id}:row`, attrs: { "aria-haspopup": "dialog" },
      onClick: event => {
        // A keyboard press (detail 0) moves focus into the panel once it shows.
        focusOnShow = event?.detail === 0;
        if (node.entry) toggleProjectPanel(node.entry.project, shownUuid, node.row);
      } });
    // Hover action: start the project's main server and open it.
    node.quick = button(node.item, { className: "axiosozo-project-quick", focusKey: `${id}:quick`, onClick: () => {
      const primary = node.entry && primaryTarget(node.entry.views);
      if (primary) startTarget(node.entry.project, primary, { uuid: shownUuid, then: "open", anchor: node.row });
    } });
    return node;
  }

  function fillRow(node, entry, logged) {
    const { project, views, summary, current } = entry;
    node.entry = entry;
    const id = project.id;
    const name = project.manifest?.name ?? "Project";
    const primary = !summary.live && !ctx.privateWindow ? primaryTarget(views) : null;
    const expanded = open?.mode === "project" && open.projectId === id;
    const signature = JSON.stringify([name, icons.get(id) ?? null, ctx.projectColor(project), summary, current, expanded,
      logged && [logged.count, logged.errors, logged.warnings], primary?.target.name ?? null]);
    if (node.signature === signature) return;
    node.signature = signature;
    node.item.setAttribute("data-state", summary.state);
    node.item.toggleAttribute?.("data-current", current);
    const { row, quick } = node;
    row.setAttribute("title", name);
    row.setAttribute("aria-label", rowLabel(name, summary, logged));
    row.setAttribute("aria-expanded", String(expanded));
    if (current) row.setAttribute("aria-current", "true"); else row.removeAttribute("aria-current");
    while (row.firstChild) row.firstChild.remove();
    projectIcon(project, row);
    el("span", { className: "axiosozo-project-name", text: name }, row);
    const badges = el("span", { className: "axiosozo-project-badges", attrs: { "aria-hidden": "true" } }, row);
    if (logged) {
      el("span", { className: "axiosozo-project-console", text: logged.count > 99 ? "99+" : String(logged.count),
        attrs: { "data-level": logged.errors ? "error" : "warning", title: ctx.consolePhrase(logged) } }, badges);
    }
    if (summary.live) el("span", { className: "axiosozo-project-live", text: String(summary.live), attrs: { "data-state": summary.state } }, badges);
    else if (summary.failed) el("span", { className: "axiosozo-project-failed", attrs: { title: "A server stopped with an error" } }, badges);
    quick.hidden = !primary;
    if (primary) {
      quick.setAttribute("aria-label", `Start ${primary.target.name} of ${name}`);
      quick.setAttribute("title", `Start ${primary.target.name}`);
    }
  }

  // ---- The panel --------------------------------------------------------------------------------
  const panelOpen = () => panel.state === "open" || panel.state === "showing";
  function openPanel(anchor) {
    renderPanel();
    if (panelOpen()) return;
    const right = (() => { try { return window.Services?.prefs?.getBoolPref?.("zen.tabs.vertical.right-side", false) === true; } catch { return false; } })();
    if (typeof panel.openPopup === "function") panel.openPopup(anchor, right ? "start_before" : "end_before", 0, 0, false, false);
  }
  function toggleProjectPanel(project, uuid, anchor) {
    if (open?.mode === "project" && open.projectId === project.id && panelOpen()) { panel.hidePopup?.(); return; }
    open = { mode: "project", projectId: project.id, uuid, anchor };
    confirming = confirming?.projectId === project.id ? confirming : null;
    statusesFresh(project);
    loadRuns([project.id]).then(() => { if (open?.projectId === project.id) renderPanel(); });
    openPanel(anchor);
    render();
  }
  function toggleRunsPanel(anchor, uuid) {
    if (open?.mode === "runs" && panelOpen()) { panel.hidePopup?.(); return; }
    open = { mode: "runs", uuid, anchor };
    loadAllRuns().then(() => { if (open?.mode === "runs") renderPanel(); });
    openPanel(anchor);
    render();
  }
  function statusesFresh(project) {
    ctx.statusesFor(project, { fresh: true }).then(() => schedule(), () => {});
  }

  let panelSignature = null;
  function logLines(projectId, key) {
    try { const lines = services.runLog({ projectId, key }); return Array.isArray(lines) ? lines.slice(-LOG_PREVIEW_LINES) : []; } catch { return []; }
  }
  /** Everything the open panel shows except the output text. */
  function signatureOfPanel() {
    if (open.mode === "runs") {
      return JSON.stringify(["runs", allRuns.map(run => [run.project_id, run.key, run.status, run.exit_code, run.detected_url, run.project_name,
        run.target?.name ?? null, icons.get(run.project_id) ?? null]), allRuns.map(run => {
        const project = ctx.projectById(run.project_id);
        return project && run.target?.local ? portOf(run.target, ctx.cachedStatuses(project)) : null;
      })]);
    }
    const project = ctx.projectById(open.projectId);
    if (!project) return null;
    const views = viewsOf(project);
    return JSON.stringify(["project", project, icons.get(project.id) ?? null, ctx.projectColor(project), runs.get(project.id)?.available ?? null,
      views.map(view => [view.target, view.state, view.url, view.run?.status ?? null, view.run?.exit_code ?? null, view.run?.run ?? null]),
      confirming, logOpen, [...errors], [...busy], ctx.environmentsOf(project)]);
  }
  /** The open output only: new lines, kept at the bottom unless the user scrolled up. */
  function refreshLog() {
    const pre = panelBody.querySelector?.(".axiosozo-pp-output");
    if (!pre || !logOpen) return;
    const pinned = pre.scrollTop + pre.clientHeight >= pre.scrollHeight - 4;
    const lines = logLines(logOpen.projectId, logOpen.key);
    const next = lines.length ? lines.join("\n") : "No output yet.";
    if (pre.textContent !== next) pre.textContent = next;
    if (pinned) pre.scrollTop = pre.scrollHeight ?? 0;
  }

  function renderPanel() {
    if (!open) return;
    const signature = signatureOfPanel();
    if (signature !== null && signature === panelSignature) { refreshLog(); return; }
    panelSignature = signature;
    const focusKey = panel.contains?.(document.activeElement) ? document.activeElement?.getAttribute?.("data-focus-key") : null;
    while (panelBody.firstChild) panelBody.firstChild.remove();
    if (open.mode === "runs") renderRunsPanel();
    else {
      const project = ctx.projectById(open.projectId);
      if (!project) { panel.hidePopup?.(); open = null; return; }
      renderProjectPanel(project, open.uuid);
    }
    refreshLog();
    if (focusKey) panelBody.querySelector?.(`[data-focus-key="${focusKey.replace(/["\\]/gu, "\\$&")}"]`)?.focus?.();
    diagnostics.panel = open.mode === "runs" ? "runs" : open.projectId;
  }

  function sectionHead(parent, title, action = null) {
    const head = el("div", { className: "axiosozo-pp-section-head" }, parent);
    el("h3", { className: "axiosozo-pp-section-title", text: title }, head);
    if (action) button(head, action);
    return head;
  }

  function renderProjectPanel(project, uuid) {
    const id = project.id;
    const name = project.manifest?.name ?? "Project";
    panel.setAttribute("aria-label", name);
    const head = el("header", { className: "axiosozo-pp-head" }, panelBody);
    projectIcon(project, head, "large");
    const titles = el("div", { className: "axiosozo-pp-titles" }, head);
    el("h2", { className: "axiosozo-pp-title", text: name }, titles);
    el("p", { className: "axiosozo-pp-path", text: ctx.displayPath(project.root), attrs: { title: project.root } }, titles);
    const more = button(head, { className: "axiosozo-pp-more", label: `More for ${name}`, title: "More", focusKey: `${id}:more`,
      attrs: { "aria-haspopup": "menu", "aria-expanded": "false" }, onClick: () => openMenu(project, uuid, more) });

    const data = runs.get(id);
    const views = viewsOf(project);
    const run = el("section", { className: "axiosozo-pp-section", attrs: { "aria-label": "Servers and apps" } }, panelBody);
    const ours = views.filter(view => OURS.has(view.run?.status ?? ""));
    sectionHead(run, "Run", ours.length > 1 ? { className: "axiosozo-pp-text-button", text: "Stop all", focusKey: `${id}:stop-all`,
      onClick: () => { diagnostics.stops++; services.stopRuns({ projectId: id }).catch(() => {}); } } : null);
    if (!views.length) {
      el("p", { className: "axiosozo-pp-empty", text: data?.available === false
        ? "Starting servers is not available in this build." : "No servers or apps yet. Add how to start them, and AxioSozo starts and stops them for you." }, run);
    } else {
      const list = el("ul", { className: "axiosozo-pp-targets" }, run);
      for (const view of views) targetItem(list, project, view, uuid);
    }
    if (typeof ctx.openSettings === "function") {
      button(run, { className: "axiosozo-pp-add", text: "Add a server or app…", focusKey: `${id}:add-target`,
        onClick: () => { panel.hidePopup?.(); ctx.openSettings(id, { edit: true }); } });
    }

    const links = linkRows(project);
    if (links.length) {
      const section = el("section", { className: "axiosozo-pp-section", attrs: { "aria-label": "Links" } }, panelBody);
      sectionHead(section, "Links");
      const list = el("ul", { className: "axiosozo-pp-links" }, section);
      for (const link of links) {
        const item = el("li", {}, list);
        const row = button(item, { className: "axiosozo-pp-link", focusKey: `${id}:link:${link.url}`, label: `${link.label}, ${hostOf(link.url)}`,
          onClick: () => { panel.hidePopup?.(); ctx.goTo(project, link.url, uuid, link.environment); } });
        el("img", { className: "axiosozo-pp-link-icon", attrs: { alt: "", role: "presentation", src: `page-icon:${link.url}`, "data-kind": link.kind } }, row);
        el("span", { className: "axiosozo-pp-link-label", text: link.label }, row);
        el("span", { className: "axiosozo-pp-link-detail", text: hostOf(link.url) }, row);
      }
    }
    if (typeof ctx.openSettings === "function") {
      const foot = el("footer", { className: "axiosozo-pp-foot" }, panelBody);
      button(foot, { className: "axiosozo-pp-text-button", text: "Project home", focusKey: `${id}:home`,
        onClick: () => { panel.hidePopup?.(); ctx.openSettings(id); } });
    }
  }

  /** Remote environments (and local ones no target covers), then every
   * surface, primary ones first. */
  function linkRows(project) {
    const targets = runs.get(project.id)?.targets ?? [];
    const appsCount = new Set((project.manifest?.environments ?? []).map(env => env.app ?? null).filter(Boolean)).size;
    const rows = [];
    for (const environment of ctx.environmentsOf(project)) {
      const local = !!localAddress(environment.base_url);
      if (local && targets.some(target => target.url && sameOrigin(target.url, environment.base_url))) continue;
      const label = appsCount > 1 && environment.app ? `${environment.app} · ${environment.name}` : environment.name;
      rows.push({ kind: "environment", label: label.charAt(0).toLocaleUpperCase() + label.slice(1), url: environment.base_url, environment });
    }
    const surfaces = [...(project.manifest?.surfaces ?? [])];
    const prominence = surface => (ctx.core.surfaceProminence?.(surface) === "primary" ? 0 : 1);
    surfaces.sort((a, b) => prominence(a) - prominence(b));
    for (const surface of surfaces) rows.push({ kind: surface.kind ?? "surface", label: surface.name, url: surface.url, environment: null });
    return rows;
  }

  function targetItem(list, project, view, uuid) {
    const { target, run, state, url } = view;
    const id = project.id;
    const key = tkey(id, target.key);
    const item = el("li", { className: "axiosozo-pp-target", attrs: { "data-state": state, "data-kind": target.kind } }, list);
    const detailParts = [url ? hostOf(url) : KIND_TEXT[target.kind] ?? KIND_TEXT.other, STATE_TEXT[state]];
    if (state === "failed" && Number.isInteger(run?.exit_code)) detailParts[1] = `Stopped (exit ${run.exit_code})`;
    const canOpen = !!url;
    const main = button(item, { className: "axiosozo-pp-target-main", focusKey: `${key}:main`,
      label: `${target.name}, ${detailParts.join(", ")}. ${canOpen ? "Open" : run ? "Show output" : target.startable ? "Start" : ""}`.trim(),
      onClick: () => {
        if (canOpen) {
          if (state === "stopped" || state === "failed") {
            if (target.startable) { startTarget(project, view, { uuid, then: "open" }); return; }
          }
          openTarget(project, view, uuid);
        } else if (run) { toggleLog(id, target.key); } else if (target.startable) startTarget(project, view, { uuid, then: "start" });
      } });
    el("span", { className: "axiosozo-pp-kind", attrs: { "data-kind": target.kind, "aria-hidden": "true" } }, main);
    const text = el("span", { className: "axiosozo-pp-target-text" }, main);
    el("span", { className: "axiosozo-pp-target-name", text: target.name }, text);
    el("span", { className: "axiosozo-pp-target-detail", text: detailParts.join(" · ") }, text);
    const actions = el("span", { className: "axiosozo-pp-target-actions" }, item);
    if (OURS.has(run?.status ?? "") && state !== "stopping") {
      button(actions, { className: "axiosozo-pp-icon-button", label: `Stop ${target.name}`, title: "Stop", focusKey: `${key}:stop`,
        attrs: { "data-action": "stop" }, onClick: () => stopTarget(project, target) });
    } else if (target.startable && state !== "external" && state !== "stopping") {
      button(actions, { className: "axiosozo-pp-icon-button", label: `Start ${target.name}`, title: "Start", focusKey: `${key}:start`,
        attrs: { "data-action": "start", ...(busy.has(key) ? { disabled: "true" } : {}) }, onClick: () => startTarget(project, view, { uuid, then: "start" }) });
    }
    if (run) {
      const shown = logOpen?.projectId === id && logOpen.key === target.key;
      button(actions, { className: "axiosozo-pp-icon-button", label: `${shown ? "Hide" : "Show"} the output of ${target.name}`, title: "Output",
        focusKey: `${key}:log`, attrs: { "data-action": "log", "aria-expanded": String(shown) }, onClick: () => toggleLog(id, target.key) });
    }
    if (confirming?.projectId === id && confirming.key === target.key) confirmItem(list, project, view, uuid);
    if (errors.has(key)) el("li", { className: "axiosozo-pp-error", text: errors.get(key), attrs: { role: "alert" } }, list);
    if (logOpen?.projectId === id && logOpen.key === target.key) {
      const logItem = el("li", { className: "axiosozo-pp-log" }, list);
      el("pre", { className: "axiosozo-pp-output", attrs: { tabindex: "0", "aria-label": `Output of ${target.name}`, "data-focus-key": `${key}:output` } }, logItem);
    }
  }

  /** The one-time question before a command first runs: the exact command and
   * folder; Run approves and starts it. */
  function confirmItem(list, project, view, uuid) {
    const { target } = view;
    const key = tkey(project.id, target.key);
    const item = el("li", { className: "axiosozo-pp-confirm", attrs: { role: "group", "aria-label": `Run ${target.name}?` } }, list);
    el("p", { className: "axiosozo-pp-confirm-title", text: `Run ${target.name} on this Mac?` }, item);
    el("code", { className: "axiosozo-pp-command", text: target.command }, item);
    el("p", { className: "axiosozo-pp-confirm-where", text: `in ${ctx.displayPath(target.cwd ? `${project.root}/${target.cwd}` : project.root)}. `
      + "It runs like a terminal command and stops when you stop it or quit AxioSozo. Only run commands you trust." }, item);
    const buttons = el("div", { className: "axiosozo-pp-confirm-buttons" }, item);
    button(buttons, { className: "axiosozo-pp-primary", text: "Run", focusKey: `${key}:approve`,
      onClick: () => { diagnostics.confirms++; startTarget(project, view, { uuid, then: confirming?.then ?? "start", approve: true }); } });
    button(buttons, { className: "axiosozo-pp-text-button", text: "Cancel", focusKey: `${key}:cancel`, onClick: () => { confirming = null; renderPanel(); } });
  }

  function renderRunsPanel() {
    panel.setAttribute("aria-label", "Running servers");
    const head = el("header", { className: "axiosozo-pp-head" }, panelBody);
    const titles = el("div", { className: "axiosozo-pp-titles" }, head);
    el("h2", { className: "axiosozo-pp-title", text: "Running" }, titles);
    el("p", { className: "axiosozo-pp-path", text: "Started here, in every space. All stop when you quit." }, titles);
    const live = allRuns.filter(run => OURS.has(run.status) || run.status === "failed");
    const section = el("section", { className: "axiosozo-pp-section" }, panelBody);
    sectionHead(section, "Servers and apps", allRuns.some(run => OURS.has(run.status)) ? { className: "axiosozo-pp-text-button", text: "Stop all",
      focusKey: "runs:stop-all", onClick: () => { diagnostics.stops++; services.stopRuns({}).catch(() => {}); } } : null);
    if (!live.length) { el("p", { className: "axiosozo-pp-empty", text: "Nothing started here is running." }, section); return; }
    const list = el("ul", { className: "axiosozo-pp-targets" }, section);
    for (const run of live) {
      const project = ctx.projectById(run.project_id);
      const target = run.target ?? { key: run.key, name: run.name, kind: "other", local: false };
      const state = displayState(target, run, project && target.local ? portOf(target, ctx.cachedStatuses(project)) : null);
      const url = targetUrl(target, run);
      const key = tkey(run.project_id, run.key);
      const item = el("li", { className: "axiosozo-pp-target", attrs: { "data-state": state, "data-kind": target.kind } }, list);
      const main = button(item, { className: "axiosozo-pp-target-main", focusKey: `runs:${key}`,
        label: `${run.project_name ?? "Project"}: ${target.name}, ${STATE_TEXT[state]}${url && project ? ". Open" : ""}`,
        onClick: () => { if (url && project) { panel.hidePopup?.(); ctx.goTo(project, url, project.context_uuid ?? open?.uuid ?? null, null); } } });
      if (project) projectIcon(project, main); else el("span", { className: "axiosozo-pp-kind", attrs: { "data-kind": target.kind, "aria-hidden": "true" } }, main);
      const text = el("span", { className: "axiosozo-pp-target-text" }, main);
      el("span", { className: "axiosozo-pp-target-name", text: `${run.project_name ?? "Project"} · ${target.name}` }, text);
      el("span", { className: "axiosozo-pp-target-detail", text: [url ? hostOf(url) : KIND_TEXT[target.kind] ?? KIND_TEXT.other, STATE_TEXT[state]].join(" · ") }, text);
      const actions = el("span", { className: "axiosozo-pp-target-actions" }, item);
      if (OURS.has(run.status) && run.status !== "stopping") {
        button(actions, { className: "axiosozo-pp-icon-button", label: `Stop ${target.name} of ${run.project_name ?? "the project"}`, title: "Stop",
          focusKey: `runs:${key}:stop`, attrs: { "data-action": "stop" },
          onClick: () => { diagnostics.stops++; services.stopRun({ projectId: run.project_id, key: run.key }).catch(() => {}); } });
      } else if (run.status === "failed") {
        button(actions, { className: "axiosozo-pp-icon-button", label: `Dismiss ${target.name}`, title: "Dismiss", focusKey: `runs:${key}:dismiss`,
          attrs: { "data-action": "dismiss" }, onClick: () => { services.dismissRun({ projectId: run.project_id, key: run.key }); loadAllRuns().then(schedule); } });
      }
    }
  }

  // ---- Actions ------------------------------------------------------------------------------------
  function environmentFor(project, url) {
    return ctx.environmentsOf(project).find(environment => sameOrigin(environment.base_url, url)) ?? null;
  }
  function openTarget(project, view, uuid) {
    if (!view.url) return;
    panel.hidePopup?.();
    ctx.goTo(project, view.url, uuid, environmentFor(project, view.url));
  }

  /** Starts a target; `then: "open"` opens its page right away (the waiting
   * page shows it starting). Asks first when its command was never approved. */
  async function startTarget(project, view, { uuid, then = "start", approve = false, anchor = null } = {}) {
    const key = tkey(project.id, view.target.key);
    if (busy.has(key) || disposed) return;
    busy.add(key);
    errors.delete(key);
    try {
      await services.startRun({ window, projectId: project.id, key: view.target.key, approve });
      diagnostics.starts++;
      confirming = null;
      logOpen = view.target.local || view.url ? logOpen : { projectId: project.id, key: view.target.key };
      if (then === "open" && (view.url || view.target.url)) openTarget(project, { ...view, url: view.url ?? view.target.url }, uuid);
    } catch (error) {
      if (error?.code === "NEEDS_APPROVAL") {
        confirming = { projectId: project.id, key: view.target.key, then };
        if (!(open?.mode === "project" && open.projectId === project.id && panelOpen())) {
          open = { mode: "project", projectId: project.id, uuid, anchor: anchor ?? open?.anchor ?? null };
          openPanel(anchor ?? rowNodes.get(project.id)?.row ?? root);
        }
        busy.delete(key);
        renderPanel();
        panelBody.querySelector?.(`[data-focus-key="${key.replace(/["\\]/gu, "\\$&")}:approve"]`)?.focus?.();
        return;
      }
      errors.set(key, errorText(error?.code));
    } finally {
      busy.delete(key);
    }
    await loadRuns([project.id]);
    await loadAllRuns();
    statusesFresh(project);
    schedule();
  }

  async function stopTarget(project, target) {
    diagnostics.stops++;
    try { await services.stopRun({ projectId: project.id, key: target.key }); } catch { /* Its state shows what happened. */ }
    await loadRuns([project.id]);
    await loadAllRuns();
    statusesFresh(project);
    schedule();
  }

  function toggleLog(projectId, key) {
    logOpen = logOpen?.projectId === projectId && logOpen.key === key ? null : { projectId, key };
    renderPanel();
  }

  // ---- ⋯ menu ------------------------------------------------------------------------------------------
  function menuItem(attributes) {
    const item = document.createXULElement("menuitem");
    for (const [key, value] of Object.entries(attributes)) item.setAttribute(key, value);
    menu.appendChild(item);
    return item;
  }
  function openMenu(project, uuid, anchor) {
    while (menu.firstChild) menu.firstChild.remove();
    menuTarget = { projectId: project.id, uuid, anchor, binding };
    if (typeof ctx.openSettings === "function") {
      menuItem({ label: "Project home", "data-action": "home" });
      menuItem({ label: "Edit project…", "data-action": "edit" });
      menu.appendChild(document.createXULElement("menuseparator"));
    }
    if (runs.get(project.id)?.targets?.some(target => OURS.has(target.run?.status ?? ""))) menuItem({ label: "Stop all servers", "data-action": "stop-all" });
    menuItem({ label: "Remove from space", "data-action": "remove" });
    if (typeof menu.openPopup === "function") menu.openPopup(anchor, "after_end");
  }
  const onMenuCommand = event => {
    const action = event.target?.getAttribute?.("data-action");
    // A menu shown before a model change is stale and does nothing.
    if (!menuTarget || menuTarget.binding !== binding) return;
    const project = ctx.projectById(menuTarget.projectId);
    if (!project) return;
    if (action === "home") { panel.hidePopup?.(); ctx.openSettings?.(project.id); }
    else if (action === "edit") { panel.hidePopup?.(); ctx.openSettings?.(project.id, { edit: true }); }
    else if (action === "stop-all") services.stopRuns({ projectId: project.id }).catch(() => {});
    else if (action === "remove") {
      panel.hidePopup?.();
      // Reversible from about:axiosozo (Projects); the folder and repository are untouched.
      Promise.resolve(services.updateProject(project.id, { context_uuid: null })).catch(error => console.error("AxioSozo: remove from space failed", error));
    }
  };
  const onMenuShowing = event => { if (event.target === menu) menuTarget?.anchor?.setAttribute?.("aria-expanded", "true"); };
  const onMenuHidden = event => { if (event.target === menu) menuTarget?.anchor?.setAttribute?.("aria-expanded", "false"); };
  menu.addEventListener("command", onMenuCommand);
  menu.addEventListener("popupshowing", onMenuShowing);
  menu.addEventListener("popuphidden", onMenuHidden);
  const onPanelShown = event => {
    if (event.target !== panel || !focusOnShow) return;
    focusOnShow = false;
    panelBody.querySelector?.("button")?.focus?.();
  };
  const onPanelHidden = event => {
    if (event.target !== panel) return;
    // Escape (or any close) from inside the panel returns focus to its row.
    if (panel.contains?.(document.activeElement) && open?.anchor?.isConnected) open.anchor.focus?.();
    open = null; confirming = null; logOpen = null; diagnostics.panel = null; panelSignature = null;
    schedule();
  };
  panel.addEventListener("popuphidden", onPanelHidden);
  panel.addEventListener("popupshown", onPanelShown);
  cleanups.push(() => {
    menu.removeEventListener("command", onMenuCommand);
    menu.removeEventListener("popupshowing", onMenuShowing);
    menu.removeEventListener("popuphidden", onMenuHidden);
    panel.removeEventListener("popuphidden", onPanelHidden);
    panel.removeEventListener("popupshown", onPanelShown);
  });

  // ---- Refresh ----------------------------------------------------------------------------------------
  function schedule() {
    if (scheduled || disposed) return;
    scheduled = true;
    Promise.resolve().then(render).catch(() => {});
  }

  /** While one of this space's servers starts, check its port again soon. */
  function pollWhileStarting(entries) {
    if (pollTimer !== null || ctx.privateWindow) return;
    const starting = entries.filter(entry => entry.views.some(view => view.state === "starting"));
    if (!starting.length) return;
    pollTimer = ctx.timers.setTimeout(() => {
      pollTimer = null;
      if (disposed) return;
      Promise.all(starting.map(entry => ctx.statusesFor(entry.project, { fresh: true }).catch(() => [])))
        .then(() => loadRuns(starting.map(entry => entry.project.id))).then(schedule, () => {});
    }, STARTING_POLL_MS);
  }

  /** Reloads runs and port checks of this space's projects (and the open
   * panel's), then draws. `fresh`: check ports now. */
  async function refresh({ fresh = false } = {}) {
    const uuid = ctx.privateWindow ? null : adapter.activeWorkspaceUuid();
    const inSpace = uuid ? ctx.projects().filter(project => project.context_uuid === uuid) : [];
    const ids = inSpace.map(project => project.id);
    if (open?.mode === "project") ids.push(open.projectId);
    render();
    if (!ids.length && !open) return;
    await Promise.all([loadRuns(ids), loadAllRuns(), ...inSpace.map(project => ctx.statusesFor(project, { fresh }).catch(() => []))]);
    if (!disposed) render();
  }

  if (!ctx.privateWindow) {
    try {
      const off = services.on("runs", () => {
        const ids = ctx.projects().filter(project => project.context_uuid === shownUuid).map(project => project.id);
        if (open?.mode === "project") ids.push(open.projectId);
        Promise.all([loadRuns(ids), loadAllRuns()]).then(schedule, () => {});
      });
      if (typeof off === "function") cleanups.push(off);
    } catch { /* An older services build has no runs event. */ }
  }

  return Object.freeze({
    render, schedule, refresh,
    /** Projects whose statuses the sidebar shows (for DevLoop's interval). */
    shownProjects: () => (shownUuid ? ctx.projects().filter(project => project.context_uuid === shownUuid) : []),
    /** A project model change: icons and runs may differ, shown menus are stale. */
    projectsChanged() {
      binding++;
      icons.clear();
      if (menu.state === "open" || menu.state === "showing") { try { menu.hidePopup?.(); } catch {} }
      refresh().catch(() => {});
    },
    /** Starts a target by key from elsewhere (the waiting page). */
    targetsOf: project => viewsOf(project),
    async loadTargets(project) { await loadRuns([project.id]); return viewsOf(project); },
    diagnostics: () => ({ ...diagnostics }),
    dispose() {
      if (disposed) return;
      disposed = true;
      if (pollTimer !== null) ctx.timers.clearTimeout(pollTimer);
      try { panel.hidePopup?.(); } catch {}
      for (const cleanup of cleanups.reverse()) { try { cleanup(); } catch {} }
    },
  });
}
