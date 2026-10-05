/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Project run targets and the one owner of the processes that run them
// (docs/design/projects.md §3). A run target is a declared service of a
// project: a web or API dev server, a mobile or desktop app, a worker. It runs
// only on an explicit user action (a button that names it), only with the
// command its project record declares (manifest v3 `command`/`cwd`), and only
// after the user approved that exact command in that exact folder once.
//
// Each run is a small, fixed /bin/sh supervisor (SUPERVISOR) that starts the
// command through the user's login shell in its own process group. Stop closes
// the supervisor's stdin; on that end of file it sends SIGTERM to the whole
// group, then SIGKILL after five seconds. The same pipe is the lease: when the
// browser quits or crashes, the pipe closes and the server stops with it, so a
// dev server never outlives the browser that started it. Nothing here probes a
// port: readiness is the services' loopback check (AxioSozoServices.serviceStatus).
//
// DOM-free: the pure target model is shared by the services and the sidebar;
// createProjectRunner takes the Gecko Subprocess.call shape as `spawn`.

export const RUN_KINDS = Object.freeze(["web", "api", "mobile", "desktop", "worker", "other"]);
export const RUN_STATES = Object.freeze(["running", "stopping", "stopped", "exited", "failed"]);
// Lines of output kept per run (RAM only, never written), each clipped.
export const LOG_LINES = 400;
export const LINE_CHARS = 2000;
// After a stop request the supervisor has this long to end the group (it
// escalates to SIGKILL after five seconds itself) before it is killed too.
export const STOP_DEADLINE_MS = 8000;
export const MAX_RUNS = 32;
export const MAX_APPROVALS = 512;
export const LOGIN_SHELLS = Object.freeze(["/bin/zsh", "/bin/bash", "/bin/sh"]);
export const SUPERVISOR_NAME = "axiosozo-run";

// The supervisor, passed as one fixed argument; the shell and the command are
// its positional parameters, never interpolated into it. `set -m` gives the
// command its own process group; the watcher job ends the run when stdin
// closes (a stop, or the browser going away). The command's stderr joins its
// stdout; the supervisor's own job notices go nowhere.
export const SUPERVISOR = [
  "exec 2>/dev/null",
  "set -m",
  "\"$1\" -l -c \"$2\" </dev/null 2>&1 &",
  "child=$!",
  "( while read -r _; do :; done; kill -TERM $$ ) &",
  "watcher=$!",
  "stop() { kill -TERM -\"$child\"; i=0; while kill -0 -\"$child\" && [ \"$i\" -lt 50 ]; do sleep 0.1; i=$((i+1)); done; kill -KILL -\"$child\"; kill -KILL -\"$watcher\"; }",
  "trap 'stop; exit 143' TERM INT HUP",
  "wait \"$child\"",
  "code=$?",
  "kill -KILL -\"$watcher\"",
  "exit \"$code\"",
].join("\n");

export class RunnerError extends Error {
  constructor(code, message) { super(message ?? code); this.name = "RunnerError"; this.code = code; }
}
const fail = code => { throw new RunnerError(code); };

// ---- Run targets (pure) -------------------------------------------------------------

const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);
const own = (value, key) => (value && typeof value === "object" && Object.hasOwn(value, key) ? value[key] : undefined);
const text = value => (typeof value === "string" && value.trim() ? value.trim() : null);

/** The stable key of a run target inside its project: its app and name. */
export function targetKey(service) {
  return `${text(own(service, "app")) ?? ""}\u0000${text(own(service, "name")) ?? ""}`;
}

/** A loopback http(s) address with an explicit or default port, or null. */
export function localAddress(spec) {
  const url = typeof spec === "string" ? URL.parse(spec) : null;
  if (!url || !["http:", "https:"].includes(url.protocol) || url.username || url.password || !LOOPBACK.has(url.hostname)) return null;
  return url;
}

