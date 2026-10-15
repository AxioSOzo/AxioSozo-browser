# Provider backend — updated 9 October 2026

Ask AI talks to the user's own official AI clients through an on-demand JSONL host.
**There are no version pins.** A client is accepted when a *capability check* of the
exact installed executable passes: it accepts every option Ask AI passes, offers the
model no tools and no MCP servers, keeps the user's own customizations out, and answers
in a format the host's parser reads. Updated clients are re-checked automatically.
The browser starts a host only when the user sends a question and stops it when the
panel closes or it has been idle for two minutes. Browsing requires no provider.

| Route | How Ask AI runs it | Sign-in | Status on 9 October 2026 |
|---|---|---|---|
| Codex | `codex exec --json` (documented non-interactive mode), one confined process per turn | The user's own Codex sign-in (`~/.codex`), with `--ignore-user-config` | 0.162.0 checked; live "Reply OK" turns verified through `cli.mjs serve` |
| Claude Code | `claude -p` stream-json (documented headless mode), one confined process per session | The user's own Claude Code Keychain sign-in (personal Pro/Max) | 2.1.295 checked; live turn verified through `cli.mjs serve` |
| Antigravity | not used | — | 1.3.2 installed; refused: no option turns off its tools (measured) |

No model request, login UI, MCP server or hook is started by discovery, the capability
check, setup or the deterministic tests. Live turns happen only on an explicit Send.

## Accepting client updates (capability check)

`packages/provider-host/src/checks.mjs`, run by `cli.mjs clients` (AI & keys, Provider
settings) and again at every session start:

1. **Resolve the executable** from installation metadata, without executing anything:
   the Codex npm wrapper is followed to its native binary (a standalone native install is
   used as is); the executable must be user-owned and not writable by others. Its
   fingerprint is (realpath, device, inode, size, mtime).
2. **Ask the executable its version** (`--version`, inside the sandbox, network denied).
3. **Run one offline Ask AI turn** with the *exact* production argv, under the *exact*
   sandbox profile, with network limited to 127.0.0.1, against a loopback stand-in for the
   model API (`src/fake-model.mjs`). The client gets a synthetic home with planted
   customizations (global/project instructions, a skill, hooks, a config with an MCP
   server) and, for Claude, a placeholder API key; no real credential is visible to it.
   The check passes only if:
   - every option is accepted (clap and commander name a refused flag; Codex runs with
     `--strict-config`, which names any `-c` key it does not know);
   - the request the client sent to the stand-in offers **no tools**;
   - **no planted marker** reached the model input (and, for Codex, our own instructions did);
   - the host's own stream parser (the real adapter) reads the expected answer.
4. **Cache** the outcome in `<build root>/providers/client-checks.json` under the
   fingerprint, the reported version and a hash of the argv and profile templates. A new
   executable (an update), a new version or a change to AxioSozo's argv/profile re-checks.
5. **Sign-in** is never cached and never read by the host: Codex counts as signed in when
   its own `~/.codex/auth.json` exists (existence only); Claude Code is asked through its
   own network-denied `claude auth status`, of which only `loggedIn`, `authMethod`,
   `apiProvider` and `subscriptionType` are kept.

Tolerance: unknown event types and fields are ignored by both parsers, and Codex's
non-fatal `error` (reconnect) events are not failures. If a Codex config key of ours is no
longer known to the installed Codex (for example a renamed feature flag), the check drops
it and runs again; the request inspection then decides whether Ask AI is still isolated
without it (a dropped key is listed in the status). Our own instructions file
(`model_instructions_file`) and every command-line flag are never dropped.

Measured on 9 October 2026 (offline, no model call): Codex 0.162.0 check 0.1–0.4 s,
Claude Code 2.1.295 check 0.2–0.3 s plus 0.15 s sign-in question; cached `clients` run
0.7 s in total. `tests/checks.os.mjs` proves the refusals against the real clients:
Codex with the shell tool on (`TOOLS_NOT_DISABLED exec_command, write_stdin`), an unknown
flag or `-c` key (`OPTION_REJECTED` by name), project instructions on
(`INSTRUCTIONS_NOT_ISOLATED project`); Claude Code with default tools, an unknown flag, an
invalid choice (`--permission-prompts`) or without `--safe-mode/--restricted`.

