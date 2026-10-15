/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Tolerant parsing of the clients' machine output (chrome/lab/streams.sys.mjs)
// on REAL recorded streams (fixtures/lab/*.jsonl, captured 2026-10-09 from
// tiny live runs in a synthetic git repo with Claude Code 2.1.295, Codex
// 0.162.0 and Antigravity 1.3.2; paths replaced by /synthetic, the init
// event's account and configuration lists dropped, thinking signatures
// emptied) plus hand-made future/garbled lines.
import "./support/chrome-modules.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { fixtureLines } from "./support/lab-process-fakes.mjs";

const S = await import("../chrome/lab/streams.sys.mjs");
const events = (client, name) => fixtureLines(name).flatMap(line => S.eventsOf(client, line));
const kinds = list => list.map(event => event.kind);

test("Claude Code task stream (real): init, live steps, the edited file, its sentence, a successful result", () => {
  const list = events("claude-code", "claude-task.jsonl");
  const init = list.find(event => event.kind === "init");
  assert.equal(init.sessionId, "09fc9d5e-d079-4eb8-b437-d39a73452de2");
  assert.equal(init.model, "claude-haiku-5-5");
  assert.deepEqual(list.filter(event => event.kind === "step").map(event => event.text), ["Searching for “Sing up”", "Editing index.html"]);
  assert.deepEqual(list.filter(event => event.kind === "files").flatMap(event => event.paths), ["/synthetic/inkline/index.html"]);
  const result = list.at(-1);
  assert.equal(result.kind, "result");
  assert.equal(result.ok, true);
  assert.equal(result.aborted, false);
  assert.deepEqual(result.denials, []);
  assert.ok(result.costUsd > 0 && result.costUsd < 0.01);
  assert.ok(result.durationMs > 0);
  assert.match(result.text, /Sign up/u);
  assert.match(S.lastSentence(result.text), /^Changed the button label in index\.html:11 from "Sing up" to "Sign up"\.$/u);
});

test("Claude Code one-shot (real): the JSON answer is structured_output; tool steps and thinking are harmless", () => {
  const list = events("claude-code", "claude-answer.jsonl");
  const result = list.find(event => event.kind === "result");
  assert.equal(result.ok, true);
  assert.ok(Array.isArray(result.structured.options) && result.structured.options.length >= 1);
  assert.equal(result.structured.options[0].kind, "text_typo");
  assert.ok(list.some(event => event.kind === "rate_limit"), "the rate-limit event is read");
  const limit = list.find(event => event.kind === "rate_limit").limit;
  assert.equal(limit.type, "five_hour");
  assert.ok(limit.resetsAt > 1e12, "seconds became milliseconds");
});

test("Claude Code interrupt (real): control_response, then a result aborted_streaming that is not ok", () => {
  const list = events("claude-code", "claude-cancel.jsonl");
  assert.deepEqual(kinds(list).filter(kind => ["control", "result"].includes(kind)), ["control", "result"]);
  assert.equal(list.find(event => event.kind === "control").ok, true);
  const result = list.find(event => event.kind === "result");
  assert.equal(result.ok, false);
  assert.equal(result.aborted, true);
  assert.equal(result.reason, "error_during_execution");
});

test("Codex task stream (real): thread id, readable command steps, the patched file, its last message, turn.completed", () => {
  const list = events("codex", "codex-task.jsonl");
  assert.equal(list[0].kind, "init");
  assert.equal(list[0].sessionId, "01a11dd0-2557-7cb2-aab5-a176ea84f22a");
  const steps = list.filter(event => event.kind === "step").map(event => event.text);
  assert.equal(steps[0], "Thinking");
  assert.ok(steps.some(step => step.startsWith("Running ls -la; cat styles.css")), "the zsh -lc wrapper is unwrapped");
  assert.ok(steps.includes("Editing styles.css"));
  assert.deepEqual(list.filter(event => event.kind === "files").flatMap(event => event.paths), ["/synthetic/inkline/styles.css"]);
  const texts = list.filter(event => event.kind === "text").map(event => event.text);
  assert.match(texts.at(-1), /no longer overflows/u);
  const result = list.at(-1);
  assert.equal(result.kind, "result");
  assert.equal(result.ok, true);
  assert.ok(result.usage.inputTokens > 0);
  assert.equal(result.costUsd, null, "Codex reports tokens, not cost");
});

