/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// "Today" as a sheet (AxioSozo Lab; docs/lab/experiments/today-sheet.md):
// once a day, on the first window focus after 05:00 local, one short sheet
// opens as a normal tab, about:axiosozo#today (a day with nothing on it gets a
// toast saying so, with Show, instead of a tab). It lists, each line a link and
// composed without a model: agent sessions waiting for you, failed and
// finished since you last looked; projects whose servers stopped with an
// error; errands due (when Errands is on). Nothing else: no feed, no news, no
// widgets. "Suggest a first thing", on the page and only on a click, asks the
// user's own AI to pick one line with a one-sentence why (and says so). The
// tab closes like any tab and is never pinned.
//
// On demand: "Today" in the space menu (right-click the space name, or click
// it in the space switcher) and the Today link on about:axiosozo while this
// experiment is on.
//
// This window part only decides when to open the sheet, adds the menu entry
// and, while on, keeps the today data noting agent sessions that end (so the
// morning still knows what finished overnight). The page reads everything
// through its actor (AboutAxioSozoParent getToday and friends, today-page.sys.mjs).

import { todayData } from "./today-data.sys.mjs";

export const TODAY_HASH = "#today";
export const MENU_ITEM_ID = "axiosozo-lab-today-menu";
const OVERVIEW = /^about:axiosozo(?:[?#]|$)/u;

export function installTodaySheet(window, ctx) {
  return createTodaySheet(window, ctx, { data: todayData({ services: ctx.services }) });
}

/** deps: data (today-data). */
export function createTodaySheet(window, ctx, { data } = {}) {
  const { document } = window;
  const cleanups = [];
  let disposed = false;
  const open = () => { try { ctx.openOverview?.(TODAY_HASH); } catch (error) { console.error("AxioSozo Lab: today could not open", error); } };

  // The first focus of a normal window after 05:00, once per local day (every window shares the claim).
  // A day with nothing on the sheet gets no tab: one calm toast says so, with Show.
  async function onFocus(event) {
    if (disposed || (event && event.target !== window && event.target !== document)) return;
    if (typeof ctx.openOverview !== "function") return;
    let claimed = false;
    try { claimed = await data.claimDailyOpen(); } catch (error) { console.error("AxioSozo Lab: today could not be read", error); }
    if (!claimed || disposed) return;
    let counts = null;
    try { counts = (await data.digest()).counts; } catch { counts = null; }
    if (disposed) return;
    if (counts && !Object.values(counts).some(Boolean)) {
      ctx.toast?.({ title: "Today: nothing needs you", description: "Nothing waiting, failed, finished or due since you last looked.",
        button: { label: "Show", onCommand: open }, timeoutMs: 6000 });
      return;
    }
    open();
  }
  window.addEventListener("activate", onFocus, { signal: ctx.signal });
  window.addEventListener("focus", onFocus, { signal: ctx.signal });
  // Already focused when installed (the browser just started): that is the first focus. Not while
  // you are on about:axiosozo, where the switch was just turned on: the next focus opens it.
  try {
    const spec = window.gBrowser?.selectedBrowser?.currentURI?.spec ?? "";
    if (document.hasFocus?.() && !OVERVIEW.test(spec)) onFocus(null);
  } catch {}

  // "Today" in the space menu.
  const popup = (() => { try { return ctx.adapter?.workspaceMenu?.() ?? null; } catch { return null; } })();
  if (popup && typeof document.createXULElement === "function" && typeof ctx.openOverview === "function") {
    const item = document.createXULElement("menuitem");
    item.id = MENU_ITEM_ID;
    item.setAttribute("label", "Today");
    const onCommand = event => { if (event.isTrusted !== false) open(); };
    item.addEventListener("command", onCommand);
    const anchor = document.getElementById("axiosozo-context-menu-add-project") ?? document.getElementById("axiosozo-context-menu-projects");
    if (anchor?.parentNode === popup) popup.insertBefore(item, anchor.nextSibling ?? null);
    else popup.append(item);
    cleanups.push(() => { item.removeEventListener("command", onCommand); item.remove(); });
  }

  cleanups.push(data.acquire());
  try { ctx.agents?.watchExternal?.(); } catch {} // ends with ctx.signal

  return {
    /** For tests and the lead: what the next focus would do. */
    focusForTesting: () => onFocus(null),
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const cleanup of cleanups.reverse()) { try { cleanup(); } catch {} }
      data.forgetIfOff();
    },
  };
}
