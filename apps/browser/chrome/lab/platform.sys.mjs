/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The Lab's AI and agent platform, once per browser process: client
// discovery, the one-shot answer backend (ctx.ai) and the agents service
// (ctx.agents), shared by every window. Created on first use (an experiment
// asks, or the Lab page checks the clients); nothing starts a client before.
//
// createLabPlatform() is DOM- and Gecko-free (tests pass fakes);
// labPlatform({ services }) builds the real one with Gecko's Subprocess,
// IOUtils, the external protocol service and the clipboard, keeps its
// temporary files in <profile>/axiosozo-lab, and stops every agent run at
// profile-before-change (nothing is asked; runs are marked stopped).
import { createCliAiBackend, setLabAiBackend } from "./ai.sys.mjs";
import { createAgentsService } from "./agents.sys.mjs";
import { createClientDiscovery } from "./clients.sys.mjs";
import { basename, createScratch, isAbsolutePath, labEnvironment, runOnce, trimSlashes } from "./process.sys.mjs";

export const SCRATCH_FOLDER = "axiosozo-lab";

/** Known projects from AxioSozoServices: { list(), find(root) } with { id, root, name }. */
export function projectsFrom(services) {
  const name = project => {
    const text = typeof project?.manifest?.name === "string" ? project.manifest.name.replace(/[\u0000-\u001f\u007f-\u009f]+/gu, " ").trim() : "";
    return text ? [...text].slice(0, 80).join("") : basename(project.root);
  };
  const list = async () => {
    if (typeof services?.listProjects !== "function") return [];
    const projects = await services.listProjects();
    return (Array.isArray(projects) ? projects : []).filter(project => typeof project?.id === "string" && isAbsolutePath(project?.root))
      .map(project => Object.freeze({ id: project.id, root: trimSlashes(project.root), name: name(project) }));
  };
  return Object.freeze({
    list,
    async find(root) {
      const wanted = typeof root === "string" ? trimSlashes(root) : null;
      return wanted ? (await list()).find(project => project.root === wanted) ?? null : null;
    },
  });
}

/** The agent status channel (hook reports) from AxioSozoServices, for external sessions; null when absent. */
export function activityFrom(services, projects) {
  if (typeof services?.on !== "function" || typeof services?.listAgentActivity !== "function") return null;
  return Object.freeze({
    on(callback) {
      const offs = ["agents", "attention"].map(name => services.on(name, () => callback()));
      return () => { for (const off of offs) { try { off(); } catch {} } };
    },
    async list() {
      const groups = [];
      for (const project of await projects.list()) {
        let list = [];
        try { list = services.listAgentActivity(project.id) ?? []; } catch { list = []; }
        for (const group of Array.isArray(list) ? list : []) groups.push({ ...group, project_name: project.name });
      }
      return groups;
    },
  });
}

/**
 * Wires one platform from its parts:
 *   { runtime, environment, scratchRoot, projects, activity, handover, onShutdown }
 * Returns { discovery, backend, agents, statuses(options), cleanLeftovers(), close() }.
 */
export function createLabPlatform({ runtime, environment, scratchRoot, projects, activity = null, handover = null, onShutdown = null }) {
  const scratch = createScratch({ fs: runtime.fs, root: scratchRoot });
  let probeDir = null;
  const discovery = createClientDiscovery({ runtime, environment,
    probeDir: async () => (probeDir ??= (await scratch.runDir("probe")).cwd) });
  const backend = createCliAiBackend({ runtime, discovery, scratch, environment, projects });
  const agents = createAgentsService({ runtime, discovery, scratch, environment, projects, handover, activity });
  let closed = false;
  const platform = Object.freeze({
    discovery, backend, agents, scratch,
    statuses: options => discovery.statuses(options),
    /** Removes what a crashed session left (run folders, hand-over scripts). */
    cleanLeftovers: () => scratch.cleanLeftovers().then(() => { probeDir = null; }),
    async close() {
      if (closed) return;
      closed = true;
      await agents.close().catch(() => {});
      await scratch.cleanLeftovers().catch(() => {});
    },
  });
  try { onShutdown?.(() => platform.close()); } catch (error) { console.error("AxioSozo Lab: agents will not stop at quit", error); }
  return platform;
}

// ---- the real one (chrome only) ------------------------------------------------------------------

let current = null;

