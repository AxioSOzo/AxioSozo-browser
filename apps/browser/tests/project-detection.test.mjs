import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import * as core from "../../../packages/contexts/src/index.mjs";
import { createProjectDetection } from "../chrome/ProjectDetection.sys.mjs";

function memoryFs(input, hooks = {}) {
  const nodes = new Map(Object.entries(input)), calls = [], ids = new WeakMap();
  let nextId = 0;
  const identity = node => { if (!ids.has(node)) ids.set(node, { device: "1", inode: String(++nextId) }); return ids.get(node); };
  const info = node => !node ? null : { type: node.link ? "symlink" : node.dir ? "directory" : "regular",
    size: node.dir || node.link ? 0 : typeof node.file === "string" ? Buffer.byteLength(node.file) : node.file.byteLength,
    identity: identity(node) };
  const same = (a, b) => a && b && a.device === b.device && a.inode === b.inode;
  const nofollow = path => {
    let current = "";
    for (const part of path.split("/").filter(Boolean)) {
      current += `/${part}`;
      const node = nodes.get(current);
      if (!node || node.link) throw new Error("CONTAINMENT_REFUSED");
    }
    return nodes.get(path);
  };
  function resolve(path, followLeaf = true, depth = 0) {
    if (depth > 16) throw new Error("ELOOP");
    const parts = path.split("/").filter(Boolean);
    let current = "";
    for (let i = 0; i < parts.length; i++) {
      current += `/${parts[i]}`;
      const node = nodes.get(current);
      if (node?.link && (followLeaf || i < parts.length - 1)) current = resolve(node.link, true, depth + 1);
    }
    return current || "/";
  }
  return {
    nodes, calls,
    join: (root, relative) => `${root.replace(/\/$/u, "")}/${relative}`,
    basename: path => path.replace(/\/$/u, "").split("/").at(-1),
    async lstat(path) { calls.push(["lstat", path]); return info(nodes.get(resolve(path, false))); },
    async stat(path) { calls.push(["stat", path]); return info(nodes.get(resolve(path))); },
    async realpath(path) { calls.push(["realpath", path]); const real = resolve(path); if (!nodes.has(real)) throw new Error("ENOENT"); return real; },
    async read() { throw new Error("UNSAFE_READ_MUST_NEVER_BE_USED"); },
    async rootMetadata(root) {
      const node = nofollow(root);
      return info(node);
    },
    async fileMetadata({ root, relative, expectedRoot }) {
      const rootNode = nofollow(root);
      if (!same(identity(rootNode), expectedRoot)) throw new Error("ROOT_CHANGED");
      return info(nofollow(`${root}/${relative}`));
    },
    async readContained({ root, relative, expectedRoot, expectedFile, maxBytes }) {
      const path = `${root}/${relative}`;
      hooks.beforeContainedRead?.(path, nodes);
      const rootNode = nofollow(root), node = nofollow(path);
      if (!same(identity(rootNode), expectedRoot) || !same(identity(node), expectedFile)) throw new Error("IDENTITY_CHANGED");
      if (node.dir || node.link) throw new Error("NOT_FILE");
      calls.push(["read", path, maxBytes]);
      const bytes = typeof node.file === "string" ? Buffer.from(node.file) : node.file;
      const out = new Uint8Array(bytes.subarray(0, maxBytes));
      hooks.afterRead?.(path, nodes);
      return out;
    },
    async presenceMetadata({ root, relative, expectedRoot }) {
      const rootNode = nofollow(root);
      if (!same(identity(rootNode), expectedRoot)) throw new Error("ROOT_CHANGED");
      try { return info(nofollow(`${root}/${relative}`)); } catch { return null; }
    },
    async listContained({ root, relative, expectedRoot, expectedDirectory, limit }) {
      const path = relative ? `${root}/${relative}` : root;
      hooks.beforeContainedList?.(path, nodes);
      const rootNode = nofollow(root), node = nofollow(path);
      if (!same(identity(rootNode), expectedRoot) || !same(identity(node), expectedDirectory) || !node.dir) throw new Error("IDENTITY_CHANGED");
      const entries = await this.listDirectory(path, limit);
      return { entries, identity: identity(node) };
    },
    async listDirectory(path, limit) {
      calls.push(["list", path, limit]);
      const real = resolve(path);
      if (!nodes.get(real)?.dir) throw new Error("NOT_DIRECTORY");
      const entries = [...nodes].filter(([p]) => p.startsWith(`${real}/`) && !p.slice(real.length + 1).includes("/"))
        .map(([p, node]) => ({ name: p.slice(real.length + 1), type: info(node).type })).slice(0, limit);
      hooks.afterList?.(path, nodes);
      return entries;
    },
  };
}
const detect = (fs, root = "/repo") => createProjectDetection({ fs, reader: fs, core, clock: () => 123 }).detect(root);
const packageJson = value => ({ file: JSON.stringify(value) });

