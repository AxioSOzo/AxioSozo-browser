/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// The Zen-side WebKit client (EngineStreamClient + WebKit profile) against the REAL
// AxioWebKitHost (native/webkit-host, WPE WebKit). Runs only when
// AXIOSOZO_WEBKIT_LIVE_HOST names the built host (CI: debian:13 container,
// .github/workflows/linux-webkit-zen.yml job `adapter`); skipped otherwise.
// Component evidence for the Zen adapter on the real wire; not Zen E1/E2.
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, chmodSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { deflateSync, crc32 } from "node:zlib";
import "./support/chrome-modules.mjs";

const { EngineStreamHost, EngineStreamTarget } = await import("../chrome/EngineStreamClient.sys.mjs");
const { webkitProfile, webkitHostEnvironment, WebKitEngineAdapter } = await import("../chrome/WebKitEngineAdapter.sys.mjs");
const { XKB_KEYS } = await import("../chrome/WebKitPresenter.sys.mjs");

const HOST = process.env.AXIOSOZO_WEBKIT_LIVE_HOST;
const EVIDENCE = process.env.AXIOSOZO_WEBKIT_LIVE_EVIDENCE;
const FIXTURE = readFileSync(new URL("../../../tests/fixtures/engine.html", import.meta.url));

/** Subprocess.sys.mjs-shaped wrapper of a Node child: exact reads, promise writes, wait(). */
function wrap(child) {
  let buffer = Buffer.alloc(0), ended = false;
  const waiting = [];
  const flush = () => {
    while (waiting.length) {
      const next = waiting[0];
      if (buffer.length >= next.n) { waiting.shift(); const out = buffer.subarray(0, next.n); buffer = buffer.subarray(next.n);
        next.resolve(out.buffer.slice(out.byteOffset, out.byteOffset + out.length)); continue; }
      if (ended) { waiting.shift(); next.resolve(new ArrayBuffer(0)); continue; }
      return;
    }
  };
  child.stdout.on("data", chunk => { buffer = Buffer.concat([buffer, chunk]); flush(); });
  child.stdout.on("end", () => { ended = true; flush(); });
  child.stdin.on("error", () => {}); // EPIPE once the host is gone is expected, not a crash
  const stderr = [];
  child.stderr.on("data", chunk => stderr.push(chunk));
  const exit = new Promise(resolve => child.on("exit", (code, signal) => resolve({ exitCode: code ?? (signal ? -1 : 0) })));
  return { pid: child.pid, stderrText: () => Buffer.concat(stderr).toString(),
    stdout: { read: n => new Promise(resolve => { waiting.push({ n, resolve }); flush(); }) },
    stderr: null, wait: () => exit,
    stdin: { write: text => new Promise((resolve, reject) => child.stdin.write(text, error => (error ? reject(error) : resolve()))),
      // Resolves however the pipe ends: after the host exited, `end` sees EPIPE and never finishes.
      close: () => new Promise(resolve => {
        if (child.stdin.destroyed || child.stdin.writableFinished) { resolve(); return; }
        child.stdin.once("close", resolve); child.stdin.once("error", resolve); child.stdin.end();
      }) },
    kill: async () => { child.kill("SIGKILL"); } };
}

