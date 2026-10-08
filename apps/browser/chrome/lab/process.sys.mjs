/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The Lab's process plumbing for running the user's own AI clients (Claude
// Code, Codex, Antigravity) directly: DOM-free and Gecko-free, so Node tests
// drive it with a fake Subprocess. platform.sys.mjs gives it the real one.
//
//  - Every client run is a small fixed /bin/sh supervisor (SUPERVISOR) that
//    starts the client in its own process group, the same pattern as the
//    project runner (ProjectRunner.SUPERVISOR). Gecko's Subprocess can only
//    signal one pid; the supervisor turns one SIGTERM into "stop the whole
//    group": the client's own interrupt signal first (SIGINT for Codex and
//    Antigravity), SIGTERM after one second, SIGKILL two seconds later.
//    Measured with Codex 0.162 `exec`: SIGINT ends a read-only one-shot in
//    ~200 ms, but a workspace-write task ignored three SIGINTs over two
//    seconds and ended 6 ms after SIGTERM, so the interrupt alone is never
//    relied on. Nothing a run started outlives it: the group is also cleared
//    when the client exits.
//  - "pipe" mode (Claude Code): the client reads the supervisor's stdin, our
//    stream-json channel. If the browser goes away, that pipe closes and
//    Claude ends after its current turn (its budget cap bounds it).
//    "lease" mode (Codex, Antigravity): the client's stdin is /dev/null and
//    the supervisor's stdin is a lease; when it closes (a stop, or the browser
//    quitting or crashing) the group is stopped.
//  - Output is read as bounded UTF-8 lines; an over-long line is skipped, too
//    much output ends the run. stderr is kept only as a short tail for a calm
//    failure reason; it is never shown raw.
//  - Temporary files (an image for Codex or Antigravity, a schema file for
//    Codex) live only in a 0700 per-run folder under the profile, 0600 each,
//    removed when the run ends and, after a crash, on the next start.
import { runEnvironment } from "../ProjectRunner.sys.mjs";
import { createSubprocessUtf8Reader } from "../SubprocessUtf8.sys.mjs";

export const SUPERVISOR_NAME = "axiosozo-lab";
export const SUPERVISOR = [
  "exec 3>&2 2>/dev/null",
  "set -m",
  "mode=$1; first=$2; shift 2",
  "if [ \"$mode\" = lease ]; then \"$@\" </dev/null 2>&3 3>&- & else \"$@\" 2>&3 3>&- & fi",
  "child=$!",
  "exec 3>&-",
  "watcher=",
  "if [ \"$mode\" = lease ]; then ( while read -r _; do :; done; kill -TERM $$ ) & watcher=$!; fi",
  "reap() { i=0; while kill -0 -\"$child\" && [ \"$i\" -lt \"$1\" ]; do sleep 0.1; i=$((i+1)); done; }",
  "stop() { kill -\"$first\" -\"$child\"; reap 10; kill -TERM -\"$child\"; reap 20; kill -KILL -\"$child\"; }",
  "trap 'stop; [ -n \"$watcher\" ] && kill -KILL -\"$watcher\"; exit 143' TERM INT HUP",
  "wait \"$child\"",
  "code=$?",
  "[ -n \"$watcher\" ] && kill -KILL -\"$watcher\"",
  "kill -TERM -\"$child\"",
  "exit \"$code\"",
].join("\n");
export const SUPERVISOR_MODES = Object.freeze(["pipe", "lease"]);
export const FIRST_SIGNALS = Object.freeze(["INT", "TERM"]);

/** One output line at most this long (characters); longer ones are skipped. */
export const MAX_LINE_CHARS = 4 * 1024 * 1024;
/** All output of one run at most this many bytes; more ends the run. */
export const MAX_OUTPUT_BYTES = 64 * 1024 * 1024;
/** The stderr tail kept for a failure reason. */
export const STDERR_TAIL_CHARS = 4096;
/** A stop: how long the client gets for its own interrupt before the supervisor is signalled. */
export const STOP_GRACE_MS = 3000;
/** The supervisor escalates INT → TERM → KILL within 3 s; Subprocess kills it after this. */
export const SUPERVISOR_KILL_MS = 8000;

export class LabProcessError extends Error {
  constructor(code, message = code) { super(message); this.name = "LabProcessError"; this.code = code; }
}

const CONTROL = /[\u0000-\u001f\u007f]/u;
/** An absolute, normalized path (no "." or ".." parts, no control characters). */
export function isAbsolutePath(value) {
  return typeof value === "string" && value.startsWith("/") && value.length <= 4096 && !CONTROL.test(value)
    && !value.split("/").slice(1).some(part => part === "." || part === "..");
}
/** A folder path without its trailing slashes ("/" stays "/"). */
export const trimSlashes = path => (path.length > 1 ? path.replace(/\/+$/u, "") || "/" : path);
export const basename = path => trimSlashes(String(path)).split("/").pop() || String(path);
export const dirname = path => { const parts = trimSlashes(String(path)).split("/"); parts.pop(); return parts.join("/") || "/"; };

/** The environment clients run in: a terminal's (ProjectRunner.runEnvironment). */
export function labEnvironment({ get = () => null, home = null } = {}) {
  return runEnvironment({ get, home });
}

// ---- finding executables ----------------------------------------------------------------

/**
 * The first `name` on `path` (a PATH string) that is an executable file, as
 * that PATH entry (symlinks unresolved), or null. `fs.isExecutableFile(path)`
 * answers true only for an existing executable regular file (links followed).
 */
export async function findOnPath(name, path, fs) {
  if (typeof name !== "string" || !/^[A-Za-z0-9._-]{1,64}$/u.test(name) || typeof path !== "string") return null;
  for (const dir of path.split(":")) {
    if (!isAbsolutePath(dir)) continue;
    const candidate = `${trimSlashes(dir)}/${name}`;
    try { if (await fs.isExecutableFile(candidate)) return candidate; } catch { /* Not there. */ }
  }
  return null;
}

/**
 * How to start the file at `realpath`: itself, or, for a "#!" script (the
 * Codex npm wrapper is `#!/usr/bin/env node`), its interpreter with the script
 * as the first argument. A Node script installed under <prefix>/lib/node_modules
 * runs with <prefix>/bin/node when that exists (the Node it was installed for,
 * whatever Node a version manager makes the default later), else the first
 * one on `path`. Returns { command, prefix } or null when the interpreter is missing.
 */
export async function launchFor(realpath, { fs, path }) {
  let head = null;
  try { head = await fs.readHead(realpath, 256); } catch { head = null; }
  const text = head ? new TextDecoder("utf-8", { fatal: false }).decode(head) : "";
  if (!text.startsWith("#!")) return Object.freeze({ command: realpath, prefix: Object.freeze([]) });
  const words = text.slice(2).split("\n")[0].trim().split(/\s+/u);
  let interpreter = words[0] ?? "";
  if (interpreter === "/usr/bin/env") {
    const rest = words.slice(1).filter(word => !word.startsWith("-"));
    interpreter = rest[0] ?? "";
  }
  if (!interpreter) return null;
  if (interpreter.startsWith("/")) {
    return (await fs.isExecutableFile(interpreter).catch(() => false)) ? Object.freeze({ command: interpreter, prefix: Object.freeze([realpath]) }) : null;
  }
  const marker = "/lib/node_modules/";
  const at = realpath.indexOf(marker);
  if (interpreter === "node" && at > 0) {
    const sibling = `${realpath.slice(0, at)}/bin/node`;
    if (await fs.isExecutableFile(sibling).catch(() => false)) return Object.freeze({ command: sibling, prefix: Object.freeze([realpath]) });
  }
  const found = await findOnPath(interpreter, path, fs);
  return found ? Object.freeze({ command: found, prefix: Object.freeze([realpath]) }) : null;
}

// ---- reading output ---------------------------------------------------------------------

/**
 * Reads `pipe` (Gecko InputPipe: read() → ArrayBuffer, empty at the end) as
 * UTF-8 lines and calls onLine(line) for every non-blank one. A line longer
 * than maxLineChars is skipped whole; more than maxBytes in total throws
 * OUTPUT_LIMIT (the owner then stops the run). Resolves to { bytes, skipped }.
 */
export async function readLines(pipe, onLine, { maxLineChars = MAX_LINE_CHARS, maxBytes = MAX_OUTPUT_BYTES } = {}) {
  const reader = createSubprocessUtf8Reader(pipe, { maxBytes });
  let partial = "", skipping = false, skipped = 0;
  const deliver = line => {
    if (!line.trim()) return;
    try { onLine(line.endsWith("\r") ? line.slice(0, -1) : line); } catch (error) { console.error("AxioSozo Lab: a line handler failed", error); }
  };
  for (;;) {
    let chunk;
    try { chunk = await reader.read(); }
    catch (error) {
      if (error?.code === "OUTPUT_LIMIT") throw new LabProcessError("OUTPUT_LIMIT");
      throw new LabProcessError("OUTPUT_UNREADABLE");
    }
    if (chunk === null) break;
    let text = chunk.text;
    let index;
    while ((index = text.indexOf("\n")) >= 0) {
      const piece = text.slice(0, index);
      text = text.slice(index + 1);
      if (skipping) { skipping = false; partial = ""; continue; }
      const line = partial + piece;
      partial = "";
      if (line.length > maxLineChars) { skipped++; continue; }
      deliver(line);
    }
    if (skipping) continue;
    partial += text;
    if (partial.length > maxLineChars) { partial = ""; skipping = true; skipped++; }
  }
  if (!skipping) deliver(partial);
  return { bytes: reader.bytesRead, skipped };
}

/** Reads `pipe` to its end, keeping only the last `max` characters (for a failure reason). */
export async function readTail(pipe, { max = STDERR_TAIL_CHARS, maxBytes = MAX_OUTPUT_BYTES } = {}) {
  if (!pipe) return "";
  const reader = createSubprocessUtf8Reader(pipe, { maxBytes });
  let tail = "";
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk === null) break;
      tail = (tail + chunk.text).slice(-max);
    }
  } catch { /* A broken or flooding stderr ends the tail, not the run. */ }
  return tail;
}

