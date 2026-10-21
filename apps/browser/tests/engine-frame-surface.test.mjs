// EngineFrameSurface: the pipe presenters' shared pixel path (docs/perf/pixel-path.md).
import test from "node:test";
import assert from "node:assert/strict";
import { EngineFrameSurface, DamagePayloadAssembler, convertBGRARect, convertBGRAInPlace }
  from "../chrome/EngineFrameSurface.sys.mjs";

// The per-byte reference every faster path must match exactly.
function reference(buffer) {
  const rgba = new Uint8ClampedArray(buffer);
  for (let i = 0; i < rgba.length; i += 4) {
    const blue = rgba[i], green = rgba[i + 1], red = rgba[i + 2], alpha = rgba[i + 3];
    const scale = alpha && alpha !== 255 ? 255 / alpha : 1;
    rgba[i] = red * scale; rgba[i + 1] = green * scale; rgba[i + 2] = blue * scale; rgba[i + 3] = alpha;
  }
  return rgba;
}
function randomFrame(width, height, seed = 7) {
  const bytes = new Uint8Array(width * height * 4);
  let state = seed;
  for (let i = 0; i < bytes.length; i++) { state = (state * 1103515245 + 12345) >>> 0; bytes[i] = state >>> 24; }
  // Mostly opaque, like pages; every 5th pixel keeps a random (incl. 0) alpha.
  for (let p = 0; p < width * height; p++) if (p % 5) bytes[p * 4 + 3] = 255;
  return bytes.buffer;
}

test("fast conversion is byte-identical to the per-byte reference, whole and per rectangle", () => {
  const width = 37, height = 23, frame = randomFrame(width, height);
  const expected = reference(frame.slice(0));
  assert.deepEqual([...convertBGRAInPlace(frame.slice(0), width)], [...expected]);
  const target = new Uint8ClampedArray(width * height * 4);
  convertBGRARect(frame, width, 5, 3, target, width, 5, 3, 11, 7);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const inside = x >= 5 && x < 16 && y >= 3 && y < 10, i = (y * width + x) * 4;
    assert.deepEqual([...target.subarray(i, i + 4)], inside ? [...expected.subarray(i, i + 4)] : [0, 0, 0, 0]);
  }
  // Into a rectangle-sized buffer, and the source is left untouched.
  const before = new Uint8Array(frame.slice(0));
  const rect = convertBGRARect(frame, width, 5, 3, new Uint8ClampedArray(11 * 7 * 4), 11, 0, 0, 11, 7);
  assert.deepEqual([...rect.subarray(0, 4)], [...expected.subarray((3 * width + 5) * 4, (3 * width + 5) * 4 + 4)]);
  assert.deepEqual(new Uint8Array(frame), before);
});

function fakeWindow() {
  const ticks = [];
  return { ticks, requestAnimationFrame: callback => ticks.push(callback), performance: { now: () => 0 },
    ImageData: class { constructor(data, width, height) { Object.assign(this, { data, width, height }); } },
    tick() { for (const callback of ticks.splice(0)) callback(); } };
}
function fakeCanvas() {
  const puts = [];
  return { puts, width: 300, height: 150,
    getContext: () => ({ putImageData: (image, x, y, dx, dy, dw, dh) => puts.push({ image, rect: [dx, dy, dw, dh] }) }) };
}

