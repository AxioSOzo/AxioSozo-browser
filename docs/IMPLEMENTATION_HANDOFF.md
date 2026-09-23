# Handoff 2 — concrete continuation points

The local repository is `/Volumes/T9/Code/AxioSozo browser`. The product is
**PARTIAL_ENGINE_BLOCKED**, not READY. The custom Zen app runs on macOS arm64 and
actual CEF frames run inside it for a strict local fixture. E2 switching passed
manual inspection for that fixture, while the full E1 safety and accessibility
matrix remains open. There is no public fork, push or release.

The project-only APFS image `/Volumes/T9/AxioSozoBuild.sparsebundle` is mounted at
`/Volumes/AxioSozoBuild`. Wout accepted this T9-backed alternative after the
project's exFAT source folder proved unsuitable for native build artifacts.
`scripts/storage.py` verifies the image and directs build caches and temporary
files there after the required `dev-external` wrapper. Shared DevStorage is untouched.
The pinned Node, Rust, Python and GNU tar toolchain passes component checks;
the overall `./dev doctor` remains nonzero until READY.

Current proof: the Rust coordinator compiles on the project volume and its actual
[pipe](evidence/coordinator-current-pipe.json) and
[owned-process](evidence/coordinator-current-lifecycle.json) tests pass. CEF154
is compiled and strictly signed. Native E0 renders real Chromium OSR pixels,
accepts input, resizes at 2×, navigates page2/back and closes without orphan
helpers ([result](evidence/cef-verified-handoff.json),
[actual frame](evidence/cef-e0-retina-resize.png)). The corrected AXCF stream
test verifies eight frames and exact BFCache generations
([live stream](evidence/cef-stream-test-bfcache-generations.log)).

The Zen/Firefox native build now succeeds with two jobs on project APFS. The
app's own bundle ID is `nl.axiosozo.browser.dev`; build and full root check/test
results are in [status](SETUP_STATUS.md) and the
[build index](evidence/zen-native-build-log-index.json). Historical failed
compile/import attempts remain recorded, with narrow source patches 0004–0007.
The integrated macOS [GUI observation](evidence/engine-gui-manual-20260923.json)
shows the same Zen tab switching Gecko→Chromium→Gecko, real CEF pixels/input,
page2/back and retained Chromium identity. The probe's machine result exits20
because GUI assertions are not automated; it does not itself certify E1/E2.
The newer [GUI observation after input-flow control](evidence/engine-gui-flow-control-manual-20260923.json)
shows Chromium remaining active through typing and a 5K fullscreen transition,
further input, explicit return to Gecko and clean owned-profile shutdown.
The current Gecko [smoke](evidence/coordinator-tls-manual-20260923.json) displayed
the built-in warning for an untrusted local certificate. A principal change had
previously preceded Gecko progress events and caused a native target-transition
rejection. The adapter now advances document and navigation generations on that
boundary; the actual browser console reported coordinator `connected`, and an
`observe` request for the selected warning-page target passed native authorization
before the adapter returned `unsupported`. Automatic model control remains disabled
until its separate browser safety gates pass. The UI inspection was manual and its
supervisor exited130 after a console-close timeout; no GUI PASS is inferred.

Handoff 2 should first add automated GUI assertions and capture integrated fixture
screenshots, then finish the E1 matrix: selection, arbitrary Retina resize,
IME, clipboard, popups, downloads, permissions/certificate UI, context menu,
general-site fullscreen, accessibility, crash recovery and controlled developer
tools. Keyboard scroll and local-fixture fullscreen work on this host with a
bounded 1.5× CEF scale. Keep
general Chromium browsing disabled until those gates pass. Verify separate
engine cookies/profiles and failed-candidate preservation in the actual GUI.
`./dev` owns an isolated development profile; `./dev smoke` and
`./dev engine-probe` create strict loopback/TLS fixture sessions. Never infer GUI
success from process startup or a standalone CEF frame.

Code entrypoints:

- `scripts/zen.py`, `patches/zen/overlay.json` and `apps/browser/chrome/AxioSozoStartup.mjs`
  stage/patch the pinned Zen source and install the trusted compact chrome. The
  Gecko target adapter is `GeckoEngineAdapter.sys.mjs`.
- `native/chromium-host/host.mm`, `stream.inc` and `transport.hpp` are the native
  CEF OSR renderer and authenticated AXCF pipe. The privileged Firefox side is
  `CEFEngineAdapter.sys.mjs`, `CEFPresenter.sys.mjs` and
  `EngineProbeControls.sys.mjs`. The wire contract is `contracts/cef-v1.md`.
- `apps/browser/chrome/BrowserCoordinator.sys.mjs`,
  `crates/browser-core/src/` and `contracts/ipc-v1.schema.json` own target
  registration, grants and process-bound capabilities. Recheck target identity,
  generations, scope and expiry immediately before every action. Automatic
  Chromium control remains unsupported until transactional target migration is
  verified.
- `packages/provider-host/cli.mjs` and `src/adapters.mjs` expose separate Codex,
  Claude Code and Antigravity routes; extracted T3 provenance is recorded in
  `docs/PROVIDERS.md`. Installed Codex 0.156.1 and Claude Code 2.1.280 currently
  mismatch pinned fixture versions; all real client protocols are `UNTESTED`.
  No provider client, login, hook, MCP server or paid model was launched. A live
  probe needs separate authorization, supported official auth and proven sandbox.
- Optional Jev is behind `src/decision.mjs`, `src/keychain.mjs` and the native
  Keychain helper. Fixture decisions and negative Keychain tests pass. A separate
  temporary T9 Keychain fixture passes synthetic add/read/replace/delete/lock;
  production key entry and the live synthetic API diagnostic remain untested.
  Normal browsing must work without a key or any Jev network traffic.
- Root `dev`, `scripts/dev.py`, `scripts/session.py`, `scripts/storage.py`, shared
  contracts, lockfile and final status belong to the integration lead.

Before general Chromium browsing, resolve the safety UI gaps in
[ADR 002](adr/002-dual-engine.md): IME, clipboard, popups, downloads, permissions,
certificate dialogs, context menus, fullscreen, accessibility, crash recovery and
controlled developer tools. Preserve TLS/origin/sandboxing. Do not pivot to an
Electron/Tauri/WebKit shell or an external Chrome window if E1 fails; record the
reproducible blocker and necessary architecture change instead.

See [setup status](SETUP_STATUS.md) for the current PASS/EXPERIMENTAL/BLOCKED gates
and [walkthrough](evidence/WALKTHROUGH.md) for dated logs, including superseded
failures from the original build volume. Regenerate evidence after source changes
with `python3 scripts/record-evidence.py <name> <command...>`; never reuse an old
launch result as proof of a new native build.
