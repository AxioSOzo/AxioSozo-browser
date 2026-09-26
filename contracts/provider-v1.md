# Provider conversation transport v1

The privileged browser chrome starts `packages/provider-host/cli.mjs serve` on
demand over inherited stdin/stdout. There is no HTTP listener, webpage message
bridge, MCP server, or connection to the coordinator's grant-issuing channel.
Opening browser windows, settings, or the answer panel does not start a provider.
An explicit Send creates one host and binds it to one selected provider instance.

## Requests and replies

Requests are UTF-8 JSON lines of at most 65,536 bytes, with exactly
`{version:1,id,method,params}`. Request IDs are unique within the host process.
The host accepts at most eight outstanding requests and 1,024 requests before a
new session is needed. Unknown fields and methods are rejected.

| Method | Parameters | Meaning |
| --- | --- | --- |
| `session/open` | `driver`, `instance_id`, `session_id` | Open one official-client session. Drivers are `codex`, `claude-code`, and `antigravity`; actual availability is checked before launch. |
| `turn/start` | `session_id`, `turn_id`, `text` | Send user text of at most 32 KiB to the bound instance. |
| `turn/cancel` | `session_id`, `turn_id` | Interrupt that exact active turn. Acceptance does not establish cancellation completion. |
| `session/close` | `session_id` | Close and reap the owned client. |

Replies are `{version:1,id,result}` or
`{version:1,id,error:{code,message}}`. Only fixed, typed diagnostics may reach the
UI; raw client stderr, credentials, environment, and launch command lines do not.
The browser creates instance/session/turn IDs. The host creates an opaque account
binding; that binding is not a verified email address or account identifier.
Changing providers creates a new session and never silently migrates context.
The open reply labels fixtures `TEST_FIXTURE` and real routes `EXPERIMENTAL_LIVE`.

## Streaming and lifecycle

Unsolicited events are `{version:1,event}`. Adapter events carry their immutable
driver, instance, session and account binding, a unique event ID, the active turn
and request IDs, and a `type`. The adapter verifies the full binding; the UI checks
its session and active turn before accepting
`text_delta` or `turn_finished`. Fixture events retain `TEST_FIXTURE`; an actual
client route is experimental until its runtime evidence has been recorded.

Host errors may emit a scoped `session_error` with the session ID, active turn ID
and a fixed reason. Text is displayed as inert text, never privileged markup or commands.
Turns have a two-minute deadline and a four-MiB cumulative answer limit. An idle
host emits `host_idle` and closes after two minutes. A later Send starts a fresh
ephemeral conversation. The native broker has a fifteen-minute lifetime ceiling.
EOF, window close, output overflow, or protocol failure closes owned processes.
Uncertain turns are never retried automatically.

## Authority and context

The host accepts no executable, working directory, environment, sandbox policy,
credential, browser grant, or arbitrary tool name from JSONL requests. Reviewed
driver-specific launch code chooses those values. Official clients own their
authentication; the browser and Node host do not parse personal credential files.
Merely finding an installed CLI does not establish authentication or protocol
compatibility.

Provider turns cannot issue browser commands or acquire coordinator grants.
Sharing page context is a separate explicit UI choice, bound to the actual active
engine and tab. Retained Gecko content is not Chromium content. Private windows
cannot start a persistent provider session. Provider output never authorizes an
action, changes engines, or widens the page context selected by the user.

Native launch restrictions and the supported official client flags are documented
in `docs/PROVIDERS.md`. This contract is an implementation boundary, not a claim
that any live authentication or model request has passed.
