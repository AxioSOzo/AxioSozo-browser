/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Engine-neutral client of contracts/engine-stream-v1.md (fixture profile): one
// authenticated host process on inherited pipes, exact target + generation binding,
// one-outstanding frame credit, bounded requests and input, heartbeat liveness.
// Engine specifics (ready identity, cursor set, history-restore statuses) come from
// a profile object, so a host only adds its profile (WebKitEngineAdapter.sys.mjs).
//
// The Chromium path (CEFEngineAdapter.sys.mjs) still carries its own copy of this
// logic with CEF-only extensions (surface mode, web mode, UI delegation, a11y). It is
// the same protocol; moving CEF onto this module is a later, separate step.

import { DamagePayloadAssembler, validMemfdCapability, validMemfdFrame, memfdSlotReader, disableMemfdFrames,
  MEMFD_FALLBACK_ACK } from "./EngineFrameSurface.sys.mjs";
export const MAX_FRAME_BYTES = 33554432;
export const MAX_SURFACE_DIMENSION = 4096;
export const HEARTBEAT_TIMEOUT_MS = 5000;
const HEARTBEAT_CHECK_MS = 1000;
const HEARTBEAT_STALL_MS = 2500;
const MAX_INFLIGHT_REQUESTS = 16;
const MAX_INFLIGHT_INPUT = 8;
const MAX_QUEUED_INPUT = 64;
// §2: fixture request ids are unique per host, at most 100,000.
const MAX_REQUESTS = 100000;
const UNTIMED_METHODS = new Set(["navigate", "back", "forward", "reload"]);
export const WHEEL_PHASES = new Set(["none", "may_begin", "began", "changed", "stationary", "ended", "cancelled"]);
export const EDIT_ACTIONS = Object.freeze(["copy", "cut", "paste", "select_all", "undo", "redo"]);
export const FRAME_RATES = Object.freeze([60, 120]);
const TARGET_KEYS = ["tab_id", "engine", "engine_instance", "native_target_id", "identity",
  "document_generation", "navigation_generation", "private_mode"];
const PENDING_KEYS = TARGET_KEYS.filter(key => !["engine", "native_target_id"].includes(key));
const FRAME_KEYS = ["version", "target", "frame_id", "width", "height", "stride", "device_scale", "format"];
const isObject = value => !!value && typeof value === "object" && !Array.isArray(value);
const hasKeys = (value, keys) => isObject(value) && Object.keys(value).length === keys.length
  && Object.keys(value).every(key => keys.includes(key));
const id = value => typeof value === "string" && /^[a-zA-Z0-9_:/.-]{1,128}$/u.test(value);
const uint = value => Number.isSafeInteger(value) && value >= 0;

export const sameStreamTarget = (a, b) => TARGET_KEYS.every(key => a?.[key] === b?.[key]);

export function validFixtureOrigin(origin) {
  if (typeof origin !== "string" || origin.length > 128) return false;
  try {
    const url = new URL(origin);
    return url.protocol === "http:" && url.hostname === "127.0.0.1" && !!url.port
      && url.origin === origin && !url.username && !url.password;
  } catch { return false; }
}

/** §7: only the synthetic page and its GET page 2 of the hello's loopback origin. */
export function allowedFixtureURL(value, origin) {
  if (typeof value !== "string" || value.length > 4096 || !validFixtureOrigin(origin)) return false;
  try {
    const url = new URL(value);
    return url.origin === origin && url.pathname === "/engine.html"
      && !url.hash && !url.username && !url.password && ["", "?page=2"].includes(url.search);
  } catch { return false; }
}

export function validateStreamTarget(value, { engine, identity, pending = false }) {
  if (!hasKeys(value, pending ? PENDING_KEYS : TARGET_KEYS)
      || !id(value.tab_id) || !id(value.engine_instance)
      || !uint(value.document_generation) || !uint(value.navigation_generation)
      || value.private_mode !== false || value.identity !== identity || !validFixtureOrigin(value.identity)
      || (!pending && (value.engine !== engine || !id(value.native_target_id)))) {
    throw new Error("INVALID_ENGINE_TARGET");
  }
  return Object.freeze({ ...value });
}

/** §4 resize/create bounds: 1..4096 logical px, scale 1..4, physical ≤ 4096 px/side and ≤ 32 MiB. */
export function validateStreamSurface({ width, height, device_scale } = {}) {
  if (![width, height].every(value => Number.isInteger(value) && value > 0 && value <= MAX_SURFACE_DIMENSION)
      || !Number.isFinite(device_scale) || device_scale < 1 || device_scale > 4) throw new Error("INVALID_SURFACE");
  const physicalWidth = Math.ceil(width * device_scale), physicalHeight = Math.ceil(height * device_scale);
  if (physicalWidth > MAX_SURFACE_DIMENSION || physicalHeight > MAX_SURFACE_DIMENSION
      || physicalWidth * physicalHeight * 4 > MAX_FRAME_BYTES) throw new Error("UNSUPPORTED_SURFACE");
  return { width, height, device_scale };
}

/** Steps the render scale down in quarters until the 32 MiB pipe bound fits (logical size unchanged). */
export function fitStreamSurface({ width, height, device_scale }) {
  for (let quarter = Math.ceil(device_scale * 4); quarter >= 4; quarter--) {
    const scale = quarter === Math.ceil(device_scale * 4) ? device_scale : quarter / 4;
    try { return validateStreamSurface({ width, height, device_scale: Math.max(1, scale) }); }
    catch (error) { if (error.message !== "UNSUPPORTED_SURFACE") throw error; }
  }
  throw new Error("UNSUPPORTED_SURFACE");
}

