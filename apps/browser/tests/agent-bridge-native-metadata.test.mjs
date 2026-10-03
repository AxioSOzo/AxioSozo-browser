// Actual native-runtime branch with injected inert Cc/IOUtils/Subprocess only.
// No process is created and no bridge or executable module is imported.
import test from 'node:test';
import assert from 'node:assert/strict';
import './support/chrome-modules.mjs';
const {buildNativeAgentBridgeConfig,agentBridgePaths,AGENT_BRIDGE_FILES}=await import('../chrome/AgentBridgeConfig.sys.mjs');
const ROOT='/Volumes/AxioSozoBuild/workstation',SOCKET='/synthetic/profile/.a/s';
const paths=agentBridgePaths(ROOT),encoder=new TextEncoder();
const deferred=()=>{let resolve;const promise=new Promise(yes=>{resolve=yes;});return{promise,resolve};};
const flush=async()=>{for(let i=0;i<128;i++)await Promise.resolve();};
const unavailable=e=>e?.code==='AGENT_BRIDGE_CONFIG_UNAVAILABLE'&&e.message===e.code;
async function nativeFixture(options,body){
  const names=['ChromeUtils','Cc','Ci','IOUtils','Services'];
  const prior=names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]);
  const rows=new Map(),calls=[],timers=new Map(),children=[],imports=[],hashes=[];let timerId=0;
  for(const path of [ROOT,paths.parent,paths.directory,paths.directory+'/bin',paths.directory+'/src'])
    rows.set(path,{kind:'directory',uid:501,nlink:2,mode:path===ROOT?0o755:0o700,size:100,device:'8',inode:String(rows.size+1)});
  for(const pin of AGENT_BRIDGE_FILES)rows.set(paths.directory+'/'+pin.relative,{kind:'regular',uid:501,nlink:1,mode:pin.mode,size:100,device:'8',inode:String(rows.size+1)});
  const stat=path=>{const value=rows.get(path);assert(value);return `${value.uid}:${value.nlink}:${((value.kind==='directory'?0o40000:0o100000)|value.mode).toString(8)}:${value.size}:${value.device}:${value.inode}\n`;};
  function child(text){
    const events=[];let read=0;
    const pipe=(chunks,label)=>({read(){events.push(label+'-read');return Promise.resolve(chunks.shift()??new ArrayBuffer(0));},close(force){events.push([label+'-close',force]);return Promise.resolve();},readString(){assert.fail('STRING_READER_FORBIDDEN');}});
    const chunks=[encoder.encode(text).buffer,new ArrayBuffer(0)];
    const item={events,
      stdin:{close(force){events.push(['stdin-close',force]);if(options.closeError)throw options.closeError;return Promise.resolve();}},
      stdout:pipe(chunks,'stdout'),stderr:pipe(options.stderr?[encoder.encode(options.stderr).buffer]:[],'stderr'),
      kill(signal){events.push(['kill',signal]);return Promise.resolve();},
      wait(){events.push('wait');return options.wait??Promise.resolve({exitCode:options.exitCode??0});}};
    children.push(item);return item;
  }
  const timerRuntime={setTimeout(fn,ms){const id=++timerId;timers.set(id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);}};
  const Subprocess={async call(spec){
    calls.push(spec);assert(['/usr/bin/id','/usr/bin/stat'].includes(spec.command));
    assert.deepEqual(spec.environment,{LANG:'C',LC_ALL:'C'});assert.equal(spec.environmentAppend,false);assert.equal(spec.workdir,'/');assert.equal(spec.stderr,'pipe');
    if(options.spawn)return options.spawn(spec,child);
    const text=options.stdout??(spec.command==='/usr/bin/id'?'501\n':stat(spec.arguments.at(-1)));
    return child(text);
  }};
  globalThis.ChromeUtils={importESModule(uri){imports.push(uri);if(uri.endsWith('/Subprocess.sys.mjs'))return{Subprocess};if(uri.endsWith('/Timer.sys.mjs'))return timerRuntime;assert.fail('UNEXPECTED_NATIVE_IMPORT');}};
  globalThis.Ci={nsIFile:{}};
  globalThis.Cc={'@mozilla.org/file/local;1':{createInstance(){let path='';return{
    initWithPath(value){path=value;},exists(){return true;},isSymlink(){return options.symlink===path;},
    isDirectory(){return rows.get(path)?.kind==='directory'||!rows.has(path)&&!['/usr/bin/id','/usr/bin/stat'].includes(path);},
    isFile(){return rows.get(path)?.kind==='regular'||['/usr/bin/id','/usr/bin/stat'].includes(path);},
    isReadable(){return true;},isExecutable(){return true;},normalize(){},get path(){return path;},get permissions(){return rows.get(path)?.mode??0o755;}};}}};
  globalThis.Services={env:{get:name=>name==='AXIOSOZO_STATIC_READER_ROOT'?ROOT:''}};
  globalThis.IOUtils={async computeHexDigest(path,algorithm){assert.equal(algorithm,'sha256');hashes.push(path);return AGENT_BRIDGE_FILES.find(pin=>path===paths.directory+'/'+pin.relative)?.sha256;},
    async getChildren(path){const names=path===paths.directory?['package.json','node','bin','src']:path.endsWith('/bin')?['axiosozo-agent-bridge.mjs']:['server.mjs','channel.mjs','jsonl.mjs','tools.mjs'];return names.map(name=>path+'/'+name);}};
  const fixture={calls,children,imports,timers,hashes,run:()=>buildNativeAgentBridgeConfig({agent:'codex',socketPath:SOCKET}),
    expire(ms){const item=[...timers].find(([,row])=>row.ms===ms);assert(item,`missing ${ms} ms timer`);timers.delete(item[0]);item[1].fn();},child};
  try{return await body(fixture);}finally{for(const [name,descriptor]of prior){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}}
}
test('fixed metadata branch accepts only numeric native EOF from stdin close plus actual stdout EOF and zero wait',async()=>{
  await nativeFixture({closeError:{errorCode:0xff7a0001}},async f=>{
    const text=await f.run();assert(text.includes(paths.nodePath));assert.equal(f.calls.length,25);assert.equal(f.hashes.length,7);assert.equal(f.timers.size,0);
    assert.deepEqual(f.calls[0].arguments,['-u']);assert(f.calls.slice(1).every(v=>v.arguments[0]==='-f'&&v.arguments[1]==='%u:%l:%p:%z:%d:%i'&&v.arguments[2]==='--'));
    assert(f.children.every(child=>child.events.filter(e=>e==='stdout-read').length===2&&child.events.includes('wait')));
    assert.equal(f.calls.some(c=>c.command===paths.nodePath),false);
  });
});
test('native EOF alone cannot admit invalid metadata or nonzero owned wait',async()=>{
  for(const opts of [{closeError:{errorCode:0xff7a0001},stdout:''},{closeError:{errorCode:0xff7a0001},exitCode:1}])
    await nativeFixture(opts,async f=>{await assert.rejects(f.run(),unavailable);assert.equal(f.hashes.length,0);assert.equal(f.timers.size,0);});
});
test('non-EOF numeric, string EOF and private close failures reject fixed metadata without hashing',async()=>{
  for(const closeError of [{errorCode:1},{errorCode:'0xff7a0001'},{errorCode:'4286185473'},Error('private close diagnostic')])
    await nativeFixture({closeError},async f=>{await assert.rejects(f.run(),unavailable);assert.equal(f.hashes.length,0);assert.equal(f.timers.size,0);});
});
test('raw stdout/stderr enforce 512-byte cap and reject non-ASCII metadata',async()=>{
  for(const opts of [{stdout:'x'.repeat(513)},{stderr:'x'.repeat(513)},{stdout:'501🎨\n'}])
    await nativeFixture(opts,async f=>{await assert.rejects(f.run(),unavailable);assert.equal(f.hashes.length,0);assert.equal(f.timers.size,0);});
});
test('missing canonical OS metadata tool refuses before any process seam',async()=>{
  await nativeFixture({symlink:'/usr/bin/id'},async f=>{await assert.rejects(f.run(),unavailable);assert.equal(f.calls.length,0);assert.equal(f.hashes.length,0);assert.equal(f.timers.size,0);});
});
test('metadata setup watchdog drops late child and cleans only that retained handle without reading it',async()=>{
  const spawn=deferred();await nativeFixture({spawn:()=>spawn.promise},async f=>{
    const pending=f.run(),refused=assert.rejects(pending,unavailable);await flush();f.expire(1000);await refused;
    const owned=f.child('501\n');spawn.resolve(owned);await flush();
    assert(owned.events.some(e=>Array.isArray(e)&&e[0]==='kill'&&e[1]===0));assert(owned.events.includes('wait'));
    assert.equal(owned.events.some(e=>typeof e==='string'&&e.endsWith('-read')),false);assert.equal(f.calls.length,1);assert.equal(f.timers.size,0);
  });
});
test('hanging owned wait is refused within metadata plus bounded cleanup deadlines, never treated as exit proof',async()=>{
  const wait=deferred();await nativeFixture({wait:wait.promise},async f=>{
    const pending=f.run(),refused=assert.rejects(pending,unavailable);await flush();f.expire(1000);await flush();f.expire(500);await refused;
    assert.equal(f.hashes.length,0);assert.equal(f.calls.length,1);assert(f.children[0].events.some(e=>Array.isArray(e)&&e[0]==='kill'));assert.equal(f.timers.size,0);
    wait.resolve({exitCode:0});await flush();assert.equal(f.calls.length,1);
  });
});

