# Contexts, projects and site rules — module interfaces, version 1

Owner: integration lead. This file fixes the seams between the workstreams in
[HANDOFF_3](../docs/HANDOFF_3.md) §7 so they can work in parallel. Data shapes
are defined by [context-v1](context-v1.schema.json),
[site-rule-v1](site-rule-v1.schema.json) and [decision-v1](decision-v1.md).
A change to any name below goes through the lead.

## 1. Layers

```
packages/contexts/src/*.mjs      pure logic, DOM-free, Node-tested     (contexts core)
        │  packaged verbatim into chrome://browser/content/axiosozo/contexts/
        ▼
apps/browser/chrome/
  ZenWorkspaceAdapter.sys.mjs    the ONLY module that touches Zen APIs  (frontend: services)
  JsonStore.sys.mjs              atomic serialized profile JSON         (frontend: services)
  AxioSozoServices.sys.mjs       process-wide model + events            (frontend: services)
  AboutAxioSozo*.sys.mjs, overview/  about:axiosozo page + actor        (frontend: overview)
  DevLoop.sys.mjs                F4 pill, project block, waiting page   (frontend: runtime)
  SiteRuleRuntime.sys.mjs        F5 ledger recorder, indicator, effects (frontend: runtime)
  EnginePreference.sys.mjs       F6 applying preferences                (frontend: runtime)
packages/provider-host           decision/site_rule host method          (providers)
native/chromium-host, CEF*.sys.mjs  engine-preference hook              (CEF)
```

## 2. Contexts core (`packages/contexts`)

Rules for every file in `packages/contexts/src/`:

- Plain ES modules, `.mjs`, relative imports only. **No** `node:` imports, no
  `fs`, `process`, `Buffer`, `fetch`, timers, DOM or `Services`. The same bytes
  load in Node tests and in privileged chrome.
- No file access and no execution. Callers pass file contents in.
- Deterministic: time is passed in (`now` epoch ms plus a local-time breakdown
  where needed). No `Date.now()` / `new Date()` without an argument.
- Errors: `throw new ContextsError(code, message, path?)` from `errors.mjs`.
  Codes are upper-snake strings (`INVALID_RULE`, `INVALID_MANIFEST`, …).
- Validators return a frozen, normalized copy and reject unknown keys.
- `index.mjs` re-exports everything below.

