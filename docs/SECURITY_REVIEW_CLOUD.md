# Security and safety review of the cloud program (cloud/integration vs dev)

Workstream `final-review`, 20 Oct 2026. Scope: the whole diff `origin/dev...cloud/final-review`
(about 860 files: engine hosts, Zen chrome JS, the Linux engine-view component, Zen patches, CI
workflows, scripts, docs and evidence). Method: the diff was read (two independent passes, one on
the engines and sandboxes, one on secrets, downloads and CI) and every finding below was checked
against the code by hand. Items marked **fixed** are fixed on this branch; the others are accepted
with the reason given. Nothing here claims READY.

## Summary

| area | result |
| --- | --- |
| CEF sandbox (Linux SUID / namespaces, macOS) | unchanged and on; no `--no-sandbox` anywhere |
| WPE sandbox (bubblewrap) | on; the WebKit kill switch makes the host exit |
| WKWebView (macOS) | default trust handling; no TLS bypass |
| TLS | fails closed in all three engines |
| Origin isolation | unchanged; no web-security / isolation switches |
| Fixture / web-mode gates | unchanged or stricter |
| TEST-ONLY switches | harness only; none reachable in a product build |
| Secrets, tokens, personal data | none committed (one known username in guard paths) |
| Downloads | every download pinned (version + sha256 / digest) |
| CI workflows | 2 medium findings **fixed**, 2 low **fixed** |
| macOS owner-machine paths | unchanged; CI mode refused on the owner's Mac (now also base-shim) |

## Engines and sandboxes

1. **CEF sandbox (none).** `native/chromium-host/core/host_core.cc` sets `no_sandbox = 0`,
   `command_line_args_disabled = 1`, `remote_debugging_port = 0`. Linux switches are fixed
   (`linux/main_linux.cc`: ozone platform, overlay scrollbars); nothing comes from the caller.
   `probe.py check` reports BLOCKED_ENV without a usable namespace or SUID sandbox and refuses to
   run as root; E0 requires the renderer under seccomp-bpf and a PID namespace.
2. **SUID helper install race (medium, dev tooling, fixed).** `probe.py install-sandbox` checked the
   digest of `chrome-sandbox` in the user-writable build root, then ran `sudo chown` and
   `sudo chmod 4755` on the path (chmod follows symlinks; the sudo prompt widens the window). It is
   now one privileged step on one open file: `O_NOFOLLOW`, a single-link regular file, `fchown`
   to root, the sha256 re-checked on the now root-owned inode, then `fchmod 4755`
   (`SUID_INSTALL` in `native/chromium-host/probe.py`; checked locally: success, wrong digest and
   symlink cases).
3. **WPE sandbox (none).** `host_wpe.cpp` exits with code 70 when
   `WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS` is set and `probe.py check` refuses it; Zen starts
   the host with an explicit, non-inherited environment (`WebKitEngineAdapter.sys.mjs`,
   `environmentAppend:false`). `scripts/webkit_zen_container.sh` runs the tests unprivileged and
   never sets it.
4. **TLS (none, fails closed).** CEF `on_certificate_error` cancels the load and only reports
   `certificate_error`; client certificates always choose none. WPE uses
   `WEBKIT_TLS_ERRORS_POLICY_FAIL`. WKWebView server-trust challenges use default handling,
   other challenges are cancelled. No ignore-certificate-errors / allow-insecure setting exists.
5. **Origin isolation (none).** No site-per-process, process-per-site or web-security switches.
   CEF keeps its own request context (persistent only in web mode). WPE: file-URL universal
   access off, a content blocker allows only the fixture origin, navigation checked in
   `decide-policy`.
6. **Fixture / web gates (unchanged or stricter).** `launchHost` keeps dev's rules (web mode needs
   `AXIOSOZO_ENGINE_SWITCHING=1`; fixture mode needs `AXIOSOZO_ENGINE_FIXTURE_ORIGIN` to pass
   `validFixtureOrigin`). The stream client adds a 128-character limit; the C++ `allowedURL` also
   rejects an empty fixture origin. WebKit is fixture-only and off by default
   (`axiosozo.engines.webkit.enabled=false`); `axiosozo.engines.webkit.web.enabled` enables nothing.
