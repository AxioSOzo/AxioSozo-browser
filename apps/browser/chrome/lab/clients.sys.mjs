/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The user's own AI clients, found in a way that survives their updates.
//
// Pin capabilities, not versions (the Codex update that broke the browser was
// an exact-version pin). For each client:
//  1. find it on PATH as the project runner builds PATH (ProjectRunner
//     runEnvironment), resolve the real file behind the symlinks, and how to
//     start it (the Codex npm wrapper is a Node script: its own Node runs it);
//  2. read `--version` (no model call; any version is accepted);
//  3. check the exact options this file builds, with no model call:
//       Claude Code  `claude -p <the options> --safe-mode` with empty stdin:
//                    accepted options end quietly (or with "Input must be
//                    provided"); a changed one says "unknown option '--x'".
//                    (`claude --version` is never the check: it accepts anything.)
//       Codex        `codex exec <the options> --version`: clap checks every
//                    option first ("unexpected argument '--x'").
//       Antigravity  `agy <the options> help`: Go's flag parser checks them
//                    first ("flags provided but not defined: -x").
// The result is cached per (real path, modification time, size, version) and
// checked again when any of them changes. A version never seen before is fine
// when its check passes.
//
// Status, one per client:
//   { id, label, state, available, version, executable, capabilities, reason, checkedAt }
//   state: "unchecked" | "ready" | "partial" | "changed" | "missing" | "broken"
//   capabilities: what passed its check: "answer" (one-shot), "image", "schema",
//     "task" (works in a project), "resume" (hand-over), "agents" (Claude's
//     `agents --json` list).
//   reason: calm text: "Codex 0.162.0 · checked", "Claude Code changed an
//     option we use: --x", "Not installed".
import { findOnPath, isAbsolutePath, launchFor, oneLine, randomUuid, runOnce } from "./process.sys.mjs";

export const CLIENT_IDS = Object.freeze(["claude-code", "codex", "antigravity"]);
export const CLIENT_LABELS = Object.freeze({ "claude-code": "Claude Code", codex: "Codex", antigravity: "Antigravity" });
export const CLIENT_COMMANDS = Object.freeze({ "claude-code": "claude", codex: "codex", antigravity: "agy" });
export const EMPTY_MCP = JSON.stringify({ mcpServers: {} });
/** Default spending cap of one browser-started task (Claude Code's --max-budget-usd). */
export const DEFAULT_TASK_BUDGET_USD = 1;
export const MAX_TASK_BUDGET_USD = 5;
/** The cap of one one-shot answer. */
export const ANSWER_BUDGET_USD = 0.25;
export const DEFAULT_ANSWER_MODEL = "haiku";
const MODEL = /^[A-Za-z0-9][A-Za-z0-9._:\-[\]]{0,79}$/u;
const EFFORTS = Object.freeze(["low", "medium", "high"]);
/** How long a check stays good while the file does not change. */
export const RECHECK_MS = 10 * 60 * 1000;
const VERSION_TIMEOUT_MS = 8000;
const PROBE_TIMEOUT_MS = 20000;

export class ClientError extends Error {
  constructor(code, message = code) { super(message); this.name = "ClientError"; this.code = code; }
}

export const isModel = value => typeof value === "string" && MODEL.test(value);
const budgetText = usd => String(Math.round(Math.min(Math.max(usd, 0.01), MAX_TASK_BUDGET_USD) * 100) / 100);

// ---- what we run: one-shot answers ---------------------------------------------------------------

/**
 * The arguments of one one-shot answer (after the client's own launch prefix).
 *   { schema, model, cwd (the run's empty folder or a known project root),
 *     readOnlyProject, prompt, imagePath, schemaPath, imageDir, timeoutMs }
 * Claude reads the prompt and image on stdin (stream-json), nothing on disk.
 */
