# Setup status — 23 September 2026

**Overall: PARTIAL_ENGINE_BLOCKED. NOT READY.** The custom arm64 Zen app builds and
starts. Real CEF frames, typing, local GET/back and a scoped engine switch work in
its content area. E1 is experimental and E2 is manually proven only for the local
fixture. General Chromium browsing and safety-critical browser UI are not certified.

The 23 September first-experience continuation adds a trusted Zen chrome command layer and
local save/search flow. Its per-flow evidence and new blockers are in
[IMPLEMENTATION_STATUS](IMPLEMENTATION_STATUS.md). This does not upgrade E1/E2 or
provider/Jev live readiness.

## Active continuation

Wout has set an active goal to finish the original handoff using T9 capacity. The
new project-only APFS image `/Volumes/T9/AxioSozoBuild.sparsebundle` is mounted at
`/Volumes/AxioSozoBuild`, initially 199.68 GiB free. Shared DevStorage is untouched.
The first coordinator build there completed in 21.04 seconds; the same earlier binary
that stalled on the old volume now starts in 0.303 seconds. Evidence:
`evidence/storage-project-ready.log`, `evidence/coordinator-fresh-volume-build.log`,
`evidence/fresh-volume-coordinator.json`.

The automatic approval review initially rejected the CEF build at this mountpoint
because the earlier instruction named `/Volumes/DevStorage`. On 23 September Wout
accepted the prepared alternative. Native work resumed there without moving or
detaching the shared DevStorage image. The project directory itself is on exFAT;
the prepared T9-backed APFS image supplies native build semantics.

Current continuation evidence: `evidence/coordinator-current-build.json` records a
2.23-second coordinator build on the project image. The real chrome/coordinator
pipe tests pass 4/4 (`evidence/coordinator-current-pipe.json`), and owned-process
lifecycle tests pass 9/9 (`evidence/coordinator-current-lifecycle.json`). This
resolves the earlier `_dyld_start` failure on the old build volume for this binary.
The pinned CEF main/helper/stream bundle compiles and strict signature verification
passes (`evidence/cef-build-approved-volume.log`). After correcting the native
message loop and CEF key-event structure, E0 **passes** on macOS: 26 real OSR frames
in the final run, typed `CEF` reflected in the document title and pixels,
2× Retina resize, local GET
navigation/back and orderly native shutdown. `evidence/cef-probe-result.json`,
`evidence/cef-e0.jsonl`, `evidence/cef-e0-retina-resize.png` and
`evidence/cef-e0-finalized-native.log` record the final run; the first successful
run is retained separately. A first AXCF test revealed
that a BFCache back navigation skipped `OnBeforeBrowse` and failed to increment
target generations. The corrected live rerun passes eight real frames and verifies
both generations advance exactly once on back; see
`evidence/cef-stream-test-bfcache-generations.log`. The first stream result is
superseded. Neither result is E1/E2.
The pinned Zen/Firefox source, local patchset and toolchains produce a real arm64
development app with bundle ID `nl.axiosozo.browser.dev`. `./dev setup` exited 0
twice and reused the current native objects; `./dev check` and `./dev test` exited 0
after the first full build. See `evidence/zen-native-build-verified.json`,
`evidence/zen-native-build-log-index.json`,
`evidence/root-setup-idempotent-20260923.json`,
`evidence/root-check-after-zen-20260923.json` and
`evidence/root-test-after-zen-20260923.json`. The first two build interruptions,
their exact errors, SHA-verified compressed logs and exit codes remain indexed.

The first GUI smoke session showed Gecko fixture input and the browser's
"Warning: Security Risk" page for the untrusted local certificate. Its first
attempt failed at the profile-name guard; the corrected second attempt opened
the app and timed out after its bounded inspection window. In the engine probe,
the first embedded attempt failed on a Firefox cross-realm ArrayBuffer test.
The next run displayed actual CEF frames but a back shortcut hit a stale-input
error and safely restored Gecko. The corrected final run kept Chromium active
after page2/back, accepted typed `CEF` in the live frame, and explicitly returned
to Gecko in the retained tab. See
`evidence/smoke-_nw8qg06/session.json`,
`evidence/smoke-5123507c8939f170/session.json`,
`evidence/engine-probe-413619f30f28f5c8/session.json` and
`evidence/engine-gui-manual-20260923.json`. The GUI observations came from the
actual AxioSozo Dev window via macOS accessibility/live screenshot. No integrated
PNG was saved. The probe driver deliberately returns 20 because it has no
automated GUI assertions; its own session result does not claim E1/E2 PASS.

A newer actual GUI session after bounded native input-flow control retained
Chromium through text input and a 5K fullscreen transition, accepted another
character there, switched back to Gecko and quit cleanly. The fullscreen render
scale was capped at 1.5×. Its session audit reports zero owned CEF profiles left.
See `evidence/engine-gui-flow-control-manual-20260923.json`. This supersedes the
earlier fullscreen `UNSUPPORTED_SURFACE` observation for the current build; the
probe driver still exits20 because GUI assertions are manual.

