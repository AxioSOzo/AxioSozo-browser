/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Process/filesystem arrival adapter only. The core, Subprocess.call-shaped
// runtime and metadata-only filesystem are injected by the privileged owner.
export const ARRIVAL_LIMITS = Object.freeze({ timeoutMs: 3000, stdoutBytes: 1048576,
  stderrBytes: 16384, uidBytes: 64, pids: 8, candidates: 6, bases: 32, cleanupMs: 500 });
const EXIT = Symbol("arrival-exit");
const normalPath = path => {
  if (typeof path !== "string" || !path.startsWith("/") || path.length > 4096 || /[\u0000-\u001f\u007f]/u.test(path)) return null;
  const parts = path.split("/").filter(part => part && part !== ".");
  return parts.includes("..") ? null : `/${parts.join("/")}`;
};
const within = (path, base) => path === base || path.startsWith(`${base}/`);
const directory = stat => stat?.type === "directory";
const gitKind = stat => stat?.type === "directory" ? "dir" : stat?.type === "regular" ? "file" : null;
const bounded = (value, fallback, maximum) => Number.isSafeInteger(value) && value > 0 ? Math.min(value, maximum) : fallback;
// Count UTF-8 bytes without allocating a second copy of an untrusted chunk.
function byteLength(text) {
  let size = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 128) size++;
    else if (code < 2048) size += 2;
    else if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length && text.charCodeAt(i + 1) >= 0xdc00 && text.charCodeAt(i + 1) <= 0xdfff) { size += 4; i++; }
    else size += 3;
  }
  return size;
}
const defaultsDenied = home => home ? ["Library", ".mozilla", ".thunderbird", ".cache", ".config", ".ssh", ".aws", ".gnupg", ".azure", ".kube", ".codex", ".claude"].map(part => `${home}/${part}`) : [];
const SYSTEM_DENIED = ["/System", "/Library", "/private", "/dev", "/proc", "/var", "/tmp"];

function createSession({ signal, clock, timers, timeoutMs }) {
  let stopped = false, rejectExit;
  const deadline = clock() + timeoutMs;
  const exited = new Promise((_resolve, reject) => { rejectExit = reject; });
  exited.catch(() => {});
  const stop = () => { if (!stopped) { stopped = true; rejectExit(EXIT); } };
  const onAbort = () => stop();
  signal?.addEventListener?.("abort", onAbort, { once: true });
  const timer = timers.setTimeout(stop, timeoutMs);
  const check = () => {
    if (signal?.aborted || clock() >= deadline) stop();
    if (stopped) throw EXIT;
  };
  return { stop, check, get stopped() { return stopped; },
    async guard(promise) { check(); return Promise.race([promise, exited]); },
    close() { timers.clearTimeout(timer); signal?.removeEventListener?.("abort", onAbort); } };
}

/**
 * runtime.call(options) is Gecko Subprocess.call: a child exposes
 * stdout/stderr.readString(), wait(), kill(timeout), optional stdin.close().
 * fs exposes realpath(path), stat(path), lstat(path); it opens no file content.
 * core is the contexts package. projects or getProjects() supplies validated
 * profile records. roots is privileged configuration (e.g. /Volumes/T9/Code).
 * clock and timers are injectable; safety limits can only be reduced.
 * discover(url, { isPrivate, signal }) returns an arrivalOffer or null.
 */