async function fixture(name) {
  const root = `/fixtures/${name}`, tree = { "/fixtures": { dir: true }, [root]: { dir: true } };
  const base = new URL(`../../../packages/contexts/tests/fixtures/${name}/`, import.meta.url);
  async function visit(url, relative = "") {
    for (const entry of await readdir(url, { withFileTypes: true })) {
      if (entry.name.startsWith("._")) continue;
      const rel = `${relative}${entry.name}`;
      const virtualRel = rel.replace(/^_git(?=\/|$)/u, ".git");
      const next = new URL(entry.name + (entry.isDirectory() ? "/" : ""), url);
      if (entry.isDirectory()) { tree[`${root}/${virtualRel}`] = { dir: true }; await visit(next, `${rel}/`); }
      else if (entry.isFile()) tree[`${root}/${virtualRel}`] = { file: await readFile(next) };
    }
  }
  await visit(base);
  tree[`${root}/.env`] = { file: "TRAP_SECRET=do-not-read" };
  return { root, tree };
}

for (const name of ["harbor-suite", "inkline"]) {
  test(`${name}: all four reader phases match the core draft and preserve native-only directories`, async () => {
    const { root, tree } = await fixture(name);
    const fs = memoryFs(tree);
    const result = await detect(fs, root);
    const expected = JSON.parse(await readFile(new URL(`../../../packages/contexts/tests/expected/${name}.json`, import.meta.url), "utf8"));
    assert.deepEqual(result.draft, expected);
    assert.equal(result.detectedAt, 123);
    assert.equal(result.canonicalRoot, root);
    assert.ok(Object.isFrozen(result) && Object.isFrozen(result.draft));
    assert.ok(result.draft.platforms.some(p => p.kind === "macos"));
    assert.ok(result.draft.platforms.some(p => p.kind === "ios"));
    assert.ok(result.draft.platforms.some(p => p.kind === "android"));
    assert.doesNotMatch(JSON.stringify(result.draft), /TRAP|SECRET/u);
    for (const [method, path, limit] of fs.calls) {
      if (method === "read") {
        const rel = path.slice(root.length + 1);
        const part = core.PACKAGE_DETECTION_FILES.find(p => rel.endsWith(`/${p}`));
        assert.ok(core.isAllowedPath(rel) || core.isDocumentPath(rel) || (part && core.isAllowedPackagePath(rel.slice(0, -part.length - 1), part)), rel);
        assert.equal(limit, core.MAX_FILE_BYTES + 1);
        assert.doesNotMatch(path, /\.env|AGENTS|CLAUDE|\.claude|agent-worktrees|xcodeproj|gradle|schema\.ts/u);
      }
      if (method === "list") assert.equal(limit, 512);
      assert.ok(path === root || path.startsWith(`${root}/`), `${method}: ${path}`);
    }
  });
}

