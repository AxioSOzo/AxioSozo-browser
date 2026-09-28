# Provider conversation transport v1

The privileged browser chrome starts `packages/provider-host/cli.mjs serve` on
demand over inherited stdin/stdout. There is no HTTP listener, webpage message
bridge, MCP server, or connection to the coordinator's grant-issuing channel.
Opening browser windows, settings, or the answer panel does not start a provider.
An explicit Send creates one host and binds it to one selected provider instance.

## Requests and replies

Requests are UTF-8 JSON lines of at most 73,728 bytes (a 64 KiB decision state
plus its envelope), with exactly
`{version:1,id,method,params}`. Request IDs are unique within the host process.
The host accepts at most eight outstanding requests and 1,024 requests before a
new session is needed. Unknown fields and methods are rejected.

| Method | Parameters | Meaning |
| --- | --- | --- |
| `session/open` | `driver`, `instance_id`, `session_id` | Open one official-client session. Drivers are `codex`, `claude-code`, and `antigravity`; actual availability is checked before launch. |
| `turn/start` | `session_id`, `turn_id`, `text` | Send user text of at most 32 KiB to the bound instance. |
| `turn/cancel` | `session_id`, `turn_id` | Interrupt that exact active turn. Acceptance does not establish cancellation completion. |
| `session/close` | `session_id` | Close and reap the owned client. |
| `decision/site_rule` | a complete decision-v1 `site_rule_v1` request | Optional Jev judgement for one site-rule checkpoint. Needs no session and never starts a provider client. |
| `decision/cancel` | `request_id` | Abort that in-flight decision's network request. |

Replies are `{version:1,id,result}` or
`{version:1,id,error:{code,message}}`. Only fixed, typed diagnostics may reach the
UI; raw client stderr, credentials, environment, and launch command lines do not.
The browser creates instance/session/turn IDs. The host creates an opaque account
binding; that binding is not a verified email address or account identifier.
Changing providers creates a new session and never silently migrates context.
The open reply labels fixtures `TEST_FIXTURE` and real routes `EXPERIMENTAL_LIVE`.

## Decisions (`decision/site_rule`)

Chrome reaches Jev only through this host; see [decision-v1](decision-v1.md) for
the request, the result and the fixed choice texts. The host is started on demand
by `ProviderDecision.sys.mjs` (`createDecide`) when an eligible checkpoint fires,
reused for later checkpoints, and exits at the normal two-minute idle.

```json
{"version":1,"id":"<envelope id>","method":"decision/site_rule","params":{"version":1,"request_id":"req_1","choice_set":"site_rule_v1","context_version":"site-rule-1","deadline_ms":1790000000000,"state":{…}}}
{"version":1,"id":"<envelope id>","result":{"version":1,"request_id":"req_1","choice_set":"site_rule_v1","context_version":"site-rule-1","outcome":"none","reason_code":null,"reason":"disabled","data_sent":false,"authority":"suggestion_only","action_authorized":false}}
```

- `params` is the decision-v1 request verbatim. The host validates it strictly
  (exact keys at every level, state ≤ 64 KiB, outline ≤ 200 items of ≤ 200
  collapsed characters with `^o[0-9]{1,4}$` IDs, path without query or fragment,
  level `none` refused, no `outline` at level `address`, 1–3 unique effects).
  An invalid request is a **result**, not an error: outcome `none`, reason
  `INVALID_INPUT`, `data_sent: false`, `request_id` echoed only when valid.
- Every decision failure is a result with outcome `none`; `error` replies are
  reserved for envelope problems (unknown envelope fields, replayed `id`,
  backpressure, closed host, or a host built without decisions: `UNSUPPORTED`).
  No network request is made in any `error` case.
- A successful result adds `model: "jev-1.13.0"` and may carry a fixed
  `reason_code`; outcome `none` always has `reason_code: null`.
- Result `reason` is one of `validated`, `disabled`, `cancelled`, `timeout`,
  `BLOCKED_AUTH`, `HTTP_ERROR`, `NETWORK_ERROR`, `KEYCHAIN_ERROR`,
  `malformed_output`, `budget_exhausted`, `INVALID_INPUT`.
- The Keychain is read only after validation, never at host start. No key means
  reason `disabled` and zero network calls.
- **Budget (defense in depth).** Each host process allows at most
  `decisionsPerHour` (default 30) requests that actually reach the network in a
  rolling hour. Validation failures and missing keys do not count. When
  exhausted the result is outcome `none`, reason `budget_exhausted`,
  `data_sent: false`, and no fetch occurs. Chrome's own budget remains primary;
  a host that idles out starts a fresh count.
