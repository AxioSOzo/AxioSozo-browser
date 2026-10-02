import test from "node:test";
import assert from "node:assert/strict";
import { contextsCoreAvailable } from "./support/chrome-modules.mjs";
import { fakeZenWindow } from "./support/fake-zen.mjs";

// Synthetic profile storage, filesystem, clock and probe. No network, no real
// profile, no files outside memory. Not evidence of a running browser.
const skip = contextsCoreAvailable ? false : "packages/contexts/src/index.mjs is absent (contexts core not written yet)";
const { AxioSozoServices, processSingleton, PROBE_MIN_INTERVAL_MS, LEDGER_FLUSH_MS, MAX_PENDING_LEDGER, loopbackAddresses,
  arrivalRootsFromEnvironment, DEFAULT_ARRIVAL_ROOTS, lazyArrivalSubprocess } = skip ? {} : await import("../chrome/AxioSozoServices.sys.mjs");
const { createNativeProjectArrivalSubprocess, arrivalSubprocessPaths, ARRIVAL_LSOF_SHA256, ARRIVAL_LSOF_PYTHON } = skip ? {}
  : await import("../chrome/ProjectArrivalSubprocess.sys.mjs");
const { ZenWorkspaceAdapter } = await import("../chrome/ZenWorkspaceAdapter.sys.mjs");
const { createGeckoIdentityAdapter } = await import("../chrome/ProjectContainers.sys.mjs");

const HOME = "11111111-1111-4111-8111-111111111111";
const BV = "22222222-2222-4222-8222-222222222222";
const APP = "33333333-3333-4333-8333-333333333333";
const GONE = "44444444-4444-4444-8444-444444444444";
const NOON = Date.UTC(2026, 8, 27, 12, 0, 0);

function memoryStorage() {
  const files = new Map();
  return { files, storageFor: name => ({ read: async () => files.get(name) ?? null,
    write: async text => { files.set(name, text); } }) };
}

// In-memory POSIX-like tree: { "/p": { dir }, "/p/a": { file: "text" | Uint8Array }, "/p/l": { link: "/abs" } }.
// The write primitives model the IOUtils semantics writeManifestFile relies on
// (verified in the pinned xpcom/ioutils/IOUtils.cpp and nsLocalFileUnix.cpp):
// writeNew = O_CREAT|O_EXCL on the leaf (fails on any entry, links included),
// rename = rename(2) replacing the leaf entry, except that IOUtils.move moves
// *into* a destination that resolves to a directory; intermediate components
// are followed like the kernel does. `hooks` let a test swap entries mid-write.
function fakeFs(tree, hooks = {}) {
  const nodes = new Map(Object.entries(tree));
  const reads = [];
  const writes = [];
  const exists = () => Object.assign(new Error("EEXIST"), { name: "NoModificationAllowedError", code: "EEXIST" });
  const split = path => path.split("/").filter(Boolean);
  const resolve = (path, followLeaf, depth = 0) => {
    if (depth > 16) throw new Error("ELOOP");
    let current = "";
    const parts = split(path);
    for (let i = 0; i < parts.length; i++) {
      current += "/" + parts[i];
      const node = nodes.get(current);
      if (node?.link && (i < parts.length - 1 || followLeaf)) {
        current = resolve(node.link, true, depth + 1);
      }
    }
    return current || "/";
  };
  const info = node => (!node ? null : node.link ? { type: "symlink", size: 0 } : node.dir ? { type: "directory", size: 0 }
    : { type: "regular", size: (typeof node.file === "string" ? Buffer.from(node.file) : node.file).length });
  return {
    reads, writes, nodes,
    join: (root, relative) => [root.replace(/\/$/u, ""), ...relative.split("/")].join("/"),
    basename: path => split(path).at(-1),
    async lstat(path) { return info(nodes.get(resolve(path, false))); },
    async stat(path) { return info(nodes.get(resolve(path, true))); },
    async realpath(path) { const real = resolve(path, true); if (!nodes.has(real)) throw new Error("ENOENT"); return real; },
    // Project content is read and listed only through the containment reader;
    // a plain path read or listing would be a containment bypass.
    async listDirectory() { throw new Error("PLAIN_LISTING_MUST_NEVER_BE_USED"); },
    async read() { throw new Error("PLAIN_READ_MUST_NEVER_BE_USED"); },
    /** The entry a leaf operation acts on: parents resolved, the leaf itself not followed. */
    entryPath(path) {
      const parts = split(path);
      const leaf = parts.pop();
      const parent = resolve("/" + parts.join("/"), true);
      return `${parent === "/" ? "" : parent}/${leaf}`;
    },
    async makeDirectory(path) {
      const at = this.entryPath(path);
      if (nodes.has(at)) throw exists();
      nodes.set(at, { dir: true });
    },
    async writeNew(path, text) {
      hooks.beforeWriteNew?.(path, nodes);
      const at = this.entryPath(path);
      if (nodes.has(at)) throw exists();
      nodes.set(at, { file: text }); writes.push(at);
    },
    async rename(from, to) {
      hooks.beforeRename?.(from, to, nodes);
      const source = this.entryPath(from);
      if (!nodes.has(source)) throw new Error("ENOENT");
      const followed = resolve(to, true);
      const target = nodes.get(followed)?.dir ? `${followed}/${split(source).at(-1)}` : this.entryPath(to);
      nodes.set(target, nodes.get(source)); nodes.delete(source);
    },
    async remove(path) { nodes.delete(this.entryPath(path)); },
  };
}

// The containment reader's contract (ProjectReader) over the same tree: every
// path component is checked without following links, entries carry
// device/inode identities (a replaced node gets a new one), and content is
// returned only for the expected file identity. Reads land in fs.reads.
function secureReader(fs, hooks = {}) {
  const ids = new WeakMap();
  let next = 0;
  const calls = [];
  const identity = node => { if (!ids.has(node)) ids.set(node, { device: "1", inode: String(++next) }); return ids.get(node); };
  const refused = () => Object.assign(new Error("READ_CONTAINMENT_REFUSED"), { code: "READ_CONTAINMENT_REFUSED" });
  const nofollow = path => {
    let current = "";
    for (const part of path.split("/").filter(Boolean)) {
      current += `/${part}`;
      const node = fs.nodes.get(current);
      if (!node || node.link) throw refused();
    }
    return fs.nodes.get(path);
  };
  const meta = node => ({ type: node.dir ? "directory" : node.link ? "other" : "regular",
    size: node.dir ? 0 : (typeof node.file === "string" ? Buffer.from(node.file) : node.file).length, identity: identity(node) });
  const same = (a, b) => a?.device === b?.device && a?.inode === b?.inode;
  const checkRoot = (root, expected) => { if (!same(identity(nofollow(root)), expected)) throw refused(); };
  return {
    calls,
    async rootMetadata(root) { calls.push(["root", root]); return meta(nofollow(root)); },
    async fileMetadata({ root, relative, expectedRoot }) {
      calls.push(["file", relative]); checkRoot(root, expectedRoot); return meta(nofollow(`${root}/${relative}`));
    },
    async presenceMetadata({ root, relative, expectedRoot }) {
      calls.push(["presence", relative]); checkRoot(root, expectedRoot);
      try { return meta(nofollow(`${root}/${relative}`)); } catch { return null; }
    },
    async listContained({ root, relative, expectedRoot, expectedDirectory, limit }) {
      const path = relative ? `${root}/${relative}` : root;
      checkRoot(root, expectedRoot);
      const node = nofollow(path);
      if (!node.dir || !same(identity(node), expectedDirectory)) throw refused();
      calls.push(["list", path]);
      const entries = [];
      for (const [key, child] of fs.nodes) {
        if (!key.startsWith(`${path}/`) || key.slice(path.length + 1).includes("/")) continue;
        entries.push({ name: key.slice(path.length + 1), type: child.link ? "symlink" : child.dir ? "directory" : "regular" });
      }
      return { entries: entries.slice(0, limit), identity: identity(node) };
    },
    async readContained({ root, relative, expectedRoot, expectedFile, maxBytes }) {
      const path = `${root}/${relative}`;
      hooks.beforeRead?.(path, fs.nodes);
      checkRoot(root, expectedRoot);
      const node = nofollow(path);
      if (node.dir || !same(identity(node), expectedFile)) throw refused();
      calls.push(["read", path]);
      fs.reads.push(path);
      const bytes = typeof node.file === "string" ? Buffer.from(node.file) : node.file;
      return new Uint8Array(bytes.subarray(0, maxBytes));
    },
  };
}

// Gecko Subprocess.call shape for /usr/bin/id and /usr/sbin/lsof only; answers
// from `listeners` (port → { pid, cwd, uid }). No real process is started.
function fakeArrivalRuntime(listeners = {}) {
  const calls = [];
  const pipe = text => { let done = false; return { async read() { if (done) return new ArrayBuffer(0); done = true; return new TextEncoder().encode(text).buffer; }, async close() {} }; };
  const reply = text => ({ stdout: pipe(text), stderr: pipe(""), stdin: { async close() {} },
    async wait() { return { exitCode: 0 }; }, async kill() {} });
  return { calls, async call({ command, arguments: args }) {
    calls.push([command, ...args]);
    if (command === "/usr/bin/id") return reply("501\n");
    if (command !== "/usr/sbin/lsof") throw new Error("unexpected command");
    const port = args.find(arg => arg.startsWith("-iTCP:"))?.slice(6);
    if (port) {
      const entry = listeners[port];
      return reply(entry ? `p${entry.pid}\nu${entry.uid ?? 501}\nn127.0.0.1:${port}\n` : "");
    }
    const pid = Number(args[args.indexOf("-p") + 1]);
    const entry = Object.values(listeners).find(item => item.pid === pid);
    return reply(entry ? `p${pid}\nfcwd\nn${entry.cwd}\n` : "");
  } };
}

function harness({ spaces, tree = {}, probe, hooks, deps = {} } = {}) {
  const storage = memoryStorage();
  let now = NOON;
  const timers = { queue: [], setTimeout(fn, ms) { const t = { fn, ms }; this.queue.push(t); return t; },
    clearTimeout(t) { const i = this.queue.indexOf(t); if (i >= 0) this.queue.splice(i, 1); },
    async runAll() { while (this.queue.length) await this.queue.shift().fn(); } };
  let serial = 0;
  const probes = [];
  const shutdown = [];
  const zen = fakeZenWindow({ spaces: spaces ?? [
    { uuid: HOME, name: "Home", containerTabId: 0 },
    { uuid: BV, name: "AxioSozo BV", containerTabId: 1 },
    { uuid: APP, name: "Shop app", containerTabId: 2 }] });
  const fs = fakeFs(tree, hooks);
  const reader = secureReader(fs, hooks);
  const make = () => new AxioSozoServices({
    storageFor: storage.storageFor, fs, timers, reader,
    clock: () => now,
    localTime: ms => { const d = new Date(ms); return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(),
      minutes: d.getUTCHours() * 60 + d.getUTCMinutes(), weekday: d.getUTCDay() }; },
    randomId: prefix => `${prefix}fixture${++serial}`,
    probe: async target => { probes.push(target); return probe ? probe(target) : "up"; },
    pickFolder: async () => "/work/shop",
    onShutdown: fn => shutdown.push(fn),
    ...deps,
  });
  const services = make();
  const adapter = new ZenWorkspaceAdapter(zen.window);
  const unregister = services.registerWindow(zen.window, adapter);
  return { services, storage, zen, adapter, unregister, fs, reader, timers, probes, shutdown, make,
    advance(ms) { now += ms; }, get now() { return now; } };
}

const VITE_TREE = {
  "/work": { dir: true },
  "/work/shop": { dir: true },
  "/work/shop/package.json": { file: JSON.stringify({ name: "shop", scripts: { dev: "vite --port 5174" }, devDependencies: { vite: "^5" } }) },
  "/work/shop/.env": { file: "SECRET=never-read" },
  "/work/shop/.env.local": { file: "SECRET=never-read" },
  "/work/shop/vercel.json": { link: "/private/outside.json" },
  "/private": { dir: true },
  "/private/outside.json": { file: "{\"outside\":true}" },
  "/work/shop/netlify.toml": { file: new Uint8Array([0xff, 0xfe, 0x00]) },
  "/work/shop/fly.toml": { file: "x".repeat(262145) },
  "/work/shop/go.mod": { dir: true },
  "/work/shop/wrangler.toml": { link: "/work/shop/config/wrangler.toml" },
  "/work/shop/config": { dir: true },
  "/work/shop/config/wrangler.toml": { file: "name = \"shop-worker\"\n" },
  "/work/shop/docker-compose.yml": { link: "/work/shop/.env" },
  "/work/shop/compose.yaml": { link: "/work/shop/docker-compose.yaml" },
  "/work/shop/docker-compose.yaml": { file: "services:\n  db:\n    image: postgres\n" },
  "/work/shop/.git": { dir: true },
  "/work/shop/.git/config": { file: "[remote \"origin\"]\n\turl = https://user:token@github.com/example/shop.git\n" },
  "/work/shop/.git/HEAD": { file: "ref: refs/heads/main\n" },
};

const MANIFEST = { version: 1, name: "Shop", kind: "web",
  environments: [{ name: "local", base_url: "http://localhost:5174" }, { name: "production", base_url: "https://shop.example" }],
  services: [{ name: "Vite", url: "http://localhost:5174/", port: 5174 }, { name: "Site", url: "https://shop.example/", port: 443 }],
  surfaces: [] };

test("contexts: every workspace is personal by default; type and links survive a restart", { skip }, async () => {
  const h = harness();
  const listed = await h.services.listContexts();
  assert.deepEqual(listed.map(c => [c.uuid, c.type, c.container, c.container_label]),
    [[HOME, "personal", 0, null], [BV, "personal", 1, "Personal"], [APP, "personal", 2, "Work"]]);
  const events = [];
  h.services.on("contexts", () => events.push("contexts"));
  await h.services.setContextType(BV, "organization");
  await h.services.setContextType(APP, "project");
  await h.services.linkOrganization(APP, BV);
  await h.services.setEnginePreference(APP, "firefox");
  assert.ok(events.length >= 4);
  // "Restart": a new process-wide instance over the same profile files.
  const restarted = h.make();
  restarted.registerWindow(h.zen.window, h.adapter);
  const byUuid = Object.fromEntries((await restarted.listContexts()).map(c => [c.uuid, c]));
  assert.equal(byUuid[BV].type, "organization");
  assert.equal(byUuid[APP].type, "project");
  assert.equal(byUuid[APP].organization_uuid, BV);
  assert.equal(byUuid[APP].engine_preference, "gecko", "the deprecated firefox spelling is normalized on write");
  // Zen's own store was never written: the fake has no write API at all.
  assert.deepEqual(Object.keys(JSON.parse(h.storage.files.get("contexts.json"))), ["version", "contexts", "projects"]);
});

test("contexts: invalid changes are refused and nothing is written", { skip }, async () => {
  const h = harness();
  await assert.rejects(h.services.setContextType(GONE, "project"), error => error.code === "UNKNOWN_CONTEXT");
  await assert.rejects(h.services.setContextType(HOME, "team"), error => error.code === "INVALID_CONTEXT_TYPE");
  await assert.rejects(h.services.linkOrganization(HOME, BV), error => error.code === "CONTEXT_NOT_PROJECT");
  await h.services.setContextType(APP, "project");
  await assert.rejects(h.services.linkOrganization(APP, HOME), error => error.code === "NOT_AN_ORGANIZATION");
  await assert.rejects(h.services.linkOrganization(APP, APP), error => error.code === "INVALID_ORGANIZATION");
  await assert.rejects(h.services.linkProject(APP, "p_missing1"), error => error.code === "UNKNOWN_PROJECT");
  await assert.rejects(h.services.setEnginePreference(APP, "webkit"), error => error.code === "INVALID_ENGINE");
  const doc = JSON.parse(h.storage.files.get("contexts.json"));
  assert.deepEqual(doc.contexts.map(c => [c.workspace_uuid, c.type, c.organization_uuid]), [[APP, "project", null]]);
});