// ---- one supervised client run ------------------------------------------------------------

const quietly = run => { try { Promise.resolve(run()).catch(() => {}); } catch { /* Already gone. */ } };

/**
 * Starts one client under the supervisor and reads its output.
 *   spec: { mode: "pipe" | "lease", firstSignal: "INT" | "TERM", command,
 *     args, workdir, environment, onLine(line), maxLineChars?, maxBytes? }
 * Resolves (once spawned) to a run:
 *   write(text)       stdin, "pipe" mode only (a stream-json line)
 *   closeInput()      ends stdin: Claude finishes; for "lease" it stops the group
 *   stop({ beforeClose })  the stop sequence: beforeClose() (Claude's interrupt
 *                     line), close stdin, then after STOP_GRACE_MS signal the
 *                     supervisor (which stops the group), then kill it
 *   finished          Promise<{ exitCode, stderr, outputError }> after the
 *                     process ended and its output was read
 * Rejects with LabProcessError SPAWN_FAILED when nothing started.
 */
export async function startSupervised(runtime, spec) {
  const { mode, firstSignal, command, args = [], workdir, environment, onLine } = spec ?? {};
  if (!SUPERVISOR_MODES.includes(mode) || !FIRST_SIGNALS.includes(firstSignal) || !isAbsolutePath(command) || !isAbsolutePath(workdir)
    || !Array.isArray(args) || !args.every(arg => typeof arg === "string" && !arg.includes("\u0000")) || typeof onLine !== "function") {
    throw new LabProcessError("INVALID_SPEC");
  }
  let process;
  try {
    process = await runtime.spawn({ command: "/bin/sh", arguments: ["-c", SUPERVISOR, SUPERVISOR_NAME, mode, firstSignal, command, ...args],
      workdir, environment: { ...environment }, environmentAppend: false, stderr: "pipe" });
  } catch (error) {
    throw new LabProcessError("SPAWN_FAILED", String(error?.message ?? error).slice(0, 200));
  }
  let inputOpen = true, stopping = false, ended = false;
  const timers = [];
  let outputError = null;
  const output = readLines(process.stdout, onLine, { maxLineChars: spec.maxLineChars, maxBytes: spec.maxBytes })
    .catch(error => {
      outputError = error?.code ?? "OUTPUT_UNREADABLE";
      // Too much or unreadable output: the run ends now.
      quietly(() => process.kill(SUPERVISOR_KILL_MS));
    });
  const stderr = readTail(process.stderr);
  const finished = (async () => {
    let exitCode = null;
    try { exitCode = (await process.wait())?.exitCode ?? null; } catch { exitCode = null; }
    ended = true;
    for (const id of timers.splice(0)) runtime.timers.clearTimeout(id);
    await output;
    return Object.freeze({ exitCode: Number.isInteger(exitCode) ? exitCode : null, stderr: await stderr, outputError });
  })();
  const closeInput = () => {
    if (!inputOpen) return;
    inputOpen = false;
    quietly(() => process.stdin.close());
  };
  return Object.freeze({
    pid: process.pid ?? null,
    get ended() { return ended; },
    get stopping() { return stopping; },
    finished,
    async write(text) {
      if (mode !== "pipe" || !inputOpen || ended) return false;
      try { await process.stdin.write(text); return true; } catch { return false; }
    },
    closeInput,
    // "pipe": stdin closing ends Claude's turn; after the grace the supervisor is
    // signalled. "lease": closing it already starts the supervisor's own
    // escalation (≤ 3 s); the signal after the grace is only a fallback.
    stop({ beforeClose = null, graceMs = mode === "pipe" ? STOP_GRACE_MS : STOP_GRACE_MS + 1000 } = {}) {
      if (ended || stopping) return finished;
      stopping = true;
      if (typeof beforeClose === "function" && inputOpen) {
        // Claude: the interrupt first; stdin closes once it answered (the owner
        // calls closeInput) or after a short pause.
        quietly(beforeClose);
        timers.push(runtime.timers.setTimeout(closeInput, Math.min(1500, graceMs)));
      } else closeInput();
      timers.push(runtime.timers.setTimeout(() => { if (!ended) quietly(() => process.kill(SUPERVISOR_KILL_MS)); }, graceMs));
      return finished;
    },
    /** Ends it at once (quit): the supervisor gets SIGTERM and stops the group. */
    kill() {
      if (ended) return finished;
      stopping = true;
      closeInput();
      quietly(() => process.kill(SUPERVISOR_KILL_MS));
      return finished;
    },
  });
}

