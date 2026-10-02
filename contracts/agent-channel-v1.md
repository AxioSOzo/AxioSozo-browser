# Local agent channel, version 1 (P3 status, P4 agent bridge)

Owner: integration lead. One local channel connects the running browser to
the user's coding agents: `axiosozo-notify` (status reports, P3) and the
`packages/agent-bridge` MCP server (browser tools, P4). It is not an
automation protocol: Gecko tab work behind it uses Firefox's own chrome APIs
and, for act tools, WebDriver BiDi-equivalent internals; Chromium tabs are
reached only through the CEF workstream's API (see §6).

## 1. Transport

- A **Unix domain socket** owned by the browser (`nsIServerSocket.initWithFilename`),
  mode `0600`, in a directory of mode `0700`. Web content cannot reach it, and
  there is no TCP listener.
- Path: pref `axiosozo.agent.socketPath`; default `~/.axiosozo/run/agent.sock`.
  Clients use `$AXIOSOZO_AGENT_SOCKET` when set, else the default. The path
  must be absolute and at most 100 bytes.
- If a live socket already answers at the path, the browser does not take it
  over (another AxioSozo instance owns it) and shows the endpoint as
  `in use by another instance`. A stale socket file (connect refused) owned by
  the user is removed and recreated. A non-socket file at the path is never
  removed (endpoint `blocked`).
- Pref `axiosozo.agent.endpoint.enabled` (default `true`) is the kill switch.
  Private-browsing-only sessions still run the endpoint, but private windows
  and their tabs are invisible to every method.
- Framing: UTF-8 JSON, one object per line (`\n`). Client lines ≤ 262 144
  bytes; browser lines ≤ 4 194 304 bytes. A longer line, invalid UTF-8 or
  invalid JSON closes the connection. At most 8 concurrent connections and 16
  outstanding requests per connection; idle connections close after 10 minutes.

## 2. Hello

The first client line is

```json
{"v":1,"type":"hello","client":{"name":"axiosozo-notify","agent":"claude-code","version":"1"},"cwd":"/abs/path","pid":1234}
```

- `client.name` ∈ `axiosozo-notify`, `agent-bridge`; `client.agent` ∈
  `claude-code`, `codex`, `other`; `version` ≤ 32 chars; `cwd` absolute
  ≤ 4096; `pid` positive integer (informational, never trusted).
- The browser answers `{"v":1,"type":"welcome","session":"s_<16 hex>","project_id":<id|null>,"approval":"not_required"|"pending"}`.
  `project_id` is the known project whose root contains `cwd`, else `null`.

## 3. Status reports (`axiosozo-notify`)

After `welcome` (approval `not_required`), the client sends one line

```json
{"v":1,"type":"hook","source":"claude-code","event":"Stop","cwd":"/abs/path","payload":{…}}
```

and the browser answers `{"v":1,"type":"ack","matched":true|false}` and
closes. `payload` is the raw hook JSON (≤ 64 KiB) and is parsed only by
`parseHookEvent` (workstation-v1 §5). Reports for folders outside every known
project are acknowledged with `matched:false` and dropped. At most 30 reports
per minute are accepted; more are acknowledged and dropped.

## 4. Bridge sessions (`agent-bridge`)

After `welcome` with `approval:"pending"`, the browser shows one Zen-native
notification in the most recent normal window: "**Claude Code** in
**DomuCortex** wants to use this browser" with *Allow for this session* and
*Deny*. It then sends `{"v":1,"type":"approval","granted":true|false}`. No
answer within 120 s is a denial. The grant lives as long as the connection;
the user can revoke it from the project home or the notification, which
closes the connection. Requests before a grant fail with `NOT_APPROVED`.

Requests: `{"v":1,"id":<int>,"method":"…","params":{…}}`. Replies:
`{"v":1,"id":<int>,"result":…}` or `{"v":1,"id":<int>,"error":{"code":"…","message":"…"}}`.

### 4.1 Read methods

| Method | Params | Result |
| --- | --- | --- |
| `tabs.list` | `{}` | `[{ tab_id, url, title, active, project_id, engine }]` — non-private tabs of every normal window; `engine` `gecko`/`chromium`; `tab_id` opaque `t_<int>` |
| `tabs.active` | `{}` | one tab object or `null` |
| `project.info` | `{}` | the session project: `{ project_id, name, root, apps: [{ app, environments: [{ name, base_url }] }], integrations: [{ id, name }] }` or `null`. Never account labels. |
| `console.errors` | `{ tab_id }` | `{ count, messages: [{ level: "error"\|"warning", text, source, line, at }] }` (≤ 50 messages, text ≤ 1000 chars). Gecko tabs only; Chromium tabs → `UNAVAILABLE`. |
| `tabs.screenshot` | `{ tab_id, max_width? }` | `{ mime: "image/png", width, height, data_base64 }` of the visible viewport, downscaled to `max_width` (default 1280, ≤ 1920), ≤ 2 MiB decoded |
| `tabs.open` | `{ url }` | `{ tab_id }` — http(s) only, opened in a new background tab of the session project's container (or the default container without a project) |

### 4.2 Act methods (each needs a visible in-browser confirmation)

| Method | Params |
| --- | --- |
| `tabs.navigate` | `{ tab_id, url }` (http(s) only) |
| `page.click` | `{ tab_id, selector }` (CSS selector ≤ 512 chars) |
| `page.type` | `{ tab_id, selector, text }` (text ≤ 4096 chars; never into `input[type=password]`) |

- Only tabs of the session's project (by URL match or project container) may
  be acted on (`NOT_IN_PROJECT` otherwise). No project → `NO_PROJECT`.
- Never private tabs (`PRIVATE`), never hosts in a sensitive category
  (`BLOCKED_CATEGORY`, `isSensitiveHost`), never privileged URLs.
- The confirmation is a chrome-owned notification on that tab naming the
  agent, the action and its target; *Allow once* / *Deny*. Denial or 60 s
  without answer → `DENIED`.

### 4.3 Error codes

`NOT_APPROVED`, `UNKNOWN_METHOD`, `INVALID_PARAMS`, `UNKNOWN_TAB`, `PRIVATE`,
`BLOCKED_CATEGORY`, `NOT_IN_PROJECT`, `NO_PROJECT`, `DENIED`, `UNAVAILABLE`,
`TOO_LARGE`, `TIMEOUT`, `BUSY`.

## 5. MCP surface (`packages/agent-bridge`)

A stdio MCP server (JSON-RPC 2.0, protocol version `2025-06-18`), no runtime
dependencies, written against the MCP specification. It connects to the
channel lazily on the first tool call and maps tools 1:1:
`browser_list_tabs`, `browser_active_tab`, `browser_project_info`,
`browser_console_errors`, `browser_screenshot` (MCP `image` content),
`browser_open_url`, `browser_navigate`, `browser_click`, `browser_type`.
Channel errors become tool results with `isError: true` and the code in the
text. Config snippets: Claude Code `.mcp.json` / `claude mcp add`, Codex
`config.toml` `[mcp_servers.axiosozo]`.

## 6. Chromium tabs

CDP for Chromium tabs is only available through the CEF workstream's API.
Until `contracts/cef-v1.md` offers it, every method on a Chromium tab other
than `tabs.list`/`tabs.active` returns `UNAVAILABLE`. Requirement recorded
for the CEF workstream: a chrome-side `EngineRegistry` call that returns
console errors and a viewport PNG for a Chromium tab, and per-container
request contexts (P2).

## 7. Changelog

- 2 October 2026 — created for Plan 4.