test("contexts: leaving type project or organization clears dependent links", { skip }, async () => {
  const h = harness({ tree: VITE_TREE });
  await h.services.setContextType(BV, "organization");
  await h.services.setContextType(APP, "project");
  await h.services.linkOrganization(APP, BV);
  const project = await h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST, contextUuid: null });
  await h.services.linkProject(APP, project.id);
  assert.equal((await h.services.getProject(project.id)).context_uuid, APP);
  await h.services.setContextType(BV, "personal");
  assert.equal((await h.services.getContext(APP)).organization_uuid, null);
  await h.services.setContextType(APP, "personal");
  const app = await h.services.getContext(APP);
  // Store v2: the type is a label; the project stays in its space.
  assert.deepEqual([app.type, app.project_id, app.project_ids], ["personal", project.id, [project.id]]);
  assert.equal((await h.services.getProject(project.id)).context_uuid, APP);
});

test("orphans: a deleted workspace's metadata is never applied and is removed only on request", { skip }, async () => {
  const h = harness();
  await h.services.setContextType(BV, "organization");
  await h.services.setContextType(APP, "project");
  await h.services.linkOrganization(APP, BV);
  assert.deepEqual(await h.services.listOrphans(), []);
  const attention = [];
  h.services.on("contexts", () => attention.push("contexts"));
  await h.zen.zen.changeWorkspaceWithID(APP);
  assert.deepEqual(attention, [], "a plain switch is not a context change");
  h.zen.setSpaces([{ uuid: HOME, name: "Home" }, { uuid: APP, name: "Shop app", containerTabId: 2 }]);
  h.zen.window.dispatch("ZenWorkspacesUIUpdate");
  assert.ok(attention.length >= 1, "deletion is observed through the adapter");
  assert.deepEqual((await h.services.listContexts()).map(c => c.uuid), [HOME, APP]);
  assert.deepEqual((await h.services.listOrphans()).map(meta => meta.workspace_uuid), [BV]);
  await assert.rejects(h.services.setContextType(BV, "personal"), error => error.code === "UNKNOWN_CONTEXT");
  // Live workspaces cannot be removed through the orphan path.
  assert.deepEqual(await h.services.removeOrphans([APP]), { removed: 0 });
  assert.deepEqual(await h.services.removeOrphans([BV]), { removed: 1 });
  assert.deepEqual(await h.services.listOrphans(), []);
  const app = await h.services.getContext(APP);
  assert.deepEqual([app.type, app.organization_uuid], ["project", null]);
  // With no synced window registered nothing can be judged an orphan.
  h.unregister();
  assert.deepEqual(await h.services.listOrphans(), []);
  await assert.rejects(h.services.removeOrphans([APP]), error => error.code === "INVALID_ORPHANS");
  assert.deepEqual(await h.services.listContexts(), []);
});

test("orphans: private windows never count as live contexts", { skip }, async () => {
  const h = harness();
  const privateWindow = fakeZenWindow({ spaces: [{ uuid: GONE, name: "Incognito" }], isPrivate: true });
  h.services.registerWindow(privateWindow.window, new ZenWorkspaceAdapter(privateWindow.window));
  assert.ok(!(await h.services.listContexts()).some(c => c.uuid === GONE));
});

test("detection reads only allowlisted regular files inside the root", { skip }, async () => {
  const h = harness({ tree: VITE_TREE });
  const draft = await h.services.detect("/work/shop");
  assert.ok(!h.fs.reads.some(path => path.includes(".env")), "never opens .env files");
  assert.ok(!h.fs.reads.includes("/private/outside.json"), "never reads through a symlink leaving the root");
  assert.ok(!h.fs.reads.includes("/work/shop/.git/HEAD"), "reads nothing else in .git");
  assert.ok(h.fs.reads.every(path => path.startsWith("/work/shop/")));
  const refused = Object.fromEntries(draft.refused.map(item => [item.path, item.reason]));
  assert.equal(refused["vercel.json"], "symlink_outside_root");
  assert.equal(refused["netlify.toml"], "invalid_utf8");
  assert.equal(refused["fly.toml"], "too_large");
  assert.equal(refused["go.mod"], "not_regular_file");
  assert.ok(draft.files_read.includes("package.json"));
  // In-root symlinks may only resolve to another allowlisted file.
  assert.equal(refused["wrangler.toml"], "not_allowlisted");
  assert.equal(refused["docker-compose.yml"], "not_allowlisted", "a symlink to .env is refused");
  assert.ok(draft.files_read.includes("compose.yaml"), "a symlink to another allowlisted file is allowed");
  assert.equal(draft.kind, "web");
  assert.ok(draft.environments.some(env => env.base_url.includes("5174")), JSON.stringify(draft.environments));
  assert.doesNotMatch(JSON.stringify(draft), /token|user:/u, "remote userinfo is stripped");
  await assert.rejects(h.services.detect("relative/path"), error => error.code === "INVALID_ROOT");
  await assert.rejects(h.services.detect("/work/shop/package.json"), error => error.code === "ROOT_NOT_DIRECTORY");
  await assert.rejects(h.services.detect("/missing"), error => error.code === "ROOT_NOT_FOUND");
  assert.equal(await h.services.pickFolder({}), "/work/shop");
});

test("projects: confirm, link to a context, map URLs, write the manifest only on request", { skip }, async () => {
  const h = harness({ tree: VITE_TREE });
  await h.services.detect("/work/shop");
  const project = await h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST, contextUuid: APP });
  assert.match(project.id, /^p_/u);
  assert.equal(project.manifest_state, "none");
  assert.equal(project.trusted, false);
  assert.equal(h.fs.writes.length, 0, "confirming never writes to the repository");
  const app = await h.services.getContext(APP);
  assert.deepEqual([app.type, app.project_id], ["personal", project.id], "adding a project never changes the space type");
  await assert.rejects(h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST }), error => error.code === "PROJECT_EXISTS");
  await assert.rejects(h.services.confirmProject({ root: "/work", manifest: { ...MANIFEST, name: "" } }));
  await assert.rejects(h.services.confirmProject({ root: "/work", manifest: { ...MANIFEST,
    surfaces: [{ name: "CI", url: "https://ci.example/?token=abc", kind: "ci" }] } }), error => error.code === "INVALID_MANIFEST");
  await assert.rejects(h.services.confirmProject({ root: "/work", manifest: { ...MANIFEST,
    surfaces: [{ name: "CI", url: "https://ci.example/sk-abcdefghijklmnop1234", kind: "ci" }] } }), error => error.code === "MANIFEST_SECRET");

  const match = await h.services.projectForUrl("http://localhost:5174/cart?x=1");
  assert.deepEqual([match.project.id, match.environment.name], [project.id, "local"]);
  assert.equal((await h.services.projectForUrl("https://shop.example/a", APP)).environment.name, "production");
  assert.equal(await h.services.projectForUrl("https://other.example/"), null);

  const { path } = await h.services.writeManifest(project.id);
  assert.equal(path, "/work/shop/.axiosozo/project.json");
  const written = JSON.parse(h.fs.nodes.get(path).file);
  assert.equal(written.name, "Shop");
  assert.doesNotMatch(h.fs.nodes.get(path).file, /\/work\/shop|p_fixture/u, "no local path or profile id in the manifest");
  assert.equal((await h.services.getProject(project.id)).manifest_state, "written");

  // Re-detection reads the committed manifest; confirming it unchanged records "external".
  const other = harness({ tree: { ...VITE_TREE, "/work/shop/.axiosozo": { dir: true },
    "/work/shop/.axiosozo/project.json": { file: h.fs.nodes.get(path).file } } });
  await other.services.detect("/work/shop");
  assert.equal((await other.services.confirmProject({ root: "/work/shop", manifest: MANIFEST })).manifest_state, "external");

  const updated = await h.services.updateProject(project.id, { context_uuid: null });
  assert.equal(updated.context_uuid, null);
  assert.equal((await h.services.getContext(APP)).project_id, null);
  await assert.rejects(h.services.updateProject(project.id, { root: "/elsewhere" }), error => error.code === "INVALID_PROJECT_PATCH");
  await h.services.linkProject(APP, project.id);
  await h.services.removeProject(project.id);
  assert.deepEqual(await h.services.listProjects(), []);
  assert.equal((await h.services.getContext(APP)).project_id, null);
});

test("writeManifest refuses a symlinked .axiosozo directory", { skip }, async () => {
  const h = harness({ tree: { ...VITE_TREE, "/work/shop/.axiosozo": { link: "/private" } } });
  const project = await h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST });
  await assert.rejects(h.services.writeManifest(project.id), /MANIFEST_DIR_REFUSED/u);
  assert.equal((await h.services.getProject(project.id)).manifest_state, "none");
  assert.deepEqual(h.fs.writes, [], "nothing was created through the link");
});

const VICTIM = "/private/victim.txt";
const victimTree = extra => ({ ...VITE_TREE, [VICTIM]: { file: "user data must survive" }, ...extra });
const tempsIn = (fs, dir) => [...fs.nodes.keys()].filter(path => path.startsWith(dir + "/") && path.endsWith(".tmp"));

test("writeManifest never follows a planted project.json.tmp link (H1)", { skip }, async () => {
  const h = harness({ tree: victimTree({ "/work/shop/.axiosozo": { dir: true },
    "/work/shop/.axiosozo/project.json.tmp": { link: VICTIM } }) });
  const project = await h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST });
  const { path } = await h.services.writeManifest(project.id);
  assert.equal(h.fs.nodes.get(VICTIM).file, "user data must survive", "the link target is neither truncated nor written");
  assert.deepEqual(h.fs.nodes.get("/work/shop/.axiosozo/project.json.tmp"), { link: VICTIM }, "the planted link is left alone");
  assert.equal(JSON.parse(h.fs.nodes.get(path).file).name, "Shop");
  assert.equal(h.fs.writes.length, 1);
  assert.match(h.fs.writes[0], /^\/work\/shop\/\.axiosozo\/\.project\.json\.tmp_fixture\d+\.tmp$/u, "unpredictable temp name in .axiosozo");
  assert.deepEqual(tempsIn(h.fs, "/work/shop/.axiosozo").filter(p => !h.fs.nodes.get(p).link), [], "no temp file is left behind");
});

test("writeManifest: a planted link at the exact temp name makes the exclusive create fail closed", { skip }, async () => {
  const planted = {};
  for (let n = 1; n <= 4; n++) planted[`/work/shop/.axiosozo/.project.json.tmp_fixture${n}.tmp`] = { link: VICTIM };
  const h = harness({ tree: victimTree({ "/work/shop/.axiosozo": { dir: true }, ...planted }) });
  const project = await h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST });
  await assert.rejects(h.services.writeManifest(project.id), error => error.code === "EEXIST");
  assert.equal(h.fs.nodes.get(VICTIM).file, "user data must survive");
  for (const link of Object.keys(planted)) assert.deepEqual(h.fs.nodes.get(link), { link: VICTIM }, "someone else's entry is not removed");
  assert.equal(h.fs.nodes.has("/work/shop/.axiosozo/project.json"), false);
  assert.equal((await h.services.getProject(project.id)).manifest_state, "none");
});

test("writeManifest refuses a symlinked or non-regular project.json", { skip }, async () => {
  for (const node of [{ link: VICTIM }, { link: "/private" }, { dir: true }]) {
    const h = harness({ tree: victimTree({ "/work/shop/.axiosozo": { dir: true }, "/work/shop/.axiosozo/project.json": node }) });
    const project = await h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST });
    await assert.rejects(h.services.writeManifest(project.id), /MANIFEST_TARGET_REFUSED/u);
    assert.equal(h.fs.nodes.get(VICTIM).file, "user data must survive");
    assert.deepEqual(h.fs.writes, [], "refused before anything is created");
  }
});

test("writeManifest re-checks right before the rename and cleans up its temp file", { skip }, async () => {
  // project.json swapped for a link to a directory after the first check: IOUtils.move
  // would move the temp file *into* that directory, so the pre-rename re-check must stop it.
  let h = harness({ tree: victimTree({ "/work/shop/.axiosozo": { dir: true } }), hooks: {
    beforeWriteNew: (_path, nodes) => nodes.set("/work/shop/.axiosozo/project.json", { link: "/private" }) } });
  let project = await h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST });
  await assert.rejects(h.services.writeManifest(project.id), /MANIFEST_TARGET_REFUSED/u);
  assert.deepEqual(tempsIn(h.fs, "/work/shop/.axiosozo"), [], "temp removed");
  assert.deepEqual([...h.fs.nodes.keys()].filter(p => p.startsWith("/private/") && p !== "/private/outside.json" && p !== VICTIM), []);
  assert.equal((await h.services.getProject(project.id)).manifest_state, "none");

  // .axiosozo swapped for a link while the temp file is being created: the
  // exclusive create lands outside, the re-check refuses and the file is removed.
  h = harness({ tree: victimTree({ "/work/shop/.axiosozo": { dir: true } }), hooks: {
    beforeWriteNew: (_path, nodes) => nodes.set("/work/shop/.axiosozo", { link: "/private" }) } });
  project = await h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST });
  await assert.rejects(h.services.writeManifest(project.id), /MANIFEST_DIR_REFUSED/u);
  assert.equal(h.fs.nodes.get(VICTIM).file, "user data must survive");
  assert.deepEqual(tempsIn(h.fs, "/private"), [], "the stray temp file is removed through the same path");
  assert.equal(h.fs.nodes.has("/private/project.json"), false, "never renamed onto the link target");
});

test("detection refuses a file whose path changed between the check and the read (L6)", { skip }, async () => {
  const tree = { ...VITE_TREE, "/work/shop/.vercel": { dir: true },
    "/work/shop/.vercel/project.json": { file: JSON.stringify({ projectName: "inside" }) },
    "/private/vercel": { dir: true }, "/private/vercel/project.json": { file: JSON.stringify({ projectName: "outside-secret" }) } };
  const h = harness({ tree, hooks: { beforeRead: (path, nodes) => {
    if (path === "/work/shop/.vercel/project.json") nodes.set("/work/shop/.vercel", { link: "/private/vercel" });
  } } });
  const draft = await h.services.detect("/work/shop");
  const refused = Object.fromEntries(draft.refused.map(item => [item.path, item.reason]));
  assert.equal(refused[".vercel/project.json"], "unreadable");
  assert.ok(!draft.files_read.includes(".vercel/project.json"));
  assert.doesNotMatch(JSON.stringify(draft), /outside-secret/u);
});

