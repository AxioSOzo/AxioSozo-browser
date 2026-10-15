/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The way back to an agent's result: one small Zen card (kit floatingCard),
// never a chat. It shows the agent's own closing sentence (or the honest
// reason it stopped, failed or waits), the files the run changed (read by the
// browser with git, not taken from the agent), cost and time, and the actions
// that make sense right now:
//   Reload <the project's tab>   only when the run changed files and that tab
//                                shows the project's local page; explicit, the
//                                browser never reloads a page on its own
//   Continue in Terminal         ctx.agents hand-over (resume the session there)
//   Open in Claude               the Claude app's resume link, when it is there
//   Stop                         while a run this browser started still works
//   Dismiss                      hides it everywhere (until it needs you again)
// It follows the session live while open (a working run's step, then its
// result). One card per window: opening another closes it.
import { el, floatingCard } from "../kit.sys.mjs";
import { agentIcon } from "./icons.sys.mjs";
import { changedFiles, clientLabel, costTimeText, filesText, isFinished, leadText, line, presenceState, projectName, stateWord, titleOf } from "./model.sys.mjs";
import { hostOfTab, projectIdOfTab, projectTabs } from "./tabs.sys.mjs";

export const CARD_WIDTH = 372;
const open = new WeakMap(); // window → card

/** A rect beside the sidebar at `element`'s height, where a card about that row goes (right of it, or left for a right-hand sidebar). */
export function besideSidebar(window, element) {
  let rect = null;
  try { rect = element?.getBoundingClientRect?.() ?? null; } catch { rect = null; }
  if (!rect) return null;
  let edge = null;
  try { edge = window.document.getElementById("navigator-toolbox")?.getBoundingClientRect?.() ?? null; } catch { edge = null; }
  let right = false;
  try { right = window.Services?.prefs?.getBoolPref?.("zen.tabs.vertical.right-side", false) === true; } catch { right = false; }
  const top = rect.top ?? rect.y;
  if (right) {
    const x = Math.min(rect.left ?? rect.x, edge?.left ?? Infinity) - 8;
    return { anchor: { x, y: top - 8, width: 0, height: 0 }, align: "end" };
  }
  const x = Math.max((rect.left ?? rect.x) + rect.width, Number.isFinite(edge?.right) ? edge.right : 0) + 8;
  return { anchor: { x, y: top - 8, width: 0, height: 0 }, align: "start" };
}

/** What a card offers for `session`: [{ id, label, primary, quiet, title }], in the order shown. */
export function cardActions(session, { reloadTab = null, overTab = null, claudeApp = false } = {}) {
  const state = presenceState(session);
  const finished = isFinished(state);
  const external = session?.origin === "external";
  const stillOpenElsewhere = external && (state === "working" || state === "needs_you");
  const actions = [];
  const reload = finished && reloadTab && changedFiles(session?.files) > 0;
  actions.push({ id: "dismiss", label: "Dismiss", quiet: true, title: state === "working" ? "Hide it until it needs you or finishes" : "Hide it" });
  if (session?.canStop === true && state === "working") actions.push({ id: "stop", label: session.stopping ? "Stopping…" : "Stop", disabled: session.stopping === true });
  // The Claude app as the other way back, while the card has room (no Reload to offer).
  if (claudeApp && !reload && session?.client === "claude-code" && !external && state !== "working" && session?.canResume) {
    actions.push({ id: "claude-app", label: "Open in Claude", quiet: true });
  }
  // Needs you: continuing is the way back. A finished run that changed files: seeing its page is.
  if (session?.canResume === true && !stillOpenElsewhere) actions.push({ id: "terminal", label: "Continue in Terminal", primary: state === "needs_you" });
  // "Reload Harbor": the project's tab, by the name the sidebar shows (its address in the tooltip).
  if (reload) {
    actions.push({ id: "reload", label: reloadTab === overTab ? "Reload page" : `Reload ${projectName(session)}`, primary: true,
      title: `Reload ${hostOfTab(reloadTab) || "its page"}` });
  }
  return actions;
}

/** Where a session waits or runs when the browser cannot take you there. */
export function elsewhereNote(session) {
  if (session?.origin !== "external") return null;
  const state = presenceState(session);
  if (state === "needs_you") return `It is open where it was started. Answer it in ${clientLabel(session)} there.`;
  if (state === "working") return `It runs where it was started, in ${clientLabel(session)}.`;
  return null;
}

/**
 * Opens the card for one session. `place`: { anchor, align } (besideSidebar)
 * or { browser } (over that page, at the top). `overTab`: the tab whose page
 * the card is over. `error`: a sentence to show at once (a hand-over that
 * failed before the card). Returns the card, or null.
 */
