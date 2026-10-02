// Synthetic metadata/hash/timer fixtures only. No native runtime or hook runs.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
const { buildNativeAgentHookConfig, AGENT_NOTIFY_SHA256 } = await import("../chrome/AgentHookConfig.sys.mjs");

const ROOT = "/Volumes/AxioSozoBuild/workstation";
const DIR = ROOT + "/contexts";
const SCRIPT = DIR + "/axiosozo-notify-" + AGENT_NOTIFY_SHA256 + ".sh";
const SOCKET = "/invented/profile/.a/s";
const make = () => {
  const events = [], timers = new Map();
  let sequence = 0;
  const records = {
    [ROOT]: {kind:"directory",uid:501,nlink:3,mode:0o755,size:96,device:"8",inode:"1"},
    [DIR]: {kind:"directory",uid:501,nlink:3,mode:0o700,size:96,device:"8",inode:"2"},
    [SCRIPT]: {kind:"regular",uid:501,nlink:1,mode:0o400,size:4678,device:"8",inode:"3"},
  };
  const runtime = {
    env(name) { events.push(["env",name]); return name === "AXIOSOZO_STATIC_READER_ROOT" ? ROOT : ""; },
    async ownUid() { events.push(["uid"]); return 501; },
    async verifyFile(path,options) { events.push(["verify",path,options]); return true; },
    async exactMetadata(path) { events.push(["stat",path]); return {...records[path]}; },
    async sha256(path) { events.push(["hash",path]); return AGENT_NOTIFY_SHA256; },
    timers:{
      setTimeout(callback,delay) { const id=++sequence; timers.set(id,{callback,delay}); return id; },
      clearTimeout(id) { timers.delete(id); },
    },
    Subprocess:{call(){throw new Error("NO_SUBPROCESS_IN_FAKE_TEST");}},
  };
  return {runtime,records,events,timers};
};
const refused = action => assert.rejects(action, error =>
  error.code === "AGENT_HOOK_CONFIG_UNAVAILABLE" && error.message === error.code);
const turn = () => new Promise(resolve => setImmediate(resolve));

