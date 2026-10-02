/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Real product-owned Python helper, injected Gecko subprocess shape, synthetic
// external fixtures only. No provider, profile, shell or project execution.
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { lstat, stat, realpath, mkdtemp, mkdir, writeFile, symlink, rm } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "../../../packages/contexts/src/index.mjs";
import { createProjectDetection } from "../chrome/ProjectDetection.sys.mjs";
import { createProjectReader } from "../chrome/ProjectReader.sys.mjs";

const HELPER = fileURLToPath(new URL("../../../tools/axiosozo-project-reader/project_reader.py", import.meta.url));
const INTERPRETER = "/usr/bin/python3";
const TIMERS = { setTimeout, clearTimeout };
const info = value => ({ type: value.isSymbolicLink() ? "symlink" : value.isDirectory() ? "directory" : value.isFile() ? "regular" : "other", size: value.size });

function metadataFs() {
  const calls = [];
  const optional = async (method, path) => {
    calls.push([method, path]);
    try { return info(await (method === "lstat" ? lstat(path) : stat(path))); }
    catch (cause) { if (cause.code === "ENOENT" || cause.code === "ENOTDIR") return null; throw cause; }
  };
  return { calls, join: (root, relative) => join(root, ...relative.split("/")), basename,
    lstat: path => optional("lstat", path), stat: path => optional("stat", path),
    realpath: path => { calls.push(["realpath", path]); return realpath(path); } };
}

function realSubprocess() {
  const calls = [], children = [];
  const Subprocess = { calls, children, async call(options) {
    // Execute only the reviewed fixed product helper with a sanitized env.
    assert.equal(options.command, INTERPRETER);
    assert.deepEqual(options.arguments.slice(0, 4), ["-I", "-S", "-B", HELPER]);
    assert.ok(["metadata", "read", "presence", "list"].includes(options.arguments[4]));
    assert.equal(options.arguments.length, 6);
    assert.equal(options.workdir, "/");
    assert.equal(options.environmentAppend, false);
    assert.equal(options.stderr, "pipe");
    assert.deepEqual(options.environment, { LANG: "C", LC_ALL: "C", PYTHONNOUSERSITE: "1", PYTHONDONTWRITEBYTECODE: "1" });
    const payload = JSON.parse(options.arguments[5]);
    calls.push({ operation: options.arguments[4], payload });
    const process = spawn(options.command, options.arguments, { shell: false, cwd: options.workdir,
      env: options.environment, stdio: ["pipe", "pipe", "pipe"] });
    const exited = new Promise((done, reject) => {
      process.once("error", reject);
      process.once("exit", (exitCode, signal) => done({ exitCode, signal }));
    });
    exited.catch(() => {});
    const readPipe = stream => {
      stream.setEncoding("utf8");
      const iterator = stream[Symbol.asyncIterator]();
      return { async readString() { const item = await iterator.next(); return item.done ? "" : item.value; },
        async close() { stream.destroy(); } };
    };
    process.stdin.on("error", () => {});
    const owned = { process, waited: 0, killed: 0,
      stdout: readPipe(process.stdout), stderr: readPipe(process.stderr),
      stdin: { async close() {
        if (process.stdin.writableEnded || process.stdin.destroyed) return;
        await new Promise(done => process.stdin.end(done));
      } },
      wait() { owned.waited++; return exited; },
      async kill(timeout = 300) {
        owned.killed++;
        if (process.exitCode !== null || process.signalCode !== null) return exited;
        process.kill(timeout === 0 ? "SIGKILL" : "SIGTERM");
        let escalation;
        if (timeout > 0) escalation = setTimeout(() => process.kill("SIGKILL"), timeout);
        try { return await exited; } finally { clearTimeout(escalation); }
      } };
    children.push(owned);
    return owned;
  } };
  return Subprocess;
}

async function syntheticFixture(t) {
  const externalTemporary = await realpath(process.env.TMPDIR ?? "");
  assert.ok(externalTemporary.startsWith("/Volumes/AxioSozoBuild/workstation/tmp/"), "use external workstation wrapper TMPDIR");
  const base = await mkdtemp(join(externalTemporary, "reader-integration-"));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = join(base, "harbor-synthetic"), outside = join(base, "outside-synthetic");
  await mkdir(root);
  await mkdir(outside);
  const put = async (relative, value) => {
    const path = join(root, ...relative.split("/"));
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(path, typeof value === "string" ? value : JSON.stringify(value));
  };
  const dirs = ["apps/native-mobile/ios/HarborMobile.xcodeproj", "apps/native-desktop/macos/HarborDesktop.xcodeproj",
    "apps/android-shell/android", "docs/production", "docs/escape", "convex", ".claude", ".codex", ".agent-worktrees/one", ".agent-worktrees/two"];
  for (const relative of dirs) await mkdir(join(root, ...relative.split("/")), { recursive: true });
  await put("package.json", { name: "harbor-synthetic", private: true, workspaces: ["apps/*"],
    dependencies: { "@clerk/nextjs": "1.0.0", stripe: "1.0.0" } });
  await put("apps/web/package.json", { name: "harbor-web", dependencies: { next: "1.0.0", convex: "1.0.0" } });
  await put("convex.json", { functions: "convex" });
  await put("docs/domains.md", "# Domains\nhttps://app.harbor-reader-fixture.io\n");
  await put("docs/production/domains.md", "# Production\n`api.harbor-reader-fixture.io`\n");
  await put("AGENTS.md", "TRAP_AGENT_CONTENT_NEVER_READ");
  await put("CLAUDE.md", "TRAP_CLAUDE_CONTENT_NEVER_READ");
  await put(".env", "TRAP_ENV_CONTENT_NEVER_READ");
  await put("convex/schema.ts", "TRAP_CONVEX_CONTENT_NEVER_READ");
  await put("apps/android-shell/android/build.gradle", "TRAP_GRADLE_CONTENT_NEVER_READ");
  await put("apps/native-mobile/ios/HarborMobile.xcodeproj/project.pbxproj", "TRAP_XCODE_CONTENT_NEVER_READ");
  await put(".agent-worktrees/one/.env", "TRAP_WORKTREE_CONTENT_NEVER_READ");
  await writeFile(join(outside, "domains.md"), "TRAP_OUTSIDE_CONTENT_NEVER_READ `outside-secret.harbor.test`");
  await mkdir(join(outside, "OUTSIDE_TRAP.xcodeproj"));
  await symlink(join(outside, "domains.md"), join(root, "docs/escape/domains.md"));
  await symlink(outside, join(root, "apps/linked-outside"));
  await symlink(join(outside, "OUTSIDE_TRAP.xcodeproj"), join(root, "apps/native-mobile/ios/OUTSIDE_TRAP.xcodeproj"));
  return { root: await realpath(root), outside };
}

