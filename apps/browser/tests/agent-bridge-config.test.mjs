// Injected metadata/hash/inventory/timers only. Never imports or executes bridge code.
import test from 'node:test';
import assert from 'node:assert/strict';
import './support/chrome-modules.mjs';
const { buildNativeAgentBridgeConfig, agentBridgePaths, AGENT_BRIDGE_FILES, AGENT_BRIDGE_CONFIG_LIMITS } = await import('../chrome/AgentBridgeConfig.sys.mjs');
import { bridgeConfig } from '../../../packages/contexts/src/agent-config.mjs';
const ROOT='/Volumes/AxioSozoBuild/workstation', SOCKET='/invented/profile/.a/s';
const paths=agentBridgePaths(ROOT);
const flush=async()=>{for(let i=0;i<256;i++)await Promise.resolve();};
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const unavailable=e=>e?.code==='AGENT_BRIDGE_CONFIG_UNAVAILABLE'&&e.message===e.code;
function fixture(){
  let id=0;const timers=new Map(),events=[],records=new Map(),hashes=new Map();
  const dirs=[ROOT,paths.parent,paths.directory,paths.directory+'/bin',paths.directory+'/src'];
  dirs.forEach((path,index)=>records.set(path,{kind:'directory',uid:501,nlink:2,mode:index===0?0o755:0o700,size:64,device:'8',inode:String(index+1)}));
  AGENT_BRIDGE_FILES.forEach((pin,index)=>{const path=paths.directory+'/'+pin.relative;
    records.set(path,{kind:'regular',uid:501,nlink:1,mode:pin.mode,size:100,device:'8',inode:String(20+index)});hashes.set(path,pin.sha256);});
  const inventories=new Map([[paths.directory,['package.json','node','bin','src']],
    [paths.directory+'/bin',['axiosozo-agent-bridge.mjs']],[paths.directory+'/src',['server.mjs','channel.mjs','jsonl.mjs','tools.mjs']]]);
  const runtime={env:name=>name==='AXIOSOZO_STATIC_READER_ROOT'?ROOT:'',
    async ownUid(){events.push(['uid']);return 501;},
    async verifyFile(path,opts){events.push(['verify',path,opts]);return true;},
    async exactMetadata(path){events.push(['stat',path]);return{...records.get(path)};},
    async sha256(path){events.push(['hash',path]);return hashes.get(path);},
    async listDirectory(path){events.push(['list',path]);return [...inventories.get(path)];},
    timers:{setTimeout(fn,ms){timers.set(++id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);}},
    Subprocess:{call(){assert.fail('NO_NATIVE_PROCESS_IN_FAKE_TEST');}}};
  return{runtime,records,hashes,inventories,events,timers,run:(agent='codex',socketPath=SOCKET)=>buildNativeAgentBridgeConfig({agent,socketPath},runtime),
    expire(){const row=[...timers].find(([,v])=>v.ms===AGENT_BRIDGE_CONFIG_LIMITS.deadlineMs);assert(row);timers.delete(row[0]);row[1].fn();}};
}

