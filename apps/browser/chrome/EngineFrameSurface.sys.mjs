/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Engine-neutral pixel path of the pipe presenters (CEFPresenter, WebKitPresenter):
// premultiplied BGRA frames from an engine host to a chrome 2D <canvas>.
// docs/perf/pixel-path.md has the design and the measurements behind each choice.
//
// - One 32-bit swizzle per opaque pixel; only 0 < alpha < 255 pays for unpremultiply.
// - A persistent RGBA ImageData per surface (no per-frame allocation); only the union
//   of the damage since the last paint is converted and uploaded
//   (putImageData's dirty-rectangle form).
// - At most one conversion + upload per refresh tick (requestAnimationFrame): a frame
//   that a newer one supersedes before the tick costs no pixel work, and the host's
//   frame credit is returned as soon as a frame is accepted, not after its paint.
// - Upload (pref `axiosozo.engines.linux.frame_upload`): "videoframe" (default where the window
//   draws BGRX VideoFrames exactly) wraps the damaged rows of the BGRA frame in a VideoFrame of
//   format BGRX (Gecko's native B8G8R8X8, no JS swizzle, no unpremultiply: the canvas is opaque)
//   and draws it with drawImage; "imagedata" is the JS swizzle into a persistent ImageData + putImageData. A
//   VideoFrame failure switches that surface to "imagedata" for good.
// - With `hello.damage_payload` (engine-stream-v1 §6.2, cef-v1 "Frame damage") the
//   payload is only the damaged rectangle; DamagePayloadAssembler rebuilds the whole
//   frame per target, so presenters always see a full frame plus its damage.
//
// Surface mode (macOS IOSurface, engine-surface-v1) never reaches this module.

const LITTLE_ENDIAN = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
const arrayBufferLength = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;

function u32View(buffer, byteOffset = 0, length = undefined) {
  return length === undefined ? new Uint32Array(buffer, byteOffset) : new Uint32Array(buffer, byteOffset, length);
}

/**
 * Converts a `width`×`height` rectangle of premultiplied BGRA (`source`, an ArrayBuffer of
 * `sourceWidth` px rows, tight stride) at (sx, sy) into unpremultiplied RGBA in `target`
 * (a Uint8ClampedArray of `targetWidth` px rows) at (tx, ty). `target` may view `source`
 * itself with the same geometry (in-place conversion). Output bytes are exactly those of
 * the per-byte reference: rgb × 255/alpha for 0 < alpha < 255, clamped and rounded.
 */
export function convertBGRARect(source, sourceWidth, sx, sy, target, targetWidth, tx, ty, width, height) {
  const src8 = new Uint8Array(source), dst8 = target;
  if (LITTLE_ENDIAN && dst8.byteOffset % 4 === 0) {
    const src32 = u32View(source, 0, src8.length >>> 2), dst32 = u32View(dst8.buffer, dst8.byteOffset, dst8.length >>> 2);
    if (width === sourceWidth && width === targetWidth) {
      // Whole rows: one flat run.
      swizzleRun(src32, src8, sy * width, dst32, dst8, ty * width, width * height);
    } else {
      for (let row = 0; row < height; row++) {
        swizzleRun(src32, src8, (sy + row) * sourceWidth + sx, dst32, dst8, (ty + row) * targetWidth + tx, width);
      }
    }
    return target;
  }
  for (let row = 0; row < height; row++) {
    let from = ((sy + row) * sourceWidth + sx) * 4, to = ((ty + row) * targetWidth + tx) * 4;
    for (let column = 0; column < width; column++, from += 4, to += 4) {
      const blue = src8[from], green = src8[from + 1], red = src8[from + 2], alpha = src8[from + 3];
      const scale = alpha && alpha !== 255 ? 255 / alpha : 1;
      dst8[to] = red * scale; dst8[to + 1] = green * scale; dst8[to + 2] = blue * scale; dst8[to + 3] = alpha;
    }
  }
  return target;
}

function swizzleRun(src32, src8, from, dst32, dst8, to, count) {
  if (from === to && src32.buffer === dst32.buffer && src32.byteOffset === dst32.byteOffset) {
    // In place: one array for reads and writes (SpiderMonkey keeps this loop tightest).
    const end = from + count;
    for (let p = from; p < end; p++) {
      const value = src32[p], alpha = value >>> 24;
      if (alpha === 255) {
        src32[p] = (value & 0xff00ff00) | ((value & 0xff) << 16) | ((value >>> 16) & 0xff);
        continue;
      }
      unpremultiply(src8, p * 4, dst8, p * 4, alpha);
    }
    return;
  }
  if (from === to) {
    // Same pixel index in source and target (whole frames, and every surface paint): one
    // index, the shape SpiderMonkey compiles best (presenter bench, run 39340129366).
    const end = from + count;
    for (let p = from; p < end; p++) {
      const value = src32[p], alpha = value >>> 24;
      if (alpha === 255) {
        // Memory B,G,R,A (little-endian 0xAARRGGBB) to R,G,B,A (0xAABBGGRR).
        dst32[p] = (value & 0xff00ff00) | ((value & 0xff) << 16) | ((value >>> 16) & 0xff);
        continue;
      }
      unpremultiply(src8, p * 4, dst8, p * 4, alpha);
    }
    return;
  }
  const delta = to - from, end = from + count;
  for (let p = from; p < end; p++) {
    const value = src32[p], alpha = value >>> 24;
    if (alpha === 255) {
      dst32[p + delta] = (value & 0xff00ff00) | ((value & 0xff) << 16) | ((value >>> 16) & 0xff);
      continue;
    }
    unpremultiply(src8, p * 4, dst8, (p + delta) * 4, alpha);
  }
}

function unpremultiply(src8, i, dst8, j, alpha) {
  const scale = alpha ? 255 / alpha : 1;
  const blue = src8[i], green = src8[i + 1], red = src8[i + 2];
  dst8[j] = red * scale; dst8[j + 1] = green * scale; dst8[j + 2] = blue * scale; dst8[j + 3] = alpha;
}

