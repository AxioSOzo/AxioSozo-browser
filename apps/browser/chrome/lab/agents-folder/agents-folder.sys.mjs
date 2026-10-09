/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Lab experiment "agents-folder" (docs/lab/experiments/agents-folder.md), one
// of two takes on agent presence (the other: agents-on-rows). Each space gets
// a Zen live folder "Agents" while its projects have agent sessions; each
// session is a tab in it:
//
//   title     "Harbor · fix the retry button"
//   sublabel  "Claude Code · working: editing index.html" / "… · needs you" /
//             "… · done: Fixed the retry handler" / "… · failed: …"
//             (amber when it needs you, red when it failed)
//   icon      the agent's mark with its state (until the tab is opened)
//   page      the project's local page (a web project), else its project home
//
// Clicking an item opens its page in that tab (Zen loads it then, as for any
// live-folder item; nothing is reloaded) with the result card over it: the
// agent's sentence, the files it changed, Reload, Continue in Terminal (the
// way back when it needs you), Stop, Dismiss. Closing the tab dismisses the
// item (it comes back if that run later needs you or finishes); finished
// items leave after a day. The attention rule is the same as the other take:
// only "needs you" raises a toast, in one window.
//
// The folders are Zen's own (live-folder.sys.mjs); this module writes each
// shown item's live state onto its tabs in this window and opens the card.
import { useStylesheet } from "../kit.sys.mjs";
import { installAttention } from "../presence/attention.sys.mjs";
import { presenceHub } from "../presence/hub.sys.mjs";
import { agentIcon } from "../presence/icons.sys.mjs";
import { openResultCard } from "../presence/result-card.sys.mjs";
import { watchPresence } from "../presence/source.sys.mjs";
import { LIVE_ITEM_ATTRIBUTE, SUBLABEL_ATTRIBUTE, SUBLABEL_SELECTOR, localUrlOf, projectHomeUrl, tabIsLoaded } from "../presence/tabs.sys.mjs";
import { sharedFolderController, splitItemId } from "./live-folder.sys.mjs";

export const PRESENCE_STYLESHEET = "chrome://browser/content/axiosozo/lab/presence/presence.css";
export const FOLDER_STYLESHEET = "chrome://browser/content/axiosozo/lab/agents-folder/agents-folder.css";
export const STATE_ATTRIBUTE = "axiosozo-agent-state";
export const SWITCH_PREF = "axiosozo.lab.agents-folder.enabled";
/** How long a just-selected item may take to show its page before its card gives up. */
export const CARD_WAIT_MS = 8000;

/** What Zen's live folder gets for one presence item. */
export function liveItemOf(item, project) {
  return Object.freeze({ id: item.id, title: item.title, subtitle: item.subtitle, icon: agentIcon(item.session.client, item.state),
    url: localUrlOf(project) ?? projectHomeUrl(project ?? { id: item.projectId }) });
}

/** The published items per space: Map(space → [live item]). Items without a space are not in any folder. */
export function liveItemsBySpace(items, projectById) {
  const bySpace = new Map();
  for (const item of items) {
    if (!item.spaceUuid) continue;
    if (!bySpace.has(item.spaceUuid)) bySpace.set(item.spaceUuid, []);
    bySpace.get(item.spaceUuid).push(liveItemOf(item, projectById(item.projectId)));
  }
  return bySpace;
}

const prefOn = window => { try { return window.Services?.prefs?.getBoolPref?.(SWITCH_PREF, false) === true; } catch { return false; } };
const quitting = window => { try { return window.Services?.startup?.shuttingDown === true; } catch { return false; } };

