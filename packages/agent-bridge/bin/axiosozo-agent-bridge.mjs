#!/usr/bin/env node
// AxioSozo agent bridge: a stdio MCP server that gives coding agents
// user-approved access to the running AxioSozo browser over its local agent
// channel. stdout carries only MCP messages; logs go to stderr.

import { readFileSync } from 'node:fs';
import { AGENTS, ChannelClient, resolveSocketPath } from '../src/channel.mjs';
import { McpServer } from '../src/server.mjs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const USAGE = `Usage: axiosozo-agent-bridge [--agent claude-code|codex|other] [--socket /abs/path]

A stdio MCP server; add it to Claude Code or Codex (see README.md).
  --agent    who is asking (shown in the browser's approval prompt);
             default $AXIOSOZO_AGENT, else "other"
  --socket   agent channel socket; default $AXIOSOZO_AGENT_SOCKET,
             else ~/.axiosozo/run/agent.sock
  --verbose  log connection events to stderr
`;

function log(message) {
  process.stderr.write(`[axiosozo-agent-bridge] ${message}\n`);
}

function parseArgs(argv) {
  const options = { agent: process.env.AXIOSOZO_AGENT || 'other', socket: null, verbose: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const [flag, inline] = arg.startsWith('--') && arg.includes('=') ? arg.split(/=(.*)/s, 2) : [arg, undefined];
    const value = () => (inline !== undefined ? inline : argv[++i]);
    if (flag === '--agent') options.agent = value();
    else if (flag === '--socket') options.socket = value();
    else if (flag === '--verbose') options.verbose = true;
    else if (flag === '--help' || flag === '-h') options.help = true;
    else if (flag === '--version') options.version = true;
    else throw new Error(`unknown argument: ${arg}`);
  }
  if (!AGENTS.includes(options.agent)) {
    log(`unknown agent "${options.agent}", using "other"`);
    options.agent = 'other';
  }
  return options;
}

function envMs(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

let options;
try {
  options = parseArgs(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`${error.message}\n${USAGE}`);
  process.exit(2);
}
if (options.help) {
  process.stderr.write(USAGE);
  process.exit(0);
}
if (options.version) {
  process.stderr.write(`${pkg.version}\n`);
  process.exit(0);
}

const quiet = () => {};
const channel = new ChannelClient({
  socketPath: options.socket || resolveSocketPath(),
  agent: options.agent,
  cwd: process.cwd(),
  version: pkg.version,
  approvalWaitMs: envMs('AXIOSOZO_BRIDGE_APPROVAL_WAIT_MS', 55_000),
  deniedCooldownMs: envMs('AXIOSOZO_BRIDGE_DENIED_COOLDOWN_MS', 30_000),
  log: options.verbose ? log : quiet,
});

const server = new McpServer({
  input: process.stdin,
  output: process.stdout,
  channel,
  serverInfo: { name: 'axiosozo-agent-bridge', title: 'AxioSozo browser', version: pkg.version },
  log: options.verbose ? log : quiet,
});

process.stdout.on('error', () => process.exit(0));
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    channel.close();
    process.exit(0);
  });
}

await server.run();
channel.close();
// Flush stdout (asynchronous for pipes on macOS) before exiting.
process.stdout.write('', () => process.exit(0));
