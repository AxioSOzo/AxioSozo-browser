/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Finding the user's AI clients in a way that survives their updates
// (chrome/lab/clients.sys.mjs): the exact argv the Lab runs, the no-model
// option checks derived from it, how their output is read (REAL outputs of
// Claude Code 2.1.295, Codex 0.162.0 and Antigravity 1.3.2 in
// fixtures/lab/probe-outputs.json), and discovery over a fake Subprocess and
// an in-memory file system. No real process starts.
import "./support/chrome-modules.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { binary, fakeSpawner, fakeTimers, fixtureJson, link, memoryFs, script } from "./support/lab-process-fakes.mjs";

const C = await import("../chrome/lab/clients.sys.mjs");
const OUTPUTS = fixtureJson("probe-outputs.json");
const EMPTY_MCP = "{\"mcpServers\":{}}";
const FORBIDDEN = /dangerously|bypass|skip-permissions|--yolo|full-access/iu;

test("one-shot answers: Claude Code with no tools, nothing persisted, no MCP, nobody to ask, Haiku by default", () => {
  assert.deepEqual(C.answerArgs("claude-code", { schema: { type: "object" } }), [
    "-p", "--input-format", "stream-json", "--output-format", "stream-json", "--verbose",
    "--no-session-persistence", "--safe-mode", "--strict-mcp-config", "--mcp-config", EMPTY_MCP,
    "--permission-prompts", "none", "--no-chrome", "--model", "haiku", "--max-budget-usd", "0.25",
    "--tools", "", "--json-schema", "{\"type\":\"object\"}"]);
  const reading = C.answerArgs("claude-code", { model: "sonnet", readOnlyProject: true });
  assert.deepEqual(reading.slice(reading.indexOf("--tools")), ["--tools", "Read,Glob,Grep", "--permission-mode", "plan"]);
  assert.equal(reading[reading.indexOf("--model") + 1], "sonnet");
  assert.equal(C.answerArgs("claude-code", { model: "bad model!" })[15], "haiku", "an odd model name falls back to the alias");
});

test("one-shot answers: Codex read-only and ephemeral in an empty folder; the prompt after --", () => {
  assert.deepEqual(C.answerArgs("codex", { cwd: "/run/cwd", prompt: "What is wrong?", imagePath: "/run/image.png", schemaPath: "/run/schema.json" }), [
    "exec", "--json", "--sandbox", "read-only", "--ephemeral", "--ignore-user-config", "--strict-config", "--skip-git-repo-check", "--cd", "/run/cwd",
    "-c", "model_reasoning_effort=\"low\"", "--output-schema", "/run/schema.json", "--image", "/run/image.png", "--", "What is wrong?"]);
});

test("one-shot answers: never Antigravity (its tools cannot be turned off); it says so wherever it is offered", () => {
  assert.throws(() => C.answerArgs("antigravity", { prompt: "Look." }), error => error.code === "UNSUPPORTED");
  assert.match(C.CLIENT_CAUTIONS.antigravity, /only for agent tasks/u);
});

test("tasks: Claude Code may edit files only, with our session id, a budget and nothing that prompts", () => {
  const args = C.taskArgs("claude-code", { sessionId: "3f0e6f8e-2b4a-4b7e-9a51-0c8a7f0f5c11", title: "AxioSozo: Fix the button", budgetUsd: 0.5, model: "haiku" });
  assert.deepEqual(args, ["-p", "--input-format", "stream-json", "--output-format", "stream-json", "--verbose",
    "--session-id", "3f0e6f8e-2b4a-4b7e-9a51-0c8a7f0f5c11", "--name", "AxioSozo: Fix the button",
    "--permission-mode", "acceptEdits", "--tools", "Read,Edit,Write,Glob,Grep", "--permission-prompts", "none", "--restricted",
    "--strict-mcp-config", "--mcp-config", EMPTY_MCP, "--no-chrome", "--max-budget-usd", "0.5", "--model", "haiku"]);
  const look = C.taskArgs("claude-code", { mayEdit: false, effort: "low" });
  assert.equal(look[look.indexOf("--permission-mode") + 1], "plan");
  assert.equal(look[look.indexOf("--tools") + 1], "Read,Glob,Grep");
  assert.equal(look[look.indexOf("--effort") + 1], "low");
  assert.equal(C.taskArgs("claude-code", { budgetUsd: 999 })[C.taskArgs("claude-code", { budgetUsd: 999 }).indexOf("--max-budget-usd") + 1], "5", "the cap is clamped");
});

