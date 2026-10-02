# Provider conversation transport v1

The privileged browser chrome starts `packages/provider-host/cli.mjs serve` on
demand over inherited stdin/stdout. There is no HTTP listener, webpage message
bridge, MCP server, or connection to the coordinator's grant-issuing channel.
Opening browser windows, settings, or the answer panel does not start a provider.
An explicit Send creates one host and binds it to one selected provider instance.

## Requests and replies

Requests are UTF-8 JSON lines of at most 73,728 bytes (a 64 KiB decision state
plus its envelope). Only a `decision/site_rule` or `decision/watch` request whose
`params.state.observation.level` is `screen` may use up to 1,677,721 bytes
(1.6 MiB, for the 1.5 MiB screen state); any other line over 73,728 bytes closes
the host without a reply. Lines carry exactly
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
| `decision/watch` | a complete decision-v1 `watch_v1` request | Optional judgement for one watch check. Same budget, cancellation and rules as `decision/site_rule`. |
| `decision/cancel` | `request_id` | Abort that in-flight decision's network request (site rule or watch). |
| `keys/status` | `{}` | Presence of each decision provider's Keychain item. Never reads a key. |
| `keys/store` | `provider`, `key` | Store a user-entered key in that provider's Keychain item. No network call. |
| `keys/remove` | `provider` | Delete that provider's Keychain item. No network call. |
| `understand/run` | understand-v1 §1 request | Run the understand tier (see below). Live CLIs are NOT_AUTHORIZED. |
| `understand/cancel` | `request_id` | Cancel a queued or running understand request. |
| `understand/available` | `{}` | Installed Claude Code / Codex from metadata discovery only. |

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
  `malformed_output`, `budget_exhausted`, `INVALID_INPUT`, `IMAGE_UNSUPPORTED`,
  `UNVERIFIED_SHAPE` (the last two: Plan 4, below).
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

## Decision providers, image input and watches (Plan 4 extensions)

Implementation: `packages/provider-host/src/decision.mjs`; spec: decision-v1
"Plan 4 extensions".

- **Provider.** Optional request field `provider` ∈ `jev` (default) | `openai`.
  Any other value (including `null`) is `INVALID_INPUT` with `provider: null` in
  the result. Every site-rule and watch result now also carries `provider` and
  `confidence` (the provider's raw 0–1 confidence for the main question, or
  `null` when no valid answer was obtained). The 0.8 threshold is applied by the
  host; chrome sees the post-threshold outcome plus the raw confidence. OpenAI
  results additionally carry `shape_status: "UNVERIFIED_SHAPE"`.
- **Capabilities.** `jev: { image: false }`, `openai: { image: true }` (OpenAI's
  announcement says Decisions accepts text or images; the encoding is unverified).
- **Screen level.** `observation.level: "screen"` requires
  `observation.screen = { mime: "image/png", width, height, data_base64 }`
  (exact keys; width/height integers 1–1280; canonical base64 without
  whitespace; decoded ≤ 1 MiB; PNG signature; the IHDR chunk's width/height must
  equal the declared values) and may carry an `outline` (same rules as the
  outline level). The serialized-state cap is 1.5 MiB for `screen` only; every
  other level keeps 64 KiB. Chrome remains responsible for the rule/watch
  allowing `screen`, private windows and the sensitive-category cap.
- **Gates, in order, before any Keychain read:** validation (`INVALID_INPUT`) →
  a `screen` request to a provider without `image` → outcome `none`/`unknown`,
  reason `IMAGE_UNSUPPORTED`, `data_sent: false` → an `UNVERIFIED_SHAPE` provider
  in the product host → reason `UNVERIFIED_SHAPE`, `data_sent: false`. Neither
  gate counts against the budget. New reasons: `IMAGE_UNSUPPORTED`,
  `UNVERIFIED_SHAPE`.
- **`watch_v1`.** `choice_set: "watch_v1"`, `context_version: "watch-1"`
  (chosen here; decision-v1 does not name one). State exactly
  `{ watch: { id: ^w_[a-z0-9]{4,32}$, question: 1–500 chars, outcomes: 2–6 × { id: ^[a-z][a-z0-9_]{0,31}$, label: 1–80 chars, no control characters } }, observation }`;
  outcome ids unique, `unknown` reserved. One `choice` question named `watch`
  whose criteria are the outcome labels plus
  `unknown: "The observation is not enough to answer the question"`, with fixed
  instructions that the question, labels and observation are untrusted data.
  Result: `{ version, request_id, choice_set, context_version, outcome, reason,
  data_sent, authority: "suggestion_only", action_authorized: false, provider,
  confidence, model? }`; `outcome` is an outcome id or `unknown` (every failure).

