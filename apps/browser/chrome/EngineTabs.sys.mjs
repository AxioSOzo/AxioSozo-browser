/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The engine, shown where the tab already is. Resting a pointer on a tab for a
// moment turns its favicon into the engine's logo (Firefox or Chromium). On the
// selected tab that logo is the switch: one click moves the tab to the other
// engine. On other tabs it is information only, so clicking a favicon keeps
// selecting its tab. At rest no tab carries an engine mark.
// Everything is chrome-owned attributes plus axiosozo-runtime.css; no element
// is added to Zen's tab markup and no page is touched.
import { ensureRuntimeStylesheet } from "./DevLoop.sys.mjs";

export const PEEK_ATTRIBUTE = "axiosozo-engine-peek";
export const STATE_ATTRIBUTE = "axiosozo-engine-state";
export const ROOT_ATTRIBUTE = "axiosozo-engine-switch";
export const PEEK_DELAY_MS = 380; // quick passes over the tab list never flicker
export const FAILURE_MS = 2600;
const INERT = Object.freeze({ dispose() {}, diagnostics: () => ({ enabled: false }) });

export function installEngineTabs(window, { engineProbe, timers = window } = {}) {
  if (!engineProbe || engineProbe.diagnostics?.().browsingMode !== "web" || !window?.gBrowser) return INERT;
  const document = window.document;
  const gBrowser = window.gBrowser;
  const container = gBrowser.tabContainer;
  if (!container) return INERT;
  const cleanups = [ensureRuntimeStylesheet(document)];
  const root = document.documentElement;
  root.setAttribute(ROOT_ATTRIBUTE, "true");
  cleanups.push(() => root.removeAttribute(ROOT_ATTRIBUTE));
  const diagnostics = { peeks: 0, switches: 0, failures: 0 };
  let peekTab = null;
  let peekTimer = null;
  let disposed = false;

  const tabOf = node => node?.closest?.(".tabbrowser-tab") ?? null;
  const engineOf = tab => (engineProbe.engineOf(tab) === "chromium" ? "chromium" : "firefox");
  const available = tab => tab && !tab.closing && tab.getAttribute("zen-essential") !== "true"
    && !window.PrivateBrowsingUtils?.isWindowPrivate?.(window);

  function label(tab) {
    const engine = engineOf(tab) === "chromium" ? "Chromium" : "Firefox";
    const other = engine === "Chromium" ? "Firefox" : "Chromium";
    return tab.selected ? `${engine} engine. Click to open this tab in ${other}.` : `${engine} engine`;
  }

  function clearPeek() {
    if (peekTimer !== null) timers.clearTimeout(peekTimer);
    peekTimer = null;
    peekTab?.removeAttribute(PEEK_ATTRIBUTE);
    peekTab = null;
  }

  function schedulePeek(tab) {
    if (tab === peekTab) return;
    clearPeek();
    if (!available(tab)) return;
    peekTab = tab;
    peekTimer = timers.setTimeout(() => {
      peekTimer = null;
      if (disposed || peekTab !== tab) return;
      tab.setAttribute(PEEK_ATTRIBUTE, "true");
      tab.querySelector?.(".tab-icon-stack")?.setAttribute("tooltiptext", label(tab));
      diagnostics.peeks++;
    }, PEEK_DELAY_MS);
  }

  const onOver = event => schedulePeek(tabOf(event.target));
  const onOut = event => {
    const from = tabOf(event.target);
    if (from && from === peekTab && tabOf(event.relatedTarget) !== from) clearPeek();
  };

  async function toggle(tab) {
    if (tab.hasAttribute(STATE_ATTRIBUTE) && tab.getAttribute(STATE_ATTRIBUTE) === "switching") return;
    const next = engineOf(tab) === "chromium" ? "firefox" : "chromium";
    tab.setAttribute(STATE_ATTRIBUTE, "switching");
    diagnostics.switches++;
    try {
      // The selected tab goes through the explicit switch, which owns the
      // pending state and Gecko action authority bookkeeping.
      if (next === "chromium") await engineProbe.switchToChromium();
      else await engineProbe.switchToGecko();
      if (!disposed) tab.removeAttribute(STATE_ATTRIBUTE);
    } catch {
      if (disposed) return;
      diagnostics.failures++;
      // The Firefox tab is kept; the glyph says so briefly, then settles.
      tab.setAttribute(STATE_ATTRIBUTE, "failed");
      tab.querySelector?.(".tab-icon-stack")?.setAttribute("tooltiptext", "Chromium is not available right now. This tab stays in Firefox.");
      timers.setTimeout(() => {
        if (tab.getAttribute(STATE_ATTRIBUTE) === "failed") tab.removeAttribute(STATE_ATTRIBUTE);
      }, FAILURE_MS);
    }
  }

  // Capture phase: a click on the glyph of the selected tab must not also
  // reach Zen's tab handlers (drag start, reset, multiselect).
  const onClick = event => {
    if (!event.isTrusted || event.button !== 0 || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
    const tab = tabOf(event.target);
    if (!tab?.selected || tab.getAttribute(PEEK_ATTRIBUTE) !== "true") return;
    if (!event.target.closest?.(".tab-icon-stack")) return;
    event.preventDefault();
    event.stopPropagation();
    toggle(tab).catch(() => {});
  };
  const onMouseDown = event => {
    const tab = tabOf(event.target);
    if (tab?.selected && tab.getAttribute(PEEK_ATTRIBUTE) === "true" && event.target.closest?.(".tab-icon-stack")) {
      event.stopPropagation();
    }
  };
  const onSelect = () => {
    // Selecting a tab under the pointer re-labels its glyph as a switch.
    if (peekTab?.getAttribute(PEEK_ATTRIBUTE) === "true") {
      peekTab.querySelector?.(".tab-icon-stack")?.setAttribute("tooltiptext", label(peekTab));
    }
  };

  container.addEventListener("mouseover", onOver);
  container.addEventListener("mouseout", onOut);
  container.addEventListener("click", onClick, true);
  container.addEventListener("mousedown", onMouseDown, true);
  container.addEventListener("TabSelect", onSelect);
  cleanups.push(() => {
    container.removeEventListener("mouseover", onOver);
    container.removeEventListener("mouseout", onOut);
    container.removeEventListener("click", onClick, true);
    container.removeEventListener("mousedown", onMouseDown, true);
    container.removeEventListener("TabSelect", onSelect);
    clearPeek();
    for (const tab of gBrowser.tabs ?? []) {
      tab.removeAttribute(STATE_ATTRIBUTE);
      tab.querySelector?.(".tab-icon-stack")?.removeAttribute("tooltiptext");
    }
  });

  return Object.freeze({
    diagnostics: () => ({ enabled: true, ...diagnostics }),
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const cleanup of cleanups.reverse()) { try { cleanup(); } catch {} }
    },
  });
}