test("service status connects only to loopback on declared ports, on request, rate-limited (M1)", { skip }, async () => {
  let down = true;
  const h = harness({ tree: VITE_TREE, probe: target => (down ? "down" : "up") });
  const manifest = { ...MANIFEST, services: [...MANIFEST.services,
    { name: "Api", url: "http://127.0.0.1:8787/", port: 8787 }, { name: "V6", url: "http://[::1]:9000/", port: 9000 },
    { name: "Lan", url: "http://192.168.1.10:3000/", port: 3000 }, { name: "Alias", url: "http://localhost.example/", port: 80 }] };
  const project = await h.services.confirmProject({ root: "/work/shop", manifest });
  assert.deepEqual(await h.services.needsAttention(), []);
  assert.equal(h.probes.length, 0, "nothing is probed until requested");
  const events = [];
  h.services.on("attention", () => events.push("attention"));
  const first = await h.services.serviceStatus(project.id);
  assert.deepEqual(first.map(s => [s.name, s.status]),
    [["Vite", "down"], ["Site", "unknown"], ["Api", "down"], ["V6", "down"], ["Lan", "unknown"], ["Alias", "unknown"]]);
  // Only loopback literals, only declared ports; remote, LAN and look-alike hosts get no network at all.
  assert.deepEqual(h.probes.map(p => [p.address, p.port]).sort(), [["127.0.0.1", 5174], ["::1", 5174], ["127.0.0.1", 8787], ["::1", 9000]].sort());
  assert.ok(h.probes.every(p => p.timeoutMs > 0 && Object.keys(p).sort().join() === "address,port,timeoutMs"), "no URL or host name is handed to the prober");
  assert.equal(first.find(s => s.name === "Site").checked_at, null);
  assert.ok(events.length >= 1);
  const attention = await h.services.needsAttention();
  assert.deepEqual(attention.map(a => [a.kind, a.target.service]).sort(), [["service_down", "Api"], ["service_down", "V6"], ["service_down", "Vite"]]);
  down = false;
  await h.services.serviceStatus(project.id);
  assert.equal(h.probes.length, 4, "a second request inside the interval reuses the result");
  h.advance(PROBE_MIN_INTERVAL_MS);
  const again = await h.services.serviceStatus(project.id);
  assert.equal(h.probes.length, 7, "localhost answers on 127.0.0.1 first; ::1 is tried only when that is down");
  assert.equal(again[0].status, "up");
  assert.deepEqual(await h.services.needsAttention(), []);
  h.advance(PROBE_MIN_INTERVAL_MS);
  await Promise.all([h.services.serviceStatus(project.id), h.services.serviceStatus(project.id)]);
  assert.equal(h.probes.length, 10, "concurrent requests share one probe per service");
  await assert.rejects(h.services.serviceStatus("p_unknown1"), error => error.code === "UNKNOWN_PROJECT");
  assert.deepEqual(loopbackAddresses("http://localhost:1/"), ["127.0.0.1", "::1"]);
  for (const url of ["https://shop.example/", "http://127.0.0.2/", "http://0.0.0.0/", "http://localhost.:5/", "ftp://localhost/", "http://[::ffff:127.0.0.1]/"])
    assert.equal(loopbackAddresses(url), null, url);
});

test("rules: create with defaults, update, delete; Jev settings validated", { skip }, async () => {
  const h = harness();
  const rule = await h.services.saveRule({ match: { hosts: ["x.com", "*.x.com"] }, instruction: "Post, then leave.",
    limits: { daily_minutes: 15, allowed_hours: null } });
  assert.match(rule.id, /^r_/u);
  assert.deepEqual([rule.enabled, rule.contexts, rule.observation, rule.override], [true, "all", "none", "confirm"]);
  assert.equal(rule.created_at, NOON);
  h.advance(1000);
  const edited = await h.services.saveRule({ ...rule, effects: ["nudge", "pause_site"] });
  assert.deepEqual([edited.created_at, edited.updated_at], [NOON, NOON + 1000]);
  await assert.rejects(h.services.saveRule({ ...rule, observation: "everything" }));
  await assert.rejects(h.services.saveRule({ id: "r_missing1", match: { hosts: ["a.test"] } }), error => error.code === "UNKNOWN_RULE");
  await assert.rejects(h.services.saveRule({ match: { hosts: ["*"] } }));
  assert.equal((await h.services.listRules()).length, 1);
  assert.deepEqual(await h.services.getJevSettings(), { consent: false, interval_minutes: 5, hourly_budget: 30 });
  assert.deepEqual(await h.services.setJevSettings({ interval_minutes: 10 }), { consent: false, interval_minutes: 10, hourly_budget: 30 });
  await assert.rejects(h.services.setJevSettings({ interval_minutes: 99 }));
  await assert.rejects(h.services.setJevSettings({ key: "sk-never" }), error => error.code === "INVALID_JEV_SETTINGS");
  await h.services.deleteRule(rule.id);
  assert.deepEqual(await h.services.listRules(), []);
});

test("ledger: private and malformed records are ignored; batching, limits and export", { skip }, async () => {
  const h = harness();
  const rule = await h.services.saveRule({ match: { hosts: ["*.x.com", "x.com"] }, limits: { daily_minutes: 15, allowed_hours: null } });
  const scoped = await h.services.saveRule({ match: { hosts: ["news.test"] }, contexts: { types: ["organization"] },
    limits: { daily_minutes: 1, allowed_hours: null } });
  assert.equal(h.services.recordForeground({ host: "x.com", contextUuid: HOME, ms: 60000, isPrivate: true }), false);
  assert.equal(h.services.recordForeground({ host: "bad host", contextUuid: HOME, ms: 1 }), false);
  assert.equal(h.services.recordForeground({ host: "x.com", contextUuid: "nope", ms: 1 }), false);
  assert.equal(h.services.recordForeground({ host: "x.com", contextUuid: HOME, ms: -5 }), false);
  assert.equal(h.services.recordForeground({ host: "X.com.", contextUuid: HOME, ms: 10 * 60000 }), true);
  assert.equal(h.services.recordForeground({ host: "m.x.com", contextUuid: null, ms: 5 * 60000, isPrivate: false }), true);
  assert.equal(h.services.recordForeground({ host: "news.test", contextUuid: HOME, ms: 5 * 60000 }), true);
  assert.equal(h.storage.files.has("usage-ledger.json"), false, "batched, not yet written");
  assert.equal(await h.services.usageFor({ hosts: ["x.com", "*.x.com"] }), 15 * 60000);
  let attention = await h.services.needsAttention();
  assert.deepEqual(attention.map(a => [a.kind, a.target.id]), [["rule_limit_reached", rule.id]]);
  assert.match(attention[0].detail, /15 of 15 minutes/u);
  // The scoped rule counts only organization contexts.
  await h.services.setContextType(BV, "organization");
  h.services.recordForeground({ host: "news.test", contextUuid: BV, ms: 60000 });
  attention = await h.services.needsAttention();
  assert.deepEqual(attention.map(a => a.target.id).sort(), [rule.id, scoped.id].sort());

  assert.equal(h.timers.queue.length, 1);
  assert.equal(h.timers.queue[0].ms, LEDGER_FLUSH_MS);
  await h.timers.runAll();
  const stored = JSON.parse(h.storage.files.get("usage-ledger.json"));
  assert.equal(stored.records.length, 4);
  assert.ok(!JSON.stringify(stored).includes("X.com"));
  const summary = await h.services.usageSummary({ days: 7 });
  assert.ok(summary.some(row => row.host === "x.com"));
  const exported = JSON.parse(await h.services.exportLedger());
  assert.equal(exported.records.length, 4);
  // A second day with an explicit runtime-provided day.
  h.services.recordForeground({ host: "x.com", contextUuid: HOME, ms: 1000, day: "2026-09-26" });
  assert.equal(h.shutdown.length, 1);
  await h.shutdown[0]();
  assert.equal(JSON.parse(h.storage.files.get("usage-ledger.json")).records.length, 5);
  await h.services.clearLedger();
  assert.deepEqual(JSON.parse(h.storage.files.get("usage-ledger.json")).records, []);
  assert.deepEqual(await h.services.needsAttention(), []);
});

test("ledger: an invalid ledger file is never overwritten and pending time is kept, bounded", { skip }, async () => {
  const h = harness();
  h.storage.files.set("usage-ledger.json", "{\"version\":1,\"records\":\"corrupt\"}");
  h.services.recordForeground({ host: "x.com", contextUuid: HOME, ms: 1000 });
  await assert.rejects(h.services.flushLedger(), error => error.code === "INVALID_STORE");
  assert.equal(h.storage.files.get("usage-ledger.json"), "{\"version\":1,\"records\":\"corrupt\"}");
  // Repeated time for the same host/context merges; distinct entries are capped.
  for (let i = 0; i < 50; i++) assert.equal(h.services.recordForeground({ host: "x.com", contextUuid: HOME, ms: 1000 }), true);
  let accepted = 1;
  for (let i = 0; i < MAX_PENDING_LEDGER + 10; i++) if (h.services.recordForeground({ host: `h${i}.test`, contextUuid: HOME, ms: 1 })) accepted++;
  assert.equal(accepted, MAX_PENDING_LEDGER, "no more than MAX_PENDING_LEDGER distinct pending entries");
  assert.equal(h.services.recordForeground({ host: "x.com", contextUuid: HOME, ms: 1000 }), true, "known entries still merge");
  await assert.rejects(h.services.flushLedger(), error => error.code === "INVALID_STORE");
  h.storage.files.delete("usage-ledger.json");
  await h.services.flushLedger();
  const records = JSON.parse(h.storage.files.get("usage-ledger.json")).records;
  assert.equal(records.length, MAX_PENDING_LEDGER);
  assert.equal(records.find(r => r.host === "x.com").foreground_ms, 52000);
});

test("events, navigation helpers and process singletons", { skip }, async () => {
  const h = harness({ tree: VITE_TREE });
  assert.throws(() => h.services.on("everything", () => {}), error => error.code === "INVALID_EVENT");
  const off = h.services.on("rules", () => { throw new Error("listener failure is contained"); });
  const originalError = console.error; console.error = () => {};
  try { await h.services.saveRule({ match: { hosts: ["a.test"] } }); } finally { console.error = originalError; }
  off();
  assert.deepEqual(await h.services.openContext({ uuid: BV, window: h.zen.window }), { opened: true });
  assert.equal(h.zen.zen.activeWorkspace, BV);
  const project = await h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST, contextUuid: APP });
  assert.ok(project);
  await h.services.openUrl({ url: "http://localhost:5174/cart", window: h.zen.window });
  const { principal, ...opened } = h.zen.opened.at(-1);
  assert.deepEqual(opened, { url: "http://localhost:5174/cart", where: "tab", workspace: APP });
  // L2: page/manifest URLs load with a null principal in the workspace's container, never the system principal.
  assert.deepEqual([principal.kind, principal.isSystemPrincipal, principal.originAttributes], ["null", false, { userContextId: 2 }]);
  await h.services.openUrl("https://example.test/", { contextUuid: HOME, window: h.zen.window });
  assert.equal(h.zen.opened.at(-1).workspace, HOME);
  assert.deepEqual(h.zen.opened.at(-1).principal.originAttributes, { userContextId: 0 });
  assert.ok(h.zen.opened.every(entry => entry.principal.isSystemPrincipal === false));
  for (const bad of ["javascript:alert(1)", "about:config", "https://a:b@example.test/", "chrome://browser/content/browser.xhtml"]) {
    await assert.rejects(h.services.openUrl({ url: bad, window: h.zen.window }), error => error.code === "INVALID_URL");
  }
  await assert.rejects(h.services.openContext(GONE), error => error.code === "UNKNOWN_CONTEXT");
  let built = 0;
  assert.equal(processSingleton("test-key", () => ++built), 1);
  assert.equal(processSingleton("test-key", () => ++built), 1);
});

test("chromeFileSystem.lstat: an absent path is null (nsIFile.isSymlink throws for missing entries)", { skip }, async () => {
  // Models nsLocalFileUnix: exists() follows links, isSymlink() lstat()s and
  // throws NS_ERROR_FILE_NOT_FOUND when nothing is there. Found in the H3 GUI
  // run: every absent allowlisted file was reported as "could not be read".
  const { chromeFileSystem } = await import("../chrome/AxioSozoServices.sys.mjs");
  const tree = { "/r": { dir: true }, "/r/package.json": { file: 10 }, "/r/dangling": { link: "/nowhere" } };
  const makeFile = () => ({
    path: null,
    initWithPath(path) { this.path = path; },
    exists() { const n = tree[this.path]; return !!n && (!n.link || !!tree[n.link]); },
    isSymlink() { const n = tree[this.path]; if (!n) throw new Error("NS_ERROR_FILE_NOT_FOUND"); return !!n.link; },
    isFile() { return !!tree[this.path]?.file; },
    isDirectory() { return !!tree[this.path]?.dir; },
    get fileSize() { return tree[this.path]?.file ?? 0; },
  });
  const saved = { Cc: globalThis.Cc, Ci: globalThis.Ci };
  globalThis.Cc = { "@mozilla.org/file/local;1": { createInstance: () => makeFile() } };
  globalThis.Ci = { nsIFile: {} };
  try {
    const fs = chromeFileSystem();
    assert.equal(await fs.lstat("/r/vercel.json"), null);
    assert.equal(await fs.lstat("/r/.axiosozo/project.json"), null);
    assert.deepEqual(await fs.lstat("/r/package.json"), { type: "regular", size: 10 });
    assert.deepEqual(await fs.lstat("/r/dangling"), { type: "symlink", size: 0 });
    assert.deepEqual(await fs.lstat("/r"), { type: "directory", size: 0 });
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});

test("tcpProbe: up on STATUS_CONNECTED_TO, down on refusal or timeout, never contacts non-loopback", { skip }, async () => {
  // Models the pinned nsSocketTransport observed in the H3 GUI run: status
  // events for a listening port end with STATUS_CONNECTED_TO; a refused port
  // wakes the input stream whose available() throws NS_ERROR_CONNECTION_REFUSED.
  const { tcpProbe } = await import("../chrome/AxioSozoServices.sys.mjs");
  const STATUS_CONNECTED_TO = 0x4b0004;
  const created = [];
  const scenario = { mode: "listening" };
  const saved = { Cc: globalThis.Cc, Ci: globalThis.Ci, Cr: globalThis.Cr, Services: globalThis.Services };
  globalThis.Ci = { nsISocketTransportService: {}, nsIAsyncInputStream: {},
    nsISocketTransport: { TIMEOUT_CONNECT: 0, STATUS_CONNECTED_TO } };
  globalThis.Cr = { NS_OK: 0, NS_BASE_STREAM_CLOSED: 0x80470002, NS_ERROR_CONNECTION_REFUSED: 0x804b000d };
  globalThis.Services = { tm: { currentThread: {} } };
  globalThis.Cc = { "@mozilla.org/network/socket-transport-service;1": { getService: () => ({
    createTransport(_types, host, port) {
      const t = { host, port, closed: false, sink: null,
        setTimeout() {}, setEventSink(sink) { t.sink = sink; }, close() { t.closed = true; },
        openInputStream() {
          return { QueryInterface() { return this; }, asyncWait(callback) {
            queueMicrotask(() => {
              if (scenario.mode === "listening") t.sink.onTransportStatus(t, STATUS_CONNECTED_TO);
              if (scenario.mode === "refused") callback.onInputStreamReady({ available() {
                throw Object.assign(new Error("refused"), { result: globalThis.Cr.NS_ERROR_CONNECTION_REFUSED }); } });
              // "silent": nothing happens until the timer fires
            });
          } };
        } };
      created.push(t);
      return t;
    } }) } };
  const timers = { setTimeout: (fn, ms) => setTimeout(fn, Math.min(ms, 20)), clearTimeout: id => clearTimeout(id) };
  try {
    assert.equal(await tcpProbe({ address: "127.0.0.1", port: 5173, timeoutMs: 2000 }, timers), "up");
    scenario.mode = "refused";
    assert.equal(await tcpProbe({ address: "::1", port: 5199, timeoutMs: 2000 }, timers), "down");
    scenario.mode = "silent";
    assert.equal(await tcpProbe({ address: "127.0.0.1", port: 5174, timeoutMs: 2000 }, timers), "down");
    const before = created.length;
    assert.equal(await tcpProbe({ address: "203.0.113.5", port: 443, timeoutMs: 2000 }, timers), "unknown");
    assert.equal(created.length, before, "no transport for a non-loopback address");
    assert.ok(created.every(t => t.closed), "every transport is closed");
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});

test("Overview rule editor contract: a new rule is saved without the model's placeholder id", { skip }, async () => {
  // Found in the H3 GUI run: the page sent formToRule's generated id for a new
  // rule and saveRule refused it with UNKNOWN_RULE. The page now omits the id
  // for new rules (about-axiosozo.mjs save()); edits keep the stored id.
  const M = await import("../chrome/overview/overview-model.mjs");
  const h = harness();
  const form = { ...M.emptyRuleForm(), hostsText: "localhost", instruction: "Check the dev build only.",
    effects: ["nudge", "pause_site"], windows: [{ start: "15:00", end: "16:00", days: [] }] };
  const { rule: draft, errors } = M.formToRule(form, { now: NOON, id: M.newRuleId(new Uint8Array(12)) });
  assert.deepEqual(errors, []);
  await assert.rejects(h.services.saveRule(draft), error => error.code === "UNKNOWN_RULE");
  const { id: _placeholder, ...payload } = draft;
  const saved = await h.services.saveRule(payload);
  assert.match(saved.id, /^r_[a-z0-9]{4,32}$/u);
  assert.deepEqual(saved.limits.allowed_hours, [{ start: "15:00", end: "16:00" }]);
  const { rule: edited } = M.formToRule({ ...M.ruleToForm(saved), dailyMinutes: "1" }, { now: NOON + 1, id: M.newRuleId(new Uint8Array(12)) });
  assert.equal(edited.id, saved.id, "an edit keeps the stored id");
  assert.equal((await h.services.saveRule(edited)).limits.daily_minutes, 1);
  const page = (await import("node:fs")).readFileSync(new URL("../chrome/overview/about-axiosozo.mjs", import.meta.url), "utf8");
  assert.match(page, /if \(!rule\) delete payload\.id;/u, "the page drops the placeholder id for new rules");
});

test("store v3: a v1 contexts.json is migrated on load and written back as v3 once", { skip }, async () => {
  const h = harness();
  const project = { version: 1, id: "p_legacy1", root: "/work/shop", manifest: MANIFEST, manifest_state: "none",
    context_uuid: null, trusted: false, created_at: 5, updated_at: 5 };
  const v1 = { version: 1, projects: [project], contexts: [
    { version: 1, workspace_uuid: APP, type: "project", organization_uuid: null, project_id: "p_legacy1", engine_preference: null, updated_at: 5 }] };
  h.storage.files.set("contexts.json", JSON.stringify(v1));
  const services = h.make();
  services.registerWindow(h.zen.window, h.adapter);
  const [listed] = await services.listProjects();
  assert.equal(listed.context_uuid, APP, "the v1 link becomes projects[].context_uuid");
  const written = JSON.parse(h.storage.files.get("contexts.json"));
  assert.equal(written.version, 3);
  assert.equal(written.projects[0].version, 2);
  assert.equal(written.contexts[0].project_id, null, "the deprecated mirror is cleared");
  assert.equal(written.projects[0].updated_at, 5, "migration changes nothing else");
  const before = h.storage.files.get("contexts.json");
  await services.listContexts();
  assert.equal(h.storage.files.get("contexts.json"), before, "written once");
  // An invalid file is still never overwritten.
  h.storage.files.set("contexts.json", "{\"version\":1,\"contexts\":\"x\"}");
  const broken = h.make();
  await assert.rejects(broken.listProjects(), error => error.code === "INVALID_STORE");
  assert.equal(h.storage.files.get("contexts.json"), "{\"version\":1,\"contexts\":\"x\"}");
});

test("projects live in any space: several per space, personal spaces included, moved with linkProject", { skip }, async () => {
  const h = harness({ tree: { ...VITE_TREE, "/work/docs": { dir: true } } });
  const shop = await h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST, contextUuid: HOME });
  const docs = await h.services.confirmProject({ root: "/work/docs", manifest: { ...MANIFEST, name: "Docs",
    environments: [{ name: "local", base_url: "http://localhost:4321" }], services: [] }, contextUuid: HOME });
  const home = await h.services.getContext(HOME);
  assert.deepEqual([home.type, home.project_ids], ["personal", [shop.id, docs.id]]);
  await h.services.linkProject(BV, docs.id);
  assert.deepEqual((await h.services.getContext(HOME)).project_ids, [shop.id]);
  assert.deepEqual((await h.services.getContext(BV)).project_ids, [docs.id]);
  assert.equal((await h.services.getContext(BV)).type, "personal", "never forced to type project");
  await h.services.linkProject(HOME, null);
  assert.equal((await h.services.getProject(shop.id)).context_uuid, null);
  assert.equal((await h.services.getProject(docs.id)).context_uuid, BV, "only that space's projects are released");
  const stored = JSON.parse(h.storage.files.get("contexts.json"));
  assert.equal(stored.version, 3);
  assert.ok(stored.projects.every(project => project.version === 2));
  assert.ok(stored.contexts.every(meta => meta.project_id === null));
});