export function answerArgs(client, { schema = null, model = null, cwd = "/", readOnlyProject = false, prompt = "", imagePath = null,
  schemaPath = null, imageDir = null, timeoutMs = 120000 } = {}) {
  switch (client) {
    case "claude-code": {
      const args = ["-p", "--input-format", "stream-json", "--output-format", "stream-json", "--verbose",
        "--no-session-persistence", "--safe-mode", "--strict-mcp-config", "--mcp-config", EMPTY_MCP,
        "--permission-prompts", "none", "--no-chrome", "--model", isModel(model) ? model : DEFAULT_ANSWER_MODEL,
        "--max-budget-usd", String(ANSWER_BUDGET_USD)];
      if (readOnlyProject) args.push("--tools", "Read,Glob,Grep", "--permission-mode", "plan");
      else args.push("--tools", "");
      if (schema) args.push("--json-schema", JSON.stringify(schema));
      return args;
    }
    case "codex": {
      const args = ["exec", "--json", "--sandbox", "read-only", "--ephemeral", "--ignore-user-config", "--strict-config", "--skip-git-repo-check",
        "--cd", cwd, "-c", "model_reasoning_effort=\"low\""];
      if (isModel(model)) args.push("--model", model);
      if (schemaPath) args.push("--output-schema", schemaPath);
      if (imagePath) args.push("--image", imagePath);
      args.push("--", prompt);
      return args;
    }
    // Antigravity cannot be kept to "no tools": a custom agent's `tools: []` is
    // ignored and ~60 tools stay on (run_command, write_to_file, browser tools;
    // measured with 1.3.2 by the provider engine). It is used for agent tasks only.
    case "antigravity": throw new ClientError("UNSUPPORTED", "Antigravity cannot answer without its tools.");
    default: throw new ClientError("UNKNOWN_CLIENT");
  }
}

/** What the Lab says about a client wherever it offers it (one honest line), or null. */
export const CLIENT_CAUTIONS = Object.freeze({
  antigravity: "Antigravity keeps all its tools, including terminal commands and its own browser: the Lab uses it only for agent tasks.",
});

// ---- what we run: agent tasks in a project ------------------------------------------------------------

/**
 * The arguments of one task in a verified project root (the run's cwd).
 *   { sessionId (Claude: chosen by us), title, mayEdit, budgetUsd, model,
 *     effort, root, prompt, imagePath, imageDir }
 * Never a bypass flag. Claude: edits only (no shell, no web), anything that
 * would prompt is denied; --restricted also ignores the project's own
 * settings (its hooks) and keeps settings, git and tool configuration
 * read-only. Codex: the workspace-write sandbox (network off). Antigravity:
 * accept-edits with sandboxed terminal commands (its tool list cannot be
 * narrowed: the UI says so).
 */
export function taskArgs(client, { sessionId = null, title = "AxioSozo task", mayEdit = true, budgetUsd = DEFAULT_TASK_BUDGET_USD, model = null,
  effort = null, root = "/", prompt = "", imagePath = null, imageDir = null } = {}) {
  switch (client) {
    case "claude-code": {
      const args = ["-p", "--input-format", "stream-json", "--output-format", "stream-json", "--verbose",
        "--session-id", sessionId ?? randomUuid(), "--name", oneLine(title, 80) || "AxioSozo task",
        "--permission-mode", mayEdit ? "acceptEdits" : "plan", "--tools", mayEdit ? "Read,Edit,Write,Glob,Grep" : "Read,Glob,Grep",
        "--permission-prompts", "none", "--restricted", "--strict-mcp-config", "--mcp-config", EMPTY_MCP, "--no-chrome",
        "--max-budget-usd", budgetText(budgetUsd)];
      if (isModel(model)) args.push("--model", model);
      if (EFFORTS.includes(effort)) args.push("--effort", effort);
      return args;
    }
    case "codex": {
      const args = ["exec", "--json", "--cd", root, "--sandbox", mayEdit ? "workspace-write" : "read-only", "--skip-git-repo-check", "--ignore-user-config",
        "--strict-config"];
      if (EFFORTS.includes(effort)) args.push("-c", `model_reasoning_effort="${effort}"`);
      if (isModel(model)) args.push("--model", model);
      if (imagePath) args.push("--image", imagePath);
      args.push("--", prompt);
      return args;
    }
    case "antigravity": {
      const args = ["--print", imagePath ? `@${imagePath}\n${prompt}` : prompt, "--output-format", "stream-json",
        "--mode", mayEdit ? "accept-edits" : "plan", "--sandbox"];
      if (imageDir) args.push("--add-dir", imageDir);
      if (isModel(model)) args.push("--model", model);
      if (EFFORTS.includes(effort)) args.push("--effort", effort);
      return args;
    }
    default: throw new ClientError("UNKNOWN_CLIENT");
  }
}