/** Input fields (§4) for key/mouse/wheel and the profile's `ime_commit_text`. */
export function validateStreamInput(method, fields, surface, { wheelPhases = false, imeCommit = false, imeLimit = 1024 } = {}) {
  if (method === "ime_commit_text") {
    if (!imeCommit || !hasKeys(fields, ["text"]) || typeof fields.text !== "string"
        || !fields.text.length || fields.text.length > imeLimit) throw new Error("INVALID_ENGINE_IME");
    return { text: fields.text };
  }
  const required = {
    key: ["type", "native_key_code", "windows_key_code", "modifiers", "text"],
    mouse: ["type", "x", "y", "modifiers", "button", "click_count", "mouse_leave"],
    wheel: ["x", "y", "modifiers", "delta_x", "delta_y"],
  }[method];
  const bounded = (value, max) => uint(value) && value <= max;
  const phased = method === "wheel" && isObject(fields) && "phase" in fields;
  if (phased && !wheelPhases) throw new Error("INVALID_ENGINE_INPUT");
  if (!required || !hasKeys(fields, phased ? [...required, "phase", "momentum_phase", "precise"] : required)
      || !bounded(fields.modifiers, 131071)) throw new Error("INVALID_ENGINE_INPUT");
  if (method === "key") {
    if (!["down", "up", "char"].includes(fields.type) || !bounded(fields.native_key_code, 65535)
        || !bounded(fields.windows_key_code, 255) || typeof fields.text !== "string" || fields.text.length > 4) throw new Error("INVALID_ENGINE_KEY");
    return { ...fields };
  }
  if (!surface || !bounded(fields.x, surface.width) || !bounded(fields.y, surface.height)) throw new Error("INVALID_ENGINE_POINT");
  if (method === "mouse" && (!["move", "down", "up"].includes(fields.type)
      || !["left", "middle", "right"].includes(fields.button) || !bounded(fields.click_count, 3)
      || fields.click_count < 1 || typeof fields.mouse_leave !== "boolean")) throw new Error("INVALID_ENGINE_MOUSE");
  if (method === "wheel" && (![fields.delta_x, fields.delta_y].every(value => Number.isInteger(value) && Math.abs(value) <= 4096)
      || (phased && (!WHEEL_PHASES.has(fields.phase) || !WHEEL_PHASES.has(fields.momentum_phase)
        || typeof fields.precise !== "boolean")))) throw new Error("INVALID_ENGINE_WHEEL");
  return { ...fields };
}

const arrayBufferLength = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
function bufferLength(value) {
  // Subprocess buffers may come from another realm: check the real ArrayBuffer brand.
  try { return Reflect.apply(arrayBufferLength, value, []); }
  catch { return -1; }
}

/** §6.1 damage: exactly one rectangle inside the frame, physical pixels. */
export function validDamage(damage, width, height) {
  if (!Array.isArray(damage) || damage.length !== 1 || !Array.isArray(damage[0]) || damage[0].length !== 4) return false;
  const [x, y, w, h] = damage[0];
  return [x, y, w, h].every(value => Number.isInteger(value) && value >= 0) && w > 0 && h > 0
    && x + w <= width && y + h <= height;
}

/** §6.2 damage payloads: the frame's payload is exactly its damage rectangle's rows. */
function frameBytes(metadata, damage, payload) {
  if (!payload) return metadata.stride * metadata.height;
  return damage && validDamage(metadata.damage, metadata.width, metadata.height)
    ? metadata.damage[0][2] * metadata.damage[0][3] * 4 : -1;
}
function payloadMatches(metadata, size, damage, payload, memfd) {
  // §6.3: a memfd frame has no pipe payload; its slot holds exactly the expected bytes.
  if (memfd) return size === 0 && validMemfdFrame(metadata, memfd, frameBytes(metadata, damage, payload));
  return size === frameBytes(metadata, damage, payload);
}

/** One AXCF item (§5). Lengths and metadata are validated before pixels are read. */
export async function readStreamPacket(pipe, { engine, identity, damage = false, payload = false, memfd = null }) {
  const header = await pipe.read(16);
  if (bufferLength(header) !== 16) throw new Error("TRUNCATED_AXCF_HEADER");
  const view = new DataView(header);
  if (view.getUint32(0, false) !== 0x41584346 || view.getUint16(4, false) !== 1) throw new Error("INVALID_AXCF_HEADER");
  const kind = view.getUint16(6, false), metadataSize = view.getUint32(8, false), size = view.getUint32(12, false);
  if (![1, 2].includes(kind) || metadataSize < 1 || metadataSize > 8192 || size > MAX_FRAME_BYTES || (kind === 1 && size)) {
    throw new Error("INVALID_AXCF_LENGTH");
  }
  const raw = await pipe.read(metadataSize);
  if (bufferLength(raw) !== metadataSize) throw new Error("TRUNCATED_AXCF_METADATA");
  let metadata;
  try { metadata = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)); }
  catch { throw new Error("INVALID_AXCF_METADATA"); }
  if (!isObject(metadata) || metadata.version !== 1) throw new Error("INVALID_AXCF_METADATA");
  if (kind === 2) {
    if (!hasKeys(metadata, [...FRAME_KEYS, ...(damage ? ["damage"] : []), ...(memfd ? ["slot", "payload_bytes"] : [])])
        || !uint(metadata.frame_id) || metadata.frame_id === 0
        || ![metadata.width, metadata.height].every(value => Number.isInteger(value) && value > 0 && value <= MAX_SURFACE_DIMENSION)
        || metadata.stride !== metadata.width * 4 || !payloadMatches(metadata, size, damage, payload, memfd)
        || !Number.isFinite(metadata.device_scale) || metadata.device_scale < 1 || metadata.device_scale > 4
        || metadata.format !== "BGRA8"
        || (damage && !validDamage(metadata.damage, metadata.width, metadata.height))) throw new Error("INVALID_AXCF_FRAME");
    try { validateStreamTarget(metadata.target, { engine, identity }); }
    catch { throw new Error("INVALID_AXCF_FRAME"); }
  }
  const pixels = size ? await pipe.read(size) : new ArrayBuffer(0);
  if (bufferLength(pixels) !== size) throw new Error("TRUNCATED_AXCF_PIXELS");
  return { kind, metadata, pixels };
}