test("frames paint once per refresh tick; superseded frames cost no conversion; damage unites", () => {
  const win = fakeWindow(), canvas = fakeCanvas(), paints = [];
  let paintable = true;
  const surface = new EngineFrameSurface(win, canvas, { isPaintable: () => paintable, onPaint: paint => paints.push(paint) });
  const meta = (frame_id, damage) => ({ frame_id, width: 4, height: 3, ...(damage ? { damage: [damage] } : {}) });
  const frame = () => new Uint32Array(12).fill(0xffff0000).buffer; // opaque red (BGRA memory: 00 00 ff ff)
  surface.accept(meta(1), frame());
  assert.equal(win.ticks.length, 1);
  win.tick();
  assert.deepEqual(canvas.puts.at(-1).rect, [0, 0, 4, 3], "the first frame is whole");
  assert.equal(canvas.width, 4); assert.equal(canvas.height, 3);
  assert.deepEqual([...canvas.puts[0].image.data.subarray(0, 4)], [255, 0, 0, 255]);
  surface.accept(meta(2, [0, 0, 1, 1]), frame());
  surface.accept(meta(3, [2, 1, 1, 2]), frame());
  assert.equal(win.ticks.length, 1, "one paint is scheduled per tick");
  win.tick();
  assert.deepEqual(canvas.puts.at(-1).rect, [0, 0, 3, 3], "the damage of both frames is uploaded");
  assert.equal(paints.at(-1).superseded, 1); assert.equal(paints.at(-1).frameId, 3);
  // Not paintable at the tick: nothing uploaded, and the next paint is whole.
  surface.accept(meta(4, [1, 1, 1, 1]), frame());
  paintable = false; win.tick(); assert.equal(canvas.puts.length, 2);
  paintable = true; surface.accept(meta(5, [1, 1, 1, 1]), frame()); win.tick();
  assert.deepEqual(canvas.puts.at(-1).rect, [0, 0, 4, 3]);
  // A new size is whole and reallocates the ImageData once.
  const image = canvas.puts.at(-1).image;
  surface.accept({ frame_id: 6, width: 2, height: 2, damage: [[0, 0, 1, 1]] }, new ArrayBuffer(16)); win.tick();
  assert.deepEqual(canvas.puts.at(-1).rect, [0, 0, 2, 2]); assert.notEqual(canvas.puts.at(-1).image, image);
  surface.accept({ frame_id: 7, width: 2, height: 2, damage: [[1, 1, 1, 1]] }, new ArrayBuffer(16)); win.tick();
  assert.equal(canvas.puts.at(-1).image, canvas.puts.at(-2).image, "no allocation per frame");
  surface.dispose(); surface.accept(meta(8), frame()); assert.equal(win.ticks.length, 0);
});

test("damage payloads rebuild the whole frame per target and reject a partial frame without one", () => {
  const assembler = new DamagePayloadAssembler(), target = { native_target_id: "t1" };
  const whole = Uint8Array.from({ length: 2 * 2 * 4 }, (_, i) => i).buffer;
  assert.equal(assembler.apply({ target, width: 2, height: 2, damage: [[0, 0, 2, 2]] }, whole), whole);
  const patched = assembler.apply({ target, width: 2, height: 2, damage: [[1, 1, 1, 1]] }, Uint8Array.of(90, 91, 92, 93).buffer);
  assert.deepEqual([...new Uint8Array(patched)], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 90, 91, 92, 93]);
  assert.throws(() => assembler.apply({ target, width: 3, height: 2, damage: [[0, 0, 1, 1]] }, new ArrayBuffer(4)), /INVALID_DAMAGE_PAYLOAD/);
  assert.throws(() => assembler.apply({ target, width: 2, height: 2, damage: [[0, 0, 1, 1]] }, new ArrayBuffer(8)), /INVALID_DAMAGE_PAYLOAD/);
  assert.throws(() => assembler.apply({ target: { native_target_id: "t2" }, width: 2, height: 2, damage: [[0, 0, 1, 1]] },
    new ArrayBuffer(4)), /INVALID_DAMAGE_PAYLOAD/);
  assert.equal(DamagePayloadAssembler.payloadBytes({ damage: [[0, 0, 3, 2]] }), 24);
  assembler.forget("t1"); assert.equal(assembler.size, 0);
});