/**
 * Runs `command args` once without the supervisor (a version read, a flag
 * check, `claude agents --json`, git): stdin closed at once, both outputs
 * kept up to `maxChars`, killed after `timeoutMs`.
 * Resolves to { exitCode, stdout, stderr, timedOut, spawnError }.
 */
export async function runOnce(runtime, { command, args = [], workdir = "/", environment, timeoutMs = 10000, maxChars = 65536 } = {}) {
  if (!isAbsolutePath(command) || !isAbsolutePath(workdir)) return Object.freeze({ exitCode: null, stdout: "", stderr: "", timedOut: false, spawnError: "INVALID_SPEC" });
  let process;
  try {
    process = await runtime.spawn({ command, arguments: [...args], workdir, environment: { ...environment }, environmentAppend: false, stderr: "pipe" });
  } catch (error) {
    return Object.freeze({ exitCode: null, stdout: "", stderr: "", timedOut: false, spawnError: String(error?.message ?? error).slice(0, 200) });
  }
  quietly(() => process.stdin.close());
  let timedOut = false;
  const timer = runtime.timers.setTimeout(() => { timedOut = true; quietly(() => process.kill(500)); }, timeoutMs);
  const collect = async pipe => {
    if (!pipe) return "";
    const reader = createSubprocessUtf8Reader(pipe, { maxBytes: maxChars * 4 });
    let text = "";
    try {
      for (;;) {
        const chunk = await reader.read();
        if (chunk === null) break;
        if (text.length < maxChars) text += chunk.text;
      }
    } catch { quietly(() => process.kill(500)); }
    return text.slice(0, maxChars);
  };
  const [stdout, stderr] = await Promise.all([collect(process.stdout), collect(process.stderr)]);
  let exitCode = null;
  try { exitCode = (await process.wait())?.exitCode ?? null; } catch { exitCode = null; }
  runtime.timers.clearTimeout(timer);
  return Object.freeze({ exitCode: Number.isInteger(exitCode) ? exitCode : null, stdout, stderr, timedOut, spawnError: null });
}

