# AxioSozo on Linux

Zen/Gecko is the application on Linux too: the same Zen fork, the same AxioSozo
chrome, built from the pinned Firefox 156 source with the system LLVM. Other
engines run out of process and are presented in Zen's content area; on Linux
the macOS IOSurface engine view does not build, so chrome uses the AXCF pipe
fallback (`CEFEngineAdapter.engineSurfaceService()` returns null).

Target: Ubuntu 24.04 (noble) x86_64. Other distributions need the same tools
under other package names.

## Build root

Everything bulky lives in one private directory outside tracked source:
`$AXIOSOZO_BUILD_ROOT` (absolute, not inside the checkout, not /proc /sys /dev)
or the gitignored `<checkout>/.build/`. It holds `toolchains/zen`, `cargo-home`,
`cargo-target`, `caches/` (sccache, npm, pip), `zen/` (source stage, objdir,
Firefox archive), `linux-app/` (fetched CI builds), `gui-evidence/`, `tmp/`.
`python3 scripts/storage.py exec -- <cmd>` runs a command with TMPDIR, Cargo
and caches pointed into it. There is no volume to mount on Linux.

## Packages

`scripts/linux_packages.py` is the single list (also used by the workflows):

```sh
sudo apt-get install -y --no-install-recommends $(python3 scripts/linux_packages.py test build gui)
```

- `test`: `./dev check` / `./dev test` (libsecret, dbus, gnome-keyring,
  gdbus, lsof, bubblewrap for the sandbox probe).