test("videoframe upload: the damaged rows are wrapped as BGRX (a view, no copy) and drawn in place", async () => {
  const { frameUploadMode, drawBGRXRows } = await import("../chrome/EngineFrameSurface.sys.mjs");
  const frames = [], draws = [];
  class VideoFrame {
    constructor(data, init) { this.init = init; this.data = data; this.closed = false; frames.push(this); }
    close() { this.closed = true; }
  }
  const win = { ...fakeWindow(), VideoFrame };
  const canvas = { width: 0, height: 0, puts: [],
    getContext: () => ({ drawImage: (frame, x, y) => draws.push({ frame, x, y }), putImageData: () => canvas.puts.push(1) }) };
  assert.equal(frameUploadMode(win, { getStringPref: () => "videoframe" }), "imagedata", "no OffscreenCanvas: the probe fails");
  assert.equal(frameUploadMode(win, { getStringPref: () => "imagedata" }), "imagedata");
  assert.equal(frameUploadMode({}, null), "imagedata", "no WebCodecs: the JS path");
  const paints = [];
  const surface = new EngineFrameSurface(win, canvas, { onPaint: paint => paints.push(paint), upload: "videoframe" });
  const buffer = new ArrayBuffer(10 * 4 * 4);
  surface.accept({ frame_id: 1, width: 10, height: 4 }, buffer); win.tick();
  assert.deepEqual(frames[0].init, { format: "BGRX", codedWidth: 10, codedHeight: 4, timestamp: 1 });
  assert.deepEqual([frames[0].data.byteOffset, frames[0].data.byteLength], [0, 160]);
  assert.deepEqual([draws[0].x, draws[0].y], [0, 0]);
  surface.accept({ frame_id: 2, width: 10, height: 4, damage: [[3, 2, 4, 1]] }, buffer); win.tick();
  assert.deepEqual(frames[1].init, { format: "BGRX", codedWidth: 10, codedHeight: 1, timestamp: 2 });
  assert.equal(frames[1].data.buffer, buffer, "a view of the frame buffer, no copy in JS");
  assert.deepEqual([frames[1].data.byteOffset, frames[1].data.byteLength], [80, 40]);
  assert.deepEqual([draws[1].x, draws[1].y], [0, 2]);
  assert.ok(frames.every(frame => frame.closed), "every VideoFrame is closed after the draw");
  assert.equal(canvas.puts.length, 0); assert.equal(paints.at(-1).upload, "videoframe");
  assert.equal(paints.at(-1).uploadedPixels, 10, "whole rows of the damage");
  // drawBGRXRows closes the frame even when drawing throws.
  const failing = { drawImage: () => { throw new Error("NOT_SUPPORTED"); } };
  assert.throws(() => drawBGRXRows(VideoFrame, failing, buffer, 10, 0, 1), /NOT_SUPPORTED/);
  assert.equal(frames.at(-1).closed, true);
});

test("videoframe upload failure switches the surface to imagedata, whole", () => {
  class VideoFrame { constructor() { throw new TypeError("unsupported format"); } }
  const win = { ...fakeWindow(), VideoFrame }, canvas = fakeCanvas(), paints = [];
  const surface = new EngineFrameSurface(win, canvas, { onPaint: paint => paints.push(paint), upload: "videoframe" });
  surface.accept({ frame_id: 1, width: 4, height: 3 }, new Uint32Array(12).fill(0xffff0000).buffer); win.tick();
  assert.equal(surface.upload, "imagedata"); assert.match(surface.uploadError, /unsupported format/);
  assert.deepEqual(canvas.puts.at(-1).rect, [0, 0, 4, 3]);
  assert.deepEqual([...canvas.puts[0].image.data.subarray(0, 4)], [255, 0, 0, 255]);
  surface.accept({ frame_id: 2, width: 4, height: 3, damage: [[1, 1, 1, 1]] }, new Uint32Array(12).fill(0xffff0000).buffer); win.tick();
  assert.deepEqual(canvas.puts.at(-1).rect, [1, 1, 1, 1]); assert.equal(paints.at(-1).upload, "imagedata");
});