const MOBILE = /\b(ios|iphone|ipad|android|simulator|simctl|xcodebuild|run-ios|run-android|run:ios|run:android|expo|capacitor|cap run|flutter run)\b/iu;
const DESKTOP = /\b(tauri|electron|macos|mac app|desktop|windows app|swift run|xcrun swift)\b/iu;
const WORKER = /\b(worker|queue|cron|jobs?|convex dev|inngest|trigger\.dev|temporal|watch)\b/iu;
const API = /\b(api|backend|graphql|rpc)\b/iu;

/** What a run target is, for its icon, wording and default action. A declared
 * `kind` wins; otherwise the name and command decide, and an address alone
 * makes it a web server. Heuristic only: nothing depends on it for safety. */
export function inferKind(service) {
  const declared = own(service, "kind");
  if (RUN_KINDS.includes(declared)) return declared;
  const name = text(own(service, "name")) ?? "";
  const command = text(own(service, "command")) ?? "";
  const words = `${name} ${text(own(service, "app")) ?? ""} ${command}`;
  if (MOBILE.test(words)) return "mobile";
  if (DESKTOP.test(words)) return "desktop";
  const hasAddress = typeof own(service, "url") === "string";
  if (hasAddress) return API.test(name) ? "api" : "web";
  if (WORKER.test(words)) return "worker";
  return "other";
}

/**
 * Every run target of a project, in manifest order: one per declared service.
 * { key, name, app, kind, command, cwd, url, port, local, startable }.
 * `local`: its address is on this Mac (loopback), so its port can be checked
 * and its page opened. `startable`: it declares a command.
 */
export function runTargets(project) {
  const services = Array.isArray(project?.manifest?.services) ? project.manifest.services : [];
  const seen = new Set();
  const targets = [];
  for (const service of services) {
    const name = text(own(service, "name"));
    if (!name) continue;
    const key = targetKey(service);
    if (seen.has(key)) continue;
    seen.add(key);
    const url = typeof own(service, "url") === "string" ? own(service, "url") : null;
    const port = Number.isInteger(own(service, "port")) ? own(service, "port") : null;
    const command = text(own(service, "command"));
    targets.push(Object.freeze({ key, name, app: text(own(service, "app")), kind: inferKind(service), command,
      cwd: text(own(service, "cwd")), url, port, local: !!(url && localAddress(url)), startable: !!command }));
  }
  return targets;
}

/**
 * What the user sees for one target, from its run (this browser's process, or
 * null) and its port check ("up" | "down" | "unknown" | null):
 * - "starting": our process runs, its address does not answer yet;
 * - "running": our process runs (and answers, when it has an address);
 * - "external": not started here, but its address answers;
 * - "stopping", "failed" (exited non-zero or would not spawn), "stopped".
 */
export function displayState(target, run, portStatus) {
  const status = run?.status ?? null;
  if (status === "running") return target?.local && portStatus !== "up" ? "starting" : "running";
  if (status === "stopping") return "stopping";
  if (target?.local && portStatus === "up") return "external";
  if (status === "failed") return "failed";
  return "stopped";
}

/** The page to open for a target: its declared address, else the local
 * address its own output printed (a dev server that moved to a free port). */
export function targetUrl(target, run) {
  if (target?.url) return target.url;
  return run?.detected_url && localAddress(run.detected_url) ? run.detected_url : null;
}

// ---- Commands, folders and the environment --------------------------------------------

const CONTROL = /[\u0000-\u0008\u000a-\u001f\u007f]/u;

/** The folder a command runs in: the project root, or a relative folder
 * inside it without ".", ".." or empty segments. */
export function workdirFor(root, cwd) {
  if (typeof root !== "string" || !root.startsWith("/") || root.length > 4096 || CONTROL.test(root)
    || root.split("/").slice(1).some(part => part === "." || part === "..")) fail("INVALID_ROOT");
  const base = root.length > 1 ? root.replace(/\/+$/u, "") : root;
  if (cwd === null || cwd === undefined || cwd === "") return base;
  if (typeof cwd !== "string" || cwd.length > 200 || cwd.startsWith("/") || cwd.startsWith("~") || CONTROL.test(cwd)
    || cwd.split("/").some(part => !part || part === "." || part === "..")) fail("INVALID_CWD");
  return `${base}/${cwd}`;
}

