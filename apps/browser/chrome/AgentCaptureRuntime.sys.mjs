/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Native privacy and ownership callbacks for the P4 screenshot tool (Plan 4
// step 8). One process runtime, owned by AgentBridgeRuntime, supplies
// GeckoAgentTools' private capture contracts:
//
// - getCaptureExpected(tab): the registry's own freshly issued descriptor for
//   the trusted binding of an issued tab, plus that tab's settled project
//   authority, retained privately. Never a sanitized Core copy or a clone.
// - isCaptureCurrent(expected, request): synchronous literal true only while
//   the registry still projects that exact issued binding onto the same live
//   normal window, tab, browser, current window global, container, URL and
//   document, and its project authority holds.
// - createCaptureOwner(request, context): one fresh per-request owner that
//   composes the root's AgentViewportCapture lease sequencing, a fresh
//   GeckoViewportPngBox and a fresh genuine listener-free GeckoBiDiReadSession.
//   Its close() resolves literal true only after both owners settled, the
//   reader's own awaited close receipt included, and its readback observer is
//   gone.
//
// The readback preference that governs the native capture is this (parent)
// process's: the root BiDi browsingContext module captures through the parent
// remote/shared/Capture.sys.mjs, whose lazy compositor-readback preference
// decides readback. One owned observer of it per capture owner starts before
// its first false value is trusted and stays through raw reader settlement,
// PNG validation and resize, the terminal commit and the composed owner's
// disposal; every notification, even false→true→false between two awaits,
// refuses that owner for good. That observation is the proof of ordering; the
// child's literal-false point checks alone are not. An observer attached to an
// owner is removed only after that owner's reader and PNG owner both closed
// positively. One whose owner never formed (a refusal or a setup failure) is
// a setup orphan, removed on its own; while any orphan or uncertain earlier
// cleanup remains, no new capture owner is created.
//
// The child privacy lease protocol is AgentCaptureChild's: begin, recheck and
// release(commit) on the exact AxioSozoAgentCapture actor of the expected
// window global. A refused begin is retired at once only when the child says
// it retained nothing; otherwise an exact RELEASE (or that actor's
// destruction) retires it. Its actor is registered on the first actual capture
// owner, never at startup, so a build with capture disabled creates none.
// Images stay in this process; no actor, About page or wire sees a lease or a
// handle.
//
// Nothing here enables capture. AgentBridgeRuntime passes captureEnabled as a
// literal false until root accepts actual ordinary-profile privacy evidence.
import { createAgentViewportCapture } from "./AgentViewportCapture.sys.mjs";
import { createGeckoViewportPngBox } from "./GeckoViewportPngBox.sys.mjs";
import { AgentToolError, createGeckoBiDiReadSession } from "./GeckoBiDiReadSession.sys.mjs";
import { AGENT_CAPTURE_ACTOR, AGENT_CAPTURE_MESSAGES, CAPTURE_SCOPE_LIMITS, LEASE_TOKEN, READBACK_PREF,
  readReadbackPref } from "./AgentCaptureChild.sys.mjs";

// Pinned JSActorOptions, as the console actor: a web-process child needs
// safeForUntrustedWebProcess; top-level http(s) documents of tab browsers only.
// pagehide only reaches an existing child (createActor:false).
export const AGENT_CAPTURE_ACTOR_OPTIONS = Object.freeze({
  parent: Object.freeze({ esModuleURI: "chrome://browser/content/axiosozo/AgentCaptureParent.sys.mjs" }),
  child: Object.freeze({ esModuleURI: "chrome://browser/content/axiosozo/AgentCaptureChild.sys.mjs",
    events: Object.freeze({ pagehide: Object.freeze({ createActor: false }) }) }),
  allFrames: false, includeChrome: false, messageManagerGroups: Object.freeze(["browsers"]),
  matches: Object.freeze(["http://*/*", "https://*/*"]), safeForUntrustedWebProcess: true,
});
export const AGENT_CAPTURE_TIMEOUTS = Object.freeze({ operationMs: 10_000, cleanupMs: 1_000 });

const fail = code => { throw new AgentToolError(code); };
const ref = value => value !== null && (typeof value === "object" || typeof value === "function");
const DESCRIPTOR_FIELDS = ["tab_id", "url", "document_id", "project_id", "engine", "userContextId", "binding_token",
  "project_revision", "route_revision"];

let actorRegistered = false;
/** Registers the actor once per process (the parent propagates it). */
export function registerAgentCaptureActor(chromeUtils = globalThis.ChromeUtils) {
  if (actorRegistered) return true;
  chromeUtils.registerWindowActor(AGENT_CAPTURE_ACTOR, AGENT_CAPTURE_ACTOR_OPTIONS);
  actorRegistered = true;
  return true;
}

/** imgITools and a new nsIBinaryInputStream: no page, canvas or URL channel. */
export function nativePngTools() {
  const images = Cc["@mozilla.org/image/tools;1"].getService(Ci.imgITools);
  return Object.freeze({ images,
    createReader: () => Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream) });
}