test("the VideoFrame probe accepts an engine that honours the view offset, refuses one that does not", async () => {
  const { videoFrameUploadWorks, videoFrameUploadProbe, resetVideoFrameProbe } = await import("../chrome/EngineFrameSurface.sys.mjs");
  // A model of drawImage(VideoFrame BGRX) over a Uint8Array view; `honourOffset` false models an
  // engine that reads from the start of the underlying buffer.
  const engine = honourOffset => {
    class VideoFrame {
      constructor(data, init) { this.data = honourOffset ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data.buffer); this.init = init; }
      close() {}
    }
    class OffscreenCanvas {
      constructor(width, height) { this.width = width; this.pixels = new Uint8ClampedArray(width * height * 4); }
      getContext() {
        const canvas = this;
        return {
          drawImage(frame, x, y) {
            const { codedWidth: w, codedHeight: h } = frame.init;
            for (let row = 0; row < h; row++) for (let col = 0; col < w; col++) {
              const from = (row * w + col) * 4, to = ((y + row) * canvas.width + x + col) * 4;
              const [b, g, r] = frame.data.subarray(from, from + 3);
              canvas.pixels.set([r, g, b, 255], to);
            }
          },
          getImageData(x, y, w, h) {
            const data = [];
            for (let row = 0; row < h; row++) data.push(...canvas.pixels.subarray(((y + row) * canvas.width + x) * 4, ((y + row) * canvas.width + x + w) * 4));
            return { data };
          },
        };
      }
    }
    return { VideoFrame, OffscreenCanvas };
  };
  resetVideoFrameProbe();
  assert.equal(videoFrameUploadWorks(engine(true)), true);
  assert.equal(videoFrameUploadWorks(engine(false)), true, "cached once per process");
  resetVideoFrameProbe();
  assert.equal(videoFrameUploadWorks(engine(false)), false);
  assert.equal(videoFrameUploadProbe().ok, false); assert.ok(videoFrameUploadProbe().got);
  resetVideoFrameProbe();
});

