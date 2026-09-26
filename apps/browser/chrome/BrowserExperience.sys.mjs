/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { getProfileSavedPages } from "./SavedPages.sys.mjs";
import { openProviderSettings } from "./ProviderSettings.sys.mjs";
import { installProviderPanel } from "./ProviderPanel.sys.mjs";

const NS = "http://www.w3.org/1999/xhtml";
const MAX_QUERY = 512;

function html(doc, tag, className = "", text = "") {
  const node = doc.createElementNS(NS, tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

function contextId(tab) { return Number(tab?.getAttribute("usercontextid") || 0); }
function isPrivate(win) {
  const { PrivateBrowsingUtils } = ChromeUtils.importESModule("resource://gre/modules/PrivateBrowsingUtils.sys.mjs");
  return PrivateBrowsingUtils.isWindowPrivate(win);
}

export function routeInput(value, fixup, privateMode = false) {
  const input = value.trim();
  if (!input || input.length > MAX_QUERY || /[\u0000-\u001f\u007f]/u.test(input)) throw new Error("INVALID_NAVIGATION_INPUT");
  const flags = Ci.nsIURIFixup.FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP |
    (privateMode ? Ci.nsIURIFixup.FIXUP_FLAG_PRIVATE_CONTEXT : 0);
  const info = fixup.getFixupURIInfo(input, flags);
  if (!info?.preferredURI) throw new Error("NO_NAVIGATION_ROUTE");
  const scheme = info.preferredURI.scheme;
  if (scheme !== "http" && scheme !== "https") throw new Error("UNSUPPORTED_NAVIGATION_SCHEME");
  return { kind: info.keywordProviderId ? "search" : "url", url: info.preferredURI.spec,
    postData: info.postData ?? null };
}

/** All AxioSozo actions, including menu and keyboard routes, share these handlers. */
export function installBrowserExperience(win, { engineProbe = null } = {}) {
  const doc = win.document;
  const sheet = doc.createProcessingInstruction("xml-stylesheet",
    'href="chrome://browser/content/axiosozo/browser-experience.css" type="text/css"');
  doc.insertBefore(sheet, doc.documentElement);
  const saved = getProfileSavedPages();
  const assistant = installProviderPanel(win, { engineProbe });
  let panel = null; let panelOpen = false; let input = null; let results = null; let route = null;
  let mode = "new"; let selected = 0; let options = []; let generation = 0;
  let lastSaved = null; let lastModalMs = null; let focusGeneration = 0;
  const badge = doc.createXULElement("toolbarbutton");
  badge.id = "axiosozo-actions";
  badge.setAttribute("label", "Actions");
  badge.setAttribute("tooltiptext", "Browser actions · ⌘K");
  badge.setAttribute("aria-label", "Browser actions");
  doc.getElementById("nav-bar-customization-target")?.appendChild(badge);

  const commands = Object.freeze([
    { id: "new-tab", label: "New tab", keywords: "open search", contexts: ["browser"], shortcut: "⌘T", permissions: [] },
    { id: "navigate", label: "Go to address", keywords: "url current tab", contexts: ["browser"], shortcut: "⌘L", permissions: [] },
    { id: "commands", label: "Browser actions", keywords: "palette", contexts: ["browser"], shortcut: "⌘K", permissions: [] },
    { id: "save-close", label: "Save and close", keywords: "keep find later", contexts: ["web-page"], shortcut: null, permissions: ["local-profile-write"] },
    { id: "undo-save-close", label: "Undo save and close", keywords: "reopen restore", contexts: ["browser"], shortcut: null, permissions: ["local-profile-write"] },
    { id: "ask", label: "Ask AI", keywords: "codex claude antigravity page help", contexts: ["web-page"], shortcut: null, permissions: ["provider-scope"] },
    { id: "identity", label: "Environment", keywords: "container account identity", contexts: ["browser"], shortcut: null, permissions: [] },
    { id: "engine", label: "Engine", keywords: "chromium firefox gecko", contexts: ["browser"], shortcut: null, permissions: [] },
    { id: "settings", label: "Settings", keywords: "providers Jev", contexts: ["browser"], shortcut: "⌘,", permissions: [] },
  ]);

  function close(restoreFocus = true) {
    if (!panelOpen) return;
    panelOpen = false; panel.hidden = true;
    if (restoreFocus) focusContent();
  }
  function focusContent() {
    const current = ++focusGeneration;
    win.setTimeout(() => {
      if (current === focusGeneration && !panelOpen && !engineProbe?.focus?.()) win.gBrowser.selectedBrowser?.focus();
    }, 0);
  }
  function currentIdentity() { return contextId(win.gBrowser.selectedTab); }
  function pageFor(tab) {
    const page = engineProbe?.currentPage?.(tab);
    return page || { url: tab?.linkedBrowser?.currentURI?.spec || "", title: tab?.label || "" };
  }
  function showStatus(message) {
    if (!route) return;
    route.textContent = message;
    route.setAttribute("role", "status");
  }
  function setOptions(next) {
    options = next; selected = Math.min(selected, Math.max(0, options.length - 1));
    results.replaceChildren();
    options.forEach((item, index) => {
      const row = html(doc, "button", `axiosozo-result${index === selected ? " selected" : ""}`);
      row.type = "button"; row.id = `axiosozo-option-${index}`; row.tabIndex = -1;
      row.setAttribute("role", "option"); row.setAttribute("aria-selected", index === selected ? "true" : "false");
      row.append(html(doc, "span", "axiosozo-result-kind", item.kind),
        html(doc, "span", "axiosozo-result-label", item.label));
      if (item.detail) row.append(html(doc, "span", "axiosozo-result-detail", item.detail));
      if (item.keys) {
        const keys = html(doc, "span", `axiosozo-result-keys${item.keysLabel ? " selected-only" : ""}`);
        keys.append(html(doc, "kbd", "", item.keys));
        if (item.keysLabel) keys.append(html(doc, "span", "", item.keysLabel));
        row.append(keys);
      }
      row.addEventListener("mousedown", event => event.preventDefault()); // Keep focus and caret in the input.
      row.addEventListener("click", () => { selected = index; activate().catch(() => showStatus("Action failed; the page was kept.")); });
      results.append(row);
    });
    const active = results.children[selected];
    if (active) { input.setAttribute("aria-activedescendant", active.id); active.scrollIntoView({ block: "nearest" }); }
    else input.removeAttribute("aria-activedescendant");
    input.setAttribute("aria-expanded", options.length ? "true" : "false");
  }
  async function refresh() {
    if (!input || !results) return;
    const query = input.value.trim().slice(0, MAX_QUERY); const current = ++generation;
    if (mode === "commands") {
      const normalized = query.toLocaleLowerCase();
      setOptions(commands.filter(item => item.id !== "commands" && (item.id !== "undo-save-close" || lastSaved) &&
        `${item.label} ${item.keywords}`.toLocaleLowerCase().includes(normalized))
        .map(item => ({ kind: "Action", label: item.label, keys: item.shortcut || "", run: () => run(item.id) })));
      showStatus("Choose a browser action."); return;
    }
    if (mode === "identity") { renderIdentities(query); return; }
    if (!query) { setOptions([]); showStatus(mode === "new" ? "Type a URL or search. No tab has been created." : "Type an address or search for this tab."); return; }
    let direct = null;
    try {
      const destination = routeInput(query, Services.uriFixup, isPrivate(win));
      showStatus(destination.kind === "search" ? "Web search · configured search engine" : "Open URL · directly");
      direct = { kind: destination.kind === "search" ? "Web search" : "Open URL",
        label: destination.kind === "search" ? `Search web for “${query}”` : `Open ${destination.url}`,
        detail: mode === "new" ? "New tab" : "Current tab",
        run: () => openURL(destination.url, mode === "new" ? "tab" : "current", currentIdentity(), destination.postData) };
    } catch { showStatus("Type a web URL or search phrase."); }
    const userContextId = currentIdentity();
    const open = [...win.gBrowser.tabs].filter(tab => !tab.closing && contextId(tab) === userContextId)
      .filter(tab => `${pageFor(tab).title} ${pageFor(tab).url}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
      .slice(0, 8).map(tab => ({ kind: "Open tab", label: pageFor(tab).title || pageFor(tab).url,
        detail: pageFor(tab).url, run: () => { win.gBrowser.selectedTab = tab; close(); focusContent(); } }));
    const immediate = direct ? [direct, ...open] : open;
    setOptions(immediate);
    if (!isPrivate(win)) {
      try {
        const matches = await saved.search(query, userContextId);
        if (current !== generation || !panelOpen) return;
        setOptions([...immediate, ...matches.map(item => ({ kind: "Saved", label: item.title || item.url,
          detail: item.url, keys: "⌘⌫", keysLabel: "remove", savedId: item.id,
          run: () => openURL(item.url, "tab", item.userContextId) }))]);
      } catch { if (current === generation) showStatus("Saved results are unavailable; navigation still works."); }
    }
  }
  function renderIdentities(query = "") {
    const { ContextualIdentityService } = ChromeUtils.importESModule("moz-src:///toolkit/components/contextualidentity/ContextualIdentityService.sys.mjs");
    const identities = [{ userContextId: 0, name: "Default" },
      ...ContextualIdentityService.getPublicIdentities().map(identity => ({
        userContextId: identity.userContextId,
        name: ContextualIdentityService.getUserContextLabel(identity.userContextId),
      }))];
    setOptions(identities.filter(item => item.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
      .map(item => ({ kind: "Environment", label: item.name,
        detail: `${item.userContextId === currentIdentity() ? "Current browser environment" : "Browser environment"} · ${item.userContextId}`,
        run: () => { close(); openURL("about:blank", "tab", item.userContextId); } })).concat(
        { kind: "Action", label: "Create environment…", detail: "Separate browser container", run: createIdentity }));
    showStatus("Browser environment is chosen by you. Website account: unknown.");
  }
  function createIdentity() {
    const name = { value: "" };
    if (!Services.prompt.prompt(win, "New browser environment", "Name", name, null, { value: 0 }) || !name.value.trim()) return;
    const { ContextualIdentityService } = ChromeUtils.importESModule("moz-src:///toolkit/components/contextualidentity/ContextualIdentityService.sys.mjs");
    const identity = ContextualIdentityService.create(name.value.trim().slice(0, 64), "fingerprint", "blue");
    close(); openURL("about:blank", "tab", identity.userContextId);
  }
  async function openURL(url, where, userContextId = currentIdentity(), postData = null) {
    if (where === "current" && await engineProbe?.navigate?.(url, { postData })) { close(); focusContent(); return; }
    close();
    win.openTrustedLinkIn(url, where, { userContextId, postData, inBackground: false });
    focusContent();
  }
  async function activate() {
    if (options[selected]) { await options[selected].run(); return; }
    if (mode !== "new" && mode !== "current") return;
    const destination = routeInput(input.value, Services.uriFixup, isPrivate(win));
    await openURL(destination.url, mode === "new" ? "tab" : "current", currentIdentity(), destination.postData);
  }
  async function saveAndClose() {
    const tab = win.gBrowser.selectedTab;
    const browser = tab?.linkedBrowser;
    if (!tab || !browser || isPrivate(win)) { showStatus("Private tabs cannot be saved."); return; }
    const page = pageFor(tab);
    if (page.engine === "chromium") { showStatus("Save and close is unavailable in Chromium until page-close confirmation is supported. Switch to Firefox first."); return; }
    const uri = page.url;
    const userContextId = contextId(tab);
    if (!/^https?:\/\//iu.test(uri)) { showStatus("Only web pages can be saved."); return; }
    if (await win.gBrowser.runBeforeUnloadForTabs([tab])) { showStatus("Page close was cancelled; nothing was saved."); return; }
    try {
      const item = await saved.add({ url: uri, title: page.title || uri, userContextId });
      if (tab.closing || pageFor(tab).url !== uri || contextId(tab) !== userContextId) {
        await saved.remove(item.id);
        showStatus("Page changed while saving; the tab was kept open."); return;
      }
      lastSaved = item;
      win.gBrowser.removeTab(tab, { skipPermitUnload: true });
      close(); focusContent();
    } catch { showStatus("Saving failed. The tab is still open."); }
  }
  async function deleteSelected() {
    const item = options[selected];
    if (!item?.savedId) return;
    try { await saved.remove(item.savedId); await refresh(); showStatus("Saved page removed."); }
    catch { showStatus("Could not remove saved page."); }
  }
  function buildPanel() {
    // Kept in privileged browser chrome, so no website DOM or native popover
    // window can own this browser control.
    panel = html(doc, "div"); panel.id = "axiosozo-command-panel";
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "axiosozo-panel-title");
    panel.hidden = true;
    const body = html(doc, "div", "axiosozo-panel-body");
    const top = html(doc, "div", "axiosozo-panel-top");
    const header = html(doc, "div", "axiosozo-panel-header", "Go somewhere"); header.id = "axiosozo-panel-title";
    input = html(doc, "input", "axiosozo-input"); input.type = "text";
    input.setAttribute("autocomplete", "off"); input.setAttribute("spellcheck", "false");
    input.setAttribute("aria-label", "Address, search or browser action");
    input.setAttribute("role", "combobox"); input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false"); input.setAttribute("aria-controls", "axiosozo-results");
    input.setAttribute("aria-describedby", "axiosozo-route");
    route = html(doc, "div", "axiosozo-route"); route.id = "axiosozo-route"; route.setAttribute("role", "status");
    results = html(doc, "div", "axiosozo-results"); results.id = "axiosozo-results";
    results.setAttribute("role", "listbox"); results.setAttribute("aria-labelledby", "axiosozo-panel-title");
    top.append(header, input); body.append(top, route, results); panel.append(body);
    doc.documentElement.append(panel);
    input.addEventListener("input", () => { refresh().catch(() => showStatus("Results unavailable.")); });
    input.addEventListener("keydown", event => {
      if (event.isComposing || event.key === "Process") return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault(); selected = Math.max(0, Math.min(options.length - 1, selected + (event.key === "ArrowDown" ? 1 : -1)));
        setOptions(options); return;
      }
      if (event.key === "Enter") { event.preventDefault(); activate().catch(() => showStatus("Could not open that destination.")); }
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "Delete" && event.metaKey) { event.preventDefault(); deleteSelected(); }
    });
  }
  function show(next) {
    if (!panel) buildPanel();
    ++focusGeneration; // A newly opened layer supersedes a pending focus restore.
    mode = next; selected = 0; options = []; input.value = ""; setOptions([]);
    panel.querySelector(".axiosozo-panel-header").textContent =
      next === "new" ? "New tab" : next === "current" ? "Go to address" : next === "identity" ? "Environment" : "Browser actions";
    input.placeholder = next === "identity" ? "Filter environments" : next === "commands" ? "Filter actions" : "Search or enter address";
    panel.dataset.mode = next;
    const openedAt = win.performance.now();
    panel.hidden = false; panelOpen = true;
    refresh().catch(() => showStatus("Browser options unavailable.")); input.focus();
    win.requestAnimationFrame(() => win.requestAnimationFrame(() => {
      if (!panelOpen) return;
      lastModalMs = Math.round((win.performance.now() - openedAt) * 10) / 10;
      console.info(`AxioSozo modal two frames in ${lastModalMs} ms`);
    }));
  }
  async function run(id) {
    switch (id) {
      case "new-tab": show("new"); break;
      case "navigate": show("current"); break;
      case "commands": show("commands"); break;
      case "save-close": await saveAndClose(); break;
      case "undo-save-close":
        if (!lastSaved) break;
        { const item = lastSaved; openURL(item.url, "tab", item.userContextId);
          try { await saved.remove(item.id); lastSaved = null; }
          catch { show("commands"); showStatus("Page reopened, but the saved copy could not be removed."); } }
        break;
      case "identity": show("identity"); break;
      case "settings": close(false); openProviderSettings(win); break;
      case "engine":
        if (!engineProbe) { show("commands"); showStatus("Chromium is unavailable. Start the browser with its native Chromium runtime installed."); break; }
        close(); try {
          const state = engineProbe.diagnostics();
          await (state.activeEngine === "chromium" ? engineProbe.switchToGecko() : engineProbe.switchToChromium());
        } catch { show("commands"); showStatus("Engine switch failed; the original Gecko tab is retained."); }
        break;
      case "ask": close(false); assistant.open(); break;
      default: throw new Error("UNKNOWN_BROWSER_COMMAND");
    }
  }
  function onCommand(event) {
    if (!event.isTrusted) return;
    const id = event.target?.id;
    const action = id === "cmd_newNavigatorTab" || id === "cmd_newNavigatorTabNoEvent" ? "new-tab"
      : id === "Browser:OpenLocation" ? "navigate" : id === "Tools:Search" ? "commands" : null;
    if (!action) return;
    event.preventDefault(); event.stopImmediatePropagation(); run(action).catch(() => {});
  }
  function onKey(event) {
    if (!event.isTrusted || event.isComposing || !event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
    const action = event.key.toLowerCase() === "t" && !event.shiftKey ? "new-tab"
      : event.key.toLowerCase() === "l" && !event.shiftKey ? "navigate"
      : event.key.toLowerCase() === "k" && !event.shiftKey ? "commands"
      : event.key === "," && !event.shiftKey ? "settings" : null;
    if (!action) return;
    event.preventDefault(); event.stopImmediatePropagation(); run(action).catch(() => {});
  }
  const onBadge = () => run("commands").catch(() => {});
  badge.addEventListener("command", onBadge);
  win.addEventListener("command", onCommand, true);
  win.addEventListener("keydown", onKey, true);
  return Object.freeze({ commands, run, assistant, diagnostics: () => ({ modalOpen: panelOpen, mode,
    tabCount: win.gBrowser.tabs.length, lastModalMs, lastSavedId: lastSaved?.id || null }),
  dispose() { badge.removeEventListener("command", onBadge); badge.remove(); sheet.remove();
    win.removeEventListener("command", onCommand, true); win.removeEventListener("keydown", onKey, true);
    assistant.dispose(); close(false); panel?.remove(); } });
}
