# Handoff 3 — M1 status, 27 September 2026

**Overall: PARTIAL_ENGINE_BLOCKED. Not READY.** M1 (contexts, projects, dev loop,
site rules, Overview) is implemented on Gecko and exercised in the real
AxioSozo Zen app on a synthetic profile with loopback fixtures (two sessions: locked, then unlocked). Chromium
(E1/E2), live Jev and signed distribution remain blocked, as listed below.
Nothing was pushed, tagged or published.

## What was built

| Workstream | Paths | Result |
| --- | --- | --- |
| Integration lead | `contracts/context-v1.schema.json`, `site-rule-v1.schema.json`, `decision-v1.md`, `contexts-api-v1.md`; `scripts/dev.py` | Phase 0 contracts, security review, integration fixes, final gates |
| Contexts core | `packages/contexts/` | DOM-free detection, manifest, environments, rules, ledger, checkpoints; 78 Node tests with fixture repos |
| Zen/frontend — services | `ZenWorkspaceAdapter`, `JsonStore`, `AxioSozoServices`, `ContextMenuContexts`, `AxioSozoStartup.mjs`, `scripts/zen.py`, `patches/zen/` | Single Zen adapter, stores, F1 workspace menu, generated jar manifest (one hash-guarded `#include`) |
| Zen/frontend — overview | `AboutAxioSozo*.sys.mjs`, `apps/browser/chrome/overview/` | `about:axiosozo` + `AxioSozoOverview` actor (F2, F3 UI, F5 editor, screen time) |
| Zen/frontend — runtime | `DevLoop`, `SiteRuleRuntime`, `EnginePreference`, `axiosozo-runtime.css` | F4 pill/block/waiting overlay, F5 ledger/indicator/effects/Jev checkpoints, F6 application |
| Providers | `packages/provider-host/`, `ProviderDecision.sys.mjs`, `contracts/provider-v1.md` | `site_rule_v1`, `decision/site_rule` + `decision/cancel`, pref-gated Keychain key entry |
| CEF | `EngineProbeControls.sys.mjs`, `contracts/cef-v1.md` | `applyEnginePreference` hook; Keychain gate analysis |
| Release (F7) | `scripts/release/`, `docs/RELEASING.md`, `tests/test_release_preview.py`, `./dev release-check` | Preview DMG pipeline prepared, never signs/uploads by default |

## Gates actually run

- `./dev check`: exit 0 (`.local/logs/check-h3-final.log`, not committed).
- `./dev test`: every step exit 0 **except** `native/chromium-host/stream_test.py`,
  which launches real CEF and would raise the blocked "Chromium Safe Storage"
  Keychain dialog; it was skipped and is **BLOCKED**, not passed. The run used
  `dev.test()` unchanged with only that step stubbed
  (`.local/logs/dev-test-h3-final.log`). Counts: cargo 10, Zen check Node 232 +
  bootstrap 26, cef-adapter 34, saved pages 3, contexts core 78, root Python 40,
  coordinator pipe 4, CEF probe unit 6, provider host and synthetic private
  Keychain tests pass.
- Native Zen rebuild via `scripts/zen.py setup`: exit 0; 40 AxioSozo chrome files
  packaged and materialized; `zen.py ready` PASS.

## M1 acceptance (real app, synthetic profile `h3-gui`, loopback fixtures)

Evidence: [`evidence/h3-m1-gui-20260927/`](evidence/h3-m1-gui-20260927/)
(`result.json`, `notes.md`, window-only Marionette screenshots). Summary:
27 PASS, 2 NOT_VERIFIED, 1 BLOCKED (after the second, unlocked session
20:36–20:50 CEST; its files are prefixed `s2-`).