export function installAgentsFolder(window, ctx, { hub = presenceHub, folders = null, clock = undefined, timers = undefined,
  turnedOff = () => !prefOn(window) && !quitting(window) } = {}) {
  const document = window.document;
  const gBrowser = window.gBrowser;
  const controller = folders ?? sharedFolderController();
  controller.attach();
  const sheets = [useStylesheet(document, PRESENCE_STYLESHEET), useStylesheet(document, FOLDER_STYLESHEET)];
  const source = watchPresence(window, ctx, { hub, ...(clock ? { clock } : {}), ...(timers ? { timers } : {}) });
  const wait = timers ?? window;
  let disposed = false;
  let pendingCard = null; // { tab, listener, timer }
  const iconsSet = new WeakMap(); // tab → icon we set
  const touched = new Set(); // tabs we wrote on (for dispose)

  /** The session id of one of our item tabs, or null. */
  const itemIdOf = tab => {
    const parts = splitItemId(tab?.getAttribute?.(LIVE_ITEM_ATTRIBUTE));
    return parts && controller.isOurs(parts.folderId) ? parts.itemId : null;
  };

  function showCardOverPage(session, event, error = null) {
    const browser = gBrowser?.selectedBrowser;
    if (!browser) return null;
    return openResultCard(window, ctx, { source, hub, sessionId: session.id, place: { browser }, overTab: gBrowser.selectedTab, focus: true, error });
  }
  const attention = installAttention(window, ctx, { source, hub, showCard: showCardOverPage, ...(clock ? { clock } : {}) });

  // ---- each shown item's state, written onto its tabs here ----------------------------------------
  function setSublabel(tab, text) {
    if (tab.getAttribute(SUBLABEL_ATTRIBUTE) === text) return;
    tab.setAttribute(SUBLABEL_ATTRIBUTE, text);
    const label = tab.querySelector?.(SUBLABEL_SELECTOR);
    try { if (label) document.l10n?.setArgs?.(label, { tabSubtitle: text }); } catch {}
  }
  function forget(tab) {
    touched.delete(tab);
    try { tab.removeAttribute(STATE_ATTRIBUTE); tab.removeAttribute("aria-description"); } catch {}
  }
  function applyToTabs() {
    if (disposed) return;
    for (const tab of [...touched]) if (!itemIdOf(tab)) forget(tab); // dragged out of the folder: an ordinary tab now
    for (const tab of [...(gBrowser?.tabs ?? [])]) {
      const id = itemIdOf(tab);
      if (!id) continue;
      const item = source.item(id);
      if (!item) continue;
      touched.add(tab);
      setSublabel(tab, item.subtitle);
      tab.setAttribute(STATE_ATTRIBUTE, item.state);
      tab.setAttribute("aria-description", `${item.label}. ${item.subtitle}`);
      // An opened item shows its page's own icon; one not opened yet shows the agent's state.
      if (!tabIsLoaded(tab)) {
        const icon = agentIcon(item.session.client, item.state);
        if (iconsSet.get(tab) !== icon) {
          try { gBrowser.setIcon(tab, icon); iconsSet.set(tab, icon); } catch {}
        }
      }
    }
  }

  function publish() {
    if (disposed || !source.projectsLoaded()) return;
    let spaces = [];
    try { spaces = (ctx.adapter?.listWorkspaces?.() ?? []).map(space => space.uuid); } catch { spaces = []; }
    controller.publish(liveItemsBySpace(source.items(), source.projectById), { spaces });
    applyToTabs();
  }

  // ---- selecting an item: its page, with the result card over it -----------------------------------
  function cancelPendingCard() {
    if (!pendingCard) return;
    try { gBrowser.removeTabsProgressListener(pendingCard.listener); } catch {}
    try { wait.clearTimeout(pendingCard.timer); } catch {}
    pendingCard = null;
  }
  function cardFor(tab, id) {
    if (disposed || gBrowser.selectedTab !== tab || !source.session(id)) return;
    openResultCard(window, ctx, { source, hub, sessionId: id, place: { browser: tab.linkedBrowser }, overTab: tab, focus: false });
  }
  function onSelect(event) {
    cancelPendingCard();
    const tab = event?.target;
    const id = itemIdOf(tab);
    if (!id) return;
    const spec = tab.linkedBrowser?.currentURI?.spec ?? "";
    if (tabIsLoaded(tab) && spec && spec !== "about:blank") { wait.setTimeout(() => cardFor(tab, id), 0); return; }
    // A lazy item loads its page now; the card waits for that page, or it would close on its first navigation.
    const listener = {
      onLocationChange(browser, webProgress) {
        if (browser !== tab.linkedBrowser || webProgress?.isTopLevel === false) return;
        if ((browser.currentURI?.spec ?? "about:blank") === "about:blank") return;
        cancelPendingCard();
        wait.setTimeout(() => cardFor(tab, id), 0);
      },
    };
    pendingCard = { tab, listener, timer: wait.setTimeout(cancelPendingCard, CARD_WAIT_MS) };
    gBrowser.addTabsProgressListener(listener);
  }

  // ---- closing an item: the user dismisses it (Zen's own removals are not dismissals) --------------
  function onClose(event) {
    const tab = event?.target;
    if (pendingCard?.tab === tab) cancelPendingCard();
    const id = itemIdOf(tab);
    if (!id || !controller.isPublished(id)) return;
    const session = source.session(id);
    if (!session) return;
    hub.dismiss(session);
    if (session.origin === "browser" && ["done", "failed", "stopped", "needs_you"].includes(session.state)) {
      try { ctx.agents.dismiss?.(id); } catch {}
    }
  }

  gBrowser.tabContainer.addEventListener("TabSelect", onSelect, { signal: ctx.signal });
  gBrowser.tabContainer.addEventListener("TabClose", onClose, { signal: ctx.signal });
  const offSource = source.subscribe(publish);
  const offSynced = controller.onSynced(applyToTabs);
  publish();

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelPendingCard();
    try { gBrowser.tabContainer.removeEventListener("TabSelect", onSelect); } catch {}
    try { gBrowser.tabContainer.removeEventListener("TabClose", onClose); } catch {}
    offSource();
    offSynced();
    attention.dispose();
    source.dispose();
    for (const tab of [...touched]) forget(tab);
    controller.detach({ teardown: turnedOff() });
    for (const release of sheets) release();
  }
  ctx.signal?.addEventListener?.("abort", dispose, { once: true });
  return Object.freeze({ dispose, source });
}