test("Claude uses the bound fixed script through argv and emits only a snippet",async()=>{
  const f=make();
  const snippet=await buildNativeAgentHookConfig({agent:"claude-code",socketPath:SOCKET},f.runtime);
  assert.equal(typeof snippet,"string");
  const config=JSON.parse(snippet);
  assert.deepEqual(Object.keys(config.hooks),["Stop","Notification","UserPromptSubmit"]);
  for (const [event,list] of Object.entries(config.hooks)) {
    assert.deepEqual(list[0].hooks[0],{type:"command",command:"/usr/bin/env",
      args:["AXIOSOZO_AGENT_SOCKET="+SOCKET,"/bin/sh",SCRIPT,"claude-code",event],timeout:5});
  }
  assert.deepEqual(f.events.filter(e=>e[0]==="hash"),[["hash",SCRIPT]]);
  for (const path of [ROOT,DIR,SCRIPT]) assert.equal(f.events.filter(e=>e[0]==="stat"&&e[1]===path).length,2);
  assert.equal(f.timers.size,0);
});
test("Codex uses literal notify argv and a changed endpoint is regenerated",async()=>{
  const f=make();
  const a=await buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET},f.runtime);
  const changed="/invented/changed/.a/s";
  const b=await buildNativeAgentHookConfig({agent:"codex",socketPath:changed},f.runtime);
  const argv=JSON.parse(b.slice("notify = ".length));
  assert.deepEqual(argv,["/usr/bin/env","AXIOSOZO_AGENT_SOCKET="+changed,"/bin/sh",SCRIPT,"codex"]);
  assert.notEqual(a,b);
  assert.equal(f.events.filter(e=>e[0]==="uid").length,2);
  assert.equal(f.timers.size,0);
});
test("caller-supplied script/root fields never configure the helper",async()=>{
  const f=make();
  const value=await buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET,
    notifyPath:"/untrusted/script",root:"/untrusted/root"},f.runtime);
  assert(value.includes(SCRIPT));
  assert(!value.includes("/untrusted/"));
  assert(f.events.filter(e=>e[0]==="verify"||e[0]==="stat"||e[0]==="hash").every(e=>[ROOT,DIR,SCRIPT].includes(e[1])));
});
test("invalid agent/socket values refuse before any injected native activity",async()=>{
  for (const request of [{agent:"other",socketPath:SOCKET},{agent:"codex"},
    {agent:"codex",socketPath:"relative"},{agent:"codex",socketPath:"/a/"+ "${bad}"},
    {agent:"codex",socketPath:"/a/../b"},{agent:"codex",socketPath:"/"+ "x".repeat(100)}]) {
    const f=make();
    await assert.rejects(buildNativeAgentHookConfig(request,f.runtime),{code:"INVALID_INPUT"});
    assert.equal(f.events.length,0);assert.equal(f.timers.size,0);
  }
});
test("invalid storage roots refuse before UID, stat, hash or timers",async()=>{
  for(const root of ["/tmp/workstation","/Volumes/AxioSozoBuild/zen","/Volumes/AxioSozoBuild/workstation/extra","/Volumes/AxioSozoBuild/../workstation",""]) {
    const f=make();f.runtime.env=()=>root;
    await refused(buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET},f.runtime));
    assert.equal(f.events.length,0);assert.equal(f.timers.size,0);
  }
});
test("missing runtime capabilities fail closed without native imports",async()=>{
  for(const name of ["env","verifyFile","ownUid","exactMetadata","sha256"]) {
    const f=make();delete f.runtime[name];
    await refused(buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET},f.runtime));
    assert.equal(f.timers.size,0);
  }
});
test("root/parent/script type ownership permissions and hardlinks refuse",async()=>{
  for(const [path,changes] of [
    [ROOT,{uid:502}],[ROOT,{mode:0o775}],[ROOT,{kind:"regular"}],
    [DIR,{uid:502}],[DIR,{mode:0o755}],[DIR,{kind:"regular"}],
    [SCRIPT,{uid:502}],[SCRIPT,{nlink:2}],[SCRIPT,{mode:0o500}],
    [SCRIPT,{kind:"directory"}],[SCRIPT,{size:0}],[SCRIPT,{size:65537}],
    [SCRIPT,{mode:0o4400}],
  ]) {
    const f=make();Object.assign(f.records[path],changes);
    await refused(buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET},f.runtime));
    assert.equal(f.events.filter(e=>e[0]==="hash").length,0);assert.equal(f.timers.size,0);
  }
});
test("canonicality verifier must return literal true",async()=>{
  for(const result of [false,undefined,1,{}]) {
    const f=make();f.runtime.verifyFile=()=>result;
    await refused(buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET},f.runtime));
    assert.equal(f.events.filter(e=>e[0]==="hash").length,0);assert.equal(f.timers.size,0);
  }
});
test("hash mismatch and native private exceptions disclose only fixed failure",async()=>{
  for(const setup of [
    f=>{f.runtime.sha256=()=> "a".repeat(64);},
    f=>{f.runtime.exactMetadata=()=>{throw new Error("PRIVATE_FIXTURE_MESSAGE");};},
    f=>{f.runtime.sha256=()=>{throw new Error("PRIVATE_FIXTURE_MESSAGE");};},
  ]) {
    const f=make();setup(f);
    await refused(buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET},f.runtime));
    assert.equal(f.timers.size,0);
  }
});
test("replacement of root/parent/script across hash inspection refuses",async()=>{
  for(const path of [ROOT,DIR,SCRIPT]) {
    const f=make();f.runtime.sha256=()=>{f.records[path].inode="99";return AGENT_NOTIFY_SHA256;};
    await refused(buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET},f.runtime));
    assert.equal(f.timers.size,0);
  }
});
test("metadata snapshots do not share mutable runtime return records",async()=>{
  const f=make();f.runtime.exactMetadata=path=>f.records[path];
  f.runtime.sha256=()=>{f.records[SCRIPT].inode="99";return AGENT_NOTIFY_SHA256;};
  await refused(buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET},f.runtime));
});
test("malformed UID and metadata refuse",async()=>{
  for(const uid of [-1,NaN,501.5,"501"]) {
    const f=make();f.runtime.ownUid=()=>uid;
    await refused(buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET},f.runtime));
    assert.equal(f.timers.size,0);
  }
  for(const change of [{device:8},{inode:null},{nlink:0},{size:NaN},{mode:0o100400}]) {
    const f=make();Object.assign(f.records[SCRIPT],change);
    await refused(buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET},f.runtime));
  }
});
test("a deadline prevents late UID from starting further metadata work",async()=>{
  const f=make();let resolve;
  f.runtime.ownUid=()=>new Promise(done=>{resolve=done;});
  const pending=buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET},f.runtime);
  await turn();
  assert.equal(f.timers.size,1);
  [...f.timers.values()][0].callback();
  await refused(pending);resolve(501);await turn();
  assert.equal(f.events.filter(e=>e[0]==="stat"||e[0]==="hash").length,0);
  assert.equal(f.timers.size,0);
});
test("a deadline during hash rejects late completion and never emits cached snippets",async()=>{
  const f=make();let resolve;
  f.runtime.sha256=()=>new Promise(done=>{resolve=done;});
  const pending=buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET},f.runtime);
  await turn();[...f.timers.values()][0].callback();
  await refused(pending);resolve(AGENT_NOTIFY_SHA256);await turn();
  assert.equal(f.events.filter(e=>e[0]==="stat").length,3);assert.equal(f.timers.size,0);
});
test("literal quote/backtick/dollar paths survive as data; placeholder syntax refuses",async()=>{
  const f=make(),socket="/invented/a'`$;=/.a/s";
  const snippet=await buildNativeAgentHookConfig({agent:"codex",socketPath:socket},f.runtime);
  assert.equal(JSON.parse(snippet.slice("notify = ".length))[1],"AXIOSOZO_AGENT_SOCKET="+socket);
  assert.equal(f.timers.size,0);
});

