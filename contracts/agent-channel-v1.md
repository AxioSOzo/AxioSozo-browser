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

Confirmation is dispatch-once consent for one exact method, parameters and
native target/document/project/root/container, bound to the original request
signal. Final synchronous parent approval and current-owner checks precede the
standard BiDi command invocation with no intervening await. Revoke, timeout,
navigation or close cancels pending confirmation and undispatched/future work.
An already-dispatched effect may complete or have an uncertain outcome; neither
cancellation nor session close proves nonexecution or rollback. Never retry an
uncertain effect automatically. Private dispatcher diagnostics do not extend
wire replies with native handles or outcome fields. Effect-time child privacy
and target proof remains required even after Allow once (§7.3).

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

### 5.1 Verified bridge configuration

The privileged process service exposes `getBridgeConfig(agent) -> Promise<string>`
for primitive `claude-code` or `codex` only. This is not a new local-channel or
MCP method. A trusted builder receives exactly `{agent,socketPath}` from the
currently owned verified listening endpoint. Entry, the generator microtask and
completion require the same config, endpoint, socket, generation, ready project
cache and cache generation, live lifetime, non-shutdown service and no unresolved
cleanup. Disable/re-enable and invalidate/refresh ABA discard an old result.
The service deadline is 3,000 ms; nonempty output is at most 65,536 UTF-8 bytes.
Missing or bad builders refuse with internal `CONFIG_UNAVAILABLE`; stale endpoint
and deadline refuse with `ENDPOINT_UNAVAILABLE` and `TIMEOUT`. Invalid agent is
`INVALID_INPUT`. These internal codes do not add agent wire methods or error fields.

`AgentBridgeConfig` uses the direct `contexts/agent-config.mjs` `bridgeConfig`
export. It admits only the fixed checksum-addressed seven-file namespace:
package.json, the entry point, its four transitive source imports, and copied
Node. Command is the installed `/node`; argv contains the installed bridge entry,
literal `--agent` and `--socket`; `AXIOSOZO_AGENT_SOCKET` binds the identical
current socket. No shell interpolation, PATH, home socket fallback, project script
or actor-supplied root/executable is emitted. Native root selection uses the trusted
`AXIOSOZO_STATIC_READER_ROOT`, then `AXIOSOZO_BUILD_ROOT`, under the existing closed
build-root policy. Browser snippets never read or alter client configuration.

Root setup/check verifies the six shipped source files and fixed pinned Node,
then installs/checks only an absent exact namespace. Private directories are
0700; the six package/import files are 0400 and copied Node 0500. Canonical paths,
no symlinks, own UID, regular file type, one link, exact modes/sizes/hashes,
inventories and repeated identities must pass. Existing unverified or partial
namespaces are preserved and refused. Setup never executes Node or a client.
These permissions are not OS immutable flags or a lease against a malicious same
UID changing bytes after verification. Native admission uses path-based APIs;
verification does not prove later execution against a same-UID filesystem race.

Native metadata uses only fixed id/stat OS tools, fixed argv and C locale with
no appended environment, 512 raw bytes per pipe, 1,000 ms metadata deadline and
500 ms bounded cleanup attempts. Only numeric native EOF `0xff7a0001` from
stdin.close is tolerated; real output EOF, a zero owned wait and validated
metadata remain required for admission. Known owned wait completion suppresses unnecessary termination attempts;
pipe closure, a timeout or kill request alone is not an exit receipt. The overall
3,000 ms deadline does not preempt synchronous native work or guarantee child
exit. The builder exposes no persistent owned-exit telemetry or hard native
inventory-allocation ceiling.

A normal-window wrapper and closed About agent-only method must recheck native
window/current endpoint around await before publishing a snippet. Content supplies
no paths, runtime callbacks or authority flags. Copying a snippet enables no
endpoint, approves no session, launches no bridge/provider/helper and installs
nothing. Missing installed/native admission remains unavailable.

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

### 7.1 Step 8 privileged reads and tool ownership

The installed DOM-free backend defines these seams; module presence or fake-test
success never accepts a native capability. Default endpoint enablement remains
false. Native read/title/capture/action glue requires separately reviewed source;
actual ordinary-profile evidence is required before claiming native verification.
Capture and each act/open availability flag additionally remain false until their
individual native gates are accepted. A blocked interactive read gate remains
NOT_VERIFIED even when the source and injected tests pass.