test("tasks: Codex in the project with the workspace-write sandbox; Antigravity accept-edits, sandboxed", () => {
  assert.deepEqual(C.taskArgs("codex", { root: "/p", prompt: "Fix it.", imagePath: "/run/image.png", effort: "low" }), [
    "exec", "--json", "--cd", "/p", "--sandbox", "workspace-write", "--skip-git-repo-check", "--ignore-user-config", "--strict-config",
    "-c", "model_reasoning_effort=\"low\"", "--image", "/run/image.png", "--", "Fix it."]);
  assert.equal(C.taskArgs("codex", { root: "/p", mayEdit: false }).includes("read-only"), true);
  assert.deepEqual(C.taskArgs("antigravity", { prompt: "Fix it.", imagePath: "/run/image.png", imageDir: "/run" }), [
    "--print", "@/run/image.png\nFix it.", "--output-format", "stream-json", "--mode", "accept-edits", "--sandbox", "--add-dir", "/run"]);
  assert.equal(C.taskArgs("antigravity", { prompt: "x", mayEdit: false })[5], "plan");
});

test("no argv the Lab builds ever bypasses approvals or the sandbox", () => {
  for (const client of C.CLIENT_IDS) {
    for (const mayEdit of [true, false]) {
      for (const extra of [{}, { model: "opus", effort: "high", imagePath: "/i.png", imageDir: "/", schema: { type: "object" }, schemaPath: "/s.json", readOnlyProject: true }]) {
        const answer = client === "antigravity" ? [] : C.answerArgs(client, { ...extra, prompt: "p" });
        const all = [...answer, ...C.taskArgs(client, { ...extra, mayEdit, prompt: "p" }), ...C.probesFor(client, "/probe").flatMap(probe => probe.args)];
        assert.ok(!all.some(arg => FORBIDDEN.test(arg)), `${client}: ${all.join(" ")}`);
      }
    }
  }
});

test("hand-over: each client's own resume", () => {
  assert.deepEqual(C.resumeArgs("claude-code", "3f0e6f8e-2b4a-4b7e-9a51-0c8a7f0f5c11"), ["--resume", "3f0e6f8e-2b4a-4b7e-9a51-0c8a7f0f5c11"]);
  assert.deepEqual(C.resumeArgs("codex", "01a11dd0-2557-7cb2-aab5-a176ea84f22a"), ["resume", "01a11dd0-2557-7cb2-aab5-a176ea84f22a"]);
  assert.deepEqual(C.resumeArgs("antigravity", "c806fb74-839d-4fef-9fca-869d5f105aff"), ["--conversation", "c806fb74-839d-4fef-9fca-869d5f105aff"]);
  assert.throws(() => C.resumeArgs("codex", "x; rm -rf /"), error => error.code === "INVALID_SESSION");
  assert.throws(() => C.resumeArgs("other", "01a11dd0-2557"), error => error.code === "UNKNOWN_CLIENT");
});

test("the checks are the exact argv turned into a no-model call", () => {
  const [claudeAnswer, claudeTask] = C.probesFor("claude-code", "/probe");
  assert.deepEqual(claudeAnswer.args, C.answerArgs("claude-code", { schema: { type: "object" } }));
  assert.deepEqual(claudeAnswer.capabilities, ["answer", "image", "schema"]);
  assert.deepEqual(claudeTask.args.slice(-2), ["--no-session-persistence", "--safe-mode"], "no session file, no hooks or MCP while checking");
  assert.ok(claudeTask.args.includes("--restricted") && claudeTask.args.includes("acceptEdits"));
  const codex = C.probesFor("codex", "/probe");
  assert.ok(codex.every(probe => probe.args.at(-1) === "--version" && !probe.args.includes("--")), "clap checks every option before --version");
  assert.ok(codex[0].args.includes("--output-schema") && codex[0].args.includes("--image"));
  assert.deepEqual(codex[2].args, ["resume", "--version"]);
  assert.ok(codex.slice(0, 2).every(probe => probe.args.includes("--strict-config")), "runs name a renamed -c setting instead of ignoring it");
  const agy = C.probesFor("antigravity", "/probe");
  assert.deepEqual(agy.map(probe => probe.capabilities), [["task", "image", "resume"]], "Antigravity: agent tasks only");
  assert.ok(agy.every(probe => probe.args.at(-1) === "help" && !probe.args.includes("--print") && probe.needs.includes("--print")),
    "Go's flag parser checks the options before the help command; --print is checked in the help text");
});

