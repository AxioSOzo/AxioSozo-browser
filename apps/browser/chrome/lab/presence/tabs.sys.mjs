/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Tabs and a project's own pages, for the presence experiments.
//
//  - localUrlOf(project): the page an agent's result is checked on: the
//    project's local environment (or the first local server it declares).
//  - projectTabs(window, project, …): the open tabs that show that project's
//    local pages (core.matchProjectForUrl, as DevLoop links tabs), the
//    selected one first, then the most recently used. Never a Lab item tab.
//  - setTabSubtitle / clearTabSubtitle: Zen's own second line under a tab's
//    title (the zen-show-sublabel attribute and the .zen-tab-sublabel label,
//    as Zen's live folders and share manager write it), restored as it was.
//
// Nothing here reloads or navigates a tab.
import { localAddress } from "../../ProjectRunner.sys.mjs";
import { matchProjectForUrl, orderedEnvironments } from "../../contexts/index.mjs";

export const SUBLABEL_ATTRIBUTE = "zen-show-sublabel";
export const SUBLABEL_SELECTOR = ".zen-tab-sublabel";
export const LIVE_ITEM_ATTRIBUTE = "zen-live-folder-item-id";
// Zen's own default arguments for the sublabel (zen-vertical-tabs.ftl).
const DEFAULT_SUBTITLE = "zen-default-pinned";

const webUrl = spec => {
  const url = typeof spec === "string" ? URL.parse(spec) : null;
  return url && ["http:", "https:"].includes(url.protocol) ? url : null;
};

/** The project's local page: its local environment, else the first local server it declares; null for none. */
export function localUrlOf(project) {
  let environments = [];
  try { environments = orderedEnvironments(project) ?? []; } catch { environments = []; }
  for (const environment of environments) {
    const url = localAddress(environment?.base_url);
    if (url) return url.href;
  }
  for (const service of Array.isArray(project?.manifest?.services) ? project.manifest.services : []) {
    const url = localAddress(service?.url);
    if (url) return url.href;
  }
  return null;
}

/** The project home in about:axiosozo, for a project without a local page. */
export const projectHomeUrl = project => `about:axiosozo#project=${encodeURIComponent(project?.id ?? "")}`;

/** Which project a tab shows a local page of (an id), or null. */
export function projectIdOfTab(tab, projects, { workspaceOf = () => null } = {}) {
  const url = webUrl(tab?.linkedBrowser?.currentURI?.spec);
  if (!url || !localAddress(url.href)) return null;
  let contextUuid;
  try { contextUuid = workspaceOf(tab) ?? undefined; } catch { contextUuid = undefined; }
  try {
    const match = matchProjectForUrl(projects, url.href, { contextUuid })?.project_id ?? null;
    if (match) return match;
  } catch {}
  // A project that declares its local server only (no local environment): the same port on this Mac.
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  const owners = (Array.isArray(projects) ? projects : []).filter(project => (Array.isArray(project?.manifest?.services) ? project.manifest.services : [])
    .some(service => { const local = localAddress(service?.url); return local && local.protocol === url.protocol && (local.port || "80") === port; }));
  const inSpace = owners.filter(project => contextUuid !== undefined && project.context_uuid === contextUuid);
  return (inSpace[0] ?? owners[0])?.id ?? null;
}

/** The open tabs of `projectId`'s local pages in this window: the selected one first, then the most recently used. */
export function projectTabs(window, projectId, projects, { workspaceOf = () => null } = {}) {
  const gBrowser = window?.gBrowser;
  const tabs = [...(gBrowser?.tabs ?? [])].filter(tab => tab && !tab.closing && !tab.hasAttribute?.(LIVE_ITEM_ATTRIBUTE)
    && projectIdOfTab(tab, projects, { workspaceOf }) === projectId);
  return tabs.sort((a, b) => Number(b === gBrowser.selectedTab) - Number(a === gBrowser.selectedTab) || (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0));
}

/** "localhost:5173" for a tab's page. */
export const hostOfTab = tab => webUrl(tab?.linkedBrowser?.currentURI?.spec)?.host ?? "";

/** Whether a tab shows its page (not a lazy or pending tab that never loaded). */
export const tabIsLoaded = tab => !!tab?.linkedPanel && !tab.hasAttribute?.("pending");

const previous = new WeakMap(); // tab → the sublabel it had before ours (null: none)

/** Sets Zen's second line under a tab's title; the first call remembers what was there. */
export function setTabSubtitle(window, tab, text) {
  if (!tab?.setAttribute) return;
  if (!previous.has(tab)) previous.set(tab, tab.hasAttribute(SUBLABEL_ATTRIBUTE) ? tab.getAttribute(SUBLABEL_ATTRIBUTE) : null);
  if (tab.getAttribute(SUBLABEL_ATTRIBUTE) === text) return;
  tab.setAttribute(SUBLABEL_ATTRIBUTE, text);
  const label = tab.querySelector?.(SUBLABEL_SELECTOR);
  try { if (label) window.document.l10n?.setArgs?.(label, { tabSubtitle: text }); } catch {}
}

/** Puts back the second line a tab had before setTabSubtitle (or none). */
export function clearTabSubtitle(window, tab) {
  if (!tab?.removeAttribute || !previous.has(tab)) return;
  const before = previous.get(tab);
  previous.delete(tab);
  if (before === null) tab.removeAttribute(SUBLABEL_ATTRIBUTE);
  else tab.setAttribute(SUBLABEL_ATTRIBUTE, before);
  const label = tab.querySelector?.(SUBLABEL_SELECTOR);
  try { if (label) window.document.l10n?.setArgs?.(label, { tabSubtitle: before ?? DEFAULT_SUBTITLE }); } catch {}
}
