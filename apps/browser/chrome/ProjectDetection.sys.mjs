/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free filesystem adapter. The caller supplies the contexts core and the
// metadata primitives AxioSozoServices already uses, plus an explicitly trusted
// reader that binds no-follow reads to opened root/file identities. No profile writes.
export const MAX_LISTING_ENTRIES = 512;
export const MAX_WORKSPACE_LISTS = 16;

export class ProjectDetectionError extends Error {
  constructor(code) { super(code); this.name = "ProjectDetectionError"; this.code = code; }
}
const fail = code => { throw new ProjectDetectionError(code); };
const pathValue = path => typeof path === "string" && path.startsWith("/") && path.length > 1 && path.length <= 4096
  && !/[\u0000-\u001f\u007f]/u.test(path) && !path.split("/").includes("..");
const childName = value => typeof value === "string" && value.length > 0 && value.length <= 255
  && value !== "." && value !== ".." && !/[/\\\u0000-\u001f\u007f]/u.test(value) && !value.startsWith("._");
const validIdentity = value => value && typeof value === "object"
  && Object.keys(value).length === 2 && Object.hasOwn(value, "device") && Object.hasOwn(value, "inode")
  && typeof value.device === "string" && /^(?:0|[1-9][0-9]{0,19})$/u.test(value.device)
  && typeof value.inode === "string" && /^[1-9][0-9]{0,19}$/u.test(value.inode);
const sameIdentity = (a, b) => validIdentity(a) && validIdentity(b) && a.device === b.device && a.inode === b.inode;
const kindOf = info => info?.type === "regular" ? "file" : info?.type === "directory" ? "dir" : "other";

