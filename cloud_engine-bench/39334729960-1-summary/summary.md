# Engine bench summary — run 39334729960

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | chromium | chromium+damage | webkit | webkit+damage |
| --- | --- | --- | --- | --- |
| Spawn → ready | 174 ms [392] | 236 ms [299] | 35 ms [43] | 35 ms [43] |
| Create → first frame (1×) | 122 ms [640] | 109 ms [240] | 366 ms [383] | 366 ms [379] |
| Create → painted frame (1×) | 122 ms [640] | 110 ms [241] | 366 ms [384] | 367 ms [380] |
| Navigate → painted frame (static, 1×) | 18 ms [23] | 20 ms [24] | 56 ms | 56 ms [57] |
| Idle frames/s (static page) | 0.50 | 0.50 | 0.00 | 0.00 |
| Processes after create | 10 | 10 | 5 | 5 |
| RSS after create (host+helpers) | 846 MB [851] | 847 MB [850] | 398 MB | 399 MB [400] |
| PSS after create (host+helpers) | — | — | 260 MB [262] | 263 MB [266] |
| Close → host exit | 79 ms [177] | 82 ms [133] | 129 ms [180] | 182 ms [183] |
| Close → no helper left | 83 ms [181] | 86 ms [137] | 129 ms [181] | 183 ms |
| **1× (900×650 CSS px → 900×650 px)** | | | | |
| rAF fps | 60.0 | 60.0 [60.1] | 58.1 [58.4] | 58.2 [58.4] |
| rAF frame interval median | 16.5 ms [16.6] | 16.5 ms [16.6] | 17.2 ms [17.5] | 17.1 ms |
| rAF frame interval p99 | 18.1 ms [18.7] | 18.1 ms [18.3] | 18.4 ms [20.8] | 18.9 ms [19.3] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 [0.004] | 0.000 [0.003] |
| rAF pipe throughput | 140 MB/s | 140 MB/s [141] | 136 MB/s [137] | 136 MB/s [137] |
| rAF bytes/frame | 2340342 B | 2340369 B | 2340341 B | 2340368 B |
| rAF client read time/frame | 1.41 ms [2.42] | 1.48 ms [3.45] | 1.47 ms [3.32] | 1.53 ms [3.22] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.236 | — | 0.213 |
| rAF CPU host+helpers | 16 % [17] | 17 % [19] | 52 % [60] | 64 % [65] |
| rAF RSS host+helpers | 868 MB [870] | 868 MB [870] | 408 MB [409] | 408 MB [411] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 58.0 [58.2] | 54.6 [55.2] |
| Scroll frame interval p99 | 18.0 ms [18.9] | 17.8 ms [17.9] | 24.0 ms [31.7] | 35.0 ms [35.3] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s | 136 MB/s | 128 MB/s [129] |
| Scroll CPU host+helpers | 20 % [22] | 22 % [23] | 56 % [61] | 65 % |
| Scroll host damage share (damage run) | — | 1.000 | — | 0.988 [0.992] |
| Image page scroll fps | 60.2 | 60.2 | 57.6 [57.8] | 57.4 [57.6] |
| DOM page scroll fps | 60.2 | 60.2 | 58.0 [58.2] | 55.2 [55.4] |
| Key → changed frame (pooled) | 4.0 ms [5.9] | 4.0 ms [6.3] | 7.3 ms [21.6] | 7.3 ms [23.4] |
| Key → title event (median of reps) | 1.2 ms [1.4] | 1.3 ms | 1.2 ms [1.3] | 1.3 ms |
| Wheel → changed frame (pooled) | 10.9 ms [12.9] | 11.1 ms [12.5] | 7.4 ms [21.8] | 7.4 ms [22.4] |
| Image page navigate → painted | 125 ms [127] | 122 ms [129] | 321 ms [322] | 320 ms [324] |
| DOM page navigate → painted | 279 ms [303] | 278 ms [284] | 423 ms [436] | 444 ms [470] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | | |
| rAF fps | 60.1 | 60.0 [60.1] | 51.9 [53.5] | 48.5 [50.5] |
| rAF frame interval median | 16.7 ms [16.8] | 16.7 ms | 17.9 ms [18.6] | 19.1 ms [20.1] |
| rAF frame interval p99 | 19.8 ms [20.4] | 19.8 ms [20.4] | 30.7 ms [33.2] | 32.7 ms [34.1] |
| rAF intervals > 25 ms | 0.000 [0.003] | 0.000 [0.003] | 0.124 [0.142] | 0.182 [0.208] |
| rAF pipe throughput | 563 MB/s | 562 MB/s [563] | 486 MB/s [500] | 454 MB/s [472] |
| rAF bytes/frame | 9360347 B | 9360375 B | 9360346 B | 9360374 B |
| rAF client read time/frame | 7.70 ms [7.84] | 7.73 ms [7.78] | 16.23 ms [16.59] | 16.75 ms [17.06] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.236 [0.237] | — | 0.209 [0.215] |
| rAF CPU host+helpers | 39 % [40] | 38 % [40] | 221 % [222] | 227 % [228] |
| rAF RSS host+helpers | 1258 MB [1270] | 1275 MB [1301] | 568 MB [574] | 583 MB [584] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.1 [60.2] | 55.4 [55.6] | 46.7 [48.8] |
| Scroll frame interval p99 | 21.2 ms [31.9] | 21.9 ms [23.0] | 31.2 ms [32.5] | 40.2 ms [46.9] |
| Scroll pipe throughput | 563 MB/s | 563 MB/s | 518 MB/s [521] | 437 MB/s [456] |
| Scroll CPU host+helpers | 66 % [68] | 67 % [69] | 221 % [223] | 223 % [226] |
| Scroll host damage share (damage run) | — | 1.000 | — | 0.991 [0.995] |
| Image page scroll fps | 60.0 | 60.0 [60.1] | 42.1 [43.0] | 37.4 [38.5] |
| DOM page scroll fps | 60.1 [60.2] | 60.0 [60.2] | 54.1 [55.7] | 45.7 [46.6] |
| Key → changed frame (pooled) | 9.8 ms [11.2] | 10.5 ms [11.6] | 30.1 ms [41.9] | 32.6 ms [44.0] |
| Key → title event (median of reps) | 1.3 ms | 1.3 ms [1.4] | 1.3 ms | 1.3 ms |
| Wheel → changed frame (pooled) | 11.9 ms [13.6] | 11.6 ms [14.5] | 36.8 ms [46.6] | 34.1 ms [46.5] |
| Image page navigate → painted | 146 ms [152] | 149 ms [161] | 206 ms [224] | 198 ms [224] |
| DOM page navigate → painted | 316 ms [379] | 333 ms [362] | 477 ms [505] | 481 ms [504] |
| Resize → frame at new size | 93 ms [96] | 90 ms [98] | 262 ms [264] | 280 ms [283] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | | |
| rAF fps, 1 MiB pipe | 60.0 [60.2] | — | 56.9 [57.0] | — |
| rAF client read/frame, 1 MiB pipe | 5.29 ms [5.37] | — | 13.60 ms [14.49] | — |
| Scroll fps, 1 MiB pipe | 60.0 [60.1] | — | 56.5 [57.0] | — |
| Scroll CPU, 1 MiB pipe | 50 % [52] | — | 224 % [226] | — |

## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.02 [4.99] | 1.93 [4.93] |
| presenter_bgraToRGBA | 3.54 [5.84] | 14.31 [28.55] |
| candidate_u32_fast_path | 1.49 [2.83] | 5.94 [6.12] |
| putImageData_full | 0.11 [0.14] | 0.27 [0.41] |
| presenter_draw_full | 3.65 [3.98] | 14.87 [17.09] |
| candidate_damage10_fast_put | 0.26 [3.69] | 0.80 [1.26] |
| candidate_createImageBitmap | 3.69 [4.04] | 12.24 [16.03] |
| candidate_webgl_full | 3.19 [6.61] | 13.13 [17.07] |
| candidate_webgl_damage10 | 2.88 [3.81] | 11.75 [14.16] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.56 [1.90] | 1.60 [3.00] |
| presenter_bgraToRGBA | 2.70 [4.38] | 7.88 [13.90] |
| candidate_u32_fast_path | 1.12 [1.78] | 3.92 [6.02] |
| putImageData_full | 0.16 [0.18] | 0.42 [0.44] |
| presenter_draw_full | 2.88 [4.34] | 8.06 [8.42] |
| candidate_damage10_fast_put | 0.34 [0.52] | 0.86 [1.26] |
| candidate_createImageBitmap | 3.78 [6.58] | 9.40 [12.08] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.25 [0.99] | 0.23 [1.10] | 1.07 [1.93] | 1.17 [2.09] |
| presenter_bgraToRGBA | 1.96 [2.09] | 3.05 [3.25] | 11.54 [12.63] | 12.26 [12.34] |
| candidate_u32_opaque_fast_path | 1.28 [1.35] | 1.27 [1.32] | 3.67 [3.82] | 5.21 [5.28] |