test("native receiver: sinks apply every frame per target, presenters bind once and present, fallbacks copy", async () => {
  const { NativeFrame, NativeFrameSinks, nativeFrameRing, presentNativeFrame, nativeFallbackFrame } =
    await import("../chrome/EngineFrameSurface.sys.mjs");
  const calls = [];
  const makeSink = id => ({ id, bound: null, closed: false, width: 4, height: 2,
    applyFrame: async (...args) => { calls.push([id, "apply", ...args]); if (args[0] === 9) throw new Error("rejected"); },
    bindCanvas(canvas) { if (canvas.refuse) throw new Error("NS_ERROR_DOM_INVALID_STATE_ERR"); this.bound = canvas; },
    present(frameId) { calls.push([id, "present", frameId]); },
    copyFrame: () => new ArrayBuffer(32), close() { this.closed = true; } });
  let next = 0;
  const ring = { createSink: () => makeSink(++next), closed: false, close() { this.closed = true; } };
  const sinks = new NativeFrameSinks(ring);
  const target = { native_target_id: "7" };
  const frame = await sinks.apply({ target, slot: 1, payload_bytes: 32, width: 4, height: 2, damage: [[0, 0, 4, 2]] });
  assert.ok(frame instanceof NativeFrame); assert.equal(frame.byteLength, 32);
  // Recognised across module instances (a spare host's frames reach another instance's presenter).
  const { isNativeFrame } = await import("../chrome/EngineFrameSurface.sys.mjs?other-instance");
  assert.equal(isNativeFrame(frame), true); assert.equal(isNativeFrame({ sink: {}, byteLength: 1 }), false);
  await sinks.apply({ target, slot: 0, payload_bytes: 4, width: 4, height: 2, damage: [[1, 1, 1, 1]] });
  assert.deepEqual(calls.map(c => c.slice(0, 2)), [[1, "apply"], [1, "apply"]], "one sink per target");
  assert.deepEqual(calls[1].slice(2), [0, 4, 4, 2, 1, 1, 1, 1]);
  await assert.rejects(sinks.apply({ target, slot: 9, payload_bytes: 4, width: 4, height: 2, damage: [[1, 1, 1, 1]] }), /INVALID_DAMAGE_PAYLOAD/);
  await assert.rejects(sinks.apply({ target: {}, slot: 0, payload_bytes: 4, width: 4, height: 2 }), /INVALID_DAMAGE_PAYLOAD/);
  // Presenter side.
  const win = { performance: { now: () => 0 } };
  const record = { canvas: { width: 300, height: 150 } };
  const paint = presentNativeFrame(win, record, { frame_id: 5, width: 4, height: 2, damage: [[1, 1, 1, 1]] }, frame, true);
  assert.equal(frame.sink.bound, record.canvas); assert.equal(record.nativeSink, frame.sink);
  assert.deepEqual([record.canvas.width, record.canvas.height], [4, 2]);
  assert.deepEqual(calls.at(-1), [1, "present", 5]);
  assert.equal(paint.upload, "native"); assert.equal(paint.uploadedPixels, 1); assert.equal(paint.framePixels, 8);
  assert.equal(presentNativeFrame(win, record, { frame_id: 6, width: 4, height: 2 }, frame, false), true, "bound, not painted");
  assert.notDeepEqual(calls.at(-1), [1, "present", 6]);
  // Shown again: the frame applied while hidden is posted once.
  const { representNativeFrame } = await import("../chrome/EngineFrameSurface.sys.mjs");
  assert.equal(representNativeFrame(record), true); assert.deepEqual(calls.at(-1), [1, "present", 6]);
  assert.equal(representNativeFrame(record), false, "nothing new");
  // A canvas that cannot be bound (or already drew in 2D): the caller falls back to a whole copy.
  const refused = { canvas: { refuse: true, width: 1, height: 1 } };
  assert.equal(presentNativeFrame(win, refused, { frame_id: 7, width: 4, height: 2 }, frame, true), false);
  assert.equal(refused.nativeSink, null);
  assert.equal(presentNativeFrame(win, { canvas: {}, frames: {} }, { frame_id: 7, width: 4, height: 2 }, frame, true), false);
  const copy = nativeFallbackFrame({ frame_id: 7, width: 4, height: 2, damage: [[1, 1, 1, 1]] }, frame);
  assert.equal(copy.pixels.byteLength, 32); assert.equal("damage" in copy.metadata, false, "the copy is whole");
  // A closed target's sink is closed; closing the sinks closes the ring.
  const sink = frame.sink;
  sinks.forget("7"); assert.equal(sink.closed, true); assert.equal(sinks.size, 0);
  sinks.close(); assert.equal(ring.closed, true);
  // Without the pref or the component: the JS path.
  assert.equal(nativeFrameRing(42, { fd: 9, slot_bytes: 64, slots: 2 }, { prefs: { getBoolPref: () => false } }), null);
  assert.equal(nativeFrameRing(42, { fd: 9, slot_bytes: 64, slots: 2 }, { prefs: { getBoolPref: () => true }, Cc: {}, Ci: {} }), null);
  const opened = [];
  const service = { openRing: (...args) => { opened.push(args); return ring; } };
  const Cc = { "@axiosozo.nl/frame-receiver;1": { getService: () => service } }, Ci = { nsIAxioFrameReceiverService: {} };
  assert.equal(nativeFrameRing(42, { fd: 9, slot_bytes: 64, slots: 2 }, { prefs: { getBoolPref: () => true }, Cc, Ci }), ring);
  assert.deepEqual(opened, [[42, 9, 64, 2]]);
});

