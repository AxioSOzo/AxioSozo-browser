/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Lab family "Start the task" (docs/lab/experiments/start-task-*.md): how a
// capture becomes real work for the user's own agent, on pages of a project
// they added to AxioSozo. Other pages keep Copy for agent and say why.
//
//   start-task-here    "Start in Claude Code ▾": the agent the user picked
//                      (Claude Code, Codex or Antigravity; the last one is
//                      remembered) works headless in the project folder with
//                      the picture, the note (or a chosen proposal) and the
//                      page. The bar becomes a small live status ("Claude
//                      Code is working · Editing index.html", Stop) and then
//                      a result card: the agent's sentence, the files it
//                      touched, Reload this tab, Continue in Terminal.
//   start-task-in-app  "Open in Claude Code ▾": a deep link that prefills
//                      Claude Code in the user's terminal, the Claude app or
//                      the Codex app; the image goes to the clipboard and the
//                      user presses Return there.
//
// Both add one section and one split button to the capture bar
// (RegionCapture's extension point), take Return in the note, and take a
// proposal chosen in the bar (capture-ai) as the task. Everything goes
// through ctx.agents, which checks the project root, the user's click,
// private windows and sensitive sites again. Nothing starts on its own.

import { registerCaptureExtension } from "../../RegionCapture.sys.mjs";
import { CLIENT_CAUTIONS, CLIENT_LABELS } from "../clients.sys.mjs";
import { TARGET_LABELS } from "../handover.sys.mjs";
import { el, floatingCard, thinking, useStylesheet } from "../kit.sys.mjs";

export const EXTENSION_ID = "start-task";
/** After capture-ai's section, so its proposals read first. */
export const EXTENSION_ORDER = 20;
export const STYLESHEET = "chrome://browser/content/axiosozo/lab/start-task/start-task.css";
/** The remembered choices (plain user prefs; nothing else reads them). */
export const CLIENT_PREF = "axiosozo.lab.start-task.client";
export const TARGET_PREF = "axiosozo.lab.start-task.target";
export const TASK_CLIENTS = Object.freeze(["claude-code", "codex", "antigravity"]);
export const APP_TARGETS = Object.freeze(["claude-cli", "claude-desktop", "codex-app"]);
export const APP_NAMES = Object.freeze({ "claude-cli": "Claude Code", "claude-desktop": "the Claude app", "codex-app": "Codex" });
export const APP_MENU_LABELS = Object.freeze({ "claude-cli": "Claude Code in your terminal", "claude-desktop": "Claude app",
  "codex-app": "Codex app" });
const MAX_FILES_SHOWN = 5;
export const NOT_A_PROJECT = Object.freeze({
  here: "Start is offered on pages of a project you added to AxioSozo. This page is not one: copy it for your agent instead.",
  app: "Open in an agent app is offered on pages of a project you added to AxioSozo. This page is not one: copy it for your agent instead.",
});

// ---- remembered choices ----------------------------------------------------------------

const memory = new Map();
function prefs() {
  try { return globalThis.Services?.prefs ?? null; } catch { return null; }
}
/** The last choice for `pref` (this session, else the saved pref), when it is one of `allowed`. */
export function remembered(pref, allowed, fallback) {
  let value = memory.get(pref) ?? null;
  if (value === null) { try { value = prefs()?.getStringPref?.(pref, "") || null; } catch { value = null; } }
  return allowed.includes(value) ? value : fallback;
}
export function remember(pref, value) {
  memory.set(pref, value);
  try { prefs()?.setStringPref?.(pref, value); } catch {}
}
/** For tests. */
export const forgetForTesting = () => memory.clear();

// ---- agent presence, when it is on ------------------------------------------------------------

// When an agent-presence experiment is on (chrome/lab/presence/: agents-on-rows,
// agents-folder), the result goes to its card: the same card its sidebar
// opens, so Dismiss and "seen" stay in step. Loaded only when needed and
// optional: either experiment can be deleted without the other.
const PRESENCE_URL = "chrome://browser/content/axiosozo/lab/presence/";
let presenceModules;
function presence() {
  if (presenceModules !== undefined) return presenceModules;
  try {
    const load = name => globalThis.ChromeUtils.importESModule(`${PRESENCE_URL}${name}.sys.mjs`);
    const [card, hub, source] = [load("result-card"), load("hub"), load("source")];
    presenceModules = typeof card.openResultCard === "function" && hub.presenceHub && typeof source.watchPresence === "function"
      ? { openResultCard: card.openResultCard, hub: hub.presenceHub, watchPresence: source.watchPresence } : null;
  } catch { presenceModules = null; }
  return presenceModules;
}
/** For tests: { openResultCard, hub, watchPresence }, or null for "not there"; undefined loads again. */
export const setPresenceForTesting = modules => { presenceModules = modules; };

