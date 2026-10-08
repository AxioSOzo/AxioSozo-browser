/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// ctx.ai (chrome/lab/ai.sys.mjs): the facade experiments call and the CLI
// backend behind it, over a fake Subprocess that replays REAL recorded
// streams (fixtures/lab) and an in-memory profile folder. No real process.
import "./support/chrome-modules.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { fakeSpawner, fakeTimers, fixtureLines, memoryFs, settle, supervised } from "./support/lab-process-fakes.mjs";

const A = await import("../chrome/lab/ai.sys.mjs");
const { createScratch } = await import("../chrome/lab/process.sys.mjs");

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);
const SCHEMA = { type: "object", required: ["options"], properties: { options: { type: "array", maxItems: 3, items: { type: "object",
  properties: { kind: { enum: ["a", "b"] }, label: { type: "string", maxLength: 80 }, confidence: { type: "number", minimum: 0, maximum: 1 } } } } } };
const ready = (id, capabilities = ["answer", "image", "schema", "task"]) => Object.freeze({ id, state: "ready", available: true, version: "1.0.0",
  capabilities: Object.freeze(capabilities), reason: `${id} · checked` });

function fakeDiscovery(statuses) {
  return {
    async status(id) { return statuses[id] ?? { id, state: "missing", available: false, capabilities: [], reason: "Not installed" }; },
    async launch(id) {
      const status = statuses[id];
      if (!status?.available) throw Object.assign(new Error("CLIENT_UNAVAILABLE"), { code: "CLIENT_UNAVAILABLE", status: status ?? { reason: "Not installed" } });
      return { command: `/clients/${id}`, prefix: [], path: `/clients/${id}`, status };
    },
  };
}
const until = async (condition, rounds = 200) => { for (let i = 0; i < rounds && !condition(); i++) await settle(2); };

/** Replays `fixture` once the client has its input; ends when stdin closes (Claude) or after the last line. */
function replay(fixture, { waitForInput = false, exitCode = 0, endOnClose = false, stderr = "" } = {}) {
  return async (options, process) => {
    if (!supervised(options)) { process.exit(0); return; }
    if (waitForInput) await until(() => process.writes.length > 0);
    if (endOnClose) process.onStdinClose = () => process.exit(exitCode);
    for (const line of fixtureLines(fixture)) process.line(line);
    if (stderr) process.err(stderr);
    if (!endOnClose) process.exit(exitCode);
  };
}

function backend({ statuses = { "claude-code": ready("claude-code"), codex: ready("codex") }, handler, projects = null }) {
  const spawner = fakeSpawner(handler);
  const fs = memoryFs();
  const timers = fakeTimers();
  const runtime = { spawn: spawner.spawn, timers: { setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout }, clock: () => Date.now(), fs };
  const scratch = createScratch({ fs, root: "/profile/axiosozo-lab" });
  let n = 0;
  const cli = A.createCliAiBackend({ runtime, discovery: fakeDiscovery(statuses), scratch, environment: { PATH: "/usr/bin" }, projects, newId: () => `id${++n}` });
  const ai = A.createLabAi({ isPrivate: () => false, getBackend: () => cli });
  return { ai, cli, spawner, fs, timers };
}