7. **Warm spare hosts (none).** `EngineHostSpare.sys.mjs`: one use, fixture mode only, taken only
   for `targetCount === 0` and the same fixture identity; a fresh private profile per spare;
   private windows refused; never on macOS.
8. **memfd frame transport (low, partly fixed).** The native receiver
   (`engine-view/linux/AxioFrameReceiver.cpp`) checks fd range, slot bounds, that the pid is Zen's
   own child, `S_ISREG`, exact size and the SHRINK|GROW seals, maps read-only and bounds-checks
   every rectangle. The JS slot reader did not check the descriptor type: a compromised host could
   name a pipe or socket of its own (a stall, no privilege gain: the pid is Subprocess's child).
   **Fixed:** `memfdSlotReader` now requires `IOUtils.stat` to report a regular file of exactly
   `slots × slot_bytes` before the first read, else the existing pipe fallback
   (`apps/browser/tests/cef-adapter.test.mjs`, "memfd slot reader reads only a regular ring").
   Accepted: the frame worker opens the same path without that check (same residual: a stall of
   the host's own tab), and `ParentOf(pid)` accepts any child of Zen (the pid always comes from
   Subprocess). No `F_SEAL_WRITE` by design (the host writes; Zen copies, so at worst a torn frame).
9. **Host binary location (low, accepted).** On Linux, `AXIOSOZO_BUILD_ROOT` / `AXIOSOZO_CEF_ROOT`
   pass `validLinuxRoot` (absolute, not /proc, /sys, /dev). A user who points them at a directory
   other users can write lets those users replace the host binary. These variables are developer
   settings of the user's own shell (macOS stays pinned to `/Volumes/...`); a product package must
   ship the hosts inside the app directory. Recorded for the packaging work.

## TEST-ONLY switches

- Harness only: Marionette (`-marionette --remote-allow-system-access`) on a throwaway owned
  profile; `webkit_package.py overlay-chrome` (labelled `chrome-overlay` in evidence);
  `cef_zen_e2e.py --pref axiosozo.engines.linux.*` (listed in `test_only_switches`);
  `zen_profile.py --wr-promotion-log` / `--pref`; `layout.css.devPixelsPerPx=2`. None of them is
  in a product build or default profile.
- Product prefs, not test switches: `axiosozo.engines.linux.memfd_frames`, `native_receiver`,
  `frame_worker`, `direct_composite`, `axiosozo.engines.prewarm` (all default on, Linux only,
  gated off on macOS). None touches TLS, sandboxing or isolation.
- Environment read by the product: `AXIOSOZO_WEBKIT_TRACE` (stderr diagnostics),
  `AXIO_WEBKIT_NO_PREWARM` (performance). Neither reaches the host's environment.
- This branch removes the TEST-ONLY `memfd_frames=false` workaround from the Chromium E2E runs
  (linux-cef-zen's frame-path probe now chooses the product default; see docs/handoff/final-review.md).

## Secrets, personal data, binaries

- No tokens, keys, `.env` files or private keys in added lines (searched: `ghp_`, `github_pat_`,
  `AKIA`/`ASIA`, `sk-`, `xox`, `AIza`, PEM blocks, bearer tokens). Password strings are fixture text.
- Personal data: only `/Users/wout/.local/bin/{dev-external,mount-dev-storage}` as guard / helper
  paths (already in AGENTS.md and dev's `probe.py`). No e-mail addresses, keychain items, profile
  paths or `/Volumes/T9` contents.
- No binaries other than small evidence PNGs (largest 250 KB); nothing over 1 MB.

## Downloads

Every lockfile entry with a URL carries a hash (CEF for three platforms sha256, Zen toolchains,
`ci_node`, WPE tarballs sha256, `surfer` npm sha512), and each download site verifies it before use
(`linux-cef-host.yml`, `linux-source-probe.yml`, `upstream/build.sh`, `scripts/ci_tools.py`,
`scripts/macos_ci.py`, `native/chromium-host/probe.py`). Every container image is
`debian:trixie-20261005@sha256:913f6706…` (`webkit.ci_image`). Accepted (low): a few `apt-get`
installs from the live Ubuntu/Debian mirrors without versions (`native/webkit-host/upstream/build.sh`,
the TEMPORARY `ci/api_dump.sh`, runner GUI packages); the pinned WPE containers use the dated
`snapshot.debian.org` mirror. `upstream/discover.sh` fetches release indexes without hashes; its
output only proposes new pins, and the tarballs are sha256-checked when built.

## CI workflows

1. **Script injection through branch names (medium, fixed).** `linux-engine-bench.yml`,
   `linux-engine-profile.yml` and `linux-perf.yml` pasted the zen-source job output (JSON with
   `head_branch`) into `run:` text in jobs holding `contents: write`. It now reaches the script
   through `env: ZEN_ARTIFACT_JSON` only. Other event text (`head_ref`, PR sha) already went through
   `env:` (`publish-ci-results`, `macos-webkit-host`).
2. **App artifacts from untrusted branches (medium, fixed).** "Newest artifact" pickers took any
   branch's `axiosozo-zen-linux-x86_64`, so a PR build could be picked up by a later push run. The
   unpinned fallback now accepts only builds of `cloud/integration` or `dev` from this repository
   (`linux-cef-zen`, `linux-webkit-zen`, `linux-cef-host`, `linux-gui`, `linux-perf`,
   `linux-engine-bench`, `linux-engine-profile`); pinned run ids are explicit, reviewed values.
3. **Tag-pinned actions (low, fixed).** `actions/checkout@v4` and `actions/cache/*@v4` in
   `linux-webkit-host.yml` / `linux-webkit-upstream.yml` now use the same full SHAs as the rest.
4. **Default permissions (low, fixed).** Four workflows had no top-level `permissions:`; they now
   default to `contents: read` (jobs widen to `contents: write` only to publish CI results).
5. No `pull_request_target`, `issue_comment` or `workflow_run` triggers; no self-hosted runners.
6. Accepted (low): `publish-ci-results` puts the job's `github.token` into a temporary git remote
   URL (masked in logs, removed with the runner).
7. Triggers consolidated: push to `cloud/integration` and `dev`, PRs into them, path filters kept;
   dead session branches no longer trigger runs.

## macOS owner machine

- Unchanged on macOS: `host.mm`, `surface_transport.mm`, the engine-view `.mm` files (no diff);
  `transport.hpp` adds only `__linux__`-gated memfd / pipe-size code; `expectedCEFPlatform("Darwin")`,
  `/Volumes` checks and `cefHostEnvironment` (`{PATH, TMPDIR}`) as on dev; memfd, worker, native
  receiver, direct compositing and spare hosts are gated off macOS.
- CI mode refused on the owner's Mac: `scripts/storage.py` raises unless `GITHUB_ACTIONS=true` and
  none of `/Volumes/T9`, `mount-dev-storage`, `dev-external` exists (same in `probe.py` and
  `packages/provider-host/src/storage.mjs`). **Fixed gap:** `macos_ci.py base-shim`, which rewrites
  a checkout to accept CI mode, had no such guard; it now refuses with the same rule
  (`require_ci_runner`).
- Visible macOS changes (deliberate, documented for the owner):
  - Chromium tabs no longer show "Not secure" for loopback `http:` pages (`loopbackURL`,
    CEFPresenter). Firefox and Chromium do the same (W3C Secure Contexts: loopback is
    potentially trustworthy); TLS handling is unchanged.
  - `patches/zen/firefox-native.json` adds a `!swgl` guard: changes macOS only when WebRender
    falls back to software.
  - The macOS WKWebView host (cloud/merge-webkit-macos) runs only with
    `axiosozo.engines.webkit.enabled` plus `AXIOSOZO_WEBKIT_BINARY` (both off by default). Its
    frame ring uses global IOSurfaces like the existing CEF design on dev (any local process can
    look up a global surface by id; same exposure as dev's Chromium path).

## Evidence

The fixes are verified by the node suites (`apps/browser/tests`), `tests/test_gui_view_pixels.py`,
and the Actions matrix on this branch's PR, head ac9cefc (run ids in docs/CLOUD_PROGRAM_SUMMARY.md and
docs/handoff/final-review.md).
