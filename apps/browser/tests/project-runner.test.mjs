/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// ProjectRunner: the pure run-target model, and the supervisor's lifecycle with
// a fake Subprocess and, at the end, with real /bin/sh process groups (Node's
// child_process standing in for Gecko's Subprocess.call; synthetic commands only).
import test from "node:test";
import assert from "node:assert/strict";
import { spawn as nodeSpawn, execFileSync } from "node:child_process";
import {
  RUN_KINDS, SUPERVISOR, SUPERVISOR_NAME, LOG_LINES, STOP_DEADLINE_MS, RunnerError, runTargets, inferKind, targetKey, displayState,
  targetUrl, workdirFor, runEnvironment, cleanLine, printedUrl, createProjectRunner, approvalsOver, validateApprovals, EMPTY_APPROVALS,
} from "../chrome/ProjectRunner.sys.mjs";

const project = (services, extra = {}) => ({ id: "p_1", root: "/Users/dev/Code/acme", manifest: { name: "Acme", kind: "web", environments: [], services, surfaces: [] }, ...extra });

test("run targets: one per declared service with a name, keyed by app and name, in manifest order", () => {
  const targets = runTargets(project([
    { name: "web", app: "web", url: "http://localhost:5173/", port: 5173, command: "bun run dev", cwd: "apps/web" },
    { name: "Dev server", url: "https://staging.acme.example/", port: 443 },
    { name: "iOS app", app: "ios", command: "xcodebuild -scheme Acme -destination 'platform=iOS Simulator,name=iPhone 16' build" },
    { name: "web", app: "web", url: "http://localhost:9999/", port: 9999 },
    { name: "", command: "x" },
  ]));
  assert.deepEqual(targets.map(t => [t.key, t.kind, t.local, t.startable]), [
    ["web\u0000web", "web", true, true],
    ["\u0000Dev server", "web", false, false],
    ["ios\u0000iOS app", "mobile", false, true],
  ]);
  assert.equal(targets[0].cwd, "apps/web");
  assert.equal(targetKey({ name: "web" }), "\u0000web");
  assert.deepEqual(runTargets(null), []);
  assert.ok(Object.isFrozen(targets[0]));
});

test("kinds: declared kind wins; mobile, desktop, API, worker and web from names and commands", () => {
  assert.deepEqual(RUN_KINDS, ["web", "api", "mobile", "desktop", "worker", "other"]);
  assert.equal(inferKind({ name: "anything", kind: "desktop" }), "desktop");
  assert.equal(inferKind({ name: "iPhone", command: "make run" }), "mobile");
  assert.equal(inferKind({ name: "app", command: "npx expo run:ios" }), "mobile");
  assert.equal(inferKind({ name: "Android", command: "./gradlew installDebug" }), "mobile");
  assert.equal(inferKind({ name: "Desktop", command: "bun tauri dev" }), "desktop");
  assert.equal(inferKind({ name: "api", url: "http://localhost:8787/", port: 8787 }), "api");
  assert.equal(inferKind({ name: "admin", url: "http://localhost:5174/", port: 5174 }), "web");
  assert.equal(inferKind({ name: "backend sync", command: "npx convex dev" }), "worker");
  assert.equal(inferKind({ name: "everything", command: "bun run dev" }), "other");
});