test("inventory lists the planned hidden worktree directory but never its content", async () => {
  const fs = memoryFs({ "/repo": { dir: true }, "/repo/.agent-worktrees": { dir: true },
    "/repo/.agent-worktrees/a": { dir: true }, "/repo/.agent-worktrees/a/.env": { file: "TRAP" },
    "/repo/AGENTS.md": { file: "TRAP" } });
  const { draft } = await detect(fs);
  assert.deepEqual(draft.agents, { files: ["AGENTS.md"], dirs: [".agent-worktrees"], worktrees: 1 });
  assert.ok(fs.calls.some(([method, path]) => method === "list" && path === "/repo/.agent-worktrees"));
  assert.deepEqual(fs.calls.filter(([method]) => method === "read"), []);
});

test("outside inventory/document links and a domains.md-to-env link are rejected before content access", async () => {
  const fs = memoryFs({ "/repo": { dir: true }, "/repo/docs": { dir: true }, "/repo/docs/production": { dir: true },
    "/repo/.env": { file: "TRAP https://private.secret-site.com" }, "/repo/docs/domains.md": { link: "/repo/.env" },
    "/repo/docs/production/domains.md": { link: "/outside/domains.md" }, "/repo/ios": { link: "/outside" },
    "/outside": { dir: true }, "/outside/Evil.xcodeproj": { dir: true }, "/outside/domains.md": { file: "TRAP `secret-site.com`" } });
  const { draft } = await detect(fs);
  assert.deepEqual(draft.platforms, []);
  assert.deepEqual(draft.domains, []);
  assert.deepEqual(draft.refused, [
    { path: "docs/domains.md", reason: "not_allowlisted" },
    { path: "docs/production/domains.md", reason: "symlink_outside_root" }]);
  assert.ok(!fs.calls.some(([method, path]) => ["read", "stat", "list"].includes(method) && path.startsWith("/outside")));
  assert.ok(!fs.calls.some(([method, path]) => method === "read" && path.includes(".env")));
});

test("inventory child symlinks do not imply native platforms or authorize documentation", async () => {
  const fs = memoryFs({ "/repo": { dir: true }, "/repo/ios": { dir: true }, "/repo/ios/Evil.xcodeproj": { link: "/outside" },
    "/repo/docs": { dir: true }, "/repo/docs/private": { link: "/outside" }, "/outside": { dir: true },
    "/outside/domains.md": { file: "TRAP `private-site.com`" } });
  const { draft } = await detect(fs);
  assert.deepEqual(draft.platforms, []);
  assert.deepEqual(draft.domains, []);
  assert.ok(!fs.calls.some(([method, path]) => method === "lstat" && path === "/repo/docs/private/domains.md"));
});

test("documentation limits bytes and strict UTF-8 and does not open arbitrary markdown", async () => {
  const fs = memoryFs({ "/repo": { dir: true }, "/repo/docs": { dir: true },
    "/repo/docs/domains.md": { file: new Uint8Array([0xff, 0xfe]) }, "/repo/docs/production": { dir: true },
    "/repo/docs/production/domains.md": { file: "x".repeat(core.MAX_FILE_BYTES + 1) },
    "/repo/docs/README.md": { file: "TRAP `private-site.com`" } });
  const { draft } = await detect(fs);
  assert.deepEqual(draft.refused, [{ path: "docs/domains.md", reason: "invalid_utf8" },
    { path: "docs/production/domains.md", reason: "too_large" }]);
  assert.ok(!fs.calls.some(([method, path]) => method === "read" && path.endsWith("README.md")));
  assert.ok(!fs.calls.some(([method, path]) => method === "read" && path.endsWith("production/domains.md")));
});