test("a Claude Code answer: stream-json on stdin with the image inline, nothing written, the JSON from structured_output", async () => {
  const { ai, spawner, fs } = backend({ handler: replay("claude-answer.jsonl", { waitForInput: true, endOnClose: true }) });
  const written = [];
  const original = fs.writeFile;
  fs.writeFile = async (path, bytes, mode) => { written.push(path); return original(path, bytes, mode); };
  const texts = [];
  const result = await ai.runTurn({ prompt: "What is wrong here?", image: { type: "image/png", data: PNG.buffer }, json: SCHEMA, onText: text => texts.push(text) });
  assert.equal(result.client, "claude-code", "auto picks Claude Code first");
  assert.equal(result.json.options[0].kind, "text_typo");
  assert.equal(result.model, "claude-haiku-5-5");
  assert.ok(result.costUsd > 0 && result.durationMs > 0);
  assert.deepEqual(written, [], "the image never touches the disk for Claude");

  const call = supervised(spawner.calls[0]);
  assert.deepEqual([call.mode, call.firstSignal, call.command], ["pipe", "TERM", "/clients/claude-code"]);
  assert.equal(call.args[call.args.indexOf("--tools") + 1], "", "no tools");
  assert.ok(call.args.includes("--json-schema") && call.args.includes("--no-session-persistence") && call.args.includes("--safe-mode"));
  assert.match(spawner.calls[0].workdir, /^\/profile\/axiosozo-lab\/runs\/a-id1\/cwd$/u, "an empty private folder");
  const process = spawner.processes[0];
  const [message] = process.stdinMessages();
  assert.equal(message.type, "user");
  assert.deepEqual(message.message.content[0], { type: "image", source: { type: "base64", media_type: "image/png", data: Buffer.from(PNG).toString("base64") } });
  assert.deepEqual(message.message.content[1], { type: "text", text: "What is wrong here?" });
  assert.equal(process.stdinClosed, true, "stdin closes once the result came, so Claude ends");
  assert.equal([...fs.files.keys()].some(key => key.includes("/runs/a-id1")), false, "its folder is gone afterwards");
});

test("a Codex answer: image and strict schema as 0600 files in a 0700 run folder, removed after; JSON from the last message", async () => {
  let seen = null;
  const { ai, spawner, fs } = backend({
    statuses: { "claude-code": { id: "claude-code", state: "missing", available: false, capabilities: [] }, codex: ready("codex") },
    handler: async (options, process) => {
      const call = supervised(options);
      const image = call.args[call.args.indexOf("--image") + 1];
      const schema = call.args[call.args.indexOf("--output-schema") + 1];
      seen = { image: fs.files.get(image), schema: JSON.parse(new TextDecoder().decode(fs.files.get(schema).data)), dir: fs.files.get(image.replace(/\/[^/]+$/u, "")) };
      return replay("codex-answer.jsonl")(options, process);
    },
  });
  const result = await ai.runTurn({ prompt: "What is wrong here?", image: { type: "image/png", data: PNG }, json: SCHEMA });
  assert.equal(result.client, "codex", "auto falls back to Codex");
  assert.equal(result.json.options[0].kind, "layout_overflow");
  assert.equal(seen.image.mode, 0o600);
  assert.deepEqual(seen.image.data, PNG);
  assert.equal(seen.dir.mode, 0o700);
  assert.deepEqual(seen.schema.properties.options.items.required, ["kind", "label", "confidence"], "strict: every property required");
  assert.equal(seen.schema.properties.options.items.additionalProperties, false);
  assert.equal(JSON.stringify(seen.schema).includes("maxLength"), false);
  const call = supervised(spawner.calls[0]);
  assert.deepEqual([call.mode, call.firstSignal], ["lease", "INT"]);
  assert.ok(call.args.includes("read-only") && call.args.includes("--ephemeral") && call.args.at(-2) === "--");
  assert.equal([...fs.files.keys()].some(key => key.includes("/runs/")), false, "image and schema are gone");
});

test("no client ready, or not able to: calm reasons, nothing started", async () => {
  const none = backend({ statuses: {}, handler: () => assert.fail("nothing may start") });
  await assert.rejects(none.ai.runTurn({ prompt: "x" }), error => error.code === "CLIENT_UNAVAILABLE" && error.reason === "Neither Claude Code nor Codex is ready on this Mac.");
  await assert.rejects(none.ai.runTurn({ client: "codex", prompt: "x" }), error => error.code === "CLIENT_UNAVAILABLE" && error.reason === "Not installed");
  const noImage = backend({ statuses: { codex: ready("codex", ["answer"]) }, handler: () => assert.fail("nothing may start") });
  await assert.rejects(noImage.ai.runTurn({ client: "codex", prompt: "x", image: { type: "image/png", data: PNG } }), error => error.code === "UNSUPPORTED");
  await assert.rejects(noImage.ai.runTurn({ client: "codex", prompt: "x", json: SCHEMA }), error => error.code === "UNSUPPORTED");
  assert.equal(none.spawner.calls.length + noImage.spawner.calls.length, 0);
});

