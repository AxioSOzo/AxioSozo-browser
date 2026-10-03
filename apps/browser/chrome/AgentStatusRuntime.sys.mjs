/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// P3 "Knowing what runs" and "Coming back" in one normal browser window
// (agent-channel-v1 §4 and §7). This window registers itself as a presenter of
// the process-wide agent channel. The channel decides which presenter is
// current (the most recently focused registered normal window) and never asks
// a private or unknown one. This module only presents:
//
// - A browser-session request from the agent bridge: one window notification
//   "Claude Code in Harbor Suite wants to use this browser" with "Allow for
//   this session" and "Deny". Only a trusted click on Allow resolves true;
//   Deny, closing it, the channel's 55 s limit, revocation and teardown all end
//   it as a denial, and a late click cannot allow.
// - A calm status line when an agent needs you, finished or failed:
//   "Harbor Suite: Claude Code is done", with "Go to project". Agents that just
//   started show nothing. Accepting a status never waits for this.
// - "Go to project": a remembered native return target (the tab a handoff
//   was copied from) is selected and reloaded only while its window, tab,
//   document, navigation, container and project still match; otherwise the
//   project's home opens. A hook's URL, path, title or PID is never used.
//
// Text is set as text, never markup. Nothing here starts the endpoint.
import { currentNavigationId } from "./AgentHandoffRuntime.sys.mjs";
import { defaultTimers, prefEnabled } from "./DevLoop.sys.mjs";

export const APPROVAL_NOTIFICATION = "axiosozo-agent-approval";
export const STATUS_NOTIFICATION = "axiosozo-agent-status";
const AGENT_NAMES = Object.freeze({ "claude-code": "Claude Code", codex: "Codex", other: "An agent" });
const STATE_TEXT = Object.freeze({ needs_input: "needs you", done: "is done", failed: "failed" });
const TAB_ID = /^t_[1-9][0-9]{0,15}$/u;
const INERT = Object.freeze({ dispose() {}, diagnostics: () => ({}) });

const oneLine = (value, max = 80) => (typeof value === "string" ? [...value.replace(/[\u0000-\u001f\u007f-\u009f]+/gu, " ").trim()].slice(0, max).join("") : "");

export function approvalMessage({ agent, project_name: name } = {}) {
  return `${AGENT_NAMES[agent] ?? AGENT_NAMES.other} in ${oneLine(name) || "a project"} wants to use this browser.`;
}

/** The status line, or null for states that do not need the user. */
export function statusMessage({ project_name: name, record } = {}) {
  const state = STATE_TEXT[record?.state];
  if (!state) return null;
  return `${oneLine(name) || "A project"}: ${AGENT_NAMES[record.agent] ?? AGENT_NAMES.other} ${state}.`;
}

/**
 * Installs the agent presenter for one normal browser window.
 * `services`: AxioSozoServices (registerAgentPresenter, activateAgentPresenter,
 * agentReturnTarget, captureHandoffAuthority, isNormalWindow). `adapter`:
 * ZenWorkspaceAdapter. `openOverview(fragment)` opens about:axiosozo.
 * `engineOf(tab)`: the engine a tab currently shows ("gecko" | "chromium"),
 * read only; without it no tab can be proven to show Gecko, so "Go to project"
 * always opens the project home.
 */