test("a source that grows after stat is read through the hard cap and refused", async () => {
  const fs = memoryFs({ "/repo": { dir: true }, "/repo/package.json": packageJson({ name: "fixture" }) });
  const originalMetadata = fs.fileMetadata;
  fs.fileMetadata = async request => {
    const result = await originalMetadata(request);
    if (request.relative === "package.json") fs.nodes.get("/repo/package.json").file = "x".repeat(core.MAX_FILE_BYTES + 1000);
    return result;
  };
  const { draft } = await detect(fs);
  assert.deepEqual(draft.refused, [{ path: "package.json", reason: "too_large" }]);
  assert.ok(fs.calls.some(([method, path, limit]) => method === "read" && path === "/repo/package.json" && limit === core.MAX_FILE_BYTES + 1));
});

test("post-read target changes discard the captured content", async () => {
  const fs = memoryFs({ "/repo": { dir: true }, "/repo/docs": { dir: true },
    "/repo/docs/domains.md": { file: "`captured-site.com`" }, "/outside": { dir: true },
    "/outside/domains.md": { file: "TRAP" } }, {
    afterRead(path, nodes) { if (path === "/repo/docs/domains.md") nodes.set(path, { link: "/outside/domains.md" }); }
  });
  const { draft } = await detect(fs);
  assert.deepEqual(draft.domains, []);
  assert.deepEqual(draft.refused, [{ path: "docs/domains.md", reason: "unreadable" }]);
});

test("post-list changes discard the listing and prevent document reads", async () => {
  const fs = memoryFs({ "/repo": { dir: true }, "/repo/docs": { dir: true }, "/repo/docs/production": { dir: true },
    "/repo/docs/production/domains.md": { file: "`captured-site.com`" }, "/outside": { dir: true } }, {
    afterList(path, nodes) { if (path === "/repo/docs") nodes.set(path, { link: "/outside" }); }
  });
  const { draft } = await detect(fs);
  assert.deepEqual(draft.domains, []);
  assert.ok(!fs.calls.some(([method, path]) => method === "read" && path.includes("docs")));
});

test("canonical root changes invalidate the whole scan", async () => {
  const fs = memoryFs({ "/repo": { dir: true }, "/repo/package.json": packageJson({ name: "fixture" }), "/outside": { dir: true } }, {
    afterRead(path, nodes) { if (path === "/repo/package.json") nodes.set("/repo", { link: "/outside" }); }
  });
  await assert.rejects(detect(fs), error => error.code === "ROOT_CHANGED");
});

test("legacy ordinary listing is not a capability requirement when a secure listing reader is supplied", async () => {
  const fs = memoryFs({ "/repo": { dir: true }, "/repo/package.json": packageJson({ scripts: { dev: "vite --port 5199" } }),
    "/repo/AGENTS.md": { file: "TRAP" } });
  const reader = { ...fs };
  reader.listContained = async request => ({ entries: [], identity: request.expectedDirectory });
  delete fs.listDirectory;
  const { draft } = await createProjectDetection({ fs, reader, core, clock: () => 123 }).detect("/repo");
  assert.equal(draft.environments[0].base_url, "http://localhost:5199/");
  assert.deepEqual(draft.agents.files, ["AGENTS.md"]);
  assert.ok(!fs.calls.some(([method, path]) => method === "read" && path.endsWith("AGENTS.md")));
});

test("invalid roots fail before any arbitrary path access", async () => {
  const fs = memoryFs({ "/repo": { dir: true } });
  for (const root of ["/", "relative", "/repo/../private", "/repo\u0000/private", "/repo\n/private"]) {
    await assert.rejects(detect(fs, root), error => error.code === "INVALID_ROOT");
  }
  assert.deepEqual(fs.calls, []);
});


test("documentation visits only the first eight named child directories", async () => {
  const tree = { "/repo": { dir: true }, "/repo/docs": { dir: true },
    "/repo/docs/domains.md": { file: "`root-site.com`" } };
  for (let i = 0; i < 12; i++) {
    const child = `part${String(i).padStart(2, "0")}`;
    tree[`/repo/docs/${child}`] = { dir: true };
    tree[`/repo/docs/${child}/domains.md`] = { file: `\`child${i}.product-site.com\`` };
  }
  const fs = memoryFs(tree);
  const { draft } = await detect(fs);
  assert.equal(draft.domains.length, 9);
  assert.ok(!fs.calls.some(([, path]) => /docs\/part(08|09|10|11)\/domains\.md$/u.test(path)));
  assert.ok(draft.domains.some(d => d.host === "root-site.com"));
});