test("projectForUrl links tabs by URL: loopback aliases, the active space first, app of the environment", { skip }, async () => {
  const h = harness({ tree: { ...VITE_TREE, "/work/domo": { dir: true } } });
  const domo = await h.services.confirmProject({ root: "/work/domo", contextUuid: APP, manifest: { version: 2, name: "Domo", kind: "desktop",
    environments: [{ name: "local", app: "desktop", base_url: "http://localhost:1420" }, { name: "local", app: "web", base_url: "http://localhost:5173" }],
    services: [], surfaces: [] } });
  const other = await h.services.confirmProject({ root: "/work/shop", contextUuid: HOME, manifest: { ...MANIFEST,
    environments: [{ name: "local", base_url: "http://localhost:5173" }] } });
  const inApp = await h.services.projectForUrl("http://127.0.0.1:5173/board?x=1", APP);
  assert.deepEqual([inApp.project.id, inApp.environment.name, inApp.app, inApp.ambiguous], [domo.id, "local", "web", false]);
  const inHome = await h.services.projectForUrl("http://localhost:5173/", HOME);
  assert.equal(inHome.project.id, other.id);
  assert.equal((await h.services.projectForUrl("http://localhost:1420/", HOME)).app, "desktop");
  assert.equal(await h.services.projectForUrl("http://0.0.0.0:5173/"), null, "0.0.0.0 is not a loopback alias");
  // Editing environments re-links at once: the next lookup sees the new URL.
  await h.services.updateProject(domo.id, { manifest: { version: 1, name: "Domo", kind: "web",
    environments: [{ name: "local", base_url: "http://localhost:5180" }], services: [], surfaces: [] } });
  assert.equal((await h.services.projectForUrl("http://localhost:5180/x", APP)).project.id, domo.id);
});

test("activeContext reports the requesting window's space and nothing for private windows", { skip }, async () => {
  const h = harness();
  await h.zen.zen.changeWorkspaceWithID(BV);
  assert.deepEqual(await h.services.activeContext({ window: h.zen.window }), { uuid: BV });
  const privateZen = fakeZenWindow({ spaces: [{ uuid: HOME, name: "Home" }], isPrivate: true });
  h.services.registerWindow(privateZen.window, new ZenWorkspaceAdapter(privateZen.window));
  assert.deepEqual(await h.services.activeContext({ window: privateZen.window }), { uuid: null });
});

// ── Plan 4 step 1: detection v2, store v3 persistence, records v2, arrival ──

const code = expected => error => error?.code === expected;
const RICH_TREE = {
  "/work": { dir: true },
  "/work/shop": { dir: true },
  "/work/shop/package.json": { file: JSON.stringify({ name: "shop", scripts: { dev: "vite --port 5174" },
    dependencies: { "@clerk/clerk-react": "1", convex: "1" }, devDependencies: { vite: "^5" } }) },
  "/work/shop/convex.json": { file: JSON.stringify({ functions: "convex/" }) },
  "/work/shop/convex": { dir: true },
  "/work/shop/vercel.json": { file: JSON.stringify({ redirects: [{ source: "/a", destination: "https://app.shop-product.dev/" }] }) },
  "/work/shop/docs": { dir: true },
  "/work/shop/docs/domains.md": { file: "Production: `api.shop-product.dev`\n" },
  "/work/shop/AGENTS.md": { file: "TRAP-AGENTS-CONTENT" },
  "/work/shop/CLAUDE.md": { file: "TRAP-CLAUDE-CONTENT" },
  "/work/shop/.claude": { dir: true },
  "/work/shop/.claude/settings.json": { file: "TRAP-CLAUDE-SETTINGS" },
  "/work/shop/.env": { file: "SECRET=never-read" },
  "/work/shop/.git": { dir: true },
  "/work/shop/apps": { dir: true },
  "/work/shop/apps/web": { dir: true },
  "/work/shop/ios": { dir: true },
  "/work/shop/ios/Shop.xcodeproj": { dir: true },
  "/work/shop/ios/Shop.xcodeproj/project.pbxproj": { file: "TRAP-XCODE" },
  "/work/other": { dir: true },
};
const neverRead = /\.env|AGENTS|CLAUDE|\.claude|xcodeproj|pbxproj/u;

test("detection v2 runs every phase through the containment reader; agent files and native folders are names only", { skip }, async () => {
  const h = harness({ tree: RICH_TREE });
  const draft = await h.services.detect("/work/shop");
  assert.equal(draft.version, 2);
  assert.deepEqual(draft.integrations.map(item => item.id), ["vercel", "convex", "clerk"]);
  assert.deepEqual(draft.platforms.map(item => [item.kind, item.name]), [["ios", "Shop"]]);
  assert.deepEqual(draft.domains.map(item => [item.host, item.origin, item.confirmed]),
    [["app.shop-product.dev", "vercel_json", false], ["api.shop-product.dev", "docs", false]]);
  assert.deepEqual(draft.agents, { files: ["AGENTS.md", "CLAUDE.md"], dirs: [".claude"], worktrees: 0 });
  assert.ok(h.fs.reads.length > 0 && h.fs.reads.every(path => path.startsWith("/work/shop/")));
  assert.ok(!h.fs.reads.some(path => neverRead.test(path)), JSON.stringify(h.fs.reads));
  assert.doesNotMatch(JSON.stringify(draft), /TRAP|SECRET/u);
  assert.ok(h.reader.calls.some(([kind, path]) => kind === "list" && path === "/work/shop/ios"), "native folders are listed by name");
});

test("without a containment reader nothing is read; the native reader is made only for an admitted detection", { skip }, async () => {
  const none = harness({ tree: RICH_TREE, deps: { reader: null } });
  await assert.rejects(none.services.detect("/work/shop"), code("READ_CONTAINMENT_UNAVAILABLE"));
  await assert.rejects(none.services.confirmProject({ root: "/work/shop", manifest: MANIFEST }), code("READ_CONTAINMENT_UNAVAILABLE"));
  assert.deepEqual(none.fs.reads, []);
  assert.deepEqual(await none.services.listProjects(), [], "nothing is stored without a fresh detection");
  let created = 0;
  const lazy = harness({ tree: RICH_TREE, deps: { reader: null, createReader: async () => { created++; return lazy.reader; } } });
  await lazy.services.listProjects();
  await lazy.services.listContexts();
  assert.equal(created, 0, "loading the service or the store creates no reader");
  assert.equal((await lazy.services.detect("/work/shop")).version, 2);
  assert.equal(created, 1);
  const broken = harness({ tree: RICH_TREE, deps: { reader: null, createReader: async () => { throw new Error("helper checksum mismatch"); } } });
  await assert.rejects(broken.services.detect("/work/shop"), error => error.code === "READ_CONTAINMENT_UNAVAILABLE" && !/checksum/u.test(error.message));
});

test("settings, key and profile folders are refused by name and resolved path before any reader call", { skip }, async () => {
  const tree = { ...RICH_TREE, "/Users": { dir: true }, "/Users/synthetic": { dir: true }, "/Users/synthetic/.ssh": { dir: true },
    "/Users/synthetic/.ssh/package.json": { file: "{\"name\":\"TRAP\"}" }, "/Users/synthetic/Library": { dir: true },
    "/Users/synthetic/.codex": { dir: true }, "/profiles": { dir: true }, "/profiles/synthetic": { dir: true },
    "/work/keys": { link: "/Users/synthetic/.ssh" } };
  const h = harness({ tree, deps: { home: "/Users/synthetic", profileDir: "/profiles/synthetic" } });
  for (const root of ["/Users/synthetic/.ssh", "/Users/synthetic/Library", "/Users/synthetic/.codex", "/profiles/synthetic", "/work/keys", "/System", "/etc"]) {
    await assert.rejects(h.services.detect(root), code("ROOT_DENIED"), root);
  }
  assert.deepEqual(h.reader.calls, [], "no metadata, listing or content request reached the reader");
  assert.deepEqual(h.fs.reads, []);
});

test("confirm detects the picked folder again: a same-path replacement is read afresh, a moved root is refused, duplicates by canonical root", { skip }, async () => {
  const tree = { ...RICH_TREE, "/work/link": { link: "/work/shop" } };
  const h = harness({ tree });
  const preview = await h.services.detect("/work/shop");
  assert.ok(!preview.integrations.some(item => item.id === "stripe"));
  // A different folder now sits at the same path (new identities, new content).
  for (const key of [...h.fs.nodes.keys()]) if (key.startsWith("/work/shop/")) h.fs.nodes.delete(key);
  h.fs.nodes.set("/work/shop", { dir: true });
  h.fs.nodes.set("/work/shop/package.json", { file: JSON.stringify({ name: "shop", dependencies: { stripe: "1" } }) });
  h.advance(1000);
  const project = await h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST, contextUuid: APP });
  assert.deepEqual([project.version, project.root, project.context_uuid, project.trusted, project.manifest_state], [2, "/work/shop", APP, false, "none"]);
  assert.deepEqual(project.detected.integrations.map(item => item.id), ["stripe"], "the confirmed record reflects the folder as it is now");
  assert.equal(project.detected.at, h.now);
  assert.deepEqual([project.container, project.accounts, project.brief], [{ user_context_id: null }, [], null]);
  assert.equal(project.shared_sites.confirmed, false);
  assert.deepEqual(h.fs.writes, [], "confirming writes nothing to the folder");
  const stored = JSON.parse(h.storage.files.get("contexts.json"));
  assert.deepEqual([stored.version, stored.projects[0].version], [3, 2]);
  assert.ok(!JSON.stringify(stored.projects[0].manifest).includes("detected"), "detection stays out of the manifest");
  await assert.rejects(h.services.confirmProject({ root: "/work/link", manifest: MANIFEST }), code("PROJECT_EXISTS"),
    "an alias of a registered folder is the same project");

  const moved = harness({ tree });
  await moved.services.detect("/work/link");
  moved.fs.nodes.set("/work/link", { link: "/work/other" });
  await assert.rejects(moved.services.confirmProject({ root: "/work/link", manifest: MANIFEST }), code("ROOT_CHANGED"));
  assert.deepEqual(await moved.services.listProjects(), []);
});

