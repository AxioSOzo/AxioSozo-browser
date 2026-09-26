# Provider backend — 26 September 2026

AxioSozo now has an on-demand JSONL host and production launch implementations for
**Codex 0.157.1** and **Claude Code 2.1.283**. These are real official-client routes,
not fixture fallback. **Model-turn verification is still pending.** The approved diagnostic reached
Claude’s confined official authentication check, which could not use authentication;
Codex stopped at its missing instance sign-in. No model request was sent.
The browser starts a host only when the user sends a question and stops it when the
panel closes or it has been idle for two minutes. Browsing requires no provider.

| Route | Implemented | Remaining validation |
|---|---|---|
| Codex | Native official app-server; isolated configuration and official-owned authentication; streamed replies, cancellation, bounded lifecycle | One-time official login in the browser's separate Codex home; actual macOS startup/auth/model turn |
| Claude Code | Official headless client; isolated customization/cache; normal personal Pro/Max Keychain identity; empty tools/MCP; streamed replies and cancellation | Actual Keychain helper/startup/model turn in the confined process; managed/API routes intentionally unsupported |
| Antigravity | Metadata discovery and documented JSONL protocol adapter fixtures | No verified startup configuration that disables inherited tools/hooks/MCP; installed binary version not independently established |

No live provider process, login UI or model request is part of metadata discovery,
ordinary startup, fixture tests, or native sandbox tests. Never label the browser
READY from fixture results. Real macOS E1/E2 and separately authorized live checks
remain the integration gates.

## Browser-to-host protocol

Launch the fixed Node runtime with `packages/provider-host/cli.mjs serve`. It uses
owned stdin/stdout pipes only: no HTTP listener, websocket, debug port, native-message
web-content entrypoint, shell command, or client startup before an explicit Send.
The browser replaces the host environment with PATH for metadata discovery, LANG,
HOME for official Claude authentication, and AXIOSOZO_BUILD_ROOT for external state.
The host replaces the provider environment again with its own small allowlist.

Requests are one JSON object per line:

```json
{"version":1,"id":"request-1","method":"session/open","params":{"driver":"codex","instance_id":"immutable-instance-uuid","session_id":"browser-session-uuid"}}
{"version":1,"id":"request-2","method":"turn/start","params":{"session_id":"browser-session-uuid","turn_id":"browser-turn-uuid","text":"Hello"}}
{"version":1,"id":"request-3","method":"turn/cancel","params":{"session_id":"browser-session-uuid","turn_id":"browser-turn-uuid"}}
{"version":1,"id":"request-4","method":"session/close","params":{"session_id":"browser-session-uuid"}}
```

Responses are `{version:1,id,result}` or `{version:1,id,error:{code,message}}`.
Events are `{version:1,event:{...}}`; `text_delta` contains text and immutable session/
turn IDs. `turn_finished` distinguishes completed, cancelled, failed and uncertain.
Admission is not completion. `session_error` carries a bounded failure reason;
`host_idle` precedes expected idle shutdown. Unexpected process exits are uncertain
and mutating turns are never replayed. Request IDs cannot be reused.

One host owns one provider session, one turn at a time. Limits are 32 KiB prompt,
64 KiB input line, 4 MiB streamed answer, 8 simultaneous control requests, 1,024
request IDs, 120 seconds per turn and 120 seconds idle. Native broker lifetime is
15 minutes. Closing the browser while startup is pending still reaps the owned
client once it connects/fails. All protocol/parser limits remain in force.

`account_identity` is an opaque per-host binding, **not a claim that an email or
account identifier was verified**. The host never copies subscription tokens,
reads auth files, or migrates a session between provider instances. No model gets
browser, shell, filesystem or approval authority through this API. Page title/URL
is included only through the browser's explicit opt-in; webpage text is untrusted.

`fixtures/host-peer.mjs` is a separate harness entrypoint using real owned synthetic
subprocesses. It always labels results/events `TEST_FIXTURE`; the product `serve`
command has no fixture switch or fallback.

## Official clients and authentication

