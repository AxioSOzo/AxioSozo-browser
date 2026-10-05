/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { createProjectReader } from "./ProjectReader.sys.mjs";

export const PROJECT_READER_SHA256 = "518683c0d572cfa2ad3b3f2c7c5ecacd73e266023fac1648a98e323059fbf0a8";
export const PROJECT_READER_PYTHON = "/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11";
const VOLUME = "/Volumes/AxioSozoBuild";
const RESERVED = new Set(["zen", "toolchains", "cargo-home", "cargo-target", "caches", "runtime", "tmp",
  "cef", "providers", "logs", "release", "diag", "diagnostics", "gui-fixtures"]);
const unavailable = () => Object.assign(new Error("READ_CONTAINMENT_UNAVAILABLE"), { code: "READ_CONTAINMENT_UNAVAILABLE" });

export function projectReaderPaths(root) {
  const suffix = typeof root === "string" && root.startsWith(`${VOLUME}/`) ? root.slice(VOLUME.length + 1) : null;
  if (root !== VOLUME && !(suffix !== null && /^[a-z0-9][a-z0-9-]{0,39}$/u.test(suffix) && !RESERVED.has(suffix))) throw unavailable();
  return Object.freeze({ interpreter: PROJECT_READER_PYTHON,
    helperPath: `${root}/contexts/project-reader-${PROJECT_READER_SHA256}.py` });
}

function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  return { Subprocess, timers, env: name => Services.env.get(name),
    verifyFile(path, { executable = false, privateParent = false } = {}) {
      const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
      file.initWithPath(path);
      if (!file.exists() || file.isSymlink() || !file.isFile()) return false;
      file.normalize();
      if (file.path !== path || !file.isReadable() || executable && !file.isExecutable()) return false;
      if ((file.permissions & 0o022) !== 0 || !executable && file.fileSize > 128 * 1024) return false;
      if (privateParent && (!file.parent.isDirectory() || file.parent.isSymlink() || (file.parent.permissions & 0o077) !== 0)) return false;
      return true;
    },
    sha256: path => IOUtils.computeHexDigest(path, "sha256"),
  };
}

// Privileged development privacy seam: both exact flags are required. The
// reader receives canonical relative targets from ProjectDetection, so aliases
// into .git/config are refused before the fixed helper obtains metadata/content.
// Production and ordinary synthetic runs keep the product allowlist unchanged.
function withoutRemoteConfig(reader) {
  const denied = request => request !== null && typeof request === "object"
    && Object.getOwnPropertyDescriptor(request, "relative")?.value === ".git/config";
  const refused = () => Object.assign(new Error("READ_CONTAINMENT_REFUSED"), { code: "READ_CONTAINMENT_REFUSED" });
  return Object.freeze({
    exactAvailable: reader.exactAvailable,
    rootMetadata: root => reader.rootMetadata(root),
    async fileMetadata(request) { return denied(request) ? null : reader.fileMetadata(request); },
    async presenceMetadata(request) { return denied(request) ? null : reader.presenceMetadata(request); },
    async readContained(request) { if (denied(request)) throw refused(); return reader.readContained(request); },
    async listContained(request) { if (denied(request)) throw refused(); return reader.listContained(request); },
  });
}

// Called only by an admitted static-detection request. No PATH search, profile
// inspection, provider/Keychain call, or page-controlled configuration is used.
export async function createNativeProjectReader({ runtime } = {}) {
  let timer = null, stopped = false;
  try {
    runtime ??= nativeRuntime();
    if (typeof runtime.env !== "function" || typeof runtime.verifyFile !== "function" || typeof runtime.sha256 !== "function"
      || typeof runtime.timers?.setTimeout !== "function" || typeof runtime.timers?.clearTimeout !== "function") throw unavailable();
    const root = runtime.env("AXIOSOZO_STATIC_READER_ROOT") || runtime.env("AXIOSOZO_BUILD_ROOT");
    const paths = projectReaderPaths(root);
    const deadline = new Promise((_, reject) => {
      timer = runtime.timers.setTimeout(() => { stopped = true; reject(unavailable()); }, 3000);
    });
    const verify = (async () => {
      if (await runtime.verifyFile(paths.interpreter, { executable: true }) !== true
        || await runtime.verifyFile(paths.helperPath, { privateParent: true }) !== true
        || await runtime.sha256(paths.helperPath) !== PROJECT_READER_SHA256
        || await runtime.verifyFile(paths.helperPath, { privateParent: true }) !== true || stopped) throw unavailable();
      const reader = createProjectReader({ configuredTrusted: true, ...paths,
        Subprocess: runtime.Subprocess, timers: runtime.timers });
      if (!reader.exactAvailable) throw unavailable();
      return runtime.env("AXIOSOZO_SYNTHETIC_TEST") === "1"
        && runtime.env("AXIOSOZO_METADATA_NO_REMOTE_CONFIG") === "1"
        ? withoutRemoteConfig(reader) : reader;
    })();
    return await Promise.race([verify, deadline]);
  } catch { throw unavailable(); }
  finally { stopped = true; if (timer !== null) runtime?.timers?.clearTimeout(timer); }
}