export function validCommand(command) {
  return typeof command === "string" && command.trim().length > 0 && command.length <= 200 && !CONTROL.test(command);
}

/** The approval key of one command in one folder of one project. */
export function approvalKey({ projectId, root, cwd, command }) {
  return JSON.stringify([projectId, root, cwd ?? "", command]);
}

/**
 * The environment of a run: only what a terminal session needs. PATH puts the
 * usual per-user tool folders (Bun, Cargo, Deno, Volta, fnm, mise, asdf,
 * Homebrew) before the browser's own; the login shell adds its profile.
 * BROWSER=none keeps a dev server from opening another browser; this one opens
 * the page itself. Nothing of the browser's own environment (Mozilla or
 * AxioSozo variables) is passed on.
 */
export function runEnvironment({ get = () => null, home = null } = {}) {
  const value = name => { try { const v = get(name); return typeof v === "string" && v && !CONTROL.test(v) ? v : null; } catch { return null; } };
  const homeDir = typeof home === "string" && home.startsWith("/") ? home : value("HOME");
  const user = homeDir ? [".bun/bin", ".local/bin", ".cargo/bin", ".deno/bin", ".volta/bin", ".local/share/fnm/aliases/default/bin",
    "Library/Application Support/fnm/aliases/default/bin", ".local/share/mise/shims", ".asdf/shims"].map(dir => `${homeDir}/${dir}`) : [];
  const inherited = [value("AXIOSOZO_DISCOVERY_PATH"), value("PATH")].filter(Boolean).flatMap(path => path.split(":"));
  const path = [...new Set([...user, "/opt/homebrew/bin", "/opt/homebrew/sbin", "/usr/local/bin", ...inherited,
    "/usr/bin", "/bin", "/usr/sbin", "/sbin"].filter(dir => dir.startsWith("/")))].join(":");
  const shell = LOGIN_SHELLS.includes(value("SHELL")) ? value("SHELL") : "/bin/zsh";
  const env = { PATH: path, SHELL: shell, LANG: value("LANG") ?? "en_US.UTF-8", TERM: "dumb", NO_COLOR: "1", BROWSER: "none" };
  if (homeDir) env.HOME = homeDir;
  for (const name of ["USER", "LOGNAME", "TMPDIR"]) if (value(name)) env[name] = value(name);
  return Object.freeze(env);
}

// ---- Output ------------------------------------------------------------------------------