test("reading the checks' REAL outputs", () => {
  const check = (client, name, needs = []) => C.classifyProbe(client, OUTPUTS[name], { needs });
  assert.deepEqual(check("claude-code", "claude-unknown-option"), { ok: false, option: "--bogus-flag-xyz", reason: "Claude Code changed an option we use: --bogus-flag-xyz" });
  assert.equal(check("claude-code", "claude-invalid-choice").option, "--permission-mode");
  assert.deepEqual(check("claude-code", "claude-input-missing"), { ok: true }, "options accepted, nothing to answer");
  assert.deepEqual(check("claude-code", "claude-stream-json-accepted"), { ok: true }, "stream-json with empty stdin ends quietly");
  assert.deepEqual(check("codex", "codex-accepted"), { ok: true });
  assert.equal(check("codex", "codex-unexpected-argument").option, "--bogus-flag-xyz");
  assert.equal(check("codex", "codex-invalid-value").option, "--sandbox");
  assert.deepEqual(check("antigravity", "agy-accepted", ["--print"]), { ok: true });
  assert.equal(check("antigravity", "agy-undefined-flag").option, "--bogus-flag-xyz");
  assert.equal(check("antigravity", "agy-invalid-value").option, "--print-timeout");
  assert.equal(check("antigravity", "agy-accepted", ["--prompt-v2"]).option, "--prompt-v2", "a flag missing from its help counts as changed");
  assert.equal(C.classifyProbe("codex", { timedOut: true }).reason, "Codex did not answer a quick check.");
  assert.equal(C.classifyProbe("codex", { spawnError: "x" }).reason, "Codex could not be started.");
  assert.equal(C.classifyProbe("claude-code", { exitCode: 1, stderr: "something else" }).ok, false);

  assert.equal(C.parseVersion("claude-code", OUTPUTS["claude-version"].stdout), "2.1.295");
  assert.equal(C.parseVersion("codex", OUTPUTS["codex-version"].stdout), "0.162.0");
  assert.equal(C.parseVersion("antigravity", OUTPUTS["agy-version"].stdout), "1.3.2");
  assert.equal(C.parseVersion("codex", "codex-cli 0.162.0-alpha.2"), "0.162.0-alpha.2");
  assert.equal(C.parseVersion("codex", "no version"), null);
  assert.equal(C.compareVersions("0.162.0", "0.144.3"), 1);
  assert.equal(C.compareVersions("1.3.2", "1.3.10"), -1);
  assert.equal(C.compareVersions("0.162.0", "0.162.0-alpha.2"), 1, "a release is newer than its pre-release");
  assert.equal(C.compareVersions("2.1.295", "2.1.295"), 0);
});

// ---- discovery over fakes ---------------------------------------------------------------------

const PATHS = "/home/.bun/bin:/home/.local/bin:/usr/bin";
const VERSIONS = { "/home/.local/share/claude/versions/2.1.295": "2.1.295 (Claude Code)", "/n/lib/node_modules/@openai/codex/bin/codex.js": "codex-cli 0.162.0",
  "/home/.bun/install/global/node_modules/@openai/codex/bin/codex.js": "codex-cli 0.144.3", "/home/.local/bin/agy": "1.3.2" };

