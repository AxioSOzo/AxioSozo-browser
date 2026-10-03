// Offline fixture only. Canned JSON; never reads project files, executes a
// command, calls a provider, writes a profile or interprets prompt instructions.
import { documentFor } from "./common.mjs";
const cli = process.argv[2];
if (!["claude-code", "codex"].includes(cli)) process.exit(64);
let prompt = "";
for await (const chunk of process.stdin) {
  prompt += chunk;
  if (Buffer.byteLength(prompt) > 131072) process.exit(65);
}
// Deliberate bounded delay gives the owned GUI time to show progress/cancel.
await new Promise(resolve => setTimeout(resolve, 2500));
const document = documentFor(prompt);
const output = cli === "codex" ? document : { type: "result", subtype: "success", is_error: false, structured_output: document };
process.stdout.write(`${JSON.stringify(output)}\n`);