export function createProjectDetection({ fs, reader, core, clock = () => Date.now(),
  allowCanonicalRoot = () => true } = {}) {
  for (const name of ["join", "basename", "lstat", "stat", "realpath"]) {
    if (typeof fs?.[name] !== "function") throw new TypeError(`fs.${name}`);
  }
  for (const name of ["detectProject", "detectionRefusal", "packageDetectionRefusal", "inventoryPlan", "inventoryRefusal", "documentFiles", "documentRefusal", "workspaceCandidates", "expandWorkspaceGlobs"]) {
    if (typeof core?.[name] !== "function") throw new TypeError(`core.${name}`);
  }
  if (typeof clock !== "function") throw new TypeError("clock");
  if (typeof allowCanonicalRoot !== "function") throw new TypeError("allowCanonicalRoot");
  // Privileged synchronous admission: a canonical target must be authorized
  // before the reader obtains metadata or opens any project content. Literal
  // true is required; an asynchronous or unknown result cannot grant access.
  const admitCanonicalRoot = canonical => {
    if (allowCanonicalRoot(canonical) !== true) fail("ROOT_DENIED");
  };

  async function detect(root) {
    if (!pathValue(root)) fail("INVALID_ROOT");
    if (["rootMetadata", "fileMetadata", "readContained", "presenceMetadata", "listContained"].some(name => typeof reader?.[name] !== "function")) fail("READ_CONTAINMENT_UNAVAILABLE");
    const rootInfo = await fs.lstat(root);
    if (!rootInfo) fail("ROOT_NOT_FOUND");
    let rootReal;
    try { rootReal = await fs.realpath(root); } catch { fail("ROOT_NOT_FOUND"); }
    if (!pathValue(rootReal)) fail("INVALID_ROOT");
    admitCanonicalRoot(rootReal);
    if ((await fs.stat(rootReal))?.type !== "directory") fail("ROOT_NOT_DIRECTORY");
    let trustedRoot;
    try { trustedRoot = await reader.rootMetadata(rootReal); }
    catch (error) { if (error?.code === "READ_CONTAINMENT_UNAVAILABLE") throw error; fail("ROOT_CHANGED"); }
    if (trustedRoot?.type !== "directory" || !validIdentity(trustedRoot.identity)) fail("READ_CONTAINMENT_UNAVAILABLE");
    const rootIdentity = trustedRoot.identity;
    const prefix = rootReal.endsWith("/") ? rootReal : `${rootReal}/`;
    const relativeToRoot = real => typeof real === "string" && real.startsWith(prefix) ? real.slice(prefix.length) : null;
    const unchanged = async (original, real) => {
      try { return await fs.realpath(original) === real && await fs.realpath(real) === real; }
      catch { return false; }
    };
    const files = {}, refused = [];

    async function readAllowlisted(relative, refusalFor) {
      const full = fs.join(rootReal, relative);
      let info, real, target;
      try { info = await fs.lstat(full); } catch { return { reason: "unreadable" }; }
      if (!info) return {};
      try { real = await fs.realpath(full); } catch { return { reason: "unreadable" }; }
      const resolvedPath = relativeToRoot(real);
      if (resolvedPath === null) return { reason: "symlink_outside_root" };
      try { target = await reader.fileMetadata({ root: rootReal, relative: resolvedPath, expectedRoot: rootIdentity }); }
      catch (error) { if (error?.code === "READ_CONTAINMENT_UNAVAILABLE") throw error; return { reason: "unreadable" }; }
      if (!target) return { reason: "unreadable" };
      const refusal = refusalFor(resolvedPath, target);
      if (refusal) return { reason: refusal };
      if (!validIdentity(target.identity)) fail("READ_CONTAINMENT_UNAVAILABLE");
      let bytes;
      try { bytes = await reader.readContained({ root: rootReal, relative: resolvedPath,
        expectedRoot: rootIdentity, expectedFile: target.identity, maxBytes: core.MAX_FILE_BYTES + 1 }); }
      catch (error) { if (error?.code === "READ_CONTAINMENT_UNAVAILABLE") throw error; return { reason: "unreadable" }; }
      if (!await unchanged(full, real)) return { reason: "unreadable" };
      if (!ArrayBuffer.isView(bytes)) return { reason: "unreadable" };
      if (bytes.byteLength > core.MAX_FILE_BYTES) return { reason: "too_large" };
      try { return { text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) }; }
      catch { return { reason: "invalid_utf8" }; }
    }

    async function readInto(relative, target, refusalFor, reportedPath = relative) {
      const result = await readAllowlisted(relative, refusalFor);
      if (result.text !== undefined) target[reportedPath] = result.text;
      else if (result.reason) refused.push({ path: relative, reason: result.reason });
    }

    for (const relative of core.DETECTION_FILES) {
      await readInto(relative, files, (resolvedPath, target) => core.detectionRefusal({ path: relative,
        resolvedPath, isFile: target.type === "regular", size: target.size }));
    }

    // Every directory listing is also rooted in opened no-follow descriptors.
    // A post-list realpath check cannot undo an outside-root names disclosure.
    async function listWorkspace(parent) {
      if (typeof parent !== "string" || (parent && !core.isPackageDir(parent))) return null;
      try {
        const target = parent ? await reader.presenceMetadata({ root: rootReal, relative: parent, expectedRoot: rootIdentity })
          : await reader.rootMetadata(rootReal);
        if (target?.type !== "directory" || !validIdentity(target.identity)) return null;
        const result = await reader.listContained({ root: rootReal, relative: parent, expectedRoot: rootIdentity,
          expectedDirectory: target.identity, limit: MAX_LISTING_ENTRIES });
        if (!Array.isArray(result?.entries) || !sameIdentity(target.identity, result.identity)) return null;
        return result.entries.slice(0, MAX_LISTING_ENTRIES)
          .filter(entry => entry && (entry.type === "directory" || entry.type === "symlink") && childName(entry.name))
          .map(entry => entry.name);
      } catch (error) { if (error?.code === "READ_CONTAINMENT_UNAVAILABLE") throw error; return null; }
    }

    const packages = {}, packageDirs = [];
    {
      const plan = core.workspaceCandidates(files);
      const listing = {};
      for (const parent of plan.list.slice(0, MAX_WORKSPACE_LISTS)) {
        const names = await listWorkspace(parent);
        if (names !== null) listing[parent] = names;
      }
      packageDirs.push(...core.expandWorkspaceGlobs(plan.patterns, listing).slice(0, core.MAX_WORKSPACE_PACKAGES));
      for (const dir of packageDirs) {
        if (!core.isPackageDir(dir)) continue;
        const packageFiles = {}, packageRefused = [];
        for (const relative of core.PACKAGE_DETECTION_FILES) {
          if (!core.isAllowedPackagePath(dir, relative)) continue;
          const result = await readAllowlisted(`${dir}/${relative}`, (resolvedPath, target) =>
            core.packageDetectionRefusal({ dir, path: relative, resolvedPath,
              isFile: target.type === "regular", size: target.size }));
          if (result.text !== undefined) packageFiles[relative] = result.text;
          else if (result.reason) packageRefused.push({ path: relative, reason: result.reason });
        }
        if (Object.keys(packageFiles).length || packageRefused.length) packages[dir] = { files: packageFiles, refused: packageRefused };
      }
    }

    const inventory = { listing: {}, present: {} };
    const inventoryPlan = core.inventoryPlan({ packageDirs });
    async function inventoryTarget(relative) {
      if (!inventoryPlan.list.includes(relative) && !inventoryPlan.check.includes(relative)) return null;
      try {
        const target = await reader.presenceMetadata({ root: rootReal, relative, expectedRoot: rootIdentity });
        const kind = kindOf(target);
        if (core.inventoryRefusal({ path: relative, resolvedPath: relative, kind, plan: inventoryPlan })) return null;
        if (!validIdentity(target.identity)) fail("READ_CONTAINMENT_UNAVAILABLE");
        return { relative, kind, identity: target.identity };
      } catch (error) { if (error?.code === "READ_CONTAINMENT_UNAVAILABLE") throw error; return null; }
    }
    for (const relative of inventoryPlan.list) {
      const resolved = await inventoryTarget(relative);
      if (resolved?.kind !== "dir") continue;
      try {
        const result = await reader.listContained({ root: rootReal, relative, expectedRoot: rootIdentity,
          expectedDirectory: resolved.identity, limit: MAX_LISTING_ENTRIES });
        if (!Array.isArray(result?.entries) || !sameIdentity(resolved.identity, result.identity)) continue;
        // Names only; child symlinks never authorize following their targets.
        inventory.listing[relative] = result.entries.slice(0, MAX_LISTING_ENTRIES)
          .filter(entry => entry?.type === "directory" && childName(entry.name))
          .map(entry => entry.name);
      } catch (error) { if (error?.code === "READ_CONTAINMENT_UNAVAILABLE") throw error; }
    }
    for (const relative of inventoryPlan.check) {
      const resolved = await inventoryTarget(relative);
      if (resolved) inventory.present[relative] = resolved.kind;
    }

    const docs = {};
    for (const relative of core.documentFiles(inventory)) {
      await readInto(relative, docs, (resolvedPath, target) => core.documentRefusal({ path: relative,
        resolvedPath, isFile: target.type === "regular", size: target.size }));
    }
    admitCanonicalRoot(rootReal);
    if (!await unchanged(root, rootReal)) fail("ROOT_CHANGED");
    let finalRoot;
    try { finalRoot = await reader.rootMetadata(rootReal); }
    catch (error) { if (error?.code === "READ_CONTAINMENT_UNAVAILABLE") throw error; fail("ROOT_CHANGED"); }
    if (!sameIdentity(rootIdentity, finalRoot?.identity)) fail("ROOT_CHANGED");
    const detectedAt = clock();
    if (!Number.isSafeInteger(detectedAt) || detectedAt < 0) fail("INVALID_TIME");
    const draft = core.detectProject({ rootName: fs.basename(root), files, refused, packages, inventory, docs });
    return Object.freeze({ root, canonicalRoot: rootReal, detectedAt, draft,
      manifestText: files[core.MANIFEST_PATH] ?? null });
  }
  return Object.freeze({ detect });
}
