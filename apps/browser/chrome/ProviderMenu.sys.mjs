/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { installProviderPanel } from "./ProviderPanel.sys.mjs";

// "Ask AI…" in the native Tools menu. The target is the pinned Firefox markup
// (browser/base/content/browser-menubar.inc.xhtml): menubar#main-menubar >
// menu#tools-menu > menupopup#menu_ToolsPopup, just before its own
// #devToolsSeparator. The entry opens the existing, lazily built provider
// panel. Installing it, opening the panel and the panel's Settings button
// start no client, discovery or login; only an explicit Send in the panel
// connects. No shortcut, toolbar button or command interception: Zen keeps
// its own.

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const PROCESSING_INSTRUCTION_NODE = 7;
export const ASK_AI_ITEM_ID = "axiosozo-tools-ask-ai";
const PANEL_ID = "axiosozo-provider-panel";
// Every rule in this sheet is scoped to AxioSozo ids; the panel is its only user here.
export const STYLESHEET = "chrome://browser/content/axiosozo/browser-experience.css";
const SHEET_DATA = `href="${STYLESHEET}" type="text/css"`;

const xul = (node, localName) => node?.localName === localName && node.namespaceURI === XUL_NS;

/** The pinned native Tools menu of exactly this document, or null. */
function nativeToolsMenu(doc) {
  const menubar = doc.getElementById("main-menubar"); const menu = doc.getElementById("tools-menu");
  const popup = doc.getElementById("menu_ToolsPopup"); const anchor = doc.getElementById("devToolsSeparator");
  if (!xul(menubar, "menubar") || !xul(menu, "menu") || !xul(popup, "menupopup") || !xul(anchor, "menuseparator")) return null;
  if (menu.parentNode !== menubar || popup.parentNode !== menu || anchor.parentNode !== popup || popup.ownerDocument !== doc) return null;
  return { popup, anchor };
}

function windowIsPrivate(win) {
  const { PrivateBrowsingUtils } = ChromeUtils.importESModule("resource://gre/modules/PrivateBrowsingUtils.sys.mjs");
  return PrivateBrowsingUtils.isWindowPrivate(win);
}

/**
 * Called once per trusted browser window after Zen's startup. Returns
 * { diagnostics, dispose } or null, and changes nothing when the native menu
 * is not the expected one or another Ask AI entry or panel already exists.
 * Private (or unknown) windows get the entry disabled, with no action.
 */
export function installProviderMenu(win, { engineProbe = null, isPrivate = windowIsPrivate,
  installPanel = installProviderPanel } = {}) {
  const doc = win?.document;
  if (doc?.nodePrincipal?.isSystemPrincipal !== true) return null;
  const native = nativeToolsMenu(doc);
  if (!native || doc.getElementById(ASK_AI_ITEM_ID) || doc.getElementById(PANEL_ID)) return null;
  let privateWindow = true;
  try { privateWindow = isPrivate(win) !== false; } catch { /* unknown privacy counts as private */ }
  let sheet = null; let assistant = null; let disposed = false;
  const item = doc.createXULElement("menuitem");
  item.id = ASK_AI_ITEM_ID;
  item.setAttribute("label", "Ask AI…");
  const onCommand = event => {
    if (disposed || !event.isTrusted || event.target !== item) return;
    try { (assistant ??= installPanel(win, { engineProbe })).open(); }
    catch (error) { console.error("AxioSozo: Ask AI unavailable", error); }
  };
  try {
    if (privateWindow) item.setAttribute("disabled", "true");
    else {
      // A sheet this document already loads (the fixture probe's) is reused, never added twice.
      const loaded = [...doc.childNodes].some(node => node.nodeType === PROCESSING_INSTRUCTION_NODE
        && node.target === "xml-stylesheet" && node.data === SHEET_DATA);
      if (!loaded) {
        sheet = doc.createProcessingInstruction("xml-stylesheet", SHEET_DATA);
        doc.insertBefore(sheet, doc.documentElement);
      }
      item.addEventListener("command", onCommand);
    }
    native.popup.insertBefore(item, native.anchor);
  } catch (error) {
    item.removeEventListener("command", onCommand); item.remove(); sheet?.remove();
    throw error;
  }
  return Object.freeze({
    diagnostics: () => ({ installed: !disposed, private: privateWindow, panel: assistant?.diagnostics() ?? null }),
    dispose() {
      if (disposed) return;
      disposed = true;
      item.removeEventListener("command", onCommand); item.remove(); sheet?.remove();
      const panel = assistant; assistant = null;
      try { panel?.dispose(); } catch (error) { console.error("AxioSozo: Ask AI dispose failed", error); }
    },
  });
}
