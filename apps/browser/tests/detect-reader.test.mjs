/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The chrome detection reader (AxioSozoServices.detect) against the contexts
// core's workspace fixtures (contexts-api-v1 §2.1–§2.2). The fs seam here is a
// thin, read-only wrapper over node:fs on a temporary copy of each fixture, with
// the same primitives chromeFileSystem offers (lstat, stat, realpath, bounded
// read, listDirectory). Every opened path and every listed directory is
// recorded so the tests can prove what was never touched. Not evidence of a
// running browser.
import test from "node:test";
import assert from "node:assert/strict";
import { lstat, mkdir, open, readdir, realpath, stat, symlink, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { readFile } from "node:fs/promises";
import { contextsCoreAvailable } from "./support/chrome-modules.mjs";
import { fakeZenWindow } from "./support/fake-zen.mjs";

const skip = contextsCoreAvailable ? false : "packages/contexts/src is absent";
const { AxioSozoServices, chromeFileSystem, MAX_LISTING_ENTRIES } = skip ? {} : await import("../chrome/AxioSozoServices.sys.mjs");
const { ZenWorkspaceAdapter } = await import("../chrome/ZenWorkspaceAdapter.sys.mjs");
const { materializeFixture } = skip ? {} : await import("../../../packages/contexts/tests/fixture-reader.mjs");
const core = skip ? null : await import("../../../packages/contexts/src/index.mjs");

const expected = async name => JSON.parse(await readFile(new URL(`../../../packages/contexts/tests/expected/${name}.json`, import.meta.url), "utf8"));
const typeOf = info => (info.isSymbolicLink() ? "symlink" : info.isDirectory() ? "directory" : info.isFile() ? "regular" : "other");

/** Read-only node:fs seam with chromeFileSystem's shape; records reads and listings. */
function nodeFs() {
  const opened = []; const listed = [];
  return {
    opened, listed,
    join: (root, relative) => join(root, ...relative.split("/")),
    basename: path => basename(path),
    async lstat(path) {
      try { const info = await lstat(path); return { type: typeOf(info), size: info.isFile() ? info.size : 0 }; }
      catch (error) { if (error.code === "ENOENT" || error.code === "ENOTDIR") return null; throw error; }
    },
    async stat(path) {
      try { const info = await stat(path); return { type: typeOf(info), size: info.isFile() ? info.size : 0 }; }
      catch { return null; }
    },
    realpath: path => realpath(path),
    async read(path, maxBytes) {
      opened.push(path);
      const handle = await open(path, "r");
      try {
        const buffer = Buffer.alloc(maxBytes);
        const { bytesRead } = await handle.read(buffer, 0, maxBytes, 0);
        return new Uint8Array(buffer.subarray(0, bytesRead));
      } finally { await handle.close(); }
    },
    async listDirectory(path, limit) {
      listed.push(path);
      const entries = await readdir(path, { withFileTypes: true });
      return entries.slice(0, limit).map(entry => ({ name: entry.name,
        type: entry.isSymbolicLink() ? "symlink" : entry.isDirectory() ? "directory" : entry.isFile() ? "regular" : "other" }));
    },
  };
}

function servicesFor(fs) {
  const files = new Map();
  const services = new AxioSozoServices({
    storageFor: name => ({ read: async () => files.get(name) ?? null, write: async text => { files.set(name, text); } }),
    fs, clock: () => 1, randomId: prefix => `${prefix}fixture1`, probe: async () => "unknown",
    timers: { setTimeout: () => 0, clearTimeout() {} }, pickFolder: async () => null,
  });
  const zen = fakeZenWindow({ spaces: [{ uuid: "11111111-1111-4111-8111-111111111111", name: "Home" }] });
  services.registerWindow(zen.window, new ZenWorkspaceAdapter(zen.window));
  return services;
}

// Traps the reader must never open or list (the same set as the core's workspace tests).
async function plantTraps(fx) {
  const root = fx.root;
  const pkg = (dev, name) => JSON.stringify({ name, scripts: { dev } });
  await mkdir(join(root, "node_modules", "evil"), { recursive: true });
  await writeFile(join(root, "node_modules", "evil", "package.json"), pkg("vite --port 6666", "TRAP-node-modules"));
  await mkdir(join(root, ".hidden", "pkg"), { recursive: true });
  await writeFile(join(root, ".hidden", "pkg", "package.json"), pkg("vite --port 6667", "TRAP-hidden"));
  await mkdir(join(root, "apps", ".secret"), { recursive: true });
  await writeFile(join(root, "apps", ".secret", "package.json"), pkg("vite --port 6668", "TRAP-hidden-app"));
  const outside = join(fx.base, "outside-pkg");
  await mkdir(outside, { recursive: true });
  await writeFile(join(outside, "package.json"), pkg("vite --port 6669", "TRAP-outside"));
  await symlink(outside, join(root, "apps", "linked"));
  for (const dir of ["apps/web", "client"]) {
    try { await writeFile(join(root, ...dir.split("/"), ".env"), "TRAP_ENV_SECRET=never-read-package-env\n"); } catch { /* dir absent */ }
  }
}

for (const name of ["tauri-plus-web", "pnpm-monorepo", "npm-workspaces"]) {
  test(`chrome reader: ${name} gives the core's expected draft and opens only allowlisted files`, { skip }, async () => {
    const fx = await materializeFixture(name);
    try {
      await plantTraps(fx);
      const fs = nodeFs();
      const draft = await servicesFor(fs).detect(fx.root);
      const realRoot = await realpath(fx.root);
      // Only allowlisted root files and PACKAGE_DETECTION_FILES in package dirs were opened.
      for (const path of fs.opened) {
        assert.ok(path.startsWith(realRoot + "/"), path);
        const rel = path.slice(realRoot.length + 1);
        const pkgFile = core.PACKAGE_DETECTION_FILES.find(file => rel.endsWith(`/${file}`));
        const allowed = core.isAllowedPath(rel) || (pkgFile && core.isAllowedPackagePath(rel.slice(0, -pkgFile.length - 1), pkgFile));
        assert.ok(allowed, `opened ${rel}`);
      }
      assert.ok(!fs.opened.some(path => /node_modules|\/\.env|\.hidden|\.secret|outside-pkg|id_ed25519/u.test(path)), JSON.stringify(fs.opened));
      // Only planned parents were listed, all inside the root; nothing below a child.
      assert.ok(fs.listed.length <= 16);
      for (const dir of fs.listed) {
        assert.ok(dir === realRoot || dir.startsWith(realRoot + "/"), dir);
        assert.doesNotMatch(dir, /node_modules|\.hidden|\.git|outside/u);
      }
      assert.deepEqual(draft.refused, [{ path: "apps/linked/package.json", reason: "symlink_outside_root" }],
        "the apps/linked -> outside symlink is refused before anything is opened");
      assert.deepEqual(JSON.parse(JSON.stringify({ ...draft, refused: [] })), await expected(name));
      assert.doesNotMatch(JSON.stringify(draft), /TRAP|never-read|666[6-9]/u);
    } finally { await fx.cleanup(); }
  });
}

test("chrome reader: Domo-like root gives two local environments (Tauri 1420 and web 5173)", { skip }, async () => {
  const fx = await materializeFixture("tauri-plus-web");
  try {
    const draft = await servicesFor(nodeFs()).detect(fx.root);
    assert.deepEqual(draft.environments.map(env => [env.app, env.name, env.base_url]),
      [["desktop", "local", "http://localhost:1420/"], ["web", "local", "http://localhost:5173/"]]);
    // A manifest from the review keeps both apps, and a production URL lands on the web app.
    const manifest = core.draftToManifest(draft, { production_url: "https://domo.example" });
    assert.deepEqual(manifest.environments.map(env => [env.app, env.name]),
      [["desktop", "local"], ["web", "local"], ["web", "production"]]);
  } finally { await fx.cleanup(); }
});

test("chrome reader: a listed parent that is a symlink out of the root is not listed", { skip }, async () => {
  const fx = await materializeFixture("npm-workspaces");
  try {
    const outside = join(fx.base, "outside-apps");
    await mkdir(join(outside, "evil"), { recursive: true });
    await writeFile(join(outside, "evil", "package.json"), JSON.stringify({ name: "TRAP", scripts: { dev: "vite --port 6670" } }));
    await symlink(outside, join(fx.root, "apps"));
    const fs = nodeFs();
    const draft = await servicesFor(fs).detect(fx.root);
    assert.ok(!fs.listed.some(dir => dir.includes("outside")), JSON.stringify(fs.listed));
    assert.ok(!fs.opened.some(path => path.includes("outside")));
    assert.doesNotMatch(JSON.stringify(draft), /TRAP|6670/u);
  } finally { await fx.cleanup(); }
});

test("chrome reader: without listDirectory (older fs seam) only the root phase runs", { skip }, async () => {
  const fx = await materializeFixture("npm-workspaces");
  try {
    const fs = nodeFs();
    delete fs.listDirectory;
    const draft = await servicesFor(fs).detect(fx.root);
    assert.deepEqual(draft.environments, [], "a workspace root alone guesses no dev server");
  } finally { await fx.cleanup(); }
});

test("chromeFileSystem.listDirectory: IOUtils names plus no-follow nsIFile types, capped", { skip }, async () => {
  const tree = {
    "/r/apps": { dir: true }, "/r/apps/web": { dir: true }, "/r/apps/linked": { link: "/elsewhere" },
    "/r/apps/README.md": { file: 3 }, "/r/apps/gone": null, // vanished between listing and lstat: skipped
  };
  const calls = [];
  const makeFile = () => ({
    path: null,
    initWithPath(path) { this.path = path; },
    isSymlink() { const node = tree[this.path]; if (!node) throw new Error("NS_ERROR_FILE_NOT_FOUND"); return !!node.link; },
    // nsIFile.isDirectory follows links; the reader must ask isSymlink first.
    isDirectory() { const node = tree[this.path]; return !!node?.dir || !!node?.link; },
  });
  const saved = { Cc: globalThis.Cc, Ci: globalThis.Ci, IOUtils: globalThis.IOUtils, PathUtils: globalThis.PathUtils };
  globalThis.Cc = { "@mozilla.org/file/local;1": { createInstance: () => makeFile() } };
  globalThis.Ci = { nsIFile: {} };
  globalThis.IOUtils = { getChildren: async (path, options) => { calls.push([path, options]);
    return Object.keys(tree).filter(key => key.startsWith(path + "/") && !key.slice(path.length + 1).includes("/")); } };
  globalThis.PathUtils = { filename: path => path.split("/").at(-1), join: (...parts) => parts.join("/") };
  try {
    const fs = chromeFileSystem();
    assert.deepEqual(await fs.listDirectory("/r/apps"), [
      { name: "web", type: "directory" }, { name: "linked", type: "symlink" }, { name: "README.md", type: "other" }]);
    assert.deepEqual(calls, [["/r/apps", { ignoreAbsent: true }]]);
    assert.equal((await fs.listDirectory("/r/apps", 1)).length, 1);
    assert.equal(MAX_LISTING_ENTRIES, 512);
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});