/** How the user continues a session in their own terminal: argv after the executable. */
export function resumeArgs(client, sessionId) {
  if (typeof sessionId !== "string" || !/^[A-Za-z0-9-]{8,80}$/u.test(sessionId)) throw new ClientError("INVALID_SESSION");
  switch (client) {
    case "claude-code": return ["--resume", sessionId];
    case "codex": return ["resume", sessionId];
    case "antigravity": return ["--conversation", sessionId];
    default: throw new ClientError("UNKNOWN_CLIENT");
  }
}

// ---- the checks (no model call) -------------------------------------------------------------------

const SAMPLE = Object.freeze({ prompt: "check", title: "AxioSozo check" });

/**
 * The checks of one client: [{ capability, args, mode }] built from the very
 * argument builders above (so a check covers exactly what we run), turned
 * into a no-model call. `dir` is a private folder for placeholder paths
 * (nothing is written there; the clients do not read them while checking).
 */
export function probesFor(client, dir) {
  const place = name => `${dir}/${name}`;
  switch (client) {
    case "claude-code": {
      const answer = answerArgs(client, { schema: { type: "object" } });
      const task = [...taskArgs(client, { sessionId: randomUuid(), ...SAMPLE }), "--no-session-persistence", "--safe-mode"];
      return [
        { capabilities: ["answer", "image", "schema"], args: answer },
        { capabilities: ["task"], args: task },
      ];
    }
    case "codex": {
      const strip = args => args.slice(0, args.indexOf("--"));
      const answer = strip(answerArgs(client, { cwd: dir, schemaPath: place("schema.json"), imagePath: place("image.png"), ...SAMPLE }));
      const task = strip(taskArgs(client, { root: dir, imagePath: place("image.png"), effort: "low", ...SAMPLE }));
      return [
        { capabilities: ["answer", "image", "schema"], args: [...answer, "--version"] },
        { capabilities: ["task"], args: [...task, "--version"] },
        { capabilities: ["resume"], args: ["resume", "--version"] },
      ];
    }
    case "antigravity": {
      // Tasks only (no one-shot answers: see answerArgs).
      const task = taskArgs(client, { imageDir: dir, imagePath: place("image.png"), ...SAMPLE }).slice(2);
      return [
        { capabilities: ["task", "image", "resume"], args: [...task, "--conversation", "00000000-0000-4000-8000-000000000000", "help"], needs: ["--print"] },
      ];
    }
    default: throw new ClientError("UNKNOWN_CLIENT");
  }
}

/** The version a client printed, or null. */
export function parseVersion(client, text) {
  if (typeof text !== "string") return null;
  const match = /(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?)/u.exec(text);
  return match ? match[1] : null;
}

/**
 * What one check's output says: { ok: true } or { ok: false, option, reason }
 * where option is the changed option ("--x") when the client named one.
 */
