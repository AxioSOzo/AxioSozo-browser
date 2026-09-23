# Provider foundation — verified 23 September 2026

This is an **EXPERIMENTAL protocol module with fixture evidence**, not three
verified live provider integrations. All three live routes return **BLOCKED_AUTH**;
even explicit authorization alone cannot enable them until an OS process boundary
is verified with the actual client. A native offline/no-fork boundary experiment is
implemented separately; it does not launch providers. No client login, model turn, MCP server, provider install,
account credential read, or Jev request was executed during this handoff.

| Component | Actual local state | Verified behavior | Remaining boundary |
|---|---|---|---|
| Codex | `0.156.1`, npm metadata; **VERSION_MISMATCH** against fixture `0.155.1` | Schema generated from 0.155.1 on 22 September; stdio request framing, initialize, thread/start, turn/start, text stream, deny approval, interrupt, thread/resume against fixture process | Current 0.156.1 protocol **UNTESTED**; official-client auth, safe native process launch |
| Claude Code | `2.1.280`, native installation path metadata; **VERSION_MISMATCH** against fixture `2.1.278` | Official CLI stream-json shape; text, result, SIGINT delivery, process lifecycle against fixture | Current 2.1.280 protocol **UNTESTED**; auth, strong cancellation status, safe native process launch; resume unsupported |
| Antigravity | `agy` exists as a native arm64 executable; version **unknown / UNTESTED** | Official agy stream-json shape; conversation ID, text, result, SIGINT delivery against fixture | Audited version, auth, native launch/config isolation; resume unsupported |
| Jev | Optional, off | Fixed synthetic state, versioned choice schema, pinned model, deadline/cancel, malformed/oversized output rejection, no key means no fetch | Explicit authorized live diagnostic; user-added key; Keychain end-to-end storage test |
| Keychain helper | Native arm64 build; separate negative and positive fixtures | Invalid production inputs rejected before SecItem; empty-search-list errors; JS null/error handling; synthetic private-keychain add/read/replace/delete round-trip | Production settings-to-helper round-trip and user-key service remain untested; settings action stays disabled |
| Native process boundary | Experimental offline/no-fork fixture | Five real macOS OS tests: scoped IO, outside/config/symlink/shell/fork/network rejection, cancellation/deadline/parent-exit cleanup | Actual provider-client compatibility; supported production sandbox architecture |

See [module tests](evidence/providers-module-tests.log),
[run results](evidence/providers-module-results.json),
[discovery](evidence/providers-module-discovery.log), and
[build/check](evidence/providers-module-check.log). Root integration runs may provide
additional evidence. Older failed logs are preserved, including the exFAT AppleDouble
test-file enumeration failure; the CLI now excludes `._*` metadata files.

The 23 September run adds **42 passing module tests, five native sandbox tests and
five native Keychain negative tests**, on macOS 26.6.2 arm64. Check/build exit codes
are 0; all three provider gates and the unauthorised Jev gate still return 78.
Exact commands, artifact/source hashes and logs are recorded in
[latest verification](evidence/providers-verification-20260923.json) and
[Keychain negative evidence](evidence/providers-keychain-negative-20260923.json).

The current metadata-only fixture suite has **48 passing module tests**. Fresh
metadata shows the two explicit version mismatches above.
The installed clients were not executed and their schemas were not regenerated:
[version verification](evidence/providers-version-results-20260923.json),
[metadata snapshot](evidence/providers-version-discovery-20260923.log). Earlier complete
test logs remain historical evidence; they are not evidence for the updated clients.

A further **positive native Keychain fixture passes** in its own fresh T9 directory:
synthetic add/read/replace/delete and post-delete absence verification. This does not
enable the production Keychain input or make a Jev network call. See
[positive final evidence](evidence/providers-keychain-positive-final-20260923.json).

## Commands and integration API

Run from the repository root with Node **24.14.0**. No npm install or dependency
lifecycle script is needed:

```sh
node packages/provider-host/cli.mjs discover
node packages/provider-host/cli.mjs check
node packages/provider-host/cli.mjs test
node packages/provider-host/cli.mjs setup
node packages/provider-host/cli.mjs sandbox-test
node packages/provider-host/cli.mjs keychain-negative-test
node packages/provider-host/cli.mjs keychain-positive-setup
node packages/provider-host/cli.mjs keychain-positive-test
node packages/provider-host/cli.mjs live codex
node packages/provider-host/cli.mjs live claude-code
node packages/provider-host/cli.mjs live antigravity
node packages/provider-host/cli.mjs jev-test
```