test("cwd: only a known project's root, read only; Antigravity never", async () => {
  const projects = { find: async root => (root === "/projects/inkline" ? { id: "p_inkline1", root: "/projects/inkline", name: "Inkline" } : null) };
  const { ai, spawner } = backend({ projects, handler: replay("claude-answer.jsonl", { waitForInput: true, endOnClose: true }),
    statuses: { "claude-code": ready("claude-code"), antigravity: ready("antigravity") } });
  await assert.rejects(ai.runTurn({ prompt: "x", cwd: "/elsewhere" }), error => error.code === "UNSUPPORTED");
  await assert.rejects(ai.runTurn({ client: "antigravity", prompt: "x", cwd: "/projects/inkline" }), error => error.code === "UNSUPPORTED");
  await assert.rejects(ai.runTurn({ client: "antigravity", prompt: "x" }),
    error => error.code === "UNSUPPORTED" && error.reason === "Antigravity cannot answer without its tools, so the Lab uses it only for agent tasks.");
  assert.equal(spawner.calls.length, 0);
  await ai.runTurn({ prompt: "Where is the pricing card?", cwd: "/projects/inkline/" });
  const call = supervised(spawner.calls[0]);
  assert.equal(spawner.calls[0].workdir, "/projects/inkline");
  assert.equal(call.args[call.args.indexOf("--tools") + 1], "Read,Glob,Grep");
  assert.equal(call.args[call.args.indexOf("--permission-mode") + 1], "plan");
});

test("Stop: Claude gets its interrupt, then stdin closes; the turn is ABORTED; a timeout says TIMEOUT", async () => {
  const { ai, spawner } = backend({ handler: async (options, process) => {
    await until(() => process.writes.length > 0);
    process.line(fixtureLines("claude-cancel.jsonl")[1]); // init
    process.onWrite = text => {
      if (!text.includes("control_request")) return;
      const id = JSON.parse(text).request_id;
      process.line({ type: "control_response", response: { subtype: "success", request_id: id } });
      process.line(fixtureLines("claude-cancel.jsonl").at(-1));
    };
    process.onStdinClose = () => process.exit(1);
  } });
  const controller = new AbortController();
  const turn = ai.runTurn({ prompt: "x", signal: controller.signal });
  await until(() => typeof spawner.processes[0]?.onWrite === "function");
  controller.abort();
  await assert.rejects(turn, error => error.code === "ABORTED");
  await until(() => spawner.processes[0].exitCode !== null);
  const writes = spawner.processes[0].writes.map(text => JSON.parse(text));
  assert.equal(writes[1].type, "control_request");
  assert.deepEqual(writes[1].request, { subtype: "interrupt" });
  assert.equal(spawner.processes[0].stdinClosed, true);

  const slow = backend({ handler: async () => {} });
  await assert.rejects(slow.ai.runTurn({ prompt: "x", timeoutMs: 1000 }), error => error.code === "TIMEOUT");
  await until(() => slow.spawner.processes[0]?.writes.length === 2);
  assert.equal(JSON.parse(slow.spawner.processes[0].writes[1]).type, "control_request", "the timed-out client is stopped too");
  slow.spawner.processes[0].exit(143);
});

test("failures become fixed codes with an honest reason", async () => {
  const signIn = backend({ handler: replay("codex-cancel.jsonl", { exitCode: 1, stderr: "Error: you need to log in. Run codex login\n" }),
    statuses: { codex: ready("codex") } });
  await assert.rejects(signIn.ai.runTurn({ client: "codex", prompt: "x" }),
    error => error.code === "CLIENT_UNAVAILABLE" && error.reason === "Codex needs you to sign in. Open Codex and sign in there.");

  const resets = Math.round(new Date(2026, 9, 9, 23, 30).getTime() / 1000);
  const limited = backend({ handler: async (options, process) => {
    await until(() => process.writes.length > 0);
    process.line({ type: "rate_limit_event", rate_limit_info: { status: "rejected", resetsAt: resets, rateLimitType: "five_hour", utilization: 1 } });
    process.line({ type: "result", subtype: "error_during_execution", is_error: true, result: "Claude AI usage limit reached" });
    process.onStdinClose = () => process.exit(1);
  } });
  await assert.rejects(limited.ai.runTurn({ prompt: "x" }), error => error.code === "TURN_FAILED" && error.reason === "Claude Code is out of its 5-hour limit until 23:30.");

  const noJson = backend({ handler: async (options, process) => {
    await until(() => process.writes.length > 0);
    process.line({ type: "result", subtype: "success", is_error: false, result: "Not JSON at all." });
    process.onStdinClose = () => process.exit(0);
  } });
  await assert.rejects(noJson.ai.runTurn({ prompt: "x", json: SCHEMA }), error => error.code === "INVALID_OUTPUT");
});