| Module | Exports |
| --- | --- |
| `errors.mjs` | `class ContextsError extends Error { code; path }` |
| `schema.mjs` | `validateContextMetadata(v)`, `validateProject(v)`, `validateManifest(v)`, `validateContextStore(v)`, `validateSiteRule(v)`, `validateRuleStore(v)`, `validateLedger(v)`, `validateLedgerRecord(v)`, `validateHostPattern(s)`, `validateBaseUrl(s)`, `newRule({now, id}) → siteRule` (defaults: enabled true, contexts "all", observation "none", effects ["nudge"], override "confirm", limits nulls, agents none), `DEFAULT_RULE_STORE`, `DEFAULT_LEDGER`, `EFFECTS`, `OUTCOMES`, `REASON_CODES` |
| `detect.mjs` | `MAX_FILE_BYTES = 262144`, `DETECTION_FILES` (exact relative paths, see §2.1), `isAllowedPath(rel)`, `detectProject({ rootName, files }) → detectionDraft` where `files` is `{ [relPath]: string }` of files the caller actually read, plus `refused` passed through as `{ path, reason }[]` |
| `manifest.mjs` | `MANIFEST_PATH = ".axiosozo/project.json"`, `draftToManifest(draft, edits) → manifest`, `parseManifest(text) → manifest`, `serializeManifest(manifest) → string` (stable key order, 2-space indent, trailing newline), `assertNoSecrets(manifest)` |
| `environments.mjs` | `ENV_ORDER = ["local","preview","production"]`, `orderedEnvironments(project)`, `matchEnvironment(environments, url) → { environment, rest: { path, search, hash } } \| null`, `switchEnvironment(environments, url, targetName) → string \| null` (preserves path below the base prefix, query and fragment), `isDeclaredLocalOrigin(environments, url) → boolean` (true only for a declared environment whose host is `localhost`, `127.0.0.1` or `[::1]`) |
| `rules.mjs` | `hostMatches(pattern, host)`, `ruleMatches(rule, { host, contextUuid, contextType })`, `rulesFor(rules, { host, contextUuid, contextType })`, `evaluateDeterministic({ rule, usageTodayMs, local: { day, minutes, weekday }, contextUuid, suppressions, now }) → evaluation`, `applyJevOutcome(rule, outcome, reasonCode) → evaluation` (drops unlisted effects to none), `effectiveObservation(rule, host) → "none"\|"address"\|"outline"`, `isSensitiveHost(host) → { sensitive, category }`, `SENSITIVE_HOSTS_VERSION = "sensitive-hosts-v1"`, `suppress({ ruleId, contextUuid, effect, now }) → suppression` (nudge 5 min, pause_site / suggest_leave 15 min), `OVERRIDE_DELAY_MS = 10000` |
| `ledger.mjs` | `localDay({ year, month, day }) → "YYYY-MM-DD"`, `recordForeground(ledger, { day, host, contextUuid, ms }) → ledger` (merges, clamps to 24 h), `usageFor(ledger, { day, hosts: hostPattern[], contextUuid? }) → ms` (pattern-aware, sums contexts when `contextUuid` is undefined), `prune(ledger, { today }) → ledger`, `summarize(ledger, { today, days }) → [{ host, context_uuid, total_ms, by_day }]`, `exportLedger(ledger) → string` (JSON), `clearLedger() → DEFAULT_LEDGER` |
| `checkpoints.mjs` | `DEFAULT_INTERVAL_MINUTES = 5`, `DEFAULT_HOURLY_BUDGET = 30`, `createBudget()`, `takeBudget(budget, { now, limit }) → { ok, budget }` (rolling hour), `nextCheckpoint({ lastAt, intervalMinutes, now, foreground, isPrivate }) → boolean`, `buildSiteRuleRequest({ rule, contextType, checkpoint, elapsed, observation, requestId, now }) → decision-v1 request` (applies the observation cap, trims outline) |

### 2.1 Detection allowlist

Exactly these relative paths (and nothing else) may be read by chrome for
detection; each ≤ 256 KiB, regular file, `lstat`-checked, symlinks refused if
they resolve outside the root:

`package.json`, `.vercel/project.json`, `vercel.json`, `netlify.toml`,
`wrangler.toml`, `wrangler.json`, `fly.toml`, `docker-compose.yml`,
`docker-compose.yaml`, `compose.yml`, `compose.yaml`, `src-tauri/tauri.conf.json`,
`tauri.conf.json`, `electron-builder.json`, `electron-builder.yml`,
`Cargo.toml`, `pyproject.toml`, `go.mod`, `.git/config`, `.axiosozo/project.json`.

A symlink that stays inside the root is followed only when it resolves to
another allowlisted path (`detectionRefusal` in `detect.mjs`), so
`package.json -> .env` is refused before anything is opened.

`.git/config` is read only to extract `[remote "…"] url` values; userinfo
(credentials) in remote URLs is stripped before anything is stored, and nothing
else in `.git` is read. `.env*`, key files, credential stores, `node_modules`,
build output and every path not listed are never opened. Nothing is executed.

## 3. Chrome-side services

### 3.1 `ZenWorkspaceAdapter.sys.mjs`

The single adapter for every Zen API call (§2.6 of the handoff). Per window:

```js
export class ZenWorkspaceAdapter {
  constructor(window)
  listWorkspaces()            // → [{ uuid, name, icon, containerTabId }]  (containerTabId 0 = none)
  activeWorkspaceUuid()       // → uuid | null
  workspaceForTab(tab)        // → uuid | null
  containerForWorkspace(uuid) // → userContextId (0 = default)
  isPrivateWindow()           // → boolean
  selectedTab()               // → tab
  onChange(callback)          // callback({ kind: "created"|"deleted"|"renamed"|"switched", uuid }) → unsubscribe()
  dispose()
}
export const ZEN_ADAPTER_CONTRACT = [...]  // names of Zen globals/methods relied upon; adapter tests check them
```