## Which providers are connected (status model)

Settings (Cmd+,) and `about:axiosozo` show the same per-provider status from
`apps/browser/chrome/ProviderStatus.sys.mjs`, built from the capability-check report
(validated by `ProviderSettings.validateClientChecks`) or, if the check cannot run, from
installation metadata. Nothing is ever shown as *Ready*: a passed check is not a claim
that an answer through this browser was verified.

| State | Shown as (example) | Meaning |
|---|---|---|
| `checked` | Codex 0.162.0 · checked | This exact install passed the check; sign-in present (or checked at Send) |
| `needs-sign-in` | Needs sign-in in Codex | Passed, but the client is not signed in (`codex login` / `claude` in Terminal) |
| `incompatible` | Claude Code changed an option we use (--permission-prompts) | The check refused this version; Ask AI is off for it until AxioSozo is updated |
| `unavailable` | Antigravity 1.3.2 · not usable for Ask AI | Cannot be confined, managed policy, unsupported account/platform, no broker |
| `unverified` | Installed · not checked yet | Metadata only: the check did not run |
| `not-installed` | Not installed | Official client not on the discovery PATH |
| `needs-key` / `key-stored` / `disabled` | No key stored / Key stored / Turned off | Jev or OpenAI decision keys |
| `unknown` | Could not check Codex 0.162.0 | The check or discovery failed |

## Jev key (open decision 4: ships)

Wout decided on 28 September 2026 that Jev key entry ships. It is on by default;
`axiosozo.jev.keyEntry.enabled=false` is a kill switch. Add, replace or remove the
key in Settings → Jev or in `about:axiosozo` → AI & keys. The key goes once to the
native helper's stdin and is stored only in the macOS Keychain (service
`nl.axiosozo.browser.dev.jev`, this device only). It is never shown again, never
returned to chrome, and storing it makes no Jev call. Chrome checks only presence
with the helper's `exists` operation; it never runs `read`.

Native status: `store`, `remove` and `read` against the login Keychain have not
been exercised natively with a real key (only the empty-search-list negative
build and a separate private-keychain positive fixture). `exists` is new: its
source passes `provider-host check` (clang `-fsyntax-only -Werror`), but the helper
on the build volume must be rebuilt with `provider-host setup` before presence
works; until then Settings shows "Status unknown", and without a built helper it
shows "Keychain helper not available in this build".

## Browser-to-host protocol

Launch the fixed Node runtime with `packages/provider-host/cli.mjs serve`. It uses
owned stdin/stdout pipes only: no HTTP listener, websocket, debug port, native-message
web-content entrypoint, shell command, or client startup before an explicit Send.
The browser replaces the host environment with PATH for metadata discovery, LANG,
HOME (where the clients keep their own sign-in; a location only), and AXIOSOZO_BUILD_ROOT
for external state.
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
turn IDs. `turn_finished` distinguishes completed, cancelled, failed and uncertain, and
may carry a fixed `reason` (`RATE_LIMITED`, `PROVIDER_AUTH`, `PROVIDER_ERROR`,
`PROVIDER_TOOLS_ENABLED`, `PROCESS_EXIT`, `INVALID_PROTOCOL`), never provider text.
`session/open` fails with `CLIENT_INCOMPATIBLE` (the check refused this version, with the
exact reason in the message), `CODEX_LOGIN_REQUIRED`, `BLOCKED_AUTH` or
`ANTIGRAVITY_PROTOCOL_UNSUPPORTED` before anything is sent.
Admission is not completion. `session_error` carries a bounded failure reason;
`host_idle` precedes expected idle shutdown. Unexpected process exits are uncertain
and mutating turns are never replayed. Request IDs cannot be reused.

One host owns one provider session, one turn at a time. Limits are 32 KiB prompt,
64 KiB input line, 4 MiB streamed answer, 8 simultaneous control requests, 1,024
request IDs, 120 seconds per turn and 120 seconds idle. Native broker lifetime is
15 minutes per Claude session and 150 seconds per Codex turn process. Closing the browser while startup is pending still reaps the owned
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