test("the facade: private windows, no backend, bad requests, client status", async () => {
  const privateAi = A.createLabAi({ isPrivate: () => true, getBackend: () => ({ runTurn: () => assert.fail("never") }) });
  await assert.rejects(privateAi.runTurn({ prompt: "x" }), error => error.code === "PRIVATE_WINDOW");
  const unknownPrivacy = A.createLabAi({ isPrivate: () => { throw new Error("?"); }, getBackend: () => ({ runTurn: () => assert.fail("never") }) });
  await assert.rejects(unknownPrivacy.runTurn({ prompt: "x" }), error => error.code === "PRIVATE_WINDOW", "unknown counts as private");
  await assert.rejects(A.createLabAi({ isPrivate: () => false }).runTurn({ prompt: "x" }), error => error.code === "AI_NOT_CONNECTED");
  for (const request of [null, { prompt: "" }, { prompt: "x", client: "gpt" }, { prompt: "x", model: "a b" }, { prompt: "x", extra: 1 },
    { prompt: "x", image: { type: "image/gif", data: PNG } }, { prompt: "x", cwd: "relative" }, { prompt: "x", timeoutMs: 10 }, { prompt: "\u0001" }]) {
    await assert.rejects(A.createLabAi({ isPrivate: () => false }).runTurn(request), error => error.code === "INVALID_REQUEST", JSON.stringify(request));
  }
  assert.equal(A.normalizeTurnRequest({ prompt: "x" }).client, "auto");
  const statuses = await A.createLabAi({ isPrivate: () => false }).clientStatus();
  assert.deepEqual(statuses.map(item => [item.id, item.state]), [["claude-code", "unchecked"], ["codex", "unchecked"], ["antigravity", "unchecked"]]);
  const asked = [];
  const withStatus = A.createLabAi({ isPrivate: () => false, getStatus: options => { asked.push(options); return []; } });
  await withStatus.clientStatus({ check: true });
  assert.deepEqual(asked, [{ check: true, force: false }]);
  assert.match(A.aiErrorText("CLIENT_UNAVAILABLE", "codex"), /^Codex is not available/u);
  assert.equal(A.outgoingText("claude-code", { image: true, page: true }), "Region image and page address go to Claude Code.");
  assert.equal(A.outgoingText("codex", { image: true }), "Region image goes to Codex.");
  assert.equal(A.outgoingText("codex"), "Your question goes to Codex.");
});

test("helpers: strict schemas, the user message and the interrupt line", () => {
  assert.deepEqual(A.strictSchema({ type: "object", properties: { a: { type: "string", maxLength: 3 }, b: { type: "array", items: { type: "object", properties: { c: { type: "number", minimum: 1 } } } } } }),
    { type: "object", properties: { a: { type: "string" }, b: { type: "array", items: { type: "object", properties: { c: { type: "number" } }, required: ["c"], additionalProperties: false } } },
      required: ["a", "b"], additionalProperties: false });
  const line = A.claudeUserMessage("hi");
  assert.ok(line.endsWith("\n"));
  assert.deepEqual(JSON.parse(line), { type: "user", message: { role: "user", content: [{ type: "text", text: "hi" }] } });
  assert.deepEqual(JSON.parse(A.claudeInterrupt("lab-int-1")), { type: "control_request", request_id: "lab-int-1", request: { subtype: "interrupt" } });
});
