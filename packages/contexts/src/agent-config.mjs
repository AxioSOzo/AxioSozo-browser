/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Integration copy changes these two staging imports to ./errors.mjs and
// ./schema.mjs. Everything below is DOM-free data construction only.
import { ContextsError } from './errors.mjs';
import { deepFreeze, utf8Length } from './schema.mjs';

const CONTROL = /[\u0000-\u001f\u007f-\u009f]/u;
const EVENTS = Object.freeze(['Stop', 'Notification', 'UserPromptSubmit']);
const AGENTS = Object.freeze(['claude-code', 'codex']);
const fail = path => { throw new ContextsError('INVALID_INPUT', 'INVALID_INPUT', path); };
const wellFormed = value => {
  for (const character of value) {
    const code = character.codePointAt(0);
    if (code >= 0xd800 && code <= 0xdfff) return false;
  }
  return true;
};

function pathValue(value, key, limit = 4096) {
  if (typeof value !== 'string' || value.length < 2 || !value.startsWith('/') || value.endsWith('/')
    || value.includes('//') || value.split('/').some(part => part === '.' || part === '..')
    || CONTROL.test(value) || !wellFormed(value) || utf8Length(value) > limit
    // Claude substitutes provider placeholders even in direct exec form.
    // Refuse this syntax rather than misbind a literal verified pathname.
    || value.includes('${')) fail(`$.${key}`);
  return value;
}

function agentValue(agent) {
  if (!AGENTS.includes(agent)) fail('$.agent');
  return agent;
}

// Lexical canonicality only. The trusted browser service must pass its current
// native-verified socket; no actor may provide socket/executable/script paths.
export function validateBoundSocketPath(value) {
  return pathValue(value, 'socketPath', 100);
}

export function hookInvocation({ agent, event, notifyPath, socketPath } = {}) {
  agentValue(agent);
  pathValue(notifyPath, 'notifyPath');
  validateBoundSocketPath(socketPath);
  if (agent === 'claude-code' && !EVENTS.includes(event)) fail('$.event');
  if (agent === 'codex' && event !== undefined) fail('$.event');
  // env receives one literal assignment. /bin/sh is an interpreter taking
  // the fixed product script as a filename argument, never a -c command.
  // It also prevents an '=' in notifyPath from becoming an env assignment.
  return deepFreeze({ command: '/usr/bin/env', args: [
    `AXIOSOZO_AGENT_SOCKET=${socketPath}`, '/bin/sh', notifyPath, agent,
    ...(agent === 'claude-code' ? [event] : []),
  ] });
}

export function hookConfig({ agent, notifyPath, socketPath } = {}) {
  if (agentValue(agent) === 'claude-code') {
    const hooks = Object.fromEntries(EVENTS.map(event => {
      const invocation = hookInvocation({ agent, event, notifyPath, socketPath });
      return [event, [{ hooks: [{ type: 'command', ...invocation, timeout: 5 }] }]];
    }));
    return `${JSON.stringify({ hooks }, null, 2)}\n`;
  }
  const invocation = hookInvocation({ agent, notifyPath, socketPath });
  // JSON array/string syntax is a TOML basic-string/array subset because
  // paths have no controls/unpaired surrogates. No shell string is emitted.
  return `notify = ${JSON.stringify([invocation.command, ...invocation.args])}\n`;
}

export function bridgeInvocation({ agent, nodePath, bridgePath, socketPath } = {}) {
  agentValue(agent);
  pathValue(nodePath, 'nodePath');
  pathValue(bridgePath, 'bridgePath');
  validateBoundSocketPath(socketPath);
  return deepFreeze({ command: nodePath,
    args: [bridgePath, '--agent', agent, '--socket', socketPath],
    env: { AXIOSOZO_AGENT_SOCKET: socketPath } });
}

export function bridgeConfig({ agent, nodePath, bridgePath, socketPath } = {}) {
  const invocation = bridgeInvocation({ agent, nodePath, bridgePath, socketPath });
  if (agent === 'claude-code') {
    return `${JSON.stringify({ mcpServers: { axiosozo: { type: 'stdio', ...invocation } } }, null, 2)}\n`;
  }
  return `[mcp_servers.axiosozo]\ncommand = ${JSON.stringify(invocation.command)}\n`
    + `args = ${JSON.stringify(invocation.args)}\n`
    + `env = { AXIOSOZO_AGENT_SOCKET = ${JSON.stringify(socketPath)} }\n`
    + 'tool_timeout_sec = 90\n';
}