`discover` reads executable locations and public installation metadata only. It never
executes even `--version`: the audited Codex CLI attempted PATH-alias setup before
printing help/version (the sandbox refused that write). It does not inspect personal
configuration, browser profiles, authentication files, or Keychain. An existing binary
does not establish either trusted provenance or authentication.

Discovery accepts at most 64 KiB from a regular npm `package.json` without following a
metadata symlink. A malformed, oversized or redirected file yields an unknown version
and no version-source claim; discovery still never starts a client. This is a bound on
metadata parsing, not proof that a PATH executable is trustworthy. A deterministic
hostile-metadata fixture checks this gate.

Discovery and preflight report `version_status` independently of authentication:
`PINNED_METADATA_MATCH`, `VERSION_MISMATCH`, or `UNTESTED`. A match only means the
metadata string equals the fixture pin; `protocol_status` remains `UNTESTED` for
every actual client. Unknown versions and unpinned drivers fail closed. Prerelease
and build suffixes are preserved, never truncated into a false match. An unauthorized
preflight still returns `BLOCKED_AUTH` with these explicit version fields; even a
caller claiming authorization/authentication receives `BLOCKED_ENV` for mismatch or
unknown versions before the native launch boundary is considered. No client starts.

Upgrading fixtures requires reviewing the exact new client/protocol, its supported
launch configuration and execution side effects, then deliberately updating the pin,
schema and protocol fixtures with evidence. Metadata discovery never regenerates a
schema or silently replaces the user's installed client.

`check` validates JavaScript syntax, TypeScript strip parsing, and native syntax with
warnings as errors. It is **not a TypeScript semantic typecheck**. `setup` mounts external
storage and compiles the small Keychain helper, lifetime supervisor and native test
fixture via `dev-external` and the root storage broker. Outputs live in
`$AXIOSOZO_BUILD_ROOT/providers` (default `/Volumes/AxioSozoBuild/providers`). The
storage broker must verify the T9-backed APFS volume; no internal fallback exists.
No provider clients are installed. `sandbox-test` runs the separate macOS native
fixture proof, including an explicitly unconfined synthetic baseline for comparison.
`keychain-negative-test` runs only invalid production-helper inputs and the separately
compiled empty-search-list fixture; it cannot store or delete an item. Run native
tests through `dev-external python3 scripts/storage.py exec -- ...`, after the mounted
T9 image is verified. If the host execution sandbox cannot apply a nested Seatbelt
profile, report that restriction rather than treating it as a test success.
`keychain-positive-setup` compiles one separate fixture only; coordinate its single
compiler slot while a full browser build is active. `keychain-positive-test` creates
and removes only a newly generated private test directory on T9, without changing
the default keychain or its search list. It never calls the production helper.
Exit codes: `0` success, `78` blocked, `64` unsupported CLI command, `1` failure.

`src/adapters.mjs` exports `ProviderAdapter`, `createFixtureAdapter`, `codexRequest`, and
`livePreflight`. The adapter accepts an already-owned transport; there is deliberately
no live process launcher. `createFixtureAdapter` launches only the fixed local test peer
with `process.execPath`, a minimal environment, and `shell:false`. It is not a product
provider and every normalized event has `label: TEST_FIXTURE`.

`start` input is version 1 with browser-assigned `request_id`, `session_id`, `turn_id`,
`instance_id`, `account_identity`, and a bounded `text`. Each normalized event gets a
host-issued `event_id`. `binding` remains immutable. Codex native thread and turn IDs
come only from its protocol responses. `accepted` is an admission acknowledgement;
only `turn_finished` reports terminal outcome. An uncertain crash or mutating timeout
blocks continuation and is never replayed. Codex resume performs `thread/resume`;
Claude and Antigravity return `unsupported` for resume.

The coordinator must retain sole ownership of target policy and web-content context.
This module exposes no HTTP/WebSocket/debug port and grants no shell, file, browser,
or authorization tool to a model. Production process-owned IPC admission is an
integration task; importing this class is not an OS sandbox.

