# AxioSozo agent bridge

A local MCP server (stdio, JSON-RPC 2.0, protocol `2025-06-18`) that lets a
coding agent such as Claude Code or Codex use the AxioSozo browser the user is
running. It has no runtime dependencies and only needs Node 22 or newer.

The bridge talks to the browser over the local agent channel
([`contracts/agent-channel-v1.md`](../../contracts/agent-channel-v1.md)). This is
a Unix socket owned by the browser (mode `0600`, no TCP listener) at
`$AXIOSOZO_AGENT_SOCKET`, or `~/.axiosozo/run/agent.sock` by default.

- **Lazy connection.** Nothing connects until the first tool call. `initialize`
  and `tools/list` work even when the browser is closed.
- **Approval per session.** The first tool call shows a Zen-native prompt in
  the browser ("**Claude Code** in **Project** wants to use this browser":
  *Allow for this session* / *Deny*). The bridge waits up to 55 s for an answer.
  If the user has not answered by then, the call returns
  `NOT_APPROVED: Waiting for approval in AxioSozo…`. The prompt stays open, and
  the next call picks up the answer. After a denial, calls return
  `NOT_APPROVED` for 30 s without prompting again.
- **Act tools need confirmation.** `browser_navigate`, `browser_click` and
  `browser_type` do nothing until the user clicks *Allow once* on a
  notification in that tab. A denial, or 60 s without an answer, returns
  `DENIED`. Act tools never work on private tabs, blocked site categories or
  tabs outside the session's project.
- **Reconnects.** When the browser closes the connection (the user revoked
  access, the 10-minute idle timeout passed, or the browser quit), the next
  tool call opens a new connection and asks for approval again.
- **Errors are tool results.** Channel errors come back as `isError: true`
  results whose text starts with the code, for example
  `UNKNOWN_TAB: no tab t_9. Call browser_list_tabs for current tab ids.`
  Only an unknown tool name or a malformed request is a JSON-RPC error.
- **Clean output.** stdout carries only MCP messages; logs go to stderr
  (`--verbose`).

## Tools

| Tool | Channel method | Input |
| --- | --- | --- |
| `browser_list_tabs` | `tabs.list` | — |
| `browser_active_tab` | `tabs.active` | — |
| `browser_project_info` | `project.info` | — |
| `browser_console_errors` | `console.errors` | `tab_id` |
| `browser_screenshot` | `tabs.screenshot` | `tab_id`, `max_width?` (64–1920, default 1280); returns MCP `image` content (PNG) |
| `browser_open_url` | `tabs.open` | `url` (http/https) |
| `browser_navigate` | `tabs.navigate` | `tab_id`, `url` — confirmed in the browser |
| `browser_click` | `page.click` | `tab_id`, `selector` (≤ 512) — confirmed in the browser |
| `browser_type` | `page.type` | `tab_id`, `selector`, `text` (≤ 4096) — confirmed in the browser |

Arguments are checked against each tool's `inputSchema` before anything is
sent; a bad argument returns `INVALID_PARAMS`. Error codes: `NOT_APPROVED`,
`UNKNOWN_METHOD`, `INVALID_PARAMS`, `UNKNOWN_TAB`, `PRIVATE`,
`BLOCKED_CATEGORY`, `NOT_IN_PROJECT`, `NO_PROJECT`, `DENIED`, `UNAVAILABLE`
(including "AxioSozo is not running"), `TOO_LARGE`, `TIMEOUT`, `BUSY`.

## Add it to your agent

Replace `/abs/path/AxioSozo` with the absolute path of this repository. Use an
absolute `node` path if your agent's `PATH` does not contain Node 22 or newer.
The bridge sends its working directory to the browser, which uses it to find
the project. Start the agent in the project folder, or set `cwd`.

### Claude Code

```sh
claude mcp add --transport stdio --scope user axiosozo -- \
  node /abs/path/AxioSozo/packages/agent-bridge/bin/axiosozo-agent-bridge.mjs --agent claude-code
```

To share it through a project, use `.mcp.json` (an entry with no `type` is
stdio):

```json
{
  "mcpServers": {
    "axiosozo": {
      "command": "node",
      "args": ["/abs/path/AxioSozo/packages/agent-bridge/bin/axiosozo-agent-bridge.mjs", "--agent", "claude-code"]
    }
  }
}
```

### Codex

`~/.codex/config.toml`:

```toml
[mcp_servers.axiosozo]
command = "node"
args = ["/abs/path/AxioSozo/packages/agent-bridge/bin/axiosozo-agent-bridge.mjs", "--agent", "codex"]
# Act tools wait up to 60 s for your confirmation in the browser (default is 60).
tool_timeout_sec = 90
```

You can also run `codex mcp add axiosozo -- node /abs/path/AxioSozo/packages/agent-bridge/bin/axiosozo-agent-bridge.mjs --agent codex`.

### Options