/** The process platform, built on first use; its AI backend becomes the Lab's (setLabAiBackend). */
export function labPlatform({ services = null } = {}) {
  if (current) return current;
  const native = nativeParts(services);
  current = createLabPlatform(native);
  setLabAiBackend(current.backend);
  return current;
}

/** For tests: the platform labPlatform() returns (null restores the real one on next use). */
export function setLabPlatformForTesting(platform) {
  const previous = current;
  current = platform;
  return () => { current = previous; };
}

function nativeParts(services) {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const { setTimeout, clearTimeout } = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  const directory = key => { try { return Services.dirsvc.get(key, Ci.nsIFile).path; } catch { return null; } };
  const env = name => { try { return Services.env.exists(name) ? Services.env.get(name) : null; } catch { return null; } };
  const localFile = path => { const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile); file.initWithPath(path); return file; };
  const fs = Object.freeze({
    async isExecutableFile(path) {
      try { const file = localFile(path); return file.exists() && file.isFile() && file.isExecutable(); } catch { return false; }
    },
    // nsIFile.normalize() resolves every symlink (realpath on macOS).
    async realpath(path) { const file = localFile(path); file.normalize(); return file.path; },
    async stat(path) { const info = await IOUtils.stat(path); return { mtime: info.lastModified ?? null, size: info.size ?? null, type: info.type }; },
    async readHead(path, bytes) { return IOUtils.read(path, { maxBytes: bytes }); },
    async makeDirectory(path, mode) {
      await IOUtils.makeDirectory(path, { ignoreExisting: true, createAncestors: false, permissions: mode });
      await IOUtils.setPermissions(path, mode, false);
    },
    async writeFile(path, bytes, mode) {
      await IOUtils.write(path, bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), { mode: "create" });
      await IOUtils.setPermissions(path, mode, false);
    },
    async remove(path) { await IOUtils.remove(path, { recursive: true, ignoreAbsent: true }); },
  });
  const runtime = Object.freeze({
    spawn: options => Subprocess.call(options),
    timers: Object.freeze({ setTimeout, clearTimeout }),
    clock: () => Date.now(),
    fs,
  });
  const environment = labEnvironment({ get: env, home: directory("Home") });
  const profile = directory("ProfD") ?? PathUtils.profileDir;
  const projects = projectsFrom(services);
  const protocol = () => Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService(Ci.nsIExternalProtocolService);
  const handover = Object.freeze({
    hasScheme: scheme => { try { return protocol().externalProtocolHandlerExists(scheme); } catch { return false; } },
    async openUrl(url) {
      protocol().loadURI(Services.io.newURI(url), Services.scriptSecurityManager.getSystemPrincipal());
    },
    async writeScript(path, text) {
      await IOUtils.writeUTF8(path, text, { mode: "create" });
      await IOUtils.setPermissions(path, 0o700, false);
    },
    async openTerminal(path) {
      const out = await runOnce(runtime, { command: "/usr/bin/open", args: ["-a", "Terminal", path], environment: { PATH: "/usr/bin:/bin", LANG: "C" },
        timeoutMs: 10000 });
      if (out.exitCode !== 0) throw new Error("TERMINAL_UNAVAILABLE");
    },
    // As RegionCapture: the native image flavour, so macOS hands out a real PNG.
    async copyImage(bytes, type, text) {
      const tools = Cc["@mozilla.org/image/tools;1"].getService(Ci.imgITools);
      const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      const image = tools.decodeImageFromArrayBuffer(buffer, type);
      const transferable = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
      transferable.init(null);
      transferable.addDataFlavor("application/x-moz-nativeimage");
      transferable.setTransferData("application/x-moz-nativeimage", image);
      if (typeof text === "string" && text) {
        const string = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
        string.data = text;
        transferable.addDataFlavor("text/plain");
        transferable.setTransferData("text/plain", string);
      }
      Services.clipboard.setData(transferable, null, Services.clipboard.kGlobalClipboard);
    },
  });
  const onShutdown = close => {
    const { AsyncShutdown } = ChromeUtils.importESModule("resource://gre/modules/AsyncShutdown.sys.mjs");
    AsyncShutdown.profileBeforeChange.addBlocker("AxioSozo Lab: stop agent runs", () => close());
  };
  return { runtime, environment, scratchRoot: `${profile}/${SCRATCH_FOLDER}`, projects, activity: activityFrom(services, projects), handover, onShutdown };
}