// ---- texts -------------------------------------------------------------------------------

/** The prompt a deep link carries: the task (or an opening), the page; the clipboard line is added by the platform. */
export function appPrompt({ task = "", url, title = "" }) {
  const parsed = typeof url === "string" ? URL.parse(url) : null;
  const page = parsed && ["http:", "https:"].includes(parsed.protocol) ? `${parsed.origin}${parsed.pathname}` : null;
  const clean = String(title ?? "").replace(/[\u0000-\u001f\u007f]+/gu, " ").replace(/\s+/gu, " ").trim().slice(0, 160);
  const said = String(task ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]+/gu, " ").trim();
  return [said || "Look at the area of this page that I marked.", "", page ? `Page: ${page}${clean ? ` ("${clean}")` : ""}` : null]
    .filter(line => line !== null).join("\n").trim();
}

/** One calm sentence for a refused start or hand-over (error.reason is more precise when set). */
export function refusalText(error, name) {
  if (typeof error?.reason === "string" && error.reason) return error.reason;
  switch (error?.code) {
    case "BUSY": return `${name} is already working in this project.`;
    case "CLIENT_UNAVAILABLE": return `${name} is not available on this Mac right now. Nothing was sent.`;
    case "UNKNOWN_PROJECT": return "Agents only start in a project you added to AxioSozo.";
    case "SENSITIVE_PAGE": return "AxioSozo does not hand sensitive sites to agents.";
    case "PRIVATE_WINDOW": return "Agents are never used from private windows.";
    case "NOT_USER_ACTION": return "Agents start only from your own click.";
    case "HANDOVER_FAILED": return "The app could not be opened.";
    default: return `${name} could not be started. Nothing was sent.`;
  }
}

/** How long and what it cost, when known: "3.6 s · $0.0010". */
export function costLine(session) {
  const parts = [];
  if (typeof session?.durationMs === "number" && session.durationMs > 0) {
    const seconds = session.durationMs / 1000;
    parts.push(seconds < 60 ? `${seconds.toFixed(seconds < 10 ? 1 : 0)} s` : `${Math.round(seconds / 60)} min`);
  }
  if (typeof session?.costUsd === "number" && session.costUsd > 0) parts.push(`$${session.costUsd.toFixed(session.costUsd < 0.01 ? 4 : 2)}`);
  return parts.join(" · ");
}

// ---- the split button with its menu --------------------------------------------------------

/**
 * "Start in Claude Code" + ▾ in the bar's actions. `items()` →
 * [{ id, label, note, disabled }]; `chosen()` the checked id. The menu is
 * keyboard-operable (arrows, Home/End, Return; Escape closes it and leaves
 * the capture) and closes on a click elsewhere.
 */
