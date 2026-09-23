/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

export const CEF_VERSION = "154.0.23+g062ebe4+chromium-154.0.8037.17";
export const CHROMIUM_VERSION = "154.0.8037.17";
const MAX_PIXELS = 33554432;
const MAX_INFLIGHT_REQUESTS = 16;
const MAX_INFLIGHT_INPUT = 8;
const MAX_QUEUED_INPUT = 64;
const TARGET_KEYS = ["tab_id", "engine", "engine_instance", "native_target_id", "identity",
  "document_generation", "navigation_generation", "private_mode"];
const PENDING_KEYS = TARGET_KEYS.filter(key => !["engine", "native_target_id"].includes(key));
const isObject = value => value && typeof value === "object" && !Array.isArray(value);
const hasKeys = (value, keys) => isObject(value) && Object.keys(value).length === keys.length
  && Object.keys(value).every(key => keys.includes(key));
const id = value => typeof value === "string" && /^[a-zA-Z0-9_:/.-]{1,128}$/u.test(value);
const uint = value => Number.isSafeInteger(value) && value >= 0;
export const sameCEFTarget = (a, b) => TARGET_KEYS.every(key => a?.[key] === b?.[key]);

export function validateCEFTarget(value, { pending = false } = {}) {
  if (!hasKeys(value, pending ? PENDING_KEYS : TARGET_KEYS)
      || !id(value.tab_id) || !id(value.engine_instance)
      || !uint(value.document_generation) || !uint(value.navigation_generation)
      || value.private_mode !== false || !validFixtureOrigin(value.identity)
      || (!pending && (value.engine !== "chromium" || !id(value.native_target_id)))) {
    throw new Error("INVALID_CEF_TARGET");
  }
  return Object.freeze({ ...value });
}

export function validFixtureOrigin(origin) {
  if (typeof origin !== "string") return false;
  try {
    const url = new URL(origin);
    return url.protocol === "http:" && url.hostname === "127.0.0.1" && !!url.port
      && url.origin === origin && !url.username && !url.password;
  } catch { return false; }
}

export function allowedFixtureURL(value, origin) {
  if (typeof value !== "string" || value.length > 4096 || !validFixtureOrigin(origin)) return false;
  try {
    const url = new URL(value);
    return url.origin === origin && url.pathname === "/engine.html"
      && !url.hash && !url.username && !url.password && ["", "?page=2"].includes(url.search);
  } catch { return false; }
}

export function validateSurface({ width, height, device_scale }) {
  if (![width, height].every(value => Number.isInteger(value) && value > 0 && value <= 4096)
      || !Number.isFinite(device_scale) || device_scale < 1 || device_scale > 4) throw new Error("INVALID_SURFACE");
  const physicalWidth = Math.ceil(width * device_scale), physicalHeight = Math.ceil(height * device_scale);
  if (physicalWidth > 4096 || physicalHeight > 4096 || physicalWidth * physicalHeight * 4 > MAX_PIXELS) {
    throw new Error("UNSUPPORTED_SURFACE");
  }
  return { width, height, device_scale };
}

/** Keep the fixed 32 MiB pipe bound when a Retina window grows, including fullscreen. */
export function fitCEFRenderSurface({ width, height, device_scale }) {
  try { return validateSurface({ width, height, device_scale }); }
  catch (error) { if (error.message !== "UNSUPPORTED_SURFACE") throw error; }
  // Quarter steps avoid huge, unconstrained full-resolution frames. CEF still
  // receives the full logical viewport and its input coordinates do not change.
  for (let quarter = Math.ceil(device_scale * 4) - 1; quarter >= 4; quarter--) {
    try { return validateSurface({ width, height, device_scale: quarter / 4 }); }
    catch (error) { if (error.message !== "UNSUPPORTED_SURFACE") throw error; }
  }
  throw new Error("UNSUPPORTED_SURFACE");
}