/** A whole BGRA frame converted in place; returns the RGBA view of the same buffer. */
export function convertBGRAInPlace(buffer, width) {
  const rgba = new Uint8ClampedArray(buffer);
  const height = width ? rgba.length / 4 / width : 0;
  return convertBGRARect(buffer, width, 0, 0, rgba, width, 0, 0, width, height);
}

/**
 * Draws the rows `y`..`y+h` of a premultiplied BGRA frame (`source`, `frameWidth` px rows, tight
 * stride) onto `context` at the same position, through a VideoFrame of format BGRX over a view of
 * exactly those rows: Gecko copies them once into a B8G8R8X8 surface and blits it. Whole rows
 * because Gecko (156) ignores `VideoFrameBufferInit.layout` and assumes a tight stride, so a
 * narrower rectangle cannot be described without a JS copy. Alpha is ignored (opaque canvas).
 */
export function drawBGRXRows(VideoFrameClass, context, source, frameWidth, y, h, timestamp = 0) {
  const rows = new Uint8Array(source, y * frameWidth * 4, h * frameWidth * 4);
  const frame = new VideoFrameClass(rows, { format: "BGRX", codedWidth: frameWidth, codedHeight: h, timestamp });
  try { context.drawImage(frame, 0, y); }
  finally { frame.close(); }
}

export const FRAME_UPLOAD_PREF = "axiosozo.engines.linux.frame_upload";

// Once per process: does this engine draw BGRX VideoFrame rows exactly? Row 1 of a 3x2 frame is
// drawn on a scratch canvas at y = 1 and read back.
let videoFrameProbe = null;
export function videoFrameUploadWorks(win) {
  if (videoFrameProbe !== null) return videoFrameProbe.ok;
  const pixels = [[10, 20, 30], [40, 50, 60], [70, 80, 90], [100, 110, 120], [130, 140, 150], [160, 170, 180]];
  try {
    const bgra = new Uint8Array(pixels.flatMap(([r, g, b]) => [b, g, r, 255]));
    const canvas = new win.OffscreenCanvas(3, 2), context = canvas.getContext("2d", { alpha: false });
    drawBGRXRows(win.VideoFrame, context, bgra.buffer, 3, 1, 1, 0);
    const out = context.getImageData(0, 1, 3, 1).data, want = [...pixels[3], 255, ...pixels[4], 255, ...pixels[5], 255];
    const ok = want.every((value, i) => Math.abs(out[i] - value) <= 2);
    videoFrameProbe = { ok, ...(ok ? {} : { got: [...out] }) };
  } catch (error) { videoFrameProbe = { ok: false, error: String(error?.message ?? error) }; }
  return videoFrameProbe.ok;
}
/** The probe's outcome (diagnostics): null before the first surface asked. */
export function videoFrameUploadProbe() { return videoFrameProbe; }
/** Test seam: probe again. */
export function resetVideoFrameProbe() { videoFrameProbe = null; }

/** "videoframe" when the pref allows it and the window draws BGRX VideoFrames exactly, else "imagedata". */
export function frameUploadMode(win, prefs = globalThis.Services?.prefs) {
  let wanted = "videoframe";
  try { wanted = prefs?.getStringPref(FRAME_UPLOAD_PREF, "videoframe") ?? "videoframe"; } catch {}
  return wanted === "videoframe" && typeof win?.VideoFrame === "function" && videoFrameUploadWorks(win)
    ? "videoframe" : "imagedata";
}

function unite(a, b) {
  if (!a) return b;
  const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]);
  return [x, y, Math.max(a[0] + a[2], b[0] + b[2]) - x, Math.max(a[1] + a[3], b[1] + b[3]) - y];
}

/**
 * One presenter canvas fed with full BGRA frames (+ optional single damage rectangle).
 * `isPaintable()` is asked at accept and at paint time; a frame that is not painted
 * leaves the canvas stale and the next paint uploads the whole frame.
 * `onPaint({ uploadedPixels, framePixels, milliseconds, frameId, superseded })` after each paint.
 */