function world({ files = {}, versions = VERSIONS, probe = () => ({ exitCode: 0, stdout: "" }) } = {}) {
  const fs = memoryFs({
    "/home/.local/bin/claude": link("/home/.local/share/claude/versions/2.1.295"),
    "/home/.local/share/claude/versions/2.1.295": binary({ mtime: 10 }),
    "/home/.local/bin/codex": link("/n/lib/node_modules/@openai/codex/bin/codex.js"),
    "/n/lib/node_modules/@openai/codex/bin/codex.js": script("#!/usr/bin/env node", { mtime: 20 }),
    "/n/bin/node": binary(),
    "/home/.local/bin/agy": binary({ mtime: 30 }),
    "/usr/bin/node": binary(),
    ...files,
  });
  const spawner = fakeSpawner((options, process) => {
    const args = options.arguments;
    const target = options.command.endsWith("/node") ? args[0] : options.command;
    const rest = options.command.endsWith("/node") ? args.slice(1) : args;
    if (rest.length === 1 && rest[0] === "--version") {
      if (versions[target] === undefined) { process.exit(1); return; }
      process.out(`${versions[target]}\n`);
      process.exit(0);
      return;
    }
    const outcome = probe(target, rest);
    if (outcome.stdout) process.out(outcome.stdout);
    if (outcome.stderr) process.err(outcome.stderr);
    process.exit(outcome.exitCode);
  });
  const timers = fakeTimers();
  let now = 1000;
  const runtime = { spawn: spawner.spawn, timers, clock: () => now, fs };
  const discovery = C.createClientDiscovery({ runtime, environment: { PATH: PATHS }, probeDir: async () => "/probe" });
  return { fs, spawner, discovery, advance: ms => { now += ms; } };
}
const codexProbeOk = (target, rest) => ({ exitCode: 0, stdout: rest.at(-1) === "--version" ? "codex-cli-exec 0.162.0\n" : "" });

test("not installed is calm and starts nothing", async () => {
  const { discovery, spawner, fs } = world();
  fs.files.delete("/home/.local/bin/agy");
  const status = await discovery.status("antigravity", { check: true });
  assert.equal(status.state, "missing");
  assert.equal(status.available, false);
  assert.equal(status.reason, "Not installed");
  assert.equal(spawner.calls.length, 0);
  await assert.rejects(discovery.launch("antigravity"), error => error.code === "CLIENT_UNAVAILABLE" && error.status.state === "missing");
});

test("without check only the files are found; a check reads the version and runs every probe once", async () => {
  const { discovery, spawner } = world({ probe: () => ({ exitCode: 0, stdout: "" }) });
  const unchecked = await discovery.status("claude-code");
  assert.equal(unchecked.state, "unchecked");
  assert.equal(unchecked.reason, "Claude Code found · not checked yet");
  assert.equal(spawner.calls.length, 0, "finding starts nothing");
  const ready = await discovery.status("claude-code", { check: true });
  assert.deepEqual({ ...ready, checkedAt: null }, { id: "claude-code", label: "Claude Code", version: "2.1.295",
    executable: "/home/.local/share/claude/versions/2.1.295", capabilities: ["answer", "image", "schema", "task", "agents"], checkedAt: null,
    note: null, state: "ready", available: true, reason: "Claude Code 2.1.295 · checked" });
  const commands = spawner.calls.map(call => [call.command, call.arguments.slice(0, 2).join(" ")]);
  assert.deepEqual(commands[0], ["/home/.local/share/claude/versions/2.1.295", "--version"]);
  assert.equal(spawner.calls.length, 3, "version + the one-shot check + the task check");
  assert.ok(spawner.calls.every(call => call.workdir === "/probe" && call.environmentAppend === false));
  assert.equal((await discovery.status("claude-code")).state, "ready", "the cached check");
  await discovery.status("claude-code", { check: true });
  assert.equal(spawner.calls.length, 3, "checked again within ten minutes: nothing starts");
  const launch = await discovery.launch("claude-code");
  assert.deepEqual([launch.command, launch.prefix, launch.path], ["/home/.local/share/claude/versions/2.1.295", [], "/home/.local/bin/claude"]);
});

test("an update (new file or version) is checked again; a same-version re-read after ten minutes reuses the probes", async () => {
  const { discovery, spawner, fs, advance } = world({ probe: () => ({ exitCode: 0, stdout: "" }) });
  await discovery.status("claude-code", { check: true });
  assert.equal(spawner.calls.length, 3);
  advance(C.RECHECK_MS + 1);
  await discovery.status("claude-code", { check: true });
  assert.equal(spawner.calls.length, 4, "only the version is read again");
  // Claude updates itself: the symlink now points at a new version file.
  fs.files.set("/home/.local/bin/claude", link("/home/.local/share/claude/versions/2.1.300"));
  fs.files.set("/home/.local/share/claude/versions/2.1.300", binary({ mtime: 99 }));
  VERSIONS["/home/.local/share/claude/versions/2.1.300"] = "2.1.300 (Claude Code)";
  const updated = await discovery.status("claude-code", { check: true });
  delete VERSIONS["/home/.local/share/claude/versions/2.1.300"];
  assert.equal(updated.reason, "Claude Code 2.1.300 · checked", "a version never seen before is fine when its check passes");
  assert.equal(spawner.calls.length, 7, "version + both probes again");
});