export function validCEFSessionRuntime(root, session, geckoProfile) {
  if (typeof root !== "string" || !/^\/Volumes\/[A-Za-z0-9_-]+$/u.test(root)
      || typeof session !== "string" || typeof geckoProfile !== "string") return false;
  const prefix = `${root}/runtime/`;
  if (!session.startsWith(prefix)) return false;
  const parts = session.slice(prefix.length).split("/");
  return parts.length === 2 && /^[0-9a-f]{16}$/u.test(parts[0])
    && /^[A-Za-z0-9-]{1,64}$/u.test(parts[1])
    && geckoProfile === `${session}/gecko`;
}

export function validateCEFInput(method, fields, surface) {
  const required = {
    key: ["type", "native_key_code", "windows_key_code", "modifiers", "text"],
    mouse: ["type", "x", "y", "modifiers", "button", "click_count", "mouse_leave"],
    wheel: ["x", "y", "modifiers", "delta_x", "delta_y"],
  }[method];
  const bounded = (value, max) => uint(value) && value <= max;
  if (!required || !hasKeys(fields, required) || !bounded(fields.modifiers, 131071)) throw new Error("INVALID_CEF_INPUT");
  if (method === "key") {
    if (!["down", "up", "char"].includes(fields.type) || !bounded(fields.native_key_code, 65535)
        || !bounded(fields.windows_key_code, 255) || typeof fields.text !== "string" || fields.text.length > 4) throw new Error("INVALID_CEF_KEY");
  } else {
    if (!surface || !bounded(fields.x, surface.width) || !bounded(fields.y, surface.height)) throw new Error("INVALID_CEF_POINT");
    if (method === "mouse" && (!["move", "down", "up"].includes(fields.type)
        || !["left", "middle", "right"].includes(fields.button) || !bounded(fields.click_count, 3)
        || fields.click_count < 1 || typeof fields.mouse_leave !== "boolean")) throw new Error("INVALID_CEF_MOUSE");
    if (method === "wheel" && ![fields.delta_x, fields.delta_y].every(value => Number.isInteger(value) && Math.abs(value) <= 4096)) throw new Error("INVALID_CEF_WHEEL");
  }
  return { ...fields };
}

const arrayBufferLength = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
function bufferLength(value) {
  // Firefox Subprocess can return buffers created in another module/worker realm.
  // The intrinsic getter checks the real ArrayBuffer brand without instanceof
  // or trusting a caller-supplied byteLength/toStringTag property.
  try { return Reflect.apply(arrayBufferLength, value, []); }
  catch { return -1; }
}

/** Subprocess.InputPipe.read(length) is exact, unlike readUint32's native endianness. */
export async function readAXCF(pipe) {
  const header = await pipe.read(16);
  if (bufferLength(header) !== 16) throw new Error("TRUNCATED_AXCF_HEADER");
  const view = new DataView(header);
  if (view.getUint32(0, false) !== 0x41584346 || view.getUint16(4, false) !== 1) throw new Error("INVALID_AXCF_HEADER");
  const kind = view.getUint16(6, false), metadataSize = view.getUint32(8, false), size = view.getUint32(12, false);
  if (![1, 2].includes(kind) || metadataSize < 1 || metadataSize > 8192 || size > MAX_PIXELS || (kind === 1 && size)) {
    throw new Error("INVALID_AXCF_LENGTH");
  }
  const raw = await pipe.read(metadataSize);
  if (bufferLength(raw) !== metadataSize) throw new Error("TRUNCATED_AXCF_METADATA");
  const metadata = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw));
  if (!isObject(metadata) || metadata.version !== 1) throw new Error("INVALID_AXCF_METADATA");
  if (kind === 2) {
    if (!hasKeys(metadata, ["version", "target", "frame_id", "width", "height", "stride", "device_scale", "format"])
        || !uint(metadata.frame_id) || metadata.frame_id === 0
        || ![metadata.width, metadata.height].every(value => Number.isInteger(value) && value > 0 && value <= 4096)
        || metadata.stride !== metadata.width * 4 || size !== metadata.stride * metadata.height
        || !Number.isFinite(metadata.device_scale) || metadata.device_scale < 1 || metadata.device_scale > 4
        || metadata.format !== "BGRA8") throw new Error("INVALID_AXCF_FRAME");
    validateCEFTarget(metadata.target);
  }
  // Allocate/read large pixels only after both framing and metadata are checked.
  const pixels = size ? await pipe.read(size) : new ArrayBuffer(0);
  if (bufferLength(pixels) !== size) throw new Error("TRUNCATED_AXCF_PIXELS");
  return { kind, metadata, pixels };
}

