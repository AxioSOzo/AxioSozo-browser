/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ProviderConversation, composeProviderPrompt } from "./ProviderConversation.sys.mjs";
import { ProviderInstances, openProviderSettings } from "./ProviderSettings.sys.mjs";

const NS = "http://www.w3.org/1999/xhtml";
const PROVIDERS = Object.freeze({ codex: "Codex", "claude-code": "Claude Code", antigravity: "Antigravity" });
const MAX_ANSWER = 1024 * 1024;
function html(doc, tag, text = "", className = "") {
  const element = doc.createElementNS(NS, tag); element.textContent = text;
  if (className) element.className = className; return element;
}
export function providerErrorMessage(code) {
  const messages = {
    BLOCKED_AUTH: "Sign in with the selected provider’s official client, then try again.",
    CODEX_LOGIN_REQUIRED: "Codex needs a one-time sign-in for this browser’s separate profile. Open Settings → Provider configurations for its official login command.",
    ANTIGRAVITY_PROTOCOL_UNSUPPORTED: "Antigravity is unavailable in this build: startup and tool isolation have not been verified. Select Codex or Claude Code.",
    BLOCKED_ENV: "This provider’s supported local client is unavailable. Check provider settings.",
    BLOCKED_PROTOCOL: "This client does not expose a supported conversation connection yet.",
    UNSUPPORTED_PROVIDER: "This provider does not expose a supported conversation connection yet.",
    PROVIDER_HOST_UNAVAILABLE: "The local provider host is unavailable. Restart from the browser launcher.",
    PROVIDER_ACTION_UNSUPPORTED: "This assistant cannot approve terminal or browser actions. The request was stopped.",
    PROVIDER_REQUEST_TIMEOUT: "The provider took too long to connect. Try again.",
    PROVIDER_TURN_TIMEOUT: "The provider took too long to answer. The request was stopped.",
    INVALID_PROMPT: "Write a shorter question (maximum 32 KB including page reference).",
    PAGE_CHANGED: "The page changed. Review and attach its reference again before sending.",
    SESSION_CLOSED: "The connection closed. Send again to reconnect.",
  };
  const safe = /^[A-Z][A-Z0-9_]{2,80}$/u.test(code || "") ? code : "PROVIDER_CONNECTION_FAILED";
  return `${messages[safe] || "The provider could not complete this request. Check its local client and try again."} (${safe})`;
}

