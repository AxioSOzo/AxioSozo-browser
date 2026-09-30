/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Engine entry in Zen's tab context menu, driven by EngineRegistry: a single
// "Open in <engine>" item while at most two engines are available, and an
// "Open in" submenu once there are more. Chrome-owned; no page is touched.
import { tabMenuModel } from "./EngineRegistry.sys.mjs";

/**
 * `engineOf(tab)` → engine id; `setTabEngine(tab, id)` → Promise. Returns
 * `{ dispose() }`, or null when the tab menu does not exist.
 */
export function installEngineTabMenu(window, { engineOf, setTabEngine, onFailure = () => {} }) {
  const document = window.document;
  const menu = document.getElementById?.("tabContextMenu");
  if (!menu) return null;
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
    if (tab && id && id !== engineOf(tab)) Promise.resolve(setTabEngine(tab, id)).catch(onFailure);
  };

  // Firefox's MenuSectionLayout rearranges this menu on popupshowing and
  // rejects unknown items anywhere but the trailing (extensions) run. Keep
  // the items trailing while closed; place them by Reload Tab once arranged.
  const showing = event => {
    if (event.target !== menu) return;
    const tab = contextTab();
    const usable = tab && !window.PrivateBrowsingUtils?.isWindowPrivate?.(window);
    const model = usable ? tabMenuModel(engineOf(tab), window) : { mode: "hidden", items: [] };
    item.hidden = model.mode !== "toggle";
    submenu.hidden = model.mode !== "submenu";
    toggleTarget = null;
    if (model.mode === "toggle") {
      item.setAttribute("label", model.label);
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
  return {
    dispose() {
      menu.removeEventListener("popupshowing", showing); menu.removeEventListener("popuphidden", hidden);
      item.removeEventListener("command", onItem); popup.removeEventListener("command", onChoice);
      for (const element of elements) element.remove();
    },
  };
}