const EVENT_FIELDS = {
  ready: ["cef", "chromium", "runtime_cef", "runtime_chromium", "platform", "sandbox_configured", "engine_instance", "render_path", "capabilities"],
  created: ["request_id"], accepted: ["request_id"], completed: ["request_id", "status", "reason"],
  navigation: [], loading: ["loading", "can_go_back", "can_go_forward"],
  title: ["title"], url: ["url"], closed: [], error: ["request_id", "code", "native_code"], load: ["http_status", "restored_from_history"],
};

// Preserve only our fixed diagnostic codes. Never display native payloads,
// arbitrary exception messages, pipe contents or authentication material.
const READ_FAILURE_CODES = new Set([
  "TRUNCATED_AXCF_HEADER", "TRUNCATED_AXCF_METADATA", "TRUNCATED_AXCF_PIXELS",
  "INVALID_AXCF_HEADER", "INVALID_AXCF_LENGTH", "INVALID_AXCF_METADATA", "INVALID_AXCF_FRAME",
  "INVALID_CEF_TARGET", "FOREIGN_CEF_TARGET", "INVALID_CEF_CREATION", "UNKNOWN_CEF_TARGET",
  "INVALID_CEF_GENERATION", "STALE_CEF_EVENT", "UNEXPECTED_CEF_FRAME", "FOREIGN_CEF_FRAME",
  "FUTURE_CEF_FRAME", "INVALID_CEF_EVENT", "UNVERIFIED_CEF_RUNTIME", "UNREQUESTED_CEF_CREATION",
  "MISSING_CEF_TARGET", "UNKNOWN_CEF_RESPONSE", "INVALID_CEF_COMPLETION", "INVALID_CEF_TITLE",
  "INVALID_CEF_LOADING", "INVALID_CEF_URL", "INVALID_CEF_LOAD", "INVALID_CEF_HISTORY_RESTORE",
  "CEF_FRAME_PRESENTATION_FAILED", "CEF_EVENT_CALLBACK_FAILED",
]);