test("display state: our process, then the port answer, decides what the user sees", () => {
  const web = { local: true }, ios = { local: false };
  assert.equal(displayState(web, { status: "running" }, "down"), "starting");
  const web5173 = { local: true, port: 5173 };
  assert.equal(displayState(web5173, { status: "running", detected_url: "http://localhost:5173/" }, "unknown"), "running", "it printed its address");
  assert.equal(displayState(web5173, { status: "running", detected_url: "http://localhost:5174/" }, "down"), "starting", "another port is not this one");
  assert.equal(displayState(web, { status: "running" }, "up"), "running");
  assert.equal(displayState(ios, { status: "running" }, null), "running");
  assert.equal(displayState(web, { status: "stopping" }, "up"), "stopping");
  assert.equal(displayState(web, null, "up"), "external", "answering but not started here");
  assert.equal(displayState(web, { status: "failed" }, "down"), "failed");
  assert.equal(displayState(web, { status: "exited" }, "down"), "stopped");
  assert.equal(displayState(ios, null, null), "stopped");
  assert.equal(targetUrl({ url: "http://localhost:5173/" }, { detected_url: "http://localhost:5174/" }), "http://localhost:5173/");
  assert.equal(targetUrl({ url: null }, { detected_url: "http://localhost:5174/" }), "http://localhost:5174/");
  assert.equal(targetUrl({ url: null }, { detected_url: "https://evil.example/" }), null);
});

test("folders stay inside the project; commands are one printable line", () => {
  assert.equal(workdirFor("/Users/dev/Code/acme", null), "/Users/dev/Code/acme");
  assert.equal(workdirFor("/Users/dev/Code/acme/", "apps/web"), "/Users/dev/Code/acme/apps/web");
  for (const cwd of ["../x", "apps/../..", "/etc", "~/x", "a//b", "./a", "a\nb"]) {
    assert.throws(() => workdirFor("/Users/dev/Code/acme", cwd), { code: "INVALID_CWD" }, cwd);
  }
  for (const root of ["relative", "/a/../b", null]) assert.throws(() => workdirFor(root, null), { code: "INVALID_ROOT" });
});

test("the environment is a terminal's, never the browser's own variables", () => {
  const vars = { HOME: "/Users/dev", USER: "dev", SHELL: "/bin/bash", PATH: "/usr/bin:/bin", AXIOSOZO_DISCOVERY_PATH: "/Users/dev/.fnm/bin:/usr/bin",
    MOZ_CRASHREPORTER: "1", AXIOSOZO_CEF_ROOT: "/x", TMPDIR: "/tmp/x/" };
  const env = runEnvironment({ get: name => vars[name] ?? null, home: "/Users/dev" });
  assert.deepEqual(Object.keys(env).sort(), ["BROWSER", "HOME", "LANG", "NO_COLOR", "PATH", "SHELL", "TERM", "TMPDIR", "USER"]);
  assert.equal(env.SHELL, "/bin/bash");
  assert.equal(env.BROWSER, "none");
  const path = env.PATH.split(":");
  assert.equal(path[0], "/Users/dev/.bun/bin");
  assert.ok(path.includes("/Users/dev/.fnm/bin") && path.includes("/opt/homebrew/bin"));
  assert.equal(new Set(path).size, path.length, "no duplicates");
  assert.equal(runEnvironment({ get: name => ({ SHELL: "/usr/local/bin/fish" })[name] ?? null }).SHELL, "/bin/zsh", "unknown shells fall back");
});

test("output: colours and controls are removed; the first printed local address is kept", () => {
  assert.equal(cleanLine("\u001b[32m  ➜  Local:\u001b[39m   \u001b[36mhttp://localhost:\u001b[1m5174\u001b[22m/\u001b[39m"), "  ➜  Local:   http://localhost:5174/");
  assert.equal(printedUrl("  ➜  Local:   http://localhost:5174/"), "http://localhost:5174/");
  assert.equal(printedUrl("listening on http://0.0.0.0:3000"), "http://localhost:3000/");
  assert.equal(printedUrl("see https://vercel.com/docs"), null);
});

// ---- Lifecycle with a fake Subprocess ---------------------------------------------------

