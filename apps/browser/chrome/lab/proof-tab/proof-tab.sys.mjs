/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Lab experiment "proof-tab" (docs/lab/experiments/proof-tab.md): the
// evidence, on the real signed-in page. When an agent run started from this
// browser finishes having changed files in a web project, that project's
// local page gets a quiet "To verify" line under its tab title (Zen's own
// tab sublabel): an open tab of that project (never reloaded on its own),
// else a new tab in the background. Selecting it shows a small strip over
// the page:
//   - what the agent said and which files it changed;
//   - the console errors on the project's pages since they loaded, when the
//     console owner can tell (otherwise nothing is said about the console);
//   - Reload, only while the tab still shows the page from before the change;
//   - Looks right: clears the mark and the agent's result everywhere;
//   - Not right…: one line of what is wrong, sent as a follow-up task to the
//     same agent in the same project, with a picture of the visible page (a
//     Gecko tab), its address and those console errors, after saying so.
// Only one window marks a run (the one used last). Turning it off clears
// every mark and strip; tabs it opened stay, as ordinary tabs.
import { snapshotRequest } from "../../RegionCapture.sys.mjs";
import { routeForUrl } from "../../contexts/index.mjs";
import { el, floatingCard, useStylesheet, XHTML } from "../kit.sys.mjs";
import { presenceHub } from "../presence/hub.sys.mjs";
import { agentIcon } from "../presence/icons.sys.mjs";
import { changedFiles, clientLabel, filesText, line, projectName, taskOf } from "../presence/model.sys.mjs";
import { watchPresence } from "../presence/source.sys.mjs";
import { clearTabSubtitle, localUrlOf, projectTabs, setTabSubtitle } from "../presence/tabs.sys.mjs";

export const PRESENCE_STYLESHEET = "chrome://browser/content/axiosozo/lab/presence/presence.css";
export const PROOF_STYLESHEET = "chrome://browser/content/axiosozo/lab/proof-tab/proof-tab.css";
export const PROOF_ATTRIBUTE = "axiosozo-proof";
export const VERIFY_TEXT = "To verify";
export const MAX_NOTE = 500;
/** How long a finished follow-up may take for the browser to read its changed files. */
export const FILES_WAIT_MS = 4000;
const CONTAINERS_PREF = "privacy.userContext.enabled";
// A follow-up sent from a marked tab comes back to that tab, in whichever window it is (process-wide).
const followUpOwners = new Map(); // follow-up session id → mark(session) of the window that sent it

/** The follow-up task: the user's note first, then what it follows (the agent's words are data, as in the envelope). */
export function followUpTask(note, session) {
  const files = filesText(session?.files);
  const lines = [line(note, MAX_NOTE)];
  lines.push("");
  lines.push(`This follows an earlier task in this project: "${line(taskOf(session), 160)}".`);
  if (session?.summary) lines.push(`Afterwards the agent said: "${line(session.summary, 240)}"`);
  if (files) lines.push(`${files}.`);
  lines.push("The user looked at the page in the browser and says the result is not right.");
  return lines.join("\n");
}

/** What leaves the machine when the note is sent, in one sentence. */
export function outgoingSentence(client, { image = false, consoleErrors = 0 } = {}) {
  const parts = ["Your note", image ? "a picture of the visible page" : null, "its address",
    consoleErrors ? `${consoleErrors === 1 ? "1 console error" : `${consoleErrors} console errors`}` : null].filter(Boolean);
  const list = `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
  return `${list} go to ${clientLabel({ client })}.`;
}

/** The console line of the strip; null when the console owner cannot tell (nothing is said then). */
export function consoleLine(consoleErrors, project) {
  if (!consoleErrors || !Number.isSafeInteger(consoleErrors.count)) return null;
  const name = line(project?.manifest?.name ?? project?.name ?? "", 60) || "this project";
  const errors = (consoleErrors.recent ?? []).filter(item => item?.level !== "warning");
  if (!consoleErrors.count) return { text: `No console messages on ${name}'s pages since they loaded.`, recent: [] };
  const count = consoleErrors.count === 1 ? "1 console message" : `${consoleErrors.count} console messages`;
  return { text: `${count} on ${name}'s pages since they loaded${errors.length ? ", the newest:" : "."}`, recent: errors.slice(0, 2).map(item => line(item.text, 160)) };
}

