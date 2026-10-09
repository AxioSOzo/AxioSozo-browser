/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The Lab's process plumbing (chrome/lab/process.sys.mjs) with a scripted
// fake Subprocess, an in-memory file system and manual timers: no process,
// shell or file is real. The supervisor script itself was exercised live
// against Codex and Claude Code (notes/lab/platform.md); here its text and
// the way it is called are pinned.
import "./support/chrome-modules.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { binary, fakeSpawner, fakeTimers, link, memoryFs, script, settle, supervised } from "./support/lab-process-fakes.mjs";

const P = await import("../chrome/lab/process.sys.mjs");

const runtime = (spawner, timers = fakeTimers(), fs = memoryFs()) => ({ spawn: spawner.spawn, timers, clock: () => timers.now, fs });

test("the supervisor runs the client in its own process group and escalates interrupt → TERM → KILL", () => {
  const text = P.SUPERVISOR;
  assert.ok(!/^exec \d>/mu.test(text) && !/\d>&\d/u.test(text.replace(/2>\/dev\/null/gu, "")),
    "no extra descriptors: dup2 over an inherited guarded fd gets the shell SIGKILLed on macOS");
  assert.match(text, /^set -m$/mu, "job control: the client gets its own process group");
  assert.match(text, /"\$@" <\/dev\/null &/u, "lease mode: the client reads nothing");
  assert.match(text, /else "\$@" & fi/u, "pipe mode: the client reads the supervisor's stdin");
  assert.match(text, /while read -r _; do :; done; kill -TERM \$\$/u, "the lease: end of stdin stops the run");
  assert.match(text, /stop\(\) \{ kill -"\$first" -"\$child" 2>\/dev\/null; reap 10; kill -TERM -"\$child" 2>\/dev\/null; reap 20; kill -KILL -"\$child" 2>\/dev\/null; \}/u,
    "first the client's interrupt, SIGTERM after 1 s (Codex may ignore SIGINT), SIGKILL 2 s later, always to the group");
  assert.match(text, /trap 'stop; .*exit 143' TERM INT HUP/u);
  assert.match(text, /^wait "\$child" 2>\/dev\/null$/mu, "the shell's job notices stay out of the stderr tail");
  assert.match(text, /kill -TERM -"\$child" 2>\/dev\/null\nexit "\$code"$/u, "a finished client's leftovers in its group are ended");
  assert.ok(!/\$\{|eval|`/u.test(text), "nothing is interpolated into the script");
});

test("findOnPath takes the first executable file and skips relative or odd folders", async () => {
  const fs = memoryFs({ "/b/claude": binary(), "/c/claude": binary(), "/a/claude": { dir: true } });
  assert.equal(await P.findOnPath("claude", "relative:/a:/b:/c", fs), "/b/claude");
  assert.equal(await P.findOnPath("claude", "/x:/y", fs), null);
  assert.equal(await P.findOnPath("../claude", "/b", fs), null, "a name is a plain name");
});

test("launchFor runs a binary itself and a Node script with the Node it was installed for", async () => {
  const fs = memoryFs({
    "/bin/claude-real": binary(),
    "/n/lib/node_modules/@openai/codex/bin/codex.js": script("#!/usr/bin/env node"),
    "/n/bin/node": binary(),
    "/g/node_modules/codex/bin/codex.js": script("#!/usr/bin/env node"),
    "/p/node": binary(),
    "/s/tool": script("#!/bin/sh"),
    "/bin/sh": binary(),
    "/m/tool": script("#!/usr/bin/env missing-interp"),
  });
  assert.deepEqual(await P.launchFor("/bin/claude-real", { fs, path: "/p" }), { command: "/bin/claude-real", prefix: [] });
  assert.deepEqual(await P.launchFor("/n/lib/node_modules/@openai/codex/bin/codex.js", { fs, path: "/p" }),
    { command: "/n/bin/node", prefix: ["/n/lib/node_modules/@openai/codex/bin/codex.js"] }, "the sibling Node of the install prefix");
  assert.deepEqual(await P.launchFor("/g/node_modules/codex/bin/codex.js", { fs, path: "/p" }),
    { command: "/p/node", prefix: ["/g/node_modules/codex/bin/codex.js"] }, "else the first Node on PATH");
  assert.deepEqual(await P.launchFor("/s/tool", { fs, path: "/p" }), { command: "/bin/sh", prefix: ["/s/tool"] });
  assert.equal(await P.launchFor("/m/tool", { fs, path: "/p" }), null, "a missing interpreter: not startable");
});

test("readLines splits across chunks, keeps UTF-8 split across reads, skips an over-long line and stops a flood", async () => {
  const spawner = fakeSpawner(() => {});
  const process = (await spawner.spawn({ command: "/x" }));
  const lines = [];
  const done = P.readLines(process.stdout, line => lines.push(line), { maxLineChars: 20, maxBytes: 1000 });
  const euro = new TextEncoder().encode("€");
  process.out("{\"a\":1}\r\n{\"b\"");
  process.out(":2}\n");
  process.stdout.push(new Uint8Array([0x7b, 0x22, euro[0]]));
  process.stdout.push(new Uint8Array([euro[1], euro[2], 0x22, 0x7d, 0x0a]));
  process.out(`${"x".repeat(15)}`);
  process.out(`${"y".repeat(15)}\nafter\n\n   \nlast`);
  process.stdout.end();
  const result = await done;
  assert.deepEqual(lines, ["{\"a\":1}", "{\"b\":2}", "{\"€\"}", "after", "last"]);
  assert.equal(result.skipped, 1, "the 30-character line was skipped whole");

  const flood = (await spawner.spawn({ command: "/x" }));
  const reading = P.readLines(flood.stdout, () => {}, { maxBytes: 10 });
  flood.out("0123456789abcdef\n");
  await assert.rejects(reading, error => error.code === "OUTPUT_LIMIT");
});

test("startSupervised starts /bin/sh with the fixed script and the client's argv, environment not inherited", async () => {
  const spawner = fakeSpawner(() => {});
  const run = await P.startSupervised(runtime(spawner), { mode: "pipe", firstSignal: "TERM", command: "/c/claude", args: ["-p", "--x", ""],
    workdir: "/w", environment: { PATH: "/usr/bin" }, onLine: () => {} });
  const options = spawner.calls[0];
  assert.equal(options.command, "/bin/sh");
  assert.deepEqual(options.arguments, ["-c", P.SUPERVISOR, "axiosozo-lab", "pipe", "TERM", "/c/claude", "-p", "--x", ""]);
  assert.equal(options.environmentAppend, false);
  assert.deepEqual(options.environment, { PATH: "/usr/bin" });
  assert.equal(options.workdir, "/w");
  assert.equal(options.stderr, "pipe");
  assert.deepEqual(supervised(options), { mode: "pipe", firstSignal: "TERM", command: "/c/claude", args: ["-p", "--x", ""] });
  assert.equal(await run.write("{}\n"), true);
  assert.deepEqual(spawner.processes[0].writes, ["{}\n"]);
  spawner.processes[0].exit(0);
  await run.finished;

  await assert.rejects(P.startSupervised(runtime(spawner), { mode: "other", firstSignal: "TERM", command: "/c", workdir: "/w", onLine() {} }),
    error => error.code === "INVALID_SPEC");
  await assert.rejects(P.startSupervised(runtime(spawner), { mode: "lease", firstSignal: "KILL", command: "/c", workdir: "/w", onLine() {} }),
    error => error.code === "INVALID_SPEC", "only INT or TERM may come first");
  await assert.rejects(P.startSupervised(runtime(spawner), { mode: "lease", firstSignal: "INT", command: "relative", workdir: "/w", onLine() {} }),
    error => error.code === "INVALID_SPEC");
  const failing = { spawn: async () => { throw new Error("no"); }, timers: fakeTimers() };
  await assert.rejects(P.startSupervised(failing, { mode: "lease", firstSignal: "INT", command: "/c", workdir: "/w", onLine() {} }),
    error => error.code === "SPAWN_FAILED");
});

test("a run delivers lines, keeps a stderr tail and reports its exit", async () => {
  const spawner = fakeSpawner((options, process) => {
    process.line({ type: "a" });
    process.err("warning: one\n");
    process.line({ type: "b" });
    process.exit(3);
  });
  const lines = [];
  const run = await P.startSupervised(runtime(spawner), { mode: "lease", firstSignal: "INT", command: "/c", workdir: "/w", environment: {},
    onLine: line => lines.push(JSON.parse(line).type) });
  const outcome = await run.finished;
  assert.deepEqual(lines, ["a", "b"]);
  assert.deepEqual(outcome, { exitCode: 3, stderr: "warning: one\n", outputError: null });
  assert.equal(run.ended, true);
  assert.equal(await run.write("x"), false, "lease mode never writes");
});

test("stop in pipe mode: the interrupt first, stdin closes, the supervisor is signalled only after the grace", async () => {
  const timers = fakeTimers();
  const spawner = fakeSpawner(() => {});
  const run = await P.startSupervised(runtime(spawner, timers), { mode: "pipe", firstSignal: "TERM", command: "/c", workdir: "/w", environment: {}, onLine() {} });
  const process = spawner.processes[0];
  run.stop({ beforeClose: () => run.write("interrupt\n") });
  await settle();
  assert.deepEqual(process.writes, ["interrupt\n"]);
  assert.equal(process.stdinClosed, false, "stdin stays open for the interrupt's answer");
  await timers.advance(1500);
  assert.equal(process.stdinClosed, true);
  assert.deepEqual(process.kills, []);
  await timers.advance(1500);
  assert.deepEqual(process.kills, [P.SUPERVISOR_KILL_MS], "then SIGTERM to the supervisor, which stops the group");
  await run.finished;
});

test("stop in lease mode closes the lease at once; the kill is only a late fallback; kill() is immediate", async () => {
  const timers = fakeTimers();
  const spawner = fakeSpawner(() => {});
  const run = await P.startSupervised(runtime(spawner, timers), { mode: "lease", firstSignal: "INT", command: "/c", workdir: "/w", environment: {}, onLine() {} });
  const process = spawner.processes[0];
  process.onStdinClose = () => setTimeout(() => process.exit(143), 0); // the supervisor stops the group
  run.stop();
  await settle();
  assert.equal(process.stdinClosed, true);
  const outcome = await run.finished;
  assert.equal(outcome.exitCode, 143);
  await timers.advance(10000);
  assert.deepEqual(process.kills, [], "it ended before the fallback");

  const other = await P.startSupervised(runtime(spawner, timers), { mode: "lease", firstSignal: "INT", command: "/c", workdir: "/w", environment: {}, onLine() {} });
  other.kill();
  await other.finished;
  assert.equal(spawner.processes[1].stdinClosed, true);
  assert.deepEqual(spawner.processes[1].kills, [P.SUPERVISOR_KILL_MS]);
});

test("too much output ends the run", async () => {
  const spawner = fakeSpawner((options, process) => { process.out("x".repeat(64)); });
  const run = await P.startSupervised(runtime(spawner), { mode: "lease", firstSignal: "INT", command: "/c", workdir: "/w", environment: {},
    onLine() {}, maxBytes: 16 });
  const outcome = await run.finished;
  assert.equal(outcome.outputError, "OUTPUT_LIMIT");
  assert.equal(spawner.processes[0].kills.length, 1);
});

test("runOnce closes stdin, collects both outputs and kills on timeout", async () => {
  const timers = fakeTimers();
  const spawner = fakeSpawner((options, process) => {
    if (options.arguments[0] === "hang") return;
    process.out("out\n");
    process.err("err\n");
    process.exit(2);
  });
  const done = await P.runOnce(runtime(spawner, timers), { command: "/c", args: ["--version"], workdir: "/w", environment: { A: "1" } });
  assert.deepEqual(done, { exitCode: 2, stdout: "out\n", stderr: "err\n", timedOut: false, spawnError: null });
  assert.equal(spawner.processes[0].stdinClosed, true);
  assert.deepEqual(spawner.calls[0].arguments, ["--version"]);
  assert.equal(spawner.calls[0].environmentAppend, false);

  const hanging = P.runOnce(runtime(spawner, timers), { command: "/c", args: ["hang"], timeoutMs: 50 });
  await settle();
  await timers.advance(50);
  const result = await hanging;
  assert.equal(result.timedOut, true);
  assert.deepEqual(spawner.processes[1].kills, [500]);

  const failed = await P.runOnce({ spawn: async () => { throw new Error("ENOENT"); }, timers }, { command: "/c" });
  assert.equal(failed.spawnError, "ENOENT");
  assert.equal((await P.runOnce(runtime(spawner, timers), { command: "relative" })).spawnError, "INVALID_SPEC");
});

test("scratch folders: 0700 per run, 0600 files, removed when done and on the next start", async () => {
  const fs = memoryFs();
  const scratch = P.createScratch({ fs, root: "/profile/axiosozo-lab" });
  const run = await scratch.runDir("a-0123abcd");
  assert.equal(run.dir, "/profile/axiosozo-lab/runs/a-0123abcd");
  assert.equal(run.cwd, `${run.dir}/cwd`);
  for (const path of ["/profile/axiosozo-lab", "/profile/axiosozo-lab/runs", run.dir, run.cwd]) assert.equal(fs.files.get(path)?.mode, 0o700, path);
  const image = await run.write("image.png", new Uint8Array([1, 2, 3]));
  assert.equal(image, `${run.dir}/image.png`);
  assert.equal(fs.files.get(image).mode, 0o600);
  await assert.rejects(run.write("../escape", new Uint8Array(1)), error => error.code === "INVALID_FILE_NAME");
  await assert.rejects(scratch.runDir("../x"), error => error.code === "INVALID_RUN_ID");
  await run.remove();
  assert.equal([...fs.files.keys()].some(key => key.startsWith(run.dir)), false);

  const left = await scratch.runDir("t-left");
  await left.write("image.png", new Uint8Array([9]));
  const dir = await scratch.handoverDir();
  await fs.writeFile(`${dir}/continue.command`, new Uint8Array([1]), 0o700);
  await scratch.cleanLeftovers();
  assert.equal([...fs.files.keys()].some(key => key.includes("/runs/") || key.includes("/handover")), false, "a crash leaves nothing behind");
  assert.throws(() => P.createScratch({ fs, root: "relative" }), error => error.code === "INVALID_SCRATCH");
});

test("small helpers", () => {
  assert.equal(P.oneLine("  a\n\tb  ", 10), "a b");
  assert.equal(P.oneLine("abcdefghij", 5), "abcd…");
  assert.equal(P.oneLine(null), "");
  assert.equal(P.base64(new Uint8Array([104, 105])), "aGk=");
  assert.match(P.randomUuid(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u);
  assert.match(P.randomHex(6), /^[0-9a-f]{12}$/u);
  assert.equal(P.isAbsolutePath("/a/b"), true);
  assert.equal(P.isAbsolutePath("/a/../b"), false);
  assert.equal(P.isAbsolutePath("a"), false);
  assert.equal(P.trimSlashes("/a/b//"), "/a/b");
  assert.equal(P.trimSlashes("/"), "/");
  assert.equal(P.basename("/a/b/c.txt"), "c.txt");
  assert.equal(P.dirname("/a/b/c.txt"), "/a/b");
  const env = P.labEnvironment({ get: name => ({ PATH: "/custom", HOME: "/h", SHELL: "/bin/zsh", MOZ_X: "1", AXIOSOZO_SECRET: "x" })[name] ?? null, home: "/h" });
  assert.ok(env.PATH.startsWith("/h/.bun/bin:/h/.local/bin"), "a terminal's PATH (ProjectRunner.runEnvironment)");
  assert.ok(env.PATH.includes("/custom"));
  assert.equal(env.MOZ_X, undefined, "nothing of the browser's own environment");
  assert.equal(env.AXIOSOZO_SECRET, undefined);
  assert.equal(env.NO_COLOR, "1");
});

test("an executable found through a symlink is reported as its PATH entry", async () => {
  const fs = memoryFs({ "/u/bin/claude": link("/u/versions/2.1.295"), "/u/versions/2.1.295": binary() });
  assert.equal(await P.findOnPath("claude", "/u/bin", fs), "/u/bin/claude");
  assert.equal(await fs.realpath("/u/bin/claude"), "/u/versions/2.1.295");
});