// Common events (§5) and their keys besides version/event/target.
const EVENT_FIELDS = {
  heartbeat: ["sequence"], created: ["request_id"], accepted: ["request_id"],
  completed: ["request_id", "status", "reason"], navigation: [], loading: ["loading", "can_go_back", "can_go_forward"],
  title: ["title"], url: ["url"], closed: [], error: ["request_id", "code", "native_code"],
  load: ["http_status", "restored_from_history"], cursor: ["cursor"],
};
const TARGET_EVENTS = new Set(["created", "navigation", "loading", "title", "url", "closed", "load", "cursor"]);
// Fixed diagnostic codes only: never native payloads, URLs, input or tokens.
export const STREAM_FAILURE_CODES = new Set([
  "TRUNCATED_AXCF_HEADER", "TRUNCATED_AXCF_METADATA", "TRUNCATED_AXCF_PIXELS", "INVALID_AXCF_HEADER",
  "INVALID_AXCF_LENGTH", "INVALID_AXCF_METADATA", "INVALID_AXCF_FRAME", "INVALID_DAMAGE_PAYLOAD", "MEMFD_READ_FAILED", "INVALID_ENGINE_EVENT",
  "INVALID_ENGINE_TARGET", "FOREIGN_ENGINE_TARGET", "INVALID_ENGINE_CREATION", "UNKNOWN_ENGINE_TARGET",
  "INVALID_ENGINE_GENERATION", "STALE_ENGINE_EVENT", "UNEXPECTED_ENGINE_FRAME", "FOREIGN_ENGINE_FRAME",
  "FUTURE_ENGINE_FRAME", "UNVERIFIED_ENGINE_RUNTIME", "UNREQUESTED_ENGINE_CREATION", "MISSING_ENGINE_TARGET",
  "UNKNOWN_ENGINE_RESPONSE", "INVALID_ENGINE_COMPLETION", "INVALID_ENGINE_TITLE", "INVALID_ENGINE_LOADING",
  "INVALID_ENGINE_URL", "INVALID_ENGINE_LOAD", "INVALID_ENGINE_HISTORY_RESTORE", "INVALID_ENGINE_CURSOR",
  "INVALID_ENGINE_HEARTBEAT", "ENGINE_HOST_UNRESPONSIVE", "ENGINE_FRAME_PRESENTATION_FAILED",
  "ENGINE_EVENT_CALLBACK_FAILED", "ENGINE_INITIALIZATION_FAILED",
]);
class TargetError extends Error {}
const targetError = code => new TargetError(code);
const HOST_BRAND = Symbol.for("axiosozo.engine-stream.host-connection");

/**
 * `profile`: { engine, readyFields: [...], validateReady(ready, {instance, frameDamage}) (throws),
 * restoreStatuses: [...], cursors: Set, imeLimit }.
 */
