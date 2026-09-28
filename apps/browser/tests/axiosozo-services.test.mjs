import test from "node:test";
import assert from "node:assert/strict";
import { contextsCoreAvailable } from "./support/chrome-modules.mjs";
import { fakeZenWindow } from "./support/fake-zen.mjs";

// Synthetic profile storage, filesystem, clock and probe. No network, no real
// profile, no files outside memory. Not evidence of a running browser.
const skip = contextsCoreAvailable ? false : "packages/contexts/src/index.mjs is absent (contexts core not written yet)";
const { AxioSozoServices, processSingleton, PROBE_MIN_INTERVAL_MS, LEDGER_FLUSH_MS, MAX_PENDING_LEDGER, loopbackAddresses } = skip ? {}
  : await import("../chrome/AxioSozoServices.sys.mjs");
const { ZenWorkspaceAdapter } = await import("../chrome/ZenWorkspaceAdapter.sys.mjs");

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
    listed: [],
    /** Immediate entries of a directory with no-follow types (IOUtils.getChildren + lstat). */
    async listDirectory(path, limit = Infinity) {
      const real = resolve(path, true);
      if (!nodes.get(real)?.dir) throw new Error("ENOTDIR");
      this.listed.push(real);
      const out = [];
      for (const [key, node] of nodes) {
        if (key === real || !key.startsWith(real === "/" ? "/" : real + "/")) continue;
        const name = key.slice(real.length + 1);
        if (name.includes("/")) continue;
        out.push({ name, type: info(node).type });
      }
      return out.slice(0, limit);
    },
    async read(path, maxBytes) {
      hooks.beforeRead?.(path, nodes);
      const real = resolve(path, true);
      reads.push(real);
      const node = nodes.get(real);
      if (!node?.file && node?.file !== "") throw new Error("EISDIR");
      const bytes = typeof node.file === "string" ? Buffer.from(node.file) : node.file;
      return new Uint8Array(bytes.subarray(0, maxBytes));
    },
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

function harness({ spaces, tree = {}, probe, hooks } = {}) {
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
  const make = () => new AxioSozoServices({
    storageFor: storage.storageFor, fs, timers,
    clock: () => now,
    localTime: ms => { const d = new Date(ms); return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(),
      minutes: d.getUTCHours() * 60 + d.getUTCMinutes(), weekday: d.getUTCDay() }; },
    randomId: prefix => `${prefix}fixture${++serial}`,
    probe: async target => { probes.push(target); return probe ? probe(target) : "up"; },
    pickFolder: async () => "/work/shop",
    onShutdown: fn => shutdown.push(fn),
  });
  const services = make();
  const adapter = new ZenWorkspaceAdapter(zen.window);
  const unregister = services.registerWindow(zen.window, adapter);
  return { services, storage, zen, adapter, unregister, fs, timers, probes, shutdown, make,
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
  assert.equal(byUuid[APP].engine_preference, "firefox");
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

test("store v2: a v1 contexts.json is migrated on load and written back as v2 once", { skip }, async () => {
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
  assert.equal(written.version, 2);
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
  assert.equal(stored.version, 2);
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
