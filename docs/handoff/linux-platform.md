Status: PARTIAL

# Handoff: linux-platform (`cloud/linux-platform`)

PR: (draft, being opened) · Nothing here is READY.

## Machine resources

Claude Code cloud session: Ubuntu 24.04 x86_64, 4 vCPU, ~15 GiB RAM, network
allowlist (no archive.mozilla.org, no Actions log/artifact download). All Linux
build/GUI evidence comes from GitHub Actions `ubuntu-24.04` runners (4 vCPU,
16 GiB), read back through the `ci-results` branch.

## What changed this session

1. **Address-bar Return crash: root-caused and fixed (fix build in flight).**
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
| 39337785340 | Zen build + GUI with the fix (b14bad7) | IN PROGRESS |
| 39337785323 | `./dev check` + `./dev test` (b14bad7) | IN PROGRESS |

## Verified vs NOT_VERIFIED

- Verified: the crash stack (symbolized core), the Zen patch's code, and the
  post-import hash of WebRenderAPI.cpp (probe run 39337495807).
  `node --test apps/browser/tests/new-tab-hook.test.mjs` passes locally after the revert.
- NOT_VERIFIED yet: green `input` scenario with the fix (run 39337785340).

## Interfaces / contracts for other workstreams

- Build root, `storage.py exec`, GUI harness CLI and engine plug-in API, and the
  `axiosozo-zen-linux-x86_64` artifact are unchanged (see docs/LINUX.md).
- Address-bar typing + Return no longer needs to be avoided once run
  39337785340 is green. Use an artifact from a run at or after b14bad7.
- A Zen bump that changes `WebRenderAPI.cpp` makes setup fail with
  `PATCH_CONFLICT`. Rerun the source probe (`patched|…` line) for the new hash.

## Next steps

1. Watch 39337785340 (build ~20 min warm + GUI). On a green `input`, update this
   file to DONE with the run ids.
2. Keep `./dev check`/`./dev test` (linux-ci) and the full GUI harness green.
