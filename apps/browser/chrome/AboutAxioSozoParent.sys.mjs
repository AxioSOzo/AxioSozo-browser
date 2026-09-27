/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Parent side of the AxioSozoOverview JSWindowActor (contexts-api-v1 §3.4).
// Every message is checked against the sender (about:axiosozo content
// principal, privilegedabout process, top-level tab) and against a closed
// method list with strict parameter shapes before anything reaches
// AxioSozoServices. The page never names a window, a path it did not pick
// with the native folder picker, or a non-web URL.

export const OVERVIEW_ORIGIN = "about:axiosozo";
export const PRIVILEGED_ABOUT_REMOTE_TYPE = "privilegedabout";
export const MESSAGES = Object.freeze({
  REQUEST: "AxioSozoOverview:Request",
  SUBSCRIBE: "AxioSozoOverview:Subscribe",
  UNSUBSCRIBE: "AxioSozoOverview:Unsubscribe",
  EVENT: "AxioSozoOverview:Event",
});
export const EVENT_NAMES = Object.freeze(["contexts", "projects", "rules", "ledger", "services", "attention"]);
export const SERVICES_URL = "chrome://browser/content/axiosozo/AxioSozoServices.sys.mjs";
export const PREFS = Object.freeze({
  contexts: "axiosozo.contexts.enabled",
  enginePreferences: "axiosozo.engine.preferences.enabled",
  jevKeyEntry: "axiosozo.jev.keyEntry.enabled",
});
const MAX_PARAMS_BYTES = 512 * 1024;
const DOCUMENT_URI = /^about:axiosozo(?:[?#].*)?$/;

export class OverviewError extends Error {
  constructor(code, message) { super(message); this.name = "OverviewError"; this.code = code; }
}
const fail = (code, message) => { throw new OverviewError(code, message); };

// ---------------------------------------------------------------- sender

// Plain snapshot of the facts about a sender, so the check is testable.
export function senderSnapshot(actor) {
  const manager = actor.manager;
  const context = actor.browsingContext;
  const principal = manager?.documentPrincipal;
  return {
    remoteType: manager?.domProcess?.remoteType ?? manager?.remoteType ?? null,
    documentURI: manager?.documentURI?.spec ?? null,
    isCurrentGlobal: manager?.isCurrentGlobal !== false,
    isTopLevel: !!context && !context.parent && context.top === context,
    hasEmbedder: !!context?.embedderElement,
    usePrivateBrowsing: !!context?.usePrivateBrowsing,
    principal: principal ? {
      isSystemPrincipal: !!principal.isSystemPrincipal,
      isContentPrincipal: !!principal.isContentPrincipal,
      originNoSuffix: principal.originNoSuffix ?? null,
      privateBrowsingId: principal.privateBrowsingId ?? 0,
    } : null,
  };
}

export function validateSender(sender) {
  const reject = reason => fail("SENDER_REJECTED", `about:axiosozo request rejected: ${reason}`);
  if (!sender?.principal) reject("no document principal");
  const { principal } = sender;
  if (principal.isSystemPrincipal || !principal.isContentPrincipal) reject("principal is not a content principal");
  if (principal.originNoSuffix !== OVERVIEW_ORIGIN) reject("principal is not about:axiosozo");
  if (!DOCUMENT_URI.test(sender.documentURI ?? "")) reject("document is not about:axiosozo");
  if (sender.remoteType !== PRIVILEGED_ABOUT_REMOTE_TYPE) reject("not the privileged about process");
  if (!sender.isTopLevel || !sender.hasEmbedder) reject("not a top-level tab");
  if (!sender.isCurrentGlobal) reject("document is no longer current");
  if ((principal.privateBrowsingId ? 1 : 0) !== (sender.usePrivateBrowsing ? 1 : 0)) {
    reject("private browsing state does not match the principal");
  }
  return true;
}

// ---------------------------------------------------------------- params

const UUID = /^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}?$/;
const PROJECT_ID = /^p_[a-z0-9]{4,32}$/;
const RULE_ID = /^r_[a-z0-9]{4,32}$/;

// Message data is structured-cloned, so it may come from another global;
// compare the brand rather than the prototype identity.
const isPlainObject = value => !!value && typeof value === "object" && !Array.isArray(value)
  && Object.prototype.toString.call(value) === "[object Object]";

const T = {
  uuid: value => typeof value === "string" && UUID.test(value),
  uuidOrNull: value => value === null || T.uuid(value),
  projectId: value => typeof value === "string" && PROJECT_ID.test(value),
  projectIdOrNull: value => value === null || T.projectId(value),
  ruleId: value => typeof value === "string" && RULE_ID.test(value),
  contextType: value => ["personal", "organization", "project"].includes(value),
  engineOrNull: value => value === null || value === "firefox" || value === "chromium",
  root: value => typeof value === "string" && value.length >= 2 && value.length <= 4096 && value.startsWith("/")
    && !value.includes("\0"),
  object: value => isPlainObject(value),
  url: value => typeof value === "string" && value.length > 0 && value.length <= 2048,
  days: value => Number.isInteger(value) && value >= 1 && value <= 365,
  uuidList: value => Array.isArray(value) && value.length >= 1 && value.length <= 512 && value.every(T.uuid),
};
const optional = check => Object.assign(value => value === undefined || check(value), { optional: true });

function checkParams(name, params, shape) {
  if (params === undefined || params === null) params = {};
  if (!isPlainObject(params)) fail("INVALID_PARAMS", `${name}: params must be an object`);
  for (const key of Object.keys(params)) {
    if (!Object.hasOwn(shape, key)) fail("INVALID_PARAMS", `${name}: unknown parameter "${key}"`);
  }
  for (const [key, check] of Object.entries(shape)) {
    if (!Object.hasOwn(params, key) && !check.optional) fail("INVALID_PARAMS", `${name}: missing "${key}"`);
    if (!check(params[key])) fail("INVALID_PARAMS", `${name}: invalid "${key}"`);
  }
  return params;
}

const JEV_KEYS = { consent: v => typeof v === "boolean",
  interval_minutes: v => Number.isInteger(v) && v >= 1 && v <= 30,
  hourly_budget: v => Number.isInteger(v) && v >= 0 && v <= 30 };
// The page may only change the manifest and the linked context of a project;
// root, id, trust and write state are never page-controlled.
const PROJECT_PATCH_KEYS = { manifest: T.object, context_uuid: T.uuidOrNull };

function checkPatch(name, patch, allowed) {
  if (!isPlainObject(patch) || !Object.keys(patch).length) fail("INVALID_PARAMS", `${name}: patch must be a non-empty object`);
  for (const [key, value] of Object.entries(patch)) {
    if (!Object.hasOwn(allowed, key)) fail("INVALID_PARAMS", `${name}: "${key}" cannot be changed here`);
    if (!allowed[key](value)) fail("INVALID_PARAMS", `${name}: invalid "${key}"`);
  }
  return patch;
}

export function checkWebUrl(value) {
  if (!T.url(value)) fail("INVALID_URL", "openUrl: URL missing or too long");
  let url;
  try { url = new URL(value); } catch { fail("INVALID_URL", "openUrl: not a URL"); }
  if (url.protocol !== "http:" && url.protocol !== "https:") fail("INVALID_URL", "openUrl: only http and https URLs can be opened");
  if (url.username || url.password) fail("INVALID_URL", "openUrl: URLs with credentials are refused");
  return url.href;
}

function requirePickedRoot(ctx, name, root) {
  if (!ctx.pickedRoots.has(root)) fail("ROOT_NOT_PICKED", `${name}: choose the folder with the folder picker first`);
}

// ---------------------------------------------------------------- methods

// The closed method list: every §3.3 service method (pickFolder is called
// with the requesting tab's window) plus openContext, openUrl and the
// read-only getOverviewFlags. Nothing else is callable.
export const METHODS = Object.freeze({
  // contexts
  listContexts: { params: {}, run: ({ services }) => services.listContexts() },
  setContextType: { params: { uuid: T.uuid, type: T.contextType },
    run: ({ services }, p) => services.setContextType(p.uuid, p.type) },
  linkOrganization: { params: { uuid: T.uuid, organizationUuid: T.uuidOrNull },
    run: ({ services }, p) => services.linkOrganization(p.uuid, p.organizationUuid) },
  linkProject: { params: { uuid: T.uuid, projectId: T.projectIdOrNull },
    run: ({ services }, p) => services.linkProject(p.uuid, p.projectId) },
  setEnginePreference: { params: { uuid: T.uuid, engine: T.engineOrNull },
    run: ({ services, flags }, p) => {
      if (p.engine !== null && !flags().enginePreferences) fail("DISABLED", "Engine preferences are experimental and turned off");
      return services.setEnginePreference(p.uuid, p.engine);
    } },
  listOrphans: { params: {}, run: ({ services }) => services.listOrphans() },
  removeOrphans: { params: { uuids: T.uuidList }, run: ({ services }, p) => services.removeOrphans(p.uuids) },
  // projects
  listProjects: { params: {}, run: ({ services }) => services.listProjects() },
  getProject: { params: { id: T.projectId }, run: ({ services }, p) => services.getProject(p.id) },
  pickFolder: { params: {}, run: async ctx => {
    const window = ctx.window();
    if (!window) fail("NO_WINDOW", "pickFolder: the requesting tab has no browser window");
    const root = await ctx.services.pickFolder(window);
    if (root === null || root === undefined) return null;
    if (!T.root(root)) fail("INVALID_ROOT", "pickFolder: the picker returned an unusable path");
    ctx.pickedRoots.add(root);
    return root;
  } },
  detect: { params: { root: T.root }, run: (ctx, p) => {
    requirePickedRoot(ctx, "detect", p.root);
    return ctx.services.detect(p.root);
  } },
  confirmProject: { params: { root: T.root, manifest: T.object, contextUuid: optional(T.uuidOrNull) },
    run: async (ctx, p) => {
      requirePickedRoot(ctx, "confirmProject", p.root);
      const project = await ctx.services.confirmProject({ root: p.root, manifest: p.manifest, contextUuid: p.contextUuid ?? null });
      ctx.pickedRoots.delete(p.root);
      return project;
    } },
  writeManifest: { params: { projectId: T.projectId }, run: ({ services }, p) => services.writeManifest(p.projectId) },
  updateProject: { params: { id: T.projectId, patch: T.object },
    run: ({ services }, p) => services.updateProject(p.id, checkPatch("updateProject", p.patch, PROJECT_PATCH_KEYS)) },
  removeProject: { params: { id: T.projectId }, run: ({ services }, p) => services.removeProject(p.id) },
  projectForUrl: { params: { url: T.url, contextUuid: optional(T.uuidOrNull) },
    run: ({ services }, p) => services.projectForUrl(p.url, p.contextUuid ?? undefined) },
  // services
  serviceStatus: { params: { projectId: T.projectId }, run: ({ services }, p) => services.serviceStatus(p.projectId) },
  // rules
  listRules: { params: {}, run: ({ services }) => services.listRules() },
  saveRule: { params: { rule: T.object }, run: ({ services }, p) => services.saveRule(p.rule) },
  deleteRule: { params: { id: T.ruleId }, run: ({ services }, p) => services.deleteRule(p.id) },
  getJevSettings: { params: {}, run: ({ services }) => services.getJevSettings() },
  setJevSettings: { params: { patch: T.object },
    run: ({ services }, p) => services.setJevSettings(checkPatch("setJevSettings", p.patch, JEV_KEYS)) },
  // ledger
  usageSummary: { params: { days: T.days }, run: ({ services }, p) => services.usageSummary({ days: p.days }) },
  exportLedger: { params: {}, run: async ({ services }) => {
    const text = await services.exportLedger();
    if (typeof text !== "string") fail("SERVICE_ERROR", "exportLedger did not return text");
    return text;
  } },
  clearLedger: { params: {}, run: ({ services }) => services.clearLedger() },
  // attention
  needsAttention: { params: {}, run: ({ services }) => services.needsAttention() },
  // navigation, performed by the parent for the requesting window only
  openContext: { params: { uuid: T.uuid }, run: (ctx, p) => {
    const window = ctx.window();
    if (!window) fail("NO_WINDOW", "openContext: the requesting tab has no browser window");
    if (typeof ctx.services.openContext !== "function") fail("UNSUPPORTED", "openContext is not available yet");
    return ctx.services.openContext({ window, uuid: p.uuid });
  } },
  openUrl: { params: { url: T.url, contextUuid: optional(T.uuidOrNull) }, run: async (ctx, p) => {
    const url = checkWebUrl(p.url);
    const window = ctx.window();
    if (!window) fail("NO_WINDOW", "openUrl: the requesting tab has no browser window");
    const contextUuid = p.contextUuid ?? null;
    if (typeof ctx.services.openUrl === "function") return ctx.services.openUrl({ window, url, contextUuid });
    // Fallback until services can target a workspace: a normal web-link tab
    // in the context's container, never with a privileged principal.
    let userContextId = 0;
    if (contextUuid) {
      const contexts = await ctx.services.listContexts();
      userContextId = contexts.find(context => context.uuid === contextUuid)?.container ?? 0;
    }
    window.openWebLinkIn(url, "tab", { userContextId, relatedToCurrent: true });
    return true;
  } },
  getOverviewFlags: { params: {}, run: ({ flags }) => flags() },
});

export function validateRequest(data) {
  if (!isPlainObject(data)) fail("INVALID_REQUEST", "request must be an object");
  const { name, params } = data;
  if (typeof name !== "string" || !Object.hasOwn(METHODS, name)) fail("UNKNOWN_METHOD", `unknown method "${String(name).slice(0, 64)}"`);
  let size = 0;
  try { size = JSON.stringify(params ?? {}).length; } catch { fail("INVALID_PARAMS", `${name}: params are not JSON`); }
  if (size > MAX_PARAMS_BYTES) fail("INVALID_PARAMS", `${name}: params too large`);
  return { name, params: checkParams(name, params, METHODS[name].params) };
}

export async function dispatch(ctx, data) {
  const { name, params } = validateRequest(data);
  return METHODS[name].run(ctx, params);
}

export function toErrorReply(error) {
  const code = typeof error?.code === "string" && /^[A-Z][A-Z0-9_]{0,63}$/.test(error.code) ? error.code : "SERVICE_ERROR";
  const message = String(error?.message ?? error ?? "Unknown error").slice(0, 500);
  return { ok: false, error: { code, message } };
}

export function readFlags(prefs) {
  const get = (name, fallback) => {
    try { return prefs.getBoolPref(name, fallback); } catch { return fallback; }
  };
  return {
    contexts: get(PREFS.contexts, true),
    enginePreferences: get(PREFS.enginePreferences, false),
    jevKeyEntry: get(PREFS.jevKeyEntry, false),
  };
}

// ---------------------------------------------------------------- actor

let servicesProvider = () => ChromeUtils.importESModule(SERVICES_URL).AxioSozoServices.get();
let prefsProvider = () => Services.prefs;
export function setProvidersForTesting({ services, prefs } = {}) {
  const previous = { services: servicesProvider, prefs: prefsProvider };
  if (services) servicesProvider = services;
  if (prefs) prefsProvider = prefs;
  return () => { servicesProvider = previous.services; prefsProvider = previous.prefs; };
}

const Base = globalThis.JSWindowActorParent ?? class {};

export class AboutAxioSozoParent extends Base {
  #pickedRoots = new Set();
  #unsubscribers = [];
  #destroyed = false;

  #context() {
    return {
      services: servicesProvider(),
      pickedRoots: this.#pickedRoots,
      window: () => this.browsingContext?.topChromeWindow ?? null,
      flags: () => readFlags(prefsProvider()),
    };
  }

  async receiveMessage(message) {
    try {
      validateSender(senderSnapshot(this));
    } catch (error) {
      console.error(error.message);
      return toErrorReply(error);
    }
    switch (message.name) {
      case MESSAGES.REQUEST:
        try {
          return { ok: true, value: (await dispatch(this.#context(), message.data)) ?? null };
        } catch (error) {
          // Contract errors (OverviewError, ContextsError codes) are expected
          // user-facing results; only unexpected exceptions are logged.
          if (!(error instanceof OverviewError) && typeof error?.code !== "string") {
            console.error("about:axiosozo request failed", error);
          }
          return toErrorReply(error);
        }
      case MESSAGES.SUBSCRIBE:
        this.#subscribe();
        return { ok: true, value: null };
      case MESSAGES.UNSUBSCRIBE:
        this.#unsubscribe();
        return { ok: true, value: null };
      default:
        return toErrorReply(new OverviewError("UNKNOWN_MESSAGE", "unknown message"));
    }
  }

  #subscribe() {
    if (this.#unsubscribers.length || this.#destroyed) return;
    const services = servicesProvider();
    for (const name of EVENT_NAMES) {
      // Only the event name crosses to the page; it re-requests what it shows.
      const unsubscribe = services.on(name, () => {
        if (this.#destroyed) return;
        try { this.sendAsyncMessage(MESSAGES.EVENT, { name }); } catch { /* actor closing */ }
      });
      if (typeof unsubscribe === "function") this.#unsubscribers.push(unsubscribe);
    }
  }

  #unsubscribe() {
    for (const unsubscribe of this.#unsubscribers.splice(0)) {
      try { unsubscribe(); } catch (error) { console.error(error); }
    }
  }

  didDestroy() {
    this.#destroyed = true;
    this.#unsubscribe();
    this.#pickedRoots.clear();
  }
}

// JSWindowActor looks up `${actorName}Parent` in esModuleURI (ACTOR_NAME is
// "AxioSozoOverview"); without this export Gecko cannot construct the actor and
// the page stays disconnected.
export { AboutAxioSozoParent as AxioSozoOverviewParent };