### 3.2 `JsonStore.sys.mjs`

```js
export class JsonStore {
  constructor({ storage, validate, empty })  // storage: { read() → string|null, write(text) }
  load()                                     // → validated doc; invalid file → throws, never overwrites it
  update(mutator)                            // serialized; mutator(doc) → nextDoc; validated before write
}
export function profileStorage(relativePath) // IOUtils atomic write (tmpPath) under <profile>/axiosozo/
```

### 3.3 `AxioSozoServices.sys.mjs`

A process-wide singleton (`AxioSozoServices.get()`), created lazily on first
use. It owns the three stores (`contexts.json`, `site-rules.json`,
`usage-ledger.json`) and emits events. Every method validates input with the
contexts core. Methods return plain JSON-cloneable data.

```
contexts:  listContexts() → [{ uuid, name, icon, type, organization_uuid, project_id, engine_preference, container }]
           setContextType(uuid, type), linkOrganization(uuid, orgUuid|null),
           linkProject(uuid, projectId|null), setEnginePreference(uuid, engine|null),
           listOrphans() → contextMetadata[], removeOrphans(uuids)
projects:  listProjects(), getProject(id), pickFolder(window) → root|null,
           detect(root) → detectionDraft, confirmProject({ root, manifest, contextUuid }) → project,
           writeManifest(projectId) → { path }, updateProject(id, patch), removeProject(id),
           projectForUrl(url, contextUuid?) → { project, environment } | null
services:  serviceStatus(projectId) → [{ name, url, port, status: "up"|"down"|"unknown", checked_at }]
           (only loopback services — localhost, 127.0.0.1, [::1] — are probed, by a
           TCP connect to the declared port; every other service is "unknown" and
           causes no network traffic; never from private windows; rate-limited)
rules:     listRules(), saveRule(rule), deleteRule(id), getJevSettings(), setJevSettings(patch)
ledger:    usageSummary({ days }), exportLedger() → string, clearLedger()
attention: needsAttention() → [{ kind: "service_down"|"rule_limit_reached", title, detail, target }]
events:    on(name, cb) → unsubscribe;  names: "contexts", "projects", "rules", "ledger", "services", "attention"
```

Orphans: metadata whose workspace UUID no longer exists in any window. They
are offered for cleanup in the Overview and never silently reused or applied.

### 3.4 `about:axiosozo` and its actor

- Registered at runtime from chrome as an `nsIAboutModule` (no C++ change),
  in the parent and in `privilegedabout` processes only (process script).
  Flags: `IS_SECURE_CHROME_UI | ALLOW_SCRIPT | URI_MUST_LOAD_IN_CHILD |
  URI_CAN_LOAD_IN_PRIVILEGEDABOUT_PROCESS | HIDE_FROM_ABOUTABOUT`; **no**
  `URI_SAFE_FOR_UNTRUSTED_CONTENT`, so web content cannot link, frame or
  navigate to it. `newChannel()` sets `channel.owner = null` so the page runs
  with the `about:axiosozo` content principal, never the system principal.
  Firefox's `nsAboutProtocolHandler.cpp` has a diagnostic assertion against
  this flag combination that is compiled out of release/beta builds; a
  Nightly/debug build would need a different registration.
- The page is a local document from the chrome JAR with a strict CSP:
  `default-src 'none'; script-src chrome:; style-src chrome:; img-src chrome: data:; object-src 'none'; frame-ancestors 'none'; form-action 'none'`.
  No remote resources. `frame-ancestors` is ignored in a meta CSP; framing is still
  refused because the URI is not loadable by any content principal.
- One JSWindowActor pair `AxioSozoOverview` (`AboutAxioSozoParent.sys.mjs` /
  `AboutAxioSozoChild.sys.mjs`), `matches: ["about:axiosozo*"]`,
  `remoteTypes: ["privilegedabout"]`, registered once per process.
