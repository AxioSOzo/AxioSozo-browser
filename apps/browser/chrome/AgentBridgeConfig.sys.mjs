/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// DOM-free bridge configuration. Never installs, connects or executes a client.
import { bridgeConfig } from './contexts/agent-config.mjs';
import { agentSocketPaths, parseAgentStatOutput } from './AgentChannelConfig.sys.mjs';
import { readAgentPipe } from './AgentPipeBytes.sys.mjs';
import { AGENT_BRIDGE_BUNDLE_SHA256, AGENT_BRIDGE_FILES } from './AgentBridgePins.sys.mjs';
export { AGENT_BRIDGE_BUNDLE_SHA256, AGENT_BRIDGE_FILES } from './AgentBridgePins.sys.mjs';
export const AGENT_BRIDGE_CONFIG_LIMITS = Object.freeze({ deadlineMs: 3000, metadataMs: 1000,
  cleanupMs: 500, configBytes: 65536, directoryEntries: 8 });
const encoder = new TextEncoder();
const NATIVE_END_OF_FILE = 0xff7a0001;
const unavailable = () => Object.assign(new Error('AGENT_BRIDGE_CONFIG_UNAVAILABLE'), { code: 'AGENT_BRIDGE_CONFIG_UNAVAILABLE' });
const invalid = () => Object.assign(new Error('INVALID_INPUT'), { code: 'INVALID_INPUT' });
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const metadata = value => plain(value) && ['regular', 'directory'].includes(value.kind)
  && Number.isSafeInteger(value.uid) && value.uid >= 0 && value.uid <= 4294967295
  && Number.isSafeInteger(value.nlink) && value.nlink >= 1
  && Number.isSafeInteger(value.mode) && value.mode >= 0 && value.mode <= 0o7777
  && Number.isSafeInteger(value.size) && value.size >= 0
  && typeof value.device === 'string' && /^[0-9]{1,20}$/u.test(value.device)
  && typeof value.inode === 'string' && /^[0-9]{1,20}$/u.test(value.inode);
const same = (a, b) => metadata(a) && metadata(b)
  && ['kind','uid','nlink','mode','size','device','inode'].every(key => a[key] === b[key]);