`isApprovedBridgeSession(id)` is a passive privileged boolean from Core's private
session map, restricted to approved agent-bridge sessions that are not stopped,
closed, read-ended or aborted. Service adds current enabled/listening endpoint,
config/socket, ready cache/generations, lifetime/shutdown and cleanup checks, then
rechecks. EOF draining can leave a copied public session snapshot approved while
this private checker already denies. Copied/project-filtered `listSessions` is
presentation, not authority. The checker supports a genuinely approved null-project
session without a filter; existing known-project approval admission is unchanged
and does not grant null/unknown projects. It is never exposed to About or the wire.

Core passes a deeply frozen approved view and the exact original request
AbortSignal to synchronous `listTabs(view,{signal})` and
`getTab(id,view,{signal})`, including initial and post-confirmation target checks.
Entry refuses reentrant revocation before metadata callbacks. Public tab fields
remain exactly tab_id/url/title/active/project_id/engine. Opaque public IDs never
substitute for native browsing-context/container IDs or issued registry identity.

Approved native title projection may read only the current trusted
WindowGlobalParent.documentTitle through synchronous `registry.withTrusted` with
the exact issued expected descriptor, checking request/session authority before
and after. It is a cached IPC string and may lag a title change. Bound/sanitize it
to 4,096 units in a separate metadata copy; failed/absent title remains empty.
Base console-registry title remains empty. Never use contentDocument.title,
browser.contentTitle's nonremote fallback, page getters, a cloned expected object
or a title-bearing copy as capture authority. These bounds are not a secret scrubber.

Use the existing Step 7 process owner, registry, native project publication/check,
ownerForTab/readTab and navigation subscription. A console read is fresh synchronous
RAM admission under §8; it starts no new child capture or subscription. Unknown
engine/privacy/category/root/route/document/container facts refuse. Never construct
a second console observer, registry or navigation namespace when enabling tools.

`installTools` accepts exactly six own data functions: isMethodAvailable,
listTabs, getTab, executeMethod, confirmAction and releaseSession. Keep each
standalone tools/action/capture/PNG owner and its private close/getState outside
that projection. Service replacement revokes sessions but does not await private
standalone close; Core observes release rejections but does not await disposal.
Neither projection replacement nor service close is that owner's cleanup receipt.
The native process owner must deny new work synchronously, retain every superseded
or late owner, await positive cleanup and quarantine failed/pending ownership until
explicit retry. A replacement cannot regain capture while old cleanup is unresolved.
Window close retires only that window; it cannot dispose another window's owner.

The read owner serializes screenshot acquisition/cleanup; the act owner serializes
operations. Both retain late acquisitions and failed/pending closes, and suppress
late image/error delivery. Pending cleanup coalesces; only explicit
release/close retries a failed attempt. Global close denies further admission but
allows cleanup retry. A positive disposal receipt must be literal true, not a
closed flag, ignored Promise, undefined or false. Read/act owners retain at most
4,096 revoked session IDs; exceeding that bound closes the owner. Diagnostics are
categorical counts only and run no capture/probe/release/wait merely when read.
Defaults are a 10,000 ms operation and 1,000 ms cleanup deadline, bounded to
1..30,000 and 1..5,000 ms. A deadline does not certify OS exit or universal cleanup.

### 7.2 Viewport capture, default refusal and limits

`tabs.screenshot` remains unavailable until the exact native capture/privacy
implementation and ordinary-profile evidence are accepted. Trusted `captureEnabled`
defaults false. An actor boolean, copied document token, matching pre/post trees
or parent cached password fact grants no image permission. The initial failed
privacy admission causes zero native capture or PNG resize. Chromium capture
remains unavailable through this Gecko backend.

An admitted read lease binds the exact issued registry object, registered current
child/document and selected visible live normal top-level owner, URL/principal,
project/root/publication/route/container and caller session/consent. Parent and
child authority bracket every acquisition, capture, PNG and resize await. Native
privacy proof must detect transient control/password insertion/removal and type
changes, existing and newly attached open/closed author roots, frame/navigation
changes and async native screenshot timing. Drain monotonic mutation records and
retain root identity; a later clean tree never restores an invalidated lease.
An initial conservative field-free/frame-free HTML scope refuses all form/editable
controls, historic password risk, unsafe/opaque/UA roots, subframes and unknown
scope. Do not reject an unrelated noneditable focus change without an affected
privacy/owner condition; do not read values or patch page methods. Unknown queue,
modal, root, currentness or native readback semantics keep availability denied.