## Upstream audit and retained code

T3 is pinned to `b5a0f810108d42ca8635b5a3d75a6e885bb3a254`, with an unchanged sparse
checkout and `upstream` remote. Only pure version parsing, bounded stderr redaction,
and driver/instance continuation identity code was extracted into
`packages/provider-host/vendor/t3`. The MIT notice is retained. Exact source paths,
hashes, modifications, and tests are in [provider-provenance.json](provider-provenance.json).
Streaming/protocol/lifecycle adapters here are new small code, informed by the audited
T3 boundaries and official protocols; they are **not represented as copied full T3 adapters**.

The audited T3 Codex package has a useful `effect-codex-app-server` boundary, but it
depends on Effect 4 release candidates and surrounding Effect services. Importing it
would add a substantial dependency graph for this small module. T3's Claude adapter
uses `@anthropic-ai/claude-agent-sdk` (lockfile `0.3.276`), coding tools, settings sources,
and T3 MCP; that full adapter is not imported. T3's current Antigravity integration
uses Google's distributed ACP server/harness and manages per-instance authentication
profiles. Its file-based auth handling and global skill-directory links are not copied.

The root `prepare` hook executes `effect-tsgo patch && vp config --no-agent`.
`pnpm-workspace.yaml` permits lifecycle builds for Electron, esbuild, node-pty and sharp.
Those hooks, dependency installs, the full T3 server, frontend, terminal, mobile app,
worktrees, maintenance commands, installers, and auth controllers were **not run**.

## Official routes and authentication distinctions