test("Codex one-shot and cancel (real): the answer is its last message; a cancel leaves no final event", () => {
  const answer = events("codex", "codex-answer.jsonl");
  const text = answer.filter(event => event.kind === "text").at(-1).text;
  assert.equal(JSON.parse(text).options[0].kind, "layout_overflow");
  assert.equal(answer.at(-1).kind, "result");
  const cancel = events("codex", "codex-cancel.jsonl");
  assert.deepEqual(kinds(cancel), ["init", "step"], "SIGINT/SIGTERM: Codex prints nothing more, the browser infers stopped");
});

test("Antigravity task (real): conversation id, steps, the answer arriving in pieces, a successful result", () => {
  const list = events("antigravity", "agy-task.jsonl");
  assert.equal(list[0].kind, "init");
  assert.equal(list[0].sessionId, "c806fb74-839d-4fef-9fca-869d5f105aff");
  const steps = list.filter(event => event.kind === "step").map(event => event.text);
  assert.ok(steps.includes("Reading index.html"));
  assert.ok(steps.includes("Editing index.html"));
  const deltas = list.filter(event => event.kind === "text");
  assert.ok(deltas.length > 1 && deltas.every(event => event.delta === true), "text_delta pieces are deltas");
  assert.equal(deltas.map(event => event.text).join(""), "Updated the price from €29 to €25 in [index.html](file:///synthetic/inkline/index.html#L9).\n");
  const result = list.at(-1);
  assert.equal(result.ok, true);
  assert.equal(S.lastSentence(result.text), "Updated the price from €29 to €25 in index.html.");
  assert.ok(list.some(event => event.kind === "files" && event.paths[0] === "/synthetic/inkline/index.html"));
});

test("Antigravity refused a command headless (real): SUCCESS with denied_actions becomes a result with denials", () => {
  const list = events("antigravity", "agy-task-denied.jsonl");
  const result = list.at(-1);
  assert.equal(result.ok, true);
  assert.equal(result.text, "");
  assert.deepEqual(result.denials.map(item => item.step), ["Running a command"]);
  assert.ok(list.some(event => event.kind === "step" && event.text === "Running git status"));
});

test("unknown types, fields and garbage are ignored, never thrown", () => {
  const lines = [
    "", "   ", "not json", "[1,2]", "null", "{\"type\":", "{}",
    JSON.stringify({ type: "system", subtype: "a_future_event", session_id: "x" }),
    JSON.stringify({ type: "a_future_type", anything: { deep: true } }),
    JSON.stringify({ type: "assistant", message: { content: [{ type: "future_block" }, null, { type: "tool_use" }] } }),
    JSON.stringify({ type: "assistant", parent_tool_use_id: "toolu_x", message: { content: [{ type: "text", text: "a helper's words" }] } }),
    JSON.stringify({ type: "result" }),
  ];
  for (const line of lines) assert.doesNotThrow(() => S.eventsOf("claude-code", line));
  assert.deepEqual(lines.slice(0, 10).flatMap(line => S.eventsOf("claude-code", line)), []);
  assert.deepEqual(S.eventsOf("claude-code", lines[10]), [], "a helper agent's text is not the run's");
  assert.equal(S.eventsOf("claude-code", lines[11])[0].kind, "result");
  assert.deepEqual(S.eventsOf("codex", JSON.stringify({ type: "item.started", item: { type: "future_item" } })), []);
  assert.deepEqual(S.eventsOf("codex", JSON.stringify({ type: "thread.renamed" })), []);
  assert.deepEqual(S.eventsOf("codex", JSON.stringify({ type: "error", message: "Reconnecting... 2/5 (503)" })).map(event => event.kind), ["notice"],
    "Codex reconnect errors are notices, not failures");
  assert.deepEqual(S.eventsOf("antigravity", JSON.stringify({ event: "future", x: 1 })), []);
  assert.deepEqual(S.eventsOf("unknown-client", "{\"type\":\"result\"}"), []);
  const failed = S.eventsOf("codex", JSON.stringify({ type: "turn.failed", error: { message: "stream disconnected" } }))[0];
  assert.equal(failed.ok, false);
  assert.equal(failed.reason, "stream disconnected");
});

