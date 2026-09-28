# Handoff 3 — contexts, site rules and a first public preview

Date: 27 September 2026. Status: **PARTIAL_ENGINE_BLOCKED; not READY.** This
handoff sets the product direction and splits the next step into workstreams
that a lead agent can hand to sub-agents. It does not change any existing gate
in [setup status](SETUP_STATUS.md), and [AGENTS.md](../AGENTS.md) still applies
in full.

## 1. Product in one paragraph

AxioSozo is a calm Zen/Gecko browser for developers and founders. It organizes
the browser around **contexts** (personal, organization, project) and becomes
the place where work is **seen, handed off and verified**. Coding agents such as
Codex and Claude Code write the code. AxioSozo contributes what they lack: the
user's signed-in web, a long-lived overview across projects, and the moment of
seeing a problem. It also offers per-tab Firefox/Chromium switching and
**site rules**: plain-language instructions per website that the browser enforces
locally, with optional judgement from Jev and, later, the user's own agents.

What coding agents cannot do, and where this project therefore focuses:

- **Signed-in sessions.** Agents are not logged in to hosting, payments, banking,
  government or social sites. The user's browser is.
- **Continuity.** Agents exist only for the length of a session. Nothing watches
  production, deadlines or five projects at once.
- **The moment of seeing.** The user sees the bug; the agent receives a description.
- **Real engines and the real profile**, including extensions, containers, and
  Gecko and Chromium side by side.
- **Attention.** Nothing helps the user spend time on the web the way they intend.

We do not build an editor, a terminal, an agent loop or a model.

## 2. Non-negotiable principles

1. **Zen stays the frontend.** Keep stock Zen look, motion and calm. Additions
   are few, small and native-looking. They use Zen/Firefox design tokens and
   existing menus. Add no chat sidebar, no web-app dashboard and no page-injected
   UI. The only exception is chrome-owned highlight layers (M2).
2. **Universal, not site-specific.** Write no custom code for X, YouTube or any
   other site. Site-specific behavior comes only from user-written site rules.
3. **Useful without AI.** Every feature has a deterministic baseline. Jev and
   provider agents add judgement, never a hard dependency. Normal browsing
   makes zero Jev or provider calls.
4. **Suggest, don't act.** Jev picks from a fixed, versioned menu. The browser
   executes only typed, reversible, browser-local effects. Anything that submits,
   pays, publishes or posts on a site requires explicit user confirmation.
5. **Local-first.** Add no AxioSozo account, server or telemetry. Teams share
   project setup through a manifest in their repository.
6. **Thin overlay.** New code lives in our own modules. Touchpoints in Zen/Firefox
   files stay minimal and hash-guarded (`patches/zen/overlay.json`). Every Zen API
   we call goes through one adapter module so that an upstream change is fixed
   in one place.
7. **Evidence rules stay.** Real commands, fixtures and screenshots only. Use
   synthetic profiles and loopback fixtures. Never read personal profile data or
   credentials. Never make a live provider or Jev call without separate explicit
   authorization.

## 3. Baseline at the time of writing

The working branch is `zen-reset`. It has uncommitted work in progress; read
`git status` before starting and coordinate with whoever owns those changes.

| Component | State | Paths |
| --- | --- | --- |
| Zen app | Pinned Zen/Firefox 156.0 builds and runs on macOS arm64. The frontend is **stock Zen** plus the AxioSozo startup hook; all look-and-feel overlays are retired. | `scripts/zen.py`, `patches/zen/`, `apps/browser/chrome/AxioSozoStartup.mjs` |
| Engine switch | Per-tab Firefox/Chromium switch in Zen's tab context menu, plus a Chromium badge in the address bar. One shared Chromium host with a persistent profile beside the Zen profile. Live runs are **blocked on the macOS Keychain "Chromium Safe Storage" approval**. E1/E2 are not passed. | `native/chromium-host/`, `CEFEngineAdapter.sys.mjs`, `CEFPresenter.sys.mjs`, `EngineProbeControls.sys.mjs`, `contracts/cef-v1.md` |
| Coordinator | Rust target registry with one-use grants over inherited pipes, created on demand. | `crates/browser-core/`, `BrowserCoordinator.sys.mjs`, `contracts/ipc-v1.schema.json` |
| Provider host | On-demand stdio host, conversation transport v1, Codex/Claude Code routes `EXPERIMENTAL_LIVE`. Live auth is not established. Its UI is not loaded after the reset. | `packages/provider-host/`, `contracts/provider-v1.md`, `ProviderPanel.sys.mjs`, `ProviderConversation.sys.mjs` |
| Jev | `DecisionProvider` (`jev-1.13.0`) with a fixed choice set, a 30 s deadline, a 32 KiB output cap and a Keychain-held key. Only the synthetic diagnostic is enabled; production key entry ships (decision 4) — Keychain-only, presence shown, no live call on store. | `packages/provider-host/src/decision.mjs`, `keychain.mjs` |
| Saved pages, palette | Code exists, but it was retired from the frontend at the reset. It can be reused as a persistence pattern. | `SavedPages.sys.mjs`, `BrowserExperience.sys.mjs` |
| Source | Public at https://github.com/AxioSOzo/AxioSozo-browser (MPL-2.0). No releases and no signed build. | `LICENSE`, `THIRD_PARTY_NOTICES.md` |