export function agentBridgePaths(root) {
  agentSocketPaths(root); // Same closed build-root policy; no actor path.
  const parent = `${root}/agent-bridge`, directory = `${parent}/bridge-${AGENT_BRIDGE_BUNDLE_SHA256}`;
  return Object.freeze({ root, parent, directory, nodePath: `${directory}/node`,
    bridgePath: `${directory}/bin/axiosozo-agent-bridge.mjs` });
}
function requestData(value) {
  if (!plain(value)) throw invalid();
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(descriptors).length !== 2 || !['agent','socketPath'].every(key =>
    Object.hasOwn(descriptors[key] ?? {}, 'value'))) throw invalid();
  const data = { agent: descriptors.agent.value, socketPath: descriptors.socketPath.value };
  // Pure validation comes before native imports, filesystem work or timers.
  bridgeConfig({ ...data, nodePath: '/fixed/node', bridgePath: '/fixed/bridge.mjs' });
  return data;
}
export async function buildNativeAgentBridgeConfig(request, runtime) {
  const data = requestData(request);
  let timer = null, expired = false;
  try {
    runtime ??= nativeRuntime();
    if (['env','verifyFile','ownUid','exactMetadata','sha256','listDirectory'].some(key => typeof runtime[key] !== 'function')
      || typeof runtime.timers?.setTimeout !== 'function' || typeof runtime.timers?.clearTimeout !== 'function') throw unavailable();
    const paths = agentBridgePaths(runtime.env('AXIOSOZO_STATIC_READER_ROOT') || runtime.env('AXIOSOZO_BUILD_ROOT'));
    const live = () => { if (expired) throw unavailable(); };
    const timeout = new Promise((_, reject) => { timer = runtime.timers.setTimeout(() => { expired = true; reject(unavailable()); }, AGENT_BRIDGE_CONFIG_LIMITS.deadlineMs); });
    const verify = async () => {
      const uid = await runtime.ownUid(); live();
      if (!Number.isSafeInteger(uid) || uid < 0 || uid > 4294967295) throw unavailable();
      const inspect = async (path, options, admit) => {
        live(); if (await runtime.verifyFile(path, options) !== true) throw unavailable(); live();
        const result = await runtime.exactMetadata(path); live();
        if (!metadata(result) || !admit(result)) throw unavailable();
        return Object.freeze({ ...result });
      };
      const directories = [paths.root, paths.parent, paths.directory, `${paths.directory}/bin`, `${paths.directory}/src`];
      const prior = new Map();
      for (const path of directories) prior.set(path, await inspect(path, { directory: true }, value =>
        value.kind === 'directory' && value.uid === uid && (path === paths.root ? !(value.mode & 0o022) : value.mode === 0o700)));
      const checkInventory = async () => {
        for (const [path, names] of [[paths.directory,['package.json','node','bin','src']],
          [`${paths.directory}/bin`,['axiosozo-agent-bridge.mjs']], [`${paths.directory}/src`,['server.mjs','channel.mjs','jsonl.mjs','tools.mjs']]]) {
          live(); const actual = await runtime.listDirectory(path); live();
          if (!Array.isArray(actual) || actual.length > AGENT_BRIDGE_CONFIG_LIMITS.directoryEntries
            || actual.some(name => typeof name !== 'string') || [...actual].sort().join('\n') !== [...names].sort().join('\n')) throw unavailable();
        }
      };
      await checkInventory(); live();
      for (const pin of AGENT_BRIDGE_FILES) {
        const path = `${paths.directory}/${pin.relative}`;
        prior.set(path, await inspect(path, { executable: pin.relative === 'node' }, value => value.kind === 'regular'
          && value.uid === uid && value.nlink === 1 && value.mode === pin.mode && value.size > 0 && value.size <= pin.maxBytes));
      }
      for (const pin of AGENT_BRIDGE_FILES) {
        live(); if (await runtime.sha256(`${paths.directory}/${pin.relative}`) !== pin.sha256) throw unavailable(); live();
      }
      await checkInventory(); live();
      for (const [path, previous] of prior) {
        const next = await inspect(path, { directory: previous.kind === 'directory', executable: path === paths.nodePath }, () => true);
        if (!same(previous, next)) throw unavailable();
      }
      live(); const text = bridgeConfig({ ...data, nodePath: paths.nodePath, bridgePath: paths.bridgePath });
      if (encoder.encode(text).length > AGENT_BRIDGE_CONFIG_LIMITS.configBytes) throw unavailable();
      return text;
    };
    return await Promise.race([verify(), timeout]);
  } catch { throw unavailable(); }
  finally { expired = true; if (timer !== null) runtime?.timers?.clearTimeout(timer); }
}
async function cleanup(runtime, child, shouldKill = () => true) {
  if (!child) return;
  let timer;
  const jobs = [child.stdin,child.stdout,child.stderr].filter(pipe => typeof pipe?.close === 'function')
    .map(pipe => Promise.resolve().then(() => pipe.close(true)));
  if (typeof child.kill === 'function') jobs.push(Promise.resolve().then(() => { if (shouldKill()) return child.kill(0); }));
  if (typeof child.wait === 'function') jobs.push(Promise.resolve().then(() => child.wait()));
  try { await Promise.race([Promise.allSettled(jobs),new Promise(resolve => { timer = runtime.timers.setTimeout(resolve, AGENT_BRIDGE_CONFIG_LIMITS.cleanupMs); })]); }
  finally { runtime.timers.clearTimeout(timer); }
}
// Native code is invoked only on a trusted explicit config request. It executes
// fixed OS id/stat metadata tools, never Node, bridge, provider or a shell.
function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule('resource://gre/modules/Subprocess.sys.mjs');
  const timers = ChromeUtils.importESModule('resource://gre/modules/Timer.sys.mjs');
  const runtime = { timers };
  const verifyFile = (path, { executable = false, directory = false } = {}) => {
    if (typeof path !== 'string' || !path.startsWith('/') || path.endsWith('/') || path.includes('//')
      || path.split('/').some(part => part === '.' || part === '..')) return false;
    let prefix = '';
    for (const part of path.split('/').slice(1)) {
      prefix += '/' + part; const file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile); file.initWithPath(prefix);
      if (!file.exists() || file.isSymlink() || prefix !== path && !file.isDirectory()) return false;
    }
    const file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile); file.initWithPath(path);
    if (!(directory ? file.isDirectory() : file.isFile()) || !file.isReadable() || executable && !file.isExecutable()) return false;
    file.normalize(); return file.path === path && !(file.permissions & 0o022);
  };
  const call = async (command, args) => {
    if (!['/usr/bin/id','/usr/bin/stat'].includes(command) || !verifyFile(command, { executable: true })) throw unavailable();
    let child = null, timer = null, expired = false, exited = false;
    const live = () => { if (expired) throw unavailable(); };
    const stop = new Promise((_, reject) => { timer = timers.setTimeout(() => { expired = true; reject(unavailable()); }, AGENT_BRIDGE_CONFIG_LIMITS.metadataMs); });
    const execute = async () => {
      live(); const owned = await Subprocess.call({ command, arguments: args, environmentAppend: false,
        environment: { LANG: 'C', LC_ALL: 'C' }, stderr: 'pipe', workdir: '/' });
      if (expired) { await cleanup(runtime, owned); throw unavailable(); }
      child = owned;
      if (typeof child?.stdin?.close !== 'function' || typeof child?.stdout?.read !== 'function' || typeof child?.stderr?.read !== 'function'
        || typeof child?.kill !== 'function' || typeof child?.wait !== 'function') throw unavailable();
      const closeInput = Promise.resolve().then(() => child.stdin.close()).catch(error => { if (error?.errorCode !== NATIVE_END_OF_FILE) throw error; });
      // Owned wait settlement proves exit independently of pipe/close success.
      const [output,,status] = await Promise.all([readAgentPipe(child.stdout,{limit:512,keep:true,assertLive:live}),
        readAgentPipe(child.stderr,{limit:512,keep:false,assertLive:live}),
        Promise.resolve(child.wait()).then(status => { exited = true; return status; }),closeInput]);
      live(); if (status?.exitCode !== 0) throw unavailable(); return output;
    };
    try { return await Promise.race([execute(),stop]); }
    finally { expired = true; timers.clearTimeout(timer); await cleanup(runtime,child,() => !exited); }
  };
  return { timers, verifyFile, env: name => Services.env.get(name),
    async ownUid() { const text = await call('/usr/bin/id',['-u']); if (!/^(0|[1-9][0-9]{0,9})\n?$/u.test(text)) throw unavailable(); return Number(text.trim()); },
    async exactMetadata(path) { return parseAgentStatOutput(await call('/usr/bin/stat',['-f','%u:%l:%p:%z:%d:%i','--',path])); },
    sha256: path => IOUtils.computeHexDigest(path,'sha256'),
    async listDirectory(path) { const list = await IOUtils.getChildren(path); return list.map(child => {
      if (typeof child !== 'string' || !child.startsWith(path + '/') || child.slice(path.length + 1).includes('/')) throw unavailable();
      return child.slice(path.length + 1);
    }); },
  };
}