The Gecko target adapter now increments document and navigation generations
when the principal changes before progress events, as happens on the built-in
TLS warning page. The previous GUI run logged `invalid_target_transition`
twice. After the correction, the actual warning page remained visible, the
coordinator reported `connected`, a read-only `observe` request passed its
native grant and returned `unsupported` at the adapter, and the browser log
had no target-sync rejection. The console UI timed out on close, so the owned
smoke supervisor was interrupted and cleaned its children; the driver itself
does not claim a GUI PASS. See `evidence/coordinator-tls-manual-20260923.json`,
`evidence/root-setup-principal-transition-20260923.json`, and
`evidence/smoke-principal-transition-20260923.json`.

Discovery sees installed Codex 0.156.1 and Claude Code 2.1.280, newer than the
fixture protocol pins, and Antigravity `agy` with unknown version. No client,
login or live model was started. A separate temporary T9 Keychain fixture passed
synthetic add/read/replace/delete/lock; production Jev key input remains disabled.

| Component / requirement | Status | Actual evidence / limit |
| --- | --- | --- |
| macOS Apple Silicon access | PASS | macOS 26.6.2 arm64, 16 GiB RAM; project APFS build image on T9, `evidence/storage-project-ready.log` |
| Pinned source provenance | PASS | Zen/Firefox/Surfer/CEF/T3 revisions and hashes in root lock and provenance |
| Upstream security-update review | EXPERIMENTAL | Current Zen pin selects Firefox 156.0; Surfer reported upstream 156.0.1 during build. No silent pin change; review/rebuild required before calling this a current daily release. `docs/zen-notes.md` |
| Clean full native reconstruction | PASS | Pinned source and audited two-job toolchain built an arm64 app; exact logs/exit codes in `evidence/zen-native-build-log-index.json`, `evidence/root-setup-stale-target-20260923.json` |
| Root `./dev check` | PASS | Latest full exit0 after principal-transition fix: `evidence/root-check-principal-transition-20260923.json` |
| Root `./dev test` | PASS | Latest full exit0 after principal-transition fix, including real CEF stream: `evidence/root-test-principal-transition-20260923.json` |
| Zen privileged chrome overlay | PASS | Built chrome ran in the actual app; settings, Gecko fixture and experimental CEF controls were observed. `evidence/engine-gui-manual-20260923.json` |
| Custom Zen app and UI rebuild visibility | EXPERIMENTAL | Custom app and changed controls visible in macOS GUI; no saved integrated PNG or explicit before/after UI-change capture. `evidence/engine-gui-manual-20260923.json` |
| Coordinator policy implementation | PASS | Updated Rust compiles and current root clippy passes; 10 policy tests previously passed. `evidence/root-check-20260923-after-fetch.json`, `evidence/coordinator-policy-check-existing-storage.json` |
| Coordinator real process/IPC reliability | PASS | Current T9 APFS binary: 9/9 lifecycle tests pass; `evidence/coordinator-current-lifecycle.json`. Earlier old-volume failures retained |
| Chrome ↔ coordinator attachment | EXPERIMENTAL | Actual GUI reported `connected`; read-only selected TLS-warning target passed native grant/authorization and returned honest `unsupported`. No automatic action or complete GUI matrix is certified. Earlier generic startup and target-transition errors are superseded by `evidence/coordinator-tls-manual-20260923.json`; 4/4 real-process pipe tests pass |
| CEF native host | PASS | Pinned CEF154 main/helper/stream compile and strict local signature verification pass on the project APFS image; `evidence/cef-build-approved-volume.log`, `evidence/cef-e0-approved-volume.log` |
| CEF process-fixture reliability | PASS | Latest six lifecycle/HTTP-boundary checks pass; `evidence/cef-lifecycle-tests-approved-volume.log`. Earlier failed attempts remain in dated logs |
| E0 actual CEF fixture render | PASS | Pinned native CEF154, real loopback GET 200, 26 OSR frames in final run, typed input, Retina, navigation/back and clean shutdown; `evidence/cef-verified-handoff.json`, actual fixture PNGs |
| Native AXCF frame/input pipe | PASS | Corrected native run: eight real frames, input/nav/resize, BFCache back increments both generations exactly once, stale-target rejection and close. `evidence/cef-stream-test-bfcache-generations.log`; initial six-frame run superseded |
| CEF private-pipe rejection | PASS | Real native wrong-token and duplicate-ACK requests exit64; clean EOF exits0 with separate synthetic profiles. `evidence/cef-stream-security-approved-volume.log` |
| E1 inside Zen content area | EXPERIMENTAL | Actual CEF154 frames, input, keyboard scroll, local GET/back and engine badge in one Zen window. Latest run retained Chromium through 5K fullscreen and further input at capped 1.5× render scale; full E1 matrix and saved GUI screenshot remain open. `evidence/engine-gui-flow-control-manual-20260923.json` |
| E2 user engine switch | EXPERIMENTAL | Manual local-fixture Gecko→Chromium→Gecko switch in retained tab PASS, repeated after the current native build; no general URLs, complete cookie audit or automated GUI assertion. `evidence/engine-gui-flow-control-manual-20260923.json` |
| Provider discovery | PASS | Metadata-only installed Codex 0.156.1 and Claude Code 2.1.280 explicitly `VERSION_MISMATCH`; `agy` `UNTESTED`. Actual protocols all `UNTESTED`; no client launched. `evidence/providers-version-results-20260923.json` |
| Provider/Jev fixture protocols | PASS | 48 deterministic tests including settings/version isolation and malformed metadata rejection; `evidence/root-test-post-gui-20260923.log`. No live provider certification |
| Native provider sandbox fixture | PASS | Five real macOS negative/lifecycle tests pass with scoped synthetic file IO; official clients untested. `evidence/providers-sandbox-final-20260923.log` |
| Codex live | BLOCKED_AUTH | No authorized auth probe; also requires a proven launch sandbox |
| Claude Code live | BLOCKED_AUTH | Same; bare API mode is not subscription-auth proof |
| Antigravity live | BLOCKED_AUTH | Official agy route separate from T3 internals; no version/auth/live proof |
| Native Keychain helper | EXPERIMENTAL | Native helper, 5 negative tests and isolated T9 positive add/read/replace/delete/lock pass; production Jev input remains disabled. `evidence/providers-keychain-negative-20260923.json`, `evidence/providers-keychain-positive-final-20260923.json` |
| Jev live | BLOCKED_AUTH | No key/auth probe authorized; disabled/timeout/malformed/cancel are fixture tested |
| TLS warning and real browser profile isolation | EXPERIMENTAL | Current Gecko build showed “Warning: Security Risk” for the synthetic untrusted certificate without bypass; its selected target passed native read-only authorization after the principal fix. Owned-profile lifecycle passed, but CEF certificate UI/cookie separation was not manually audited. `evidence/coordinator-tls-manual-20260923.json` |
| IME/clipboard/popups/downloads/permissions/a11y/crash recovery | BLOCKED_ENV | Integrated Chromium safety/accessibility gates remain open. Fullscreen is experimental only for the local fixture at bounded scale; fixture mode denies unsupported actions. See ADR002 |
| Daily `./dev` start/stop and duplicate profile guard | PASS | Actual custom about:blank window opened and quit with exit0. A concurrent second `./dev` reported the existing profile owner and did not start a second owner; both sessions closed and no own processes remained. `evidence/daily-dev-gui-20260923.json`, `evidence/profile-owner-first-20260923.json`, `evidence/profile-owner-second-20260923.log` |
| Remote settings / Zen resource diagnostics | EXPERIMENTAL | Earlier signed-search dump and out-of-bundle child-actor errors were corrected in the pinned patch/build; the latest clean GUI stdout has neither. Fresh-profile Zen migration and favicon warnings remain to investigate before release. `evidence/engine-probe-517a04b3c0d19385/browser-stdout.log`, `docs/zen-notes.md` |