| ID | Status | Notes |
| --- | --- | --- |
| F1 contexts | PASS | Types and org link set via the real Context submenu; survive restart; two container identities show separate cookie jars; deleted workspace appears only as an orphan and is cleaned up. Session 2: screenshot of the open Context submenu with its Organization submenu (`s2-f1-context-menu-open-organization-submenu.png`). |
| F2 Overview | PASS / partial | Light and dark, Needs attention (service down, limit reached), 45 controls keyboard-reachable, accessibility tree roles/names; web content cannot link, navigate, open or frame `about:axiosozo`. VoiceOver itself NOT_VERIFIED. |
| F3 add project | PASS | Session 2: the real macOS folder picker (no test double), driven with System Events, opened the draft review. Draft review, confirm, manifest write with confirmation verified on disk; only allowlisted files read, `.env`/outside symlinks refused. The picker itself was not photographed because its sidebar can show personal folders. Next/Tauri/library drafts verified by Node fixture tests only. |
| F4 dev loop | PASS | Pill switches local → preview → production preserving path/query/fragment; project block only in project context; waiting overlay on the declared refused origin loads the page once the port answers; undeclared origin keeps normal neterror. |
| F5 site rules | PASS / partial | Editor, identity-area indicator, pause interstitial with confirm friction, nudge, ledger, export and delete; zero Jev calls with consent off. Session 2: screenshots of the open rule panel and the environment-pill menu. The Jev path in the GUI stays NOT_VERIFIED (not authorized). |
| F6 engine preference | PASS / BLOCKED | Behind the flag (off): UI disabled, requests refused, tab stays Firefox. Live Chromium path BLOCKED on the Keychain approval. |
| F7 preview release | BLOCKED | Pipeline and tests ready; see below. |

The first session ran with the macOS session locked. A second, unlocked session
covered the native picker and popup screenshots. VoiceOver stays NOT_VERIFIED:
"Allow VoiceOver to be controlled with AppleScript" is off, and that setting was
deliberately not changed. Marionette was
enabled for automation on the synthetic profile only and its indicator is visible
in every screenshot.

## Security review of the new boundaries

An independent review found one high issue (a repo could plant
`.axiosozo/project.json.tmp` as a symlink so that "write manifest" overwrote an
arbitrary user file), three medium (service probing could reach any
teammate-declared host including LAN/metadata addresses and ran automatically;
misleading Jev wording; previous page title could leak into a checkpoint) and
seven low issues. All were fixed with regression tests; the resulting rules are
recorded in `contracts/contexts-api-v1.md` §6. Service status now probes only
declared loopback ports; every other service is `unknown` and causes no traffic.

## Integration bugs found only in the real app

The GUI run found and fixed ten bugs no unit test had caught, including: the
Overview actor classes were not exported (so `about:axiosozo` never connected),
`nsIFile.isSymlink()` throwing on absent files broke detection and manifest
writes, the TCP probe reported running services as down, the wrong
`LOCATION_CHANGE_ERROR_PAGE` constant, the waiting overlay comparing against the
previous URL, and new rules failing with `UNKNOWN_RULE`. Each has a regression
test. See the GUI evidence notes.

## Blocked and open

- **E1/E2 and live Chromium** (incl. F6 live path): blocked on the macOS Keychain
  "Chromium Safe Storage" approval. Options and tradeoffs are in
  `contracts/cef-v1.md`; the recommended near-term step is for Wout to run it on a
  synthetic profile (ideally a dedicated macOS user) and choose "Allow", not
  "Always Allow".
- **Live Jev**: not authorized; the `site_rule_v1` reply format is modelled on the
  diagnostic one and must be checked against the real API once a live call is
  authorized. Jev key entry is behind `axiosozo.jev.keyEntry.enabled=false`
  (open decision 4).
- **F7 signed DMG**: `BLOCKED_SIGNING_IDENTITY` (open decision 3). Preflight also
  found `PROFILE_ROOT_NOT_ISOLATED`: `application.ini` has `Profile=zen`
  (Zen's `MOZ_APP_PROFILE`), so an installed build would share stock Zen's
  profile folder. This, the `.dev` bundle ID, `Vendor=Mozilla`, crash reporting
  to Mozilla, the missing packaged build (`mach package`) and a Safe Browsing key
  must be resolved before any Preview. See `docs/RELEASING.md`.
- **Outline observation**: capped to `address` in M1 (no read-only outline child
  actor yet); requests say `address`.
- **Sensitive hosts at `address`** still send path and title (per §6.3). The
  review suggests origin-only for sensitive categories unless raised — a spec
  decision for Wout.
- Rules cannot target IP hosts (`127.0.0.1`); the ledger does record them.
- Daily limits sum usage across contexts.
- A Jev call requires the visible outgoing-data indicator, so none happen while
  the toolbar is hidden (intended fail-closed).
- Packaging now requires a git checkout (`PACKAGING_GIT_UNAVAILABLE` otherwise).
- During the GUI run the evidence agent once listed file *names* in the home
  Downloads folder to confirm an export had not landed there; no content was read
  or recorded.

## Open decisions for Wout (unchanged from the handoff)

1. User-facing name for "context". 2. Download website and domain. 3. Apple
Developer account. 4. Whether Jev key entry ships in the first preview.
5. M2 order. Plus from this round: the Keychain approval path for E1, and
origin-only observation for sensitive hosts.