export function classifyProbe(client, { exitCode = null, stdout = "", stderr = "", timedOut = false, spawnError = null } = {}, { needs = [] } = {}) {
  const label = CLIENT_LABELS[client] ?? "The client";
  const text = `${stderr}\n${stdout}`;
  if (spawnError) return { ok: false, option: null, reason: `${label} could not be started.` };
  if (timedOut) return { ok: false, option: null, reason: `${label} did not answer a quick check.` };
  const changed = option => ({ ok: false, option, reason: `${label} changed an option we use: ${option}` });
  if (client === "claude-code") {
    let match = /unknown option '(-{1,2}[A-Za-z0-9-]+)'/u.exec(text);
    if (match) return changed(match[1]);
    match = /option '(-{1,2}[A-Za-z0-9-]+)[^']*' argument '[^']*' is invalid/u.exec(text);
    if (match) return changed(match[1]);
    if (/Input must be provided/u.test(text)) return { ok: true };
    if (exitCode === 0 && !/^error:/imu.test(text)) return { ok: true };
    match = /^error: .*?(--[A-Za-z0-9-]+)/imu.exec(text);
    if (match) return changed(match[1]);
    return { ok: false, option: null, reason: `${label} did not accept a quick check.` };
  }
  if (client === "codex") {
    let match = /unexpected argument '(-{1,2}[A-Za-z0-9-]+)'/u.exec(text);
    if (match) return changed(match[1]);
    match = /invalid value '[^']*' for '(-{1,2}[A-Za-z0-9-]+)/u.exec(text);
    if (match) return changed(match[1]);
    if (exitCode === 0 && parseVersion(client, stdout)) return { ok: true };
    return { ok: false, option: null, reason: `${label} did not accept a quick check.` };
  }
  if (client === "antigravity") {
    let match = /flags? provided but not defined: -{1,2}([A-Za-z0-9-]+)/u.exec(text);
    if (match) return changed(`--${match[1]}`);
    match = /invalid value "[^"]*" for flag -{1,2}([A-Za-z0-9-]+)/u.exec(text);
    if (match) return changed(`--${match[1]}`);
    if (!/Usage of agy/u.test(text)) return { ok: false, option: null, reason: `${label} did not accept a quick check.` };
    for (const option of needs) if (!text.split(/\s+/u).includes(option)) return changed(option);
    return { ok: true };
  }
  return { ok: false, option: null, reason: `${label} is unknown.` };
}

// ---- discovery ------------------------------------------------------------------------------------

const freeze = status => Object.freeze({ ...status, capabilities: Object.freeze([...(status.capabilities ?? [])]) });
const base = id => ({ id, label: CLIENT_LABELS[id], version: null, executable: null, capabilities: [], checkedAt: null, note: null });

/** The status of a client that is not on this Mac. */
export const missingStatus = id => freeze({ ...base(id), state: "missing", available: false, reason: "Not installed" });

/** -1, 0 or 1: semantic versions by number; a release is newer than its pre-releases. */
export function compareVersions(a, b) {
  const split = text => { const [core, pre = ""] = String(text).split("-", 2); return { nums: core.split(".").map(part => Number.parseInt(part, 10) || 0), pre }; };
  const x = split(a), y = split(b);
  for (let at = 0; at < Math.max(x.nums.length, y.nums.length); at++) {
    const d = (x.nums[at] ?? 0) - (y.nums[at] ?? 0);
    if (d) return d > 0 ? 1 : -1;
  }
  if (x.pre === y.pre) return 0;
  if (!x.pre) return 1;
  if (!y.pre) return -1;
  return x.pre > y.pre ? 1 : -1;
}

const MAX_CANDIDATES = 4;

/**
 * createClientDiscovery({ runtime, environment, probeDir })
 *   runtime: { spawn, timers, clock, fs: { isExecutableFile, realpath, stat, readHead } }
 *   environment: the clients' environment (labEnvironment); its PATH is searched
 *   probeDir(): a private folder for placeholder paths and the checks' cwd
 * Every install of a client on PATH is considered (a Mac can have several:
 * an old global from another package manager can come first), and the newest
 * version is used; `note` says when an older one comes first.
 * Returns:
 *   status(id, { check = false, force = false }) → Promise<status>
 *     check false: finds the files only (no process starts); a cached check of
 *     the same files is returned, else state "unchecked".
 *     check true: reads the versions and checks the options when a file or
 *     version changed (or after RECHECK_MS, or with force).
 *   statuses(options) → Promise<status[]> for every client, in CLIENT_IDS order
 *   launch(id) → Promise<{ command, prefix, path, status }> for a checked,
 *     available client (checks it when needed); rejects CLIENT_UNAVAILABLE
 *   locate(id) → Promise<{ command, prefix, path } | null> without the option checks
 */
