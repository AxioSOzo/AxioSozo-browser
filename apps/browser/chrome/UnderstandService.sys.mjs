/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free privileged facade. Production and offline construction are separate.
// Every project/filesystem/process boundary is an injected trusted callback.
import { createUnderstand, projectBinding, sameProjectBinding, makeBriefRecord,
  withProjectBrief, UNDERSTAND_LIVE } from "./Understand.sys.mjs";
import { createManifestAcceptance, acceptanceSnapshot }
  from "./ProjectManifestAccept.sys.mjs";

export const SERVICE_LIMITS = Object.freeze({ owners: 64, history: 8, leases: 32, publications: 32,
  leaseMs: 120000, startupMs: 5000, closeMs: 1000 });
const PROJECT = /^p_[a-z0-9]{4,32}$/u;
const REQUEST = /^[A-Za-z0-9_.:-]{1,160}$/u;
const TOKEN = /^[A-Za-z0-9_-]{16,128}$/u;
const OFFLINE_ROOT = /^\/Volumes\/AxioSozoBuild\/workstation\/gui-fixtures\/understand-[0-9a-f]{32}\/projects\/(?:harbor|inkline)$/u;
const ALLOWED_ERRORS = new Set(["INVALID_PARAMS", "INVALID_MANIFEST", "MANIFEST_SECRET", "TOO_LARGE", "DIRECTORY_REFUSED",
  "MANIFEST_REFUSED", "IDENTITY_CHANGED", "MANIFEST_CHANGED", "UNCONFIRMED_FIELDS", "WRITE_FAILED", "BUSY",
  "WRITE_OUTCOME_UNKNOWN", "WRITE_CONTAINMENT_UNAVAILABLE", "WRITE_CONTAINMENT_REFUSED", "STALE_ACCEPTANCE"]);
export class UnderstandServiceError extends Error {
  constructor(code) { super(code); this.name = "UnderstandServiceError"; this.code = code; }
}
const fail = code => { throw new UnderstandServiceError(code); };
const plain = value => value !== null && typeof value === "object" && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const data = value => plain(value) && Reflect.ownKeys(value).every(key => typeof key === "string"
  && Object.hasOwn(Object.getOwnPropertyDescriptor(value, key) ?? {}, "value"));
function shape(value, required, optional = [], code = "INVALID_PARAMS") {
  if (!data(value) || required.some(key => !Object.hasOwn(value, key))
      || Reflect.ownKeys(value).some(key => ![...required, ...optional].includes(key))) fail(code);
}
const freeze = value => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
};
const copy = value => JSON.parse(JSON.stringify(value));
const sameJSON = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const denied = (request_id, cli) => freeze({ version: 1, request_id, kind: "brief", cli,
  status: "unavailable", reason: UNDERSTAND_LIVE, document: null, data_sent: false, duration_ms: 0 });
const stale = result => freeze({ ...result, status: "cancelled", reason: "STALE_PROJECT", document: null });

/** Always closed: accepts no runtime/opener/test flag. */
export function createUnderstandService(dependencies) { return createFacade(dependencies, null); }
/** Privileged offline-fixture constructor; never an actor/pref/MCP entry point. */
export function createOfflineUnderstandService(dependencies, opener) {
  shape(opener, ["openRuntime"], [], "INVALID_DEPENDENCIES");
  if (typeof opener.openRuntime !== "function") fail("INVALID_DEPENDENCIES");
  return createFacade(dependencies, opener.openRuntime);
}