export class EngineStreamHost {
  #process; #token; #timers; #deadline; #requests = new Map(); #sequence = 0;
  #targets = new Map(); #readyWait; #ended = false; #closing = false; #ready = false;
  #heartbeatSequence = 0; #heartbeatTimeout; #heartbeatSeen = 0; #heartbeatCheckedAt = 0;
  #heartbeatTimer = null; #heartbeatOn = false; #now; #assembler = null; #readSlot = null; #slotReader = null;
  constructor(process, { profile, token, instance, identity, timers, deadline = 15000, frameDamage = false,
    damagePayload = false, frameTransport = "pipe", readSlot = null, heartbeatTimeout = HEARTBEAT_TIMEOUT_MS, now = () => Date.now(), onFailure = () => {}, requestPrefix = "es" }) {
    if (!profile || typeof profile.engine !== "string" || typeof profile.validateReady !== "function") throw new Error("INVALID_ENGINE_PROFILE");
    if (!/^[0-9a-f]{64}$/u.test(token) || !id(instance) || !validFixtureOrigin(identity) || !/^[a-z]{1,8}$/u.test(requestPrefix)) {
      throw new Error("INVALID_ENGINE_BOOTSTRAP");
    }
    this.profile = profile; this.instance = instance; this.identity = identity; this.frameDamage = frameDamage === true;
    // §6.2: rectangle-only payloads (needs frame damage); frames are rebuilt per target here.
    this.damagePayload = this.frameDamage && damagePayload === true;
    this.#assembler = this.damagePayload ? new DamagePayloadAssembler() : null;
    // §6.3: pixels from the host's memfd instead of the pipe (Linux; pref-gated by the launcher).
    if (!["pipe", "memfd"].includes(frameTransport)) throw new Error("INVALID_ENGINE_BOOTSTRAP");
    this.frameTransport = frameTransport; this.#readSlot = readSlot; this.memfd = null;
    this.#process = process; this.#token = token; this.#timers = timers; this.#deadline = deadline;
    this.#heartbeatTimeout = heartbeatTimeout; this.#now = now; this.requestPrefix = requestPrefix;
    this.onFailure = onFailure;
    this.status = "starting"; this.readPhase = "before_connect"; this.lastFrame = 0; this.lastFrameBytes = 0;
    this.nativeExitCode = null; this.capabilities = null; this.ready = null; this.failure = null;
    this.exited = process.wait().then(() => {}, () => {});
  }
  get [HOST_BRAND]() { return true; }
  get ended() { return this.#ended; }
  get targetCount() { return this.#targets.size; }
  waiter(label, onTimeout) {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    const timer = onTimeout && this.#timers.setTimeout(() => onTimeout(`${label}_TIMEOUT_UNCERTAIN`), this.#deadline);
    promise.catch(() => {});
    const clear = () => { if (timer) this.#timers.clearTimeout(timer); };
    return { promise, resolve: value => { clear(); resolve(value); }, reject: error => { clear(); reject(error); } };
  }
  async connect() {
    this.#readyWait = this.waiter("ENGINE_READY", code => this.fail(code));
    this.#read().catch(error => {
      if (!this.#closing) this.fail(STREAM_FAILURE_CODES.has(error?.message) ? error.message : "ENGINE_PROTOCOL_OR_EOF");
    });
    this.#drainErrors().catch(() => this.fail("ENGINE_STDERR_FAILURE"));
    this.#process.wait().then(result => {
      this.nativeExitCode = result.exitCode;
      if (result.exitCode !== 0) this.fail(`ENGINE_EXIT_${Number.isInteger(result.exitCode) && result.exitCode >= 0 ? result.exitCode : "SIGNAL"}`);
      else if (!this.#closing) this.fail("ENGINE_UNEXPECTED_EXIT");
    }, () => this.fail("ENGINE_PROCESS_FAILURE"));
    const hello = { version: 1, method: "hello", token: this.#token, engine_instance: this.instance,
      fixture_origin: this.identity, ...(this.frameDamage ? { frame_damage: true } : {}),
      ...(this.damagePayload ? { damage_payload: true } : {}),
      ...(this.frameTransport === "memfd" ? { frame_transport: "memfd" } : {}) };
    await this.#write(hello);
    await this.#readyWait.promise;
    this.status = "connected";
    return this;
  }
  register(adapter) {
    if (this.#ended || this.#closing) throw new Error("ENGINE_UNAVAILABLE");
    if (this.#targets.has(adapter.tabId)) throw new Error("DUPLICATE_ENGINE_TARGET");
    this.#targets.set(adapter.tabId, adapter);
  }
  unregister(adapter) { if (this.#targets.get(adapter.tabId) === adapter) this.#targets.delete(adapter.tabId); }
  async #drainErrors() {
    if (!this.#process.stderr) return;
    let bytes = 0;
    for (;;) {
      const chunk = await this.#process.stderr.read();
      if (!chunk?.byteLength) return;
      bytes += chunk.byteLength;
      // A fixture host logs little; an unbounded stream is a broken host.
      if (bytes > 262144) { this.fail("ENGINE_DIAGNOSTIC_LIMIT"); return; }
    }
  }
  async #write(value) {
    const text = JSON.stringify(value) + "\n";
    if (new TextEncoder().encode(text).length > 16384) throw new Error("ENGINE_REQUEST_TOO_LARGE");
    try { await this.#process.stdin.write(text); }
    catch (error) { this.fail("ENGINE_WRITE_OUTCOME_UNCERTAIN"); throw error; }
  }
  request(method, fields, target, { acknowledge = false, owner = null } = {}) {
    if (this.#ended || (this.#closing && !["frame_ack", "shutdown"].includes(method))) return Promise.reject(new Error("ENGINE_UNAVAILABLE"));
    if (this.#sequence >= MAX_REQUESTS) return Promise.reject(new Error("ENGINE_REQUEST_LIMIT"));
    if (!acknowledge && this.#requests.size >= MAX_INFLIGHT_REQUESTS * Math.max(1, this.#targets.size)) return Promise.reject(new Error("ENGINE_REQUEST_LIMIT"));
    const request_id = `${this.requestPrefix}-${++this.#sequence}`;
    const value = { version: 1, method, request_id, token: this.#token, ...fields };
    if (method !== "shutdown") value.target = target;
    if (acknowledge) return this.#write(value);
    const onTimeout = UNTIMED_METHODS.has(method) ? null : code => this.fail(code);
    const waiter = this.waiter("ENGINE_ACTION", onTimeout);
    Object.assign(waiter, { method, owner, request_id });
    this.#requests.set(request_id, waiter);
    owner?.trackRequest(request_id);
    this.#write(value).catch(error => waiter.reject(error));
    return waiter.promise;
  }
  rejectRequestsOf(owner, error) {
    for (const [request_id, waiter] of this.#requests) if (waiter.owner === owner && !waiter.abandoned) {
      waiter.abandoned = true; owner.untrackRequest(request_id); waiter.reject(error);
    }
  }
  #adapterFor(target, created = false) {
    if (target?.engine_instance !== this.instance) throw new Error("FOREIGN_ENGINE_TARGET");
    const adapter = this.#targets.get(target.tab_id) ?? null;
    if (!adapter || (created ? adapter.target : adapter.target?.native_target_id !== target.native_target_id)) return null;
    return adapter;
  }
  /**
   * §6.3 fallback: a slot could not be read. The frame is dropped (never presented), its
   * target's assembled frame is forgotten, and its frame_ack asks the host to send every later
   * frame through the pipe, each target's next one whole.
   */
  async #memfdFallback(value) {
    this.readPhase = "frame_validate";
    if (!this.#ready || value.frame_id <= this.lastFrame) throw new Error("UNEXPECTED_ENGINE_FRAME");
    this.lastFrame = value.frame_id;
    this.memfd = null; this.frameTransport = "pipe";
    this.memfdFallback = { frameId: value.frame_id, ...disableMemfdFrames("slot_read_failed") };
    this.#assembler?.forget(value.target?.native_target_id);
    console.warn("AXIOSOZO_MEMFD_FALLBACK", JSON.stringify({ engine: this.profile.engine, frameId: value.frame_id }));
    this.readPhase = "frame_ack";
    if (!this.#ended) await this.request("frame_ack", { frame_id: value.frame_id, ...MEMFD_FALLBACK_ACK }, value.target, { acknowledge: true });
  }
  #targetFailed(adapter, error) {
    const code = STREAM_FAILURE_CODES.has(error?.message) ? error.message : "ENGINE_PROTOCOL_OR_EOF";
    if (!(error instanceof TargetError) || !adapter) throw new Error(code);
    adapter.fail(code);
  }
  async #read() {
    const options = { engine: this.profile.engine, identity: this.identity, damage: this.frameDamage, payload: this.damagePayload, memfd: null };
    while (!this.#ended) {
      this.readPhase = "packet";
      options.memfd = this.memfd;
      const packet = await readStreamPacket(this.#process.stdout, options);
      const { kind, metadata: value } = packet;
      let pixels = packet.pixels;
      if (kind === 2 && this.memfd) {
        this.readPhase = "frame_memfd";
        try { pixels = await this.#slotReader(value.slot, value.payload_bytes); }
        catch (error) {
          if (error?.message !== "MEMFD_READ_FAILED") throw error;
          await this.#memfdFallback(value);
          continue;
        }
      }
      // Every delivered frame is applied, presented or not (§6.2).
      if (kind === 2 && this.#assembler) pixels = this.#assembler.apply(value, pixels);
      if (kind === 2) {
        this.readPhase = "frame_validate";
        if (!this.#ready || value.frame_id <= this.lastFrame) throw new Error("UNEXPECTED_ENGINE_FRAME");
        this.lastFrame = value.frame_id;
        const adapter = this.#adapterFor(value.target);
        let presentationError = null;
        try {
          if (adapter) {
            try { await adapter.acceptFrame(value, pixels); }
            catch (error) { presentationError = error; }
          }
        } finally {
          // Stale, old-size and orphaned frames still release their exact credit (§6).
          this.readPhase = "frame_ack";
          if (!this.#ended) await this.request("frame_ack", { frame_id: value.frame_id }, value.target, { acknowledge: true });
        }
        if (presentationError) this.#targetFailed(adapter, presentationError);
        continue;
      }
      this.readPhase = "event_validate";
      if (value.event === "ready") { this.#acceptReady(value); continue; }
      const fields = EVENT_FIELDS[value.event];
      if (!fields || Object.keys(value).some(key => !["version", "event", "target", ...fields].includes(key))) throw new Error("INVALID_ENGINE_EVENT");
      if (!this.#ready) throw new Error("INVALID_ENGINE_EVENT");
      if (value.event === "heartbeat") { this.#acceptHeartbeat(value); continue; }
      let adapter = null;
      if (value.target) {
        const creation = value.event === "created" && this.#requests.get(value.request_id);
        if (value.event === "created" && creation?.method !== "create") throw new Error("UNREQUESTED_ENGINE_CREATION");
        adapter = this.#adapterFor(value.target, value.event === "created");
        if (value.event === "closed") this.#assembler?.forget(value.target.native_target_id);
      } else if (TARGET_EVENTS.has(value.event)) {
        throw new Error("MISSING_ENGINE_TARGET");
      } else if (value.event === "error" && !value.request_id) {
        // Host-level error (engine_initialization_failed): the host is about to exit.
        throw new Error(value.code === "engine_initialization_failed" ? "ENGINE_INITIALIZATION_FAILED" : "INVALID_ENGINE_EVENT");
      }
      if (["accepted", "completed"].includes(value.event) || (value.event === "error" && value.request_id)) {
        const waiter = this.#requests.get(value.request_id);
        if (!waiter) throw new Error("UNKNOWN_ENGINE_RESPONSE");
        if (value.event !== "accepted") {
          this.#requests.delete(value.request_id);
          waiter.owner?.untrackRequest(value.request_id);
          if (!waiter.abandoned) {
            if (value.event === "error") {
              waiter.reject(new Error(value.code === "stale_target" ? "STALE_ENGINE_TARGET"
                : (value.code === "closed_target" ? "ENGINE_UNAVAILABLE" : "ENGINE_ACTION_FAILED")));
            } else if (!["success", "unsupported", "failed", "uncertain"].includes(value.status)) {
              throw new Error("INVALID_ENGINE_COMPLETION");
            } else waiter.resolve({ status: value.status, reason: value.reason, target: waiter.owner?.target ?? null });
          }
          waiter.owner?.pumpInput();
        }
        if (!value.target) continue;
      }
      if (adapter) {
        this.readPhase = "event_callback";
        try { adapter.acceptEvent(value); }
        catch (error) { this.#targetFailed(adapter, error); }
      }
    }
  }
  #acceptReady(value) {
    if (this.#ready || this.status !== "starting") throw new Error("UNVERIFIED_ENGINE_RUNTIME");
    const fields = this.profile.readyFields;
    if (!hasKeys(value, ["version", "event", ...fields]) || value.engine_instance !== this.instance) throw new Error("UNVERIFIED_ENGINE_RUNTIME");
    try { this.profile.validateReady(value, { instance: this.instance, frameDamage: this.frameDamage, damagePayload: this.damagePayload }); }
    catch { throw new Error("UNVERIFIED_ENGINE_RUNTIME"); }
    const interval = value.capabilities?.heartbeat_interval_ms;
    if (interval !== undefined && !(Number.isInteger(interval) && interval >= 100 && interval <= 2000)) throw new Error("UNVERIFIED_ENGINE_RUNTIME");
    // §6.3: exactly the transport the hello asked for; a memfd ring within the frame bound.
    const transport = value.capabilities?.frame_transport ?? "pipe";
    if (transport !== this.frameTransport || ("memfd" in (value.capabilities ?? {})) !== (transport === "memfd")
        || (transport === "memfd" && !validMemfdCapability(value.capabilities.memfd, MAX_FRAME_BYTES))) {
      throw new Error("UNVERIFIED_ENGINE_RUNTIME");
    }
    if (transport === "memfd") {
      const memfd = Object.freeze({ ...value.capabilities.memfd });
      try { this.#slotReader = this.#readSlot ? (slot, bytes) => this.#readSlot(memfd, slot, bytes) : memfdSlotReader(this.#process.pid, memfd); }
      catch { throw new Error("UNVERIFIED_ENGINE_RUNTIME"); }
      this.memfd = memfd;
    }
    this.#ready = true;
    this.capabilities = Object.freeze({ ...value.capabilities });
    this.ready = Object.freeze(Object.fromEntries(Object.entries(value).filter(([key]) => key !== "capabilities" && key !== "version")));
    this.#readyWait.resolve(value);
    if (interval !== undefined) this.#startHeartbeatWatchdog();
  }
  #acceptHeartbeat(value) {
    if (value.target || !this.#heartbeatOn || !uint(value.sequence) || value.sequence <= this.#heartbeatSequence) {
      throw new Error("INVALID_ENGINE_HEARTBEAT");
    }
    this.#heartbeatSequence = value.sequence;
    this.#heartbeatSeen = this.#now();
  }
  #startHeartbeatWatchdog() {
    if (this.#ended || this.#closing) return;
    this.#heartbeatOn = true;
    this.#heartbeatSeen = this.#heartbeatCheckedAt = this.#now();
    this.#scheduleHeartbeatCheck();
  }
  #scheduleHeartbeatCheck() {
    const timer = this.#heartbeatTimer = this.#timers.setTimeout(() => {
      this.#heartbeatTimer = null;
      if (this.#ended || this.#closing) return;
      const now = this.#now();
      // A late check means Gecko (or the machine) did not run: not evidence against the host.
      if (now - this.#heartbeatCheckedAt > HEARTBEAT_STALL_MS) this.#heartbeatSeen = now;
      this.#heartbeatCheckedAt = now;
      if (now - this.#heartbeatSeen >= this.#heartbeatTimeout) { this.fail("ENGINE_HOST_UNRESPONSIVE"); return; }
      this.#scheduleHeartbeatCheck();
    }, HEARTBEAT_CHECK_MS);
    if (typeof timer?.unref === "function") timer.unref();
  }
  #stopHeartbeatWatchdog() {
    if (this.#heartbeatTimer !== null) { this.#timers.clearTimeout(this.#heartbeatTimer); this.#heartbeatTimer = null; }
  }
  fail(reason) {
    if (this.#ended) return;
    this.#ended = true; this.status = "failed"; this.failure = reason;
    this.#stopHeartbeatWatchdog();
    console.error("AXIOSOZO_ENGINE_STREAM_DIAGNOSTIC", JSON.stringify({ engine: this.profile.engine, code: reason,
      phase: this.readPhase, lastFrameId: this.lastFrame, lastFrameBytes: this.lastFrameBytes,
      targets: this.#targets.size, pendingRequests: this.#requests.size, nativeExitCode: this.nativeExitCode }));
    const error = new Error(reason);
    this.#readyWait?.reject(error);
    for (const waiter of this.#requests.values()) waiter.reject(error);
    this.#requests.clear();
    for (const adapter of [...this.#targets.values()]) adapter.hostFailed(error);
    this.#targets.clear();
    this.#process.stdin.close().catch(() => {});
    this.#process.kill(500).catch(() => {});
    this.onFailure(error);
  }
  /** `shutdown` closes every target; the host then exits 0 (§2). */
  async shutdown() {
    if (this.#ended) return;
    try {
      const done = this.request("shutdown", {}, null);
      this.#closing = true;
      this.#stopHeartbeatWatchdog();
      await done;
      const result = await this.#process.wait();
      this.nativeExitCode = result.exitCode;
      if (result.exitCode !== 0) throw new Error("ENGINE_SHUTDOWN_FAILED");
      this.#ended = true; this.status = "closed";
      const unavailable = new Error("ENGINE_UNAVAILABLE");
      for (const waiter of this.#requests.values()) waiter.reject(unavailable);
      this.#requests.clear();
      for (const adapter of [...this.#targets.values()]) adapter.hostFailed(unavailable);
      this.#targets.clear();
      // The host already exited: closing our end is cleanup and must never hold the caller.
      this.#process.stdin.close().catch(() => {});
    } catch (error) { this.#closing = false; this.fail("ENGINE_CLOSE_OUTCOME_UNCERTAIN"); throw error; }
  }
}

/** One engine target (one Zen tab) of an EngineStreamHost. */
export class EngineStreamTarget {
  #host; #pending; #requests = new Set(); #inputQueue = []; #committedURLs = new Set(); #currentURL = null;
  #frameWait = null; #creating = null; #ended = false; #closing = false; #created = false; #loaded = false;
  #historyMethods = new Set(); #damageGap = true; #frameRate = null;
  constructor(host, { pendingTarget, onEvent = () => {}, onFrame = () => {}, onFailure = () => {} }) {
    if (host?.[HOST_BRAND] !== true) throw new Error("INVALID_ENGINE_HOST");
    this.#host = host;
    this.#pending = validateStreamTarget(pendingTarget, { engine: host.profile.engine, identity: host.identity, pending: true });
    if (this.#pending.engine_instance !== host.instance) throw new Error("FOREIGN_ENGINE_TARGET");
    this.onEvent = onEvent; this.onFrame = onFrame; this.onFailure = onFailure;
    this.target = null; this.surface = null; this.nativeClosed = false; this.failure = null;
    this.status = "connected";
    host.register(this);
  }
  get engine() { return this.#host.profile.engine; }
  get tabId() { return this.#pending.tab_id; }
  get identity() { return this.#pending.identity; }
  get host() { return this.#host; }
  get frameTransport() { return this.#host.frameTransport ?? "pipe"; }
  /** §6.3: {frameId, reason, at} once this host fell back from memfd frames to the pipe. */
  get memfdFallback() { return this.#host.memfdFallback ?? null; }
  get ended() { return this.#ended; }
  get inputFeatures() {
    const capabilities = this.#host.capabilities ?? {};
    return Object.freeze({ keyVerdict: capabilities.key_verdict === true, wheelPhases: capabilities.wheel_phases === true,
      imeCommit: capabilities.ime_commit === true, ime: capabilities.ime === true, edit: capabilities.edit === true });
  }
  get appliedFrameRate() { return this.#frameRate ?? this.#host.capabilities?.frame_rate ?? 60; }
  trackRequest(request_id) { this.#requests.add(request_id); }
  untrackRequest(request_id) { this.#requests.delete(request_id); }
  allowedURL(url) { return allowedFixtureURL(url, this.#pending.identity); }
  #request(method, fields = {}, target = this.target) {
    if (this.#ended || this.#closing) return Promise.reject(new Error("ENGINE_UNAVAILABLE"));
    if (this.#requests.size >= MAX_INFLIGHT_REQUESTS) return Promise.reject(new Error("ENGINE_REQUEST_LIMIT"));
    return this.#host.request(method, fields, target, { owner: this });
  }
  pumpInput() {
    while (!this.#ended && !this.#closing && this.#requests.size < MAX_INFLIGHT_INPUT && this.#inputQueue.length) {
      const item = this.#inputQueue.shift();
      try { this.resolve(item.target); }
      catch (error) { item.reject(error); continue; }
      // First and only dispatch: nothing is replayed after a crash or a stale target.
      this.#request(item.method, item.fields, item.target).then(item.resolve, item.reject);
    }
  }
  #validate(target) {
    return validateStreamTarget(target, { engine: this.engine, identity: this.#pending.identity });
  }
  #adopt(target, type) {
    let next;
    try { next = this.#validate(target); } catch { throw new Error("INVALID_ENGINE_TARGET"); }
    for (const key of ["tab_id", "engine_instance", "private_mode", "identity"]) {
      if (next[key] !== this.#pending[key]) throw new Error("FOREIGN_ENGINE_TARGET");
    }
    if (type === "created") {
      if (this.#created || this.target || next.document_generation !== this.#pending.document_generation
          || next.navigation_generation !== this.#pending.navigation_generation) throw targetError("INVALID_ENGINE_CREATION");
      this.#created = true;
    } else {
      if (!this.target || next.native_target_id !== this.target.native_target_id) throw targetError("UNKNOWN_ENGINE_TARGET");
      if (type === "navigation") {
        if (next.document_generation !== this.target.document_generation + 1
            || next.navigation_generation !== this.target.navigation_generation + 1) throw targetError("INVALID_ENGINE_GENERATION");
        this.#loaded = false;
      } else if (!sameStreamTarget(next, this.target)) throw targetError("STALE_ENGINE_EVENT");
    }
    this.target = next;
  }
  async acceptFrame(value, pixels) {
    if (!this.#created || !this.target) throw targetError("UNEXPECTED_ENGINE_FRAME");
    for (const field of ["tab_id", "engine_instance", "native_target_id", "identity", "private_mode"]) {
      if (value.target[field] !== this.target[field]) throw targetError("FOREIGN_ENGINE_FRAME");
    }
    if (value.target.document_generation > this.target.document_generation
        || value.target.navigation_generation > this.target.navigation_generation) throw targetError("FUTURE_ENGINE_FRAME");
    const same = sameStreamTarget(value.target, this.target);
    const sizeMatches = this.surface && value.width === Math.ceil(this.surface.width * this.surface.device_scale)
      && value.height === Math.ceil(this.surface.height * this.surface.device_scale)
      && value.device_scale === this.surface.device_scale;
    // Old generations and old sizes are never presented; the next shown frame is then whole.
    if (!same || !sizeMatches || !this.#loaded || this.#closing || this.#ended) { this.#damageGap = true; return; }
    this.#host.readPhase = "frame_present"; this.#host.lastFrameBytes = pixels.byteLength;
    let frame = value;
    if (this.#damageGap && "damage" in value) { frame = { ...value }; delete frame.damage; }
    this.#damageGap = true;
    try { await this.onFrame(frame, pixels); }
    catch { throw targetError("ENGINE_FRAME_PRESENTATION_FAILED"); }
    this.#damageGap = false;
    this.#frameWait?.resolve(this.target);
  }
  acceptEvent(value) {
    if (value.target) {
      this.#adopt(value.target, value.event);
      if (value.event === "navigation") { this.#damageGap = true; this.pumpInput(); }
    }
    if (value.event === "title" && (typeof value.title !== "string" || value.title.length > 1024)) throw targetError("INVALID_ENGINE_TITLE");
    if (value.event === "loading" && ![value.loading, value.can_go_back, value.can_go_forward].every(item => typeof item === "boolean")) throw targetError("INVALID_ENGINE_LOADING");
    if (value.event === "cursor" && !this.#host.profile.cursors?.has(value.cursor)) throw targetError("INVALID_ENGINE_CURSOR");
    if (value.event === "error" && (typeof value.code !== "string" || !/^[a-z0-9_]{1,64}$/u.test(value.code))) throw targetError("INVALID_ENGINE_EVENT");
    if (value.event === "url") {
      // "" is an over-long URL (§5); anything else must be the fixture page.
      if (value.url !== "" && !this.allowedURL(value.url)) throw targetError("INVALID_ENGINE_URL");
      this.#currentURL = value.url || null;
    }
    if (value.event === "load") {
      if (!Number.isInteger(value.http_status) || typeof value.restored_from_history !== "boolean") throw targetError("INVALID_ENGINE_LOAD");
      // §5: a restore is legitimate only for a pending back/forward to a URL committed with HTTP 200.
      const restored = value.restored_from_history && (this.#host.profile.restoreStatuses ?? [0]).includes(value.http_status)
        && this.#historyMethods.size > 0 && this.#committedURLs.has(this.#currentURL);
      if (value.restored_from_history && !restored) throw targetError("INVALID_ENGINE_HISTORY_RESTORE");
      const loaded = value.http_status === 200 && !!this.#currentURL;
      this.#loaded = loaded || restored;
      if (loaded) {
        this.#committedURLs.add(this.#currentURL);
        if (this.#committedURLs.size > 1024) this.#committedURLs.delete(this.#committedURLs.values().next().value);
      }
      if (!this.#loaded) this.#frameWait?.reject(new Error("ENGINE_FIXTURE_LOAD_FAILED"));
    }
    if (value.event === "closed") this.nativeClosed = true;
    try { this.onEvent(value); }
    catch { throw targetError("ENGINE_EVENT_CALLBACK_FAILED"); }
  }
  get currentURL() { return this.#currentURL; }
  get loaded() { return this.#loaded; }
  resolve(target) {
    let checked;
    try { checked = this.#validate(target); } catch { throw new Error("STALE_ENGINE_TARGET"); }
    if (!this.target || !sameStreamTarget(checked, this.target)) throw new Error("STALE_ENGINE_TARGET");
    if (this.#ended || this.#closing) throw new Error("ENGINE_UNAVAILABLE");
    return this.target;
  }
  /** Resolves once the first frame of the loaded document was presented. */
  async create(url, surface) {
    if (this.#created || this.#creating || this.status !== "connected" || !this.allowedURL(url)) throw new Error("INVALID_ENGINE_CREATE");
    this.surface = validateStreamSurface(surface);
    this.#frameWait = this.#host.waiter("ENGINE_FIRST_FRAME", code => this.fail(code));
    this.#creating = this.#request("create", { url, ...this.surface }, this.#pending);
    const result = await this.#creating;
    if (result.status !== "success") {
      const error = new Error(result.status === "unsupported" && result.reason === "surface_limit" ? "ENGINE_SURFACE_LIMIT" : "ENGINE_CREATE_FAILED");
      if (!this.#created) { this.#frameWait.reject(error); this.#creating = null; }
      throw error;
    }
    await this.#frameWait.promise;
    this.status = "active";
    return this.target;
  }
  navigate(target, url) {
    this.resolve(target);
    if (!this.allowedURL(url)) return Promise.resolve({ status: "unsupported", reason: "FIXTURE_ONLY" });
    return this.#request("navigate", { url });
  }
  #history(method) {
    const marker = Symbol(method);
    this.#historyMethods.add(marker);
    const settle = () => this.#historyMethods.delete(marker);
    const result = this.#request(method);
    result.then(settle, settle);
    return result;
  }
  back(target) { this.resolve(target); return this.#history("back"); }
  forward(target) { this.resolve(target); return this.#history("forward"); }
  reload(target) { this.resolve(target); return this.#request("reload"); }
  stop(target) { this.resolve(target); return this.#request("stop"); }
  developerTools() { return Promise.resolve({ status: "unsupported", reason: "DEVTOOLS_NOT_INTEGRATED" }); }
  resize(target, surface) {
    this.resolve(target);
    const next = validateStreamSurface(surface), previous = this.surface;
    this.surface = next;
    return this.#request("resize", next).then(result => {
      if (result.status !== "success") this.surface = previous;
      return result;
    }, error => { this.surface = previous; throw error; });
  }
  focus(target, focused) {
    this.resolve(target);
    if (typeof focused !== "boolean") throw new Error("INVALID_FOCUS");
    return this.#request("focus", { focused });
  }
  visibility(target, visible) {
    this.resolve(target);
    if (typeof visible !== "boolean") throw new Error("INVALID_VISIBILITY");
    if (this.#host.capabilities?.visibility !== true) return Promise.resolve({ status: "unsupported", reason: "VISIBILITY_UNSUPPORTED" });
    return this.#request("visibility", { visible });
  }
  frameRate(target, rate) {
    this.resolve(target);
    if (!FRAME_RATES.includes(rate)) throw new Error("INVALID_FRAME_RATE");
    if (this.#host.capabilities?.frame_rate_command !== true) return Promise.resolve({ status: "unsupported", reason: "FRAME_RATE_UNSUPPORTED" });
    return this.#request("frame_rate", { frame_rate: rate }).then(result => {
      if (result?.status === "success") this.#frameRate = rate;
      return result;
    });
  }
  edit(target, action) {
    this.resolve(target);
    if (!EDIT_ACTIONS.includes(action)) throw new Error("INVALID_EDIT_ACTION");
    if (this.#host.capabilities?.edit !== true) return Promise.resolve({ status: "unsupported", reason: "EDIT_UNSUPPORTED" });
    return this.#request("edit", { action });
  }
  input(target, method, fields) {
    this.resolve(target);
    const validated = validateStreamInput(method, fields, this.surface,
      { ...this.inputFeatures, imeLimit: this.#host.profile.imeLimit ?? 1024 });
    if (this.#inputQueue.length >= MAX_QUEUED_INPUT) {
      // Dropping input could strand a key-up or pointer-up: stop the engine instead.
      this.fail("ENGINE_INPUT_BACKPRESSURE");
      return Promise.reject(new Error("ENGINE_INPUT_BACKPRESSURE"));
    }
    return new Promise((resolve, reject) => {
      this.#inputQueue.push({ target, method, fields: validated, resolve, reject });
      this.pumpInput();
    });
  }
  /** Ends this target; on a one-tab host the host ends with it. */
  fail(reason) {
    if (this.#ended) return;
    const error = this.#end(reason, "failed");
    this.#host.fail(reason);
    this.onFailure(error);
  }
  hostFailed(error) {
    if (this.#ended) return;
    this.#end(error.message, error.message === "ENGINE_UNAVAILABLE" ? "closed" : "failed");
    if (this.status === "failed") this.onFailure(error);
  }
  #end(reason, status) {
    this.#ended = true; this.status = status; this.failure = status === "failed" ? reason : null;
    const error = new Error(reason);
    this.#frameWait?.reject(error);
    this.#host.rejectRequestsOf(this, error);
    for (const item of this.#inputQueue.splice(0)) item.reject(error);
    this.#host.unregister(this);
    return error;
  }
  /** One host per tab: `shutdown` closes the target and the host exits 0. */
  async close() {
    if (this.#ended) return;
    this.#closing = true;
    try {
      if (!this.#created && this.#creating) await this.#creating.catch(() => {});
      await this.#host.shutdown();
    } finally { if (!this.#ended) this.#end("ENGINE_UNAVAILABLE", this.#host.status === "closed" ? "closed" : "failed"); }
  }
}
