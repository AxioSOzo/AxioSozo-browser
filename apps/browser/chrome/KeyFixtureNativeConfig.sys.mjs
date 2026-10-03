// DOM-free fixture admission. Native Gecko availability requires an owned GUI run.
import { createDecisionKeyFixtureRuntime, decisionKeyFixturePaths, KEY_FIXTURE_PYTHON,
  KEY_FIXTURE_SHA256 } from "./DecisionKeyFixtureRuntime.sys.mjs";
import { createSubprocessUtf8Reader } from "./SubprocessUtf8.sys.mjs";
export const KEY_METADATA_STAT = "/usr/bin/stat";
export const KEY_METADATA_ID = "/usr/bin/id";
export const KEY_METADATA_FORMAT = "%u %l %Op %z %d %i";
export const KEY_HELPER_HASH_CODE = "import hashlib,os,re,stat,sys\np=sys.argv[1] if len(sys.argv)==2 else \"\"\nif not re.fullmatch(r\"/Volumes/AxioSozoBuild/workstation/gui-fixtures/keys-[0-9a-f]{32}/key-helper-82e11f794ab48cd0b29a28e65a560e876dca88406c3fc8d96fc851c300365d71\\.py\",p): raise SystemExit(1)\nf=os.open(\"/\",os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)\ntry:\n for c in p.split(\"/\")[1:-1]:\n  n=os.open(c,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=f);os.close(f);f=n\n  s=os.fstat(f)\n  if s.st_uid not in (0,os.getuid()) or (stat.S_IMODE(s.st_mode)&0o022 and not s.st_mode&0o1000):raise SystemExit(1)\n s=os.fstat(f)\n if s.st_uid!=os.getuid() or stat.S_IMODE(s.st_mode)!=0o700:raise SystemExit(1)\n n=os.open(p.rsplit(\"/\",1)[1],os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK,dir_fd=f)\n try:\n  a=os.fstat(n)\n  if not stat.S_ISREG(a.st_mode) or a.st_uid!=os.getuid() or a.st_nlink!=1 or stat.S_IMODE(a.st_mode)!=0o400 or not 0<a.st_size<=65536:raise SystemExit(1)\n  b=bytearray()\n  while len(b)<=65536:\n   c=os.read(n,min(8192,65537-len(b)))\n   if not c:break\n   b.extend(c)\n  z=os.fstat(n)\n  if len(b)!=a.st_size or (a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)!=(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns):raise SystemExit(1)\n  print(hashlib.sha256(b).hexdigest())\n finally:os.close(n)\nfinally:os.close(f)\n";
// Pinned Gecko SubprocessConstants: an exited child may already have closed stdin.
const NATIVE_END_OF_FILE = 0xff7a0001;
const BASE = "/Volumes/AxioSozoBuild/workstation/gui-fixtures";
const ROOT_RE = /^\/Volumes\/AxioSozoBuild\/workstation\/gui-fixtures\/keys-[0-9a-f]{32}$/u;
const unavailable = () => Object.assign(new Error("KEYCHAIN_HELPER_UNAVAILABLE"), { code: "KEYCHAIN_HELPER_UNAVAILABLE" });
const encoder = new TextEncoder();
const integer = value => Number.isSafeInteger(value) && value >= 0;
const pathsOf = path => path.split("/").slice(1).map((_, index, parts) => "/" + parts.slice(0,index+1).join("/"));

function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  return {
    env: name => Services.env.get(name),
    profilePath: () => Services.dirsvc.get("ProfD", Ci.nsIFile).path,
    timers, clock: () => Date.now(), spawn: options => Subprocess.call(options),
    metadataCommandAvailable(path) {
      if (![KEY_METADATA_ID,KEY_METADATA_STAT].includes(path)) return false;
      const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
      file.initWithPath(path);
      if (!file.exists() || file.isSymlink() || !file.isFile() || !file.isExecutable()) return false;
      file.normalize();
      return file.path === path && (file.permissions & 0o022) === 0;
    },
  };
}

