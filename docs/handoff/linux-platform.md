# Handoff: Linux platform foundation (`cloud/linux-platform`)

Status: WORK IN PROGRESS, handed off. Nothing here is READY.

This session ran on the owner's macOS laptop (Darwin 27.0.0, arm64, 10 CPUs,
16 GiB RAM, ~127 GiB free), not on a Linux cloud machine; remote isolation had
fallen back to local. Linux evidence below comes only from GitHub Actions
`ubuntu-24.04` runs this session triggered on PR #1 (draft, against
`cloud/integration`): runner = Ubuntu 24.04.5, kernel 6.17/7.0 azure, x86_64,
4 vCPU, 15.6 GiB RAM, 3 GiB swap, 145 GB disk with ~86 GB free. No Linux build,
VM or container ran on the laptop. A draft PR (#1,
https://github.com/AxioSOzo/AxioSozo-browser/pull/1) was already open before the
stop instruction; it carries the labels `linux-build` (full build workflow) and
can take `linux-gui`.

## What is done (code on this branch)

Platform layer (macOS paths kept as they were, gated by `storage.LINUX`):

- `scripts/storage.py`: Linux build root = `$AXIOSOZO_BUILD_ROOT` (absolute,
  normalized, outside the checkout, not /proc /sys /dev) or the gitignored
  `<checkout>/.build/`. Created 0700, refuses symlinks/foreign owners. On Linux
  `storage.VOLUME == storage.BUILD_ROOT` (toolchains, cargo home, CEF, runtime
  all live in the one root; there are no sub-roots). `storage.py exec` works
  without `dev-external`. Tests: `tests/test_storage.py` (`LinuxBuildRoot`; the
  macOS tests patch `LINUX=False` so they also run on Linux).
- `scripts/dev.py`: Linux `run(build=True)` goes through `storage.py exec`
  (no mount helper/wrapper). Gate summary per command; on Linux only gates in
  `LINUX_EXPECTED_BLOCKED` (macOS CEF probe, macOS Keychain positive fixture)
  may report BLOCKED_ENV without failing; any other BLOCKED_ENV or FAIL fails
  (`AXIOSOZO_STRICT=1` makes even those fail). macOS exit codes unchanged.
  New: `./dev setup --only upstreams,cargo,core,provider,cef,zen,tools`,
  `./dev gui-test ...`, `./dev fetch-build ...`, `./dev package` (Linux).
  `doctor` reports `os`, RAM via /proc, distro, GUI/sandbox tools.
- `scripts/zen_toolchain.py`: per-host pins: macOS keeps
  `patches/zen/toolchains.json`; Linux uses
  `patches/zen/toolchains-linux-{x86_64,aarch64}.json` (Node 22.22.3, Rust
  1.95.0, Python 3.11.16, GNU tar 1.35, cbindgen 0.29.4, WASI SDK 34, optional
  sccache 0.18.0; sha256 from official sources, also in `upstreams.lock.json`
  `zen_toolchain_linux_*`, `ci_node`, `ci_rust`, `ci_github_actions`). Linux PATH
  adds the selected system LLVM (`/usr/lib/llvm-<N>/bin`, N >= 19, override
  `AXIOSOZO_LLVM_VERSION`). `fetch --only node,python` for CI. The Rust
  `install.sh` audit hash is identical on Linux x86_64 and macOS (verified).
- `scripts/zen.py`: Linux doctor (prerequisites, LLVM >= 19 because pinned
  Firefox 156 refuses older clang), Linux stage mozconfig additions
  (`--enable-linker=lld`, `--with-libclang-path`, `--disable-warnings-as-errors`
  because MOZ_AUTOMATION=1 is only set to stop mach bootstrapping, optional
  `--with-ccache=<pinned sccache>` when `AXIOSOZO_SCCACHE=1`), dist/bin
  validation (`axiosozo-dev` executable, `application.ini` RemotingName
  `AxioSozoDev`), resource materialization in dist/bin, `package` command
  (`mach package` + `axiosozo-build-info.json`), `check` reports failing suites
  as FAIL (was mislabelled BLOCKED_ENV) and runs them via storage exec on Linux.
- Engine view: `apps/browser/native/engine-view/moz.build` already compiles
  Cocoa sources only under `MOZ_WIDGET_TOOLKIT == "cocoa"`; on Linux only the
  XPIDL interfaces build, no component registers, and
  `CEFEngineAdapter.engineSurfaceService()` returns null => AXCF pipe fallback.
  NOT VERIFIED in a Linux build yet (the harness `chrome` scenario records it).
- Artifact builds: NOT viable. `patches/zen/firefox-native.json` changes
  compiled Gecko (HTMLCanvasElement.h/.cpp, nsHTMLCanvasFrame.cpp, servo,
  toolchain.configure), Zen's ~256 patches change C++, and
  `apps/browser/native` compiles into libxul. Use sccache + the CI artifact.
- macOS-only overlay records (ZenShareInternal.mm, mozAccessible.mm, the Xcode
  linker detection in toolchain.configure) are textual and only compiled or
  executed on macOS (`target.kernel == "Darwin"`); they are applied unchanged on
  Linux so source hashes stay identical across platforms.
- Installers (`project_reader.py`, `arrival_subprocess.py`,
  `agent_socket_install.py`, `manifest_accept.py`, `agent_bridge_install.py`)
  take the pinned toolchain from `storage.VOLUME` (same value on macOS) and
  report a missing toolchain as BLOCKED_ENV instead of a traceback.
- provider-host: `src/storage.mjs` Linux build root; `native/secret-service.c`
  (libsecret helper, same argv/exit contract as `keychain.m`: never prompts or
  unlocks, refuses locked/missing service with exit 1, no plaintext fallback);
  `SecretServiceKeychain`/`platformKeychain` in `src/keychain.mjs`; cli.mjs
  Linux check/setup; tests `tests/secret-service.os.mjs` (no-bus fail closed +
  private dbus-run-session/gnome-keyring round trip with synthetic keys) and
  `tests/sandbox-linux.os.mjs` (provider sandbox UNSUPPORTED on Linux: every
  launch path BLOCKED_ENV). No bubblewrap/Landlock broker was written.
- `ProjectRunner.sys.mjs`: Linux runs the process-group supervisor with
  `/bin/bash` (`supervisorShell("Linux")`); dash turns `set -m` off without a
  tty, so the run was stopped at once (CI: exit 143 instead of 3). macOS keeps
  `/bin/sh`. Wired in `AxioSozoServices.sys.mjs`.
- Test fixes: `lab-today-page.test.mjs` pinned Date (it failed on every
  platform after 9 Oct 2026); external-TMPDIR assertions accept the Linux build
  root; `fixtures/keychain-fake.sh` committed as executable (was 100644, the
  MacKeychain fake test failed on a fresh checkout).
- GUI harness `scripts/gui_test.py` + `scripts/gui_engines/` (see interface).
  NEVER RUN (no Linux app exists yet).
- `./dev fetch-build` (`scripts/linux_build.py`), `scripts/ci_tools.py`
  (pinned CI Node 24.14.0), `scripts/linux_packages.py` (apt package groups).
- Workflows: `.github/workflows/linux-ci.yml` (PRs to cloud/integration:
  setup cargo/tools/provider, doctor, check, test), `linux-zen-build.yml`
  (dispatch or PR label `linux-build`: build with sccache cache, package,
  upload artifact `axiosozo-zen-linux-x86_64`, then a `gui` job), `linux-gui.yml`
  (dispatch or label `linux-gui`: fetch newest artifact, run the harness).
  All actions pinned by commit SHA.

## Linux evidence so far (GitHub Actions, PR #1)

- `./dev doctor` on ubuntu-24.04: identifies `"os": "linux"`, Ubuntu 24.04.5,
  4 CPUs, 15.6 GiB, build root `/home/runner/axiosozo-build` (84 GiB free).
- Run 39290630729 (commit 27c26c1), `./dev check`: 7 PASS, 2 FAIL, 2
  BLOCKED_ENV. FAIL: `provider-host cli.mjs check` and `zen.py check` (details
  not yet read: look at the uploaded `linux-check-test-logs` artifact).
  BLOCKED_ENV: CEF probe (expected), `agent_bridge_install.py check` (not
  expected: read its JSON line; it needs the pinned Node from
  `zen_toolchain.py fetch --only node,python`).
- Same run, `./dev test`: 7 PASS, 9 FAIL, 2 BLOCKED_ENV. FAIL includes the
  `tools/*_test.py` runners, `unittest discover` (tests/*.py), and
  `native/chromium-host/test_probe.py` / `stream_test.py` (CEF, macOS-bound;
  coordinate with cloud/linux-cef before allowlisting). PASS: coordinator
  cargo tests/build, cef-adapter, saved-pages, contexts suites,
  coordinator.test.mjs.
- Earlier run 39288670943: 2852/2875 browser node tests passed; the 7 failures
  were the Today time bomb, the runner/dash bug and the macOS-only TMPDIR
  asserts, all addressed in 27c26c1 but not yet re-verified.
- Zen build run 39290651187: Linux toolchain setup completed in ~2.5 min
  (pinned downloads verified, Rust installed, GNU tar built, cbindgen built),
  then failed at `git clone --no-local upstream/zen` because upstreams.py made a
  blob-less partial clone ("could not fetch ... from promisor remote"). The
  final commit changes upstreams.py to clone Zen with blobs (UNTESTED). No
  mach configure/compile has run on Linux yet; no build duration exists.
- No GUI run, no screenshot. `docs/evidence/linux/` is gitignore-exempt but
  empty.

## Exact next steps (on a Linux machine; Ubuntu 24.04 assumed)

```sh
git fetch origin && git checkout cloud/linux-platform
export AXIOSOZO_BUILD_ROOT=$HOME/axiosozo-build   # or omit: <checkout>/.build
sudo apt-get install -y --no-install-recommends $(python3 scripts/linux_packages.py test build gui)
./dev doctor
python3 scripts/zen_toolchain.py fetch --only node,python
./dev setup --only cargo,tools,provider
./dev check     # fix the remaining FAILs listed above
./dev test
./dev setup --only upstreams                       # Zen now cloned with blobs
AXIOSOZO_SCCACHE=1 /usr/bin/time -v ./dev setup --only zen   # record duration/RSS
./dev package
./dev gui-test --engine gecko --scenario all --screenshot docs/evidence/linux/gecko-fixture.png
```

Or in CI: remove and re-add the `linux-build` label on the PR (each label add
is one full build; sccache is saved even when the build step times out at
300 min). Then `./dev fetch-build` on any Linux machine downloads the newest
successful artifact (needs `gh auth`), and `./dev gui-test --app fetched`.

Things most likely to need fixing next, in order: (1) `agent_bridge_install`
and the remaining test FAILs, (2) mach configure on Linux (system clang-19,
libclang path, MOZ_AUTOMATION side effects, wasm sandbox with the pinned WASI
SDK), (3) `materialize_*` on dist/bin layout, (4) harness details that were
written blind: Marionette `--remote-allow-system-access` flag spelling,
`MarionetteActivePort` file, `xdotool search --pid`, xwd -> PNG conversion,
Zen first-run UI covering the window, (5) provider round-trip test with
gnome-keyring's default alias.

## Interfaces other workstreams should adopt

- Build root: Python `storage.BUILD_ROOT` / Node `providerBuildRoot()` parent;
  on Linux one directory holds everything (`toolchains/zen`, `cargo-home`,
  `cef/`, `runtime/<project-id>/`, `zen/obj`, `linux-app/`, `gui-evidence/`).
  Never write build output into the checkout except the gitignored `.build/`.
- Commands through `python3 scripts/storage.py exec -- <cmd>` (Linux) get
  TMPDIR/CARGO_TARGET_DIR/caches inside the build root.
- CEF on Linux: `dev.cef_binary()` uses `$AXIOSOZO_CEF_BINARY` or
  `<build root>/cef/linux/AxioCEFProbe`; `./dev check/test` call
  `native/chromium-host/probe.py check|test-native|setup|run` unchanged. When
  the probe supports Linux, drop it from `LINUX_EXPECTED_BLOCKED` in dev.py.
- GUI harness CLI: `./dev gui-test [--engine gecko|chromium|webkit]
  [--scenario all|launch,chrome,about,fixture,input] [--screenshot PATH]
  [--app auto|local|fetched|PATH] [--evidence-dir DIR] [--size WxH]
  [--timeout S] [--launch-timeout S] [--hold S] [--list]`; exit 0 PASS, 1 FAIL,
  2 BLOCKED_ENV; JSON on stdout and `<evidence>/result.json`.
- Engine plug-ins: one module per engine in `scripts/gui_engines/` exporting
  `ENGINE = <GuiEngine subclass>()` with `browser_environment(h)`,
  `prepare(h)`, `show(h, url)`, `assert_rendered(h, title_prefix)`,
  `content_title(h)`; harness helpers `h.chrome_script(js, args)`,
  `h.content_script(js, args)`, `h.open_tab(url)`, `h.wait(fn, what)`,
  `h.xdotool(...)`, `h.screenshot(name)`, `h.fixture.url`. `chromium.py`
  (cloud/linux-cef) and `webkit.py` (cloud/webkit-host) are stubs that report
  BLOCKED_ENV.
- Linux CI artifact: workflow `linux-zen-build.yml`, artifact
  `axiosozo-zen-linux-x86_64` = `axiosozo-dev-*.linux-x86_64.tar.xz` +
  `axiosozo-build-info.json` (sha256, commit, fingerprint), 30-day retention.

## Open questions

- Provider sandbox on Linux: build a bubblewrap (+ seccomp no-fork) or
  Landlock/seccomp broker, or keep providers refused on Linux? Ubuntu 24.04's
  AppArmor userns restriction affects bubblewrap and Firefox's own sandbox
  level; the harness records `security.sandbox.content.level` only.
- Chrome still hard-codes macOS paths for several helpers
  (`ProviderKeys.sys.mjs` volume check, `ProjectReaderConfig`,
  `ProjectArrivalSubprocess` with `/usr/sbin/lsof`, agent bridge pins). Those
  features fail closed on Linux today; porting them changes pinned hashes in
  chrome and needs an owner decision.
- `tools/axiosozo-arrival/arrival_lsof.py` uses `/usr/sbin/lsof` (Linux:
  `/usr/bin/lsof`, or a /proc implementation); `session.py` cleanup is
  process-group based and should work on Linux but is not verified there.
- workflow_dispatch only works once the workflow files reach the default
  branch (`main`); until then use the PR labels.
- The about:axiosozo copy says "Stored on this Mac only" (UX text for Linux).
