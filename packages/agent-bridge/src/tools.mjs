// MCP tools, mapped 1:1 to agent channel methods (agent-channel-v1 §4, §5).

import { ChannelError } from './channel.mjs';

const TAB_ID = {
  type: 'string',
  pattern: '^t_[0-9]{1,15}$',
  description: 'Opaque tab id from browser_list_tabs or browser_active_tab, e.g. "t_12".',
};
const WEB_URL = {
  type: 'string',
  minLength: 8,
  maxLength: 8192,
  pattern: '^https?://',
  description: 'Absolute http:// or https:// URL.',
};
const SELECTOR = {
  type: 'string',
  minLength: 1,
  maxLength: 512,
  description: 'CSS selector of the target element (at most 512 characters).',
};
const EMPTY = { type: 'object', properties: {}, additionalProperties: false };

const CONFIRM = 'Nothing happens until the user confirms this action in the AxioSozo browser ' +
  '(a notification on that tab names the agent, the action and its target, with Allow once / Deny); ' +
  'a denial or 60 s without an answer returns DENIED. Only tabs of this session\'s project, never ' +
  'private tabs or blocked site categories.';

const READ = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const ACT = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true };

const READ_TIMEOUT_MS = 30_000;
// The browser waits up to 60 s for the user's confirmation.
const ACT_TIMEOUT_MS = 75_000;

function json(value) {
  return JSON.stringify(value, null, 2);
}

function text(value) {
  return { content: [{ type: 'text', text: value }] };
}