// Regression fakes cover the actual default nativeRuntime branch without
// importing or launching a native executable. Timers are advanced explicitly.
const failing = () => { let reject; const promise = new Promise((_, no) => { reject = no; }); return { promise, reject }; };
const hasKill = child => child.events.some(event => Array.isArray(event) && event[0] === 'kill');
const assertForcedPipes = child => { for (const label of ['stdin','stdout','stderr']) assert(child.events.some(event => Array.isArray(event) && event[0] === label + '-close' && event[1] === true), label); };
for (const label of ['stdout','stderr']) test(`owned exit remains known when ${label} read later fails`, async () => {
  const read = failing();
  await nativeFixture({ spawn(spec, makeChild) { const child = makeChild('501\n'); child[label].read = () => read.promise; return child; } }, async f => {
    const pending = f.run(), refused = assert.rejects(pending, unavailable);
    await flush(); assert(f.children[0].events.includes('wait'));
    read.reject(Error('private pipe diagnostic'));
    await refused;
    assert.equal(hasKill(f.children[0]), false); assertForcedPipes(f.children[0]);
    assert.equal(f.calls.length, 1); assert.equal(f.hashes.length, 0); assert.equal(f.timers.size, 0);
  });
});
test('owned exit remains known when stdin close later fails with a non-EOF error', async () => {
  const close = failing();
  await nativeFixture({ spawn(spec, makeChild) { const child = makeChild('501\n'); child.stdin.close = force => { child.events.push(['stdin-close',force]); return force === true ? Promise.resolve() : close.promise; }; return child; } }, async f => {
    const pending = f.run(), refused = assert.rejects(pending, unavailable);
    await flush(); assert(f.children[0].events.includes('wait'));
    close.reject({ errorCode: 1 }); await refused;
    assert.equal(hasKill(f.children[0]), false); assertForcedPipes(f.children[0]);
    assert.equal(f.calls.length, 1); assert.equal(f.hashes.length, 0); assert.equal(f.timers.size, 0);
  });
});
test('known owned exit plus stalled stderr still refuses at the metadata deadline without kill', async () => {
  const read = deferred();
  await nativeFixture({ spawn(spec, makeChild) { const child = makeChild('501\n'); child.stderr.read = () => read.promise; return child; } }, async f => {
    const pending = f.run(), refused = assert.rejects(pending, unavailable);
    await flush(); f.expire(1000); await refused;
    assert.equal(hasKill(f.children[0]), false); assertForcedPipes(f.children[0]);
    assert.equal(f.calls.length, 1); assert.equal(f.hashes.length, 0); assert.equal(f.timers.size, 0);
    read.resolve(new ArrayBuffer(0)); await flush(); assert.equal(f.calls.length, 1);
  });
});
test('read failure before any owned exit still kills and cleanup stays bounded', async () => {
  const wait = deferred(), read = failing();
  await nativeFixture({ wait: wait.promise, spawn(spec, makeChild) { const child = makeChild('501\n'); child.stderr.read = () => read.promise; return child; } }, async f => {
    const pending = f.run(), refused = assert.rejects(pending, unavailable);
    await flush(); read.reject(Error('private pipe diagnostic')); await flush();
    assert.equal(hasKill(f.children[0]), true); assertForcedPipes(f.children[0]);
    f.expire(500); await refused;
    assert.equal(f.calls.length, 1); assert.equal(f.hashes.length, 0); assert.equal(f.timers.size, 0);
    wait.resolve({exitCode:0}); await flush(); assert.equal(f.calls.length, 1);
  });
});
