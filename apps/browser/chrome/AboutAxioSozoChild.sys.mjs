/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Child side of the AxioSozoOverview JSWindowActor. It exposes exactly one
// frozen object to the about:axiosozo page:
//   window.AxioSozoOverview.request(name, params) → Promise
//   window.AxioSozoOverview.subscribe(callback)   → unsubscribe()
// Params cross the boundary as a JSON string produced inside the page's own
// compartment, so page getters or proxies never run with chrome privileges.
// Results are cloned into the page. Authorization happens in the parent.

const MESSAGES = Object.freeze({
  REQUEST: "AxioSozoOverview:Request",
  SUBSCRIBE: "AxioSozoOverview:Subscribe",
  UNSUBSCRIBE: "AxioSozoOverview:Unsubscribe",
  EVENT: "AxioSozoOverview:Event",
});
const EVENT_NAMES = new Set(["contexts", "projects", "rules", "ledger", "services", "attention"]);
const MAX_PARAMS_BYTES = 512 * 1024;
const DOCUMENT_URI = /^about:axiosozo(?:[?#].*)?$/;
const METHOD_NAME = /^[A-Za-z]{1,64}$/;

// Builds the privileged implementation of the page API. `Cu` is the real
// Components.utils in Gecko and a stand-in in Node tests.
export function createOverviewApi({ win, Cu, sendQuery, sendAsyncMessage }) {
  const callbacks = new Set();
  const toPage = value => Cu.cloneInto(value, win);
  const pageError = (code, message) => toPage({ code, message });

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
      sendQuery(MESSAGES.REQUEST, data).then(reply => {
        if (reply?.ok === true) resolve(toPage(reply.value ?? null));
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

  return { request, subscribe, deliver, clear: () => callbacks.clear(), get subscriberCount() { return callbacks.size; } };
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

const Base = globalThis.JSWindowActorChild ?? class {};

export class AboutAxioSozoChild extends Base {
  #api = null;

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
  }

  receiveMessage(message) {
    if (message.name === MESSAGES.EVENT) this.#api?.deliver(message.data?.name);
  }

  didDestroy() {
    this.#api?.clear();
    this.#api = null;
  }
}

// JSWindowActor looks up `${actorName}Child` in esModuleURI (ACTOR_NAME is
// "AxioSozoOverview"); without this export no child is created and the page
// never receives window.AxioSozoOverview.
export { AboutAxioSozoChild as AxioSozoOverviewChild };
