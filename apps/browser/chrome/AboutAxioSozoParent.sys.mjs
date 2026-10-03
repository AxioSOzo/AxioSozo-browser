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
export const EVENT_NAMES = Object.freeze(["contexts", "projects", "rules", "ledger", "services", "attention", "agents", "understand"]);
export const SERVICES_URL = "chrome://browser/content/axiosozo/AxioSozoServices.sys.mjs";
// Provider status and decision-key actions are served by ProviderStatus.sys.mjs
// directly (Providers workstream), not through AxioSozoServices.
export const PROVIDER_STATUS_URL = "chrome://browser/content/axiosozo/ProviderStatus.sys.mjs";
export const PREFS = Object.freeze({
  contexts: "axiosozo.contexts.enabled",
  enginePreferences: "axiosozo.engine.preferences.enabled",
  jevKeyEntry: "axiosozo.jev.keyEntry.enabled",
  openaiKeyEntry: "axiosozo.openai.keyEntry.enabled",
});
const MAX_PARAMS_BYTES = 512 * 1024;
const DOCUMENT_URI = /^about:axiosozo(?:[?#].*)?$/;

export class OverviewError extends Error {
  constructor(code, message) { super(message); this.name = "OverviewError"; this.code = code; }
}
const fail = (code, message) => { throw new OverviewError(code, message); };

// ---------------------------------------------------------------- sender

// A native fact, or undefined when it is missing or its getter throws.
const fact = get => { try { return get(); } catch { return undefined; } };

// Plain snapshot of the facts about a sender, so the check is testable. Facts
// are taken literally: a missing current-global flag is not current, and a
// missing or non-boolean privacy flag is unknown (refused), never "normal".
export function senderSnapshot(actor) {
  const manager = fact(() => actor.manager);
  const context = fact(() => actor.browsingContext);
  const principal = fact(() => manager?.documentPrincipal);
  const privacy = fact(() => context?.usePrivateBrowsing);
  return {
    remoteType: fact(() => manager?.domProcess?.remoteType ?? manager?.remoteType) ?? null,
    documentURI: fact(() => manager?.documentURI?.spec) ?? null,
    isCurrentGlobal: fact(() => manager?.isCurrentGlobal) === true,
    isTopLevel: fact(() => !!context && !context.parent && context.top === context) === true,
    hasEmbedder: fact(() => !!context?.embedderElement) === true,
    usePrivateBrowsing: typeof privacy === "boolean" ? privacy : null,
    principal: principal ? {
      isSystemPrincipal: fact(() => !!principal.isSystemPrincipal) ?? true,
      isContentPrincipal: fact(() => !!principal.isContentPrincipal) ?? false,
      originNoSuffix: fact(() => principal.originNoSuffix) ?? null,
      privateBrowsingId: fact(() => principal.privateBrowsingId) ?? null,
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
  // Two native facts, refused alike; the reason names which one was missing.
  if (!sender.isTopLevel) reject("not a top-level tab (browsing context is not top-level)");
  if (!sender.hasEmbedder) reject("not a top-level tab (no embedder element)");
  if (!sender.isCurrentGlobal) reject("document is no longer current");
  if (typeof sender.usePrivateBrowsing !== "boolean" || !Number.isInteger(principal.privateBrowsingId)) {
    reject("private browsing state is unknown");
  }
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
  engineOrNull: value => value === null || value === "gecko" || value === "firefox" || value === "chromium",
  root: value => typeof value === "string" && value.length >= 2 && value.length <= 4096 && value.startsWith("/")
    && !value.includes("\0"),
  object: value => isPlainObject(value),
  url: value => typeof value === "string" && value.length > 0 && value.length <= 2048,
  days: value => Number.isInteger(value) && value >= 1 && value <= 365,
  uuidList: value => Array.isArray(value) && value.length >= 1 && value.length <= 512 && value.every(T.uuid),
  boolean: value => typeof value === "boolean",
  // Shapes only; the contexts core validates host patterns and labels again.
  hostText: value => typeof value === "string" && value.length >= 1 && value.length <= 253 && !/[\s\u0000-\u001f\u007f]/u.test(value),
  hostList: value => Array.isArray(value) && value.length <= 32 && value.every(T.hostText),
  accountLabelOrNull: value => value === null || (typeof value === "string" && value.length <= 200),
  hookAgent: value => value === "claude-code" || value === "codex",
  sessionId: value => typeof value === "string" && /^s_[0-9a-f]{16}$/.test(value),
  decisionProvider: value => value === "jev" || value === "openai",
  // Shape only: a key is at most 4096 UTF-8 bytes, so never more UTF-16 units.
  // ProviderStatus checks its bytes and control characters before any helper work.
  keyText: value => typeof value === "string" && value.length <= 4096,
  // Understand (understand-v1): the user's own CLI, a facade request id, a
  // one-use acceptance token and an optional run timeout.
  understandCli: value => value === "claude-code" || value === "codex",
  requestId: value => typeof value === "string" && /^[A-Za-z0-9_.:-]{1,160}$/u.test(value),
  acceptToken: value => typeof value === "string" && /^[A-Za-z0-9_-]{16,128}$/u.test(value),
  understandTimeout: value => Number.isSafeInteger(value) && value >= 10000 && value <= 300000,
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

/** The requesting tab's window, only while this document is current and the
 * window is a registered normal one; unknown privacy counts as private. */
function normalWindow(ctx, name, what) {
  if (ctx.isPrivate?.() !== false) fail("PRIVATE_WINDOW", `${name}: ${what} are managed from a normal window`);
  if (ctx.current?.() !== true) fail("DOCUMENT_GONE", `${name}: this page is no longer shown`);
  const window = ctx.window();
  if (!window) fail("NO_WINDOW", `${name}: the requesting tab has no browser window`);
  if (typeof ctx.services.isNormalWindow !== "function" || ctx.services.isNormalWindow(window) !== true) {
    fail("PRIVATE_WINDOW", `${name}: ${what} are managed from a normal window`);
  }
  return window;
}
const agentWindow = (ctx, name) => normalWindow(ctx, name, "agents");

/** Agent methods: the window and current document are checked before the
 * service is asked anything, and again after it answered; a stale answer is
 * refused rather than shown. Native dependencies, paths and presenters are
 * never page parameters. */
const agentMethod = (name, params, run) => ({ params, run: async (ctx, p) => {
  const window = agentWindow(ctx, name);
  const value = await run(ctx, p, window);
  if (agentWindow(ctx, name) !== window) fail("NO_WINDOW", `${name}: the window changed`);
  return value;
} });

// Fixed codes of decision-key operations (ProviderKeys). No helper output, path
// or key material is ever part of an error.
const KEY_ERRORS = new Set(["INVALID_PROVIDER", "KEY_ENTRY_DISABLED", "INVALID_KEY", "KEYCHAIN_HELPER_UNAVAILABLE",
  "KEYCHAIN_REFUSED", "HELPER_TIMEOUT", "HELPER_OUTPUT_LIMIT", "SETTINGS_CLOSED"]);

/** Decision-key methods: a registered normal window and this current document
 * before any fixture admission or helper process. The actor then mints the
 * operation's authority (ctx.keyLease): its own abort signal and one synchronous
 * isActive() that ProviderStatus, the fixture factory and ProviderKeys check
 * before admission, after it, before every spawn and immediately before the key
 * is written. The answer is checked again after it arrived. The page names a
 * provider and, to store, the key once: never a runtime, executable, path,
 * profile, signal, callback or another surface. A key is taken out of the params
 * at once and is never part of a reply, an error or a log line. */
const keyMethod = (name, params, run, { mutates = false } = {}) => ({ params, run: async (ctx, p) => {
  let secret = p.key;
  delete p.key;
  try {
    const window = normalWindow(ctx, name, "keys");
    if (typeof ctx.keyLease !== "function") fail("UNSUPPORTED", `${name} needs the page's own actor`);
    const lease = ctx.keyLease(p.provider, { mutates, window });
    let value = null, failure = null;
    try { value = await run(ctx.providers(), p.provider, { signal: lease.signal, isActive: lease.isActive }, secret); }
    catch (error) { failure = error; }
    finally { secret = ""; lease.release(); }
    // Whatever the Keychain answered, it is only for the same live surface.
    if (normalWindow(ctx, name, "keys") !== window) fail("NO_WINDOW", `${name}: the window changed`);
    if (lease.cancelled()) fail("SETTINGS_CLOSED", `${name} failed (SETTINGS_CLOSED)`);
    if (!lease.isActive()) fail("DOCUMENT_GONE", `${name}: this page is no longer shown`);
    if (failure) {
      const code = KEY_ERRORS.has(failure?.message) ? failure.message : "KEYCHAIN_HELPER_UNAVAILABLE";
      fail(code, `${name} failed (${code})`);
    }
    return value;
  } finally { secret = ""; }
} });

// Fixed codes an Understand operation may end with (UnderstandService, the
// services' snapshot gate and the window checks). Anything else is unavailable;
// no native output, path or diagnostic text is ever part of an error.
const UNDERSTAND_ERRORS = new Set(["INVALID_PARAMS", "OWNER_REVOKED", "SERVICE_CLOSED", "STALE_PROJECT", "INVALID_PROJECT",
  "PROJECT_CHANGED", "UNDERSTAND_UNAVAILABLE", "BRIEF_SAVE_FAILED", "BRIEF_UNAVAILABLE", "BUSY", "STALE_ACCEPTANCE",
  "MANIFEST_REINSPECTION_REQUIRED", "WRITE_CONTAINMENT_UNAVAILABLE", "WRITE_CONTAINMENT_REFUSED", "WRITE_OUTCOME_UNKNOWN",
  "WRITE_FAILED", "INVALID_MANIFEST", "MANIFEST_SECRET", "TOO_LARGE", "DIRECTORY_REFUSED", "MANIFEST_REFUSED", "IDENTITY_CHANGED",
  "MANIFEST_CHANGED", "UNCONFIRMED_FIELDS", "SERVICE_FAILURE", "PRIVATE_WINDOW", "NO_WINDOW", "DOCUMENT_GONE"]);
const UNDERSTAND_JOB_STATES = Object.freeze(["queued", "running", "persisting", "complete"]);
const UNDERSTAND_STATUSES = Object.freeze(["ok", "failed", "cancelled", "timeout", "unavailable", "invalid_output", "busy"]);
const ACCEPTANCE_STATUSES = Object.freeze(["ACCEPTED", "REFUSED", "REINSPECTION_REQUIRED", "INSPECTED", "CHANGED", "UNCHANGED"]);
const MANIFEST_KINDS = Object.freeze(["web", "desktop", "library", "cli", "mobile"]);
const FIXED_CODE = /^[A-Z][A-Z0-9_]{0,63}$/u;
const codeOrNull = value => (typeof value === "string" && FIXED_CODE.test(value) ? value : null);
const oneOf = (value, list) => (list.includes(value) ? value : null);
const listOf = value => (Array.isArray(value) ? value : []);
const jsonCopy = value => JSON.parse(JSON.stringify(value));

// The answers, rebuilt from closed primitives: only these fields cross to the
// page, whatever else a reply held. Authorization is always NOT_AUTHORIZED.
const understandClis = list => listOf(list).filter(item => T.understandCli(item?.cli)).slice(0, 2).map(item => ({ cli: item.cli,
  version: typeof item.version === "string" && item.version.length <= 80 && !/[\u0000-\u001f\u007f]/u.test(item.version) ? item.version : null }));
const UNDERSTAND_REPLIES = Object.freeze({
  state: value => ({ authorization: "NOT_AUTHORIZED", mode: value?.mode === "OFFLINE_FIXTURE" ? "OFFLINE_FIXTURE" : "PRODUCTION",
    clis: understandClis(value?.clis),
    jobs: listOf(value?.jobs).filter(job => T.requestId(job?.request_id) && UNDERSTAND_JOB_STATES.includes(job?.state)).slice(0, 16)
      .map(job => ({ request_id: job.request_id, project_id: T.projectId(job.project_id) ? job.project_id : null, state: job.state,
        status: oneOf(job.status, UNDERSTAND_STATUSES), reason: codeOrNull(job.reason), data_sent: job.data_sent === true })) }),
  available: value => ({ authorization: "NOT_AUTHORIZED", clis: understandClis(value?.clis) }),
  read: value => {
    const status = oneOf(value?.status, UNDERSTAND_STATUSES);
    if (!status || !T.requestId(value?.request_id)) fail("UNDERSTAND_UNAVAILABLE", "readProject failed (UNDERSTAND_UNAVAILABLE)");
    return { version: 1, request_id: value.request_id, kind: "brief", cli: T.understandCli(value.cli) ? value.cli : null, status,
      reason: codeOrNull(value.reason), document: status === "ok" && isPlainObject(value.document) ? jsonCopy(value.document) : null,
      data_sent: value.data_sent === true, duration_ms: Number.isSafeInteger(value.duration_ms) && value.duration_ms >= 0 ? value.duration_ms : 0 };
  },
  cancel: value => ({ cancelled: value?.cancelled === true }),
  preview: value => {
    if (!T.acceptToken(value?.token) || !isPlainObject(value?.manifest)) fail("UNDERSTAND_UNAVAILABLE", "previewProjectBriefAcceptance failed (UNDERSTAND_UNAVAILABLE)");
    return { token: value.token, manifest: jsonCopy(value.manifest) };
  },
  outcome: value => {
    const status = oneOf(value?.status, ACCEPTANCE_STATUSES);
    if (!status) fail("UNDERSTAND_UNAVAILABLE", "the acceptance outcome is unknown (UNDERSTAND_UNAVAILABLE)");
    return { status, committed: value.committed === true ? true : value.committed === false ? false : null, reason: codeOrNull(value.reason) };
  },
});

/** Understand methods (Plan 4 step 6). A registered normal window and this
 * current document before the service is asked anything; then the actor's
 * own owner for the named project (ctx.understandOwner): bound to this
 * document, its selected browser and window, separate from any key lifetime,
 * acquired afresh after a project change and never revived. The services get
 * that private alias and params rebuilt from closed primitives, never an
 * alias, root, revision, callback, signal or flag from the page. The answer
 * is checked again after it arrived; failures leave as fixed codes only. */
// `revoked` is the code (or answer → code) for an owner lost while the service
// worked: for an acceptance that may already have reached the helper it is
// WRITE_OUTCOME_UNKNOWN, never a claim that nothing was written.
const understandMethod = (name, params, service, { reply, build = p => ({ projectId: p.projectId }), acquire = true, empty = null,
  revoked = "OWNER_REVOKED" } = {}) => ({
  params, run: async (ctx, p) => {
    const window = normalWindow(ctx, name, "project homes");
    if (typeof ctx.understandOwner !== "function") fail("UNSUPPORTED", `${name} needs the page's own actor`);
    const owner = ctx.understandOwner(p.projectId, { window, acquire });
    if (!owner) return empty;
    let value = null, failure = null;
    try { value = await ctx.services[service](owner.alias, build(p)); } catch (error) { failure = error; }
    if (!owner.isActive()) {
      fail(failure ? "OWNER_REVOKED" : typeof revoked === "function" ? revoked(value) : revoked, `${name}: this page is no longer the one that asked`);
    }
    if (normalWindow(ctx, name, "project homes") !== window) fail("NO_WINDOW", `${name}: the window changed`);
    if (failure) {
      const code = UNDERSTAND_ERRORS.has(failure?.code) ? failure.code : "UNDERSTAND_UNAVAILABLE";
      fail(code, `${name} failed (${code})`);
    }
    return reply(value);
  } });

// Acceptance params: exactly these, edits naming the confirmed name and/or kind only.
const ACCEPT_SHAPE = Object.freeze({ projectId: T.projectId, token: T.acceptToken, edits: T.object, confirmed: value => value === true });
const manifestName = value => typeof value === "string" && [...value].length >= 1 && [...value].length <= 80 && /^[^\u0000-\u001f\u007f]+$/u.test(value);
function checkAcceptEdits(edits) {
  const keys = Object.keys(edits);
  if (!keys.length || keys.some(key => key !== "name" && key !== "kind")) fail("INVALID_PARAMS", "acceptProjectBrief: edits name only the name and kind");
  if (Object.hasOwn(edits, "name") && !manifestName(edits.name)) fail("INVALID_PARAMS", "acceptProjectBrief: invalid name");
  if (Object.hasOwn(edits, "kind") && !MANIFEST_KINDS.includes(edits.kind)) fail("INVALID_PARAMS", "acceptProjectBrief: invalid kind");
  return { ...(Object.hasOwn(edits, "name") ? { name: edits.name } : {}), ...(Object.hasOwn(edits, "kind") ? { kind: edits.kind } : {}) };
}
// Only a write the helper itself reports as not committed is told as refused.
const acceptBrief = understandMethod("acceptProjectBrief", ACCEPT_SHAPE, "acceptProjectBrief", { reply: UNDERSTAND_REPLIES.outcome,
  revoked: value => (value?.status === "REFUSED" && value.committed === false ? "STALE_ACCEPTANCE" : "WRITE_OUTCOME_UNKNOWN"),
  build: p => ({ projectId: p.projectId, token: p.token, edits: checkAcceptEdits(p.edits), confirmed: true }) });

/** A malformed acceptance that still carries a recognizable token spends it
 * if it is this page's own, whatever project it named (another, a missing or
 * invalid one): through the page's current owner, as a refusal only (no
 * edits, not confirmed), so the facade consumes the lease before it refuses.
 * Another owner's token is untouched, no owner is made and nothing is written. */
async function spendOwnAcceptance(ctx, token) {
  const held = typeof ctx.heldUnderstand === "function" ? ctx.heldUnderstand() : null;
  if (!held) return;
  try { await ctx.services.acceptProjectBrief(held.alias, { projectId: held.projectId, token, edits: {}, confirmed: false }); }
  catch { /* the refusal is the point */ }
}

const PROJECT_HOME_URI = /^about:axiosozo(?:\?[^#]*)?#(.*)$/u;
/** The project id whose home a native about:axiosozo document URI shows
 * (#project=<id>, decoded, exactly one valid id; no suffix), else null. Same
 * rule as the page's route; read from the WindowGlobal, never from page data. */
export function projectHomeRoute(spec) {
  const match = typeof spec === "string" ? PROJECT_HOME_URI.exec(spec) : null;
  if (!match) return null;
  let fragment;
  try { fragment = decodeURIComponent(match[1]); } catch { return null; }
  const id = fragment.startsWith("project=") ? fragment.slice("project=".length) : null;
  return T.projectId(id) ? id : null;
}

// ---------------------------------------------------------------- methods

// The closed method list: every §3.3 service method (pickFolder is called
// with the requesting tab's window), refreshProjectDetection (workstation-v1
// §1, by project id), the P2 account methods (workstation-v1 §3: read-only
// container presentation, the user's own account labels and shared sites,
// and project links opened through the container router), the read-only
// project home (Plan 4 step 3) plus openContext,
// openUrl, the read-only getOverviewFlags, provider status, the decision-key
// methods (contracts/provider-v1.md) and the Understand methods (Plan 4 step 6).
// Nothing else is callable. Arrival offers are accepted in the native
// notification only; the only page-held token is the one-use, owner-bound brief
// acceptance token. No page method names, assigns or clears a container ID.
export const METHODS = Object.freeze({
  // contexts
  listContexts: { params: {}, run: ({ services }) => services.listContexts() },
  // The space of the window this page is in (default space for "Add project").
  activeContext: { params: {}, run: ctx => (typeof ctx.services.activeContext === "function"
    ? ctx.services.activeContext({ window: ctx.window() }) : { uuid: null }) },
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
  // The project home (#project=<id>): the current stored project for the
  // requesting tab's normal window only. The page names a project id, never a
  // folder, a window or a container.
  getProjectHome: { params: { id: T.projectId }, run: (ctx, p) => {
    if (ctx.isPrivate?.()) fail("PRIVATE_WINDOW", "getProjectHome: project homes are not shown in private windows");
    const window = ctx.window();
    if (!window) fail("NO_WINDOW", "getProjectHome: the requesting tab has no browser window");
    if (typeof ctx.services.projectHome !== "function") fail("UNSUPPORTED", "getProjectHome is not available yet");
    return ctx.services.projectHome({ window, id: p.id });
  } },
  pickFolder: { params: {}, run: async ctx => {
    const window = ctx.window();
    if (!window) fail("NO_WINDOW", "pickFolder: the requesting tab has no browser window");
    const root = await ctx.services.pickFolder(window);
    if (root === null || root === undefined) return null;
    if (!T.root(root)) fail("INVALID_ROOT", "pickFolder: the picker returned an unusable path");
    ctx.pickedRoots.add(root);
    return root;
  } },
  // Static detection through the containment reader; returns the draft only.
  detect: { params: { root: T.root }, run: (ctx, p) => {
    requirePickedRoot(ctx, "detect", p.root);
    return ctx.services.detect(p.root);
  } },
  // The service detects the picked folder again before it creates the record.
  confirmProject: { params: { root: T.root, manifest: T.object, contextUuid: optional(T.uuidOrNull) },
    run: async (ctx, p) => {
      requirePickedRoot(ctx, "confirmProject", p.root);
      const project = await ctx.services.confirmProject({ root: p.root, manifest: p.manifest, contextUuid: p.contextUuid ?? null });
      ctx.pickedRoots.delete(p.root);
      return project;
    } },
  // A registered project's own folder, read again; the page names the project
  // id only, never a path, and the detected snapshot is never page-supplied.
  refreshProjectDetection: { params: { id: T.projectId },
    run: ({ services }, p) => services.refreshProjectDetection(p.id) },
  writeManifest: { params: { projectId: T.projectId }, run: ({ services }, p) => services.writeManifest(p.projectId) },
  updateProject: { params: { id: T.projectId, patch: T.object },
    run: ({ services }, p) => services.updateProject(p.id, checkPatch("updateProject", p.patch, PROJECT_PATCH_KEYS)) },
  removeProject: { params: { id: T.projectId }, run: ({ services }, p) => services.removeProject(p.id) },
  projectForUrl: { params: { url: T.url, contextUuid: optional(T.uuidOrNull) },
    run: ({ services }, p) => services.projectForUrl(p.url, p.contextUuid ?? undefined) },
  // accounts per project (P2)
  listProjectContainers: { params: {}, run: ({ services }) => services.listProjectContainers() },
  setAccountLabel: { params: { projectId: T.projectId, key: T.hostText, label: T.accountLabelOrNull },
    run: ({ services }, p) => services.setAccountLabel(p.projectId, { key: p.key, label: p.label }) },
  setSharedSites: { params: { projectId: T.projectId, hosts: T.hostList, confirmed: T.boolean },
    run: ({ services }, p) => services.setSharedSites(p.projectId, { hosts: [...p.hosts], confirmed: p.confirmed }) },
  // services
  serviceStatus: { params: { projectId: T.projectId }, run: ({ services }, p) => services.serviceStatus(p.projectId) },
  // rules
  listRules: { params: {}, run: ({ services }) => services.listRules() },
  saveRule: { params: { rule: T.object }, run: ({ services }, p) => services.saveRule(p.rule) },
  deleteRule: { params: { id: T.ruleId }, run: ({ services }, p) => services.deleteRule(p.id) },
  getJevSettings: { params: {}, run: ({ services }) => services.getJevSettings() },
  setJevSettings: { params: { patch: T.object },
    run: ({ services }, p) => services.setJevSettings(checkPatch("setJevSettings", p.patch, JEV_KEYS)) },
  // providers (ProviderStatus.sys.mjs): installation metadata, and per decision
  // provider (jev, openai) Keychain presence, explicit store and removal only.
  // None of them turns on consent or calls a provider.
  getProviderStatus: { params: {}, run: ctx => ctx.providers().getProviderStatus() },
  getDecisionKeyStatus: keyMethod("getDecisionKeyStatus", { provider: T.decisionProvider },
    (providers, provider, authority) => providers.getDecisionKeyStatus(provider, authority)),
  storeDecisionKey: keyMethod("storeDecisionKey", { provider: T.decisionProvider, key: T.keyText },
    (providers, provider, authority, secret) => providers.storeDecisionKeyAndReport(provider, secret, authority), { mutates: true }),
  removeDecisionKey: keyMethod("removeDecisionKey", { provider: T.decisionProvider },
    (providers, provider, authority) => providers.removeDecisionKeyAndReport(provider, authority), { mutates: true }),
  // Cancels this page's own key operations only (it left AI & keys or is hidden).
  cancelDecisionKeyOperations: { params: {}, run: ctx => { ctx.cancelKeyOperations?.(); return null; } },
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
  // A link of one project: the service resolves its container route before
  // the tab exists, in the requesting window only.
  openProjectUrl: { params: { projectId: T.projectId, url: T.url }, run: (ctx, p) => {
    const url = checkWebUrl(p.url);
    const window = ctx.window();
    if (!window) fail("NO_WINDOW", "openProjectUrl: the requesting tab has no browser window");
    if (typeof ctx.services.openProjectUrl !== "function") fail("UNSUPPORTED", "openProjectUrl is not available yet");
    return ctx.services.openProjectUrl({ window, projectId: p.projectId, url });
  } },
  getOverviewFlags: { params: {}, run: ({ flags }) => flags() },
  // Agents (P3, agent-channel-v1): the endpoint's state, its explicit
  // per-session switch, copyable hook settings for the verified listening
  // socket, and one known project's activity and browser sessions.
  getAgentEndpointState: agentMethod("getAgentEndpointState", {}, ({ services }) => services.getAgentEndpointState()),
  setAgentEndpointEnabled: agentMethod("setAgentEndpointEnabled", { enabled: T.boolean },
    ({ services }, p, window) => services.setAgentEndpointEnabled({ window, enabled: p.enabled })),
  getAgentHookConfig: agentMethod("getAgentHookConfig", { agent: T.hookAgent },
    ({ services }, p, window) => services.getAgentHookConfig({ window, agent: p.agent })),
  listAgentActivity: agentMethod("listAgentActivity", { projectId: T.projectId },
    ({ services }, p) => services.listAgentActivity(p.projectId)),
  listAgentSessions: agentMethod("listAgentSessions", { projectId: T.projectId },
    ({ services }, p, window) => services.listAgentSessions({ window, projectId: p.projectId })),
  revokeAgentSession: agentMethod("revokeAgentSession", { projectId: T.projectId, sessionId: T.sessionId },
    ({ services }, p, window) => services.revokeAgentSession({ window, projectId: p.projectId, sessionId: p.sessionId })),
  // Understand (Plan 4 step 6, understand-v1): the explicit Read of the user's
  // own Claude Code or Codex, its state and cancellation, and the separately
  // confirmed acceptance of a saved brief's name and kind. Product reads stay
  // NOT_AUTHORIZED; each answer is a choice, a status or a document.
  getUnderstandState: understandMethod("getUnderstandState", { projectId: T.projectId }, "getUnderstandState",
    { reply: UNDERSTAND_REPLIES.state }),
  getUnderstandAvailability: understandMethod("getUnderstandAvailability", { projectId: T.projectId }, "getUnderstandAvailability",
    { reply: UNDERSTAND_REPLIES.available }),
  readProject: understandMethod("readProject", { projectId: T.projectId, cli: T.understandCli, timeoutMs: optional(T.understandTimeout) },
    "readProject", { reply: UNDERSTAND_REPLIES.read,
      build: p => ({ projectId: p.projectId, cli: p.cli, ...(p.timeoutMs === undefined ? {} : { timeoutMs: p.timeoutMs }) }) }),
  // One queued or running read of this page's own current owner; an
  // acknowledgement, not its result. Never makes an owner.
  cancelUnderstand: understandMethod("cancelUnderstand", { projectId: T.projectId, requestId: T.requestId }, "cancelUnderstand",
    { reply: UNDERSTAND_REPLIES.cancel, acquire: false, empty: { cancelled: false },
      build: p => ({ projectId: p.projectId, requestId: p.requestId }) }),
  previewProjectBriefAcceptance: understandMethod("previewProjectBriefAcceptance", { projectId: T.projectId },
    "previewProjectBriefAcceptance", { reply: UNDERSTAND_REPLIES.preview }),
  // Validated here (not by the generic shape check) so that a malformed
  // attempt can still spend this page's own recognizable token.
  acceptProjectBrief: { raw: true, params: ACCEPT_SHAPE, run: async (ctx, params) => {
    let p;
    try { p = checkParams("acceptProjectBrief", params, ACCEPT_SHAPE); checkAcceptEdits(p.edits); }
    catch (error) {
      if (isPlainObject(params) && T.acceptToken(params.token)) await spendOwnAcceptance(ctx, params.token);
      throw error;
    }
    return acceptBrief.run(ctx, p);
  } },
  // Never a write retry: inspects a write whose outcome is owed.
  reinspectProjectBriefAcceptance: understandMethod("reinspectProjectBriefAcceptance", { projectId: T.projectId },
    "reinspectProjectBriefAcceptance", { reply: UNDERSTAND_REPLIES.outcome }),
  // The page left the project home: this actor's Understand owner ends (its
  // reads and leases), nobody else's. A later operation makes a new one.
  cancelProjectReadOperations: { params: {}, run: ctx => { ctx.releaseUnderstand?.(); return null; } },
});

export function validateRequest(data) {
  if (!isPlainObject(data)) fail("INVALID_REQUEST", "request must be an object");
  const { name, params } = data;
  if (typeof name !== "string" || !Object.hasOwn(METHODS, name)) fail("UNKNOWN_METHOD", `unknown method "${String(name).slice(0, 64)}"`);
  let size = 0;
  try { size = JSON.stringify(params ?? {}).length; } catch { fail("INVALID_PARAMS", `${name}: params are not JSON`); }
  if (size > MAX_PARAMS_BYTES) fail("INVALID_PARAMS", `${name}: params too large`);
  // A raw method checks its own params, as strictly, inside its run.
  if (METHODS[name].raw) return { name, params: params ?? {} };
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
  const get = (name, fallback, onError = fallback) => {
    try { return prefs.getBoolPref(name, fallback); } catch { return onError; }
  };
  return {
    contexts: get(PREFS.contexts, true),
    enginePreferences: get(PREFS.enginePreferences, false),
    // Key entry as ProviderKeys enforces it: on only when the pref says so
    // (defaults.yaml turns both on); an absent or unreadable pref is off.
    jevKeyEntry: get(PREFS.jevKeyEntry, false),
    openaiKeyEntry: get(PREFS.openaiKeyEntry, false),
  };
}

// ---------------------------------------------------------------- actor

let servicesProvider = () => ChromeUtils.importESModule(SERVICES_URL).AxioSozoServices.get();
let prefsProvider = () => Services.prefs;
let providerStatusProvider = () => ChromeUtils.importESModule(PROVIDER_STATUS_URL);
export function setProvidersForTesting({ services, prefs, providerStatus } = {}) {
  const previous = { services: servicesProvider, prefs: prefsProvider, providerStatus: providerStatusProvider };
  if (services) servicesProvider = services;
  if (prefs) prefsProvider = prefs;
  if (providerStatus) providerStatusProvider = providerStatus;
  return () => {
    servicesProvider = previous.services; prefsProvider = previous.prefs; providerStatusProvider = previous.providerStatus;
  };
}

const Base = globalThis.JSWindowActorParent ?? class {};

export class AboutAxioSozoParent extends Base {
  #pickedRoots = new Set();
  #unsubscribers = [];
  #destroyed = false;
  // Decision-key work of this document: one abort lifetime and generation for all
  // of it (a cancel or destroy ends both), and the providers with a store or
  // removal on its way (one at a time per provider).
  #keyController = null;
  #keyGeneration = 0;
  #keyChanges = new Set();
  // Understand work of this document: at most one owner lifetime, minted here
  // for one project and separate from the key lifetime. Its alias stays in
  // this actor and the services; it is never revived once it ended.
  #understand = null;

  #context() {
    const services = servicesProvider();
    return {
      services,
      pickedRoots: this.#pickedRoots,
      window: () => fact(() => this.browsingContext?.topChromeWindow) ?? null,
      flags: () => readFlags(prefsProvider()),
      providers: () => providerStatusProvider(),
      // Literal privacy only: missing or throwing is undefined, which the
      // normal-window gate refuses like a private window.
      isPrivate: () => {
        const value = fact(() => this.browsingContext?.usePrivateBrowsing);
        return typeof value === "boolean" ? value : undefined;
      },
      current: () => this.#current(),
      keyLease: (provider, options) => this.#keyLease(provider, { ...options, services }),
      cancelKeyOperations: () => this.#cancelKeyOperations(),
      understandOwner: (projectId, options) => this.#understandOwner(projectId, { ...options, services }),
      heldUnderstand: () => this.#heldUnderstand(),
      releaseUnderstand: () => this.#releaseUnderstand(),
    };
  }

  /** This document's own surface, read live: its current, explicitly normal
   * top-level document and the browser window it is in. A missing, unexpected or
   * throwing fact is null. */
  #surface() {
    if (this.#destroyed) return null;
    try {
      const manager = this.manager, context = this.browsingContext;
      if (!manager || !context || manager.isCurrentGlobal !== true || context.usePrivateBrowsing !== false
        || context.parent || context.top !== context) return null;
      const window = context.topChromeWindow;
      return window ? { manager, context, window } : null;
    } catch { return null; }
  }

  /**
   * The authority of one key operation, minted by the actor only. isActive() is
   * synchronous and literally true only while this is still the same manager,
   * browsing context and registered normal browser window it was minted for,
   * privacy is still explicitly off, and the lease was neither cancelled nor
   * destroyed. Once false it stays false.
   */
  #keyLease(provider, { mutates = false, window, services } = {}) {
    const surface = this.#surface();
    if (!surface) fail("DOCUMENT_GONE", "the requesting page is no longer shown");
    if (surface.window !== window || services?.isNormalWindow?.(window) !== true) fail("NO_WINDOW", "the window changed");
    if (mutates && this.#keyChanges.has(provider)) fail("BUSY", "a change to this key is still running");
    this.#keyController ??= new AbortController();
    const controller = this.#keyController, generation = this.#keyGeneration;
    if (mutates) this.#keyChanges.add(provider);
    const cancelled = () => this.#destroyed || generation !== this.#keyGeneration || controller.signal.aborted;
    let revoked = false, released = false;
    const isActive = () => {
      if (revoked) return false;
      try {
        const now = cancelled() ? null : this.#surface();
        revoked = !now || now.manager !== surface.manager || now.context !== surface.context
          || now.window !== surface.window || services.isNormalWindow(surface.window) !== true;
      } catch { revoked = true; }
      return !revoked;
    };
    return { signal: controller.signal, isActive, cancelled, release: () => {
      if (mutates && !released) this.#keyChanges.delete(provider);
      released = true;
    } };
  }

  #cancelKeyOperations() {
    this.#keyGeneration++;
    this.#keyController?.abort();
    this.#keyController = null;
  }

  /** What an Understand lifetime is bound to, read live: this document's
   * surface, its top-level embedder browser, that browser being its window's
   * selected one (a current WindowGlobal alone does not prove that), and the
   * document's own native URI: the exact object WindowGlobalParent holds (a
   * same-document route change replaces it, even back to the same text) and
   * the project home it names. Missing, unexpected or throwing facts are null. */
  #understandSurface() {
    const surface = this.#surface();
    if (!surface) return null;
    try {
      const embedder = surface.context.embedderElement;
      if (!embedder || surface.window.gBrowser?.selectedBrowser !== embedder) return null;
      const documentURI = surface.manager.documentURI;
      const route = projectHomeRoute(documentURI?.spec);
      return documentURI && route ? { ...surface, embedder, documentURI, route } : null;
    } catch { return null; }
  }

  /**
   * This document's Understand owner for `projectId`: the current one when it
   * is for that project and still holds, else (acquire) a new one, only while
   * the document natively shows exactly that project's home. Its predicate is
   * synchronous, literally true only while this is the same manager, browsing
   * context, embedder browser and registered normal window it was minted for,
   * that browser is still selected, the sender is still admitted, and the
   * document's native URI is still the very object it was minted with and
   * names this home. A route change replaces that object (A → list → A
   * included), so it ends the lifetime even when the URI later reads the same;
   * unknown facts refuse. Once false it stays false. Another project, a lost
   * predicate, another tab selected, a native location change, unsubscription,
   * a sender refusal and destruction all end it at once (abort, then release),
   * whether or not the page sends any cleanup.
   */
  #understandOwner(projectId, { window, services, acquire = true } = {}) {
    const held = this.#understand;
    if (held && held.projectId === projectId && held.isActive()) return held;
    if (!acquire) {
      if (held && held.projectId === projectId) this.#releaseUnderstand();
      return null;
    }
    if (held) this.#releaseUnderstand();
    const surface = this.#understandSurface();
    if (!surface) fail("DOCUMENT_GONE", "the requesting page is not the selected, current project home");
    if (surface.route !== projectId) fail("DOCUMENT_GONE", "the requesting page is not this project's home");
    if (surface.window !== window || services?.isNormalWindow?.(window) !== true) fail("NO_WINDOW", "the window changed");
    if (typeof services.registerUnderstandOwner !== "function") fail("UNSUPPORTED", "project reads are not available yet");
    const controller = new AbortController();
    let revoked = false;
    const isActive = () => {
      if (revoked) return false;
      try {
        const now = this.#destroyed || controller.signal.aborted ? null : this.#understandSurface();
        revoked = !now || now.manager !== surface.manager || now.context !== surface.context || now.embedder !== surface.embedder
          || now.window !== surface.window || now.documentURI !== surface.documentURI || now.route !== projectId
          || !this.#current() || services.isNormalWindow(surface.window) !== true;
      } catch { revoked = true; }
      return !revoked;
    };
    const lifetime = { projectId, isActive, controller, services, alias: null, unwatch: [] };
    try { lifetime.alias = services.registerUnderstandOwner({ window, current: isActive, signal: controller.signal }); }
    catch (error) {
      controller.abort();
      const code = UNDERSTAND_ERRORS.has(error?.code) ? error.code : "UNDERSTAND_UNAVAILABLE";
      fail(code, `project reads are not available here (${code})`);
    }
    this.#understand = lifetime;
    const end = () => { if (this.#understand === lifetime) this.#releaseUnderstand(); };
    lifetime.unwatch = [this.#watchSelection(surface, end), this.#watchLocation(surface, end)];
    return lifetime;
  }

  /** Selecting another tab in the window ends the lifetime at once; the
   * predicate would refuse it anyway at the next check, but a running read is
   * stopped now rather than when its answer arrives. */
  #watchSelection(surface, end) {
    let tabs = null;
    try { tabs = surface.window.gBrowser?.tabContainer ?? null; } catch { tabs = null; }
    if (typeof tabs?.addEventListener !== "function") return null;
    const onSelect = () => {
      let selected = null;
      try { selected = surface.window.gBrowser.selectedBrowser; } catch { selected = null; }
      if (selected !== surface.embedder) end();
    };
    tabs.addEventListener("TabSelect", onSelect);
    return () => { try { tabs.removeEventListener("TabSelect", onSelect); } catch { /* window closing */ } };
  }

  /** Any native top-level location change of this browser (a same-document
   * route change included, as tabbrowser reports it) ends the lifetime at
   * once. The URI identity in the predicate refuses it regardless; this stops
   * a running read now instead of at its next check. */
  #watchLocation(surface, end) {
    let tabbrowser = null;
    try { tabbrowser = surface.window.gBrowser ?? null; } catch { tabbrowser = null; }
    if (typeof tabbrowser?.addTabsProgressListener !== "function" || typeof tabbrowser.removeTabsProgressListener !== "function") return null;
    const listener = { onLocationChange(browser, webProgress) {
      if (browser !== surface.embedder) return;
      let topLevel = true;
      try { topLevel = webProgress?.isTopLevel !== false; } catch { topLevel = true; }
      if (topLevel) end();
    } };
    tabbrowser.addTabsProgressListener(listener);
    return () => { try { tabbrowser.removeTabsProgressListener(listener); } catch { /* window closing */ } };
  }

  /** This document's current owner for a refusal only (a malformed acceptance
   * spends its own token through it); one whose predicate failed is ended,
   * which ends its leases too. Never makes an owner. */
  #heldUnderstand() {
    const held = this.#understand;
    if (!held) return null;
    if (!held.isActive()) { this.#releaseUnderstand(); return null; }
    return held;
  }

  /** Ends this document's Understand owner (its reads and leases only), synchronously. */
  #releaseUnderstand() {
    const lifetime = this.#understand;
    if (!lifetime) return;
    this.#understand = null;
    for (const unwatch of lifetime.unwatch) unwatch?.();
    lifetime.controller.abort();
    try { lifetime.services.releaseUnderstandOwner?.(lifetime.alias); } catch (error) { console.error(error); }
  }

  /** The sender is still this actor's live, current about:axiosozo document. */
  #current() {
    if (this.#destroyed) return false;
    try { return validateSender(senderSnapshot(this)) === true; } catch { return false; }
  }

  async receiveMessage(message) {
    try {
      validateSender(senderSnapshot(this));
    } catch (error) {
      // A message this document may no longer send (stale, hidden, replaced) also
      // ends its key and Understand work at once, before the next authority check would.
      this.#cancelKeyOperations();
      this.#releaseUnderstand();
      console.error(error.message);
      return toErrorReply(error);
    }
    switch (message.name) {
      case MESSAGES.REQUEST:
        try {
          const value = await dispatch(this.#context(), message.data);
          // An answer for a document that went away or was replaced while the
          // service worked is never handed to whatever is shown now.
          if (!this.#current()) return toErrorReply(new OverviewError("DOCUMENT_GONE", "the requesting page is no longer shown"));
          return { ok: true, value: value ?? null };
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

  /** The page stopped listening (pagehide) or the actor is going away: its
   * listeners are removed and its Understand owner ends with them. */
  #unsubscribe() {
    for (const unsubscribe of this.#unsubscribers.splice(0)) {
      try { unsubscribe(); } catch (error) { console.error(error); }
    }
    this.#releaseUnderstand();
  }

  didDestroy() {
    this.#destroyed = true;
    this.#unsubscribe();
    this.#pickedRoots.clear();
    this.#cancelKeyOperations();
  }
}

// JSWindowActor looks up `${actorName}Parent` in esModuleURI (ACTOR_NAME is
// "AxioSozoOverview"); without this export Gecko cannot construct the actor and
// the page stays disconnected.
export { AboutAxioSozoParent as AxioSozoOverviewParent };
