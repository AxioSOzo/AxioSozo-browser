# Zen parent-process profile findings (engine-profile)

MEASUREMENT ONLY. Where the Zen parent spends CPU and time when a Chromium or WebKit tab
animates, scrolls, takes keys or is switched to, against a Gecko tab running the same fixtures.
Tooling: `tools/engine-bench/profile/` (zen_profile.py drives zen_bench's scenarios on the real
Linux app; hooks.js = TEST-ONLY chrome timing hooks; gecko_profile.py / report.py summarize the
Gecko profiler JSON), workflow `.github/workflows/linux-engine-profile.yml`, results on the
`ci-results` branch.

Status: DRAFT — the run on the current cloud/integration defaults (memfd frames + native
receiver, run 39379600003) is in progress; the sections below are the pre-phase-2 baseline.

## Method

- App: prebuilt Linux Zen artifact (`axiosozo-zen-linux-x86_64`) + TEST-ONLY chrome overlay of
  the checkout (so chrome JS and hosts are the branch's), software WebRender under Xvfb on
  GitHub `ubuntu-24.04` runners (4 vCPU AMD EPYC, no GPU). WebKit runs in the pinned debian:13
  image. Sandboxes on.
- Three passes per engine, each in a fresh tab: **plain** (no instrumentation; per-thread CPU
  from `/proc/<pid>/task/*/stat` of every process in the app tree), **trace** (+ chrome timing
  hooks), **profile** (+ Gecko profiler, 1 ms, `js,stackwalk,cpu,processcpu,ipcmessages`, threads
  GeckoMain / DOM Worker / IPC I/O / Compositor / Renderer / WR* / SwComposite / background
  pools). CPU numbers come from **plain**; attribution from **profile**; the profile pass adds
  SamplerThread (~5–12 %) and inflates the first window after start (Gecko profile idle ~120 %).
- Windows: switch-to-engine, idle (2 s), raf (3 s rAF fixture), raf-nosampler (control without
  zen_bench's 2 ms chrome sampler; added for the phase-2 run), scroll (XTest wheel), key, switch-to-gecko.

## Baseline: EngineFrameSurface path, before perf-phase2 (run 39363370750)

App linux-zen-build 39346931130; chrome JS = cloud/integration after perf-pixel-path (JS swizzle +
putImageData through EngineFrameSurface, Subprocess pipe frames, 1 MiB pipes, damage payloads).

| tab (plain pass) | raf fps | Zen parent CPU % raf | scroll CPU % | key→frame ms | Gecko→engine switch ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| Gecko 1× | 59.0 | 30.8 (Renderer 16.6) | 52.8 | 8.0 | — |
| Gecko 2× | 59.0 | 36.1 (Renderer 20.8) | 94.1 (Renderer 68.5) | 9.0 | — |
| Chromium 2× | 58.4 | 117.8 (main 46, DOM Worker 26, Renderer 19, SwComposite 17) | 139.7 | 21.0 | 789 (trace 444) |
| WebKit 2× | 42.1 | 126.7 (main 47, DOM Worker 33, Renderer 22, SwComposite 16) | 112.7 | 32.2 | 565 |

Profile attribution (Chromium 2× raf, 3.2 s window, parent CPU ms): main 1567 (JS 611: the
EngineFrameSurface `swizzleRun` 262 self, `memmove` 379 self, `Premultiply_AVX2` 76 in
putImageData; GC 222 ms major), Subprocess DOM Worker 980 (pipe `read` 150, `memmove` 131,
poll), Renderer 572 + SwComposite 530 (software WR compositing the canvas: `scale_blit`,
`blendTextureNearestFast`). WebKit 2× raf is the same shape (main 1475 with swizzle 340 +
memmove 321; worker 929; Renderer 557 + SwComposite 499; GC 591 ms).

Key → frame (trace pass, median): Chromium 1× keydown→send 0.5 ms, send→first frame header
(host input + render) 7.5 ms, transport 0.5 ms, then the presenter; WebKit 1× host 14.4 ms +
rAF tick wait 8.9 ms. WebKit 2× host 27.6 ms. The host side dominates key latency.

Switch (trace, Chromium 1×): spawn 21→66 ms, hello→first host reply 67→287 ms (CEF init),
create→first frame 291→458 ms (first navigation + paint), first paint 472 ms. WebKit 1×: spawn
11→24, hello→reply 26→81, create→first frame 82→473 ms (WPE web process start + first load).
The parent's own share of the switch is < 20 ms; the rest is host/engine start-up.

(Phase-2 results, ranked parent-side costs and recommendations follow when run 39379600003 lands.)