export function createClientDiscovery({ runtime, environment, probeDir }) {
  const cache = new Map(); // id → { key, setKey, status, launch, path, at }
  const pending = new Map(); // id → promise of a running check
  const located = new Map(); // id → { setKey, value } found without a check (locate)
  const path = environment?.PATH ?? "/usr/bin:/bin";
  const now = () => (typeof runtime.clock === "function" ? runtime.clock() : Date.now());

  /** Every distinct install of `id` on PATH, in PATH order: { list, setKey } or null. */
  async function find(id) {
    const name = CLIENT_COMMANDS[id];
    if (!name) throw new ClientError("UNKNOWN_CLIENT");
    const list = [];
    const seen = new Set();
    for (const dir of path.split(":")) {
      if (list.length >= MAX_CANDIDATES) break;
      const entry = await findOnPath(name, dir, runtime.fs);
      if (!entry) continue;
      let real = entry;
      try { real = await runtime.fs.realpath(entry); } catch { real = entry; }
      if (!isAbsolutePath(real) || seen.has(real)) continue;
      seen.add(real);
      let stat = null;
      try { stat = await runtime.fs.stat(real); } catch { stat = null; }
      list.push({ entry, real, fileKey: `${entry}\u0000${real}\u0000${stat?.mtime ?? ""}\u0000${stat?.size ?? ""}` });
    }
    return list.length ? { list, setKey: list.map(item => item.fileKey).join("\u0001") } : null;
  }

  /** Reads every candidate's version and picks the newest: { chosen, launch, version, note, failure } */
  async function choose(id, found) {
    const label = CLIENT_LABELS[id];
    const dir = await probeDir();
    const read = await Promise.all(found.list.map(async candidate => {
      const launch = await launchFor(candidate.real, { fs: runtime.fs, path });
      if (!launch) return { candidate, launch: null, version: null, failure: `${label} is installed but its runtime is missing.` };
      const out = await runOnce(runtime, { command: launch.command, args: [...launch.prefix, "--version"], workdir: dir, environment,
        timeoutMs: VERSION_TIMEOUT_MS, maxChars: 4096 });
      const version = parseVersion(id, out.stdout) ?? parseVersion(id, out.stderr);
      return { candidate, launch, version, failure: version ? null : out.spawnError ? `${label} could not be started.` : `${label} did not report its version.` };
    }));
    let best = null;
    for (const item of read) if (item.version && (!best || compareVersions(item.version, best.version) > 0)) best = item;
    if (!best) return { chosen: found.list[0], launch: null, version: null, note: null, failure: read[0].failure, versions: "" };
    const first = read[0];
    const note = best === first ? null : first.version
      ? `An older ${label} (${first.version}) comes first on PATH; AxioSozo uses ${best.version}.`
      : `Another ${label} on PATH did not start; AxioSozo uses ${best.version}.`;
    return { chosen: best.candidate, launch: best.launch, version: best.version, note, failure: null, versions: read.map(item => item.version ?? "").join(",") };
  }

  async function check(id, found) {
    const label = CLIENT_LABELS[id];
    const picked = await choose(id, found);
    if (!picked.version) {
      return { status: freeze({ ...base(id), executable: picked.chosen.real, state: "broken", available: false, reason: picked.failure }), picked };
    }
    const key = `${found.setKey}\u0002${picked.versions}`;
    const cached = cache.get(id);
    if (cached && cached.key === key && cached.launch) return { reuse: true, picked, key };
    const dir = await probeDir();
    const probes = probesFor(id, dir);
    const results = await Promise.all(probes.map(async probe => {
      const outcome = await runOnce(runtime, { command: picked.launch.command, args: [...picked.launch.prefix, ...probe.args], workdir: dir, environment,
        timeoutMs: PROBE_TIMEOUT_MS, maxChars: 16384 });
      return { probe, verdict: classifyProbe(id, outcome, { needs: probe.needs ?? [] }) };
    }));
    const capabilities = [...new Set(results.filter(item => item.verdict.ok).flatMap(item => item.probe.capabilities))];
    if (id === "claude-code" && capabilities.length) capabilities.push("agents");
    const failed = results.find(item => !item.verdict.ok);
    const available = capabilities.includes("answer") || capabilities.includes("task");
    const state = !failed ? "ready" : !available ? (failed.verdict.option ? "changed" : "broken") : "partial";
    const reason = !failed ? `${label} ${picked.version} · checked` : failed.verdict.reason;
    return { status: freeze({ ...base(id), version: picked.version, executable: picked.chosen.real, capabilities, checkedAt: now(), state, available, reason,
      note: [picked.note, CLIENT_CAUTIONS[id]].filter(Boolean).join(" ") || null }), picked, key, launch: available ? picked.launch : null };
  }

  async function status(id, { check: wantCheck = false, force = false } = {}) {
    if (!CLIENT_IDS.includes(id)) throw new ClientError("UNKNOWN_CLIENT");
    const found = await find(id);
    if (!found) { cache.delete(id); return missingStatus(id); }
    const cached = cache.get(id);
    const sameFiles = cached && cached.setKey === found.setKey;
    if (sameFiles && !force && (!wantCheck || now() - cached.at < RECHECK_MS)) return cached.status;
    if (!wantCheck) return freeze({ ...base(id), executable: found.list[0].real, state: "unchecked", available: false, reason: `${CLIENT_LABELS[id]} found · not checked yet` });
    if (pending.has(id)) return pending.get(id);
    const run = (async () => {
      const outcome = await check(id, found);
      if (outcome.reuse) {
        const entry = cache.get(id);
        entry.at = now();
        entry.setKey = found.setKey;
        return entry.status;
      }
      if (outcome.key) cache.set(id, { key: outcome.key, setKey: found.setKey, status: outcome.status, launch: outcome.launch, path: outcome.picked.chosen.entry, at: now() });
      else cache.delete(id);
      return outcome.status;
    })().finally(() => pending.delete(id));
    pending.set(id, run);
    return run;
  }

  return Object.freeze({
    status,
    statuses: options => Promise.all(CLIENT_IDS.map(id => status(id, options).catch(error => {
      console.error(`AxioSozo Lab: ${id} could not be checked`, error);
      return freeze({ ...base(id), state: "broken", available: false, reason: `${CLIENT_LABELS[id]} could not be checked.` });
    }))),
    async launch(id) {
      const result = await status(id, { check: true });
      const entry = cache.get(id);
      if (!result.available || !entry?.launch) throw Object.assign(new ClientError("CLIENT_UNAVAILABLE", result.reason), { status: result });
      return Object.freeze({ command: entry.launch.command, prefix: entry.launch.prefix, path: entry.path, status: result });
    },
    /**
     * How to start a client that is on this Mac, without checking its options
     * (for `claude agents --json` and Terminal hand-over): { command, prefix,
     * path } (path: the PATH entry of the install in use), or null.
     */
    async locate(id) {
      const found = await find(id);
      if (!found) return null;
      const cached = cache.get(id);
      if (cached?.launch && cached.setKey === found.setKey) return Object.freeze({ command: cached.launch.command, prefix: cached.launch.prefix, path: cached.path });
      // Polling asks every 15 s: the versions are read again only when a file changed.
      const known = located.get(id);
      if (known && known.setKey === found.setKey) return known.value;
      const picked = await choose(id, found);
      const value = picked.launch ? Object.freeze({ command: picked.launch.command, prefix: picked.launch.prefix, path: picked.chosen.entry }) : null;
      located.set(id, { setKey: found.setKey, value });
      return value;
    },
    /** The cached status of each client, without finding or starting anything. */
    cached: () => CLIENT_IDS.map(id => cache.get(id)?.status ?? null),
    forget(id) { cache.delete(id); },
  });
}