function splitButton(window, bar, { label, menuLabel, heading, items, chosen, onRun, onPick }) {
  const document = window.document;
  const slot = bar.slot();
  if (!slot) return null;
  const main = el(document, "button", { type: "button", class: "axiosozo-region-button", text: label });
  const toggle = el(document, "button", { type: "button", class: "axiosozo-region-button axiosozo-region-chevron", "aria-haspopup": "menu",
    "aria-expanded": "false", "aria-label": menuLabel, title: menuLabel });
  const menu = el(document, "div", { class: "axiosozo-region-menu", role: "menu", "aria-label": menuLabel, hidden: true });
  slot.append(el(document, "span", { class: "axiosozo-region-split" }, main, toggle), menu);
  let releaseEscape = null;
  const entries = () => [...menu.querySelectorAll(".axiosozo-region-menu-item")].filter(item => !item.disabled);

  function close({ focus = true } = {}) {
    if (menu.hidden) return;
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    releaseEscape?.();
    releaseEscape = null;
    window.removeEventListener("mousedown", outside, true);
    if (focus) toggle.focus();
  }
  function outside(event) {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) close({ focus: false });
  }
  function open() {
    const current = chosen();
    menu.replaceChildren(el(document, "div", { class: "axiosozo-region-menu-label", "aria-hidden": "true", text: heading }),
      ...items().map(item => {
        const node = el(document, "button", { type: "button", class: "axiosozo-region-menu-item", role: "menuitemradio",
          "aria-checked": String(item.id === current), disabled: !!item.disabled, "data-id": item.id },
        el(document, "span", { text: item.label }),
        item.note ? el(document, "span", { class: "axiosozo-region-menu-note", text: item.note }) : null);
        node.addEventListener("click", event => {
          if (node.disabled) return;
          close();
          onPick(item.id, event);
        });
        return node;
      }));
    menu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    releaseEscape = bar.holdEscape(() => close());
    window.addEventListener("mousedown", outside, true);
    (entries().find(item => item.getAttribute("aria-checked") === "true") ?? entries()[0])?.focus();
    bar.reposition();
  }
  toggle.addEventListener("click", () => (menu.hidden ? open() : close()));
  toggle.addEventListener("keydown", event => {
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && menu.hidden) { event.preventDefault(); open(); }
  });
  menu.addEventListener("keydown", event => {
    const list = entries();
    const at = list.indexOf(document.activeElement);
    const go = index => { event.preventDefault(); list[(index + list.length) % list.length]?.focus(); };
    if (event.key === "ArrowDown") go(at + 1);
    else if (event.key === "ArrowUp") go(at - 1);
    else if (event.key === "Home") go(0);
    else if (event.key === "End") go(list.length - 1);
    else if (event.key === "Tab") close({ focus: false });
  });
  main.addEventListener("click", event => { if (!main.disabled) onRun(event); });
  return {
    main, toggle, menu,
    setLabel(text) { main.textContent = text; },
    setBusy(text) {
      main.disabled = !!text;
      toggle.disabled = !!text;
      if (text) main.textContent = text;
    },
    disable() { main.disabled = true; toggle.disabled = true; close({ focus: false }); },
    dispose() { close({ focus: false }); },
  };
}

// ---- start-task-here: the agent works here, the bar becomes its status ----------------------