export function createProjectArrival({ runtime, fs, core, home, roots = [], deniedRoots = [],
  projects = [], getProjects = () => projects, clock = Date.now, timers = globalThis,
  timeoutMs, maxStdoutBytes, maxStderrBytes, cleanupMs } = {}) {
  let ownUid = null;
  let queue = Promise.resolve();
  const limits = { timeoutMs: bounded(timeoutMs, ARRIVAL_LIMITS.timeoutMs, ARRIVAL_LIMITS.timeoutMs),
    cleanupMs: bounded(cleanupMs, ARRIVAL_LIMITS.cleanupMs, ARRIVAL_LIMITS.cleanupMs),
    stdout: bounded(maxStdoutBytes, ARRIVAL_LIMITS.stdoutBytes, ARRIVAL_LIMITS.stdoutBytes),
    stderr: bounded(maxStderrBytes, ARRIVAL_LIMITS.stderrBytes, ARRIVAL_LIMITS.stderrBytes) };
  const rawHome = normalPath(home);
  const bases = [...new Set([rawHome, ...(Array.isArray(roots) ? roots : []).map(normalPath)].filter(path => path && path !== "/"))].slice(0, ARRIVAL_LIMITS.bases);
  const customDenied = (Array.isArray(deniedRoots) ? deniedRoots : []).map(normalPath).filter(Boolean).slice(0, ARRIVAL_LIMITS.bases);
  const rawDenied = [...SYSTEM_DENIED, ...defaultsDenied(rawHome), ...customDenied];
  const deniedBy = (path, denies) => denies.some(base => base === "/" || within(path, base));

  async function discover(url, { isPrivate, signal } = {}) {
    // Privacy must have been established by the privileged caller. Credentials
    // are rejected even for known repository/hosting surfaces.
    if (isPrivate !== false || signal?.aborted) return null;
    let parsed;
    try {
      const source = typeof url === "string" ? url : url?.href;
      if (typeof source !== "string" || source.length > 65536) return null;
      parsed = new URL(source);
      if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) return null;
    } catch { return null; }
    if (!core || typeof timers?.setTimeout !== "function" || typeof timers?.clearTimeout !== "function") return null;
    let session;
    try { session = createSession({ signal, clock, timers, timeoutMs: limits.timeoutMs }); }
    catch { return null; }
    const children = new Set();
    let stdoutBytes = 0, stderrBytes = 0;

    async function terminate(state) {
      if (state.ending) return state.ending;
      state.ending = (async () => {
        // Gecko requires either draining or explicitly closing buffered pipes.
        // Force-close on failure so a pending read cannot retain pipe resources.
        const closing = [state.child.stdout, state.child.stderr].map(pipe => {
          try { return Promise.resolve(pipe?.close?.(true)); } catch { return Promise.resolve(); }
        });
        let killing;
        try { killing = Promise.resolve(state.child.kill(250)); } catch { killing = Promise.resolve(); }
        // A broken runtime can fail to resolve kill/wait/read/close. Retain
        // handlers for eventual reap while bounding the caller's cleanup.
        const settled = Promise.allSettled([...closing, killing, state.wait, ...state.drains]);
        let graceTimer;
        try {
          await Promise.race([settled, new Promise(resolve => { graceTimer = timers.setTimeout(resolve, limits.cleanupMs); })]);
        } finally { timers.clearTimeout(graceTimer); children.delete(state); }
      })();
      return state.ending;
    }

    async function run(command, args, localStdoutCap = limits.stdout) {
      session.check();
      // Absolute executable and literal arrays only; no inherited credentials,
      // shell, user-provided executables, environment or process working dir.
      const spawning = Promise.resolve().then(() => runtime.call({ command, arguments: args,
        environmentAppend: false, environment: { PATH: "/usr/bin:/bin:/usr/sbin", LANG: "C", LC_ALL: "C" }, stderr: "pipe" }));
      const adopted = spawning.then(child => {
        if (!child || typeof child.wait !== "function" || typeof child.kill !== "function") throw EXIT;
        const state = { child, wait: Promise.resolve().then(() => child.wait()), drains: [], ending: null };
        state.wait.catch(() => {});
        children.add(state);
        if (session.stopped) void terminate(state);
        return state;
      });
      adopted.catch(() => {});
      const state = await session.guard(adopted);
      try {
        session.check();
        const drain = async (pipe, stderr) => {
          if (typeof pipe?.readString !== "function") throw EXIT;
          let localBytes = 0;
          const chunks = [];
          for (;;) {
            session.check();
            const chunk = await pipe.readString();
            if (chunk === "" || chunk === null) break;
            if (typeof chunk !== "string") throw EXIT;
            session.check();
            const size = byteLength(chunk);
            localBytes += size;
            if (stderr) {
              stderrBytes += size;
              if (stderrBytes > limits.stderr) throw EXIT;
            } else {
              stdoutBytes += size;
              if (stdoutBytes > limits.stdout || localBytes > localStdoutCap) throw EXIT;
              chunks.push(chunk);
            }
          }
          return stderr ? null : chunks.join("");
        };
        state.drains = [drain(state.child.stdout, false), drain(state.child.stderr, true)];
        let stdinClosed;
        try { stdinClosed = Promise.resolve(state.child.stdin?.close?.()); } catch { throw EXIT; }
        const [output, _stderr, status] = await session.guard(Promise.all([...state.drains, state.wait, stdinClosed]));
        session.check();
        if (status?.exitCode !== 0) throw EXIT;
        children.delete(state);
        return output;
      } catch (error) {
        session.stop();
        await terminate(state);
        throw error;
      }
    }

    async function checkedRealpath(path) {
      session.check();
      const resolved = normalPath(await session.guard(fs.realpath(path)));
      if (!resolved) throw EXIT;
      return resolved;
    }
    async function readCwd(pid) {
      const text = await run("/usr/sbin/lsof", [...core.LSOF_CWD_ARGS(pid), "-u", String(ownUid)]);
      // The selector is authoritative; also reject unexpected PID records.
      const reported = text.split(/\r?\n/u).filter(line => line.startsWith("p"));
      if (!reported.length || reported.some(line => line !== `p${pid}`)) throw EXIT;
      const cwd = normalPath(core.parseLsofCwd(text));
      // lsof escapes nonprintable/locale-dependent names. Refuse escape forms
      // instead of interpreting them as a differently named literal folder.
      if (!cwd || /[\\^]/u.test(cwd) || deniedBy(cwd, rawDenied)) throw EXIT;
      return cwd;
    }

    async function inspect() {
      session.check();
      if (typeof runtime?.call !== "function" || typeof fs?.realpath !== "function" || typeof fs?.lstat !== "function" || typeof fs?.stat !== "function" || !bases.length) return null;
      if (ownUid === null) {
        const text = await run("/usr/bin/id", ["-u"], ARRIVAL_LIMITS.uidBytes);
        if (!/^[0-9]{1,10}\n?$/u.test(text) || !Number.isSafeInteger(Number(text.trim()))) throw EXIT;
        ownUid = Number(text.trim());
      }
      const listen = await run("/usr/sbin/lsof", [...core.LSOF_LISTEN_ARGS(core.loopbackPort(parsed.href)), "-u", String(ownUid)]);
      const pids = [...new Set(core.parseLsofListen(listen, { uid: ownUid }).map(record => record.pid))].slice(0, ARRIVAL_LIMITS.pids);
      // The parser saturates at eight; saturated evidence can conceal another
      // listener with a different root, so it cannot authorize an offer.
      if (!pids.length || pids.length === ARRIVAL_LIMITS.pids) return null;
      // Denied working directories are screened before any filesystem probing.
      const cwdRecords = [];
      for (const pid of pids) cwdRecords.push({ pid, raw: await readCwd(pid) });
      const checkedBases = [];
      for (const raw of bases) {
        if (deniedBy(raw, rawDenied)) continue;
        try {
          const canonical = await checkedRealpath(raw);
          if (canonical !== "/" && !deniedBy(canonical, rawDenied) && directory(await session.guard(fs.stat(canonical)))) checkedBases.push({ raw, canonical });
        } catch (error) { if (session.stopped) throw error; }
      }
      if (!checkedBases.length) return null;
      const canonicalHome = checkedBases.find(base => base.raw === rawHome)?.canonical ?? null;
      const denied = [...rawDenied, ...defaultsDenied(canonicalHome)];
      for (const raw of customDenied) {
        try { denied.push(await checkedRealpath(raw)); }
        catch (error) { if (session.stopped) throw error; }
      }
      const canonicalRoots = checkedBases.filter(base => base.raw !== rawHome).map(base => base.canonical);
      const selected = new Set();
      for (const record of cwdRecords) {
        record.canonical = await checkedRealpath(record.raw);
        if (deniedBy(record.canonical, denied)) throw EXIT;
        const candidates = core.rootCandidates(record.canonical, { home: canonicalHome, roots: canonicalRoots }).slice(0, ARRIVAL_LIMITS.candidates);
        if (!candidates.length || !directory(await session.guard(fs.stat(record.canonical)))) throw EXIT;
        const present = Object.create(null);
        for (const candidate of candidates) {
          if (deniedBy(candidate, denied) || await checkedRealpath(candidate) !== candidate || !directory(await session.guard(fs.stat(candidate)))) throw EXIT;
          const git = `${candidate}/.git`;
          const kind = gitKind(await session.guard(fs.lstat(git)));
          if (kind) {
            if (await checkedRealpath(git) !== git || gitKind(await session.guard(fs.lstat(git))) !== kind) throw EXIT;
            present[git] = kind;
          }
          if (await checkedRealpath(candidate) !== candidate) throw EXIT;
        }
        record.root = core.chooseArrivalRoot(candidates, present);
        if (!record.root) throw EXIT;
        selected.add(record.root);
        if (selected.size > 1) return null;
      }
      const root = [...selected][0];
      for (const base of checkedBases) if (await checkedRealpath(base.raw) !== base.canonical) throw EXIT;
      for (const record of cwdRecords) {
        if (await readCwd(record.pid) !== record.raw || await checkedRealpath(record.raw) !== record.canonical || await checkedRealpath(record.canonical) !== record.canonical) throw EXIT;
      }
      if (deniedBy(root, denied) || !checkedBases.some(base => root !== base.canonical && within(root, base.canonical)) || await checkedRealpath(root) !== root || !directory(await session.guard(fs.stat(root)))) throw EXIT;
      return core.arrivalOffer({ url: parsed.href, root, projects: await session.guard(Promise.resolve(getProjects())) });
    }

    try {
      const records = await session.guard(Promise.resolve(getProjects()));
      const known = core.matchSurfaceForUrl?.(records, parsed.href);
      if (known) return { kind: "known", project_id: known.project_id };
      if (core.loopbackPort(parsed.href) === null) return null;
      // Serial ownership avoids duplicate UID discovery and bounds concurrent
      // subprocesses. A queued request still retains its original deadline.
      const queued = queue.then(() => { session.check(); return inspect(); });
      queue = queued.catch(() => {});
      return await session.guard(queued);
    } catch { session.stop(); return null; }
    finally {
      session.close();
      await Promise.allSettled([...children].map(terminate));
    }
  }
  return Object.freeze({ discover });
}