/** Owned metadata process only. No secret input or raw diagnostic escapes. */
export async function runKeyFixtureMetadata(native, command, args, { signal, helperPath, admittedPaths } = {}) {
  const isId = command === KEY_METADATA_ID && args.length === 1 && args[0] === "-u";
  const isStat = command === KEY_METADATA_STAT && args[0] === "-f" && args[1] === KEY_METADATA_FORMAT
    && args.length >= 3 && args.length <= 32 && admittedPaths instanceof Set
    && args.slice(2).every(path => typeof path === "string" && admittedPaths.has(path));
  const isHash = command === KEY_FIXTURE_PYTHON && args.length === 5
    && args.slice(0,3).join(" ") === "-I -S -B" && args[3] === KEY_HELPER_HASH_CODE
    && args[4] === helperPath && typeof helperPath === "string"
    && new RegExp(`^${BASE}/keys-[a-f0-9]{32}/key-helper-${KEY_FIXTURE_SHA256}\\.py$`, "u").test(helperPath);
  if (!isId && !isStat && !isHash || signal?.aborted) throw unavailable();
  let child = null, stopped = false, finished = false, timer, rejectStop, cleanupTask;
  const stoppedPromise = new Promise((_,reject) => { rejectStop=reject; });
  const stop = () => { if (!finished && !stopped) { stopped=true; rejectStop(unavailable()); } };
  async function cleanup(owned) {
    if (cleanupTask) return cleanupTask;
    cleanupTask=(async()=> {
      let cleanupTimer;
      try {
        const actions = [()=>owned.stdin.close(true),()=>owned.stdout?.close?.(true),()=>owned.stderr?.close?.(true),
          ()=>owned.kill(250),()=>owned.wait()].map(action => Promise.resolve().then(action).catch(()=>{}));
        await Promise.race([Promise.all(actions),new Promise(resolve => { cleanupTimer=native.timers.setTimeout(resolve,500); })]);
      } finally { native.timers.clearTimeout(cleanupTimer); }
    })();
    return cleanupTask;
  }
  async function collect(pipe,size,keep) {
    let output="";
    const reader=createSubprocessUtf8Reader(pipe,{maxBytes:4096,onBytes(bytes) {
      size.bytes+=bytes.byteLength;
      if (size.bytes>4096) throw unavailable();
    }});
    for (;;) {
      const chunk=await reader.read();
      if (chunk===null) return output;
      if (keep) output+=chunk.text;
    }
  }
  try {
    timer=native.timers.setTimeout(stop,1000);
    signal?.addEventListener("abort",stop,{once:true});
    if (signal?.aborted) stop();
    const execute=(async()=> {
      child=await native.spawn({ command,
        arguments: isHash ? ["-I","-S","-B","-c",KEY_HELPER_HASH_CODE,helperPath] : args,
        environmentAppend:false,environment:{LANG:"C",LC_ALL:"C"},workdir:"/",stderr:"pipe" });
      if (stopped || finished || signal?.aborted) { await cleanup(child); throw unavailable(); }
      const size={bytes:0};
      // Gecko closes stdin on child exit. A later close can report EOF even
      // when this no-input command succeeded. Only that native code is benign;
      // both output streams and the accepted wait result must still complete.
      const closeInput=Promise.resolve().then(()=>child.stdin.close()).catch(error=> {
        if (error?.errorCode!==NATIVE_END_OF_FILE) throw error;
      });
      const [output,,result]=await Promise.all([collect(child.stdout,size,true),collect(child.stderr,size,false),child.wait(),closeInput]);
      if (stopped || signal?.aborted || result?.exitCode!==0) throw unavailable();
      return output;
    })();
    return await Promise.race([execute,stoppedPromise]);
  } catch { throw unavailable(); }
  finally {
    finished=true; native.timers.clearTimeout(timer); signal?.removeEventListener("abort",stop);
    if (child) await cleanup(child);
  }
}

export function parseKeyFixtureStat(text,count) {
  if (typeof text!=="string" || encoder.encode(text).length>4096 || !text.endsWith("\n")) throw unavailable();
  const lines=text.slice(0,-1).split("\n");
  if (lines.length!==count) throw unavailable();
  return lines.map(line=> {
    const match=/^(0|[1-9][0-9]{0,9}) (0|[1-9][0-9]{0,9}) ([0-7]{5,7}) (0|[1-9][0-9]{0,15}) ([0-9]{1,20}) ([0-9]{1,20})$/u.exec(line);
    if (!match) throw unavailable();
    const [uid,links,mode,size]=[Number(match[1]),Number(match[2]),Number.parseInt(match[3],8),Number(match[4])];
    if (![uid,links,mode,size].every(integer) || uid>4294967295 || mode>0o177777 || links<1) throw unavailable();
    return {uid,links,mode,size,device:match[5],inode:match[6]};
  });
}

