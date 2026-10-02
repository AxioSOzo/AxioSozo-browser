# Workstation interfaces, version 1 (Plan 4)

Owner: integration lead. This file fixes the seams for [PLAN_4](../docs/PLAN_4.md)
so the contexts core, the provider host, the agent bridge and the chrome can be
built in parallel. It extends [contexts-api-v1](contexts-api-v1.md) (whose
rules for `packages/contexts` still apply: DOM-free, no I/O, time passed in,
`ContextsError`, frozen validated copies, unknown keys rejected) and
[decision-v1](decision-v1.md). Data shapes for stores are in
[context-v2.schema.json](context-v2.schema.json).

## 1. Detection v2 (P1, `packages/contexts/src/detect.mjs`)

Detection stays static, allowlisted, size-capped (256 KiB per file), never
reads `.env*`, never executes. The reader is still dumb; every decision about
*what* may be touched is in the core. Two phases are added after the existing
workspace phase (contexts-api-v1 §2.2):

### 1.1 Root allowlist additions

`convex.json` joins `DETECTION_FILES` (root only). It is parsed only for its
`functions` string.

### 1.2 Phase 3 — inventory (names and presence only)

`inventoryPlan({ packageDirs }) → { list: string[], check: string[] }`

- `packageDirs` are the dirs returned by `expandWorkspaceGlobs` (≤ 24).
- `list` — directories whose **immediate child directory names** the reader
  may list (nothing is opened below them): `docs`, `.agent-worktrees`, `ios`,
  `macos`, and for each package dir `d`: `d`, `d/ios`, `d/macos`. At most 64.
- `check` — exact relative paths the reader may `lstat` (no open, no read) and
  report as `"file"` or `"dir"`: `AGENTS.md`, `CLAUDE.md`, `.claude`, `.codex`,
  `.agent-worktrees`, `convex`, `convex/schema.ts`, `convex/http.ts`,
  `android`, `build.gradle`, `build.gradle.kts`, `android/build.gradle`,
  `android/build.gradle.kts`; and for each package dir `d`: `d/convex`,
  `d/build.gradle`, `d/build.gradle.kts`, `d/android/build.gradle`,
  `d/android/build.gradle.kts`. At most 192.
- Reader policy `inventoryRefusal({ path, resolvedPath, kind })` → `null` or a
  refusal reason: the path must be in the plan, resolve inside the root
  (`resolvedPath` relative to the real root, `null` outside it), and `kind` is
  `"file"`, `"dir"` or `"other"` (`other` is refused). A symlink that resolves
  outside the root is reported as absent, never followed.
- The reader returns `inventory = { listing: { [dir]: string[] }, present: { [path]: "file" | "dir" } }`.
  Absent paths are simply missing. Listing names are re-validated by the core
  (hidden names other than those in the plan, `..`, `/` are ignored).

### 1.3 Phase 4 — documented domains

`documentFiles(inventory) → string[]` — exact paths the reader may read with
the usual checks (regular file, ≤ 256 KiB, `lstat` + `realpath`, inside the
root, strict UTF-8): `docs/domains.md` and `docs/<child>/domains.md` for at
most 8 children in `inventory.listing.docs`. Reader policy
`documentRefusal({ path, resolvedPath, isFile, size })`.

### 1.4 `detectProject` input and output

`detectProject({ rootName, files, refused, packages, inventory?, docs? })`.
`docs` is `{ [path]: text }`. Without `inventory`/`docs` the output is the same
as today plus empty v2 fields.

The detection draft becomes **version 2**: version 1 fields unchanged, plus

```jsonc
{
  "integrations": [            // ≤ 16, ordered by INTEGRATIONS order
    { "id": "convex", "name": "Convex", "dashboard_url": "https://dashboard.convex.dev",
      "sources": ["package.json#dependencies", "convex/"] }   // 1–8 sources, each ≤ 256 chars
  ],
  "platforms": [               // ≤ 16
    { "kind": "tauri" | "macos" | "ios" | "android" | "electron",
      "name": "Desktop",        // display name, ≤ 64
      "path": "src-tauri",      // relative dir, "" = root
      "source": "src-tauri/tauri.conf.json" }
  ],
  "domains": [                 // ≤ 32, hosts deduplicated, explicit before docs
    { "host": "app.example.com", "origin": "vercel_json" | "wrangler" | "netlify" | "fly" | "docs",
      "source": "docs/production/domains.md", "confirmed": false }
  ],
  "agents": { "files": ["AGENTS.md", "CLAUDE.md"], "dirs": [".claude", ".codex", ".agent-worktrees"],
              "worktrees": 3 }  // count of child dir names of .agent-worktrees (names never stored)
}
```