The genuine listener-free owned WebDriverSession uses standard
browsingContext.captureScreenshot, viewport origin and PNG. Refuse enabled/running
RemoteAgent or Marionette, system access and preexisting WebDriver sessions.
Every automation ownership fact must be verified literal false; missing, unknown
or throwing facts refuse before allocation. acceptInsecureCerts remains false
and preferences/listeners are not changed. Failed native construction/destruction
must retain or quarantine uncertain ownership and cannot produce a positive close
receipt; pending operations must settle before an owner is retired.
Preserve 128 process and 16 unchanged-document native allocation slots, counting
failed constructors. Parent session destruction does not prove all upstream
content handlers retired; request churn never establishes universal cleanup.

Close the owned reader while the child lease is still live, recheck, then perform
terminal child commit: synchronously validate and retire the exact lease and reply
literal true only if both succeeded. After that reply the capture orchestrator
checks parent authority synchronously and returns the immutable completed image
with no further await. A later publication still requires its own current caller
approval/consent/owner; this commits a past image, not future observation authority.
Tainted native bytes may exist privately before discard, but cannot be published
by an invalidated operation. No secure zeroing or universal no-image-ever-painted
claim follows. Failed/late reader, lease and PNG stream cleanup remains retained;
timeout/abort is not disposal proof or a hard native RAM/CPU/record-queue bound.

Wire max_width is 64..1920, default 1280, with at most 2 MiB decoded PNG. Trusted
bridge raw height is at most 16,384. Decision/handoff purposes, chosen only by
trusted callers, fit both sides within 1280 and at most 1 MiB; they cannot be
selected from agent wire input. No upscaling; a portrait's resulting width below
64 is valid. Full bounded PNG framing/CRCs/order, one IHDR, terminal IEND with no
trailing bytes, admitted static RGB/RGBA formats and actual native pixel decode/
dimensions precede acceptance. Caps are 16,384 per raw dimension, 33,554,432 pixels
and 1,024 chunks. Resize validates exact floored targets and output byte cap;
byte overflow refuses rather than inventing an additional resize. Images stay in RAM.

Step 5 screenAvailable/watch and manual handoff include_screen remain separate
caller/consent/privacy/publication gates. Screenshot acceptance cannot silently
enable them or retroactively authorize earlier title/selection reads.

### 7.3 Genuine act/open admission and cleanup

Each click/type/navigation/open capability defaults false and returns UNAVAILABLE
before confirmation or effect until its exact native gate is accepted. Effects
remain standard BiDi commands under one privately owned native session per request;
there is no generic custom actor effect RPC. A separate action actor may install,
revoke and check only the exact one-use privileged target/privacy callback in the
existing owned sandbox. Actor parameters cannot grant session/project/native-owner
authority. Use only root-reviewed fixed function declarations and scalar parameters.

Bind the original Document with a root-owned opaque BiDi handle and exact native
realm/context/private sandbox; no serialized node-field traversal or broad realm
lookup. The effect-time native checker rejects current/historic password risk,
replacement document and unsafe/unknown/custom/frame targets immediately before
the first effect. No await/page callback intervenes in that check-to-effect boundary.
Type replaces plain text without reading the existing value. Standard effects
can invoke later native/page reactions; dispatch-once consent is not rollback.
Selectors are at most 512 Unicode code points and reject C0/C1; type text is at
most 4,096 code points and rejects NUL. URLs retain the Core 8,192 UTF-16-unit
bound and C0/C1 refusal. Public t_ IDs or numeric container IDs are never guessed
BiDi context/user-context identifiers. Exact native source/ownership/realm proof
and positive retirement receipts remain required, not inferred from naming APIs.

`tabs.open` remains the approved read/open method without an extra action prompt;
click/type/navigation require Allow once and a matching non-null session project.
A contract-permitted genuinely approved null-project open still needs all native
checks and the actual default container. Fresh normal reference context and native
container mapping require exact owned registry/project identity; no new-container
fallback or foreign target adoption is permitted.