function installHere(window, ctx) {
  const document = window.document;
  const releaseSheet = useStylesheet(document, STYLESHEET);

  function render(bar, capture) {
    const section = bar.section({ label: "Start a task" });
    if (!section) return null;
    const caption = (text, extra = {}) => el(document, "p", { class: "axiosozo-region-caption", text, ...extra });
    if (!capture.project?.root) {
      section.append(caption(NOT_A_PROJECT.here));
      return null;
    }
    const root = capture.project.root;
    let client = remembered(CLIENT_PREF, TASK_CLIENTS, "claude-code");
    let statuses = null; // null while checking
    let busy = false;
    const consent = el(document, "p", { class: "axiosozo-region-caption" });
    const problem = caption("", { role: "alert", hidden: true });
    section.append(consent, problem);
    const name = () => CLIENT_LABELS[client] ?? "The agent";
    const statusOf = id => statuses?.find(item => item?.id === id) ?? null;
    const usable = status => status?.available === true && Array.isArray(status.capabilities) && status.capabilities.includes("task");

    function describe() {
      consent.replaceChildren(`${name()} may edit files in `, el(document, "span", { class: "axiosozo-region-caption-path", text: root }),
        ". The image, the page address and your note go with the task.",
        CLIENT_CAUTIONS[client] ? ` ${CLIENT_CAUTIONS[client]}` : "");
      picker?.setLabel(`Start in ${name()}`);
      bar.reposition();
    }
    function say(text) {
      problem.textContent = text ?? "";
      problem.hidden = !text;
      bar.reposition();
    }

    async function start(event, text = null) {
      if (busy || !event?.isTrusted) return true;
      const task = String(text ?? bar.note).trim();
      if (!task) {
        say(`Say what ${name()} should change, then press Return.`);
        bar.focusNote();
        return true;
      }
      if (!bar.stillValid()) return true;
      const status = statusOf(client);
      if (statuses && !usable(status)) { say(status?.reason ?? `${name()} is not available on this Mac right now.`); return true; }
      busy = true;
      say(null);
      picker.setBusy("Starting…");
      const anchor = { browser: capture.browser, rect: capture.selection };
      const withImage = client === "claude-code" || status?.capabilities?.includes("image") === true;
      let session;
      try {
        session = await ctx.agents.startTask({ trigger: event, client, projectRoot: root, task,
          image: withImage ? { type: capture.type, data: capture.png } : null, pageUrl: capture.url, title: capture.title, mayEdit: true });
      } catch (error) {
        busy = false;
        if (!bar.isOpen) return true;
        picker.setBusy(null);
        describe();
        say(refusalText(error, name()));
        return true;
      }
      remember(CLIENT_PREF, client);
      // The picture is with the agent now: the capture ends, its status takes the bar's place.
      bar.finish();
      followTask(window, ctx, session, { anchor, task });
      return true;
    }

    const picker = splitButton(window, bar, {
      label: `Start in ${name()}`, menuLabel: "Choose the agent", heading: "Start in",
      chosen: () => client,
      items: () => TASK_CLIENTS.map(id => {
        const status = statusOf(id);
        const ready = statuses === null ? id === client : usable(status);
        return { id, label: CLIENT_LABELS[id], disabled: !ready,
          note: statuses === null ? (id === client ? null : "Checking…") : ready ? (id === "antigravity" ? "Keeps all its tools" : null) : (status?.reason ?? "Not available") };
      }),
      onRun: event => start(event),
      onPick: id => { client = id; remember(CLIENT_PREF, id); say(null); describe(); },
    });
    if (!picker) return null;
    const releaseDefault = bar.setDefault(event => start(event), { button: picker.main });
    const releaseChoose = bar.onChoose((event, text) => { start(event, text); return true; }, { verb: "Start" });
    describe();
    bar.focusNote();

    // Which agents are ready (versions and options checked, no model call; cached).
    Promise.resolve().then(() => ctx.agents.clientStatus({ check: true })).then(list => {
      if (!bar.isOpen) return;
      statuses = Array.isArray(list) ? list : [];
      const ready = TASK_CLIENTS.filter(id => usable(statusOf(id)));
      if (!ready.length) {
        // As if it were off: Return and a chosen proposal go back to Copy for agent.
        picker.disable();
        releaseDefault();
        releaseChoose();
        consent.textContent = "No coding agent is ready on this Mac, so nothing can start here. Copy for agent still works.";
        bar.reposition();
        return;
      }
      if (!ready.includes(client)) client = ready[0];
      describe();
    }).catch(() => { statuses = null; });

    return () => picker.dispose();
  }

  const unregister = registerCaptureExtension(window, { id: EXTENSION_ID, order: EXTENSION_ORDER, render });
  const dispose = () => { unregister(); releaseSheet(); };
  ctx.signal.addEventListener("abort", dispose, { once: true });
  return { dispose };
}

/**
 * The bar's successor while the agent works: a small card where the area
 * was ("Claude Code is working · Editing index.html", Stop), then its result.
 * It stays through reloads (a dev server reloads the page when the agent
 * saves) and outside clicks; its × hides it and the agent carries on.
 */
