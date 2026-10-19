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
  #image = null; #current = false; #scheduled = false; #disposed = false;
  constructor(win, canvas, { isPaintable = () => true, onPaint = () => {}, contextOptions = { alpha: false } } = {}) {
    this.#win = win; this.#canvas = canvas; this.#isPaintable = isPaintable; this.#onPaint = onPaint;
    this.#contextOptions = contextOptions;
  }
  get scheduled() { return this.#scheduled; }
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
    if (!this.#image || this.#image.width !== width || this.#image.height !== height) {
      this.#image = new this.#win.ImageData(new Uint8ClampedArray(width * height * 4), width, height);
      this.#current = false;
    }
    const [x, y, w, h] = this.#current ? this.#dirty : [0, 0, width, height];
    convertBGRARect(this.#source, width, x, y, this.#image.data, width, x, y, w, h);
    context.putImageData(this.#image, 0, 0, x, y, w, h);
    const superseded = this.#pending - 1, frameId = this.#metadata.frame_id;
    this.#current = true; this.#dirty = null; this.#pending = 0;
    this.#onPaint({ uploadedPixels: w * h, framePixels: width * height, x, y, width: w, height: h,
      milliseconds: this.#win.performance.now() - started, frameId, superseded });
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
  return async (slot, bytes) => {
    let data;
    try { data = await read(path, { offset: slot * capability.slot_bytes, maxBytes: bytes }); }
    catch { throw new Error("MEMFD_READ_FAILED"); }
    if (!data || data.byteLength !== bytes) throw new Error("MEMFD_READ_FAILED");
    // The presenter keeps a reference until its next paint: a tight, exclusive buffer.
    return data.byteOffset === 0 && data.buffer.byteLength === bytes ? data.buffer : data.slice().buffer;
  };
}