- `INTEGRATIONS` (fixed, data-only table, order = display order):
  `vercel`, `convex`, `clerk`, `stripe`, `supabase`, `firebase`, `cloudflare`,
  `netlify`, `fly`, `sentry`. Each has a fixed `name` and generic
  `dashboard_url` (no project ids). Evidence: dependency names in any
  `package.json` (root or package; exact names or a fixed `@scope/` prefix,
  e.g. `@clerk/`, `@stripe/`, `stripe`, `convex`, `@supabase/`, `firebase`,
  `@sentry/`), `vercel.json`/`.vercel/project.json` (vercel), `convex.json` or
  `convex` dir (convex), `wrangler.*` (cloudflare), `netlify.toml`,
  `fly.toml`. **Never** keys, env names or values.
- `platforms`: Tauri from the existing Tauri detection; `macos`/`ios` from a
  child name ending in `.xcodeproj` or `.xcworkspace` in a listed dir (`ios`
  when the listed dir is or ends in `ios`, or its name contains `ios`,
  `mobile` or `phone`; otherwise `macos`); `android` from a present
  `build.gradle(.kts)` in `android/` or a package dir whose name contains
  `android`, or `d/android/`; `electron` from the existing Electron detection.
  The `name` is the xcodeproj base name or the package dir's last segment.
- `domains`: `vercel.json` hosts in `redirects[].has[type=host].value`,
  absolute `redirects[].destination` and `rewrites[].destination` hosts;
  `wrangler` `routes[].pattern`/`route`/`custom_domain`; `netlify.toml`
  `[[redirects]].from` absolute URLs; `fly.toml` nothing beyond the app name.
  Docs: hostnames in backticks or in `http(s)://` URLs in `domains.md` files.
  Always excluded: IP literals, `localhost`, single-label names, hosts with a
  wildcard, and vendor hosts (`*.vercel.app`, `*.convex.cloud`,
  `*.convex.site`, `*.clerk.accounts.dev`, `*.netlify.app`, `*.fly.dev`,
  `*.workers.dev`, `*.pages.dev`, `github.com`, `*.github.io`, `stripe.com`,
  `example.com`, `example.org`, `*.example`, `*.test`, `*.invalid`,
  `*.local`). Docs-only hosts stay `confirmed: false` and are shown as "found in
  docs, unconfirmed". `confirmed` is never true in a draft.
- `agents.dirs`/`files` list only the fixed names that are present.

## 2. Project record v2 and context store v3 (P1/P2, `schema.mjs`)

Project records gain **version 2** (profile-local only; never written to the
manifest):

```jsonc
{
  "version": 2, /* … every version 1 field … */
  "detected": null | { "at": "<timestamp>", "integrations": [], "platforms": [], "domains": [], "agents": { … } },
  "container": { "user_context_id": 12 | null },            // Gecko contextual identity of this project
  "shared_sites": { "hosts": ["github.com", "*.github.com"], "confirmed": false },
  "accounts": [ { "key": "vercel", "label": "wout@company Google" } ],   // ≤ 32
  "brief": null | <understand-v1 brief record, §6>
}
```

- `accounts[].key` is an integration id or a host pattern; `label` is free
  text typed by the user, 1–80 chars after trim, no control characters. The
  browser never reads cookies, tokens or page content to fill it.
- `container.user_context_id` is null or a public Gecko identity integer
  in 1–4294967294 (`MAX_USER_CONTEXT_ID`). Zero means the default routing
  context, and 4294967295 is reserved for extension storage; neither is a
  project container. Only the browser assigns project identity IDs.
- `shared_sites.hosts` ≤ 32 host patterns (`validateHostPattern`). Suggestions
  do not share a site until `shared_sites.confirmed === true`.
- Context store **version 3** = version 2 whose `projects[]` are records of
  version 2. `CONTEXT_STORE_VERSION = 3`. `migrateContextStore` takes v1, v2
  or v3 and returns v3: project records are upgraded with `detected: null`,
  `container: { user_context_id: null }`,
  `shared_sites: { hosts: DEFAULT_SHARED_SITES, confirmed: false }`,
  `accounts: []`, `brief: null`. Idempotent; `updated_at` untouched.