/**
 * Observes this process's readback preference with one strong, owned
 * observer, never changing the preference. Answers { registered, remove }:
 * `remove` is the exact removal and returns literal true once the observer is
 * gone. It exists even when registration threw with an unknown outcome:
 * nsPrefBranch::RemoveObserverImpl answers NS_OK for an observer that was
 * never added, so removal is exact either way.
 */
export function observeReadbackPref(callback, prefs = globalThis.Services?.prefs) {
  const observer = () => callback();
  if (typeof callback !== "function" || typeof prefs?.addObserver !== "function" || typeof prefs.removeObserver !== "function") {
    // Nothing was added: there is nothing to remove.
    return Object.freeze({ registered: false, remove: () => true });
  }
  let removed = false;
  const remove = () => {
    if (!removed) { prefs.removeObserver(READBACK_PREF, observer); removed = true; }
    return true;
  };
  try { prefs.addObserver(READBACK_PREF, observer); }
  catch { return Object.freeze({ registered: false, remove }); }
  return Object.freeze({ registered: true, remove });
}

function defaultToken() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return `cl_${Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("")}`;
}

let installed = null;
/** The installed process capture runtime, or null; never creates one. */
export const getAgentCaptureRuntime = () => installed;

/**
 * `registry`: the shared AgentTabRegistry. `services`: AxioSozoServices
 * (isNormalWindow, captureNativeProjectAuthority, readNativeProjectSnapshot).
 * `timers`: trusted { setTimeout, clearTimeout } (Timer.sys.mjs in chrome).
 * `allocationBudget`: the process BiDi retention budget shared with actions,
 * with its claim and quarantine. Injected for tests: registerActor,
 * createReadSession, createViewportCapture, createPngBox, loadPngTools,
 * readPref, observePref, randomToken.
 */