**Codex** runs as `codex exec --json --ephemeral --skip-git-repo-check --ignore-user-config
--ignore-rules --strict-config --sandbox read-only -c … -` with the prompt on stdin
(`launch.mjs codexExecArguments`). The `-c` overrides turn off approvals, web search,
project docs, notify, MCP servers, agents, plan/user-input tools, extra instruction
blocks and 22 features (shell, unified exec, view image, multi-agent, goals, apps,
plugins, hooks, code-mode host, image generation, browser/computer use, skills,
memories, shell snapshot, unbounded retries…), and replace Codex's base instructions with
Ask AI's own (`model_instructions_file`). No model id is passed: the account default is
used. `CODEX_HOME` is the user's own `~/.codex`, used for its sign-in only:
`--ignore-user-config` skips `config.toml`, and the sandbox denies reading or writing
`AGENTS.md`, `AGENTS.override.md`, `config.toml`, `hooks.json`, `skills`, `rules`,
`plugins`, `prompts`, `bin` and `mcp.json` there. With `--ephemeral` Codex records no
thread in its state database (checked on a synthetic home). A missing `auth.json`
returns `CODEX_LOGIN_REQUIRED` ("run `codex login` in Terminal"); the host never opens
the file. The former browser-owned `CODEX_HOME` per instance (and its separate
`codex login`) is gone; copying or linking credentials was never an option because
Codex rotates refresh tokens.

Why exec and not `codex app-server`: exec is Codex's documented non-interactive surface;
only exec has `--ignore-user-config` (the safe way to use the user's sign-in without
their MCP servers and hooks); exec flags are validated by the client itself (clap,
`--strict-config`), which makes the capability check precise; a process per turn gives a
strictly bounded lifecycle; and the app-server protocol is marked experimental and very
large (105 stable / 170 experimental requests in 0.162). The cost: an exec answer arrives
whole rather than token by token, and each turn starts a process (~0.4 s to
`thread.started`). Exec keeps no state between turns (`--ephemeral`), so the adapter
carries a bounded transcript (24 KiB, oldest turns dropped) of the session in the next
prompt; nothing is written to the user's Codex history. Stop sends SIGTERM to the
confined process group. Tool items (`command_execution`, `file_change`, `mcp_tool_call`,
…) end the turn as `PROVIDER_TOOLS_ENABLED`; `turn.failed` maps to the fixed reasons
`RATE_LIMITED`, `PROVIDER_AUTH` or `PROVIDER_ERROR`.

**Claude Code** runs `--safe-mode --restricted --print --input-format stream-json
--output-format stream-json --include-partial-messages --verbose --tools "" …
--strict-mcp-config --mcp-config '{"mcpServers":{}}' --settings
'{"disableAllHooks":true,…}' --disable-slash-commands --no-chrome --permission-prompts none
--no-session-persistence` (`launch.mjs claudeArguments`), no model id (account default).
`CLAUDE_CONFIG_DIR` points into the private run directory and
`CLAUDE_SECURESTORAGE_CONFIG_DIR=""` keeps the default Keychain identity; this is an
internal interface, so the session start re-asks `claude auth status` under exactly this
environment and stops with `BLOCKED_AUTH` if it no longer sees the sign-in. The adapter
also stops a turn (`PROVIDER_TOOLS_ENABLED`) if the client's own `system/init` lists any
tool or MCP server. Only personal Pro/Max claude.ai sign-in is admitted; API keys,
team/managed accounts and managed-policy files are refused (managed policy can install
hooks).

**Antigravity** (`agy` 1.3.2) is refused with `ANTIGRAVITY_PROTOCOL_UNSUPPORTED`. Two
authorized live runs on 9 October 2026, in the sandbox, with a workspace custom agent
declaring `tools: []`, and then `excludeDefaultComponents: true` / `inheritMcp: false`,
both reported 60 tools in `init` (including `run_command`, `write_to_file`,
`execute_browser_javascript`, `call_mcp_tool`, `search_web`), and agy has no tool
allowlist flag. Its sign-in also needs `/usr/bin/security`, loopback listening and the
user's `~/.gemini` state (which holds user hooks). Ask AI only uses clients without
tools, so the status says so and names the version.