test("refreshProjectDetection reads the stored root again and keeps manifest, space, container, accounts, shared sites, brief and trust", { skip }, async () => {
  const h = harness({ tree: RICH_TREE });
  const record = { version: 2, id: "p_seeded1", root: "/work/shop", manifest: MANIFEST, manifest_state: "written", context_uuid: APP,
    trusted: false, created_at: 5, updated_at: 6, detected: null, container: { user_context_id: 7 },
    shared_sites: { hosts: ["github.com"], confirmed: true }, accounts: [{ key: "vercel", label: "Work Google" }], brief: null };
  h.storage.files.set("contexts.json", JSON.stringify({ version: 3, contexts: [], projects: [record] }));
  const services = h.make();
  services.registerWindow(h.zen.window, h.adapter);
  const events = [];
  services.on("projects", () => events.push("projects"));
  const stored = await services.getProject("p_seeded1");
  h.advance(1000);
  const refreshed = await services.refreshProjectDetection("p_seeded1");
  assert.deepEqual(refreshed.detected.integrations.map(item => item.id), ["vercel", "convex", "clerk"]);
  assert.equal(refreshed.detected.domains.find(item => item.origin === "docs").confirmed, false);
  assert.equal(refreshed.updated_at, h.now);
  for (const key of ["id", "root", "manifest", "manifest_state", "context_uuid", "trusted", "created_at", "container", "shared_sites", "accounts", "brief"]) {
    assert.deepEqual(refreshed[key], stored[key], key);
  }
  assert.deepEqual([refreshed.container.user_context_id, refreshed.accounts[0].label, refreshed.shared_sites.confirmed], [7, "Work Google", true]);
  assert.deepEqual(events, ["projects"]);
  assert.deepEqual(h.fs.writes, []);
  await assert.rejects(services.refreshProjectDetection("p_missing1"), code("UNKNOWN_PROJECT"));
  h.fs.nodes.set("/work/other/package.json", { file: "{\"name\":\"TRAP-other\"}" });
  h.fs.nodes.set("/work/shop", { link: "/work/other" });
  const before = h.storage.files.get("contexts.json");
  const callsBefore = h.reader.calls.length;
  await assert.rejects(services.refreshProjectDetection("p_seeded1"), code("ROOT_CHANGED"));
  assert.equal(h.storage.files.get("contexts.json"), before, "a folder that now resolves elsewhere changes nothing");
  assert.deepEqual(h.reader.calls.slice(callsBefore), [], "the registered root's new target is never opened");
  assert.ok(!h.fs.reads.some(path => path.startsWith("/work/other")));
});

function flakyStorage(failures) {
  const files = new Map(), writes = [];
  return { files, writes, storageFor: name => ({ read: async () => files.get(name) ?? null,
    write: async text => { writes.push(name); if (name === "contexts.json" && failures.count > 0) { failures.count--; throw new Error("disk full"); } files.set(name, text); } }) };
}
const legacyProject = (id, over = {}) => ({ version: 1, id, root: `/work/${id}`, manifest: MANIFEST, manifest_state: "none",
  context_uuid: null, trusted: false, created_at: 11, updated_at: 13, ...over });

test("store v3: a v2 store is written back once; a failed write keeps the old file and is retried; persistence emits no event", { skip }, async () => {
  const failures = { count: 1 };
  const storage = flakyStorage(failures);
  const legacy = JSON.stringify({ version: 2, projects: [legacyProject("p_legacy2", { context_uuid: APP })],
    contexts: [{ version: 1, workspace_uuid: APP, type: "project", organization_uuid: null, project_id: null, engine_preference: null, updated_at: 7 }] });
  storage.files.set("contexts.json", legacy);
  const h = harness({ deps: { storageFor: storage.storageFor } });
  const events = [];
  for (const name of ["contexts", "projects"]) h.services.on(name, () => events.push(name));
  const originalError = console.error; console.error = () => {};
  let first;
  try { first = await h.services.listProjects(); } finally { console.error = originalError; }
  assert.deepEqual([first[0].version, first[0].context_uuid], [2, APP], "the migrated document is served while the write fails");
  assert.equal(storage.files.get("contexts.json"), legacy, "the old file is kept after a failed write");
  await h.services.listProjects();
  const written = JSON.parse(storage.files.get("contexts.json"));
  assert.deepEqual([written.version, written.projects[0].version, written.projects[0].updated_at, written.contexts[0].updated_at], [3, 2, 13, 7]);
  const count = storage.writes.length;
  await h.services.listContexts();
  await h.services.getProject("p_legacy2");
  assert.equal(storage.writes.length, count, "written once");
  assert.deepEqual(events, [], "persistence alone is not a project or context change");
});

test("store v3: v3 files with v1 records are upgraded; current files are not rewritten; invalid files are never written", { skip }, async () => {
  const storage = flakyStorage({ count: 0 });
  const current = { ...legacyProject("p_current1"), version: 2, detected: null, container: { user_context_id: null },
    shared_sites: { hosts: ["github.com"], confirmed: false }, accounts: [], brief: null };
  storage.files.set("contexts.json", JSON.stringify({ version: 3, contexts: [], projects: [current, legacyProject("p_old1")] }));
  const mixed = harness({ deps: { storageFor: storage.storageFor } });
  const projects = await mixed.services.listProjects();
  assert.deepEqual(projects.map(project => project.version), [2, 2]);
  assert.deepEqual(JSON.parse(storage.files.get("contexts.json")).projects.map(project => project.version), [2, 2]);
  assert.equal(storage.writes.filter(name => name === "contexts.json").length, 1);

  const clean = flakyStorage({ count: 0 });
  clean.files.set("contexts.json", JSON.stringify({ version: 3, contexts: [], projects: [current] }));
  await harness({ deps: { storageFor: clean.storageFor } }).services.listProjects();
  assert.deepEqual(clean.writes, [], "a current v3 file is left as it is");

  const invalid = flakyStorage({ count: 0 });
  const text = JSON.stringify({ version: 2, contexts: [], projects: [legacyProject("p_bad1", { trusted: true })] });
  invalid.files.set("contexts.json", text);
  const broken = harness({ deps: { storageFor: invalid.storageFor } });
  await assert.rejects(broken.services.listProjects(), code("INVALID_STORE"));
  await assert.rejects(broken.services.listProjects(), code("INVALID_STORE"));
  assert.deepEqual(invalid.writes, []);
  assert.equal(invalid.files.get("contexts.json"), text);
});

// ── arrival ──
const ARRIVAL_URL = "http://localhost:5174/cart?x=1#top";
function fakeTab(window, { url = ARRIVAL_URL, browserId = 7, privateBrowsing = false, space = APP } = {}) {
  return { ownerGlobal: window, closing: false,
    linkedBrowser: { browserId, currentURI: { spec: url }, browsingContext: privateBrowsing === null ? null : { usePrivateBrowsing: privateBrowsing } },
    getAttribute: name => (name === "zen-workspace-id" ? space : null) };
}
function arrivalHarness({ listeners = { 5174: { pid: 42, cwd: "/work/shop/apps/web" } }, tree = RICH_TREE, deps = {} } = {}) {
  const runtime = fakeArrivalRuntime(listeners);
  const h = harness({ tree: { ...tree, "/Users": { dir: true }, "/Users/synthetic": { dir: true } },
    deps: { arrivalRuntime: runtime, home: "/Users/synthetic", arrivalRoots: ["/work"], ...deps } });
  return { ...h, runtime, window: h.zen.window };
}
const ticks = async (count = 10) => { for (let i = 0; i < count; i++) await new Promise(resolve => setImmediate(resolve)); };
const storedProjects = h => JSON.parse(h.storage.files.get("contexts.json") ?? "{\"projects\":[]}").projects;

test("arrival: a new loopback folder gets an opaque one-use token; Keep adds a v2 project in the tab's space and writes nothing to the folder", { skip }, async () => {
  const h = arrivalHarness();
  const tab = fakeTab(h.window);
  const offer = await h.services.offerArrival({ window: h.window, tab });
  assert.deepEqual([offer.kind, offer.root, offer.name, offer.displayRoot], ["new", "/work/shop", "shop", "/work/shop"]);
  assert.match(offer.token, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u, "a browser UUID");
  assert.ok(!offer.token.includes("shop") && !offer.token.includes("5174"));
  assert.equal(offer.expiresAt, h.now + 120000);
  assert.deepEqual(h.runtime.calls.map(([command]) => command), ["/usr/bin/id", "/usr/sbin/lsof", "/usr/sbin/lsof", "/usr/sbin/lsof"]);
  assert.ok(h.runtime.calls.slice(1).every(call => call.includes("-u") && call.includes("501")), "own UID only");
  assert.deepEqual(h.fs.reads, [], "discovery opens no file content");
  const project = await h.services.acceptArrival({ window: h.window, tab, token: offer.token });
  assert.deepEqual([project.version, project.root, project.context_uuid, project.manifest.name, project.manifest_state, project.trusted],
    [2, "/work/shop", APP, "shop", "none", false]);
  assert.deepEqual(project.detected.integrations.map(item => item.id), ["vercel", "convex", "clerk"]);
  assert.ok(!h.fs.reads.some(path => neverRead.test(path)));
  assert.deepEqual(h.fs.writes, [], "accepting an arrival never writes a repository manifest");
  await assert.rejects(h.services.acceptArrival({ window: h.window, tab, token: offer.token }), code("UNKNOWN_ARRIVAL"), "one use");
  assert.deepEqual(await h.services.offerArrival({ window: h.window, tab }), { kind: "known", project_id: project.id });
});

test("arrival: private windows, private or unknown-privacy tabs and foreign tabs get nothing and start no process", { skip }, async () => {
  const h = arrivalHarness();
  const privateZen = fakeZenWindow({ spaces: [{ uuid: HOME, name: "Home" }], isPrivate: true });
  h.services.registerWindow(privateZen.window, new ZenWorkspaceAdapter(privateZen.window));
  const other = fakeZenWindow({ spaces: [{ uuid: HOME, name: "Home" }] });
  h.services.registerWindow(other.window, new ZenWorkspaceAdapter(other.window));
  const cases = [
    [privateZen.window, fakeTab(privateZen.window)],
    [h.window, fakeTab(h.window, { privateBrowsing: true })],
    [h.window, fakeTab(h.window, { privateBrowsing: null })],
    [h.window, fakeTab(other.window)],
    [{ unregistered: true }, fakeTab({ unregistered: true })],
    [h.window, fakeTab(h.window, { browserId: 0 })],
    [h.window, fakeTab(h.window, { url: "http://user:pw@localhost:5174/" })],
    [h.window, fakeTab(h.window, { url: "https://shop-product.dev/" })],
  ];
  for (const [window, tab] of cases) assert.equal(await h.services.offerArrival({ window, tab }), null);
  assert.deepEqual(h.runtime.calls, []);
  assert.deepEqual(h.fs.reads, []);
});

test("arrival: a known repository URL links to its project without any process", { skip }, async () => {
  const h = arrivalHarness();
  const manifest = { ...MANIFEST, surfaces: [{ name: "Repository", url: "https://github.com/acme/shop", kind: "repository" }] };
  const project = await h.services.confirmProject({ root: "/work/shop", manifest });
  const tab = fakeTab(h.window, { url: "https://github.com/acme/shop/pull/3" });
  assert.deepEqual(await h.services.offerArrival({ window: h.window, tab }), { kind: "known", project_id: project.id });
  assert.deepEqual(h.runtime.calls, []);
});

test("arrival: tokens are bound to the originating tab's exact URL, window and privacy and die with dismissal, disposal and time", { skip }, async () => {
  const h = arrivalHarness();
  const tab = fakeTab(h.window);
  const accept = (token, target = tab) => h.services.acceptArrival({ window: h.window, tab: target, token });
  let offer = await h.services.offerArrival({ window: h.window, tab });
  tab.linkedBrowser.currentURI.spec = "http://localhost:5174/cart?x=2#top";
  await assert.rejects(accept(offer.token), code("STALE_ARRIVAL"), "another URL of the same page");
  tab.linkedBrowser.currentURI.spec = ARRIVAL_URL;
  await assert.rejects(accept(offer.token, fakeTab(h.window, { browserId: 8 })), code("STALE_ARRIVAL"), "another tab on the same URL");
  tab.linkedBrowser.browsingContext.usePrivateBrowsing = true;
  await assert.rejects(accept(offer.token), code("ARRIVAL_UNAVAILABLE"));
  tab.linkedBrowser.browsingContext.usePrivateBrowsing = false;
  h.services.discardArrival({ window: h.window, tab });
  await assert.rejects(accept(offer.token), code("UNKNOWN_ARRIVAL"), "dismissed or navigated away");

  offer = await h.services.offerArrival({ window: h.window, tab });
  h.unregister();
  h.services.registerWindow(h.window, h.adapter);
  await assert.rejects(accept(offer.token), code("UNKNOWN_ARRIVAL"), "the window went away");

  offer = await h.services.offerArrival({ window: h.window, tab });
  h.advance(120000);
  await assert.rejects(accept(offer.token), code("UNKNOWN_ARRIVAL"), "two minutes at most");

  offer = await h.services.offerArrival({ window: h.window, tab });
  h.fs.nodes.set("/work/shop", { link: "/work/other" });
  await assert.rejects(accept(offer.token), code("ROOT_CHANGED"), "the folder now resolves elsewhere");
  await assert.rejects(accept("forged-token-0000000000000000000000"), code("UNKNOWN_ARRIVAL"));
  assert.deepEqual(await h.services.listProjects(), []);
});

// The token is spent before detection; what may still finish is the
// acceptance in flight. Detection is paused after consumption, the page or
// window changes, then detection resumes.
for (const change of ["navigation", "reload", "tab close", "window disposal", "private browsing"]) {
  test(`arrival: an acceptance in flight is revoked by ${change}; nothing is added and the token cannot be replayed`, { skip }, async () => {
    const h = arrivalHarness();
    const tab = fakeTab(h.window);
    const offer = await h.services.offerArrival({ window: h.window, tab });
    let entered, release;
    const paused = new Promise(resolve => { entered = resolve; });
    const gate = new Promise(resolve => { release = resolve; });
    const rootMetadata = h.reader.rootMetadata;
    let first = true;
    h.reader.rootMetadata = async root => { if (first) { first = false; entered(); await gate; } return rootMetadata(root); };
    const accepting = h.services.acceptArrival({ window: h.window, tab, token: offer.token });
    await paused;
    if (change === "navigation") { tab.linkedBrowser.currentURI.spec = "http://localhost:5174/elsewhere"; h.services.discardArrival({ window: h.window, tab }); }
    if (change === "reload") h.services.discardArrival({ window: h.window, tab }); // same URL; the runtime still revokes
    if (change === "tab close") { tab.closing = true; h.services.discardArrival({ window: h.window, tab }); }
    if (change === "window disposal") h.unregister();
    if (change === "private browsing") tab.linkedBrowser.browsingContext.usePrivateBrowsing = true;
    release();
    await assert.rejects(accepting, error => ["STALE_ARRIVAL", "ARRIVAL_UNAVAILABLE"].includes(error.code));
    assert.deepEqual(storedProjects(h), []);
    assert.deepEqual(await h.services.listProjects(), []);
    assert.deepEqual(h.fs.writes, []);
    // Restore a valid page: the spent token stays spent, a fresh offer still works.
    if (change === "window disposal") h.services.registerWindow(h.window, h.adapter);
    Object.assign(tab, { closing: false });
    tab.linkedBrowser.currentURI.spec = ARRIVAL_URL;
    tab.linkedBrowser.browsingContext.usePrivateBrowsing = false;
    await assert.rejects(h.services.acceptArrival({ window: h.window, tab, token: offer.token }), code("UNKNOWN_ARRIVAL"));
    const again = await h.services.offerArrival({ window: h.window, tab });
    assert.equal((await h.services.acceptArrival({ window: h.window, tab, token: again.token })).root, "/work/shop");
  });
}