test("direct compositing: the panel's rounded clip is lifted while the view fills it, corners are capped, restore undoes it", async () => {
  const { directComposite } = await import("../chrome/EngineFrameSurface.sys.mjs");
  const style = () => {
    const values = new Map();
    return { values, getPropertyValue: name => values.get(name)?.[0] ?? "", getPropertyPriority: name => values.get(name)?.[1] ?? "",
      setProperty(name, value, priority = "") { values.set(name, [value, priority]); }, removeProperty(name) { values.delete(name); },
      set cssText(text) { values.clear(); this.text = text; } };
  };
  const rect = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height });
  const removed = [];
  const element = () => ({ style: style(), attributes: {}, setAttribute(name, value) { this.attributes[name] = value; },
    children: [], appendChild(child) { this.children.push(child); }, get firstChild() { return this.children[0]; },
    remove() { removed.push(this); } });
  const root = { parentElement: null, bg: "rgba(0, 0, 0, 0)" };
  const app = { parentElement: root, bg: "rgba(10, 20, 30, 0.5)" };
  const body = { parentElement: app, bg: "rgb(0, 0, 0)" };
  app.parentElement = body; body.parentElement = root; // panel -> app (half) -> body (opaque)
  const panel = { ...element(), parentElement: app, rect: rect(100, 40, 800, 600) };
  panel.getBoundingClientRect = () => panel.rect;
  const overlay = { ...element(), children: [], appendChild(child) { this.children.push(child); }, rect: rect(100, 40, 800, 600) };
  overlay.getBoundingClientRect = () => overlay.rect;
  const background = { getBoundingClientRect: () => rect(0, 0, 1000, 700) };
  let observed = null;
  const win = {
    document: { createElementNS: () => element(), getElementById: id => (id === "zen-browser-background" ? background : null) },
    getComputedStyle: node => node === panel
      ? { overflowX: panel.style.getPropertyValue("overflow") || "clip", overflowY: panel.style.getPropertyValue("overflow") || "clip",
          borderTopLeftRadius: "5px", backgroundColor: "rgba(0, 0, 0, 0)", boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px 0px" }
      : { backgroundColor: node.bg ?? "rgba(0, 0, 0, 0)" },
    ResizeObserver: class { constructor(callback) { observed = callback; } observe() {} disconnect() { observed = null; } },
  };
  const record = { overlay, stack: { closest: selector => (selector === ".browserSidebarContainer" ? panel : null) } };
  assert.equal(directComposite(win, record, { prefs: { getBoolPref: () => false } }), null, "pref off");
  delete record.directComposite;
  const control = directComposite(win, record, { prefs: null });
  assert.equal(control.active, true);
  assert.equal(panel.style.getPropertyValue("overflow"), "visible", "clip lifted");
  assert.equal(overlay.children.length, 4, "four corner caps");
  const [topLeft, , , bottomRight] = overlay.children;
  assert.match(topLeft.style.text, /top:0;left:0;width:5px;height:5px/);
  assert.equal(topLeft.style.backgroundColor, "rgb(5, 10, 15)", "ancestors composited to an opaque color");
  assert.equal(topLeft.style.backgroundImage, "-moz-element(#zen-browser-background)");
  assert.equal(topLeft.style.backgroundPosition, "-100px -40px");
  assert.equal(bottomRight.style.backgroundPosition, "-895px -635px");
  assert.match(topLeft.style.mask, /circle 5px at 100% 100%/);
  assert.match(bottomRight.firstChild.style.text, /left:-795px;top:-595px;width:800px;height:600px;border-radius:5px/);
  assert.equal(bottomRight.firstChild.style.boxShadow, "rgba(0, 0, 0, 0.24) 0px 3px 8px 0px", "the panel's shadow over the backdrop");
  assert.equal(directComposite(win, record), control, "once per record");
  // A view that no longer covers the panel gives the clip back.
  overlay.rect = rect(100, 80, 800, 560); observed();
  assert.equal(control.active, false); assert.equal(panel.style.getPropertyValue("overflow"), "");
  overlay.rect = rect(100, 40, 800, 600); observed();
  assert.equal(control.active, true);
  control.restore();
  assert.equal(panel.style.getPropertyValue("overflow"), ""); assert.equal(removed.length, 4); assert.equal(observed, null);
  assert.equal(record.directComposite, undefined);
});