function png(path, width, height, bgra) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const from = (y * width + x) * 4, to = y * (width * 3 + 1) + 1 + x * 3;
    raw[to] = bgra[from + 2]; raw[to + 1] = bgra[from + 1]; raw[to + 2] = bgra[from];
  }
  const chunk = (kind, body) => { const head = Buffer.alloc(8); head.writeUInt32BE(body.length); head.write(kind, 4);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(kind), body])) >>> 0); return Buffer.concat([head, body, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
  writeFileSync(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
}

test("Zen's WebKit client drives the real WPE host: ready, frames with damage, input, navigation, back, resize, close",
  { skip: !HOST ? "AXIOSOZO_WEBKIT_LIVE_HOST not set (real host runs in the debian:13 CI job)" : false, timeout: 120000 }, async () => {
  assert.ok(existsSync(HOST), HOST);
  const requests = [];
  const server = createServer((request, response) => {
    requests.push(`${request.method} ${request.url}`);
    const ok = request.method === "GET" && ["/engine.html", "/engine.html?page=2"].includes(request.url);
    response.writeHead(ok ? 200 : (request.url === "/favicon.ico" ? 204 : 404), { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    response.end(ok ? FIXTURE : "");
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const profile = mkdtempSync(join(process.env.AXIOSOZO_BUILD_ROOT ?? tmpdir(), "webkit-live-"));
  chmodSync(profile, 0o700); mkdirSync(join(profile, "tmp"), { mode: 0o700 });
const log = { requests, frames: [], events: [], steps: {}, at: "start" };
  const child = spawn(HOST, ["--stream", profile, profile], { env: { ...webkitHostEnvironment(profile), AXIOSOZO_WEBKIT_TRACE: "1" }, stdio: ["pipe", "pipe", "pipe"] });
  // Navigations have no deadline by contract; this test does. Never leave the host running.
  const step = label => { log.at = label; };
  const watchdog = setTimeout(() => { log.watchdog = log.at; child.kill("SIGKILL"); server.close(); }, 100000);
  const process_ = wrap(child);
    const instance = "webkit-live-" + randomBytes(6).toString("hex");
  const token = randomBytes(32).toString("hex");
  const host = new EngineStreamHost(process_, { profile: webkitProfile(), token, instance, identity: origin,
    timers: { setTimeout, clearTimeout }, frameDamage: true, requestPrefix: "wk" });
  let last = null;
  const waiters = [];
  const until = (predicate, label, ms = 20000) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout: " + label)), ms);
    waiters.push({ predicate, resolve: value => { clearTimeout(timer); resolve(value); } });
  });
  const notify = item => { for (const waiter of [...waiters]) if (waiter.predicate(item)) { waiters.splice(waiters.indexOf(waiter), 1); waiter.resolve(item); } };
  try {
    step('await host.connect();'); await host.connect();
    log.ready = host.ready;
    assert.equal(host.ready.webkit, "2.48.3"); assert.equal(host.capabilities.frame_damage, true);
    const adapter = new WebKitEngineAdapter(host, {
      pendingTarget: { tab_id: "live-tab", engine_instance: instance, identity: origin, document_generation: 1, navigation_generation: 1, private_mode: false },
      onFrame: (metadata, pixels) => { last = { metadata, pixels: new Uint8Array(pixels.slice(0)) };
        log.frames.push({ id: metadata.frame_id, w: metadata.width, h: metadata.height, gen: metadata.target.document_generation, damage: metadata.damage ?? null });
        notify({ kind: "frame", metadata }); },
      onEvent: event => { log.events.push(event.event === "title" ? { event: "title", title: event.title } : { event: event.event,
        ...(event.event === "load" ? { http_status: event.http_status, restored: event.restored_from_history } : {}) }); notify({ kind: "event", event }); },
    });
    assert.ok(adapter instanceof EngineStreamTarget);
    step('const target = await adapter.create('); const target = await adapter.create(origin + "/engine.html", { width: 900, height: 650, device_scale: 2 });
    assert.equal(target.engine, "webkit");
    assert.equal(log.frames[0].w, 1800); assert.equal(log.frames[0].damage, null, "first presented frame is whole");
    const initial = last.pixels;
    if (EVIDENCE) png(join(EVIDENCE, "live-initial.png"), 1800, 1300, last.pixels);
    const title = text => until(item => item.kind === "event" && item.event.event === "title" && item.event.title.includes(text), "title " + text);
    step('await adapter.focus(adapter.target, true'); await adapter.focus(adapter.target, true);
    // XKB hardware code + text, down/char/up (§8.1 rows 6, 7): inserted once.
    const typed = title("input=w |");
    for (const type of ["down", "char", "up"]) await adapter.input(adapter.target, "key", { type, native_key_code: XKB_KEYS.KeyW, windows_key_code: 87, modifiers: 0, text: "w" });
    step('await typed;'); await typed;
    const committed = title("input=wk |");
    await adapter.input(adapter.target, "ime_commit_text", { text: "k" });
    step('await committed;'); await committed;
    // The typed text must be visible in the field's pixels (right of the caret, inside the
    // focus ring, as native/webkit-host/stream_test.py INPUT_TEXT_2X), not merely in the title.
    step("typed pixels");
    const region = pixels => { const rows = []; for (let y = 325; y < 400; y++) rows.push(Buffer.from(pixels.subarray((y * 1800 + 240) * 4, (y * 1800 + 770) * 4)).toString("base64")); return rows.join(""); };
    const blank = region(initial);
    const textFrame = last && region(last.pixels) !== blank ? last
      : await until(item => item.kind === "frame" && region(last.pixels) !== blank, "typed text in the field's pixels").then(() => last);
    const smallest = log.frames.filter(frame => frame.damage).map(frame => frame.damage[0][2] * frame.damage[0][3]).sort((a, b) => a - b)[0];
    log.steps.smallest_damage_fraction = smallest / (1800 * 1300);
    log.steps.typed_frame_id = textFrame.metadata.frame_id;
    assert.ok(log.steps.smallest_damage_fraction < 0.5, "typing and the caret repaint small rectangles");
    if (EVIDENCE) png(join(EVIDENCE, "live-typed.png"), 1800, 1300, last.pixels);
    // Wheel (CSS px, engine-stream sign): the page scrolls and repaints.
    const beforeScroll = last.pixels;
    const changed = pixels => { let count = 0; for (let i = 0; i < pixels.length; i += 16) if (pixels[i] !== beforeScroll[i] || pixels[i + 1] !== beforeScroll[i + 1]) count++; return count / (pixels.length / 16); };
    const scrolled = until(item => item.kind === "frame" && changed(last.pixels) > 0.05, "scrolled pixels after wheel");
    await adapter.input(adapter.target, "wheel", { x: 400, y: 300, modifiers: 0, delta_x: 0, delta_y: -400 });
    step('await scrolled;'); await scrolled;
    log.steps.scroll_changed_fraction = changed(last.pixels);
    if (EVIDENCE) png(join(EVIDENCE, "live-scrolled.png"), 1800, 1300, last.pixels);
    // GET navigation advances both generations by exactly one.
    const before = adapter.target;
    const page2 = title("page=2");
    const page2Frame = until(item => item.kind === "frame" && item.metadata.target.document_generation === before.document_generation + 1, "page-2 frame");
    assert.equal((await adapter.navigate(before, origin + "/engine.html?page=2")).status, "success");
    step('await page2;'); await page2;
    assert.equal(adapter.target.document_generation, before.document_generation + 1);
    assert.equal(adapter.target.navigation_generation, before.navigation_generation + 1);
    // A command for the old target is refused by the host itself (§3), nothing dispatched.
    await assert.rejects(host.request("focus", { focused: true }, before, { owner: null }), /STALE_ENGINE_TARGET/u);
    step('await page2Frame;'); await page2Frame;
    if (EVIDENCE) png(join(EVIDENCE, "live-page2.png"), 1800, 1300, last.pixels);
    // Back: WebKit's back/forward cache restore (HTTP 200 or 0 with restored_from_history).
    const restored = until(item => item.kind === "event" && item.event.event === "load", "load after back");
    assert.equal((await adapter.back(adapter.target)).status, "success");
    step('const load = (await restored).event;'); const load = (await restored).event;
    log.steps.back_load = { http_status: load.http_status, restored: load.restored_from_history };
    assert.equal(load.restored_from_history, true);
    assert.equal(adapter.target.document_generation, before.document_generation + 2);
    assert.deepEqual(await adapter.back(adapter.target), { status: "unsupported", reason: "history_boundary", target: adapter.target });
    // Resize to 1x: frames at exact physical size.
    const oneX = until(item => item.kind === "frame" && item.metadata.width === 800 && item.metadata.height === 600, "1x frame");
    assert.equal((await adapter.resize(adapter.target, { width: 800, height: 600, device_scale: 1 })).status, "success");
    step('await oneX;'); await oneX;
    if (EVIDENCE) png(join(EVIDENCE, "live-1x.png"), 800, 600, last.pixels);
    assert.equal(log.requests.filter(line => line === "GET /engine.html").length, 1, "back restored without a fetch");
    step('await adapter.close();'); await adapter.close();
    assert.equal(host.status, "closed");
    assert.equal((await process_.wait()).exitCode, 0);
    log.status = "PASS";
  } catch (error) {
    log.status = "FAIL"; log.error = String(error?.stack ?? error); log.stderr = process_.stderrText().slice(-4000);
    throw error;
  } finally {
    if (EVIDENCE) writeFileSync(join(EVIDENCE, "live-result.json"), JSON.stringify({ ...log, stderr_tail: process_.stderrText().slice(-20000) }, null, 2));
    clearTimeout(watchdog); child.kill("SIGKILL"); server.close();
    rmSync(profile, { recursive: true, force: true });
  }
});