- The child exposes to the page only `window.AxioSozoOverview.request(name,
  params)` and `.subscribe(callback)`. The parent validates the sender's
  principal/URI and dispatches only this closed method list to
  `AxioSozoServices`: every method in §3.3 except `pickFolder` (the parent calls
  it with the requesting browser's top window), plus `openContext(uuid)`,
  `openUrl(url)` (http/https only, opened in a new tab in the right workspace)
  and the read-only `getOverviewFlags()`. `detect` and `confirmProject` accept
  only a folder picked with the native picker in the same page instance, and
  `updateProject` accepts only `manifest` and `context_uuid`.

### 3.5 Runtime modules

Each exports one installer called from `AxioSozoStartup.mjs` per window and
returns `{ dispose() }`:

```js
installDevLoop(window, { services, adapter })          // DevLoop.sys.mjs
installSiteRuleRuntime(window, { services, adapter, decide }) // SiteRuleRuntime.sys.mjs
installEnginePreference(window, { services, adapter, engineProbe }) // EnginePreference.sys.mjs
```

`decide(request, { signal })` is supplied by startup and calls the provider
host `decision/site_rule` on demand; it resolves to a decision-v1 result and
never rejects (failures resolve to outcome `none`).

## 4. Preferences

| Pref | Default | Meaning |
| --- | --- | --- |
| `axiosozo.foundation.enabled` | true | existing kill switch |
| `axiosozo.contexts.enabled` | true | F1–F5 |
| `axiosozo.engine.preferences.enabled` | false | F6, experimental until E1/E2 pass |
| `axiosozo.jev.keyEntry.enabled` | false | production key entry (open decision 4) |

## 5. Engine preference hook (CEF workstream)

`EngineProbeControls` exposes, on the object returned by
`installEngineProbeControls`, a method
`applyEnginePreference(tab, engine, { reason }) → Promise<{ applied: boolean, engine, error? }>`.
`firefox` is a no-op when already Gecko. `chromium` uses the existing per-tab
switch and keeps the Firefox tab on any failure. It never runs for private
windows, privileged URLs or while the switch is unavailable, and it returns
`{ applied: false, error: "UNAVAILABLE" }` instead of throwing.

Implemented error codes (checked in this order): `INVALID_ENGINE`, `DISABLED`
(pref off), `UNAVAILABLE`, `PRIVATE`, `UNKNOWN_TAB`, `PENDING`,
`UNSUPPORTED_URL`, `CANCELLED`, `SWITCH_FAILED`. Already on the requested
engine → `{ applied: false, engine }` with no error. `window.AxioSozo.engineProbe`
is `null` when per-tab switching is off; callers treat that as `UNAVAILABLE`.
See `contracts/cef-v1.md`.

## 6. Security review amendments (27 September 2026)

From the lead's security review of the new boundaries; these override the
sections above where they differ.

- Core: `stripQueryAndFragment` is exported from `schema.mjs`. Manifest service
  and surface URLs reject query strings and fragments; detection strips them.
- `JsonStore`: reads are capped at 16 MiB; a larger file is `INVALID_STORE` and
  is never overwritten.
- `writeManifest` writes a random temp name with O_EXCL (`mode: "create"`) and
  renames it over `project.json`; it never follows a symlink and re-checks
  `.axiosozo` and `project.json` with `lstat` before and after the rename.
- Detection re-resolves each path after reading and refuses on mismatch.
- `serviceStatus`: loopback TCP only; other services are `unknown` with
  `checked_at: null`. DevLoop never probes from private windows.
- URLs that come from a page or a manifest (`openUrl`, `openTab`, environment
  switch) open through `openWebLinkIn` with a null principal carrying the
  container, never the system principal.
- `recordForeground` returns `false` once the pending batch cap (4096) is
  reached while the ledger file is invalid.
- Site-rule runtime: the commit checkpoint fires after the top-level load of
  the same document finishes and uses that document's `contentTitle` only
  (never the tab label). A Jev call requires the outgoing-data indicator to be
  mounted and visible (fail closed, e.g. when the toolbar is hidden). Revoking
  consent aborts in-flight decisions and drops their answers.
- Packaging ships only files git lists as tracked or untracked-not-ignored and
  refuses symlinks.