## 4. Concepts

### 4.1 Context

A context is a **Zen workspace with a type**. Do not invent a parallel sidebar
concept.

| Type | Meaning | Examples of surfaces |
| --- | --- | --- |
| `personal` | Default for every existing workspace | — |
| `organization` | A company or team (for example a Dutch BV) | tax authority, chamber of commerce, bank, bookkeeping, subscriptions |
| `project` | Something being built; may belong to an organization | repository, environments, dashboards, services |

Every context has:

- an identity: the Zen workspace's default container, so cookies are separate
  per context
- pinned surfaces: ordinary Zen pinned tabs
- an optional engine preference
- the site rules that apply in it

AxioSozo metadata is keyed by workspace UUID in profile-local storage. It never
alters Zen's own workspace store schema. If a workspace is deleted, its orphaned
metadata is offered for cleanup, never silently reused. The UI name ("context")
is provisional.

### 4.2 Project

A project is a local folder plus confirmed metadata. Kinds:

| Kind | Local loop | Web surfaces |
| --- | --- | --- |
| `web` | dev server URLs, environment switch | hosting, analytics, payments |
| `desktop` (Tauri, Electron, native) | Tauri/Electron dev URL when one exists; otherwise none | releases, CI, crash reports, update feed, download page |
| `library` / `cli` | none in M1 | package registry, docs, issues, CI |
| `mobile` | none in M1 | TestFlight, App Store Connect, Play Console |

For non-web projects the browser is not the runtime. It manages the surfaces
around the project, and that is intentional.

An environment is `{name, base_url}`, for example `local → http://localhost:5173`
and `production → https://example.com`. A service is `{name, url, port}` and is
declared or detected, never discovered by scanning the system.

**Manifest.** `.axiosozo/project.json` lives in the repository. Detection
produces a draft, the user confirms it, and they may commit it so that team
members get the same project context. The manifest holds names, URLs, ports,
surfaces and (M2) service commands. It never holds secrets.

### 4.3 Site rule

A site rule is a plain-language instruction for a set of hosts, plus the
structured fields that make it enforceable without AI:

```json
{
  "version": 1,
  "id": "r_7f3a",
  "match": { "hosts": ["x.com", "*.x.com"] },
  "contexts": "all",
  "instruction": "I come here to post and answer mentions. If I drift into the feed, nudge me.",
  "limits": { "daily_minutes": 15, "allowed_hours": null },
  "observation": "outline",
  "effects": ["nudge", "suggest_leave", "pause_site"],
  "override": "confirm",
  "agents": { "access": "none", "instruction": "" }
}
```

- `limits` and `allowed_hours` are the deterministic screen-time layer.
- `instruction` is the text Jev (and later agents) use for judgement.
- `observation` is the user's privacy choice (§6.3).
- `effects` is the subset of the effect menu this rule may trigger.
- `override` sets the friction for continuing anyway: `none`, `confirm` or
  `delay_10s`. The user can always continue; a rule never traps them.
- `agents` is part of the schema from v1 but is ignored until M2. It governs what
  the user's agents may do on these hosts. The human's limits never restrict
  agents, and agents never see the usage ledger unless the user allows it.

### 4.4 Usage ledger