export function installAgentStatus(window, { services, adapter, openOverview = null, engineOf = null, timers = defaultTimers(window) } = {}) {
  if (typeof services?.registerAgentPresenter !== "function" || !adapter || !window?.gBrowser
    || !prefEnabled(window, "axiosozo.contexts.enabled", true)) return INERT;
  const normal = () => {
    try { return !window.closed && adapter.isPrivateWindow() === false && services.isNormalWindow?.(window) === true; } catch { return false; }
  };
  if (!normal()) return INERT;
  const gBrowser = window.gBrowser;
  const pending = new Set();
  const diagnostics = { approvals: 0, allowed: 0, denied: 0, statuses: 0, returns: 0, homes: 0, vetoed: 0 };
  let disposed = false, statusNotification = null, lastRecord = null, unregister = null;
  const box = () => window.gNotificationBox ?? null;
  const remove = notification => {
    if (!notification) return;
    try { box()?.removeNotification(notification); } catch {}
  };

  function requestApproval(view, { signal } = {}) {
    return new Promise(resolve => {
      const notifications = box();
      if (disposed || !normal() || signal?.aborted || !notifications) { resolve(false); return; }
      diagnostics.approvals++;
      const entry = { notification: null, settled: false };
      const finish = allowed => {
        if (entry.settled) return;
        entry.settled = true;
        pending.delete(entry);
        signal?.removeEventListener("abort", onAbort);
        remove(entry.notification);
        const granted = allowed === true && !disposed && !signal?.aborted && normal();
        if (granted) diagnostics.allowed++; else diagnostics.denied++;
        resolve(granted);
      };
      const onAbort = () => finish(false);
      entry.finish = finish;
      pending.add(entry);
      signal?.addEventListener("abort", onAbort, { once: true });
      Promise.resolve().then(() => notifications.appendNotification(APPROVAL_NOTIFICATION, {
        label: approvalMessage(view),
        priority: notifications.PRIORITY_INFO_HIGH,
        eventCallback: event => { if (event === "removed" || event === "dismissed") finish(false); },
      }, [
        { label: "Allow for this session", accessKey: "A", callback: (_n, _b, _t, event) => { finish(event?.isTrusted === true); return false; } },
        { label: "Deny", accessKey: "D", callback: () => { finish(false); return false; } },
      ])).then(notification => {
        entry.notification = notification;
        if (entry.settled) remove(notification);
      }, () => finish(false));
    });
  }

  async function goToProject(projectId, event) {
    if (disposed || event?.isTrusted !== true || !normal()) return;
    const target = services.agentReturnTarget?.(projectId) ?? null;
    const tab = target?.project_id === projectId && TAB_ID.test(target.tab_id)
      ? gBrowser.tabs.find(item => item?.linkedBrowser?.browserId === Number(target.tab_id.slice(2))) ?? null : null;
    // The remembered tab, proven again from native facts only: a known live
    // tab of this window that shows Gecko now (a Chromium view can keep a
    // hidden Gecko document), the same document, navigation and container.
    const facts = () => {
      try {
        const browser = tab?.linkedBrowser, context = browser?.browsingContext, global = context?.currentWindowGlobal;
        if (!tab || tab.closing !== false || tab.isConnected !== true || tab.documentGlobal !== window || !browser.permanentKey
          || !browser.frameLoader || context.usePrivateBrowsing !== false || !global || global.isClosed !== false
          || global.isCurrentGlobal !== true) return null;
        if (typeof engineOf !== "function" || engineOf(tab) !== "gecko") return null;
        const url = global.documentURI?.spec;
        const userContextId = global.documentPrincipal?.userContextId;
        if (typeof url !== "string" || url !== browser.currentURI?.spec || !/^https?:/u.test(url)
          || currentNavigationId(window, browser) !== target.navigation_id || userContextId !== target.user_context_id) return null;
        return { browser, frameLoader: browser.frameLoader, permanentKey: browser.permanentKey, global, url, userContextId };
      } catch { return null; }
    };
    const same = (a, b) => !!a && !!b && ["browser", "frameLoader", "permanentKey", "global", "url", "userContextId"].every(key => a[key] === b[key]);
    const first = facts();
    if (first) {
      let authority = null;
      try { authority = await services.captureHandoffAuthority({ window, tab, url: first.url, userContextId: first.userContextId }); }
      catch { authority = null; }
      const proven = () => !disposed && normal() && same(facts(), first) && authority?.check() === true && authority.project?.id === projectId;
      // The same Gecko document, container and project after the lookup.
      if (proven()) {
        try { gBrowser.selectedTab = tab; } catch { /* treated as a veto below */ }
        // Zen can veto a selection: reload only the tab and browser the user
        // is actually shown now, and only while everything still holds.
        if (gBrowser.selectedTab === tab && gBrowser.selectedBrowser === first.browser && proven()) {
          diagnostics.returns++;
          first.browser.reload();
          return;
        }
        if (gBrowser.selectedTab !== tab || gBrowser.selectedBrowser !== first.browser) diagnostics.vetoed++;
      }
    }
    // Whenever the target cannot be proven, the known project's home opens.
    if (disposed || !openOverview) return;
    diagnostics.homes++;
    openOverview(`#project=${projectId}`);
  }

  function onStatus({ project_id: projectId, project_name: name, record } = {}) {
    if (disposed || !normal()) return;
    const label = statusMessage({ project_name: name, record });
    if (!label || record?.id === lastRecord) return;
    const notifications = box();
    if (!notifications) return;
    lastRecord = record.id;
    diagnostics.statuses++;
    // One calm line per window: a newer status replaces the older one.
    remove(statusNotification);
    statusNotification = null;
    let shown = null;
    Promise.resolve().then(() => notifications.appendNotification(STATUS_NOTIFICATION, {
      label, priority: notifications.PRIORITY_INFO_LOW,
      eventCallback: event => { if (event === "removed" && shown && statusNotification === shown) statusNotification = null; },
    }, [{ label: "Go to project", accessKey: "G",
      callback: (_n, _b, _t, event) => { goToProject(projectId, event).catch(() => {}); return false; } }])).then(notification => {
      shown = notification;
      if (disposed || lastRecord !== record.id) { remove(notification); return; }
      statusNotification = notification;
    }, () => {});
  }

  try {
    unregister = services.registerAgentPresenter(window, { isNormal: () => !disposed && normal(), requestApproval, onStatus });
  } catch (error) {
    console.error("AxioSozo: agent presenter unavailable", error?.code ?? error);
    return INERT;
  }
  const onActivate = () => { if (!disposed) { try { services.activateAgentPresenter?.(window); } catch {} } };
  window.addEventListener("activate", onActivate);
  onActivate();

  return Object.freeze({
    /** Counts only; no project names, titles or paths. */
    diagnostics: () => ({ ...diagnostics, pending: pending.size, status_shown: !!statusNotification }),
    dispose() {
      if (disposed) return;
      disposed = true;
      window.removeEventListener("activate", onActivate);
      for (const entry of [...pending]) entry.finish(false);
      try { unregister?.(); } catch {}
      remove(statusNotification);
      statusNotification = null;
    },
  });
}