test("arrival: the acceptance is checked again inside the serialized store write, after earlier queued writes", { skip }, async () => {
  const hold = { gate: null };
  const files = new Map();
  const storageFor = name => ({ read: async () => files.get(name) ?? null,
    write: async text => { if (hold.gate) await hold.gate; files.set(name, text); } });
  for (const moveOn of [true, false]) {
    files.clear();
    const h = arrivalHarness({ deps: { storageFor } });
    const tab = fakeTab(h.window);
    const offer = await h.services.offerArrival({ window: h.window, tab });
    let release;
    hold.gate = new Promise(resolve => { release = resolve; });
    const earlier = h.services.setContextType(BV, "organization"); // its atomic write is held
    let rootChecks = 0;
    const rootMetadata = h.reader.rootMetadata;
    h.reader.rootMetadata = async root => { rootChecks++; return rootMetadata(root); };
    const accepting = h.services.acceptArrival({ window: h.window, tab, token: offer.token });
    while (rootChecks < 2) await ticks(1);
    await ticks(); // detection done and its post-detection check passed; the append waits in the queue
    assert.ok(h.fs.reads.includes("/work/shop/package.json"));
    if (moveOn) tab.linkedBrowser.currentURI.spec = "http://localhost:5174/other"; // no discard: only the in-queue check can see it
    hold.gate = null;
    release();
    await earlier;
    const projects = () => JSON.parse(files.get("contexts.json")).projects;
    if (moveOn) {
      await assert.rejects(accepting, code("STALE_ARRIVAL"));
      assert.deepEqual(projects(), [], "nothing appended for a page the tab left");
    } else {
      assert.equal((await accepting).root, "/work/shop");
      assert.deepEqual(projects().map(project => project.root), ["/work/shop"]);
    }
    assert.equal(JSON.parse(files.get("contexts.json")).contexts.find(meta => meta.workspace_uuid === BV).type, "organization",
      "the earlier queued write is unaffected");
  }
});

// ── canonical root admission (ProjectDetection allowCanonicalRoot) ──
// The folder may be swapped while the reader is still being set up. The
// detector asks the service about the canonical target it resolved before any
// reader request; the test reader logs every root, file, presence, listing and
// content request, so an empty log proves the new target was never opened.
function pausedReaderHarness({ tree, listeners = { 5174: { pid: 42, cwd: "/work/shop" } } } = {}) {
  const pause = { armed: false };
  let h = null;
  h = arrivalHarness({ tree, listeners, deps: { reader: null, createReader: async () => {
    if (pause.armed) { pause.armed = false; pause.entered(); await new Promise(resolve => { pause.release = resolve; }); }
    return h.reader;
  } } });
  const hold = () => { pause.armed = true; return new Promise(resolve => { pause.entered = resolve; }); };
  return { ...h, hold, release: () => pause.release() };
}
const SETTINGS_TREE = { ...RICH_TREE, "/Users": { dir: true }, "/Users/synthetic": { dir: true }, "/Users/synthetic/.ssh": { dir: true },
  "/Users/synthetic/.ssh/package.json": { file: "{\"name\":\"TRAP-settings\"}" },
  "/work/other/package.json": { file: "{\"name\":\"TRAP-other\"}" } };

for (const operation of ["detect", "acceptArrival"]) {
  test(`root admission: ${operation} refuses a folder swapped for a blocked settings folder during reader setup, before opening it`, { skip }, async () => {
    const h = pausedReaderHarness({ tree: SETTINGS_TREE });
    const tab = fakeTab(h.window);
    const offer = operation === "acceptArrival" ? await h.services.offerArrival({ window: h.window, tab }) : null;
    const held = h.hold();
    const pending = operation === "detect" ? h.services.detect("/work/shop") : h.services.acceptArrival({ window: h.window, tab, token: offer.token });
    await held; // the early deny check passed; the reader is being created
    h.fs.nodes.set("/work/shop", { link: "/Users/synthetic/.ssh" });
    h.release();
    await assert.rejects(pending, code("ROOT_DENIED"));
    assert.deepEqual(h.reader.calls, [], "no root, file, presence, listing or content request for the new target");
    assert.deepEqual(h.fs.reads, []);
    assert.deepEqual(storedProjects(h), []);
    assert.deepEqual(await h.services.listProjects(), []);
    if (offer) await assert.rejects(h.services.acceptArrival({ window: h.window, tab, token: offer.token }), code("UNKNOWN_ARRIVAL"), "spent");
  });
}

test("root admission: a consumed arrival whose folder now resolves to another allowed folder is refused before it is opened", { skip }, async () => {
  const h = pausedReaderHarness({ tree: SETTINGS_TREE });
  const tab = fakeTab(h.window);
  const offer = await h.services.offerArrival({ window: h.window, tab });
  const held = h.hold();
  const pending = h.services.acceptArrival({ window: h.window, tab, token: offer.token });
  await held; // the token is spent against /work/shop
  h.fs.nodes.set("/work/shop", { link: "/work/other" });
  h.release();
  await assert.rejects(pending, code("ROOT_CHANGED"));
  assert.deepEqual(h.reader.calls, []);
  assert.deepEqual(storedProjects(h), []);

  // The same canonical folder with a new identity and content is still read afresh.
  const renewed = pausedReaderHarness({ tree: SETTINGS_TREE });
  const renewedTab = fakeTab(renewed.window);
  const again = await renewed.services.offerArrival({ window: renewed.window, tab: renewedTab });
  const wait = renewed.hold();
  const accepting = renewed.services.acceptArrival({ window: renewed.window, tab: renewedTab, token: again.token });
  await wait;
  for (const key of [...renewed.fs.nodes.keys()]) if (key.startsWith("/work/shop/")) renewed.fs.nodes.delete(key);
  renewed.fs.nodes.set("/work/shop", { dir: true });
  renewed.fs.nodes.set("/work/shop/package.json", { file: JSON.stringify({ name: "shop-renewed", dependencies: { stripe: "1" } }) });
  renewed.release();
  const project = await accepting;
  assert.deepEqual([project.root, project.manifest.name, project.detected.integrations.map(item => item.id)], ["/work/shop", "shop-renewed", ["stripe"]]);
});

test("root admission: confirm refuses a picked alias that now resolves elsewhere than its preview, before opening it", { skip }, async () => {
  const tree = { ...SETTINGS_TREE, "/work/link": { link: "/work/shop" } };
  const h = harness({ tree });
  await h.services.detect("/work/link");
  const callsBefore = h.reader.calls.length;
  const readsBefore = h.fs.reads.length;
  h.fs.nodes.set("/work/link", { link: "/work/other" });
  await assert.rejects(h.services.confirmProject({ root: "/work/link", manifest: MANIFEST }), code("ROOT_CHANGED"));
  assert.deepEqual(h.reader.calls.slice(callsBefore), [], "the new target is not opened");
  assert.equal(h.fs.reads.length, readsBefore);
  assert.deepEqual(await h.services.listProjects(), []);

  // Unchanged generic behaviour: without a cached preview the picked folder is
  // detected as it is now; a missing folder is still ROOT_NOT_FOUND.
  const fresh = harness({ tree });
  assert.equal((await fresh.services.confirmProject({ root: "/work/link", manifest: MANIFEST })).root, "/work/shop");
  await assert.rejects(fresh.services.confirmProject({ root: "/work/missing", manifest: MANIFEST }), code("ROOT_NOT_FOUND"));
  await assert.rejects(fresh.services.detect("/work/missing"), code("ROOT_NOT_FOUND"));
});

test("arrival: settings folders and foreign listeners are never offered", { skip }, async () => {
  const tree = { ...RICH_TREE, "/Users": { dir: true }, "/Users/synthetic": { dir: true }, "/Users/synthetic/.codex": { dir: true },
    "/Users/synthetic/.codex/.git": { dir: true } };
  const settings = arrivalHarness({ tree, listeners: { 5174: { pid: 42, cwd: "/Users/synthetic/.codex" } } });
  assert.equal(await settings.services.offerArrival({ window: settings.window, tab: fakeTab(settings.window) }), null);
  const foreign = arrivalHarness({ listeners: { 5174: { pid: 42, uid: 0, cwd: "/work/shop" } } });
  assert.equal(await foreign.services.offerArrival({ window: foreign.window, tab: fakeTab(foreign.window) }), null);
  assert.deepEqual(foreign.fs.reads, []);
});

test("arrival roots: /Volumes/T9/Code by default; synthetic GUI roots only below the build root's gui-fixtures", { skip }, () => {
  const env = values => name => values[name] ?? "";
  assert.deepEqual(DEFAULT_ARRIVAL_ROOTS, ["/Volumes/T9/Code"]);
  assert.deepEqual(arrivalRootsFromEnvironment(env({})), ["/Volumes/T9/Code"]);
  assert.deepEqual(arrivalRootsFromEnvironment(env({ AXIOSOZO_ARRIVAL_ROOTS: "[\"/Users/synthetic\"]" })), ["/Volumes/T9/Code"],
    "ignored without the synthetic test flag");
  const synthetic = { AXIOSOZO_SYNTHETIC_TEST: "1", AXIOSOZO_BUILD_ROOT: "/Volumes/AxioSozoBuild/workstation" };
  const fixture = "/Volumes/AxioSozoBuild/workstation/gui-fixtures/harbor-suite";
  assert.deepEqual(arrivalRootsFromEnvironment(env({ ...synthetic, AXIOSOZO_ARRIVAL_ROOTS: JSON.stringify([fixture, fixture]) })), [fixture]);
  assert.deepEqual(arrivalRootsFromEnvironment(env({ ...synthetic, AXIOSOZO_STATIC_READER_ROOT: "/Volumes/AxioSozoBuild/other",
    AXIOSOZO_ARRIVAL_ROOTS: JSON.stringify(["/Volumes/AxioSozoBuild/other/gui-fixtures/a"]) })), ["/Volumes/AxioSozoBuild/other/gui-fixtures/a"]);
  const rejected = [
    ["/Volumes/AxioSozoBuild/workstation/gui-fixtures"], ["/Volumes/AxioSozoBuild/workstation/gui-fixtures/"],
    ["/Volumes/AxioSozoBuild/workstation/gui-fixtures/../zen"], ["/Volumes/AxioSozoBuild/workstation/gui-fixtures/a/./b"],
    ["/Volumes/AxioSozoBuild/workstation/zen"], ["/Users/synthetic/Code"], ["gui-fixtures/a"], [`${fixture}\nx`], [42], [],
    Array.from({ length: 9 }, (_, i) => `${fixture}${i}`), "not-an-array"];
  for (const roots of rejected) {
    assert.deepEqual(arrivalRootsFromEnvironment(env({ ...synthetic, AXIOSOZO_ARRIVAL_ROOTS: JSON.stringify(roots) })), [], JSON.stringify(roots));
  }
  assert.deepEqual(arrivalRootsFromEnvironment(env({ ...synthetic, AXIOSOZO_ARRIVAL_ROOTS: "{not json" })), []);
  for (const buildRoot of ["/Users/synthetic", "/Volumes/AxioSozoBuild/zen", "/Volumes/AxioSozoBuild/providers", ""]) {
    assert.deepEqual(arrivalRootsFromEnvironment(env({ AXIOSOZO_SYNTHETIC_TEST: "1", AXIOSOZO_BUILD_ROOT: buildRoot,
      AXIOSOZO_ARRIVAL_ROOTS: JSON.stringify([`${buildRoot}/gui-fixtures/a`]) })), [], buildRoot);
  }
});

// ── native arrival subprocess (ProjectArrivalSubprocess via lazyArrivalSubprocess) ──
const unavailableArrival = error => error?.code === "ARRIVAL_SUBPROCESS_UNAVAILABLE";

test("arrival runtime: the trusted adapter is built on the first call only, shared, retried after a failed build", { skip }, async () => {
  const forwarded = [];
  let builds = 0, failNext = 1, release;
  const child = Object.freeze({ synthetic: true });
  const adapter = Object.freeze({ call: async options => { forwarded.push(options); return child; } });
  const runtime = lazyArrivalSubprocess(async () => {
    builds++;
    if (failNext > 0) { failNext--; throw new Error("helper checksum mismatch /private/detail"); }
    await new Promise(resolve => { release = resolve; });
    return adapter;
  });
  assert.equal(builds, 0, "nothing is built before an actual discovery");
  assert.deepEqual(Object.keys(runtime), ["call"]);
  const options = { command: "/usr/bin/id", arguments: ["-u"], environmentAppend: false, environment: {}, stderr: "pipe" };
  await assert.rejects(runtime.call(options), error => unavailableArrival(error) && !/checksum|private/u.test(error.message));
  assert.deepEqual(forwarded, [], "no call reaches anything after a failed build");
  const first = runtime.call(options), second = runtime.call(options);
  for (let i = 0; !release && i < 100; i++) await ticks(1);
  assert.equal(typeof release, "function", "the failed build is retried by the next call");
  release();
  assert.deepEqual([await first, await second], [child, child], "the child is handed back unchanged");
  assert.equal(builds, 2, "one retry after the failure, shared by concurrent calls");
  assert.ok(forwarded.length === 2 && forwarded.every(item => item === options), "ProjectArrival's options are forwarded as they are");
  await runtime.call(options);
  assert.equal(builds, 2, "a built adapter is reused");

  const refusing = lazyArrivalSubprocess(async () => ({ call: async () => { throw Object.assign(new Error("x"), { code: "ARRIVAL_SUBPROCESS_UNAVAILABLE" }); } }));
  await assert.rejects(refusing.call(options), unavailableArrival, "an adapter refusal is not replaced by anything else");
  let shapeless = 0;
  const invalid = lazyArrivalSubprocess(async () => { shapeless++; return { spawn() {} }; });
  await assert.rejects(invalid.call(options), unavailableArrival);
  await assert.rejects(invalid.call(options), unavailableArrival);
  assert.equal(shapeless, 2, "an adapter without call is not kept");
});

// The pinned helper as seen through the adapter's own runtime seam (the one the
// adapter's tests use): it answers only the helper's two operations and id.
function trustedArrivalFixture(listeners, { digest = () => ARRIVAL_LSOF_SHA256 } = {}) {
  const spawned = [];
  const pipe = text => { let done = false; return { async read() { if (done) return new ArrayBuffer(0); done = true; return new TextEncoder().encode(text).buffer; }, async close() {} }; };
  const reply = text => ({ stdout: pipe(text), stderr: pipe(""), stdin: { async close() {} }, async wait() { return { exitCode: 0 }; }, async kill() {} });
  const runtime = { env: name => (name === "AXIOSOZO_STATIC_READER_ROOT" ? "/Volumes/AxioSozoBuild/workstation" : ""),
    verifyFile: async () => true, sha256: async () => digest(), timers: globalThis,
    Subprocess: { call: async options => {
      spawned.push(options);
      if (options.command === "/usr/bin/id") return reply("501\n");
      const [, , , , operation, number, uid] = options.arguments;
      if (operation === "listen") {
        const entry = listeners[number];
        return reply(entry ? `p${entry.pid}\nu${uid}\nn127.0.0.1:${number}\n` : "");
      }
      const entry = Object.values(listeners).find(item => String(item.pid) === number);
      return reply(entry ? `p${number}\nfcwd\nn${entry.cwd}\n` : "");
    } } };
  let builds = 0;
  const arrivalRuntime = lazyArrivalSubprocess(() => { builds++; return createNativeProjectArrivalSubprocess({ runtime }); });
  return { spawned, arrivalRuntime, get builds() { return builds; } };
}