/** PNG of the visible part of a Gecko tab's page, as area capture draws it; { image } or { image: null, reason }. */
export async function captureVisiblePage(window, tab, { engineOf = () => "gecko" } = {}) {
  try {
    if (engineOf(tab) !== "gecko") return { image: null, reason: "This tab shows the Chromium engine, so no picture is sent." };
    const browser = tab?.linkedBrowser;
    const global = browser?.browsingContext?.currentWindowGlobal;
    if (!global || typeof global.drawSnapshot !== "function") return { image: null, reason: "No picture of this page could be taken." };
    const bounds = browser.getBoundingClientRect();
    const request = snapshotRequest({ x: 0, y: 0, width: bounds.width, height: bounds.height }, { zoom: browser.fullZoom || 1, dpr: window.devicePixelRatio || 1 });
    const bitmap = await global.drawSnapshot(new window.DOMRect(request.rect.x, request.rect.y, request.rect.width, request.rect.height),
      request.scale, "rgb(255,255,255)", { drawView: true });
    const canvas = window.document.createElementNS(XHTML, "canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0);
    bitmap.close?.();
    const blob = await new Promise((resolve, reject) => canvas.toBlob(value => (value ? resolve(value) : reject(new Error("ENCODE"))), "image/png"));
    return { image: { type: "image/png", data: new Uint8Array(await blob.arrayBuffer()) } };
  } catch (error) {
    console.error("AxioSozo Lab: the page could not be pictured", error);
    return { image: null, reason: "No picture of this page could be taken." };
  }
}

/**
 * A new background tab with the project's local page, in the project's space
 * and (with containers on) the container its route names; never selected.
 * Returns the tab, or null.
 */
export function openProjectTabInBackground(window, ctx, project, url) {
  const gBrowser = window.gBrowser;
  const adapter = ctx.adapter;
  let space = typeof project?.context_uuid === "string" ? project.context_uuid : null;
  try { if (space && !adapter.listWorkspaces().some(item => item.uuid === space)) space = null; } catch { space = null; }
  space ??= adapter?.activeWorkspaceUuid?.() ?? null;
  const spaceContainer = space ? adapter.containerForWorkspace?.(space) ?? 0 : 0;
  let userContextId = spaceContainer;
  let containers = false;
  try { containers = window.Services?.prefs?.getBoolPref?.(CONTAINERS_PREF, false) === true; } catch { containers = false; }
  if (containers) { try { userContextId = routeForUrl({ project, url, defaultUserContextId: spaceContainer }).userContextId; } catch { userContextId = spaceContainer; } }
  const triggeringPrincipal = window.Services.scriptSecurityManager.createNullPrincipal({ userContextId });
  if (!triggeringPrincipal || triggeringPrincipal.isSystemPrincipal) return null;
  // skipRoute: Zen's space routing must not move it out of the project's space (as the workspace adapter opens tabs).
  const tab = gBrowser.addTab(url, { triggeringPrincipal, userContextId, inBackground: true, skipAnimation: true, fromExternal: false, skipRoute: true,
    ...(space ? { zenWorkspaceId: space } : {}) });
  if (!tab) return null;
  if (tab.userContextId !== undefined && tab.userContextId !== userContextId) {
    try { gBrowser.removeTab(tab); } catch {}
    return null;
  }
  return tab;
}

export function installProofTab(window, ctx, { hub = presenceHub, clock = () => Date.now(), timers = window, capture = captureVisiblePage,
  openTab = openProjectTabInBackground } = {}) {
  const document = window.document;
  const gBrowser = window.gBrowser;
  const sheets = [useStylesheet(document, PRESENCE_STYLESHEET), useStylesheet(document, PROOF_STYLESHEET)];
  // Files are known for runs started here only, so sessions found elsewhere are not watched.
  const source = watchPresence(window, ctx, { hub, external: false, clock, timers });
  const marks = new Map(); // tab → { sessionId, state: "verify" | "working", fresh, followUpId }
  const finishedAtStart = new Set((() => { try { return ctx.agents.list() ?? []; } catch { return []; } })()
    .filter(session => session?.state === "done").map(session => session.id));
  let strip = null; // { card, tab }
  let disposed = false;
  let usedAt = clock();
  const used = () => { usedAt = clock(); };
  window.addEventListener("activate", used, { signal: ctx.signal });
  window.addEventListener("focus", used, { signal: ctx.signal });
  const hasFocus = () => { try { return document.hasFocus?.() === true; } catch { return false; } };
  const workspaceOf = tab => { try { return ctx.adapter?.workspaceForTab?.(tab) ?? null; } catch { return null; } };
  const tabOfBrowser = browser => gBrowser.getTabForBrowser?.(browser) ?? null;

  // ---- marks -------------------------------------------------------------------------------------
  function mark(tab, session, { fresh = false } = {}) {
    const previous = marks.get(tab);
    marks.set(tab, { sessionId: session.id, state: "verify", fresh, followUpId: null });
    setTabSubtitle(window, tab, VERIFY_TEXT);
    tab.setAttribute(PROOF_ATTRIBUTE, "verify");
    const files = filesText(session.files);
    tab.setAttribute("aria-description", `${VERIFY_TEXT}: ${clientLabel(session)} finished${files ? `. ${files}` : ""}.`);
    if (previous?.sessionId !== session.id && gBrowser.selectedTab === tab) showStrip(tab);
  }
  function markWorking(tab, followUp) {
    const entry = marks.get(tab);
    if (!entry) return;
    entry.state = "working";
    entry.followUpId = followUp.id;
    followUpOwners.set(followUp.id, session => { if (!disposed && marks.has(tab)) mark(tab, session, { fresh: false }); });
    setTabSubtitle(window, tab, `${clientLabel(followUp)} is working`);
    tab.setAttribute(PROOF_ATTRIBUTE, "working");
    tab.setAttribute("aria-description", `${clientLabel(followUp)} is working on your note.`);
  }
  function clear(tab) {
    const entry = marks.get(tab);
    if (!entry) return;
    marks.delete(tab);
    if (entry.followUpId) followUpOwners.delete(entry.followUpId);
    clearTabSubtitle(window, tab);
    tab.removeAttribute(PROOF_ATTRIBUTE);
    tab.removeAttribute("aria-description");
    if (strip?.tab === tab) strip.card.close("cleared");
  }

  /** A finished run with changed files: mark its project's page in this window (the hub picked it). */
  function onProof(session) {
    if (disposed) return;
    const project = source.projectById(session.projectId);
    const url = project ? localUrlOf(project) : null;
    if (!url) return;
    const tab = projectTabs(window, project.id, source.projects(), { workspaceOf })[0] ?? null;
    if (tab) { mark(tab, session, { fresh: false }); return; }
    let opened = null;
    try { opened = openTab(window, ctx, project, url); } catch (error) { console.error("AxioSozo Lab: the project page did not open", error); }
    if (opened) mark(opened, session, { fresh: true });
  }

  const unregister = hub.registerWindow({ usedAt: () => (hasFocus() ? Number.MAX_SAFE_INTEGER : usedAt), handlers: { proof: onProof } });

  const offSource = source.subscribe(({ sessions }) => {
    for (const session of sessions) {
      // A follow-up that ended without anything to verify takes its "working" line away. A run that is
      // done says so before the browser has read its files: wait a moment for them before deciding.
      for (const [tab, entry] of marks) {
        if (entry.followUpId !== session.id || !["needs_you", "failed", "stopped", "done"].includes(session.state)) continue;
        if (session.state !== "done") clear(tab);
        else if (!session.files) {
          timers.setTimeout(() => {
            const now = source.session(session.id);
            if (!disposed && marks.get(tab)?.followUpId === session.id && !changedFiles(now?.files)) clear(tab);
          }, FILES_WAIT_MS);
        } else if (!changedFiles(session.files)) clear(tab);
      }
      if (session.origin !== "browser" || session.state !== "done" || session.mayEdit === false || !changedFiles(session.files)) continue;
      if (finishedAtStart.has(session.id)) continue;
      const owner = followUpOwners.get(session.id);
      if (owner) {
        if (hub.claim("proof", session.id)) { followUpOwners.delete(session.id); owner(session); }
        continue;
      }
      hub.handOnce("proof", session.id, session);
    }
  });

  // ---- the strip ------------------------------------------------------------------------------------
  function showStrip(tab, { noteMode = false } = {}) {
    const entry = marks.get(tab);
    if (!entry || entry.state !== "verify" || disposed) return;
    const session = source.session(entry.sessionId) ?? ctx.agents.get?.(entry.sessionId);
    if (!session) { clear(tab); return; }
    if (strip?.tab === tab && strip.card.isOpen && !noteMode) return;
    strip?.card.close("replaced");
    const project = source.projectById(session.projectId);
    const card = floatingCard(window, { anchor: { browser: tab.linkedBrowser }, title: VERIFY_TEXT, width: 420, focus: noteMode, signal: ctx.signal,
      onClose: () => { if (strip?.card === card) strip = null; } });
    if (!card) return;
    card.node.classList.add("axiosozo-presence-card");
    card.node.classList.add("axiosozo-proof-strip");
    strip = { card, tab };
    let consoleErrors;
    let message = null;

    const verdictBody = () => {
      const nodes = [el(document, "p", { class: "axiosozo-presence-status", "data-state": "done" },
        el(document, "img", { class: "axiosozo-presence-icon", src: agentIcon(session.client, "done"), alt: "", role: "presentation" }),
        el(document, "span", { text: `${clientLabel(session)} · ${projectName(session)} · ${taskOf(session)}` }))];
      nodes.push(el(document, "p", { class: "axiosozo-lab-card-text axiosozo-presence-lead", text: line(session.summary, 240) || `${clientLabel(session)} finished.` }));
      const files = filesText(session.files);
      if (files) nodes.push(el(document, "p", { class: "axiosozo-presence-files", text: files }));
      const consoleText = consoleErrors === undefined ? null : consoleLine(consoleErrors, project);
      if (consoleText) {
        nodes.push(el(document, "p", { class: "axiosozo-presence-note", text: consoleText.text }));
        for (const text of consoleText.recent) nodes.push(el(document, "p", { class: "axiosozo-proof-console", text }));
      }
      if (!entry.fresh) nodes.push(el(document, "p", { class: "axiosozo-presence-note", text: "This page was open before the change. Reload it to see it." }));
      if (message) nodes.push(el(document, "p", { class: "axiosozo-presence-error", role: "alert", text: message }));
      return nodes;
    };
    const verdictActions = () => [
      entry.fresh ? null : { label: "Reload", onClick: () => { if (typeof gBrowser.reloadTab === "function") gBrowser.reloadTab(tab); else tab.linkedBrowser?.reload?.(); } },
      { label: "Not right…", onClick: () => noteView() },
      { label: "Looks right", primary: true, onClick: () => {
        hub.dismiss(session);
        try { ctx.agents.dismiss?.(session.id); } catch {}
        clear(tab);
      } },
    ];
    const verdictView = () => { card.setBody(verdictBody()); card.setActions(verdictActions()); };

    function noteView() {
      const id = `axiosozo-proof-note-${Math.random().toString(36).slice(2, 8)}`;
      const recent = consoleErrors?.recent?.filter(item => item?.level !== "warning") ?? [];
      const willPicture = (() => { try { return ctx.engineOf?.(tab) === "gecko"; } catch { return false; } })();
      const input = el(document, "input", { type: "text", id, class: "axiosozo-proof-input", maxlength: String(MAX_NOTE),
        placeholder: "For example: the button still does nothing", autocomplete: "off" });
      const send = async event => {
        const note = line(input.value, MAX_NOTE);
        if (!note) { input.focus(); return; }
        card.setThinking(`Sending to ${clientLabel(session)}…`);
        const picture = await capture(window, tab, { engineOf: ctx.engineOf });
        try {
          const started = await ctx.agents.startTask({ trigger: event, client: session.client, projectRoot: session.projectRoot,
            task: followUpTask(note, session), image: picture.image ?? null, pageUrl: tab.linkedBrowser?.currentURI?.spec ?? null,
            title: tab.label ?? null, consoleErrors: recent.map(item => line(item.text, 300)).slice(0, 5) });
          hub.dismiss(session);
          markWorking(tab, started);
          card.close("sent");
        } catch (error) {
          message = error?.reason ?? "It could not start.";
          noteView();
        }
      };
      input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.isComposing) { event.preventDefault(); send(event); }
      });
      const nodes = [
        el(document, "label", { class: "axiosozo-proof-label", for: id, text: "What is not right?" }), input,
        el(document, "p", { class: "axiosozo-presence-note", text: outgoingSentence(session.client, { image: willPicture, consoleErrors: recent.length }) }),
      ];
      if (message) nodes.push(el(document, "p", { class: "axiosozo-presence-error", role: "alert", text: message }));
      card.setBody(nodes);
      card.setActions([
        { label: "Back", quiet: true, onClick: () => { message = null; verdictView(); } },
        { label: `Send to ${clientLabel(session)}`, primary: true, onClick: event => send(event) },
      ]);
      try { input.focus(); } catch {}
    }

    verdictView();
    if (noteMode) noteView();
    // What the console owner holds for this project's pages in this window (null: it cannot tell).
    Promise.resolve().then(() => ctx.services?.projectHome?.({ window, id: session.projectId })).then(home => {
      consoleErrors = home?.console_errors ?? null;
      if (card.isOpen && !card.node.querySelector?.(".axiosozo-proof-input")) verdictView();
    }, () => { consoleErrors = null; });
  }

  // ---- tabs ----------------------------------------------------------------------------------------
  function onSelect(event) {
    const tab = event?.target;
    if (marks.get(tab)?.state === "verify") showStrip(tab);
  }
  function onClose(event) {
    const tab = event?.target;
    if (marks.has(tab)) { marks.delete(tab); if (strip?.tab === tab) strip.card.close("closed"); }
  }
  const progress = {
    onLocationChange(browser, webProgress, _request, _location, flags) {
      const tab = tabOfBrowser(browser);
      const entry = tab ? marks.get(tab) : null;
      if (!entry || webProgress?.isTopLevel === false || (flags & 0x1)) return; // same-document changes keep the page
      entry.fresh = true;
      // The page changed under the strip (a reload, the dev server's own refresh): show it again once there.
      if (entry.state === "verify" && gBrowser.selectedTab === tab) timers.setTimeout(() => { if (!disposed && gBrowser.selectedTab === tab) showStrip(tab); }, 400);
    },
  };
  gBrowser.tabContainer.addEventListener("TabSelect", onSelect, { signal: ctx.signal });
  gBrowser.tabContainer.addEventListener("TabClose", onClose, { signal: ctx.signal });
  gBrowser.addTabsProgressListener(progress);

  function dispose() {
    if (disposed) return;
    disposed = true;
    try { gBrowser.removeTabsProgressListener(progress); } catch {}
    try { gBrowser.tabContainer.removeEventListener("TabSelect", onSelect); } catch {}
    try { gBrowser.tabContainer.removeEventListener("TabClose", onClose); } catch {}
    offSource();
    unregister();
    strip?.card.close("disposed");
    for (const tab of [...marks.keys()]) clear(tab);
    source.dispose();
    for (const release of sheets) release();
  }
  ctx.signal?.addEventListener?.("abort", dispose, { once: true });
  return Object.freeze({ dispose, marks: () => new Map(marks), source });
}
