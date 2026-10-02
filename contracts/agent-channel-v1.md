# Local agent channel, version 1 (P3 status, P4 agent bridge)

Owner: integration lead. One local channel connects the running browser to
the user's coding agents: `axiosozo-notify` (status reports, P3) and the
`packages/agent-bridge` MCP server (browser tools, P4). It is not an
automation protocol. Gecko automation must use the pinned WebDriver BiDi
implementation with native browser ownership and privacy checks. No invented
BiDi-equivalent protocol or public remote-debugging listener substitutes for it.
Chromium tabs are reached only through the CEF workstream's API (see §6).
Step 4 exposes status reports and approval/session lifecycle only; every P4
method remains UNAVAILABLE until Step 8 installs and verifies its native adapter.

## 1. Transport

- A **Unix domain socket** owned by the browser (`nsIServerSocket.initWithFilename`),
  mode `0600`, in a directory of mode `0700`. Web content cannot reach it, and
  there is no TCP listener.
- Native path: the current canonical profile directory plus `/.a/s`, at most
  100 UTF-8 bytes. No path preference, actor-supplied pathname, shortened alias
  or fallback profile is accepted. Long profile paths make the endpoint
  unavailable. Generated client snippets bind `AXIOSOZO_AGENT_SOCKET` to this
  exact verified path. Legacy client fallback `~/.axiosozo/run/agent.sock`
  does not discover this endpoint; use the generated configuration.
- A checksum-pinned helper supplies exact UID/type/mode/inode/link facts and
  retains a nonblocking flock lease. The directory is owned by the current UID
  and mode 0700; the socket is 0600. Existing live endpoints are not adopted.
  Stale unlink requires the same verified socket identity under the owned lease;
  unknown paths, changed identities and non-sockets are preserved and refused.
- `axiosozo.agent.endpoint.enabled` defaults false. Every browser process starts
  disabled; only an explicit action in a current registered normal window enables
  this process's endpoint. Saved preferences alone never start it. Private-only
  startup creates no endpoint. An already enabled process can retain the listener
  after its normal window closes, but private windows cannot present approvals,
  expose activity or supply tab data.
- Enable/disable operations are serialized. Startup, listener loss and cleanup
  publish authoritative states (`disabled`, `starting`, `listening`, `in_use`,
  `blocked`, `unavailable`). `CLEANUP_INCOMPLETE` retains owned handles/claims and
  blocks rebinding; explicit retry must finish their cleanup first. A socket
  disappearing is not evidence of a waited child. Native diagnostic receipts
  describe owned waits, not guaranteed OS exit status or universal group cleanup.
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
answer within 55 s is a denial. The grant lives as long as the connection;
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

## 7. Browser ownership and status presentation

One process service owns the endpoint and bounded validated project cache.
Construction and activity reads spawn nothing. Project mutations invalidate
channel authority synchronously before their first await, revoke sessions and
cancel prompts. Only global quiescence after all pending project/container writes
and cleanup can refresh the cache. The loader checks routing/container generations
and pending/failure quarantine before and after its read. Failed or stale reads
leave the cache unavailable, never an authoritative intermediate snapshot.

A normal-window presenter must return literal true for approval. Closing,
revoking, expiry, project mutation or shutdown cancels the presentation; late
responses cannot grant. Status acceptance does not wait for notification clicks.
Only parsed records for a current known project root enter RAM history: 24 hours,
20 records per project, 128 projects and 2,560 records globally. Unavailable cache
hides history; verified refresh purges removed or changed roots. Notification
text is rendered as text, never markup. Short agent titles may contain user data;
the parser is a bound, not a general secret scrubber.

Read-only ownership diagnostics count a verified live endpoint claim in
`pending_claims` until its cleanup releases that claim. A listening single
endpoint therefore retains one claim; successful disablement retains zero. The
counts distinguish active ownership from failed cleanup. Persistent lock-helper
wait and lease-release receipts describe those owned handles only; they do not
certify arbitrary descendant or transient-process cleanup.

Return actions use a native captured tab/navigation/project/container identity
and revalidate it at the action. A hook's URL, path, title or PID cannot grant a
navigation action. Without a current safe target, return to the known project
home. No unsolicited reload is allowed.

Hook configuration is copyable only for a listening verified endpoint and a
verified installed copy of the shipped notify script. Claude Code command hooks
use direct `command` plus `args`; Codex `notify` uses an argv array in user-level
configuration. No provider configuration is read, installed or executed by the
browser. These shapes follow the [Claude hook reference](https://code.claude.com/docs/en/hooks#command-hook-fields)
and [Codex configuration reference](https://developers.openai.com/codex/config-reference/),
checked 2 October 2026. Live provider integration remains NOT_AUTHORIZED.

## 8. Changelog

- 2 October 2026 — created for Plan 4.

- 2 October 2026 — Step 4 current-profile path, explicit session enablement,
  55-second approval, owned cleanup and quiescent project authority.