## Integrated (Zen app) — chromium: PASS

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of 9bf859e91799e9d9de88d0f68d3d2043e632627b (8 replaced, 5 added)
Machine: AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.navigate_to_title_wall_ms | 4.50 [6.70] |
| image.navigate_to_title_wall_ms | 258.80 [266.60] |
| dom.navigate_to_title_wall_ms | 259.70 [266.10] |
| raf.window.fps | 57.09 [57.85] |
| raf.window.interval_ms.median | 16.53 [16.63] |
| raf.window.interval_p99_ms | 33.78 [36.95] |
| raf.window.long_intervals_share | 0.05 [0.06] |
| raf.window.usage.cpu_percent | 156.40 [158.30] |
| scroll.window.fps | 6.50 [47.13] |
| scroll.window.interval_p99_ms | 11742.82 [11750.06] |
| scroll.window.long_intervals_share | 0.15 [0.19] |
| scroll.window.usage.cpu_percent | 24.50 [166.90] |
| scroll.window.input_wall_s | 17.03 |
| image_scroll.window.input_wall_s | 17.03 |
| image_scroll.window.fps | 4.09 [4.17] |
| image_scroll.window.interval_p99_ms | 11748.76 [11755.52] |
| image_scroll.window.usage.cpu_percent | 19.10 [29.80] |
| memory_all_processes.rss_mb | 2909.90 [2959.10] |
| memory_all_processes.processes | 23.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 33.53 [48.94] |
| tab_switch.back_to_bench_tab_ms.median | 26.68 [27.51] |
| switch.gecko_to_engine_switch_ms | 357.80 [2202.60] |
| switch.engine_to_gecko_switch_ms | 132.30 [16828.00] |
| static.timing.navigate_to_title_ms | 38.20 [48.50] |
| static.timing.navigate_to_visible_ms | 64.40 [75.60] |
| image.timing.navigate_to_title_ms | 16.50 [17.90] |
| image.timing.navigate_to_visible_ms | 136.80 [143.60] |
| dom.timing.navigate_to_title_ms | 15.70 [16.10] |
| dom.timing.navigate_to_visible_ms | 228.70 [266.60] |
| raf.window.fps_whole_window | 57.16 [57.77] |
| scroll.window.fps_whole_window | 5.27 [46.50] |
| image_scroll.window.fps_whole_window | 3.16 [3.22] |
| raf.window.presenter.meanDrawMilliseconds | 1.26 [1.28] |
| scroll.window.presenter.meanDrawMilliseconds | 1.96 [2.00] |
| raf.window.multi_frame_updates | 0.00 |
| scroll.window.multi_frame_updates | 0.00 |
| key.keydown_to_presented_frame_ms.median | 23.27 [23.55] |
| key.keydown_to_presented_frame_ms.p95 | 25.61 [28.29] |
| memory_after_switch_back.rss_mb | 1516.30 [1568.50] |
| memory_after_switch_back.processes | 13.00 |

