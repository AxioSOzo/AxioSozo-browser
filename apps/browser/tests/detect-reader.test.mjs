/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The chrome detection path (AxioSozoServices.detect → ProjectDetection)
// against the contexts core's workspace fixtures (contexts-api-v1 §2.1–§2.2,
// workstation-v1 §1). The fs seam is a thin, metadata-only wrapper over node:fs
// on a temporary copy of each fixture (chromeFileSystem's lstat, stat,
// realpath); content and listings go only through a node:fs stand-in for the
// containment reader (no-follow components, device/inode identities, the same
// request shapes as ProjectReader). Every opened path and every listed
// directory is recorded so the tests can prove what was never touched. Not
// evidence of a running browser or of the real Python helper.
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

/** Metadata-only node:fs seam with chromeFileSystem's shape (no read, no listing). */
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
  };
}

/** Containment-reader stand-in on node:fs. Refuses any symlinked component,
 * compares device/inode identities and records opened files and listings. */
function nodeReader(fs) {
  const refused = () => Object.assign(new Error("READ_CONTAINMENT_REFUSED"), { code: "READ_CONTAINMENT_REFUSED" });
  const identityOf = info => ({ device: String(info.dev), inode: String(info.ino) });
  const same = (a, b) => a?.device === b?.device && a?.inode === b?.inode;
  async function nofollow(path) {
    let current = "";
    for (const part of path.split("/").filter(Boolean)) {
      current += `/${part}`;
      const info = await lstat(current, { bigint: true }).catch(() => null);
      if (!info || info.isSymbolicLink()) throw refused();
    }
    return lstat(path, { bigint: true });
  }
  const meta = info => ({ type: info.isDirectory() ? "directory" : info.isFile() ? "regular" : "other",
    size: info.isFile() ? Number(info.size) : 0, identity: identityOf(info) });
  const checkRoot = async (root, expectedRoot) => { if (!same(identityOf(await nofollow(root)), expectedRoot)) throw refused(); };
  return {
    rootMetadata: async root => meta(await nofollow(root)),
    async fileMetadata({ root, relative, expectedRoot }) { await checkRoot(root, expectedRoot); return meta(await nofollow(`${root}/${relative}`)); },
    async presenceMetadata({ root, relative, expectedRoot }) {
      await checkRoot(root, expectedRoot);
      try { return meta(await nofollow(`${root}/${relative}`)); } catch { return null; }
    },
    async listContained({ root, relative, expectedRoot, expectedDirectory, limit }) {
      const path = relative ? `${root}/${relative}` : root;
      await checkRoot(root, expectedRoot);
      const info = await nofollow(path);
      if (!info.isDirectory() || !same(identityOf(info), expectedDirectory)) throw refused();
      fs.listed.push(path);
      const entries = await readdir(path, { withFileTypes: true });
      return { identity: identityOf(info), entries: entries.slice(0, limit).map(entry => ({ name: entry.name,
        type: entry.isSymbolicLink() ? "symlink" : entry.isDirectory() ? "directory" : entry.isFile() ? "regular" : "other" })) };
    },
    async readContained({ root, relative, expectedRoot, expectedFile, maxBytes }) {
      const path = `${root}/${relative}`;
      await checkRoot(root, expectedRoot);
      const info = await nofollow(path);
      if (!info.isFile() || !same(identityOf(info), expectedFile)) throw refused();
      fs.opened.push(path);
      const handle = await open(path, "r");
      try {
        const buffer = Buffer.alloc(maxBytes);
        const { bytesRead } = await handle.read(buffer, 0, maxBytes, 0);
        return new Uint8Array(buffer.subarray(0, bytesRead));
      } finally { await handle.close(); }
    },
  };
}

function servicesFor(fs, { reader = nodeReader(fs) } = {}) {
  const files = new Map();
  const services = new AxioSozoServices({
    storageFor: name => ({ read: async () => files.get(name) ?? null, write: async text => { files.set(name, text); } }),
    fs, reader, clock: () => 1, randomId: prefix => `${prefix}fixture1`, probe: async () => "unknown",
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
      // Only allowlisted root files, PACKAGE_DETECTION_FILES in package dirs and docs domains files were opened.
      for (const path of fs.opened) {
        assert.ok(path.startsWith(realRoot + "/"), path);
        const rel = path.slice(realRoot.length + 1);
        const pkgFile = core.PACKAGE_DETECTION_FILES.find(file => rel.endsWith(`/${file}`));
        const allowed = core.isAllowedPath(rel) || core.isDocumentPath(rel)
          || (pkgFile && core.isAllowedPackagePath(rel.slice(0, -pkgFile.length - 1), pkgFile));
        assert.ok(allowed, `opened ${rel}`);
      }
      assert.ok(!fs.opened.some(path => /node_modules|\/\.env|\.hidden|\.secret|outside-pkg|id_ed25519|AGENTS|CLAUDE/u.test(path)), JSON.stringify(fs.opened));
      // Only planned parents were listed (workspace phase ≤ 16, inventory ≤ 64), all inside the root.
      assert.ok(fs.listed.length <= 16 + core.MAX_INVENTORY_LIST);
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

test("chrome reader: without a containment reader nothing is listed or opened (no plain fallback)", { skip }, async () => {
  const fx = await materializeFixture("npm-workspaces");
  try {
    const fs = nodeFs();
    await assert.rejects(servicesFor(fs, { reader: null }).detect(fx.root), error => error.code === "READ_CONTAINMENT_UNAVAILABLE");
    assert.deepEqual([fs.opened, fs.listed], [[], []]);
  } finally { await fx.cleanup(); }
});

test("chrome reader: agent files and native app folders are seen by name, never opened", { skip }, async () => {
  const fx = await materializeFixture("npm-workspaces");
  try {
    await writeFile(join(fx.root, "AGENTS.md"), "TRAP-AGENTS-CONTENT");
    await mkdir(join(fx.root, ".claude"), { recursive: true });
    await writeFile(join(fx.root, ".claude", "settings.json"), "TRAP-CLAUDE-SETTINGS");
    await mkdir(join(fx.root, "ios", "Synthetic.xcodeproj"), { recursive: true });
    await writeFile(join(fx.root, "ios", "Synthetic.xcodeproj", "project.pbxproj"), "TRAP-XCODE");
    const fs = nodeFs();
    const draft = await servicesFor(fs).detect(fx.root);
    assert.deepEqual([draft.agents.files, draft.agents.dirs], [["AGENTS.md"], [".claude"]]);
    assert.deepEqual(draft.platforms.map(item => [item.kind, item.name]), [["ios", "Synthetic"]]);
    assert.ok(!fs.opened.some(path => /AGENTS|\.claude|xcodeproj/u.test(path)), JSON.stringify(fs.opened));
    assert.doesNotMatch(JSON.stringify(draft), /TRAP/u);
  } finally { await fx.cleanup(); }
});

test("chromeFileSystem offers metadata and no-follow writes only: no plain read or listing", { skip }, () => {
  const fs = chromeFileSystem();
  assert.equal(fs.read, undefined);
  assert.equal(fs.listDirectory, undefined);
  for (const name of ["join", "basename", "lstat", "stat", "realpath", "makeDirectory", "writeNew", "rename", "remove"]) {
    assert.equal(typeof fs[name], "function", name);
  }
  assert.equal(MAX_LISTING_ENTRIES, 512);
});
