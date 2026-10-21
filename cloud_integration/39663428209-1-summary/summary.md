# Engine bench summary — run 39663428209

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage+payload**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage+payload**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | chromium | chromium+damage | chromium+damage+payload | webkit | webkit+damage | webkit+damage+payload |
| --- | --- | --- | --- | --- | --- | --- |
| Spawn → ready | 211 ms [323] | 205 ms [214] | 206 ms [220] | 40 ms [45] | 42 ms [45] | 42 ms [44] |
| Create → first frame (1×) | 141 ms [481] | 144 ms [169] | 146 ms [156] | 462 ms [479] | 460 ms [463] | 475 ms [491] |
| Create → painted frame (1×) | 149 ms [482] | 145 ms [170] | 147 ms [158] | 462 ms [479] | 461 ms [464] | 476 ms [492] |
| Navigate → painted frame (static, 1×) | 22 ms [23] | 23 ms [26] | 23 ms [24] | 56 ms [57] | 57 ms | 55 ms [56] |
| Idle frames/s (static page) | 0.50 | 0.50 | 0.50 | 0.00 | 0.00 | 0.00 |
| Processes after create | 10 | 10 | 10 | 5 | 5 | 5 |
| RSS after create (host+helpers) | 848 MB [851] | 849 MB [852] | 849 MB [850] | 402 MB [406] | 408 MB [409] | 404 MB [408] |
| PSS after create (host+helpers) | — | — | — | 267 MB [270] | 273 MB [274] | 267 MB [273] |
| Close → host exit | 88 ms [140] | 87 ms [139] | 84 ms [90] | 130 ms [184] | 181 ms [183] | 173 ms [175] |
| Close → no helper left | 95 ms [147] | 95 ms [146] | 90 ms [98] | 131 ms [185] | 182 ms [184] | 173 ms [175] |
| **1× (900×650 CSS px → 900×650 px)** | | | | | | |
| rAF fps | 60.2 | 60.2 | 60.2 | 58.1 [58.2] | 57.8 [58.0] | 58.0 |
| rAF frame interval median | 16.6 ms [16.7] | 16.7 ms [16.8] | 16.6 ms [16.7] | 17.2 ms | 17.4 ms [17.5] | 17.3 ms |
| rAF frame interval p99 | 17.8 ms [19.6] | 17.9 ms [18.5] | 17.8 ms [18.2] | 18.4 ms [18.8] | 18.5 ms [18.7] | 18.2 ms [18.8] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| rAF pipe throughput | 141 MB/s | 141 MB/s | 33 MB/s | 136 MB/s | 135 MB/s [136] | 29 MB/s |
| rAF bytes/frame | 2340342 B | 2340369 B | 553408 B [553430] | 2340341 B | 2340368 B | 497849 B |
| rAF client read time/frame | 1.09 ms [3.20] | 1.09 ms [3.35] | 0.20 ms [0.21] | 0.92 ms [2.99] | 0.94 ms [3.01] | 0.15 ms [0.23] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | — | 0.423 | 0.423 | — |
| rAF host damage share (damage run) | — | 0.236 [0.237] | 0.236 | — | 0.212 [0.213] | 0.213 |
| rAF CPU host+helpers | 22 % [24] | 22 % [25] | 22 % [24] | 59 % [60] | 62 % [64] | 57 % [59] |
| rAF RSS host+helpers | 870 MB [876] | 870 MB [875] | 873 MB [876] | 410 MB [414] | 416 MB [417] | 413 MB [417] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 60.2 | 58.0 [58.2] | 54.4 [55.2] | 54.8 [55.2] |
| Scroll frame interval p99 | 17.8 ms [18.7] | 17.7 ms [18.7] | 17.8 ms [18.2] | 19.7 ms [32.7] | 34.7 ms [34.8] | 34.7 ms [34.8] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s | 141 MB/s | 136 MB/s | 127 MB/s [129] | 127 MB/s [128] |
| Scroll CPU host+helpers | 26 % [28] | 27 % [30] | 28 % [30] | 61 % [63] | 62 % | 63 % [64] |
| Scroll host damage share (damage run) | — | 1.000 | 1.000 | — | 0.985 [0.995] | 0.992 [0.996] |
| Image page scroll fps | 60.2 | 60.2 | 60.2 | 58.0 [58.2] | 57.2 [57.8] | 57.6 [57.8] |
| DOM page scroll fps | 60.2 | 60.2 | 60.2 | 58.2 | 54.0 [55.0] | 53.8 [55.2] |
| Key → changed frame (pooled) | 4.4 ms [6.5] | 4.4 ms [6.7] | 3.1 ms [3.6] | 7.4 ms [21.3] | 7.5 ms [23.3] | 7.2 ms [8.3] |
| Key → title event (median of reps) | 1.6 ms [1.7] | 1.6 ms | 1.6 ms | 1.3 ms [1.4] | 1.3 ms [1.4] | 1.3 ms [1.4] |
| Wheel → changed frame (pooled) | 11.2 ms [12.9] | 11.3 ms [13.2] | 11.2 ms [12.1] | 7.4 ms [22.5] | 7.5 ms [23.6] | 7.3 ms [21.4] |
| Image page navigate → painted | 160 ms [165] | 164 ms [168] | 161 ms [163] | 369 ms [374] | 369 ms [370] | 370 ms [383] |
| DOM page navigate → painted | 381 ms [393] | 353 ms [400] | 383 ms [396] | 537 ms [548] | 547 ms [552] | 538 ms [552] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | | | | |
| rAF fps | 60.1 | 60.1 | 60.2 | 54.2 [55.4] | 52.3 [52.7] | 58.2 [58.4] |
| rAF frame interval median | 16.6 ms [16.7] | 16.7 ms | 16.7 ms | 17.3 ms [17.4] | 18.6 ms [19.3] | 17.1 ms |
| rAF frame interval p99 | 18.0 ms [19.8] | 18.5 ms [20.1] | 19.2 ms [19.7] | 28.5 ms [29.3] | 27.9 ms [30.9] | 19.7 ms [21.3] |
| rAF intervals > 25 ms | 0.000 | 0.000 [0.003] | 0.000 [0.003] | 0.033 [0.053] | 0.034 [0.043] | 0.000 [0.003] |
| rAF pipe throughput | 562 MB/s [563] | 562 MB/s | 133 MB/s | 507 MB/s [518] | 490 MB/s [493] | 116 MB/s |
| rAF bytes/frame | 9360347 B | 9360375 B | 2216193 B | 9360346 B | 9360374 B | 1989675 B [1992022] |
| rAF client read time/frame | 12.96 ms [13.18] | 13.34 ms [13.41] | 0.85 ms [0.95] | 15.89 ms [15.98] | 15.70 ms [15.89] | 1.38 ms [1.41] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 | — | 0.422 | 0.422 | — |
| rAF host damage share (damage run) | — | 0.237 | 0.237 | — | 0.209 [0.211] | 0.212 [0.213] |
| rAF CPU host+helpers | 42 % [43] | 43 % [45] | 33 % [35] | 230 % [231] | 232 % [235] | 227 % [228] |
| rAF RSS host+helpers | 1232 MB [1274] | 1246 MB [1264] | 1234 MB [1266] | 580 MB [583] | 583 MB [592] | 582 MB [585] |
| Scroll fps (wheel 60 Hz) | 59.6 [59.8] | 59.7 [59.8] | 60.2 | 54.5 [54.7] | 49.9 [50.1] | 52.1 [52.8] |
| Scroll frame interval p99 | 27.9 ms [29.1] | 26.5 ms [28.6] | 22.6 ms [25.4] | 26.9 ms [29.5] | 35.3 ms [38.6] | 37.6 ms [40.8] |
| Scroll pipe throughput | 558 MB/s [560] | 559 MB/s [560] | 563 MB/s | 510 MB/s [512] | 467 MB/s [469] | 478 MB/s [492] |
| Scroll CPU host+helpers | 78 % [80] | 81 % [82] | 74 % [77] | 234 % | 233 % [234] | 235 % [237] |
| Scroll host damage share (damage run) | — | 1.000 | 1.000 | — | 0.999 | 0.984 [0.995] |
| Image page scroll fps | 59.8 | 59.4 [59.6] | 60.0 [60.2] | 40.9 [42.0] | 38.7 [44.0] | 42.1 [43.2] |
| DOM page scroll fps | 59.9 [60.0] | 59.6 [60.1] | 60.2 | 53.8 [54.8] | 50.6 [51.0] | 51.8 [53.0] |
| Key → changed frame (pooled) | 15.5 ms [18.2] | 15.4 ms [18.7] | 4.2 ms [4.9] | 30.2 ms [42.3] | 36.0 ms [42.9] | 22.5 ms [24.2] |
| Key → title event (median of reps) | 1.5 ms [1.6] | 1.6 ms [1.7] | 1.6 ms | 1.4 ms | 1.3 ms [1.4] | 1.4 ms |
| Wheel → changed frame (pooled) | 11.5 ms [21.5] | 12.2 ms [22.1] | 10.5 ms [11.8] | 38.4 ms [48.5] | 33.2 ms [47.3] | 27.0 ms [37.3] |
| Image page navigate → painted | 206 ms [212] | 180 ms [213] | 186 ms [194] | 239 ms [241] | 222 ms [232] | 218 ms [222] |
| DOM page navigate → painted | 426 ms [508] | 444 ms [473] | 429 ms [468] | 586 ms [596] | 577 ms [606] | 576 ms [585] |
| Resize → frame at new size | 94 ms [106] | 103 ms | 93 ms [104] | 310 ms [314] | 314 ms [319] | 312 ms [313] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | | | | |
| rAF fps, 1 MiB pipe | 58.9 [59.1] | — | — | 54.1 [55.2] | — | — |
| rAF client read/frame, 1 MiB pipe | 13.22 ms [13.30] | — | — | 15.87 ms [15.92] | — | — |
| Scroll fps, 1 MiB pipe | 59.9 [60.0] | — | — | 54.3 [54.8] | — | — |
| Scroll CPU, 1 MiB pipe | 68 % [70] | — | — | 232 % [234] | — | — |

## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.21 [2.28] | 4.58 [4.86] |
| presenter_bgraToRGBA | 1.50 [1.94] | 5.22 [5.38] |
| candidate_u32_fast_path | 1.49 [3.00] | 5.96 [6.33] |
| putImageData_full | 0.10 [0.12] | 0.40 [0.44] |
| presenter_draw_full | 1.67 [1.93] | 6.03 [13.16] |
| surface_draw_full | 1.69 [1.91] | 6.93 [7.23] |
| surface_draw_damage10 | 0.19 [0.34] | 0.72 [0.85] |
| candidate_videoframe_full | 1.70 [1.99] | 5.79 [7.94] |
| candidate_videoframe_damage10 | 0.27 [0.47] | 0.97 [3.20] |
| surface_upload_draw_full | 1.64 [1.93] | 9.15 [13.89] |
| surface_upload_draw_damage10 | 0.28 [0.51] | 1.05 [12.33] |
| candidate_damage10_fast_put | 0.28 [0.49] | 0.85 [1.43] |
| candidate_createImageBitmap | 4.02 [5.79] | 16.59 [23.66] |
| candidate_webgl_full | 4.62 [7.76] | 13.74 [15.40] |
| candidate_webgl_damage10 | 5.46 [9.84] | 12.96 [16.18] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.30 [2.04] | 4.60 [8.32] |
| presenter_bgraToRGBA | 1.54 [2.44] | 5.28 [5.70] |
| candidate_u32_fast_path | 1.00 [1.86] | 3.96 [4.48] |
| putImageData_full | 0.12 [0.18] | 0.50 [0.54] |
| presenter_draw_full | 1.60 [2.72] | 6.22 [8.32] |
| surface_draw_full | 2.62 [2.98] | 6.18 [7.58] |
| surface_draw_damage10 | 0.18 [0.32] | 0.64 [0.84] |
| candidate_videoframe_full | 1.90 [2.36] | 6.16 [6.38] |
| candidate_videoframe_damage10 | 0.06 [0.14] | 0.20 [0.28] |
| surface_upload_draw_full | 1.78 [2.18] | 6.18 [6.42] |
| surface_upload_draw_damage10 | 0.10 [0.24] | 0.22 [0.28] |
| candidate_damage10_fast_put | 0.36 [0.48] | 1.00 [1.34] |
| candidate_createImageBitmap | 6.06 [8.18] | 21.64 [30.08] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.53 [1.30] | 0.24 [1.05] | 1.42 [4.64] | 1.15 [4.67] |
| presenter_bgraToRGBA | 1.39 [1.47] | 1.40 [1.43] | 3.67 [3.77] | 5.70 [5.80] |
| candidate_u32_opaque_fast_path | 1.29 [1.31] | 1.27 [1.33] | 3.67 [3.72] | 5.21 [5.67] |

## Integrated (Zen app) — chromium: BLOCKED_ENV

Reason: no unexpired axiosozo-zen-linux-x86_64 artifact

## Integrated (Zen app) — gecko: BLOCKED_ENV

Reason: no unexpired axiosozo-zen-linux-x86_64 artifact