export function createAgentCaptureRuntime({ registry, services, timers, allocationBudget,
  registerActor = registerAgentCaptureActor, createReadSession = createGeckoBiDiReadSession,
  createViewportCapture = createAgentViewportCapture, createPngBox = createGeckoViewportPngBox,
  loadPngTools = nativePngTools, readPref = readReadbackPref, observePref = observeReadbackPref, randomToken = defaultToken,
  timeoutMs = AGENT_CAPTURE_TIMEOUTS.operationMs, cleanupTimeoutMs = AGENT_CAPTURE_TIMEOUTS.cleanupMs } = {}) {
  if (typeof registry?.withTrusted !== "function" || typeof services?.isNormalWindow !== "function"
    || typeof services.captureNativeProjectAuthority !== "function" || typeof services.readNativeProjectSnapshot !== "function"
    || typeof timers?.setTimeout !== "function" || typeof timers.clearTimeout !== "function"
    || typeof allocationBudget?.claim !== "function" || typeof allocationBudget.quarantine !== "function"
    || typeof observePref !== "function") throw new TypeError("trusted capture dependencies required");
  const setTimer = (fn, ms) => timers.setTimeout(fn, ms);
  const clearTimer = id => timers.clearTimeout(id);
  let closed = false;
  // expected descriptor → its settled project authority (captured once).
  const authorities = new WeakMap();
  // Lease objects stay opaque: lease → record; live records stay reachable.
  const leases = new WeakMap(), records = new Set();
  // Composed per-request owners until their close resolved literal true.
  const owners = new Set();
  // Parent readback observers whose exact removal is still owed. `owner` is the
  // composed owner a watch is attached to, or null for a setup orphan.
  const watches = new Set();
  const readbackOff = () => { try { return readPref() === false; } catch { return false; } };
  const orphans = () => [...watches].filter(watch => watch.owner === null);

  /** This process's readback preference, observed from before its false value
   * is trusted. The watch is owned before registration is attempted; any
   * notification is permanent. A refusal leaves it a setup orphan. */
  function watchReadback() {
    const watch = { invalid: false, remove: null, owner: null };
    watches.add(watch);
    let observation = null;
    try { observation = observePref(() => { watch.invalid = true; }); } catch { observation = null; }
    // An unknown registration without its exact removal stays owned for good.
    if (typeof observation?.remove !== "function") { watch.invalid = true; fail("UNAVAILABLE"); }
    watch.remove = observation.remove;
    if (observation.registered !== true || !readbackOff()) { unwatch(watch); fail("UNAVAILABLE"); }
    return watch;
  }
  /** Literal true once the exact observer is gone; failures stay owned. */
  function unwatch(watch) {
    if (!watches.has(watch)) return true;
    watch.invalid = true;
    if (typeof watch.remove !== "function") return false;
    try { if (watch.remove() !== true) return false; } catch { return false; }
    watches.delete(watch);
    return true;
  }
  /** Earlier cleanup that is not positively done blocks a new owner: a child
   * lease of unknown state, a setup-orphan observer (retried here, exactly),
   * or a composed owner whose close failed or is still pending. */
  function cleanupOwed() {
    for (const watch of orphans()) unwatch(watch);
    return [...records].some(record => !record.begun && !record.retired) || orphans().length !== 0
      || [...owners].some(owner => owner.attempted && !owner.closed);
  }

  function authorityFor(window, expected) {
    if (expected.project_id === null) {
      // A project-less tab still needs the same settled publication.
      const revision = expected.project_revision;
      const check = () => { try { return services.readNativeProjectSnapshot()?.revision === revision; } catch { return false; } };
      return check() ? Object.freeze({ check }) : null;
    }
    let authority = null;
    try { authority = services.captureNativeProjectAuthority({ window, project_id: expected.project_id }); } catch { authority = null; }
    return authority?.id === expected.project_id && authority.revision === expected.project_revision
      && typeof authority.check === "function" ? authority : null;
  }

  /** The trusted projection still is the exact issued owner, privacy first. */
  function currentOwner(trusted, expected, authority) {
    try {
      if (closed || !ref(expected) || !authority) return false;
      const { tab, window, browser, browsingContext: context, windowGlobal: global, descriptor } = trusted;
      if (context.usePrivateBrowsing !== false || context.originAttributes?.privateBrowsingId !== 0) return false;
      if (descriptor.private !== false || descriptor.engine !== "gecko"
        || DESCRIPTOR_FIELDS.some(key => descriptor[key] !== expected[key])) return false;
      if (window.closed !== false || services.isNormalWindow(window) !== true) return false;
      if (tab.documentGlobal !== window || tab.closing !== false || tab.isConnected !== true || tab.linkedBrowser !== browser
        || window.gBrowser.getTabForBrowser(browser) !== tab) return false;
      if (browser.browsingContext !== context || context.currentWindowGlobal !== global || global.isCurrentGlobal !== true
        || global.isClosed !== false || context.originAttributes?.userContextId !== expected.userContextId) return false;
      if (String(global.innerWindowId) !== expected.document_id || global.documentURI?.spec !== expected.url) return false;
      return authority.check() === true;
    } catch { return false; }
  }
  const project = (expected, check) => {
    if (!ref(expected) || typeof expected.tab_id !== "string") return false;
    const authority = authorities.get(expected);
    return registry.withTrusted(expected.tab_id, trusted => check(trusted, authority) === true, { expected }) === true;
  };

  function getCaptureExpected(tab) {
    if (closed || !ref(tab) || typeof tab.tab_id !== "string") return null;
    let window = null;
    const expected = registry.withTrusted(tab.tab_id, trusted => { window = trusted.window; return trusted.descriptor; }, { expected: tab });
    if (!ref(expected) || !Object.isFrozen(expected)) return null;
    const authority = authorityFor(window, expected);
    if (!authority) return null;
    authorities.set(expected, authority);
    return project(expected, (trusted, held) => currentOwner(trusted, expected, held)) ? expected : null;
  }

  function isCaptureCurrent(expected, request) {
    try {
      if (closed || !ref(request) || request.expected !== expected || request.tab_id !== expected?.tab_id) return false;
      return project(expected, (trusted, authority) => currentOwner(trusted, expected, authority));
    } catch { return false; }
  }

  /** The selected, visible tab of its window, with bounded native viewport
   * size and no readback; read only, nothing is changed. */
  function selectedVisible(trusted) {
    try {
      const { tab, window, browser, browsingContext: context } = trusted;
      if (window.gBrowser.selectedTab !== tab || window.gBrowser.selectedBrowser !== browser) return false;
      if (window.document.hidden !== false || window.windowState === window.STATE_MINIMIZED || browser.docShellIsActive !== true) return false;
      if (context.overrideDPPX !== 0) return false;
      const rect = browser.getBoundingClientRect(), scale = window.devicePixelRatio, zoom = browser.fullZoom;
      if (![rect.width, rect.height, scale, zoom].every(value => Number.isFinite(value) && value > 0)) return false;
      const width = Math.ceil((rect.width / zoom) * scale), height = Math.ceil((rect.height / zoom) * scale);
      return width <= CAPTURE_SCOPE_LIMITS.side && height <= CAPTURE_SCOPE_LIMITS.side && width * height <= CAPTURE_SCOPE_LIMITS.pixels;
    } catch { return false; }
  }
  function nativeActive(expected, request, watch) {
    return watch.invalid === false && isCaptureCurrent(expected, request) && readbackOff() && watch.invalid === false
      && project(expected, (trusted, authority) => currentOwner(trusted, expected, authority) && selectedVisible(trusted));
  }

  // ---- the child lease protocol ------------------------------------------------------------
  const reply = (value, token, fields) => ref(value) && value.v === 1 && value.token === token
    && Object.keys(value).length === fields.length && fields.every(name => Object.hasOwn(value, name));
  function query(record, name, data) {
    record.pending++;
    return Promise.resolve().then(() => record.actor.sendQuery(name, data)).finally(() => { record.pending--; });
  }
  function bound(record) {
    try {
      const { request } = record;
      return !closed && !record.retired && !record.destroyed && project(request.expected, (trusted, authority) =>
        trusted.windowGlobal === record.windowGlobal && trusted.windowGlobal.getExistingActor(AGENT_CAPTURE_ACTOR) === record.actor
        && record.actor.manager === trusted.windowGlobal && currentOwner(trusted, request.expected, authority));
    } catch { return false; }
  }
  function markRetired(record) {
    record.retired = true;
    records.delete(record);
  }
  /** Idempotent positive retirement; coalesces one attempt at a time. */
  function retire(record) {
    if (record.retired) return Promise.resolve(true);
    // The child keeper is bound to the destroyed actor instance and its document.
    if (record.destroyed) { markRetired(record); return Promise.resolve(true); }
    if (record.retiring) return record.retiring;
    const attempt = query(record, AGENT_CAPTURE_MESSAGES.RELEASE, { v: 1, token: record.token, commit: false }).then(value => {
      if (reply(value, record.token, ["v", "token", "released", "committed"]) && value.released === true) markRetired(record);
      else if (record.destroyed) markRetired(record);
      return record.retired;
    }, () => { if (record.destroyed) markRetired(record); return record.retired; }).finally(() => { record.retiring = null; });
    record.retiring = attempt;
    return attempt;
  }

  async function beginReadLease(request, { signal } = {}) {
    if (closed || signal?.aborted) fail("NOT_APPROVED");
    const target = ref(request?.expected) ? registry.withTrusted(request.tab_id, trusted => {
      if (!currentOwner(trusted, request.expected, authorities.get(request.expected))) return null;
      const actor = trusted.windowGlobal.getActor(AGENT_CAPTURE_ACTOR);
      return ref(actor) ? Object.freeze({ actor, windowGlobal: trusted.windowGlobal }) : null;
    }, { expected: request.expected }) : null;
    if (!target) fail("NOT_APPROVED");
    const token = randomToken();
    if (typeof token !== "string" || !LEASE_TOKEN.test(token)) fail("UNAVAILABLE");
    // Kept before the query: a child that answers late still has an owner here.
    const record = { token, actor: target.actor, windowGlobal: target.windowGlobal, request, retired: false, destroyed: false,
      begun: false, pending: 0, retiring: null };
    records.add(record);
    let value;
    try { value = await query(record, AGENT_CAPTURE_MESSAGES.BEGIN, { v: 1, token }); }
    catch {
      // Unknown child state: retire it explicitly (a destroyed actor retires it).
      retire(record).catch(() => {});
      fail("UNAVAILABLE");
    }
    const shaped = reply(value, token, ["v", "token", "ok", "retained"]) && typeof value.ok === "boolean" && typeof value.retained === "boolean";
    if (!shaped || value.ok !== true || value.retained !== true) {
      // Only a refusal in which the child positively retained nothing ends
      // here. Retained, inconsistent or malformed state is retired by an exact
      // RELEASE (or the actor's destruction); until then it blocks new capture.
      if (shaped && value.ok === false && value.retained === false) markRetired(record); else retire(record).catch(() => {});
      fail("UNAVAILABLE");
    }
    record.begun = true;
    const lease = Object.freeze(Object.create(null));
    leases.set(lease, record);
    return lease;
  }

  async function validateReadLease(lease, request, { signal } = {}) {
    const record = leases.get(lease);
    if (!record || record.request !== request || signal?.aborted || !bound(record)) return false;
    let value;
    try { value = await query(record, AGENT_CAPTURE_MESSAGES.RECHECK, { v: 1, token: record.token }); } catch { return false; }
    return reply(value, record.token, ["v", "token", "ok"]) && value.ok === true && !signal?.aborted && bound(record);
  }

  async function releaseReadLease(lease, request, { commit = false, signal } = {}) {
    const record = leases.get(lease);
    if (!record || record.request !== request) return false;
    if (commit !== true) return retire(record);
    // Terminal commit: the child validates and retires in one turn. A lease
    // that cannot commit is still retired, never committed.
    if (!bound(record) || signal?.aborted) { await retire(record); return false; }
    let value;
    try { value = await query(record, AGENT_CAPTURE_MESSAGES.RELEASE, { v: 1, token: record.token, commit: true }); }
    catch { await retire(record); return false; }
    const shaped = reply(value, record.token, ["v", "token", "released", "committed"]);
    if (shaped && value.released === true) markRetired(record);
    else await retire(record);
    return shaped && value.released === true && value.committed === true && !record.destroyed;
  }

  function actorDestroyed(actor) {
    for (const record of [...records]) {
      if (record.actor !== actor) continue;
      record.destroyed = true;
      if (record.pending === 0) markRetired(record);
    }
  }

  // ---- the per-request reader and owner -----------------------------------------------------
  function createNativeReadSession(request, { signal } = {}) {
    if (closed || signal?.aborted) fail("NOT_APPROVED");
    const reader = createReadSession({ setTimer, clearTimer, timeoutMs, allocationBudget });
    return Object.freeze({
      capabilities: reader.capabilities,
      capture(expected, options = {}) {
        if (expected !== request.expected) fail("UNAVAILABLE");
        // The native descriptor of this same issued object, projected afresh.
        const native = registry.withTrusted(request.tab_id, trusted => currentOwner(trusted, expected, authorities.get(expected))
          ? Object.freeze({ browsingContext: trusted.browsingContext, document_id: trusted.descriptor.document_id, url: trusted.descriptor.url })
          : null, { expected });
        if (!native) fail("NOT_APPROVED");
        return reader.capture(native, { signal: options.signal });
      },
      // The reader's own awaited receipt, literal true only: its owned native
      // session and in-flight work settled. Anything else keeps it retained.
      close() {
        let receipt;
        try { receipt = reader.close(); } catch { return Promise.reject(new AgentToolError("UNAVAILABLE")); }
        return Promise.resolve(receipt).then(value => { if (value !== true) fail("UNAVAILABLE"); return true; },
          () => fail("UNAVAILABLE"));
      },
    });
  }

  function closeOwner(owner) {
    if (owner.closed) return Promise.resolve(true);
    if (owner.closing) return owner.closing;
    owner.attempted = true;
    const attempt = Promise.allSettled([Promise.resolve().then(() => owner.viewport.close()),
      Promise.resolve().then(() => owner.png.close())]).then(results => {
      // The readback observer stays until both composed owners are retired.
      const done = results.every(result => result.status === "fulfilled" && result.value === true) && unwatch(owner.watch);
      if (done) { owner.closed = true; owners.delete(owner); }
      return done;
    }).finally(() => { owner.closing = null; });
    owner.closing = attempt;
    return attempt;
  }

  function createCaptureOwner(request, context) {
    if (closed || !ref(context) || typeof context.isActive !== "function") fail("UNAVAILABLE");
    if (cleanupOwed()) fail("UNAVAILABLE");
    registerActor();
    const watch = watchReadback();
    // Every later setup step is owned: a PNG factory failure leaves the
    // observer a setup orphan (removed now, or kept while removal fails).
    let png;
    try { png = createPngBox({ loadTools: loadPngTools }); }
    catch (error) { unwatch(watch); throw error; }
    let viewport;
    try {
      viewport = createViewportCapture({
        isActive: (expected, value) => {
          try { return context.isActive(expected, value) === true && nativeActive(expected, value, watch); } catch { return false; }
        },
        beginReadLease, validateReadLease, releaseReadLease, createNativeReadSession,
        validatePng: (image, options) => png.validatePng(image, options),
        resizePng: (image, options) => png.resizePng(image, options),
        setTimer, clearTimer, timeoutMs, cleanupTimeoutMs,
      });
    } catch (error) {
      // The PNG owner exists already: the observer stays attached to it until
      // it closed positively.
      const partial = { viewport: { close: () => true }, png, watch, closing: null, closed: false, attempted: false };
      watch.owner = partial;
      owners.add(partial);
      closeOwner(partial).catch(() => {});
      throw error;
    }
    const owner = { viewport, png, watch, closing: null, closed: false, attempted: false };
    watch.owner = owner;
    owners.add(owner);
    return Object.freeze({
      captureViewport: (value, options) => viewport.captureViewport(value, options),
      close: () => closeOwner(owner),
    });
  }

  /** Permanently denies new capture, then retires every retained owner, lease
   * and setup orphan. An attached observer goes only with its owner's positive
   * close, never because close was asked. Literal true only when nothing
   * remains; a later call retries the rest. */
  async function close() {
    closed = true;
    const results = await Promise.allSettled([...[...owners].map(closeOwner), ...[...records].map(retire)]);
    const removed = orphans().map(unwatch).every(Boolean);
    const done = results.every(result => result.status === "fulfilled" && result.value === true) && removed
      && owners.size === 0 && records.size === 0 && watches.size === 0;
    if (done && installed === runtime) installed = null;
    return done;
  }

  const runtime = Object.freeze({
    getCaptureExpected, isCaptureCurrent, createCaptureOwner, actorDestroyed, close,
    /** Counts only: no URL, token, handle or image. */
    getState: () => Object.freeze({ closed, owners: owners.size, live_leases: [...records].filter(record => record.begun).length,
      unknown_leases: [...records].filter(record => !record.begun).length, readback_observers: watches.size,
      orphan_observers: orphans().length,
      cleanup_incomplete: owners.size !== 0 || records.size !== 0 || watches.size !== 0 }),
  });
  installed = runtime;
  return runtime;
}