test("arrival through the trusted adapter: id runs directly, own-UID lsof selectors go through the pinned helper, never lsof itself", { skip }, async () => {
  const trusted = trustedArrivalFixture({ 5174: { pid: 42, cwd: "/work/shop/apps/web" } });
  const h = arrivalHarness({ deps: { arrivalRuntime: trusted.arrivalRuntime } });
  assert.equal(trusted.builds, 0, "creating the service builds nothing");
  const tab = fakeTab(h.window);
  const offer = await h.services.offerArrival({ window: h.window, tab });
  assert.deepEqual([offer.kind, offer.root], ["new", "/work/shop"]);
  const helper = arrivalSubprocessPaths("/Volumes/AxioSozoBuild/workstation").helperPath;
  const fixed = { environmentAppend: false, environment: { PATH: "/usr/bin:/bin:/usr/sbin", LANG: "C", LC_ALL: "C" }, stderr: "pipe", workdir: "/" };
  assert.deepEqual(trusted.spawned, [
    { command: "/usr/bin/id", arguments: ["-u"], ...fixed },
    { command: ARRIVAL_LSOF_PYTHON, arguments: ["-I", "-S", "-B", helper, "listen", "5174", "501"], ...fixed },
    { command: ARRIVAL_LSOF_PYTHON, arguments: ["-I", "-S", "-B", helper, "cwd", "42", "501"], ...fixed },
    { command: ARRIVAL_LSOF_PYTHON, arguments: ["-I", "-S", "-B", helper, "cwd", "42", "501"], ...fixed },
  ]);
  assert.ok(!trusted.spawned.some(options => options.command === "/usr/sbin/lsof"), "lsof is never started directly");
  assert.deepEqual(h.runtime.calls, [], "the direct-call fake is not used");
  const project = await h.services.acceptArrival({ window: h.window, tab, token: offer.token });
  assert.equal(project.root, "/work/shop");
  assert.deepEqual(await h.services.offerArrival({ window: h.window, tab }), { kind: "known", project_id: project.id });
  assert.equal(trusted.builds, 1, "one adapter for every later discovery");
});

test("arrival through an untrusted adapter: nothing starts, no offer, and a later discovery tries again", { skip }, async () => {
  let digest = "f".repeat(64);
  const trusted = trustedArrivalFixture({ 5174: { pid: 42, cwd: "/work/shop" } }, { digest: () => digest });
  const h = arrivalHarness({ deps: { arrivalRuntime: trusted.arrivalRuntime } });
  const tab = fakeTab(h.window);
  assert.equal(await h.services.offerArrival({ window: h.window, tab }), null);
  assert.deepEqual(trusted.spawned, [], "no process at all, id included, with an unverified helper");
  assert.deepEqual(h.runtime.calls, [], "no direct-lsof fallback");
  assert.deepEqual(h.fs.reads, []);
  digest = ARRIVAL_LSOF_SHA256;
  const offer = await h.services.offerArrival({ window: h.window, tab });
  assert.deepEqual([offer.kind, offer.root], ["new", "/work/shop"]);
  assert.equal(trusted.builds, 2, "the failed build was retried by the later discovery");
});

// ── P2: accounts per project ─────────────────────────────────────────────
// A synthetic ContextualIdentityService (the pinned method signatures) behind
// the real createGeckoIdentityAdapter, and Zen's gBrowser.addTab. Only routing
// identities are modelled: no cookie, account name or profile is read, and
// this is not the GUI cookie proof (two projects on one origin in the real app).
const GECKO_COLORS = ["gray", "yellow", "orange", "red", "pink", "purple", "violet", "blue", "cyan", "green"];
const SHARED_ORIGIN = "https://shared-fixture.example/login";
const BLOG = { version: 1, name: "Blog", kind: "web",
  environments: [{ name: "local", base_url: "http://localhost:5175" }, { name: "preview", base_url: "https://shared-fixture.example" }],
  services: [], surfaces: [] };
const TWO_PROJECTS = { ...VITE_TREE, "/work/blog": { dir: true },
  "/work/blog/package.json": { file: JSON.stringify({ name: "blog", scripts: { dev: "vite --port 5175" }, devDependencies: { vite: "^5" } }) } };
const settle = async () => { for (let i = 0; i < 30; i++) await new Promise(resolve => setImmediate(resolve)); };
async function quietly(run) {
  const original = console.error; console.error = () => {};
  try { return await run(); } finally { console.error = original; }
}

function fakeIdentityService() {
  const identities = new Map([[1, { userContextId: 1, public: true, name: "Personal", icon: "fingerprint", color: "blue" }],
    [2, { userContextId: 2, public: true, name: "Work", icon: "briefcase", color: "orange" }]]);
  const calls = [];
  const state = { next: 40, onCreate: null };
  const service = {
    getPublicIdentityFromId(id) { const value = identities.get(id); return value?.public ? structuredClone(value) : undefined; },
    create(name, icon, color) {
      calls.push(["create", name, icon, color]);
      const value = { userContextId: state.next++, public: true, name, icon, color };
      identities.set(value.userContextId, value);
      state.onCreate?.(value);
      return structuredClone(value);
    },
    update(id, name, icon, color) {
      calls.push(["update", id, name, icon, color]);
      const value = identities.get(id);
      if (!value?.public) return false;
      Object.assign(value, { name, icon, color });
      return true;
    },
    remove() { throw new Error("project flows never clear container data"); },
  };
  return { service, identities, calls, state, creates: () => calls.filter(call => call[0] === "create").length,
    // Firefox turning containers off: every project identity is gone and numbering restarts.
    reset() { for (const id of [...identities.keys()]) if (id > 2) identities.delete(id); state.next = 40; } };
}

function p2Harness({ enabled = true, tree = TWO_PROJECTS } = {}) {
  const gecko = fakeIdentityService();
  const observed = {};
  const state = { enabled, veto: false };
  const files = new Map();
  const writes = { fail: false, gate: null };
  const h = harness({ tree, deps: {
    storageFor: name => ({ read: async () => files.get(name) ?? null, async write(text) {
      if (name === "contexts.json") await writes.gate;
      if (writes.fail && name === "contexts.json") throw new Error("disk full");
      files.set(name, text);
    } }),
    containerIdentities: () => createGeckoIdentityAdapter({ service: gecko.service, allowedColors: GECKO_COLORS, allowedIcons: ["briefcase"] }),
    containersEnabled: () => state.enabled,
    observeContainers: callbacks => { Object.assign(observed, callbacks); return () => {}; },
  } });
  // Pinned Tabbrowser.addTab: a non-lazy tab gets its browser (and its browsing
  // context's origin attributes) synchronously, and a foreground tab is
  // selected unless gBrowser.setSelectedTab vetoes it.
  const tabs = [];
  const gBrowser = h.zen.window.gBrowser;
  gBrowser.addTab = (url, options) => {
    const tab = { url, options, userContextId: options.userContextId,
      linkedBrowser: { browsingContext: { originAttributes: { userContextId: options.userContextId } } } };
    tabs.push(tab);
    if (!options.inBackground && !state.veto) gBrowser.selectedTab = tab;
    return tab;
  };
  gBrowser.removeTab = () => assert.fail("no tab is closed by these flows");
  const open = (project, url, window = h.zen.window) => h.services.openProjectUrl({ window, projectId: project.id, url });
  const stored = () => JSON.parse(files.get("contexts.json")).projects;
  // Holds Zen's workspace switch inside openTab until release().
  function pauseSwitch() {
    let entered, release;
    const started = new Promise(resolve => { entered = resolve; });
    const blocked = new Promise(resolve => { release = resolve; });
    const original = h.zen.zen.changeWorkspaceWithID.bind(h.zen.zen);
    h.zen.zen.changeWorkspaceWithID = async (...args) => {
      h.zen.zen.changeWorkspaceWithID = original;
      entered();
      await blocked;
      return original(...args);
    };
    return { started, release };
  }
  return { ...h, gecko, observed, state, files, writes, tabs, open, stored, pauseSwitch };
}
const shopIn = (h, space = APP) => h.services.confirmProject({ root: "/work/shop", manifest: MANIFEST, contextUuid: space });
const blogIn = (h, space = APP) => h.services.confirmProject({ root: "/work/blog", manifest: BLOG, contextUuid: space });

test("P2: a new project gets its own container before any link; links open there with an explicit container", { skip }, async () => {
  const h = p2Harness();
  const shop = await shopIn(h);
  assert.equal(shop.container.user_context_id, 40, "created and saved when the project was added");
  assert.equal(h.stored()[0].container.user_context_id, 40);
  const [[, name, icon, color]] = h.gecko.calls;
  assert.deepEqual([name, icon], ["Shop", "briefcase"]);
  assert.ok(GECKO_COLORS.includes(color) && color !== "turquoise", color);
  assert.equal(h.zen.zen.activeWorkspace, HOME);
  assert.deepEqual(await h.open(shop, "https://vercel.com/team/shop"), { opened: true, container: "project", selected: true });
  assert.equal(h.tabs.length, 1);
  assert.equal(h.zen.window.gBrowser.selectedTab, h.tabs[0], "Firefox selected the new tab");
  const { url, options } = h.tabs[0];
  assert.equal(url, "https://vercel.com/team/shop");
  assert.deepEqual([options.userContextId, options.fromExternal, options.zenWorkspaceId, options.skipRoute], [40, false, APP, true]);
  assert.deepEqual([options.triggeringPrincipal.isSystemPrincipal, options.triggeringPrincipal.isNullPrincipal, options.triggeringPrincipal.originAttributes],
    [false, true, { userContextId: 40 }]);
  assert.equal(h.zen.zen.activeWorkspace, APP, "the project's space");
  // A known project URL opened from anywhere (an attention item, the page) is routed too.
  await h.services.openUrl({ url: "http://localhost:5174/cart", window: h.zen.window });
  assert.equal(h.tabs.at(-1).options.userContextId, 40);
  // Unrelated addresses keep the plain web-link path in the space's container.
  await h.services.openUrl({ url: "https://unrelated.example/", contextUuid: HOME, window: h.zen.window });
  assert.equal(h.tabs.length, 2);
  assert.deepEqual(h.zen.opened.at(-1).principal.originAttributes, { userContextId: 0 });
  assert.equal(h.gecko.creates(), 1, "no second identity for the same project");
  for (const url of ["javascript:alert(1)", "file:///etc/passwd", "https://user:pw@vercel.com/", "about:config"]) {
    await assert.rejects(h.open(shop, url), { code: "INVALID_URL" });
  }
  await assert.rejects(h.services.openProjectUrl({ window: { foreign: true }, projectId: shop.id, url: "https://vercel.com/" }), { code: "NO_WINDOW" });
  await assert.rejects(h.services.openProjectUrl({ window: h.zen.window, projectId: "p_unknown1", url: "https://vercel.com/" }), { code: "UNKNOWN_PROJECT" });
  assert.equal(h.tabs.length, 2);
});

test("P2: two projects on one origin get two containers; parallel opens assign exactly one identity each, persisted", { skip }, async () => {
  const h = p2Harness({ enabled: false });
  const shop = await shopIn(h);
  const blog = await blogIn(h);
  assert.deepEqual([shop.container.user_context_id, blog.container.user_context_id], [null, null], "containers were off when they were added");
  assert.equal(h.gecko.creates(), 0);
  h.state.enabled = true;
  const order = [shop, blog, shop, blog];
  const results = await Promise.all(order.map(project => h.open(project, SHARED_ORIGIN)));
  assert.ok(results.every(result => result.container === "project"));
  assert.equal(h.gecko.creates(), 2);
  const idsOf = project => [...new Set(h.tabs.filter((_, i) => order[i] === project).map(tab => tab.options.userContextId))];
  assert.deepEqual([idsOf(shop).length, idsOf(blog).length], [1, 1]);
  const [shopId] = idsOf(shop); const [blogId] = idsOf(blog);
  assert.notEqual(shopId, blogId, "the same origin, two cookie jars");
  assert.deepEqual(h.stored().map(project => project.container.user_context_id), [shopId, blogId]);
  // A restarted service reads the saved mapping and creates nothing.
  const restarted = h.make();
  restarted.registerWindow(h.zen.window, h.adapter);
  await restarted.openProjectUrl({ window: h.zen.window, projectId: shop.id, url: SHARED_ORIGIN });
  assert.equal(h.tabs.at(-1).options.userContextId, shopId);
  assert.equal(h.gecko.creates(), 2);
});

test("P2: a failed save never routes; the retry reuses the identity it already made", { skip }, async () => {
  const h = p2Harness({ enabled: false });
  const shop = await shopIn(h);
  h.state.enabled = true;
  h.writes.fail = true;
  await quietly(() => assert.rejects(h.open(shop, SHARED_ORIGIN), /disk full/));
  assert.equal(h.tabs.length, 0, "no tab with an unsaved container");
  assert.equal(h.gecko.creates(), 1);
  assert.ok(h.gecko.identities.has(40), "the made identity is kept, never removed");
  h.writes.fail = false;
  await h.open(shop, SHARED_ORIGIN);
  assert.equal(h.tabs[0].options.userContextId, 40);
  assert.equal(h.gecko.creates(), 1, "the retry hint reused it");
  assert.equal(h.stored()[0].container.user_context_id, 40);
});

test("P2: compare-and-set: a project removed while its container is made gets no tab", { skip }, async () => {
  const h = p2Harness({ enabled: false });
  const shop = await shopIn(h);
  h.state.enabled = true;
  h.gecko.state.onCreate = () => { h.services.removeProject(shop.id); };
  await assert.rejects(h.open(shop, SHARED_ORIGIN), error => ["PROJECT_CHANGED", "UNKNOWN_PROJECT"].includes(error.code));
  assert.equal(h.tabs.length, 0);
  assert.deepEqual(h.stored(), []);
  assert.ok(h.gecko.identities.has(40), "removal never clears a container");
});

test("P2: account labels are typed by the user, validated, replaceable and removable; every other field stays", { skip }, async () => {
  const h = p2Harness();
  const shop = await shopIn(h);
  // A project that also has a brief: rewrite the profile store, then restart.
  const document = JSON.parse(h.files.get("contexts.json"));
  document.projects[0].brief = { version: 1, cli: "codex", generated_at: NOON, accepted: false, document: { version: 1,
    product: "A synthetic shop.", apps: [], domains: [], services: [], start: [], risks: [] } };
  h.files.set("contexts.json", JSON.stringify(document));
  const services = h.make();
  services.registerWindow(h.zen.window, h.adapter);
  const before = await services.getProject(shop.id);
  assert.ok(before.detected && before.brief && before.container.user_context_id === 40);
  const strip = ({ accounts, updated_at, ...rest }) => rest;
  const saved = await services.setAccountLabel(shop.id, { key: "vercel", label: "  work Google  " });
  assert.deepEqual(saved.accounts, [{ key: "vercel", label: "work Google" }]);
  assert.deepEqual(strip(saved), strip(before), "detected, brief, manifest, trust, container and shared sites are kept");
  await services.setAccountLabel(shop.id, { key: "*.Atlassian.net", label: "Work Microsoft" });
  await services.setAccountLabel(shop.id, { key: "vercel", label: "personal Google" });
  assert.deepEqual((await services.getProject(shop.id)).accounts,
    [{ key: "*.atlassian.net", label: "Work Microsoft" }, { key: "vercel", label: "personal Google" }]);
  await services.setAccountLabel(shop.id, { key: "vercel", label: null });
  assert.deepEqual((await services.getProject(shop.id)).accounts, [{ key: "*.atlassian.net", label: "Work Microsoft" }]);
  const file = h.files.get("contexts.json");
  for (const account of [{ key: "vercel", label: "" }, { key: "vercel", label: "   " }, { key: "vercel", label: "a\nb" },
    { key: "vercel", label: "a\u009fb" }, { key: "vercel", label: "x".repeat(81) }, { key: "vercel", label: 7 }, { key: "vercel" }]) {
    await assert.rejects(services.setAccountLabel(shop.id, account), { code: "INVALID_INPUT" }, JSON.stringify(account));
  }
  for (const key of ["https://vercel.com", "*.com", "", "a b.example", 12]) {
    await assert.rejects(services.setAccountLabel(shop.id, { key, label: "x" }), { code: "INVALID_HOST_PATTERN" }, String(key));
  }
  assert.equal(h.files.get("contexts.json"), file, "a refused label writes nothing");
  for (let i = 0; i < 31; i++) await services.setAccountLabel(shop.id, { key: `site${i}.example`, label: `Account ${i}` });
  const full = h.files.get("contexts.json");
  await assert.rejects(services.setAccountLabel(shop.id, { key: "one-more.example", label: "x" }), { code: "INVALID_PROJECT" });
  assert.equal(h.files.get("contexts.json"), full);
  await assert.rejects(services.setAccountLabel("p_unknown1", { key: "vercel", label: "x" }), { code: "UNKNOWN_PROJECT" });
  assert.equal(h.gecko.creates(), 1, "labels never touch containers");
});

