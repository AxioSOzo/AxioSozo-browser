# Engine bench summary — run 39303324088

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | chromium | chromium+damage | webkit | webkit+damage |
| --- | --- | --- | --- | --- |
| Spawn → ready | 206 ms [314] | 209 ms [212] | 34 ms | 35 ms [37] |
| Create → first frame (1×) | 139 ms [3661] | 134 ms [142] | 359 ms [370] | 368 ms [376] |
| Create → painted frame (1×) | 140 ms [3662] | 136 ms [143] | 359 ms [371] | 369 ms [376] |
| Navigate → painted frame (static, 1×) | 22 ms [26] | 23 ms [24] | 56 ms [57] | 57 ms |
| Idle frames/s (static page) | 0.50 [1.00] | 0.50 | 0.00 | 0.00 |
| Processes after create | 10 | 10 | 5 | 5 |
| RSS after create (host+helpers) | 847 MB [850] | 846 MB [849] | 435 MB [437] | 433 MB [434] |
| PSS after create (host+helpers) | — | — | 306 MB [309] | 304 MB [306] |
| Close → host exit | 83 ms | 85 ms [137] | 122 ms [126] | 172 ms [177] |
| Close → no helper left | 89 ms [91] | 91 ms [143] | 123 ms [126] | 172 ms [177] |
| **1× (900×650 CSS px → 900×650 px)** | | | | |
| rAF fps | 60.2 | 60.2 | 57.8 [58.2] | 58.0 [58.4] |
| rAF frame interval median | 16.7 ms [16.8] | 16.7 ms | 17.3 ms [17.4] | 17.1 ms [17.4] |
| rAF frame interval p99 | 18.1 ms [18.5] | 18.1 ms [18.4] | 18.9 ms [19.2] | 18.7 ms [19.3] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 | 0.000 |
| rAF pipe throughput | 141 MB/s | 141 MB/s | 135 MB/s [136] | 136 MB/s [137] |
| rAF bytes/frame | 2340342 B | 2340369 B | 2340341 B | 2340368 B |
| rAF client read time/frame | 2.05 ms [3.84] | 2.08 ms [3.98] | 1.62 ms [3.27] | 1.59 ms [3.43] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.236 [0.237] | — | 0.213 |
| rAF CPU host+helpers | 24 % [26] | 25 % [28] | 61 % [63] | 64 % [67] |
| rAF RSS host+helpers | 866 MB [872] | 867 MB [876] | 442 MB [444] | 441 MB [442] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 57.6 [58.0] | 54.8 [55.4] |
| Scroll frame interval p99 | 18.1 ms [18.2] | 17.9 ms [18.0] | 19.2 ms [31.6] | 35.0 ms [35.3] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s | 135 MB/s [136] | 128 MB/s [130] |
| Scroll CPU host+helpers | 29 % [31] | 31 % [34] | 64 % [65] | 64 % [65] |
| Scroll host damage share (damage run) | — | 1.000 | — | 0.988 |
| Image page scroll fps | 60.0 | 60.2 | 57.6 [58.0] | 57.0 [57.6] |
| DOM page scroll fps | 60.2 | 60.2 | 57.6 [57.8] | 54.4 [55.0] |
| Key → changed frame (pooled) | 5.3 ms [6.8] | 5.4 ms [7.1] | 7.4 ms [21.6] | 7.4 ms [23.5] |
| Key → title event (median of reps) | 1.6 ms [1.7] | 1.6 ms [1.7] | 1.3 ms | 1.3 ms |
| Wheel → changed frame (pooled) | 11.2 ms [12.2] | 11.3 ms [12.6] | 7.5 ms [22.2] | 7.5 ms [23.5] |
| Image page navigate → painted | 158 ms | 158 ms [163] | 320 ms [325] | 319 ms [323] |
| DOM page navigate → painted | 343 ms [363] | 391 ms [401] | 415 ms [416] | 404 ms [408] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | | |
| rAF fps | 60.1 | 60.1 [60.2] | 58.0 | 58.0 [58.1] |
| rAF frame interval median | 16.7 ms | 16.7 ms | 17.2 ms [17.5] | 17.2 ms [17.3] |
| rAF frame interval p99 | 20.5 ms [21.0] | 20.3 ms [20.6] | 26.2 ms [27.0] | 26.1 ms [27.4] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.021 [0.035] | 0.021 [0.031] |
| rAF pipe throughput | 563 MB/s | 563 MB/s | 543 MB/s | 543 MB/s [544] |
| rAF bytes/frame | 9360347 B | 9360375 B | 9360346 B | 9360374 B |
| rAF client read time/frame | 9.13 ms [9.27] | 8.32 ms [9.21] | 12.31 ms [12.77] | 12.63 ms [13.17] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.236 [0.237] | — | 0.212 |
| rAF CPU host+helpers | 52 % [53] | 50 % [52] | 224 % [226] | 232 % |
| rAF RSS host+helpers | 1274 MB [1304] | 1270 MB [1284] | 600 MB [627] | 604 MB [634] |
| Scroll fps (wheel 60 Hz) | 60.0 [60.2] | 60.0 [60.2] | 57.4 [57.5] | 49.1 [50.6] |
| Scroll frame interval p99 | 24.0 ms [26.1] | 20.8 ms [26.2] | 30.8 ms [31.8] | 38.8 ms [41.6] |
| Scroll pipe throughput | 562 MB/s [563] | 562 MB/s [563] | 537 MB/s [538] | 460 MB/s [474] |
| Scroll CPU host+helpers | 83 % [85] | 83 % | 227 % [229] | 224 % [226] |
| Scroll host damage share (damage run) | — | 1.000 | — | 0.987 [0.999] |
| Image page scroll fps | 59.9 [60.0] | 60.0 [60.1] | 48.9 [51.1] | 44.8 [46.6] |
| DOM page scroll fps | 60.0 [60.1] | 60.1 | 57.4 [57.5] | 48.2 [50.3] |
| Key → changed frame (pooled) | 12.9 ms [14.5] | 13.7 ms [15.3] | 22.5 ms [26.2] | 23.1 ms [36.8] |
| Key → title event (median of reps) | 1.6 ms | 1.6 ms | 1.3 ms | 1.3 ms [1.4] |
| Wheel → changed frame (pooled) | 11.6 ms [17.9] | 12.6 ms [18.8] | 32.4 ms [42.0] | 29.8 ms [41.4] |
| Image page navigate → painted | 189 ms [236] | 192 ms [202] | 197 ms [199] | 198 ms [201] |
| DOM page navigate → painted | 411 ms [464] | 423 ms [457] | 466 ms [479] | 461 ms [466] |
| Resize → frame at new size | 86 ms [93] | 89 ms [100] | 258 ms [298] | 263 ms [309] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | | |
| rAF fps, 1 MiB pipe | 59.3 [59.6] | — | 58.0 [58.1] | — |
| rAF client read/frame, 1 MiB pipe | 6.18 ms [6.27] | — | 5.20 ms [5.90] | — |
| Scroll fps, 1 MiB pipe | 60.1 [60.2] | — | 57.7 [58.0] | — |
| Scroll CPU, 1 MiB pipe | 65 % [66] | — | 217 % [218] | — |

## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.25 [6.24] | 2.60 [7.36] |
| presenter_bgraToRGBA | 3.77 [6.16] | 15.08 [17.07] |
| candidate_u32_fast_path | 1.61 [3.05] | 6.46 [6.56] |
| putImageData_full | 0.07 [0.09] | 0.30 [0.39] |
| presenter_draw_full | 3.85 [4.36] | 15.62 [18.02] |
| candidate_damage10_fast_put | 0.28 [3.83] | 0.78 [1.52] |
| candidate_createImageBitmap | 3.96 [4.51] | 12.85 [16.98] |
| candidate_webgl_full | 3.29 [6.42] | 12.15 [15.91] |
| candidate_webgl_damage10 | 3.10 [5.21] | 11.52 [15.01] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.58 [1.54] | 1.90 [2.58] |
| presenter_bgraToRGBA | 2.12 [3.62] | 9.82 [16.48] |
| candidate_u32_fast_path | 1.22 [1.82] | 4.28 [4.84] |
| putImageData_full | 0.18 [0.20] | 0.46 [0.48] |
| presenter_draw_full | 2.46 [3.94] | 9.20 [11.98] |
| candidate_damage10_fast_put | 0.28 [0.44] | 1.22 [1.60] |
| candidate_createImageBitmap | 3.96 [7.36] | 11.34 [19.62] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.17 [1.26] | 0.14 [1.18] | 0.80 [1.26] | 0.81 [1.33] |
| presenter_bgraToRGBA | 2.10 [2.16] | 3.14 [3.17] | 12.01 [12.34] | 12.72 [12.89] |
| candidate_u32_opaque_fast_path | 1.47 [2.45] | 1.29 [1.32] | 3.88 [3.95] | 5.16 [5.27] |

## Integrated (Zen app) — engine None: BLOCKED_ENV

Reason: no successful linux-zen-build run with an unexpired axiosozo-zen-linux-x86_64 artifact yet