const configuredReader = Subprocess => createProjectReader({ configuredTrusted: true, interpreter: INTERPRETER,
  helperPath: HELPER, Subprocess, timers: TIMERS });

// The ordinary seam intentionally has no content read or directory list API.
test("real secure helper feeds all four detection phases from a synthetic project", { timeout: 20000 }, async t => {
  const { root, outside } = await syntheticFixture(t);
  const fs = metadataFs(), Subprocess = realSubprocess(), reader = configuredReader(Subprocess);
  assert.equal(reader.exactAvailable, true);
  assert.equal(Object.hasOwn(fs, "read"), false);
  assert.equal(Object.hasOwn(fs, "readContained"), false);
  assert.equal(Object.hasOwn(fs, "listDirectory"), false);
  const detector = createProjectDetection({ fs, reader, core, clock: () => 123 });
  const result = await detector.detect(root);
  assert.equal(result.canonicalRoot, root);
  assert.equal(result.detectedAt, 123);
  assert.ok(Object.isFrozen(result.draft));
  assert.deepEqual(result.draft.integrations.map(item => item.id).sort(), ["clerk", "convex", "stripe"]);
  assert.deepEqual([...new Set(result.draft.platforms.map(item => item.kind))].sort(), ["android", "ios", "macos"]);
  assert.ok(result.draft.platforms.some(item => item.source === "apps/native-mobile/ios/HarborMobile.xcodeproj"));
  assert.ok(result.draft.platforms.some(item => item.source === "apps/native-desktop/macos/HarborDesktop.xcodeproj"));
  assert.ok(result.draft.platforms.some(item => item.source === "apps/android-shell/android/build.gradle"));
  assert.deepEqual(result.draft.domains.map(item => [item.host, item.origin, item.confirmed]).sort(), [
    ["api.harbor-reader-fixture.io", "docs", false], ["app.harbor-reader-fixture.io", "docs", false],
  ]);
  assert.deepEqual(result.draft.agents, { files: ["AGENTS.md", "CLAUDE.md"], dirs: [".claude", ".codex", ".agent-worktrees"], worktrees: 2 });
  assert.ok(result.draft.refused.some(item => item.path === "docs/escape/domains.md" && item.reason === "symlink_outside_root"));
  assert.doesNotMatch(JSON.stringify(result), /TRAP|CONTENT_NEVER_READ|outside-secret/u);
  assert.ok(!result.draft.files_read.includes("AGENTS.md"));
  assert.ok(!result.draft.files_read.includes("apps/android-shell/android/build.gradle"));
  const operations = new Set(Subprocess.calls.map(call => call.operation));
  assert.deepEqual([...operations].sort(), ["list", "metadata", "presence", "read"]);
  const reads = Subprocess.calls.filter(call => call.operation === "read");
  assert.deepEqual(reads.map(call => call.payload.relative).sort(), [
    "apps/web/package.json", "convex.json", "docs/domains.md", "docs/production/domains.md", "package.json",
  ]);
  for (const { operation, payload } of Subprocess.calls) {
    assert.equal(payload.root, root);
    assert.ok(!JSON.stringify(payload).includes(outside));
    if (operation === "read") assert.equal(payload.maxBytes, core.MAX_FILE_BYTES + 1);
    if (operation === "list") assert.equal(payload.limit, 512);
  }
  for (const child of Subprocess.children) {
    assert.equal(child.process.exitCode, 0);
    assert.ok(child.waited >= 1, "every helper child reaped");
    assert.equal(child.killed, 0);
  }
  const counts = Object.fromEntries([...operations].sort().map(operation => [operation, Subprocess.calls.filter(call => call.operation === operation).length]));
  t.diagnostic(`helper spawns: ${Subprocess.calls.length}; operations: ${JSON.stringify(counts)}`);
});

test("untrusted or missing reader configuration refuses detection without spawning", async t => {
  const { root } = await syntheticFixture(t);
  for (const configuration of [{}, { configuredTrusted: false }, { configuredTrusted: true, interpreter: "python3" },
    { configuredTrusted: true, interpreter: INTERPRETER, helperPath: null }]) {
    const Subprocess = realSubprocess();
    const reader = createProjectReader({ interpreter: INTERPRETER, helperPath: HELPER, Subprocess, timers: TIMERS, ...configuration });
    assert.equal(reader.exactAvailable, false);
    await assert.rejects(createProjectDetection({ fs: metadataFs(), reader, core }).detect(root), error => error.code === "READ_CONTAINMENT_UNAVAILABLE");
    assert.equal(Subprocess.calls.length, 0);
  }
});