| Option | Default |
| --- | --- |
| `--agent claude-code\|codex\|other` | `$AXIOSOZO_AGENT`, else `other`. Shown in the approval prompt. |
| `--socket /abs/path` | `$AXIOSOZO_AGENT_SOCKET`, else `~/.axiosozo/run/agent.sock` (absolute, ≤ 100 bytes) |
| `--verbose` | log connection events to stderr |
| `AXIOSOZO_BRIDGE_APPROVAL_WAIT_MS` | `55000`: how long one call waits for the session approval |
| `AXIOSOZO_BRIDGE_DENIED_COOLDOWN_MS` | `30000`: how long after a denial calls fail without prompting |

## Status hooks (`tools/axiosozo-notify`)

[`tools/axiosozo-notify`](../../tools/axiosozo-notify) is a small POSIX `sh`
script that reports `started | needs_input | done | failed` to the browser
(agent-channel-v1 §3). It always exits 0, prints nothing, and gives up within
about 1.5 s, so a hook can never block or fail the agent. The browser parses
the payload (`parseHookEvent`, workstation-v1 §5).

Claude Code (`~/.claude/settings.json` or `.claude/settings.json`; these
events need no `matcher`):

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": "/abs/path/AxioSozo/tools/axiosozo-notify claude-code Stop", "timeout": 5 }] }
    ],
    "Notification": [
      { "hooks": [{ "type": "command", "command": "/abs/path/AxioSozo/tools/axiosozo-notify claude-code Notification", "timeout": 5 }] }
    ],
    "UserPromptSubmit": [
      { "hooks": [{ "type": "command", "command": "/abs/path/AxioSozo/tools/axiosozo-notify claude-code UserPromptSubmit", "timeout": 5 }] }
    ]
  }
}
```

The script must stay silent: Claude Code adds `UserPromptSubmit` stdout to the
model's context.

Codex (`~/.codex/config.toml`). `notify` is a top-level key, so put it before
any `[table]` header. Codex adds its JSON payload as the last argument:

```toml
notify = ["/abs/path/AxioSozo/tools/axiosozo-notify", "codex"]
```

Manual use: `axiosozo-notify status done "Migrations applied"` (the agent is
`$AXIOSOZO_AGENT`, else `other`).

## Tests

```sh
AXIOSOZO_BUILD_ROOT=/Volumes/AxioSozoBuild/workstation /Users/wout/.local/bin/dev-external \
  python3 scripts/storage.py exec -- \
  /Volumes/AxioSozoBuild/toolchains/zen/node/bin/node --test packages/agent-bridge/tests/*.test.mjs
```

The tests run the real bridge binary and the real `axiosozo-notify` (under the
shebang `/bin/sh` and `/bin/dash`) against a fake browser channel server
(`tests/fake-browser.mjs`). Its socket lives in a temp dir under
`/Volumes/AxioSozoBuild/workstation/tmp/` (override with `AXIOSOZO_TEST_TMP`).
No real browser, provider or third-party MCP server is involved.

## Sources

Behaviour and config syntax were checked against these pages on 2 October 2026:

- MCP specification 2025-06-18: lifecycle and version negotiation
  <https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle>;
  stdio transport (newline-delimited, no embedded newlines, stderr for logs)
  <https://modelcontextprotocol.io/specification/2025-06-18/basic/transports>;
  tools (`tools/list`, `tools/call`, image content, `isError`, annotations)
  <https://modelcontextprotocol.io/specification/2025-06-18/server/tools>.
- Claude Code hooks (settings shape; no matcher needed for `Stop`,
  `Notification`, `UserPromptSubmit`; stdin fields; `UserPromptSubmit` stdout
  becomes context): <https://code.claude.com/docs/en/hooks>.
- Claude Code MCP (`claude mcp add … -- <command>`, `--scope`, `.mcp.json`
  `mcpServers`): <https://code.claude.com/docs/en/mcp>.
- Codex config reference (`notify`, `[mcp_servers.<id>]` with `command`, `args`,
  `env`, `cwd`, `tool_timeout_sec`):
  <https://developers.openai.com/codex/config-reference>, which redirects to
  <https://learn.chatgpt.com/docs/config-file/config-reference>. Notify payload
  (one JSON argument; `type: "agent-turn-complete"`, `last-assistant-message`,
  …): <https://learn.chatgpt.com/docs/config-file/config-advanced>. Codex MCP
  servers and `codex mcp add`: <https://learn.chatgpt.com/docs/extend/mcp>.

## Limitations

- These tests do not cover a real browser endpoint. The browser side of the
  channel (`nsIServerSocket`, approval UI, WebDriver BiDi-backed act methods)
  belongs to the chrome workstream.
- Chromium tabs support only `tabs.list` and `tabs.active` until the CEF API
  offers console errors and screenshots (agent-channel-v1 §6).
- Each new connection needs a new approval, including the reconnect after the
  browser's 10-minute idle timeout.
- `axiosozo-notify` needs `/usr/bin/nc` with `-U` (macOS). If an agent never
  closes the hook's stdin, the report is dropped after the 1.5 s budget.