/** One authenticated native process per target. No provider/web listener or replay. */
export class CEFEngineAdapter {
  #process; #token; #pending; #timers; #deadline; #requests = new Map(); #sequence = 0;
  #inputQueue = [];
  #committedURLs = new Set(); #currentURL = null;
  #readyWait; #frameWait; #lastFrame = 0; #ended = false; #closing = false; #created = false; #loaded = false; #ready = false;
  constructor(process, { token, pendingTarget, timers, deadline = 15000,
    onEvent = () => {}, onFrame = () => {}, onFailure = () => {} }) {
    if (!/^[0-9a-f]{64}$/u.test(token)) throw new Error("INVALID_CEF_BOOTSTRAP");
    this.#pending = validateCEFTarget(pendingTarget, { pending: true });
    this.#process = process; this.#token = token; this.#timers = timers; this.#deadline = deadline;
    this.onEvent = onEvent; this.onFrame = onFrame; this.onFailure = onFailure;
    this.target = null; this.surface = null; this.status = "starting"; this.nativeClosed = false;
    this.readPhase = "before_connect"; this.lastFrameBytes = 0; this.nativeExitCode = null;
  }
  get instance() { return this.#pending.engine_instance; }
  capabilities() {
    return Object.freeze({ version: 1, engine: "chromium", navigation: true,
      observation: ["url", "title", "loading"], content_capture: false, developer_tools: false,
      fixture_only: true, private_mode: false, ime: false, experimental: true });
  }
  #waiter(label) {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    const timer = this.#timers.setTimeout(() => this.#fail(`${label}_TIMEOUT_UNCERTAIN`), this.#deadline);
    // Attach a rejection observer immediately; callers still receive the rejection.
    promise.catch(() => {});
    return { promise, resolve: value => { this.#timers.clearTimeout(timer); resolve(value); },
      reject: error => { this.#timers.clearTimeout(timer); reject(error); } };
  }
  async connect() {
    this.#readyWait = this.#waiter("CEF_READY");
    this.#read().catch(error => {
      if (!this.nativeClosed) this.#fail(READ_FAILURE_CODES.has(error?.message) ? error.message : "CEF_PROTOCOL_OR_EOF");
    });
    this.#drainErrors().catch(() => this.#fail("CEF_STDERR_FAILURE"));
    this.#process.wait().then(result => {
      this.nativeExitCode = result.exitCode;
      if (result.exitCode !== 0) this.#fail("CEF_CRASH_OUTCOME_UNCERTAIN");
      if (this.status === "failed") console.error("AXIOSOZO_CEF_EXIT", JSON.stringify({ exitCode:result.exitCode }));
    }, () => this.#fail("CEF_PROCESS_FAILURE"));
    await this.#write({ version: 1, method: "hello", token: this.#token,
      engine_instance: this.instance, fixture_origin: this.#pending.identity });
    await this.#readyWait.promise;
    this.status = "connected";
    return this;
  }
  async #drainErrors() {
    if (!this.#process.stderr) return;
    let bytes = 0;
    for (;;) {
      const chunk = await this.#process.stderr.read();
      if (!chunk.byteLength) return;
      bytes += chunk.byteLength;
      if (bytes > 65536) { this.#fail("CEF_DIAGNOSTIC_LIMIT"); return; }
    }
  }
  async #write(value) {
    const text = JSON.stringify(value) + "\n";
    if (new TextEncoder().encode(text).length > 16384) throw new Error("CEF_REQUEST_TOO_LARGE");
    try { await this.#process.stdin.write(text); }
    catch (error) { this.#fail("CEF_WRITE_OUTCOME_UNCERTAIN"); throw error; }
  }
  #request(method, fields = {}, target = this.target, acknowledge = false) {
    if (this.#ended || (this.#closing && !["frame_ack", "shutdown"].includes(method))) return Promise.reject(new Error("CEF_UNAVAILABLE"));
    if (++this.#sequence > 100000 || (!acknowledge && this.#requests.size >= MAX_INFLIGHT_REQUESTS)) return Promise.reject(new Error("CEF_REQUEST_LIMIT"));
    const request_id = `cef-${this.#sequence}`;
    const value = { version: 1, method, request_id, token: this.#token, ...fields };
    if (method !== "shutdown") value.target = target;
    if (acknowledge) return this.#write(value);
    const waiter = this.#waiter("CEF_ACTION");
    waiter.method = method;
    this.#requests.set(request_id, waiter);
    this.#write(value).catch(error => waiter.reject(error));
    return waiter.promise;
  }
  #pumpInput() {
    while (!this.#ended && !this.#closing && this.#requests.size < MAX_INFLIGHT_INPUT && this.#inputQueue.length) {
      const item = this.#inputQueue.shift();
      try { this.resolve(item.target); }
      catch (error) { item.reject(error); continue; }
      // This is the first and only dispatch of the validated input. A crash,
      // uncertain write, or reconnect rejects it; no mutating replay occurs.
      this.#request(item.method, item.fields, item.target).then(item.resolve, item.reject);
    }
  }
  #rejectQueuedInput(error) {
    for (const item of this.#inputQueue.splice(0)) item.reject(error);
  }
  #adopt(target, type) {
    const next = validateCEFTarget(target);
    for (const key of ["tab_id", "engine_instance", "identity", "private_mode"]) {
      if (next[key] !== this.#pending[key]) throw new Error("FOREIGN_CEF_TARGET");
    }
    if (type === "created") {
      if (this.#created || this.target || next.document_generation !== this.#pending.document_generation
          || next.navigation_generation !== this.#pending.navigation_generation) throw new Error("INVALID_CEF_CREATION");
      this.#created = true;
    } else {
      if (!this.target || next.native_target_id !== this.target.native_target_id) throw new Error("UNKNOWN_CEF_TARGET");
      if (type === "navigation") {
        if (next.document_generation !== this.target.document_generation + 1
            || next.navigation_generation !== this.target.navigation_generation + 1) throw new Error("INVALID_CEF_GENERATION");
        this.#loaded = false;
      } else if (!sameCEFTarget(next, this.target)) throw new Error("STALE_CEF_EVENT");
    }
    this.target = next;
  }
  async #read() {
    while (!this.#ended) {
      this.readPhase = "packet";
      const { kind, metadata: value, pixels } = await readAXCF(this.#process.stdout);
      if (kind === 2) {
        this.readPhase = "frame_validate";
        if (!this.#created || value.frame_id <= this.#lastFrame) throw new Error("UNEXPECTED_CEF_FRAME");
        for (const field of ["tab_id", "engine_instance", "native_target_id", "identity", "private_mode"]) {
          if (value.target[field] !== this.target[field]) throw new Error("FOREIGN_CEF_FRAME");
        }
        if (value.target.document_generation > this.target.document_generation
            || value.target.navigation_generation > this.target.navigation_generation) throw new Error("FUTURE_CEF_FRAME");
        this.#lastFrame = value.frame_id;
        const same = sameCEFTarget(value.target, this.target);
        const sizeMatches = this.surface && value.width === Math.ceil(this.surface.width * this.surface.device_scale)
          && value.height === Math.ceil(this.surface.height * this.surface.device_scale)
          && value.device_scale === this.surface.device_scale;
        let presentationFailed = false;
        try {
          if (same && sizeMatches && this.#loaded && !this.#closing) {
            this.readPhase = "frame_present"; this.lastFrameBytes = pixels.byteLength;
            try { await this.onFrame(value, pixels); }
            catch { presentationFailed = true; }
            if (!presentationFailed) this.#frameWait?.resolve(this.target);
          }
        } finally {
          // Stale/old-size frames must release exact outstanding transport credit.
          // This never executes a native browser action against their old target.
          this.readPhase = "frame_ack";
          await this.#request("frame_ack", { frame_id: value.frame_id }, value.target, true);
        }
        if (presentationFailed) {
          this.readPhase = "frame_present";
          throw new Error("CEF_FRAME_PRESENTATION_FAILED");
        }
        continue;
      }
      this.readPhase = "event_validate";
      const fields = EVENT_FIELDS[value.event];
      if (!fields || Object.keys(value).some(key => !["version", "event", "target", ...fields].includes(key))) throw new Error("INVALID_CEF_EVENT");
      if (value.event === "ready") {
        if (this.#ready || this.status !== "starting" || this.target || value.cef !== CEF_VERSION || value.chromium !== CHROMIUM_VERSION
            || value.runtime_cef !== CEF_VERSION.split("+")[0] || value.runtime_chromium !== CHROMIUM_VERSION
            || value.engine_instance !== this.instance || value.platform !== "macosarm64"
            || value.render_path !== "native-osr-bgra" || value.sandbox_configured !== true
            || value.capabilities?.fixture_only !== true || value.capabilities?.devtools !== false
            || value.capabilities?.private_mode !== false || value.capabilities?.ime !== false) throw new Error("UNVERIFIED_CEF_RUNTIME");
        this.#ready = true; this.#readyWait.resolve(value);
      } else if (value.target) {
        if (value.event === "created" && this.#requests.get(value.request_id)?.method !== "create") throw new Error("UNREQUESTED_CEF_CREATION");
        this.#adopt(value.target, value.event);
        if (value.event === "navigation") this.#pumpInput();
      }
      else if (["created", "navigation", "load", "loading", "title", "url", "closed"].includes(value.event)) throw new Error("MISSING_CEF_TARGET");
      if (["accepted", "completed"].includes(value.event) || (value.event === "error" && value.request_id)) {
        const waiter = this.#requests.get(value.request_id);
        if (!waiter) throw new Error("UNKNOWN_CEF_RESPONSE");
        if (value.event !== "accepted") {
          this.#requests.delete(value.request_id);
          // A native generation check can reject input already in flight when
          // history navigation commits. Match the local resolve() error so the
          // presenter discards that input without closing the healthy engine.
          if (value.event === "error") waiter.reject(new Error(value.code === "stale_target" ? "STALE_CEF_TARGET" : "CEF_ACTION_FAILED"));
          else if (!["success", "unsupported", "failed", "uncertain"].includes(value.status)) throw new Error("INVALID_CEF_COMPLETION");
          else waiter.resolve({ status: value.status, reason: value.reason, target: this.target });
          this.#pumpInput();
        }
      }
      if (value.event === "title" && (typeof value.title !== "string" || value.title.length > 1024)) throw new Error("INVALID_CEF_TITLE");
      if (value.event === "loading" && ![value.loading, value.can_go_back, value.can_go_forward].every(item => typeof item === "boolean")) throw new Error("INVALID_CEF_LOADING");
      if (value.event === "url") {
        if (!allowedFixtureURL(value.url, this.#pending.identity)) throw new Error("INVALID_CEF_URL");
        this.#currentURL = value.url;
      }
      if (value.event === "load") {
        if (!Number.isInteger(value.http_status) || typeof value.restored_from_history !== "boolean") throw new Error("INVALID_CEF_LOAD");
        const pendingHistory = [...this.#requests.values()].some(request => ["back", "forward"].includes(request.method));
        const restored = value.http_status === 0 && value.restored_from_history && pendingHistory && this.#committedURLs.has(this.#currentURL);
        if (value.restored_from_history && !restored) throw new Error("INVALID_CEF_HISTORY_RESTORE");
        this.#loaded = value.http_status === 200 || restored;
        if (value.http_status === 200 && this.#currentURL) this.#committedURLs.add(this.#currentURL);
        if (!this.#loaded) this.#frameWait?.reject(new Error("CEF_FIXTURE_LOAD_FAILED"));
      }
      if (value.event === "closed") this.nativeClosed = true;
      this.readPhase = "event_callback";
      try { this.onEvent(value); }
      catch { throw new Error("CEF_EVENT_CALLBACK_FAILED"); }
    }
  }
  resolve(target) {
    if (!this.target || !sameCEFTarget(validateCEFTarget(target), this.target)) throw new Error("STALE_CEF_TARGET");
    if (this.#ended || this.#closing) throw new Error("CEF_UNAVAILABLE");
    return this.target;
  }
  async create(url, surface) {
    if (this.#created || this.status !== "connected" || !allowedFixtureURL(url, this.#pending.identity)) throw new Error("INVALID_CEF_CREATE");
    this.surface = validateSurface(surface);
    this.#frameWait = this.#waiter("CEF_FIRST_FRAME");
    const result = await this.#request("create", { url, ...this.surface }, this.#pending);
    if (result.status !== "success") throw new Error("CEF_CREATE_UNSUPPORTED_OR_FAILED");
    // Acceptance/creation alone cannot replace the original Gecko presentation.
    await this.#frameWait.promise;
    this.status = "active";
    return this.target;
  }
  navigate(target, url) {
    this.resolve(target);
    if (!allowedFixtureURL(url, this.#pending.identity)) return Promise.resolve({ status: "unsupported", reason: "FIXTURE_ONLY" });
    return this.#request("navigate", { url });
  }
  back(target) { this.resolve(target); return this.#request("back"); }
  forward(target) { this.resolve(target); return this.#request("forward"); }
  reload(target) { this.resolve(target); return this.#request("reload"); }
  developerTools() { return Promise.resolve({ status: "unsupported", reason: "DEVTOOLS_NOT_INTEGRATED" }); }
  resize(target, surface) {
    this.resolve(target);
    const next = validateSurface(surface), previous = this.surface;
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
  input(target, method, fields) {
    this.resolve(target);
    const validated = validateCEFInput(method, fields, this.surface);
    if (this.#inputQueue.length >= MAX_QUEUED_INPUT) {
      // Further input could strand key-up or pointer-up after an earlier down.
      // Stop this experimental engine rather than drop a mutating command and
      // keep presenting a seemingly healthy Chromium surface.
      this.#fail("CEF_INPUT_BACKPRESSURE");
      return Promise.reject(new Error("CEF_INPUT_BACKPRESSURE"));
    }
    return new Promise((resolve, reject) => {
      this.#inputQueue.push({ target, method, fields:validated, resolve, reject });
      this.#pumpInput();
    });
  }
  #fail(reason) {
    if (this.#ended) return;
    this.#ended = true; this.status = "failed";
    // Fixed metadata only: no URLs, input, target IDs, profile paths or tokens.
    console.error("AXIOSOZO_CEF_DIAGNOSTIC", JSON.stringify({ code:reason, phase:this.readPhase,
      lastFrameId:this.#lastFrame, lastFrameBytes:this.lastFrameBytes,
      surface:this.surface && { width:this.surface.width, height:this.surface.height,
        deviceScale:this.surface.device_scale }, pendingRequests:this.#requests.size,
      queuedInputs:this.#inputQueue.length,
      nativeExitCode:this.nativeExitCode }));
    const error = new Error(reason);
    this.#readyWait?.reject(error); this.#frameWait?.reject(error);
    for (const waiter of this.#requests.values()) waiter.reject(error);
    this.#requests.clear();
    this.#rejectQueuedInput(error);
    this.#process.stdin.close().catch(() => {});
    this.#process.kill(500).catch(() => {});
    this.onFailure(error);
  }
  async close() {
    if (this.#ended) return;
    try {
      const done = this.#request(this.#created ? "close" : "shutdown");
      this.#closing = true;
      await done;
      const result = await this.#process.wait();
      if (result.exitCode !== 0) throw new Error("CEF_SHUTDOWN_FAILED");
      this.#ended = true; this.status = "closed";
      const unavailable = new Error("CEF_UNAVAILABLE");
      for (const waiter of this.#requests.values()) waiter.reject(unavailable);
      this.#requests.clear(); this.#rejectQueuedInput(unavailable);
      await this.#process.stdin.close();
    } catch (error) { this.#fail("CEF_CLOSE_OUTCOME_UNCERTAIN"); throw error; }
  }
}

/** Actual Firefox process API. Only project-owned runtime paths are allowed. */
export async function launchCEF(win, { tabId, origin, onEvent, onFrame, onFailure }) {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  const root = Services.env.get("AXIOSOZO_BUILD_ROOT");
  const session = Services.env.get("AXIOSOZO_SESSION_RUNTIME");
  const command = Services.env.get("AXIOSOZO_CEF_BINARY");
  if (!/^\/Volumes\/[a-zA-Z0-9_-]+$/u.test(root) || command !== `${root}/cef/AxioCEFProbe.app/Contents/MacOS/AxioCEFProbe`
      || !validCEFSessionRuntime(root, session, Services.dirsvc.get("ProfD", Ci.nsIFile).path)
      || origin !== Services.env.get("AXIOSOZO_ENGINE_FIXTURE_ORIGIN") || !validFixtureOrigin(origin) || !id(tabId)) {
    throw new Error("CEF_PROJECT_RUNTIME_UNAVAILABLE");
  }
  const instance = Services.uuid.generateUUID().toString().replace(/[{}]/gu, "");
  const profile = `${session}/cef-${instance}`;
  // The owner session confines this private CEF profile beside its Gecko profile.
  await IOUtils.makeDirectory(profile, { permissions: 0o700, createAncestors: false });
  const random = Cc["@mozilla.org/security/random-generator;1"].getService(Ci.nsIRandomGenerator).generateRandomBytes(32);
  const token = [...random].map(value => value.toString(16).padStart(2, "0")).join("");
  let process;
  try {
    process = await Subprocess.call({ command, arguments: ["--stream", profile, profile],
      environmentAppend: false, environment: { PATH: "/usr/bin:/bin:/usr/sbin:/sbin", TMPDIR: profile }, stderr: "pipe" });
  } catch (error) {
    await IOUtils.remove(profile, { recursive: true });
    throw error;
  }
  // CEF owns this directory until its process exits. Remove only the generated
  // path, on normal close or crash; never remove another session's profile.
  const cleanup = () => IOUtils.remove(profile, { recursive: true });
  process.wait().then(cleanup, cleanup).catch(() => onFailure(new Error("CEF_PROFILE_CLEANUP_FAILED")));
  const adapter = new CEFEngineAdapter(process, { token, timers,
    pendingTarget: { tab_id: tabId, engine_instance: instance, identity: origin,
      document_generation: 1, navigation_generation: 1, private_mode: false },
    onEvent, onFrame, onFailure });
  try { return await adapter.connect(); }
  catch (error) { await adapter.close().catch(() => {}); throw error; }
}