// ---- private scratch folders under the profile -----------------------------------------------

const RUN_ID = /^[a-z0-9][a-z0-9-]{0,63}$/u;
const FILE_NAME = /^[a-z0-9][a-z0-9._-]{0,63}$/u;

/**
 * The Lab's private folder under the profile: <root>/runs/<id>/ per run
 * (0700, with an empty 0700 `cwd/` for one-shot answers) and <root>/handover/
 * for Terminal hand-over scripts. `fs`: makeDirectory(path, mode),
 * writeFile(path, bytes, mode), remove(path) (recursive, absent is fine).
 */
export function createScratch({ fs, root }) {
  if (!isAbsolutePath(root)) throw new LabProcessError("INVALID_SCRATCH");
  const base = trimSlashes(root);
  const runs = `${base}/runs`;
  const handover = `${base}/handover`;
  let ready = null;
  const ensure = () => (ready ??= (async () => {
    await fs.makeDirectory(base, 0o700);
    await fs.makeDirectory(runs, 0o700);
  })().catch(error => { ready = null; throw error; }));
  return Object.freeze({
    root: base,
    /** Removes what an earlier session left behind (a crash): runs and hand-over scripts. */
    async cleanLeftovers() {
      await fs.remove(runs).catch(() => {});
      await fs.remove(handover).catch(() => {});
      ready = null;
    },
    /** A fresh private folder for one run. */
    async runDir(id) {
      if (typeof id !== "string" || !RUN_ID.test(id)) throw new LabProcessError("INVALID_RUN_ID");
      await ensure();
      const dir = `${runs}/${id}`;
      const cwd = `${dir}/cwd`;
      await fs.makeDirectory(dir, 0o700);
      await fs.makeDirectory(cwd, 0o700);
      let removed = false;
      return Object.freeze({
        dir, cwd,
        /** A 0600 file in this run's folder; returns its path. */
        async write(name, bytes) {
          if (typeof name !== "string" || !FILE_NAME.test(name)) throw new LabProcessError("INVALID_FILE_NAME");
          const path = `${dir}/${name}`;
          await fs.writeFile(path, bytes, 0o600);
          return path;
        },
        async remove() { if (removed) return; removed = true; await fs.remove(dir).catch(() => {}); },
      });
    },
    /** The folder for Terminal hand-over scripts (0700). */
    async handoverDir() {
      await fs.makeDirectory(base, 0o700);
      await fs.makeDirectory(handover, 0o700);
      return handover;
    },
  });
}

// ---- small helpers shared by the Lab modules ---------------------------------------------------

/** A random id of `bytes` bytes as lowercase hex (crypto.getRandomValues). */
export function randomHex(bytes = 8) {
  const values = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(values);
  return [...values].map(value => value.toString(16).padStart(2, "0")).join("");
}

/** A random RFC 4122 v4 UUID (lowercase). */
export function randomUuid() {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  const hex = randomHex(16).split("");
  hex[12] = "4";
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const h = hex.join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Base64 of bytes (for Claude's stream-json image block). */
export function base64(bytes) {
  let binary = "";
  for (let at = 0; at < bytes.length; at += 0x8000) binary += String.fromCharCode(...bytes.subarray(at, at + 0x8000));
  return btoa(binary);
}

/** One line of plain text: controls collapsed, trimmed, at most `max` characters (with "…"). */
export function oneLine(value, max = 120) {
  if (typeof value !== "string") return "";
  const text = value.replace(/[\s\u0000-\u001f\u007f-\u009f]+/gu, " ").trim();
  const chars = [...text];
  return chars.length <= max ? text : `${chars.slice(0, max - 1).join("").trimEnd()}…`;
}