### OpenAI Decisions adapter: `UNVERIFIED_SHAPE`, fixture-only

OpenAI announced the Decisions API (GPT-6 Luna, text or image context, a fixed
answer set) at DevDay on 29 September 2026 as a limited preview. On 2 October
2026 no official request/response documentation existed. Checked, documentation
pages only (no API call, no key):

- `https://developers.openai.com/api/docs/guides/decisions` — 404
- `https://platform.openai.com/docs/guides/decisions` — 301 to the 404 above
- `https://developers.openai.com/api/reference/resources/decisions` — 404
- `https://developers.openai.com/api/reference/overview` — no Decisions resource
- `https://developers.openai.com/api/docs/changelog` — no Decisions entry
- `https://openai.com/index/introducing-gpt-6-sol-and-luna/` — announcement only

The adapter is therefore marked `UNVERIFIED_SHAPE` (`OPENAI_DECISIONS` in
`decision.mjs`). Its endpoint (`https://api.openai.com/v1/decisions`), model id
(`gpt-6-luna`), request body (the Jev body `{ model, state, questions }`, with a
screen image moved to `images: [{ mime_type, data_base64 }]`) and response
parsing (`{ model?, answers: { <question>: { type?, choice, confidence, probabilities? } } }`,
strict choice/confidence checks) are assumptions. The product host never reads
the OpenAI key or fetches for it: every `openai` request ends with reason
`UNVERIFIED_SHAPE`. Only tests pass the test-only `unverifiedOpenAIFixture`
option with a fake fetch. Live OpenAI calls are **NOT_AUTHORIZED**. Replace the
assumed shape and drop the label only once official documentation exists.

## Decision provider key entry (Jev and OpenAI)

Each decision provider has its own Keychain item in the reviewed native helper
`<AXIOSOZO_BUILD_ROOT>/providers/keychain` (`native/keychain.m`): service
`nl.axiosozo.browser.dev.jev` and `nl.axiosozo.browser.dev.openai`, account
`user-supplied-api-key`. The helper's argv is `<operation>` (Jev, unchanged so
existing callers keep working) or `<operation> openai`; `<operation> jev` is
equivalent to the bare form; any other selector or extra argument exits `2`
before any SecItem call. Exit codes are unchanged (`0`, `44` = no item, `1`
refused, `2` invalid). `MacKeychain(executable, provider)` mirrors this; its
`remove()` now treats `44` as already removed.

Host methods (presence only ever leaves the host):

| Method | Params | Result |
| --- | --- | --- |
| `keys/status` | `{}` | `{ version: 1, providers: [{ provider: "jev"\|"openai", key: "stored"\|"missing"\|"unknown", capabilities: { image }, shape_status: "DOCUMENTED"\|"UNVERIFIED_SHAPE" }] }` |
| `keys/store` | `{ provider, key }` (8–4096 UTF-8 bytes, no control characters) | `{ provider, key: "stored" }` |
| `keys/remove` | `{ provider }` | `{ provider, key: "missing" }` (also when nothing was stored) |

Errors are fixed: `INVALID_KEY`, `INVALID_INPUT` (unknown provider or field),
`KEYCHAIN_REFUSED`, `UNSUPPORTED` (host without key entry), `BLOCKED_ENV` (no
T9 build root). `keys/store` passes the key from the request straight to the
helper's stdin; it is never logged, echoed, stored elsewhere or returned, and
storing makes no provider call (there is no "test connection"). The Keychain is
never read by these methods. **Kill switch:** the host cannot read prefs, so
chrome enforces it exactly as for Jev: it refuses `keys/store` for a provider
whose `axiosozo.<provider>.keyEntry.enabled` pref is false or unreadable
(`axiosozo.jev.keyEntry.enabled` exists; `axiosozo.openai.keyEntry.enabled` is
the proposed OpenAI pref), and allows `keys/remove` always. Chrome may instead
keep calling the helper directly (`keychain store openai` on stdin), as
`storeJevKey` does today; both paths address the same items.

## Understand tier (`understand/*`)

