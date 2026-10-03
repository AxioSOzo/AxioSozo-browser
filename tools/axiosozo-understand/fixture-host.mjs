// Fixed offline fixture host. Uses the existing UnderstandRunner with only
// hash-pinned synthetic scripts; real CLI discovery and authorization are absent.
import { createHash } from "node:crypto";
import { lstatSync, realpathSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { UnderstandRunner } from "./src/understand.mjs";
const NODE = "/Volumes/AxioSozoBuild/toolchains/zen/node/bin/node";
const PYTHON = "/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11";
const [root, profile] = process.argv.slice(2);
const match = /^\/Volumes\/AxioSozoBuild\/workstation\/gui-fixtures\/understand-([0-9a-f]{32})$/u.exec(root ?? "");
const BASE_PROFILE = "/Volumes/AxioSozoBuild/workstation/runtime/e626697ad91fe95c";
const refuse = () => { throw new Error("UNDERSTAND_FIXTURE_UNAVAILABLE"); };
if (process.argv.length !== 4 || !match || profile !== `${BASE_PROFILE}/plan4-understand-${match[1]}/gecko`
    || process.execPath !== NODE || process.env.AXIOSOZO_SYNTHETIC_TEST !== "1"
    || process.env.AXIOSOZO_UNDERSTAND_GUI_FIXTURE !== "1" || process.env.AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT !== root) refuse();
const file = fileURLToPath(import.meta.url);
if (file !== `${root}/packages/provider-host/cli.mjs`) refuse();
const policy = JSON.parse(readFileSync(`${root}/policy.json`, "utf8"));
if (policy.version !== 1 || policy.fixture_only !== true || JSON.stringify(policy.project_names) !== '["harbor","inkline"]') refuse();
const projectRoots = policy.project_names.map(name => `${root}/projects/${name}`);
function directory(full) {
  const info = lstatSync(full);
  if (!info.isDirectory() || info.isSymbolicLink() || info.uid !== process.getuid() || (info.mode & 0o7777) !== 0o700 || realpathSync(full) !== full) refuse();
}
for (const full of [root, profile, `${root}/home`, ...projectRoots]) directory(full);
const helper = `${root}/understand_fixture.py`;
const fakePrefix = cli => ["-I", "-S", "-B", helper, "cli", root, profile, cli];
const runner = new UnderstandRunner({ liveAuthorized: false, discover: () => [], home: `${root}/home`,
  testOnlyLaunch: { "claude-code": { command: PYTHON, prefix: fakePrefix("claude-code") }, codex: { command: PYTHON, prefix: fakePrefix("codex") } } });
const ids = new Set(), pending = new Set(); let buffer = "", closed = false;
function close() { if (closed) return; closed = true; runner.close(); process.stdin.pause(); process.stdin.destroy(); }
function send(value) {
  if (closed) return;
  const line = `${JSON.stringify({ version: 1, ...value })}\n`;
  if (Buffer.byteLength(line) > 147456 || process.stdout.writableLength > 1048576) { close(); return; }
  process.stdout.write(line);
}
const plain = value => value !== null && typeof value === "object" && !Array.isArray(value);
const keys = (value, names) => plain(value) && Object.keys(value).length === names.length && names.every(name => Object.hasOwn(value,name));
async function handle(frame) {
  let id = frame?.id;
  if (!keys(frame,["version","id","method","params"]) || frame.version !== 1 || typeof id !== "string"
      || !/^[A-Za-z0-9_.:-]{1,160}$/u.test(id) || ids.has(id) || ids.size >= 1024 || pending.size >= 6) { close(); return; }
  ids.add(id); pending.add(id);
  try {
    directory(root); directory(profile);
    let result;
    if (frame.method === "understand/available") {
      if (!keys(frame.params,[])) refuse();
      result = { clis: ["claude-code","codex"].map(cli => ({cli,path:NODE,version:"synthetic-1"})) };
    } else if (frame.method === "understand/cancel") result = runner.cancel(frame.params);
    else if (frame.method === "understand/run") {
      if (!projectRoots.includes(frame.params?.project_root)) refuse();
      directory(frame.params.project_root);
      result = await runner.run(frame.params);
    } else refuse();
    send({id,result});
  } catch { send({id,error:{code:"UNDERSTAND_FIXTURE_UNAVAILABLE",message:"UNDERSTAND_FIXTURE_UNAVAILABLE"}}); }
  finally { pending.delete(id); }
}
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => {
  if (closed) return; buffer += chunk;
  for (;;) {
    const newline = buffer.indexOf("\n"); if (newline < 0) break;
    const line = buffer.slice(0,newline); buffer = buffer.slice(newline+1);
    if (Buffer.byteLength(line) > 73728) { close(); return; }
    let frame; try { frame = JSON.parse(line); } catch { close(); return; }
    void handle(frame);
  }
  if (Buffer.byteLength(buffer) > 73728) close();
});
process.stdin.once("end", close); process.stdin.once("error", close); process.stdout.once("error", close);
process.once("SIGTERM", close); process.once("SIGINT", close); process.once("exit", () => runner.close());
