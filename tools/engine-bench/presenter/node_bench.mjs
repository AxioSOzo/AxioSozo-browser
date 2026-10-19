// Presenter pixel-path micro-benchmark in Node (V8). Imports the REAL bgraToRGBA from
// apps/browser/chrome/CEFPresenter.sys.mjs (the AXCF pipe fallback Zen uses on Linux) and
// compares it with candidate replacements on synthetic frames of the bench sizes.
// V8 is not SpiderMonkey: the in-Gecko numbers come from presenter/page.html (run_browser.py);
// this run is a portable cross-check. usage: node node_bench.mjs [out.json]
// BASELINE_PRESENTER=<older apps/browser/chrome/CEFPresenter.sys.mjs> adds a same-process A/B
// (baseline_bgraToRGBA_ms, baseline_identical_output): the regression gate for pixel-path changes.
import { bgraToRGBA } from '../../../apps/browser/chrome/CEFPresenter.sys.mjs';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import os from 'node:os';

const baselinePath = process.env.BASELINE_PRESENTER ? resolve(process.env.BASELINE_PRESENTER) : null;
const baselineBgraToRGBA = baselinePath ? (await import(pathToFileURL(baselinePath).href)).bgraToRGBA : null;
if (baselinePath && typeof baselineBgraToRGBA !== 'function') throw new Error('no bgraToRGBA export in ' + baselinePath);

const SIZES = [[900, 650], [1800, 1300]];
const ITER = Number(process.env.BENCH_ITER || 30);

function frame(width, height, translucentShare = 0) {
  // Page-like content: opaque except an optional translucent share (premultiplied).
  const buffer = new ArrayBuffer(width * height * 4);
  const px = new Uint8Array(buffer);
  for (let i = 0, p = 0; i < px.length; i += 4, p++) {
    const x = p % width, y = (p / width) | 0;
    const a = translucentShare && (p % 100) < translucentShare * 100 ? 128 : 255;
    px[i] = (x * 3) & 255 & a; px[i + 1] = (y * 5) & 255 & a; px[i + 2] = (x ^ y) & 255 & a; px[i + 3] = a;
  }
  return buffer;
}

// Candidate: opaque fast path with one 32-bit swizzle per pixel; unpremultiply only when 0 < alpha < 255.
function bgraToRGBAFast(buffer) {
  const u32 = new Uint32Array(buffer), u8 = new Uint8ClampedArray(buffer);
  for (let p = 0; p < u32.length; p++) {
    const v = u32[p], a = v >>> 24;
    if (a === 255) { u32[p] = (v & 0xff00ff00) | ((v & 0xff) << 16) | ((v >>> 16) & 0xff); continue; }
    const i = p * 4, b = u8[i], g = u8[i + 1], r = u8[i + 2], s = a ? 255 / a : 1;
    u8[i] = r * s; u8[i + 1] = g * s; u8[i + 2] = b * s;
  }
  return u8;
}

function time(fn, make) {
  const samples = [];
  for (let k = 0; k < ITER + 3; k++) {
    const input = make();
    const t = performance.now();
    fn(input);
    const dt = performance.now() - t;
    if (k >= 3) samples.push(dt);  // drop JIT warm-up
  }
  samples.sort((a, b) => a - b);
  const q = p => samples[Math.max(0, Math.ceil(p / 100 * samples.length) - 1)];
  return { n: samples.length, median: +q(50).toFixed(3), p95: +q(95).toFixed(3), min: +samples[0].toFixed(3) };
}

const results = [];
for (const [w, h] of SIZES) {
  for (const translucent of [0, 0.1]) {
    const base = frame(w, h, translucent);
    const make = () => base.slice(0);
    // Correctness: the fast path produces exactly the presenter's bytes.
    const same = Buffer.compare(Buffer.from(bgraToRGBA(make()).buffer), Buffer.from(bgraToRGBAFast(make()).buffer)) === 0;
    results.push({ width: w, height: h, translucent_share: translucent, bytes: w * h * 4,
      copy_ms: time(b => new Uint8Array(b.byteLength).set(new Uint8Array(b)), make),
      presenter_bgraToRGBA_ms: time(bgraToRGBA, make),
      candidate_u32_opaque_fast_path_ms: time(bgraToRGBAFast, make),
      candidate_identical_output: same,
      ...(baselineBgraToRGBA ? { baseline_bgraToRGBA_ms: time(baselineBgraToRGBA, make),
        baseline_identical_output: Buffer.compare(Buffer.from(bgraToRGBA(make()).buffer),
          Buffer.from(baselineBgraToRGBA(make()).buffer)) === 0 } : {}) });
  }
}
const out = { schema: 'axiosozo-presenter-node-v1', engine: 'v8 ' + process.version, cpu: os.cpus()[0]?.model,
  nproc: os.cpus().length, iterations: ITER, source: 'apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)', baseline_presenter: baselinePath, results };
const text = JSON.stringify(out, null, 1);
if (process.argv[2]) writeFileSync(process.argv[2], text + '\n');
console.log(text);
