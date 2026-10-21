# Engine bench summary — run 39663352957

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage+payload**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage+payload**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | chromium | chromium+damage | chromium+damage+payload | webkit | webkit+damage | webkit+damage+payload |
| --- | --- | --- | --- | --- | --- | --- |
| Spawn → ready | 202 ms [557] | 205 ms [207] | 198 ms [205] | 43 ms [46] | 39 ms [44] | 40 ms [47] |
| Create → first frame (1×) | 136 ms [447] | 130 ms [142] | 135 ms [142] | 476 ms [491] | 473 ms [486] | 480 ms [489] |
| Create → painted frame (1×) | 138 ms [448] | 131 ms [142] | 138 ms [143] | 476 ms [492] | 474 ms [487] | 480 ms [491] |
| Navigate → painted frame (static, 1×) | 21 ms [22] | 24 ms | 21 ms [24] | 57 ms [58] | 57 ms | 55 ms [56] |
| Idle frames/s (static page) | 0.50 | 0.50 | 0.50 | 0.00 | 0.00 | 0.00 |
| Processes after create | 10 | 10 | 10 | 5 | 5 | 5 |
| RSS after create (host+helpers) | 846 MB [847] | 844 MB [846] | 841 MB [847] | 404 MB [407] | 406 MB [409] | 407 MB [408] |
| PSS after create (host+helpers) | — | — | — | 268 MB | 270 MB [273] | 271 MB [274] |
| Close → host exit | 82 ms [83] | 83 ms [132] | 81 ms [88] | 131 ms [133] | 181 ms [182] | 172 ms [184] |
| Close → no helper left | 89 ms [91] | 90 ms [138] | 87 ms [95] | 131 ms [134] | 181 ms [183] | 172 ms [185] |
| **1× (900×650 CSS px → 900×650 px)** | | | | | | |
| rAF fps | 60.2 | 60.2 | 60.2 | 58.0 | 57.6 [58.0] | 58.0 [58.2] |
| rAF frame interval median | 16.7 ms [16.8] | 16.7 ms | 16.6 ms [16.8] | 17.3 ms | 17.5 ms | 17.3 ms |
| rAF frame interval p99 | 17.7 ms [17.9] | 17.7 ms [17.9] | 17.6 ms [17.9] | 18.3 ms [18.5] | 18.9 ms [19.3] | 18.4 ms [19.0] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| rAF pipe throughput | 141 MB/s | 141 MB/s | 33 MB/s | 136 MB/s | 135 MB/s [136] | 29 MB/s |
| rAF bytes/frame | 2340342 B | 2340369 B | 553408 B | 2340341 B | 2340368 B | 497918 B [498467] |
| rAF client read time/frame | 0.97 ms [1.21] | 1.00 ms [3.04] | 0.19 ms [0.20] | 0.90 ms [3.08] | 0.95 ms [3.03] | 0.15 ms [0.27] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | — | 0.423 | 0.423 | — |
| rAF host damage share (damage run) | — | 0.236 | 0.236 | — | 0.212 [0.213] | 0.213 |
| rAF CPU host+helpers | 21 % [22] | 22 % [24] | 20 % | 59 % [61] | 61 % [65] | 58 % [65] |
| rAF RSS host+helpers | 864 MB [873] | 868 MB [874] | 866 MB [872] | 412 MB [418] | 415 MB [418] | 416 MB [418] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 60.2 | 58.2 [58.4] | 54.4 [56.8] | 54.0 [54.2] |
| Scroll frame interval p99 | 17.6 ms [17.9] | 17.6 ms [17.8] | 17.7 ms [17.8] | 18.9 ms [32.6] | 34.7 ms [35.2] | 34.8 ms [35.0] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s | 141 MB/s | 136 MB/s [137] | 127 MB/s [133] | 124 MB/s [125] |
| Scroll CPU host+helpers | 26 % [27] | 26 % [32] | 27 % | 61 % | 62 % [69] | 63 % [66] |
| Scroll host damage share (damage run) | — | 1.000 | 1.000 | — | 0.992 [0.996] | 0.984 [0.988] |
| Image page scroll fps | 60.0 [60.2] | 60.2 | 60.2 | 57.8 [58.0] | 57.8 [58.0] | 57.4 [57.8] |
| DOM page scroll fps | 60.2 | 60.2 | 60.2 | 58.0 [58.2] | 54.2 [54.6] | 54.0 [54.6] |
| Key → changed frame (pooled) | 4.2 ms [6.4] | 4.3 ms [6.2] | 3.1 ms [3.8] | 7.4 ms [21.4] | 7.4 ms [23.5] | 7.3 ms [8.4] |
| Key → title event (median of reps) | 1.6 ms | 1.6 ms | 1.6 ms | 1.3 ms [1.4] | 1.3 ms [1.4] | 1.2 ms [1.3] |
| Wheel → changed frame (pooled) | 11.2 ms [13.1] | 11.3 ms [13.0] | 11.1 ms [12.3] | 7.5 ms [22.1] | 7.5 ms [23.6] | 7.2 ms [21.8] |
| Image page navigate → painted | 158 ms [160] | 161 ms [163] | 159 ms [162] | 371 ms [384] | 372 ms [384] | 369 ms [383] |
| DOM page navigate → painted | 344 ms [348] | 355 ms [416] | 344 ms [348] | 548 ms [558] | 545 ms [552] | 538 ms [553] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | | | | |
| rAF fps | 60.1 [60.2] | 60.1 [60.2] | 60.2 | 53.5 [54.2] | 50.4 [51.3] | 58.2 |
| rAF frame interval median | 16.7 ms | 16.7 ms | 16.7 ms | 17.6 ms [20.2] | 18.9 ms [19.0] | 17.2 ms [17.3] |
| rAF frame interval p99 | 17.7 ms [17.9] | 17.9 ms | 18.0 ms [18.1] | 29.6 ms [30.6] | 30.2 ms [31.7] | 19.3 ms [19.6] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 | 0.053 [0.080] | 0.043 [0.056] | 0.000 |
| rAF pipe throughput | 563 MB/s | 563 MB/s | 133 MB/s | 500 MB/s [508] | 472 MB/s [481] | 116 MB/s |
| rAF bytes/frame | 9360347 B | 9360375 B | 2213155 B [2216193] | 9360346 B | 9360374 B | 1987124 B [1989675] |
| rAF client read time/frame | 6.10 ms [6.14] | 6.06 ms [6.19] | 0.80 ms [0.84] | 15.96 ms [17.50] | 16.05 ms [16.25] | 0.76 ms [1.44] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 | — | 0.422 | 0.422 | — |
| rAF host damage share (damage run) | — | 0.236 [0.237] | 0.236 [0.237] | — | 0.209 [0.210] | 0.212 |
| rAF CPU host+helpers | 42 % [43] | 41 % [43] | 32 % [34] | 232 % [242] | 234 % | 228 % [231] |
| rAF RSS host+helpers | 1259 MB [1280] | 1266 MB [1298] | 1262 MB [1268] | 579 MB [584] | 582 MB [583] | 585 MB [587] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 60.2 | 53.0 [53.1] | 49.3 [49.5] | 51.0 [51.6] |
| Scroll frame interval p99 | 21.9 ms [28.2] | 21.7 ms [25.2] | 19.1 ms [23.0] | 33.3 ms [33.9] | 36.5 ms [40.1] | 37.4 ms [40.0] |
| Scroll pipe throughput | 563 MB/s | 563 MB/s | 563 MB/s | 496 MB/s [497] | 462 MB/s [463] | 471 MB/s [475] |
| Scroll CPU host+helpers | 72 % | 71 % [72] | 72 % [74] | 232 % [233] | 234 % [239] | 237 % [239] |
| Scroll host damage share (damage run) | — | 1.000 | 1.000 | — | 0.995 [0.999] | 0.984 [0.995] |
| Image page scroll fps | 60.0 [60.1] | 60.0 [60.1] | 60.0 | 40.3 [41.2] | 37.8 [38.5] | 42.0 [42.4] |
| DOM page scroll fps | 60.0 [60.1] | 60.0 [60.2] | 60.1 [60.2] | 53.3 [53.7] | 50.1 [50.5] | 51.6 [52.4] |
| Key → changed frame (pooled) | 8.9 ms [10.2] | 9.5 ms [10.7] | 3.9 ms [4.6] | 30.9 ms [42.5] | 37.5 ms [43.6] | 22.4 ms [23.8] |
| Key → title event (median of reps) | 1.6 ms | 1.5 ms [1.6] | 1.5 ms [1.6] | 1.3 ms [1.4] | 1.3 ms [1.4] | 1.4 ms |
| Wheel → changed frame (pooled) | 11.3 ms [13.2] | 11.4 ms [13.5] | 10.7 ms [11.6] | 38.4 ms [49.1] | 32.3 ms [49.0] | 25.7 ms [38.6] |
| Image page navigate → painted | 182 ms [185] | 181 ms [183] | 180 ms [181] | 239 ms [242] | 225 ms [232] | 218 ms [221] |
| DOM page navigate → painted | 375 ms [414] | 418 ms [458] | 396 ms [457] | 588 ms [599] | 596 ms [605] | 564 ms [576] |
| Resize → frame at new size | 88 ms [95] | 85 ms [91] | 82 ms [85] | 307 ms [313] | 320 ms [323] | 306 ms [311] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | | | | |
| rAF fps, 1 MiB pipe | 59.2 [60.0] | — | — | 52.5 [54.2] | — | — |
| rAF client read/frame, 1 MiB pipe | 6.15 ms [6.16] | — | — | 16.03 ms [18.02] | — | — |
| Scroll fps, 1 MiB pipe | 60.1 [60.2] | — | — | 52.9 [54.7] | — | — |
| Scroll CPU, 1 MiB pipe | 62 % [64] | — | — | 233 % [235] | — | — |

## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.07 [1.91] | 4.36 [7.04] |
| presenter_bgraToRGBA | 1.49 [1.92] | 5.18 [5.43] |
| candidate_u32_fast_path | 1.49 [3.00] | 6.04 [7.34] |
| putImageData_full | 0.09 [0.11] | 0.34 [0.40] |
| presenter_draw_full | 1.58 [1.79] | 5.83 [12.48] |
| surface_draw_full | 1.61 [1.87] | 6.71 [7.53] |
| surface_draw_damage10 | 0.18 [0.26] | 0.68 [0.83] |
| candidate_videoframe_full | 1.43 [1.68] | 6.92 [8.21] |
| candidate_videoframe_damage10 | 0.24 [0.35] | 0.79 [2.96] |
| surface_upload_draw_full | 1.28 [1.67] | 7.37 [11.15] |
| surface_upload_draw_damage10 | 0.26 [0.42] | 1.03 [14.32] |
| candidate_damage10_fast_put | 0.28 [0.42] | 1.06 [1.85] |
| candidate_createImageBitmap | 3.81 [5.17] | 15.11 [15.62] |
| candidate_webgl_full | 3.04 [5.14] | 16.12 [18.89] |
| candidate_webgl_damage10 | 3.94 [6.54] | 14.71 [17.36] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.08 [2.06] | 4.34 [6.52] |
| presenter_bgraToRGBA | 1.42 [2.00] | 5.26 [5.48] |
| candidate_u32_fast_path | 0.98 [1.82] | 3.82 [4.06] |
| putImageData_full | 0.14 [0.18] | 0.42 [0.44] |
| presenter_draw_full | 2.34 [2.80] | 5.78 [5.98] |
| surface_draw_full | 2.44 [3.38] | 5.86 [7.32] |
| surface_draw_damage10 | 0.16 [0.24] | 0.62 [0.76] |
| candidate_videoframe_full | 1.92 [2.44] | 5.50 [5.80] |
| candidate_videoframe_damage10 | 0.08 [0.10] | 0.12 [0.22] |
| surface_upload_draw_full | 1.54 [2.40] | 5.50 [5.80] |
| surface_upload_draw_damage10 | 0.06 [0.08] | 0.12 [0.28] |
| candidate_damage10_fast_put | 0.26 [0.56] | 0.90 [1.12] |
| candidate_createImageBitmap | 5.92 [7.50] | 19.66 [24.62] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.21 [1.07] | 0.22 [1.18] | 0.89 [1.34] | 1.06 [1.39] |
| presenter_bgraToRGBA | 1.38 [1.42] | 1.41 [1.44] | 3.67 [3.80] | 5.69 [6.25] |
| candidate_u32_opaque_fast_path | 1.28 [1.34] | 1.27 [1.30] | 3.67 [3.74] | 5.20 [5.27] |

## Integrated (Zen app) — chromium: BLOCKED_ENV

Reason: no unexpired axiosozo-zen-linux-x86_64 artifact

## Integrated (Zen app) — gecko: BLOCKED_ENV

Reason: no unexpired axiosozo-zen-linux-x86_64 artifact
