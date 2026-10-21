/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Engine entry in Zen's tab context menu, driven by EngineRegistry: a single
// "Open in <engine>" item while at most two engines are available, and an
// "Open in" submenu once there are more. Chrome-owned; no page is touched.
import { tabMenuModel } from "./EngineRegistry.sys.mjs";

// One menu per window. A later installer (the three-engine controls over the
// Chromium presenter) takes the menu over until it disposes; the earlier one is
// then in charge again. Window scripts and modules share the slot by registry symbol.
const MENU_SLOT = Symbol.for("axiosozo.engine-tab-menu");

/**
 * `engineOf(tab)` → engine id; `setTabEngine(tab, id)` → Promise. Returns
 * `{ dispose() }`, or null when the tab menu does not exist.
 */
export function installEngineTabMenu(window, { engineOf, setTabEngine, onFailure = () => {}, availability = null }) {
  // `availability(tab, id)` → null, or {available:false, reason} for an engine this tab cannot use now.
  const delegate = { engineOf, setTabEngine, onFailure, availability };
  const existing = window[MENU_SLOT];
  if (existing) {
    existing.delegates.push(delegate);
    return { dispose() { existing.release(delegate); } };
  }
  const document = window.document;
  const menu = document.getElementById?.("tabContextMenu");
  if (!menu) return null;
  const delegates = [delegate];
  const current = () => delegates[delegates.length - 1];
  const item = document.createXULElement("menuitem");
  item.id = "axiosozo-context-engine";
  const submenu = document.createXULElement("menu");
  submenu.id = "axiosozo-context-engine-menu";
  const popup = document.createXULElement("menupopup");
  submenu.appendChild(popup);
  const elements = [item, submenu];
  const contextTab = () => window.TabContextMenu?.contextTab;
  let toggleTarget = null;

  const choose = (tab, id) => {
    const owner = current();
    if (tab && id && id !== owner.engineOf(tab)) Promise.resolve(owner.setTabEngine(tab, id)).catch(owner.onFailure);
  };

  // Firefox's MenuSectionLayout rearranges this menu on popupshowing and
  // rejects unknown items anywhere but the trailing (extensions) run. Keep
  // the items trailing while closed; place them by Reload Tab once arranged.
  const showing = event => {
    if (event.target !== menu) return;
    const tab = contextTab();
    const usable = tab && !window.PrivateBrowsingUtils?.isWindowPrivate?.(window);
    const model = usable ? tabMenuModel(current().engineOf(tab), window) : { mode: "hidden", items: [] };
    for (const entry of model.items) {
      let state = null;
      try { state = current().availability?.(tab, entry.id) ?? null; } catch {}
      if (state && state.available === false && !entry.checked) Object.assign(entry, { disabled: true, reason: state.reason, note: state.reason });
    }
    item.hidden = model.mode !== "toggle";
    submenu.hidden = model.mode !== "submenu";
    toggleTarget = null;
    if (model.mode === "toggle") {
      item.setAttribute("label", model.label);
      if (model.items[0].note) item.setAttribute("acceltext", model.items[0].note); else item.removeAttribute?.("acceltext");
      if (model.items[0].disabled) item.setAttribute("disabled", "true"); else item.removeAttribute?.("disabled");
      toggleTarget = model.items[0].id;
    } else if (model.mode === "submenu") {
      submenu.setAttribute("label", model.label);
      popup.replaceChildren(...model.items.map(entry => {
        const entryItem = document.createXULElement("menuitem");
        entryItem.setAttribute("label", entry.label);
        entryItem.setAttribute("type", "radio");
        entryItem.setAttribute("name", "axiosozo-context-engine-choice");
        entryItem.setAttribute("data-axiosozo-engine", entry.id);
        if (entry.checked) entryItem.setAttribute("checked", "true");
        if (entry.disabled) entryItem.setAttribute("disabled", "true");
        if (entry.reason && entry.disabled && !entry.checked) entryItem.setAttribute("tooltiptext", entry.reason);
        if (entry.note && !entry.checked) entryItem.setAttribute("acceltext", entry.note);
        return entryItem;
      }));
    }
    const anchor = document.getElementById("context_reloadSelectedTabs") ?? document.getElementById("context_reloadTab");
    if (anchor?.parentNode === menu) { anchor.after(item); item.after(submenu); }
  };
  const hidden = event => { if (event.target === menu) for (const element of elements) menu.appendChild(element); };
  const onItem = () => choose(contextTab(), toggleTarget);
  const onChoice = event => choose(contextTab(), event.target?.getAttribute?.("data-axiosozo-engine"));

  item.addEventListener("command", onItem);
  popup.addEventListener("command", onChoice);
  menu.addEventListener("popupshowing", showing);
  menu.addEventListener("popuphidden", hidden);
  for (const element of elements) { element.hidden = true; menu.appendChild(element); }
  const teardown = () => {
    menu.removeEventListener("popupshowing", showing); menu.removeEventListener("popuphidden", hidden);
    item.removeEventListener("command", onItem); popup.removeEventListener("command", onChoice);
    for (const element of elements) element.remove();
    if (window[MENU_SLOT] === slot) delete window[MENU_SLOT];
  };
  const slot = { delegates, release(owner) {
    const index = delegates.lastIndexOf(owner);
    if (index >= 0) delegates.splice(index, 1);
    if (!delegates.length) teardown();
  } };
  window[MENU_SLOT] = slot;
  return { dispose() { slot.release(delegate); } };
}