## Integrated (Zen app) — gecko: PASS

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of 9bf859e91799e9d9de88d0f68d3d2043e632627b (8 replaced, 5 added)
Machine: AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.timing.firstContentfulPaint | 18.00 [63.00] |
| static.timing.loadEventEnd | 14.00 [62.00] |
| static.navigate_to_title_wall_ms | 31.00 [125.30] |
| image.timing.firstContentfulPaint | 94.00 [99.00] |
| image.timing.loadEventEnd | 91.00 [97.00] |
| image.navigate_to_title_wall_ms | 100.90 [110.30] |
| dom.timing.firstContentfulPaint | 128.00 [129.00] |
| dom.timing.loadEventEnd | 122.00 [126.00] |
| dom.navigate_to_title_wall_ms | 131.00 [137.90] |
| static.idle_raf.fps | 58.99 [59.37] |
| raf.window.fps | 59.00 [59.01] |
| raf.window.interval_ms.median | 17.10 |
| raf.window.interval_p99_ms | 17.14 [17.16] |
| raf.window.long_intervals_share | 0.00 |
| raf.window.usage.cpu_percent | 19.80 [24.10] |
| scroll.window.fps | 59.00 [59.02] |
| scroll.window.interval_p99_ms | 17.12 [17.18] |
| scroll.window.long_intervals_share | 0.00 |
| scroll.window.scrolled_css_px | 13261.00 [13371.00] |
| scroll.window.usage.cpu_percent | 37.40 [42.00] |
| scroll.window.input_wall_s | 1.95 |
| image_scroll.window.input_wall_s | 17.03 |
| image_scroll.window.fps | 59.00 |
| image_scroll.window.interval_p99_ms | 17.14 |
| image_scroll.window.usage.cpu_percent | 5.90 [6.20] |
| key.keydown_to_second_raf_ms.median | 8.50 [12.00] |
| key.keydown_to_second_raf_ms.p95 | 15.00 [17.00] |
| key.event_to_handler_ms.median | 1.00 |
| memory_all_processes.rss_mb | 1634.10 [1688.80] |
| memory_all_processes.pss_mb | 759.30 [785.60] |
| memory_all_processes.processes | 13.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 21.40 [22.02] |
| tab_switch.back_to_bench_tab_ms.median | 21.31 [21.82] |

## Integrated (Zen app) — gecko-debian: PASS

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of 9bf859e91799e9d9de88d0f68d3d2043e632627b (8 replaced, 5 added)
Machine: AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie)
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.timing.firstContentfulPaint | 20.00 [105.00] |
| static.timing.loadEventEnd | 20.00 [96.00] |
| static.navigate_to_title_wall_ms | 48.80 [355.00] |
| image.timing.firstContentfulPaint | 128.50 [134.00] |
| image.timing.loadEventEnd | 116.00 [129.00] |
| image.navigate_to_title_wall_ms | 130.20 [146.40] |
| dom.timing.firstContentfulPaint | 185.00 [195.00] |
| dom.timing.loadEventEnd | 175.00 [190.00] |
| dom.navigate_to_title_wall_ms | 187.00 [209.10] |
| static.idle_raf.fps | 58.99 [59.23] |
| raf.window.fps | 59.00 [59.02] |
| raf.window.interval_ms.median | 17.10 |
| raf.window.interval_p99_ms | 17.16 |
| raf.window.long_intervals_share | 0.00 |
| raf.window.usage.cpu_percent | 29.60 [34.30] |
| scroll.window.fps | 58.99 [59.01] |
| scroll.window.interval_p99_ms | 17.14 [17.20] |
| scroll.window.long_intervals_share | 0.00 |
| scroll.window.scrolled_css_px | 13224.00 [13358.00] |
| scroll.window.usage.cpu_percent | 53.00 [56.00] |
| scroll.window.input_wall_s | 1.96 |
| image_scroll.window.input_wall_s | 17.07 |
| image_scroll.window.fps | 59.00 |
| image_scroll.window.interval_p99_ms | 17.18 |
| image_scroll.window.usage.cpu_percent | 8.50 [9.40] |
| key.keydown_to_second_raf_ms.median | 9.00 |
| key.keydown_to_second_raf_ms.p95 | 17.00 |
| key.event_to_handler_ms.median | 1.00 |
| memory_all_processes.rss_mb | 1759.70 [1818.30] |
| memory_all_processes.pss_mb | 769.00 [799.50] |
| memory_all_processes.processes | 13.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 22.92 [41.54] |
| tab_switch.back_to_bench_tab_ms.median | 23.20 [40.50] |