The usage ledger records local foreground time per host, per context, per day.
It supplies the screen-time numbers and rule limits. It is never uploaded, is
kept for 90 days by default, and can be viewed, exported and deleted from the
Overview. Private windows are not recorded.

## 5. Milestones

### M1 — the first basic step

| ID | Feature | Acceptance (real app, synthetic profile, loopback fixtures) |
| --- | --- | --- |
| F1 | **Contexts on workspaces.** Mark a workspace as personal, organization or project; organization/project links. | Type survives restart. Container isolation is shown with two fixture identities. Deleting a workspace leaves no active orphan. |
| F2 | **Overview page** `about:axiosozo`: a "Needs attention" list (M1 sources: service down, rule limits reached), then contexts, projects and site rules. Projects are added and managed here. | Keyboard and VoiceOver reachable. Styled with Zen tokens in light and dark. Not navigable from web content. |
| F3 | **Add project.** Native folder picker, static detection (§6.1), draft review, optional manifest write. | Fixture repos for Vite, Next, Tauri and plain library produce the expected drafts. `.env*` and files outside the root are never read. |
| F4 | **Dev loop.** An environment pill in the address bar on project URLs switches `local ↔ preview ↔ production` on the same path. Services show status by probing declared ports. On a declared local URL, a chrome-owned "waiting for server" page replaces the connection error and loads once the port answers. | Path is preserved across environments. The waiting page shows only for declared origins; neterror is unchanged everywhere else. |
| F5 | **Site rules and screen time.** Rule editor (structured fields plus free text), a rule indicator in the address bar identity area, the usage ledger, deterministic limits and effects, and optional Jev judgement (§6.2). | Works fully without a Jev key. Jev path tested with fixtures only until a live call is authorized. The user sees an indicator on every call that sends data out. |
| F6 | **Engine preference** per site or context, applied through the existing per-tab switch. | Stays behind the experimental flag until E1/E2 pass. Failure keeps the Firefox tab. |
| F7 | **Preview release pipeline**, prepared but not published (§8). | Signed, notarized DMG built locally from a clean tree. Nothing uploaded without authorization. |

M1 does not require Chromium general browsing, live provider auth or live Jev.
It must be valuable on Gecko alone.

### M2 — agents and suggestions (after M1 is verified)

- **Send to agent.** An element, console error, failed request or page is sent
  as a structured task to Codex or Claude Code in the project folder. The task
  shows as status on the project, never as a chat sidebar. Done means the
  relevant page reloads for verification.
- **Browser as a tool for the user's agents.** Scoped to one context, visible to
  the user, and governed by the rule `agents` section. Reading (console,
  network, pages, downloads) comes first. Acting comes later, with confirmation
  before submit, pay or publish. Built on the coordinator's grant model; agents
  never receive grant-issuing authority.
- **Rule compilation.** The user's provider turns free text into proposed
  structured rule fields, which the user confirms.
- **Jev page highlights.** Jev receives the outline with opaque element IDs and
  may return up to three IDs from a fixed purpose menu (relevant, error,
  belongs-to-context). The browser draws a chrome-only anonymous-content
  highlight that pages cannot read or spoof. Acceptance uses one non-conflicting
  shortcut; plain Tab stays reserved for page focus navigation.
- **Service start/stop** from manifest commands. Only for trusted projects, run
  through Firefox `Subprocess` without a shell, with bounded logs and the
  process group reaped on stop or quit.

### Later

- **Organization admin:** obligations calendar from a template the user confirms,
  collection of monthly invoices from signed-in dashboards, form help on
  government sites (the user always signs in and submits).
- **Cross-engine visual check.**
- **Context routing suggestions**, for example "this link belongs to the BV".

## 6. Design details

### 6.1 Project detection

Detection is static, read-only and allowlisted. Each file is capped at 256 KiB.
Symlinks that leave the root are refused, and `node_modules`, `.git` internals
and build output are never traversed.

| Source | Detected |
| --- | --- |
| `package.json` `scripts` | dev command framework and explicit `--port` / `-p` |
| framework defaults (Vite 5173, Next 3000, Astro 4321, …) | fallback local URL, marked as a guess |
| `.vercel/project.json`, `vercel.json` | Vercel project identity (not the production URL) |
| `netlify.toml`, `wrangler.toml`, `fly.toml` | host/app name, routes or custom domains when declared |
| `docker-compose.yml` | published ports |
| `tauri.conf.json`, Electron builder config | desktop kind, dev URL |
| `Cargo.toml`, `pyproject.toml`, `go.mod` | library/CLI kind |
| git remote | repository, issues, CI and releases surfaces |

