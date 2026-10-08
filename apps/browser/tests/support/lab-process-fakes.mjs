/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Synthetic stand-ins for the Lab platform tests (chrome/lab/process.sys.mjs
// runtime): Gecko's Subprocess.call shape with scripted processes, an
// in-memory file system and manual timers. No real process, file or clock is
// touched. Test-only; not evidence of Gecko or client behaviour (the recorded
// client output under fixtures/lab/ is real).
import { readFileSync } from "node:fs";

const encoder = new TextEncoder();

/** A Gecko InputPipe: read() → ArrayBuffer, empty at the end. */
export function fakePipe() {
  const chunks = [];
  let ended = false;
  let waiting = null;
  const wake = () => { if (waiting) { const resolve = waiting; waiting = null; resolve(); } };
  return {
    push(data) {
      if (ended) return;
      const bytes = typeof data === "string" ? encoder.encode(data) : data;
      chunks.push(bytes);
      wake();
    },
    end() { ended = true; wake(); },
    get ended() { return ended; },
    async read() {
      while (!chunks.length && !ended) await new Promise(resolve => { waiting = resolve; });
      if (chunks.length) { const bytes = chunks.shift(); return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); }
      return new ArrayBuffer(0);
    },
  };
}

/**
 * One scripted process. The test (or a scenario) drives it:
 *   line(text) one stdout line; out(text) raw stdout; err(text) stderr;
 *   exit(code) ends both pipes and resolves wait().
 * It records stdin writes and closes, and kill() calls; by default a kill
 * ends it with -15 (SIGTERM) unless `onKill` says otherwise.
 */
export function fakeProcess({ pid = 1000, options = null } = {}) {
  const stdout = fakePipe();
  const stderr = fakePipe();
  let resolveExit;
  const exited = new Promise(resolve => { resolveExit = resolve; });
  const record = {
    pid, options, writes: [], stdinClosed: false, kills: [], exitCode: null, onStdinClose: null, onKill: null, onWrite: null,
    stdout, stderr,
    stdin: {
      async write(data) {
        if (record.stdinClosed) throw new Error("closed");
        record.writes.push(String(data));
        record.onWrite?.(String(data));
        return String(data).length;
      },
      async close() {
        if (record.stdinClosed) return;
        record.stdinClosed = true;
        record.onStdinClose?.();
      },
    },
    line(text) { stdout.push(`${typeof text === "string" ? text : JSON.stringify(text)}\n`); },
    out(text) { stdout.push(text); },
    err(text) { stderr.push(text); },
    exit(code = 0) {
      if (record.exitCode !== null) return;
      record.exitCode = code;
      stdout.end();
      stderr.end();
      resolveExit({ exitCode: code });
    },
    wait: () => exited,
    kill(timeout) {
      record.kills.push(timeout);
      if (record.onKill) record.onKill(timeout);
      else Promise.resolve().then(() => record.exit(-15));
      return exited;
    },
    /** JSON lines of the user messages written to stdin (stream-json). */
    stdinMessages() { return record.writes.join("").split("\n").filter(Boolean).map(line => JSON.parse(line)); },
  };
  return record;
}

/** The parts of the Lab supervisor's argv: { mode, firstSignal, command, args } or null. */
export function supervised(options) {
  const args = options?.arguments ?? [];
  if (options?.command !== "/bin/sh" || args[0] !== "-c" || args[2] !== "axiosozo-lab") return null;
  return { mode: args[3], firstSignal: args[4], command: args[5], args: args.slice(6) };
}

/**
 * A Subprocess.call stand-in. handler(options, process) scripts each process
 * (it may be async and keep driving it); without one, a process exits 0 at
 * once. `calls` lists every spawn's options; `processes` every process.
 */