function syntheticNative() {
  const f=make(),calls=[],children=[],globals={};
  const raw=text=>new TextEncoder().encode(text).buffer;
  const child = output => {
    const events=[];
    const pipe=(name,first)=>({async read(){events.push(["read",name]);const value=first;first=new ArrayBuffer(0);return value;},
      async close(force){events.push(["close",name,force]);}});
    const result={events,stdin:{async close(force){events.push(["close","stdin",force]);}},
      stdout:pipe("stdout",raw(output)),stderr:pipe("stderr",new ArrayBuffer(0)),
      async kill(signal){events.push(["kill",signal]);},
      async wait(){events.push(["wait"]);return {exitCode:0};}};
    children.push(result);return result;
  };
  const subprocess={async call(options) {
    calls.push(options);
    assert(["/usr/bin/id","/usr/bin/stat"].includes(options.command));
    assert.deepEqual(options.environment,{LANG:"C",LC_ALL:"C"});
    assert.equal(options.environmentAppend,false);assert.equal(options.workdir,"/");assert.equal(options.stderr,"pipe");
    if(options.command==="/usr/bin/id") {assert.deepEqual(options.arguments,["-u"]);return child("501\n");}
    assert.deepEqual(options.arguments.slice(0,3),["-f","%u:%l:%p:%z:%d:%i","--"]);
    const record=f.records[options.arguments[3]];assert(record);
    const mode=((record.kind==="directory"?0o40000:0o100000)|record.mode).toString(8);
    return child([record.uid,record.nlink,mode,record.size,record.device,record.inode].join(":")+"\n");
  }};
  class FakeFile {
    initWithPath(path){this.path=path;}
    exists(){return true;}isSymlink(){return false;}
    isDirectory(){return !this.isFile();}
    isFile(){return ["/usr/bin/id","/usr/bin/stat",SCRIPT].includes(this.path);}
    isReadable(){return true;}isExecutable(){return true;}
    normalize(){}
    get permissions(){return f.records[this.path]?.mode??0o755;}
  }
  const replacements={
    ChromeUtils:{importESModule(path){
      if(path==="resource://gre/modules/Subprocess.sys.mjs")return {Subprocess:subprocess};
      if(path==="resource://gre/modules/Timer.sys.mjs")return f.runtime.timers;
      throw new Error("UNEXPECTED_NATIVE_IMPORT");
    }},
    Cc:{"@mozilla.org/file/local;1":{createInstance(){return new FakeFile();}}},
    Ci:{nsIFile:"synthetic-nsIFile"},
    Services:{env:{get:f.runtime.env}},
    IOUtils:{async computeHexDigest(path,algorithm){assert.equal(path,SCRIPT);assert.equal(algorithm,"sha256");return AGENT_NOTIFY_SHA256;}},
  };
  const withGlobals=async action=>{
    for(const name of Object.keys(replacements)){globals[name]=Object.getOwnPropertyDescriptor(globalThis,name);
      Object.defineProperty(globalThis,name,{value:replacements[name],configurable:true,writable:true});}
    try{return await action();}
    finally{for(const name of Object.keys(replacements)){if(globals[name])Object.defineProperty(globalThis,name,globals[name]);else delete globalThis[name];}}
  };
  return {...f,calls,children,child,subprocess,replacements,withGlobals};
}
test("default native pattern uses only fixed id/stat argv with synthetic raw pipes",async()=>{
  const f=syntheticNative();
  await f.withGlobals(async()=>{
    const snippet=await buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET});
    assert.equal(JSON.parse(snippet.slice("notify = ".length))[3],SCRIPT);
  });
  assert.equal(f.calls.length,7);assert.equal(f.children.length,7);
  assert(f.children.every(child=>child.events.some(event=>event[0]==="wait")));
  assert(f.children.every(child=>!child.events.some(event=>event[0]==="kill")));
  assert.equal(f.timers.size,0);
});
test("default native raw output cap fails closed and cleans its retained fake child",async()=>{
  const f=syntheticNative();
  f.subprocess.call=async options=>{f.calls.push(options);return f.child("9".repeat(513));};
  await f.withGlobals(()=>refused(buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET})));
  assert.equal(f.calls.length,1);
  assert(f.children[0].events.some(event=>event[0]==="kill"));
  assert(f.children[0].events.some(event=>event[0]==="wait"));
  assert.equal(f.timers.size,0);
});
test("default native late fake spawn is closed/killed/waited by its own handle",async()=>{
  const f=syntheticNative();let resolve;
  f.subprocess.call=options=>{f.calls.push(options);return new Promise(done=>{resolve=done;});};
  await f.withGlobals(async()=>{
    const pending=buildNativeAgentHookConfig({agent:"codex",socketPath:SOCKET});
    await turn();
    const timer=[...f.timers.values()].find(value=>value.delay===1000);assert(timer);timer.callback();
    await refused(pending);
    const owned=f.child("501\n");resolve(owned);await turn();await turn();
    assert(owned.events.some(event=>event[0]==="kill"));
    assert(owned.events.some(event=>event[0]==="wait"));
    assert(owned.events.some(event=>event[0]==="close"));
  });
  assert.equal(f.calls.length,1);assert.equal(f.timers.size,0);
});