test("P2: suggested shared sites stay in the project's container; only confirmed ones use the space's sign-ins", { skip }, async () => {
  const h = p2Harness();
  const shop = await shopIn(h); // in APP, whose default container is 2
  assert.equal(shop.shared_sites.confirmed, false);
  assert.ok(shop.shared_sites.hosts.includes("github.com"), "the default is offered");
  assert.deepEqual(await h.open(shop, "https://github.com/acme/shop"), { opened: true, container: "project", selected: true });
  assert.equal(h.tabs.at(-1).options.userContextId, 40, "an unconfirmed suggestion shares nothing");
  const confirmed = await h.services.setSharedSites(shop.id, { hosts: ["github.com", "*.github.com"], confirmed: true });
  assert.deepEqual(confirmed.shared_sites, { hosts: ["github.com", "*.github.com"], confirmed: true });
  assert.equal(confirmed.container.user_context_id, 40);
  assert.deepEqual(await h.open(shop, "https://gist.github.com/x"), { opened: true, container: "shared_site", selected: true });
  assert.deepEqual([h.tabs.at(-1).options.userContextId, h.tabs.at(-1).options.triggeringPrincipal.originAttributes.userContextId], [2, 2]);
  await h.open(shop, "https://evilgithub.com/x");
  assert.equal(h.tabs.at(-1).options.userContextId, 40);
  const file = h.files.get("contexts.json");
  for (const sites of [{ hosts: ["https://github.com"], confirmed: true }, { hosts: ["github.com", "github.com"], confirmed: true },
    { hosts: Array.from({ length: 33 }, (_, i) => `s${i}.example`), confirmed: true }, { hosts: ["github.com"], confirmed: "yes" }]) {
    await assert.rejects(h.services.setSharedSites(shop.id, sites), { code: "INVALID_PROJECT" }, JSON.stringify(sites).slice(0, 60));
  }
  await assert.rejects(h.services.setSharedSites(shop.id, { hosts: ["github.com"] }), { code: "INVALID_PROJECT" });
  await assert.rejects(h.services.setSharedSites("p_unknown1", { hosts: [], confirmed: true }), { code: "UNKNOWN_PROJECT" });
  assert.equal(h.files.get("contexts.json"), file);
  await h.services.setSharedSites(shop.id, { hosts: ["github.com"], confirmed: false });
  await h.open(shop, "https://github.com/acme/shop");
  assert.equal(h.tabs.at(-1).options.userContextId, 40, "turning sharing off takes effect on the next link");
});

test("P2: private and unknown-privacy windows open plain tabs and never create or use a project container", { skip }, async () => {
  const h = p2Harness({ enabled: false });
  const shop = await shopIn(h);
  h.state.enabled = true;
  const priv = fakeZenWindow({ spaces: [{ uuid: HOME, name: "Home" }], isPrivate: true });
  priv.window.gBrowser.addTab = () => assert.fail("no container tab in a private window");
  h.services.registerWindow(priv.window, new ZenWorkspaceAdapter(priv.window));
  assert.deepEqual(await h.open(shop, SHARED_ORIGIN, priv.window), { opened: true, container: "private" });
  assert.deepEqual(priv.opened.map(entry => [entry.url, entry.principal.isSystemPrincipal, entry.principal.originAttributes.userContextId]),
    [[SHARED_ORIGIN, false, 0]]);
  const unknown = fakeZenWindow({ spaces: [{ uuid: HOME, name: "Home" }] });
  delete unknown.window.PrivateBrowsingUtils;
  unknown.window.gBrowser.addTab = () => assert.fail("unknown privacy counts as private");
  h.services.registerWindow(unknown.window, new ZenWorkspaceAdapter(unknown.window));
  assert.equal((await h.open(shop, SHARED_ORIGIN, unknown.window)).container, "private");
  assert.equal(h.gecko.creates(), 0);
  assert.equal(h.tabs.length, 0);
  assert.equal(h.stored()[0].container.user_context_id, null);
});

test("P2: Firefox deleting a container or turning containers off clears mappings; reused IDs are never adopted", { skip }, async () => {
  const h = p2Harness();
  const shop = await shopIn(h);
  const blog = await blogIn(h);
  assert.deepEqual(h.stored().map(project => project.container.user_context_id), [40, 41]);
  // The user deletes Shop's container in Firefox's settings.
  h.gecko.identities.delete(40);
  h.observed.identityDeleted(40);
  await settle();
  assert.deepEqual(h.stored().map(project => [project.id, project.container.user_context_id]), [[shop.id, null], [blog.id, 41]],
    "the project stays; only its mapping goes");
  await h.open(shop, SHARED_ORIGIN);
  assert.equal(h.tabs.at(-1).options.userContextId, 42, "a new container, never the deleted one");
  h.observed.identityDeleted("not an id");
  h.observed.identityDeleted(undefined);
  // Containers turned off: Firefox resets every identity without per-ID notifications.
  h.state.enabled = false;
  h.gecko.reset();
  h.observed.containersDisabled();
  assert.deepEqual(await h.open(blog, SHARED_ORIGIN), { opened: true, container: "off" }, "links open like before, in the space's own container");
  assert.equal(h.zen.opened.at(-1).url, SHARED_ORIGIN);
  await settle();
  assert.deepEqual(h.stored().map(project => project.container.user_context_id), [null, null]);
  // Turned on again: numbering restarted, and 40 now names an unrelated identity.
  h.state.enabled = true;
  h.gecko.identities.set(40, { userContextId: 40, public: true, name: "Unrelated", icon: "cart", color: "red" });
  h.gecko.state.next = 41;
  const tabsBefore = h.tabs.length;
  await h.open(shop, SHARED_ORIGIN);
  assert.equal(h.tabs.length, tabsBefore + 1);
  assert.equal(h.tabs.at(-1).options.userContextId, 41, "a freshly made container named after the project");
  assert.equal(h.gecko.identities.get(41).name, "Shop");
  assert.equal(h.gecko.identities.get(40).name, "Unrelated", "the reused number was not adopted or restyled");
});

test("P2: a failed reset or deletion cleanup blocks project links until a retry succeeds; startup with containers off resets", { skip }, async () => {
  const h = p2Harness();
  const shop = await shopIn(h);
  await quietly(async () => {
    h.writes.fail = true;
    h.state.enabled = false;
    h.observed.containersDisabled();
    await settle();
    h.state.enabled = true;
    await assert.rejects(h.open(shop, SHARED_ORIGIN), /disk full/, "the retry fails as well: nothing is routed on stale mappings");
    assert.equal(h.tabs.length, 0);
    h.writes.fail = false;
    await h.open(shop, SHARED_ORIGIN);
    assert.equal(h.stored()[0].container.user_context_id, 41, "after the cleanup a new container is made");
    h.writes.fail = true;
    h.observed.identityDeleted(41);
    await settle();
    await assert.rejects(h.open(shop, SHARED_ORIGIN), /disk full/);
    h.writes.fail = false;
    await h.open(shop, SHARED_ORIGIN);
    assert.equal(h.tabs.at(-1).options.userContextId, 42);
  });
  assert.equal(h.tabs.length, 2);
  // Containers turned off while the browser was closed: the next start clears the mappings first.
  h.state.enabled = false;
  const restarted = h.make();
  await settle();
  assert.equal((await restarted.getProject(shop.id)).container.user_context_id, null);
});

test("P2: an opening stops when Firefox deletes the container while the space switches", { skip }, async () => {
  const h = p2Harness();
  const shop = await shopIn(h);
  let once = true;
  h.zen.zen.addChangeListeners(() => {
    if (!once) return;
    once = false;
    h.gecko.identities.delete(40);
    h.observed.identityDeleted(40);
  });
  await assert.rejects(h.open(shop, SHARED_ORIGIN), { code: "PROJECT_CHANGED" });
  assert.equal(h.tabs.length, 0, "checked again right before the tab would exist");
});

// The project shares github.com with its space (APP, default container 2); the
// window shows HOME, so opening the link switches spaces first. Each change
// below lands while that switch is held; the route must be refused before a
// tab exists, never opened in the old (shared) or any other container.
const RACES = [
  ["the shared host is removed while sharing stays confirmed", h => h.services.setSharedSites(h.shop.id, { hosts: [], confirmed: true }),
    h => assert.deepEqual(h.stored()[0].shared_sites, { hosts: [], confirmed: true })],
  ["sharing is revoked", h => h.services.setSharedSites(h.shop.id, { hosts: ["github.com"], confirmed: false })],
  ["the project is deleted", h => h.services.removeProject(h.shop.id), h => assert.deepEqual(h.stored(), [])],
  ["the project is renamed", h => h.services.updateProject(h.shop.id, { manifest: { ...MANIFEST, name: "Shop Renamed" } })],
  ["the project moves to another space", h => h.services.updateProject(h.shop.id, { context_uuid: HOME })],
  ["an account label is saved", h => h.services.setAccountLabel(h.shop.id, { key: "vercel", label: "work Google" })],
  ["a mutation of the project fails", h => assert.rejects(h.services.setSharedSites(h.shop.id, { hosts: ["not a host"], confirmed: true }), { code: "INVALID_PROJECT" }),
    h => assert.deepEqual(h.stored()[0].shared_sites, { hosts: ["github.com"], confirmed: true }), "state unchanged, still refused"],
  ["containers are turned off and reset", h => { h.state.enabled = false; h.observed.containersDisabled(); return settle(); }],
  ["Firefox deletes the project's container", h => { h.gecko.identities.delete(40); h.observed.identityDeleted(40); return settle(); }],
];
for (const [name, change, check] of RACES) {
  test(`P2: a link in flight is refused when ${name} during the space switch`, { skip }, async () => {
    const h = p2Harness();
    h.shop = await shopIn(h);
    await h.services.setSharedSites(h.shop.id, { hosts: ["github.com"], confirmed: true });
    const held = h.pauseSwitch();
    const pending = h.open(h.shop, "https://github.com/acme/shop");
    await held.started;
    await quietly(() => change(h));
    held.release();
    await assert.rejects(pending, { code: "PROJECT_CHANGED" });
    assert.equal(h.tabs.length, 0, "no tab exists in the old jar or any other");
    await check?.(h);
  });
}

test("P2: a mutation still in flight when the tab would open refuses it; after the change the link opens by the new policy", { skip }, async () => {
  const h = p2Harness();
  const shop = await shopIn(h);
  await h.services.setSharedSites(shop.id, { hosts: ["github.com"], confirmed: true });
  const held = h.pauseSwitch();
  const pending = h.open(shop, "https://github.com/acme/shop");
  await held.started;
  let unblock;
  h.writes.gate = new Promise(resolve => { unblock = resolve; });
  const saving = h.services.setSharedSites(shop.id, { hosts: [], confirmed: true });
  held.release();
  await assert.rejects(pending, { code: "PROJECT_CHANGED" }, "not yet written, already decided by the user");
  assert.equal(h.tabs.length, 0);
  unblock();
  h.writes.gate = null;
  await saving;
  assert.deepEqual(await h.open(shop, "https://github.com/acme/shop"), { opened: true, container: "project", selected: true });
  assert.equal(h.tabs[0].options.userContextId, 40, "the project's own container, never the space's");
});

test("P2: another project's change does not stop a link in flight; the guard is per project", { skip }, async () => {
  const h = p2Harness();
  const shop = await shopIn(h);
  const blog = await blogIn(h);
  await h.services.setSharedSites(shop.id, { hosts: ["github.com"], confirmed: true });
  const held = h.pauseSwitch();
  const pending = h.open(shop, "https://github.com/acme/shop");
  await held.started;
  await h.services.setAccountLabel(blog.id, { key: "vercel", label: "personal Google" });
  held.release();
  assert.deepEqual(await pending, { opened: true, container: "shared_site", selected: true });
  assert.deepEqual(h.tabs.map(tab => tab.options.userContextId), [2]);
});

test("P2: a vetoed selection leaves the owned tab open and says so; a modal window is refused before any tab", { skip }, async () => {
  const h = p2Harness();
  const shop = await shopIn(h);
  const before = { id: "an unrelated tab" };
  h.zen.window.gBrowser.selectedTab = before;
  h.state.veto = true;
  assert.deepEqual(await h.open(shop, "https://vercel.com/team/shop"), { opened: true, container: "project", selected: false });
  assert.equal(h.tabs.length, 1, "the new tab is kept, in its container");
  assert.equal(h.zen.window.gBrowser.selectedTab, before, "the other tab was not touched");
  h.state.veto = false;
  h.zen.window.document.documentElement = { hasAttribute: name => name === "window-modal-open" };
  await assert.rejects(h.open(shop, "https://vercel.com/team/shop"), { code: "WINDOW_BUSY" });
  assert.equal(h.tabs.length, 1);
});

test("P2: renaming renames only the project's own container; removing a project keeps its container", { skip }, async () => {
  const h = p2Harness();
  const shop = await shopIn(h);
  await h.services.updateProject(shop.id, { manifest: { ...MANIFEST, name: "Shop Renamed" } });
  assert.deepEqual(h.gecko.calls.filter(call => call[0] === "update").map(call => call.slice(0, 3)), [["update", 40, "Shop Renamed"]]);
  assert.equal(h.gecko.identities.get(40).name, "Shop Renamed");
  await h.services.updateProject(shop.id, { context_uuid: HOME });
  assert.equal(h.gecko.calls.filter(call => call[0] === "update").length, 1, "only a rename restyles the container");
  await h.services.removeProject(shop.id);
  assert.ok(h.gecko.identities.has(40), "the container and its sign-ins stay");
  assert.deepEqual(h.stored(), []);
});

test("P2: the Overview reads each project's container without IDs; nothing is created by reading", { skip }, async () => {
  const h = p2Harness({ enabled: false });
  const shop = await shopIn(h);
  const blog = await blogIn(h);
  assert.deepEqual(await h.services.listProjectContainers(), [{ project_id: shop.id, state: "off" }, { project_id: blog.id, state: "off" }]);
  h.state.enabled = true;
  assert.deepEqual(await h.services.listProjectContainers(), [{ project_id: shop.id, state: "pending" }, { project_id: blog.id, state: "pending" }]);
  assert.equal(h.gecko.creates(), 0);
  await h.open(shop, SHARED_ORIGIN);
  const [own, pending] = await h.services.listProjectContainers();
  assert.deepEqual(Object.keys(own), ["project_id", "state", "name", "color"]);
  assert.deepEqual([own.state, own.name], ["own", "Shop"]);
  assert.ok(GECKO_COLORS.includes(own.color));
  assert.equal(pending.state, "pending");
  assert.doesNotMatch(JSON.stringify(await h.services.listProjectContainers()), /user_?context|:40\b/iu);
});

test("P2: a configured but broken identity service fails closed instead of opening in a shared jar", { skip }, async () => {
  const h = await quietly(() => harness({ tree: VITE_TREE, deps: {
    containerIdentities: () => { throw new Error("ContextualIdentityService unavailable"); }, containersEnabled: () => true } }));
  const shop = await shopIn(h);
  await assert.rejects(h.services.openProjectUrl({ window: h.zen.window, projectId: shop.id, url: "https://vercel.com/" }), { code: "CONTAINERS_UNAVAILABLE" });
  assert.equal(h.zen.opened.length, 0);
  assert.deepEqual(await h.services.listProjectContainers(), [{ project_id: shop.id, state: "unavailable" }]);
});
