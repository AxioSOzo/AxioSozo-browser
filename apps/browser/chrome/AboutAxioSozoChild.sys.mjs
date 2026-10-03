/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Child side of the AxioSozoOverview JSWindowActor. It exposes exactly one
// frozen object to the about:axiosozo page:
//   window.AxioSozoOverview.request(name, params) → Promise
//   window.AxioSozoOverview.subscribe(callback)   → unsubscribe()
// Params cross the boundary as a JSON string produced inside the page's own
// compartment, so page getters or proxies never run with chrome privileges.
// Results are cloned into the page. Authorization happens in the parent.
//
// Besides that API, one privileged click listener on its own document (Plan 4
// step 7; default group, capture phase, so it reads before any page handler,
// see CLICK_OPTIONS): only a trusted click (a mouse click or the keyboard activation of
// the button) on the home's "Send errors to agent…" button sends the fixed
// SendProjectErrors message with { v: 1 }. Page script cannot reach it: a
// synthesized event or an API call is not trusted, and nothing of the page
// (project, tab, root, target) travels with it.
//
// The same listener carries the private watch and safety actions (Plan 4
// step 9): a trusted click on one authored control (fixed id, or a list row's
// fixed action kind with its service-issued watch id) sends that action's
// fixed message with its closed params, read here natively from the current
// controls: never a page getter, callback, event detail or request payload.
// When the parent answered, the page hears only the event name.

const MESSAGES = Object.freeze({
  REQUEST: "AxioSozoOverview:Request",
  SUBSCRIBE: "AxioSozoOverview:Subscribe",
  UNSUBSCRIBE: "AxioSozoOverview:Unsubscribe",
  EVENT: "AxioSozoOverview:Event",
  SEND_PROJECT_ERRORS: "AxioSozoOverview:SendProjectErrors",
  SAVE_WATCH: "AxioSozoOverview:SaveWatch",
  REMOVE_WATCH: "AxioSozoOverview:RemoveWatch",
  CHECK_WATCH: "AxioSozoOverview:CheckWatch",
  RETRY_WATCH_CLEANUP: "AxioSozoOverview:RetryWatchCleanup",
  CONFIRM_SAFETY_CHOICE: "AxioSozoOverview:ConfirmSafetyChoice",
  RESOLVE_SAFETY_RECOVERY: "AxioSozoOverview:ResolveSafetyRecovery",
});
const EVENT_NAMES = new Set(["contexts", "projects", "rules", "ledger", "services", "attention", "agents", "understand", "console",
  "watches", "safety"]);