test("frame worker: slots are read into a persistent buffer, frames patched, presents drawn into the offscreen canvas", async () => {
  const { runFrameWorker, WorkerFrameSink, NativeFrameSinks, workerFrameRing } = await import("../chrome/EngineFrameSurface.sys.mjs");
  // The ring: slot 0 = a whole 2x2 frame (opaque red, BGRA 00 00 ff ff), slot 1 = one green pixel.
  const ring = new Uint8Array(2 * 64);
  new Uint32Array(ring.buffer, 0, 4).fill(0xffff0000);
  new Uint32Array(ring.buffer, 64, 1).fill(0xff00ff00);
  let failReads = false, opened = null;
  const io = { openFileForSyncReading: path => { opened = path; return {
    readBytesInto: (dest, offset) => { if (failReads) throw new Error("EACCES"); dest.set(ring.subarray(offset, offset + dest.length)); },
    close() {} }; } };
  const puts = [];
  const offscreen = { width: 0, height: 0, getContext: () => ({ putImageData: (image, x, y, dx, dy, dw, dh) =>
    puts.push({ data: [...image.data], rect: [dx, dy, dw, dh] }) }) };
  const main = { onmessage: null, onerror: null, postMessage: data => queueMicrotask(() => scope.onmessage({ data })) };
  const scope = { postMessage: data => queueMicrotask(() => main.onmessage({ data })), close() {},
    ImageData: class { constructor(data, width, height) { Object.assign(this, { data, width, height }); } } };
  runFrameWorker(scope, { IOUtils: io });
  const sink = new WorkerFrameSink(main, "/proc/42/fd/9", 64);
  const settle = () => new Promise(resolve => setTimeout(resolve, 0));
  await sink.applyFrame(0, 16, 2, 2, 0, 0, 2, 2);
  assert.equal(opened, "/proc/42/fd/9");
  sink.bindCanvas({ transferControlToOffscreen: () => offscreen });
  const drawn = [];
  sink.onDrawn = paint => drawn.push(paint);
  sink.present(1); await settle();
  assert.deepEqual([drawn[0].frameId, drawn[0].uploadedPixels, drawn[0].framePixels, drawn[0].upload], [1, 4, 4, "worker"]);
  assert.deepEqual([offscreen.width, offscreen.height], [2, 2]);
  assert.deepEqual(puts[0].rect, [0, 0, 2, 2]); assert.deepEqual(puts[0].data.slice(0, 4), [255, 0, 0, 255]);
  await sink.applyFrame(1, 4, 2, 2, 1, 1, 1, 1);
  sink.present(2); await settle();
  assert.deepEqual(puts[1].rect, [1, 1, 1, 1], "only the damage is drawn once the canvas is current");
  assert.deepEqual(puts[1].data.slice(12, 16), [0, 255, 0, 255]);
  const stats = JSON.parse(sink.statsJSON);
  assert.equal(stats.applied, 2); assert.equal(stats.presented, 2); assert.equal(stats.upload, "imagedata"); assert.equal(stats.bound, true);
  // A failing read rejects with MEMFD_READ_FAILED (the reader's in-band fallback), a pipe payload patches.
  failReads = true;
  await assert.rejects(sink.applyFrame(1, 4, 2, 2, 1, 1, 1, 1), /MEMFD_READ_FAILED/);
  await sink.applyBuffer(new Uint32Array([0xff0000ff]).buffer, 2, 2, 0, 0, 1, 1);
  sink.present(3); await settle();
  assert.deepEqual(puts.at(-1).rect, [0, 0, 1, 1]); assert.deepEqual(puts.at(-1).data.slice(0, 4), [0, 0, 255, 255]);
  await assert.rejects(sink.applyBuffer(new ArrayBuffer(8), 2, 2, 0, 0, 1, 1), /INVALID_DAMAGE_PAYLOAD/);
  // Through NativeFrameSinks: worker rings take buffers; MEMFD_READ_FAILED passes through.
  const sinks = new NativeFrameSinks({ kind: "worker", acceptsBuffers: true, createSink: () => sink, close() {} });
  assert.equal(sinks.acceptsBuffers, true);
  await assert.rejects(sinks.apply({ target: { native_target_id: "t" }, slot: 1, payload_bytes: 4, width: 2, height: 2, damage: [[1, 1, 1, 1]] }), /MEMFD_READ_FAILED/);
  failReads = false;
  const frame = await sinks.applyBuffer({ target: { native_target_id: "t" }, width: 2, height: 2, damage: [[0, 0, 2, 2]] }, new ArrayBuffer(16));
  assert.equal(frame.sink, sink); assert.equal(frame.byteLength, 16);
  sinks.close();
  await assert.rejects(sink.applyFrame(0, 16, 2, 2, 0, 0, 2, 2), /ENGINE_FRAME_WORKER_FAILED/, "closed");
  // The ring needs the pref and a usable worker (probed once at launch).
  assert.equal(workerFrameRing(42, { fd: 9, slot_bytes: 64, slots: 2 }, { prefs: { getBoolPref: () => false }, Worker: class {} }), null);
  assert.equal(workerFrameRing(42, { fd: 9, slot_bytes: 64, slots: 2 }, { prefs: { getBoolPref: () => true }, Worker: class {} }), null, "not probed");
});