Never read `.env*` files, key files or credential stores, and never execute
anything. Everything detected is a draft until the user confirms it.

### 6.2 Site rule evaluation

Evaluation has three layers, and each lower layer works without the ones above:

1. **Deterministic (local, always on).** Match host and context, update the
   ledger, and apply `limits` and `allowed_hours` → `nudge` / `pause_site`.
2. **Jev (optional, needs key and consent).** At checkpoints, send the rule
   instruction, observation payload, elapsed time and context type. Checkpoints
   are: page commit on a matching host, then every 5 minutes (1–30,
   configurable) while the tab is in the foreground. Background tabs and
   private windows never trigger a call, and a budget of 30 calls per hour
   applies by default. Jev returns one choice from `site_rule_v1`:
   `none | nudge | suggest_leave | pause_site`, plus an optional reason code.
   The browser applies it only if the rule lists that effect. Any failure,
   timeout or malformed answer means `none`.
3. **Agents (M2).** They read the `agents` section when they operate on matching
   hosts.

Effect definitions:

- `nudge` is a small, dismissible notice.
- `suggest_leave` offers "save and close".
- `pause_site` is a chrome-owned interstitial with the rule's override friction.

None of them uses network-level blocking or rewrites page content. Messages come
from the rule text or fixed templates, not from generated prose.

### 6.3 Observation levels

| Level | Leaves the machine (Jev only) |
| --- | --- |
| `none` | nothing; deterministic layer only |
| `address` | origin, path, page title |
| `outline` | `address` plus headings, link texts and form labels, with opaque IDs |

The outline excludes form values, password fields, cross-origin frames,
selection contents and anything in private windows. Sites in sensitive
categories (banking, government, health, identity, password managers) are capped
at `address` unless the user explicitly raises the level for that host. The
default for new rules is `none`.

### 6.4 UI placement (Zen-native)

- **Contexts:** Zen's existing workspace switcher. Set the type from the
  workspace menu or the Overview.
- **Project block:** a compact, collapsible block at the top of the sidebar tab
  list, showing only in project contexts, with the project name and service
  dots. In compact mode (sidebar hidden) the address bar environment pill
  carries the essentials.
- **Address bar:** the environment pill (project URLs only), the site-rule icon
  in the identity area, and the existing Chromium badge.
- **Commands:** existing tab, workspace and page context menus. Do not revive
  the retired custom palette or take over shortcuts.
- **Everything else:** in `about:axiosozo`.

### 6.5 Boundaries

- **`about:axiosozo`** is a privileged about: page registered through the
  overlay. It is not linkable or embeddable from content, uses a strict CSP
  with no remote resources, and gets data through one narrow JSWindowActor.
- **Pure logic** (schemas, detection from supplied file contents, environment
  URL mapping, rule evaluation, ledger aggregation) lives in a DOM-free package
  tested under Node. Chrome modules only supply file reads through `IOUtils`
  with the allowlist.
- **Jev calls** go through the on-demand provider host, with the key held in
  Keychain. Do not add a second network client to chrome.
- **Rules and ledger** are stored in profile-local JSON with atomic writes (the
  `SavedPages` pattern) and a serialized writer.

## 7. Workstreams for sub-agents

Phase 0 is sequential. The integration lead writes the contracts first:

- `contracts/context-v1.schema.json`: context metadata, project and manifest
- `contracts/site-rule-v1.schema.json`: rule, ledger record and effect menu
- `contracts/decision-v1.md`: Jev choice sets `site_rule_v1` (M1) and
  `highlight_v1` (M2), inputs, limits and failure semantics

Phase 1 runs in parallel against those contracts using fixtures. Phase 2 is
integration and GUI evidence by the lead.