## Integrated (Zen app) — webkit: PASS

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of 9bf859e91799e9d9de88d0f68d3d2043e632627b (8 replaced, 5 added)
Machine: AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie)
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.navigate_to_title_wall_ms | 6.10 [8.70] |
| image.navigate_to_title_wall_ms | 517.00 [524.80] |
| dom.navigate_to_title_wall_ms | 515.80 [766.40] |
| raf.window.fps | 35.81 [36.42] |
| raf.window.interval_ms.median | 27.01 [27.18] |
| raf.window.interval_p99_ms | 43.79 [45.38] |
| raf.window.long_intervals_share | 0.76 [0.81] |
| raf.window.usage.cpu_percent | 199.10 [200.20] |
| scroll.window.fps | 8.81 [29.64] |
| scroll.window.interval_p99_ms | 143.52 [157.79] |
| scroll.window.long_intervals_share | 0.78 [1.00] |
| scroll.window.usage.cpu_percent | 55.90 [194.40] |
| scroll.window.input_wall_s | 17.07 [17.09] |
| image_scroll.window.input_wall_s | 17.08 [17.09] |
| image_scroll.window.fps | 6.27 [6.41] |
| image_scroll.window.interval_p99_ms | 10892.97 [10905.18] |
| image_scroll.window.usage.cpu_percent | 54.50 [69.60] |
| memory_all_processes.rss_mb | 2383.20 [2436.60] |
| memory_all_processes.pss_mb | 1268.00 [1320.70] |
| memory_all_processes.processes | 18.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 21.26 [21.37] |
| tab_switch.back_to_bench_tab_ms.median | 23.92 [25.96] |
| switch.gecko_to_engine_switch_ms | 579.70 [711.70] |
| switch.engine_to_gecko_switch_ms | 211.70 [216.30] |
| static.timing.navigate_to_title_ms | 44.90 [64.60] |
| static.timing.navigate_to_visible_ms | 106.60 [147.50] |
| image.timing.navigate_to_title_ms | 327.00 [327.90] |
| image.timing.navigate_to_visible_ms | 454.30 [466.40] |
| dom.timing.navigate_to_title_ms | 488.20 [528.50] |
| dom.timing.navigate_to_visible_ms | 550.40 [585.40] |
| raf.window.fps_whole_window | 35.87 [36.55] |
| scroll.window.fps_whole_window | 7.81 [28.99] |
| image_scroll.window.fps_whole_window | 5.26 [5.37] |
| raf.window.presenter.meanDrawMilliseconds | 1.57 [1.63] |
| scroll.window.presenter.meanDrawMilliseconds | 2.04 [2.53] |
| raf.window.multi_frame_updates | 0.00 |
| scroll.window.multi_frame_updates | 0.00 |
| key.keydown_to_presented_frame_ms.median | 34.23 [35.93] |
| key.keydown_to_presented_frame_ms.p95 | 41.44 [44.05] |
| memory_after_switch_back.rss_mb | 1657.90 [1919.80] |
| memory_after_switch_back.processes | 13.00 |