test("frame workers are probed once (ChromeWorker, sync reads, OffscreenCanvas) before a ring is offered", async () => {
  const { frameWorkersUsable, frameWorkerProbeResult, workerFrameRing, runFrameWorker, FRAME_WORKER_URL } = await import("../chrome/EngineFrameSurface.sys.mjs");
  const urls = [];
  class FakeWorker {
    constructor(url) {
      urls.push(url);
      const scope = { postMessage: data => queueMicrotask(() => this.onmessage?.({ data })), close() {}, OffscreenCanvas: class {},
        IOUtils: { openFileForSyncReading: () => ({ readBytesInto() {}, close() {} }) } };
      this.postMessage = data => queueMicrotask(() => scope.onmessage({ data }));
      runFrameWorker(scope);
    }
  }
  assert.equal(await frameWorkersUsable(FakeWorker), true);
  assert.deepEqual(urls, [FRAME_WORKER_URL]);
  assert.equal(frameWorkerProbeResult().ok, true);
  assert.equal(await frameWorkersUsable(FakeWorker), true, "cached");
  assert.equal(urls.length, 1);
  const ring = workerFrameRing(42, { fd: 9, slot_bytes: 64, slots: 2 }, { prefs: { getBoolPref: () => true }, Worker: FakeWorker });
  assert.equal(ring.kind, "worker"); assert.equal(ring.acceptsBuffers, true);
  const sink = ring.createSink();
  assert.equal(sink.kind, "worker"); sink.close();
});

test("a source that is not a whole BGRA frame is refused, never painted black", async () => {
  const { NativeFrame } = await import("../chrome/EngineFrameSurface.sys.mjs");
  const win = fakeWindow(), canvas = fakeCanvas();
  const surface = new EngineFrameSurface(win, canvas, { upload: "imagedata" });
  const meta = { frame_id: 1, width: 4, height: 3 };
  for (const source of [new NativeFrame({}, 48), { byteLength: 48 }, new Uint8Array(48), new ArrayBuffer(47)]) {
    assert.throws(() => surface.accept(meta, source), /INVALID_FRAME_PIXELS/);
  }
  assert.equal(win.ticks.length, 0, "nothing was scheduled");
  surface.accept(meta, new ArrayBuffer(48));
  assert.equal(win.ticks.length, 1);
});