export function fakeSpawner(handler = null) {
  const calls = [];
  const processes = [];
  let pid = 4000;
  const spawn = async options => {
    calls.push(options);
    if (options.failSpawn) throw new Error("spawn failed");
    const process = fakeProcess({ pid: ++pid, options });
    processes.push(process);
    const run = handler ? handler(options, process) : process.exit(0);
    if (run && typeof run.then === "function") run.catch(error => { process.err(String(error)); process.exit(1); });
    return process;
  };
  return { spawn, calls, processes };
}

/** Replays recorded stream lines (fixtures/lab/<name>) on a fake process. */
export function fixtureLines(name) {
  return readFileSync(new URL(`../fixtures/lab/${name}`, import.meta.url), "utf8").split("\n").filter(Boolean);
}
export function fixtureJson(name) {
  return JSON.parse(readFileSync(new URL(`../fixtures/lab/${name}`, import.meta.url), "utf8"));
}

/**
 * An in-memory file system with the Lab's fs interface. `files`: path →
 * { mode, data (Uint8Array) | dir: true, exec, real (symlink target), mtime, size }.
 */
export function memoryFs(initial = {}) {
  const files = new Map(Object.entries(initial));
  const resolve = path => {
    let current = path;
    for (let hop = 0; hop < 8; hop++) {
      const entry = files.get(current);
      if (!entry?.real) return current;
      current = entry.real;
    }
    return current;
  };
  const fs = {
    files,
    async isExecutableFile(path) { const entry = files.get(resolve(path)); return !!entry && !entry.dir && entry.exec === true; },
    async realpath(path) { if (!files.has(path)) throw new Error("ENOENT"); return resolve(path); },
    async stat(path) { const entry = files.get(resolve(path)); if (!entry) throw new Error("ENOENT"); return { mtime: entry.mtime ?? 1, size: entry.size ?? 1, type: entry.dir ? "directory" : "regular" }; },
    async readHead(path, bytes) { const entry = files.get(resolve(path)); if (!entry?.data) return new Uint8Array(0); return entry.data.slice(0, bytes); },
    async makeDirectory(path, mode) {
      const parent = path.split("/").slice(0, -1).join("/") || "/";
      if (parent !== "/" && !files.get(parent)?.dir && ![...files.keys()].some(key => key.startsWith(`${parent}/`))) {
        // Parents are created by the caller in order; an unknown parent is fine for "/"-rooted test paths.
      }
      files.set(path, { dir: true, mode });
    },
    async writeFile(path, bytes, mode) {
      if (files.has(path)) throw new Error("EEXIST");
      files.set(path, { data: new Uint8Array(bytes), mode });
    },
    async remove(path) { for (const key of [...files.keys()]) if (key === path || key.startsWith(`${path}/`)) files.delete(key); },
  };
  return fs;
}

/** An executable binary entry ("Mach-O"), or a script with a shebang. */
export const binary = ({ mtime = 1, size = 100 } = {}) => ({ exec: true, data: new Uint8Array([0xcf, 0xfa, 0xed, 0xfe]), mtime, size });
export const script = (shebang, { mtime = 1, size = 100 } = {}) => ({ exec: true, data: encoder.encode(`${shebang}\n// script\n`), mtime, size });
export const link = target => ({ real: target });

/** Manual timers: nothing fires until advance(ms). */
export function fakeTimers() {
  let now = 0, serial = 0;
  const pending = new Map();
  return {
    setTimeout(fn, ms = 0) { const id = ++serial; pending.set(id, { at: now + ms, fn }); return id; },
    clearTimeout(id) { pending.delete(id); },
    get now() { return now; },
    get pending() { return pending.size; },
    async advance(ms) {
      const until = now + ms;
      for (;;) {
        const next = [...pending.entries()].filter(([, item]) => item.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        pending.delete(next[0]);
        now = next[1].at;
        next[1].fn();
        await settle();
      }
      now = until;
      await settle();
    },
  };
}

/** Lets pending promise callbacks run. */
export async function settle(rounds = 20) { for (let i = 0; i < rounds; i++) await Promise.resolve(); await new Promise(resolve => setImmediate(resolve)); }