export function followTask(window, ctx, session, { anchor, task = "" } = {}) {
  const document = window.document;
  const releaseSheet = useStylesheet(document, STYLESHEET);
  let off = null;
  const card = floatingCard(window, { anchor, label: `${session.clientLabel} task`, width: 340, prefer: "below", align: "end", focus: false,
    closeOnOutside: false, closeOnNavigate: false, signal: ctx.signal,
    onClose: () => { try { off?.(); } catch {} releaseSheet(); } });
  if (!card) { releaseSheet(); return null; }
  card.node.classList.add("axiosozo-start-task-card");
  const tabOf = () => { try { return window.gBrowser?.getTabForBrowser?.(anchor?.browser) ?? null; } catch { return null; } };
  const caption = (text, extra = {}) => el(document, "p", { class: "axiosozo-start-task-caption", text, ...extra });
  const taskLine = task ? caption(`“${task.length > 140 ? `${task.slice(0, 139)}…` : task}”`, { class: "axiosozo-start-task-caption axiosozo-start-task-quote" }) : null;
  let shown = null;

  /** A finished run goes to agent presence's card when presence is on in some window; true when it did. */
  function handOff(current) {
    const modules = presence();
    let on = false;
    try { on = modules?.hub.windowCount() > 0; } catch { on = false; }
    if (!on) return false;
    let source = null;
    try {
      source = modules.watchPresence(window, ctx, { hub: modules.hub, external: false });
      const next = modules.openResultCard(window, ctx, { source, hub: modules.hub, sessionId: current.id,
        place: { anchor: { browser: anchor.browser, rect: anchor.rect }, align: "end" }, overTab: tabOf(), focus: false,
        onClose: () => source.dispose() });
      if (!next) { source.dispose(); return false; }
    } catch (error) {
      console.error("AxioSozo Lab: the presence card could not open", error);
      try { source?.dispose(); } catch {}
      return false;
    }
    card.close("handed-over");
    return true;
  }

  async function terminal(event, current) {
    try { await ctx.agents.continueInTerminal(current.id, { trigger: event }); card.close("handed-over"); }
    catch (error) { card.body.append(caption(refusalText(error, current.clientLabel), { role: "alert" })); card.reposition(); }
  }

  function render(current) {
    if (!card.isOpen || !current) return;
    const key = JSON.stringify([current.state, current.step, current.stopping, current.summary, current.reason, current.files?.summary]);
    if (key === shown) return;
    shown = key;
    const name = current.clientLabel ?? "The agent";
    const resume = current.canResume ? { label: "Continue in Terminal", quiet: true, onClick: event => terminal(event, current) } : null;
    if (current.state === "starting" || current.state === "working") {
      card.setTitle(`${name} is working`);
      card.setBody([thinking(document, current.stopping ? "Stopping…" : current.step ?? (current.state === "starting" ? "Starting…" : "Working…")), taskLine]);
      card.setActions([{ label: current.stopping ? "Stopping…" : "Stop", disabled: current.stopping || !current.canStop,
        onClick: () => { ctx.agents.stop(current.id).catch(() => {}); } }]);
      return;
    }
    if (handOff(current)) return;
    const extra = [costLine(current), current.rateLimit].filter(Boolean).join(" · ");
    if (current.state === "done") {
      const changed = current.files?.byRun ?? [];
      const tab = tabOf();
      card.setTitle(`${name} is done`);
      card.setBody([
        el(document, "p", { class: "axiosozo-lab-card-text", text: current.summary || "It finished without saying what it did." }),
        changed.length ? el(document, "ul", { class: "axiosozo-start-task-files", "aria-label": "Files it changed" },
          changed.slice(0, MAX_FILES_SHOWN).map(path => el(document, "li", { text: path })),
          changed.length > MAX_FILES_SHOWN ? el(document, "li", { class: "axiosozo-start-task-more", text: `and ${changed.length - MAX_FILES_SHOWN} more` }) : null)
          : caption("No files changed."),
        current.files?.summary && changed.length ? caption(current.files.summary) : null,
        current.files?.already ? caption(`${current.files.already} other changed ${current.files.already === 1 ? "file was" : "files were"} there before.`) : null,
        extra ? caption(extra) : null,
      ]);
      card.setActions([resume,
        tab && changed.length ? { label: "Reload this tab", primary: true, closes: true, onClick: () => {
          try { if (typeof window.gBrowser?.reloadTab === "function") window.gBrowser.reloadTab(tab); else anchor.browser.reload(); } catch {}
        } } : null]);
      return;
    }
    if (current.state === "needs_you") {
      card.setTitle(`${name} needs you`);
      card.setBody([caption(current.reason || "It wanted to do more than edit files."), taskLine]);
      card.setActions([resume ? { ...resume, quiet: false, primary: true } : null]);
      return;
    }
    card.setTitle(current.state === "stopped" ? "Stopped" : `${name} could not finish`);
    card.setBody([caption(current.reason || (current.state === "stopped" ? "Stopped." : "It stopped without finishing.")), taskLine,
      extra ? caption(extra) : null]);
    card.setActions([current.state === "failed" ? resume : null]);
  }

  try {
    off = ctx.agents.subscribe(({ type, session: next }) => { if (type === "changed" && next?.id === session.id) render(next); });
  } catch { off = null; }
  render(ctx.agents.get?.(session.id) ?? session);
  Promise.resolve(ctx.agents.whenDone?.(session.id)).then(final => { if (final) render(final); }).catch(() => {});
  return card;
}

// ---- start-task-in-app: prefilled in the user's own app ------------------------------------