New-tab create owns a pre-dispatch allocation lease because addTab can precede an
awaited create rejection. Unknown, failed or late creation retains that exact lease
and native session until positive no-allocation proof, guarded retirement of only
the still-owned untouched never-navigated blank, or positive native ownership
transfer. Once URL navigation is invoked, automatic tab close is permanently
forbidden; positive adoption into the browser/shared registry or retained exact
ownership follows even after error/timeout. Session close alone neither removes
nor adopts a tab. Never close a foreign/touched/moved/unknown target or mint a
public tab ID from a raw native context ID. Pending/failed cleanup blocks reuse
and requires retained-owner explicit retry. The §4.2 dispatched-effect uncertainty
and no-automatic-retry rules apply.

## 8. Gecko console records (Plan 4 step 7)

A process-owned service retains warning/error records in RAM only. Its native
owner and tab registry exist independently of the disabled agent endpoint.
Collection does not enable a bridge, open a handoff composer, invoke a provider,
or write logs to the profile, project brief, activity history or diagnostics.
Firefox DevTools remains intact.

Only an actual current, normal, top-level Gecko web document may offer a record.
Unknown/private/currentness/engine/category facts refuse before application
payload inspection. The registered child checks current password risk immediately
before copying native scalar fields. Historic password inputs, opaque focused
frames, bounds and uncertainty refuse. No title, selection, input value, stack,
object property, console cache or arbitrary coercion is read. Free-form console
text and URL paths can contain user data; these bounds are not a secret scrubber.

A child keeps at most one native event reference for 500 ms. It sends bounded
metadata only. The parent obtains a one-use private capture lease after checking
native ownership, the exact issued tab-registry descriptor, project root/revision
and actor identity. Only the completion of its outstanding query to that exact
registered actor can complete the lease. The child revalidates its pending offer,
current native document and password risk before returning a bounded scalar copy.
The parent repeats authority after the query and consumes the opaque capture
permit synchronously. Serialized IDs, copied objects and page-supplied safety
booleans grant no authority. This boundary does not claim protection against a
compromised privileged process.

A later password field does not revoke an immutable earlier observation; future
observations check risk again. Every top-level navigation, including same-document
changes, clears retained records and rotates freshness before callbacks. Live
revocation/relink preserves per-document rate budgets; only confirmed ownership
retirement frees a slot. Unknown inventory is not treated as an empty inventory.
Project mutations withdraw authority synchronously before the first await and
clear retained console records across the process. This conservative invalidation
includes container assignment and accepted brief persistence. Profile shutdown
withdraws the published native snapshot and prevents pending hydration or a later
owner registration from restoring authority.

Limits: 2,048 live ownership slots; 50 retained messages per tab; 1,000 UTF-16
units per text and 2,048 per source. Source is empty or http(s), with userinfo,
query and fragment removed; privileged/internal/file/extension/data/blob and
malformed sources refuse. Child attempts are limited to 20/second and 500/document;
parent attempts to 30/second and 1,000/document. One pending lease or unconsumed
permit is allowed per tab, with a 1,000 ms deadline. Native glue owns timeout,
destroy and query-failure cleanup. Event delivery contains only the name console.

The project home and sidebar read a current normal-window/project projection;
the home shows at most five recent messages and the retained total. Unavailable
collection is distinct from zero retained records. The future console.errors
bridge tool remains behind its separate session/tab/privacy/category gates.
Chromium collection remains UNAVAILABLE until the engine workstream supplies it.

Send errors to agent is an explicit manual action for one concrete eligible
native tab. A project-home action requires visible target selection; it cannot
implicitly aggregate tabs or treat the about: page as the target web document.
The existing handoff's selected-tab, current registered child, password, project,
request admission, confirmation and final clipboard/target guards remain in force.
Console inclusion is an explicit visible opt-in; collection never sends anything.

## 9. Changelog

- 2 October 2026 — created for Plan 4.

- 2 October 2026 — Step 4 current-profile path, explicit session enablement,
  55-second approval, owned cleanup and quiescent project authority.

- 3 October 2026 — Step 7 bounded RAM console records, native capture leases,
  current project authority and explicit single-tab manual handoff.