- `build`: clang/lld/llvm 19 (Firefox 156 refuses noble's default clang 18),
  GTK 3 and X11 development headers.
- `gui`: Xvfb, xdotool, xwininfo, xwd, fonts and the runtime libraries.

## Everyday commands

```sh
export AXIOSOZO_BUILD_ROOT=$HOME/axiosozo-build      # optional
./dev doctor
python3 scripts/zen_toolchain.py fetch --only node,python
./dev setup --only cargo,tools,provider
./dev check
./dev test
./dev setup --only upstreams
AXIOSOZO_SCCACHE=1 ./dev setup --only zen             # full Zen build
./dev package                                         # tar.xz + axiosozo-build-info.json
./dev gui-test --engine gecko --scenario all --screenshot out.png
```

### Gates that are blocked by design on Linux

`./dev check` and `./dev test` fail on any FAIL and on any BLOCKED_ENV that is
not listed in `LINUX_EXPECTED_BLOCKED` (scripts/dev.py); `AXIOSOZO_STRICT=1`
fails on those too. The listed ones:

| Gate | Why |
| --- | --- |
| `native/chromium-host/probe.py check/test-native` | pinned CEF probe binary is macOS arm64; the Linux CEF host is `cloud/linux-cef` |
| `native/chromium-host/test_probe.py`, `stream_test.py` | not run while the probe reports BLOCKED_ENV on this host; they run once the probe supports Linux |
| `provider-host keychain-positive-setup/test` | macOS Keychain fixture; Linux covers the same contract with a private Secret Service in `keychain-negative-test` |

Tests skipped off macOS (with the reason in the skip): the release
staging/codesign cases of `tests/test_release_preview.py` (APFS stage roots,
codesign plans) and the understand pin check that reads the owner's
workstation checkout.

## Browser features that stay macOS-only (fail closed on Linux)

Decided for now; each refuses with its normal "unavailable" path, nothing falls
back to a weaker mode:

- **Provider launches** (Codex, Claude Code, …): refused on Linux
  (`tests/sandbox-linux.os.mjs`: every launch path BLOCKED_ENV). The macOS
  launcher relies on the Seatbelt profile; a Linux equivalent needs a
  bubblewrap + seccomp (or Landlock) broker with its own review, and Ubuntu
  24.04's AppArmor user-namespace restriction changes what bubblewrap may do on
  stock desktops. Provider keys use the Linux Secret Service helper
  (`native/secret-service.c`): never prompts, never unlocks, no plaintext
  fallback.
- **Project reader, project arrival (lsof), agent bridge in chrome**: chrome
  pins the macOS volume paths (`/Volumes/AxioSozoBuild/...`) for their
  interpreters/helpers (`ProjectReaderConfig`, `ProjectArrivalSubprocess`,
  `AgentBridgePins`), so on Linux these refuse as unavailable. The installers
  themselves work on Linux (`./dev check` verifies them; the agent bridge
  bundle has its own linux-x86_64 Node pin). Porting chrome needs a Linux
  build-root admission rule in those modules, `/usr/bin/lsof` (or a /proc
  reader) in `tools/axiosozo-arrival/arrival_lsof.py` with a new
  `ARRIVAL_LSOF_SHA256`, and the Linux Node pin in `AgentBridgePins`.
- **Release packaging** (`scripts/release/preview.py`) is macOS (DMG, codesign,
  notarization). Linux has `./dev package`, a development tar.xz only.

## CI (GitHub Actions)

Cloud sessions cannot download Actions logs or artifacts; every workflow
publishes small results to the `ci-results` branch
(`<branch with / as _>/<run>-<attempt>-<name>/`, see docs/CLOUD.md).

| Workflow | Runs on | Does |
| --- | --- | --- |
| `linux-ci.yml` | push to `cloud/linux-platform`, PRs to `cloud/integration` | `./dev doctor/check/test`; results `…-check-test/` |
| `linux-zen-build.yml` | push to `cloud/linux-platform` touching build inputs; PR label `linux-build` | calls `linux-zen-reusable.yml` (build + GUI) |
| `linux-gui.yml` | push touching the harness; PR label `linux-gui` | newest run with an app artifact → GUI harness |
| `linux-zen-reusable.yml` | `workflow_call` only | build (or reuse an artifact) + `./dev gui-test` |
| `linux-source-probe.yml` | push touching it or `scripts/source_probe.txt` | greps/copies files of the pinned Firefox 156 tarball (sha512 checked) and Zen revision, optionally after applying Zen's `src/**/*.patch`; results `…-source-probe/` |

### Getting a built app in another branch's Actions job

Two paths, both from a workflow on YOUR branch (merge `cloud/integration`
first so `linux-zen-reusable.yml` and `.github/actions/publish-ci-results`
exist there):

1. **Reuse a green build (minutes).** Right when your change does not touch
   Gecko/Zen/chrome build inputs (for example an out-of-process engine host):

   ```yaml
   on:
     push:
       branches: [cloud/webkit-host]
   jobs:
     gui:
       permissions: { contents: write, actions: read }
       uses: ./.github/workflows/linux-zen-reusable.yml
       with:
         prebuilt_run_id: '<run id of a green linux-zen-build run>'
         engine: webkit          # your scripts/gui_engines/<engine>.py
         results_name: webkit
   ```

   The GUI job downloads the `axiosozo-zen-linux-x86_64` artifact of that run
   (`actions/download-artifact` with `run-id`, works across branches of this
   repository for 30 days), verifies it with `./dev fetch-build --from-dir`, and
   runs `./dev gui-test --engine <engine>`. Build your engine host in an
   earlier step of your own job, or extend your engine plug-in's `prepare` to
   build/fetch it; `browser_environment` hands its path to the app.

2. **Build from your checkout (hours cold).** Omit `prebuilt_run_id`. GitHub
   caches are scoped per branch (a branch can also read its base branch's and
   the default branch's caches), so a new branch's first build is cold; later
   pushes on the same branch reuse its sccache.

Results land on `ci-results` under your branch name: `<results_name>-build/`
(build-stats.json, zen-setup.tail.log, errors, sccache stats) and
`<results_name>-gui-<engine>/` (result.json, screenshots, browser logs).

## GUI harness

`./dev gui-test [--engine gecko|chromium|webkit] [--scenario all|launch,chrome,about,fixture,input]
[--screenshot PATH] [--app auto|local|fetched|PATH] [--evidence-dir DIR] [--size WxH]
[--timeout S] [--launch-timeout S] [--hold S] [--list]`

Private Xvfb display, private D-Bus bus, owned throwaway profile, owned
loopback fixture server (`tests/fixtures/engine.html`). Test-only switches,
never used by `./dev run`: `-marionette --remote-allow-system-access` with a
random loopback Marionette port. TLS, origin isolation and the content/GPU
sandboxes are left exactly as built. Exit 0 PASS, 1 FAIL, 2 BLOCKED_ENV; JSON on
stdout and `<evidence>/result.json`.

Scenarios: `launch` (a mapped X11 window of the app's pid, browser chrome
loaded), `chrome` (`window.AxioSozo`, Zen workspaces, Gecko engine adapter,
engine-view surface service absent → AXCF pipe fallback), `about`
(about:axiosozo renders its heading), `fixture` (the fixture renders in the
engine's tab), `input` (xdotool click/type/button/address-bar navigation,
observed through the page title).

### Software WebRender and Zen's backdrop patch

On runners without a GPU, Gecko uses software WebRender (SWGL) on llvmpipe.
Zen's pinned `src/external-patches/firefox/allow_backdrop_to_work_on_transparency.patch`
(a backport of Mozilla bug 2036640, pref `gfx.webrender.opaque-backdrop-fallback`,
default true) clears a captured backdrop's alpha with `glColorMask`. SWGL does
not implement `color_mask` (it is a bare `panic!()`), so every backdrop-filter
(for example Zen's urlbar after Return) used to crash the parent's Renderer
thread. The `gfx/webrender_bindings/WebRenderAPI.cpp` record in
`patches/zen/firefox-native.json` turns the fallback on only when the
renderer is not SWGL. GPU WebRender, including macOS, is unchanged. If a Zen
update changes that file, the record fails with `PATCH_CONFLICT`. Rerun the
source probe with `patched|gfx/webrender_bindings/WebRenderAPI.cpp` to get the
new post-import hash.

Engine plug-ins live in `scripts/gui_engines/<name>.py` and export
`ENGINE = <GuiEngine subclass>()` with `browser_environment`, `prepare`,
`show`, `assert_rendered`, `content_title`. Chromium (`cloud/linux-cef`) and
WebKit (`cloud/webkit-host`) are stubs reporting BLOCKED_ENV until those
workstreams implement them; `assert_rendered` must use engine-reported state
and screenshots, never Gecko's DOM.
