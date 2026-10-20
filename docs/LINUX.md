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

Engine plug-ins live in `scripts/gui_engines/<name>.py` and export
`ENGINE = <GuiEngine subclass>()` with `browser_environment`, `prepare`,
`show`, `assert_rendered`, `content_title`. Chromium (`cloud/linux-cef`) and
WebKit (`cloud/webkit-host`) are stubs reporting BLOCKED_ENV until those
workstreams implement them; `assert_rendered` must use engine-reported state
and screenshots, never Gecko's DOM.

## Native feel (workstream gecko-linux-feel)

Goal: on GNOME and KDE, AxioSozo should behave like the stock Firefox those
users know, not like a macOS app ported over. Every Linux change is gated on
the platform; macOS text and behaviour stay byte-for-byte as they were.

### What changed

| Area | Linux behaviour | Where |
| --- | --- | --- |
| Wording | "this Mac" → "this computer", "the macOS Keychain" → "the system keyring (Secret Service)", `⌘K` → `Ctrl+K`, "press Return" → "press Enter" in about:axiosozo, the Lab, providers, site rules and toasts. Only authored strings are rewritten, never project names, titles or URLs. `platform-words.test.mjs` fails on any new unwrapped Mac-ism. | `apps/browser/chrome/overview/platform-words.mjs` (`words()`, `shortcutLabel()`, `data-platform-words`) |
| Shortcuts | Browser actions and the Ask AI panel use Ctrl (Super belongs to the desktop). Region capture's Control-click-as-right-click is macOS-only; on Linux Ctrl+click still opens a link in a new tab. | `BrowserExperience.sys.mjs`, `ProviderPanel.sys.mjs`, `RegionCapture.sys.mjs` |
| Scrolling | Firefox 156's own wheel and smooth-scroll defaults instead of Zen's "fastfox" tuning: Firefox's animation (no MSD physics, its durations and weightings). Distance per wheel notch is unchanged (114 px measured before and after): stock Firefox gets its 2× from `mousewheel.system_scroll_override` at multiplier 100, which also yields to a scroll speed the user set in GNOME/KDE; Zen's multiplier 200 bypassed that override. Kinetic scrolling (`apz.gtk.kinetic_scroll.enabled`) and overlay scrollbars stay on, as in Firefox. | `LinuxDesktop.sys.mjs` (default branch only, at startup) |
| Window controls | `zen.view.hide-window-controls=false`: close/minimize/maximize stay visible when GTK draws client-side decorations (composited GNOME/KDE). Under a non-composited WM the WM frame draws them. | `LinuxDesktop.sys.mjs` |
| First window | Firefox maximizes the first window on screens under 1280×1040 (browser-init.js). Zen's welcome locks the window to 1200×720 and left it so; on Linux it now gets Firefox's size when the welcome ends. | `installLinuxWindowSizing()` |
| Welcome | Without an H.264 decoder (Fedora, minimal installs, CI) Zen's welcome video never paints and the white title was unreadable on light grey; a deep-green backdrop sits behind the video. | `linux-desktop.css` |
| Desktop entry | `python3 scripts/linux_desktop.py install [--app PATH]` writes `AxioSozoDev.desktop` and hicolor icons under `$XDG_DATA_HOME`. `StartupWMClass=AxioSozoDev` is what Gecko puts in WM_CLASS (and the Wayland app id): the GTK program name from `RemotingName`. It never sets the default browser (`xdg-settings set default-web-browser AxioSozoDev.desktop` is the user's choice). | `scripts/linux_desktop.py` |

Why the prefs are set at runtime and not in `defaults.yaml`: Zen's ffprefs
sorts all YAML prefs by name and breaks ties by directory listing order, so a
second entry for a pref Zen already defines would win or lose depending on the
file system.

### Kept as stock Firefox on Linux (checked by the harness)

`middlemouse.paste=true`, `general.autoScroll=false`, overlay scrollbars,
`widget.use-xdg-desktop-portal.file-picker=2` (GTK file chooser; the portal
inside Flatpak/Snap; set it to 1 on KDE for the KDE dialog), fontconfig
hinting/antialiasing (chrome uses the GTK "Sans" font), the system colour
scheme (GTK dark → chrome, about:axiosozo and web content dark), WebRender with
the GPU when available. On real desktops: hardware video decoding
(`media.hardware-video-decoding.enabled`) and dmabuf are Firefox's defaults;
`gfx.webrender.all` is not needed. CI runs WebRender software (llvmpipe).

### The feel harness

```sh
python3 scripts/gui_gecko_feel.py --app fetched [--wm auto|metacity|openbox|none] \
  [--desktop GNOME|KDE|none] [--theme light|dark] [--scale 1|2] [--first-run] [--strict]
```

Built on `scripts/gui_test.py` (same private Xvfb/D-Bus/profile and
test-only Marionette switches). It adds a window manager (metacity, which also
composites) to the private display, because a bare Xvfb has none: that is why
the first Linux screenshots showed a 1152×720 window — Firefox asked for a
maximized window and nobody executed it. It also sets `XDG_CURRENT_DESKTOP`
for the app as a desktop session does: on X11 Gecko only uses client-side
decorations (Zen's own titlebar buttons) when it is set
(`nsWindow::GetSystemGtkWindowDecoration`); without it the WM draws a frame. `linux-gecko-feel.yml` runs six modes against
the baseline artifact (before) and this branch's build (after, `--strict`).
It never types into the address bar (WebRender crash, cloud/linux-platform).

### What remains

- A real GNOME/KDE session (mutter/KWin, Wayland) is NOT_VERIFIED: CI uses
  Xvfb + metacity with `XDG_CURRENT_DESKTOP` set. Wayland app-id grouping follows from the same
  prgname but was not observed.
- No packaged .deb/.rpm/Flatpak: the tarball plus `linux_desktop.py` is the
  development integration.
- Zen's welcome still shows its own 1200×720 window during onboarding (Zen design).
- GPU paths (dmabuf, VA-API, hardware WebRender) cannot be measured on the
  CI runners.