// CSI and OSC escape sequences (colours, cursor moves, hyperlinks), then any
// remaining control characters except tab.
const ESCAPES = /\u001b\[[0-?]*[ -/]*[@-~]|\u001b\][^\u0007\u001b]*(?:\u0007|\u001b\\)|\u001b[@-Z\\-_]/gu;
const CONTROLS = /[\u0000-\u0008\u000b-\u001f\u007f]/gu;
const PRINTED_URL = /\bhttps?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0):\d{2,5}(?:\/[^\s'"<>`)\]]*)?/u;

export function cleanLine(line) {
  return String(line).replace(ESCAPES, "").replace(CONTROLS, "").slice(0, LINE_CHARS);
}

/** The first local address a line prints ("Local: http://localhost:5174/"),
 * with 0.0.0.0 read as localhost, or null. */
export function printedUrl(line) {
  const match = PRINTED_URL.exec(line);
  if (!match) return null;
  const url = localAddress(match[0].replace("//0.0.0.0:", "//localhost:"));
  return url ? url.href : null;
}

// ---- The runner ------------------------------------------------------------------------------

/**
 * createProjectRunner({ spawn, timers, clock, environment, approvals, onChange })
 * - spawn(options) → the Gecko Subprocess.call result ({ pid, stdin.close(),
 *   stdout.readString(), wait() → { exitCode }, kill(ms) });
 * - environment: runEnvironment(...) (its SHELL is the login shell);
 * - approvals: { has(key), add(key) } (profile-backed in chrome), absent:
 *   nothing is ever approved and every start needs `approve`;
 * - onChange(): called after every state or output change (coalesce it).
 */
export function createProjectRunner({ spawn, timers = globalThis, clock = Date.now, environment = runEnvironment(),
  approvals = null, onChange = () => {} } = {}) {
  if (typeof spawn !== "function") throw new TypeError("spawn");
  const runs = new Map(); // `${projectId}\u0000${key}` → run
  let serial = 0;
  let closed = false;
  const id = (projectId, key) => `${projectId}\u0000${key}`;
  const notify = () => { try { onChange(); } catch { /* A listener's failure is its own. */ } };

  function snapshot(run) {
    return Object.freeze({ project_id: run.projectId, key: run.key, name: run.name, run: run.serial, status: run.status,
      command: run.command, cwd: run.cwd, started_at: run.startedAt, ended_at: run.endedAt, exit_code: run.exitCode,
      detected_url: run.detectedUrl, last_line: run.lines.at(-1) ?? null, error: run.error });
  }

  function append(run, chunk) {
    const parts = (run.partial + chunk).split(/\r?\n|\r/u);
    run.partial = parts.pop() ?? "";
    if (run.partial.length > LINE_CHARS) { parts.push(run.partial); run.partial = ""; }
    for (const raw of parts) {
      const line = cleanLine(raw);
      if (!line.trim()) continue;
      run.lines.push(line);
      if (!run.detectedUrl) run.detectedUrl = printedUrl(line);
    }
    if (run.lines.length > LOG_LINES) run.lines.splice(0, run.lines.length - LOG_LINES);
  }

  async function pump(run) {
    try {
      for (;;) {
        const chunk = await run.process.stdout.readString();
        if (!chunk) break;
        append(run, chunk);
        notify();
      }
    } catch { /* The pipe closed. */ }
    if (run.partial) { append(run, "\n"); notify(); }
  }

  function settle(run, exitCode) {
    if (run.timer !== null) { timers.clearTimeout(run.timer); run.timer = null; }
    run.endedAt = clock();
    run.exitCode = Number.isInteger(exitCode) ? exitCode : null;
    // A requested stop ends as "stopped" whatever the group's signal status was.
    run.status = run.stopRequested ? "stopped" : exitCode === 0 ? "exited" : "failed";
    run.process = null;
    for (const waiter of run.waiters.splice(0)) waiter();
    notify();
  }

  function needsApproval(key) {
    try { return !approvals?.has?.(key); } catch { return true; }
  }

  /**
   * Starts one target of a project. Refuses: a closed runner, a target
   * without a valid command, a folder outside the project, a target already
   * running or stopping, too many runs, and a command not yet approved
   * (NEEDS_APPROVAL, unless `approve` is true: the user pressed a button that
   * showed this command; it is then remembered).
   */
  async function start({ projectId, root, target, approve = false } = {}) {
    if (closed) fail("RUNNER_CLOSED");
    if (typeof projectId !== "string" || !projectId) fail("UNKNOWN_PROJECT");
    if (!target || typeof target.key !== "string") fail("UNKNOWN_TARGET");
    if (!validCommand(target.command)) fail("NO_COMMAND");
    const workdir = workdirFor(root, target.cwd);
    const runId = id(projectId, target.key);
    const previous = runs.get(runId);
    if (previous && (previous.status === "running" || previous.status === "stopping")) fail("ALREADY_RUNNING");
    const live = [...runs.values()].filter(run => run.status === "running" || run.status === "stopping").length;
    if (live >= MAX_RUNS) fail("TOO_MANY_RUNS");
    const key = approvalKey({ projectId, root, cwd: target.cwd, command: target.command });
    if (needsApproval(key)) {
      if (approve !== true) fail("NEEDS_APPROVAL");
      await approvals?.add?.(key);
    }
    const run = { serial: ++serial, projectId, key: target.key, name: target.name, command: target.command, cwd: target.cwd ?? null,
      status: "running", startedAt: clock(), endedAt: null, exitCode: null, detectedUrl: null, lines: [], partial: "",
      process: null, stopRequested: false, timer: null, waiters: [], error: null };
    runs.set(runId, run);
    notify();
    try {
      run.process = await spawn({ command: "/bin/sh", arguments: ["-c", SUPERVISOR, SUPERVISOR_NAME, environment.SHELL, target.command],
        workdir, environment: { ...environment }, environmentAppend: false, stderr: "stdout" });
    } catch (error) {
      run.error = typeof error?.message === "string" ? error.message.slice(0, 200) : "SPAWN_FAILED";
      run.lines.push(`Could not start: ${run.error}`);
      settle(run, null);
      return snapshot(run);
    }
    if (closed || run.stopRequested) requestStop(run);
    pump(run);
    Promise.resolve(run.process.wait()).then(result => settle(run, result?.exitCode), () => settle(run, null));
    return snapshot(run);
  }

  function requestStop(run) {
    if (!run.process) return;
    run.stopRequested = true;
    if (run.status === "running") { run.status = "stopping"; notify(); }
    try { Promise.resolve(run.process.stdin.close()).catch(() => {}); } catch { /* Already closed. */ }
    if (run.timer === null) {
      run.timer = timers.setTimeout(() => {
        run.timer = null;
        try { Promise.resolve(run.process?.kill(1000)).catch(() => {}); } catch { /* Exited. */ }
      }, STOP_DEADLINE_MS);
    }
  }

  /** Stops one run; resolves when its process has ended. */
  function stop(projectId, key) {
    const run = runs.get(id(projectId, key));
    if (!run || (run.status !== "running" && run.status !== "stopping")) return Promise.resolve(false);
    if (!run.process) { run.stopRequested = true; run.status = "stopping"; notify(); }
    const done = new Promise(resolve => run.waiters.push(() => resolve(true)));
    requestStop(run);
    return done;
  }

  /** Stops every run (of one project, when given); resolves when all ended. */
  function stopAll(projectId = null) {
    const keys = [...runs.values()].filter(run => projectId === null || run.projectId === projectId).map(run => [run.projectId, run.key]);
    return Promise.all(keys.map(([p, k]) => stop(p, k))).then(() => undefined);
  }

  return Object.freeze({
    start,
    stop,
    stopAll,
    /** Forgets a finished run (its output included). */
    dismiss(projectId, key) {
      const run = runs.get(id(projectId, key));
      if (!run || run.status === "running" || run.status === "stopping") return false;
      runs.delete(id(projectId, key));
      notify();
      return true;
    },
    /** Snapshots of every run this browser started (of one project, when given). */
    list(projectId = null) {
      return [...runs.values()].filter(run => projectId === null || run.projectId === projectId).map(snapshot);
    },
    get(projectId, key) { const run = runs.get(id(projectId, key)); return run ? snapshot(run) : null; },
    /** The kept output of one run, oldest first. */
    log(projectId, key) { return [...(runs.get(id(projectId, key))?.lines ?? [])]; },
    isApproved({ projectId, root, cwd, command }) {
      return !needsApproval(approvalKey({ projectId, root, cwd, command }));
    },
    /** No new runs; every run stops. Resolves when all ended. */
    close() { closed = true; return stopAll(); },
  });
}

/** Profile approvals for createProjectRunner over a JsonStore of
 * { version: 1, approved: [key, …] } (newest last, bounded). */
export function approvalsOver(store) {
  let cache = null;
  const load = async () => (cache ??= new Set((await store.load()).approved));
  // `has` must answer synchronously; until the first load it says no, which
  // only asks the user once more.
  load().catch(() => {});
  return Object.freeze({
    has: key => cache?.has(key) === true,
    async add(key) {
      await load();
      if (cache.has(key)) return;
      await store.update(doc => ({ version: 1, approved: [...doc.approved.filter(item => item !== key), key].slice(-MAX_APPROVALS) }));
      cache.add(key);
    },
  });
}

export function validateApprovals(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== 1 || !Array.isArray(value.approved)
    || Object.keys(value).some(key => !["version", "approved"].includes(key)) || value.approved.length > MAX_APPROVALS
    || value.approved.some(item => typeof item !== "string" || item.length > 8192)) throw new RunnerError("INVALID_APPROVALS");
  return { version: 1, approved: [...value.approved] };
}
export const EMPTY_APPROVALS = Object.freeze({ version: 1, approved: [] });