| Workstream | Owns | M1 deliverables | Depends on |
| --- | --- | --- | --- |
| Integration lead (existing) | root `dev`, `scripts/dev.py`, `scripts/session.py`, `scripts/storage.py`, `contracts/`, lockfile, status docs, new `scripts/release/`, `docs/RELEASING.md` | Phase 0 contracts, security review of new boundaries, F7, final GUI evidence and status | — |
| Contexts core (**new**) | new `packages/contexts/` | detection (§6.1), manifest read/write model, environment mapping, deterministic rule engine, ledger aggregation; Node tests with fixture repos | contracts |
| Zen/frontend (existing) | `apps/browser/chrome/**` except CEF and Provider modules, `patches/zen/**`, `apps/browser/branding/`, `scripts/zen.py` | Zen workspace adapter module, F1, F2 page and actor, F3 UI, F4 pill/block/waiting page, F5 editor/indicator/effects, overlay registration | contracts, contexts core |
| Providers (existing) | `packages/provider-host/**`, `contracts/provider-v1.md`, `Provider*.sys.mjs` | `site_rule_v1` in the decision provider with fixture tests, host method for decisions, Keychain key-entry path (behind review) | contracts |
| CEF (existing) | `native/chromium-host/**`, `CEFEngineAdapter`, `CEFPresenter`, `EngineProbeControls`, `contracts/cef-v1.md` | resolve the Keychain gate, continue the E1 matrix, expose an engine-preference hook for F6 | — |

Each sub-agent works only in its own paths, adds tests beside its code, and
reports actual command output. It never marks anything READY. Cross-path
changes go through the lead.

**Definition of done for M1:** `./dev check` and `./dev test` pass. Each feature
has unit tests and a real-app GUI run on a synthetic profile with screenshots
saved as evidence. The status docs are updated honestly, blocked items included.

## 8. Public preview distribution

The source is already public. Being able to download and install AxioSozo like
Chrome additionally requires:

- **Apple Developer ID signing and notarization** of the whole bundle: hardened
  runtime with the entitlements Gecko needs (JIT) and every CEF helper app
  signed. Deliver as a stapled DMG.
- **An own update channel.** The stock Zen updater stays disabled and Zen's
  update server must never update this app. Firefox's MAR updater needs our
  own signing keys and update host. Until that exists, preview builds say that
  updates are manual.
- **A Safe Browsing key.** The overlay deliberately builds without personal Zen
  key files. A distribution build needs its own key, or it ships without
  phishing/malware protection and must say so.
- **Chromium-mode limits.** Standard CEF builds lack proprietary codecs and
  Widevine, so some media sites will not play in Chromium mode. The Chromium
  switch stays off by default, or clearly labelled experimental, until E1/E2
  pass.
- **Branding and licenses.** No Firefox, Zen or Chrome marks in branding. MPL
  source availability is covered by the public repo, and third-party notices
  ship in the app.
- **Hosting.** GitHub Releases hosts the binaries with published checksums. Wout
  still chooses the download website, which links to the release.

Every public artifact is labelled **Preview**, never READY. Nothing is pushed,
tagged or published without Wout's explicit authorization for that specific
release.

## 9. Keeping up with Zen

We ship our own build, so security updates are our responsibility.

- **Cadence.** Firefox has a 4-week release cycle with security point releases
  in between, and Zen follows it. A scheduled job detects a new Zen tag, applies
  the overlay (failing closed on hash mismatch), builds, runs `./dev check`,
  `./dev test` and the Zen workspace adapter contract tests, and writes a report.
  A human reviews and releases. Security releases are followed within days.
- **Scope of changes.** Keep the overlay small and add UI beside Zen rather than
  editing Zen markup, because every Zen UI edit becomes a future merge conflict.
- **Build capacity.** A full build on one 16 GiB Mac is too slow for rapid
  security releases. Dedicated build capacity is a prerequisite for public
  updates.

## 10. Out of scope

Out of scope are:

- an own editor, terminal, agent loop or model
- per-site custom code or feed rewriting
- a chat sidebar
- cloud sync or an AxioSozo account
- network-level blocking or proxies
- system-wide process or port scanning
- reading `.env` or credential files
- automatic submission on government, banking or payment sites

## 11. Open decisions for Wout

1. The user-facing name for "context".
2. The download website and domain.
3. The Apple Developer account used for signing and notarization.
4. ~~Whether Jev key entry ships in the first preview or stays disabled.~~
   **Decided (Wout, 28 September 2026): it ships.** On by default;
   `axiosozo.jev.keyEntry.enabled` stays as a kill switch.
5. M2 order: send-to-agent first (recommended) or page highlights first.
