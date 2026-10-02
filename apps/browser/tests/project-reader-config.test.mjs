import test from "node:test";
import assert from "node:assert/strict";
import { createNativeProjectReader, projectReaderPaths, PROJECT_READER_SHA256, PROJECT_READER_PYTHON } from "../chrome/ProjectReaderConfig.sys.mjs";
const root = "/Volumes/AxioSozoBuild/workstation";
const refused = error => error.code === "READ_CONTAINMENT_UNAVAILABLE";
function harness(overrides = {}) {
  const calls = [], timers = { setTimeout, clearTimeout };
  const runtime = { timers, env: name => name === "AXIOSOZO_STATIC_READER_ROOT" ? root : "",
    verifyFile: async (path, options) => { calls.push(["verify",path,options]); return true; },
    sha256: async path => { calls.push(["hash",path]); return PROJECT_READER_SHA256; },
    Subprocess: { call: () => assert.fail("configuration must not start a child") }, ...overrides };
  return { runtime, calls };
}
test("Only the exact volume root or one nonreserved named root can configure the helper", () => {
  assert.equal(projectReaderPaths(root).interpreter, PROJECT_READER_PYTHON);
  assert.equal(projectReaderPaths(root).helperPath, `${root}/contexts/project-reader-${PROJECT_READER_SHA256}.py`);
  assert.equal(projectReaderPaths("/Volumes/AxioSozoBuild").interpreter, PROJECT_READER_PYTHON);
  for (const path of [undefined,"",root+"/child",root+"/../zen",root+"/",root+"\n","/Users/synthetic/project","/Volumes/AxioSozoBuild/zen","/Volumes/AxioSozoBuild/providers","/Volumes/AxioSozoBuild/toolchains"])
    assert.throws(() => projectReaderPaths(path), refused);
});
test("Configuration verifies fixed interpreter and private checksum-pinned helper without spawning", async () => {
  const h=harness(); const reader=await createNativeProjectReader({runtime:h.runtime});
  assert.equal(reader.exactAvailable,true);
  assert.deepEqual(h.calls.map(row=>row[0]),["verify","verify","hash","verify"]);
  assert.deepEqual(h.calls[0],["verify",PROJECT_READER_PYTHON,{executable:true}]);
  assert.deepEqual(h.calls[1].slice(1),[projectReaderPaths(root).helperPath,{privateParent:true}]);
});
test("Missing configuration fails before helper filesystem checks", async () => {
  const h=harness({env:()=>""}); await assert.rejects(createNativeProjectReader({runtime:h.runtime}),refused); assert.deepEqual(h.calls,[]);
});
test("Unsafe fixed files and checksum drift fail closed without spawning", async () => {
  for(const overrides of [{verifyFile:async()=>false},{sha256:async()=>"0".repeat(64)},{verifyFile:async()=>{throw Error("private path detail");}}]) {
    const h=harness(overrides); await assert.rejects(createNativeProjectReader({runtime:h.runtime}),error=>refused(error)&&error.message==="READ_CONTAINMENT_UNAVAILABLE");
  }
});
test("Checksum verification has one bounded lifetime even when filesystem promise hangs", async () => {
  let expire; const h=harness({sha256:()=>new Promise(()=>{}),timers:{setTimeout:fn=>{expire=fn;return 1;},clearTimeout:()=>{}}});
  const result=createNativeProjectReader({runtime:h.runtime}); for(let i=0;i<5;i++)await Promise.resolve(); expire();
  await assert.rejects(result,refused);
});
test("A changed helper after hashing and unavailable process primitives remain unavailable", async () => {
  let checks=0; const h=harness({verifyFile:async()=>++checks<3}); await assert.rejects(createNativeProjectReader({runtime:h.runtime}),refused);
  const missing=harness({Subprocess:null}); await assert.rejects(createNativeProjectReader({runtime:missing.runtime}),refused);
});
