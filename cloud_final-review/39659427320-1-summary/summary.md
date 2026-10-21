# Engine bench summary — run 39659427320

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium+damage**: status BLOCKED_ENV (None/5 reps), engine ?, render_path None, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1'] — error: RuntimeError: BLOCKED_ENV: no usable Chromium sandbox (unprivileged user namespaces are unavailable and chrome-sandbox is not root:root 4755). Run `python3 native/chromium-host/probe.py install-sandbox` (sudo). The host never runs without its sandbox.
- **chromium+damage+payload**: status BLOCKED_ENV (None/5 reps), engine ?, render_path None, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1'] — error: RuntimeError: BLOCKED_ENV: no usable Chromium sandbox (unprivileged user namespaces are unavailable and chrome-sandbox is not root:root 4755). Run `python3 native/chromium-host/probe.py install-sandbox` (sudo). The host never runs without its sandbox.

| Metric | chromium+damage | chromium+damage+payload |
| --- | --- | --- |
| Spawn → ready | — | — |
| Create → first frame (1×) | — | — |
| Create → painted frame (1×) | — | — |
| Navigate → painted frame (static, 1×) | — | — |
| Idle frames/s (static page) | — | — |
| Processes after create | — | — |
| RSS after create (host+helpers) | — | — |
| PSS after create (host+helpers) | — | — |
| Close → host exit | — | — |
| Close → no helper left | — | — |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | — | — |
| rAF frame interval median | — | — |
| rAF frame interval p99 | — | — |
| rAF intervals > 25 ms | — | — |
| rAF pipe throughput | — | — |
| rAF bytes/frame | — | — |
| rAF client read time/frame | — | — |
| rAF changed-row band (share of frame) | — | — |
| rAF host damage share (damage run) | — | — |
| rAF CPU host+helpers | — | — |
| rAF RSS host+helpers | — | — |
| Scroll fps (wheel 60 Hz) | — | — |
| Scroll frame interval p99 | — | — |
| Scroll pipe throughput | — | — |
| Scroll CPU host+helpers | — | — |
| Scroll host damage share (damage run) | — | — |
| Image page scroll fps | — | — |
| DOM page scroll fps | — | — |
| Key → changed frame (pooled) | — | — |
| Key → title event (median of reps) | — | — |
| Wheel → changed frame (pooled) | — | — |
| Image page navigate → painted | — | — |
| DOM page navigate → painted | — | — |
| Resize → frame at new size | — | — |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | — | — |
| rAF frame interval median | — | — |
| rAF frame interval p99 | — | — |
| rAF intervals > 25 ms | — | — |
| rAF pipe throughput | — | — |
| rAF bytes/frame | — | — |
| rAF client read time/frame | — | — |
| rAF changed-row band (share of frame) | — | — |
| rAF host damage share (damage run) | — | — |
| rAF CPU host+helpers | — | — |
| rAF RSS host+helpers | — | — |
| Scroll fps (wheel 60 Hz) | — | — |
| Scroll frame interval p99 | — | — |
| Scroll pipe throughput | — | — |
| Scroll CPU host+helpers | — | — |
| Scroll host damage share (damage run) | — | — |
| Image page scroll fps | — | — |
| DOM page scroll fps | — | — |
| Key → changed frame (pooled) | — | — |
| Key → title event (median of reps) | — | — |
| Wheel → changed frame (pooled) | — | — |
| Image page navigate → painted | — | — |
| DOM page navigate → painted | — | — |
| Resize → frame at new size | — | — |

## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.22 [2.62] | 4.01 [5.89] |
| presenter_bgraToRGBA | 1.28 [2.37] | 4.55 [4.76] |
| candidate_u32_fast_path | 1.25 [2.62] | 4.97 [5.17] |
| putImageData_full | 0.06 [0.07] | 0.21 [0.23] |
| presenter_draw_full | 1.31 [1.61] | 4.97 [10.79] |
| surface_draw_full | 1.38 [1.51] | 5.71 [6.05] |
| surface_draw_damage10 | 0.15 [0.24] | 0.59 [0.72] |
| candidate_videoframe_full | 1.19 [1.47] | 4.22 [5.67] |
| candidate_videoframe_damage10 | 0.20 [0.33] | 0.77 [2.58] |
| surface_upload_draw_full | 1.06 [1.44] | 4.59 [6.28] |
| surface_upload_draw_damage10 | 0.21 [0.42] | 0.79 [9.84] |
| candidate_damage10_fast_put | 0.24 [0.40] | 0.66 [1.10] |
| candidate_createImageBitmap | 3.20 [4.18] | 13.41 [14.62] |
| candidate_webgl_full | 2.62 [4.07] | 10.46 [12.99] |
| candidate_webgl_damage10 | 3.12 [6.42] | 11.59 [18.66] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.88 [1.64] | 3.50 [5.34] |
| presenter_bgraToRGBA | 1.14 [1.80] | 4.54 [4.76] |
| candidate_u32_fast_path | 1.06 [1.74] | 3.32 [3.48] |
| putImageData_full | 0.12 [0.14] | 0.48 [0.50] |
| presenter_draw_full | 1.60 [2.40] | 4.98 [5.46] |
| surface_draw_full | 1.34 [2.28] | 5.04 [5.18] |
| surface_draw_damage10 | 0.20 [0.28] | 0.52 [0.68] |
| candidate_videoframe_full | 1.22 [1.44] | 4.38 [5.68] |
| candidate_videoframe_damage10 | 0.04 [0.12] | 0.10 [0.14] |
| surface_upload_draw_full | 1.24 [1.60] | 4.42 [6.00] |
| surface_upload_draw_damage10 | 0.06 [0.10] | 0.12 [0.24] |
| candidate_damage10_fast_put | 0.26 [0.40] | 0.82 [1.10] |
| candidate_createImageBitmap | 4.22 [5.76] | 16.76 [18.98] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.14 [1.29] | 0.13 [1.07] | 0.74 [4.15] | 0.74 [4.21] |
| presenter_bgraToRGBA | 1.13 [1.18] | 1.14 [1.17] | 3.22 [3.27] | 4.60 [4.75] |
| candidate_u32_opaque_fast_path | 1.12 [1.15] | 1.01 [1.03] | 3.01 [3.50] | 4.03 [4.07] |

## Integrated (Zen app) — chromium: BLOCKED_ENV

Reason: no unexpired axiosozo-zen-linux-x86_64 artifact

## Integrated (Zen app) — gecko: BLOCKED_ENV

Reason: no unexpired axiosozo-zen-linux-x86_64 artifact