- `validateProject` accepts version 1 and 2; `validateContextStore` accepts
  1, 2 and 3 (v3 requires v2 records).
- `DEFAULT_SHARED_SITES` = `github.com`, `*.github.com`, `gitlab.com`,
  `bitbucket.org`, `npmjs.com`, `*.npmjs.com`, `stackoverflow.com`,
  `developer.mozilla.org`.

### 2.1 Privileged project-home projection (P1)

The Overview actor adds `getProjectHome({ id })`; its closed request accepts
only a contexts-validated project ID. The actor supplies the requesting normal
window, never a page-named window, filesystem root or container identity.
`AxioSozoServices.projectHome({ window, id })` requires that same registered
normal window and a current stored record. Its version-1 projection is
`{ version, project, space, container, agent_activity, console_errors }`:

- `project` is the validated current record with the numeric container mapping
  omitted. `space` is the live `{ uuid, name }` association or `null`.
- `container` contains presentation only (`state`, optionally `name` and
  Firefox's allowlisted `color`); no native identity number crosses this API.
- `agent_activity` and `console_errors` are `null` until their corresponding
  collectors are integrated; unavailable is distinct from an observed empty set.
- Reading this projection creates no container, probes no server, reads no
  repository, writes no manifest and invokes no provider.
- Mutation and container authority must stay current across every asynchronous
  presentation read. Pending or changed authority refuses the projection;
  a removed record cannot be returned by an older in-flight request. A final
  registered-normal-window and current-record check precedes publication.

The exact home route carries one complete validated ID after decoding;
additional suffixes, paths and native container numbers are refused. Page request
lifetimes are monotonic across refresh, navigation, disposal and a route leaving
and returning to the same ID, so stale replies cannot publish state or start
follow-on work. Existing project-link dispatch still uses the P2 service gate.

## 3. Containers and routing (P2, new `packages/contexts/src/containers.mjs`)

- `CONTAINER_COLORS` = Firefox's `blue turquoise green yellow orange red pink purple`.
- `projectContainerStyle(projectId) → { color, icon: "briefcase" }`
  (deterministic hash of the id).
- `isSharedSite(project, host) → boolean` (pattern-aware, `hostMatches`);
  only explicitly confirmed shared-site patterns take effect.
- `routeForUrl({ project, url, defaultUserContextId }) → { userContextId, reason: "project" | "shared_site" | "no_container" | "not_web" }`.
  `defaultUserContextId` must be an integer in 0–4294967294; a reserved,
  out-of-range or noninteger default raises `INVALID_INPUT`. Non-http(s)
  URLs → `not_web` with the default. No valid public project container
  yet → `no_container` with the default. Unconfirmed shared-site patterns
  keep a web URL in the project container.
- `INTEGRATION_HOSTS` (fixed): `vercel.com`, `dashboard.convex.dev`,
  `dashboard.clerk.com`, `dashboard.stripe.com`, `supabase.com`,
  `console.firebase.google.com`, `dash.cloudflare.com`, `app.netlify.com`,
  `fly.io`, `sentry.io` (+ subdomains where noted in code).
  `accountKeyForHost(project, host) → string | null` returns the integration
  id whose host matches, else an `accounts[].key` host pattern that matches.
- `validateAccountLabel(s) → string` (trimmed) or `INVALID_INPUT`.

The DOM-free browser controller owns one assignment queue for the service
process. Container IDs are persisted by compare-and-set inside the profile
store before any new-tab route is returned. Identity deletion or container-pref
reset revokes in-flight routes immediately; failed mapping cleanup blocks retry.
Project removal retains the identity and its browsing data. Account labels are
manual profile metadata only, and no page cookie or account name is read.

Chromium requires a separate CEF request context per Gecko project container,
with no fallback to a shared jar; confirmed shared sites use the space default
context. The CEF workstream owns creation, lifetime, privacy and storage mapping.
This worktree does not implement that engine path. Until native request-context
isolation is verified, project account routing to Chromium is unavailable.

## 4. Arrival (P1, new `packages/contexts/src/arrival.mjs`)

- `loopbackPort(url) → number | null` — http(s) URL on `localhost`,
  `127.0.0.1` or `[::1]` (never `0.0.0.0`, never other hosts), explicit port
  or the scheme default.
- `LSOF_LISTEN_ARGS(port)` → the fixed argument array
  `["-nP", "-a", "-iTCP:<port>", "-sTCP:LISTEN", "-F", "pun"]` (port is an
  integer 1–65535, else `INVALID_INPUT`). `LSOF_CWD_ARGS(pid)` →
  `["-nP", "-a", "-p", "<pid>", "-d", "cwd", "-F", "pn"]`.
- Native Gecko executes lsof through a fixed checksum-pinned supervisor,
  preserving Gecko's inherited FD3 exit sentinel. It accepts only `listen
  PORT UID` or `cwd PID UID`, verifies UID against the OS owner, and retains
  the exact selectors above with `-u UID` ANDed. There is no direct-lsof
  fallback or actor-selected executable/environment/cwd. The helper checks
  its own regular canonical file, UID/link count, mode 0400 and private parent
  mode 0700 before lsof. The installer checks the same boundary; Gecko checks
  path/type/mode/hash, without claiming an unavailable UID metadata API.
  The operation has a 2.60-second deadline, 1 MiB stdout and 16 KiB stderr cap;
  failure releases no partial stdout. Control-pipe EOF, parent loss, signals
  and abrupt helper death cancel and reap the isolated owned child group.
  The arrival adapter keeps its overall three-second deadline and fixed
  failure refusal before filesystem inspection.
- `parseLsofListen(text, { uid }) → [{ pid }]` — `-F` field output (`p`, `u`,
  `n` lines); only processes whose `u` equals `uid` and whose `n` is a
  loopback address (`127.0.0.1:`, `[::1]:`, `localhost:`, `*:`) are kept. At
  most 8, unique pids. Hostile input never throws.
- `parseLsofCwd(text) → string | null` — the `n` of the `fcwd` entry;
  absolute, no NUL, ≤ 4096.
- `rootCandidates(cwd, { home, roots? }) → string[]` — `cwd` and its ancestors,
  deepest first, at most 6. The optional privileged `roots` array allows
  reference projects outside home; native configuration includes
  `/Volumes/T9/Code`. Candidates stay strictly below the deepest matching
  allowed base, never `/`, `home` or a configured base itself. No match → `[]`.
  Chrome canonicalizes bases/cwd, rejects system/profile/credential directories,
  and rechecks own-UID process cwd before issuing any proposal. Pages cannot
  supply roots, PIDs, UID, executables or folder paths.
- `chooseArrivalRoot(candidates, present) → string | null` — `present` maps
  `<dir>/.git` → `"file" | "dir"`; returns the nearest ancestor holding `.git`,
  else `candidates[0]`.
- `arrivalOffer({ url, root, projects }) → { kind: "known", project_id } | { kind: "new", root, name } | null`
  — `known` when a project's `root` equals `root` (or contains it);
  `name` is the last path segment.

### 4.1 Surface matching

`matchSurfaceForUrl(projects, url) → { project_id, surface } | null` — a URL on
`github.com`/`bitbucket.org` whose owner/repository path segments equal a
project's `repository` surface (case-insensitive), or `gitlab.com` whose complete
repository path (including subgroups) matches on segment boundaries. A terminal
`.git` suffix is ignored. Vercel matches `/team/project` of a stored `hosting`
surface; a sibling GitLab repository never inherits another project's match.
Ambiguity → the first project in list order. This links a tab to an existing
project; it never discovers folders (no scanning).

## 5. Agent status (P3, new `packages/contexts/src/agent-status.mjs`)

Agents report through `axiosozo-notify` (repo `tools/axiosozo-notify`) over the
local channel (§7). The core turns raw hook payloads into status records:

```jsonc
{ "version": 1, "id": "as_<16 hex>", "project_path": "/abs/path", "agent": "claude-code" | "codex" | "other",
  "state": "started" | "needs_input" | "done" | "failed", "title": "≤ 120 chars", "at": <epoch ms>,
  "session": "≤ 64 chars opaque" | null }
```

- `parseHookEvent({ source, event, cwd, payload, now, id }) → record | null`:
  - `source: "claude-code"`: `event` `Stop` → `done`, `Notification` →
    `needs_input`, `UserPromptSubmit`/`SessionStart` → `started`,
    `SubagentStop` → ignored (`null`). `payload` is the hook's stdin JSON
    (object). `title`: `payload.message` for Notification, else a fixed text
    (`"Agent finished"`, `"Agent started"`), never the transcript.
    `payload.cwd` is used when it is absolute, else `cwd`. `session` from
    `payload.session_id`.
  - `source: "codex"`: payload is the `notify` JSON; `type` `agent-turn-complete`
    → `done`; title = first 120 chars of `last-assistant-message` collapsed,
    else `"Agent finished"`. Other types → `null`.
  - `source: "manual"`: `event` is the state itself; `payload.title` string.
  - Payload ≤ 64 KiB serialized; anything malformed → `null`, never throws.
- `validateStatusRecord(v)`, `STATUS_STATES`.
- `statusBoard(records, { now, keepMs = 24 h }) → [{ project_path, latest, history }]`
  newest first, ≤ 20 per project, older than `keepMs` dropped.
- `hookConfig({ agent: "claude-code" | "codex", notifyPath, socketPath }) → string`
  constructs copyable config only. Paths are canonical absolute lexical strings,
  controls/unpaired surrogates/placeholders are refused; socket path ≤100 UTF-8
  bytes. A trusted browser caller supplies the actual native-verified socket and
  installed script path; pages cannot supply either. Claude hooks use direct exec
  `/usr/bin/env` with one literal socket assignment, `/bin/sh`, script filename,
  agent and event as separate arguments. Codex uses that argv as `notify` in its
  user-level config. No shell `-c`, interpolation, installation or execution.
- `bridgeConfig({ agent, nodePath, bridgePath, socketPath }) → string` similarly
  constructs direct executable/argv/environment snippets; Step 8 owns native
  bridge availability and confirmation. Constructing a snippet grants nothing.

### 5.1 Native handoff (P3)

`AgentHandoff.sys.mjs` is DOM-free and takes injected native tab observation,
clipboard and test-only terminal adapters. The closed version-1 context contains
request ID, timestamp, optional known project ID/root, page URL/title/selection/
PNG, bounded console errors and task text. URLs omit query and fragment; context
text is explicitly selected user data, not universally secret-sanitized. Limits:
URL4096, title512, selection16384, task8192, 50 errors of 1000 characters, PNG1MiB
and maximum side1280, total serialized context1.5MiB. Images are optional and
require separately verified native capture; console data stays empty until P5.

Only a trusted chrome action can authorize the exact request object once. Content
actors cannot grant a handoff. Native normal-window, HTTP(S), sensitive-host,
password and current-document checks precede any title/selection/image read and
are repeated around awaits. Unknown facts deny. Project authority is captured
at quiescence and checked synchronously together with tab/global/navigation and
cancellation immediately before a clipboard write. No await separates that final
check from the native side effect. Navigation, selection/ownership changes,
project mutations, dismissal and teardown invalidate pending work.

Production terminal launches remain NOT_AUTHORIZED; undocumented desktop schemes
are UNVERIFIED_CAPABILITY. The user can explicitly choose clipboard fallback.
An uncertain external launch never falls back and duplicates the handoff. A
real terminal fake-agent acceptance test is separate from injected pure tests;
unverified native cleanup cannot count as a successful terminal launch.

`createNativeTerminalHandoffFixture({ signal, isActive })` is a privileged,
synthetic-only constructor. Its exact environment/profile/policy namespace and
checksum-pinned helper admit only the fixed fake; missing configuration returns
null and invalid requested configuration refuses. The synchronous `isActive`
callback must still attest the same sending session, selected native tab and
current project authority around each policy await, immediately before dispatch,
after child adoption and at the context write. It is never page or actor data.
Constructing this adapter and launching are separate from the trusted user click.

The helper sends structured context on stdin, opens stock Terminal using fixed
argv and a fixed wrapper, and executes the unchanged known fake from verified
immutable bytes. Its no-descendant fixture owns only its retained direct child:
non-reaping kernel observation precedes any signal, observed exit skips signalling,
and final reap irrevocably ends signal authority. Generic group cleanup keeps
its separate conservative behavior. A delivery acknowledgement proves start,
not task completion; the native acceptance gate also needs the exact fresh fake
proof, child exit and owned state cleanup. Product-agent and arbitrary-descendant
capability are not inferred from this fixture.

## 6. Understand tier (§4, `packages/provider-host`)

See [understand-v1](understand-v1.md).

## 7. Local agent channel (P3/P4)

See [agent-channel-v1](agent-channel-v1.md).

## 8. Changelog

- 2 October 2026 — created for Plan 4.