`./dev setup`, `./dev check`, `./dev test` and a daily `./dev` start/stop pass.
`./dev doctor` remains nonzero
while READY is false; provider/Jev live preflights return 78 without authorized
authentication. `./dev smoke` and `./dev engine-probe` implement owned inspection
sessions with strict loopback fixtures, a fresh untrusted TLS certificate and a
separate profile. Their exit20 is deliberate until automated GUI assertions exist;
the manual macOS result is documented separately. `./dev` starts the real custom
app and should be quit normally; its daily start/stop result is recorded separately.
See [WALKTHROUGH](evidence/WALKTHROUGH.md) for historical evidence links.

Earlier builds on shared DevStorage stalled in `_dyld_start` and CEF signing spent
minutes in external-file reads. Samples and failed attempts are retained. Current
coordinator and CEF executables run from the project APFS image; this resolves the
observed stalls for those binaries and the full Zen app. No TLS, sandbox,
Gatekeeper or filesystem protection was disabled to force
a result. Shared DevStorage was not resized and unrelated processes were not stopped.

A bounded sample of the earlier coordinator binary is saved in
`evidence/coordinator-startup-sample.txt`; that owned process was terminated and
reaped. The precise old-volume loader cause remains unknown. Current T9 APFS
coordinator startup and real pipe tests pass. The Zen GUI fixture ran; provider
control through the coordinator remains a later safety gate.

See the final command logs under `evidence/` and `IMPLEMENTATION_HANDOFF.md` for the
exact missing integration work. This document is updated from results, not forecasts.