function createFacade(dependencies, openRuntime) {
  shape(dependencies, ["core", "lookupSnapshot", "rootAdmission", "commitProject", "uuid"],
    ["manifestIO", "clock", "timers", "onState"], "INVALID_DEPENDENCIES");
  const { core, lookupSnapshot, rootAdmission, commitProject, uuid, manifestIO = null,
    clock = Date.now, timers = globalThis, onState = () => {} } = dependencies;
  if ([lookupSnapshot, rootAdmission, commitProject, uuid, clock, onState].some(fn => typeof fn !== "function")
      || ["validateProject", "upgradeProject", "validateBriefRecord", "validateManifest", "serializeManifest", "assertNoSecrets"]
        .some(name => typeof core?.[name] !== "function")
      || typeof timers?.setTimeout !== "function" || typeof timers?.clearTimeout !== "function"
      || manifestIO !== null && (typeof manifestIO?.snapshot !== "function" || typeof manifestIO?.accept !== "function")) fail("INVALID_DEPENDENCIES");
  const owners = new Map(), jobs = new Map(), epochs = new Map(), leases = new Map(), reservations = new Set();
  const publications = new Map(), writing = new Set(), inspecting = new Set(), lifetime = new AbortController();
  let closed = false, retired = false, controller = null, opening = null, runtime = null, roots = null;
  let metadata = Object.freeze([]), submitting = null, immediateSequence = 0, readsReserved = 0, lastClock = -1;
  const now = () => { const at = clock(); if (!Number.isSafeInteger(at) || at < lastClock || at < 0) fail("INVALID_TIME"); lastClock = at; return at; };
  const epoch = id => { if (!epochs.has(id)) epochs.set(id, Symbol()); return epochs.get(id); };
  const admitted = root => { try { return rootAdmission(root) === true; } catch { return false; } };
  const live = owner => {
    if (closed || !owners.has(owner) || owners.get(owner).abort.signal.aborted) return false;
    try { return owners.get(owner).current() === true; } catch { return false; }
  };
  function requireOwner(owner) {
    if (closed) fail("SERVICE_CLOSED");
    if (!live(owner)) { releaseOwner(owner); fail("OWNER_REVOKED"); }
    return owners.get(owner);
  }
  function normalized(value, expectedId) {
    shape(value, ["binding", "record"], [], "INVALID_PROJECT");
    const binding = projectBinding(value.binding), record = core.validateProject(core.upgradeProject(value.record));
    if (binding.id !== expectedId || record.id !== expectedId || record.root !== binding.canonicalRoot
        || !admitted(binding.canonicalRoot)) fail("INVALID_PROJECT");
    core.assertNoSecrets(record.manifest);
    return freeze({ binding, record });
  }
  const snapshot = id => normalized(lookupSnapshot(id), id);
  function current(owner, bound, stamp, brief = undefined) {
    if (!live(owner) || epoch(bound.id) !== stamp) return false;
    try {
      const latest = snapshot(bound.id);
      return sameProjectBinding(bound, latest.binding) && (brief === undefined || sameJSON(brief, latest.record.brief));
    } catch { return false; }
  }
  function guardLatest(owner, bound, stamp, latest, brief = undefined) {
    if (!live(owner) || epoch(bound.id) !== stamp) fail("STALE_PROJECT");
    latest = normalized(latest, bound.id);
    if (!sameProjectBinding(bound, latest.binding) || brief !== undefined && !sameJSON(brief, latest.record.brief)) fail("STALE_PROJECT");
    return latest;
  }
  function notify(owner, state) {
    try { onState(owner, freeze(copy(state))); } catch { /* Presentation cannot grant authority. */ }
  }
  function publishJob(id, job, state) {
    job.state = freeze(copy(state));
    if (owners.has(job.owner)) {
      if (state.state === "complete") {
        const completed = [...jobs.entries()].filter(([, item]) => item.owner === job.owner && item.state?.state === "complete");
        for (const [old] of completed.slice(0, Math.max(0, completed.length - SERVICE_LIMITS.history))) jobs.delete(old);
      }
      notify(job.owner, state);
    } else if (state.state === "complete") jobs.delete(id);
  }
  function controllerState(state) {
    let job = jobs.get(state.request_id);
    if (!job && submitting && state.state === "queued") {
      job = { owner: submitting.owner, projectId: submitting.projectId, state: null, terminal: null };
      jobs.set(state.request_id, job);
    }
    if (!job) return;
    if (state.state === "complete" && state.status === "ok") {
      job.terminal = state;
      publishJob(state.request_id, job, { ...state, state: "persisting", status: null });
    } else publishJob(state.request_id, job, state);
    // The controller emits before handing a run to its runtime. An
    // observer may synchronously revoke authority without firing a signal.
    // Convert that revocation to the owner's signal while handoff is still zero.
    if (!live(job.owner)) releaseOwner(job.owner);
  }
  function finishRead(id, result) {
    const job = jobs.get(id);
    if (!job?.terminal) return;
    const state = { ...job.terminal, state: "complete", status: result.status, reason: result.reason, data_sent: result.data_sent };
    job.terminal = null;
    publishJob(id, job, state);
  }
  function revokeLeases(owner = null, id = null) {
    for (const [token, lease] of leases) if ((owner === null || lease.owner === owner) && (id === null || lease.binding.id === id)) {
      leases.delete(token); lease.acceptance.invalidate();
    }
  }
  function pruneLeases() {
    const at = now();
    for (const [token, lease] of leases) if (at >= lease.expires || !current(lease.owner, lease.binding, lease.stamp, lease.brief)) {
      leases.delete(token); lease.acceptance.invalidate();
    }
  }
  function createOwner({ current: isCurrent, signal } = {}) {
    if (closed) fail("SERVICE_CLOSED");
    if (typeof isCurrent !== "function" || signal !== undefined && (typeof signal?.addEventListener !== "function"
        || typeof signal?.removeEventListener !== "function" || typeof signal.aborted !== "boolean")) fail("INVALID_OWNER");
    if (owners.size >= SERVICE_LIMITS.owners) fail("BUSY");
    const owner = Object.freeze(Object.create(null)), abort = new AbortController();
    const release = () => releaseOwner(owner);
    owners.set(owner, { current: isCurrent, abort, signal, release });
    signal?.addEventListener("abort", release, { once: true });
    if (signal?.aborted || !live(owner)) { releaseOwner(owner); fail("OWNER_REVOKED"); }
    return owner;
  }
  function releaseOwner(owner) {
    const item = owners.get(owner);
    if (!item) return false;
    owners.delete(owner); item.signal?.removeEventListener("abort", item.release);
    revokeLeases(owner); item.abort.abort();
    for (const [id, job] of jobs) if (job.owner === owner && job.state?.state === "complete") jobs.delete(id);
    return true;
  }
  function invalidateProject(id) {
    if (typeof id !== "string" || !PROJECT.test(id)) fail("INVALID_PROJECT");
    epochs.set(id, Symbol()); revokeLeases(null, id); controller?.invalidateProject(id);
  }
  async function closeBounded(close) {
    let timer;
    try { await Promise.race([Promise.resolve().then(close).catch(() => {}), new Promise(resolve => {
      timer = timers.setTimeout(resolve, SERVICE_LIMITS.closeMs);
    })]); } finally { timers.clearTimeout(timer); }
  }
  async function ensureRuntime() {
    if (!openRuntime || closed || retired || controller?.diagnostics().closed) fail("UNDERSTAND_UNAVAILABLE");
    if (controller) return controller;
    if (!opening) {
      let timer, abandoned = false, returned, disposing = null, onAbort;
      const dispose = () => disposing ??= closeBounded(() => returned?.transport?.close?.());
      const source = Promise.resolve().then(() => openRuntime({ signal: lifetime.signal }));
      // A late owned return is always retired, never published after timeout/close.
      source.then(value => { returned = value; if (abandoned || closed || retired) void dispose(); }, () => {});
      opening = (async () => {
        try {
          const value = await Promise.race([source, new Promise((_, reject) => { timer = timers.setTimeout(() => {
            abandoned = true; retired = true; lifetime.abort(); reject(new UnderstandServiceError("UNDERSTAND_UNAVAILABLE"));
          }, SERVICE_LIMITS.startupMs); }), new Promise((_, reject) => {
            onAbort = () => reject(new UnderstandServiceError("UNDERSTAND_UNAVAILABLE"));
            lifetime.signal.addEventListener("abort", onAbort, { once: true });
            if (lifetime.signal.aborted) onAbort();
          })]);
          if (closed || retired || lifetime.signal.aborted) fail("UNDERSTAND_UNAVAILABLE");
          shape(value, ["transport", "projectRoots"], [], "UNDERSTAND_UNAVAILABLE");
          if (!["request", "cancel", "close"].every(name => typeof value.transport?.[name] === "function")
              || !Array.isArray(value.projectRoots) || value.projectRoots.length < 1 || value.projectRoots.length > 2
              || value.projectRoots.some(root => typeof root !== "string" || !OFFLINE_ROOT.test(root))
              || new Set(value.projectRoots).size !== value.projectRoots.length) {
            abandoned = true; await dispose(); fail("UNDERSTAND_UNAVAILABLE");
          }
          roots = Object.freeze([...value.projectRoots]);
          runtime = Object.freeze({ request: (...args) => value.transport.request(...args),
            cancel: (...args) => value.transport.cancel(...args), close: dispose });
          controller = createUnderstand({ core, runtime, timers, now, uuid, testOnlyAllowRun: true,
            lookupProject: id => snapshot(id).binding, onState: controllerState,
            authorizeContext: (context, binding) => roots.includes(binding.canonicalRoot)
              && current(context.owner, binding, context.stamp) });
          return controller;
        } catch { abandoned = true; retired = true; lifetime.abort(); if (returned) await dispose(); fail("UNDERSTAND_UNAVAILABLE"); }
        finally { timers.clearTimeout(timer); lifetime.signal.removeEventListener("abort", onAbort); }
      })();
    }
    return opening;
  }
  function requestParams(params) {
    shape(params, ["projectId", "cli"], ["timeoutMs"]);
    if (typeof params.projectId !== "string" || !PROJECT.test(params.projectId) || !["claude-code", "codex"].includes(params.cli)
        || params.timeoutMs !== undefined && (!Number.isSafeInteger(params.timeoutMs) || params.timeoutMs < 10000 || params.timeoutMs > 300000)) fail("INVALID_PARAMS");
  }
  function projectParams(params) { shape(params, ["projectId"]); if (typeof params.projectId !== "string" || !PROJECT.test(params.projectId)) fail("INVALID_PARAMS"); }
  function immediateId() {
    const base = uuid();
    if (typeof base !== "string") fail("INVALID_DEPENDENCIES");
    const id = `${base}:${++immediateSequence}`;
    if (!REQUEST.test(id)) fail("INVALID_DEPENDENCIES");
    return id;
  }
  async function state(owner, params) {
    requireOwner(owner); projectParams(params);
    // The closed product path performs no project lookup, admission or factory work.
    if (!openRuntime) return freeze({ authorization: UNDERSTAND_LIVE, mode: "PRODUCTION", clis: [], jobs: [] });
    snapshot(params.projectId); requireOwner(owner);
    return freeze({ authorization: UNDERSTAND_LIVE, mode: "OFFLINE_FIXTURE", clis: copy(metadata),
      jobs: [...jobs.values()].filter(job => job.owner === owner && job.projectId === params.projectId).map(job => copy(job.state)) });
  }
  async function available(owner, params) {
    requireOwner(owner); projectParams(params);
    if (!openRuntime) return freeze({ authorization: UNDERSTAND_LIVE, clis: [] });
    const initial = snapshot(params.projectId), stamp = epoch(params.projectId);
    if (!OFFLINE_ROOT.test(initial.binding.canonicalRoot)) fail("INVALID_PROJECT");
    const api = await ensureRuntime();
    requireOwner(owner);
    if (!current(owner, initial.binding, stamp) || !roots.includes(initial.binding.canonicalRoot)) fail("STALE_PROJECT");
    const value = await api.available({ isActive: () => current(owner, initial.binding, stamp) });
    if (!current(owner, initial.binding, stamp)) fail("STALE_PROJECT");
    metadata = freeze(value.clis.map(({ cli, version }) => ({ cli, version })));
    return freeze({ authorization: UNDERSTAND_LIVE, clis: copy(metadata) });
  }
  async function commit(owner, bound, stamp, transform, brief = undefined) {
    let next = null, invoked = 0;
    const receipt = await commitProject({ binding: bound, mutate(latest) {
      if (++invoked !== 1) fail("INVALID_COMMIT");
      latest = guardLatest(owner, bound, stamp, latest, brief);
      next = core.validateProject(transform(latest.record));
      if (next.id !== bound.id || next.root !== bound.canonicalRoot) fail("INVALID_COMMIT");
      return next;
    } });
    shape(receipt, ["committed", "snapshot"], [], "INVALID_COMMIT");
    if (invoked !== 1 || receipt.committed !== true || !next) fail("INVALID_COMMIT");
    const saved = normalized(receipt.snapshot, bound.id);
    if (saved.binding.canonicalRoot !== bound.canonicalRoot || sameProjectBinding(saved.binding, bound)
        || !sameJSON(saved.record, next)) fail("INVALID_COMMIT");
    // Invalidate old queued work/leases only after this serialized commit publishes.
    invalidateProject(bound.id);
    if (!current(owner, saved.binding, epoch(bound.id))) fail("STALE_PROJECT");
    return saved;
  }
  async function read(owner, params) {
    const ownerData = requireOwner(owner); requestParams(params);
    if (!openRuntime) return denied(immediateId(), params.cli);
    if (readsReserved >= 5) return freeze({ ...denied(immediateId(), params.cli), status: "busy", reason: "QUEUE_FULL" });
    readsReserved++;
    let completedId = null;
    try {
    const initial = snapshot(params.projectId), stamp = epoch(params.projectId);
    if (!OFFLINE_ROOT.test(initial.binding.canonicalRoot)) fail("INVALID_PROJECT");
    const api = await ensureRuntime();
    requireOwner(owner);
    if (!current(owner, initial.binding, stamp) || !roots.includes(initial.binding.canonicalRoot)) fail("STALE_PROJECT");
    const before = submitting;
    let pending;
    submitting = { owner, projectId: params.projectId };
    try { pending = api.run(params, { signal: ownerData.abort.signal, context: { owner, stamp },
      isActive: () => current(owner, initial.binding, stamp) }); }
    finally { submitting = before; }
    const completion = await pending;
    completedId = completion.result.request_id;
    requireOwner(owner);
    if (!current(owner, initial.binding, stamp)) {
      const result = stale(completion.result); finishRead(completedId, result); return result;
    }
    if (completion.result.status !== "ok") return completion.result;
    const brief = makeBriefRecord(completion, initial.binding, { core, now: now() });
    try {
      const saved = await commit(owner, initial.binding, stamp, record => withProjectBrief(record, brief, { core, now: now() }));
      finishRead(completedId, completion.result);
      if (!current(owner, saved.binding, epoch(params.projectId))) return stale(completion.result);
    }
    catch (error) {
      if (["STALE_PROJECT", "OWNER_REVOKED", "SERVICE_CLOSED"].includes(error?.code)) {
        const result = stale(completion.result); finishRead(completedId, result); return result;
      }
      finishRead(completedId, { status: "failed", reason: "BRIEF_SAVE_FAILED", data_sent: completion.result.data_sent });
      fail("BRIEF_SAVE_FAILED");
    }
    return completion.result;
    } finally {
      if (completedId) {
        const terminal = jobs.get(completedId)?.terminal;
        if (terminal) finishRead(completedId, { status: "cancelled", reason: "STALE_PROJECT", data_sent: terminal.data_sent });
      }
      readsReserved--;
    }
  }
  function cancel(owner, params) {
    requireOwner(owner); shape(params, ["projectId", "requestId"]);
    if (typeof params.projectId !== "string" || !PROJECT.test(params.projectId) || typeof params.requestId !== "string" || !REQUEST.test(params.requestId)) fail("INVALID_PARAMS");
    const job = jobs.get(params.requestId);
    return freeze(job?.owner === owner && job.projectId === params.projectId && job.state?.state !== "complete"
      ? controller.cancel(params.requestId) : { cancelled: false });
  }
  async function preview(owner, params) {
    requireOwner(owner); projectParams(params);
    if (!manifestIO) fail("WRITE_CONTAINMENT_UNAVAILABLE");
    pruneLeases();
    if (writing.has(params.projectId) || inspecting.has(params.projectId)) fail("BUSY");
    if (publications.has(params.projectId)) fail("MANIFEST_REINSPECTION_REQUIRED");
    if (leases.size + reservations.size >= SERVICE_LIMITS.leases) fail("BUSY");
    const initial = snapshot(params.projectId), stamp = epoch(params.projectId);
    if (!initial.record.brief) fail("BRIEF_UNAVAILABLE");
    const brief = core.validateBriefRecord(initial.record.brief), token = uuid();
    if (typeof token !== "string" || !TOKEN.test(token) || leases.has(token) || reservations.has(token)) fail("INVALID_DEPENDENCIES");
    reservations.add(token);
    const acceptance = createManifestAcceptance({ io: manifestIO, rootAdmission: admitted, clock: now, newToken: () => token, maxPending: 1 });
    const guard = () => current(owner, initial.binding, stamp, brief);
    try {
      const value = await acceptance.preview({ root: initial.binding.canonicalRoot, baseManifest: initial.record.manifest, guard });
      if (!guard() || publications.has(params.projectId) || writing.has(params.projectId) || inspecting.has(params.projectId)) fail("STALE_ACCEPTANCE");
      const expires = now() + SERVICE_LIMITS.leaseMs;
      if (!Number.isSafeInteger(expires)) fail("INVALID_TIME");
      leases.set(token, { owner, binding: initial.binding, stamp, brief, manifest: value.manifest, expires, acceptance });
      return freeze({ token, manifest: value.manifest });
    } catch (error) { acceptance.invalidate(); throw new UnderstandServiceError(ALLOWED_ERRORS.has(error?.code) ? error.code : "WRITE_CONTAINMENT_UNAVAILABLE"); }
    finally { reservations.delete(token); }
  }
  function outcome(status, committed, reason = null) { return freeze({ status, committed, reason }); }
  async function inspect(owner, id) {
    requireOwner(owner);
    const owed = publications.get(id);
    if (!owed) return outcome("UNCHANGED", false);
    if (writing.has(id) || inspecting.has(id)) fail("BUSY");
    inspecting.add(id);
    try {
    const before = snapshot(id);
    if (before.binding.canonicalRoot !== owed.binding.canonicalRoot) fail("STALE_PROJECT");
    const inspectGuard = () => {
      if (!live(owner)) return false;
      try { return snapshot(id).binding.canonicalRoot === owed.binding.canonicalRoot; } catch { return false; }
    };
    const seen = acceptanceSnapshot(await manifestIO.snapshot(owed.binding.canonicalRoot, { admit: inspectGuard }));
    if (!inspectGuard()) fail("STALE_PROJECT");
    if (owed.committed !== true) { publications.delete(id); return outcome("INSPECTED", owed.committed, "WRITE_OUTCOME_UNKNOWN"); }
    if (seen.target === null || !sameJSON(seen.manifest, owed.manifest)
        || owed.digest !== null && seen.target.digest !== owed.digest) {
      publications.delete(id); return outcome("CHANGED", true, "MANIFEST_CHANGED");
    }
    if (!current(owner, owed.binding, owed.stamp, owed.brief)) {
      publications.delete(id); return outcome("CHANGED", true, "STALE_PROJECT");
    }
    // Only a known native commit with matching fresh inspection can mark accepted.
    await commit(owner, owed.binding, owed.stamp, record => core.validateProject({ ...record,
      manifest: seen.manifest, manifest_state: "written", brief: { ...owed.brief, accepted: true }, updated_at: now() }), owed.brief);
    publications.delete(id);
    return outcome("ACCEPTED", true);
    } finally { inspecting.delete(id); }
  }
  async function accept(owner, params) {
    requireOwner(owner);
    // Recognize ownership before consuming a lease; another owner cannot burn it.
    if (!data(params)) fail("INVALID_PARAMS");
    const lease = typeof params.token === "string" ? leases.get(params.token) : null;
    if (!lease || lease.owner !== owner) fail("STALE_ACCEPTANCE");
    leases.delete(params.token);
    try {
      shape(params, ["projectId", "token", "edits", "confirmed"]);
      if (typeof params.projectId !== "string" || !PROJECT.test(params.projectId) || params.projectId !== lease.binding.id || params.confirmed !== true) fail("STALE_ACCEPTANCE");
      shape(params.edits, [], ["name", "kind"]);
      if (Object.keys(params.edits).length === 0 || now() >= lease.expires
          || !current(owner, lease.binding, lease.stamp, lease.brief)) fail("STALE_ACCEPTANCE");
      if (writing.has(params.projectId) || inspecting.has(params.projectId)) fail("BUSY");
      if (publications.has(params.projectId)) fail("MANIFEST_REINSPECTION_REQUIRED");
      if (publications.size >= SERVICE_LIMITS.publications) fail("BUSY");
      const manifest = core.validateManifest({ ...lease.manifest, ...params.edits });
      core.serializeManifest(manifest); // Strict no-secret manifest gate; no AI fields copied.
      const owed = { ...lease, manifest, committed: null, digest: null };
      publications.set(params.projectId, owed); writing.add(params.projectId);
      try {
        const result = await lease.acceptance.accept({ token: params.token, edits: params.edits });
        owed.committed = true; owed.digest = result.digest;
      } catch (error) {
        const certainty = error?.committed;
        if (certainty === false) { publications.delete(params.projectId);
          return outcome("REFUSED", false, ALLOWED_ERRORS.has(error?.code) ? error.code : "WRITE_CONTAINMENT_UNAVAILABLE"); }
        owed.committed = certainty === true ? true : null;
      } finally { writing.delete(params.projectId); }
      if (!live(owner)) return outcome("REINSPECTION_REQUIRED", owed.committed, "WRITE_OUTCOME_UNKNOWN");
      try { return await inspect(owner, params.projectId); }
      catch { return outcome("REINSPECTION_REQUIRED", owed.committed, "WRITE_OUTCOME_UNKNOWN"); }
    } finally { lease.acceptance.invalidate(); }
  }
  async function reinspect(owner, params) {
    requireOwner(owner); projectParams(params);
    if (!manifestIO) fail("WRITE_CONTAINMENT_UNAVAILABLE");
    return inspect(owner, params.projectId);
  }
  async function close() {
    if (closed) return;
    closed = true;
    for (const owner of [...owners.keys()]) releaseOwner(owner);
    revokeLeases(); lifetime.abort();
    await closeBounded(() => controller?.close());
    if (runtime) await runtime.close();
    metadata = Object.freeze([]);
  }
  const safe = fn => async (...args) => {
    try { return await fn(...args); }
    catch (error) {
      if (error instanceof UnderstandServiceError) throw error;
      throw new UnderstandServiceError(ALLOWED_ERRORS.has(error?.code) ? error.code : "SERVICE_FAILURE");
    }
  };
  return Object.freeze({ createOwner, releaseOwner, invalidateProject, state: safe(state), available: safe(available), read: safe(read),
    cancel, preview: safe(preview), accept: safe(accept), reinspect: safe(reinspect), close,
    diagnostics: () => freeze({ closed, retired, owners: owners.size, leases: leases.size, previews: reservations.size,
      publications: publications.size, writes: writing.size, inspections: inspecting.size, reads: readsReserved, runtime: controller !== null, ...controller?.diagnostics() }) });
}