## Native runtime and evidence

All generated state is on the T9-backed build volume. The native broker
(`native/sandbox-launcher.c`, built by `provider-host setup`) runs each client in its own
process group under a generated seatbelt profile (`launch.mjs liveProfile`) and kills the
group on parent exit, deadline or signal. The profile denies by default and admits:
exec of the client itself only (Claude Code also `/usr/bin/security`, with fork); system
libraries, ICU, timezone data and certificates; read/write of the private run directory
(and Codex's own home minus the customization files above); `cfprefsd`/POSIX shared
memory for managed preferences; DNS, `SecurityServer` (TLS trust evaluation) and
outbound network for the conversation only (loopback only for checks; none for version
and sign-in questions). For Claude Code's own Keychain sign-in the profile also admits
`securityd.xpc` and read access to the single file
`~/Library/Keychains/login.keychain-db`, used by the official client and Apple's
`security` helper; the host never reads it. (This file permission was declined in
September under a narrower approval; Wout authorized live use of the user's own clients
"with their own sign-in" on 8 October 2026.) Seatbelt via sandbox-exec is deprecated: this
remains a development containment, not a signed production XPC architecture.

Validation commands (after mount-dev-storage):

```sh
node --test packages/provider-host/tests/*.test.mjs
/Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- node --test packages/provider-host/tests/checks.os.mjs packages/provider-host/tests/sandbox.os.mjs packages/provider-host/tests/live.os.mjs
AXIOSOZO_BUILD_ROOT=<build root> node packages/provider-host/cli.mjs clients [--refresh]
```

After explicit live authorization, the fixed diagnostic sends only `Reply exactly
AXIOSOZO_OK`:

```sh
/Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- node packages/provider-host/cli.mjs live codex --authorized
```

## History

Until 8 October 2026 the live routes accepted exactly Codex 0.160.0 (app-server, with a
browser-owned `CODEX_HOME` needing its own `codex login`) and Claude Code 2.1.283, and
the frontend mirrored those pins. Both clients auto-updated (Codex 0.162.0, Claude Code
2.1.295) and Ask AI refused them. The September/October diagnostics below are kept for
the record; the 0.157.1/0.160.0 request schemas in `packages/provider-host/schemas/` are
historical provenance only and no longer used by a live route.

### Approved live diagnostic outcome (26 September 2026)

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

### Codex 0.160.0 live-build repair — 3 October 2026

The current workstation route now accepts exactly Codex 0.160.0, including
matching official wrapper/native package versions. The six official tagged
request schemas are structurally identical to the retained 0.157.1 schemas.
Existing empty environments/dynamicTools, isolated official authentication,
no-shell/no-fork native confinement and no automatic replay remain unchanged.
A real 0.160.0 app-server passed initialize and account/read inside the actual
network-denied live sandbox using a fresh empty test home, then exited0.
This is actual startup/protocol evidence, not a model-answer or authentication
claim. Provenance is recorded in provider-provenance.json.

Claude authored the frontend compatibility update. The live native startup had
no installed Ask AI entry point; its separate native-menu repair and GUI outcome
are recorded in PLAN_4_STATUS.md. Model verification remains pending until the
user completes official sign-in for the browser-owned provider instance and
separately authorizes the fixed live test. Automatic approval review rejected
that Send because the build-fix request did not explicitly authorize an external
model request. No test was sent. No personal credentials are read or copied by the host. Other provider and
watch/decision/Understand authorization gates are unchanged.


On 4 October Wout explicitly authorized the fixed no-page Codex test. Native
Send reached the repaired route but returned `CODEX_LOGIN_REQUIRED` at the
owned-home authentication-file existence gate before any Codex/model spawn.
The separate browser home is now prepared; its official sign-in command is
visible in Settings. The prior automatic-review refusal is historical; this
fixed test is authorized, and official browser-profile sign-in remains pending.