function fakeSpawn() {
  const spawned = [];
  const spawn = async options => {
    let resolveWait;
    const chunks = [];
    let waiting = null;
    const proc = {
      pid: 4000 + spawned.length, options, stdinClosed: false, killed: null,
      stdin: { close() { proc.stdinClosed = true; return Promise.resolve(); } },
      stdout: { read() { return (chunks.length ? Promise.resolve(chunks.shift()) : new Promise(r => { waiting = r; })).then(bytes => bytes.slice().buffer); } },
      wait: () => new Promise(r => { resolveWait = r; }),
      kill(ms) { proc.killed = ms; return Promise.resolve(); },
      emit(text) { proc.emitBytes(new TextEncoder().encode(text)); },
      emitBytes(bytes) { if (waiting) { const w = waiting; waiting = null; w(bytes); } else chunks.push(bytes); },
      exit(code) { proc.emitBytes(new Uint8Array(0)); resolveWait({ exitCode: code }); },
    };
    spawned.push(proc);
    return proc;
  };
  return { spawn, spawned };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
function manualTimers() {
  const timers = new Map(); let next = 1;
  return { setTimeout(fn, ms) { const id = next++; timers.set(id, { fn, ms }); return id; }, clearTimeout(id) { timers.delete(id); },
    fire() { for (const [id, t] of [...timers]) { timers.delete(id); t.fn(); } }, size: () => timers.size };
}
function memoryApprovals() {
  const set = new Set();
  return { set, has: key => set.has(key), async add(key) { set.add(key); } };
}
const web = runTargets(project([{ name: "web", url: "http://localhost:5173/", port: 5173, command: "bun run dev", cwd: "apps/web" }]))[0];

test("a start needs the user's approval of that exact command in that folder, once", async () => {
  const { spawn, spawned } = fakeSpawn();
  const approvals = memoryApprovals();
  const runner = createProjectRunner({ spawn, approvals, timers: manualTimers(), environment: runEnvironment({ get: () => null, home: "/Users/dev" }) });
  await assert.rejects(runner.start({ projectId: "p_1", root: "/Users/dev/Code/acme", target: web }), { code: "NEEDS_APPROVAL" });
  assert.equal(spawned.length, 0);
  assert.equal(runner.isApproved({ projectId: "p_1", root: "/Users/dev/Code/acme", cwd: "apps/web", command: "bun run dev" }), false);
  const run = await runner.start({ projectId: "p_1", root: "/Users/dev/Code/acme", target: web, approve: true });
  assert.equal(run.status, "running");
  assert.equal(runner.isApproved({ projectId: "p_1", root: "/Users/dev/Code/acme", cwd: "apps/web", command: "bun run dev" }), true);
  const { options } = spawned[0];
  assert.equal(options.command, "/bin/sh");
  assert.deepEqual(options.arguments, ["-c", SUPERVISOR, SUPERVISOR_NAME, "/bin/zsh", "bun run dev"], "the command is a positional argument");
  assert.equal(options.workdir, "/Users/dev/Code/acme/apps/web");
  assert.equal(options.environmentAppend, false);
  assert.equal(options.stderr, "stdout");
  await assert.rejects(runner.start({ projectId: "p_1", root: "/Users/dev/Code/acme", target: web }), { code: "ALREADY_RUNNING" });
  // A changed command is a new approval.
  const changed = { ...web, key: "other", command: "bun run dev --host" };
  await assert.rejects(runner.start({ projectId: "p_1", root: "/Users/dev/Code/acme", target: changed }), { code: "NEEDS_APPROVAL" });
  await assert.rejects(runner.start({ projectId: "p_1", root: "/Users/dev/Code/acme", target: { ...web, key: "x", command: null } }), { code: "NO_COMMAND" });
  await assert.rejects(runner.start({ projectId: "p_1", root: "/Users/dev/Code/acme", target: { ...web, key: "y", cwd: "../up" }, approve: true }), { code: "INVALID_CWD" });
});

test("output is kept clean and bounded; the printed address is remembered; exit codes decide the end state", async () => {
  const { spawn, spawned } = fakeSpawn();
  let changes = 0;
  const runner = createProjectRunner({ spawn, approvals: memoryApprovals(), timers: manualTimers(), onChange: () => changes++ });
  await runner.start({ projectId: "p_1", root: "/r", target: web, approve: true });
  const proc = spawned[0];
  proc.emit("\u001b[32mVITE\u001b[0m ready\n  ➜  Local:   http://localhost:5174/\npartial");
  await flush();
  proc.emit(" line\r\n");
  await flush();
  assert.deepEqual(runner.log("p_1", web.key), ["VITE ready", "  ➜  Local:   http://localhost:5174/", "partial line"]);
  // A chunk that ends inside a UTF-8 sequence is not the end of the output.
  const bytes = new TextEncoder().encode("ready ✓\n");
  proc.emitBytes(bytes.slice(0, 8)); await flush();
  proc.emitBytes(bytes.slice(8)); await flush();
  assert.equal(runner.log("p_1", web.key).at(-1), "ready ✓");
  assert.equal(runner.get("p_1", web.key).detected_url, "http://localhost:5174/");
  assert.equal(runner.get("p_1", web.key).last_line, "ready ✓");
  proc.emit(Array.from({ length: LOG_LINES + 50 }, (_, i) => `line ${i}`).join("\n") + "\n");
  await flush();
  assert.equal(runner.log("p_1", web.key).length, LOG_LINES);
  proc.exit(1);
  await flush();
  assert.equal(runner.get("p_1", web.key).status, "failed");
  assert.equal(runner.get("p_1", web.key).exit_code, 1);
  assert.ok(changes > 3);
  // A failed run can start again (the same approval).
  await runner.start({ projectId: "p_1", root: "/r", target: web });
  spawned[1].exit(0);
  await flush();
  assert.equal(runner.get("p_1", web.key).status, "exited");
  assert.equal(runner.dismiss("p_1", web.key), true);
  assert.equal(runner.get("p_1", web.key), null);
});

test("stop closes the supervisor's stdin, then kills it after the deadline; close stops everything and refuses new runs", async () => {
  const { spawn, spawned } = fakeSpawn();
  const timers = manualTimers();
  const runner = createProjectRunner({ spawn, approvals: memoryApprovals(), timers });
  const ios = runTargets(project([{ name: "iOS app", command: "make ios" }]))[0];
  await runner.start({ projectId: "p_1", root: "/r", target: web, approve: true });
  await runner.start({ projectId: "p_2", root: "/s", target: ios, approve: true });
  const stopped = runner.stop("p_1", web.key);
  assert.equal(spawned[0].stdinClosed, true);
  assert.equal(runner.get("p_1", web.key).status, "stopping");
  assert.equal(timers.size(), 1);
  timers.fire();
  assert.equal(spawned[0].killed, 1000, "the supervisor is killed only after the deadline");
  assert.equal(STOP_DEADLINE_MS, 8000);
  spawned[0].exit(143);
  assert.equal(await stopped, true);
  assert.equal(runner.get("p_1", web.key).status, "stopped", "a requested stop is never a failure");
  assert.equal(await runner.stop("p_1", web.key), false, "nothing left to stop");
  const closing = runner.close();
  assert.equal(spawned[1].stdinClosed, true);
  spawned[1].exit(143);
  await closing;
  await assert.rejects(runner.start({ projectId: "p_1", root: "/r", target: web }), { code: "RUNNER_CLOSED" });
});

test("a spawn failure ends as failed with its reason in the output", async () => {
  const runner = createProjectRunner({ spawn: async () => { throw new Error("No such file"); }, approvals: memoryApprovals(), timers: manualTimers() });
  const run = await runner.start({ projectId: "p_1", root: "/r", target: web, approve: true });
  assert.equal(run.status, "failed");
  assert.deepEqual(runner.log("p_1", web.key), ["Could not start: No such file"]);
});

test("profile approvals: validated, bounded, newest last", async () => {
  let doc = structuredClone(EMPTY_APPROVALS);
  const store = { async load() { return doc; }, async update(fn) { doc = validateApprovals(await fn(doc)); return doc; } };
  const approvals = approvalsOver(store);
  await flush();
  assert.equal(approvals.has("a"), false);
  await approvals.add("a"); await approvals.add("b"); await approvals.add("a");
  assert.deepEqual(doc.approved, ["a", "b"]);
  assert.equal(approvals.has("b"), true);
  assert.throws(() => validateApprovals({ version: 1, approved: [1] }), RunnerError);
  assert.throws(() => validateApprovals({ version: 2, approved: [] }), RunnerError);
});

// ---- The real supervisor: /bin/sh process groups --------------------------------------------

/** Gecko Subprocess.call's shape over Node's child_process. */
function nodeSubprocess(options) {
  const child = nodeSpawn(options.command, options.arguments, { cwd: options.workdir, env: options.environment, stdio: ["pipe", "pipe", "pipe"] });
  const queue = []; let waiting = null; let ended = false;
  const deliver = value => { if (waiting) { const w = waiting; waiting = null; w(value); } else queue.push(value); };
  child.stdout.on("data", chunk => deliver(chunk));
  child.stdout.on("end", () => { ended = true; deliver(Buffer.alloc(0)); });
  const exited = new Promise(resolve => child.on("exit", (code, signal) => resolve({ exitCode: code ?? (signal ? 128 : -1) })));
  return Promise.resolve({
    pid: child.pid,
    stdin: { close() { child.stdin.end(); return Promise.resolve(); } },
    stdout: { read() { return (queue.length ? Promise.resolve(queue.shift()) : ended ? Promise.resolve(Buffer.alloc(0)) : new Promise(r => { waiting = r; }))
      .then(chunk => new Uint8Array(chunk).slice().buffer); } },
    wait: () => exited,
    kill() { child.kill("SIGKILL"); return Promise.resolve(); },
  });
}
const alive = marker => { try { return execFileSync("/usr/bin/pgrep", ["-f", marker]).toString().trim().length > 0; } catch { return false; } };

test("real supervisor: output and exit code come back; stop ends the whole process group", { skip: process.platform === "win32", timeout: 30000 }, async () => {
  const marker = `axiosozo-runner-test-${process.pid}-${Date.now()}`;
  const env = { ...runEnvironment({ get: name => process.env[name] ?? null }), SHELL: "/bin/sh" };
  const runner = createProjectRunner({ spawn: nodeSubprocess, approvals: memoryApprovals(), environment: env });
  const quick = { key: "quick", name: "quick", command: "echo hello; echo oops >&2; printf 'Local: http://localhost:4321/\\n'; exit 3", cwd: null };
  await runner.start({ projectId: "p_1", root: "/tmp", target: quick, approve: true });
  while (runner.get("p_1", "quick").status === "running") await new Promise(r => setTimeout(r, 20));
  assert.equal(runner.get("p_1", "quick").status, "failed");
  assert.equal(runner.get("p_1", "quick").exit_code, 3);
  assert.deepEqual(runner.log("p_1", "quick"), ["hello", "oops", "Local: http://localhost:4321/"]);
  // A server with a grandchild that ignores SIGTERM: the group still ends.
  const server = { key: "server", name: "server", cwd: null,
    command: `sh -c 'trap "" TERM; while :; do sleep 1; done' ${marker}-a & sh -c 'while :; do sleep 1; done' ${marker}-b; wait` };
  await runner.start({ projectId: "p_1", root: "/tmp", target: server, approve: true });
  for (let i = 0; i < 50 && !alive(marker); i++) await new Promise(r => setTimeout(r, 50));
  assert.equal(alive(marker), true, "the server runs");
  await runner.stop("p_1", "server");
  for (let i = 0; i < 40 && alive(marker); i++) await new Promise(r => setTimeout(r, 100));
  assert.equal(alive(marker), false, "no process of the group survives the stop");
  assert.equal(runner.get("p_1", "server").status, "stopped");
});
