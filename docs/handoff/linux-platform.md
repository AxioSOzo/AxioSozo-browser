Status: DONE

# Handoff: linux-platform (`cloud/linux-platform`)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/9 (draft → cloud/integration) · Nothing here is READY.

## Machine resources

Claude Code cloud session: Ubuntu 24.04 x86_64, 4 vCPU, ~15 GiB RAM, network
allowlist (no archive.mozilla.org, no Actions log/artifact download). All Linux
build/GUI evidence comes from GitHub Actions `ubuntu-24.04` runners (4 vCPU,
16 GiB), read back through the `ci-results` branch.

## What changed this session

1. **Address-bar Return crash: root-caused and fixed (verified, run 39337785340).**
   - Symbolized core (run 39325384904, `crash-backtraces.txt`): Renderer
     thread, `RustMozCrash` ← `std::panicking::begin_panic<&str>` ←
     `<swgl::swgl_fns::Context as gleam::gl::Gl>::color_mask` ←
     `webrender::renderer::Renderer::draw_render_target` ← `draw_frame` ←
     `RendererOGL::UpdateAndRender`.
   - Pinned sources (new `linux-source-probe.yml`, runs 39336718120,
     39336887834, 39337495807): Firefox 156 `swgl_fns.rs:1638`
     `fn color_mask(..) { panic!(); }`. Vanilla Firefox never calls
     `color_mask` inside `draw_render_target`. Zen's
     `src/external-patches/firefox/allow_backdrop_to_work_on_transparency.patch`
     (backport of Mozilla bug 2036640) adds pref
     `gfx.webrender.opaque-backdrop-fallback` (default true). After blitting a
     backdrop-filter's backdrop, it calls
     `device.set_color_mask(false,false,false,true)` + `clear_target`.
     **Classification: an upstream Zen (backported Firefox) bug on software
     WebRender.** Any backdrop-filter crashes SWGL. Zen's urlbar redraw after
     Return hits it. It is not AxioSozo chrome code and not an Xvfb/font/GL
     artifact (the panic is deterministic in SWGL code).
   - Fix: a hash-pinned `patches/zen/firefox-native.json` record on the
     post-import `gfx/webrender_bindings/WebRenderAPI.cpp` (before
     `0e6bc18d…`, after `545730ca…`) passes
     `opaque_backdrop_fallback_AtStartup() && !swgl` to `wr_window_new`. GPU
     WebRender (macOS, Windows, Linux GL) keeps Zen's behavior. SWGL keeps
     Firefox 156's own backdrop behavior. No security, sandbox or TLS change.
   - Reverted 832ac3e (`gfx.webrender.compositor` off on GTK, patch 0009 and
     overlay record). Its hypothesis was wrong and it did not fix the crash.
2. `linux-source-probe.yml` + `scripts/source_probe.txt`: grep or copy files from
   the pinned Firefox tarball (sha512 verified) and the Zen revision, optionally
   after applying Zen's `src/**/*.patch` (prints post-import sha256 for
   firefox-native records). Documented in docs/LINUX.md.
3. Merged `origin/cloud/integration` into `cloud/linux-platform`.

## Runs

| Run | What | Result |
| --- | --- | --- |
| 39325384904 / 39325384875 | previous session, with 832ac3e | input FAIL (SIGSEGV, color_mask) |
| 39336718120, 39336887834, 39337495807 | source probe | PASS (data on ci-results) |
| 39336718081 | Zen build of the merge (no fix) | cancelled by me (superseded) |
| 39337785340 | Zen build (warm sccache, 1166 s setup) + GUI, b14bad7 | **PASS**: launch, chrome, about, fixture, input all PASS, no core dump |
| 39337785323 | `./dev check` + `./dev test` (push, b14bad7) | PASS |
| 39337919020 | `./dev check` + `./dev test` (PR #9 merge ref) | PASS |

## Verified vs NOT_VERIFIED

- Verified: the crash stack (symbolized core), the Zen patch's code, and the
  post-import hash of WebRenderAPI.cpp (probe run 39337495807).
  `node --test apps/browser/tests/new-tab-hook.test.mjs` passes locally after the revert.
- PASS (run 39337785340, ci-results `cloud_linux-platform/39337785340-1-zen-gui-gecko/`):
  click/type `axio`, Increment, Ctrl+L, typed URL, **Return** → content title
  `... | page=2`. Screenshot `docs/evidence/linux/gecko-input-39337785340.png`.
  Compositor `WebRender (Software)`, llvmpipe, `gfx.webrender.compositor=true`
  (Zen's default, restored by the revert), content sandbox level 6.
- NOT_VERIFIED: what backdrop-filter looks like under SWGL with the fallback off.
  It is Firefox 156's own behavior, but there is no visual comparison. Chromium
  and WebKit GUI legs are not run by this workstream; their owners use
  `linux-zen-reusable.yml`. macOS was not built here. The record is
  platform-neutral, and `swgl` is null on GPU WebRender, so macOS behavior is
  unchanged by construction.

## Interfaces / contracts for other workstreams

- Build root, `storage.py exec`, GUI harness CLI and engine plug-in API, and the
  `axiosozo-zen-linux-x86_64` artifact are unchanged (see docs/LINUX.md).
- Address-bar typing + Return no longer needs to be avoided. Use the
  `axiosozo-zen-linux-x86_64` artifact of run 39337785340 (or later):
  `prebuilt_run_id: 39337785340`. Older artifacts still crash.
- A Zen bump that changes `WebRenderAPI.cpp` makes setup fail with
  `PATCH_CONFLICT`. Rerun the source probe (`patched|…` line) for the new hash.

## Next steps

1. Integration lead: merge PR #9 so other branches' Zen builds carry the fix.
2. Optional: report the SWGL `color_mask` crash upstream to Zen. Their
   backdrop patch should skip SWGL, or SWGL should implement `color_mask`.
   Drop our record once upstream fixes it.
3. Optional: a GUI scenario that renders an explicit `backdrop-filter` element,
   so this class of SWGL regression is caught without the urlbar.
4. Remaining Linux gaps (unchanged from before): provider sandbox on Linux,
   macOS-only helper paths in chrome (fail closed on Linux).