function installInApp(window, ctx) {
  const document = window.document;

  function render(bar, capture) {
    const section = bar.section({ label: "Open in an agent app" });
    if (!section) return null;
    const caption = (text, extra = {}) => el(document, "p", { class: "axiosozo-region-caption", text, ...extra });
    if (!capture.project?.root) {
      section.append(caption(NOT_A_PROJECT.app));
      return null;
    }
    const root = capture.project.root;
    let target = remembered(TARGET_PREF, APP_TARGETS, "claude-cli");
    let available = null; // null while checking: target → boolean
    let busy = false;
    const consent = el(document, "p", { class: "axiosozo-region-caption" });
    const problem = caption("", { role: "alert", hidden: true });
    section.append(consent, problem);
    const say = text => { problem.textContent = text ?? ""; problem.hidden = !text; bar.reposition(); };

    function describe() {
      consent.replaceChildren(`Opens ${APP_NAMES[target]} in `, el(document, "span", { class: "axiosozo-region-caption-path", text: root }),
        ", with your note filled in. Nothing is sent until you press Return there. The image goes to the clipboard.");
      picker?.setLabel(TARGET_LABELS[target]);
      bar.reposition();
    }

    async function openIn(event, text = null) {
      if (busy || !event?.isTrusted) return true;
      if (available && available[target] === false) { say(`${APP_MENU_LABELS[target]} is not installed on this Mac.`); return true; }
      if (!bar.stillValid()) return true;
      busy = true;
      say(null);
      picker.setBusy("Opening…");
      let result;
      try {
        result = await ctx.agents.openIn(target, { trigger: event, projectRoot: root,
          prompt: appPrompt({ task: text ?? bar.note, url: capture.url, title: capture.title }), image: { type: capture.type, data: capture.png } });
      } catch (error) {
        busy = false;
        if (!bar.isOpen) return true;
        picker.setBusy(null);
        describe();
        say(refusalText(error, APP_NAMES[target]));
        return true;
      }
      remember(TARGET_PREF, target);
      bar.finish();
      ctx.toast({ title: `Opened in ${APP_NAMES[target]}`,
        description: result?.imageCopied ? "Your note is filled in there. Paste the image with ⌘V, then press Return there to start."
          : "Your note is filled in there. Press Return there to start." });
      return true;
    }

    const picker = splitButton(window, bar, {
      label: TARGET_LABELS[target], menuLabel: "Choose the app", heading: "Open in",
      chosen: () => target,
      items: () => APP_TARGETS.map(id => ({ id, label: APP_MENU_LABELS[id], disabled: available ? !available[id] : false,
        note: available && !available[id] ? "Not installed" : null })),
      onRun: event => openIn(event),
      onPick: id => { target = id; remember(TARGET_PREF, id); say(null); describe(); },
    });
    if (!picker) return null;
    const releaseDefault = bar.setDefault(event => openIn(event), { button: picker.main });
    const releaseChoose = bar.onChoose((event, text) => { openIn(event, text); return true; }, { verb: "Open" });
    describe();

    // Which apps are there (their URL schemes; nothing is opened).
    Promise.resolve().then(() => ctx.agents.handoverTargets({})).then(list => {
      if (!bar.isOpen) return;
      available = Object.fromEntries(APP_TARGETS.map(id => [id, (Array.isArray(list) ? list : []).some(item => item?.target === id && item.available)]));
      if (!APP_TARGETS.some(id => available[id])) {
        picker.disable();
        releaseDefault();
        releaseChoose();
        consent.textContent = "Neither Claude Code, the Claude app nor Codex can be opened from here on this Mac. Copy for agent still works.";
        bar.reposition();
        return;
      }
      if (!available[target]) target = APP_TARGETS.find(id => available[id]);
      describe();
    }).catch(() => { available = null; });

    return () => picker.dispose();
  }

  const unregister = registerCaptureExtension(window, { id: EXTENSION_ID, order: EXTENSION_ORDER, render });
  ctx.signal.addEventListener("abort", unregister, { once: true });
  return { dispose: unregister };
}

/** Variant: the agent works headless in the project; the bar becomes its status and result. */
export function installStartTaskHere(window, ctx) {
  return installHere(window, ctx);
}

/** Variant: Claude Code, the Claude app or Codex opens prefilled; the user presses Return there. */
export function installStartTaskInApp(window, ctx) {
  return installInApp(window, ctx);
}