test("step lines for tools across clients", () => {
  assert.equal(S.stepText("Read", { file_path: "/a/b/index.html" }), "Reading index.html");
  assert.equal(S.stepText("MultiEdit", { file_path: "/a/styles.css" }), "Editing styles.css");
  assert.equal(S.stepText("Write", { file_path: "/a/new.txt" }), "Writing new.txt");
  assert.equal(S.stepText("Glob", { pattern: "**/*.ts" }), "Looking through the files");
  assert.equal(S.stepText("Grep", { pattern: "x".repeat(80) }).length <= 60, true);
  assert.equal(S.stepText("Bash", { command: "npm test" }), "Running npm test");
  assert.equal(S.stepText("view_file", { AbsolutePath: "/r/a.png" }), "Reading a.png");
  assert.equal(S.stepText("run_command", { CommandLine: "git status" }), "Running git status");
  assert.equal(S.stepText("mcp__x__y"), "Using mcp__x__y");
  assert.equal(S.stepText(undefined), "Working");
  assert.equal(S.editedFile("Edit", { file_path: "/a/b" }), "/a/b");
  assert.equal(S.editedFile("Read", { file_path: "/a/b" }), null);
  assert.equal(S.editedFile("Edit", { file_path: "relative" }), null);
  assert.equal(S.codexCommand("/bin/zsh -lc \"rg -n x .\""), "rg -n x .");
  assert.equal(S.codexCommand("/bin/zsh -lc 'git diff --stat'"), "git diff --stat");
  assert.equal(S.codexCommand("ls"), "ls");
});

test("closing sentences, rate limits and failures in calm words", () => {
  assert.equal(S.lastSentence("Done.\n\n- I changed **styles.css** so the `.cta` fits."), "I changed styles.css so the .cta fits.");
  assert.equal(S.lastSentence(`${"Looked around. ".repeat(10)}Then fixed it.`), "Then fixed it.");
  assert.equal(S.lastSentence(""), "");
  assert.equal(S.lastSentence(null), "");
  assert.ok(S.lastSentence("x".repeat(500)).length <= 120);

  const resets = new Date(2026, 9, 9, 23, 30).getTime();
  assert.equal(S.rateLimitText("claude-code", { status: "rejected", type: "five_hour", utilization: 1, resetsAt: resets }),
    "Claude Code is out of its 5-hour limit until 23:30.");
  assert.equal(S.rateLimitText("claude-code", { status: "allowed_warning", type: "five_hour", utilization: 0.96, resetsAt: resets }),
    "Claude Code is at 96 % of its 5-hour limit.");
  assert.equal(S.rateLimitText("claude-code", { status: "allowed", type: "five_hour", utilization: 0.2, resetsAt: resets }), null);
  assert.equal(S.rateLimitText("codex", null), null);

  assert.equal(S.failureText("claude-code", { stderr: "Invalid API key · Please run /login" }).code, "SIGN_IN");
  assert.equal(S.failureText("codex", { stderr: "You need to log in: codex login" }).code, "SIGN_IN");
  assert.match(S.failureText("codex", { stderr: "429 Too Many Requests" }).text, /usage limit/u);
  assert.equal(S.failureText("claude-code", { reason: "error_max_budget_usd" }).code, "BUDGET");
  assert.equal(S.failureText("codex", { notice: "stream error: 503 Service Unavailable" }).code, "NETWORK");
  assert.equal(S.failureText("antigravity", { exitCode: 127 }).code, "MISSING");
  assert.deepEqual(S.failureText("claude-code", {}), { code: "FAILED", text: "Claude Code stopped without finishing." });
  assert.deepEqual(S.failureText("codex", { stderr: "Error: unknown configuration field `features.renamed_flag` in -c override" }),
    { code: "CHANGED", text: "Codex changed a setting we use: features.renamed_flag" }, "--strict-config names a renamed setting");
});