test('configuration is literal core JSON/TOML bound to the checksum bundle and current socket',async()=>{
  for(const agent of ['claude-code','codex']){
    const f=fixture();const output=await f.run(agent);
    assert.equal(output,bridgeConfig({agent,nodePath:paths.nodePath,bridgePath:paths.bridgePath,socketPath:SOCKET}));
    assert.equal(f.events.filter(e=>e[0]==='hash').length,7);assert.equal(f.timers.size,0);
    if(agent==='claude-code'){
      const config=JSON.parse(output).mcpServers.axiosozo;
      assert.equal(config.command,paths.nodePath);
      assert.deepEqual(config.args,[paths.bridgePath,'--agent',agent,'--socket',SOCKET]);
      assert.deepEqual(config.env,{AXIOSOZO_AGENT_SOCKET:SOCKET});
    }else assert(output.includes('tool_timeout_sec = 90\n'));
  }
});
test('request data rejects unsafe agents/paths and actor extras before runtime work',async()=>{
  const getter={};Object.defineProperty(getter,'agent',{get(){assert.fail('accessor evaluated');}});getter.socketPath=SOCKET;
  const cases=[null,[],{},getter,{agent:'codex',socketPath:SOCKET,root:ROOT},
    {agent:'codex',socketPath:SOCKET,[Symbol('extra')]:true},
    ...['other','Codex',{},new String('codex')].map(agent=>({agent,socketPath:SOCKET})),
    ...['relative','/','/bad/','/bad//s','/bad/../s','/bad/./s','/bad/${project}','/bad/\n','/bad/\u0000','/bad/\ud800',
      '/'+ '🎨'.repeat(25)].map(socketPath=>({agent:'codex',socketPath}))];
  for(const input of cases){const f=fixture();await assert.rejects(buildNativeAgentBridgeConfig(input,f.runtime),{code:'INVALID_INPUT'});assert.equal(f.events.length,0);assert.equal(f.timers.size,0);}
});
test('maximum socket UTF-8 length and shell punctuation remain literal argument data',async()=>{
  for(const socket of ['/'+ 'x'.repeat(99),'/safe/a \" $() `x` = & ; s', '/safe/🎨']){
    const f=fixture();const text=await f.run('claude-code',socket);
    assert.equal(JSON.parse(text).mcpServers.axiosozo.args.at(-1),socket);assert.equal(f.timers.size,0);
  }
});
test('only validated static namespace root is used, with reviewed build-root fallback',async()=>{
  for(const root of ['', '/Volumes/AxioSozoBuild/zen','/Volumes/AxioSozoBuild/unknown/nested','/elsewhere/root']){
    const f=fixture();f.runtime.env=()=>root;await assert.rejects(f.run(),unavailable);assert.equal(f.events.length,0);assert.equal(f.timers.size,0);
  }
  assert.equal(agentBridgePaths('/Volumes/AxioSozoBuild').root,'/Volumes/AxioSozoBuild');
  const f=fixture();f.runtime.env=name=>name==='AXIOSOZO_BUILD_ROOT'?ROOT:'';await f.run();assert.equal(f.timers.size,0);
});
test('missing verification capabilities and nonliteral success refuse',async()=>{
  for(const key of ['verifyFile','ownUid','exactMetadata','sha256','listDirectory','timers']){
    const f=fixture();delete f.runtime[key];await assert.rejects(f.run(),unavailable);assert.equal(f.events.length,0);
  }
  for(const value of [false,null,{},1,'true']){const f=fixture();f.runtime.verifyFile=async()=>value;await assert.rejects(f.run(),unavailable);assert.equal(f.events.some(e=>e[0]==='hash'),false);}
});
test('UID must be numeric bounded process owner and equal every installation entry',async()=>{
  for(const uid of ['501',-1,NaN,4294967296]){const f=fixture();f.runtime.ownUid=async()=>uid;await assert.rejects(f.run(),unavailable);assert.equal(f.events.length,0);}
  for(const path of [ROOT,paths.parent,paths.directory,...AGENT_BRIDGE_FILES.map(pin=>paths.directory+'/'+pin.relative)]){
    const f=fixture();f.records.get(path).uid=502;await assert.rejects(f.run(),unavailable);assert.equal(f.events.some(e=>e[0]==='hash'),false);
  }
});
test('private directories require exact 0700 and the root refuses group/other write',async()=>{
  for(const path of [paths.parent,paths.directory,paths.directory+'/bin',paths.directory+'/src'])
    for(const mode of [0o755,0o777,0o600,0o1700]){const f=fixture();f.records.get(path).mode=mode;await assert.rejects(f.run(),unavailable);}
  for(const mode of [0o775,0o757,0o777]){const f=fixture();f.records.get(ROOT).mode=mode;await assert.rejects(f.run(),unavailable);}
});
test('all six bridge files and copied Node require regular one-link exact mode and bounded positive size',async()=>{
  for(const pin of AGENT_BRIDGE_FILES){const path=paths.directory+'/'+pin.relative;
    for(const change of [{kind:'symlink'},{kind:'directory'},{nlink:2},{nlink:0},{mode:0o600},{mode:0o755},{size:0},{size:pin.maxBytes+1}]){
      const f=fixture();Object.assign(f.records.get(path),change);await assert.rejects(f.run(),unavailable);assert.equal(f.events.some(e=>e[0]==='hash'),false);
    }
  }
});
test('malformed metadata never reaches hashing or configuration',async()=>{
  for(const change of [{inode:'1x'},{device:''},{size:1.5},{mode:-1},{uid:Infinity},{nlink:undefined},{kind:'socket'}]){
    const f=fixture();Object.assign(f.records.get(paths.directory+'/node'),change);await assert.rejects(f.run(),unavailable);assert.equal(f.events.some(e=>e[0]==='hash'),false);
  }
});
test('inventory must be exactly seven pinned files in the specified tree',async()=>{
  for(const [path,mutation] of [[paths.directory,a=>[...a,'unknown']], [paths.directory,a=>a.filter(n=>n!=='node')],
    [paths.directory+'/src',a=>[...a,a[0]]], [paths.directory+'/bin',()=>[]], [paths.directory,()=>Array(9).fill('node')],
    [paths.directory,a=>[...a,{}]], [paths.directory,()=>null]]){
    const f=fixture();f.inventories.set(path,mutation(f.inventories.get(path)));await assert.rejects(f.run(),unavailable);assert.equal(f.events.some(e=>e[0]==='hash'),false);
  }
});
test('every installed input including package.json and Node must match its fixed digest',async()=>{
  for(const pin of AGENT_BRIDGE_FILES){const f=fixture();f.hashes.set(paths.directory+'/'+pin.relative,'0'.repeat(64));await assert.rejects(f.run(),unavailable);assert.equal(f.timers.size,0);}
});
test('hashing cannot publish after named inode/size/owner/mode replacement or inventory additions',async()=>{
  for(const change of [{inode:'999'},{size:101},{uid:502},{mode:0o600},{nlink:2},{kind:'directory'}]){
    const f=fixture();const original=f.runtime.sha256;f.runtime.sha256=async path=>{const result=await original(path);Object.assign(f.records.get(paths.bridgePath),change);return result;};await assert.rejects(f.run(),unavailable);
  }
  const f=fixture();const original=f.runtime.sha256;f.runtime.sha256=async path=>{const result=await original(path);f.inventories.get(paths.directory).push('extra');return result;};await assert.rejects(f.run(),unavailable);
});
test('late directory replacement after successful digest reads is rejected',async()=>{
  const f=fixture();let scans=0;const original=f.runtime.listDirectory;f.runtime.listDirectory=async path=>{const names=await original(path);if(++scans===4)f.records.get(paths.directory).inode='777';return names;};await assert.rejects(f.run(),unavailable);
});
test('deadline while own UID is pending prevents all later metadata and drops a late success',async()=>{
  const f=fixture(),late=deferred();f.runtime.ownUid=()=>late.promise;const pending=f.run();const refused=assert.rejects(pending,unavailable);
  await flush();f.expire();await refused;late.resolve(501);await flush();assert.equal(f.events.length,0);assert.equal(f.timers.size,0);
});
test('deadline while metadata is pending prevents hashing and further filesystem calls',async()=>{
  const f=fixture(),late=deferred();let calls=0;f.runtime.exactMetadata=path=>{calls++;return late.promise;};const pending=f.run();const refused=assert.rejects(pending,unavailable);
  await flush();f.expire();await refused;const before=f.events.length;late.resolve({...f.records.get(ROOT)});await flush();assert.equal(calls,1);assert.equal(f.events.length,before);assert.equal(f.events.some(e=>e[0]==='hash'),false);
});
test('deadline while hashing is pending prevents later digests and post-read admission',async()=>{
  const f=fixture(),late=deferred();let calls=0;f.runtime.sha256=()=>{calls++;return late.promise;};const pending=f.run();const refused=assert.rejects(pending,unavailable);
  await flush();f.expire();await refused;const before=f.events.length;late.resolve(AGENT_BRIDGE_FILES[0].sha256);await flush();assert.equal(calls,1);assert.equal(f.events.length,before);assert.equal(f.timers.size,0);
});
test('private native/filesystem exceptions cannot leak paths or diagnostics',async()=>{
  const f=fixture();f.runtime.sha256=async()=>{throw Error('synthetic secret path');};await assert.rejects(f.run(),unavailable);assert.equal(f.timers.size,0);
});
test('manifest pins exactly package.json, all five transitive imports, and fixed Node without executing any',async()=>{
  const {readFile}=await import('node:fs/promises');const {createHash}=await import('node:crypto');
  const manifest=await readFile(new URL('./fixtures/agent-bridge-bundle-manifest.txt',import.meta.url),'utf8');
  const {AGENT_BRIDGE_BUNDLE_SHA256}=await import('../chrome/AgentBridgePins.sys.mjs');
  assert.equal(createHash('sha256').update(manifest).digest('hex'),AGENT_BRIDGE_BUNDLE_SHA256);
  assert.equal(manifest,'axiosozo-agent-bridge-bundle-v1\n'+AGENT_BRIDGE_FILES.map(pin=>`${pin.sha256}  ${pin.relative}\n`).join(''));
  for(const pin of AGENT_BRIDGE_FILES.filter(pin=>pin.relative!=='node')){
    const data=await readFile(new URL('../../../packages/agent-bridge/'+pin.relative,import.meta.url));assert.equal(createHash('sha256').update(data).digest('hex'),pin.sha256);
  }
});