const MAX_PARAMS_BYTES = 512 * 1024;
const DOCUMENT_URI = /^about:axiosozo(?:[?#].*)?$/;
const METHOD_NAME = /^[A-Za-z]{1,64}$/;
export const SEND_ERRORS_BUTTON = "axiosozo-send-project-errors";
// The default event group's capture phase on the actor's own document, added
// at DOMDocElementInserted, before any page script can add a listener. Gecko
// runs the whole default group (capture, target, bubble) before the system
// group (EventDispatcher.cpp, HandleEventTargetChain), so this reads the
// clicked control exactly as the user activated it, before any page handler
// re-renders, disables or replaces it. A system-group listener would only see
// it after those handlers (and their microtasks) had run.
export const CLICK_OPTIONS = Object.freeze({ capture: true });

// The authored controls of the private actions; the page renders them with
// exactly these ids and attributes (overview/about-axiosozo.mjs).
export const WATCH_CONTROLS = Object.freeze({
  form: "axiosozo-watch-form", save: "axiosozo-watch-save", url: "axiosozo-watch-url", question: "axiosozo-watch-question",
  observation: "axiosozo-watch-observation", provider: "axiosozo-watch-provider", consent: "axiosozo-watch-consent",
  enabled: "axiosozo-watch-enabled", interval: "axiosozo-watch-interval", outcomeLabel: "axiosozo-watch-outcome-label-",
  outcomeId: "axiosozo-watch-outcome-id-", retry: "axiosozo-watch-retry",
  // A row action lives in its watch's own row (`row` + id) of the project
  // home's Watches section: Check now in the row's actions, Remove in its
  // confirmation's button row.
  home: "project-home", row: "watch-",
});
export const SAFETY_CONTROLS = Object.freeze({
  // confirm button id → its own checkbox id (the first-run offer and Settings)
  confirm: Object.freeze({ "axiosozo-safety-offer-confirm": "axiosozo-safety-offer-checked",
    "axiosozo-safety-settings-confirm": "axiosozo-safety-settings-checked" }),
  // recovery group id → the authored container it must be inside
  recovery: Object.freeze({ "axiosozo-safety-offer-recovery": "safety-offer",
    "axiosozo-safety-settings-recovery": "safety-settings-body" }),
});
const ROW_ACTIONS = Object.freeze({ remove: MESSAGES.REMOVE_WATCH, check: MESSAGES.CHECK_WATCH });
const SAFETY_OUTCOMES = Object.freeze(["RESTORED", "EXTERNAL_CHANGED", "ACCEPTED"]);
const MAX_OUTCOMES = 6;
const WATCH_ID = /^w_[a-z0-9]{4,32}$/u;

/**
 * What the service itself issued to this document through its own replies:
 * the watch ids of the latest listWatches answer and the sequence of the
 * latest getSafetyStatus answer that requires recovery. A row or recovery
 * click counts only for these; an id or sequence the page wrote elsewhere
 * (or an older reply arriving late) never does.
 */
function createIssued() {
  let watchIds = new Set();
  let safetySequence = null;
  const applied = { listWatches: 0, getSafetyStatus: 0 };
  return {
    note(name, serial, value) {
      if (!Object.hasOwn(applied, name) || serial <= applied[name]) return;
      applied[name] = serial;
      try {
        if (name === "listWatches") {
          watchIds = new Set(Array.isArray(value) ? value.map(watch => watch?.id).filter(id => typeof id === "string" && WATCH_ID.test(id)) : []);
        } else {
          safetySequence = value?.code === "RECOVERY_REQUIRED" && value.cleanup_blocked !== true
            && Number.isSafeInteger(value.sequence) && value.sequence > 0 ? value.sequence : null;
        }
      } catch {
        if (name === "listWatches") watchIds = new Set(); else safetySequence = null;
      }
    },
    view: Object.freeze({ hasWatch: id => watchIds.has(id), get safetySequence() { return safetySequence; } }),
  };
}

// Builds the privileged implementation of the page API. `Cu` is the real
// Components.utils in Gecko and a stand-in in Node tests.
export function createOverviewApi({ win, Cu, sendQuery, sendAsyncMessage }) {
  const callbacks = new Set();
  const toPage = value => Cu.cloneInto(value, win);
  const pageError = (code, message) => toPage({ code, message });
  const issued = createIssued();
  let serial = 0;

  function request(name, params) {
    return new win.Promise((resolve, reject) => {
      if (typeof name !== "string" || !METHOD_NAME.test(name)) {
        reject(pageError("INVALID_REQUEST", "request name must be a method name"));
        return;
      }
      let json;
      try {
        json = params === undefined ? "{}" : Cu.waiveXrays(win).JSON.stringify(params);
      } catch {
        reject(pageError("INVALID_PARAMS", "params must be JSON data"));
        return;
      }
      if (typeof json !== "string" || json.length > MAX_PARAMS_BYTES) {
        reject(pageError("INVALID_PARAMS", "params must be JSON data under 512 KiB"));
        return;
      }
      const data = { name, params: JSON.parse(json) };
      const sent = ++serial;
      sendQuery(MESSAGES.REQUEST, data).then(reply => {
        if (reply?.ok === true) {
          issued.note(name, sent, reply.value);
          resolve(toPage(reply.value ?? null));
        }
        else reject(pageError(String(reply?.error?.code ?? "SERVICE_ERROR"), String(reply?.error?.message ?? "Request failed")));
      }, error => {
        reject(pageError("ACTOR_ERROR", String(error?.message ?? error)));
      });
    });
  }

  function subscribe(callback) {
    if (typeof callback !== "function") throw new win.TypeError("subscribe needs a function");
    const first = callbacks.size === 0;
    callbacks.add(callback);
    if (first) sendAsyncMessage(MESSAGES.SUBSCRIBE, {});
    let active = true;
    return Cu.exportFunction(() => {
      if (!active) return;
      active = false;
      callbacks.delete(callback);
      if (callbacks.size === 0) sendAsyncMessage(MESSAGES.UNSUBSCRIBE, {});
    }, win);
  }

  function deliver(name) {
    if (!EVENT_NAMES.has(name)) return;
    for (const callback of [...callbacks]) {
      try { callback(toPage({ name })); } catch (error) { console.error(error); }
    }
  }

  return { request, subscribe, deliver, issued: issued.view, clear: () => callbacks.clear(), get subscriberCount() { return callbacks.size; } };
}

// Places the API on the page window as a frozen, non-writable property.
export function exposeOverviewApi({ win, Cu, api }) {
  const exposed = Cu.cloneInto({ request: api.request, subscribe: api.subscribe }, win, { cloneFunctions: true });
  // Privileged Object operations on waived wrappers forward to the page's
  // objects; the descriptor itself never becomes visible to the page.
  Object.freeze(Cu.waiveXrays(exposed));
  Object.defineProperty(Cu.waiveXrays(win), "AxioSozoOverview", {
    value: exposed, enumerable: true, configurable: false, writable: false,
  });
  return exposed;
}

/** True only for a trusted click whose target is the authored "Send errors to
 * agent…" button (or inside it) of this very about:axiosozo document. Every
 * fact is read natively here; the page supplies nothing. */
export function isSendProjectErrorsActivation(event, document) {
  try {
    if (!event || event.isTrusted !== true || event.type !== "click" || !document) return false;
    if (!DOCUMENT_URI.test(document.documentURI ?? "")) return false;
    const button = document.getElementById(SEND_ERRORS_BUTTON);
    if (!button || button.localName !== "button" || button.ownerDocument !== document || button.disabled === true) return false;
    const target = event.target;
    return !!target && (target === button || button.contains(target));
  } catch { return false; }
}

/** A button this document authored, enabled (not disabled, not aria-disabled). */
function enabledButton(node, document) {
  return !!node && node.localName === "button" && node.ownerDocument === document && node.disabled !== true
    && node.getAttribute("aria-disabled") !== "true" && node.getAttribute("type") === "button";
}

/** The watch form's closed fields, read natively from its authored controls. */
function readWatchForm(document, button) {
  const form = document.getElementById(WATCH_CONTROLS.form);
  if (!form || form.ownerDocument !== document || !form.contains(button)) return null;
  const control = (id, kind) => {
    const node = document.getElementById(id);
    return node && node.ownerDocument === document && node.localName === kind && form.contains(node) ? node : null;
  };
  const url = control(WATCH_CONTROLS.url, "input"), question = control(WATCH_CONTROLS.question, "textarea");
  const observation = control(WATCH_CONTROLS.observation, "select"), provider = control(WATCH_CONTROLS.provider, "select");
  const consent = control(WATCH_CONTROLS.consent, "input"), enabled = control(WATCH_CONTROLS.enabled, "input");
  const interval = control(WATCH_CONTROLS.interval, "select");
  if (!url || !question || !observation || !provider || !consent || !enabled || !interval
    || consent.type !== "checkbox" || enabled.type !== "checkbox") return null;
  const outcomes = [];
  for (let index = 0; index < MAX_OUTCOMES; index++) {
    const label = control(`${WATCH_CONTROLS.outcomeLabel}${index}`, "input");
    if (!label) break;
    const key = control(`${WATCH_CONTROLS.outcomeId}${index}`, "input");
    if (!key) return null;
    outcomes.push({ id: String(key.value), label: String(label.value) });
  }
  const watchId = form.getAttribute("data-watch-id");
  const watch = { url: String(url.value), question: String(question.value), outcomes,
    observation: String(observation.value), provider: String(provider.value),
    consent: consent.checked === true, enabled: enabled.checked === true,
    intervalMinutes: Number.parseInt(String(interval.value), 10) };
  if (watchId) watch.id = String(watchId);
  return { projectId: String(form.getAttribute("data-project-id") ?? ""), watch };
}

const hasClass = (node, name) => !!node && typeof node.getAttribute === "function"
  && String(node.getAttribute("class") ?? "").split(/\s+/u).includes(name);

/** Check now or Remove: the button sits exactly where the page authors it in
 * its own watch's row (the one element with that row id) inside the project
 * home's Watches section, and the id is one the service issued. Attributes
 * copied onto any other button, row or section mean nothing. */
function watchRowAction(button, document, issued) {
  const kind = button.getAttribute("data-watch-action");
  if (kind === null || !Object.hasOwn(ROW_ACTIONS, kind)) return null;
  const id = button.getAttribute("data-watch-id");
  if (typeof id !== "string" || !WATCH_ID.test(id) || issued?.hasWatch?.(id) !== true) return null;
  const home = document.getElementById(WATCH_CONTROLS.home);
  const row = document.getElementById(`${WATCH_CONTROLS.row}${id}`);
  if (!home || !row || row.ownerDocument !== document || row.localName !== "li" || !hasClass(row, "watch-row")) return null;
  const list = row.parentNode, section = list?.parentNode;
  if (list?.localName !== "ul" || !hasClass(list, "watch-list") || section?.localName !== "section"
    || section.getAttribute("data-section") !== "watches" || !home.contains(section)) return null;
  const group = button.parentNode;
  const placed = kind === "check" ? hasClass(group, "watch-actions") && group.parentNode === row
    : hasClass(group, "button-row") && hasClass(group.parentNode, "watch-confirm") && group.parentNode.parentNode === row;
  return placed ? { name: ROW_ACTIONS[kind], data: { id }, event: "watches" } : null;
}

/** A recovery answer: the button sits directly in one authored recovery group
 * inside its own panel, and that group shows the sequence the service issued
 * in its latest recovery-required answer. */
function safetyRecoveryAction(button, document, issued) {
  const outcome = button.getAttribute("data-safety-outcome");
  if (outcome === null || !SAFETY_OUTCOMES.includes(outcome)) return null;
  const group = button.parentNode;
  const groupId = group?.getAttribute?.("id");
  if (typeof groupId !== "string" || !Object.hasOwn(SAFETY_CONTROLS.recovery, groupId) || document.getElementById(groupId) !== group) return null;
  const panel = document.getElementById(SAFETY_CONTROLS.recovery[groupId]);
  if (!panel || !panel.contains(group) || !hasClass(group, "safety-recovery")) return null;
  const sequence = issued?.safetySequence;
  if (!Number.isSafeInteger(sequence) || sequence <= 0 || group.getAttribute("data-safety-sequence") !== String(sequence)) return null;
  return { name: MESSAGES.RESOLVE_SAFETY_RECOVERY, data: { sequence, outcome }, event: "safety" };
}

/**
 * The private action a trusted click starts, or null: { name, data, event }.
 * Only a trusted click (mouse, or the browser's keyboard activation of the
 * focused button) whose target is inside one enabled authored control of this
 * very about:axiosozo document counts. Every value is read here from native
 * controls; nothing the page computed runs with these privileges. Row and
 * recovery controls also need `issued`, the service's own answers to this
 * document (createOverviewApi().issued).
 */
export function userActionFromClick(event, document, issued = null) {
  try {
    if (!event || event.isTrusted !== true || event.type !== "click" || !document) return null;
    if (!DOCUMENT_URI.test(document.documentURI ?? "")) return null;
    const target = event.target;
    if (!target || target.ownerDocument !== document) return null;
    const button = typeof target.closest === "function" ? target.closest("button") : null;
    if (!enabledButton(button, document) || !button.contains(target)) return null;
    const authored = id => document.getElementById(id) === button;
    if (button.id === WATCH_CONTROLS.save && authored(WATCH_CONTROLS.save)) {
      const data = readWatchForm(document, button);
      return data ? { name: MESSAGES.SAVE_WATCH, data, event: "watches" } : null;
    }
    if (button.id === WATCH_CONTROLS.retry && authored(WATCH_CONTROLS.retry)) return { name: MESSAGES.RETRY_WATCH_CLEANUP, data: {}, event: "watches" };
    if (Object.hasOwn(SAFETY_CONTROLS.confirm, button.id) && authored(button.id)) {
      const box = document.getElementById(SAFETY_CONTROLS.confirm[button.id]);
      if (!box || box.ownerDocument !== document || box.localName !== "input" || box.type !== "checkbox" || box.disabled === true) return null;
      return { name: MESSAGES.CONFIRM_SAFETY_CHOICE, data: { checked: box.checked === true }, event: "safety" };
    }
    if (button.getAttribute("data-watch-action") !== null) return watchRowAction(button, document, issued);
    if (button.getAttribute("data-safety-outcome") !== null) return safetyRecoveryAction(button, document, issued);
    return null;
  } catch { return null; }
}

const Base = globalThis.JSWindowActorChild ?? class {};

export class AboutAxioSozoChild extends Base {
  #api = null;
  #clickDocument = null;
  #onClick = null;

  handleEvent(event) {
    if (event.type === "DOMDocElementInserted") this.#install();
  }

  #install() {
    if (this.#api) return;
    const win = this.contentWindow;
    if (!win || !DOCUMENT_URI.test(this.document?.documentURI ?? "")) return;
    this.#api = createOverviewApi({
      win,
      Cu,
      sendQuery: (name, data) => this.sendQuery(name, data),
      sendAsyncMessage: (name, data) => { try { this.sendAsyncMessage(name, data); } catch { /* closing */ } },
    });
    exposeOverviewApi({ win, Cu, api: this.#api });
    this.#listenForSendErrors(this.document);
  }

  /** One listener per document, on the actor's own document only: Send errors
   * to agent, and the private watch and safety actions. It is read and sent
   * synchronously inside this listener; nothing waits for a microtask. */
  #listenForSendErrors(document) {
    if (this.#onClick || !document) return;
    const onClick = event => {
      let current = null;
      try { current = this.document; } catch { current = null; }
      if (current !== document) return;
      if (isSendProjectErrorsActivation(event, document)) {
        try { this.sendAsyncMessage(MESSAGES.SEND_PROJECT_ERRORS, { v: 1 }); } catch { /* closing */ }
        return;
      }
      const action = userActionFromClick(event, document, this.#api?.issued ?? null);
      if (action) this.#sendUserAction(action);
    };
    try {
      document.addEventListener("click", onClick, CLICK_OPTIONS);
      this.#onClick = onClick;
      this.#clickDocument = document;
    } catch { /* no listener: the button does nothing */ }
  }

  /** Sends one private action; whatever the parent answers, this page then
   * hears that action's event name (its own refresh shows what happened). */
  #sendUserAction(action) {
    const api = this.#api;
    let reply;
    try { reply = this.sendQuery(action.name, action.data); } catch { return; }
    Promise.resolve(reply).catch(() => null).then(() => { if (this.#api === api) api?.deliver(action.event); });
  }

  receiveMessage(message) {
    if (message.name === MESSAGES.EVENT) this.#api?.deliver(message.data?.name);
  }

  didDestroy() {
    try { this.#clickDocument?.removeEventListener("click", this.#onClick, CLICK_OPTIONS); } catch { /* document gone */ }
    this.#clickDocument = null;
    this.#onClick = null;
    this.#api?.clear();
    this.#api = null;
  }
}

// JSWindowActor looks up `${actorName}Child` in esModuleURI (ACTOR_NAME is
// "AxioSozoOverview"); without this export no child is created and the page
// never receives window.AxioSozoOverview.
export { AboutAxioSozoChild as AxioSozoOverviewChild };