test("inventory snapshots cap a misbehaving listing seam rather than counting unlimited worktrees", async () => {
  const fs = memoryFs({ "/repo": { dir: true }, "/repo/.agent-worktrees": { dir: true } });
  fs.listContained = async request => ({ identity: request.expectedDirectory, entries: request.relative === ".agent-worktrees"
    ? Array.from({ length: 1000 }, (_, i) => ({ name: `worktree${i}`, type: "directory" })) : [] });
  const { draft } = await detect(fs);
  assert.equal(draft.agents.worktrees, 512);
});

for (const swap of ["leaf", "ancestor", "root"]) {
  test(`a ${swap} symlink swap between checked metadata and content open refuses before any outside content open`, async () => {
    const fs = memoryFs({ "/repo": { dir: true }, "/repo/docs": { dir: true },
      "/repo/docs/domains.md": { file: "`inside-site.com`" }, "/outside": { dir: true },
      "/outside/docs": { dir: true }, "/outside/domains.md": { file: "TRAP" },
      "/outside/docs/domains.md": { file: "TRAP" } }, {
      beforeContainedRead(path, nodes) {
        if (path !== "/repo/docs/domains.md") return;
        if (swap === "leaf") nodes.set(path, { link: "/outside/domains.md" });
        if (swap === "ancestor") nodes.set("/repo/docs", { link: "/outside" });
        if (swap === "root") nodes.set("/repo", { link: "/outside" });
      }
    });
    if (swap === "root") await assert.rejects(detect(fs), error => error.code === "ROOT_CHANGED");
    else {
      const { draft } = await detect(fs);
      assert.deepEqual(draft.domains, []);
      assert.ok(draft.refused.some(item => item.path === "docs/domains.md" && item.reason === "unreadable"));
    }
    assert.deepEqual(fs.calls.filter(([method]) => method === "read"), []);
  });
}

test("a missing secure reader fails explicitly before filesystem access and never falls back to ordinary read", async () => {
  const fs = memoryFs({ "/repo": { dir: true }, "/repo/package.json": packageJson({ name: "fixture" }) });
  const adapter = createProjectDetection({ fs, core, clock: () => 123 });
  await assert.rejects(adapter.detect("/repo"), error => error.code === "READ_CONTAINMENT_UNAVAILABLE");
  assert.deepEqual(fs.calls, []);
});

test("missing exact inode provenance refuses before any content read", async () => {
  const fs = memoryFs({ "/repo": { dir: true }, "/repo/package.json": packageJson({ name: "fixture" }) });
  fs.rootMetadata = async () => ({ type: "directory", size: 0 });
  await assert.rejects(detect(fs), error => error.code === "READ_CONTAINMENT_UNAVAILABLE");
  assert.deepEqual(fs.calls.filter(([method]) => method === "read"), []);
});

for (const swap of ["directory", "root"]) {
  test(`a ${swap} swap before inventory listing opens no outside directory names`, async () => {
    const fs = memoryFs({ "/repo": { dir: true }, "/repo/docs": { dir: true }, "/outside": { dir: true },
      "/outside/private": { dir: true } }, {
      beforeContainedList(path, nodes) {
        if (path !== "/repo/docs") return;
        if (swap === "root") nodes.set("/repo", { link: "/outside" });
        else nodes.set("/repo/docs", { link: "/outside" });
      }
    });
    if (swap === "root") await assert.rejects(detect(fs), error => error.code === "ROOT_CHANGED");
    else assert.deepEqual((await detect(fs)).draft.domains, []);
    assert.deepEqual(fs.calls.filter(([method, path]) => method === "list" && path !== "/repo"), []);
  });
}