- `decision/cancel` replies `{status:"cancelling"|"not_found",request_id}`. The
  cancelled decision still replies, normally with reason `cancelled` and an
  accurate `data_sent`. Closing the host aborts every in-flight decision.
- Chrome helper: `createDecide({ runtime?, onSending? })` returns
  `decide(request, { signal }) → Promise<result>` plus `decide.close()`. It never
  rejects. `onSending({ request_id, level })` runs before the request leaves
  chrome; if it throws, nothing is sent. It re-validates every reply against the
  request (outcome listed in `rule.effects`, fixed codes, authority fields,
  no extra keys). Chrome-only reasons: `HOST_UNAVAILABLE` (host missing, exited
  or silent) and `INVALID_INPUT` (shape gate or line over 73,728 bytes). When a
  request reached the host but no valid reply arrived, `data_sent` is reported
  as `true` (unknown is disclosed as sent). The host runs with only `PATH`,
  `LANG` and `AXIOSOZO_BUILD_ROOT` in its environment.

## Jev key entry (decided: ships)

Open decision 4 is decided (Wout, 28 September 2026): Jev key entry ships and is
on by default. `axiosozo.jev.keyEntry.enabled` (default `true`) remains a kill
switch; an unreadable pref fails closed. The key never passes through this host.
`storeJevKey` in `ProviderSettings.sys.mjs` writes a user-entered key only to the
stdin of the reviewed native helper `<AXIOSOZO_BUILD_ROOT>/providers/keychain store`
(the helper `MacKeychain` also uses), with a fixed `PATH`/`LANG` environment.
The key is never placed in argv, environment, prefs, files or logs, is never
returned to chrome, and the helper's output is discarded. Storing makes no Jev
call and there is no "test connection".

Chrome never runs the helper's `read`. Presence uses the helper's `exists`
operation: `SecItemCopyMatching` without any return-data/attributes flag, exit
`0` = stored, `44` = missing, anything else = refused/unknown; nothing is written
to stdout. `remove` treats `44` as already removed and is allowed even with the
kill switch on. Chrome failure codes are fixed: `INVALID_KEY`,
`JEV_KEY_ENTRY_DISABLED`, `KEYCHAIN_HELPER_UNAVAILABLE` (helper missing or not
spawnable, or no T9 build root), `KEYCHAIN_REFUSED` (helper ran and failed; also
a helper built before `exists` existed), `HELPER_TIMEOUT`, `SETTINGS_CLOSED`.

## Provider status and key actions in about:axiosozo

`ProviderStatus.sys.mjs` builds one status model for the Settings window and
the `about:axiosozo` actor (`AboutAxioSozoParent.sys.mjs`, which calls this
module directly, not `AxioSozoServices`). Its inputs are metadata discovery
(`provider-host discover`: no client is executed) and the Jev key presence
check. It never starts a client, opens login UI or contacts Jev.

| Actor method | Params | Returns |
| --- | --- | --- |
| `getProviderStatus` | `{}` | `{ version: 1, discovery: "ok"\|"unavailable", discovery_error: code\|null, model_turns_verified: false, providers: [codex, claude-code, antigravity, jev] }` |
| `getJevKeyStatus` | `{}` | the Jev entry |
| `storeJevKey` | `{ key }` (string, 8–4096 chars, no control characters) | the refreshed Jev entry (never the key) |
| `removeJevKey` | `{}` | the refreshed Jev entry |

`storeJevKey` and `removeJevKey` are refused with `PRIVATE_WINDOW` from a private
tab; other failures use the fixed codes above. Each entry is
`{ id, label, route, installed, version, expected_version, sign_in, state,
state_label, detail, verified: false }`; the Jev entry adds `key`
(`stored|missing|unavailable|unknown`) and `key_entry_enabled`.

- `route`: `official-client` (Codex, Claude Code, Antigravity) or `api-key` (Jev).
- `sign_in`: `handled-by-client-on-first-question` (Claude Code),
  `codex-login-once` (Codex: one official `codex login` for the browser profile),
  `api-key` (Jev), `not-applicable`.
- `state`: `ready` (reserved; nothing is reported ready until a model turn is
  verified), `unverified` (installed at the audited version; sign-in happens in
  the official client; not yet verified), `not-installed`, `unavailable`
  (Antigravity, version mismatch/unreadable, or no Keychain helper), `needs-key`,
  `key-stored`, `disabled` (kill switch off and no key), `unknown` (discovery or
  Keychain check failed).

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