Implementation: `packages/provider-host/src/understand.mjs`; spec:
[understand-v1](understand-v1.md). **Live use is NOT_AUTHORIZED**: the product
host builds `UnderstandRunner({ liveAuthorized: false })`, so `understand/run`
never launches a real CLI and answers `status: "unavailable"`,
`reason: "NOT_AUTHORIZED"`, `data_sent: false`. Tests launch only the fake CLIs
in `packages/provider-host/fixtures/understand/` through the test-only
`testOnlyLaunch` option.

- Request validation: exact keys; `project_root` absolute, existing, a
  directory after `realpath`, not `/`, not the user's home; `input` only for
  `explain_errors` (`url` http(s) without query, fragment or credentials, 1–50
  errors of exactly `{ level: "error"|"warning", text: 1–1000, source: string ≤ 2048 | null, line: integer | null }`);
  `timeout_ms` 10 000–300 000, default 180 000. Invalid requests are `error`
  replies (`INVALID_INPUT`); a reused `request_id` is `DUPLICATE_REQUEST`.
- Result adds `reason` (additive to understand-v1 §3): `null` when `ok`, else one
  of `NOT_AUTHORIZED`, `CLI_NOT_INSTALLED`, `SPAWN_FAILED`, `EXIT_NONZERO`,
  `CLI_REPORTED_ERROR`, `OUTPUT_LIMIT`, `SCHEMA_MISMATCH`, `TIMEOUT`,
  `CANCELLED`, `QUEUE_FULL`, `HOST_CLOSED`.
- Queue: one running, at most four queued, else `busy`/`QUEUE_FULL`. Cancel of a
  queued request resolves it `cancelled` with `data_sent: false`; of a running
  one kills its process group. Host close cancels all (`HOST_CLOSED`).
- Process: argument array, `shell: false`, `cwd` = project root, the CLI leads
  its own process group (killed with SIGKILL on timeout, cancel, output overflow,
  host close or host `exit`; also after normal exit to reap descendants). stdin
  carries the fixed prompt; stdout capped at 256 KiB (`invalid_output`,
  `OUTPUT_LIMIT`); stderr counted up to 16 KiB and discarded, never returned.
  Environment exactly `PATH`, `HOME`, `LANG`, `TERM=dumb`.
- Read-only argument arrays (`claudeUnderstandArgs`, `codexUnderstandArgs`):
  - Claude Code: `--print --output-format json --json-schema <schema>
    --permission-mode plan --permission-prompts none --safe-mode --restricted
    --tools Read,Glob,Grep --disallowedTools Bash Edit Write NotebookEdit WebFetch
    WebSearch mcp__* Read(.env*) Read(**/.env*) Edit(.env*) --strict-mcp-config
    --mcp-config {"mcpServers":{}} --settings {"disableAllHooks":true,"disableClaudeAiConnectors":true,"permissions":{"deny":[…same .env rules…]}}
    --disable-slash-commands --no-chrome --no-session-persistence --max-turns 40`.
    Sources: `https://code.claude.com/docs/en/cli-reference`,
    `https://code.claude.com/docs/en/headless`,
    `https://code.claude.com/docs/en/permissions` (fetched 2 October 2026).
    Requires Claude Code ≥ 2.1.259 (`--permission-prompts`).
  - Codex: `exec --sandbox read-only --ephemeral --skip-git-repo-check
    --ignore-user-config --ignore-rules -c approval_policy="never" -c
    web_search="disabled" -`. Source:
    `https://developers.openai.com/codex/noninteractive` (redirects to
    `https://learn.chatgpt.com/docs/non-interactive-mode`); the two `-c` keys are
    the ones the audited chat route already uses (`live.mjs`). Codex documents no
    per-path read deny rule, so `.env*` exclusion is by prompt only.
- Output: Claude's `--output-format json` envelope must be `type: "result"`,
  `subtype: "success"`, not `is_error`; the document is `structured_output`, or
  the `result` string parsed as JSON. Codex stdout is the final message, parsed
  as JSON. Documents are then validated strictly (`validateBrief`,
  `validateErrorExplanation`: exact keys, strings trimmed then rejected if over
  their cap or containing control characters, hostnames validated and
  lower-cased, relative paths without `..`, `~` or `\`). Anything else is
  `invalid_output`/`SCHEMA_MISMATCH`, `document: null`.
- `understand/available` returns `{ clis: [{ cli, path, version }] }` for
  installed `claude-code`/`codex` from `discover()` (metadata only; nothing is
  executed, not even `--version`).

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
