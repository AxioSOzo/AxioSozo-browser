# Engine bench summary — run 39645825889

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage+payload**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz × 4, 15982 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz × 4, 15982 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage+payload**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz × 4, 15982 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | chromium | chromium+damage | chromium+damage+payload | webkit | webkit+damage | webkit+damage+payload |
| --- | --- | --- | --- | --- | --- | --- |
| Spawn → ready | 214 ms [906] | 206 ms [226] | 213 ms [222] | 40 ms [43] | 37 ms [41] | 42 ms [43] |
| Create → first frame (1×) | 148 ms [5497] | 151 ms [165] | 147 ms [182] | 436 ms [439] | 443 ms [445] | 424 ms [451] |
| Create → painted frame (1×) | 151 ms [5498] | 152 ms [167] | 148 ms [194] | 436 ms [440] | 444 ms [446] | 425 ms [452] |
| Navigate → painted frame (static, 1×) | 22 ms [25] | 22 ms [23] | 21 ms [25] | 57 ms [58] | 57 ms [58] | 56 ms |
| Idle frames/s (static page) | 0.50 | 0.50 | 0.50 | 0.00 | 0.00 | 0.00 |
| Processes after create | 10 | 10 | 10 | 5 | 5 | 5 |
| RSS after create (host+helpers) | 848 MB [852] | 851 MB [852] | 850 MB [851] | 405 MB [406] | 406 MB [410] | 408 MB [409] |
| PSS after create (host+helpers) | — | — | — | 271 MB [272] | 270 MB [273] | 270 MB [276] |
| Close → host exit | 89 ms [132] | 89 ms [139] | 84 ms | 129 ms [130] | 179 ms [182] | 174 ms |
| Close → no helper left | 96 ms [139] | 96 ms [145] | 90 ms [91] | 129 ms [131] | 180 ms [182] | 174 ms [175] |
| **1× (900×650 CSS px → 900×650 px)** | | | | | | |
| rAF fps | 60.2 | 60.2 | 60.2 | 58.2 | 58.0 | 58.0 [58.4] |
| rAF frame interval median | 16.7 ms [16.8] | 16.7 ms [16.8] | 16.7 ms [16.8] | 17.1 ms [17.3] | 17.3 ms | 17.3 ms |
| rAF frame interval p99 | 17.8 ms [17.9] | 17.8 ms | 17.6 ms [17.8] | 18.6 ms [18.9] | 18.6 ms [19.5] | 18.5 ms [18.7] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 [0.004] | 0.000 |
| rAF pipe throughput | 141 MB/s | 141 MB/s | 33 MB/s | 136 MB/s | 136 MB/s | 29 MB/s |
| rAF bytes/frame | 2340342 B | 2340369 B | 553408 B | 2340341 B | 2340368 B | 497849 B [498962] |
| rAF client read time/frame | 1.09 ms [3.29] | 1.09 ms [3.34] | 0.19 ms | 1.27 ms [2.97] | 1.30 ms [3.00] | 0.18 ms [0.29] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | — | 0.423 | 0.423 | — |
| rAF host damage share (damage run) | — | 0.236 | 0.236 | — | 0.213 | 0.213 |
| rAF CPU host+helpers | 20 % [23] | 20 % [22] | 17 % [18] | 82 % [83] | 85 % [86] | 82 % [84] |
| rAF RSS host+helpers | 869 MB [871] | 871 MB [874] | 867 MB [874] | 414 MB [416] | 415 MB [420] | 417 MB [418] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 60.2 | 57.8 | 54.6 [55.2] | 55.0 [55.8] |
| Scroll frame interval p99 | 18.0 ms [18.2] | 17.7 ms [18.0] | 17.7 ms [17.8] | 19.5 ms [20.6] | 35.1 ms [35.5] | 35.0 ms [35.1] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s | 141 MB/s | 135 MB/s | 128 MB/s [129] | 126 MB/s [129] |
| Scroll CPU host+helpers | 25 % [26] | 25 % [26] | 26 % [27] | 83 % | 84 % | 86 % [87] |
| Scroll host damage share (damage run) | — | 1.000 | 1.000 | — | 0.988 [0.992] | 0.988 [0.995] |
| Image page scroll fps | 60.2 | 60.2 | 60.2 | 57.4 [57.6] | 57.4 [57.8] | 57.6 |
| DOM page scroll fps | 60.2 | 60.2 | 60.0 [60.2] | 57.8 [58.0] | 55.0 [55.8] | 54.4 [55.4] |
| Key → changed frame (pooled) | 4.5 ms [6.8] | 4.5 ms [6.7] | 3.1 ms [3.9] | 23.1 ms [24.3] | 23.1 ms [24.2] | 7.5 ms [23.4] |
| Key → title event (median of reps) | 1.6 ms [1.7] | 1.6 ms [1.7] | 1.6 ms | 1.4 ms [1.5] | 1.4 ms | 1.6 ms [1.7] |
| Wheel → changed frame (pooled) | 11.2 ms [13.0] | 10.8 ms [12.9] | 11.0 ms [12.2] | 23.2 ms [25.2] | 23.2 ms [25.2] | 22.9 ms [24.3] |
| Image page navigate → painted | 163 ms [165] | 160 ms [170] | 166 ms [167] | 432 ms [447] | 432 ms [433] | 437 ms [447] |
| DOM page navigate → painted | 400 ms [408] | 369 ms [392] | 377 ms [404] | 510 ms [528] | 513 ms [522] | 516 ms [536] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | | | | |
| rAF fps | 60.1 | 60.1 | 60.2 | 45.2 [46.1] | 43.2 [43.7] | 52.2 [52.8] |
| rAF frame interval median | 16.6 ms [16.7] | 16.6 ms [16.7] | 16.7 ms | 21.5 ms [21.9] | 22.7 ms [23.0] | 19.0 ms |
| rAF frame interval p99 | 18.6 ms [18.9] | 18.9 ms [19.1] | 17.9 ms [18.0] | 32.7 ms [35.8] | 30.8 ms [32.2] | 26.1 ms [26.5] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.003 | 0.151 [0.174] | 0.219 [0.227] | 0.030 [0.042] |
| rAF pipe throughput | 562 MB/s | 562 MB/s | 133 MB/s | 423 MB/s [432] | 405 MB/s [409] | 102 MB/s [103] |
| rAF bytes/frame | 9360347 B | 9360375 B | 2212442 B [2212531] | 9360346 B | 9360374 B | 1958289 B [1958655] |
| rAF client read time/frame | 13.46 ms [13.72] | 13.62 ms [13.90] | 0.93 ms [0.95] | 18.25 ms [18.37] | 18.71 ms [18.91] | 3.26 ms [3.89] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 | — | 0.422 | 0.422 | — |
| rAF host damage share (damage run) | — | 0.237 | 0.236 | — | 0.231 [0.233] | 0.209 |
| rAF CPU host+helpers | 44 % [45] | 44 % [45] | 35 % [36] | 254 % [256] | 243 % | 269 % [271] |
| rAF RSS host+helpers | 1245 MB [1254] | 1257 MB [1280] | 1234 MB [1277] | 604 MB [613] | 610 MB [615] | 616 MB [617] |
| Scroll fps (wheel 60 Hz) | 59.6 [60.0] | 59.7 [60.0] | 60.2 | 46.2 [47.0] | 44.0 [44.2] | 45.2 [46.7] |
| Scroll frame interval p99 | 25.3 ms [31.0] | 26.4 ms [28.7] | 23.7 ms [26.3] | 31.8 ms [33.9] | 39.5 ms [42.4] | 43.3 ms [46.8] |
| Scroll pipe throughput | 558 MB/s [561] | 558 MB/s [561] | 563 MB/s | 432 MB/s [439] | 412 MB/s [414] | 419 MB/s [426] |
| Scroll CPU host+helpers | 80 % [81] | 80 % [82] | 75 % [76] | 255 % [256] | 254 % [255] | 269 % [273] |
| Scroll host damage share (damage run) | — | 1.000 | 1.000 | — | 0.990 [0.995] | 0.990 [0.999] |
| Image page scroll fps | 59.4 | 59.2 [59.5] | 60.0 | 36.0 [36.1] | 32.7 [34.2] | 35.1 [35.7] |
| DOM page scroll fps | 60.0 [60.1] | 60.0 [60.1] | 60.0 [60.2] | 45.8 [46.1] | 42.1 [42.6] | 44.1 [45.2] |
| Key → changed frame (pooled) | 17.3 ms [19.0] | 17.5 ms [19.1] | 4.2 ms [5.0] | 35.9 ms [43.3] | 39.2 ms [44.6] | 22.0 ms [34.5] |
| Key → title event (median of reps) | 1.6 ms | 1.6 ms [1.7] | 1.5 ms [1.6] | 1.4 ms | 1.4 ms | 1.4 ms [1.5] |
| Wheel → changed frame (pooled) | 13.3 ms [22.8] | 12.5 ms [23.1] | 10.5 ms [11.8] | 42.4 ms [54.1] | 41.9 ms [52.0] | 36.6 ms [47.2] |
| Image page navigate → painted | 208 ms [215] | 182 ms [224] | 189 ms [193] | 317 ms [332] | 307 ms [314] | 312 ms [319] |
| DOM page navigate → painted | 443 ms [504] | 458 ms [491] | 415 ms [434] | 563 ms [567] | 564 ms [576] | 557 ms [560] |
| Resize → frame at new size | 96 ms [106] | 97 ms [101] | 89 ms [93] | 372 ms [378] | 383 ms [393] | 379 ms [388] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | | | | |
| rAF fps, 1 MiB pipe | 58.7 [58.9] | — | — | 46.2 [46.6] | — | — |
| rAF client read/frame, 1 MiB pipe | 13.79 ms [13.82] | — | — | 17.19 ms [18.14] | — | — |
| Scroll fps, 1 MiB pipe | 59.9 [60.0] | — | — | 45.4 [45.7] | — | — |
| Scroll CPU, 1 MiB pipe | 69 % [71] | — | — | 253 % [255] | — | — |

## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.07 [1.29] | 4.45 [7.04] |
| presenter_bgraToRGBA | 0.89 [1.53] | 3.66 [3.85] |
| candidate_u32_fast_path | 0.95 [1.14] | 3.52 [3.67] |
| putImageData_full | 0.18 [0.21] | 0.66 [0.70] |
| presenter_draw_full | 1.14 [1.20] | 4.95 [5.15] |
| surface_draw_full | 1.50 [1.60] | 6.46 [6.72] |
| surface_draw_damage10 | 0.18 [0.23] | 0.68 [0.94] |
| candidate_videoframe_full | 1.60 [1.86] | 5.52 [6.30] |
| candidate_videoframe_damage10 | 0.23 [0.31] | 0.81 [2.12] |
| surface_upload_draw_full | 1.57 [1.84] | 5.90 [6.75] |
| surface_upload_draw_damage10 | 0.26 [0.33] | 0.89 [2.23] |
| candidate_damage10_fast_put | 0.23 [0.31] | 0.94 [1.46] |
| candidate_createImageBitmap | 3.06 [3.56] | 13.23 [16.59] |
| candidate_webgl_full | 4.03 [4.71] | 15.38 [16.41] |
| candidate_webgl_damage10 | 3.67 [7.47] | 13.88 [18.02] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.34 [1.72] | 4.28 [5.74] |
| presenter_bgraToRGBA | 1.60 [2.46] | 6.30 [6.38] |
| candidate_u32_fast_path | 1.30 [2.22] | 5.06 [5.78] |
| putImageData_full | 0.18 [0.20] | 0.66 [0.70] |
| presenter_draw_full | 2.68 [3.08] | 7.64 [9.44] |
| surface_draw_full | 2.22 [3.54] | 7.64 [9.18] |
| surface_draw_damage10 | 0.24 [0.38] | 0.80 [1.70] |
| candidate_videoframe_full | 1.36 [1.88] | 5.22 [7.06] |
| candidate_videoframe_damage10 | 0.08 [0.12] | 0.24 [0.40] |
| surface_upload_draw_full | 1.76 [2.96] | 5.12 [5.54] |
| surface_upload_draw_damage10 | 0.12 [0.18] | 0.26 [0.48] |
| candidate_damage10_fast_put | 0.40 [0.58] | 1.10 [1.28] |
| candidate_createImageBitmap | 5.22 [9.38] | 19.00 [28.42] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.38 [1.06] | 0.33 [1.06] | 1.58 [4.06] | 1.59 [4.38] |
| presenter_bgraToRGBA | 1.56 [1.59] | 1.37 [1.40] | 3.78 [3.90] | 5.47 [5.55] |
| candidate_u32_opaque_fast_path | 1.47 [1.52] | 1.18 [1.22] | 3.47 [3.57] | 4.80 [4.86] |

## Integrated (Zen app) — chromium: BLOCKED_ENV

Reason: no unexpired axiosozo-zen-linux-x86_64 artifact

## Integrated (Zen app) — gecko: BLOCKED_ENV

Reason: no unexpired axiosozo-zen-linux-x86_64 artifact