/** A small, lazily-created chrome panel; zero processes or discovery on install/open. */
export function installProviderPanel(win, { engineProbe = null, Conversation = ProviderConversation } = {}) {
  const doc = win.document;
  let panel = null; let select, question, answer, status, send, stop, attach, contextPreview, heading;
  let connection = null; let attachedPage = null; let pending = false; let epoch = 0; let fixtureMode = false;
  let previouslyFocused = null; let answerNode = null; let answerSize = 0; let queuedText = ""; let renderFrame = null;
  const flushAnswer = () => {
    renderFrame = null; if (queuedText && answerNode) answerNode.appendData(queuedText); queuedText = "";
  };
  const clearAnswer = () => {
    if (renderFrame !== null) win.cancelAnimationFrame(renderFrame); renderFrame = null; queuedText = ""; answerSize = 0;
    answerNode = doc.createTextNode(""); answer.replaceChildren(answerNode);
  };
  const uuid = () => Services.uuid.generateUUID().toString().replace(/[{}]/gu, "");
  const store = new ProviderInstances(Services.prefs, uuid);
  const privateMode = () => {
    const { PrivateBrowsingUtils } = ChromeUtils.importESModule("resource://gre/modules/PrivateBrowsingUtils.sys.mjs");
    return PrivateBrowsingUtils.isWindowPrivate(win);
  };
  const currentPage = () => {
    if (privateMode()) return null;
    if (engineProbe?.currentPage) return engineProbe.currentPage();
    // Retained Gecko content is not the page displayed by Chromium.
    if (engineProbe?.diagnostics().activeEngine === "chromium") return null;
    const tab = win.gBrowser.selectedTab;
    return { url: tab?.linkedBrowser?.currentURI?.spec || "", title: tab?.label || "", engine: "gecko", tabId: tab };
  };
  const setStatus = message => {
    if (status) status.textContent = fixtureMode ? `OFFLINE TEST FIXTURE · no provider contacted. ${message}` : message;
  };
  const providerLabel = () => fixtureMode ? "Offline test fixture" : PROVIDERS[select.value];
  const setBusy = value => {
    pending = value; send.disabled = value; stop.hidden = !value;
    select.disabled = value; attach.disabled = value;
    question.disabled = value;
    answer.setAttribute("aria-busy", value ? "true" : "false");
  };
  async function disconnect() {
    ++epoch; pending = false;
    const previous = connection; connection = null;
    if (previous) await previous.close();
  }
  function close() {
    if (!panel || panel.hidden) return;
    panel.hidden = true; attachedPage = null; attach.checked = false;
    question.value = ""; clearAnswer();
    disconnect().catch(() => {});
    if (previouslyFocused?.isConnected) previouslyFocused.focus();
    else if (!engineProbe?.focus?.()) win.gBrowser.selectedBrowser?.focus();
  }
  function instance() {
    const driver = select.value;
    const policy = store.state();
    const preferred = policy.instances.find(item => item.instance_id === policy.defaultId && item.driver === driver);
    const existing = preferred || policy.instances.find(item => item.driver === driver && policy.enabledIds.includes(item.instance_id));
    if (existing) return existing;
    const created = store.add(driver, PROVIDERS[driver]);
    store.setEnabled(created.instance_id, true);
    if (!policy.defaultId) store.setDefault(created.instance_id);
    return created;
  }
  async function submit() {
    if (pending || !question.value.trim()) return;
    if (privateMode()) { setStatus("AI assistance is unavailable in private windows."); return; }
    let prompt;
    try {
      if (attach.checked) {
        const page = currentPage();
        if (!page || !attachedPage || page.tabId !== attachedPage.tabId || page.url !== attachedPage.url || page.engine !== attachedPage.engine) throw new Error("PAGE_CHANGED");
      }
      prompt = composeProviderPrompt(question.value, attach.checked ? attachedPage : null);
      if (new TextEncoder().encode(prompt).length > 32768) throw new Error("INVALID_PROMPT");
    } catch (error) { setStatus(providerErrorMessage(error.message)); return; }
    setBusy(true); clearAnswer(); setStatus(`Connecting to ${providerLabel()}…`);
    const generation = ++epoch;
    try {
      if (!connection || connection.closed) {
        const owned = new Conversation({ onEvent: event => {
          if (panel.hidden || connection !== owned || owned.closed) return;
          if (event.type === "fixture") {
            fixtureMode = true; heading.textContent = "Ask AI · OFFLINE TEST FIXTURE";
            answer.setAttribute("aria-label", "Offline test fixture response; no provider contacted");
            setStatus("Synthetic response used to verify browser IPC."); return;
          }
          if (event.type === "text_delta") {
            if (answerSize + event.text.length > MAX_ANSWER) {
              disconnect().catch(() => {}); setBusy(false); setStatus("The response exceeded the display limit. The request was stopped."); return;
            }
            answerSize += event.text.length; queuedText += event.text;
            if (renderFrame === null) renderFrame = win.requestAnimationFrame(flushAnswer);
            setStatus(`${providerLabel()} is answering…`);
          } else if (event.type === "turn_finished") {
            if (renderFrame !== null) win.cancelAnimationFrame(renderFrame); flushAnswer();
            setBusy(false); question.focus();
            setStatus(event.status === "completed" ? "Done. Follow-up questions stay in this conversation until you close it."
              : event.status === "cancelled" ? "Stopped." : `The provider ended the request (${event.status}).`);
          } else if (event.type === "error") { setBusy(false); setStatus(providerErrorMessage(event.code)); }
          else if (event.type === "idle") { setBusy(false); setStatus("Connection paused while idle. Send again to start a new conversation."); }
        } });
        fixtureMode = false; heading.textContent = "Ask AI";
        answer.setAttribute("aria-label", "Assistant response");
        connection = owned;
        await owned.open(instance());
      }
      if (generation !== epoch || panel.hidden) return;
      await connection.send(prompt);
      if (generation === epoch && pending) setStatus(`${providerLabel()} is answering…`);
    } catch (error) {
      if (generation !== epoch || panel.hidden) return;
      await disconnect(); setBusy(false); setStatus(providerErrorMessage(error?.message));
    }
  }
  function build() {
    panel = html(doc, "section"); panel.id = "axiosozo-provider-panel"; panel.hidden = true;
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-labelledby", "axiosozo-provider-title");
    const header = html(doc, "div", "", "axiosozo-assistant-header");
    heading = html(doc, "h2", "Ask AI"); heading.id = "axiosozo-provider-title";
    const closeButton = html(doc, "button", "Close"); closeButton.type = "button"; closeButton.addEventListener("click", close);
    header.append(heading, closeButton);
    const controls = html(doc, "div", "", "axiosozo-assistant-controls");
    const label = html(doc, "label", "Provider"); label.htmlFor = "axiosozo-provider-choice";
    select = html(doc, "select"); select.id = "axiosozo-provider-choice";
    for (const [id, name] of Object.entries(PROVIDERS)) { const option = html(doc, "option", name); option.value = id; select.append(option); }
    const settings = html(doc, "button", "Settings"); settings.type = "button";
    settings.addEventListener("click", () => openProviderSettings(win));
    controls.append(label, select, settings);
    const promptLabel = html(doc, "label", "Question"); promptLabel.htmlFor = "axiosozo-provider-question";
    question = html(doc, "textarea"); question.id = "axiosozo-provider-question"; question.rows = 3; question.maxLength = 30000;
    question.placeholder = "Ask a question, or paste text to discuss…";
    const shareLabel = html(doc, "label", "", "axiosozo-assistant-share");
    attach = html(doc, "input"); attach.type = "checkbox";
    shareLabel.append(attach, html(doc, "span", "Share this page’s title and address"));
    contextPreview = html(doc, "p", "Only your question is sent.", "axiosozo-assistant-context");
    contextPreview.id = "axiosozo-assistant-context"; attach.setAttribute("aria-describedby", contextPreview.id);
    const actions = html(doc, "div", "", "axiosozo-assistant-controls");
    send = html(doc, "button", "Send", "primary"); send.type = "button";
    stop = html(doc, "button", "Stop"); stop.type = "button"; stop.hidden = true;
    const reset = html(doc, "button", "New conversation"); reset.type = "button";
    reset.addEventListener("click", async () => { await disconnect(); setBusy(false); clearAnswer(); setStatus("New conversation. Nothing is sent until you press Send."); question.focus(); });
    actions.append(send, stop, reset);
    answer = html(doc, "div", "", "axiosozo-assistant-answer"); answer.setAttribute("role", "region");
    answer.setAttribute("aria-label", "Assistant response"); answer.tabIndex = 0;
    status = html(doc, "p", "", "axiosozo-assistant-status"); status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
    panel.append(header, controls, promptLabel, question, shareLabel, contextPreview, actions, answer, status);
    doc.documentElement.append(panel);
    select.addEventListener("change", async () => { await disconnect(); setBusy(false); clearAnswer(); setStatus("Provider selected. Nothing is sent until you press Send."); });
    attach.addEventListener("change", () => {
      attachedPage = attach.checked ? currentPage() : null;
      if (attach.checked && !/^https?:\/\//iu.test(attachedPage?.url || "")) {
        attachedPage = null; attach.checked = false; setStatus("Only a normal web page can be attached.");
      }
      contextPreview.textContent = attachedPage ? `${attachedPage.title}\n${attachedPage.url}\nPage contents are not included.` : "Only your question is sent.";
    });
    send.addEventListener("click", submit);
    stop.addEventListener("click", async () => {
      setStatus("Stopping…");
      // Reap the session too: Stop always leaves no provider process running.
      await disconnect(); setBusy(false); setStatus("Stopped. Send again to start a new conversation."); question.focus();
    });
    panel.addEventListener("keydown", event => {
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key === "Enter" && event.metaKey && !event.isComposing) { event.preventDefault(); submit(); }
      if (event.key === "Tab") {
        const controls = [...panel.querySelectorAll("button, input, textarea, select, [tabindex='0']")].filter(item => !item.disabled && !item.hidden);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && doc.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && doc.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }
  function open() {
    if (privateMode()) { Services.prompt.alert(win, "Ask AI", "AI assistance is unavailable in private windows."); return; }
    if (!panel) build();
    if (!panel.hidden) { question.focus(); return; }
    previouslyFocused = doc.activeElement;
    try { const policy = store.state(); const preferred = policy.instances.find(item => item.instance_id === policy.defaultId); if (preferred) select.value = preferred.driver; } catch { /* Send presents invalid configuration without overwriting it. */ }
    attachedPage = null; attach.checked = false; contextPreview.textContent = "Only your question is sent.";
    setBusy(false); setStatus("Nothing is sent until you press Send. ⌘Enter to send.");
    panel.hidden = false; question.focus();
  }
  return Object.freeze({ open, close, diagnostics: () => ({ open: Boolean(panel && !panel.hidden), busy: pending, connected: Boolean(connection && !connection.closed) }),
    dispose() { close(); panel?.remove(); disconnect().catch(() => {}); } });
}