export async function createNativeDecisionKeyFixtureRuntime({ runtime, signal, isActive } = {}) {
  try {
    if (isActive !== undefined && (typeof isActive !== "function" || isActive() !== true)) throw unavailable();
  } catch { throw unavailable(); }
  let requested;
  try { requested=runtime ? runtime.env("AXIOSOZO_KEY_GUI_FIXTURE_ROOT") : Services.env.get("AXIOSOZO_KEY_GUI_FIXTURE_ROOT"); }
  catch { throw unavailable(); }
  if (requested===undefined || requested===null || requested==="") return null;
  try {
    if (typeof requested!=="string" || !ROOT_RE.test(requested)) throw unavailable();
    runtime ??= nativeRuntime();
    if (runtime.env("AXIOSOZO_SYNTHETIC_TEST")!=="1"
      || runtime.metadataCommandAvailable(KEY_METADATA_ID)!==true || runtime.metadataCommandAvailable(KEY_METADATA_STAT)!==true) throw unavailable();
    const paths=decisionKeyFixturePaths(requested,runtime.profilePath());
    const allowed = new Set([BASE,paths.root,paths.profile,paths.interpreter,paths.helper]);
    const admittedPaths = new Set([...allowed].flatMap(pathsOf));
    let uid=null, interpreterAdmitted=false;
    const adapted={env:name=>runtime.env(name),profilePath:()=>runtime.profilePath(),timers:runtime.timers,
      clock:typeof runtime.clock==="function" ? ()=>runtime.clock() : undefined,spawn:options=>runtime.spawn(options),
      async verifyFile(path,options) {
        if (!allowed.has(path)) return false;
        if (uid===null) {
          const output=await runKeyFixtureMetadata(runtime,KEY_METADATA_ID,["-u"],{signal});
          if (!/^(0|[1-9][0-9]{0,9})\n$/u.test(output) || Number(output.trim())>4294967295) return false;
          uid=Number(output.trim());
        }
        const parts=pathsOf(path);
        const records=parseKeyFixtureStat(await runKeyFixtureMetadata(runtime,KEY_METADATA_STAT,["-f",KEY_METADATA_FORMAT,...parts],{signal,admittedPaths}),parts.length);
        if (records.slice(0,-1).some(info => (info.mode&0o170000)!==0o040000 || ![0,uid].includes(info.uid)
          || (info.mode&0o022)!==0 && (info.mode&0o1000)===0)) return false;
        const leaf=records.at(-1);
        const kind=leaf.mode&0o170000;
        if (options.directory) return kind===0o040000 && leaf.uid===uid && (leaf.mode&0o7777)===0o700;
        if (kind!==0o100000 || (leaf.mode&0o022)!==0) return false;
        if (path===paths.interpreter) {
          interpreterAdmitted=[0,uid].includes(leaf.uid) && (leaf.mode&0o111)!==0;
          return interpreterAdmitted;
        }
        return path===paths.helper && leaf.uid===uid && leaf.links===1 && (leaf.mode&0o7777)===0o400
          && leaf.size>0 && leaf.size<=65536;
      },
      async sha256(path) {
        if (path!==paths.helper || !interpreterAdmitted) throw unavailable();
        const output=await runKeyFixtureMetadata(runtime,paths.interpreter,["-I","-S","-B",KEY_HELPER_HASH_CODE,path],{signal,helperPath:path});
        if (!/^[a-f0-9]{64}\n$/u.test(output)) throw unavailable();
        return output.slice(0,-1);
      },
    };
    const admitted=await createDecisionKeyFixtureRuntime(adapted,{signal,isActive});
    if (!admitted) throw unavailable();
    // Privileged admitted native transport only; never derived from actor data.
    // Raw child pipes remain unchanged for ProviderKeys' discard/count path.
    return Object.freeze({...admitted,outputPipeMode:"raw"});
  } catch { throw unavailable(); }
}