export function openResultCard(window, ctx, { source, hub, sessionId, place, overTab = null, focus = true, error = null, onClose = null }) {
  const document = window.document;
  open.get(window)?.close("replaced");
  const first = source.session(sessionId) ?? ctx.agents.get?.(sessionId) ?? null;
  if (!first) return null;
  let session = first;
  let message = error;
  let claudeApp = false;
  let lastRender = null;
  const anchor = place?.browser ? { browser: place.browser } : place?.anchor;
  const card = floatingCard(window, { anchor, title: titleOf(session), width: CARD_WIDTH, align: place?.align ?? "start", focus,
    signal: ctx.signal, onClose: reason => { off(); offHub(); if (open.get(window) === card) open.delete(window); onClose?.(reason); } });
  if (!card) return null;
  card.node.classList.add("axiosozo-presence-card");
  open.set(window, card);

  const workspaceOf = tab => ctx.adapter?.workspaceForTab?.(tab) ?? null;
  const reloadTabOf = () => {
    const projects = source.projects();
    // The page the card is over, when it is the project's (an Agents folder item too), else its most recent tab.
    if (overTab && !overTab.closing && projectIdOfTab(overTab, projects, { workspaceOf }) === session.projectId) return overTab;
    return projectTabs(window, session.projectId, projects, { workspaceOf })[0] ?? null;
  };

  function body() {
    const state = presenceState(session);
    const nodes = [];
    const status = el(document, "p", { class: "axiosozo-presence-status", "data-state": state },
      el(document, "img", { class: "axiosozo-presence-icon", src: agentIcon(session.client, state), alt: "", role: "presentation" }),
      el(document, "span", { text: `${clientLabel(session)} · ${stateWord(session)}` }));
    nodes.push(status);
    nodes.push(el(document, "p", { class: "axiosozo-lab-card-text axiosozo-presence-lead", text: leadText(session) }));
    // What it got to before it stopped to ask, in its own words.
    if (state === "needs_you" && line(session.summary, 240)) nodes.push(el(document, "p", { class: "axiosozo-presence-note", text: `“${line(session.summary, 240)}”` }));
    const note = elsewhereNote(session);
    if (note) nodes.push(el(document, "p", { class: "axiosozo-presence-note", text: note }));
    const files = filesText(session.files);
    if (files) {
      nodes.push(el(document, "p", { class: "axiosozo-presence-files" }, el(document, "span", { text: files }),
        session.files?.summary ? el(document, "span", { class: "axiosozo-presence-muted", text: ` · ${line(session.files.summary, 90)}` }) : null));
    } else if (isFinished(state) && session.mayEdit !== false && session.files && !changedFiles(session.files)) {
      nodes.push(el(document, "p", { class: "axiosozo-presence-files axiosozo-presence-muted", text: "No files changed." }));
    }
    const already = Number(session.files?.already) || 0;
    if (already > 0) {
      nodes.push(el(document, "p", { class: "axiosozo-presence-note",
        text: `${already === 1 ? "1 file was" : `${already} files were`} already changed before it started.` }));
    }
    const meta = [costTimeText(session), line(session.rateLimit, 120) || null].filter(Boolean);
    if (meta.length) nodes.push(el(document, "p", { class: "axiosozo-presence-meta", text: meta.join(" · ") }));
    if (message) nodes.push(el(document, "p", { class: "axiosozo-presence-error", role: "alert", text: message }));
    return nodes;
  }

  async function act(id, event) {
    message = null;
    try {
      if (id === "dismiss") {
        hub.dismiss(session);
        if (session.origin === "browser" && isFinished(presenceState(session))) ctx.agents.dismiss?.(session.id);
        card.close("dismissed");
        return;
      }
      if (id === "stop") { await ctx.agents.stop(session.id); return; }
      if (id === "terminal") { await ctx.agents.continueInTerminal(session.id, { trigger: event }); hub.markSeen(session); card.close("handed-over"); return; }
      if (id === "claude-app") { await ctx.agents.openIn("claude-resume", { trigger: event, sessionId: session.sessionId }); hub.markSeen(session); card.close("handed-over"); return; }
      if (id === "reload") {
        const tab = reloadTabOf();
        if (!tab) { message = "Its page is no longer open."; render(true); return; }
        hub.markSeen(session);
        if (typeof window.gBrowser?.reloadTab === "function") window.gBrowser.reloadTab(tab);
        else tab.linkedBrowser?.reload?.();
        if (tab !== overTab) card.close("reloaded");
      }
    } catch (failure) {
      message = failure?.reason ?? "That did not work.";
      render(true);
    }
  }

  function render(force = false) {
    if (!card.isOpen) return;
    const reloadTab = reloadTabOf();
    const actions = cardActions(session, { reloadTab, overTab, claudeApp });
    const key = JSON.stringify([session, message, actions.map(action => [action.id, action.label, action.primary, action.disabled])]);
    if (!force && key === lastRender) return;
    lastRender = key;
    const focused = card.node.contains?.(document.activeElement) ? document.activeElement?.textContent : null;
    card.setTitle(titleOf(session));
    card.node.setAttribute("data-state", presenceState(session));
    card.setBody(body());
    card.setActions(actions.map(action => ({ label: action.label, primary: action.primary === true, quiet: action.quiet === true, title: action.title ?? null,
      disabled: action.disabled === true, onClick: event => { act(action.id, event); } })));
    if (focused) {
      for (const node of card.node.querySelectorAll?.("button") ?? []) if (node.textContent === focused) { try { node.focus(); } catch {} break; }
    }
  }

  const off = source.subscribe(() => {
    const next = source.session(sessionId);
    if (!next) { message = message ?? "This session is no longer listed."; render(true); return; }
    session = next;
    if (isFinished(presenceState(session))) hub.markSeen(session);
    render();
  });
  const offHub = hub.onChange(() => render());
  if (isFinished(presenceState(session))) hub.markSeen(session);
  render(true);
  if (session.client === "claude-code" && session.origin === "browser") {
    Promise.resolve(ctx.agents.handoverTargets?.({ client: session.client, sessionId: session.sessionId })).then(targets => {
      claudeApp = Array.isArray(targets) && targets.some(target => target?.target === "claude-resume" && target.available === true);
      if (claudeApp) render();
    }, () => {});
  }
  return card;
}

/** The card open in this window, if any (for tests and dispose). */
export const openCardOf = window => open.get(window) ?? null;