**Codex:** official app-server defaults to JSONL stdio. The protocol schema in
`packages/provider-host/schemas/codex-0.155.1.json` was generated by the actually installed
`codex app-server generate-json-schema --out ...` command on 22 September, not guessed
from newer docs. The subsequently installed 0.156.1 client is not declared compatible
with that retained 0.155.1 schema.
Outgoing methods and fields are validated against that schema. `read-only` and
`approvalPolicy: untrusted` are protocol fixture choices, not a claim that native
hooks/configuration are contained. Credentials must remain owned by the official client.
Sources: [app-server](https://developers.openai.com/codex/app-server),
[Codex source/license](https://github.com/openai/codex).

**Claude Code:** the unmodified official client and direct SDK/API use are separate
routes. Current terms distinguish hosting the official binary from intermediating
subscription tokens in another client. Sign-in must use Anthropic's flow. Current
`--bare` mode skips hooks, MCP and project instructions **and also disables subscription
OAuth/Keychain authentication**, requiring API authentication. It still includes coding
tools unless explicitly removed. We therefore do not label a bare-mode SDK wrapper as
subscription support, collect tokens, or ship T3's SDK configuration unchanged.
Sources: [legal/authentication](https://code.claude.com/docs/en/legal-and-compliance),
[headless and bare mode](https://code.claude.com/docs/en/headless),
[CLI flags](https://code.claude.com/docs/en/cli-reference).

**Antigravity:** official documentation now provides native `agy`, JSONL headless
input/output, explicit conversation IDs and result statuses. This is separate from
Gemini CLI and from T3's ACP installation. Normal `agy` launch can open a login browser
when auth is absent, so discovery never runs it. The CLI's headless permission defaults
can automatically allow workspace file operations; observing tool events cannot
prevent them. Its `--sandbox` terminal option alone has not been proven to confine
hooks, rules, sidecars, MCP or filesystem access. Sources:
[install/auth](https://antigravity.google/docs/cli/install/),
[headless protocol](https://antigravity.google/docs/cli/headless/),
[separate SDK](https://antigravity.google/docs/sdk/overview/).

**Jev:** the optional `DecisionProvider` uses `POST https://api.typesafe.ai/v1/systemone`
with pinned `jev-1.13.0`, a typed choice question and fixed synthetic service state.
It validates model, choice, confidence, probabilities, deadline and context version.
Results are diagnostic suggestions with `action_authorized:false`; uncertainty is a
valid result. Requests never retry and cannot follow redirects. `jev-test` without
`--authorized` returns `BLOCKED_AUTH` before Keychain/network access. Only an explicit
authorized invocation may query the project-specific Keychain service; no environment
API-key fallback exists. `MacKeychain.store` takes a user-supplied key through an owned
stdin pipe, not argv/files; no key is present in this repository. Sources:
[API](https://docs.typesafe.ai/api), [models](https://docs.typesafe.ai/models),
[quickstart](https://docs.typesafe.ai/introduction/quickstart).

## Trusted browser settings

The internal `ProviderSettings.sys.mjs` module opens the scriptless
`chrome://browser/content/axiosozo/providers-settings.xhtml` settings dialog from an
explicit browser-chrome action. It calls only the provider host's `discover` command
using `AXIOSOZO_PROVIDER_NODE`, `AXIOSOZO_PROVIDER_HOST` and `AXIOSOZO_DISCOVERY_PATH`
supplied by the development session. It replaces the child environment, bounds output,
sets a five-second deadline, and reaps the owned metadata subprocess on close/failure.
Metadata is validated, rendered with `textContent`, and cannot enable live capabilities.
Nothing launches automatically when the browser starts.

Configurations contain only a generated immutable UUID, one of the three driver IDs,
and a user-chosen label in the development profile's `axiosozo.providers.instances.v1`
preference. They contain no provider credentials or account tokens. Adding a
configuration does not connect, authenticate or migrate a session. Private windows
cannot open this persistent settings surface. The optional Jev password field and
storage action are visibly disabled; its gated helper path uses private stdin and
never preferences, argv or logs. No Keychain operation or live test is triggered.

Ten settings contract tests cover validation, capability/version rejection, configuration
identity, malformed/credential-bearing saved data, subprocess output/deadline/cancel,
web/private rejection and the disabled Keychain gate. The combined provider suite has
48 passing tests after the metadata-read hardening. These are deterministic
model/transport tests, **not a real browser GUI test**. See
[settings evidence](evidence/providers-settings-results.json) and
[settings tests](evidence/providers-settings-tests.log). The
[earlier version-guard run](evidence/providers-version-tests-20260923.log)
records 47 tests; the current suite is reproducible with
`node packages/provider-host/cli.mjs test`.

## macOS subprocess boundary experiment

`src/sandbox.mjs` admits only the compiled `native/sandbox-probe.c` test executable;
the binary and source hashes must match the build manifest. It accepts no arbitrary
executable, environment, shell command or sandbox profile from callers. Its only
writable scope is a new app-owned private fixture directory on the external build
volume. A minimal explicit environment prevents inherited provider credentials,
Node hooks, dynamic-loader settings and provider configuration variables.

The deny-default Seatbelt profile allows that executable, system library loading,
system metadata/sysctl reads and scoped fixture file contents. It denies network,
fork and other executable paths. File metadata is intentionally readable globally;
the claimed boundary concerns file contents and mutation, not metadata privacy.
`native/sandbox-launcher.c` supervises the exact child using `waitpid`. The parent
liveness pipe is not inherited by the fixture; EOF, cancellation and deadline
cause TERM followed by KILL and reaping. No process-name killing is used. Because
fork is denied, this design prevents descendants; it does not claim to clean up an
arbitrary pre-existing child tree or survive a forcibly killed supervisor.

`tests/sandbox.os.mjs` compares the same actual syscalls before and after confinement:
allowed read/write; outside read/write; symlink escape; synthetic Codex, Claude,
MCP and instruction files; shell launch; fork; and a local fixture TCP connection.
It also tests a SIGTERM-ignoring child on cancel/deadline and abrupt parent exit.
These are native fixture tests, **not startup-hook tests of official clients**.

Actual macOS results: every baseline operation succeeded. Under the broker, scoped
read/write succeeded while all outside/config/symlink reads, outside writes, shell,
fork and loopback networking returned `EPERM` (1). SIGTERM-ignoring children were
killed and reaped on cancellation and deadline; abrupt parent exit also left no
owned process. The final rebuilt artifacts passed all five tests:
[native sandbox log](evidence/providers-sandbox-final-20260923.log).

The current launcher uses the macOS `sandbox-exec` interface, which its system
manual marks deprecated. It is an experimental proof, not a supported permanent
provider-host architecture. Apple documents App Sandbox and signed XPC services
for privilege separation; a product host needs a reviewed entitlement and IPC
design plus official-client compatibility tests. Re-signing a provider client or
copying subscription tokens is not an accepted shortcut. Sources:
[App Sandbox](https://developer.apple.com/documentation/xcode/configuring-the-macos-app-sandbox),
[sandbox inheritance/XPC](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html).

## Keychain negative evidence

The production helper was executed only with malformed store input and an unknown
operation, both rejected before `SecItem` access. The same source is also compiled
as `keychain-negative` with the build-time-only `AXIOSOZO_KEYCHAIN_NEGATIVE_TEST=1`.
That binary fixes a synthetic service/account, sets `kSecMatchSearchList` to an empty
array, and rejects all store/delete commands. Apple defines that key as limiting
searches to the supplied keychains; the current SDK header was inspected before use.
There is no runtime switch to turn a production query into a test query, and neither
the default keychain nor the search list is changed.

Real `SecItemCopyMatching` returned `errSecItemNotFound` (-25300), mapped to exit 44
and JavaScript `null`. A malformed query returned `errSecParam` (-50), mapped to a
failure. Both produced no stdout. The fixture rejects even unexpected success before
emitting data. The production JS adapter returned errors for the fixture's blocked
store/delete operations and made no plaintext fallback. All five tests passed:
[native Keychain log](evidence/providers-keychain-negative-20260923.log).
No user key, subscription token or existing account item was queried or changed.
The production settings-to-helper route remains unverified. Source:
[Apple search-list contract](https://developer.apple.com/documentation/security/ksecmatchsearchlist).

## Positive isolated Keychain evidence

`native/keychain-positive.m` uses the public file-keychain API solely in a test child.
Those legacy creation/interaction APIs are deprecated but remain present in the
current SDK; the fixture locally suppresses their deprecation diagnostic rather
than changing production code. Apple publishes a creation guard that excludes private
keychains from automatic default/search-list changes. The fixture's fixed basename
is `axiosozo-synthetic.keychain`, inside a new private `positive-*` directory beneath
`/Volumes/AxioSozoBuild/providers/keychain-runs`. It cannot name a login/System keychain.
The caller does not query or change the user's default keychain or search list.
Source: [Apple StorageManager private-keychain guard](https://github.com/apple-oss-distributions/Security/blob/main/OSX/libsecurity_keychain/lib/StorageManager.cpp#L108).

Before creation, the child disables legacy user interaction and verifies its process
setting is zero. It also uses an `LAContext` with interaction disabled. Every
`SecItemAdd` supplies `kSecUseKeychain` with the new private keychain; every read,
update and delete supplies a singleton `kSecMatchSearchList` containing that same
reference. It generates random synthetic password/value bytes locally, compares the
returned values in memory, and never logs key data. It neither changes a preference
domain nor calls `SecKeychainDelete`; after the child locks its private keychain and
exits, the parent removes only the new fixture directory.

The actual macOS run returned success for create/add/read/replace/read/delete/lock.
Read values matched both synthetic values; queries before insertion and after removal
returned `errSecItemNotFound` (-25300). The exact native child was reaped and its
directory removed. The first harness assertion incorrectly expected JSON `false`
where the SDK's UInt8 `Boolean` became `0`; that failure is preserved. The corrected
exact-zero assertion passed using the identical native binary:
[initial log](evidence/providers-keychain-positive-20260923.log),
[final log and artifact hashes](evidence/providers-keychain-positive-final-20260923.log),
[single-file build](evidence/providers-keychain-positive-build-20260923.json).
No personal account item or default-keychain contents were read, and no Jev request
or production-helper operation occurred. The browser's production input remains off
until its actual settings/helper integration is verified separately.

## Handoff 2 requirements

Extend the experimental native boundary to a reviewed, supported provider launch
path with actual-client negative tests for native hooks, MCP, shell, file reads/writes
outside granted scope, and process lifecycle. The offline/no-fork fixture does not
establish actual-client compatibility. Then audit exact installed CLI versions, generate versioned protocol
fixtures, determine safe auth-status probes, and request the separately authorized
small live tests. Keep all advertised automation capabilities false until these pass.

Keep `discover` connected to provider settings without launches. Add a Keychain-backed
Jev settings action using `MacKeychain.store/remove`, after testing the production
helper through a separate synthetic service and proving the browser-to-helper path.
Finish strong Claude cancellation outcome handling
and resumable lifecycle support for Claude/Antigravity. No one should need Jev or a
provider account to browse normally.