export const TOOLS = Object.freeze([
  {
    name: 'browser_list_tabs',
    title: 'List browser tabs',
    description: 'List the open tabs of every normal AxioSozo window (private tabs are never included): ' +
      'tab_id, url, title, active, project_id and engine ("gecko" or "chromium").',
    inputSchema: EMPTY,
    annotations: READ,
    method: 'tabs.list',
    timeoutMs: READ_TIMEOUT_MS,
    format: (result) => text(json(result)),
  },
  {
    name: 'browser_active_tab',
    title: 'Active browser tab',
    description: 'The tab the user is looking at in AxioSozo (tab_id, url, title, project_id, engine), or null.',
    inputSchema: EMPTY,
    annotations: READ,
    method: 'tabs.active',
    timeoutMs: READ_TIMEOUT_MS,
    format: (result) => text(result == null ? 'No active tab.' : json(result)),
  },
  {
    name: 'browser_project_info',
    title: 'Project info',
    description: 'The AxioSozo project whose folder contains this agent\'s working directory: name, root, ' +
      'apps with their environment base URLs (local, preview, production) and detected integrations. ' +
      'Returns null when the folder is not a known project.',
    inputSchema: EMPTY,
    annotations: READ,
    method: 'project.info',
    timeoutMs: READ_TIMEOUT_MS,
    format: (result) => text(result == null
      ? 'No AxioSozo project contains this working directory.'
      : json(result)),
  },
  {
    name: 'browser_console_errors',
    title: 'Console errors of a tab',
    description: 'Recent console errors and warnings of a tab (at most 50; count, level, text, source, line, at). ' +
      'Gecko tabs only; Chromium tabs return UNAVAILABLE.',
    inputSchema: {
      type: 'object',
      properties: { tab_id: TAB_ID },
      required: ['tab_id'],
      additionalProperties: false,
    },
    annotations: READ,
    method: 'console.errors',
    timeoutMs: READ_TIMEOUT_MS,
    format: (result) => text(json(result)),
  },
  {
    name: 'browser_screenshot',
    title: 'Screenshot of a tab',
    description: 'PNG screenshot of the visible viewport of a tab, downscaled to max_width pixels ' +
      '(default 1280, at most 1920). Gecko tabs only for now; Chromium tabs return UNAVAILABLE.',
    inputSchema: {
      type: 'object',
      properties: {
        tab_id: TAB_ID,
        max_width: {
          type: 'integer',
          minimum: 64,
          maximum: 1920,
          description: 'Maximum width in pixels of the returned image (default 1280).',
        },
      },
      required: ['tab_id'],
      additionalProperties: false,
    },
    annotations: READ,
    method: 'tabs.screenshot',
    timeoutMs: READ_TIMEOUT_MS,
    format: (result, args) => {
      if (!result || typeof result !== 'object' || result.mime !== 'image/png'
          || typeof result.data_base64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(result.data_base64)) {
        throw new ChannelError('UNAVAILABLE', 'AxioSozo returned a malformed screenshot.');
      }
      return {
        content: [
          { type: 'image', data: result.data_base64, mimeType: 'image/png' },
          { type: 'text', text: `Screenshot of ${args.tab_id}: ${result.width}x${result.height} PNG.` },
        ],
      };
    },
  },
  {
    name: 'browser_open_url',
    title: 'Open URL in a new tab',
    description: 'Open an http(s) URL in a new background tab, in the session project\'s container ' +
      '(or the default container without a project). Returns the new tab_id.',
    inputSchema: {
      type: 'object',
      properties: { url: WEB_URL },
      required: ['url'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    method: 'tabs.open',
    timeoutMs: READ_TIMEOUT_MS,
    format: (result) => text(json(result)),
  },
  {
    name: 'browser_navigate',
    title: 'Navigate a tab',
    description: `Navigate an existing tab to an http(s) URL. ${CONFIRM}`,
    inputSchema: {
      type: 'object',
      properties: { tab_id: TAB_ID, url: WEB_URL },
      required: ['tab_id', 'url'],
      additionalProperties: false,
    },
    annotations: ACT,
    method: 'tabs.navigate',
    timeoutMs: ACT_TIMEOUT_MS,
    format: (result, args) => text(`Navigated ${args.tab_id} to ${args.url}.` +
      (result == null || (typeof result === 'object' && !Object.keys(result).length) ? '' : `\n${json(result)}`)),
  },
  {
    name: 'browser_click',
    title: 'Click an element',
    description: `Click the first element matching a CSS selector in a tab. ${CONFIRM}`,
    inputSchema: {
      type: 'object',
      properties: { tab_id: TAB_ID, selector: SELECTOR },
      required: ['tab_id', 'selector'],
      additionalProperties: false,
    },
    annotations: ACT,
    method: 'page.click',
    timeoutMs: ACT_TIMEOUT_MS,
    format: (result, args) => text(`Clicked ${JSON.stringify(args.selector)} in ${args.tab_id}.` +
      (result == null || (typeof result === 'object' && !Object.keys(result).length) ? '' : `\n${json(result)}`)),
  },
  {
    name: 'browser_type',
    title: 'Type into an element',
    description: 'Type text (at most 4096 characters) into the element matching a CSS selector in a tab. ' +
      `Never into password fields. ${CONFIRM}`,
    inputSchema: {
      type: 'object',
      properties: {
        tab_id: TAB_ID,
        selector: SELECTOR,
        text: { type: 'string', maxLength: 4096, description: 'Text to type.' },
      },
      required: ['tab_id', 'selector', 'text'],
      additionalProperties: false,
    },
    annotations: ACT,
    method: 'page.type',
    timeoutMs: ACT_TIMEOUT_MS,
    format: (result, args) => text(`Typed ${[...args.text].length} characters into ${JSON.stringify(args.selector)} in ${args.tab_id}.` +
      (result == null || (typeof result === 'object' && !Object.keys(result).length) ? '' : `\n${json(result)}`)),
  },
]);

export const TOOL_BY_NAME = new Map(TOOLS.map((tool) => [tool.name, tool]));

/** The `tools/list` view of a tool. */
export function describeTool(tool) {
  return {
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema,
    annotations: tool.annotations,
  };
}

/**
 * Validate `args` against one of the small object schemas above. Returns an
 * error message, or null when valid.
 */
export function validateArguments(schema, args) {
  if (args === undefined || args === null) args = {};
  if (typeof args !== 'object' || Array.isArray(args)) return 'arguments must be an object';
  for (const key of Object.keys(args)) {
    if (!Object.hasOwn(schema.properties, key)) return `unknown argument "${key}"`;
  }
  for (const key of schema.required ?? []) {
    if (!Object.hasOwn(args, key)) return `missing argument "${key}"`;
  }
  for (const [key, value] of Object.entries(args)) {
    const prop = schema.properties[key];
    if (prop.type === 'string') {
      if (typeof value !== 'string') return `"${key}" must be a string`;
      const length = [...value].length;
      if (prop.minLength !== undefined && length < prop.minLength) return `"${key}" is too short`;
      if (prop.maxLength !== undefined && length > prop.maxLength) return `"${key}" is longer than ${prop.maxLength} characters`;
      if (prop.pattern !== undefined && !new RegExp(prop.pattern).test(value)) return `"${key}" does not match ${prop.pattern}`;
    } else if (prop.type === 'integer') {
      if (!Number.isInteger(value)) return `"${key}" must be an integer`;
      if (prop.minimum !== undefined && value < prop.minimum) return `"${key}" must be at least ${prop.minimum}`;
      if (prop.maximum !== undefined && value > prop.maximum) return `"${key}" must be at most ${prop.maximum}`;
    }
  }
  if (Object.hasOwn(args, 'url')) {
    let url;
    try {
      url = new URL(args.url);
    } catch {
      return '"url" is not a valid URL';
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '"url" must be http or https';
  }
  return null;
}

const HINTS = {
  UNKNOWN_TAB: 'Call browser_list_tabs for current tab ids.',
  NOT_IN_PROJECT: 'Act tools only work on tabs of this session\'s project.',
  NO_PROJECT: 'This working directory is not an AxioSozo project; act tools need one.',
  DENIED: 'The user declined this action in AxioSozo; do not retry it without asking the user.',
  PRIVATE: 'Private windows are never available to agents.',
  BLOCKED_CATEGORY: 'This site is in a blocked category and is never available to agents.',
};

function cleanMessage(message) {
  // Browser messages are shown to the model; keep them short and printable.
  return String(message ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 1000);
}

/** A tool result with `isError: true`; the channel error code leads the text. */
export function errorResult(code, message) {
  const safeCode = /^[A-Z_]{1,32}$/.test(code) ? code : 'UNAVAILABLE';
  let body = cleanMessage(message) || 'The request failed.';
  const hint = HINTS[safeCode];
  if (hint) body += (/[.!?]$/.test(body) ? ' ' : '. ') + hint;
  return {
    content: [{ type: 'text', text: `${safeCode}: ${body}` }],
    isError: true,
  };
}

/** Run a validated tool call through the channel and shape the MCP result. */
export async function callTool(channel, tool, args) {
  const problem = validateArguments(tool.inputSchema, args);
  if (problem) return errorResult('INVALID_PARAMS', problem);
  const params = args ?? {};
  try {
    const result = await channel.request(tool.method, params, { timeoutMs: tool.timeoutMs });
    return tool.format(result, params);
  } catch (error) {
    if (error instanceof ChannelError) return errorResult(error.code, error.message);
    throw error;
  }
}
