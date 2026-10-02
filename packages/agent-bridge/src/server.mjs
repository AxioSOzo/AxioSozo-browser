// Stdio MCP server (JSON-RPC 2.0), written against the MCP specification
// https://modelcontextprotocol.io/specification/2025-06-18 (lifecycle,
// transports/stdio, server/tools, basic/utilities/ping and cancellation).

import { LineSplitter } from './jsonl.mjs';
import { TOOLS, TOOL_BY_NAME, callTool, describeTool, errorResult } from './tools.mjs';

export const PROTOCOL_VERSION = '2025-06-18';
// Older revisions whose tools surface is a subset of what is served here.
export const SUPPORTED_PROTOCOL_VERSIONS = Object.freeze([PROTOCOL_VERSION, '2025-03-26', '2024-11-05']);
export const MCP_LINE_MAX = 4_194_304;

const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const INTERNAL_ERROR = -32603;

const INSTRUCTIONS = 'Tools for the AxioSozo browser the user is running. The first call asks the user to ' +
  'allow this agent in the browser ("Allow for this session"); until then tools return NOT_APPROVED. ' +
  'Read tools (tabs, project info, console errors, screenshots) need no further confirmation; ' +
  'browser_navigate, browser_click and browser_type each wait for the user to confirm in the browser.';

function isId(id) {
  return typeof id === 'string' || (typeof id === 'number' && Number.isFinite(id));
}

export class McpServer {
  #initialized = false;
  #inflight = new Map();
  #closed = false;

  constructor({ input, output, channel, serverInfo, log = () => {} }) {
    this.input = input;
    this.output = output;
    this.channel = channel;
    this.serverInfo = serverInfo;
    this.log = log;
    this.protocolVersion = null;
  }

  /** Serve until stdin ends. */
  run() {
    const splitter = new LineSplitter({
      maxLineBytes: MCP_LINE_MAX,
      resync: true,
      onOverflow: () => this.#send({ jsonrpc: '2.0', id: null, error: { code: PARSE_ERROR, message: 'Message too large' } }),
      onInvalid: () => this.#send({ jsonrpc: '2.0', id: null, error: { code: PARSE_ERROR, message: 'Invalid UTF-8' } }),
      onLine: (line) => this.#receive(line),
    });
    return new Promise((resolve) => {
      this.input.on('data', (chunk) => splitter.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
      // The client closes stdin to shut the server down (lifecycle, stdio).
      const finish = () => {
        this.#closed = true;
        resolve();
      };
      this.input.on('end', finish);
      this.input.on('close', finish);
    });
  }

  #send(message) {
    if (this.#closed) return;
    this.output.write(JSON.stringify(message) + '\n');
  }

  #reply(id, result) {
    this.#send({ jsonrpc: '2.0', id, result });
  }

  #error(id, code, message, data) {
    const error = { code, message };
    if (data !== undefined) error.data = data;
    this.#send({ jsonrpc: '2.0', id, error });
  }

  #receive(line) {
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      this.#error(null, PARSE_ERROR, 'Parse error');
      return;
    }
    if (Array.isArray(message)) {
      // JSON-RPC batching was removed in protocol revision 2025-06-18.
      this.#error(null, INVALID_REQUEST, 'Batches are not supported');
      return;
    }
    if (!message || typeof message !== 'object' || message.jsonrpc !== '2.0') {
      this.#error(isId(message?.id) ? message.id : null, INVALID_REQUEST, 'Invalid Request');
      return;
    }
    if (typeof message.method !== 'string') {
      // A response to a server request; this server never sends requests.
      return;
    }
    const hasId = Object.hasOwn(message, 'id');
    if (!hasId) {
      this.#notification(message);
      return;
    }
    if (!isId(message.id)) {
      this.#error(null, INVALID_REQUEST, 'Invalid Request id');
      return;
    }
    this.#request(message);
  }

  #notification(message) {
    if (message.method === 'notifications/initialized') {
      this.log('client initialized');
    } else if (message.method === 'notifications/cancelled') {
      const entry = this.#inflight.get(message.params?.requestId);
      if (entry) entry.cancelled = true;
    }
    // Every other notification is ignored, as JSON-RPC requires.
  }

  #request(message) {
    const { id, method } = message;
    const params = message.params ?? {};
    if (method === 'ping') {
      this.#reply(id, {});
      return;
    }
    if (method === 'initialize') {
      this.#initialize(id, params);
      return;
    }
    if (!this.#initialized) {
      this.#error(id, INVALID_REQUEST, 'Server not initialized');
      return;
    }
    if (method === 'tools/list') {
      this.#reply(id, { tools: TOOLS.map(describeTool) });
      return;
    }
    if (method === 'tools/call') {
      this.#toolsCall(id, params);
      return;
    }
    this.#error(id, METHOD_NOT_FOUND, `Method not found: ${method}`);
  }

  #initialize(id, params) {
    if (!params || typeof params !== 'object' || typeof params.protocolVersion !== 'string') {
      this.#error(id, INVALID_PARAMS, 'initialize requires params.protocolVersion');
      return;
    }
    const requested = params.protocolVersion;
    this.protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSION;
    this.#initialized = true;
    const client = params.clientInfo && typeof params.clientInfo.name === 'string' ? params.clientInfo.name : 'unknown';
    this.log(`initialize from ${client} (protocol ${requested} -> ${this.protocolVersion})`);
    this.#reply(id, {
      protocolVersion: this.protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo: this.serverInfo,
      instructions: INSTRUCTIONS,
    });
  }

  #toolsCall(id, params) {
    if (!params || typeof params !== 'object' || typeof params.name !== 'string') {
      this.#error(id, INVALID_PARAMS, 'tools/call requires params.name');
      return;
    }
    const tool = TOOL_BY_NAME.get(params.name);
    if (!tool) {
      this.#error(id, INVALID_PARAMS, `Unknown tool: ${params.name}`);
      return;
    }
    if (this.#inflight.has(id)) {
      this.#error(id, INVALID_REQUEST, 'Duplicate request id');
      return;
    }
    const entry = { cancelled: false, promise: null };
    entry.promise = (async () => {
      let result;
      try {
        result = await callTool(this.channel, tool, params.arguments);
      } catch (error) {
        this.log(`tool ${tool.name} failed: ${error && error.stack ? error.stack : error}`);
        result = errorResult('UNAVAILABLE', 'Internal error in the AxioSozo agent bridge.');
      }
      this.#inflight.delete(id);
      if (!entry.cancelled) this.#reply(id, result);
    })().catch((error) => {
      this.#inflight.delete(id);
      this.#error(id, INTERNAL_ERROR, String(error));
    });
    this.#inflight.set(id, entry);
  }
}