export class EngineFrameSurface {
  #win; #canvas; #isPaintable; #onPaint; #contextOptions;
  #source = null; #metadata = null; #width = 0; #height = 0; #dirty = null; #pending = 0;
  #image = null; #current = false; #scheduled = false; #disposed = false; #upload = "imagedata"; #uploadError = null;
  constructor(win, canvas, { isPaintable = () => true, onPaint = () => {}, contextOptions = { alpha: false },
    upload = frameUploadMode(win) } = {}) {
    this.#win = win; this.#canvas = canvas; this.#isPaintable = isPaintable; this.#onPaint = onPaint;
    this.#contextOptions = contextOptions; this.#upload = upload;
  }
  get scheduled() { return this.#scheduled; }
  /** "videoframe" or "imagedata" (after a VideoFrame failure: "imagedata", with `uploadError`). */
  get upload() { return this.#upload; }
  get uploadError() { return this.#uploadError; }
  /** A frame from the host: recorded now, converted and uploaded at the next refresh tick. */
  accept(metadata, pixels) {
    if (this.#disposed) return;
    const { width, height } = metadata;
    const full = [0, 0, width, height];
    if (width !== this.#width || height !== this.#height) { this.#width = width; this.#height = height; this.#dirty = full; }
    else this.#dirty = unite(this.#dirty, metadata.damage?.[0] ?? full);
    this.#source = pixels; this.#metadata = metadata; this.#pending++;
    if (!this.#isPaintable()) { this.#current = false; return; }
    this.#schedule();
  }
  /** The canvas lost its content (or was never drawn): the next paint is whole. */
  invalidate() {
    this.#current = false;
    if (this.#source && !this.#disposed && this.#isPaintable()) this.#schedule();
  }
  dispose() { this.#disposed = true; this.#source = null; this.#image = null; this.#metadata = null; }
  #schedule() {
    if (this.#scheduled) return;
    this.#scheduled = true;
    this.#win.requestAnimationFrame(() => { this.#scheduled = false; this.paint(); });
  }
  /** Converts and uploads what changed since the last paint (exposed for tests and benches). */
  paint() {
    if (this.#disposed || !this.#source || !this.#dirty) return false;
    if (!this.#isPaintable()) { this.#current = false; return false; }
    const started = this.#win.performance.now();
    const canvas = this.#canvas, width = this.#width, height = this.#height;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width; canvas.height = height; this.#current = false; // resizing clears the canvas
    }
    const context = canvas.getContext("2d", this.#contextOptions);
    if (!context) throw new Error("ENGINE_CANVAS_UNAVAILABLE");
    const frameId = this.#metadata.frame_id;
    let [x, y, w, h] = this.#current ? this.#dirty : [0, 0, width, height];
    if (this.#upload === "videoframe") {
      // Whole rows of the damage (see drawBGRXRows).
      [x, w] = [0, width];
      try { drawBGRXRows(this.#win.VideoFrame, context, this.#source, width, y, h, frameId); }
      catch (error) {
        // This window cannot draw BGRX VideoFrames: the JS path from now on, starting whole.
        this.#upload = "imagedata"; this.#uploadError = String(error?.message ?? error);
        [x, y, w, h] = [0, 0, width, height];
      }
    }
    if (this.#upload === "imagedata") {
      if (!this.#image || this.#image.width !== width || this.#image.height !== height) {
        this.#image = new this.#win.ImageData(new Uint8ClampedArray(width * height * 4), width, height);
        [x, y, w, h] = [0, 0, width, height];
      }
      convertBGRARect(this.#source, width, x, y, this.#image.data, width, x, y, w, h);
      context.putImageData(this.#image, 0, 0, x, y, w, h);
    }
    const superseded = this.#pending - 1;
    this.#current = true; this.#dirty = null; this.#pending = 0;
    this.#onPaint({ uploadedPixels: w * h, framePixels: width * height, x, y, width: w, height: h,
      milliseconds: this.#win.performance.now() - started, frameId, superseded, upload: this.#upload });
    return true;
  }
}

function bufferLength(value) {
  try { return Reflect.apply(arrayBufferLength, value, []); }
  catch { return -1; }
}

/**
 * `hello.damage_payload`: frame payloads carry only the damage rectangle's rows
 * (`width*height*4` bytes of the rectangle, tight). Keeps the last whole frame per native
 * target, patches each payload into it and returns that whole frame, so the receive
 * path above the reader is unchanged. Every delivered frame is applied, presented or not:
 * the host's damage is relative to the previous frame it delivered for that target and size.
 * A partial frame without a whole frame of its size before it is a protocol error.
 */
export class DamagePayloadAssembler {
  #frames = new Map();
  static payloadBytes(metadata) {
    const damage = metadata?.damage?.[0];
    return damage ? damage[2] * damage[3] * 4 : -1;
  }
  apply(metadata, payload) {
    const key = metadata.target?.native_target_id;
    if (typeof key !== "string" || !key) throw new Error("INVALID_DAMAGE_PAYLOAD");
    const [x, y, w, h] = metadata.damage[0];
    const { width, height } = metadata;
    if (bufferLength(payload) !== w * h * 4) throw new Error("INVALID_DAMAGE_PAYLOAD");
    if (x === 0 && y === 0 && w === width && h === height) {
      // A whole frame becomes the backing as is (no copy).
      this.#frames.set(key, { width, height, buffer: payload });
      return payload;
    }
    const frame = this.#frames.get(key);
    if (!frame || frame.width !== width || frame.height !== height) throw new Error("INVALID_DAMAGE_PAYLOAD");
    const target = new Uint8Array(frame.buffer), rows = new Uint8Array(payload), rowBytes = w * 4;
    for (let row = 0; row < h; row++) {
      target.set(rows.subarray(row * rowBytes, (row + 1) * rowBytes), ((y + row) * width + x) * 4);
    }
    return frame.buffer;
  }
  /** A target closed: its frame is released. */
  forget(nativeTargetId) { this.#frames.delete(nativeTargetId); }
  get size() { return this.#frames.size; }
}

/**
 * `hello.frame_transport:"memfd"` (engine-stream-v1 §6.3, Linux): the host keeps frame pixels in
 * a sealed memfd and the AXCF frame (payload size 0) names `{slot, payload_bytes}`. Zen reads the
 * slot with one positioned read of /proc/<host pid>/fd/<fd> on IOUtils' background thread: no
 * pixel bytes through the Subprocess pipe. The frame's ack is the slot's reuse barrier (one frame
 * in flight), so the read completes before the credit returns.
 */
export const MEMFD_FRAMES_PREF = "axiosozo.engines.linux.memfd_frames";
/**
 * Default of MEMFD_FRAMES_PREF on Linux: on since the soak (docs/perf/pixel-path.md, "memfd soak",
 * linux-perf run 39349238042: 30 cycles / 10 min, WebKit + Chromium + Gecko tabs, no fallback,
 * host descriptors flat). The pipe stays the fallback (pre-hello /proc probe, in-band fallback).
 */
export const MEMFD_FRAMES_DEFAULT = true;

// Process-wide: once a slot read failed (or /proc/<pid>/fd was unreadable) every later host of
// this session uses the pipe, so a broken environment costs one fallback, not one per tab.
let memfdDisabled = null;
/** Records why memfd frames stopped being negotiated in this session (first reason wins). */
export function disableMemfdFrames(reason) {
  memfdDisabled ??= { reason: String(reason), at: Date.now() };
  return memfdDisabled;
}
export function memfdFramesDisabled() { return memfdDisabled; }
/** Test seam: forget the session latch. */
export function resetMemfdFrames() { memfdDisabled = null; }

/** Whether a Linux pipe-mode host should be asked for memfd frames (pref, default, latch). */
export function memfdFramesWanted(prefs = globalThis.Services?.prefs) {
  if (memfdDisabled) return false;
  try { return prefs ? prefs.getBoolPref(MEMFD_FRAMES_PREF, MEMFD_FRAMES_DEFAULT) : MEMFD_FRAMES_DEFAULT; }
  catch { return MEMFD_FRAMES_DEFAULT; }
}

/**
 * Before the hello: can Zen open the spawned host's descriptors at all? Listing /proc/<pid>/fd
 * needs the same ptrace-read access as opening a slot (Yama scope ≥ 2, a non-dumpable host or a
 * restricted /proc refuse it). False means "ask for the pipe" and latches the session.
 */
export async function memfdProcReadable(pid, getChildren = globalThis.IOUtils?.getChildren?.bind(globalThis.IOUtils)) {
  if (!Number.isInteger(pid) || pid <= 1 || typeof getChildren !== "function") return false;
  try { await getChildren(`/proc/${pid}/fd`); return true; }
  catch { disableMemfdFrames("proc_fd_unreadable"); return false; }
}

/**
 * The frame_ack of a frame whose slot could not be read (§6.3 fallback): the frame is dropped,
 * `frame_transport:"pipe"` moves every later frame of this host into the pipe and makes the
 * host send each target's next frame whole (Zen's copy of the dropped frame's target is stale).
 */
export const MEMFD_FALLBACK_ACK = Object.freeze({ frame_transport: "pipe" });

/** `ready.capabilities.memfd`: `{fd, slot_bytes, slots}` within the pipe frame bound. */
export function validMemfdCapability(value, maxFrameBytes) {
  return !!value && typeof value === "object" && Object.keys(value).length === 3
    && Number.isInteger(value.fd) && value.fd >= 3 && value.fd <= 65535
    && Number.isInteger(value.slot_bytes) && value.slot_bytes > 0 && value.slot_bytes <= maxFrameBytes
    && Number.isInteger(value.slots) && value.slots >= 1 && value.slots <= 4;
}

/** Frame metadata of a memfd frame: a slot of the announced ring and exactly the expected bytes. */
export function validMemfdFrame(metadata, capability, expectedBytes) {
  return Number.isInteger(metadata.slot) && metadata.slot >= 0 && metadata.slot < capability.slots
    && metadata.payload_bytes === expectedBytes && expectedBytes > 0 && expectedBytes <= capability.slot_bytes;
}

/**
 * The slot reader: `read(path, {offset, maxBytes})` → Uint8Array (IOUtils.read). The pid is the
 * spawned host's own (Subprocess `pid`), the fd the one its authenticated ready event announced.
 */
export function memfdSlotReader(pid, capability, read = globalThis.IOUtils?.read?.bind(globalThis.IOUtils)) {
  if (!Number.isInteger(pid) || pid <= 1 || typeof read !== "function") throw new Error("MEMFD_UNAVAILABLE");
  const path = `/proc/${pid}/fd/${capability.fd}`;
  const once = async (slot, bytes) => {
    try {
      const data = await read(path, { offset: slot * capability.slot_bytes, maxBytes: bytes });
      return data && data.byteLength === bytes ? data : null;
    } catch { return null; }
  };
  return async (slot, bytes) => {
    // One retry: a transient failure (EINTR/ENOMEM) should not cost the transport.
    const data = await once(slot, bytes) ?? await once(slot, bytes);
    if (!data) throw new Error("MEMFD_READ_FAILED");
    // The presenter keeps a reference until its next paint: a tight, exclusive buffer.
    return data.byteOffset === 0 && data.buffer.byteLength === bytes ? data.buffer : data.slice().buffer;
  };
}

/**
 * Native receiver (docs/perf/pixel-path.md, "Native receiver"; Linux, memfd frames only, pref
 * `axiosozo.engines.linux.native_receiver`, NATIVE_RECEIVER_DEFAULT): the engine-view component
 * (apps/browser/native/engine-view/linux, nsIAxioFrameReceiverService) maps the host's ring and
 * keeps each target's whole frame off the main thread; presented frames go to the canvas's async
 * ImageContainer as B8G8R8X8 images. No pixel crosses JS. Null (the JS path) without the pref,
 * without the component (an app built before it), or when the ring cannot be mapped.
 */
export const NATIVE_RECEIVER_PREF = "axiosozo.engines.linux.native_receiver";
/**
 * On by default where the component exists (an app built with apps/browser/native/engine-view/linux):
 * same-job A/B linux-perf 39364874251 — Zen parent CPU at 2× −49…−53 % for both engines, WebKit 2×
 * key → frame −18…−20 %. Apps without the component (or with the pref false) use the frame worker.
 */
export const NATIVE_RECEIVER_DEFAULT = true;
const NATIVE_RECEIVER_CONTRACT = "@axiosozo.nl/frame-receiver;1";
let nativeReceiverError = null;
export function nativeReceiverStatus() { return nativeReceiverError; }
export function nativeFrameRing(pid, capability, { prefs = globalThis.Services?.prefs, Cc = globalThis.Cc, Ci = globalThis.Ci } = {}) {
  try {
    if (!(prefs ? prefs.getBoolPref(NATIVE_RECEIVER_PREF, NATIVE_RECEIVER_DEFAULT) : NATIVE_RECEIVER_DEFAULT)) return null;
    if (!Ci?.nsIAxioFrameReceiverService || !Cc?.[NATIVE_RECEIVER_CONTRACT]) { nativeReceiverError = "component_unavailable"; return null; }
    const service = Cc[NATIVE_RECEIVER_CONTRACT].getService(Ci.nsIAxioFrameReceiverService);
    return service.openRing(pid, capability.fd, capability.slot_bytes, capability.slots);
  } catch (error) { nativeReceiverError = String(error?.message ?? error); return null; }
}

/** Passed to the presenters instead of pixels when the native receiver applied the frame. */
const NATIVE_FRAME_BRAND = Symbol.for("axiosozo.engine-frame.native-frame");
export class NativeFrame {
  constructor(sink, byteLength) { this.sink = sink; this.byteLength = byteLength; }
  get [NATIVE_FRAME_BRAND]() { return true; }
}
/**
 * A NativeFrame of any module instance of this file: a host started through the shared
 * (system-global) module instance (e.g. a warm spare host) delivers frames to a presenter
 * of a window's own module graph, where `instanceof NativeFrame` names another class.
 */
export function isNativeFrame(value) { return value?.[NATIVE_FRAME_BRAND] === true; }

/**
 * The readers' side of the native receiver: one sink per native target, each delivered memfd
 * frame applied (presented or not, like DamagePayloadAssembler) before its frame_ack.
 */
export class NativeFrameSinks {
  #ring; #sinks = new Map();
  constructor(ring) { this.#ring = ring; }
  async apply(metadata) {
    const key = metadata.target?.native_target_id;
    if (typeof key !== "string" || !key) throw new Error("INVALID_DAMAGE_PAYLOAD");
    let sink = this.#sinks.get(key);
    if (!sink) { sink = this.#ring.createSink(); this.#sinks.set(key, sink); }
    const [x, y, w, h] = metadata.damage?.[0] ?? [0, 0, metadata.width, metadata.height];
    try { await sink.applyFrame(metadata.slot, metadata.payload_bytes, metadata.width, metadata.height, x, y, w, h); }
    catch (error) { throw new Error(error?.message === "MEMFD_READ_FAILED" ? "MEMFD_READ_FAILED" : "INVALID_DAMAGE_PAYLOAD"); }
    return new NativeFrame(sink, metadata.payload_bytes);
  }
  /** Worker sinks also take pipe payloads (after a memfd fallback); the native one does not. */
  get acceptsBuffers() { return this.#ring.acceptsBuffers === true; }
  async applyBuffer(metadata, buffer) {
    const key = metadata.target?.native_target_id;
    if (typeof key !== "string" || !key || !this.acceptsBuffers) throw new Error("INVALID_DAMAGE_PAYLOAD");
    let sink = this.#sinks.get(key);
    if (!sink) { sink = this.#ring.createSink(); this.#sinks.set(key, sink); }
    const bytes = buffer.byteLength;
    const [x, y, w, h] = metadata.damage?.[0] ?? [0, 0, metadata.width, metadata.height];
    try { await sink.applyBuffer(buffer, metadata.width, metadata.height, x, y, w, h); }
    catch { throw new Error("INVALID_DAMAGE_PAYLOAD"); }
    return new NativeFrame(sink, bytes);
  }
  /** A target closed: its sink (and canvas binding) goes. */
  forget(nativeTargetId) {
    const sink = this.#sinks.get(nativeTargetId);
    this.#sinks.delete(nativeTargetId);
    try { sink?.close(); } catch {}
  }
  close() {
    for (const key of [...this.#sinks.keys()]) this.forget(key);
    try { this.#ring.close(); } catch {}
  }
  get size() { return this.#sinks.size; }
}

/**
 * Presenter side: present a NativeFrame on `record.canvas` (bound once; the canvas must never
 * have had a 2D context). Returns false when the canvas cannot be bound: the caller then draws
 * `fallbackFrame()` (a whole-frame copy) through its EngineFrameSurface.
 */
export function presentNativeFrame(win, record, metadata, frame, paintable, onDrawn = null) {
  if (record.nativeSink !== frame.sink) {
    if (record.nativeSink === null || record.frames) return false;  // refused before, or already 2D
    // A new target for this record (the old one closed): release the old binding first.
    if (record.nativeSink) { try { record.nativeSink.close(); } catch {} }
    try { frame.sink.bindCanvas(record.canvas); record.nativeSink = frame.sink; }
    catch { record.nativeSink = null; return false; }
    // A worker reports each draw (the 2D path's paint) itself; the native sink at the post.
    if (frame.sink.kind === "worker") frame.sink.onDrawn = onDrawn;
    else directComposite(win, record);
  }
  // Applied but not shown (hidden window, inactive tab): representNativeFrame posts it on show.
  if (!paintable) { record.nativeUnpresented = metadata.frame_id; return true; }
  record.nativeUnpresented = null;
  if (frame.sink.kind === "worker") { frame.sink.present(metadata.frame_id); return true; }
  const started = win.performance.now();
  const upload = frame.sink.kind ?? "native";
  const canvas = record.canvas;
  // The canvas's intrinsic size is the frame's (CSS scales it to the box, as on the 2D path). A
  // worker sizes its OffscreenCanvas itself (the placeholder refuses width/height).
  if (upload === "native" && (canvas.width !== metadata.width || canvas.height !== metadata.height)) {
    canvas.width = metadata.width; canvas.height = metadata.height;
  }
  frame.sink.present(metadata.frame_id);
  const [, , w, h] = metadata.damage?.[0] ?? [0, 0, metadata.width, metadata.height];
  return { uploadedPixels: w * h, framePixels: metadata.width * metadata.height, frameId: metadata.frame_id,
    milliseconds: win.performance.now() - started, superseded: 0, upload };
}

/**
 * The presenter's view became visible again: post the newest applied frame if it was applied
 * while hidden (the host may not send another one until the page changes).
 */
export function representNativeFrame(record) {
  const frameId = record.nativeUnpresented;
  if (frameId === null || frameId === undefined || !record.nativeSink) return false;
  record.nativeUnpresented = null;
  try { record.nativeSink.present(frameId); return true; } catch { return false; }
}

/**
 * Direct compositing (docs/perf/pixel-path.md, "Direct compositing"; Linux native receiver,
 * pref `axiosozo.engines.linux.direct_composite`, default on). The engine image is opaque and
 * exactly device-pixel sized, and WebRender would composite it as its own compositor surface
 * (no per-frame re-rasterization into picture-cache tiles, no blending) — except that Zen clips
 * every tab panel (`.browserSidebarContainer`) with `overflow: clip` and a 5 px border radius,
 * and a primitive under a rounded clip needs a mask, which WebRender refuses to promote
 * ("overlay not allowed for prim with mask", linux-engine-profile run 39382362542). While the
 * engine view fills that panel, the panel's clip is lifted (its rounded shadow stays) and the
 * four rounded corners are drawn on top instead: tiny caps painted with Zen's own window
 * background (`-moz-element(#zen-browser-background)` over the composited ancestor colors) and
 * masked to the same arc. Only this tab's panel changes, and only while the view is shown.
 * Returns the controller ({ restore(), active }) or null.
 */
export const DIRECT_COMPOSITE_PREF = "axiosozo.engines.linux.direct_composite";
export const DIRECT_COMPOSITE_DEFAULT = true;
const CORNERS = [["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]];
export function directComposite(win, record, { prefs = globalThis.Services?.prefs } = {}) {
  if (record.directComposite !== undefined) return record.directComposite;
  record.directComposite = null;
  let wanted = DIRECT_COMPOSITE_DEFAULT;
  try { if (prefs) wanted = prefs.getBoolPref(DIRECT_COMPOSITE_PREF, DIRECT_COMPOSITE_DEFAULT); } catch {}
  const overlay = record.overlay, panel = record.stack?.closest?.(".browserSidebarContainer");
  if (!wanted || !overlay || !panel || typeof win.ResizeObserver !== "function") return null;
  const doc = win.document, caps = [];
  const prior = { value: panel.style.getPropertyValue("overflow"), priority: panel.style.getPropertyPriority("overflow") };
  let lifted = false, restored = false;
  const lift = on => {
    if (on === lifted) return;
    lifted = on;
    if (on) panel.style.setProperty("overflow", "visible");
    else if (prior.value) panel.style.setProperty("overflow", prior.value, prior.priority);
    else panel.style.removeProperty("overflow");
    for (const cap of caps) cap.style.display = on ? "block" : "none";
  };
  const update = () => {
    if (restored) return;
    const style = win.getComputedStyle(panel);
    // Lifted, the computed overflow is ours; the panel clipped when it was lifted.
    const clips = lifted || style.overflowX !== "visible" || style.overflowY !== "visible";
    const radius = parseFloat(style.borderTopLeftRadius) || 0;
    const outer = panel.getBoundingClientRect(), inner = overlay.getBoundingClientRect();
    const fills = inner.width > 0 && inner.height > 0
      && Math.abs(outer.left - inner.left) < 0.5 && Math.abs(outer.top - inner.top) < 0.5
      && Math.abs(outer.right - inner.right) < 0.5 && Math.abs(outer.bottom - inner.bottom) < 0.5;
    // Only a view that covers the whole panel replaces its clip (anything else keeps Zen's).
    if (!clips || !fills) { lift(false); return; }
    if (radius > 0) paintCaps(panel, outer, radius);
    lift(true);
  };
  const paintCaps = (element, rect, radius) => {
    const background = windowBackground(win, element);
    const image = doc.getElementById("zen-browser-background");
    const imageRect = image?.getBoundingClientRect();
    CORNERS.forEach(([v, h], index) => {
      let cap = caps[index];
      if (!cap) {
        cap = caps[index] = doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
        cap.setAttribute("aria-hidden", "true");
        cap.className = "axiosozo-engine-corner";
        overlay.appendChild(cap);
      }
      const x = h === "left" ? rect.left : rect.right - radius, y = v === "top" ? rect.top : rect.bottom - radius;
      const style = cap.style;
      style.cssText = `position:absolute;${v}:0;${h}:0;width:${radius}px;height:${radius}px;z-index:2;pointer-events:none;`;
      style.backgroundColor = background;
      if (imageRect?.width && imageRect.height) {
        // Zen's gradient/grain layer, aligned with where it is painted under the panel.
        style.backgroundImage = "-moz-element(#zen-browser-background)";
        style.backgroundRepeat = "no-repeat";
        style.backgroundSize = `${imageRect.width}px ${imageRect.height}px`;
        style.backgroundPosition = `${imageRect.left - x}px ${imageRect.top - y}px`;
      }
      // Visible only outside the arc (the part the rounded clip removed).
      style.mask = `radial-gradient(circle ${radius}px at ${h === "left" ? "100%" : "0"} ${v === "top" ? "100%" : "0"}, `
        + `transparent calc(${radius}px - 0.5px), black ${radius}px)`;
      style.display = lifted ? "block" : "none";
    });
  };
  const observer = new win.ResizeObserver(() => update());
  observer.observe(panel); observer.observe(overlay);
  const controller = {
    get active() { return lifted; },
    update,
    restore() {
      if (restored) return;
      lift(false); restored = true;
      observer.disconnect();
      for (const cap of caps) cap.remove();
      caps.length = 0;
      record.directComposite = undefined;
    },
  };
  record.directComposite = controller;
  update();
  return controller;
}

/** The opaque color behind `element`: its ancestors' background colors, composited (alpha). */
function windowBackground(win, element) {
  const layers = [];
  for (let node = element.parentElement; node; node = node.parentElement) {
    const match = /rgba?\(([^)]+)\)/u.exec(win.getComputedStyle(node).backgroundColor || "");
    if (!match) continue;
    const [r, g, b, a = 1] = match[1].split(/[\s,/]+/u).filter(Boolean).map(Number);
    if (a > 0) layers.push([r, g, b, a]);
    if (a >= 1) break;
  }
  let [r, g, b] = [255, 255, 255];
  for (const [lr, lg, lb, la] of layers.reverse()) {
    r = lr * la + r * (1 - la); g = lg * la + g * (1 - la); b = lb * la + b * (1 - la);
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/** The NativeFrame's whole frame as a frame for an EngineFrameSurface (bind refused). */
export function nativeFallbackFrame(metadata, frame) {
  const buffer = typeof frame.sink.copyFrame === "function" ? frame.sink.copyFrame() : null;
  if (!buffer) return null;
  const whole = { ...metadata };
  delete whole.damage;
  return { metadata: whole, pixels: buffer };
}

/** captureFixtureFrame of a natively presented canvas: the sink's frame as a PNG data URL. */
export function nativeFramePNG(win, sink) {
  // Worker sinks draw into the (placeholder) canvas itself: the caller snapshots that.
  const buffer = typeof sink.copyFrame === "function" ? sink.copyFrame() : null;
  if (!buffer) return null;
  const width = sink.width, height = sink.height;
  const canvas = win.document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
  canvas.width = width; canvas.height = height;
  const rgba = convertBGRAInPlace(buffer, width);
  canvas.getContext("2d").putImageData(new win.ImageData(new Uint8ClampedArray(rgba.buffer, 0, width * height * 4), width, height), 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * Off-main-thread JS path (docs/perf/pixel-path.md, "Frame worker"; pref
 * `axiosozo.engines.linux.frame_worker`, FRAME_WORKER_DEFAULT; used when the native receiver is not):
 * one ChromeWorker per native target with the same sink interface as the native receiver. The
 * worker opens the host's memfd with IOUtils.openFileForSyncReading, reads each slot into a
 * persistent buffer (no per-frame allocation), keeps the whole frame, and draws presented frames
 * into the presenter canvas through transferControlToOffscreen() (BGRX VideoFrame rows, else
 * the JS swizzle + putImageData). The main thread only validates metadata, posts and acks.
 * captureFixtureFrame keeps working: Gecko snapshots a placeholder canvas for toDataURL.
 */
export const FRAME_WORKER_PREF = "axiosozo.engines.linux.frame_worker";
/**
 * On by default since the same-job A/B (linux-perf 39352857399, docs/perf/pixel-path.md "Frame
 * worker A/B"): at 2× the Zen parent's CPU −40 % for both engines, Chromium key → frame −44 %.
 * Used only with memfd frames and only after the once-per-process probe succeeded.
 */
export const FRAME_WORKER_DEFAULT = true;
export function frameWorkerWanted(prefs = globalThis.Services?.prefs) {
  try { return prefs ? prefs.getBoolPref(FRAME_WORKER_PREF, FRAME_WORKER_DEFAULT) : FRAME_WORKER_DEFAULT; }
  catch { return FRAME_WORKER_DEFAULT; }
}
export const FRAME_WORKER_URL = "chrome://browser/content/axiosozo/EngineFrameWorker.js";

/** The worker side (EngineFrameWorker.js loads this module into its own global and calls it). */
const frameIdOf = data => (Number.isSafeInteger(data?.frameId) ? data.frameId : 0);
export function runFrameWorker(scope, { IOUtils = scope.IOUtils } = {}) {
  let file = null, slotBytes = 0, payload = null, frame = null, width = 0, height = 0;
  let canvas = null, context = null, image = null, upload = "imagedata", dirty = null, current = false;
  const stats = { applied: 0, presented: 0, readMicros: 0, drawMicros: 0, upload: null };
  const now = () => scope.performance?.now?.() ?? Date.now();
  const reply = (id, ok, extra = {}) => scope.postMessage({ id, ok, stats, width, height, ...extra });
  const patch = (source, w0, h0, x, y, w, h) => {
    if (x === 0 && y === 0 && w === w0 && h === h0) {
      if (!frame || frame.length !== w0 * h0 * 4) frame = new Uint8Array(w0 * h0 * 4);
      frame.set(source.subarray(0, w0 * h0 * 4));
      dirty = [0, 0, w0, h0];
    } else {
      if (!frame || width !== w0 || height !== h0) throw new Error("INVALID_DAMAGE_PAYLOAD");
      const rowBytes = w * 4;
      for (let row = 0; row < h; row++) frame.set(source.subarray(row * rowBytes, (row + 1) * rowBytes), ((y + row) * w0 + x) * 4);
      dirty = unite(dirty, [x, y, w, h]);
    }
    width = w0; height = h0; stats.applied++;
  };
  const handlers = {
    ping: ({ id }) => reply(id, true, { pong: true, sync: typeof IOUtils?.openFileForSyncReading === "function",
      offscreen: typeof scope.OffscreenCanvas === "function" }),
    open: ({ path, slotBytes: bytes }) => { file = IOUtils.openFileForSyncReading(path); slotBytes = bytes; },
    apply: ({ id, slot, bytes, width: w0, height: h0, x, y, w, h }) => {
      const started = now();
      if (!file || bytes !== w * h * 4 || bytes > slotBytes) throw new Error("MEMFD_READ_FAILED");
      if (!payload || payload.length < bytes) payload = new Uint8Array(bytes);
      const view = payload.subarray(0, bytes);
      try { file.readBytesInto(view, slot * slotBytes); }
      catch { throw new Error("MEMFD_READ_FAILED"); }
      stats.readMicros += Math.round((now() - started) * 1000);
      patch(view, w0, h0, x, y, w, h);
      reply(id, true);
    },
    applyBuffer: ({ id, buffer, width: w0, height: h0, x, y, w, h }) => {
      if (buffer.byteLength !== w * h * 4) throw new Error("INVALID_DAMAGE_PAYLOAD");
      patch(new Uint8Array(buffer), w0, h0, x, y, w, h);
      reply(id, true);
    },
    bind: ({ canvas: offscreen }) => {
      canvas = offscreen; context = canvas.getContext("2d", { alpha: false }); current = false;
      upload = typeof scope.VideoFrame === "function" && videoFrameUploadWorks(scope) ? "videoframe" : "imagedata";
      stats.upload = upload;
    },
    present: data => {
      if (!context || !frame || !dirty) return;
      const started = now();
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; current = false; }
      let [x, y, w, h] = current ? dirty : [0, 0, width, height];
      if (upload === "videoframe") {
        try { drawBGRXRows(scope.VideoFrame, context, frame.buffer, width, y, h, stats.presented); }
        catch { upload = stats.upload = "imagedata"; [x, y, w, h] = [0, 0, width, height]; }
      }
      if (upload === "imagedata") {
        if (!image || image.width !== width || image.height !== height) {
          image = new scope.ImageData(new Uint8ClampedArray(width * height * 4), width, height);
          [x, y, w, h] = [0, 0, width, height];
        }
        convertBGRARect(frame.buffer, width, x, y, image.data, width, x, y, w, h);
        context.putImageData(image, 0, 0, x, y, w, h);
      }
      current = true; dirty = null; stats.presented++;
      const milliseconds = now() - started;
      stats.drawMicros += Math.round(milliseconds * 1000);
      scope.postMessage({ drawn: true, stats, frameId: frameIdOf(data), uploadedPixels: w * h, framePixels: width * height,
        milliseconds, superseded: 0, upload: "worker" });
    },
    close: () => { try { file?.close(); } catch {} file = null; frame = payload = image = null; scope.close?.(); },
  };
  scope.onmessage = ({ data }) => {
    try { handlers[data?.type]?.(data); }
    catch (error) { if (data?.id) reply(data.id, false, { error: String(error?.message ?? error) }); }
  };
}

/** The main-thread side of one worker sink (the native sink's interface). */
export class WorkerFrameSink {
  kind = "worker"; width = 0; height = 0; onDrawn = null;
  #worker; #next = 1; #waiting = new Map(); #stats = {}; #closed = false; #bound = false;
  constructor(worker, path, slotBytes) {
    this.#worker = worker;
    worker.onmessage = ({ data }) => {
      if (data?.stats) this.#stats = data.stats;
      if (data?.drawn) { try { this.onDrawn?.({ ...data, frameId: data.frameId }); } catch {} return; }
      const waiter = this.#waiting.get(data?.id);
      if (!waiter) return;
      this.#waiting.delete(data.id);
      if (data.ok) waiter.resolve(data); else waiter.reject(new Error(data.error || "MEMFD_READ_FAILED"));
    };
    worker.onerror = event => { event?.preventDefault?.(); this.#failAll(new Error("ENGINE_FRAME_WORKER_FAILED")); };
    if (path) worker.postMessage({ type: "open", path, slotBytes });
  }
  #failAll(error) { for (const waiter of this.#waiting.values()) waiter.reject(error); this.#waiting.clear(); }
  #call(message, transfer) {
    if (this.#closed) return Promise.reject(new Error("ENGINE_FRAME_WORKER_FAILED"));
    const id = this.#next++;
    return new Promise((resolve, reject) => {
      this.#waiting.set(id, { resolve, reject });
      try { this.#worker.postMessage({ ...message, id }, transfer ?? []); }
      catch (error) {
        // A buffer that cannot be transferred (another compartment's) is copied instead.
        if (!transfer) { this.#waiting.delete(id); reject(error); return; }
        this.#worker.postMessage({ ...message, id });
      }
    });
  }
  ping() { return this.#call({ type: "ping" }); }
  applyFrame(slot, bytes, width, height, x, y, w, h) {
    this.width = width; this.height = height;
    return this.#call({ type: "apply", slot, bytes, width, height, x, y, w, h });
  }
  applyBuffer(buffer, width, height, x, y, w, h) {
    this.width = width; this.height = height;
    return this.#call({ type: "applyBuffer", buffer, width, height, x, y, w, h }, [buffer]);
  }
  bindCanvas(canvas) {
    if (this.#bound || this.#closed) throw new Error("NS_ERROR_DOM_INVALID_STATE_ERR");
    const offscreen = canvas.transferControlToOffscreen();
    this.#worker.postMessage({ type: "bind", canvas: offscreen }, [offscreen]);
    this.#bound = true;
  }
  present(frameId) { if (!this.#closed && this.#bound) this.#worker.postMessage({ type: "present", frameId }); }
  get statsJSON() { return JSON.stringify({ ...this.#stats, bound: this.#bound }); }
  close() {
    if (this.#closed) return;
    this.#closed = true;
    try { this.#worker.postMessage({ type: "close" }); } catch {}
    this.#failAll(new Error("ENGINE_FRAME_WORKER_FAILED"));
  }
}

// Once per process: can a frame worker start here (ChromeWorker, sync file reads, OffscreenCanvas)?
let frameWorkerProbe = null;
export function frameWorkerProbeResult() { return frameWorkerProbe; }
export async function frameWorkersUsable(Worker = globalThis.ChromeWorker, timeoutMs = 2000) {
  if (frameWorkerProbe) return frameWorkerProbe.ok;
  if (typeof Worker !== "function") { frameWorkerProbe = { ok: false, error: "no_chrome_worker" }; return false; }
  let sink = null;
  try {
    sink = new WorkerFrameSink(new Worker(FRAME_WORKER_URL), null, 0);
    const delay = globalThis.setTimeout ?? ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs").setTimeout;
    const answer = await Promise.race([sink.ping(), new Promise((_, no) => delay(() => no(new Error("timeout")), timeoutMs))]);
    frameWorkerProbe = { ok: !!(answer?.pong && answer.sync && answer.offscreen), sync: answer?.sync, offscreen: answer?.offscreen };
  } catch (error) { frameWorkerProbe = { ok: false, error: String(error?.message ?? error) }; }
  finally { sink?.close(); }
  return frameWorkerProbe.ok;
}

/** A ring of worker sinks for one host (the native ring's interface), or null (pref off, no workers). */
export function workerFrameRing(pid, capability, { prefs = globalThis.Services?.prefs, Worker = globalThis.ChromeWorker } = {}) {
  if (!frameWorkerWanted(prefs) || !frameWorkerProbe?.ok || typeof Worker !== "function") return null;
  const path = `/proc/${pid}/fd/${capability.fd}`;
  return { kind: "worker", acceptsBuffers: true,
    createSink: () => new WorkerFrameSink(new Worker(FRAME_WORKER_URL), path, capability.slot_bytes), close() {} };
}
