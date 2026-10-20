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