test("a changed option makes the client unavailable with the option named; partial support stays usable", async () => {
  const changed = world({ probe: () => ({ exitCode: 1, stderr: OUTPUTS["claude-unknown-option"].stderr.replace("--bogus-flag-xyz", "--permission-prompts") }) });
  const status = await changed.discovery.status("claude-code", { check: true });
  assert.equal(status.state, "changed");
  assert.equal(status.available, false);
  assert.equal(status.reason, "Claude Code changed an option we use: --permission-prompts");
  await assert.rejects(changed.discovery.launch("claude-code"), error => error.code === "CLIENT_UNAVAILABLE");

  const partial = world({ probe: (target, rest) => (rest.includes("--json-schema")
    ? { exitCode: 1, stderr: "error: unknown option '--json-schema'\n" } : { exitCode: 0, stdout: "" }) });
  const half = await partial.discovery.status("claude-code", { check: true });
  assert.equal(half.state, "partial");
  assert.equal(half.available, true);
  assert.deepEqual(half.capabilities, ["task", "agents"]);
  assert.equal(half.reason, "Claude Code changed an option we use: --json-schema");
});

test("several installs: the newest is used and an older one first on PATH is noted", async () => {
  const { discovery, spawner } = world({
    files: {
      "/home/.bun/bin/codex": link("/home/.bun/install/global/node_modules/@openai/codex/bin/codex.js"),
      "/home/.bun/install/global/node_modules/@openai/codex/bin/codex.js": script("#!/usr/bin/env node"),
    },
    probe: codexProbeOk,
  });
  const status = await discovery.status("codex", { check: true });
  assert.equal(status.version, "0.162.0");
  assert.equal(status.executable, "/n/lib/node_modules/@openai/codex/bin/codex.js");
  assert.equal(status.note, "An older Codex (0.144.3) comes first on PATH; AxioSozo uses 0.162.0.");
  const probes = spawner.calls.filter(call => call.arguments.includes("exec"));
  assert.ok(probes.every(call => call.command === "/n/bin/node" && call.arguments[0] === "/n/lib/node_modules/@openai/codex/bin/codex.js"),
    "the npm wrapper runs with the Node of its own install");
  const launch = await discovery.launch("codex");
  assert.equal(launch.path, "/home/.local/bin/codex", "Terminal hand-over uses that install's PATH entry");
  const located = await discovery.locate("codex");
  assert.equal(located.command, "/n/bin/node");
});

test("a client that does not report a version is broken, not ready; all three are reported in order", async () => {
  const { discovery } = world({ versions: { ...VERSIONS, "/home/.local/bin/agy": undefined }, probe: codexProbeOk });
  const all = await discovery.statuses({ check: true });
  assert.deepEqual(all.map(item => item.id), ["claude-code", "codex", "antigravity"]);
  assert.equal(all[2].state, "broken");
  assert.equal(all[2].reason, "Antigravity did not report its version.");
});

test("locate (for polling and hand-over) reads versions once per set of files, never the option checks", async () => {
  const { discovery, spawner, fs } = world();
  const first = await discovery.locate("claude-code");
  assert.deepEqual([first.command, first.path], ["/home/.local/share/claude/versions/2.1.295", "/home/.local/bin/claude"]);
  await discovery.locate("claude-code");
  assert.equal(spawner.calls.length, 1, "one --version, then cached");
  assert.ok(spawner.calls.every(call => call.arguments.join(" ") === "--version"));
  fs.files.set("/home/.local/share/claude/versions/2.1.295", binary({ mtime: 11 }));
  await discovery.locate("claude-code");
  assert.equal(spawner.calls.length, 2, "a changed file is read again");
  fs.files.delete("/home/.local/bin/claude");
  assert.equal(await discovery.locate("claude-code"), null);
});