**Codex:** exact upstream 0.157.1 request schemas are retained in
`schemas/codex-0.157.1-requests.json`. They were downloaded from the official tagged
source without running a client. The prior generated 0.155.1 schema remains for
historical fixture regression tests. Discovery's fixture-version comparison does
not decide live eligibility; `live.mjs` checks the independently audited live pin.

0.157.1 rejects the former `untrusted` approval policy. The new route uses `never`,
read-only sandbox configuration, disabled command/hooks/plugin/app/skill capabilities,
no project instructions, and a host-controlled Codex home. Experimental
`environments: []` and `dynamicTools: []` are validated as strictly empty arrays against
the exact source because published stable schemas omit them. Empty environments
remove environment-bound tool access; independent OS confinement still applies.
Utility tools may remain in Codex; this is not a claim that its internal tool list
is literally empty. [Tagged thread fields](https://github.com/openai/codex/blob/rust-v0.157.1/codex-rs/app-server-protocol/src/protocol/v2/thread.rs),
[tagged config schema](https://raw.githubusercontent.com/openai/codex/rust-v0.157.1/codex-rs/core/config.schema.json),
[app-server documentation](https://developers.openai.com/codex/app-server).

Each browser instance uses:

```text
/Volumes/AxioSozoBuild/providers/runtime/codex/<instance-uuid>/codex-home
```

The official CLI owns its `auth.json`; AxioSozo only checks file existence and uses
app-server `account/read` to establish whether official sign-in is available,
discarding identifying fields. A missing file returns `CODEX_LOGIN_REQUIRED` and
an exact command of this form for the user to run:

```sh
CODEX_HOME="/Volumes/AxioSozoBuild/providers/runtime/codex/<instance-uuid>/codex-home" codex login
```

Run that command from the browser runtime directory or another empty directory.
The browser never opens login automatically. Different CODEX_HOME values also
change official Keychain identity; copying default-profile credentials is not a
shortcut. [Official credential ownership](https://github.com/openai/codex/blob/rust-v0.157.1/codex-rs/login/src/auth/storage.rs).

**Claude Code:** launch uses `--safe-mode --restricted --tools ""`, empty strict MCP
configuration, disabled hooks/slash commands/Chrome integration, no permission
prompts, no session persistence and JSONL input/output. Unlike bare mode, safe mode
retains subscription authentication. The exact 2.1.283 implementation supports
`CLAUDE_CONFIG_DIR` for isolated customization/output and
`CLAUDE_SECURESTORAGE_CONFIG_DIR=""` to retain the default official auth identity.
The latter is an audited internal interface, not a promised stable CLI contract;
updates fail the exact-version check until reviewed.
[CLI flags](https://code.claude.com/docs/en/cli-reference),
[credential identity](https://code.claude.com/docs/en/authentication#credential-management).

An on-demand, **network-denied** official `claude auth status` preflight retains
only categorical admission facts: loggedIn=true, authMethod=claude.ai,
apiProvider=firstParty, and subscriptionType pro/max. Other output is discarded.
Managed-policy files/cache are rejected by metadata alone. Team/Enterprise, API
keys and other credentials are unsupported because managed policy can install
HTTP/model hooks even when ordinary hooks are disabled. The browser never emits
email, organization, credentials or raw auth diagnostics.
[Managed policies](https://code.claude.com/docs/en/server-managed-settings),
[hook precedence](https://code.claude.com/docs/en/hooks#disable-or-remove-hooks).

macOS Claude reads and refreshes official credentials via `/usr/bin/security`.
The sandbox permits that exact executable as a helper, with all inherited file and
network constraints. Shell fallback remains denied; if direct official Keychain
access fails, the route fails instead of broadening execution. Only the official
client/security process handles tokens. No wrapper extracts them.

**Antigravity:** `agy --input-format stream-json --output-format stream-json` is a
real documented protocol. Native binary metadata/changelog inspection found a
1.1.28 entry, which does not prove the installed executable's version. Headless
mode auto-allows workspace file operations; terminal `--sandbox` is not an all-client
boundary. No public no-tools/no-hooks/no-customizations option was found. Custom
agent `tools: []` is a research candidate, but its empty-list semantics and inherited
startup hooks/MCP have not been established. The route returns
`ANTIGRAVITY_PROTOCOL_UNSUPPORTED`; this means safe integration is unavailable,
not that the vendor has no streaming protocol.
[Headless protocol](https://www.antigravity.google/docs/cli/headless/),
[custom agent fields](https://www.antigravity.google/docs/subagents/).

## Native runtime and evidence

All generated state is on the verified T9-backed project volume. No dependencies,
provider installers or T3 lifecycle scripts run. The Codex native executable is
resolved using its official public npm package layout, bypassing the wrapper that
forks; Claude uses its pinned user-owned native installation. Caller-supplied
executables, cwd, environment, shell strings and credentials are rejected.

The native supervisor uses a separate owned process group. Parent pipe closure,
SIGTERM/SIGINT, deadline and root-process exit terminate remaining group members;
TERM escalates to KILL. It never kills by name. The actual profile denies arbitrary
file contents and writes outside app runtime/auth scope. Codex denies fork; Claude
permits fork with only its exact executable and `/usr/bin/security` admitted for
exec. No shell, login opener, arbitrary helper or network listener is admitted.
Outbound network is enabled only for the conversation stage, with normal TLS.
Seatbelt via sandbox-exec is deprecated: this remains a development containment
implementation, not a supported signed production XPC architecture.

Validation commands (after mount-dev-storage) use external storage:

```sh
/Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- node packages/provider-host/cli.mjs setup
node packages/provider-host/cli.mjs test
/Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- node --test packages/provider-host/tests/sandbox.os.mjs packages/provider-host/tests/live.os.mjs
```

The current module run passes **61 tests**, including actual owned fixture protocol
streams, cancellation, cross-session rejection, malformed input, bounded host output,
startup cleanup and exact current schema validation. Focused host/adapter tests also
pass on the browser's pinned Node 22.22.3 runtime. All **10 native boundary tests passed**, including both execution policies,
file/configuration/shell denial, the networking lane, liveness-socket identity and
owned process-group cleanup. These are synthetic native fixtures, not actual
provider evidence. Older records remain in
[evidence/providers-verification-20260923.json](evidence/providers-verification-20260923.json).

After separate explicit live authorization, a fixed diagnostic can be run:

```sh
/Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- node packages/provider-host/cli.mjs live claude-code --authorized
```

Use `codex` for Codex and optionally `--instance-id=<browser-uuid>` to use its exact
isolated profile. The default diagnostic instance is
`00000000-0000-4000-8000-000000000001`. This is a dedicated diagnostic identity: signing
into its home does not authenticate a browser instance with a different UUID.
For browser use, select that browser instance UUID explicitly and authenticate
its exact home. The diagnostic sends only `Reply exactly AXIOSOZO_OK`,
prints completion/exact-match booleans and never dumps the reply, auth data or
stderr. Without `--authorized` it exits 78 before any client is launched.

T3 retained code is limited to pure version parsing, stderr redaction and immutable
continuation identity utilities with the MIT notice. A full T3 UI/server dependency
graph is not installed. Existing Jev and Keychain fixture work remains optional and
separate; no Jev network call, provider installation or authentication is needed to
browse. Historical provenance is in [provider-provenance.json](provider-provenance.json).

## Approved live diagnostic outcome

The 26 September approved fixed diagnostic stopped before any model request.
Codex returned `CODEX_LOGIN_REQUIRED` without launching a client. Three Claude
startup attempts reached the official network-denied auth-status command; the
latest observed results were exit 1, valid categorical status, and loggedIn=false.
That does **not** establish the normal CLI is signed out: the official implementation
also reports false when its Keychain access fails under confinement. No login UI,
page/project content, raw credentials or identity fields were exposed.

Apple’s installed profiles identified missing Keychain Mach services. The confined
Claude route now admits exactly `com.apple.SecurityServer` and
`com.apple.securityd.xpc` in addition to its previous service list. Authentication
remained unavailable. Automatic approval review rejected the proposed next retry
with login-keychain database/security-preference reads because the fixed-prompt
approval did not authorize that credential boundary. Those proposed file and IPC
allowances were reverted; no retry followed the rejection.

Safe structured results are recorded in
[provider diagnostic evidence](../packages/provider-host/evidence/live-preflight-20260926.json).
